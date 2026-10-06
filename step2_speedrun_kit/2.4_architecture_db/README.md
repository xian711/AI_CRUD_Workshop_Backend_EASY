# 2.4 Architecture & DB — 架構視覺化與資料庫入門

> 用圖看懂範本 API 的分層與資料流，再學會用 psql 親眼確認資料進了資料庫。

## 兩份東西

| 檔案 | 是什麼 | 怎麼用 |
|---|---|---|
| `ARCHITECTURE_DB.html` | 自包含視覺化：請求的一生、分層架構、POST 循序、DB 綱要、測試金字塔 | **用瀏覽器打開**（純 HTML/CSS/SVG，離線可看、零外部依賴） |
| `PSQL_QUICKSTART.md` | psql 三招：連線、`\dt` 看表、`SELECT` 看資料 | 想確認「資料真的進 PostgreSQL 了」時照著打 |

## 建議順序

1. 先開 `ARCHITECTURE_DB.html`，看「請求的一生」動線圖，建立「瀏覽器 → API → PostgreSQL 一路來回」的整體感。
2. 再看分層架構圖與 POST 循序圖，理解 Controller／Service／EF 各自的職責。
3. 玩過範本 API（見 `../2.1_play_template/`）後，用 `PSQL_QUICKSTART.md` 的三招下去查資料庫，把「畫面上的資料」和「資料庫裡的 row」對上。

> 圖的內容對應 `../2.2_system_docs/DESIGN-CRUD後端標準-v1.6.md`（設計文件）。想深究某個決策（如 D11 為什麼不全包 try/catch），回去查設計文件第 11 章。
