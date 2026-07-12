# Design System Summary（防災協作平台）

> 用途：供 AI Harness CRUD / UI Mode 產出時對照的 Design System 摘要（元件對照、token 層級、慣例）。對應 harness 樣板：`modules/crud-ui/design-system-summary.md`。
> **完整版**見 `design-system-kit/docs/design-system-手冊.md` 與 `元件目錄.md`；本檔只留摘要，勿反覆貼完整設計文件（Harness token budget 精神）。
> 數值以 `design-system-kit/tokens/design-token.css` + `comp-tokens.css` 實檔為準。

## Token 層級（三層，引用只能由下往上）

| 層級 | 前綴 / 位置 | 用途 | 元件可否直接用 |
|---|---|---|---|
| REF | `--ui-ref-*`（`tokens/design-token.css`） | 原始色板 50–950、px 間距、字級、圓角、陰影 | ❌ 禁止直接引用 |
| SYS | `--ui-sys-*`（`tokens/design-token.css`） | 語意別名（primary / success / on-surface / spacing-medium…） | ✅ 無對應 COMP 時可用 |
| COMP | `--ui-comp-*`（`tokens/comp-tokens.css`） | 元件專屬 token，只能引用 SYS | ✅ 元件實作優先 |

`COMP → SYS → REF` 唯一正確方向；`COMP → REF`（跨層）、`COMP → hardcode`、`SYS → COMP`（向下）皆違規。Tailwind 別名（`bg-primary`、`text-on-surface`、`p-lg`、`gap-md`、`rounded-lg`…）已綁 token，等同語意引用。
主色為**品牌紅 `#C8232C`**（非舊文件所寫 sky-600 藍）；次要色 secondary 是**中性灰 neutral-300**，非彩色。

## Components（本專案實際元件對照）

| UI Need | Existing Component | Notes |
|---|---|---|
| Primary action | `UButton color="primary" variant="solid" size="md"` | 麵包屑動作列一律 md；每頁主要行動 1–2 個 |
| Secondary action | `UButton color="secondary" variant="solid/outline"` | secondary=中性灰，勿用彩色 |
| Ghost / icon 操作 | `UButton variant="ghost"` + `aria-label` | 表格列操作鈕用 ghost |
| Search form | `UInput` + `USelectMenu`（放於 `CardOutlined`） | label 在欄位上方 |
| Data table | 語意 `<table>` + `AppSortHeader` + `useTableSort` | 非 Nuxt UI UTable；斑馬紋 |
| Pagination | `AppTableFooter` | **canonical props**：`:current-page` `:total-items` `:page-size`；事件 `@update:current-page` `@update:page-size`（勿用 legacy `page`/`total`）|
| Dialog / 確認 | `AppConfirmModal` | `variant="danger/warning/info"`；confirm 事件**不自動關閉**，須自行把 v-model 設回 false |
| Toast / alert | `useToast()`（Nuxt UI） | 成功 `color:'green'`、錯誤 `color:'red'` |
| Date picker | `AppDatePicker` | v-model 為 `YYYY-MM-DD` 字串 |
| Select / dropdown | `USelectMenu` | 篩選一律 `['全部', ...實值]` 純字串 options + `'全部'` 哨兵，勿用空字串 option |
| Checkbox 群組（多值） | `UCheckbox` 橫向 wrap | 選項少（≤4）時比 multi-select 直觀 |
| 地址（縣市→鄉鎮→詳細） | `AppAddressPicker` | `v-model:county/township/road/detail`；`inline` 篩選並排、預設堆疊表單 |
| 狀態 badge | `UBadge` + `TemplateStatusBadge`（本範本） | 膠囊 `rounded-full`；neutral 需手動 `bg-surface-variant text-on-surface-variant` |
| 卡片容器 | `CardOutlined` / `CardElevated` / `CardUnderlined` | 圓角 16px、內距 24px（`p-lg`）|
| 欄位（label+錯誤） | `FormRow`；本範本擴充 `TemplateFormField` | 擴充而非改 FormRow（開放封閉）|

## Layout Rules

- 頁面外層 `space-y-lg`（區塊間距）；卡片內欄位 `gap-md`。
- 內容容器用 `CardOutlined`；分組區塊比照 equipment-center「每欄一張卡」。
- 頁面主要操作**一律 Teleport 到 `#breadcrumb-actions`**（次要/返回用 `#breadcrumb-actions-left`），內容區不重複渲染主要按鈕。
- 麵包屑 label / icon 由 layout `sidebarRouteMap` 統一定義，勿在 `definePageMeta` 自寫。
- 模組底色依功能類別：**平時=白/淡色、災時=橘、演練/訓練=淡黃**；本 CRUD 範本屬「平時」→ township layout 預設白/淡灰底，不做災時橘/演練黃。

## Form Rules

- Label 一律在欄位**上方**，不用 placeholder 取代 label。
- 必填欄位加紅色 `*`；錯誤訊息以文字呈現，不可只有紅框。
- 欄位級錯誤：`TemplateFormField` 於欄位下方渲染紅字（`text-[var(--ui-sys-color-error)] text-label-small`），並以 `aria-describedby` 關聯。
- 儲存有錯 → 聚焦第一個錯誤欄位（`data-field` 定位 + `.focus()`），並 toast「請修正 N 個欄位」；不得只用 toast 帶過。
- 送出中顯示 loading 並防重複送出；危險操作二次確認，確認鈕文字寫明動作（「刪除人員」非「確認」）。

## Table Rules

- 桌機語意 `<table>`（`hidden md:block`）；`md`（768px）以下切換手機卡片（`md:hidden`），兩者資訊等價（NFR）。
- 斑馬紋 + hover 高亮，用 SYS 別名 class（`bg-surface-variant` 等）；`striped` 與 `selected` 不同時用於同列。
- 表頭 `bg-surface-variant` + 字重 strong；可排序欄用 `AppSortHeader`。
- 狀態 badge 對照：在職 → `UBadge color="success"`；停用 → neutral 膠囊（`bg-surface-variant text-on-surface-variant`）。對照表定義為具名常數（Replace Conditional with Lookup）。
- 操作鈕：ghost + `aria-label`，列內 `@click.stop` 防冒泡誤觸列點擊。

## Validation Rules

- 驗證用純函式 `validateFields(form, rules)`（`utils/templateValidation.ts`），無 UI 依賴；回傳 `{ 欄位名: 第一條未通過訊息 }`。
- 空值且非 required → 跳過 pattern（Email 選填但填了須合法）。
- 具名常數 pattern：`PHONE_PATTERN = /^09\d{8}$/`、`TW_ID_PATTERN = /^[A-Z][12]\d{8}$/`、`EMAIL_PATTERN`。
- 相依規則（證號依 idType）在頁面層以 `rulesFor(form)` 產生，引擎保持無狀態。

## Token Check（產出後必跑）

依 `design-system-kit`（等同 harness `modules/crud-ui/design-token-rules.md`）：搜 R001 硬編碼色值、R002 引用 REF、R003 硬編碼間距/裸數字 utility、R004 `!important`、W001 缺 focus-visible。
⚠️ 既有 `comp-tokens.css` 有已知自我違規（見手冊第 9 章 #4：部分 COMP 硬編碼 / 跨層引用 REF），跑檢查時屬既有技術債，非本次新增產出的違規，應排除誤報。
