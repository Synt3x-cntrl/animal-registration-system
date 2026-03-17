import "../styles/style.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import MyInput from "../components/MyInput";
import MyButton from "../components/My_button";
import API_URL from "../apiConfig";

function Login() {
  const [email, setEmail] = useState("");
  const [upass, setPass] = useState("");

  const handleLogin = async () => {
    try {
      if (!email || !upass) {
        alert("Имэйл болон нууц үгээ оруулна уу");
        return;
      }

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password: upass })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(`Сервер дээр алдаа гарлаа: ${response.status}`);
        }
        throw new Error(errorData.error || "Нэвтрэхэд алдаа гарлаа");
      }

      const data = await response.json();

      if (data.success && data.user) {
        alert("Амжилттай нэвтэрлээ");
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === 'admin') {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        alert("Хэрэглэгчийн мэдээлэл олдсонгүй");
      }
    } catch (error) {
      alert("Алдаа гарлаа: " + error.message);
    }
  };

  return (
    <div className="container">
      <p className="title">Энэ миний анхны вэб сайт</p>
      <div>
        <MyInput
          type="email"
          placeholder="Эмэйл хаяг"
          value={email}
          onChange={(e) => setEmail(e.target.value)} />

        <MyInput
          type="password"
          placeholder="Нууц үг"
          value={upass}
          onChange={(e) => setPass(e.target.value)} />

        <MyButton
          title="Нэвтрэх"
          onClick={handleLogin} value="mybutton" />

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>Бүртгэлгүй юу? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Бүртгүүлэх</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;