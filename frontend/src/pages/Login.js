import "../styles/auth.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_URL from "../apiConfig";

function Login() {
  const [email, setEmail] = useState("");
  const [upass, setPass] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const GOOGLE_CLIENT_ID = "311946659040-uvm88bhd0g0bpme9u3elr07a1amlhi73.apps.googleusercontent.com";

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
      });

      google.accounts.id.renderButton(
        document.getElementById("google-btn-container"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential })
      });

      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/dashboard";
      } else {
        setErrorMsg(data.error || "Google-ээр нэвтрэхэд алдаа гарлаа");
      }
    } catch (err) {
      setErrorMsg("Сервертэй холбогдоход алдаа гарлаа");
    }
  };

  const handleLogin = async () => {
    // ... (existing code for manual login)
    setErrorMsg("");
    try {
      if (!email || !upass) {
        setErrorMsg("Имэйл болон нууц үгээ оруулна уу 🐾");
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
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/dashboard";
      } else {
        setErrorMsg("Хэрэглэгчийн мэдээлэл олдсонгүй 🐾");
      }
    } catch (error) {
      setErrorMsg(error.message + " 🐾");
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-image-side"></div>
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-header-top">
            <Link to="/" className="auth-back-btn">
              &#8592;
            </Link>
            <div className="auth-top-link-text">
              Бүртгэлгүй юу?
              <Link to="/register" className="auth-top-link-action">
                Бүртгүүлэх
              </Link>
            </div>
          </div>

          <h1 className="auth-title">Нэвтрэх</h1>
          <p className="auth-subtitle">Системд тавтай морил. Та өөрийн бүртгэлээр нэвтэрч амьтдынхаа мэдээллийг удирдана уу.</p>

          {errorMsg && (
            <div className="auth-error-msg">
              <span>⚠️</span> {errorMsg}
            </div>
          )}

        <div className="auth-input-group">
          <span className="auth-input-icon">👤</span>
          <input
            type="email"
            className="auth-input"
            placeholder="Имэйл хаяг"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-input-group">
          <span className="auth-input-icon">💬</span>
          <input
            type="password"
            className="auth-input"
            placeholder="Нууц үг (••••••••)"
            value={upass}
            onChange={(e) => setPass(e.target.value)}
          />
          <span className="auth-input-right-icon eye">👁️</span>
        </div>

        <div className="auth-submit-row" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button className="auth-submit-btn" onClick={handleLogin} style={{ width: '100%' }}>
            Нэвтрэх <span>→</span>
          </button>

          <div style={{ position: 'relative', textAlign: 'center', margin: '10px 0' }}>
            <hr style={{ border: '0.5px solid #eee' }} />
            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', padding: '0 10px', color: '#aaa', fontSize: '13px' }}>Эсвэл</span>
          </div>

          <div id="google-btn-container" style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  </div>
  );
}

export default Login;

