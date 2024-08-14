// src/pages/Notifikasi.js
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Notifikasi = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Cek userRole dari localStorage
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      navigate("/Dashboard");
    }

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
        return response.data.data.nama; // Assuming the employee name is in the 'name' field
      } catch (error) {
        console.error("Error fetching employee data:", error);
        return "Unknown";
      }
    };

    // Function to fetch notifications
    const fetchNotifications = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authorization token found.");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3000/request/update-request",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data.data; // Get data from axios response

        // Fetch employee names and format notifications
        const formattedNotifications = await Promise.all(
          data.map(async (item) => {
            const employeeName = await fetchEmployeeName(item.employeeNip);
            return {
              title: employeeName, // Title as employee name
              content: `Meminta mengubah data: ${JSON.stringify(
                item.updatedData,
                null,
                2
              )}`, // Showing detailed updated data
              status: item.status,
            };
          })
        );

        setNotifications(formattedNotifications);
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchNotifications();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="py-8">
        <div className="mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-4">Notifikasi</h1>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 relative">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border border-gray-200 rounded-md shadow-sm relative"
                >
                  <h2 className="font-bold text-lg">{notification.title}</h2>
                  <p className="text-gray-600">{notification.content}</p>
                  <span
                    className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-md ${
                      notification.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : notification.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {notification.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No new notifications</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifikasi;
