# Future Implementation: One-Off Scheduled Reminders

This document tracks the planned architecture for dynamic, admin-created scheduled reminders. This will be implemented in a future phase.

## Phase 1: Database Schema
### `ScheduledReminder.schema.ts`
- `churchId`: ObjectId (ref: 'Church')
- `createdBy`: ObjectId (ref: 'User')
- `memberId`: ObjectId (ref: 'User')
- `templateId?`: ObjectId (ref: 'Template')
- `subject`: string
- `body`: string
- `scheduledAt`: Date (stored as UTC)
- `status`: enum('PENDING', 'QUEUED', 'SENT', 'FAILED')
- `sentAt?`: Date
- `failedReason?`: string

## Phase 2: Heartbeat Dispatcher
A single cron job running every minute that:
1. Queries MongoDB for all reminders where `status === 'PENDING'` and `scheduledAt <= now`.
2. Marks them as `QUEUED` immediately.
3. Enqueues them to SQS.
4. Passes the `reminderId` to SQS for the worker to update status on completion.

## Phase 3: Worker Update
Update `mailer.service.ts` to:
1. Accept `reminderId`.
2. Update the `ScheduledReminder` status to `SENT` or `FAILED` after the SES attempt.

## Phase 4: REST API & Frontend
- CRUD endpoints for reminders.
- A "Reminders" dashboard in the React frontend.
- A creation form with a datetime picker and template selector.
