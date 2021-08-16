resource "aws_lambda_function" "zoom" {
  function_name = "zoom-participants-manager"
  filename      = "lambdas/zoom.zip"
  role          = aws_iam_role.zoom-role.arn
  description   = "get meeting details from zoom api and process it"

  memory_size                    = 128
  package_type                   = "Zip"
  runtime                        = "nodejs12.x"
  timeout                        = 60
  reserved_concurrent_executions = 10

  handler          = "index.lambda_handler"
  source_code_hash = filebase64sha256("lambdas/zoom.zip")

  environment {
    variables = {
      RAW_BUCKET = aws_s3_bucket.raw.id
    }
  }
}

resource "aws_lambda_function" "report" {
  function_name = "zoom-participants-report"
  filename      = "lambdas/participant-report.zip"
  role          = aws_iam_role.report-role.arn
  description   = "process meeting perticipants"

  memory_size                    = 128
  package_type                   = "Zip"
  runtime                        = "nodejs12.x"
  timeout                        = 60
  reserved_concurrent_executions = 10

  handler          = "index.lambda_handler"
  source_code_hash = filebase64sha256("lambdas/participant-report.zip")

  environment {
    variables = {
      RAW_BUCKET    = aws_s3_bucket.raw.id
      REPORT_BUCKET = aws_s3_bucket.reports.id
    }
  }
}

resource "aws_lambda_permission" "cloudwatch-trigger-zoom" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.zoom.arn
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.lambda.arn
}

resource "aws_lambda_permission" "cloudwatch-trigger-report" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.report.arn
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.report.arn
}

