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

function CryptoChart({ coinId, coinName, currency, language }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [days, setDays] = useState('30');

  const texts = {
    ua: {
      titlePrefix: 'Графік зміни ціни',
      noCoinTitle: 'Графік зміни ціни',
      noCoinText:
        'Оберіть монету в таблиці, щоб побачити графік її зміни ціни.',
      loading: 'Завантаження графіка…',
      error:
        'Сталася помилка під час завантаження графіка з CoinGecko.',
      periodLabel: 'Період:',
      days: {
        '1': '1 день',
        '7': '7 днів',
        '30': '30 днів',
        '90': '90 днів',
      },
    },
    en: {
      titlePrefix: 'Price change chart',
      noCoinTitle: 'Price change chart',
      noCoinText:
        'Select a coin in the table to see its price change chart.',
      loading: 'Loading chart…',
      error:
        'An error occurred while loading chart data from CoinGecko.',
      periodLabel: 'Period:',
      days: {
        '1': '1 day',
        '7': '7 days',
        '30': '30 days',
        '90': '90 days',
      },
    },
  };

  const t = texts[language] || texts.ua;

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
        const data = await fetchCoinMarketChart(
          coinId,
          currency,
          parseInt(days, 10)
        );

        if (cancelled) return;

        const prices = data?.prices || [];

        const labels = prices.map((item) => {
          const dt = new Date(item[0]);
          // формат під мову
          const locale = language === 'en' ? 'en-GB' : 'uk-UA';
          return dt.toLocaleDateString(locale, {
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
            err?.message || t.error
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
  }, [coinId, coinName, currency, days, language]);

  // коли монета не вибрана
  if (!coinId) {
    return (
      <div className="crypto-chart-inner">
        <h3 className="card-title">{t.noCoinTitle}</h3>
        <p className="crypto-status">{t.noCoinText}</p>
      </div>
    );
  }

  return (
    <div className="crypto-chart-inner">
      <h3 className="card-title">
        {t.titlePrefix} {coinName}{' '}
        <span className="chart-currency">({currency.toUpperCase()})</span>
      </h3>

      <div className="chart-toolbar">
        <span className="period-label">{t.periodLabel}</span>
        <select
          className="days-select"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        >
          <option value="1">{t.days['1']}</option>
          <option value="7">{t.days['7']}</option>
          <option value="30">{t.days['30']}</option>
          <option value="90">{t.days['90']}</option>
        </select>
      </div>

      {loading && (
        <div className="crypto-status crypto-status-loading">
          {t.loading}
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
