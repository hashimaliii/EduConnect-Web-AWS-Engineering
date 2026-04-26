# Variables for Jenkins Controller and Agent

variable "vpc_id" {
  description = "VPC ID where Jenkins will be deployed"
  type        = string
}

variable "public_subnet_id" {
  description = "Public subnet ID for Jenkins controller"
  type        = string
}

variable "private_subnet_id" {
  description = "Private subnet ID for Jenkins agent"
  type        = string
}

variable "your_ip_address" {
  description = "Your IP address for SSH and Jenkins access (CIDR format)"
  type        = string
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
  default     = "educonnect-key"
}

variable "jenkins_version" {
  description = "Jenkins LTS version to install"
  type        = string
  default     = "2.462.1"
}

variable "jenkins_agent_security_group_id" {
  description = "Security group ID for Jenkins agent"
  type        = string
  default     = ""
}

variable "jenkins_controller_ip" {
  description = "Private IP of Jenkins controller for agent connection"
  type        = string
  default     = ""
}

variable "jenkins_agent_label" {
  description = "Label for Jenkins agent"
  type        = string
  default     = "linux-agent"
}

variable "jenkins_controller_security_group_id" {
  description = "Security group ID of Jenkins controller for agent SSH"
  type        = string
  default     = ""
}

variable "alb_security_group_id" {
  description = "Security group ID of ALB for smoke testing"
  type        = string
  default     = ""
}

# Agent IAM role for ECR access (Task 5)
variable "create_ecr_iam_role" {
  description = "Whether to create IAM role for ECR access"
  type        = bool
  default     = true
}