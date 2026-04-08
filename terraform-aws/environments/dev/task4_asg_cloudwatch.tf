# 1. Launch Template for Auto Scaling
resource "aws_launch_template" "web_lt" {
  name_prefix   = "${var.environment}-web-launch-template"
  image_id      = var.packer_ami_id
  instance_type = "t3.micro"
  key_name      = aws_key_pair.deployer.key_name

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [module.security.web_sg_id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              # Update and install required tools
              apt-get update -y
              apt-get install -y nginx stress-ng

              # Ensure the web directory exists and is owned by the web user
              mkdir -p /var/www/html
              chown -R www-data:www-data /var/www/html
              chmod -R 755 /var/www/html

              # Get the Instance ID using IMDSv2
              TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
              INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/instance-id)

              # Create the index.html file that the health check is looking for
              echo "<h1>Welcome to EduConnect!</h1><p>Instance ID: $INSTANCE_ID</p>" > /var/www/html/index.html

              # Restart Nginx to ensure it is active and serving the new file
              systemctl restart nginx
              EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.environment}-asg-instance"
    }
  }
}

# 2. Auto Scaling Group (ASG)
resource "aws_autoscaling_group" "web_asg" {
  name                = "${var.environment}-web-asg"
  vpc_zone_identifier = module.vpc.public_subnet_ids
  min_size            = 1
  max_size            = 3
  desired_capacity    = 2 # Manually scaled to 2 for Task 5
  launch_template {
    id      = aws_launch_template.web_lt.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.environment}-asg-web"
    propagate_at_launch = true
  }
}

# 3. Scale-Out Policy (Add 1 instance)
resource "aws_autoscaling_policy" "scale_out" {
  name                   = "scale-out-policy"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 120
  autoscaling_group_name = aws_autoscaling_group.web_asg.name
}

# 4. CloudWatch Alarm for Scale-Out (CPU >= 60%)
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "high-cpu-alarm"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "60"
  statistic           = "Average"
  threshold           = "60"
  alarm_description   = "This metric monitors ec2 cpu utilization"
  alarm_actions       = [aws_autoscaling_policy.scale_out.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.web_asg.name
  }
}

# 5. Scale-In Policy (Remove 1 instance)
resource "aws_autoscaling_policy" "scale_in" {
  name                   = "scale-in-policy"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 120
  autoscaling_group_name = aws_autoscaling_group.web_asg.name
}

# 6. CloudWatch Alarm for Scale-In (CPU <= 20%)
resource "aws_cloudwatch_metric_alarm" "cpu_low" {
  alarm_name          = "low-cpu-alarm"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "60"
  statistic           = "Average"
  threshold           = "20"
  alarm_actions       = [aws_autoscaling_policy.scale_in.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.web_asg.name
  }
}