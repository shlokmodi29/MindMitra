# MindMitra (स्मृति मित्र) — Memory That Matters
### Gentle Cognitive Companion & Living Memory Archive

MindMitra is an elder-centric cognitive health platform and living memory archive designed specifically for Indian elders, seniors living with mild cognitive impairment (MCI) or early-stage dementia, their primary family caregivers, and clinical support circles.

Developed with deep attention to regional Indian contexts—including the North Eastern Region (NER) such as Meghalaya and Assam—MindMitra transforms cognitive care from sterile, generic brain-training tests into a warm, deeply personal, and culturally resonant living world.

---

## 🌟 The 9 Core SIH Differentiators

| # | SIH Differentiator | Traditional Brain Training / SaaS | MindMitra Approach |
|---|--------------------|-----------------------------------|-------------------|
| 1 | **Living Memory World** | Stock photos & generic trivia | Patient's own family photos, ancestral courtyards, favorite recipes, and loved ones |
| 2 | **Context-Aware SmritiAI** | Generic chatbot without history | Deep memory & routine context, gentle tone, non-diagnostic guardrails |
| 3 | **20 Interactive Cognitive Activities** | Monotonous multiple-choice Q&A | 20 dedicated mini-game mechanics (card pairing, object sorting, shopping list, audio recall) |
| 4 | **Explainable Adaptive Engine** | Medical percentile grading | Dynamic difficulty (Easy/Med/Hard) based solely on the patient's individual history; no cross-patient ranking |
| 5 | **Voice-First Multilingual Experience** | English-only text prompts | Natural speech synthesis and voice capture across English, Hindi, Assamese, and Bengali |
| 6 | **Offline-First Architecture** | Broken app when network drops | 100% operational offline cache, Service Worker, background sync queue, and local IndexedDB |
| 7 | **Family Memory Bridge** | Isolated patient experience | Family members contribute keepsakes, voice thoughts, and loving notes from afar |
| 8 | **Emergency SOS Safeguards** | Automated or missing emergency flows | Prominent national **112** helpline, accidental tap protection, and caregiver quick-dial cards |
| 9 | **NER Usability Optimization** | One-size-fits-all metro UX | Multi-script typography (Noto Sans Bengali/Devanagari), Shillong/Assam cultural touchpoints, and low digital-literacy ergonomics |

---

## 🛠 Technology Stack & Architecture

- **Core Frontend**: Modular Vanilla JavaScript (ES Modules) — zero framework bloat, instant startup, fast load on low-spec regional mobile devices.
- **Styling & Design System**: Custom Tailwind CSS design tokens implementing the Stitch source-of-truth palette (Warm Ivory `#fff8f5`, Terracotta `#9f3c16`, Deep Plum `#79526c`, Muted Sage `#3e644a`).
- **Typography & Scripts**: Google Fonts (`Plus Jakarta Sans`, `Noto Sans Bengali` for Assamese and Bengali, `Noto Sans Devanagari` for Hindi).
- **Icons**: Material Symbols Outlined (with variable font fill/weight states).
- **Local Persistence & Offline**: Service Worker (`sw.js`) with cache-first shell strategy, `LocalStorage` / `IndexedDB` transactional state management, and an idempotent `offlineSyncService` queue.
- **Voice & Speech**: Web Speech API (`SpeechSynthesis` and `webkitSpeechRecognition`) with graceful audio synth and typed fallbacks.

---

## 🚀 Quick Start & Local Execution

### Prerequisites
- Node.js (v18 or higher recommended)
- Any modern web browser (Chrome, Edge, Firefox, Safari)

### 1. Installation
Clone or navigate to the project root:
```bash
cd stitch_mindmitra_cognitive_companion_ui
```

### 2. Launch Local Dev Server
```bash
npx -y serve -p 3000 .
```
Open your browser at `http://localhost:3000` (or the active port shown in terminal).

### 3. Run the Complete Automated Test Suite
MindMitra features **18 comprehensive automated test suites** validating all aspects of the architecture:
```bash
npm test
```

---

## 👥 Demo Accounts & Role-Based Access

MindMitra comes pre-seeded with realistic, culturally tailored elder and caregiver accounts:

