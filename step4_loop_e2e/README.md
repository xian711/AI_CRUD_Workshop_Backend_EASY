# Step 4｜LOOP 工程 × 全鏈路 E2E（真的接上後端了）

這一步做兩件事：**建一套會自己拉起整條鏈路、跑到綠的全鏈路 E2E**，並用它示範什麼叫 **LOOP 工程**——
讓 AI 自己跑「改 → 驗證 → 再改」直到綠，人只看結果。

> **和前端 mock 課最大的差別＝「持久化」。**
> 前端課的 E2E 每次 reload 資料就重置回 24 筆（記憶體 mock）；這一課的 E2E **新增／編輯／刪除都真的寫進 PostgreSQL**——
> reload 之後改動「仍在」，才證明你真的把前端接上了後端。這門課的 E2E 就是圍著這件事設計的。

---

## 一、LOOP 工程是什麼

一句話：**先給 AI 一個「可自動執行、會給出綠/紅」的驗證，再叫它自己修到綠。**

| 沒有 LOOP（人在迴圈裡） | 有 LOOP（AI 在迴圈裡） |
|--------------------------|--------------------------|
| AI 改一版 → 人手動開瀏覽器點一點 → 回報哪裡壞 → AI 再改 | AI 改一版 → 自己跑 `run-e2e.ps1` → 看到紅 → 自己修 → 再跑 → 綠了才停 |
| 人是瓶頸，改 5 次就累了 | 人只看最後結果，AI 跑幾輪都不喊累 |

**關鍵前提：要先有「可自動執行的驗證」。** 全鏈路 E2E 就是這裡的驗證——它真的開瀏覽器、真的點按鈕、
真的打到後端、真的落庫，再 reload 驗資料還在，紅綠不騙人。

> **學習目標升級**：這一步的重點**不是「跑一次看到 6 條全綠」**——那只證明現在沒壞。
> LOOP 的精髓是**經歷一整圈「紅 → 判因 → 修 → 綠」**。所以本步驟附了一個可還原的刻意失敗練習
> （見下方**第七節**，練習包在 [`lab-red-to-green/`](./lab-red-to-green/)），請務必親手跑過那一圈。

---

## 二、全鏈路 E2E 在驗什麼：持久化 vs mock

這是本課的靈魂。同一套前端頁面，資料層切一個開關（`NUXT_PUBLIC_USE_API`）就從 mock 換成真後端：

| | 前端 mock（上一課） | 全鏈路 API 模式（這一課） |
|---|---|---|
| 資料放哪 | 瀏覽器記憶體 | PostgreSQL 資料表 `equipment_item` |
| reload 後 | 改動消失、重置回 24 筆種子 | **改動仍在**（真的落庫） |
| 編碼 `PW-GEN-003` 誰算 | 前端算 | **後端**在交易內算（前端只做預覽） |
| 測試怎麼證明 | 看畫面就夠 | 看畫面 **＋** 直接打 API 拿 JSON 對證 |

> **想知道「切開關」在程式裡是怎麼做到的？** 看 [`fullchain-app/FULLCHAIN_NOTES.md`](fullchain-app/FULLCHAIN_NOTES.md)。
> 它記錄了這包跟前端課成品的完整差異：`nuxt.config.ts` 加一條 devProxy、`useEquipmentItems.ts` 加一個 API 分支——
> **呼叫端（`pages/equipment/crud/*.vue`）一行都沒改**。這就是「前端留接縫」的實作證據。

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

## 三、`run-e2e.ps1` 怎麼用：一支腳本自管整條鏈路

前端 mock 課要你另開視窗手動 `pnpm dev`；這一課鏈路較長（資料庫＋後端＋前端），所以 `run-e2e.ps1`
**自己**把整條拉起來、跑完、再拆乾淨：

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
5. **跑測試**：Playwright 6 條，解析摘要，**恰好 6 條、無 failed/skipped/flaky** 才綠，否則 exit 1。
6. **teardown**（無論成敗）：只停「自己啟的」後端與前端（記 PID、`taskkill /T` 殺整棵樹釋放埠）；e2e 庫留著下輪重建。

> **收尾保證**：dev 庫 `ai_crud_equipment` 全程不碰（e2e 只用 `_e2e` 庫）；埠 5080/3199 跑完釋放；
> 上一輪若崩了留下殘留進程，這一輪開頭會先依 `.run-pids` 記錄清掉，再重來（自我修復）。

