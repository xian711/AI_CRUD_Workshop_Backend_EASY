# BUILD LOG — AI CRUD Workshop Backend EASY

> **這份給誰看**：講師與教材維護者。學員不必讀——學員的唯一入口是 `HANDBOOK/HANDBOOK.html`。
> **這份記什麼**：只記實測過的事實。沒驗證的一律標「未驗證」，不打假綠燈。
> **本檔沿革**：2026-08-19 合併原 `COURSE_REVIEW_TEACHER_STUDENT.md`（2026-07-12 審查）與
> `EVALUATION_REPORT_2026-07-15.md`（2026-07-15 評估）的結論與實測數據，兩份原檔已移除。

## 1. 課程定位

一句話主線：**把上一堂前端課的裝備物資模組 mock（記憶體假資料）接上真的 .NET API 與 PostgreSQL**。

- 本課是 `AI_CRUD_Workshop_Frontend_EASY` 的**續集**；沒上過前端課也能上，step4 附現成前端成品。
- 總時間 **120 分鐘是目標句，不是承諾句**——尚無真人 dry run 數據（見第 6 節 Gate）。

## 2. 實測基準（都真跑過，可標 PASS）

| 驗證項目 | 結果 | 實測數字 |
|---|---|---|
| 後端 preflight | PASS | 11 項檢查，exit 0（1 WARN：psql 不在 PATH，但找得到絕對路徑） |
| sample-api build | PASS | 0 warning／0 error |
| sample-api test | PASS | 49 passed／0 failed／0 skipped |
| solution-api build | PASS | 0 warning／0 error |
| solution-api test | PASS | **89 passed**（Members 49＋Equipment 40）／0 failed／0 skipped |
| CRUD 狀態碼 | PASS | POST 201＋Location、PUT 200、DELETE 204、刪後 GET 404；驗證失敗回 400，errors 為 camelCase |
| PostgreSQL 持久化 | PASS | psql 實測 `SELECT count(*)` = 24（種子筆數） |
| checkpoint 自動驗收 | PASS | 四項 gate 全過（build／test 89／API 24 筆／DB 名稱） |
| 缺學生作品時跑 E2E | 正確 FAIL | exit 1，不用官方解冒充全綠 |
| 後端 LOOP（lab-red-to-green） | PASS | 基準 23/23 → 注入 EV4 → 1 fail／22 pass → restore → 回到 23/23 |
| 全鏈路 E2E | PASS | 瀏覽器→Nuxt→API→PostgreSQL，**6/6** passed，exit 0 |
| 全鏈路截圖 | PASS | 5 張由真實 Chromium 產生，1280×800 |
| 前端基線（Frontend_EASY） | PASS | preflight 10 項 PASS；mock E2E 7/7 |
| Markdown 本地連結 | PASS | 前後端共 172 份，0 失效 |

## 3. 契約與關鍵決策

| 項目 | 內容 |
|---|---|
| API 埠 | 5080（範本正本與參考解共用，一次只跑一個） |
| 前端埠 | 手動展示模式 3100（可加 `--port 3199` 對齊）；一鍵 E2E 模式固定 3199 |
| DB 三庫 | `ai_crud_equipment`（開發）、`ai_crud_equipment_test`（整合測試）、`ai_crud_equipment_e2e`（一鍵 E2E，尾碼 `_e2e` 才准 DROP，防呆） |
| id／code 產生 | 後端產生：`id` 用 SEQUENCE 產出 `E-###`；`code` 為同前綴 `MAX+1`（不同於範本 SEQUENCE，逼出「每前綴各自計數」的偏離決策，需記入設計文件-delta（DESIGN） |
| 種子資料 | 24 筆 |
| SCOPE 六題裁決 | 答案只在 `instructor/SCOPE-後端課堂範圍決策.md`；學生教材只出題不給答案 |

## 4. 已知邊界（教材要誠實揭露，不能讓學員誤以為可直接上線）

這四條已寫進 `HANDBOOK/HANDBOOK.html` 的 Step 5，講師收尾時要口頭再講一次。

| 邊界 | 說明 | 公司版該怎麼做 |
|---|---|---|
| **編碼併發** | `code` 用「同前綴 MAX+1＋唯一索引」，前提是**單一寫入者**。併發撞號會落到 500 | 改 per-prefix counter／advisory lock，或捕捉 unique violation 後有限重試並回 409 |
| **DEMO 帳密** | `postgres/12345` 與無 JWT **只適用本機教室** | 改用環境變數 `ConnectionStrings__Default`／`PGPASSWORD`；加認證授權 |
| **全量 GET** | 前端分頁，適用 `<1000` 筆假設 | 訂一個啟用 server-side paging 的明確門檻 |
| **測試全綠 ≠ 可上線** | `dotnet test` 全綠只代表「寫測試的人當初想到的情境」 | 要有 API 契約與資料庫查表的雙重人工驗收 |

另外，harness 的成效邊界也要講清楚：**harness 管「怎麼寫」（分層、封裝、命名、驗證、測試紀律），不管「做多少」**。範圍要靠 SCOPE 六題管，不是靠 harness 擋。這一點 step1 的三項對照已經明說。

