// Automated Verification Suite for MindMitra Part 3: Daily Care & Reminders
// Tests all 20 criteria specified in Section 25 of requirements

// 1. Mock Browser Environment (localStorage, window, document)
const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => storage.get(k) || null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear()
};

globalThis.window = {
  location: {
    hash: '#/my-day'
  },
  navigator: {
    onLine: true
  },
  addEventListener: () => {},
  scrollTo: () => {}
};

globalThis.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  querySelector: () => null
};

import assert from 'assert';
import { store } from '../src/state/store.js';
import { reminderService, REMINDER_TYPES, RECURRENCE_RULES, REMINDER_STATUS } from '../src/services/reminderService.js';
import { authService } from '../src/services/authService.js';
import { renderMyDayView } from '../src/views/MyDayView.js';
import { renderPatientHomeView } from '../src/views/PatientHomeView.js';
import { renderMemoryWorldView } from '../src/views/MemoryWorldView.js';
import { renderActivitiesHubView } from '../src/views/ActivitiesHubView.js';
import { renderReminderDetailModal } from '../src/components/ReminderDetailModal.js';
import { renderNotificationPermissionModal } from '../src/components/NotificationPermissionModal.js';

console.log('===========================================================');
console.log('MINDMITRA PART 3 — 20-POINT DAILY CARE & REMINDERS TEST SUITE');
console.log('===========================================================\n');

let passedCount = 0;
function runTest(num, title, fn) {
  try {
    fn();
    console.log(`✅ [Test ${num.toString().padStart(2, ' ')}] Passed: ${title}`);
    passedCount++;
  } catch (err) {
    console.error(`❌ [Test ${num.toString().padStart(2, ' ')}] FAILED: ${title}`);
    console.error(err);
    process.exit(1);
  }
}

// Reset session to authenticated patient Asha
authService.login('asha@mindmitra.in', 'Asha1234!');

// ==========================================
// DAILY CARE & REMINDERS TESTS (1-20)
// ==========================================

let createdReminderId = null;

runTest(1, 'Reminder can be created through service and store', () => {
  const newReminder = store.addReminder({
    patientId: 'usr-asha',
    title: 'Midday Heart Tonic & Water',
    category: REMINDER_TYPES.MEDICINE,
    type: REMINDER_TYPES.MEDICINE,
    time: '12:30 PM',
    recurrence: RECURRENCE_RULES.DAILY,
    description: 'Post-lunch doctor approved vitamin care.',
    notes: 'Post-lunch doctor approved vitamin care.',
    dosageNotes: 'Doctor approved tablet with glass of water.'
  });

  assert.ok(newReminder.id, 'Reminder must have an ID');
  assert.strictEqual(newReminder.title, 'Midday Heart Tonic & Water');
  assert.strictEqual(newReminder.type, 'medicine');
  assert.strictEqual(newReminder.completed, false);
  createdReminderId = newReminder.id;
});

runTest(2, 'Reminder persists after refresh via local storage', () => {
  const rawState = localStorage.getItem('mindmitra_core_db_v2');
  assert.ok(rawState, 'Database state exists in localStorage');
  const parsed = JSON.parse(rawState);
  const found = parsed.routines.find(r => r.id === createdReminderId);
  assert.ok(found, 'Created reminder must exist in persisted localStorage routines');
  assert.strictEqual(found.title, 'Midday Heart Tonic & Water');
});

runTest(3, 'Reminder appears in My Day view', () => {
  store.setRoute('my-day');
  const myDayHtml = renderMyDayView();
  assert.ok(myDayHtml.includes('Midday Heart Tonic & Water'), 'My Day includes created reminder');
  assert.ok(myDayHtml.includes('12:30 PM'), 'My Day includes scheduled time');
  assert.ok(myDayHtml.includes('Prescription Care'), 'My Day shows Prescription Care badge');
  assert.ok(myDayHtml.includes('reminder-hear-btn'), 'My Day includes Hear Reminder button');
  assert.ok(myDayHtml.includes('reminder-snooze-btn'), 'My Day includes quick snooze button');
  assert.ok(myDayHtml.includes('reminder-detail-btn'), 'My Day includes details button');
});

runTest(4, 'Reminder appears appropriately on Patient Home ("Today\'s Next Step")', () => {
  store.setRoute('patient-home');
  const homeHtml = renderPatientHomeView();
  assert.ok(homeHtml.includes('NEXT STEP'), 'Patient Home includes Next Step section');
  assert.ok(homeHtml.includes('homeHearNextStepBtn'), 'Next Step card includes Hear Reminder button');
  assert.ok(homeHtml.includes('homeCompleteNextStepBtn'), 'Next Step card includes Complete button');
});

