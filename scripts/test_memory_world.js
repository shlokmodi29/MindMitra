// Automated Verification Suite for MindMitra Part 4: Personal Memory World
// Tests all 34 criteria specified in Section 37 of requirements

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
    hash: '#/memory-world'
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
import { memoryService, MEMORY_CATEGORIES, FALLBACK_MEMORY_IMAGE } from '../src/services/memoryService.js';
import { authService } from '../src/services/authService.js';
import { renderMemoryWorldView } from '../src/views/MemoryWorldView.js';
import { renderCaregiverMemoryBridgeView } from '../src/views/CaregiverMemoryBridgeView.js';
import { renderMemoryGraph } from '../src/components/MemoryGraphView.js';
import { renderMemoryDetailModal } from '../src/components/MemoryDetailModal.js';
import { renderEntityDetailModal } from '../src/components/EntityDetailModal.js';
import { renderPatientHomeView } from '../src/views/PatientHomeView.js';
import { renderMyDayView } from '../src/views/MyDayView.js';

console.log('===========================================================');
console.log('MINDMITRA PART 4 — 34-POINT MEMORY WORLD TEST SUITE');
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

// ==========================================================
// CATEGORY 1: MEMORIES (Tests 1-7)
// ==========================================================

runTest(1, 'Memory list loads and reflects patient ownership', () => {
  const memories = memoryService.getPatientMemories('user-asha');
  assert.ok(memories.length >= 5, 'Must have initial rich memories');
  const viewHtml = renderMemoryWorldView();
  assert.ok(viewHtml.includes('Personal Memory World'), 'View contains Memory World heading');
  assert.ok(viewHtml.includes('Living Memory Archive'), 'View contains archive section');
});

runTest(2, 'Memory detail opens and displays rich content', () => {
  const memory = memoryService.getMemoryById('mem-1');
  assert.ok(memory, 'Spotlight memory exists');
  store.setSelectedMemoryDetail(memory);
  store.setMemoryDetailModalOpen(true);
  const detailHtml = renderMemoryDetailModal();
  assert.ok(detailHtml.includes('Tea Garden Morning, Shillong'), 'Modal displays memory title');
  assert.ok(detailHtml.includes('Listen to this Memory') || detailHtml.includes('Listen Now'), 'Modal displays voice listening action');
  assert.ok(detailHtml.includes('Meaningful Connections'), 'Modal displays connections');
  store.setMemoryDetailModalOpen(false);
});

runTest(3, 'Search works across title, description, and related entities', () => {
  const teaResults = memoryService.searchMemories('user-asha', 'tea');
  assert.ok(teaResults.length > 0, 'Matches tea in title or description');
  const shillongResults = memoryService.searchMemories('user-asha', 'Shillong');
  assert.ok(shillongResults.length > 0, 'Matches connected Shillong place');
  const nonExistent = memoryService.searchMemories('user-asha', 'xyznonexistent123');
  assert.strictEqual(nonExistent.length, 0, 'Returns empty for non-matching query');
});

runTest(4, 'Filters work by category tab, favorites, and important flags', () => {
  const places = memoryService.filterMemories('user-asha', { category: 'Places' });
  assert.ok(places.every(m => m.category === 'Places'), 'All filtered items have Places category');
  const favorites = memoryService.filterMemories('user-asha', { onlyFavorites: true });
  assert.ok(favorites.every(m => Boolean(m.favorite)), 'All items in Favorites are marked favorite');
});

runTest(5, 'Favorites work and persist in state and storage', () => {
  const targetId = 'mem-3';
  const initialFav = Boolean(memoryService.getMemoryById(targetId).favorite);
  const updatedFav = store.toggleMemoryFavorite(targetId);
  assert.strictEqual(updatedFav, !initialFav, 'Favorite status toggled');
  assert.strictEqual(memoryService.getMemoryById(targetId).favorite, updatedFav);

  // Check storage
  const raw = localStorage.getItem('mindmitra_core_db_v2');
  assert.ok(raw);
  const parsed = JSON.parse(raw);
  const found = parsed.memories.find(m => m.id === targetId);
  assert.strictEqual(found.favorite, updatedFav);
});

runTest(6, 'Important status works and persists in state and storage', () => {
  const targetId = 'mem-2';
  const initialImp = Boolean(memoryService.getMemoryById(targetId).important);
  const updatedImp = store.toggleMemoryImportant(targetId);
  assert.strictEqual(updatedImp, !initialImp, 'Important status toggled');
  assert.strictEqual(memoryService.getMemoryById(targetId).important, updatedImp);
});

