---
name: MindMitra
colors:
  surface: '#fff8f5'
  surface-dim: '#e2d8d3'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fcf2ec'
  surface-container: '#f6ece7'
  surface-container-high: '#f0e6e1'
  surface-container-highest: '#ebe0db'
  on-surface: '#1f1b18'
  on-surface-variant: '#57423b'
  inverse-surface: '#352f2c'
  inverse-on-surface: '#f9efe9'
  outline: '#8a726a'
  outline-variant: '#dec0b7'
  surface-tint: '#a23e18'
  primary: '#9f3c16'
  on-primary: '#ffffff'
  primary-container: '#bf542c'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59c'
  secondary: '#79526c'
  on-secondary: '#ffffff'
  secondary-container: '#fecceb'
  on-secondary-container: '#7a536d'
  tertiary: '#3e644a'
  on-tertiary: '#ffffff'
  tertiary-container: '#567d62'
  on-tertiary-container: '#f6fff4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59c'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#822801'
  secondary-fixed: '#ffd7ef'
  secondary-fixed-dim: '#e9b8d7'
  on-secondary-fixed: '#2f1027'
  on-secondary-fixed-variant: '#603b54'
  tertiary-fixed: '#c2edcb'
  tertiary-fixed-dim: '#a7d1b0'
  on-tertiary-fixed: '#00210f'
  on-tertiary-fixed-variant: '#294e36'
  background: '#fff8f5'
  on-background: '#1f1b18'
  surface-variant: '#ebe0db'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 54px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '400'
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
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  gutter-mobile: 1rem
  gutter-desktop: 2rem
  margin-mobile: 1.25rem
  margin-desktop: 3rem
---

## Brand & Style

This design system embodies warm, human-centered dignity, balancing supportive elder accessibility with contemporary editorial sophistication. Created to foster cognitive wellness, reminiscence, and cross-generational connection between aging individuals, their families, and caregivers, the experience eliminates clinical coldness in favor of a comforting, tactile, living archive.

The visual style blends **Modern Humanism** with **Subtle Tactility**:
- **Generous & Forgiving:** Interfaces prioritize large, confident interactive surfaces, eliminating high-precision motor demands and reducing cognitive fatigue.
- **Calm Reassurance:** High-contrast legibility operates alongside soothing earthen pigments. Technology feels organic, conversational, and respectful rather than computational.
- **Narrative Warmth:** Reminiscence and cognitive exercises are treated as preserved heirlooms through paper-like tonal backdrops, comforting elevation, and considerate reading cadences.

## Colors

The palette is rooted in grounding earth pigments and gentle light, engineered strictly to exceed WCAG 2.1 AA and AAA legibility standards against light surfaces.

- **Primary (`#C85A32` / Deep Terracotta `#B84A24` on interaction):** Conveys human warmth, connection, and vital energy. Used for primary touch targets, hero actions, active states, and identity anchors.
- **Secondary (`#4A2840` / Deep Plum `#3B1C33`):** Reserved for SmritiAI voice intelligence, reflective cognitive activities, conversational indicators, and contemplative spaces.
- **Tertiary (`#5B8266` Muted Sage):** Represents peaceful validation, completed memory routines, and physical or cognitive wellness progress.
- **Accent / Alert (`#D9822B` / `#E5A84B` Soft Amber):** Communicates time-sensitive prompts, upcoming medication or engagement routines, and gentle cues without inducing anxiety.
- **Base Canvas (`#FAF7F2` Warm Ivory, transitioning to `#F5EFEB` for secondary tiers):** Softens harsh screen glare while providing crisp optical contrast.
- **Typography & Structure:** Primary copy rests at `#221F20` (Deep Charcoal, minimum 13:1 contrast against `#FAF7F2`), supported by `#6E6763` (Warm Gray, minimum 4.8:1 contrast) for assistive labels and secondary metadata.

## Typography

Plus Jakarta Sans is chosen across all levels for its open apertures, tall x-height, clear differentiation of ambiguous glyphs (such as capital `I`, numeral `1`, and lowercase `l`), and warm, approachable letterforms.

- **Scale Considerations:** Default body sizes start at 18px (`body-lg`) for standard reading flows, while memory captions and conversational transcripts utilize `body-xl` (20px) to prevent eye strain.
- **Hierarchy Rules:** Never use font sizes below 13px under any circumstance. Subheaders and title elements feature tightened leading to preserve cohesion during screen reader enlargement and high-zoom rendering.

## Layout & Spacing

The layout employs a structured 8px baseline rhythm across an adaptive fluid-breakout grid system:

