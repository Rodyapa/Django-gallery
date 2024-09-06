
Pre-requirements:
-----------------
For this app you need(If you going to use docker containerazaiton):
* Installed reverse proxy server on your hosting (Nginx or something else).
    for debian based system: sudo apt install nginx
    Then you need to add configuration that will proxy requests to app web-server
        server {
        client_max_body_size 20M; # This maximum that frontend allow to upload
        server_name django-gallery.ru; # Your addres or domain
        location / {
                proxy_set_header Host $http_host;
                proxy_pass http://127.0.0.1:8070; #8070 is default that app web-server will listen to

        }
    }
    You also need to provide https for django-gallery to work. You can use certbot for this purpose.
* installed Docker and Docker Compose:
    install using apt respository:
        # Add Docker's official GPG key:
    sudo apt-get update
    sudo apt-get install ca-certificates curl
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    # Add the repository to Apt sources:
    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update

    #install docker packages:
    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

Installation 
------------
1. Git clone repository from your fork or original repository
    git clone git@github.com:Rodyapa/Django-gallery.git (if you use ssh and clone from your repository.)
2. Move into project folder:
    cd Django-gallery
3. Make an .env file
    touch .env
4. Set required configuration in .env file. (see :doc:`Required configuration`)



Required configuration
----------------------
  1  (REQUIRED) POSTGRES_DB - Name for db that will be created in postgres container for your app
  2. (REQUIRED) POSTGRES_USER - Name for db user that will be created in postgres container for your app
  3. (REQUIRED) POSTGRES_PASSWORD - User password for db user that will be created in postgres container for your app
  4. (REQUIRED) DB_HOST=db - This is host for Django app to connect to DB. If you do not want to change compose file than leave it called 'db'
  5. (REQUIRED) DB_PORT=5432 - Port that Django will use to connect o DB. you should leave it 5432 by default.
  6. DEFAULT_SU_NAME - If provided, Django will create a superuser with this name on the start of the project.
  7. DEFAULT_SU_PASSWORD - If provided, Django will create a superuser with this password on the start of the project.
  8. (REQUIRED) DEBUG_IS_ON=False - Set debug mode for Django app. It should be False for production.
  9. (REQUIRED) SECRET_KEY - Secret Key for Django app to work. You should write or generate it manually. It will be generated automatically in the future.
  10. (REQUIRED) HOSTING_IP- Need for Django to process requests. 
  11. HOSTING_DOMAIN=photo-restoration.risetime.ru Need for Django to process requests.Can be null if adress is provided
  12. SITE_TITLE - Will be used everywhere where site title is displayed. if not provided ,than ('MY_SITE') will be used.
  13. VK_LINK - Standart Link on Contact Page. Appears with a vk symbol.
  14. INSTAGRAM_LINK - Standart Link on Contact Page. Appears with a instagram symbol.
  15. COPYRIGHT - your copyright. Appears in the footer on each page.
  16. TELEGRAM_LINK - Standart Link on Contact Page. Appears with a telegram symbol. 
  17. DROPBOX_TARGET_PATH - Path to your dropbox folder where yyou want to storage your app backups 
  18. DROPBOX_APP_KEY - key for your dropbox app. 
  19. DROPBOX_APP_SECRET - secret for your dropbox app.
  20. DROPBOX_ACCESS_TOKEN - access token for your app. For now you need to generate it manually. 
  21. WATERMARK_TEXT - Text that will be used for automatic watermarking on your photos.
