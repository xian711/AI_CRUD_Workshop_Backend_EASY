# CLAUDE.md — sample-app 專案憲法

> 這是 sample-app（CRUD 標準範本示範專案）的鐵律。AI 每次對話自動讀，一行一條，照做即符合規範。
> 細則見同資料夾 `CODE-RULES-ui-本專案.md`；視覺規範見同資料夾 `design-system-summary.md`。

## 這是什麼專案

- 人員 CRUD 標準範本，可獨立跑：`cd sample-app → pnpm install → pnpm dev → http://localhost:3100/template/crud`。
- 用途：複製改名即成新 CRUD 模組；範本正本不要改壞。

## 技術棧鎖定（禁換、禁升版）

- Vue 3 + TypeScript + **Nuxt 3**（鎖 3.21.1）+ **Nuxt UI v2**；套件管理用 **pnpm**。
- **非** Vite/Pinia/axios 架構；不准擅自加 Pinia、axios、狀態庫或任何新套件。
- 不升 Nuxt/Vite 版本（caret 會拉到有回歸的組合）；日期欄用原生 `UInput type="date"`，禁用 v-calendar 系 DatePicker。

## 檔案地圖（能改 vs 不能動）

- **複製改名**（綁定實體，開新模組時複製）：`pages/template/crud/index.vue`、`[id].vue`、`composables/useTemplateMembers.ts`、`components/template/TemplateFormField.vue`、`TemplateStatusBadge.vue`。
- **直接共用**（與實體無關，禁複製、禁亂改）：`composables/useTemplateListPage.ts`、`composables/useTableSort.ts`、`utils/templateValidation.ts`、`utils/templateCsv.ts`、`utils/taiwanAddress.ts`、所有 `components/App*.vue`。
- 判準：與「這個實體長什麼樣子」有關 → 複製；通用機制 → 共用。

## 程式規則精華（10 條）

1. 元件一律 `<script setup lang="ts">`；無 `any` 滲漏，enum/狀態值嚴格照 SPEC。
2. 命名空間隔離：範本模組一律 `Template`/`template` 前綴，複製時整組改名，別污染別的模組。
3. 資料層 = module-level `ref` 單例 + `ensureSeeded()`；CRUD 全非同步回 `Promise`，`getById` 回深拷貝；預留 `useFetch('/api/...')` 接縫。
4. 樣式禁硬編碼 hex/px，一律走 token 別名（`bg-primary`、`text-on-surface`、`p-lg`、`gap-md`、`rounded-lg`）；禁引用 REF、禁 `!important`、禁 `<style scoped>` 蓋 Nuxt UI。
5. 驗證用純函式 `validateFields(form, rules)`；相依規則以 `rulesFor(form)` 於頁面層產生，引擎保持無狀態；pattern 用具名常數。
6. 篩選下拉 options 一律 `['全部', ...實值]` 純字串 + `'全部'` 哨兵；**禁用空字串當「全部」**。
7. URL 同步用 `useTemplateListPage` 工廠，只寫非預設值；debounce 收尾一定配 `onScopeDispose` 清理。
8. CSV 用現成 `exportCsv(filename, columns, rows)`（RFC 4180 + UTF-8 BOM）；匯出篩選＋排序後全量，非只當頁。
9. 單檔 ≤ 500 行（列表頁 ≤ 420、明細頁 ≤ 550 為明訂例外）；無 magic literal、**禁 `console.log`**、無死碼。
10. 主要動作一律 `Teleport to="#breadcrumb-actions"`，且保留 `v-if="teleportReady"`（hard-load 才不會崩）。

## Design System

- 一句話：顏色／間距／元件一律照 Design System 的 token 三層（COMP→SYS→REF），只能由下往上引用。
- token 實檔在工作坊 `step2_speedrun_kit/2.4_design_system/tokens/`（重點摘要見同資料夾 `design-system-summary.md`）；主色品牌紅 `#C8232C`。

## 開發流程

- 改完自己跑 `pnpm dev` 確認畫面能動、typecheck 不報錯，再回報。
- 回報格式精簡：只列 changed files、驗證結果、下一步；一次 summary 20 行內。
- 回覆用台灣白話繁中，不用大陸用語（呼叫/預設/資料庫/元件/使用者/程式碼/介面）。
- 只在 blocker 問人，用選擇題（2–4 選項、標建議）；不發明元件與商業規則。

> 完整細則見 `CODE-RULES-ui-本專案.md`。
