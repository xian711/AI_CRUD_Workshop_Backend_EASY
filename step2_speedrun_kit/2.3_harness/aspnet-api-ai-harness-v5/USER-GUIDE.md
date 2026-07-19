# AI Harness v5 使用手冊（USER-GUIDE）

低 token、SDD 優先的後端 API / CRUD / UI 雛形 AI Harness。核心規則與技術棧無關；棧細節（預設 ASP.NET Core＋Vue）集中在 `harness/CODE-RULES-*.md`、`templates/`、`scripts/`——換技術棧只換這三處，核心與 commands / modules 不動。

> 核心說法：不是 AI 變聰明，而是 Harness 讓 AI 被正確約束。

本檔講「怎麼用」；想懂每個檔案**為什麼存在**（白話＋圖＋實例）看 `docs/白話導覽.md`。

## 5 分鐘上手

1. 把整個資料夾複製到專案根目錄。
2. 填 `harness/SPEC.md`（Feature＋FR / BR 編號；UI 雛形只需 Feature＋CRUD UI Spec 兩節）。
3. 依情境執行：

```text
/api-loop 查詢派工單清單 API
/crud-loop 設備資料維護 CRUD，依照既有 Design System 產生列表、查詢、新增、編輯表單
/ui-loop 設備總覽儀表板雛形，先給 UI Spec
```

4. 段落完成：`/milestone-loop`（同步文件與 UML 圖、掃重構）。
5. 完工前開**新對話**：`/review-loop <功能名>`；❌ 修完重審通過才算 DONE。

## 六條鐵律（為什麼要有）

| 鐵律 | 為什麼 |
|---|---|
| 1. SDD first：規格沒有的不做，範圍外預設移除 | AI 會過度發揮，寫出沒人要求的功能；規格是唯一的授權來源 |
| 2. 誠實原則：未實作回 `501` 不回假資料；mock 必標示；效能標 `[待實機]` | AI 傾向「看起來完成」——假 200 與捏造數字比沒做更危險 |
| 3. 審寫分離：產碼與審查不同對話 | 同一對話自審會沿用自己的推理路徑，看不見自己的盲點 |
| 4. 驗證自帶回圈：產出掛驗證、修正必複驗 | 靠人記得驗一定會漏；把驗證做成流程的一部分才守得住 |
| 5. 越權即標記：`[SA 確認]` `[SD 待定]` `[DEV 實作]` | AI 遇到不明處會自行腦補；標記踢回比錯誤的猜測便宜 |
| 6. 互動式決策：人工決策用選擇題取得答案 | 只列待辦清單，人常不回應；給選項＋建議項能立刻做決定 |

## 三個 Mode ＋ 兩個閘門

| 情境 | Mode | 指令 |
|---|---|---|
| 後端 API | API | `/api-loop` |
| 後端＋CRUD 畫面 | CRUD | `/crud-loop` |
| 純畫面雛形（無後端，綁 mock） | UI | `/ui-loop` |

閘門順序：`SPEC → BUILD → MILESTONE → REVIEW → DONE`。

驗證分級：L0 build → L1 test → L2 curl smoke → L3 瀏覽器 E2E（預設跳過）。**為什麼分級**：各級成本差距極大，永遠先跑便宜的，前一級不過就不跑下一級。

**完工判斷（三關）**：① `TASKS.md` 無 `- [ ]` 殘留 → ② SPEC Done Criteria 逐條成立 → ③ Review 無 ❌。三關過後 AI 回報「候選完工」，由人最終核可——AI 不自我宣告完工。

## 逐檔說明（內容＋為何要設定）

四層原則：**HARNESS＝規則、commands＝動作、modules＝細節、docs＝參考**，每條規則只寫一處，其餘引用。

### 根目錄

| 檔案 | 內容 | 為何要設定 |
|---|---|---|
| `HARNESS.md` | 六條鐵律、三 Mode 流程、驗證分級、loop rules、輸出格式——規則的 single source | 規則散在多檔會漂移；AI 每次讀到的版本必須一致 |
| `CLAUDE.md` | **路由器**：鐵律濃縮＋「需求 → 指令」對照表＋底線，不放規則細節 | CLAUDE.md 每次對話常駐、每行都付 token；細節放在只有該情境才載入的 command 裡 |
| `USER-GUIDE.md` | 本檔——使用手冊 | 複製進專案後的入口文件 |

