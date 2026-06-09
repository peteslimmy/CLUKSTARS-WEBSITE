module.exports = {
  apps: [{
    name: 'clukstars-api',
    script: './backend/dist/index.js',
    cwd: __dirname,
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './pm2/error.log',
    out_file: './pm2/out.log',
    log_file: './pm2/combined.log',
    time: true,
  }]
};