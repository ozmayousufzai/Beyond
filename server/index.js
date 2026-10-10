import express from 'express';
import cors from 'cors';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { load } from 'cheerio';
 
const app = express();
const PORT = Number(process.env.API_PORT || 3001);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const TTL = 15 * 60 * 1000;
const SOURCES = {
  RemoteOK: 'https://remoteok.com/api',
 ACBAR: 'https://acbar.org/en/jobs?page=1',
  Arbeitnow: 'https://www.arbeitnow.com/api/job-board-api',
};
 
app.disable('x-powered-by');
app.use(cors({ origin: allowedOrigin, methods: ['GET', 'POST'], optionsSuccessStatus: 204 }));
app.use(express.json({ limit: '32kb' }));
 
const buckets = new Map();
app.use('/api', (req, res, next) => {
  const now = Date.now();
  const key = req.ip || 'unknown';
  let bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) { bucket = { count: 0, resetAt: now + 60_000 }; buckets.set(key, bucket); }
  bucket.count += 1;
  res.setHeader('RateLimit-Limit', '100');
  res.setHeader('RateLimit-Remaining', String(Math.max(0, 100 - bucket.count)));
  if (bucket.count > 100) return res.status(429).json({ success: false, error: 'Too many requests. Please try again shortly.' });
  next();
});
 
