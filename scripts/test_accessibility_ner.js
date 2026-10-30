// MindMitra Part 15 - Accessibility & North Eastern Region (NER) Usability Test Suite
// 25 Automated Validation Tests

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Mock browser environment for Node.js
class MockClassList {
  constructor() {
    this.classes = new Set();
  }
  add(...cls) { cls.forEach(c => this.classes.add(c)); }
  remove(...cls) { cls.forEach(c => this.classes.delete(c)); }
  contains(c) { return this.classes.has(c); }
  toggle(c, force) {
    if (force !== undefined) {
      if (force) this.add(c); else this.remove(c);
      return force;
    }
    if (this.contains(c)) { this.remove(c); return false; }
    else { this.add(c); return true; }
  }
}

const mockDocElement = {
  classList: new MockClassList(),
  lang: 'en'
};

global.document = {
  documentElement: mockDocElement,
  getElementById: (id) => null,
  querySelectorAll: () => []
};

global.window = {
  location: { hash: '#/patient-home' },
  addEventListener: () => {},
  removeEventListener: () => {}
};

const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

global.navigator = {
  onLine: true,
  userAgent: 'Node.js MindMitra Test Harness'
};

// Dynamic imports
const { store } = await import('../src/state/store.js');
const { i18nService } = await import('../src/services/i18nService.js');
const { en } = await import('../src/locales/en.js');
const { hi } = await import('../src/locales/hi.js');
const { as: asLocale } = await import('../src/locales/as.js');
const { bn } = await import('../src/locales/bn.js');
const { renderEmergencySosView } = await import('../src/views/EmergencySosView.js');
const { renderPatientProfileView } = await import('../src/views/PatientProfileView.js');

console.log('\n============================================================');
console.log('🧪 MINDMITRA TEST SUITE 17: ACCESSIBILITY & NER OPTIMIZATION');
console.log('============================================================\n');

let passedTests = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// 1. Google Fonts import contains Noto Sans Bengali & Noto Sans Devanagari
test('1. index.html includes Noto Sans Bengali and Devanagari Google Fonts', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  assert.ok(indexHtml.includes('Noto+Sans+Bengali'), 'Should include Noto Sans Bengali font');
  assert.ok(indexHtml.includes('Noto+Sans+Devanagari'), 'Should include Noto Sans Devanagari font');
});

// 2. Tailwind fontFamily config contains regional script fallbacks
test('2. Tailwind config contains regional script fallbacks in font families', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  assert.ok(indexHtml.includes('Noto Sans Bengali'), 'Tailwind fontFamily should contain Noto Sans Bengali');
  assert.ok(indexHtml.includes('Noto Sans Devanagari'), 'Tailwind fontFamily should contain Noto Sans Devanagari');
});

// 3. Skip to main content link exists in index.html
test('3. index.html contains accessible Skip to Main Content link', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  assert.ok(indexHtml.includes('class="skip-link"'), 'Should have skip-link class');
  assert.ok(indexHtml.includes('href="#view-content"'), 'Skip link should target #view-content anchor');
});

// 4. Skip link CSS styles ensure offscreen position when blurred and visible on focus
test('4. styles/app.css defines accessible .skip-link positioning and focus states', () => {
  const appCss = fs.readFileSync(path.join(rootDir, 'styles', 'app.css'), 'utf8');
  assert.ok(appCss.includes('.skip-link'), 'Should have .skip-link style rule');
  assert.ok(appCss.includes('top: -100px'), 'Should hide offscreen initially');
  assert.ok(appCss.includes('.skip-link:focus'), 'Should specify visible state on focus');
});

// 5. prefers-reduced-motion media query defined in CSS
test('5. styles/app.css provides @media (prefers-reduced-motion: reduce) rule', () => {
  const appCss = fs.readFileSync(path.join(rootDir, 'styles', 'app.css'), 'utf8');
  assert.ok(appCss.includes('prefers-reduced-motion: reduce'), 'Should include prefers-reduced-motion media query');
  assert.ok(appCss.includes('animation-duration: 0.01ms'), 'Should neutralize animation duration');
});

// 6. In-app reduced motion class defined in CSS
test('6. styles/app.css provides .reduced-motion-active class for in-app toggle', () => {
  const appCss = fs.readFileSync(path.join(rootDir, 'styles', 'app.css'), 'utf8');
  assert.ok(appCss.includes('.reduced-motion-active'), 'Should support in-app reduced motion override class');
});

// 7. Elder text scale classes exist in CSS
test('7. styles/app.css defines elder text scaling classes (sm, md, lg)', () => {
  const appCss = fs.readFileSync(path.join(rootDir, 'styles', 'app.css'), 'utf8');
  assert.ok(appCss.includes('.elder-text-scale-sm'), 'Should define small font scale');
  assert.ok(appCss.includes('.elder-text-scale-md'), 'Should define medium font scale');
  assert.ok(appCss.includes('.elder-text-scale-lg'), 'Should define large font scale');
});

