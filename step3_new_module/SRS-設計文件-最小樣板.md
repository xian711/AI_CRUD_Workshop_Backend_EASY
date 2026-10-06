# SRS／設計文件 最小樣板（step3 ④ 用｜後端版）

> **這份是「交出來要長什麼樣」的骨架，不是答案。**
> 起手 prompt 會叫 AI 照這份樣板產出 SRS-delta、設計文件-delta、UML 圖和任務清單。
> 只說「AI 會交出文件」不夠：沒說檔名、最少幾段、你要看什麼，驗收就只剩「有檔就打勾」。
>
> 所以這份把最低門檻定死：**SRS-delta 四段、設計文件-delta 四段、圖四張，缺一樣就退回。**

---

## SDD 是什麼：規格驅動開發

**先給比喻：在一棟蓋好的大樓上加蓋一層。**

1. 建築師先畫加蓋的圖，屋主**看圖點頭**才開工。→ 先寫文件、你拍板，AI 才寫程式。
2. 加蓋只畫**新的那一層**。樓梯、水電總管沿用原大樓的圖，不重畫、也不准拆。→ 後端的文件叫 **delta（差異）**：只寫跟人員範本不同的地方；範本的共用零件不動。
3. 屋主看平面圖就懂，不用看鋼筋計算書。→ **PM 看圖就好，不用看程式。**
4. 施工時改了隔間，竣工圖要跟著改。不改的話，下次裝修的人照舊圖打牆，會打到水管。→ **程式改了，文件跟著改。**

**再講技術：** 這門課的 SDD＝**規格驅動開發**（Specification-Driven Development），做法跟 SpecKit 一樣。流程六步：

1. **PRD**：你給的題目（`PRD-中心裝備物資-後端.md`）。
2. **AI 用選擇題釐清，你拍板**：PRD 第 5 節的六題，加上其他沒寫清楚的地方，AI 一題一題問。
3. **SRS-delta**：拍板後的「要做什麼」定稿。
4. **設計文件-delta＋圖**：「怎麼做」的紀錄，**圖為主**。
5. **任務清單**：拆成小到能單獨驗收的任務。
6. **寫程式**：你說「開工」，AI 才寫。

寫完程式之後，step4 的 LOOP 會再驗一次。**程式改了，文件跟著改**——這條規則從頭到尾都有效。

> 注意：有些書把 SDD 寫成 Software Design Document（軟體設計文件）。**本課的 SDD 只指上面這套流程**，
> 「怎麼做」的那份文件叫「設計文件」（檔名開頭 `DESIGN-`），免得兩個意思搞混。

**模型怎麼選：** 文件階段（步驟 2～5）用 **Opus 5.5**、effort High 想清楚。步驟 6 寫程式，換成 **Sonnet 5.5**。有 harness 和範本，寫程式不用最貴的模型。

---

## 給不會寫程式的人：這兩個縮寫是什麼

| 縮寫 | 中文 | 一句話 | 誰主要看 |
|---|---|---|---|
| **SRS** | 軟體需求規格書 | **「要做什麼」** 的定稿。PRD 是提需求，SRS 是拍板後的版本——含你的六題裁決。 | 你（驗收依據）、前端、QA |
| **DESIGN** | 設計文件 | **「怎麼做」** 的紀錄，**圖為主**。哪些檔新增、哪些共用不動、資料表長什麼樣。圖另外放一個 HTML 檔，用瀏覽器開。 | 工程師、接手的人；PM 看圖就好 |

**PM 要看的其實只有兩樣：SRS-delta 四段，加上設計文件的圖。** 裡面的技術細節你不用讀懂，
但**SRS-delta 第 1 段和第 3 段一定要親自核**——那兩段是「範圍有沒有被偷改」的證據。

---

## 檔名約定

放在你的工作專案 `docs/` 底下（跟範本正本 `docs/baseline/` 同一層）：

```
my-equipment-api/
├─ PRD-中心裝備物資-後端.md          ← 題目（你收到的）
├─ SRS-設計文件-最小樣板.md          ← 本檔
└─ docs/
   ├─ baseline/                      ← 範本正本（SRS、DESIGN），不准改
   ├─ SRS-裝備物資API-delta.md        ← AI 產出（要做什麼）
   ├─ DESIGN-裝備物資API-delta.md     ← AI 產出（怎麼做）
   ├─ DIAGRAMS-裝備物資API.html       ← AI 產出（圖，用瀏覽器開）
   └─ TASKS.md                       ← AI 產出（任務清單；測試數以它為準）
```

