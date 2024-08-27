// src/pages/Notifikasi.js
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaFilter, FaTrash } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { Alert } from "antd";
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

// Utility function to get color based on status
const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-200 text-yellow-800"; // Light yellow
    case "approved":
      return "bg-green-200 text-green-800"; // Light green
    case "rejected":
      return "bg-red-200 text-red-800"; // Light red
    default:
      return "bg-gray-200 text-gray-800"; // Default gray
  }
};

const Notifikasi = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [requestDateFilter, setRequestDateFilter] = useState("");
  const [responseDateFilter, setResponseDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortCriteria, setSortCriteria] = useState("requestDateDesc");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDetailDeletedModal, setShowDetailDeletedModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const filterDropdownRef = useRef(null);
  const navigate = useNavigate();

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
      return (
        <span className="bg-red-400 text-white p-1 rounded">User Deleted</span>
      );
    }
  };

  // Function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Unauthorized access. Please log in.");
      return;
    }

    setLoading(true);
    setError(null);

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
            .reduce((acc, key, index, array) => {
              if (index === array.length - 1) {
                return `${acc}${key}.`; // No comma for the last item
              } else {
                return `${acc}${key}, `;
              }
            }, "");

          return {
            id: item._id,
            title: employeeName,
            content: (
              <>
                <p>Meminta mengubah data: {updatedDataKeys}</p>
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
      if (
        error.response?.data?.message === "No pending update requests found"
      ) {
        // Handle this specific error without showing an error message
        setNotifications([]);
      } else {
        setError(error.response?.data?.message || error.message);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Cek userRole dari localStorage
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      navigate("/Dashboard");
      return;
    }

    fetchNotifications();
  }, [navigate, fetchNotifications]);

  const handleItemClick = (notification) => {
    if (typeof notification.title === 'object' && notification.title.props.children === 'User Deleted') {
      setShowDetailDeletedModal(true);
    } else {
      localStorage.setItem("employeeNip", notification.nip);
      navigate(`/DetailRequest/${notification.id}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authorization token found.");
      }

      setLoading(true);

      await axios.delete(
        `http://localhost:3000/request/deleted-request/${id}`,
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
      setShowSuccessModal(true);
    } catch (error) {
      setError("Failed to delete notification. Please try again later.");
      setIsModalOpen(false);
      setLoading(false);
    } finally {
      setLoading(false);
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNotifications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

  const handleRefresh = () => {
    fetchNotifications();
  };

  const openModal = (id) => {
    setNotificationToDelete(id);
    setIsModalOpen(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/Notifikasi", { replace: true });
  };

  const closeDetailDeletedModal = () => {
    setShowDetailDeletedModal(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNotificationToDelete(null);
  };

  return (
    <div className="pb-8 sm:px-6 lg:px-8" style={{ paddingTop: "6.5rem" }}>
      <main>
        <div className="bg-white shadow sm:rounded-lg mx-auto sm:p-6 lg:p-8">
          <div className="flex justify-between mb-4">
            <div className="flex justify-start gap-6 items-center">
              <h1 className="text-2xl font-bold">Notifikasi</h1>
              <MdRefresh
                className="bg-gray-300 fill-black rounded-lg p-2 cursor-pointer hover:bg-gray-400"
                size={36}
                onClick={handleRefresh}
              />
            </div>
            <div className="flex justify-end gap-8 items-center">
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={toggleFilterDropdown}
                  className="text-gray-600 hover:text-gray-800 mt-1"
                >
                  <FaFilter size={24} />
                </button>

                {isFilterDropdownOpen && (
                  <div
                    className="absolute top-full right-0 bg-white border border-gray-300 rounded-md shadow-lg p-4 z-10"
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
              <select
                value={sortCriteria}
                onChange={(e) => setSortCriteria(e.target.value)}
                className="border border-gray-300 rounded-md p-2"
              >
                <option value="requestDateDesc">Request Date (Terbaru)</option>
                <option value="requestDateAsc">Request Date (Terlama)</option>
                <option value="responseDateDesc">
                  Response Date (Terbaru)
                </option>
                <option value="responseDateAsc">Response Date (Terlama)</option>
              </select>
            </div>
          </div>
          {error && (
            <Alert message={error} type="error" showIcon className="mb-4" />
          )}

          <div className="bg-white border border-gray-300 rounded-lg shadow-md">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-4 border-b border-r text-center w-10">No</th>
                  <th className="p-4 border-b border-r text-center w-1/12">
                    User
                  </th>
                  <th className="p-4 border-b border-r text-center w-9/12">
                    Content
                  </th>
                  <th className="p-4 border-b border-r text-center w-1/12">
                    Status
                  </th>
                  <th className="p-4 border-b text-center w-1/12">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((notification, index) => (
                  <tr key={notification.id}>
                    <td className="py-4 px-8 border-b border-r">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-4 py-4 border-b border-r text-center">
                      {notification.title}
                    </td>
                    <td className="p-4 border-b border-r">
                      {notification.content}
                    </td>
                    <td className="border-b px-4">
                      <div
                        className={`flex justify-center items-center p-1 border-b border-r rounded-md ${getStatusColor(
                          notification.status
                        )}`}
                      >
                        {notification.status.charAt(0).toUpperCase() +
                          notification.status.slice(1)}
                      </div>
                    </td>
                    <td className="py-4 px-12 border-l border-b">
                      <div className="flex space-x-12">
                        <button
                          onClick={() => handleItemClick(notification)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => openModal(notification.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash size={24} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredNotifications.length === 0 && (
              <div className="text-center py-4">No notifications found</div>
            )}
          </div>
          <div className="flex justify-between mt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="bg-blue-300 text-gray-800 px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-400 disabled:hover:bg-blue-300"
            >
              Previous
            </button>
            <div className="flex items-center">
              Page {currentPage} of {totalPages}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="bg-blue-300 text-gray-800 px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-400 disabled:hover:bg-blue-300"
            >
              Next
            </button>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
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
                onClick={() => handleDelete(notificationToDelete)}
                className="bg-red-500 text-white px-4 py-2 rounded-md mr-2"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-40">
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
            <p className="mb-8">Notifikasi berhasil di hapus !</p>
            <button
              onClick={handleCloseSuccessModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showDetailDeletedModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              User Deleted
            </h2>
            <div className="mb-4">User ini telah dihapus</div>
            <div className="flex justify-end">
              <button
                onClick={closeDetailDeletedModal}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifikasi;
