// Integration: real local weights, no stubs. Records reproducible inputs and actual outcomes.
import fs from 'node:fs/promises';
import path from 'node:path';
import core from '../web/simulation.js';
import {addInvestors,financeTurn,operatingBalances,finishOperations,assertFinance,totalCash} from '../web/investors.js';
import {decideTown,decideNews} from '../web/decisions.js';
import {validateAnswer} from '../web/client.js';
const summaries=[],calls=[];
const judge=async(requests,phase)=>{
  const response=await fetch('http://127.0.0.1:8765/api/decide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requests,phase})});
  const result=await response.json();if(!response.ok)throw new Error(JSON.stringify(result));
  for(const request of requests)for(const [key,q]of Object.entries(request.questions))validateAnswer(q,result.results?.[request.id]?.[key]);
  calls.push({phase,...result.usage});return result.results;
};
const town=addInvestors(core.createTown());town.chaos='none';
// Seed environmental randomness for the verification run only, preserving the game's rules.
Math.random=core.random(1952);
for(let n=0;n<12;n++){
  const started=performance.now();
  await decideTown(town,core,judge);
  const preFinance=totalCash(town),funded=await financeTurn(town,judge);
  if(Math.abs(totalCash(town)-preFinance)>1e-8)throw new Error('Financing altered money supply');
  const opening=operatingBalances(town);core.applyConsequences(town);finishOperations(town,opening);core.advanceWorld(town);
  await decideNews(town,core,judge);assertFinance(town);
  const summary={hour:town.hour,population:town.residents.filter(r=>r.alive).length,decisions:town.decisions,
    investorCash:town.investors[0].cash,funded:funded.map(o=>({business:o.businessId,amount:o.amount})),
    millis:Math.round(performance.now()-started),activity:Object.fromEntries(Object.keys(core.actions).map(k=>[k,town.residents.filter(r=>r.alive&&r.activity===k).length]))};
  summaries.push(summary);console.log(JSON.stringify(summary));
}
const report={created:new Date().toISOString(),model:'convaiinnovations/laya',device:'cuda',summaries,calls,
  investors:town.investors,offers:town.finance.offers,ledger:town.finance.ledger};
await fs.writeFile(new URL('../verification.json',import.meta.url),JSON.stringify(report,null,2));
await fs.writeFile(new URL('../verification-state.json',import.meta.url),JSON.stringify(town,null,2));
if(!town.finance.ledger.some(t=>t.kind==='investment'))throw new Error('No real financing transaction occurred in the 12-hour run');
console.log('PASS: real local inference and autonomous business-to-investor funding verified.');
