# Step 4｜LOOP 工程 × 全鏈路 E2E（真的接上後端了）

**這一步你只做兩件事：貼一個 LOOP prompt、驗收 AI 交回的報告。**
AI 會自己跑全鏈路 E2E、紅了自己判因再修、全綠後自己開子代理挑錯，最後交回紀錄、報告和測試報告。

> **和前端 mock 課最大的差別＝「持久化」。**
> 前端課的 E2E 每次 reload 資料就重置回 24 筆（記憶體 mock）；這一課的 E2E **新增／編輯／刪除都真的寫進 PostgreSQL**——
> reload 之後改動「仍在」，才證明你真的把前端接上了後端。這門課的 E2E 就是圍著這件事設計的。

---

## 一、LOOP 工程是什麼

一句話：**先給 AI 一個「可自動執行、會給出綠/紅」的驗證，再叫它自己修到綠。**

> **比喻：一問一答，就像主管手把手帶新人。** 每一步都要交代、要盯，主管的時間全耗在教。
> LOOP 的做法是先把規矩（harness）和示範樣本（範本）放好，再給一個會亮紅綠燈的驗收標準（E2E）。
> **你下一個指令，AI 就照公司規定自己做、自己驗，還會叫出另一個分身（子代理）挑錯；你只看最後的報告。**
> LOOP 會留兩種紀錄：紀錄 MD（`LOOP-LOG.md`）是給機器看的流水帳；報告 HTML（`LOOP-REPORT.html`）才是給人看的，圖文並茂。
> 子代理審查分兩段：先用 HTTP 實打 API（狀態碼、回應形狀），再用 Playwright 真的開瀏覽器逐頁截圖。

| 沒有 LOOP（人在迴圈裡） | 有 LOOP（AI 在迴圈裡） |
|--------------------------|--------------------------|
| AI 改一版 → 人手動開瀏覽器點一點 → 回報哪裡壞 → AI 再改 | AI 改一版 → 自己跑 `run-e2e.ps1` → 看到紅 → 自己修 → 再跑 → 綠了才停 |
| 人是瓶頸，改 5 次就累了 | 人只看最後結果，AI 跑幾輪都不喊累 |

**關鍵前提：要先有「可自動執行的驗證」。** 全鏈路 E2E 就是這裡的驗證——它真的開瀏覽器、真的點按鈕、
真的打到後端、真的落庫，再 reload 驗資料還在，紅綠不騙人。

### 一圈 LOOP 怎麼轉

```
 你：貼 LOOP prompt（只貼這一次）
          │
          ▼
 ┌── AI 跑 run-e2e ──► 6 條全綠？ ──是──► 子代理對抗審查（HTTP 實打 → Playwright 截圖）
 │        ▲                 │                   │
 │        │                否（有紅）        App 的問題 → 回去修、再跑
 │        │                 ▼               測試的問題 → 寫進報告，交你裁決
 │        │       AI 判因（API？資料庫？環境？測試本身？）    ▼
 │        │                 │              AI 交件 ──► 你驗收
 │        │                 ▼              ＋ LOOP-LOG.md、LOOP-REPORT.html、測試報告、文件同步
 │        └──── AI 修 API → build／test → 再跑
 │                          │
 └──────────────────────────┘
             │
             │ 同一問題連修 2 次仍紅
             ▼
      停損：AI 停下來回報，換人判斷
```

---

## 二、貼 LOOP prompt（正式流程）

在**工作坊根目錄**開 AI Agent，整段複製貼上。**子代理**＝AI 自己叫出來的分身，專門做一件事；這裡專門挑錯。
受測服務不用你先開：AI 自己啟動，埠被占就換，用了哪個埠會寫在報告裡。
鐵律、埠、對抗審查、要交哪些檔，都寫在 [`LOOP-規矩.md`](LOOP-規矩.md)，AI 會自己讀，prompt 只要一句「照它做」。

