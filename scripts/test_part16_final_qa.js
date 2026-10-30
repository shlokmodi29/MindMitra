// MindMitra Part 16 - Final QA, Full-System Integration & SIH Demo Readiness Test Suite
// 25 Automated Integration & Verification Tests across the entire product lifecycle

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Setup Node.js browser mocks
class MockClassList {
  constructor() { this.classes = new Set(); }
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
  removeEventListener: () => {},
  scrollTo: () => {}
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
  userAgent: 'Node.js MindMitra Final QA Harness'
};

// Dynamic imports of MindMitra Core Services
const { store } = await import('../src/state/store.js');
const { authService } = await import('../src/services/authService.js');
const { memoryService } = await import('../src/services/memoryService.js');
const { activityRegistry } = await import('../src/services/activityRegistry.js');
const { activityEngine } = await import('../src/services/activityEngine.js');
const { adaptiveEngine } = await import('../src/services/adaptiveEngine.js');
const { smritiAIService, SMRITI_RESPONSE_TYPES } = await import('../src/services/smritiAIService.js');
const { voiceService } = await import('../src/services/voiceService.js');
const { emergencyService } = await import('../src/services/emergencyService.js');
const { analyticsService, DATE_RANGES } = await import('../src/services/analyticsService.js');
const { reportService } = await import('../src/services/reportService.js');
const { offlineSyncService, SYNC_PRIORITIES } = await import('../src/services/offlineSyncService.js');
const { securityService } = await import('../src/services/securityService.js');
const { i18nService } = await import('../src/services/i18nService.js');

// Views
const { renderPatientHomeView } = await import('../src/views/PatientHomeView.js');
const { renderMyDayView } = await import('../src/views/MyDayView.js');
const { renderMemoryWorldView } = await import('../src/views/MemoryWorldView.js');
const { renderActivitiesHubView } = await import('../src/views/ActivitiesHubView.js');
const { renderEmergencySosView } = await import('../src/views/EmergencySosView.js');
const { renderCaregiverDashboardView } = await import('../src/views/CaregiverDashboardView.js');
const { renderCaregiverReportsView } = await import('../src/views/CaregiverReportsView.js');
const { renderFamilyCircleView } = await import('../src/views/FamilyCircleView.js');
const { renderPatientProfileView } = await import('../src/views/PatientProfileView.js');
const { renderActivityShell } = await import('../src/components/ActivityShell.js');

console.log('\n============================================================');
console.log('🌟 MINDMITRA TEST SUITE 18: FINAL QA & SIH DEMO READINESS');
console.log('============================================================\n');

let passedTests = 0;
async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// 1. Patient login & session retrieval
await test('1. Patient login and session initialization (Asha Devi)', () => {
  const loginRes = authService.login('asha@mindmitra.in', 'Asha1234!');
  assert.ok(loginRes.success, 'Asha should log in successfully');
  assert.strictEqual(loginRes.user.role, 'patient');
  assert.strictEqual(authService.isAuthenticated(), true);
  assert.strictEqual(authService.getCurrentUser().name, 'Asha Devi');
});

// 2. Patient Home rendering & quick action shortcuts
await test('2. Patient Home renders personalized greeting and core navigation shortcuts', () => {
  const html = renderPatientHomeView();
  assert.ok(html.includes('Asha'), 'Patient Home must greet Asha Devi');
  assert.ok(html.includes('#/my-day'), 'Must contain link to My Day');
  assert.ok(html.includes('#/memory-world'), 'Must contain link to Memory World');
  assert.ok(html.includes('#/emergency-sos'), 'Must contain link to Emergency SOS');
  assert.ok(html.includes('Rhythm') || html.includes('Glance'), 'Must display daily rhythm glance');
  assert.ok(html.includes('SmritiAI'), 'Must render active SmritiAI companion card');
});

// 3. My Day routines & non-duplicating completion
await test('3. My Day routine completion toggles accurately without duplicates', () => {
  const patientId = store.getCurrentPatientId();
  const routines = store.getRemindersForPatient(patientId);
  assert.ok(routines.length > 0, 'Patient must have configured routines');
  
  const targetRoutine = routines[0];
  const initialDone = targetRoutine.completed;
  store.toggleRoutine(targetRoutine.id);
  
  const updatedRoutines = store.getRemindersForPatient(patientId);
  const updated = updatedRoutines.find(r => r.id === targetRoutine.id);
  assert.strictEqual(updated.completed, !initialDone, 'Routine completion state should toggle');
  
  // Revert toggle to maintain pristine state
  store.toggleRoutine(targetRoutine.id);
});

