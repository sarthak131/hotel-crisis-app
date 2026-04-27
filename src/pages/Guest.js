import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "../styles/Guest.css";

import ground from "../assets/maps/ground.png";
import floor1 from "../assets/maps/floor1.png";
import floor2 from "../assets/maps/floor2.png";
import floor3 from "../assets/maps/floor3.png";
import { model } from "../utils/gemini";

export default function Guest() {
  const navigate = useNavigate();

  // CHAT
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi 👋 I’m your assistant. Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // STATES
  const [services, setServices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [floor, setFloor] = useState("Ground");
  const [selectedArea, setSelectedArea] = useState(null);

  const guestId = localStorage.getItem("guestId") || "Unknown";

  const getData = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  // CHAT FUNCTION (API + FALLBACK)
  const sendMessage = async () => {
    if (!input.trim()) return;

    const msg = input.toLowerCase();
    let reply = "";

    if (msg.includes("fire")) {
      sendAlert("Fire");
      reply = "🚨 Fire alert triggered! Evacuate immediately.";
    } else if (msg.includes("medical")) {
      sendAlert("Medical");
      reply = "❤️ Medical help requested. Stay calm.";
    } else if (msg.includes("clean")) {
      sendService("Cleaning");
      reply = "🧹 Cleaning request sent.";
    } else if (msg.includes("room service")) {
      sendService("Room Service");
      reply = "🛎️ Room service requested.";
    }

    setMessages(prev => [...prev, { role: "user", text: input }]);
    setInput("");
    setLoading(true);

    let botReply = "";

    try {
      const result = await model.generateContent(input);
      botReply = result.response.text();
    } catch {
      botReply =
        reply ||
        "I can help with fire, medical, cleaning, room service, or exits.";
    }

    setMessages(prev => [
      ...prev,
      { role: "bot", text: botReply }
    ]);

    setLoading(false);
  };

  // ROOM INIT
  useEffect(() => {
    let rooms = JSON.parse(localStorage.getItem("rooms"));

    if (!rooms || rooms.length !== 24) {
      rooms = [];
      let roomNumber = 101;

      for (let f = 1; f <= 3; f++) {
        for (let i = 1; i <= 8; i++) {
          rooms.push({
            roomNo: roomNumber.toString(),
            floor: `Floor ${f}`,
            guestId: null,
            checkOut: null,
            status: "Available",
          });
          roomNumber++;
        }
      }
    }

    let assignedRoom = rooms.find(r => r.guestId === guestId);

    if (!assignedRoom) {
      const freeRoom = rooms.find(r => r.status === "Available");

      if (freeRoom) {
        freeRoom.guestId = guestId;
        freeRoom.status = "Occupied";
        freeRoom.checkOut = new Date(Date.now() + 3600000).toISOString();
        assignedRoom = freeRoom;
      }
    }

    localStorage.setItem("rooms", JSON.stringify(rooms));
if (assignedRoom) {
  setFloor(assignedRoom.floor);
  localStorage.setItem("guestFloor", assignedRoom.floor);
}  }, [guestId]);

  // LIVE SYNC
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(getData("services"));
      setAlerts(getData("alerts"));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const lastAlert = alerts[alerts.length - 1];
  const lastService = services[services.length - 1];

  // ALERT
  const sendAlert = (type) => {
    let priority = "Low";
    if (type === "Fire" || type === "Medical") priority = "High";
    else if (type === "Security") priority = "Medium";

    const newAlert = {
      id: Date.now(),
      type,
      priority,
      guestId,
floor: localStorage.getItem("guestFloor") || floor,      time: new Date().toLocaleTimeString(),
      timestamp: Date.now(),
      status: "Pending",
      assignedTo: null,
    };

    const alertsData = getData("alerts");
    localStorage.setItem("alerts", JSON.stringify([...alertsData, newAlert]));
    setAlerts([...alertsData, newAlert]);
  };

  // SERVICE
  const sendService = (type) => {
    const existing = getData("services");

    const newService = {
      id: Date.now(),
      type,
      guestId,
floor: localStorage.getItem("guestFloor") || floor,      status: "Pending",
    };

    const updated = [...existing, newService];
    localStorage.setItem("services", JSON.stringify(updated));
    setServices(updated);
  };

  const legend = [
    { id: 1, name: "Lobby" },
    { id: 2, name: "Reception" },
    { id: 3, name: "Waiting Area" },
    { id: 4, name: "Restaurant" },
    { id: 5, name: "Kitchen" },
    { id: 6, name: "Lift" },
    { id: 7, name: "Stair Case" },
    { id: 8, name: "Guest Room" },
    { id: 9, name: "Toilet" },
    { id: 10, name: "Store" },
    { id: 11, name: "Housekeeping" },
    { id: 12, name: "Laundry" },
    { id: 13, name: "Terrace" },
  ];

  return (
    <div className="guest-page">

      <div className="top-bar">
        <h2>🚨 Emergency Assistance</h2>
        <button className="logout" onClick={() => {
          localStorage.removeItem("guestId");
          navigate("/");
        }}>
          Logout
        </button>
      </div>

      <div className="info-bar">
        <h3>Welcome, Guest</h3>
        <p>ID: {guestId}</p>
        <p>🏢 Floor: {floor}</p>
      </div>

      <div className="card-grid">
        <div className="card red" onClick={() => sendAlert("Fire")}>🔥 Fire</div>
        <div className="card orange" onClick={() => sendAlert("Medical")}>❤️ Medical</div>
        <div className="card green" onClick={() => sendAlert("Evacuation")}>⬇️ Evacuate</div>
        <div className="card blue" onClick={() => sendAlert("Security")}>🛡️ Security</div>
      </div>

      <div className="service-section">
        <button onClick={() => sendService("Room Service")}>🛎️ Room Service</button>
        <button onClick={() => sendService("Cleaning")}>🧹 Cleaning</button>
      </div>

      <button className="map-btn" onClick={() => setShowMap(true)}>
        🗺️ View Map
      </button>

      {/* MAP */}
      {showMap && (
        <div className="map-modal">
          <div className="map-box">

            <div className="map-header">
              <h3>Hotel Map</h3>
              <button onClick={() => setShowMap(false)}>✖</button>
            </div>

            <div className="floor-selector">
              {["Ground","Floor 1","Floor 2","Floor 3"].map(f => (
                <button key={f} onClick={() => setFloor(f)}>{f}</button>
              ))}
            </div>

            <div className="map-container">
              {floor === "Ground" && <img src={ground} alt="" />}
              {floor === "Floor 1" && <img src={floor1} alt="" />}
              {floor === "Floor 2" && <img src={floor2} alt="" />}
              {floor === "Floor 3" && <img src={floor3} alt="" />}
            </div>

            <div className="legend">
              {legend.map(item => (
                <div key={item.id} className="legend-item" onClick={() => setSelectedArea(item)}>
                  {item.id}
                </div>
              ))}
            </div>

            {selectedArea && (
              <div className="info-box">
                {selectedArea.name}
              </div>
            )}

          </div>
        </div>
      )}

      {/* PANELS */}
      <div className="panel-section">
        <div className="panel alert-panel">
          <h3>⚠️ Alerts</h3>
          <p>{lastAlert ? `${lastAlert.type} - ${lastAlert.status}` : "No alerts"}</p>
        </div>

        <div className="panel service-panel">
          <h3>🛎️ Services</h3>
          <p>{lastService ? `${lastService.type} - ${lastService.status}` : "No services"}</p>
        </div>

        <div className="panel contacts-panel">
  <h3>📞 Emergency Contacts</h3>

  <p>
    <span>👮 Police</span>
    <strong>100</strong>
  </p>

  <p>
    <span>🚑 Ambulance</span>
    <strong>102</strong>
  </p>

  <p>
    <span>🚒 Fire Brigade</span>
    <strong>101</strong>
  </p>
</div>
      </div>

      {/* CHAT */}
      <button className="chat-btn" onClick={() => setShowChat(!showChat)}>🤖</button>

      {showChat && (
        <div className="chat-box">

          <div className="chat-header">
            <span>🤖 Assistant</span>
            <button onClick={() => setShowChat(false)}>✖</button>
          </div>

          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="chat-msg bot">Typing...</div>}
            <div ref={chatEndRef}></div>
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
            />
            <button onClick={sendMessage}>➤</button>
          </div>

        </div>
      )}

    </div>
  );
}