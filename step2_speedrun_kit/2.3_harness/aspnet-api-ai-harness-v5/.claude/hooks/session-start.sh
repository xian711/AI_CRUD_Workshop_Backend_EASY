#!/bin/sh
# SessionStart hook：開新對話／resume／clear／compact 後自動注入 Harness 提要，
# 緩解長對話規則衰減（早期規則被壓縮或注意力淡出）。
# 內容只是摘要提醒，細節仍以 HARNESS.md 與各 command 為準；改規則時記得同步這裡。
# Windows 依賴 Git Bash（裝 git 就有）；macOS / Linux 原生可跑。
cat << 'RULES'
## Harness 提要（SessionStart 自動注入；摘要僅供提醒，細節以 HARNESS.md 與各 command 為準）

六條鐵律：SDD first（無 FR/BR 對應＝範圍外，預設移除）｜誠實原則（未實作回 501 或標 TODO，不回假資料；mock 必標示；數字標 [待實機]）｜審寫分離（審查開新對話、只指出不動手）｜驗證自帶回圈（產出必掛驗證、修正必複驗）｜越權即標記（[SA 確認] [SD 待定] [DEV 實作] [待實機]）｜互動式決策（問人用選擇題 2–4 選項、標建議項）

路由：後端 API → /api-loop｜後端＋畫面 → /crud-loop｜純雛形 → /ui-loop｜GIS → 先載 skill gis-frontend｜接手舊系統 → 先跑 templates/intake-checklist.md｜段落收尾 → /milestone-loop｜完工審查（新對話）→ /review-loop｜接續上次進度 → 先讀 harness/LOOP.md 與 TASKS.md，不重新規劃直接延續

模型分級：一般產碼 Sonnet 即可；架構變更／安全路徑、同一問題第 2 輪 fix、review-loop → 提醒使用者 /model 升 Opus（提醒不阻塞）。

完工三關：TASKS 無 [ ] 殘留｜SPEC Done Criteria 逐條成立｜review-loop 通過——三關後回報「候選完工」由人核可；AI 不自我宣告完工。

底線：台灣白話繁中、忌大陸用語；只在 blocker 問人；commit 由使用者主導；fix 滿 2 輪即停；loop 結尾對照 LESSONS 事件表（E1–E5）回填。
RULES
exit 0
