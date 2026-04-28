import { useState, useEffect } from "react";
import "../styles/Admin.css";

export default function Admin() {
  const [alerts, setAlerts] = useState([]);
  const [services, setServices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showAlertsList, setShowAlertsList] = useState(false);
const handleLogout = () => {
  localStorage.removeItem("user"); // or "admin" based on your login key
  window.location.href = "/"; // redirect to login page
};
  // 🔥 RESET SYSTEM
  const resetSystem = () => {
    localStorage.clear();
    window.location.reload();
  };

  // ✅ SAFE PARSE
  const getData = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  // 🔄 AUTO ASSIGN + LIVE SYNC
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(getData("logs"));
      setRooms(getData("rooms"));

      const staffByFloor = {
        "Floor 1": ["A1", "A2", "A3", "A4"],
        "Floor 2": ["B1", "B2", "B3", "B4"],
        "Floor 3": ["C1", "C2", "C3", "C4"],
      };

      const storedAlerts = getData("alerts");
      const storedServices = getData("services");

      const getLeastBusyStaff = (floor, items) => {
        const staffList = staffByFloor[floor] || [];
        let workload = {};

        staffList.forEach(s => (workload[s] = 0));

        items.forEach(item => {
          if (
            item.assignedTo &&
            item.floor === floor &&
            item.status !== "Completed"
          ) {
            workload[item.assignedTo]++;
          }
        });

        let selected = staffList[0];

        for (let s of staffList) {
          if (workload[s] < workload[selected]) {
            selected = s;
          }
        }

        return selected;
      };

      // 🔥 ASSIGN ALERTS
      const updatedAlerts = storedAlerts.map(alert => {
        if (alert.assignedTo || !alert.floor) return alert;

        return {
          ...alert,
          assignedTo: getLeastBusyStaff(alert.floor, storedAlerts),
        };
      });

      // 🔥 ASSIGN SERVICES
      const updatedServices = storedServices.map(service => {
        if (service.assignedTo || !service.floor) return service;

        return {
          ...service,
          assignedTo: getLeastBusyStaff(service.floor, storedServices),
        };
      });

      localStorage.setItem("alerts", JSON.stringify(updatedAlerts));
      localStorage.setItem("services", JSON.stringify(updatedServices));

      setAlerts(updatedAlerts);
      setServices(updatedServices);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 🔥 CLICK OUTSIDE DROPDOWN
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-stat")) {
        setShowAlertsList(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () =>
      document.removeEventListener("click", handleClickOutside);
  }, []);

  // 📊 STATS
  const occupiedRooms = rooms.filter(r => r.status === "Occupied").length;
  const totalRooms = rooms.length;

  const activeAlerts = alerts.filter(a => a.status !== "Completed");
  const activeServices = services.filter(s => s.status !== "Completed");

  const emergencyAlerts = alerts.filter(
    a =>
      ["Fire", "Medical", "Security"].some(t =>
        a.type.includes(t)
      ) &&
      a.status !== "Completed"
  );

  const escalatedAlerts = emergencyAlerts.filter(
    a =>
      a.timestamp &&
      Date.now() - a.timestamp > 30000
  );

