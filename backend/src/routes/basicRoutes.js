const express = require('express');
const {
  getFoodTypes,
  createFoodType,
  updateFoodType,
  deleteFoodType,
  getMenuItems,
  createMenuItem,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuByFoodType,
  getCustomers,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getTaxes,
  createTax,
  updateTax,
  deleteTax
} = require('../controllers/basicControllers');

const router = express.Router();

// Food Type routes
router.get('/foodtypes', getFoodTypes);
router.post('/foodtypes', createFoodType);
router.put('/foodtypes/:id', updateFoodType);
router.delete('/foodtypes/:id', deleteFoodType);

// Menu routes
router.get('/menu', getMenuItems);
router.post('/menu', createMenuItem);
router.get('/menu/:id', getMenuItem);
router.put('/menu/:id', updateMenuItem);
router.delete('/menu/:id', deleteMenuItem);
router.get('/menu/foodtype/:foodTypeId', getMenuByFoodType);

// Customer routes
router.get('/customers', getCustomers);
router.post('/customers', createCustomer);
router.get('/customers/:id', getCustomer);
router.put('/customers/:id', updateCustomer);
router.delete('/customers/:id', deleteCustomer);

// Taxes routes
router.get('/taxes', getTaxes);
router.post('/taxes', createTax);
router.put('/taxes/:id', updateTax);
router.delete('/taxes/:id', deleteTax);

module.exports = router;
