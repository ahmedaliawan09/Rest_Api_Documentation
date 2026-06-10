# Blue EC2 Instance (import existing - cart-api-server)
resource "aws_instance" "blue" {
  ami                    = "ami-05d62b9bc5a6ca605"  # Existing AMI
  instance_type          = "t3.small"
  key_name               = var.ssh_key_name
  subnet_id              = "subnet-0074e2a7bcdb53915"  # eu-north-1b (existing)
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  root_block_device {
    volume_size           = 20  # Match actual size (can't shrink volumes)
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = false  # Match existing
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "optional"  # Match existing
    http_put_response_hop_limit = 2  # Match existing
  }

  tags = {
    Name        = "cart-api-server"  # Match existing name
    Environment = "blue"
  }

  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

# Green EC2 Instance (import existing - cart_api_green)
resource "aws_instance" "green" {
  ami                    = "ami-05d62b9bc5a6ca605"  # Existing AMI
  instance_type          = "t3.small"
  key_name               = var.ssh_key_name
  subnet_id              = "subnet-09f1e3ee83e00da4b"  # eu-north-1c (existing)
  vpc_security_group_ids = [aws_security_group.ec2_green.id]  # launch-wizard-2
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  root_block_device {
    volume_size           = 20  # Match actual size (can't shrink volumes)
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = false  # Match existing
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "optional"  # Match existing
    http_put_response_hop_limit = 2  # Match existing
  }

  tags = {
    Name        = "cart_api_green"  # Match existing name
    Environment = "green"
  }

  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

# Attach Blue instance to Blue target group
resource "aws_lb_target_group_attachment" "blue" {
  target_group_arn = aws_lb_target_group.blue.arn
  target_id        = aws_instance.blue.id
  port             = 5001
}

# Attach Green instance to Green target group
resource "aws_lb_target_group_attachment" "green" {
  target_group_arn = aws_lb_target_group.green.arn
  target_id        = aws_instance.green.id
  port             = 5001
}
