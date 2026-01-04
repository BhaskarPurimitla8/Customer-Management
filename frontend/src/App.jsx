import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import CustomerListPage from './pages/CustomerListPage.jsx'
import CreateCustomerPage from './pages/CreateCustomerPage.jsx'
import CustomerDetailsPage from './pages/CustomerDetailsPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/customers" replace />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/new" element={<CreateCustomerPage />} />
        <Route path="/customers/:id" element={<CustomerDetailsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/customers" replace />} />
    </Routes>
  )
}