```
你是 LOOP 工程師，照 step4_loop_e2e/LOOP-規矩.md 做，自己跑完，中途不要問我。
受測：step3_new_module/my-equipment-api（API）＋ step4_loop_e2e/fullchain-app（前端）。先在背景把兩個都啟動（埠被占就自己換，前端的 API 位址要跟著改），跑 step4_loop_e2e 的 run-e2e，修到 6 條全綠。
全綠後開一個子代理做對抗審查：先用 HTTP 實打 API 的 201／400／404，再用 Playwright 開瀏覽器逐頁截圖，對照 PRD 和契約挑問題，也挑測試的假綠。
最後照規矩交 LOOP-LOG.md、LOOP-REPORT.html、測試報告，並更新 SRS-delta、設計文件-delta 和圖。
```

**模型：** 開發用 **Sonnet 5.5** 就好；對抗審查的子代理用 **Opus 5.5**，審查的模型要比開發的高一級（規矩檔已寫明，AI 會照做）。**token 夠的話，審的要比寫的強。**

### 你應該看到

AI 交回的東西大多在 `step3_new_module/my-equipment-api/loop/`。不用打任何指令，照這張表用眼睛核：

| 檢查點 | 怎麼核 |
|---|---|
| 結果報告 `LOOP-REPORT.html` | 用瀏覽器開：結論在最前面、有 HTTP 實打結果和截圖 |
| 測試報告 `playwright-report/index.html` | 在 `step4_loop_e2e/e2e/` 底下，用瀏覽器開：6 條綠；報告裡也要有 `dotnet test` 的總數與通過數 |
| 每輪紀錄完整 | 打開 `LOOP-LOG.md`：紅了哪幾條、根因、修了哪個檔，一輪一段 |
| 根因說得通 | 「API 不符契約」就該修 API；說「測試有問題」的要有你的裁決紀錄 |
| 對抗審查有做 | 報告寫了子代理挑到什麼：App 的問題修了沒、測試的問題有沒有列給你裁決 |
| 文件同步 | `docs/` 的 SRS-delta、設計文件-delta、圖有標「step4 LOOP 後」：程式改了哪裡，文件就跟著改哪裡 |
| 畫面真的能用 | 打開報告寫的網址自己點一遍：新增一筆 → F5 → 那筆還在 |
| 最終真的綠 | 報告附「E2E 全綠：6 條 passed」、exit 0 的總結行，而且被測 API 路徑是你自己的 `my-equipment-api` |

---

## 三、全鏈路 E2E 在驗什麼：持久化 vs mock

這是本課的靈魂。同一套前端頁面，資料層切一個開關（`NUXT_PUBLIC_USE_API`）就從 mock 換成真後端：

| | 前端 mock（上一課） | 全鏈路 API 模式（這一課） |
|---|---|---|
| 資料放哪 | 瀏覽器記憶體 | PostgreSQL 資料表 `equipment_item` |
| reload 後 | 改動消失、重置回 24 筆種子 | **改動仍在**（真的落庫） |
| 編碼 `PW-GEN-003` 誰算 | 前端算 | **後端**在交易內算（前端只做預覽） |
| 測試怎麼證明 | 看畫面就夠 | 看畫面 **＋** 直接打 API 拿 JSON 對證 |

> **想知道「切開關」在程式裡是怎麼做到的？** 看 [`fullchain-app/FULLCHAIN_NOTES.md`](fullchain-app/FULLCHAIN_NOTES.md)。
> 它記錄了這包跟前端課成品的完整差異：`nuxt.config.ts` 加一條 devProxy、`useEquipmentItems.ts` 加一個 API 分支——
> 最初接 API 時，**呼叫端（`pages/equipment/crud/*.vue`）一行都沒改**，這就是「前端留接縫」的實作證據。
> 2026-10-12 另補上表單檢查和儲存錯誤處理（字數上限、數量只收整數、接住後端 400 顯示紅字），來由見手冊 Step 4 ⑧。

所以這 6 條測試裡，好幾條都故意「**做一個動作 → reload → 再斷言**」——reload 是試金石：
mock 會掉回種子，持久化才會留下。最後 E6 更直接用 Playwright 的 `request` 打 `/api/equipment/items`，
在後端 JSON 裡找到前端剛新增的那一筆，這是「資料真的進了資料庫」的鐵證。

### 六條測試清單

