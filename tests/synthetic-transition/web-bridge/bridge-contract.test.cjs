const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const bridge = require('./legacy-export-bridge.js');

const androidWebViewUa = 'Mozilla/5.0 (Linux; Android 16; Pixel 6 Build/BP2A; wv) AppleWebKit/537.36 Version/4.0 Chrome/140.0.0.0 Mobile Safari/537.36';
const androidChromeUa = 'Mozilla/5.0 (Linux; Android 16; Pixel 6) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36';
const iphoneUa = 'Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 Version/19.0 Mobile/15E148 Safari/604.1';
assert.equal(bridge.isAndroidWebView(androidWebViewUa), true);
assert.equal(bridge.isAndroidWebView(androidChromeUa), false);
assert.equal(bridge.isAndroidWebView(iphoneUa), false);

const snapshots = Array.from({ length: 12 }, (_, index) => ({
  time: `Sep 2, 12:${String(index).padStart(2, '0')} PM`,
  profile: ['Balanced mix', 'Bass / hip-hop', 'Acoustic / singer-songwriter', 'Vocal clarity'][index % 4],
  score: 60 + (index % 35),
  focus: ['Sub', 'Bass', 'Mids', 'Presence', 'Air'][index % 5],
  bands: [12 + index, 35 + index, 54 + index, 40 + index, 27 + index]
}));
const raw = JSON.stringify(snapshots);
const payload = bridge.buildLegacyPayload(raw, '2026-09-02T17:45:00.000Z');
assert.equal(payload.app, 'Acelynn Pro');
assert.equal(payload.snapshots.length, 12);

const url = bridge.buildBridgeUrl('https://acelynn.vercel.app/', payload);
assert.ok(url.startsWith('https://acelynn.vercel.app/legacy-export.html#v1='));
assert.ok(url.length < bridge.MAX_BRIDGE_URL_LENGTH, `bridge URL too long: ${url.length}`);
assert.equal(url.split('#')[0].includes('snapshots'), false, 'snapshot data leaked before fragment');
assert.equal(url.includes('?'), false, 'backup must not use a query string');

const encoded = url.split('#v1=')[1];
const roundTrip = JSON.parse(decodeURIComponent(encoded));
assert.deepEqual(roundTrip, payload);

assert.throws(() => bridge.buildLegacyPayload('{bad-json', '2026-09-02T17:45:00.000Z'), /could not be read/i);
assert.throws(() => bridge.buildLegacyPayload('[]', '2026-09-02T17:45:00.000Z'), /no saved checks/i);
assert.throws(() => bridge.buildBridgeUrl('http://acelynn.vercel.app', payload), /secure/i);

const landingPage = fs.readFileSync(path.join(__dirname, 'legacy-export.html'), 'utf8');
assert.match(landingPage, /location\.hash/);
assert.match(landingPage, /acelynn-session-report\.json/);
assert.match(landingPage, /Download Acelynn backup/);
assert.match(landingPage, /Copy backup text/);
assert.doesNotMatch(landingPage, /fetch\s*\(/i, 'landing page must not upload backup data');
assert.doesNotMatch(landingPage, /XMLHttpRequest/i, 'landing page must not upload backup data');
assert.doesNotMatch(landingPage, /<form\b/i, 'landing page must not submit backup data');

console.log(JSON.stringify({
  result: 'PASS',
  urlLength: url.length,
  snapshots: payload.snapshots.length,
  payloadBytes: Buffer.byteLength(JSON.stringify(payload), 'utf8')
}, null, 2));