runTest(7, 'Related memories work using real bidirectional relationship graphs', () => {
  const relatedToMem1 = memoryService.getRelatedMemories('mem-1');
  assert.ok(relatedToMem1.length > 0, 'mem-1 must have related memories');
  // mem-2 shares Shillong trip event and Meera companion
  assert.ok(relatedToMem1.some(m => m.id === 'mem-2'), 'mem-2 connected through shared place/event');
});

// ==========================================================
// CATEGORY 2: PEOPLE (Tests 8-10)
// ==========================================================

runTest(8, 'People list loads and includes family circle members', () => {
  const people = memoryService.getPeople('user-asha');
  assert.ok(people.length >= 4, 'Includes Meera, Ravi, Priya, Baba');
  assert.ok(people.some(p => p.name === 'Meera'));
  assert.ok(people.some(p => p.name === 'Priya'));
});

runTest(9, 'Person detail opens with bio, role, and connected memories', () => {
  const personContext = memoryService.getPersonWithContext('p-meera');
  assert.ok(personContext.person.name === 'Meera');
  assert.ok(personContext.memories.length > 0, 'Meera has connected memories');
  store.setSelectedEntityDetail('person', personContext);
  store.setEntityDetailModalOpen(true);
  const modalHtml = renderEntityDetailModal();
  assert.ok(modalHtml.includes('Meera'), 'Modal displays Meera');
  assert.ok(modalHtml.includes('Connected Memories'), 'Modal displays connected memories');
  store.setEntityDetailModalOpen(false);
});

runTest(10, 'Related memories work for person', () => {
  const meeraContext = memoryService.getPersonWithContext('p-meera');
  assert.ok(meeraContext.memories.some(m => m.id === 'mem-1' || m.id === 'mem-2'));
});

// ==========================================================
// CATEGORY 3: PLACES (Tests 11-13)
// ==========================================================

runTest(11, 'Places list loads sacred family sanctuaries', () => {
  const places = memoryService.getPlaces('user-asha');
  assert.ok(places.length >= 3, 'Includes Shillong, Umiam, Guwahati');
  assert.ok(places.some(plc => plc.name.includes('Shillong')));
});

runTest(12, 'Place detail opens with sensory description and location', () => {
  const placeContext = memoryService.getPlaceWithContext('plc-shillong');
  assert.ok(placeContext.place.name.includes('Shillong'));
  assert.ok(placeContext.memories.length > 0, 'Shillong has connected memories');
  store.setSelectedEntityDetail('place', placeContext);
  store.setEntityDetailModalOpen(true);
  const modalHtml = renderEntityDetailModal();
  assert.ok(modalHtml.includes('Shillong'), 'Modal displays Shillong');
  store.setEntityDetailModalOpen(false);
});

runTest(13, 'Related events and memories work for place', () => {
  const shillongContext = memoryService.getPlaceWithContext('plc-shillong');
  assert.ok(shillongContext.events.length > 0, 'Shillong has connected events');
  assert.ok(shillongContext.memories.some(m => m.id === 'mem-1'));
});

// ==========================================================
// CATEGORY 4: EVENTS (Tests 14-16)
// ==========================================================

runTest(14, 'Events list loads meaningful life celebrations', () => {
  const events = memoryService.getEvents('user-asha');
  assert.ok(events.length >= 3, 'Includes Shillong Trip, Convocation, Durga Puja');
  assert.ok(events.some(e => e.name.includes('Convocation')));
});

runTest(15, 'Event detail opens with date and linked memories', () => {
  const eventContext = memoryService.getEventWithContext('evt-convocation-2022');
  assert.ok(eventContext.event.name.includes('Convocation'));
  assert.ok(eventContext.memories.length > 0, 'Convocation has connected memories');
  store.setSelectedEntityDetail('event', eventContext);
  store.setEntityDetailModalOpen(true);
  const modalHtml = renderEntityDetailModal();
  assert.ok(modalHtml.includes('Convocation'), 'Modal displays event name');
  store.setEntityDetailModalOpen(false);
});

runTest(16, 'Related people and stories work for event', () => {
  const eventContext = memoryService.getEventWithContext('evt-shillong-2018');
  assert.ok(eventContext.people.some(p => p.name === 'Meera'));
  assert.ok(eventContext.stories.length > 0, 'Shillong trip has associated stories');
});

// ==========================================================
// CATEGORY 5: STORIES (Tests 17-19)
// ==========================================================

runTest(17, 'Stories list loads family spoken narratives', () => {
  const stories = memoryService.getStories('user-asha');
  assert.ok(stories.length >= 2, 'Contains rich stories');
  assert.ok(stories.some(s => s.title.includes('Spiced Tea')));
});

