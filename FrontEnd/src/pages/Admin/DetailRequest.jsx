// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert } from "antd";
import axios from "axios";

const DetailRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedFields, setUpdatedFields] = useState({});
  const [highlightedFields, setHighlightedFields] = useState({});
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    foto: "",
    bidang: "",
    eselon: "",
    sub_bidang: "",
    jabatan_terakhir: "",
    gol_ruang: "",
    jenjang: "",
    jenis: "",
    jenis_kelamin: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    nik: "",
    npwp: "",
    no_rekening: "",
    no_kk: "",
    golongan_darah: "",
    no_telepon: "",
    email_gov: "",
    email: "",
    password: "",
    pendidikan: "",
    jurusan: "",
    tahun_tamat: "",
    kabupaten: "",
    kecamatan: "",
    desa: "",
    jalan: "",
    alamat_lengkap: "",
    tahun_sk_awal: "",
    tahun_sk_akhir: "",
    masa_kerja: "",
    Kelas_jabatan: "",
    jenis_tekon: "",
    no_req_bkn: "",
  });

  useEffect(() => {
    // Cek userRole dari localStorage
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      navigate("/Dashboard");
      return;
    }

    const fetchRequestData = async () => {
      try {
        const nip = localStorage.getItem("employeeNip");
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authorization token found.");
        }

        // Fetch employee data based on NIP
        const employeeResponse = await axios.get(
          `https://sipedas-dinas-sosial-aceh.vercel.app/employees/${nip}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch updated data based on request ID
        const requestResponse = await axios.get(
          `https://sipedas-dinas-sosial-aceh.vercel.app/request/update-request/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const updatedData = requestResponse.data.data.updatedData || {};
        const requestStatus = requestResponse.data.data.status || "";

        setFormData(employeeResponse.data.data); // Original data
        setUpdatedFields(updatedData); // Updated data
        setStatus(requestStatus);

        // If status is approved, save updated fields for highlighting
        if (requestStatus === "approved") {
          setHighlightedFields(updatedData);
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError("Failed to load data.");
      }
    };

    if (id) {
      fetchRequestData();
    } else {
      setError("ID is missing");
      setLoading(false);
    }
  }, [id, navigate, formData.tanggal_lahir]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // +1 because month is zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const updateRequest = async (newStatus, modalType) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authorization token found.");
      }

      setLoading(true);

      const response = await axios.put(
        `https://sipedas-dinas-sosial-aceh.vercel.app/request/update-request/${id}`,
        {
          status: newStatus,
          updatedData: updatedFields,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequestData(response.data.data);
      setUpdatedFields({});
      setStatus(newStatus);

      if (newStatus === "approved") {
        setHighlightedFields(updatedFields);
      }

      if (modalType === "approve") {
        setIsApproveModalOpen(true);
      } else if (modalType === "reject") {
        setIsRejectModalOpen(true);
      }
    } catch (error) {
      setLoading(false);
      setError("Failed to update request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderValue = (key, type) => {
    const originalValue = formData[key] || "";
    const updatedValue = updatedFields[key] || originalValue;
    const isUpdated = originalValue !== updatedValue;

    const getStatusClass = () => {
      if (status === "pending") return "border-yellow-500 bg-yellow-100";
      if (status === "approved") return "border-gray-300";
      if (status === "rejected") return "border-red-500 bg-red-100";
      return "border-gray-300";
    };

    let commonClasses;
    if (status === "pending" || status === "rejected") {
      commonClasses = `border p-2 rounded-md w-full ${
        isUpdated ? getStatusClass() : "border-gray-300"
      }`;
    } else {
      commonClasses = `border p-2 rounded-md w-full ${
        highlightedFields[key]
          ? "border-green-500 bg-green-100"
          : getStatusClass()
      }`;
    }

    if (key === "foto") {
      return (
        <div key={key}>
          <div className="relative">
            {updatedFields[key] ? (
              <img
                src={updatedFields[key]}
                alt="Updated Foto"
                className={`w-32 items-center object-cover mt-4 border-2 ${
                  highlightedFields[key]
                    ? "border-green-500 bg-green-100"
                    : getStatusClass()
                }`}
              />
            ) : (
              originalValue && (
                <img
                  src={originalValue}
                  alt="Original Foto"
                  className="w-32 items-center object-cover mt-4 border-2 border-gray-300"
                />
              )
            )}
          </div>
        </div>
      );
    }

    if (key === "alamat_lengkap") {
      return (
        <textarea
          value={updatedValue}
          disabled
          className={commonClasses}
          rows="4"
        />
      );
    }

    if (key === "tanggal_lahir") {
      return (
        <input
          type="text"
          value={formatDate(updatedValue)}
          disabled
          className={commonClasses}
          key={key}
        />
      );
    }

    return (
      <input
        type={type}
        value={updatedValue}
        disabled
        className={commonClasses}
        key={key}
      />
    );
  };

  const openModal = (actionType) => {
    const modalData = {
      approved: {
        title: "Konfirmasi Persetujuan",
        content: "Apakah Anda yakin ingin menyetujui permintaan ini?",
        action: () => updateRequest("approved", "approve"),
      },
      rejected: {
        title: "Konfirmasi Penolakan",
        content: "Apakah Anda yakin ingin menolak permintaan ini?",
        action: () => updateRequest("rejected", "reject"),
      },
    };

    if (modalData[actionType]) {
      setModalContent(modalData[actionType]);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCloseSuccessModal = () => {
    if (setIsApproveModalOpen) {
      setIsApproveModalOpen(false);
    } else {
      setIsRejectModalOpen(false);
    }
    navigate("/Notifikasi", { replace: true });
  };

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Request data not found.</p>
      </div>
    );
  }

  const getLabelText = (name) => {
    switch (name) {
      case "nip":
        return "NIP/No. Reg";
      default:
        return name.replace("_", " ").toUpperCase();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ paddingTop: "6.5rem" }}
    >
      <main className="pb-8 w-full max-w-7xl">
        <div className="form-1 bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-6 text-center">
              Detail Request
            </h1>
            <div className="">
              <label className="mr-2 font-medium">Status :</label>
              <input
                type="text"
                value={status}
                disabled
                className={`p-2 font-medium text-center rounded-md ${
                  status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                } w-24`}
              />
            </div>
          </div>
          <div className="form-2 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
            {error && (
              <Alert message={error} type="error" showIcon className="mb-4" />
            )}
            <h1 className="text-xl font-bold mb-6 text-start">Data Diri</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "nama", type: "text" },
                { name: "foto", type: "file" },
                { name: "jenis_kelamin", type: "text" },
                { name: "tempat_lahir", type: "text" },
                { name: "tanggal_lahir", type: "date" },
                { name: "golongan_darah", type: "text" },
                { name: "nik", type: "number" },
                { name: "no_kk", type: "number" },
                { name: "no_telepon", type: "number" },
                { name: "no_rekening", type: "text" },
                { name: "email", type: "text" },
                { name: "email_gov", type: "text" },
              ].map(({ name }) => (
                <div className="mb-4" key={name}>
                  <label className="block text-gray-700 mb-2">
                    {name.replace("_", " ").toUpperCase()}
                  </label>
                  {renderValue(name)}
                </div>
              ))}
            </div>
          </div>

          <div className="form-3 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
            <h1 className="text-xl font-bold mb-6 text-start">Alamat</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "kabupaten", type: "text" },
                { name: "kecamatan", type: "text" },
                { name: "desa", type: "text" },
                { name: "jalan", type: "text" },
                { name: "alamat_lengkap", type: "textarea" },
              ].map(({ name }) => (
                <div className="mb-4" key={name}>
                  <label className="block text-gray-700 mb-2">
                    {name.replace("_", " ").toUpperCase()}
                  </label>
                  {renderValue(name)}
                </div>
              ))}
            </div>
          </div>

          <div className="form-4 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
            <h1 className="text-xl font-bold mb-6 text-start">Pendidikan</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "pendidikan", type: "text" },
                { name: "jurusan", type: "text" },
                { name: "tahun_tamat", type: "number" },
              ].map(({ name }) => (
                <div className="mb-4" key={name}>
                  <label className="block text-gray-700 mb-2">
                    {name.replace("_", " ").toUpperCase()}
                  </label>
                  {renderValue(name)}
                </div>
              ))}
            </div>
          </div>

          <div className="form-5 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
            <h1 className="text-xl font-bold mb-6 text-start">Pekerjaan</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "nip", type: "number" },
                { name: "npwp", type: "text" },
                { name: "bidang", type: "text" },
                { name: "eselon", type: "text" },
                { name: "sub_bidang", type: "text" },
                { name: "jabatan_terakhir", type: "text" },
                { name: "gol_ruang", type: "text" },
                { name: "jenjang", type: "text" },
                { name: "jenis", type: "text" },
                { name: "jenis_tekon", type: "text" },
                { name: "tahun_sk_awal", type: "number" },
                { name: "tahun_sk_akhir", type: "number" },
                { name: "masa_kerja", type: "number" },
                { name: "Kelas_jabatan", type: "text" },
                { name: "no_req_bkn", type: "text" },
              ].map(({ name }) => (
                <div className="mb-4" key={name}>
                  <label className="block text-gray-700 mb-2">
                    {getLabelText(name)}
                  </label>
                  {renderValue(name)}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-4">
            {status === "pending" && (
              <>
                <button
                  onClick={() => navigate("/Notifikasi")}
                  className="bg-gray-300 text-black px-4 py-2 mt-4 rounded hover:bg-gray-400"
                >
                  Kembali
                </button>
                <div className="flex justify-end gap-8">
                  <button
                    onClick={() => openModal("rejected")}
                    className="bg-red-500 text-white px-4 py-2 mt-4 rounded hover:bg-red-600"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => openModal("approved")}
                    className="bg-green-500 text-white px-4 py-2 mt-4 rounded hover:bg-green-600"
                  >
                    Terima
                  </button>
                </div>
              </>
            )}
            {(status === "rejected" || status === "approved") && (
              <button
                onClick={() => navigate("/Notifikasi")}
                className="bg-gray-300 text-black px-4 py-2 mt-4 rounded hover:bg-gray-400"
              >
                Kembali
              </button>
            )}
          </div>
          {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center">
                <h2 className="text-xl font-semibold mb-4">Loading...</h2>
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mx-auto"></div>
              </div>
            </div>
          )}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-md shadow-md max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">{modalContent.title}</h2>
                <p className="mb-6">{modalContent.content}</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCloseModal}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                  >
                    Batal
                  </button>
                  <button
                    onClick={modalContent.action}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Ya
                  </button>
                </div>
              </div>
            </div>
          )}
          {isRejectModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center">
                <h2 className="text-xl font-semibold mb-8">Sukses Menolak</h2>
                <p className="mb-8">Data request berhasil di tolak !</p>
                <button
                  onClick={handleCloseSuccessModal}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
                >
                  OK
                </button>
              </div>
            </div>
          )}
          {isApproveModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center">
                <h2 className="text-xl font-semibold mb-8">Sukses Menerima</h2>
                <p className="mb-8">
                  Data request berhasil di terima dan diperbarui !
                </p>
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

export default DetailRequest;
