# Use existing default VPC
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_subnet" "default" {
  for_each = toset(data.aws_subnets.default.ids)
  id       = each.value
}

# Security Group for ALB (import existing)
resource "aws_security_group" "alb" {
  name        = "cart-api-alb-sg"
  description = "Security group for Cart API Application Load Balancer"
  vpc_id      = data.aws_vpc.default.id

  tags = {
    Name = "cart-api-alb-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Security Group for EC2 instances (import existing launch-wizard-1)
resource "aws_security_group" "ec2" {
  name        = "launch-wizard-1"
  description = "launch-wizard-1 created 2026-06-06T22:05:07.978Z"
  vpc_id      = data.aws_vpc.default.id

  tags = {
    Name = "launch-wizard-1"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Security Group for Green EC2 instance (import existing launch-wizard-2)
resource "aws_security_group" "ec2_green" {
  name        = "launch-wizard-2"
  description = "launch-wizard-2 created 2026-06-08T20:09:55.461Z"  # Match exact description
  vpc_id      = data.aws_vpc.default.id

  tags = {
    Name = "launch-wizard-2"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Security Group for RDS (using default VPC security group)
resource "aws_security_group" "rds" {
  name        = "default"
  description = "default VPC security group"
  vpc_id      = data.aws_vpc.default.id

  tags = {
    Name = "default"
  }

  lifecycle {
    create_before_destroy = true
  }
}
