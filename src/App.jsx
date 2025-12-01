import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import CryptoList from './components/CryptoList';
import CryptoChart from './components/CryptoChart';

function App() {
  const [selectedCoin, setSelectedCoin] = useState(null);

  return (
    <div className="app">
      <Header />

      <main className="app-main">
        <div className="app-container">
          <section className="app-section">
            <h2>Головний екран</h2>
            <p>
              На цій сторінці відображається перелік основних криптовалют
              та їхні базові ринкові показники. Користувач може виконувати
              пошук, змінювати базову валюту відображення (USD/UAH) та
              аналізувати детальну динаміку ціни вибраної монети на графіку.
            </p>
            <p>
              Дані про ринок завантажуються з відкритого API CoinGecko.
              У разі недоступності сервісу застосунок може працювати з
              демонстраційними даними.
            </p>

            <CryptoList
              onCoinSelect={setSelectedCoin}
              selectedCoinId={selectedCoin?.id}
            />

            {selectedCoin && (
              <CryptoChart
                coinId={selectedCoin.id}
                coinName={selectedCoin.name}
              />
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
