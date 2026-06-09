# Quick Diagnostic Script for Blue-Green Deployment Issue

Write-Host "=========================================="
Write-Host "BLUE-GREEN DEPLOYMENT DIAGNOSTICS"
Write-Host "=========================================="

Write-Host "`nChecking AWS Configuration..."

# Check if AWS CLI is available
try {
    $awsVersion = aws --version 2>&1
    Write-Host "AWS CLI found: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "AWS CLI not found or not configured" -ForegroundColor Red
    Write-Host "Please install AWS CLI and configure credentials first"
    exit 1
}

Write-Host "`n=========================================="
Write-Host "STEP 1: Get Target Group ARNs from AWS"
Write-Host "=========================================="

Write-Host "`nFetching BLUE Target Group ARN..."
$blueTgArn = aws elbv2 describe-target-groups --names "cart-api-blue-tg" --query "TargetGroups[0].TargetGroupArn" --output text 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Blue TG ARN: $blueTgArn" -ForegroundColor Cyan
} else {
    Write-Host "Could not fetch Blue TG ARN" -ForegroundColor Red
}

Write-Host "`nFetching GREEN Target Group ARN..."
$greenTgArn = aws elbv2 describe-target-groups --names "cart-api-green-tg" --query "TargetGroups[0].TargetGroupArn" --output text 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Green TG ARN: $greenTgArn" -ForegroundColor Cyan
} else {
    Write-Host "Could not fetch Green TG ARN" -ForegroundColor Red
}

Write-Host "`n=========================================="
Write-Host "STEP 2: Get Current Active Target Group"
Write-Host "=========================================="

$listenerArn = "arn:aws:elasticloadbalancing:eu-north-1:511417194775:listener/app/cart-api-alb/0d0b1fdbbe30b002/f1524f0e2604d0d8"

Write-Host "`nFetching current ALB listener configuration..."
$currentTgArn = aws elbv2 describe-listeners --listener-arns $listenerArn --query "Listeners[0].DefaultActions[0].TargetGroupArn" --output text 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Current TG ARN: $currentTgArn" -ForegroundColor Cyan
} else {
    Write-Host "Could not fetch current TG ARN" -ForegroundColor Red
}

Write-Host "`n=========================================="
Write-Host "STEP 3: Analysis"
Write-Host "=========================================="

# Determine which is currently active
if ($currentTgArn -eq $blueTgArn) {
    Write-Host "`nCURRENT ACTIVE: BLUE" -ForegroundColor Green
    Write-Host "The ALB is currently routing traffic to Blue target group"
    $activeEnv = "BLUE"
    $inactiveEnv = "GREEN"
    $inactiveTgArn = $greenTgArn
} elseif ($currentTgArn -eq $greenTgArn) {
    Write-Host "`nCURRENT ACTIVE: GREEN" -ForegroundColor Green
    Write-Host "The ALB is currently routing traffic to Green target group"
    $activeEnv = "GREEN"
    $inactiveEnv = "BLUE"
    $inactiveTgArn = $blueTgArn
} else {
    Write-Host "`nUNKNOWN: Current TG does not match Blue or Green" -ForegroundColor Yellow
    $activeEnv = "UNKNOWN"
}

Write-Host "`n=========================================="
Write-Host "STEP 4: What Should Happen Next"
Write-Host "=========================================="

if ($activeEnv -ne "UNKNOWN") {
    Write-Host "`nOn the NEXT deployment:" -ForegroundColor Yellow
    Write-Host "  1. Workflow should detect: $activeEnv is ACTIVE" -ForegroundColor Cyan
    Write-Host "  2. Should deploy to: $inactiveEnv (INACTIVE)" -ForegroundColor Cyan
    Write-Host "  3. Should switch traffic to: $inactiveEnv" -ForegroundColor Cyan
    Write-Host "  4. After deployment: $inactiveEnv should become ACTIVE" -ForegroundColor Cyan
}

Write-Host "`n=========================================="
Write-Host "STEP 5: Fix Your GitHub Secrets"
Write-Host "=========================================="

Write-Host "`nGo to: https://github.com/ahmedaliawan09/Rest_Api_Documentation/settings/secrets/actions"
Write-Host "`nSet these values EXACTLY:"
Write-Host "`n  BLUE_TARGET_GROUP_ARN:" -ForegroundColor Cyan
Write-Host "  $blueTgArn" -ForegroundColor White
Write-Host "`n  GREEN_TARGET_GROUP_ARN:" -ForegroundColor Cyan
Write-Host "  $greenTgArn" -ForegroundColor White

Write-Host "`n=========================================="
Write-Host "DIAGNOSTIC COMPLETE"
Write-Host "=========================================="
Write-Host "`nNext steps:"
Write-Host "1. Copy the ARN values from Step 5 above"
Write-Host "2. Update your GitHub Secrets"
Write-Host "3. Make a small change and push to main"
Write-Host "4. Watch the deployment logs to confirm detection is correct"
Write-Host "=========================================="
