import React from 'react';
import { t } from '../i18n.js';

export default function Home({ lang, onStart }) {
  return (
    <section className="panel">
      <p className="tagline">{t('tagline', lang)}</p>
      <div className="home-actions">
        <button className="btn" onClick={() => onStart('quick')}>
          {t('start_game', lang)}
        </button>
        <button className="btn secondary" onClick={() => onStart('daily')}>
          {t('daily_challenge', lang)}
        </button>
      </div>
    </section>
  );
}
