# Blue-Green Deployment Infrastructure - Task 7
# Creates two ASGs and two target groups for zero-downtime deployments

provider "aws" {
  region = "us-east-1"
}

# ================== BLUE ASG ==================

# Launch Template for Blue Environment
resource "aws_launch_template" "blue" {
  name_prefix   = "blue-web-lt-"
  image_id      = var.packer_ami_id
  instance_type = var.instance_type
  key_name      = var.key_name

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [var.web_security_group_id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y nginx curl
              mkdir -p /var/www/html
              echo "<h1>EduConnect - BLUE Environment</h1>" > /var/www/html/index.html
              systemctl restart nginx
              EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "blue-asg-instance"
      Environment = "blue"
    }
  }
}

# Auto Scaling Group for Blue
resource "aws_autoscaling_group" "blue" {
  name                = "blue-web-asg"
  vpc_zone_identifier = var.public_subnet_ids
  min_size            = 1
  max_size            = 3
  desired_capacity    = 1
  launch_template {
    id      = aws_launch_template.blue.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "blue-asg-web"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = "blue"
    propagate_at_launch = true
  }
}

# ================== GREEN ASG ==================

# Launch Template for Green Environment
resource "aws_launch_template" "green" {
  name_prefix   = "green-web-lt-"
  image_id      = var.packer_ami_id
  instance_type = var.instance_type
  key_name      = var.key_name

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [var.web_security_group_id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y nginx curl
              mkdir -p /var/www/html
              echo "<h1>EduConnect - GREEN Environment</h1>" > /var/www/html/index.html
              systemctl restart nginx
              EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "green-asg-instance"
      Environment = "green"
    }
  }
}

# Auto Scaling Group for Green
resource "aws_autoscaling_group" "green" {
  name                = "green-web-asg"
  vpc_zone_identifier = var.public_subnet_ids
  min_size            = 1
  max_size            = 3
  desired_capacity    = 1
  launch_template {
    id      = aws_launch_template.green.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "green-asg-web"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = "green"
    propagate_at_launch = true
  }
}

# ================== TARGET GROUPS ==================

# Target Group for Blue
resource "aws_lb_target_group" "blue" {
  name     = "blue-web-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }
}

# Target Group for Green
resource "aws_lb_target_group" "green" {
  name     = "green-web-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }
}

# ================== ALB LISTENER RULES ==================

# Main listener rule (for production traffic)
resource "aws_lb_listener_rule" "blue_green" {
  listener_arn = var.alb_listener_arn
  priority    = 1

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.blue.arn
  }

  condition {
    path_pattern {
      values = ["*"]
    }
  }
}

# Test listener rule (for smoke testing on port 8080)
resource "aws_lb_listener_rule" "test" {
  listener_arn = var.alb_test_listener_arn
  priority    = 1

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.green.arn
  }

  condition {
    path_pattern {
      values = ["*"]
    }
  }
}

# ================== ASG ATTACHMENTS ==================

resource "aws_autoscaling_attachment" "blue_asg_attachment" {
  autoscaling_group_name = aws_autoscaling_group.blue.id
  lb_target_group_arn    = aws_lb_target_group.blue.arn
}

resource "aws_autoscaling_attachment" "green_asg_attachment" {
  autoscaling_group_name = aws_autoscaling_group.green.id
  lb_target_group_arn    = aws_lb_target_group.green.arn
}

# ================== OUTPUTS ==================

output "blue_asg_name" {
  description = "Name of the Blue ASG"
  value       = aws_autoscaling_group.blue.name
}

output "green_asg_name" {
  description = "Name of the Green ASG"
  value       = aws_autoscaling_group.green.name
}

output "blue_target_group_arn" {
  description = "ARN of the Blue target group"
  value       = aws_lb_target_group.blue.arn
}

output "green_target_group_arn" {
  description = "ARN of the Green target group"
  value       = aws_lb_target_group.green.arn
}

output "blue_launch_template_id" {
  description = "ID of the Blue launch template"
  value       = aws_launch_template.blue.id
}

output "green_launch_template_id" {
  description = "ID of the Green launch template"
  value       = aws_launch_template.green.id
}