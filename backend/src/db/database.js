const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.SQLITE_PATH || path.join(__dirname, '../../data/app.db');

function openDb() {
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');
  });
  return db;
}

function initSchema(db) {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pin_code TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        address_line TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pin_code TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      );`
    );

    db.run(`CREATE INDEX IF NOT EXISTS idx_customers_city ON customers(city);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_customers_state ON customers(state);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_customers_pin ON customers(pin_code);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_addresses_customer ON addresses(customer_id);`);
  });
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = {
  DB_PATH,
  openDb,
  initSchema,
  run,
  get,
  all,
};
