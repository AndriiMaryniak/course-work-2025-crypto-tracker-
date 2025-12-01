import { useEffect, useState } from 'react';
import { fetchMarketCoins } from '../services/coinGeckoApi';

// Резервні (демонстраційні) дані на випадок, якщо API недоступне
const FALLBACK_COINS = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    priceUsd: 96452.12,
    change24h: 1.84,
    marketCapUsd: 1200340000000,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    priceUsd: 3589.45,
    change24h: -0.72,
    marketCapUsd: 431120000000,
  },
  {
    id: 'tether',
    name: 'Tether',
    symbol: 'USDT',
    priceUsd: 1.0,
    change24h: 0.01,
    marketCapUsd: 112450000000,
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    priceUsd: 176.32,
    change24h: 3.27,
    marketCapUsd: 82560000000,
  },
  {
    id: 'ripple',
    name: 'XRP',
    symbol: 'XRP',
    priceUsd: 1.23,
    change24h: -2.15,
    marketCapUsd: 67500000000,
  },
];

function formatCurrency(value, vsCurrency) {
  if (value == null || isNaN(value)) {
    return '-';
  }

  if (vsCurrency === 'uah') {
    return value.toLocaleString('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      maximumFractionDigits: 0,
    });
  }

  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
}

function formatPercent(value) {
  if (value == null || isNaN(value)) {
    return '-';
  }

  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function CryptoList({ onCoinSelect, selectedCoinId }) {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [vsCurrency, setVsCurrency] = useState('usd'); // 'usd' або 'uah'

  useEffect(() => {
    async function loadCoins() {
      try {
        setLoading(true);
        setError(null);
        setUsingFallback(false);

        const data = await fetchMarketCoins(vsCurrency, 10);
        setCoins(data);

        // Якщо монета ще не обрана — автоматично обираємо першу
        if (data.length > 0 && !selectedCoinId && onCoinSelect) {
          const first = data[0];
          onCoinSelect({
            id: first.id,
            name: first.name,
            symbol: first.symbol,
          });
        }
      } catch (err) {
        console.error(err);

        setError(
          'Не вдалося завантажити дані з CoinGecko для вибраної валюти. Показано демонстраційні дані в USD.'
        );
        setCoins(FALLBACK_COINS);
        setUsingFallback(true);

        if (!selectedCoinId && onCoinSelect && FALLBACK_COINS.length > 0) {
          const first = FALLBACK_COINS[0];
          onCoinSelect({
            id: first.id,
            name: first.name,
            symbol: first.symbol,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    loadCoins();
  }, [vsCurrency, onCoinSelect, selectedCoinId]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCoins = coins.filter((coin) => {
    if (!normalizedQuery) return true;

    const name = coin.name.toLowerCase();
    const symbol = coin.symbol.toLowerCase();

    return name.includes(normalizedQuery) || symbol.includes(normalizedQuery);
  });

  const currencyLabel = vsCurrency.toUpperCase();

  return (
    <div className="crypto-list">
      <div className="crypto-list-header">
        <h3>Список криптовалют</h3>
        <p>
          На цьому екрані відображається перелік основних криптовалют. Користувач може
          обрати базову валюту відображення (USD або UAH), а також виконати пошук за
          назвою чи тикером. Клік по рядку таблиці дозволяє вибрати монету для
          детального аналізу на графіку.
        </p>
      </div>

      {/* Панель керування: пошук + вибір валюти */}
      <div className="crypto-controls">
        <div className="crypto-search">
          <label htmlFor="crypto-search-input">Пошук:</label>
          <input
            id="crypto-search-input"
            type="text"
            placeholder="Введіть назву або тикер (наприклад, BTC, Bitcoin)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="crypto-currency-select">
          <label htmlFor="crypto-currency-select">Валюта:</label>
          <select
            id="crypto-currency-select"
            value={vsCurrency}
            onChange={(e) => setVsCurrency(e.target.value)}
          >
            <option value="usd">USD (долар США)</option>
            <option value="uah">UAH (гривня)</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="crypto-status crypto-status-loading">
          Завантаження даних про криптовалюти…
        </div>
      )}

      {error && !loading && (
        <div className="crypto-status crypto-status-error">
          {error}
        </div>
      )}

      {!loading && !error && coins.length === 0 && (
        <div className="crypto-status">Дані відсутні.</div>
      )}

      {!loading && coins.length > 0 && filteredCoins.length === 0 && (
        <div className="crypto-status">За вашим запитом нічого не знайдено.</div>
      )}

      {!loading && filteredCoins.length > 0 && (
        <>
          {usingFallback && (
            <div className="crypto-status">
              Зараз відображаються статичні демо-дані в доларах США (USD).
            </div>
          )}

          <div className="crypto-table-wrapper">
            <table className="crypto-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Назва</th>
                  <th>Курс ({currencyLabel})</th>
                  <th>Зміна за 24 год</th>
                  <th>Ринкова капіталізація</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoins.map((coin, index) => (
                  <tr
                    key={coin.id}
                    className={
                      'crypto-row' + (coin.id === selectedCoinId ? ' crypto-row-selected' : '')
                    }
                    onClick={() =>
                      onCoinSelect &&
                      onCoinSelect({
                        id: coin.id,
                        name: coin.name,
                        symbol: coin.symbol,
                      })
                    }
                  >
                    <td>{index + 1}</td>
                    <td>
                      <div className="crypto-name">
                        <span className="crypto-name-main">{coin.name}</span>
                        <span className="crypto-symbol">{coin.symbol}</span>
                      </div>
                    </td>
                    <td>{formatCurrency(coin.priceUsd, vsCurrency)}</td>
                    <td>
                      <span
                        className={
                          'crypto-change ' +
                          (coin.change24h >= 0 ? 'crypto-change-positive' : 'crypto-change-negative')
                        }
                      >
                        {formatPercent(coin.change24h)}
                      </span>
                    </td>
                    <td>{formatCurrency(coin.marketCapUsd, vsCurrency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default CryptoList;
