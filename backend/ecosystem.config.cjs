module.exports = {
  apps: [
    {
      name: 'promptit-api',
      script: './dist/index.js',
      // Cluster mode spreads requests across all available CPU cores
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
