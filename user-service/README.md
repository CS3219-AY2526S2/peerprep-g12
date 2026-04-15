# User Service
The User Service handles authentication, user management, and authorization for the PeerPrep platform.

Built using:
- Node.js + Express
- Supabase Auth (authentication)
- Supabase Postgres (user profiles)

## Setup
Prerequisites:
- Node.js (LTS)
- Supabase project

## Environment Variables
Create a `.env` file in the user-service directory:
```
PORT=3000
SUPABASE_URL=<your_supabase_url>
SUPABASE_ANON_KEY=<your_anon_key>
SUPABASE_SERVICE_KEY=<your_service_role_key>
```

## Supabase Setup
Ensure you have:
- Authentication enabled (Email/Password)
- A schema: `userservice`
- A table: `profiles` with fields:
    - `id` (UUID, matches auth.users.id)
    - `username`
    - `email`
    - `user_role` (e.g. "user", "admin")
- A trigger that inserts into `profiles` on signup.

## Running the Service
In Terminal:
```
npm install
npm start
```
Or in development mode:
```
npm run dev
```
The service runs on: `http://localhost:3000`

## API Endpoints

### Auth

#### Signup: 
`POST /auth/signup`

#### Login:
`POST /auth/login`

#### Logout:
`POST /auth/logout`

---

### User

#### Get Current User Info:
`GET /user/getUserInfo`

#### Update Username:
`PATCH /user/username`

#### Check Username Availability:
`GET /user/checkUniqueUsername?username=<username>`

#### Delete Own Account:
`DELETE /user/deleteAccount`

---

### Admin

#### Promote User to Admin:
`PATCH /admin/role/:userId`

#### Get All Users:
`GET /admin/allUsers`

---

### Password Reset

#### Request Password Reset:
`POST /auth/requestResetPassword`

#### Reset Password:
`POST /auth/resetPassword`

## Limitations

### Supabase Email Rate Limits
Supabase (free plan) enforces a rate limit on authentication-related emails (e.g. signup confirmation and password reset emails).

- Limit: Approximately 2 emails per hour per user
- Affects:
  - `/auth/signup`
  - `/auth/requestResetPassword`

If the rate limit is exceeded:
- Requests will fail with errors (e.g. 429 or 500 depending on context)
- Users may not receive confirmation or reset emails

---

### Email Verification (Magic Link Scanning)
Supabase verifies users via email confirmation links (magic links).

However, some email providers (e.g. institutional or enterprise emails like `@u.nus.edu`) may have security systems that:
- Automatically scan incoming emails
- Open links to check for malicious content

This can result in:
- Magic links being triggered automatically
- Emails being marked as "verified" without user interaction

Implication:
- Users may appear as “verified” immediately after signup

Note: this is due to external email security systems, not a bug in the service