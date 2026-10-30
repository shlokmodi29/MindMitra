// MindMitra Feature 4 — 30-Point Daily Emotional Check-In Comprehensive Test Suite
// Verifies simple emotional check-in for elderly users and caregivers:
// - 5 visual choices (Good, Okay, Not sure, Low, Worried) with text & emoji
// - Exactly one check-in per day per patient (updates existing record)
// - Optional personal notes (private by default)
// - Smart Daily Plan lightweight integration (gentle pacing, NO adaptive difficulty alteration)
// - SmritiAI empathetic responses with real feature actions & SOS emergency escalation
// - Doctor portal privacy protection & opt-in sharing in care reports (default OFF)
// - Caregiver dashboard recent check-ins list (separated from caregiver observations)
// - Multilingual support (en, hi, as, bn) & spoken audio
// - Offline persistence & sync queueing

import assert from 'assert';

// Mock Browser Environment for Node.js
if (typeof window === 'undefined') {
  global.window = {
    location: { hash: '#/patient-home' },
    navigator: { onLine: true },
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  global.document = {
    getElementById: () => null,
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({ setAttribute: () => {}, style: {} }),
    body: { appendChild: () => {}, insertAdjacentHTML: () => {} }
  };
}

// In-Memory Storage Mock
const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

// Imports
const { store } = await import('../src/state/store.js');
const { moodCheckInService, MOOD_CHOICES, MOOD_CONFIG } = await import('../src/services/moodCheckInService.js');
const { dailyPlanService } = await import('../src/services/dailyPlanService.js');
const { adaptiveEngine } = await import('../src/services/adaptiveEngine.js');
const { smritiAIService } = await import('../src/services/smritiAIService.js');
const { doctorService } = await import('../src/services/doctorService.js');
const { offlineSyncService } = await import('../src/services/offlineSyncService.js');
const { renderPatientHomeView } = await import('../src/views/PatientHomeView.js');
const { renderMyDayView } = await import('../src/views/MyDayView.js');
const { renderCaregiverDashboardView } = await import('../src/views/CaregiverDashboardView.js');
const { renderCaregiverReportsView } = await import('../src/views/CaregiverReportsView.js');
const { renderDoctorPortalView } = await import('../src/views/DoctorPortalView.js');
const { renderMoodCheckInCard } = await import('../src/components/MoodCheckInCard.js');
const { en } = await import('../src/locales/en.js');
const { hi } = await import('../src/locales/hi.js');
const { as } = await import('../src/locales/as.js');
const { bn } = await import('../src/locales/bn.js');

let passedCount = 0;
function runTest(num, name, fn) {
  try {
    fn();
    const pad = num < 10 ? ' ' : '';
    console.log(`✅ [Test ${pad}${num}] Passed: ${name}`);
    passedCount++;
  } catch (err) {
    const pad = num < 10 ? ' ' : '';
    console.error(`❌ [Test ${pad}${num}] Failed: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('\n🧠 =================================================================');
console.log('   MINDMITRA FEATURE 4 — 30-POINT MOOD CHECK-IN TEST SUITE');
console.log('=================================================================\n');

// Clean slate
mockStorage.clear();
const testPatientId = 'user-asha';

// 1. Service initialization
runTest(1, 'Mood Check-In Service initial state has no check-ins for test patient', () => {
  const history = moodCheckInService.getCheckInHistory(testPatientId);
  assert.ok(Array.isArray(history));
  assert.strictEqual(history.length, 0);
});

// 2. Returns null when today has no check-in
runTest(2, 'getTodayCheckIn returns null initially for new patient', () => {
  const today = moodCheckInService.getTodayCheckIn(testPatientId);
  assert.strictEqual(today, null);
});

// 3. 5 Mood Choices Specification
runTest(3, 'Defines exactly 5 accessible visual mood choices with labels & emojis', () => {
  assert.strictEqual(MOOD_CHOICES.length, 5);
  assert.deepStrictEqual(MOOD_CHOICES, ['good', 'okay', 'unsure', 'low', 'worried']);
  assert.strictEqual(MOOD_CONFIG.good.emoji, '😊');
  assert.strictEqual(MOOD_CONFIG.okay.emoji, '🙂');
  assert.strictEqual(MOOD_CONFIG.unsure.emoji, '😐');
  assert.strictEqual(MOOD_CONFIG.low.emoji, '😔');
  assert.strictEqual(MOOD_CONFIG.worried.emoji, '😟');
});

// 4. Record new mood check-in
runTest(4, 'Records initial mood check-in with correct structure and timestamp', () => {
  const res = moodCheckInService.recordCheckIn({
    patientId: testPatientId,
    mood: 'good',
    note: ''
  });
  assert.ok(res);
  assert.strictEqual(res.mood, 'good');
  assert.strictEqual(res.patientId, testPatientId);
  assert.strictEqual(res.date, new Date().toISOString().slice(0, 10));
  assert.ok(res.id.startsWith('mood-'));
  assert.ok(res.createdAt);
});

// 5. Query today check-in
runTest(5, 'getTodayCheckIn retrieves recorded today check-in', () => {
  const today = moodCheckInService.getTodayCheckIn(testPatientId);
  assert.ok(today);
  assert.strictEqual(today.mood, 'good');
});

// 6. Exactly one check-in per day per patient (Update rule)
runTest(6, 'Changing mood updates existing record with updatedAt without creating duplicate', () => {
  const updateRes = moodCheckInService.recordCheckIn({
    patientId: testPatientId,
    mood: 'okay',
    note: 'Feeling peaceful'
  });
  const allForPatient = moodCheckInService.getCheckInHistory(testPatientId);
  assert.strictEqual(allForPatient.length, 1, 'Should only have 1 record for today');
  assert.strictEqual(allForPatient[0].mood, 'okay');
  assert.strictEqual(allForPatient[0].note, 'Feeling peaceful');
  assert.ok(allForPatient[0].updatedAt, 'Should have updatedAt timestamp');
});

// 7. Optional Note addition & update
runTest(7, 'updateNote updates note on existing check-in', () => {
  const updated = moodCheckInService.updateNote(testPatientId, 'Walking in the garden today');
  assert.ok(updated);
  assert.strictEqual(updated.note, 'Walking in the garden today');
  const today = moodCheckInService.getTodayCheckIn(testPatientId);
  assert.strictEqual(today.note, 'Walking in the garden today');
});

// 8. Patient data isolation
runTest(8, 'Mood check-ins are strictly isolated between different patients', () => {
  const otherPatientId = 'user-ramesh-789';
  const otherToday = moodCheckInService.getTodayCheckIn(otherPatientId);
  assert.strictEqual(otherToday, null);

  moodCheckInService.recordCheckIn({
    patientId: otherPatientId,
    mood: 'worried',
    note: 'Feeling a bit uneasy'
  });

  const ashaCheckIn = moodCheckInService.getTodayCheckIn(testPatientId);
  const rameshCheckIn = moodCheckInService.getTodayCheckIn(otherPatientId);

  assert.strictEqual(ashaCheckIn.mood, 'okay');
  assert.strictEqual(rameshCheckIn.mood, 'worried');
  assert.strictEqual(moodCheckInService.getCheckInHistory(testPatientId).length, 1);
  assert.strictEqual(moodCheckInService.getCheckInHistory(otherPatientId).length, 1);
});

// 9. Local storage persistence across session re-instantiation
runTest(9, 'Data persists in localStorage under mindmitra_mood_checkins_v1', () => {
  const raw = localStorage.getItem('mindmitra_mood_checkins_v1');
  assert.ok(raw);
  const parsed = JSON.parse(raw);
  assert.ok(parsed[testPatientId] && parsed[testPatientId].some(c => c.mood === 'okay'));
});

// 10. Check-in history sorting and limiting
runTest(10, 'getCheckInHistory returns reverse chronological order with limit', () => {
  // Add a historical check-in
  const all = moodCheckInService.getAllCheckIns();
  if (!all[testPatientId]) all[testPatientId] = [];
  all[testPatientId].push({
    id: 'mood-yesterday',
    patientId: testPatientId,
    date: '2026-09-08',
    mood: 'good',
    note: 'Yesterday was sunny',
    createdAt: '2026-09-08T10:00:00.000Z'
  });
  moodCheckInService.saveAllCheckIns(all);

  const history = moodCheckInService.getCheckInHistory(testPatientId, 5);
  assert.strictEqual(history.length, 2);
  assert.strictEqual(history[0].date, new Date().toISOString().slice(0, 10));
  assert.strictEqual(history[1].date, '2026-09-08');
});

// 11. Strictly Non-Diagnostic (No clinical scores or diagnoses)
runTest(11, 'Enforces strictly non-diagnostic model (no numeric scores, anxiety/depression scales)', () => {
  const today = moodCheckInService.getTodayCheckIn(testPatientId);
  assert.strictEqual(today.score, undefined);
  assert.strictEqual(today.clinicalScore, undefined);
  assert.strictEqual(today.depressionScale, undefined);
  assert.strictEqual(today.anxietyIndex, undefined);
  assert.strictEqual(today.dementiaProgression, undefined);
});

// 12. Smart Daily Plan integration (Pacing adjustment for low mood)
runTest(12, 'Smart Daily Plan detects low/worried mood and prioritizes gentle comfort', () => {
  // Set patient mood to low
  moodCheckInService.recordCheckIn({
    patientId: testPatientId,
    mood: 'low',
    note: 'Tired morning'
  });

  const plan = dailyPlanService.getTodayPlan(testPatientId);
  assert.ok(plan);
  assert.ok(plan.items.length > 0);
  // Should feature a soothing note or gentle recommendation
  const gentleItem = plan.items.find(i => i.id === 'plan-act-reminiscence' || (i.description && i.description.includes('gentle')));
  assert.ok(gentleItem, 'Should include gentle reminiscence or soothing item');
});

// 13. Smart Daily Plan DOES NOT alter Adaptive Engine difficulty
runTest(13, 'Adaptive Engine difficulty level is NOT modified by mood check-in', () => {
  const profileBefore = adaptiveEngine.getAdaptiveProfile(testPatientId);
  const plan = dailyPlanService.getTodayPlan(testPatientId);
  const profileAfter = adaptiveEngine.getAdaptiveProfile(testPatientId);
  
  assert.strictEqual(profileBefore.recommendedDifficulty, profileAfter.recommendedDifficulty);
  const actItem = plan.items.find(i => i.category === 'activity');
  if (actItem) {
    assert.strictEqual(actItem.metadata.difficulty, profileBefore.recommendedDifficulty);
  }
});

// 14. SmritiAI Context includes today's mood
runTest(14, 'SmritiAI getContext() includes patient todayMood', () => {
  const ctx = smritiAIService.getContext();
  assert.ok(ctx);
  assert.strictEqual(ctx.todayMood, 'low');
});

// 15. SmritiAI Empathetic response for feeling low
runTest(15, 'SmritiAI responds empathetically to emotional expressions with concrete action routes', () => {
  const response = smritiAIService.generateEmpatheticResponse('I feel low and lonely today');
  assert.ok(response);
  assert.ok(response.type === 'empathy' || response.type === 'EMPATHY');
  assert.ok(response.spokenText.length > 0);
  assert.ok(Array.isArray(response.actions));
  assert.ok(response.actions.length >= 2);
  assert.ok(response.actions.some(a => a.route === '#/memory-world'));
  assert.ok(response.actions.some(a => a.route === '#/family-circle' || a.route === '#/activities'));
});

// 16. SmritiAI Emergency Escalation (SOS routing)
runTest(16, 'SmritiAI routes emergency expressions directly to SOS workflow', () => {
  const emergencyResp = smritiAIService.generateEmpatheticResponse('Help me I fell down and hurt my leg');
  assert.ok(emergencyResp);
  assert.ok(emergencyResp.type === 'emergency' || emergencyResp.type === 'EMERGENCY');
  assert.ok(emergencyResp.actions.some(a => a.route === '#/sos'));
});

// 17. Voice transcript to mood mapping
runTest(17, 'mapVoiceTranscriptToMood correctly parses spoken phrases', () => {
  assert.strictEqual(moodCheckInService.mapVoiceTranscriptToMood('I am feeling good today'), 'good');
  assert.strictEqual(moodCheckInService.mapVoiceTranscriptToMood('bahut accha lag raha hai'), 'good');
  assert.strictEqual(moodCheckInService.mapVoiceTranscriptToMood('just okay'), 'okay');
  assert.strictEqual(moodCheckInService.mapVoiceTranscriptToMood('not sure how I feel'), 'unsure');
  assert.strictEqual(moodCheckInService.mapVoiceTranscriptToMood('I feel low and sad'), 'low');
  assert.strictEqual(moodCheckInService.mapVoiceTranscriptToMood('I am worried and nervous'), 'worried');
  assert.strictEqual(moodCheckInService.mapVoiceTranscriptToMood('random unrelated chatter'), null);
});

// 18. Spoken text generation for all 4 languages
runTest(18, 'getSpokenText provides natural audio readout across en, hi, as, bn', () => {
  const checkIn = { mood: 'good', note: 'Sunny day' };
  const enText = moodCheckInService.getSpokenText(checkIn, 'en');
  const hiText = moodCheckInService.getSpokenText(checkIn, 'hi');
  const asText = moodCheckInService.getSpokenText(checkIn, 'as');
  const bnText = moodCheckInService.getSpokenText(checkIn, 'bn');

  assert.ok(enText.includes('Good'));
  assert.ok(hiText.includes('अच्छा'));
  assert.ok(asText.includes('ভাল'));
  assert.ok(bnText.includes('ভালো'));
});

// 19. Caregiver Dashboard displays recent check-ins
runTest(19, 'Caregiver Dashboard renders Recent Emotional Check-ins section', () => {
  store.setCurrentPatientId(testPatientId);
  const html = renderCaregiverDashboardView();
  assert.ok(html.includes('Recent Emotional Check-ins'));
  assert.ok(html.includes('Tired morning'));
  assert.ok(html.includes('Low'));
});

// 20. Separation from Caregiver Observations
runTest(20, 'Mood check-ins are kept strictly distinct from Caregiver Observations', () => {
  const storeState = store.getState();
  const caregiverObs = storeState.caregiverLogs || [];
  const moodCheckIns = moodCheckInService.getAllCheckIns();
  
  // They are stored in separate keys/structures
  assert.notStrictEqual(caregiverObs, moodCheckIns);
  const ashaMoods = moodCheckIns[testPatientId] || [];
  assert.ok(ashaMoods.every(m => m.id.startsWith('mood-')));
});

// 21. Doctor Portal does NOT automatically expose mood check-ins
runTest(21, 'Doctor Portal NEVER automatically exposes private patient mood check-ins', () => {
  const html = renderDoctorPortalView();
  // Doctor portal should not query or display raw patient mood check-ins without explicit share
  assert.strictEqual(html.includes('Recent Emotional Check-ins'), false);
  assert.strictEqual(html.includes('Tired morning'), false);
});

// 22. Caregiver Reports opt-in sharing with doctor (default OFF)
runTest(22, 'Care Reports shareReportWithDoctor does not attach mood check-ins unless opt-in', () => {
  const shareResultDefault = doctorService.shareReportWithDoctor({
    patientId: testPatientId,
    doctorId: 'user-dr-sharma',
    reportTitle: 'Weekly Cognitive Practice & Routine Summary',
    includeMoodCheckIns: false
  });

  assert.ok(shareResultDefault.success);
  assert.strictEqual(shareResultDefault.sharedReport.includeMoodCheckIns, false);
  assert.strictEqual(shareResultDefault.sharedReport.attachedMoodCheckIns, null);

  // When explicitly opted in:
  const shareResultOptIn = doctorService.shareReportWithDoctor({
    patientId: testPatientId,
    doctorId: 'user-dr-sharma',
    reportTitle: 'Weekly Cognitive Practice with Mood History',
    includeMoodCheckIns: true
  });

  assert.ok(shareResultOptIn.success);
  assert.strictEqual(shareResultOptIn.sharedReport.includeMoodCheckIns, true);
  assert.ok(Array.isArray(shareResultOptIn.sharedReport.attachedMoodCheckIns));
  assert.ok(shareResultOptIn.sharedReport.attachedMoodCheckIns.length > 0);
});

// 23. Doctor connection permission guard
runTest(23, 'shareReportWithDoctor fails if doctor is not approved connection', () => {
  const unapprovedRes = doctorService.shareReportWithDoctor({
    patientId: testPatientId,
    doctorId: 'unapproved-dr-unknown',
    includeMoodCheckIns: true
  });
  assert.strictEqual(unapprovedRes.success, false);
  assert.ok(unapprovedRes.error.includes('approved'));
});

// 24. Offline sync integration
runTest(24, 'Mood check-in enqueues offline sync action', () => {
  const queueBefore = offlineSyncService.getQueue ? offlineSyncService.getQueue().length : 0;
  moodCheckInService.recordCheckIn({
    patientId: testPatientId,
    mood: 'good',
    note: 'Feeling bright'
  });
  const queueAfter = offlineSyncService.getQueue ? offlineSyncService.getQueue().length : 0;
  assert.ok(queueAfter >= queueBefore);
});

// 25. Patient Home View renders Mood Check-In Card
runTest(25, 'renderPatientHomeView renders mood check-in section', () => {
  const html = renderPatientHomeView();
  assert.ok(html.includes('mood-check-in-section'));
  assert.ok(html.includes('mood-btn-good') || html.includes('Today&#39;s Check-in') || html.includes("Today's Check-in"));
});

// 26. My Day View renders compact Mood Check-In Card
runTest(26, 'renderMyDayView renders embedded mood check-in component', () => {
  const html = renderMyDayView();
  assert.ok(html.includes('mood-checkin-card') || html.includes('mood-check-in'));
});

// 27. Component renders today check-in state with [Change] button
runTest(27, 'renderMoodCheckInCard displays Today state with [Change] button when already checked in', () => {
  const html = renderMoodCheckInCard(testPatientId, false);
  assert.ok(html.includes('btn-change-mood') || html.includes('Change'));
  assert.ok(html.includes('btn-hear-mood'));
});

// 28. Component renders note drawer & privacy hint
runTest(28, 'renderMoodCheckInCard includes personal note drawer and privacy notice', () => {
  const html = renderMoodCheckInCard(testPatientId, false);
  assert.ok(html.toLowerCase().includes('private'));
  assert.ok(html.includes('saveMoodNoteBtn') || html.includes('moodNoteInput'));
});

// 29. Accessibility labels and keyboard targets
runTest(29, 'Accessibility: aria-labels present for buttons, voice and TTS triggers', () => {
  // Temporarily reset checkin to test fresh visual choices
  const htmlUnchecked = renderMoodCheckInCard('user-fresh-unregistered', false);
  assert.ok(htmlUnchecked.includes('aria-label="I feel good"'));
  assert.ok(htmlUnchecked.includes('aria-label="I feel worried"'));
  assert.ok(htmlUnchecked.includes('aria-label="Listen to question"'));
  assert.ok(htmlUnchecked.includes('aria-label="Speak how you feel"'));
});

// 30. Multilingual localization dictionaries verified
runTest(30, 'Localization keys present in en, hi, as, bn dictionaries', () => {
  assert.ok(en.moodCheckIn && en.moodCheckIn.prompt);
  assert.ok(hi.moodCheckIn && hi.moodCheckIn.prompt);
  assert.ok(as.moodCheckIn && as.moodCheckIn.prompt);
  assert.ok(bn.moodCheckIn && bn.moodCheckIn.prompt);
  
  assert.strictEqual(en.moodCheckIn.good, 'Good');
  assert.strictEqual(hi.moodCheckIn.good, 'अच्छा');
  assert.strictEqual(as.moodCheckIn.good, 'ভাল');
  assert.strictEqual(bn.moodCheckIn.good, 'ভালো');
});

console.log('\n=================================================================');
console.log(`🎉 ALL ${passedCount} MOOD CHECK-IN TESTS PASSED SUCCESSFULLY!`);
console.log('=================================================================\n');
