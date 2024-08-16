// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logoIcon from "../assets/logo_text.svg";
import logoutIcon from "../assets/logout.svg";
import axios from "axios";

function NavbarAdmin() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [notifications, setNotifications] = useState([]);
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  useEffect(() => {
    async function fetchNotifications() {
      // Function to fetch employee name by NIP
      const fetchEmployeeName = async (nip) => {
        try {
          const token = localStorage.getItem("authToken");
          if (!token) {
            throw new Error("No authorization token found.");
          }
          const response = await axios.get(
            `http://localhost:3000/employees/${nip}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return response.data.data.nama;
        } catch (error) {
          console.error("Error fetching employee data:", error);
          return "Unknown";
        }
      };

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authorization token found.");
      }

      try {
        const response = await axios.get(
          "http://localhost:3000/request/pending-request",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data.data;

        // Fetch employee names and format notifications
        const formattedNotifications = await Promise.all(
          data.map(async (item) => {
            const employeeName = await fetchEmployeeName(item.employeeNip);
            // Extract and format updatedData keys
            const updatedDataKeys = Object.keys(item.updatedData)
              .map((key) => key.replace(/_/g, " "))
              .join(", ");

            return {
              id: item._id,
              title: employeeName,
              content: `Meminta mengubah data: ${updatedDataKeys}`,
              requestDate: new Date(item.requestDate),
              status: item.status,
              nip: item.employeeNip,
            };
          })
        );

        // Sort notifications by requestDate in descending order
        const sortedNotifications = formattedNotifications.sort(
          (a, b) => b.requestDate - a.requestDate
        );

        setNotifications(sortedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }

    fetchNotifications();

    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setIsNotificationDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleItemClick = (id, nip) => {
    localStorage.setItem("employeeNip", nip); // Store NIP in localStorage
    navigate(`/DetailRequest/${id}`);
    console.log("ID yang dikirim:", id);
    console.log("NIP yang disimpan:", nip);
  };

  return (
    <nav className="bg-custom-blue p-4">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/Dashboard" className="inline w-52">
          <img src={logoIcon} alt="Logo" />
        </a>
        <div className="flex items-center gap-6">
          <a
            href="/Dashboard"
            className="text-white hover:text-gray-300 hover:underline p-2 rounded-md text-md font-medium transition duration-300 ease-in-out"
          >
            Dashboard
          </a>
          <a
            href="/DataKaryawan"
            className="text-white hover:text-gray-300 hover:underline p-2 rounded-md text-md font-medium transition duration-300 ease-in-out"
          >
            Data Karyawan
          </a>
          <a
            href="/Struktur"
            className="text-white hover:text-gray-300 hover:underline p-2 rounded-md text-md font-medium transition duration-300 ease-in-out"
          >
            Struktur
          </a>
          <div className="relative" ref={notificationDropdownRef}>
            <FaBell
              className="text-white hover:bg-white hover:text-custom-blue cursor-pointer rounded-full p-1 transition duration-300 ease-in-out"
              size={34}
              onClick={toggleNotificationDropdown}
            />
            {isNotificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <span className="font-bold">Notifications</span>
                </div>
                <div className="p-2 max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <div
                        key={index}
                        className="relative mb-2 p-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleItemClick(notification.id, notification.nip)}
                      >
                        <img
                          src={logoutIcon}
                          alt="Logout Icon"
                          className="absolute top-6 right-2 w-4 h-4"
                        />
                        <div className="pr-6">
                          <span className="font-bold">
                            {notification.title}
                          </span>
                          <p className="text-gray-600 truncate">
                            {notification.content}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No new notifications</p>
                  )}
                </div>
                <div className="p-2 mb-2 border-gray-200 text-center border-t">
                  <a
                    href="/Notifikasi"
                    className="font-light text-custom-blue hover:underline"
                  >
                    See All
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={profileDropdownRef}>
            <FaUser
              className="text-white hover:bg-white hover:text-custom-blue cursor-pointer hover:rounded-full rounded-full p-1 transition duration-300 ease-in-out"
              size={36}
              onClick={toggleProfileDropdown}
            />
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                <a
                  href="#"
                  className="flex items-center justify-between font-medium px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                  <img src={logoutIcon} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavbarAdmin;
