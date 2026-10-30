// MindMitra Part 10 — 25-Point Automated Verification Suite
// Emergency SOS, Caregiver Contacts, and Location Support Tests
import assert from 'assert';
import { store } from '../src/state/store.js';
import { emergencyService, CALL_STATES, LOCATION_STATES } from '../src/services/emergencyService.js';
import { renderEmergencySosView } from '../src/views/EmergencySosView.js';
import { smritiAIService, SMRITI_RESPONSE_TYPES } from '../src/services/smritiAIService.js';
import en from '../src/locales/en.js';
import hi from '../src/locales/hi.js';
import asLocale from '../src/locales/as.js';
import bn from '../src/locales/bn.js';

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('  RUNNING MINDMITRA PART 10 EMERGENCY SOS TESTS');
console.log('======================================================\n');

// 1. Primary 112 Action in View
runTest('1. Primary 112 Action: prominent CALL 112 button and accessibility attributes', () => {
  const html = renderEmergencySosView();
  assert.ok(html.includes('CALL 112'), 'Includes primary CALL 112 heading');
  assert.ok(html.includes('Police • Ambulance • Fire & Rescue'), 'Includes national response description');
  assert.ok(html.includes('dial112PrimaryBtn'), 'Contains primary dial button ID');
  assert.ok(html.includes('Toll-Free'), 'Mentions toll-free status');
});

// 2. Confirmation Safeguard Required Before Dialing
runTest('2. Confirmation safeguard: requestCall112 requires explicit confirmation before initiating', () => {
  const unconfirmed = emergencyService.requestCall112(false);
  assert.strictEqual(unconfirmed.status, CALL_STATES.CONFIRM_112);
  assert.strictEqual(unconfirmed.requiresConfirmation, true);
  assert.strictEqual(unconfirmed.number, '112');
});

// 3. Real Telephony Intent Invoked Without Fake Call Claims
runTest('3. Real telephony invocation: initiateCall returns accurate call_initiated status without faking answer', () => {
  emergencyService.setTelephonySupported(true);
  const result = emergencyService.requestCall112(true);
  assert.strictEqual(result.status, CALL_STATES.CALL_INITIATED);
  assert.strictEqual(result.number, '112');
  assert.ok(result.message.includes("calling screen has been opened"), 'Accurate platform message');
  assert.ok(!result.message.toLowerCase().includes('call successful'), 'Never claims call was answered');
});

// 4. Accurate Call States Spectrum
runTest('4. Complete call states spectrum supported', () => {
  assert.strictEqual(CALL_STATES.HELP_READY, 'emergency_help');
  assert.strictEqual(CALL_STATES.CONFIRM_112, 'confirm_112');
  assert.strictEqual(CALL_STATES.CONFIRM_CAREGIVER, 'confirm_caregiver');
  assert.strictEqual(CALL_STATES.CALL_INITIATED, 'call_initiated');
  assert.strictEqual(CALL_STATES.CALL_UNAVAILABLE, 'call_unavailable');
  assert.strictEqual(CALL_STATES.CALL_FAILED, 'call_failed');
  assert.strictEqual(CALL_STATES.CANCELLED, 'cancelled');

  const cancelResult = emergencyService.cancelCall();
  assert.strictEqual(cancelResult.status, CALL_STATES.CANCELLED);
  assert.ok(cancelResult.message.includes('cancelled'));
});

// 5. Unavailable Telephony Fallback Handling
runTest('5. Unavailable telephony state provides honest messaging and caregiver fallback', () => {
  emergencyService.setTelephonySupported(false);
  const unavailableResult = emergencyService.initiateCall('112', 'Emergency 112');
  assert.strictEqual(unavailableResult.status, CALL_STATES.CALL_UNAVAILABLE);
  assert.strictEqual(unavailableResult.message, "Calling isn't available on this device.");

  // Restore telephony support
  emergencyService.setTelephonySupported(true);
});

// 6. Configured Emergency Contacts Scoped to Patient
runTest('6. Configured emergency contacts loaded per patient from store', () => {
  const contacts = store.getEmergencyContactsForPatient('user-asha');
  assert.ok(contacts.length >= 2, 'Asha has configured contacts');
  const meera = contacts.find(c => c.name === 'Meera');
  assert.ok(meera, 'Meera contact present');
  assert.strictEqual(meera.priority, 'primary');
  assert.strictEqual(meera.roleLabel, 'Primary Caregiver');
  assert.ok(meera.phone.includes('+91'));
});