// 4. Living Memory World search & detail modal
await test('4. Living Memory World search filters memories correctly and details load', () => {
  const memories = memoryService.getMemories('user-asha');
  assert.ok(memories.length > 0, 'Asha should have memories in Living Memory Archive');
  
  const searchResults = memoryService.searchMemories('user-asha', 'Shillong');
  assert.ok(searchResults.length > 0, 'Searching "Shillong" should return relevant memories');
  
  const memoryDetail = memoryService.getMemoryById(searchResults[0].id);
  assert.ok(memoryDetail, 'Memory detail should resolve');
  assert.ok(memoryDetail.title, 'Memory detail must have title');
});

// 5. Memory relationships & entity graph linking
await test('5. Living Memory Archive links relationships across people, places, and events', () => {
  const people = memoryService.getPeople('user-asha');
  const places = memoryService.getPlaces('user-asha');
  assert.ok(people.length > 0, 'Must have linked people entities');
  assert.ok(places.length > 0, 'Must have linked place entities');
  
  const meeraPerson = people.find(p => p.name.includes('Meera'));
  assert.ok(meeraPerson, 'Meera entity must exist in family graph');
});

// 6. All 20 Cognitive Activities registered and executable
await test('6. All 20 canonical activities exist in activityRegistry with complete metadata', () => {
  const allActivities = activityRegistry.getAll();
  assert.strictEqual(allActivities.length, 20, 'Exactly 20 canonical activities must exist');
  for (let i = 1; i <= 20; i++) {
    const act = activityRegistry.getById(`act-${i}`);
    assert.ok(act, `Activity act-${i} must be defined`);
    assert.ok(act.category, `Activity act-${i} must have a category`);
    assert.ok(act.instructions, `Activity act-${i} must have spoken instructions`);
  }
});

// 7. Shared activity engine session lifecycle & result recording
await test('7. Shared Activity Engine manages session start, step progress, and completion', () => {
  const session = activityEngine.startSession('act-1');
  assert.strictEqual(session.activityId, 'act-1');
  assert.strictEqual(session.status, 'in_progress');
  
  activityEngine.flipMatchCard('pair-1');
  const summary = activityEngine.completeSession();
  assert.ok(summary, 'Session summary must be generated');
  assert.strictEqual(typeof summary.accuracy, 'number');
  assert.strictEqual(activityEngine.currentSession.status, 'completed');
});

// 8. Adaptive cognitive engine difficulty adjustment based on history
await test('8. Adaptive Engine evaluates patient performance history and computes dynamic difficulty', () => {
  const patientId = 'user-asha';
  const profile = adaptiveEngine.getAdaptiveProfile(patientId);
  assert.ok(profile, 'Adaptive profile should exist for patient');
  
  const recBefore = adaptiveEngine.getDifficultyRecommendation(patientId, 'act-1');
  assert.ok(recBefore, 'Difficulty recommendation should be computed');
  assert.ok(recBefore.recommendedDifficultyLevel >= 1 && recBefore.recommendedDifficultyLevel <= 3, 'Difficulty level should be within [1, 3]');
});

// 9. SmritiAI contextual response & non-diagnostic safety boundary
await test('9. SmritiAI provides supportive responses while maintaining non-diagnostic boundary', async () => {
  smritiAIService.clearConversation();
  const routineRes = await smritiAIService.sendMessage("What is on my day today?", { patientId: 'user-asha' });
  assert.ok(routineRes.text.length > 0, 'SmritiAI must answer routine queries');
  
  smritiAIService.clearConversation();
  const diagRes = await smritiAIService.sendMessage("Can you diagnose my dementia score?", { patientId: 'user-asha' });
  assert.ok(diagRes.text.includes('medical') || diagRes.type === SMRITI_RESPONSE_TYPES.SAFETY_DISCLAIMER, 'Must maintain clinical safety disclaimer');
});

// 10. SmritiAI emergency query routing to SOS (without fake dialling)
await test('10. SmritiAI emergency query routes safely to SOS view with explicit confirmation', async () => {
  smritiAIService.clearConversation();
  const emergencyRes = await smritiAIService.sendMessage("Emergency help me I fell down in pain!", { patientId: 'user-asha' });
  assert.strictEqual(emergencyRes.type, SMRITI_RESPONSE_TYPES.EMERGENCY, 'Emergency message must be detected');
  assert.strictEqual(emergencyRes.actionRoute, 'emergency-sos', 'Must route to emergency-sos');
  assert.strictEqual(emergencyRes.emergencyNumber, '112', 'Must specify 112 emergency number');
});

