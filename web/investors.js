// Investor Plaza: local model decisions, finite cash, fixed-share ascending auctions.
import {metricContext} from './metrics.js';
export const money=n=>`$${Math.round(n).toLocaleString()}`;
const wage={clerk:14,builder:12,farmer:10,doctor:18,trader:12,musician:9,teacher:13};
const check=(ok,message)=>{if(!ok)throw new Error(message);};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const payroll=(t,id)=>t.residents.filter(r=>r.alive&&r.work===id).reduce((n,r)=>n+wage[r.job],0);
export const cashFloor=(t,id)=>Math.max(120,payroll(t,id)*3);
export const shareCount=b=>b.capital.founderShares+(b.capital.marketShares||0)+Object.values(b.capital.holdings).reduce((n,s)=>n+s,0);
export const ownership=(b,id)=>(b.capital.holdings[id]||0)/shareCount(b);
export const totalCash=t=>t.residents.reduce((n,r)=>n+r.money,0)+t.treasury+Object.values(t.businesses).reduce((n,b)=>n+b.till,0)+t.investors.reduce((n,i)=>n+i.cash,0)+(t.finance?.settlement.cash||0);
export function addInvestors(t){
  const profiles=[
    ['Sapling Capital',2200,900,'Value investor: buy sound businesses below estimated value; avoid overpaying.'],
    ['Endless Rounds Capital',2400,1100,'Growth investor: favor rising revenue and customers, tolerate a modest premium.'],
    ['Excel Partners',2000,850,'Quality investor: prefer positive profit and cash reserves; protect liquidity.'],
    ['Survive Capital',2600,1200,'Community investor: support useful food and health services at fair prices.'],
    ['Contrarian Fund',1800,800,'Contrarian investor: seek discounted recoveries, avoid expensive popular lots.'],
    ['A16Fees',2300,950,'Product investor: favor reliable products, repeat customers and capable execution.']
  ];
  t.investors=profiles.map(([name,cash,maxTicket,strategy],n)=>({id:`i${n===5?6:n}`,name,cash,initialCash:cash,reserve:300,maxTicket,strategy,location:t.places.find(p=>p.name==='Plaza').id,invested:0,realized:0,basis:{},lastBought:{},lastSaleReview:-12,decisions:0,activity:'At Investor Plaza',log:[]}));
  for(const [n,i] of t.investors.entries()){i.location=t.places.find(p=>p.investorId===i.id)?.id||i.location;i.entryMarks={};i.valueLimit=[.9,1.2,.95,1.1,.8,1.05][n];i.strategy+=` Mandate: never bid above ${Math.round(i.valueLimit*100)}% of estimated lot value.`;}
  t.finance={offers:[],ledger:[],nextId:1,decisions:0,active:null,playerActive:false,skipPlayer:false,settlement:{cash:1000000,initialCash:1000000,paid:0}};
  for(const b of Object.values(t.businesses)){b.revenue=0;b.capital={founderShares:10000,marketShares:0,holdings:{},raised:0,restricted:0,lastAttempt:-24,operatingProfit:0,lastDayProfit:0,lastDecision:null,history:[]};}
  return t;
}
export function joinPlayer(t){
  let p=t.investors.find(i=>i.human);
  if(!p){p={id:'i5',name:'You',human:true,cash:2200,initialCash:2200,reserve:0,maxTicket:2200,strategy:'Your bids and sales are always your choice.',location:t.investors[0].location,invested:0,realized:0,basis:{},lastBought:{},decisions:0,activity:'At Investor Plaza',log:[]};t.investors.push(p);}
  p.name='You';p.entryMarks||={};p.location=t.places.some(p=>p.id==='firm-i5')?'firm-i5':t.investors[0].location;t.finance.playerActive=true;return p;
}
export function valuation(t,id){
  const b=t.businesses[id],history=b.capital.history,now=history.slice(-24),prev=history.slice(-48,-24);
  const sum=(rows,key)=>rows.reduce((n,r)=>n+r[key],0),revenue=sum(now,'revenue'),profit=sum(now,'profit'),previous=sum(prev,'revenue');
  const growth=prev.length===24&&previous>0?(revenue-previous)/previous:null;
  const staff=t.residents.filter(r=>r.alive&&r.work===id).length;
  const confidence=Math.min(1,now.length/24),anchor=Math.max(1000,payroll(t,id)*20);
  const observed=(revenue*2+Math.max(0,profit)*4)*clamp(1+(growth||0)*.25,.65,1.35)*(profit<0?.7:1)*(staff?1:.25);
  const owed=(t.economy?.receipts||[]).filter(r=>r.businessId===id).reduce((n,r)=>n+r.refundDue,0);
  const value=b.economy?.failed?0:Math.max(0,Math.round(Math.max(0,b.till-b.capital.restricted)+anchor*(1-confidence)+observed*confidence-owed));
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
export function candidates(t){return Object.entries(t.businesses).filter(([id,b])=>!b.economy?.failed&&payroll(t,id)>0&&(b.economy?.plan||b.till<cashFloor(t,id))&&t.hour-b.capital.lastAttempt>=12&&!t.finance.offers.some(o=>o.businessId===id&&['queued','open'].includes(o.status)));}
function lotBase(t,id,kind,shares,reserve,sellerId){
  const lot={id:`lot-${t.finance.nextId++}`,hour:t.hour,businessId:id,kind,shares,reserve,increment:Math.max(25,Math.ceil(reserve*.08/25)*25),sellerId,status:'queued',bids:[],turns:[],passed:[],participants:[],cursor:0,highBid:0,highBidder:null};
  lot.equity=shares/(shareCount(t.businesses[id])+(kind==='primary'?shares:0));return lot;
}
export function makeOffer(t,id){
  const b=t.businesses[id],need=Math.min(900,Math.max(200,Math.ceil((b.economy?.plan?.cost||payroll(t,id)*6)-Math.max(0,b.till-cashFloor(t,id))))),v=valuation(t,id).value;
  const remaining=Math.floor(b.capital.founderShares/.51-shareCount(b));
  if(remaining<1||v<=0)return null;
  const shares=Math.min(Math.max(1,Math.floor(shareCount(b)*clamp(need/Math.max(v,1),.06,.22))),remaining);
  if(shares<1||b.capital.founderShares/(shareCount(b)+shares)<.51)return null;
  // Primary reserve is at least the currently marked post-issue stake: no buy/instant-sell subsidy.
  const reserve=Math.max(50,Math.ceil(Math.max(Math.min(need,v*shares/shareCount(b))*.7,v*shares/(shareCount(b)+shares))/25)*25);
  return {...lotBase(t,id,'primary',shares,reserve),need,estimatedAtListing:v};
}
export function liquidationQuote(t,i,id,shares){
  const b=t.businesses[id],held=b.capital.holdings[i.id]||0;
  check(Number.isSafeInteger(shares)&&shares>0&&shares<=held,'Invalid liquidation share count');
  return Math.max(0,Math.floor(valuation(t,id).value*shares/shareCount(b)));
}
export function liquidate(t,i,id,shares){
  const b=t.businesses[id],amount=liquidationQuote(t,i,id,shares),held=b.capital.holdings[i.id],removed=(i.basis[id]||0)*shares/held;
  const before=totalCash(t),fromBefore=t.finance.settlement.cash,toBefore=i.cash,supply=shareCount(b);
  b.capital.holdings[i.id]-=shares;b.capital.marketShares+=shares;i.basis[id]=Math.max(0,(i.basis[id]||0)-removed);i.realized+=amount-removed;i.cash+=amount;
  t.finance.settlement.cash-=amount;t.finance.settlement.paid+=amount;
  t.finance.ledger.push({id:`tx-${t.finance.ledger.length+1}`,hour:t.hour,kind:'liquidation',from:'settlement',to:i.id,businessId:id,amount,shares,removedBasis:removed,fromBefore,fromAfter:t.finance.settlement.cash,toBefore,toAfter:i.cash});
  check(Math.abs(totalCash(t)-before)<1e-8,'Liquidation created unaccounted cash');check(shareCount(b)===supply,'Liquidation altered shares');assertFinance(t);return amount;
}
export function fairLotValue(t,lot){const b=t.businesses[lot.businessId];return valuation(t,lot.businessId).value*lot.shares/shareCount(b);}
export function nextPrice(lot){return lot.highBid?lot.highBid+lot.increment:lot.reserve;}
export function bidLimit(t,i,lot){
  const basis=i.basis[lot.businessId]||0;
  return Math.max(0,Math.floor(Math.min(i.cash-i.reserve,i.maxTicket,i.human?Infinity:i.initialCash*.5-basis,i.human?Infinity:fairLotValue(t,lot)*i.valueLimit)));
}
export function settleLot(t,lot){
  check(lot.status==='open','Auction already resolved');
  if(!lot.highBidder){lot.status='no-buyer';lot.closedAt=t.hour;return;}
  const buyer=t.investors.find(i=>i.id===lot.highBidder),b=t.businesses[lot.businessId],amount=lot.highBid;
  check(buyer&&Number.isSafeInteger(amount)&&amount>0,'Invalid winning bid');check(amount<=bidLimit(t,buyer,lot),'Winning bid exceeds available cash or exposure limit');
  check(b.capital.founderShares/(shareCount(b)+lot.shares)>=.51,'Ownership constraint');
  const before=totalCash(t),fromBefore=buyer.cash,toBefore=b.till,totalBefore=shareCount(b),oldShares=b.capital.holdings[buyer.id]||0;
  buyer.cash-=amount;buyer.invested+=amount;buyer.basis[lot.businessId]=(buyer.basis[lot.businessId]||0)+amount;buyer.lastBought[lot.businessId]=t.hour;
  b.till+=amount;b.capital.raised+=amount;b.capital.restricted+=amount;
  b.capital.holdings[buyer.id]=oldShares+lot.shares;
  const mark=valuation(t,lot.businessId).value/shareCount(b);
  buyer.entryMarks[lot.businessId]=((buyer.entryMarks[lot.businessId]||mark)*oldShares+mark*lot.shares)/(oldShares+lot.shares);

  lot.status='funded';lot.amount=amount;lot.investorId=buyer.id;lot.fundedAt=t.hour;lot.closedAt=t.hour;
  t.finance.ledger.push({id:`tx-${t.finance.ledger.length+1}`,hour:t.hour,kind:'investment',lotId:lot.id,from:buyer.id,to:lot.businessId,businessId:lot.businessId,amount,shares:lot.shares,fromBefore,fromAfter:buyer.cash,toBefore,toAfter:b.till});
  check(Math.abs(totalCash(t)-before)<1e-8,'Trade created or destroyed cash');check(shareCount(b)===totalBefore+lot.shares,'Share supply mismatch');assertFinance(t);
}
const qFunding={type:'choice',instructions:'Should the owners bring this equity lot to Investor Plaza to raise capital?',criteria:{raise:'Raise cash to sustain the business, accepting the stated dilution.',hold:'Keep ownership and rely on current cash and trading.'}};
const qBid={type:'choice',instructions:'On this investor’s turn, raise to the stated next bid or pass permanently on this lot?',criteria:{bid:'Offer the stated next cash bid; the equity and prospects justify its cost.',pass:'Pass; protect cash because price, risk, or this business does not fit.'}};
const qSale={type:'choice',instructions:'Should this investor liquidate half of this holding at the stated immediate cash quote?',criteria:{sell:'Take the quoted cash now to cut exposure, realize gains or protect capital.',hold:'Keep the equity for future value growth; no dividends are paid.'}};
export function businessFacts(t,id){const b=t.businesses[id],v=valuation(t,id);return `${t.places.find(p=>p.id===id).name}: ${v.staff} staff, cash ${money(b.till)}, equity value ${money(v.value)}, growth ${v.growth===null?'unknown':Math.round(v.growth*100)+'%'}. ${metricContext(t,id)} Owner adaptability ${b.economy?.owner.adaptability||0}; product ${b.economy?.product||'standard'}. Plan ${b.economy?.plan?.type||'none'}.`;}
async function ask(t,judge,requests,phase){const results=await judge(requests,phase);t.decisions+=requests.length;t.finance.decisions+=requests.length;return results;}
async function prepare(t,judge){
  const proposals=candidates(t).map(([id])=>makeOffer(t,id)).filter(Boolean);
  if(proposals.length){const results=await ask(t,judge,proposals.map(o=>({id:o.id,state:`${businessFacts(t,o.businessId)} Cash buffer target ${money(cashFloor(t,o.businessId))}. Funding need ${money(o.need)}. Offer ${(o.equity*100).toFixed(1)}% newly issued equity with opening bid ${money(o.reserve)}. Competing investors can bid more. Existing owners retain a majority.`,questions:{decision:qFunding}})),'business funding');
    for(const o of proposals){const a=results[o.id].decision,b=t.businesses[o.businessId];b.capital.lastAttempt=t.hour;b.capital.lastDecision={hour:t.hour,...a};if(a.choice==='raise'){o.requestProbability=a.probabilities.raise;t.finance.offers.push(o);}}}
  const reviews=[];
  for(const i of t.investors.filter(i=>!i.human&&t.hour-i.lastSaleReview>=6)){
    i.lastSaleReview=t.hour;
    for(const [id,b]of Object.entries(t.businesses))if((b.capital.holdings[i.id]||0)>=2)reviews.push({i,id});
  }
  if(reviews.length){const results=await ask(t,judge,reviews.map(({i,id},n)=>({id:`sale${n}`,state:`${i.name}. ${i.strategy} Cash ${money(i.cash)}; reserve ${money(i.reserve)}. Holding estimated ${money(ownership(t.businesses[id],i.id)*valuation(t,id).value)}, remaining cost ${money(i.basis[id]||0)}. Immediate half-holding liquidation quote ${money(liquidationQuote(t,i,id,Math.floor(t.businesses[id].capital.holdings[i.id]/2)))} at current marked value. ${businessFacts(t,id)}`,questions:{decision:qSale}})),'share liquidation');
    for(const [{i,id},n]of reviews.map((x,n)=>[x,n])){const a=results[`sale${n}`].decision;i.decisions++;i.log.push({hour:t.hour,businessId:id,phase:'liquidation',...a});if(a.choice==='sell')liquidate(t,i,id,Math.floor(t.businesses[id].capital.holdings[i.id]/2));}}

}
export async function runAuction(t,lot,judge,{onUpdate=()=>{},humanTurn}={}){
  check(lot.status==='queued','Auction is not queued');
  const b=t.businesses[lot.businessId];lot.equity=lot.shares/(shareCount(b)+lot.shares);lot.reserve=Math.max(lot.reserve,Math.ceil(valuation(t,lot.businessId).value*lot.equity/25)*25);
  lot.status='open';t.finance.active=lot.id;
  const available=t.investors.filter(i=>i.id!==lot.sellerId&&(!i.human||t.finance.playerActive&&!lot.playerDeclined));
  const offset=(Number(lot.id.split('-')[1])-1)%available.length;
  lot.participants=[...available.slice(offset),...available.slice(0,offset)].map(i=>i.id);
  for(let count=0;count<500;count++){
    const contenders=lot.participants.filter(id=>!lot.passed.includes(id)&&id!==lot.highBidder);
    if(!contenders.length){settleLot(t,lot);t.finance.active=null;lot.next=null;await onUpdate(lot);return lot;}
    let id;do{id=lot.participants[lot.cursor++%lot.participants.length];}while(lot.passed.includes(id)||id===lot.highBidder);
    const i=t.investors.find(i=>i.id===id),amount=nextPrice(lot);lot.next=id;await onUpdate(lot);
    let action='pass',answer,reason='';
    if(i.human){check(humanTurn,'Player turn needs a human decision handler');action=await humanTurn(lot,i);check(['bid','pass'].includes(action),'Unknown player action');}
    else if(amount>bidLimit(t,i,lot))reason='Cash, ticket, concentration or valuation limit';
    else {
      const a=(await ask(t,judge,[{id:i.id,state:`${i.name}: ${i.strategy} Available cash ${money(i.cash)}, reserve ${money(i.reserve)}. ${businessFacts(t,lot.businessId)} Fixed lot ${(lot.equity*100).toFixed(1)}% equity; estimated lot value ${money(fairLotValue(t,lot))}. Next bid ${money(amount)}; current high ${money(lot.highBid)}. Cash funds the business; unspent new capital is excluded from its estimated value. No dividends. Current exposure cost ${money(i.basis[lot.businessId]||0)}. Winning cash is committed, returns uncertain.`,questions:{decision:qBid}}],'auction bid'))[i.id].decision;
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
  if(options.queueOnly)return funded;
  for(const lot of t.finance.offers.filter(o=>o.status==='queued'&&(!options.lotId||o.id===options.lotId)).slice(0,options.maxLots||3)){await runAuction(t,lot,judge,options);if(lot.status==='funded')funded.push(lot);}
  assertFinance(t);return funded;
}
export const operatingBalances=t=>Object.fromEntries(Object.entries(t.businesses).map(([id,b])=>[id,{till:b.till,revenue:b.revenue||0}]));
export function finishOperations(t,opening){
  for(const [id,b]of Object.entries(t.businesses)){
    const profit=b.till-opening[id].till,grossRevenue=(b.revenue||0)-opening[id].revenue,refunds=(t.economy?.refunds||[]).filter(r=>r.businessId===id&&r.hour===t.hour).reduce((n,r)=>n+r.amount,0),revenue=grossRevenue-refunds;
    b.capital.history.push({hour:t.hour,revenue,grossRevenue,refunds,cogs:b.economy?.lastCogs||0,unmet:b.economy?.missed||0,profit,customers:b.hourSales});if(b.capital.history.length>48)b.capital.history.shift();b.capital.operatingProfit+=profit;
    if(t.hour%24!==0)continue;
    const dayProfit=b.capital.operatingProfit;b.capital.lastDayProfit=dayProfit;b.capital.operatingProfit=0;

  }assertFinance(t);
}
