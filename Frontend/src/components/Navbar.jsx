// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <header className="w-full bg-white/50 backdrop-blur-3xl shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1
            className="text-2xl font-bold cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            Clean Street
          </h1>

          <nav className="hidden md:flex gap-6 text-gray-700">
            <Link to="/dashboard" className="hover:text-black">Dashboard</Link>
            <Link to="/report" className="hover:text-black">Report Issue</Link>
            <Link to="/complaints" className="hover:text-black">View Complaints</Link>
            <Link to="/profile" className="text-blue-600 font-semibold">Profile</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden md:block text-gray-700">Welcome {user?.name?.split(" ")[0] || "User"}</span>

          <div
            onClick={() => navigate("/profile")}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer"
            title="Profile"
          >
            👤
          </div>

          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">🔔</div>
        </div>
      </div>
    </header>
  );
}
