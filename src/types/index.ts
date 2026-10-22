export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type UserRole = 'teacher' | 'student';

export type ExerciseType = 
  | 'fill_blanks' 
  | 'match_pairs' 
  | 'word_order' 
  | 'flashcards' 
  | 'quiz' 
  | 'media_rule';

export interface VocabWord {
  id: string;
  term: string;
  transcription: string;
  translation: string;
  partOfSpeech: string;
  contextSentence?: string;
}

export interface BlankItem {
  id: string;
  prefixText: string;
  correctAnswer: string;
  options?: string[]; // Multiple choice dropdown if applicable
  hint?: string;
  suffixText: string;
}

export interface FillBlanksData {
  items: BlankItem[];
}

export interface MatchPairItem {
  id: string;
  leftText: string;
  rightText: string;
}

export interface MatchPairsData {
  pairs: MatchPairItem[];
}

export interface WordOrderItem {
  id: string;
  targetSentence: string;
  shuffledWords: string[];
  distractors?: string[];
  hint?: string;
}

export interface WordOrderData {
  items: WordOrderItem[];
}

export interface FlashcardItem {
  id: string;
  term: string;
  transcription: string;
  translation: string;
  definitionEn?: string;
  exampleSentence: string;
  imageUrl?: string;
}

export interface FlashcardsData {
  cards: FlashcardItem[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface QuizData {
  questions: QuizQuestion[];
}

export interface MediaRuleData {
  ruleTitle: string;
  markdownContent: string;
  audioUrl?: string;
  discussionPrompts?: string[];
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  title: string;
  instruction: string;
  scoreWeight: number;
  data: 
    | FillBlanksData 
    | MatchPairsData 
    | WordOrderData 
    | FlashcardsData 
    | QuizData 
    | MediaRuleData;
  teacherNote?: string;
}

export interface LessonSection {
  id: string;
  sectionNumber: number;
  title: string;
  subtitle: string;
  exercises: Exercise[];
  isCompleted?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  unitNumber: number;
  level: CEFRLevel;
  topic: string;
  description: string;
  vocabulary: VocabWord[];
  sections: LessonSection[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgress {
  lessonId: string;
  activeSectionId: string;
  completedSectionIds: string[];
  userAnswers: Record<string, any>;
  exerciseScores: Record<string, number>;
  totalScore: number;
  maxScore: number;
}

export interface Student {
  id: string;
  name: string;
  avatarUrl?: string;
  email: string;
  level: CEFRLevel;
  lessonBalance: number;
  totalLessonsCompleted: number;
  notes?: string;
  currentLessonId?: string;
  homeworkStatus?: 'assigned' | 'submitted' | 'checked' | 'none';
}

export interface ScheduleEvent {
  id: string;
  studentId: string;
  studentName: string;
  lessonId: string;
  lessonTitle: string;
  dayOfWeek: string;
  time: string; // e.g. "14:00 - 15:00"
  status: 'upcoming' | 'completed' | 'cancelled';
  dateStr: string; // e.g. "2026-10-24"
}

export interface HomeworkSubmission {
  id: string;
  lessonId: string;
  lessonTitle: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  scorePercent: number;
  status: 'pending_review' | 'reviewed';
  studentComment?: string;
  teacherFeedback?: string;
  exerciseResults: {
    exerciseId: string;
    exerciseTitle: string;
    score: number;
    maxScore: number;
  }[];
}

export interface ChatMessage {
  id: string;
  senderRole: UserRole;
  senderName: string;
  text: string;
  timestamp: string;
  isCorrection?: boolean;
}

export interface WhiteboardNote {
  id: string;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple';
  title?: string;
  text: string;
  createdAt: string;
}
