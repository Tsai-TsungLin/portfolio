# portfolio — relexes.com 個人網站

Go 單一 binary 內嵌靜態頁（`internal/site/web/`），沒有資料庫、沒有後台、沒有 build 工具鏈。
理由與現行行為在 `docs/01-design.md`（底下的 `§` 都指它），部署在 `docs/02-deploy.md`，需求狀態在 `docs/PROGRESS.md`。

> 遵循上層 `lex/CLAUDE.md` 與 `lex/.claude/rules/` 的共用規範。

## 開發

```bash
ADDR=:8094 go run ./cmd/portfolio      # 本機用哪個埠都行；線上埠號見 ../.claude/rules/infra.md
go build ./... && go vet ./... && go test -race ./...
```

改任何頁面都要實際開瀏覽器看（首頁各區塊、分類篩選、卡片展開、履歷頁、手機寬度），不是只跑測試（§4）。

## 硬性規則

- 靜態檔改完要 `go build` 才會重新 embed；看到舊內容先確認是不是沒重編（§3）
- HTML 裡的 `style.css?v=dev`、`app.js?v=dev` 由 `site.go` 啟動時換成內容雜湊，不要手改版號（§2）
- HTML / CSS / JS 一律 `no-cache`，只有 `/assets/` 快取一天；非既有檔案的路徑回 404，不 fallback 到首頁（§1、§2）
- 圖片放 `web/assets/`，同時提供 `.webp` 與 `.jpg`（`cwebp -q 80`），HTML 用 `<picture>`（§3）
- 依賴 JS 才顯示的樣式一律掛在 `.js` 底下（`<html class="no-js">` 由 head 的 inline script 切成 `js`），無 JS 也要看得到內容（§4）
- 灰字對比度維持 4.5:1 以上，互動元素最小觸控目標 44px（§4）
- 作品卡片不連結到實際服務頁面，只放說明與截圖（§4）
- 網頁版履歷不放電話與地址；要給 104 的 PDF 另外從本機產出（§5、`02-deploy.md` §3）
- `web/arch/*.html` 是 archify 從 `docs/arch/` 的 JSON 規格編譯出來的產物，**一律不手改**：改內容要改規格再重跑 `validate` → `deliver` → `visual-check`，三個都 `ok: true` 且 `grep -c '>Legend<'` 等於 1 才算過（§6）
- 架構圖規格放在 `web/` 之外，不要 embed；配色一律 `meta.visual_preset: "editorial"`，不在產出後覆寫 `:root`（§3、§6）
- 新增一張架構圖要同步三處：總覽頁加一列、該作品卡片的 `card-role` 加連結、`01-design.md` §6 的表加一列
- 架構圖的 viewBox 有尺寸上下限（太寬字太小、太高會溢出、太矮 legend 會被靜默拿掉）；卡片三張、每張三條（§6.1）
- `deploy/docker-compose.yml` 的 `name: portfolio` 不可拿掉，否則會和別的服務互頂（`02-deploy.md` §1）
- VM 上 `sites-enabled/relexes.com` 是實體檔不是 symlink，改 `sites-available/` 不會生效也不會報錯（`02-deploy.md` §2）
- 部署後要在 lex-console 的 `services.yaml` 登記這個服務，並更新 `../.claude/rules/infra.md` 的容器表與網域表
- 機型、埠號、容器名、`mem_limit`、Cloudflare 設定一律寫「見 `../.claude/rules/infra.md`」，不在這個 repo 複製數字
- 發版時只做三件事：`CHANGELOG.md` 加一段、`docs/PROGRESS.md` 對應需求列填上線日期、發版紀錄加一行
- **新增作品卡片或改履歷頁後，同一輪要提醒站長把 104／Cake／LinkedIn 三站的履歷一起補上**，不能只改網站；做法與各站要填哪裡見 `02-deploy.md` §5
