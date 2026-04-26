import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Booking.css";

export default function Booking() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guestId, setGuestId] = useState("");
 const [copied, setCopied] = useState(false);

const copyGuestId = (id) => {
  navigator.clipboard.writeText(id);
  setCopied(true);
  setTimeout(() => setCopied(false), 1500);
};
  const navigate = useNavigate();
const handleSubmit = (e) => {
  e.preventDefault();

  const id = "GUEST-" + Date.now();

  const checkInDate = new Date();
  const checkOutDate = new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000);

  const checkIn = checkInDate.toLocaleString();
  const checkOut = checkOutDate.toLocaleString();

  setGuestId(id);

  // ✅ FIXED STORAGE
  localStorage.setItem("guestId", id);
  localStorage.setItem("checkIn", checkIn);
  localStorage.setItem("checkOut", checkOut);
};

  return (
    <div className="booking">
      <div className="booking-card">
        <h2>Book a Room</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">Book Now</button>
        </form>

        {guestId && (
  <div className="result">
    <h3>Your Guest ID</h3>
   <div className="guest-id-box">
  <p>{guestId}</p>

  <button
    className="copy-btn"
    onClick={() => copyGuestId(guestId)}
  >
    {copied ? "✅ Copied!" : "📋 Copy ID"}
  </button>
</div>

    {/* ✅ ADD THESE TWO LINES */}
    <p><strong>Check-in:</strong> {localStorage.getItem("checkIn")}</p>
    <p><strong>Check-out:</strong> {localStorage.getItem("checkOut")}</p>

    <button
      style={{ marginTop: "10px", background: "#22c55e" }}
      onClick={() => navigate("/login")}
    >
      Go to Login
    </button>
  </div>
)}
      </div>
    </div>
  );
}