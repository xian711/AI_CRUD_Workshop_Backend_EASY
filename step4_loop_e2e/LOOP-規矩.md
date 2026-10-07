# LOOP 規矩（給 AI 讀｜後端版）

> 用途：step4 和 step6 的 LOOP prompt 會叫 AI 照這份做（step6 的差別在第 7 節）。這是給 AI 的規矩檔，人不用逐字讀。
> 人要看結果，就打開受測 API 的 `loop/LOOP-REPORT.html`。
>
> 名詞：
> - **受測 API**：`step3_new_module/my-equipment-api`（學員自己的作品）。
> - **受測前端**：`step4_loop_e2e/fullchain-app`（前端課的成品，API 模式）。它是**契約**，不准改。
> - **受測服務**：你在背景啟動的受測 API＋受測前端，連開發庫 `ai_crud_equipment`。給子代理審，也留給人點。
> - **E2E 專用服務**：run-e2e 自己啟動的服務，連 `ai_crud_equipment_e2e`（每輪重建），跑完自己關。加 `-ReuseRunning` 時，已經在跑的就沿用、不另開（見 1.2 節）。
> - **產出資料夾**：受測 API 底下的 `loop/`（沒有就建）。

**自己跑完，中途不要問人。** 需要人決定的事，寫進報告，列成選擇題。

---

## 1. 埠：不寫死，被占就換

| 用途 | 預設埠 |
|---|---|
| API | 5080 |
| 前端 | 3199 |
| 資料庫（PostgreSQL） | 5432 |

1. 啟動前先檢查埠有沒有被占用：
   `Get-NetTCPConnection -LocalPort 5080 -State Listen -ErrorAction SilentlyContinue`（3199、5432 照樣查）。
2. 被別的程式占用，就往上找一個空的埠（API 5081、5082…；前端 3200、3201…）。**不要關掉別人的程式**，也不要猜占用的那個是不是受測服務。
3. **換了 API 的埠，前端的 API 位址要跟著改**：啟動前端時設 `NUXT_PUBLIC_API_BASE=http://localhost:<API 埠>`（`fullchain-app/nuxt.config.ts` 讀這個變數，決定 `/api/equipment` 轉發到哪）。
4. **換了埠，`API_URL`（API）和 `BASE_URL`（前端）兩個環境變數要跟著改**：run-e2e 和子代理的 Playwright 腳本都讀這兩個變數，不寫死網址。預設是 `http://localhost:5080`、`http://localhost:3199`。
5. PostgreSQL 不在 5432：受測 API 用環境變數 `ConnectionStrings__Default` 帶實際的埠。
6. **run-e2e 預設也用 5080／3199。要換埠就設 `API_URL`、`BASE_URL`，不准改 `run-e2e.ps1`。** run-e2e 的資料庫固定連 5432：PostgreSQL 服務本來就在 5432 監聽，這是正常的，不用也不准關。用 psql 以 postgres／12345 登得進去就可以跑；5432 上跑的不是 PostgreSQL，或登不進去，run-e2e 就跑不起來，停下，在報告寫明是哪個 PID、哪個程式，交人處理。
7. 用了哪些埠，寫進 `LOOP-LOG.md` 和 `LOOP-REPORT.html`。

### 1.1 受測服務怎麼啟動（背景執行）

先 API，再前端。設定和執行寫在**同一行指令**（每開一個新終端機，環境變數都會重來）：

- API（在 `step3_new_module/my-equipment-api`）：
  `dotnet run --project src/CrudTemplate.Api --urls http://localhost:5080`
- 前端（在 `step4_loop_e2e/fullchain-app`）：
  `$env:NUXT_PUBLIC_USE_API = 'true'; $env:NUXT_PUBLIC_API_BASE = 'http://localhost:5080'; pnpm dev --port 3199`

等 `http://localhost:<API 埠>/api/equipment/items` 回 200、`http://localhost:<前端埠>/equipment/crud` 回 200，才算起來。
起不來就先修（看終端機輸出），不用跑 run-e2e 也知道會紅。

### 1.2 跑 run-e2e：加 `-ReuseRunning`，直接用已啟動的服務

受測服務和 run-e2e 預設用同一組埠。兩套一起開，會撞埠、鎖住 `bin/`、兩個前端互相蓋掉 `fullchain-app/.nuxt/`。所以 run-e2e 一律加 `-ReuseRunning`：前端沿用你開的那個，不另開第二個；API 先停掉，讓 run-e2e 起一個乾淨的（見第 4 點）。

