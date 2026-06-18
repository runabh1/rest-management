import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Modal, Alert, Spinner, Card, Badge } from 'react-bootstrap';
import { menuAPI, invoiceAPI } from '../services/api';
import '../styles/OrderPage.css';

function OrderPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });

  useEffect(() => {
    // Get user info from localStorage if logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
      setCustomerInfo({
        name: user.name || '',
        phone: user.phone || '',
        address: '',
        email: user.email || ''
      });
    }
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await menuAPI.getAll();
      setMenuItems(res.data);
    } catch (err) {
      setError('Failed to load menu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(c => c.id === item.id);
    if (existingItem) {
      setCart(cart.map(c => 
        c.id === item.id ? {...c, quantity: c.quantity + 1} : c
      ));
    } else {
      setCart([...cart, {...item, quantity: 1}]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(c => 
        c.id === itemId ? {...c, quantity} : c
      ));
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.phone || !cart.length) {
      setError('Please fill in required fields and add items to cart');
      return;
    }

    try {
      const subtotal = calculateSubtotal();
      
      // Create invoice with payment method
      const invoiceData = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,
        customerAddress: customerInfo.address,
        items: cart.map(item => ({
          menuId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: subtotal,
        taxAmount: 0,
        total: subtotal,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'card' ? 'paid' : 'unpaid'
      };

      const response = await invoiceAPI.create(invoiceData);
      
      setOrderNumber(response.data.invoice_number || response.data.id);
      setOrderPlaced(true);
      setCart([]);
      setShowCheckout(false);
      setCustomerInfo({ name: '', phone: '', address: '', email: '' });
      setPaymentMethod('cod');
      
      setTimeout(() => {
        setOrderPlaced(false);
      }, 5000);
    } catch (err) {
      setError('Failed to place order. Please try again.');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  const subtotal = calculateSubtotal();

  return (
    <div className="order-page">
      <div className="order-header">
        <h1 className="page-title">🍽️ Order Your Meal</h1>
        <p className="lead text-muted">Browse our delicious menu and place your order</p>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      
      {orderPlaced && (
        <Alert variant="success" className="order-success">
          <h4>✅ Order Placed Successfully!</h4>
          <p>Your order number: <strong>{orderNumber}</strong></p>
          <p>Thank you for your order! Our team is preparing your meal.</p>
        </Alert>
      )}

      <div className="order-container">
        {/* Menu Items */}
        <div className="menu-section">
          <h3 className="section-title">📋 Available Items</h3>
          <Row xs={1} md={2} lg={3} className="g-4">
            {menuItems.map(item => (
              <Col key={item.id}>
                <Card className="menu-item-card order-item">
                  <img 
                    src={item.image || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(item.name)} 
                    alt={item.name}
                    className="menu-item-image"
                  />
                  <Card.Body>
                    <div className="menu-item-category">{item.food_type_name}</div>
                    <h5 className="menu-item-title">{item.name}</h5>
                    <p className="menu-item-description">{item.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="menu-item-price">₹{item.price}</span>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => addToCart(item)}
                        className="add-to-cart-btn"
                      >
                        🛒 Add
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Cart Sidebar */}
        <div className="cart-section">
          <Card className="cart-card sticky-top">
            <Card.Header className="cart-header">
              <h5 className="mb-0">🛒 Your Cart</h5>
              {cart.length > 0 && <Badge bg="light" text="dark">{cart.length} items</Badge>}
            </Card.Header>
            <Card.Body>
              {cart.length === 0 ? (
                <p className="text-muted text-center">Your cart is empty</p>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map(item => (
                      <div key={item.id} className="cart-item">
                        <div className="item-details">
                          <h6>{item.name}</h6>
                          <small className="text-muted">₹{item.price} each</small>
                        </div>
                        <div className="item-quantity">
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            −
                          </Button>
                          <span className="qty-display">{item.quantity}</span>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <div className="item-total">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="remove-btn"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="cart-summary">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <strong>₹{subtotal.toFixed(2)}</strong>
                    </div>
                    <div className="summary-row total-row">
                      <span>Total:</span>
                      <strong className="total-amount">₹{subtotal.toFixed(2)}</strong>
                    </div>
                  </div>

                  <Button 
                    variant="primary" 
                    className="w-100 checkout-btn"
                    onClick={() => setShowCheckout(true)}
                  >
                    💳 Proceed to Checkout
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal show={showCheckout} onHide={() => setShowCheckout(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📝 Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePlaceOrder}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Your Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="John Doe"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Phone Number *</Form.Label>
              <Form.Control
                type="tel"
                placeholder="9876543210"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="john@example.com"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Delivery Address *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="123 Main Street, City, State"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">💳 Payment Method *</Form.Label>
              <div className="payment-options">
                <Form.Check
                  type="radio"
                  id="cod"
                  label="💵 Cash on Delivery"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="payment-option"
                />
                <Form.Check
                  type="radio"
                  id="card"
                  label="💳 Card Payment (Credit/Debit)"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="payment-option"
                />
              </div>
            </Form.Group>

            <div className="order-summary">
              <h6>Order Summary</h6>
              {cart.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.quantity}x {item.name}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="summary-total">
                <strong>Total Amount:</strong>
                <strong className="text-primary">₹{subtotal.toFixed(2)}</strong>
              </div>
            </div>

            <Button variant="success" type="submit" className="w-100 fw-bold">
              🎉 Place Order
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default OrderPage;
