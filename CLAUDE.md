# portfolio — relexes.com 個人網站

Go 單一 binary 內嵌靜態頁（`internal/site/web/`），沒有資料庫、沒有後台、沒有 build 工具鏈。

> 遵循上層 `lex/CLAUDE.md` 與 `lex/.claude/rules/` 的共用規範。

## 開發

```bash
ADDR=:8094 go run ./cmd/portfolio      # http://localhost:8094 、 /resume.html 、 /health
go build ./... && go vet ./... && go test -race ./...
```

改任何頁面都要實際開瀏覽器看（首頁各區塊、分類篩選、卡片展開、履歷頁、手機寬度），不是只跑測試。

## 硬性規則

- 網頁版履歷不放電話與地址；要給 104 的 PDF 另外從本機產出（見 README）
- 作品卡片不連結到實際服務頁面，只放說明與截圖
- 靜態檔改動後 `go build` 才會重新 embed；瀏覽器看到舊內容先確認是不是沒重編
- HTML 裡的 `style.css?v=dev`、`app.js?v=dev` 由 site.go 啟動時換成內容雜湊，不要手改版號
- 圖片放 `assets/`，同時提供 `.webp` 與 `.jpg`（`cwebp -q 80`），HTML 用 `<picture>`
- 依賴 JS 才顯示的樣式一律掛在 `.js` 底下（`<html class="no-js">` 由 head 的 inline script 切成 `js`），無 JS 也要看得到內容
- 部署後要在 lex-console 的 `services.yaml` 登記這個服務，並更新 `../.claude/rules/infra.md` 的容器表
- `web/arch/*.html` 是 archify 從 JSON 規格編譯出來的產物，**一律不手改**：改內容要改規格再重跑 `validate` → `deliver` → `visual-check`（規格與流程見下節）

## 架構圖頁

`/architecture.html` 是手寫的總覽頁（沿用 `style.css`），列出有架構圖的服務。`web/arch/<name>.html` 由全域 skill `archify`（`~/.agents/skills/archify`）從 `docs/arch/` 的 JSON 規格編譯而來，單檔自包含、無外部資源。規格檔刻意放在 `web/` 之外，不要 embed 出去。

| 頁面 | 規格 | 圖型 |
|---|---|---|
| `arch/scannba.html` | `docs/arch/scannba.architecture.json` | architecture |
| `arch/drinkpos.html` | `docs/arch/drinkpos.architecture.json` | architecture |
| `arch/shiguang.html` | `docs/arch/shiguang.architecture.json` | architecture |
| `arch/badminton.html` | `docs/arch/badminton.architecture.json` | architecture |
| `arch/taiex.html` | `docs/arch/taiex.sequence.json` | sequence |
| `arch/trip.html` | `docs/arch/trip.architecture.json` | architecture |

```bash
A=~/.agents/skills/archify/bin/archify.mjs   # <type> 為 architecture 或 sequence
node $A validate <type> docs/arch/<spec>.json --quality showcase --json
node $A deliver  <type> docs/arch/<spec>.json internal/site/web/arch/<name>.html --quality showcase --json
node $A visual-check internal/site/web/arch/<name>.html --json
grep -c '>Legend<' internal/site/web/arch/<name>.html   # 必須是 1
```

三個指令都要 `ok: true`，legend 要是 1 才算過。圖是**快照不是活文件**，服務架構有變才重跑。新增一張圖要同步：總覽頁加一列、該作品卡片的 `card-role` 加連結、上表加一列。

配色一律 `meta.visual_preset: "editorial"`（底色 `#f2eee5` 貼近站上 `#f1e7db`）。規格沒有顏色欄位，不要在產出後覆寫 `:root`——會破壞產物的 SHA 收據。

踩過的坑（字太小會被 `validate` 擋下；溢出只有 `visual-check` 抓得到；legend 消失兩者都不報，只能 grep）：

- **viewBox 太寬 → 字太小**：1440 桌面寬下圖面只有 930px，節點副標（architecture 9px、sequence 7px）投影後要 ≥ 6px。architecture 寬度上限約 1395，sequence 約 1085
- **viewBox 太窄或太高 → 桌面垂直溢出**：寬高比低於約 1.9 在 1440×900 就會撐破。sequence 天生偏高，訊息控制在 9 條左右
- **viewBox 高度不足 → legend 被靜默拿掉**，validate 與 visual-check 都還是綠的，所以要 grep 確認
- 卡片三張、每張三條；四張會換到第二列撐破版面，句子過長也會
- 兩個節點間距小於標籤寬度時，標籤移到線上方或下方前，先看那個位置有沒有別條線的垂直段
