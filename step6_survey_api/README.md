# step6｜課後練習：把那一行 TODO 變成真的 API

> **時間**：課後自己做，約 60–90 分鐘（依 AI Agent 而定）。**課堂不做這一關。**
> **前置**：step0～step5 走完，`my-equipment-api` 已經跑得起來。

## 一、這一關在幹嘛

前端課的課後驗收題是做一份**課程回饋問卷**。學員做出來了，但資料存在瀏覽器的 `localStorage`
（瀏覽器自己的小儲藏室，只有這台電腦的這個瀏覽器拿得到），換一台電腦就看不到。程式裡留了一行：

```ts
// TODO: DEV 串接 POST /api/survey
```

**這一關就是把那一行變成真的。** 你要用這門課學到的整套流程，
從**同一份 PRD** 生出一支 `POST /api/survey`／`GET /api/survey`，
然後把前端的資料層換成打你的 API——**而且頁面一行都不用改**。

> 比喻：家裡的插座。換冷氣、換冰箱，插頭形狀都一樣，牆壁一次都沒敲過。
> 前端頁面是牆壁，資料層是插座：這一關只換插座後面接的線（從瀏覽器換成你的 API），牆壁不動。完整說明在第八節。

### 為什麼這題值得做

step3 的裝備物資是「照著課程給的 PRD 做」。這一題不一樣：

| | step3 裝備物資 | step6 問卷 API |
|---|---|---|
| 需求從哪來 | 課程準備好的後端 PRD | **前端課的 PRD，沒有為後端改寫過一個字** |
| 前端從哪來 | 課程附的現成成品 | **你自己在前端課做的** |
| 你要補的 | 後端 | **後端 ＋ 前端資料層的接法** |
| 證明什麼 | 你會用 harness 生 API | **「前端留接縫」不是空話——真的換的時候，頁面一行都沒動** |

> **沒上過前端課？** 也能做。本資料夾的 `seam/` 附了接縫的改前、改後兩份 composable（前端專門負責存取資料的檔案）：
> - `useSurveyResponses.before.ts`：前端課 survey-app 真檔的**逐字副本**（存 localStorage，留著那行 TODO）。
> - `useSurveyResponses.after.ts`：同一個檔接上 `POST`／`GET`／`DELETE /api/survey` 之後的版本。
>
> 你可以只做後端，用 `verify-seam.ps1` 看懂「呼叫端不用改」是什麼意思。

---

## 二、需求：沿用同一份 PRD，一個字都不要改

需求來源只有一份：[`../PRD-課程回饋問卷.md`](../PRD-課程回饋問卷.md)（在專案根目錄）。

**不要另外寫一份後端 PRD。** 這是刻意的——真實工作就是這樣：
你拿到的需求是別人（PM 產品經理／前端）寫的，不會為你重寫一份。
你的工作是**把它翻譯成後端契約**，翻譯過程中發現的模糊處，用選擇題問人，不要自己發明。

那份 PRD 有 8 個欄位、7 條行為規則（BR-1～BR-7）、5 條非功能需求（NFR-1～NFR-5）。
其中跟後端有關的是：

| PRD 條目 | 對後端的意思 |
|---|---|
| 第 3 節 8 個欄位 | 契約欄位表的來源（加上 `id`、`submittedAt` 共 10 欄）。PRD 只有中文題目；**英文欄位名、型別、單選值以前端已經寫好的 composable 為準**（見第四節） |
| BR-1 必填驗證 | 後端要不要重驗一次？（SCOPE Q4） |
| BR-4 存 localStorage | **這條要被你取代**——改成存 PostgreSQL |
| BR-5 清空要二次確認 | 二次確認是前端的事；但「清空」要不要變成一個 API？（SCOPE Q5） |
| BR-6 CSV 匯出含 BOM（檔案開頭的隱藏記號，讓 Excel 認得中文） | 匯出留前端還是搬後端？（SCOPE Q5） |
| **BR-7 留接縫，呼叫端不用改** | **這一關的驗收重點** |
| 第 6 節「範圍外：後端 API 與資料庫」 | 那是**前端版**的範圍外。這一關就是來做它的 |