### `.claude/`（指令與 skill）

| 檔案 | 內容 | 為何要設定 |
|---|---|---|
| `commands/api-loop.md` | API 開發固定流程：SPEC 併入 → 產出（引用編號）→ 輸出前四檢查（SPEC 對應 / 完整性 / 安全 / 可測試）→ L0/L1 → L2 smoke → 回填 LESSONS | 一句 `/api-loop` 觸發固定流程，避免每次 prompt 品質不一；四檢查放在輸出前，便宜的自我把關先於昂貴驗證 |
| `commands/crud-loop.md` | API 流程＋UI Spec 先行、Token Check、缺件超過 3 個以選擇題熔斷 | 畫面返工成本高——先審 UI Spec 再產碼；批量建元件的副作用需要人先點頭 |
| `commands/ui-loop.md` | 雛形流程：UI Spec → Page Draft（綁 mock、標 `// TODO: DEV 串接`）→ Token Check → 人工目視 | 無後端情境走 crud-loop 會產生多餘產物；美學判斷 AI 不可靠，標「待人工目視」 |
| `commands/milestone-loop.md` | 段落收尾：文件同步（程式為準）、UML 圖更新、重構掃描（小改直接做並複驗、大改選擇題問人） | 程式迭代文件必掉隊；重構集中在收尾處理，避免每輪順手大改 |
| `commands/review-loop.md` | 審查閘門：三維度（Completeness / Correctness / Coherence）＋雙向偵測（設計遺漏 DG＋過度設計 OE）、FR 覆蓋矩陣、❌/⚠️/💡 分級 | 必須在新對話執行（鐵律 3）；雙向偵測是因為 AI 不只會漏做、也會過度設計 |
| `skills/aspnet-api-crud-sdd-loop/SKILL.md` | Mode 判斷與觸發、四條禁止 | 使用者忘記打指令時，AI 仍會依 skill 自動遵循流程 |
| `skills/gis-frontend/SKILL.md` | GIS 前端角色：地圖規則與實戰坑，疊加在 crud / ui loop 之上 | skill 描述常駐一行、本文觸發才載入——專業領域規則零常駐成本 |
| `hooks/session-start.sh`＋`settings.json` | SessionStart hook：開新對話／compact 後自動注入 Harness 提要（鐵律、路由、模型分級、完工三關、底線） | 長對話後早期規則會被壓縮或淡出（「聊久了不守規矩」）；hook 讓規則每次自動重灌，不靠 AI 記得。Windows 依賴 Git Bash（裝 git 就有） |

### `harness/`（每次任務的工作檔）

| 檔案 | 內容 | 為何要設定 |
|---|---|---|
| `SPEC.md` | 本次任務規格範本：FR / BR / TC 編號、交接標記、API contract、Mermaid 圖、Done Criteria | 編號讓審查能產「覆蓋矩陣」、抓出無需求對應的孤立設計；Done Criteria 讓「完成」可判定 |
| `TASKS.md` | 任務分解（WBS）：checkbox 條列，每條標對應 FR 與驗證方式；做完且驗證通過才勾；commit（由人主導）時勾選與產出放同一個 | `- [ ]` 機器可掃，review 一行就能判斷做完沒；分工＝TASKS 進度快照、git 完成證據、LOOP 只記活待辦 |
| `CODE-RULES-api.md` | 後端規範：C# 分層命名、API envelope、表命名 / 審計欄位 / migration；附範本檔案清單 | AI 預設用通用風格，不會自動符合公司慣例；**按面向拆檔**讓純 UI 工作不必載入後端規則 |
| `CODE-RULES-ui.md` | 前端規範：Vue 慣例、API 封裝、env、格式化；附範本檔案清單 | 同上——純後端工作不必載入前端規則 |
| `LESSONS.md` | 錯誤防範庫：問題 → 原因 → 防範；回填時機是五項事件表 E1–E5（fix 兩輪、review ❌、人工指正、驗證曾失敗含環境坑、建議項被否決），loop 結尾逐項對照 | 同樣的坑 AI 會重複踩，除非把防範寫成「開工前必掃」的清單；記不記用機械對照，不靠自由心證，未遂事件也留下紀錄 |
| `LOOP.md` | loop 狀態：Gate、待辦、本輪決策——**只記待辦不記已完成** | 記已完成會吃掉上下文預算，還誘導 AI 自我滿足；階段完成不自行推測下一階段 |

