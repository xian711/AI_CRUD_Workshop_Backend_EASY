# TASKS

Feature: `TODO`（對應 `harness/SPEC.md`）

規則：

- SDD 完成後由 AI 依 SPEC 展開本檔；人可增刪調序。
- 每條必標**對應 FR 與驗證方式**；不可驗證的不算任務。
- 做完**且驗證通過**才勾 `[x]`。commit 由使用者主導：commit 時勾選與產出放同一個（git 是完成證據）；未 commit 前在 `LOOP.md` 註記待補，不得偽稱已 commit。
- 「不做／延後」項須經人以選擇題核可，標 `[-]` 並註記原因，不得默默留白。
- 完工三關見 `HARNESS.md`：本檔無 `- [ ]` 殘留 → SPEC Done Criteria 成立 → `/review-loop` 無 ❌。三關過後回報「候選完工」，由人最終核可。

## API Mode 骨架（展開時複製調整）

- [ ] T1 API contract（FR-XX）｜驗證: 輸出前自檢＋人工確認（`[SA 確認]` 項清零）
- [ ] T2 Mock data（FR-XX）｜驗證: 情境覆蓋（normal/empty/error/permission/boundary）
- [ ] T3 TDD cases（TC-XX）｜驗證: FR 覆蓋
- [ ] T4 測試碼｜驗證: L1
- [ ] T5 實作草稿｜驗證: L0 + L1
- [ ] T6 OpenAPI 確認｜驗證: dev 可存取
- [ ] T7 curl smoke｜驗證: L2（附實測指令、同步 .http）

## CRUD / UI Mode 追加

- [ ] T8 UI Spec（FR-XX）｜驗證: 人工確認後才產碼
- [ ] T9 Page Draft｜驗證: Token Check 通過
- [ ] T10 Validation / API binding notes｜驗證: review
