import { useEffect, useMemo, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar';
import ChatBubble from './components/ChatBubble';

function App() {
  const socket = useMemo(() => io("http://localhost:3000/"), []);

  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [list, setList] = useState([]);
  const [socketId, setSocketId] = useState("");
  const [roomName, setRoomName] = useState("");

  const handleChangeMessage = (event) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (message !== "") {
      socket.emit("message", { message, roomName });
      setMessage("");
    }
  };

  const handleChangeRoom = (event) => {
    setRoom(event.target.value);
  };

  const handleJoinRoom = () => {
    if (room !== "") {
      setRoomName(room);
      socket.emit("join-room", room);
      setRoom("");
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected SocketID: ", socket.id);
      setSocketId(socket.id);
    });

    socket.on("welcome", (payload) => {
      console.log(payload);
    });

    socket.on("message", (data) => {
      setList((prevList) => [...prevList, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);


  // Create a ref for the end of the messages list
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [list]);

  return (
    <>
      <Navbar />

      {/* Main container */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center space-y-6">
          {/* Status header */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center bg-white rounded-lg shadow p-4">
            <div className="text-lg font-bold">
              Your Socket ID: <span className="text-blue-500">{socketId}</span>
            </div>
            <div className="text-lg font-bold">
              Current Room:{" "}
              <span className="text-green-500">
                {roomName || "None"}
              </span>
            </div>
          </div>

          {/* Chat window */}
          <div className="w-full">
            <div className="w-full h-[50vh] border rounded-lg shadow bg-gray-50 p-4 overflow-y-auto">
              {list.map((item, index) => (
                <ChatBubble name={item.name} message={item.message} key={index} />
              ))}
              {/* The div below is used as a target to scroll into view */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input sections */}
          <div className="w-full flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Message Input */}
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Enter Message"
                value={message}
                onChange={handleChangeMessage}
                className="w-full input input-bordered"
              />
              <button onClick={handleSendMessage} className="btn btn-primary">
                Send
              </button>
            </div>

            {/* Room Input */}
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Enter Room"
                value={room}
                onChange={handleChangeRoom}
                className="w-full input input-bordered"
              />
              <button onClick={handleJoinRoom} className="btn btn-secondary">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
