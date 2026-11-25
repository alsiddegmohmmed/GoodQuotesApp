'use strict';
require('dotenv').config();
const http = require('node:http');
const { createHash, timingSafeEqual } = require('node:crypto');
const { validateRequest, validateAnswer, SYSTEM_PROMPT } = require('./contract');
const { validateRetrieval, embeddingInputs, rankEvidence } = require('./retrieval');

const token = process.env.COMPANION_ACCESS_TOKEN;
const key = process.env.COMPANION_MODEL_KEY;
const model = process.env.COMPANION_MODEL;
const endpoint = process.env.COMPANION_MODEL_URL;
if (!token || token.length < 32 || !key || !model || !endpoint) {
  throw new Error('Configure COMPANION_ACCESS_TOKEN (32+ characters), COMPANION_MODEL_KEY, COMPANION_MODEL and COMPANION_MODEL_URL.');
}
const url = new URL(endpoint);
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('Model URL must be a fixed HTTPS endpoint.');
const embeddingKey = process.env.COMPANION_EMBEDDING_KEY;
const embeddingModel = process.env.COMPANION_EMBEDDING_MODEL;
const embeddingEndpoint = process.env.COMPANION_EMBEDDING_URL;
let embeddingUrl;
if (embeddingKey || embeddingModel || embeddingEndpoint) {
  if (!embeddingKey || !embeddingModel || !embeddingEndpoint) throw Error('Configure all three embedding variables.');
  embeddingUrl = new URL(embeddingEndpoint);
  if (embeddingUrl.protocol !== 'https:' || embeddingUrl.username || embeddingUrl.password || embeddingUrl.search || embeddingUrl.hash) throw Error('Embedding URL must be a fixed HTTPS endpoint.');
}
const hash = value => createHash('sha256').update(value).digest();
const expected = hash('Bearer ' + token);
const maxBody = 160 * 1024;
const port = Number(process.env.COMPANION_PORT || 5050);
let active = false;
let attempts = [];
function reply(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(data));
}
async function readBody(req, limit) {
  let size = 0;
  const chunks = [];
  for await (const part of req) {
    size += part.length;
    if (size > limit) throw new Error('Request too large.');
    chunks.push(part);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
async function modelAnswer(request) {
  const response = await fetch(url, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(45000),
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify(request) }
    ], max_tokens: 1600, response_format: { type: 'json_object' } })
  });
  if (!response.ok) throw Error('Provider request failed.');
  const output = await response.json();
  const raw = output?.choices?.[0]?.message?.content;
  if (typeof raw !== 'string' || raw.length > 24000) throw Error('Invalid model response.');
  return validateAnswer(JSON.parse(raw), request);
}
async function retrieve(request) {
  const response = await fetch(embeddingUrl, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(45000),
    headers: { Authorization: 'Bearer ' + embeddingKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: embeddingModel, input: embeddingInputs(request) })
  });
  if (!response.ok) throw Error('Embedding provider request failed.');
  // Bound decoded response size before parsing untrusted provider data.
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const {done,value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8 * 1024 * 1024) { await reader.cancel(); throw Error('Embedding response too large.'); }
      chunks.push(Buffer.from(value));
    }
  } finally { reader.releaseLock(); }
  return rankEvidence(request, JSON.parse(Buffer.concat(chunks).toString('utf8')));
}
const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST' || !['/v1/reading','/v1/retrieve'].includes(req.url)) { reply(res, 404, { error: 'Not found.' }); return; }
  if (!timingSafeEqual(hash(String(req.headers.authorization || '')), expected)) { reply(res, 401, { error: 'Invalid access token.' }); return; }
  if (!/^application\/json(?:\s*;|$)/i.test(String(req.headers['content-type'] || ''))) { reply(res, 415, { error: 'JSON required.' }); return; }
  const retrieving = req.url === '/v1/retrieve';
  if (retrieving && !embeddingUrl) { reply(res, 503, { error: 'Semantic retrieval is not configured.' }); return; }
  const limit = retrieving ? 512 * 1024 : maxBody;
  if (Number(req.headers['content-length']) > limit) { reply(res, 413, { error: 'Request too large.' }); return; }
  const now = Date.now();
  attempts = attempts.filter(t => now - t < 60000);
  if (active || attempts.length >= 6) { reply(res, 429, { error: 'Companion is busy. Try again shortly.' }); return; }
  active = true;
  attempts.push(now);
  try {
    let request;
    try { request = (retrieving ? validateRetrieval : validateRequest)(await readBody(req, limit)); }
    catch { if (!res.destroyed) reply(res, 400, { error: 'Invalid or oversized request. Check selected passages.' }); return; }
    try { const answer = await (retrieving ? retrieve(request) : modelAnswer(request)); if (!res.destroyed) reply(res, 200, answer); }
    catch { if (!res.destroyed) reply(res, 502, { error: 'The model did not return a valid grounded answer. Try again or select different sources.' }); }
  } finally { active = false; }
});
server.requestTimeout = 20000;
server.headersTimeout = 10000;
server.maxHeadersCount = 32;
// Never expose this HTTP listener directly. Use an authenticated HTTPS reverse proxy.
server.listen(port, '127.0.0.1', () => console.log('Private companion listening on loopback port ' + port));
