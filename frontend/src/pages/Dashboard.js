import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { analyticsAPI } from '../services/api';

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getAnalytics();
      setAnalytics(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <Card.Body>
              <h3>₹{analytics?.totalRevenue?.toFixed(2) || '0'}</h3>
              <h5>Total Revenue</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
            <Card.Body>
              <h3>{analytics?.totalInvoices || '0'}</h3>
              <h5>Total Invoices</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
            <Card.Body>
              <h3>{analytics?.totalCustomers || '0'}</h3>
              <h5>Total Customers</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
            <Card.Body>
              <h3>{analytics?.averageRating?.toFixed(1) || '0'}/5</h3>
              <h5>Average Rating</h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header className="bg-light">
              <Card.Title className="mb-0">Top Menu Items</Card.Title>
            </Card.Header>
            <Card.Body>
              {analytics?.topMenuItems && analytics.topMenuItems.length > 0 ? (
                <ul className="list-group">
                  {analytics.topMenuItems.map((item, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between">
                      <span>{item.name}</span>
                      <span className="badge bg-primary">{item.total_quantity} sold</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header className="bg-light">
              <Card.Title className="mb-0">Monthly Sales</Card.Title>
            </Card.Header>
            <Card.Body>
              {analytics?.monthlySales && analytics.monthlySales.length > 0 ? (
                <ul className="list-group">
                  {analytics.monthlySales.map((month, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between">
                      <span>{month.month}</span>
                      <span className="badge bg-success">₹{month.monthly_revenue?.toFixed(2) || '0'}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="text-center mt-4">
        <button className="btn btn-primary" onClick={fetchAnalytics}>
          Refresh Data
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
