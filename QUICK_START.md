# Quick Start Guide

Get the Restaurant Billing Management System up and running in minutes!

## Windows Users (Recommended Method)

### Option 1: Using Command Prompt

**Terminal 1 - Backend Setup:**
```bash
cd backend
npm install
npm run dev
```
You should see: `Restaurant Billing System Backend running on http://localhost:5000`

**Terminal 2 - Frontend Setup:**
```bash
cd frontend
npm install
npm start
```
The browser will automatically open at `http://localhost:3000`

### Option 2: Using PowerShell

Same commands as above.

## macOS/Linux Users

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

## First Time Setup Checklist

- [ ] Node.js installed (check: `node --version`)
- [ ] npm installed (check: `npm --version`)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Database file created (restaurant.db)
- [ ] Can access http://localhost:3000

## Initial Data Setup

The system comes with an empty database. Here's how to populate it:

### 1. Add Food Categories
- Navigate to Menu page
- You'll see it's empty

### 2. Add Menu Items
- Click "Add Menu Item"
- First add some categories:
  - Starters
  - Main Course
  - Desserts
  - Beverages

### 3. Add Menu Items
- Click "Add Menu Item"
- Examples:
  - Biryani - Main Course - ₹250
  - Butter Chicken - Main Course - ₹300
  - Mango Lassi - Beverages - ₹50

### 4. Add Customers
- Go to Customers tab
- Click "Add Customer"
- Add sample customers

### 5. Create Your First Invoice
- Go to Invoices tab
- Click "Create Invoice"
- Select customer, items, and quantities
- Create invoice

### 6. Record Payment
- Go to Payments tab
- Click "Record Payment"
- Select the invoice you created

### 7. View Analytics
- Go to Analytics tab
- You should see your data!

## Features to Try

1. **Dashboard** - Overview of key metrics
2. **Menu** - Manage food items and categories
3. **Customers** - Add and manage customer profiles
4. **Invoices** - Create and view bills
5. **Payments** - Track and record payments
6. **Reviews** - Collect customer feedback
7. **Analytics** - View business insights

## Common Issues

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Change PORT in backend/.env to 5001 |
| Can't connect frontend to backend | Verify backend is running, check REACT_APP_API_URL |
| npm install fails | Delete node_modules and package-lock.json, retry |
| Database errors | Delete restaurant.db file, restart backend |

## Default Ports

- Backend API: `http://localhost:5000`
- Frontend App: `http://localhost:3000`

## Stop the Servers

- Press `Ctrl+C` in each terminal

## Next Steps

- Explore all menu options
- Create test invoices
- Check analytics dashboard
- Try different payment methods
- Leave customer reviews

## Need Help?

Refer to the full README.md in the project root for detailed documentation.

---

**Happy Billing! 🍽️**
