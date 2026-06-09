# Postman ALB Test Collection - Quick Guide

## ✅ FIXED - Ready to Use!

The `Cart_API_ALB_Production_Tests.postman_collection.json` file has been fixed and is ready to use.

## What Was Fixed

**Problem:** URLs had double `http://` protocol:
- ❌ Before: `http://http://cart-api-alb-810038360.eu-north-1.elb.amazonaws.com`
- ✅ After: `http://cart-api-alb-810038360.eu-north-1.elb.amazonaws.com`

## Collection Details

- **Total Tests:** 54 test requests
- **Endpoint:** `http://cart-api-alb-810038360.eu-north-1.elb.amazonaws.com`
- **Coverage:** All tests from the original complete suite
- **Compatibility:** Works with Blue-Green deployment (tests always hit active environment)

## How to Use in Postman

### Step 1: Import Collection
1. Open Postman
2. Click "Import" button
3. Select `Cart_API_ALB_Production_Tests.postman_collection.json`
4. Click "Import"

### Step 2: Run Tests
You can run tests in two ways:

#### Option A: Run Entire Collection
1. Click on the collection name
2. Click "Run" button (Runner icon)
3. Select all tests or specific folders
4. Click "Run Cart API - ALB Production Tests"

#### Option B: Run Individual Tests
1. Navigate to any test in the collection
2. Click "Send" to run that specific test
3. View results in the "Test Results" tab

## Test Organization

The collection is organized into folders:

1. **User APIs (12 tests)** - User creation, validation, retrieval
2. **Product APIs (14 tests)** - Product CRUD operations
3. **Cart APIs (28 tests)** - Cart management, checkout, edge cases

## Why This Collection?

### Works with Blue-Green Deployment
- All requests target the ALB endpoint
- ALB automatically routes to the **active** environment (Blue or Green)
- No need to update URLs when environments switch
- Tests always run against production traffic

### Logs in CloudWatch
When you run tests, logs appear in CloudWatch for whichever environment is currently active:
- If Blue is active (80% traffic) → Logs in Blue EC2 CloudWatch
- If Green is active (80% traffic) → Logs in Green EC2 CloudWatch

You can check active environment:
```powershell
# List target groups and their targets
aws elbv2 describe-target-health --region eu-north-1 --target-group-arn <target-group-arn>
```

## Verification

Test that the ALB is responding:
```powershell
curl http://cart-api-alb-810038360.eu-north-1.elb.amazonaws.com/api/users
```

Expected response:
```json
{
  "success": true,
  "data": [...]
}
```

## Tips for Your Demo

1. **Before Demo:** Import the collection in Postman
2. **During Demo:** 
   - Show the collection structure (54 tests)
   - Run a few individual tests to show they work
   - Optionally run the full suite using Collection Runner
   - Show CloudWatch logs while tests are running
3. **Highlight:** All tests hit the ALB, demonstrating your blue-green setup works

## Troubleshooting

### If a test fails:
1. Check if ALB is healthy: `curl http://cart-api-alb-810038360.eu-north-1.elb.amazonaws.com/api/users`
2. Verify active environment has healthy targets in AWS Console
3. Check CloudWatch logs for errors on active EC2 instance

### If ALB is unreachable:
1. Check Security Group allows HTTP traffic (port 80)
2. Verify at least one target (Blue or Green) is healthy
3. Check target group health in AWS Console

## Files

- ✅ **Cart_API_ALB_Production_Tests.postman_collection.json** - Use this for production testing
- 📝 **Cart_API_Complete_50_Tests.postman_collection.json** - Original (localhost)
- 🛠️ **fix-alb-urls.js** - Script used to fix the URLs (for reference)

---

**Status:** Ready for demo! 🎉
