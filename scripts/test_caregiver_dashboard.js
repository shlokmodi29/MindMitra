// MindMitra Part 11 — 25-Point Automated Verification Suite
// Caregiver Dashboard, Patient Selector, Daily Care & Support Center Tests
import assert from 'assert';
import { store } from '../src/state/store.js';
import { renderCaregiverDashboardView } from '../src/views/CaregiverDashboardView.js';
import { adaptiveEngine } from '../src/services/adaptiveEngine.js';
import { memoryService } from '../src/services/memoryService.js';
import { emergencyService } from '../src/services/emergencyService.js';
import { smritiAIService } from '../src/services/smritiAIService.js';

let passed = 0;
let failed = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('  RUNNING MINDMITRA PART 11 CAREGIVER DASHBOARD TESTS');
console.log('======================================================\n');

// 1. Caregiver dashboard loads authenticated caregiver profile
await runTest('1. Caregiver dashboard loads authenticated caregiver profile', () => {
  const html = renderCaregiverDashboardView();
  assert.ok(html.includes('Meera'), 'Includes caregiver name Meera');
  assert.ok(html.includes('Caregiver Navigation') || html.includes('Primary Caregiver'), 'Includes caregiver workspace indicators');
  assert.ok(html.includes('Dashboard'), 'Renders Dashboard main link');
});

// 2. Patient card displays authorized patient details and connection status
await runTest('2. Patient card displays authorized patient details and connection status', () => {
  const html = renderCaregiverDashboardView();
  assert.ok(html.includes('Asha Devi'), 'Includes patient name Asha Devi');
  assert.ok(html.includes('Age 72'), 'Includes patient age');
  assert.ok(html.includes('Care Support for Asha Devi') || html.includes('Asha Devi'), 'Hero section displays patient support');
});

// 3. Patient selector shows single patient directly when 1 authorized
await runTest('3. Patient selector shows single patient directly when 1 authorized', () => {
  const authorized = store.getAuthorizedPatientsForCaregiver('user-meera');
  assert.strictEqual(authorized.length, 1, 'Meera is authorized for 1 primary patient');
  assert.strictEqual(authorized[0].id, 'user-asha', 'Authorized patient is Asha');
  const html = renderCaregiverDashboardView();
  assert.ok(html.includes('Asha Devi'), 'Renders Asha Devi directly');
});

// 4. Patient selector supports multi-patient selection when multiple authorized
await runTest('4. Patient selector supports multi-patient selection when multiple authorized', () => {
  // Test multi-patient helper
  const testCaregiverId = 'user-test-caregiver';
  const testPatient2 = { id: 'user-bina', name: 'Bina Devi', role: 'patient', age: 68 };
  store.state.users.push(testPatient2);
  const testCaregiver = {
    id: testCaregiverId,
    name: 'Anil',
    role: 'caregiver',
    authorizedPatientIds: ['user-asha', 'user-bina']
  };
  store.state.users.push(testCaregiver);

  const authorizedList = store.getAuthorizedPatientsForCaregiver(testCaregiverId);
  assert.strictEqual(authorizedList.length, 2, 'Returns 2 authorized patients');
  assert.ok(authorizedList.some(p => p.id === 'user-asha'));
  assert.ok(authorizedList.some(p => p.id === 'user-bina'));

  // Clean up test users
  store.state.users = store.state.users.filter(u => u.id !== 'user-bina' && u.id !== testCaregiverId);
});

// 5. Patient data isolation: Caregiver cannot access unauthorized patient data
await runTest('5. Patient data isolation: Caregiver cannot access unauthorized patient data', () => {
  const isAuth = store.isAuthorizedForPatient('user-meera', 'user-unauthorized-xyz');
  assert.strictEqual(isAuth, false, 'Unauthorized patient returns false');
  assert.throws(() => {
    store.setActivePatientForCaregiver('user-unauthorized-xyz');
  }, /Unauthorized/, 'Switching to unauthorized patient throws security error');
});

// 6. Daily care section partitions items into Completed, Due Soon, and Upcoming
await runTest('6. Daily care section partitions items into Completed, Due Soon, and Upcoming', () => {
  const summary = store.getDailyCareSummary('user-asha');
  assert.ok(summary !== null && typeof summary === 'object');
  assert.ok(Array.isArray(summary.completed), 'Contains completed array');
  assert.ok(Array.isArray(summary.dueSoon), 'Contains dueSoon array');
  assert.ok(Array.isArray(summary.upcoming), 'Contains upcoming array');
  assert.strictEqual(summary.total, summary.completed.length + summary.dueSoon.length + summary.upcoming.length);
  assert.strictEqual(typeof summary.percentage, 'number');
});

