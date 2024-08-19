// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar, Pie } from "react-chartjs-2";
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

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authorization token found.");
      setLoading(false);
      setError("Authorization token not found.");
      return;
    }

    axios
      .get("http://localhost:3000/employees/visual", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data.data)) {
          setData(response.data.data);
        } else {
          console.error("Expected an array but received:", response.data);
          setError("Invalid data format received from server.");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Error fetching data. Please try again later.");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        Error: {error}
      </div>
    );

  // Process data for charts
  const bidangLabels = [...new Set(data.map((emp) => emp.bidang))];
  const bidangData = bidangLabels.map(
    (label) => data.filter((emp) => emp.bidang === label).length
  );

  // Age distribution
  const ageRanges = [
    "25-30",
    "31-35",
    "36-40",
    "41-45",
    "46-50",
    "51-55",
    "56-60",
    "61-65",
    "66-70",
  ];
  const ageData = ageRanges.map((range) => {
    const [start, end] = range.split("-").map(Number);
    return data.filter((emp) => emp.umur >= start && emp.umur <= end).length;
  });

  const goldarLabels = [...new Set(data.map((emp) => emp.golongan_darah))];
  const goldarData = goldarLabels.map(
    (label) => data.filter((emp) => emp.golongan_darah === label).length
  );

  const pendidikanLabels = [...new Set(data.map((emp) => emp.pendidikan))];
  const pendidikanData = pendidikanLabels.map(
    (label) => data.filter((emp) => emp.pendidikan === label).length
  );

  const genderTypes = ["PNS", "Tenaga Kontrak", "PPPK"];
  const genderData = {
    PNS: {
      male: data.filter(
        (emp) => emp.jenis_kelamin === "Laki-Laki" && emp.jenis === "PNS"
      ).length,
      female: data.filter(
        (emp) => emp.jenis_kelamin === "Perempuan" && emp.jenis === "PNS"
      ).length,
    },
    "Tenaga Kontrak": {
      male: data.filter(
        (emp) =>
          emp.jenis_kelamin === "Laki-Laki" && emp.jenis === "Tenaga Kontrak"
      ).length,
      female: data.filter(
        (emp) =>
          emp.jenis_kelamin === "Perempuan" && emp.jenis === "Tenaga Kontrak"
      ).length,
    },
    PPPK: {
      male: data.filter(
        (emp) => emp.jenis_kelamin === "Laki-Laki" && emp.jenis === "PPPK"
      ).length,
      female: data.filter(
        (emp) => emp.jenis_kelamin === "Perempuan" && emp.jenis === "PPPK"
      ).length,
    },
  };

  const lineChartData = {
    labels: ageRanges,
    datasets: [
      {
        label: "Jumlah Pegawai per Umur",
        data: ageData,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
      },
    ],
  };

  const lineChartOptions = {
    scales: {
      y: {
        title: {
          display: true,
          text: "Jumlah", // Menambahkan label sumbu Y
        },
        ticks: {
          beginAtZero: true,
          precision: 0, // Menghilangkan desimal
        },
      },
    },
  };

  const barChartData = {
    labels: bidangLabels,
    datasets: [
      {
        label: "Jumlah Pegawai per Bidang",
        data: bidangData,
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
          text: "Jumlah", // Menambahkan label sumbu Y
        },
        ticks: {
          beginAtZero: true,
          precision: 0, // Menghilangkan desimal
        },
      },
    },
  };

  const pieChartDataGoldar = {
    labels: goldarLabels.map((label, index) => `${label} (${goldarData[index]})`),
    datasets: [
      {
        data: goldarData,
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const pieChartDataPendidikan = {
    labels: pendidikanLabels.map((label, index) => `${label} (${pendidikanData[index]})`),
    datasets: [
      {
        data: pendidikanData,
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
            size: 16, // Adjust font size here
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

  const stackedBarChartData = {
    labels: genderTypes,
    datasets: [
      {
        label: "Laki-laki",
        data: genderTypes.map((type) => genderData[type].male),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "Perempuan",
        data: genderTypes.map((type) => genderData[type].female),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  // Chart options for gender chart
  const stackedBarChartOptions = {
    scales: {
      x: { stacked: false },
      y: {
        stacked: false,
        title: {
          display: true,
          text: "Jumlah",
        },
        ticks: {
          beginAtZero: true,
          precision: 0, // Remove decimals
        },
      },
    },
  };

  return (
    <div className="pb-8 sm:px-6 lg:px-8" style={{ paddingTop: "6.5rem" }}>
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Admin</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">
              Jumlah Pegawai per Bidang
            </h2>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">Distribusi Umur</h2>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">
              Distribusi Golongan Darah
            </h2>
            <Pie
              data={pieChartDataGoldar}
              options={pieChartOptions}
            />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">Distribusi Pendidikan</h2>
            <Pie
              data={pieChartDataPendidikan}
              options={pieChartOptions}
            />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">
              Jenis Kelamin berdasarkan PNS, Tekon, dan PPPK
            </h2>
            <Bar data={stackedBarChartData} options={stackedBarChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
