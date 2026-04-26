# Jenkins Controller EC2 - Task 1
# This provisions the Jenkins controller in the public subnet

resource "aws_instance" "jenkins_controller" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.medium"
  subnet_id     = var.public_subnet_id

  # Security group: 8080 for Jenkins, 22 for SSH
  vpc_security_group_ids = [aws_security_group.jenkins_controller.id]

  key_name = var.key_name

  # User data script to install Jenkins and dependencies
  user_data = templatefile("${path.module}/user_data.sh", {
    jenkins_version = var.jenkins_version
  })

  tags = {
    Name = "jenkins-controller"
    Role = "jenkins-controller"
  }
}

# Security Group for Jenkins Controller
resource "aws_security_group" "jenkins_controller" {
  name        = "jenkins-controller-sg"
  description = "Security group for Jenkins controller - port 8080 and 22 from user IP only"
  vpc_id      = var.vpc_id

  # Ingress: HTTP from user's IP only
  ingress {
    description = "Jenkins UI from user IP"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.your_ip_address]
  }

  # Ingress: SSH from user's IP only
  ingress {
    description = "SSH from user IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.your_ip_address]
  }

  # Egress: Allow all outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "jenkins-controller-sg"
  }
}

# Elastic IP for Jenkins Controller
resource "aws_eip" "jenkins_controller_eip" {
  instance = aws_instance.jenkins_controller.id
  domain   = "vpc"

  tags = {
    Name = "jenkins-controller-eip"
  }
}

# Output: Controller Public IP
output "jenkins_controller_public_ip" {
  description = "Public IP of Jenkins controller"
  value       = aws_eip.jenkins_controller_eip.public_ip
}

# Output: Controller Private IP
output "jenkins_controller_private_ip" {
  description = "Private IP of Jenkins controller"
  value       = aws_instance.jenkins_controller.private_ip
}

# Output: Controller Instance ID
output "jenkins_controller_instance_id" {
  description = "Instance ID of Jenkins controller"
  value       = aws_instance.jenkins_controller.id
}

# Data source for Ubuntu 22.04 LTS
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}