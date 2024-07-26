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
      // Verifikasi token di server (opsional, jika Anda menggunakan JWT atau sejenisnya)
      // Anda bisa melakukan verifikasi token di sini jika perlu
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
      {/* {role === 'admin' && <NavbarAdmin />}
      {role === 'employee' && <NavbarUser />} */}
      {/* {location.pathname === '/DataKaryawan' && <NavbarAdmin />}
      {location.pathname === '/Dashboard' && <NavbarAdmin />}
      {location.pathname === '/Struktur' && <NavbarAdmin />} */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
