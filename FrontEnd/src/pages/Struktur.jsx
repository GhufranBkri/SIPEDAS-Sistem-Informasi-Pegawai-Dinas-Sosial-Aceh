// src/pages/Struktur.js
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import "./Struktur.css";

const Struktur = () => {
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Retrieve user role from local storage
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const [zoomStyle, setZoomStyle] = useState({
    display: "block",
    backgroundPosition: "0% 0%",
    backgroundSize: "1100%",
  });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle((prev) => ({
      ...prev,
      backgroundPosition: `${x}% ${y}%`,
    }));
  };

  return (
    <div className="min-h-screen">
      <main className="py-8">
        <div className="mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-4">Struktur</h1>
            {userRole === "admin" && (
              <a href="/GantiStruktur">
                <button className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Ganti Struktur
                </button>
              </a>
            )}
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 relative">
            <div className="zoom-container" onMouseMove={handleMouseMove}>
              <img
                src="src/assets/Struktur.svg"
                alt="Struktur"
                className="zoom-image"
              />
              <div
                className="zoom-rectangle"
                style={{
                  ...zoomStyle,
                  backgroundImage: `url('src/assets/Struktur.svg')`,
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Struktur;
