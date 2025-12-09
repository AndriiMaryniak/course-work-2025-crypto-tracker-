import { useEffect, useState } from 'react';
import './App.css';
import CryptoList from './components/CryptoList';
import CryptoChart from './components/CryptoChart';
import Header from './components/Header';
import Footer from './components/Footer';
import { fetchMarketCoins } from './services/coinGeckoApi';

// початкові значення з localStorage / системи
function getInitialCurrency() {
  if (typeof window === 'undefined') return 'uah';
  const saved = window.localStorage.getItem('ct_currency');
  return saved === 'usd' || saved === 'uah' ? saved : 'uah';
}

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'ua';
  const saved = window.localStorage.getItem('ct_language');
  return saved === 'en' ? 'en' : 'ua';
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem('ct_theme');
  if (saved === 'light' || saved === 'dark') return saved;

  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: light)').matches
  ) {
    return 'light';
  }
  return 'dark';
}

function getInitialFavorites() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem('ct_favorites');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function App() {
  const [currency, setCurrency] = useState(getInitialCurrency);
  const [language, setLanguage] = useState(getInitialLanguage);
  const [theme, setTheme] = useState(getInitialTheme);

  const [coins, setCoins] = useState([]);
  const [loadingCoins, setLoadingCoins] = useState(false);
  const [coinsError, setCoinsError] = useState(null);

  const [selectedCoinId, setSelectedCoinId] = useState(null);
  const [selectedCoinName, setSelectedCoinName] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const [favorites, setFavorites] = useState(getInitialFavorites);

  // sync currency/lang/theme/favorites з localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('ct_currency', currency);
  }, [currency]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('ct_language', language);
  }, [language]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.body.classList.toggle('light-theme', theme === 'light');
    window.localStorage.setItem('ct_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('ct_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // завантаження списку монет
  useEffect(() => {
    let cancelled = false;

    async function loadCoins() {
      setLoadingCoins(true);
      setCoinsError(null);

      try {
        const data = await fetchMarketCoins(currency);

        if (cancelled) return;

        setCoins(data);
        setLastUpdate(new Date());

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
  }, [currency, selectedCoinId]);

  const refreshCoins = async () => {
    setLoadingCoins(true);
    setCoinsError(null);

    try {
      const data = await fetchMarketCoins(currency);
      setCoins(data);
      setLastUpdate(new Date());

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
      console.error(err);
      setCoinsError(
        err?.message ||
          'Сталася помилка під час завантаження даних з CoinGecko.'
      );
    } finally {
      setLoadingCoins(false);
    }
  };

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

  const formatLastUpdate = (dt) => {
    if (!dt) return null;
    const locale = language === 'en' ? 'en-GB' : 'uk-UA';
    return dt.toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const introTexts = {
    ua: {
      title: 'Головний екран',
      p1: 'На цій сторінці відображається перелік основних криптовалют та їхні базові ринкові показники. Дані отримуються з відкритого CoinGecko API з використанням demo-ключа.',
      p2: 'Користувач може змінювати базову валюту відображення (USD / UAH), обирати монету в таблиці та аналізувати динаміку її ціни на графіку.',
      p3: 'Інтерфейс реалізовано як адаптивний веб-додаток, який коректно відображається на ПК, ноутбуках та смартфонах, що підкреслює кросплатформенність рішення.',
    },
    en: {
      title: 'Main screen',
      p1: 'This screen displays a list of major cryptocurrencies and their key market indicators. Data is loaded from the public CoinGecko API using a demo key.',
      p2: 'The user can switch the base currency (USD / UAH), select a coin in the table and analyse its price dynamics on the chart.',
      p3: 'The UI is implemented as a responsive web application that works correctly on desktops, laptops and smartphones, which demonstrates the cross-platform nature of the solution.',
    },
  };

  const intro = introTexts[language] || introTexts.ua;

  return (
    <div className="app">
      <Header
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="app-main app-layout">
        <section className="card intro-card">
          <h2 className="card-title">{intro.title}</h2>
          <p className="card-text">{intro.p1}</p>
          <p className="card-text">{intro.p2}</p>
          <p className="card-text">{intro.p3}</p>
        </section>

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
            language={language}
          />
        </section>

        <section className="card crypto-chart-card">
          <CryptoChart
            coinId={selectedCoinId}
            coinName={selectedCoinName}
            currency={currency}
            language={language}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
