function Header({ language, setLanguage, theme, setTheme }) {
  const isLight = theme === 'light';

  const handleToggleTheme = () => {
    setTheme(isLight ? 'dark' : 'light');
  };

  const handleSetLang = (lang) => {
    setLanguage(lang);
  };

  const title =
    language === 'en'
      ? 'Web app for tracking cryptocurrency exchange rates'
      : 'Веб-додаток для відслідковування курсу криптовалют';

  const subtitle =
    language === 'en'
      ? 'Cross-platform tracker built with React + Vite'
      : 'Кросплатформенний трекер на базі React + Vite';

  // 🔄 Текст для кнопки теми залежно від мови + поточної теми
  let themeLabel;
  if (language === 'en') {
    themeLabel = isLight ? '🌙 Dark theme' : '☀️ Light theme';
  } else {
    themeLabel = isLight ? '🌙 Темна тема' : '☀️ Світла тема';
  }

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="header-main">
          <h1 className="app-title">{title}</h1>
          <p className="app-subtitle">{subtitle}</p>
        </div>

        <div className="app-header-actions">
          <div className="lang-switch" aria-label="Language switch">
            <button
              type="button"
              className={
                'lang-btn' + (language === 'ua' ? ' lang-btn--active' : '')
              }
              onClick={() => handleSetLang('ua')}
            >
              UA
            </button>
            <button
              type="button"
              className={
                'lang-btn' + (language === 'en' ? ' lang-btn--active' : '')
              }
              onClick={() => handleSetLang('en')}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={handleToggleTheme}
          >
            {themeLabel}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