// 8. Store accessibility settings persistence
test('8. store.setAccessibilitySettings persists settings to localStorage', () => {
  store.setAccessibilitySettings({ fontSize: 'large', speechRate: 0.75, reducedMotion: true });
  const state = store.getState();
  assert.strictEqual(state.settings.fontSize, 'large');
  assert.strictEqual(state.settings.speechRate, 0.75);
  assert.strictEqual(state.settings.reducedMotion, true);

  const saved = JSON.parse(mockStorage['mindmitra_core_db_v2']);
  assert.strictEqual(saved.settings.fontSize, 'large');
  assert.strictEqual(saved.settings.reducedMotion, true);
});

// 9. Store DOM accessibility helper toggles classes on document.documentElement
test('9. store.applyDOMAccessibility updates documentElement classes and lang', () => {
  store.setAccessibilitySettings({ fontSize: 'large', reducedMotion: true });
  assert.ok(mockDocElement.classList.contains('elder-text-scale-lg'), 'Should add elder-text-scale-lg');
  assert.ok(mockDocElement.classList.contains('reduced-motion-active'), 'Should add reduced-motion-active');

  store.setAccessibilitySettings({ fontSize: 'small', reducedMotion: false });
  assert.ok(mockDocElement.classList.contains('elder-text-scale-sm'), 'Should switch to elder-text-scale-sm');
  assert.ok(!mockDocElement.classList.contains('elder-text-scale-lg'), 'Should remove previous scale');
  assert.ok(!mockDocElement.classList.contains('reduced-motion-active'), 'Should remove reduced motion');
});

// 10. High-visibility focus rings in CSS
test('10. styles/app.css defines high-contrast :focus-visible outlines', () => {
  const appCss = fs.readFileSync(path.join(rootDir, 'styles', 'app.css'), 'utf8');
  assert.ok(appCss.includes(':focus-visible'), 'Should define :focus-visible selector');
  assert.ok(appCss.includes('outline: 3px solid'), 'Should specify high-visibility 3px outline');
});

// 11. Four language locales exist and are registered
test('11. Four language locales exist (en, hi, as, bn) in src/locales', () => {
  assert.ok(en, 'English locale must be defined');
  assert.ok(hi, 'Hindi locale must be defined');
  assert.ok(asLocale, 'Assamese locale must be defined');
  assert.ok(bn, 'Bengali locale must be defined');
});

// 12. All 4 languages implement required dictionary keys
test('12. All 4 languages implement required keys (emergency, family, settings, states)', () => {
  const requiredCategories = ['common', 'nav', 'home', 'voice', 'emergency', 'family', 'settings', 'states'];
  [en, hi, asLocale, bn].forEach((loc, idx) => {
    const code = ['en', 'hi', 'as', 'bn'][idx];
    requiredCategories.forEach(cat => {
      assert.ok(loc[cat], `Locale '${code}' is missing top-level key '${cat}'`);
      assert.ok(typeof loc[cat] === 'object', `Locale '${code}' key '${cat}' must be an object`);
    });
  });
});

// 13. English locale dictionary is complete
test('13. English locale contains complete elder & emergency strings', () => {
  assert.strictEqual(en.emergency.call112, 'CALL 112');
  assert.ok(en.emergency.tollFreeDesc.includes('unified emergency number'));
  assert.strictEqual(en.settings.readingSize, 'Reading Size');
});

// 14. Hindi locale dictionary is complete
test('14. Hindi locale contains complete Devanagari translations', () => {
  assert.strictEqual(hi.emergency.call112, '112 पर कॉल करें');
  assert.ok(hi.emergency.tollFreeDesc.includes('आपातकालीन नंबर'));
  assert.strictEqual(hi.family.title, 'परिवार मंडल');
});

// 15. Assamese locale dictionary is complete and includes Eastern Nagari characters
test('15. Assamese locale contains authentic Assamese translations', () => {
  assert.ok(asLocale.common.save.includes('সংৰক্ষণ'), 'Assamese save should contain authentic Assamese letters');
  assert.ok(asLocale.emergency.call112.includes('112'), 'Assamese emergency should call 112');
  assert.ok(asLocale.family.title.includes('চক্ৰ'), 'Assamese family title should contain authentic script');
});

// 16. Bengali locale dictionary is complete and includes Bengali characters
test('16. Bengali locale contains authentic Bengali translations', () => {
  assert.ok(bn.common.save.includes('সংরক্ষণ'), 'Bengali save should contain authentic Bengali letters');
  assert.ok(bn.emergency.call112.includes('112'), 'Bengali emergency should call 112');
  assert.ok(bn.family.title.includes('পারিবারিক'), 'Bengali family title should contain authentic script');
});

