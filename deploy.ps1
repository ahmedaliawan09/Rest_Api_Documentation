# Simple Deployment Script for EC2
# Run this script whenever you want to deploy changes to EC2

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Deployment to EC2..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# EC2 Details
$EC2_IP = "16.171.170.97"
$SSH_KEY = "C:\Users\Ahmed Ali\.ssh\cart-api-key.pem"

Write-Host "Connecting to EC2: $EC2_IP" -ForegroundColor Yellow

# SSH and deploy
ssh -i $SSH_KEY ubuntu@$EC2_IP @"
cd Rest_Api_Documentation
echo 'Pulling latest code...'
git pull origin main
echo 'Stopping containers...'
docker compose down
echo 'Rebuilding and starting...'
docker compose up -d --build
echo 'Waiting for services...'
sleep 10
echo 'Deployment complete!'
docker compose ps
"@

Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Completed!" -ForegroundColor Green
Write-Host "API: http://$EC2_IP:5001" -ForegroundColor Green
Write-Host "Health: http://$EC2_IP:5001/health" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
