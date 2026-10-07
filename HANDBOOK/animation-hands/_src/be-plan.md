# 後端動畫拍攝計畫（2026-10-07）

講稿：tts-audition/script_be.py（29 段草稿）。場景：scenes-be.js。輸出 out-be。配音 audio-be。

## 拍攝清單
Step 0（root 視窗）：be00-preflight（終端機 11 項，框 PASS/WARN、psql 路徑行）
Step 1：cap-page COMPARE.html → be01-compare-top（3 項表）、be01-compare-side（並排）
Step 2（root 視窗）：be02-dotnet-run（終端機 dotnet run 啟動輸出，框 5080／seed）；cap-page swagger → be02-swagger（五路由）、be02-swagger-get（GET 展開 200/24 筆）；be02-dotnet-test（49 passed）；be02-psql（count 24）；be02-harness-files（檔案總管四件）；cap-page ARCHITECTURE_DB.html → be02-arch-life、be02-arch-layers、be02-arch-post
Step 3：be03-copy（複製指令終端機）；my-equipment-api 視窗：bc01-empty、bc02-prompt（Opus 5.5 High）、bc03-reading、bc04-q1..q6（六題）、bc05-extra（追加題）、bc06-docs（4 檔＋任務清單）、bc07-model-sonnet、bc08-go、bc09-progress tNNNN、bc10-done（五行總結）；預覽：be-srs-*、be-design-*；cap-page DIAGRAMS-裝備物資API.html → be-diag-layers/er/seq/status；三路驗收：be03-swagger-eq（cap-page 5080 swagger equipment）、be03-test（dotnet test 輸出）、be03-psql（count 24）；小修：bc11-fix1-ask/done、bc12-fix2-ask/done
Step 4（root 視窗）：bc20-loop-pasted（Sonnet）、bc21-ports、bc23-red、bc23-agent、bc23-agent-now（HTTP 實打）、bc23-shots（Playwright）、bc25-fixed、bc25-conclusion；產出：be-loop-log、be-loop-report-top/http/shots/decide/sync、be-pw-report、e2e screenshots 01～05（直接用 png：be-e2e-01..05）；be-srs-after、be-design-after
Step 5：卡片

## 注意
- 埠：API 5080、前端 3199、DB 5432；正式站 3100 不動。
- 個資：終端機提示字元含帳號 → 用 maskTerm；Claude Code 輸出路徑含 Windows 帳號 → prep FIX；psql 輸出沒有帳號。
- preflight 可能把 5080 判 FAIL 若 API 在跑；拍 preflight 時 5080 要空。

## 實拍紀錄（2026-10-07）
- Step 2：be02-dotnet-run（seed 24、listening 5080）、be02-swagger／-get／-404、be02-dotnet-test（49 全綠 3.6 秒）、be02-psql（count 24）、be02-harness-files。
- Step 3：be03-copy；my-equipment-api 視窗 bc01-explorer、bc01-empty（預設 Sonnet 5.5 High）、bc01-model-menu、bc01-model-opus（Opus 5.5 High）、bc02-prompt、bc03-reading、bc03-t0060。
- 釐清題共 12 題，分三批（4＋4＋4），全部選「（建議）」，與講師裁決一致：
  - 第一批 bc04-q1～q4：Q1 編碼 後端算＋唯一索引｜Q2 id 沿用範本 SEQUENCE｜Q3 字典 程式常數＋CHECK｜Q4 刪除 硬刪回 204
  - 第二批 bc05-q5～q8：Q5 分頁 前端做、後端回全量｜Q6 採購日 可空、前端轉 null｜Q7（追加）人員模組 保留並存｜Q8（追加）PUT 改 code 前綴變了才重算
  - 第三批 bc05b-q9～q12：Q9（追加）項目驗證 不驗、查不到用 OTH｜Q10（追加）選填留白 去空白後空字串存 NULL｜Q11（追加）兩條格式規則都照抄｜Q12（追加）長度上限 AI 提一組、文件審核時改
- 文件階段：Opus 5.5 High，06:46 送出 → 06:57 交四份文件（約 11 分鐘，含 12 題）。AI 補了 A1～A7 細節並問「下一步」→ 回 Other：先看文件、誰拍板改「課堂講師」。
- 圖面審核：④ 狀態碼矩陣太窄高（366×1819）＋部分字 12/16px → 請 AI 改 → 1552×417、字 ≥22px（bc06-review-ask）。
- 文件截圖：VS Code 預覽被 Claude Code 群組卡住 → 改用 md2html.py（仿 VS Code 深色預覽）＋cap-page（pg-be-*.json），圖用 cap-diag.mjs 整張截（be-diag-1..4、3a/3b、1b）。文件快照在 docs-snap/（開工前版本）。
- 開工：07:09:40 換 Sonnet 5.5 High → 07:17 完成（約 7 分鐘），14 個任務 T0～T13，測試 94 條（49＋45），bc10-summary 五行總結。
- 三路驗收（同視窗終端機）：be03-dotnet-test 94 全綠、be03-psql 24、be03-dotnet-run、be03-swagger／-get（200）／-404。
- 小修兩次：fix1 採購日空字串回英文錯誤、鍵 $.purchaseDate → 空字串當沒填、繁中訊息（105 條）；fix2 空白時 status／categoryKey 各兩條錯誤 → 只回「請選擇…」（114 條，AI 記錄偏離範本 AllowedValues）。
