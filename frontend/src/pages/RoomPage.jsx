import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import VideoGrid from "../components/VideoGrid";
import ChatBox from "../components/ChatBox";
import FooterControls from "../components/FooterControls";

const socket = io("http://localhost:3030");

export default function RoomPage() {
  const { id: roomid } = useParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [showOverlay, setShowOverlay] = useState(true);
  const [messageInput, setMessageInput] = useState("");

  const [remoteStreams, setRemoteStreams] = useState([]);
  const [micInfo, setMicInfo] = useState({});
  const [videoInfo, setVideoInfo] = useState({});
  const [videoAllowed, setVideoAllowed] = useState(true);
  const [audioAllowed, setAudioAllowed] = useState(true);

  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenStreamRef = useRef(null);

  const myStreamRef = useRef(null);
  const peersRef = useRef({});
  const socketname = useRef({});
  const micState = useRef({});
  const videoState = useRef({});

  useEffect(() => {
    socket.on("join room", handleJoinRoom);
    socket.on("video-offer", handleVideoOffer);
    socket.on("video-answer", handleVideoAnswer);
    socket.on("new icecandidate", handleNewICECandidate);
    socket.on("action", handleActionUpdate);
    socket.on("remove peer", (peerId) => {
      setRemoteStreams((prev) => prev.filter((s) => !s.id.startsWith(peerId)));
      delete peersRef.current[peerId];
      // Remove from micInfo and videoInfo
      setMicInfo((prev) => {
        const updated = { ...prev };
        delete updated[peerId];
        return updated;
      });
      setVideoInfo((prev) => {
        const updated = { ...prev };
        delete updated[peerId];
        return updated;
      });
    });
    socket.on("all users", (users, names, micStates, videoStates, sharerId) => {
      // When a new user joins, connect to all existing users
      if (!users) return;
      users.forEach(async (peerId) => {
        socketname.current[peerId] = names[peerId];
        micState.current[peerId] = micStates[peerId];
        videoState.current[peerId] = videoStates[peerId];
        const pc = createPeer(peerId);
        peersRef.current[peerId] = pc;
        // Use screen stream if sharing, otherwise camera
        const sendTracks =
          isScreenSharing && screenStreamRef.current
            ? screenStreamRef.current
            : myStreamRef.current;
        sendTracks
          .getTracks()
          .forEach((track) => pc.addTrack(track, sendTracks));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("video-offer", offer, peerId);
        setMicInfo((prev) => ({
          ...prev,
          [peerId]: micStates[peerId] === "on",
        }));
        setVideoInfo((prev) => ({
          ...prev,
          [peerId]: videoStates[peerId] === "on",
        }));
      });
    });
    return () => {
      socket.off("join room");
      socket.off("video-offer");
      socket.off("video-answer");
      socket.off("new icecandidate");
      socket.off("action");
      socket.off("remove peer");
      socket.off("all users");
    };
  }, []);

  const joinRoom = async () => {
    if (!username.trim()) return alert("Enter your name!");
    setShowOverlay(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      myStreamRef.current = stream;
      setVideoAllowed(true);
      setAudioAllowed(true);

      socket.emit("join room", roomid, username, isScreenSharing);
    } catch (err) {
      console.error("Media Error:", err);
    }
  };

  const handleJoinRoom = (peers, names, micStates, videoStates, sharerId) => {
    if (!peers) return;

    peers.forEach(async (peerId) => {
      socketname.current[peerId] = names[peerId];
      micState.current[peerId] = micStates[peerId];
      videoState.current[peerId] = videoStates[peerId];

      const pc = createPeer(peerId);
      peersRef.current[peerId] = pc;

      // ✅ Send screen track if you are sharing
      const sendTracks =
        isScreenSharing && screenStreamRef.current
          ? screenStreamRef.current
          : myStreamRef.current;

      sendTracks.getTracks().forEach((track) => pc.addTrack(track, sendTracks));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("video-offer", offer, peerId);

      setMicInfo((prev) => ({ ...prev, [peerId]: micStates[peerId] === "on" }));
      setVideoInfo((prev) => ({
        ...prev,
        [peerId]: videoStates[peerId] === "on",
      }));
    });
  };

  const createPeer = (peerId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("new icecandidate", event.candidate, peerId);
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      const isScreen = remoteStream
        .getVideoTracks()[0]
        ?.label.toLowerCase()
        .includes("screen");

      setRemoteStreams((prev) => {
        const exists = prev.find(
          (s) => s.id === peerId + (isScreen ? "-screen" : "")
        );
        if (exists) return prev;

        return [
          ...prev,
          {
            id: peerId + (isScreen ? "-screen" : ""),
            name: socketname.current[peerId] || "User",
            stream: remoteStream,
            type: isScreen ? "screen" : "camera",
          },
        ];
      });
    };

    return pc;
  };

  const handleVideoOffer = async (offer, callerId, callerName, mic, video) => {
    socketname.current[callerId] = callerName;
    micState.current[callerId] = mic;
    videoState.current[callerId] = video;

    const pc = createPeer(callerId);
    peersRef.current[callerId] = pc;

    const sendTracks =
      isScreenSharing && screenStreamRef.current
        ? screenStreamRef.current
        : myStreamRef.current;

    sendTracks.getTracks().forEach((track) => pc.addTrack(track, sendTracks));

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("video-answer", answer, callerId);

    setMicInfo((prev) => ({ ...prev, [callerId]: mic === "on" }));
    setVideoInfo((prev) => ({ ...prev, [callerId]: video === "on" }));
  };

  const handleVideoAnswer = async (answer, peerId) => {
    const pc = peersRef.current[peerId];
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleNewICECandidate = async (candidate, peerId) => {
    const pc = peersRef.current[peerId];
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("ICE Error:", e);
      }
    }
  };

  const handleActionUpdate = (msg, peerId) => {
    if (msg === "mute") setMicInfo((prev) => ({ ...prev, [peerId]: false }));
    else if (msg === "unmute")
      setMicInfo((prev) => ({ ...prev, [peerId]: true }));
    else if (msg === "videooff")
      setVideoInfo((prev) => ({ ...prev, [peerId]: false }));
    else if (msg === "videoon")
      setVideoInfo((prev) => ({ ...prev, [peerId]: true }));
  };

  const handleRemovePeer = (peerId) => {
    setRemoteStreams((prev) => prev.filter((s) => !s.id.startsWith(peerId)));
    delete peersRef.current[peerId];
  };

  const toggleVideo = () => {
    if (!myStreamRef.current) return;
    const track = myStreamRef.current.getVideoTracks()[0];
    track.enabled = !track.enabled;
    setVideoAllowed(track.enabled);
    socket.emit("action", track.enabled ? "videoon" : "videooff");
  };

  const toggleAudio = () => {
    if (!myStreamRef.current) return;
    const track = myStreamRef.current.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setAudioAllowed(track.enabled);
    socket.emit("action", track.enabled ? "unmute" : "mute");
  };

  const leaveCall = () => {
    navigate("/");
    socket.disconnect();
    if (myStreamRef.current)
      myStreamRef.current.getTracks().forEach((t) => t.stop());
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);

        // Replace track for existing peers
        for (let peerId in peersRef.current) {
          const sender = peersRef.current[peerId]
            .getSenders()
            .find((s) => s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        }

        // Update UI
        setRemoteStreams((prev) => [
          ...prev.filter((s) => s.id !== "me-screen"),
          {
            id: "me-screen",
            name: `${username} (You)`,
            stream: screenStream,
            type: "screen",
          },
        ]);

        screenStream.getVideoTracks()[0].onended = () => stopScreenShare();
      } catch (err) {
        console.error("Screen share error:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (!screenStreamRef.current) return;
    const cameraTrack = myStreamRef.current.getVideoTracks()[0];

    for (let peerId in peersRef.current) {
      const sender = peersRef.current[peerId]
        .getSenders()
        .find((s) => s.track.kind === "video");
      if (sender) {
        sender.replaceTrack(cameraTrack);
      }
    }

    screenStreamRef.current.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setIsScreenSharing(false);

    setRemoteStreams((prev) => prev.filter((s) => s.id !== "me-screen"));
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    socket.emit("chat message", messageInput, roomid);
    setMessageInput("");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 overflow-hidden">
      {showOverlay && (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 bg-opacity-95 z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-full max-w-sm border border-slate-700">
            <h2 className="font-bold text-2xl text-sky-300 mb-4">Welcome!</h2>
            <p className="text-gray-400 mb-6 text-center">
              Enter your name to join the room
            </p>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-xl border-2 border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 text-lg font-semibold mb-4 bg-gray-900 text-sky-300 placeholder-gray-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your Name"
              autoFocus
            />
            <button
              onClick={joinRoom}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-400 via-fuchsia-500 to-sky-400 text-white text-lg font-bold shadow-lg hover:scale-105 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
            >
              Join Room
            </button>
          </div>
        </div>
      )}
      <div className="relative w-3/4 bg-gray-900 p-4 flex flex-col justify-between h-full">
        <VideoGrid
          myStream={myStreamRef.current}
          username={username}
          remoteStreams={remoteStreams}
          micInfo={micInfo}
          videoInfo={videoInfo}
        />
        <FooterControls
          audioAllowed={audioAllowed}
          videoAllowed={videoAllowed}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          leaveCall={leaveCall}
          roomid={roomid}
          toggleScreenShare={toggleScreenShare}
          isScreenSharing={isScreenSharing}
        />
      </div>
      <div className="w-1/4 bg-gray-900 flex flex-col h-full border-l border-slate-800">
        <div className="flex items-center px-4 py-2 border-b border-slate-800 bg-gray-800">
          <div className="font-semibold text-sky-300">Chats</div>
        </div>
        <div
          className="flex-1 overflow-y-auto px-4 py-2"
          style={{ minHeight: 0 }}
        >
          <ChatBox socket={socket} username={username} roomid={roomid} />
        </div>
      </div>
    </div>
  );
}