---

## SRS-delta 最小四段（`SRS-裝備物資API-delta.md`）

### 1. 已拍板決策 ★PM 必核

把 step3 ③ 的六題裁決寫進來，**一題一列，含理由**。AI 多問的題目（追加題），接在後面編號。

| # | 決策點 | 裁決 | 理由 | 誰拍板 |
|---|---|---|---|---|
| Q1 | `code`（IT-LAP-001）誰產生、怎麼保證不重複 | （你的選擇） | （你的一句話理由） | （你的名字） |
| Q2 | `id`（E-001）怎麼產 | | | |
| Q3 | 分類／項目字典要不要建資料表 | | | |
| Q4 | 刪除是硬刪還是軟刪 | | | |
| Q5 | 分頁／篩選／排序在後端做還是前端做 | | | |
| Q6 | `purchaseDate` 可不可以空、資料庫怎麼存 | | | |
| Q7… | （追加題：AI 多問、你拍板的） | | | |

**核什麼**：六題都在嗎？裁決跟你當時說的一樣嗎？理由是你的話，還是 AI 幫你編的？題號要跟 PRD 第 5 節一樣。

### 2. 需求追溯 ★PM 必核

把 PRD 第 3 節的**契約欄位表 13 欄**與第 7 節的**驗收條件**，對上「實際做出來的東西」。

| PRD 項目 | 有沒有做 | 做在哪 | 備註 |
|---|:---:|---|---|
| 13 欄逐欄列：`id`、`code`、`categoryKey`、`name`、`qty`、`unit`、`spec1`、`keeper`、`keeperPhone`、`locationName`、`status`、`purchaseDate`、`specNote` | ✅／✖ | Entity、DTO、資料表欄位 | 欄名一個字都不能改；必／選填跟 PRD 3.2 節一樣 |
| 回應多一欄 `updatedAt` | ✅／✖ | Result DTO | |
| 第 7 節驗收條件（逐條列） | ✅／✖ | 怎麼驗（Swagger、`dotnet test`、psql） | |

**核什麼**：有沒有**漏做**（PRD 有、表上沒有）、有沒有**偷加**（表上有、PRD 沒有）、有沒有**改欄名**（改了前端就接不上）。
偷加不一定是壞事，但**必須是你點頭的**，不是 AI 自己決定的。

### 3. 範圍外 ★PM 必核

照抄 PRD 2.3 節，**再加上「這一輪決定不做」的東西**。

- （PRD 原本就列的範圍外項目）
- （六題裁決砍掉的東西，例如字典不建表、不做軟刪除——寫明為什麼砍）

**核什麼**：這一段是你回公司時的擋箭牌。有人問「為什麼沒有後端分頁」，答案在這裡。

### 4. 待定與風險

正式上線前還缺什麼。常見的有：

- 編碼併發：「同前綴最大流水 +1」只適合單一寫入者，併發可能撞號
- 認證授權、操作稽核
- 軟刪除政策（現在是硬刪除）
- 後端分頁的啟用門檻（現在假設 < 1000 筆）
- 帳密改用環境變數；409（唯一約束衝突）要不要正式發出

---

## 設計文件-delta 最小四段（`DESIGN-裝備物資API-delta.md`）

第 1～4 段寫在 `DESIGN-裝備物資API-delta.md`；第 5 段是圖，另外放 `DIAGRAMS-裝備物資API.html`。
**只寫跟範本不同的地方**；範本已有的通則（分層、ModelResult、Mapperly、SEQUENCE、snake_case）寫一句「沿用」就好。

### 1. 檔案責任（分層）★PM 可以核

照分層一層一列，寫清楚**哪些新增、哪些既有檔只加不改、哪些共用不動**：

