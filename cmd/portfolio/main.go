// portfolio：relexes.com 個人作品網站。純靜態頁內嵌進 binary，沒有資料庫、沒有後台。
//
// 環境變數：
//
//	ADDR  監聽位址（預設 :8080）
package main

import (
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/Tsai-TsungLin/portfolio/internal/site"
)

func main() {
	addr := os.Getenv("ADDR")
	if addr == "" {
		addr = ":8080"
	}
	srv := &http.Server{
		Addr:              addr,
		Handler:           site.Handler(),
		ReadHeaderTimeout: 5 * time.Second,
	}
	slog.Info("portfolio 啟動", "addr", addr)
	if err := srv.ListenAndServe(); err != nil {
		slog.Error("server 結束", "err", err)
		os.Exit(1)
	}
}
