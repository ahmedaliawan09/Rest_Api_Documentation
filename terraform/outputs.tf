output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = aws_lb.main.zone_id
}

output "blue_instance_id" {
  description = "ID of the Blue EC2 instance"
  value       = aws_instance.blue.id
}

output "blue_instance_public_ip" {
  description = "Public IP of the Blue EC2 instance"
  value       = aws_instance.blue.public_ip
}

output "green_instance_id" {
  description = "ID of the Green EC2 instance"
  value       = aws_instance.green.id
}

output "green_instance_public_ip" {
  description = "Public IP of the Green EC2 instance"
  value       = aws_instance.green.public_ip
}

output "rds_endpoint" {
  description = "RDS database endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}

output "blue_target_group_arn" {
  description = "ARN of Blue target group"
  value       = aws_lb_target_group.blue.arn
}

output "green_target_group_arn" {
  description = "ARN of Green target group"
  value       = aws_lb_target_group.green.arn
}

output "alb_listener_arn" {
  description = "ARN of ALB HTTP listener"
  value       = aws_lb_listener.http.arn
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = "/aws/ec2/${var.project_name}"
}
