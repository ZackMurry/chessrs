cd nginx
sudo nginx -s quit
sudo nginx -p . -c conf/nginx.conf

cd ..
sudo docker-compose up

