#!/bin/bash
# Jenkins Controller User Data Script
# Installs: Java 17, Git, Docker, AWS CLI, Terraform, Jenkins LTS

set -e

echo "=== Starting Jenkins Controller Setup ==="

# Update and install prerequisites
echo "Updating package list..."
apt-get update -y

# Install Java 17 (JDK)
echo "Installing Java 17..."
apt-get install -y openjdk-17-jdk

# Install Git
echo "Installing Git..."
apt-get install -y git

# Install utilities
echo "Installing utilities..."
apt-get install -y curl wget unzip gnupg2 ca-certificates lsb-release

# Install Docker
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker ubuntu
    systemctl enable docker
    systemctl start docker
fi

# Install AWS CLI v2
echo "Installing AWS CLI v2..."
if ! command -v aws &> /dev/null; then
    cd /tmp
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    ./aws/install
    rm -rf awscliv2.zip aws
fi

# Install Terraform
echo "Installing Terraform..."
if ! command -v terraform &> /dev/null; then
    wget -q https://releases.hashicorp.com/terraform/1.7.5/terraform_1.7.5_linux_amd64.zip -O /tmp/terraform.zip
    unzip -q /tmp/terraform.zip -d /usr/local/bin/
    rm /tmp/terraform.zip
fi

# Install Trivy for vulnerability scanning (Task 5)
echo "Installing Trivy..."
if ! command -v trivy &> /dev/null; then
    wget -q https://github.com/aquasecurity/trivy/releases/download/v0.51.1/trivy_0.51.1_Linux-64bit.tar.gz -O /tmp/trivy.tar.gz
    tar -xzf /tmp/trivy.tar.gz -C /usr/local/bin/
    rm /tmp/trivy.tar.gz
fi

# Add Jenkins APT repository and install Jenkins
echo "Installing Jenkins LTS..."
if ! command -v jenkins &> /dev/null; then
    # Add Jenkins key
    wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | apt-key add -
    
    # Add Jenkins repository
    sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
    
    # Update and install Jenkins
    apt-get update -y
    apt-get install -y jenkins
    
    # Start Jenkins
    systemctl enable jenkins
    systemctl start jenkins
fi

# Install Node.js (for sample app in Task 2)
echo "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install Docker Compose (for SonarQube in Task 4)
echo "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "=== Jenkins Controller Setup Complete ==="
echo "Jenkins will be available at http://<public-ip>:8080"
echo "Initial admin password can be retrieved with: sudo cat /var/lib/jenkins/secrets/initialAdminPassword"