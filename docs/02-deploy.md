# portfolio 部署與維運

建置、部署、nginx 與履歷 PDF。機型、埠號、容器名、`mem_limit`、Cloudflare 設定一律見 `../../.claude/rules/infra.md`，這裡不複製數字。

目錄：§1 建置與部署 · §2 nginx 與網域 · §3 履歷 PDF · §4 部署後確認 · §5 履歷同步到 104／Cake／LinkedIn · §6 GitHub Actions 部署

## §1 建置與部署

一支 `scripts/deploy.sh` 做完全部：本機測試 → 交叉編譯 → scp `deploy/` 到 VM → `docker compose up -d --build` → 打 `/health`。

```bash
bash scripts/deploy.sh > /tmp/deploy-portfolio.log 2>&1 &   # 耗時，一律背景執行
```

- binary 是 `CGO_ENABLED=0 GOOS=linux GOARCH=amd64`，靜態頁已經 embed 在裡面，VM 上不跑任何 build 工具鏈。
- `deploy/docker-compose.yml` 的 `name: portfolio` 不可拿掉：各服務的 compose 都放在自己的 `deploy/` 底下，沒設 `name` 會全部叫 `deploy` 互相頂掉（見 `infra.md`）。
- 容器只綁 loopback，對外經主機 nginx；同時掛 `lexnet` 讓 lex-console 探得到 `/health`。
- 腳本只部署容器，nginx 切換是另一件事（見 §2）。
- 另一條路是 GitHub Actions 的 `deploy` workflow（§6），不需要本機；兩條路部署的結果相同。

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

## §5 履歷同步到 104／Cake／LinkedIn

網站加了新作品或履歷頁有改，三個求職站要跟著補，不然對外的履歷會少一個專案。站長自己登入，Claude 在已登入的分頁填入、站長按儲存；不交帳密、不用機器登入（LinkedIn 禁自動化、104／Cake 有驗證碼）。

| 站 | 加在哪 | 內容來源 |
|---|---|---|
| 104 | 「專案成就」新增一筆（名稱、起始年月、仍在進行、說明、連結）；「自傳」中英文兩段的個人專案列舉也補一句 | 首頁卡片的 `card-sum` 與 `card-detail`、履歷頁 `resume.html` 那一筆 |
| Cake | 履歷編輯器「專案 / 作品集 N」接在最後一筆後面（名稱、期間、描述、連結）；「自我介紹」第二段的專案列舉補一句；改完要按「發布」，只存草稿對外看不到 | 同上，格式照前一筆 |
| LinkedIn | 新增專案表單 `/in/lextsai/edit/forms/project/new/`：英文名稱、Description（含連結）、Currently working、起始年月 | 履歷頁的 English Summary 語氣改寫 |

順序：先改網站（卡片、履歷頁、架構圖）→ 部署 → 再同步三站，文案才有單一來源。做完在 `PROGRESS.md` 該作品那列備註「三站已同步 + 日期」。

## §6 GitHub Actions 部署

`.github/workflows/deploy.yml` 以 `workflow_dispatch` 觸發，輸入要部署的 commit（完整 40 碼，必須已在 master 上）：測試 → 交叉編譯 → 把 `portfolio`、`Dockerfile`、`docker-compose.yml` 打成 tar 經 SSH 送給 VM 上的守門腳本（lex repo `ops/deploy-gate.sh`）→ 腳本放檔、`docker compose up -d --build`、打 `/health`，把 commit 寫進 VM 部署目錄的 `.deployed-sha`。

- 平常由 lex-console 發現 master 有新 commit 時在 Telegram 問「部署／略過」，按了才觸發；也可在 GitHub 網頁或 `gh workflow run deploy -R Tsai-TsungLin/portfolio -f sha=<sha>` 手動跑。
- secrets：`DEPLOY_SSH_KEY`（這個 repo 專用的 key，VM `authorized_keys` 以 `command="…/deploy-gate.sh portfolio"` 綁死，只能部署 portfolio、沒有 shell 與 port forwarding）、`DEPLOY_KNOWN_HOSTS`（VM 的 ed25519 host key）。
- repo 是公開的，Actions log 也公開；部署 log 只含守門腳本的結果，不含任何機密。
- 退回舊版：用同一個 workflow 指定 master 上較早的 commit。

