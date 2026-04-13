# Frontend Mastery — Autarch

## Tech Stack
- React 19, Vite, TypeScript (strict mode).
- Tailwind CSS v4, Lucide React, Framer Motion.
- Zustand for state management, `react-router-dom` for tab navigation.
- Monaco Editor + xterm.js for IDE mechanics.

## Guidelines
1. **Desktop-First:** Build for a pointer device, high-res displays, no mobile scaling needed. Focus on keyboard shortcuts and heavy interactions.
2. **Complex Layouts:** Use `react-resizable-panels` to emulate classic IDE splitter views.
3. **Performance First:** Do not trigger re-renders on every keystroke in Monaco or terminal output. Use refs and subscription-based updates where possible.
4. **Design:** True black dark-mode contexts, subtle borders, high-contrast typography, premium sleek feel.
