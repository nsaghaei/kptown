import {skipSleepingHours} from '../web/time.js';
import {processReturns} from '../web/metrics.js';
import fs from 'node:fs/promises';import core from '../web/simulation.js';
import {addInvestors,financeTurn,operatingBalances,finishOperations,assertFinance,totalCash,valuation,portfolio,liquidationQuote} from '../web/investors.js';
import {extendTown,lateVisits,discretionaryVisits,addEconomy,planBusinesses,chooseShops,spendPlans,afterOperations} from '../web/economy.js';
import {decideTown,decideNews} from '../web/decisions.js';import {validateAnswer} from '../web/client.js';
const hours=Number(process.argv[2]||72),scenario=process.argv[3]||'ordinary',seed=Number(process.argv[4]||1952),summaries=[],calls=[],snapshots=[];
const judge=async(requests,phase)=>{const response=await fetch('http://127.0.0.1:8765/api/decide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requests,phase})}),result=await response.json();if(!response.ok)throw new Error(JSON.stringify(result));for(const r of requests)for(const [k,q]of Object.entries(r.questions))validateAnswer(q,result.results?.[r.id]?.[k]);calls.push({phase,...result.usage});return result.results;};
const t=addEconomy(addInvestors(extendTown(core.createTown())));t.chaos='none';Math.random=core.random(seed);
await fs.mkdir(new URL('../validation-runs/',import.meta.url),{recursive:true});
while(t.hour<hours){
  const n=t.hour;
  if(scenario==='adverse')t.event=n>=12&&n<24?'flu':n>=30&&n<36?'shortage':'calm';
  const start=performance.now();await decideTown(t,core,judge);await planBusinesses(t,judge);
  const before=totalCash(t);await financeTurn(t,judge);if(Math.abs(totalCash(t)-before)>1e-7)throw new Error('Finance conservation');spendPlans(t);
  const opening=operatingBalances(t);processReturns(t);await chooseShops(t,core,judge);await discretionaryVisits(t,judge);await lateVisits(t,judge);core.applyConsequences(t);afterOperations(t,opening);finishOperations(t,opening);core.advanceWorld(t);await decideNews(t,core,judge);assertFinance(t);skipSleepingHours(t);
  const live=t.residents.filter(r=>r.alive),avg=k=>Math.round(live.reduce((n,r)=>n+r[k],0)/Math.max(1,live.length));
  for(const r of live)for(const k of ['health','energy','hunger','money'])if(!Number.isFinite(r[k])||r[k]<0)throw new Error(`Invalid resident ${k}`);
  const row={nightlife:t.places.filter(p=>p.lateOpen).map(p=>({id:p.id,name:p.name,open:core.isOpen(p,t.hour),attendees:live.filter(r=>r.target===p.id&&r.activity!=='work').length,lateVisits:t.businesses[p.id].economy.visits.filter(v=>v.late).length,receipts:(t.economy.receipts||[]).filter(x=>x.businessId===p.id).length})),hour:t.hour,event:t.event,population:live.length,health:avg('health'),fed:100-avg('hunger'),energy:avg('energy'),mood:avg('mood'),cash:avg('money'),meals:t.tally.meals,earned:t.tally.earned,activities:Object.fromEntries(Object.keys(core.actions).map(k=>[k,live.filter(r=>r.activity===k).length])),businesses:Object.fromEntries(Object.entries(t.businesses).map(([id,b])=>[id,{cash:Math.round(b.till),...valuation(t,id),product:b.economy.product,capacity:b.economy.capacity,failed:b.economy.failed,shortfalls:b.shortfalls,upgrades:b.economy.history.filter(x=>x.kind==='completed').length}])),investors:t.investors.map(i=>({id:i.id,cash:i.cash,...portfolio(t,i),liquidation:Object.entries(t.businesses).reduce((n,[id,b])=>n+((b.capital.holdings[i.id]||0)?liquidationQuote(t,i,id,b.capital.holdings[i.id]):0),0)})),auctions:t.finance.offers.length,funded:t.finance.offers.filter(o=>o.status==='funded').length,liquidations:t.finance.ledger.filter(x=>x.kind==='liquidation').length,millis:Math.round(performance.now()-start)};
  summaries.push(row);if(t.hour%6===0)snapshots.push(structuredClone(t));
  console.log(JSON.stringify({hour:row.hour,pop:row.population,health:row.health,fed:row.fed,cash:row.cash,failed:Object.values(row.businesses).filter(b=>b.failed).length,funded:row.funded,liquidations:row.liquidations,millis:row.millis}));
  await fs.writeFile(new URL(`../validation-runs/${scenario}-${seed}.json`,import.meta.url),JSON.stringify({scenario,seed,hours:n+1,model:'convaiinnovations/laya',summaries,calls,offers:t.finance.offers,ledger:t.finance.ledger}));
  await fs.writeFile(new URL(`../validation-runs/${scenario}-${seed}-state.json`,import.meta.url),JSON.stringify(t));
  if(live.length<30){console.log('STOP: severe town collapse needs correction');break;}
}
await fs.writeFile(new URL(`../validation-runs/${scenario}-${seed}-snapshots.json`,import.meta.url),JSON.stringify(snapshots));
console.log('Completed real Laya balance run.');
