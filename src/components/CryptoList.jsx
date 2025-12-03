// src/components/CryptoList.jsx
import { useEffect, useState } from 'react';
import { fetchMarketCoins } from '../services/coinGeckoApi';

function CryptoList({ currency, onCurrencyChange, selectedCoinId, onSelectCoin }) {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Завантаження списку монет при зміні валюти
  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchMarketCoins(currency, 10);
        if (ignore) return;

        setCoins(data);

        // Якщо монета ще не вибрана — автоматично обираємо першу
        if (!selectedCoinId && data.length > 0) {
          onSelectCoin({
            id: data[0].id,
            name: data[0].name,
          });
        }
      } catch (err) {
        if (ignore) return;
        console.error('Помилка завантаження монет:', err);

        if (String(err.message).startsWith('429')) {
          setError(
            'Ліміт запитів CoinGecko перевищено (429 Too Many Requests). Спробуйте через кілька секунд.'
          );
        } else {
          setError(
            'Не вдалося завантажити дані з CoinGecko. Перевірте інтернет або спробуйте пізніше.'
          );
        }

        // Якщо потрібно, тут можна підставити статичні демонстраційні дані
        setCoins([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [currency, selectedCoinId, onSelectCoin]);

  return (
    <div className="crypto-list-block">
      <div className="crypto-list-header">
        <div>
          <h3>Список криптовалют (дані з CoinGecko)</h3>
          <p className="crypto-list-subtitle">
            Виберіть монету для побудови графіка. Можна змінювати базову валюту
            відображення (USD / UAH).
          </p>
        </div>

        <div className="currency-select">
          <label htmlFor="currency-select">Валюта:&nbsp;</label>
          <select
            id="currency-select"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
          >
            <option value="usd">USD (долар США)</option>
            <option value="uah">UAH (гривня)</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="crypto-status crypto-status-loading">
          Завантаження даних з CoinGecko…
        </div>
      )}

      {error && !loading && (
        <div className="crypto-status crypto-status-error">
          {error}
        </div>
      )}

      {!loading && !error && coins.length === 0 && (
        <div className="crypto-status">
          Дані відсутні. Спробуйте оновити сторінку або змінити валюту.
        </div>
      )}

      {coins.length > 0 && (
        <div className="crypto-table-wrapper">
          <table className="crypto-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Назва</th>
                <th>Курс ({currency.toUpperCase()})</th>
                <th>Зміна за 24 год</th>
                <th>Ринкова капіталізація</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin, idx) => {
                const isSelected = coin.id === selectedCoinId;
                const change = coin.price_change_percentage_24h;

                return (
                  <tr
                    key={coin.id}
                    className={isSelected ? 'row-selected' : ''}
                    onClick={() =>
                      onSelectCoin({ id: coin.id, name: coin.name })
                    }
                  >
                    <td>{idx + 1}</td>
                    <td className="coin-name-cell">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="coin-icon"
                      />
                      <div>
                        <div>{coin.name}</div>
                        <div className="coin-symbol">
                          {coin.symbol.toUpperCase()}
                        </div>
                      </div>
                    </td>
                    <td>{coin.current_price?.toLocaleString('uk-UA')}</td>
                    <td className={change >= 0 ? 'change-positive' : 'change-negative'}>
                      {change?.toFixed(2)}%
                    </td>
                    <td>{coin.market_cap?.toLocaleString('uk-UA')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CryptoList;