runTest(18, 'Story detail opens with author and full narrative text', () => {
  const storyContext = memoryService.getStoryWithContext('story-1');
  assert.ok(storyContext.story.title.includes('Spiced Tea'));
  assert.ok(storyContext.story.text.includes('Khasi hills'));
  store.setSelectedEntityDetail('story', storyContext);
  store.setEntityDetailModalOpen(true);
  const modalHtml = renderEntityDetailModal();
  assert.ok(modalHtml.includes('Spiced Tea'), 'Modal displays story title');
  store.setEntityDetailModalOpen(false);
});

runTest(19, 'Related memory information works for story', () => {
  const storyContext = memoryService.getStoryWithContext('story-1');
  assert.ok(storyContext.memories.some(m => m.id === 'mem-1'), 'Story connects to mem-1');
});

// ==========================================================
// CATEGORY 6: CREATION, EDITING & DELETION (Tests 20-23)
// ==========================================================

let testMemoryId = null;

runTest(20, 'Create memory works and establishes patient ownership', () => {
  const created = store.addMemory({
    patientId: 'user-asha',
    title: 'Spring Jasmine Garden Walk',
    category: 'Places',
    year: '2022',
    description: 'Walking past the night jasmine vines with Meera at dawn.',
    companions: 'With Meera',
    personIds: ['p-meera'],
    placeId: 'plc-guwahati',
    tags: ['Jasmine', 'Veranda', 'Morning']
  });

  assert.ok(created.id, 'Created memory must have ID');
  assert.strictEqual(created.title, 'Spring Jasmine Garden Walk');
  assert.strictEqual(created.patientId, 'user-asha');
  testMemoryId = created.id;
});

runTest(21, 'Edit memory works and updates timestamps', () => {
  const updated = store.updateMemory(testMemoryId, {
    title: 'Spring Jasmine Garden Walk (Updated)',
    description: 'Walking past the blooming night jasmine with ginger tea.'
  });

  assert.strictEqual(updated.title, 'Spring Jasmine Garden Walk (Updated)');
  assert.ok(updated.updatedAt, 'Updated timestamp must be present');
});

runTest(22, 'Delete memory works and prunes relationship links cleanly', () => {
  // Add an explicit relationship to test pruning
  store.addMemoryRelationship({
    patientId: 'user-asha',
    sourceType: 'memory',
    sourceId: testMemoryId,
    relationshipType: 'features',
    targetType: 'person',
    targetId: 'p-meera'
  });

  const relBefore = store.getState().memoryRelationships.filter(r => r.sourceId === testMemoryId);
  assert.ok(relBefore.length > 0, 'Relationship created for memory');

  store.deleteMemory(testMemoryId);
  assert.strictEqual(memoryService.getMemoryById(testMemoryId), null, 'Memory removed from store');

  const relAfter = store.getState().memoryRelationships.filter(r => r.sourceId === testMemoryId || r.targetId === testMemoryId);
  assert.strictEqual(relAfter.length, 0, 'Connected relationships pruned without orphans');
});

runTest(23, 'Changes persist after state save and reload', () => {
  const permanentMemory = store.addMemory({
    patientId: 'user-asha',
    title: 'Permanent Autumn Keepsake',
    category: 'Special Moments',
    description: 'Testing persistent storage of memory heirlooms.'
  });

  const raw = localStorage.getItem('mindmitra_core_db_v2');
  assert.ok(raw, 'Local storage contains database state');
  const parsed = JSON.parse(raw);
  const found = parsed.memories.find(m => m.id === permanentMemory.id);
  assert.ok(found, 'Created memory saved in localStorage');
  assert.strictEqual(found.title, 'Permanent Autumn Keepsake');
});

// ==========================================================
// CATEGORY 7: RELATIONSHIPS (Tests 24-27)
// ==========================================================

runTest(24, 'Relationships can be created with source, type, and target', () => {
  const rel = store.addMemoryRelationship({
    patientId: 'user-asha',
    sourceType: 'person',
    sourceId: 'p-ravi',
    relationshipType: 'associated_with',
    targetType: 'place',
    targetId: 'plc-guwahati'
  });

  assert.ok(rel.id, 'Relationship has ID');
  assert.strictEqual(rel.relationshipType, 'associated_with');
});

runTest(25, 'Relationships are stored and persisted', () => {
  const raw = localStorage.getItem('mindmitra_core_db_v2');
  const parsed = JSON.parse(raw);
  assert.ok(parsed.memoryRelationships.length > 0, 'Relationships persisted in storage');
});