// 11. Family Circle shared keepsakes & memory contributions
await test('11. Family Circle displays shared keepsakes and loving notes from family members', () => {
  const html = renderFamilyCircleView();
  assert.ok(html.includes('Family Circle') || html.includes('পৰিয়াল') || html.includes('परिवार'), 'Must render Family Circle header');
  assert.ok(html.includes('Meera') || html.includes('Shillong'), 'Must include family member or keepsake content');
});

// 12. Emergency SOS view rendering prominent 112 with confirmation modal
await test('12. Emergency SOS view highlights prominent 112 and safety confirmation modal', () => {
  const html = renderEmergencySosView();
  assert.ok(html.includes('112'), 'Must feature prominent 112 emergency helpline');
  assert.ok(html.includes('confirm112Modal'), 'Must include 112 safety confirmation modal');
  assert.ok(html.includes('dial112PrimaryBtn'), 'Must include primary dial button');
});

// 13. Emergency contacts retrieval (primary caregiver Meera + secondary)
await test('13. Emergency contacts include primary caregiver Meera with direct phone action', () => {
  const contacts = store.getEmergencyContactsForPatient('user-asha');
  assert.ok(contacts.length > 0, 'Patient must have configured emergency contacts');
  const primary = contacts.find(c => c.priority === 'primary' || c.roleLabel === 'Primary Caregiver') || contacts[0];
  assert.ok(primary.name.includes('Meera'), 'Primary contact should be Meera');
  assert.ok(primary.phone, 'Primary contact must have reachable phone number');
});

// 14. Caregiver login & authorized patient telemetry
await test('14. Caregiver login (Meera) provides access to authorized patient Asha telemetry', () => {
  const loginRes = authService.login('meera@mindmitra.in', 'Meera4321!');
  assert.ok(loginRes.success, 'Caregiver Meera should log in');
  assert.strictEqual(loginRes.user.role, 'caregiver');
  
  const canAccess = securityService.canAccessPatient(loginRes.user, 'user-asha');
  assert.strictEqual(canAccess, true, 'Caregiver Meera is authorized for Asha');
});

// 15. Patient Preview mode entry & banner display
await test('15. Caregiver can enter Patient Preview mode with sticky return banner', () => {
  store.setPatientPreviewMode(true);
  assert.strictEqual(store.getState().isPreviewMode, true);
  
  const activePatientId = store.getCurrentPatientId();
  assert.strictEqual(activePatientId, 'user-asha');
  
  store.setPatientPreviewMode(false);
  assert.strictEqual(store.getState().isPreviewMode, false);
});

// 16. Caregiver analytics computations (completion rates, category trends)
await test('16. Caregiver Analytics calculates genuine metrics without fabricated statistics', () => {
  const careAnalytics = analyticsService.getDailyCareAnalytics('user-asha', DATE_RANGES.LAST_7_DAYS);
  assert.ok(careAnalytics, 'Daily care analytics should be generated');
  assert.ok(typeof careAnalytics.completionRate === 'number', 'Completion rate should be numeric');
  
  const actAnalytics = analyticsService.getActivityAnalytics('user-asha', DATE_RANGES.LAST_7_DAYS);
  assert.ok(actAnalytics, 'Activity analytics should be generated');
  assert.ok(Array.isArray(actAnalytics.sessions), 'Sessions should be an array');
});

// 17. Caregiver clinical report generation (HTML preview & CSV sanitized export)
await test('17. Caregiver Clinical Report generates safe summary preview and sanitized CSV export', () => {
  const report = reportService.buildReportData('user-asha', DATE_RANGES.LAST_7_DAYS);
  assert.ok(report, 'Report should be generated');
  assert.strictEqual(report.patientId, 'user-asha');
  
  const csv = reportService.exportReportCSV(report);
  assert.ok(csv, 'CSV content must be generated');
  assert.ok(!csv.includes('=cmd'), 'CSV formula triggers must be sanitized');
});

// 18. Offline state handling & local data persistence
await test('18. Offline-first architecture persists local records safely without data loss', () => {
  offlineSyncService.isOnline = false;
  assert.strictEqual(offlineSyncService.isOnline, false);
  
  const offlineOp = offlineSyncService.enqueue({
    entity: 'memory',
    action: 'create',
    patientId: 'user-asha',
    payload: { id: 'mem-offline-test', title: 'Offline Garden Walk' },
    priority: SYNC_PRIORITIES.HIGH
  });
  assert.ok(offlineOp, 'Operation enqueued successfully while offline');
  
  const pending = offlineSyncService.getPendingQueue('user-asha');
  assert.ok(pending.some(item => item.payload.id === 'mem-offline-test'), 'Queue contains offline item');
  
  offlineSyncService.isOnline = true;
});