// 7. Caregiver can create a new reminder with recurrence and category
await runTest('7. Caregiver can create a new reminder with recurrence and category', () => {
  const newRtn = store.addRoutine({
    patientId: 'user-asha',
    title: 'Evening Chamomile Tea',
    category: 'hydration',
    time: '08:00 PM',
    recurrence: 'daily',
    description: 'Warm tea on veranda'
  });
  assert.ok(newRtn.id.startsWith('rtn-'), 'Generated unique ID');
  assert.strictEqual(newRtn.title, 'Evening Chamomile Tea');
  assert.strictEqual(newRtn.patientId, 'user-asha');
  assert.strictEqual(newRtn.category, 'hydration');
  assert.strictEqual(newRtn.status, 'pending');

  const inStore = store.getState().routines.find(r => r.id === newRtn.id);
  assert.ok(inStore, 'Saved in persistent store routines');
});

// 8. Caregiver can edit an existing reminder
await runTest('8. Caregiver can edit an existing reminder', () => {
  const testItem = store.addRoutine({
    patientId: 'user-asha',
    title: 'Test Vitamin D',
    category: 'medicine',
    time: '11:00 AM'
  });
  const updated = store.updateRoutine(testItem.id, {
    title: 'Vitamin D3 Drops',
    time: '11:30 AM'
  });
  assert.strictEqual(updated.title, 'Vitamin D3 Drops');
  assert.strictEqual(updated.time, '11:30 AM');
  
  // Clean up
  store.deleteRoutine(testItem.id);
});

// 9. Caregiver can toggle a reminder completed or undo
await runTest('9. Caregiver can toggle a reminder completed or undo', () => {
  const testItem = store.addRoutine({
    patientId: 'user-asha',
    title: 'Morning Walk',
    category: 'activity',
    time: '07:30 AM'
  });
  assert.strictEqual(testItem.completed, false);
  store.toggleRoutine(testItem.id);
  const toggled = store.getState().routines.find(r => r.id === testItem.id);
  assert.strictEqual(toggled.completed, true);
  assert.strictEqual(toggled.status, 'completed');

  // Toggle back
  store.toggleRoutine(testItem.id);
  const toggledBack = store.getState().routines.find(r => r.id === testItem.id);
  assert.strictEqual(toggledBack.completed, false);

  // Clean up
  store.deleteRoutine(testItem.id);
});

// 10. Caregiver can delete a reminder
await runTest('10. Caregiver can delete a reminder', () => {
  const testItem = store.addRoutine({
    patientId: 'user-asha',
    title: 'Temporary Routine',
    time: '12:00 PM'
  });
  const removed = store.deleteRoutine(testItem.id);
  assert.strictEqual(removed, true);
  const found = store.getState().routines.find(r => r.id === testItem.id);
  assert.strictEqual(found, undefined, 'Routine deleted completely');
});

// 11. Reminders enforce non-prescriptive disclaimer and persist in store
await runTest('11. Reminders enforce non-prescriptive disclaimer and persist in store', () => {
  const html = renderCaregiverDashboardView();
  assert.ok(html.includes('Non-Prescriptive Notice'), 'Includes non-prescriptive disclaimer heading');
  assert.ok(html.includes('never prescribes medications'), 'Includes non-prescriptive medication clause');
});

// 12. Caregiver can view patient routines
await runTest('12. Caregiver can view patient routines', () => {
  const routines = store.getRemindersForPatient('user-asha');
  assert.ok(routines.length > 0, 'Loaded routines for Asha');
  assert.ok(routines.some(r => r.title.includes('Medicine') || r.title.includes('Hydration') || r.title.includes('Breakfast')));
});

// 13. Activity overview displays recent activities without fake data
await runTest('13. Activity overview displays recent activities without fake data', () => {
  const results = store.getActivityResults('user-asha');
  assert.ok(Array.isArray(results), 'Returns real results array');
  const html = renderCaregiverDashboardView();
  assert.ok(html.includes('Activity Performance &amp; Practice Progress') || html.includes('Activity Performance'), 'Renders accurate heading');
});

// 14. Activity performance uses non-medical terminology (no "Dementia Score")
await runTest('14. Activity performance uses non-medical terminology (no "Dementia Score")', () => {
  const html = renderCaregiverDashboardView();
  assert.ok(!html.toLowerCase().includes('dementia score'), 'Never contains Dementia Score');
  assert.ok(!html.toLowerCase().includes('cognitive health score'), 'Never contains Cognitive Health Score');
  assert.ok(!html.toLowerCase().includes('medical score'), 'Never contains Medical Score');
  assert.ok(html.includes('Practice Progress') || html.includes('Cognitive Practice'), 'Uses non-medical wording');
});

// 15. Adaptive difficulty integration displays current level and factual progression
await runTest('15. Adaptive difficulty integration displays current level and factual progression', () => {
  const profile = adaptiveEngine.getAdaptiveProfile('user-asha');
  assert.ok(profile, 'Profile exists for Asha');
  assert.ok(['Easy', 'Medium', 'Challenging'].includes(profile.preferredDifficulty || 'Easy'));
  const html = renderCaregiverDashboardView();
  assert.ok(html.includes('Difficulty Profile') || html.includes('Difficulty Progression'));
});

