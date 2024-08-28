// src/pages/GantiStruktur.js
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const GantiStruktur = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Cek userRole dari localStorage
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      navigate("/Dashboard");
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/svg+xml")
    ) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreview(null);
      alert("Hanya file PNG, JPG, dan SVG yang diizinkan!");
    }
  };

  const handleSave = () => {
    setShowModal(true);
  };

  const handleConfirmSave = async () => {
    if (!selectedFile) return;

    setShowModal(false);
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Unauthorized access. Please log in.");
        return;
      }

      // Upload the file
      const formData = new FormData();
      formData.append("image", selectedFile);

      const uploadResponse = await axios.post(
        "https://sipedas-dinas-sosial-aceh.vercel.app/profile/upload-foto",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const imageUrl = uploadResponse.data.data.imageUrl;

      // Send the image URL to update the structure
      await axios.post(
        "https://sipedas-dinas-sosial-aceh.vercel.app/struktur/upload-foto",
        { imageUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowSuccessModal(true);
    } catch (error) {
      alert("Gagal menyimpan gambar.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/Struktur", { replace: true });
  };

  return (
    <div
      className=" flex items-center justify-center"
      style={{ paddingTop: "6.5rem" }}
    >
      <main className="pb-8 w-full max-w-7xl">
        <div className=" bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-8 text-center">
            Ganti Struktur
          </h1>

          <div className="flex flex-col items-center justify-center bg-white shadow  overflow-hidden sm:rounded-lg p-6 relative w-full max-w-7xl">
            <label
              className="block mb-2 text-lg font-medium text-black dark:text-white"
              htmlFor="file_input"
            >
              Upload file
            </label>
            <input
              type="file"
              accept=".png, .jpg, .jpeg, .svg"
              onChange={handleFileChange}
              className="border border-black p-2 rounded-md cursor-pointer focus:outline-none"
            />
            <p
              className="mt-1 text-sm text-gray-500 dark:text-gray-300 mb-4"
              id="file_input_help"
            >
              hanya file SVG, PNG, JPG.
            </p>

            {preview && (
              <div className="flex justify-center mb-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-1/3 h-auto mt-4 border rounded-md"
                />
              </div>
            )}
          </div>
          <div className="flex justify-between mb-4 mt-8">
            <a href="/Struktur">
              <button className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300 ease-in-out">
                Kembali
              </button>
            </a>
            <button
              onClick={handleSave}
              disabled={!selectedFile}
              className={`px-4 py-2 rounded-md transition duration-300 ease-in-out ${
                selectedFile
                  ? "bg-blue-500 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Simpan
            </button>
          </div>
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
                <h2 className="text-xl font-semibold mb-8">Konfirmasi</h2>
                <p className="mb-8">
                  Apakah Anda yakin ingin mengganti menjadi gambar ini?
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300 ease-in-out"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmSave}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
          {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center">
                <h2 className="text-xl font-semibold mb-4">Loading...</h2>
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mx-auto"></div>
              </div>
            </div>
          )}
          {showSuccessModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center">
                <h2 className="text-xl font-semibold mb-8">Sukses</h2>
                <p className="mb-8">Gambar berhasil disimpan dan diperbarui!</p>
                <button
                  onClick={handleCloseSuccessModal}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GantiStruktur;
