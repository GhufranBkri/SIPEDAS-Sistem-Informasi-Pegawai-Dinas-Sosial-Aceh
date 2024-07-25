// src/pages/DataKaryawan.js
// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';



const Struktur = () => {

return (
  <div className="min-h-screen">
    <main className="py-8">
      <div className="mx-auto sm:px-6 lg:px-8">
        {/* Konten Dashboard */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold">Data Karyawan</h1>
          <p className="mt-4">Selamat datang di halaman Data Karyawan!</p>
          <table id="myTable" className="display" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Jabatan</th>
                <th>Email</th>
                <th>Nomor Telepon</th>
                <th>Gaji</th>
                {/* Tambahkan kolom sesuai kebutuhan */}
              </tr>
            </thead>
            <tbody>
              {/* Isi tabel dengan data karyawan dari API atau database */}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
);
}

export default Struktur;
