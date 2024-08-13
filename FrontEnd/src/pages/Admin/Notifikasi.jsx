// src/pages/Notifikasi.js
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Notifikasi = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Cek userRole dari localStorage
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      navigate('/Dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <main className="py-8">
        <div className="mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-4">Notifikasi</h1>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 relative">
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifikasi;
