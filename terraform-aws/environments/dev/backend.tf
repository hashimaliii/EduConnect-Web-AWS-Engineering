terraform {
  backend "s3" {
    bucket         = "tf-state-bucket-23e89367"
    key            = "global/s3/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-locking"
    encrypt        = true
  }
}