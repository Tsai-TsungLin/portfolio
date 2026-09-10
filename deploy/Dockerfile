FROM alpine:3.20
# 非 root 執行；沒有資料目錄，純靜態頁內嵌在 binary 裡
RUN apk add --no-cache ca-certificates tzdata \
 && addgroup -g 10001 app && adduser -D -H -u 10001 -G app app
WORKDIR /app
COPY portfolio /app/portfolio
RUN chmod 0755 /app/portfolio
ENV TZ=Asia/Taipei ADDR=:8080
EXPOSE 8080
USER app
CMD ["/app/portfolio"]
