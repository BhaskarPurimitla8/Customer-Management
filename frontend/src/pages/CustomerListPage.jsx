import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import Toast from '../components/Toast.jsx'

export default function CustomerListPage() {
  const [filters, setFilters] = useState({ city: '', state: '', pinCode: '' })
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit })
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const queryKey = useMemo(() => JSON.stringify({ ...filters, page, limit }), [filters, page, limit])

  async function load() {
    setLoading(true)
    try {
      const data = await api.listCustomers({ ...filters, page, limit })
      setCustomers(data.data)
      setPagination(data.pagination)
    } catch (e) {
      setToast({ message: e.message || 'Failed to load customers', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey])

  function onChange(e) {
    const { name, value } = e.target
    setPage(1)
    setFilters((p) => ({ ...p, [name]: value }))
  }

  function clearFilters() {
    setFilters({ city: '', state: '', pinCode: '' })
    setPage(1)
  }

  async function deleteCustomer(id) {
    const ok = window.confirm('Are you sure you want to delete this customer? This action is permanent.')
    if (!ok) return

    try {
      await api.deleteCustomer(id)
      setToast({ message: 'Customer deleted successfully', type: 'success' })
      load()
    } catch (e) {
      setToast({ message: e.message || 'Failed to delete customer', type: 'error' })
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Customers</h1>
        <Link className="btn btn-primary" to="/customers/new">+ Add Customer</Link>
      </div>

      <div className="card">
        <div className="card-title">Search & Filter</div>
        <div className="grid grid-3">
          <div className="field">
            <label>City</label>
            <input name="city" value={filters.city} onChange={onChange} placeholder="e.g., Hyderabad" />
          </div>
          <div className="field">
            <label>State</label>
            <input name="state" value={filters.state} onChange={onChange} placeholder="e.g., Telangana" />
          </div>
          <div className="field">
            <label>Pin Code</label>
            <input name="pinCode" value={filters.pinCode} onChange={onChange} placeholder="e.g., 500001" />
          </div>
        </div>
        <div className="row row-end">
          <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>
        </div>
      </div>

      <div className="card">
        <div className="row row-between">
          <div className="card-title">Customer List</div>
          <div className="muted">Total: {pagination.total}</div>
        </div>

        {loading ? (
          <div className="skeleton">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="empty">No customers found. Try clearing filters.</div>
        ) : (
          <div className="table">
            <div className="table-head">
              <div>ID</div>
              <div>Name</div>
              <div>Phone</div>
              <div>City</div>
              <div>State</div>
              <div>Pin</div>
              <div className="right">Actions</div>
            </div>

            {customers.map((c) => (
              <div className="table-row" key={c.id}>
                <div>{c.id}</div>
                <div className="strong">{c.firstName} {c.lastName}</div>
                <div>{c.phoneNumber}</div>
                <div>{c.city}</div>
                <div>{c.state}</div>
                <div>{c.pinCode}</div>
                <div className="right actions">
                  <Link className="btn btn-ghost" to={`/customers/${c.id}`}>View</Link>
                  <button className="btn btn-danger" onClick={() => deleteCustomer(c.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="row row-between" style={{ marginTop: 12 }}>
          <button className="btn btn-secondary" disabled={pagination.page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Prev
          </button>
          <div className="muted">Page {pagination.page} of {pagination.totalPages}</div>
          <button className="btn btn-secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  )
}
