import { defineConfig, devices } from '@playwright/test'

// 全鏈路 E2E 設定（後端 EASY 版｜獨立專案，與 fullchain-app 隔離）
// 前置：run-e2e.ps1 會自管生命週期——先重建 e2e 資料庫、啟後端（5080，指向 _e2e 庫）、
//        啟前端 fullchain-app（3199，API 模式），確認兩端都活著才呼叫本設定，避免對死站點跑測試。
// baseURL 預設 3199：前端 dev server 會把 /api/equipment 經 devProxy 轉發到後端（預設 5080）。
// 前端換了埠，或 run-e2e -ReuseRunning 沿用已啟動的前端時，run-e2e 會用環境變數 BASE_URL 告訴這裡前端在哪。
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  // list：印在終端機，run-e2e 靠它數 passed，不能拿掉。
  // html：測試報告寫到 e2e/playwright-report/index.html，用瀏覽器開；open: 'never' 不自動跳視窗。
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3199',
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
    // 全鏈路請求較慢（過 proxy → .NET → PostgreSQL），放寬單一動作逾時
    actionTimeout: 15000,
    navigationTimeout: 20000,
  },
  timeout: 60000,
  expect: { timeout: 10000 },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
})
