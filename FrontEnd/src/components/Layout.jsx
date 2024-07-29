// src/components/Layout.js
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import NavbarAdmin from "./NavbarAdmin";
import NavbarUser from "./NavbarUser";

function Layout() {
  const location = useLocation();
  const [role, setRole] = useState(localStorage.getItem("userRole"));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      setRole(storedRole);
    } else {
      setIsAuthenticated(false);
      navigate("/");
    }
  }, [navigate]);

  return (
    <div>
      {isAuthenticated && location.pathname === "/" && <Navbar />}
      {isAuthenticated && role === "admin" && <NavbarAdmin />}
      {isAuthenticated && role === "employee" && <NavbarUser />}
      {location.pathname === "/" && <Navbar />}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
