# Customer Management Application

A full-stack **Customer Management App** built with **React (React Router)**, **Node.js (Express.js)**, and **SQLite**. It supports full CRUD for **Customers** and **Multiple Addresses per Customer**, along with search/filtering and smooth navigation.

---

## Tech Stack

- **Frontend:** React + React Router (Vite)
- **Backend:** Node.js + Express.js
- **Database:** SQLite

---

## Features Implemented

### Customer Management (CRUD)
- ✅ Create a customer (First Name, Last Name, Phone Number, City, State, Pin Code)
- ✅ Basic client-side validation (required fields + phone number length)
- ✅ List all customers (from SQLite via backend API)
- ✅ Customer details page (by customer ID)
- ✅ Update customer fields: **First Name, Last Name, Phone Number**
- ✅ Delete customer (with confirmation + permanent removal)

### Multiple Addresses
- ✅ Add multiple addresses per customer
- ✅ Addresses stored in a separate table linked using `customer_id` (foreign key)
- ✅ View all addresses for a customer on details page
- ✅ Clear indicator for:
  - One Address
  - Multiple Addresses
- ✅ Update address fields while maintaining correct association

### Search & Filter
- ✅ Filter customers by **City / State / Pin Code**
- ✅ Clear/Reset filters button to reload full list

### Page Navigation
- ✅ React Router pages:
  - Customer List
  - Create Customer
  - Customer Details

### Bonus
- ✅ Basic pagination (Prev/Next)

---

## Folder Structure

```
customer-management-app/
  backend/
    src/
      db/
      routes/
      index.js
    .env.example
    package.json
  frontend/
    src/
      components/
      pages/
      styles/
      App.jsx
      main.jsx
    .env.example
    package.json
  data/               # SQLite DB will be created here
  .gitignore
  README.md
```

---

## Setup & Run Locally

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend will run on: `http://localhost:5000`

Health check:
- `GET /health`

### 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend will run on: `http://localhost:5173`

> If your backend runs on a different URL/port, update `frontend/.env`:
> `VITE_API_BASE=http://localhost:5000`

---

## API Summary

### Customers
- `GET /api/customers?city=&state=&pinCode=&page=&limit=`
- `POST /api/customers`
- `GET /api/customers/:id` (includes addresses)
- `PATCH /api/customers/:id` (firstName, lastName, phoneNumber only)
- `DELETE /api/customers/:id`

### Addresses
- `POST /api/addresses`
- `PATCH /api/addresses/:id`

---

## Screenshots

Add screenshots here after running locally:
- Customer List
- Create Customer
- Customer Details (with multiple addresses)

---

## Deployment Notes (Optional)

- **Frontend:** Vercel or Netlify
- **Backend:** Render

Make sure to set environment variables accordingly:
- Backend: `PORT`, `CORS_ORIGIN`, `SQLITE_PATH`
- Frontend: `VITE_API_BASE`

---

## Submission

Push this repository to GitHub and submit the GitHub link (and hosted links if required).
