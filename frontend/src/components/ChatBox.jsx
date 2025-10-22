import { useState, useEffect } from "react";

export default function ChatBox({ socket, username, roomid }) {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    socket.on("message", (m, sender, time) => {
      setMessages((prev) => [
        ...prev,
        { msg: m, sender, time, id: Date.now() },
      ]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (!msg.trim()) return;
    socket.emit("message", msg, username, roomid);
    setMsg("");
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700 backdrop-blur-xl">
      <div
        className="flex-1 p-4 overflow-y-auto custom-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Hide scrollbar for Webkit browsers */}
        <style>{`.custom-scrollbar::-webkit-scrollbar { display: none; }`}</style>

        {messages.map((c) => (
          <div
            key={c.id}
            className={`mb-4 flex flex-col ${
              c.sender === username ? "items-end" : "items-start"
            }`}
          >
            <div className="text-xs text-sky-400 mb-1">
              <span className="font-bold text-fuchsia-400">{c.sender}</span>
              <span className="ml-2 text-sky-300">{c.time}</span>
            </div>
            <div
              className={`inline-block px-4 py-2 rounded-2xl shadow-lg ${
                c.sender === username
                  ? "bg-gradient-to-r from-sky-400 via-fuchsia-500 to-sky-400 text-white"
                  : "bg-gray-800 text-sky-300"
              }`}
            >
              {c.msg}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-700 bg-gray-900 rounded-b-2xl flex flex-col gap-2">
        <input
          type="text"
          placeholder="Type message..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="w-full px-4 py-2 rounded-xl bg-gray-800 text-sky-300 text-base font-medium focus:outline-none focus:ring-2 focus:ring-fuchsia-400 border border-slate-700 placeholder-sky-400 shadow-inner"
        />
        <button
          onClick={sendMessage}
          className="w-full mt-1 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-400 via-fuchsia-500 to-sky-400 text-white font-bold text-base shadow-lg hover:scale-105 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}
