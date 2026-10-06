#!/usr/bin/env bash
#
# update-e2e-hash.sh
# 重算 step4 E2E 測試檔的 SHA-256 基準（講師專用｜macOS／Linux）
#
# run-e2e.ps1 / run-e2e.sh 每次跑測試前，會做一次「意外修改偵測」：
# 比對測試檔的雜湊與 step4_loop_e2e/tests.sha256 是否相同，不同就拒絕執行。
#
# 講清楚它的定位：它確認的是「學員手上的測試，跟講師發出去的是同一份」。
# 擋得住「改了測試卻忘了同步基準」與多數順手放寬斷言的情況；
# 擋不住「有寫入權限、又刻意連基準一起重算」的人——因為腳本、測試、基準
# 都在同一份學員可寫的副本裡。要真的防蓄意作弊，可信基準與評測器必須
# 放在學員改不到的地方（講師端／CI）。
#
# 所以只要你（講師）正當地改了測試檔或 playwright.config.ts，
# 就要跑這一支把基準更新掉，否則學員會一律看到 FAIL。
#
# 它放在 tools/ 子資料夾，跟學員每天要跑的 run-e2e 分開——
# 但這只是「不順手」，不是權限邊界。真正的邊界要靠把它移出學員可寫範圍。
#
# 雜湊前會先移除 CR（\r），所以 CRLF / LF 差異不會影響結果。
#
# 用法：bash step4_loop_e2e/tools/update-e2e-hash.sh
#

set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOOP_DIR="$(dirname "$SCRIPT_DIR")"
MANIFEST="$LOOP_DIR/tests.sha256"

# 受保護的檔案（相對 step4_loop_e2e/）：測試本體 ＋ 會影響判定的設定
TARGETS="e2e/tests/fullchain.spec.ts e2e/playwright.config.ts"

sha256_of() {
    # 去掉 CR 再算，讓 CRLF / LF 差異不影響結果
    if command -v sha256sum >/dev/null 2>&1; then
        tr -d '\r' < "$1" | sha256sum | awk '{print $1}'
    else
        tr -d '\r' < "$1" | shasum -a 256 | awk '{print $1}'
    fi
}

echo "=== 重算 step4 E2E 測試檔雜湊基準 ==="

{
    echo '# step4 E2E 受保護檔案的 SHA-256 基準（內容已去除 CR，換行風格不影響）'
    echo '# 用途：意外修改偵測——確認手上的測試與講師發出去的是同一份。'
    echo '# 它不是防蓄意作弊的機制：基準與測試在同一份可寫副本裡，一起改就繞得過。'
    echo '# 由 step4_loop_e2e/tools/update-e2e-hash.ps1 或同資料夾的 .sh 產生。'
    echo '# 格式：<sha256>  <相對 step4_loop_e2e/ 的路徑>'
} > "$MANIFEST"

for rel in $TARGETS; do
    full="$LOOP_DIR/$rel"
    if [ ! -f "$full" ]; then
        echo "找不到受保護檔案：$rel" >&2
        exit 1
    fi
    hash="$(sha256_of "$full")"
    echo "$hash  $rel" >> "$MANIFEST"
    echo "  $hash  $rel"
done

echo "已更新：$MANIFEST"
