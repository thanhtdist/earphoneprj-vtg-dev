// server.js
require('dotenv').config();
const express = require('express');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Setting AWS Credentials and Region using AWS.config.update
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION // Replace with your desired AWS region
});

// Initialize Chime SDK
const chime = new AWS.ChimeSDKMeetings({ region: process.env.AWS_REGION });

// Endpoint to create a new Chime meeting
app.post('/create-meeting', async (req, res) => {
  const { clientRequestToken, externalMeetingId } = req.body;

  try {
    const meetingResponse = await chime.createMeeting({
      ClientRequestToken: clientRequestToken,  // Unique meeting identifier
      ExternalMeetingId: externalMeetingId,  // Must be a unique meeting identifier
      MediaRegion: process.env.AWS_REGION  // Choose AWS region
    }).promise();
    res.json({ meeting: meetingResponse.Meeting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get an existing Chime meeting
app.get('/get-meeting/:meetingId', async (req, res) => {
  const { meetingId } = req.params; // Get meetingId from URL parameters

  try {
    // Use the correct AWS SDK method to retrieve an existing meeting
    const meetingResponse = await chime.getMeeting({
      MeetingId: meetingId
    }).promise();

    res.json({ meeting: meetingResponse.Meeting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Endpoint to create an attendee for a meeting
app.post('/create-attendee', async (req, res) => {
  const { meetingId, externalUserId } = req.body;

  try {
    const attendeeResponse = await chime.createAttendee({
      MeetingId: meetingId,
      ExternalUserId: externalUserId  // Unique ID for each attendee (host or listener)
    }).promise();
    res.json({ attendee: attendeeResponse.Attendee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Capture audio CreateMediaCapturePipeline
app.post('/start-recording', async (req, res) => {
  const { meetingId } = req.body;
  const chimeMediaPipeline = new AWS.ChimeSDKMediaPipelines({ region: process.env.AWS_REGION });
  const params = {
    SourceType: 'ChimeSdkMeeting',
    SourceArn: `arn:aws:chime:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:meeting/${meetingId}`,
    SinkType: 'S3Bucket',
    SinkArn: `arn:aws:s3:::${process.env.S3_BUCKET_NAME}`
  }
  console.log(params);
  try {
    const pipelineResponse = await chimeMediaPipeline.createMediaCapturePipeline(params).promise();
    res.json({ pipeline: pipelineResponse.MediaCapturePipeline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop recording endpoint
app.post('/stop-recording', async (req, res) => {
  const { mediaPipelineId } = req.body;
  const chimeMediaPipeline = new AWS.ChimeSDKMediaPipelines({ region: process.env.AWS_REGION });
  try {
    const pipelineResponse = await chimeMediaPipeline.deleteMediaCapturePipeline({
      MediaPipelineId: mediaPipelineId
    }).promise();

    // res.json({ message: pipelineResponse });
    // concat recording

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
          "MediaPipelineArn": `arn:aws:chime:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:media-pipeline/${mediaPipelineId}`  // Specify the media pipeline ARN
        },
      }
    ],
    "Sinks": [
      {
        "Type": "S3Bucket",   // Destination type
        "S3BucketSinkConfiguration": {
          "Destination": `arn:aws:s3:::${process.env.S3_BUCKET_NAME_CONCAT}`
        }
      }
    ],
    // "ClientRequestToken": "unique-request-token"
  }

  console.log("concat-recording", params);
  try {
    const pipelineResponse = await chimeMediaPipeline.createMediaConcatenationPipeline(params).promise();
    res.json({ pipeline: pipelineResponse.MediaConcatenationPipeline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/concat-recording', async (req, res) => {
  const { mediaPipelineId } = req.body;
  const chimeMediaPipeline = new AWS.ChimeSDKMediaPipelines({ region: process.env.AWS_REGION });
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
          "MediaPipelineArn": `arn:aws:chime:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:media-pipeline/${mediaPipelineId}`  // Specify the media pipeline ARN
        },
      }
    ],
    "Sinks": [
      {
        "Type": "S3Bucket",   // Destination type
        "S3BucketSinkConfiguration": {
          "Destination": "arn:aws:s3:::i-stech-earphoneprj-outputs-s3"
        }
      }
    ],
    // "ClientRequestToken": "unique-request-token"
  }

  console.log("concat-recording", params);
  try {
    const pipelineResponse = await chimeMediaPipeline.createMediaConcatenationPipeline(params).promise();
    res.json({ pipeline: pipelineResponse.MediaConcatenationPipeline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
