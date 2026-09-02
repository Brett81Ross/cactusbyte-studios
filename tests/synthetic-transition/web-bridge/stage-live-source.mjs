import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const targetRoot = path.resolve(process.argv[2] || 'acelynn-live-source');
const prototypeRoot = path.resolve('tests/synthetic-transition/web-bridge');

function read(relative) {
  return fs.readFileSync(path.join(targetRoot, relative), 'utf8');
}
function write(relative, content) {
  const full = path.join(targetRoot, relative);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

const shellPath = 'api/demo-shell.js';
let shell = read(shellPath);
const expectedShellMarker = "if(!html.includes('/demo-help.js'))html=html.replace('</body>','<script src=\"/demo-help.js?v=1.1.2\"></script>\\n</body>');";
if (!shell.includes(expectedShellMarker)) {
  throw new Error('Live demo-shell.js no longer matches the certified migration patch point.');
}

const bridgeInjection = "if(!html.includes('/legacy-export-bridge.js'))html=html.replace('</body>','<script src=\"/legacy-export-bridge.js?v=cutover1\"></script>\\n</body>');";
if (!shell.includes(bridgeInjection)) {
  shell = shell.replace(expectedShellMarker, expectedShellMarker + '\n    ' + bridgeInjection);
}
write(shellPath, shell);

for (const file of ['legacy-export-bridge.js', 'legacy-export.html']) {
  fs.copyFileSync(path.join(prototypeRoot, file), path.join(targetRoot, file));
}

const retiredWorker = `const LEGACY_CACHE_PREFIX='acelynn-pro-';
self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(LEGACY_CACHE_PREFIX)).map(key=>caches.delete(key)));
    await self.registration.unregister();
    await self.clients.claim();
  })());
});
// Intentionally no fetch handler. This worker exists only to retire the legacy cache/service worker.
`;
write('sw.js', retiredWorker);

console.log('Staged live-source migration bridge without modifying app-base.html or index.html.');
