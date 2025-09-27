import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";
import { Bell } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications } = useContext(NotificationContext);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 w-full text-white px-6 py-4 flex justify-between items-center fixed top-0 left-0 z-50">
      {/* Brand Logo */}
      <div className="text-xl font-bold">
        <Link to="/">RoomieSplit</Link>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6">
        {user ? (
          <>
            {/* Dashboard Link */}
            <Link to="/dashboard" className="hover:text-gray-200">
              Dashboard
            </Link>

            {/* Groups Link */}
            <Link to="/groups" className="hover:text-gray-200">
              Groups
            </Link>

            <Link to="/invites" className="relative">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Logout */}
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
