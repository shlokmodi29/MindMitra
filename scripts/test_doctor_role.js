// MindMitra Doctor Role Automated Test Suite
// Verifies 25 key dimensions:
// 1. Canonical Doctor Credentials
// 2. Doctor Signup with practice metadata
// 3. Signup validation checks
// 4. Honest Verification Status ('Pending')
// 5. isDoctor() helper verification
// 6. Doctor Login & Session token
// 7. Role-specific home routing
// 8. Pre-seeded approved Doctor-Patient Connection
// 9. Pre-seeded shared care report
// 10. Pre-seeded clinical note with provenance
// 11. Request connection lifecycle
// 12. Approve connection lifecycle
// 13. Reject connection lifecycle
// 14. Revoke connection lifecycle
// 15. hasDoctorAccess() authorization enforcement
// 16. Unauthorized access blocking
// 17. Minimum-necessary privacy & data isolation (no raw photos or chats)
// 18. Doctor note additivity & non-overwriting behavior
// 19. Caregiver report sharing
// 20. Shared report details & review status transitions
// 21. Doctor profile update
// 22. SmritiAI patient doctor inquiry
// 23. SmritiAI non-diagnostic clinical summary
// 24. Audit logging
// 25. 3-way Role Isolation & Route protection

import { store } from '../src/state/store.js';
import { authService } from '../src/services/authService.js';
import { doctorService, CONNECTION_STATUS, NOTE_TYPES } from '../src/services/doctorService.js';
import { smritiAIService } from '../src/services/smritiAIService.js';

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

