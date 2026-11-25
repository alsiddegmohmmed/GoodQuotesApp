'use strict';
require('dotenv').config();
const http = require('node:http');
const { createHash, timingSafeEqual } = require('node:crypto');
const { validateRequest, validateAnswer, SYSTEM_PROMPT } = require('./contract');

const token = process.env.COMPANION_ACCESS_TOKEN;
const key = process.env.COMPANION_MODEL_KEY;
const model = process.env.COMPANION_MODEL;
const endpoint = process.env.COMPANION_MODEL_URL;
if (!token || token.length < 32 || !key || !model || !endpoint) {
  throw new Error('Configure COMPANION_ACCESS_TOKEN (32+ characters), COMPANION_MODEL_KEY, COMPANION_MODEL and COMPANION_MODEL_URL.');
}
const url = new URL(endpoint);
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('Model URL must be a fixed HTTPS endpoint.');
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
async function readBody(req) {
  let size = 0;
  const chunks = [];
  for await (const part of req) {
    size += part.length;
    if (size > maxBody) throw new Error('Request too large.');
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
const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/v1/reading') { reply(res, 404, { error: 'Not found.' }); return; }
  if (!timingSafeEqual(hash(String(req.headers.authorization || '')), expected)) { reply(res, 401, { error: 'Invalid access token.' }); return; }
  if (!/^application\/json(?:\s*;|$)/i.test(String(req.headers['content-type'] || ''))) { reply(res, 415, { error: 'JSON required.' }); return; }
  if (Number(req.headers['content-length']) > maxBody) { reply(res, 413, { error: 'Request too large.' }); return; }
  const now = Date.now();
  attempts = attempts.filter(t => now - t < 60000);
  if (active || attempts.length >= 6) { reply(res, 429, { error: 'Companion is busy. Try again shortly.' }); return; }
  active = true;
  attempts.push(now);
  try {
    let request;
    try { request = validateRequest(await readBody(req)); }
    catch { if (!res.destroyed) reply(res, 400, { error: 'Invalid or oversized request. Check selected passages.' }); return; }
    try { const answer = await modelAnswer(request); if (!res.destroyed) reply(res, 200, answer); }
    catch { if (!res.destroyed) reply(res, 502, { error: 'The model did not return a valid grounded answer. Try again or select different sources.' }); }
  } finally { active = false; }
});
server.requestTimeout = 20000;
server.headersTimeout = 10000;
server.maxHeadersCount = 32;
// Never expose this HTTP listener directly. Use an authenticated HTTPS reverse proxy.
server.listen(port, '127.0.0.1', () => console.log('Private companion listening on loopback port ' + port));
