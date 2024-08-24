// src/pages/RequestEditData.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert } from "antd";
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
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const jenisKelaminOptions = ["Laki-Laki", "Perempuan"];
  const golonganDarahOptions = ["A", "B", "AB", "O"];
  const jenisOptions = ["PNS", "Tenaga Kontrak", "PPPK"];
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
        setLoading(true);
        setError(null);
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

        // Format tanggal_lahir for input
        if (data.tanggal_lahir) {
          data.tanggal_lahir = formatDateForInput(data.tanggal_lahir);
        }

        setFormData(data);
        setInitialFormData({
          ...data,
          tanggal_lahir: data.tanggal_lahir
            ? new Date(data.tanggal_lahir).toISOString()
            : null,
        });
        setFotoPreview(data.foto || null);
        setOldImageUrl(data.foto || "");
        setLoading(false);
      } catch (error) {
        setError("Error fetching data. Please try again later.");
        navigate("/ProfileUser");
      }
    };

    fetchData();
  }, [navigate]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Returns 'YYYY-MM-DD'
  };

  const parseDateForServer = (dateString) => {
    if (!dateString) return null;
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
          setFormData({ ...formData, [name]: null });
          setFotoPreview(null);
        } else {
          // Set file and clear preview if it's not the same file as before
          setFormData((prevState) => ({
            ...prevState,
            [name]: file,
            foto_lama: oldImageUrl,
          }));
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
      if (key === "tanggal_lahir") {
        // Bandingkan tanggal dalam format yang sama
        const formattedInitialDate = formatDateForInput(initialFormData[key]);
        const formattedCurrentDate = formatDateForInput(formData[key]);

        if (formattedCurrentDate !== formattedInitialDate) {
          updatedData[key] = parseDateForServer(formData[key]);
        }
      } else if (
        formData[key] !== initialFormData[key] &&
        key !== "foto_lama"
      ) {
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
          setError("Error uploading image. Please try again later.");
          throw error;
        }
      }

      // Menyusun updatedData hanya dengan field yang berubah
      const updatedData = getUpdatedData();

      // Update the data payload with the new image URL
      if (imageUrl !== oldImageUrl && imageUrl) {
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
      await axios.post(
        `http://localhost:3000/request/update-request/`,
        payload,
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
      alert(errorMessage);
      setLoading(false);
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
    navigate("/ProfileUser", { replace: true });
  };

  const handleCancel = () => {
    window.location.href = "/ProfileUser";
  };

  const preventInvalidInput = (e) => {
    if (["e", "E", "-", "+", "."].includes(e.key)) {
      e.preventDefault();
    }
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
            Request Edit Data
          </h1>
          <form onSubmit={handleSubmitWithConfirmation}>
            <div className="form-2 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
              {error && (
                <Alert message={error} type="error" showIcon className="mb-4" />
              )}
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
                      <p className="text-gray-600 font-bold text-sm mt-1">
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
                      <p className="text-gray-600 font-bold text-sm mt-1">
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
                        type="text"
                        id={name}
                        name={name}
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
                      <p className="text-gray-600 font-bold  text-sm mt-1">
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
            <p className="mb-4">
              Apakah Anda yakin ingin mengirim request edit data ini?
            </p>
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
