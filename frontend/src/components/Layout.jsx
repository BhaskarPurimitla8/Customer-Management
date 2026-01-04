import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="logo">CM</div>
          <div>
            <div className="brand-title">Customer Management</div>
            <div className="brand-subtitle">Customers & Multiple Addresses</div>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/customers" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Customers
          </NavLink>
          <NavLink to="/customers/new" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Add Customer
          </NavLink>
        </nav>
      </header>

      <main className="container">
        <Outlet />
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Customer Management App</span>
      </footer>
    </div>
  )
}
