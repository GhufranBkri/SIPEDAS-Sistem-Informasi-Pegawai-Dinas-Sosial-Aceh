// src/pages/TambahData.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import axios from 'axios';

const TambahData = () => {
  const [formData, setFormData] = useState({
    foto: '',
    nama: '',
    nip: '',
    bidang: '',
    eselon: '',
    sub_bidang: '',
    jabatan_terakhir: '',
    gol_ruang: '',
    jenjang: '',
    jenis: '',
    jenis_kelamin: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    umur: '',
    nik: '',
    npwp: '',
    no_rekening: '',
    no_kk: '',
    golongan_darah: '',
    no_telepon: '',
    email: '',
    email_gov: '',
    pendidikan: '',
    jurusan: '',
    tahun_tamat: '',
    jalan: '',
    desa: '',
    kecamatan: '',
    kabupaten: '',
    alamat_lengkap: '',
    tahun_sk_awal: '',
    tahun_sk_akhir: '',
    masa_kerja: '',
    no_req_bkn: '',
    jenis_tekon: '',
    Kelas_jabatan: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }
      await axios.post('http://localhost:3000/employees', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Data added successfully');
      // Redirect to DataKaryawan page
      window.location.href = '/DataKaryawan';
    } catch (error) {
      console.error('Error adding data: ', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Tambah Data Karyawan</h1>
        <form onSubmit={handleSubmit}>
          {/* Render input fields dynamically from formData keys */}
          {Object.keys(formData).map((key) => (
            <div className="mb-4" key={key}>
              <label className="block text-gray-700 font-bold mb-2" htmlFor={key}>
                {key.replace('_', ' ').toUpperCase()}
              </label>
              <input
                type="text"
                id={key}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full"
              />
            </div>
          ))}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Data
          </button>
        </form>
      </div>
    </div>
  );
};

export default TambahData;
