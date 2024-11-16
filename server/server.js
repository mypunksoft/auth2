const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());
app.use(cors());

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' })
  ]
});

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: '1',
  database: 'mydatabase',
  port: 5432,
});

pool.connect()
  .then(() => {
    logger.info('База данных успешно подключена');
  })
  .catch((err) => {
    logger.error('Ошибка подключения к базе данных', err);
    process.exit(1);
  });

const saltRounds = 10;

app.post('/register', async (req, res) => {
  const { username, email, image } = req.body;

  if (!username || !email || !image) {
    logger.warn('Отсутствуют обязательные поля для регистрации');
    return res.status(400).json({ message: 'Пожалуйста, заполните все обязательные поля' });
  }

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      logger.warn(`Пользователь уже существует: ${email}`);
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const result = await pool.query('INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id', [username, email]);
    const userId = result.rows[0].id;

    const hashedImage = bcrypt.hashSync(image, saltRounds);

    await pool.query(
      'INSERT INTO image_hashes (user_id, image_hash) VALUES ($1, $2)',
      [userId, hashedImage]
    );

    await pool.query(
      'INSERT INTO user_answers (user_id, answers) VALUES ($1, $2)',
      [userId, JSON.stringify([])]
    );

    logger.info(`Пользователь успешно зарегистрирован: ${email}`);
    res.status(200).json({ message: 'Регистрация прошла успешно' });
  } catch (error) {
    logger.error('Ошибка регистрации пользователя:', error);
    res.status(500).json({ message: 'Ошибка регистрации пользователя' });
  }
});

app.get('/security-questions', async (req, res) => {
  try {
    const questions = await pool.query(
      'SELECT id, question FROM security_questions ORDER BY RANDOM() LIMIT 8'
    );

    res.json({ questions: questions.rows });
  } catch (error) {
    logger.error('Ошибка получения вопросов безопасности:', error);
    res.status(500).json({ message: 'Ошибка получения вопросов безопасности' });
  }
});

app.post('/register-answers', async (req, res) => {
  const { userId, answers } = req.body;

  if (!userId || !answers || answers.length === 0) {
    logger.warn('Отсутствуют обязательные поля для сохранения ответов');
    return res.status(400).json({ message: 'Пожалуйста, заполните все обязательные поля' });
  }

  try {
    const userAnswers = await pool.query('SELECT * FROM user_answers WHERE user_id = $1', [userId]);

    if (userAnswers.rows.length === 0) {
      logger.warn(`Пользователь не найден в таблице user_answers: ${userId}`);
      return res.status(404).json({ message: 'Пользователь не найден в user_answers' });
    }

    await pool.query(
      'UPDATE user_answers SET answers = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [JSON.stringify(answers), userId]
    );

    logger.info(`Ответы успешно зарегистрированы для userId: ${userId}`);
    res.json({ message: 'Ответы успешно зарегистрированы' });
  } catch (error) {
    logger.error('Ошибка регистрации ответов:', error);
    res.status(500).json({ message: 'Ошибка регистрации ответов' });
  }
});

app.get('/get-user-id/:username', async (req, res) => {
  const { username } = req.params;

  if (!username) {
    logger.warn('Имя пользователя обязательно');
    return res.status(400).json({ message: 'Имя пользователя обязательно' });
  }

  try {
    const result = await pool.query('SELECT id FROM users WHERE username = $1 or email = $1', [username]);

    if (result.rows.length === 0) {
      logger.warn(`Пользователь не найден: ${username}`);
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const userId = result.rows[0].id;
    logger.info(`Пользователь найден: ${username}, userId: ${userId}`);
    
    res.json({ userId });
  } catch (error) {
    logger.error('Ошибка получения userId:', error);
    res.status(500).json({ message: 'Ошибка получения userId' });
  }
});

app.get('/security-ans/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const answersResult = await pool.query(
      'SELECT answers FROM user_answers WHERE user_id = $1', 
      [userId]
    );

    if (answersResult.rows.length === 0) {
      return res.status(404).json({ message: 'Ответы пользователя не найдены' });
    }

    const answers = answersResult.rows[0].answers;
    const randomAnswers = answers.sort(() => 0.5 - Math.random()).slice(0, 3);
    const questionIds = randomAnswers.map(answer => answer.questionId);

    const questionsResult = await pool.query(
      'SELECT id, question FROM security_questions WHERE id = ANY($1::int[])', 
      [questionIds]
    );

    res.json({ questions: questionsResult.rows });
  } catch (error) {
    logger.error('Ошибка получения вопросов безопасности:', error);
    res.status(500).json({ message: 'Ошибка получения вопросов безопасности' });
  }
});

app.post('/verify-answers', async (req, res) => {
  const { userId, answers } = req.body;

  try {
    const storedAnswersResult = await pool.query('SELECT answers FROM user_answers WHERE user_id = $1', [userId]);

    if (storedAnswersResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ответы пользователя не найдены' });
    }

    let storedAnswers = storedAnswersResult.rows[0].answers;

    if (typeof storedAnswers === 'string') {
      storedAnswers = JSON.parse(storedAnswers);
    }

    const isValid = Object.keys(answers).every(
      (questionId) => answers[questionId] === storedAnswers.find(ans => ans.questionId === parseInt(questionId))?.answer
    );

    if (isValid) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Ответы неверны' });
    }
  } catch (error) {
    logger.error('Ошибка проверки ответов:', error);
    res.status(500).json({ success: false, message: 'Ошибка проверки ответов' });
  }
});

app.post('/verify-image', async (req, res) => {
  const { email, image } = req.body;

  if (!email || !image) {
    logger.warn('Email и изображение обязательны для проверки');
    return res.status(400).json({ message: 'Email и изображение обязательны' });
  }

  try {
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      logger.warn(`Пользователь не найден: ${email}`);
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const userId = userResult.rows[0].id;

    const imageHashResult = await pool.query('SELECT image_hash FROM image_hashes WHERE user_id = $1', [userId]);
    if (imageHashResult.rows.length === 0) {
      logger.warn(`Хэш изображения не найден для пользователя с ID: ${userId}`);
      return res.status(404).json({ message: 'Хэш изображения не найден' });
    }

    const storedImageHash = imageHashResult.rows[0].image_hash;

    const isMatch = bcrypt.compareSync(image, storedImageHash);

    if (isMatch) {
      logger.info(`Успешное совпадение хэшей для пользователя: ${email}`);
      res.status(200).json({ success: true, message: 'Изображение совпадает' });
    } else {
      logger.warn(`Несовпадение хэшей для пользователя: ${email}`);
      res.status(401).json({ success: false, message: 'Изображение не совпадает' });
    }
  } catch (error) {
    logger.error('Ошибка проверки изображения:', error);
    res.status(500).json({ success: false, message: 'Ошибка проверки изображения' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Сервер запущен на порту ${PORT}`);
});
