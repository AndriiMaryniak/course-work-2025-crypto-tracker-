import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { fetchCoinMarketChart } from '../services/coinGeckoApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      intersect: false,
      mode: 'index',
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#9ca3af',
      },
    },
    y: {
      grid: {
        color: 'rgba(75, 85, 99, 0.6)',
      },
      ticks: {
        color: '#9ca3af',
      },
    },
  },
};

function CryptoChart({ coinId, coinName, currency, coin }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Період у днях – з localStorage або 7
  const [days, setDays] = useState(() => {
    const saved = localStorage.getItem('ct_days');
    const num = saved ? Number(saved) : 7;
    return [7, 30, 90].includes(num) ? num : 7;
  });

  // Зберігаємо вибраний період
  useEffect(() => {
    localStorage.setItem('ct_days', String(days));
  }, [days]);

  useEffect(() => {
    let cancelled = false;

    if (!coinId) {
      setChartData(null);
      setError(null);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    async function loadChart() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchCoinMarketChart(coinId, currency, days);

        if (cancelled) return;

        const prices = data?.prices || [];

        const labels = prices.map((item) => {
          const dt = new Date(item[0]);
          return dt.toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
          });
        });

        const values = prices.map((item) => item[1]);

        setChartData({
          labels,
          datasets: [
            {
              label: `${coinName} (${currency.toUpperCase()})`,
              data: values,
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.20)',
              fill: true,
              tension: 0.3,
              pointRadius: 0,
            },
          ],
        });
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(
            err?.message ||
              'Сталася помилка під час завантаження графіка з CoinGecko.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadChart();

    return () => {
      cancelled = true;
    };
  }, [coinId, coinName, currency, days]);

  if (!coinId) {
    return (
      <div className="crypto-chart-inner">
        <h3 className="card-title">Графік зміни ціни</h3>
        <p className="crypto-status">
          Оберіть монету в таблиці, щоб побачити графік її зміни ціни.
        </p>
      </div>
    );
  }

  const isUSD = currency === 'usd' || currency === 'USD';
  const symbol = isUSD ? '$' : '₴';
  const change24h = coin?.price_change_percentage_24h ?? null;
  const isChangePositive = change24h != null ? change24h >= 0 : null;

  return (
    <div className="crypto-chart-inner">
      <h3 className="card-title">
        Графік зміни ціни {coinName}{' '}
        <span className="chart-currency">({currency.toUpperCase()})</span>
      </h3>

      {/* Панель короткої інформації про монету */}
      {coin && (
        <div className="coin-info-panel">
          <div className="coin-info-row">
            <span className="coin-info-label">Поточна ціна</span>
            <span className="coin-info-value">
              {symbol}
              {coin.current_price?.toLocaleString('uk-UA', {
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="coin-info-row">
            <span className="coin-info-label">Мін / Макс за 24 год</span>
            <span className="coin-info-value">
              {symbol}
              {coin.low_24h?.toLocaleString('uk-UA', {
                maximumFractionDigits: 2,
              })}{' '}
              /{' '}
              {symbol}
              {coin.high_24h?.toLocaleString('uk-UA', {
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="coin-info-row">
            <span className="coin-info-label">Зміна за 24 год</span>
            <span
              className={
                'coin-info-change ' +
                (isChangePositive == null
                  ? ''
                  : isChangePositive
                  ? 'coin-info-change--up'
                  : 'coin-info-change--down')
              }
            >
              {change24h != null ? `${change24h.toFixed(2)}%` : '—'}
            </span>
          </div>
          {coin.market_cap_rank != null && (
            <div className="coin-info-row">
              <span className="coin-info-label">Ранг за капіталізацією</span>
              <span className="coin-info-value">
                #{coin.market_cap_rank}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Вибір періоду графіка */}
      <div className="days-select-wrapper">
        <span className="days-label">Період:</span>
        <select
          className="days-select"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>7 днів</option>
          <option value={30}>30 днів</option>
          <option value={90}>90 днів</option>
        </select>
      </div>

      {loading && (
        <div className="crypto-status crypto-status-loading">
          Завантаження графіка…
        </div>
      )}

      {error && !loading && (
        <div className="crypto-status crypto-status-error">{error}</div>
      )}

      {!loading && !error && chartData && (
        <div
          className="chart-wrapper chart-fade-in"
          key={`${coinId}-${days}-${currency}`}
        >
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}

export default CryptoChart;
