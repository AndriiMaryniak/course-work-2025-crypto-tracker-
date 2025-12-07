import React, { useState } from 'react';

function CryptoList({
  coins,
  currency,
  setCurrency,
  selectedCoinId,
  onSelectCoin,
  loading,
  error,
  lastUpdateText,
  onRefresh,
  favorites,
  onToggleFavorite,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const isUSD = currency === 'usd' || currency === 'USD';
  const symbol = isUSD ? '$' : '₴';

  // Фільтрація за пошуком
  const filteredCoins = coins.filter((coin) => {
    const term = searchTerm.toLowerCase();
    const nameMatches = coin.name.toLowerCase().includes(term);
    const symbolMatches = coin.symbol.toLowerCase().includes(term);
    return nameMatches || symbolMatches;
  });

  // Якщо увімкнено «лише обрані» – додаткова фільтрація
  const finalCoins = showOnlyFavorites
    ? filteredCoins.filter((coin) => favorites.includes(coin.id))
    : filteredCoins;

  const noData = !loading && !error && finalCoins.length === 0;

  let noDataText = 'Дані відсутні.';
  if (searchTerm) {
    noDataText = 'Монету не знайдено.';
  } else if (showOnlyFavorites) {
    noDataText = 'У списку обраних поки немає монет.';
  }

  return (
    <div className="crypto-list">
      <div className="coins-header">
        <div>
          <h2 className="card-title">Список криптовалют (дані з CoinGecko)</h2>
          <p className="card-subtitle">
            Виберіть монету для побудови графіка. Можна змінювати валюту,
            здійснювати пошук та формувати власний список обраних монет.
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

      {/* Пошук */}
      <input
        type="text"
        className="search-input"
        placeholder="Пошук монети (BTC, ETH, Bitcoin, ...)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Перемикач "лише обрані" */}
      <div className="favorites-toggle">
        <label>
          <input
            type="checkbox"
            checked={showOnlyFavorites}
            onChange={(e) => setShowOnlyFavorites(e.target.checked)}
          />
          Показувати лише обрані
        </label>
      </div>

      <div className="crypto-table-wrapper">
        <table className="crypto-table">
          <thead>
            <tr>
              <th>★</th>
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
                <td colSpan={6} className="crypto-status crypto-status-loading">
                  Завантаження даних з CoinGecko…
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={6} className="crypto-status crypto-status-error">
                  {error}
                </td>
              </tr>
            )}

            {noData && (
              <tr>
                <td colSpan={6} className="crypto-status">
                  {noDataText}
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              finalCoins.map((coin, index) => {
                const isActive = coin.id === selectedCoinId;
                const change = coin.price_change_percentage_24h ?? 0;
                const isPositive = change >= 0;
                const isFavorite = favorites.includes(coin.id);

                return (
                  <tr
                    key={coin.id}
                    className={
                      'crypto-row' + (isActive ? ' crypto-row--active' : '')
                    }
                    onClick={() => onSelectCoin(coin)}
                  >
                    {/* Зірочка "обране" */}
                    <td className="star-cell">
                      <button
                        type="button"
                        className={
                          'star-button' +
                          (isFavorite ? ' star-button--active' : '')
                        }
                        onClick={(e) => {
                          e.stopPropagation(); // щоб не змінювати вибрану монету при кліку на зірку
                          onToggleFavorite(coin.id);
                        }}
                        aria-label={
                          isFavorite
                            ? 'Видалити з обраних'
                            : 'Додати до обраних'
                        }
                      >
                        {isFavorite ? '★' : '☆'}
                      </button>
                    </td>

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

      {/* Час останнього оновлення + кнопка Оновити */}
      {!loading && lastUpdateText && (
        <div className="last-update">
          Дані оновлено: <span>{lastUpdateText}</span>
          <button className="refresh-button" onClick={onRefresh}>
            Оновити
          </button>
        </div>
      )}
    </div>
  );
}

export default CryptoList;
