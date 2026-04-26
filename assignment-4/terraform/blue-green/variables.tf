# Variables for Blue-Green Deployment

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "packer_ami_id" {
  description = "Packer AMI ID for instances"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
  default     = "educonnect-key"
}

variable "web_security_group_id" {
  description = "Web server security group ID"
  type        = string
}

variable "alb_listener_arn" {
  description = "ALB listener ARN for production traffic"
  type        = string
}

variable "alb_test_listener_arn" {
  description = "ALB test listener ARN for smoke testing"
  type        = string
}