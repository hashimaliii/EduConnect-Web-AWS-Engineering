# Jenkins Agent EC2 - Task 1
# This provisions the Jenkins agent in a private subnet
# Connected to controller via SSH

resource "aws_instance" "jenkins_agent" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.medium"
  subnet_id     = var.private_subnet_id

  # Security group: 22 for SSH from controller, 80 for web access
  vpc_security_group_ids = [aws_security_group.jenkins_agent.id]

  key_name = var.key_name

  # User data script to install agent dependencies
  user_data = templatefile("${path.module}/agent_user_data.sh", {
    jenkins_controller_ip = var.jenkins_controller_ip
    jenkins_agent_label   = var.jenkins_agent_label
  })

  # IAM instance profile for ECR access (Task 5)
  iam_instance_profile = var.create_ecr_iam_role ? aws_iam_instance_profile.jenkins_agent.name : ""

  tags = {
    Name = "jenkins-agent"
    Role = "jenkins-agent"
  }
}

# Security Group for Jenkins Agent
resource "aws_security_group" "jenkins_agent" {
  name        = "jenkins-agent-sg"
  description = "Security group for Jenkins agent - SSH from controller, HTTP for builds"
  vpc_id      = var.vpc_id

  # Ingress: SSH from Jenkins controller (using private security group)
  ingress {
    description       = "SSH from Jenkins controller"
    from_port         = 22
    to_port           = 22
    protocol          = "tcp"
    security_groups   = [var.jenkins_controller_security_group_id]
  }

  # Ingress: HTTP from ALB for smoke testing (Task 7)
  ingress {
    description     = "HTTP from ALB for smoke testing"
    from_port        = 8080
    to_port          = 8080
    protocol         = "tcp"
    security_groups  = [var.alb_security_group_id]
  }

  # Ingress: HTTP from Jenkins controller
  ingress {
    description       = "HTTP from Jenkins controller"
    from_port         = 80
    to_port           = 80
    protocol          = "tcp"
    security_groups   = [var.jenkins_controller_security_group_id]
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
  count        = var.create_ecr_iam_role ? 1 : 0
  name         = "jenkins-agent-role"
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
  count        = var.create_ecr_iam_role ? 1 : 0
  name         = "jenkins-agent-ecr-policy"
  description = "Allows Jenkins agent to pull/push ECR images"

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
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = ["*"]
      }
    ]
  })
}

# Attach ECR policy to IAM role
resource "aws_iam_role_policy_attachment" "jenkins_agent_ecr_attachment" {
  count         = var.create_ecr_iam_role ? 1 : 0
  role          = aws_iam_role.jenkins_agent_role[0].name
  policy_arn    = aws_iam_policy.jenkins_agent_ecr_policy[0].arn
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "jenkins_agent" {
  count       = var.create_ecr_iam_role ? 1 : 0
  name        = "jenkins-agent-profile"
  role        = aws_iam_role.jenkins_agent_role[0].name
}

# Output: Agent Private IP
output "jenkins_agent_private_ip" {
  description = "Private IP of Jenkins agent"
  value       = aws_instance.jenkins_agent.private_ip
}

# Output: Agent Instance ID
output "jenkins_agent_instance_id" {
  description = "Instance ID of Jenkins agent"
  value       = aws_instance.jenkins_agent.id
}