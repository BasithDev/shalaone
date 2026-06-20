---
name: Academic Flux
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#464555'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#a93349'
  on-secondary: '#ffffff'
  secondary-container: '#fe7488'
  on-secondary-container: '#730425'
  tertiary: '#684000'
  on-tertiary: '#ffffff'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#ffdadc'
  secondary-fixed-dim: '#ffb2b9'
  on-secondary-fixed: '#400010'
  on-secondary-fixed-variant: '#891933'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: auto
  max-width-content: 1200px
---

## Brand & Style

The design system is engineered for a demographic of students (Grades 6-12), balancing the rigorous requirements of a study tool with the approachability of a digital companion. The brand personality is **Encouraging, Methodical, and Vital**. It avoids the sterility of traditional enterprise software in favor of a "Modern Soft" aesthetic—utilizing gentle curvatures and ample whitespace to reduce cognitive load during intense study sessions.

The visual direction leverages a refined take on minimalism, incorporating subtle tactile elements like soft shadows and pill-shaped interactive states to make the interface feel responsive and friendly. The goal is to evoke a sense of focused calm, where the AI assistant feels like a supportive peer rather than a rigid institutional tool.

## Colors

The palette is anchored by **Trust Indigo (#4F46E5)**, chosen for its psychological association with focus, depth, and reliability. This is the primary color for navigation, key actions, and progress indicators.

To inject energy into the learning process, **Coral Energy (#FB7185)** serves as the secondary accent, specifically for "High-Momentum" actions like starting a quiz or completing a milestone. **Warm Amber (#F59E0B)** is used as a tertiary accent for notifications, tips, and achievements, providing a sunny, rewarding contrast. 

The background remains a crisp, slightly cool off-white to maintain high readability, while neutrals are kept soft to prevent the interface from feeling "heavy" or overly corporate.

## Typography

The design system utilizes **Plus Jakarta Sans** across all levels. This typeface offers a modern, geometric structure with soft, open apertures that make it highly legible for long-form reading and quick scanning. 

- **Headlines:** Use Bold and ExtraBold weights with slight negative letter-spacing to create a "contained" and confident look.
- **Body:** Standardized on 16px for optimal readability on mobile and desktop, ensuring the line height is generous (1.5x) to prevent eye strain during study.
- **Labels:** Used for micro-copy and tags, employing medium weights to maintain hierarchy without needing excessive size.

## Layout & Spacing

This design system follows a **Hybrid Fluid-Fixed Grid**. While it is mobile-first, it transitions to a structured 12-column fixed-width grid on desktop (max-width 1200px) to prevent line lengths from becoming too long for comfortable reading.

- **Mobile:** Uses a single-column layout with 16px side margins.
- **Tablet:** Uses a 6-column grid with 20px gutters.
- **Desktop:** A 12-column grid centered in the viewport.

Spacing is based on a **4px base unit**. All padding and margins should be multiples of 4 (e.g., 8, 16, 24, 40) to ensure visual rhythm. "Generous whitespace" is a core principle here—vertical rhythm should err on the side of larger gaps (40px+) between major sections to isolate concepts and reduce anxiety.

## Elevation & Depth

Hierarchy is established using **Tonal Layering** combined with **Ambient Shadows**. 

- **Surface Level 0:** The main background (#F9FAFB).
- **Surface Level 1 (Cards):** Pure white (#FFFFFF) with a soft, multi-layered shadow (0px 4px 20px rgba(0, 0, 0, 0.04)). This makes content feel lifted and interactive.
- **Surface Level 2 (Modals/Popovers):** Pure white with a more pronounced shadow and a 1px soft indigo border (5% opacity) to define edges.

Avoid harsh blacks; all shadows should use a tint of the Primary Indigo or a soft Neutral to keep the interface "light" and airy.

## Shapes

The shape language is consistently rounded to reinforce the "friendly companion" persona. 

- **Standard Containers:** Use a 16px (1rem) radius.
- **Large Cards:** Use a 24px (1.5rem) radius to feel like approachable modules.
- **Interactive Elements:** Buttons and Chips are fully pill-shaped (radius: 9999px) to invite tapping and distinguish them clearly from static content containers.
- **Inputs:** Use an 8px radius to maintain a sense of structure while staying soft.

## Components

### Buttons
- **Primary:** Pill-shaped, Primary Indigo background, white text. Use a subtle linear gradient (Indigo to a slightly lighter blue) to add a modern "sheen."
- **Secondary:** Pill-shaped, Coral or Amber background for high-energy actions.
- **Ghost:** Pill-shaped, 1px Primary Indigo border, no fill.

### Cards
- White background, 16-24px corner radius, soft ambient shadow. 
- Padding should be generous (24px or 32px) to let study content "breathe."

### Input Fields
- 8px corner radius, light grey background (#F3F4F6) with a subtle 1px border that turns Primary Indigo on focus.
- Labels are consistently placed above the field in `label-md` weight.

### Chips & Progress
- **Study Tags:** Small pill-shaped chips with low-opacity tints of the Primary or Secondary colors.
- **Progress Bars:** Thick (8px+), rounded caps, using a gradient fill to show completion.

### AI Interface (The Companion)
- The AI chat or assistance modules should use a distinctive "Soft Glass" effect (background-blur) or a light indigo-tinted background to differentiate AI-generated suggestions from standard curriculum content.