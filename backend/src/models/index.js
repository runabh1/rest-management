const { dbRun, dbGet, dbAll } = require('../config/database');
const { generateId } = require('../utils/helpers');

class FoodType {
  static async create(name) {
    const id = generateId();
    await dbRun('INSERT INTO food_type (id, name) VALUES (?, ?)', [id, name]);
    return { id, name };
  }

  static async getAll() {
    return dbAll('SELECT * FROM food_type ORDER BY name');
  }

  static async getById(id) {
    return dbGet('SELECT * FROM food_type WHERE id = ?', [id]);
  }

  static async update(id, name) {
    await dbRun('UPDATE food_type SET name = ? WHERE id = ?', [name, id]);
    return this.getById(id);
  }

  static async delete(id) {
    await dbRun('DELETE FROM food_type WHERE id = ?', [id]);
  }
}

class Menu {
  static async create(name, description, price, foodTypeId, image = '') {
    const id = generateId();
    await dbRun(
      'INSERT INTO menu (id, name, description, price, food_type_id, image) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, description, price, foodTypeId, image]
    );
    return this.getById(id);
  }

  static async getAll() {
    return dbAll(`
      SELECT m.*, ft.name as food_type_name
      FROM menu m
      LEFT JOIN food_type ft ON m.food_type_id = ft.id
      ORDER BY ft.name, m.name
    `);
  }

  static async getById(id) {
    return dbGet(`
      SELECT m.*, ft.name as food_type_name
      FROM menu m
      LEFT JOIN food_type ft ON m.food_type_id = ft.id
      WHERE m.id = ?
    `, [id]);
  }

  static async getByFoodType(foodTypeId) {
    return dbAll(`
      SELECT m.*, ft.name as food_type_name
      FROM menu m
      LEFT JOIN food_type ft ON m.food_type_id = ft.id
      WHERE m.food_type_id = ?
      ORDER BY m.name
    `, [foodTypeId]);
  }

  static async update(id, name, description, price, foodTypeId, image = '') {
    await dbRun(
      'UPDATE menu SET name = ?, description = ?, price = ?, food_type_id = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, price, foodTypeId, image, id]
    );
    return this.getById(id);
  }

  static async delete(id) {
    await dbRun('DELETE FROM menu WHERE id = ?', [id]);
  }
}

class Customer {
  static async create(name, phone, email, address) {
    const id = generateId();
    await dbRun(
      'INSERT INTO customer (id, name, phone, email, address) VALUES (?, ?, ?, ?, ?)',
      [id, name, phone, email, address]
    );
    return this.getById(id);
  }

  static async getAll() {
    return dbAll('SELECT * FROM customer ORDER BY name');
  }

  static async getById(id) {
    return dbGet('SELECT * FROM customer WHERE id = ?', [id]);
  }

  static async update(id, name, phone, email, address) {
    await dbRun(
      'UPDATE customer SET name = ?, phone = ?, email = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, phone, email, address, id]
    );
    return this.getById(id);
  }

  static async delete(id) {
    await dbRun('DELETE FROM customer WHERE id = ?', [id]);
  }
}

class Taxes {
  static async create(name, percentage) {
    const id = generateId();
    await dbRun(
      'INSERT INTO taxes (id, name, percentage) VALUES (?, ?, ?)',
      [id, name, percentage]
    );
    return this.getById(id);
  }

  static async getAll() {
    return dbAll('SELECT * FROM taxes ORDER BY name');
  }

  static async getById(id) {
    return dbGet('SELECT * FROM taxes WHERE id = ?', [id]);
  }

  static async update(id, name, percentage) {
    await dbRun(
      'UPDATE taxes SET name = ?, percentage = ? WHERE id = ?',
      [name, percentage, id]
    );
    return this.getById(id);
  }

  static async delete(id) {
    await dbRun('DELETE FROM taxes WHERE id = ?', [id]);
  }
}

module.exports = {
  FoodType,
  Menu,
  Customer,
  Taxes
};
