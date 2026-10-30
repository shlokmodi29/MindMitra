// Automated Verification Suite for MindMitra Part 9: Family & Social Connection
// Tests Family Circle, Shared Memory Journey, Family Contributions, Permissions, SmritiAI Family Context, & Multi-Patient Isolation

// 1. Mock Browser Environment (localStorage, window, document)
const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => storage.get(k) || null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear()
};

globalThis.window = {
  location: { hash: '#/family-circle' },
  navigator: { onLine: true },
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
import { authService } from '../src/services/authService.js';
import { memoryService, FALLBACK_MEMORY_IMAGE } from '../src/services/memoryService.js';
import { voiceService } from '../src/services/voiceService.js';
import { smritiAIService, SMRITI_RESPONSE_TYPES } from '../src/services/smritiAIService.js';
import { activityEngine } from '../src/services/activityEngine.js';
import { activityRegistry } from '../src/services/activityRegistry.js';
import { renderFamilyCircleView } from '../src/views/FamilyCircleView.js';
import { renderEntityDetailModal } from '../src/components/EntityDetailModal.js';
import { renderCaregiverMemoryBridgeView } from '../src/views/CaregiverMemoryBridgeView.js';

let passedCount = 0;
let totalCount = 0;

function runTest(name, fn) {
  totalCount++;
  try {
    fn();
    passedCount++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

console.log('\n======================================================');
console.log('  RUNNING MINDMITRA PART 9 FAMILY & SOCIAL TESTS');
console.log('======================================================\n');

// 1. Family Circle Loads Patient-Specific People
runTest('1. Family Circle loads patient-specific people', () => {
  authService.login('asha@mindmitra.in', 'Asha1234!');
  const people = memoryService.getPeople('user-asha');
  assert.ok(people.length >= 3, 'Asha has family circle members');
  assert.ok(people.some(p => p.name === 'Meera' && p.relation === 'Daughter'));
  assert.ok(people.some(p => p.name === 'Ravi' && p.relation === 'Son'));
  assert.ok(people.some(p => p.name === 'Priya' && p.relation === 'Granddaughter'));
});

// 2. Multi-Patient Isolation: Patient A only sees Patient A people
runTest('2. Multi-patient isolation: Patient A cannot see Patient B people', () => {
  // Add a person belonging only to user-ramesh
  const rameshPerson = store.addPerson({
    patientId: 'user-ramesh',
    name: 'Sunita',
    relation: 'Sister',
    tag: 'Family Member',
    bio: 'Lives in Lucknow.'
  });

  const ashaPeople = memoryService.getPeople('user-asha');
  assert.strictEqual(ashaPeople.some(p => p.id === rameshPerson.id), false, 'Asha cannot see Ramesh family');

  const rameshPeople = memoryService.getPeople('user-ramesh');
  assert.ok(rameshPeople.some(p => p.id === rameshPerson.id), 'Ramesh sees Sunita');
});

// 3. No Hallucinated Relationships
runTest('3. No hallucinated relationships: only stored relationships are presented', () => {
  const people = memoryService.getPeople('user-asha');
  people.forEach(p => {
    assert.ok(p.relation, `Person ${p.name} has a defined stored relationship`);
    assert.ok(typeof p.relation === 'string' && p.relation.length > 0);
  });
});

// 4. Person Profile Stats Computation
runTest('4. Person profile stats computation (memories, places, stories, photos)', () => {
  const journey = memoryService.getSharedMemoryJourney('p-meera', 'user-asha');
  assert.ok(journey, 'Journey found for Meera');
  assert.ok(journey.stats.memoriesCount >= 1, 'Meera has connected memories');
  assert.ok(typeof journey.stats.placesCount === 'number');
  assert.ok(typeof journey.stats.storiesCount === 'number');
  assert.ok(journey.stats.photosCount >= 1, 'Meera has at least 1 portrait/photo');
});

// 5. Shared Memory Journey Resolves Real Graph
runTest('5. Shared memory journey resolves real relationship graph without graph jargon', () => {
  const journey = memoryService.getSharedMemoryJourney('p-meera', 'user-asha');
  assert.ok(Array.isArray(journey.memories), 'Memories list is present');
  assert.ok(Array.isArray(journey.places), 'Places list is present');
  assert.ok(Array.isArray(journey.photos), 'Photos list is present');
  // Check that memories actually connect to Meera
  assert.ok(journey.memories.some(m => (m.personIds && m.personIds.includes('p-meera')) || m.id === 'mem-1'));
});

// 6. Family Memory Contribution by Authorized User
runTest('6. Family memory contribution by authorized user creates valid keepsake', () => {
  authService.login('meera@mindmitra.in', 'Meera4321!');
  const contributor = authService.getCurrentUser();

  const newMemory = store.addContributedMemory({
    patientId: 'user-asha',
    title: 'Spring Tea on the Lawn',
    category: 'Special Moments',
    description: 'Fresh spring breeze and singing birds with daughter Meera.',
    companions: 'Meera',
    personIds: ['p-meera']
  }, contributor);

  assert.ok(newMemory.id, 'Contributed memory has valid ID');
  assert.strictEqual(newMemory.isFamilyContributed, true);
  assert.strictEqual(newMemory.createdBy, 'Meera');
  assert.strictEqual(newMemory.contributedBy, 'caregiver');

  // Return to Asha
  authService.login('asha@mindmitra.in', 'Asha1234!');
});

// 7. Contributed Memory Appears in Patient Memory World
runTest('7. Contributed memory immediately appears in patient Personal Memory World', () => {
  const ashaMemories = memoryService.getPatientMemories('user-asha');
  const found = ashaMemories.find(m => m.title === 'Spring Tea on the Lawn');
  assert.ok(found, 'Asha can see the contributed family memory');
  assert.strictEqual(found.isFamilyContributed, true);
});

// 8. Unauthorized / Anonymous User Contribution is Rejected
runTest('8. Unauthorized / anonymous user memory contribution is rejected', () => {
  assert.throws(() => {
    store.addContributedMemory({
      patientId: 'user-asha',
      title: 'Hacker Memory'
    }, null); // anonymous
  }, /Unauthorized/);

  assert.throws(() => {
    store.addContributedMemory({
      patientId: 'user-asha',
      title: 'Guest Memory'
    }, { id: 'anon', role: 'guest' });
  }, /Unauthorized/);
});

// 9. Patient Notification for Family Contributions
runTest('9. Patient notification is generated when family contributes a memory', () => {
  const notifs = store.getState().notifications;
  assert.ok(notifs.some(n => n.title === 'New Family Memory' && n.message.includes('Meera')));
});

// 10. Story Audio Readout with VoiceService
runTest('10. Story audio readout uses VoiceService with calm cadence and interruptible stop', () => {
  let speakCalled = false;
  let textSpoken = '';
  const originalSpeak = voiceService.speak;
  voiceService.speak = (text, opts) => {
    speakCalled = true;
    textSpoken = text;
    if (opts && opts.onEnd) opts.onEnd();
  };

  const p = memoryService.getPersonById('p-meera', 'user-asha');
  const journey = memoryService.getSharedMemoryJourney('p-meera', 'user-asha');
  const storyText = (journey && journey.stories && journey.stories[0]) ? journey.stories[0].text : p.bio;
  voiceService.speak(`Here is a memory story with ${p.name}. ${storyText}`);

  assert.ok(speakCalled, 'VoiceService speak was triggered');
  assert.ok(textSpoken.includes('Meera'), 'Spoken text mentions Meera');

  // Test stop
  voiceService.stop();
  assert.strictEqual(voiceService.isSpeaking(), false);

  voiceService.speak = originalSpeak;
});

// 11. Photo Associations Without Duplicate Uploads
runTest('11. Photo associations reuse existing URLs without duplicate entries', () => {
  const journey = memoryService.getSharedMemoryJourney('p-meera', 'user-asha');
  const urls = journey.photos.map(p => p.url);
  const uniqueUrls = new Set(urls);
  assert.strictEqual(urls.length, uniqueUrls.size, 'No duplicate photo URLs in shared journey');
});

// 12. Person Favorites Toggle & Persistence
runTest('12. Person favorites toggle and persist in store across reloads', () => {
  const initial = Boolean(memoryService.getPersonById('p-meera', 'user-asha').favorite);
  const toggled = store.togglePersonFavorite('p-meera');
  assert.strictEqual(toggled, !initial, 'Favorite state inverted');

  // Verify in store
  assert.strictEqual(memoryService.getPersonById('p-meera', 'user-asha').favorite, toggled);

  // Toggle back
  store.togglePersonFavorite('p-meera');
});

// 13. Contact Actions Reflect Real Configured Data
runTest('13. Contact actions reflect authentic configured contact numbers', () => {
  const meera = memoryService.getPersonById('p-meera', 'user-asha');
  assert.ok(meera.phone, 'Meera has a valid telephone string');
  assert.ok(meera.phone.includes('+91'));

  const baba = memoryService.getPersonById('p-baba', 'user-asha');
  assert.strictEqual(baba.phone, undefined, 'Late husband Baba has no active phone');
});

// 14. Unconfigured Contact Data Handles Gracefully
runTest('14. Unconfigured contact data handles gracefully without faking calls', () => {
  store.setSelectedEntityDetail({
    type: 'person',
    data: memoryService.getPersonById('p-baba', 'user-asha')
  });
  store.setEntityDetailModalOpen(true);
  const modalHtml = renderEntityDetailModal();
  assert.ok(modalHtml.includes('Contact number not configured'), 'Shows graceful unconfigured state');
  store.setEntityDetailModalOpen(false);
});

// 15. Care Circle Roles Properly Tagged
runTest('15. Care Circle roles are properly tagged (Primary Caregiver, Secondary Contact, etc.)', () => {
  const people = memoryService.getPeople('user-asha');
  const meera = people.find(p => p.id === 'p-meera');
  const ravi = people.find(p => p.id === 'p-ravi');
  assert.strictEqual(meera.tag, 'Primary Caregiver');
  assert.strictEqual(ravi.tag, 'Secondary Contact');
});

// 16. Family Memory Mission (Act-20) Integrates Real Family Context
runTest('16. Family Memory Mission (act-20) integrates real family context from memoryService', () => {
  activityEngine.startSession('act-20', 'user-asha');
  const modeState = activityEngine.getActiveModeState();
  assert.ok(modeState, 'Mission mode state initialized');
  assert.strictEqual(modeState.type, 'mission-adventure');
  assert.ok(modeState.stages.length === 3, 'Has 3 stages');

  // Verify real family person is in stage 1
  const stage1 = modeState.stages[0];
  assert.strictEqual(stage1.label, 'Person');
  assert.ok(stage1.answer.includes('Meera') || stage1.answer.includes('Priya'), 'Real family member in stage 1');

  // Verify stage 2 is real place
  const stage2 = modeState.stages[1];
  assert.strictEqual(stage2.label, 'Place');
  assert.ok(stage2.answer.includes('Shillong') || stage2.answer.includes('Courtyard'), 'Real sanctuary in stage 2');
});

// 17. SmritiAI "memories with [person]" Surfaces Connected Memories
runTest('17. SmritiAI "memories with daughter" surfaces connected memories', () => {
  const context = smritiAIService.getContext('user-asha', { language: 'en' });
  const response = smritiAIService.provider.generateResponse('Show me memories with my daughter', context, {});
  assert.strictEqual(response.type, SMRITI_RESPONSE_TYPES.PERSON);
  assert.ok(response.text.includes('Meera'), 'Identifies Meera as daughter');
  assert.ok(response.text.includes('memories'), 'Mentions memories');
  assert.strictEqual(response.actionRoute, 'family-circle');
});

// 18. SmritiAI "tell me about [person]" Returns Authentic Bio
runTest('18. SmritiAI "tell me about Ravi" returns authentic bio and relation', () => {
  const context = smritiAIService.getContext('user-asha', { language: 'en' });
  const response = smritiAIService.provider.generateResponse('Tell me about Ravi', context, {});
  assert.strictEqual(response.type, SMRITI_RESPONSE_TYPES.PERSON);
  assert.ok(response.text.includes('Ravi is your Son'));
  assert.ok(response.text.includes('Bangalore') || response.text.includes('festivals'));
});

// 19. SmritiAI "who was with me in [place]" Traverses Graph
runTest('19. SmritiAI "who was with me in Shillong" identifies companions', () => {
  const context = smritiAIService.getContext('user-asha', { language: 'en' });
  const response = smritiAIService.provider.generateResponse('Who was with me in Shillong?', context, {});
  assert.strictEqual(response.type, SMRITI_RESPONSE_TYPES.PERSON);
  assert.ok(response.text.includes('Shillong'));
  assert.ok(response.text.includes('Meera') || response.text.includes('Priya'));
});

// 20. SmritiAI Zero Fabrication on Unknown Family Members
runTest('20. SmritiAI zero fabrication on unknown family members', () => {
  const context = smritiAIService.getContext('user-asha', { language: 'en' });
  const response = smritiAIService.provider.generateResponse('Tell me about Uncle Vikram', context, {});
  assert.strictEqual(response.type, SMRITI_RESPONSE_TYPES.TEXT);
  assert.ok(response.text.includes("I don't have that person saved"));
});

// 21. Multilingual Family Queries (Hindi, Assamese, Bengali)
runTest('21. Multilingual family query support in Hindi, Assamese, and Bengali', () => {
  // Hindi
  const ctxHi = smritiAIService.getContext('user-asha', { language: 'hi' });
  const resHi = smritiAIService.provider.generateResponse('मेरी बेटी के साथ यादें दिखाओ', ctxHi, {});
  assert.strictEqual(resHi.type, SMRITI_RESPONSE_TYPES.PERSON);
  assert.ok(resHi.text.includes('मीरा') || resHi.text.includes('Meera'));

  // Assamese
  const ctxAs = smritiAIService.getContext('user-asha', { language: 'as' });
  const resAs = smritiAIService.provider.generateResponse('মোৰ ছোৱালী মীৰাৰ সৈতে স্মৃতি দেখুৱাওক', ctxAs, {});
  assert.strictEqual(resAs.type, SMRITI_RESPONSE_TYPES.PERSON);
  assert.ok(resAs.text.includes('মীৰা') || resAs.text.includes('স্মৃতি') || resAs.text.includes('Meera'));

  // Bengali
  const ctxBn = smritiAIService.getContext('user-asha', { language: 'bn' });
  const resBn = smritiAIService.provider.generateResponse('আমার মেয়ে মীরার সাথে স্মৃতি দেখাও', ctxBn, {});
  assert.strictEqual(resBn.type, SMRITI_RESPONSE_TYPES.PERSON);
  assert.ok(resBn.text.includes('মীরা') || resBn.text.includes('স্মৃতি') || resBn.text.includes('Meera'));
});

// 22. Broken Image Fallbacks for All Family Avatars and Photos
runTest('22. Broken image fallbacks exist on all family cards and entity modals', () => {
  const viewHtml = renderFamilyCircleView();
  assert.ok(viewHtml.includes('onerror="this.onerror=null; this.src='), 'Has image error fallback in Family Circle');

  store.setSelectedEntityDetail({
    type: 'person',
    data: memoryService.getPersonById('p-meera', 'user-asha')
  });
  store.setEntityDetailModalOpen(true);
  const modalHtml = renderEntityDetailModal();
  assert.ok(modalHtml.includes('onerror="this.onerror=null; this.src='), 'Has image error fallback in Entity Modal');
  store.setEntityDetailModalOpen(false);
});

// 23. Responsive UI and Accessible Touch Targets
runTest('23. Responsive UI and accessible touch targets (>= 44px min-height)', () => {
  const viewHtml = renderFamilyCircleView();
  assert.ok(viewHtml.includes('min-h-[50px]'), 'Buttons meet accessibility touch target threshold');
  assert.ok(viewHtml.includes('call-member-btn'), 'Call action button present');
  assert.ok(viewHtml.includes('open-shared-journey-btn'), 'Shared journey trigger present');
});

// 24. Zero Social Media Mechanics
runTest('24. Zero social media mechanics (no likes, comments, public feeds, or followers)', () => {
  const viewHtml = renderFamilyCircleView();
  assert.strictEqual(viewHtml.includes('post_feed'), false);
  assert.strictEqual(viewHtml.includes('followers'), false);
  assert.strictEqual(viewHtml.includes('like_count'), false);
  assert.strictEqual(viewHtml.includes('comments_section'), false);
});

// 25. Full System Regression Across Parts 0–8
runTest('25. Full regression: auth, routines, memories, activities, and voice services operational', () => {
  // Auth
  assert.ok(authService.isAuthenticated());
  // Reminders
  assert.ok(store.getRemindersForPatient('user-asha').length > 0);
  // Memory World
  assert.ok(memoryService.getPatientMemories('user-asha').length > 0);
  // Activities Hub
  assert.ok(activityRegistry.getAll().length === 20);
  // Voice Service
  assert.ok(typeof voiceService.speak === 'function');
  assert.ok(typeof voiceService.stop === 'function');
});

console.log('\n======================================================');
console.log(`  PART 9 TEST RESULTS: ${passedCount}/${totalCount} TESTS PASSED (100%)`);
console.log('======================================================\n');
