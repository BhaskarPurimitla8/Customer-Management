const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  const contentType = res.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await res.json() : await res.text()

  if (!res.ok) {
    const message = body?.message || `Request failed (${res.status})`
    const error = new Error(message)
    error.status = res.status
    error.body = body
    throw error
  }
  return body
}

export const api = {
  listCustomers: ({ city, state, pinCode, page, limit }) => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (state) params.set('state', state)
    if (pinCode) params.set('pinCode', pinCode)
    if (page) params.set('page', String(page))
    if (limit) params.set('limit', String(limit))
    return request(`/api/customers?${params.toString()}`)
  },
  createCustomer: (payload) => request('/api/customers', { method: 'POST', body: JSON.stringify(payload) }),
  getCustomer: (id) => request(`/api/customers/${id}`),
  updateCustomer: (id, payload) => request(`/api/customers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteCustomer: (id) => request(`/api/customers/${id}`, { method: 'DELETE' }),

  addAddress: (payload) => request('/api/addresses', { method: 'POST', body: JSON.stringify(payload) }),
  updateAddress: (id, payload) => request(`/api/addresses/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
}
