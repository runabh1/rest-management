import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import MenuPage from './pages/MenuPage';
import CustomersPage from './pages/CustomersPage';
import InvoicesPage from './pages/InvoicesPage';
import PaymentsPage from './pages/PaymentsPage';
import ReviewsPage from './pages/ReviewsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import OrderPage from './pages/OrderPage';
import CustomerAuthPage from './pages/CustomerAuthPage';
import AdminAuthPage from './pages/AdminAuthPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/admin-login'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div
      className="App"
      style={{ '--app-background-image': `url(${process.env.PUBLIC_URL}/restaurant-background.webp)` }}
    >
      {!isAuthPage && <AppNavbar isAdminPage={isAdminPage} />}

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<CustomerAuthPage />} />
          <Route path="/admin-login" element={<AdminAuthPage />} />

          <Route path="/order" element={<CustomerRoute><OrderPage /></CustomerRoute>} />
          <Route path="/my-orders" element={<CustomerRoute><CustomerOrdersPage /></CustomerRoute>} />

          <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/menu" element={<AdminRoute><MenuPage /></AdminRoute>} />
          <Route path="/admin/customers" element={<AdminRoute><CustomersPage /></AdminRoute>} />
          <Route path="/admin/invoices" element={<AdminRoute><InvoicesPage /></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute><PaymentsPage /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute><ReviewsPage /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AnalyticsPage /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>

      {!isAuthPage && (
        <footer className="bg-dark text-white text-center py-3 mt-5">
          <p>&copy; 2026 Restaurant Billing Management System. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
}

function AppNavbar({ isAdminPage }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem(isAdminPage ? 'adminUser' : 'user') || '{}');

  const handleLogout = () => {
    if (isAdminPage) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin-login');
      return;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Navbar bg="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to={isAdminPage ? '/admin/orders' : '/order'}>
          Restaurant Billing System
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto align-items-lg-center">
            {isAdminPage ? (
              <>
                <Nav.Link as={Link} to="/admin/orders">Orders</Nav.Link>
                <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/admin/menu">Menu</Nav.Link>
                <Nav.Link as={Link} to="/admin/customers">Customers</Nav.Link>
                <Nav.Link as={Link} to="/admin/invoices">Invoices</Nav.Link>
                <Nav.Link as={Link} to="/admin/payments">Payments</Nav.Link>
                <Nav.Link as={Link} to="/admin/reviews">Reviews</Nav.Link>
                <Nav.Link as={Link} to="/admin/analytics">Analytics</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/order" className="order-btn-nav">Order Now</Nav.Link>
                <Nav.Link as={Link} to="/my-orders">My Orders</Nav.Link>
              </>
            )}
            <span className="nav-user-name">{user.name}</span>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function RootRedirect() {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const customerUser = JSON.parse(localStorage.getItem('user') || '{}');

  if (localStorage.getItem('adminToken') && adminUser.role === 'admin') {
    return <Navigate to="/admin/orders" replace />;
  }

  if (localStorage.getItem('token') && customerUser.role === 'customer') {
    return <Navigate to="/order" replace />;
  }

  return <Navigate to="/login" replace />;
}

function CustomerRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!localStorage.getItem('token') || user.role !== 'customer') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

  if (!localStorage.getItem('adminToken') || user.role !== 'admin') {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

export default App;
