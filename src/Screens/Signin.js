import * as React from "react";
import { loadBlockchainData, loadWeb3 } from "../Web3helpers";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [image, setImage] = React.useState(null);
  const [imageFile, setImageFile] = React.useState(null);
  const navigate = useNavigate();

  const [accounts, setAccounts] = React.useState(null);
  const [auth, setAuth] = React.useState(null);

  const loadAccounts = async () => {
    try {
      let { auth, accounts } = await loadBlockchainData();
      console.log("Данные о пользователях:", accounts);
      console.log("Данные об авторизации:", auth);
      setAccounts(accounts);
      setAuth(auth);
    } catch (error) {
      console.error("Ошибка загрузки учетных данных:", error);
      alert("Ошибка загрузки учетных данных");
    }
  };

  const verifyImage = async () => {
    try {
      const response = await fetch("http://localhost:5000/verify-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, image }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Изображение подтверждено");
        return true;
      } else {
        alert(result.message || "Ошибка проверки изображения");
        return false;
      }
    } catch (error) {
      console.error("Ошибка при проверке изображения:", error);
      alert("Ошибка при подключении к серверу");
      return false;
    }
  };

  const login = async () => {
    if (!email || !password || !image) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    const isImageVerified = await verifyImage();
    if (!isImageVerified) return;

    try {
      const res = await auth.methods.usersList(email).call();
      if (res.password !== password) {
        alert("Неправильный пароль или учетная запись не существует");
        return;
      }

      localStorage.setItem("email", email);
      localStorage.setItem("account", accounts);
      navigate(`/securityans`);
    } catch (error) {
      alert("Ошибка авторизации");
    }
  };

  const handleImageClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
    input.onchange = (event) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(event.target.files[0]);
    };
  };

  React.useEffect(() => {
    loadWeb3();
  }, []);

  React.useEffect(() => {
    loadAccounts();
  }, []);

  return (
    <div style={rootDiv}>
      {image ? (
        <div style={imageContainer}>
          <img
            src={image}
            style={imageStyle}
            alt=""
            width={150}
            height={150}
            onClick={handleImageClick}
          />
        </div>
      ) : (
        <div style={imageContainer}>
          <div
            style={{
              borderRadius: "50%",
              width: 150,
              height: 150,
              border: "1px solid grey",
              cursor: "pointer",
              backgroundImage: "linear-gradient(to bottom, #ccc, #ccc)",
              backgroundSize: "100% 0%",
              backgroundPosition: "bottom",
              transition: "background-position 0.5s ease-in-out",
            }}
            onClick={handleImageClick}
          />
        </div>
      )}
      {!image && (
        <div style={{ color: "yellow", margin: 15, fontSize: 16 }}>
          Пожалуйста, выберите изображение
        </div>
      )}
      <input
        style={input}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="text"
      />
      <input
        style={input}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Пароль"
        type="password"
      />
      <button style={button} onClick={login}>
        Войти
      </button>

      <span
        style={{ cursor: "pointer" }}
        onClick={() => {
          navigate("/Signup");
        }}
      >
        Создать новую учетную запись
      </span>
    </div>
  );
}

const rootDiv = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  backgroundColor: "#3F4652",
  width: "100vw",
  padding: 0,
};

const input = {
  width: 300,
  padding: 10,
  margin: 10,
  borderRadius: 10,
  outline: "none",
  border: "2px solid grey",
  fontSize: 17,
};

const imageStyle = {
  width: 150,
  height: 150,
  border: "none",
  borderRadius: "50%",
  margin: 15,
  objectFit: "cover",
};

const imageContainer = {
  position: "relative",
};

const button = {
  width: 325,
  padding: 10,
  borderRadius: 10,
  margin: 10,
  cursor: "pointer",
  fontSize: 17,
  color: "white",
  backgroundColor: "#9D27CD",
  border: "none",
};
