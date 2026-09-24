// Original Jevton center preserved. Only outer homes move to make room for additions.
export function expandTown(t){
  const additions=[['Marina Threads','market','clothing'],['North Beach Books','market','books'],['Pier Arcade','tavern','leisure'],['Richmond Outfitters','market','clothing'],['Sunset Stories','market','books'],['Mission Play Lab','tavern','leisure'],['Fog & Fabric','market','clothing'],['City Lightshelf','market','books'],['Bayfront Funhouse','tavern','leisure'],['Pacific Pantry','market'],['Mission Kitchen','market'],['Sunset Clinic','clinic'],['Bay Makers','factory'],['Northside Workshop','factory'],['Mission Groves','farm'],['Bay Learning','school']];
  for(const p of t.places.filter(p=>p.kind==='home'&&p.x>=34))p.x+=8;
  const palettes={market:['#d9a441','#e0b25a','#b69b76','#bd8b9d'],tavern:['#a0563f','#5b3a6b','#986c5c'],clinic:['#dfe3e6'],factory:['#8a6f5a','#6f6a64'],farm:['#9cb86a'],school:['#c9b56a']};
  const slots=[];for(const z of [1.5,9.5,17.5,25.5])for(const dz of [0,3.2])for(const x of [33.5,37])slots.push([x,z+dz]);
  const original=t.residents.slice(),roles={market:'trader',tavern:'musician',clinic:'doctor',factory:'builder',farm:'farmer',school:'teacher'};
  const homes=[];for(let n=0;n<8;n++){const p={id:`extension-home${n}`,kind:'home',name:`House ${39+n}`,x:[2,5,8,12,15,18,24,27][n],z:45,w:2,d:2,floors:1+n%2,color:['#f1ede4','#d9a8a0','#bcd1e6','#9a9c6e'][n%4]};homes.push(p);t.places.push(p);}
  for(const [n,[name,kind,category]]of additions.entries()){const id=`city${n+23}`,[x,z]=slots[n],palette=palettes[kind];t.places.push({id,name,kind,category,x,z,w:n%3===0?2.6:2.9,d:n%3===0?2.1:2.3,floors:['factory','school','clinic'].includes(kind)?2:kind==='tavern'?1+n%2:1,color:palette[n%palette.length]});t.businesses[id]={till:400,price:1,sales:0,hourSales:0,shortfalls:0};
    for(let k=0;k<2;k++){const r=structuredClone(original.find(r=>r.job===roles[kind])),serial=n*2+k;Object.assign(r,{id:`r${120+serial}`,name:`${['Ari','Lea','Remy','Nova','Jules','Imani','Sasha','Tess'][serial%8]} ${['Navarro','Mercer','Huang','Brooks'][Math.floor(serial/8)]}`,age:22+serial,work:id,home:homes[Math.floor(serial/4)].id,target:homes[Math.floor(serial/4)].id,log:[{hour:0,kind:'event',text:`Moved to town to work at ${name}.`}]});t.residents.push(r);}
  }
  // Office colors are interpretations of the official sites; see BRAND-REFERENCES.md.
  const offices=[['i0','Sapling Capital','home0','#4d997a'],['i1','Endless Rounds Capital','home5','#657ba4'],['i2','Excel Partners','home8','#e7e6e2'],['i5','You','home14','#8ba4bd'],['i3','Survive Capital',null,'#931e25'],['i4','Contrarian Fund',null,'#287f89'],['i6','A16Fees',null,'#b99958']];
  for(const [n,[iid,name,homeId,color]]of offices.entries()){let x,z;if(homeId){const h=t.places.find(p=>p.id===homeId);({x,z}=h);h.x=32+n*3;h.z=45;}else [x,z]=[[34,34],[37,34],[37,37]][n-4];t.places.push({id:`firm-${iid}`,kind:'office',name,investorId:iid,x,z,w:2,d:2,floors:2+n%2,color});}
  // Integrate established identities across twelve compact commercial blocks.
  const old=t.places.filter(p=>t.businesses[p.id]&&!p.id.startsWith('city')&&!p.category),added=t.places.filter(p=>t.businesses[p.id]&&(p.id.startsWith('city')||p.category));
  const mixed=[];for(let n=0;n<Math.max(old.length,added.length);n++){if(old[n])mixed.push(old[n]);if(added[n])mixed.push(added[n]);}
  const blocks=[[12,1.5,8],[24,1.5,6],[12,9.5,8],[2,17,7],[12,17,8],[2,25,7],[12,25,8],[24,25,6],[33.5,1.5,5.5],[33.5,9.5,5.5],[33.5,17.5,5.5],[33.5,25.5,5.5]];
  mixed.forEach((p,n)=>{const [x,z,width]=blocks[Math.floor(n/3)],slot=n%3;p.w=slot===2?(width<6?2.5:3):width<7?2.6:3.1;p.d=p.kind==='farm'?2.5:2.3;p.x=x+(slot===1?width-2.6:0);p.z=z+(slot===2?3.2:0);});
  Object.assign(t.places.find(p=>p.id==='park13'),{x:24,z:17,w:7,d:5});
  const lakeHomes=t.places.filter(p=>p.kind==='home'&&p.x>=42&&p.z>=18&&p.z<=21);
  lakeHomes.forEach((p,n)=>{p.x=24+(n%2)*3;p.z=34+Math.floor(n/2)*3;});
  t.places.push({id:'neighborhood-lake',kind:'park',name:'Neighborhood lake',x:42,z:17.8,w:5,d:5,floors:0,color:'#5f9e57'});
  // Place each fund in a separate block; restore homes used by the earlier layout.
  for(const [id,x,z]of [['home0',2,2],['home5',8,5],['home8',8,34]])Object.assign(t.places.find(p=>p.id===id),{x,z});
  const fundBlocks={'i0':0,'i1':5,'i2':3,'i3':8,'i4':2,'i6':11};
  for(const p of t.places.filter(p=>p.investorId)){if(p.investorId==='i5'){Object.assign(p,{x:18,z:34});continue;}const [x,z,width]=blocks[fundBlocks[p.investorId]];Object.assign(p,{x:x+width-2.6,z:z+3.2,w:2.3,d:2});}
  const occupiedBlocks=new Set(Object.values(fundBlocks));
  for(const [n,[x,z,width]]of blocks.entries())if(!occupiedBlocks.has(n))t.places.push({id:`infill-home${n}`,name:`Courtyard House ${n+1}`,kind:'home',x:x+width-2.6,z:z+3.2,w:2.3,d:2,floors:1+n%2,color:['#efe3c2','#a9503f','#b8c4a2','#bcd1e6'][n%4]});
  for(const [n,[x,z]]of [[34,34],[37,34],[34,37],[37,37],[2,40],[5,40],[8,40],[12,40],[15,40],[18,40],[24,40],[27,40],[34,40],[37,40]].entries())t.places.push({id:`outer-infill${n}`,kind:'home',name:`Garden House ${n+1}`,x,z,w:2,d:2,floors:1+(n%3===0?1:0),color:['#f1ede4','#a9503f','#bcd1e6','#9a9c6e','#d2b48c'][n%5]});
  // Existing, fully simulated services trade places with homes; no invented child customers.
  for(const [businessId,homeId,role]of [['city34','home22','neighborhood clinic'],['city38','home35','neighborhood school'],['city32','home2','small grocery'],['city33','extension-home2','neighborhood cafe']]){const business=t.places.find(p=>p.id===businessId),home=t.places.find(p=>p.id===homeId),old={x:business.x,z:business.z,w:business.w,d:business.d};Object.assign(business,{x:home.x,z:home.z,w:home.w,d:home.d,serviceRole:role});Object.assign(home,old);}
  return t;
}
