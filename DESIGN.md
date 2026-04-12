# Design System Specification: The Tactical Orchestrator

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Ghost in the Machine."** 

This is not a traditional web interface; it is a high-precision tactical overlay designed for elite developer orchestration. It moves away from the "boxy" nature of standard SaaS platforms toward a fluid, holographic aesthetic. By leveraging extreme tonal depth and light-emitting accents, we create an environment that feels like a premium piece of hardware—an "Omni-channel Agentic Orchestrator."

The system breaks the "template" look through:
*   **Intentional Asymmetry:** Data density is balanced by wide, "breathing" gutters.
*   **Optical Precision:** Tight tracking and monospaced-leaning typography to evoke a sense of command-line authority.
*   **Ethereal Depth:** Elements do not sit *on* the screen; they float *within* it, defined by light and blur rather than lines.

---

## 2. Tokens & Variables (CSS Custom Properties)

```css
:root {
  /* Core Surface Tiers (The Layering Principle) */
  --bg-base: #070d1f;                /* surface */
  --bg-section: #0c1326;             /* surface_container_low */
  --bg-component: #11192e;           /* surface_container */
  --bg-elevated: #171f36;            /* surface_container_high */
  --bg-interactive: #1c253e;         /* surface_container_highest */
  --bg-void: #000000;                /* surface_container_lowest - used for deep ambient shadows / overlays */

  /* Primary Brand & Accents */
  --primary: #39b8fd;                /* base cyan power */
  --primary-dim: #17a8ec;            /* gradients/hover */
  --primary-container: #1faaef;
  
  /* Text & Contrast */
  --text-primary: #dfe4fe;           /* on_surface (Never use 100% white) */
  --text-secondary: #a5aac2;         /* on_surface_variant */

  /* Outlines & Borders (Ghost Borders ONLY) */
  --outline-variant: #41475b;        /* Use max at 15% opacity */
  --outline: #6f758b;

  /* Semantic Feedback */
  --error: #ff716c;
  --error-dim: #d7383b;
  --success: #10b77f;                /* ARES standard success injected */

  /* Typography */
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

---

## 3. Colors & Tonal Architecture
The palette is rooted in the "Obsidian & Cyan" spectrum, prioritizing dark-mode ergonomics and high-contrast data visualization.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Boundaries must be defined strictly through:
1.  **Background Shifts:** Transitioning from `surface` (#070d1f) to `surface_container_low` (#0c1326).
2.  **Glow Thresholds:** Using a subtle `primary` glow to define the edge of an active area.
3.  **Tonal Steps:** Nesting a `surface_container_highest` card within a `surface_container` area.

### Glass & Gradient Signature
To achieve the "Tactical Equipment" feel, all floating modules must utilize Glassmorphism.
*   **The Glass Formula:** `surface_variant` (#1c253e) at **40% opacity** + `backdrop-filter: blur(16px)`.
*   **The Signature Glow:** Use a linear gradient for active CTAs: `primary` (#39b8fd) to `primary_container` (#1faaef) at a 135-degree angle. This provides a "powered-on" energy that flat fills cannot replicate.

---

## 4. Typography
We use a dual-font strategy to balance high-tech precision with editorial readability.

*   **Display & Headlines (Space Grotesk):** Chosen for its eccentric, technical terminal feel. Use `tight` letter spacing (-0.02em) to maintain a "dense" tactical look.
*   **Body & UI (Inter):** The workhorse. Inter provides maximum legibility for complex data strings.
*   **Hierarchy as Authority:**
    *   **Display-LG (3.5rem):** Used for "Status" levels or hero metrics.
    *   **Label-SM (0.6875rem):** Used for metadata and "System Tags." Always uppercase with +0.05em tracking to simulate hardware engraving.

---

## 5. Elevation & Depth
In this design system, depth is a functional tool for hierarchy, not just a visual flourish.

### Ambient Shadows & Ghost Borders
*   **Shadows:** Never use black. Use `surface_container_lowest` (#000000) with a 40% opacity, 30px blur, and 0px spread. The shadow should feel like a soft "void" behind the element.
*   **The Ghost Border:** If a separator is required for accessibility, use `outline_variant` (#41475b) at **15% opacity**. It should be felt, not seen.

---

## 6. Components

### Tactical Buttons
*   **Primary:** Gradient fill (`primary` to `primary_dim`), no border, `on_primary` text. Add a 4px outer glow of `primary` at 20% opacity on hover.
*   **Secondary:** `surface_variant` background with a `primary` text color. No border.
*   **Tertiary:** Transparent background, `secondary` text, underlined only on hover.

### Status Indicators (The Pulse)
*   **Active State:** A `primary` (#39b8fd) dot with a repeating CSS animation "pulse" (a scale-out ring with 0% opacity).
*   **Critical/Error:** Same pulse mechanic using `error` (#ff716c).

### Input Fields
*   **Static:** `surface_container_highest` background, `none` border, `sm` (0.125rem) radius.
*   **Focus:** The background shifts to `surface_bright` (#222b47) with a 1px "Ghost Border" of `primary` at 30% opacity.

### Navigation Rails
*   Forbid horizontal top-navs. Use a vertical **Command Rail** on the left.
*   Icons should use `secondary_dim` when inactive and `primary` with a vertical "light bar" indicator when active.

---

## 7. Do's and Don'ts

### Do:
*   **Do** use `JetBrains Mono` (or similar) for any code snippets or UUIDs to reinforce the developer-centric nature.
*   **Do** use asymmetrical margins (e.g., a wider left gutter than right) to create an editorial, "un-templated" feel.
*   **Do** use `primary` cyan accents sparingly. It should represent "Power" and "Action," not decoration.

### Don't:
*   **Don't** use a standard 8px grid. Use a **4px sub-grid** for tighter, more technical alignment of small UI elements.
*   **Don't** use 100% white (#FFFFFF). Always use `on_surface` (#dfe4fe) for text to prevent optical vibration against the dark backgrounds.
*   **Don't** use rounded corners larger than `xl` (0.75rem). The aesthetic is "tactical," which requires tighter, more disciplined radii.

---

## 8. Signature Element: The HUD Overlay
When displaying critical system logs or agentic "thinking" processes, use a full-bleed `surface_container_lowest` (#000000) overlay with 20% opacity and a `backdrop-filter: blur(8px)`. This creates a focused "Heads-Up Display" mode that isolates the user's focus from the rest of the orchestrator.
