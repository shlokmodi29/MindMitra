// SmritiAI Voice Companion Interactive Modal
// Enhanced in Part 8 with Unified VoiceService & Multilingual Speech Recognition
import { store } from '../state/store.js';
import { voiceService, VOICE_STATES } from '../services/voiceService.js';
import { smritiAIService } from '../services/smritiAIService.js';
import { i18nService } from '../services/i18nService.js';
import { showToast } from '../components/Toast.js';

export function renderSmritiModal() {
  const state = store.getState();
  if (!state.voiceModalOpen) return '';

  const patient = state.currentUser || state.profile || state.users[0];
  const patientFirstName = patient?.name ? patient.name.split(' ')[0] : 'Patient';
  const activeLangMeta = i18nService.getCurrentLanguageMeta();

  return `
  <div id="smritiModalBackdrop" class="fixed inset-0 z-50 flex items-center justify-center p-space-md modal-backdrop">
    <div class="relative w-full max-w-2xl rounded-3xl bg-secondary text-on-secondary p-space-xl md:p-space-2xl shadow-2xl overflow-hidden border border-secondary-fixed/20 animate-gentle-pulse">
      <!-- Ambient background decoration -->
      <div class="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-secondary-fixed/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>

      <!-- Header & Close -->
      <div class="relative z-10 flex items-center justify-between mb-space-lg">
        <div class="flex items-center gap-space-sm">
          <div class="w-12 h-12 rounded-full bg-on-secondary/15 flex items-center justify-center">
            <span class="material-symbols-outlined text-[28px] text-secondary-fixed">graphic_eq</span>
          </div>
          <div>
            <div class="flex items-center gap-space-xs flex-wrap">
              <h3 class="font-headline-sm text-headline-sm text-on-secondary font-bold">${i18nService.t('smriti.title')}</h3>
              <span class="px-space-xs py-0.5 rounded-full bg-on-secondary/15 text-secondary-fixed font-caption text-caption font-semibold">Interface Preview • ${activeLangMeta.native}</span>
            </div>
            <span class="font-caption text-caption text-secondary-fixed-dim">Gentle companion in English, हिन्दी, অসমীয়া, and বাংলা</span>
          </div>
        </div>
        <div class="flex items-center gap-space-xs">
          <a href="#/smriti-ai" id="smritiOpenFullViewBtn" class="hidden sm:inline-flex items-center gap-space-2xs px-space-md py-space-xs rounded-full bg-on-secondary/15 hover:bg-on-secondary/25 text-on-secondary font-label-md text-label-md transition-colors cursor-pointer">
            <span>Open Full Chat</span>
            <span class="material-symbols-outlined text-[16px]">open_in_new</span>
          </a>
          <button id="closeSmritiModalBtn" class="w-10 h-10 rounded-full bg-on-secondary/15 hover:bg-on-secondary/25 flex items-center justify-center text-on-secondary transition-colors cursor-pointer" aria-label="Close voice companion">
            <span class="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
      </div>

      <!-- Voice Active Waveform Visualization -->
      <div class="relative z-10 flex items-center justify-center gap-1.5 h-16 my-space-md" id="smritiWaveform">
        <span class="w-2 bg-secondary-fixed rounded-full wave-bar"></span>
        <span class="w-2 bg-secondary-fixed rounded-full wave-bar"></span>
        <span class="w-2 bg-on-secondary rounded-full wave-bar"></span>
        <span class="w-2 bg-secondary-fixed rounded-full wave-bar"></span>
        <span class="w-2 bg-secondary-fixed-dim rounded-full wave-bar"></span>
        <span class="w-2 bg-on-secondary rounded-full wave-bar"></span>
      </div>

      <!-- Dialogue status container -->
      <div class="relative z-10 p-space-md rounded-2xl bg-on-secondary/10 backdrop-blur-md mb-space-lg">
        <p class="font-body-xl text-body-xl text-on-secondary leading-relaxed" id="smritiResponseText">
          “${i18nService.t('smriti.voiceGreeting')}”
        </p>
        <div id="smritiEmergencyActionWrap" class="hidden mt-space-sm"></div>
      </div>

      <!-- Suggested Quick Prompt Chips -->
      <div class="relative z-10 space-y-space-xs mb-space-xl">
        <span class="font-caption text-caption text-on-secondary/70 uppercase tracking-wider block">Tap a suggestion or speak:</span>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-xs">
          <button class="smriti-prompt-chip text-left px-space-md py-space-sm rounded-xl bg-on-secondary/10 hover:bg-on-secondary/20 font-label-md text-label-md text-on-secondary transition-all flex items-center justify-between cursor-pointer" data-prompt="schedule">
            <span>“What's on my day?”</span>
            <span class="material-symbols-outlined text-[18px] opacity-70">arrow_forward</span>
          </button>
          <button class="smriti-prompt-chip text-left px-space-md py-space-sm rounded-xl bg-on-secondary/10 hover:bg-on-secondary/20 font-label-md text-label-md text-on-secondary transition-all flex items-center justify-between cursor-pointer" data-prompt="meera">
            <span>“Tell me about Meera”</span>
            <span class="material-symbols-outlined text-[18px] opacity-70">arrow_forward</span>
          </button>
          <button class="smriti-prompt-chip text-left px-space-md py-space-sm rounded-xl bg-on-secondary/10 hover:bg-on-secondary/20 font-label-md text-label-md text-on-secondary transition-all flex items-center justify-between cursor-pointer" data-prompt="story">
            <span>“Listen to quiet story”</span>
            <span class="material-symbols-outlined text-[18px] opacity-70">arrow_forward</span>
          </button>
        </div>
      </div>

      <!-- Primary Accessible Voice Interaction Controls -->
      <div class="relative z-10 flex flex-col items-center justify-center gap-space-xs">
        <div class="flex items-center gap-space-sm flex-wrap justify-center">
          <button id="smritiListenBtn" class="min-h-[56px] px-space-xl rounded-full bg-surface-container-lowest text-secondary hover:bg-surface-bright font-headline-sm text-headline-sm flex items-center justify-center gap-space-sm shadow-xl transition-all active:scale-95 cursor-pointer">
            <span class="material-symbols-outlined text-[28px] text-primary" id="smritiMicIcon">mic</span>
            <span id="smritiMicLabel">${i18nService.t('smriti.tapToSpeak')}</span>
          </button>

          <button id="smritiStopVoiceBtn" class="hidden min-h-[56px] px-space-lg rounded-full bg-error text-on-error hover:opacity-90 font-label-lg text-label-lg flex items-center gap-space-2xs shadow-md transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[22px]">stop_circle</span>
            <span>${i18nService.t('common.stop')}</span>
          </button>
        </div>
        <span class="font-caption text-caption text-on-secondary/70">Always gentle, respectful, and unhurried.</span>
      </div>
    </div>
  </div>
  `;
}

