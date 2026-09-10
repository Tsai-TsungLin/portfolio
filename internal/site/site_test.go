package site

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHandler(t *testing.T) {
	h := Handler()
	tests := []struct {
		name     string
		method   string
		path     string
		wantCode int
		wantBody string
	}{
		{"首頁", http.MethodGet, "/", http.StatusOK, "<!doctype html>"},
		{"樣式", http.MethodGet, "/style.css", http.StatusOK, "--bg"},
		{"腳本", http.MethodGet, "/app.js", http.StatusOK, ""},
		{"健康檢查", http.MethodGet, "/health", http.StatusOK, "ok"},
		{"不存在的路徑不 fallback 到首頁", http.MethodGet, "/nba/dashboard", http.StatusNotFound, ""},
		{"不接受 POST", http.MethodPost, "/", http.StatusMethodNotAllowed, ""},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := httptest.NewRecorder()
			h.ServeHTTP(rec, httptest.NewRequest(tt.method, tt.path, nil))
			if rec.Code != tt.wantCode {
				t.Fatalf("status = %d, want %d", rec.Code, tt.wantCode)
			}
			if tt.wantBody != "" && !strings.Contains(strings.ToLower(rec.Body.String()), strings.ToLower(tt.wantBody)) {
				t.Fatalf("body 缺少 %q", tt.wantBody)
			}
		})
	}
}

func TestCacheHeaders(t *testing.T) {
	h := Handler()
	for path, want := range map[string]string{"/": "no-cache", "/style.css": "public, max-age=86400"} {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
		if got := rec.Header().Get("Cache-Control"); got != want {
			t.Errorf("%s Cache-Control = %q, want %q", path, got, want)
		}
	}
}
