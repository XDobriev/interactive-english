import React, { useState } from 'react';
import type { Exercise, ExerciseType, CEFRLevel } from '../../types';
import { sound } from '../../utils/audio';
import { generateExerciseWithGemini } from '../../services/gemini';
import {
  type ExerciseDraft,
  PRESETS,
  applyAiExercise,
  buildExercise,
  createDefaultDraft,
  draftFromExercise,
} from './exerciseDraft';
import { StudioHeader } from './StudioHeader';
import { AiPromptBar } from './AiPromptBar';
import { SettingsSidebar } from './SettingsSidebar';
import { LivePreviewPane } from './LivePreviewPane';
import { StudioFooter } from './StudioFooter';
import { FillBlanksForm } from './exercise-forms/FillBlanksForm';
import { MatchPairsForm } from './exercise-forms/MatchPairsForm';
import { WordOrderForm } from './exercise-forms/WordOrderForm';
import { FlashcardsForm } from './exercise-forms/FlashcardsForm';
import { QuizForm } from './exercise-forms/QuizForm';
import { MediaRuleForm } from './exercise-forms/MediaRuleForm';


interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercise: (exercise: Exercise) => void;
  exerciseToEdit?: Exercise | null;
}

/**
 * Mounts the studio only while open, so every opening starts from fresh state
 * (the exercise being edited, or defaults) without syncing props into state via effects.
 */
export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({ isOpen, ...rest }) => {
  if (!isOpen) return null;
  return <ExerciseStudio key={rest.exerciseToEdit?.id ?? 'new'} {...rest} />;
};

const ExerciseStudio: React.FC<Omit<AddExerciseModalProps, 'isOpen'>> = ({
  onClose,
  onAddExercise,
  exerciseToEdit,
}) => {
  // Mode: Editor only | Split 50/50 | Preview only
  const [viewMode, setViewMode] = useState<'editor' | 'split' | 'preview'>('split');
  const [draft, setDraft] = useState<ExerciseDraft>(() =>
    exerciseToEdit ? draftFromExercise(exerciseToEdit) : createDefaultDraft()
  );
  // Stable id for a new exercise so the live preview and the saved result agree
  const [newExerciseId] = useState(() => `ex-${Date.now()}`);
  const exerciseId = exerciseToEdit?.id ?? newExerciseId;

  const updateDraft = (patch: Partial<ExerciseDraft>) => setDraft((prev) => ({ ...prev, ...patch }));
  const { selectedType, title, instruction, scoreWeight, teacherNote } = draft;
  const setTitle = (value: string) => updateDraft({ title: value });
  const setInstruction = (value: string) => updateDraft({ instruction: value });
  const setScoreWeight = (value: number) => updateDraft({ scoreWeight: value });
  const setTeacherNote = (value: string) => updateDraft({ teacherNote: value });
  const setSelectedType = (value: ExerciseType) => updateDraft({ selectedType: value });

  // Gemini AI generation state
  const [showAiBar, setShowAiBar] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLevel, setAiLevel] = useState<CEFRLevel>('B1');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // ESL Ready-to-Use Activity Presets
  const handleLoadPreset = (presetKey: string) => {
    sound.playClick();
    const preset = PRESETS[presetKey];
    if (preset) updateDraft(preset);
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    setAiError(null);
    sound.playClick();
    try {
      const generated = await generateExerciseWithGemini(selectedType, aiPrompt.trim(), aiLevel);
      setDraft((prev) => applyAiExercise(prev, generated));
      sound.playCorrect();
      setShowAiBar(false);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Ошибка генерации Gemini AI');
      sound.playIncorrect();
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const currentPreviewExercise: Exercise = buildExercise(draft, exerciseId);

  const handleSave = () => {
    sound.playCorrect();
    onAddExercise(currentPreviewExercise);
    onClose();
  };

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
        <StudioHeader
          title={title}
          onTitleChange={setTitle}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showAiBar={showAiBar}
          onToggleAiBar={() => setShowAiBar(!showAiBar)}
          onLoadPreset={handleLoadPreset}
          onClose={onClose}
        />

        {/* Expandable Gemini AI Prompt Bar */}
        {showAiBar && (
          <AiPromptBar
            selectedType={selectedType}
            aiPrompt={aiPrompt}
            onPromptChange={setAiPrompt}
            aiLevel={aiLevel}
            onLevelChange={setAiLevel}
            isGenerating={isGeneratingAi}
            error={aiError}
            onGenerate={handleGenerateWithAI}
          />
        )}

        {/* Studio Body: Left Sidebar + Center Builder + Right Live Simulator */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Column 1: Exercise Types & Parameters (Visible in editor and split modes) */}
          {viewMode !== 'preview' && (
            <SettingsSidebar
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              instruction={instruction}
              onInstructionChange={setInstruction}
              scoreWeight={scoreWeight}
              onScoreWeightChange={setScoreWeight}
              teacherNote={teacherNote}
              onTeacherNoteChange={setTeacherNote}
            />
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
              {selectedType === 'fill_blanks' && <FillBlanksForm draft={draft} onChange={updateDraft} />}
              {selectedType === 'match_pairs' && <MatchPairsForm draft={draft} onChange={updateDraft} />}
              {selectedType === 'word_order' && <WordOrderForm draft={draft} onChange={updateDraft} />}
              {selectedType === 'flashcards' && <FlashcardsForm draft={draft} onChange={updateDraft} />}
              {selectedType === 'quiz' && <QuizForm draft={draft} onChange={updateDraft} />}
              {selectedType === 'media_rule' && <MediaRuleForm draft={draft} onChange={updateDraft} />}
            </div>
          )}

          {/* Column 3: Real Interactive Student Simulator (Visible in split and preview modes) */}
          {viewMode !== 'editor' && (
            <LivePreviewPane exercise={currentPreviewExercise} />
          )}

        </div>

        {/* Bottom Action Footer Bar */}
        <StudioFooter
          selectedType={selectedType}
          scoreWeight={scoreWeight}
          isEditing={!!exerciseToEdit}
          onCancel={onClose}
          onSave={handleSave}
        />

      </div>
    </div>
  );
};
