import { useState, useEffect, useCallback } from "react";

function DoctorScheduleManager({ doctorId }) {
    const [schedules, setSchedules] = useState([]);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const fetchSchedules = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:4000/api/v1/doctor-schedules/${doctorId}?isBooked=false`);
            const data = await response.json();
            if (response.ok) {
                setSchedules(data.data);
            }
        } catch (error) {
            console.error("Цагийн хуваарь татахад алдаа гарлаа:", error);
        }
    }, [doctorId]);

    useEffect(() => {
        if (doctorId) {
            fetchSchedules();
        }
    }, [doctorId, fetchSchedules]);

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        if (!date || !time) {
            setMessage({ type: "error", text: "Огноо болон Цагийг оруулна уу" });
            setLoading(false);
            return;
        }

        // Combine date and time
        const combinedDateTime = new Date(`${date}T${time}:00`);

        try {
            const response = await fetch(`http://localhost:4000/api/v1/doctor-schedules`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ doctorId, date: combinedDateTime.toISOString() }),
            });
            const data = await response.json();

            if (response.ok) {
                setMessage({ type: "success", text: "Цаг амжилттай үүслээ!" });
                fetchSchedules(); // refresh list
            } else {
                setMessage({ type: "error", text: data.error || "Алдаа гарлаа" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Сервертэй холбогдоход алдаа гарлаа" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (scheduleId) => {
        if (!window.confirm("Энэ цагийг устгахдаа итгэлтэй байна уу?")) return;

        try {
            const response = await fetch(`http://localhost:4000/api/v1/doctor-schedules/${scheduleId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                fetchSchedules();
            } else {
                alert("Устгахад алдаа гарлаа одоогоор хэн нэгэн захиалсан байж болзошгүй.");
            }
        } catch (error) {
            console.error("Устгахад алдаа:", error);
        }
    };

    return (
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h3 style={{ borderBottom: "2px solid #3498db", paddingBottom: "10px", color: "#2c3e50" }}>🗓️ Цагийн хуваарь нэмэх</h3>

            <form onSubmit={handleAddSchedule} style={{ display: "flex", gap: "15px", alignItems: "flex-end", marginTop: "20px" }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Огноо</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                        min={new Date().toISOString().split('T')[0]} // Одоогоос хойш
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Цаг</label>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: "10px 20px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "5px", cursor: loading ? "not-allowed" : "pointer" }}
                >
                    {loading ? "Нэмж байна..." : "Нэмэх"}
                </button>
            </form>

            {message.text && (
                <div style={{ marginTop: "15px", padding: "10px", borderRadius: "5px", backgroundColor: message.type === "error" ? "#f8d7da" : "#d4edda", color: message.type === "error" ? "#721c24" : "#155724" }}>
                    {message.text}
                </div>
            )}

            <h4 style={{ marginTop: "30px", color: "#2c3e50" }}>Боломжтой цагууд ({schedules.length})</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                {schedules.map(sch => {
                    const d = new Date(sch.date);
                    return (
                        <div key={sch._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", border: "1px solid #3498db", borderRadius: "5px", backgroundColor: "#f1f9ff" }}>
                            <span>{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <button
                                onClick={() => handleDelete(sch._id)}
                                style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontWeight: "bold" }}
                            >
                                ✖
                            </button>
                        </div>
                    )
                })}
                {schedules.length === 0 && <span style={{ color: "#7f8c8d" }}>Сул цаг одоогоор байхгүй байна.</span>}
            </div>
        </div>
    );
}

export default DoctorScheduleManager;
