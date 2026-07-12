# 動手練習｜紅 → 判因 → 修 → 綠（LOOP 的完整一圈）

看到測試全綠只證明「現在沒壞」。這個練習讓你**親手把測試弄紅、判斷原因、再修回綠**——
這一整圈，才是 LOOP 工程真正要學會的東西。

這一課是**後端**課，所以我們注入的是一個**真實的後端 bug**（改壞驗證規則），
用**後端單元測試**當試金石。我們準備了一個**可一鍵注入、可一鍵還原**的刻意 bug，你不會弄壞任何東西。

---

## 這個 bug 是什麼

`inject-bug.ps1` 會把 DTO `EquipmentItemRequest` 的「**數量下限**」驗證（`[Range(0, int.MaxValue, ...)]`）註解掉。

- 改之前：新增品項若 `qty` 帶負值（例如 -1、-5），後端會擋下來（「數量不可小於 0」）。
- 改之後：那個下限**不再生效**——負數竟然通過驗證。
- 後果：後端單元測試 **`EquipmentValidationTests.EV4_數量負值_失敗`** 會**變紅**（它就是在驗這個下限）。

這是一個**真實的後端規則 bug**（不是把測試斷言打錯），所以判因時要能認出
「是**後端規則**被改壞，不是**測試**壞了、也不是**資料庫**壞了」。

---

## 開始前

