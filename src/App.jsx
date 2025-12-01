import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Веб-додаток для відслідковування курсу криптовалют</h1>
        <p>Кросплатформенний трекер на базі React + Vite</p>
      </header>

      <main className="app-main">
        <section className="app-section">
          <h2>Головний екран</h2>
          <p>
            Тут пізніше буде відображатися список криптовалют, їхній поточний курс
            та графіки зміни ціни.
          </p>
          <p>
            Зараз це тільки стартовий шаблон, на основі якого ми крок за кроком
            побудуємо повноцінний трекер.
          </p>
        </section>
      </main>

      <footer className="app-footer">
        <small>© {new Date().getFullYear()} Курсовий проєкт з кросплатформенного програмування</small>
      </footer>
    </div>
  );
}

export default App;