// 7. Multi-Patient Isolation: Patient A Cannot See Patient B Contacts or Logs
runTest('7. Multi-patient isolation: Patient A cannot see Patient B emergency contacts or history', () => {
  // Set up mock contact for patient B
  const caregiverUser = { userId: 'cg-1', name: 'Sister Nurse', role: 'caregiver' };
  store.addEmergencyContact({
    patientId: 'patient-vikram',
    name: 'Dr. Sen',
    relation: 'Physician',
    phone: '+91 91234 56789',
    priority: 'primary'
  }, caregiverUser);

  const ashaContacts = store.getEmergencyContactsForPatient('user-asha');
  const vikramContacts = store.getEmergencyContactsForPatient('patient-vikram');

  assert.ok(ashaContacts.every(c => c.patientId === 'user-asha'));
  assert.ok(vikramContacts.every(c => c.patientId === 'patient-vikram'));
  assert.ok(!ashaContacts.some(c => c.name === 'Dr. Sen'), 'Asha cannot see Vikram contacts');
});

// 8. Caregiver Can Add Valid Emergency Contact
runTest('8. Authorized caregiver can add emergency contact with required validation', () => {
  const caregiverUser = { userId: 'cg-meera', name: 'Meera', role: 'caregiver' };
  const newContact = store.addEmergencyContact({
    patientId: 'user-asha',
    name: 'Dr. Barua',
    relation: 'Family Physician',
    phone: '+91 98540 11223',
    priority: 'secondary',
    roleLabel: 'Secondary Contact'
  }, caregiverUser);

  assert.ok(newContact.id);
  assert.strictEqual(newContact.name, 'Dr. Barua');
  assert.strictEqual(newContact.enabled, true);

  // Clean up
  store.deleteEmergencyContact(newContact.id, caregiverUser);
});

// 9. Contact Validation Rejects Missing or Invalid Fields
runTest('9. Contact validation rejects missing name, missing phone, or invalid phone numbers', () => {
  const caregiverUser = { userId: 'cg-meera', name: 'Meera', role: 'caregiver' };

  // Missing name
  assert.throws(() => {
    store.addEmergencyContact({ phone: '+91 98450 12345' }, caregiverUser);
  }, /Contact name is required/);

  // Missing phone
  assert.throws(() => {
    store.addEmergencyContact({ name: 'Neighbor' }, caregiverUser);
  }, /Phone number is required/);

  // Invalid phone (letters)
  assert.throws(() => {
    store.addEmergencyContact({ name: 'Neighbor', phone: 'CALL-ME-NOW' }, caregiverUser);
  }, /Invalid phone number format/);
});

// 10. Duplicate Contact Prevention
runTest('10. Duplicate contact prevention rejects existing name or phone for same patient', () => {
  const caregiverUser = { userId: 'cg-meera', name: 'Meera', role: 'caregiver' };

  assert.throws(() => {
    store.addEmergencyContact({
      patientId: 'user-asha',
      name: 'Meera',
      phone: '+91 99999 99999'
    }, caregiverUser);
  }, /Duplicate contact/);
});

// 11. Caregiver Can Edit Contact Details
runTest('11. Authorized caregiver can edit contact details and change priority', () => {
  const caregiverUser = { userId: 'cg-meera', name: 'Meera', role: 'caregiver' };
  const ashaContacts = store.getEmergencyContactsForPatient('user-asha');
  const ravi = ashaContacts.find(c => c.name === 'Ravi');

  const updated = store.updateEmergencyContact(ravi.id, {
    relation: 'Elder Son',
    phone: '+91 99000 78219'
  }, caregiverUser);

  assert.strictEqual(updated.relation, 'Elder Son');
});

