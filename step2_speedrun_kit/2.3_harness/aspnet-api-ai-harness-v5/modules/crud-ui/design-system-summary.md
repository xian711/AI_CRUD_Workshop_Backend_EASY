# Design System Summary

把公司 Design System 的精簡摘要貼在這裡。保持簡短，不要反覆貼完整設計文件。

## Token 層級（若有 token 系統）

| 層級 | 前綴 / 位置 | 用途 |
|---|---|---|
| REF | `TODO（如 --ui-ref-*）` | 原始色板 / 尺寸，元件不得直接引用 |
| SYS | `TODO（如 --ui-sys-*）` | 語意 token（primary / success / surface…） |
| COMP | `TODO（如 --ui-comp-*）` | 元件專屬 token，只能引用 SYS |

沒有 token 系統時，填既有 CSS 變數或主題設定的位置，並禁止硬編碼樣式值。

## Components

| UI Need | Existing Component | Notes |
|---|---|---|
| Primary action | TODO Button | TODO |
| Secondary action | TODO Button | TODO |
| Search form | TODO Form | TODO |
| Data table | TODO Table | TODO |
| Pagination | TODO Pagination | TODO |
| Dialog | TODO Dialog | TODO |
| Toast / alert | TODO Toast | TODO |
| Date picker | TODO DatePicker | TODO |
| Select / dropdown | TODO Select | TODO |

## Layout Rules

- TODO

## Form Rules

- TODO（例：Label 在上方、必填 `*`、錯誤訊息格式）

## Table Rules

- TODO（例：操作按鈕樣式、狀態 badge 對應表）

## Validation Rules

- TODO
