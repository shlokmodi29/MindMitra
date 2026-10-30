// MindMitra SmritiAI Conversational View
// Full-page Personal AI Memory Companion interface styled with Stitch Design System
// Enhanced in Part 8 with Voice & Multilingual Experience
import { store } from '../state/store.js';
import { smritiAIService, SMRITI_RESPONSE_TYPES } from '../services/smritiAIService.js';
import { voiceService } from '../services/voiceService.js';
import { i18nService } from '../services/i18nService.js';
import { showToast } from '../components/Toast.js';

export function renderSmritiAIView() {
  const state = store.getState();
  const patient = state.currentUser || state.profile || { name: 'Asha Devi' };
  const patientFirstName = patient.name ? patient.name.split(' ')[0] : 'Asha';
  const aiState = smritiAIService.getState();
  const history = aiState.history || [];
  const isLoading = aiState.isLoading;

  return `
  <main class="w-full max-w-5xl mx-auto px-space-md sm:px-space-lg lg:px-space-xl py-space-lg mb-space-3xl" id="smritiAiViewContainer">
    <!-- 1. Header Navigation & Orientation -->
    <div class="flex flex-wrap items-center justify-between gap-space-md pb-space-lg border-b border-surface-container mb-space-lg">
      <div class="flex items-center gap-space-md">
        <a href="#/patient-home" class="inline-flex items-center gap-space-2xs px-space-md py-space-xs rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md shadow-sm" aria-label="Return to Home">
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Home</span>
        </a>
        <div class="flex items-center gap-space-xs">
          <div class="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm">
            <span class="material-symbols-outlined text-[24px]">graphic_eq</span>
          </div>
          <div>
            <h1 class="font-headline-sm text-headline-sm text-on-surface font-bold">SmritiAI Companion</h1>
            <span class="font-caption text-caption text-secondary font-semibold">Personal Memory &amp; Daily Guide • Strictly Non-Diagnostic</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-space-sm">
        ${history.length > 0 ? `
          <button id="smritiClearChatBtn" class="inline-flex items-center gap-space-2xs px-space-md py-space-xs rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors cursor-pointer" type="button" title="Start fresh conversation">
            <span class="material-symbols-outlined text-[18px]">restart_alt</span>
            <span>New Chat</span>
          </button>
        ` : ''}
        <div class="hidden sm:flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-tertiary-fixed/30 text-on-tertiary-fixed font-caption text-caption">
          <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
          <span>Living Memory Connected</span>
        </div>
      </div>
    </div>

    <!-- 2. Quick Suggested Prompts Carousel -->
    <div class="mb-space-lg">
      <span class="font-caption text-caption text-on-surface-variant uppercase font-semibold tracking-wider block mb-space-xs">
        Suggested Inquiries
      </span>
      <div class="flex items-center gap-space-xs overflow-x-auto pb-space-2xs scrollbar-none" id="smritiQuickPromptsContainer">
        <button class="smriti-suggestion-chip shrink-0 px-space-md py-space-xs rounded-full bg-surface-container-low hover:bg-primary/10 hover:border-primary border border-surface-container font-label-md text-label-md text-on-surface transition-all flex items-center gap-space-2xs cursor-pointer" data-prompt="What is on my day today?">
          <span class="material-symbols-outlined text-[18px] text-primary">schedule</span>
          <span>What's on my day?</span>
        </button>
        <button class="smriti-suggestion-chip shrink-0 px-space-md py-space-xs rounded-full bg-surface-container-low hover:bg-primary/10 hover:border-primary border border-surface-container font-label-md text-label-md text-on-surface transition-all flex items-center gap-space-2xs cursor-pointer" data-prompt="Tell me about my family.">
          <span class="material-symbols-outlined text-[18px] text-primary">groups</span>
          <span>Tell me about my family</span>
        </button>
        <button class="smriti-suggestion-chip shrink-0 px-space-md py-space-xs rounded-full bg-surface-container-low hover:bg-primary/10 hover:border-primary border border-surface-container font-label-md text-label-md text-on-surface transition-all flex items-center gap-space-2xs cursor-pointer" data-prompt="Show me memories from Shillong.">
          <span class="material-symbols-outlined text-[18px] text-primary">photo_library</span>
          <span>Memories from Shillong</span>
        </button>
        <button class="smriti-suggestion-chip shrink-0 px-space-md py-space-xs rounded-full bg-surface-container-low hover:bg-primary/10 hover:border-primary border border-surface-container font-label-md text-label-md text-on-surface transition-all flex items-center gap-space-2xs cursor-pointer" data-prompt="Let's play a game.">
          <span class="material-symbols-outlined text-[18px] text-primary">psychology</span>
          <span>Let's play a game</span>
        </button>
        <button class="smriti-suggestion-chip shrink-0 px-space-md py-space-xs rounded-full bg-surface-container-low hover:bg-primary/10 hover:border-primary border border-surface-container font-label-md text-label-md text-on-surface transition-all flex items-center gap-space-2xs cursor-pointer" data-prompt="Show my favorite memories.">
          <span class="material-symbols-outlined text-[18px] text-primary">favorite</span>
          <span>Favorite memories</span>
        </button>
      </div>
    </div>

    <!-- 3. Conversation Stream Area -->
    <div class="bg-surface-container-lowest rounded-3xl p-space-lg lg:p-space-xl border border-surface-container shadow-sm min-h-[420px] max-h-[620px] overflow-y-auto space-y-space-md mb-space-lg" id="smritiMessageStream">
      ${history.length === 0 ? renderEmptyConversationState(patientFirstName) : history.map(msg => renderMessageBubble(msg)).join('')}
      
      ${isLoading ? `
        <div class="flex items-start gap-space-sm animate-fadeIn">
          <div class="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-sm">
            <span class="material-symbols-outlined text-[20px]">graphic_eq</span>
          </div>
          <div class="p-space-md rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-space-xs text-on-surface-variant">
            <span class="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
            <span class="w-2 h-2 rounded-full bg-primary animate-bounce delay-150"></span>
            <span class="w-2 h-2 rounded-full bg-primary animate-bounce delay-300"></span>
            <span class="font-body-md text-body-md ml-space-2xs">Smriti is recalling gently...</span>
          </div>
        </div>
      ` : ''}
    </div>

    <!-- 4. Large Elderly-Friendly Conversation Input Bar -->
    <form id="smritiChatForm" class="bg-surface-container-lowest rounded-2xl p-space-sm border-2 border-surface-container focus-within:border-primary transition-all shadow-md">
      <div class="flex items-center gap-space-sm">
        <button id="smritiVoiceInputBtn" class="w-12 h-12 rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95 cursor-pointer" type="button" aria-label="Speak your question">
          <span class="material-symbols-outlined text-[24px]">mic</span>
        </button>
        <label for="smritiChatInput" class="sr-only">Ask SmritiAI anything</label>
        <input id="smritiChatInput" 
               type="text" 
               placeholder="Ask Smriti anything about your family, day, or memories..." 
               class="flex-1 bg-transparent border-none outline-none font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/60 px-space-xs py-space-sm min-h-[48px]"
               autocomplete="off" />
        <button id="smritiSendBtn" class="min-h-[48px] px-space-lg rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg flex items-center gap-space-2xs shadow-sm transition-all active:scale-95 cursor-pointer shrink-0" type="submit">
          <span>Send</span>
          <span class="material-symbols-outlined text-[20px]">send</span>
        </button>
      </div>
    </form>
  </main>
  `;
}

