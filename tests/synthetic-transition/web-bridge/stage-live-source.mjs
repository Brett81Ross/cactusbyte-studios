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

const migrationWorker = `const LEGACY_CACHE_PREFIX='acelynn-pro-';
const MIGRATION_SHELL='/api/demo-shell.js';

self.addEventListener('install',event=>{self.skipWaiting()});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(LEGACY_CACHE_PREFIX)).map(key=>caches.delete(key)));
    await self.clients.claim();

    // Activation-time navigation must not depend on this newly activated worker intercepting a
    // second root request. Send legacy root clients straight to the same-origin migration shell;
    // that shell injects the HTTPS export bridge while preserving the existing localStorage origin.
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    await Promise.all(windows.map(client=>{
      try{
        const url=new URL(client.url);
        if(url.origin===self.location.origin&&(url.pathname==='/'||url.pathname==='/index.html')){
          return client.navigate(new URL(MIGRATION_SHELL,self.location.origin).href);
        }
      }catch(error){}
      return Promise.resolve();
    }));
  })());
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.mode!=='navigate')return;

  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname!=='/'&&url.pathname!=='/index.html')return;

  // No cache is written. Future legacy root navigations are replaced with the server-generated
  // shell that injects legacy-export-bridge.js. All other requests remain normal network traffic.
  event.respondWith(fetch(MIGRATION_SHELL,{cache:'no-store',credentials:'same-origin'}));
});
`;
write('sw.js', migrationWorker);

console.log('Staged live-source migration bridge without modifying app-base.html or index.html.');
