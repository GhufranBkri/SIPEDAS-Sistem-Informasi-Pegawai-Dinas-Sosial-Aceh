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
      return;
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
        return response.data.data.nama;
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

        const data = response.data.data; 

        // Fetch employee names and format notifications
        const formattedNotifications = await Promise.all(
          data.map(async (item) => {
            const employeeName = await fetchEmployeeName(item.employeeNip);
            const updatedDataKeys = Object.keys(item.updatedData)
            .map((key) => key.replace(/_/g, " "))
            .join(", ");

            return {
              id: item._id,
              title: employeeName,
              content: (
                <>
                <p>
                  Meminta mengubah data: {updatedDataKeys},
                </p>
                  <p>
                    Request Date : {new Date(item.requestDate).toLocaleString()}
                  </p>
                  <p>
                    Response Date :{" "}
                    {item.responseDate
                      ? new Date(item.responseDate).toLocaleString()
                      : "-"}
                  </p>
                </>
              ),
              status: item.status,
              requestDate: new Date(item.requestDate),
            };
          })
        );

        // Sort notifications by requestDate in descending order
        const sortedNotifications = formattedNotifications.sort(
          (a, b) => b.requestDate - a.requestDate
        );

        setNotifications(sortedNotifications);
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchNotifications();
  }, [navigate]);

  const handleItemClick = (id) => {
    navigate(`/DetailRequest/${id}`);
    console.log("ID yang dikirim:", id);
  };

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
                  className="mb-4 p-4 border border-gray-200 rounded-md shadow-sm relative cursor-pointer"
                  onClick={() => handleItemClick(notification.id)}
                >
                  <h2 className="font-bold text-lg">{notification.title}</h2>
                  <div className="text-gray-600 pr-16">{notification.content}</div>

                  <span
                    className={`absolute top-1/2 right-2 px-2 mr-2 text-xs font-medium rounded-md ${
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
