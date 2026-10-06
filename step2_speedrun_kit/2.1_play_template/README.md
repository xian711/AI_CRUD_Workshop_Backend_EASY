# 先玩一輪範本 API

> 動手複製之前，先把範本 API 當使用者操作一遍，建立心智模型。
> 這些行為就是你之後複製出來的新模組 API 會「免費繼承」的能力。
> 全程在 `../2.5_sample_api/sample-api/` 這一包裡做。

## 白話：第一次跑會發生什麼

你只要 `dotnet run`，範本會自己完成這串：

1. **自動建庫**：連上 PostgreSQL，發現 `ai_crud_template` 不存在就建一個（課堂用的 postgres 超級使用者有建庫權限）。
2. **自動跑 migration**：`Database.Migrate()` 把資料表 `template_member`、CHECK 約束、SEQUENCE 一次建好。
3. **自動灌種子**：`DbSeeder` 看到空表，灌入 24 筆虛構人員（M-001~M-024）；已有資料就跳過（冪等，重啟不會變 48 筆）。

所以**不需要你手動建資料庫、不需要手動跑 SQL**。第一次可能因為要建庫稍微慢一點，屬正常。

## 步驟一：啟動 API

```powershell
cd ..\2.5_sample_api\sample-api\src\CrudTemplate.Api
dotnet run --urls http://localhost:5080
```

- 服務位址 `http://localhost:5080`，API 基底 `http://localhost:5080/api/template/members`。
- 看到 `Now listening on: http://localhost:5080` 就是起來了。
- 第一次啟動前，先確認 PostgreSQL 服務在跑（見下方常見錯誤表）。

## 步驟二：開 Swagger 操作 CRUD 各一次

瀏覽器開 <http://localhost:5080/swagger>。逐一操作五個端點，每個確認「你應該看到什麼」。

| # | 端點 | 操作 | 你應該看到什麼 |
|---|---|---|---|
| 1 | **GET** `/api/template/members` | Try it out → Execute | 200，`data` 陣列 24 筆，id 從 M-001 升冪；外層有 `success:true` |
| 2 | **GET** `/api/template/members/{id}` | 填 `M-001` → Execute | 200，單筆陳建豪的資料 |
| 3 | **POST** `/api/template/members` | 貼下方範例 body → Execute | 201，回傳新資料 id 是 `M-025`；Response headers 有 `Location` |
| 4 | **PUT** `/api/template/members/{id}` | 填 `M-025`、改個欄位 → Execute | 200，欄位更新、`updatedAt` 是今天 |
| 5 | **DELETE** `/api/template/members/{id}` | 填 `M-025` → Execute | 204 No Content（無主體）；再 GET `M-025` 回 404 |

POST 範例 body（可直接貼）：

```json
{
  "name": "測試人員", "gender": "女", "birthDate": "1990-01-01",
  "idType": "身分證", "nationalId": "A223456789", "phone": "0911222333",
  "email": "", "residenceCounty": "臺東縣", "residenceTownship": "臺東市",
  "residenceAddress": "某路1號", "groupName": "搶救組", "positionCode": "member",
  "qualifications": ["防災士"], "status": "在職", "note": "", "bloodType": "AB"
}
```

**加分：故意觸發驗證錯誤** — POST 時把 `phone` 改成 `123`（不合格式）→ Execute → 應回 **400**，`errors` 裡有 `phone` 的繁中訊息（欄位鍵是 camelCase）。這就是範本「驗證失敗回 400 帶欄位訊息」的行為。

## 步驟三：跑測試（49 條全綠）

開**另一個**終端機（API 繼續開著沒關係，測試打的是另一個測試庫 `ai_crud_template_test`）：

```powershell
cd ..\2.5_sample_api\sample-api
dotnet test
```

應看到 `Passed!` 且測試數 **49**（單元 + 整合）。整合測試每輪自己重建測試庫，不會污染你剛剛玩的開發資料。

## 步驟四：玩完重置資料

剛剛 POST/PUT/DELETE 動過開發庫。玩完想回到乾淨的 24 筆，先**停掉 API**（在 API 終端機按 `Ctrl+C`），再跑：

```powershell
cd ..\..\..\..\2.1_play_template   # 回到本資料夾（或用絕對路徑）
.\reset-template-data.ps1
```

這支腳本會：清空 `template_member`、把 SEQUENCE 歸位到 25。**它只清不種**——清完**重啟一次 API**（`dotnet run`），`DbSeeder` 看到空表就自動重新灌回 24 筆種子。

> 為什麼要重啟才有資料？因為種子是「API 啟動時、看到空表才植入」的。腳本負責清乾淨，API 負責重新種——分工清楚，不怕清一半。

## 檢查點總結

五個端點都能操作、49 條測試綠、重置後回到 24 筆，就代表範本在你機器上完整跑起來了。這五個 CRUD 行為（加上驗證、自動建庫、冪等種子）就是新模組 API 會自動繼承的骨架。

## 常見錯誤表

| 症狀 | 原因 | 排解 |
|------|------|------|
| `Connection refused` / `password authentication failed` | **PostgreSQL 5432 沒開**或帳密不符 | 確認 `postgresql-x64-18` 服務啟動；帳密與 `appsettings.Development.json` 一致（DEMO：postgres / 12345——**僅限本機教室 DEMO，不得沿用公司／正式環境**，正式環境請改用環境變數 `ConnectionStrings__Default` 帶密碼） |
| `Address already in use` / 起不來 | **Port 5080 被佔**（可能另一個 API 還開著） | 一次只跑一個 API；或換 port `dotnet run --urls http://localhost:5090`（`members.http` 的 `@host` 同步改） |
| 第一次啟動卡很久 | **建庫 / restore 慢**（首次要建資料庫、還原套件） | 屬正常，等它跑完；後續啟動會快很多 |
| `dotnet ef` 找不到 | local tool 沒還原 | 先 `dotnet tool restore`（於 sample-api 根） |
| psql 中文亂碼 | Windows 中文 code page 顯示問題 | 不影響資料；必要時 `SET client_encoding TO 'UTF8';` |
| 重置後資料還是空的 | 忘了重啟 API | 跑完 `reset-template-data.ps1` 要再 `dotnet run` 一次，種子才會回來 |

> 完整環境設定與更多問題見 `../2.5_sample_api/sample-api/SETUP.md`。
