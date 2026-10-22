import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Plus,
  Trash2,
  Eye,
  Edit3,
  Lock,
  Volume2,
  Sparkles,
  Columns,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import type {
  Exercise,
  ExerciseType,
  CEFRLevel,
  FillBlanksData,
  MatchPairsData,
  WordOrderData,
  FlashcardsData,
  QuizData,
  MediaRuleData,
} from '../../types';
import { sound } from '../../utils/audio';
import { generateExerciseWithGemini } from '../../services/gemini';

// Import the real interactive exercise engines for live simulation
import { FillInBlanksExercise } from '../exercises/FillInBlanksExercise';
import { MatchPairsExercise } from '../exercises/MatchPairsExercise';
import { WordOrderExercise } from '../exercises/WordOrderExercise';
import { FlashcardsExercise } from '../exercises/FlashcardsExercise';
import { QuizExercise } from '../exercises/QuizExercise';
import { MediaRuleExercise } from '../exercises/MediaRuleExercise';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercise: (exercise: Exercise) => void;
  exerciseToEdit?: Exercise | null;
}

interface TypeOption {
  type: ExerciseType;
  title: string;
  tag: string;
  desc: string;
  icon: string;
  color: string;
  bgSubtle: string;
}

const EXERCISE_TYPES: TypeOption[] = [
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

// Web Speech API helper for pronouncing English words/phrases
const speakEnglish = (text: string, accent: 'en-GB' | 'en-US' = 'en-GB', rate = 1.0) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = accent;
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
  }
};

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  onClose,
  onAddExercise,
  exerciseToEdit,
}) => {
  // Mode: Editor only | Split 50/50 | Preview only
  const [viewMode, setViewMode] = useState<'editor' | 'split' | 'preview'>('split');
  const [selectedType, setSelectedType] = useState<ExerciseType>('fill_blanks');

  // Metadata
  const [title, setTitle] = useState('Present Simple vs Continuous');
  const [instruction, setInstruction] = useState('Fill in the blanks with the correct form of the verb:');
  const [scoreWeight, setScoreWeight] = useState(4);
  const [teacherNote, setTeacherNote] = useState('Обратите внимание студента на маркеры времени (usually vs right now).');

  // Gemini AI generation state
  const [showAiBar, setShowAiBar] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLevel, setAiLevel] = useState<CEFRLevel>('B1');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Fill in blanks state: structured items & text mode
  const [fillMode, setFillMode] = useState<'visual' | 'text'>('visual');
  const [blankItems, setBlankItems] = useState<
    { id: string; prefixText: string; correctAnswer: string; hint: string; suffixText: string }[]
  >([
    {
      id: 'b1',
      prefixText: '1. She usually',
      correctAnswer: 'drinks',
      hint: 'drink',
      suffixText: 'coffee, but today she is having tea.',
    },
    {
      id: 'b2',
      prefixText: '2. Look! The train',
      correctAnswer: 'is arriving',
      hint: 'arrive',
      suffixText: 'at platform 3.',
    },
    {
      id: 'b3',
      prefixText: '3. Water',
      correctAnswer: 'boils',
      hint: 'boil',
      suffixText: 'at 100 degrees Celsius.',
    },
  ]);
  const [blankLinesRaw, setBlankLinesRaw] = useState(
    '1. She usually [drinks] (drink) coffee, but today she [is having] (have) tea.\n2. Look! The train [is arriving] (arrive) at platform 3.\n3. Water [boils] (boil) at 100 degrees Celsius.'
  );

  // Match pairs state
  const [pairs, setPairs] = useState<{ id: string; left: string; right: string }[]>([
    { id: '1', left: 'Boarding pass', right: 'Посадочный талон' },
    { id: '2', left: 'Carry-on luggage', right: 'Ручная кладь' },
    { id: '3', left: 'Delay a flight', right: 'Задержать рейс' },
    { id: '4', left: 'Baggage claim', right: 'Выдача багажа' },
  ]);

  // Word order state
  const [targetSentence, setTargetSentence] = useState('Could you please tell me where the departure gate is?');
  const [hint, setHint] = useState('Begin with "Could you"');
  const [distractors, setDistractors] = useState('did, was');

  // Flashcards state
  const [cards, setCards] = useState<
    { id: string; term: string; transcription: string; translation: string; example: string }[]
  >([
    {
      id: '1',
      term: 'commence',
      transcription: '/kəˈmens/',
      translation: 'начинать(ся) официально',
      example: 'Boarding for flight 204 will commence shortly.',
    },
    {
      id: '2',
      term: 'misplace',
      transcription: '/ˌmɪsˈpleɪs/',
      translation: 'положить не туда, потерять',
      example: 'I seem to have misplaced my boarding pass.',
    },
    {
      id: '3',
      term: 'complimentary',
      transcription: '/ˌkɒmplɪˈmentri/',
      translation: 'бесплатный (в качестве бонуса)',
      example: 'Passengers are offered complimentary drinks during the delay.',
    },
  ]);

  // Quiz state
  const [quizQuestion, setQuizQuestion] = useState('If I _____ more time, I would travel around Scotland.');
  const [quizOptions, setQuizOptions] = useState<string[]>([
    'had',
    'have',
    'will have',
    'would have',
  ]);
  const [correctOptionIdx, setCorrectOptionIdx] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState(
    'Second Conditional uses: If + Past Simple, would + bare infinitive for hypothetical situations.'
  );

  // Media Rule state
  const [ruleTitle, setRuleTitle] = useState('Present Perfect vs Past Simple');
  const [ruleContent, setRuleContent] = useState(
    'Use the Present Perfect for life experiences without a specific time:\n• "I have visited London three times."\n\nUse the Past Simple when the exact time is specified or finished:\n• "I visited London in 2024."'
  );
  const [speechAccent, setSpeechAccent] = useState<'en-GB' | 'en-US'>('en-GB');
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [prompts, setPrompts] = useState<string[]>([
    'Have you ever lost something valuable while travelling?',
    'When was the last time you took an international flight?',
    'What is your favourite city in the world and why?',
  ]);

  // Load existing exercise if editing
  useEffect(() => {
    if (exerciseToEdit) {
      setSelectedType(exerciseToEdit.type);
      setTitle(exerciseToEdit.title);
      setInstruction(exerciseToEdit.instruction);
      setScoreWeight(exerciseToEdit.scoreWeight);
      setTeacherNote(exerciseToEdit.teacherNote || '');

      const data = exerciseToEdit.data as any;
      if (exerciseToEdit.type === 'fill_blanks' && data.items) {
        setBlankItems(
          data.items.map((it: any, i: number) => ({
            id: it.id || `b-${i}`,
            prefixText: it.prefixText || '',
            correctAnswer: it.correctAnswer || '',
            hint: it.hint || '',
            suffixText: it.suffixText || '',
          }))
        );
      } else if (exerciseToEdit.type === 'match_pairs' && data.pairs) {
        setPairs(
          data.pairs.map((p: any, i: number) => ({
            id: p.id || `p-${i}`,
            left: p.leftText || '',
            right: p.rightText || '',
          }))
        );
      } else if (exerciseToEdit.type === 'word_order' && data.items?.[0]) {
        const item = data.items[0];
        setTargetSentence(item.targetSentence || '');
        setHint(item.hint || '');
        setDistractors(item.distractors ? item.distractors.join(', ') : '');
      } else if (exerciseToEdit.type === 'flashcards' && data.cards) {
        setCards(
          data.cards.map((c: any, i: number) => ({
            id: c.id || `c-${i}`,
            term: c.term || '',
            transcription: c.transcription || '',
            translation: c.translation || '',
            example: c.exampleSentence || '',
          }))
        );
      } else if (exerciseToEdit.type === 'quiz' && data.questions?.[0]) {
        const q = data.questions[0];
        setQuizQuestion(q.question || '');
        setQuizOptions(q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4']);
        setCorrectOptionIdx(q.correctOptionIndex || 0);
        setQuizExplanation(q.explanation || '');
      } else if (exerciseToEdit.type === 'media_rule') {
        setRuleTitle(data.ruleTitle || '');
        setRuleContent(data.markdownContent || '');
        setPrompts(data.discussionPrompts || []);
      }
    }
  }, [exerciseToEdit]);

  if (!isOpen) return null;

  // ESL Ready-to-Use Activity Presets
  const handleLoadPreset = (presetKey: string) => {
    sound.playClick();
    if (presetKey === 'airport_dialogue') {
      setSelectedType('fill_blanks');
      setTitle('At the Airport: Check-in & Security');
      setInstruction('Fill in the gaps with the correct travel terminology:');
      setScoreWeight(4);
      setBlankItems([
        {
          id: 'p1',
          prefixText: '1. Good morning. Could I see your passport and',
          correctAnswer: 'boarding pass',
          hint: 'pass',
          suffixText: ', please?',
        },
        {
          id: 'p2',
          prefixText: '2. I would like to request a',
          correctAnswer: 'window',
          hint: 'window / aisle',
          suffixText: 'seat if one is still available.',
        },
        {
          id: 'p3',
          prefixText: '3. Do you have any liquids or a',
          correctAnswer: 'laptop',
          hint: 'device',
          suffixText: 'inside your carry-on luggage?',
        },
        {
          id: 'p4',
          prefixText: '4. Your flight is currently',
          correctAnswer: 'delayed',
          hint: 'late',
          suffixText: 'by approximately 30 minutes.',
        },
      ]);
      setTeacherNote('Focus on polite requests using "Could I..." and pronunciation of "aisle" /aɪl/.');
    } else if (presetKey === 'business_collocations') {
      setSelectedType('match_pairs');
      setTitle('Business English Collocations');
      setInstruction('Match the corporate verbs with their natural noun complements:');
      setScoreWeight(4);
      setPairs([
        { id: '1', left: 'Meet', right: 'Tight deadlines' },
        { id: '2', left: 'Spearhead', right: 'An innovative initiative' },
        { id: '3', left: 'Streamline', right: 'Internal operational processes' },
        { id: '4', left: 'Exceed', right: 'Quarterly sales targets' },
        { id: '5', left: 'Facilitate', right: 'Cross-functional collaboration' },
      ]);
      setTeacherNote('Ask the student to create two authentic sentences using their favourite collocations.');
    } else if (presetKey === 'polite_requests') {
      setSelectedType('word_order');
      setTitle('Polite Requests & Indirect Questions');
      setInstruction('Unscramble the words to assemble a natural, polite inquiry:');
      setScoreWeight(3);
      setTargetSentence('Would you mind telling me what time the flight departs?');
      setHint('Start with "Would you mind"');
      setDistractors('did, was');
      setTeacherNote('Remind the student: "Would you mind" takes a Gerund (V-ing).');
    } else if (presetKey === 'coffee_ordering') {
      setSelectedType('fill_blanks');
      setTitle('Ordering in a London Coffee Shop');
      setInstruction('Complete the customer and barista exchange:');
      setScoreWeight(3);
      setBlankItems([
        {
          id: 'c1',
          prefixText: '1. Hi there! Could I get a flat white with',
          correctAnswer: 'oat milk',
          hint: 'dairy alternative',
          suffixText: ', please?',
        },
        {
          id: 'c2',
          prefixText: '2. Would you like that to drink here or',
          correctAnswer: 'take away',
          hint: 'to go',
          suffixText: '?',
        },
        {
          id: 'c3',
          prefixText: '3. Can I pay by',
          correctAnswer: 'contactless card',
          hint: 'payment method',
          suffixText: ', or do you only take cash?',
        },
      ]);
      setTeacherNote('Explain the difference between British "take away" and American "to go".');
    } else if (presetKey === 'phrasal_get') {
      setSelectedType('flashcards');
      setTitle('Essential Phrasal Verbs: GET');
      setInstruction('Memorize these four high-frequency phrasal verbs:');
      setScoreWeight(4);
      setCards([
        {
          id: 'f1',
          term: 'get along with',
          transcription: '/ɡet əˈlɒŋ wɪð/',
          translation: 'ладить с кем-либо, иметь хорошие отношения',
          example: 'I get along really well with all my new colleagues.',
        },
        {
          id: 'f2',
          term: 'get by',
          transcription: '/ɡet baɪ/',
          translation: 'справляться, сводить концы с концами',
          example: 'My Spanish is not fluent, but I can get by when travelling.',
        },
        {
          id: 'f3',
          term: 'get over',
          transcription: '/ɡet ˈəʊvə/',
          translation: 'оправиться, пережить неприятность или болезнь',
          example: 'It took her several days to get over the jet lag.',
        },
        {
          id: 'f4',
          term: 'get away with',
          transcription: '/ɡet əˈweɪ wɪð/',
          translation: 'выйти сухим из воды, избежать наказания',
          example: 'You cannot get away with arriving late to every board meeting.',
        },
      ]);
      setTeacherNote('Quiz student: which verb means "to have enough money to survive"?');
    } else if (presetKey === 'conditionals_quiz') {
      setSelectedType('quiz');
      setTitle('Conditionals Mastery Test');
      setInstruction('Select the single grammatically correct option:');
      setScoreWeight(5);
      setQuizQuestion('She wouldn\'t have missed the connecting flight if the taxi _____ on time.');
      setQuizOptions(['had arrived', 'arrived', 'would arrive', 'has arrived']);
      setCorrectOptionIdx(0);
      setQuizExplanation('Third Conditional formula: If + Past Perfect (had arrived), would have + Past Participle.');
      setTeacherNote('Ask why "would arrive" is incorrect in the "if" clause.');
    } else if (presetKey === 'grammar_rule_audio') {
      setSelectedType('media_rule');
      setTitle('Present Perfect vs Past Simple');
      setInstruction('Read the rule, listen to natural pronunciation and answer speaking prompts:');
      setScoreWeight(3);
      setRuleTitle('Life Experiences vs Specific Time');
      setRuleContent(
        '**1. Present Perfect (have/has + V3)**\nUsed when the exact time is NOT mentioned, or the period is still continuing:\n• *"I have been to London three times."*\n• *"Have you ever lost your passport?"*\n\n**2. Past Simple (V2 / -ed)**\nUsed when the time is specified or completely finished in the past:\n• *"I visited London last summer."*\n• *"Yesterday, the airline lost my luggage."*'
      );
      setPrompts([
        'Have you ever lost something valuable while travelling?',
        'When was the last time you took an international flight?',
        'What is your favourite city in the world and why did you like it?',
      ]);
      setTeacherNote('Ensure student answers with Past Simple once they mention a specific past event!');
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    setAiError(null);
    sound.playClick();
    try {
      const res = await generateExerciseWithGemini(selectedType, aiPrompt.trim(), aiLevel);
      if (res.title) setTitle(res.title);
      if (res.instruction) setInstruction(res.instruction);
      if (res.scoreWeight) setScoreWeight(res.scoreWeight);
      if (res.teacherNote) setTeacherNote(res.teacherNote);

      if (selectedType === 'fill_blanks' && res.data?.items) {
        setBlankItems(
          res.data.items.map((it: any, i: number) => ({
            id: `b-ai-${i}`,
            prefixText: it.prefixText || '',
            correctAnswer: it.correctAnswer || '',
            hint: it.hint || '',
            suffixText: it.suffixText || '',
          }))
        );
        setFillMode('visual');
      } else if (selectedType === 'match_pairs' && res.data?.pairs) {
        setPairs(
          res.data.pairs.map((p: any, i: number) => ({
            id: `p-ai-${i}`,
            left: p.leftText || p.left || '',
            right: p.rightText || p.right || '',
          }))
        );
      } else if (selectedType === 'word_order' && res.data) {
        if (res.data.targetSentence) setTargetSentence(res.data.targetSentence);
        if (res.data.hint) setHint(res.data.hint);
        if (res.data.distractors) setDistractors(res.data.distractors);
      } else if (selectedType === 'flashcards' && res.data?.cards) {
        setCards(
          res.data.cards.map((c: any, i: number) => ({
            id: `fc-ai-${i}`,
            term: c.term || '',
            transcription: c.transcription || '//',
            translation: c.translation || '',
            example: c.exampleSentence || c.example || '',
          }))
        );
      } else if (selectedType === 'quiz' && res.data) {
        if (res.data.question) setQuizQuestion(res.data.question);
        if (res.data.options) setQuizOptions(res.data.options);
        if (typeof res.data.correctOptionIndex === 'number') setCorrectOptionIdx(res.data.correctOptionIndex);
        if (res.data.explanation) setQuizExplanation(res.data.explanation);
      } else if (selectedType === 'media_rule' && res.data) {
        if (res.data.ruleTitle) setRuleTitle(res.data.ruleTitle);
        if (res.data.ruleContent) setRuleContent(res.data.ruleContent);
        if (res.data.discussionPrompts) setPrompts(res.data.discussionPrompts);
      }

      sound.playCorrect();
      setShowAiBar(false);
    } catch (err: any) {
      setAiError(err.message || 'Ошибка генерации Gemini AI');
      sound.playIncorrect();
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Convert current state into valid Exercise object for saving or live preview
  const buildCurrentExercise = (): Exercise => {
    let exerciseData: any = {};

    if (selectedType === 'fill_blanks') {
      let items: any[] = [];
      if (fillMode === 'visual') {
        items = blankItems.map((item, idx) => ({
          id: item.id || `b-${Date.now()}-${idx}`,
          prefixText: item.prefixText,
          correctAnswer: item.correctAnswer.trim(),
          hint: item.hint.trim() || undefined,
          suffixText: item.suffixText,
        }));
      } else {
        // Parse raw lines
        const lines = blankLinesRaw.split('\n').filter((l) => l.trim().length > 0);
        items = lines.map((line, idx) => {
          const match = line.match(/(.*?)\[(.*?)\](?:\s*\((.*?)\))?(.*)/);
          if (match) {
            return {
              id: `b-${Date.now()}-${idx}`,
              prefixText: match[1],
              correctAnswer: match[2].trim(),
              hint: match[3]?.trim() || undefined,
              suffixText: match[4] || '',
            };
          }
          return {
            id: `b-${Date.now()}-${idx}`,
            prefixText: line,
            correctAnswer: 'answer',
            suffixText: '',
          };
        });
      }
      exerciseData = { items } as FillBlanksData;
    } else if (selectedType === 'match_pairs') {
      exerciseData = {
        pairs: pairs.map((p, idx) => ({
          id: p.id || `p-${Date.now()}-${idx}`,
          leftText: p.left.trim(),
          rightText: p.right.trim(),
        })),
      } as MatchPairsData;
    } else if (selectedType === 'word_order') {
      const words = targetSentence
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0);
      const distractorList = distractors
        .split(',')
        .map((d) => d.trim())
        .filter((d) => d.length > 0);
      const allShuffled = [...words, ...distractorList].sort(() => Math.random() - 0.5);

      exerciseData = {
        items: [
          {
            id: `wo-${Date.now()}`,
            targetSentence: targetSentence.trim(),
            shuffledWords: allShuffled,
            distractors: distractorList.length > 0 ? distractorList : undefined,
            hint: hint.trim() || undefined,
          },
        ],
      } as WordOrderData;
    } else if (selectedType === 'flashcards') {
      exerciseData = {
        cards: cards.map((c, idx) => ({
          id: c.id || `fc-${Date.now()}-${idx}`,
          term: c.term.trim(),
          transcription: c.transcription.trim(),
          translation: c.translation.trim(),
          exampleSentence: c.example.trim(),
        })),
      } as FlashcardsData;
    } else if (selectedType === 'quiz') {
      exerciseData = {
        questions: [
          {
            id: `q-${Date.now()}`,
            question: quizQuestion.trim(),
            options: quizOptions.map((o) => o.trim()),
            correctOptionIndex: correctOptionIdx,
            explanation: quizExplanation.trim() || undefined,
          },
        ],
      } as QuizData;
    } else {
      // media_rule
      exerciseData = {
        ruleTitle: ruleTitle.trim(),
        markdownContent: ruleContent.trim(),
        discussionPrompts: prompts.filter((p) => p.trim().length > 0),
      } as MediaRuleData;
    }

    return {
      id: exerciseToEdit?.id || `ex-${Date.now()}`,
      type: selectedType,
      title: title.trim() || 'Интерактивное задание',
      instruction: instruction.trim() || 'Выполните задание:',
      scoreWeight: scoreWeight,
      data: exerciseData,
      teacherNote: teacherNote.trim() || undefined,
    };
  };

  const handleSave = () => {
    sound.playCorrect();
    const newExercise = buildCurrentExercise();
    onAddExercise(newExercise);
    onClose();
  };

  // Helper to add gap in raw text mode
  const handleWrapSelectedAsGap = () => {
    sound.playClick();
    setBlankLinesRaw((prev) => {
      return prev + '\n4. I would like to [order] (verb) a sandwich.';
    });
  };

  const currentPreviewExercise = buildCurrentExercise();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 350,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          background: 'var(--surface-white)',
          borderRadius: '20px',
          width: 'min(98vw, 1500px)',
          height: '95vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.35)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* Top Header */}
        <header
          style={{
            height: '70px',
            padding: '0 28px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            flexShrink: 0,
          }}
        >
          {/* Left: Brand badge & In-place editable Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
              }}
            >
              <Sparkles size={14} />
              PROGRESSME STUDIO
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '520px' }}>
              <Edit3 size={16} color="var(--primary)" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название упражнения..."
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-main)',
                  border: '1px solid transparent',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  background: 'transparent',
                  width: '100%',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
                onFocus={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'transparent';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Center: View Switcher (Editor / Split / Preview) */}
          <div
            style={{
              display: 'flex',
              background: '#e2e8f0',
              padding: '4px',
              borderRadius: '12px',
              gap: '4px',
            }}
          >
            <button
              onClick={() => {
                sound.playClick();
                setViewMode('editor');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'editor' ? '#ffffff' : 'transparent',
                color: viewMode === 'editor' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: viewMode === 'editor' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: viewMode === 'editor' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Edit3 size={15} />
              Конструктор
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setViewMode('split');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'split' ? '#ffffff' : 'transparent',
                color: viewMode === 'split' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: viewMode === 'split' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: viewMode === 'split' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Columns size={15} />
              Сплит 50/50
              <span
                style={{
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '6px',
                }}
              >
                LIVE
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setViewMode('preview');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'preview' ? '#ffffff' : 'transparent',
                color: viewMode === 'preview' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: viewMode === 'preview' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: viewMode === 'preview' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Eye size={15} />
              Вид ученика
            </button>
          </div>

          {/* Right: Gemini AI Button, Presets Library & Close button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Gemini AI Generator trigger button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowAiBar(!showAiBar);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: showAiBar ? '1.5px solid var(--primary)' : '1.5px solid #c7d2fe',
                background: showAiBar ? 'var(--primary)' : 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 100%)',
                color: showAiBar ? '#ffffff' : 'var(--primary)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-subtle)',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={15} />
              Gemini AI
            </button>

            <div style={{ position: 'relative' }}>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleLoadPreset(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-subtle)',
                  background: 'var(--surface-white)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                <option value="" disabled>
                  📚 Библиотека шаблонов ESL...
                </option>
                <option value="airport_dialogue">✈️ Диалог в аэропорту (Пропуски, B1)</option>
                <option value="business_collocations">💼 Business Collocations (Пары, B2)</option>
                <option value="polite_requests">🧩 Polite Requests (Порядок слов, A2-B1)</option>
                <option value="coffee_ordering">☕ В кофейне Лондона (Пропуски, A1-A2)</option>
                <option value="phrasal_get">🗂 Фразовые глаголы GET (3D Карточки, B1-B2)</option>
                <option value="conditionals_quiz">🎯 Тест: Conditionals (Викторина, B2)</option>
                <option value="grammar_rule_audio">📖 Правило: Present Perfect + Аудио (A2-B1)</option>
              </select>
            </div>

            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '8px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease',
              }}
              title="Закрыть без сохранения"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Expandable Gemini AI Prompt Bar */}
        {showAiBar && (
          <div
            style={{
              background: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)',
              borderBottom: '1.5px solid #c7d2fe',
              padding: '16px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              animation: 'fadeIn 0.2s ease-out',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--primary)" />
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Генератор упражнений с Google Gemini AI
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    background: '#c7d2fe',
                    color: '#4338ca',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 800,
                  }}
                >
                  {selectedType.toUpperCase()}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Опишите любую тему, диалог или грамматику — Gemini составит задание за 2 секунды
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateWithAI();
                }}
                placeholder="Например: Past Simple vs Continuous в аэропорту, Фразовые глаголы с LOOK, Заказ еды в ресторане..."
                style={{
                  flex: 1,
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #a5b4fc',
                  background: '#ffffff',
                  outline: 'none',
                }}
              />

              <select
                value={aiLevel}
                onChange={(e) => setAiLevel(e.target.value as CEFRLevel)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #a5b4fc',
                  background: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="A1">A1 Beginner</option>
                <option value="A2">A2 Elementary</option>
                <option value="B1">B1 Intermediate</option>
                <option value="B2">B2 Upper-Int</option>
                <option value="C1">C1 Advanced</option>
              </select>

              <button
                type="button"
                disabled={isGeneratingAi || !aiPrompt.trim()}
                onClick={handleGenerateWithAI}
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isGeneratingAi ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  cursor: isGeneratingAi ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                  whiteSpace: 'nowrap',
                }}
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 size={16} className="spin-animate" />
                    Генерирую...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Сгенерировать
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div style={{ color: 'var(--error)', fontSize: '12px', fontWeight: 600 }}>
                ⚠️ {aiError}
              </div>
            )}
          </div>
        )}

        {/* Studio Body: Left Sidebar + Center Builder + Right Live Simulator */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Column 1: Exercise Types & Parameters (Visible in editor and split modes) */}
          {viewMode !== 'preview' && (
            <div
              style={{
                width: '320px',
                background: '#f8fafc',
                borderRight: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                padding: '20px',
                gap: '20px',
                flexShrink: 0,
              }}
            >
              {/* Exercise Mechanics Selector */}
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'var(--text-light)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'block',
                    marginBottom: '10px',
                  }}
                >
                  Тип интерактивного задания
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {EXERCISE_TYPES.map((t) => {
                    const isSelected = selectedType === t.type;
                    return (
                      <div
                        key={t.type}
                        onClick={() => {
                          sound.playClick();
                          setSelectedType(t.type);
                          if (t.type === 'fill_blanks') setInstruction('Fill in the blanks with the correct form of the verb:');
                          else if (t.type === 'match_pairs') setInstruction('Match the words on the left with their translations:');
                          else if (t.type === 'word_order') setInstruction('Unscramble the words to assemble a natural sentence:');
                          else if (t.type === 'flashcards') setInstruction('Review and memorize the vocabulary cards:');
                          else if (t.type === 'quiz') setInstruction('Select the single correct answer:');
                          else if (t.type === 'media_rule') setInstruction('Study the rule and answer the speaking questions:');
                        }}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: isSelected ? `2px solid ${t.color}` : '1.5px solid var(--border-subtle)',
                          background: isSelected ? t.bgSubtle : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                        }}
                      >
                        <span style={{ fontSize: '22px' }}>{t.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                            {t.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t.tag}
                          </div>
                        </div>
                        {isSelected && <Check size={16} color={t.color} strokeWidth={3} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Student Instruction Input */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '16px',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'var(--text-light)',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    letterSpacing: '0.04em',
                  }}
                >
                  Инструкция для студента
                </label>
                <textarea
                  rows={2}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  style={{
                    width: '100%',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-subtle)',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Score weight pills */}
                <div style={{ marginTop: '14px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: 'var(--text-light)',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    Баллов за упражнение
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5, 10].map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setScoreWeight(pts);
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          borderRadius: '8px',
                          border: scoreWeight === pts ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                          background: scoreWeight === pts ? 'var(--primary)' : '#f8fafc',
                          color: scoreWeight === pts ? '#ffffff' : 'var(--text-main)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {pts}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Private Teacher Note */}
              <div
                style={{
                  background: 'var(--teacher-bg)',
                  border: '1.5px dashed var(--teacher-border)',
                  borderRadius: '14px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Lock size={14} color="var(--teacher-text)" />
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--teacher-text)', textTransform: 'uppercase' }}>
                    Заметка для учителя
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={teacherNote}
                  onChange={(e) => setTeacherNote(e.target.value)}
                  placeholder="Методическая подсказка, видная только вам во время урока..."
                  style={{
                    width: '100%',
                    fontFamily: 'inherit',
                    fontSize: '12.5px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--teacher-border)',
                    background: '#ffffff',
                    color: 'var(--text-main)',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {/* Column 2: Center Visual Content Builder */}
          {viewMode !== 'preview' && (
            <div
              style={{
                flex: viewMode === 'split' ? 1 : 2,
                overflowY: 'auto',
                padding: '28px 32px',
                background: '#ffffff',
                borderRight: viewMode === 'split' ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              {/* Type 1: Fill in Blanks Studio */}
              {selectedType === 'fill_blanks' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        Конструктор пропусков в тексте
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        Создайте предложения с интерактивными полями ввода или выбора для ученика.
                      </p>
                    </div>

                    {/* Visual vs Raw text mode toggle */}
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
                      <button
                        onClick={() => setFillMode('visual')}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: fillMode === 'visual' ? '#ffffff' : 'transparent',
                          color: fillMode === 'visual' ? 'var(--primary)' : 'var(--text-muted)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Визуальные карточки
                      </button>
                      <button
                        onClick={() => setFillMode('text')}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: fillMode === 'text' ? '#ffffff' : 'transparent',
                          color: fillMode === 'text' ? 'var(--primary)' : 'var(--text-muted)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Быстрый текст
                      </button>
                    </div>
                  </div>

                  {fillMode === 'visual' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {blankItems.map((item, idx) => (
                        <div
                          key={item.id}
                          style={{
                            background: '#f8fafc',
                            border: '1.5px solid var(--border-subtle)',
                            borderRadius: '14px',
                            padding: '16px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            transition: 'border-color 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  background: 'var(--primary-subtle)',
                                  color: 'var(--primary)',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                }}
                              >
                                {idx + 1}
                              </span>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                                Предложение с пропуском
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {/* Audio pronounce button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const fullText = `${item.prefixText} ${item.correctAnswer} ${item.suffixText}`;
                                  speakEnglish(fullText);
                                }}
                                style={{
                                  border: 'none',
                                  background: '#e0e7ff',
                                  color: 'var(--primary)',
                                  borderRadius: '8px',
                                  padding: '5px 10px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                                title="Прослушать предложение"
                              >
                                <Volume2 size={14} />
                                Озвучить
                              </button>

                              {blankItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    sound.playClick();
                                    setBlankItems(blankItems.filter((_, i) => i !== idx));
                                  }}
                                  style={{
                                    border: 'none',
                                    background: '#fee2e2',
                                    color: 'var(--error)',
                                    borderRadius: '8px',
                                    padding: '5px 8px',
                                    cursor: 'pointer',
                                  }}
                                  title="Удалить предложение"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 4 segment inline inputs: prefix -> GAP ANSWER -> HINT -> suffix */}
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 2fr', gap: '10px' }}>
                            <div>
                              <label style={subLabelStyle}>Текст до пропуска</label>
                              <input
                                type="text"
                                value={item.prefixText}
                                onChange={(e) => {
                                  const updated = [...blankItems];
                                  updated[idx].prefixText = e.target.value;
                                  setBlankItems(updated);
                                }}
                                placeholder="She usually..."
                                style={fieldInputStyle}
                              />
                            </div>

                            <div>
                              <label style={{ ...subLabelStyle, color: 'var(--primary)', fontWeight: 800 }}>
                                ★ Ответ (пропуск)
                              </label>
                              <input
                                type="text"
                                value={item.correctAnswer}
                                onChange={(e) => {
                                  const updated = [...blankItems];
                                  updated[idx].correctAnswer = e.target.value;
                                  setBlankItems(updated);
                                }}
                                placeholder="drinks"
                                style={{
                                  ...fieldInputStyle,
                                  border: '2px solid var(--primary)',
                                  background: '#ffffff',
                                  fontWeight: 700,
                                }}
                              />
                            </div>

                            <div>
                              <label style={subLabelStyle}>Подсказка в скобках</label>
                              <input
                                type="text"
                                value={item.hint}
                                onChange={(e) => {
                                  const updated = [...blankItems];
                                  updated[idx].hint = e.target.value;
                                  setBlankItems(updated);
                                }}
                                placeholder="drink"
                                style={fieldInputStyle}
                              />
                            </div>

                            <div>
                              <label style={subLabelStyle}>Текст после пропуска</label>
                              <input
                                type="text"
                                value={item.suffixText}
                                onChange={(e) => {
                                  const updated = [...blankItems];
                                  updated[idx].suffixText = e.target.value;
                                  setBlankItems(updated);
                                }}
                                placeholder="coffee every morning."
                                style={fieldInputStyle}
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setBlankItems([
                            ...blankItems,
                            {
                              id: `b-${Date.now()}`,
                              prefixText: `${blankItems.length + 1}. `,
                              correctAnswer: 'answer',
                              hint: 'hint',
                              suffixText: '.',
                            },
                          ]);
                        }}
                        style={addButtonStyle}
                      >
                        <Plus size={16} />
                        Добавить следующее предложение
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '10px',
                        }}
                      >
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Используйте синтаксис: <code>Текст [ответ] (подсказка) текст</code>
                        </span>
                        <button
                          type="button"
                          onClick={handleWrapSelectedAsGap}
                          style={{
                            border: 'none',
                            background: 'var(--primary-subtle)',
                            color: 'var(--primary)',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Sparkles size={14} />
                          + Пример предложения
                        </button>
                      </div>

                      <textarea
                        rows={8}
                        value={blankLinesRaw}
                        onChange={(e) => setBlankLinesRaw(e.target.value)}
                        style={{
                          width: '100%',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '13.5px',
                          padding: '14px',
                          borderRadius: '12px',
                          border: '1.5px solid var(--border-strong)',
                          lineHeight: 1.6,
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Type 2: Match Pairs Studio */}
              {selectedType === 'match_pairs' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      Конструктор пар слов и фраз
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      Ученик будет соединять левый английский элемент с правым русским переводом или определением.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {pairs.map((p, idx) => (
                      <div
                        key={p.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto 1fr auto',
                          gap: '12px',
                          alignItems: 'center',
                          background: '#f8fafc',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {/* Left term with speech button */}
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            value={p.left}
                            onChange={(e) => {
                              const updated = [...pairs];
                              updated[idx].left = e.target.value;
                              setPairs(updated);
                            }}
                            placeholder="English word / phrase"
                            style={{
                              ...fieldInputStyle,
                              paddingRight: '36px',
                              fontWeight: 600,
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => speakEnglish(p.left)}
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--primary)',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Произнести"
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>

                        {/* Connector arrow */}
                        <div
                          style={{
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ArrowRight size={18} />
                        </div>

                        {/* Right translation */}
                        <div>
                          <input
                            type="text"
                            value={p.right}
                            onChange={(e) => {
                              const updated = [...pairs];
                              updated[idx].right = e.target.value;
                              setPairs(updated);
                            }}
                            placeholder="Перевод или определение"
                            style={fieldInputStyle}
                          />
                        </div>

                        {/* Delete button */}
                        {pairs.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setPairs(pairs.filter((_, i) => i !== idx));
                            }}
                            style={{
                              border: 'none',
                              background: '#fee2e2',
                              color: 'var(--error)',
                              borderRadius: '8px',
                              padding: '8px',
                              cursor: 'pointer',
                            }}
                            title="Удалить пару"
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : (
                          <div style={{ width: '31px' }} />
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setPairs([...pairs, { id: `p-${Date.now()}`, left: '', right: '' }]);
                      }}
                      style={addButtonStyle}
                    >
                      <Plus size={16} />
                      Добавить пару слов
                    </button>
                  </div>
                </div>
              )}

              {/* Type 3: Word Order Studio */}
              {selectedType === 'word_order' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      Конструктор порядка слов (Unscramble)
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      Введите правильное английское предложение. Система автоматически разобьет его на интерактивные плашки.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={subLabelStyle}>Целевое предложение (Правильный порядок слов)</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={targetSentence}
                          onChange={(e) => setTargetSentence(e.target.value)}
                          placeholder="Could you please tell me where the departure gate is?"
                          style={{
                            ...fieldInputStyle,
                            fontSize: '15px',
                            fontWeight: 600,
                            paddingRight: '40px',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => speakEnglish(targetSentence)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                          }}
                          title="Озвучить все предложение"
                        >
                          <Volume2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Word chips preview */}
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '16px',
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>
                        Автоматически сформированные плашки:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {targetSentence
                          .trim()
                          .split(/\s+/)
                          .map((word, i) => (
                            <span
                              key={i}
                              style={{
                                background: '#ffffff',
                                border: '1.5px solid var(--border-strong)',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: 'var(--text-main)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                              }}
                            >
                              {word}
                            </span>
                          ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={subLabelStyle}>Лишние слова / дистракторы (через запятую)</label>
                        <input
                          type="text"
                          value={distractors}
                          onChange={(e) => setDistractors(e.target.value)}
                          placeholder="did, was, been (опционально)"
                          style={fieldInputStyle}
                        />
                      </div>

                      <div>
                        <label style={subLabelStyle}>Подсказка ученику</label>
                        <input
                          type="text"
                          value={hint}
                          onChange={(e) => setHint(e.target.value)}
                          placeholder="Start with 'Could you'..."
                          style={fieldInputStyle}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Type 4: Flashcards Studio */}
              {selectedType === 'flashcards' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      Конструктор карточек со словами (Flashcards 3D)
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      Создавайте карточки с транскрипцией, контекстом и озвучкой для интервального повторения.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {cards.map((c, idx) => (
                      <div
                        key={c.id}
                        style={{
                          background: '#f8fafc',
                          border: '1.5px solid var(--border-subtle)',
                          borderRadius: '14px',
                          padding: '16px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>
                            Карточка #{idx + 1}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => speakEnglish(c.term)}
                              style={{
                                border: 'none',
                                background: '#e0e7ff',
                                color: 'var(--primary)',
                                borderRadius: '8px',
                                padding: '5px 10px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Volume2 size={14} />
                              Озвучить слово
                            </button>

                            {cards.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playClick();
                                  setCards(cards.filter((_, i) => i !== idx));
                                }}
                                style={{
                                  border: 'none',
                                  background: '#fee2e2',
                                  color: 'var(--error)',
                                  borderRadius: '8px',
                                  padding: '5px 8px',
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.5fr', gap: '12px' }}>
                          <div>
                            <label style={subLabelStyle}>Слово (English)</label>
                            <input
                              type="text"
                              value={c.term}
                              onChange={(e) => {
                                const updated = [...cards];
                                updated[idx].term = e.target.value;
                                setCards(updated);
                              }}
                              placeholder="boarding"
                              style={{ ...fieldInputStyle, fontWeight: 700 }}
                            />
                          </div>

                          <div>
                            <label style={subLabelStyle}>Транскрипция IPA</label>
                            <input
                              type="text"
                              value={c.transcription}
                              onChange={(e) => {
                                const updated = [...cards];
                                updated[idx].transcription = e.target.value;
                                setCards(updated);
                              }}
                              placeholder="/ˈbɔːdɪŋ/"
                              style={fieldInputStyle}
                            />
                          </div>

                          <div>
                            <label style={subLabelStyle}>Перевод на русский</label>
                            <input
                              type="text"
                              value={c.translation}
                              onChange={(e) => {
                                const updated = [...cards];
                                updated[idx].translation = e.target.value;
                                setCards(updated);
                              }}
                              placeholder="посадка на самолет"
                              style={fieldInputStyle}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={subLabelStyle}>Пример использования в предложении</label>
                          <input
                            type="text"
                            value={c.example}
                            onChange={(e) => {
                              const updated = [...cards];
                              updated[idx].example = e.target.value;
                              setCards(updated);
                            }}
                            placeholder="Boarding for flight 204 will commence at gate 12."
                            style={fieldInputStyle}
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setCards([
                          ...cards,
                          {
                            id: `c-${Date.now()}`,
                            term: '',
                            transcription: '//',
                            translation: '',
                            example: '',
                          },
                        ]);
                      }}
                      style={addButtonStyle}
                    >
                      <Plus size={16} />
                      Добавить карточку слова
                    </button>
                  </div>
                </div>
              )}

              {/* Type 5: Quiz Studio */}
              {selectedType === 'quiz' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      Конструктор теста с выбором ответа (Multiple Choice)
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      Введите вопрос и варианты ответов. Отметьте радио-кнопкой правильный вариант.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                      <label style={subLabelStyle}>Текст вопроса / незавершенная фраза</label>
                      <input
                        type="text"
                        value={quizQuestion}
                        onChange={(e) => setQuizQuestion(e.target.value)}
                        placeholder="She wouldn't have missed the flight if she _____ earlier."
                        style={{ ...fieldInputStyle, fontSize: '15px', fontWeight: 600 }}
                      />
                    </div>

                    <div>
                      <label style={subLabelStyle}>Варианты ответов (отметьте верный):</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {quizOptions.map((opt, idx) => {
                          const isCorrect = correctOptionIdx === idx;
                          const letter = String.fromCharCode(65 + idx);
                          return (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: isCorrect ? 'var(--success-subtle)' : '#f8fafc',
                                border: isCorrect ? '2px solid var(--success)' : '1px solid var(--border-subtle)',
                                borderRadius: '12px',
                                padding: '10px 14px',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playClick();
                                  setCorrectOptionIdx(idx);
                                }}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  border: isCorrect ? 'none' : '2px solid var(--border-strong)',
                                  background: isCorrect ? 'var(--success)' : '#ffffff',
                                  color: isCorrect ? '#ffffff' : 'var(--text-main)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                }}
                              >
                                {isCorrect ? <Check size={16} strokeWidth={3} /> : letter}
                              </button>

                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const updated = [...quizOptions];
                                  updated[idx] = e.target.value;
                                  setQuizOptions(updated);
                                }}
                                placeholder={`Вариант ${letter}...`}
                                style={{
                                  ...fieldInputStyle,
                                  background: '#ffffff',
                                  fontWeight: isCorrect ? 700 : 500,
                                }}
                              />

                              {isCorrect && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    color: 'var(--success-text)',
                                    background: 'var(--success-border)',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  Правильный ответ
                                </span>
                              )}

                              {quizOptions.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    sound.playClick();
                                    const updated = quizOptions.filter((_, i) => i !== idx);
                                    setQuizOptions(updated);
                                    if (correctOptionIdx >= updated.length) {
                                      setCorrectOptionIdx(0);
                                    }
                                  }}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'var(--text-light)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                  }}
                                  title="Удалить вариант"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {quizOptions.length < 6 && (
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setQuizOptions([...quizOptions, `Option ${quizOptions.length + 1}`]);
                          }}
                          style={{ ...addButtonStyle, marginTop: '10px' }}
                        >
                          <Plus size={16} />
                          Добавить вариант ответа
                        </button>
                      )}
                    </div>

                    <div>
                      <label style={subLabelStyle}>Грамматическое пояснение (показывается при разборе ошибки)</label>
                      <textarea
                        rows={2}
                        value={quizExplanation}
                        onChange={(e) => setQuizExplanation(e.target.value)}
                        placeholder="Third Conditional: If + Past Perfect, would have + V3..."
                        style={{
                          ...fieldInputStyle,
                          resize: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Type 6: Rule & Audio Studio */}
              {selectedType === 'media_rule' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      Конструктор правила и аудирования (Rule & Audio)
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      Теоретический блок с синтезом речи и разговорными вопросами для отработки вслух.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={subLabelStyle}>Заголовок грамматического правила</label>
                      <input
                        type="text"
                        value={ruleTitle}
                        onChange={(e) => setRuleTitle(e.target.value)}
                        placeholder="Present Perfect vs Past Simple..."
                        style={{ ...fieldInputStyle, fontSize: '15px', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={subLabelStyle}>Содержание правила (форматирование текстом)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <select
                            value={speechAccent}
                            onChange={(e) => setSpeechAccent(e.target.value as any)}
                            style={{
                              fontSize: '12px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <option value="en-GB">🇬🇧 British Voice</option>
                            <option value="en-US">🇺🇸 American Voice</option>
                          </select>

                          <select
                            value={speechSpeed}
                            onChange={(e) => setSpeechSpeed(Number(e.target.value))}
                            style={{
                              fontSize: '12px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <option value={0.8}>0.8x Скорость</option>
                            <option value={1.0}>1.0x Скорость</option>
                            <option value={1.2}>1.2x Скорость</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => speakEnglish(ruleContent, speechAccent, speechSpeed)}
                            style={{
                              border: 'none',
                              background: 'var(--primary-subtle)',
                              color: 'var(--primary)',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Volume2 size={13} />
                            Тест звука
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={6}
                        value={ruleContent}
                        onChange={(e) => setRuleContent(e.target.value)}
                        placeholder="Объяснение формулы, примеры употребления, маркеры времени..."
                        style={{
                          ...fieldInputStyle,
                          lineHeight: 1.5,
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>

                    <div>
                      <label style={subLabelStyle}>Вопросы для обсуждения (Speaking Discussion Prompts)</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {prompts.map((p, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: 700, width: '20px' }}>
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={p}
                              onChange={(e) => {
                                const updated = [...prompts];
                                updated[idx] = e.target.value;
                                setPrompts(updated);
                              }}
                              placeholder="Have you ever lost something valuable while travelling?"
                              style={fieldInputStyle}
                            />
                            {prompts.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playClick();
                                  setPrompts(prompts.filter((_, i) => i !== idx));
                                }}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: 'var(--text-light)',
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setPrompts([...prompts, '']);
                          }}
                          style={addButtonStyle}
                        >
                          <Plus size={16} />
                          Добавить вопрос для Speaking
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Column 3: Real Interactive Student Simulator (Visible in split and preview modes) */}
          {viewMode !== 'editor' && (
            <div
              style={{
                flex: viewMode === 'split' ? 1 : 1,
                background: '#f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Simulator Header */}
              <div
                style={{
                  padding: '14px 20px',
                  background: '#ffffff',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={16} color="var(--primary)" />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>
                    Интерактивный вид ученика
                  </span>
                  <span
                    style={{
                      background: 'var(--success-subtle)',
                      color: 'var(--success)',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    {scoreWeight} {scoreWeight === 1 ? 'балл' : scoreWeight < 5 ? 'балла' : 'баллов'}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                  Обновляется в реальном времени при вводе
                </div>
              </div>

              {/* Live Preview Exercise Engine Container */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {/* Simulated Exercise Header */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '20px',
                    borderRadius: '14px',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span
                      style={{
                        background: 'var(--primary-subtle)',
                        color: 'var(--primary)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      {currentPreviewExercise.type}
                    </span>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                      {currentPreviewExercise.title}
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                    {currentPreviewExercise.instruction}
                  </p>
                </div>

                {/* Simulated Interactive Engine Body */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '24px',
                    borderRadius: '14px',
                    boxShadow: 'var(--shadow-card)',
                    minHeight: '260px',
                  }}
                >
                  {selectedType === 'fill_blanks' && (
                    <FillInBlanksExercise
                      key={JSON.stringify(currentPreviewExercise.data)}
                      data={currentPreviewExercise.data as FillBlanksData}
                    />
                  )}

                  {selectedType === 'match_pairs' && (
                    <MatchPairsExercise
                      key={JSON.stringify(currentPreviewExercise.data)}
                      data={currentPreviewExercise.data as MatchPairsData}
                    />
                  )}

                  {selectedType === 'word_order' && (
                    <WordOrderExercise
                      key={JSON.stringify(currentPreviewExercise.data)}
                      data={currentPreviewExercise.data as WordOrderData}
                    />
                  )}

                  {selectedType === 'flashcards' && (
                    <FlashcardsExercise
                      key={JSON.stringify(currentPreviewExercise.data)}
                      data={currentPreviewExercise.data as FlashcardsData}
                    />
                  )}

                  {selectedType === 'quiz' && (
                    <QuizExercise
                      key={JSON.stringify(currentPreviewExercise.data)}
                      data={currentPreviewExercise.data as QuizData}
                    />
                  )}

                  {selectedType === 'media_rule' && (
                    <MediaRuleExercise
                      key={JSON.stringify(currentPreviewExercise.data)}
                      data={currentPreviewExercise.data as MediaRuleData}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Action Footer Bar */}
        <footer
          style={{
            height: '68px',
            padding: '0 28px',
            background: '#ffffff',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'var(--text-muted)',
              }}
            >
              Тип: <strong style={{ color: 'var(--text-main)' }}>{EXERCISE_TYPES.find((t) => t.type === selectedType)?.title}</strong>
            </span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Вес: <strong style={{ color: 'var(--primary)' }}>{scoreWeight} б.</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ padding: '9px 18px' }}
            >
              Отмена
            </button>

            <button
              type="button"
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <CheckCircle2 size={16} />
              {exerciseToEdit ? 'Сохранить изменения' : 'Сохранить и добавить в урок'}
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};

// Reusable micro-styles
const subLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const fieldInputStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: 'inherit',
  fontSize: '13.5px',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1.5px solid var(--border-strong)',
  background: '#ffffff',
  color: 'var(--text-main)',
  outline: 'none',
  boxSizing: 'border-box',
};

const addButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  borderRadius: '10px',
  border: '1.5px dashed var(--primary-border)',
  background: 'var(--primary-subtle)',
  color: 'var(--primary)',
  fontWeight: 700,
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};
