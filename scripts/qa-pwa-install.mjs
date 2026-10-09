import fs from "node:fs";

const manifest = fs.readFileSync("src/app/manifest.ts", "utf8");
const layout = fs.readFileSync("src/app/layout.tsx", "utf8");
const route192 = fs.readFileSync("src/app/pwa-icon-192/route.tsx", "utf8");
const route512 = fs.readFileSync("src/app/pwa-icon-512/route.tsx", "utf8");

const checks = [
  ["manifest has stable app id", /id:\s*"\/"[,\n]/.test(manifest)],
  ["manifest scope is root", /scope:\s*"\/"[,\n]/.test(manifest)],
  ["manifest starts at root", /start_url:\s*"\/"[,\n]/.test(manifest)],
  ["manifest uses standalone display", /display:\s*"standalone"/.test(manifest)],
  ["manifest declares 192 icon", /src:\s*"\/pwa-icon-192"[\s\S]*sizes:\s*"192x192"/.test(manifest)],
  ["manifest declares 512 icon", /src:\s*"\/pwa-icon-512"[\s\S]*sizes:\s*"512x512"/.test(manifest)],
  ["manifest declares maskable icon", /purpose:\s*"maskable"/.test(manifest)],
  ["browser metadata uses 192 icon", /url:\s*"\/pwa-icon-192"[\s\S]*sizes:\s*"192x192"/.test(layout)],
  ["browser metadata uses 512 icon", /url:\s*"\/pwa-icon-512"[\s\S]*sizes:\s*"512x512"/.test(layout)],
  ["192 route emits 192 square", /width:\s*192/.test(route192) && /height:\s*192/.test(route192)],
  ["512 route emits 512 square", /width:\s*512/.test(route512) && /height:\s*512/.test(route512)],
  ["icon routes derive from canonical logo", /\/logo2\.png/.test(route192) && /\/logo2\.png/.test(route512)],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "✓" : "✗"} ${name}`);
  if (!ok) failed += 1;
}
console.log(`\n${checks.length - failed} passed · ${failed} failed`);
if (failed) process.exit(1);
