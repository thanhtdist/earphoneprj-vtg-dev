// src/api.js
import { get, post } from 'aws-amplify/api';
const { v4: uuid } = require('uuid');
const API_URL = 'http://localhost:4000';

// Function to create a meeting
export async function createMeeting() {
  // const response = await fetch(`https://gqr4dc3syf.execute-api.ap-northeast-1.amazonaws.com/dev/meeting`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     clientRequestToken: uuid(),  // Unique token for the meeting
  //     externalMeetingId: uuid(),  // Unique ID for the meeting
  //   }),
  // });

  // const result = await response.json();
  // console.log("createMeeting", result.data);
  // return result.data;
  try {
    const restOperation = post({
      apiName: 'MeetingRestApi',
      path: 'meeting',
      options: {
        body: {
          clientRequestToken: uuid(),
          externalMeetingId: uuid(),
        }
      }
    });

    const { body } = await restOperation.response;
    const response = await body.json();
    return response.data;
  } catch (error) {
    console.log('POST call failed: ', JSON.parse(error.response.body));
  }

}

export async function getMeeting(meetingId) {
  // const response = await fetch(`https://gqr4dc3syf.execute-api.ap-northeast-1.amazonaws.com/dev/meeting/?meetingId=${meetingId}`, {
  //   method: 'GET',
  //   headers: { 'Content-Type': 'application/json' },
  // });

  // const data = await response.json();
  // return data.meeting;
  try {
    const restOperation = get({
      apiName: 'MeetingRestApi',
      path: 'meeting/?meetingId=' + meetingId,
    });
    const { body } = await restOperation.response;
    const response = await body.json();
    return response.data;
  } catch (error) {
    console.log('GET call failed: ', JSON.parse(error.response.body));
  }
}

// Function to create an attendee (used by both host and listeners)
export async function createAttendee(meetingId, externalUserId) {
  // const response = await fetch(`https://rtp02fdc7i.execute-api.ap-northeast-1.amazonaws.com/dev/attendee`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     meetingId,
  //     externalUserId
  //   }),
  // });

  // const result = await response.json();
  // return result.data;
  try {
    const restOperation = post({
      apiName: 'AttendeeRestApi',
      path: 'attendee',
      options: {
        body: {
          meetingId: meetingId,
          externalUserId: externalUserId,
        }
      }
    });

    const { body } = await restOperation.response;
    const response = await body.json();
    return response.data;
  } catch (error) {
    console.log('POST call failed: ', JSON.parse(error.response.body));
  }
}

export async function createRecording(meetingId) {
  const response = await fetch(`${API_URL}/start-recording`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      meetingId,
    }),
  });

  const data = await response.json();
  return data.pipeline;
}

export async function stopRecording(mediaPipelineId) {
  const response = await fetch(`${API_URL}/stop-recording`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mediaPipelineId,
    }),
  });

  const data = await response.json();
  return data.pipeline;
}
