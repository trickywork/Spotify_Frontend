FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.d/40-config.sh /docker-entrypoint.d/40-config.sh
COPY index.html styles.css app.js config.js /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets
RUN chmod +x /docker-entrypoint.d/40-config.sh
EXPOSE 8080
