# API Deployment Guide

## Prerequisites

- Docker and Docker Compose installed on the server
- Access to a container registry (DockerHub, AWS ECR, etc.)
- Node.js 18 or higher for local development
- Git access to the repository

## Deployment Steps

### 1. Setting up the server

1. SSH into your server:

   ```bash
   ssh user@your-server-ip
   ```

2. Install Docker and Docker Compose if not already installed:

   ```bash
   # Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.15.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. Create a directory for the application:
   ```bash
   mkdir -p /var/www/api
   cd /var/www/api
   ```

### 2. Configuring the environment

1. Create a `.env.production` file:

   ```bash
   touch .env.production
   nano .env.production
   ```

2. Add the necessary environment variables:

   ```
   NODE_ENV=production
   PORT=3000

   # Database
   DB_HOST=database
   DB_PORT=5432
   DB_USER=yourusername
   DB_PASSWORD=yourpassword
   DB_NAME=api_db

   # Redis
   REDIS_HOST=redis
   REDIS_PORT=6379

   # JWT
   JWT_SECRET=your-secure-jwt-secret
   JWT_EXPIRES_IN=1d

   # CORS
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

### 3. Deploying the application

1. Copy the docker-compose.yml file to the server:

   ```bash
   scp docker-compose.yml user@your-server-ip:/var/www/api/
   ```

2. Pull the latest image and start the containers:

   ```bash
   docker-compose pull
   docker-compose up -d
   ```

3. Verify the containers are running:

   ```bash
   docker-compose ps
   ```

4. Check the logs:
   ```bash
   docker-compose logs -f api
   ```

### 4. Setting up a reverse proxy

1. Install Nginx:

   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. Create an Nginx configuration:

   ```bash
   sudo nano /etc/nginx/sites-available/api
   ```

3. Add the following configuration:

   ```
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Enable the site and restart Nginx:

   ```bash
   sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. Set up SSL with Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

### 5. Automated Deployments

The GitHub Actions workflow we've set up will automatically deploy your API when changes are pushed to the main branch.
