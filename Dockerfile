FROM nginx

COPY dist /usr/share/nginx/html

COPY ssl /etc/nginx/ssl

COPY nginx.conf /etc/nginx/nginx.conf.template

COPY htpasswd /etc/nginx/htpasswd

RUN mkdir /etc/nginx/logs
RUN touch /etc/nginx/logs/error.log
RUN touch /etc/nginx/logs/access.log

EXPOSE 443
