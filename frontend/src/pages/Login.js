import "../styles/auth.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_URL from "../apiConfig";

function Login() {
  const [email, setEmail] = useState("");
  const [upass, setPass] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Шинэ ID-г шууд хатуу бичив (Vercel Build-ийн асуудлаас сэргийлж)
  const GOOGLE_CLIENT_ID = "311946659040-t7au41c420l7gmn4251sojq7eutd5l3r.apps.googleusercontent.com";

  useEffect(() => {
    const initGoogle = () => {
      /* global google */
      if (window.google && window.google.accounts) {
        console.log("Google library ready. Initializing...");
        const client = google.accounts.oauth2.initCodeClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile https://www.googleapis.com/auth/calendar',
          ux_mode: 'popup',
          callback: (response) => {
            console.log("Google response received:", response);
            if (response.code) {
              handleGoogleResponse(response.code);
            }
          },
        });

        const googleBtn = document.getElementById("google-btn-container");
        if (googleBtn) {
          googleBtn.innerHTML = `
            <button id="real-google-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer; font-family: inherit; font-size: 16px; transition: all 0.2s;">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Logo.svg" alt="Google" style="width: 20px; height: 20px;" />
              Google-ээр нэвтрэх
            </button>
          `;
          document.getElementById("real-google-btn").onclick = () => {
            console.log("Google button clicked, requesting code...");
            client.requestCode();
          };
        }
      } else {
        console.log("Google library not ready, retrying in 500ms...");
        setTimeout(initGoogle, 500);
      }
    };

    initGoogle();
  }, [GOOGLE_CLIENT_ID]);

  const handleGoogleResponse = async (code) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
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

