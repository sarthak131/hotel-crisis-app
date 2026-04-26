import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StaffLogin.css";

export default function StaffLogin() {
  const [staff, setStaff] = useState("");
  const navigate = useNavigate();

  const getFloor = (staff) => {
    if (staff.startsWith("A")) return "Floor 1";
    if (staff.startsWith("B")) return "Floor 2";
    if (staff.startsWith("C")) return "Floor 3";
    return "";
  };

  const handleLogin = () => {
    if (!staff) return alert("Select staff");

    localStorage.setItem("staffName", staff);
    localStorage.setItem("staffFloor", getFloor(staff));

    navigate("/staff");
  };

  return (
    <div className="staff-login-page">

      <div className="staff-login-card">
        <h2>👨‍💼 Staff Access</h2>
        <p>Internal system login</p>

        <select value={staff} onChange={(e) => setStaff(e.target.value)}>
          <option value="">Select Staff ID</option>

          <optgroup label="Floor 1">
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="A3">A3</option>
            <option value="A4">A4</option>
          </optgroup>

          <optgroup label="Floor 2">
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="B3">B3</option>
            <option value="B4">B4</option>
          </optgroup>

          <optgroup label="Floor 3">
            <option value="C1">C1</option>
            <option value="C2">C2</option>
            <option value="C3">C3</option>
            <option value="C4">C4</option>
          </optgroup>
        </select>

        <button onClick={handleLogin}>Login</button>

        {staff && (
          <span className="floor-tag">
            📍 {getFloor(staff)}
          </span>
        )}
      </div>

    </div>
  );
}