# Interactive English Studio — Design Specification

**Status:** Approved  
**Author:** Antigravity Agentic Studio  
**Target User:** English Language Teachers & Their Students (ProgressMe Alternative)  
**Date:** 2026-10-23  

---

## 1. Executive Summary & Product Vision

Interactive English Studio is a modern, high-craft web application designed as a standalone, zero-cost alternative to ProgressMe (Edvibe). It provides English language tutors and teachers with:
1. **Interactive Virtual Classroom:** Real-time synchronized lesson canvas with teacher controls, role switching, instant answer reveal, and private pedagogical notes.
2. **6 Native English Exercise Engines:** Fill-in-the-blanks, matching pairs, word order builder, 3D flip flashcards, multiple-choice quiz, and media/grammar rule blocks.
3. **Interactive Pronunciation & Vocabulary:** Built-in dictionary with IPA phonetic transcription, context examples, and native Web Speech API audio pronunciation.
4. **No-Code Lesson Builder:** Block-based intuitive editor to compose, edit, duplicate, and export custom curriculum without writing code.
5. **Pre-built Starter Curriculum:** Out-of-the-box comprehensive lessons for A2, B1, and B2 levels.

---

## 2. Information Architecture & Modes

### 2.1 Workspace Views
- **Dashboard / Materials Hub:** Course catalog, list of units by CEFR levels (A1, A2, B1, B2), student roster, and quick "Launch Class" action.
- **Virtual Classroom (Classroom Runner):**
  - **Left Rail (Lesson Outline):** Collapsible stage list (Warm-up, Vocabulary, Grammar, Practice, Speaking) with progress indicators.
  - **Center Stage (Exercise Canvas):** Active exercise cards, instructions, interactive inputs, validation buttons, and teacher notes.
  - **Right Rail (Personal Vocabulary):** Persistent lesson dictionary with instant audio speech playback and word-addition drawer.
  - **Top Navigation Bar:** Course metadata, student presence beacon, segmented role toggle (`[Teacher]` / `[Student]`), "Show Answers" action, and "End Lesson" summary.
- **Lesson Builder (Visual Editor):**
  - Section management (Add, delete, reorder stages).
  - Block palette: Add any of the 6 exercise types.
  - Inline syntax: simple bracket notation for gaps (e.g., `She [has visited] London`).
  - Private teacher note editor.

---

## 3. Design System & Aesthetics (EdTech Luxury)

- **Typography:**
  - Display / Headings: `Plus Jakarta Sans` (weights: 600, 700, 800)
  - UI / Body: `Inter` (weights: 400, 500, 600)
  - Phonetics / Code: `Fira Code` (weights: 400, 500)
- **Color Palette:**
  - Background: Crisp, fatigue-free `#f8fafc`
  - Cards & Surfaces: Pure `#ffffff` with subtle borders (`#e2e8f0`) and layered shadows (`0 4px 20px -2px rgba(15, 23, 42, 0.05)`)
  - Primary Accent: Electric Indigo `#4f46e5` / `#4338ca` (hover) / `#eef2ff` (subtle)
  - Teacher Mode & Notes: Warm Amber `#f59e0b` / `#fffbeb` (bg) / `#92400e` (text)
  - Validation Success: Emerald `#10b981` / `#ecfdf5` (bg) / `#065f46` (text)
  - Validation Error: Rose `#f43f5e` / `#fff1f2` (bg)
- **Audio Feedback:**
  - Native Web Audio API procedural sound synthesizer (soft pleasant chime on correct answers, subtle click on chip selection) — zero external MP3 dependencies.

---

## 4. Technical Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Custom CSS Variables for design tokens
- **Icons:** Lucide React (clean, consistent SVG icons)
- **Audio & Speech:** Web Speech API (`SpeechSynthesis`) + Web Audio API synthesizer
- **State & Storage:** LocalStorage-backed reactive state with export/import JSON + BroadcastChannel for multi-tab real-time sync between teacher and student windows.
