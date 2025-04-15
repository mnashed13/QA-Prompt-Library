#!/bin/bash

# Database backup script
# Add to crontab with: 0 2 * * * /path/to/scripts/backup.sh

# Configuration
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/var/backups/api"
CONTAINER_NAME="api_database_1"
DB_NAME="api_db"
DB_USER="postgres"
S3_BUCKET="your-backup-bucket"  # Optional: for S3 backups

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup PostgreSQL database
docker exec $CONTAINER_NAME pg_dump -U $DB_USER -d $DB_NAME -F c -f /tmp/backup.dump
docker cp $CONTAINER_NAME:/tmp/backup.dump $BACKUP_DIR/db_backup_$DATE.dump
docker exec $CONTAINER_NAME rm /tmp/backup.dump

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.dump

# Optional: Upload to S3
# aws s3 cp $BACKUP_DIR/db_backup_$DATE.dump.gz s3://$S3_BUCKET/db_backup_$DATE.dump.gz

# Delete backups older than 7 days
find $BACKUP_DIR -name "db_backup_*.dump.gz" -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_backup_$DATE.dump.gz" 