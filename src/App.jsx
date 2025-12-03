// src/App.jsx
import { useState } from 'react';
import './App.css';
import CryptoList from './components/CryptoList';
import CryptoChart from './components/CryptoChart';

function App() {
  const [currency, setCurrency] = useState('usd');
  const [selectedCoin, setSelectedCoin] = useState(null);

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
            На цій сторінці відображається перелік основних криптовалют та їхні
            базові ринкові показники. Дані отримуються з відкритого CoinGecko API.
          </p>
          <p>
            Користувач може змінювати базову валюту (USD / UAH), обирати монету
            в таблиці та аналізувати динаміку її ціни на графіку.
          </p>
        </section>

        <section className="app-section">
          <CryptoList
            currency={currency}
            onCurrencyChange={setCurrency}
            selectedCoinId={selectedCoin?.id || null}
            onSelectCoin={setSelectedCoin}
          />
        </section>

        <section className="app-section">
          <CryptoChart
            coinId={selectedCoin?.id || null}
            coinName={selectedCoin?.name || ''}
            currency={currency}
          />
        </section>
      </main>

      <footer className="app-footer">
        <small>
          © {new Date().getFullYear()} Курсовий проєкт з кросплатформенного програмування
        </small>
      </footer>
    </div>
  );
}

export default App;
