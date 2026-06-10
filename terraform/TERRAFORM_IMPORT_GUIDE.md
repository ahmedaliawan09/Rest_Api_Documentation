# Terraform Import Guide - Cart API Infrastructure

This document outlines the complete process of importing existing AWS infrastructure into Terraform management.

## 📋 Current Infrastructure (To Import)

```
Blue EC2 Instance: i-056ef043bc4f1cfb6 (cart-api-server, 16.171.170.97, eu-north-1b)
Green EC2 Instance: i-09d2d9b64decd9cda (cart_api_green, 16.16.199.217, eu-north-1c)
RDS Database: cart-api-db (MySQL 8.0, db.t4g.micro)
Application Load Balancer: arn:aws:elasticloadbalancing:eu-north-1:511417194775:loadbalancer/app/cart-api-alb/0d0b1fdbbe30b002
Blue Target Group: arn:aws:elasticloadbalancing:eu-north-1:511417194775:targetgroup/cart-api-blue-tg/f1d0235da94e75ee
Green Target Group: arn:aws:elasticloadbalancing:eu-north-1:511417194775:targetgroup/cart-api-green-tg/1427b55a8b716fea
IAM Role: EC2-CloudWatch-Role
```

## 🎯 Import Strategy

**Why Import?**
- Avoid recreating existing infrastructure
- Preserve 1 million database records
- Zero downtime migration
- Maintain current production setup

**Approach:**
1. Import resources into Terraform state (local backend first)
2. Verify with `terraform plan` (should show no changes)
3. Migrate to S3 backend for team collaboration
4. Document everything for CTO presentation

---

## 📝 Step-by-Step Import Process

### Step 1: Import Blue EC2 Instance

```bash
terraform import aws_instance.blue i-056ef043bc4f1cfb6
```

**Expected Output:**
```
aws_instance.blue: Importing from ID "i-056ef043bc4f1cfb6"...
aws_instance.blue: Import prepared!
  Prepared aws_instance for import
aws_instance.blue: Refreshing state... [id=i-056ef043bc4f1cfb6]

Import successful!
```

### Step 2: Import Green EC2 Instance

```bash
terraform import aws_instance.green i-09d2d9b64decd9cda
```

### Step 3: Import RDS Database

```bash
terraform import aws_db_instance.main cart-api-db
```

**Note:** RDS import preserves all data - 1 million records are safe!

### Step 4: Import Application Load Balancer

```bash
terraform import aws_lb.main arn:aws:elasticloadbalancing:eu-north-1:511417194775:loadbalancer/app/cart-api-alb/0d0b1fdbbe30b002
```

### Step 5: Import Blue Target Group

```bash
terraform import aws_lb_target_group.blue arn:aws:elasticloadbalancing:eu-north-1:511417194775:targetgroup/cart-api-blue-tg/f1d0235da94e75ee
```

### Step 6: Import Green Target Group

```bash
terraform import aws_lb_target_group.green arn:aws:elasticloadbalancing:eu-north-1:511417194775:targetgroup/cart-api-green-tg/1427b55a8b716fea
```

### Step 7: Import Target Group Attachments

```bash
# Blue attachment
terraform import aws_lb_target_group_attachment.blue cart-api-blue-tg-20231201120000000000000001

# Green attachment  
terraform import aws_lb_target_group_attachment.green cart-api-green-tg-20231201120000000000000002
```

**Note:** Target group attachment IDs are auto-generated. May need to check actual IDs.

### Step 8: Import Security Groups

```bash
# Get security group IDs from AWS Console (EC2 → Security Groups)
terraform import aws_security_group.alb sg-xxxxx
terraform import aws_security_group.ec2 sg-xxxxx
terraform import aws_security_group.rds sg-xxxxx
```

### Step 9: Import IAM Role and Instance Profile

```bash
terraform import aws_iam_role.ec2 EC2-CloudWatch-Role
terraform import aws_iam_instance_profile.ec2 EC2-CloudWatch-Role
```

---

## ✅ Verification Steps

After each import, run:

