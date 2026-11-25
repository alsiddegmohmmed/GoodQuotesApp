const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRequest, validateAnswer } = require('./contract');
const fixture = {
  "mode": "connect",
  "question": "",
  "sources": [
    {
      "id": "a",
      "bookId": "1",
      "title": "A",
      "author": "A",
      "text": "Attention is finite.",
      "note": "I disagree."
    },
    {
      "id": "b",
      "bookId": "2",
      "title": "B",
      "author": "B",
      "text": "Relationships deserve time."
    }
  ]
};
test('cross-book answer requires exact source excerpts', () => {
 const req = validateRequest(fixture);
 const answer = {status:'insight',text:'Possible complement',relation:'Complement',evidence:[{sourceId:'a',kind:'passage',excerpt:'Attention'},{sourceId:'b',kind:'passage',excerpt:'Relationships'}]};
 assert.equal(validateAnswer(answer,req).relation,'Complement');
 assert.throws(()=>validateAnswer({...answer,evidence:[{sourceId:'a',kind:'passage',excerpt:'invented'},answer.evidence[1]]},req));
 assert.throws(()=>validateAnswer({...answer,evidence:[{sourceId:'a',kind:'reader-note',excerpt:'Attention'},answer.evidence[1]]},req));
 assert.throws(()=>validateAnswer({...answer,evidence:[answer.evidence[0]]},req));
 assert.throws(()=>validateAnswer({...answer,evidence:[{sourceId:'missing',kind:'passage',excerpt:'x'},answer.evidence[1]]},req));
});
test('request validation and abstention',()=>{
 assert.throws(()=>validateRequest({...fixture,sources:[fixture.sources[0]]}));
 assert.throws(()=>validateRequest({...fixture,sources:[fixture.sources[0],fixture.sources[0]]}));
 assert.throws(()=>validateRequest({...fixture,mode:'discuss',question:' '}));
 assert.equal(validateAnswer({status:'insufficient',text:'Not enough evidence',evidence:[],relation:null},validateRequest(fixture)).status,'insufficient');
});
