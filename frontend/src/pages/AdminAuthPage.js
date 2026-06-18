import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import { authAPI } from '../services/api';
import '../styles/AuthPage.css';

function AdminAuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSetup, setIsSetup] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState({ email: 'admin@rest.com', password: 'admin123' });

  // Setup state
  const [setupData, setSetupData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const { data } = await authAPI.login({
        ...loginData,
        role: 'admin'
      });

      // Store token and user data
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      setSuccess('Admin login successful! Redirecting...');
      setTimeout(() => {
        navigate('/admin/orders');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await authAPI.createAdmin(setupData);

      setSuccess('Admin account created! Please login.');
      setIsSetup(false);
      setLoginData({ email: setupData.email, password: setupData.password });
      setSetupData({ email: '', password: '', name: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
          <Col md={5}>
            <div className="auth-card-wrapper">
              <Card className="auth-card admin-auth">
                <Card.Header className="auth-header admin-header">
                  <h2 className="auth-title">👨‍💼 Admin Panel</h2>
                  <p className="auth-subtitle">Restaurant Management</p>
                </Card.Header>

                <Card.Body className="auth-body">
                  {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                  {success && <Alert variant="success">{success}</Alert>}

                  {!isSetup ? (
                    <Form onSubmit={handleLogin} className="auth-form">
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Admin Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="admin@restaurant.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100 auth-btn"
                        disabled={loading}
                      >
                        {loading ? <Spinner animation="border" size="sm" /> : '🔓 Admin Login'}
                      </Button>

                      <hr className="my-3" />

                      <Button
                        variant="outline-primary"
                        className="w-100"
                        onClick={() => setIsSetup(true)}
                      >
                        ➕ Create New Admin Account
                      </Button>
                    </Form>
                  ) : (
                    <Form onSubmit={handleSetup} className="auth-form">
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Manager Name"
                          value={setupData.name}
                          onChange={(e) => setSetupData({ ...setupData, name: e.target.value })}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="admin@restaurant.com"
                          value={setupData.email}
                          onChange={(e) => setSetupData({ ...setupData, email: e.target.value })}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="••••••••"
                          value={setupData.password}
                          onChange={(e) => setSetupData({ ...setupData, password: e.target.value })}
                          required
                        />
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100 auth-btn"
                        disabled={loading}
                      >
                        {loading ? <Spinner animation="border" size="sm" /> : '✅ Create Admin Account'}
                      </Button>

                      <Button
                        variant="outline-secondary"
                        className="w-100 mt-2"
                        onClick={() => setIsSetup(false)}
                      >
                        ← Back to Login
                      </Button>
                    </Form>
                  )}
                </Card.Body>
              </Card>

              <div className="auth-footer">
                <p>Customer? <Link to="/login" className="admin-link">Login as Customer</Link></p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default AdminAuthPage;
