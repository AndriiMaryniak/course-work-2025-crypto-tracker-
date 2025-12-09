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
  language,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const isUSD = currency.toLowerCase() === 'usd';
  const symbol = isUSD ? '$' : '₴';

  const texts = {
    ua: {
      title: 'Список криптовалют (дані з CoinGecko)',
      subtitle:
        'Виберіть монету для побудови графіка. Можна змінювати валюту, здійснювати пошук та формувати власний список обраних монет.',
      currencyLabel: 'Валюта:',
      searchPlaceholder: 'Пошук монети (BTC, ETH, Solana, ...)',
      showOnlyFavorites: 'Показувати лише обрані',
      thStar: '★',
      thIndex: '#',
      thName: 'Назва',
      thPrice: 'Курс',
      thChange: 'Зміна за 24 год',
      thCap: 'Ринкова капіталізація',
      loading: 'Завантаження даних з CoinGecko…',
      noData: 'Дані відсутні.',
      noDataSearch: 'Монету не знайдено.',
      noFavorites: 'У списку обраних поки немає монет.',
      lastUpdatePrefix: 'Дані оновлено:',
    },
    en: {
      title: 'Cryptocurrencies list (data from CoinGecko)',
      subtitle:
        'Select a coin to build a chart. You can change the base currency, search and build your own list of favourite coins.',
      currencyLabel: 'Currency:',
      searchPlaceholder: 'Search coin (BTC, ETH, Solana, ...)',
      showOnlyFavorites: 'Show favourites only',
      thStar: '★',
      thIndex: '#',
      thName: 'Name',
      thPrice: 'Price',
      thChange: '24h change',
      thCap: 'Market cap',
      loading: 'Loading data from CoinGecko…',
      noData: 'No data.',
      noDataSearch: 'No coin found.',
      noFavorites: 'There are no favourite coins yet.',
      lastUpdatePrefix: 'Last update:',
    },
  };

  const t = texts[language] || texts.ua;

  // ---- Пошук з кількома словами ----
  const filteredCoins = coins.filter((coin) => {
    const raw = searchTerm.trim().toLowerCase();

    if (!raw) return true;

    const tokens = raw.split(/[\s,]+/).filter(Boolean);
    if (tokens.length === 0) return true;

    const name = coin.name.toLowerCase();
    const sym = coin.symbol.toLowerCase();

    return tokens.some(
      (token) => name.includes(token) || sym.includes(token)
    );
  });

  // Якщо увімкнено «лише обрані» – додаткова фільтрація
  const finalCoins = showOnlyFavorites
    ? filteredCoins.filter((coin) => (favorites || []).includes(coin.id))
    : filteredCoins;

  const noData = !loading && !error && finalCoins.length === 0;

  let noDataText = t.noData;
  if (searchTerm.trim()) {
    noDataText = t.noDataSearch;
  } else if (showOnlyFavorites) {
    noDataText = t.noFavorites;
  }

  return (
    <div className="crypto-list">
      <div className="coins-header">
        <div>
          <h2 className="card-title">{t.title}</h2>
          <p className="card-subtitle">{t.subtitle}</p>
        </div>

        <div className="coins-header-right">
          <div className="currency-select-wrapper">
            <span className="currency-label">{t.currencyLabel}</span>
            <select
              className="currency-select"
              value={currency.toLowerCase()}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="usd">USD (долар США)</option>
              <option value="uah">UAH (гривня)</option>
            </select>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={onRefresh}
          >
            {language === 'en' ? 'Refresh' : 'Оновити'}
          </button>
        </div>
      </div>

      {/* Пошук */}
      <input
        type="text"
        className="search-input"
        placeholder={t.searchPlaceholder}
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
          {t.showOnlyFavorites}
        </label>
      </div>

      <div className="crypto-table-wrapper">
        <table className="crypto-table">
          <thead>
            <tr>
              <th>{t.thStar}</th>
              <th>{t.thIndex}</th>
              <th>{t.thName}</th>
              <th>
                {t.thPrice} ({isUSD ? 'USD' : 'UAH'})
              </th>
              <th>{t.thChange}</th>
              <th>{t.thCap}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="crypto-status crypto-status-loading">
                  {t.loading}
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
                const isFavorite = (favorites || []).includes(coin.id);

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
                          e.stopPropagation();
                          if (onToggleFavorite) {
                            onToggleFavorite(coin.id);
                          }
                        }}
                        aria-label={
                          isFavorite
                            ? language === 'en'
                              ? 'Remove from favourites'
                              : 'Видалити з обраних'
                            : language === 'en'
                            ? 'Add to favourites'
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

      {/* Час останнього оновлення */}
      {!loading && lastUpdateText && (
        <div className="last-update">
          {t.lastUpdatePrefix} <span>{lastUpdateText}</span>
        </div>
      )}
    </div>
  );
}

export default CryptoList;
