// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProfileUser = () => {
  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    foto: null,
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
    umur: "",
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

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
          `http://localhost:3000/employees/${nip}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data.data;
        console.log("Fetched data:", data);

        if (data.tanggal_lahir) {
          const date = new Date(data.tanggal_lahir);
          const formattedDate = `${date
            .getDate()
            .toString()
            .padStart(2, "0")}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${date.getFullYear()}`;
          data.tanggal_lahir = formattedDate;
        }

        setFormData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.response ? error.response.data : error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCancel = () => {
    navigate("/Dashboard");
  };

  const handleSaveAsPDF = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConfirmSaveAsPDF = () => {
    setShowModal(false);
    alert("Berhasil menyimpan ke PDF!");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message || error}</div>;
  }

  const renderValue = (key) => {
    const value = formData[key] || ""; // Default to empty string if value is null or undefined
    if (key === "foto") {
      return value ? (
        <img
          src={value}
          alt="Foto"
          className="w-32 h-32 items-center object-cover"
        />
      ) : null;
    }
    return (
      <input
        type="text"
        value={value}
        disabled
        className="border border-gray-300 rounded-md p-2 w-full"
      />
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="py-8 w-full max-w-7xl">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Profil Pengguna
          </h1>
          <div className="space-x-4">
            <button
              onClick={handleSaveAsPDF}
              className="bg-custom-blue text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Save as PDF
            </button>
            <a href="/GantiPassword">
              <button className="bg-custom-blue text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Ganti Password
              </button>
            </a>
            <a href="/RequestEditData">
              <button className="bg-custom-blue text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Request Edit Data
              </button>
            </a>
          </div>
        </div>

        <div className="form-1 bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="form-2 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
            <h1 className="text-xl font-bold mb-6 text-start">Data Diri</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "nama",
                "foto",
                "jenis_kelamin",
                "tempat_lahir",
                "tanggal_lahir",
                "umur",
                "golongan_darah",
                "nik",
                "no_kk",
                "no_telepon",
                "no_rekening",
                "email",
                "email_gov",
              ].map((key) => (
                <div className="mb-4" key={key}>
                  <label className="block text-gray-700 mb-2">
                    {key.replace("_", " ").toUpperCase()}
                  </label>
                  {renderValue(key)}
                </div>
              ))}
            </div>
          </div>

          <div className="form-3 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
            <h1 className="text-xl font-bold mb-6 text-start">Alamat</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "kabupaten",
                "kecamatan",
                "desa",
                "jalan",
                "alamat_lengkap",
              ].map((key) => (
                <div className="mb-4" key={key}>
                  <label className="block text-gray-700 mb-2">
                    {key.replace("_", " ").toUpperCase()}
                  </label>
                  {renderValue(key)}
                </div>
              ))}
            </div>
          </div>

          <div className="form-4 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
            <h1 className="text-xl font-bold mb-6 text-start">Pendidikan</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["pendidikan", "jurusan", "tahun_tamat"].map((key) => (
                <div className="mb-4" key={key}>
                  <label className="block text-gray-700 mb-2">
                    {key.replace("_", " ").toUpperCase()}
                  </label>
                  {renderValue(key)}
                </div>
              ))}
            </div>
          </div>

          <div className="form-5 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
            <h1 className="text-xl font-bold mb-6 text-start">Pekerjaan</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "nip",
                "npwp",
                "bidang",
                "eselon",
                "sub_bidang",
                "jabatan_terakhir",
                "gol_ruang",
                "jenjang",
                "jenis",
                "jenis_tekon",
                "tahun_sk_awal",
                "tahun_sk_akhir",
                "masa_kerja",
                "Kelas_jabatan",
                "no_req_bkn",
              ].map((key) => (
                <div className="mb-4" key={key}>
                  <label className="block text-gray-700 mb-2">
                    {key.replace("_", " ").toUpperCase()}
                  </label>
                  {renderValue(key)}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-start">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-black py-2 px-4 rounded-md"
            >
              Kembali
            </button>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-8">Save as PDF</h2>
            <p className="mb-8">
              Apakah Anda yakin ingin menyimpan ke PDF?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmSaveAsPDF}
                className="bg-custom-blue text-white px-4 py-2 rounded-md"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileUser;
