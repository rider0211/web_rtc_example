import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [rtspUrl, setRtspUrl] = useState("");
  const [rtpPort, setRtpPort] = useState("");
  const [streamActive, setStreamActive] = useState(false);
  const videoRef = useRef(null);

  const handleAddCamera = async () => {
    const response = await fetch("http://127.0.0.1:5000/api/add_camera", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rtsp_url: rtspUrl,
        rtp_port: rtpPort,
      }),
    });

    if (response.ok) {
      alert("Camera added successfully");
      startWebRTCStream();
    } else {
      alert("Failed to add camera");
    }
  };

  const handleStopCamera = async () => {
    const response = await fetch("http://127.0.0.1:5000/api/stop_camera", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rtsp_url: rtspUrl,
      }),
    });

    if (response.ok) {
      alert("Camera stopped successfully");
      setStreamActive(false);
    } else {
      alert("Failed to stop camera");
    }
  };

  const startWebRTCStream = async () => {
    const pc = new RTCPeerConnection();

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const response = await fetch("http://127.0.0.1:5000/api/webrtc_offer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sdp: pc.localDescription.sdp,
      }),
    });

    const data = await response.json();
    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

    pc.ontrack = (event) => {
      videoRef.current.srcObject = event.streams[0];
      setStreamActive(true);
    };
  };

  return (
    <div className="App">
      <h1>RTSP to WebRTC Livestream</h1>

      <div>
        <label>RTSP URL:</label>
        <input
          type="text"
          value={rtspUrl}
          onChange={(e) => setRtspUrl(e.target.value)}
        />
      </div>

      <div>
        <label>RTP Port:</label>
        <input
          type="text"
          value={rtpPort}
          onChange={(e) => setRtpPort(e.target.value)}
        />
      </div>

      <button onClick={handleAddCamera}>Start Stream</button>
      <button onClick={handleStopCamera}>Stop Stream</button>

      {streamActive && (
        <div>
          <h3>Live Stream</h3>
          <video ref={videoRef} autoPlay playsInline controls />
        </div>
      )}
    </div>
  );
}

export default App;
