# Script to verify Target Group ARNs
# This will help you fix your GitHub Secrets

Write-Host "=========================================="
Write-Host "VERIFYING TARGET GROUP ARNS"
Write-Host "=========================================="

Write-Host "`nSTEP 1: Get the ACTUAL Target Group ARNs from AWS"
Write-Host "Run these commands to get the correct ARNs:"
Write-Host ""
Write-Host "# Get Blue Target Group ARN:"
Write-Host 'aws elbv2 describe-target-groups --names "cart-api-blue-tg" --query "TargetGroups[0].TargetGroupArn" --output text'
Write-Host ""
Write-Host "# Get Green Target Group ARN:"
Write-Host 'aws elbv2 describe-target-groups --names "cart-api-green-tg" --query "TargetGroups[0].TargetGroupArn" --output text'
Write-Host ""

Write-Host "=========================================="
Write-Host "STEP 2: Get the CURRENT active Target Group"
Write-Host "=========================================="
Write-Host "# Get the current target group the ALB is using:"
Write-Host 'aws elbv2 describe-listeners --listener-arns "YOUR_ALB_LISTENER_ARN" --query "Listeners[0].DefaultActions[0].TargetGroupArn" --output text'
Write-Host ""

Write-Host "=========================================="
Write-Host "STEP 3: Compare and Fix GitHub Secrets"
Write-Host "=========================================="
Write-Host "Go to: https://github.com/ahmedaliawan09/Rest_Api_Documentation/settings/secrets/actions"
Write-Host ""
Write-Host "Verify these secrets match the ACTUAL ARNs from Step 1:"
Write-Host "  • BLUE_TARGET_GROUP_ARN should contain: ...cart-api-blue-tg/..."
Write-Host "  • GREEN_TARGET_GROUP_ARN should contain: ...cart-api-green-tg/..."
Write-Host ""
Write-Host "If they're swapped or wrong, update them!"
Write-Host "=========================================="

Write-Host "`nWould you like me to check for you? (Requires AWS CLI configured)"
$response = Read-Host "Enter 'yes' to run AWS commands now"

if ($response -eq "yes") {
    Write-Host "`nFetching from AWS..."
    
    Write-Host "`n🔵 BLUE Target Group ARN:"
    aws elbv2 describe-target-groups --names "cart-api-blue-tg" --query "TargetGroups[0].TargetGroupArn" --output text
    
    Write-Host "`n🟢 GREEN Target Group ARN:"
    aws elbv2 describe-target-groups --names "cart-api-green-tg" --query "TargetGroups[0].TargetGroupArn" --output text
    
    Write-Host "`n🎯 CURRENT Active Target Group (from ALB):"
    Write-Host "You need to provide your ALB_LISTENER_ARN to check this"
    Write-Host "Run: aws elbv2 describe-listeners --listener-arns YOUR_LISTENER_ARN --query 'Listeners[0].DefaultActions[0].TargetGroupArn' --output text"
}

Write-Host "`n=========================================="
Write-Host "AFTER FIXING SECRETS:"
Write-Host "=========================================="
Write-Host "1. Make a small change to any file (e.g., add a comment)"
Write-Host "2. Commit and push to main"
Write-Host "3. The deployment should now correctly detect and switch environments"
Write-Host "=========================================="
