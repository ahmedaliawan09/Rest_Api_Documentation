# Cart API - Infrastructure as Code (Terraform)

Complete Terraform configuration for deploying the Cart API with Blue-Green deployment architecture on AWS.

## 📋 Architecture Overview

This Terraform configuration creates:
- **VPC & Networking**: Uses default VPC with security groups
- **Application Load Balancer (ALB)**: With Blue/Green target groups
- **EC2 Instances**: 2 instances (Blue in eu-north-1b, Green in eu-north-1c)
- **RDS MySQL**: Managed database with backups and encryption
- **IAM Roles**: For EC2 CloudWatch logging and SSM access
- **Security Groups**: Proper isolation between ALB, EC2, and RDS
- **CloudWatch Logs**: Centralized logging for all instances

## 🚀 Prerequisites

### 1. Install Terraform

**Windows (using Chocolatey):**
```powershell
choco install terraform
```

**Or download from:** https://www.terraform.io/downloads

Verify installation:
```bash
terraform version
```

### 2. Install AWS CLI

Already installed in your environment.

### 3. Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: eu-north-1
# Default output format: json
```

### 4. Create S3 Backend (First Time Only)

```bash
# Create S3 bucket for Terraform state
aws s3api create-bucket \
  --bucket cart-api-terraform-state \
  --region eu-north-1 \
  --create-bucket-configuration LocationConstraint=eu-north-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket cart-api-terraform-state \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket cart-api-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name cart-api-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-north-1
```

## 📝 Step-by-Step Deployment

### Step 1: Prepare Configuration

```bash
cd terraform

# Copy example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
notepad terraform.tfvars
```

**Important:** Update these values in `terraform.tfvars`:
- `db_password`: Use a strong, unique password
- `ssh_key_name`: Your SSH key pair name (cart-api-key)
- `allowed_ssh_cidr`: Your IP address for SSH access

### Step 2: Initialize Terraform

```bash
terraform init
```

This will:
- Download required providers (AWS)
- Configure S3 backend for state storage
- Set up DynamoDB for state locking

### Step 3: Plan Infrastructure

```bash
terraform plan -out=tfplan
```

Review the plan carefully. It will show:
- Resources to be created
- Estimated costs
- Security configurations

### Step 4: Apply Infrastructure

```bash
terraform apply tfplan
```

Type `yes` to confirm.

**Deployment time:** ~10-15 minutes (RDS takes longest)

### Step 5: Get Outputs

```bash
terraform output
```

Save these values:
```bash
terraform output -json > infrastructure-outputs.json
```

## 🔄 Updating Infrastructure

### Modify Configuration

1. Edit `.tf` files as needed
2. Run `terraform plan` to see changes
3. Run `terraform apply` to apply changes

### Example: Change Instance Type

```bash
# Edit variables.tf or terraform.tfvars
instance_type = "t3.small"

# Apply changes
terraform plan
terraform apply
```

## 🎯 Blue-Green Deployment with Terraform

### Switch Traffic from Blue to Green

```bash
terraform apply \
  -var="active_target_group=green"
```

Or update the ALB listener manually in AWS Console (as you're doing now).

## 📊 Managing State

### View Current State

```bash
terraform show
```

### List Resources

```bash
terraform state list
```

### Import Existing Resources (IMPORTANT FOR YOUR CURRENT SETUP!)

Since you already have infrastructure running, you can import it:

```bash
# Import existing VPC
terraform import aws_vpc.main vpc-xxxxx

# Import existing EC2 instances
terraform import aws_instance.blue i-xxxxx
terraform import aws_instance.green i-xxxxx

# Import existing RDS
terraform import aws_db_instance.main cart-api-db

# Import existing ALB
terraform import aws_lb.main arn:aws:elasticloadbalancing:...
```

## 🔒 Security Best Practices

### Secrets Management

**Never commit sensitive values!** Use one of these methods:

**Option 1: Environment Variables**
```bash
export TF_VAR_db_password="YourSecurePassword"
terraform apply
```

**Option 2: AWS Secrets Manager** (recommended for production)
```hcl
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "cart-api/db-password"
}

locals {
  db_password = jsondecode(data.aws_secretsmanager_secret_version.db_password.secret_string)["password"]
}
```

### Restrict SSH Access

Update `terraform.tfvars`:
```hcl
allowed_ssh_cidr = ["YOUR_PUBLIC_IP/32"]
```

## 🧹 Cleanup/Destroy Infrastructure

**⚠️ WARNING: This will destroy ALL resources!**

```bash
terraform destroy
```

Or destroy specific resources:
```bash
terraform destroy -target=aws_instance.green
```

## 📈 Cost Estimation

Estimated monthly cost (eu-north-1):
- 2x t3.micro EC2: ~$12/month
- 1x db.t3.micro RDS: ~$25/month
- ALB: ~$20/month
- Data transfer: ~$5/month
- **Total: ~$62/month**

Use AWS Cost Calculator for detailed estimates.

## 🔍 Troubleshooting

### State Lock Errors

```bash
# Force unlock (use carefully!)
terraform force-unlock LOCK_ID
```

### Provider Errors

```bash
# Re-initialize providers
terraform init -upgrade
```

### State Drift

```bash
# Detect drift between actual and desired state
terraform plan -refresh-only
```

## 📚 Terraform Commands Cheat Sheet

```bash
# Initialize
terraform init

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive

# Plan changes
terraform plan

# Apply changes
terraform apply

# Apply without confirmation
terraform apply -auto-approve

# Destroy infrastructure
terraform destroy

# Show current state
terraform show

# List all resources
terraform state list

# Show specific resource
terraform state show aws_instance.blue

# Refresh state
terraform refresh

# Output values
terraform output

# Graph dependencies
terraform graph | dot -Tsvg > graph.svg
```

## 🔗 Integration with GitHub Actions

Update `.github/workflows/deploy.yml` to use Terraform outputs:

```yaml
- name: Get Infrastructure Info
  run: |
    BLUE_IP=$(terraform output -raw blue_instance_public_ip)
    GREEN_IP=$(terraform output -raw green_instance_public_ip)
    ALB_DNS=$(terraform output -raw alb_dns_name)
    echo "BLUE_IP=$BLUE_IP" >> $GITHUB_ENV
    echo "GREEN_IP=$GREEN_IP" >> $GITHUB_ENV
```

## 🎓 Next Steps

1. **Import existing infrastructure** to Terraform state
2. **Set up Terraform Cloud** for team collaboration
3. **Create modules** for reusable components
4. **Add auto-scaling** for EC2 instances
5. **Implement** multi-region deployment
6. **Add monitoring** with CloudWatch alarms
7. **Set up** automated backups and disaster recovery

## 📖 Additional Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

**Maintained by:** DevOps Team  
**Last Updated:** June 2026  
**Terraform Version:** >= 1.0
