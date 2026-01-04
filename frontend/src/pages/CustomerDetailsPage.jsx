import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'
import Toast from '../components/Toast.jsx'

function validateCustomerEdits(form) {
  const errors = {}
  if (!form.firstName?.trim()) errors.firstName = 'First Name is required'
  if (!form.lastName?.trim()) errors.lastName = 'Last Name is required'
  if (!form.phoneNumber?.trim()) errors.phoneNumber = 'Phone Number is required'
  if (form.phoneNumber && form.phoneNumber.trim().length < 10) errors.phoneNumber = 'Phone Number must be at least 10 digits'
  return errors
}

function validateAddress(form) {
  const errors = {}
  const required = ['addressLine', 'city', 'state', 'pinCode']
  required.forEach((k) => {
    if (!form[k]?.trim()) errors[k] = 'This field is required'
  })
  return errors
}

export default function CustomerDetailsPage() {
  const { id } = useParams()
  const customerId = Number(id)

  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState(null)
  const [edit, setEdit] = useState({ firstName: '', lastName: '', phoneNumber: '' })
  const [editErrors, setEditErrors] = useState({})
  const [savingCustomer, setSavingCustomer] = useState(false)

  const [addressForm, setAddressForm] = useState({ addressLine: '', city: '', state: '', pinCode: '' })
  const [addressErrors, setAddressErrors] = useState({})
  const [addingAddress, setAddingAddress] = useState(false)

  const [editingAddressId, setEditingAddressId] = useState(null)
  const [editingAddressForm, setEditingAddressForm] = useState({ addressLine: '', city: '', state: '', pinCode: '' })
  const [editingAddressErrors, setEditingAddressErrors] = useState({})
  const [savingAddress, setSavingAddress] = useState(false)

  const [toast, setToast] = useState({ message: '', type: 'success' })

  const addressCount = useMemo(() => customer?.addresses?.length || 0, [customer])

  async function load() {
    setLoading(true)
    try {
      const res = await api.getCustomer(customerId)
      setCustomer(res.data)
      setEdit({
        firstName: res.data.firstName || '',
        lastName: res.data.lastName || '',
        phoneNumber: res.data.phoneNumber || ''
      })
    } catch (e) {
      setToast({ message: e.message || 'Failed to load customer', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (Number.isNaN(customerId)) return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])

  function onEditChange(e) {
    const { name, value } = e.target
    setEdit((p) => ({ ...p, [name]: value }))
    setEditErrors((p) => ({ ...p, [name]: '' }))
  }

  async function saveCustomer() {
    const v = validateCustomerEdits(edit)
    setEditErrors(v)
    if (Object.keys(v).length) return

    setSavingCustomer(true)
    try {
      await api.updateCustomer(customerId, {
        firstName: edit.firstName,
        lastName: edit.lastName,
        phoneNumber: edit.phoneNumber
      })
      setToast({ message: 'Customer updated successfully', type: 'success' })
      load()
    } catch (e) {
      setToast({ message: e.message || 'Failed to update customer', type: 'error' })
    } finally {
      setSavingCustomer(false)
    }
  }

  function onAddressChange(e) {
    const { name, value } = e.target
    setAddressForm((p) => ({ ...p, [name]: value }))
    setAddressErrors((p) => ({ ...p, [name]: '' }))
  }

  async function addAddress(e) {
    e.preventDefault()
    const v = validateAddress(addressForm)
    setAddressErrors(v)
    if (Object.keys(v).length) return

    setAddingAddress(true)
    try {
      await api.addAddress({ customerId, ...addressForm })
      setToast({ message: 'Address added successfully', type: 'success' })
      setAddressForm({ addressLine: '', city: '', state: '', pinCode: '' })
      load()
    } catch (err) {
      setToast({ message: err.message || 'Failed to add address', type: 'error' })
    } finally {
      setAddingAddress(false)
    }
  }

  function startEditAddress(addr) {
    setEditingAddressId(addr.id)
    setEditingAddressForm({
      addressLine: addr.addressLine || '',
      city: addr.city || '',
      state: addr.state || '',
      pinCode: addr.pinCode || ''
    })
    setEditingAddressErrors({})
  }

  function cancelEditAddress() {
    setEditingAddressId(null)
    setEditingAddressForm({ addressLine: '', city: '', state: '', pinCode: '' })
    setEditingAddressErrors({})
  }

  function onEditingAddressChange(e) {
    const { name, value } = e.target
    setEditingAddressForm((p) => ({ ...p, [name]: value }))
    setEditingAddressErrors((p) => ({ ...p, [name]: '' }))
  }

  async function saveAddress() {
    const v = validateAddress(editingAddressForm)
    setEditingAddressErrors(v)
    if (Object.keys(v).length) return

    setSavingAddress(true)
    try {
      await api.updateAddress(editingAddressId, editingAddressForm)
      setToast({ message: 'Address updated successfully', type: 'success' })
      cancelEditAddress()
      load()
    } catch (e) {
      setToast({ message: e.message || 'Failed to update address', type: 'error' })
    } finally {
      setSavingAddress(false)
    }
  }

  if (Number.isNaN(customerId)) {
    return <div className="card">Invalid customer ID.</div>
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Customer Details</h1>
          <div className="muted">
            <Link to="/customers" className="link">← Back to Customers</Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card"><div className="skeleton">Loading...</div></div>
      ) : !customer ? (
        <div className="card"><div className="empty">Customer not found.</div></div>
      ) : (
        <>
          <div className="card">
            <div className="row row-between">
              <div className="card-title">Profile</div>
              <div className="pill">
                {addressCount <= 1 ? 'One Address' : `Multiple Addresses (${addressCount})`}
              </div>
            </div>

            <div className="grid grid-3" style={{ marginTop: 8 }}>
              <div className="field">
                <label>First Name</label>
                <input name="firstName" value={edit.firstName} onChange={onEditChange} />
                {editErrors.firstName && <div className="error">{editErrors.firstName}</div>}
              </div>
              <div className="field">
                <label>Last Name</label>
                <input name="lastName" value={edit.lastName} onChange={onEditChange} />
                {editErrors.lastName && <div className="error">{editErrors.lastName}</div>}
              </div>
              <div className="field">
                <label>Phone Number</label>
                <input name="phoneNumber" value={edit.phoneNumber} onChange={onEditChange} />
                {editErrors.phoneNumber && <div className="error">{editErrors.phoneNumber}</div>}
              </div>
            </div>

            <div className="grid grid-3" style={{ marginTop: 8 }}>
              <div className="field">
                <label>City</label>
                <input value={customer.city} disabled />
              </div>
              <div className="field">
                <label>State</label>
                <input value={customer.state} disabled />
              </div>
              <div className="field">
                <label>Pin Code</label>
                <input value={customer.pinCode} disabled />
              </div>
            </div>

            <div className="row row-end">
              <button className="btn btn-primary" onClick={saveCustomer} disabled={savingCustomer}>
                {savingCustomer ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Addresses</div>

            {customer.addresses.length === 0 ? (
              <div className="empty">No addresses added yet. Add one below.</div>
            ) : (
              <div className="address-list">
                {customer.addresses.map((a) => (
                  <div className="address-item" key={a.id}>
                    <div className="address-meta">
                      <div className="strong">{a.addressLine}</div>
                      <div className="muted">{a.city}, {a.state} — {a.pinCode}</div>
                    </div>

                    {editingAddressId === a.id ? (
                      <div className="address-edit">
                        <div className="grid grid-2">
                          <div className="field">
                            <label>Address Line</label>
                            <input name="addressLine" value={editingAddressForm.addressLine} onChange={onEditingAddressChange} />
                            {editingAddressErrors.addressLine && <div className="error">{editingAddressErrors.addressLine}</div>}
                          </div>
                          <div className="field">
                            <label>City</label>
                            <input name="city" value={editingAddressForm.city} onChange={onEditingAddressChange} />
                            {editingAddressErrors.city && <div className="error">{editingAddressErrors.city}</div>}
                          </div>
                          <div className="field">
                            <label>State</label>
                            <input name="state" value={editingAddressForm.state} onChange={onEditingAddressChange} />
                            {editingAddressErrors.state && <div className="error">{editingAddressErrors.state}</div>}
                          </div>
                          <div className="field">
                            <label>Pin Code</label>
                            <input name="pinCode" value={editingAddressForm.pinCode} onChange={onEditingAddressChange} />
                            {editingAddressErrors.pinCode && <div className="error">{editingAddressErrors.pinCode}</div>}
                          </div>
                        </div>
                        <div className="row row-end">
                          <button className="btn btn-secondary" onClick={cancelEditAddress} disabled={savingAddress}>Cancel</button>
                          <button className="btn btn-primary" onClick={saveAddress} disabled={savingAddress}>
                            {savingAddress ? 'Saving...' : 'Save Address'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="address-actions">
                        <button className="btn btn-ghost" onClick={() => startEditAddress(a)}>Edit</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="divider" />

            <form onSubmit={addAddress}>
              <div className="card-title" style={{ marginBottom: 8 }}>Add New Address</div>
              <div className="grid grid-2">
                <div className="field">
                  <label>Address Line</label>
                  <input name="addressLine" value={addressForm.addressLine} onChange={onAddressChange} placeholder="House no, street, area" />
                  {addressErrors.addressLine && <div className="error">{addressErrors.addressLine}</div>}
                </div>
                <div className="field">
                  <label>City</label>
                  <input name="city" value={addressForm.city} onChange={onAddressChange} placeholder="City" />
                  {addressErrors.city && <div className="error">{addressErrors.city}</div>}
                </div>
                <div className="field">
                  <label>State</label>
                  <input name="state" value={addressForm.state} onChange={onAddressChange} placeholder="State" />
                  {addressErrors.state && <div className="error">{addressErrors.state}</div>}
                </div>
                <div className="field">
                  <label>Pin Code</label>
                  <input name="pinCode" value={addressForm.pinCode} onChange={onAddressChange} placeholder="Pin code" />
                  {addressErrors.pinCode && <div className="error">{addressErrors.pinCode}</div>}
                </div>
              </div>

              <div className="row row-end">
                <button className="btn btn-primary" type="submit" disabled={addingAddress}>
                  {addingAddress ? 'Adding...' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  )
}
