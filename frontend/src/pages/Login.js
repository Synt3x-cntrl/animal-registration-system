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
      // 1. Log into Firebase directly (just like the Flutter app)
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("../firebase");

      await signInWithEmailAndPassword(auth, email, upass);

      // 2. Fetch the extra user data (like role, firstname, etc.) from our backend
      // Since we don't have a GET /user/:email, we can fetch all users or we can just send a fast request 
      // Actually, we can just use the backend login to get the data, BUT it will fail if they don't have a bcrypt password.
      // Easiest hack without changing much backend: Fetch all users and find the one with this email (if small DB),
      // OR better, since their UID is their Firestore ID, we can fetch the user directly if we had a dedicated route.
      // For now, let's fetch all users, it's a small app.
      const usersResponse = await fetch(`${API_URL}/auth/users`);
      
      if (!usersResponse.ok) {
        const errorText = await usersResponse.text();
        throw new Error(`Сервер дээр алдаа гарлаа: ${usersResponse.status} ${errorText.substring(0, 100)}`);
      }

      const usersData = await usersResponse.json();

      if (usersData.data) {
        const customUser = usersData.data.find(u => u.email === email);

        if (customUser) {
          alert("Амжилттай нэвтэрлээ");
          // Save user to localStorage exact same way as before
          localStorage.setItem("user", JSON.stringify(customUser));

          if (customUser.role === 'admin') {
            window.location.href = "/admin";
          } else {
            window.location.href = "/";
          }
        } else {
          alert("Хэрэглэгчийн мэдээлэл олдсонгүй");
        }
      } else {
        alert("Хэрэглэгчдийн мөнбэй мэдээлэл татахад алдаа гарлаа");
      }

    } catch (error) {
      let errorMsg = error.message;
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorMsg = "Имэйл эсвэл нууц үг буруу байна";
      }
      alert("Алдаа гарлаа: " + errorMsg);
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