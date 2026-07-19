# /ui-loop

畫面雛形 loop：不含後端，產可 review 的 UI 草稿（靜態切版、流程展示、design review）。

Input: `$ARGUMENTS`

## Loop

1. 讀 `harness/SPEC.md`（只需 Feature 與 CRUD UI Spec 節）、`harness/TASKS.md`（未展開就依 SPEC 展開 UI 項）、`harness/LESSONS.md`、`harness/CODE-RULES-ui.md`。
2. 讀 `modules/crud-ui/CRUD-UI.md` 與 `design-system-summary.md`。**本 loop 不讀**：`CODE-RULES-api.md`、`templates/aspnet-integration-test.cs`、`templates/efcore-db-notes.md`、HARNESS.md（本檔步驟已符合其規則）。
3. 缺漏：欄位或元件 mapping 不明 → 用選擇題問人；其餘記 Assumption。
4. 產出：UI Spec → 確認後產 Page Draft——綁 `templates/mock-data.json`（標示為測試資料），API 串接點標 `// TODO: DEV 串接`，不寫業務邏輯。
5. Token Check（`design-token-rules.md`）→ 修正 → 複驗。
6. 驗證：L0（typecheck）即可；美學與版面標「待人工目視」，不推估。
7. 任務完成且驗證通過（Token Check／人工確認）才在 TASKS 勾 `[x]`；commit 由使用者主導，未 commit 前在 LOOP.md 註記待補。
8. 更新 `harness/LOOP.md`；逐項對照 `harness/LESSONS.md` 事件表（E1–E5），中的事件回填。雛形確認要轉正式功能時，提示改走 `/crud-loop`。

## Output

```text
Status: PASS | NEEDS_INPUT | FAIL
Mode: UI
Progress: <x/y tasks>
Changed:
- <file>
TokenCheck: PASS | <違規數與剩餘手動項>
Assumptions: <max 3>
Blockers: <only if any>
Next: <one action，含「待人工目視」項>
```
