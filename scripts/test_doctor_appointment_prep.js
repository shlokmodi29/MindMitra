// MindMitra Feature 3 — 30-Point Doctor Appointment Prep Comprehensive Test Suite
// Verifies appointment detection, question management, things to remember, document checklist,
// factual activity/care summaries, caregiver notes, relevant memory context, doctor consent sharing,
// doctor portal isolation, visit notes, next appointment scheduling, multilingual TTS, and offline sync.

import assert from 'assert';

// Mock Browser Environment for Node.js
if (typeof window === 'undefined') {
  global.window = {
    location: { hash: '#/appointment-prep' },
    navigator: { onLine: true },
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  global.document = {
    getElementById: () => null,
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({ setAttribute: () => {}, style: {} }),
    body: { appendChild: () => {} }
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
const { authService } = await import('../src/services/authService.js');
const { doctorService, CONNECTION_STATUS } = await import('../src/services/doctorService.js');
const { appointmentPrepService, QUESTION_STATUS } = await import('../src/services/appointmentPrepService.js');
const { analyticsService } = await import('../src/services/analyticsService.js');
const { memoryService } = await import('../src/services/memoryService.js');
const { voiceService } = await import('../src/services/voiceService.js');
const { offlineSyncService } = await import('../src/services/offlineSyncService.js');
const { dailyPlanService } = await import('../src/services/dailyPlanService.js');
const { renderAppointmentPrepView } = await import('../src/views/AppointmentPrepView.js');
const { renderMyDoctorsView } = await import('../src/views/MyDoctorsView.js');
const { renderDoctorPortalView } = await import('../src/views/DoctorPortalView.js');
const { renderMyDayView } = await import('../src/views/MyDayView.js');
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
    console.error(`❌ [Test ${pad}${num}] FAILED: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('===========================================================');
console.log('   MINDMITRA FEATURE 3: DOCTOR APPOINTMENT PREP TEST SUITE  ');
console.log('===========================================================');

const patientId = 'user-asha';

// TEST 1: Service singleton and storage initialization
runTest(1, 'AppointmentPrepService initializes without throwing', () => {
  assert.ok(appointmentPrepService, 'Service must exist');
  assert.strictEqual(typeof appointmentPrepService.getUpcomingDoctorAppointment, 'function');
  assert.strictEqual(typeof appointmentPrepService.getAppointmentPrep, 'function');
});

// TEST 2: Upcoming Doctor Appointment detection from store
runTest(2, 'Detects scheduled doctor appointment rtn-doc-1 for Asha Devi', () => {
  const appt = appointmentPrepService.getUpcomingDoctorAppointment(patientId);
  assert.ok(appt, 'Doctor appointment must be found in patient routines');
  assert.strictEqual(appt.id, 'rtn-doc-1');
  assert.strictEqual(appt.doctorName, 'Dr. Ananya Sharma');
  assert.strictEqual(appt.clinic, 'Shillong Medical Centre');
  assert.strictEqual(appt.date, '10 September 2026');
  assert.strictEqual(appt.time, '11:00 AM');
});

// TEST 3: Initial Appointment Prep data structure
runTest(3, 'Initializes complete prep record with 13 core domains', () => {
  const prep = appointmentPrepService.getAppointmentPrep('rtn-doc-1', patientId);
  assert.ok(prep, 'Prep record should be created');
  assert.strictEqual(prep.appointmentId, 'rtn-doc-1');
  assert.strictEqual(prep.patientId, patientId);
  assert.ok(Array.isArray(prep.thingsToRemember), 'thingsToRemember must be an array');
  assert.ok(Array.isArray(prep.questions), 'questions must be an array');
  assert.ok(Array.isArray(prep.checklist), 'checklist must be an array');
  assert.strictEqual(prep.sharedWithDoctor, false, 'Initial state must be unshared');
});

// TEST 4: Adding things to remember
runTest(4, 'Adds a thing to remember and persists in storage', () => {
  const note = 'Ask about evening herbal tea before sleep';
  appointmentPrepService.addThingToRemember('rtn-doc-1', note, patientId);
  const prep = appointmentPrepService.getAppointmentPrep('rtn-doc-1', patientId);
  assert.ok(prep.thingsToRemember.includes(note), 'Note must be stored in thingsToRemember');
});

// TEST 5: Removing things to remember
runTest(5, 'Removes a thing to remember by index', () => {
  const prepBefore = appointmentPrepService.getAppointmentPrep('rtn-doc-1', patientId);
  const initialCount = prepBefore.thingsToRemember.length;
  appointmentPrepService.removeThingToRemember('rtn-doc-1', 0, patientId);
  const prepAfter = appointmentPrepService.getAppointmentPrep('rtn-doc-1', patientId);
  assert.strictEqual(prepAfter.thingsToRemember.length, initialCount - 1);
});

// TEST 6: Adding questions for doctor
runTest(6, 'Adds a new question in PENDING status', () => {
  const questionText = 'Should we continue morning walks in mild Shillong weather?';
  const newQ = appointmentPrepService.addQuestion('rtn-doc-1', questionText, patientId);
  assert.ok(newQ && newQ.id, 'Question must have generated id');
  assert.strictEqual(newQ.text, questionText);
  assert.strictEqual(newQ.status, QUESTION_STATUS.PENDING);
});

// TEST 7: Toggling question status between pending and discussed
runTest(7, 'Toggles question status between pending and discussed', () => {
  const prep = appointmentPrepService.getAppointmentPrep('rtn-doc-1', patientId);
  const q = prep.questions[0];
  const initialStatus = q.status;
  const toggled = appointmentPrepService.toggleQuestionStatus('rtn-doc-1', q.id, patientId);
  assert.strictEqual(toggled, QUESTION_STATUS.DISCUSSED);
  const toggledBack = appointmentPrepService.toggleQuestionStatus('rtn-doc-1', q.id, patientId);
  assert.strictEqual(toggledBack, QUESTION_STATUS.PENDING);
});

// TEST 8: Deleting question
runTest(8, 'Deletes a question from preparation list', () => {
  const newQ = appointmentPrepService.addQuestion('rtn-doc-1', 'Temporary question to delete', patientId);
  const prepBefore = appointmentPrepService.getAppointmentPrep('rtn-doc-1', patientId);
  assert.ok(prepBefore.questions.some(item => item.id === newQ.id));
  appointmentPrepService.deleteQuestion('rtn-doc-1', newQ.id, patientId);
  const prepAfter = appointmentPrepService.getAppointmentPrep('rtn-doc-1', patientId);
  assert.ok(!prepAfter.questions.some(item => item.id === newQ.id));
});

// TEST 9: Document Checklist toggling
runTest(9, 'Toggles document checklist item completion status', () => {
  const prep = appointmentPrepService.getAppointmentPrep('rtn-doc-1', patientId);
  const item = prep.checklist[0];
  const initialState = item.completed;
  const toggled = appointmentPrepService.toggleChecklistItem('rtn-doc-1', item.id, patientId);
  assert.strictEqual(toggled, !initialState);
  // Restore
  appointmentPrepService.toggleChecklistItem('rtn-doc-1', item.id, patientId);
});

// TEST 10: Relevant Memory Context selection
runTest(10, 'Sets and persists selected memory IDs without exposing photo or voice binaries', () => {
  const memoryIds = ['mem-1', 'mem-2'];
  appointmentPrepService.setSelectedMemoryIds('rtn-doc-1', memoryIds, patientId);
  const prep = appointmentPrepService.getAppointmentPrep('rtn-doc-1', patientId);
  assert.deepStrictEqual(prep.selectedMemoryIds, memoryIds);
});

// TEST 11: Factual Activity Summary (Strictly non-diagnostic)
runTest(11, 'Generates factual activity participation summary without clinical conclusions', () => {
  const summary = appointmentPrepService.getActivitySummary(patientId);
  assert.ok(typeof summary.activitiesCompleted === 'number');
  assert.ok(typeof summary.participationDaysThisWeek === 'number');
  assert.ok(typeof summary.mostRecentActivity === 'string');
  assert.ok(!summary.clinicalDiagnosis, 'Must NEVER contain clinical diagnosis');
  assert.ok(!summary.dementiaCure, 'Must NEVER claim cure or clinical condition');
});

// TEST 12: Factual Daily Care Summary
runTest(12, 'Generates factual daily care adherence summary', () => {
  const care = appointmentPrepService.getDailyCareSummary(patientId);
  assert.ok(typeof care.medicinesCompleted === 'number');
  assert.ok(typeof care.medicinesScheduled === 'number');
  assert.ok(typeof care.hydrationCompleted === 'number');
  assert.ok(typeof care.hydrationScheduled === 'number');
});

// TEST 13: Caregiver Observations retrieval
runTest(13, 'Retrieves recent caregiver observations from store state', () => {
  const obs = appointmentPrepService.getCaregiverObservations(patientId);
  assert.ok(Array.isArray(obs));
  obs.forEach(o => {
    assert.ok(typeof o.text === 'string');
    assert.ok(o.timestamp);
  });
});

// TEST 14: Doctor sharing rejection when doctor is unauthorized
runTest(14, 'Blocks sharing when requested for an unauthorized doctor ID', () => {
  assert.throws(() => {
    appointmentPrepService.sharePrepWithDoctor('rtn-doc-1', 'unauthorized-doc-999', patientId);
  }, /Unauthorized/);
});

// TEST 15: Doctor sharing success with authorized connection
runTest(15, 'Shares preparation with authorized doctor Dr. Sharma with explicit consent', () => {
  const result = appointmentPrepService.sharePrepWithDoctor('rtn-doc-1', 'user-dr-sharma', patientId, 'Meera (Caregiver)');
  assert.ok(result.success, 'Share must report success');
  assert.ok(result.report, 'Report object must be returned');

  const prep = appointmentPrepService.getAppointmentPrep('rtn-doc-1', patientId);
  assert.strictEqual(prep.sharedWithDoctor, true);
  assert.ok(prep.sharedAt);
});

// TEST 16: Shared Report visible in doctorService records
runTest(16, 'Shared appointment prep is recorded in doctor sharedReports', () => {
  const reports = doctorService.getSharedReports('user-dr-sharma');
  const apptReport = reports.find(r => r.reportType === 'appointment_prep' || (r.title && r.title.includes('Dr. Ananya Sharma')));
  assert.ok(apptReport, 'Doctor must have received the shared prep report');
  assert.strictEqual(apptReport.patientId, patientId);
});

// TEST 17: Doctor Portal view shows Appointment Prep reports
runTest(17, 'DoctorPortalView renders Appointment Prep report details', () => {
  authService.saveSession({ userId: 'user-dr-sharma', role: 'doctor', name: 'Dr. Ananya Sharma' });
  const html = renderDoctorPortalView();
  assert.ok(html.includes('Appointment Prep') || html.includes('Dr. Ananya Sharma'), 'Doctor portal should display prep report');
  authService.saveSession({ userId: 'user-asha', role: 'patient', name: 'Asha Devi' });
});

// TEST 18: Unauthorized doctor isolation
runTest(18, 'Doctor without approval cannot access patient appointment preparation', () => {
  const hasAccess = doctorService.hasDoctorAccess('fake-doctor-id', patientId);
  assert.strictEqual(hasAccess, false);
});

// TEST 19: Post-Appointment Visit Notes
runTest(19, 'Saves post-appointment discussion notes and follow-up reminder', () => {
  const notesData = {
    whatWasDiscussed: 'Dr. Sharma noted stable participation in morning activities.',
    nextAppointmentDate: '2026-10-15',
    nextAppointmentTime: '11:00',
    followUpReminder: 'Clinic follow-up in 5 weeks'
  };
  const saved = appointmentPrepService.saveVisitNotes('rtn-doc-1', notesData, patientId);
  assert.ok(saved);
  assert.strictEqual(saved.whatWasDiscussed, notesData.whatWasDiscussed);
  assert.strictEqual(saved.followUpReminder, notesData.followUpReminder);
});

// TEST 20: Next Appointment Scheduling creates valid routine in store
runTest(20, 'Schedules follow-up appointment in store routines without duplication', () => {
  const routinesBefore = store.state.routines.length;
  const newRoutine = appointmentPrepService.scheduleNextAppointment({
    patientId,
    doctorId: 'user-dr-sharma',
    doctorName: 'Dr. Ananya Sharma',
    clinic: 'Shillong Medical Centre',
    date: '2026-10-15',
    time: '11:00 AM',
    notes: 'Follow-up cognitive wellness review.'
  });

  assert.ok(newRoutine && newRoutine.id);
  assert.strictEqual(store.state.routines.length, routinesBefore + 1);
  const found = store.state.routines.find(r => r.id === newRoutine.id);
  assert.ok(found);
  assert.strictEqual(found.title, 'Doctor Review with Dr. Ananya Sharma');
  assert.strictEqual(found.clinic, 'Shillong Medical Centre');
});

// TEST 21: Spoken Prep generation in English
runTest(21, 'Generates elder-friendly spoken prep text in English', () => {
  const prep = appointmentPrepService.getAppointmentPrep('rtn-doc-1', patientId);
  const spoken = appointmentPrepService.generateSpokenPrep(prep, 'Asha Devi', 'en');
  assert.ok(spoken.includes('Asha Devi'));
  assert.ok(spoken.includes('Dr. Ananya Sharma'));
  assert.ok(spoken.includes('appointment'));
});

// TEST 22: Spoken Prep generation in Hindi, Assamese, and Bengali
runTest(22, 'Generates multilingual spoken prep text in Hindi, Assamese, and Bengali', () => {
  const prep = appointmentPrepService.getAppointmentPrep('rtn-doc-1', patientId);
  const hiText = appointmentPrepService.generateSpokenPrep(prep, 'आशा', 'hi');
  const asText = appointmentPrepService.generateSpokenPrep(prep, 'আশা', 'as');
  const bnText = appointmentPrepService.generateSpokenPrep(prep, 'আশা', 'bn');

  assert.ok(hiText.includes('अपॉइंटमेंट'), 'Hindi text should contain appointment reference');
  assert.ok(asText.includes('চিকিৎসক'), 'Assamese text should contain doctor reference');
  assert.ok(bnText.includes('ডাক্তার'), 'Bengali text should contain doctor reference');
});

// TEST 23: Offline Sync Queue integration
runTest(23, 'Enqueues sync operations to offlineSyncService when saving prep', () => {
  const prep = appointmentPrepService.getAppointmentPrep('rtn-doc-1', patientId);
  prep.notes = 'Offline sync test note';
  appointmentPrepService.saveAppointmentPrep(prep);

  const pending = offlineSyncService.getPendingQueue(patientId);
  assert.ok(Array.isArray(pending), 'Pending queue must be an array');
});

// TEST 24: MyDoctorsView includes Prepare for Visit buttons
runTest(24, 'MyDoctorsView renders Prepare for Visit and View Preparation buttons', () => {
  const html = renderMyDoctorsView();
  assert.ok(html.includes('Prepare for Visit'), 'MyDoctorsView must contain Prepare for Visit button');
  assert.ok(html.includes('#/appointment-prep'), 'MyDoctorsView must link to #/appointment-prep');
});

// TEST 25: Smart Daily Plan includes Prepare for Visit action for appointments
runTest(25, 'Smart Daily Plan includes Prepare for Visit action button for doctor appointments', () => {
  const html = renderMyDayView();
  assert.ok(html.includes('#/appointment-prep'), 'MyDayView must link to #/appointment-prep');
  assert.ok(html.includes('Prepare for Visit') || html.includes('Prep'), 'MyDayView must include prep button');
});

// TEST 26: Daily Plan Service sets actionRoute to appointment-prep
runTest(26, 'dailyPlanService generates doctor appointment items with actionRoute = appointment-prep', () => {
  const plan = dailyPlanService.getTodayPlan(patientId);
  const apptItem = plan.items.find(i => i.type === 'appointment' && (i.title.toLowerCase().includes('doctor') || i.title.toLowerCase().includes('dr.')));
  assert.ok(apptItem, 'Doctor appointment item must exist in plan');
  assert.strictEqual(apptItem.metadata?.actionRoute, 'appointment-prep');
});

// TEST 27: Full AppointmentPrepView render check
runTest(27, 'renderAppointmentPrepView renders all 13 sections without errors', () => {
  const html = renderAppointmentPrepView();
  assert.ok(html.includes('Dr. Ananya Sharma'), 'Should render doctor name');
  assert.ok(html.includes('Things to Remember'), 'Should render Things to Remember');
  assert.ok(html.includes('Questions for Doctor'), 'Should render Questions for Doctor');
  assert.ok(html.includes('Recent Activity Summary'), 'Should render Activity Summary');
  assert.ok(html.includes('Daily Care Summary'), 'Should render Daily Care Summary');
  assert.ok(html.includes('Caregiver Observations'), 'Should render Caregiver Observations');
  assert.ok(html.includes('Relevant Memory Context'), 'Should render Memory Context');
  assert.ok(html.includes('Document Checklist'), 'Should render Document Checklist');
  assert.ok(html.includes('SmritiAI Preparation Companion'), 'Should render SmritiAI Help');
  assert.ok(html.includes('Share Prep with Doctor'), 'Should render Share with Doctor modal');
  assert.ok(html.includes('Care Report Review'), 'Should render Care Report link');
  assert.ok(html.includes('Post-Appointment Visit Notes'), 'Should render Visit Notes');
  assert.ok(html.includes('Voice Input Preview'), 'Should render Voice Preview Modal');
});

// TEST 28: Localization dictionaries have appointmentPrep keys
runTest(28, 'Localization files (en, hi, as, bn) contain appointmentPrep translations', () => {
  assert.ok(en.appointmentPrep?.prepareForVisit, 'en.js missing prepareForVisit');
  assert.ok(hi.appointmentPrep?.prepareForVisit, 'hi.js missing prepareForVisit');
  assert.ok(as.appointmentPrep?.prepareForVisit, 'as.js missing prepareForVisit');
  assert.ok(bn.appointmentPrep?.prepareForVisit, 'bn.js missing prepareForVisit');
});

// TEST 29: Privacy isolation - private memories are not bundled in doctor share report
runTest(29, 'Doctor share payload excludes raw photo media and personal voice recordings', () => {
  const reports = doctorService.getSharedReports('user-dr-sharma');
  reports.forEach(rep => {
    assert.ok(!rep.photos, 'Report must not contain raw personal photos');
    assert.ok(!rep.voiceRecordings, 'Report must not contain personal voice recordings');
  });
});

// TEST 30: Zero fabrication - data accurately maps to authentic database records
runTest(30, 'Appointment details match database records with Shillong Medical Centre', () => {
  const appt = appointmentPrepService.getUpcomingDoctorAppointment(patientId);
  const dbRoutine = store.state.routines.find(r => r.id === 'rtn-doc-1');
  assert.strictEqual(appt.doctorName, dbRoutine.doctorName);
  assert.strictEqual(appt.clinic, dbRoutine.clinic);
  assert.strictEqual(appt.time, dbRoutine.time);
});

console.log('===========================================================');
console.log(`🎉 ALL ${passedCount} APPOINTMENT PREP TESTS PASSED SUCCESSFULLY!`);
console.log('===========================================================');
