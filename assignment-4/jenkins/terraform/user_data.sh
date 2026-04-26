#!/bin/bash
# Jenkins Controller User Data Script
# Installs: Java 17, Git, Docker, AWS CLI, Terraform, Jenkins LTS, Trivy

# Redirect all output to log file for debugging
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "=== Starting Jenkins Controller Setup ==="

# Update and install prerequisites
echo "Updating package list..."
apt-get update -y

# Fix Java CA certificates (critical for Jenkins plugin downloads)
apt-get update -y
apt-get install -y openjdk-17-jdk
apt-get install --reinstall ca-certificates-java -y
update-ca-certificates -f

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

# Install Trivy using official repository
echo "Installing Trivy..."
if ! command -v trivy &> /dev/null; then
    wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor -o /usr/share/keyrings/trivy.gpg
    echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" > /etc/apt/sources.list.d/trivy.list
    apt-get update -y || true
    apt-get install trivy -y || true
fi

# Install Node.js v18 (Official Nodesource method)
echo "Installing Node.js v18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - || true
    apt-get install -y nodejs || true
fi

# Add Jenkins (DIRECT INSTALL LATEST VERSION)
echo "Installing Latest Jenkins LTS (Direct Download)..."
if ! command -v jenkins &> /dev/null; then
    # Install dependencies first
    apt-get update -y
    apt-get install -y daemon psmisc net-tools
    
    # Download a specific recent stable version (2.492.1)
    wget -q https://pkg.jenkins.io/debian-stable/binary/jenkins_2.492.1_all.deb -O /tmp/jenkins.deb
    
    # Install via dpkg
    dpkg -i /tmp/jenkins.deb || apt-get install -f -y
    
    # Start Jenkins
    systemctl enable jenkins
    systemctl start jenkins
fi

# Install Docker Compose
echo "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "=== Jenkins Controller Setup Complete ==="
echo "Jenkins Initial Admin Password:"
# Wait up to 60 seconds for the password file to appear
for i in {1..12}; do
    if [ -f /var/lib/jenkins/secrets/initialAdminPassword ]; then
        cat /var/lib/jenkins/secrets/initialAdminPassword
        break
    fi
    echo "Waiting for Jenkins to generate password... ($i)"
    sleep 5
done