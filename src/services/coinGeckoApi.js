const API_KEY = 'CG-K6yKBVyzrGiUF5D433b89jq9';

const API_BASE = 'https://api.coingecko.com/api/v3';

/**
 * Базовий запит до CoinGecko.
 * Додає API-ключ як параметр &x_cg_demo_api_key=...
 */
async function fetchJson(path) {
  // Невелика затримка, щоб не «спамити» API при дуже швидких кліках
  await new Promise((res) => setTimeout(res, 400));

  let url = `${API_BASE}${path}`;

  if (API_KEY && API_KEY.trim() !== '') {
    const sep = url.includes('?') ? '&' : '?';
    url += `${sep}x_cg_demo_api_key=${encodeURIComponent(API_KEY)}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    // Наприклад "429 Too Many Requests"
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Список монет для таблиці (топ-10 за капіталізацією)
 */
export async function fetchMarketCoins(vsCurrency = 'usd', perPage = 10) {
  const path =
    `/coins/markets?vs_currency=${encodeURIComponent(vsCurrency)}` +
    `&order=market_cap_desc&per_page=${perPage}&page=1&price_change_percentage=24h`;

  return fetchJson(path);
}

/**
 * Дані для графіка (історія ціни за останні N днів)
 */
export async function fetchCoinMarketChart(
  coinId,
  vsCurrency = 'usd',
  days = 7
) {
  const path =
    `/coins/${encodeURIComponent(coinId)}/market_chart?` +
    `vs_currency=${encodeURIComponent(vsCurrency)}&days=${days}&interval=daily`;

  return fetchJson(path);
}

/**
 * НОВЕ: Детальна інформація про монету (Опис, дата запуску, посилання)
 */
export async function fetchCoinDetails(coinId) {
  // localization=true дозволяє отримати опис різними мовами (в т.ч. uk)
  const path = `/coins/${encodeURIComponent(
    coinId
  )}?localization=true&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`;

  return fetchJson(path);
}