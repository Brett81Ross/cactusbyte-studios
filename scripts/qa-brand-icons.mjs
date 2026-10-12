// Browser + installed-shortcut brand identity regression gate.
import fs from "node:fs";

const layout=fs.readFileSync("src/app/layout.tsx","utf8");
const manifest=fs.readFileSync("src/app/manifest.ts","utf8");
const route192=fs.readFileSync("src/app/pwa-icon-192/route.tsx","utf8");
const route512=fs.readFileSync("src/app/pwa-icon-512/route.tsx","utf8");
const checks=[
 ["Browser favicon explicitly prefers the established CactusByte logo",layout.includes('{ url: "/logo2.png", type: "image/png" }')],
 ["Desktop shortcut metadata explicitly uses the CactusByte logo",layout.includes('shortcut: [{ url: "/logo2.png", type: "image/png" }]')],
 ["Raster 192px install icon remains declared",layout.includes("/pwa-icon-192")&&manifest.includes('sizes: "192x192"')],
 ["Raster 512px install icon remains declared",layout.includes("/pwa-icon-512")&&manifest.includes('sizes: "512x512"')],
 ["Maskable 512px install identity remains declared",manifest.includes('purpose: "maskable"')],
 ["Stable PWA id and scope remain intact",manifest.includes('id: "/"')&&manifest.includes('scope: "/"')],
 ["192 icon endpoint still renders canonical logo",route192.includes("/logo2.png")],
 ["512 icon endpoint still renders canonical logo",route512.includes("/logo2.png")]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?"✓":"✗"} ${name}`);if(!ok)failed++}
console.log(`\n${checks.length-failed} passed · ${failed} failed`);if(failed)process.exit(1);
