import { useState, useEffect } from "react";
import "../styles/Staff.css";

export default function Staff() {
  const [alerts, setAlerts] = useState([]);
  const [services, setServices] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);

  const staffName = localStorage.getItem("staffName") || "";
  const staffFloor = localStorage.getItem("staffFloor") || "";

  // 🔐 Redirect
  useEffect(() => {
    if (!staffName) window.location.href = "/staff-login";
  }, [staffName]);

  // 🔓 Logout
  const logout = () => {
    localStorage.removeItem("staffName");
    localStorage.removeItem("staffFloor");
    window.location.href = "/staff-login";
  };

  // 🏨 INIT ROOMS
  useEffect(() => {
    let rooms = JSON.parse(localStorage.getItem("rooms"));

    if (!rooms || rooms.length === 0) {
      rooms = [];
      let roomNumber = 101;

      for (let f = 1; f <= 3; f++) {
        for (let i = 1; i <= 5; i++) {
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

      localStorage.setItem("rooms", JSON.stringify(rooms));
    }

    setRooms(rooms);
  }, []);

  // 🔄 LIVE SYNC + CLEANING
  useEffect(() => {
  const interval = setInterval(() => {

    let currentRooms = JSON.parse(localStorage.getItem("rooms")) || [];

    // 🔥 CHECK CHECKOUT + CLEANING
    currentRooms.forEach(room => {
if (!room.checkOut || room.status !== "Occupied" || room.notified) return;
      const diff = new Date(room.checkOut).getTime() - Date.now();

      if (diff <= 0 && !room.notified) {
        alert(`⚠️ Room ${room.roomNo} checkout done! Cleaning required`);

room.status = "Needs Cleaning";
room.assignedTo = staffName || "Unassigned";
        room.notified = true;
      }
    });

    // SAVE UPDATED ROOMS
    localStorage.setItem("rooms", JSON.stringify(currentRooms));
    setRooms(currentRooms);

    // 🔄 SYNC ALERTS & SERVICES
    setAlerts(JSON.parse(localStorage.getItem("alerts")) || []);
    setServices(JSON.parse(localStorage.getItem("services")) || []);

  }, 2000);

  return () => clearInterval(interval);
}, [staffName]);

  // 🧹 CLEANING
  const cleaningRooms = rooms.filter(
    r =>
      r.floor?.trim() === staffFloor?.trim() &&
      r.status === "Needs Cleaning"&& r.assignedTo
  );

  const markCleaned = (roomNo) => {
    let rooms = JSON.parse(localStorage.getItem("rooms")) || [];

    const updated = rooms.map(room =>
      room.roomNo === roomNo
        ? {
            ...room,
            status: "Available",
            guestId: null,
            checkOut: null,
            assignedTo: null,
            notified: false 
          }
        : room
    );

    localStorage.setItem("rooms", JSON.stringify(updated));
    setRooms(updated);
  };

  // 🏨 ROOM STATS
  const floorRooms = rooms.filter(r => r.floor === staffFloor);
  const occupied = floorRooms.filter(r => r.status === "Occupied");

  const upcomingCheckout = occupied.filter(r => {
  if (!r.checkOut) return false;

  const diff = new Date(r.checkOut).getTime() - Date.now();

  return diff > 0 && diff <= 10 * 60 * 1000; // 🔥 ONLY 10 MIN
});

  // 🚨 ALERTS
  const assignedAlerts = alerts.filter(
    a =>
      a.assignedTo === staffName &&
      a.floor === staffFloor &&
      a.status !== "Completed"
  );

  const completedAlerts = alerts.filter(
    a =>
      a.assignedTo === staffName &&
      a.status === "Completed"
  );

  // 🛎️ SERVICES (FIXED)
  const activeServices = services.filter(
    s =>
      s.assignedTo === staffName &&
      s.floor === staffFloor &&
      s.status !== "Completed"
  );

  const completedServices = services.filter(
    s =>
      s.assignedTo === staffName &&
      s.floor === staffFloor &&
      s.status === "Completed"
  );

  // 🔄 UPDATE ALERT
  const updateStatus = (id) => {
    const updated = alerts.map(a =>
      a.id === id ? { ...a, status: "Completed", assignedTo: null  } : a
    );

    setAlerts(updated);
    localStorage.setItem("alerts", JSON.stringify(updated));
  };

  // 🔄 UPDATE SERVICE
  const updateServiceStatus = (id) => {
    const updated = services.map(s =>
      s.id === id ? { ...s, status: "Completed", assignedTo: null } : s
    );

    setServices(updated);
    localStorage.setItem("services", JSON.stringify(updated));
  };

  // 🔄 RESET
  const resetCompleted = () => {
  // ✅ remove completed alerts & services
  const remainingAlerts = alerts.filter(a => a.status !== "Completed");
  const remainingServices = services.filter(s => s.status !== "Completed");

  setAlerts(remainingAlerts);
  setServices(remainingServices);

  localStorage.setItem("alerts", JSON.stringify(remainingAlerts));
  localStorage.setItem("services", JSON.stringify(remainingServices));

  // 🔥 RESET TASKS (ADD THIS PART)
  const resetTasks = tasks.map(t => ({
    ...t,
    done: false,
  }));

  setTasks(resetTasks);
  localStorage.setItem("tasks", JSON.stringify(resetTasks));
};
  

  // 📅 TASKS
  useEffect(() => {
    let savedTasks = JSON.parse(localStorage.getItem("tasks"));

    if (!Array.isArray(savedTasks)) {
     savedTasks = [
  { text: "🔥 Fire safety inspection", done: false },
  { text: "🛗 Elevator system check", done: false },
  { text: "🚪 Emergency exits inspection", done: false },
  { text: "🧹 Room cleaning verification", done: false },
  { text: "📹 CCTV monitoring check", done: false },
  { text: "🧍 Guest assistance readiness", done: false },
  { text: "🧼 Hygiene & sanitation check", done: false },
  { text: "📦 Inventory & supplies check", done: false },
];
    }

    setTasks(savedTasks);
    localStorage.setItem("tasks", JSON.stringify(savedTasks));
  }, []);

  const toggleTask = (index) => {
    const updated = tasks.map((t, i) =>
      i === index ? { ...t, done: !t.done } : t
    );

    setTasks(updated);
    localStorage.setItem("tasks", JSON.stringify(updated));
  };

  return (
    <div className="staff-page">

      {/* 🔝 HEADER */}
      <div className="top-bar">
        <h1 className="title">
          👨‍💼 {staffName} ({staffFloor})
        </h1>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* 🏨 OCCUPANCY */}
      <div className="section">
        <h2>🏨 Floor Occupancy</h2>
        <p>{occupied.length} / {floorRooms.length} rooms occupied</p>
      </div>

      {/* 🧹 CLEANING */}
      <div className="section">
        <h2>🧹 Rooms to Clean</h2>
        {cleaningRooms.length === 0 ? (
          <p className="empty">No cleaning required</p>
        ) : (
          <div className="card-grid">
            {cleaningRooms.map(room => (
              <div key={room.roomNo} className="card service">
                <h3>Room {room.roomNo}</h3>
<p style={{ color: "#f97316" }}>Needs Cleaning</p>
                <button onClick={() => markCleaned(room.roomNo)}>
                  ✅ Cleaned
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ⏰ CHECKOUT */}
      <div className="section">
        <h2>⏰ Upcoming Checkout</h2>
        {upcomingCheckout.map(room => (
          <div key={room.roomNo} className="card medium">
  <h3>Room {room.roomNo}</h3>

  <p>
    ⏰ {new Date(room.checkOut).toLocaleTimeString()}
  </p>

  <p style={{ color: "#f97316", fontWeight: "bold" }}>
    ⚠️ Checkout in less than 10 mins
  </p>
</div>
        ))}
      </div>

      {/* 📅 TASKS */}
      <div className="section">
        <h2>📅 Tasks</h2>
        <ul className="tasks">
          {tasks.map((t, i) => (
            <li key={i} className={t.done ? "done" : ""}>
              <div className="task-row">
                <span>{t.text}</span>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTask(i)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 🚨 ALERTS */}
      <div className="section">
  <h2>🚨 Alerts</h2>

  <div className="card-grid">
    {assignedAlerts.length === 0 ? (
      <p className="empty">No active alerts</p>
    ) : (
      assignedAlerts.map(alert => (
        <div
          key={alert.id}
          className={`card ${
            alert.priority === "High"
              ? "high"
              : alert.priority === "Medium"
              ? "medium"
              : "low"
          }`}
        >
          <span className="badge">{alert.priority}</span>

          <h3>{alert.type}</h3>
          <p>👤 {alert.guestId}</p>
          <p>⏰ {alert.time}</p>
          <p>📌 {alert.status}</p>

          <button onClick={() => updateStatus(alert.id)}>
            Resolve
          </button>
        </div>
      ))
    )}
  </div>
</div>

      {/* 🛎️ SERVICES */}
     <div className="section">
  <h2>🛎️ Services</h2>

  <div className="card-grid">
    {activeServices.length === 0 ? (
      <p className="empty">No service requests</p>
    ) : (
      activeServices.map(service => (
        <div key={service.id} className="card service">
          <span className="badge">Service</span>

          <h3>{service.type}</h3>
          <p>👤 {service.guestId}</p>
          <p>⏰ {service.time}</p>
          <p>📌 {service.status}</p>

          <button onClick={() => updateServiceStatus(service.id)}>
            Done
          </button>
        </div>
      ))
    )}
  </div>
</div>

<div className="section">
  <h2>🚨 Emergency Contacts</h2>

  <div className="card contacts">
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

      {/* ✅ COMPLETED */}
      <div className="section">
        <h2>✅ Completed</h2>
        <ul className="completed-list">
          {[...completedAlerts, ...completedServices].map((item, i) => (
            <li key={i}>{item.type}</li>
          ))}
        </ul>

        <button className="reset-btn" onClick={resetCompleted}>
          Reset Completed
        </button>
      </div>

    </div>
  );
}