function renderEmptyConversationState(patientFirstName) {
  return `
    <div class="flex flex-col items-center justify-center py-space-2xl text-center max-w-md mx-auto">
      <div class="w-20 h-20 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center mb-space-md shadow-md">
        <span class="material-symbols-outlined text-[42px]">spa</span>
      </div>
      <h2 class="font-headline-md text-headline-md text-on-surface font-bold mb-space-xs">
        Hello ${patientFirstName} 🌿
      </h2>
      <p class="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-space-lg">
        I am your personal memory companion. Ask me about your family, memories from past trips, or what is planned for today.
      </p>
      <div class="w-full space-y-space-xs text-left">
        <button class="smriti-empty-starter-btn w-full p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container transition-all flex items-center justify-between cursor-pointer" data-prompt="What is next on my day today?">
          <div class="flex items-center gap-space-sm">
            <span class="material-symbols-outlined text-primary text-[22px]">schedule</span>
            <span class="font-body-md text-body-md text-on-surface">“What is next on my day today?”</span>
          </div>
          <span class="material-symbols-outlined text-on-surface-variant text-[18px]">arrow_forward</span>
        </button>
        <button class="smriti-empty-starter-btn w-full p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container transition-all flex items-center justify-between cursor-pointer" data-prompt="Tell me about daughter Meera.">
          <div class="flex items-center gap-space-sm">
            <span class="material-symbols-outlined text-primary text-[22px]">face_3</span>
            <span class="font-body-md text-body-md text-on-surface">“Tell me about daughter Meera”</span>
          </div>
          <span class="material-symbols-outlined text-on-surface-variant text-[18px]">arrow_forward</span>
        </button>
        <button class="smriti-empty-starter-btn w-full p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container transition-all flex items-center justify-between cursor-pointer" data-prompt="Recommend a peaceful game for me.">
          <div class="flex items-center gap-space-sm">
            <span class="material-symbols-outlined text-primary text-[22px]">extension</span>
            <span class="font-body-md text-body-md text-on-surface">“Recommend a peaceful game for me”</span>
          </div>
          <span class="material-symbols-outlined text-on-surface-variant text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  `;
}

