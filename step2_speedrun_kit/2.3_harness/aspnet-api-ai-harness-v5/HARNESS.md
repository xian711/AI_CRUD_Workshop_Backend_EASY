# HARNESS.md

## Purpose

低 token 的 ASP.NET Core API / CRUD AI Harness 核心規則。

一套 compact SDD loop，閘門：`SPEC → BUILD → MILESTONE → REVIEW → DONE`。

v5 = v4（網路討論版）＋ 內部專案實戰驗證過的規則。每條規則的出處與教訓見 `docs/case-studies.md`。

## 鐵律（不可違反）

1. **SDD first**：先有規格再有程式。SPEC 中沒有對應條款（FR / BR）的程式碼視為範圍外實作，預設移除、不預設保留。
2. **誠實原則**：未實作的端點回 `501` 或標 `// TODO`，不得回傳寫死的假資料冒充完成。Mock / seed 資料必須明確標示。效能與精度數字一律標 `[待實機]`，不得以推估冒充實測。
3. **審寫分離**：產碼與審查不得在同一對話完成。審查者只指出問題，不改程式碼。
4. **驗證自帶回圈**：每個產出動作結尾必掛一個驗證動作；修正之後必須複驗。不靠人記得驗。
5. **越權即標記**：超出目前角色能決定的問題，標記後踢回，不自行裁決：
   - 業務規則不明 → `[SA 確認]`
   - 技術設計未定 → `[SD 待定]`
   - 留給實作處理 → `[DEV 實作]`
   - 需真實環境量測 → `[待實機]`
6. **互動式決策**：需要人工決策的事項（blocker、方案選擇、大改重構），不只列清單——用**選擇題**（2–4 個選項、標明建議項與理由）向人取得答案。一次最多 3 題、能合併就合併；答案回寫 SPEC 或 LOOP.md。

## Modes

### API Mode

用於 API contract、mock data、TDD cases、ASP.NET Core 測試草稿與驗證。

```text
SDD → Mock Data → TDD Cases → Test Code → Verify → Smoke → Fix → Summary
```

OpenAPI 規則：

- API Mode 預設啟用 OpenAPI，**只開在 dev 環境**（或以開關控制）。
- 專案已有 Swagger 設定就沿用，不重複配置（如多文件分組）。
- .NET 9+ 用內建 `AddOpenApi()`；舊版才用 Swashbuckle。
- SDD 的 contract 是草稿，程式生成的 OpenAPI 是活文件；兩者一致性由 Review Gate 檢查。

### CRUD Mode

用於後端 API 加 CRUD UI 的功能。

```text
CRUD SDD → API Spec → DB/DTO Spec → Mock Data → TDD Cases
→ UI Spec → CRUD Page Draft → Token Check → Verify → Fix → Summary
```

CRUD Mode 只在需要 UI 時才讀 `modules/crud-ui/`。UI 產出後必跑 `modules/crud-ui/design-token-rules.md` 檢查。

### UI Mode（雛形）

用於**不含後端**的畫面雛形：靜態切版、流程展示、design review。

```text
UI Spec → Page Draft（綁 mock 資料）→ Token Check → 人工目視
```

- 資料一律用 mock 並標示；API 串接點標 `// TODO: DEV 串接`。
- 不寫業務邏輯、不發明元件；美學與版面判斷標「待人工目視」，不推估。
- 雛形確認要轉正式功能時，改走 CRUD Mode 完整 loop。

### Milestone Gate（段落收尾）

一個功能段落完成後執行 `/milestone-loop`：

1. **文件同步**：程式為準，SPEC / README / UML 圖跟上。圖優先於長文字，用 Mermaid（骨架見 `templates/uml-mermaid-snippets.md`）：循序圖每個主要流程一張、狀態圖每個有生命週期實體一張、ER 圖一張；一張圖不超過一屏。過時的圖比沒圖更糟。
2. **重構掃描**：對照 `harness/CODE-RULES-api.md` / `CODE-RULES-ui.md`（只讀涉及的那份）找重複碼、死碼、過長方法。小改直接做並複驗；大改列待辦問人，不順手大重構。
3. 之後過 Review Gate、回填 LESSONS、經同意後 commit。

### Review Gate

MILESTONE 之後、DONE 之前，在**新對話**執行 `/review-loop`。規則見 `modules/review/REVIEW.md`。有 ❌ 項就回到 Fix，修正後重審。

### 完工判斷（三關，DONE 的定義）

1. **TASKS 關**：`harness/TASKS.md` 無 `- [ ]` 殘留；「不做／延後」項須經人以選擇題核可並標 `[-]`。
2. **Done Criteria 關**：SPEC 的 Done Criteria 逐條成立。
3. **Review 關**：`/review-loop` 通過——FR 覆蓋矩陣全綠、無 ❌。

