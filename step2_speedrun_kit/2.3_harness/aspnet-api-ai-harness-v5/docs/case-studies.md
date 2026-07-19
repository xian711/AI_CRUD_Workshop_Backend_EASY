# 內部實務案例對照（v5 修訂依據）

v4 是網路討論出來的範本（保留低 token compact loop、不建 PR、不加重型治理）；v5 把這台機器上各專案實戰驗證過的規則收進 Harness，並刻意不收「完整角色 pipeline」——那是大型專案才需要的（見案例 1）。本文件記錄每條規則的出處與教訓，是教育訓練的核心教材：**每一條規則背後都有一個真實踩過的坑**。

## 總覽

| 來源專案 | 實戰教訓 | 收進 v5 的位置 |
|---|---|---|
| 內部專案 A | 角色硬邊界＋交接標記；審查雙向偵測；三層審查清單；Playwright 成本控制 | HARNESS 鐵律 3 / 5、`modules/review/`、VERIFY L3 |
| 內部專案 B | token 三層架構；check → fix → 複驗閉環；記憶只記待辦 | `design-token-rules.md`、LOOP 記錄原則、鐵律 4 |
| 內部專案 C（PHP 拉皮） | 「可動層 / 不動層」保護清單；環境特化的 QA 動作順序 | LESSONS 模式、本文案例 3 |
| 內部專案 D | 憲章模式；審寫分離；誠實原則；範圍外預設移除 | HARNESS 鐵律 1 / 2 / 3 |
| 內部專案 E | 真實瀏覽器驗證 skill；mock 外部 API 不燒額度；SDD 七步流程 | `modules/verify/`、LESSONS 種子條目 |
| 內部專案 F／H（Spectra / OpenSpec） | propose → apply → verify → archive 閘門；三維度驗證與優雅降級 | `/review-loop` 三維度、LOOP Gate 欄位 |
| 內部專案 G | 成本標註文化；唯讀 DB 帳號；單一事實來源＋同步哨兵 | VERIFY 成本標註、review-checklist API 項 |
| 內部專案 H | commit 由人主導；共用元件分支紀律；多文件 Swagger；`.http` 測試慣例；前後端程式範本 | CLAUDE.md commit 規則、HARNESS OpenAPI 規則、`api-tests-sample.http`、`harness/CODE-RULES-api.md` / `-ui.md` |
| 內部專案 I | 接手既有系統的知識盤點（四狀態＋放行判斷）；業務語意不腦補、假設必標驗證方式；改檔後掃誤刪 | `templates/intake-checklist.md`、HARNESS Loop Rule 4、LESSONS LS-08 |
| specrun（外部 kit 對照，v5.13–15） | 測試反錨定；模型分級；審查申辯；反膨脹閘；冗餘註解清理；事件表回填；SessionStart 規則重灌 | HARNESS Loop Rule 5 / 模型分級節、REVIEW 申辯、LESSONS 升級規則與 E1–E5、milestone 註解掃描、`.claude/hooks/` |

## 案例詳述

### 1. 內部專案 A — 角色分工與雙向審查

政府防災系統，SA → SD → DEV → Reviewer → QA 全角色 pipeline，每個角色 skill 都定義「能做 / 不能做」硬邊界，越權的問題用 `[SA 確認]` / `[SD 待定]` / `[DEV 實作]` 標記踢回，不自行裁決。

最有價值的兩個做法：

- **審查是雙向的**：SD Reviewer 同時偵測「設計遺漏」（fallback、rollback、邊界條件）與「過度設計」（無需求對應的抽象層、MQ、Cache）。網路範本只教「補完整」，實戰同樣被過度工程坑過，所以「刪冗餘」與「補缺漏」同等重要。→ `modules/review/REVIEW.md` 的 DG / OE 清單。
- **通用系統規範不需 SPEC 也能審**：清單頁必有分頁與空狀態、表單必有必填標記與 loading 防重複、Modal 確認按鈕要寫明動作——這是資深工程師的隱性知識顯性化。→ `modules/review/review-checklist.md`。