---

## 三、動線（跟 step3 一樣的五步，不要跳）

這一關跟 step3 走同一套規格驅動開發（SDD）流程：先文件，再程式。

```
1. 讀 PRD                ← 只讀 PRD，不要先想資料表
2. 釐清選擇題            ← 讓 AI 出題，你拍板（SCOPE 六題，見下）
3. SRS／設計文件-delta＋圖 ← 照 step3 的最小樣板，只寫跟「CRUD 後端標準」不同的地方
4. 生成                  ← Entity → migration → DTO → Mapper → Service → Controller → tests
5. LOOP 驗證             ← 紅 → 判因 → 修 → 綠，再跑接縫驗證
```

第 3 步要交的四個檔，照 step3 的同一份最小樣板（`step3_new_module\SRS-設計文件-最小樣板.md`）交，都放在 `my-survey-api\docs\`：

| 檔 | 是什麼 |
|---|---|
| `SRS-問卷API-delta.md` | 要做什麼：六題裁決、需求追溯、範圍外、待定與風險 |
| `DESIGN-問卷API-delta.md` | 設計文件，怎麼做：檔案責任、資料模型、關鍵決策、harness 證據 |
| `DIAGRAMS-問卷API.html` | 四張圖，用瀏覽器開 |
| `TASKS.md` | 任務清單 |

prompt 三段（起手、開工、LOOP），整段複製即可：[`PROMPTS.md`](PROMPTS.md)。

**模型怎麼選：** 文件階段用 **Opus 5.5**；說「開工」寫程式前切成 **Sonnet 5.5**；LOOP 的對抗審查子代理用 **Opus 5.5**。

### 準備工作區

```powershell
# 從範本複製一份新工作區（harness 四件在範本專案根目錄，會一起帶走）
Copy-Item -Recurse step2_speedrun_kit\2.5_sample_api\sample-api step6_survey_api\my-survey-api

# 放三個檔進去，AI 才讀得到：需求（PRD）＋前端現有的資料層（契約的那一端）＋交件格式（最小樣板）。不要複製任何答案檔
Copy-Item PRD-課程回饋問卷.md step6_survey_api\my-survey-api\
Copy-Item step6_survey_api\seam\useSurveyResponses.before.ts step6_survey_api\my-survey-api\
Copy-Item step3_new_module\SRS-設計文件-最小樣板.md step6_survey_api\my-survey-api\

