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
replace_once('var Ud = 40,','var Ud = 48,')
for road in ['[0, 7.5, 40, 1]','[0, 15.5, 40, 1]','[0, 23.5, 40, 1]','[0, 31.5, 40, 1]','[10, 0, 1, 40]','[22.5, 0, 1, 40]']:
    replace_once(road,road.replace('40','48'))
replace_once('[32, 0, 1, 40]','[32, 0, 1, 48], [40, 0, 1, 48], [0, 43.5, 48, 1]')
replace_once('"West Avenue", "Central Avenue", "East Avenue"','"West Avenue", "Central Avenue", "East Avenue", "Garden Avenue", "Garden Street"')
source=source.replace('J E V T O N','K P   T O W N')
# Continue original road axes through the outer border, using the same road/traffic geometry.
for road in ['[0, 7.5, 48, 1]','[0, 15.5, 48, 1]','[0, 23.5, 48, 1]','[0, 31.5, 48, 1]','[0, 43.5, 48, 1]']:
    replace_once(road,road.replace('[0,','[-4,').replace('48, 1]','56, 1]'))
for road in ['[10, 0, 1, 48]','[22.5, 0, 1, 48]','[32, 0, 1, 48]','[40, 0, 1, 48]']:
    replace_once(road,road.replace(', 0,',', -4,').replace('1, 48]','1, 56]'))
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
replace_once('if (DD = U, Yd.select(U), U)', 'if (localUi?.select(U), DD = U, Yd.select(U), U)')
replace_once('DD = U, Yd.select(U), FD()', 'localUi?.select(U); DD = U, Yd.select(U), FD()')
replace_once('function FD() {','function FD() {\n    if (localUi?.renderDetail(DD)) return;')
replace_once('nE.replaceChildren(...U ? rE(U) : sE())','nE.replaceChildren(...U ? rE(U) : sE());\n    localUi?.enhance(DD)')
replace_once('Yd.build(e);','Yd.build(e);\nfor (const investor of e.investors) Yd.addFigure({id:investor.id,job:"clerk",target:investor.location},e);')
replace_once('Yd.setTraffic(e.traffic.map((U) => U.level));','Yd.setTraffic(e.traffic.map((U) => U.level || 1));')
replace_once('this.onPick(Q)', '''let hit=this.raycaster.intersectObjects([...this.placeMeshes.values()],true)[0]?.object;
            while(hit&&!hit.userData.place)hit=hit.parent;
            this.onPick(Q || (hit?.userData.place ? `business:${hit.userData.place}` : undefined))''')
replace_once('if (U.kind === "park" || U.kind === "farm") d.add(SS(U));','if(U.id === "neighborhood-lake") d.add(SS({...U,name:"Riverside"})); else if (U.kind === "park" || U.kind === "farm") d.add(SS(U));')
a=source.index('    gravePosition(U) {'); b=source.index('    buildCemetery()',a)
source=source[:a]+"""    gravePosition(U) { const blocks=[[-2.5,14],[11.4,12],[23.8,9],[33.4,7],[41.4,12]];let col=U%54;for(const [x,count]of blocks){if(col<count)return [x+col*.78,48.6+Math.floor(U/54)*.58];col-=count;}return [1,49]; }
"""+source[b:]
replace_once('[30.1, 38.1, 3, 10.2],\n                [15, 42.4, 27.4, 3]','[3.1,50,12,3], [16.3,50,10.5,3], [27.3,50,7.5,3], [36,50,6,3], [46.1,50,10,3]')
replace_once('this.scene.add(this.label("Cemetery", 30.1, 1.9, 38), this.label("Cemetery", 15, 1.9, 42.4))','this.scene.add(this.label("Cemetery", 23.1, 1.9, 50))')
# Keep environmental ambience/effects; music buffers and looping sources are never created.
replace_once('...Object.entries(sR), ...Object.entries(XJ)', '...Object.entries(sR).filter(([name])=>!xR.includes(name)), ...Object.entries(XJ)')
replace_once('for (let D of Object.keys(sR)) {','for (let D of Object.keys(sR).filter(name=>!xR.includes(name))) {')
replace_once('    blip() {',"""    ding() {
        if(this.muted)return;
        if(!this.ctx)this.start();
        const c=this.ctx;if(!c||!this.master)return;
        if(c.state==='suspended')c.resume();
        const at=c.currentTime;
        for(const [frequency,volume]of [[1108,.065],[1662,.018]]){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+.65);o.connect(g).connect(this.master);o.start(at);o.stop(at+.67);}
    }
    cashRegister() {
        if(this.muted)return;if(!this.ctx)this.start();const c=this.ctx;if(!c||!this.master)return;
        if(c.state==='suspended')c.resume();const at=c.currentTime;
        for(const [offset,frequency,volume]of [[0,440,.035],[.055,660,.035],[.12,1318,.065],[.12,1977,.02]]){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(.0001,at+offset);g.gain.exponentialRampToValueAtTime(volume,at+offset+.008);g.gain.exponentialRampToValueAtTime(.0001,at+offset+.48);o.connect(g).connect(this.master);o.start(at+offset);o.stop(at+offset+.5);}
    }
    blip() {""")