const sourceCache = Object.fromEntries(Object.keys(SOURCES).map(name => [name, { opportunities: [], fetchedAt: null, nextRefreshAt: 0, error: null }]));
let initialRefreshPromise;
const safeUrl = value => { try { const url = new URL(String(value || '')); return url.protocol === 'https:' ? url.toString() : ''; } catch { return ''; } };
const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/\s+/g, ' ').trim().slice(0, 5000);
const slug = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'listing';
function normalized({ id, title, organization, type = 'Job', location = 'Not specified', remote = false, field = 'General', level = 'See original listing', description = '', source, url, publishedAt = null, tags = [], deadline = null }) {
  const safe = safeUrl(url);
  if (!safe || !title || !organization) return null;
  const cleanTags = Array.isArray(tags) ? tags.map(t => stripHtml(t)).filter(Boolean).slice(0, 12) : [];
  return { id, title: stripHtml(title), organization: stripHtml(organization), type, location: stripHtml(location), remote: Boolean(remote) || /remote|worldwide/i.test(location), field: cleanTags[0] || field, level, funding: 'See original listing', deadline, skills: cleanTags.slice(0, 8), tags: cleanTags, eligibility: 'Review the original employer listing for eligibility, location and work authorization.', description: stripHtml(description || 'Open the original listing for full details.'), source, sourceUrl: safe, url: safe, applyUrl: safe, publishedAt, isDemo: false };
}
function normalizeRemoteOK(job) {
  if (!job || typeof job !== 'object' || !job.position || !job.company || !job.url) return null;
  const tags = Array.isArray(job.tags) ? job.tags : [];
  return normalized({ id: `remoteok-${job.id || slug(job.position + '-' + job.company)}`, title: job.position, organization: job.company, location: job.location || 'Remote', remote: true, description: job.description, source: 'RemoteOK', url: job.apply_url || job.url, publishedAt: job.date || null, tags, type: /intern/i.test(`${job.position} ${tags.join(' ')}`) ? 'Internship' : 'Job' });
}
function normalizeArbeitnow(job) {
  if (!job || !job.url || !job.title || !job.company_name) return null;
  const timestamp = Number(job.created_at);
  return normalized({ id: `arbeitnow-${job.slug || slug(job.title + '-' + job.company_name)}`, title: job.title, organization: job.company_name, location: job.location || (job.remote ? 'Remote' : 'Not specified'), remote: Boolean(job.remote), description: job.description, source: 'Arbeitnow', url: job.url, publishedAt: Number.isFinite(timestamp) && timestamp > 0 ? new Date(timestamp * 1000).toISOString() : null, tags: job.tags || [], type: /intern|praktikum/i.test((job.job_types || []).join(' ')) ? 'Internship' : 'Job' });
}
async function fetchText(url) {
  const response = await fetch(url, { headers: { accept: 'application/json, text/html;q=0.9, */*;q=0.8', 'user-agent': 'BEYOND-opportunity-discovery/1.0 (links back to original job listings)' }, signal: AbortSignal.timeout(18000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}
async function fetchJson(url) { return JSON.parse(await fetchText(url)); }


function normalizeAcbarPage(html) {
  const $ = load(html);
  const found = [];
  const seen = new Set();

  const provinces = [
    'Kabul', 'Herat', 'Balkh', 'Kandahar', 'Nangarhar',
    'Badakhshan', 'Badghis', 'Baghlan', 'Bamyan',
    'Daykundi', 'Farah', 'Faryab', 'Ghazni', 'Helmand',
    'Jawzjan', 'Kapisa', 'Khost', 'Kunar', 'Kunduz',
    'Laghman', 'Logar', 'Nimroz', 'Nuristan', 'Paktia',
    'Paktika', 'Panjshir', 'Parwan', 'Samangan',
    'Sar-e Pol', 'Takhar', 'Uruzgan', 'Wardak', 'Zabul'
  ];

  $('a[href]').each((_index, element) => {
    const link = $(element);
    const title = stripHtml(link.text());
    const href = link.attr('href') || '';

    // Match actual ACBAR vacancy detail links.
    if (!/\/en\/jobs\/details\/\d+/i.test(href)) return;
    if (!title || title.length < 4) return;

    let absolute;

    try {
      absolute = safeUrl(
        new URL(href, 'https://www.acbar.org').toString()
      );
    } catch {
      return;
    }

    if (!absolute || seen.has(absolute)) return;
    seen.add(absolute);

    let parent = link.closest(
      'article, tr, li, .card, .job-item, .job-listing'
    );

    if (!parent.length) parent = link.parent().parent();

    const combinedText = stripHtml(parent.text()) || title;

    const organizationMatch = combinedText.match(
      /(?:Organization Name|Organization|Company)\s*:?\s*([^|•\n]+)/i
    );

    const locationMatch = combinedText.match(
      new RegExp(`\\b(${provinces.join('|')})\\b`, 'i')
    );

    const deadlineMatch = combinedText.match(
      /\b20\d{2}-\d{2}-\d{2}\b/
    );

    const opportunity = normalized({
      id: `acbar-${slug(absolute)}`,
      title,
      organization:
        organizationMatch?.[1]?.trim() || 'See ACBAR listing',
      location: locationMatch?.[0] || 'Afghanistan',
      description: combinedText,
      source: 'ACBAR',
      url: absolute,
      deadline: deadlineMatch?.[0] || null,
      tags: ['Afghanistan', 'Local opportunity']
    });

    if (opportunity) found.push(opportunity);
  });

  return found.slice(0, 250);
}
async function refreshSource(name, ttl, loader) {
  const state = sourceCache[name];
  if (Date.now() < state.nextRefreshAt && state.fetchedAt) return;
  state.nextRefreshAt = Date.now() + ttl;
  try {
    const records = await loader();
    if (!Array.isArray(records)) throw new Error('Unexpected source response format');
    state.opportunities = records.filter(Boolean);
    state.fetchedAt = new Date().toISOString(); state.error = null;
    console.log(`[sources] ${name}: loaded ${state.opportunities.length} listings`);
  } catch (error) {
    state.error = error.message || 'Source unavailable';
    state.nextRefreshAt = Date.now() + Math.min(ttl, 10 * 60 * 1000);
    console.warn(`[sources] ${name}: ${state.error}`);
  }
}
async function refreshSources(force = false) {
  if (force) Object.values(sourceCache).forEach(state => { state.nextRefreshAt = 0; });
  await Promise.allSettled([
    refreshSource('RemoteOK', TTL, async () => {
      const payload = await fetchJson(SOURCES.RemoteOK);
      if (!Array.isArray(payload)) throw new Error('RemoteOK response was not an array');
      return payload.filter(item => item && item.position).map(normalizeRemoteOK).filter(Boolean);
    }),
    refreshSource('Arbeitnow', TTL, async () => {
      const payload = await fetchJson(SOURCES.Arbeitnow);
      if (!Array.isArray(payload.data)) throw new Error('Arbeitnow response did not contain data[]');
      return payload.data.map(normalizeArbeitnow).filter(Boolean);
    }),
    refreshSource('ACBAR', TTL, async () => normalizeAcbarPage(await fetchText(SOURCES.ACBAR))),
  ]);
}
function allLiveOpportunities() {
  const unique = new Map();
  for (const state of Object.values(sourceCache)) for (const item of state.opportunities) {
    const key = `${item.title.toLowerCase()}|${item.organization.toLowerCase()}`;
    if (!unique.has(key)) unique.set(key, item);
  }
  return [...unique.values()].sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));
}
async function readDemoOpportunities() {
  try {
    const parsed = JSON.parse(await readFile(path.join(__dirname, 'opportunities.json'), 'utf8'));
    if (!Array.isArray(parsed)) throw new Error('Expected an array');
    return parsed.filter(item => item && typeof item.id === 'string' && typeof item.title === 'string');
  } catch (error) {
    console.error('[beyond-api] Could not read demo data:', error.message);
    return [{ id: 'preview-unavailable', title: 'Live sources are temporarily unavailable', organization: 'BEYOND', type: 'Job', location: 'Online', remote: true, field: 'Career discovery', level: 'Preview', funding: 'See original listing', deadline: null, skills: [], tags: ['Preview'], eligibility: 'Please refresh later or open a source website directly.', description: 'The live feeds could not be reached and the local preview file is unavailable.', source: 'BEYOND', url: '', applyUrl: '', sourceUrl: '', isDemo: true }];
  }
}
function sourceSummary() { return Object.entries(sourceCache).map(([name, state]) => ({ name, status: state.opportunities.length ? 'connected' : 'unavailable', count: state.opportunities.length, fetchedAt: state.fetchedAt, error: state.error, url: SOURCES[name] })); }
app.get('/api/health', (_req, res) => res.json({ success: true, service: 'beyond-api', status: 'ok', mode: allLiveOpportunities().length ? 'live' : 'demo', sources: sourceSummary() }));
app.get('/api/sources', async (_req, res) => { if (!initialRefreshPromise) initialRefreshPromise = refreshSources(); await initialRefreshPromise; res.json({ success: true, sources: sourceSummary() }); });
app.post('/api/sources/refresh', async (_req, res, next) => { try { await refreshSources(true); res.json({ success: true, sources: sourceSummary() }); } catch (error) { next(error); } });
app.get('/api/opportunities', async (req, res, next) => {
  try {
    if (!initialRefreshPromise) initialRefreshPromise = refreshSources();
    await initialRefreshPromise;
    const search = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 120).toLowerCase() : '';
    const type = typeof req.query.type === 'string' ? req.query.type.trim().slice(0, 40) : 'All';
    const remote = req.query.remote === 'true';
    const limitRaw = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(100, Math.max(1, limitRaw)) : 100;
    let opportunities = allLiveOpportunities(); let mode = 'live';
    if (!opportunities.length) { opportunities = await readDemoOpportunities(); mode = 'demo'; }
    if (search) opportunities = opportunities.filter(item => [item.title, item.organization, item.type, item.field, item.location, item.description, item.funding, ...(item.skills || []), ...(item.tags || [])].join(' ').toLowerCase().includes(search));
    if (type && type !== 'All') opportunities = opportunities.filter(item => String(item.type).toLowerCase() === type.toLowerCase());
    if (remote) opportunities = opportunities.filter(item => item.remote === true);
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, mode, total: opportunities.length, sources: sourceSummary(), opportunities: opportunities.slice(0, limit) });
  } catch (error) { next(error); }
});
app.use((_req, res) => res.status(404).json({ success: false, error: 'Endpoint not found' }));
app.use((error, _req, res, _next) => { console.error('[beyond-api]', error.message); res.status(500).json({ success: false, error: 'The API could not complete this request.', detail: process.env.NODE_ENV === 'production' ? undefined : error.message }); });
app.listen(PORT, () => { console.log(`BEYOND API listening on http://localhost:${PORT}`); initialRefreshPromise = refreshSources(); setInterval(() => { refreshSources(); }, TTL).unref(); });
