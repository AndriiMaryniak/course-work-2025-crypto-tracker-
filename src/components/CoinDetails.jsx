import React, { useState, useEffect } from 'react';

function CoinDetails({ details, loading, error, language }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Скидаємо стан "розгорнуто", якщо змінюється монета
  useEffect(() => {
    setIsExpanded(false);
  }, [details]);

  const texts = {
    ua: {
      title: 'Інформація про монету',
      genesisDate: 'Дата запуску',
      hashingAlgorithm: 'Алгоритм хешування',
      platform: 'Платформа',
      category: 'Категорія',
      description: 'Опис проекту',
      website: 'Офіційний сайт',
      visitSite: 'Перейти на сайт',
      loading: 'Завантаження деталей...',
      noData: 'Інформація відсутня.',
      error: 'Не вдалося завантажити деталі.',
      notAvailable: 'Невідомо',
      readMore: 'Читати далі',
      showLess: 'Згорнути',
      translationMissing: 'На жаль, офіційний опис українською відсутній. Показано англійську версію.',
    },
    en: {
      title: 'Coin Information',
      genesisDate: 'Genesis Date',
      hashingAlgorithm: 'Hashing Algorithm',
      platform: 'Platform',
      category: 'Category',
      description: 'Project Description',
      website: 'Official Website',
      visitSite: 'Visit Website',
      loading: 'Loading details...',
      noData: 'No information available.',
      error: 'Failed to load details.',
      notAvailable: 'Unknown',
      readMore: 'Read More',
      showLess: 'Show Less',
      translationMissing: '',
    },
  };

  const t = texts[language] || texts.ua;

  if (loading) {
    return (
      <div className="coin-details-inner">
        <h3 className="card-title">{t.title}</h3>
        <p className="crypto-status crypto-status-loading">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="coin-details-inner">
        <h3 className="card-title">{t.title}</h3>
        <p className="crypto-status crypto-status-error">{t.error}</p>
      </div>
    );
  }

  if (!details) {
    return null;
  }

  // --- 1. ЛОГІКА ВИБОРУ МОВИ ОПИСУ ---
  
  // Визначаємо код мови для API (CoinGecko використовує 'uk' для української)
  const targetLangKey = language === 'ua' ? 'uk' : 'en';
  
  // Пробуємо взяти текст потрібною мовою
  let descRaw = details.description?.[targetLangKey] || '';
  let isFallback = false;

  // Якщо ми хотіли UA, але тексту немає (пусто), беремо EN як запасний варіант
  if (!descRaw && language === 'ua') {
    descRaw = details.description?.en || '';
    if (descRaw) {
      isFallback = true; // Запам'ятовуємо, що це запасний варіант
    }
  }

  // --- 2. ЛОГІКА ТЕХНІЧНИХ ДАНИХ ---
  let techLabel = t.hashingAlgorithm;
  let techValue = details.hashing_algorithm;

  if (!techValue) {
    if (details.asset_platform_id) {
      techLabel = t.platform;
      const platform = details.asset_platform_id;
      techValue = platform.charAt(0).toUpperCase() + platform.slice(1);
    } else if (details.categories && details.categories.length > 0) {
      techLabel = t.category;
      techValue = details.categories[0];
    } else {
      techValue = t.notAvailable;
    }
  }

  const genesisDate = details.genesis_date ? details.genesis_date : t.notAvailable;
  const homepage = details.links?.homepage?.[0] || '';
  
  // Кнопка "Читати далі" з'являється, якщо тексту більше 300 символів
  const isLongText = descRaw.length > 300;

  return (
    <div className="coin-details-inner">
      <h3 className="card-title">{t.title}</h3>

      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">{t.genesisDate}</span>
          <span className="detail-value">{genesisDate}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">{techLabel}</span>
          <span className="detail-value">{techValue}</span>
        </div>

        {homepage && (
          <div className="detail-item">
            <span className="detail-label">{t.website}</span>
            <a
              href={homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-link-btn"
            >
              {t.visitSite} &rarr;
            </a>
          </div>
        )}
      </div>

      {descRaw ? (
        <div className="detail-description-block">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
            <span className="detail-label">{t.description}</span>
            
            {/* ПОПЕРЕДЖЕННЯ ПРО ВІДСУТНІСТЬ ПЕРЕКЛАДУ */}
            {isFallback && (
              <span style={{ 
                fontSize: '11px', 
                color: '#f59e0b', /* Жовтий колір уваги */
                fontStyle: 'italic',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                maxWidth: 'fit-content'
              }}>
                ℹ️ {t.translationMissing}
              </span>
            )}
          </div>
          
          <div className={`description-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div
              className="detail-description-text"
              dangerouslySetInnerHTML={{ __html: descRaw }}
            />
            {!isExpanded && isLongText && <div className="description-fade-overlay"></div>}
          </div>

          {isLongText && (
            <button 
              className="read-more-btn" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? t.showLess : t.readMore}
            </button>
          )}
        </div>
      ) : (
        <p className="card-text">{t.noData}</p>
      )}
    </div>
  );
}

export default CoinDetails;