function renderMessageBubble(msg) {
  if (msg.role === 'user') {
    return `
      <div class="flex justify-end animate-fadeIn">
        <div class="max-w-xl rounded-2xl rounded-tr-sm bg-primary text-on-primary p-space-md shadow-sm font-body-lg text-body-lg">
          ${msg.text}
        </div>
      </div>
    `;
  }

  // Assistant Bubble
  return `
    <div class="flex items-start gap-space-sm animate-fadeIn">
      <div class="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-sm">
        <span class="material-symbols-outlined text-[20px]">graphic_eq</span>
      </div>
      <div class="max-w-2xl flex flex-col gap-space-xs">
        <div class="rounded-2xl rounded-tl-sm bg-surface-container-low border border-surface-container p-space-md text-on-surface shadow-sm font-body-lg text-body-lg leading-relaxed">
          <p class="mb-space-xs">${msg.text}</p>
          
          <!-- Audio Readout Button -->
          <div class="pt-space-2xs flex items-center gap-space-sm">
            <button class="smriti-hear-btn inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary font-label-md text-label-md transition-colors cursor-pointer" data-text="${encodeURIComponent(msg.spokenText || msg.text)}">
              <span class="material-symbols-outlined text-[18px]">volume_up</span>
              <span>Hear</span>
            </button>
            ${msg.actionRoute ? `
              <a href="#/${msg.actionRoute}" class="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-colors shadow-sm cursor-pointer">
                <span>${msg.actionLabel || 'View in MindMitra'}</span>
                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            ` : ''}
          </div>
        </div>

        <!-- Entity Attachment Embeds (Reusable Part 4 / Part 5 / Part 3 representations) -->
        ${renderEntityAttachment(msg)}
      </div>
    </div>
  `;
}

