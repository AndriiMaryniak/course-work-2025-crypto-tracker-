require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();

// ---------- НАЛАШТУВАННЯ ----------
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_me';

// локальна MongoDB (контейнер docker: mongo:6, порт 27017)
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto_tracker';

// парсимо JSON
app.use(express.json());

// CORS – дозволяємо фронтенд (Vite dev + nginx у Docker)
app.use(
  cors({
    origin: [
      'http://localhost:5173', // Vite dev
      'http://localhost:8080', // nginx у Docker
    ],
    credentials: true,
  })
);

// ---------- ДОПОМІЖНІ ФУНКЦІЇ ----------

// створити JWT токен
function createToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// middleware для перевірки авторизації
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Необхідна авторизація (немає токена).' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(401).json({ message: 'Користувача не знайдено.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Помилка authMiddleware:', err);
    return res
      .status(401)
      .json({ message: 'Невірний або прострочений токен.' });
  }
}

// ---------- ROUTES: AUTH ----------

// реєстрація
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email і пароль є обовʼязковими.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'Користувач з таким email вже існує.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      passwordHash,
      favorites: [],
      settings: { language: 'ua', theme: 'dark', currency: 'uah' },
    });

    const token = createToken(user);

    res.status(201).json({
      token,
      user: {
        email: user.email,
        favorites: user.favorites,
        settings: user.settings,
      },
    });
  } catch (err) {
    console.error('Помилка /api/auth/register:', err);
    res.status(500).json({ message: 'Внутрішня помилка сервера.' });
  }
});

// логін
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email і пароль є обовʼязковими.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: 'Невірний email або пароль.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res
        .status(401)
        .json({ message: 'Невірний email або пароль.' });
    }

    const token = createToken(user);

    res.json({
      token,
      user: {
        email: user.email,
        favorites: user.favorites,
        settings: user.settings,
      },
    });
  } catch (err) {
    console.error('Помилка /api/auth/login:', err);
    res.status(500).json({ message: 'Внутрішня помилка сервера.' });
  }
});

// ---------- ROUTES: USER PROFILE ----------

// поточний користувач
app.get('/api/user/me', authMiddleware, async (req, res) => {
  const user = req.user;
  res.json({
    email: user.email,
    favorites: user.favorites,
    settings: user.settings,
  });
});

// оновити налаштування (мова / тема / валюта) — через findByIdAndUpdate
app.put('/api/user/settings', authMiddleware, async (req, res) => {
  try {
    const { language, theme, currency } = req.body || {};
    const updates = {};

    if (language) updates['settings.language'] = language;
    if (theme) updates['settings.theme'] = theme;
    if (currency) updates['settings.currency'] = currency;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Користувача не знайдено.' });
    }

    res.json({
      email: updatedUser.email,
      favorites: updatedUser.favorites,
      settings: updatedUser.settings,
    });
  } catch (err) {
    console.error('Помилка /api/user/settings:', err);
    res.status(500).json({ message: 'Не вдалося оновити налаштування.' });
  }
});

// оновити favorites – приймаємо МАСИВ favorites, теж через findByIdAndUpdate
app.put('/api/user/favorites', authMiddleware, async (req, res) => {
  try {
    const { favorites } = req.body || {};

    if (!Array.isArray(favorites)) {
      return res
        .status(400)
        .json({ message: 'Поле favorites обовʼязкове і має бути масивом.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { favorites } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Користувача не знайдено.' });
    }

    res.json({
      email: updatedUser.email,
      favorites: updatedUser.favorites,
      settings: updatedUser.settings,
    });
  } catch (err) {
    console.error('Помилка /api/user/favorites:', err);
    res.status(500).json({ message: 'Не вдалося оновити обрані монети.' });
  }
});

// ---------- START ----------
async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Підключено до MongoDB');

    app.listen(PORT, () => {
      console.log(`✅ Сервер запущено на порту ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Помилка підключення до MongoDB:', err);
    process.exit(1);
  }
}

start();
