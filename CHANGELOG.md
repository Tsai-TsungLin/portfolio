# CHANGELOG

每一次改了什麼。固定三小節：**使用者看得到的／站長的後台／內部與文件**，沒有就寫「—」。
這個 repo 沒有版本 tag，所以用部署日期分段。需求本身做到哪裡、哪些決定不做，看 `docs/PROGRESS.md`。

## 未發版

使用者看得到的：—

站長的後台：—

內部與文件：

- 新增 `ci` workflow：push 與 PR 自動跑 build、vet、test，每個 commit 顯示檢查結果

## 2026-09-23

使用者看得到的：

- 履歷頁「個人專案」最前面加入 AI 應用平台（共用 LLM 閘道、跨服務 OpenTelemetry 追蹤、故障分診 agent、MCP server）
- 摘要與英文 Summary 補一句 LLM 應用工程方向；技能加「AI 應用」一列；多聯盟盤口系統補 AI 推薦改機率與評估工具
- 作品卡片：共用 AI 服務補 LLM 閘道、跨服務追蹤與 MCP 工具箱；總控台補 AI 故障分診；多聯盟盤口系統補 AI 推薦改機率，並拿掉已不存在的共用元件庫說法

站長的後台：—

內部與文件：

- 新增 GitHub Actions 部署（`deploy` workflow）：手動觸發、只部署 master 上的 commit，經 VM 守門腳本放檔重啟；本機 `deploy.sh` 保留；lex-console 發現 master 有新 commit 會在 Telegram 問「部署／略過」，按部署才觸發

## 2026-09-22

使用者看得到的：

- 作品列表加入款款欸 行李小助手（商業產品分類），專案數 10 → 11
- 新增 `/arch/kuankuana.html`：標出訪客資料先存裝置、登入時匯入帳號，以及事件先落地再由背景 worker 增量彙總；入口在作品卡片細節與架構圖總覽
- 履歷頁「個人專案」加入同一項

站長的後台：—

內部與文件：

- 截圖 `assets/kuankuana.{webp,jpg}` 取自正式站手機版（390 寬）的首頁與清單頁，兩張並排
- 文件改成四類：`CLAUDE.md` 只留規則、`docs/01-design.md` 是契約、`docs/02-deploy.md` 是部署維運、`docs/PROGRESS.md` 是需求清單與發版紀錄；README 收成索引，2026-09-10 網域整理的過程紀錄移除，只在 PROGRESS 留一列

## 現況（2026-09-22）

線上是 `https://relexes.com/` 的單頁作品集＋`/resume.html` 可列印履歷＋`/architecture.html` 與六張互動式架構圖，Go 單一 binary 內嵌靜態頁，沒有資料庫也沒有後台。

## 2026-09-17

使用者看得到的：

- 羽球輪換架構圖補上一直漏畫的 Telegram 通道（待回留言、AI 配額用完、排程發布失敗）
- 卡片改寫：草稿可排程發布、發文前先鎖定防重複、讀者留言由 AI 擬回覆待審

站長的後台：—

內部與文件：

- Threads 移到服務正上方、claude-agent 移到右下，兩條外部呼叫不再共用同一條通道

## 2026-09-16

使用者看得到的：

- 新增 `/arch/trip.html`：標出寫回與輪詢兩個方向的不同觸發方式，以及圖片代理與磁碟快取
- 入口兩處：作品卡片細節與架構圖總覽

站長的後台：—

內部與文件：—

## 2026-09-15

使用者看得到的：

- 作品列表加入 Notion 旅遊行程同步（自動化與基礎設施分類），專案數 9 → 10
- 履歷頁「個人專案」加入同一項

站長的後台：—

內部與文件：

- 截圖 `assets/trip.{webp,jpg}` 用 mock 資料拍攝

## 2026-09-14

使用者看得到的：

- 新增 `/architecture.html` 總覽，Architecture 區塊改連到總覽；各作品卡片細節直接連到自己的圖
- 新增多聯盟系統、飲料 POS、拾光、羽球輪換的架構圖與台指期「一筆進場」的時序圖
- 架構圖可搜尋節點、追上下游、切 4 組導覽視角，單檔自包含無外部資源

站長的後台：—

內部與文件：

- 規格放 `docs/arch/`，由 archify 編譯；配色用 editorial preset（底 #f2eee5）對齊站上奶茶色
- scanNBA 那張標題縮短、viewBox 收到 670 以保住 legend；binary 從 9.13MB 增至 9.96MB

## 2026-09-10

使用者看得到的：

- 個人作品網站接管 `relexes.com` 根網域；scanNBA 與 taiex 分別搬到 `sports.` 與 `trader.` 子網域
- 版面改為左欄固定（名字、導覽、社群）＋右欄列表，左欄導覽跟著捲動高亮
- 作品改為「縮圖＋一段話＋標籤」列表，分類篩選與細節 modal 保留；沒截圖的五個作品補示意圖
- 無 JS 時內容照常顯示；灰字對比度提高到 4.5:1；窄螢幕時間軸改區塊排版，補手機版選單
- 履歷補上威智架構優化、千萬筆效能數字、專案使用規模與起始日期、英文摘要、Excel 技能

站長的後台：—

內部與文件：

- 圖片改 WebP（JPEG 備援），首屏兩張不 lazy；加 og:image、canonical
- Google Fonts 改非同步載入，只留 Noto Sans TC 與 Fraunces，等寬字用系統字型
- css / js 網址帶內容雜湊（啟動時注入），避免 Cloudflare 邊緣快取住舊檔；HTML / CSS / JS 一律 no-cache
- 履歷頁改用共用 app.js，移除 inline script；GitHub repo 轉為公開
