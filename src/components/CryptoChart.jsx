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

function CryptoChart({ coinId, coinName, currency }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ❗ Хук завжди викликається, навіть коли coinId немає
  useEffect(() => {
    let cancelled = false;

    // Якщо монета не вибрана – очищаємо стан і нічого не завантажуємо
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
        const data = await fetchCoinMarketChart(coinId, currency);

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
  }, [coinId, coinName, currency]);

  // ⬇️ Після всіх хуків ми вже можемо умовно рендерити різний JSX

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

  return (
    <div className="crypto-chart-inner">
      <h3 className="card-title">
        Графік зміни ціни {coinName}{' '}
        <span className="chart-currency">({currency.toUpperCase()})</span>
      </h3>

      {loading && (
        <div className="crypto-status crypto-status-loading">
          Завантаження графіка…
        </div>
      )}

      {error && !loading && (
        <div className="crypto-status crypto-status-error">{error}</div>
      )}

      {!loading && !error && chartData && (
        <div className="chart-wrapper">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}

export default CryptoChart;
