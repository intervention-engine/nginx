FROM nginx

COPY dist /usr/share/nginx/html

COPY ssl /etc/nginx/ssl

COPY nginx.conf /etc/nginx/nginx.conf.template

COPY htpasswd /etc/nginx/htpasswd

EXPOSE 443
