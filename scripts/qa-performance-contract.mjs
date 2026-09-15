import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync(new URL("../src/app/page.tsx",import.meta.url),"utf8");

assert.match(
 page,
 /<img src=\{a\.logo\} alt=\{`\$\{a\.shortName\} logo`\} width=\{50\} height=\{50\} loading="lazy" decoding="async"\/>/,
 "App-card logos must reserve 50x50 space and defer off-screen image decoding/loading"
);
assert.match(page,/void syncNow\(false\)/,"Initial registry sync must stay non-blocking for the first usable screen");
assert.doesNotMatch(page,/await syncNow\(false\)/,"Initial registry sync must not block first render");
assert.match(page,/navigator\.serviceWorker\.getRegistrations\(\).*unregister\(\)/s,"The hub must continue unregistering stale service workers");
assert.doesNotMatch(page,/navigator\.serviceWorker\.register\(/,"The hub must not register a service worker");

console.log("CactusByte performance contract: PASS");
