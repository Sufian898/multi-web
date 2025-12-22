# Backend Server

This is the backend server for the Life Changer Way application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file and configure:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://1234saad:1234saad@cluster0.5ndemf8.mongodb.net/myweb?appName=Cluster0


```

3. Run the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### User Dashboard
- `GET /api/users/dashboard` - Get user dashboard data (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)
- `GET /api/users/referrals` - Get referral team details (Protected)

### Tasks (Earning System)
- `GET /api/tasks` - Get all active tasks (Protected)
- `POST /api/tasks` - Create new task (Protected)
- `POST /api/tasks/:taskId/submit` - Submit task proof (Protected)
- `GET /api/tasks/my-submissions` - Get user's submissions (Protected)
- `PUT /api/tasks/submissions/:submissionId/approve` - Approve submission (Admin)
- `PUT /api/tasks/submissions/:submissionId/reject` - Reject submission (Admin)

### Education (Classes)
- `GET /api/classes` - Get all classes (Public)
- `GET /api/classes/live` - Get live classes (Public)
- `POST /api/classes` - Create class (Admin)
- `PUT /api/classes/:id` - Update class (Admin)
- `DELETE /api/classes/:id` - Delete class (Admin)

### Blog System
- `GET /api/blogs` - Get all published blogs (Public)
- `GET /api/blogs/:id` - Get single blog (Public)
- `POST /api/blogs` - Create blog (Protected)
- `GET /api/blogs/my-blogs` - Get user's blogs (Protected)
- `PUT /api/blogs/:id` - Update blog (Protected)
- `PUT /api/blogs/:id/approve` - Approve blog (Admin)
- `PUT /api/blogs/:id/reject` - Reject blog (Admin)
- `PUT /api/blogs/:id/revenue` - Update blog ad revenue (Admin)

### Shop System
- `GET /api/shop/products` - Get all products (Public)
- `GET /api/shop/products/:id` - Get single product (Public)
- `POST /api/shop/products` - Add product (Vendor)
- `PUT /api/shop/products/:id` - Update product (Vendor/Admin)
- `POST /api/shop/vendor/register` - Register as vendor (Protected)
- `POST /api/shop/cart` - Add to cart (Protected)
- `GET /api/shop/cart` - Get cart (Protected)
- `POST /api/shop/orders` - Create order (Protected)
- `GET /api/shop/orders` - Get user orders (Protected)
- `GET /api/shop/vendor/orders` - Get vendor orders (Vendor)
- `PUT /api/shop/orders/:id/status` - Update order status (Vendor)

### Withdrawals
- `POST /api/withdrawals` - Request withdrawal (Protected)
- `GET /api/withdrawals` - Get user withdrawals (Protected)
- `GET /api/withdrawals/all` - Get all withdrawals (Admin)
- `PUT /api/withdrawals/:id/approve` - Approve withdrawal (Admin)
- `PUT /api/withdrawals/:id/reject` - Reject withdrawal (Admin)

### Admin
- `GET /api/admin/users` - Get all users (Admin)
- `GET /api/admin/users/:id` - Get user details (Admin)
- `PUT /api/admin/users/:id/block` - Block/Unblock user (Admin)
- `PUT /api/admin/vendors/:id/approve` - Approve vendor (Admin)
- `PUT /api/admin/vendors/:id/reject` - Reject vendor (Admin)
- `GET /api/admin/stats` - Get dashboard stats (Admin)
- `GET /api/admin/blogs/pending` - Get pending blogs (Admin)
- `GET /api/admin/tasks/submissions/pending` - Get pending submissions (Admin)

## Project Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── config/
│   └── database.js       # MongoDB connection
├── models/               # Database models
│   ├── User.js
│   ├── Task.js
│   ├── TaskSubmission.js
│   ├── Earning.js
│   ├── Withdrawal.js
│   ├── Class.js
│   ├── Blog.js
│   ├── Product.js
│   ├── Order.js
│   └── Cart.js
├── controllers/          # Route controllers
│   ├── authController.js
│   ├── userController.js
│   ├── taskController.js
│   ├── classController.js
│   ├── blogController.js
│   ├── shopController.js
│   ├── withdrawalController.js
│   └── adminController.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── taskRoutes.js
│   ├── classRoutes.js
│   ├── blogRoutes.js
│   ├── shopRoutes.js
│   ├── withdrawalRoutes.js
│   └── adminRoutes.js
├── middleware/          # Custom middleware
│   └── auth.js
├── utils/               # Utility functions
│   ├── generateToken.js
│   └── referralHelper.js
├── .env                 # Environment variables
└── README.md            # Documentation
```

## Database

MongoDB connection is configured. Make sure MongoDB is running on your system before starting the server.

Default connection: `mongodb+srv://1234saad:1234saad@cluster0.5ndemf8.mongodb.net/myweb?appName=Cluster0

`

## Features

### 1. Referral System (3-Level Chain)
- Automatic referral chain tracking
- Level 1, 2, and 3 referral earnings
- Referral code generation

### 2. Earning System
- Social media task creation and submission
- Task proof verification
- Automatic referral commission distribution
- Earnings tracking

### 3. Education System
- Class management with Zoom integration
- Live class tracking
- Class scheduling

### 4. Blog System
- User blog submission
- Admin approval workflow
- Blog ad revenue tracking
- Blog earnings

### 5. Shop System
- Multi-vendor support
- Product management
- Cart functionality
- Order management (COD & Advance payment)
- Vendor commission tracking

### 6. Withdrawal System
- Withdrawal requests
- Admin approval/rejection
- Payment method support

### 7. Admin Management
- User management
- Vendor approval
- Blog moderation
- Task submission approval
- Dashboard statistics

## Security

- Password hashing with bcryptjs
- JWT authentication
- Protected routes
- Input validation
- Admin role-based access control

## Environment Variables

Create a `.env` file with:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://1234saad:1234saad@cluster0.5ndemf8.mongodb.net/myweb?appName=Cluster0


JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

