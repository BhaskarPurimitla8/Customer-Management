require('dotenv').config();

const express = require('express');
const cors = require('cors');

const customersRouter = require('./routes/customers');
const addressesRouter = require('./routes/addresses');
const { openDb, initSchema } = require('./db/database');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

const db = openDb();
initSchema(db);
app.locals.db = db;

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/customers', customersRouter);
app.use('/api/addresses', addressesRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
