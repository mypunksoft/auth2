import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SecurityQues() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const username = localStorage.getItem('email');

  useEffect(() => {
    if (!username) {
      navigate('/SignIn');
    } else {
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
  }, [username, navigate]);

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:5000/security-ans/${userId}`)
        .then(response => response.json())
        .then(data => {
          if (data.questions) {
            setQuestions(data.questions);
          } else {
            alert('Не удалось загрузить вопросы безопасности');
          }
        })
        .catch(error => {
          console.error('Ошибка при загрузке вопросов безопасности:', error);
          alert('Ошибка загрузки вопросов безопасности');
        });
    }
  }, [userId]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  const submitAnswers = async () => {
    if (Object.keys(answers).length !== 3) {
      alert('Пожалуйста, ответьте на все вопросы');
      return;
    }

    const response = await fetch('http://localhost:5000/verify-answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, answers }),
    });

    const result = await response.json();
    if (result.success) {
      navigate('/Home');
    } else {
      alert('Некорректные ответы');
    }
  };

  return (
    <div style={rootDiv}>
      <h2 style={header}>Ответьте на вопросы безопасности</h2>
      {questions.map((question) => (
        <div key={question.id} style={questionContainer}>
          <label style={label}>{question.question}</label>
          <input
            style={input}
            type="text"
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Ваш ответ"
          />
        </div>
      ))}
      <button style={button} onClick={submitAnswers}>
        Отправить ответы
      </button>
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

const header = {
  color: "white",
  marginBottom: 20,
  fontSize: 24,
};

const questionContainer = {
  marginBottom: 15,
};

const label = {
  color: "white",
  fontSize: 16,
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
