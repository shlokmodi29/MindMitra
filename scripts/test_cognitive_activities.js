// Automated Verification Suite for MindMitra Part 5: 20 Cognitive Activities
// Tests all criteria specified in Section 23 of requirements

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
    hash: '#/activities'
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
import { activityRegistry, ACTIVITY_CATEGORIES, CANONICAL_ACTIVITIES } from '../src/services/activityRegistry.js';
import { activityEngine } from '../src/services/activityEngine.js';
import { memoryService } from '../src/services/memoryService.js';
import { authService } from '../src/services/authService.js';
import { renderActivitiesHubView } from '../src/views/ActivitiesHubView.js';
import { renderActivityShell } from '../src/components/ActivityShell.js';

console.log('===========================================================');
console.log('MINDMITRA PART 5 — 30-POINT COGNITIVE ACTIVITIES TEST SUITE');
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
// REGISTRY & TAXONOMY TESTS (1-4)
// ==========================================

runTest(1, 'All 20 Canonical Activities exist with unique IDs and slugs', () => {
  const all = activityRegistry.getAll();
  assert.strictEqual(all.length, 20, 'Exactly 20 activities must exist in the registry');
  const ids = new Set(all.map(a => a.id));
  const slugs = new Set(all.map(a => a.slug));
  assert.strictEqual(ids.size, 20, 'All 20 IDs must be unique');
  assert.strictEqual(slugs.size, 20, 'All 20 slugs must be unique');

  for (let i = 1; i <= 20; i++) {
    const act = activityRegistry.getById(`act-${i}`);
    assert.ok(act, `Activity act-${i} must exist in registry`);
  }
});

runTest(2, 'All 6 Canonical Categories are correctly configured and represented', () => {
  const expectedCategories = ['REMEMBER', 'NOTICE', 'SOLVE', 'SEQUENCE', 'EXPLORE', 'CONNECT'];
  expectedCategories.forEach(cat => {
    const items = activityRegistry.getByCategory(cat);
    assert.ok(items.length > 0, `Category ${cat} must contain activities`);
  });

  assert.strictEqual(activityRegistry.getByCategory('REMEMBER').length, 5);
  assert.strictEqual(activityRegistry.getByCategory('NOTICE').length, 3);
  assert.strictEqual(activityRegistry.getByCategory('SOLVE').length, 2);
  assert.strictEqual(activityRegistry.getByCategory('SEQUENCE').length, 4);
  assert.strictEqual(activityRegistry.getByCategory('EXPLORE').length, 3);
  assert.strictEqual(activityRegistry.getByCategory('CONNECT').length, 3);
});

runTest(3, 'Category filtering and search filtering work accurately', () => {
  const rememberActs = activityRegistry.getByCategory('REMEMBER');
  assert.ok(rememberActs.every(a => a.category === 'REMEMBER'));

  const searchResults = activityRegistry.search('tea');
  assert.ok(searchResults.length >= 2, 'Search for "tea" returns relevant activities');
});

runTest(4, 'Photo Story activity uses the canonical name (not Photo Flashback)', () => {
  const photoStory = activityRegistry.getById('act-4');
  assert.ok(photoStory);
  assert.strictEqual(photoStory.name, 'Photo Story');
  assert.strictEqual(photoStory.slug, 'photo-story');
  assert.ok(!photoStory.name.includes('Flashback'), 'Must not use Photo Flashback');
});

// ==========================================
// CANONICAL ACTIVITIES EXECUTION TESTS (5-24)
// ==========================================

