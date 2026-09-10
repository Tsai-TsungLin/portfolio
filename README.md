# portfolio — relexes.com 個人作品網站

奶茶色系的單頁作品集 + 一頁可列印履歷。Go 單一 binary 把 `internal/site/web/` 內嵌進去，沒有資料庫、沒有後台。

| 路徑 | 內容 |
|---|---|
| `/` | 作品、架構、技能、經歷、關於、聯絡 |
| `/resume.html` | 履歷（網頁版不放電話與地址） |
| `/health` | 探測用，回 `ok` |

## 本機開發

```bash
ADDR=:8094 go run ./cmd/portfolio        # http://localhost:8094
go build ./... && go vet ./... && go test -race ./...
```

靜態檔是編譯期 embed，改了 HTML / CSS / JS 要重跑 `go run`。

### 產出給 104 用的履歷 PDF

網頁版刻意不放電話；PDF 從本機另外產出，把電話塞進 `.pdf-only` 再用無頭 Chrome 列印：

```bash
OUT=/tmp/resume-pdf && rm -rf $OUT && cp -r internal/site/web $OUT
sed -i '' 's|<span class="pdf-only"></span>|<span>0978-380-555</span>|' $OUT/resume.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --no-pdf-header-footer --print-to-pdf=$HOME/Downloads/蔡宗霖-履歷.pdf "file://$OUT/resume.html"
```

## 部署（GCP VM `line-bot`，與其他服務同機）

1. 本機交叉編譯：`CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o deploy/portfolio ./cmd/portfolio`
2. `deploy/` 整包 scp 到 VM `~/lex/portfolio/deploy/`，`docker compose up -d --build`
3. 容器 `portfolio-app-1`、`127.0.0.1:8094`、`mem_limit: 64m`、掛 `lexnet`
4. 部署後：`curl -s localhost:8094/health`、`docker ps`、看 log；**再到 lex-console 的 `services.yaml` 登記**，並更新 `../.claude/rules/infra.md` 的容器表
5. nginx 切換見下一節；**切完每個受影響的網址都要實際開一次**

## 網域整理（2026-09-10 已完成）

已切換：`relexes.com` 根網域給個人網站；原本掛在根網域底下的服務搬到子網域，比照 `court.relexes.com`。

**使用者已指定不搬的路徑**：`/tools/`（excel-tools）、`/line/` 與 `/google/callback`（hermes，改網址要動 LINE 與 Google 後台，不值得）。`/proposal` 靜態頁也維持原樣。

| 切換前 | 切換後 | 動了什麼 |
|---|---|---|
| `relexes.com/` → scanNBA | `relexes.com/` → **portfolio** | nginx `location /` 改指 8094 |
| `relexes.com/nba/` `/mlb/` `/kbo/` `/health` → scanNBA | `sports.relexes.com/nba/` … | Cloudflare A 記錄（橘雲）、certbot 憑證、新 server block；scanNBA 的 LINE Webhook URL 與 LIFF Endpoint 已在 LINE Developers 改到新網域，`config.yaml` 的 `base_url` 同步改；app 內部路徑不用改（仍是 `/nba/dashboard`） |
| `relexes.com/trader/` `/ws` → taiex-trader | `trader.relexes.com/` | 同上；taiex 前端 base 從 `/trader/` 改為 `/` 重新 build 上傳，`/ws` 在根路徑 |
| `/tools/`、`/line/`、`/google/callback`、`/proposal` | 不變 | 原 location 原樣保留在 `relexes.com` 區塊（見 `deploy/nginx-relexes.conf`） |

當時的切換順序（避免空窗）：

1. 先建好 `scan.` 與 `trader.` 兩個子網域（DNS → certbot → nginx），此時舊路徑仍在，兩邊並行可用
2. 改 LINE Developers 的 scanNBA webhook 到新網域，確認推播正常
3. 重建 taiex 前端（base path `/`）並上傳，確認 `trader.relexes.com` 正常
4. 最後把 `relexes.com` 的 `location /` 改指 portfolio，移除 `/nba/ /mlb/ /kbo/ /trader/ /ws /health` 六條 location
5. lex-console 的服務連結與 `infra.md` 的 Cloudflare 網域表同步更新

注意 `sites-enabled/relexes.com` 是實體檔不是 symlink，改 `sites-available` 不會生效（見 `infra.md`）。
