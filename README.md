# Cart API - E-commerce Backend System

A secure RESTful API for e-commerce cart management built with Node.js, Express, Prisma ORM, and MySQL.

## 🚀 Features

- **User Management**: Create and manage users with email validation
- **Product Catalog**: Add, view, and manage products with stock tracking
- **Shopping Cart**: Create carts, add/remove items, checkout functionality
- **Secure API**: Input validation, error handling, no sensitive data exposure
- **Comprehensive Logging**: Winston logger with daily rotation
- **Docker Support**: Fully containerized with Docker Compose
- **Database**: MySQL with Prisma ORM
- **54 Test Cases**: Comprehensive Postman test suite
- **🎯 Professional Blue-Green Deployment**: Zero-downtime deployments with pre-switch testing

## 📋 Prerequisites

- Node.js 20.x or higher
- MySQL 8.x
- Docker & Docker Compose (for containerized deployment)
- npm or yarn

## 🛠️ Installation & Setup

### **Option 1: Local Development**

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Rest_Api_Documentation.git
   cd Rest_Api_Documentation
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Setup database**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

   API will be available at: `http://localhost:5000`

### **Option 2: Docker Deployment**

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - **API**: `http://localhost:5001`
   - **MySQL**: `localhost:3306`
   - **phpMyAdmin**: `http://localhost:8080`

2. **Stop services**
   ```bash
   docker-compose down
   ```

3. **Rebuild after code changes**
   ```bash
   docker-compose up -d --build
   ```

## 📡 API Endpoints

### **Health Check**
- `GET /health` - API health status (for monitoring/CI-CD)

### **Users**
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users

### **Products**
- `POST /api/products` - Create a product
- `GET /api/products` - Get all products (supports filters)

### **Cart**
- `POST /api/cart/create` - Create a cart for a user
- `POST /api/cart/add-item` - Add item to cart
- `DELETE /api/cart/remove-item/:productId` - Remove item from cart
- `POST /api/cart/checkout` - Checkout cart
- `DELETE /api/cart/:cartId` - Delete cart

## 🧪 Testing

### **Postman Collections**

Three test collections available:

1. **Local Development** (Port 5000)
   ```
   Cart_API_Complete_50_Tests.postman_collection.json
   ```

2. **Docker** (Port 5001)
   ```
   Cart_API_Docker_Tests.postman_collection.json
   ```

**How to run:**
1. Import collection into Postman
2. Run collection with 500ms delay between requests
3. All 54 tests should pass

## 🗃️ Database Schema

```
Users (id, first_name, last_name, email, phone, password, created_at, updated_at)
Products (id, name, description, price, stock_quantity, status, created_at, updated_at)
Carts (id, user_id, subtotal, total_amount, status, created_at, updated_at)
Cart_Items (id, cart_id, product_id, quantity, unit_price, total, created_at)
```

**Relationships:**
- Users 1:M Carts
- Carts 1:M Cart_Items
- Products 1:M Cart_Items

## 🔒 Security Features

✅ Input validation on all endpoints  
✅ SQL injection prevention (Prisma ORM)  
✅ No sensitive data exposure in errors  
✅ Helmet.js security headers  
✅ CORS configuration  
✅ Secure error handling  

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `port` | Server port | `5000` |
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost:3306/db` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `LOG_LEVEL` | Logging level | `info` / `debug` / `error` |

## 📊 Logging

Logs are stored in `backend/logs/`:
- `all-YYYY-MM-DD.log` - All requests
- `error-YYYY-MM-DD.log` - Errors only
- `http-YYYY-MM-DD.log` - HTTP requests

**Log format:**
```
2026-06-05 19:30:15 [info]: [POST] /api/users | User: anonymous | Status: 201 | 45ms | ✓ | User created - Email: john@example.com
```

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| API | 5001 | Node.js REST API |
| MySQL | 3306 | Database |
| phpMyAdmin | 8080 | Database management UI |

## 🚀 Production Deployment

This project uses **professional blue-green deployment** with AWS Application Load Balancer:

- ✅ **Zero downtime** - Users never experience interruptions
- ✅ **Zero risk** - Tests run BEFORE traffic switch
- ✅ **Automatic rollback** - Failed deployments don't affect users
- ✅ **SonarCloud integration** - Code quality checks on every deployment
- ✅ **Industry standard** - Used by Netflix, Amazon, Facebook

### Live Deployment
- **Production URL**: `http://cart-api-alb-810038360.eu-north-1.elb.amazonaws.com`
- **Health Check**: `http://cart-api-alb-810038360.eu-north-1.elb.amazonaws.com/health`

### Architecture
- **Load Balancer**: AWS Application Load Balancer (ALB)
- **Compute**: 2x EC2 t3.small instances (Blue & Green)
- **Database**: AWS RDS MySQL db.t4g.micro
- **CI/CD**: GitHub Actions with automated testing
- **Region**: eu-north-1 (Stockholm)

📖 **[Complete Deployment Documentation](./DEPLOYMENT_STRATEGY.md)** - Detailed guide on the professional deployment strategy

### Quick Deployment Info
- Push to `main` branch triggers automatic deployment
- Pre-switch testing ensures no bugs reach users
- Automatic rollback if tests fail
- Complete deployment history in GitHub Actions

## 🔧 Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express 5
- **ORM**: Prisma 5.19
- **Database**: MySQL 8
- **Logging**: Winston
- **Security**: Helmet.js
- **Containerization**: Docker

## 📦 Project Structure

```
Rest_Api_Documentation/
├── backend/
│   ├── config/          # Configuration files
│   ├── controller/      # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── prisma/          # Database schema & migrations
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── logs/            # Application logs
│   ├── .env             # Environment variables (not in Git)
│   ├── Dockerfile       # Docker image config
│   └── package.json     # Dependencies
├── docker-compose.yml   # Multi-container setup
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

Ahmed Ali

## 🙏 Acknowledgments

- Built with Node.js and Express
- Prisma ORM for type-safe database access
- Docker for containerization
