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
 ["512 icon endpoint still renders canonical logo",route512.includes("/logo2.png")],
 ["Install icons embed actual canonical logo bytes without self-fetch", [route192,route512].every(route=>route.includes('readFile(join(process.cwd(), "public/logo2.png"))')&&route.includes("data:image/png;base64")&&!route.includes("new URL("))],
 ["192 icon dimensions use numeric values",route192.includes("width={157}")&&route192.includes("height={157}")],
 ["512 icon dimensions use numeric values",route512.includes("width={420}")&&route512.includes("height={420}")],
 ["Install icon generator uses Node for local image bytes", [route192,route512].every(route=>route.includes('runtime = "nodejs"'))]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?"✓":"✗"} ${name}`);if(!ok)failed++}
console.log(`\n${checks.length-failed} passed · ${failed} failed`);if(failed)process.exit(1);
