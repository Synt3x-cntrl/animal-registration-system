import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import "./styles/style.css";

import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyPets from "./pages/MyPets";
import Appointments from "./pages/Appointments";
import MedicalHistory from "./pages/MedicalHistory";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminPets from "./pages/AdminPets";
import DoctorExamination from "./pages/DoctorExamination";
import DoctorDailyReports from "./pages/DoctorDailyReports";
import Pricing from "./pages/Pricing";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isPublicPage = location.pathname === '/' || location.pathname === '/about';
  const user = localStorage.getItem("user");

  // Logged-in users should not see public pages
  if (isPublicPage && user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isAuthPage && !isPublicPage && !user) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthPage) {
    return <div className="auth-layout">{children}</div>;
  }

  if (isPublicPage) {
    return (
      <div className="public-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        {children}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="responsive-flex" style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <div
          className="content responsive-content"
          style={{
            padding: "20px",
            flex: 1,
            height: "calc(100vh - 66px)",
            overflowY: "auto",
            backgroundColor: "#f0f2f5",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-pets" element={<MyPets />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/medical-history" element={<MedicalHistory />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/pets" element={<AdminPets />} />
          <Route path="/doctor/examination" element={<DoctorExamination />} />
          <Route path="/doctor/daily-reports" element={<DoctorDailyReports />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
