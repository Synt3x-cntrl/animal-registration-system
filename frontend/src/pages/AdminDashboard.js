import React, { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import API_URL from "../apiConfig";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import PassportRequestRow from "../components/PassportRequestRow";

import "../styles/auth.css";

const STAT_CARDS = [
  { key: 'totalUsers',        label: 'Нийт хэрэглэгчид',   icon: '👤', color: '#a2a2df', bg: '#f0effa', trend: '+12%' },
  { key: 'totalDoctors',      label: 'Нийт эмч нар',        icon: '🩺', color: '#6c757d', bg: '#f2f3f4', trend: '+2%'  },
  { key: 'totalPets',         label: 'Бүртгэлтэй амьтад',   icon: '🐾', color: '#f39c12', bg: '#fdf3e0', trend: '+8%'  },
  { key: 'totalAppointments', label: 'Цаг захиалга',         icon: '📅', color: '#27ae60', bg: '#e8f8f2', trend: '+5%'  },
  { key: 'totalRecords',      label: 'Үзлэгийн түүх',       icon: '📋', color: '#e74c3c', bg: '#fdecea', trend: '+3%'  },
];

function StatCard({ label, icon, color, bg, trend, value }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '22px 20px',
      boxShadow: '0 6px 28px rgba(0,0,0,0.07)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      minWidth: '160px',
      flex: '1 1 160px',
      border: '1px solid #f0f0f0',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.07)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
          {icon}
        </div>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#27ae60', backgroundColor: '#e8f8f2', padding: '3px 8px', borderRadius: '20px' }}>
          ↑ {trend}
        </span>
      </div>
      <div style={{ fontSize: '32px', fontWeight: '800', color: color, lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>{label}</div>
    </div>
  );
}

function RecentPetRow({ pet }) {
  const initial = pet.name?.[0]?.toUpperCase() || '?';
  const colors = ['#a2a2df', '#f39c12', '#27ae60', '#e74c3c', '#3498db'];
  const bg = colors[pet.name?.charCodeAt(0) % colors.length] || '#a2a2df';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '12px 16px', borderRadius: '14px',
      backgroundColor: 'white', marginBottom: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      border: '1px solid #f5f5f5'
    }}>
      {pet.imageUrl && pet.imageUrl.startsWith('data:image') ? (
        <img src={pet.imageUrl} alt={pet.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '18px', flexShrink: 0 }}>
          {initial}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '15px' }}>{pet.name}</div>
        <div style={{ color: '#888', fontSize: '13px' }}>{pet.species} · {pet.gender}</div>
      </div>
      <div style={{ fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap' }}>
        {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString() : ''}
      </div>
    </div>
  );
}

