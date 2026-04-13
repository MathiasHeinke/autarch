---
name: cinematic-ui
description: "Design system creation (Stitch MCP), cinematic Framer Motion animations, and Remotion video production. The Jonah Jansen workflow."
version: 1.0.0
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [design, animation, video, stitch, framer-motion, remotion]
    category: autarch
    requires_toolsets: [terminal, file]
---

# 🎬 Cinematic UI — Design System + Motion + Video Protocol

## When to Use
- Creating or updating a design system (DESIGN.md)
- Making UI feel cinematic with Framer Motion
- Building product videos or pitch decks with Remotion
- Applying visual consistency through design tokens
- Any task where the output should be "showroom-ready"

## The Frontend Triad
```
Jobs (Vision) → "What should the user FEEL?"
Jonah (Direction) → "How does it LOOK and MOVE?"
Rauno (Craft) → "How is it BUILT and OPTIMIZED?"
```

## Procedure A: Design System (Stitch MCP)

### 1. Audit Current State
- Does a DESIGN.md exist? Read it.
- What design systems are in use? `list_design_systems`
- What screens exist? `list_screens`

### 2. Define Tokens
Create or update DESIGN.md:
```markdown
## Color Palette
- Primary: [Hex + HSL]
- Background: [Light / Dark modes]
- Surface, Accent, Text colors

## Typography
- Heading font, Body font, Mono font
- Size scale: 14, 16, 18, 20, 24, 30, 36, 48

## Shape
- Card radius, Button radius, Input radius

## Motion
- Entry spring config
- Hover/Tap micro-interaction specs
```

### 3. Apply via Stitch
```
create_design_system → Set tokens
generate_screen_from_text → Create screens
apply_design_system → Apply tokens to screens
generate_variants → Explore alternatives
```

### 4. Consistency Pass
- All colors from tokens? No hardcoded hex?
- All radii from system?
- Font sizes consistent with scale?
- Spacing on 4px grid?

## Procedure B: Cinematic UI (Framer Motion)

### 1. Motion Audit
- What transitions exist? Are they smooth?
- What's missing? Page transitions? Hover states?

### 2. Define Motion Specs
```
Entry: spring({damping: 200}) — smooth, premium
Micro: spring({damping: 20, stiffness: 200}) — snappy
Hover: scale(1.02), 150ms
Tap: scale(0.98), 100ms
Page: fade + slideY(20px), stagger 50ms
```

### 3. Implement Key Patterns
```tsx
// Page Transition
<AnimatePresence mode="wait">
  <motion.div key={page}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
  />
</AnimatePresence>

// Shared Element
<motion.div layoutId={`card-${id}`} />

// Stagger Children
variants={{ animate: { transition: { staggerChildren: 0.05 } } }}

// Scroll-linked
const { scrollYProgress } = useScroll();
const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
```

### 4. The Showroom Test
Would you present this UI on stage? If not → back to step 2.

## Procedure C: Video / Pitch Deck (Remotion)

### 1. Storyboard
- Scenes with frame ranges (30fps, 1920×1080)
- Each scene = React component
- NO code before storyboard is approved

### 2. Build
- `useCurrentFrame()` for ALL animations
- `spring()` for organic movement
- `interpolate()` with `extrapolateRight: 'clamp'`
- `<Img>` from Remotion, NOT `<img>`
- Inline styles only (no Tailwind in Remotion)

### 3. Polish
- Frame-level timing adjustments
- Audio sync (drops, SFX, silence)
- Element isolation (build UI in React, don't screenshot)

### 4. Render
- Preview each scene individually
- Full composition preview
- MP4 export

## Pitfalls
- Don't hardcode colors/fonts — use design tokens
- Don't animate without emotional purpose
- Don't use CSS transitions for visible UI animations — Framer Motion only
- Don't use `<img>` in Remotion — always `<Img>` from Remotion
- Don't skip the storyboard phase for videos
- Don't confuse Remotion (deterministic video) with Framer Motion (runtime UI)
