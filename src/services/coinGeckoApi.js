// Базовий шлях до API CoinGecko через проксі Vite
// (див. налаштування в vite.config.js)
const API_BASE_URL = '/cg-api';

// Простий кеш у пам’яті на 5 хвилин
const cache = new Map();

async function fetchJson(path) {
  const url = `${API_BASE_URL}${path}`;
  const cached = cache.get(url);

  if (cached && Date.now() - cached.time < 5 * 60 * 1000) {
    return cached.data;
  }

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 429) {
      // важливо: в тексті є "429", щоб можна було розпізнавати в CryptoChart
      throw new Error('429 Too Many Requests');
    }

    throw new Error(
      `Помилка запиту до CoinGecko: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  cache.set(url, { data, time: Date.now() });
  return data;
}

/**
 * Завантажує ринкові дані про криптовалюти (для таблиці).
 *
 * vsCurrency — в якій валюті показувати курс (наприклад, 'usd', 'uah').
 * perPage — скільки монет завантажувати за один раз.
 */
export async function fetchMarketCoins(vsCurrency = 'usd', perPage = 10) {
  const path =
    `/coins/markets` +
    `?vs_currency=${encodeURIComponent(vsCurrency)}` +
    `&order=market_cap_desc` +
    `&per_page=${encodeURIComponent(perPage)}` +
    `&page=1` +
    `&price_change_percentage=24h`;

  const data = await fetchJson(path);

  // Нормалізуємо дані під нашу таблицю
  return data.map((coin) => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    priceUsd: coin.current_price,                // поточна ціна
    change24h: coin.price_change_percentage_24h, // зміна в %
    marketCapUsd: coin.market_cap,               // ринкова капіталізація
  }));
}

/**
 * Завантажує історичні дані про ціну монети для побудови графіка.
 *
 * coinId     — ідентифікатор монети в CoinGecko (bitcoin, ethereum тощо)
 * vsCurrency — базова валюта (usd, uah)
 * days       — за скільки днів завантажувати (наприклад, 7, 30)
 */
export async function fetchCoinMarketChart(coinId, vsCurrency = 'usd', days = 7) {
  const path =
    `/coins/${encodeURIComponent(coinId)}/market_chart` +
    `?vs_currency=${encodeURIComponent(vsCurrency)}` +
    `&days=${encodeURIComponent(days)}` +
    `&interval=daily`;

  const data = await fetchJson(path);

  // data.prices — масив [timestamp, price]
  return data.prices.map(([timestamp, price]) => {
    const date = new Date(timestamp);
    const label = date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
    });

    return {
      time: date,
      label,
      price,
    };
  });
}
