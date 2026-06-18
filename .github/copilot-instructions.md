# Restaurant Billing Management System - Setup Instructions

This is a full-stack restaurant billing management system built with Node.js/Express backend and React frontend using SQLite database.

## Project Structure

```
bill-management-system/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # API controllers
│   │   ├── models/            # Data models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Express middleware
│   │   ├── utils/             # Helper functions
│   │   └── app.js             # Express app entry point
│   ├── package.json
│   └── .env.example
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service calls
│   │   ├── App.js             # Main app component
│   │   └── index.js           # React entry point
│   ├── public/
│   └── package.json
└── README.md
```

## Features

✅ **Menu Management** - Add, edit, delete menu items and categories
✅ **Customer Management** - Manage customer profiles and history
✅ **Invoice Generation** - Create bills with items and automatic calculation
✅ **Payment Tracking** - Record payments in multiple methods
✅ **Customer Reviews** - Collect ratings and feedback
✅ **Analytics Dashboard** - View sales metrics and trends
✅ **Tax Configuration** - Configure and apply taxes
✅ **Order Management** - Track order items and quantities

## Technology Stack

- **Backend**: Node.js, Express.js, SQLite3
- **Frontend**: React 18, React Router, Bootstrap 5
- **Database**: SQLite (file-based, no setup required)
- **HTTP Client**: Axios
- **ID Generation**: UUID

## Getting Started

### Prerequisites
- Node.js (v14+) and npm installed
- Windows, macOS, or Linux

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   copy .env.example .env
   ```
   (On macOS/Linux: `cp .env.example .env`)

4. Start the backend server:
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:5000

### Frontend Setup

In a new terminal:

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   copy .env.example .env
   ```
   (On macOS/Linux: `cp .env.example .env`)

4. Start React development server:
   ```bash
   npm start
   ```
   Application will open on http://localhost:3000

## API Endpoints

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice details

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Record payment
- `DELETE /api/payments/:id` - Delete payment

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Submit review
- `DELETE /api/reviews/:id` - Delete review

### Analytics
- `GET /api/analytics` - Get analytics dashboard data

## Database

The SQLite database (`restaurant.db`) is automatically created on first run with the following tables:
- menu
- customer
- invoice
- invoice_item
- payment
- user_review
- food_type
- taxes

## Usage Guide

### Creating a Menu Item
1. Go to Menu tab
2. Click "Add Menu Item"
3. Fill in name, description, price, and category
4. Click "Create"

### Adding a Customer
1. Go to Customers tab
2. Click "Add Customer"
3. Enter customer details
4. Click "Create"

### Creating an Invoice
1. Go to Invoices tab
2. Click "Create Invoice"
3. Select customer
4. Add menu items with quantities
5. Select tax (optional)
6. Click "Create Invoice"

### Recording Payment
1. Go to Payments tab
2. Click "Record Payment"
3. Select invoice and payment details
4. Click "Record Payment"

### Viewing Analytics
1. Go to Analytics tab
2. View key metrics, top items, and sales trends

## File Structure Details

### Backend Database Config
- `src/config/database.js` - SQLite connection and schema initialization
- Uses promise-based wrapper for async queries

### Models
- `src/models/index.js` - FoodType, Menu, Customer, Taxes models
- `src/models/transactions.js` - Invoice, Payment, UserReview models

### Controllers
- `src/controllers/basicControllers.js` - Menu, Customer, Taxes operations
- `src/controllers/transactionControllers.js` - Invoices, Payments, Reviews, Analytics

### Routes
- `src/routes/basicRoutes.js` - Menu, Customer, Taxes routes
- `src/routes/transactionRoutes.js` - Invoice, Payment, Review, Analytics routes

### Frontend Services
- `src/services/api.js` - Centralized Axios API calls

### Frontend Pages
- Dashboard - Overview with analytics cards
- Menu - Menu item management
- Customers - Customer management
- Invoices - Invoice creation and viewing
- Payments - Payment recording
- Reviews - Customer reviews and ratings
- Analytics - Detailed analytics dashboard

## Troubleshooting

**Backend won't start:**
- Check if port 5000 is already in use
- Ensure Node.js is installed: `node --version`
- Check `.env` file exists in backend folder

**Frontend won't connect:**
- Verify backend is running on http://localhost:5000
- Check REACT_APP_API_URL in `.env`
- Clear browser cache or try incognito mode

**Database issues:**
- Delete `restaurant.db` file to reset database
- Ensure write permissions in backend folder

**Port conflicts:**
- Backend: Change PORT in `.env` to different port (e.g., 5001)
- Frontend: Use PORT=3001 npm start

## Development

### Adding new features:
1. Backend: Create model → controller → route
2. Frontend: Create service method → component → page
3. Test API with Postman or curl

### Building for production:
```bash
# Backend (already production-ready)
npm start

# Frontend
npm run build
```

## License

MIT License

## Support

For issues or questions, refer to the README.md or check the GitHub repository.

---

**Next Steps:**
1. Open two terminals (one for backend, one for frontend)
2. Run `npm install` in both folders
3. Run `npm run dev` in backend, `npm start` in frontend
4. Access app at http://localhost:3000