這個練習只跑後端測試，**不需要**啟前端或資料庫（`dotnet test` 會自己用測試庫）。
以下指令都在**本資料夾**（`step4_loop_e2e\lab-red-to-green\`）或後端專案目錄執行。

> **注入對象＝你自己的 API。** `inject-bug.ps1`／`restore.ps1` 預設綁**學生工作區**
> `..\..\step3_new_module\my-equipment-api`——練的是**你自己作品**的紅→綠，不是官方解。
> 下面 `dotnet test` 的 `cd` 也請進 `my-equipment-api`。
> 若你這輪走的是官方參考解（checkpoint），改 `cd ..\..\step3_new_module\solution-api`，
> 並在注入／還原時加 `-UseCheckpoint`（或用 `-ApiDir <路徑>` 指定任一被測 API）。

---

## 練習流程（六步）

### ① 先跑基準，確認後端測試全綠

```
cd ..\..\step3_new_module\my-equipment-api
dotnet test --filter "FullyQualifiedName~EquipmentValidationTests"
```

看到這批 Equipment 驗證測試全數 passed 再往下。這是你的**基準線**——待會出問題才知道是這一步引入的。
（想跑整包 89 條也可以，只是慢一點：`dotnet test`。）

### ② 注入 bug

```
cd ..\..\step4_loop_e2e\lab-red-to-green
powershell -ExecutionPolicy Bypass -File .\inject-bug.ps1
```

它會先把原檔備份到 `.lab-backup\`，再把那條下限驗證註解掉。

### ③ 再跑一次後端測試，看到 EV4 紅

```
cd ..\..\step3_new_module\my-equipment-api
dotnet test --filter "FullyQualifiedName~EquipmentValidationTests"
```

這次會 **FAIL**，`EV4_數量負值_失敗` 那條紅。**把紅色輸出留下來**（這是證據一）。
失敗訊息大意是：`Assert.True() Failure`——測試送了 `qty = -1`，期望「有 Qty 欄位錯誤」，但實際上沒有錯誤（因為下限被拿掉了）。

### ④ 先判因（別急著修！）

問自己一句話：**這是 App（後端）的 bug、測試的 bug、還是資料庫的 bug？**

判斷依據：

| 線索 | 觀察 | 指向 |
|------|------|------|
| 失敗測試 | 只有 `EV4` 紅，其他驗證測試（EV5 qty=0 通過…）都還綠 | 不是整組測試環境壞 |
| 失敗內容 | 送 `qty=-1` 期望被擋，卻沒有任何欄位錯誤 | 是「驗證規則」變寬鬆了 |
| 資料庫 | 這是純 DTO 單元測試，根本沒碰資料庫 | 排除 DB |

結論：**是後端的驗證規則被改壞**（數量下限被移除），不是測試斷言寫錯、也不是資料庫問題。

把你的判斷寫成**一句話根因**（這是證據二）。例如：
> 「後端 `EquipmentItemRequest` 的 qty 下限驗證 `[Range(0,...)]` 被移除，導致負數通過驗證，EV4 因此等不到預期的 Qty 錯誤而紅。」

### ⑤ 修（二選一）

- **基本**：跑還原腳本，一鍵修回。

  ```
  cd ..\..\step4_loop_e2e\lab-red-to-green
  powershell -ExecutionPolicy Bypass -File .\restore.ps1
  ```

- **進階**：自己動手把規則加回去。打開
  `..\..\step3_new_module\my-equipment-api\src\CrudTemplate.Api\Models\EquipmentItemRequest.cs`，
  找到 `public int? Qty` 上方那行被註解掉的 `[Range(...)]`，把註解拿掉改回：

  ```csharp
  [Required(ErrorMessage = "請輸入數量")]
  [Range(0, int.MaxValue, ErrorMessage = "數量不可小於 0")]
  public int? Qty { get; set; }
  ```

  （改完別忘了本資料夾還留著 `.lab-backup\`，可自行刪掉或之後跑 `restore.ps1` 清掉。）

把你**用哪種方式修的**寫下來（這是證據三）。

### ⑥ 再跑後端測試，回到全綠

```
cd ..\..\step3_new_module\my-equipment-api
dotnet test --filter "FullyQualifiedName~EquipmentValidationTests"
```

看到全數 passed 就完成一圈了。**把綠色輸出留下來**（這是證據四）。

---

## 要交的四項證據

| # | 證據 | 內容 |
|---|------|------|
| 1 | 紅輸出 | 注入後 `EV4` 失敗的那段輸出（含失敗那一行） |
| 2 | 根因一句話 | 你判斷「這是後端 bug／測試 bug／資料庫 bug」的結論 |
| 3 | 修正方式 | 你用 restore 還原，或自己把規則加回去 |
| 4 | 綠輸出 | 修完再跑、全數 passed 的那段輸出 |

---

## 兩次停損提醒

LOOP 很會「為了讓燈變綠」而鬼打牆，愈修愈亂。給自己一條規矩：

> **同一個問題連續修兩次還沒好，就停下來，回去看根因判斷是不是錯了。**

在這個練習裡，如果你走「進階」自己改、改兩次還是紅，別再瞎試——直接跑 `restore.ps1` 回到乾淨狀態，
重看一次第 ④ 步，多半是把 `[Range]` 加錯位置或參數打錯。

---

## 進階選配：從單元測試延伸到全鏈路

真正的 LOOP 高手不只會修一條紅，還會想「這個洞在**整條鏈路**上會怎麼冒出來」。

試著在**注入 bug 的狀態下**，另開視窗跑一次全鏈路 e2e（`..\run-e2e.ps1`），
再在前端新增頁把數量填 `-5` 送出——想想看：這個下限漏洞，會在**前端**被擋、還是一路放行到**資料庫**？
（提示：前端表單自己也有 `:min="0"`，所以這個後端漏洞在 UI 正常操作下不一定看得出來——
這正是「為什麼後端也要各自驗一次」的最好反例。）

---

## 練習後請確認乾淨

> 本課的 `my-equipment-api`／`solution-api` **都不是 git repo**，不要用 `git status`／`git checkout`
> 判斷或還原（會 fatal）。改用下面兩個不依賴 git 的判準。

收工前，被測 API 的 `EquipmentItemRequest.cs` 要回到原狀。兩個判準都成立才算乾淨：

1. **備份已消失**：`lab-red-to-green\.lab-backup\` 資料夾不存在（`restore.ps1` 成功還原後會自動刪掉它）。
2. **規則已復原**：目標檔裡數量下限那行沒有被註解掉。用下面這行檢查——

```
Select-String -LiteralPath ..\..\step3_new_module\my-equipment-api\src\CrudTemplate.Api\Models\EquipmentItemRequest.cs -Pattern '^\s*\[Range\(0, int\.MaxValue'
```

有印出一行（開頭不是 `//`）＝規則還在＝乾淨；**印不出來**代表那行還被註解著，請再跑一次 `restore.ps1`。
（走官方參考解者把路徑改成 `solution-api`。）
