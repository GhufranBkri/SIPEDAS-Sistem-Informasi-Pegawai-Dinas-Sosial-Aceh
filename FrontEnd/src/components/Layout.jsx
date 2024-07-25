// src/components/Layout.js
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import NavbarAdmin from './NavbarAdmin';

function Layout() {
  const location = useLocation();

  return (
    <div>
      {location.pathname === '/' && <Navbar />}
      {location.pathname === '/DataKaryawan' && <NavbarAdmin />}
      {location.pathname === '/Dashboard' && <NavbarAdmin />}
      {location.pathname === '/Struktur' && <NavbarAdmin />}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
