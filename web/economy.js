// Explicit new economy. Revenue, capacity and owner execution are observable, never price noise.
import {captureReceipts} from './metrics.js';
import {expandTown} from './town-extension.js';
import {sampleModel} from './model-sampling.js';
export const products=['value','wellness','experience'];
export const productNames={value:'Practical essentials',wellness:'Fresh & healthy',experience:'Premium experiences'};
export function creditBusiness(b,amount,buyer,paid=amount){b.till+=amount;b.revenue=(b.revenue||0)+amount;if(b.economy&&buyer){const e=b.economy;e.buyers||={};e.repeatCustomers=(e.repeatCustomers||0)+(e.buyers[buyer]?1:0);e.buyers[buyer]=(e.buyers[buyer]||0)+1;e.pendingReceipts.push({buyer,amount,paid});}}
export function recordLostSale(t,r){const e=t.businesses[r.target]?.economy;if(e){const cause=r.spend==='skip'?'skipped':t.event==='blackout'?'closed':'unaffordable';e.lost||={};e.lost[cause]=(e.lost[cause]||0)+1;e.failures.push({hour:t.hour+1,customerId:r.id,reason:cause});}}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const choice=(instructions,criteria)=>({type:'choice',instructions,criteria});
const sum=(rows,key)=>rows.reduce((n,r)=>n+r[key],0);
export function extendTown(t){
  const newPlaces=[{id:'retail20',name:'Thread & Needle',category:'clothing',kind:'market',x:2,z:21,w:4,d:2,color:'#bd8b9d'},{id:'retail21',name:'Page Turners',category:'books',kind:'market',x:7,z:21,w:3,d:2,color:'#b69b76'},{id:'leisure22',name:'Playhouse',category:'leisure',kind:'tavern',x:29,z:20,w:2,d:3,color:'#987cad'}];
  for(const p of newPlaces){p.floors=1;t.places.push(p);t.businesses[p.id]={till:400,price:1,sales:0,hourSales:0,shortfalls:0};}
  const traders=t.residents.filter(r=>r.job==='trader'),musicians=t.residents.filter(r=>r.job==='musician');
  for(let n=0;n<4;n++)traders[n].work=newPlaces[Math.floor(n/2)].id;
  for(let n=0;n<2;n++)musicians[n].work='leisure22';
  return expandTown(t);
}
export function addEconomy(t){
  t.economy={supplierCash:0,spending:[],demand:{value:40,wellness:40,experience:40},trend:'value',lastTrend:-1};
  for(const [n,[id,b]]of Object.entries(t.businesses).entries()){
    const p=t.places.find(p=>p.id===id),adaptability=[90,22,65,38,82,15,71,47,96,28,78,53,19,88,43,69,34][n%17];
    b.economy={owner:{name:`${p.name} owner`,adaptability,discipline:25+(n*37)%71},product:products[n%3],capacity:['market','clinic','tavern'].includes(p.kind)?30:20,appeal:1,costRate:.15,plan:null,history:[],lastReview:-6,failed:false,strain:0,weakHours:0,level:1,requested:0,served:0,missed:0,contracts:0};
  }
  for(const r of t.residents){r.preference=products[Number(r.id.slice(1))%3];r.categoryTaste=['clothing','books','leisure'][(Number(r.id.slice(1))*7)%3];r.lastCategory={clothing:-48,books:-24,leisure:-12};r.purchaseCount=0;}
  for(const [n,b] of Object.values(t.businesses).entries())Object.assign(b.economy,{quality:48+(n*17)%49,reliability:.7+((n*13)%29)/100,reputation:1,pendingReceipts:[],visits:[],failures:[]});
  return t;
}
export function updateDemand(t){
  // A two-day taste cycle blended with real financial/health needs and persistent preferences.
  const trend=products[Math.floor(t.hour/24)%3];t.economy.trend=trend;
  const demand={value:0,wellness:0,experience:0};
  for(const r of t.residents.filter(r=>r.alive)){
    r.preference||=products[Number(r.id.slice(1))%3];
    r.currentPreference=r.money<25?'value':r.health<50||t.event==='flu'?'wellness':(Number(r.id.slice(1))+Math.floor(t.hour/24))%3===0?trend:r.preference;
    demand[r.currentPreference]++;
  }t.economy.demand=demand;
}
const planQuestions={strategy:choice('What should this owner do next, given demand, finances and execution ability?',{
  hold:'Keep the present product and conserve cash.',adapt:'Change the product to the best supported emerging consumer demand.',expand:'Increase capacity to serve unmet demand.',improve:'Improve appeal and lower unit costs through a process upgrade.'}),product:choice('Which consumer segment should this business serve next?',{value:'Affordable practical essentials for cost-conscious consumers.',wellness:'Fresh or healthy products and wellbeing services.',experience:'Premium convenience, entertainment and enjoyable experiences.'})};
