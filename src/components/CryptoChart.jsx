// src/components/CryptoChart.jsx
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

// Реєструємо модулі Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

function CryptoChart({ coinId, coinName, currency }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Будуємо графік у тій же валюті, що й таблиця
  const vsCurrency = currency || 'usd';

  useEffect(() => {
    if (!coinId) {
      setChartData(null);
      setError(null);
      return;
    }

    let ignore = false;

    async function loadChart() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchCoinMarketChart(coinId, vsCurrency, 7);
        if (ignore) return;

        const labels = data.prices.map(([ts]) => {
          const d = new Date(ts);
          return d.toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
          });
        });

        const prices = data.prices.map(([, price]) => price);

        setChartData({
          labels,
          datasets: [
            {
              label: `Ціна ${coinName} (${vsCurrency.toUpperCase()}, останні 7 днів)`,
              data: prices,
              borderColor: 'rgba(59, 130, 246, 1)',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              fill: true,
              tension: 0.25,
              pointRadius: 2,
            },
          ],
        });
      } catch (err) {
        if (ignore) return;
        console.error('Помилка завантаження графіка:', err);

        if (String(err.message).startsWith('429')) {
          setError(
            'Ліміт запитів CoinGecko перевищено (429 Too Many Requests). Спробуйте через кілька секунд.'
          );
        } else {
          setError('Не вдалося завантажити дані для графіка.');
        }

        setChartData(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    // Невеликий debounce, щоб не робити запит при кожному дуже швидкому кліку
    const timerId = setTimeout(() => {
      loadChart();
    }, 500);

    return () => {
      ignore = true;
      clearTimeout(timerId);
    };
  }, [coinId, coinName, vsCurrency]);

  if (!coinId) {
    return (
      <div className="crypto-chart">
        <h4>Графік зміни ціни</h4>
        <p>Оберіть криптовалюту в таблиці, щоб побудувати графік.</p>
      </div>
    );
  }

  return (
    <div className="crypto-chart">
      <h4>Графік зміни ціни {coinName}</h4>

      {loading && (
        <div className="crypto-status crypto-status-loading">
          Завантаження графіка…
        </div>
      )}

      {error && !loading && (
        <div className="crypto-status crypto-status-error">{error}</div>
      )}

      {!loading && !error && chartData && (
        <div className="crypto-chart-inner">
          <Line
            data={chartData}
            options={{
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
                },
                y: {
                  grid: {
                    color: 'rgba(31, 41, 55, 1)',
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default CryptoChart;
