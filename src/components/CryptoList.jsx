import React from 'react';

function CryptoList({
  coins,
  currency,
  setCurrency,
  selectedCoinId,
  onSelectCoin,
  loading,
  error,
  lastUpdateText,
}) {
  const isUSD = currency === 'usd' || currency === 'USD';
  const symbol = isUSD ? '$' : '₴';
  const currencyLabel = isUSD ? 'USD (долар США)' : 'UAH (гривня)';

  return (
    <div className="crypto-list">
      <div className="coins-header">
        <div>
          <h2 className="card-title">Список криптовалют (дані з CoinGecko)</h2>
          <p className="card-subtitle">
            Виберіть монету для побудови графіка. Можна змінювати базову валюту
            відображення (USD / UAH).
          </p>
        </div>

        <div className="currency-select-wrapper">
          <span className="currency-label">Валюта:</span>
          <select
            className="currency-select"
            value={currency.toLowerCase()}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="usd">USD (долар США)</option>
            <option value="uah">UAH (гривня)</option>
          </select>
        </div>
      </div>

      <div className="crypto-table-wrapper">
        <table className="crypto-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Назва</th>
              <th>Курс ({isUSD ? 'USD' : 'UAH'})</th>
              <th>Зміна за 24 год</th>
              <th>Ринкова капіталізація</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="crypto-status crypto-status-loading">
                  Завантаження даних з CoinGecko…
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan="5" className="crypto-status crypto-status-error">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && coins.length === 0 && (
              <tr>
                <td colSpan="5" className="crypto-status">
                  Дані відсутні.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              coins.map((coin, index) => {
                const isActive = coin.id === selectedCoinId;
                const change = coin.price_change_percentage_24h ?? 0;
                const isPositive = change >= 0;

                return (
                  <tr
                    key={coin.id}
                    className={
                      'crypto-row' + (isActive ? ' crypto-row--active' : '')
                    }
                    onClick={() => onSelectCoin(coin)}
                  >
                    <td>{index + 1}</td>
                    <td className="coin-name-cell">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="coin-logo"
                      />
                      <div className="coin-name-block">
                        <span className="coin-name">{coin.name}</span>
                        <span className="coin-symbol">
                          {coin.symbol.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      {symbol}
                      {coin.current_price?.toLocaleString('uk-UA', {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-right">
                      <span
                        className={
                          'change-badge ' +
                          (isPositive ? 'change-badge--up' : 'change-badge--down')
                        }
                      >
                        {isPositive ? '+' : ''}
                        {change.toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-right">
                      {symbol}
                      {coin.market_cap?.toLocaleString('uk-UA')}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Час останнього оновлення */}
      {!loading && lastUpdateText && (
        <div className="last-update">
          Дані оновлено: <span>{lastUpdateText}</span>
        </div>
      )}
    </div>
  );
}

export default CryptoList;
