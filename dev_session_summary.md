# Development Session Handoff

This document summarizes the challenges faced, the technical solutions implemented, and the infrastructure built during our coding session. You can provide this file to the AI in our next chat to instantly regain context without loading a bloated conversation history.

## 🏗️ 1. Architecture & Deployment (AWS Lightsail)
**Problem:** The frontend and backend containers were directly exposing ports, making environment variables tricky and resulting in unsecured internal mapping.
**Solution:**
- **Nginx Reverse Proxy:** Implemented a robust Nginx server (`frontend/nginx.conf`) that serves the React frontend statically on port 80 and uses `proxy_pass` to invisibly route all `/api/*` traffic to the backend internal network on port 3000.
- **Removed Public Backend Port:** Modified `compose.prod.yml` to remove the public 3000 port binding for the backend. From the outside, the application now acts like a single unified service.
- **Relative API Routing:** Updated the Vite frontend (via `deploy.sh` passing Docker `ARG`) to utilize `VITE_APP_API_URL=/api` instead of hardcoding IP addresses, making it instantly portable.

## 🔐 2. Session Authentication & Persistence
**Problem:** You were getting "403 Forbidden" errors constantly when trying to hit authenticated endpoints. The `express-session` library was destroying your cookies because the traffic was arriving from Nginx (a proxy) instead of directly from the client.
**Solution:**
- Updated `backend/src/main.ts` to explicitly enable `app.set('trust proxy', 1)`.
- Reconfigured the `express-session` object to use `proxy: true` and set the core cookie rules (`sameSite: 'lax'`, `secure: false`) to appropriately function over HTTP while we configure the custom domain. Authentication cookies (`connect.sid`) now persist securely.

## 📧 3. The "Ghost Gmail" Infinite SES SQS Loop
**Problem:** The backend logs were being spammed repeatedly with a `MessageRejected` error involving `ctimothyabraham4@gmail.com`. The background `QueueService` was infinitely retrying a failed SQS email payload.
**Solution:**
- **The Diagnosis:** We identified that the Gmail address wasn't hardcoded in the codebase, but was a *recipient* in your database being blocked by AWS SES Sandbox (which requires recipient verification).
- **"Smart Drop" Implementation:** We programmed conditional "Smart Drop" logic in `backend/src/bulk-email/queue.service.ts`. The poll loop now catches 400-level HTTP errors (Permanent AWS rejections). Instead of just logging it, it actively calls `DeleteMessageCommand` to permanently erase the invalid email from the queue, breaking the loop forever.
- **Docker Caching Bug Fixed:** We encountered intense Docker layer caching issues on your Lightsail server wherein broken code persisted. We successfully forced modernization by manually SSHing, removing the stale `./dist` and `./node_modules` folders off the host, and triggering a `docker compose build --force-recreate` to ensure the "Smart Drop" logic actually went live.

## 🌐 4. Custom Subdomain & CORS Configuration
**Problem:** Request to route the custom subdomain `app.harpazotech.com` to the Lightsail webapp.
**Solution:**
- Added the `server_name app.harpazotech.com;` directive to `frontend/nginx.conf`.
- Expanded the NestJS CORS allowance in `backend/src/main.ts` to whitelist both `http://` and `https://` protocols for the targeted subdomain.
- Advised on the DNS side: You must log into your DNS registrar and construct an `A` Record with the Host `app` pointing to the IPv4 address `43.204.208.225`.

## 🛡️ 5. Security Sanitization
**Problem:** Direct AWS root keys (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`) were previously hardcoded in the bash `deploy.sh` script, which triggered GitHub's Secret push protection block.
**Solution:**
- Scrubbed `deploy.sh` of all sensitive variables, configuring the automation script to strictly rely on the server's local, tracked `.env.production` file.
- Used `git reset --soft` to rewrite and sanitize the commit timeline, satisfying GitHub's security requirements and letting us push code cleanly to `demo-prototype`.

## 📋 Next Action Items (Next Chat)
- Configure **SSL/HTTPS** (Certbot/Let's Encrypt) on the AWS Lightsail box. Currently using HTTP.
- Rotate AWS IAM and MongoDB keys if they were ever previously pushed to public GitHub logs outside of this session.
- Turn `secure: true` on in the `main.ts` express-session constructor as soon as an SSL certificate is successfully installed on the new custom domain.
