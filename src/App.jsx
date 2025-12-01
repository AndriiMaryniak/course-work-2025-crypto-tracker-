import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <Header />

      <main className="app-main">
        <div className="app-container">
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
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
