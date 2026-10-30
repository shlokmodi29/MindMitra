// MindMitra Mood Check-in Card Component
// Elder-friendly, non-diagnostic daily emotional check-in with 5 visual choices,
// voice STT preview modal, audio readout, optional note, and history view.

import { store } from '../state/store.js';
import { moodCheckInService, MOOD_VALUES, MOOD_CONFIG } from '../services/moodCheckInService.js';
import { voiceService } from '../services/voiceService.js';
import { i18nService } from '../services/i18nService.js';
import { showToast } from './Toast.js';

let isEditingToday = false;
let isHistoryOpen = false;

export function renderMoodCheckInCard(patientId = null, compact = false) {
  const pid = patientId || (store.getCurrentPatientId ? store.getCurrentPatientId() : 'user-asha');
  const todayCheckIn = moodCheckInService.getTodayCheckIn(pid);
  const currentLang = store.getState().currentLanguage || 'en';

  const titleText = i18nService.t('moodCheckIn.prompt') || 'How are you feeling today?';
  const subtitleText = 'A gentle daily check-in for your comfort and peace of mind.';

  return `
  <section class="mood-checkin-widget mood-checkin-card w-full rounded-3xl bg-surface-container-lowest border border-outline/20 p-5 sm:p-6 shadow-xs relative overflow-hidden text-on-surface" id="moodCheckInWidget">
    
    <!-- Header: Prompt & Audio/Voice Triggers -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div class="space-y-0.5">
        <div class="flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-2xs">
            <span class="material-symbols-outlined text-[16px]">sentiment_satisfied</span>
          </span>
          <h3 class="font-headline-sm text-lg font-bold text-on-surface">
            ${titleText}
          </h3>
        </div>
        ${!compact ? `<p class="text-caption text-on-surface-variant">${subtitleText}</p>` : ''}
      </div>

      <div class="flex items-center gap-2">
        <!-- Audio Readout Button -->
        <button id="hearMoodPromptBtn" class="h-9 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 text-caption font-semibold cursor-pointer" title="Hear prompt read aloud" type="button" aria-label="Listen to question">
          <span class="material-symbols-outlined text-[18px]">volume_up</span>
          <span class="hidden sm:inline">Hear</span>
        </button>

        <!-- Voice STT Button -->
        <button id="voiceMoodCheckInBtn" class="h-9 px-3 rounded-xl bg-surface-container hover:bg-primary-container text-on-surface-variant hover:text-on-primary-container transition-colors flex items-center gap-1.5 text-caption font-semibold cursor-pointer" title="Speak your mood" type="button" aria-label="Speak how you feel">
          <span class="material-symbols-outlined text-[18px]">mic</span>
          <span class="hidden sm:inline">Speak</span>
        </button>

        <!-- History Toggle -->
        <button id="toggleMoodHistoryBtn" class="h-9 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors flex items-center gap-1.5 text-caption font-semibold cursor-pointer" title="View Check-in History" type="button">
          <span class="material-symbols-outlined text-[18px]">history</span>
          <span class="hidden sm:inline">History</span>
        </button>
      </div>
    </div>

    <!-- MAIN BODY -->
    ${(todayCheckIn && !isEditingToday) ? `
      <!-- STATE 1: TODAY'S CHECK-IN RECORDED -->
      <div class="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-outline/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div class="flex items-center gap-3.5">
          <span class="text-3xl sm:text-4xl filter drop-shadow-xs" aria-hidden="true">${MOOD_CONFIG[todayCheckIn.mood]?.emoji || '😊'}</span>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-caption font-semibold uppercase tracking-wider text-on-surface-variant">Today's Check-in:</span>
              <strong class="font-headline-sm text-base font-bold text-on-surface">${MOOD_CONFIG[todayCheckIn.mood]?.label || todayCheckIn.mood}</strong>
            </div>
            <p class="text-caption text-on-surface-variant mt-0.5">
              ${todayCheckIn.note ? `“${todayCheckIn.note}”` : 'Thank you for checking in with us today.'}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button id="hearMoodTodayBtn" class="btn-hear-mood h-10 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface hover:bg-surface-container text-caption font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1" title="Hear today's check-in read aloud" aria-label="Hear today's check-in">
            <span class="material-symbols-outlined text-[16px]">volume_up</span>
            <span class="hidden sm:inline">Hear</span>
          </button>

          <button id="addOrEditNoteBtn" class="h-10 px-3.5 rounded-xl bg-surface border border-outline/30 text-on-surface hover:bg-surface-container text-caption font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">edit_note</span>
            <span>${todayCheckIn.note ? 'Edit Note' : 'Add Note'}</span>
          </button>

          <button id="changeMoodBtn" class="btn-change-mood h-10 px-3.5 rounded-xl bg-surface border border-outline/30 text-on-surface hover:bg-surface-container text-caption font-bold transition-all cursor-pointer shadow-2xs">
            Change
          </button>
        </div>
      </div>

    ` : `
      <!-- STATE 2: 5 VISIBLE CHOICES (LARGE TOUCH TARGETS) -->
      <div class="space-y-4 animate-fade-in">
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3" role="radiogroup" aria-label="How are you feeling today?">
          ${Object.values(MOOD_CONFIG).map(cfg => {
            const isSelected = todayCheckIn?.mood === cfg.key;
            return `
            <button 
              type="button" 
              role="radio"
              aria-checked="${isSelected}"
              aria-label="I feel ${cfg.key}"
              data-mood="${cfg.key}" 
              class="mood-select-btn p-3 sm:p-4 rounded-2xl bg-surface border-2 ${
                isSelected 
                  ? 'border-primary bg-primary-container/20 shadow-xs ring-2 ring-primary/20' 
                  : 'border-outline/15 hover:border-primary/40 hover:bg-surface-container-low'
              } flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 group focus:outline-none focus:ring-2 focus:ring-primary min-h-[88px]"
            >
              <span class="text-3xl sm:text-4xl group-hover:scale-110 transition-transform" aria-hidden="true">${cfg.emoji}</span>
              <span class="font-headline-sm text-sm font-bold text-on-surface text-center leading-tight">${cfg.label}</span>
            </button>
            `;
          }).join('')}
        </div>

        ${isEditingToday ? `
          <div class="flex justify-end pt-1">
            <button id="cancelChangeMoodBtn" class="text-caption text-on-surface-variant hover:text-on-surface underline cursor-pointer">
              Keep current check-in
            </button>
          </div>
        ` : ''}
      </div>
    `}

    <!-- OPTIONAL NOTE DRAWER / INLINE FORM -->
    <div id="moodNoteWrap" class="hidden mt-4 pt-4 border-t border-surface-container animate-fade-in">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label for="moodNoteInput" class="block text-caption font-semibold text-on-surface">
            Would you like to tell me more? (Optional)
          </label>
          <span class="text-[12px] text-on-surface-variant">Private by default</span>
        </div>

        <div class="flex items-center gap-2">
          <input 
            type="text" 
            id="moodNoteInput" 
            value="${todayCheckIn?.note || ''}" 
            placeholder="e.g. Slept well, enjoying peaceful music, missing family..." 
            class="flex-1 h-11 px-3.5 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none"
            autocomplete="off"
            maxlength="200"
          />
          <button id="saveMoodNoteBtn" class="h-11 px-4 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 transition-all cursor-pointer shrink-0 shadow-xs">
            Save Note
          </button>
          <button id="cancelMoodNoteBtn" class="h-11 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-caption cursor-pointer shrink-0">
            Not now
          </button>
        </div>
      </div>
    </div>

    <!-- SIMPLE HISTORY LIST (NON-CLINICAL) -->
    ${isHistoryOpen ? `
      <div id="moodHistorySection" class="mt-4 pt-4 border-t border-surface-container space-y-3 animate-fade-in">
        <div class="flex items-center justify-between">
          <h4 class="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[18px]">event_note</span>
            <span>Check-in History</span>
          </h4>
          <span class="text-[11px] text-on-surface-variant font-medium">Personal reflection only</span>
        </div>

        <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
          ${renderHistoryList(pid)}
        </div>
      </div>
    ` : ''}

    <!-- VOICE PREVIEW MODAL (PREVENTS SILENT STT ERRORS) -->
    <div id="voiceMoodPreviewModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="w-full max-w-sm rounded-3xl bg-surface border border-outline/20 p-5 space-y-4 shadow-xl animate-fade-in text-on-surface">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[22px] animate-pulse">mic</span>
          </div>
          <div>
            <h3 class="font-headline-sm text-base font-bold text-on-surface">Voice Check-in</h3>
            <p class="text-caption text-on-surface-variant" id="voiceMoodStatus">Listening... Speak how you feel.</p>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-surface-container-low border border-outline/20 text-center space-y-2">
          <p class="text-caption text-on-surface-variant">Detected feeling:</p>
          <div id="detectedMoodPreview" class="flex items-center justify-center gap-2 text-2xl font-bold text-on-surface">
            <span class="text-caption text-on-surface-variant">Listening...</span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button id="cancelVoiceMoodBtn" class="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-caption font-medium cursor-pointer">
            Try Again
          </button>
          <button id="confirmVoiceMoodBtn" disabled class="px-5 py-2 rounded-xl bg-primary text-on-primary text-caption font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs">
            Save Check-in
          </button>
        </div>
      </div>
    </div>

  </section>
  `;
}

