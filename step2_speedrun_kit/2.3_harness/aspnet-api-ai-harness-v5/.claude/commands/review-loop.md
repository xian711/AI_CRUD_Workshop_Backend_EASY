# /review-loop

審查閘門。必須在**非產碼的新對話**執行（審寫分離）。審查者只指出問題，不改程式碼。

Input: `$ARGUMENTS`（要審查的功能名稱或檔案範圍）

## Loop

1. 讀 `harness/SPEC.md` 與本輪 diff（`git diff` 或指定檔案）；**不重讀全專案**。
2. 讀 `modules/review/REVIEW.md` 與 `modules/review/review-checklist.md`。
3. 三維度審查：
   - **Completeness**：SPEC 的每條 FR / TC 是否都有對應實作與測試（缺 → ❌）；掃 `harness/TASKS.md`——有 `- [ ]` 殘留且無 `[-]` 核可標記 → ❌。
   - **Correctness**：實作是否偏離規格，引 `file:line`（偏離 → ❌ 或 ⚠️）。
   - **Coherence**：是否符合專案慣例與 Design System（不一致 → ⚠️ / 💡）。
4. 雙向偵測：設計遺漏（DG-01～06）與過度設計（OE-01～05），兩者同等重要。
5. 每個發現必須：有憑據（SPEC 編號或 `file:line`）、可行動（附具體建議）、標嚴重度。
6. 不確定時降級（❌→⚠️→💡），避免誤報。
7. 產出 FR 覆蓋矩陣；標出無需求對應的孤立設計。
8. ❌ 項寫入 `harness/LOOP.md` 待辦；審查者不動手修。
9. 業務疑義標 `[SA 確認]`，不逕行裁決；已確認的技術決策不翻案。需要人裁決的疑義以選擇題呈現（2–4 選項、標明建議項）。

## Output

```text
Status: PASS | NEEDS_FIX | NEEDS_INPUT
Mode: REVIEW
Coverage: <FR 覆蓋，如 8/10；TASKS x/y；孤立設計清單>
❌ Critical:
- <憑據 + 問題 + 建議>
⚠️ Warning:
- <憑據 + 問題 + 建議>
💡 Suggestion:
- <只列重點>
OutOfScope: <已確認、不再翻案的技術決策>
Next: <one action>
```