### `modules/`（需要才載入的細節規則）

| 檔案 | 內容 | 為何要設定 |
|---|---|---|
| `crud-ui/CRUD-UI.md` | 表單與互動慣例（Label 在上、必填 `*`、危險操作二次確認、分頁預設值、focus-visible…） | 這些是業界慣例但 AI 常漏；集中一處供產出與審查共同對照 |
| `crud-ui/design-token-rules.md` | Token 三層（COMP→SYS→REF）、違規分級 R001–W001、修正安全原則、check→fix→複驗閉環 | 樣式規範寫成「可執行的檢查」才守得住；「不確定不自動改」防止 AI 大範圍誤改 |
| `crud-ui/design-system-summary.md` | 公司 Design System 摘要（元件對照、token 層級）——導入時填 | 完整設計文件太大，每次貼會爆 token；摘要一次寫好重複用 |
| `review/REVIEW.md` | 審查規則：審寫分離、三維度、DG/OE 清單、嚴重度與降級、報告原則（有憑據、可行動） | 「不確定就降級」防誤報；「已確認決策不翻案」防審查反覆 |
| `review/review-checklist.md` | 不需 SPEC 也能審的通用清單：清單頁 / 表單 / 詳情 / Modal / API 安全 / 流程 | 資深工程師的隱性知識顯性化，新人也能照著審 |
| `verify/VERIFY.md` | L2 smoke 規則（埠號從輸出抓、`curl.exe`、貼真實回應、同步 `.http`）與 L3 瀏覽器規則（外部 API 一律 mock、計數先等待…） | 每條都是常見翻車點；成本標註讓人知道每次驗證花多少 |

### `templates/`、`prompts/`、`scripts/`、`examples/`

| 檔案 | 內容 | 為何要設定 |
|---|---|---|
| `templates/api-tests-sample.http` | `.http` 測試檔範本：token 流程、happy＋錯誤案例、對應 curl | curl 是一次性指令，`.http` 進版控可在 IDE 重複執行 |
| `templates/uml-mermaid-snippets.md` | 循序 / 狀態 / ER / 類別 / 流程圖骨架 | 圖優先於長文字；骨架可直接複製，段落收尾時更新 |
| `templates/tdd-cases.md`、`mock-data.json`、`openapi-lite.yaml`、`aspnet-integration-test.cs`、`efcore-db-notes.md` | TDD / mock / API / 測試 / DB 範本 | 統一產出格式，AI 照範本填而非自由發揮 |
| `templates/crud-ui/*` | UI Spec 範本、頁面草稿骨架、前端測試清單 | 頁面區塊與產出清單的 single source |
| `templates/settings-allowlist-sample.md` | 權限最小授權範例 | 減少權限確認又不一次全開；破壞性指令綁範圍 |
| `templates/intake-checklist.md` | 接手既有系統盤點：收料清單（P0/P1）、知識盤點四狀態（已驗證/部分/缺失/衝突）、放行判斷 | 接舊案最大的風險是不知道自己不知道什麼；先盤點再開發，把誠實原則落實到開工前 |
| `prompts/compact-prompts.md` | 非 Claude Code 環境用的濃縮 prompt | 沒有 slash command 的環境也能貼用 |
| `scripts/run-tests.ps1 / .sh` | 最小測試指令 | L1 的統一入口 |
| `examples/*` | 派工單 API、設備 CRUD 兩個填好的 SPEC 範例 | 工作坊示範用，也是 SPEC 的填寫參考 |

### `docs/`（參考文件）

| 檔案 | 內容 |
|---|---|
| `白話導覽.md` | 每個檔案為什麼存在——白話＋Mermaid 圖＋實例，新人第二份讀物 |
| `harness-overview.html` | 本手冊的網頁版（瀏覽器直接開） |
| `harness-overview.pptx` | 簡報版（工作坊開場） |
| `workshop-guide.md` | 三堂工作坊流程 |
| `adoption-faq.md` | 公司導入節奏與常見問題 |
| `case-studies.md`、`source-summary.md` | 規則演進紀錄（維護者參考） |

## 工作坊

三堂 × 2 小時（詳見 `docs/workshop-guide.md`）：① API Mode＋誠實原則與 smoke 演練 → ② CRUD Mode＋Token 檢查閉環 → ③ Review Gate＋段落收尾＋L3 驗收＋導入討論。
