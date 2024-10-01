import React, 
{ 
 // useState 
} 
from 'react';
import { getMeeting, createAttendee } from './api';
import {
  DefaultDeviceController,
  DefaultMeetingSession,
  ConsoleLogger,
  LogLevel,
  MeetingSessionConfiguration,
} from 'amazon-chime-sdk-js';
//import Modal from './Modal'; // Import the Modal component
import './LiveViewer.css';

function LiveViewer() {
  // const [audioOutputDevices, setAudioOutputDevices] = useState([]);
  // const [selectedAudioOutput, setSelectedAudioOutput] = useState('');
  // const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility

  const joinMeeting = async () => {
    const meetingId = prompt("Enter meeting ID:");
    if (!meetingId) {
      alert("Meeting ID is required");
      return;
    }
    const meeting = await getMeeting(meetingId);
    const attendee = await createAttendee(meetingId, `listener-${Date.now()}`);  
    initializeMeetingSession(meeting, attendee);
  };

  const initializeMeetingSession = (meeting, attendee) => {
    if (!meeting || !attendee) {
      console.error("Invalid meeting or attendee information");
      return;
    }

    const logger = new ConsoleLogger('ChimeMeetingLogs', LogLevel.INFO);
    const deviceController = new DefaultDeviceController(logger);
    const meetingSessionConfiguration = new MeetingSessionConfiguration(meeting, attendee);
    const meetingSession = new DefaultMeetingSession(meetingSessionConfiguration, logger, deviceController);

    selectSpeaker(meetingSession);
    const audioElement = document.getElementById('audioElementListener');
    if (audioElement) {
      meetingSession.audioVideo.bindAudioElement(audioElement);
    } else {
      console.error("Audio element not found");
    }

    meetingSession.audioVideo.start();
  };

  const selectSpeaker = async (meetingSession) => {
    const audioOutputDevices = await meetingSession.audioVideo.listAudioOutputDevices();
    //setAudioOutputDevices(audioOutputDevices);
    //setSelectedAudioOutput(audioOutputDevices[0]?.deviceId || ''); // Set initial audio output device

    if (audioOutputDevices.length > 0) {
      await meetingSession.audioVideo.chooseAudioOutput(audioOutputDevices[0].deviceId);
    } else {
      console.log('No speaker devices found');
    }
  };

  // const handleAudioOutputChange = async (event) => {
  //   const deviceId = event.target.value;
  //   setSelectedAudioOutput(deviceId);
  //   console.log("Selected speaker device:", deviceId);

  //   const meetingSession = new DefaultMeetingSession(); // Retrieve the current session
  //   await meetingSession.audioVideo.chooseAudioOutput(deviceId);
  // };

  return (
    <div className="live-viewer-container">
      <audio id="audioElementListener" controls autoPlay className="audio-player" />
      <br />
      <button className="join-btn" onClick={() => {
        joinMeeting(); // Join the meeting
        //setIsModalOpen(true); // Open modal after joining
      }}>
        Join
      </button>
      {/* <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} // Close modal
        audioOutputDevices={audioOutputDevices}
        selectedAudioOutput={selectedAudioOutput}
        handleAudioOutputChange={handleAudioOutputChange}
      /> */}
    </div>
  );
}

export default LiveViewer;
