# portfolio — relexes.com 個人作品網站

奶茶色系的單頁作品集＋一頁可列印履歷＋六張互動式架構圖。Go 單一 binary 把 `internal/site/web/` 內嵌進去，沒有資料庫、沒有後台。

線上：<https://relexes.com/>（履歷 `/resume.html`、架構圖總覽 `/architecture.html`）

## 開發

```bash
ADDR=:8094 go run ./cmd/portfolio      # 本機用哪個埠都行
go build ./... && go vet ./... && go test -race ./...
```

靜態檔是編譯期 embed，改了 HTML / CSS / JS 要重跑 `go run` 才看得到。

## 文件

| 檔案 | 放什麼 |
|---|---|
| [CLAUDE.md](CLAUDE.md) | 硬性規則（改程式前先看） |
| [docs/01-design.md](docs/01-design.md) | 契約：路由、快取、靜態資源、版面、履歷頁、架構圖產線 |
| [docs/02-deploy.md](docs/02-deploy.md) | 部署與維運：deploy.sh、nginx 與網域、履歷 PDF、部署後確認 |
| [docs/PROGRESS.md](docs/PROGRESS.md) | 需求清單與狀態、發版紀錄 |
| [CHANGELOG.md](CHANGELOG.md) | 每一次改了什麼，一個日期一段 |
| [../.claude/rules/infra.md](../.claude/rules/infra.md) | 機型、埠號、容器名、Cloudflare（唯一來源） |

## 結構

| 目錄 | 內容 |
|---|---|
| `cmd/portfolio` | 進入點，只讀 `ADDR` |
| `internal/site` | embed、路由、快取標頭、資源版號 |
| `internal/site/web` | 靜態頁、`assets/` 圖片、`arch/` 架構圖產物 |
| `docs/arch` | 架構圖的 JSON 規格（不 embed） |
| `deploy` | Dockerfile、compose、nginx 設定正本 |
| `scripts/deploy.sh` | 交叉編譯 → scp → compose up → 打 `/health` |