三關全過後回報「候選完工」，由人最終核可；**AI 不自我宣告完工**。

進度紀錄分工：TASKS＝進度快照（`[x]`）、git commit＝完成證據（訊息引用 T-ID / FR-ID）、LOOP.md＝只記活待辦，三者不重複。

## 驗證分級

成本由低到高，永遠先跑最便宜的；L0 不過就不跑 L1。細節見 `modules/verify/VERIFY.md`。

| 級別 | 內容 | 成本 | 時機 |
|---|---|---|---|
| L0 | build / typecheck | 零 | 每次改碼後 |
| L1 | 自動化測試（`dotnet test`、前端單元測試） | 低 | 每個 loop 結尾 |
| L2 | API smoke（curl 實打，貼真實回應） | 低中 | API 實作完成後 |
| L3 | 真實瀏覽器 E2E | 高（token 與時間） | 預設跳過；使用者明確要求或 CRUD 最終驗收才跑 |

L2 通過後把實測 curl 指令附進交付並同步 `.http` 檔；L3 的外部付費 API 一律 mock，不燒真實額度。

## Token Budget Rules

- 短條列優先，不長篇解釋。但精簡是「少講不必要的事」，不是把話壓短到難懂——輸出要讓人一次看懂，用語見 `CLAUDE.md` 底線。
- 不重複貼完整檔案，只列 changed sections、檔名、指令、測試結果。
- 只讀當前步驟需要的檔案；審查與修正只讀 diff，不重讀全專案。
- 每次 loop summary 控制在 20 行內。
- 只在 blocker 時問人。
- CRUD UI 只用 Design System 摘要，不反覆貼完整設計文件。
- 瀏覽器截圖與 E2E 預設跳過，除非使用者明確要求。
- `harness/LOOP.md` 只記待辦與本輪決策，不記已完成的細節。

## Loop Rules

每個 loop 必須：

1. 讀 `harness/SPEC.md` 與 `harness/TASKS.md`。
2. 判斷 mode：預設 API Mode；有 CRUD UI 需求用 CRUD Mode；只做畫面雛形（無後端）用 UI Mode。
3. SDD 完成後若 TASKS 尚未展開，依 SPEC 展開（每條標對應 FR 與驗證方式；不可驗證的不算任務）。
4. 檢查缺漏：會阻塞 → 用選擇題問人並記入 `harness/LOOP.md`；不阻塞 → 記 Assumption 繼續——但**業務與資料語意不腦補**：查得到的（DB、原始碼）先查再記，每條 Assumption 都要寫驗證方式。
5. 取 TASKS 的下一項，只產生該項的最小產出，並引用 SPEC 編號（FR / BR / TC）。
6. 跑或建議最小驗證指令（先 L0 再 L1；API 實作完成後跑 L2 smoke）。
7. 任務完成**且驗證通過**才勾 `[x]`。commit 仍由使用者主導：commit 時勾選與產出放同一個；尚未 commit 前在 `LOOP.md` 註記待補，不得偽稱已 commit。
8. 只修與本功能相關的問題；fix 滿 2 輪即停止。
9. CRUD UI 產出後跑 token 檢查；違規 → 修正 → 複驗。
10. 需要新建的元件超過 3 個時，以選擇題確認再動工。
11. 依 `harness/LESSONS.md` 記載的時機回填踩坑；新 loop 開始先掃該檔。
12. 階段全部完成時不自行推測下一階段任務，回報並等待指示。

## Human Interrupt Criteria

只在以下情況問工程師：

- 商業規則不明且影響行為。
- API response contract 與既有專案格式衝突。
- DB schema 缺失且無法安全推論。
- CRUD 欄位行為不明且影響儲存 / 刪除。
- 必要的 Design System component mapping 缺失。
- 測試失敗原因是 AI 無法檢查的環境問題。

其餘情況記 Assumption 繼續。提問方式見鐵律 6。

## Default Output Format

```text
Status: PASS | NEEDS_INPUT | FAIL
Mode: API | CRUD | UI | REVIEW
Progress: <x/y tasks>
Changed: <files>
Verified: <commands/results，每條標註成本>
Assumptions: <max 3>
Blockers: <only if any>
Next: <one next action>
```

Status 語意：PASS＝本輪任務完成且驗證通過（可帶不阻擋下一項的 blocker，列於 Blockers）；NEEDS_INPUT＝下一項被 blocker 擋住或需人決策；FAIL＝驗證失敗且 2 輪 fix 未修復。
