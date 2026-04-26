import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Guest from "./pages/Guest";
import Staff from "./pages/Staff";
import Admin from "./pages/Admin";
import Landing from "./pages/Landing";
import Booking from "./pages/Booking";
import StaffLogin from "./pages/StaffLogin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />   {/* FIXED */}
        <Route path="/login" element={<Login />} /> {/* ADD THIS */}
        <Route path="/booking" element={<Booking />} />
        <Route path="/staff-login" element={<StaffLogin />} />


        <Route path="/guest" element={<Guest />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;