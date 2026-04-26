# Jenkins Setup Guide - Task 1

This document describes the step-by-step setup for Jenkins controller and agent.

## Prerequisites

- AWS account with existing infrastructure from Assignment 3
- SSH key pair (`educonnect-key`) already created
- Your IP address for security group rules

## Step 1: Deploy Jenkins Infrastructure

### Option A: Using Terraform

```bash
cd jenkins/terraform

# Create terraform.tfvars file
cat > terraform.tfvars << EOF
your_ip_address = "YOUR_IP/32"
jenkins_agent_label = "linux-agent"
create_ecr_iam_role = true
EOF

# Initialize and apply
terraform init
terraform plan
terraform apply
```

### Option B: Manual Deployment (if Terraform IDs are unknown)

1. Go to AWS Console → EC2 → Instances
2. Launch new instance "jenkins-controller":
   - AMI: Ubuntu 22.04 LTS
   - Type: t3.medium
   - Subnet: Public subnet (from Assignment 3)
   - Security Group: Create new with port 8080 and 22 from your IP
   - Key Pair: educonnect-key
   - User Data: Copy content from `user_data.sh`

3. Launch new instance "jenkins-agent":
   - AMI: Ubuntu 22.04 LTS
   - Type: t3.medium
   - Subnet: Private subnet (from Assignment 3)
   - Security Group: SSH from controller, HTTP from ALB
   - Key Pair: educonnect-key
   - User Data: Copy content from `agent_user_data.sh`

## Step 2: Initial Jenkins Configuration

### 2.1 Access Jenkins

1. Wait 5-10 minutes for instances to initialize
2. Open browser: `http://<JENKINS_CONTROLLER_PUBLIC_IP>:8080`
3. Get initial admin password:
   ```bash
   ssh -i ~/.ssh/levelup_key.pem ubuntu@<JENKINS_CONTROLLER_IP>
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```

### 2.2 Setup Wizard

1. Enter the initial admin password
2. Click "Install suggested plugins"
3. Create admin user:
   - Username: admin
   - Password: (create strong password)
   - Full Name: Jenkins Admin
   - Email: your@email.com

### 2.3 Install Required Plugins

After initial setup, go to **Manage Jenkins → Plugins → Available**:

Install these plugins:
- [ ] Pipeline
- [ ] Git
- [ ] GitHub Branch Source
- [ ] Docker Pipeline
- [ ] Credentials Binding
- [ ] Pipeline Utility Steps
- [ ] SonarQube Scanner
- [ ] Blue Ocean
- [ ] Slack Notification
- [ ] Email Extension
- [ ] JUnit
- [ ] HTML Publisher
- [ ]ansicolor (for colored output)

## Step 3: Configure Jenkins Credentials

Go to **Manage Jenkins → Credentials → Stores → Jenkins → Global**:

### 3.1 AWS Credentials
- Kind: AWS Credentials
- ID: `aws-creds`
- Access Key ID: (from IAM user)
- Secret Access Key: (from IAM user)

### 3.2 GitHub Personal Access Token
- Kind: Secret text
- ID: `github-token`
- Secret: (your GitHub PAT with repo and admin:org scopes)

### 3.3 Docker/ECR Credentials
- Kind: Username with password
- ID: `ecr-creds`
- Username: AWS
- Password: (run `aws ecr get-login-password`)

### 3.4 Slack Webhook
- Kind: Secret text
- ID: `slack-webhook`
- Secret: (Slack webhook URL from your Slack app)

## Step 4: Configure GitHub Plugin

1. Go to **Manage Jenkins → System → GitHub**
2. Click "Add GitHub Server"
3. Name: GitHub
4. Credentials: Select `github-token`
5. Click "Test Connection" to verify

## Step 5: Setup Jenkins Agent

### 5.1 Configure Agent in Jenkins

1. Go to **Manage Jenkins → Nodes → New Node**
2. Node Name: `linux-agent`
3. Type: Permanent Agent
4. Click "OK"

5. Configure:
   - Name: `linux-agent`
   - Description: Jenkins build agent
   - # of executors: 2
   - Usage: "Only build jobs with label expressions matching this node"
   - Launch method: "Launch agents via SSH"
   - Host: `<JENKINS_AGENT_PRIVATE_IP>`
   - Credentials: Add SSH username/password or use key
     - Username: ubuntu
     - Private Key: Enter directly
     - Key: (paste private key content)
   - Host Key Verification Strategy: "Manually trusted key"

6. Click "Save"

### 5.2 Verify Agent is Online

1. Wait 1-2 minutes for agent to connect
2. The agent should show as online with a green dot
3. If it shows offline, check:
   - Security group allows SSH from controller
   - Agent has correct SSH key
   - Jenkins can reach agent on port 22

## Step 6: Create Sanity Check Job

1. Go to **New Item**
2. Name: `sanity-check`
3. Type: Pipeline
4. Click "OK"

5. Pipeline script:
   ```groovy
   pipeline {
       agent { label 'linux-agent' }
       stages {
           stage('Hello') {
               steps {
                   echo 'Hello from Jenkins Agent!'
               }
           }
       }
   }
   ```

6. Click "Save"
7. Click "Build Now"
8. Verify build succeeds with output showing it ran on linux-agent

## Troubleshooting

### Agent won't connect
- Check security groups allow SSH (port 22)
- Verify SSH key is correct
- Check agent logs: **Manage Jenkins → Nodes → linux-agent → Logs**

### Jenkins won't start
- Check Java is installed: `java -version`
- Check Jenkins service: `systemctl status jenkins`
- Check logs: `sudo journalctl -u jenkins -f`

### Can't access Jenkins UI
- Verify security group allows port 8080 from your IP
- Check instance is running
- Check Jenkins is listening: `curl http://localhost:8080`

## Next Steps

After completing Task 1, proceed to:
- **Task 2**: Create sample application and declarative pipeline
- Configure GitHub webhook for automatic builds