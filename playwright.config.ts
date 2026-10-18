import {defineConfig} from "@playwright/test";

// Dedicated local test port; never reuse the owner\u0027s existing Codespaces preview on 3000.
const QA_PORT=3101;

export default defineConfig({
 testDir:"./tests",
 fullyParallel:false,
 forbidOnly:Boolean(process.env.CI),
 retries:process.env.CI?1:0,
 workers:1,
 reporter:[["list"],["html",{outputFolder:"playwright-report",open:"never"}]],
 use:{
  baseURL:`http://127.0.0.1:${QA_PORT}`,
  trace:"retain-on-failure",
  screenshot:"only-on-failure",
  video:"off",
  navigationTimeout:30_000,
  actionTimeout:10_000
 },
 projects:[
  {name:"chromium",use:{browserName:"chromium"}},
  {name:"webkit",use:{browserName:"webkit"}}
 ],
 webServer:{
  command:`npm run build && npm start -- -H 127.0.0.1 -p ${QA_PORT}`,
  url:`http://127.0.0.1:${QA_PORT}`,
  timeout:180_000,
  reuseExistingServer:false
 }
});
