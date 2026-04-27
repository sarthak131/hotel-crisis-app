import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
// Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
console.log("NEW LOGIN LOADED");

export default function Login() {
  const [role, setRole] = useState("guest");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // 🔹 Guest Login
    if (role === "guest") {
      if (email.startsWith("GUEST-")) {
        localStorage.setItem("guestId", email);
        localStorage.setItem("guestName", name); // optional
        navigate("/guest");
      } else {
        alert("Invalid Guest ID");
      }
      return;
    }

    // 🔹 Staff Login (FAKE - no validation)
    if (role === "staff") {
      localStorage.setItem("staffName", name || "Staff");
      navigate("/staff");
      return;
    }

    // 🔹 Admin Login (Firebase)
    if (role === "admin") {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        if (userCredential.user.email === "admin@gmail.com") {
          navigate("/admin");
        } else {
          alert("Not authorized as admin");
        }

      } catch (error) {
        alert("Invalid admin credentials");
      }
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
<h2 className="gold-title">Oberio Hotels</h2>
        {/* 🔹 Role Dropdown */}
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="guest">Guest</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>

        {/* 🔹 Name (for Guest + Staff) */}
        {(role === "guest" || role === "staff") && (
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        {/* 🔹 Guest Input */}
        {role === "guest" && (
          <input
            type="text"
            placeholder="Enter Guest ID (GUEST-XXXX)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}

        {/* 🔹 Staff/Admin Inputs */}
        {(role === "staff" || role === "admin") && (
          <>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </>
        )}

        <button type="submit">Login</button>
      </form>
    </div>
  );
}