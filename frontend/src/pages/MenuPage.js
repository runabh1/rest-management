import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Modal, Alert, Spinner, Card } from 'react-bootstrap';
import { menuAPI, foodTypeAPI } from '../services/api';

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    foodTypeId: '',
    image: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, typesRes] = await Promise.all([
        menuAPI.getAll(),
        foodTypeAPI.getAll()
      ]);
      setMenuItems(menuRes.data);
      setFoodTypes(typesRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load menu items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await menuAPI.update(editingId, formData);
      } else {
        await menuAPI.create(formData);
      }
      fetchData();
      setShowModal(false);
      setFormData({ name: '', description: '', price: '', foodTypeId: '', image: '' });
      setEditingId(null);
    } catch (err) {
      setError('Failed to save menu item');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await menuAPI.delete(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete menu item');
      }
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      foodTypeId: item.food_type_id,
      image: item.image || ''
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const filteredItems = filterCategory 
    ? menuItems.filter(item => item.food_type_id === filterCategory)
    : menuItems;

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">🍽️ Menu Management</h1>
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => {
            setFormData({ name: '', description: '', price: '', foodTypeId: '', image: '' });
            setEditingId(null);
            setShowModal(true);
          }}
        >
          ➕ Add Menu Item
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      <div className="mb-4">
        <Form.Group>
          <Form.Label className="fw-bold">Filter by Category</Form.Label>
          <Form.Select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{maxWidth: '300px'}}
          >
            <option value="">All Categories</option>
            {foodTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <h4>No menu items found</h4>
            <p className="text-muted">Start by adding your first menu item!</p>
          </Card.Body>
        </Card>
      ) : (
        <Row xs={1} md={2} lg={3} xl={4} className="g-4 mb-5">
          {filteredItems.map(item => (
            <Col key={item.id}>
              <Card className="menu-item-card h-100">
                <img 
                  src={item.image || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(item.name)} 
                  alt={item.name}
                  className="menu-item-image"
                />
                <Card.Body className="menu-item-body d-flex flex-column">
                  <div className="menu-item-category">{item.food_type_name}</div>
                  <h5 className="menu-item-title">{item.name}</h5>
                  <p className="menu-item-description flex-grow-1">{item.description}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="menu-item-price">₹{item.price}</span>
                  </div>
                  <div className="btn-group mt-3">
                    <Button 
                      variant="warning" 
                      size="sm" 
                      onClick={() => handleEdit(item)}
                      className="w-50"
                    >
                      ✏️ Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(item.id)}
                      className="w-50"
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? '✏️ Edit' : '➕ Add'} Menu Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Butter Chicken"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="e.g., Creamy butter sauce with tender chicken"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price (₹)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                placeholder="e.g., 250"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={formData.foodTypeId}
                onChange={(e) => setFormData({...formData, foodTypeId: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {foodTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                placeholder="e.g., https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              {editingId ? 'Update Item' : 'Add Item'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default MenuPage;