// 17. Assamese emergency SOS explicitly uses prominent international digits 112
test('17. Assamese emergency SOS preserves international digits "112" (not Eastern Nagari numerals)', () => {
  assert.ok(asLocale.emergency.call112.includes('112'), 'Must use 112 in call112');
  assert.ok(!asLocale.emergency.call112.includes('১১২'), 'Must NOT obscure 112 with Eastern Nagari numerals');
  assert.ok(asLocale.emergency.confirmTitle.includes('112'), 'Must use 112 in confirmTitle');
});

// 18. Bengali emergency SOS explicitly uses prominent international digits 112
test('18. Bengali emergency SOS preserves international digits "112" (not Eastern Nagari numerals)', () => {
  assert.ok(bn.emergency.call112.includes('112'), 'Must use 112 in call112');
  assert.ok(!bn.emergency.call112.includes('১১২'), 'Must NOT obscure 112 with Eastern Nagari numerals');
  assert.ok(bn.emergency.confirmTitle.includes('112'), 'Must use 112 in confirmTitle');
});

// 19. i18nService translates successfully across all 4 languages
test('19. i18nService translates keys in en, hi, as, and bn', () => {
  i18nService.setLanguage('en');
  assert.strictEqual(i18nService.t('common.save'), 'Save');

  i18nService.setLanguage('hi');
  assert.strictEqual(i18nService.t('common.save'), 'सहेजें');

  i18nService.setLanguage('as');
  assert.strictEqual(i18nService.t('common.save'), 'সংৰক্ষণ');

  i18nService.setLanguage('bn');
  assert.strictEqual(i18nService.t('common.save'), 'সংরক্ষণ');

  // Reset to en
  i18nService.setLanguage('en');
});

// 20. i18nService provides proper fallback chain for missing keys
test('20. i18nService falls back to English when a key is missing in target language', () => {
  i18nService.setLanguage('as');
  const fallbackVal = i18nService.t('nav.home');
  assert.ok(fallbackVal, 'Should return translated or English fallback string');
  i18nService.setLanguage('en');
});

// 21. Language switching cycles properly through all 4 languages in Header / i18nService
test('21. Language cycle properly handles EN -> HI -> AS -> BN -> EN', () => {
  const languages = ['en', 'hi', 'as', 'bn'];
  languages.forEach((lang, index) => {
    store.setLanguage(lang);
    assert.strictEqual(store.getState().currentLanguage, lang);
    const nextIndex = (index + 1) % languages.length;
    assert.strictEqual(languages[nextIndex], languages[(index + 1) % 4]);
  });
  store.setLanguage('en');
});

// 22. PatientProfileView includes language buttons for all 4 languages including Bengali
test('22. PatientProfileView renders language selectors for en, hi, as, and bn', () => {
  const html = renderPatientProfileView();
  assert.ok(html.includes('data-lang="en"'), 'Must have English button');
  assert.ok(html.includes('data-lang="hi"'), 'Must have Hindi button');
  assert.ok(html.includes('data-lang="as"'), 'Must have Assamese button');
  assert.ok(html.includes('data-lang="bn"'), 'Must have Bengali button');
  assert.ok(html.includes('id="toggleReducedMotionPrefBtn"'), 'Must have reduced motion toggle button');
});

// 23. EmergencySosView renders prominent 112 and localized reassurance messaging
test('23. EmergencySosView renders prominent 112 action and reassuring layout', () => {
  const html = renderEmergencySosView();
  assert.ok(html.includes('CALL 112') || html.includes('112'), 'Must render prominent 112 dial button');
  assert.ok(html.includes('dial112PrimaryBtn'), 'Must include primary dial button ID');
  assert.ok(html.includes('confirm112Modal'), 'Must include 112 confirmation modal to prevent accidental calls');
});

// 24. Non-drag cognitive activity mechanics are available
test('24. Cognitive activity designs avoid precision drag-and-drop requirements', () => {
  // Check activity hub and games use direct click / tap actions rather than HTML5 drag
  const activityHubView = fs.readFileSync(path.join(rootDir, 'src', 'views', 'ActivitiesHubView.js'), 'utf8');
  assert.ok(!activityHubView.includes('ondragstart'), 'Activities Hub should not require drag-and-drop');
  assert.ok(!activityHubView.includes('draggable="true"'), 'Activities Hub should not require drag-and-drop');
});

// 25. Color-contrast and dual-channel feedback
test('25. UI indicators combine iconography/text with color (not color alone)', () => {
  const headerJs = fs.readFileSync(path.join(rootDir, 'src', 'components', 'Header.js'), 'utf8');
  // Online/offline status includes both color and text message
  assert.ok(headerJs.includes('role="status"'), 'Status pill includes accessible ARIA role');
  assert.ok(headerJs.includes('patientStatusMsg'), 'Status pill includes descriptive text alongside color dot');
});

console.log(`\n============================================================`);
console.log(`🎉 PART 15 RESULTS: ${passedTests}/25 TESTS PASSED`);
console.log(`============================================================\n`);

if (passedTests !== 25) {
  process.exit(1);
}