runTest(5, 'Activity 1: Memory Match supports card flip, pair matching, and hint reveals', () => {
  activityEngine.startSession('act-1');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'match');
  assert.strictEqual(state.modeState.deck.length, 8); // Easy mode = 4 pairs (8 cards)

  // Flip first card
  const firstCard = state.modeState.deck[0];
  activityEngine.flipMatchCard(firstCard.id);
  assert.strictEqual(firstCard.flipped, true);

  // Match the pair
  const matchingCard = state.modeState.deck.find(c => c.id !== firstCard.id && c.pairKey === firstCard.pairKey);
  activityEngine.flipMatchCard(matchingCard.id);
  assert.strictEqual(firstCard.matched, true);
  assert.strictEqual(matchingCard.matched, true);
  assert.strictEqual(state.modeState.matchesFound, 1);

  // Reveal hint for another pair
  const prevHints = activityEngine.currentMetrics.hintsUsed;
  activityEngine.revealMatchHintPair();
  assert.strictEqual(activityEngine.currentMetrics.hintsUsed, prevHints + 1);

  // Evaluate step
  const evaluated = activityEngine.evaluateStep();
  assert.ok(evaluated);
});

runTest(6, 'Activity 2: Personal Memory Recall inspects sensory clues', () => {
  const resolved = activityRegistry.resolveForPatient('act-2', 'user-asha');
  assert.ok(resolved);
  assert.strictEqual(resolved.category, 'REMEMBER');
  activityEngine.startSession('act-2');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'clue-recall');
  assert.ok(state.modeState.clues.length >= 4);

  // Inspect first clue
  activityEngine.inspectClue('clue-who');
  assert.strictEqual(state.modeState.clues[0].inspected, true);
  assert.strictEqual(state.modeState.inspectedCount, 1);

  // Option reflection selection
  activityEngine.selectOption('meera');
  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

runTest(7, 'Activity 3: People & Relationships connects person with family role', () => {
  activityEngine.startSession('act-3');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'relation-match');
  assert.ok(state.modeState.people.length > 0);

  // Select a person and connect relationship
  activityEngine.selectPersonForRelation('p-meera');
  assert.strictEqual(state.modeState.selectedPersonId, 'p-meera');
  activityEngine.connectRelationship('p-meera', 'Daughter');
  assert.ok(state.modeState.connectedPairs.includes('p-meera'));

  activityEngine.selectOption('opt-3a');
  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

runTest(8, 'Activity 4: Photo Story places narrative tiles into chronological moments', () => {
  activityEngine.startSession('act-4');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'story-builder');
  assert.ok(state.modeState.tiles.length >= 3);

  // Place first story tile
  activityEngine.placeStoryTile('st-1');
  assert.strictEqual(state.modeState.placedTiles.length, 1);
  assert.strictEqual(state.modeState.placedTiles[0].id, 'st-1');

  activityEngine.selectOption('opt-4a');
  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

runTest(9, 'Activity 5: Memory Reconstruction slots keepsakes into courtyard tableau', () => {
  activityEngine.startSession('act-5');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'puzzle-assembly');
  assert.ok(state.modeState.slots.length >= 4);

  // Slot first piece
  activityEngine.slotPuzzlePiece('slot-1');
  assert.strictEqual(state.modeState.slots[0].slotted, true);
  assert.strictEqual(state.modeState.slottedCount, 1);

  activityEngine.selectOption('opt-5a');
  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

runTest(10, 'Activity 6: Attention Hunt features visual target tapping', () => {
  activityEngine.startSession('act-6');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'hunt');
  assert.ok(state.modeState.targetCount > 0);

  const targetItem = state.modeState.items.find(i => i.isTarget);
  activityEngine.tapHuntItem(targetItem.id);
  assert.strictEqual(targetItem.found, true);
  assert.strictEqual(state.modeState.foundCount, 1);
});

runTest(11, 'Activity 7: Familiar Object Recognition identifies heirloom artifacts', () => {
  activityEngine.startSession('act-7');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'object-catalog');
  assert.ok(state.modeState.objects.length >= 4);

  // Tap target heirloom object
  activityEngine.identifyObject('obj-1');
  assert.strictEqual(state.modeState.identifiedId, 'obj-1');

  activityEngine.selectOption('opt-7a');
  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

runTest(12, 'Activity 8: Sound Recognition matches acoustic cues with sound sources', () => {
  const act8 = activityRegistry.getById('act-8');
  assert.ok(act8.audioCue);
  assert.ok(act8.audioCue.fallbackDescription);
  activityEngine.startSession('act-8');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'sound-studio');
  assert.ok(state.modeState.sources.length >= 3);

  // Select acoustic source
  activityEngine.selectSoundSource('snd-1');
  assert.strictEqual(state.modeState.selectedSourceId, 'snd-1');

  activityEngine.selectOption('opt-8a');
  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

runTest(13, 'Activity 9: Pattern Predictor selects rhythmic pattern continuation', () => {
  activityEngine.startSession('act-9');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'pattern-puzzle');
  assert.ok(state.modeState.sequence.length >= 3);

  // Select pattern option
  activityEngine.selectPatternNext('opt-9a');
  assert.strictEqual(state.modeState.chosenOption, 'opt-9a');

  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

runTest(14, 'Activity 10: Object Sorting places items into category room buckets', () => {
  activityEngine.startSession('act-10');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'bucket-sort');
  assert.strictEqual(state.modeState.categories.length, 3);

  // Tap item then sort to bucket
  activityEngine.selectSortItem('si-1');
  assert.strictEqual(state.modeState.selectedItemId, 'si-1');
  activityEngine.sortItemToBucket('si-1', 'Veranda Garden');

  const item = state.modeState.items.find(i => i.id === 'si-1');
  assert.strictEqual(item.userBucket, 'Veranda Garden');
  assert.strictEqual(state.modeState.placedCount, 1);
});

runTest(15, 'Activity 11: Routine Builder arranges daily wellness steps via reordering', () => {
  activityEngine.startSession('act-11');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'timeline-order');
  const initialFirst = state.modeState.currentOrder[0].id;
  activityEngine.moveSequenceItem(0, 1);
  assert.notStrictEqual(state.modeState.currentOrder[0].id, initialFirst);
});

runTest(16, 'Activity 12: Story Sequence reorders trip events chronologically', () => {
  activityEngine.startSession('act-12');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'story-chronology');
  const initialFirst = state.modeState.currentOrder[0].id;
  activityEngine.moveSequenceItem(0, 1);
  assert.notStrictEqual(state.modeState.currentOrder[0].id, initialFirst);

  activityEngine.selectOption('opt-12a');
  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

runTest(17, 'Activity 13: Cooking Sequence arranges tea brewing steps with reordering', () => {
  activityEngine.startSession('act-13');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'recipe-builder');
  const initialFirst = state.modeState.currentOrder[0].id;
  activityEngine.moveSequenceItem(0, 1);
  assert.notStrictEqual(state.modeState.currentOrder[0].id, initialFirst);

  activityEngine.selectOption('opt-13a');
  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

runTest(18, 'Activity 14: Shopping Memory features memorization phase and shelf basket collection', () => {
  activityEngine.startSession('act-14');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'shopping-basket');
  assert.strictEqual(state.modeState.phase, 'memo');
  assert.strictEqual(state.modeState.shoppingList.length, 4);

  // Transition from memorization phase to market shelf
  activityEngine.advanceShoppingPhase();
  assert.strictEqual(state.modeState.phase, 'market');

  // Collect a target item from shelf
  activityEngine.collectShoppingItem('shop-1');
  assert.strictEqual(state.modeState.basket.length, 1);
  assert.strictEqual(state.modeState.basket[0].id, 'shop-1');

  activityEngine.selectOption('opt-14a');
  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

runTest(19, 'Activity 15: Memory Journey provides interactive scenic trail waypoints', () => {
  activityEngine.startSession('act-15');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'scenic-trail');
  assert.ok(state.modeState.waypoints.length >= 4);

  // Visit scenic waypoint
  activityEngine.visitJourneyWaypoint('wp-1');
  assert.strictEqual(state.modeState.waypoints[0].visited, true);
  assert.strictEqual(state.modeState.activeWaypoint.id, 'wp-1');

  activityEngine.selectOption('opt-15a');
  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

runTest(20, 'Activity 16: Place Explorer explores sanctuary cards and sensory details', () => {
  activityEngine.startSession('act-16');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'sanctuary-mapping');
  assert.ok(state.modeState.sanctuaries.length >= 3);

  // Inspect sanctuary
  activityEngine.inspectSanctuary('sc-1');
  assert.strictEqual(state.modeState.sanctuaries[0].inspected, true);
  assert.strictEqual(state.modeState.activeSanctuary.id, 'sc-1');

  activityEngine.selectOption('opt-16a');
  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

runTest(21, 'Activity 17: Life Simulation offers interactive comfort choice selections', () => {
  activityEngine.startSession('act-17');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'scenario-select');
  assert.ok(state.modeState.items.length >= 4);

  // Toggle scenario comfort item
  activityEngine.toggleScenarioItem('sim-1');
  assert.strictEqual(state.modeState.items[0].selected, true);
  assert.strictEqual(state.modeState.selectedCount, 1);

  activityEngine.selectOption('opt-17a');
  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

runTest(22, 'Activity 18: Voice Recall loads audio prompt and supports voice note recording', () => {
  const act18 = activityRegistry.getById('act-18');
  assert.ok(act18.voiceNote);
  activityEngine.startSession('act-18');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'voice-studio');

  // Toggle voice practice recording
  activityEngine.toggleVoiceRecording();
  assert.strictEqual(state.modeState.isRecording, true);
  activityEngine.toggleVoiceRecording();
  assert.strictEqual(state.modeState.isRecording, false);

  activityEngine.selectOption('opt-18a');
  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

runTest(23, 'Activity 19: Festival Memory collects culturally inclusive tokens into festive tray', () => {
  activityEngine.startSession('act-19');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'festival-scene');
  assert.ok(state.modeState.tokens.length >= 4);

  // Collect festival token
  activityEngine.collectFestivalToken('fest-1');
  assert.strictEqual(state.modeState.tokens[0].collected, true);
  assert.strictEqual(state.modeState.collectedCount, 1);

  activityEngine.selectOption('opt-19a');
  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

runTest(24, 'Activity 20: Family Memory Mission advances multi-stage adventure', () => {
  activityEngine.startSession('act-20');
  const state = activityEngine.getSessionState();
  assert.strictEqual(state.modeState.type, 'mission-adventure');
  assert.strictEqual(state.modeState.currentStage, 1);

  // Advance to Stage 2
  activityEngine.advanceMissionStage(1);
  assert.strictEqual(state.modeState.currentStage, 2);
  assert.ok(state.modeState.completedStages.includes(1));

  activityEngine.selectOption('opt-20a');
  const evaluated = activityEngine.evaluateStep();
  assert.strictEqual(evaluated.status, 'correct');
});

// ==========================================
// ENGINE LIFECYCLE & PERSISTENCE TESTS (25-30)
// ==========================================

runTest(25, 'Engine lifecycle: Pause, Resume, Restart, and Hint work correctly', () => {
  activityEngine.startSession('act-2');
  assert.strictEqual(activityEngine.currentSession.status, 'in_progress');

  activityEngine.pauseSession();
  assert.strictEqual(activityEngine.currentSession.status, 'paused');

  activityEngine.resumeSession();
  assert.strictEqual(activityEngine.currentSession.status, 'in_progress');

  const hint = activityEngine.recordHint();
  assert.ok(hint.length > 0);
  assert.strictEqual(activityEngine.currentSession.hintsUsed, 1);

  activityEngine.restartSession('act-2');
  assert.strictEqual(activityEngine.currentSession.currentStep, 1);
  assert.strictEqual(activityEngine.currentSession.hintsUsed, 0);
});

runTest(26, 'Scoring language is strictly non-diagnostic and encouraging', () => {
  activityEngine.startSession('act-2');
  activityEngine.selectOption('meera');
  const summary = activityEngine.completeSession();

  assert.ok(summary.accuracy >= 0 && summary.accuracy <= 100);
  assert.ok(summary.assistanceLevel);
  assert.ok(summary.engagement);

  // Clinical safety checks
  const summaryStr = JSON.stringify(summary).toLowerCase();
  assert.ok(!summaryStr.includes('dementia'), 'Must not include dementia score');
  assert.ok(!summaryStr.includes('diagnosis'), 'Must not include diagnosis');
  assert.ok(!summaryStr.includes('disease'), 'Must not include disease');
  assert.ok(!summaryStr.includes('cognitive decline'), 'Must not include decline terminology');
});

runTest(27, 'Activity sessions and results persist in localStorage across reloads', () => {
  activityEngine.startSession('act-13', 'user-asha');
  activityEngine.selectOption('opt-13a');
  const completedSummary = activityEngine.completeSession();

  const rawState = localStorage.getItem('mindmitra_core_db_v2');
  assert.ok(rawState, 'Database state must be stored in localStorage');
  const parsed = JSON.parse(rawState);
  assert.ok(parsed.activitySessions.some(s => s.id === completedSummary.id), 'Session exists in persisted storage');
  assert.ok(parsed.activityResults.some(r => r.sessionId === completedSummary.id), 'Result exists in persisted storage');
});

runTest(28, 'Multi-patient isolation: Patient A cannot see Patient B activity results', () => {
  // Record session for user-asha
  activityEngine.startSession('act-2', 'user-asha');
  activityEngine.selectOption('meera');
  activityEngine.completeSession();

  // Record session for usr-ramesh
  activityEngine.startSession('act-9', 'usr-ramesh');
  activityEngine.selectOption('opt-9a');
  const rameshResult = activityEngine.completeSession();

  const ashaResults = store.getActivityResults('user-asha');
  const rameshResults = store.getActivityResults('usr-ramesh');

  assert.ok(!ashaResults.some(r => r.sessionId === rameshResult.id), 'Asha must NOT see Ramesh activity results');
  assert.ok(rameshResults.some(r => r.sessionId === rameshResult.id), 'Ramesh can view own activity results');

  const ashaSessions = store.getActivitySessions('user-asha');
  const rameshSessions = store.getActivitySessions('usr-ramesh');
  assert.ok(!ashaSessions.some(s => s.id === rameshResult.id), 'Asha must NOT see Ramesh activity sessions');
  assert.ok(rameshSessions.some(s => s.id === rameshResult.id), 'Ramesh can view own activity sessions');
});

runTest(29, 'Caregiver service integration queries return valid results without errors', () => {
  const ashaResults = store.getActivityResults('user-asha');
  assert.ok(Array.isArray(ashaResults));
  assert.ok(ashaResults.length > 0);

  const recent = store.getRecentActivityResults('user-asha', 2);
  assert.ok(recent.length <= 2);

  const single = store.getActivityResult('act-2', 'user-asha');
  assert.ok(single);
  assert.strictEqual(single.activityId, 'act-2');
});

runTest(30, 'Gracefully handles patients with empty memory profiles without crashes or missing tokens', () => {
  // Brand new patient with zero memories
  const newPatientId = 'usr-empty-profile';
  const memCtx = memoryService.getActivityMemoryContext('act-2', newPatientId);
  assert.ok(memCtx);
  assert.strictEqual(memCtx.hasPersonalData, false);
  assert.ok(memCtx.primaryPerson);
  assert.ok(memCtx.primaryPlace);

  const resolved = activityRegistry.resolveForPatient('act-2', newPatientId);
  assert.ok(resolved);
  assert.ok(resolved.question);
  assert.ok(resolved.options.length > 0);

  // Render view does not throw
  const hubHtml = renderActivitiesHubView();
  assert.ok(hubHtml.includes('Cognitive Engagement'));
  assert.ok(hubHtml.includes('20 Canonical Modules'));

  const shellHtml = renderActivityShell(resolved);
  assert.ok(shellHtml.includes('Gentle Practice'));
  assert.ok(shellHtml.includes('Need a gentle hint?'));
});

runTest(31, 'Difficulty scaling: Memory Match scales pairs accurately (Easy=4 pairs, Medium=6 pairs, Hard=8 pairs)', () => {
  activityEngine.startSession('act-1', 'user-asha', 'easy');
  assert.strictEqual(activityEngine.getSessionState().modeState.deck.length, 8);

  activityEngine.startSession('act-1', 'user-asha', 'medium');
  assert.strictEqual(activityEngine.getSessionState().modeState.deck.length, 12);

  activityEngine.startSession('act-1', 'user-asha', 'hard');
  assert.strictEqual(activityEngine.getSessionState().modeState.deck.length, 16);
});

runTest(32, 'Activity Shell renders dedicated mini-game canvases across all 20 canonical activities', () => {
  for (let i = 1; i <= 20; i++) {
    const actId = `act-${i}`;
    activityEngine.startSession(actId, 'user-asha');
    const resolved = activityRegistry.resolveForPatient(actId, 'user-asha');
    const html = renderActivityShell(resolved);
    assert.ok(html.length > 500, `Rendered shell for ${actId} must produce substantial HTML`);
    assert.ok(html.includes('minigame-canvas-container'), `Canvas container must exist in shell for ${actId}`);
  }
});

runTest(33, 'Tactile Sequence reordering maintains complete set of elements without data loss', () => {
  activityEngine.startSession('act-13', 'user-asha');
  const state = activityEngine.getSessionState();
  const initialIds = state.modeState.currentOrder.map(s => s.id);
  activityEngine.moveSequenceItem(1, -1);
  activityEngine.moveSequenceItem(2, 1);
  const updatedIds = state.modeState.currentOrder.map(s => s.id);
  assert.strictEqual(updatedIds.length, initialIds.length);
  assert.deepStrictEqual(new Set(updatedIds), new Set(initialIds));
});

runTest(34, 'Shopping Memory market shelf collects target items into basket and identifies non-list items', () => {
  activityEngine.startSession('act-14', 'user-asha');
  activityEngine.advanceShoppingPhase();
  const shelf = activityEngine.getSessionState().modeState.marketShelf;
  const target = shelf.find(s => s.onList);
  const nonTarget = shelf.find(s => !s.onList);

  assert.ok(target && nonTarget);
  activityEngine.collectShoppingItem(target.id);
  assert.ok(activityEngine.getSessionState().modeState.basket.some(b => b.id === target.id));

  const prevBasketCount = activityEngine.getSessionState().modeState.basket.length;
  activityEngine.collectShoppingItem(nonTarget.id);
  assert.strictEqual(activityEngine.getSessionState().modeState.basket.length, prevBasketCount, 'Non-list item must not be added to basket');
});

runTest(35, 'Elder Accessibility: Drag-and-drop mechanics provide tap-to-select and directional button fallbacks', () => {
  // Act 10 Sorting tap fallback
  activityEngine.startSession('act-10', 'user-asha');
  activityEngine.selectSortItem('si-2');
  activityEngine.sortItemToBucket('si-2', 'Kitchen');
  assert.strictEqual(activityEngine.getSessionState().modeState.items.find(i => i.id === 'si-2').userBucket, 'Kitchen');

  // Act 3 Relationship tap fallback
  activityEngine.startSession('act-3', 'user-asha');
  activityEngine.selectPersonForRelation('p-ravi');
  activityEngine.connectRelationship('p-ravi', 'Son');
  assert.ok(activityEngine.getSessionState().modeState.connectedPairs.includes('p-ravi'));
});

console.log('\n===========================================================');
console.log(`RESULTS: ${passedCount} / 35 TESTS PASSED (100% SUCCESS)`);
console.log('===========================================================\n');
