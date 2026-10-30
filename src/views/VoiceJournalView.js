/**
 * MindMitra - Voice Journal View
 * Elderly-friendly, calm recording experience connecting Voice Memories,
 * Personal Memory World, Memory Timeline, and SmritiAI.
 * Warm terracotta, deep plum, and soft amber aesthetic with accessible controls.
 */

import { voiceJournalService, JOURNAL_STATES } from '../services/voiceJournalService.js';
import { memoryService } from '../services/memoryService.js';
import { smritiAIService } from '../services/smritiAIService.js';
import { i18nService } from '../services/i18nService.js';
import { store } from '../state/store.js';
import { showToast } from '../components/Toast.js';

let isEditingTranscript = false;
let audioPlayer = null;
let isAudioPlaying = false;
let smritiSummaryText = null;

export function renderVoiceJournalView() {
  const state = store.getState();
  const pid = store.getCurrentPatientId();
  const lang = i18nService.getLanguage() || 'en';
  const journalState = voiceJournalService.getState();
  const reviewData = voiceJournalService.getReviewData();
  const formattedTimer = voiceJournalService.getFormattedTimer();
  const lastError = voiceJournalService.getLastError();

  const places = memoryService.getPlaces(pid);
  const people = memoryService.getPeople(pid);
  const events = memoryService.getEvents(pid);
  const stories = memoryService.getStories(pid);

  return `
  <div class="voice-journal-container max-w-4xl mx-auto px-space-md py-space-xl sm:py-space-2xl text-on-surface" id="voiceJournalRoot">
    <!-- Top Navigation Ribbon -->
    <div class="flex items-center justify-between mb-space-lg">
      <a href="#/memory-world" class="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high font-label-md text-label-md text-on-surface transition-colors cursor-pointer" id="vjBackBtn">
        <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        <span>${i18nService.t('common.back')}</span>
      </a>
      <div class="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">
        <span class="material-symbols-outlined text-[16px]">lock</span>
        <span>Private by default</span>
      </div>
    </div>

    <!-- Calm Elderly-Friendly Header -->
    <header class="text-center mb-space-xl">
      <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-space-sm shadow-sm">
        <span class="material-symbols-outlined text-[36px]">mic</span>
      </div>
      <h1 class="font-display-sm text-display-sm sm:font-display-md sm:text-display-md font-bold text-on-surface">
        ${i18nService.t('voiceJournal.title')}
      </h1>
      <p class="font-headline-sm text-headline-sm text-primary font-medium mt-1">
        "${i18nService.t('voiceJournal.subtitle')}"
      </p>
      <p class="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto mt-2">
        ${i18nService.t('voiceJournal.prompt')}
      </p>
    </header>

    <!-- MAIN RECORDING WORKFLOW CARD -->
    <div class="rounded-3xl bg-surface-container-lowest p-space-lg sm:p-space-2xl shadow-md border border-surface-container text-center relative overflow-hidden">
      ${renderJournalStateContent({
        journalState,
        reviewData,
        formattedTimer,
        lastError,
        places,
        people,
        events,
        stories,
        lang
      })}
    </div>

    <!-- MEDICAL SAFETY & PRIVACY NOTICE -->
    <footer class="mt-space-2xl text-center text-on-surface-variant/80 max-w-2xl mx-auto font-caption text-caption leading-relaxed">
      <p>
        <strong>Gentle Privacy Guarantee:</strong> Voice journals are stored safely on your device as personal reminiscence keepsakes. They are never shared with doctors or family members unless you explicitly choose to share them. Not used for clinical diagnosis or emotion scoring.
      </p>
    </footer>
  </div>
  `;
}

