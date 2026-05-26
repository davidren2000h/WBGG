import React, { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '../i18n.js';
import { generateQuestion, getSummary } from '../wiki.js';
import { firstCharHint, isCorrect, SCORE } from '../game.js';

const DAILY_TOTAL = 10;

export default function Game({ lang, mode, onExit }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null); // {kind, text}
  const [usedHint, setUsedHint] = useState(false);
  const [hintText, setHintText] = useState(null);
  const [revealed, setRevealed] = useState(null); // {answer, url}
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionNum, setQuestionNum] = useState(1);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef(null);

  const loadNext = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    setInput('');
    setUsedHint(false);
    setHintText(null);
    setRevealed(null);
    try {
      const q = await generateQuestion(lang);
      setQuestion(q);
    } catch (e) {
      console.error(e);
      setError(t('error_fetch', lang));
    } finally {
      setLoading(false);
      // Focus input after render.
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [lang]);

  // Initial + language change reloads the current question.
  useEffect(() => {
    setScore(0);
    setStreak(0);
    setQuestionNum(1);
    setFinished(false);
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, mode]);

  const advance = useCallback(() => {
    if (mode === 'daily' && questionNum >= DAILY_TOTAL) {
      setFinished(true);
      return;
    }
    setQuestionNum((n) => n + 1);
    loadNext();
  }, [mode, questionNum, loadNext]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!question || revealed) return;
    if (!input.trim()) return;
    if (isCorrect(input, question.answer)) {
      const gained = usedHint ? SCORE.CORRECT_AFTER_HINT : SCORE.CORRECT_FIRST;
      setScore((s) => s + gained);
      setStreak((s) => s + 1);
      revealAnswer(true);
    } else {
      setScore((s) => s + SCORE.WRONG);
      setStreak(0);
      setFeedback({ kind: 'bad', text: t('wrong', lang) });
    }
  };

  async function revealAnswer(correct) {
    const summary = await getSummary(lang, question.answer);
    setRevealed({
      answer: summary?.displaytitle || question.answer,
      url:
        summary?.url ??
        `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(question.answer)}`
    });
    setFeedback({
      kind: correct ? 'good' : 'info',
      text: correct ? t('correct', lang) : `${t('answer_was', lang)} ${question.answer}`
    });
  }

  async function handleHint() {
    if (!question || revealed) return;
    setUsedHint(true);
    // First hint: first character. Second click: summary snippet.
    if (!hintText) {
      setHintText(`${t('hint_first_char', lang)}: ${firstCharHint(question.answer)}`);
      return;
    }
    const summary = await getSummary(lang, question.answer);
    const snippet = (summary?.extract ?? '').slice(0, 140);
    // Redact the answer text from the snippet if present.
    const safe = snippet.replaceAll(question.answer, '▮▮▮');
    setHintText(`${t('hint_summary', lang)}: ${safe || '—'}`);
  }

  async function handleGiveUp() {
    if (!question || revealed) return;
    setStreak(0);
    await revealAnswer(false);
  }

  if (finished) {
    return (
      <section className="panel center">
        <h2>{t('daily_done', lang)}</h2>
        <p style={{ fontSize: '2rem', margin: '12px 0' }}>
          <b>{score}</b>
        </p>
        <p className="tagline">{t('final_score', lang)}</p>
        <div className="action-row" style={{ justifyContent: 'center' }}>
          <button className="btn" onClick={onExit}>{t('home', lang)}</button>
          <button
            className="btn secondary"
            onClick={() => {
              setScore(0);
              setStreak(0);
              setQuestionNum(1);
              setFinished(false);
              loadNext();
            }}
          >
            {t('play_again', lang)}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="scoreboard">
        <span>{t('score', lang)}: <b>{score}</b></span>
        <span>{t('streak', lang)}: <b>{streak}</b></span>
        <span style={{ marginLeft: 'auto' }}>
          {mode === 'daily'
            ? `${t('question_n', lang)} ${questionNum} ${t('of', lang)} ${DAILY_TOTAL}`
            : `${t('question_n', lang)} ${questionNum}`}
        </span>
      </div>

      {loading && <p className="tagline">{t('loading', lang)}</p>}
      {error && (
        <>
          <p className="feedback bad">{error}</p>
          <button className="btn" onClick={loadNext}>{t('next', lang)}</button>
        </>
      )}

      {!loading && !error && question && (
        <>
          <h3 style={{ marginTop: 0 }}>{t('clues', lang)}</h3>
          <ul className="clues">
            {question.clues.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>

          <form className="input-row" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              placeholder={t('your_guess', lang)}
              onChange={(e) => setInput(e.target.value)}
              disabled={!!revealed}
              autoComplete="off"
            />
            <button className="btn" type="submit" disabled={!!revealed}>
              {t('submit', lang)}
            </button>
          </form>

          <div className="action-row">
            <button
              className="btn secondary"
              onClick={handleHint}
              disabled={!!revealed}
            >
              {t('hint', lang)}
            </button>
            <button
              className="btn ghost"
              onClick={handleGiveUp}
              disabled={!!revealed}
            >
              {t('give_up', lang)}
            </button>
            <button
              className="btn ghost"
              onClick={onExit}
              style={{ marginLeft: 'auto' }}
            >
              {t('home', lang)}
            </button>
          </div>

          {hintText && <div className="hint-box">{hintText}</div>}

          {feedback && (
            <div className={`feedback ${feedback.kind}`}>{feedback.text}</div>
          )}

          {revealed && (
            <div className="reveal" style={{ marginTop: 12 }}>
              <a href={revealed.url} target="_blank" rel="noopener noreferrer">
                {t('read_more', lang)}
              </a>
              <div style={{ marginTop: 12 }}>
                <button className="btn" onClick={advance}>
                  {mode === 'daily' && questionNum >= DAILY_TOTAL
                    ? t('final_score', lang)
                    : t('next', lang)}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
