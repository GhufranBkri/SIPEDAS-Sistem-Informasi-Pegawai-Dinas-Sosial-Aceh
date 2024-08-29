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
  const totalContract = data.filter(
    (emp) => emp.jenis === "TEKON"
  ).length;
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
  const bidangLabels = [...new Set(data.map((emp) => emp.bidang))].filter(label => label && label !== "-");
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
  const ageData = ageRanges.map((range) => {
    const [start, end] = range.split("-").map(Number);
    return data.filter((emp) => emp.umur >= start && emp.umur <= end).length;
  });

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

  // Proses data untuk eselon dan sub_bidang
  const eselonLabels = [...new Set(data.map((emp) => emp.eselon))].filter(label => label && label !== "-");
  const subBidangLabels = [...new Set(data.map((emp) => emp.sub_bidang))].filter(label => label && label !== "-");

  // Gabungkan label unik
  const combinedLabels = [
    ...new Set([...eselonLabels, ...subBidangLabels]),
  ].sort();

  // Hitung data untuk setiap label
  const combinedData = combinedLabels.map((label) => {
    const eselonCount = data.filter((emp) => emp.eselon === label).length;
    const subBidangCount = data.filter(
      (emp) => emp.sub_bidang === label
    ).length;
    return {
      label,
      eselonCount,
      subBidangCount,
      totalCount: eselonCount + subBidangCount,
      isEselon: eselonLabels.includes(label),
      isSubBidang: subBidangLabels.includes(label),
    };
  });

  // Data untuk bar chart gabungan
  const barChartEselonSubBidangData = {
    labels: combinedLabels,
    datasets: [
      {
        label: "Eselon",
        data: combinedData.map((item) =>
          item.isEselon ? item.eselonCount : 0
        ),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Sub Bidang",
        data: combinedData.map((item) =>
          item.isSubBidang ? item.subBidangCount : 0
        ),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Opsi untuk bar chart
  const barChartEselonSubBidangOptions = {
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        title: {
          display: true,
          text: "Jumlah",
        },
        ticks: {
          precision: 0,
        },
      },
      x: {
        stacked: true,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const datasetLabel = context.dataset.label || "";
            const value = context.parsed.y;
            return `${datasetLabel}: ${value}`;
          },
          footer: function (tooltipItems) {
            let total = 0;
            const currentLabel = tooltipItems[0].label;

            // Find the total for the current label
            combinedData.forEach((item) => {
              if (item.label === currentLabel) {
                total = item.totalCount; // Total count of Eselon and Sub Bidang combined
              }
            });
            return "Total: " + total;
          },
        },
      },
    },
  };

  const goldarLabels = [...new Set(data.map((emp) => emp.golongan_darah))];
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
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const pendidikanLabels = [...new Set(data.map((emp) => emp.pendidikan))];
  const pendidikanData = pendidikanLabels.map(
    (label) => data.filter((emp) => emp.pendidikan === label).length
  );

  const pieChartDataPendidikan = {
    labels: pendidikanLabels.map(
      (label, index) => `${label} (${pendidikanData[index]})`
    ),
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
            <h2 className="text-xl font-bold mb-8">Distribusi Umur</h2>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
          <div className="bg-gray-100 p-4 rounded-lg border shadow-md">
            <h2 className="text-xl font-bold mb-8">
              Distribusi berdasarkan Sub Bidang dan Eselon
            </h2>
            <Bar
              data={barChartEselonSubBidangData}
              options={barChartEselonSubBidangOptions}
            />
          </div>
          <div className="bg-gray-100 px-4 pt-4 rounded-lg border shadow-md">
            <h2 className="text-xl font-bold mb-8">
              Distribusi Golongan Darah
            </h2>
            <div
              style={{
                height: "28rem",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ width: "70%", height: "100%" }}>
                <Pie data={pieChartDataGoldar} options={pieChartOptions} />
              </div>
            </div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg border shadow-md">
            <h2 className="text-xl font-bold mb-8">
              Distribusi Jenis Kelamin berdasarkan Jenis
            </h2>
            <Bar data={stackedBarChartData} options={stackedBarChartOptions} />
          </div>
          <div className="bg-gray-100 px-4 pt-4 rounded-lg border shadow-md">
            <h2 className="text-xl font-bold mb-8">Distribusi Pendidikan</h2>
            <div
              style={{
                height: "24rem",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ width: "70%", height: "100%" }}>
                <Pie data={pieChartDataPendidikan} options={pieChartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
