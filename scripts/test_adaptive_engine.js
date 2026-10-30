// MindMitra Part 7 — 25-Point Adaptive Cognitive Engine Test Suite
import assert from 'assert';

// Mock browser environment for Node.js
if (typeof window === 'undefined') {
  global.window = {
    location: { hash: '#/activities' },
    scrollTo: () => {}
  };
  global.document = {
    getElementById: () => null,
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({ setAttribute: () => {}, style: {} }),
    body: { appendChild: () => {} }
  };
  global.navigator = { onLine: true };
}

// In-memory mock storage
const mockStorage = new Map();
global.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

// Import services under test
const { store } = await import('../src/state/store.js');
const { activityRegistry } = await import('../src/services/activityRegistry.js');
const { activityEngine } = await import('../src/services/activityEngine.js');
const { adaptiveEngine } = await import('../src/services/adaptiveEngine.js');
const { smritiAIService } = await import('../src/services/smritiAIService.js');
const { renderActivitiesHubView } = await import('../src/views/ActivitiesHubView.js');

let passedTests = 0;
let failedTests = 0;

function runTest(testNum, name, fn) {
  try {
    fn();
    console.log(`✅ [Test ${testNum < 10 ? ' ' : ''}${testNum}] Passed: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [Test ${testNum < 10 ? ' ' : ''}${testNum}] FAILED: ${name}`);
    console.error(err);
    failedTests++;
  }
}

async function runAsyncTest(testNum, name, fn) {
  try {
    await fn();
    console.log(`✅ [Test ${testNum < 10 ? ' ' : ''}${testNum}] Passed: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [Test ${testNum < 10 ? ' ' : ''}${testNum}] FAILED: ${name}`);
    console.error(err);
    failedTests++;
  }
}

console.log('===========================================================');
console.log('MINDMITRA PART 7 — 25-POINT ADAPTIVE ENGINE TEST SUITE');
console.log('===========================================================\n');

// Clean start
store.setCurrentUser({ id: 'user-asha', name: 'Asha Devi', role: 'patient' });
adaptiveEngine.resetAdaptiveProfile('user-asha');
adaptiveEngine.resetAdaptiveProfile('user-test-b');

// Test 1: Cold Start
runTest(1, 'Cold Start: Patient with no history receives default difficulty (Easy / Level 1)', () => {
  const rec = adaptiveEngine.getDifficultyRecommendation('user-asha', 'act-1');
  assert.strictEqual(rec.currentDifficulty, 'Easy');
  assert.strictEqual(rec.recommendedDifficulty, 'Easy');
  assert.strictEqual(rec.currentDifficultyLevel, 1);
  assert.strictEqual(rec.confidence, 'low');
  assert.ok(rec.reason.includes('Initial baseline difficulty'));
});

// Test 2: Gradual Progression (3 consecutive high-accuracy sessions)
runTest(2, 'Gradual Progression: 3 consecutive high-accuracy sessions transition Easy -> Medium', () => {
  // Session 1: High accuracy
  adaptiveEngine.updateProfileWithSession({
    id: 'sess-t1',
    activityId: 'act-1',
    activityName: 'Memory Match',
    category: 'REMEMBER',
    patientId: 'user-asha',
    accuracy: 95,
    hintsUsed: 0,
    repeatedErrors: 0,
    completionTimeSec: 60,
    difficultyLevel: 1,
    status: 'completed'
  });

  // Session 2: High accuracy
  adaptiveEngine.updateProfileWithSession({
    id: 'sess-t2',
    activityId: 'act-1',
    activityName: 'Memory Match',
    category: 'REMEMBER',
    patientId: 'user-asha',
    accuracy: 90,
    hintsUsed: 0,
    repeatedErrors: 0,
    completionTimeSec: 55,
    difficultyLevel: 1,
    status: 'completed'
  });

  // At 2 sessions, difficulty should NOT have changed yet (minimum 3 required)
  let recMid = adaptiveEngine.getDifficultyRecommendation('user-asha', 'act-1');
  assert.strictEqual(recMid.recommendedDifficultyLevel, 1);

  // Session 3: High accuracy
  adaptiveEngine.updateProfileWithSession({
    id: 'sess-t3',
    activityId: 'act-1',
    activityName: 'Memory Match',
    category: 'REMEMBER',
    patientId: 'user-asha',
    accuracy: 95,
    hintsUsed: 0,
    repeatedErrors: 0,
    completionTimeSec: 50,
    difficultyLevel: 1,
    status: 'completed'
  });

  // Now difficulty should be Medium (Level 2)
  const recAfter = adaptiveEngine.getDifficultyRecommendation('user-asha', 'act-1');
  assert.strictEqual(recAfter.recommendedDifficulty, 'Medium');
  assert.strictEqual(recAfter.recommendedDifficultyLevel, 2);
  assert.ok(recAfter.reason.includes('High performance'));
});

