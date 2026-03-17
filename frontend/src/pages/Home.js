import { useState, useEffect } from "react";
import MedicalForm from "../components/MedicalForm";
import DoctorAppointmentsList from "../components/DoctorAppointmentsList";

function Home() {
  const [user, setUser] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Вэб ачааллахад theme-ийг тохируулах
    const storedTheme = localStorage.getItem("appTheme") || "#007bff";
    document.documentElement.style.setProperty("--primary-color", storedTheme);

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", color: "#333", marginBottom: "30px" }}>
        Удирдлагын самбар
      </h2>
      {user && (
        <div style={{ marginTop: "20px" }}>
          {/* User Profile Header */}
          <div
            style={{
              padding: "20px",
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
              backgroundColor: "white",
              marginBottom: "30px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderLeft: "5px solid var(--primary-color)",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>
                Сайн байна уу,{" "}
                <span style={{ color: "var(--primary-color)" }}>
                  {user.firstname} {user.lastname}
                </span>
                ? 👋
                {user.role === "doctor" && (
                  <span
                    style={{
                      marginLeft: "10px",
                      fontSize: "14px",
                      backgroundColor: "#e74c3c",
                      color: "white",
                      padding: "3px 8px",
                      borderRadius: "12px",
                    }}
                  >
                    ЭМЧ
                  </span>
                )}
                {user.role === "admin" && (
                  <span
                    style={{
                      marginLeft: "10px",
                      fontSize: "14px",
                      backgroundColor: "#34495e",
                      color: "white",
                      padding: "3px 8px",
                      borderRadius: "12px",
                    }}
                  >
                    АДМИН
                  </span>
                )}
              </h3>
              <p style={{ margin: 0, color: "#6c757d" }}>
                Таны эмэйл: {user.email}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "30px",
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            {/* АДМИН ХЭСЭГ */}
            {user.role === "admin" && (
              <div
                style={{
                  width: "100%",
                  padding: "40px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <h1 style={{ color: "#2c3e50" }}>Админы самбар</h1>
                <p>
                  Энд хэрэглэгчдийн жагсаалт, тохиргоо зэрэг админы функцууд
                  байрлана.
                </p>
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
                {/* Зүүн: Миний захиалгууд */}
                <div style={{ flex: "1 1 50%", minWidth: "300px" }}>
                  <DoctorAppointmentsList
                    key={refreshKey}
                    doctorId={user._id}
                    onAppointmentClick={setSelectedAppointment}
                  />
                </div>
                {/* Баруун: Эмнэлгийн үзлэг бүртгэх */}
                <div style={{ flex: "1 1 40%", minWidth: "300px" }}>
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
                      ✅ <strong>{selectedAppointment.petName}</strong> -ийн
                      захиалга сонгогдлоо. Маягт автоматаар бөглөгдлөө.
                    </div>
                  )}
                  <div style={{ marginTop: "20px" }}>
                    <MedicalForm
                      prefillData={selectedAppointment}
                      doctorName={`${user.firstname} ${user.lastname}`}
                      onSuccess={() => {
                        setSelectedAppointment(null);
                        setRefreshKey((k) => k + 1);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ХЭРЭГЛЭГЧИЙН (USER) ХЭСЭГ */}
            {user.role === "user" && (
              <div
                style={{
                  width: "100%",
                  padding: "40px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <h2 style={{ color: "#2c3e50" }}>
                  Амьтны дэлгүүрт тавтай морил!
                </h2>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#6c757d",
                    marginTop: "15px",
                  }}
                >
                  Та зүүн талын цэснээс амьтдаа бүртгэх, цаг захиалах боломжтой.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
