const { Invoice, Payment, UserReview } = require('../models/transactions');
const { dbAll } = require('../config/database');

// Invoice Controllers
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.getAll();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { customerId, items, taxId, customerName, customerPhone, customerEmail, customerAddress } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    // If no customerId, create a guest customer or use provided guest info
    let finalCustomerId = customerId;
    if (!finalCustomerId && customerName && customerPhone) {
      // For guest orders, we'll use a special guest customer or create one
      // For now, store guest info in the invoice
      const invoice = await Invoice.createGuest(customerName, customerPhone, customerEmail, customerAddress, items, taxId);
      return res.status(201).json(invoice);
    }

    if (!finalCustomerId) {
      return res.status(400).json({ error: 'Either customerId or guest customer information is required' });
    }

    const invoice = await Invoice.create(finalCustomerId, items, taxId);
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.getById(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const invoice = await Invoice.update(id, status);
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomerInvoices = async (req, res) => {
  try {
    const { customerId } = req.params;
    const invoices = await Invoice.getByCustomer(customerId);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    await Invoice.delete(id);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Payment Controllers
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.getAll();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { invoiceId, amount, paymentMethod } = req.body;
    if (!invoiceId || !amount) {
      return res.status(400).json({ error: 'invoiceId and amount are required' });
    }
    const payment = await Payment.create(invoiceId, amount, paymentMethod);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.getById(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoicePayments = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const payments = await Payment.getByInvoice(invoiceId);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await Payment.delete(id);
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User Review Controllers
exports.getReviews = async (req, res) => {
  try {
    const reviews = await UserReview.getAll();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { invoiceId, customerId, rating, comment } = req.body;
    if (!invoiceId || !customerId || !rating) {
      return res.status(400).json({ error: 'invoiceId, customerId, and rating are required' });
    }
    const review = await UserReview.create(invoiceId, customerId, rating, comment);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await UserReview.getById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomerReviews = async (req, res) => {
  try {
    const { customerId } = req.params;
    const reviews = await UserReview.getByCustomer(customerId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await UserReview.delete(id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalRevenue = await dbAll(`
      SELECT SUM(total) as total_revenue FROM invoice WHERE status = 'paid'
    `);
    
    const totalInvoices = await dbAll(`
      SELECT COUNT(*) as count FROM invoice
    `);
    
    const totalCustomers = await dbAll(`
      SELECT COUNT(*) as count FROM customer
    `);
    
    const averageRating = await dbAll(`
      SELECT AVG(rating) as average_rating FROM user_review
    `);
    
    const topMenuItems = await dbAll(`
      SELECT m.name, SUM(ii.quantity) as total_quantity, SUM(ii.total) as total_revenue
      FROM invoice_item ii
      LEFT JOIN menu m ON ii.menu_id = m.id
      GROUP BY m.id
      ORDER BY total_quantity DESC
      LIMIT 10
    `);
    
    const monthlySales = await dbAll(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as invoice_count,
        SUM(total) as monthly_revenue
      FROM invoice
      WHERE status = 'paid'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({
      totalRevenue: totalRevenue[0]?.total_revenue || 0,
      totalInvoices: totalInvoices[0]?.count || 0,
      totalCustomers: totalCustomers[0]?.count || 0,
      averageRating: parseFloat(averageRating[0]?.average_rating) || 0,
      topMenuItems,
      monthlySales
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
