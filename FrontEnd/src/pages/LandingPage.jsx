// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Alert } from "antd";
import { MdRefresh } from "react-icons/md";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function LandingPage() {
  const [genderData, setGenderData] = useState([]);
  const [bidangData, setBidangData] = useState([]);
  const [pendidikanData, setPendidikanData] = useState([]);
  const [totalPNS, setTotalPNS] = useState(0);
  const [totalTenagaKontrak, setTotalTenagaKontrak] = useState(0);
  const [totalPPPK, setTotalPPPK] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in
    const userRole = localStorage.getItem("userRole");
    if (userRole) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Fetch data from API
  const fetchData = () => {
    setLoading(true);

    axios
      .get("http://localhost:3000/visualisasi", {})
      .then((response) => {
        setGenderData(response.data.genderCounts);
        setBidangData(response.data.bidangCounts);
        setPendidikanData(response.data.pendidikanCounts);
        setTotalPNS(response.data.totalPNS);
        setTotalTenagaKontrak(response.data.totalTenagaKontrak);
        setTotalPPPK(response.data.totalPPPK);
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching data. Please try again later.");
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );

  // Hitung statistik setelah data berhasil diambil

  const totalMale =
    genderData.find((item) => item._id === "Laki-Laki")?.count || 0;
  const totalFemale =
    genderData.find((item) => item._id === "Perempuan")?.count || 0;
  const totalEmployees = totalMale + totalFemale;

  // Data untuk grid
  const gridData = [
    { label: "Jumlah Pegawai", value: totalEmployees },
    { label: "Jumlah Laki-Laki", value: totalMale },
    { label: "Jumlah Perempuan", value: totalFemale },
    { label: "Jumlah PNS", value: totalPNS },
    { label: "Jumlah Tenaga Kontrak", value: totalTenagaKontrak },
    { label: "Jumlah PPPK", value: totalPPPK },
  ];

  // Prepare data for gender pie chart
  const genderLabels = genderData.map((item) => item._id);
  const genderCounts = genderData.map((item) => item.count);

  const pieChartDataGender = {
    labels: genderLabels,
    datasets: [
      {
        data: genderCounts,
        backgroundColor: ["#FF6384", "#36A2EB"],
      },
    ],
  };

  // Prepare data for bidang bar chart
  const bidangLabels = bidangData.map((item) => item._id);
  const bidangCounts = bidangData.map((item) => item.count);

  const barChartData = {
    labels: bidangLabels,
    datasets: [
      {
        label: "Jumlah Pegawai per Bidang",
        data: bidangCounts,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    scales: {
      y: {
        title: {
          display: true,
          text: "Jumlah",
        },
        ticks: {
          beginAtZero: true,
          precision: 0,
        },
      },
    },
  };

  // Prepare data for pendidikan pie chart
  const pendidikanLabels = pendidikanData.map((item) => item._id);
  const pendidikanCounts = pendidikanData.map((item) => item.count);

  const pieChartDataPendidikan = {
    labels: pendidikanLabels.map(
      (label, index) => `${label} (${pendidikanCounts[index]})`
    ),
    datasets: [
      {
        data: pendidikanCounts,
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const pieChartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            size: 16,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(2) + "%";
            return `${context.label}: ${value} (${percentage})`;
          },
        },
      },
    },
  };

  return (
    <div className="pb-8 sm:px-6 lg:px-8" style={{ paddingTop: "6.5rem" }}>
      <div className="bg-white shadow sm:rounded-lg p-6">
        <div className="flex justify-start gap-4">
          <h1 className="text-2xl font-bold mb-8">Landing Page</h1>
          <MdRefresh
            className="bg-gray-300 fill-black rounded-lg p-2 cursor-pointer hover:bg-gray-400"
            size={36}
            onClick={fetchData}
          />
        </div>

        {error && (
          <Alert message={error} type="error" showIcon className="mb-4" />
        )}

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          {gridData.map((item, index) => (
            <div key={index} className="p-4 shadow-md bg-gray-100">
              <h2 className="text-lg font-bold">{item.label}</h2>
              <p className="text-xl">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-100 p-4 rounded-lg border shadow-md mb-4">
            <h2 className="text-xl font-bold mb-8">Distribusi Gender</h2>
            <div className="size-5/6 ml-28">
              <Pie data={pieChartDataGender} options={pieChartOptions} />
            </div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg border shadow-md mb-4">
            <h2 className="text-xl font-bold mb-8">Distribusi per Bidang</h2>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
          <div className="bg-gray-100 p-4 rounded-lg border shadow-md mb-4">
            <h2 className="text-xl font-bold mb-8">Distribusi Pendidikan</h2>
            <div className="size-5/6 ml-28">
              <Pie data={pieChartDataPendidikan} options={pieChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
