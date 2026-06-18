import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { invoiceAPI } from '../services/api';
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
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin-login');
      return;
    }

    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await invoiceAPI.getAll();
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await invoiceAPI.updateStatus(orderId, { status: newStatus });
      await fetchOrders();
      setShowModal(false);
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((order) => order.status === statusFilter);

  const stats = {
    total: orders.length,
    cod: orders.filter((order) => order.payment_method === 'cod').length,
    card: orders.filter((order) => order.payment_method === 'card').length,
    pending: orders.filter((order) => order.payment_status === 'unpaid').length,
    completed: orders.filter((order) => order.status === 'completed').length
  };

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  return (
    <div className="admin-orders-page">
      <Container className="mt-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h1 className="page-title mb-1">Admin Orders</h1>
            <p className="text-muted mb-0">Review customer orders, payments, and preparation status.</p>
          </div>
          <Form.Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={{ maxWidth: '260px' }}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Form.Select>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

        <Row className="mb-4">
          <StatCard label="Total Orders" value={stats.total} tone="total" />
          <StatCard label="Cash on Delivery" value={stats.cod} tone="cod" />
          <StatCard label="Card Payments" value={stats.card} tone="card" />
          <StatCard label="Pending Payments" value={stats.pending} tone="pending" />
          <StatCard label="Completed" value={stats.completed} tone="completed" />
        </Row>

        <div className="orders-table-wrapper">
          <Table hover responsive className="orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-muted">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr key={order.id}>
                    <td><strong>#{index + 1}</strong></td>
                    <td>
                      <div className="customer-name">{order.customer_name || 'Guest'}</div>
                      <small className="text-muted">{order.customer_email}</small>
                    </td>
                    <td>{order.customer_phone || '-'}</td>
                    <td><Badge bg="info">{order.items?.length || 0} items</Badge></td>
                    <td className="fw-bold">Rs. {Number(order.total || 0).toFixed(2)}</td>
                    <td>
                      <Badge bg={order.payment_method === 'cod' ? 'warning' : 'success'}>
                        {order.payment_method === 'cod' ? 'COD' : 'Card'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={order.payment_status === 'paid' ? 'success' : 'danger'}>
                        {order.payment_status}
                      </Badge>
                    </td>
                    <td><Badge bg={getStatusColor(order.status)}>{order.status}</Badge></td>
                    <td><small>{new Date(order.created_at).toLocaleDateString()}</small></td>
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

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Order Details #{selectedOrder?.invoice_number}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <div className="order-detail-section">
                <h6 className="section-title">Customer Information</h6>
                <Row>
                  <Col md={6}>
                    <p><strong>Name:</strong> {selectedOrder.customer_name || 'Guest'}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer_email || '-'}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Phone:</strong> {selectedOrder.customer_phone || '-'}</p>
                    <p><strong>Address:</strong> {selectedOrder.customer_address || '-'}</p>
                  </Col>
                </Row>
              </div>

              <div className="order-detail-section">
                <h6 className="section-title">Order Items</h6>
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
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td>{item.menu_name}</td>
                        <td>{item.quantity}</td>
                        <td>Rs. {Number(item.price || 0).toFixed(2)}</td>
                        <td>Rs. {Number(item.quantity * item.price || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="order-detail-section">
                <h6 className="section-title">Payment Information</h6>
                <Row>
                  <Col md={6}>
                    <p><strong>Subtotal:</strong> Rs. {Number(selectedOrder.subtotal || 0).toFixed(2)}</p>
                    <p><strong>Tax:</strong> Rs. {Number(selectedOrder.tax_amount || 0).toFixed(2)}</p>
                    <p><strong>Total:</strong> Rs. {Number(selectedOrder.total || 0).toFixed(2)}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Payment Method:</strong> {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</p>
                    <p><strong>Payment Status:</strong> {selectedOrder.payment_status}</p>
                  </Col>
                </Row>
              </div>

              <div className="order-detail-section">
                <h6 className="section-title">Update Order Status</h6>
                <Form.Select
                  defaultValue={selectedOrder.status}
                  onChange={(event) => updateOrderStatus(selectedOrder.id, event.target.value)}
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

function StatCard({ label, value, tone }) {
  return (
    <Col xs={12} md={6} lg className="mb-3">
      <Card className={`stat-card ${tone}`}>
        <Card.Body>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </Card.Body>
      </Card>
    </Col>
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
