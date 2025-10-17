module.exports = function (io, roomManager) {
  // Listen for new client connections
  io.on("connection", (socket) => {
    // When a user joins a room, call roomManager.joinRoom
    socket.on("join room", (roomid, username) => {
      roomManager.joinRoom(socket, roomid, username);
    });

    // When a user performs an action (mute/unmute/video on/off)
    socket.on("action", (msg) => {
      roomManager.handleAction(socket, msg);
    });

    // When a user sends a WebRTC video offer to another peer
    socket.on("video-offer", (offer, sid) => {
      roomManager.handleVideoOffer(socket, offer, sid);
    });

    // When a user sends a WebRTC video answer to another peer
    socket.on("video-answer", (answer, sid) => {
      roomManager.handleVideoAnswer(socket, answer, sid);
    });

    // When a user sends a new ICE candidate (WebRTC networking info)
    socket.on("new icecandidate", (candidate, sid) => {
      roomManager.handleIceCandidate(socket, candidate, sid);
    });

    // When a user sends a chat message
    socket.on("message", (msg, username, roomid) => {
      roomManager.handleMessage(socket, msg, username, roomid);
    });

    // When a user disconnects (closes tab or leaves)
    socket.on("disconnect", () => {
      roomManager.handleDisconnect(socket);
    });
  });
};