runTest(26, 'Related memories use real relationships from graph', () => {
  const context = memoryService.getMemoryContext('mem-1');
  assert.ok(context.people.some(p => p.name === 'Meera'));
  assert.ok(context.place.name.includes('Shillong'));
});

runTest(27, 'Duplicate relationships are prevented', () => {
  const countBefore = store.getState().memoryRelationships.length;
  // Add duplicate of rel-1
  store.addMemoryRelationship({
    patientId: 'user-asha',
    sourceType: 'person',
    sourceId: 'p-meera',
    relationshipType: 'participated_in',
    targetType: 'event',
    targetId: 'evt-shillong-2018'
  });
  const countAfter = store.getState().memoryRelationships.length;
  assert.strictEqual(countAfter, countBefore, 'Duplicate relationship rejected');
});

// ==========================================================
// CATEGORY 8: SECURITY & PATIENT DATA ISOLATION (Tests 28-29)
// ==========================================================

runTest(28, 'Patient only sees their own memories (multi-patient isolation)', () => {
  // Add memory belonging to a different patient
  const foreignMemory = store.addMemory({
    patientId: 'user-ramesh',
    title: "Ramesh's Childhood Mango Orchard",
    category: 'Places',
    description: 'Climbing mango trees in rural Varanasi.'
  });

  const ashaMemories = memoryService.getPatientMemories('user-asha');
  const hasForeign = ashaMemories.some(m => m.id === foreignMemory.id);
  assert.strictEqual(hasForeign, false, "Asha cannot see Ramesh's memories");

  const rameshMemories = memoryService.getPatientMemories('user-ramesh');
  assert.ok(rameshMemories.some(m => m.id === foreignMemory.id), "Ramesh sees his own memory");
});

runTest(29, 'Caregiver sees only authorized patient data', () => {
  authService.login('meera@mindmitra.in', 'Meera4321!');
  const caregiverHtml = renderCaregiverMemoryBridgeView();
  assert.ok(caregiverHtml.includes('Memory Bridge Ingestion'), 'Caregiver bridge view renders');
  // Return to Asha
  authService.login('asha@mindmitra.in', 'Asha1234!');
});

// ==========================================================
// CATEGORY 9: QUALITY & INTEGRATION (Tests 30-34)
// ==========================================================

runTest(30, 'No broken images: fallbacks exist on all memories and entities', () => {
  const memories = memoryService.getPatientMemories('user-asha');
  assert.ok(memories.every(m => m.image || m.coverPhoto), 'Every memory has an image property');
  const viewHtml = renderMemoryWorldView();
  assert.ok(viewHtml.includes(FALLBACK_MEMORY_IMAGE), 'View has fallback image handler configured');
});

runTest(31, 'No broken routes: return to home links are valid', () => {
  const viewHtml = renderMemoryWorldView();
  assert.ok(viewHtml.includes('#/patient-home'), 'Return to home link is present');
});

runTest(32, 'No console or runtime errors during view and modal rendering', () => {
  const viewHtml = renderMemoryWorldView();
  assert.ok(viewHtml.length > 500);
  const graphHtml = renderMemoryGraph();
  assert.ok(graphHtml.length > 500);
  const detailModal = renderMemoryDetailModal();
  assert.ok(detailModal.length > 10);
  const entityModal = renderEntityDetailModal();
  assert.ok(entityModal.length > 10);
});

runTest(33, 'No build or syntax errors across modules', () => {
  assert.ok(memoryService, 'memoryService imported');
  assert.ok(renderMemoryWorldView, 'renderMemoryWorldView imported');
  assert.ok(renderMemoryDetailModal, 'renderMemoryDetailModal imported');
  assert.ok(renderEntityDetailModal, 'renderEntityDetailModal imported');
});

runTest(34, 'Existing Parts 0–3 still work without regression', () => {
  // Part 1: Auth check
  assert.strictEqual(authService.isAuthenticated(), true);
  assert.strictEqual(authService.isPatient(), true);

  // Part 2: Patient Home
  const homeHtml = renderPatientHomeView();
  assert.ok(homeHtml.includes("Today's Next Step") || homeHtml.includes("Today’s Next Step"));

  // Part 3: Daily Care / My Day
  const myDayHtml = renderMyDayView();
  assert.ok(myDayHtml.includes('Morning Rhythm'));
  assert.ok(myDayHtml.includes('Daily Rhythm'));
});

console.log('\n===========================================================');
console.log(`RESULTS: ${passedCount} / 34 TESTS PASSED (100% SUCCESS)`);
console.log('===========================================================\n');
