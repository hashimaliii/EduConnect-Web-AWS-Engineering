# 2. Application Load Balancer
# Deployed across public subnets [cite: 86]
resource "aws_lb" "web_alb" {
  name               = "${var.environment}-web-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [module.security.alb_sg_id]
  subnets            = module.vpc.public_subnet_ids

  tags = {
    Environment = var.environment
  }
}

# 3. Target Group with Health Checks
# Requirements: Port 80, Path /, thresholds 2 healthy / 3 unhealthy [cite: 89]
resource "aws_lb_target_group" "web_tg" {
  name     = "${var.environment}-web-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }
}

# 4. ALB Listener
# Forwards traffic from port 80 to the target group [cite: 90]
resource "aws_lb_listener" "web_listener" {
  load_balancer_arn = aws_lb.web_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web_tg.arn
  }
}

# 5. Attach Auto Scaling Group to Target Group 
resource "aws_autoscaling_attachment" "asg_attachment" {
  autoscaling_group_name = aws_autoscaling_group.web_asg.id
  lb_target_group_arn    = aws_lb_target_group.web_tg.arn
}

# Output the DNS Name for testing 
output "alb_dns_name" {
  value = aws_lb.web_alb.dns_name
}