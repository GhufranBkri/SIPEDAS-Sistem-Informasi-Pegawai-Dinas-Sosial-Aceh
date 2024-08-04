// src/App.jsx
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import DataKaryawan from './pages/DataKaryawan';
import Struktur from './pages/Struktur';
import TambahData from './pages/TambahData';
import EditData from './pages/EditData';
import ProfileUser from './pages/ProfileUser';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/DataKaryawan" element={<DataKaryawan />} />
            <Route path="/Struktur" element={<Struktur />} />
            <Route path="/Tambahdata" element={<TambahData />} />
            <Route path="/Editdata" element={<EditData />} />
            <Route path="/ProfileUser" element={<ProfileUser />} />
          </Route>
          <Route path="/Login" element={<Login />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