| 層 | 檔案 | 處置 | 為什麼 |
|---|---|---|---|
| Entity | `Entities/EquipmentItem.cs` | 新增 | 跟實體長相有關 |
| 常數 | `Constants/EquipmentEnums.cs` | 新增 | 分類、項目碼、狀態的單一來源 |
| migration | `Data/Migrations/<時間>_AddEquipmentModule.cs` | 新增（`dotnet ef migrations add` 產生） | 綱要變更只走 migration |
| DbContext | `Data/AppDbContext.cs` | 只加不改 | 加 DbSet、SEQUENCE、CHECK、唯一索引 |
| DTO | `Models/EquipmentItemRequest.cs`、`Models/EquipmentItemResult.cs` | 新增 | 驗證規則跟著實體 |
| Mapper | `Mapping/EquipmentMapper.cs` | 新增 | |
| Service | `Services/IEquipmentService.cs`、`Services/EquipmentService.cs` | 新增 | 商業邏輯全在這 |
| Controller | `Controllers/EquipmentItemsController.cs` | 新增 | 薄委派 |
| seed | `Data/EquipmentSeedData.cs`（新增）、`Data/DbSeeder.cs`（只加不改） | | 24 筆，表空才植入 |
| 註冊 | `Program.cs` | 只加不改 | 加兩行註冊 |
| 測試 | `tests/.../Unit/Equipment*Tests.cs`、`tests/.../Integration/EquipmentApiTests.cs` | 新增 | 既有 49 條不動 |
| 共用 | `Common/ModelResult.cs`、`Common/ApiResultExtensions.cs`、`Common/GlobalExceptionHandler.cs`、人員 Members 全套、`docs/baseline/` | **共用不動** | 通用機制與範本正本 |

**核什麼**：特別核「共用不動」那幾個——它們應該跟範本原檔**完全相同**（可以用 `Get-FileHash` 比一次）。
「只加不改」的檔，人員那一段要一個字都沒變。

### 2. 資料模型

- **資料表綱要**：`equipment_item` 每一欄的欄名（snake_case）、型別、NULL 與否、約束（CHECK）。
- **索引**：主鍵、`code` 的唯一索引（寫出索引名）。
- **id 取號**：SEQUENCE 名稱、起始值，跟種子 id 怎麼銜接。
- **seed 24 筆**：id 範圍、狀態分布，**跟前端 SEED 逐欄一致**（同 code、同內容）。
- **null 與空字串**：選填欄空白怎麼存，跟請求格式一致。

### 3. 關鍵決策的實作方式

一題一段，寫「**怎麼做的**、**落在哪個檔**、**為什麼不用別的做法**」。題號跟 SRS-delta 第 1 段一樣。至少包含：

- **編碼誰產生與唯一性（Q1）**：誰算、什麼時候算、在不在交易內、唯一性靠什麼兜底。
- **id（Q2）**：沿用範本 SEQUENCE，還是另想辦法；種子顯式 id 之後怎麼接。
- **字典（Q3）**：建表還是常數；`name` 要不要驗證屬於該分類。
- **刪除策略（Q4）**：硬刪還是軟刪；DELETE 回什麼狀態碼。
- **分頁、篩選、排序（Q5）**：在哪做；**前提**（資料量假設）寫出來。
- **`purchaseDate`（Q6）**：型別、可不可以 null、空字串誰轉換。

**偏離範本慣例的地方，要寫明「偏離了什麼、為什麼」。** 偏離不是錯，沒記錄才是錯。

### 4. 遵守 harness 的證據

| 規則 | 怎麼證明 |
|---|---|
| build 零警告 | `dotnet build -p:TreatWarningsAsErrors=true` 結束碼 0（0 警告 0 錯誤） |
| 測試數 | `dotnet test` 恰好 N 條全綠；N 寫進 `docs/TASKS.md`；既有 49 條一條都沒少 |
| ModelResult 封裝 | 除了 DELETE 成功回 204，成功與 404 都回 `{ success, message, data }` |
| 繁中訊息 | 驗證錯誤、404 訊息是繁體中文；例外細節不外露 |
| migration | 綱要只透過新的 migration 變更；沒改既有 migration；沒有手下 SQL 改表 |
| Controller 薄 | Controller 裡沒有資料庫查詢、沒有商業判斷（在 `Controllers/` 搜尋 `AppDbContext` 應為 0 命中） |

### 5. 圖（`DIAGRAMS-裝備物資API.html`）★PM 看這段就好

**圖優先：用看圖取代看程式碼細節。PM 看圖就好，不用看程式。**

至少四張 mermaid 圖：

