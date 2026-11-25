'use strict';

function validateRetrieval(body) {
  const str=(v,max,required=true)=>typeof v==='string'&&v.length<=max&&(!required||v.trim().length>0);
  if(!body||!['connect','discuss'].includes(body.mode)||!str(body.question,2000,false)||!Array.isArray(body.candidates)||body.candidates.length<1||body.candidates.length>24)throw Error('Invalid retrieval request.');
  if(body.mode==='discuss'&&!body.question.trim())throw Error('A question is required.');
  const seen=new Set(),books=new Set();
  const candidates=body.candidates.map(c=>{
    if(!c||!str(c.id,180)||seen.has(c.id)||!str(c.bookId,180)||!str(c.title,500)||!str(c.author,500)||!str(c.text,1800)||!str(c.note??'',800,false))throw Error('Invalid retrieval candidate.');
    seen.add(c.id);books.add(c.bookId);
    return {id:c.id,bookId:c.bookId,title:c.title,author:c.author,text:c.text,note:c.note??''};
  });
  if(body.mode==='connect'&&(books.size<2||!seen.has(body.anchorId)))throw Error('A cross-book anchor and another book are required.');
  if(body.mode==='discuss'&&body.anchorId!=null)throw Error('Unexpected anchor.');
  return {mode:body.mode,question:body.question,candidates,anchorId:body.mode==='connect'?body.anchorId:null};
}

function embeddingInputs(request) {
  const documents=request.candidates.map(c=>`Book: ${c.title}\nAuthor: ${c.author}\nPassage: ${c.text}${c.note?'\nReader note: '+c.note:''}`);
  return request.question.trim()?[...documents,request.question]:documents;
}

function rankEvidence(request, response) {
  const inputs=embeddingInputs(request);
  if(!Array.isArray(response?.data)||response.data.length!==inputs.length)throw Error('Invalid embedding response length.');
  const vectors=Array(inputs.length);
  let dimension=0;
  for(const item of response.data){
    if(!Number.isInteger(item?.index)||item.index<0||item.index>=inputs.length||vectors[item.index]||!Array.isArray(item.embedding)||!item.embedding.length||item.embedding.length>8192||item.embedding.some(x=>typeof x!=='number'||!Number.isFinite(x)))throw Error('Invalid embedding response.');
    if(!dimension)dimension=item.embedding.length;
    if(item.embedding.length!==dimension)throw Error('Embedding dimension mismatch.');
    const norm=Math.hypot(...item.embedding);
    if(!Number.isFinite(norm)||norm===0)throw Error('Invalid embedding norm.');
    vectors[item.index]=item.embedding.map(x=>x/norm);
  }
  const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
  const anchorIndex=request.candidates.findIndex(c=>c.id===request.anchorId);
  const target=request.question.trim()?vectors[inputs.length-1]:vectors[anchorIndex];
  const anchor=anchorIndex>=0?vectors[anchorIndex]:null;
  const ranked=request.candidates.map((c,i)=>({c,i,score:anchor&&request.question.trim()?0.75*dot(vectors[i],target)+0.25*dot(vectors[i],anchor):dot(vectors[i],target)})).filter(x=>x.i!==anchorIndex);
  const selected=anchorIndex>=0?[anchorIndex]:[];
  const bookCounts=new Map();
  if(anchorIndex>=0)bookCounts.set(request.candidates[anchorIndex].bookId,1);
  // Guarantee a cross-book comparison before filling the remaining evidence budget.
  if(anchorIndex>=0){
    const other=ranked.filter(x=>x.c.bookId!==request.candidates[anchorIndex].bookId).sort((a,b)=>b.score-a.score||a.i-b.i)[0];
    if(!other)throw Error('No cross-book candidate.');
    selected.push(other.i);bookCounts.set(other.c.bookId,1);
  }
  while(selected.length<Math.min(6,request.candidates.length)){
    const next=ranked.filter(x=>!selected.includes(x.i)).map(x=>({...x,adjusted:x.score-0.12*(bookCounts.get(x.c.bookId)??0)-0.18*Math.max(0,...selected.map(i=>dot(vectors[i],vectors[x.i])))})).sort((a,b)=>b.adjusted-a.adjusted||a.i-b.i)[0];
    if(!next)break;
    selected.push(next.i);bookCounts.set(next.c.bookId,(bookCounts.get(next.c.bookId)??0)+1);
  }
  return {ids:selected.map(i=>request.candidates[i].id)};
}

module.exports = { validateRetrieval, embeddingInputs, rankEvidence };
