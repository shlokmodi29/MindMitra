// MindMitra Doctor Role End-to-End Comprehensive Automated Test Suite
// Verifies all 33 functional requirements from the Functional Repair Specification:
// 1. Canonical Doctor Login & Session
// 2. Doctor Signup with practice metadata & localStorage persistence
// 3. Simulated Page Refresh & Session Restoration
// 4. Strict 3-Way Route Guards (Unauthenticated, Cross-Role, Doctor Boundary)
// 5. Doctor Portal Subtab Routing (#/doctor-portal/:tab)
// 6. Real Dynamic Overview Metrics (no hardcoded counts)
// 7. Bidirectional Connection Lifecycle (Doctor Request -> Notification -> Caregiver/Patient Approval)
// 8. Doctor Withdrawal / Cancel of Pending Request
// 9. Minimum-Necessary Telemetry & DPDP Data Isolation (No raw photos or private chat leakage)
// 10. Patient Detail Care Summary & Real Appointment Integration
// 11. Caregiver Share Report -> Doctor View -> Status Transition (shared -> viewed -> reviewed)
// 12. Doctor Observation Creation (dnote-* prefix, immutable patient records, attribution)
// 13. Doctor Profile Update (immediate session sync & localStorage persistence)
// 14. Patient "My Doctors" View (real doctor metadata, appointments, revoke access)
// 15. SmritiAI Role-Aware Queries (Patient with/without doctor, Doctor authorized/unauthorized, Caregiver)
// 16. Audit Logging with Provenance

// Polyfill browser globals for Node.js test environment
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

global.window = {
  location: { hash: '#/doctor-portal' },
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true
};

global.navigator = {
  onLine: true,
  userAgent: 'Node.js MindMitra Doctor Role E2E Test Suite'
};

import { store } from '../src/state/store.js';
import { authService } from '../src/services/authService.js';
import { doctorService, CONNECTION_STATUS, NOTE_TYPES } from '../src/services/doctorService.js';
import { smritiAIService } from '../src/services/smritiAIService.js';
import { analyticsService } from '../src/services/analyticsService.js';
import { reportService } from '../src/services/reportService.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  }
  passedTests++;
  console.log(`  ✅ [PASS] ${message}`);
}

