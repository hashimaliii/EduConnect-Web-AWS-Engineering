# Jenkins Controller and Agent - Main Terraform Configuration
# Integrates with existing Assignment 3 infrastructure

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_vpc" "existing" {
  id = var.vpc_id  # Use variable instead of hardcoded ID
}

data "aws_subnet" "public_1" {
  id = var.public_subnet_id  # Use variable instead of hardcoded ID
}

data "aws_subnet" "private_1" {
  id = var.private_subnet_id  # Use variable instead of hardcoded ID
}

# Import existing security groups
data "aws_security_group" "alb_sg" {
  id = var.alb_security_group_id  # Use variable instead of hardcoded ID
}

# Import existing key pair
data "aws_key_pair" "deployer" {
  key_name = "educonnect-key"  # Should match from Assignment 3
}

# ================== JENKINS CONTROLLER ==================

# Security Group for Jenkins Controller
resource "aws_security_group" "jenkins_controller" {
  name        = "jenkins-controller-sg"
  description = "Security group for Jenkins controller - port 8080 and 22 from user IP only"
  vpc_id      = data.aws_vpc.existing.id

  # Ingress: HTTP from user's IP and VPC
  ingress {
    description = "Jenkins UI from user IP"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.your_ip_address]
  }

  ingress {
    description = "Jenkins UI from within VPC"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  # Ingress: SSH from user's IP only
  ingress {
    description = "SSH from user IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.your_ip_address]
  }

  # Ingress: JNLP for Inbound Agents
  ingress {
    description = "JNLP for Agents"
    from_port   = 50000
    to_port     = 50000
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Allow from within VPC
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

# Jenkins Controller EC2
resource "aws_instance" "jenkins_controller" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.small"
  subnet_id     = data.aws_subnet.public_1.id

  vpc_security_group_ids = [aws_security_group.jenkins_controller.id]

  key_name = data.aws_key_pair.deployer.key_name

  user_data = templatefile("${path.module}/user_data.sh", {
    jenkins_version = var.jenkins_version
  })

  tags = {
    Role = "jenkins-controller"
  }

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
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

# ================== JENKINS AGENT ==================

# Security Group for Jenkins Agent
resource "aws_security_group" "jenkins_agent" {
  name        = "jenkins-agent-sg"
  description = "Security group for Jenkins agent - SSH from controller, HTTP for builds"
  vpc_id      = data.aws_vpc.existing.id

  # Ingress: SSH from Jenkins controller
  ingress {
    description       = "SSH from Jenkins controller"
    from_port         = 22
    to_port           = 22
    protocol          = "tcp"
    security_groups   = [aws_security_group.jenkins_controller.id]
  }

  # Ingress: HTTP from ALB for smoke testing (Task 7)
  ingress {
    description     = "HTTP from ALB for smoke testing"
    from_port        = 8080
    to_port          = 8080
    protocol         = "tcp"
    security_groups  = [data.aws_security_group.alb_sg.id]
  }

  # Egress: Allow all outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "jenkins-agent-sg"
  }
}

# IAM Role for Jenkins Agent (for ECR access in Task 5)
resource "aws_iam_role" "jenkins_agent_role" {
  count = var.create_ecr_iam_role ? 1 : 0
  name  = "jenkins-agent-role"

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
}

# IAM Policy for ECR Access
resource "aws_iam_policy" "jenkins_agent_ecr_policy" {
  count = var.create_ecr_iam_role ? 1 : 0
  name  = "jenkins-agent-ecr-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:GetRepositoryPolicy",
          "ecr:DescribeRepositories",
          "ecr:ListImages",
          "ecr:DescribeImages",
          "ecr:BatchGetImage",
          "ecr:PutImage"
        ]
        Resource = "*"
      }
    ]
  })
}

# Attach ECR policy to IAM role
resource "aws_iam_role_policy_attachment" "jenkins_agent_ecr_attachment" {
  count      = var.create_ecr_iam_role ? 1 : 0
  role       = aws_iam_role.jenkins_agent_role[0].name
  policy_arn = aws_iam_policy.jenkins_agent_ecr_policy[0].arn
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "jenkins_agent" {
  count = var.create_ecr_iam_role ? 1 : 0
  name  = "jenkins-agent-profile"
  role  = aws_iam_role.jenkins_agent_role[0].name
}

# Jenkins Agent EC2
resource "aws_instance" "jenkins_agent" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.small"
  subnet_id     = data.aws_subnet.private_1.id

  vpc_security_group_ids = [aws_security_group.jenkins_agent.id]

  key_name = data.aws_key_pair.deployer.key_name

  user_data = templatefile("${path.module}/agent_user_data.sh", {
    jenkins_controller_ip = aws_instance.jenkins_controller.private_ip
    jenkins_agent_label   = var.jenkins_agent_label
  })

  iam_instance_profile = var.create_ecr_iam_role ? aws_iam_instance_profile.jenkins_agent[0].name : ""

  tags = {
    Name = "jenkins-agent"
    Role = "jenkins-agent"
  }

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }
}

# ================== OUTPUTS ==================

output "jenkins_controller_public_ip" {
  description = "Public IP of Jenkins controller"
  value       = aws_eip.jenkins_controller_eip.public_ip
}

output "jenkins_controller_private_ip" {
  description = "Private IP of Jenkins controller"
  value       = aws_instance.jenkins_controller.private_ip
}

output "jenkins_controller_instance_id" {
  description = "Instance ID of Jenkins controller"
  value       = aws_instance.jenkins_controller.id
}

output "jenkins_agent_private_ip" {
  description = "Private IP of Jenkins agent"
  value       = aws_instance.jenkins_agent.private_ip
}

output "jenkins_agent_instance_id" {
  description = "Instance ID of Jenkins agent"
  value       = aws_instance.jenkins_agent.id
}

output "jenkins_controller_security_group_id" {
  description = "Security group ID for Jenkins controller"
  value       = aws_security_group.jenkins_controller.id
}

output "jenkins_agent_security_group_id" {
  description = "Security group ID for Jenkins agent"
  value       = aws_security_group.jenkins_agent.id
}

# ================== DATA SOURCES ==================

# Ubuntu 22.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}