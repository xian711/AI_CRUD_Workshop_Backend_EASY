# Source Summary

本 Harness 改編公開的 harness / loop engineering 模式，不複製外洩的 prompt 或原始碼；v5 另外納入內部專案的實戰規則。

## 公開來源的模式

- Agent = model + harness.
- SDD as single source of truth.
- Loop specification: trigger, goal, verification, stopping rule, memory.
- Low-token loop: produce the next smallest artifact and summarize only deltas.
- Human input only for blockers.

公開參考資料：

- Martin Fowler: Harness Engineering for coding agent users.
- Addy Osmani: Loop Engineering.
- Anthropic Claude Code docs: Skills, slash commands, hooks.
- specrun (jay123578951): SDD pipeline plugin — anti-anchoring tests, model tiering, review appeal, anti-bloat gate, event-table retro, SessionStart rule re-injection (adopted in v5.13–15; see case-studies.md case 9).
- Microsoft ASP.NET Core integration testing with WebApplicationFactory.
- EF Core SQL Server provider and Npgsql EF Core provider.

## 內部來源（v5 新增，詳見 `case-studies.md`）

| 專案 | 取用的模式 |
|---|---|
| 內部專案 A | 角色邊界與交接標記、雙向審查（遺漏＋過度設計）、通用系統規範清單、Playwright 成本控制 |
| 內部專案 B | token 三層架構與違規分級、check → fix → 複驗閉環、進度只記待辦 |
| 內部專案 C | legacy 可動層 / 不動層保護清單 |
| 內部專案 D | 憲章模式、審寫分離、誠實原則、範圍外預設移除 |
| 內部專案 E | 真實瀏覽器驗證、mock 外部 API、SDD 七步 |
| 內部專案 F／H | Spectra / OpenSpec 閘門、三維度驗證與降級 |
| 內部專案 G | 成本標註文化、唯讀 DB 帳號 |
| 內部專案 H | commit 由人主導、共用元件分支紀律 |
