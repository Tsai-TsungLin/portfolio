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
