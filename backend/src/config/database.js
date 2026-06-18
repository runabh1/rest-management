const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../../restaurant.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

function initializeDatabase() {
  console.log('Initializing database schema...');

  const schema = `
    CREATE TABLE IF NOT EXISTS food_type (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menu (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      food_type_id TEXT NOT NULL,
      image TEXT,
      available BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (food_type_id) REFERENCES food_type(id)
    );

    CREATE TABLE IF NOT EXISTS customer (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS taxes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      percentage REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoice (
      id TEXT PRIMARY KEY,
      invoice_number TEXT NOT NULL UNIQUE,
      customer_id TEXT NOT NULL,
      subtotal REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      payment_method TEXT DEFAULT 'cod',
      payment_status TEXT DEFAULT 'unpaid',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customer(id)
    );

    CREATE TABLE IF NOT EXISTS invoice_item (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      menu_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoice(id),
      FOREIGN KEY (menu_id) REFERENCES menu(id)
    );

    CREATE TABLE IF NOT EXISTS payment (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoice(id)
    );

    CREATE TABLE IF NOT EXISTS user_review (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      rating INTEGER,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoice(id),
      FOREIGN KEY (customer_id) REFERENCES customer(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      username TEXT UNIQUE,
      role TEXT DEFAULT 'customer',
      name TEXT,
      phone TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

    CREATE INDEX IF NOT EXISTS idx_menu_food_type ON menu(food_type_id);
    CREATE INDEX IF NOT EXISTS idx_invoice_customer ON invoice(customer_id);
    CREATE INDEX IF NOT EXISTS idx_invoice_item_invoice ON invoice_item(invoice_id);
    CREATE INDEX IF NOT EXISTS idx_payment_invoice ON payment(invoice_id);
    CREATE INDEX IF NOT EXISTS idx_review_invoice ON user_review(invoice_id);
  `;

  db.exec(schema, (err) => {
    if (err) {
      console.error('Error initializing database:', err);
    } else {
      console.log('Database schema is ready');
      runMigrations();
    }
  });
}

function runMigrations() {
  addColumnIfMissing('invoice', 'payment_method', "TEXT DEFAULT 'cod'");
  addColumnIfMissing('invoice', 'payment_status', "TEXT DEFAULT 'unpaid'");

  // Seed default users after a short delay to let migrations finish
  setTimeout(() => seedDefaultUsers(), 500);
}

function addColumnIfMissing(tableName, columnName, definition) {
  db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
    if (err) {
      console.error(`Error checking ${tableName}.${columnName}:`, err);
      return;
    }

    if (columns.some((column) => column.name === columnName)) {
      return;
    }

    db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`, (alterErr) => {
      if (alterErr) {
        console.error(`Error adding ${tableName}.${columnName}:`, alterErr);
      }
    });
  });
}

async function seedDefaultUsers() {
  try {
    // --- Default Admin ---
    const adminEmail = 'admin@rest.com';
    const adminRow = await promiseGet('SELECT id FROM users WHERE email = ? AND role = ?', [adminEmail, 'admin']);
    if (!adminRow) {
      const adminId = uuidv4();
      const hashedAdminPass = await bcrypt.hash('admin123', 10);
      await promiseRun(
        'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
        [adminId, adminEmail, hashedAdminPass, 'Admin', 'admin']
      );
      console.log('✅ Default admin seeded  →  admin@rest.com / admin123');
    }

    // --- Default Customer ---
    const custEmail = 'customer@rest.com';
    const custRow = await promiseGet('SELECT id FROM users WHERE email = ? AND role = ?', [custEmail, 'customer']);
    if (!custRow) {
      const custId = uuidv4();
      const customerId = uuidv4();
      const hashedCustPass = await bcrypt.hash('customer123', 10);

      // Create customer record first (needed for orders)
      await promiseRun(
        'INSERT INTO customer (id, name, phone, email, address) VALUES (?, ?, ?, ?, ?)',
        [customerId, 'Default Customer', '9999999999', custEmail, '']
      );

      // Create user account
      await promiseRun(
        'INSERT INTO users (id, email, password, name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
        [custId, custEmail, hashedCustPass, 'Default Customer', '9999999999', 'customer']
      );
      console.log('✅ Default customer seeded  →  customer@rest.com / customer123');
    }
  } catch (err) {
    console.error('Error seeding default users:', err);
  }
}

// Tiny promise wrappers used only by the seed function above
function promiseRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function promiseGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Promise wrapper for database operations
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll
};
