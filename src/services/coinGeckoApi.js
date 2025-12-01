const API_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Завантажує ринкові дані про криптовалюти з CoinGecko.
 *
 * vsCurrency — в якій валюті показувати курс (наприклад, 'usd', 'uah').
 * perPage — скільки монет завантажувати за один раз.
 */
export async function fetchMarketCoins(vsCurrency = 'usd', perPage = 10) {
  const url = `${API_BASE_URL}/coins/markets` +
    `?vs_currency=${encodeURIComponent(vsCurrency)}` +
    `&order=market_cap_desc` +
    `&per_page=${encodeURIComponent(perPage)}` +
    `&page=1` +
    `&price_change_percentage=24h`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Помилка запиту до CoinGecko: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Нормалізуємо дані під нашу таблицю
  return data.map((coin) => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    priceUsd: coin.current_price,                // поточна ціна
    change24h: coin.price_change_percentage_24h, // зміна в %
    marketCapUsd: coin.market_cap,               // ринкова капа
  }));
}
