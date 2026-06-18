import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Alert, Spinner, Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { authAPI } from '../services/api';
import '../styles/AuthPage.css';

function CustomerAuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('login');

  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Register state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login({
        ...loginData,
        role: 'customer'
      });

      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/order');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.register(registerData);

      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => {
        navigate('/order');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
              <Card className="auth-card">
                <Card.Header className="auth-header">
                  <h2 className="auth-title">🍽️ Restaurant</h2>
                  <p className="auth-subtitle">Customer Portal</p>
                </Card.Header>

                <Card.Body className="auth-body">
                  {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                  {success && <Alert variant="success">{success}</Alert>}

                  <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="auth-tabs">
                    {/* Login Tab */}
                    <Tab eventKey="login" title="🔐 Login">
                      <Form onSubmit={handleLogin} className="auth-form">
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="your@email.com"
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
                          {loading ? <Spinner animation="border" size="sm" /> : '🔓 Login'}
                        </Button>
                      </Form>
                    </Tab>

                    {/* Register Tab */}
                    <Tab eventKey="register" title="📝 Register">
                      <Form onSubmit={handleRegister} className="auth-form">
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="John Doe"
                            value={registerData.name}
                            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                            required
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="your@email.com"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            required
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            placeholder="9876543210"
                            value={registerData.phone}
                            onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                          />
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label className="fw-bold">Password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="••••••••"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            required
                          />
                        </Form.Group>

                        <Button
                          variant="primary"
                          type="submit"
                          className="w-100 auth-btn"
                          disabled={loading}
                        >
                          {loading ? <Spinner animation="border" size="sm" /> : '✅ Create Account'}
                        </Button>
                      </Form>
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>

              <div className="auth-footer">
                <p>Admin? <Link to="/admin-login" className="admin-link">Login as Admin</Link></p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default CustomerAuthPage;
