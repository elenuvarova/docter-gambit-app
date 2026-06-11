FROM nginx:1.28-alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY index.html styles.css app.js favicon.ico apple-touch-icon.png robots.txt /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1
EXPOSE 80
