#!/bin/bash
# Jenkins Agent User Data Script
# Installs: Java 17, Git, Docker, AWS CLI, Terraform, Node.js, Trivy, SonarQube Scanner

# Redirect all output to log file for debugging
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "=== Starting Jenkins Agent Setup ==="

# Update and install prerequisites
# Add 2GB Swap space to handle memory pressure
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

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
    wget -q https://github.com/aquasecurity/tfsec/releases/download/v1.28.4/tfsec_1.28.4_linux_amd64 -O /usr/local/bin/tfsec
    chmod +x /usr/local/bin/tfsec
fi

# Install Trivy using official repository
echo "Installing Trivy..."
if ! command -v trivy &> /dev/null; then
    wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
    echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee /etc/apt/sources.list.d/trivy.list
    apt-get update -y
    apt-get install trivy -y
fi

# Install Node.js (for sample app in Task 2)
echo "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install Python and pip
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

# Install Docker Compose
echo "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "=== Jenkins Agent Setup Complete ==="

# Connect to Jenkins Controller
echo "Connecting to Jenkins Controller..."
mkdir -p /home/ubuntu/jenkins
cd /home/ubuntu/jenkins
# Wait for controller to be ready and download agent.jar
max_retries=10
count=0
while [ $count -lt $max_retries ]; do
    wget -q http://${jenkins_controller_ip}:8080/jnlpJars/agent.jar && break
    echo "Waiting for Jenkins Controller... ($count)"
    sleep 15
    count=$((count+1))
done

# Run agent in background
java -jar agent.jar -url http://${jenkins_controller_ip}:8080/ -secret f02868531139a14796d477ca802cd6ac2d46403cb468058341b249c11f76c918 -name "jenkins-agent" -workDir "/home/ubuntu/jenkins" &