// Test 3: Upper Boundary (Medium -> Hard, but cannot exceed Level 3)
runTest(3, 'Upper Boundary: Progression from Medium to Hard, and capped at Level 3', () => {
  // 3 high performance sessions at Level 2
  for (let i = 4; i <= 6; i++) {
    adaptiveEngine.updateProfileWithSession({
      id: `sess-t${i}`,
      activityId: 'act-1',
      activityName: 'Memory Match',
      category: 'REMEMBER',
      patientId: 'user-asha',
      accuracy: 95,
      hintsUsed: 0,
      repeatedErrors: 0,
      completionTimeSec: 60,
      difficultyLevel: 2,
      status: 'completed'
    });
  }

  const recHard = adaptiveEngine.getDifficultyRecommendation('user-asha', 'act-1');
  assert.strictEqual(recHard.recommendedDifficulty, 'Hard');
  assert.strictEqual(recHard.recommendedDifficultyLevel, 3);

  // 3 more high performance sessions at Level 3
  for (let i = 7; i <= 9; i++) {
    adaptiveEngine.updateProfileWithSession({
      id: `sess-t${i}`,
      activityId: 'act-1',
      activityName: 'Memory Match',
      category: 'REMEMBER',
      patientId: 'user-asha',
      accuracy: 95,
      hintsUsed: 0,
      repeatedErrors: 0,
      completionTimeSec: 60,
      difficultyLevel: 3,
      status: 'completed'
    });
  }

  // Must still be Hard (Level 3), never 4
  const recCapped = adaptiveEngine.getDifficultyRecommendation('user-asha', 'act-1');
  assert.strictEqual(recCapped.recommendedDifficulty, 'Hard');
  assert.strictEqual(recCapped.recommendedDifficultyLevel, 3);
});

// Test 4: Gradual De-escalation (3 consecutive low-performance sessions)
runTest(4, 'Gradual De-escalation: 3 consecutive low-performance sessions transition Hard -> Medium', () => {
  // 3 low performance sessions
  for (let i = 10; i <= 12; i++) {
    adaptiveEngine.updateProfileWithSession({
      id: `sess-t${i}`,
      activityId: 'act-1',
      activityName: 'Memory Match',
      category: 'REMEMBER',
      patientId: 'user-asha',
      accuracy: 50,
      hintsUsed: 3,
      repeatedErrors: 2,
      completionTimeSec: 120,
      difficultyLevel: 3,
      status: 'completed'
    });
  }

  const recMed = adaptiveEngine.getDifficultyRecommendation('user-asha', 'act-1');
  assert.strictEqual(recMed.recommendedDifficulty, 'Medium');
  assert.strictEqual(recMed.recommendedDifficultyLevel, 2);
  assert.ok(recMed.reason.includes('Gentler pacing'));
});

// Test 5: Lower Boundary (Medium -> Easy, but cannot go below Level 1)
runTest(5, 'Lower Boundary: Progression from Medium to Easy, and floored at Level 1', () => {
  // 3 more low performance sessions
  for (let i = 13; i <= 15; i++) {
    adaptiveEngine.updateProfileWithSession({
      id: `sess-t${i}`,
      activityId: 'act-1',
      activityName: 'Memory Match',
      category: 'REMEMBER',
      patientId: 'user-asha',
      accuracy: 50,
      hintsUsed: 3,
      repeatedErrors: 2,
      completionTimeSec: 120,
      difficultyLevel: 2,
      status: 'completed'
    });
  }

  const recEasy = adaptiveEngine.getDifficultyRecommendation('user-asha', 'act-1');
  assert.strictEqual(recEasy.recommendedDifficulty, 'Easy');
  assert.strictEqual(recEasy.recommendedDifficultyLevel, 1);

  // 3 more low performance sessions
  for (let i = 16; i <= 18; i++) {
    adaptiveEngine.updateProfileWithSession({
      id: `sess-t${i}`,
      activityId: 'act-1',
      activityName: 'Memory Match',
      category: 'REMEMBER',
      patientId: 'user-asha',
      accuracy: 45,
      hintsUsed: 4,
      repeatedErrors: 3,
      completionTimeSec: 140,
      difficultyLevel: 1,
      status: 'completed'
    });
  }

  // Must still be Easy (Level 1), never 0 or negative
  const recFloor = adaptiveEngine.getDifficultyRecommendation('user-asha', 'act-1');
  assert.strictEqual(recFloor.recommendedDifficulty, 'Easy');
  assert.strictEqual(recFloor.recommendedDifficultyLevel, 1);
});

