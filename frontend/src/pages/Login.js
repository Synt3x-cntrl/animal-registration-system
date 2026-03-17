import "../styles/auth.css";
import { useState } from "react";
import { Link } from "react-router-dom";
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: upass }),
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

        if (data.user.role === "admin") {
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
    <div className="auth-page-wrapper">
      <div className="auth-form-container">
        <div className="auth-header-top">
          <Link to="/" className="auth-back-btn">
            &#8592;
          </Link>
          <div className="auth-top-link-text">
            Don't have an account?
            <Link to="/register" className="auth-top-link-action">
              Sign up
            </Link>
          </div>
        </div>

        <h1 className="auth-title">Sign In</h1>
        <p className="auth-subtitle">
          Secure Your Communications with Amitani Delguur
        </p>

        <div className="auth-input-group">
          <span className="auth-input-icon">👤</span>
          <input
            type="email"
            className="auth-input"
            placeholder="11Danielahmadi@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-input-group">
          <span className="auth-input-icon">💬</span>
          <input
            type="password"
            className="auth-input"
            placeholder="••••••••"
            value={upass}
            onChange={(e) => setPass(e.target.value)}
          />
          <span className="auth-input-right-icon eye">👁️</span>
        </div>

        <div className="auth-submit-row">
          <button className="auth-submit-btn" onClick={handleLogin}>
            Sign In <span>→</span>
          </button>

          <span className="auth-or-text">Or</span>

          <div className="auth-social-btns">
            <button className="auth-social-btn">f</button>
            <button className="auth-social-btn">G</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
