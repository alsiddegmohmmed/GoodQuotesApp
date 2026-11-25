const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRetrieval, embeddingInputs, rankEvidence } = require('./retrieval');
const request = {
  "mode": "connect",
  "question": "attention and relationships",
  "candidates": [
    {
      "id": "a",
      "bookId": "1",
      "title": "One",
      "author": "Author",
      "text": "Focus",
      "note": ""
    },
    {
      "id": "b",
      "bookId": "2",
      "title": "Two",
      "author": "Author",
      "text": "Care",
      "note": ""
    },
    {
      "id": "c",
      "bookId": "1",
      "title": "One",
      "author": "Author",
      "text": "Attention",
      "note": ""
    }
  ],
  "anchorId": "a"
};
const vectors = {
  "data": [
    {
      "index": 3,
      "embedding": [
        1,
        0
      ]
    },
    {
      "index": 2,
      "embedding": [
        1,
        0
      ]
    },
    {
      "index": 1,
      "embedding": [
        0.8,
        0.2
      ]
    },
    {
      "index": 0,
      "embedding": [
        0.9,
        0.1
      ]
    }
  ]
};
test('ranks unordered provider vectors, keeps anchor and ensures different book',()=>{
  assert.deepEqual(rankEvidence(validateRetrieval(request),vectors).ids,['a','b','c']);
  assert.equal(embeddingInputs(request).length,4);
  assert.ok(!embeddingInputs(request)[0].includes('Reader note:'));
});
test('rejects malformed inputs and malformed embeddings',()=>{
  assert.throws(()=>validateRetrieval({...request,candidates:[request.candidates[0]]}));
  assert.throws(()=>validateRetrieval({...request,anchorId:'missing'}));
  assert.throws(()=>validateRetrieval({...request,mode:'discuss',question:'',anchorId:null}));
  assert.throws(()=>rankEvidence(request,{data:vectors.data.map((v,i)=>i===0?{...v,index:0}:v)}));
  assert.throws(()=>rankEvidence(request,{data:vectors.data.map((v,i)=>i===0?{...v,embedding:[0,0]}:v)}));
  assert.throws(()=>rankEvidence(request,{data:vectors.data.slice(1)}));
});
