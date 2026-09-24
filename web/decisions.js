const choice=(instructions,criteria)=>({type:'choice',instructions,criteria});
const noul=instructions=>({type:'noul',instructions});
const score=(instructions,criteria)=>({type:'score',instructions,criteria});
function condition(value,low,high) {return value<low?'low':value>high?'high':'moderate';}
export function townContext(town,core) {
  const live=town.residents.filter(r=>r.alive),avg=key=>Math.round(live.reduce((n,r)=>n+r[key],0)/Math.max(1,live.length));
  return `${core.time(town.hour)}, ${town.season}. ${core.events[town.event].name}: ${core.events[town.event].description} Population ${live.length}. Average health ${avg('health')}, hunger ${avg('hunger')}, mood ${avg('mood')}, cash $${avg('money')}. Treasury $${Math.round(town.treasury)}, income tax ${Math.round(town.tax*100)}%. ${live.filter(r=>r.hunger>70).length} hungry, ${live.filter(r=>r.health<40).length} sick, ${live.filter(r=>r.money<10).length} nearly broke. ${town.tally.deaths} deaths.`;
}
export function residentRequests(town,core) {
  const live=town.residents.filter(r=>r.alive),struggling=live.filter(r=>r.health<35||r.hunger>80).sort((a,b)=>a.health-b.health).slice(0,4);
  const questions={
    do:choice('Given this resident’s needs, the time and conditions, what should this resident do this hour?',Object.fromEntries(Object.entries(core.actions).filter(([k])=>!['return','shop'].includes(k)).map(([k,v])=>[k,v.description]))),
    distress:noul('This resident is in real distress and needs help from others right now.'),
    effort:choice('If this resident works, how hard should they work given energy, health and money?',Object.fromEntries(Object.entries(core.effort).map(([k,v])=>[k,v.description]))),
    spend:choice('If this resident eats, how much should they spend given hunger, money and conditions?',Object.fromEntries(Object.entries(core.spending).map(([k,v])=>[k,v.description]))),
    risk:noul('This resident is likely to fall seriously ill within the next few hours.'),
    outlook:score('How does this resident feel about life in the city right now?',['despairing','worried','coping','content','thriving'])
  };
  const hours=town.hour%24;
  return live.map(r=>{
    const work=town.places.find(p=>p.id===r.work);
    const closedByEvent=(town.event==='blackout'&&['office','market','school'].includes(work.kind))||
      (town.event==='winter'&&work.kind==='farm')||(town.event==='aliens'&&work.kind!=='clinic')||
      (town.event==='robots'&&['office','factory','school'].includes(work.kind))||(town.event==='volcano'&&work.kind==='farm');
    const workOpen=core.isOpen(work.kind,town.hour)&&!closedByEvent&&!town.businesses[r.work]?.economy?.failed;
    const hunger=r.hunger>85?'starving and urgently needs food':r.hunger>60?'hungry':r.hunger<25?'full':'slightly hungry';
    const energy=r.energy<25?'exhausted':r.energy>70?'well rested':'tired';
    const health=r.health<40?'in poor health':r.health>75?'healthy':'in fair health';
    const helpwho=choice('If this resident checks on a neighbour, who needs them most?',{
      nobody:'nobody needs checking on',...Object.fromEntries(struggling.filter(n=>n.id!==r.id).map(n=>[n.id,`${n.name}, ${n.job}, health ${n.health}, hunger ${n.hunger}`]))
    });
    // Current location and previous action anchor this small model to repeating that action.
    // Keep them in the original simulation/inspector, but ask using present needs and availability.
    return {id:r.id,state:`${r.name}, age ${r.age}, is ${hunger}, ${energy}, and ${health}. Health ${r.health}/100, energy ${r.energy}/100, hunger ${r.hunger}/100 (higher is hungrier), mood ${r.mood}/100. Has $${r.money}; rent arrears $${r.arrears}.${r.sick?' Currently sick and needs treatment.':''}\n${core.time(town.hour)}, ${town.season}. ${core.events[town.event].description} Food shops ${core.isOpen('market',town.hour)&&town.event!=='blackout'?'open and selling meals':'closed'}. Workplace ${workOpen?'open':'closed; working earns nothing'}. ${hours<6||hours>=23?'It is nighttime, when most people sleep.':''} Rent is $12/day.${r.energy<30?' Immediate personal need: sleep. Exhaustion is damaging health.':r.health<35&&r.hunger<75?' Feels very ill and needs a doctor.':''}`,questions:{...questions,helpwho}};
  });
}
export function buildTownRequests(town,core) {
  const context=townContext(town,core),requests=residentRequests(town,core),live=town.residents.filter(r=>r.alive);
  requests.push({id:'council',state:context,questions:{
    emergency:noul('The town council should declare an emergency given the conditions and how residents are doing.'),
    priority:choice('What should the council prioritise this hour?',core.priorities),
    tax:choice('Given residents’ needs and the treasury balance, what should the council do with income tax?',core.taxChoices)
  }});
  for(let index=0;index<core.roads.length;index++) {
    const places=core.roadPlaces(town,index),onRoad=live.filter(r=>places.some(p=>p.id===r.target)),working=live.filter(r=>r.activity==='work'&&places.some(p=>p.id===r.work));
    requests.push({id:`road${index}`,state:`${context} Road: ${core.roads[index]}. Passes ${places.map(p=>p.name).join(', ')}. ${onRoad.length} residents heading to places on it; ${working.length} working there. ${live.filter(r=>r.activity!=='rest').length} people out and about in the whole town.`,questions:{traffic:score('How much car traffic is on this road this hour, given time, conditions and where people are going?',core.trafficLevels)}});
  }
  for(const place of town.places) {
    if(!['market','tavern','clinic'].includes(place.kind)) continue;
    const b=town.businesses[place.id];
    requests.push({id:place.id,state:`${context}\nBusiness: ${place.name}, ${place.kind}. Till $${Math.round(b.till)}, prices ${Math.round(b.price*100)}% of normal. ${b.hourSales} sales last hour, ${b.shortfalls} missed payrolls. Council priority ${town.council.priority}.`,questions:{price:choice('What should this business do with its prices?',core.priceChoices)}});
  }
  return requests;
}
export async function decideTown(town,core,judge) {
  const requests=buildTownRequests(town,core),results=await judge(requests,'town hour');
  const residentAnswers={};
  for(const r of town.residents.filter(r=>r.alive)) {
    r.lastAnswers=results[r.id];
    for(const [key,answer] of Object.entries(results[r.id])) residentAnswers[`${r.id}.${key}`]=answer;
  }
  residentAnswers['city.emergency']=results.council.emergency;
  residentAnswers['city.priority']=results.council.priority;
  core.applyResidents(town,town.residents.filter(r=>r.alive),residentAnswers);
  core.applyTraffic(town,Object.fromEntries(core.roads.map((_,i)=>[`road${i}`,results[`road${i}`].traffic])));
  core.applyEconomy(town,{'city.tax':results.council.tax,...Object.fromEntries(town.places.filter(p=>results[p.id]?.price).map(p=>[`price.${p.id}`,results[p.id].price]))});
}
export async function decideNews(town,core,judge) {
  const candidates=core.newsCandidates(town);
  const financeNews=town.finance.offers.filter(o=>o.fundedAt===town.hour-1).map(o=>`${town.places.find(p=>p.id===o.businessId).name} raises $${o.amount} from ${town.investors.find(i=>i.id===o.investorId).name}`);
  candidates.push(...financeNews);
  if(!candidates.length) return;
  // Preserve every story; rank bounded groups when a mass event exceeds the checkpoint head budget.
  const groups=[];
  for(let i=0;i<candidates.length;i+=5) groups.push(candidates.slice(i,i+5));
  const ask=async (stories,id)=>{
    const answer=(await judge([{id,state:townContext(town,core),questions:core.newsQuestions(stories)}],'Gazette headline'))[id].lead;
    return {answer,story:stories[Number(answer.choice.slice(1))]};
  };
  const winners=[];
  for(let i=0;i<groups.length;i++) winners.push(await ask(groups[i],`editor-${i}`));
  let winner=winners[0];
  if(winners.length>1) winner=await ask(winners.map(w=>w.story),'editor-final');
  const index=candidates.indexOf(winner.story),answer={...winner.answer,choice:`h${index}`,probabilities:{[`h${index}`]:winner.answer.confidence}};
  core.applyNews(town,candidates,{lead:answer});
  // applyNews counts one judgment; additional tournament judgments also count.
  town.decisions+=groups.length-1+(winners.length>1?1:0);
}
