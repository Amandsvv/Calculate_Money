import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 w-full text-white px-6 py-4 flex justify-between items-center fixed mb-8">
      {/* Logo / Brand */}
      <div className="text-xl font-bold">
        <Link to="/">RoomieSplit</Link>
      </div>

      {/* Navigation Links */}
      <div className="space-x-4">
        {user ? (
          <>
            <Link to="/" className="hover:text-gray-200">
              Dashboard
            </Link>
            <Link to="/groups" className="hover:text-gray-200">
              Groups
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-gray-200">
              Login
            </Link>
            <Link to="/signup" className="hover:text-gray-200">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}