const cleaningRooms = rooms.filter(
  r => r.status === "Needs Cleaning" && r.assignedTo
);
  // ✅ FIXED GUEST SYSTEM
  const activeGuests = rooms.filter(r => r.status === "Occupied");
  useEffect(() => {
let rooms = JSON.parse(localStorage.getItem("rooms")) || [];
  // 🔥 Create rooms if not present OR wrong size
  if (!rooms || rooms.length !== 24) {
    rooms = [];
    let roomNumber = 101;

    for (let f = 1; f <= 3; f++) {
      for (let i = 1; i <= 8; i++) {   // 🔥 8 ROOMS PER FLOOR
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
    setRooms(rooms);
  }
}, []); 

  return (
<div className="admin-page">

  {/* 🔝 TOP BAR */}
  <div className="top-bar">
    <h1>🛠️ Admin Dashboard</h1>

    <button className="logout-btn" onClick={handleLogout}>
      🚪 Logout
    </button>
  </div>

      {/* 📊 STATS */}
      <div className="stats-grid">

        <div className="stat-card dropdown-stat">
          <div
            className="stat-header"
            onClick={() => setShowAlertsList(!showAlertsList)}
          >
            <span>🚨 Total Alerts: {alerts.length}</span>
            <span className={`arrow ${showAlertsList ? "open" : ""}`}>
              ▼
            </span>
          </div>

          {showAlertsList && (
            <div className="dropdown-list">
              {alerts.map(alert => (
                <div key={alert.id} className="dropdown-item">
                  {alert.type} — {alert.guestId}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="stat-card">⚠️ Active Alerts: {activeAlerts.length}</div>
        <div className="stat-card">🛎️ Services: {services.length}</div>
        <div className="stat-card">📌 Pending Services: {activeServices.length}</div>
        <div className="stat-card">🏨 Rooms: {occupiedRooms}/{totalRooms}</div>

      </div>

      {/* 👤 GUEST INFO */}
      <div className="section">
<h2 className="section-title">👤 Guest Info</h2>
        {activeGuests.length === 0 ? (
          <p>No active guests</p>
        ) : (
          activeGuests.map(room => (
            <div key={room.roomNo} className="guest-card">
              <p><strong>Guest:</strong> {room.guestId}</p>
              <p><strong>Room:</strong> {room.roomNo}</p>
              <p><strong>Floor:</strong> {room.floor}</p>
              <p>
                <strong>Checkout:</strong>{" "}
                {new Date(room.checkOut).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* 🧹 CLEANING */}
      <div className="section">
        <h2>🧹 Rooms Pending Cleaning</h2>

        {cleaningRooms.length === 0 ? (
          <p>No rooms pending cleaning</p>
        ) : (
          cleaningRooms.map(room => (
            <div key={room.roomNo} className="guest-card cleaning-block">
              Room {room.roomNo} - {room.floor}
            </div>
          ))
        )}
      </div>
      {/* 🚨 EMERGENCY */}
      <div className="section">
        <h2>🚨 Emergency Alerts</h2>

        {emergencyAlerts.length === 0 ? (
<p className="empty-text">No emergency alerts</p>        ) : (
          emergencyAlerts.map(alert => (
            <div key={alert.id} className="guest-card alert-block">
              <h3>{alert.type}</h3>
              <p>👤 {alert.guestId}</p>
              <p>🏢 {alert.floor}</p>
              <p>📌 {alert.status}</p>
              <p>👨‍💼 {alert.assignedTo}</p>
            </div>
          ))
        )}
      </div>

      {/* ⚠️ ESCALATED */}
      <div className="section">
        <h2>⚠️ Escalated Alerts</h2>

        {escalatedAlerts.length === 0 ? (
          <p>No escalations</p>
        ) : (
          escalatedAlerts.map(alert => (
            <div key={alert.id} className="guest-card alert-block">
              <h3>{alert.type}</h3>
              <p>👤 {alert.guestId}</p>
              <p>⏰ {alert.time}</p>
            </div>
          ))
        )}
      </div>
      <div className="section">
  <h2 className="section-title">🧑‍🔧 Staff Assignments</h2>

  <div className="card-grid">

    {/* 🧹 Cleaning Assignments */}
    {rooms
      .filter(r => r.status === "Needs Cleaning"&& r.assignedTo)
      .map(room => (
        <div key={room.roomNo} className="card">
          <h3>🧹 Room {room.roomNo}</h3>
          <p>📍 {room.floor}</p>
          <p>👨‍💼 Assigned: {room.assignedTo || "Not Assigned"}</p>
        </div>
      ))}

   {/* 🛎️ Service Assignments */}
{services
  .filter(service => service.status !== "Completed" && service.assignedTo)
  .length === 0 ? (

    <p className="empty-text">No active service assignments</p>

  ) : (

    services
      .filter(service => service.status !== "Completed" && service.assignedTo)
      .map(service => (
        <div key={service.id} className="card service">
          <h3>🛎️ {service.type}</h3>
          <p>👤 {service.guestId}</p>
          <p>📍 {service.floor}</p>
          <p>👨‍💼 Assigned: {service.assignedTo}</p>
          <p>📌 {service.status}</p>
        </div>
      ))
)}
  </div>
</div>
      {/* 🧾 LOGS */}
      <div className="section">
        <h2>🧾 System Logs</h2>

        <div className="logs-box">
          {[...logs].reverse().map(log => (
            <div key={log.id} className="log-line">
              [{log.time}] {log.message}
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 RESET */}
      <button className="reset-btn" onClick={resetSystem}>
        ⚠️ Reset System
      </button>

    </div>
  );
}