- **Mobile (< 768px):** 4-column layout with 20px outer margins and 16px gutters. Touch targets have an enforced minimum height and width of 56px to guarantee effortless motor accessibility.
- **Tablet (768px – 1024px):** 8-column layout with 32px outer margins and 24px gutters. Supports side-by-side memory prompt viewports and conversational AI splits.
- **Desktop (> 1024px):** 12-column layout maxed out at 1280px with 48px outer margins. Prevents horizontal line lengths from exceeding 75 characters for narrative readability.

Vertical spacing favors generous, deliberate section separators (`space-2xl` and `space-3xl`) to establish distinct cognitive boundaries between past memories, active exercises, and system messages.

## Elevation & Depth

Depth in this design system avoids sharp, artificial drop-shadows, instead applying diffuse, warm-tinted organic shadows and soft tonal layering inspired by physical stationery.

- **Surface Level 0 (Ground Canvas):** `#FAF7F2` solid background.
- **Surface Level 1 (Card & Content Tiles):** Pure `#FFFFFF` surface resting on Level 0, bounded by a 1px border of `#E8E2D9` and a soft ambient glow: `0 2px 8px -2px rgba(74, 40, 64, 0.04), 0 6px 16px -4px rgba(200, 90, 50, 0.06)`.
- **Surface Level 2 (Floating Controls & SmritiAI Prompts):** `#FFFFFF` surface with an elevated plume shadow: `0 8px 24px -4px rgba(74, 40, 64, 0.08), 0 2px 6px -1px rgba(34, 31, 32, 0.04)`.
- **Surface Level 3 (Modal Dialogs & Memory Playback Overlays):** Tinted backdrop blur (`rgba(34, 31, 32, 0.45)` with `backdrop-filter: blur(8px)`), with dialogue surfaces using `0 16px 40px -8px rgba(74, 40, 64, 0.16)`.

## Shapes

The design system implements contextual corner radii to distinguish functional micro-controls from rich narrative surfaces:

- **Controls & Form Inputs (Subtle - 8px / `0.5rem`):** Applied to buttons, search fields, text boxes, and dropdown menus for familiar, stable ergonomics.
- **Content Panels & Modals (Medium - 16px / `1rem`):** Applied to structured widgets, caregiver metric summaries, and system sheets.
- **Memory Cards & SmritiAI Voice Orbs (Generous - 24px / `1.5rem` to Pill):** Applied to photographic frames, personal family stories, audio transcripts, and voice activation pills, introducing a soft, keepsake-inspired silhouette.

## Components

### Buttons
- **Primary:** Terracotta `#C85A32` fill, `#FFFFFF` text, minimum height 56px, horizontal padding 24px, 8px radius. Hover: `#B84A24`. Focus: 3px solid `#FAF7F2` ring enclosed by a 2px outer ring of `#4A2840`.
- **Secondary (SmritiAI / Voice):** Deep Plum `#4A2840` fill, `#FAF7F2` text, minimum height 56px.
- **Tertiary / Outlined:** `#FFFFFF` fill with a 2px `#C85A32` outline and `#C85A32` label. Never use hairline 1px borders for functional interactive states.

### Memory & Story Cards
- Constructed with `#FFFFFF` background, 24px border radius, and subtle Level 1 ambient elevation.
- Media elements within cards feature an 18px inner radius with a warm tint overlay for vintage and family photos.
- Large typographic labels (`body-xl`) with timestamp tags set in `label-md` using `#6E6763`.

### SmritiAI Voice Interface Orb & Pill
- Pill-shaped trigger with a 2px active audio pulsation ring using `#4A2840` and `#FAF7F2`.
- Real-time speech responses are presented within a Plum-tinted card (`#3B1C33` background, `#FAF7F2` high-contrast typography, 20px leading size) to immediately orient the user to cognitive dialogue mode.

### Form Inputs & Checkboxes
- **Inputs:** 56px height, 16px horizontal padding, `#FFFFFF` background, 2px border in `#D4CDC5`. Active focus shifts border to `#C85A32` with a 3px soft tint ring (`rgba(200, 90, 50, 0.15)`).
- **Checkboxes & Radios:** Scaled up to 28x28px for effortless touch and tremor tolerance. Checked states display solid `#5B8266` (Success) or `#C85A32` (Primary) with thick 3px white checkmarks.

### Chips & Reminders
- Status chips use 12px vertical and 16px horizontal padding with fully rounded pill shapes.
- Upcoming cognitive reminders use Soft Amber background `#FDF4EB` with `#D9822B` typography and a 1.5px `#E5A84B` border.
- Completed streaks use Sage background `#EDF3EE` with `#5B8266` text.