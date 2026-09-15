# CHANGELOG

## 2026-09-15 新增作品：Notion 旅遊行程同步網頁
- 作品列表加入 trip（自動化與基礎設施分類），專案數 9 → 10，截圖 `assets/trip.{webp,jpg}` 用 mock 資料拍攝
- 履歷頁「個人專案」加入同一項

## 2026-09-14 架構圖總覽與五個服務的互動式架構圖
- 新增 `/architecture.html` 總覽，Architecture 區塊改連到總覽；各作品卡片細節直接連到自己的圖
- 新增飲料 POS、拾光、羽球輪換（架構圖）與台指期（一筆進場的時序圖），規格在 `docs/arch/`

## 2026-09-14 多聯盟系統互動式架構圖
- 新增 `/arch/scannba.html`：可搜尋節點、追上下游、切 4 組導覽視角的單檔互動架構圖，由 archify 從 `docs/arch/scannba.architecture.json` 編譯
- 入口兩處：Architecture 區塊的「實際案例」連結，以及多聯盟系統作品卡片細節裡的連結
- 配色用 archify 的 editorial preset（底 #f2eee5）對齊站上奶茶色，標題縮短、viewBox 收到 670 以保住 legend
- 圖檔自包含無外部資源（817KB），binary 從 9.13MB 增至 9.96MB

## 2026-09-10 部署 — 改版為左欄固定導覽
- 版面改為左欄固定（名字、導覽、社群）＋右欄列表；左欄導覽跟著捲動高亮
- 作品改為「縮圖 + 一段話 + 標籤」列表，分類篩選與細節 modal 保留
- 無 JS 時內容照常顯示（html.js 開關）；灰字對比度提高到 4.5:1
- 圖片改 WebP（JPEG 備援），首屏兩張不 lazy；加 og:image、canonical
- Google Fonts 改非同步載入，只留 Noto Sans TC 與 Fraunces，等寬字用系統字型
- 履歷頁改用共用 app.js，移除 inline script

## 2026-09-10 版面修正與履歷同步
- 作品「細節」改開 modal，卡片高度一致；沒截圖的五個作品依名稱製作示意圖，拾光用 App icon 製圖
- 桌面版時間軸明確指定欄位，窄螢幕改為區塊排版；履歷頁導覽列與首頁一致，補手機版選單
- css / js 網址帶內容雜湊（啟動時注入），避免 Cloudflare 邊緣快取住舊檔；HTML / CSS / JS 一律 no-cache
- 履歷補上威智架構優化、千萬筆效能數字、專案使用規模與起始日期、英文摘要、Excel 技能
- GitHub repo 轉為公開

## 2026-09-10 上線
- 個人作品網站接管 `relexes.com` 根網域；scanNBA 與 taiex 分別搬到 `sports.` 與 `trader.` 子網域