# 進入專案資料夾，在「這個資料夾」開 AI Agent（工作目錄＝專案根目錄，AI 才會自動讀 CLAUDE.md）
cd step6_survey_api\my-survey-api
```

---

## 四、契約（凍結，不准改）

端點名稱必須跟前端留的那一行**逐字一致**，這是這一關的重點：

| 操作 | 路由 | 成功 | 失敗 | 封裝 |
|---|---|---|---|---|
| 送出問卷 | `POST /api/survey` | 201 + Location | 400（驗證失敗）／500 | `ModelResult<T>` |
| 取全部回覆 | `GET /api/survey` | 200，**新的在最前面**（跟前端現在的顯示順序一樣） | 500 | `ModelResult<List<T>>` |
| 清空全部 | `DELETE /api/survey` | 由 SCOPE Q5 決定要不要做 | — | 204 無主體 |

> **為什麼是 `/api/survey` 不是 `/api/survey/responses`？**
> 因為前端那行 TODO 就是這樣寫的。**契約以已經存在的那一端為準**，不是以「哪個比較漂亮」為準。
> 這跟 step3「後端服從前端已定好的契約，欄名一個都不能改」是同一件事。

### 契約欄位：10 欄，以前端 `useSurveyResponses.ts` 的 `SurveyResponse` 為準

欄位名、型別、單選值**逐字照前端**（來源：`seam/useSurveyResponses.before.ts`，就是前端課 survey-app 的真檔）：

| # | 欄位（camelCase） | JSON 型別 | 必填 | 允許值／限制 | PRD 題號 |
|---|---|---|:---:|---|---|
| 1 | `id` | string | 系統產生 | 前端版自己產 `R-001`（`R-` ＋ 3 碼流水號）；後端怎麼產見 SCOPE Q1 | — |
| 2 | `respondentName` | string | — | 選填，可匿名；沒填是空字串 `""` | 第 1 題 姓名 |
| 3 | `organization` | string | ✅ | 去頭尾空白後 1～30 字 | 第 2 題 服務單位 |
| 4 | `rating` | **number** | ✅ | 整數 1～5（5＝非常滿意） | 第 3 題 整體滿意度 |
| 5 | `bestSection` | string | ✅ | `為什麼要 harness`／`範本與規矩`／`生成新模組`／`LOOP 驗證` | 第 4 題 |
| 6 | `difficulty` | string | ✅ | `太簡單`／`剛好`／`太難` | 第 5 題 |
| 7 | `adoptPlan` | string | ✅ | `寫 CODE-RULES`／`整理範本`／`PRD 流程`／`LOOP 驗證` | 第 6 題 |
| 8 | `suggestion` | string | — | 選填，上限 200 字；沒填是空字串 `""` | 第 7 題 建議與想法 |
| 9 | `willRecommend` | string | ✅ | `是`／`否`（**字串，不是 boolean**） | 第 8 題 |
| 10 | `submittedAt` | string | 系統產生 | `YYYY-MM-DD HH:mm`（本地時區） | — |

送出時扣掉 `id` 與 `submittedAt`（後端產生，body 帶了也忽略），所以 `POST` 的 body 剛好是第 2～9 欄這 8 欄。

> ⚠️ **單選值是中文，後端也要收中文。**
> 前端送來的就是 `"剛好"`、`"LOOP 驗證"`、`"是"` 這些中文字，不是英文 key。所以：
> 1. DTO 的 `[AllowedValues]` 要寫**中文值**，逐字含半形空格（`"LOOP 驗證"` 中間有一格空白，`"LOOP驗證"` 會被擋）。
>    比照範本 `MemberEnums.cs`（性別「男／女」、狀態「在職／停用」）：允許值集中在一個常數檔，DTO 與 DB CHECK 共用同一份。
> 2. 資料表的這些欄位用 `text` 或 `varchar(n)` 存中文。PostgreSQL 一律 UTF-8，`varchar(n)` 算的是**字數**不是位元組，
>    中文字面值也不需要 `N''` 前綴。
> 3. 要不要在資料庫裡改存英文 key，是 SCOPE Q3 要你拍板的事；但**API 進出一律是中文**，否則前端就得改。

---

## 五、SCOPE 六題（先拍板，再開工）

那份 PRD 是**寫給前端的**，所以有六件事它沒回答。動手前你要先拍板，**每題都要有理由**：

| # | 問題 | 提示 |
|---|---|---|
| **Q1** | `id` 怎麼產？ | PRD 只寫「流水號」。範本用 SEQUENCE 產 `M-###`、裝備用 `E-###`；前端現在自己掃最大值 +1 產 `R-001`。前綴照誰？取號方式照誰？ |
| **Q2** | `submittedAt` 誰產、什麼格式？ | PRD 寫 `YYYY-MM-DD HH:mm`——沒有秒、沒有時區。前端現在自己算。搬到後端之後呢？ |
| **Q3** | 單選題的值在資料庫怎麼存？ | 前端送來的是中文（「太簡單／剛好／太難」），API 只能收中文。資料庫存中文原值？轉成英文 key 再存？要不要建字典表？ |
| **Q4** | 後端要不要重驗一次必填？ | BR-1 說前端會驗。後端再驗一次是重工，還是必要？驗到不合法要回什麼？ |
| **Q5** | 「清空全部」與「匯出 CSV」誰做？ | 前端版兩個都在前端。接上後端之後，哪個該搬、哪個不該搬？ |
| **Q6** | `GET /api/survey` 要不要保護與分頁？ | PRD 第 6 節說「管理頁不設密碼，靠網址不外流」。那 API 呢？資料量大了怎麼辦？ |