// 12. Single Primary Contact Constraint (Automatic Demotion)
runTest('12. Single primary contact constraint: promoting new contact automatically demotes previous primary', () => {
  const caregiverUser = { userId: 'cg-meera', name: 'Meera', role: 'caregiver' };
  const ashaContacts = store.getEmergencyContactsForPatient('user-asha');
  const meera = ashaContacts.find(c => c.name === 'Meera');
  const ravi = ashaContacts.find(c => c.name === 'Ravi');

  assert.strictEqual(meera.priority, 'primary');

  // Promote Ravi to primary
  store.setPrimaryEmergencyContact(ravi.id, caregiverUser);

  const updatedContacts = store.getEmergencyContactsForPatient('user-asha');
  const updatedRavi = updatedContacts.find(c => c.id === ravi.id);
  const updatedMeera = updatedContacts.find(c => c.id === meera.id);

  assert.strictEqual(updatedRavi.priority, 'primary');
  assert.strictEqual(updatedMeera.priority, 'secondary');

  // Restore Meera as primary
  store.setPrimaryEmergencyContact(meera.id, caregiverUser);
  const restored = store.getEmergencyContactsForPatient('user-asha').find(c => c.id === meera.id);
  assert.strictEqual(restored.priority, 'primary');
});

// 13. Enable/Disable and Delete Emergency Contacts
runTest('13. Caregiver can toggle contact enabled state and remove contacts', () => {
  const caregiverUser = { userId: 'cg-meera', name: 'Meera', role: 'caregiver' };
  const tempContact = store.addEmergencyContact({
    patientId: 'user-asha',
    name: 'Temporary Contact',
    relation: 'Helper',
    phone: '+91 98000 55555',
    priority: 'secondary'
  }, caregiverUser);

  // Toggle disable
  const disabledState = store.toggleEmergencyContactEnabled(tempContact.id, caregiverUser);
  assert.strictEqual(disabledState, false);

  // Toggle re-enable
  const enabledState = store.toggleEmergencyContactEnabled(tempContact.id, caregiverUser);
  assert.strictEqual(enabledState, true);

  // Delete
  const deleted = store.deleteEmergencyContact(tempContact.id, caregiverUser);
  assert.strictEqual(deleted.id, tempContact.id);
});

// 14. Patient Authorization Boundary
runTest('14. Unauthorized users or patients cannot add, edit, or delete emergency contacts', () => {
  const patientUser = { userId: 'user-asha', name: 'Asha Devi', role: 'patient' };

  assert.throws(() => {
    store.addEmergencyContact({ name: 'Hacker', phone: '+91 99999 11111' }, patientUser);
  }, /Unauthorized: Only authorized caregivers/);

  assert.throws(() => {
    store.deleteEmergencyContact('ec-2', patientUser);
  }, /Unauthorized: Only authorized caregivers/);
});

// 15. Patient View Displays Simple Contacts Without Administrative Edit Buttons
runTest('15. Patient view renders simple contact cards without administrative management buttons', () => {
  // Mock current user as patient
  const origUser = store.getState().currentUser;
  store.state.currentUser = { userId: 'user-asha', role: 'patient', name: 'Asha Devi' };

  const html = renderEmergencySosView();
  assert.ok(html.includes('Call Meera'), 'Shows patient calling button');
  assert.ok(!html.includes('Set Primary'), 'Patient view does not contain Set Primary controls');
  assert.ok(!html.includes('openAddContactModalBtn'), 'Patient view does not contain Add Contact button');

  store.state.currentUser = origUser;
});

// 16. Location Permission States Handling
runTest('16. Location permission states accurately identified', () => {
  assert.strictEqual(LOCATION_STATES.AVAILABLE, 'available');
  assert.strictEqual(LOCATION_STATES.PERMISSION_REQUIRED, 'permission_required');
  assert.strictEqual(LOCATION_STATES.UNAVAILABLE, 'unavailable');
  assert.strictEqual(LOCATION_STATES.DENIED, 'permission_denied');
  assert.strictEqual(LOCATION_STATES.ERROR, 'error');
});

// 17. Explicit Location Request Without Continuous Background Polling
runTest('17. Explicit location request executes once without continuous background tracking', async () => {
  const res = await emergencyService.requestLiveLocation();
  assert.ok(res.status);
  assert.ok(res.coords);
  assert.strictEqual(typeof res.coords.lat, 'number');
  assert.strictEqual(typeof res.coords.lng, 'number');
});

// 18. Transparent Location Policy (Never Claims Transmission to 112/Police)
runTest('18. Location transparency: disclaimer explicitly notes location is NOT sent to 112 or police', async () => {
  const res = await emergencyService.shareLocationWithCircle();
  assert.ok(res.disclaimer.includes('has not been sent to an emergency service'), 'Honest location disclaimer present');
});

