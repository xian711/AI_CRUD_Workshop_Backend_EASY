# CRUD UI Module

## Purpose

根據 `harness/SPEC.md`、既有 CRUD 範例與 Design System，產生可 review 的 CRUD UI 產出。

供 CRUD Mode 與 UI Mode（雛形）使用；只有任務包含 UI、前端表單、列表頁或 Design System mapping 時才載入。

## Compact CRUD Flow

```text
CRUD SDD → UI Spec → Design System Mapping → Page Draft → Token Check → Validation → API Binding → Verify → Summary
```

UI Mode（雛形）走 `/ui-loop` 的縮短版：UI Spec → Page Draft（綁 mock）→ Token Check → 人工目視。

## Rules

- 不發明新 UI 元件、不改 Design System、不改既有 API response 格式。
- 先產 UI Spec，經確認後才產前端程式。
- 每個 loop 以一個列表頁加一個新增 / 編輯表單為限。
- component mapping 缺失 → 標 blocker；欄位行為不明且影響儲存 / 刪除 → 標 blocker；其餘記 Assumption。
- 需要新建的元件超過 3 個 → 以選擇題確認再動工。
- 產出後必跑 `design-token-rules.md` 檢查；違規 → 修正 → 複驗。
- 改共用元件或 token 前，先 grep 所有使用方並列回歸清單。

## 表單與互動慣例（single source，review 對照用）

- Label 一律在欄位上方，不用 placeholder 取代 label。
- 必填欄位加 `*` 標記；驗證錯誤要有文字訊息，不能只有紅框。
- 危險操作二次確認，確認按鈕文字寫明動作（「刪除設備」而非「確認」）。
- 送出中顯示 loading 並防止重複送出；回饋用既有 Toast / Alert 元件。
- 表格內操作按鈕用次要樣式（outline / ghost）。
- 分頁 props 一律給預設值，避免顯示 NaN。
- 可互動元件保留 `focus-visible`；不可 `outline: none` 而無替代。
- 狀態值嚴格依 SPEC 的狀態清單，mock 資料不用隨機字串。

## Required Inputs

- CRUD feature name、Entity / DTO fields、必填與驗證規則
- API endpoints 或 API Spec（UI Mode 可略，用 mock）
- 既有 CRUD 頁範例、Design System 摘要（`design-system-summary.md`）
- 前端框架：Vue / React / Angular / Blazor / Razor Pages / MVC

頁面區塊與產出清單以 `templates/crud-ui/crud-ui-spec-template.md` 為準；輸出格式見 `HARNESS.md`（CRUD 產出加一欄 `TokenCheck`）。
