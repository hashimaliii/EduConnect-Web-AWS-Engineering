# ECR Repository - Task 5
# Provisions an AWS ECR private repository with lifecycle policy

resource "aws_ecr_repository" "app" {
  name = "educonnect-app"
  
  # Image tag immutability
  image_tag_immutability = "IMMUTABLE"
  
  # Image scanning on push
  image_scanning_configuration {
    scan_on_push = true
  }
  
  # Encryption configuration
  encryption_configuration {
    encryption_type = "AES256"
  }
  
  tags = {
    Environment = "dev"
    Project     = "EduConnect"
  }
}

# ECR Lifecycle Policy - Keep 10 most recent images, expire untagged after 7 days
resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name
  
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire untagged images after 7 days"
        selection    = {
          tagStatus     = "untagged"
          countType     = "sinceImagePushed"
          countUnit     = "days"
          countNumber   = 7
        }
        action        = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description   = "Keep last 10 images"
        selection     = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action         = {
          type = "expire"
        }
      }
    ]
  })
}

# Output ECR repository URL
output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_repository_arn" {
  description = "ARN of the ECR repository"
  value       = aws_ecr_repository.app.arn
}