| 編號 | 驗什麼 | 對應觀念 |
|------|--------|----------|
| E1 | API 模式進 `/equipment/crud`，表格與「共 24 筆」（資料來自 PostgreSQL） | **Read**（資料源是 DB 不是 mock） |
| E2 | 新增一台發電機 → 筆數 +1 → **reload 後那一筆仍在**，用編碼搜得到 | **Create ＋ 持久化** |
| E3 | 新增後讀畫面上的 code，斷言格式為「類別2碼-項目3碼-流水3碼」且前綴正確 | **後端產碼**（前端只預覽） |
| E4 | 編輯第一列數量＋狀態 → **reload 後新值仍生效** | **Update ＋ 持久化** |
| E5 | 刪除第一列 → **reload 後用編碼搜尋查無**（硬刪除，真的從 DB 移除） | **Delete ＋ 持久化** |
| E6 | 前端新增一筆 → 直接 `request.get('/api/equipment/items')` → JSON 裡找得到 | **API 層鐵證** |

> **測試之間「不」重置資料庫**——那是 mock 思維。資料庫由 `run-e2e.ps1` 於「每一輪」重建成乾淨 24 筆；
> 測試在同一個庫上依序累加。所以 E1 斷言「恰好 24」（首條、DB 剛建好），其餘一律**動態讀當前筆數再比對增減**，
> 不寫死絕對值——這樣多條累加也不互相污染。這正是「真後端要用獨立測試庫＋每輪重建」的實作範例。

---

## 四、`run-e2e.ps1` 在做什麼（AI 會替你跑）

前端 mock 課要你另開視窗手動 `pnpm dev`；這一課鏈路較長（資料庫＋後端＋前端），所以 `run-e2e.ps1`
**自己**把一套 E2E 專用服務拉起來、跑完、再拆乾淨。LOOP prompt 會叫 AI 跑它；你想自己先跑一次看看也可以：

```
cd step4_loop_e2e
powershell -ExecutionPolicy Bypass -File .\run-e2e.ps1
```

> **被測 API 綁誰？預設綁「你自己的作品」。** `run-e2e.ps1` 預設把被測後端指向學生工作區
> `..\step3_new_module\my-equipment-api`——這門課的綠燈要證明**你自己生成的 API** 過關，不是官方解偷跑。
> 若 `my-equipment-api` 還不存在（沒做 Step 3），腳本會**明確報錯**並提示兩條路：
>
> ```
> # 指定任一被測 API 專案：
> powershell -ExecutionPolicy Bypass -File .\run-e2e.ps1 -ApiDir D:\path\to\my-equipment-api
> # 老師救援：走官方參考解 fallback（只證驗收與 LOOP，不證學生生成完整度）：
> powershell -ExecutionPolicy Bypass -File .\run-e2e.ps1 -UseCheckpoint
> ```
>
> 腳本開頭與報告最後都會印出**被測 API 的 resolved 絕對路徑**與**被測 DB 名稱**，一眼看出這盞綠燈屬於誰。
> 想確認評量真的在驗你的作品，可做**負向驗證**：故意弄壞 `my-equipment-api`（例如改壞一個狀態碼），
> 再跑一次 → E2E **必須變紅**；紅得起來，綠才有意義。

它依序做（每一步失敗就 fail-closed、teardown、exit 1）：

1. **重建 e2e 資料庫**：用 `psql` 冪等 DROP＋CREATE `ai_crud_equipment_e2e`（庫名尾碼 `_e2e` 才准 DROP，防呆）。
2. **啟後端**（背景，:5080）：連線字串用環境變數指向 `_e2e` 庫；輪詢 `GET /api/equipment/items` 到 200 且 24 筆（migrate＋seed 完成）。
3. **啟前端** fullchain-app（背景，:3199，`NUXT_PUBLIC_USE_API=true`）：輪詢 `/equipment/crud` 到 200 且含 App marker。
4. **備 e2e 相依**：`node_modules`＋playwright 就緒才跳過 `npm install`；`npx playwright install chromium` 冪等。
5. **跑測試**：Playwright 6 條，解析摘要，**恰好 6 條、無 failed/skipped/flaky** 才綠，否則 exit 1。測試報告寫到 `e2e/playwright-report/index.html`。
6. **teardown**（無論成敗）：只停「自己啟的」後端與前端（記 PID、`taskkill /T` 殺整棵樹釋放埠）；e2e 庫留著下輪重建。