1. 指令（在工作坊根目錄）：
   `powershell -ExecutionPolicy Bypass -File step4_loop_e2e/run-e2e.ps1 -ReuseRunning`
   也可以先設 `$env:E2E_REUSE = '1'`，效果一樣。
2. run-e2e 會分別看 `API_URL`（預設 `http://localhost:5080`）和 `BASE_URL`（預設 `http://localhost:3199`）：
   - 有回應：直接用，不自己啟動，跑完也不關。
   - 沒回應：照原本流程自己啟動（API 連 `ai_crud_equipment_e2e`，每次重建），跑完只關自己啟動的。
3. **埠換了，就設 `API_URL`、`BASE_URL`**，跟指令寫在同一行：
   `$env:API_URL = 'http://localhost:5081'; $env:BASE_URL = 'http://localhost:3200'; powershell -ExecutionPolicy Bypass -File step4_loop_e2e/run-e2e.ps1 -ReuseRunning`
   `API_URL` 要跟受測前端的 `NUXT_PUBLIC_API_BASE` 一樣，前端才會轉發到同一個 API。
4. **跑之前先停受測 API（只停你自己啟動的 PID）；前端不用停。** 原因有兩個：
   1. 改了程式要重新 build。跑著的 API 會鎖住 `bin/`，本來就要停。
   2. E1 要資料剛好 24 筆。受測 API 連的是開發庫，被沿用的話，E2E 新增、刪除的資料會寫進開發庫。停掉之後，run-e2e 會自己重建 `_e2e` 庫、自己在同一個埠啟動一個乾淨的 API，跑完自己關。前端照樣沿用你開的那個。
5. run-e2e 跑測試前會先擋三件事，擋到就 FAIL、不跑測試。照訊息處理再跑：
   - 沿用的 API 不在被測 API 資料夾裡（綠燈要屬於被測的那一份）。
   - 沿用的 API 不是剛好 24 筆。
   - 前端轉發到的 API 不是剛好 24 筆（`NUXT_PUBLIC_API_BASE` 跟 `API_URL` 對不上），或前端不是 API 模式。

所以每一輪都照這個順序：**停受測 API → 改程式 → build／test → run-e2e -ReuseRunning → 再把受測 API 啟動回來**。受測前端從頭開到尾。

跑完**不要關掉受測服務**：人要照報告上的網址自己點一遍。報告寫明網址和兩個 PID（行程編號），讓人知道怎麼關。

---

## 2. 鐵律（五條）

1. **同一問題修兩次沒好，就停下回報。**
2. **不准改測試、放寬斷言或跳過測試**：step4 的 E2E 和受測 API 自己的 `dotnet test` 都算。可以新增測試，不准刪、不准放寬。覺得測試有問題，停下等人裁決。
3. **不准拆掉共用零件自己重寫**：範本的 `Common/ModelResult.cs`、`Common/GlobalExceptionHandler.cs`、`Common/ApiResultExtensions.cs`（狀態碼對映）、Mapperly 的 Mapper 慣例（`Mapping/`）、分層（Controller → Service → AppDbContext）。Controller 不准直接查資料庫。
4. **PRD 沒寫的修改，在報告標成「規格外調整」。**
5. **改綱要一律走 EF migration**：`dotnet ef migrations add <名稱>`，只新增、不改既有 migration。**不准直接改資料庫**（不准手下 `ALTER TABLE`、不准手改資料去湊測試）。

補充：

- `step4_loop_e2e/` 底下的檔一律不動，包括 `run-e2e.ps1`、`e2e/`、`tests.sha256`、`tools/`、`fullchain-app/`。不准重算測試基準。你寫的檔一個都不准放進 `step4_loop_e2e/`（run-e2e 和 `pnpm dev` 自己產生的報告、快取除外）。
- 範本正本 `docs/baseline/` 不准改；差異一律寫進 `docs/` 的 delta 文件。
- **不准自己推翻 step3 已拍板的決策**（SRS-delta 第 1 段的 Q1、Q2…）。審查發現的問題要動到已拍板的取捨（例如 Q1 撞號要不要加鎖），先不修，寫進報告列成選擇題，交人裁決。
- 測試在驗 PRD 沒寫的東西（例如錯誤訊息文字、編碼格式）時，預設先改 API 對齊測試，標「規格外調整」，再在報告裡問人要不要留。
- 判斷是**前端**（fullchain-app）的問題：不准改，寫進報告交人裁決。

