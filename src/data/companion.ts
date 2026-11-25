import type { Library, ConnectionRelation } from './personalLibrary';
export type Evidence = { id: string; bookId: string; title: string; author: string; text: string; location: string; note: string; sourceDate: string };
export type Turn = { role: 'reader' | 'assistant'; text: string };
export type Answer = { status: 'insight' | 'insufficient'; text: string; relation: ConnectionRelation | null; evidence: { sourceId: string; kind: 'passage' | 'reader-note'; excerpt: string }[] };
export function prepareEvidence(library: Library, ids: string[], includeNotes: boolean): Evidence[] {
  if (ids.length > 10 || new Set(ids).size !== ids.length) throw new Error('Select up to ten distinct passages.');
  return ids.map(id => {
    const h = library.highlights.find(x => x.id === id);
    const b = h && library.books.find(x => x.id === h.bookId);
    if (!h || !b) throw new Error('A selected source is missing.');
    if (h.text.length > 6000 || (includeNotes && (h.note?.length ?? 0) > 3000)) throw new Error('A selected passage or note is too long for this request.');
    return { id:h.id, bookId:b.id, title:b.title, author:b.author, text:h.text, location:h.location ?? '', note:includeNotes ? h.note ?? '' : '', sourceDate:h.sourceDate ?? '' };
  });
}
export async function askCompanion(base: string, token: string, mode: 'connect' | 'discuss', question: string, sources: Evidence[], history: Turn[]): Promise<Answer> {
  const url = new URL(base.trim());
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || (url.pathname !== '/' && url.pathname !== '')) throw new Error('Enter the HTTPS origin of your private companion server.');
  if (token.trim().length < 32) throw new Error('Enter your private companion access token.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55000);
  try {
    const response = await fetch(url.origin + '/v1/reading', { method:'POST', redirect:'error', signal:controller.signal,
      headers:{'Content-Type':'application/json', Authorization:'Bearer '+token.trim()},
      body:JSON.stringify({mode,question,sources,history:history.slice(-6)}) });
    if (!response.ok) throw new Error(response.status === 401 ? 'Access token was rejected.' : response.status === 429 ? 'Companion is busy. Try again shortly.' : 'Companion request failed. Check your server and selected sources.');
    const a = await response.json() as Answer;
    if (!a || !['insight','insufficient'].includes(a.status) || typeof a.text !== 'string' || !Array.isArray(a.evidence)) throw new Error('Invalid companion answer.');
    const byId = new Map(sources.map(s=>[s.id,s]));
    const used = new Set<string>();
    for(const e of a.evidence) {
      const s=byId.get(e.sourceId);
      if(!s || !['passage','reader-note'].includes(e.kind) || typeof e.excerpt!=='string' || !e.excerpt.trim() || !(e.kind==='passage'?s.text:s.note).includes(e.excerpt)) throw new Error('Answer contains unsupported source evidence.');
      used.add(s.bookId);
    }
    if(a.status==='insight' && (!a.evidence.length || (mode==='connect' && (used.size<2 || !['Agreement','Contrast','Complement','Recurring question','Other'].includes(a.relation??''))) || (mode==='discuss' && a.relation!==null))) throw new Error('Answer is missing required grounding.');
    if(a.status==='insufficient' && (a.evidence.length || a.relation!==null))throw new Error('Invalid abstention.');
    return a;
  } finally { clearTimeout(timer); }
}