export function attachSmritiModalEvents() {
  const backdrop = document.getElementById('smritiModalBackdrop');
  const closeBtn = document.getElementById('closeSmritiModalBtn');
  const listenBtn = document.getElementById('smritiListenBtn');
  const stopVoiceBtn = document.getElementById('smritiStopVoiceBtn');
  const responseText = document.getElementById('smritiResponseText');
  const micLabel = document.getElementById('smritiMicLabel');
  const micIcon = document.getElementById('smritiMicIcon');
  const promptChips = document.querySelectorAll('.smriti-prompt-chip');
  const openFullBtn = document.getElementById('smritiOpenFullViewBtn');

  function updateSpeakingUI(isSpeaking) {
    if (stopVoiceBtn) {
      if (isSpeaking) {
        stopVoiceBtn.classList.remove('hidden');
      } else {
        stopVoiceBtn.classList.add('hidden');
      }
    }
  }

  if (openFullBtn) {
    openFullBtn.addEventListener('click', () => {
      voiceService.stop();
      store.setVoiceModalOpen(false);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      voiceService.stop();
      store.setVoiceModalOpen(false);
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        voiceService.stop();
        store.setVoiceModalOpen(false);
      }
    });
  }

  if (stopVoiceBtn) {
    stopVoiceBtn.addEventListener('click', () => {
      voiceService.stop();
      updateSpeakingUI(false);
      showToast('Speech stopped', 'stop');
    });
  }

  promptChips.forEach(chip => {
    chip.addEventListener('click', async () => {
      const type = chip.getAttribute('data-prompt');
      let query = "What's on my day?";
      if (type === 'meera') query = "Tell me about Meera";
      else if (type === 'story') query = "Tell me a quiet story";

      if (responseText) responseText.textContent = `“${i18nService.t('smriti.thinking')}”`;
      updateSpeakingUI(true);

      const res = await smritiAIService.sendMessage(query, {
        speak: true,
        language: i18nService.getLanguage()
      });

      if (res && responseText) {
        responseText.textContent = `“${res.text}”`;
      }
    });
  });

  if (listenBtn) {
    listenBtn.addEventListener('click', () => {
      // If speaking, stop it
      if (voiceService.isSpeaking()) {
        voiceService.stop();
        updateSpeakingUI(false);
        return;
      }

      // If listening, stop listening
      if (voiceService.isListening()) {
        voiceService.stopListening();
        if (micLabel) micLabel.textContent = i18nService.t('smriti.tapToSpeak');
        if (micIcon) micIcon.textContent = 'mic';
        return;
      }

      if (micLabel) micLabel.textContent = i18nService.t('smriti.listening');
      if (micIcon) micIcon.textContent = 'graphic_eq';

      const success = voiceService.startListening({
        lang: i18nService.getLanguage(),
        onInterim: (interim) => {
          if (responseText) responseText.textContent = `“${interim}...”`;
        },
        onResult: async (finalText) => {
          if (micLabel) micLabel.textContent = i18nService.t('smriti.thinking');
          if (responseText) responseText.textContent = `“${finalText}”`;

          updateSpeakingUI(true);
          const res = await smritiAIService.sendMessage(finalText, {
            speak: true,
            language: i18nService.getLanguage()
          });

          if (res && responseText) {
            responseText.textContent = `“${res.text}”`;
          }

          const emergencyWrap = document.getElementById('smritiEmergencyActionWrap');
          if (res && res.type === 'emergency' && emergencyWrap) {
            emergencyWrap.innerHTML = `
              <div class="flex flex-col sm:flex-row items-center justify-between gap-space-sm p-space-sm bg-surface-container-lowest text-on-surface rounded-xl shadow-md">
                <span class="font-label-md text-label-md font-semibold text-error">Emergency Confirmation</span>
                <div class="flex items-center gap-space-xs w-full sm:w-auto justify-end">
                  <button id="smritiSosCancelBtn" type="button" class="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md cursor-pointer">Cancel</button>
                  <a href="#/emergency-sos" id="smritiSosConfirmBtn" class="px-space-md py-1.5 rounded-lg bg-error hover:bg-error/90 text-on-error font-label-md flex items-center gap-1 shadow-sm cursor-pointer">
                    <span class="material-symbols-outlined text-[18px]">emergency</span>
                    <span>Open Emergency Help</span>
                  </a>
                </div>
              </div>
            `;
            emergencyWrap.classList.remove('hidden');

            const cancelBtn = document.getElementById('smritiSosCancelBtn');
            const confirmBtn = document.getElementById('smritiSosConfirmBtn');
            if (cancelBtn) {
              cancelBtn.addEventListener('click', () => {
                emergencyWrap.classList.add('hidden');
                voiceService.stop();
                updateSpeakingUI(false);
              });
            }
            if (confirmBtn) {
              confirmBtn.addEventListener('click', () => {
                emergencyWrap.classList.add('hidden');
                voiceService.stop();
                store.setVoiceModalOpen(false);
              });
            }
          } else if (emergencyWrap) {
            emergencyWrap.classList.add('hidden');
          }

          if (micLabel) micLabel.textContent = i18nService.t('smriti.tapToSpeak');
          if (micIcon) micIcon.textContent = 'mic';
        },
        onEnd: () => {
          if (micLabel) micLabel.textContent = i18nService.t('smriti.tapToSpeak');
          if (micIcon) micIcon.textContent = 'mic';
        },
        onError: (err) => {
          if (micLabel) micLabel.textContent = i18nService.t('smriti.tapToSpeak');
          if (micIcon) micIcon.textContent = 'mic';
          showToast(err.message || i18nService.t('smriti.micUnavailable'), 'info');
        }
      });

      if (!success) {
        if (micLabel) micLabel.textContent = i18nService.t('smriti.tapToSpeak');
        if (micIcon) micIcon.textContent = 'mic';
        showToast(i18nService.t('smriti.micUnavailable'), 'info');
      }
    });
  }
}
