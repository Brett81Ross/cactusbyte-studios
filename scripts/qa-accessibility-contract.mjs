import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const polish=readFileSync(new URL("../src/app/button-polish.css",import.meta.url),"utf8");
const mobile=readFileSync(new URL("../src/app/mobile.css",import.meta.url),"utf8");
const personalization=readFileSync(new URL("../src/app/personalization.css",import.meta.url),"utf8");

for(const selector of ["a","input","select","textarea","summary"]){
 const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
 const focusSelector=new RegExp(`(?:^|,|\\n)\\s*${escaped}:focus-visible\\s*(?:,|\\{)`,`m`);
 assert.match(polish,focusSelector,`${selector} must have an explicit visible keyboard focus state`);
}

assert.match(
 polish,
 /\.ideaSources a\{[^}]*min-height:(?:4[8-9]|[5-9]\d)px/s,
 "Idea Radar evidence links must provide at least a 48px touch target"
);
assert.match(
 polish,
 /\.ideaGrid summary\{[^}]*min-height:(?:4[8-9]|[5-9]\d)px/s,
 "Idea details summaries must provide at least a 48px touch target"
);
assert.match(mobile,/button,\.actions a\{min-height:50px/,"Primary mobile controls must remain at least 48px tall");
assert.match(polish,/@media \(prefers-reduced-motion:reduce\)/,"Button polish must respect reduced-motion preferences");
assert.match(personalization,/@media\(prefers-reduced-motion:reduce\)/,"Personalization animation must respect reduced-motion preferences");

console.log("CactusByte accessibility contract: PASS");
