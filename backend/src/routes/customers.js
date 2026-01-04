const express = require('express');
const { z } = require('zod');
const { all, get, run } = require('../db/database');

const router = express.Router();

const createCustomerSchema = z.object({
  firstName: z.string().trim().min(1, 'First Name is required'),
  lastName: z.string().trim().min(1, 'Last Name is required'),
  phoneNumber: z.string().trim().min(10, 'Phone Number must be at least 10 digits').max(15, 'Phone Number too long'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  pinCode: z.string().trim().min(4, 'Pin Code is required').max(10),
});

const updateCustomerSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  phoneNumber: z.string().trim().min(10).max(15).optional(),
}).refine((v) => Object.keys(v).length > 0, 'At least one field must be provided');

// GET /api/customers?city=&state=&pinCode=&page=&limit=
router.get('/', async (req, res) => {
  const db = req.app.locals.db;
  const { city, state, pinCode } = req.query;
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
  const offset = (page - 1) * limit;

  const where = [];
  const params = [];

  if (city) {
    where.push('LOWER(city) LIKE LOWER(?)');
    params.push(`%${city}%`);
  }
  if (state) {
    where.push('LOWER(state) LIKE LOWER(?)');
    params.push(`%${state}%`);
  }
  if (pinCode) {
    where.push('pin_code LIKE ?');
    params.push(`%${pinCode}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const totalRow = await get(db, `SELECT COUNT(*) as total FROM customers ${whereSql};`, params);
    const rows = await all(
      db,
      `SELECT id, first_name, last_name, phone_number, city, state, pin_code, created_at, updated_at
       FROM customers
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?;`,
      [...params, limit, offset]
    );

    res.json({
      data: rows.map((r) => ({
        id: r.id,
        firstName: r.first_name,
        lastName: r.last_name,
        phoneNumber: r.phone_number,
        city: r.city,
        state: r.state,
        pinCode: r.pin_code,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
      pagination: {
        page,
        limit,
        total: totalRow?.total || 0,
        totalPages: Math.ceil((totalRow?.total || 0) / limit) || 1,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

// POST /api/customers
router.post('/', async (req, res) => {
  const db = req.app.locals.db;
  const parsed = createCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
  }

  const { firstName, lastName, phoneNumber, city, state, pinCode } = parsed.data;

  try {
    const result = await run(
      db,
      `INSERT INTO customers (first_name, last_name, phone_number, city, state, pin_code, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'));`,
      [firstName, lastName, phoneNumber, city, state, pinCode]
    );

    const customer = await get(
      db,
      `SELECT id, first_name, last_name, phone_number, city, state, pin_code, created_at, updated_at
       FROM customers WHERE id = ?;`,
      [result.lastID]
    );

    res.status(201).json({
      message: 'Customer created successfully',
      data: {
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phoneNumber: customer.phone_number,
        city: customer.city,
        state: customer.state,
        pinCode: customer.pin_code,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create customer' });
  }
});

// GET /api/customers/:id (with addresses)
router.get('/:id', async (req, res) => {
  const db = req.app.locals.db;
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid customer id' });

  try {
    const customer = await get(
      db,
      `SELECT id, first_name, last_name, phone_number, city, state, pin_code, created_at, updated_at
       FROM customers WHERE id = ?;`,
      [id]
    );
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const addresses = await all(
      db,
      `SELECT id, customer_id, address_line, city, state, pin_code, created_at, updated_at
       FROM addresses WHERE customer_id = ?
       ORDER BY created_at DESC;`,
      [id]
    );

    res.json({
      data: {
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phoneNumber: customer.phone_number,
        city: customer.city,
        state: customer.state,
        pinCode: customer.pin_code,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
        addresses: addresses.map((a) => ({
          id: a.id,
          customerId: a.customer_id,
          addressLine: a.address_line,
          city: a.city,
          state: a.state,
          pinCode: a.pin_code,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
        })),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch customer' });
  }
});

// PATCH /api/customers/:id (only firstName, lastName, phoneNumber)
router.patch('/:id', async (req, res) => {
  const db = req.app.locals.db;
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid customer id' });

  const allowed = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNumber: req.body.phoneNumber,
  };

  const parsed = updateCustomerSchema.safeParse(
    Object.fromEntries(Object.entries(allowed).filter(([, v]) => v !== undefined))
  );

  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
  }

  try {
    const existing = await get(db, `SELECT id FROM customers WHERE id = ?;`, [id]);
    if (!existing) return res.status(404).json({ message: 'Customer not found' });

    const fields = [];
    const params = [];

    if (parsed.data.firstName !== undefined) {
      fields.push('first_name = ?');
      params.push(parsed.data.firstName);
    }
    if (parsed.data.lastName !== undefined) {
      fields.push('last_name = ?');
      params.push(parsed.data.lastName);
    }
    if (parsed.data.phoneNumber !== undefined) {
      fields.push('phone_number = ?');
      params.push(parsed.data.phoneNumber);
    }

    params.push(id);

    await run(
      db,
      `UPDATE customers SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?;`,
      params
    );

    const updated = await get(
      db,
      `SELECT id, first_name, last_name, phone_number, city, state, pin_code, created_at, updated_at
       FROM customers WHERE id = ?;`,
      [id]
    );

    res.json({
      message: 'Customer updated successfully',
      data: {
        id: updated.id,
        firstName: updated.first_name,
        lastName: updated.last_name,
        phoneNumber: updated.phone_number,
        city: updated.city,
        state: updated.state,
        pinCode: updated.pin_code,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update customer' });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', async (req, res) => {
  const db = req.app.locals.db;
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid customer id' });

  try {
    const existing = await get(db, `SELECT id FROM customers WHERE id = ?;`, [id]);
    if (!existing) return res.status(404).json({ message: 'Customer not found' });

    await run(db, `DELETE FROM customers WHERE id = ?;`, [id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete customer' });
  }
});

module.exports = router;
