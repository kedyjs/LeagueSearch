module.exports = {
  apps: [{
    name: 'LeagueSearch',
    script: 'index.js',
    watch: true,
    ignore_watch: ['node_modules', '.git', 'logs'],
    max_memory_restart: '300M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: 'logs/error.log',
    out_file: 'logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    autorestart: true,
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    restart_delay: 4000,
    instances: 1,
    exec_mode: 'fork'
  }]
}; 