function DoctorReportsDrawer({ doctorName }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/medical-records/doctor/${encodeURIComponent(doctorName)}`);
        const data = await res.json();
        if (res.ok && data.data) setReports(data.data);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    })();
  }, [doctorName]);

  return (
    <div style={{ padding: '16px 20px', backgroundColor: '#fdfaff', borderRadius: '14px', marginTop: '10px', border: '1px solid #ede9fe' }}>
      <div style={{ fontSize: '13px', fontWeight: '700', color: '#a2a2df', marginBottom: '12px' }}>
        📋 Бичсэн тэмдэглэлүүд ({reports.length})
      </div>
      {loading ? <div style={{ color: '#bbb', fontSize: '12px' }}>⏳ Уншиж байна...</div>
        : reports.length === 0 ? <div style={{ color: '#bbb', fontStyle: 'italic', fontSize: '12px' }}>Бичсэн тайлан олдсонгүй.</div>
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
              {reports.map(r => (
                <div key={r._id} style={{ backgroundColor: 'white', border: '1px solid #f0effa', borderRadius: '10px', padding: '12px', fontSize: '12px' }}>
                  <div style={{ fontWeight: '800', color: '#1a1a2e', marginBottom: '4px' }}>🐾 {r.petName}</div>
                  <div style={{ color: '#666' }}>{r.diagnosis}</div>
                  <div style={{ marginTop: '6px', color: '#bbb', fontSize: '10px', textAlign: 'right' }}>{r.date}</div>
                </div>
              ))}
            </div>
          )}
    </div>
  );
}

function DoctorRow({ doctor }) {
  const [expanded, setExpanded] = useState(false);
  const initial = doctor.firstname?.[0]?.toUpperCase() || '?';

  return (
    <div style={{ marginBottom: '10px' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '12px 16px', borderRadius: '14px',
          backgroundColor: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          border: expanded ? '1.5px solid #a2a2df' : '1px solid #f5f5f5',
          cursor: 'pointer'
        }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#a2a2df', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
          {initial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '14px' }}>{doctor.lastname} {doctor.firstname}</div>
          <div style={{ color: '#888', fontSize: '12px' }}>{doctor.email} · {doctor.phone || '—'}</div>
        </div>
        <span style={{ color: '#bbb', fontSize: '12px' }}>{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && <DoctorReportsDrawer doctorName={`${doctor.firstname} ${doctor.lastname}`} />}
    </div>
  );
}
function AdminDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [recentPets, setRecentPets] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [passportRequests, setPassportRequests] = useState([]);

  const [doctorFirstname, setDoctorFirstname] = useState("");
  const [doctorLastname, setDoctorLastname] = useState("");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");
  const [doctorPassword, setDoctorPassword] = useState("");

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`${API_URL}/auth/admin/stats`);
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error("Статистик татахад алдаа гарлаа:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/users`);
      const data = await res.json();
      if (res.ok && data.data) {
        setDoctors(data.data.filter(u => u.role === 'doctor'));
      }
    } catch (err) {
      console.error("Эмч нарын жагсаалт татахад алдаа:", err);
    }
  };

  const fetchRecentPets = async () => {
    try {
      const res = await fetch(`${API_URL}/pets`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const sorted = [...data.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentPets(sorted.slice(0, 5));
      }
    } catch (err) {
      console.error("Сүүлийн амьтад татахад алдаа:", err);
    }
  };

  const fetchPassportRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/pets/passport-requests`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPassportRequests(data.data);
      }
    } catch (err) {
      console.error("Пасспорт хүсэлт татахад алдаа:", err);
    }
  };

  useEffect(() => {
    const loggedUser = localStorage.getItem("user");
    if (loggedUser) {
      const parsedUser = JSON.parse(loggedUser);
      if (parsedUser.role !== "admin") {
        alert("Танд админ эрх байхгүй байна!");
        navigate("/");
      } else {
        setUser(parsedUser);
        fetchStats();
        fetchRecentPets();
        fetchDoctors();
        fetchPassportRequests();
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleRegisterDoctor = async (e) => {
    e.preventDefault();
    if (!doctorFirstname || !doctorLastname || !doctorEmail || !doctorPhone || !doctorPassword) {
      alert("Бүх талбарыг бөглөнө үү");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: doctorFirstname, lastname: doctorLastname,
          email: doctorEmail, phone: doctorPhone, password: doctorPassword, role: "doctor",
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Эмч амжилттай бүртгэгдлээ.");
        setDoctorFirstname(""); setDoctorLastname(""); setDoctorEmail(""); setDoctorPhone(""); setDoctorPassword("");
        fetchDoctors();
        fetchStats();
      } else {
        alert("Алдаа гарлаа: " + data.error);
      }
    } catch (error) {
      alert("Сервертэй холбогдоход алдаа гарлаа: " + error.message);
    }
  };

  const handleEvaluatePassport = async (petId, status) => {
    if (!window.confirm(`Үүнийг ${status === 'approved' ? 'Зөвшөөрөх' : 'Цуцлах'}-дөө итгэлтэй байна уу?`)) return;
    try {
      const res = await fetch(`${API_URL}/pets/${petId}/evaluate-passport`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Амжилттай хадгалагдлаа");
        fetchPassportRequests();
      } else {
        alert(data.error || "Алдаа гарлаа");
      }
    } catch (err) {
      alert("Алдаа: " + err.message);
    }
  };

  if (!user) return <LoadingSpinner text="Уншиж байна..." />;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f7f8fc', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 6px 0' }}>
          Системийн ерөнхий тойм
        </h1>
        <p style={{ color: '#888', margin: 0, fontSize: '15px' }}>
          Сайн байна уу, <strong>{user.firstname}</strong>! Системийн мэдээллийг доороос харна уу.
        </p>
      </div>

      {/* Stats Cards */}
      {loadingStats ? (
        <LoadingSpinner text="Ачааллаж байна..." />
      ) : stats ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '36px' }}>
          {STAT_CARDS.map(card => (
            <StatCard key={card.key} {...card} value={stats[card.key]} />
          ))}
        </div>
      ) : null}

      {/* 24h alert */}
      {stats && (
        <div style={{ marginBottom: '32px', padding: '16px 22px', backgroundColor: '#fff8e6', borderRadius: '16px', borderLeft: '5px solid #f39c12', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 14px rgba(243,156,18,0.1)' }}>
          <span style={{ fontSize: '26px' }}>🚨</span>
          <div>
            <div style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '15px' }}>Сүүлийн 24 цагт шинээр бүртгүүлсэн амьтад</div>
            <div style={{ color: '#f39c12', fontWeight: '800', fontSize: '22px' }}>+{stats.petsLast24h || 0} амьтан</div>
          </div>
        </div>
      )}

      {/* Charts + Recent Pets */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '36px' }}>
        {/* Charts */}
        {stats && (
          <div style={{ flex: '2 1 400px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 220px', backgroundColor: 'white', padding: '22px', borderRadius: '20px', boxShadow: '0 6px 24px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
              <h3 style={{ color: '#444', marginTop: 0, marginBottom: '16px', fontSize: '15px', fontWeight: '700' }}>Хэрэглэгчдийн бүтэц</h3>
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Эмч нар', value: stats.totalDoctors || 0 },
                      { name: 'Хэрэглэгчид', value: stats.totalUsers || 0 }
                    ]}
                    cx="50%" cy="50%" outerRadius={78} dataKey="value" label
                  >
                    <Cell fill="#a2a2df" />
                    <Cell fill="#f39c12" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ flex: '1 1 220px', backgroundColor: 'white', padding: '22px', borderRadius: '20px', boxShadow: '0 6px 24px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
              <h3 style={{ color: '#444', marginTop: 0, marginBottom: '16px', fontSize: '15px', fontWeight: '700' }}>Системийн өгөгдөл</h3>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={[
                  { name: 'Амьтад', count: stats.totalPets || 0 },
                  { name: 'Захиалга', count: stats.totalAppointments || 0 },
                  { name: 'Үзлэг', count: stats.totalRecords || 0 }
                ]}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'rgba(162,162,223,0.08)' }} />
                  <Bar dataKey="count" fill="#a2a2df" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Pets */}
        <div style={{ flex: '1 1 280px', backgroundColor: 'white', padding: '22px', borderRadius: '20px', boxShadow: '0 6px 24px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
          <h3 style={{ color: '#444', marginTop: 0, marginBottom: '16px', fontSize: '15px', fontWeight: '700' }}>🐾 Сүүлд бүртгэгдсэн амьтад</h3>
          {recentPets.length === 0 ? (
            <div style={{ color: '#bbb', textAlign: 'center', padding: '30px 0', fontSize: '14px' }}>Мэдээлэл байхгүй</div>
          ) : (
            recentPets.map(pet => <RecentPetRow key={pet._id} pet={pet} />)
          )}
        </div>
      </div>

      {/* Passport Requests Section */}
      <div style={{ marginBottom: '36px', backgroundColor: 'white', padding: '26px', borderRadius: '20px', boxShadow: '0 6px 24px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
        <h3 style={{ color: '#444', marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🛂 Пасспортын хүсэлтүүд
          {passportRequests.length > 0 && (
            <span style={{ backgroundColor: '#e74c3c', color: 'white', fontSize: '12px', padding: '2px 8px', borderRadius: '20px' }}>{passportRequests.length}</span>
          )}
        </h3>
        {passportRequests.length === 0 ? (
          <div style={{ color: '#bbb', textAlign: 'center', padding: '40px 0', fontSize: '16px', backgroundColor: '#f9f9fc', borderRadius: '12px', border: '2px dashed #ede9fe' }}>
            🎉 Одоогоор шийдвэрлэх хүсэлт алга байна.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {passportRequests.map(req => (
              <PassportRequestRow key={req._id} request={req} onEvaluate={handleEvaluatePassport} />
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Register Doctor Form */}
        <div style={{
          flex: '1 1 400px',
          backgroundColor: 'white', borderRadius: '20px', padding: '36px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0',
        }}>
          <h2 className="auth-title" style={{ fontSize: '24px', marginBottom: '6px' }}>➕ Шинэ эмч бүртгэх</h2>
          <p className="auth-subtitle" style={{ marginBottom: '28px', fontSize: '14px' }}>Системд шинэ эмч нэмэх</p>

          <form onSubmit={handleRegisterDoctor} style={{ display: "flex", flexDirection: "column" }}>
            {[
              { icon: '👤', placeholder: 'Овог', value: doctorLastname, onChange: setDoctorLastname, type: 'text' },
              { icon: '👤', placeholder: 'Нэр', value: doctorFirstname, onChange: setDoctorFirstname, type: 'text' },
              { icon: '✉️', placeholder: 'Эмэйл хаяг', value: doctorEmail, onChange: setDoctorEmail, type: 'email' },
              { icon: '📞', placeholder: 'Утасны дугаар', value: doctorPhone, onChange: setDoctorPhone, type: 'text' },
              { icon: '💬', placeholder: 'Нууц үг', value: doctorPassword, onChange: setDoctorPassword, type: 'password' },
            ].map(({ icon, placeholder, value, onChange, type }, i) => (
              <div key={i} className="auth-input-group" style={{ marginBottom: i === 4 ? '32px' : '22px' }}>
                <span className="auth-input-icon">{icon}</span>
                <input type={type} className="auth-input" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} required />
              </div>
            ))}
            <button type="submit" className="auth-submit-btn" style={{ width: "100%", borderRadius: '50px' }}>
              Эмч бүртгэх <span>→</span>
            </button>
          </form>
        </div>

        {/* Registered Doctors List */}
        <div style={{
          flex: '1 1 400px',
          backgroundColor: 'white', borderRadius: '20px', padding: '22px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0'
        }}>
          <h3 style={{ color: '#444', marginTop: 0, marginBottom: '20px', fontSize: '15px', fontWeight: '700' }}>👨‍⚕️ Бүртгэлтэй эмч нар</h3>
          {doctors.length === 0 ? (
            <div style={{ color: '#bbb', textAlign: 'center', padding: '30px 0', fontSize: '14px' }}>Эмчийн мэдээлэл олдсонгүй</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {doctors.map(doc => <DoctorRow key={doc._id} doctor={doc} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