export async function planBusinesses(t,judge){
  updateDemand(t);
  const eligible=Object.entries(t.businesses).filter(([,b])=>!b.economy.failed&&!b.economy.plan&&t.hour-b.economy.lastReview>=12);
  if(!eligible.length)return;
  const requests=eligible.map(([id,b])=>{const e=b.economy,h=b.capital.history.slice(-24),v=sum(h,'revenue'),p=sum(h,'profit');
    const perceived=Object.entries(t.economy.demand).map(([tag,n])=>[tag,n+(tag===e.product?(100-e.owner.adaptability)*.5:0)]).sort((a,b)=>b[1]-a[1]);
    e.observedDemand=perceived[0][0];
    return {id,state:`${t.places.find(p=>p.id===id).name} owner: ${e.owner.adaptability>70?'agile and observant':e.owner.adaptability<35?'habit-bound and slow to change':'cautious'}. Current product ${e.product}. Observed strongest demand is ${e.observedDemand}. ${e.product===e.observedDemand?'Product matches observed demand.':'Product misses the main demand.'} ${e.quality<65?'Poor product quality is causing bad customer experiences.':'Product quality is good.'} ${e.missed>3?'Capacity is full; customers are being turned away.':'There is spare capacity.'} Revenue $${Math.round(v)}, profit $${Math.round(p)}, cash $${Math.round(b.till)}. Changes cost $300–$500.`,questions:{strategy:planQuestions.strategy}};});
  const results=await judge(requests,'owner strategy');t.decisions+=requests.length;
  for(const [id,a]of Object.entries(results))a.strategy=sampleModel(a.strategy,`owner:${id}:${t.hour}`);
  const productRequests=eligible.filter(([id])=>results[id].strategy.choice==='adapt').map(([id,b])=>({id,state:`Consumers' strongest observed demand is ${productNames[b.economy.observedDemand]}. The owner wants to launch a product serving that demand.`,questions:{product:planQuestions.product}}));
  const productResults=productRequests.length?await judge(productRequests,'owner product'):{};t.decisions+=productRequests.length;
  for(const [id,b]of eligible){const e=b.economy,a=results[id];e.lastReview=t.hour;e.lastDecision={...a,...productResults[id]};const product=productResults[id]?.product.choice||e.product;e.history.push({hour:t.hour,kind:'decision',strategy:a.strategy.choice,product});
    const type=a.strategy.choice;if(type==='hold'||(type==='adapt'&&product===e.product))continue;
    const base={adapt:300,expand:500,improve:400}[type],cost=Math.round(base*(1+(100-e.owner.discipline)/200));
    e.plan={type,product,cost,label:`${type==='adapt'?'Launch':type==='expand'?'Expand':'Improve'} ${productNames[product]}`,stage:'needs funding',created:t.hour};
  }
  spendPlans(t);
}
export function spendPlans(t){
  for(const [id,b]of Object.entries(t.businesses)){
    const e=b.economy,p=e.plan;if(!p||e.failed)continue;
    if(p.stage==='needs funding'&&b.till>=p.cost+Math.min(120,b.till*.15)){
      b.till-=p.cost;b.capital.restricted=Math.max(0,b.capital.restricted-p.cost);t.economy.supplierCash+=p.cost;
      p.stage='implementing';p.started=t.hour;p.ready=t.hour+1+Math.ceil((100-e.owner.adaptability)/22);
      t.economy.spending.push({hour:t.hour,businessId:id,amount:p.cost,type:p.type,product:p.product});
    }
    if(p.stage==='implementing'&&t.hour>=p.ready){
      const quality=.5+e.owner.adaptability/100;
      if(p.type==='adapt'){e.product=p.product;e.appeal=clamp(e.appeal+.15*quality,.5,2.5);}
      if(p.type==='expand'){e.capacity+=Math.round(10*quality);e.level++;}
      if(p.type==='improve'){e.appeal=clamp(e.appeal+.25*quality,.5,2.5);e.costRate=Math.max(.05,e.costRate-.025*quality);e.quality=Math.min(99,e.quality+Math.round(10*quality));e.reliability=Math.min(.995,e.reliability+.04*quality);}
      e.history.push({hour:t.hour,kind:'completed',type:p.type,product:e.product,cost:p.cost,capacity:e.capacity,appeal:e.appeal});e.plan=null;
    }
  }
}
export async function chooseShops(t,core,judge){
  updateDemand(t);spendPlans(t);
  for(const b of Object.values(t.businesses)){b.economy.requested=0;b.economy.served=0;b.economy.missed=0;b.economy.contracts=0;}
  const requests=[];
  for(const r of t.residents.filter(r=>r.alive)){
    if(r.activity==='work'&&t.businesses[r.work]?.economy.failed){r.activity='rest';r.target=r.home;r.log.push({hour:t.hour,kind:'warning',text:'Workplace closed; no wage this hour.'});continue;}
    const kind={eat:'market',clinic:'clinic',tavern:'tavern'}[r.activity];if(!kind||!core.isOpen(kind,t.hour))continue;
    const shops=t.places.filter(p=>p.kind===kind&&!p.category&&!t.businesses[p.id].economy.failed);
    if(!shops.length){r.activity='rest';r.target=r.home;continue;}
    const criteria=Object.fromEntries(shops.map(p=>{const b=t.businesses[p.id],e=b.economy;return [p.id,`${p.name}: ${productNames[e.product]}, price ${Math.round(b.price*100)}%, quality ${e.quality}, appeal ${(e.appeal*e.reputation).toFixed(1)}.${r.avoid?.[p.id]?' Previously sold this customer a defective product.':''}`];}));
    requests.push({id:r.id,state:`Consumer ${r.name}, cash $${r.money}, hunger ${r.hunger}, health ${r.health}. Preference now ${productNames[r.currentPreference]}; long-term taste ${productNames[r.preference]}. Needs ${kind==='market'?'a meal':kind==='clinic'?'treatment':'social time'}. Choose a useful, affordable nearby business.`,questions:{shop:choice('Which offered business best fits this consumer’s preference and budget?',criteria)}});
  }
  if(!requests.length)return;
  const results=await judge(requests,'consumer choice');t.decisions+=requests.length;
  // Rotate service order to avoid systematically starving the last residents in the roster.
  const live=t.residents.filter(r=>results[r.id]);const offset=t.hour%Math.max(1,live.length),order=[...live.slice(offset),...live.slice(0,offset)];
  for(const r of order){const id=results[r.id].shop.choice,b=t.businesses[id],e=b.economy;e.requested++;r.lastShop=results[r.id].shop;e.visits.push({hour:t.hour+1,customerId:r.id,kind:'shop'});
    const kind=t.places.find(p=>p.id===id).kind;
    let target=id;if(e.served>=e.capacity){e.missed++;const alternative=t.places.filter(p=>p.kind===kind&&!p.category&&!t.businesses[p.id].economy.failed&&t.businesses[p.id].economy.served<t.businesses[p.id].economy.capacity).sort((a,b)=>t.businesses[a.id].price-t.businesses[b.id].price)[0];target=alternative?.id;if(target){e.visits.pop();t.businesses[target].economy.visits.push({hour:t.hour+1,customerId:r.id,kind:'shop'});}}
    if(target){r.target=target;t.businesses[target].economy.served++;r.purchaseCount++;r.log.push({hour:t.hour,kind:'decision',text:`Chose ${t.places.find(p=>p.id===target).name} for ${productNames[t.businesses[target].economy.product]}.`});}
    else if(kind==='market') {r.target=id;} // essential food gets a queued takeaway overflow; demand still records capacity pressure.
    else {r.activity='rest';r.target=r.home;}
  }
}
export function productionRevenue(t,resident,base){
  const b=t.businesses[resident.work],e=b?.economy;if(!e)return base;if(e.failed)return 0;
  const kind=t.places.find(p=>p.id===resident.work).kind,h=t.hour%24,open={office:[8,18],factory:[6,22],farm:[6,20],school:[8,16]}[kind];
  if(open&&(h<open[0]||h>=open[1]))return 0;
  if((t.event==='blackout'&&['office','school'].includes(kind))||(t.event==='robots'&&['office','factory','school'].includes(kind))||(t.event==='winter'&&kind==='farm'))return 0;
  const live=t.residents.filter(r=>r.alive).length,interest=t.economy.demand[e.product]/Math.max(1,live),services=Object.entries(t.businesses).filter(([id])=>['market','clinic','tavern'].includes(t.places.find(p=>p.id===id).kind));
  const recent=services.reduce((n,[,b])=>n+b.capital.history.slice(-24).reduce((s,h)=>s+h.customers,0),0);
  const activity=clamp(recent/Math.max(1,live*2),.25,1.5),share=clamp(interest*3,.15,1.8),scale=clamp(e.capacity/20,.5,3);
  const revenue=Math.round(base*activity*share*e.appeal*scale);e.contracts+=revenue;return revenue;
}
export function afterOperations(t,opening){
  captureReceipts(t);
  for(const [id,b] of Object.entries(t.businesses))b.hourSales=(t.economy.receipts||[]).filter(r=>r.businessId===id&&r.hour===t.hour).length;
  for(const [id,b]of Object.entries(t.businesses)){
    const e=b.economy;if(e.failed)continue;
    const revenue=(b.revenue||0)-opening[id].revenue,expense=Math.ceil(revenue*e.costRate)+Math.max(1,e.level);
    const paid=Math.min(b.till,expense);b.till-=paid;t.economy.supplierCash+=paid;e.lastCogs=Math.ceil(revenue*e.costRate);
    // Deployed working capital is consumed by operating losses; it never counts as revenue.
    const loss=Math.max(0,opening[id].till-b.till);b.capital.restricted=Math.min(b.till,Math.max(0,b.capital.restricted-loss));
    e.strain=b.till<20&&revenue<expense+4?e.strain+1:Math.max(0,e.strain-1);
    const h=b.capital.history.slice(-24),weak=h.length>=24&&sum(h,'profit')<0&&sum(h,'revenue')<100;
    e.weakHours=weak?e.weakHours+1:0;
    if(e.weakHours>=12&&e.level>1){e.level--;e.capacity=Math.max(15,e.capacity-10);e.weakHours=0;e.history.push({hour:t.hour,kind:'contraction',capacity:e.capacity});}
    if(e.strain>=12&&t.hour>=24){e.failed=true;e.failedAt=t.hour;e.plan=null;e.history.push({hour:t.hour,kind:'failed'});for(const r of t.residents.filter(r=>r.alive&&r.work===id)){r.mood=Math.max(0,r.mood-12);r.log.push({hour:t.hour,kind:'warning',text:`${t.places.find(p=>p.id===id).name} failed; looking for work.`});}}
  }
  // Workers from failed firms can transfer to an operating firm of the same kind with available capacity.
  for(const r of t.residents.filter(r=>r.alive&&t.businesses[r.work]?.economy.failed)){
    const old=t.places.find(p=>p.id===r.work),replacement=t.places.filter(p=>p.kind===old.kind&&!t.businesses[p.id]?.economy.failed&&t.businesses[p.id]&&t.residents.filter(x=>x.alive&&x.work===p.id).length<Math.ceil(t.businesses[p.id].economy.capacity/2)).sort((a,b)=>t.businesses[b.id].till-t.businesses[a.id].till)[0];
    if(replacement){r.work=replacement.id;r.log.push({hour:t.hour,kind:'event',text:`Found work at ${replacement.name}.`});}
  }
}
export async function discretionaryVisits(t,judge){
  const hour=t.hour%24;if(hour<10||hour>21)return;
  const shops=t.places.filter(p=>p.category&&!t.businesses[p.id].economy.failed),eligible=t.residents.filter(r=>r.alive&&r.hunger<60&&r.energy>35&&r.money>20&&(['rest','park','tavern'].includes(r.activity)||(t.hour+Number(r.id.slice(1)))%4===0&&r.activity==='work'));
  if(!eligible.length||!shops.length)return;
  const trend=['clothing','books','leisure'][Math.floor(t.hour/24)%3];t.economy.categoryTrend=trend;
  const requests=eligible.map(r=>{
    r.categoryTaste||=['clothing','books','leisure'][Number(r.id.slice(1))%3];r.lastCategory||={clothing:-48,books:-24,leisure:-12};
    const criteria={none:'Skip shopping this hour.'};
    for(const category of ['clothing','books','leisure'])if(shops.some(p=>p.category===category))criteria[category]=`${category}; last purchased ${t.hour-r.lastCategory[category]}h ago.${r.categoryTaste===category?' Personal favorite.':''}${trend===category?' Fashionable today.':''}`;
    return {id:r.id,state:`${r.name} has free time, $${r.money}, mood ${r.mood}/100. Likes ${r.categoryTaste} and wants to spend free time on that interest. Has not bought ${r.categoryTaste} for ${t.hour-r.lastCategory[r.categoryTaste]} hours. Current taste ${r.currentPreference}. Clothing lasts about 48h; books about 24h; leisure about 6h. Keep enough money for meals.`,questions:{destination:choice('Visit one of these shops/venues this hour, or keep the current plan?',criteria),purchase:choice('If visiting the chosen destination, buy its product/service or just browse?',{buy:'Buy something wanted and affordable.',browse:'Spend time browsing without buying.'})}};
  });
  for(const request of requests)delete request.questions.purchase;
  const results=await judge(requests,'discretionary visits');t.decisions+=requests.length;
  for(const [id,a]of Object.entries(results))a.destination=sampleModel(a.destination,`visit:${id}:${t.hour}`);
  const visitors=eligible.filter(r=>results[r.id].destination.choice!=='none');
  const shopRequests=visitors.map(r=>({id:r.id,state:`${r.name} chose ${results[r.id].destination.choice}. Budget $${r.money}. Wants ${r.currentPreference}.`,questions:{shop:choice('Choose the best value shop for this customer.',Object.fromEntries(shops.filter(p=>p.category===results[r.id].destination.choice).map(p=>{const b=t.businesses[p.id],e=b.economy;return [p.id,`${p.name}: ${productNames[e.product]}, $${Math.round(({clothing:18,books:10,leisure:8}[p.category])*b.price)}, quality ${e.quality}, reliability ${Math.round(e.reliability*100)}%.${r.avoid?.[p.id]?' Previous defective purchase.':''}`];})))}}));
  const shopResults=shopRequests.length?await judge(shopRequests,'retail store choice'):{};t.decisions+=shopRequests.length;
  for(const [id,a]of Object.entries(shopResults))a.shop=sampleModel(a.shop,`store:${id}:${t.hour}`);
  const purchaseRequests=visitors.map(r=>{const p=shops.find(p=>p.id===shopResults[r.id].shop.choice),b=t.businesses[p.id],e=b.economy,price=Math.round(({clothing:18,books:10,leisure:8}[p.category])*b.price),elapsed=t.hour-r.lastCategory[p.category];
    return {id:r.id,state:`${r.name} is visiting ${p.name} for ${p.category}. ${r.categoryTaste===p.category?'This is a favorite interest.':''} Last purchase ${elapsed} hours ago. ${elapsed>={clothing:36,books:16,leisure:4}[p.category]?'Ready for a new purchase.':'Recently satisfied this need.'} Product costs $${price}; available cash $${r.money}, leaving $${r.money-price}. ${r.money-price>=12?'Can afford the product and meals.':'Needs to preserve money for food.'} Product quality ${e.quality}/100. ${r.avoid?.[p.id]?'Previous purchase here was defective.':'No bad experience here recorded.'}`,questions:{purchase:choice('Buy this wanted product now or browse without buying?',{buy:'Make the purchase.',browse:'Leave without purchasing.'})}};});
  const purchases=purchaseRequests.length?await judge(purchaseRequests,'retail purchase'):{};t.decisions+=purchaseRequests.length;
  for(const [id,a]of Object.entries(purchases))a.purchase=sampleModel(a.purchase,`buy:${id}:${t.hour}`);
  for(const r of eligible){const a={...results[r.id],...purchases[r.id]},category=a.destination.choice;if(category==='none')continue;const p=shops.find(p=>p.id===shopResults[r.id].shop.choice),id=p.id,b=t.businesses[id],e=b.economy;e.visits.push({hour:t.hour+1,customerId:r.id,kind:'shop'});e.requested++;r.activity='shop';r.target=id;r.lastDestination=a;
    const price=Math.round(({clothing:18,books:10,leisure:8}[p.category])*b.price),cadence={clothing:36,books:16,leisure:4}[p.category],due=t.hour-r.lastCategory[p.category]>=cadence;
    const bought=a.purchase.choice==='buy'&&due&&r.money>=price+8&&e.served<e.capacity;
    if(bought){r.money-=price;creditBusiness(b,price,r.id,price);b.sales++;b.hourSales++;e.served++;r.lastCategory[p.category]=t.hour;r.mood=Math.min(100,r.mood+Math.round(5+e.quality/10));}
    else{const reason=e.served>=e.capacity?'capacity':!due?'already satisfied':a.purchase.choice==='browse'?'browsing':'budget reserve';e.failures.push({hour:t.hour+1,customerId:r.id,reason});if(reason==='capacity')e.missed++;r.mood=Math.min(100,r.mood+3);}
    r.log.push({hour:t.hour,kind:'decision',text:`Spent an hour at ${p.name}; ${bought?'completed a purchase':'left without buying'}.`});
  }
}
