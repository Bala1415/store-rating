# Store Rating Web Application — Demo Recording & Walkthrough Guide

This guide provides a structured, step-by-step checklist for recording a live demonstration video of the **Store Rating Portal** for the Roxiler Systems Full-Stack Coding Challenge.

---

## Pre-Demo Checklist

1. **MySQL Service Running**: Ensure the `MySQL80` service is running and the database is initialized (`npm run db:init` followed by `npm run db:seed`).
2. **Backend Server Running**: Start backend via `npm run start:backend` (accessible at `http://localhost:5000/api/health`).
3. **Frontend Server Running**: Start frontend via `npm run start:frontend` (accessible at `http://localhost:5173`).
4. **Browser Clean State**: Use an incognito/private browser window or clear cookies to start fresh.

---

## 10-Step Video Demonstration Script

### Step 1: Unified Login Page (0:00 - 0:45)
- Open `http://localhost:5173/login`.
- **Explain**: Point out the clean, unified login interface used by all three roles (**System Administrator**, **Normal User**, and **Store Owner**).
- Highlight the security model: No tokens are stored in `localStorage` or `sessionStorage`; authentication uses secure, **HttpOnly cookies** to prevent XSS attacks.
- Note the demo quick-login buttons provided for rapid evaluation.

### Step 2: System Administrator Login & Dashboard Statistics (0:45 - 1:45)
- Click the **Admin** demo login button or enter `admin@roxiler.com` / `Admin@1234`.
- Click **Sign In**.
- **Explain**:
  - Show the Admin Dashboard landing page.
  - Review the three database-backed statistic cards:
    - **Registered Users** count
    - **Total Stores** count
    - **Submitted Ratings** count
  - Explain that these metrics are queried directly from the MySQL database using live SQL aggregates (`COUNT(*)`), with zero hardcoded numbers.

### Step 3: Admin User Management & Inspection (1:45 - 3:15)
- Navigate to **Users** in the top navigation (`/admin/users`).
- Demonstrate **Filtering**:
  - Filter by Name, Email, Address, or Role (select `STORE_OWNER` or `USER`).
- Demonstrate **Sorting**:
  - Sort by Name Ascending / Descending.
- Click **➕ Add New User**:
  - Show the live character counter enforcing the assignment's Name constraint (**minimum 20 and maximum 60 characters**).
  - Demonstrate input validation (password requiring 8–16 chars, uppercase, and special character).
  - Create a new Store Owner account (e.g. `Store Owner Evelyn Eastside`, `evelyn.owner@roxiler.com`, `Owner@1234`, Role: `STORE_OWNER`).
- Click **View Details** on an existing Store Owner:
  - Demonstrate the detailed inspector displaying the owner's linked store, overall store rating, and total review count.

### Step 4: Admin Store Management & Ownership Association (3:15 - 4:15)
- Navigate to **Stores** in the top navigation (`/admin/stores`).
- Demonstrate filtering and sorting (by store name, email, average rating).
- Click **➕ Add New Store**:
  - Enter Store Name (20–60 characters: e.g. `Downtown Organic Coffee & Bistro`).
  - Enter Store Email and Address.
  - Select an associated **Store Owner** from the dropdown.
  - Explain that store ownership is explicitly modeled and enforced via a foreign key (`stores.owner_user_id -> users.id`).
  - Submit the store and observe it appearing in the table.

### Step 5: Normal User Signup & Store Discovery (4:15 - 5:30)
- Log out from the Admin account.
- Click **Sign Up** (`/signup`).
- Register a new Normal User:
  - Name: `Customer Matthew Montgomery` (28 chars).
  - Email: `matthew.customer@gmail.com`.
  - Password: `User@1234`.
  - Address: `500 Maple Boulevard, Suite 12`.
- Notice that public signup automatically assigns the `USER` role; public visitors cannot elevate themselves to Admin or Store Owner.
- Upon signup, observe automatic redirect to `/stores`.
- Demonstrate **Store Search**:
  - Search by store name (e.g. "Bakery") or address ("Boulevard").
  - Clear the search to restore the complete list.

### Step 6: Rating Submission & Rating Modification (5:30 - 6:45)
- On the store list, locate a store (e.g. `Downtown Gourmet Artisan Bakery`).
- Note the store's current overall rating and review count.
- **Submit a new rating**:
  - Click on 5 stars in the interactive star selector.
  - Click **Submit Rating**.
  - Show the success alert: *"Your rating of 5 stars for 'Downtown Gourmet Artisan Bakery' has been submitted."*
  - Point out that the store's overall rating and count updated dynamically via backend calculation.
- **Modify the existing rating**:
  - Click on 4 stars.
  - Notice the button changes to **Modify Rating**.
  - Click **Modify Rating**.
  - Show the confirmation: *"Your rating for 'Downtown Gourmet Artisan Bakery' has been updated to 4 stars."*
  - **Explain**: Verify that modifying an existing rating updates the record (`(user_id, store_id)` unique constraint) and never creates a duplicate row!

### Step 7: Store Owner Login & Dedicated Dashboard (6:45 - 8:00)
- Log out of the Normal User account.
- Log in as the Store Owner: `alice.owner@roxiler.com` / `Owner@1234`.
- **Explain**:
  - The application detects the `STORE_OWNER` role and routes directly to `/owner/dashboard`.
  - Show the Store Header (store name, email, verified badge).
  - Show the **Overall Average Rating** and **Total Reviews** metrics.
  - Show the **Customer Ratings Submissions** table:
    - Lists customer name, customer email, star rating, and timestamp.
    - Show the updated rating submitted in Step 6!
  - **Explain Security Check**: If an owner attempts to query ratings for a store they do not own, the backend denies access.

### Step 8: Store Owner Empty State Test (8:00 - 8:45)
- Log out and log in as `charles.owner@roxiler.com` / `Owner@1234`.
- Demonstrate the **Clean Empty State**:
  - Rather than crashing or showing a broken UI, the portal displays a friendly informational message: *"No Store Associated Yet — Please contact a System Administrator to link your store."*

### Step 9: Password Change Flow (8:45 - 9:30)
- Click the **Password** button in the navbar.
- Open the modal.
- Enter current password (`Owner@1234`) and a new password (`Owner#9999`).
- Confirm and submit.
- Show the success alert and verify successful update.
- Demonstrate **Logout**: Click Logout, verifying the session cookie is cleared and user is redirected to `/login`.

### Step 10: Architectural Summary & Technical Explanation (9:30 - 11:00)
Conclude the video with a brief technical summary:
1. **Frontend**: React.js with React Router 6, custom CSS with responsive design, Axios with `withCredentials: true`.
2. **Backend**: Express.js with modular routing, centralized validation, parameterization for SQL injection protection, and rate limiting against brute-force attacks.
3. **Database**: MySQL 8.0 schema `store_rating_db` with `users`, `stores`, and `ratings` tables, enforced foreign keys, `CHECK` constraints, unique composite keys, and index optimizations.
4. **Security**: Passwords hashed with `bcryptjs` (salt rounds 10), JWT tokens signed with HMAC-SHA256 stored exclusively in `HttpOnly` cookies, strict role middleware (`requireRoles`).