---

## 3. LOOP 一圈怎麼跑

1. 檢查埠，在背景啟動受測服務（第 1 節），確認兩個都起得來。
2. 停掉受測 API（1.2 節；前端不用停），在工作坊根目錄跑 run-e2e：
   `powershell -ExecutionPolicy Bypass -File step4_loop_e2e/run-e2e.ps1 -ReuseRunning`
3. 有紅：看終端機輸出、`step4_loop_e2e/e2e/test-results/` 裡的失敗截圖、`step4_loop_e2e/.run-logs/` 的 `backend.err.log` 和 `frontend.err.log`。判斷根因是哪一種：
   - API 不符契約（欄位名、狀態碼、編碼、驗證）
   - 資料庫或 migration
   - 環境（埠、PostgreSQL 沒開、套件）
   - 測試本身
4. 修受測 API。修完先跑 `dotnet build -p:TreatWarningsAsErrors=true`（0 警告 0 錯誤）和 `dotnet test`（全綠），再跑 run-e2e。
5. 每跑一次 run-e2e，就在 `LOOP-LOG.md` 追加一筆（第 5 節）。
6. 6 條全綠，就把受測 API 啟動回來，進對抗審查（第 4 節）。

---

## 4. 對抗審查：全綠之後

1. 開一個**子代理**（subagent）。子代理只挑錯，不誇獎。子代理用 **Opus 5.5**（見 4.1）。
2. **先用 HTTP 實打受測 API**（`API_URL`），每一筆都記下請求、狀態碼、回應主體：

   | 請求 | 期望 |
   |---|---|
   | `GET /api/equipment/items` | 200；`data` 24 筆（審查前）；欄位 camelCase、含 `updatedAt` |
   | `GET /api/equipment/items/E-001` | 200；`{ success, message, data }` |
   | `GET /api/equipment/items/E-999` | 404；`success` 是 false、訊息繁中 |
   | `POST` 一筆合法資料 | 201＋`Location`；`id`、`code` 由後端產生，`code` 格式「類別2碼-項目3碼-流水3碼」 |
   | `POST` 缺必填欄 | 400；`errors` 的鍵是 camelCase、訊息繁中 |
   | `POST` 的 body 帶 `id`、`code` | 被忽略，仍由後端產生 |
   | `PUT` 自己新增的那筆 | 200；新值生效 |
   | `PUT /api/equipment/items/E-999` | 404（不做 upsert） |
   | `DELETE` 自己新增的那筆 | 204 無主體；再刪一次 404 |
   | 409 | 契約保留、本版不發出；出現了就列為問題 |
   | 任何請求 | 不准出現 500；回應不准外露例外細節或連線字串 |

   規則：要測更新和刪除，**先新增一筆再動那一筆**，不要動 24 筆種子。審完把自己新增的資料刪掉。
   最後用 psql 查一次 `equipment_item` 的筆數，跟 `GET` 回的筆數對得上。
3. **再用 Playwright 開瀏覽器，全鏈路逐頁截圖**（`BASE_URL`，API 模式）：
   - 列表（共 24 筆，資料來自 PostgreSQL）
   - 新增表單填好
   - 新增後按 F5 重整，那一筆還在
   - 編輯後重整，新值還在
   - 驗證紅字（空表單按儲存）
   - 刪除確認
   - Swagger 頁（`API_URL/swagger`）
4. 截圖存到 `loop/screenshots/`，檔名用編號，例如 `01-list.png`。HTTP 結果存到 `loop/http-check.md`。審查用的腳本也放在 `loop/`。
   Playwright 可以用 `step4_loop_e2e/e2e/node_modules` 已經裝好的那一份，但**不准把任何檔放進 `step4_loop_e2e/`**。
5. 對照 `PRD-中心裝備物資-後端.md` 和 `contract-conventions-summary.md`，挑兩種問題：
   - **App 的問題**：測試沒抓到、但不符合 PRD 或契約的地方。例如狀態碼不對、錯誤鍵是 PascalCase、訊息是英文、`code` 格式不對、種子跟前端對不上、Controller 裡有商業邏輯。
   - **測試的假綠**：E2E 或 `dotnet test` 斷言太鬆、只看畫面沒重整、選錯元素、靠 `nth` 的 selector、測試互相影響、筆數寫死。
6. 處理方式：
   - **App 的問題**：修受測 API，照第 3 節再跑一圈（build、test、run-e2e），確認 6 條還是全綠。改到畫面或回應的話，重打那幾筆 HTTP、重拍那幾張截圖。
   - **測試的問題**：只列出來，不准改。寫進報告，列成選擇題交人裁決。