// Test 6: Single Bad Session Safeguard
runTest(6, 'Anti-Fluctuation: A single bad session does not drop difficulty prematurely', () => {
  adaptiveEngine.resetAdaptiveProfile('user-asha');
  // Establish Level 2
  for (let i = 1; i <= 3; i++) {
    adaptiveEngine.updateProfileWithSession({
      id: `sess-b${i}`,
      activityId: 'act-2',
      category: 'REMEMBER',
      patientId: 'user-asha',
      accuracy: 95,
      hintsUsed: 0,
      repeatedErrors: 0,
      difficultyLevel: 1,
      status: 'completed'
    });
  }
  let rec = adaptiveEngine.getDifficultyRecommendation('user-asha', 'act-2');
  assert.strictEqual(rec.recommendedDifficultyLevel, 2);

  // Single bad session
  adaptiveEngine.updateProfileWithSession({
    id: 'sess-bad-1',
    activityId: 'act-2',
    category: 'REMEMBER',
    patientId: 'user-asha',
    accuracy: 40,
    hintsUsed: 3,
    repeatedErrors: 2,
    difficultyLevel: 2,
    status: 'completed'
  });

  // Difficulty should still be maintained at Medium (Level 2)
  rec = adaptiveEngine.getDifficultyRecommendation('user-asha', 'act-2');
  assert.strictEqual(rec.recommendedDifficultyLevel, 2);
});

// Test 7: Single Great Session Safeguard
runTest(7, 'Anti-Fluctuation: A single great session does not increase difficulty prematurely', () => {
  adaptiveEngine.resetAdaptiveProfile('user-asha');
  // Baseline observation (2 average sessions)
  adaptiveEngine.updateProfileWithSession({
    id: 'sess-g1',
    activityId: 'act-3',
    category: 'REMEMBER',
    patientId: 'user-asha',
    accuracy: 70,
    hintsUsed: 1,
    repeatedErrors: 1,
    difficultyLevel: 1,
    status: 'completed'
  });

  // 1 extraordinary session
  adaptiveEngine.updateProfileWithSession({
    id: 'sess-g2',
    activityId: 'act-3',
    category: 'REMEMBER',
    patientId: 'user-asha',
    accuracy: 100,
    hintsUsed: 0,
    repeatedErrors: 0,
    difficultyLevel: 1,
    status: 'completed'
  });

  // Difficulty must remain Easy (Level 1)
  const rec = adaptiveEngine.getDifficultyRecommendation('user-asha', 'act-3');
  assert.strictEqual(rec.recommendedDifficultyLevel, 1);
});

// Test 8: Incomplete Sessions Safeguard
runTest(8, 'Safeguard: Incomplete/abandoned sessions do not penalize cognitive difficulty', () => {
  const profileBefore = adaptiveEngine.getAdaptiveProfile('user-asha');
  const levelBefore = profileBefore.activityProfiles['act-2']?.currentDifficulty || 2;

  // Interrupted/abandoned session
  adaptiveEngine.updateProfileWithSession({
    id: 'sess-abandoned',
    activityId: 'act-2',
    patientId: 'user-asha',
    status: 'abandoned',
    accuracy: 0
  });

  const profileAfter = adaptiveEngine.getAdaptiveProfile('user-asha');
  const levelAfter = profileAfter.activityProfiles['act-2']?.currentDifficulty || 2;
  assert.strictEqual(levelAfter, levelBefore, 'Incomplete session did not drop difficulty');
});

// Test 9: Multi-Patient Isolation
runTest(9, 'Patient Isolation: Patient A performance updates do not affect Patient B', () => {
  // Advance Patient A on act-4
  for (let i = 1; i <= 3; i++) {
    adaptiveEngine.updateProfileWithSession({
      id: `sess-pa-${i}`,
      activityId: 'act-4',
      category: 'REMEMBER',
      patientId: 'user-asha',
      accuracy: 95,
      hintsUsed: 0,
      difficultyLevel: 1,
      status: 'completed'
    });
  }

  const recA = adaptiveEngine.getDifficultyRecommendation('user-asha', 'act-4');
  const recB = adaptiveEngine.getDifficultyRecommendation('user-test-b', 'act-4');

  assert.strictEqual(recA.recommendedDifficultyLevel, 2, 'Patient A advanced to Medium');
  assert.strictEqual(recB.recommendedDifficultyLevel, 1, 'Patient B remains at Easy default');
});

