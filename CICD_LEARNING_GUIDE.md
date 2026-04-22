# 🚀 CI/CD Learning Guide: The Faith-Connect Automated Pipeline

This document explains the "magic" behind the new automated deployment pipeline we built. It breaks down what we changed, how it works, and how you deploy code going forward.

## 1. The Old Way (Why your server kept freezing)
Previously, when you wanted to deploy, you had to log into your Lightsail server and run `docker-compose build`. 
* **The Problem:** Building an app (especially compiling TypeScript and installing React node_modules) requires a massive amount of RAM and CPU.
* **The Crash:** Because your Lightsail instance only has 2GB of RAM, the heavy lifting of the "build" process maxed out the memory, causing the server to freeze and crash completely.

## 2. The New Way (The GitHub Actions Pipeline)
We moved the heavy lifting off your Lightsail server and onto **GitHub's powerful servers**. Your server no longer "builds" the code; it just downloads the finished product.

Here is the step-by-step flow of what happens now:

### Step A: The Trigger (What you do)
You do not need to run any special commands on the server anymore. The **only** thing you do is push your code to GitHub:
```bash
git add .
git commit -m "My new feature"
git push origin demo-prototype
```
**That's it.** The moment GitHub receives a push to the `demo-prototype` branch, it triggers the automated "Action" we built.

### Step B: The Factory (What GitHub does)
When GitHub sees your push, it wakes up a temporary, high-powered server in the cloud (defined in the `.github/workflows/deploy.yml` file).
1. It downloads your latest code.
2. It builds the `frontend` and `backend` into Docker "Images" (packaging them up).
3. It stores these finished packages securely in the **GitHub Container Registry (GHCR)** (like an App Store for your code).

### Step C: The Delivery (What your Server does)
Once the packages are safely stored in GHCR, GitHub uses a secure SSH key to "tap your Lightsail server on the shoulder" and tells it:
1. "Hey, there's a new update ready!"
2. Your Lightsail server simply runs `docker pull` to download the pre-built packages from GHCR.
3. Your server then restarts the Nginx and Node containers with the new code.

Because downloading a finished package takes almost zero RAM, your server stays lightning fast and never freezes!

## 3. The Required Setup (How we connected them)
For GitHub to be allowed to push updates to your server, we had to give it two secret keys:
1. **`SERVER_IP`**: We told GitHub your new Static IP (`43.204.208.225`).
2. **`LIGHTSAIL_SSH_KEY`**: We gave GitHub the contents of your `harpazotech.pem` file so it can log in securely and run the update commands for you.
*(These are securely stored in your GitHub Repository Settings under Secrets).*

## 4. Summary: Your Daily Workflow
From today onward, deploying your app is a one-step process:

1. Write your code on your local computer.
2. Test it locally.
3. **Commit and push to the `demo-prototype` branch.**

You can literally push the code and go grab a coffee. Within 2-3 minutes, the live site at `https://app.harpazotech.com` will automatically reflect your changes. ☕✨
