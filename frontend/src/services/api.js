import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`
});

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const customerToken = localStorage.getItem('token');
  const token = config.url?.startsWith('/auth') ? null : (adminToken || customerToken);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  createAdmin: (data) => api.post('/auth/admin/setup', data),
  verify: (token) => api.get('/auth/verify', {
    headers: { Authorization: `Bearer ${token}` }
  })
};

// Food Types
export const foodTypeAPI = {
  getAll: () => api.get('/foodtypes'),
  create: (data) => api.post('/foodtypes', data),
  update: (id, data) => api.put(`/foodtypes/${id}`, data),
  delete: (id) => api.delete(`/foodtypes/${id}`)
};

// Menu
export const menuAPI = {
  getAll: () => api.get('/menu'),
  create: (data) => api.post('/menu', data),
  getById: (id) => api.get(`/menu/${id}`),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
  getByFoodType: (foodTypeId) => api.get(`/menu/foodtype/${foodTypeId}`)
};

// Customers
export const customerAPI = {
  getAll: () => api.get('/customers'),
  create: (data) => api.post('/customers', data),
  getById: (id) => api.get(`/customers/${id}`),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`)
};

// Taxes
export const taxesAPI = {
  getAll: () => api.get('/taxes'),
  create: (data) => api.post('/taxes', data),
  update: (id, data) => api.put(`/taxes/${id}`, data),
  delete: (id) => api.delete(`/taxes/${id}`)
};

// Invoices
export const invoiceAPI = {
  getAll: () => api.get('/invoices'),
  create: (data) => api.post('/invoices', data),
  getById: (id) => api.get(`/invoices/${id}`),
  updateStatus: (id, data) => api.put(`/invoices/${id}/status`, data),
  getByCustomer: (customerId) => api.get(`/invoices/customer/${customerId}`),
  getByCustomerEmail: (email) => api.get(`/invoices/customer/email/${encodeURIComponent(email)}`),
  delete: (id) => api.delete(`/invoices/${id}`)
};

// Payments
export const paymentAPI = {
  getAll: () => api.get('/payments'),
  create: (data) => api.post('/payments', data),
  getById: (id) => api.get(`/payments/${id}`),
  getByInvoice: (invoiceId) => api.get(`/payments/invoice/${invoiceId}`),
  delete: (id) => api.delete(`/payments/${id}`)
};

// Reviews
export const reviewAPI = {
  getAll: () => api.get('/reviews'),
  create: (data) => api.post('/reviews', data),
  getById: (id) => api.get(`/reviews/${id}`),
  getByCustomer: (customerId) => api.get(`/reviews/customer/${customerId}`),
  delete: (id) => api.delete(`/reviews/${id}`)
};

// Analytics
export const analyticsAPI = {
  getAnalytics: () => api.get('/analytics')
};

export default api;
