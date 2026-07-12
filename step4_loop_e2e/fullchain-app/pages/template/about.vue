<!--
  CRUD 標準範本 — 範本說明頁（靜態導覽）
  ────────────────────────────────────────────────
  內容濃縮自 doc/crud-template/README.md，供教育訓練與新模組開發者快速理解本範本。
  純靜態頁：無資料層、無互動邏輯，僅以 CardOutlined 分區塊 + design token 排版。
-->
<template>
  <div class="space-y-lg">
    <!-- 1. 這是什麼 -->
    <CardOutlined>
      <h2 class="text-headline-medium font-heavy text-on-surface">這是什麼</h2>
      <p class="mt-sm text-body-medium leading-relaxed text-on-surface-variant">
        一套「可執行、可展示、可複製」的前端 CRUD 開發標準，以人力暨輪值編排頁為藍本重新設計，
        用約 <span class="font-emphasis text-on-surface">1/3 的程式量</span> 做出更完整的功能與更高的品質，供教育訓練與新模組開發使用。
      </p>
      <dl class="mt-md grid grid-cols-1 gap-sm sm:grid-cols-3">
        <div v-for="meta in metaCards" :key="meta.label" class="rounded-lg bg-surface-variant p-md">
          <dt class="text-label-small text-on-surface-variant">{{ meta.label }}</dt>
          <dd class="mt-1 text-body-medium font-emphasis text-on-surface">{{ meta.value }}</dd>
        </div>
      </dl>
    </CardOutlined>

    <!-- 2. 交付程式（8 檔） -->
    <section>
      <h2 class="text-headline-medium font-heavy text-on-surface">交付程式（frontend/，8 檔）</h2>
      <p class="mt-1 text-body-medium text-on-surface-variant">全部以 <span class="font-mono">Template</span> 命名空間隔離，合計約 1,420 行。</p>
      <CardOutlined :ui="{ body: { padding: 'p-0' } }" class="mt-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-body-medium">
            <thead class="bg-surface-variant text-label-small text-on-surface-variant">
              <tr>
                <th class="px-4 py-2 text-left">檔案</th>
                <th class="px-4 py-2 text-left">角色</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant">
              <tr v-for="file in codeFiles" :key="file.path">
                <td class="whitespace-nowrap px-4 py-2.5 font-mono text-on-surface">{{ file.path }}</td>
                <td class="px-4 py-2.5 text-on-surface-variant">{{ file.role }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardOutlined>
    </section>

    <!-- 3. 5 分鐘展示 -->
    <section>
      <h2 class="text-headline-medium font-heavy text-on-surface">5 分鐘展示</h2>
      <CardOutlined class="mt-sm">
        <ol class="space-y-sm">
          <li v-for="(step, i) in demoSteps" :key="i" class="flex items-start gap-sm">
            <span class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-label-small font-heavy text-on-primary">
              {{ i + 1 }}
            </span>
            <span class="text-body-medium leading-relaxed text-on-surface-variant">{{ step }}</span>
          </li>
        </ol>
      </CardOutlined>
    </section>

    <!-- 4. 文件位置 -->
    <section>
      <h2 class="text-headline-medium font-heavy text-on-surface">文件位置（doc/crud-template/）</h2>
      <CardOutlined :ui="{ body: { padding: 'p-0' } }" class="mt-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-body-medium">
            <thead class="bg-surface-variant text-label-small text-on-surface-variant">
              <tr>
                <th class="px-4 py-2 text-left">文件</th>
                <th class="px-4 py-2 text-left">用途</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant">
              <tr v-for="doc in docFiles" :key="doc.path">
                <td class="whitespace-nowrap px-4 py-2.5 font-mono text-on-surface">{{ doc.path }}</td>
                <td class="px-4 py-2.5 text-on-surface-variant">{{ doc.role }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardOutlined>
    </section>

    <!-- 5. 延伸工具（design-system-kit / harness-bridge） -->
    <section>
      <h2 class="text-headline-medium font-heavy text-on-surface">延伸工具</h2>
      <div class="mt-sm grid grid-cols-1 gap-md md:grid-cols-2">
        <CardOutlined v-for="kit in extraKits" :key="kit.name">
          <div class="flex items-center gap-2">
            <UIcon :name="kit.icon" class="h-5 w-5 text-primary" />
            <h3 class="text-body-large font-heavy text-on-surface">{{ kit.name }}</h3>
          </div>
          <p class="mt-xs text-body-medium leading-relaxed text-on-surface-variant">{{ kit.desc }}</p>
        </CardOutlined>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'template', pageTitle: '範本說明' })

