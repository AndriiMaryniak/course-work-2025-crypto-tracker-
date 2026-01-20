import React from 'react';

function CoinDetails({ details, loading, error, language }) {
  const texts = {
    ua: {
      title: 'Інформація про монету',
      genesisDate: 'Дата запуску:',
      hashingAlgorithm: 'Алгоритм хешування:',
      description: 'Опис',
      website: 'Вебсайт:',
      visitSite: 'Відвідати',
      loading: 'Завантаження деталей...',
      noData: 'Інформація відсутня.',
      error: 'Не вдалося завантажити деталі.',
    },
    en: {
      title: 'Coin Information',
      genesisDate: 'Genesis Date:',
      hashingAlgorithm: 'Hashing Algorithm:',
      description: 'Description',
      website: 'Website:',
      visitSite: 'Visit',
      loading: 'Loading details...',
      noData: 'No information available.',
      error: 'Failed to load details.',
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

  // Логіка вибору мови опису:
  // Якщо обрана UA -> шукаємо 'uk', якщо немає -> 'en', якщо немає -> пустий рядок.
  const descRaw =
    details.description?.[language === 'ua' ? 'uk' : 'en'] ||
    details.description?.en ||
    '';

  const genesisDate = details.genesis_date || '-';
  const hashingAlgo = details.hashing_algorithm || '-';
  const homepage = details.links?.homepage?.[0] || '';

  return (
    <div className="coin-details-inner">
      <h3 className="card-title">{t.title}</h3>

      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">{t.genesisDate}</span>
          <span className="detail-value">{genesisDate}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">{t.hashingAlgorithm}</span>
          <span className="detail-value">{hashingAlgo}</span>
        </div>
        {homepage && (
          <div className="detail-item">
            <span className="detail-label">{t.website}</span>
            <a
              href={homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-link"
            >
              {t.visitSite}
            </a>
          </div>
        )}
      </div>

      {descRaw && (
        <div className="detail-description-block">
          <span className="detail-label">{t.description}</span>
          {/* API повертає HTML (з посиланнями), тому використовуємо dangerouslySetInnerHTML */}
          <div
            className="detail-description-text"
            dangerouslySetInnerHTML={{ __html: descRaw }}
          />
        </div>
      )}

      {!descRaw && <p className="card-text">{t.noData}</p>}
    </div>
  );
}

export default CoinDetails;