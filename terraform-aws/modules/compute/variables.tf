variable "ami_id" {
  type        = string
  description = "The AMI ID to use for the instance"
}

variable "instance_type" {
  type        = string
  description = "The EC2 instance type"

  validation {
    condition     = contains(["t3.micro", "t3.small", "t3.medium"], var.instance_type)
    error_message = "The instance_type must be one of: t3.micro, t3.small, t3.medium."
  }
}

variable "subnet_id" {
  type        = string
  description = "The subnet ID to deploy the instance into"
}

variable "security_group_ids" {
  type        = list(string)
  description = "List of security group IDs to attach"
}

variable "key_name" {
  type        = string
  description = "The SSH key pair name"
}

variable "environment" {
  type        = string
  description = "Environment name (e.g., dev, prod)"
}

variable "user_data" {
  type        = string
  default     = ""
  description = "Optional user data script"
}

variable "instance_name" {
  type        = string
  description = "Specific name tag for the instance"
}