function renderJournalStateContent({
  journalState,
  reviewData,
  formattedTimer,
  lastError,
  places,
  people,
  events,
  stories,
  lang
}) {
  switch (journalState) {
    case JOURNAL_STATES.IDLE:
      return `
      <div class="py-space-xl flex flex-col items-center justify-center space-y-space-lg" id="vjIdleSection">
        <button id="vjStartRecordBtn" class="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-primary hover:bg-primary-container text-on-primary shadow-xl hover:shadow-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer border-4 border-surface" aria-label="Start recording voice memory" type="button">
          <span class="material-symbols-outlined text-[52px]">mic</span>
          <span class="font-label-md text-label-md font-bold uppercase tracking-wider">Start</span>
        </button>
        <div class="space-y-1">
          <p class="font-headline-sm text-headline-sm font-semibold text-on-surface">
            ${i18nService.t('voiceJournal.startRecording')}
          </p>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Tap the button and speak freely. Take all the time you need.
          </p>
        </div>
      </div>
      `;

    case JOURNAL_STATES.RECORDING:
      return `
      <div class="py-space-xl flex flex-col items-center justify-center space-y-space-lg" id="vjRecordingSection" aria-live="polite">
        <!-- Accessible Status & Real Timer -->
        <div class="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-error/15 text-error font-label-lg text-label-lg font-bold">
          <span class="w-3 h-3 rounded-full bg-error animate-pulse"></span>
          <span>Recording — ${formattedTimer}</span>
        </div>

        <!-- Soundwave Animation -->
        <div class="flex items-center justify-center gap-2 h-16" aria-hidden="true">
          <span class="w-2 h-6 bg-primary rounded-full animate-pulse"></span>
          <span class="w-2 h-12 bg-primary rounded-full animate-bounce"></span>
          <span class="w-2 h-16 bg-secondary rounded-full animate-pulse"></span>
          <span class="w-2 h-10 bg-primary rounded-full animate-bounce"></span>
          <span class="w-2 h-14 bg-secondary rounded-full animate-pulse"></span>
          <span class="w-2 h-6 bg-primary rounded-full animate-bounce"></span>
        </div>

        <p class="font-body-lg text-body-lg text-on-surface font-medium max-w-md">
          Listening to your story... Speak naturally and comfortably.
        </p>

        <!-- Controls: Pause & Stop -->
        <div class="flex flex-wrap items-center justify-center gap-space-md pt-space-md">
          <button id="vjPauseBtn" class="min-h-[52px] px-space-xl py-space-sm rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold flex items-center gap-space-xs shadow-sm transition-all cursor-pointer active:scale-95" type="button">
            <span class="material-symbols-outlined text-[24px]">pause</span>
            <span>${i18nService.t('voiceJournal.pause')}</span>
          </button>
          <button id="vjStopBtn" class="min-h-[52px] px-space-2xl py-space-sm rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center gap-space-xs shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95" type="button">
            <span class="material-symbols-outlined text-[24px]">stop</span>
            <span>${i18nService.t('voiceJournal.stop')}</span>
          </button>
        </div>
      </div>
      `;

    case JOURNAL_STATES.PAUSED:
      return `
      <div class="py-space-xl flex flex-col items-center justify-center space-y-space-lg" id="vjPausedSection" aria-live="polite">
        <div class="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-lg text-label-lg font-bold">
          <span class="material-symbols-outlined text-[20px]">pause_circle</span>
          <span>Paused — ${formattedTimer}</span>
        </div>

        <p class="font-body-lg text-body-lg text-on-surface-variant max-w-md">
          Recording is paused. Whenever you are ready, resume or finish.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-space-md pt-space-md">
          <button id="vjResumeBtn" class="min-h-[52px] px-space-2xl py-space-sm rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center gap-space-xs shadow-md transition-all cursor-pointer active:scale-95" type="button">
            <span class="material-symbols-outlined text-[24px]">play_arrow</span>
            <span>${i18nService.t('voiceJournal.resume')}</span>
          </button>
          <button id="vjStopFromPauseBtn" class="min-h-[52px] px-space-xl py-space-sm rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold flex items-center gap-space-xs shadow-sm transition-all cursor-pointer active:scale-95" type="button">
            <span class="material-symbols-outlined text-[24px]">stop</span>
            <span>${i18nService.t('voiceJournal.stop')}</span>
          </button>
        </div>
      </div>
      `;

    case JOURNAL_STATES.PROCESSING:
    case JOURNAL_STATES.TRANSCRIBING:
      return `
      <div class="py-space-2xl flex flex-col items-center justify-center space-y-space-md">
        <div class="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">Saving your spoken thoughts...</h3>
        <p class="font-body-md text-body-md text-on-surface-variant">Reviewing your audio and preparing transcript.</p>
      </div>
      `;

    case JOURNAL_STATES.REVIEW:
      if (!reviewData) return `<p>No recording review data found.</p>`;
      const hasTranscript = Boolean(reviewData.transcript && reviewData.transcript.trim());

      return `
      <div class="text-left space-y-space-xl" id="vjReviewSection">
        <!-- Review Header & Audio Player -->
        <div class="p-space-lg rounded-2xl bg-surface-container-low border border-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
          <div class="flex items-center gap-space-md">
            <button id="vjPlayAudioBtn" class="w-14 h-14 rounded-2xl bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center shadow-md transition-all cursor-pointer active:scale-95" type="button" aria-label="Play recorded audio">
              <span class="material-symbols-outlined text-[32px]">${isAudioPlaying ? 'pause' : 'play_arrow'}</span>
            </button>
            <div>
              <span class="font-caption text-caption text-primary font-semibold uppercase tracking-wider block">Voice Memory Audio</span>
              <span class="font-headline-sm text-headline-sm font-bold text-on-surface">Duration: ${reviewData.duration}</span>
            </div>
          </div>

          <button id="vjRecordAgainBtn" class="px-space-md py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1 transition-colors cursor-pointer" type="button">
            <span class="material-symbols-outlined text-[18px]">replay</span>
            <span>${i18nService.t('voiceJournal.recordAgain')}</span>
          </button>
        </div>

        <!-- TRANSCRIPT SECTION -->
        <div class="space-y-space-xs">
          <div class="flex items-center justify-between">
            <label class="font-label-lg text-label-lg font-bold text-on-surface flex items-center gap-1">
              <span class="material-symbols-outlined text-primary text-[20px]">notes</span>
              <span>${i18nService.t('voiceJournal.transcript')}</span>
            </label>
            <button id="vjToggleEditTranscriptBtn" class="px-space-sm py-1 rounded-lg text-primary hover:bg-primary/10 font-label-md text-label-md font-semibold flex items-center gap-1 cursor-pointer" type="button">
              <span class="material-symbols-outlined text-[18px]">${isEditingTranscript ? 'check' : 'edit'}</span>
              <span>${isEditingTranscript ? 'Done Editing' : i18nService.t('voiceJournal.editTranscript')}</span>
            </button>
          </div>

          ${reviewData.isTranscriptAvailable !== false || hasTranscript ? `
            ${isEditingTranscript ? `
              <textarea id="vjTranscriptInput" class="w-full min-h-[110px] p-space-md rounded-2xl bg-surface border-2 border-primary text-on-surface font-body-lg text-body-lg focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed">${reviewData.transcript || ''}</textarea>
            ` : `
              <div class="p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container font-body-lg text-body-lg text-on-surface leading-relaxed shadow-inner">
                ${hasTranscript ? `"${reviewData.transcript}"` : '<span class="text-on-surface-variant italic">No words transcribed. You may add a transcript by tapping Edit Transcript.</span>'}
              </div>
            `}
          ` : `
            <div class="p-space-md rounded-2xl bg-amber-500/10 border border-amber-500/20 text-on-surface">
              <div class="flex items-start gap-space-xs">
                <span class="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">info</span>
                <div>
                  <p class="font-body-md text-body-md font-medium">
                    ${i18nService.t('voiceJournal.transcriptUnavailable')}
                  </p>
                  <button id="vjManualTranscriptBtn" class="mt-2 text-primary font-label-md text-label-md font-bold hover:underline cursor-pointer" type="button">
                    + ${i18nService.t('voiceJournal.addTranscript')}
                  </button>
                </div>
              </div>
            </div>
          `}
        </div>

        <!-- SMRITIAI TITLE & SUMMARY SUGGESTION DRAWER -->
        <div class="p-space-lg rounded-2xl bg-primary-fixed/30 border border-primary-fixed flex flex-col space-y-space-md">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-space-xs">
              <span class="material-symbols-outlined text-primary text-[22px]">smart_toy</span>
              <span class="font-label-lg text-label-lg font-bold text-on-primary-fixed">SmritiAI Organizing Assistant</span>
            </div>
            <span class="font-caption text-caption text-on-primary-fixed/80">Optional • Zero Fabrication</span>
          </div>

          <!-- SmritiAI Suggested Title -->
          <div class="space-y-space-xs">
            <div class="flex items-center justify-between">
              <span class="font-caption text-caption text-on-surface-variant font-semibold">Suggested Title:</span>
              <button id="vjUseSuggestedTitleBtn" class="px-space-md py-1 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-bold transition-colors cursor-pointer" type="button">
                Use Suggested Title
              </button>
            </div>
            <div class="font-headline-sm text-headline-sm font-bold text-primary" id="vjSuggestedTitleDisplay">
              "${reviewData.suggestedTitle || (hasTranscript ? smritiAIService.suggestJournalTitle(reviewData.transcript).suggestedTitle : 'Afternoon Memory')}"
            </div>
          </div>

          <!-- SmritiAI Summary Helper -->
          <div class="pt-space-xs border-t border-primary-fixed/40 flex flex-wrap items-center gap-space-sm">
            <button id="vjSummarizeBtn" class="px-space-md py-1.5 rounded-xl bg-surface text-on-surface hover:bg-surface-container font-label-md text-label-md font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-surface-container" type="button">
              <span class="material-symbols-outlined text-[18px] text-primary">auto_awesome</span>
              <span>Summarize with AI</span>
            </button>
            ${smritiSummaryText ? `
              <div class="w-full mt-2 p-space-sm rounded-xl bg-surface border border-surface-container text-body-md text-body-md text-on-surface">
                <span class="font-caption text-caption text-primary font-bold block uppercase tracking-wider">AI Summary</span>
                <span>${smritiSummaryText}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- METADATA FORM: TITLE, DATE, PLACE, PEOPLE, EVENT, STORY -->
        <div class="space-y-space-lg pt-space-xs">
          <!-- Memory Title -->
          <div>
            <label for="vjTitleInput" class="font-label-lg text-label-lg font-bold text-on-surface block mb-1">
              ${i18nService.t('voiceJournal.memoryTitle')} <span class="text-error">*</span>
            </label>
            <input type="text" id="vjTitleInput" value="${reviewData.title || ''}" placeholder="e.g. Tea with Family in Shillong" class="w-full px-space-md py-space-sm rounded-xl bg-surface border border-surface-container text-on-surface font-body-lg text-body-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>

          <!-- Memory Date -->
          <div>
            <label for="vjDateInput" class="font-label-lg text-label-lg font-bold text-on-surface block mb-1">
              ${i18nService.t('voiceJournal.memoryDate')}
            </label>
            <input type="text" id="vjDateInput" value="${reviewData.date || ''}" class="w-full px-space-md py-space-sm rounded-xl bg-surface border border-surface-container text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <!-- Relational Links Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <!-- Place Selector -->
            <div>
              <label for="vjPlaceSelect" class="font-label-md text-label-md font-bold text-on-surface block mb-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-[18px] text-secondary">location_on</span>
                <span>Place</span>
              </label>
              <select id="vjPlaceSelect" class="w-full px-space-md py-space-xs rounded-xl bg-surface border border-surface-container text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer">
                <option value="">-- None / Sanctuary --</option>
                ${places.map(pl => `<option value="${pl.id}" ${reviewData.placeId === pl.id ? 'selected' : ''}>${pl.name} (${pl.region || 'Place'})</option>`).join('')}
              </select>
            </div>

            <!-- Event Selector -->
            <div>
              <label for="vjEventSelect" class="font-label-md text-label-md font-bold text-on-surface block mb-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-[18px] text-primary">event</span>
                <span>Event / Occasion</span>
              </label>
              <select id="vjEventSelect" class="w-full px-space-md py-space-xs rounded-xl bg-surface border border-surface-container text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                <option value="">-- None / Everyday Memory --</option>
                ${events.map(ev => `<option value="${ev.id}" ${reviewData.eventId === ev.id ? 'selected' : ''}>${ev.title || ev.name} (${ev.date || 'Event'})</option>`).join('')}
              </select>
            </div>

            <!-- Story Selector -->
            <div>
              <label for="vjStorySelect" class="font-label-md text-label-md font-bold text-on-surface block mb-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-[18px] text-primary">menu_book</span>
                <span>Connect with Story</span>
              </label>
              <select id="vjStorySelect" class="w-full px-space-md py-space-xs rounded-xl bg-surface border border-surface-container text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                <option value="">-- Standalone Voice Journal --</option>
                ${stories.map(st => `<option value="${st.id}" ${reviewData.storyId === st.id ? 'selected' : ''}>${st.title}</option>`).join('')}
              </select>
            </div>

            <!-- People Linking -->
            <div>
              <label class="font-label-md text-label-md font-bold text-on-surface block mb-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-[18px] text-secondary">group</span>
                <span>Connected People</span>
              </label>
              <div class="flex flex-wrap gap-2 p-2 rounded-xl bg-surface border border-surface-container max-h-28 overflow-y-auto" id="vjPeopleCheckboxes">
                ${people.length > 0 ? people.map(p => `
                  <label class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container font-caption text-caption font-medium cursor-pointer hover:bg-surface-container-high">
                    <input type="checkbox" value="${p.id}" class="vj-person-cb rounded text-primary focus:ring-primary" ${(reviewData.personIds || []).includes(p.id) ? 'checked' : ''} />
                    <span>${p.name} (${p.relation || 'Family'})</span>
                  </label>
                `).join('') : '<span class="font-caption text-caption text-on-surface-variant p-1">No people in memory world</span>'}
              </div>
            </div>
          </div>

          <!-- Family Circle Sharing Option (Default: PRIVATE) -->
          <div class="p-space-md rounded-2xl bg-surface-container border border-surface-container flex items-start gap-space-sm">
            <input type="checkbox" id="vjShareWithFamilyCb" class="w-5 h-5 rounded text-primary focus:ring-primary mt-1 cursor-pointer" ${reviewData.sharedWithFamily ? 'checked' : ''} />
            <label for="vjShareWithFamilyCb" class="cursor-pointer">
              <span class="font-label-md text-label-md font-bold text-on-surface block">
                ${i18nService.t('voiceJournal.shareWithFamily')}
              </span>
              <span class="font-body-md text-body-md text-on-surface-variant block mt-0.5">
                Saved privately by default. Check this box only if you want authorized family members in your Family Circle to listen.
              </span>
            </label>
          </div>
        </div>

        <!-- SAVE / CANCEL BUTTONS -->
        <div class="pt-space-lg border-t border-surface-container flex flex-wrap items-center justify-end gap-space-md">
          <button id="vjCancelReviewBtn" class="min-h-[48px] px-space-xl py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors cursor-pointer" type="button">
            ${i18nService.t('common.cancel')}
          </button>
          <button id="vjSaveMemoryBtn" class="min-h-[52px] px-space-2xl py-space-sm rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center gap-space-xs shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95" type="button">
            <span class="material-symbols-outlined text-[24px]">save</span>
            <span>${i18nService.t('voiceJournal.saveMemory')}</span>
          </button>
        </div>
      </div>
      `;

    case JOURNAL_STATES.SAVED:
      return `
      <div class="py-space-2xl flex flex-col items-center justify-center space-y-space-lg text-center" id="vjSavedSection">
        <div class="w-20 h-20 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg">
          <span class="material-symbols-outlined text-[44px]">check</span>
        </div>
        <div class="space-y-1">
          <h2 class="font-headline-lg text-headline-lg font-bold text-on-surface">Voice Memory Cherished &amp; Saved!</h2>
          <p class="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto">
            Your personal story has been preserved in your living archive and added to your memory timeline.
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-space-md pt-space-md">
          <a href="#/memory-timeline" class="min-h-[50px] px-space-xl py-space-sm rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center gap-space-xs shadow-md transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[22px]">timeline</span>
            <span>View in Memory Timeline</span>
          </a>
          <a href="#/memory-world" class="min-h-[50px] px-space-xl py-space-sm rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold flex items-center gap-space-xs shadow-sm transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[22px]">auto_stories</span>
            <span>View in Memory World</span>
          </a>
          <button id="vjRecordAnotherBtn" class="min-h-[50px] px-space-lg py-space-sm rounded-2xl bg-surface-container-low hover:bg-surface-container text-primary font-label-lg text-label-lg font-bold flex items-center gap-space-xs transition-colors cursor-pointer" type="button">
            <span class="material-symbols-outlined text-[22px]">mic</span>
            <span>Record Another Story</span>
          </button>
        </div>
      </div>
      `;

    case JOURNAL_STATES.ERROR:
      return `
      <div class="py-space-2xl flex flex-col items-center justify-center space-y-space-md text-center" id="vjErrorSection">
        <div class="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center">
          <span class="material-symbols-outlined text-[36px]">mic_off</span>
        </div>
        <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">Microphone Notice</h3>
        <p class="font-body-lg text-body-lg text-on-surface-variant max-w-md">
          ${lastError || i18nService.t('voiceJournal.micDenied')}
        </p>
        <div class="p-space-md rounded-2xl bg-surface-container font-caption text-caption text-left max-w-md space-y-1">
          <p class="font-semibold text-on-surface">How to allow microphone access:</p>
          <ul class="list-disc list-inside text-on-surface-variant space-y-0.5">
            <li>Look for the camera/microphone icon in your browser address bar.</li>
            <li>Select "Allow" or "Reset permissions".</li>
            <li>Reload the page and try again.</li>
          </ul>
        </div>
        <button id="vjRetryBtn" class="min-h-[48px] px-space-xl py-space-xs rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg font-bold shadow-md transition-all cursor-pointer" type="button">
          ${i18nService.t('common.retry')}
        </button>
      </div>
      `;

    default:
      return '';
  }
}

export function attachVoiceJournalEvents(rerenderCallback = null) {
  const rerender = typeof rerenderCallback === 'function' ? rerenderCallback : () => {
    const el = document.getElementById('view-content');
    if (el) {
      el.innerHTML = renderVoiceJournalView();
      attachVoiceJournalEvents(rerender);
    }
  };

  // Subscribe to service state changes
  const unsubscribe = voiceJournalService.subscribe(() => {
    // Update live timer if recording
    const state = voiceJournalService.getState();
    if (state === JOURNAL_STATES.RECORDING || state === JOURNAL_STATES.PAUSED) {
      const recordingText = document.querySelector('#vjRecordingSection span:last-child');
      if (recordingText) {
        recordingText.textContent = `Recording — ${voiceJournalService.getFormattedTimer()}`;
      }
      const pausedText = document.querySelector('#vjPausedSection span:last-child');
      if (pausedText) {
        pausedText.textContent = `Paused — ${voiceJournalService.getFormattedTimer()}`;
      }
    } else {
      rerender();
    }
  });

  // Start Recording
  document.getElementById('vjStartRecordBtn')?.addEventListener('click', async () => {
    const ok = await voiceJournalService.startRecording();
    if (ok) {
      rerender();
    }
  });

  // Pause Recording
  document.getElementById('vjPauseBtn')?.addEventListener('click', () => {
    voiceJournalService.pauseRecording();
    rerender();
  });

  // Resume Recording
  document.getElementById('vjResumeBtn')?.addEventListener('click', () => {
    voiceJournalService.resumeRecording();
    rerender();
  });

  // Stop Recording
  const handleStop = async () => {
    await voiceJournalService.stopRecording();
    const review = voiceJournalService.getReviewData();
    if (review && review.transcript && !review.title) {
      const suggestion = smritiAIService.suggestJournalTitle(review.transcript);
      review.title = suggestion.suggestedTitle;
      review.suggestedTitle = suggestion.suggestedTitle;
    }
    rerender();
  };

  document.getElementById('vjStopBtn')?.addEventListener('click', handleStop);
  document.getElementById('vjStopFromPauseBtn')?.addEventListener('click', handleStop);

  // Play Review Audio
  document.getElementById('vjPlayAudioBtn')?.addEventListener('click', () => {
    const review = voiceJournalService.getReviewData();
    if (!review || !review.audioUrl) {
      showToast('No audio playback available', 'info');
      return;
    }

    if (!audioPlayer) {
      audioPlayer = new Audio(review.audioUrl);
      audioPlayer.onended = () => {
        isAudioPlaying = false;
        rerender();
      };
      audioPlayer.onerror = () => {
        isAudioPlaying = false;
        showToast('Audio playback failed', 'error');
        rerender();
      };
    }

    if (isAudioPlaying) {
      audioPlayer.pause();
      isAudioPlaying = false;
    } else {
      audioPlayer.play().then(() => {
        isAudioPlaying = true;
        rerender();
      }).catch(e => {
        console.warn('Audio play error:', e);
        isAudioPlaying = false;
        showToast('Could not play audio', 'info');
      });
    }
  });

  // Record Again
  document.getElementById('vjRecordAgainBtn')?.addEventListener('click', () => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer = null;
    }
    isAudioPlaying = false;
    voiceJournalService.reset();
    rerender();
  });

  // Toggle Edit Transcript
  document.getElementById('vjToggleEditTranscriptBtn')?.addEventListener('click', () => {
    if (isEditingTranscript) {
      const val = document.getElementById('vjTranscriptInput')?.value || '';
      voiceJournalService.updateReviewField('transcript', val);
      isEditingTranscript = false;
    } else {
      isEditingTranscript = true;
    }
    rerender();
  });

  // Manual Transcript button
  document.getElementById('vjManualTranscriptBtn')?.addEventListener('click', () => {
    isEditingTranscript = true;
    rerender();
  });

  // Use Suggested Title button
  document.getElementById('vjUseSuggestedTitleBtn')?.addEventListener('click', () => {
    const review = voiceJournalService.getReviewData();
    const suggested = review?.suggestedTitle || (review?.transcript ? smritiAIService.suggestJournalTitle(review.transcript).suggestedTitle : 'Afternoon Memory');
    const input = document.getElementById('vjTitleInput');
    if (input) {
      input.value = suggested;
    }
    voiceJournalService.updateReviewField('title', suggested);
    showToast('Suggested title applied', 'check');
  });

  // Summarize with AI
  document.getElementById('vjSummarizeBtn')?.addEventListener('click', () => {
    const review = voiceJournalService.getReviewData();
    if (!review || !review.transcript) {
      showToast('Please add a transcript before summarizing', 'info');
      return;
    }
    const res = smritiAIService.summarizeJournalTranscript(review.transcript);
    smritiSummaryText = res.summary;
    voiceJournalService.updateReviewField('aiSummary', smritiSummaryText);
    rerender();
  });

  // Save Memory
  document.getElementById('vjSaveMemoryBtn')?.addEventListener('click', () => {
    const titleVal = document.getElementById('vjTitleInput')?.value || '';
    if (!titleVal.trim()) {
      showToast('Please provide a title for your memory', 'info');
      document.getElementById('vjTitleInput')?.focus();
      return;
    }

    const dateVal = document.getElementById('vjDateInput')?.value || '';
    const placeVal = document.getElementById('vjPlaceSelect')?.value || null;
    const eventVal = document.getElementById('vjEventSelect')?.value || null;
    const storyVal = document.getElementById('vjStorySelect')?.value || null;
    const shareVal = Boolean(document.getElementById('vjShareWithFamilyCb')?.checked);

    const checkedPeople = Array.from(document.querySelectorAll('.vj-person-cb:checked')).map(cb => cb.value);

    try {
      voiceJournalService.saveJournalEntry({
        title: titleVal.trim(),
        date: dateVal.trim(),
        placeId: placeVal,
        eventId: eventVal,
        storyId: storyVal,
        personIds: checkedPeople,
        sharedWithFamily: shareVal,
        isPrivate: !shareVal,
        aiSummary: smritiSummaryText
      });

      showToast('Voice memory saved to living archive!', 'check');
      rerender();
    } catch (err) {
      console.error('Error saving voice memory:', err);
      showToast('Could not save voice memory. Please try again.', 'error');
    }
  });

  // Cancel Review
  document.getElementById('vjCancelReviewBtn')?.addEventListener('click', () => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer = null;
    }
    isAudioPlaying = false;
    voiceJournalService.reset();
    rerender();
  });

  // Record Another Button
  document.getElementById('vjRecordAnotherBtn')?.addEventListener('click', () => {
    voiceJournalService.reset();
    smritiSummaryText = null;
    isEditingTranscript = false;
    rerender();
  });

  // Retry from error
  document.getElementById('vjRetryBtn')?.addEventListener('click', () => {
    voiceJournalService.reset();
    rerender();
  });

  return unsubscribe;
}
