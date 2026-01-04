const { z } = require('zod');

// Basic client-side validation is required by the assignment, but we also validate on the server.

const customerCreateSchema = z.object({
  firstName: z.string().trim().min(1, 'First Name is required'),
  lastName: z.string().trim().min(1, 'Last Name is required'),
  phoneNumber: z.string().trim().min(10, 'Phone Number must be at least 10 digits').max(15, 'Phone Number is too long'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  pinCode: z.string().trim().min(4, 'Pin Code is required').max(10, 'Pin Code is too long'),
});

const customerUpdateSchema = z.object({
  firstName: z.string().trim().min(1, 'First Name is required'),
  lastName: z.string().trim().min(1, 'Last Name is required'),
  phoneNumber: z.string().trim().min(10, 'Phone Number must be at least 10 digits').max(15, 'Phone Number is too long'),
});

const addressCreateSchema = z.object({
  addressLine: z.string().trim().min(1, 'Address Line is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  pinCode: z.string().trim().min(4, 'Pin Code is required').max(10, 'Pin Code is too long'),
});

const addressUpdateSchema = addressCreateSchema;

module.exports = {
  customerCreateSchema,
  customerUpdateSchema,
  addressCreateSchema,
  addressUpdateSchema,
};
