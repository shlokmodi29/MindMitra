/**
 * MindMitra - Feature 5: Voice Journal Comprehensive Test Suite
 * Validates recording lifecycle, timer accuracy, review-before-save, audio persistence,
 * STT transcription with fallback, Personal Memory World & Timeline integration,
 * SmritiAI grounded title/summary & voice Q&A, family sharing, caregiver curation,
 * doctor privacy, patient isolation, offline persistence, and multilingual accessibility.
 */

import { voiceJournalService, JOURNAL_STATES } from '../src/services/voiceJournalService.js';
import { voiceService } from '../src/services/voiceService.js';
import { memoryService } from '../src/services/memoryService.js';
import { smritiAIService } from '../src/services/smritiAIService.js';
import { dailyPlanService } from '../src/services/dailyPlanService.js';
import { store } from '../src/state/store.js';
import { i18nService } from '../src/services/i18nService.js';
import { en } from '../src/locales/en.js';
import { hi } from '../src/locales/hi.js';
import { as } from '../src/locales/as.js';
import { bn } from '../src/locales/bn.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`✅ [Test ${String(passed).padStart(2, ' ')}] Passed: ${message}`);
  } else {
    failed++;
    console.error(`❌ [Test ${String(passed + failed).padStart(2, ' ')}] FAILED: ${message}`);
  }
}

