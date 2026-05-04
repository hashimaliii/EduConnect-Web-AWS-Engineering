/**
 * Terraform CI/CD Pipeline - Task 6
 * Manages infrastructure using Terraform with security scanning and manual approval
 */

pipeline {
    agent { label 'linux-agent' }
    
    environment {
        TF_VERSION = '1.7.5'
        AWS_REGION = 'us-east-1'
    }
    
    parameters {
        choice(name: 'ACTION', choices: ['plan', 'apply', 'destroy'], description: 'Terraform action to perform')
        booleanParam(name: 'AUTO_APPROVE', defaultValue: false, description: 'Skip manual approval')
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '30'))
        timeout(time: 45, unit: 'MINUTES')
        timestamps()
    }
    
    stages {
        // Stage 1: Checkout
        stage('Checkout') {
            steps {
                echo 'Checking out Terraform code...'
                checkout scm
                
                script {
                    env.TF_WORKING_DIR = params.ACTION == 'destroy' ? 'environments/dev' : 'environments/dev'
                }
            }
        }
        
        // Stage 2: Setup Terraform
        stage('Setup Terraform') {
            steps {
                echo 'Installing Terraform...'
                sh """
                    if ! command -v terraform &> /dev/null || [[ \$(terraform version -short) != "v${TF_VERSION}" ]]; then
                        wget -q https://releases.hashicorp.com/terraform/${TF_VERSION}/terraform_${TF_VERSION}_linux_amd64.zip -O /tmp/terraform.zip
                        unzip -q /tmp/terraform.zip -d /usr/local/bin/
                        rm /tmp/terraform.zip
                    fi
                    terraform version
                """
            }
        }
        
        // Stage 3: Initialize Terraform
        stage('Init') {
            steps {
                echo 'Initializing Terraform...'
                dir(env.TF_WORKING_DIR) {
                    sh 'terraform init -upgrade'
                }
            }
        }
        
        // Stage 4: Format and Validate
        stage('Fmt & Validate') {
            steps {
                echo 'Checking Terraform formatting...'
                dir(env.TF_WORKING_DIR) {
                    sh 'terraform fmt -check -recursive'
                }
                
                echo 'Validating Terraform configuration...'
                dir(env.TF_WORKING_DIR) {
                    sh 'terraform validate'
                }
            }
        }
        
        // Stage 5: Security Scan (tfsec)
        stage('Security Scan') {
            steps {
                echo 'Running tfsec security scan...'
                sh """
                    if ! command -v tfsec &> /dev/null; then
                        wget -q https://github.com/aquasecurity/tfsec/releases/download/v1.28.4/tfsec_1.28.4_linux_amd64.tar.gz -O /tmp/tfsec.tar.gz
                        tar -xzf /tmp/tfsec.tar.gz -C /usr/local/bin/ tfsec
                        rm /tmp/tfsec.tar.gz
                    fi
                """
                
                dir(env.TF_WORKING_DIR) {
                    script {
                        def result = sh(
                            script: 'tfsec . --format json --out tfsec-report.json || true',
                            returnStatus: true
                        )
                        
                        // Archive tfsec report
                        archiveArtifacts artifacts: 'tfsec-report.json', allowEmptyArchive: true
                        
                        // Fail on HIGH findings
                        def report = readJSON file: 'tfsec-report.json'
                        def highFindings = report.results?.findAll { it.severity == 'HIGH' } ?: []
                        
                        if (highFindings.size() > 0) {
                            error "tfsec found ${highFindings.size()} HIGH severity issues. Failing build."
                        }
                    }
                }
            }
        }
        
        // Stage 6: Plan
        stage('Plan') {
            steps {
                echo 'Creating Terraform plan...'
                dir(env.TF_WORKING_DIR) {
                    sh 'terraform plan -out=tfplan -var-file=terraform.tfvars'
                }
                
                echo 'Saving plan output...'
                dir(env.TF_WORKING_DIR) {
                    sh 'terraform show tfplan > tfplan.txt'
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: "${env.TF_WORKING_DIR}/tfplan,${env.TF_WORKING_DIR}/tfplan.txt", allowEmptyArchive: true
                }
            }
        }
        
        // Stage 7: Manual Approval
        stage('Manual Approval') {
            when {
                allOf {
                    expression { params.ACTION in ['apply', 'destroy'] }
                    expression { !params.AUTO_APPROVE }
                }
            }
            steps {
                echo 'Waiting for manual approval...'
                input message: "Approve Terraform ${params.ACTION}?",
                      ok: 'Approve',
                      submitter: 'admin',
                      timeout: 30
            }
        }
        
        // Stage 8: Apply or Destroy
        stage('Apply/Destroy') {
            when {
                expression { params.ACTION in ['apply', 'destroy'] }
            }
            steps {
                echo "Running terraform ${params.ACTION}..."
                dir(env.TF_WORKING_DIR) {
                    script {
                        if (params.ACTION == 'apply') {
                            sh "terraform apply -auto-approve tfplan"
                        } else {
                            sh "terraform destroy -auto-approve"
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up...'
            dir(env.TF_WORKING_DIR) {
                sh 'rm -f tfplan tfplan.txt tfsec-report.json || true'
            }
            cleanWs()
        }
        
        success {
            echo 'Terraform operation completed successfully!'
        }
        
        failure {
            echo 'Terraform operation failed!'
        }
    }
}