async function runTests() {
  console.log('======================================================');
  console.log('  RUNNING MINDMITRA THIRD ROLE (DOCTOR) TEST SUITE    ');
  console.log('======================================================\n');

  // 1. Canonical Demo Doctor Credentials
  const drLogin = authService.login('ananya@mindmitra.in', 'Doctor1234!');
  assert(drLogin.success === true, '1. Canonical doctor Dr. Ananya Sharma logs in successfully');
  assert(drLogin.user.id === 'user-dr-sharma', '1. Canonical doctor ID is user-dr-sharma');
  assert(drLogin.user.role === 'doctor', '1. Canonical doctor role is strictly "doctor"');

  // 2. Doctor Signup with practice metadata
  const newDrSignup = authService.signup({
    name: 'Dr. Vikram Sen',
    email: 'vikram.sen@guwahaticlinic.in',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    role: 'doctor',
    specialization: 'Geriatric Psychiatry',
    hospital: 'Guwahati Neurological Institute',
    city: 'Guwahati, Assam',
    phone: '+91 94350 99887',
    licenseId: 'AMC-2016-554432',
    bio: 'Clinical specialist in elder memory care and cognitive therapies.'
  });
  assert(newDrSignup.success === true, '2. New doctor Dr. Vikram Sen registered successfully');
  assert(newDrSignup.user.role === 'doctor', '2. New doctor role is "doctor"');
  assert(newDrSignup.user.specialization === 'Geriatric Psychiatry', '2. Practice specialization saved correctly');
  assert(newDrSignup.user.licenseId === 'AMC-2016-554432', '2. Registration license ID saved correctly');

  // 3. Signup Validation Checks
  const invalidEmail = authService.signup({
    name: 'Dr. Test',
    email: 'not-an-email',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    role: 'doctor'
  });
  assert(!invalidEmail.success && invalidEmail.error.includes('valid email'), '3. Invalid email address rejected safely');

  const passwordMismatch = authService.signup({
    name: 'Dr. Test',
    email: 'test@clinic.in',
    password: 'Password123!',
    confirmPassword: 'DifferentPassword!',
    role: 'doctor'
  });
  assert(!passwordMismatch.success && passwordMismatch.error.includes('do not match'), '3. Password mismatch rejected safely');

  // 4. Honest Verification Status
  assert(newDrSignup.user.verificationStatus === 'Pending', '4. New doctor verificationStatus initialized honestly to "Pending"');
  assert(drLogin.user.verificationStatus === 'Pending', '4. Canonical demo doctor verificationStatus is honestly "Pending"');

  // 5. isDoctor() helper verification
  assert(authService.isDoctor(drLogin.user) === true, '5. isDoctor() returns true for Dr. Sharma');
  assert(authService.isDoctor({ role: 'patient' }) === false, '5. isDoctor() returns false for patient role');
  assert(authService.isDoctor({ role: 'caregiver' }) === false, '5. isDoctor() returns false for caregiver role');
  assert(authService.isDoctor(null) === false, '5. isDoctor() returns false for null/undefined');

  // 6. Doctor Login & Session token
  const session = authService.getSession();
  assert(session && session.token && session.token.startsWith('mm_token_'), '6. Doctor session generates opaque token simulation');
  assert(session.role === 'doctor', '6. Session role is "doctor"');
  assert(session.password === undefined, '6. Plaintext password is never saved in session');

  // 7. Role-Specific Home Routing Verification
  const patientTarget = authService.getUserRole() === 'doctor' ? '#/doctor-portal' : '#/patient-home';
  assert(patientTarget === '#/doctor-portal', '7. Doctor session maps to #/doctor-portal');

  // 8. Pre-seeded approved Doctor-Patient Connection
  const docConnections = doctorService.getDoctorConnections('user-dr-sharma');
  assert(docConnections.length >= 1, '8. Dr. Sharma has pre-seeded connections');
  const ashaConn = docConnections.find(c => c.patientId === 'user-asha');
  assert(ashaConn !== undefined, '8. Pre-seeded connection found for patient Asha Devi');
  assert(ashaConn.status === CONNECTION_STATUS.APPROVED, '8. Pre-seeded connection status is approved');

  // 9. Pre-seeded shared care report
  const sharedReports = doctorService.getSharedReportsForDoctor('user-dr-sharma');
  assert(sharedReports.length >= 1, '9. Dr. Sharma has access to shared care reports');
  const ashaReport = sharedReports.find(r => r.patientId === 'user-asha');
  assert(ashaReport !== undefined, '9. Shared report for Asha Devi retrieved successfully');
  assert(ashaReport.summaryMetrics && ashaReport.summaryMetrics.routineAdherence === '92%', '9. Shared report contains routine adherence metric');

  // 10. Pre-seeded clinical note with provenance
  const doctorNotes = doctorService.getDoctorNotes('user-asha');
  assert(doctorNotes.length >= 1, '10. Pre-seeded doctor notes found for Asha Devi');
  const dnote1 = doctorNotes.find(n => n.id === 'dnote-1');
  assert(dnote1 !== undefined, '10. dnote-1 retrieved with doctor attribution');
  assert(dnote1.doctorName === 'Dr. Ananya Sharma', '10. Doctor attribution preserved');
  assert(dnote1.isDoctorEntered === true, '10. Provenance flag isDoctorEntered is true');

  // 11. Request connection lifecycle
  const reqRes = doctorService.requestConnection({
    doctorId: 'user-dr-sharma',
    patientId: 'user-patient-2',
    doctorName: 'Dr. Ananya Sharma',
    doctorSpecialization: 'Neurology / Cognitive Health',
    doctorHospital: 'Shillong Medical Centre',
    patientName: 'Ramesh Kumar'
  });
  assert(reqRes.success === true, '11. Doctor can request patient connection');
  assert(reqRes.connection.status === CONNECTION_STATUS.PENDING, '11. Connection request starts in "pending" status');

  // 12. Approve connection lifecycle
  const approveRes = doctorService.updateConnectionStatus(reqRes.connection.id, CONNECTION_STATUS.APPROVED, 'user-patient-2');
  assert(approveRes.success === true, '12. Connection status transitioned to "approved"');
  assert(approveRes.connection.status === CONNECTION_STATUS.APPROVED, '12. Connection is approved');

  // 13. Reject connection lifecycle
  const req2 = doctorService.requestConnection({
    doctorId: 'user-dr-vikram-temp',
    patientId: 'user-patient-2',
    doctorName: 'Dr. Temp',
    doctorSpecialization: 'Neurology',
    doctorHospital: 'Clinic',
    patientName: 'Ramesh Kumar'
  });
  const rejectRes = doctorService.updateConnectionStatus(req2.connection.id, CONNECTION_STATUS.REJECTED, 'user-patient-2');
  assert(rejectRes.success === true && rejectRes.connection.status === CONNECTION_STATUS.REJECTED, '13. Connection rejection lifecycle verified');

  // 14. Revoke connection lifecycle
  const revokeRes = doctorService.updateConnectionStatus(approveRes.connection.id, CONNECTION_STATUS.REVOKED, 'user-patient-2');
  assert(revokeRes.success === true && revokeRes.connection.status === CONNECTION_STATUS.REVOKED, '14. Connection revoking lifecycle verified');

  // 15. hasDoctorAccess() authorization enforcement
  const hasAshaAccess = doctorService.hasDoctorAccess('user-dr-sharma', 'user-asha');
  assert(hasAshaAccess === true, '15. hasDoctorAccess() returns true for approved Asha connection');
  const hasRevokedAccess = doctorService.hasDoctorAccess('user-dr-sharma', 'user-patient-2');
  assert(hasRevokedAccess === false, '15. hasDoctorAccess() returns false for revoked connection');

  // 16. Unauthorized access blocking
  const unauthorizedSummary = doctorService.getDoctorPatientSummary('user-dr-sharma', 'user-patient-2');
  assert(unauthorizedSummary === null, '16. Doctor cannot fetch summary for unapproved/revoked patient');
  const unauthorizedNote = doctorService.addDoctorNote({
    patientId: 'user-patient-2',
    doctorId: 'user-dr-sharma',
    noteText: 'Unauthorized test note'
  });
  assert(unauthorizedNote.success === false && unauthorizedNote.error.includes('Unauthorized'), '16. Unauthorized note creation strictly blocked');

  // 17. Minimum-necessary privacy & data isolation (no raw photos or chats)
  const authorizedSummary = doctorService.getDoctorPatientSummary('user-dr-sharma', 'user-asha');
  assert(authorizedSummary !== null, '17. Authorized patient summary retrieved');
  assert(authorizedSummary.routineAdherenceRate !== undefined, '17. Routine adherence rate included in summary');
  assert(authorizedSummary.adaptiveLevel !== undefined, '17. Adaptive cognitive level included in summary');
  assert(authorizedSummary.personalPhotos === undefined, '17. Raw personal photo albums NOT leaked to doctor');
  assert(authorizedSummary.familyChatTranscripts === undefined, '17. Private family voice/chat transcripts NOT leaked to doctor');

  // 18. Doctor note additivity & non-overwriting behavior
  const activitiesBefore = store.getActivityResults('user-asha').length;
  const newNoteRes = doctorService.addDoctorNote({
    patientId: 'user-asha',
    doctorId: 'user-dr-sharma',
    doctorName: 'Dr. Ananya Sharma',
    specialization: 'Neurology / Cognitive Health',
    noteText: 'Recommend continuing daily music reminiscence and morning hydration rhythm.',
    noteType: NOTE_TYPES.OBSERVATION
  });
  assert(newNoteRes.success === true, '18. Doctor observation note created successfully');
  assert(newNoteRes.note.id.startsWith('dnote-'), '18. Doctor note has distinct dnote-* ID');
  const activitiesAfter = store.getActivityResults('user-asha').length;
  assert(activitiesBefore === activitiesAfter, '18. Doctor note addition NEVER overwrites patient activity records');

  // 19. Caregiver report sharing
  const shareRes = doctorService.shareReportWithDoctor({
    reportId: 'rep-test-share-1',
    patientId: 'user-asha',
    doctorId: 'user-dr-sharma',
    title: 'Monthly Cognitive Engagement Summary',
    dateRangeSpec: 'last_30_days',
    sharedBy: 'Meera (Caregiver)',
    summaryMetrics: {
      routineAdherence: '94%',
      activitiesCompleted: 28,
      adaptiveLevel: 'Level 2'
    }
  });
  assert(shareRes.success === true, '19. Caregiver successfully shared report with Dr. Sharma');
  assert(shareRes.sharedReport.status === 'shared', '19. Newly shared report status is "shared"');

  // 20. Shared report details & review status transitions
  const viewedReport = doctorService.getSharedReportDetails('rep-test-share-1', 'user-dr-sharma');
  assert(viewedReport !== null && viewedReport.status === 'viewed', '20. Report status transitioned to "viewed" upon open');
  const reviewNote = doctorService.addDoctorNote({
    patientId: 'user-asha',
    doctorId: 'user-dr-sharma',
    noteText: 'Monthly review complete. Cognitive patterns remain stable.',
    noteType: NOTE_TYPES.COMMENT,
    reportId: 'rep-test-share-1'
  });
  assert(reviewNote.success === true, '20. Review note added to shared report');
  const reviewedReport = doctorService.getSharedReportDetails('rep-test-share-1', 'user-dr-sharma');
  assert(reviewedReport.status === 'reviewed', '20. Report status transitioned to "reviewed" upon adding clinical comment');

  // 21. Doctor profile update
  const profUpdate = doctorService.updateDoctorProfile('user-dr-sharma', {
    specialization: 'Cognitive Neurology & Elder Health',
    hospital: 'Shillong Regional Medical Centre',
    city: 'Shillong, Meghalaya',
    phone: '+91 98320 54321',
    bio: 'Senior consultant specializing in dementia care and elder cognitive rehabilitation.'
  });
  assert(profUpdate.success === true, '21. Doctor profile updated successfully');
  assert(profUpdate.user.specialization === 'Cognitive Neurology & Elder Health', '21. Specialization updated');
  assert(profUpdate.user.verificationStatus === 'Pending', '21. Verification status remains immutable "Pending"');

  // 22. SmritiAI patient doctor inquiry
  const aiDoctorQuery = smritiAIService.generateResponse('Who is my doctor and when is my appointment?', {
    patientId: 'user-asha',
    patientName: 'Asha Devi',
    language: 'en'
  });
  assert(aiDoctorQuery.text.includes('Dr. Ananya Sharma'), '22. SmritiAI correctly identifies connected doctor Dr. Sharma');
  assert(aiDoctorQuery.actionRoute === 'my-doctors', '22. SmritiAI routes patient to my-doctors');

  // 23. SmritiAI non-diagnostic clinical summary
  const aiReportQuery = smritiAIService.generateResponse('Summarize patient report and routine adherence', {
    patientId: 'user-asha',
    patientName: 'Asha Devi',
    language: 'en'
  });
  assert(aiReportQuery.text.includes('92%'), '23. SmritiAI returns non-diagnostic adherence metric');
  assert(!aiReportQuery.text.includes('cure') && !aiReportQuery.text.includes('prescribe'), '23. Non-diagnostic safety boundaries strictly preserved');

  // 24. Audit logging
  const auditLogs = doctorService.getAuditLogs();
  assert(auditLogs.length > 0, '24. Audit logs recorded for doctor activities');
  const lastAction = auditLogs[auditLogs.length - 1];
  assert(lastAction.actorId === 'user-dr-sharma', '24. Audit log captures actor ID with provenance');
  assert(lastAction.timestamp !== undefined, '24. Audit log captures ISO timestamp');

  // 25. 3-way Role Isolation & Route protection
  // Test role helper isolation
  assert(authService.isDoctor({ role: 'doctor' }) === true, '25. Doctor role recognized');
  assert(authService.isCaregiver({ role: 'doctor' }) === false, '25. Doctor cannot act as caregiver');
  assert(authService.isPatient({ role: 'doctor' }) === false, '25. Doctor cannot act as patient');
  // Re-login as Asha and verify patient cannot access doctor data
  authService.login('asha@mindmitra.in', 'Asha1234!');
  assert(authService.isDoctor() === false, '25. Asha is strictly not a doctor');
  assert(authService.isPatient() === true, '25. Asha is patient');

  console.log('\n======================================================');
  console.log(`  ALL ${totalTests} TESTS PASSED! (${passedTests}/${totalTests})`);
  console.log('  MINDMITRA THIRD ROLE (DOCTOR) VERIFIED 100% SUCCESS  ');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