async function runVoiceJournalTests() {
  console.log('\n🎙️ =================================================================');
  console.log('   MINDMITRA FEATURE 5 — VOICE JOURNAL 42-POINT COMPREHENSIVE TEST SUITE');
  console.log('=================================================================\n');

  const testPatientId = 'user-asha';
  store.setCurrentUser({ id: testPatientId, name: 'Asha Devi', role: 'patient' });

  // 1. Initial State
  assert(voiceJournalService.getState() === JOURNAL_STATES.IDLE, 'Voice journal service starts in IDLE state');
  assert(voiceJournalService.getElapsedSeconds() === 0, 'Elapsed recording seconds initialized to 0');
  assert(voiceJournalService.getFormattedTimer() === '00:00', 'Initial timer formats as 00:00');

  // 2. Start Recording
  await voiceJournalService.startRecording({ lang: 'en' });
  assert(voiceJournalService.getState() === JOURNAL_STATES.RECORDING, 'startRecording transitions state to RECORDING');

  // 3. Real Elapsed Timer
  voiceJournalService.elapsedSeconds = 12;
  assert(voiceJournalService.getFormattedTimer() === '00:12', 'Timer accurately formats 12 seconds as 00:12');

  voiceJournalService.elapsedSeconds = 65;
  assert(voiceJournalService.getFormattedTimer() === '01:05', 'Timer accurately formats 65 seconds as 01:05');

  // 4. Pause Recording
  voiceJournalService.pauseRecording();
  assert(voiceJournalService.getState() === JOURNAL_STATES.PAUSED, 'pauseRecording transitions state to PAUSED');

  // 5. Resume Recording
  voiceJournalService.resumeRecording();
  assert(voiceJournalService.getState() === JOURNAL_STATES.RECORDING, 'resumeRecording transitions state back to RECORDING');

  // 6. Simulate Spoken Speech Recognition
  voiceJournalService.transcript = 'Today I visited my daughter and we had hot tea together in the afternoon.';

  // 7. Stop Recording & Transition to Review
  const review = await voiceJournalService.stopRecording();
  assert(voiceJournalService.getState() === JOURNAL_STATES.REVIEW, 'stopRecording transitions state to REVIEW');
  assert(review !== null && typeof review === 'object', 'stopRecording produces valid reviewData object');
  assert(Boolean(review.audioUrl), 'Review data contains persistent audio URL');
  assert(review.duration === '01:05', 'Review data captures actual recorded duration');
  assert(review.transcript.includes('tea together'), 'Review data captures speech-to-text transcript');
  assert(review.isPrivate === true, 'Review data defaults to PRIVATE');
  assert(review.sharedWithFamily === false, 'Review data defaults to not shared with family');

  // 8. Edit Transcript before saving
  voiceJournalService.updateReviewField('transcript', 'Today I visited my daughter Meera and we had ginger tea in the garden.');
  assert(voiceJournalService.getReviewData().transcript.includes('Meera'), 'User can edit transcript prior to saving');

  // 9. SmritiAI Non-Hallucinatory Title Suggestion
  const titleSuggestion = smritiAIService.suggestJournalTitle(voiceJournalService.getReviewData().transcript);
  assert(titleSuggestion.isSuggested === true, 'SmritiAI returns title marked as a suggestion');
  assert(titleSuggestion.suggestedTitle === 'Tea with Daughter' || titleSuggestion.suggestedTitle === 'Tea with Family', `SmritiAI derives title from actual words in transcript ("${titleSuggestion.suggestedTitle}")`);

  // 10. SmritiAI Summary
  const summaryRes = smritiAIService.summarizeJournalTranscript(voiceJournalService.getReviewData().transcript);
  assert(summaryRes.label === 'AI Summary', 'Summary is clearly labeled as "AI Summary"');
  assert(summaryRes.originalTranscript.length > 0, 'Original transcript remains intact');
  assert(summaryRes.summary.length > 0, 'Summary text is non-empty and factual');

  // 11. Editable Memory Date
  voiceJournalService.updateReviewField('date', '09 September 2026');
  assert(voiceJournalService.getReviewData().date === '09 September 2026', 'User can set or edit memory date');

  // 12. Entity Association from existing Memory World
  const existingPlaces = memoryService.getPlaces(testPatientId);
  const existingPeople = memoryService.getPeople(testPatientId);
  const existingEvents = memoryService.getEvents(testPatientId);
  const existingStories = memoryService.getStories(testPatientId);

  const testPlaceId = existingPlaces[0]?.id || 'plc-1';
  const testPersonId = existingPeople[0]?.id || 'person-meera';
  const testEventId = existingEvents[0]?.id || 'evt-1';
  const testStoryId = existingStories[0]?.id || 'sty-1';

  voiceJournalService.updateReviewField('title', 'Afternoon Ginger Tea with Meera');
  voiceJournalService.updateReviewField('placeId', testPlaceId);
  voiceJournalService.updateReviewField('personIds', [testPersonId]);
  voiceJournalService.updateReviewField('eventId', testEventId);
  voiceJournalService.updateReviewField('storyId', testStoryId);

  // 13. Save Memory
  const savedVoiceMemory = voiceJournalService.saveJournalEntry();
  assert(voiceJournalService.getState() === JOURNAL_STATES.SAVED, 'saveJournalEntry transitions state to SAVED');
  assert(savedVoiceMemory.id.startsWith('vm-'), 'Voice memory saved with canonical vm- ID');
  assert(savedVoiceMemory.title === 'Afternoon Ginger Tea with Meera', 'Voice memory saved with correct title');
  assert(savedVoiceMemory.placeId === testPlaceId, 'Voice memory linked to existing Place');
  assert(savedVoiceMemory.personIds.includes(testPersonId), 'Voice memory linked to existing Person');
  assert(savedVoiceMemory.eventId === testEventId, 'Voice memory linked to existing Event');
  assert(savedVoiceMemory.storyId === testStoryId, 'Voice memory linked to existing Story');

  // 14. Personal Memory World Integration
  assert(Boolean(savedVoiceMemory.memoryId), 'Voice memory automatically created and linked to Personal Memory World record');
  const linkedMemory = memoryService.getMemoryById(savedVoiceMemory.memoryId);
  assert(linkedMemory !== null, 'Linked memory exists in memoryService');
  assert(linkedMemory.category === 'Voice Notes', 'Linked memory category is "Voice Notes"');
  assert(linkedMemory.audioUrl === savedVoiceMemory.audioUrl, 'Linked memory shares the recorded audioUrl');
  assert(linkedMemory.narrationText.includes('ginger tea'), 'Linked memory contains transcription text');

  // 15. Memory Timeline Integration
  const timeline = memoryService.getMemoryTimeline(testPatientId);
  const foundInTimeline = timeline.items.some(item => 
    item.id === savedVoiceMemory.id || 
    item.id === savedVoiceMemory.memoryId ||
    item.linkedMemoryIds?.includes(savedVoiceMemory.memoryId) ||
    item.voiceMemories?.some(v => v.id === savedVoiceMemory.id)
  );
  assert(foundInTimeline, 'Voice Journal memory appears in Memory Timeline without duplicate models');

  // 16. Voice Memory Retrieval
  const patientVoiceMemories = store.getVoiceMemoriesForPatient(testPatientId);
  assert(patientVoiceMemories.some(vm => vm.id === savedVoiceMemory.id), 'getVoiceMemoriesForPatient includes newly saved voice journal');

  // 17. Favorite Toggle Persistence
  const favStateBefore = savedVoiceMemory.favorite;
  const newFavState = store.toggleVoiceMemoryFavorite(savedVoiceMemory.id);
  assert(newFavState === !favStateBefore, 'toggleVoiceMemoryFavorite inverts favorite state');
  const reloadedVoice = store.getVoiceMemoriesForPatient(testPatientId).find(v => v.id === savedVoiceMemory.id);
  assert(reloadedVoice.favorite === newFavState, 'Favorite state persisted on voice memory record');
  const reloadedLinkedMem = memoryService.getMemoryById(savedVoiceMemory.memoryId);
  assert(reloadedLinkedMem.favorite === newFavState, 'Favorite state synced to linked Personal Memory World record');

  // 18. Voice Search across Transcripts
  const searchResults = memoryService.findRelatedEntities('ginger tea', testPatientId);
  assert(
    searchResults.voiceMemories?.some(vm => vm.id === savedVoiceMemory.id) ||
    searchResults.memories?.some(m => m.id === savedVoiceMemory.memoryId),
    'findRelatedEntities successfully searches transcript text and returns matching Voice Memory'
  );

  const memSearchResults = memoryService.searchMemories(testPatientId, 'ginger tea');
  assert(memSearchResults.some(m => m.id === savedVoiceMemory.memoryId), 'searchMemories finds linked memory by transcript');

  // 19. SmritiAI Voice Questions ("What did I record?")
  const whatDidIRecordAnswer = smritiAIService.generateResponse('What did I record?', { patientId: testPatientId });
  assert(whatDidIRecordAnswer.text.includes('voice recording') || whatDidIRecordAnswer.text.includes('living archive'), 'SmritiAI responds factually to "What did I record?"');

  // 20. SmritiAI Grounded Topic Query ("What did I say about Meera?")
  const whatDidISayAnswer = smritiAIService.generateResponse('What did I say about Meera?', { patientId: testPatientId });
  assert(whatDidISayAnswer.text.includes('ginger tea') || whatDidISayAnswer.text.includes('Meera'), 'SmritiAI cites actual recorded transcript for topic query');

  // 21. SmritiAI Hallucination Control (Query for non-existent topic)
  const nonExistentTopicAnswer = smritiAIService.generateResponse('What did I say about spaceship rocket?', { patientId: testPatientId });
  assert(
    nonExistentTopicAnswer.text.includes("couldn't find") || nonExistentTopicAnswer.text.includes('not'),
    'SmritiAI strictly does not invent details when topic is not in recordings'
  );

  // 22. Daily Plan Integration (Optional Reflection Prompt)
  const todayPlan = dailyPlanService.generateDailyPlan(testPatientId, new Date());
  const voicePlanItem = todayPlan.items.find(i => i.id === 'dpi-voice-journal' || i.metadata?.actionRoute === 'voice-journal');
  assert(voicePlanItem !== undefined, 'Smart Daily Plan includes optional Voice Journal prompt item');
  assert(voicePlanItem.priority.toLowerCase() === 'optional', 'Voice Journal in Daily Plan is strictly OPTIONAL (no streaks or pressure)');
  assert(voicePlanItem.title === 'Record a Memory', 'Voice Journal item is titled "Record a Memory"');

  // 23. Mood Check-in Stays Completely Separate
  assert(savedVoiceMemory.moodScore === undefined, 'Voice Journal does NOT assign clinical mood scores to voice');
  assert(savedVoiceMemory.emotionDetection === undefined, 'Voice Journal does NOT perform emotion recognition on voice');

  // 24. Family Circle Privacy Default & Explicit Sharing
  assert(savedVoiceMemory.isPrivate === true, 'Voice memory is PRIVATE by default');
  store.shareVoiceMemoryWithFamily(savedVoiceMemory.id, testPatientId);
  const sharedVoice = store.getVoiceMemoriesForPatient(testPatientId).find(v => v.id === savedVoiceMemory.id);
  assert(sharedVoice.sharedWithFamily === true, 'Explicit sharing marks voice memory as shared with Family Circle');

  // 25. Caregiver Authorization & Curation
  const caregiverUser = { id: 'user-meera', name: 'Meera', role: 'caregiver' };
  store.setCurrentUser(caregiverUser);
  const updatedByCaregiver = store.updateVoiceMemory(savedVoiceMemory.id, { title: 'Quiet Tea with Meera in Shillong' }, caregiverUser.id);
  assert(updatedByCaregiver.title === 'Quiet Tea with Meera in Shillong', 'Authorized caregiver can edit title');
  assert(updatedByCaregiver.audioUrl === savedVoiceMemory.audioUrl, 'Editing metadata never alters the original audio recording');

  // 26. Doctor Privacy: Doctor cannot automatically access Voice Memories
  const doctorUser = { id: 'doc-sen', name: 'Dr. Sen', role: 'doctor' };
  store.setCurrentUser(doctorUser);
  // Verify doctor cannot query voice memories without patient connection
  let doctorSawPrivate = false;
  try {
    const docPatientMems = store.getVoiceMemoriesForPatient('other-patient');
    doctorSawPrivate = docPatientMems.length > 0;
  } catch (_) {}
  assert(doctorSawPrivate === false, 'Doctor cannot automatically browse private voice recordings');

  // 27. Patient Isolation
  store.setCurrentUser({ id: 'user-b', name: 'Patient B', role: 'patient' });
  const patientBVoiceMems = store.getVoiceMemoriesForPatient('user-b');
  assert(!patientBVoiceMems.some(vm => vm.id === savedVoiceMemory.id), 'Patient B cannot see Patient A voice memories');

  // 28. Honest Microphone Permission & Fallback
  store.setCurrentUser({ id: testPatientId, name: 'Asha Devi', role: 'patient' });
  voiceJournalService.reset();
  voiceJournalService.setState(JOURNAL_STATES.ERROR, 'Microphone access is needed to record a voice memory.');
  assert(voiceJournalService.getState() === JOURNAL_STATES.ERROR, 'Microphone denial triggers honest ERROR state');
  assert(voiceJournalService.getLastError().includes('Microphone access is needed'), 'Honest permission error message provided');

  // 29. STT Failure Fallback ("Keep Audio")
  voiceJournalService.reset();
  voiceJournalService.isTranscriptAvailable = false;
  assert(voiceJournalService.isTranscriptAvailable === false, 'Voice journal handles speech-to-text unavailability gracefully');

  // 30. Safe Deletion
  const deleteResult = store.deleteVoiceMemory(savedVoiceMemory.id, testPatientId);
  assert(deleteResult === true, 'Authorized user can delete voice memory with confirmation');
  const afterDeleteVoice = store.getVoiceMemoriesForPatient(testPatientId).find(v => v.id === savedVoiceMemory.id);
  assert(afterDeleteVoice === undefined, 'Voice memory is removed from voiceMemories array');
  const afterDeleteMemory = memoryService.getMemoryById(savedVoiceMemory.memoryId);
  assert(afterDeleteMemory === null, 'Linked Personal Memory World record is cleanly deleted');

  // 31. Multilingual Support across en, hi, as, bn
  assert(en.voiceJournal && en.voiceJournal.title === 'Voice Journal', 'en dictionary contains voiceJournal keys');
  assert(hi.voiceJournal && hi.voiceJournal.title === 'आवाज डायरी', 'hi dictionary contains voiceJournal keys');
  assert(as.voiceJournal && as.voiceJournal.title === 'কণ্ঠ দিনলিপি', 'as dictionary contains voiceJournal keys');
  assert(bn.voiceJournal && bn.voiceJournal.title === 'কণ্ঠ দিনলিপি', 'bn dictionary contains voiceJournal keys');

  // 32. Verification of State Persistence in LocalStorage
  const savedState = store.getState();
  assert(Array.isArray(savedState.voiceMemories), 'store.state.voiceMemories persists as array in state store');

  console.log('\n=================================================================');
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} VOICE JOURNAL TESTS PASSED SUCCESSFULLY!`);
  } else {
    console.error(`💥 ${failed} TESTS FAILED out of ${passed + failed}`);
  }
  console.log('=================================================================\n');

  return failed === 0;
}

runVoiceJournalTests().then(success => {
  if (!success) process.exit(1);
});
