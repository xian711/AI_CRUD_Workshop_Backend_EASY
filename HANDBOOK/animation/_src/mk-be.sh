#!/bin/bash
# 第四版一鍵：轉圖 → 講稿＋配音資料 → 組裝 →（可選）逐句截圖檢查
# 用法：./mk-v3.sh [out資料夾=out-be] [check：all 或 9,10]
cd "$(dirname "$0")"
OUT=${1:-out-be}
python prep.py "$OUT" || exit 1
python build_be_data.py "$OUT" || exit 1
ANIM_ASSETS=. python build.py --engine engine-v3.html --extra-helpers helpers-crud.js be-data.js v3-helpers.js --scenes scenes-be.js --meta "$OUT/meta.json" \
  --out-dir "$OUT" --name anim --title "AI CRUD 後端課動畫" --h1 "AI CRUD 後端工作坊 EASY 版　教學動畫（講課版）" \
  --subtitle ".NET API＋PostgreSQL：harness・SDD・LOOP・對抗審查，全程實拍　·　小芸＋阿哲預錄配音（AI 語音）" --after after.html || exit 1
if [ -n "$2" ]; then
  rm -rf check; mkdir -p check
  if [ "$2" = "all" ]; then timeout 2400 node check.mjs "$PWD/$OUT/anim.html" ./check; else ONLY=$2 timeout 2400 node check.mjs "$PWD/$OUT/anim.html" ./check; fi
  python sheet.py ./check
fi
