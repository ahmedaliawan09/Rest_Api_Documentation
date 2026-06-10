# Terraform Setup Script for Windows
# This script sets up Terraform infrastructure for Cart API

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cart API - Terraform Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Terraform is installed
Write-Host "Checking Terraform installation..." -ForegroundColor Yellow
$terraformInstalled = Get-Command terraform -ErrorAction SilentlyContinue

if (-not $terraformInstalled) {
    Write-Host "❌ Terraform not found!" -ForegroundColor Red
    Write-Host "Please install Terraform from: https://www.terraform.io/downloads" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Terraform is installed: $($terraformInstalled.Version)" -ForegroundColor Green

# Check if AWS CLI is configured
Write-Host "`nChecking AWS CLI configuration..." -ForegroundColor Yellow
try {
    $awsIdentity = aws sts get-caller-identity 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ AWS CLI is configured" -ForegroundColor Green
    } else {
        Write-Host "❌ AWS CLI not configured!" -ForegroundColor Red
        Write-Host "Run: aws configure" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ AWS CLI not found!" -ForegroundColor Red
    exit 1
}

# Create terraform.tfvars if it doesn't exist
Write-Host "`nChecking terraform.tfvars..." -ForegroundColor Yellow
if (-not (Test-Path "terraform.tfvars")) {
    Write-Host "Creating terraform.tfvars from example..." -ForegroundColor Yellow
    Copy-Item "terraform.tfvars.example" "terraform.tfvars"
    Write-Host "⚠️  Please edit terraform.tfvars with your values!" -ForegroundColor Yellow
    Write-Host "   Especially: db_password and ssh_key_name" -ForegroundColor Yellow
    
    $continue = Read-Host "`nHave you edited terraform.tfvars? (yes/no)"
    if ($continue -ne "yes") {
        Write-Host "Please edit terraform.tfvars and run this script again." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "✅ terraform.tfvars exists" -ForegroundColor Green
}

# Initialize Terraform
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Step 1: Initializing Terraform" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
terraform init

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Terraform init failed!" -ForegroundColor Red
    exit 1
}

# Validate configuration
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Step 2: Validating Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
terraform validate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Terraform validation failed!" -ForegroundColor Red
    exit 1
}

# Format code
Write-Host "`nFormatting Terraform code..." -ForegroundColor Yellow
terraform fmt -recursive

# Plan infrastructure
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Step 3: Planning Infrastructure" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
terraform plan -out=tfplan

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Terraform plan failed!" -ForegroundColor Red
    exit 1
}

# Ask for confirmation
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Ready to Apply Infrastructure!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Review the plan above carefully." -ForegroundColor Yellow
Write-Host "This will create real AWS resources and incur costs." -ForegroundColor Yellow
Write-Host ""

$apply = Read-Host "Do you want to apply this infrastructure? (yes/no)"

if ($apply -eq "yes") {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Step 4: Applying Infrastructure" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    terraform apply tfplan
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "✅ Infrastructure Created Successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Outputs:" -ForegroundColor Cyan
        terraform output
        
        Write-Host "`nSaving outputs to infrastructure-outputs.json..." -ForegroundColor Yellow
        terraform output -json > infrastructure-outputs.json
        Write-Host "✅ Outputs saved!" -ForegroundColor Green
    } else {
        Write-Host "❌ Terraform apply failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`nInfrastructure creation cancelled." -ForegroundColor Yellow
    Write-Host "The plan is saved in tfplan file." -ForegroundColor Yellow
    Write-Host "Run 'terraform apply tfplan' when ready." -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
