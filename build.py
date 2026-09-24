"""Reproducible local adaptation of the inspected public Jevton client snapshot."""
from pathlib import Path
import re
import shutil
import hashlib
import json

ROOT=Path(__file__).resolve().parent
WORK=ROOT.parents[1]/'work'
WEB=ROOT/'web'
VENDOR=ROOT/'vendor'
VENDOR.mkdir(exist_ok=True)
WEB.mkdir(exist_ok=True)
for original,target in [('reference-app.js','jevton.original.js'),('reference-app.css','jevton.original.css'),('reference-index.html','jevton.original.html')]:
    dest=VENDOR/target
    if not dest.exists(): shutil.copyfile(WORK/original,dest)

import jsbeautifier
source=jsbeautifier.beautify((VENDOR/'jevton.original.js').read_text(encoding='utf-8-sig'))
def replace_once(old,new):
    global source
    if source.count(old)!=1: raise RuntimeError(f'Expected one patch location: {old[:70]}')
    source=source.replace(old,new,1)

CORE='''const core = {
  createTown:sT,actions:hD,effort:dP,spending:DP,priorities:$P,events:Id,
  roads:fD,trafficLevels:UP,priceChoices:OS,taxChoices:WS,time:jD,isOpen:j$,
  roadPlaces:wS,applyResidents:tT,applyTraffic:HR,applyEconomy:BR,
  newsCandidates:QP,newsQuestions:RR,applyNews:QR,applyConsequences:UR,advanceWorld:SR,
  random:mS
};'''
replace_once('B.till += L * (d === "goldrush" && H(S.work) === "factory" ? 3 : 1)', 'creditBusiness(B, productionRevenue(U,S,L * (d === "goldrush" && H(S.work) === "factory" ? 3 : 1)))')
replace_once('a.till += Y + f, a.sales', 'creditBusiness(a,Y + f,S.id,Y), a.sales')
source=source.replace('Z.till += a, Z.sales','creditBusiness(Z,a,S.id), Z.sales')
replace_once('U.treasury -= a, Z) creditBusiness(Z,a,S.id)', 'U.treasury -= a, Z) creditBusiness(Z,a,S.id,0)')
replace_once('} else j -= 4;\n            if (d === "flu")', '} else {j -= 4; recordLostSale(U,S);}\n            if (d === "flu")')
source=source.replace('function UR(U) {','hD.return={label:"Return",description:"return a defective purchase",place:"market"};\nhD.shop={label:"Shop",description:"visit a shop or leisure venue",place:"market"};\nfunction UR(U) {',1)
source=source.replace('Jevton','KP Town')
replace_once('k = 7,\n            A = 0,\n            j = -2,','k = 5,\n            A = 0,\n            j = -1,')
replace_once('k += 3, S.sick','k += TP(U.hour) ? -4 : 0, j += 2, S.sick')
replace_once('if (H.length > 30 && (P >= 8 || T < 30) && d() < 0.5)', 'if (H.length > 30 && U.hour % 6 === 0 && (P >= 8 || T < 30) && d() < 0.5)')
pure=source[:source.index('var sR =')]
(WEB/'simulation.js').write_text("import {productionRevenue,creditBusiness,recordLostSale} from './economy.js';\n"+pure+'\n'+CORE+'\nexport default core;\n',encoding='utf-8')