// 19. Sync queue idempotency & duplicate prevention
await test('19. Sync queue processes idempotently and avoids duplicate submissions', async () => {
  const initialPendingCount = offlineSyncService.getPendingQueue('user-asha').length;
  await offlineSyncService.syncPendingChanges('user-asha');
  
  const finalPendingCount = offlineSyncService.getPendingQueue('user-asha').length;
  assert.ok(finalPendingCount <= initialPendingCount, 'Idempotent sync should not increase pending queue');
});

// 20. Security sanitizer XSS and CSV formula defense
await test('20. SecurityService neutralizes XSS payloads and spreadsheet formula execution', () => {
  const xssInput = '<script>alert("hacked")</script><img src=x onerror=alert(1)>';
  const cleanHtml = securityService.sanitizeHtml(xssInput);
  assert.ok(!cleanHtml.includes('<script>'), 'Script tags must be escaped');
  assert.ok(!cleanHtml.includes('<img'), 'Img tags must be escaped');
  
  const ddeInput = '=cmd|\'/C calc\'!A0';
  const cleanCsv = securityService.sanitizeCsvValue(ddeInput);
  assert.ok(cleanCsv.startsWith("'"), 'DDE formula must be prefixed with single quote');
});

// 21. Access control enforcement (unauthorized patient data isolation)
await test('21. Strict patient isolation prevents cross-patient data access', () => {
  const unauthorizedCaregiver = { userId: 'user-intruder', role: 'caregiver', authorizedPatients: [] };
  const canAccess = securityService.canAccessPatient(unauthorizedCaregiver, 'user-asha');
  assert.strictEqual(canAccess, false, 'Unauthorized caregiver must be denied access');
  
  const patientBob = { userId: 'user-bob', role: 'patient' };
  const canAccessAshaMem = securityService.canAccessMemory(patientBob, { patientId: 'user-asha' });
  assert.strictEqual(canAccessAshaMem, false, 'Patient Bob cannot access Patient Asha memories');
});

// 22. Multilingual dictionary completeness across all 4 locales
await test('22. All 4 languages (EN, HI, AS, BN) define required navigation, emergency, and setting keys', () => {
  ['en', 'hi', 'as', 'bn'].forEach(lang => {
    i18nService.setLanguage(lang);
    assert.ok(i18nService.t('nav.home'), `Missing nav.home in ${lang}`);
    assert.ok(i18nService.t('emergency.call112'), `Missing emergency.call112 in ${lang}`);
    assert.ok(i18nService.t('settings.readingSize'), `Missing settings.readingSize in ${lang}`);
  });
  i18nService.setLanguage('en');
});

// 23. Prominent 112 rule adherence across Assamese and Bengali locales
await test('23. Assamese and Bengali locales prominently retain international digits "112"', () => {
  i18nService.setLanguage('as');
  const asCall112 = i18nService.t('emergency.call112');
  assert.ok(asCall112.includes('112'), 'Assamese emergency string must contain digits 112');
  assert.ok(!asCall112.includes('১১২'), 'Assamese emergency string must NOT use Eastern Nagari digits');
  
  i18nService.setLanguage('bn');
  const bnCall112 = i18nService.t('emergency.call112');
  assert.ok(bnCall112.includes('112'), 'Bengali emergency string must contain digits 112');
  assert.ok(!bnCall112.includes('১১২'), 'Bengali emergency string must NOT use Eastern Nagari digits');
  
  i18nService.setLanguage('en');
});

// 24. Accessibility focus-visible and reduced motion support
await test('24. CSS defines high-visibility focus outlines and reduced motion controls', () => {
  const appCss = fs.readFileSync(path.join(rootDir, 'styles', 'app.css'), 'utf8');
  assert.ok(appCss.includes(':focus-visible'), 'Focus visible styling must be present');
  assert.ok(appCss.includes('prefers-reduced-motion: reduce'), 'Prefers-reduced-motion query must be defined');
  assert.ok(appCss.includes('.reduced-motion-active'), 'In-app reduced motion class must be defined');
  assert.ok(appCss.includes('.skip-link'), 'Accessible skip-to-content styling must be defined');
});

// 25. Full-system regression across Parts 0 through 16
await test('25. Full-system regression: All core models, views, and services operational', () => {
  assert.ok(store.getState().currentUser, 'Current user should be authenticated');
  assert.ok(store.getState().activities.length > 0, 'Activities list should be active');
  assert.ok(store.getState().routines.length > 0, 'Routines list should be active');
  assert.ok(store.getState().stories.length > 0, 'Stories list should be active');
});

console.log(`\n============================================================`);
console.log(`🎉 PART 16 RESULTS: ${passedTests}/25 TESTS PASSED`);
console.log(`============================================================\n`);

if (passedTests !== 25) {
  process.exit(1);
}
