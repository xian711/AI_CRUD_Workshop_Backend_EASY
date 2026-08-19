# step6｜課後練習：把那一行 TODO 變成真的 API

> **時間**：課後自己做，約 60–90 分鐘（依 AI Agent 而定）。**課堂不做這一關。**
> **前置**：step0～step5 走完，`my-equipment-api` 已經跑得起來。

## 一、這一關在幹嘛

前端課的課後驗收題是做一份**課程回饋問卷**。學員做出來了，但資料存在瀏覽器 `localStorage`，
換一台電腦就看不到。程式裡留了一行：

```ts
// TODO: DEV 串接 POST /api/survey
```

**這一關就是把那一行變成真的。** 你要用這門課學到的整套流程，
從**同一份 PRD** 生出一支 `POST /api/survey`／`GET /api/survey`，
然後把前端的資料層換成打你的 API——**而且頁面一行都不用改**。

### 為什麼這題值得做

step3 的裝備物資是「照著課程給的 PRD 做」。這一題不一樣：

| | step3 裝備物資 | step6 問卷 API |
|---|---|---|
| 需求從哪來 | 課程準備好的後端 PRD | **前端課的 PRD，沒有為後端改寫過一個字** |
| 前端從哪來 | 課程附的現成成品 | **你自己在前端課做的** |
| 你要補的 | 後端 | **後端 ＋ 前端資料層的接法** |
| 證明什麼 | 你會用 harness 生 API | **「前端留接縫」不是空話——真的換的時候，頁面一行都沒動** |

> **沒上過前端課？** 也能做。本資料夾的 `seam/` 附了接縫的 before／after 兩份 composable，
> 你可以只做後端，用 `verify-seam.ps1` 看懂「呼叫端不用改」是什麼意思。

---

## 二、需求：沿用同一份 PRD，一個字都不要改

需求來源只有一份：[`../PRD-課程回饋問卷.md`](../PRD-課程回饋問卷.md)（在專案根目錄）。

**不要另外寫一份後端 PRD。** 這是刻意的——真實工作就是這樣：
你拿到的需求是別人（PM／前端）寫的，不會為你重寫一份。
你的工作是**把它翻譯成後端契約**，翻譯過程中發現的模糊處，用選擇題問人，不要自己發明。

那份 PRD 有 8 個欄位、7 條行為規則（BR-1～BR-7）、5 條非功能需求（NFR-1～NFR-5）。
其中跟後端有關的是：

| PRD 條目 | 對後端的意思 |
|---|---|
| 第 3 節 8 個欄位 | 契約欄位表的來源（加上 `id`、`submittedAt` 共 10 欄） |
| BR-1 必填驗證 | 後端要不要重驗一次？（SCOPE Q4） |
| BR-4 存 localStorage | **這條要被你取代**——改成存 PostgreSQL |
| BR-5 清空要二次確認 | 二次確認是前端的事；但「清空」要不要變成一個 API？（SCOPE Q5） |
| BR-6 CSV 匯出含 BOM | 匯出留前端還是搬後端？（SCOPE Q5） |
| **BR-7 留接縫，呼叫端不用改** | **這一關的驗收重點** |
| 第 6 節「範圍外：後端 API 與資料庫」 | 那是**前端版**的範圍外。這一關就是來做它的 |

---

## 三、動線（跟 step3 一樣的五步，不要跳）

```
1. 讀 PRD          ← 只讀 PRD，不要先想資料表
2. 釐清選擇題      ← 讓 AI 出題，你拍板（SCOPE 六題，見下）
3. SRS/SDD-delta   ← 相對於「CRUD 後端標準」的差異，不重述通則
4. 生成            ← Entity → migration → DTO → Mapper → Service → Controller → tests
5. LOOP 驗證       ← 紅 → 判因 → 修 → 綠，再跑接縫驗證
```

起手 prompt 三段，整段複製即可：[`PROMPTS.md`](PROMPTS.md)。

### 準備工作區

```powershell
# 從範本複製一份新工作區（harness 四件在範本專案根目錄，會一起帶走）
Copy-Item -Recurse step2_speedrun_kit\2.5_sample_api\sample-api step6_survey_api\my-survey-api

# 只把 PRD 放進去（AI 才讀得到需求），不要複製任何答案檔
Copy-Item PRD-課程回饋問卷.md step6_survey_api\my-survey-api\

# 進入專案資料夾，在「這個資料夾」開 AI Agent（工作目錄＝專案根目錄，AI 才會自動讀 CLAUDE.md）
cd step6_survey_api\my-survey-api
```

---

## 四、契約（凍結，不准改）

端點名稱必須跟前端留的那一行**逐字一致**，這是這一關的重點：

| 操作 | 路由 | 成功 | 失敗 | 封裝 |
|---|---|---|---|---|
| 送出問卷 | `POST /api/survey` | 201 + Location | 400（驗證失敗）／500 | `ModelResult<T>` |
| 取全部回覆 | `GET /api/survey` | 200 | 500 | `ModelResult<List<T>>` |
| 清空全部 | `DELETE /api/survey` | 由 SCOPE Q5 決定要不要做 | — | 204 無主體 |

> **為什麼是 `/api/survey` 不是 `/api/survey/responses`？**
> 因為前端那行 TODO 就是這樣寫的。**契約以已經存在的那一端為準**，不是以「哪個比較漂亮」為準。
> 這跟 step3「後端服從前端已定好的契約，欄名一個都不能改」是同一件事。

