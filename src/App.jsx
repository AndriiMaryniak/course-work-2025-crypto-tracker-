import { useEffect, useState } from 'react';
import './App.css';
import CryptoList from './components/CryptoList';
import CryptoChart from './components/CryptoChart';
import Header from './components/Header';
import Footer from './components/Footer';
import { fetchMarketCoins } from './services/coinGeckoApi';

function App() {
  // Валюта – читаємо з localStorage або беремо 'uah'
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('ct_currency');
    return saved || 'uah';
  });

  const [coins, setCoins] = useState([]);
  const [loadingCoins, setLoadingCoins] = useState(false);
  const [coinsError, setCoinsError] = useState(null);

  // Вибрана монета – теж відновлюємо з localStorage
  const [selectedCoinId, setSelectedCoinId] = useState(() => {
    return localStorage.getItem('ct_coinId') || null;
  });
  const [selectedCoinName, setSelectedCoinName] = useState(() => {
    return localStorage.getItem('ct_coinName') || '';
  });

  const [lastUpdate, setLastUpdate] = useState(null);

  // Завантаження списку монет при зміні валюти
  useEffect(() => {
    let cancelled = false;

    async function loadCoins() {
      setLoadingCoins(true);
      setCoinsError(null);

      try {
        // Тепер завантажуємо топ-50 монет
        const data = await fetchMarketCoins(currency, 50);

        if (cancelled) return;

        setCoins(data);
        setLastUpdate(new Date());

        if (!selectedCoinId && data.length > 0) {
          // Якщо монета ще не вибрана – беремо першу
          setSelectedCoinId(data[0].id);
          setSelectedCoinName(data[0].name);
        } else if (selectedCoinId) {
          // Якщо монета вже була вибрана – шукаємо її в новому списку
          const found = data.find((c) => c.id === selectedCoinId);
          if (found) {
            setSelectedCoinName(found.name);
          } else if (data.length > 0) {
            // Якщо старої монети немає – беремо першу
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

  // Зберігаємо валюту в localStorage
  useEffect(() => {
    localStorage.setItem('ct_currency', currency);
  }, [currency]);

  // Зберігаємо вибрану монету в localStorage
  useEffect(() => {
    if (selectedCoinId) {
      localStorage.setItem('ct_coinId', selectedCoinId);
      localStorage.setItem('ct_coinName', selectedCoinName || '');
    }
  }, [selectedCoinId, selectedCoinName]);

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

  // Функція ручного оновлення списку монет
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

  return (
    <div className="app">
      <Header />

      <main className="app-main app-layout">
        {/* Лівий блок — опис головного екрану */}
        <section className="card intro-card">
          <h2 className="card-title">Головний екран</h2>
          <p className="card-text">
            На цій сторінці відображається перелік основних криптовалют та їхні
            базові ринкові показники. Дані отримуються з відкритого CoinGecko
            API з використанням demo-ключа.
          </p>
          <p className="card-text">
            Користувач може змінювати базову валюту відображення (USD / UAH),
            обирати монету в таблиці та аналізувати динаміку її ціни на графіку
            за різні періоди (7 / 30 / 90 днів).
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
            onRefresh={refreshCoins}
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

      <Footer />
    </div>
  );
}

export default App;
