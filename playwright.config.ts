import { defineConfig, devices } from "@playwright/test";

const productionQa = process.env.CACTUSBYTE_PRODUCTION_QA === "1";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: productionQa ? undefined : "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    navigationTimeout: 30_000,
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: productionQa
    ? undefined
    : {
        command: "npm run build && npm start -- -H 127.0.0.1",
        url: "http://127.0.0.1:3000",
        timeout: 180_000,
        reuseExistingServer: !process.env.CI,
      },
});
