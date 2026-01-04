# Backend (Node.js + Express + SQLite)

## Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## API

- `GET /health`
- `GET /api/customers?city=&state=&pinCode=&page=&limit=`
- `POST /api/customers`
- `GET /api/customers/:id`
- `PUT /api/customers/:id`
- `DELETE /api/customers/:id`
- `POST /api/customers/:id/addresses`
- `PUT /api/customers/:id/addresses/:addressId`
