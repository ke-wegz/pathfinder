# 🧭 PathFinder AI - Comprehensive Testing & Launch Readiness Checklist

Use this checklist to systematically verify every feature, visual transition, and system integration. This ensures that your application is flawless, extremely premium, and ready for your users!

---

## 🔒 1. Authentication & Signup Flows

### A. Signup and OTP Verification
* [ ] **Form Validation:**
  * Try submitting with empty fields. (Should show error banner).
  * Try a weak password (e.g. less than 8 characters, or letters only). (Check password strength indicator & check error message).
  * Try signup without clicking the "Terms and Conditions" checkbox. (Should show error banner).
* [ ] **Email Dispatch (Brevo API):**
  * Sign up with a new test email address.
  * Verify that the button spinner spins, and transitions successfully to the 6-digit OTP code entry screen.
  * Check the email inbox of the address you signed up with. Confirm the beautifully formatted HTML email arrives with the exact 6-digit code.
* [ ] **Logs Bypass Backup:**
  * Simulate a network block/disconnect or delete the `BREVO_API_KEY` from your environment.
  * Click Signup. Verify that the system handles the SMTP/API failure gracefully, prints the prominent **[TESTING BYPASS ACTIVE]** warning with the code in your **Render Server Logs**, and still lets you proceed to Step 2.
* [ ] **OTP Code Verification:**
  * Type an invalid 6-digit code. (Should show "Invalid verification code" error).
  * Wait 15 minutes or manually speed up your database clock to verify expiration behavior. (Should show code expired error).
  * Enter the correct 6-digit code from the email/logs. Confirm that the profile is created and you are redirected to the `/dashboard`.

### B. User Login & Session Persistence
* [ ] Log in with the newly created account. Verify that the login works seamlessly.
* [ ] Close the browser tab and reopen the site. Verify that your authentication state persists, and you are automatically logged back in.
* [ ] Click "Sign Out". Verify that your session is destroyed, and you are redirected to the landing page `/`.

---

## 🎨 2. Visual Excellence & Motion Design

### A. Slow-Moving Background Gradient
* [ ] **Light Mode:** 
  * Look closely at the background. Confirm a soft, slow-moving pastel flow across signature slate-50, blue-50, and purple-50 colors.
  * Verify that this gradient is visible on **every page** (Landing Page, Login, Signup, Dashboard, CV Builder, Goals, Profile, Settings, etc.). No full-page solid white blocks should cover it.
* [ ] **Dark Mode:**
  * Click the theme toggle (Sun/Moon icon).
  * Verify that the background seamlessly changes to a deep cosmic gradient sliding slowly through deep slate, indigo, and violet.
* [ ] **Hand-off & Smoothness:**
  * Verify that there are no lag spikes or CPU/GPU throttling during the gradient animation. It must glide completely fluidly in the background (18s-25s animation cycles).

### B. Theme Toggle (Light & Dark Mode)
* [ ] Click the toggle button in the Navbar. Verify that all typography, borders, headers, buttons, cards, and input fields adapt instantly and cleanly.
* [ ] Refresh the page after switching theme. Verify that your theme preference (Light or Dark) persists through `localStorage`.

---

## 📱 3. Mobile Responsiveness & Sidebar Drawer

### B. Landing Page Mobile Sidebar
* [ ] Resize your browser window to a mobile viewport, or open the landing page on a mobile device.
* [ ] **Opening Drawer:** Click the hamburger menu icon. Verify that the mobile menu drawer slides in smoothly from the right and stays open.
* [ ] **Icon Toggle:** Verify that the hamburger icon inside the button changes into an `X` icon smoothly when open.
* [ ] **Closing Drawer:**
  * Click the `X` close icon inside the menu. Verify it slides back off-screen.
  * Click the menu button to open it again, then click the **dark backdrop overlay**. Verify that the menu slides back and closes smoothly.
  * Click one of the links inside the mobile menu (e.g. Dashboard). Verify that it closes the drawer and redirects you to the destination.

### C. Inner Pages Mobile Sidebar (`MainLayout.jsx`)
* [ ] Navigate to the Dashboard `/dashboard` in mobile view.
* [ ] Click the menu button inside the authenticated dashboard navbar.
* [ ] Verify that the navigation drawer opens flawlessly and lets you navigate to Profile, CV Builder, Goals, etc.

---

## 🧭 4. Interactive Pages & Dashboard Features

### A. AI Interview `/interview`
* [ ] Open the Interview page.
* [ ] **Mobile Sidebar Drawer:** Verify that the drawer containing the Session History is toggleable on mobile viewports.
* [ ] **Dynamic Chat Interaction:**
  * Type a message and hit send. Verify that the message is rendered instantly.
  * Check the typing indicator/loading state while waiting for the AI response.
  * Verify that the AI response parses correctly and displays with premium typography.
* [ ] **Sidebar Sessions History:** Click an old session from the history. Verify that the chat area loads the historical session messages correctly.