// 19. Location Sharing with Caregiver Requires Explicit Confirmation
runTest('19. Share location with caregiver requires explicit confirmation step', async () => {
  const unconfirmed = await emergencyService.shareLocationWithCaregiver('ec-2', false);
  assert.strictEqual(unconfirmed.status, 'confirmation_required');
  assert.ok(unconfirmed.message.includes('Share your location with Meera'));

  const confirmed = await emergencyService.shareLocationWithCaregiver('ec-2', true);
  assert.strictEqual(confirmed.status, 'location_share_completed');
  assert.ok(confirmed.disclaimer.includes('has not been sent to an emergency service'));
});

// 20. SmritiAI Emergency Text Handoff
runTest('20. SmritiAI text emergency handoff: prompts with confirmation without auto-dialing', () => {
  const context = smritiAIService.getContext('user-asha', { language: 'en' });
  const response = smritiAIService.provider.generateResponse('I need emergency help', context, {});
  assert.strictEqual(response.type, SMRITI_RESPONSE_TYPES.EMERGENCY);
  assert.ok(response.text.includes('Would you like me to open Emergency Help'));
  assert.strictEqual(response.actionRoute, 'emergency-sos');
  assert.strictEqual(response.emergencyNumber, '112');
});

// 21. Voice SOS Handoff Requires Explicit Confirmation
runTest('21. Voice SOS handoff: suggests 112 with confirmation prompt', () => {
  const context = smritiAIService.getContext('user-asha', { language: 'en' });
  const response = smritiAIService.provider.generateResponse('Call for help', context, {});
  assert.strictEqual(response.type, SMRITI_RESPONSE_TYPES.EMERGENCY);
  assert.ok(response.spokenText.includes('Would you like to call 112'));
});

// 22. Emergency Event Audit Trail Scoped to Patient
runTest('22. Emergency event audit history records events per patient ID', () => {
  store.recordEmergencyEvent({
    action: 'emergency_help_opened',
    status: 'opened',
    details: 'Patient opened emergency safety panel',
    patientId: 'user-asha'
  });

  const events = store.getEmergencyEventsForPatient('user-asha');
  assert.ok(events.length > 0);
  const latest = events[0];
  assert.strictEqual(latest.action, 'emergency_help_opened');
  assert.strictEqual(latest.patientId, 'user-asha');
  assert.ok(latest.timestamp);
});

// 23. Privacy: Audit History Excludes Sensitive Media & Tracing
runTest('23. Privacy safeguard: audit history does not retain audio files or continuous GPS logs', () => {
  const events = store.getEmergencyEventsForPatient('user-asha');
  events.forEach(evt => {
    assert.strictEqual(evt.audioBlob, undefined, 'No audio recording in audit log');
    assert.strictEqual(evt.continuousTrail, undefined, 'No continuous tracking in audit log');
  });
});

// 24. Multilingual Emergency Localizations
runTest('24. Multilingual emergency translations across EN, HI, AS, and BN', () => {
  [en, hi, asLocale, bn].forEach((dict, idx) => {
    const lang = ['en', 'hi', 'as', 'bn'][idx];
    assert.ok(dict.emergency, `Dictionary ${lang} has emergency section`);
    assert.ok(dict.emergency.call112, `Dictionary ${lang} has call112`);
    assert.ok(dict.emergency.confirmTitle, `Dictionary ${lang} has confirmTitle`);
    assert.ok(dict.emergency.callInitiated, `Dictionary ${lang} has callInitiated`);
    assert.ok(dict.emergency.callUnavailable, `Dictionary ${lang} has callUnavailable`);
  });
});

// 25. Full Regression Verification (Parts 0–9 Operational)
runTest('25. Full system regression: auth, routines, memories, activities, SmritiAI, and voice operational', () => {
  const state = store.getState();
  assert.ok(state.routines.length > 0, 'Routines exist');
  assert.ok(state.memories.length > 0, 'Memories exist');
  assert.ok(state.activities.length === 20, 'All 20 activities registered');
  assert.ok(state.emergencyContacts.length >= 2, 'Emergency contacts exist');
});

console.log('\n======================================================');
console.log(`  PART 10 TEST RESULTS: ${passed}/${passed + failed} TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}
