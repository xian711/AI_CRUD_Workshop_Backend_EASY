# UML / Mermaid 骨架

原則：

- **圖優先於長文字**：能用圖講清楚的，不寫長段定義。
- 一張圖講一件事、不超過一屏；太複雜就拆小圖。
- 用量：循序圖＝每個主要流程一張；狀態圖＝每個有生命週期的實體一張；ER 圖＝本次相關資料表一張；類別圖＝模組級一張（需要才畫）。
- 圖跟著程式走：段落收尾（`/milestone-loop`）時更新。**過時的圖比沒圖更糟**。

## 循序圖（主要流程）

```mermaid
sequenceDiagram
    actor U as 使用者
    participant C as Controller
    participant S as Service
    participant D as DB
    U->>C: GET /api/work-orders
    C->>S: Query(filter)
    S->>D: SELECT
    D-->>S: rows
    S-->>C: DTO list
    C-->>U: 200 {success,data}
```

## 狀態圖（有生命週期的實體）

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Processing: 派工
    Processing --> Completed: 完工
    Processing --> Cancelled: 取消
    Completed --> [*]
    note right of Completed: 已結案不得再編輯（BR-XX）
```

## ER 圖（本次相關資料表）

```mermaid
erDiagram
    WORK_ORDER ||--o{ WORK_ORDER_ITEM : contains
    WORK_ORDER {
        int Id PK
        string Status
        datetime CreatedAt
    }
```

## 類別圖（模組級，需要才畫）

```mermaid
classDiagram
    class IWorkOrderService {
        +Query(filter) PagedResult
    }
    WorkOrderController --> IWorkOrderService
    WorkOrderService ..|> IWorkOrderService
```

## 流程圖（分支邏輯）

```mermaid
flowchart TD
    A[收到請求] --> B{有權限?}
    B -- 否 --> C[403 FORBIDDEN]
    B -- 是 --> D[查詢並回傳]
```
