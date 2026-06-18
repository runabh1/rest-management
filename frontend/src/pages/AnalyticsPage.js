import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { analyticsAPI } from '../services/api';

function AnalyticsPage() {
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
      <h1 className="page-title">Analytics Dashboard</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <Card.Body className="text-center">
              <h5 className="card-title">Total Revenue</h5>
              <h3>₹{analytics?.totalRevenue?.toFixed(2) || '0'}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
            <Card.Body className="text-center">
              <h5 className="card-title">Total Invoices</h5>
              <h3>{analytics?.totalInvoices || '0'}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
            <Card.Body className="text-center">
              <h5 className="card-title">Total Customers</h5>
              <h3>{analytics?.totalCustomers || '0'}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
            <Card.Body className="text-center">
              <h5 className="card-title">Avg Rating</h5>
              <h3>{analytics?.averageRating?.toFixed(1) || '0'}/5</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header className="bg-light">
              <Card.Title className="mb-0">Top 10 Menu Items</Card.Title>
            </Card.Header>
            <Card.Body>
              {analytics?.topMenuItems && analytics.topMenuItems.length > 0 ? (
                <div className="chart-container">
                  {analytics.topMenuItems.map((item, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span><strong>{idx + 1}. {item.name}</strong></span>
                        <span className="badge bg-primary">{item.total_quantity} sold</span>
                      </div>
                      <div className="progress" style={{height: '8px'}}>
                        <div 
                          className="progress-bar bg-success" 
                          style={{
                            width: `${(item.total_quantity / analytics.topMenuItems[0].total_quantity) * 100}%`
                          }}
                        ></div>
                      </div>
                      <small className="text-muted">Revenue: ₹{item.total_revenue?.toFixed(2) || '0'}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header className="bg-light">
              <Card.Title className="mb-0">Monthly Sales (Last 12 Months)</Card.Title>
            </Card.Header>
            <Card.Body>
              {analytics?.monthlySales && analytics.monthlySales.length > 0 ? (
                <div className="chart-container">
                  {analytics.monthlySales.map((month, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span><strong>{month.month}</strong></span>
                        <span className="badge bg-info">{month.invoice_count} invoices</span>
                      </div>
                      <div className="progress" style={{height: '8px'}}>
                        <div 
                          className="progress-bar bg-info" 
                          style={{
                            width: `${(month.monthly_revenue / (analytics.monthlySales[0]?.monthly_revenue || 1)) * 100}%`
                          }}
                        ></div>
                      </div>
                      <small className="text-muted">Revenue: ₹{month.monthly_revenue?.toFixed(2) || '0'}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={12}>
          <Card>
            <Card.Header className="bg-light">
              <Card.Title className="mb-0">Key Metrics Summary</Card.Title>
            </Card.Header>
            <Card.Body>
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <td><strong>Average Invoice Value</strong></td>
                    <td>₹{analytics?.totalInvoices > 0 ? (analytics.totalRevenue / analytics.totalInvoices).toFixed(2) : '0'}</td>
                  </tr>
                  <tr>
                    <td><strong>Customer Satisfaction</strong></td>
                    <td>{analytics?.averageRating?.toFixed(1) || '0'} / 5.0 ⭐</td>
                  </tr>
                  <tr>
                    <td><strong>Total Transactions</strong></td>
                    <td>{analytics?.totalInvoices || '0'}</td>
                  </tr>
                  <tr>
                    <td><strong>Unique Customers</strong></td>
                    <td>{analytics?.totalCustomers || '0'}</td>
                  </tr>
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AnalyticsPage;
