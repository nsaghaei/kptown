// A reproducible larger customer base, with housing and paid work for every resident.
const unit=(n,salt)=>{let x=Math.imul(n+37,salt)|0;x^=x>>>16;return (x>>>0)/4294967296;};
export function growPopulation(t){
  const initial=t.residents.slice(),homes=t.places.filter(p=>p.kind==='home');
  for(const [n,p]of homes.entries()){p.floors=Math.max(p.floors||1,n%3===0?3:2);p.capacity=p.floors*4;}
  for(const [n,source]of initial.entries()){
    const id=initial.length+n,r=structuredClone(source),a=unit(id,2654435761),b=unit(id,1597334677),c=unit(id,2246822519);
    Object.assign(r,{id:`r${id}`,name:`${['Alex','Sofia','Mina','Arun','Luca','Zara','Owen','Nadia','Emil','Esme','Kira','Ravi','Mara','Iris','Leon','Asha','Ben','Talia'][n%18]} ${['Chen','Silva','Khan','Rivera','Okoye','Sato','Reed','Patel','Costa'][Math.floor(n/18)]}`,age:19+Math.floor(a*57),money:25+Math.floor(b*116),energy:55+Math.floor(c*46),hunger:Math.floor(a*55),health:65+Math.floor(b*36),mood:45+Math.floor(c*51),activity:'rest',log:[{hour:0,kind:'event',text:'Settled in KP Town with a job and a home.'}]});
    t.residents.push(r);
  }
  for(const [n,r]of t.residents.entries()){
    const home=homes[n%homes.length];r.home=home.id;r.target=home.id;
    r.traits={thrift:Math.round(unit(n,2654435761)*100),novelty:Math.round(unit(n,1597334677)*100),sociability:Math.round(unit(n,2246822519)*100),nightOwl:n%6===0};
    r.wageFactor=.85+unit(n,3266489917)*.4;r.appetite=.85+unit(n,668265263)*.35;
  }
  t.basePopulation=t.residents.length;return t;
}
