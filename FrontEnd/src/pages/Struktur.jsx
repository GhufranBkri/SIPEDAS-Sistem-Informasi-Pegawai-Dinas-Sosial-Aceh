// src/pages/Struktur.js
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import "./Struktur.css";
import axios from "axios";
import { Alert } from "antd";

const Struktur = () => {
  const [userRole, setUserRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomStyle, setZoomStyle] = useState({
    display: "block",
    backgroundPosition: "0% 0%",
    backgroundSize: "1000%",
  });

  useEffect(() => {
    // Retrieve user role from local storage
    const role = localStorage.getItem("userRole");
    setUserRole(role);

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Unauthorized access. Please log in.");
      return;
    }

    // Fetch image URL from API
    const fetchImageUrl = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          "http://localhost:3000/struktur/get-foto",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setImageUrl(response.data.imageUrl); // Use response.data.imageUrl
      } catch (error) {
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false); // Set loading to false when done fetching
      }
    };

    fetchImageUrl();
  }, []);

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

  const handleConfirmSave = async () => {
    if (imageUrl) {
      try {
        // Create an image element to load the SVG
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Ensure CORS compatibility if the SVG is from another origin
        img.src = imageUrl;

        img.onload = () => {
          // Create a canvas element
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw the SVG image onto the canvas
          ctx.drawImage(img, 0, 0);

          // Convert canvas to PNG
          canvas.toBlob((blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "struktur.png"; // Set the filename with extension
            link.click();
            window.URL.revokeObjectURL(url); // Clean up the URL object
          }, "image/png");
        };
      } catch (error) {
        setError("Failed to save image. Please try again.");
      }
    }
    setShowModal(false);
  };

  return (
    <div className="min-h-screen" style={{ paddingTop: "6.5rem" }}>
      <main className="pb-8">
        <div className="mx-auto sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 relative">
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
                <button
                  onClick={handleSave}
                  className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Download
                </button>
              </div>
            </div>
            {error && (
              <Alert message={error} type="error" showIcon className="mb-4" />
            )}
            {loading ? (
              <div className="flex items-center justify-center w-full h-64">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
              </div>
            ) : (
              <div
                className="zoom-container bg-white shadow"
                onMouseMove={handleMouseMove}
              >
                <img src={imageUrl} alt="Struktur" className="zoom-image" />
                <div
                  className="zoom-rectangle"
                  style={{
                    ...zoomStyle,
                    backgroundImage: `url('${imageUrl}')`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h2 className="text-xl font-semibold mb-8">Konfirmasi</h2>
            <p className="mb-8">Apakah Anda ingin mendownload gambar ini?</p>
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
