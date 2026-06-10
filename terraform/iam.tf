# IAM Role for EC2 instances (import existing)
resource "aws_iam_role" "ec2" {
  name        = "EC2-CloudWatch-Role"
  description = "IAM role for EC2 instances to access CloudWatch and SSM"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "EC2-CloudWatch-Role"
  }
}

# Attach CloudWatch Agent Policy
resource "aws_iam_role_policy_attachment" "cloudwatch_agent" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Attach SSM Managed Instance Core (for Systems Manager)
resource "aws_iam_role_policy_attachment" "ssm_managed_instance" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# EC2 Instance Profile (import existing)
resource "aws_iam_instance_profile" "ec2" {
  name = "EC2-CloudWatch-Role"
  role = aws_iam_role.ec2.name

  tags = {
    Name = "EC2-CloudWatch-Role"
  }
}
