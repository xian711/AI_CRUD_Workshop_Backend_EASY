# CODE-RULES-ui（防災協作平台前端程式規範）

> 用途：本專案前端的實際程式規則，供 AI Harness CRUD / UI Mode 改碼前對照。**取代** harness 樣板內取自 原單位前端範本（Vite/Pinia/axios）的預設值。對應 harness 樣板：`harness/CODE-RULES-ui.md`。
> 提煉自 `frontend/CLAUDE.md` + `SDD-CRUD標準範本-v1.1.md` UIUX 規範 + Clean Code 對照表。純後端工作不必讀本檔。

| 項目 | 規範 |
|---|---|
| 技術棧 | Vue 3 + TypeScript + **Nuxt 3** + Nuxt UI v2（Headless UI + Tailwind）；元件一律 `<script setup lang="ts">`。**非** Vite/Pinia/axios 架構 |
| 檔名 | 元件 **PascalCase**（`TemplateFormField.vue`）；composable `useXxx.ts`；util camelCase（`templateCsv.ts`）。Nuxt 依目錄前綴去重：`components/template/TemplateFormField.vue` → 使用名 `<TemplateFormField>` |
| 目錄 | `pages/{路由}/`、`components/{模組}/`、`composables/`、`utils/`；共用元件放 `components/`（`App*` 前綴）。範本模組一律以 `Template`/`template` 命名空間隔離，複製改名即成新模組 |
| Props | `defineProps<{...}>()` 泛型 ＋ `withDefaults`；雙向綁定 `defineModel` / `v-model:xxx`；事件 `defineEmits<>()` |
| 匯入慣例 | `utils/` 下函式**顯式 import**（`import { exportCsv } from '~/utils/templateCsv'`）；`composables/`、`components/` 走 Nuxt auto-import。實作前先 grep 確認名稱無衝突 |
| 資料層 | composable module-level `ref` 單例 + `ensureSeeded()`（一次性深拷貝種子）；CRUD 函式**全非同步回 Promise**，預留 `useFetch('/api/...')` 接縫；`getById` 回**深拷貝**防表單改到 store。本範本**無 Pinia**（前端記憶體單例即可）|
| 跨檔匯入 | 一律 `~/` alias（`~/utils/…`、`~/composables/…`）|
| 樣式 | 依 design token 三層（COMP→SYS→REF）與同資料夾 `design-system-summary.md`（token 實檔見工作坊 `step2_speedrun_kit/2.4_design_system/`）；**禁止**硬編碼 hex/px、禁止引用 REF、禁止 `<style scoped>` 蓋 Nuxt UI（改 `app.config.ts` 的 `ui`）、禁止 `!important` |
| Token 別名 | 用 Tailwind 別名等同語意引用：`bg-primary`、`text-on-surface`、`border-outline-variant`、`p-lg`、`gap-md`、`rounded-lg`。有 COMP token 者用 `[var(--ui-comp-*)]` |
| 表單互動 | 依 design-system-summary 之 Form/Table Rules：Label 在上、必填 `*`、欄位級錯誤紅字、危險操作二次確認且確認鈕寫明動作、送出防重複、分頁 props 給預設值、`focus-visible` 不可拿掉 |
| 主要動作 | 一律 `Teleport to="#breadcrumb-actions"`（返回/次要用 `-left`），內容區不重複渲染；動作列按鈕統一 `size="md"` |
| 驗證 | 純函式 `validateFields(form, rules)`（`utils/templateValidation.ts`），rules 資料化；具名常數 `PHONE_PATTERN` `TW_ID_PATTERN` `EMAIL_PATTERN`；相依規則以 `rulesFor(form)` 於頁面層產生 |
| URL 同步 | 用 `useTemplateListPage` 工廠（篩選+分頁+URL 同步+返回還原）；僅寫入非預設值；debounce 具名常數 `SYNC_DEBOUNCE_MS`（300ms），dispose 時清理、寫回前確認仍在原路由 |
| 下拉哨兵 | 篩選下拉 options 一律 `['全部', ...實值]` 純字串 + `'全部'` 哨兵，`value !== '全部'` 才過濾；勿用空字串 option |
| CSV | `exportCsv(filename, columns, rows)`（`utils/templateCsv.ts`）：RFC 4180 跳脫 + UTF-8 BOM；匯出全量（篩選+排序後），非僅當頁 |
| 行數預算 | 單檔 ≤ 500 行（列表頁 ≤ 420、明細頁 ≤ 550 為明訂例外；超出允許抽 `TemplateMemberForm.vue`）；無 magic literal（抽具名常數）、無 `console.log`、無死碼 |
| 響應式 | 衍生資料一律 `computed`；template 內不執行 O(n) 掃描函式（NFR-T-05）|
| 型別 | 無 `any` 滲漏；enum/狀態值嚴格依 SPEC 清單，mock 不用隨機字串 |
| 模組底色 | 依功能類別：平時=白/淡色、災時=橘、演練=淡黃。改 banner/背景/accent 前先判斷類別。本 CRUD 範本屬平時 |
| 註解 | 只寫「為什麼」；中英文之間加半形空格 |

## 範本檔案（照著這個寫，位於專案根目錄）

複製改名即成新 CRUD 模組；Harness 的 Existing CRUD example 一律指向此處。

| 類型 | 範本 |
|---|---|
| 列表頁（篩選/排序/分頁/URL/匯出/刪除確認） | `pages/template/crud/index.vue` |
| 明細頁（檢視/編輯/新增三合一） | `pages/template/crud/[id].vue` |
| 資料層（型別+種子+非同步 CRUD） | `composables/useTemplateMembers.ts` |
| 列表狀態工廠（篩選+分頁+URL 同步）| `composables/useTemplateListPage.ts` |
| 驗證引擎（純函式）| `utils/templateValidation.ts` |
| CSV 匯出 util | `utils/templateCsv.ts` |
| 欄位元件（label+紅星+錯誤紅字）| `components/template/TemplateFormField.vue` |
| 狀態 badge | `components/template/TemplateStatusBadge.vue` |
| Design System 摘要 / Token 規則 | 同資料夾 `design-system-summary.md`；token 實檔見工作坊 `step2_speedrun_kit/2.4_design_system/` |

## Clean Code 對照（教學錨點，詳見 SDD §10）

抽取共用列表狀態（Extract Function）、查表取代條件（Replace Conditional with Lookup）、純函式驗證分離業務與 UI、後端接縫（針對介面而非實作）、字面量種子（顯性優於聰明）、Guard Clauses、防禦性深拷貝、具名常數、開放封閉（擴充 FormRow 而非改）、複用 AppAddressPicker、單檔行數預算、誠實標注抽象邊界（僅字串 filter）。
