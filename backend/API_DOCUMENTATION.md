# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "whatsapp": "+923001234567",
  "password": "password123",
  "confirmPassword": "password123",
  "referralCode": "ABC123" // optional
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "referralCode": "JOHNDOE123",
  "token": "jwt_token"
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "usernameOrEmail": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "referralCode": "JOHNDOE123",
  "isAdmin": false,
  "isVendor": false,
  "token": "jwt_token"
}
```

### Get Current User
**GET** `/auth/me` (Protected)

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "referralCode": "JOHNDOE123",
  ...
}
```

---

## User Dashboard

### Get Dashboard Data
**GET** `/users/dashboard` (Protected)

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "username": "johndoe",
    "referralCode": "JOHNDOE123",
    "referralLink": "http://localhost:3000/register?ref=JOHNDOE123"
  },
  "referralStats": {
    "level1Count": 5,
    "level2Count": 10,
    "level3Count": 15
  },
  "earnings": {
    "totalEarnings": 1000,
    "totalWithdrawals": 500,
    "currentBalance": 500,
    "referralEarnings": 200,
    "taskEarnings": 300,
    "blogEarnings": 0,
    "shopEarnings": 0
  },
  "recentEarnings": [...],
  "withdrawals": [...]
}
```

### Update Profile
**PUT** `/users/profile` (Protected)

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "newemail@example.com",
  "whatsapp": "+923001234567"
}
```

---

## Tasks (Earning System)

### Get All Active Tasks
**GET** `/tasks` (Protected)

**Response:**
```json
[
  {
    "_id": "task_id",
    "postLink": "https://facebook.com/post/123",
    "requiredActions": {
      "likes": 100,
      "comments": 50,
      "shares": 25
    },
    "quantity": 1000,
    "cost": 2000,
    "workerPay": 1.0,
    "status": "active"
  }
]
```

### Create Task (Client)
**POST** `/tasks` (Protected)

**Request Body:**
```json
{
  "postLink": "https://facebook.com/post/123",
  "requiredActions": {
    "likes": 100,
    "comments": 50,
    "shares": 25
  },
  "quantity": 1000,
  "cost": 2000
}
```

### Submit Task Proof
**POST** `/tasks/:taskId/submit` (Protected)

**Request Body:**
```json
{
  "proof": "https://screenshot.com/proof.jpg"
}
```

### Get My Submissions
**GET** `/tasks/my-submissions` (Protected)

---

## Education (Classes)

### Get All Classes
**GET** `/classes` (Public)

**Response:**
```json
[
  {
    "_id": "class_id",
    "title": "Web Development Basics",
    "description": "Learn HTML, CSS, JavaScript",
    "zoomLink": "https://zoom.us/j/123456",
    "classTime": "2024-01-15T10:00:00Z",
    "status": "live"
  }
]
```

### Get Live Classes
**GET** `/classes/live` (Public)

### Create Class (Admin)
**POST** `/classes` (Admin)

**Request Body:**
```json
{
  "title": "Web Development Basics",
  "description": "Learn HTML, CSS, JavaScript",
  "zoomLink": "https://zoom.us/j/123456",
  "classTime": "2024-01-15T10:00:00Z",
  "status": "upcoming"
}
```

---

## Blog System

### Get All Published Blogs
**GET** `/blogs?category=tech&search=react` (Public)

**Response:**
```json
[
  {
    "_id": "blog_id",
    "title": "Getting Started with React",
    "content": "...",
    "category": "tech",
    "author": {
      "username": "johndoe",
      "name": "John Doe"
    },
    "views": 100,
    "adRevenue": 50,
    "createdAt": "2024-01-10T10:00:00Z"
  }
]
```

### Get Single Blog
**GET** `/blogs/:id` (Public)

### Create Blog
**POST** `/blogs` (Protected)

**Request Body:**
```json
{
  "title": "My Blog Title",
  "content": "Blog content here...",
  "category": "tech",
  "tags": ["react", "javascript"],
  "featuredImage": "https://image.com/blog.jpg"
}
```

### Get My Blogs
**GET** `/blogs/my-blogs` (Protected)

### Approve Blog (Admin)
**PUT** `/blogs/:id/approve` (Admin)

---

## Shop System

### Get All Products
**GET** `/shop/products?category=electronics&search=laptop` (Public)

**Response:**
```json
[
  {
    "_id": "product_id",
    "name": "Laptop",
    "description": "High performance laptop",
    "price": 50000,
    "images": ["https://image.com/laptop.jpg"],
    "category": "electronics",
    "stock": 10,
    "vendor": {
      "username": "vendor1",
      "shopName": "Tech Store"
    }
  }
]
```

### Add to Cart
**POST** `/shop/cart` (Protected)

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 2
}
```

### Get Cart
**GET** `/shop/cart` (Protected)

### Create Order
**POST** `/shop/orders` (Protected)

**Request Body:**
```json
{
  "paymentMethod": "cod", // or "advance"
  "shippingAddress": {
    "name": "John Doe",
    "phone": "+923001234567",
    "address": "123 Main St",
    "city": "Karachi",
    "postalCode": "75000"
  }
}
```

### Register as Vendor
**POST** `/shop/vendor/register` (Protected)

**Request Body:**
```json
{
  "shopName": "My Shop"
}
```

---

## Withdrawals

### Request Withdrawal
**POST** `/withdrawals` (Protected)

**Request Body:**
```json
{
  "amount": 500,
  "paymentMethod": "easypaisa", // easypaisa, jazzcash, bank, other
  "accountDetails": {
    "accountNumber": "1234567890",
    "accountName": "John Doe",
    "phoneNumber": "+923001234567"
  }
}
```

**Minimum withdrawal:** 100 PKR

### Get My Withdrawals
**GET** `/withdrawals` (Protected)

---

## Admin Endpoints

### Get All Users
**GET** `/admin/users?search=john&isBlocked=false` (Admin)

### Get User Details
**GET** `/admin/users/:id` (Admin)

### Block/Unblock User
**PUT** `/admin/users/:id/block` (Admin)

### Approve Vendor
**PUT** `/admin/vendors/:id/approve` (Admin)

### Get Dashboard Stats
**GET** `/admin/stats` (Admin)

**Response:**
```json
{
  "users": {
    "total": 1000,
    "vendors": 50,
    "pendingVendors": 10
  },
  "shop": {
    "products": 500,
    "orders": 200
  },
  "content": {
    "blogs": 300,
    "pendingBlogs": 20,
    "tasks": 100
  },
  "financial": {
    "totalEarnings": 100000,
    "totalWithdrawals": 50000,
    "pendingWithdrawals": 5000
  }
}
```

### Get Pending Blogs
**GET** `/admin/blogs/pending` (Admin)

### Get Pending Task Submissions
**GET** `/admin/tasks/submissions/pending` (Admin)

### Approve Task Submission
**PUT** `/admin/tasks/submissions/:submissionId/approve` (Admin)

### Approve Withdrawal
**PUT** `/admin/withdrawals/:id/approve` (Admin)

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error message here"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

