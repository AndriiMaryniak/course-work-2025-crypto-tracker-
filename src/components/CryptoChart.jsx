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

// Реєструємо необхідні модулі Chart.js один раз
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

function CryptoChart({ coinId, coinName }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ми будуємо графік у базовій валюті USD (для простоти)
  const vsCurrency = 'usd';

  useEffect(() => {
    if (!coinId) {
      setChartData(null);
      setError(null);
      setLoading(false);
      return;
    }

    async function loadChart() {
      try {
        setLoading(true);
        setError(null);

        const points = await fetchCoinMarketChart(coinId, vsCurrency, 7);

        const labels = points.map((p) => p.label);
        const data = points.map((p) => p.price);

        setChartData({
          labels,
          datasets: [
            {
              label: `Ціна ${coinName} (USD, останні 7 днів)`,
              data,
              borderWidth: 2,
              tension: 0.25,
              borderColor: 'rgba(59, 130, 246, 1)',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              pointRadius: 0,
              fill: true,
            },
          ],
        });
      } catch (err) {
        console.error(err);

        const msg = String(err.message || '');
        if (msg.includes('429')) {
          setError(
            'CoinGecko тимчасово обмежив частоту запитів (429 Too Many Requests). Спробуйте ще раз через кілька секунд.'
          );
        } else {
          setError('Не вдалося завантажити історичні дані для графіка.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadChart();
  }, [coinId]); // оновлюємо графік тільки при зміні вибраної монети

  if (!coinId) {
    return null;
  }

  return (
    <div className="crypto-chart">
      <h4>Графік зміни ціни {coinName} (USD, останні 7 днів)</h4>

      {loading && (
        <div className="crypto-status crypto-status-loading">
          Завантаження графіка…
        </div>
      )}

      {error && !loading && (
        <div className="crypto-status crypto-status-error">
          {error}
        </div>
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
                  ticks: {
                    maxTicksLimit: 7,
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
