# /crud-loop

對一個後端＋前端 CRUD 任務執行 compact SDD loop，含前端 UI 產出（技術棧慣例以 `harness/CODE-RULES-api.md` / `CODE-RULES-ui.md` 為準）。

Input: `$ARGUMENTS`

## Loop

1. 讀 `harness/SPEC.md`、`harness/TASKS.md`、`harness/LESSONS.md`；後端遵守 `harness/CODE-RULES-api.md`、前端遵守 `harness/CODE-RULES-ui.md`。
2. 讀 `modules/crud-ui/CRUD-UI.md`。**勿重讀 HARNESS.md**（本檔步驟已符合其規則）。
3. `$ARGUMENTS` 有新需求細節就併入 SPEC，並補上 FR / BR 編號；TASKS 尚未展開就依 SPEC 展開（含 CRUD 追加項，每條標 FR 與驗證方式）。
4. 使用 CRUD Mode。
5. 缺漏資訊分類：
   - Blocker：商業行為、儲存 / 刪除規則、API contract 衝突、Design System component mapping 缺失——用選擇題問人（2–4 選項、標明建議項），答案回寫 SPEC。
   - Assumption：可事後 review 的安全預設；業務不明標 `[SA 確認]`。
6. 需要新建的元件超過 3 個時，先列清單並以選擇題確認（全建 / 部分 / 改用既有元件）再動工。
7. 取 TASKS 的下一項，只產生該項產出，並引用 SPEC 編號。該項涉及架構變更或安全路徑（授權、金流、個資）時，先提醒使用者 `/model` 升 Opus（不阻塞，不切也照常繼續）：
   - CRUD Spec
   - API contract
   - DB / Entity / DTO notes
   - Mock data（標示為測試資料）
   - TDD cases（對應 FR；先照 SPEC 自列「該驗什麼」清單，列完才准讀既有測試檔對照補缺——防錨定）
   - UI Spec（**經確認後**才產前端程式）
   - Design System mapping
   - 前端 CRUD 頁面草稿
   - Validation / API binding notes
8. 前端產出後依 `modules/crud-ui/design-token-rules.md` 檢查；違規 → 修正 → 複驗。
9. 跑或建議最小驗證指令：先 L0 再 L1；API 實作完成後跑 L2 curl smoke；L3 瀏覽器驗證只在使用者要求時執行（見 `modules/verify/VERIFY.md`）。
10. 驗證失敗就修，最多 2 輪 fix；進第 2 輪前先提醒使用者 `/model` 升 Opus（升級後本功能完成前不降回）。第 2 輪才修好的問題回填 `harness/LESSONS.md`。
11. 任務完成**且驗證通過**才在 TASKS 勾 `[x]`。commit 由使用者主導：commit 時勾選與產出放同一個；未 commit 前在 LOOP.md 註記待補。
12. 更新 `harness/LOOP.md`（只記待辦與本輪決策）；逐項對照 `harness/LESSONS.md` 事件表（E1–E5），中的事件回填。
13. TASKS 全勾後檢查完工三關：① TASKS 無 `- [ ]` 殘留 ② SPEC Done Criteria 逐條成立 ③ 提示在新對話執行 `/review-loop`。三關全過回報「候選完工」，由人最終核可。
14. 只輸出 compact status。

## Output

```text
Status: PASS | NEEDS_INPUT | FAIL
Mode: CRUD
Progress: <x/y tasks>
Changed:
- <file>
Verified:
- <command/result>（<成本標註>）
TokenCheck: PASS | <違規數與剩餘手動項>
Assumptions:
- <max 3>
Blockers:
- <only if any>
Next:
- <one action>
```
