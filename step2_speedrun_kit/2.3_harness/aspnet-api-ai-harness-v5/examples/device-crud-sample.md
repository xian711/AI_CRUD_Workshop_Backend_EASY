# Example: Device Management CRUD

## Feature

設備資料維護 CRUD。

## Goal

讓管理者可以查詢、新增、編輯、刪除設備基本資料。

## Entity Fields

| Field | Type | Required | Notes |
|---|---|---:|---|
| deviceCode | string | yes | unique |
| deviceName | string | yes | display name |
| location | string | no | site / building |
| status | enum | yes | active / inactive / maintenance |
| lastMaintenanceDate | date | no | yyyy-MM-dd |

## API

- GET `/api/devices`
- GET `/api/devices/{id}`
- POST `/api/devices`
- PUT `/api/devices/{id}`
- DELETE `/api/devices/{id}`

## UI

Sections:
- Search Area: keyword, status, location
- Data Table: code, name, location, status, last maintenance date, actions
- Create / Edit Form: code, name, location, status, last maintenance date
- Delete Confirm Dialog

## Rules

- Admin can create, edit, delete.
- Viewer can only read.
- deviceCode is required and unique.
- status must be active / inactive / maintenance.
