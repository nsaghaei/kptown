// Investor Plaza: local model decisions, finite cash, fixed-share ascending auctions.
export const money=n=>`$${Math.round(n).toLocaleString()}`;
const wage={clerk:14,builder:12,farmer:10,doctor:18,trader:12,musician:9,teacher:13};
const check=(ok,message)=>{if(!ok)throw new Error(message);};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const payroll=(t,id)=>t.residents.filter(r=>r.alive&&r.work===id).reduce((n,r)=>n+wage[r.job],0);
export const cashFloor=(t,id)=>Math.max(120,payroll(t,id)*3);
export const shareCount=b=>b.capital.founderShares+Object.values(b.capital.holdings).reduce((n,s)=>n+s,0);
export const ownership=(b,id)=>(b.capital.holdings[id]||0)/shareCount(b);
export const totalCash=t=>t.residents.reduce((n,r)=>n+r.money,0)+t.treasury+Object.values(t.businesses).reduce((n,b)=>n+b.till,0)+t.investors.reduce((n,i)=>n+i.cash,0);
export function addInvestors(t){
  const profiles=[
    ['Rowan Vale',2200,900,'Value investor: buy sound businesses below estimated value; avoid overpaying.'],
    ['Mira Chen',2400,1100,'Growth investor: favor rising revenue and customers, tolerate a modest premium.'],
    ['Jules Okoro',2000,850,'Income investor: prefer positive profit and cash reserves; protect liquidity.'],
    ['Sana Reyes',2600,1200,'Community investor: support useful food and health services at fair prices.'],
    ['Theo Park',1800,800,'Contrarian investor: seek discounted recoveries, avoid expensive popular lots.']
  ];
  t.investors=profiles.map(([name,cash,maxTicket,strategy],n)=>({id:`i${n}`,name,cash,initialCash:cash,reserve:300,maxTicket,strategy,location:t.places.find(p=>p.name==='Plaza').id,invested:0,dividends:0,realized:0,basis:{},lastBought:{},lastSaleReview:-12,decisions:0,activity:'At Investor Plaza',log:[]}));
  t.finance={offers:[],ledger:[],nextId:1,decisions:0,active:null,playerActive:false,skipPlayer:false};
  for(const b of Object.values(t.businesses)){b.revenue=0;b.capital={founderShares:10000,holdings:{},raised:0,dividends:0,lastAttempt:-24,operatingProfit:0,lastDayProfit:0,lastDecision:null,history:[]};}
  return t;
}
export function joinPlayer(t){
  let p=t.investors.find(i=>i.human);
  if(!p){p={id:'i5',name:'You',human:true,cash:2200,initialCash:2200,reserve:0,maxTicket:2200,strategy:'Your bids and sales are always your choice.',location:t.investors[0].location,invested:0,dividends:0,realized:0,basis:{},lastBought:{},decisions:0,activity:'At Investor Plaza',log:[]};t.investors.push(p);}
  t.finance.playerActive=true;return p;
}
export function valuation(t,id){
  const b=t.businesses[id],history=b.capital.history,now=history.slice(-24),prev=history.slice(-48,-24);
  const sum=(rows,key)=>rows.reduce((n,r)=>n+r[key],0),revenue=sum(now,'revenue'),profit=sum(now,'profit'),previous=sum(prev,'revenue');
  const growth=prev.length===24&&previous>0?(revenue-previous)/previous:null;
  const staff=t.residents.filter(r=>r.alive&&r.work===id).length;
  const confidence=Math.min(1,now.length/24),anchor=Math.max(1000,payroll(t,id)*20);
  const observed=(revenue*2+Math.max(0,profit)*4)*clamp(1+(growth||0)*.25,.65,1.35)*(profit<0?.7:1)*(staff?1:.25);
  const value=Math.max(100,Math.round(b.till+anchor*(1-confidence)+observed*confidence));
  return {value,revenue,profit,growth,hours:now.length,staff};
}
export function portfolio(t,i){
  let value=0,cost=0;
  for(const [id,b]of Object.entries(t.businesses)){value+=ownership(b,i.id)*valuation(t,id).value;cost+=i.basis[id]||0;}
  return {value,cost,unrealized:value-cost,realized:i.realized,netWorth:i.cash+value,totalReturn:i.cash+value-i.initialCash};
}
export function assertFinance(t){
  for(const i of t.investors){check(Number.isSafeInteger(i.cash)&&i.cash>=0,'Invalid investor balance');check(i.human||i.cash>=i.reserve,'Investor reserve breached');for(const basis of Object.values(i.basis))check(Number.isFinite(basis)&&basis>=-1e-8,'Invalid cost basis');}
  for(const b of Object.values(t.businesses)){
    check(Number.isFinite(b.till)&&b.till>=0,'Invalid business balance');check(b.capital.founderShares===10000,'Founder shares changed');
    for(const [id,shares]of Object.entries(b.capital.holdings)){check(t.investors.some(i=>i.id===id),'Unknown shareholder');check(Number.isSafeInteger(shares)&&shares>=0,'Invalid share balance');}
    check(b.capital.founderShares/shareCount(b)>=.51,'Founders must retain majority');
  }
  check(new Set(t.finance.ledger.filter(x=>x.lotId).map(x=>x.lotId)).size===t.finance.ledger.filter(x=>x.lotId).length,'Duplicate settlement');
}
export function candidates(t){return Object.entries(t.businesses).filter(([id,b])=>payroll(t,id)>0&&b.till<cashFloor(t,id)&&t.hour-b.capital.lastAttempt>=12&&!t.finance.offers.some(o=>o.businessId===id&&['queued','open'].includes(o.status)));}
function lotBase(t,id,kind,shares,reserve,sellerId){
  const lot={id:`lot-${t.finance.nextId++}`,hour:t.hour,businessId:id,kind,shares,reserve,increment:Math.max(25,Math.ceil(reserve*.08/25)*25),sellerId,status:'queued',bids:[],turns:[],passed:[],participants:[],cursor:0,highBid:0,highBidder:null};
  lot.equity=shares/(shareCount(t.businesses[id])+(kind==='primary'?shares:0));return lot;
}
export function makeOffer(t,id){
  const b=t.businesses[id],need=Math.min(800,Math.max(200,Math.ceil(payroll(t,id)*6-b.till))),v=valuation(t,id).value;
  const shares=Math.max(1,Math.min(Math.floor(shareCount(b)*clamp(need/Math.max(v,1),.06,.22)),Math.floor(b.capital.founderShares/.51-shareCount(b))));
  if(shares<1||b.capital.founderShares/(shareCount(b)+shares)<.51)return null;
  const reserve=Math.max(50,Math.ceil(Math.min(need,v*shares/shareCount(b))*.7/25)*25);
  return {...lotBase(t,id,'primary',shares,reserve),need,estimatedAtListing:v};
}
export function queueSale(t,sellerId,id,shares,reserve){
  const seller=t.investors.find(i=>i.id===sellerId),b=t.businesses[id];
  check(seller&&b,'Unknown seller or business');check(Number.isSafeInteger(shares)&&shares>0&&shares<=(b.capital.holdings[sellerId]||0),'Invalid sale share count');
  check(Number.isSafeInteger(reserve)&&reserve>=1,'Reserve must be a positive whole dollar amount');
  check(!t.finance.offers.some(o=>o.businessId===id&&['queued','open'].includes(o.status)),'This business already has a queued or active auction');
  const lot=lotBase(t,id,'secondary',shares,reserve,sellerId);t.finance.offers.push(lot);return lot;
}
export function fairLotValue(t,lot){const b=t.businesses[lot.businessId];return valuation(t,lot.businessId).value*lot.shares/shareCount(b);}
export function nextPrice(lot){return lot.highBid?lot.highBid+lot.increment:lot.reserve;}
export function bidLimit(t,i,lot){
  const basis=i.basis[lot.businessId]||0;
  return Math.max(0,Math.floor(Math.min(i.cash-i.reserve,i.maxTicket,i.human?Infinity:i.initialCash*.5-basis)));
}
export function settleLot(t,lot){
  check(lot.status==='open','Auction already resolved');
  if(!lot.highBidder){lot.status='no-buyer';lot.closedAt=t.hour;return;}
  const buyer=t.investors.find(i=>i.id===lot.highBidder),b=t.businesses[lot.businessId],seller=lot.sellerId?t.investors.find(i=>i.id===lot.sellerId):null,amount=lot.highBid;
  check(buyer&&Number.isSafeInteger(amount)&&amount>0,'Invalid winning bid');check(amount<=bidLimit(t,buyer,lot),'Winning bid exceeds available cash or exposure limit');
  if(lot.kind==='secondary')check(seller&&seller.id!==buyer.id&&(b.capital.holdings[seller.id]||0)>=lot.shares,'Seller no longer owns these shares');
  else check(b.capital.founderShares/(shareCount(b)+lot.shares)>=.51,'Ownership constraint');
  const before=totalCash(t),fromBefore=buyer.cash,toBefore=seller?seller.cash:b.till,totalBefore=shareCount(b);
  buyer.cash-=amount;buyer.invested+=amount;buyer.basis[lot.businessId]=(buyer.basis[lot.businessId]||0)+amount;buyer.lastBought[lot.businessId]=t.hour;
  if(seller){const removed=(seller.basis[lot.businessId]||0)*lot.shares/b.capital.holdings[seller.id];seller.basis[lot.businessId]=Math.max(0,(seller.basis[lot.businessId]||0)-removed);seller.realized+=amount-removed;seller.cash+=amount;b.capital.holdings[seller.id]-=lot.shares;}
  else {b.till+=amount;b.capital.raised+=amount;}
  b.capital.holdings[buyer.id]=(b.capital.holdings[buyer.id]||0)+lot.shares;
  lot.status='funded';lot.amount=amount;lot.investorId=buyer.id;lot.fundedAt=t.hour;lot.closedAt=t.hour;
  t.finance.ledger.push({id:`tx-${t.finance.ledger.length+1}`,hour:t.hour,kind:lot.kind==='primary'?'investment':'resale',lotId:lot.id,from:buyer.id,to:seller?seller.id:lot.businessId,businessId:lot.businessId,amount,shares:lot.shares,fromBefore,fromAfter:buyer.cash,toBefore,toAfter:seller?seller.cash:b.till});
  check(Math.abs(totalCash(t)-before)<1e-8,'Trade created or destroyed cash');check(shareCount(b)===totalBefore+(seller?0:lot.shares),'Share supply mismatch');assertFinance(t);
}
const qFunding={type:'choice',instructions:'Should the owners bring this equity lot to Investor Plaza to raise capital?',criteria:{raise:'Raise cash to sustain the business, accepting the stated dilution.',hold:'Keep ownership and rely on current cash and trading.'}};
const qBid={type:'choice',instructions:'On this investor’s turn, raise to the stated next bid or pass permanently on this lot?',criteria:{bid:'Offer the stated next cash bid; the equity and prospects justify its cost.',pass:'Pass; protect cash because price, risk, or this business does not fit.'}};
const qSale={type:'choice',instructions:'Should this investor offer half of this holding for sale now?',criteria:{sell:'Seek a buyer to realize gains, cut exposure or replenish cash; a sale is not guaranteed.',hold:'Keep the equity for future growth and income.'}};
export function businessFacts(t,id){const b=t.businesses[id],v=valuation(t,id);return `${t.places.find(p=>p.id===id).name}: ${v.staff} staff, cash ${money(b.till)}, normal payroll ${money(payroll(t,id))}/work hour. Last ${v.hours}h revenue ${money(v.revenue)}, operating profit ${money(v.profit)}, revenue growth ${v.growth===null?'not enough history':Math.round(v.growth*100)+'%'}. Estimated whole equity ${money(v.value)}. ${b.shortfalls} missed payrolls. Conditions ${t.event}.`;}
async function ask(t,judge,requests,phase){const results=await judge(requests,phase);t.decisions+=requests.length;t.finance.decisions+=requests.length;return results;}
async function prepare(t,judge){
  const proposals=candidates(t).map(([id])=>makeOffer(t,id)).filter(Boolean);
  if(proposals.length){const results=await ask(t,judge,proposals.map(o=>({id:o.id,state:`${businessFacts(t,o.businessId)} Cash buffer target ${money(cashFloor(t,o.businessId))}. Funding need ${money(o.need)}. Offer ${(o.equity*100).toFixed(1)}% newly issued equity with opening bid ${money(o.reserve)}. Competing investors can bid more. Existing owners retain a majority.`,questions:{decision:qFunding}})),'business funding');
    for(const o of proposals){const a=results[o.id].decision,b=t.businesses[o.businessId];b.capital.lastAttempt=t.hour;b.capital.lastDecision={hour:t.hour,...a};if(a.choice==='raise'){o.requestProbability=a.probabilities.raise;t.finance.offers.push(o);}}}
  const reviews=[];
  for(const i of t.investors.filter(i=>!i.human&&t.hour-i.lastSaleReview>=12)){
    i.lastSaleReview=t.hour;
    for(const [id,b]of Object.entries(t.businesses))if((b.capital.holdings[i.id]||0)>=2&&t.hour-(i.lastBought[id]??t.hour)>=12&&!t.finance.offers.some(o=>o.businessId===id&&['queued','open'].includes(o.status)))reviews.push({i,id});
  }
  if(reviews.length){const results=await ask(t,judge,reviews.map(({i,id},n)=>({id:`sale${n}`,state:`${i.name}. ${i.strategy} Cash ${money(i.cash)}; reserve ${money(i.reserve)}. Holding estimated ${money(ownership(t.businesses[id],i.id)*valuation(t,id).value)}, remaining cost ${money(i.basis[id]||0)}. ${businessFacts(t,id)} Selling is optional and requires a buyer.`,questions:{decision:qSale}})),'share sale');
    for(const [{i,id},n]of reviews.map((x,n)=>[x,n])){const a=results[`sale${n}`].decision;i.decisions++;i.log.push({hour:t.hour,businessId:id,phase:'sale',...a});if(a.choice==='sell'&&!t.finance.offers.some(o=>o.businessId===id&&['queued','open'].includes(o.status))){const shares=Math.floor(t.businesses[id].capital.holdings[i.id]/2);queueSale(t,i.id,id,shares,Math.max(25,Math.floor(valuation(t,id).value*shares/shareCount(t.businesses[id])*.75/25)*25));}}}
}
export async function runAuction(t,lot,judge,{onUpdate=()=>{},humanTurn}={}){
  check(lot.status==='queued','Auction is not queued');lot.status='open';t.finance.active=lot.id;
  const available=t.investors.filter(i=>i.id!==lot.sellerId&&(!i.human||t.finance.playerActive));
  const offset=(Number(lot.id.split('-')[1])-1)%available.length;
  lot.participants=[...available.slice(offset),...available.slice(0,offset)].map(i=>i.id);
  for(let count=0;count<500;count++){
    const contenders=lot.participants.filter(id=>!lot.passed.includes(id)&&id!==lot.highBidder);
    if(!contenders.length){settleLot(t,lot);t.finance.active=null;lot.next=null;await onUpdate(lot);return lot;}
    let id;do{id=lot.participants[lot.cursor++%lot.participants.length];}while(lot.passed.includes(id)||id===lot.highBidder);
    const i=t.investors.find(i=>i.id===id),amount=nextPrice(lot);lot.next=id;await onUpdate(lot);
    let action='pass',answer,reason='';
    if(amount>bidLimit(t,i,lot))reason='Cash, ticket or concentration limit';
    else if(i.human){if(!t.finance.skipPlayer){check(humanTurn,'Player turn needs a human decision handler');action=await humanTurn(lot,i);check(['bid','pass'].includes(action),'Unknown player action');}else reason='Player chose to pass remaining lots this session';}
    else {
      const a=(await ask(t,judge,[{id:i.id,state:`${i.name}: ${i.strategy} Available cash ${money(i.cash)}, reserve ${money(i.reserve)}. ${businessFacts(t,lot.businessId)} Fixed lot ${(lot.equity*100).toFixed(1)}% equity; estimated lot value ${money(fairLotValue(t,lot))}. Next bid ${money(amount)}; current high ${money(lot.highBid)}. ${lot.kind==='primary'?'Cash funds the business.':'Cash goes to the selling investor, not the business.'} Current exposure cost ${money(i.basis[lot.businessId]||0)}. Winning cash is committed, returns uncertain.`,questions:{decision:qBid}}],'auction bid'))[i.id].decision;
      answer=a;action=a.choice;i.decisions++;
    }
    const turn={hour:t.hour,businessId:lot.businessId,investorId:id,amount,action,reason,...(answer?{answer}: {})};lot.turns.push(turn);i.log.push({hour:t.hour,businessId:lot.businessId,lotId:lot.id,phase:'bid',action,amount,...answer});
    if(action==='bid'){check(amount<=bidLimit(t,i,lot),'Bid exceeds budget');lot.highBid=amount;lot.highBidder=id;lot.bids.push({investorId:id,amount});i.activity=`Bidding ${money(amount)}`;}else{lot.passed.push(id);i.activity='Passed';}
    await onUpdate(lot);
  }
  throw new Error('Auction exceeded bounded turn limit');
}
export async function financeTurn(t,judge,options={}){
  t.finance.skipPlayer=false;await prepare(t,judge);const funded=[];
  for(const lot of t.finance.offers.filter(o=>o.status==='queued')){await runAuction(t,lot,judge,options);if(lot.status==='funded')funded.push(lot);}
  assertFinance(t);return funded;
}
export const operatingBalances=t=>Object.fromEntries(Object.entries(t.businesses).map(([id,b])=>[id,{till:b.till,revenue:b.revenue||0}]));
export function finishOperations(t,opening){
  for(const [id,b]of Object.entries(t.businesses)){
    const profit=b.till-opening[id].till,revenue=(b.revenue||0)-opening[id].revenue;
    b.capital.history.push({hour:t.hour,revenue,profit,customers:b.hourSales});if(b.capital.history.length>48)b.capital.history.shift();b.capital.operatingProfit+=profit;
    if(t.hour%24!==0)continue;
    const dayProfit=b.capital.operatingProfit;b.capital.lastDayProfit=dayProfit;b.capital.operatingProfit=0;
    const pool=Math.max(0,Math.min(Math.floor(dayProfit*.2),Math.floor(b.till-cashFloor(t,id)))),total=shareCount(b);
    for(const i of t.investors){const amount=Math.floor(pool*(b.capital.holdings[i.id]||0)/total);if(amount<=0)continue;const before=totalCash(t),fromBefore=b.till,toBefore=i.cash;b.till-=amount;i.cash+=amount;i.dividends+=amount;b.capital.dividends+=amount;t.finance.ledger.push({id:`tx-${t.finance.ledger.length+1}`,hour:t.hour,kind:'dividend',from:id,to:i.id,businessId:id,amount,fromBefore,fromAfter:b.till,toBefore,toAfter:i.cash});check(Math.abs(totalCash(t)-before)<1e-8,'Dividend created cash');}
  }assertFinance(t);
}
