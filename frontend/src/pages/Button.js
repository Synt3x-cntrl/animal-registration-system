import { useNavigate } from "react-router-dom";
import "../styles/style.css";

function Btn({ type }) {
  const navigate = useNavigate();

  return (
    <div>
      {type === "login" && (
        <button
          className="button"
          onClick={() => {
            alert("Амжилттай нэвтэрлээ");
            navigate("/");
          }}
        >
          Нэвтрэх
        </button>
      )}

      {type === "register" && (
        <button
          className="button"
          onClick={() => {
            alert("Амжилттай бүртгэгдлээ");
            navigate("/login");
          }}
        >
          Бүртгүүлэх
        </button>
      )}
    </div>
  );
}

export default Btn;
