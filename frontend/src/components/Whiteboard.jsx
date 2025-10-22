import { useEffect, useRef, useState } from "react";

export default function Whiteboard({ socket }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("black");
  const [thickness, setThickness] = useState(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctxRef.current = ctx;

    socket.emit("getCanvas"); // request current canvas from server

    socket.on("draw", ({ x, y, color, thickness }) => {
      drawDot(x, y, color, thickness);
    });

    socket.on("clearBoard", () => {
      clearBoard();
    });

    socket.on("canvasImage", (dataUrl) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => ctx.drawImage(img, 0, 0);
    });

    return () => {
      socket.off("draw");
      socket.off("clearBoard");
      socket.off("canvasImage");
    };
  }, []);

  const startDrawing = (e) => {
    setDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setDrawing(false);
    ctxRef.current.beginPath();
    // send updated canvas to server
    socket.emit("store canvas", canvasRef.current.toDataURL());
  };

  const draw = (e) => {
    if (!drawing) return;
    const ctx = ctxRef.current;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    socket.emit("draw", { x, y, color, thickness });
  };

  const drawDot = (x, y, color, thickness) => {
    const ctx = ctxRef.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearBoard = () => {
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
  };

  const handleClearBoard = () => {
    clearBoard();
    socket.emit("clearBoard");
  };

  return (
    <div className="relative w-full h-full bg-gray-200 rounded-md p-2">
      <canvas
        ref={canvasRef}
        width={1000}
        height={600}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseLeave={stopDrawing}
        className="border bg-white rounded-md"
      ></canvas>

      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        {[
          "black",
          "red",
          "yellow",
          "green",
          "blue",
          "orange",
          "purple",
          "pink",
          "brown",
          "gray",
        ].map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{ backgroundColor: c }}
            className="w-6 h-6 rounded-full border"
          ></button>
        ))}
        <button
          onClick={handleClearBoard}
          className="bg-white border p-1 rounded text-xs"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
