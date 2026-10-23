import type { ExerciseType } from '../../types';

export interface TypeOption {
  type: ExerciseType;
  title: string;
  tag: string;
  desc: string;
  icon: string;
  color: string;
  bgSubtle: string;
}

export const EXERCISE_TYPES: TypeOption[] = [
  {
    type: 'fill_blanks',
    title: 'Пропуски в тексте',
    tag: 'Fill in blanks',
    desc: 'Ввод или выбор пропущенных слов в контексте предложения',
    icon: '✏️',
    color: '#4f46e5',
    bgSubtle: '#eef2ff',
  },
  {
    type: 'match_pairs',
    title: 'Соединение пар',
    tag: 'Match pairs',
    desc: 'Сопоставление английских фраз, переводов или определений',
    icon: '🔀',
    color: '#0284c7',
    bgSubtle: '#e0f2fe',
  },
  {
    type: 'word_order',
    title: 'Порядок слов',
    tag: 'Word order',
    desc: 'Составление правильного предложения из перемешанных слов',
    icon: '🧩',
    color: '#059669',
    bgSubtle: '#ecfdf5',
  },
  {
    type: 'flashcards',
    title: 'Карточки со словами',
    tag: 'Flashcards',
    desc: '3D флеш-карточки с транскрипцией, озвучкой и примерами',
    icon: '🗂',
    color: '#d97706',
    bgSubtle: '#fffbeb',
  },
  {
    type: 'quiz',
    title: 'Тест с выбором',
    tag: 'Quiz',
    desc: 'Вопрос с вариантами ответов и грамматическим пояснением',
    icon: '🔘',
    color: '#7c3aed',
    bgSubtle: '#f5f3ff',
  },
  {
    type: 'media_rule',
    title: 'Правило и аудирование',
    tag: 'Rule & Audio',
    desc: 'Грамматика с речевой озвучкой и вопросами для Speaking',
    icon: '📖',
    color: '#e11d48',
    bgSubtle: '#ffe4e6',
  },
];
