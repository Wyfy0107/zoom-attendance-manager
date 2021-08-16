# Image Recognition

Image recognition using Amazon Rekognition Service

## How

1. Upload new image to S3 bucket
2. S3 notification triggers a lambda function
3. The function uses Amazon Rekognition to detect labels for the uploaded image
4. Lambda updates the tags of the image in the bucket
