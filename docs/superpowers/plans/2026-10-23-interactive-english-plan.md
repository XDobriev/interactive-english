# Interactive English Studio Implementation Plan

> **Goal:** Build a production-grade, aesthetically stunning ProgressMe alternative for English teachers with an interactive classroom, 6 exercise engines, teacher notes, vocabulary audio, and a visual lesson builder.

**Architecture:** Single Page Application on React 18 + TypeScript + Vite + Tailwind CSS. Multi-tab / network synchronization via BroadcastChannel & LocalStorage. Procedural Web Audio API sound effects and Web Speech API pronunciation.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Canvas Confetti.

---

### Task 1: Project Scaffolding & Setup
- Initialize Vite React TypeScript project.
- Install dependencies: `lucide-react`, `canvas-confetti`, `@types/canvas-confetti`, `clsx`, `tailwind-merge`.
- Configure Tailwind CSS with custom font tokens (`Plus Jakarta Sans`, `Inter`, `Fira Code`) and curated color palette.
- Setup audio synthesis utility (`soundEffects.ts`) and Speech Synthesis helper (`speech.ts`).

### Task 2: Data Models & Mock Curriculum
- Define TypeScript types: `Lesson`, `Section`, `Exercise`, `ExerciseType`, `FillInBlanksData`, `MatchPairsData`, `WordOrderData`, `FlashcardData`, `QuizData`, `MediaRuleData`, `VocabWord`, `StudentState`.
- Create rich initial curriculum:
  - Unit 1: A2 Food & Ordering in a Café
  - Unit 2: B1 Travel Dilemmas & Lost Luggage
  - Unit 3: B2 Job Interview & Business Collocations

### Task 3: Interactive Exercise Engines
- `FillInBlanksExercise.tsx`: Inline inputs, bracket syntax parser, auto-check, case-insensitive matching, hints.
- `MatchPairsExercise.tsx`: Two-column interactive matching cards, line connection/highlights, sound effects.
- `WordOrderExercise.tsx`: Clickable & draggable word chips, dropzone, sentence reconstruction.
- `FlashcardsExercise.tsx`: 3D flip card animation, audio pronunciation, definition, example, mastered/review status.
- `QuizExercise.tsx`: Single & multi-select quiz with immediate feedback and grammar explanations.
- `MediaRuleExercise.tsx`: Markdown rule explanation card with audio player and discussion prompt.

### Task 4: Virtual Classroom Runner & Teacher Tools
- `ClassroomTopBar.tsx`: Role switcher, presence status, answer reveal toggle, timer, finish lesson action.
- `LessonSidebar.tsx`: Step-by-step progress list, section completion checks.
- `VocabularySidebar.tsx`: Pronunciation buttons, definition list, "+ Add word" modal.
- `TeacherNote.tsx`: Collapsible private teacher note with pedagogical instructions.
- Real-time synchronization layer: `useRealtimeSync` hook with BroadcastChannel.

### Task 5: Lesson Builder (Конструктор уроков)
- `LessonBuilder.tsx`: Visual interface to create, edit, duplicate, and delete lessons.
- Block addition modal: Choose exercise type, enter prompt and text.
- Export / Import JSON for backup and sharing.

### Task 6: Teacher Dashboard & Student Portal
- Course overview with CEFR badges (A1-C1).
- Lesson cards with "Launch Class" (as teacher or student).
- Integration test and verification via Playwright browser subagent.
