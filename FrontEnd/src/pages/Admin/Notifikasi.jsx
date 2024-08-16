// src/pages/Notifikasi.js
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaFilter, FaTrash } from "react-icons/fa";
import axios from "axios";

// Utility function to format date and time
const formatDate = (date) => {
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24-hour format
  };
  return new Date(date).toLocaleString("en-GB", options).replace(",", ""); // en-GB for dd/mm/yyyy
};

const Notifikasi = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [requestDateFilter, setRequestDateFilter] = useState("");
  const [responseDateFilter, setResponseDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortCriteria, setSortCriteria] = useState("requestDateDesc");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const filterDropdownRef = useRef(null);
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
                  <p>Meminta mengubah data: {updatedDataKeys},</p>
                  <p>Request Date : {formatDate(item.requestDate)}</p>
                  <p>
                    Response Date :
                    {item.responseDate ? formatDate(item.responseDate) : "-"}
                  </p>
                </>
              ),
              status: item.status,
              requestDate: new Date(item.requestDate),
              responseDate: item.responseDate
                ? new Date(item.responseDate)
                : null,
              nip: item.employeeNip,
            };
          })
        );

        setNotifications(formattedNotifications);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate]);

  const handleItemClick = (id, nip) => {
    localStorage.setItem("employeeNip", nip);
    navigate(`/DetailRequest/${id}`);
    console.log("ID yang dikirim:", id);
    console.log("NIP yang disimpan:", nip);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authorization token found.");
      }
      await axios.delete(
        `http://localhost:3000/request/${notificationToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Remove the deleted notification from the state
      setNotifications(
        notifications.filter((notification) => notification.id !== id)
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification.");
    }
  };

  const handleFilterAndSort = useCallback(() => {
    let filtered = [...notifications];

    if (requestDateFilter) {
      filtered = filtered.filter((notification) =>
        notification.requestDate.toISOString().startsWith(requestDateFilter)
      );
    }

    if (responseDateFilter) {
      filtered = filtered.filter((notification) =>
        notification.responseDate?.toISOString().startsWith(responseDateFilter)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (notification) => notification.status === statusFilter
      );
    }

    filtered.sort((a, b) => {
      if (sortCriteria === "requestDateAsc") {
        return a.requestDate - b.requestDate;
      } else if (sortCriteria === "requestDateDesc") {
        return b.requestDate - a.requestDate;
      } else if (sortCriteria === "responseDateAsc") {
        return (a.responseDate || 0) - (b.responseDate || 0);
      } else if (sortCriteria === "responseDateDesc") {
        return (b.responseDate || 0) - (a.responseDate || 0);
      } else {
        return 0;
      }
    });

    setFilteredNotifications(filtered);
  }, [
    notifications,
    requestDateFilter,
    responseDateFilter,
    statusFilter,
    sortCriteria,
  ]);

  useEffect(() => {
    handleFilterAndSort();
  }, [handleFilterAndSort]);

  // Toggle filter dropdown visibility
  const toggleFilterDropdown = () => {
    setIsFilterDropdownOpen((prev) => !prev);
  };

  // Reset filters to initial state
  const resetFilters = () => {
    setRequestDateFilter("");
    setResponseDateFilter("");
    setStatusFilter("");
    setIsFilterDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openModal = (id) => {
    setNotificationToDelete(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNotificationToDelete(null);
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
          <div className="flex justify-between mb-4">
            <div className="flex justify-start">
              <h1 className="text-2xl font-bold mr-8">Notifikasi</h1>
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={toggleFilterDropdown}
                  className="text-gray-600 hover:text-gray-800 mt-1"
                >
                  <FaFilter size={24} />
                </button>

                {isFilterDropdownOpen && (
                  <div
                    className="absolute top-full left-0 bg-white border border-gray-300 rounded-md shadow-lg p-4 z-10"
                    style={{ width: "auto", minWidth: "330px" }}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm mb-2">
                            Filter by Request Date :
                          </label>
                          <input
                            type="date"
                            value={requestDateFilter}
                            onChange={(e) =>
                              setRequestDateFilter(e.target.value)
                            }
                            className="border border-gray-300 p-2 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm mb-2">
                            Filter by Response Date :
                          </label>
                          <input
                            type="date"
                            value={responseDateFilter}
                            onChange={(e) =>
                              setResponseDateFilter(e.target.value)
                            }
                            className="border border-gray-300 p-2 rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm mb-2">
                            Filter by Status :
                          </label>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 p-2 rounded-md w-full"
                          >
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        <div className="flex justify-start mt-12">
                          <button
                            onClick={resetFilters}
                            className="bg-blue-500 text-white py-2 px-9 rounded-md hover:bg-blue-600"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <select
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="requestDateDesc">Request Date (Terbaru)</option>
              <option value="requestDateAsc">Request Date (Terlama)</option>
              <option value="responseDateDesc">Response Date (Terbaru)</option>
              <option value="responseDateAsc">Response Date (Terlama)</option>
            </select>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 relative">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border border-gray-200 rounded-md shadow-sm relative cursor-pointer"
                  onClick={() =>
                    handleItemClick(notification.id, notification.nip)
                  }
                >
                  <h2 className="font-bold text-lg">{notification.title}</h2>
                  <div className="text-gray-600 pr-16">
                    {notification.content}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(notification.id);
                    }}
                    className="absolute top-1/3 right-4 text-red-500 hover:text-red-700"
                  >
                    <FaTrash size={24} className="mr-2" />
                  </button>

                  <span
                    className={`absolute top-1/3 right-20 p-2 mr-2 text-xs font-medium rounded-md ${
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

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-8">Konfirmasi Hapus</h2>
            <p className="mb-8">
              Apakah anda yakin ingin menghapus notifikasi ini?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-md mr-2"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifikasi;
