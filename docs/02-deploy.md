# portfolio 部署與維運

建置、部署、nginx 與履歷 PDF。機型、埠號、容器名、`mem_limit`、Cloudflare 設定一律見 `../../.claude/rules/infra.md`，這裡不複製數字。

目錄：§1 建置與部署 · §2 nginx 與網域 · §3 履歷 PDF · §4 部署後確認

## §1 建置與部署

一支 `scripts/deploy.sh` 做完全部：本機測試 → 交叉編譯 → scp `deploy/` 到 VM → `docker compose up -d --build` → 打 `/health`。

```bash
bash scripts/deploy.sh > /tmp/deploy-portfolio.log 2>&1 &   # 耗時，一律背景執行
```

- binary 是 `CGO_ENABLED=0 GOOS=linux GOARCH=amd64`，靜態頁已經 embed 在裡面，VM 上不跑任何 build 工具鏈。
- `deploy/docker-compose.yml` 的 `name: portfolio` 不可拿掉：各服務的 compose 都放在自己的 `deploy/` 底下，沒設 `name` 會全部叫 `deploy` 互相頂掉（見 `infra.md`）。
- 容器只綁 loopback，對外經主機 nginx；同時掛 `lexnet` 讓 lex-console 探得到 `/health`。
- 腳本只部署容器，nginx 切換是另一件事（見 §2）。

## §2 nginx 與網域

`relexes.com` 的 `location /` 指向本服務，其餘四條路徑刻意留給別的服務，正本在 `deploy/nginx-relexes.conf`。

| 路徑 | 去向 |
|---|---|
| `/` | portfolio |
| `/tools/`、`/tools/excel/inspect` | excel-tools |
| `/proposal` | 靜態頁 |
| `/line/`、`/google/callback` | 主機上的 Python hermes-agent |

- 這四條不搬到子網域是刻意的決定：要改 LINE 與 Google 後台的回呼設定，不值得。
- **VM 上 `sites-enabled/relexes.com` 是實體檔不是 symlink**，改 `sites-available/` 的同名檔完全不會生效而且不會報錯。一律直接編輯 `sites-enabled/` 底下那一份，改完 `sudo grep -cE '^\s*location' <檔案>` 對一下條數。
- 改網域或埠號之後同一輪要做完三件事：每個受影響的網址用瀏覽器實際開一次、lex-console 的 `services.yaml` 更新、`infra.md` 的容器表與網域表更新。

## §3 履歷 PDF（給 104 用）

網頁版刻意不放電話（見 `01-design.md` §5），要給 104 的 PDF 從本機另外產：把電話塞進 `.pdf-only` 再用無頭 Chrome 列印。

```bash
OUT=/tmp/resume-pdf && rm -rf $OUT && cp -r internal/site/web $OUT
sed -i '' 's|<span class="pdf-only"></span>|<span>0978-380-555</span>|' $OUT/resume.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --no-pdf-header-footer --print-to-pdf=$HOME/Downloads/蔡宗霖-履歷.pdf "file://$OUT/resume.html"
```

改完的 `$OUT` 是暫存副本，不要回寫進 repo。

## §4 部署後確認

deploy.sh 跑完不等於成功，要自己確認三件事：

1. `curl -s localhost:<對外埠>/health` 回 `ok`、`docker ps` 看到容器 running（容器名與埠號見 `../../.claude/rules/infra.md`）。
2. 瀏覽器實際開 `https://relexes.com/`、`/resume.html`、`/architecture.html` 與任一張架構圖，看畫面與 console 沒有錯誤。
3. lex-console 的 `services.yaml` 有這個服務且探測是綠的。
