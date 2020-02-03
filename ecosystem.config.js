module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : 'Node Api',
      script    : '/home/ubuntu/nodeapi/kyte-rest-api/app.js',
      args      : 'node app',
      env_production : {
        NODE_ENV: 'production'
      }
    },
  ]
};


