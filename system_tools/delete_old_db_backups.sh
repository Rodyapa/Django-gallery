  1 #!/bin/bash
  2 
  3 #Delete old backups
  4 
  5 
  6 #Check if there is more than 3 backup file and delete all except last 3 dump
  7 
  8 function delete_oldest_dumps() {
  9         # Define the target directory
 10         TARGET_DIR="/var/lib/docker/volumes/django-gallery_backups/_data"
 11 
 12         # Change to the target directory
 13         cd "$TARGET_DIR" || { echo "Directory not found"; exit 1; }
 14 
 15         # Count the number of files in the directory
 16         FILE_COUNT=$(ls -1 | wc -l)
 17 
 18         # Check if the file count exceeds 3
 19         if [ "$FILE_COUNT" -gt 3 ]; then
 20                 echo "More than 3 files found. Proceeding to delete older files."
 21 
 22         # Get the three newest files
 23         NEWEST_FILES=$(ls -t | head -n 3)
 24 
 25         # Delete all files except the newest three
 26         for file in *; do
 27                 if ! echo "$NEWEST_FILES" | grep -q "$file"; then
 28                 echo "Deleting file: $file"
 29                 rm -r "$file"
 30                 fi
 31         done
 32         else
 33                 echo "File count is 3 or less. No files will be deleted."
 34         fi
 35         }
 36 
 37 delete_oldest_dumps
