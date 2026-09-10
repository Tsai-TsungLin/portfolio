// Package site 把 web/ 底下的靜態檔內嵌進 binary 並提供 HTTP handler。
package site

import (
	"bytes"
	"crypto/sha256"
	"embed"
	"encoding/hex"
	"io/fs"
	"net/http"
	"strings"
	"time"
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

	// css / js 的網址帶內容雜湊：改版後網址跟著變，Cloudflare 與瀏覽器的舊快取自然失效
	ver := assetVersion(sub)
	pages := map[string][]byte{}
	for _, name := range []string{"index.html", "resume.html"} {
		b, err := fs.ReadFile(sub, name)
		if err != nil {
			panic(err)
		}
		pages["/"+name] = bytes.ReplaceAll(b, []byte("?v=dev"), []byte("?v="+ver))
	}
	pages["/"] = pages["/index.html"]

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
		if page, ok := pages[r.URL.Path]; ok {
			h.Set("Content-Type", "text/html; charset=utf-8")
			h.Set("Cache-Control", "no-cache")
			http.ServeContent(w, r, "", time.Time{}, bytes.NewReader(page))
			return
		}
		// 只有圖片快取一天；HTML / CSS / JS 每次重新驗證，改版才不會被舊快取卡住
		if strings.HasPrefix(r.URL.Path, "/assets/") {
			h.Set("Cache-Control", "public, max-age=86400")
		} else {
			h.Set("Cache-Control", "no-cache")
		}
		files.ServeHTTP(w, r)
	}))
	return mux
}

// assetVersion 以 style.css 與 app.js 的內容算出短雜湊，當作網址上的版本參數。
func assetVersion(sub fs.FS) string {
	h := sha256.New()
	for _, name := range []string{"style.css", "app.js"} {
		b, err := fs.ReadFile(sub, name)
		if err != nil {
			panic(err)
		}
		h.Write(b)
	}
	return hex.EncodeToString(h.Sum(nil))[:10]
}
