
<<<<<<< HEAD
Installation
============
Pre-requirements
-----------------
To use this app (if you plan to use Docker containerization), you need to:

1. Install a reverse proxy server on your hosting (Nginx or another option).
For Debian-based systems:
    .. code-block:: bash

        sudo apt install nginx

Then, you need to add a configuration that will proxy requests to the app web server:
    .. code-block:: bash

            server {
            client_max_body_size 20M; # This is the maximum size that the frontend allows for uploads
            server_name django-gallery.ru; # Your addres or domain
            location / {
                    proxy_set_header Host $http_host;
                    proxy_pass http://127.0.0.1:8070; #8070 is the default port that the app web server will listen to

            }
        }
    You also need to provide HTTPS for django-gallery to work. You can use `certbot <https://certbot.eff.org/>`__ for this purpose.
2. Install Docker and Docker Compose:
To install using the apt repository:
Add Docker's official GPG key::
    .. code-block:: bash

        sudo apt-get update
        sudo apt-get install ca-certificates curl
        sudo install -m 0755 -d /etc/apt/keyrings
        sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
        sudo chmod a+r /etc/apt/keyrings/docker.asc

Add the repository to Apt sources:
    .. code-block:: bash

        echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
        $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
        sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update

install docker packages:
    .. code-block:: bash

        sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

Installation 
------------
1. Clone the repository from your fork or the original repository:
    .. code-block:: bash

        git clone git@github.com:Rodyapa/Django-gallery.git (if you use ssh and clone from your repository.)
2. Move into the project folder:
    .. code-block:: bash

        cd Django-gallery
3. Create an .env file:
    .. code-block:: bash

        touch .env
4. Set the required configuration in the .env file. (See: :doc:Required configuration)
5. Run the app containers with Docker Compose:
    .. code-block:: bash

        sudo docker compose -f docker-compose.production.yml up -d 

Required configuration
----------------------
1. (REQUIRED) **POSTGRES_DB** - Name of the database that will be created in the PostgreSQL container for your app.
2. (REQUIRED) **POSTGRES_USER** - Name of the database user that will be created in the PostgreSQL container for your app.
3. (REQUIRED) **POSTGRES_PASSWORD** - Password for the database user that will be created in the PostgreSQL container for your app.
4. (REQUIRED) **DB_HOST=db** - Host for the Django app to connect to the database. If you do not want to change the Compose file, leave it as 'db'.
5. (REQUIRED) **DB_PORT=5432** - Port that Django will use to connect to the database. You should leave it as 5432 by default.
6. **DEFAULT_SU_NAME** - If provided, Django will create a superuser with this name at the start of the project.
7. **DEFAULT_SU_PASSWORD** - If provided, Django will create a superuser with this password at the start of the project.
8. (REQUIRED) **DEBUG_IS_ON=False** - Sets the debug mode for the Django app. It should be False for production.
9. (REQUIRED) **SECRET_KEY** - ecret key for the Django app to work. You should write or generate it manually. It will be generated automatically in the future.
10. (REQUIRED) **HOSTING_IP** - Needed for Django to process requests.
11. **HOSTING_DOMAIN** -  Needed for Django to process requests. Can be null if an address is provided.
12. **SITE_TITLE** - Will be used everywhere the site title is displayed. If not provided, then 'MY_SITE' will be used.
13. **VK_LINK** - Standard link on the Contact Page. Appears with a VK symbol.
14. **INSTAGRAM_LINK** - Standard link on the Contact Page. Appears with an Instagram symbol.
15. **COPYRIGHT** - Your copyright. Appears in the footer on each page.
16. **TELEGRAM_LINK** - Standard link on the Contact Page. Appears with a Telegram symbol.
17. **DROPBOX_TARGET_PATH** - Path to your Dropbox folder where you want to store your app backups.
18. **DROPBOX_APP_KEY** - Key for your Dropbox app. 
19. **DROPBOX_APP_SECRET** - Secret for your Dropbox app.
20. **DROPBOX_ACCESS_TOKEN** - Access token for your app. For now, you need to generate it manually.
21. **WATERMARK_TEXT** - Text that will be used for automatic watermarking on your photos.
=======
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
>>>>>>> c63fc74ebe8cc8702902a94986c0f5a468e1ac5f
