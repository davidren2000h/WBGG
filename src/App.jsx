import React, { useEffect, useState } from 'react';
import { t } from './i18n.js';
import Home from './components/Home.jsx';
import Game from './components/Game.jsx';

const LANG_KEY = 'wbgg.lang';

export default function App() {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'zh') return saved;
    return navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  });
  // mode: 'home' | 'quick' | 'daily'
  const [mode, setMode] = useState('home');

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="app">
      <header className="header">
        <h1>{t('app_title', lang)}</h1>
        <div className="lang-switch" role="group" aria-label={t('language', lang)}>
          <button
            className={lang === 'en' ? 'active' : ''}
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button
            className={lang === 'zh' ? 'active' : ''}
            onClick={() => setLang('zh')}
          >
            中文
          </button>
        </div>
      </header>

      {mode === 'home' && (
        <Home lang={lang} onStart={(m) => setMode(m)} />
      )}
      {mode !== 'home' && (
        <Game
          lang={lang}
          mode={mode}
          onExit={() => setMode('home')}
        />
      )}
    </div>
  );
}
