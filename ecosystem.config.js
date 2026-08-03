// pm2 process file for the Hostinger VPS.
// The deploy pipeline copies `.next/standalone` to the server, then overlays
// `public/` and `.next/static` into it (Next's standalone output does not
// include them — see DEPLOY.md §5).
module.exports = {
  apps: [
    {
      name: "withhammad",
      cwd: "/var/www/withhammad/current",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "700M",
      out_file: "/var/log/withhammad/out.log",
      error_file: "/var/log/withhammad/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
