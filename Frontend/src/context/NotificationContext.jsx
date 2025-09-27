import React, { createContext, useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext"; 

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Remove a notification (e.g., after responding)
    const removeNotification = (notificationId) => {
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    };


useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]); // clear notifications when logged out
    }
  }, [user]); // rerun when login/logout

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        fetchNotifications,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
