# CHANGELOG

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
