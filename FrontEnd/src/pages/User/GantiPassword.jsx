// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert } from "antd";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const GantiPassword = () => {
  const [formData, setFormData] = useState({
    passwordlama: "",
    passwordbaru: "",
    konfirmasipasswordbaru: "",
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState({
    passwordlama: false,
    passwordbaru: false,
    konfirmasipasswordbaru: false,
  });

  const togglePasswordVisibility = (field) => {
    setIsPasswordVisible((prevVisibility) => ({
      ...prevVisibility,
      [field]: !prevVisibility[field],
    }));
  };

  useEffect(() => {
    // Cek userRole dari localStorage
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "employee") {
      navigate("/Dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedFormData = localStorage.getItem("formData");
        if (!storedFormData) {
          navigate("/Dashboard");
          return;
        }

        const formDataObject = JSON.parse(storedFormData);
        const nip = formDataObject.nip;

        if (!nip) {
          navigate("/Dashboard");
          return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authorization token found.");
        }

        const response = await axios.get(
          `https://sipedas-api.vercel.app/employees/${nip}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data.data;

        setFormData((prevFormData) => ({
          ...prevFormData,
          passwordlama: data.passwordlama || "",
          passwordbaru: data.passwordbaru || "",
          konfirmasipasswordbaru: data.konfirmasipasswordbaru || "",
        }));
        setLoading(false);
      } catch (error) {
        setError(error.response ? error.response.data : error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (formData.passwordbaru && formData.konfirmasipasswordbaru) {
      if (formData.passwordbaru !== formData.konfirmasipasswordbaru) {
        setErrorMessage(
          "Konfirmasi password baru tidak cocok dengan password baru."
        );
      } else {
        setErrorMessage("");
      }
    }
  }, [formData.passwordbaru, formData.konfirmasipasswordbaru]);

  const handleCancel = () => {
    navigate("/ProfileUser");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (errorMessage) {
      // Jangan izinkan submit jika ada error
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authorization token found.");
      }

      await axios.put(
        `https://sipedas-api.vercel.app/auth/change-password`,
        {
          oldPassword: formData.passwordlama,
          newPassword: formData.passwordbaru,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowSuccessModal(true);
      setLoading(false);
    } catch (error) {
      setErrorMessage(error.response ? error.response.data : error.message);
      alert("Gagal mengganti password. Silakan coba lagi.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/ProfileUser", { replace: true });
  };

  return (
    <div
      className=" flex items-center justify-center"
      style={{ paddingTop: "6.5rem" }}
    >
      <main className="pb-8 w-full max-w-7xl">
        <div className="form-1 bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-14 text-center">
            Ganti Password
          </h1>
          {error && (
            <Alert message={error} type="error" showIcon className="mb-4" />
          )}
          <div className="form-3 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
            <h1 className="text-xl font-bold mb-6 text-start">
              Akun Login User
            </h1>
            <h1 className="text-l mb-6 text-start text-red-600">
              Hati-hati mengubah data ini !
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4 relative">
                <label className="block text-gray-700 mb-2">
                  Password Lama
                </label>
                <input
                  type={isPasswordVisible.passwordlama ? "text" : "password"}
                  name="passwordlama"
                  value={formData.passwordlama}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 mt-8 flex items-center cursor-pointer"
                  onClick={() => togglePasswordVisibility("passwordlama")}
                >
                  {isPasswordVisible.passwordlama ? (
                    <AiFillEyeInvisible />
                  ) : (
                    <AiFillEye />
                  )}
                </div>
              </div>
              <div className="mb-4 relative">
                <label className="block text-gray-700 mb-2">
                  Password Baru
                </label>
                <input
                  type={isPasswordVisible.passwordbaru ? "text" : "password"}
                  name="passwordbaru"
                  value={formData.passwordbaru}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 top-1/2 flex items-center cursor-pointer"
                  onClick={() => togglePasswordVisibility("passwordbaru")}
                >
                  {isPasswordVisible.passwordbaru ? (
                    <AiFillEyeInvisible />
                  ) : (
                    <AiFillEye />
                  )}
                </div>
              </div>
              <div className="mb-4 relative">
                <label className="block text-gray-700 mb-2">
                  Konfirmasi Password Baru
                </label>
                <input
                  type={
                    isPasswordVisible.konfirmasipasswordbaru
                      ? "text"
                      : "password"
                  }
                  name="konfirmasipasswordbaru"
                  value={formData.konfirmasipasswordbaru}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 mt-8 flex items-center cursor-pointer"
                  onClick={() =>
                    togglePasswordVisibility("konfirmasipasswordbaru")
                  }
                >
                  {isPasswordVisible.konfirmasipasswordbaru ? (
                    <AiFillEyeInvisible />
                  ) : (
                    <AiFillEye />
                  )}
                </div>
              </div>
            </div>
            {errorMessage && (
              <p className="text-red-600 text-sm">{errorMessage}</p>
            )}
          </div>

          <div className="mt-14 flex justify-between">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-black py-2 px-4 rounded-md"
            >
              Kembali
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-blue-500 text-white py-2 px-4 rounded-md"
            >
              Simpan
            </button>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center">
            <h2 className="text-xl font-semibold mb-8">Sukses</h2>
            <p className="mb-8">Password Berhasil Diubah !</p>
            <button
              onClick={handleCloseSuccessModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              OK
            </button>
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
    </div>
  );
};

export default GantiPassword;
