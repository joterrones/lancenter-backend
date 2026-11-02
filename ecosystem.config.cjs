/**
 * PM2 — Lancenter API (mismo patrón que Credimax / Sol Redes).
 *
 * En el servidor (ecosystem compartido) suele ir:
 * {
 *   name: "node_lancenter",
 *   script: "/proyecto/Lancenter/backend/dist/index.js",
 *   cwd: "/proyecto/Lancenter/backend",
 *   env: { NODE_ENV: "production", PORT: "3600" },
 * }
 *
 * Primera vez: pm2 start ecosystem.config.cjs && pm2 save && pm2 startup
 * Actualizar: bash scripts/deploy-pm2.sh   o   pm2 restart node_lancenter
 */
module.exports = {
  apps: [
    {
      name: "node_lancenter",
      cwd: "/proyecto/Lancenter/backend",
      script: "/proyecto/Lancenter/backend/dist/index.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: "3600",
        HOST: "0.0.0.0",
      },
    },
  ],
};
