import { useEffect, useRef, useState } from "react";

export default function VideoGrid({
  myStream,
  username,
  remoteStreams,
  micInfo,
  videoInfo,
}) {
  const myVideoRef = useRef(null);
  const [pinnedVideo, setPinnedVideo] = useState(null);

  useEffect(() => {
    if (myStream && myVideoRef.current) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  const screenStreams = remoteStreams.filter((s) => s.type === "screen");
  const cameraStreams = [
    { id: "me", name: `${username} (You)`, stream: myStream },
    ...remoteStreams.filter((s) => s.type !== "screen"),
  ];

  // ✅ Auto-pin other users' screen share
  useEffect(() => {
    const otherScreen = screenStreams.find((s) => s.id !== "me-screen");
    if (otherScreen) {
      setPinnedVideo(otherScreen);
    } else if (pinnedVideo && pinnedVideo.type === "screen") {
      setPinnedVideo(null); // Unpin when screen sharing stops
    }
  }, [screenStreams]);

  const handlePinVideo = (user) => {
    if (pinnedVideo && pinnedVideo.id === user.id) {
      setPinnedVideo(null);
    } else {
      setPinnedVideo(user);
    }
  };

  // Responsive Video Grid for 2-6 users
  // Force grid to always be 2 rows by 4 columns
  // Responsive grid: auto-fit columns, fill space
  // Google Meet style: auto-fit columns, min size, fill space
  const getGridClass = () => {
    return "grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] auto-rows-fr";
  };

  return (
    <div className="relative w-full h-full min-h-[80vh] bg-black rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300">
      {pinnedVideo ? (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <video
            autoPlay
            playsInline
            muted={pinnedVideo.id === "me"}
            ref={(el) => {
              if (el && pinnedVideo.stream) {
                el.srcObject = pinnedVideo.stream;
              }
            }}
            className="w-full h-full object-contain bg-black rounded-2xl shadow-xl border-4 border-fuchsia-500"
          />

          <div className="absolute bottom-4 left-4 text-base bg-gray-900 bg-opacity-80 text-white px-3 py-1 rounded-xl shadow-lg">
            {pinnedVideo.type === "screen"
              ? `🖥️ ${pinnedVideo.name}`
              : pinnedVideo.name}
          </div>

          {/* Thumbnails row for quick switching */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10 overflow-x-auto max-w-[90vw] p-2">
            {cameraStreams.map((user) => (
              <div
                key={user.id}
                className={`relative w-24 h-20 rounded-lg overflow-hidden border-2 border-white bg-black cursor-pointer flex-shrink-0 transition-transform duration-200 hover:scale-105 ${
                  pinnedVideo.id === user.id ? "ring-4 ring-fuchsia-500" : ""
                }`}
                onDoubleClick={() => handlePinVideo(user)}
              >
                <video
                  autoPlay
                  playsInline
                  muted={user.id === "me" || !micInfo[user.id]}
                  ref={(el) => {
                    if (el && user.stream) {
                      el.srcObject = user.stream;
                    }
                  }}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute bottom-1 left-1 text-xs bg-gray-900 text-white px-1 rounded">
                  {user.name}
                </div>
                {user.id !== "me" && !videoInfo[user.id] && (
                  <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-60 text-xs">
                    Video Off
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : screenStreams.length > 0 ? (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <video
            autoPlay
            playsInline
            muted
            ref={(el) => {
              if (el && screenStreams[0].stream) {
                el.srcObject = screenStreams[0].stream;
              }
            }}
            className="w-full h-full object-contain bg-black rounded-2xl shadow-xl border-4 border-fuchsia-500"
          />
          <div className="absolute bottom-4 left-4 text-base bg-gray-900 bg-opacity-80 text-white px-3 py-1 rounded-xl shadow-lg">
            🖥️ {screenStreams[0].name}
          </div>

          {/* Thumbnails row for quick switching */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10 overflow-x-auto max-w-[90vw] p-2">
            {cameraStreams.map((user) => (
              <div
                key={user.id}
                className={`relative w-24 h-20 rounded-lg overflow-hidden border-2 border-white bg-black cursor-pointer flex-shrink-0 transition-transform duration-200 hover:scale-105`}
                onDoubleClick={() => handlePinVideo(user)}
              >
                <video
                  autoPlay
                  playsInline
                  muted={user.id === "me" || !micInfo[user.id]}
                  ref={(el) => {
                    if (el && user.stream) {
                      el.srcObject = user.stream;
                    }
                  }}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute bottom-1 left-1 text-xs bg-gray-900 text-white px-1 rounded">
                  {user.name}
                </div>
                {user.id !== "me" && !videoInfo[user.id] && (
                  <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-60 text-xs">
                    Video Off
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`w-full h-full p-4 ${getGridClass()} gap-4 transition-all duration-300`}
          style={{ display: "grid" }}
        >
          {/* My video tile */}
          <div
            className="relative bg-gray-900 rounded-2xl overflow-hidden cursor-pointer shadow-lg border-2 border-slate-700 transition-transform duration-200 hover:scale-105"
            onDoubleClick={() =>
              handlePinVideo({ id: "me", name: "You", stream: myStream })
            }
          >
            <video
              ref={myVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover rounded-2xl"
            />
            <div className="absolute bottom-2 left-2 text-xs bg-gray-900 text-white px-2 py-1 rounded-xl shadow">
              You
            </div>
          </div>
          
          {/* Other user tiles */}
          {cameraStreams
            .filter((c) => c.id !== "me")
            .map((user) => (
              <div
                key={user.id}
                className="relative bg-gray-900 rounded-2xl overflow-hidden cursor-pointer shadow-lg border-2 border-slate-700 transition-transform duration-200 hover:scale-105"
                onDoubleClick={() => handlePinVideo(user)}
              >
                <video
                  autoPlay
                  playsInline
                  muted={!micInfo[user.id]}
                  ref={(el) => {
                    if (el && user.stream) {
                      el.srcObject = user.stream;
                    }
                  }}
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute bottom-2 left-2 text-xs bg-gray-900 text-white px-2 py-1 rounded-xl shadow">
                  {user.name}
                </div>
                {!videoInfo[user.id] && (
                  <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-60 text-xs rounded-2xl">
                    Video Off
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
