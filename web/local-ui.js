import {money,payroll,cashFloor,ownership,shareCount,joinPlayer,portfolio,valuation,nextPrice,bidLimit,liquidate,liquidationQuote} from './investors.js';
import {productNames} from './economy.js';
import {scorecard} from './metrics.js';
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const pct=n=>`${(n*100).toFixed(1)}%`;
function metrics(rows){const dl=el('dl',undefined,'metrics');for(const [k,v]of rows){const row=el('div');row.append(el('dt',k),el('dd',String(v)));dl.append(row);}return dl;}
function section(title,...children){const s=el('section',undefined,'section');s.append(el('h3',title),...children);return s;}
function button(text,action,cls='btn'){const b=el('button',text,cls);b.type='button';b.addEventListener('click',action);return b;}
function answerView(answer){if(!answer)return el('p','No decision yet.','muted');const box=el('div',undefined,'decision');box.append(el('p',answer.type==='choice'?`Choice: ${answer.choice}`:answer.type==='noul'?`Probability: ${pct(answer.noul)}`:`Score: ${answer.score.toFixed(2)}`));for(const [k,v]of Object.entries(answer.probabilities||{})){const row=el('div',undefined,'probability-row');row.append(el('span',k),el('span',pct(v)));box.append(row);}return box;}
export function installUI({getTown,select,inspector,isBusy,runPlaza,refresh,onJoin,focusPlaza,focusBusiness}){
  let lastId,pending=null,selected='',lastAuction=null;
  const topbar=document.querySelector('.topbar'),open=()=>{focusPlaza();select('plaza');};
  topbar.append(button('Investor Plaza',open));
  const plaque=button('Investor Plaza · pitches & auctions',open,'plaza-plaque');document.querySelector('.stage').append(plaque);
  const portfolioCard=el('section',undefined,'portfolio-card');portfolioCard.setAttribute('aria-label','Your persistent portfolio');document.querySelector('.stage').append(portfolioCard);
  const dock=el('section',undefined,'auction-dock');dock.hidden=true;dock.setAttribute('aria-label','Live investment auction');document.body.append(dock);
  const runtime=el('span','Loading local Laya…','local-runtime');runtime.setAttribute('role','status');topbar.append(runtime);
  fetch('/api/health').then(r=>r.json()).then(h=>{runtime.textContent=`Local Laya · ${h.device==='cuda'?'GPU':'CPU'}`;runtime.title=`${h.model} · ${h.hardware}`;}).catch(()=>runtime.textContent='Laya unavailable');
  const name=id=>id==='settlement'?'Simulation settlement account':getTown().investors.find(i=>i.id===id)?.name||getTown().places.find(p=>p.id===id)?.name||id;
  const back=()=>button('← Town',()=>select(undefined),'btn small');
  function persistentPortfolio(){const t=getTown(),p=t.investors.find(i=>i.human);portfolioCard.replaceChildren(el('h3','KP portfolio'));
    if(!p){const join=button('Play as KP',safe(()=>{if(isBusy())return;onJoin(joinPlayer(t));open();}),'btn primary');join.disabled=isBusy();portfolioCard.append(el('p','Watch the town, or take a seat with $2,200.','muted'),join);return;}
    const value=portfolio(t,p);portfolioCard.append(metrics([['Cash',money(p.cash)],['Holdings at current value',money(value.value)],['Total wealth',money(value.value+p.cash)]]));
    const list=el('div',undefined,'portfolio-holdings');for(const [id,b]of Object.entries(t.businesses)){if(!b.capital.holdings[p.id])continue;const row=button('',()=>select(`business:${id}`),'portfolio-holding');const marked=ownership(b,p.id)*valuation(t,id).value,basis=p.basis[id]||0;row.append(el('strong',`${name(id)} · ${pct(ownership(b,p.id))}`),el('span',`Value ${money(marked)} · paid ${money(basis)}`),el('span',`Gain / loss ${money(marked-basis)}`));list.append(row);}portfolioCard.append(list.children.length?list:el('p','No holdings yet.','muted'),button('Portfolio & sell',()=>select(p.id),'btn small'),button('Investor Plaza',open,'btn small'));}
  function evidence(id,compact=false){const t=getTown(),m=scorecard(t,id),v=valuation(t,id),box=el('div',undefined,'scorecard');
    box.append(el('p',`Trailing ${m.hours} game hours (maximum 24). Growth compares the previous 24h when available.`,'muted'),metrics([['Current business value',money(v.value)],['Net revenue',money(m.net)],['Operating profit',money(m.profit)],['Cash',money(m.cash)],['Revenue growth',m.growth===null?'Not enough history':pct(m.growth)],['Product refunds',money(m.refund)]]));
    const full=el(compact?'details':'div');if(compact)full.append(el('summary','Full pitch scorecard · customers, quality & finances'));
    full.append(section('Revenue & resilience',metrics([['Gross sales / production revenue',money(m.gross)],['Net revenue after refunds',money(m.net)],['Gross margin',m.grossMargin===null?'No positive net revenue':pct(m.grossMargin)],['Operating profit',money(m.profit)],['Cash runway at recent burn',m.runway===null?'No current cash burn':`${m.runway.toFixed(1)}h`],['Average customer order',m.aov===null?'No purchases':money(m.aov)]])),section('Customer funnel',metrics([['Visits / unique visitors',`${m.visitors} / ${m.uniqueVisitors}`],['Paying customers / purchases',`${m.unique} / ${m.purchases}`],['Visit → purchase conversion',m.conversion===null?'No shopping visits':pct(m.conversion)],['Returning customers / repeat purchases',`${m.returningCustomers} / ${m.repeat}`],['Repeat purchase rate',m.repeatRate===null?'No purchases':pct(m.repeatRate)],['Failed purchase attempts',m.failed],['Failure reasons',Object.entries(m.failureReasons).map(([k,v])=>`${k}: ${v}`).join('; ')||'None recorded'],['Overflow / unmet demand',m.unmet]])),section('Quality & product returns',metrics([['Intrinsic quality / reliability',`${m.quality}/100 · ${pct(m.reliability)}`],['Product returns',m.returns],['Return-eligible / pending purchases',`${m.eligible} / ${m.pending}`],['Return rate / observed defects',m.returnRate===null?'No mature purchases':`${pct(m.returnRate)} / ${pct(m.defectRate)}`],['Refunds paid / still owed',`${money(m.refund)} / ${money(m.refundDue)}`]])));
    box.append(full);return box;
  }
  function safe(action){return ()=>{try{action();refresh();}catch(e){inspector.prepend(el('p',e.message,'market-error'));}};}
  function ledgerView(transfers){const list=el('ol',undefined,'life');for(const tx of [...transfers].reverse().slice(0,24)){const li=el('li');li.append(el('span',`Hour ${tx.hour} · ${tx.kind}`,'when'),el('p',`${name(tx.from)} → ${name(tx.to)} · ${money(tx.amount)}`),el('p',`${money(tx.fromBefore)} → ${money(tx.fromAfter)} / ${money(tx.toBefore)} → ${money(tx.toAfter)}`,'muted'));list.append(li);}return list.children.length?list:el('p','No transfers yet.','muted');}
  function marketCard(lot,expanded=false,inDock=false){
    const t=getTown(),b=t.businesses[lot.businessId],card=el('div',undefined,'offer');
    card.append(button(`${name(lot.businessId)} · ${pct(lot.equity)} equity`,()=>select(`business:${lot.businessId}`),'finance-row'));
    card.append(el('p',`${lot.status==='funded'?`Won by ${name(lot.highBidder)} for ${money(lot.highBid)}`:lot.status==='no-buyer'?'No bids — no shares or cash changed hands':`${lot.status==='open'?'Live auction':'Queued pitch'} · opening ${money(lot.reserve)}`}`));
    if(lot.status==='open'||expanded){
      card.append(el('p',b.economy?.plan?`Owner’s plan: ${b.economy.plan.label}; costs ${money(b.economy.plan.cost)}. Execution ${b.economy.plan.stage}.`:'Owner seeks working capital for payroll and operations.','muted'));
      card.append(metrics([['Current high bid',lot.highBid?`${money(lot.highBid)} · ${name(lot.highBidder)}`:'No bids'],['Next bid',money(nextPrice(lot))],['Next turn',lot.next?name(lot.next):'Complete'],['Passed',lot.passed.map(name).join(', ')||'Nobody'],['Bid increment',money(lot.increment)],['Shares in this lot',lot.shares]]));
      const history=el('ol',undefined,'bid-tape');for(const turn of (inDock?lot.turns:lot.turns.slice(-12))){const li=el('li',`${name(turn.investorId)} ${turn.action==='bid'?`bid ${money(turn.amount)}`:'passed'}${turn.reason?` · ${turn.reason}`:''}`);history.append(li);}card.append(history);
    }
    if(pending&&pending.lot.id===lot.id){
      if(!inDock)card.append(evidence(lot.businessId,true));
      const p=t.investors.find(i=>i.human),actions=el('div',undefined,'market-actions bid-controls');
      const bid=button(`Bid ${money(nextPrice(lot))}`,()=>resolveHuman('bid'),'btn primary');bid.disabled=nextPrice(lot)>bidLimit(t,p,lot);
      actions.append(bid,button('Pass this auction',()=>resolveHuman('pass')),button('Pass remaining auctions',()=>{t.finance.skipPlayer=true;resolveHuman('pass');}));
      card.append(el('p',`Your turn · cash ${money(p.cash)} · bidding commits cash if you win.`,'turn-prompt'),actions);
    }
    return card;
  }
  function renderDock(lot){
    if(!lot)return;
    if(lastAuction!==lot.id){lastAuction=lot.id;focusBusiness(lot.businessId);}
    dock.hidden=false;document.querySelector('.app').classList.add('auction-open');
    const title=el('header',undefined,'auction-header');title.append(el('h2',`${name(lot.businessId)} · ${pct(lot.equity)} equity`),el('span',lot.status==='open'?'LIVE CAPITAL RAISE':lot.status.toUpperCase(),'auction-state'));
    if(lot.status!=='open')title.append(button('Close auction card',()=>{dock.hidden=true;document.querySelector('.app').classList.remove('auction-open');},'btn small'));
    const columns=el('div',undefined,'auction-columns'),facts=el('div',undefined,'auction-evidence'),b=getTown().businesses[lot.businessId];
    facts.append(el('p',b.economy.plan?`${b.economy.plan.label} · ${money(b.economy.plan.cost)} · ${b.economy.plan.stage}`:'Working capital to sustain operations.','pitch-purpose'),metrics([['Owner adaptability / execution',`${b.economy.owner.adaptability} / ${b.economy.owner.discipline}`],['Completed changes',b.economy.history.filter(x=>x.kind==='completed').length],['Current product',productNames[b.economy.product]]]),evidence(lot.businessId));
    const history=el('details');history.append(el('summary','Recent operating history'));for(const h of b.capital.history.slice(-8))history.append(el('p',`Hour ${h.hour}: net ${money(h.revenue)}, profit ${money(h.profit)}, ${h.customers} purchases`,'muted'));facts.append(history);
    const bids=el('div',undefined,'auction-bidding');bids.append(el('h3','Bids & passes · chronological'),marketCard(lot,true,true));columns.append(facts,bids);dock.replaceChildren(title,columns);
  }
  function renderPlaza(){
    const t=getTown(),header=el('header');header.append(back(),el('h2','Investor Plaza'),el('p','Owners pitch. Investors take turns. Highest bid wins after the others pass.','lede'));
    const mode=el('div',undefined,'market-actions');
    if(!t.finance.playerActive){const join=button('Play as KP',safe(()=>{if(isBusy())return;const existed=t.investors.some(i=>i.human),p=joinPlayer(t);if(!existed)onJoin(p);}), 'btn primary');join.disabled=isBusy();mode.append(join,el('p','Join with $2,200. AI investors continue competing.','muted'));}
    else{mode.append(button('KP portfolio',()=>select('i5')));const watch=button('Watch autonomously',safe(()=>{t.finance.playerActive=false;}));watch.disabled=isBusy();mode.append(watch,el('p','The clock pauses on your turn. You can always pass.','muted'));}
    const run=button('Run plaza now',()=>runPlaza());run.disabled=isBusy();mode.append(run);
    const roster=el('div',undefined,'finance-list');for(const i of t.investors){const p=portfolio(t,i);roster.append(button(`${i.name} · cash ${money(i.cash)} · holdings ${money(p.value)}`,()=>select(i.id),'finance-row'));}
    const market=el('div');const active=t.finance.offers.find(o=>o.id===t.finance.active);
    if(active)market.append(marketCard(active,true));else market.append(el('p',isBusy()?'Local Laya is reviewing businesses…':'No auction in progress. Advance the town or run the plaza.','muted'));
    for(const lot of t.finance.offers.filter(o=>o.status==='queued'))market.append(marketCard(lot));
    const recent=el('div');for(const lot of [...t.finance.offers].filter(o=>['funded','no-buyer'].includes(o.status)).reverse().slice(0,10))recent.append(marketCard(lot));
    inspector.replaceChildren(header,section('Your seat',mode),section('On the floor',market),section('Consumer demand',demandView(t)),section('Investors',roster),section('Recent auctions',recent),section('How liquidation works',el('p','Sell holdings immediately to the simulation settlement account. No buyer vote and no dividends. Liquidation pays the current marked equity value of the shares, rounded down to whole dollars. New-issue opening bids cannot be below the currently marked stake. Unspent new capital is excluded from the operating valuation until it produces results; cash is never counted twice.','muted'),metrics([['Settlement cash',money(t.finance.settlement.cash)],['Liquidations paid',money(t.finance.settlement.paid)]])));
  }
  function demandView(t){return metrics([['Current broad trend',productNames[t.economy.trend]],...Object.entries(t.economy.demand).map(([k,v])=>[productNames[k],`${v} residents`])]);}
  function renderInvestor(i){
    const t=getTown(),p=portfolio(t,i),header=el('header');header.append(button('← Plaza',open,'btn small'),el('h2',i.name),el('p',i.human?'Player investor':'Autonomous investor','lede'));
    const holdings=el('div',undefined,'finance-list');
    for(const [id,b]of Object.entries(t.businesses)){const shares=b.capital.holdings[i.id]||0;if(!shares)continue;
      const row=el('div',undefined,'offer');row.append(button(`${name(id)} · ${pct(ownership(b,i.id))}`,()=>select(`business:${id}`),'finance-row'),metrics([['Shares',shares],['Estimated value',money(ownership(b,i.id)*valuation(t,id).value)],['Cost basis',money(i.basis[id]||0)],['Cash out all now',money(liquidationQuote(t,i,id,shares))]]));
      if(i.human){const actions=el('div',undefined,'market-actions');for(const [label,count]of [['Liquidate half',Math.max(1,Math.floor(shares/2))],['Liquidate all',shares]]){const sell=button(`${label} · ${money(liquidationQuote(t,i,id,count))}`,safe(()=>{liquidate(t,i,id,count);}));sell.disabled=isBusy();actions.append(sell);}row.append(actions);}holdings.append(row);
    }
    if(!holdings.children.length)holdings.append(el('p','No holdings. Visit the plaza to bid.','muted'));
    const decisions=el('ol',undefined,'life');for(const x of i.log.slice(-12).reverse()){const li=el('li');li.append(el('span',`Hour ${x.hour} · ${name(x.businessId)} · ${x.phase}`,'when'),el('p',x.action?`${x.action}${x.action==='bid'?` ${money(x.amount)}`:''}`:x.choice||''));if(x.probabilities)li.append(answerView(x));decisions.append(li);}
    inspector.replaceChildren(header,section('Performance',metrics([['Cash',money(i.cash)],['Holdings estimate',money(p.value)],['Remaining cost basis',money(p.cost)],['Unrealized mark gain / loss',money(p.unrealized)],['Realized gain / loss',money(p.realized)],['Estimated total return',money(p.totalReturn)],['Cash reserve',money(i.reserve)]])),section('Approach',el('p',i.strategy)),section('Holdings',holdings),section('Recent decisions',decisions),section('Transfers',ledgerView(t.finance.ledger.filter(x=>x.from===i.id||x.to===i.id))));
  }
  function renderBusiness(id){
    const t=getTown(),b=t.businesses[id],e=b.economy,v=valuation(t,id),header=el('header');header.append(button('← Plaza',open,'btn small'),el('h2',name(id)),el('p',e.failed?'Closed · equity value $0':`${v.staff} staff · ${productNames[e.product]}`,'lede'));
    const history=el('div',undefined,'performance-table'),table=el('table'),thead=el('tr');for(const s of ['Hour','Revenue','Profit','Customers'])thead.append(el('th',s));table.append(thead);for(const h of b.capital.history.slice(-12).reverse()){const tr=el('tr');for(const s of [h.hour,money(h.revenue),money(h.profit),h.customers])tr.append(el('td',String(s)));table.append(tr);}history.append(table);
    const owner=el('ol',undefined,'life');for(const h of e.history.slice(-10).reverse())owner.append(el('li',`Hour ${h.hour} · ${h.kind} · ${h.strategy||h.type||''} ${h.product||''}${h.cost?` · spent ${money(h.cost)}`:''}`));
    const lots=el('div');for(const lot of t.finance.offers.filter(o=>o.businessId===id).slice(-5).reverse())lots.append(marketCard(lot,true));
    const holders=Object.entries(b.capital.holdings).filter(([,n])=>n>0).map(([iid])=>[name(iid),pct(ownership(b,iid))]);
    inspector.replaceChildren(header,section('Business evidence',metrics([['Cash',money(b.till)],['Estimated whole equity',money(v.value)],['Last 24h revenue',money(v.revenue)],['Last 24h operating profit',money(v.profit)],['Revenue growth',v.growth===null?'Need 48 hours':pct(v.growth)],['Prices vs normal',pct(b.price)],['Last hour paying customers',b.hourSales],['Repeat customer purchases',e.repeatCustomers||0],['Capacity / hour',e.capacity],['Requests / overflow last hour',`${e.requested} / ${e.missed}`],['Unaffordable meals recorded',e.lost?.unaffordable||0],['Skipped meals recorded',e.lost?.skipped||0],['Appeal',e.appeal.toFixed(2)],['Unit cost rate',pct(e.costRate)],['Normal hourly payroll',money(payroll(t,id))],['Missed payrolls',b.shortfalls],['Capital raised',money(b.capital.raised)]])),section('Owner & plan',metrics([['Adaptability',`${e.owner.adaptability}/100`],['Execution discipline',`${e.owner.discipline}/100`],['Plan',e.plan?.label||'No current plan'],['Cost / state',e.plan?`${money(e.plan.cost)} · ${e.plan.stage}`:'—']]),owner),section('Current demand',demandView(t)),section('Ownership',metrics([['Founders',pct(b.capital.founderShares/shareCount(b))],['Settlement account',pct(b.capital.marketShares/shareCount(b))],...holders])),section('Performance history',history),section('Auctions',lots),section('Owner funding decision',answerView(b.capital.lastDecision)),section('Transfers',ledgerView(t.finance.ledger.filter(x=>x.businessId===id))));
  }
  function resolveHuman(action){if(!pending)return;const resolve=pending.resolve;pending=null;resolve(action);}
  function renderDetail(id){persistentPortfolio();selected=id;if(id!==lastId)inspector.scrollTop=0;lastId=id;if(id==='plaza'){renderPlaza();return true;}const i=getTown().investors.find(i=>i.id===id);if(i){renderInvestor(i);return true;}if(id?.startsWith('business:')){renderBusiness(id.slice(9));inspector.querySelector('header').after(section('Investor scorecard',evidence(id.slice(9))));return true;}return false;}
  function enhance(id){const t=getTown();if(id){const r=t.residents.find(r=>r.id===id);if(r){inspector.append(section('Consumer preference',el('p',`${productNames[r.currentPreference||r.preference]} · persistent taste: ${productNames[r.preference]}`)));if(r.lastShop)inspector.append(section('Actual shop choice',answerView(r.lastShop)));}return;}
    const s=[...inspector.querySelectorAll('section')].find(s=>s.querySelector('h3')?.textContent==='Businesses');if(s){const list=el('div',undefined,'finance-list');for(const [id,b]of Object.entries(t.businesses))list.append(button(`${name(id)} · ${money(b.till)}${b.economy.failed?' · CLOSED':''}`,()=>select(`business:${id}`),'finance-row'));s.replaceChildren(el('h3','Businesses'),list);s.before(section('Investor Plaza',button('Visit pitches & portfolios',open)));}}
  return {renderDetail,enhance,async marketUpdate(){persistentPortfolio();const t=getTown(),active=t.finance.offers.find(o=>o.id===t.finance.active),last=t.finance.offers.find(o=>o.id===lastAuction);renderDock(active||last);plaque.textContent=active?`Plaza · ${name(active.businessId)} · ${money(active.highBid)}${pending?' · Your turn':''}`:'Investor Plaza · pitches & auctions';if(selected==='plaza')renderPlaza();if(active)await new Promise(resolve=>setTimeout(resolve,t.finance.playerActive?100:40));},humanTurn(lot,investor){return new Promise(resolve=>{pending={lot,investor,resolve};renderDock(lot);select('plaza');});}};
}