> **收尾保證**：dev 庫 `ai_crud_equipment` 全程不碰（e2e 只用 `_e2e` 庫）；自己啟動的服務跑完就關、釋放埠；
> 上一輪若崩了留下殘留進程，這一輪開頭會先依 `.run-pids` 記錄清掉，再重來（自我修復）。

**沿用已啟動的服務（`-ReuseRunning`，LOOP 用）**

```
powershell -ExecutionPolicy Bypass -File .\run-e2e.ps1 -ReuseRunning
```

也可以先設 `$env:E2E_REUSE = '1'`，效果一樣。加了它：

1. API 和前端分開看。`API_URL`（預設 `http://localhost:5080`）、`BASE_URL`（預設 `http://localhost:3199`）已經有回應的，就直接用：不重建資料庫、不啟動、跑完也不關。沒回應的，照上面的流程自己啟動，跑完自己關。
2. 沿用之前先擋三件事，擋到就 FAIL、不跑測試：
   - 沿用的 API 要在被測 API 資料夾裡（綠燈要屬於你自己的作品）。
   - 沿用的 API 要剛好 24 筆（E1 斷言「恰好 24 筆」）。
   - 前端要是 API 模式，而且轉發到的 API 也是剛好 24 筆。
3. 沿用的 API 連哪個庫，E2E 的新增、刪除就寫進哪個庫。所以 LOOP 裡 AI 會先停掉受測 API（改了程式本來就要重新 build），讓 run-e2e 自己起一個連 `_e2e` 庫的乾淨 API；前端從頭開到尾。

> **埠**：run-e2e 預設用 5080／3199，AI 在背景開給你點的「受測服務」也是。所以 AI 跑 run-e2e 一律加 `-ReuseRunning`：
> 前端沿用、不另開第二個；受測 API 先停掉，讓 run-e2e 起一個乾淨的。這樣不會撞埠，也不會兩個前端搶同一個 `.nuxt/`。
> 埠被別的程式占住，AI 會換埠，並設 `API_URL`、`BASE_URL` 告訴 run-e2e（不改腳本）。細節在 `LOOP-規矩.md` 第 1 節。

Exit code：`0`＝恰好 6 條全綠；`1`＝任一 FAIL／服務拉不起來／找不到測試／非預期錯誤。

---

## 五、E2E 功能驗證＋失敗截圖診斷：截圖不只給人看，也給 AI 看

先講清楚這 6 條「是什麼、不是什麼」，別把名稱喊得比覆蓋還大：

- **是**：**功能＋持久化驗證**——真的開瀏覽器、真的打後端、真的落庫、reload 後真的還在，紅綠不騙人。
- **不是**：**視覺回歸**（pixel 比對 baseline）。這 6 條沒有 `toHaveScreenshot` baseline，也只跑桌機。

測試流程中會對關鍵畫面主動截圖，存到 [`e2e/screenshots/`](./e2e/screenshots/)（檔名有序）：

| 檔名 | 畫面 |
|------|------|
| `01_list.png` | API 模式列表（共 24 筆，來自 PostgreSQL） |
| `02_new_form_filled.png` | 新增表單填好、待儲存 |
| `03_after_create_list.png` | 新增後回列表（+1） |
| `04_after_reload_persisted.png` | **reload 後那一筆仍在**（持久化鐵證） |
| `05_after_delete_gone.png` | 刪除並 reload 後查無 |

另外 Playwright 設 `screenshot: 'only-on-failure'`——測試**紅了**會自動在 `e2e/test-results/` 存一張當下畫面。
這是**失敗診斷**（誠實命名，不是「視覺審查」）：一眼看出是「按鈕點不到」還是「畫面根本沒載出來」；
AI 也看得懂截圖，判因時看的就是這張。跑完也可以用瀏覽器開 `e2e/playwright-report/index.html` 看完整測試報告。

