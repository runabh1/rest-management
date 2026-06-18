const { FoodType, Menu, Customer, Taxes } = require('../models');

// Food Type Controllers
exports.getFoodTypes = async (req, res) => {
  try {
    const foodTypes = await FoodType.getAll();
    res.json(foodTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createFoodType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const foodType = await FoodType.create(name);
    res.status(201).json(foodType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFoodType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const foodType = await FoodType.update(id, name);
    res.json(foodType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteFoodType = async (req, res) => {
  try {
    const { id } = req.params;
    await FoodType.delete(id);
    res.json({ message: 'Food type deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Menu Controllers
exports.getMenuItems = async (req, res) => {
  try {
    const items = await Menu.getAll();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, foodTypeId, image } = req.body;
    if (!name || !price || !foodTypeId) {
      return res.status(400).json({ error: 'Name, price, and foodTypeId are required' });
    }
    const item = await Menu.create(name, description, price, foodTypeId, image);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Menu.getById(id);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, foodTypeId, image } = req.body;
    if (!name || !price || !foodTypeId) {
      return res.status(400).json({ error: 'Name, price, and foodTypeId are required' });
    }
    const item = await Menu.update(id, name, description, price, foodTypeId, image);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    await Menu.delete(id);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMenuByFoodType = async (req, res) => {
  try {
    const { foodTypeId } = req.params;
    const items = await Menu.getByFoodType(foodTypeId);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Customer Controllers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.getAll();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const customer = await Customer.create(name, phone, email, address);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.getById(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const customer = await Customer.update(id, name, phone, email, address);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await Customer.delete(id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Taxes Controllers
exports.getTaxes = async (req, res) => {
  try {
    const taxes = await Taxes.getAll();
    res.json(taxes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTax = async (req, res) => {
  try {
    const { name, percentage } = req.body;
    if (!name || percentage === undefined) {
      return res.status(400).json({ error: 'Name and percentage are required' });
    }
    const tax = await Taxes.create(name, percentage);
    res.status(201).json(tax);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTax = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, percentage } = req.body;
    if (!name || percentage === undefined) {
      return res.status(400).json({ error: 'Name and percentage are required' });
    }
    const tax = await Taxes.update(id, name, percentage);
    res.json(tax);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTax = async (req, res) => {
  try {
    const { id } = req.params;
    await Taxes.delete(id);
    res.json({ message: 'Tax deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
