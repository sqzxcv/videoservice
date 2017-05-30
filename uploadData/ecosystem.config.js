module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [

    // First application
    {
      name: "uploadData",
      max_memory_restart: "1024M",
      log_date_format: "YYYY-MM-DD HH:mm:ss SSS",
      script: "./uploadData/index.js",
      out_file: "/var/log/uploadData/app.log",
      error_file: "/var/log/uploadData/err.log",
      port: "30002",
      env: {
        COMMON_VARIABLE: 'true'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    },
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
    production: {
      user: 'root',
      host: '172.104.91.83',
      ref: 'origin/master',
      repo: 'git@github.com:sqzxcv/videoservice.git',
      path: '/var/www/production/uploadData/',
      "post-deploy": 'git pull && npm install && pm2 reload ./uploadData/ecosystem.config.js --env production'
    },
    dev: {
      user: 'root',
      host: '172.104.91.83',
      ref: 'origin/master',
      repo: 'git@github.com:sqzxcv/videoservice.git',
      path: '/var/www/development',
      "post-deploy": 'npm install && pm2 reload ecosystem.config.js --env dev',
      env: {
        NODE_ENV: 'dev'
      }
    }
  }
};
