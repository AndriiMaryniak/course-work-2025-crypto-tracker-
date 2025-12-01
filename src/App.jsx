import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import CryptoList from './components/CryptoList';

function App() {
  return (
    <div className="app">
      <Header />

      <main className="app-main">
        <div className="app-container">
          <section className="app-section">
            <h2>Головний екран</h2>
            <p>
              На цій сторінці відображається перелік основних криптовалют
              та їхні базові ринкові показники. Поки що використовуються
              демонстраційні (статичні) дані.
            </p>
            <p>
              На наступних етапах ми підʼєднаємо CoinGecko API, додамо пошук,
              фільтрацію та графіки зміни ціни.
            </p>

            <CryptoList />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