Exit code：`0`＝恰好 6 條全綠；`1`＝任一 FAIL／服務拉不起來／找不到測試／非預期錯誤。

### 怎麼下 LOOP prompt

```
跑 step4_loop_e2e/run-e2e.ps1。
若有紅字，找出原因、修正後再跑一次，直到 6 條全綠。
規則：同一個問題連續修兩次還沒好就停下來回報（不要無限撞牆）。
先分清楚紅的根因是「前端、後端、還是資料庫」，別急著改。
若判斷是 App（前端或後端）真的有 bug，記下來回報，不要為了過測試放寬斷言。
```

兩條重點：**停損規則**（修兩次沒好就停，方向錯了該讓人看）＋**先判因再修**（全鏈路的紅可能來自三層，
亂改一層會愈修愈亂）。

---

## 四、E2E 功能驗證＋失敗截圖診斷：截圖不只給人看，也給 AI 看

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
AI 也看得懂截圖，把它貼回對話能直接判斷 selector 怎麼改，比純文字錯誤訊息快。

> 服務起不來時，後端／前端的 log 在 `.run-logs\`（`backend.err.log`、`frontend.err.log`），是診斷第一站。

---

## 五、對抗審查：別讓寫程式的 AI 自己審自己

**寫這套測試的 AI，不適合當它自己的審查者。** 正確做法：**換第二個 AI，用「盡力推翻它」的立場審。**

```
你的任務是「盡力推翻」這套全鏈路 E2E，不是誇獎它。用懷疑的眼光找：
1. 有沒有「假綠」——看似過了其實沒驗到持久化（例如只看畫面沒 reload、reload 後沒重新斷言）？
2. 它真的證明資料進了資料庫嗎，還是可能只驗到前端記憶體快取？（E6 打 API 這條夠不夠硬？）
3. 測試之間會不會因為共用同一個 e2e 庫而互相污染（筆數寫死、順序相依）？
4. selector 是不是猜的？有沒有為了過測試放寬斷言？
逐條給出「可被推翻的具體理由」，能重現就附步驟。找不到問題也要說明你怎麼確認的。
```

（派工本機 Codex 的標準指令見團隊筆記；挑出的問題交回原 AI 修 → 再跑 → 再審＝對抗式 LOOP。）

---

## 六、老師救援：85 分鐘還跑不起來就套 checkpoint

課堂進行到約 85 分鐘、學員的 API 還起不來時，不要讓人卡死在編譯錯誤上。用講師腳本把裝備物資模組
參考解一次套用到學員專案，回到同一個可跑基準點：

```
powershell -ExecutionPolicy Bypass -File ..\instructor\apply-solution-checkpoint.ps1 -Target D:\path\to\my-equipment-api
```

它會把 Equipment 模組的新增檔＋改動檔（含 migration）複製覆蓋到學員專案，覆蓋前先備份到
`<Target>\.checkpoint-backup\`。套完 `dotnet run` 起得來、`GET /api/equipment/items` 回 24 筆即可續走。

---

## 七、動手練習：紅 → 判因 → 修 → 綠（LOOP 的完整一圈）

看到綠只是起點。真正要學會的是**當測試變紅時，你怎麼判斷是哪一層壞、怎麼修**。
這裡準備了一個**可一鍵注入、可一鍵還原**的刻意失敗練習（改壞**後端**一條驗證規則），讓你親手經歷一整圈。

➡️ 練習包在 [`lab-red-to-green/`](./lab-red-to-green/)，完整步驟看它的 [`README.md`](./lab-red-to-green/README.md)。

一句話流程：**基準綠 → 注入 bug（拿掉後端數量下限驗證）→ 跑 `dotnet test` 看到 EV4 紅 →
判因（後端 bug？測試 bug？資料庫 bug？）→ 修 → 回到綠**，過程留下四項證據。

---

## 八、目錄一覽

```
step4_loop_e2e/
├── README.md              ← 本檔
├── run-e2e.ps1            ← 全鏈路一鍵跑（自管 DB＋後端＋前端生命週期）
├── fullchain-app/         ← 前端成品：equipment 雙模式 Nuxt app（唯讀使用，別改）
├── e2e/                   ← 獨立 Playwright 專案（6 條全鏈路測試）
│   ├── tests/fullchain.spec.ts
│   └── screenshots/       ← 關鍵畫面截圖（手冊素材）
└── lab-red-to-green/      ← 紅→綠練習（注入後端 bug → 判因 → 修 → 綠）
```
