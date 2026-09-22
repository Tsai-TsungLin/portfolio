# portfolio 契約

現行行為、路由、資源與產線。每節第一句是結論，`§` 編號不重排（`CLAUDE.md` 靠它指路）。

目錄：§1 路由與頁面 · §2 HTTP 行為與快取 · §3 靜態資源與圖片 · §4 版面與漸進增強 · §5 履歷頁 · §6 架構圖產線

## §1 路由與頁面

站上只有五組路徑，全部由 `internal/site/site.go` 的 `Handler()` 提供，沒有資料庫也沒有後台。

| 路徑 | 內容 |
|---|---|
| `/` | 作品、架構、技能、經歷、關於、聯絡（＝`/index.html`） |
| `/resume.html` | 履歷，可直接列印（見 §5） |
| `/architecture.html` | 架構圖總覽，手寫頁面、沿用 `style.css` |
| `/arch/*.html` | 各服務互動式架構圖，archify 產物（見 §6） |
| `/health` | 回純文字 `ok`，給 docker healthcheck 與 lex-console 探測 |

非根路徑且 embed 裡沒有對應檔案的請求一律 404，不 fallback 到首頁——單頁站沒有前端路由，fallback 只會讓打錯的網址看起來像正常頁。`GET` / `HEAD` 以外的方法回 405。

## §2 HTTP 行為與快取

HTML / CSS / JS 一律 `no-cache`，只有 `/assets/` 底下的圖片快取一天。

- `style.css` 與 `app.js` 的網址帶內容雜湊：`Handler()` 啟動時以兩檔內容算 SHA-256 取前 10 碼，把 HTML 裡的 `?v=dev` 換成 `?v=<hash>`。改版後網址跟著變，Cloudflare 邊緣與瀏覽器的舊快取自然失效，所以版號不能手寫。
- 只有 `index.html`、`resume.html`、`architecture.html` 會被替換版號；`arch/*.html` 是自包含單檔，沒有外部資源要帶版號。
- 每個回應都帶 `X-Content-Type-Options: nosniff` 與 `Referrer-Policy: strict-origin-when-cross-origin`。
- 對外走 Cloudflare 橘雲與主機 nginx，設定見 `02-deploy.md` §2。

## §3 靜態資源與圖片

`internal/site/web/` 底下的東西是編譯期 embed 進 binary 的，改完要 `go build`（或重跑 `go run`）才會生效——瀏覽器看到舊內容時先確認是不是沒重編。

- 圖片放 `web/assets/`，同時提供 `.webp` 與 `.jpg`（`cwebp -q 80`），HTML 用 `<picture>` 讓不支援的瀏覽器落回 JPEG。首屏兩張不 lazy。
- Google Fonts 非同步載入，只留 Noto Sans TC 與 Fraunces，等寬字用系統字型。
- 架構圖的 JSON 規格放 `docs/arch/`，刻意在 `web/` 之外，不會被 embed 出去。

## §4 版面與漸進增強

版面是左欄固定（名字、導覽、社群）＋右欄列表，左欄導覽跟著捲動高亮；作品是「縮圖＋一段話＋標籤」的列表，有分類篩選與細節 modal。

- 依賴 JS 才成立的樣式一律掛在 `.js` 底下：`<html class="no-js">` 由 head 的 inline script 換成 `js`。沒有 JS 時內容照常顯示，只是沒有篩選與 modal。
- 灰字對比度維持 4.5:1 以上（WCAG 2.1 AA），互動元素最小觸控目標 44px。
- 作品卡片只放說明與截圖，不連到實際服務頁面：那些站各有自己的狀態與可用性，作品集不替它們背書。
- 頁面改動要實際開瀏覽器走一遍（首頁各區塊、分類篩選、卡片展開、履歷頁、手機寬度），跑測試不算驗證。

## §5 履歷頁

網頁版履歷不放電話與地址，只留 Email 與社群連結——那一頁是公開可索引的。

- 電話的位置在 HTML 裡是一個空的 `<span class="pdf-only"></span>`，只有本機產 PDF 時才填值，產出步驟見 `02-deploy.md` §3。
- 履歷頁與首頁共用 `app.js` 與導覽列，沒有 inline script。
- 履歷內容與 104 上的版本同步（經歷、專案規模、起始日期、英文摘要）。

## §6 架構圖產線

`web/arch/*.html` 是全域 skill `archify`（`~/.agents/skills/archify`）從 `docs/arch/` 的 JSON 規格編譯出來的產物，一律不手改：改內容改規格再重跑，手改會讓產物與規格對不起來，下次重編又被蓋掉。

| 頁面 | 規格 | 圖型 |
|---|---|---|
| `arch/scannba.html` | `docs/arch/scannba.architecture.json` | architecture |
| `arch/drinkpos.html` | `docs/arch/drinkpos.architecture.json` | architecture |
| `arch/shiguang.html` | `docs/arch/shiguang.architecture.json` | architecture |
| `arch/badminton.html` | `docs/arch/badminton.architecture.json` | architecture |
| `arch/taiex.html` | `docs/arch/taiex.sequence.json` | sequence |
| `arch/trip.html` | `docs/arch/trip.architecture.json` | architecture |
| `arch/kuankuana.html` | `docs/arch/kuankuana.architecture.json` | architecture |

```bash
A=~/.agents/skills/archify/bin/archify.mjs   # <type> 為 architecture 或 sequence
node $A validate <type> docs/arch/<spec>.json --quality showcase --json
node $A deliver  <type> docs/arch/<spec>.json internal/site/web/arch/<name>.html --quality showcase --json
node $A visual-check internal/site/web/arch/<name>.html --json
grep -c '>Legend<' internal/site/web/arch/<name>.html   # 必須是 1
```

三個指令都要 `ok: true`、legend 要剛好 1 才算過。圖是**快照不是活文件**，服務架構真的變了才重跑。新增一張圖要同步三處：總覽頁加一列、該作品卡片的 `card-role` 加連結、上表加一列。

配色一律 `meta.visual_preset: "editorial"`（底色 `#f2eee5`，貼近站上的 `#f1e7db`）。規格沒有顏色欄位，也不要在產出後覆寫 `:root`——那會破壞產物的 SHA 收據。

### §6.1 尺寸限制（validate 與 visual-check 各抓一半）

字太小只有 `validate` 擋得下，溢出只有 `visual-check` 抓得到，legend 消失兩者都不報：

- **viewBox 太寬 → 字太小**：1440 桌面寬下圖面只有 930px，節點副標（architecture 9px、sequence 7px）投影後要 ≥ 6px。architecture 寬度上限約 1395，sequence 約 1085。
- **viewBox 太窄或太高 → 桌面垂直溢出**：寬高比低於約 1.9 在 1440×900 就會撐破。sequence 天生偏高，訊息控制在 9 條左右。
- **viewBox 高度不足 → legend 被靜默拿掉**，validate 與 visual-check 都還是綠的，只能靠 `grep -c '>Legend<'` 確認。
- 卡片三張、每張三條：四張會換到第二列撐破版面，句子過長也會。
- 兩個節點間距小於標籤寬度時，把標籤移到線的上方或下方之前，先看那個位置有沒有別條線的垂直段。
