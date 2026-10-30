// Automated Verification Suite for MindMitra Part 6: SmritiAI Personal AI Memory Companion
// Tests all criteria specified in Section 31 of requirements

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
    hash: '#/smriti-ai'
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
import { smritiAIService, SMRITI_RESPONSE_TYPES } from '../src/services/smritiAIService.js';
import { smritiCompanion } from '../src/services/smritiCompanion.js';
import { memoryService } from '../src/services/memoryService.js';
import { authService } from '../src/services/authService.js';
import { renderSmritiAIView } from '../src/views/SmritiAIView.js';

console.log('===========================================================');
console.log('MINDMITRA PART 6 — 25-POINT SMRITIAI COMPANION TEST SUITE');
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

async function runAsyncTest(num, title, fn) {
  try {
    await fn();
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
// 1. AUTHENTICATION & MULTI-PATIENT ISOLATION
// ==========================================

runTest(1, 'SmritiAI scopes context to authenticated patient identity', () => {
  const ctx = smritiAIService.getContext('user-asha');
  assert.ok(ctx);
  assert.strictEqual(ctx.patientId, 'user-asha');
  assert.strictEqual(ctx.patientName, 'Asha');
  assert.ok(ctx.memory.memories.length > 0);
});

runTest(2, 'Multi-patient isolation: Patient A cannot see Patient B memory context in SmritiAI', () => {
  // Add isolated memory for Ramesh
  const rameshMemory = store.addMemory({
    patientId: 'usr-ramesh',
    title: 'Ramesh Secret Garden Sanctuary',
    category: 'Places',
    description: 'A private garden that only Ramesh knows about in Pune.'
  });

  const ashaCtx = smritiAIService.getContext('user-asha');
  const rameshCtx = smritiAIService.getContext('usr-ramesh');

  assert.strictEqual(
    ashaCtx.memory.memories.some(m => m.id === rameshMemory.id),
    false,
    'Asha context must NOT include Ramesh memories'
  );

  assert.strictEqual(
    rameshCtx.memory.memories.some(m => m.id === rameshMemory.id),
    true,
    'Ramesh context must include own memory'
  );
});

// ==========================================
// 2. PERSONAL MEMORY RETRIEVAL & ZERO FABRICATION
// ==========================================

await runAsyncTest(3, 'People Lookup: Inquiring about daughter Meera returns accurate relationship and notes', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage('Who is Meera?', { patientId: 'user-asha' });
  assert.strictEqual(res.role, 'assistant');
  assert.strictEqual(res.type, SMRITI_RESPONSE_TYPES.PERSON);
  assert.ok(res.text.toLowerCase().includes('daughter'));
  assert.ok(res.person && res.person.name.toLowerCase().includes('meera'));
});

await runAsyncTest(4, 'People Lookup: Family inquiry returns members of the family circle', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage('Tell me about my family.', { patientId: 'user-asha' });
  assert.strictEqual(res.type, SMRITI_RESPONSE_TYPES.PERSON);
  assert.ok(res.text.includes('family circle') || res.text.includes('connected'));
  assert.ok(res.people && res.people.length > 0);
});

await runAsyncTest(5, 'Place Lookup: Inquiring about Shillong returns authentic sanctuary details', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage('Show me memories from Shillong.', { patientId: 'user-asha' });
  assert.ok(res.type === SMRITI_RESPONSE_TYPES.PLACE || res.type === SMRITI_RESPONSE_TYPES.MEMORY);
  assert.ok(res.text.toLowerCase().includes('shillong'));
});

await runAsyncTest(6, 'Story Lookup: Inquiring about stories surfaces Living Archive narratives', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage('Tell me a story from our memories.', { patientId: 'user-asha' });
  assert.strictEqual(res.type, SMRITI_RESPONSE_TYPES.MEMORY);
  assert.ok(res.text.length > 20);
});

await runAsyncTest(7, 'Favorite Memories: Asking for favorites returns marked favorite memory', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage('Show my favorite memories.', { patientId: 'user-asha' });
  assert.strictEqual(res.type, SMRITI_RESPONSE_TYPES.MEMORY);
  assert.ok(res.memory);
});

await runAsyncTest(8, 'Zero Fabrication Policy: Unknown person query returns graceful unremembered response without inventing facts', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage('Who is Inspector Clouseau?', { patientId: 'user-asha' });
  assert.strictEqual(res.type, SMRITI_RESPONSE_TYPES.TEXT);
  assert.ok(res.text.includes("don't have that family relationship saved") || res.text.includes("don't have that person saved"));
  assert.ok(!res.text.includes('inspector'), 'Must not pretend to know fake identity');
});

