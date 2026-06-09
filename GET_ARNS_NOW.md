# 🚀 GET ARNS NOW - Quick Command

## Run This ONE Command via SSH

SSH to Blue EC2 and run this single command:

```bash
ssh -i "C:\Users\Ahmed Ali\.ssh\cart-api-key.pem" ubuntu@16.171.170.97
```

Then copy and paste this entire command block:

```bash
echo "=========================================="
echo "TARGET GROUP ARNS FOR GITHUB SECRETS"
echo "=========================================="
echo ""
echo "BLUE_TARGET_GROUP_ARN:"
aws elbv2 describe-target-groups --names "cart-api-blue-tg" --query "TargetGroups[0].TargetGroupArn" --output text
echo ""
echo "GREEN_TARGET_GROUP_ARN:"
aws elbv2 describe-target-groups --names "cart-api-green-tg" --query "TargetGroups[0].TargetGroupArn" --output text
echo ""
echo "=========================================="
echo "CURRENT ACTIVE (from ALB):"
aws elbv2 describe-listeners --listener-arns "arn:aws:elasticloadbalancing:eu-north-1:511417194775:listener/app/cart-api-alb/0d0b1fdbbe30b002/f1524f0e2604d0d8" --query "Listeners[0].DefaultActions[0].TargetGroupArn" --output text
echo "=========================================="
echo ""
echo "COPY THE ARNS ABOVE AND UPDATE THESE SECRETS:"
echo "https://github.com/ahmedaliawan09/Rest_Api_Documentation/settings/secrets/actions"
```

## What You'll See

Output will look like this:

```
==========================================
TARGET GROUP ARNS FOR GITHUB SECRETS
==========================================

BLUE_TARGET_GROUP_ARN:
arn:aws:elasticloadbalancing:eu-north-1:511417194775:targetgroup/cart-api-blue-tg/1234567890abcdef

GREEN_TARGET_GROUP_ARN:
arn:aws:elasticloadbalancing:eu-north-1:511417194775:targetgroup/cart-api-green-tg/abcdef1234567890

==========================================
CURRENT ACTIVE (from ALB):
arn:aws:elasticloadbalancing:eu-north-1:511417194775:targetgroup/cart-api-blue-tg/1234567890abcdef
==========================================

COPY THE ARNS ABOVE AND UPDATE THESE SECRETS:
https://github.com/ahmedaliawan09/Rest_Api_Documentation/settings/secrets/actions
```

## Update GitHub Secrets

1. **Copy the Blue ARN** (the one after "BLUE_TARGET_GROUP_ARN:")

2. **Go to GitHub Secrets:** https://github.com/ahmedaliawan09/Rest_Api_Documentation/settings/secrets/actions

3. **Click on `BLUE_TARGET_GROUP_ARN`** → Click "Update" → Paste the Blue ARN → Click "Update secret"

4. **Copy the Green ARN** (the one after "GREEN_TARGET_GROUP_ARN:")

5. **Click on `GREEN_TARGET_GROUP_ARN`** → Click "Update" → Paste the Green ARN → Click "Update secret"

## Verify the Fix

Make a small change and push:

```bash
# Add a comment to any file
echo "// Testing blue-green fix" >> backend/server.js

# Commit and push
git add .
git commit -m "test: verify blue-green switching after fixing secrets"
git push origin main
```

Watch the deployment logs at: https://github.com/ahmedaliawan09/Rest_Api_Documentation/actions

Look for:
- If Blue is currently active: Should say "🔵 Blue is currently ACTIVE, 🟢 Green is INACTIVE - will deploy here"
- After deployment: Check AWS Console → ALB should now point to Green ✅

## Second Test

Push again - this time it should switch back to Blue!

---

## 🎯 You're Done!

After this fix:
- ✅ Blue-green switching will work perfectly
- ✅ Each deployment alternates between Blue and Green
- ✅ Zero-downtime deployment works as designed
- ✅ Ready for your demo! 🎉
