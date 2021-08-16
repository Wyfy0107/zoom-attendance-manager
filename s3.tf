resource "aws_s3_bucket" "raw" {
  bucket = "${var.project}-${var.environment}-raw"
  acl    = "private"
}

resource "aws_s3_bucket" "reports" {
  bucket = "${var.project}-${var.environment}-reports"
  acl    = "private"
}