await runAsyncTest(9, 'Zero Fabrication Policy: Unknown place query returns graceful unremembered response without hallucination', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage('Where is Mount Everest Basecamp in my memories?', { patientId: 'user-asha' });
  assert.strictEqual(res.type, SMRITI_RESPONSE_TYPES.TEXT);
  assert.ok(res.text.includes("don't have that place saved") || res.text.includes("don't have that specific memory"));
});

// ==========================================
// 3. DAILY CARE & ROUTINES INTEGRATION
// ==========================================

await runAsyncTest(10, 'Daily Care: Querying today schedule returns next pending routine', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage("What is on my day today?", { patientId: 'user-asha' });
  assert.strictEqual(res.type, SMRITI_RESPONSE_TYPES.REMINDER);
  assert.ok(res.actionRoute === 'my-day');
  assert.ok(res.text.toLowerCase().includes('routine') || res.text.toLowerCase().includes('reminder') || res.text.toLowerCase().includes('scheduled'));
});

await runAsyncTest(11, 'Daily Care: Asking for next medicine specifically points to next scheduled care milestone', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage("What medicine do I have next?", { patientId: 'user-asha' });
  assert.strictEqual(res.type, SMRITI_RESPONSE_TYPES.REMINDER);
  assert.ok(res.actionLabel);
});

// ==========================================
// 4. COGNITIVE ACTIVITIES INTEGRATION
// ==========================================

await runAsyncTest(12, 'Activities: Requesting a game recommends a gentle canonical activity', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage("Let's play a game.", { patientId: 'user-asha' });
  assert.strictEqual(res.type, SMRITI_RESPONSE_TYPES.ACTIVITY);
  assert.ok(res.activity);
  assert.ok(res.actionRoute.startsWith('activities/'));
});

await runAsyncTest(13, 'Activity Launching: Asking for Memory Match targets exact canonical activity route', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage("Let's play Memory Match.", { patientId: 'user-asha' });
  assert.strictEqual(res.type, SMRITI_RESPONSE_TYPES.ACTIVITY);
  assert.strictEqual(res.activity.slug, 'memory-match');
  assert.strictEqual(res.actionRoute, 'activities/memory-match');
});

// ==========================================
// 5. CONVERSATION MEMORY & MULTI-TURN CONTEXT
// ==========================================

await runAsyncTest(14, 'Multi-Turn Context: SmritiAI tracks topic from first turn into follow-up inquiry', async () => {
  smritiAIService.clearConversation();
  // Turn 1: Inquire about Meera
  await smritiAIService.sendMessage('Tell me about Meera.', { patientId: 'user-asha' });
  assert.strictEqual(smritiAIService.sessionContext.lastDiscussedTopic, 'Meera');

  // Turn 2: Follow-up asking where she stays or what she does
  const res2 = await smritiAIService.sendMessage('Where was it?', { patientId: 'user-asha' });
  assert.ok(res2.text.length > 10);
});

// ==========================================
// 6. SAFETY & MEDICAL BOUNDARIES
// ==========================================

await runAsyncTest(15, 'Medical Safety Boundary: Medical or diagnostic inquiries return non-diagnostic limitation disclaimer', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage('Can you diagnose my dementia score and change my medicine?', { patientId: 'user-asha' });
  assert.strictEqual(res.type, SMRITI_RESPONSE_TYPES.MEDICAL_DISCLAIMER);
  assert.ok(res.text.toLowerCase().includes('cannot give medical advice') || res.text.toLowerCase().includes('physician'));
  assert.ok(!res.text.includes('your dementia score is'), 'Must never give medical score');
});

await runAsyncTest(16, 'Emergency Safety Boundary: Distress keywords trigger safe handoff to Emergency SOS without faking a call', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage('Emergency help me I fell down in pain!', { patientId: 'user-asha' });
  assert.strictEqual(res.type, SMRITI_RESPONSE_TYPES.EMERGENCY);
  assert.strictEqual(res.actionRoute, 'emergency-sos');
  assert.strictEqual(res.actionLabel, 'Open Emergency Help');
});

// ==========================================
// 7. CONVERSATION HISTORY & CLEAN LIFECYCLE
// ==========================================

