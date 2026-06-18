import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { invoiceAPI, customerAPI, menuAPI, taxesAPI } from '../services/api';

function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    items: [{ menuId: '', quantity: 1 }],
    taxId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, custRes, menuRes, taxRes] = await Promise.all([
        invoiceAPI.getAll(),
        customerAPI.getAll(),
        menuAPI.getAll(),
        taxesAPI.getAll()
      ]);
      setInvoices(invRes.data);
      setCustomers(custRes.data);
      setMenuItems(menuRes.data);
      setTaxes(taxRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { menuId: '', quantity: 1 }]
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemsWithPrice = formData.items.map(item => {
        const menu = menuItems.find(m => m.id === item.menuId);
        return {
          menuId: item.menuId,
          quantity: parseInt(item.quantity),
          price: menu?.price || 0,
          total: (menu?.price || 0) * parseInt(item.quantity)
        };
      });

      await invoiceAPI.create({
        customerId: formData.customerId,
        items: itemsWithPrice,
        taxId: formData.taxId
      });
      
      fetchData();
      setShowModal(false);
      setFormData({ customerId: '', items: [{ menuId: '', quantity: 1 }], taxId: '' });
    } catch (err) {
      setError('Failed to create invoice');
      console.error(err);
    }
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">Invoices</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Create Invoice
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>{inv.invoice_number}</td>
                <td>{inv.customer_name}</td>
                <td>₹{inv.total}</td>
                <td><span className={`badge bg-${inv.status === 'paid' ? 'success' : 'warning'}`}>{inv.status}</span></td>
                <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                <td>
                  <Button variant="info" size="sm" onClick={() => handleViewDetails(inv)} className="me-2">
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Invoice</Modal.Title>
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
              <Form.Label>Tax</Form.Label>
              <Form.Select
                value={formData.taxId}
                onChange={(e) => setFormData({...formData, taxId: e.target.value})}
              >
                <option value="">No Tax</option>
                {taxes.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.percentage}%)</option>
                ))}
              </Form.Select>
            </Form.Group>

            <h5>Items</h5>
            {formData.items.map((item, idx) => (
              <Row key={idx} className="mb-2">
                <Col md={7}>
                  <Form.Select
                    value={item.menuId}
                    onChange={(e) => handleItemChange(idx, 'menuId', e.target.value)}
                    required
                  >
                    <option value="">Select Item</option>
                    {menuItems.map(m => (
                      <option key={m.id} value={m.id}>{m.name} (₹{m.price})</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    required
                  />
                </Col>
                <Col md={2}>
                  <Button variant="danger" size="sm" onClick={() => handleRemoveItem(idx)}>
                    Remove
                  </Button>
                </Col>
              </Row>
            ))}

            <Button variant="secondary" className="mb-3" onClick={handleAddItem}>
              Add Item
            </Button>

            <div className="mt-3">
              <Button variant="primary" type="submit">
                Create Invoice
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {selectedInvoice && (
        <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Invoice Details - {selectedInvoice.invoice_number}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Customer:</strong> {selectedInvoice.customer_name}</p>
            <p><strong>Subtotal:</strong> ₹{selectedInvoice.subtotal}</p>
            <p><strong>Tax:</strong> ₹{selectedInvoice.tax_amount}</p>
            <p><strong>Total:</strong> ₹{selectedInvoice.total}</p>
            <p><strong>Status:</strong> {selectedInvoice.status}</p>
            
            <h5 className="mt-4">Items</h5>
            <Table striped bordered size="sm">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.menu_name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price}</td>
                    <td>₹{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}

export default InvoicesPage;
