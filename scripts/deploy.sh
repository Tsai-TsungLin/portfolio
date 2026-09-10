#!/usr/bin/env bash
# 本機交叉編譯 → scp deploy/ 到 VM → docker compose up → 確認 /health。
# 只部署容器（127.0.0.1:8094），nginx 切換另外做（見 README「網域整理」）。
set -euo pipefail
cd "$(dirname "$0")/.."
VM=line-bot; ZONE=asia-east1-b; REMOTE='~/lex/portfolio/deploy'   # 單引號：~ 要留給 VM 那端展開
GO111MODULE=on go test ./... >/dev/null
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 GO111MODULE=on go build -ldflags="-s -w" -o deploy/portfolio ./cmd/portfolio
gcloud compute ssh $VM --zone=$ZONE --command="mkdir -p $REMOTE"
gcloud compute scp deploy/portfolio deploy/Dockerfile deploy/docker-compose.yml $VM:$REMOTE/ --zone=$ZONE
gcloud compute ssh $VM --zone=$ZONE --command="cd $REMOTE && docker compose up -d --build 2>&1 | tail -3 && sleep 2 && curl -sf localhost:8094/health && echo && docker ps --format '{{.Names}} {{.Status}}' | grep portfolio"
rm -f deploy/portfolio
