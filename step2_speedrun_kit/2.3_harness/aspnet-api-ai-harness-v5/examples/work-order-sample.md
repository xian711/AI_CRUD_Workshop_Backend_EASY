# Example: Work Order List API

## Feature

查詢派工單清單 API。

## Context

使用者可依狀態、日期區間、關鍵字查詢派工單。

## API

GET `/api/work-orders`

Query:
- keyword: string, optional
- status: pending | processing | completed | cancelled, optional
- startDate: yyyy-MM-dd, optional
- endDate: yyyy-MM-dd, optional
- page: int, default 1
- pageSize: int, default 20, max 100

Rules:
- Admin can see all work orders.
- Maintainer can see assigned work orders only.
- Invalid date range returns VALIDATION_ERROR.

Done:
- SDD complete
- mock data complete
- TDD cases complete
- minimal integration test draft complete
