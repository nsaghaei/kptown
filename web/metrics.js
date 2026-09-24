// Receipt-backed quality, return accounting and the same evidence for AI and player.
const sum=(a,k)=>a.reduce((n,x)=>n+(x[k]||0),0);
export function captureReceipts(t){
  t.economy.receipts||=[];t.economy.refunds||=[];t.economy.nextReceipt||=1;
  for(const [id,b]of Object.entries(t.businesses))for(const sale of b.economy.pendingReceipts.splice(0)){
    const serial=t.economy.nextReceipt++,roll=((Math.imul(serial,1103515245)+12345)>>>0)/4294967296;
    const defective=roll>b.economy.reliability;
    t.economy.receipts.push({id:`receipt-${serial}`,businessId:id,customerId:sale.buyer,hour:t.hour,gross:sale.amount,paid:sale.paid,product:b.economy.product,quality:b.economy.quality,reliability:b.economy.reliability,defective,eligibleAt:t.hour+2,returned:false,refunded:0,subsidyRefunded:0,refundDue:0});
  }
}
export function processReturns(t){
  const visits=new Set();
  for(const receipt of t.economy.receipts||[]){
    if(!receipt.defective||receipt.eligibleAt>t.hour)continue;
    const b=t.businesses[receipt.businessId],r=t.residents.find(r=>r.id===receipt.customerId);
    if(!receipt.returned){receipt.returned=true;receipt.returnHour=t.hour+1;receipt.reason='Defective purchase';receipt.refundDue=receipt.paid;
      if(r?.alive){r.activity='return';r.target=receipt.businessId;r.mood=Math.max(0,r.mood-4);r.avoid||={};r.avoid[receipt.businessId]=(r.avoid[receipt.businessId]||0)+1;r.log.push({hour:t.hour,kind:'warning',text:`Returned a defective ${receipt.product} purchase to ${t.places.find(p=>p.id===receipt.businessId).name}; original payment $${receipt.paid}.`});visits.add(`${r.id}:${receipt.businessId}`);}
      b.economy.reputation=Math.max(.2,b.economy.reputation-.015);
    }
    const due=receipt.paid-receipt.refunded,amount=Math.min(Math.floor(b.till),due);
    if(amount>0){b.till-=amount;if(r?.alive)r.money+=amount;else t.treasury+=amount;receipt.refunded+=amount;
      t.economy.refunds.push({receiptId:receipt.id,businessId:receipt.businessId,customerId:receipt.customerId,hour:t.hour+1,amount,reason:receipt.reason});}
    receipt.refundDue=receipt.paid-receipt.refunded;
    if(receipt.refunded>receipt.paid||receipt.refundDue<0)throw new Error('Invalid refund accounting');
  }
  for(const key of visits){const id=key.split(':')[1];t.businesses[id].economy.visits.push({hour:t.hour+1,customerId:key.split(':')[0],kind:'return'});}
}
export function scorecard(t,id){
  const b=t.businesses[id],e=b.economy,start=t.hour-24,history=b.capital.history.filter(h=>h.hour>start),receipts=(t.economy.receipts||[]).filter(r=>r.businessId===id),recent=receipts.filter(r=>r.hour>start),returns=receipts.filter(r=>r.returned&&r.returnHour>start),mature=recent.filter(r=>r.eligibleAt<=t.hour),refunds=(t.economy.refunds||[]).filter(r=>r.businessId===id&&r.hour>start),visits=e.visits.filter(v=>v.hour>start),failed=e.failures.filter(f=>f.hour>start&&!['browsing','already satisfied','skipped'].includes(f.reason)),purchases=recent.length,unique=new Set(recent.map(r=>r.customerId)).size;
  const gross=sum(history,'grossRevenue'),refund=sum(refunds,'amount'),net=gross-refund,cogs=sum(history,'cogs'),profit=sum(history,'profit'),past=b.capital.history.filter(h=>h.hour<=start&&h.hour>start-24),pastNet=sum(past,'revenue'),growth=past.length===24&&pastNet>0?(net-pastNet)/pastNet:null;
  const repeated=recent.filter(r=>receipts.some(old=>old.customerId===r.customerId&&old.hour<r.hour)),repeat=repeated.length;
  return {hours:Math.min(24,t.hour),gross,net,growth,grossMargin:net>0?(net-cogs)/net:null,profit,cash:b.till,runway:profit<0?b.till/(-profit/Math.max(1,history.length)):null,visitors:visits.length,uniqueVisitors:new Set(visits.map(v=>v.customerId)).size,returningCustomers:new Set(repeated.map(r=>r.customerId)).size,unique,purchases,conversion:visits.filter(v=>v.kind==='shop').length?purchases/visits.filter(v=>v.kind==='shop').length:null,aov:purchases?sum(recent,'paid')/purchases:null,repeatRate:purchases?repeat/purchases:null,failed:failed.length,failureReasons:failed.reduce((o,f)=>(o[f.reason]=(o[f.reason]||0)+1,o),{}),unmet:sum(history,'unmet'),returns:returns.length,returnRate:mature.length?mature.filter(r=>r.returned).length/mature.length:null,eligible:mature.length,pending:recent.length-mature.length,refund,refundDue:sum(receipts,'refundDue'),quality:e.quality,reliability:e.reliability,defectRate:mature.length?mature.filter(r=>r.defective).length/mature.length:null,repeat,stockouts:sum(history,'unmet')};
}
export function metricContext(t,id){const m=scorecard(t,id);return `${m.hours}h: gross $${Math.round(m.gross)}, net $${Math.round(m.net)}, profit $${Math.round(m.profit)}; ${m.visitors} visits, ${m.purchases} purchases, ${m.unique} customers, repeat ${m.repeatRate===null?'unknown':Math.round(m.repeatRate*100)+'%'}. ${m.failed} failed buys, ${m.unmet} overflow. ${m.returns} returns/${m.eligible} eligible, refunds $${m.refund}, owed $${m.refundDue}. Quality ${m.quality}/100, reliability ${Math.round(m.reliability*100)}%.`;}