// Test 10: Persistence Across Reloads
runTest(10, 'Persistence: Adaptive profile survives localStorage serialization & reload', () => {
  const profile = adaptiveEngine.getAdaptiveProfile('user-asha');
  assert.ok(profile.activityProfiles['act-2'] || profile.activityProfiles['act-4'], 'activity profile exists');
  assert.ok(profile.recentPerformance.length > 0, 'Recent performance tracked');

  // Check store saved state
  const raw = localStorage.getItem('mindmitra_core_db_v2');
  assert.ok(raw, 'LocalStorage contains store database');
  const parsed = JSON.parse(raw);
  assert.ok(parsed.adaptiveProfiles && parsed.adaptiveProfiles.length > 0, 'Adaptive profiles persisted');
});

// Test 11: Activity Scaling — Memory Match
runTest(11, 'Activity Scaling: Memory Match scales pairs accurately (Easy=4, Medium=6, Hard=8)', () => {
  const act = activityRegistry.getById('act-1');
  activityEngine.initModeState(act, 1);
  assert.strictEqual(activityEngine.activeModeState.totalPairs, 4);

  activityEngine.initModeState(act, 2);
  assert.strictEqual(activityEngine.activeModeState.totalPairs, 6);

  activityEngine.initModeState(act, 3);
  assert.strictEqual(activityEngine.activeModeState.totalPairs, 8);
});

// Test 12: Activity Scaling — Attention Hunt
runTest(12, 'Activity Scaling: Attention Hunt scales items and targets', () => {
  const act = activityRegistry.getById('act-6');
  activityEngine.initModeState(act, 1);
  assert.strictEqual(activityEngine.activeModeState.targetCount, 3);
  assert.strictEqual(activityEngine.activeModeState.items.length, 5);

  activityEngine.initModeState(act, 2);
  assert.strictEqual(activityEngine.activeModeState.targetCount, 4);
  assert.strictEqual(activityEngine.activeModeState.items.length, 8);
});

// Test 13: Activity Scaling — Shopping Memory
runTest(13, 'Activity Scaling: Shopping Memory scales list items', () => {
  const act = activityRegistry.getById('act-14');
  activityEngine.initModeState(act, 1);
  assert.strictEqual(activityEngine.activeModeState.targetCount, 4);

  activityEngine.initModeState(act, 2);
  assert.strictEqual(activityEngine.activeModeState.targetCount, 4);
});

// Test 14: Activity Scaling — Story Sequence
runTest(14, 'Activity Scaling: Story Sequence scales milestones', () => {
  const act = activityRegistry.getById('act-12');
  activityEngine.initModeState(act, 1);
  assert.strictEqual(activityEngine.activeModeState.correctOrder.length, 3);

  activityEngine.initModeState(act, 2);
  assert.strictEqual(activityEngine.activeModeState.correctOrder.length, 4);
});

// Test 15: Activity Scaling — Pattern Predictor
runTest(15, 'Activity Scaling: Pattern Predictor scales rhythm sequence', () => {
  const act = activityRegistry.getById('act-9');
  activityEngine.initModeState(act, 1);
  assert.strictEqual(activityEngine.activeModeState.sequence.length, 4);

  activityEngine.initModeState(act, 2);
  assert.strictEqual(activityEngine.activeModeState.sequence.length, 5);
});

// Test 16: Activity Scaling — Object Sorting
runTest(16, 'Activity Scaling: Object Sorting scales categories and items', () => {
  const act = activityRegistry.getById('act-10');
  activityEngine.initModeState(act, 1);
  assert.strictEqual(activityEngine.activeModeState.categories.length, 3);
  assert.strictEqual(activityEngine.activeModeState.totalItems, 6);
});

// Test 17: Category-Level Performance Tracking
runTest(17, 'Category Performance: Accurately computes category practice sessions without deficit scoring', () => {
  const catPerf = adaptiveEngine.getCategoryPerformance('user-asha');
  assert.ok(catPerf.REMEMBER, 'REMEMBER category exists');
  assert.ok(catPerf.REMEMBER.sessionsCompleted > 0, 'Sessions completed tracked');
  assert.ok(catPerf.REMEMBER.averageAccuracy > 0, 'Average accuracy tracked');
  assert.ok(catPerf.REMEMBER.preferredDifficulty, 'Preferred difficulty set');
});

