// Package site 把 web/ 底下的靜態檔內嵌進 binary 並提供 HTTP handler。
package site

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"
)

//go:embed web
var webFS embed.FS

// Handler 回傳整個網站的路由：/ 靜態頁、/health 探測用。
func Handler() http.Handler {
	sub, err := fs.Sub(webFS, "web")
	if err != nil {
		panic(err) // embed 內容是編譯期固定的，這裡失敗只會是程式寫錯
	}
	files := http.FileServer(http.FS(sub))

	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		_, _ = w.Write([]byte("ok"))
	})
	mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		// 只有一頁：非根路徑、非既有檔案的請求一律 404，不要 fallback 到首頁
		if r.URL.Path != "/" {
			if _, err := fs.Stat(sub, strings.TrimPrefix(r.URL.Path, "/")); err != nil {
				http.NotFound(w, r)
				return
			}
		}
		h := w.Header()
		h.Set("X-Content-Type-Options", "nosniff")
		h.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		if strings.HasSuffix(r.URL.Path, ".css") || strings.HasSuffix(r.URL.Path, ".js") || strings.HasPrefix(r.URL.Path, "/assets/") {
			h.Set("Cache-Control", "public, max-age=86400")
		} else {
			h.Set("Cache-Control", "no-cache")
		}
		files.ServeHTTP(w, r)
	}))
	return mux
}
