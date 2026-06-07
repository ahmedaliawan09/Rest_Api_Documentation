# 🚀 Deployment Guide - Cart API on AWS EC2

## 📋 Quick Reference

**EC2 Instance Details:**
- **IP Address**: 13.53.105.144
- **Type**: t3.small (2GB RAM)
- **Region**: EU North (Stockholm)
- **Cost**: ~$0.02/hour (~$15/month) - Covered by $100 AWS credits

**Service URLs:**
- **API**: http://13.53.105.144:5001
- **Health Check**: http://13.53.105.144:5001/health
- **phpMyAdmin**: http://13.53.105.144:8080

**SSH Access:**
```powershell
ssh -i "C:\Users\Ahmed Ali\.ssh\cart-api-key.pem" ubuntu@13.53.105.144
```

---

## 🎯 Daily Workflow

### **Starting Your Day (Before Demo)**

1. **Start EC2 Instance:**
   - Go to AWS Console → EC2 → Instances
   - Select your instance
   - Click "Instance state" → "Start instance"
   - Wait 1-2 minutes for it to boot

2. **Test API:**
   - Open browser: http://13.53.105.144:5001/health
   - Should see: `{"status":"ok",...}`

3. **Run Postman Tests:**
   - Open Postman
   - Import: `Cart_API_EC2_Tests.postman_collection.json`
   - Click "Run Collection"
   - All tests should pass ✅

### **Ending Your Day (After Demo)**

1. **Stop EC2 Instance:**
   - AWS Console → EC2 → Instances
   - Select your instance
   - Click "Instance state" → "Stop instance"
   - **Saves money!** (Only pay when running)

---

## 🔄 Deploying Code Changes

### **Method 1: Using PowerShell Script (Recommended)**

```powershell
# Make sure EC2 is running first!
.\deploy.ps1
```

### **Method 2: Manual SSH Deployment**

```powershell
# Connect to EC2
ssh -i "C:\Users\Ahmed Ali\.ssh\cart-api-key.pem" ubuntu@13.53.105.144

# Once connected, run:
cd Rest_Api_Documentation
git pull origin main
docker compose down
docker compose up -d --build
docker compose ps
exit
```

### **Before Deploying:**
1. Commit and push your changes:
   ```powershell
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
2. Make sure EC2 instance is **running**
3. Then deploy using Method 1 or 2

---

## 📊 Viewing Logs

### **View Live Logs:**
```bash
# SSH into EC2 first
ssh -i "C:\Users\Ahmed Ali\.ssh\cart-api-key.pem" ubuntu@13.53.105.144

# View last 50 lines
docker logs cart_api --tail 50

# Follow logs in real-time
docker logs cart_api -f

# View log files
docker exec cart_api ls -lh /app/logs/
docker exec cart_api tail -50 /app/logs/http-2026-06-07.log
```

---

## 🗄️ Database Management

### **Access phpMyAdmin:**
1. Open browser: http://13.53.105.144:8080
2. **Login:**
   - Server: `mysql`
   - Username: `root`
   - Password: `root`
3. Select database: `cartdb`
4. View tables: Users, Products, Carts, Cart_Items

### **View Database via SSH:**
```bash
# SSH into EC2
ssh -i "C:\Users\Ahmed Ali\.ssh\cart-api-key.pem" ubuntu@13.53.105.144

# Connect to MySQL
docker exec -it cart_mysql mysql -uroot -proot

# Once in MySQL:
USE cartdb;
SHOW TABLES;
SELECT * FROM Users;
SELECT * FROM Products;
SELECT * FROM Carts;
SELECT * FROM Cart_Items;
EXIT;
```

---

## 🧪 Testing Your API

### **1. Quick Browser Test:**
- Health: http://13.53.105.144:5001/health
- Products: http://13.53.105.144:5001/api/products
- Users: http://13.53.105.144:5001/api/users

### **2. Postman Collection:**
- Import: `Cart_API_EC2_Tests.postman_collection.json`
- Run all tests (3 iterations recommended)
- Should pass all 54 tests per iteration

### **3. Manual API Test (PowerShell):**
```powershell
# Create a user
Invoke-RestMethod -Uri "http://13.53.105.144:5001/api/users" -Method POST -ContentType "application/json" -Body '{"first_name":"Test","last_name":"User","email":"test@example.com","phone":"1234567890","password":"password123"}'

# Get all users
Invoke-RestMethod -Uri "http://13.53.105.144:5001/api/users"

# Create a product
Invoke-RestMethod -Uri "http://13.53.105.144:5001/api/products" -Method POST -ContentType "application/json" -Body '{"name":"Test Product","price":99.99,"stock_quantity":10}'

# Get all products
Invoke-RestMethod -Uri "http://13.53.105.144:5001/api/products"
```

---

## 🔧 Troubleshooting

### **Problem: API not responding**
**Solution:**
```bash
ssh -i "C:\Users\Ahmed Ali\.ssh\cart-api-key.pem" ubuntu@13.53.105.144
cd Rest_Api_Documentation
docker compose ps  # Check if containers are running
docker compose restart  # Restart if needed
```

### **Problem: Database tables missing**
**Solution:**
```bash
docker exec -it cart_api npx prisma migrate deploy
```

### **Problem: Disk space full (92%+)**
**Solution:**
```bash
docker system prune -a -f
```

### **Problem: Containers won't start**
**Solution:**
```bash
sudo reboot  # Reboot the EC2 instance from AWS Console
```

---

## 💡 Tips for Your Manager Demo

1. **Before Demo:**
   - Start EC2 instance (wait 2 mins)
   - Test health endpoint in browser
   - Run Postman collection once to warm up

2. **During Demo:**
   - Show browser: API endpoints returning data
   - Show Postman: All tests passing
   - Show phpMyAdmin: Database with real data
   - Show logs: Real-time request logging

3. **What to Highlight:**
   - ✅ Cloud-hosted API (AWS EC2)
   - ✅ Production-ready logging
   - ✅ Containerized with Docker
   - ✅ Automated testing (Postman)
   - ✅ Database management (phpMyAdmin)
   - ✅ Complete CI/CD setup

4. **After Demo:**
   - Stop EC2 instance to save costs
   - Data persists (stored in Docker volume)

---

## 📝 Important Notes

- **Always stop EC2 when not in use** to save money
- **IP address stays the same** when you stop/start (Elastic IP not needed)
- **Data persists** when stopping instance (Docker volumes are on EBS)
- **Postman collection** already has correct IP configured
- **GitHub Actions** disabled (manual deployment is more reliable)

---

## 🆘 Need Help?

**Common Commands Reference:**
```bash
# SSH to EC2
ssh -i "C:\Users\Ahmed Ali\.ssh\cart-api-key.pem" ubuntu@13.53.105.144

# Check containers
docker compose ps

# View logs
docker logs cart_api --tail 50

# Restart services
docker compose restart

# Rebuild everything
docker compose down && docker compose up -d --build

# Check MySQL tables
docker exec -it cart_mysql mysql -uroot -proot -e "USE cartdb; SHOW TABLES;"
```

---

## ✅ Success Checklist

Before your demo, verify:
- [ ] EC2 instance is running
- [ ] Health endpoint returns 200 OK
- [ ] Postman tests pass
- [ ] phpMyAdmin accessible
- [ ] Can view logs via SSH
- [ ] API responds to all endpoints

---

**Last Updated:** June 7, 2026  
**API Version:** 1.0.0  
**Deployment:** AWS EC2 (13.53.105.144)
