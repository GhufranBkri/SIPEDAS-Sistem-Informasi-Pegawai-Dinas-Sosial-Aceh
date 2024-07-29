// src/pages/DataKaryawan.js
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import "./Data.css";
import { FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import axios from "axios";

const DataKaryawan = () => {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#1E63B2",
        color: "white",
        fontWeight: "bold",
        borderBottom: "2px solid #0056b3",
        borderRight: "2px solid gray",
        display: "flex",
        justifyContent: "center",
      },
    },
    cells: {
      style: {
        borderRight: "2px solid #ddd",
        display: "flex",
        justifyContent: "center",
      },
    },
  };

  const columns = [
    {
      name: "No.",
      selector: (row) => row.no,
      sortable: true,
      style: {
        position: "sticky",
        left: "0",
        zIndex: 1,
        backgroundColor: "white",
      },
    },
    {
      name: "Foto",
      selector: (row) => row.foto,
      sortable: true,
      cell: (row) => (
        <div className="flex justify-center items-center w-full">
          <img
            src={row.foto}
            alt="Foto Karyawan"
            className="w-12 h-12 rounded-full"
          />
        </div>
      ),
    },
    {
      name: "Nama",
      selector: (row) => row.nama,
      sortable: true,
      style: {
        position: "sticky",
        left: "0",
        zIndex: 1,
        backgroundColor: "white",
      },
      cell: (row) => (
        <div className="flex justify-start items-center w-full">{row.nama}</div>
      ),
    },
    { name: "NIP/REG", selector: (row) => row.nip, sortable: true },
    { name: "Bidang", selector: (row) => row.bidang, sortable: true },
    { name: "Eselon", selector: (row) => row.eselon, sortable: true },
    { name: "Sub Bidang", selector: (row) => row.sub_bidang, sortable: true },
    {
      name: "Jabatan",
      selector: (row) => row.jabatan_terakhir,
      sortable: true,
    },
    {
      name: "Golongan/Ruang",
      selector: (row) => row.gol_ruang,
      sortable: true,
    },
    { name: "Jenjang", selector: (row) => row.jenjang, sortable: true },
    { name: "Jenis", selector: (row) => row.jenis, sortable: true },
    {
      name: "Jenis Kelamin",
      selector: (row) => row.jenis_kelamin,
      sortable: true,
    },
    {
      name: "Tempat Lahir",
      selector: (row) => row.tempat_lahir,
      sortable: true,
    },
    {
      name: "Tanggal Lahir",
      selector: (row) => row.tanggal_lahir,
      sortable: true,
    },
    { name: "Umur", selector: (row) => row.umur, sortable: true },
    { name: "NIK", selector: (row) => row.nik, sortable: true },
    { name: "NPWP", selector: (row) => row.npwp, sortable: true },
    { name: "No. Rek.", selector: (row) => row.no_rekening, sortable: true },
    { name: "No. KK", selector: (row) => row.no_kk, sortable: true },
    {
      name: "Gol. Darah",
      selector: (row) => row.golongan_darah,
      sortable: true,
    },
    { name: "No. HP", selector: (row) => row.no_telepon, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Email Gov", selector: (row) => row.email_gov, sortable: true },
    { name: "Pendidikan", selector: (row) => row.pendidikan, sortable: true },
    { name: "Jurusan", selector: (row) => row.jurusan, sortable: true },
    { name: "Tahun Tamat", selector: (row) => row.tahun_tamat, sortable: true },
    { name: "Jalan", selector: (row) => row.jalan, sortable: true },
    { name: "Desa", selector: (row) => row.desa, sortable: true },
    { name: "Kecamatan", selector: (row) => row.kecamatan, sortable: true },
    {
      name: "Kabupaten/Kota",
      selector: (row) => row.kabupaten,
      sortable: true,
    },
    { name: "Alamat", selector: (row) => row.alamat_lengkap, sortable: true },
    {
      name: "Tahun SK Awal",
      selector: (row) => row.tahun_sk_awal,
      sortable: true,
    },
    {
      name: "Tahun SK Akhir",
      selector: (row) => row.tahun_sk_akhir,
      sortable: true,
    },
    { name: "Masa Kerja", selector: (row) => row.masa_kerja, sortable: true },
    { name: "No. Reg. BKN", selector: (row) => row.no_req_bkn, sortable: true },
    { name: "Jenis Tekon", selector: (row) => row.jenis_tekon, sortable: true },
    {
      name: "Kelas Jabatan",
      selector: (row) => row.Kelas_jabatan,
      sortable: true,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await axios.get("http://localhost:3000/employees/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const dataWithIds = response.data.data.map((item, index) => ({
          ...item,
          no: index + 1,
        }));
        setRecords(dataWithIds);
        setFilteredRecords(dataWithIds);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = records.filter((row) => {
      return Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredRecords(filtered);
  }, [searchQuery, records]);

  const handleSelectedRowsChange = (state) => {
    setSelectedRows(state.selectedRows);
  };

  const handleDelete = () => {
    if (selectedRows.length > 0) {
      setShowDeletePopup(true);
    }
  };

  const confirmDelete = () => {
    // Implement delete logic here
    setShowDeletePopup(false);
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
  };

  // function handleFilter(event) {
  //   const newData = fetchData.filter((row) => {
  //     return row.nama.toLowerCase().includes(event.target.value.toLowerCase());
  //   });
  //   setRecords(newData);
  // }

  return (
    <div className="min-h-screen">
      <main className="py-8">
        <div className="mx-auto sm:px-6 lg:px-8">
          {/* Konten Dashboard */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h1 className="text-2xl font-bold">Data Karyawan</h1>
            <div className="container mt-8">
              <div className="flex flex-row justify-between items-center mb-4">
                <button className="bg-custom-blue text-white px-4 py-2 rounded hover:bg-blue-700">
                  Tambah Data
                </button>
                <div className="flex basis-1/3 items-center space-x-4">
                  <p className="font-semibold">Search:</p>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md p-2 w-full"
                    placeholder="Filter by"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="flex justify-center items-center space-x-2">
                    <FaEdit
                      className={`${
                        selectedRows.length === 1
                          ? "hover:bg-green-700 cursor-pointer"
                          : "cursor-not-allowed opacity-50"
                      } bg-green-600 fill-white hover:text-custom-blue rounded-xl p-2 transition duration-300 ease-in-out`}
                      size={36}
                      onClick={() =>
                        selectedRows.length === 1 && alert("Edit clicked")
                      }
                    />
                    <FaTrash
                      className={`${
                        selectedRows.length > 0
                          ? "hover:bg-red-700 cursor-pointer"
                          : "cursor-not-allowed opacity-50"
                      } bg-red-600 fill-white hover:text-custom-blue rounded-xl p-2 transition duration-300 ease-in-out`}
                      size={36}
                      onClick={handleDelete}
                    />
                  </div>
                </div>
              </div>
              <DataTable
                columns={columns}
                data={filteredRecords}
                customStyles={customStyles}
                selectableRows
                fixedHeader
                pagination
                onSelectedRowsChange={handleSelectedRowsChange}
              />
            </div>
          </div>
        </div>
      </main>

      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold mb-6">Hapus Data</h2>
            <p className="mb-6">Apakah anda yakin ingin menghapus data ini?</p>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={confirmDelete}
              >
                Yes
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={cancelDelete}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataKaryawan;
