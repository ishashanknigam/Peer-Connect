import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaPhoneSlash,
} from "react-icons/fa";

export default function FooterControls({
  audioAllowed,
  videoAllowed,
  toggleAudio,
  toggleVideo,
  leaveCall,
  toggleScreenShare,
  isScreenSharing,
  roomid,
}) {
  return (
    <div className="w-full flex justify-between items-center px-8 py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-slate-900 backdrop-blur-xl shadow-xl rounded-2xl border border-slate-700">
      {/* Room Code */}
      <div className="flex items-center gap-2">
        <div className="px-4 py-2 bg-gray-800 border border-slate-700 rounded-l-xl text-sky-300 font-bold shadow">
          {roomid}
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(roomid);
            alert("Room code copied!");
          }}
          className="bg-gradient-to-r from-sky-400 via-fuchsia-500 to-sky-400 text-white px-4 py-2 rounded-r-xl font-semibold shadow hover:scale-105 transition-all duration-200 active:scale-95"
        >
          Copy
        </button>
      </div>

      {/* Controls */}
      <div className="flex gap-6">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full shadow-lg text-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 ${
            audioAllowed
              ? "bg-sky-400 text-white hover:bg-sky-500"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          {audioAllowed ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full shadow-lg text-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 ${
            videoAllowed
              ? "bg-sky-400 text-white hover:bg-sky-500"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          {videoAllowed ? <FaVideo /> : <FaVideoSlash />}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`p-4 rounded-full shadow-lg text-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 ${
            isScreenSharing
              ? "bg-fuchsia-500 text-white hover:bg-fuchsia-600"
              : "bg-gray-800 text-sky-300 hover:bg-gray-700"
          }`}
        >
          <FaDesktop />
        </button>

        <button
          onClick={leaveCall}
          className="p-4 rounded-full shadow-lg text-xl bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
        >
          <FaPhoneSlash />
        </button>
      </div>
    </div>
  );
}
