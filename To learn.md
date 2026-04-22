# Plan: Automated Birthday & Anniversary Reminders

This document is both the blueprint for what we will build next AND your study guide so you can understand exactly *how* and *why* I am writing the code I write. 

## 🧠 Your Learning Guide

Since you want to learn the mechanics behind these features, here are the core concepts we will use for this build. If you spend 20 minutes reading the NestJS Docs on these three topics, my code will make 100% sense to you:

1. **NestJS Task Scheduling (`@nestjs/schedule`)**
   * **What it is:** A way to tell your server, "Run this specific function every day at 8:00 AM automatically."
   * **Why we use it:** To check the database daily for birthdays instead of relying on a human to click a button.
   * **What to study:** Look up "NestJS Cron Jobs". You'll see I will use a decorator called `@Cron()`.
2. **MongoDB Aggregation/Date Queries**
   * **What it is:** Advanced database searching. 
   * **Why we use it:** Saving a birthdate as `1990-04-21` means we can't just search for "April 21". We have to write a query that says, *“Ignore the year 1990, just find everyone whose birth Month is 4 and Day is 21.”*
   * **What to study:** Look up Mongoose `$expr`, `$month`, and `$dayOfMonth` operators.
3. **Dependency Injection (DI)**
   * **What it is:** Using a service from one module inside another module.
   * **Why we use it:** We just built an awesome `QueueService` for bulk emails. Instead of rewriting email code, our new Reminder Cron Job will simply *inject* our existing `QueueService` and pass it jobs!

---

## 🏗️ Proposed Implementation Architecture

### 1. Schema Update
We need to track anniversaries. We already have `dateOfBirth`.
#### [MODIFY] `backend/src/schemas/User.schema.ts`
- Add `anniversaryDate?: string;`

#### [MODIFY] `frontend/src/app/members/...`
- Add an "Anniversary" input field to the Add/Edit forms (similar to how we just added `email`).

### 2. The Reminders Module (Backend)
We will create a brand new, isolated feature module for cleanly organizing this logic.

#### [NEW] `backend/src/reminders/reminders.module.ts`
- Registers the module and imports our `BulkEmailModule` so we can reuse your email queue.
#### [NEW] `backend/src/reminders/reminders.service.ts`
- This is the brain. It will contain the `@Cron()` job.
- **Step 1:** At 8:00 AM, it queries MongoDB for matching birthdays/anniversaries.
- **Step 2:** It formats a nice "Happy Birthday" HTML email.
- **Step 3:** It sends those emails into your existing SQS Queue.

### 3. Application Setup
#### [MODIFY] `backend/src/app.module.ts`
- Import `ScheduleModule.forRoot()` (The engine that runs Cron jobs).
- Import our new `RemindersModule`.

---

## 🚀 Future Roadmap: AWS Lightsail Deployment
You mentioned wanting to push to AWS Lightsail next. Lightsail is essentially a simplified Virtual Private Server (VPS).
**Things to study for Lightsail:**
1. **Linux CLI:** You will get a raw Ubuntu server. You need to know how to navigate it (`cd`, `ls`, `nano`).
2. **PM2 (Process Manager):** You will use PM2 to keep your NestJS backend running forever, even if the server restarts.
3. **Nginx:** To route port 80 (HTTP) traffic to your local port 3000.
4. **Docker / Docker Compose:** (Optional but recommended) Since you are using LocalStack natively in compose, learning how to run your backend, frontend, and MongoDB together using `docker-compose.yml` on Lightsail will make your life 10x easier.

---

## Open Questions for You

1. Do you want this Cron Job to run at a specific time (e.g., 8:00 AM Standard Time)?
2. Should the reminder emails go *to the person having the birthday* (e.g., "Happy Birthday from the Church!"), or should they go *to the Admin* (e.g., "Reminder: It's John's birthday today!"), or both?

## Approval Required
Once you've digested the study material and answered the two questions above, let me know if you approve this plan and we will start coding!
