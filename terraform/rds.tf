# Reference existing default DB Subnet Group
data "aws_db_subnet_group" "main" {
  name = "default"
}

# RDS MySQL Instance (import existing)
resource "aws_db_instance" "main" {
  identifier     = "cart-api-db"
  engine         = "mysql"
  engine_version = "8.4.8"  # Match existing version
  instance_class = "db.t4g.micro"  # Match existing instance class

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"  # Match existing
  storage_encrypted     = true

  # DO NOT set db_name - database already exists
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = data.aws_db_subnet_group.main.name

  multi_az               = false
  publicly_accessible    = true  # Match existing
  skip_final_snapshot    = true
  backup_retention_period = 1  # Match existing
  backup_window          = "01:30-02:00"  # Match existing
  maintenance_window     = "wed:03:38-wed:04:08"  # Match existing

  enabled_cloudwatch_logs_exports = []  # Match existing (empty)
  
  copy_tags_to_snapshot = true  # Match existing

  tags = {
    Name = "cart-api-db"
  }
  
  lifecycle {
    ignore_changes = [
      password,  # Don't force password change
      snapshot_identifier,
      final_snapshot_identifier
    ]
  }
}
