import React, { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
const socket = io.connect("http://localhost:3001");

const App = () => {
  const [Message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [alias, setAlias] = useState("");
  const [logs, setLogs] = useState([]);
  const [oldRoom, setOldRoom] = useState("");
  const [count, setCount] = useState(1);

  const sendMessage = () => {
    if (!joined) {
      alert("Please join a room before sending messages.");
    } else {
      setLogs((prevLogs) => [...prevLogs, { sender: "You", message: Message }]);
      socket.emit("send_message", { sender: alias, message: Message, room });
      setMessage("");
    }
  };

  const joinRoom = () => {
    if (room === "") {
      alert("Please enter a Room ID to join.");
    } else if (joined) {
      // Already joined a room and now leaving the room for a new room
      socket.emit("leave_room", { room: oldRoom });
      alert("Leaving old Room");
      setLogs([]);
      socket.emit("join_room", { room });
      setOldRoom(room);
    } else {
      socket.emit("join_room", { room });
      setOldRoom(room);
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setLogs((prevLogs) => [...prevLogs, { sender: data.sender, message: data.message }]);
    });

    socket.on("alias_assigned", (data) => {
      setJoined(true);
      setAlias(data.strangerAlias);
      setCount(data.count);
      alert(`Successfully joined room: ${room}`);
    });

    socket.on("someone_left", (data) => {
      setCount(data.count);
      alert(`Someone left from room: ${room}`);
    });

    socket.on("some_added", (data) => {
      setCount(data.count);
    });

    socket.on("disconnect", () => {
      socket.emit("leave_room", { room: oldRoom });
    });

    return () => {
      if(joined){
        socket.off("disconnect");
      }
    };
  }, [socket]);

  return (
    <div className="App p-4 bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Socket.IO Chat</h1>

        <div className="mb-4">
          <input
            type="text"
            onChange={(e) => setRoom(e.target.value)}
            value={room}
            placeholder="Enter Room ID"
            className="w-full border-2 border-gray-300 p-2 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={joinRoom}
            className="mt-2 w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            Join Room
          </button>
        </div>

        {/* Display count here right below room input */}
        {joined && (
          <div className="text-center mb-4">
            <span className="text-xl font-semibold">Total Users in Room: {count}</span>
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            onChange={(e) => setMessage(e.target.value)}
            value={Message}
            placeholder="Enter Message"
            className="w-full border-2 border-gray-300 p-2 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={sendMessage}
            className="mt-2 w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
          >
            Send Message
          </button>
        </div>

        <div className="logs bg-gray-50 p-4 rounded-lg shadow-inner max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center">No messages yet</p>
          ) : (
            logs.map((item, index) => (
              <div key={index} className="mb-2">
                <strong className="text-blue-600">{item.sender}:</strong>{" "}
                <span className="text-gray-800">{item.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
