import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const envExample=readFileSync(new URL("../.env.example",import.meta.url),"utf8");
const route=readFileSync(new URL("../src/app/api/idea-radar/route.ts",import.meta.url),"utf8");

assert.match(envExample,/^OPENAI_API_KEY=your_openai_api_key$/m,".env.example must declare the server-only OPENAI_API_KEY used by Idea Radar");
assert.match(envExample,/^OPENAI_IDEA_RADAR_MODEL=gpt-5\.5$/m,".env.example must declare the optional Idea Radar model override");
assert.doesNotMatch(envExample,/NEXT_PUBLIC_OPENAI/i,"OpenAI credentials must never use a NEXT_PUBLIC_ environment variable");
assert.match(route,/process\.env\.OPENAI_API_KEY/,"Idea Radar must read OPENAI_API_KEY only on the server route");
assert.match(route,/process\.env\.OPENAI_IDEA_RADAR_MODEL\|\|["']gpt-5\.5["']/,"Idea Radar must keep the documented gpt-5.5 fallback model");
assert.doesNotMatch(route,/NEXT_PUBLIC_OPENAI/i,"Idea Radar must not reference a browser-exposed OpenAI environment variable");
assert.match(route,/Authorization:`Bearer \$\{apiKey\}`/,"Idea Radar must send the server-only API key in the OpenAI Authorization header");
assert.match(route,/state:["']configuration-required["'].*status:503/s,"Idea Radar must fail closed with configuration-required when OPENAI_API_KEY is absent");
assert.doesNotMatch(route,/console\.(?:log|info|warn|error)\([^\n]*apiKey/i,"Idea Radar must not log the OpenAI API key variable");

console.log("Idea Radar OpenAI environment contract: PASS");
