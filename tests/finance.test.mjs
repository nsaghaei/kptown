import {test} from 'node:test';
import assert from 'node:assert/strict';
import core from '../web/simulation.js';
import {addInvestors,makeOffer,acceptOffer,totalCash,assertFinance,finishOperations,operatingBalances,financeTurn,ownership} from '../web/investors.js';
import {validateAnswer} from '../web/client.js';
const approve={type:'choice',choice:'invest',probabilities:{invest:.8,decline:.1,defer:.1},confidence:.8};
test('original town topology and roster are preserved; investor is an extra entity',()=>{
  const t=addInvestors(core.createTown());
  assert.equal(t.residents.length,120);assert.equal(t.places.length,58);assert.equal(Object.keys(t.businesses).length,17);
  assert.equal(t.traffic.length,7);assert.equal(t.investors.length,1);
  assert.equal(t.residents.reduce((n,r)=>n+r.money,0),6023);assert.equal(t.treasury,600);
});
test('equity issue conserves cash, issues exact shares, and rejects double settlement',()=>{
  const t=addInvestors(core.createTown()),id='clinic15',i=t.investors[0],o=makeOffer(t,id),before=totalCash(t);
  const founderBefore=t.businesses[id].capital.founderShares;
  acceptOffer(t,o,i,approve);
  assert.equal(totalCash(t),before);assert.equal(t.businesses[id].capital.holdings.i0,o.shares);
  assert.equal(t.businesses[id].capital.founderShares,founderBefore);assert.equal(t.finance.ledger.length,1);
  assert.throws(()=>acceptOffer(t,o,i,approve),/already/);assert.equal(totalCash(t),before);assertFinance(t);
});
test('cash reserve and invalid approval reject before any transfer',()=>{
  const t=addInvestors(core.createTown()),o=makeOffer(t,'clinic15'),i=t.investors[0];i.cash=i.reserve;
  const before=totalCash(t);assert.throws(()=>acceptOffer(t,o,i,approve),/cash/);
  assert.equal(totalCash(t),before);assert.equal(t.finance.ledger.length,0);
  i.cash=4000;assert.throws(()=>acceptOffer(t,o,i,{...approve,choice:'decline'}),/positive/);
});
test('dividends exclude capital inflows and preserve working capital',()=>{
  const t=addInvestors(core.createTown()),o=makeOffer(t,'clinic15'),i=t.investors[0];acceptOffer(t,o,i,approve);
  const balances=operatingBalances(t);t.hour=24;const cashAfterInvestment=i.cash;
  finishOperations(t,balances);assert.equal(i.cash,cashAfterInvestment,'fresh investment is not profit');
  const next=operatingBalances(t);t.businesses.clinic15.till+=1000;
  const before=totalCash(t);t.hour=48;finishOperations(t,next);
  assert.equal(totalCash(t),before);assert.ok(i.dividends>0);assert.ok(t.businesses.clinic15.till>0);assertFinance(t);
});
test('model can independently refuse to raise or refuse an investment',async()=>{
  const t=addInvestors(core.createTown()),before=totalCash(t);
  await financeTurn(t,async requests=>Object.fromEntries(requests.map(r=>[r.id,{decision:{type:'choice',choice:'hold',probabilities:{raise:.1,hold:.9},confidence:.9}}])));
  assert.equal(t.finance.offers.length,0);assert.equal(t.finance.ledger.length,0);assert.equal(totalCash(t),before);
  t.hour=6;
  await financeTurn(t,async (requests,phase)=>Object.fromEntries(requests.map(r=>[r.id,{decision:phase==='business funding'?{type:'choice',choice:'raise',probabilities:{raise:.8,hold:.2},confidence:.8}:{type:'choice',choice:'decline',probabilities:{invest:.1,decline:.8,defer:.1},confidence:.8}}])));
  assert.ok(t.finance.offers.length>0);assert.ok(t.finance.offers.every(o=>o.status==='declined'));
  assert.equal(t.finance.ledger.length,0);assert.equal(totalCash(t),before);
});
test('malformed model choices cannot enter the simulation',()=>{
  const q={type:'choice',criteria:{yes:'yes',no:'no'}};
  assert.throws(()=>validateAnswer(q,{type:'choice',choice:'invented',confidence:.9,probabilities:{yes:.5,no:.5}}));
  assert.throws(()=>validateAnswer(q,{type:'choice',choice:'yes',confidence:.9,probabilities:{yes:NaN,no:.5}}));
});
