const express = require('express');
const { z } = require('zod');
const { get, run } = require('../db/database');

const router = express.Router();

const createAddressSchema = z.object({
  customerId: z.number().int().positive(),
  addressLine: z.string().trim().min(1, 'Address Line is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  pinCode: z.string().trim().min(4, 'Pin Code is required').max(10),
});

const updateAddressSchema = z.object({
  addressLine: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  state: z.string().trim().min(1).optional(),
  pinCode: z.string().trim().min(4).max(10).optional(),
}).refine((v) => Object.keys(v).length > 0, 'At least one field must be provided');

// POST /api/addresses
router.post('/', async (req, res) => {
  const db = req.app.locals.db;

  const body = { ...req.body };
  if (typeof body.customerId === 'string') body.customerId = Number(body.customerId);

  const parsed = createAddressSchema.safeParse(body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
  }

  const { customerId, addressLine, city, state, pinCode } = parsed.data;

  try {
    const customer = await get(db, `SELECT id FROM customers WHERE id = ?;`, [customerId]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const result = await run(
      db,
      `INSERT INTO addresses (customer_id, address_line, city, state, pin_code, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'));`,
      [customerId, addressLine, city, state, pinCode]
    );

    const addr = await get(
      db,
      `SELECT id, customer_id, address_line, city, state, pin_code, created_at, updated_at
       FROM addresses WHERE id = ?;`,
      [result.lastID]
    );

    res.status(201).json({
      message: 'Address added successfully',
      data: {
        id: addr.id,
        customerId: addr.customer_id,
        addressLine: addr.address_line,
        city: addr.city,
        state: addr.state,
        pinCode: addr.pin_code,
        createdAt: addr.created_at,
        updatedAt: addr.updated_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add address' });
  }
});

// PATCH /api/addresses/:id
router.patch('/:id', async (req, res) => {
  const db = req.app.locals.db;
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid address id' });

  const parsed = updateAddressSchema.safeParse(
    Object.fromEntries(Object.entries(req.body).filter(([, v]) => v !== undefined))
  );

  if (!parsed.success) {
    return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
  }

  try {
    const existing = await get(db, `SELECT id FROM addresses WHERE id = ?;`, [id]);
    if (!existing) return res.status(404).json({ message: 'Address not found' });

    const fields = [];
    const params = [];

    if (parsed.data.addressLine !== undefined) {
      fields.push('address_line = ?');
      params.push(parsed.data.addressLine);
    }
    if (parsed.data.city !== undefined) {
      fields.push('city = ?');
      params.push(parsed.data.city);
    }
    if (parsed.data.state !== undefined) {
      fields.push('state = ?');
      params.push(parsed.data.state);
    }
    if (parsed.data.pinCode !== undefined) {
      fields.push('pin_code = ?');
      params.push(parsed.data.pinCode);
    }

    params.push(id);

    await run(
      db,
      `UPDATE addresses SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?;`,
      params
    );

    const updated = await get(
      db,
      `SELECT id, customer_id, address_line, city, state, pin_code, created_at, updated_at
       FROM addresses WHERE id = ?;`,
      [id]
    );

    res.json({
      message: 'Address updated successfully',
      data: {
        id: updated.id,
        customerId: updated.customer_id,
        addressLine: updated.address_line,
        city: updated.city,
        state: updated.state,
        pinCode: updated.pin_code,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update address' });
  }
});

module.exports = router;
