# CLUKSTARS Production Deployment Guide

## Quick Deploy (Ubuntu/Debian VPS)

### 1. Server Setup
```bash
# SSH into your VPS
ssh root@your-server-ip

# Update and install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx git sqlite3

# Install PM2 globally
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/clukstars
sudo chown $USER:$USER /var/www/clukstars
```

### 2. Clone Repository
```bash
cd /var/www/clukstars
git clone https://github.com/peteslimmy/CLUKSTARS-WEBSITE.git .
```

### 3. Configure Environment
```bash
# Copy and edit production env
cp .env.production.example .env.production
nano .env.production

# Generate strong JWT secrets:
# openssl rand -hex 32
```

### 4. Build Application
```bash
# Backend
cd backend
npm ci
npm run build
npx prisma generate
npx prisma migrate deploy

# Seed initial data (first time only)
node seed-permissions.js
node seed-cms-data.js
node seed-sections-permissions.js
cd ..

# Admin
cd admin
npm ci
npm run build
cd ..
```

### 5. Setup PM2
```bash
mkdir -p pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Copy the sudo command it outputs and run it
```

### 6. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/clukstars

# Paste the nginx config from deploy-nginx.conf
```

### 7. Enable Site & SSL
```bash
sudo ln -s /etc/nginx/sites-available/clukstars /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d www.clukstars.com -d clukstars.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 8. Verify Deployment
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs clukstars-api

# Test API
curl https://www.clukstars.com/api/health

# Test website
curl https://www.clukstars.com
```

## DNS Configuration

Point your domain to the VPS IP:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | your-server-ip | 3600 |
| A | www | your-server-ip | 3600 |

Wait 5-60 minutes for DNS propagation.

## Maintenance

### Update Deployment
```bash
cd /var/www/clukstars
git pull
cd backend && npm ci && npm run build && npx prisma migrate deploy
cd ../admin && npm ci && npm run build
pm2 restart clukstars-api
```

### Backup Database
```bash
# SQLite backup
cp /var/www/clukstars/backend/prisma/prod.db /backups/clukstars-$(date +%Y%m%d).db

# Or use rsync for automated backups
rsync -avz /var/www/clukstars/backend/prisma/*.db backup-server:/backups/
```

### View Logs
```bash
# PM2 logs
pm2 logs clukstars-api

# Nginx logs
sudo tail -f /var/log/nginx/clukstars-access.log
sudo tail -f /var/log/nginx/clukstars-error.log
```

### Restart Services
```bash
pm2 restart clukstars-api
sudo systemctl restart nginx
```

## Troubleshooting

### Port 4000 already in use
```bash
sudo lsof -i :4000
sudo kill -9 <PID>
```

### Permission denied on uploads
```bash
sudo chown -R www-data:www-data /var/www/clukstars/backend/uploads
sudo chmod -R 755 /var/www/clukstars/backend/uploads
```

### Database locked
```bash
# Find and kill processes holding the lock
sudo lsof /var/www/clukstars/backend/prisma/prod.db
pm2 restart clukstars-api
```

### SSL certificate issues
```bash
sudo certbot certificates
sudo certbot renew --force-renewal
```

## Support

GitHub: https://github.com/peteslimmy/CLUKSTARS-WEBSITE
Email: admin@clukstars.com