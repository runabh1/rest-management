# Restaurant Bill Management System

A comprehensive web-based restaurant billing management system that helps manage menus, customers, invoices, payments, and customer reviews.

## Features

- **Menu Management**: Add, update, and delete menu items with categories
- **Customer Management**: Track customer information and order history
- **Bill Generation**: Create and manage bills/invoices for orders
- **Payment Tracking**: Record and manage customer payments
- **Customer Reviews**: Collect and manage customer feedback and ratings
- **Analytics Dashboard**: View sales analytics and reports
- **Tax Management**: Configure and apply taxes to bills
- **Order Management**: Manage ongoing orders and order items

## Tech Stack

### Backend
- Node.js with Express.js
- SQLite database
- RESTful API architecture

### Frontend
- React.js
- Bootstrap 5 for UI
- Axios for HTTP requests

## Project Structure

```
bill-management-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── app.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── .env.example
└── README.md
```

## Installation

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The application will open on `http://localhost:3000`

## Environment Configuration

Create `.env` files in both backend and frontend directories:

### Backend `.env`
```
PORT=5000
NODE_ENV=development
DATABASE=restaurant.db
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000
```

## Database Schema

The system includes the following tables:
- **menu**: Food items and details
- **customer**: Customer information
- **invoice**: Bill records
- **invoice_item**: Items in each bill
- **payment**: Payment information
- **user_review**: Customer reviews and ratings
- **food_type**: Categories for menu items
- **taxes**: Tax configuration

## API Endpoints

### Menu Management
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice details

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Record payment

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Submit review

## Usage

1. Start the backend server
2. Start the frontend application
3. Access the application at `http://localhost:3000`
4. Log in or create an account (if authentication is enabled)
5. Use the menu to manage restaurant operations

## Features Workflow

### Creating a Bill
1. Navigate to "New Order"
2. Select a customer or create a new one
3. Add menu items to the order
4. Review the bill with tax calculations
5. Process payment
6. Generate bill receipt

### Managing Reviews
1. Navigate to "Feedback/Reviews"
2. View customer reviews
3. Manage ratings and comments

### Analytics
1. Navigate to "Analytics"
2. View sales reports
3. Check customer statistics
4. Monitor revenue trends

## Contributing

This project is open for contributions. Feel free to fork and submit pull requests.

## License

MIT License

## Author

Created based on the WOW Kitchen Restaurant Billing Management System concept

## Support

For issues or questions, please open an issue in the repository.
