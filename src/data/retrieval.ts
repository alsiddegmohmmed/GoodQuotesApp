import type { Library, Highlight } from './personalLibrary';
import { words } from './connections.ts';

export type Candidate = { id: string; bookId: string; title: string; author: string; text: string; note: string };
export type RetrievalPlan = { mode: 'connect' | 'discuss'; question: string; anchorId: string | null; candidates: Candidate[]; eligibleCount: number };
const pairKey=(a:string,b:string)=>JSON.stringify([a,b].sort());

/** Scan the full local library, then bound the exact excerpts sent for semantic ranking. */
export function planRetrieval(library: Library, mode: 'connect' | 'discuss', question: string, includeNotes: boolean, preferredId?: string): RetrievalPlan {
  const books=new Map(library.books.map(b=>[b.id,b]));
  const eligible=library.highlights.filter(h=>{
    const b=books.get(h.bookId);
    return b && b.title.trim() && b.author.trim() && b.title.length<=500 && b.author.length<=500 &&
      h.id.length<=180 && b.id.length<=180 && h.text.trim() && h.text.length<=6000 &&
      (!includeNotes || (h.note?.length??0)<=3000) && (h.location?.length??0)<=500 && (h.sourceDate?.length??0)<=300;
  });
  const terms=words(question);
  const prior=new Set((library.connections??[]).map(c=>pairKey(c.leftId,c.rightId)));
  const reflected=new Set((library.connections??[]).filter(c=>c.state==='saved'&&c.reflection?.trim()).flatMap(c=>[c.leftId,c.rightId]));
  const textFor=(h:Highlight)=>h.text+' '+(includeNotes?h.note??'':'')+' '+(books.get(h.bookId)?.title??'')+' '+(books.get(h.bookId)?.author??'');
  const termsFor=new Map(eligible.map(h=>[h.id,words(textFor(h))]));
  const freq=new Map<string,number>();
  for(const ts of termsFor.values())for(const w of ts)freq.set(w,(freq.get(w)??0)+1);
  const overlap=(h:Highlight, query:Set<string>)=>[...query].reduce((s,w)=>s+(termsFor.get(h.id)?.has(w)?Math.log(1+eligible.length/(freq.get(w)??1)):0),0);
  const recent=[...eligible].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||a.id.localeCompare(b.id));
  const ranks=new Map(recent.map((h,i)=>[h.id,i]));
  const score=(h:Highlight)=>overlap(h,terms)+Number(!!h.favorite)*0.45+Number(reflected.has(h.id))*0.25+
    Number(books.get(h.bookId)?.status==='Reading')*0.2+0.1/(1+(ranks.get(h.id)??0));
  const ranked=[...eligible].sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id));
  const canAnchor=(h:Highlight)=>eligible.some(x=>x.bookId!==h.bookId&&!prior.has(pairKey(h.id,x.id)));
  const anchor=mode==='connect'?(ranked.find(h=>h.id===preferredId&&canAnchor(h))??ranked.find(canAnchor)):undefined;
  if(mode==='connect'&&!anchor)return {mode,question,anchorId:null,candidates:[],eligibleCount:eligible.length};
  const pool=ranked.filter(h=>!anchor||(h.id!==anchor.id&&h.bookId!==anchor.bookId&&!prior.has(pairKey(h.id,anchor.id))));
  const chosen:Highlight[]=anchor?[anchor]:[];
  const selected=new Set(chosen.map(h=>h.id));
  const count=new Map<string,number>();
  if(anchor)count.set(anchor.bookId,1);
  function take(h:Highlight) {if(chosen.length>=24||selected.has(h.id))return;chosen.push(h);selected.add(h.id);count.set(h.bookId,(count.get(h.bookId)??0)+1);}
  // Reserve room for diverse, older books rather than only recent keyword matches.
  if(anchor){const related=[...pool].sort((a,b)=>(overlap(b,termsFor.get(anchor.id)!)+score(b))-(overlap(a,termsFor.get(anchor.id)!)+score(a))||a.id.localeCompare(b.id));for(const h of related){if(chosen.length>=8)break;if((count.get(h.bookId)??0)<2)take(h);}}
  for(const h of pool){if(chosen.length>=14)break;if((count.get(h.bookId)??0)<2)take(h);}
  for(const h of [...pool].sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id))){if(chosen.length>=20)break;if((count.get(h.bookId)??0)<2)take(h);}
  for(const h of pool){if(chosen.length>=24)break;if((count.get(h.bookId)??0)<3)take(h);}
  for(const h of pool){if(chosen.length>=24)break;take(h);}
  return {mode,question,anchorId:anchor?.id??null,eligibleCount:eligible.length,candidates:chosen.map(h=>{const b=books.get(h.bookId)!;return {id:h.id,bookId:b.id,title:b.title,author:b.author,text:h.text.slice(0,1800),note:includeNotes?(h.note??'').slice(0,800):''};})};
}

export async function retrieveEvidence(base:string,token:string,plan:RetrievalPlan):Promise<string[]> {
  const url=new URL(base.trim());
  if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw Error('Enter the HTTPS origin of your private companion server.');
  if(token.trim().length<32)throw Error('Enter your private companion access token.');
  const {mode,question,anchorId,candidates}=plan;
  if(!candidates.length)throw Error('No suitable saved passages. Add more material or select sources manually.');
  if(mode==='discuss'&&!question.trim())throw Error('Enter a question before semantic retrieval.');
  const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),55000);
  try {
    const response=await fetch(url.origin+'/v1/retrieve',{method:'POST',redirect:'error',signal:controller.signal,headers:{'Content-Type':'application/json',Authorization:'Bearer '+token.trim()},body:JSON.stringify({mode,question,anchorId,candidates})});
    if(!response.ok)throw Error(response.status===503?'Semantic retrieval is not configured on your server.':response.status===401?'Access token was rejected.':response.status===429?'Companion is busy. Try again shortly.':'Semantic retrieval failed. No passages were selected.');
    const result=await response.json() as {ids?:unknown};
    if(!Array.isArray(result.ids)||!result.ids.length||result.ids.length>6||new Set(result.ids).size!==result.ids.length||result.ids.some(id=>typeof id!=='string'||!candidates.some(c=>c.id===id)))throw Error('Invalid retrieval result.');
    const ids=result.ids as string[];
    if(mode==='connect'&&(!ids.includes(anchorId!)||new Set(candidates.filter(c=>ids.includes(c.id)).map(c=>c.bookId)).size<2))throw Error('No valid cross-book selection.');
    return ids;
  } finally {clearTimeout(timer);}
}