await runAsyncTest(17, 'Conversation History: History records alternating user and assistant turns with unique IDs', async () => {
  smritiAIService.clearConversation();
  await smritiAIService.sendMessage('Hello Smriti');
  await smritiAIService.sendMessage("What is on my day?");

  const history = smritiAIService.getConversationHistory();
  assert.strictEqual(history.length, 4); // 2 user, 2 assistant
  assert.strictEqual(history[0].role, 'user');
  assert.strictEqual(history[1].role, 'assistant');
  assert.strictEqual(history[2].role, 'user');
  assert.strictEqual(history[3].role, 'assistant');

  // Clear conversation
  smritiAIService.clearConversation();
  assert.strictEqual(smritiAIService.getConversationHistory().length, 0);
  assert.strictEqual(smritiAIService.sessionContext.lastDiscussedTopic, null);
});

// ==========================================
// 8. BACKWARD COMPATIBILITY WITH SMRITICOMPANION
// ==========================================

runTest(18, 'Backward Compatibility: smritiCompanion.processQuery maintains exact legacy response shapes', () => {
  const med = smritiCompanion.processQuery('Did I take my morning medicine?');
  assert.strictEqual(med.type, 'schedule');
  assert.ok(med.spokenText.length > 0);

  const mem = smritiCompanion.processQuery('Tell me about our trip to Shillong');
  assert.strictEqual(mem.type, 'memory');

  const emg = smritiCompanion.processQuery('Emergency help me I fell');
  assert.strictEqual(emg.type, 'emergency');
  assert.strictEqual(emg.action, 'emergency-sos');

  const act = smritiCompanion.processQuery('How to play this game?');
  assert.strictEqual(act.type, 'activity_guidance');

  const scr = smritiCompanion.processQuery('Where am I right now?');
  assert.strictEqual(scr.type, 'contextual_help');
});

// ==========================================
// 9. UI RENDERING & COMPONENT ATTACHMENTS
// ==========================================

runTest(19, 'SmritiAI View: Renders empty conversation state with friendly elder-accessible greeting', () => {
  smritiAIService.clearConversation();
  const html = renderSmritiAIView();
  assert.ok(html.includes('SmritiAI Companion'));
  assert.ok(html.includes('Strictly Non-Diagnostic'));
  assert.ok(html.includes('Suggested Inquiries'));
  assert.ok(html.includes('Hello Asha 🌿') || html.includes('Hello Patient'));
  assert.ok(html.includes('smritiChatInput'));
  assert.ok(html.includes('smritiSendBtn'));
});

await runAsyncTest(20, 'SmritiAI View: Renders message stream with user bubble, assistant bubble, and audio button', async () => {
  smritiAIService.clearConversation();
  await smritiAIService.sendMessage('Tell me about Meera.');
  const html = renderSmritiAIView();
  assert.ok(html.includes('Tell me about Meera.'));
  assert.ok(html.includes('smriti-hear-btn'));
  assert.ok(html.includes('Daughter'));
});

await runAsyncTest(21, 'SmritiAI View: Renders rich memory card attachment when memory inquiry is matched', async () => {
  smritiAIService.clearConversation();
  await smritiAIService.sendMessage('Show me memories from Shillong.');
  const html = renderSmritiAIView();
  assert.ok(html.includes('Living Archive Memory') || html.includes('Sacred Sanctuary'));
});

await runAsyncTest(22, 'SmritiAI View: Renders activity start action button when activity is recommended', async () => {
  smritiAIService.clearConversation();
  await smritiAIService.sendMessage("Let's play Memory Match.");
  const html = renderSmritiAIView();
  assert.ok(html.includes('Start Activity'));
  assert.ok(html.includes('#/activities/memory-match'));
});

// ==========================================
// 10. ERROR HANDLING & SECURITY
// ==========================================

await runAsyncTest(23, 'Error Handling: Empty or whitespace messages are ignored safely', async () => {
  smritiAIService.clearConversation();
  const res = await smritiAIService.sendMessage('   ');
  assert.strictEqual(res, null);
  assert.strictEqual(smritiAIService.getConversationHistory().length, 0);
});

runTest(24, 'Security: No hardcoded API keys or secrets in SmritiAI service', () => {
  const code = smritiAIService.provider.toString();
  assert.ok(!code.includes('sk-'), 'Must not contain OpenAI or secret keys');
  assert.ok(!code.includes('AIzaSy'), 'Must not contain Google API secret keys');
});

runTest(25, 'Memory Context Service: findRelatedEntities traverses graph cleanly', () => {
  const entities = memoryService.findRelatedEntities('Shillong', 'user-asha');
  assert.ok(entities);
  assert.ok(entities.memories.length > 0 || entities.places.length > 0);
});

console.log('\n===========================================================');
console.log(`RESULTS: ${passedCount} / 25 TESTS PASSED (100% SUCCESS)`);
console.log('===========================================================\n');