### B. Goals Tracker `/goals`
* [ ] Create a new goal. Specify title, high/medium/low priority, and a calendar deadline.
* [ ] Verify that the goal is saved and is listed correctly in the dashboard overview with the calculated "Days Left" counter.
* [ ] Click the checkbox to toggle completion. Verify that the progress percentage bar fills up smoothly.

### C. Profile & Settings `/profile`
* [ ] Open the profile page.
* [ ] Add a new skill or interest. Verify that it appears instantly as a premium capsule badge.
* [ ] Edit your name, phone number, and location. Click **Save Profile**.
* [ ] Verify that the "Profile Completion Status" percentage changes dynamically based on filled details.

---

## 🌐 5. Network Performance & API Integrity
* [ ] Open the browser's developer console (F12) and inspect the **Network** tab.
* [ ] Check all API requests (`/api/users/profile`, `/api/goals`, `/api/interview`). Verify that they respond with `200` or `201` status codes.
* [ ] Confirm that error responses (such as a failed API request) do not cause a full-page crash, but show clear user-friendly Toast or Alert notifications.

---

## 🔒 6. Administrator Portal & Access Control Checks

### A. Admin Onboarding (CLI)
* [ ] Register a standard account (e.g. `admin@test.com`) via signup page.
* [ ] Open the backend terminal and run the promotion command:
  `node promoteUser.js admin@test.com`
* [ ] Verify that the console output confirms success and that the document under `users/` in Firestore has its `role` updated to `"Admin"`.

### B. Admin Sign In Portal (`/admin/login`)
* [ ] **Landing Page Navigation:** Click the "Admin Sign In" button in the landing page navbar/CTA. Verify it routes to `/admin/login`.
* [ ] **Casing & Caching:** Log in using a standard non-admin account. Verify it logs in, validates the user role, signs the user out immediately, and displays "Access denied: User is not an administrator."
* [ ] **Success Flow:** Log in using the promoted admin account (`admin@test.com`). Verify that the login works, and after a brief loading state (waiting for profile data), it routes to `/admin/dashboard`.

### C. Access Protection & Guard (`AdminRoute`)
* [ ] Log out of your admin account. Try to directly type `/admin/dashboard` or `/admin/users` in the URL bar.
* [ ] **Expected:** Verify that the system redirects you immediately to `/admin/login`.
* [ ] Log in as a standard user. Try to directly navigate to `/admin/dashboard` in the URL bar.
* [ ] **Expected:** Verify that the app catches the lack of credentials, displays the redirect logic, and redirects you back to `/admin/login` showing the access denied banner.

### D. Admin Sidebar Layout
* [ ] Toggle the Sidebar items. Verify that clicking "Dashboard", "Manage Users", "Manage Experts", "Manage Resources", and "Analytics Charts" routes to the respective views.
* [ ] Click "Back to App". Verify it takes you to the standard dashboard.
* [ ] Click "Sign Out". Verify it signs you out of Firebase and returns you to `/admin/login`.
* [ ] Resize the browser to mobile. Verify that the hamburger menu displays, toggles the mobile sidebar drawer open/close, and backdrop clicks close the drawer.

### E. User & Expert Management Panels
* [ ] **Disable/Enable Account:** Open "Manage Users", locate a standard user, and click "Disable". Verify the modal confirmation popup, confirm, and verify the user status tag changes to "Disabled". Verify that the disabled user cannot log in. Enable them and check that they can log in again.
* [ ] **Delete Account:** Click "Delete Account" on a user. Confirm and verify the user is deleted from Firebase Auth, Firestore `users`, `profiles`, and all related collections.
* [ ] **Expert Onboarding:** Open "Manage Experts", click "Onboard New Expert", fill out Name, Email, Password, Skills, and Education. Submit and check that they are registered in Firebase Auth and Firestore with the role `"Expert"`.
* [ ] **Remove Expert:** Click "Remove Expert" on an expert user card, confirm, and check that their account is deleted.

### F. Learning Resources CRUD & Fallback
* [ ] **On recommendations page fallback:** Log in as a standard user who has NOT taken the AI Interview (no recommendations). Open `/resources`. Verify that the page loads the live database resources added by the Admin instead of static mock resources.
* [ ] **Admin CRUD:** Open "Manage Resources", create a new resource, fill in title, provider, select type, direct URL, and topics. Submit and verify it appears.
* [ ] **Edit & Delete:** Edit the resource and verify updates. Delete it and verify it's removed.
* [ ] **Link navigation:** Click "View Resource" on the resource card in `/resources`. Verify it navigates directly to the database URL instead of performing a Google search.

### G. Analytics Charts
* [ ] Navigate to "Analytics Charts".
* [ ] Verify the **Daily API Requests** area chart renders with a purple gradient timeline.
* [ ] Verify the **Top API Routes** horizontal bar chart renders the top requested endpoints.
* [ ] Verify the **User Roles Distribution** donut pie chart correctly splits Admin, Expert, and Standard users.
* [ ] Verify the **Goal Completion Rate** donut pie chart shows completed vs active goal counts.
* [ ] Toggle dark/light mode and Arabic/English languages. Verify that Recharts styles and labels render properly in all modes.
