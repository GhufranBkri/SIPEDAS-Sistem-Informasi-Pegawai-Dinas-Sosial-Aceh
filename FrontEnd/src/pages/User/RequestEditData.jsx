// src/pages/RequestEditData.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Number.css";

const RequestEditData = () => {
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

  const [fotoPreview, setFotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const inputRefs = useRef({});
  const [showModal, setShowModal] = useState(false);
  const [oldImageUrl, setOldImageUrl] = useState("");
  const [initialFormData, setInitialFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const jenisKelaminOptions = ["Laki-laki", "Perempuan"];
  const golonganDarahOptions = ["A", "B", "AB", "O"];
  const jenisOptions = ["PNS", "Tenaga Kontrak"];
  const kelasJabatanOptions = ["I", "II", "III", "IV"];
  const navigate = useNavigate();

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

        // Format tanggal_lahir for input
        if (data.tanggal_lahir) {
          data.tanggal_lahir = formatDateForInput(data.tanggal_lahir);
        }

        setFormData(data);
        setInitialFormData(data);
        setFotoPreview(data.foto || null);
        setOldImageUrl(data.foto || "");
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/Dashboard");
      }
    };

    fetchData();
  }, [navigate]);

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Converts to 'yyyy-MM-dd' format
  };

  const parseDateForServer = (dateString) => {
    return new Date(dateString).toISOString(); // Converts to 'yyyy-MM-ddTHH:mm:ss.sssZ' format
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    let newErrors = { ...errors };

    if (type === "file") {
      if (files[0]) {
        const file = files[0];
        const allowedTypes = ["image/png", "image/jpeg"];
        if (!allowedTypes.includes(file.type)) {
          newErrors[name] =
            "Invalid file type. Only PNG, JPG, and JPEG are allowed.";
          setFormData({ ...formData, [name]: "" });
          setFotoPreview(null);
        } else {
          setFormData({ ...formData, [name]: file, foto_lama: oldImageUrl });
          setFotoPreview(URL.createObjectURL(file));
          delete newErrors[name];
        }
      } else {
        setFormData({ ...formData, [name]: "" });
        setFotoPreview(null);
        newErrors[name] = "This field is required";
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Real-time validation
    if (name === "email" || name === "email_gov") {
      if (!validateEmail(value)) {
        newErrors[name] = "Invalid email format";
      } else {
        delete newErrors[name];
      }
    } else if (
      ["tahun_tamat", "tahun_sk_awal", "tahun_sk_akhir"].includes(name)
    ) {
      if (!validateYear(value)) {
        newErrors[name] = "Must be a 4-digit year";
      } else {
        delete newErrors[name];
      }
    } else if (value === "" || (name === "foto" && !files.length)) {
      newErrors[name] = "This field is required";
    } else {
      delete newErrors[name];
    }

    setErrors(newErrors);

    // Scroll to the first error if any
    const firstErrorElement = Object.keys(newErrors)[0];
    if (firstErrorElement) {
      inputRefs.current[firstErrorElement]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateYear = (year) => {
    const yearRegex = /^\d{4}$/;
    return yearRegex.test(year);
  };

  const validateForm = () => {
    const newErrors = {};
    let firstErrorElement = null;

    Object.keys(formData).forEach((key) => {
      if (formData[key] === "" || (key === "foto" && !formData[key])) {
        newErrors[key] = "This field is required";
        if (!firstErrorElement) {
          firstErrorElement = inputRefs.current[key];
        }
      } else if (key === "email" || key === "email_gov") {
        if (!validateEmail(formData[key])) {
          newErrors[key] = "Invalid email format";
          if (!firstErrorElement) {
            firstErrorElement = inputRefs.current[key];
          }
        }
      } else if (
        ["tahun_tamat", "tahun_sk_awal", "tahun_sk_akhir"].includes(key)
      ) {
        if (!validateYear(formData[key])) {
          newErrors[key] = "Must be a 4-digit year";
          if (!firstErrorElement) {
            firstErrorElement = inputRefs.current[key];
          }
        }
      }
    });

    setErrors(newErrors);

    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return Object.keys(newErrors).length === 0;
  };

  const getUpdatedData = () => {
    const updatedData = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== initialFormData[key]) {
        updatedData[key] = formData[key];
      }
    });
    return updatedData;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("Data yang akan dikirim:", formData);

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No token found");
      }

      // Convert date before sending to the server
      if (formData.tanggal_lahir) {
        formData.tanggal_lahir = parseDateForServer(formData.tanggal_lahir);
      }

      let imageUrl = formData.foto;
      if (formData.foto && typeof formData.foto !== "string") {
        const fotoFormData = new FormData();

        fotoFormData.append("image", formData.foto);
        fotoFormData.append("imageUrl", oldImageUrl);

        console.log("Mengirim foto baru:", formData.foto);
        console.log("URL foto lama:", oldImageUrl);

        try {
          const uploadResponse = await axios.post(
            `http://localhost:3000/profile/upload-foto`,
            fotoFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          console.log("Respons lengkap dari server:", uploadResponse);

          if (
            uploadResponse.data &&
            uploadResponse.data.status === "success" &&
            uploadResponse.data.data &&
            uploadResponse.data.data.imageUrl
          ) {
            imageUrl = uploadResponse.data.data.imageUrl;
            console.log("Foto berhasil diunggah:", imageUrl);
          } else {
            console.error(
              "Respons server tidak sesuai format yang diharapkan:",
              uploadResponse.data
            );
            throw new Error("Format respons server tidak sesuai");
          }
        } catch (error) {
          console.error("Error saat mengunggah foto:", error);
          throw error;
        }
      }

      // Menyusun updatedData hanya dengan field yang berubah
      const updatedData = getUpdatedData();

      // Jika ada perubahan pada foto, tambahkan ke updatedData
      if (imageUrl !== oldImageUrl) {
        updatedData.foto = imageUrl;
      }

      // Hanya kirim data jika ada yang diperbarui
      if (Object.keys(updatedData).length === 0) {
        alert("Tidak ada data yang diubah.");
        return;
      }

      // Mengirim data yang diperbarui
      const payload = {
        nip: formData.nip,
        updatedData,
      };

      // Mengirim data lain
      const response = await axios.post(
        `http://localhost:3000/request/update-request/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Data berhasil diperbarui:", response.data);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "Terjadi kesalahan. Silakan coba lagi nanti.";

      if (error.response) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
        console.error("Response headers:", error.response?.headers);

        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        console.error("Request:", error.request);
        errorMessage = "Tidak ada respons dari server. Periksa koneksi Anda.";
      } else {
        console.error("Error message:", error.message);
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWithConfirmation = async (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirmModal = (e) => {
    e.preventDefault();
    setShowModal(false);
    handleSubmit();
  };

  const handleCancelModal = () => {
    setShowModal(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/ProfileUser");
  };

  const handleCancel = () => {
    window.location.href = "/ProfileUser";
  };

  const preventInvalidInput = (e) => {
    if (["e", "E", "-", "+", "."].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="py-8 w-full max-w-7xl">
        <div className="form-1 bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Edit Data Karyawan
          </h1>
          <form onSubmit={handleSubmitWithConfirmation}>
            <div className="form-2 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
              <h1 className="text-xl font-bold mb-6 text-start">Data Diri</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "nama", type: "text" },
                  { name: "foto", type: "file" },
                  {
                    name: "jenis_kelamin",
                    type: "select",
                    options: jenisKelaminOptions,
                  },
                  { name: "tempat_lahir", type: "text" },
                  { name: "tanggal_lahir", type: "date" },
                  {
                    name: "golongan_darah",
                    type: "select",
                    options: golonganDarahOptions,
                  },
                  { name: "nik", type: "number" },
                  { name: "no_kk", type: "number" },
                  { name: "no_telepon", type: "number" },
                  { name: "no_rekening", type: "number" },
                  { name: "email", type: "text" },
                  { name: "email_gov", type: "text" },
                ].map(({ name, type, options }) => (
                  <div className="mb-4" key={name}>
                    <label className="block text-gray-700 mb-2" htmlFor={name}>
                      {name.replace("_", " ").toUpperCase()}
                    </label>
                    {type === "select" ? (
                      <select
                        id={name}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[name] = el)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                      >
                        <option value="" disabled>
                          Select {name.replace("_", " ")}
                        </option>
                        {options.map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : type === "file" ? (
                      <input
                        id={name}
                        name={name}
                        type={type}
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[name] = el)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                        accept={"image/*"}
                      />
                    ) : (
                      <input
                        id={name}
                        name={name}
                        type={type}
                        value={formData[name] || ""}
                        onChange={handleChange}
                        onKeyDown={
                          type === "number" ? preventInvalidInput : null
                        }
                        ref={(el) => (inputRefs.current[name] = el)}
                        className={`border border-gray-300 rounded-md p-2 w-full ${
                          errors[name] ? "border-red-500" : ""
                        }`}
                      />
                    )}
                    {errors[name] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[name]}
                      </p>
                    )}
                    {name === "foto" && (
                      <p className="text-red-400 text-sm mt-1">
                        * Hanya file .png, .jpg, .jpeg dengan ukuran 1 MB yang
                        diterima
                      </p>
                    )}
                    {name === "foto" && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mt-4">
                          Foto Preview
                        </label>
                        <img
                          src={fotoPreview}
                          className="mt-2 w-24 object-cover"
                        />
                      </div>
                    )}
                    {name === "tanggal_lahir" && (
                      <p className="text-red-400 text-sm mt-1">
                        * format : bulan/tanggal/tahun
                      </p>
                    )}
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
                    <label className="block text-gray-700 mb-2" htmlFor={key}>
                      {key.replace("_", " ").toUpperCase()}
                    </label>
                    <input
                      type="text"
                      id={key}
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleChange}
                      ref={(el) => (inputRefs.current[key] = el)}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                    {errors[key] && (
                      <p className="text-red-500 text-sm">{errors[key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-4 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
              <h1 className="text-xl font-bold mb-6 text-start">Pendidikan</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["pendidikan", "jurusan", "tahun_tamat"].map((key) => {
                  const isNumberField = ["tahun_tamat"].includes(key);

                  return (
                    <div className="mb-4" key={key}>
                      <label className="block text-gray-700 mb-2" htmlFor={key}>
                        {key.replace("_", " ").toUpperCase()}
                      </label>
                      <input
                        type={isNumberField ? "number" : "text"}
                        id={key}
                        name={key}
                        value={formData[key] || ""}
                        onChange={handleChange}
                        onKeyDown={
                          isNumberField === "number"
                            ? preventInvalidInput
                            : null
                        }
                        ref={(el) => (inputRefs.current[key] = el)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                      />
                      {errors[key] && (
                        <p className="text-red-500 text-sm">{errors[key]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-5 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
              <h1 className="text-xl font-bold mb-6 text-start">Pekerjaan</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "nip", type: "number" },
                  { name: "npwp", type: "number" },
                  { name: "bidang", type: "text" },
                  { name: "eselon", type: "text" },
                  { name: "sub_bidang", type: "text" },
                  { name: "jabatan_terakhir", type: "text" },
                  { name: "gol_ruang", type: "text" },
                  { name: "jenjang", type: "text" },
                  { name: "jenis", type: "select", options: jenisOptions },
                  { name: "jenis_tekon", type: "text" },
                  { name: "tahun_sk_awal", type: "number" },
                  { name: "tahun_sk_akhir", type: "number" },
                  { name: "masa_kerja", type: "number" },
                  {
                    name: "Kelas_jabatan",
                    type: "select",
                    options: kelasJabatanOptions,
                  },
                  { name: "no_req_bkn", type: "text" },
                ].map(({ name, type, options }) => (
                  <div className="mb-4" key={name}>
                    <label className="block text-gray-700 mb-2" htmlFor={name}>
                      {name.replace("_", " ").toUpperCase()}
                    </label>
                    {type === "select" ? (
                      <select
                        id={name}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[name] = el)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                      >
                        <option value="" disabled>
                          Select {name.replace("_", " ")}
                        </option>
                        {options.map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={name}
                        name={name}
                        type={type}
                        value={formData[name] || ""}
                        onChange={handleChange}
                        onKeyDown={
                          type === "number" ? preventInvalidInput : null
                        }
                        ref={(el) => (inputRefs.current[name] = el)}
                        className={`border border-gray-300 rounded-md p-2 w-full ${
                          errors[name] ? "border-red-500" : ""
                        }`}
                      />
                    )}
                    {errors[name] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[name]}
                      </p>
                    )}
                    {(name === "sub_bidang" || name === "eselon") && (
                      <p className="text-red-400 text-sm mt-1">
                        * Isi ( - ) jika tidak ada
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-black py-2 px-4 rounded-md"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-md"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Konfirmasi</h2>
            <p className="mb-4">
              Apakah Anda yakin ingin mengirim request edit data ini?
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleCancelModal}
                className="bg-gray-300 text-black py-2 px-4 rounded-md mr-2"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmModal}
                className="bg-blue-500 text-white py-2 px-4 rounded-md"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
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
            <p className="mb-8">Data Berhasil di request ke Admin !</p>
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
  );
};

export default RequestEditData;
