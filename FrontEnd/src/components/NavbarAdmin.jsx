// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaUser } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { Alert } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import logoIcon from "../assets/logo_text.svg";
import logoutIcon from "../assets/logout.svg";
import axios from "axios";

function NavbarAdmin() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleNotificationDropdown = async () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    if (!isNotificationDropdownOpen) {
      setLoading(true);
      // Mark all notifications as read when the dropdown is opened
      const readNotifications = notifications.map((notif) => notif.id);
      localStorage.setItem(
        "readNotifications",
        JSON.stringify(readNotifications)
      );
      setUnreadNotifications(0);
      setNotifications(
        notifications.map((notif) => ({ ...notif, isRead: true }))
      );
      // Fetch notifications if not already loaded
      if (notifications.length === 0) {
        await fetchNotifications();
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/", { replace: true });
  };

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    // Function to fetch employee name by NIP
    const fetchEmployeeName = async (nip) => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authorization token found.");
        }
        const response = await axios.get(
          `https://sipedas-dinas-sosial-aceh.vercel.app/employees/${nip}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data.data.nama;
      } catch (error) {
        return (
          <span className="bg-red-400 text-white px-1 rounded">
            User Deleted
          </span>
        );
      }
    };

    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authorization token found.");
    }

    try {
      const response = await axios.get(
        "https://sipedas-dinas-sosial-aceh.vercel.app/request/pending-request",
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
            isRead: false,
          };
        })
      );

      // Sort notifications by requestDate in descending order
      const sortedNotifications = formattedNotifications.sort(
        (a, b) => b.requestDate - a.requestDate
      );

      // Check and apply read status from localStorage
      const readNotifications =
        JSON.parse(localStorage.getItem("readNotifications")) || [];
      const updatedNotifications = sortedNotifications.map((notif) => ({
        ...notif,
        isRead: readNotifications.includes(notif.id),
      }));

      setNotifications(updatedNotifications);

      const countUnread = updatedNotifications.filter(
        (notif) => !notif.isRead
      ).length;
      setUnreadNotifications(countUnread);
    } catch (error) {
      if (
        error.response?.data?.message === "No pending update requests found"
      ) {
        // Handle this specific error without showing an error message
        setNotifications([]);
        setUnreadNotifications(0);
      } else {
        setError(error.response?.data?.message || error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
  };

  const getNavLinkClass = (path) => {
    return location.pathname === path
      ? "text-white border-b-2 border-white rounded-none"
      : "text-white hover:text-gray-300 hover:underline";
  };

  return (
    <nav className="bg-custom-blue p-4 fixed top-0 left-0 w-full z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/Dashboard" className="inline w-52">
          <img src={logoIcon} alt="Logo" />
        </a>
        <div className="flex items-center gap-6">
          <a
            href="/Dashboard"
            className={`${getNavLinkClass(
              "/Dashboard"
            )} p-2 rounded-md text-md font-medium transition duration-300 ease-in-out`}
          >
            Dashboard
          </a>
          <a
            href="/DataKaryawan"
            className={`${getNavLinkClass(
              "/DataKaryawan"
            )} p-2 rounded-md text-md font-medium transition duration-300 ease-in-out`}
          >
            Data Karyawan
          </a>
          <a
            href="/Struktur"
            className={`${getNavLinkClass(
              "/Struktur"
            )} p-2 rounded-md text-md font-medium transition duration-300 ease-in-out`}
          >
            Struktur
          </a>
          <div className="relative" ref={notificationDropdownRef}>
            <FaBell
              className="text-white hover:bg-white hover:text-custom-blue cursor-pointer rounded-full p-1 transition duration-300 ease-in-out"
              size={34}
              onClick={toggleNotificationDropdown}
            />
            {unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-3 p-1.5 bg-red-600 border-2 border-white rounded-full"></span>
            )}
            {isNotificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <span className="flex justify-between">
                    <span className="flex justify-start font-bold">
                      Notifications
                      <span className="text-sm text-gray-600">
                        ({notifications.length})
                      </span>
                      <button
                        className="bg-gray-300 text-gray-600 px-2 py-1 ml-3 rounded-md hover:bg-gray-400 focus:outline-none"
                        onClick={fetchNotifications}
                        disabled={loading}
                      >
                        <MdRefresh size={16} />
                      </button>
                    </span>

                    <span className="mr-4 bg-yellow-100 text-yellow-800 px-1 border rounded-md">
                      Pending
                    </span>
                  </span>
                </div>

                <div className="p-2 max-h-72 overflow-y-auto">
                  {error && (
                    <Alert
                      message={error}
                      type="error"
                      showIcon
                      className="mb-4"
                    />
                  )}
                  {loading ? (
                    <div className="w-full max-h-72 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 mt-28 mb-28 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <div
                        key={index}
                        className="relative mb-2 p-2 border-b border-gray-200 hover:bg-gray-100"
                      >
                        <img
                          src={logoutIcon}
                          alt="Logout Icon"
                          className="absolute top-6 right-2 w-5 h-auto border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                          onClick={() =>
                            handleItemClick(notification.id, notification.nip)
                          }
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
                    <div className="p-2 text-center text-gray-600">
                      No notifications
                    </div>
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
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                <a
                  href="/GantiPasswordAdmin"
                  className="flex justify-between w-full text-left font-medium px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Ganti Password
                  <img className="mt-1" src={logoutIcon} />
                </a>
                <button
                  className="flex justify-between w-full text-left font-medium px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                  <img className="mt-1" src={logoutIcon} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavbarAdmin;
