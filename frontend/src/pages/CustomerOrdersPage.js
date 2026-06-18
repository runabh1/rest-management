import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { invoiceAPI } from '../services/api';

function CustomerOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!localStorage.getItem('token') || user.role !== 'customer') {
      navigate('/login');
      return;
    }

    fetchOrders(user);
  }, [navigate]);

  const fetchOrders = async (user) => {
    try {
      setLoading(true);
      const response = user.customerId
        ? await invoiceAPI.getByCustomer(user.customerId)
        : await invoiceAPI.getByCustomerEmail(user.email);

      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  return (
    <Container className="customer-orders-page">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="page-title mb-1">My Orders</h1>
          <p className="text-muted mb-0">Track your placed orders and payment status.</p>
        </div>
        <Button as={Link} to="/order" variant="primary">Place New Order</Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      {orders.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h5>No orders yet</h5>
            <p className="text-muted">Your completed checkouts will appear here.</p>
            <Button as={Link} to="/order" variant="primary">Browse Menu</Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {orders.map((order) => (
            <Col lg={6} key={order.id}>
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span>Order #{order.invoice_number}</span>
                  <Badge bg={getStatusColor(order.status)}>{order.status}</Badge>
                </Card.Header>
                <Card.Body>
                  <Table size="sm" borderless className="mb-3">
                    <tbody>
                      {(order.items || []).map((item) => (
                        <tr key={item.id}>
                          <td>{item.quantity} x {item.menu_name}</td>
                          <td className="text-end">Rs. {(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <div className="d-flex justify-content-between border-top pt-3">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold">Rs. {Number(order.total || 0).toFixed(2)}</span>
                  </div>
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <Badge bg={order.payment_method === 'cod' ? 'warning' : 'success'}>
                      {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card'}
                    </Badge>
                    <Badge bg={order.payment_status === 'paid' ? 'success' : 'danger'}>
                      {order.payment_status}
                    </Badge>
                    <Badge bg="secondary">
                      {new Date(order.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
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

export default CustomerOrdersPage;
