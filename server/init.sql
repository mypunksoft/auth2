CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS image_hashes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS security_questions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_answers (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answers JSONB NOT NULL, -- JSON-объект с ответами
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка стандартных вопросов безопасности
INSERT INTO security_questions (question)
VALUES
    ('Как зовут вашу мать в девичестве?'),
    ('Как звали вашего первого питомца?'),
    ('В каком городе вы родились?'),
    ('Какая ваша любимая книга?'),
    ('Загрузите памятную фотографию.'),
    ('Какая ваша любимая песня или звук?'),
    ('Как называется улица, на которой вы выросли?'),
    ('Как называлась ваша первая школа?'),
    ('Как звали вашего лучшего друга в детстве?'),
    ('Как звали вашего первого учителя?'),
    ('Какое название вашего любимого фильма?'),
    ('В каком городе вы встретили своего лучшего друга?'),
    ('На каком спортивном клубе вы болеете?'),
    ('Какую марку был ваш первый автомобиль?'),
    ('Кем вы хотели стать в детстве?')
ON CONFLICT DO NOTHING;
