# SonarQube EC2 Instance - Task 4
# This provisions a t3.small EC2 instance running SonarQube via Docker

resource "aws_instance" "sonarqube" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.small"
  subnet_id     = var.private_subnet_id

  # Security group: 9000 for SonarQube
  vpc_security_group_ids = [aws_security_group.sonarqube.id]

  key_name = var.key_name

  # User data script to install Docker and run SonarQube
  user_data = base64encode(<<-EOF
              #!/bin/bash
              set -e
              
              echo "Updating package list..."
              apt-get update -y
              
              echo "Installing Docker..."
              if ! command -v docker &> /dev/null; then
                  curl -fsSL https://get.docker.com -o get-docker.sh
                  sh get-docker.sh
                  usermod -aG docker ubuntu
                  systemctl enable docker
                  systemctl start docker
              fi
              
              # Increase vm.max_map_count for SonarQube/Elasticsearch
              sysctl -w vm.max_map_count=262144
              echo "vm.max_map_count=262144" >> /etc/sysctl.conf
              
              echo "Starting SonarQube container..."
              docker run -d --name sonarqube -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true -p 9000:9000 sonarqube:lts-community
              EOF
  )

  tags = {
    Name = "sonarqube-server"
    Role = "sonarqube"
  }
}

# Security Group for SonarQube
resource "aws_security_group" "sonarqube" {
  name        = "sonarqube-sg"
  description = "Security group for SonarQube - port 9000"
  vpc_id      = var.vpc_id

  # Ingress: Port 9000 from Jenkins Agent and Controller
  ingress {
    description       = "SonarQube from Jenkins Agent"
    from_port         = 9000
    to_port           = 9000
    protocol          = "tcp"
    security_groups   = [aws_security_group.jenkins_agent.id]
  }

  ingress {
    description       = "SonarQube from Jenkins Controller"
    from_port         = 9000
    to_port           = 9000
    protocol          = "tcp"
    security_groups   = [aws_security_group.jenkins_controller.id]
  }
  
  # Allow user access via a bastion or direct if in public subnet
  # (Given it's in private subnet, user must access via port forward or VPN)

  # Egress: Allow all outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "sonarqube-sg"
  }
}

# Output: SonarQube Private IP
output "sonarqube_private_ip" {
  description = "Private IP of SonarQube server"
  value       = aws_instance.sonarqube.private_ip
}
