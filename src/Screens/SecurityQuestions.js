import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SecurityQuestions = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [userId, setUserId] = useState(null);
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (username) {
      fetch(`http://localhost:5000/get-user-id/${username}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.userId) {
            setUserId(data.userId);
          } else {
            console.error("Пользователь не найден");
          }
        })
        .catch((err) => console.error("Ошибка при получении ID пользователя:", err));
    }
  }, [username]);

  useEffect(() => {
    fetch("http://localhost:5000/security-questions")
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions))
      .catch((err) => console.error("Ошибка при получении вопросов:", err));
  }, []);

  const handleAnswerChange = (index, answer) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = { questionId: questions[index].id, answer };
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    if (!userId || answers.length !== questions.length) {
      alert("Ответьте на все вопросы");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/register-answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, answers }),
      });

      const result = await response.json();
      if (response.ok) {
        navigate("/");
      } else {
        alert(result.message || "Ошибка при отправке ответов");
      }
    } catch (e) {
      console.error("Ошибка при отправке ответов:", e);
    }
  };

  return (
    <div style={rootDiv}>
      <div style={headerStyle}>Контрольные вопросы</div>
      {questions.map((question, index) => (
        <div key={question.id} style={questionContainer}>
          <label style={labelStyle}>{question.question}</label>
          <input
            style={input}
            type="text"
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder="Ваш ответ"
          />
        </div>
      ))}
      <button style={button} onClick={handleSubmit}>
        Отправить ответы
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

const headerStyle = {
  fontSize: 24,
  color: "white",
  marginBottom: 30,
};

const questionContainer = {
  margin: 10,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const labelStyle = {
  color: "white",
  fontSize: 18,
  marginBottom: 10,
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
  margin: 20,
  cursor: "pointer",
  fontSize: 17,
  color: "white",
  backgroundColor: "#9D27CD",
  border: "none",
};

export default SecurityQuestions;
