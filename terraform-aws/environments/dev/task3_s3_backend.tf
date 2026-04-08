# 1. Random ID for unique S3 bucket name
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# 2. S3 Bucket
resource "aws_s3_bucket" "terraform_state" {
  bucket = "tf-state-bucket-${random_id.bucket_suffix.hex}"
}

# 3. Enable Versioning
resource "aws_s3_bucket_versioning" "state_versioning" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# 4. Enable AES-256 Server-Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "state_encryption" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# 5. Block Public Access
resource "aws_s3_bucket_public_access_block" "state_public_access" {
  bucket                  = aws_s3_bucket.terraform_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 6. DynamoDB Table for State Locking
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-state-locking"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

# 7. IAM Role for EC2 to access S3 only
resource "aws_iam_role" "ec2_s3_access_role" {
  name = "ec2_s3_access_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "s3_read_write_policy" {
  name        = "s3_read_write_policy"
  description = "Allow EC2 instances to read/write to the Terraform state bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Effect = "Allow"
        Resource = [
          aws_s3_bucket.terraform_state.arn,
          "${aws_s3_bucket.terraform_state.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "s3_policy_attachment" {
  role       = aws_iam_role.ec2_s3_access_role.name
  policy_arn = aws_iam_policy.s3_read_write_policy.arn
}

resource "aws_iam_instance_profile" "ec2_s3_instance_profile" {
  name = "ec2_s3_instance_profile"
  role = aws_iam_role.ec2_s3_access_role.name
}

# Output the bucket name so you can copy it for Step 4
output "s3_bucket_name" {
  value = aws_s3_bucket.terraform_state.bucket
}