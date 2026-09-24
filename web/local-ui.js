import {money,payroll,cashFloor,ownership,shareCount,totalCash} from './investors.js';
const el=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
const pct=n=>`${(n*100).toFixed(1)}%`;
function metrics(rows) {
  const dl=el('dl',undefined,'metrics');
  for(const [name,value] of rows){const row=el('div');row.append(el('dt',name),el('dd',String(value)));dl.append(row);}return dl;
}
function section(title,...children){const s=el('section',undefined,'section');s.append(el('h3',title),...children);return s;}
function button(text,action,className='btn'){const b=el('button',text,className);b.type='button';b.addEventListener('click',action);return b;}
function answerView(answer){
  if(!answer)return el('p','No decision yet.','muted');
  const box=el('div',undefined,'decision');
  box.append(el('p',answer.type==='choice'?`Choice: ${answer.choice}`:answer.type==='noul'?`Probability: ${pct(answer.noul)}`:`Score: ${answer.score.toFixed(2)}`));
  if(answer.probabilities){for(const [key,value]of Object.entries(answer.probabilities)){
    const row=el('div',undefined,'probability-row');row.append(el('span',key),el('span',pct(value)));box.append(row);
  }}return box;
}
export function installUI({getTown,select,inspector}) {
  let lastId;
  const topbar=document.querySelector('.topbar');
  const investorButton=button('Investors',()=>select('i0'));
  investorButton.id='investors';topbar.append(investorButton);
  const runtime=el('span','Loading local Laya…','local-runtime');runtime.id='local-runtime';runtime.setAttribute('role','status');topbar.append(runtime);
  fetch('/api/health').then(r=>r.json()).then(h=>{runtime.textContent=`Local Laya · ${h.device==='cuda'?'GPU':'CPU'}`;runtime.title=`${h.model} · ${h.hardware}`;}).catch(()=>{runtime.textContent='Laya unavailable';});
  function back(){return button('← Town',()=>select(undefined),'btn small');}
  function renderInvestor(investor){
    const t=getTown(),header=el('header');header.append(back(),el('h2',investor.name),el('p',`Investor · at ${t.places.find(p=>p.id===investor.location)?.name||'Bank'}`,'lede'));
    const portfolio=el('div',undefined,'finance-list');
    for(const [id,b]of Object.entries(t.businesses))if(ownership(b,investor.id)>0){
      portfolio.append(button(`${t.places.find(p=>p.id===id).name} · ${pct(ownership(b,investor.id))}`,()=>select(`business:${id}`),'finance-row'));
    }
    if(!portfolio.children.length)portfolio.append(el('p','No investments yet.','muted'));
    const history=el('ol',undefined,'life');
    for(const entry of [...investor.log].reverse().slice(0,30)){
      const li=el('li');li.append(el('span',`Hour ${entry.hour} · ${t.places.find(p=>p.id===entry.businessId).name}`,'when'),answerView(entry));history.append(li);
    }
    const ledger=ledgerView(t.finance.ledger.filter(tx=>tx.from===investor.id||tx.to===investor.id));
    inspector.replaceChildren(header,section('Right now',el('p',investor.activity),metrics([
      ['Cash',money(investor.cash)],['Reserve',money(investor.reserve)],['Invested',money(investor.invested)],['Dividends received',money(investor.dividends)],['Laya decisions',investor.decisions],['Maximum investment',money(investor.maxTicket)]
    ])),section('Approach',el('p',investor.strategy)),section('Portfolio',portfolio),section('Decisions',history.children.length?history:el('p','The investor reviews offers as businesses request funding.','muted')),section('Transfers',ledger));
  }
  function ledgerView(transfers){
    const list=el('ol',undefined,'life'),t=getTown(),name=id=>t.investors.find(i=>i.id===id)?.name||t.places.find(p=>p.id===id)?.name||id;
    for(const tx of [...transfers].reverse().slice(0,30)){
      const item=el('li');item.append(el('span',`Hour ${tx.hour} · ${tx.kind}`,'when'),el('p',`${name(tx.from)} → ${name(tx.to)} · ${money(tx.amount)}`),el('p',`${money(tx.fromBefore)} → ${money(tx.fromAfter)} / ${money(tx.toBefore)} → ${money(tx.toAfter)}`,'muted'));list.append(item);
    }return list.children.length?list:el('p','No transfers yet.','muted');
  }
  function renderBusiness(id){
    const t=getTown(),b=t.businesses[id],p=t.places.find(p=>p.id===id),header=el('header');
    header.append(back(),el('h2',p.name),el('p',`${p.kind} · ${t.residents.filter(r=>r.alive&&r.work===id).length} living staff`,'lede'));
    const offers=el('div',undefined,'finance-list');
    for(const offer of [...t.finance.offers].filter(o=>o.businessId===id).reverse()){
      const row=el('div',undefined,'offer');row.append(el('p',`${money(offer.amount)} for ${pct(offer.equity)} · ${offer.status}`),el('p',`Hour ${offer.hour} · request probability ${pct(offer.requestProbability)}`,'muted'));
      for(const review of offer.reviews)row.append(answerView(review));offers.append(row);
    }
    const holders=Object.entries(b.capital.holdings).map(([iid])=>[t.investors.find(i=>i.id===iid).name,pct(ownership(b,iid))]);
    inspector.replaceChildren(header,section('Business',metrics([
      ['Cash in till',money(b.till)],['Prices',pct(b.price)],['Customers last hour',b.hourSales],['Payroll at normal effort',money(payroll(t,id))],['Operating buffer',money(cashFloor(t,id))],['Missed payrolls',b.shortfalls],['Capital raised',money(b.capital.raised)],['Dividends paid',money(b.capital.dividends)]
    ])),section('Ownership',metrics([['Existing owners',pct(b.capital.founderShares/shareCount(b))],...holders])),section('Funding decision',answerView(b.capital.lastDecision)),section('Offers',offers.children.length?offers:el('p','No funding request yet.','muted')),section('Transfers',ledgerView(t.finance.ledger.filter(tx=>tx.to===id||tx.from===id))));
  }
  function renderDetail(id){
    if(id!==lastId)inspector.scrollTop=0;
    lastId=id;
    const t=getTown(),investor=t.investors?.find(i=>i.id===id);
    if(investor){renderInvestor(investor);return true;}
    if(id?.startsWith('business:')&&t.businesses[id.slice(9)]){renderBusiness(id.slice(9));return true;}
    return false;
  }
  function enhance(id){
    const t=getTown();
    if(id){
      const resident=t.residents.find(r=>r.id===id);
      if(resident?.lastAnswers){const details=el('details');details.append(el('summary','Latest Laya decisions'));for(const [name,answer]of Object.entries(resident.lastAnswers))details.append(section(name,answerView(answer)));inspector.append(details);}
      return;
    }
    const header=inspector.querySelector('header');
    if(header){const credit=el('p','Chizi’s town · local Laya + autonomous investors','muted credit');header.append(credit);}
    const list=el('div',undefined,'finance-list');
    for(const investor of t.investors)list.append(button(`${investor.name} · ${money(investor.cash)} available`,()=>select(investor.id),'finance-row'));
    const summary=section('Investors',list,el('p',`${t.finance.offers.filter(o=>o.status==='funded').length} funded · ${money(t.investors.reduce((n,i)=>n+i.invested,0))} invested`,'muted'));
    const businessSection=[...inspector.querySelectorAll('section')].find(s=>s.querySelector('h3')?.textContent==='Businesses');
    if(businessSection){
      businessSection.before(summary);
      const businesses=el('div',undefined,'finance-list');
      for(const [bid,b]of Object.entries(t.businesses).sort((a,b)=>b[1].till-a[1].till)){
        businesses.append(button(`${t.places.find(p=>p.id===bid).name} · ${money(b.till)} · ${pct(b.price)}`,()=>select(`business:${bid}`),'finance-row'));
      }
      businessSection.replaceChildren(el('h3','Businesses'),businesses);
    }
    const audit=el('details');audit.append(el('summary','Financing rules'),el('p','Businesses below three normal payrolls (at least $120) may ask Laya to raise equity. Rowan independently evaluates each offer. Founders retain at least 51%. Investments conserve cash; profitable businesses can distribute a portion of daily profit while preserving their operating buffer. Laya may decline.'));
    inspector.append(audit);
  }
  return {renderDetail,enhance};
}