> **答案不在學員教材裡。** 拍板完再看 `../instructor/SCOPE-問卷API範圍決策.md` 對答（那是講師檔）。
> **先自己答完再看**——直接抄等於跳過這一關最重要的練習。
>
> ⚠️ **Q1／Q3 有陷阱**：「照範本慣例」跟「照前端已經在用的格式」可能會打架。
> harness 要的不是「永遠照抄範本」，是「**決策有依據、偏離有記錄**」——偏離就寫進設計文件-delta（`DESIGN-問卷API-delta.md`）。

---

## 六、驗收（四路，缺一不可）

### 1. 三路驗收（跟 step3 一樣）

```powershell
# 路 1：Swagger 打通端點（先 dotnet run 起 API，開 http://localhost:5080/swagger）
#   POST /api/survey  → 201 + Location，id 與 submittedAt 由後端產生
#   POST 缺必填       → 400，errors 為 camelCase 且訊息繁中
#   POST difficulty 送 "適中"（不在允許清單）→ 400
#   GET  /api/survey  → 200，回得到剛才那筆，新的在最前面

# 路 2：測試全綠
dotnet build; if ($?) { dotnet test }

# 路 3：psql 直查資料庫，親眼看到資料真的落地（中文單選值原樣存進去）
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d ai_crud_survey -c "SELECT id, organization, rating, difficulty, will_recommend, submitted_at FROM survey_response ORDER BY id;"
```

### 2. 接縫驗證（第 4 路，這一關獨有，也是最重要的一路）

```powershell
# 前端課 repo 跟後端課 repo 放在同一層
powershell -ExecutionPolicy Bypass -File .\step6_survey_api\verify-seam.ps1

# 前端課 repo 放在別的地方：加 -FrontendRepo
powershell -ExecutionPolicy Bypass -File .\step6_survey_api\verify-seam.ps1 -FrontendRepo D:\code\AI_CRUD_Workshop_Frontend_EASY
```

它分兩關，兩關都過才 `PASS`（exit 0），任一項不過就 `FAIL`（exit 1）：

**第 1 關：before 是不是前端課真的在用的那一份。**
拿前端課 repo 的 `step6_survey\solution\survey-app\composables\useSurveyResponses.ts`
跟 `seam/useSurveyResponses.before.ts` 比，要逐字相同（只忽略換行符號與 BOM）。
這一關保證：後端課拿來當契約的，就是前端課真的在用的那一份，不是憑記憶重打的版本。

- 預設去找「跟後端課 repo 放在同一層」的 `AI_CRUD_Workshop_Frontend_EASY`。
- 放在別的地方：加 `-FrontendRepo <前端課 repo 資料夾>`。
- 找不到前端課 repo：標 `SKIP`，不算失敗（沒上過前端課也能做）；講師要強制檢查就加 `-Strict`。

**第 2 關：after 的對外介面有沒有跟 before 一模一樣。** 比對 8 樣東西：

1. 對外 `export` 出去的名字
2. 每個 `export type`／`interface` 的完整定義（欄位型別、單選值都算）
3. `SurveyResponse` 契約欄位（名稱: 型別，跟後端共用的 10 欄）
4. 每個 `export const` 的值（下拉選項、字數上限）
5. 每個 `export function` 的簽章
6. `useSurveyResponses()` 回傳的 key（`responses`、`submit`、`clearAll`）
7. 回傳的每個值長什麼樣（`submit`／`clearAll` 的簽章；`responses` 是 `computed`）
8. before 要有那行 TODO，after 不能還留著

**全部相同，才叫「呼叫端一行不用改」。** 比對前會先拿掉註解，所以只改註解不會誤判。

