import test from 'node:test';
import assert from 'node:assert/strict';
import { manualBook, mergeBooks, addHighlight, emptyLibrary } from '../src/data/personalLibrary.ts';
import { planRetrieval } from '../src/data/retrieval.ts';
import { recordConnection } from '../src/data/connections.ts';
test('bounded diverse shortlist scans library, does not leak notes by default',()=>{
 let l=emptyLibrary;
 for(let i=0;i<30;i++){const b=manualBook('Book '+i,'Author '+i,'');l=mergeBooks(l,[b]);l=addHighlight(l,b.id,'Attention and care '+i,'','Private note '+i);}
 const plan=planRetrieval(l,'connect','attention',false,l.highlights[0].id);
 assert.equal(plan.anchorId,l.highlights[0].id);
 assert.equal(plan.eligibleCount,30);
 assert.equal(plan.candidates.length,24);
 assert.ok(new Set(plan.candidates.map(c=>c.bookId)).size>=2);
 assert.ok(plan.candidates.every(c=>c.note===''));
 assert.ok(planRetrieval(l,'discuss','attention',true).candidates.some(c=>c.note.includes('Private note')));
});
test('known pairs are excluded around anchor; one-book library abstains',()=>{
 const a=manualBook('A','Author A',''),b=manualBook('B','Author B',''),c=manualBook('C','Author C','');
 let l=mergeBooks(emptyLibrary,[a,b,c]);
 l=addHighlight(l,a.id,'First','','');l=addHighlight(l,b.id,'Second','','');l=addHighlight(l,c.id,'Third','','');
 l=recordConnection(l,l.highlights[0].id,l.highlights[1].id,'dismissed');
 const plan=planRetrieval(l,'connect','',false,l.highlights[0].id);
 assert.deepEqual(plan.candidates.map(x=>x.id),[l.highlights[0].id,l.highlights[2].id]);
 assert.equal(planRetrieval({...l,highlights:[l.highlights[0]],connections:[]},'connect','',false).candidates.length,0);
});
