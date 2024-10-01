//import { env } from '$amplify/env/create-media-pipeline'; // the import is '$amplify/env/<function-name>'
import type { APIGatewayProxyHandler } from 'aws-lambda';
import AWS from 'aws-sdk';

export const handler: APIGatewayProxyHandler = async (event) => {
  const region = 'ap-northeast-1';
  const AWS_ACCOUNT_ID = "647755634525";
  const S3_BUCKET_NAME_CONCAT = "i-stech-earphoneprj-outputs-s3";
  const chimeMediaPipeline = new AWS.ChimeSDKMediaPipelines({ region });

  try {
    // Parse body from API Gateway event
    console.log('Event: ', event);
    console.log('Event body: ', event.body);
    //const { clientRequestToken, externalMeetingId } = JSON.parse(event.body || '{}'); // Ensure parsing from body
    // const { clientRequestToken, externalMeetingId } = JSON.parse(event.body || '{}');// Ensure parsing from body
    const { mediaPipelineId } = JSON.parse(event.body || '{}');

    console.log('Delete MediaCapturePipeline with mediaPipelineId: ', mediaPipelineId);

    // Input validation
    if (!mediaPipelineId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid input: mediaPipelineId is required.' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // Enable CORS if needed
        },
      };
    }

    const deleteMediaCapturePipelineResponse = await chimeMediaPipeline.deleteMediaCapturePipeline({
      MediaPipelineId: mediaPipelineId
    }).promise();

    // Create parameters for the createMediaConcatenationPipeline API
    const params = {
      "Sources": [
        {
          "Type": "MediaCapturePipeline",  // Specify the source type
          "MediaCapturePipelineSourceConfiguration": {
            "ChimeSdkMeetingConfiguration": {
              "ArtifactsConfiguration": {
                "Audio": {
                  "State": "Enabled"
                },
                "CompositedVideo": {
                  "State": "Enabled"
                },
                "Content": {
                  "State": "Enabled"
                },
                "DataChannel": {
                  "State": "Enabled"
                },
                "MeetingEvents": {
                  "State": "Enabled"
                },
                "TranscriptionMessages": {
                  "State": "Enabled"
                },
                "Video": {
                  "State": "Enabled"
                }
              }
            },
            "MediaPipelineArn": `arn:aws:chime:${region}:${AWS_ACCOUNT_ID}:media-pipeline/${mediaPipelineId}`  // Specify the media pipeline ARN
          },
        }
      ],
      "Sinks": [
        {
          "Type": "S3Bucket",   // Destination type
          "S3BucketSinkConfiguration": {
            "Destination": `arn:aws:s3:::${S3_BUCKET_NAME_CONCAT}`
          }
        }
      ],
      // "ClientRequestToken": "unique-request-token"
    }
    console.log("createMediaCapturePipeline params", params);

    // Create a new MediaConcatenationPipeline
    const pipelineResponse = await chimeMediaPipeline.createMediaConcatenationPipeline(params).promise();

    console.log('Created MediaConcatenationPipeline: ', pipelineResponse.MediaConcatenationPipeline);

    // Return successful response
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: pipelineResponse.MediaConcatenationPipeline,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Enable CORS if needed
      },
    };
  } catch (error: any) {
    console.error('Error creating meeting: ', { error, event });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Enable CORS if needed
      },
    };
  }
};