### 4.1 模型

1. 開發（修程式、跑測試）用 **Sonnet 5.5**。
2. 對抗審查的子代理用 **Opus 5.5**。審查用的模型要比開發用的模型**高一級**。
3. 理由：有規矩和範本，開發不用最強的模型，審查才值得用強的。token 夠的話，審的要比寫的強。

---

## 5. 產出：四樣

| 檔 | 給誰看 | 一句話 |
|---|---|---|
| `step3_new_module/my-equipment-api/loop/LOOP-LOG.md` | 機器、事後追查 | 每一輪的流水紀錄，不用美 |
| `step3_new_module/my-equipment-api/loop/LOOP-REPORT.html` | 人 | 結果報告，結論在最前面，圖文並茂 |
| 測試報告：`step4_loop_e2e/e2e/playwright-report/index.html`＋`dotnet test` 結果摘要 | 人 | Playwright 報告由 run-e2e 自動產生；`dotnet test` 的結果寫進 LOOP-REPORT.html |
| 文件同步：`docs/` 的 SRS-delta、設計文件-delta、圖 | 人、接手的人 | 改動處標「step4 LOOP 後」 |

另外：`loop/screenshots/`（審查截圖）、`loop/http-check.md`（HTTP 實打結果）。

### 5.1 `LOOP-LOG.md`：流水紀錄

每跑一次 run-e2e，就在檔尾追加一段。只追加，不刪舊的。格式：

```
## 第 1 輪 2026-10-07 14:03
- 埠：API 5080／前端 3199／DB 5432（受測服務）；run-e2e 5080／3199
- 指令：powershell -ExecutionPolicy Bypass -File step4_loop_e2e/run-e2e.ps1 -ReuseRunning
- 沿用：前端（PID 12345）；API 由 run-e2e 自己啟動
- dotnet test：89 passed / 0 failed
- 結果：5 passed / 1 failed
- 紅：E3 後端產碼
- 根因：新增時 code 沒在交易內產生，回傳空字串
- 改檔：src/CrudTemplate.Api/Services/EquipmentService.cs
```

對抗審查也記一段：子代理挑到幾條、哪幾條修了、哪幾條交人裁決。

### 5.2 `LOOP-REPORT.html`：給人看的結果報告

單一 HTML 檔，不用網路也打得開。截圖用相對路徑（`screenshots/01-list.png`）。內容照這個順序：

1. **結論在最前面**：一句話。例如「6 條全綠，dotnet test 89 條全綠，對抗審查挑到 3 條，修了 2 條，1 條要你裁決」。停在紅燈的話，寫停在哪一條、為什麼。
2. **受測網址**：前端 `http://localhost:<前端埠>/equipment/crud`、API `http://localhost:<API 埠>/swagger`，加上兩個 PID。
3. **每一輪**：紅了哪幾條、一句根因、改了哪個檔。一輪一列。
4. **測試結果**：`dotnet build` 警告數、`dotnet test` 幾條通過（含新增的）、run-e2e 的總結行。
5. **對抗審查**：先放 HTTP 實打的矩陣（請求、期望、實際、過不過），再放截圖。每條發現寫怎麼處理（修了／交人裁決）。
6. **規格外調整**：PRD 沒寫、但為了測試改了的地方，一條一列。
7. **要人裁決的事**：列成選擇題，每題 2～4 個選項，標出建議和一句理由。
8. **文件同步**：SRS-delta、設計文件-delta、圖各改了哪幾段。
9. **最後附總結行**：run-e2e 的「E2E 全綠：6 條 passed」、exit 0。
10. **測試報告連結**：用相對路徑 `../../../step4_loop_e2e/e2e/playwright-report/index.html`。

版面要求：

- 字要大：內文 18px 以上，標題更大。
- 圖文並茂：每一段審查發現，都配一張截圖或一段 HTTP 回應。
- 白話：少用術語，非用不可就加一句解釋。

### 5.3 測試報告

- `step4_loop_e2e/e2e/playwright-report/index.html`：run-e2e 每跑一次，Playwright 就自動重寫，所以它永遠是最後一次的結果。最後一次要是全綠的那次，報告才會顯示 6 條綠。你不用自己產生，只要在 `LOOP-REPORT.html` 放相對連結。
- `dotnet test`：把最後一次的總數、通過數、失敗數寫進 `LOOP-REPORT.html`。