function renderEntityAttachment(msg) {
  if (msg.memory) {
    const mem = msg.memory;
    return `
      <div class="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container flex flex-col sm:flex-row items-center gap-space-md shadow-sm">
        <img src="${mem.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9quruDM6l-lR-7W24pE_W0NX2mY7MEiDYMl7ql2sZ_QRQ7D-NH9U4cKzj7UJEsP6HAz9UYIXzvWUwLSf9435pp57UHZoEfZpAQ5tcAOs3WdTs3FbMByQj6sgTUZHHPZ-FJGZaZb1Pq8fZYr8634oUGltshBb5QKGGDMKbefz5AzrIxUJXVoDWm-io97RbcNo_e9PL-KCRfocNbcDNjEieNZn-WLyl4RytmqvYfXuB7IpvmQvpZS8d'}" 
             alt="${mem.title}" 
             class="w-full sm:w-28 h-24 object-cover rounded-xl shrink-0" 
             onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuA9quruDM6l-lR-7W24pE_W0NX2mY7MEiDYMl7ql2sZ_QRQ7D-NH9U4cKzj7UJEsP6HAz9UYIXzvWUwLSf9435pp57UHZoEfZpAQ5tcAOs3WdTs3FbMByQj6sgTUZHHPZ-FJGZaZb1Pq8fZYr8634oUGltshBb5QKGGDMKbefz5AzrIxUJXVoDWm-io97RbcNo_e9PL-KCRfocNbcDNjEieNZn-WLyl4RytmqvYfXuB7IpvmQvpZS8d'">
        <div class="flex-1">
          <span class="font-caption text-caption text-primary font-semibold uppercase tracking-wider block">Living Archive Memory</span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${mem.title}</h3>
          <p class="font-body-md text-body-md text-on-surface-variant line-clamp-2 mt-1">${mem.description}</p>
        </div>
      </div>
    `;
  }

  if (msg.person) {
    const p = msg.person;
    return `
      <div class="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container flex items-center gap-space-md shadow-sm">
        <img src="${p.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw'}" 
             alt="${p.name}" 
             class="w-16 h-16 rounded-full object-cover shrink-0 ring-2 ring-primary/20">
        <div>
          <span class="font-caption text-caption text-primary font-semibold uppercase tracking-wider block">Family Circle</span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${p.name}</h3>
          <span class="font-label-md text-label-md text-secondary font-medium">${p.relationship}</span>
          <p class="font-caption text-caption text-on-surface-variant mt-1">${p.notes || ''}</p>
        </div>
      </div>
    `;
  }

  if (msg.place) {
    const pl = msg.place;
    return `
      <div class="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container flex items-center gap-space-md shadow-sm">
        <div class="w-12 h-12 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[28px]">location_on</span>
        </div>
        <div>
          <span class="font-caption text-caption text-tertiary font-semibold uppercase tracking-wider block">Sacred Sanctuary</span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${pl.name}</h3>
          <span class="font-caption text-caption text-on-surface-variant">${pl.region || ''} • ${pl.description || ''}</span>
        </div>
      </div>
    `;
  }

  if (msg.activity) {
    const act = msg.activity;
    return `
      <div class="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-sm">
        <div class="flex items-center gap-space-md">
          <div class="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[28px]">${act.icon || 'psychology'}</span>
          </div>
          <div>
            <span class="font-caption text-caption text-primary font-semibold uppercase tracking-wider block">${act.category} • Gentle Activity</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${act.name}</h3>
            <span class="font-caption text-caption text-on-surface-variant">${act.duration || '5 mins'} • ${act.comfort || 'Serene'} pace</span>
          </div>
        </div>
        <a href="#/activities/${act.slug}" class="min-h-[44px] px-space-lg rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg flex items-center gap-space-2xs transition-all shadow-sm shrink-0">
          <span>Start Activity</span>
          <span class="material-symbols-outlined text-[18px]">play_arrow</span>
        </a>
      </div>
    `;
  }

  if (msg.reminder) {
    const rem = msg.reminder;
    return `
      <div class="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container flex items-center justify-between gap-space-md shadow-sm">
        <div class="flex items-center gap-space-md">
          <div class="w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[24px]">schedule</span>
          </div>
          <div>
            <span class="font-caption text-caption text-secondary font-semibold uppercase tracking-wider block">Upcoming Care Routine</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${rem.title}</h3>
            <span class="font-body-md text-body-md text-on-surface-variant">Scheduled for ${rem.time}</span>
          </div>
        </div>
        <a href="#/my-day" class="min-h-[40px] px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-space-2xs transition-colors shrink-0">
          <span>View Day</span>
          <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        </a>
      </div>
    `;
  }

  return '';
}

