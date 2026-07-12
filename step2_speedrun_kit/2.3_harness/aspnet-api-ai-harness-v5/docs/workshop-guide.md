# Workshop Guide（3 × 2 小時）

## 第 1 堂：API Mode

### 0:00–0:15 Concept

說明：Model 是引擎，Harness 是流程與治具。這版 Harness 用一套 compact SDD loop 支援 API Mode 與 CRUD Mode，加上 Review 閘門。

先講六條鐵律（`HARNESS.md`），每條配一個 `docs/case-studies.md` 的真實案例。

### 0:15–0:35 API Mode Demo

直接問 AI：「幫我寫查詢派工單 API」。讓工程師觀察 response 格式、錯誤碼、測試是否亂猜。

再填 `harness/SPEC.md`（含 FR / BR 編號），執行：

```text
/api-loop 查詢派工單清單 API
```

### 0:35–1:20 API Harness Review

工程師只看四件事：

- API contract 是否符合既有專案
- mock data 是否覆蓋情境、是否標示為測試資料
- TDD cases 是否可驗證、是否對應 FR
- blockers 是否真的需要人工回答

### 1:20–1:50 誠實原則與 smoke 演練

故意留一個未實作的端點，看 AI 是回 `501` 還是回假 `200`。對照鐵律 2 討論。

接著看 L2 smoke：AI 自己把 API 跑起來、用 `curl.exe` 實打、貼真實回應、交付附指令與 `.http` 檔。順便看 Swagger UI（dev 環境）上的即時文件。

### 1:50–2:00 Next Use

每位工程師帶一個熟悉 API 回去，用同一套 loop 實作。

## 第 2 堂：CRUD Mode

### 0:00–0:15 Concept

CRUD 不是直接產生畫面，而是先 CRUD SDD；UI Spec 確認後才產前端程式。若情境只是畫面雛形（無後端），改用 `/ui-loop`：綁 mock、標 `// TODO: DEV 串接`、美學標「待人工目視」。

### 0:15–0:35 填 SPEC 與 Design System 摘要

使用 `examples/device-crud-sample.md`，填 `modules/crud-ui/design-system-summary.md`（含 token 層級表）。

### 0:35–1:20 執行與觀察

```text
/crud-loop 設備資料維護 CRUD
```

Review：

- UI Spec 是否符合 Design System
- 欄位驗證是否完整（必填 `*`、錯誤文字訊息）
- Token check 是否通過；「需手動確認」項是誰來確認
- 是否有亂發明元件或商業規則

### 1:20–1:50 Token 檢查閉環演練

故意塞一個硬編碼色值，看 check → fix → 複驗的回圈是否收斂。

### 1:50–2:00 收尾

回填 `harness/LESSONS.md` 一條本堂踩到的坑。

## 第 3 堂：Review Gate 與分級驗證

### 0:00–0:15 Concept

審寫分離：產碼的對話不自審。講 `modules/review/REVIEW.md` 的三維度與雙向偵測（不只找缺漏，也找過度設計）。

### 0:15–0:45 Review 演練

開新對話，對第 1、2 堂的產出執行：

```text
/review-loop 設備資料維護 CRUD
```

看 ❌ / ⚠️ / 💡 分組報告與 FR 覆蓋矩陣。討論：哪些 ❌ 是真問題、哪些該降級。

### 0:45–1:10 修正與重審

回產碼對話修 ❌ 項 → 回填 `harness/LESSONS.md` → 重審到通過。

### 1:10–1:30 段落收尾演練

執行 `/milestone-loop`：看文件與 UML 圖如何跟上程式（Mermaid 循序圖 / 狀態圖 / ER 圖）、重構清單怎麼分「小改直接做」與「大改列待辦」。強調：過時的圖比沒圖更糟。

### 1:30–1:50 L3 瀏覽器驗證

依 `modules/verify/VERIFY.md` 對 CRUD 頁面跑一次真瀏覽器驗收（外部 API 一律 mock）。體會「typecheck 過了不代表功能會動」。

### 1:50–2:00 導入討論

- 公司要先建哪份 checklist？（review-checklist 在地化）
- `harness/CODE-RULES-api.md` / `CODE-RULES-ui.md` 的 TODO 由誰補齊？
- LESSONS.md 由誰維護、多久升級成通則？
- `/milestone-loop` 的觸發節奏（每功能？每週？）
- 權限 allowlist（`templates/settings-allowlist-sample.md`）怎麼逐步累積？