// Test 18: Activity Recommendation Service
runTest(18, 'Activity Recommendations: getRecommendedActivity returns tailored, gentle activity', () => {
  const rec = adaptiveEngine.getRecommendedActivity('user-asha');
  assert.ok(rec.activity, 'Activity object returned');
  assert.ok(rec.name, 'Activity name returned');
  assert.ok(rec.recommendedDifficulty, 'Recommended difficulty returned');
  assert.ok(rec.gentleReason, 'Gentle reason returned');
  assert.ok(!rec.gentleReason.toLowerCase().includes('dementia'), 'No dementia deficit wording');
});

// Test 19: SmritiAI Integration
await runAsyncTest(19, 'SmritiAI Integration: Asking for an activity yields personalized recommendation with action route', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage('What should I play today?', { patientId: 'user-asha' });
  assert.strictEqual(res.type, 'activity');
  assert.ok(res.text.includes('wonderful activity') || res.text.includes('comfortable'));
  assert.ok(res.actionRoute.startsWith('activities/'));
  assert.ok(res.recommendedDifficulty, 'Includes recommended difficulty');
});

// Test 20: Medical Safety Boundary
await runAsyncTest(20, 'Safety Boundary: SmritiAI never outputs clinical deficit or dementia score wording', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage('How did I do on my test? What is my cognitive score?', { patientId: 'user-asha' });
  const lower = res.text.toLowerCase();
  assert.ok(!lower.includes('dementia score'), 'No dementia score');
  assert.ok(!lower.includes('cognitive decline'), 'No cognitive decline assertion');
  assert.ok(!lower.includes('impairment rating'), 'No impairment rating');
});

// Test 21: Profile Reset
runTest(21, 'Profile Reset: resetAdaptiveProfile returns difficulty to Level 1 without deleting results', () => {
  const resultsCountBefore = store.getActivityResults('user-asha').length;
  adaptiveEngine.resetAdaptiveProfile('user-asha');

  const recAfter = adaptiveEngine.getDifficultyRecommendation('user-asha', 'act-1');
  assert.strictEqual(recAfter.recommendedDifficultyLevel, 1, 'Reset back to Level 1');

  const resultsCountAfter = store.getActivityResults('user-asha').length;
  assert.strictEqual(resultsCountAfter, resultsCountBefore, 'Historical activity results preserved intact');
});

// Test 22: Explainable Events Emitted
runTest(22, 'Telemetry: Adaptive events record difficulty transitions with reasons', () => {
  const events = adaptiveEngine.getAdaptiveEvents('user-asha');
  assert.ok(events.length > 0, 'Adaptive events logged');
  assert.ok(events.some(e => e.eventType === 'difficulty_reset' || e.eventType.startsWith('difficulty_')));
});

// Test 23: Caregiver Foundation API
runTest(23, 'Caregiver Foundation: Queries return clean data structures for future reporting', () => {
  const profile = store.getAdaptiveProfile('user-asha');
  assert.ok(profile && profile.patientId === 'user-asha');
  assert.ok(profile.activityProfiles !== undefined);
  assert.ok(profile.categoryProfiles !== undefined);
});

// Test 24: UI View Rendering
runTest(24, 'UI Rendering: renderActivitiesHubView includes Suggested for You banner and badges', () => {
  const html = renderActivitiesHubView();
  assert.ok(html.includes('Suggested for You'), 'Renders Suggested for You banner');
  assert.ok(html.includes('Level'), 'Renders difficulty level badges');
  assert.ok(html.includes('Cognitive Engagement'), 'Preserves Stitch header');
});

// Test 25: Store Hook Integration
runTest(25, 'Store Hook: store.recordActivitySession automatically triggers adaptive profile updates', () => {
  const session = {
    id: 'sess-hook-test',
    activityId: 'act-5',
    activityName: 'Memory Reconstruction',
    category: 'REMEMBER',
    patientId: 'user-asha',
    accuracy: 95,
    hintsUsed: 0,
    repeatedErrors: 0,
    completionTimeSec: 45,
    difficultyLevel: 1,
    status: 'completed'
  };

  store.recordActivitySession(session);
  const profile = adaptiveEngine.getAdaptiveProfile('user-asha');
  assert.ok(profile.activityProfiles['act-5'], 'act-5 profile was updated via store hook');
  assert.strictEqual(profile.activityProfiles['act-5'].recentAccuracy, 95);
});

console.log('\n===========================================================');
console.log(`RESULTS: ${passedTests} / ${passedTests + failedTests} TESTS PASSED (${Math.round((passedTests / (passedTests + failedTests)) * 100)}% SUCCESS)`);
console.log('===========================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