契約欄位 10 欄（camelCase）：`id`、`name`、`org`、`satisfaction`、`bestSection`、`difficulty`、
`adoptFirst`、`comment`、`wouldRecommend`、`submittedAt`。
送出時扣掉 `id` 與 `submittedAt`（後端產生，body 帶了也忽略）。

---

## 五、SCOPE 六題（先拍板，再開工）

那份 PRD 是**寫給前端的**，所以有六件事它沒回答。動手前你要先拍板，**每題都要有理由**：

| # | 問題 | 提示 |
|---|---|---|
| **Q1** | `id` 怎麼產？ | PRD 只寫「流水號」。範本用 SEQUENCE 產 `M-###`、裝備用 `E-###`。問卷要跟著這個慣例嗎？ |
| **Q2** | `submittedAt` 誰產、什麼格式？ | PRD 寫 `YYYY-MM-DD HH:mm`——沒有秒、沒有時區。前端現在自己算。搬到後端之後呢？ |
| **Q3** | 單選題的值怎麼存？ | PRD 的選項是中文（「太簡單／剛好／太難」）。存中文？存英文 key？要不要建字典表？ |
| **Q4** | 後端要不要重驗一次必填？ | BR-1 說前端會驗。後端再驗一次是重工，還是必要？驗到不合法要回什麼？ |
| **Q5** | 「清空全部」與「匯出 CSV」誰做？ | 前端版兩個都在前端。接上後端之後，哪個該搬、哪個不該搬？ |
| **Q6** | `GET /api/survey` 要不要保護與分頁？ | PRD 第 6 節說「管理頁不設密碼，靠網址不外流」。那 API 呢？資料量大了怎麼辦？ |

> **答案不在學員教材裡。** 拍板完再看 `../instructor/SCOPE-問卷API範圍決策.md` 對答（那是講師檔）。
> **先自己答完再看**——直接抄等於跳過這一關最重要的練習。
>
> ⚠️ **Q1／Q3 有陷阱**：「照範本慣例」跟「照前端已經在用的格式」可能會打架。
> harness 要的不是「永遠照抄範本」，是「**決策有依據、偏離有記錄**」——偏離就寫進 SDD-delta。

---

## 六、驗收（四路，缺一不可）

### 1. 三路驗收（跟 step3 一樣）

```powershell
# 路 1：Swagger 打通端點（先 dotnet run 起 API，開 http://localhost:5080/swagger）
#   POST /api/survey  → 201 + Location，id 與 submittedAt 由後端產生
#   POST 缺必填       → 400，errors 為 camelCase 且訊息繁中
#   GET  /api/survey  → 200，回得到剛才那筆

# 路 2：測試全綠
dotnet build; if ($?) { dotnet test }

# 路 3：psql 直查資料庫，親眼看到資料真的落地
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d ai_crud_survey -c "SELECT id, org, satisfaction, submitted_at FROM survey_response ORDER BY id;"
```

### 2. 接縫驗證（這一關獨有，也是最重要的一路）

```powershell
powershell -ExecutionPolicy Bypass -File .\step6_survey_api\verify-seam.ps1
```

它比對 `seam/` 底下 before／after 兩份 composable 的四樣東西：

1. 對外 `export` 出去的名字
2. `SurveyResponse` 介面的欄位（跟後端共用的契約）
3. composable `return` 的 key（呼叫端 destructure 用的）
4. 每個 function 的簽章（參數與回傳型別）

**四樣完全相同，才叫「呼叫端一行不用改」。** 任何一樣不同就 exit 1。

> **有你自己前端專案的話**，直接驗真的那兩版：
> ```powershell
> .\step6_survey_api\verify-seam.ps1 -Before <你改之前的備份> -After <你改完的檔>
> ```

### 3. 真的換一次（有前端專案才做）

把你前端課的 `useSurveyResponses.ts` 內部換成打 API，然後：

```powershell
git diff --stat
```

**應該只有那一個檔有變更，`pages/survey/*.vue` 是 0 行。** 這就是全部的證據。

---

## 七、完成檢核表

- [ ] 只讀 PRD，沒有自己另外寫一份後端需求
- [ ] AI 有先出釐清選擇題（不是直接寫程式）
- [ ] SCOPE 六題逐題拍板，**每題都有一句理由**
- [ ] 有跟範本慣例不同的地方，已經寫進 SDD-delta（偏離有記錄）
- [ ] 端點是 `POST /api/survey`／`GET /api/survey`，**逐字對齊前端那行 TODO**
- [ ] 三路驗收全過：Swagger、`dotnet test`、psql
- [ ] `verify-seam.ps1` 綠燈（exit 0）
- [ ] 換完前端後 `git diff --stat` 顯示 `pages/` 是 0 行變更
- [ ] 完成一次 LOOP：紅 → 判因（是 API bug、DB bug 還是測試本身寫錯）→ 修 → 綠

---

## 八、這一關真正要你帶走的

**「留接縫」不是寫一行 TODO 註解就算數。**

真正的接縫是：**把「會變的東西」關進一個檔案裡，讓外面的人看不到它變過。**
前端課把 localStorage 的細節全部關在 `useSurveyResponses.ts` 裡，
只對外露出 `submit`／`loadAll`／`clearAll` 三個名字——所以今天換成打 API，外面完全無感。

同一個道理，你這門課學的 harness 四件，就是在幫你把「怎麼寫」的決定關進四個檔案裡。

> 生活比喻：家裡的插座。你換冷氣、換冰箱、換烤箱，插頭形狀都一樣，**牆壁一次都沒敲過**。
> 插座規格就是接縫。定好接縫，兩邊才能各自換。
