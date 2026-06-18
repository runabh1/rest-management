const { dbRun, dbGet, dbAll } = require('../config/database');
const { generateId, generateInvoiceNumber } = require('../utils/helpers');

class Invoice {
  static async create(customerId, items, taxId, options = {}) {
    const id = generateId();
    const invoiceNumber = generateInvoiceNumber();
    const paymentMethod = options.paymentMethod || 'cod';
    const paymentStatus = options.paymentStatus || (paymentMethod === 'card' ? 'paid' : 'unpaid');
    const status = options.status || 'pending';
    
    // Calculate totals
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.total || (item.quantity * item.price);
    });

    // Get tax percentage
    let taxAmount = 0;
    if (taxId) {
      const tax = await dbGet('SELECT percentage FROM taxes WHERE id = ?', [taxId]);
      if (tax) {
        taxAmount = (subtotal * tax.percentage) / 100;
      }
    }

    const total = subtotal + taxAmount;

    // Insert invoice
    await dbRun(
      `INSERT INTO invoice
        (id, invoice_number, customer_id, subtotal, tax_amount, total, status, payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, invoiceNumber, customerId, subtotal, taxAmount, total, status, paymentMethod, paymentStatus]
    );

    // Insert invoice items
    for (const item of items) {
      const itemId = generateId();
      await dbRun(
        'INSERT INTO invoice_item (id, invoice_id, menu_id, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?)',
        [itemId, id, item.menuId, item.quantity, item.price, item.total || (item.quantity * item.price)]
      );
    }

    return this.getById(id);
  }

  static async createGuest(customerName, customerPhone, customerEmail, customerAddress, items, taxId, options = {}) {
    const { Customer } = require('./index');
    
    // Create a guest customer
    const customer = await Customer.create(customerName, customerPhone, customerEmail, customerAddress);
    
    // Use the regular create method with the guest customer
    return this.create(customer.id, items, taxId, options);
  }

  static async getAll() {
    const invoices = await dbAll(`
      SELECT
        i.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        c.address as customer_address
      FROM invoice i
      LEFT JOIN customer c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
    `);

    return Promise.all(invoices.map(async (invoice) => ({
      ...invoice,
      items: await this.getItems(invoice.id)
    })));
  }

  static async getById(id) {
    const invoice = await dbGet(`
      SELECT
        i.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        c.address as customer_address
      FROM invoice i
      LEFT JOIN customer c ON i.customer_id = c.id
      WHERE i.id = ?
    `, [id]);

    if (!invoice) return null;

    const items = await this.getItems(id);

    return {
      ...invoice,
      items
    };
  }

  static async getItems(invoiceId) {
    return dbAll(`
      SELECT ii.*, m.name as menu_name, m.description
      FROM invoice_item ii
      LEFT JOIN menu m ON ii.menu_id = m.id
      WHERE ii.invoice_id = ?
    `, [invoiceId]);
  }

  static async update(id, status) {
    await dbRun(
      'UPDATE invoice SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    return this.getById(id);
  }

  static async getByCustomer(customerId) {
    const invoices = await dbAll(`
      SELECT i.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
      FROM invoice i
      LEFT JOIN customer c ON i.customer_id = c.id
      WHERE i.customer_id = ?
      ORDER BY i.created_at DESC
    `, [customerId]);

    return Promise.all(invoices.map(async (invoice) => ({
      ...invoice,
      items: await this.getItems(invoice.id)
    })));
  }

  static async getByCustomerEmail(email) {
    const invoices = await dbAll(`
      SELECT i.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
      FROM invoice i
      LEFT JOIN customer c ON i.customer_id = c.id
      WHERE lower(c.email) = lower(?)
      ORDER BY i.created_at DESC
    `, [email]);

    return Promise.all(invoices.map(async (invoice) => ({
      ...invoice,
      items: await this.getItems(invoice.id)
    })));
  }

  static async delete(id) {
    await dbRun('DELETE FROM invoice_item WHERE invoice_id = ?', [id]);
    await dbRun('DELETE FROM invoice WHERE id = ?', [id]);
  }
}

class Payment {
  static async create(invoiceId, amount, paymentMethod) {
    const id = generateId();
    await dbRun(
      'INSERT INTO payment (id, invoice_id, amount, payment_method) VALUES (?, ?, ?, ?)',
      [id, invoiceId, amount, paymentMethod]
    );
    
    // Update invoice status
    await dbRun('UPDATE invoice SET status = ? WHERE id = ?', ['paid', invoiceId]);
    
    return this.getById(id);
  }

  static async getAll() {
    return dbAll(`
      SELECT p.*, i.invoice_number, i.total as invoice_total, c.name as customer_name
      FROM payment p
      LEFT JOIN invoice i ON p.invoice_id = i.id
      LEFT JOIN customer c ON i.customer_id = c.id
      ORDER BY p.created_at DESC
    `);
  }

  static async getById(id) {
    return dbGet(`
      SELECT p.*, i.invoice_number, i.total as invoice_total, c.name as customer_name
      FROM payment p
      LEFT JOIN invoice i ON p.invoice_id = i.id
      LEFT JOIN customer c ON i.customer_id = c.id
      WHERE p.id = ?
    `, [id]);
  }

  static async getByInvoice(invoiceId) {
    return dbAll(
      'SELECT * FROM payment WHERE invoice_id = ? ORDER BY created_at DESC',
      [invoiceId]
    );
  }

  static async delete(id) {
    await dbRun('DELETE FROM payment WHERE id = ?', [id]);
  }
}

class UserReview {
  static async create(invoiceId, customerId, rating, comment) {
    const id = generateId();
    await dbRun(
      'INSERT INTO user_review (id, invoice_id, customer_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [id, invoiceId, customerId, rating, comment]
    );
    return this.getById(id);
  }

  static async getAll() {
    return dbAll(`
      SELECT ur.*, c.name as customer_name, i.invoice_number
      FROM user_review ur
      LEFT JOIN customer c ON ur.customer_id = c.id
      LEFT JOIN invoice i ON ur.invoice_id = i.id
      ORDER BY ur.created_at DESC
    `);
  }

  static async getById(id) {
    return dbGet(`
      SELECT ur.*, c.name as customer_name, i.invoice_number
      FROM user_review ur
      LEFT JOIN customer c ON ur.customer_id = c.id
      LEFT JOIN invoice i ON ur.invoice_id = i.id
      WHERE ur.id = ?
    `, [id]);
  }

  static async getByCustomer(customerId) {
    return dbAll(
      'SELECT * FROM user_review WHERE customer_id = ? ORDER BY created_at DESC',
      [customerId]
    );
  }

  static async delete(id) {
    await dbRun('DELETE FROM user_review WHERE id = ?', [id]);
  }
}

module.exports = {
  Invoice,
  Payment,
  UserReview
};
