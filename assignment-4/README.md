# EduConnect DevOps Assignment 4

CI/CD Pipelines with Jenkins and Groovy - Complete project structure and code.

## Project Overview

This project implements a complete CI/CD pipeline using Jenkins and Groovy on AWS infrastructure from Assignment 3. It includes:

- Jenkins controller and agent setup
- Sample Node.js application with tests
- Declarative pipelines with parallel stages
- Jenkins shared library in Groovy
- SonarQube integration for code quality
- Docker build, vulnerability scanning, and ECR push
- Terraform CI/CD pipeline
- Blue-Green deployment to AWS

## Directory Structure

```
assignment-4/
├── app/                          # Sample application (Node.js + Express)
│   ├── src/                      # Application source code
│   │   ├── index.js              # Main entry point
│   │   └── routes/               # API routes
│   │       ├── health.js         # Health check endpoint
│   │       └── users.js          # Users API
│   ├── tests/                    # Test files
│   │   ├── unit/                 # Unit tests
│   │   └── integration/          # Integration tests
│   ├── Dockerfile                # Multi-stage Dockerfile
│   ├── Jenkinsfile               # Main pipeline
│   └── package.json              # Node.js dependencies
│
├── jenkins/                      # Task 1: Jenkins Setup
│   ├── terraform/                # Terraform for Jenkins infra
│   │   ├── main.tf              # Main configuration
│   │   ├── controller.tf        # Jenkins controller
│   │   ├── agent.tf              # Jenkins agent
│   │   ├── user_data.sh         # Controller user data
│   │   ├── agent_user_data.sh   # Agent user data
│   │   ├── variables.tf         # Variables
│   │   └── outputs.tf            # Outputs
│   ├── plugins.txt              # Required Jenkins plugins
│   └── setup.md                 # Setup guide
│
│
├── terraform/                    # Infrastructure
│   ├── ecr/                     # Task 5: ECR repository
│   │   └── main.tf
│   ├── blue-green/              # Task 7: Blue-Green deployment
│   │   ├── main.tf
│   │   └── variables.tf
│   └── infra-pipeline/          # Task 6: Terraform CI/CD
│       └── Jenkinsfile
│
├── observability/               # Monitoring
│   ├── docker-compose.yml      # SonarQube, Prometheus, Grafana
│   ├── prometheus.yml           # Prometheus config
│   └── dashboards/              # Grafana dashboards
│       └── jenkins-dashboard.json
│
├── environments/                # Assignment 3 infrastructure
│   └── dev/
│       ├── main.tf
│       ├── variables.tf
│       ├── task3_s3_backend.tf
│       ├── task4_asg_cloudwatch.tf
│       └── task5_alb.tf
│
├── modules/                     # Reusable Terraform modules
│   ├── compute/
│   ├── security/
│   └── vpc/
│
└── README.md                    # This file
```

## Prerequisites

1. **AWS Account**: Active AWS account with appropriate permissions
2. **SSH Key**: Key pair named `educonnect-key` in AWS
3. **GitHub Repository**: Private repository for your team
4. **Packer AMI**: Custom AMI from Assignment 3

## Quick Start

### Step 1: Deploy Jenkins Infrastructure

```bash
cd jenkins/terraform

# Create terraform.tfvars
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

### Step 2: Configure Jenkins

1. Access Jenkins at `http://<CONTROLLER_IP>:8080`
2. Complete initial setup wizard
3. Install required plugins (see `jenkins/plugins.txt`)
4. Configure credentials in Jenkins UI
5. Add Jenkins agent via SSH

### Step 3: Deploy Sample Application

```bash
cd app
npm install
npm test
```

### Step 4: Run Pipeline

1. Create Multibranch Pipeline job in Jenkins
2. Connect to your GitHub repository
3. Add GitHub webhook for automatic triggers

## Task Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Jenkins Installation | `jenkins/` |
| 2 | Declarative Pipeline | `app/Jenkinsfile` |
| 3 | Shared Library | Separated to its own repository |
| 4 | SonarQube | `jenkins/terraform/sonarqube.tf`, `observability/` |
| 5 | Docker + ECR | `app/Dockerfile`, `terraform/ecr/` |
| 6 | Terraform CI/CD | `terraform/infra-pipeline/` |
| 7 | Blue-Green | `terraform/blue-green/` |

## Credentials Required

Create these credentials in Jenkins (Manage Jenkins → Credentials):

| ID | Type | Purpose |
|----|------|---------|
| `aws-creds` | AWS Credentials | AWS API access |
| `github-token` | Secret text | GitHub access |
| `slack-webhook` | Secret text | Slack notifications |
| `ecr-creds` | Username/password | ECR login |
| `sonarqube-token` | Secret text | SonarQube access |

## Team Contribution

| Member | Tasks |
|--------|-------|
| [Team Member 1] | Task 1, Task 2, Task 3 |
| [Team Member 2] | Task 4, Task 5, Task 6, Task 7 |

## Important Notes

- **DO NOT** commit credentials or secrets to the repository
- Use Jenkins credentials for all sensitive data
- Follow Git workflow: branch per task, PR to main
- Document all changes in README

## License

MIT License