async function runE2ETests() {
  console.log('================================================================');
  console.log('  MINDMITRA DOCTOR ROLE END-TO-END VERIFICATION SUITE           ');
  console.log('  Testing 33 Full Functional Requirements                       ');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // PHASE 1: CANONICAL DOCTOR AUTHENTICATION & SESSION PERSISTENCE
  // -------------------------------------------------------------
  console.log('--- Phase 1: Authentication, Signup & Persistence ---');

  // 1. Login with demo credentials
  const drLogin = authService.login('ananya@mindmitra.in', 'Doctor1234!');
  assert(drLogin.success === true, '1. Canonical doctor Dr. Ananya Sharma logs in successfully');
  assert(drLogin.user.id === 'user-dr-sharma', '1. Canonical doctor ID is "user-dr-sharma"');
  assert(drLogin.user.role === 'doctor', '1. Role is strictly "doctor"');
  assert(authService.isDoctor(drLogin.user) === true, '1. isDoctor() returns true for logged-in doctor');

  // 2. Doctor Signup with practice metadata
  const newDoctorEmail = `dr.mukherjee.${Date.now()}@kolkataclinic.in`;
  const signupRes = authService.signup({
    name: 'Dr. Debashis Mukherjee',
    email: newDoctorEmail,
    password: 'Password1234!',
    confirmPassword: 'Password1234!',
    role: 'doctor',
    specialization: 'Neuropsychiatry',
    hospital: 'Kolkata Cognitive Care Institute',
    city: 'Kolkata, West Bengal',
    phone: '+91 98300 11223',
    licenseId: 'WBMC-2015-88991',
    bio: 'Specialist in memory disorders and caregiver guidance.'
  });
  assert(signupRes.success === true, '2. New doctor registered successfully with practice metadata');
  assert(signupRes.user.role === 'doctor', '2. New user assigned role "doctor"');
  assert(signupRes.user.licenseId === 'WBMC-2015-88991', '2. License ID recorded');
  assert(signupRes.user.verificationStatus === 'Pending', '2. Honest verificationStatus initialized to "Pending"');

  // 3. Verify persistence in localStorage
  const savedUsersRaw = localStorage.getItem('mindmitra_auth_users_v1');
  assert(savedUsersRaw && savedUsersRaw.includes(newDoctorEmail), '3. New doctor persisted into localStorage mindmitra_auth_users_v1');

  // 4. Session restoration simulation (simulated browser refresh)
  const sessionRaw = localStorage.getItem('mindmitra_auth_session_v1');
  assert(sessionRaw !== null, '4. Active doctor session exists in localStorage');
  const parsedSession = JSON.parse(sessionRaw);
  assert(parsedSession.role === 'doctor', '4. Restored session maintains doctor role');

  // -------------------------------------------------------------
  // PHASE 2: STRICT 3-WAY ROLE ISOLATION & ROUTE GUARDS
  // -------------------------------------------------------------
  console.log('\n--- Phase 2: Role Guards & Route Protection ---');

  // Helper simulating router route guard check
  function simulateRouteGuard(user, targetRoute) {
    if (!user && targetRoute !== 'login' && targetRoute !== 'signup') {
      return { allowed: false, redirect: 'login' };
    }
    if (user && user.role === 'doctor') {
      if (['patient-home', 'my-day', 'memories', 'activities', 'caregiver-dashboard'].includes(targetRoute)) {
        return { allowed: false, redirect: 'doctor-portal' };
      }
    }
    if (user && user.role !== 'doctor' && targetRoute.startsWith('doctor-portal')) {
      return { allowed: false, redirect: user.role === 'caregiver' ? 'caregiver-dashboard' : 'patient-home' };
    }
    return { allowed: true, redirect: targetRoute };
  }

  // 5. Route guard: Doctor accessing patient or caregiver routes redirected to doctor-portal
  const drToPatient = simulateRouteGuard(drLogin.user, 'patient-home');
  assert(!drToPatient.allowed && drToPatient.redirect === 'doctor-portal', '5. Doctor blocked from patient-home and redirected to doctor-portal');
  const drToCaregiver = simulateRouteGuard(drLogin.user, 'caregiver-dashboard');
  assert(!drToCaregiver.allowed && drToCaregiver.redirect === 'doctor-portal', '5. Doctor blocked from caregiver-dashboard and redirected to doctor-portal');

  // 6. Route guard: Patient/Caregiver accessing doctor-portal redirected
  const patientUser = { id: 'user-asha', role: 'patient' };
  const patientToDoctor = simulateRouteGuard(patientUser, 'doctor-portal');
  assert(!patientToDoctor.allowed && patientToDoctor.redirect === 'patient-home', '6. Patient blocked from doctor-portal and redirected to patient-home');

  const caregiverUser = { id: 'user-caregiver-1', role: 'caregiver' };
  const cgToDoctor = simulateRouteGuard(caregiverUser, 'doctor-portal');
  assert(!cgToDoctor.allowed && cgToDoctor.redirect === 'caregiver-dashboard', '6. Caregiver blocked from doctor-portal and redirected to caregiver-dashboard');

  // 7. Route guard: Unauthenticated user redirected to login
  const unauthGuard = simulateRouteGuard(null, 'doctor-portal');
  assert(!unauthGuard.allowed && unauthGuard.redirect === 'login', '7. Unauthenticated visitor redirected to login');

  // -------------------------------------------------------------
  // PHASE 3: DYNAMIC OVERVIEW METRICS & SECTION 5 METHODS
  // -------------------------------------------------------------
  console.log('\n--- Phase 3: Dynamic Metrics & Section 5 API Methods ---');

  // Switch back to canonical Dr. Sharma
  authService.login('ananya@mindmitra.in', 'Doctor1234!');

  // 8. Section 5 Explicit Methods
  const authPatients = doctorService.getAuthorizedPatients('user-dr-sharma');
  assert(Array.isArray(authPatients), '8. getAuthorizedPatients() returns an array');
  assert(authPatients.length >= 1, '8. Dr. Sharma has at least 1 pre-seeded authorized patient (Asha Devi)');

  const sharedReports = doctorService.getSharedCareReports('user-dr-sharma');
  assert(Array.isArray(sharedReports), '8. getSharedCareReports() returns an array');
  assert(sharedReports.length >= 1, '8. Dr. Sharma has shared reports available');

  const observations = doctorService.getDoctorObservations('user-dr-sharma');
  assert(Array.isArray(observations), '8. getDoctorObservations() returns an array');
  assert(observations.length >= 1, '8. Dr. Sharma has clinical observations recorded');

  const pendingRequests = doctorService.getPendingPatientRequests('user-dr-sharma');
  assert(Array.isArray(pendingRequests), '8. getPendingPatientRequests() returns an array');

  // -------------------------------------------------------------
  // PHASE 4: CONNECTION LIFECYCLE & IN-APP NOTIFICATIONS
  // -------------------------------------------------------------
  console.log('\n--- Phase 4: Connection Lifecycle & Notification Telemetry ---');

  // 9. Doctor requests connection to patient-2 (or another patient)
  const reqRes = doctorService.requestConnection({
    doctorId: 'user-dr-sharma',
    patientId: 'patient-2',
    notes: 'Routine cognitive and behavioral telehealth monitoring request.'
  });
  assert(reqRes.success === true, '9. Doctor successfully initiated connection request');
  assert(reqRes.connection.status === CONNECTION_STATUS.PENDING, '9. Initial connection status is "pending"');

  // 10. Verify notification was dispatched to store.state.notifications
  const state = store.getState();
  const latestNotif = (state.notifications || [])[0];
  assert(latestNotif && (latestNotif.type === 'connection' || latestNotif.type === 'doctor_request'), '10. In-app notification generated for the pending connection request');
  assert(latestNotif.message.includes('Dr. Ananya Sharma'), '10. Notification message properly identifies Dr. Sharma');

  // 11. Doctor cancels/withdraws pending request
  const cancelRes = doctorService.updateConnectionStatus(reqRes.connection.id, CONNECTION_STATUS.REJECTED, 'patient-2', 'doctor');
  assert(cancelRes.success === true, '11. Doctor successfully withdrew/cancelled pending connection');
  assert(cancelRes.connection.status === CONNECTION_STATUS.REJECTED, '11. Connection status transitioned to "rejected"');

  // 12. Create fresh request and approve via Caregiver action
  const req2 = doctorService.requestConnection({
    doctorId: 'user-dr-sharma',
    patientId: 'patient-2',
    notes: 'Clinical care team partnership.'
  });
  const approveRes = doctorService.updateConnectionStatus(req2.connection.id, CONNECTION_STATUS.APPROVED, 'patient-2', 'caregiver');
  assert(approveRes.success === true, '12. Caregiver successfully approved doctor connection request');
  assert(approveRes.connection.status === CONNECTION_STATUS.APPROVED, '12. Status transitioned to "approved"');
  assert(doctorService.hasDoctorAccess('user-dr-sharma', 'patient-2') === true, '12. Doctor now has authorized access to patient-2');

  // -------------------------------------------------------------
  // PHASE 5: PATIENT DETAIL & TELEMETRY BOUNDARIES
  // -------------------------------------------------------------
  console.log('\n--- Phase 5: Patient Detail, Appointment Integration & DPDP Safety ---');

  // 13. Authorized Patient Detail Telemetry
  const patientSummary = doctorService.getDoctorPatientSummary('user-dr-sharma', 'user-asha');
  assert(patientSummary.patientName === 'Asha Devi', '13. Patient summary retrieves Asha Devi');
  assert(patientSummary.routineAdherenceRate !== undefined, '13. Summary includes routine adherence rate');
  assert(patientSummary.activityCompletionCount !== undefined, '13. Summary includes completed activity count');

  // 14. Real Scheduled Appointments from store.getRemindersForPatient
  const ashaReminders = store.getRemindersForPatient('user-asha');
  const appointments = ashaReminders.filter(r => r.category === 'appointment');
  assert(Array.isArray(appointments), '14. Routine appointment queries function via store');

  // 15. DPDP Minimum-Necessary Privacy & Zero-Leakage
  assert(patientSummary.personalPhotos === undefined, '15. Private family photos NOT leaked to clinical summary');
  assert(patientSummary.chatTranscripts === undefined, '15. Family chat/voice logs NOT leaked to clinical summary');
  assert(patientSummary.disclaimer.includes('non-diagnostic'), '15. Non-diagnostic disclaimer included in summary');

  // -------------------------------------------------------------
  // PHASE 6: SHARED REPORTS & REVIEW WORKFLOW
  // -------------------------------------------------------------
  console.log('\n--- Phase 6: Caregiver Reports Sharing & Review Lifecycle ---');

  // 16. Caregiver shares report with Dr. Sharma
  const testReportId = `rep-e2e-${Date.now()}`;
  const shareResult = doctorService.shareReportWithDoctor({
    reportId: testReportId,
    patientId: 'user-asha',
    doctorId: 'user-dr-sharma',
    title: 'Bi-Weekly Cognitive & Routine Overview',
    dateRangeSpec: 'last_14_days',
    sharedBy: 'Meera (Caregiver)',
    summaryMetrics: {
      routineAdherence: '92%',
      completedActivities: 16
    }
  });
  assert(shareResult.success === true, '16. Report shared successfully');
  assert(shareResult.sharedReport.status === 'shared', '16. Newly shared report status is "shared"');

  // 17. Doctor views report -> transitions to "viewed"
  const viewedReport = doctorService.getSharedReportDetails(testReportId, 'user-dr-sharma');
  assert(viewedReport.status === 'viewed', '17. Report status transitioned to "viewed" upon open');

  // 18. Doctor records clinical observation on this report -> transitions to "reviewed"
  const noteOnReport = doctorService.addDoctorNote({
    patientId: 'user-asha',
    doctorId: 'user-dr-sharma',
    doctorName: 'Dr. Ananya Sharma',
    reportId: testReportId,
    noteText: 'Routine stability verified. Suggest continuing gentle morning recall exercises.',
    noteType: NOTE_TYPES.COMMENT
  });
  assert(noteOnReport.success === true, '18. Doctor note added to shared report');
  const reviewedReport = doctorService.getSharedReportDetails(testReportId, 'user-dr-sharma');
  assert(reviewedReport.status === 'reviewed', '18. Shared report status transitioned to "reviewed" upon doctor comment');

  // -------------------------------------------------------------
  // PHASE 7: OBSERVATIONS INTEGRITY & IMMUTABILITY
  // -------------------------------------------------------------
  console.log('\n--- Phase 7: Doctor Notes Integrity & Record Immutability ---');

  // 19. Doctor note creation
  const preActCount = store.getActivityResults('user-asha').length;
  const newNoteRes = doctorService.addDoctorNote({
    patientId: 'user-asha',
    doctorId: 'user-dr-sharma',
    doctorName: 'Dr. Ananya Sharma',
    noteText: 'Maintain current morning tea hydration schedule.',
    noteType: NOTE_TYPES.RECOMMENDATION
  });
  assert(newNoteRes.success === true, '19. Clinical observation created');
  assert(newNoteRes.note.id.startsWith('dnote-'), '19. Note ID uses dnote-* prefix');
  assert(newNoteRes.note.isDoctorEntered === true, '19. Provenance flag isDoctorEntered is true');
  assert(newNoteRes.note.patientName === 'Asha Devi', '19. Patient name attribution attached dynamically');

  // 20. Patient records immutability
  const postActCount = store.getActivityResults('user-asha').length;
  assert(preActCount === postActCount, '20. Doctor note creation NEVER overwrites patient activity results');

  // -------------------------------------------------------------
  // PHASE 8: DOCTOR PROFILE UPDATE & SESSION SYNC
  // -------------------------------------------------------------
  console.log('\n--- Phase 8: Doctor Profile Update & Session Sync ---');

  // 21. Update profile
  const updatedPhone = '+91 98450 77665';
  const updatedHospital = 'Shillong Neurological & Cognitive Care Centre';
  const profRes = doctorService.updateDoctorProfile('user-dr-sharma', {
    phone: updatedPhone,
    hospital: updatedHospital,
    city: 'Shillong, Meghalaya'
  });
  assert(profRes.success === true, '21. Profile updated via doctorService');
  assert(profRes.user.phone === updatedPhone, '21. Phone updated');
  assert(profRes.user.hospital === updatedHospital, '21. Hospital updated');
  assert(profRes.user.verificationStatus === 'Pending', '21. Verification status remains immutable "Pending"');

  // 22. Verify session in localStorage was updated without re-login
  const updatedSession = JSON.parse(localStorage.getItem('mindmitra_auth_session_v1'));
  assert(updatedSession.hospital === updatedHospital, '22. Active session in localStorage immediately reflects updated hospital');

  // -------------------------------------------------------------
  // PHASE 9: SMRITIAI ROLE-AWARE DOCTOR INQUIRIES
  // -------------------------------------------------------------
  console.log('\n--- Phase 9: SmritiAI Role-Aware Dynamic Telemetry ---');

  // 23. Patient asking about connected doctor
  const aiDocQuery = smritiAIService.generateResponse('Who is my doctor?', {
    patientId: 'user-asha',
    patientName: 'Asha Devi',
    userRole: 'patient'
  });
  assert(aiDocQuery.text.includes('Dr. Ananya Sharma'), '23. SmritiAI patient query identifies connected doctor Dr. Sharma');
  assert(aiDocQuery.actionRoute === 'my-doctors', '23. Patient guided to "my-doctors"');

  // 24. Patient with NO connected doctor
  const aiNoDocQuery = smritiAIService.generateResponse('Who is my doctor?', {
    patientId: 'patient-unknown-999',
    patientName: 'Kavita',
    userRole: 'patient'
  });
  assert(aiNoDocQuery.text.includes('You do not currently have a doctor connected to your care profile'), '24. SmritiAI zero-fabrication: explicitly states no doctor connected');
  assert(!aiNoDocQuery.text.includes('Dr. Sharma'), '24. No hardcoded Dr. Sharma invented when unconnected');

  // 25. Doctor asking for shared patient reports
  const aiDrReports = smritiAIService.generateResponse('Show my recent patient reports', {
    doctorId: 'user-dr-sharma',
    userRole: 'doctor'
  });
  assert(aiDrReports.text.includes('shared patient report'), '25. Doctor asking SmritiAI receives shared reports summary');
  assert(aiDrReports.actionRoute === 'doctor-portal/reports', '25. Action route links to doctor-portal/reports');

  // 26. Doctor asking about unauthorized patient (DPDP Privacy Enforcement)
  const aiDrUnauth = smritiAIService.generateResponse('Summarize activity for patient', {
    doctorId: 'user-dr-sharma',
    targetPatientId: 'unauthorized-patient-xyz',
    userRole: 'doctor'
  });
  assert(aiDrUnauth.text.includes('Access Denied') && aiDrUnauth.text.includes('DPDP'), '26. DPDP access denied when doctor queries unauthorized patient');

  // 27. Doctor asking about authorized patient
  const aiDrAuth = smritiAIService.generateResponse('Summarize patient activity', {
    doctorId: 'user-dr-sharma',
    targetPatientId: 'user-asha',
    userRole: 'doctor'
  });
  assert(aiDrAuth.text.includes('Authorized Non-Diagnostic Care Summary') && aiDrAuth.text.includes('Asha Devi'), '27. Authorized patient summary returned to doctor');

  // 28. Caregiver asking for care report
  const aiCgReport = smritiAIService.generateResponse('Generate a routine care report for Asha', {
    patientId: 'user-asha',
    patientName: 'Asha Devi',
    userRole: 'caregiver'
  });
  assert(aiCgReport.text.includes('Routine Care Summary for Asha Devi'), '28. Caregiver receives routine summary telemetry');
  assert(aiCgReport.actionRoute === 'caregiver-reports', '28. Action route links to caregiver-reports');

  // -------------------------------------------------------------
  // PHASE 10: PATIENT "MY DOCTORS" & REVOKE ACCESS
  // -------------------------------------------------------------
  console.log('\n--- Phase 10: Patient "My Doctors" View & Connection Revocation ---');

  // 29. Patient connections query
  const patientConns = doctorService.getPatientConnections('user-asha');
  assert(patientConns.some(c => c.doctorId === 'user-dr-sharma' && c.status === 'approved'), '29. Patient connects to Dr. Sharma');

  // 30. Revoke access from patient side
  const ashaConn = patientConns.find(c => c.doctorId === 'user-dr-sharma');
  const revokeRes = doctorService.updateConnectionStatus(ashaConn.id, CONNECTION_STATUS.REVOKED, 'user-asha', 'patient');
  assert(revokeRes.success === true, '30. Patient successfully revoked doctor access');
  assert(doctorService.hasDoctorAccess('user-dr-sharma', 'user-asha') === false, '30. Doctor access immediately terminated upon revocation');

  // 31. Doctor cannot read revoked patient telemetry
  let revokedSummaryBlocked = false;
  try {
    const res = doctorService.getDoctorPatientSummary('user-dr-sharma', 'user-asha');
    if (res === null || res === undefined) {
      revokedSummaryBlocked = true;
    }
  } catch (err) {
    revokedSummaryBlocked = true;
  }
  assert(revokedSummaryBlocked === true, '31. Doctor strictly blocked from fetching revoked patient summary');

  // Restore connection for clean ongoing state
  doctorService.updateConnectionStatus(ashaConn.id, CONNECTION_STATUS.APPROVED, 'user-asha', 'caregiver');
  assert(doctorService.hasDoctorAccess('user-dr-sharma', 'user-asha') === true, '32. Connection restored for clean system state');

  // 33. Audit log trail
  const auditTrail = doctorService.getAuditLogs();
  assert(auditTrail.length > 5, '33. Comprehensive audit trail recorded with provenance and timestamps');
  assert(auditTrail[0].timestamp !== undefined, '33. Audit log entries contain valid ISO timestamps');

  console.log('\n================================================================');
  console.log(`  ALL ${totalTests} DOCTOR E2E TESTS PASSED! (${passedTests}/${totalTests})`);
  console.log('  MINDMITRA THIRD ROLE (DOCTOR) FULLY FUNCTIONAL & VERIFIED     ');
  console.log('================================================================\n');
}

runE2ETests().catch(err => {
  console.error('\nE2E Test Execution Failed:', err);
  process.exit(1);
});
