// src/pages/DataKaryawan.js
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Alert } from "antd";
import { FaEdit, FaTrash } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import axios from "axios";
import ExcelJS from "exceljs";
import { useNavigate } from "react-router-dom";

const DataKaryawan = () => {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [sorter, setSorter] = useState(null);
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Cek userRole dari localStorage
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      navigate("/Dashboard");
    }
  }, [navigate]);

  const columns = [
    {
      title: "No.",
      dataIndex: "no",
      key: "no",
      align: "center",
      sorter: (a, b) => a.no - b.no,
      fixed: "left",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Foto",
      dataIndex: "foto",
      key: "foto",
      align: "center",
      render: (text) => (
        <div className="flex justify-center items-center w-full">
          <img src={text} alt="Foto" className="w-20 rounded-sm" />
        </div>
      ),
    },
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
      sorter: (a, b) => a.nama.localeCompare(b.nama),
      fixed: "left",
    },
    {
      title: "NIP/No. REG",
      dataIndex: "nip",
      key: "nip",
      align: "center",
      sorter: (a, b) => a.nip.localeCompare(b.nip),
    },
    {
      title: "Bidang",
      dataIndex: "bidang",
      key: "bidang",
      align: "center",
      sorter: (a, b) => a.bidang.localeCompare(b.bidang),
    },
    {
      title: "Eselon",
      dataIndex: "eselon",
      key: "eselon",
      align: "center",
      sorter: (a, b) => a.eselon.localeCompare(b.eselon),
    },
    {
      title: "Sub Bidang",
      dataIndex: "sub_bidang",
      key: "sub_bidang",
      align: "center",
      sorter: (a, b) => a.sub_bidang.localeCompare(b.sub_bidang),
    },
    {
      title: "Jabatan",
      dataIndex: "jabatan_terakhir",
      key: "jabatan_terakhir",
      align: "center",
      sorter: (a, b) => a.jabatan_terakhir.localeCompare(b.jabatan_terakhir),
    },
    {
      title: "Golongan/Ruang",
      dataIndex: "gol_ruang",
      key: "gol_ruang",
      align: "center",
      sorter: (a, b) => a.gol_ruang.localeCompare(b.gol_ruang),
    },
    {
      title: "Jenjang",
      dataIndex: "jenjang",
      key: "jenjang",
      align: "center",
      sorter: (a, b) => a.jenjang.localeCompare(b.jenjang),
    },
    {
      title: "Jenis",
      dataIndex: "jenis",
      key: "jenis",
      align: "center",
      sorter: (a, b) => a.jenis.localeCompare(b.jenis),
    },
    {
      title: "Jenis Kelamin",
      dataIndex: "jenis_kelamin",
      key: "jenis_kelamin",
      align: "center",
      sorter: (a, b) => a.jenis_kelamin.localeCompare(b.jenis_kelamin),
    },
    {
      title: "Tempat Lahir",
      dataIndex: "tempat_lahir",
      key: "tempat_lahir",
      align: "center",
      sorter: (a, b) => a.tempat_lahir.localeCompare(b.tempat_lahir),
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tanggal_lahir",
      key: "tanggal_lahir",
      align: "center",
      sorter: (a, b) => new Date(a.tanggal_lahir) - new Date(b.tanggal_lahir),
      render: (text) => {
        const date = new Date(text);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      },
    },
    {
      title: "Umur",
      dataIndex: "umur",
      key: "umur",
      align: "center",
      sorter: (a, b) => a.umur - b.umur,
    },
    {
      title: "NIK",
      dataIndex: "nik",
      key: "nik",
      align: "center",
      sorter: (a, b) => a.nik.localeCompare(b.nik),
    },
    {
      title: "NPWP",
      dataIndex: "npwp",
      key: "npwp",
      align: "center",
      sorter: (a, b) => a.npwp.localeCompare(b.npwp),
    },
    {
      title: "No. Rekening",
      dataIndex: "no_rekening",
      key: "no_rekening",
      align: "center",
      sorter: (a, b) => a.no_rekening.localeCompare(b.no_rekening),
    },
    {
      title: "No. KK",
      dataIndex: "no_kk",
      key: "no_kk",
      align: "center",
      sorter: (a, b) => a.no_kk.localeCompare(b.no_kk),
    },
    {
      title: "Gol. Darah",
      dataIndex: "golongan_darah",
      key: "golongan_darah",
      align: "center",
      sorter: (a, b) => a.golongan_darah.localeCompare(b.golongan_darah),
    },
    {
      title: "No. HP",
      dataIndex: "no_telepon",
      key: "no_telepon",
      align: "center",
      sorter: (a, b) => a.no_telepon.localeCompare(b.no_telepon),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Email Gov",
      dataIndex: "email_gov",
      key: "email_gov",
      align: "center",
      sorter: (a, b) => a.email_gov.localeCompare(b.email_gov),
    },
    {
      title: "Pendidikan",
      dataIndex: "pendidikan",
      key: "pendidikan",
      align: "center",
      sorter: (a, b) => a.pendidikan.localeCompare(b.pendidikan),
    },
    {
      title: "Jurusan",
      dataIndex: "jurusan",
      key: "jurusan",
      align: "center",
      sorter: (a, b) => a.jurusan.localeCompare(b.jurusan),
    },
    {
      title: "Tahun Tamat",
      dataIndex: "tahun_tamat",
      key: "tahun_tamat",
      align: "center",
      sorter: (a, b) => a.tahun_tamat - b.tahun_tamat,
    },
    {
      title: "Jalan",
      dataIndex: "jalan",
      key: "jalan",
      align: "center",
      sorter: (a, b) => a.jalan.localeCompare(b.jalan),
    },
    {
      title: "Desa",
      dataIndex: "desa",
      key: "desa",
      align: "center",
      sorter: (a, b) => a.desa.localeCompare(b.desa),
    },
    {
      title: "Kecamatan",
      dataIndex: "kecamatan",
      key: "kecamatan",
      align: "center",
      sorter: (a, b) => a.kecamatan.localeCompare(b.kecamatan),
    },
    {
      title: "Kabupaten/Kota",
      dataIndex: "kabupaten",
      key: "kabupaten",
      align: "center",
      sorter: (a, b) => a.kabupaten.localeCompare(b.kabupaten),
    },
    {
      title: "Alamat",
      dataIndex: "alamat_lengkap",
      key: "alamat_lengkap",
      align: "center",
      sorter: (a, b) => a.alamat_lengkap.localeCompare(b.alamat_lengkap),
      editable: true,
    },
    {
      title: "Tahun SK Awal",
      dataIndex: "tahun_sk_awal",
      key: "tahun_sk_awal",
      align: "center",
      sorter: (a, b) => a.tahun_sk_awal - b.tahun_sk_awal,
    },
    {
      title: "Tahun SK Akhir",
      dataIndex: "tahun_sk_akhir",
      key: "tahun_sk_akhir",
      align: "center",
      sorter: (a, b) => a.tahun_sk_akhir - b.tahun_sk_akhir,
    },
    {
      title: "Masa Kerja",
      dataIndex: "masa_kerja",
      key: "masa_kerja",
      align: "center",
      sorter: (a, b) => a.masa_kerja - b.masa_kerja,
    },
    {
      title: "No. Reg. BKN",
      dataIndex: "no_req_bkn",
      key: "no_req_bkn",
      align: "center",
      sorter: (a, b) => a.no_req_bkn.localeCompare(b.no_req_bkn),
    },
    {
      title: "Jenis Tekon",
      dataIndex: "jenis_tekon",
      key: "jenis_tekon",
      align: "center",
      sorter: (a, b) => a.jenis_tekon.localeCompare(b.jenis_tekon),
    },
    {
      title: "Kelas Jabatan",
      dataIndex: "Kelas_jabatan",
      key: "Kelas_jabatan",
      align: "center",
      sorter: (a, b) => a.kelas_jabatan.localeCompare(b.kelas_jabatan),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
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
      const dataWithIds = response.data.data.map((item) => ({
        ...item,
        key: item.nip,
      }));
      setRecords(dataWithIds);
      setFilteredRecords(dataWithIds);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleTableChange = (pagination, filters, sorter) => {
    setSorter(sorter);
    const sortedRecords = [...filteredRecords].sort((a, b) => {
      const { order, columnKey } = sorter;
      const aValue = a[columnKey];
      const bValue = b[columnKey];
      if (order === "ascend") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    setFilteredRecords(sortedRecords);
  };

  const handleAddData = () => {
    navigate("/TambahData");
  };

  const handleEditData = () => {
    if (selectedRowKeys.length === 1) {
      const selectedData = records.find(
        (record) => record.nip === selectedRowKeys[0]
      );
      navigate("/EditData", { state: { data: selectedData } });
    }
  };

  const handleDeleteData = () => {
    if (selectedRowKeys.length > 0) {
      setShowModal(true);
    }
  };

  const handleRowSelection = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const handleConfirmModal = (e) => {
    e.preventDefault();
    setShowModal(false);
    handleDeleteSelectedRows();
  };

  const handleDeleteSelectedRows = async () => {
    if (selectedRowKeys.length === 1) {
      const selectedData = records.find(
        (record) => record.nip === selectedRowKeys[0]
      );

      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No token found");
        }

        // Hapus foto dari cloud
        await axios.delete("http://localhost:3000/profile/delete-foto", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            imageUrl: selectedData.foto,
          },
        });

        // Delete the employee data
        await axios.delete(
          `http://localhost:3000/employees/${selectedData.nip}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRecords((prevRecords) =>
          prevRecords.filter((record) => record.nip !== selectedData.nip)
        );
        setFilteredRecords((prevRecords) =>
          prevRecords.filter((record) => record.nip !== selectedData.nip)
        );
        setSelectedRowKeys([]);
        setLoading(false);
        setShowSuccessModal(true);
      } catch (error) {
        console.error("Error deleting data: ", error);
        setError("Failed to delete data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  };

  const confirmExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("DataKaryawan");

    // Add headers
    const headers = [
      "No.",
      ...columns
        .filter((col) => col.dataIndex !== "no")
        .map((col) => col.title),
    ];
    worksheet.addRow(headers);

    // Format header row
    worksheet.getRow(1).height = 30;
    worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // Sort filteredRecords based on sorter state
    if (sorter) {
      filteredRecords.sort((a, b) => {
        const { columnKey, order } = sorter;
        const aValue = a[columnKey];
        const bValue = b[columnKey];
        if (order === "ascend") {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
    }

    // Prepare and add data
    for (let [index, record] of filteredRecords.entries()) {
      const rowData = [
        index + 1, // New sequential "No." column
        ...(await Promise.all(
          columns
            .filter((col) => col.dataIndex !== "no")
            .map(async (col) => {
              if (col.dataIndex === "tanggal_lahir") {
                const date = new Date(record[col.dataIndex]);
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
              }
              if (col.dataIndex === "foto") {
                return ""; // Handle images separately
              }
              return record[col.dataIndex];
            })
        )),
      ];
      worksheet.addRow(rowData);

      // Format data rows
      worksheet.getRow(index + 2).eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
    }

    // Add images after data rows are added
    for (let [index, record] of filteredRecords.entries()) {
      if (record.foto) {
        try {
          const response = await fetch(record.foto);
          const buffer = await response.arrayBuffer();
          const imageId = workbook.addImage({
            buffer: buffer,
            extension: "png",
          });

          worksheet.getRow(index + 2).height = 80; // Adjust row height for images

          worksheet.addImage(imageId, {
            tl: { col: headers.indexOf("Foto"), row: index + 1 },
            br: { col: headers.indexOf("Foto") + 1, row: index + 2 },
            editAs: "oneCell",
          });
        } catch (error) {
          console.error(`Failed to add image for row ${index + 1}:`, error);
        }
      }
    }

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        let columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength + 2 < 10 ? 10 : maxLength + 2;
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data_karyawan.xlsx";
    link.click();

    setShowExportPopup(false);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: handleRowSelection,
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="pb-8 sm:px-6 lg:px-8" style={{ paddingTop: "6.5rem" }}>
      <div className="bg-white shadow sm:rounded-lg p-6">
        <div className="flex justify-start gap-4">
          <h1 className="text-2xl font-bold mb-10">Data Karyawan</h1>
          <MdRefresh
            className="bg-gray-300 fill-black rounded-lg p-2 cursor-pointer hover:bg-gray-400"
            size={36}
            onClick={handleRefresh}
          />
        </div>

        <div className="flex flex-row justify-between items-center mb-4 ml-2">
          <div className="space-x-4">
            <Button
              type="secondary"
              className="bg-custom-blue text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={handleAddData}
            >
              Tambah Data
            </Button>
            <Button
              type="secondary"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              onClick={() => setShowExportPopup(true)}
            >
              Export
            </Button>
          </div>
          <div className="flex items-center space-x-4 mr-2">
            <p className="font-semibold">Search:</p>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2"
              placeholder="Filter by"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 250 }}
            />

            <div className="flex justify-center items-center space-x-2">
              <FaEdit
                className={`${
                  selectedRowKeys.length === 1
                    ? "hover:bg-green-700 cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                } bg-green-600 fill-white hover:text-custom-blue rounded-lg p-2 transition duration-300 ease-in-out`}
                size={36}
                onClick={handleEditData}
                disabled={selectedRowKeys.length !== 1}
              />
              <FaTrash
                className={`${
                  selectedRowKeys.length > 0
                    ? "hover:bg-red-700 cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                } bg-red-600 fill-white hover:text-custom-blue rounded-lg p-2 transition duration-300 ease-in-out`}
                size={36}
                disabled={selectedRowKeys.length === 0}
                onClick={handleDeleteData}
              />
            </div>
          </div>
        </div>
        <div className="bg-white shadow p-4 rounded w-full">
          {error && (
            <Alert message={error} type="error" showIcon className="mb-4" />
          )}
          <Table
            columns={columns}
            dataSource={filteredRecords}
            rowSelection={rowSelection}
            pagination={true}
            bordered
            loading={loading}
            onChange={handleTableChange}
            scroll={{ x: "max-content" }}
          />
        </div>
      </div>

      {/* Export Confirmation Modal */}
      <Modal
        title="Export Data"
        open={showExportPopup}
        onOk={confirmExport}
        onCancel={() => setShowExportPopup(false)}
        okText="Ya"
        cancelText="Batal"
        className="fixed inset-0 flex items-center justify-center"
      >
        <p>Apakah anda yakin ingin mengekspor data ini ke Excel?</p>
      </Modal>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-8">Konfirmasi</h2>
            <p className="mb-8">
              Apakah Anda yakin ingin menghapus data karyawan ini?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
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
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">Loading...</h2>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center">
            <h2 className="text-xl font-semibold mb-8">Sukses Menghapus</h2>
            <p className="mb-8">Data Berhasil di hapus !</p>
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

export default DataKaryawan;
