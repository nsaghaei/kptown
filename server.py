"""Loopback-only static app + actual, offline Laya inference. No cloud fallback."""
from __future__ import annotations
import argparse
from collections import defaultdict
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import threading
import time

ROOT = Path(__file__).resolve().parent
WORK = ROOT.parents[1] / 'work'
os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['HF_HUB_DISABLE_TELEMETRY'] = '1'
os.environ['DO_NOT_TRACK'] = '1'
os.environ['TOKENIZERS_PARALLELISM'] = 'false'
os.environ.setdefault('HF_HOME', str(WORK / 'huggingface'))

class Engine:
    def __init__(self, model: Path, device: str):
        import torch
        import laya
        torch.set_num_threads(8)
        self.agent = laya.load(str(model.resolve()), device=device)
        self.device = str(self.agent.device)
        self.hardware = torch.cuda.get_device_name() if self.device.startswith('cuda') else 'CPU'
        self.version = laya.__version__
        self.model_name = 'laya-general' if model.name == 'laya' else self.agent.cfg.get('model_name', 'laya')
        self.max_len = self.agent.cfg.get('max_len', 512)
        self.head_max_len = self.agent.cfg.get('head_max_len', 192)
        self.lock = threading.Lock()
        self.calls = self.decisions = self.tokens = 0
        self.millis = 0.0
        self.audit = WORK / 'inference-audit.jsonl'
        self.audit.parent.mkdir(parents=True, exist_ok=True)

    def predict(self, requests, phase):
        if not isinstance(requests,list) or not 1<=len(requests)<=1024:
            raise ValueError('Expected 1–1024 decision requests')
        ids=set()
        groups=defaultdict(list)
        for request in requests:
            rid=request.get('id')
            if not isinstance(rid,str) or rid in ids: raise ValueError('Request IDs must be unique strings')
            ids.add(rid)
            state=request.get('state'); questions=request.get('questions')
            if not isinstance(state,str) or len(state)>8000: raise ValueError('Invalid or oversized state')
            if not isinstance(questions,dict) or not 1<=len(questions)<=12: raise ValueError('Invalid questions')
            # Reject oversize input instead of silently truncating an entity or its question.
            state_tokens=len(self.agent.tok.encode(state,add_special_tokens=False))
            if state_tokens>self.max_len-150: raise ValueError(f'{rid}: state exceeds the local checkpoint budget')
            for key,q in questions.items():
                if q.get('type') not in ('choice','score','noul'): raise ValueError('Unsupported decision type')
                self.agent._check_question(key,q)
                normalized=self.agent._to_internal(q)
                # Use the exact installed encoder to check every row and every option.
                encoded=self.agent._encode_state(state,[key],{key:normalized})
                if any(len(item['ids'])>=self.max_len for item in encoded):
                    raise ValueError(f'{rid}.{key}: context reached the checkpoint limit')
            signature=json.dumps(questions,sort_keys=True,ensure_ascii=False)
            groups[signature].append(request)
        if sum(len(r['questions']) for r in requests)>7200: raise ValueError('Too many decisions')
        results={}; input_tokens=0
        start=time.perf_counter()
        with self.lock:
            for group in groups.values():
                batch=self.agent.predict_batch([r['state'] for r in group],group[0]['questions'],batch_size=8)
                for request,result in zip(group,batch,strict=True):
                    results[request['id']]=result['answers']
                    input_tokens+=result['usage']['input_tokens']
            millis=(time.perf_counter()-start)*1000
            count=sum(len(r['questions']) for r in requests)
            self.calls+=1; self.decisions+=count; self.tokens+=input_tokens; self.millis+=millis
            usage={'calls':1,'inputTokens':input_tokens,'outputTokens':0,'millis':millis,
                   'decisions':count,'device':self.device,'hardware':self.hardware,
                   'model':self.model_name,'version':self.version,'local':True}
            with self.audit.open('a',encoding='utf-8') as file:
                file.write(json.dumps({'time':time.time(),'phase':phase,'usage':usage,
                                       'requests':requests,'results':results},ensure_ascii=False)+'\n')
        return {'results':results,'usage':usage}

class Handler(SimpleHTTPRequestHandler):
    engine: Engine
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT/'web'),**kwargs)
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; connect-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'")
        super().end_headers()
    def local_request(self):
        host=self.headers.get('Host','')
        allowed={f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}'}
        if host not in allowed: return False
        origin=self.headers.get('Origin')
        return origin is None or origin in {f'http://{value}' for value in allowed}
    def respond(self,status,payload):
        raw=json.dumps(payload,ensure_ascii=False).encode()
        self.send_response(status); self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Content-Length',str(len(raw))); self.end_headers(); self.wfile.write(raw)
    def do_GET(self):
        if not self.local_request(): return self.respond(403,{'error':'Local access only'})
        if self.path=='/api/health':
            return self.respond(200,{'ready':True,'local':True,'device':self.engine.device,
              'hardware':self.engine.hardware,'model':self.engine.model_name,'version':self.engine.version,
              'calls':self.engine.calls,'decisions':self.engine.decisions})
        if self.path.startswith('/api/'): return self.respond(404,{'error':'Unknown endpoint'})
        return super().do_GET()
    def do_POST(self):
        if not self.local_request(): return self.respond(403,{'error':'Local access only'})
        if self.path!='/api/decide': return self.respond(404,{'error':'Unknown endpoint'})
        if self.headers.get('Content-Type','').split(';')[0]!='application/json':
            return self.respond(415,{'error':'JSON required'})
        try:
            size=int(self.headers.get('Content-Length','0'))
            if not 0<size<=4_000_000: return self.respond(413,{'error':'Request too large'})
            body=json.loads(self.rfile.read(size))
            self.respond(200,self.engine.predict(body.get('requests'),body.get('phase','unspecified')))
        except (ValueError,KeyError,TypeError) as error:
            self.respond(400,{'error':str(error)})
        except Exception as error:
            print(f'Inference failed: {type(error).__name__}: {error}',flush=True)
            self.respond(500,{'error':'Local Laya inference failed; see the local server log. The hour was not committed.'})

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--model',type=Path,default=WORK/'models/laya')
    parser.add_argument('--device',choices=['cuda','cpu'],default='cuda')
    parser.add_argument('--port',type=int,default=8765)
    args=parser.parse_args()
    if not 1024<=args.port<=65535: parser.error('port must be 1024–65535')
    print('Loading local Laya checkpoint...',flush=True)
    Handler.engine=Engine(args.model,args.device)
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    print(f'Jevton ready at http://127.0.0.1:{args.port} — {Handler.engine.hardware}',flush=True)
    server.serve_forever()

if __name__=='__main__': main()
