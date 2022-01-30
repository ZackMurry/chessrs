FROM nginx:1.21.6
COPY ./conf/nginx.conf ./conf/nginx.conf
EXPOSE 80
ENTRYPOINT ["nginx", "-p", ".", "-c", "conf/nginx.conf"]

