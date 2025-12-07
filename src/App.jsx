import { useEffect, useState } from 'react';
import './App.css';
import CryptoList from './components/CryptoList';
import CryptoChart from './components/CryptoChart';
import Header from './components/Header';
import Footer from './components/Footer';
import { fetchMarketCoins } from './services/coinGeckoApi';

function App() {
  // Валюта – читаємо з localStorage або 'uah'
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('ct_currency');
    return saved || 'uah';
  });

  const [coins, setCoins] = useState([]);
  const [loadingCoins, setLoadingCoins] = useState(false);
  const [coinsError, setCoinsError] = useState(null);

  // Вибрана монета – теж з localStorage
  const [selectedCoinId, setSelectedCoinId] = useState(() => {
    return localStorage.getItem('ct_coinId') || null;
  });
  const [selectedCoinName, setSelectedCoinName] = useState(() => {
    return localStorage.getItem('ct_coinName') || '';
  });

  const [lastUpdate, setLastUpdate] = useState(null);

  // Обрані монети (id монет) – з localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('ct_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Завантаження списку монет при зміні валюти / вибраної монети
  useEffect(() => {
    let cancelled = false;

    async function loadCoins() {
      setLoadingCoins(true);
      setCoinsError(null);

      try {
        // Топ-50 монет
        const data = await fetchMarketCoins(currency, 50);

        if (cancelled) return;

        setCoins(data);
        setLastUpdate(new Date());

        // Якщо монета ще не вибрана – беремо першу
        if (!selectedCoinId && data.length > 0) {
          setSelectedCoinId(data[0].id);
          setSelectedCoinName(data[0].name);
        } else if (selectedCoinId) {
          // Якщо вже щось було вибрано, шукаємо в новому списку
          const found = data.find((c) => c.id === selectedCoinId);
          if (found) {
            setSelectedCoinName(found.name);
          } else if (data.length > 0) {
            // Якщо вибраної монети більше немає – беремо першу
            setSelectedCoinId(data[0].id);
            setSelectedCoinName(data[0].name);
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
  }, [currency, selectedCoinId]);

  // Зберігаємо валюту
  useEffect(() => {
    localStorage.setItem('ct_currency', currency);
  }, [currency]);

  // Зберігаємо вибрану монету
  useEffect(() => {
    if (selectedCoinId) {
      localStorage.setItem('ct_coinId', selectedCoinId);
      localStorage.setItem('ct_coinName', selectedCoinName || '');
    }
  }, [selectedCoinId, selectedCoinName]);

  // Зберігаємо обрані монети
  useEffect(() => {
    localStorage.setItem('ct_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSelectCoin = (coin) => {
    setSelectedCoinId(coin.id);
    setSelectedCoinName(coin.name);
  };

  const toggleFavorite = (coinId) => {
    setFavorites((prev) =>
      prev.includes(coinId)
        ? prev.filter((id) => id !== coinId)
        : [...prev, coinId]
    );
  };

  // Ручне оновлення списку монет
  const refreshCoins = async () => {
    setLoadingCoins(true);
    setCoinsError(null);
    try {
      const data = await fetchMarketCoins(currency, 50);
      setCoins(data);
      setLastUpdate(new Date());

      if (selectedCoinId) {
        const found = data.find((c) => c.id === selectedCoinId);
        if (found) {
          setSelectedCoinName(found.name);
        } else if (data.length > 0) {
          setSelectedCoinId(data[0].id);
          setSelectedCoinName(data[0].name);
        }
      }
    } catch (err) {
      console.error(err);
      setCoinsError(
        err?.message || 'Не вдалося оновити дані з CoinGecko.'
      );
    } finally {
      setLoadingCoins(false);
    }
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

  const selectedCoin = coins.find((c) => c.id === selectedCoinId) || null;

  return (
    <div className="app">
      <Header />

      <main className="app-main app-layout">
        {/* Ліва картка — опис екрану */}
        <section className="card intro-card">
          <h2 className="card-title">Головний екран</h2>
          <p className="card-text">
            На цій сторінці відображається перелік основних криптовалют та їхні
            базові ринкові показники. Дані отримуються з відкритого CoinGecko
            API.
          </p>
          <p className="card-text">
            Користувач може змінювати базову валюту відображення (USD / UAH),
            обирати монету в таблиці, додавати її до обраних та аналізувати
            динаміку ціни на графіку за різні періоди (7 / 30 / 90 днів).
          </p>
          <p className="card-text">
            Налаштування (валюта, вибрана монета, період графіка, список
            обраних) зберігаються у локальному сховищі браузера, що підвищує
            зручність роботи на різних пристроях і підкреслює
            кросплатформенність рішення.
          </p>
        </section>

        {/* Центральна картка — таблиця монет */}
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
            onRefresh={refreshCoins}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </section>

        {/* Права картка — графік та деталі по монеті */}
        <section className="card crypto-chart-card">
          <CryptoChart
            coinId={selectedCoinId}
            coinName={selectedCoinName}
            currency={currency}
            coin={selectedCoin}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
