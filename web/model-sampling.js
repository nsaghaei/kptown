// Sample the actual local model distribution for diverse consumer/owner behavior.
// A stable entity/hour key keeps runs reproducible without shifting environmental RNG.
export function sampleModel(answer,key){
  if(answer?.type!=='choice')return answer;
  let seed=2166136261;for(const ch of key)seed=Math.imul(seed^ch.charCodeAt(0),16777619);
  seed=Math.imul(seed^(seed>>>16),0x85ebca6b);seed=Math.imul(seed^(seed>>>13),0xc2b2ae35);seed^=seed>>>16;
  let u=((seed>>>0)+.5)/4294967296,total=0;
  const entries=Object.entries(answer.probabilities),sum=entries.reduce((n,[,p])=>n+p,0);
  for(const [choice,p]of entries){total+=p/sum;if(u<=total)return {...answer,modelTopChoice:answer.choice,choice,selection:'sampled local Laya probabilities'};}
  return answer;
}
