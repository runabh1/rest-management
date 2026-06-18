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
  setTimeout(async () => {
    try {
      await seedDefaultUsers();
      await seedDefaultMenu();
    } catch (err) {
      console.error('Error seeding defaults:', err);
    }
  }, 500);
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

// Promise wrappers for general database operations
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

async function seedDefaultMenu() {
  try {
    const menuCountRow = await promiseGet('SELECT COUNT(*) as count FROM menu');
    if (menuCountRow && menuCountRow.count > 0) {
      return; // Already seeded
    }

    console.log('🌱 Starting automatic database menu seed...');

    // Create food types
    const categories = [
      { id: uuidv4(), name: 'Starters & Appetizers' },
      { id: uuidv4(), name: 'Main Course' },
      { id: uuidv4(), name: 'Desserts' },
      { id: uuidv4(), name: 'Beverages' },
      { id: uuidv4(), name: 'Breads' }
    ];

    for (const category of categories) {
      await promiseRun('INSERT INTO food_type (id, name) VALUES (?, ?)', [category.id, category.name]);
    }

    const getCategoryId = (name) => categories.find(c => c.name === name).id;

    const menuItems = [
      // Starters
      {
        name: 'Paneer Tikka',
        description: 'Creamy paneer cubes marinated in yogurt and spices, grilled to perfection',
        price: 250,
        categoryName: 'Starters & Appetizers',
        image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd37b1b?w=400&h=300&fit=crop'
      },
      {
        name: 'Chicken 65',
        description: 'Spicy and crispy fried chicken, a South Indian delicacy',
        price: 280,
        categoryName: 'Starters & Appetizers',
        image: 'https://images.unsplash.com/photo-1599599810545-a16d32d37f9f?w=400&h=300&fit=crop'
      },
      {
        name: 'Samosa (3 pieces)',
        description: 'Crispy pastry filled with spiced potatoes and peas',
        price: 120,
        categoryName: 'Starters & Appetizers',
        image: 'https://images.unsplash.com/photo-1599599810694-d1e0e7d33c0c?w=400&h=300&fit=crop'
      },
      {
        name: 'Spring Rolls (4 pieces)',
        description: 'Crispy vegetable spring rolls served with sweet chili sauce',
        price: 180,
        categoryName: 'Starters & Appetizers',
        image: 'https://images.unsplash.com/photo-1599599810694-d1e0e7d33c0d?w=400&h=300&fit=crop'
      },
      // Main Course
      {
        name: 'Butter Chicken',
        description: 'Tender chicken in creamy tomato and butter sauce with aromatic spices',
        price: 320,
        categoryName: 'Main Course',
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop'
      },
      {
        name: 'Biryani (Chicken)',
        description: 'Fragrant basmati rice cooked with tender chicken and traditional spices',
        price: 300,
        categoryName: 'Main Course',
        image: 'https://images.unsplash.com/photo-1589521471516-b47d0e79e1b1?w=400&h=300&fit=crop'
      },
      {
        name: 'Tandoori Chicken',
        description: 'Marinated in yogurt and spices, grilled in traditional tandoor',
        price: 350,
        categoryName: 'Main Course',
        image: 'https://images.unsplash.com/photo-1608834322127-b43ec51b2d00?w=400&h=300&fit=crop'
      },
      {
        name: 'Palak Paneer',
        description: 'Fresh spinach cooked with soft paneer cubes in creamy sauce',
        price: 270,
        categoryName: 'Main Course',
        image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=400&h=300&fit=crop'
      },
      {
        name: 'Chole Bhature',
        description: 'Fluffy fried bread served with spiced chickpea curry',
        price: 180,
        categoryName: 'Main Course',
        image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b1?w=400&h=300&fit=crop'
      },
      {
        name: 'Fish Curry',
        description: 'Fresh fish in aromatic coconut and spiced curry',
        price: 380,
        categoryName: 'Main Course',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc029?w=400&h=300&fit=crop'
      },
      // Breads
      {
        name: 'Naan',
        description: 'Soft, fluffy Indian bread baked in tandoor, perfect with curries',
        price: 60,
        categoryName: 'Breads',
        image: 'https://images.unsplash.com/photo-1618069254389-8b29c6f0a8c6?w=400&h=300&fit=crop'
      },
      {
        name: 'Garlic Naan',
        description: 'Fragrant naan infused with fresh garlic and herbs',
        price: 80,
        categoryName: 'Breads',
        image: 'https://images.unsplash.com/photo-1618069254389-8b29c6f0a8c7?w=400&h=300&fit=crop'
      },
      {
        name: 'Roti',
        description: 'Traditional whole wheat flatbread',
        price: 40,
        categoryName: 'Breads',
        image: 'https://images.unsplash.com/photo-1618069254389-8b29c6f0a8c8?w=400&h=300&fit=crop'
      },
      // Desserts
      {
        name: 'Gulab Jamun',
        description: 'Soft dumplings soaked in sweet cardamom syrup',
        price: 120,
        categoryName: 'Desserts',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'
      },
      {
        name: 'Kheer',
        description: 'Creamy rice pudding flavored with cardamom and nuts',
        price: 100,
        categoryName: 'Desserts',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9588?w=400&h=300&fit=crop'
      },
      {
        name: 'Rasgulla',
        description: 'Soft spongy cheese balls in sweet syrup',
        price: 110,
        categoryName: 'Desserts',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9589?w=400&h=300&fit=crop'
      },
      {
        name: 'Jalebi',
        description: 'Crispy fried sweet made with all-purpose flour soaked in sugar syrup',
        price: 80,
        categoryName: 'Desserts',
        image: 'https://images.unsplash.com/photo-1577003833154-a92bbd0f2d2e?w=400&h=300&fit=crop'
      },
      // Beverages
      {
        name: 'Mango Lassi',
        description: 'Refreshing yogurt-based drink with fresh mango',
        price: 80,
        categoryName: 'Beverages',
        image: 'https://images.unsplash.com/photo-1585328707894-d973c4f29b3e?w=400&h=300&fit=crop'
      },
      {
        name: 'Sweet Lassi',
        description: 'Creamy yogurt drink with cardamom and rose water',
        price: 70,
        categoryName: 'Beverages',
        image: 'https://images.unsplash.com/photo-1585328707894-d973c4f29b3f?w=400&h=300&fit=crop'
      },
      {
        name: 'Fresh Lemonade',
        description: 'Freshly squeezed lime juice with mint and sugar',
        price: 60,
        categoryName: 'Beverages',
        image: 'https://images.unsplash.com/photo-1585328707894-d973c4f29b40?w=400&h=300&fit=crop'
      },
      {
        name: 'Iced Tea',
        description: 'Chilled herbal tea with lemon and mint',
        price: 50,
        categoryName: 'Beverages',
        image: 'https://images.unsplash.com/photo-1585328707894-d973c4f29b41?w=400&h=300&fit=crop'
      },
      {
        name: 'Masala Chai',
        description: 'Traditional spiced Indian tea with milk',
        price: 40,
        categoryName: 'Beverages',
        image: 'https://images.unsplash.com/photo-1585328707894-d973c4f29b42?w=400&h=300&fit=crop'
      }
    ];

    for (const item of menuItems) {
      const categoryId = getCategoryId(item.categoryName);
      await promiseRun(
        'INSERT INTO menu (id, name, description, price, food_type_id, image) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), item.name, item.description, item.price, categoryId, item.image]
      );
    }

    console.log('✅ Automatic menu seeding complete!');
  } catch (err) {
    console.error('Error seeding menu:', err);
  }
}

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll
};
