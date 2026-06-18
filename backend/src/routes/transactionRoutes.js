const express = require('express');
const {
  getInvoices,
  createInvoice,
  getInvoice,
  updateInvoiceStatus,
  getCustomerInvoices,
  deleteInvoice,
  getPayments,
  createPayment,
  getPayment,
  getInvoicePayments,
  deletePayment,
  getReviews,
  createReview,
  getReview,
  getCustomerReviews,
  deleteReview,
  getAnalytics
} = require('../controllers/transactionControllers');

const router = express.Router();

// Invoice routes
router.get('/invoices', getInvoices);
router.post('/invoices', createInvoice);
router.get('/invoices/:id', getInvoice);
router.put('/invoices/:id/status', updateInvoiceStatus);
router.get('/invoices/customer/:customerId', getCustomerInvoices);
router.delete('/invoices/:id', deleteInvoice);

// Payment routes
router.get('/payments', getPayments);
router.post('/payments', createPayment);
router.get('/payments/:id', getPayment);
router.get('/payments/invoice/:invoiceId', getInvoicePayments);
router.delete('/payments/:id', deletePayment);

// Review routes
router.get('/reviews', getReviews);
router.post('/reviews', createReview);
router.get('/reviews/:id', getReview);
router.get('/reviews/customer/:customerId', getCustomerReviews);
router.delete('/reviews/:id', deleteReview);

// Analytics route
router.get('/analytics', getAnalytics);

module.exports = router;
