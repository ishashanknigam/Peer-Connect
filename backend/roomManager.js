// Import moment for time formatting
const moment = require("moment");

// In-memory storage for rooms and user states
let rooms = {}; // { roomid: [socketId1, socketId2, ...] }
let socketroom = {}; // { socketId: roomid }
let socketname = {}; // { socketId: username }
let micSocket = {}; // { socketId: "on" | "off" }
let videoSocket = {}; // { socketId: "on" | "off" }

// The main object that manages all room/user actions
const roomManager = {
  // Called when a user joins a room
  joinRoom(socket, roomid, username) {
    // Add user to the room
    socket.join(roomid);

    // Track which room and username this socket belongs to
    socketroom[socket.id] = roomid;
    socketname[socket.id] = username;

    // Set mic and video to 'on' by default
    micSocket[socket.id] = "on";
    videoSocket[socket.id] = "on";

    // If the room already exists, add user and notify others
    if (rooms[roomid] && rooms[roomid].length > 0) {
      rooms[roomid].push(socket.id);
      // Notify others in the room that a new user joined
      socket
        .to(roomid)
        .emit(
          "message",
          `${username} joined the room.`,
          "System",
          moment().format("h:mm a")
        );

      // Send the list of other users and their states to the new user
      socket.emit(
        "join room",
        rooms[roomid].filter((pid) => pid != socket.id),
        socketname,
        micSocket,
        videoSocket
      );
    } else {
      // If room doesn't exist, create it and add the user
      rooms[roomid] = [socket.id];
      // No other users to send
      socket.emit("join room", null, null, null, null);
    }

    // Update everyone in the room with the new user count
    socket.to(roomid).emit("user count", rooms[roomid].length);
  },

  // Handle mic/video actions (mute/unmute, video on/off)
  handleAction(socket, msg) {
    if (msg == "mute") micSocket[socket.id] = "off";
    else if (msg == "unmute") micSocket[socket.id] = "on";
    else if (msg == "videoon") videoSocket[socket.id] = "on";
    else if (msg == "videooff") videoSocket[socket.id] = "off";

    // Notify others in the room about the action
    socket.to(socketroom[socket.id]).emit("action", msg, socket.id);
  },

  // Handle sending a video offer (WebRTC signaling)
  handleVideoOffer(socket, offer, sid) {
    socket
      .to(sid)
      .emit(
        "video-offer",
        offer,
        socket.id,
        socketname[socket.id],
        micSocket[socket.id],
        videoSocket[socket.id]
      );
  },

  // Handle sending a video answer (WebRTC signaling)
  handleVideoAnswer(socket, answer, sid) {
    socket.to(sid).emit("video-answer", answer, socket.id);
  },

  // Handle sending ICE candidates (WebRTC signaling)
  handleIceCandidate(socket, candidate, sid) {
    socket.to(sid).emit("new icecandidate", candidate, socket.id);
  },

  // Handle chat messages
  handleMessage(socket, msg, username, roomid) {
    // Send message to everyone else in the room
    socket.to(roomid).emit("message", msg, username, moment().format("h:mm a"));
    // Echo message back to sender
    socket.emit("message", msg, username, moment().format("h:mm a"));
  },

  // Handle user disconnecting from the room
  handleDisconnect(socket) {
    if (!socketroom[socket.id]) return;

    // Notify others that the user left
    socket
      .to(socketroom[socket.id])
      .emit(
        "message",
        `${socketname[socket.id]} left the chat.`,
        `System`,
        moment().format("h:mm a")
      );

    // Remove the user from the peer list
    socket.to(socketroom[socket.id]).emit("remove peer", socket.id);

    // Remove the user from the room's user list
    var index = rooms[socketroom[socket.id]].indexOf(socket.id);
    rooms[socketroom[socket.id]].splice(index, 1);

    // Update user count for the room
    socket
      .to(socketroom[socket.id])
      .emit("user count", rooms[socketroom[socket.id]].length);

    // Clean up user state
    delete socketroom[socket.id];
  },
};

// Export the roomManager object so it can be used in other files
module.exports = roomManager;
