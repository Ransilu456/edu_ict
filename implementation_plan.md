# Implementation Plan - Gamified & Colorful LogicQuest UI

This plan aims to:
1. Clean up duplicated/unused files in the `components/` directory.
2. Transform the UI into a premium, colorful, and gamified experience inspired by the referenced screenshots (`UI_.jpeg`, `UI_2.jpeg`), utilizing a warm cream background, soft friendly gradients (no neon colors), rounded 3D buttons, and updated badges (keys and energy/XP).

---

## User Review Required

> [!IMPORTANT]
> - All files in `components/` EXCEPT `home-view.js`, `home-view.css`, and `home-view.html` are unused/duplicate backups. We will delete them to keep the directory clean.
> - The theme will be changed to a warm cream theme (`#FAF8F5`) with premium pastel colors (soft blue, purple, gold) to match the Duolingo-like look of the screenshots.
> - Neon colors will be avoided. Instead, we'll use solid high-contrast colors and smooth transitions.

---

## Proposed Changes

### Clean up Duplicates

#### [DELETE] [app-header.css](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/components/app-header.css)
#### [DELETE] [app-header.html](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/components/app-header.html)
#### [DELETE] [app-header.js](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/components/app-header.js)
#### [DELETE] [course-view.css](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/components/course-view.css)
#### [DELETE] [course-view.html](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/components/course-view.html)
#### [DELETE] [course-view.js](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/components/course-view.js)
#### [DELETE] [explorer-view.css](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/components/explorer-view.css)
#### [DELETE] [explorer-view.html](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/components/explorer-view.html)
#### [DELETE] [explorer-view.js](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/components/explorer-view.js)
#### [DELETE] [header.html](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/components/header.html)
#### [DELETE] [sandbox-view.html](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/components/sandbox-view.html)
#### [DELETE] [sandbox.css](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/components/sandbox.css)

---

### Core Styles & Theme

#### [MODIFY] [style.css](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/style.css)
- Revise the color palette to use soft warm cream tones:
  - Light background: `#FAF8F2` (Warm canvas cream)
  - Secondary background: `#FFFFFF` (White cards/containers)
  - Neutral borders: `2px solid #E5E2D9` (Stout borders with rounded corners)
  - Text colors: Slate/deep charcoal (`#2C2C2B`) instead of standard black
- Implement friendly 3D buttons (Duolingo style) with thick bottom border shadows:
  - Primary button: Gradient from soft blue to light violet/yellow-orange (`linear-gradient(to right, #6b82ff, #d883ff, #ffaf5c)`)
  - Secondary button: Soft cream with active push effects
- Re-style header elements:
  - Key Badge (`0 🔑` or styled with key icon)
  - Center Logo: Recreate the logo with the custom gate diagram (AND + NOT + OR gates illustration)
  - Energy/XP Badge (`⚡ XP_Count`)
- Re-style navigation tab buttons to look like clean, rounded pill badges

---

### Home View Component

#### [MODIFY] [home-view.html](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/components/home-view.html)
- Redesign the layout to exhibit a central learning path map with nodes (staggered Duolingo-like path layout).
- Each node will represent a course lesson (Binary Code, Transistor, NOT Gate, etc.).
- Update sections for stats, progress cards, and quick actions to align with the new gamified look.

#### [MODIFY] [home-view.css](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/components/home-view.css)
- Style the map path, the circular nodes (active pulsing states, checkmarks for complete, 3D locks for locked), and the lesson popup bubble cards.
- Add micro-animations (e.g. bounce, scale/lift on hover, pulsing glow).

---

### Navigation & Header Layout

#### [MODIFY] [index.html](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/index.html)
- Replace header controls to match the key badge, center gate logo illustration, and energy/XP badge.
- Ensure proper mapping of classes for views.

---

### JS Code Updates (For XP Syncing & Wires)

#### [MODIFY] [common.js](file:///e:/DO%20NOT%20TOUCH/Safe%20Zone/Applications_Developments/Sidequest/edu_ict/common.js)
- Ensure key counts and XP are synced and reflect live on the top header badges.

---

## Verification Plan

### Manual Verification
1. Run local dev server using `npm run dev`.
2. Inspect the UI visually via a browser to verify:
   - The cream warm theme and friendly card elements.
   - The key badge, custom logo, and energy badge in the header.
   - The staggered learning path map inside the Home view.
   - 3D push-down button styles.
   - Check that deleting duplicate component files didn't break navigation or core functions.
3. Complete a course lesson to verify XP is updated and that the path status reflects the change.
