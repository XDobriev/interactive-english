import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ListOrdered, Layers, BookOpen } from 'lucide-react';
import type {
  FillBlanksData,
  FlashcardsData,
  Lesson,
  MatchPairsData,
  MediaRuleData,
  QuizData,
  UserRole,
  VocabWord,
  WordOrderData,
} from '../../types';
import { ClassroomTopBar } from './ClassroomTopBar';
import { LessonSidebar } from './LessonSidebar';
import { VocabularySidebar } from './VocabularySidebar';
import { ClassroomTimer } from './ClassroomTimer';
import { ClassroomWhiteboard } from './ClassroomWhiteboard';
import { ClassroomChat } from './ClassroomChat';
import { ClassroomAIAssistant } from './ClassroomAIAssistant';
import { TeacherNote } from '../TeacherNote';
import { FillInBlanksExercise } from '../exercises/FillInBlanksExercise';
import { MatchPairsExercise } from '../exercises/MatchPairsExercise';
import { WordOrderExercise } from '../exercises/WordOrderExercise';
import { FlashcardsExercise } from '../exercises/FlashcardsExercise';
import { QuizExercise } from '../exercises/QuizExercise';
import { MediaRuleExercise } from '../exercises/MediaRuleExercise';
import { syncPost, syncSubscribe } from '../../services/syncChannel';
import { sound } from '../../utils/audio';

interface ClassroomRunnerProps {
  lesson: Lesson;
  initialRole?: UserRole;
  studentName?: string;
  onBackToDashboard: () => void;
  onUpdateLesson: (updated: Lesson) => void;
}

type LessonSyncEvent =
  | { type: 'CHANGE_SECTION'; sectionId: string }
  | { type: 'TOGGLE_ANSWERS'; showAnswers: boolean };

