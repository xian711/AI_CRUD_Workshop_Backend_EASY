# psql 三招 — 用命令列看資料庫

> `psql` 是 PostgreSQL 的命令列工具。課堂只要會三招：連得上、看得到表、查得到資料。
> 本課的 API 會自動建庫建表灌種子，psql 只是讓你「親眼確認資料真的進資料庫了」。

## 先找到 psql 的絕對路徑

Windows 安裝的 PostgreSQL **預設不會把 psql 加進 PATH**，所以直接打 `psql` 通常會說找不到。它在安裝目錄裡：

```
C:\Program Files\PostgreSQL\<版號>\bin\psql.exe
```

本機是 PostgreSQL 18，所以路徑是：

```
C:\Program Files\PostgreSQL\18\bin\psql.exe
```

> **版本不同就換數字**：如果你裝的是 17，就把 `18` 改成 `17`。不確定版號？開檔案總管到 `C:\Program Files\PostgreSQL\`，看裡面資料夾叫什麼數字就用那個（有多個取最大）。

以下三招都用 `& "絕對路徑"` 的寫法（PowerShell 用 `&` 呼叫帶空格路徑的程式）。連線參數是課堂 DEMO 值（postgres / 12345 / localhost:5432）。

> **僅限本機教室 DEMO，不得沿用公司／正式環境的帳密。** 正式環境請改用連線字串環境變數（如 `ConnectionStrings__Default`／`PGPASSWORD`）或密碼管理工具，不要把真帳密寫死在指令或設定檔裡。

---

## 第 1 招：連線（連上開發庫）

```powershell
$env:PGPASSWORD = "12345"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d ai_crud_template
```

- 成功會進入互動提示字元 `ai_crud_template=#`，代表連上了。
- `$env:PGPASSWORD` 先把密碼放進環境變數，psql 就不會再問你密碼。
- 想先驗證連線通不通、不進互動模式，加 `-c "SELECT version();"`：

```powershell
$env:PGPASSWORD = "12345"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d ai_crud_template -c "SELECT version();"
```

離開互動模式打 `\q` 再 Enter。

---

## 第 2 招：`\dt` 看有哪些表

進了互動模式後，打 `\dt`：

```
ai_crud_template=# \dt
```

應該看到 `template_member` 這張表（還有 EF 的 migration 記錄表 `__EFMigrationsHistory`）。

不想進互動模式、一行搞定：

```powershell
$env:PGPASSWORD = "12345"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d ai_crud_template -c "\dt"
```

> `\dt` = describe tables。相關的還有 `\d template_member`（看這張表的欄位、型別、約束）——想確認 snake_case 欄位名、CHECK 約束、SEQUENCE 就用它。

---

## 第 3 招：`SELECT` 看資料

看前 5 筆人員：

```powershell
$env:PGPASSWORD = "12345"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d ai_crud_template -c "SELECT id, name, status, blood_type FROM template_member ORDER BY id LIMIT 5;"
```

數一數總共幾筆（玩範本前應是 24）：

```powershell
$env:PGPASSWORD = "12345"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d ai_crud_template -c "SELECT COUNT(*) FROM template_member;"
```

> 注意欄位名是 **snake_case**（`blood_type` 不是 `bloodType`）——因為 SELECT 查的是資料庫底層，API 對外才轉成 camelCase。這正好印證「JSON camelCase / DB snake_case」這條契約。

---

## 三招速查表

| 招 | 做什麼 | 關鍵 |
|---|---|---|
| 1 連線 | 進資料庫 | `-d ai_crud_template`，密碼放 `$env:PGPASSWORD` |
| 2 `\dt` | 看有哪些表 | `\d 表名` 可看欄位與約束 |
| 3 `SELECT` | 看實際資料 | 欄位用 snake_case；`COUNT(*)` 數筆數 |

## 小提醒

- 開發庫 `ai_crud_template`／測試庫 `ai_crud_template_test`，別搞混（測試庫每輪被測試重建，平時是空的或不存在）。
- postgres / 12345 是課堂 DEMO 連線，**僅限本機教室 DEMO，不得沿用公司／正式環境**；正式環境改用環境變數（`PGPASSWORD`／`ConnectionStrings__Default`）帶密碼，切勿寫死。
- 中文顯示亂碼是 Windows code page 問題，不影響資料；互動模式可 `SET client_encoding TO 'UTF8';`。