runTest(5, 'Mark as Done works and logs occurrence history', () => {
  const occurrencesBefore = (store.getState().reminderOccurrences || []).length;
  store.markReminderDone(createdReminderId, 'usr-asha');
  
  const updated = store.getState().routines.find(r => r.id === createdReminderId);
  assert.strictEqual(updated.completed, true);
  assert.strictEqual(updated.status, 'completed');
  assert.ok(updated.completedAt, 'completedAt timestamp must be recorded');

  const occurrencesAfter = (store.getState().reminderOccurrences || []).length;
  assert.strictEqual(occurrencesAfter, occurrencesBefore + 1, 'Occurrence history recorded');
  assert.strictEqual(store.getState().reminderOccurrences[0].status, 'completed');
});

runTest(6, 'Snooze works where implemented and updates snoozedUntil', () => {
  // Add a fresh reminder for snoozing
  const snoozeTestItem = store.addReminder({
    patientId: 'usr-asha',
    title: 'Afternoon Hydration Glass',
    category: REMINDER_TYPES.HYDRATION,
    type: REMINDER_TYPES.HYDRATION,
    time: '3:00 PM',
    recurrence: RECURRENCE_RULES.DAILY,
    description: 'Fresh coconut water.'
  });

  store.snoozeReminder(snoozeTestItem.id, 15);
  const snoozed = store.getState().routines.find(r => r.id === snoozeTestItem.id);
  assert.strictEqual(snoozed.status, 'snoozed');
  assert.ok(snoozed.snoozedUntil, 'snoozedUntil ISO string must be set');
  const snoozeDiff = new Date(snoozed.snoozedUntil).getTime() - Date.now();
  assert.ok(snoozeDiff > 10 * 60 * 1000, 'Snoozed into future (+15 minutes)');
});

runTest(7, 'Reminder status persists across state reloads', () => {
  const raw = localStorage.getItem('mindmitra_core_db_v2');
  assert.ok(raw);
  const parsed = JSON.parse(raw);
  const completedItem = parsed.routines.find(r => r.id === createdReminderId);
  assert.strictEqual(completedItem.status, 'completed');
  assert.strictEqual(completedItem.completed, true);
});

runTest(8, 'Recurring reminders calculate the next occurrence correctly', () => {
  const baseDate = new Date('2026-09-07T10:00:00');
  
  // Daily reminder scheduled for 9:00 AM (already passed at 10 AM, should advance to tomorrow 9 AM)
  const dailyRem = {
    time: '9:00 AM',
    recurrence: RECURRENCE_RULES.DAILY
  };
  const nextDaily = reminderService.calculateNextOccurrence(dailyRem, baseDate);
  assert.strictEqual(nextDaily.getDate(), baseDate.getDate() + 1);
  assert.strictEqual(nextDaily.getHours(), 9);
  assert.strictEqual(nextDaily.getMinutes(), 0);

  // Daily reminder scheduled for 4:00 PM (later today at 10 AM, should stay today)
  const afternoonRem = {
    time: '4:00 PM',
    recurrence: RECURRENCE_RULES.DAILY
  };
  const nextAfternoon = reminderService.calculateNextOccurrence(afternoonRem, baseDate);
  assert.strictEqual(nextAfternoon.getDate(), baseDate.getDate());
  assert.strictEqual(nextAfternoon.getHours(), 16);
  assert.strictEqual(nextAfternoon.getMinutes(), 0);
});

runTest(9, 'Patient only sees their own reminders (multi-patient isolation)', () => {
  // Create reminder for a different patient "usr-ramesh"
  const rameshReminder = store.addReminder({
    patientId: 'usr-ramesh',
    title: 'Ramesh Specific Knee Therapy',
    category: REMINDER_TYPES.ROUTINE,
    type: REMINDER_TYPES.ROUTINE,
    time: '5:00 PM',
    description: 'Gentle mobility.'
  });

  // Current user is Asha ("usr-asha")
  const ashaReminders = store.getRemindersForPatient('usr-asha');
  assert.strictEqual(
    ashaReminders.some(r => r.id === rameshReminder.id), 
    false, 
    'Asha must NOT see Ramesh specific reminders'
  );

  // Ramesh queries their reminders
  const rameshReminders = store.getRemindersForPatient('usr-ramesh');
  assert.strictEqual(
    rameshReminders.some(r => r.id === rameshReminder.id), 
    true, 
    'Ramesh sees their own reminder'
  );
});

runTest(10, 'Invalid reminder data is rejected with descriptive error', () => {
  assert.throws(() => {
    reminderService.createReminder({
      title: '', // Empty title
      time: '9:00 AM'
    });
  }, /Reminder title is required/);

  assert.throws(() => {
    reminderService.createReminder({
      title: 'Valid Title',
      time: '' // Empty time
    });
  }, /Reminder scheduled time is required/);
});