另一條實戰規則：「Playwright 每次執行耗費大量 token，預設跳過，除非使用者明說要截圖」——把 LLM 執行成本當一級約束。→ 驗證分級 L3 預設跳過。

### 2. 內部專案 B — token 驗證閉環

Nuxt 3 設計系統專案。樣式規範不是寫在文件裡等人遵守，而是做成可執行的檢查：

- token 三層架構 `COMP → SYS → REF` 唯一方向，違規分級（R001 硬編碼色值、R002 直接引用 REF、R003 硬編碼間距、R004 `!important`、W001 缺 focus-visible）。
- **驗證閘自帶回圈**：create-page 結尾強制跑 check-tokens；fix-violations 修完自己再跑一次 check-tokens 確認乾淨。不靠人記得驗。→ 鐵律 4。
- **修正安全原則**：只自動改對應表內的值，其餘標「需手動確認」——防止 AI 大範圍破壞。→ `design-token-rules.md`。
- 檢查規則明寫「排除 `:root{}` 內 token 定義與註解」——被誤報教訓後才會加的細節。
- 記憶 / 進度檔只記待辦不記已完成；階段完成不自行推測下一階段。→ LOOP.md 記錄原則。
- 缺件超過 3 個先列清單問人——批量副作用的熔斷點。→ Loop Rule 11。

### 3. 內部專案 C（PHP 拉皮） — legacy 保護清單

老系統前端改版（「老屋拉皮」）：明列可動層（templates、CSS / JS）與不動層（商業邏輯、驗證框架、路由），並把「改版絕不能碰的模板 hook」（佔位符、迴圈註解結構、JS 注入區塊）做成每次動手前的自查清單。

教訓：**對 legacy 專案，「不能動什麼」比「要做什麼」更重要**。這就是 LESSONS 錯誤防範庫的原型——把翻過車的地方條列成開工前必掃的清單。

配套的 QA 角色有一條環境特化規則：該系統每次操作都跳 alert，因此寫死「點擊儲存後下一個動作只能是檢查頁面清單」，並附錯誤示範。**針對特定環境把動作順序寫死**，是純實戰產物。

### 4. 內部專案 D — 憲章與誠實原則

多平台登山 App，治理最重。它不用 CLAUDE.md，而是用 CONSTITUTION.md（憲章）當最高文件，所有角色 skill 引用「憲章第 X 條」。三條被 v5 直接採用：

- **審寫分離**（鐵律 1-1）：同一 PR 產碼者與審查者不得為同一 instance；審查者發現自己產過碼就停手改派。→ 鐵律 3、`/review-loop` 要求新對話。
- **誠實原則**（憲章 7-3）：未實作的端點回 `501`，不得回 `200` 配假資料；seed 資料必標示；競品比較必附真實來源，不得憑記憶臆造；效能數字標「待實機」。→ 鐵律 2。
- **範圍蔓延防治**（憲章 8-2）：有程式無規格條款＝範圍外實作，預設 revert。這條在多個角色 skill 重複出現，是對抗 AI 過度發揮的硬規則。→ 鐵律 1。

### 5. 內部專案 E — 真實瀏覽器驗證

React SPA（名片辨識）。verify skill 的核心觀念：**IndexedDB、canvas、下載這些功能，typecheck 和單元測試測不到，必須真瀏覽器驗證**。累積的實戰手法全部收進 `modules/verify/VERIFY.md`：

- 外部 AI API 一律 route 攔截 mock，不燒真實額度。
- 計數類 API 是即時快照不自動等待，計數前先等條件成立（「踩過多次」）。
- 測失敗路徑時，「無 console error」斷言要排除刻意觸發的 500。
- dev server 埠號從輸出抓，不寫死。
- CRUD 驗證順序 R → C → R → U → R → D → R。

new-feature skill 的七步 SDD 流程（開規格 → 對齊 → 計畫 → 實作 → 驗收 → 收尾）與本 Harness 的 loop 相互印證：**對齊確認後才動工、驗收全過才算完成**。

### 6. Spectra / OpenSpec — 閘門與三維度驗證

內部專案 F 與內部專案 H 的展示版 採用 `propose → apply → verify → archive` 的變更閘門。verify 階段的設計被 `/review-loop` 採用：

