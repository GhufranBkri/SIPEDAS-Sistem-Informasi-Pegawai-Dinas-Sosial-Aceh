// src/pages/Login.js
// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/img_login.svg";
import logoImage from "../assets/logo_login.svg";
import back from "../assets/back.svg";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openErrorModal = () => setIsErrorModalOpen(true);
  const closeErrorModal = () => setIsErrorModalOpen(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "https://sipedas-api.vercel.app/auth/login",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          withCredentials: true, // Include this if your server requires credentials
        }
      );

      if (response.status === 200) {
        const { token, user } = response.data;

        // Store the token and role in local storage
        localStorage.setItem("authToken", token);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("formData", JSON.stringify(user));

        // Navigate to the desired page after successful login
        if (user.role === "admin") {
          navigate("/Dashboard", { replace: true });
        } else if (user.role === "employee") {
          navigate("/ProfileUser", { replace: true });
        } else {
          // Handle other roles or unknown roles if necessary
          setErrorMessage("Unknown role. Please contact support.");
          openErrorModal();
        }
      } else {
        // Handle login failure
        setErrorMessage("Login failed. Please try again.");
        openErrorModal();
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || "Login failed.");
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
      openErrorModal();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="flex h-screen">
      {/* Left Section */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="flex flex-col items-center w-full max-w-md">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 text-6xl transition duration-300 ease-in-out"
          >
            <img src={back} alt="Back" />
          </button>

          <img src={logoImage} alt="Logo" className="w-52 -mt-20 mb-20" />

          <div className="w-full max-w-md p-8 bg-[#FBFBFB] shadow-md rounded-lg">
            <h1 className="text-4xl font-bold mt-6 mb-10 text-center text-gray-800">
              Login
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email / No. HP
                </label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-custom-blue focus:border-custom-blue sm:text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-custom-blue focus:border-custom-blue sm:text-sm"
                  placeholder="••••••••"
                  required
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 -mt-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {isPasswordVisible ? (
                    <AiFillEyeInvisible size={24} />
                  ) : (
                    <AiFillEye size={24} />
                  )}
                </div>
                <a
                  onClick={openModal}
                  className="text-sm text-custom-blue cursor-pointer hover:underline block mt-4 mb-6 text-right"
                >
                  Lupa Password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full bg-custom-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 hidden md:flex items-center justify-center bg-gray-200">
        <img
          src={loginImage}
          alt="Login"
          className="object-cover h-full w-full"
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm mx-4">
            <h2 className="text-lg font-semibold mb-6">Lupa Password?</h2>
            <p className="mb-6">
              Silahkan hubungi admin IT Dinas Sosial Provinsi Aceh untuk
              melakukan reset password.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300 ease-in-out"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {isErrorModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm mx-4">
            <h2 className="text-lg font-semibold mb-6">Login Gagal</h2>
            <p className="mb-6">{errorMessage}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeErrorModal}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300 ease-in-out"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
