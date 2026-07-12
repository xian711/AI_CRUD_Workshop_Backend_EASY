# /api-loop

對一個 ASP.NET Core API 任務執行 compact SDD loop。

Input: `$ARGUMENTS`

## Loop

1. 讀 `harness/SPEC.md`、`harness/TASKS.md`、`harness/LESSONS.md`、`harness/CODE-RULES-api.md`。**本 loop 不讀**：`modules/crud-ui/`、`CODE-RULES-ui.md`、HARNESS.md（本檔步驟已符合其規則）。
2. `$ARGUMENTS` 有新需求細節就併入 SPEC，並補上 FR / BR 編號；TASKS 尚未展開就依 SPEC 展開（每條標 FR 與驗證方式）。
3. 使用 API Mode。
4. 缺漏資訊分類：
   - Blocker：必須問人——用選擇題（2–4 選項、標明建議項），答案回寫 SPEC。
   - Assumption：可繼續，記入 SPEC；業務不明標 `[SA 確認]`，技術未定標 `[SD 待定]`。
5. 取 TASKS 的下一項，只產生該項產出，並引用 SPEC 編號：
   - API contract
   - Mock data（標示為測試資料）
   - TDD cases（對應 FR）
   - ASP.NET 測試碼
   - API 實作草稿
6. OpenAPI：專案已有 Swagger 設定就沿用；沒有則啟用（dev 環境限定；.NET 9+ 用內建 `AddOpenApi()`，舊版用 Swashbuckle）。
7. 輸出前自我檢查：
   - SPEC 對應：每段程式對應哪條 FR / BR？
   - 完整性：有沒有跳過欄位或邏輯？
   - 安全性：SQL Injection、明文密碼、日誌含個資？
   - 可測試性：有 DI、外部依賴可 mock？
8. 驗證由便宜到貴：L0（build）→ L1（test）→ 實作完成後 L2 smoke：
   - 背景啟動 API，埠號從輸出抓。
   - 用 `curl.exe` 打 TC 對應案例（happy ＋ 1–2 個錯誤案例），貼真實回應。
   - 同步更新 `.http` 測試檔（樣式見 `templates/api-tests-sample.http`）。
   - 測完停 server。跑不起來就誠實標 blocker，不捏造輸出。
9. 驗證失敗就修，最多 2 輪 fix；第 2 輪才修好的問題回填 `harness/LESSONS.md`。
10. 任務完成**且驗證通過**才在 TASKS 勾 `[x]`。commit 由使用者主導：commit 時勾選與產出放同一個；未 commit 前在 LOOP.md 註記待補。
11. 更新 `harness/LOOP.md`（只記待辦與本輪決策）。
12. TASKS 全勾後檢查完工三關：① TASKS 無 `- [ ]` 殘留 ② SPEC Done Criteria 逐條成立 ③ 提示在新對話執行 `/review-loop`。三關全過回報「候選完工」，由人最終核可。
13. 只輸出 compact status。

## Output

```text
Status: PASS | NEEDS_INPUT | FAIL
Mode: API
Progress: <x/y tasks>
Changed:
- <file>
Verified:
- <command/result>（<成本標註>）
Smoke:
- <實測過的 curl 指令與結果摘要>
Assumptions:
- <max 3>
Blockers:
- <only if any>
Next:
- <one action>
```
