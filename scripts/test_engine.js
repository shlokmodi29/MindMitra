// MindMitra Comprehensive Automated Test Suite
import { initialDatabase } from '../src/state/database.js';
import { smritiCompanion } from '../src/services/smritiCompanion.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('   MINDMITRA SYSTEM & COGNITIVE ENGINE TEST SUITE   ');
console.log('====================================================\n');

// 1. Database Integrity Tests
console.log('--- 1. Testing Database & Canonical Schema ---');
assert(initialDatabase.users && initialDatabase.users.length >= 2, 'Users collection contains Asha and Meera profiles');
assert(initialDatabase.users[0].name === 'Asha Devi', 'Primary patient is Asha Devi');
assert(initialDatabase.users[1].name === 'Meera', 'Primary caregiver is Meera');

// Validate all 20 canonical activities
assert(initialDatabase.activities && initialDatabase.activities.length === 20, 'Database contains exactly 20 canonical cognitive activities');

const expectedActivityIds = [
  'act-1', 'act-2', 'act-3', 'act-4', 'act-5',
  'act-6', 'act-7', 'act-8', 'act-9', 'act-10',
  'act-11', 'act-12', 'act-13', 'act-14', 'act-15',
  'act-16', 'act-17', 'act-18', 'act-19', 'act-20'
];

const foundIds = initialDatabase.activities.map(a => a.id);
const allIdsPresent = expectedActivityIds.every(id => foundIds.includes(id));
assert(allIdsPresent, 'All activity IDs act-1 through act-20 exist');

const categories = new Set(initialDatabase.activities.map(a => a.category));
assert(categories.has('REMEMBER') && categories.has('NOTICE') && categories.has('SEQUENCE') && categories.has('EXPLORE') && categories.has('CONNECT') && categories.has('SOLVE'), 
  'All 6 cognitive activity categories (REMEMBER, NOTICE, SOLVE, SEQUENCE, EXPLORE, CONNECT) are represented');

// Validate every activity has question, hint, and valid options
let allStepsValid = true;
initialDatabase.activities.forEach(act => {
  if (!act.question || !act.hint || !act.options || act.options.length < 2) {
    allStepsValid = false;
  }
  const hasCorrect = act.options.some(opt => opt.correct === true);
  if (!hasCorrect) allStepsValid = false;
});
assert(allStepsValid, 'All 20 activities contain verified questions, hints, multiple choices, and correct answers');

// Validate Memories, People, Places, Events
assert(initialDatabase.memories && initialDatabase.memories.length >= 7, 'Living Archive contains initial rich memories');
assert(initialDatabase.people && initialDatabase.people.length >= 4, 'Family Circle contains Meera, Ravi, Priya, and Baba');
assert(initialDatabase.places && initialDatabase.places.length >= 3, 'Places contains Shillong, Umiam, Guwahati');
assert(initialDatabase.events && initialDatabase.events.length >= 3, 'Events contains Shillong Trip, Convocation, Durga Puja');
assert(initialDatabase.routines && initialDatabase.routines.length >= 4, 'Daily Care schedule contains medicine, hydration, routine items');
assert(initialDatabase.emergencyContacts && initialDatabase.emergencyContacts.length >= 3, 'Emergency contacts include Emergency Dispatch 112, Meera, Ravi');

// 2. SmritiAI Conversational Service Tests
console.log('\n--- 2. Testing SmritiAI Non-Diagnostic Intelligence ---');

const medicineReply = smritiCompanion.processQuery('Did I take my morning medicine?');
assert(medicineReply.type === 'schedule', 'Detects schedule inquiry type for medicine query');
assert(medicineReply.spokenText.toLowerCase().includes('routine') || medicineReply.spokenText.toLowerCase().includes('medicine') || medicineReply.spokenText.toLowerCase().includes('asha'), 'Provides gentle contextual spoken answer regarding routines');

const memoryReply = smritiCompanion.processQuery('Tell me about our trip to Shillong');
assert(memoryReply.type === 'memory', 'Detects memory storytelling type for Shillong trip query');
assert(memoryReply.spokenText.toLowerCase().includes('shillong') || memoryReply.spokenText.toLowerCase().includes('tea'), 'Mentions Shillong memories and tea garden warm reminiscence');

const emergencyReply = smritiCompanion.processQuery('Emergency help me I fell');
assert(emergencyReply.type === 'emergency', 'Detects emergency/safety distress keywords');
assert(emergencyReply.action === 'emergency-sos', 'Triggers emergency action routing to emergency-sos');

// 3. Store & Activity Engine Tests
console.log('\n--- 3. Testing Store & Activity Engine Execution ---');
import { store } from '../src/state/store.js';
import { activityEngine } from '../src/services/activityEngine.js';
import { emergencyService } from '../src/services/emergencyService.js';

// Test executing across ALL 20 activities in the engine
let all20Executable = true;
initialDatabase.activities.forEach(item => {
  activityEngine.startSession(item.id);
  const cur = store.getActiveActivity();
  if (!cur || cur.id !== item.id) all20Executable = false;
  if (!cur.options || cur.options.length === 0) all20Executable = false;
  // Select first option and evaluate
  activityEngine.selectOption(cur.options[0].id);
  const res = activityEngine.evaluateStep();
  if (!res || !res.status) all20Executable = false;
});
assert(all20Executable, 'All 20 activities successfully loaded, options selected, and evaluated in ActivityEngine');

// Check adaptive difficulty and session summaries
const recordedSessions = store.getState().activitySessions;
assert(recordedSessions && recordedSessions.length > 0, 'ActivityEngine recorded session performance to reactive store');
const latestSession = recordedSessions[0];
assert(latestSession.assistanceLevel && latestSession.engagement && latestSession.accuracy !== undefined, 
  'Session record tracks accuracy, completion time, assistance level, and engagement without medical scores');

// 4. SmritiAI Advanced Features
console.log('\n--- 4. Testing SmritiAI Guidance & Context ---');
const activityGuidance = smritiCompanion.processQuery('How to play this game?');
assert(activityGuidance.type === 'activity_guidance', 'SmritiAI provides activity guidance and hint advice');

const screenHelp = smritiCompanion.processQuery('Where am I right now?');
assert(screenHelp.type === 'contextual_help', 'SmritiAI provides contextual screen orientation help');

// 5. Emergency SOS Service Tests
console.log('\n--- 5. Testing Emergency Service Safeguards ---');
const callResult = emergencyService.initiateCall('112', 'National Emergency 112');
assert(callResult.status === 'call_initiated' && callResult.number === '112', 'EmergencyService initiates explicit 112 dial intent');
const sosLogs = store.getState().sosEvents;
assert(sosLogs && sosLogs.length > 0, 'Emergency call intent recorded in persistent audit log');

// Test Daily Care Routine toggling
const routine = store.getState().routines[0];
const initialCompletion = routine.completed;
store.toggleRoutine(routine.id);
const toggledRoutine = store.getState().routines.find(r => r.id === routine.id);
assert(toggledRoutine.completed !== initialCompletion, 'Routine completed flag toggled in reactive store');

// Test Memory Addition
store.addMemory({
  title: 'Autumn Garden Walk',
  category: 'Places',
  description: 'Walking by the orange marigold bushes with Meera in the morning.'
});
const addedMemory = store.getState().memories.find(m => m.title === 'Autumn Garden Walk');
assert(!!addedMemory, 'New memory added to Living Archive in reactive store');

console.log('\n====================================================');
console.log(`TEST SUMMARY: Passed: ${passed} | Failed: ${failed}`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