| Role | Name | Email | Password | Context |
|------|------|-------|----------|---------|
| **Patient** | Asha Devi (72 yrs) | `asha@mindmitra.in` | `Asha1234!` | Lives in Sector 4, Shillong. Cherishes memories of Kolkata veranda and Shillong tea gardens. |
| **Caregiver** | Meera (Daughter) | `meera@mindmitra.in` | `Meera4321!` | Primary caregiver. Oversees daily medicine schedule, adds memory keepsakes, monitors telemetry. |

---

## 🧭 SIH Evaluator 20-Step Live Demo Script

Follow this seamless walkthrough during jury presentations:

1. **Patient Login**: Visit `#/login`. Click or enter `asha@mindmitra.in` / `Asha1234!`.
2. **Patient Home**: Point out the warm, comforting greeting ("Good Morning, Asha Devi"), today's scheduled rhythm glance, and the SmritiAI companion card.
3. **Daily Routine (My Day)**: Navigate to `#/my-day`. Click **"Hear Reminder"** on the Blood Pressure Medication reminder to demonstrate spoken voice guidance.
4. **Complete a Milestone**: Tap the large checkmark to mark the morning tea milestone complete. Note the gentle feedback chime.
5. **Activities Hub**: Navigate to `#/activities`. Highlight the 20 distinct cognitive activities categorized across Remember, Notice, Solve, Sequence, Explore, and Connect.
6. **Play an Activity**: Launch **Memory Match** (`act-1`). Flip cards to reveal familiar tokens (Meera, Jasmine Flower, Brass Diya). Match a pair and complete the session.
7. **Session Results & Adaptation**: View the calm results screen with accuracy, encouragement, and the explainable difficulty recommendation.
8. **Living Memory World**: Navigate to `#/memory-world`. Show the living archive of personal memories, family photographs, and voice recollections.
9. **Memory Search & Entities**: Search for `"Shillong"`. Open **"Tea Garden Morning, Shillong"** to view tagged people (Meera), place (Ward Lake), and related family keepsakes.
10. **SmritiAI Memory Exploration**: Click the SmritiAI floating voice trigger or navigate to `#/smriti-ai`. Ask: *"Tell me about Meera"* or *"What's on my day?"*.
11. **Non-Diagnostic Safety Demonstration**: In SmritiAI, ask: *"Can you diagnose my dementia score and change my medicine?"*. Observe the immediate, supportive non-clinical safety disclaimer.
12. **Emergency Query Routing**: In SmritiAI, type: *"Emergency, I fell down!"*. Note that the AI does **not** make an unauthorized fake call; instead, it safely transitions to the Emergency SOS view.
13. **Emergency SOS & Prominent 112**: Inspect `#/emergency-sos`. Point out the prominent national emergency number **112** (Police • Ambulance • Fire) and caregiver quick-dial cards.
14. **Accidental Tap Protection**: Tap **"CALL 112 NOW"**. Show the explicit confirmation modal displaying the patient's verified home address and dialer safeguard.
15. **Family Circle**: Navigate to `#/family-circle` to show cross-generational shared keepsakes and loving notes from granddaughter Priya and daughter Meera.
16. **Switch to Caregiver Portal**: Log out or switch to `meera@mindmitra.in` / `Meera4321!` to enter `#/caregiver-dashboard`.
17. **Caregiver Telemetry**: Review Asha's daily milestone completion percentage, activity engagement history, and recent memory interactions.
18. **Patient Preview Mode**: From the Caregiver Dashboard, click **"Preview Patient Experience"**. Point out the sticky amber banner that allows caregivers to view the app through their elder's eyes and return anytime.
19. **Clinical Reports**: Navigate to `#/caregiver-reports`. Select the 30-day range to inspect cognitive trends, memory engagement charts, and generate a sanitized, formula-safe CSV export.
20. **Offline-First Resilience**: Open DevTools Network tab and set status to **Offline**. Refresh the page. Show that the entire shell, memories, activities, and emergency SOS remain 100% accessible. Reconnect and demonstrate background sync.

---

## 🛡️ Security, Privacy & Compliance Highlights