| # | 圖 | 要看得出什麼 |
|---|---|---|
| ① | 分層架構圖 | 請求怎麼走（Controller → Service → EF Core → PostgreSQL）；哪些檔**新增**、哪些**只加不改**、哪些**共用不動**（用顏色分開） |
| ② | 資料表 ER 圖 | `equipment_item` 的欄位、主鍵、唯一索引、SEQUENCE；字典是常數還是資料表 |
| ③ | POST 新增的循序圖 | 驗證失敗回 400 的分支；通過後**在同一個交易內**取 id、算 code、寫入、提交；回 201＋Location |
| ④ | 刪除流程或狀態碼矩陣 | 五條路由各會回哪些狀態碼（200／201／204／400／404／500），哪些包 ModelResult |

**格式要求：**

1. 字級 22px 以上：mermaid init 寫 `%%{init: {'theme':'neutral','themeVariables':{'fontSize':'22px'}}}%%`。ER 圖另外加 `'er':{'fontSize':26}`（ER 的欄位字會再縮小一點）。
2. 每張圖上方一句說明：這張圖在講什麼。
3. 用瀏覽器打開就看得到圖，沒有紅字的 syntax error。
4. 圖照原尺寸畫，不要縮小到畫面寬（字才是真的 22px）。最小骨架如下，照抄再填圖：

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<title>UML 圖面 — 中心裝備物資 API</title>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<style>
  body { font-family: "Noto Sans TC", "Microsoft JhengHei", sans-serif; font-size: 20px; margin: 0 4vw; }
  .mermaid { overflow-x: auto; }
  .mermaid svg { max-width: none !important; height: auto; }
</style>
</head>
<body>
<section>
  <h2>① 分層架構圖</h2>
  <p>（一句話：這張圖在講什麼）</p>
  <pre class="mermaid">
%%{init: {'theme':'neutral','themeVariables':{'fontSize':'22px'}}}%%
flowchart TB
  A["Controller"] --> B["Service"]
  </pre>
</section>
<!-- ② ③ ④ 照同樣格式往下加 -->
<script>
  mermaid.initialize({ startOnLoad: true, theme: 'neutral',
    flowchart: { useMaxWidth: false }, sequence: { useMaxWidth: false }, er: { useMaxWidth: false } });
</script>
</body>
</html>
```

5. 圖的內容要跟第 1～4 段一致：架構圖的「共用不動」，跟第 1 段那張表一樣。

**核什麼**：用瀏覽器打開，四張圖都出得來嗎？不看程式，你看得懂「檔案怎麼分、資料表長什麼樣、新增怎麼跑、會回哪些狀態碼」嗎？
看不懂就是圖畫得不好，退回去請 AI 重畫。想看畫好的樣子，參考解在工作坊的 `step3_new_module/docs/DIAGRAMS-裝備物資API.html`（先自己做，卡住再開）。

---

## 任務清單（`docs/TASKS.md`）

1. 照分層排順序：Entity → migration → DTO → Mapper → Service → Controller → seed → 測試。
2. 每個任務小到能單獨驗收，寫明「怎麼驗」（build、哪幾條測試、Swagger 打哪條路由）。
3. 最後兩個任務固定是：**文件對齊**（SRS-delta、設計文件-delta 和圖跟著程式更新）、**自測**（build 零警告、`dotnet test` 全綠、Swagger 五路由、psql 查到 24 列）。
4. 寫明預期測試總數（既有 49 條＋新增 N 條）。驗收時以它為準。

---

## step4 LOOP 之後：文件跟著程式改

step4 的 LOOP 會為了讓測試變綠而改程式（例如改狀態碼、補驗證、改錯誤訊息）。
**程式改了，SRS-delta、設計文件-delta、圖要同步更新**，否則三個月後的人照文件找，會找錯地方。

1. 改動的地方標「**step4 LOOP 後**」，例如：`（step4 LOOP 後）PUT 查無改回 404，原本誤回 400`。
2. 三個檔都要看：`docs/SRS-裝備物資API-delta.md`、`docs/DESIGN-裝備物資API-delta.md`、`docs/DIAGRAMS-裝備物資API.html`。
3. 這件事 AI 會照 `step4_loop_e2e/LOOP-規矩.md` 自己做；你驗收時只要確認有標記。

---

## 一句話收尾

**SRS-delta 回答「這一版答應了什麼」，設計文件-delta 回答「怎麼做、動了哪些檔」，圖讓人不用讀程式就看懂。**
三份加起來，就是三個月後有人問「當初為什麼這樣做」時，你唯一拿得出來的東西。
