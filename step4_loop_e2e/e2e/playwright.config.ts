import { defineConfig, devices } from '@playwright/test'

// 全鏈路 E2E 設定（後端 EASY 版｜獨立專案，與 fullchain-app 隔離）
// 前置：run-e2e.ps1 會自管生命週期——先重建 e2e 資料庫、啟後端（5080，指向 _e2e 庫）、
//        啟前端 fullchain-app（3199，API 模式），確認兩端都活著才呼叫本設定，避免對死站點跑測試。
// baseURL 鎖 3199：前端 dev server 會把 /api/equipment 經 devProxy 轉發到後端 5080。
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3199',
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