replace_once('\n            ["Cost so far", `$${(qD.inputTokens*nT/1e6).toFixed(4)}`],','')
replace_once('    moveAll(U, d) {',"""    moveAll(U, d) {
        this.travelQueue ||= [];
        if(this.hasJourney && performance.now()<this.hourStart+this.hourLength){this.travelQueue.push({town:structuredClone(U),duration:d});return;}
        this.hasJourney=true;d*=2;""")
replace_once('        this.weather(d);',"""        if(D>=1 && this.travelQueue?.length){const next=this.travelQueue.shift();this.hasJourney=false;this.moveAll(next.town,next.duration);}
        this.weather(d);""")
source=source.replace('Math.sin(H * 10 + E.phase)','Math.sin(H * 5 + E.phase)').replace('Math.sin(H * 5 + E.phase) * 0.04','Math.sin(H * 2.5 + E.phase) * 0.04')
replace_once('WT.addEventListener("click", () => {', """WT.textContent=String.fromCodePoint(0x1F50A);WT.setAttribute('aria-label','Mute sound effects');WT.title='Mute sound effects';WT.setAttribute('aria-pressed','false');
WT.addEventListener("click", () => {""")
replace_once('WT.setAttribute("aria-pressed", String(!qd.muted)), WT.textContent = qd.muted ? "Sound off" : "Sound on"',"""WT.setAttribute("aria-pressed", String(qd.muted)), WT.textContent=String.fromCodePoint(qd.muted?0x1F507:0x1F50A), WT.title=qd.muted?'Unmute sound effects':'Mute sound effects', WT.setAttribute('aria-label',WT.title)""")
replace_once('P.fillStyle = "rgba(10, 10, 10, 0.82)", P.beginPath(), P.roundRect(0, 0, T, 44, 10), P.fill(), P.fillStyle = "#ededed"', 'P.clearRect(0,0,T,44), P.fillStyle = "#ffffff"')
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
localUi=installUI({onQueueUpdate:t=>{const lots=t.finance.offers.filter(o=>['queued','open'].includes(o.status)),plaza=t.places.find(p=>p.id==='park13');for(const [n,id]of Object.keys(t.businesses).entries()){const key=`q${n}`,index=lots.findIndex(o=>o.businessId===id);let figure=Yd.figures.get(key);if(index>=0&&!figure){Yd.addFigure({id:key,job:'trader',target:plaza.id},t);figure=Yd.figures.get(key);figure.group.userData.id=`business:${id}`;}if(figure){figure.group.visible=index>=0;if(index>=0){figure.from.set(plaza.x+.7+(index%6)*.8,0,plaza.z+.8+Math.floor(index/6)*.55);figure.to.copy(figure.from);figure.group.position.copy(figure.from);}}}},getTown:()=>e,select:xH,inspector:nE,onWin:()=>qd.cashRegister(),isBusy:()=>_0,runPlaza:(lotId,action)=>_T({lotId,action}),refresh:()=>{p0();FD();},onJoin:i=>{qd.ding();Yd.addFigure({id:i.id,job:'trader',target:i.location},e);},focusPlaza:()=>{const p=e.places.find(p=>p.id==='park13'),v=new i(p.x+p.w/2,0,p.z+p.d/2);Yd.following=false;Yd.flyTo(v,v.clone().add(new i(13,17,19)),750);},focusBusiness:id=>{const p=e.places.find(p=>p.id===id);if(!p)return;Yd.following=false;Yd.selected=undefined;const target=new i(p.x+p.w/2,0,p.z+p.d/2);Yd.flyTo(target,target.clone().add(new i(13,17,19)),750);}});
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
html=html.replace('A town of 120 where local Laya,','A town where local Laya')
html=html.replace('</head>','<link rel="stylesheet" href="./fonts.css"><link rel="stylesheet" href="./local.css"></head>')
(WEB/'index.html').write_text(html,encoding='utf-8')
shutil.copyfile(VENDOR/'jevton.original.css',WEB/'original.css')
for audio in (WORK/'reference-audio').glob('*.mp3'): shutil.copyfile(audio,WEB/audio.name)
manifest={'source':'https://jevton.chizi.app/','script':'index-5e95p6fp.js','style':'index-gv4n9k1y.css',
          'original_sha256':hashlib.sha256((VENDOR/'jevton.original.js').read_bytes()).hexdigest(),
          'local_app_sha256':hashlib.sha256((WEB/'app.js').read_bytes()).hexdigest()}
(ROOT/'provenance.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('Built local Jevton: original town + local Laya + investor extension.')
