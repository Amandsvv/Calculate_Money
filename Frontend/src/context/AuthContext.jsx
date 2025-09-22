// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // ✅ Load user on mount
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) return setUser(null);

            try {
                const res = await api.get("/auth/me"); // api.js now sends token automatically
                setUser(res.data.user);
            } catch (err) {
                setUser(null);
            }
        };
        fetchUser();
    }, []);


    // ✅ Register
    const register = async (name, email, password) => {
        const res = await api.post("/signup", { name, email, password });
        return res.data;
    };

    // ✅ Login
    const login = async (email, password) => {
        const res = await api.post("/login", { email, password });
        if (res.data.data) {
            setUser(res.data.data);
            localStorage.setItem("accessToken", res.data.data.accessToken);
        }
        return res.data;
    };

    // ✅ Logout
    const logout = () => {
        localStorage.removeItem("accessToken");
        setUser(null);
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
