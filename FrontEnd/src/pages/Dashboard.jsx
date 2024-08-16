// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

function Dashboard() {
  const [data, setData] = useState([]);
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error("No authorization token found.");
  }

  useEffect(() => {
    axios.get('http://localhost:3000/employees/', {
      headers: {
        'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
      },
    })
      .then((response) => {
        if (Array.isArray(response.data.data)) {
          setData(response.data.data);
        } else {
          console.error('Expected an array but received:', response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [token]);

  if (!Array.isArray(data) || data.length === 0) return <div>Loading...</div>;

  // Process data for charts
  const bidangLabels = [...new Set(data.map(emp => emp.bidang))];
  const bidangData = bidangLabels.map(label => data.filter(emp => emp.bidang === label).length);

  const umurLabels = data.map(emp => emp.umur);
  const umurData = data.map(emp => emp.umur);

  const goldarLabels = [...new Set(data.map(emp => emp.goldar))];
  const goldarData = goldarLabels.map(label => data.filter(emp => emp.goldar === label).length);

  const pendidikanLabels = [...new Set(data.map(emp => emp.pendidikan))];
  const pendidikanData = pendidikanLabels.map(label => data.filter(emp => emp.pendidikan === label).length);

  const genderData = {
    pns: {
      male: data.filter(emp => emp.gender === 'male' && emp.type === 'pns').length,
      female: data.filter(emp => emp.gender === 'female' && emp.type === 'pns').length
    },
    tekon: {
      male: data.filter(emp => emp.gender === 'male' && emp.type === 'tekon').length,
      female: data.filter(emp => emp.gender === 'female' && emp.type === 'tekon').length
    }
  };

  const lineChartData = {
    labels: umurLabels,
    datasets: [
      {
        label: 'Umur',
        data: umurData,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
      },
    ],
  };

  const barChartData = {
    labels: bidangLabels,
    datasets: [
      {
        label: 'Jumlah Pegawai per Bidang',
        data: bidangData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const pieChartDataGoldar = {
    labels: goldarLabels,
    datasets: [
      {
        data: goldarData,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const pieChartDataPendidikan = {
    labels: pendidikanLabels,
    datasets: [
      {
        data: pendidikanData,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const stackedBarChartData = {
    labels: ['PNS', 'Tekon'],
    datasets: [
      {
        label: 'Laki-laki',
        data: [genderData.pns.male, genderData.tekon.male],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Perempuan',
        data: [genderData.pns.female, genderData.tekon.female],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Jumlah Pegawai per Bidang</h2>
          <Bar data={barChartData} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Distribusi Umur</h2>
          <Line data={lineChartData} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Distribusi Golongan Darah</h2>
          <Pie data={pieChartDataGoldar} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Distribusi Pendidikan</h2>
          <Pie data={pieChartDataPendidikan} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Jenis Kelamin berdasarkan PNS dan Tekon</h2>
          <Bar data={stackedBarChartData} options={{ scales: { x: { stacked: true }, y: { stacked: true } }}} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