- **Zero Credential Exposure**: Plaintext passwords and PINs are stripped before user objects are returned to views.
- **Strict Multi-Tenant Patient Isolation**: Caregivers cannot query or view data of unlinked patients; patients cannot access cross-patient memory archives.
- **XSS & HTML Sanitization**: All user-authored memory stories, titles, and notes pass through `securityService.sanitizeHtml()`.
- **CSV Injection (DDE) Neutralization**: Spreadsheet exports prefix dangerous formula characters (`=`, `+`, `-`, `@`, `\t`) with single quotes.
- **Prompt Injection Defense**: Memory transcripts and speech inputs are treated strictly as passive data, filtering system instruction override attempts.
- **Audit Logging**: Emergency events, routine completions, and caregiver access generate tamper-evident local audit records.

---

## ♿ Accessibility & NER Regional Support

- **Touch Ergonomics**: All primary elder touch targets enforce a minimum height of **52px to 64px** (`elder-touch-target`).
- **High-Visibility Focus Rings**: Unambiguous `:focus-visible` 3px outline on all interactive controls for keyboard and switch-access users.
- **Skip Link**: `<a href="#view-content" class="skip-link">Skip to main content</a>` allows instant keyboard bypass of headers.
- **Reading Comfort**: In-app font scaling (`small` 95%, `medium` 100%, `large` 110%) reactive to user preference.
- **Reduced Motion**: Full support for system `@media (prefers-reduced-motion)` as well as an in-app toggle that neutralizes animations.
- **Multi-Script Fonts**: Authentic rendering for Devanagari (Hindi) and Eastern Nagari (Assamese and Bengali) without missing glyphs.
- **Prominent 112 Rule**: The national emergency helpline `112` is permanently displayed in international Arabic numerals across all languages without confusing translation into Eastern Nagari numerals.

---

## 📊 Automated Test Suites Overview (18 Suites)

MindMitra maintains 100% test coverage across 18 specialized test scripts:

```
1. scripts/validate.js                 - Stitch tokens, palette, and theme typography
2. scripts/test_engine.js              - Core state store, notifications, and persistence
3. scripts/test_auth.js                - Authentication, session validation, and RBAC
4. scripts/test_patient_experience.js  - Patient Home, My Day rhythm, and day navigation
5. scripts/test_reminders.js           - Scheduled medicine, hydration, and completion
6. scripts/test_memory_world.js        - Living Memory Archive, people, places, and graph
7. scripts/test_cognitive_activities.js- 20 canonical activities & mini-game mechanics
8. scripts/test_smriti_ai.js           - SmritiAI companion, memory recall, and guardrails
9. scripts/test_adaptive_engine.js     - Dynamic difficulty calculation and pacing
10. scripts/test_voice_multilingual.js - Speech synthesis, recognition, and 4-locale i18n
11. scripts/test_family_connection.js  - Family Circle, shared keepsakes, and contributions
12. scripts/test_emergency_sos.js      - 112 helpline flow, confirmation modal, and location
13. scripts/test_caregiver_dashboard.js- Caregiver telemetry, patient center, and logs
14. scripts/test_analytics_reports.js  - Longitudinal analytics, trend tracking, and CSV
15. scripts/test_offline_sync.js       - Offline-first cache, sync queue, and idempotency
16. scripts/test_security_privacy.js   - XSS sanitization, DDE defense, and patient isolation
17. scripts/test_accessibility_ner.js  - Focus visible, skip link, font scaling, and NER scripts
18. scripts/test_part16_final_qa.js    - Full-system integration, SIH demo flow, and regression
```

---

## ⚠️ Known Limitations & Future Roadmap

1. **Hardware Telephony**: In standard desktop web browsers, clicking "Call 112" opens the system URI protocol (`tel:112`). On physical mobile devices with SIM cards, this directly launches the native dialer screen.
2. **Cloud Speech Recognition**: Offline speech recognition relies on device-level browser speech models; if the device lacks native speech packs, MindMitra automatically provides high-contrast on-screen typing fallbacks.
3. **Future Language Expansion**: Additional North Eastern languages (Khasi, Garo, and Mizo) are planned for phase two expansion following initial regional deployment in Meghalaya.

---

*MindMitra is committed to creating dignified, gentle, and culturally rooted technology for every elder.*
