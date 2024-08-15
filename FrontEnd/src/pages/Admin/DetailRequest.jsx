// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const DetailRequest = () => {
  const { id } = useParams(); // Get request ID from URL params
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedFields, setUpdatedFields] = useState({});

  useEffect(() => {
    const fetchRequestData = async () => {
      console.log("Request ID:", id);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authorization token found.");
        }

        const response = await axios.get(
          `http://localhost:3000/request/update-request/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRequestData(response.data.data);
        if (response.data.data.updatedData) {
          setUpdatedFields(response.data.data.updatedData);
        }
        setLoading(false);
      } catch (error) {
        console.error(
          "Error fetching request data:",
          error.response ? error.response.data : error.message
        );
        console.error(
          "Status:",
          error.response ? error.response.status : "Unknown"
        );
        console.error(
          "Headers:",
          error.response ? error.response.headers : "Unknown"
        );
        setLoading(false);
      }
    };

    if (id) {
      fetchRequestData();
    } else {
      console.error("ID is missing");
      setError("ID is missing");
      setLoading(false);
    }
  }, [id]);

  // Fungsi terpisah untuk memperbarui permintaan
  const updateRequest = async (newStatus) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authorization token found.");
      }

      const response = await axios.put(
        `http://localhost:3000/request/update-request/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequestData(response.data.data);
      setUpdatedFields({});
    } catch (error) {
      console.error(
        "Error updating request:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setUpdatedFields((prev) => ({ ...prev, [fieldName]: value }));
  };

  const renderField = (fieldName, value, isUpdated) => {
    return (
      <div className="mb-4" key={fieldName}>
        <label className="block text-gray-700">{fieldName}:</label>
        <input
          type="text"
          className={`border p-2 w-full ${
            isUpdated ? "border-red-500 bg-red-100" : "border-gray-300"
          }`}
          value={value}
          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          readOnly={!isUpdated}
        />
        {isUpdated && <span className="text-red-500 text-sm">Updated</span>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading request data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Request data not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-4">Detail Request</h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 relative">
          <form>
            {Object.entries(requestData).map(([key, value]) => {
              if (key !== "updatedData" && key !== "status") {
                return renderField(
                  key,
                  updatedFields[key] || value,
                  key in updatedFields
                );
              }
              return null;
            })}

            {renderField("status", requestData.status, false)}

            <div className="mb-4">
              <label className="block text-gray-700">Request Date:</label>
              <input
                type="text"
                className="border border-gray-300 p-2 w-full"
                value={new Date(requestData.requestDate).toLocaleString()}
                readOnly
              />
            </div>

            {requestData.responseDate && (
              <div className="mb-4">
                <label className="block text-gray-700">Response Date:</label>
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full"
                  value={new Date(requestData.responseDate).toLocaleString()}
                  readOnly
                />
              </div>
            )}

            <div className="mt-4">
              <button
                type="button"
                className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => updateRequest("approved")}
              >
                Approve
              </button>
              <button
                type="button"
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => updateRequest("rejected")}
              >
                Reject
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DetailRequest;
