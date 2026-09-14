import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const route=readFileSync(new URL("../src/app/api/idea-radar/route.ts",import.meta.url),"utf8");

assert.match(
 route,
 /include:\s*\[\s*["']web_search_call\.action\.sources["']\s*\]/,
 "Idea Radar must request the authoritative web_search_call.action.sources list from the Responses API"
);
assert.match(
 route,
 /tool_choice:\s*["']required["']/,
 "Idea Radar must require a web-search tool call before accepting researched ideas"
);
assert.match(
 route,
 /item\.type\s*===\s*["']web_search_call["']/,
 "Idea Radar evidence verification must read web_search_call output items"
);
assert.match(
 route,
 /action\?\.sources|action\.sources/,
 "Idea Radar evidence verification must read web search action sources"
);
assert.match(
 route,
 /sourceKey\(/,
 "Idea Radar must compare source URLs with a canonical key instead of brittle exact URL equality"
);
assert.doesNotMatch(
 route,
 /citations\.has\(source\.url\)/,
 "Idea Radar must not reject a valid source solely because tracking parameters changed its exact URL string"
);

console.log("Idea Radar OpenAI evidence contract: PASS");
