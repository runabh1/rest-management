import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { paymentAPI, invoiceAPI } from '../services/api';

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: '',
    paymentMethod: 'cash'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, invRes] = await Promise.all([
        paymentAPI.getAll(),
        invoiceAPI.getAll()
      ]);
      setPayments(payRes.data);
      setInvoices(invRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load payments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentAPI.create(formData);
      fetchData();
      setShowModal(false);
      setFormData({ invoiceId: '', amount: '', paymentMethod: 'cash' });
    } catch (err) {
      setError('Failed to record payment');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await paymentAPI.delete(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete payment');
      }
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">Payments</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Record Payment
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>{payment.invoice_number}</td>
                <td>{payment.customer_name}</td>
                <td>₹{payment.amount}</td>
                <td>{payment.payment_method}</td>
                <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(payment.id)}>
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
          <Modal.Title>Record Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Invoice</Form.Label>
              <Form.Select
                value={formData.invoiceId}
                onChange={(e) => setFormData({...formData, invoiceId: e.target.value})}
                required
              >
                <option value="">Select Invoice</option>
                {invoices.filter(inv => inv.status !== 'paid').map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} - {inv.customer_name} (₹{inv.total})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
                <option value="cheque">Cheque</option>
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit">
              Record Payment
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default PaymentsPage;