replace_once('e = sT(),','e = addEconomy(addInvestors(extendTown(sT()))),')
replace_once('nT = 0.042','nT = 0')
replace_once('function FD() {','function FD() {\n    if (localUi?.renderDetail(DD)) return;')
replace_once('nE.replaceChildren(...U ? rE(U) : sE())','nE.replaceChildren(...U ? rE(U) : sE());\n    localUi?.enhance(DD)')
replace_once('Yd.build(e);','Yd.build(e);\nfor (const investor of e.investors) Yd.addFigure({id:investor.id,job:"clerk",target:investor.location},e);')
start=source.index('async function tE(')
end=source.index('function VD(',start)
source=source[:start]+source[end:]
start=source.index('async function _T()')
end=source.index('var XD =',start)
source=source[:start]+(ROOT/'tick.js.txt').read_text(encoding='utf-8')+'\n'+source[end:]
source=re.sub(r'\bJev\b','Laya',source)
source=source.replace('"Cost so far"','"Cloud cost"')
source=source.replace('`${oT} residents. Every hour, Laya','`${e.residents.filter(r=>r.alive).length} residents. Every hour, Laya')
prefix='''// Adapted locally from Chizi’s Jevton; original provenance in REFERENCE.md and vendor/.
import {addInvestors,financeTurn,operatingBalances,finishOperations,assertFinance} from './investors.js';
import {decideTown,decideNews} from './decisions.js';
import {makeJudge} from './client.js';
import {installUI} from './local-ui.js';
import {extendTown,addEconomy,productionRevenue,creditBusiness,recordLostSale,planBusinesses,chooseShops,spendPlans,afterOperations,discretionaryVisits} from './economy.js';
import {processReturns} from './metrics.js';
var localUi;
'''
suffix='''
const judge=makeJudge(usage=>{
  qD.calls+=usage.calls; qD.inputTokens+=usage.inputTokens; qD.millis+=usage.millis;
  e.calls+=usage.calls;
});
localUi=installUI({getTown:()=>e,select:xH,inspector:nE,isBusy:()=>_0,runPlaza:()=>_T(true),refresh:()=>{p0();FD();},onJoin:i=>Yd.addFigure({id:i.id,job:'trader',target:i.location},e),focusPlaza:()=>Yd.select('i0'),focusBusiness:id=>{const p=e.places.find(p=>p.id===id);if(!p)return;Yd.following=false;Yd.selected=undefined;const target=new i(p.x+p.w/2,0,p.z+p.d/2);Yd.flyTo(target,target.clone().add(new i(13,17,19)),750);}});
FD();
'''
(WEB/'app.js').write_text(prefix+source+'\n'+CORE+suffix,encoding='utf-8')
html=(VENDOR/'jevton.original.html').read_text(encoding='utf-8-sig')
html=re.sub(r'<link[^>]+href="https://[^>]+>','',html)
html=re.sub(r'<script[^>]+src="https://[^>]+></script>','',html)
html=re.sub(r'<meta[^>]+(?:property|name)="(?:og|twitter):[^>]+>','',html)
html=html.replace('./index-gv4n9k1y.css','./original.css').replace('./index-5e95p6fp.js','./app.js')
html=html.replace('<title>Jevton</title>','<title>Jevton · Local Laya</title>').replace('>Jev City<','>Jevton<')
html=html.replace('<title>Jevton · Local Laya</title>','<title>KP Town · Local Laya</title>').replace('<div class="brand">Jevton</div>','<div class="brand">KP Town</div>')
html=html.replace('Jevton','KP Town').replace('Jev, a System One model','local Laya')
html=html.replace('</head>','<link rel="stylesheet" href="./fonts.css"><link rel="stylesheet" href="./local.css"></head>')
(WEB/'index.html').write_text(html,encoding='utf-8')
shutil.copyfile(VENDOR/'jevton.original.css',WEB/'original.css')
for audio in (WORK/'reference-audio').glob('*.mp3'): shutil.copyfile(audio,WEB/audio.name)
manifest={'source':'https://jevton.chizi.app/','script':'index-5e95p6fp.js','style':'index-gv4n9k1y.css',
          'original_sha256':hashlib.sha256((VENDOR/'jevton.original.js').read_bytes()).hexdigest(),
          'local_app_sha256':hashlib.sha256((WEB/'app.js').read_bytes()).hexdigest()}
(ROOT/'provenance.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('Built local Jevton: original town + local Laya + investor extension.')
