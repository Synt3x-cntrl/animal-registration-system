import { useState, useEffect } from "react";
import MedicalForm from "../components/MedicalForm";
import DoctorAppointmentsList from "../components/DoctorAppointmentsList";
import DoctorDailySummariesList from "../components/DoctorDailySummariesList";
import DoctorFastSearch from "../components/DoctorFastSearch";
import PassportRequestRow from "../components/PassportRequestRow";
import API_URL from "../apiConfig";
import LoadingSpinner from "../components/LoadingSpinner";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [passportRequests, setPassportRequests] = useState([]);

  useEffect(() => {
    // Вэб ачааллахад theme-ийг тохируулах
    const storedTheme = localStorage.getItem("appTheme") || "#a2a2df";
    document.documentElement.style.setProperty("--primary-color", storedTheme);

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchDashboardStats(parsedUser);
      if (parsedUser.role === 'doctor') {
        fetchPassportRequests();
      }
    }
  }, []);

  const fetchDashboardStats = async (userObj) => {
    setLoadingStats(true);
    try {
      if (userObj.role === 'admin') {
        const res = await fetch(`${API_URL}/auth/admin/stats`);
        const data = await res.json();
        if (data.success) setStats(data.data);
      } else if (userObj.role === 'user') {
        const res = await fetch(`${API_URL}/stats/user/${userObj._id}`);
        const data = await res.json();
        if (data.success) setStats(data.data);
      } else if (userObj.role === 'doctor') {
        const res = await fetch(`${API_URL}/stats/doctor/${userObj._id}`);
        const data = await res.json();
        if (data.success) setStats(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
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

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {user && (
        <div style={{ marginTop: "20px" }}>

          {user.role === 'user' && stats?.nextAppointmentDays !== null && stats?.nextAppointmentPetName && (
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#e8f8f5', borderRadius: '24px', borderLeft: '6px solid #27ae60', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '30px' }}>🔔</span>
              <div>
                <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '18px' }}>Анхааруулга!</h3>
                <p style={{ margin: '5px 0 0 0', color: '#27ae60', fontSize: '16px', fontWeight: 'bold' }}>
                  Сайн байна уу, {user.firstname}! Таны '{stats.nextAppointmentPetName}' амьтны вакцин/үзлэг хийлгэхэд {stats.nextAppointmentDays} хоног үлдлээ.
                </p>
              </div>
            </div>
          )}

          {/* Stats Cards Хэсэг */}
          <div style={{ marginBottom: "30px" }}>
            {loadingStats ? (
              <LoadingSpinner text="Тоон мэдээллийг ачааллаж байна..." />
            ) : stats ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                {user.role === 'admin' && (
                  <>
                    <div style={{ padding: '20px', backgroundColor: '#e8f4f8', borderRadius: '12px', textAlign: 'center', boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3498db' }}>{stats.totalUsers || 0}</div>
                      <div style={{ color: '#7f8c8d', fontSize: '15px', fontWeight: 'bold', marginTop: '5px' }}>Нийт хэрэглэгчид</div>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '12px', textAlign: 'center', boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f39c12' }}>{stats.totalPets || 0}</div>
                      <div style={{ color: '#7f8c8d', fontSize: '15px', fontWeight: 'bold', marginTop: '5px' }}>Бүртгэлтэй амьтад</div>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#d4edda', borderRadius: '12px', textAlign: 'center', boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#28a745' }}>{stats.totalAppointments || 0}</div>
                      <div style={{ color: '#7f8c8d', fontSize: '15px', fontWeight: 'bold', marginTop: '5px' }}>Шинэ хүсэлт/Захиалга</div>
                    </div>
                  </>
                )}

                {user.role === 'user' && (
                  <>
                    <div style={{ padding: '20px', backgroundColor: '#e8f4f8', borderRadius: '24px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3498db' }}>{stats.totalPets || 0}</div>
                      <div style={{ color: '#7f8c8d', fontSize: '15px', fontWeight: 'bold', marginTop: '5px' }}>Миний амьтад 🐾</div>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '24px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f39c12' }}>
                        {stats.nextAppointmentDays !== null ? `${stats.nextAppointmentDays} ` : '—'}
                        {stats.nextAppointmentDays !== null && <span style={{ fontSize: '16px' }}>хоног</span>}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '15px', fontWeight: 'bold', marginTop: '5px' }}>Дараагийн уулзалт 🗓️</div>
                    </div>
                  </>
                )}

                {user.role === 'doctor' && (
                  <>
                    <div style={{ padding: '20px', backgroundColor: '#d4edda', borderRadius: '12px', textAlign: 'center', boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#28a745' }}>{stats.todayAppointments || 0}</div>
                      <div style={{ color: '#7f8c8d', fontSize: '15px', fontWeight: 'bold', marginTop: '5px' }}>Өнөөдрийн захиалга 📅</div>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#f8d7da', borderRadius: '12px', textAlign: 'center', boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#dc3545' }}>{stats.totalPatientsSeen || 0}</div>
                      <div style={{ color: '#7f8c8d', fontSize: '15px', fontWeight: 'bold', marginTop: '5px' }}>Нийт үзсэн амьтад 🩺</div>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              gap: "30px",
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            {/* АДМИН ХЭСЭГ - Ширтээгүй (AdminDashboard-руу Sidebar-аар дамжиж очно) */}
            {user.role === "admin" && (
              <div style={{ width: '100%', padding: '20px', textAlign: 'center', color: '#888' }}>
                <p>Админ тавтай морилно уу. Статистик харахын тулд Хяналтын самбар руу орно уу.</p>
              </div>
            )}

            {/* ЭМЧИЙН ХЭСЭГ */}
            {user.role === "doctor" && (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                {/* Хурдан хайлт */}
                <div style={{ width: '100%', marginBottom: '10px' }}>
                  <DoctorFastSearch 
                    onExamine={(pet) => {
                      setSelectedAppointment({
                        petName: pet.name,
                        ownerId: pet.owner,
                        date: new Date().toISOString()
                      });
                    }}
                  />
                </div>

                {/* Зүүн: Миний захиалгууд */}
                <div className="responsive-width" style={{ flex: "1 1 50%", minWidth: "300px" }}>
                  <DoctorAppointmentsList
                    key={refreshKey}
                    doctorId={user._id}
                    onAppointmentClick={setSelectedAppointment}
                  />
                </div>
                {/* Баруун: Эмнэлгийн үзлэг бүртгэх */}
                <div className="responsive-width" style={{ flex: "1 1 40%", minWidth: "300px" }}>
                  <h3
                    style={{
                      borderBottom: "2px solid #3498db",
                      paddingBottom: "10px",
                      color: "#2c3e50",
                    }}
                  >
                    🏥 Эмнэлгийн үзлэг бүртгэх
                  </h3>
                  {selectedAppointment && (
                    <div
                      style={{
                        marginBottom: "10px",
                        padding: "8px 12px",
                        backgroundColor: "#e3f2fd",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: "#1565c0",
                      }}
                    >
                      ✅ Урьдчилж бөглөх дата (<strong>{selectedAppointment.petName}</strong>) орууллаа.
                    </div>
                  )}
                  <div style={{ marginTop: "20px" }}>
                    <MedicalForm
                      prefillData={selectedAppointment}
                      doctorName={`${user.firstname} ${user.lastname}`}
                      doctorId={user._id}
                      onSuccess={() => {
                        setSelectedAppointment(null);
                        setRefreshKey((k) => k + 1);
                      }}
                    />
                  </div>
                </div>

                {/* Доороо: Өдрийн тайлангууд */}
                <div style={{ flex: "1 1 100%", width: "100%", marginTop: "20px" }}>
                  <DoctorDailySummariesList doctorId={user._id} doctorName={`${user.firstname} ${user.lastname}`} />
                </div>

                {/* Баруун Доороо: Пасспорт хүсэлтүүд (Доктор) */}
                <div style={{ flex: "1 1 100%", width: "100%", marginTop: "20px", padding: '20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
                  <h3 style={{ borderBottom: "2px solid #27ae60", paddingBottom: "10px", color: "#2c3e50" }}>
                    🛂 Пасспортын хүсэлтүүд
                    {passportRequests.length > 0 && (
                      <span style={{ backgroundColor: '#e74c3c', color: 'white', fontSize: '12px', padding: '2px 8px', borderRadius: '20px', marginLeft: '10px' }}>{passportRequests.length}</span>
                    )}
                  </h3>
                  {passportRequests.length === 0 ? (
                    <div style={{ color: '#bbb', textAlign: 'center', padding: '20px 0', fontSize: '14px', fontStyle: 'italic' }}>
                      Одоогоор шийдвэрлэх хүсэлт алга байна.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {passportRequests.map(req => (
                        <PassportRequestRow key={req._id} request={req} onEvaluate={handleEvaluatePassport} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ХЭРЭГЛЭГЧИЙН (USER) ХЭСЭГ */}
            {user.role === "user" && null}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
