# ⚙️ PathFinder AI - Backend Components QA & Testing Checklist

This checklist focuses entirely on testing the server-side architecture, API endpoints, database structures, background workers, and security protocols of your Express/Firebase backend.

---

## 🏗️ 1. Server Core & Database Integrity

* [ ] **Server Boot & Health Check:**
  * Start the server (`npm run dev` or `npm start`). Verify it connects to Port `5000` without throwing any uncaught errors.
  * Send a `GET` request to `http://localhost:5000/health`. Verify it returns `200 OK` with `{ "status": "success", "message": "API is running" }`.
* [ ] **Firebase / Mongoose Connection:**
  * Verify `serviceAccountKey.json` initializes successfully with `firebase-admin`.
  * Ensure Firestore collections (`users`, `otps`, `goals`, `chats`, `notifications`) connect cleanly.

---

## 👤 2. User & Authentication Module (`/api/users`)

### A. OTP Verification Endpoints
* [ ] **OTP Send (`POST /api/users/otp/send`):**
  * Send payload without `email`. (Should return `400 Bad Request`).
  * Send invalid email string. (Should return `400 Bad Request`).
  * Send an email that is already registered in Firebase Auth. (Should return `400` with `"This email is already registered"`).
  * Send a valid unregistered email. Verify:
    1. A document is created in the Firestore `otps` collection with the email as the doc ID.
    2. The document contains fields: `email`, `otp`, `expiresAt`, `verified: false`, and `createdAt`.
    3. Brevo's HTTPS API returns `201 Created` or triggers the logs bypass gracefully.
* [ ] **OTP Verify (`POST /api/users/otp/verify`):**
  * Submit incorrect code. (Should return `400` with `"Invalid verification code"`).
  * Submit a code after 15 minutes. (Should return `400` with `"Verification code has expired"`).
  * Submit correct code. Verify:
    1. The doc in Firestore `otps` collection is updated with `verified: true` and `verifiedAt`.
    2. Returns `200 OK` with success message.

### B. Registration & Profiles
* [ ] **User Registration (`POST /api/users/register`):**
  * Submit request without valid Firebase auth header. (Should return `401 Unauthorized`).
  * Verify that a newly registered user profile document is initialized in the `users` collection with default arrays (`skills`, `interests`, `careerGoals`).
* [ ] **Profile CRUD (`GET` & `PATCH` `/api/users/profile`):**
  * Check `GET` profile returns clean JSON matching the authenticated user UID.
  * Send a `PATCH` request updating skills/interests arrays. Verify Firestore updates instantly.
* [ ] **Data Reset & Deletion (`DELETE` `/api/users/account` & `/api/users/reset-data`):**
  * Send reset request. Verify it purges goals and chats, but keeps base user metadata.
  * Send account deletion request. Verify the Firebase Auth profile and Firestore user document are completely purged.

---

## 🤖 3. AI Interview Module (`/api/interview`)

* [ ] **Groq API Connection:**
  * Start an interview session. Verify the backend successfully makes an HTTPS request to the Groq AI provider client.
  * Verify the backend handles streaming responses or parses JSON payloads smoothly.
* [ ] **Session Archiving:**
  * Verify chat messages are stored sequentially in the Firestore `chats` collection under the correct `sessionId`.
  * Verify that retrieving session history returns a correctly structured chronological array of messages.

---

## 🎯 4. Goals & Roadmap Modules (`/api/goals`)

* [ ] **Goals CRUD Operations:**
  * **Create:** Send `POST /api/goals` with text, category, priority, and deadline. (Check `201` response & check Firestore document creation under user UID).
  * **Read:** Send `GET /api/goals`. (Check returns only the goals belonging to that specific user).
  * **Update:** Send `PATCH /api/goals/:id` modifying completion status or progress percentage. (Check database update).
  * **Delete:** Send `DELETE /api/goals/:id`. (Check document is removed from database).

---

## ⏰ 5. Background Workers (`deadlineWorker.js`)

* [ ] **Worker Initialization:**
  * Start the server. Verify log: `[Deadline Worker] Scheduler started running...`
* [ ] **Cron Execution Logic:**
  * Set a goal deadline to 24 hours from now.
  * Force the cron schedule to trigger (or wait for scheduled check).
  * Verify:
    1. The worker successfully scans Firestore for goals expiring soon.
    2. The worker automatically creates a document in the `notifications` collection targeting the goal's owner.
    3. The notification correctly lists the upcoming deadline.

---

## 🛡️ 6. API Security, Middlewares & Error Handling

* [ ] **Auth Token Protection (`protect` middleware):**
  * Attempt to hit *any* protected route (`/api/profile`, `/api/goals`, etc.) with:
    * No `Authorization` header. (Should return `401 Unauthorized`).
    * An expired or malformed token. (Should return `401 Unauthorized`).
* [ ] **Rate Limiter (`express-rate-limit`):**
  * Attempt to flood `/api/users/otp/send` with 20+ requests in a minute.
  * Verify that the server begins returning `429 Too Many Requests`.
* [ ] **Error Handler (`errorHandler.js`):**
  * Intentionally trigger a database error (e.g. sending bad ObjectID structure).
  * Verify that the middleware catches it, logs the error stack to the backend terminal, and returns a standardized clean JSON response:
    ```json
    {
      "success": false,
      "error": "Resource not found with id of XXXXXX"
    }
    ```
