# 2.3 Harness — 後端 harness 四件

> harness 就是「給 AI 的規矩」。範本給骨架、AI 出勞力，harness 負責讓 AI 出的勞力守規矩。
> 這四件湊齊，AI 每次改後端碼都會自動對照，不會亂換 provider、不會漏封裝、不會手改 DB、不會吞例外。

## ⚠️ 先講清楚：實檔只有一份，在範本專案根目錄

**這個資料夾沒有規則檔的複本，只有這份說明。** 四件的**實檔**全部在：

```
step2_speedrun_kit/2.5_sample_api/sample-api/
```

**為什麼要這樣？** AI 只會讀「它工作目錄的專案根目錄」那一份。如果教材資料夾再放一份長得一樣的，
你很可能改到不生效的那一份，改半天發現 AI 完全沒理你。所以**全庫只留一份實檔**，
放在 AI 真的讀得到的位置，複製範本開新模組時也會一起帶著走。

## 後端 harness 四件

點檔名可以直接打開實檔（都在 `../2.5_sample_api/sample-api/`）：

| 檔案 | 是什麼 | 什麼時候用 | 給誰看 |
|---|---|---|---|
| [`CLAUDE.md`](../2.5_sample_api/sample-api/CLAUDE.md) | 專案憲法：技術棧鎖定（.NET 10／EF Core／Npgsql／Mapperly／xUnit）＋10 條程式規則＋契約要點＋開發流程 | AI 每次對話**自動讀**（見下方相容表），不用你貼 | AI 主讀；人也該掃一遍知道底線 |
| [`CODE-RULES-api-本專案.md`](../2.5_sample_api/sample-api/CODE-RULES-api-本專案.md) | 程式與資料表細則：分層／DTO 驗證／Mapperly／PostgreSQL 綱要／CHECK／SEQUENCE／測試隔離＋範本檔案對照表 | AI 改後端碼前對照；`CLAUDE.md` 講不完的細節在這 | AI 改碼時查；人做 code review 時對照 |
| [`contract-conventions-summary.md`](../2.5_sample_api/sample-api/contract-conventions-summary.md) | 契約慣例摘要：狀態碼矩陣、ModelResult JSON 形狀、SEQUENCE 取號流程、錯誤鍵 camelCase、D 決策六條 | 要動端點、回應形狀、驗證錯誤時對照 | AI 改契約時查；人審契約一致性。這是後端版的「design-system-summary」 |
| [`使用說明-複製範本開發新API模組.md`](../2.5_sample_api/sample-api/使用說明-複製範本開發新API模組.md) | 操作手冊：怎麼把 sample-api 複製成新 CRUD API 模組（複製區 vs 共用區、五類檔案、migration、測試、Windows 指令對照） | 開新模組動手前先讀一遍 | 人主讀；AI 也可依此走流程 |

另附 [`AGENTS.md`](../2.5_sample_api/sample-api/AGENTS.md)：短檔，指向 `CLAUDE.md`，給 Codex CLI 等讀 `AGENTS.md` 的 Agent 用。

## 怎麼運作

1. AI 一開對話就載入專案根目錄 `CLAUDE.md`（專案憲法），知道鎖哪些套件、10 條規則、能改哪些檔。
2. 真的要改後端碼時，才去對照 `CODE-RULES-api-本專案.md` 的細則。
3. 動端點／回應／驗證錯誤時，對照 `contract-conventions-summary.md`。
4. 動手複製新模組時，照 `使用說明-複製範本開發新API模組.md` 的流程走。

## 不同 AI Agent 怎麼載入規則

不是每個 Agent 都會自動讀 `CLAUDE.md`。關鍵在於：**本課每個 step 的 `PROMPTS.md` 起手 prompt 都會明確要求「先讀以下檔案再動工」**，所以無論你用哪個 Agent，都能把四件規則載進去——**任何 Agent 都通用**。

| AI Agent | 會自動讀哪個規則檔 | 本課怎麼確保它讀到 |
|---|---|---|
| Claude Code | 自動讀專案根目錄 `CLAUDE.md` | 開箱即讀；起手 prompt 再補指名四件，雙保險 |
| Codex CLI | 自動讀專案根目錄 `AGENTS.md`（本範本已附，內容指向 `CLAUDE.md`） | 開箱即讀 `AGENTS.md` → 轉讀 `CLAUDE.md`；起手 prompt 再補 |
| Cursor／其他 IDE 內建 Agent | **不會**自動讀 `CLAUDE.md` | 靠起手 prompt 明確要求「先讀以下檔案」——本課 `PROMPTS.md` 已這樣寫 |

> 精神：規矩集中在少數幾個檔，Agent 自動載入或由起手 prompt 顯式指名載入，人不必每次口頭交代。這就是 harness 省 token、又能守規矩的關鍵。

## 課後進階附錄：後端 API 完整 harness 參考包

`aspnet-api-ai-harness-v5/` 是完整 harness 參考包 **v5.16**（SDD loop＝規格驅動開發的回圈：先規格、再程式；這包裡的 SDD 都是這個意思。另有六條鐵律、驗證分級、`/api-loop`／`/crud-loop` 等 command、樣板規則檔）。本課「四件」即從這套精煉、換成本專案實值。

**這包課堂用不到。** 它的用途是「回公司做更大型後端時照這套走」。

| 你要注意什麼 | 說明 |
|---|---|
| **哪些檔跟本課無關，可以直接跳過** | 前端／GIS 相關的 9 個檔：`.claude/commands/ui-loop.md`、`.claude/skills/gis-frontend/`、`harness/CODE-RULES-ui.md`、`modules/crud-ui/`（3 檔）、`templates/crud-ui/`（3 檔）。本課是純後端，這些一份都不會用到 |
| **後端要看哪幾檔** | `CLAUDE.md`（路由表）→ `HARNESS.md`（核心規則）→ `harness/CODE-RULES-api.md`（.NET 細節）→ `.claude/commands/api-loop.md`。想快速看懂整包設計，讀 `docs/白話導覽.html` |
| **這包是外部同步進來的，不要手改** | 它有自己的版本線（v5.15 → v5.16），會整包覆蓋更新。你在裡面改的東西，下次同步就沒了。要調規則請改**本課四件**（在 `../2.5_sample_api/sample-api/`），不要改這包 |
| **裡面有一個 hook** | `.claude/settings.json` 設了 SessionStart hook。第一次在該資料夾啟動 Claude Code 會問你信不信任，同意後每次開場自動重灌規則提要（防長對話規則衰減） |
