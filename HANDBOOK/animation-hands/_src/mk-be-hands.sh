#!/bin/bash
# 第四版一鍵：轉圖 → 講稿＋配音資料 → 組裝 →（可選）逐句截圖檢查
# 用法：./mk-v3.sh [out資料夾=out-be-hands] [check：all 或 9,10]
cd "$(dirname "$0")"
OUT=${1:-out-be-hands}
python prep.py "$OUT" || exit 1
python build_be_hands_data.py "$OUT" || exit 1
ANIM_ASSETS=. python build.py --engine engine-v3.html --extra-helpers helpers-crud.js be-hands-data.js v3-helpers.js --scenes scenes-be-hands.js --meta "$OUT/meta.json" \
  --out-dir "$OUT" --name anim --title "AI CRUD 後端手把手" --h1 "AI CRUD 後端工作坊 EASY 版　手把手教學動畫（跟著做版）" \
  --subtitle "Step 0～5 每一步都示範：點哪裡、貼哪一段、看到什麼就對了　·　小芸＋阿哲預錄配音（AI 語音）" --after after-be-hands.html || exit 1
if [ -n "$2" ]; then
  rm -rf check-hands; mkdir -p check-hands
  if [ "$2" = "all" ]; then timeout 2400 node check.mjs "$PWD/$OUT/anim.html" ./check-hands; else ONLY=$2 timeout 2400 node check.mjs "$PWD/$OUT/anim.html" ./check-hands; fi
  python sheet.py ./check-hands
fi
