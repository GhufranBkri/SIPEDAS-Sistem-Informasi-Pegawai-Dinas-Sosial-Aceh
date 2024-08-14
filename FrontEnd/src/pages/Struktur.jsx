// src/pages/Struktur.js
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import "./Struktur.css";

const Struktur = () => {
  const [userRole, setUserRole] = useState("");
  const [showModal, setShowModal] = useState(false);

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

  const handleSave = () => {
    setShowModal(true);
  };

  const handleConfirmSave = () => {
    setShowModal(false);
    alert("Gambar disimpan!");
    // const link = document.createElement('a');
    // link.href = "src/assets/Struktur.svg";
    // link.download = "StrukturDinasSosial.png";
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen">
      <main className="py-8">
        <div className="mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-4">Struktur Dinas Sosial</h1>
            <div className="flex justify-end gap-4">
              {userRole === "admin" && (
                <a href="/GantiStruktur">
                  <button className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Ganti Struktur
                  </button>
                </a>
              )}
              <button onClick={handleSave} className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Download
              </button>
            </div>
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h2 className="text-xl font-semibold mb-8">Konfirmasi</h2>
            <p className="mb-8">
              Apakah Anda ingin mendownload gambar ini?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300 ease-in-out"
              >
                tidak
              </button>
              <button
                onClick={handleConfirmSave}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
              >
                ya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Struktur;
