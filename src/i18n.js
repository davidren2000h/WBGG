// UI string table for EN / ZH (PRD §5.4, §9.2)
export const STRINGS = {
  app_title: { en: 'Wikipedia Guessing Game', zh: '维基百科猜词游戏' },
  tagline: {
    en: 'Guess the entity from Wikipedia clues.',
    zh: '根据维基百科线索猜出对应的词条。'
  },
  start_game: { en: 'Quick Game', zh: '快速开始' },
  daily_challenge: { en: 'Daily Challenge', zh: '每日挑战' },
  language: { en: 'Language', zh: '语言' },
  clues: { en: 'Clues', zh: '线索' },
  your_guess: { en: 'Your guess…', zh: '请输入你的猜测…' },
  submit: { en: 'Submit', zh: '提交' },
  hint: { en: 'Hint', zh: '提示' },
  skip: { en: 'Skip', zh: '跳过' },
  next: { en: 'Next', zh: '下一题' },
  loading: { en: 'Loading question…', zh: '正在加载题目…' },
  correct: { en: 'Correct!', zh: '答对了！' },
  wrong: { en: 'Not quite — try again.', zh: '不对，再试一次。' },
  answer_was: { en: 'Answer:', zh: '答案：' },
  score: { en: 'Score', zh: '分数' },
  streak: { en: 'Streak', zh: '连胜' },
  question_n: { en: 'Question', zh: '第' },
  of: { en: 'of', zh: '/' },
  read_more: { en: 'Read on Wikipedia →', zh: '在维基百科上阅读 →' },
  give_up: { en: 'Give up', zh: '放弃' },
  daily_done: { en: 'Daily challenge complete!', zh: '每日挑战已完成！' },
  final_score: { en: 'Final score', zh: '最终得分' },
  play_again: { en: 'Play again', zh: '再玩一次' },
  home: { en: 'Home', zh: '主页' },
  hint_first_char: { en: 'First character', zh: '首字' },
  hint_summary: { en: 'Summary snippet', zh: '简介片段' },
  error_fetch: {
    en: 'Could not load a question. Please try again.',
    zh: '加载题目失败，请重试。'
  }
};

export function t(key, lang) {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en ?? key;
}
