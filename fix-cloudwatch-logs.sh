#!/bin/bash

# Quick Fix: Enable CloudWatch Logs for Docker Containers
# Run this on BOTH Blue and Green EC2 instances

echo "=========================================="
echo "🔧 Fixing CloudWatch Logs for Cart API"
echo "=========================================="

# Get instance ID
INSTANCE_ID=$(ec2-metadata --instance-id | cut -d " " -f 2)
echo "Instance ID: $INSTANCE_ID"

# Stop containers
echo "Step 1: Stopping containers..."
cd ~/Rest_Api_Documentation
docker compose down
echo "✅ Containers stopped"

# Pull latest code (with CloudWatch logging configured)
echo "Step 2: Pulling latest code..."
git pull origin main
echo "✅ Code updated"

# Restart containers with CloudWatch logging
echo "Step 3: Starting containers with CloudWatch logging..."
docker compose up -d --build
echo "✅ Containers started"

# Wait for service to be ready
echo "Step 4: Waiting for API to be healthy..."
sleep 20

for i in {1..30}; do
  if curl -f http://localhost:5001/health > /dev/null 2>&1; then
    echo "✅ API is healthy!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ API failed to become healthy"
    docker compose logs --tail 50
    exit 1
  fi
  echo "Waiting... ($i/30)"
  sleep 3
done

echo ""
echo "=========================================="
echo "✅ CloudWatch Logs Fix Complete!"
echo "=========================================="
echo ""
echo "Logs will now appear in CloudWatch at:"
echo "  📊 Log Group: /aws/ec2/cart-api"
echo "  📝 Log Stream: Container ID"
echo ""
echo "View logs in AWS Console:"
echo "  https://console.aws.amazon.com/cloudwatch/home?region=eu-north-1#logsV2:log-groups/log-group//aws/ec2/cart-api"
echo ""
echo "Or check locally:"
echo "  docker compose logs -f"
echo ""
echo "=========================================="
