import React, { useState } from 'react';
import {
  createMeeting, 
  createAttendee,
  //createRecording,
  //stopRecording,
  //postItem,
  getMeeting,
} from './api';
import {
  DefaultDeviceController,
  DefaultMeetingSession,
  ConsoleLogger,
  LogLevel,
  MeetingSessionConfiguration,
} from 'amazon-chime-sdk-js';
import './StartLiveSession.css';  // Importing the new CSS file for responsiveness

function StartLiveSession() {
  const [meetingSession, setMeetingSession] = useState(null);
  const [meeting, setMeeting] = useState('');
  //const [mediaPipelineId, setMediaPipelineId] = useState('');
  const [selectedAudioInput, setSelectedAudioInput] = useState('');
  const [audioInputDevices, setAudioInputDevices] = useState([]);

  const startMeeting = async () => {
    const meeting = await createMeeting();  // Create a new meeting
    setMeeting(meeting);
    console.log(`Meeting: ${meeting.MeetingId}`);
    const getMeetingResult = await getMeeting(meeting.MeetingId);
    console.log("getMeetingResult", getMeetingResult);
    const attendee = await createAttendee(meeting.MeetingId, `host-${Date.now()}`);  // Create host attendee
    console.log(`Attendee: ${attendee.AttendeeId}`);
    initializeMeetingSession(meeting, attendee);  // Initialize host session to broadcast audio
    //startRecording(meeting.MeetingId);  // Start capture pipeline for recording
  };

  // const startRecording = async (meetingId) => {
  //   console.log(`Recording meeting: ${meetingId}`);
  //   const pipeline = await createRecording(meetingId);
  //   console.log(`Recording successfully: ${pipeline.MediaPipelineId}`);
  //   setMediaPipelineId(pipeline.MediaPipelineId);
  // };

  const stopMeeting = async () => {
    console.log("Audio video session stopped before", meetingSession.audioVideo);
    meetingSession.audioVideo.stop();
    console.log("Audio video session stopped after", meetingSession.audioVideo);
    // const pipelineConcat = await stopRecording(mediaPipelineId);
    // console.log("Stop Recording", pipelineConcat.MediaPipelineId);
  };

  const initializeMeetingSession = (meeting, attendee) => {
    const logger = new ConsoleLogger('ChimeMeetingLogs', LogLevel.INFO);
    const deviceController = new DefaultDeviceController(logger);
    const meetingSessionConfiguration = new MeetingSessionConfiguration(meeting, attendee);
    const meetingSession = new DefaultMeetingSession(meetingSessionConfiguration, logger, deviceController);
    setMeetingSession(meetingSession);
    selectMicrophone(meetingSession);
  };

  const selectMicrophone = async (meetingSession) => {
    const audioInputDevices = await meetingSession.audioVideo.listAudioInputDevices();
    console.log("audioInputDevices", audioInputDevices);
    if (!audioInputDevices || audioInputDevices.length === 0) {
      alert("No audio input devices were found. Please check your device.");
      return;
    }
    setAudioInputDevices(audioInputDevices);
    setSelectedAudioInput(audioInputDevices[0].deviceId);
  };

  const startLive = async () => {
    console.log("Selected audio input device", selectedAudioInput);
    await meetingSession.audioVideo.startAudioInput(selectedAudioInput);
    const muted = meetingSession.audioVideo.realtimeIsLocalAudioMuted();
    if (muted) {
      console.log('You are muted');
    } else {
      console.log('Other attendees can hear your audio');
    }

    try {
      const observer = {
        audioVideoDidStart: () => {
          console.log('Started');
        }
      };
      meetingSession.audioVideo.addObserver(observer);
      meetingSession.audioVideo.start();
      console.log("Audio video session started");
      collectStats(meetingSession);
    } catch (error) {
      console.error("Failed to start audio video session", error);
    }
  };

  const collectStats = async (meetingSession) => {
    const audioVideo = meetingSession.audioVideo;

    const reportStats = async () => {
      try {
        const stats = await audioVideo.getRTCPeerConnectionStats();
        if (!stats || stats.length === 0) {
          console.warn("No stats available");
          return;
        }
        stats.forEach(report => {
          console.log(`Report type: ${report.type}`);
          console.log(`Timestamp: ${report.timestamp}`);
          console.log(`ID: ${report.id}`);
          for (const [key, value] of Object.entries(report)) {
            console.log(`${key}: ${value}`);
          }
        });
      } catch (error) {
        console.error("Error fetching RTC stats:", error);
      }

      setTimeout(reportStats, 5000); 
    };

    setTimeout(reportStats, 1000); 
  };

  const handleAudioInputChange = (event) => {
    const deviceId = event.target.value;
    console.log("Device ID:", deviceId);
    setSelectedAudioInput(deviceId);
  };

  return (
    <div className="container">
      {!meeting && (
        <button onClick={startMeeting}>Start Live Session</button>
      )}
      {meeting && (
        <>
          <p>Meeting ID: {meeting.MeetingId}</p>
          <h3>Select Audio Input Device (Microphone)</h3>
          <select value={selectedAudioInput} onChange={handleAudioInputChange}>
            {audioInputDevices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
          {selectedAudioInput && (<button onClick={startLive}>Start</button>)}
          {selectedAudioInput && (<button onClick={stopMeeting}>Stop</button>)}
          {/* <button onClick={stopMeeting}>Stop</button> */}
        </>
      )}
    </div>
  );
}

export default StartLiveSession;