export function attachSmritiAIEvents(onRerender) {
  const form = document.getElementById('smritiChatForm');
  const input = document.getElementById('smritiChatInput');
  const voiceBtn = document.getElementById('smritiVoiceInputBtn');
  const clearBtn = document.getElementById('smritiClearChatBtn');
  const promptChips = document.querySelectorAll('.smriti-suggestion-chip, .smriti-empty-starter-btn');
  const hearBtns = document.querySelectorAll('.smriti-hear-btn');

  const scrollToBottom = () => {
    const stream = document.getElementById('smritiMessageStream');
    if (stream) stream.scrollTop = stream.scrollHeight;
  };

  if (form && input) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      if (onRerender) onRerender();
      await smritiAIService.sendMessage(text, { speak: false });
      if (onRerender) onRerender();
      setTimeout(scrollToBottom, 50);
    });
  }

  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      if (voiceService.isSpeaking()) {
        voiceService.stop();
        showToast('Speech stopped', 'stop');
        return;
      }

      if (voiceService.isListening()) {
        voiceService.stopListening();
        voiceBtn.classList.remove('bg-error', 'animate-pulse');
        voiceBtn.classList.add('bg-secondary');
        showToast('Listening paused.', 'mic_none');
        return;
      }

      voiceBtn.classList.remove('bg-secondary');
      voiceBtn.classList.add('bg-error', 'animate-pulse');
      showToast(i18nService.t('voice.listeningNow'), 'mic');

      const success = voiceService.startListening({
        lang: i18nService.getLanguage(),
        onInterim: (text) => {
          if (input) input.value = text;
        },
        onResult: (text) => {
          if (input) input.value = text;
        },
        onEnd: () => {
          voiceBtn.classList.remove('bg-error', 'animate-pulse');
          voiceBtn.classList.add('bg-secondary');
        },
        onError: (err) => {
          voiceBtn.classList.remove('bg-error', 'animate-pulse');
          voiceBtn.classList.add('bg-secondary');
          showToast(err.message || i18nService.t('smriti.micUnavailable'), 'info');
        }
      });

      if (!success) {
        voiceBtn.classList.remove('bg-error', 'animate-pulse');
        voiceBtn.classList.add('bg-secondary');
        showToast(i18nService.t('smriti.micUnavailable'), 'info');
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      smritiAIService.clearConversation();
      voiceService.stop();
      showToast('Fresh conversation started.', 'refresh');
      if (onRerender) onRerender();
    });
  }

  promptChips.forEach(chip => {
    chip.addEventListener('click', async () => {
      const prompt = chip.getAttribute('data-prompt');
      if (!prompt) return;
      if (onRerender) onRerender();
      await smritiAIService.sendMessage(prompt, { speak: false });
      if (onRerender) onRerender();
      setTimeout(scrollToBottom, 50);
    });
  });

  hearBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (voiceService.isSpeaking()) {
        voiceService.stop();
        showToast('Speech stopped', 'stop');
        return;
      }
      const rawText = btn.getAttribute('data-text');
      if (!rawText) return;
      const text = decodeURIComponent(rawText);
      voiceService.speak(text, { lang: i18nService.getLanguage() });
      showToast('Playing spoken response', 'volume_up');
    });
  });

  scrollToBottom();
}