> **有你自己前端專案的話**，直接驗真的那兩版（這時第 1 關會自動略過）：
> ```powershell
> .\step6_survey_api\verify-seam.ps1 -Before <你改之前的備份> -After <你改完的檔>
> ```

### 3. 真的換一次（有前端專案才做）

1. 把你前端課的 `composables/useSurveyResponses.ts` 換成打 API 的版本。可以參考 `seam/useSurveyResponses.after.ts`：
   它是雙模式，跟範本 `useTemplateMembers.ts`、step4 的 `useEquipmentItems.ts` 同一個寫法，localStorage 分支原封不動保留。
2. 在 `nuxt.config.ts` 的 `nitro.devProxy` 加一條（比照既有的 `/api/template`），dev 期把請求轉給 .NET，避開 CORS：
   ```ts
   '/api/survey': {
     target: `${apiOrigin}/api/survey`,
     changeOrigin: true,
   },
   ```
3. 先 `dotnet run` 起 API（5080），再用 API 模式啟動前端：
   ```powershell
   $env:NUXT_PUBLIC_USE_API = 'true'; pnpm dev
   ```
4. 填一份問卷，到 `/survey/admin` 看得到；按「清空全部回覆」會清掉資料庫。然後：
   ```powershell
   git diff --stat
   ```

**應該只有 `composables/useSurveyResponses.ts` 與 `nuxt.config.ts`（加 devProxy 那一條）有變更，`pages/survey/*.vue` 是 0 行。** 這就是全部的證據。

> 💡 頁面上有兩句說明文字還寫著「回覆只存在這台裝置的瀏覽器裡」。那是**文案**，不是介面——
> 換資料層不會逼你改它。建議先用上面的 `git diff --stat` 留下「pages 0 行」的證據，再另外一次 commit 改文案。

---

## 七、完成檢核表

- [ ] 只讀 PRD，沒有自己另外寫一份後端需求
- [ ] AI 有先出釐清選擇題（不是直接寫程式）
- [ ] SCOPE 六題逐題拍板，**每題都有一句理由**
- [ ] 照最小樣板交了四個檔：`SRS-問卷API-delta.md`、`DESIGN-問卷API-delta.md`、`DIAGRAMS-問卷API.html`、`TASKS.md`
- [ ] 有跟範本慣例不同的地方，已經寫進設計文件-delta（偏離有記錄）
- [ ] 端點是 `POST /api/survey`／`GET /api/survey`，**逐字對齊前端那行 TODO**
- [ ] 回應 10 欄的名稱與型別**逐字對齊前端** `SurveyResponse`（`rating` 是數字、`willRecommend` 是「是／否」字串）
- [ ] 單選值用**中文**，DTO `[AllowedValues]` 與前端選項逐字相同（含半形空格）
- [ ] 三路驗收全過：Swagger、`dotnet test`、psql
- [ ] `verify-seam.ps1` 綠燈（exit 0）
- [ ] 換完前端後 `git diff --stat` 顯示 `pages/` 是 0 行變更
- [ ] 貼 LOOP prompt，AI 交回 `loop/LOOP-LOG.md` 和 `loop/LOOP-REPORT.html`：紅 → 判因（是 API bug、DB bug 還是測試本身寫錯）→ 修 → 綠，再經過子代理對抗審查

---

## 八、這一關真正要你帶走的

**「留接縫」不是寫一行 TODO 註解就算數。**

真正的接縫是：**把「會變的東西」關進一個檔案裡，讓外面的人看不到它變過。**
前端課把 localStorage 的細節全部關在 `useSurveyResponses.ts` 裡，
composable 只回傳 `responses`／`submit`／`clearAll` 三個名字——所以今天換成打 API，外面完全無感。

同一個道理，你這門課學的 harness 四件，就是在幫你把「怎麼寫」的決定關進四個檔案裡。

> 生活比喻：家裡的插座。你換冷氣、換冰箱、換烤箱，插頭形狀都一樣，**牆壁一次都沒敲過**。
> 插座規格就是接縫。定好接縫，兩邊才能各自換。
