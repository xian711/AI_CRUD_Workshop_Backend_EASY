# VERIFY 模組（分級驗證）

L0–L3 分級定義見 `HARNESS.md`；本檔只列各級執行規則。

原則：

- 永遠先跑最便宜的驗證；前一級不過就不跑下一級。
- 回報每條驗證指令時標註成本：`零成本`、`會呼叫外部 API N 次`、`約 X 分鐘`。
- 涉及 IndexedDB、canvas、檔案下載等瀏覽器能力的功能，L1 / L2 測不到，必須用 L3 驗收，不能只靠 typecheck。

## L2 API smoke 規則

- 以專案啟動指令背景啟動（指令與埠號來源見 `harness/CODE-RULES-api.md`）；**埠號從啟動輸出或設定檔抓，不寫死**。
- 只打 TC 對應案例：happy path ＋ 1–2 個錯誤案例（400 / 403），不全打。
- **貼真實回應，不得捏造**；跑不起來（缺 DB、缺連線字串）就誠實標 blocker 或 `[待實機]`（鐵律 2）。
- PowerShell 的 `curl` 是 `Invoke-WebRequest` 別名，參數不相容：**一律明寫 `curl.exe`**。
- token / 密碼用 `{{占位符}}`，不進交付檔與版控。
- 同步維護 `.http` 測試檔（樣式見 `templates/api-tests-sample.http`，工程師可在 IDE 直接執行）。
- 測完停掉 server、清殘留 process。
- 通過後把**實測過的 curl 指令**附進 summary（複製即用）。

## L3 瀏覽器驗證規則（實戰累積）

- dev server 埠號從啟動輸出抓取，不寫死（埠常被占用而自動遞增）。
- 外部付費 API（AI 服務等）一律攔截 mock，不燒真實額度；mock 回應照真實格式構造。
- 計數類 API 是「即時快照、不自動等待」：計數前先等待目標條件成立，否則畫面沒渲染完就回 0。
- 測「失敗路徑」時，斷言「無 console error」要排除刻意觸發的錯誤（如 mock 回 500）。
- 測試資料用有意義的資料（真實格式的姓名、電話、地名），不用 test123。
- CRUD 驗證順序：`R → C → R → U → R → D → R`，每次寫入後都重查確認。
- Windows 上跑 Python 腳本且輸出含中文時，先設 `PYTHONIOENCODING=utf-8`。
- 驗證腳本放 scratchpad，不進專案目錄。
- 收尾：停掉 dev server、清殘留 process。
- 全部案例通過才算驗收通過；回報 PASS / FAIL 統計。

## 驗收報告格式

```text
Verify Level: L0 | L1 | L2 | L3
Commands:
- <指令>（<成本標註>）
Result: PASS x/y | FAIL 清單
Smoke: <實測過的 curl 指令，L2 時附>
Issues: <對應 TC / FR 編號>
Next: <one action>
```