export const ClassroomRunner: React.FC<ClassroomRunnerProps> = ({
  lesson,
  initialRole = 'teacher',
  studentName = 'Анна',
  onBackToDashboard,
  onUpdateLesson,
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    lesson.sections[0]?.id || ''
  );
  const [mobileTab, setMobileTab] = useState<'stage' | 'plan' | 'vocab'>('stage');
  const [showAnswers, setShowAnswers] = useState(false);
  const [completedSectionIds, setCompletedSectionIds] = useState<string[]>([]);
  const [lessonVocabulary, setLessonVocabulary] = useState<VocabWord[]>(lesson.vocabulary);

  // Classroom Tool Drawers
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  // Real-time sync between the teacher and student views (other tabs, or other devices via the relay)
  useEffect(
    () =>
      syncSubscribe<LessonSyncEvent>(`lesson-sync-${lesson.id}`, (data) => {
        if (data.type === 'CHANGE_SECTION') {
          setActiveSectionId(data.sectionId);
        } else if (data.type === 'TOGGLE_ANSWERS') {
          setShowAnswers(data.showAnswers);
        }
      }),
    [lesson.id]
  );

  const broadcastEvent = (eventData: LessonSyncEvent) => syncPost(`lesson-sync-${lesson.id}`, eventData);

  const handleSelectSection = (sectionId: string) => {
    sound.playClick();
    setActiveSectionId(sectionId);
    setShowAnswers(false);
    setMobileTab('stage');
    broadcastEvent({ type: 'CHANGE_SECTION', sectionId });
  };

  const handleToggleShowAnswers = () => {
    sound.playClick();
    const nextState = !showAnswers;
    setShowAnswers(nextState);
    broadcastEvent({ type: 'TOGGLE_ANSWERS', showAnswers: nextState });
  };

  const handleAddWord = (newWord: VocabWord) => {
    const updatedVocab = [...lessonVocabulary, newWord];
    setLessonVocabulary(updatedVocab);
    onUpdateLesson({
      ...lesson,
      vocabulary: updatedVocab,
    });
  };

  const handleFinishLesson = () => {
    sound.playLessonComplete();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
    alert(`🎉 Поздравляем! Урок "${lesson.title}" успешно пройден.`);
  };

  const activeSection = lesson.sections.find((s) => s.id === activeSectionId) || lesson.sections[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-page)', position: 'relative' }}>
      
      {/* Top Header */}
      <ClassroomTopBar
        lessonTitle={lesson.title}
        level={lesson.level}
        role={role}
        studentName={studentName}
        onRoleChange={setRole}
        showAnswers={showAnswers}
        onToggleShowAnswers={handleToggleShowAnswers}
        onBackToDashboard={onBackToDashboard}
        onFinishLesson={handleFinishLesson}
        isTimerOpen={isTimerOpen}
        onToggleTimer={() => setIsTimerOpen(!isTimerOpen)}
        isWhiteboardOpen={isWhiteboardOpen}
        onToggleWhiteboard={() => {
          setIsWhiteboardOpen(!isWhiteboardOpen);
          if (isChatOpen) setIsChatOpen(false);
        }}
        isChatOpen={isChatOpen}
        onToggleChat={() => {
          setIsChatOpen(!isChatOpen);
          if (isWhiteboardOpen) setIsWhiteboardOpen(false);
        }}
        isAiAssistantOpen={isAiAssistantOpen}
        onToggleAiAssistant={() => setIsAiAssistantOpen(!isAiAssistantOpen)}
        lessonId={lesson.id}
      />

      {/* Floating Timer Widget */}
      {isTimerOpen && (
        <div style={{ position: 'fixed', top: '72px', left: '280px', zIndex: 120 }}>
          <ClassroomTimer
            onClose={() => setIsTimerOpen(false)}
            broadcastChannelName={`timer-channel-${lesson.id}`}
            isTeacher={role === 'teacher'}
          />
        </div>
      )}

      {/* Whiteboard Sticky Drawer */}
      {isWhiteboardOpen && (
        <ClassroomWhiteboard
          lessonId={lesson.id}
          isTeacher={role === 'teacher'}
          onClose={() => setIsWhiteboardOpen(false)}
        />
      )}

      {/* In-Class Live Chat */}
      {isChatOpen && (
        <ClassroomChat
          lessonId={lesson.id}
          role={role}
          userName={role === 'teacher' ? 'Преподаватель Анна' : 'Ученик'}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* In-Class Gemini AI Assistant */}
      {isAiAssistantOpen && (
        <ClassroomAIAssistant
          isOpen={isAiAssistantOpen}
          onClose={() => setIsAiAssistantOpen(false)}
          lessonTitle={lesson.title}
          topic={lesson.topic}
          level={lesson.level}
        />
      )}

      {/* Mobile/Tablet Sub-Navigation for switching views */}
      <div className="classroom-mobile-nav">
        <button
          className={`classroom-mobile-tab-btn ${mobileTab === 'plan' ? 'active' : ''}`}
          onClick={() => {
            sound.playClick();
            setMobileTab('plan');
          }}
        >
          <ListOrdered size={15} />
          <span>План ({lesson.sections.length})</span>
        </button>

        <button
          className={`classroom-mobile-tab-btn ${mobileTab === 'stage' ? 'active' : ''}`}
          onClick={() => {
            sound.playClick();
            setMobileTab('stage');
          }}
        >
          <Layers size={15} />
          <span>Урок ({activeSection?.sectionNumber || 1})</span>
        </button>

        <button
          className={`classroom-mobile-tab-btn ${mobileTab === 'vocab' ? 'active' : ''}`}
          onClick={() => {
            sound.playClick();
            setMobileTab('vocab');
          }}
        >
          <BookOpen size={15} />
          <span>Словарь ({lessonVocabulary.length})</span>
        </button>
      </div>

      {/* Main Classroom Grid */}
      <div className={`app-workspace classroom-workspace view-${mobileTab}`}>
        
        {/* Left Lesson Flow */}
        <div className={`workspace-col col-plan ${mobileTab === 'plan' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <LessonSidebar
            sections={lesson.sections}
            activeSectionId={activeSection?.id || ''}
            onSelectSection={handleSelectSection}
            completedSectionIds={completedSectionIds}
          />
        </div>

        {/* Center Main Stage */}
        <main
          className={`center-canvas animate-fade-in col-stage ${mobileTab === 'stage' ? 'mobile-visible' : 'mobile-hidden'}`}
          key={activeSection?.id}
        >

          
          {/* Section Banner */}
          {activeSection && (
            <div className="section-intro-card">
              <div className="section-stage-badge">
                Секция {activeSection.sectionNumber} из {lesson.sections.length}
              </div>
              <h1 className="section-main-title">{activeSection.title}</h1>
              <p className="section-main-desc">{activeSection.subtitle}</p>
            </div>
          )}

          {/* Exercises in Active Section */}
          {activeSection?.exercises.map((exercise, idx) => (
            <div key={exercise.id} className="exercise-box">
              <div className="box-header">
                <span className="box-tag">
                  Задание {idx + 1} • {getExerciseLabel(exercise.type)}
                </span>
                <span className="box-score">{exercise.scoreWeight} балла</span>
              </div>

              <div className="box-instruction">{exercise.instruction}</div>

              {/* Dynamic Exercise Body */}
              {exercise.type === 'fill_blanks' && (
                <FillInBlanksExercise
                  key={exercise.id}
                  data={exercise.data as FillBlanksData}
                  showAnswers={showAnswers}
                />
              )}

              {exercise.type === 'match_pairs' && (
                <MatchPairsExercise
                  key={exercise.id}
                  data={exercise.data as MatchPairsData}
                  showAnswers={showAnswers}
                />
              )}

              {exercise.type === 'word_order' && (
                <WordOrderExercise
                  key={exercise.id}
                  data={exercise.data as WordOrderData}
                  showAnswers={showAnswers}
                />
              )}

              {exercise.type === 'flashcards' && (
                <FlashcardsExercise
                  key={exercise.id}
                  data={exercise.data as FlashcardsData}
                />
              )}

              {exercise.type === 'quiz' && (
                <QuizExercise
                  data={exercise.data as QuizData}
                  showAnswers={showAnswers}
                />
              )}

              {exercise.type === 'media_rule' && (
                <MediaRuleExercise
                  data={exercise.data as MediaRuleData}
                />
              )}

              {/* Teacher Private Note */}
              <TeacherNote note={exercise.teacherNote} isTeacher={role === 'teacher'} />
            </div>
          ))}

          {/* Next Section Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', marginBottom: '40px' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '15px' }}
              onClick={() => {
                if (activeSection && !completedSectionIds.includes(activeSection.id)) {
                  setCompletedSectionIds([...completedSectionIds, activeSection.id]);
                }
                const currentIdx = lesson.sections.findIndex((s) => s.id === activeSection?.id);
                if (currentIdx < lesson.sections.length - 1) {
                  handleSelectSection(lesson.sections[currentIdx + 1].id);
                } else {
                  handleFinishLesson();
                }
              }}
            >
              Перейти к следующему этапу →
            </button>
          </div>

        </main>

        {/* Right Dictionary */}
        <div className={`workspace-col col-vocab ${mobileTab === 'vocab' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <VocabularySidebar
            vocabulary={lessonVocabulary}
            onAddWord={handleAddWord}
          />
        </div>

      </div>

    </div>
  );
};

function getExerciseLabel(type: string): string {
  switch (type) {
    case 'fill_blanks': return 'Fill in the blanks';
    case 'match_pairs': return 'Match pairs';
    case 'word_order': return 'Word order builder';
    case 'flashcards': return 'Vocabulary flashcards';
    case 'quiz': return 'Multiple choice quiz';
    case 'media_rule': return 'Rule & Audio';
    default: return 'Exercise';
  }
}
