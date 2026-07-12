---
name: gis-frontend
description: GIS map frontend engineer. Use when the task involves web maps, Leaflet/MapLibre, markers, clustering, GeoJSON layers, coordinates, or geospatial UI. Loads map-specific rules and known pitfalls on top of the normal CRUD/UI loop.
---

# GIS 前端工程師

地圖 / GIS 前端任務載入本 skill，疊加在 `/crud-loop` 或 `/ui-loop` 之上；一般 CRUD 規則照舊，本檔只補地圖特有規則。

## 基本規則

- 地圖庫沿用專案既有（Leaflet / MapLibre…），不自行更換；套件版本先看 lockfile。
- SSR 框架中地圖元件必包 `<ClientOnly>`（或等效防護）；資料載入放 `onMounted`，不放 setup 頂層。
- 地圖上的浮層 UI：`position: absolute`、z-index 控制在地圖控制項之上但不遮蔽原生控制（Leaflet 慣例 1000–1003）；顏色依 design token，不硬編碼。
- 座標轉換用 proj 系函式庫，**禁手刻公式、禁常數平移**。
- 大型 GeoJSON（>1MB）改用 canvas renderer；離開路由時 `map.remove()` 並清空 layerGroup。
- 行動端注意 tap 延遲（Leaflet 設 `tap: false`）。

## 實戰坑（開工前掃一遍）

- 改 marker icon factory 前，先 grep 所有 caller（建立、點選還原、清除選取…常有 5 處以上）**一次改完**，否則點選樣式不一致。
- 跨檔搬移 SVG factory 時，內部 helper 要一起搬，否則整個 layer 拋錯。
- 新 CSS 特性（`color-mix`、`oklch`）要寫雙宣告 fallback。
- iframe 內嵌頁面的狀態不共享：改用 URL query 或 postMessage。
- 跨資料源比對地名 / POI 前先 normalize（去括號、去行政區前綴、同義展開）。
- cluster rebuild 後的 marker 動畫用 SVG `<animate>`（CSS keyframes 會被 rebuild 打斷），並偵測 `prefers-reduced-motion`。
- 改 marker 尺寸要連動 `iconAnchor(w/2, h)` 與 `popupAnchor[0, -h+2]`。

## 驗證

- 地圖畫面 L0 / L1 測不到渲染結果：互動與圖層正確性需 L3 或標「待人工目視」，不推估。
- 點位資料來源、欄位（經緯度欄名、座標系）寫進 SPEC 的 Data 節；不確定的座標系標 `[SA 確認]`。
