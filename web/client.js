export function validateAnswer(question,answer) {
  if(!answer || answer.type!==question.type) throw new Error('Model returned the wrong decision type');
  if(!Number.isFinite(answer.confidence)||answer.confidence<0||answer.confidence>1) throw new Error('Invalid model confidence');
  if(question.type==='choice') {
    if(!Object.hasOwn(question.criteria,answer.choice)) throw new Error('Model selected an unavailable action');
    const values=Object.keys(question.criteria).map(k=>answer.probabilities?.[k]);
    if(values.some(n=>!Number.isFinite(n)||n<0||n>1)||Math.abs(values.reduce((a,b)=>a+b,0)-1)>.015) throw new Error('Invalid choice probabilities');
  } else if(question.type==='noul') {
    if(!Number.isFinite(answer.noul)||answer.noul<0||answer.noul>1) throw new Error('Invalid yes/no probability');
  } else if(!Number.isFinite(answer.score)||answer.score<0||answer.score>question.criteria.length-1) throw new Error('Invalid score');
}
export function makeJudge(onUsage=()=>{}) {
  return async function judge(requests,phase) {
    const response=await fetch('/api/decide',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({requests,phase}),signal:AbortSignal.timeout(240000)});
    const payload=await response.json();
    if(!response.ok) throw new Error(payload.error||`Local inference failed (${response.status})`);
    const results={};
    for(const request of requests) {
      const answers=payload.results?.[request.id];
      for(const [key,question] of Object.entries(request.questions)) validateAnswer(question,answers?.[key]);
      results[request.id]=answers;
    }
    onUsage(payload.usage);
    return results;
  };
}
