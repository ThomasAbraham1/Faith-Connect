# TODO - Later Features

## Event Registrations: Add Member Manually
- **What:** Add an "Add Member" button to the Registrants tab in EventDetail.tsx
- **Backend:** Endpoint already exists: `POST /events/:id/registrations` with `{ memberId }`
- **Frontend Needed:**
  - "Add Member" button in the Registrants tab header
  - A searchable member selection dialog (search by name or phone)
  - A mutation to call the backend endpoint and invalidate the registrations query cache

