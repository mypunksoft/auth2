import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const email = localStorage.getItem("email");
  const account = localStorage.getItem("account");

  const navigate = useNavigate();
  return (
    <div>
      <h3>Ваш аккаунт: {account} </h3>
      <h3>Ваш email: {email} </h3>
      <button
        style={button}
        onClick={() => {
          localStorage.removeItem("email");
          localStorage.removeItem("account");
          window.location.reload();
        }}
      >
        Выйти
      </button>
    </div>
  );
}

const button = {
  width: 100,
  padding: 10,
  borderRadius: 5,
  margin: 10,
  cursor: "pointer",
  fontSize: 17,
  color: "white",
  backgroundColor: "#9D27CD",
  border: "none",
};
