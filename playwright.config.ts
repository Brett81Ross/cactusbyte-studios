import {defineConfig} from "@playwright/test";

export default defineConfig({
 testDir:"./tests",
 fullyParallel:false,
 forbidOnly:Boolean(process.env.CI),
 retries:process.env.CI?1:0,
 workers:1,
 reporter:[["list"],["html",{outputFolder:"playwright-report",open:"never"}]],
 use:{
  baseURL:"http://127.0.0.1:3000",
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
  command:"npm run build && npm start -- -H 127.0.0.1",
  url:"http://127.0.0.1:3000",
  timeout:180_000,
  reuseExistingServer:!process.env.CI
 }
});
