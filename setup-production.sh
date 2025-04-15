#!/bin/bash

# Create necessary directories
mkdir -p /var/www/api/logs

# Copy over configuration files
cp docker-compose.yml /var/www/api/
cp .env.production /var/www/api/.env

# Set up Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

DOCKER_COMPOSE_VERSION=2.15.1
sudo curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Pull and start containers
cd /var/www/api
docker-compose pull
docker-compose up -d

# Set up Nginx
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# Create Nginx configuration
cat > api.conf << EOF
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo mv api.conf /etc/nginx/sites-available/api
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# Set up SSL (uncomment when domain is properly configured)
# sudo certbot --nginx -d api.yourdomain.com

echo "API deployment completed!" 