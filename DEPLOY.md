# DEPLOY — Hostinger VPS (Ubuntu 24.04, KVM 2)

The app is a Node server (SSR + ISR + streaming API routes + Payload admin) —
static export is impossible. It runs as Next.js `standalone` output under pm2,
behind Nginx, with certbot SSL. **Vercel keeps serving withhammad.com until
the final DNS cutover in §8 — zero downtime.**

> Everything in §1–§3 happens once, as root on a fresh VPS.
> Commands are copy-paste blocks; replace `<placeholders>`.

## 1. Harden the box

```bash
adduser deploy
usermod -aG sudo deploy
rsync -a ~/.ssh /home/deploy/ && chown -R deploy:deploy /home/deploy/.ssh

# SSH: keys only, no root login
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart ssh

ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw --force enable
apt update && apt install -y fail2ban nginx
systemctl enable --now fail2ban
```

## 2. Node 22 + pm2 (as `deploy`)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.nvm/nvm.sh && nvm install 22
npm i -g pm2
pm2 startup   # run the sudo command it prints
```

## 3. Directories + env

```bash
sudo mkdir -p /var/www/withhammad/{current,incoming} /var/log/withhammad
sudo chown -R deploy:deploy /var/www/withhammad /var/log/withhammad
```

Create `/var/www/withhammad/current/.env` (pm2 picks it up via Next's env
loading; never commit it). Full key list:

```
DATABASE_URI=            # Neon "Portfolio" project connection string
PAYLOAD_SECRET=
BLOB_READ_WRITE_TOKEN=   # Vercel Blob keeps hosting media (works fine off-Vercel)
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
RESEND_API_KEY=
LEAD_EMAIL_TO=
FISH_API_KEY=
FISH_VOICE_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_LINKEDIN_PARTNER_ID=
NEXT_PUBLIC_CALENDLY_URL=
NEXT_PUBLIC_GSC_VERIFICATION=
NEXT_PUBLIC_BING_VERIFICATION=
REVALIDATE_SECRET=
```

`NEXT_PUBLIC_*` values are inlined at **build time**, so they must ALSO exist
as GitHub Actions secrets (the build happens on the runner, not the VPS).

## 4. Nginx

```bash
sudo cp deploy/nginx-withhammad.conf /etc/nginx/sites-available/withhammad.conf
sudo ln -s /etc/nginx/sites-available/withhammad.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Key details already in the conf: `proxy_buffering off` **only** on
`/api/chat` + `/api/voice` (streaming), immutable cache headers on
`_next/static`, `/fonts`, `/audio` (narration MP3s), `client_max_body_size 10M`.

## 5. First deploy (manual, before CI takes over)

```bash
# on your Mac, in the repo
npm ci && npm run narration && npm run build
cp -r public .next/standalone/public
mkdir -p .next/standalone/.next && cp -r .next/static .next/standalone/.next/static
rsync -az --delete .next/standalone/ deploy@<VPS_IP>:/var/www/withhammad/current/

# on the VPS
cd /var/www/withhammad/current
pm2 start ~/repo-checkout/ecosystem.config.js   # or copy ecosystem.config.js up
pm2 save
curl -I http://127.0.0.1:3000   # expect 200/307
```

(Standalone output does not bundle `public/` or `.next/static` — the two `cp`
lines are mandatory, not optional.)

## 6. SSL

After DNS points at the VPS (§8):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d withhammad.com -d www.withhammad.com
sudo certbot renew --dry-run   # verify auto-renew
```

## 7. CI/CD

`.github/workflows/deploy-vps.yml` is committed but **disabled** (`if: false`).
Enable it after §1–§6 and add repo secrets:
`VPS_HOST`, `VPS_USER` (=deploy), `VPS_SSH_KEY` (ed25519 private key),
plus every env var from §3 that the build needs. Builds run on the GitHub
runner and rsync the bundle across — the VPS never runs `next build`.

## 8. Cutover + rollback

1. Verify `http://<VPS_IP>` serves the site (curl with `-H "Host: withhammad.com"`).
2. In your DNS (hPanel — or better, move DNS to Cloudflare free and proxy):
   `A @ <VPS_IP>`, `A www <VPS_IP>`, TTL 300.
3. Run §6 certbot once propagation completes.
4. Watch `pm2 logs withhammad` + UptimeRobot on https://withhammad.com/.
5. **Rollback = repoint DNS to Vercel** (the project stays live untouched).

## 9. Ops

```bash
pm2 logs withhammad          # tail app logs
pm2 monit                    # live memory/cpu
sudo logrotate --force /etc/logrotate.d/withhammad   # after adding a rotate rule
```

Add `/etc/logrotate.d/withhammad`:

```
/var/log/withhammad/*.log {
  weekly
  rotate 8
  compress
  missingok
  notifempty
  copytruncate
}
```

UptimeRobot: HTTP monitor on `https://withhammad.com/` + keyword monitor on
`/api/chat` returning 405 for GET (proves the route is alive).

## Gotchas carried over from CLAUDE.md

- Commit author email MUST be `hammadbhat126@gmail.com` — this broke every
  Vercel deploy once and will confuse any future Git-based pipeline too.
- Never commit `app/(payload)/admin/importMap.js` missing the
  `VercelBlobClientUploadHandler` line.
- Payload accepts `DATABASE_URI`, `DATABASE_URL`, or `POSTGRES_URL`.