function renderHistoryList(patientId) {
  const history = moodCheckInService.getCheckInHistory(patientId, 7);
  if (history.length === 0) {
    return `
      <div class="p-3 text-center rounded-xl bg-surface-container-low text-caption text-on-surface-variant">
        Your check-in history will appear here.
      </div>
    `;
  }

  return history.map(item => {
    const config = MOOD_CONFIG[item.mood] || MOOD_CONFIG.okay;
    const dateObj = new Date(item.date);
    const dateLabel = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `
      <div class="p-2.5 rounded-xl bg-surface-container-low border border-outline/10 flex items-center justify-between text-caption">
        <div class="flex items-center gap-2.5">
          <span class="text-lg" aria-hidden="true">${config.emoji}</span>
          <span class="font-bold text-on-surface">${config.label}</span>
          ${item.note ? `<span class="text-on-surface-variant truncate max-w-[160px] italic">“${item.note}”</span>` : ''}
        </div>
        <span class="text-on-surface-variant font-medium">${dateLabel}</span>
      </div>
    `;
  }).join('');
}

export function attachMoodCheckInEvents(container, onUpdateCallback) {
  const root = container || document;
  const patientId = store.getCurrentPatientId ? store.getCurrentPatientId() : 'user-asha';
  const lang = store.getState().currentLanguage || 'en';

  // 1. Mood selection buttons
  root.querySelectorAll('.mood-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.dataset.mood;
      if (mood) {
        moodCheckInService.recordCheckIn({ patientId, mood, source: 'patient' });
        isEditingToday = false;
        showToast(`Thank you for sharing! Recorded: ${MOOD_CONFIG[mood]?.label || mood}`, 'celebration');

        // Optional readout
        if (store.getState().settings?.voiceFeedback) {
          voiceService.speak(moodCheckInService.generateSpokenThankYou(mood, lang), { lang });
        }

        // Open optional note drawer
        const noteWrap = root.querySelector('#moodNoteWrap');
        if (noteWrap) noteWrap.classList.remove('hidden');

        if (typeof onUpdateCallback === 'function') onUpdateCallback();
      }
    });
  });

  // 2. Change mood button
  const changeBtn = root.querySelector('#changeMoodBtn');
  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      isEditingToday = true;
      if (typeof onUpdateCallback === 'function') onUpdateCallback();
    });
  }

  const cancelChangeBtn = root.querySelector('#cancelChangeMoodBtn');
  if (cancelChangeBtn) {
    cancelChangeBtn.addEventListener('click', () => {
      isEditingToday = false;
      if (typeof onUpdateCallback === 'function') onUpdateCallback();
    });
  }

  // 3. Add or edit note button
  const addNoteBtn = root.querySelector('#addOrEditNoteBtn');
  const noteWrap = root.querySelector('#moodNoteWrap');
  if (addNoteBtn && noteWrap) {
    addNoteBtn.addEventListener('click', () => {
      noteWrap.classList.toggle('hidden');
    });
  }

  // 4. Save note button
  const saveNoteBtn = root.querySelector('#saveMoodNoteBtn');
  const noteInput = root.querySelector('#moodNoteInput');
  if (saveNoteBtn && noteInput) {
    saveNoteBtn.addEventListener('click', () => {
      const noteText = noteInput.value.trim();
      moodCheckInService.updateNote(patientId, noteText);
      showToast('Personal note saved.', 'success');
      if (noteWrap) noteWrap.classList.add('hidden');
      if (typeof onUpdateCallback === 'function') onUpdateCallback();
    });
  }

  const cancelNoteBtn = root.querySelector('#cancelMoodNoteBtn');
  if (cancelNoteBtn && noteWrap) {
    cancelNoteBtn.addEventListener('click', () => {
      noteWrap.classList.add('hidden');
    });
  }

  // 5. Toggle history button
  const historyToggleBtn = root.querySelector('#toggleMoodHistoryBtn');
  if (historyToggleBtn) {
    historyToggleBtn.addEventListener('click', () => {
      isHistoryOpen = !isHistoryOpen;
      if (typeof onUpdateCallback === 'function') onUpdateCallback();
    });
  }

  // 6. Audio Readout of Prompt & Today's Check-in
  const hearBtn = root.querySelector('#hearMoodPromptBtn');
  if (hearBtn) {
    hearBtn.addEventListener('click', () => {
      const promptText = moodCheckInService.generateSpokenPrompt(lang);
      voiceService.speak(promptText, { lang });
      showToast('Reading prompt aloud', 'volume_up');
    });
  }

  const hearTodayBtn = root.querySelector('#hearMoodTodayBtn');
  if (hearTodayBtn) {
    hearTodayBtn.addEventListener('click', () => {
      const today = moodCheckInService.getTodayCheckIn(patientId);
      const text = moodCheckInService.getSpokenText(today, lang);
      voiceService.speak(text, { lang });
      showToast("Reading today's check-in aloud", 'volume_up');
    });
  }

  // 7. Voice Check-in with Preview Dialog (No silent STT errors)
  const voiceBtn = root.querySelector('#voiceMoodCheckInBtn');
  const voiceModal = root.querySelector('#voiceMoodPreviewModal');
  const voiceStatus = root.querySelector('#voiceMoodStatus');
  const previewDiv = root.querySelector('#detectedMoodPreview');
  const cancelVoiceBtn = root.querySelector('#cancelVoiceMoodBtn');
  const confirmVoiceBtn = root.querySelector('#confirmVoiceMoodBtn');

  let detectedVoiceMood = null;

  if (voiceBtn && voiceModal) {
    voiceBtn.addEventListener('click', () => {
      detectedVoiceMood = null;
      if (previewDiv) previewDiv.innerHTML = '<span class="text-caption text-on-surface-variant animate-pulse">Listening...</span>';
      if (voiceStatus) voiceStatus.textContent = 'Listening... Please speak clearly.';
      if (confirmVoiceBtn) confirmVoiceBtn.disabled = true;
      voiceModal.classList.remove('hidden');

      if (!voiceService.isSttSupported()) {
        if (voiceStatus) voiceStatus.textContent = 'Microphone speech recognition is not supported in this browser. Please tap an option:';
        return;
      }

      voiceService.startListening({
        onInterim: (text) => {
          const matched = moodCheckInService.mapVoiceTranscriptToMood(text);
          if (matched) {
            detectedVoiceMood = matched;
            const cfg = MOOD_CONFIG[matched];
            if (previewDiv) previewDiv.innerHTML = `<span>${cfg.emoji}</span> <span>${cfg.label}</span>`;
            if (confirmVoiceBtn) confirmVoiceBtn.disabled = false;
          }
        },
        onFinal: (text) => {
          const matched = moodCheckInService.mapVoiceTranscriptToMood(text);
          if (matched) {
            detectedVoiceMood = matched;
            const cfg = MOOD_CONFIG[matched];
            if (previewDiv) previewDiv.innerHTML = `<span>${cfg.emoji}</span> <span>${cfg.label}</span>`;
            if (voiceStatus) voiceStatus.textContent = `I heard: Feeling ${cfg.label}. Review and save below:`;
            if (confirmVoiceBtn) confirmVoiceBtn.disabled = false;
          } else {
            if (voiceStatus) voiceStatus.textContent = `Heard "${text}". Please choose one: Good, Okay, Not sure, Low, Worried:`;
          }
        },
        onError: () => {
          if (voiceStatus) voiceStatus.textContent = 'Listening ended. Tap an option directly or try again.';
        }
      });
    });

    cancelVoiceBtn?.addEventListener('click', () => {
      voiceService.stopListening();
      voiceModal.classList.add('hidden');
      detectedVoiceMood = null;
    });

    confirmVoiceBtn?.addEventListener('click', () => {
      voiceService.stopListening();
      if (detectedVoiceMood) {
        moodCheckInService.recordCheckIn({ patientId, mood: detectedVoiceMood, source: 'patient' });
        showToast(`Recorded: ${MOOD_CONFIG[detectedVoiceMood]?.label}`, 'celebration');
        isEditingToday = false;
      }
      voiceModal.classList.add('hidden');
      detectedVoiceMood = null;
      if (typeof onUpdateCallback === 'function') onUpdateCallback();
    });
  }
}