> 服務起不來時，後端／前端的 log 在 `.run-logs\`（`backend.err.log`、`frontend.err.log`），是診斷第一站。

---

## 六、對抗審查：AI 自己開子代理（備案：第二個 AI）

**寫程式的 AI，不適合當它自己的審查者。** 所以 LOOP prompt 已經寫好：全綠後，AI 自己開一個子代理（Opus 5.5）挑錯：

1. **先用 HTTP 實打 API**：201／400／404 的狀態碼、`ModelResult` 回應形狀、錯誤鍵 camelCase、繁中訊息。
2. **再用 Playwright 開瀏覽器逐頁截圖**：列表、新增、重整後還在、編輯、驗證紅字、刪除確認。
3. **App 的問題**它修完再跑；**測試本身的問題**不准它改，寫進報告交給你（或講師）裁決。

**備案**：你用的 AI 工具不能開子代理，或想找別家的 AI 再審一次，就開第二個 AI（例如 Codex），貼這段：

```
請盡力挑 step4_loop_e2e/e2e 這套全鏈路 E2E，和 step3_new_module/my-equipment-api 的毛病，不要誇獎。
測試專找：假綠（只看畫面沒 reload、reload 後沒重新斷言）、只驗到前端快取沒驗到資料庫、共用 e2e 庫互相污染、猜的 selector。
API 專找：測試沒抓到、但不符合 PRD-中心裝備物資-後端.md 或 contract-conventions-summary.md 的問題（狀態碼、錯誤鍵、訊息語言、code 格式）。
每條附理由，能重現就附步驟；只回報，不改檔；找不到也說明你怎麼確認的。
```

挑出的問題交回原 AI 修 → 再跑 → 再審＝對抗式 LOOP。

---

## 七、老師救援：85 分鐘還跑不起來就套 checkpoint

課堂進行到約 85 分鐘、學員的 API 還起不來時，不要讓人卡死在編譯錯誤上。用講師腳本把裝備物資模組
參考解一次套用到學員專案，回到同一個可跑基準點：

```
powershell -ExecutionPolicy Bypass -File ..\instructor\apply-solution-checkpoint.ps1 -Target D:\path\to\my-equipment-api
```

它會把 Equipment 模組的新增檔＋改動檔（含 migration）複製覆蓋到學員專案，覆蓋前先備份到
`<Target>\.checkpoint-backup\`。套完 `dotnet run` 起得來、`GET /api/equipment/items` 回 24 筆即可續走。

---

## 八、練習（選做）：紅 → 判因 → 修 → 綠

**這一節是練習，正式流程用第二節的 LOOP prompt。** 想親手體驗 AI 在 LOOP 裡做的事，可以自己走一圈：
這裡準備了一個**可一鍵注入、可一鍵還原**的刻意失敗練習（改壞**後端**一條驗證規則）。

➡️ 練習包在 [`lab-red-to-green/`](./lab-red-to-green/)，完整步驟看它的 [`README.md`](./lab-red-to-green/README.md)。

一句話流程：**基準綠 → 注入 bug（拿掉後端數量下限驗證）→ 跑 `dotnet test` 看到 EV4 紅 →
判因（後端 bug？測試 bug？資料庫 bug？）→ 修 → 回到綠**，過程留下四項證據。

---

## 九、目錄一覽

```
step4_loop_e2e/
├── README.md              ← 本檔
├── LOOP-規矩.md            ← 給 AI 讀的規矩（埠、鐵律、對抗審查、要交的檔）
├── run-e2e.ps1            ← 全鏈路一鍵跑（自管 DB＋後端＋前端生命週期）
├── tests.sha256           ← 測試檔基準（run-e2e 開跑前比對，對不上就拒跑）
├── tools/                 ← 講師重算基準的工具
├── fullchain-app/         ← 前端成品：equipment 雙模式 Nuxt app（LOOP 時唯讀，別改；2026-10-12 補過一次表單檢查）
├── e2e/                   ← 獨立 Playwright 專案（6 條全鏈路測試）
│   ├── tests/fullchain.spec.ts
│   ├── screenshots/       ← 關鍵畫面截圖（手冊素材）
│   └── playwright-report/ ← 測試報告（每跑一次自動重寫）
└── lab-red-to-green/      ← 紅→綠練習（注入後端 bug → 判因 → 修 → 綠）
```
