# 教學動畫原始檔（後端課・講課版）

這個資料夾是 `HANDBOOK/animation/index.html` 的原始檔。學員不用看；要改動畫的人才需要。

## 內容

- 30 段、96 句，約 17 分鐘。小芸（Gemini TTS 的 Sulafat 聲音）講方法和觀念，阿哲（Sadaltager）講實拍示範。
- 畫面是 2026-10-07 在 Windows 11 實拍：VS Code 繁中介面＋Claude Code 擴充、PowerShell、Chrome／Swagger、psql。
- Step 3 文件階段用 Opus 5.5 High，寫程式用 Sonnet 5.5 High；Step 4 LOOP 用 Sonnet 5.5，審查子代理用 Opus 5.5。

## 檔案

| 檔案 | 用途 |
|---|---|
| `script_be.py` | 講稿：每段的章節、標題、講者、畫面說明、句子（字幕＝配音） |
| `scenes-be.js` | 場景：每句要出現的截圖、框線、字卡 |
| `engine-v3.html`、`helpers*.js`、`v3-helpers.js` | 播放器與繪圖工具 |
| `make_be_audio.py` | 用 Gemini TTS 逐句預錄，並用語音辨識回聽比對 |
| `build_be_data.py`、`build.py`、`prep.py`、`mk-be.sh` | 組裝：截圖轉檔＋遮罩 → 講稿與配音清單 → 一個 HTML |
| `check.mjs`、`sheet.py`、`t-*.mjs` | 逐句截圖檢查、播放測試 |
| `driver.mjs`、`send.mjs`、`vsc-lib.mjs`、`c-*.json`、`mk-c-*.py` | 實拍：遙控隔離設定檔的 VS Code 與 Claude Code |
| `cap-page.mjs`、`cap-swagger.mjs`、`pg-*.json` | 實拍：瀏覽器頁面（COMPARE、ARCHITECTURE_DB、Swagger、報告） |
| `be-plan.md` | 拍攝清單與實拍紀錄（題數、任務數、測試數、時間） |
| `meta.json`、`meta-extra.json` | 每張截圖的尺寸與框線座標 |

## 個資

- 截圖裡的 Windows 帳號路徑用 `prep.py` 的 FIX 遮掉；拍完用 `ocr-find.ps1` 掃過帳號、git 使用者名稱與 `Users` 路徑。
- 文件截圖是把 Markdown 轉成 HTML 再拍（`md2html.py`），轉的時候把 git 使用者名稱換成「你的帳號」。

## 重做的順序

1. 改 `script_be.py`（句數要跟 `scenes-be.js` 每段的動作數一樣）。
2. `python make_be_audio.py`（同一句不會重錄）。
3. `bash mk-be.sh out-be all`，看 `check/sheet*.png`。
4. `python install.py` 裝回課程 repo。
