import {money,ownership,shareCount,joinPlayer,portfolio,valuation,nextPrice,bidLimit,liquidate,liquidationQuote} from './investors.js';

import {productNames} from './economy.js';

import {scorecard} from './metrics.js';

const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};

const pct=n=>n===null?'—':`${(n*100).toFixed(1)}%`;

function button(text,fn,cls='btn'){const b=el('button',text,cls);b.type='button';b.onclick=fn;return b;}

function table(headers,rows,cls='data-sheet'){const t=el('table',undefined,cls),head=el('thead'),tr=el('tr');for(const h of headers)tr.append(el('th',h));head.append(tr);t.append(head);const body=el('tbody');for(const row of rows){const tr=el('tr');for(const value of row){const td=el('td');if(value instanceof Node)td.append(value);else td.textContent=String(value);tr.append(td);}body.append(tr);}t.append(body);return t;}

function details(title,...content){const d=el('details');d.append(el('summary',title),...content);return d;}

export function installUI({getTown,isBusy,runPlaza,refresh,onJoin,onWin,focusBusiness,focusPlaza,onQueueUpdate}){

  let view={type:'queue'},pending=null,lastFocused=null,collapsed=false,shown=false;const celebrated=new Set();let closingTimer=null;

  const stage=document.querySelector('.stage'),app=document.querySelector('.app'),top=document.querySelector('.topbar');

  const portfolioCard=el('section',undefined,'portfolio-card');portfolioCard.setAttribute('aria-label','Your portfolio');stage.append(portfolioCard);

  const dock=el('section',undefined,'business-dock');dock.setAttribute('aria-label','Business and investment card');dock.hidden=true;document.body.append(dock);


  const runtime=el('span','Local Laya…','local-runtime');top.append(runtime);fetch('/api/health').then(r=>r.json()).then(h=>{runtime.textContent=`Local Laya · ${h.device==='cuda'?'GPU':'CPU'}`;runtime.title=h.hardware;}).catch(()=>runtime.textContent='Laya unavailable');

  const name=id=>id==='settlement'?'Settlement account':getTown().investors.find(i=>i.id===id)?.name||getTown().places.find(p=>p.id===id)?.name||id;

  const queued=()=>getTown().finance.offers.filter(o=>o.status==='queued');

  function safe(fn){return ()=>{try{fn();render();refresh();}catch(error){portfolioCard.append(el('p',error.message,'market-error'));}};}

  function openBusiness(id){if(!getTown().businesses[id])return;view={type:'business',id};shown=true;collapsed=false;render();}

  function renderPortfolio(){const t=getTown(),p=t.investors.find(i=>i.human),count=queued().length;portfolioCard.replaceChildren(el('h3',p?.name||'Your investment firm'));

    portfolioCard.classList.toggle('not-joined',!p);

    if(!p){const join=button('Play as an investor',safe(()=>{if(isBusy())return;onJoin(joinPlayer(getTown()));}),'btn primary');join.disabled=isBusy();portfolioCard.replaceChildren(join);return;}

    else{const f=portfolio(t,p);portfolioCard.append(table(['Portfolio','Current'],[['Cash',money(p.cash)],['Marked holdings',money(f.value)],['Total wealth',money(p.cash+f.value)]]));const list=el('div',undefined,'portfolio-holdings');for(const [id,b]of Object.entries(t.businesses)){if(!b.capital.holdings[p.id])continue;const v=ownership(b,p.id)*valuation(t,id).value,basis=p.basis[id]||0;const row=button('',()=>openBusiness(id),'portfolio-holding');row.append(el('strong',`${name(id)} · ${pct(ownership(b,p.id))}`),el('span',`Current ${money(v)} · paid ${money(basis)}`),el('span',`Gain / loss ${money(v-basis)}`));list.append(row);}portfolioCard.append(list.children.length?list:el('p','No holdings yet.','muted'),button('Holdings & sell',()=>{view={type:'investor',id:p.id};shown=true;render();},'btn small'));

      if(!t.finance.playerActive){const resume=button('Resume investing',safe(()=>t.finance.playerActive=true),'btn small');resume.disabled=isBusy();portfolioCard.append(resume);}else{const watch=button('Watch only',safe(()=>t.finance.playerActive=false),'btn small');watch.disabled=isBusy()||!!pending;portfolioCard.append(watch);}}

    const queue=el('div',undefined,'pitch-entry');queue.append(el('strong',`${count} funding ${count===1?'pitch':'pitches'}`));const list=el('div',undefined,'pitch-list');for(const o of queued()){const row=el('div',undefined,'pitch-row'),b=t.businesses[o.businessId];row.append(button(name(o.businessId),()=>openBusiness(o.businessId),'link'),el('span',`${pct(o.equity)} · from ${money(o.reserve)} · ${b.economy.plan?.label||'Working capital'}`),pitchActions(o));list.append(row);}queue.append(list);portfolioCard.append(queue);

    if(pending)portfolioCard.append(button('Your bidding turn →',()=>{view={type:'business',id:pending.lot.businessId,lotId:pending.lot.id};shown=true;collapsed=false;render();},'btn primary'));

  }

  function metricsTable(id){const t=getTown(),m=scorecard(t,id),v=valuation(t,id);return table(['Metric','Value','Window / definition'],[

    ['Current company value',money(v.value),'Operating value; excludes unspent financing'],['Gross revenue',money(m.gross),`${m.hours}h; sales + production contracts`],['Net revenue',money(m.net),'Gross less cash refunds'],['Revenue growth',pct(m.growth),'Latest 24h vs preceding 24h'],['Gross margin',pct(m.grossMargin),'(Net revenue − product costs) / net revenue'],['Operating profit',money(m.profit),'After wages, costs and refunds'],['Cash balance',money(m.cash),'Current till'],['Cash runway',m.runway===null?'No current burn':`${m.runway.toFixed(1)}h`,'At recent average operating loss'],

    ['Visits / unique visitors',`${m.visitors} / ${m.uniqueVisitors}`,`Trailing ${m.hours}h; visits include returns`],['Paying customers',m.unique,'Unique customers completing a purchase'],['Completed purchases',m.purchases,'Receipt count'],['Visit conversion',pct(m.conversion),'Purchases / shopping visits'],['Average order value',m.aov===null?'—':money(m.aov),'Customer payment per receipt'],['Returning customers',m.returningCustomers,'Customers with an earlier purchase'],['Repeat purchases / rate',`${m.repeat} / ${pct(m.repeatRate)}`,'Repeat receipts / all receipts'],['Failed purchase attempts',m.failed,Object.entries(m.failureReasons).map(([k,v])=>`${k}: ${v}`).join('; ')||'None recorded'],['Capacity overflow',m.unmet,'Requests exceeding available service slots'],['Product returns',m.returns,'Defective purchases brought back'],['Return rate',pct(m.returnRate),`${m.eligible} mature purchases; ${m.pending} still pending`],['Refunds paid / owed',`${money(m.refund)} / ${money(m.refundDue)}`,'Paid in window / current unpaid obligations'],['Intrinsic quality',`${m.quality}/100`,'Product quality at this business'],['Reliability / observed defects',`${pct(m.reliability)} / ${pct(m.defectRate)}`,'Intrinsic success chance / mature receipt failures']]);}

  function history(id){const b=getTown().businesses[id];return details('Hourly performance history',table(['Hour','Gross','Refunds','Net','Profit','Purchases'],b.capital.history.slice(-24).reverse().map(h=>[h.hour,money(h.grossRevenue),money(h.refunds||0),money(h.revenue),money(h.profit),h.customers])));}

  function businessContent(id){const t=getTown(),b=t.businesses[id],p=t.places.find(p=>p.id===id),e=b.economy,box=el('div',undefined,'business-evidence');const type=p.serviceRole||p.category||p.kind;box.append(el('p',`${p.name} is ${type==='office'?'an':'a'} ${type==='books'?'bookstore':type==='clothing'?'clothing store':type==='leisure'?'leisure venue':type} in ${p.neighborhood||'the town'}. It offers ${productNames[e.product].toLowerCase()}. ${e.failed?'The business has closed.':`${t.residents.filter(r=>r.alive&&r.work===id).length} residents work here.`}`,'business-bio'));

    box.append(table(['Business plan','Current state'],[['Funding purpose',e.plan?`${e.plan.label} · ${money(e.plan.cost)} · ${e.plan.stage}`:'Working capital / no active upgrade'],['Owner adaptability / execution',`${e.owner.adaptability}/100 · ${e.owner.discipline}/100`],['Capacity / appeal',`${e.capacity} per hour · ${e.appeal.toFixed(2)}`]]),el('h3','Performance scorecard'),metricsTable(id),history(id),details('Ownership & capital',table(['Holder','Shares','Ownership'],[['Founders',b.capital.founderShares,pct(b.capital.founderShares/shareCount(b))],...Object.entries(b.capital.holdings).filter(([,n])=>n>0).map(([iid,n])=>[name(iid),n,pct(n/shareCount(b))]),['Settlement account',b.capital.marketShares,pct(b.capital.marketShares/shareCount(b))]]),table(['Balance-sheet item','Value'],[['Cash',money(b.till)],['Unspent financing excluded from mark',money(b.capital.restricted)],['Total equity raised',money(b.capital.raised)],['Unpaid refunds',money(scorecard(t,id).refundDue)]])),details('Owner execution history',table(['Hour','Event','Action','Product'],e.history.slice(-20).reverse().map(h=>[h.hour,h.kind,h.type||h.strategy||'',h.product||'']))));return box;}

  function auctionContent(lot){const box=el('div',undefined,'auction-bidding');box.append(el('h3','Live bidding'),table(['Auction','Current'],[['Fixed stake',`${pct(lot.equity)} · ${lot.shares} shares`],['Opening / next bid',`${money(lot.reserve)} / ${money(nextPrice(lot))}`],['High bid',lot.highBid?`${money(lot.highBid)} · ${name(lot.highBidder)}`:'No bid yet'],['Next turn',lot.next?name(lot.next):lot.status],['Result',lot.status==='funded'?`${name(lot.investorId)} won for ${money(lot.amount)}`:lot.status]]));

    const tape=el('div',undefined,'bid-scroll');tape.append(table(['Turn','Firm','Action','Amount'],lot.turns.map((r,n)=>[n+1,name(r.investorId),r.action==='bid'?'Bid':`Pass${r.reason?' · '+r.reason:''}`,r.action==='bid'?money(r.amount):'—'])));box.append(tape);

    if(pending?.lot.id===lot.id){const controls=el('div',undefined,'bid-controls');controls.append(el('strong',`${pending.investor.name}: your turn`),el('p','No decision is made until you bid or pass.','muted'));const bid=button(`Bid ${money(nextPrice(lot))}`,()=>resolve('bid'),'btn primary');bid.disabled=nextPrice(lot)>bidLimit(getTown(),pending.investor,lot);controls.append(bid,button('Pass this auction',()=>resolve('pass')));box.append(controls);}return box;}

  function resolve(action){if(!pending)return;const fn=pending.resolve;pending=null;fn(action);render();}

  function pitchActions(lot){const controls=el('div',undefined,'pitch-actions');for(const [label,action]of [['Take pitch','take'],['Pass','pass']]){const b=button(label,()=>runPlaza(lot.id,action),'btn small');b.setAttribute('aria-label',`${label} from ${name(lot.businessId)}`);b.disabled=isBusy();controls.append(b);}return controls;}

  function queueContent(){const t=getTown(),box=el('div',undefined,'queue-content');box.append(el('p','Choose a business to hear its pitch, or pass and let rival investors compete for that round. Taking a pitch commits no cash.','business-bio'));const rows=queued().map(o=>[button(name(o.businessId),()=>openBusiness(o.businessId),'link'),pct(o.equity),money(o.reserve),t.businesses[o.businessId].economy.plan?.label||'Working capital',t.finance.playerActive?pitchActions(o):'Rivals are considering it']);box.append(table(['Pitching business','Stake','Opening','Purpose','Your choice'],rows),el('h3','Investment firms'),table(['Firm','Cash','Current holdings'],t.investors.map(i=>[button(i.name,()=>{view={type:'investor',id:i.id};render();},'link'),money(i.cash),money(portfolio(t,i).value)])));return box;}

  function investorContent(id){const t=getTown(),i=t.investors.find(i=>i.id===id),f=portfolio(t,i),box=el('div',undefined,'queue-content');box.append(el('p',i.strategy,'business-bio'),table(['Performance','Value'],[['Cash',money(i.cash)],['Marked holdings',money(f.value)],['Remaining acquisition cost',money(f.cost)],['Unrealized gain / loss',money(f.unrealized)],['Realized gain / loss',money(f.realized)],['Total wealth',money(i.cash+f.value)]]));const rows=[];for(const [bid,b]of Object.entries(t.businesses)){const shares=b.capital.holdings[id]||0;if(!shares)continue;const actions=el('div',undefined,'sell-actions');if(i.human)for(const [label,n]of [['Sell half',Math.max(1,Math.floor(shares/2))],['Sell all',shares]]){const sell=button(`${label} · ${money(liquidationQuote(t,i,bid,n))}`,safe(()=>liquidate(t,i,bid,n)),'btn small');sell.disabled=isBusy();actions.append(sell);}rows.push([button(name(bid),()=>openBusiness(bid),'link'),pct(ownership(b,id)),money(ownership(b,id)*valuation(t,bid).value),money(i.basis[bid]||0),actions]);}box.append(table(['Holding','Stake','Current value','Paid','Liquidate now'],rows),details('Cash transfer history',table(['Hour','Type','From','To','Cash'],t.finance.ledger.filter(x=>x.from===id||x.to===id).slice(-40).reverse().map(x=>[x.hour,x.kind,name(x.from),name(x.to),money(x.amount)]))));return box;}

  function render(){renderPortfolio();onQueueUpdate?.(getTown());if(shown){if(closingTimer){clearTimeout(closingTimer);closingTimer=null;}dock.classList.remove('leaving');dock.classList.add('entering');dock.hidden=false;}else if(!dock.hidden&&!closingTimer){dock.classList.remove('entering');dock.classList.add('leaving');closingTimer=setTimeout(()=>{closingTimer=null;if(!shown){dock.hidden=true;dock.classList.remove('leaving');}},320);} app.classList.toggle('business-open',shown);app.classList.toggle('business-collapsed',collapsed);if(!shown)return;

    const t=getTown(),lot=view.lotId?t.finance.offers.find(o=>o.id===view.lotId):null,title=view.type==='business'?name(view.id):view.type==='investor'?name(view.id):'Investor Plaza',header=el('header',undefined,'business-header');header.append(el('h2',title),el('span',lot?`${lot.status.toUpperCase()} · ${pct(lot.equity)} equity`:'KP Town','business-state'),button('Close',()=>{shown=false;render();},'btn small'));

    const body=el('div',undefined,view.type==='business'&&lot?'business-body with-auction':'business-body');if(view.type==='business'){body.append(businessContent(view.id));if(lot)body.append(auctionContent(lot));}else body.append(view.type==='investor'?investorContent(view.id):queueContent());body.hidden=collapsed;dock.replaceChildren(header,body);

  }

  render();

  return {playerWin(lot){if(celebrated.has(lot.id)||lot.status!=='funded'||!getTown().investors.find(i=>i.id===lot.investorId)?.human)return;celebrated.add(lot.id);dock.dataset.playerWinCount=String(celebrated.size);dock.dataset.lastWinningLot=lot.id;onWin?.();if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const burst=el('div',undefined,'win-confetti');burst.setAttribute('aria-hidden','true');const bounds=dock.getBoundingClientRect();burst.style.left=`${bounds.left+bounds.width*.65}px`;burst.style.top=`${bounds.top+35}px`;for(let n=0;n<18;n++){const piece=el('i');piece.style.setProperty('--dx',`${(n%7-3)*26}px`);piece.style.setProperty('--dy',`${50+n%4*18}px`);piece.style.setProperty('--spin',`${(n%2?1:-1)*(160+n*17)}deg`);piece.style.background=['#d1b45e','#6ca98c','#dedbd0'][n%3];piece.style.animationDelay=`${n%3*.03}s`;burst.append(piece);}document.body.append(burst);setTimeout(()=>burst.remove(),1200);},select(id){if(id?.startsWith('business:')){const pid=id.slice(9),p=getTown().places.find(p=>p.id===pid);if(p?.investorId&&!getTown().businesses[pid]){const i=getTown().investors.find(i=>i.id===p.investorId);if(i){view={type:'investor',id:i.id};shown=true;collapsed=false;}}else if(getTown().businesses[pid]){view={type:'business',id:pid};shown=true;collapsed=false;}}else if(getTown().investors.some(i=>i.id===id)){view={type:'investor',id};shown=true;collapsed=false;}render();},renderDetail(){render();return false;},enhance(){const section=[...document.querySelectorAll('#inspector .section')].find(s=>s.querySelector('h3')?.textContent==='Businesses');if(!section)return;for(const label of section.querySelectorAll('.bar-label')){const p=getTown().places.find(p=>label.textContent.startsWith(p.name+' · '));if(!p)continue;const link=button(label.textContent,()=>openBusiness(p.id),'business-link');label.replaceChildren(link);}const firms=el('div',undefined,'section');firms.append(el('h3','Investment firms'));for(const i of getTown().investors){const row=el('p');row.append(button(i.name,()=>{view={type:'investor',id:i.id};shown=true;collapsed=false;render();},'link'));firms.append(row);}section.after(firms);},pitchWaiting(){render();},async marketUpdate(){const t=getTown();if(!t.finance.playerActive)return;const lot=t.finance.offers.find(o=>o.id===t.finance.active);if(lot?.playerDeclined)return;if(lot&&lastFocused!==lot.id){view={type:'business',id:lot.businessId,lotId:lot.id};shown=true;lastFocused=lot.id;focusBusiness(lot.businessId);}render();if(lot)await new Promise(r=>setTimeout(r,t.finance.playerActive?120:70));},humanTurn(lot,investor){return new Promise(resolve=>{pending={lot,investor,resolve};render();});}};

}

