---
name: aspnet-api-crud-sdd-loop
description: Use for backend API and CRUD tasks that need SDD, mock data, TDD cases, design-token-compliant CRUD UI, staged verification, and a review gate before completion.
---

# API / CRUD SDD Loop

產生或修改後端 API、CRUD 功能或 UI 雛形時使用本 skill，遵守 `HARNESS.md` 鐵律（技術棧慣例以 `harness/CODE-RULES-*.md` 為準）。

Mode 判斷：

- 預設 **API Mode** → 執行 `/api-loop`。
- 功能含 UI / 表單 / 列表頁 / Design System mapping → **CRUD Mode**，執行 `/crud-loop`。
- 只做畫面雛形（無後端）→ **UI Mode**，執行 `/ui-loop`。
- 涉及地圖 / GIS → 先載入 skill `gis-frontend` 再走對應 loop。

執行步驟以對應 command 為準；段落收尾用 `/milestone-loop`，完工前在新對話跑 `/review-loop`。

禁止：

- SPEC 完成前開始寫實作程式。
- 發明 UI 元件；用既有 Design System mapping，缺就標 blocker。
- 用假資料冒充已完成的功能。
- 在同一對話自產自審。
