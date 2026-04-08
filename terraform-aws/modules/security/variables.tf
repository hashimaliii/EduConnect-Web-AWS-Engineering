variable "vpc_id" {
  type = string
}

variable "environment" {
  type = string
}

variable "your_ip_address" {
  type        = string
  description = "Your personal IP address for SSH access (e.g., '203.0.113.5/32')"
}