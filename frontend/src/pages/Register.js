import "../styles/auth.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_URL from "../apiConfig";

function Register() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!firstname || !lastname || !email || !phone || !password) {
      alert("Бүх талбарыг бөглөнө үү");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: firstname,
          lastname: lastname,
          email: email,
          phone: phone,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(
            `Сервер дээр алдаа гарлаа: ${response.status}. ${errorText.substring(0, 100)}`,
          );
        }
        throw new Error(errorData.error || "Бүртгэл хийхэд алдаа гарлаа");
      }

      await response.json();

      if (response.ok) {
        alert("Амжилттай бүртгэгдлээ. Одоо нэвтэрч орно уу.");
        navigate("/login");
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
            Already member?
            <Link to="/login" className="auth-top-link-action">
              Sign in
            </Link>
          </div>
        </div>

        <h1 className="auth-title">Sign Up</h1>
        <p className="auth-subtitle">
          Secure Your Communications with Amitani Delguur
        </p>

        <div className="auth-input-group">
          <span className="auth-input-icon">👤</span>
          <input
            type="text"
            className="auth-input"
            placeholder="Овог"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
          <span className="auth-input-right-icon">✓</span>
        </div>

        <div className="auth-input-group">
          <span className="auth-input-icon">👤</span>
          <input
            type="text"
            className="auth-input"
            placeholder="Нэр"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
          <span className="auth-input-right-icon">✓</span>
        </div>

        <div className="auth-input-group">
          <span className="auth-input-icon">✉️</span>
          <input
            type="email"
            className="auth-input"
            placeholder="Эмэйл хаяг"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span className="auth-input-right-icon">✓</span>
        </div>

        <div className="auth-input-group">
          <span className="auth-input-icon">📞</span>
          <input
            type="text"
            className="auth-input"
            placeholder="Утасны дугаар"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <span className="auth-input-right-icon">✓</span>
        </div>

        <div className="auth-input-group">
          <span className="auth-input-icon">💬</span>
          <input
            type="password"
            className="auth-input"
            placeholder="Нууц үг"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="auth-input-right-icon eye">👁️</span>
        </div>

        <div className="auth-submit-row">
          <button className="auth-submit-btn" onClick={handleRegister}>
            Sign Up <span>→</span>
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

export default Register;
