import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner, Table, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { invoiceAPI, reviewAPI } from '../services/api';

function CustomerOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!localStorage.getItem('token') || user.role !== 'customer') {
      navigate('/login');
      return;
    }

    fetchOrdersAndReviews(user);
  }, [navigate]);

  const fetchOrdersAndReviews = async (user) => {
    try {
      setLoading(true);
      const ordersPromise = user.customerId
        ? invoiceAPI.getByCustomer(user.customerId)
        : invoiceAPI.getByCustomerEmail(user.email);

      const reviewsPromise = user.customerId
        ? reviewAPI.getByCustomer(user.customerId)
        : Promise.resolve({ data: [] });

      const [ordersRes, reviewsRes] = await Promise.all([
        ordersPromise,
        reviewsPromise
      ]);

      setOrders(ordersRes.data);
      setReviews(reviewsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load your orders or reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewModal = (order) => {
    setSelectedOrderForReview(order);
    setRating(5);
    setComment('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderForReview) return;

    try {
      setSubmittingReview(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const customerId = user.customerId || selectedOrderForReview.customer_id;

      if (!customerId) {
        throw new Error('Customer ID is required to submit a review.');
      }

      await reviewAPI.create({
        invoiceId: selectedOrderForReview.id,
        customerId,
        rating,
        comment
      });

      setShowReviewModal(false);
      await fetchOrdersAndReviews(user);
    } catch (err) {
      setError(err.message || 'Failed to submit review');
      console.error(err);
    } finally {
      setSubmittingReview(false);
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
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
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
                  </div>

                  {/* Review / Rating Section */}
                  <div>
                    {(() => {
                      const existingReview = reviews.find(r => r.invoice_id === order.id);
                      if (existingReview) {
                        return (
                          <div className="mt-3 border-top pt-3">
                            <span className="text-muted small fw-bold">Your Review:</span>
                            <div className="text-warning my-1">
                              {'★'.repeat(existingReview.rating)}
                              {'☆'.repeat(5 - existingReview.rating)}
                            </div>
                            {existingReview.comment && (
                              <p className="mb-0 small text-muted font-italic bg-light p-2 rounded">
                                "{existingReview.comment}"
                              </p>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="mt-3 w-100"
                            onClick={() => handleOpenReviewModal(order)}
                          >
                            ⭐ Rate This Order
                          </Button>
                        );
                      }
                    })()}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>⭐ Rate Your Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleReviewSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Rating</Form.Label>
              <Form.Select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
              >
                <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                <option value={4}>⭐⭐⭐⭐ Good</option>
                <option value={3}>⭐⭐⭐ Average</option>
                <option value={2}>⭐⭐ Poor</option>
                <option value={1}>⭐ Very Poor</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Comment / Review</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="What did you think of the food and service?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 fw-bold" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
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
