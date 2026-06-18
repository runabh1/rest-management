import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Alert, Spinner, Card, Container, Row, Col, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminOrders.css';

function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin-login');
      return;
    }

    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/invoices');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin-login');
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/invoices/${orderId}`, { status: newStatus });
      fetchOrders();
      setShowModal(false);
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.status === statusFilter);

  const stats = {
    total: orders.length,
    cod: orders.filter(o => o.payment_method === 'cod').length,
    card: orders.filter(o => o.payment_method === 'card').length,
    pending: orders.filter(o => o.payment_status === 'unpaid').length,
    completed: orders.filter(o => o.status === 'completed').length
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <div className="admin-orders-page">
      {/* Admin Navbar */}
      <nav className="admin-navbar">
        <Container>
          <div className="navbar-content">
            <h4 className="navbar-brand">👨‍💼 Admin Dashboard</h4>
            <div className="navbar-actions">
              <span className="admin-user">
                {JSON.parse(localStorage.getItem('adminUser') || '{}').name}
              </span>
              <Button variant="danger" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </Container>
      </nav>

      <Container className="mt-4">
        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={2.4} className="mb-3">
            <Card className="stat-card total">
              <Card.Body>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Orders</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2.4} className="mb-3">
            <Card className="stat-card cod">
              <Card.Body>
                <div className="stat-value">{stats.cod}</div>
                <div className="stat-label">Cash on Delivery</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2.4} className="mb-3">
            <Card className="stat-card card">
              <Card.Body>
                <div className="stat-value">{stats.card}</div>
                <div className="stat-label">Card Payments</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2.4} className="mb-3">
            <Card className="stat-card pending">
              <Card.Body>
                <div className="stat-value">{stats.pending}</div>
                <div className="stat-label">Pending Payments</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2.4} className="mb-3">
            <Card className="stat-card completed">
              <Card.Body>
                <div className="stat-value">{stats.completed}</div>
                <div className="stat-label">Completed</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filter */}
        <div className="mb-4">
          <Form.Group>
            <Form.Label className="fw-bold">Filter by Status</Form.Label>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: '300px' }}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>
        </div>

        {/* Orders Table */}
        <div className="orders-table-wrapper">
          <Table hover responsive className="orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <p className="text-muted">No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr key={order.id} className="order-row">
                    <td><strong>#{index + 1}</strong></td>
                    <td>
                      <div className="customer-name">{order.customer_name || 'Guest'}</div>
                      <small className="text-muted">{order.customer_email}</small>
                    </td>
                    <td>{order.customer_phone}</td>
                    <td>
                      <Badge bg="info">{order.items?.length || 0} items</Badge>
                    </td>
                    <td className="fw-bold">₹{order.total?.toFixed(2)}</td>
                    <td>
                      <Badge bg={order.payment_method === 'cod' ? 'warning' : 'success'}>
                        {order.payment_method === 'cod' ? '💵 COD' : '💳 Card'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={order.payment_status === 'paid' ? 'success' : 'danger'}>
                        {order.payment_status === 'paid' ? '✅ Paid' : '⏳ Unpaid'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td>
                      <small>{new Date(order.created_at).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Container>

      {/* Order Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>📋 Order Details #{selectedOrder?.invoice_number}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <div className="order-detail-section">
                <h6 className="section-title">👤 Customer Information</h6>
                <Row>
                  <Col md={6}>
                    <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                    <p><strong>Address:</strong> {selectedOrder.customer_address}</p>
                  </Col>
                </Row>
              </div>

              <div className="order-detail-section">
                <h6 className="section-title">📦 Order Items</h6>
                <Table size="sm" bordered>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map(item => (
                      <tr key={item.id}>
                        <td>{item.menu_name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price}</td>
                        <td>₹{(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="order-detail-section">
                <h6 className="section-title">💰 Payment Information</h6>
                <Row>
                  <Col md={6}>
                    <p><strong>Subtotal:</strong> ₹{selectedOrder.subtotal?.toFixed(2)}</p>
                    <p><strong>Tax:</strong> ₹{selectedOrder.tax_amount?.toFixed(2)}</p>
                    <p><strong>Total:</strong> ₹{selectedOrder.total?.toFixed(2)}</p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Payment Method:</strong>{' '}
                      <Badge bg={selectedOrder.payment_method === 'cod' ? 'warning' : 'success'}>
                        {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Card Payment'}
                      </Badge>
                    </p>
                    <p>
                      <strong>Payment Status:</strong>{' '}
                      <Badge bg={selectedOrder.payment_status === 'paid' ? 'success' : 'danger'}>
                        {selectedOrder.payment_status}
                      </Badge>
                    </p>
                  </Col>
                </Row>
              </div>

              <div className="order-detail-section">
                <h6 className="section-title">📊 Update Order Status</h6>
                <Form.Select
                  defaultValue={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    pending: 'warning',
    confirmed: 'info',
    preparing: 'info',
    ready: 'success',
    completed: 'success',
    cancelled: 'danger'
  };
  return colors[status] || 'secondary';
}

export default AdminOrdersPage;
