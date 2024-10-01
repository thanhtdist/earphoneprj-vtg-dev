//import { env } from '$amplify/env/create-media-pipeline'; // the import is '$amplify/env/<function-name>'
import type { APIGatewayProxyHandler } from 'aws-lambda';
import AWS from 'aws-sdk';

export const handler: APIGatewayProxyHandler = async (event) => {
  const region = 'ap-northeast-1';
  const AWS_ACCOUNT_ID = "647755634525";
  const S3_BUCKET_NAME = "i-stech-earphoneprj-s3";
  const chimeMediaPipeline = new AWS.ChimeSDKMediaPipelines({ region });

  try {
    // Parse body from API Gateway event
    console.log('Event: ', event);
    console.log('Event body: ', event.body);
    //const { clientRequestToken, externalMeetingId } = JSON.parse(event.body || '{}'); // Ensure parsing from body
    // const { clientRequestToken, externalMeetingId } = JSON.parse(event.body || '{}');// Ensure parsing from body
    const { meetingId } = JSON.parse(event.body || '{}');

    console.log('Creating meeting with meetingId: ', meetingId);

    // Input validation
    if (!meetingId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid input: meetingId is required.' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // Enable CORS if needed
        },
      };
    }

    // Create parameters for the createMediaCapturePipeline API
    const params = {
      SourceType: 'ChimeSdkMeeting',
      SourceArn: `arn:aws:chime:${region}:${AWS_ACCOUNT_ID}:meeting/${meetingId}`,
      SinkType: 'S3Bucket',
      SinkArn: `arn:aws:s3:::${S3_BUCKET_NAME}`
    }
    console.log("createMediaCapturePipeline params", params);

    // Create a new MediaCapturePipeline
    const pipelineResponse = await chimeMediaPipeline.createMediaCapturePipeline(params).promise();

    console.log('Created MediaCapturePipeline: ', pipelineResponse.MediaCapturePipeline);

    // Return successful response
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: pipelineResponse.MediaCapturePipeline,
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
