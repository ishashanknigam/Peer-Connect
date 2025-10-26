<div align="center">

# 🎥 PeerConnect

### _Real-Time Video Conferencing Platform_

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.5-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Enabled-FF6B6B?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org/)

_A modern, peer-to-peer video conferencing solution with real-time chat and screen sharing._

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Tech Stack](#️-tech-stack)
- [Architecture](#️-architecture)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 🎯 Overview

**PeerConnect** is a real-time video conferencing platform built with WebRTC for peer-to-peer connections, ensuring ultra-low latency without expensive media servers.

**Key Highlights:**

- 🚀 Direct P2P connections with <500ms latency
- 🔒 Privacy-first architecture
- 📱 Responsive design for desktop and mobile
- ⚡ Real-time messaging and state sync

---

## ✨ Features

- **Video Conferencing** - Multi-party calls (2-6 participants), responsive grid, pin/unpin
- **Screen Sharing** - Full screen/window sharing with auto-pin
- **Real-Time Chat** - Instant messaging with timestamps
- **Audio/Video Controls** - Mute/unmute, camera toggle, visual indicators
- **Room Management** - Unique room codes, easy join/leave, user count

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v20.x or higher)
- **npm** (v10.x or higher)

### Installation

```bash
# Clone repository
git clone https://github.com/ishashanknigam/Peer_Connect.git
cd peerconnect

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start backend (Terminal 1)
cd backend
npm start

# Start frontend (Terminal 2)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🛠️ Tech Stack

### Frontend

- **React** 19.1.0 - UI library
- **Vite** 7.0.4 - Build tool
- **Tailwind CSS** 4.1.11 - Styling
- **Socket.IO Client** 4.8.1 - Real-time communication
- **React Router** 7.7.1 - Routing

### Backend

- **Node.js** 20 - Runtime
- **Express** 4.19.2 - Web framework
- **Socket.IO** 4.7.5 - WebSocket server
- **Moment.js** 2.30.1 - Date formatting

### Core

- **WebRTC** - P2P audio/video
- **Socket.IO** - Real-time events
- **STUN** - NAT traversal

---

## 🏗️ Architecture

```
Client Browser (React + Vite)
        ↕
Socket.IO (WebSocket)
        ↕
Backend Server (Express + Socket.IO - Port 3030)
        ↕
WebRTC Signaling
        ↕
Browser A ←━━━ P2P Media ━━━→ Browser B
```

**Flow:**

1. Client connects via Socket.IO to backend
2. User creates/joins room with UUID
3. WebRTC peer connections established
4. Media streams flow directly between browsers
5. Server only handles signaling, not media

---

## 📁 Project Structure

```
PeerConnect/
├── backend/
│   ├── server.js           # Express + Socket.IO server
│   ├── roomManager.js      # Room/user state management
│   ├── socketHandlers.js   # Socket event handlers
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx     # Landing page
│   │   │   └── RoomPage.jsx     # Video conference
│   │   ├── components/
│   │   │   ├── VideoGrid.jsx    # Video layout
│   │   │   ├── ChatBox.jsx      # Chat interface
│   │   │   └── FooterControls.jsx # Controls
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## 📄 License

This project is licensed under the **ISC License**.

**Author:** Shashank

---

<div align="center">

**⭐ If you found this helpful, please give it a star!**

[⬆ back to top](#-peerconnect)

</div>
