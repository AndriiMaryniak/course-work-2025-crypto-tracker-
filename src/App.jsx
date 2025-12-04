import { useEffect, useState } from 'react';
import './App.css';
import CryptoList from './components/CryptoList';
import CryptoChart from './components/CryptoChart';
import { fetchMarketCoins } from './services/coinGeckoApi';

function App() {
  const [currency, setCurrency] = useState('uah');        // базова валюта: 'usd' або 'uah'
  const [coins, setCoins] = useState([]);
  const [loadingCoins, setLoadingCoins] = useState(false);
  const [coinsError, setCoinsError] = useState(null);

  const [selectedCoinId, setSelectedCoinId] = useState(null);
  const [selectedCoinName, setSelectedCoinName] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  // Завантаження списку монет при зміні валюти
  useEffect(() => {
    let cancelled = false;

    async function loadCoins() {
      setLoadingCoins(true);
      setCoinsError(null);

      try {
        const data = await fetchMarketCoins(currency); // currency: 'usd' або 'uah'

        if (cancelled) return;

        setCoins(data);
        setLastUpdate(new Date());

        // Якщо монета ще не вибрана – беремо першу з таблиці
        if (!selectedCoinId && data.length > 0) {
          setSelectedCoinId(data[0].id);
          setSelectedCoinName(data[0].name);
        } else if (selectedCoinId) {
          const found = data.find((c) => c.id === selectedCoinId);
          if (found) {
            setSelectedCoinName(found.name);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setCoinsError(
            err?.message ||
              'Сталася помилка під час завантаження даних з CoinGecko.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCoins(false);
        }
      }
    }

    loadCoins();

    return () => {
      cancelled = true;
    };
    
  }, [currency]);

  const handleSelectCoin = (coin) => {
    setSelectedCoinId(coin.id);
    setSelectedCoinName(coin.name);
  };

  const formatLastUpdate = (dt) => {
    if (!dt) return null;
    return dt.toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="app-title">
            Веб-додаток для відслідковування курсу криптовалют
          </h1>
          <p className="app-subtitle">
            Кросплатформенний трекер на базі React + Vite
          </p>
        </div>
      </header>

      <main className="app-main app-layout">
        {/* Лівий блок — опис головного екрану */}
        <section className="card intro-card">
          <h2 className="card-title">Головний екран</h2>
          <p className="card-text">
            На цій сторінці відображається перелік основних криптовалют та їхні
            базові ринкові показники. Дані отримуються з відкритого CoinGecko
            API з використанням особистого demo-ключа.
          </p>
          <p className="card-text">
            Користувач може змінювати базову валюту відображення (USD / UAH),
            обирати монету в таблиці та аналізувати динаміку її ціни на графіку
            за останні 7 днів.
          </p>
          <p className="card-text">
            Інтерфейс реалізовано як адаптивний веб-додаток, який коректно
            відображається на стаціонарних ПК, ноутбуках та смартфонах, що
            підкреслює кросплатформенність рішення.
          </p>
        </section>

        {/* Центральний блок — таблиця криптовалют */}
        <section className="card coins-card">
          <CryptoList
            coins={coins}
            currency={currency}
            setCurrency={setCurrency}
            selectedCoinId={selectedCoinId}
            onSelectCoin={handleSelectCoin}
            loading={loadingCoins}
            error={coinsError}
            lastUpdateText={formatLastUpdate(lastUpdate)}
          />
        </section>

        {/* Правий блок — графік вибраної монети */}
        <section className="card crypto-chart-card">
          <CryptoChart
            coinId={selectedCoinId}
            coinName={selectedCoinName}
            currency={currency}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
