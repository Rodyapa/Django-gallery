#!/bin/bash
# Make DB backup. Make archive of backend media. Send it to DROPBOX. 

# Set the current date and time for the backup file name
  DATE=$(date +%Y-%m-%d_%H-%M-%S)

# Define the path to the .env file that store DB credentials
  ENV_FILE="../.env"


#Check if the .env file exists
function get_env () {
        if [[ ! -f "$ENV_FILE" ]]; then
                echo "Error: .env file not found in the parent directory."
                return 1
        fi

        #Load the .env file and export variables
        export $(grep -v '^#' "$ENV_FILE" | xargs)
    
        #Check if the required db credentials are set 
        if [[ -z "$POSTGRES_DB" || -z "$POSTGRES_USER" || -z "$POSTGRES_PASSWORD" ]]; then
                echo "Error: One or more required environment variables are not set."
                return  1
        fi
    
        echo "Database Name: $POSTGRES_DB"
        echo "Database Username: $POSTGRES_USER"
        echo "Database Password: $POSTGRES_PASSWORD"
}

function get_db_container() {
        # Find runnning db container
        DB_CONTAINER=$(sudo docker compose -f ../docker-compose.production.yml ps -q db)
        if [ -z "$DB_CONTAINER" ]; then
                echo "Db container doesn't run"
                return 1
        fi
        echo "$DB_CONTAINER"
    
}

# Folder inside db container that linked with volume.
  DB_CONTAINER_BACKUP_DIR="/db_backups"

# Perform the db backup
function dump_db () {
        # The name of the container we will link to
        local DB_DOCKER_CONTAINER_NAME=$(get_db_container)
        # Name of the Backup file
        IN_CONTAINER_BACKUP_FILE="$DB_CONTAINER_BACKUP_DIR/$DATE/$POSTGRES_DB-$DATE.dump"

        # Current backup folder:
        CURRENT_BACKUP_FOLDER="db_backups/$DATE"
        #Create folder for backup
        CREATE_FOLDER_DOCKER_CMD="docker exec -i $DB_DOCKER_CONTAINER_NAME mkdir $CURRENT_BACKUP_FOLDER"
        if $CREATE_FOLDER_DOCKER_CMD; then
                echo "Folder for current backup created"
        else
                echo "Folder creation for backup failed"
                exit 1
        fi
        OUTSIDE_CONTAINER_DUMP_FILE=""
        # Command to execute inside container
        local DOCKER_BAK_CMD="docker exec -i $DB_DOCKER_CONTAINER_NAME pg_dump -Fc --username=$POSTGRES_USER --file=$IN_CONTAINER_BACKUP_FILE $POSTGRES_DB"

        #execute backup command
        if $DOCKER_BAK_CMD; then
            echo "Backup successful! Backup file created at: $IN_CONTAINER_BACKUP_FILE"
        else
            echo "Error: Backup failed."
            exit  1
        fi
}

MEDIA_VOLUME="/var/lib/docker/volumes/django-gallery_media"

function check_if_dropbox_token_provided() {
        if [ -z "$DROPBOX_ACCESS_TOKEN" ]; then
                echo "Error: Dropbox access token was not provided in the environment."
                return 1
        fi
        #if [ -z "$DROPBOX_TARGET_PATH" ]; then
        #       echo "Error: Dropbox target path was not provided in the environment."
        #       return  1
        #fi
        #
        #if [[ -z "$DROPBOX_APP_KEY" || -z "$DROPBOX_APP_SECRET" || -z "$DROPBOX_REFRESH_TOKEN" ]]; then
        #       echo "Error: Dropbox app credentials was not provided in the environment."
        #       return 1
        #fi

}

#Function to refresh the access token
function refresh_access_token() {
  DROPBOX_ACCESS_TOKEN=$(curl -s -X POST https://api.dropbox.com/oauth2/token \
    -u "$DROPBOX_APP_KEY:$DROPBOX_APP_SECRET" \
    -d grant_type=refresh_token \
    -d refresh_token="$DROPBOX_REFRESH_TOKEN" | jq -r '.access_token')

  if [ -z "$DROPBOX_ACCESS_TOKEN" ]; then
    echo "Failed to refresh access token"
    exit 1
  fi
}
function upload_dump_to_dropbox () {
        local FILE_PATH="$1"
        local DROPBOX_DESTINATION="$2"

   # Upload the backup file
        curl -X POST https://content.dropboxapi.com/2/files/upload \
            --header "Authorization: Bearer $DROPBOX_ACCESS_TOKEN" \
            --header "Dropbox-API-Arg: {\"path\": \"$DROPBOX_DESTINATION\", \"mode\": \"add\", \"autorename\": true, \"mute\": false}" \
            --header "Content-Type: application/octet-stream" \
            --data-binary @"$FILE_PATH"
}


function upload_media_to_dropbox() {
        local SOURCE_FOLDER="$1"
        local DROPBOX_DESTINATION="$2"
        local MEDIA_BACKEND_PATH="/var/lib/docker/volumes/django-gallery_media"
#Make archived media folder
        local ARCHIVE_NAME="media-$DATE.tar.gz"
        local ARCHIVE_PATH="/tmp/$ARCHIVE_NAME"

        #Create a compressed archive of the folder
        tar -czf "$ARCHIVE_PATH" -C "$(dirname "$SOURCE_FOLDER")" "$(basename "$SOURCE_FOLDER")"
        if [ $? -ne 0 ]; then
                echo "Error: Failed to create archive."
                exit 1
        fi

        # Upload the archive to Dropbox 
        RESPONSE=$(curl -s -X POST https://content.dropboxapi.com/2/files/upload \
        --header "Authorization: Bearer $DROPBOX_ACCESS_TOKEN" \
         --header "Dropbox-API-Arg: {\"path\": \"$DROPBOX_DESTINATION\", \"mode\": \"add\", \"autorename\": true, \"mute\": false}" \
        --header "Content-Type: application/octet-stream" \
        --data-binary @"$ARCHIVE_PATH")

        if echo "$RESPONSE" | grep -q '"error_summary":'; then
                echo "Error: Failed to upload archive to Dropbox. Response: $RESPONSE"
                exit 1
        fi

        #Delete the local  archive after successful upload
        rm -f "$ARCHIVE_PATH"
        if [ $? -ne 0 ]; then
                echo "Error: Failed to delete local archive."
                exit 1
        fi

        echo "Process completed successfully."
}
# Define the directory where backups are stored
  BACKUP_DIR="/var/lib/docker/volumes/django-gallery_backups/_data"

get_env
dump_db
check_if_dropbox_token_provided
#refresh_access_token
upload_dump_to_dropbox "$BACKUP_DIR/$DATE/$POSTGRES_DB-$DATE.dump" "$DROPBOX_TARGET_PATH/$DATE/$SPOTGRES_DB-$DATE.dump"
upload_media_to_dropbox "/var/lib/docker/volumes/django-gallery_media/_data/" "$DROPBOX_TARGET_PATH/$DATE/media-$DATE.tar.gz"
