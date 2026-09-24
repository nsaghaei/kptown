// Quiet hours have no model calls, transactions, auctions or disaster rolls.
export function skipSleepingHours(t){
  const h=t.hour%24;if(h<3||h>=6||t.finance.playerActive&&(t.finance.active||t.finance.offers.some(o=>['queued','open'].includes(o.status))))return false;
  const from=t.hour,to=t.hour+(6-h),hours=to-from;
  for(const r of t.residents.filter(r=>r.alive)){r.activity='rest';r.target=r.home;delete r.lateVisit;r.energy=Math.min(100,r.energy+24*hours);r.health=Math.min(100,r.health+(r.hunger>70?0:4*hours));r.hunger=Math.min(100,r.hunger+hours);r.mood=Math.min(100,r.mood+hours);r.sick=Math.max(0,r.sick-hours);}
  for(const b of Object.values(t.businesses))for(let hour=from+1;hour<=to;hour++){b.capital.history.push({hour,revenue:0,grossRevenue:0,refunds:0,cogs:0,unmet:0,profit:0,customers:0,skipped:true});if(b.capital.history.length>48)b.capital.history.shift();}
  t.sleepSkips||=[];t.sleepSkips.push({from,to});t.hour=to;return true;
}
