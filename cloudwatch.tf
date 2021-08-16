resource "aws_cloudwatch_event_target" "lambda" {
  arn  = aws_lambda_function.zoom.arn
  rule = aws_cloudwatch_event_rule.lambda.id
}

resource "aws_cloudwatch_event_rule" "lambda" {
  name_prefix         = "lambda-zoom-schedule"
  description         = "schedule lambda to get zoom meetings participants lists"
  schedule_expression = "cron(0 3 * * 1-5)"
}

resource "aws_cloudwatch_event_target" "report" {
  arn  = aws_lambda_function.report.arn
  rule = aws_cloudwatch_event_rule.report.id
}

resource "aws_cloudwatch_event_rule" "report" {
  name_prefix         = "lambda-report-schedule"
  description         = "schedule lambda to process zoom meetings participants lists"
  schedule_expression = "cron(0 3 * * 7)"
}
