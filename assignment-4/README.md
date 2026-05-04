# EduConnect CI/CD Implementation - Assignment 4
## AWS Cloud Engineering & Automation

This repository contains the full end-to-end CI/CD solution for the EduConnect application, leveraging Jenkins, Docker, Terraform, and AWS. It implements a zero-downtime **Blue-Green Deployment** strategy with automated security scanning and code quality enforcement.

---

## 🏗️ 1. Architecture & Infrastructure
The infrastructure is provisioned entirely via **Terraform**, ensuring consistency and version control.

### Core Components:
- **Jenkins Ecosystem**:
    - **Controller**: Hosted on a `t3.small` Ubuntu instance. Manages job scheduling and the UI.
    - **Linux Agent**: A separate instance in a private subnet, connected via SSH. All builds run here to keep the controller secure.
- **SonarQube Server**: A dedicated `t3.small` instance running SonarQube via Docker.
- **Network Stack**: Built on the VPC from Assignment 3, utilizing public subnets for the ALB and private subnets for application workloads.
- **Blue-Green Setup**:
    - **ALB**: Single Load Balancer with two listeners (Port 80 for Production, Port 8080 for Smoke Testing).
    - **ASGs**: Two Auto Scaling Groups (`blue-web-asg` and `green-web-asg`) that rotate roles during deployment.

---

## 📂 2. Repository Deep Dive

### `/app` - The Application Layer
- **Node.js/Express**: A RESTful API with `/health` and `/api/users` endpoints.
- **Testing Suite**: 
    - **Unit Tests**: 6 tests verifying core logic and middleware.
    - **Integration Tests**: 5 tests verifying the full HTTP request/response cycle using `supertest`.
- **Dockerfile**:
    - **Multi-stage Build**: A `builder` stage for dependencies and a `runtime` stage for execution.
    - **Security**: Runs as a non-root `nodejs` user. Contains only production dependencies (no build tools).

### `/pipelines` - The Logic Layer
- **`app.Jenkinsfile`**: The "Brain" of the project.
    - **Parallel Execution**: Unit and Integration tests run simultaneously to reduce build time.
    - **Security Scanning**: Integrated **Trivy** scan that fails the build if `HIGH` or `CRITICAL` vulnerabilities are found.
    - **Blue-Green Logic**: 
        - Queries AWS to find the current live Target Group.
        - Updates the **Launch Template** of the idle environment with the new ECR Image ID.
        - Triggers an **Instance Refresh** to roll out new instances.
        - Automatically switches the ALB listener only after a successful 200 OK health check on port 8080.
- **`infra.Jenkinsfile`**:
    - Implements **Terraform Security Scanning** (`tfsec`).
    - Enforces a "Plan-then-Approve" workflow by archiving the binary `tfplan` as a Jenkins artifact.

### `/terraform` - The Foundation
- **`blue-green/`**: Defines the ALB rules, Target Groups, and ASGs.
- **`jenkins/`**: Provisioning scripts for the Jenkins controller, including `user_data` for automated tool installation.

---

## 🔒 3. Security Implementation
- **Non-Plaintext Secrets**: All credentials (AWS, GitHub, Slack, Sonar) are handled via Jenkins Credentials Binding. No tokens are committed to Git.
- **Container Security**: 
    - Minimal Alpine-based images.
    - Trivy vulnerability scanning at the build stage.
- **Network Security**: Port 8080 is restricted to specific IPs. The Jenkins Agent resides in a private subnet with no direct internet ingress.

---

## 📊 4. Monitoring & Logging
- **S3 Deployment Logs**: Every successful deployment appends a JSON entry to `s3://educonnect-deployment-logs-...` containing:
    - Timestamp
    - Commit SHA
    - Previous vs New Color
- **Prometheus/Grafana**: Configured in `/observability` to scrape metrics from the Node.js application and Jenkins.

---

## 🛠️ 5. Troubleshooting & Maintenance

### How to Rollback
If a production issue is detected after a successful deploy:
1. Go to Jenkins.
2. Run the **Rollback-Pipeline**.
3. It will instantly flip the ALB listener back to the previous stable Target Group.

### Updating Infrastructure
1. Modify the `.tf` files in `terraform/`.
2. Push to Git.
3. Run the **Infra-Pipeline**.
4. Review the `tfplan` artifact and click "Approve" in Jenkins.

---

## 👥 6. Contribution Table

| Member Name | Tasks Handled | Contribution % |
| :--- | :--- | :---: |
| **Hashim Ali** | Jenkins Setup, Blue-Green Logic, Terraform, Docker | 100% |
| **Partner Name** | [Add Details] | -- |

---
**Submission Date**: May 5, 2026
**Course**: Advanced AWS Cloud Engineering