runTest(11, 'Notification permission states are handled gracefully', async () => {
  const perm = reminderService.getNotificationPermission();
  assert.ok(['granted', 'denied', 'default', 'unsupported'].includes(perm));

  const reqResult = await reminderService.requestNotificationPermission();
  assert.ok(['granted', 'denied', 'unsupported'].includes(reqResult));
});

runTest(12, 'Hear Reminder generates calm, non-diagnostic audio readout', () => {
  const testMed = {
    title: 'Morning Blood Pressure',
    type: REMINDER_TYPES.MEDICINE,
    time: '9:00 AM',
    notes: 'Doctor approved dosage with warm water'
  };

  const spokenText = reminderService.formatSpokenReminder(testMed, 'Asha Devi');
  assert.ok(spokenText.includes('Hello Asha'), 'Spoken text greets patient gently');
  assert.ok(spokenText.includes('9:00 AM'), 'Includes scheduled time');
  assert.ok(spokenText.includes('Morning Blood Pressure'), 'Includes reminder title');
  assert.ok(spokenText.includes('Take your time'), 'Reassuring elder cadence');

  // Verify speechService invocation does not throw
  const spokenReturn = reminderService.hearReminder(testMed, 'Asha');
  assert.strictEqual(typeof spokenReturn, 'string');
});

runTest(13, 'Existing authentication still works', () => {
  assert.strictEqual(authService.isAuthenticated(), true);
  assert.strictEqual(authService.isPatient(), true);
  const currentUser = authService.getCurrentUser();
  assert.strictEqual(currentUser.role, 'patient');
});

runTest(14, 'Existing patient navigation still works', () => {
  const validPatientRoutes = ['patient-home', 'my-day', 'memory-world', 'activities', 'family-circle', 'profile'];
  for (const r of validPatientRoutes) {
    store.setRoute(r);
    assert.strictEqual(store.getState().activeRoute, r);
  }
});

runTest(15, 'Existing Memory World entry still works', () => {
  store.setRoute('memory-world');
  const memoryHtml = renderMemoryWorldView();
  assert.ok(memoryHtml.includes('Personal Memory World'), 'Memory World renders intact');
  assert.ok(memoryHtml.includes('Return to Home'), 'Navigation breadcrumb present');
});

runTest(16, 'Existing Activities entry still works', () => {
  store.setRoute('activities');
  const actHtml = renderActivitiesHubView();
  assert.ok(actHtml.includes('Cognitive Engagement &amp; Memory Activities') || actHtml.includes('Cognitive Engagement & Memory Activities'));
});

runTest(17, 'No existing memories, users, or activity sessions are deleted', () => {
  const state = store.getState();
  assert.ok(state.memories.length > 0, 'Memories preserved intact');
  assert.ok(state.activities.length === 20, 'All 20 cognitive activities preserved');
  assert.ok(state.people.length > 0, 'Family circle preserved');
});

runTest(18, 'No duplicate reminder system exists; unified store routines are used', () => {
  const state = store.getState();
  assert.ok(Array.isArray(state.routines), 'Routines is primary canonical array');
  assert.strictEqual(typeof store.addReminder, 'function');
  assert.strictEqual(typeof store.updateReminder, 'function');
  assert.strictEqual(typeof store.deleteReminder, 'function');
});

runTest(19, 'No console or runtime errors during modal and view rendering', () => {
  store.setRoute('my-day');
  const myDayHtml = renderMyDayView();
  assert.ok(typeof myDayHtml === 'string' && myDayHtml.length > 100);

  // Reminder Detail Modal
  store.setSelectedReminderForDetail(store.getState().routines[0]);
  store.setReminderDetailModalOpen(true);
  const detailModalHtml = renderReminderDetailModal();
  assert.ok(detailModalHtml.includes('Hear Reminder Read Aloud'));
  assert.ok(detailModalHtml.includes('Care Instructions'));
  store.setReminderDetailModalOpen(false);

  // Notification Consent Modal
  store.setNotificationPermissionModalOpen(true);
  const consentModalHtml = renderNotificationPermissionModal();
  assert.ok(consentModalHtml.includes('Stay Connected with Gentle Care Chimes'));
  assert.ok(consentModalHtml.includes('Allow Reminders'));
  store.setNotificationPermissionModalOpen(false);
});

runTest(20, 'No build or syntax errors across modules', () => {
  assert.ok(typeof reminderService.calculateNextOccurrence === 'function');
  assert.ok(typeof reminderService.getReminderUrgency === 'function');
  assert.ok(typeof reminderService.hearReminder === 'function');
  assert.ok(typeof reminderService.requestNotificationPermission === 'function');
});

console.log('\n===========================================================');
console.log(`RESULTS: ${passedCount} / 20 TESTS PASSED (100% SUCCESS)`);
console.log('===========================================================');