### 5.4 文件同步：程式改了，文件跟著改

1. 受測 API 的 `docs/` 有三個檔要跟著程式改：`SRS-裝備物資API-delta.md`、`DESIGN-裝備物資API-delta.md`、`DIAGRAMS-裝備物資API.html`。
2. 改動的地方標「**step4 LOOP 後**」。
3. 圖改完，用瀏覽器打開確認還出得來，沒有 mermaid 的紅字錯誤。
4. 找不到某個檔，不要自己從零補寫。在報告裡列成選擇題，問人要不要補。

---

## 6. 收尾：在對話裡回報

回報三行就好：

1. 結論一句（E2E 幾條綠、`dotnet test` 幾條綠、要人裁決幾件）。
2. `LOOP-REPORT.html` 的完整路徑。
3. 受測網址（前端與 Swagger，含埠）。

---

## 7. step6（問卷 API）照這份做時

step6 的 LOOP prompt 也叫你照這份做。鐵律（第 2 節）、對抗審查的做法（第 4 節）、產出格式（第 5 節）、收尾（第 6 節）都一樣，只換下面這幾樣：

1. **受測 API**：`step6_survey_api/my-survey-api`，連它自己的開發庫（README 驗收用 `ai_crud_survey`）。**沒有受測前端。**
   啟動（在 `step6_survey_api/my-survey-api`）：`dotnet run --project src/CrudTemplate.Api --urls http://localhost:5080`。埠照第 1 節的規則換。
2. **沒有 run-e2e**：1.2 節和第 3 節的 run-e2e 都跳過。綠燈是下面兩樣都過：
   - `dotnet build -p:TreatWarningsAsErrors=true`：0 警告 0 錯誤。
   - `dotnet test`：全綠，而且涵蓋開工 prompt「完成的定義」列的情境。
   跑 build／test 前一樣先停受測 API（它會鎖住 `bin/`），跑完再啟動回來。每跑一次 `dotnet test`，就在 `LOOP-LOG.md` 追加一筆（格式同 5.1）。
3. **HTTP 實打**（取代第 4 節第 2 點那張表）：

   | 請求 | 期望 |
   |---|---|
   | `POST /api/survey`，合法的 8 欄 | 201＋`Location`；`id`、`submittedAt` 由後端產生 |
   | `POST` 缺 `organization` | 400；`errors` 的鍵是 camelCase、訊息繁中 |
   | `POST` 的 `difficulty` 送 `"適中"` | 400（不在允許清單） |
   | `POST` 的 `adoptPlan` 送 `"LOOP驗證"`（少了半形空格） | 400 |
   | `POST` 的 `rating` 送 `6` | 400 |
   | `POST` 的 body 帶 `id`、`submittedAt` | 被忽略，仍由後端產生 |
   | `GET /api/survey` | 200；`ModelResult<List<T>>`；新的在最前面；每筆剛好 10 欄，名稱、型別對齊 `useSurveyResponses.before.ts` 的 `SurveyResponse` |
   | `DELETE /api/survey` | SCOPE Q5 裁決要做才測：204 無主體 |
   | 任何請求 | 不准出現 500；回應不准外露例外細節或連線字串 |

   問卷沒有單筆刪除，審查新增的資料不用刪，在報告寫明新增了幾筆。最後用 psql 查問卷資料表：筆數跟 `GET` 對得上，中文單選值原樣存進去（Q3 裁決改存英文 key 的話，照設計文件-delta 的對照表核）。
4. **接縫驗證**：在工作坊根目錄跑 `powershell -ExecutionPolicy Bypass -File step6_survey_api/verify-seam.ps1`，結果（PASS／FAIL／SKIP）寫進報告。
5. **截圖**：沒有受測前端，第 4 節第 3 點只截 Swagger 頁（`API_URL/swagger`）。
6. **對照的文件**：`PRD-課程回饋問卷.md`、`useSurveyResponses.before.ts`、`contract-conventions-summary.md`（都在 `my-survey-api` 根目錄）。
7. **產出**：放在 `step6_survey_api/my-survey-api/loop/`。測試報告只有 `dotnet test` 的結果，沒有 Playwright 報告。文件同步改 `docs/SRS-問卷API-delta.md`、`docs/DESIGN-問卷API-delta.md`、`docs/DIAGRAMS-問卷API.html`，改動處標「**step6 LOOP 後**」。
8. **收尾回報**：受測網址只寫 Swagger（含埠）。