const metaCards = [
  { label: '展示網址', value: '/template/crud' },
  { label: '範圍', value: '前端 + UIUX' },
  { label: '版本', value: 'v1.1（2026-07-10）' },
]

const codeFiles = [
  { path: 'pages/template/crud/index.vue', role: '列表頁：篩選＋排序＋分頁＋URL 同步＋匯出＋刪除確認' },
  { path: 'pages/template/crud/[id].vue', role: '明細頁：檢視／編輯／新增三合一 + 欄位級驗證' },
  { path: 'composables/useTemplateMembers.ts', role: '資料層：型別＋24 筆種子＋async CRUD API（後端接軌縫）' },
  { path: 'composables/useTemplateListPage.ts', role: '通用列表狀態工廠：篩選＋分頁＋URL 同步' },
  { path: 'utils/templateValidation.ts', role: '純函式驗證引擎（規則資料化）' },
  { path: 'utils/templateCsv.ts', role: 'CSV 匯出（RFC 4180＋BOM）' },
  { path: 'components/template/TemplateFormField.vue', role: '表單欄位容器（label＋必填星號＋錯誤紅字＋聚焦錨點）' },
  { path: 'components/template/TemplateStatusBadge.vue', role: '狀態 badge（查表）' },
]

const demoSteps = [
  '在 frontend/ 執行 pnpm dev，開啟 /template/crud',
  '關鍵字打「陳」→ 即時過濾，300ms 後 URL 出現 ?q=陳（重整不掉狀態）',
  '進階 → 縣市選「臺東縣」→ 鄉鎮下拉自動載入 → 徽章顯示啟用數',
  '點「姓名」表頭排序 → URL 出現 sort=name:asc',
  '點任一列進檢視頁（標題變「檢視人員」）→ 編輯 → 清空姓名儲存 → 欄位紅字＋自動聚焦＋toast',
  '新增人員 → 填必填 → 儲存 → 綠色 toast → 返回列表（原查詢狀態還原）',
  '刪除 → 二次確認（含姓名）→ 匯出 CSV（Excel 直開不亂碼）',
  '視窗縮到手機寬 → 卡片視圖（資訊與桌機等價）',
]

const docFiles = [
  { path: 'README.md', role: '入口與導覽' },
  { path: 'SRS-CRUD標準範本-v1.0.md', role: '需求規格（UC／FR-T／BR-T／NFR-T）' },
  { path: 'SDD-CRUD標準範本-v1.1.md', role: '設計規格（v1.1 含審查修訂 13 項＋三段勘誤）' },
  { path: 'UML圖面-CRUD標準範本.html', role: '7 張大字級圖：用例／架構／類別／狀態／循序（投影可用）' },
  { path: '使用說明-複製範本開發新模組.md', role: '複製範本開發新模組的完整流程＋FAQ' },
  { path: '教育訓練教材.md', role: '課程教材：demo 腳本、檔案導讀、Clean Code 十講、陷阱七講' },
  { path: '開發過程紀錄.md', role: 'AI 多代理開發全過程（SDD→審查→修正→E2E）' },
  { path: '成果報告.md', role: '最終成果、驗收結果、已知問題、後續建議' },
]

const extraKits = [
  {
    name: 'design-system-kit',
    icon: 'i-heroicons-swatch',
    desc: '三層 token ＋ Nuxt UI 覆蓋設定 ＋ 元件規範，可整包帶去新專案的「長什麼樣」。',
  },
  {
    name: 'harness-bridge',
    icon: 'i-heroicons-link',
    desc: '與 AI Harness 教學框架的橋接件，串起 SPEC → BUILD → REVIEW 開發流程的「怎麼管」。',
  },
]
</script>