## 5. 三道 Gate（課程的記憶點）

主線不要用「五個 Step、很多文件」來記，改成三道 Gate——這三道同時可以直接變成公司的 PR checklist。已寫進 `HANDBOOK/HANDBOOK.html` 與 `step5_wrapup/README.md`。

| Gate | 學員要做什麼 | 必交證據 |
|---|---|---|
| 1. 規格 Gate | PRD → 六題裁決 → SRS-delta、設計文件-delta、圖 → TASKS | 六題答案＋理由、任務清單 |
| 2. 程式 Gate | 套用 harness／範本，完成 Entity→migration→DTO→Mapper→Service→Controller→seed→tests | build 0/0、測試全綠、Swagger 狀態碼、psql 資料 |
| 3. 交付 Gate | 貼 LOOP prompt：AI 把學生工作區的全鏈路 E2E 修到綠，再開子代理對抗審查 | `LOOP-REPORT.html`（每輪根因、審查發現）、`LOOP-LOG.md`、測試報告 6/6、E2E 被測 path 與 DB name、文件標「step4 LOOP 後」 |

評分細則見 `step5_wrapup/RUBRIC.md`（六面向 100 分、70 分及格、三項不得為零）。

## 6. 開課 Gate

| 階段 | 條件 | 現況 |
|---|---|---|
| G0 技術與教材缺陷 | 全部修畢、實測綠 | **已達成** |
| G1 文件品質 | preflight 埠號、時數、RUBRIC 檔名、lab 清潔檢查、fullchain 說明全對 | **已達成** |
| G2 真人 dry run | 至少 3 位符合目標輪廓的真人，從 blank workspace 完整走完，記錄各段 P50／P90 耗時、checkpoint 使用率、求助次數 | **未達成** |

**目前定位**：適合講師高度介入的**內部小班試教**（6–10 人）。
**不建議**：無講師自學、對外正式課、宣稱保證 120 分鐘完成。
**正式對外開課前還要**：學生／講師／checkpoint 三包分離發佈；每一份綠燈證據都印學員 project path 與 DB name；用 checkpoint 者必須標記。

## 7. 素材與環境

| 項目 | 版本／位置 |
|---|---|
| .NET SDK | 10.0.101 |
| PostgreSQL | 18，`localhost:5432`，帳密 `postgres/12345`（**僅限本機教室 DEMO**） |
| psql | `C:\Program Files\PostgreSQL\18\bin\psql.exe`（**不在 PATH**，需用絕對路徑或讓腳本自動掃描） |
| Node／pnpm | Node 24.13.0／pnpm 10.33.0 |
| 前端基線 | `AI_CRUD_Workshop_Frontend_EASY` |

## 8. 教材維護紀律

### 自動檢查

```powershell
# 擋下「學生會直接複製、但實跑會失敗」的指令
powershell -ExecutionPolicy Bypass -File .\verify-doc-commands.ps1
```

### 人工檢查（每次改教材後跑一輪）

依 `課程系列-精簡與銜接指引.md` 的五個檢查法：

1. **有沒有入口**——每一份留下來的文件，都要講得出「學員在哪一步會打開它」。唯一入口是 `HANDBOOK/HANDBOOK.html`。
2. **有沒有同名兩份**——harness 四件的**實檔只有一份**，在 `step2_speedrun_kit/2.5_sample_api/sample-api/` 專案根目錄（AI 會自動讀的位置）。教材資料夾不放第二份副本。
   參考解 `step3_new_module/solution-api/` **刻意不放**這五份：它是拿來看的，不是拿來在裡面開 AI 工作的（理由已寫進根 `README.md`）。前端成品 `fullchain-app/` 有自己的前端版四件，那是另一個專案，不算重複。
3. **有沒有與本課無關的材料**——本課是 .NET／EF Core／PostgreSQL，前端與 GIS 材料不留。
4. **對照基準有沒有過期**——step1 的「有／沒有 harness」對照，**每換一代模型就要實跑一次重寫**。2026-08-19 已重跑，12 項收成 3 項（原 12 項有 8 項是舊模型才會犯的錯）。
5. **刪完有沒有殘留引用**——用**檔名與資料夾名**掃，不要用你以為的說法掃。

### 2026-08-19 精簡紀錄

| 動作 | 內容 |
|---|---|
| 合併 | 三份根目錄報告（653 行）收成本檔 |
| 移除 | `HANDBOOK.md`（與 HTML 同內容）、`COURSE_OUTLINE.md`（大綱第四份）、fullchain-app 的前端課舊手冊（埠號已過期） |
| 收斂 | `2.3_harness/` 的四件展示本刪除，README 改成指向實檔；參考包**不動內容**，改在 README 標明哪 9 檔與本課無關（那包是外部同步，改了下次會被覆蓋） |
| 重寫 | step1 對照 12 項 → 3 項，demo 換成 2026 實跑產出 |
| 補入口 | RUBRIC、三道 Gate、誠實邊界進學員動線 |

---
教材由 Claude 多代理協作產出、Codex 對抗審查、實跑驗證後發佈。
