// React hooks and navigation
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// Icons for UI controls
import { Mic, MicOff, Video, VideoOff, Users2, Rocket } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate(); // For navigation between pages
  const videoRef = useRef(null); // Reference to the video element for webcam preview

  // State for mic and camera toggle
  const [micAllowed, setMicAllowed] = useState(true);
  const [camAllowed, setCamAllowed] = useState(true);

  // State for room code input
  const [roomCode, setRoomCode] = useState("");
  // Holds the user's local webcam/microphone stream
  const [stream, setStream] = useState(null);

  // On mount, start webcam/mic. On unmount, stop all tracks.
  useEffect(() => {
    startMedia({ video: true, audio: true });
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line
  }, []);

  // Start webcam/mic with given constraints
  const startMedia = (constraints) => {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((localStream) => {
        // Show webcam preview
        if (videoRef.current) videoRef.current.srcObject = localStream;
        setStream(localStream);
      })
      .catch((err) => console.error("Media error:", err));
  };

  // Toggle camera on/off
  const toggleCamera = () => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    setCamAllowed(videoTrack.enabled);
  };

  // Toggle mic on/off
  const toggleMic = () => {
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    setMicAllowed(audioTrack.enabled);
  };

  // Create a new room with a random code and navigate to it
  const createRoom = () => {
    const newRoom = uuidv4();
    navigate(`/room/${newRoom}`);
  };

  // Join an existing room by code
  const joinRoom = () => {
    if (!roomCode.trim()) return alert("Enter a valid room code!");
    navigate(`/room/${roomCode.trim()}`);
  };

  // Generate a simple random room code
  const uuidv4 = () => {
    return "xxyxyxxyx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Render the main UI
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-tr from-neutral-900 via-gray-900 to-slate-900 relative overflow-hidden">
      {/* Header Bar */}
      <header className="w-full py-8 px-12 flex justify-between items-center bg-neutral-900/80 backdrop-blur-lg shadow-lg z-10 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-4xl font-extrabold text-sky-300 tracking-tight">
            PeerConnect
          </span>
        </div>
      </header>

      {/* Decorative SVG Graphics for background */}
      <svg
        className="absolute top-0 left-0 w-96 h-96 opacity-20 pointer-events-none"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#0ea5e9"
          d="M44.8,-67.2C56.7,-59.7,62.7,-41.2,67.2,-24.2C71.7,-7.2,74.7,8.3,70.2,22.2C65.7,36.1,53.7,48.4,39.2,56.7C24.7,65,7.8,69.3,-7.2,71.2C-22.2,73.1,-35.3,72.7,-46.2,65.2C-57.1,57.7,-65.8,43.1,-68.2,28.1C-70.6,13.1,-66.7,-2.3,-61.2,-16.2C-55.7,-30.1,-48.7,-42.5,-38.2,-50.2C-27.7,-57.9,-13.9,-60.9,2.1,-63.4C18.1,-65.9,36.2,-67.7,44.8,-67.2Z"
          transform="translate(100 100)"
        />
      </svg>
      <svg
        className="absolute bottom-0 right-0 w-96 h-96 opacity-10 pointer-events-none"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#f472b6"
          d="M44.8,-67.2C56.7,-59.7,62.7,-41.2,67.2,-24.2C71.7,-7.2,74.7,8.3,70.2,22.2C65.7,36.1,53.7,48.4,39.2,56.7C24.7,65,7.8,69.3,-7.2,71.2C-22.2,73.1,-35.3,72.7,-46.2,65.2C-57.1,57.7,-65.8,43.1,-68.2,28.1C-70.6,13.1,-66.7,-2.3,-61.2,-16.2C-55.7,-30.1,-48.7,-42.5,-38.2,-50.2C-27.7,-57.9,-13.9,-60.9,2.1,-63.4C18.1,-65.9,36.2,-67.7,44.8,-67.2Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Main Layout: Sidebar (webcam) + Main Content */}
      <div className="flex flex-1 w-full max-w-7xl mx-auto mt-10 gap-12">
        {/* Sidebar: Webcam preview and controls */}
        <aside className="w-1/3 flex flex-col items-center justify-center bg-neutral-900/70 rounded-2xl shadow-xl p-10 gap-8 border border-slate-800 backdrop-blur-xl">
          <div className="relative w-96 h-96 mb-4">

            {/* Webcam video preview */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-96 h-96 rounded-2xl object-cover border-4 border-sky-400 shadow-2xl bg-neutral-800/60 backdrop-blur-lg"
              style={{
                boxShadow: "0 8px 32px rgba(14,165,233,0.25)",
              }}
            ></video>
            
            {/* Mic and Camera toggle buttons */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6">
              <button
                onClick={toggleMic}
                className={`rounded-full w-14 h-14 flex items-center justify-center text-white shadow-lg transition-transform duration-200 hover:scale-110 ${
                  micAllowed ? "bg-sky-400/80" : "bg-fuchsia-600/80"
                } border-2 border-slate-800 backdrop-blur-lg`}
                style={{
                  boxShadow: "0 4px 16px rgba(14,165,233,0.25)",
                }}
              >
                {micAllowed ? <Mic size={28} /> : <MicOff size={28} />}
              </button>
              <button
                onClick={toggleCamera}
                className={`rounded-full w-14 h-14 flex items-center justify-center text-white shadow-lg transition-transform duration-200 hover:scale-110 ${
                  camAllowed ? "bg-sky-400/80" : "bg-fuchsia-600/80"
                } border-2 border-slate-800 backdrop-blur-lg`}
                style={{
                  boxShadow: "0 4px 16px rgba(14,165,233,0.25)",
                }}
              >
                {camAllowed ? <Video size={28} /> : <VideoOff size={28} />}
              </button>
            </div>
          </div>
          <div className="text-center text-sky-400 text-lg">Webcam Preview</div>
        </aside>

        {/* Main Content: Welcome, create/join room controls */}
        <main className="flex-1 flex flex-col justify-center items-center gap-12">
          {/* App Title */}
          <h1 className="text-6xl font-black text-sky-300 mb-6 tracking-tight text-center">
            Welcome to PeerConnect
          </h1>
          {/* App Description */}
          <p className="text-2xl text-fuchsia-300 mb-8 text-center max-w-xl">
            Create or join a PeerConnect room in seconds. Secure, fast, and
            beautifully designed for you and your team.
          </p>

          {/* Room controls: create or join */}
          <div className="w-full max-w-lg flex flex-col gap-8 items-center">
            {/* Create Room Button */}
            <button
              onClick={createRoom}
              className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-sky-400 via-fuchsia-500 to-sky-400 text-white text-xl font-bold shadow-xl hover:scale-105 transition animate-pop flex items-center justify-center gap-4 border-2 border-slate-800 backdrop-blur-lg"
              style={{
                boxShadow: "0 8px 32px rgba(236,72,153,0.25)",
              }}
            >
              <Rocket size={24} className="animate-bounce" /> Create Room
            </button>
            {/* Room Code Input */}
            <input
              type="text"
              placeholder="Enter Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="w-full px-8 py-5 rounded-2xl border-2 border-fuchsia-400 text-2xl font-semibold text-center focus:outline-none focus:ring-2 focus:ring-sky-400 transition bg-neutral-800/60 text-sky-300 placeholder-fuchsia-400 backdrop-blur-lg"
            />
            {/* Join Room Button */}
            <button
              onClick={joinRoom}
              className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 via-sky-400 to-fuchsia-500 text-white text-xl font-bold shadow-xl hover:scale-105 transition animate-pop flex items-center justify-center gap-4 border-2 border-slate-800 backdrop-blur-lg"
              style={{
                boxShadow: "0 8px 32px rgba(236,72,153,0.25)",
              }}
            >
              <Users2 size={24} className="animate-bounce" /> Join Room
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