```bash
terraform state list
```

This shows all imported resources.

### Final Verification:

```bash
terraform plan
```

**Expected Output:**
```
No changes. Your infrastructure matches the configuration.
```

If it shows changes, the Terraform configuration needs adjustment to match actual AWS resources.

---

## 🔄 Migrate to S3 Backend (Professional Setup)

Once local import is complete and verified, migrate to S3 backend:

### Step 1: Create S3 Bucket for State

```bash
# Will be done via AWS Console or AWS CLI
Bucket name: cart-api-terraform-state
Region: eu-north-1
Versioning: Enabled
Encryption: AES-256
```

### Step 2: Create DynamoDB Table for State Locking

```bash
Table name: cart-api-terraform-locks
Partition key: LockID (String)
Billing mode: Pay per request
```

### Step 3: Uncomment S3 Backend in main.tf

```hcl
backend "s3" {
  bucket         = "cart-api-terraform-state"
  key            = "infrastructure/terraform.tfstate"
  region         = "eu-north-1"
  encrypt        = true
  dynamodb_table = "cart-api-terraform-locks"
}
```

### Step 4: Migrate State to S3

```bash
terraform init -migrate-state
```

Terraform will ask: **"Do you want to copy existing state to the new backend?"**

Answer: **yes**

---

## 🎓 Key Terraform Commands Reference

```bash
# Initialize Terraform
terraform init

# Import a resource
terraform import <resource_type>.<resource_name> <resource_id>

# List all resources in state
terraform state list

# Show details of a resource
terraform state show <resource_address>

# Plan changes (should show "No changes" after import)
terraform plan

# Apply changes
terraform apply

# View outputs
terraform output

# Migrate backend
terraform init -migrate-state
```

---

## 📊 Import Progress Tracker

- [ ] Blue EC2 Instance
- [ ] Green EC2 Instance
- [ ] RDS Database
- [ ] Application Load Balancer
- [ ] Blue Target Group
- [ ] Green Target Group
- [ ] Target Group Attachments
- [ ] Security Groups (ALB, EC2, RDS)
- [ ] IAM Role
- [ ] IAM Instance Profile
- [ ] Verification (`terraform plan` shows no changes)
- [ ] S3 Backend Setup
- [ ] State Migration to S3

---

## 🚨 Common Issues and Solutions

### Issue 1: Import fails with "Resource not found"
**Solution:** Verify resource ID is correct in AWS Console

### Issue 2: `terraform plan` shows changes after import
**Solution:** Adjust Terraform configuration to match actual AWS resource settings

### Issue 3: S3 backend credentials error
**Solution:** Ensure AWS credentials are properly configured with S3 access

### Issue 4: State locking error
**Solution:** Check DynamoDB table exists and has correct partition key

---

## 💡 CTO Presentation Points

1. **Zero Downtime:** Import process doesn't touch running infrastructure
2. **Data Safety:** RDS import is metadata only - 1M records untouched
3. **Professional Approach:** Using industry-standard Terraform import workflow
4. **Team Collaboration:** S3 backend enables multiple developers
5. **Version Control:** Infrastructure changes tracked via Git
6. **Reproducibility:** Can replicate entire infrastructure with `terraform apply`
7. **Cost Tracking:** Terraform shows what resources cost
8. **Compliance:** Infrastructure as Code meets audit requirements

---

## 📈 Post-Import Benefits

✅ **Infrastructure as Code** - All resources defined in version-controlled files  
✅ **Change Management** - Every infrastructure change goes through code review  
✅ **Disaster Recovery** - Recreate entire infrastructure from code  
✅ **Environment Parity** - Easily create staging/dev environments  
✅ **Documentation** - Code IS the documentation  
✅ **Cost Optimization** - See all resources and their configurations  
✅ **Team Collaboration** - Multiple engineers can work safely  
✅ **Audit Trail** - Git history shows who changed what and when  

---

**Document Created:** June 10, 2026  
**Last Updated:** June 10, 2026  
**Author:** DevOps Team  
**Status:** In Progress
