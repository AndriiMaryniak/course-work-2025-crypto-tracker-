import { useState } from 'react';
import { registerUser, loginUser } from '../services/authApi';

function AuthPanel({ language, onAuthSuccess, onLogout, isLoggedIn, currentUser }) {
  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const texts = {
    ua: {
      title: 'Аутентифікація',
      profileTitle: 'Профіль користувача',
      loggedInAs: 'Ви увійшли як',
      email: 'Email',
      password: 'Пароль',
      signUp: 'Зареєструватися',
      login: 'Увійти',
      loading: 'Виконується запит…',
      switchToLogin: 'Вже є аккаунт? Увійти',
      switchToRegister: 'Немає аккаунта? Зареєструватися',
      logout: 'Вийти з профілю',
    },
    en: {
      title: 'Authentication',
      profileTitle: 'User profile',
      loggedInAs: 'Logged in as',
      email: 'Email',
      password: 'Password',
      signUp: 'Sign up',
      login: 'Log in',
      loading: 'Processing request…',
      switchToLogin: 'Already have an account? Log in',
      switchToRegister: 'No account yet? Sign up',
      logout: 'Log out',
    },
  };

  const t = texts[language] || texts.ua;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      let result;

      if (mode === 'register') {
        result = await registerUser(trimmedEmail, password);
      } else {
        result = await loginUser(trimmedEmail, password);
      }

      // бекенд повертає { token, user }
      if (onAuthSuccess) {
        onAuthSuccess(result);
      }

      setEmail('');
      setPassword('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Помилка запиту.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn && currentUser) {
    return (
      <div className="auth-panel">
        <h3 className="card-title" style={{ marginTop: '16px' }}>
          {t.profileTitle}
        </h3>
        <p className="card-text">
          {t.loggedInAs}{' '}
          <strong>{currentUser.email}</strong>
        </p>
        <button
          type="button"
          className="refresh-button"
          onClick={onLogout}
        >
          {t.logout}
        </button>
      </div>
    );
  }

  return (
    <div className="auth-panel" style={{ marginTop: '16px' }}>
      <h3 className="card-title">{t.title}</h3>

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="card-text">
          {t.email}
          <input
            type="email"
            className="search-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="card-text">
          {t.password}
          <input
            type="password"
            className="search-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && (
          <div className="crypto-status crypto-status-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="refresh-button"
          disabled={loading}
        >
          {loading ? t.loading : mode === 'register' ? t.signUp : t.login}
        </button>
      </form>

      <button
        type="button"
        className="refresh-button"
        style={{ marginTop: '6px' }}
        onClick={() =>
          setMode(mode === 'register' ? 'login' : 'register')
        }
      >
        {mode === 'register' ? t.switchToLogin : t.switchToRegister}
      </button>
    </div>
  );
}

export default AuthPanel;
