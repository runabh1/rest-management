import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import { reviewAPI, invoiceAPI, customerAPI } from '../services/api';

function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    invoiceId: '',
    customerId: '',
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [revRes, invRes, custRes] = await Promise.all([
        reviewAPI.getAll(),
        invoiceAPI.getAll(),
        customerAPI.getAll()
      ]);
      setReviews(revRes.data);
      setInvoices(invRes.data);
      setCustomers(custRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reviewAPI.create(formData);
      fetchData();
      setShowModal(false);
      setFormData({ invoiceId: '', customerId: '', rating: 5, comment: '' });
    } catch (err) {
      setError('Failed to submit review');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await reviewAPI.delete(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete review');
      }
    }
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  if (loading) return <Spinner animation="border" />;

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">Customer Reviews</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add Review
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3>{avgRating}/5.0</h3>
              <p className="text-muted">Average Rating</p>
              <p>{getRatingStars(Math.round(avgRating))}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3>{reviews.length}</h3>
              <p className="text-muted">Total Reviews</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3>{reviews.filter(r => r.rating >= 4).length}</h3>
              <p className="text-muted">Positive Reviews</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3>{reviews.filter(r => r.rating < 3).length}</h3>
              <p className="text-muted">Negative Reviews</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>Customer</th>
              <th>Invoice</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id}>
                <td>{review.customer_name}</td>
                <td>{review.invoice_number}</td>
                <td>{getRatingStars(review.rating)}</td>
                <td>{review.comment}</td>
                <td>{new Date(review.created_at).toLocaleDateString()}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(review.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Customer</Form.Label>
              <Form.Select
                value={formData.customerId}
                onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                required
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Invoice</Form.Label>
              <Form.Select
                value={formData.invoiceId}
                onChange={(e) => setFormData({...formData, invoiceId: e.target.value})}
                required
              >
                <option value="">Select Invoice</option>
                {invoices.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.invoice_number}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <Form.Select
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
              >
                <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                <option value={4}>⭐⭐⭐⭐ Good</option>
                <option value={3}>⭐⭐⭐ Average</option>
                <option value={2}>⭐⭐ Poor</option>
                <option value={1}>⭐ Very Poor</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit Review
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ReviewsPage;
