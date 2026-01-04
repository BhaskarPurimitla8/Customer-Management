import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import Toast from '../components/Toast.jsx'

function validate(form) {
  const errors = {}
  const required = ['firstName', 'lastName', 'phoneNumber', 'city', 'state', 'pinCode']
  required.forEach((k) => {
    if (!form[k]?.trim()) errors[k] = 'This field is required'
  })
  if (form.phoneNumber && form.phoneNumber.trim().length < 10) errors.phoneNumber = 'Phone Number must be at least 10 digits'
  return errors
}

export default function CreateCustomerPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    city: '',
    state: '',
    pinCode: ''
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  function onChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setErrors((p) => ({ ...p, [name]: '' }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    const v = validate(form)
    setErrors(v)
    if (Object.keys(v).length) return

    setSaving(true)
    try {
      const res = await api.createCustomer(form)
      setToast({ message: 'Customer created successfully', type: 'success' })
      // Go to details page
      setTimeout(() => navigate(`/customers/${res.data.id}`), 600)
    } catch (err) {
      setToast({ message: err.message || 'Failed to create customer', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Add Customer</h1>
      </div>

      <form className="card" onSubmit={onSubmit}>
        <div className="card-title">Customer Information</div>

        <div className="grid grid-2">
          <div className="field">
            <label>First Name</label>
            <input name="firstName" value={form.firstName} onChange={onChange} placeholder="First name" />
            {errors.firstName && <div className="error">{errors.firstName}</div>}
          </div>
          <div className="field">
            <label>Last Name</label>
            <input name="lastName" value={form.lastName} onChange={onChange} placeholder="Last name" />
            {errors.lastName && <div className="error">{errors.lastName}</div>}
          </div>
          <div className="field">
            <label>Phone Number</label>
            <input name="phoneNumber" value={form.phoneNumber} onChange={onChange} placeholder="10+ digits" />
            {errors.phoneNumber && <div className="error">{errors.phoneNumber}</div>}
          </div>
          <div className="field">
            <label>City</label>
            <input name="city" value={form.city} onChange={onChange} placeholder="City" />
            {errors.city && <div className="error">{errors.city}</div>}
          </div>
          <div className="field">
            <label>State</label>
            <input name="state" value={form.state} onChange={onChange} placeholder="State" />
            {errors.state && <div className="error">{errors.state}</div>}
          </div>
          <div className="field">
            <label>Pin Code</label>
            <input name="pinCode" value={form.pinCode} onChange={onChange} placeholder="Pin code" />
            {errors.pinCode && <div className="error">{errors.pinCode}</div>}
          </div>
        </div>

        <div className="row row-end">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Create Customer'}
          </button>
        </div>
      </form>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  )
}
