// src/pages/EditData.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../Number.css";

const EditData = () => {
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

  const [fotoPreview, setFotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const inputRefs = useRef({});
  const [showModal, setShowModal] = useState(false);
  const [oldImageUrl, setOldImageUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const MAX_FILE_SIZE_MB = 1;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const jenisKelaminOptions = ["Laki-Laki", "Perempuan"];
  const golonganDarahOptions = ["A", "B", "AB", "O"];
  const jenisOptions = ["PNS", "Tenaga Kontrak", "PPPK"];
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Cek userRole dari localStorage
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      navigate("/Dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if data is provided in location state
        if (location.state && location.state.data) {
          const initialData = location.state.data;

          // Convert date string to input date format
          if (initialData.tanggal_lahir) {
            initialData.tanggal_lahir = formatDateForInput(
              initialData.tanggal_lahir
            );
          }

          setFormData(initialData);
          if (initialData.foto) {
            setFotoPreview(initialData.foto);
            setOldImageUrl(initialData.foto);
          }
        } else {
          navigate("/DataKaryawan");
        }
      } catch (error) {
        let errorMessage =
          "Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti.";

        if (error.response) {
          // Server responded with a status other than 200 range
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = "Tidak ada respons dari server. Periksa koneksi Anda.";
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage = error.message;
        }

        // Display the error message to the user
        alert(errorMessage);
        // Optionally navigate away or handle the error state
        navigate("/DataKaryawan");
      }
    };

    fetchData();
  }, [location.state, navigate]);

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
        } else if (file.size > MAX_FILE_SIZE_BYTES) {
          newErrors[name] = `File size exceeds ${MAX_FILE_SIZE_MB} MB limit.`;
          setFormData({ ...formData, [name]: null });
          setFotoPreview(null);
        } else {
          setFormData({ ...formData, [name]: file });
          setFotoPreview(URL.createObjectURL(file));
          delete newErrors[name];
        }
      } else {
        setFormData({ ...formData, [name]: null });
        setFotoPreview(null);
        newErrors[name] = "This field is required";
      }
    } else {
      setFormData({ ...formData, [name]: value });

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

  // Fungsi untuk memperbarui kata sandi
  const updatePassword = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No token found");
    }

    try {
      await axios.put(
        `http://localhost:3000/auth/update-user-details`,
        {
          nip: formData.nip,
          newPassword: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Password berhasil diperbarui");
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 200 range
        alert(`Gagal memperbarui password: ${error.response.data.message}`);
      } else if (error.request) {
        // The request was made but no response was received
        alert("Gagal memperbarui password. Tidak ada respons dari server.");
      } else {
        // Something happened in setting up the request that triggered an Error
        alert(`Gagal memperbarui password: ${error.message}`);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
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

        try {
          const uploadResponse = await axios.put(
            `http://localhost:3000/profile/edit-foto`,
            fotoFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (
            uploadResponse.data &&
            uploadResponse.data.status === "success" &&
            uploadResponse.data.data &&
            uploadResponse.data.data.imageUrl
          ) {
            imageUrl = uploadResponse.data.data.imageUrl;
          } else {
            throw new Error("Format respons server tidak sesuai");
          }
        } catch (error) {
          setErrors({ foto: "Gagal mengunggah foto. Silakan coba lagi." });
          throw error;
        }
      }

      if (newPassword) {
        await updatePassword();
      }

      // Mengirim data lain
      await axios.patch(
        `http://localhost:3000/employees/${formData.nip}`,
        { ...formData, foto: imageUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setShowSuccessModal(true);
    } catch (error) {
      let errorMessage = "Terjadi kesalahan. Silakan coba lagi nanti.";

      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Tidak ada respons dari server. Periksa koneksi Anda.";
      } else {
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
    navigate("/DataKaryawan", { replace: true });
  };

  const handleCancel = () => {
    window.location.href = "/Dashboard";
  };

  const preventInvalidInput = (e) => {
    if (["e", "E", "-", "+", "."].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
                  { name: "no_rekening", type: "text" },
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
                      <p className="text-gray-600 font-bold text-sm mt-1">
                        * Hanya file .png, .jpg, .jpeg dengan ukuran 1 MB (1024
                        KB) yang diterima
                      </p>
                    )}
                    {name === "foto" && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mt-4">
                          Foto Preview
                        </label>
                        <img
                          src={fotoPreview}
                          className="mt-2 w-32 object-cover"
                        />
                      </div>
                    )}
                    {name === "tanggal_lahir" && (
                      <p className="text-gray-600 font-bold text-sm mt-1">
                        * format : bulan/tanggal/tahun
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-3 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
              <h1 className="text-xl font-bold mb-6 text-start">
                Akun Login User
              </h1>
              <h1 className="text-l mb-6 text-start text-red-600">
                Hati-hati mengubah data ini !
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4 md:col-span-1">
                  <label className="block text-gray-700 mb-2" htmlFor="email">
                    EMAIL
                  </label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    ref={(el) => (inputRefs.current.email = el)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs italic mt-2">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="mb-4 md:col-span-1 relative">
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="password"
                  >
                    PASSWORD
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                  <span
                    onClick={handleTogglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 mt-2 flex items-center cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                  <p className="text-red-400 font-bold text-sm mt-1">
                    * Abaikan jika tidak ingin mengubah password
                  </p>
                  {errors.password && (
                    <p className="text-red-500 text-xs italic mt-2">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="form-4 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
              <h1 className="text-xl font-bold mb-6 text-start">Alamat</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "kabupaten", type: "text" },
                  { name: "kecamatan", type: "text" },
                  { name: "desa", type: "text" },
                  { name: "jalan", type: "text" },
                  { name: "alamat_lengkap", type: "textarea" },
                ].map(({ name, type }) => (
                  <div className="mb-4" key={name}>
                    <label className="block text-gray-700 mb-2" htmlFor={name}>
                      {name.replace("_", " ").toUpperCase()}
                    </label>
                    {type === "textarea" ? (
                      <textarea
                        id={name}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[name] = el)}
                        className={`border border-gray-300 rounded-md p-2 w-full`}
                        rows={4}
                      ></textarea>
                    ) : (
                      <input
                        id={name}
                        name={name}
                        type={type}
                        value={formData[name] || ""}
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[name] = el)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                      />
                    )}
                    {errors[name] && (
                      <p className="text-red-500 text-sm">{errors[name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-5 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
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

            <div className="form-6 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
              <h1 className="text-xl font-bold mb-6 text-start">Pekerjaan</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "nip", type: "number", disabled: true },
                  { name: "npwp", type: "text" },
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
                  { name: "Kelas_jabatan", type: "text" },
                  { name: "no_req_bkn", type: "text" },
                ].map(({ name, type, options, disabled }) => (
                  <div className="mb-4" key={name}>
                    <label className="block text-gray-700 mb-2" htmlFor={name}>
                      {getLabelText(name)}
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
                        disabled={disabled}
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
                      <p className="text-gray-600 font-bold text-sm mt-1">
                        * Isi ( - ) jika tidak ada
                      </p>
                    )}
                    {name === "nip" && (
                      <p className="text-gray-600 font-bold text-sm mt-1">
                        * NIP tidak dapat diubah
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
            <p className="mb-4">Apakah Anda yakin ingin mengubah data ini?</p>
            <div className="flex justify-end gap-4">
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
            <p className="mb-8">Data berhasil di perbarui !</p>
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

export default EditData;