- 三維度：Completeness（任務與需求全實作？）、Correctness（映射到 file:line 檢查偏離）、Coherence（違反設計決策？慣例一致？）。
- 嚴重度 CRITICAL / WARNING / SUGGESTION，**不確定時降級**避免誤報。
- 優雅降級：artifact 不齊時只驗做得到的部分，並註明跳過了什麼。
- 每條 issue 必附具體可行建議，禁止「建議再檢視」這類空話。

### 7. 內部專案 G — 成本可見文化

AI 海污分析系統。每條測試指令都標註「零 API 費用 / 會打 Gemini N 次 / 約 X 分鐘」；提供 `AI_ENABLED=false` 的 mock 模式省額度。→ VERIFY 的成本標註規則。

另一條安全實務：上線前 DB 連線必須用「僅 GRANT SELECT」的唯讀帳號。→ review-checklist 的 API / 後端安全項。

### 8. 內部專案 H — 企業紀律與程式範本

企業級 .NET 系統＋Vue 3 前端。commit 前必須取得確認、共用元件要走專用分支先驗證——**版本控制的主導權在人**。→ CLAUDE.md「commit 由使用者主動要求才執行」。

v5 的兩塊直接取材：

- **CODE-RULES 範本來源**：Controller 薄轉發＋Service 分層、`ModelResult` envelope、`BaseEntity` 審計欄位（`cre_id/cre_date/upd_id/upd_date`）、小蛇形表名＋`[Table]/[Column]` 明確標註、多文件 Swagger（External/Internal/TV 依命名空間分組、dev 才開）、前端功能模組分層與 `VITE_` env 慣例。範本檔案清單見 `harness/CODE-RULES-api.md` 與 `CODE-RULES-ui.md` 文末。
- **`.http` 測試慣例**：每個 API 配 `Tests/{external|internal}/*.http`，環境值放 `http-client.env.json` 不進版控，先取 token 再帶入後續請求。→ `templates/api-tests-sample.http` 與 L2 smoke 的「同步維護 `.http`」規則。

### 9. specrun 對照分析 — 外部 kit 互相參照（v5.13–15）

[specrun](https://github.com/jay123578951/specrun) 是同一套 SDD 理念的 plugin 版實作（subagent pipeline、自動編排）。v5.13–15 逐項對照後引入八個機制，並刻意**不**引入其形態（stack pack、跨專案 JSONL、marketplace）——那是多專案 plugin 生態的解法，本 Harness 的場景是企業導入與教育訓練，透明可教優先於自動化。

收進來的教訓：

- **測試反錨定**：先照 SPEC 自列「該驗什麼」，才准看既有測試——防被現成測試錨定思路，漏掉沒人測過的洞。
- **模型分級**：一般產碼 Sonnet；架構／安全／第 2 輪 fix 才提醒升 Opus——token 錢花在判斷力值錢的地方。
- **審查申辯**：修正方可附依據對單一 ❌ 要求重審（限一次）——審查者也會看走眼，防「修一個本來就沒錯的東西」。
- **反膨脹閘**：規則升級前必答「最便宜等效替代」——防規則庫慢性膨脹吃掉 token 預算。
- **冗餘註解清理**（掛 milestone）＋**功能型指令前後計數**防誤刪。
- **事件表 E1–E5**：回填從自由心證改為機械對照——未遂事件（驗證曾失敗、建議被否決）也留下紀錄。
- **SessionStart hook**：規則提要在開場／壓縮後自動重灌——長對話規則衰減靠機器解，不靠 AI 記得。

同場決策：核心規則鬆綁技術棧（v5.15）——受 specrun「核心 stack 無關」啟發，但用單包分層（CODE-RULES 集中綁定）而非它的選裝 pack，理由是零依賴可攜。

## 帶進工作坊的三句話

1. 不是 AI 變聰明，而是 Harness 讓 AI 被正確約束。
2. 每個產出動作結尾都掛驗證；驗證不過就修，修完必複驗。
3. 規格沒有的不做；做不到的誠實說；審查的人不寫碼。
