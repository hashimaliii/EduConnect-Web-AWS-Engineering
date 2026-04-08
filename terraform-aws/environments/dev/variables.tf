variable "vpc_cidr" { default = "10.0.0.0/16" }
variable "public_subnet_cidrs" { default = ["10.0.1.0/24", "10.0.2.0/24"] }
variable "private_subnet_cidrs" { default = ["10.0.10.0/24", "10.0.11.0/24"] }
variable "availability_zones" { default = ["us-east-1a", "us-east-1b"] }
variable "environment" { default = "dev" }

# Replace this with your actual IP address in CIDR format (e.g., "192.168.1.5/32")
# You can find your IP by Googling "What is my IP"
variable "your_ip_address" {} 

# Replace this with the Packer AMI ID you saved earlier!
variable "packer_ami_id" {}
variable "instance_type" {}
variable "key_name" { default = "educonnect-key" }