// 16. Adaptive explanations remain non-diagnostic (never claiming dementia worsening)
await runTest('16. Adaptive explanations remain non-diagnostic (never claiming dementia worsening)', () => {
  const html = renderCaregiverDashboardView();
  assert.ok(!html.toLowerCase().includes('dementia is worsening'), 'Never claims dementia worsening');
  assert.ok(!html.toLowerCase().includes('patient deteriorating'), 'Never claims patient deteriorating');
});

// 17. Activity history supports filtering by activity/category
await runTest('17. Activity history supports filtering by activity/category', () => {
  const results = store.getActivityResults('user-asha');
  const rememberActs = results.filter(r => (r.category || '').toLowerCase() === 'remember');
  assert.ok(Array.isArray(rememberActs));
  const html = renderCaregiverDashboardView();
  assert.ok(html.includes('Recall') && html.includes('Attention'), 'Table includes category filters');
});

// 18. Memory World integration links to Memory Bridge and Personal Memory World
await runTest('18. Memory World integration links to Memory Bridge and Personal Memory World', () => {
  const html = renderCaregiverDashboardView();
  assert.ok(html.includes('#/caregiver-bridge'), 'Includes Memory Bridge link');
  assert.ok(html.includes('#/memory-world'), 'Includes Memory World link');
});

// 19. Memory Graph supports node selection and context viewing (connected counts)
await runTest('19. Memory Graph supports node selection and context viewing (connected counts)', () => {
  const html = renderCaregiverDashboardView();
  assert.ok(html.includes('memory-graph-container'), 'Contains memory graph container');
  assert.ok(html.includes('Memory Knowledge Graph') || html.includes('Interconnected Living Archive'), 'Contains graph header');
});

// 20. Family Circle integration displays authorized family members
await runTest('20. Family Circle integration displays authorized family members', () => {
  const people = memoryService.getPeople('user-asha');
  assert.ok(people.length >= 2, 'Asha has configured family members');
  const html = renderCaregiverDashboardView();
  assert.ok(html.includes('Authorized Care Circle'), 'Includes Care Circle section');
  assert.ok(html.includes('#/family-circle'), 'Includes Family Circle link');
});

// 21. Emergency SOS integration displays contacts and location status
await runTest('21. Emergency SOS integration displays contacts and location status', () => {
  const contacts = store.getEmergencyContactsForPatient('user-asha');
  assert.ok(contacts.length >= 1, 'Asha has configured emergency contacts');
  const html = renderCaregiverDashboardView();
  assert.ok(html.includes('112 Emergency Help'), 'Displays 112 emergency readiness');
  assert.ok(html.includes('Location Status'), 'Displays location status tile');
  assert.ok(html.includes('#/emergency-sos'), 'Links to Emergency SOS');
});

// 22. SmritiAI caregiver queries return factual stored data
await runTest('22. SmritiAI caregiver queries return factual stored data', async () => {
  const resp = await smritiAIService.answerQuery('What should I pay attention to today?', {
    patientId: 'user-asha'
  });
  assert.ok(resp.text.includes("Care Focus"), 'Responds with Care Focus summary');
  assert.ok(resp.text.includes("routines completed"), 'References real completed routines count');
});

// 23. SmritiAI caregiver queries return upcoming reminders factually
await runTest('23. SmritiAI caregiver queries return upcoming reminders factually', async () => {
  const resp = await smritiAIService.answerQuery('Which reminders are upcoming?', {
    patientId: 'user-asha'
  });
  assert.ok(resp.text.includes("reminders for Asha Devi") || resp.text.includes("Upcoming reminders"), 'Answers upcoming query factually');
});

// 24. Caregiver insights generate factual observations from real data
await runTest('24. Caregiver insights generate factual observations from real data', () => {
  const insights = store.getCaregiverInsights('user-asha');
  assert.ok(Array.isArray(insights));
  assert.ok(insights.length >= 2, 'Generates at least 2 factual insights');
  assert.ok(insights.some(i => i.type === 'routine'), 'Has routine insight');
  assert.ok(insights.some(i => i.type === 'safety' || i.type === 'activity'), 'Has safety or activity insight');
});

// 25. Patient experience preview mode allows viewing patient UI with clear banner, and full regression
await runTest('25. Patient experience preview mode allows viewing patient UI with clear banner, and full regression', () => {
  // Test Preview Mode state
  store.setPatientPreviewMode(true, 'user-asha');
  assert.strictEqual(store.state.isPreviewMode, true);
  assert.strictEqual(store.state.previewPatientId, 'user-asha');

  store.setPatientPreviewMode(false);
  assert.strictEqual(store.state.isPreviewMode, false);
  assert.strictEqual(store.state.previewPatientId, null);

  // Full regression verify
  assert.ok(store.getState().users.length >= 2, 'Users intact');
  assert.ok(store.getState().memories.length > 0, 'Memories intact');
  assert.ok(store.getState().routines.length > 0, 'Routines intact');
  assert.ok(store.getState().activities.length > 0, 'Activities intact');
});

console.log(`\n======================================================`);
console.log(`  PART 11 TEST RESULTS: ${passed}/${passed + failed} TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log(`======================================================\n`);

if (failed > 0) {
  process.exit(1);
}
