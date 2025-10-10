const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const path = require("path");

const PORT = process.env.PORT || 3030;

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

app.use(cors());
// app.use(express.static(path.join(__dirname, "../public")));

const roomManager = require("./roomManager");
require("./socketHandlers")(io, roomManager);

server.listen(PORT, () =>
  console.log(`Server is up and running on port ${PORT}`)
);
