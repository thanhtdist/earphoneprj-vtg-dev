import { defineFunction } from "@aws-amplify/backend";
    
export const stopMediaPipeline = defineFunction({
  name: "stop-media-pipeline",
  // environment: {
  //   AWS_REGION: "ap-northeast-1",
  //   AWS_ACCOUNT_ID: "647755634525",
  //   S3_BUCKET_NAME:"i-stech-earphoneprj-s3",
  //   S3_BUCKET_NAME_CONCAT: "i-stech-earphoneprj-outputs-s3"
  // },
  entry: "./handler.ts"
});