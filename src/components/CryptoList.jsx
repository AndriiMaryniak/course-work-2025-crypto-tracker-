const MOCK_COINS = [
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

function formatCurrency(value) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
}

function formatPercent(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function CryptoList() {
  return (
    <div className="crypto-list">
      <div className="crypto-list-header">
        <h3>Список криптовалют (демо-дані)</h3>
        <p>
          Нижче наведено умовний список монет. На наступному етапі ці дані будуть
          завантажуватися з CoinGecko API в реальному часі.
        </p>
      </div>

      <div className="crypto-table-wrapper">
        <table className="crypto-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Назва</th>
              <th>Курс (USD)</th>
              <th>Зміна за 24 год</th>
              <th>Ринкова капіталізація</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_COINS.map((coin, index) => (
              <tr key={coin.id}>
                <td>{index + 1}</td>
                <td>
                  <div className="crypto-name">
                    <span className="crypto-name-main">{coin.name}</span>
                    <span className="crypto-symbol">{coin.symbol}</span>
                  </div>
                </td>
                <td>{formatCurrency(coin.priceUsd)}</td>
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
                <td>{formatCurrency(coin.marketCapUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CryptoList;
