// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert } from "antd";
import { MdRefresh } from "react-icons/md";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data from API
  const fetchData = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      setError("Authorization token not found.");
      return;
    }

    setLoading(true);

    axios
      .get("https://sipedas-api.vercel.app/employees/visual", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data.data)) {
          setData(response.data.data);
        } else {
          setError("Invalid data format received from server.");
        }
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
  const totalEmployees = data.length;
  const totalMale = data.filter((emp) => emp.jenis_kelamin === "L").length;
  const totalFemale = data.filter((emp) => emp.jenis_kelamin === "P").length;
  const totalPNS = data.filter((emp) => emp.jenis === "PNS").length;
  const totalContract = data.filter((emp) => emp.jenis === "TEKON").length;
  const totalPPPK = data.filter((emp) => emp.jenis === "PPPK").length;

  // Data untuk grid
  const gridData = [
    { label: "Jumlah Pegawai", value: totalEmployees },
    { label: "Jumlah Laki-Laki", value: totalMale },
    { label: "Jumlah Perempuan", value: totalFemale },
    { label: "Jumlah PNS", value: totalPNS },
    { label: "Jumlah Tenaga Kontrak", value: totalContract },
    { label: "Jumlah PPPK", value: totalPPPK },
  ];

  // Process data for charts
  const bidangLabels = [...new Set(data.map((emp) => emp.bidang))].filter(
    (label) => label && label !== "-"
  );
  const bidangData = bidangLabels.map(
    (label) => data.filter((emp) => emp.bidang === label).length
  );

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
  const ageData = ageRanges
    .map((range) => {
      const [start, end] = range.split("-").map(Number);
      return data.filter((emp) => emp.umur >= start && emp.umur <= end).length;
    })
    .filter((label) => label && label !== "-");

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

  // Proses data untuk Sub Bidang
  const subBidangLabels = [
    ...new Set(data.map((emp) => emp.sub_bidang)),
  ].filter((label) => label && label !== "-");
  const subBidangData = subBidangLabels.map(
    (label) => data.filter((emp) => emp.sub_bidang === label).length
  );

  // Proses data untuk Eselon
  const eselonLabels = [...new Set(data.map((emp) => emp.eselon))].filter(
    (label) => label && label !== "-"
  );
  const eselonData = eselonLabels.map(
    (label) => data.filter((emp) => emp.eselon === label).length
  );

  // Data untuk chart Sub Bidang
  const barChartSubBidangData = {
    labels: subBidangLabels,
    datasets: [
      {
        label: "Jumlah Pegawai per Sub Bidang",
        data: subBidangData,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Data untuk chart Eselon
  const barChartEselonData = {
    labels: eselonLabels,
    datasets: [
      {
        label: "Jumlah Pegawai per Eselon",
        data: eselonData,
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const goldarLabels = [
    ...new Set(data.map((emp) => emp.golongan_darah)),
  ].filter((label) => label && label !== "-");
  const goldarData = goldarLabels.map(
    (label) => data.filter((emp) => emp.golongan_darah === label).length
  );

  const pieChartDataGoldar = {
    labels: goldarLabels.map(
      (label, index) => `${label} (${goldarData[index]})`
    ),
    datasets: [
      {
        data: goldarData,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#FF6347",
          "#8E44AD",
          "#2ECC71",
          "#E67E22",
          "#E74C3C",
          "#C0392B",
        ],
      },
    ],
  };

  const pieChartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            size: 12,
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

  const genderTypes = ["PNS", "Tenaga Kontrak", "PPPK"];
  const genderData = {
    PNS: {
      male: data.filter(
        (emp) => emp.jenis_kelamin === "L" && emp.jenis === "PNS"
      ).length,
      female: data.filter(
        (emp) => emp.jenis_kelamin === "P" && emp.jenis === "PNS"
      ).length,
    },
    "Tenaga Kontrak": {
      male: data.filter(
        (emp) => emp.jenis_kelamin === "L" && emp.jenis === "TEKON"
      ).length,
      female: data.filter(
        (emp) => emp.jenis_kelamin === "P" && emp.jenis === "TEKON"
      ).length,
    },
    PPPK: {
      male: data.filter(
        (emp) => emp.jenis_kelamin === "L" && emp.jenis === "PPPK"
      ).length,
      female: data.filter(
        (emp) => emp.jenis_kelamin === "P" && emp.jenis === "PPPK"
      ).length,
    },
  };

  const stackedBarChartData = {
    labels: genderTypes.filter((label) => label && label !== "-"),
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

  const pendidikanDataMap = data.reduce((acc, emp) => {
    // Remove spaces and standardize the label
    const label = emp.pendidikan.replace(/\s/g, "");
    if (acc[label]) {
      acc[label]++;
    } else {
      acc[label] = 1;
    }
    return acc;
  }, {});

  const pendidikanLabels = Object.keys(pendidikanDataMap).filter(
    (label) => label && label !== "-"
  );

  const pendidikanData = pendidikanLabels.map(
    (label) => pendidikanDataMap[label]
  );

  const horizontalBarChartData = {
    labels: pendidikanLabels,
    datasets: [
      {
        label: "Jumlah Pegawai per Pendidikan",
        data: pendidikanData,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const horizontalBarChartOptions = {
    indexAxis: "y", // Horizontal bar chart
    scales: {
      x: {
        title: {
          display: true,
          text: "Jumlah", // Menambahkan label sumbu X
        },
        ticks: {
          beginAtZero: true,
          precision: 0, // Menghilangkan desimal
          callback: function (value) {
            // Custom callback to display specific tick values
            const tickValues = [
              0, 5, 10, 20, 30, 40, 50, 70, 100, 130, 160, 190,
            ];
            return tickValues.includes(value) ? value : "";
          },
        },
        // Define the custom tick values
        maxTicksLimit: 12,
      },
      y: {
        title: {
          display: true,
          text: "Pendidikan", // Menambahkan label sumbu Y
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
  };

  return (
    <div className="pb-8 sm:px-6 lg:px-8" style={{ paddingTop: "6.5rem" }}>
      <div className="bg-white shadow sm:rounded-lg p-6">
        <div className="flex justify-start gap-4">
          <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
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
          <div className="bg-gray-100 p-4 rounded-lg border shadow-md">
            <h2 className="text-xl font-bold mb-8">Distribusi per Bidang</h2>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
          <div className="bg-gray-100 p-4 rounded-lg border shadow-md">
            <h2 className="text-xl font-bold mb-8">Distribusi Sub Bidang</h2>
            <Bar data={barChartSubBidangData} options={barChartOptions} />
          </div>
          <div className="bg-gray-100 p-4 rounded-lg border shadow-md">
            <h2 className="text-xl font-bold mb-8">Distribusi Eselon</h2>
            <Bar data={barChartEselonData} options={barChartOptions} />
          </div>
          <div className="bg-gray-100 p-4 rounded-lg border shadow-md">
            <h2 className="text-xl font-bold mb-8">
              Distribusi Golongan Darah
            </h2>
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ width: "70%", height: "70%" }}>
                <Pie data={pieChartDataGoldar} options={pieChartOptions} />
              </div>
            </div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg border shadow-md">
            <h2 className="text-xl font-bold mb-8">Distribusi Umur</h2>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
          <div className="bg-gray-100 p-4 rounded-lg border shadow-md">
            <h2 className="text-xl font-bold mb-8">
              Distribusi Jenis Kelamin berdasarkan Jenis
            </h2>
            <Bar data={stackedBarChartData} options={stackedBarChartOptions} />
          </div>
          <div className="col-start-2">
            <div className=" bg-gray-100 p-4 rounded-lg border shadow-md ">
              <h2 className="text-xl font-bold mb-8">Distribusi Pendidikan</h2>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Bar
                  data={horizontalBarChartData}
                  options={horizontalBarChartOptions}
                  height={250}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
