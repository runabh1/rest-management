import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
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

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Router>
      <div className="App">
        <Navbar bg="dark" expand="lg" sticky="top">
          <Container>
            <Navbar.Brand as={Link} to="/">
              🍽️ Restaurant Billing System
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/order" onClick={() => setActiveTab('order')} className="order-btn-nav">
                  🛒 Order Now
                </Nav.Link>
                <div className="nav-divider"></div>
                <Nav.Link as={Link} to="/" onClick={() => setActiveTab('dashboard')}>
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/menu" onClick={() => setActiveTab('menu')}>
                  Menu
                </Nav.Link>
                <Nav.Link as={Link} to="/customers" onClick={() => setActiveTab('customers')}>
                  Customers
                </Nav.Link>
                <Nav.Link as={Link} to="/invoices" onClick={() => setActiveTab('invoices')}>
                  Invoices
                </Nav.Link>
                <Nav.Link as={Link} to="/payments" onClick={() => setActiveTab('payments')}>
                  Payments
                </Nav.Link>
                <Nav.Link as={Link} to="/reviews" onClick={() => setActiveTab('reviews')}>
                  Reviews
                </Nav.Link>
                <Nav.Link as={Link} to="/analytics" onClick={() => setActiveTab('analytics')}>
                  Analytics
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container className="mt-4">
          <Routes>
            {/* Authentication Routes */}
            <Route path="/login" element={<CustomerAuthPage />} />
            <Route path="/admin-login" element={<AdminAuthPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            
            {/* Customer & Staff Routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </Container>

        <footer className="bg-dark text-white text-center py-3 mt-5">
          <p>&copy; 2024 Restaurant Billing Management System. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
