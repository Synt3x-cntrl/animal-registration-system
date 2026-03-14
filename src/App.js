import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./styles/style.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyPets from "./pages/MyPets";
import Appointments from "./pages/Appointments";
import MedicalHistory from "./pages/MedicalHistory";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminPets from "./pages/AdminPets";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <BrowserRouter>
      {/* Цэвэрхэн цэс */}
      <Navbar />

      {/* Үндсэн контент */}
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div className="content" style={{ padding: '20px', flex: 1, height: 'calc(100vh - 66px)', overflowY: 'auto', backgroundColor: '#f0f2f5' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/my-pets" element={<MyPets />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/medical-history" element={<MedicalHistory />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/pets" element={<AdminPets />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
