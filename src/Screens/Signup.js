import React, { useState } from "react";
import { loadBlockchainData, loadWeb3 } from "../Web3helpers";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accounts, setAccounts] = useState(null);
  const [auth, setAuth] = useState(null);
  const [image, setImage] = useState(null);

  const loadAccounts = async () => {
    let { auth, accounts } = await loadBlockchainData();
    setAccounts(accounts);
    setAuth(auth);
  };

  const signUp = async () => {
    if (!username ||!email ||!password) {
      alert("please fill all details");
      return;
    }
    var mailformat = /^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/;
    if (!email.match(mailformat)) {
      alert("please enter valid email address");
      return;
    }
    try {
      await auth.methods
    .createUser(username, email, password)
    .send({ from: accounts });

      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      navigate("/");
    } catch (e) {
      console.log(e.message);
    }
  };

  React.useEffect(() => {
    loadWeb3();
  }, []);

  React.useEffect(() => {
    loadAccounts();
  }, []);

  const handleImageChange = (event) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(event.target.files[0]);
  };

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();
    input.onchange = (event) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(event.target.files[0]);
    };
  };

  const handleCircleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();
    input.onchange = (event) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(event.target.files[0]);
    };
  };

  return (
    <div style={rootDiv}>
      {image? (
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
            onClick={handleCircleClick}
          />
        </div>
      )}
      {!image && (
        <div style={{ color: "yellow", fontSize: 14 }}>
          Пожалуйста, выберите изображение
        </div>
      )}
      <input
        style={input}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        type="text"
      />
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
        placeholder="Other param"
        type="password"
      />
      <button style={button} onClick={signUp}>
        {" "}
        Sign Up
      </button>
    </div>
  );
};

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

const imageStyle = {
  width: 150,
  height: 150,
  border: "none",
  borderRadius: "50%",
  margin: 10,
  objectFit: "cover"
};

const imageContainer = {
  position: "relative",
};

export default SignUp;