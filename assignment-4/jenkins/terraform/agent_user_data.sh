#!/bin/bash
# Jenkins Agent User Data Script
# Installs: Java 17, Git, Docker, AWS CLI, Terraform, Node.js, Trivy
# Connects to Jenkins controller via SSH

set -e

echo "=== Starting Jenkins Agent Setup ==="

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

# Install tfsec for Terraform security scanning (Task 6)
echo "Installing tfsec..."
if ! command -v tfsec &> /dev/null; then
    wget -q https://github.com/aquasecurity/tfsec/releases/download/v1.28.4/tfsec_1.28.4_linux_amd64.tar.gz -O /tmp/tfsec.tar.gz
    tar -xzf /tmp/tfsec.tar.gz -C /usr/local/bin/ tfsec
    rm /tmp/tfsec.tar.gz
fi

# Install Trivy for vulnerability scanning (Task 5)
echo "Installing Trivy..."
if ! command -v trivy &> /dev/null; then
    wget -q https://github.com/aquasecurity/trivy/releases/download/v0.51.1/trivy_0.51.1_Linux-64bit.tar.gz -O /tmp/trivy.tar.gz
    tar -xzf /tmp/trivy.tar.gz -C /usr/local/bin/
    rm /tmp/trivy.tar.gz
fi

# Install Node.js (for sample app in Task 2)
echo "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install Python and pip (for Python sample app option)
echo "Installing Python..."
apt-get install -y python3 python3-pip python3-venv

# Install SonarQube Scanner (Task 4)
echo "Installing SonarQube Scanner..."
if [ ! -d "/opt/sonar-scanner" ]; then
    wget -q https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip -O /tmp/sonar-scanner.zip
    unzip -q /tmp/sonar-scanner.zip -d /opt/
    mv /opt/sonar-scanner-5.0.1.3006-linux /opt/sonar-scanner
    rm /tmp/sonar-scanner.zip
fi

# Add /opt/sonar-scanner/bin to PATH
echo 'export PATH=$PATH:/opt/sonar-scanner/bin' >> /etc/profile.d/sonar-scanner.sh

# Install Docker Compose (for SonarQube in Task 4)
echo "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "=== Jenkins Agent Setup Complete ==="
echo "Agent will connect to Jenkins controller at: ${jenkins_controller_ip}"
echo "Agent label: ${jenkins_agent_label}"