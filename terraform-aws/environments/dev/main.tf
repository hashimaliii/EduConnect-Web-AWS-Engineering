provider "aws" {
  region = "us-east-1"
}

# 1. SSH Key Pair
resource "aws_key_pair" "deployer" {
  key_name   = var.key_name
  public_key = file(pathexpand("~/.ssh/levelup_key.pub"))
}

# 2. VPC Module
module "vpc" {
  source               = "../../modules/vpc"
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
  environment          = var.environment
}

# 3. Security Module
module "security" {
  source          = "../../modules/security"
  vpc_id          = module.vpc.vpc_id
  environment     = var.environment
  your_ip_address = var.your_ip_address
}

# 4. Public Web Instance (Task 2)
module "public_web" {
  source             = "../../modules/compute"
  ami_id             = var.packer_ami_id
  instance_type      = var.instance_type
  subnet_id          = module.vpc.public_subnet_ids[0]
  security_group_ids = [module.security.web_sg_id]
  key_name           = aws_key_pair.deployer.key_name
  environment        = var.environment
  instance_name      = "public-web-server"
  
  # user_data uses the custom AMI we built, we just add the instance ID
  user_data = <<-EOF
              #!/bin/bash
              INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
              echo "<h1>Welcome to the EduConnect Custom AMI!</h1><p>Instance ID: $INSTANCE_ID</p>" | sudo tee /var/www/html/index.html
              EOF
}

# 5. Private DB Instance (Task 2)
module "private_db" {
  source             = "../../modules/compute"
  ami_id             = var.packer_ami_id
  instance_type      = var.instance_type
  subnet_id          = module.vpc.private_subnet_ids[0]
  security_group_ids = [module.security.db_sg_id]
  key_name           = aws_key_pair.deployer.key_name
  environment        = var.environment
  instance_name      = "private-db-server"
}

# Root Outputs
output "public_web_ip" {
  value = module.public_web.public_ip
}

output "private_db_ip" {
  value = module.private_db.private_ip
}