# SPEC

Mode: `API | CRUD | UI`（UI＝雛形：只填 Feature 與 CRUD UI Spec 兩節）

## 編號與交接標記

- 編號：`FR-XX` 功能需求、`BR-XX` 商業規則、`TC-XX` 測試案例。程式、測試、UI 產出必須引用編號，供 review 對照。
- 標記：`[SA 確認]` 業務待確認、`[SD 待定]` 技術待定、`[DEV 實作]` 留給實作、`[待實機]` 需真實環境量測。

## Feature

Name: `TODO`

Goal: `TODO`

## Diagrams（圖優先於長文字）

用 Mermaid，骨架見 `templates/uml-mermaid-snippets.md`。只畫必要的圖，段落收尾時更新：

- 循序圖：主要流程一張
- 狀態圖：有生命週期的實體各一張
- ER 圖：本次相關資料表一張

```mermaid
%% TODO
```

## Functional Requirements

| ID | Given / When / Then | 優先級 |
|---|---|---|
| FR-01 | TODO | Must |

優先級用 MoSCoW：Must / Should / Nice。NFR 必須量化（數字＋單位＋測量方法），禁用「快速」「穩定」等模糊詞。

## Business Rules

| ID | 規則 | 影響範圍 |
|---|---|---|
| BR-01 | TODO | TODO |

## API Contract

Method: `GET | POST | PUT | DELETE`

Path: `/api/TODO`

Auth / Role: `TODO`

Request:

```json
{}
```

Response:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Errors:

| Code | When |
|---|---|
| VALIDATION_ERROR | Invalid input |
| FORBIDDEN | Permission denied |
| NOT_FOUND | Resource not found |

## Data / DB

DB: `SQL Server | PostgreSQL`

Tables / entities:

| Name | Notes |
|---|---|
| TODO | TODO |

## Mock Data Required

一律標示為測試資料。用有意義的資料（真實格式姓名、電話、地名），不用 test123。

- normal
- empty
- validation error
- permission denied
- boundary

## TDD Cases

Use Given / When / Then，每條對應 FR。

Required:

- happy path
- empty result
- validation
- permission
- boundary
- regression response shape

## CRUD UI Spec

Fill this section only for CRUD Mode.

Frontend: `Vue | React | Angular | Blazor | Razor Pages | MVC | TODO`

Existing CRUD example: `TODO file/path or summary`

Design System summary: `modules/crud-ui/design-system-summary.md`

Page sections:

- Search Area
- Toolbar
- Data Table
- Pagination
- Create / Edit Form
- Delete Confirm
- Toast / Alert

Fields:

| Field | Type | Required | UI Component | Validation | Notes |
|---|---|---:|---|---|---|
| TODO | string | yes | TODO | TODO | TODO |

Permissions:

| Action | Role | Rule |
|---|---|---|
| Create | TODO | TODO |
| Edit | TODO | TODO |
| Delete | TODO | TODO |

## Assumptions

- TODO

## Done Criteria

完工三關見 `HARNESS.md`：TASKS 全勾（或殘項經核可標 `[-]`）→ 本節逐條成立 → Review 無 ❌。

API Mode:

- `harness/TASKS.md` 全數勾選（或殘項經核可標記）。
- API spec 完整，FR / BR 皆有編號。
- Mock data 存在且標示為測試資料。
- TDD cases 存在且對應 FR。
- 最小自動化測試存在。
- `dotnet test` 或選定的測試指令已記錄。
- OpenAPI / Swagger 在 dev 環境可存取（沿用專案既有設定）。
- L2 curl smoke 通過：實測回應已附、`.http` 檔已更新。
- Review Gate 通過（無 ❌）。
- Blockers 清空。

CRUD Mode:

- `harness/TASKS.md` 全數勾選（或殘項經核可標記）。
- CRUD spec 完整，FR / BR 皆有編號。
- API / DB / DTO notes 完整。
- Mock data、TDD cases 存在且對應 FR。
- UI Spec 存在且經確認。
- Design System components 已 mapping。
- Token 檢查通過（或只剩已列明的手動項）。
- 前端驗證規則、API binding notes 已定義。
- API 部分 L2 curl smoke 通過：實測回應已附、`.http` 檔已更新。
- Review Gate 通過（無 ❌）。
- Blockers 清空。
