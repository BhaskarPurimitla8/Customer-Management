require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { openDb, initSchema } = require('./db/database');
const { customersRouter } = require('./routes/customers');

async function createApp() {
  const app = express();
  const db = openDb();
  await initSchema(db);

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/customers', customersRouter(db));

  // Basic 404
  app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

  return { app, db };
}

module.exports = { createApp };
