import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import core from '../web/simulation.js';
import {extendTown,addEconomy} from '../web/economy.js';
import {addInvestors,joinPlayer,makeOffer,financeTurn,decidePitches,waitingForPlayer,pendingPitches,totalCash,assertFinance,settleLot,liquidate,liquidationQuote,portfolio,saleOutcome,signedMoney} from '../web/investors.js';
const town=()=>addEconomy(addInvestors(extendTown(core.createTown())));
const judge=async requests=>Object.fromEntries(requests.map(r=>[r.id,{decision:{choice:r.questions.decision.criteria.raise?'hold':'bid',probabilities:r.questions.decision.criteria.raise?{raise:0,hold:1}:{bid:1,pass:0}}}]));
const tick=fs.readFileSync(new URL('../tick.js.txt',import.meta.url),'utf8');
function setup(auto=false){
  const t=town();joinPlayer(t);for(const b of Object.values(t.businesses))b.capital.lastAttempt=t.hour;
  const lots=['market9','market10','city34'].map(id=>makeOffer(t,id));t.finance.offers.push(...lots);
  const timers=[],noop=()=>{},ui={renderDetail:noop,pitchWaiting:noop,marketUpdate:noop,playerWin:noop,humanTurn:async()=> 'pass'};
  const bindings={skipSleepingHours:()=>false,decidePitches,waitingForPlayer,financeTurn,judge,assertFinance,core:{},localUi:ui,planBusinesses:noop,spendPlans:noop,decideTown:noop,operatingBalances:()=>({}),processReturns:noop,chooseShops:noop,discretionaryVisits:noop,lateVisits:noop,UR:()=>t.hour++,afterOperations:noop,finishOperations:noop,SR:()=>({}),decideNews:noop,Yd:{setTraffic:noop,moveAll:noop,setEvent:noop},qd:{hour:noop,setEvent:noop},nH:{},N0:{},GT:{},z0:{setAttribute:noop},u0:noop,VD:noop,$I:noop,p0:noop,FD:noop,HI:noop,eE:1400,vE:2500,setTimeout:fn=>timers.push(fn)};
  const run=new Function('town','auto',...Object.keys(bindings),`let e=town,_0=false,ZS=false,L$=auto;${tick};return {run:_T,pause(){L$=false;},busy:()=>_0};`)(t,auto,...Object.values(bindings));
  return {t,lots,timers,ui,...run};
}
test('individual Pass or Take consumes no hour and cannot resume Auto with other pitches pending',async()=>{
  for(const action of ['pass','take']){const s=setup(true),cash=totalCash(s.t);await s.run({lotId:s.lots[1].id,action});assert.equal(s.t.hour,0);assert.equal(pendingPitches(s.t).length,2);assert.equal(s.timers.length,0);assert.equal(s.lots[0].status,'queued');assert.equal(totalCash(s.t),cash);await s.run();assert.equal(s.t.hour,0);}
});
test('Pass all snapshots unanswered choices, settles rivals once, consumes no hour and respects manual pause',async()=>{
  const s=setup(),cash=totalCash(s.t),ids=pendingPitches(s.t).map(o=>o.id);
  await s.run({lotIds:ids,action:'pass'});assert.equal(s.t.hour,0);assert.equal(pendingPitches(s.t).length,0);assert.equal(s.timers.length,0);
  assert.ok(s.lots.every(o=>o.playerDeclined&&!o.participants.includes('i5')));assert.ok(s.lots.some(o=>o.status==='funded'));assert.equal(totalCash(s.t),cash);
  const ledger=structuredClone(s.t.finance.ledger);await s.run({lotIds:ids,action:'pass'});assert.deepEqual(s.t.finance.ledger,ledger);assert.equal(s.t.hour,0);assertFinance(s.t);
});
test('Pass all leaves a later arriving pitch unanswered and Auto blocked',async()=>{
  const s=setup(true),ids=pendingPitches(s.t).map(o=>o.id),late=makeOffer(s.t,'city35');s.t.finance.offers.push(late);
  await s.run({lotIds:ids,action:'pass'});assert.equal(late.status,'queued');assert.equal(late.playerPitchDecision,undefined);assert.equal(s.t.hour,0);assert.equal(s.timers.length,0);assert.ok(waitingForPlayer(s.t));
});
test('active taken auction cannot be batch-passed; Auto remains gated until explicit human turn and all pitches resolve',async()=>{
  const s=setup(true);let resolve;const asked=new Promise(r=>{s.ui.humanTurn=()=>new Promise(done=>{resolve=done;r();});});
  const running=s.run({lotId:s.lots[1].id,action:'take'});await asked;
  await s.run({lotIds:pendingPitches(s.t).map(o=>o.id),action:'pass'});assert.equal(s.t.hour,0);assert.ok(s.busy());assert.equal(s.lots[1].turns.filter(x=>x.investorId==='i5').length,0);assert.equal(pendingPitches(s.t).length,2);
  resolve('pass');await running;assert.equal(s.timers.length,0);await s.run({lotIds:pendingPitches(s.t).map(o=>o.id),action:'pass'});assert.equal(s.t.hour,0);assert.equal(s.timers.length,1);s.pause();await s.timers[0]();assert.equal(s.t.hour,0);
});
test('a separate selected Auto callback advances only after the last pitch resolves; spectator remains autonomous',async()=>{
  const s=setup(true);await s.run({lotIds:pendingPitches(s.t).map(o=>o.id),action:'pass'});assert.equal(s.t.hour,0);s.timers.shift()();await new Promise(setImmediate);assert.equal(s.t.hour,1);
  const spectator=setup();spectator.t.finance.playerActive=false;await spectator.run();assert.equal(spectator.t.hour,1);
});
test('realized gains use sold-share basis for AI and human; remaining basis survives reinvestment and dilution',()=>{
  for(const investorId of ['i1','i5']){const t=town();joinPlayer(t);const i=t.investors.find(i=>i.id===investorId),lot=makeOffer(t,'market10');lot.status='open';lot.highBidder=i.id;lot.highBid=lot.reserve;settleLot(t,lot);
    const initial=i.basis.market10,n=Math.floor(lot.shares/2),expectedBasis=initial*n/lot.shares,paid=liquidate(t,i,'market10',n);let f=portfolio(t,i);assert.equal(f.realized,paid-expectedBasis);assert.equal(f.cost,initial-expectedBasis);assert.ok(Math.abs(f.unrealized-(f.value-f.cost))<1e-8);
    const issue=makeOffer(t,'market10');issue.status='open';issue.highBidder='i5';issue.highBid=issue.reserve;settleLot(t,issue);f=portfolio(t,i);assert.equal(f.realized,paid-expectedBasis);assert.equal(f.cost,initial-expectedBasis+(investorId==='i5'?issue.amount:0));
    delete i.realized;assert.equal(portfolio(t,i).realized,paid-expectedBasis);delete t.finance.ledger.find(x=>x.kind==='liquidation').removedBasis;assert.equal(portfolio(t,i).realized,null);assert.equal(signedMoney(null),'—');
  }
});
test('partial and full sale feedback distinguishes profit/loss/break-even, no sale on an invalid repeat',()=>{
  for(const outcome of ['profit','loss','even'])for(const partial of [true,false]){const t=town(),i=joinPlayer(t),lot=makeOffer(t,'market10');lot.status='open';lot.highBidder=i.id;lot.highBid=lot.reserve;settleLot(t,lot);const n=partial?Math.floor(lot.shares/2):lot.shares,quote=liquidationQuote(t,i,'market10',n),delta=outcome==='profit'?12:outcome==='loss'?-12:0;i.basis.market10=(quote-delta)*lot.shares/n;
    liquidate(t,i,'market10',n);const sale=t.finance.ledger.at(-1);assert.equal(saleOutcome(sale.amount-sale.removedBasis),outcome);const count=t.finance.ledger.length;assert.throws(()=>liquidate(t,i,'market10',lot.shares));assert.equal(t.finance.ledger.length,count);
  }assert.equal(saleOutcome(.49),'even');assert.equal(saleOutcome(-.49),'even');
});
test('sale tones honor mute: descending loss, neutral even, register profit',()=>{
  const app=fs.readFileSync(new URL('../web/app.js',import.meta.url),'utf8'),method=app.slice(app.indexOf('    saleFeedback('),app.indexOf('    blip() {')),freq=[],stops=[],sound=new Function(`return ({${method}})`)();let register=0;sound.cashRegister=()=>register++;sound.master={};sound.ctx={state:'running',currentTime:0,createOscillator:()=>{const o={frequency:{},connect:()=>({connect(){}}),start:()=>freq.push(o.frequency.value),stop:t=>stops.push(t)};return o;},createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};
  sound.muted=true;for(const kind of ['profit','loss','even'])sound.saleFeedback(kind);assert.equal(freq.length+register,0);sound.muted=false;sound.saleFeedback('loss');assert.deepEqual(freq,[520,390,260]);sound.saleFeedback('even');assert.equal(freq.at(-1),660);sound.saleFeedback('profit');assert.equal(register,1);assert.ok(stops.every(t=>t<.5));
});
