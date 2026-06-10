# Application Load Balancer (import existing)
resource "aws_lb" "main" {
  name               = "cart-api-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.default.ids

  enable_deletion_protection       = false
  enable_http2                     = true
  enable_cross_zone_load_balancing = true

  tags = {
    Name = "cart-api-alb"
  }
}

# Blue Target Group (import existing)
resource "aws_lb_target_group" "blue" {
  name        = "cart-api-blue-tg"
  port        = 5001
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2  # Match existing
    timeout             = 5
    interval            = 30
    path                = "/health"
    protocol            = "HTTP"
    matcher             = "200"
  }

  deregistration_delay = 300  # Match existing

  tags = {
    Name        = "cart-api-blue-tg"
    Environment = "blue"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Green Target Group (import existing)
resource "aws_lb_target_group" "green" {
  name        = "cart-api-green-tg"
  port        = 5001
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2  # Match existing
    timeout             = 5
    interval            = 30
    path                = "/health"
    protocol            = "HTTP"
    matcher             = "200"
  }

  deregistration_delay = 300  # Match existing

  tags = {
    Name        = "cart-api-green-tg"
    Environment = "green"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ALB Listener (Port 80)
# Note: GitHub Actions manages blue-green switching dynamically
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.blue.arn
  }

  tags = {
    Name = "${var.project_name}-http-listener"
  }

  # Ignore target group changes - managed by CI/CD
  lifecycle {
    ignore_changes = [
      default_action[0].target_group_arn
    ]
  }
}
