# /milestone-loop

段落收尾。一個功能段落完成（通常是數個 loop 之後）時執行：文件同步 → 重構掃描 → 審查 → 收尾。

Input: `$ARGUMENTS`（段落名稱或範圍）

## Loop

1. 界定範圍：本段落的 diff（`git log` / `git diff`），不重讀全專案。
2. **文件同步（程式為準，文件跟上）**：
   - `harness/SPEC.md`：狀態、Assumption 落定、Done Criteria 勾稽。
   - `harness/TASKS.md`：勾選狀態與 git log 對帳（完成清單從 git 取，不從記憶取）。
   - README / 相關文件：只補增量，不重寫。
   - UML 圖：依 `templates/uml-mermaid-snippets.md` 更新受影響的圖；圖優先於長文字，過時的圖直接改或刪。
3. **重構掃描（只列清單，不順手大重構）**：
   - 找：重複程式碼、死碼、過長方法、與 `harness/CODE-RULES-api.md` / `CODE-RULES-ui.md`（只讀本段落涉及的那份）不符處。
   - 冗餘註解（只掃本段落 diff）：刪思考過程（「先這樣試試」）、複述程式碼的廢話（`count++ // 加一`）、註解掉的死碼、空泛 TODO；保留解釋「為什麼」的註解、API 文件註解與功能型指令（`#pragma`、`#nullable`、`eslint-disable`、`@ts-ignore` 等）。防誤刪：清理前後對功能型指令逐項計數，少了就補回；拿不準就留。
   - 小改（改名、抽方法）：直接做，做完跑 L0 / L1 複驗。
   - 大改（動架構、跨模組）：列入 `harness/LOOP.md` 待辦，並以選擇題問人（本輪做 / 排下輪 / 不做，附建議），問到答案再動。
4. **審查**：提示在新對話執行 `/review-loop`（審寫分離）。
5. **收尾**：逐項對照 `harness/LESSONS.md` 事件表（E1–E5）回填；更新 `harness/LOOP.md`（Gate 設 REVIEW）。
6. 經使用者同意後 commit（繁中 message，`feat/fix/refactor/docs:` 前綴）。
7. 提示：下一段落建議**開新對話**開始——context 歸零省 token、規則不衰減；狀態由 `harness/LOOP.md` 與 `TASKS.md` 接手（CLAUDE.md 路由表有「接續上次進度」）。

## Output

```text
Status: PASS | NEEDS_INPUT
Mode: MILESTONE
Progress: <x/y tasks，與 git log 對帳結果>
DocsSynced: <files，含更新的圖>
RefactorDone: <小改清單 + 複驗結果>
RefactorTodo: <大改待辦，已入 LOOP.md>
Lessons: <回填條目 or none>
Next: 新對話執行 /review-loop
```
