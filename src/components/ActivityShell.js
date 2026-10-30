// Reusable Cognitive Activity Shell Component with 20 Dedicated Interactive Mini-Games
import { store } from '../state/store.js';
import { activityEngine } from '../services/activityEngine.js';
import { voiceService } from '../services/voiceService.js';
import { i18nService } from '../services/i18nService.js';
import { showToast } from '../components/Toast.js';

let shellState = {
  showHint: false,
  showPauseModal: false,
  showExitModal: false,
  lastFeedback: null,
  isAudioPlaying: false
};

export function renderActivityShell(activity) {
  const act = activity || store.getActiveActivity();
  const sessionState = activityEngine.getSessionState();
  const session = sessionState.session;
  const isCompleted = act?.completed || (session?.activityId === act?.id && session?.status === 'completed');
  const lastSummary = (session?.activityId === act?.id ? sessionState.lastSummary : null) || activityEngine.getLastSessionSummary();

  const patient = store.getState().currentUser || store.getState().profile || { name: 'Asha Devi' };
  const patientName = patient?.name ? patient.name.split(' ')[0] : 'Asha';

  if (isCompleted && lastSummary) {
    return renderResultsScreen(act, lastSummary, patientName);
  }

  const currentStep = act?.currentStep || session?.currentStep || 1;
  const totalSteps = act?.totalSteps || session?.totalSteps || 3;

  return `
    <div class="w-full bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden flex flex-col border border-surface-container" id="mindmitraActivityShell">
      <!-- 1. Shell Top Orientation Header -->
      <div class="px-space-lg lg:px-space-xl py-space-md bg-surface-container flex flex-wrap items-center justify-between gap-space-md border-b border-surface-container">
        <div class="flex items-center gap-space-md">
          <button id="shellExitBtn" class="inline-flex items-center gap-space-2xs px-space-md py-space-xs rounded-lg bg-surface-container-lowest text-on-surface hover:text-primary transition-all font-label-md text-label-md shadow-sm cursor-pointer" type="button" aria-label="Exit current activity">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Exit</span>
          </button>
          <div class="flex items-center gap-space-xs">
            <span class="px-space-sm py-space-2xs rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md uppercase tracking-wider font-semibold">
              ${act.category || 'REMEMBER'}
            </span>
            <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">${act.name || act.title}</span>
          </div>
        </div>

        <!-- Progress Stepper, Spoken Instructions & Pause -->
        <div class="flex items-center gap-space-sm flex-wrap">
          <button id="shellHearInstructionsBtn" class="inline-flex items-center gap-space-2xs px-space-sm py-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container-high text-primary font-label-md text-label-md transition-colors cursor-pointer shadow-sm" type="button" title="Hear Instructions Spoken Aloud">
            <span class="material-symbols-outlined text-[18px]">volume_up</span>
            <span>${i18nService.t('activities.hearInstructions')}</span>
          </button>
          <button id="shellPauseBtn" class="inline-flex items-center gap-space-2xs px-space-sm py-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-md transition-colors cursor-pointer" type="button" title="Pause activity">
            <span class="material-symbols-outlined text-[20px]">pause</span>
            <span>Pause</span>
          </button>
          <span class="font-label-md text-label-md text-on-surface-variant font-medium">Step ${currentStep} of ${totalSteps}</span>
          <div aria-hidden="true" class="flex items-center gap-space-xs">
            ${Array.from({ length: totalSteps }).map((_, idx) => `
              <span class="w-3 h-3 rounded-full ${idx < currentStep ? 'bg-primary' : 'bg-surface-container-highest'} transition-colors"></span>
            `).join('')}
          </div>
          <span class="font-caption text-caption text-on-surface-variant pl-space-xs hidden sm:inline">${act.duration || '5 mins'} • Gentle Pace</span>
        </div>
      </div>

      <!-- 2. Shell Core Interactive Canvas -->
      <div class="p-space-lg lg:p-space-2xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        <!-- Media / Memory Trigger Artifact -->
        <div class="lg:col-span-5 flex flex-col gap-space-sm">
          <div class="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md bg-surface-container">
            <img class="w-full h-full object-cover" 
                 src="${act.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9quruDM6l-lR-7W24pE_W0NX2mY7MEiDYMl7ql2sZ_QRQ7D-NH9U4cKzj7UJEsP6HAz9UYIXzvWUwLSf9435pp57UHZoEfZpAQ5tcAOs3WdTs3FbMByQj6sgTUZHHPZ-FJGZaZb1Pq8fZYr8634oUGltshBb5QKGGDMKbefz5AzrIxUJXVoDWm-io97RbcNo_e9PL-KCRfocNbcDNjEieNZn-WLyl4RytmqvYfXuB7IpvmQvpZS8d'}" 
                 alt="Photograph for ${act.name}"
                 onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuA9quruDM6l-lR-7W24pE_W0NX2mY7MEiDYMl7ql2sZ_QRQ7D-NH9U4cKzj7UJEsP6HAz9UYIXzvWUwLSf9435pp57UHZoEfZpAQ5tcAOs3WdTs3FbMByQj6sgTUZHHPZ-FJGZaZb1Pq8fZYr8634oUGltshBb5QKGGDMKbefz5AzrIxUJXVoDWm-io97RbcNo_e9PL-KCRfocNbcDNjEieNZn-WLyl4RytmqvYfXuB7IpvmQvpZS8d'">
            <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/40 to-transparent p-space-md text-inverse-on-surface">
              <span class="font-label-md text-label-md flex items-center gap-space-2xs">
                <span class="material-symbols-outlined text-[18px]">location_on</span>
                ${act.locationStamp || 'Living Archive'}
              </span>
              <span class="font-caption text-caption text-inverse-on-surface/80 block mt-space-2xs">
                ${act.contextStamp || 'Preserving Personal Memories'}
              </span>
            </div>
          </div>
          <div class="flex items-center justify-between px-space-xs text-on-surface-variant font-caption text-caption">
            <span class="flex items-center gap-space-2xs">
              <span class="material-symbols-outlined text-[16px] text-tertiary">spa</span>
              ${act.instructions || 'Take your time. No rush.'}
            </span>
            <span>${act.albumRef || 'MM-CANONICAL'}</span>
          </div>
        </div>

        <!-- Interactive Mini-Game Canvas & Response Area -->
        <div class="lg:col-span-7 flex flex-col">
          <div class="mb-space-md">
            <div class="flex items-center gap-space-2xs text-secondary font-label-md text-label-md uppercase tracking-wider mb-space-2xs font-semibold">
              <span class="material-symbols-outlined text-[20px]">${act.icon || 'psychology'}</span>
              <span>${act.category} • Gentle Practice</span>
            </div>
            <h2 class="font-headline-lg text-headline-lg text-on-surface leading-snug" id="shellQuestionTitle">
              ${act.question || act.subtitle}
            </h2>
          </div>

          <!-- Dynamic Interaction Canvas based on activityType -->
          <div class="minigame-canvas-container my-space-sm">
            ${renderMiniGameCanvas(act, sessionState)}
          </div>

          <!-- Supporting Reflection Q&A (Retained from base implementation) -->
          <div class="mt-space-md pt-space-md border-t border-surface-container">
            <span class="font-caption text-caption text-on-surface-variant uppercase font-semibold block mb-space-xs">
              Reflection Choice
            </span>
            ${renderChoiceOptions(act)}
          </div>

          <!-- Gentle Hint Card -->
          ${shellState.showHint ? `
            <div class="mt-space-md p-space-md rounded-xl bg-tertiary-fixed/30 border border-tertiary-fixed text-on-tertiary-fixed flex items-start gap-space-xs transition-all animate-fadeIn">
              <span class="material-symbols-outlined text-tertiary text-[22px] shrink-0">lightbulb</span>
              <div class="flex flex-col">
                <p class="font-body-md text-body-md">
                  <strong class="font-semibold">Gentle Hint:</strong> ${act.hint || 'Think of what feels most familiar and comforting.'}
                </p>
              </div>
            </div>
          ` : ''}

          <!-- Feedback notification -->
          ${shellState.lastFeedback ? `
            <div class="mt-space-md p-space-md rounded-xl bg-primary-fixed/40 border border-primary-fixed text-on-primary-fixed flex items-start gap-space-xs transition-all">
              <span class="material-symbols-outlined text-primary text-[22px] shrink-0">sentiment_satisfied</span>
              <p class="font-body-md text-body-md font-medium">${shellState.lastFeedback}</p>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- 3. Shell Bottom Progression & Accessibility Bar -->
      <div class="px-space-lg lg:px-space-xl py-space-md bg-surface-container-low flex flex-wrap items-center justify-between gap-space-md border-t border-surface-container">
        <div class="flex items-center gap-space-sm flex-wrap">
          <button id="shellToggleHintBtn" class="min-h-[56px] px-space-lg rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-lg text-label-lg flex items-center gap-space-xs shadow-sm transition-all active:scale-95 cursor-pointer" type="button">
            <span class="material-symbols-outlined text-[22px] text-tertiary">lightbulb</span>
            <span>${shellState.showHint ? 'Hide Hint' : 'Need a gentle hint?'}</span>
          </button>
          <button id="shellListenBtn" class="min-h-[56px] px-space-lg rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 font-label-lg text-label-lg flex items-center gap-space-xs shadow-sm transition-all active:scale-95 cursor-pointer" type="button">
            <span class="material-symbols-outlined text-[22px]">volume_up</span>
            <span id="shellListenLabel">Listen to question</span>
          </button>
          <button id="shellSkipBtn" class="min-h-[56px] px-space-md rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md flex items-center gap-space-2xs cursor-pointer transition-colors" type="button" title="Skip to next step without penalty">
            <span class="material-symbols-outlined text-[20px]">skip_next</span>
            <span>Skip Step</span>
          </button>
        </div>

        <div class="flex items-center gap-space-sm w-full sm:w-auto justify-end">
          <span class="font-caption text-caption text-on-surface-variant mr-space-xs hidden md:inline">Great focus, ${patientName}. Take your time.</span>
          <button id="shellContinueBtn" class="w-full sm:w-auto min-h-[56px] px-space-xl rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-md transition-all active:scale-95 cursor-pointer" type="button">
            <span>Continue</span>
            <span class="material-symbols-outlined text-[22px]">arrow_forward</span>
          </button>
        </div>
      </div>

      <!-- Modals (Pause & Exit confirmation) -->
      ${shellState.showPauseModal ? renderPauseModal() : ''}
      ${shellState.showExitModal ? renderExitModal() : ''}
    </div>
  `;
}

function renderMiniGameCanvas(act, sessionState) {
  const modeState = sessionState.modeState;
  if (!modeState) return '';

  // 1. Memory Match (Card pairing grid)
  if (modeState.type === 'match') {
    return `
      <div class="space-y-space-sm bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <div class="flex items-center justify-between">
          <span class="font-label-md text-label-md font-bold text-on-surface">Card Pairing (${modeState.matchesFound} of ${modeState.totalPairs} matched)</span>
          <button id="matchHintPeekBtn" class="px-space-sm py-1 text-caption font-caption bg-tertiary-fixed/40 text-on-tertiary-fixed rounded-lg hover:bg-tertiary-fixed transition-colors cursor-pointer flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">visibility</span> Peek at a pair
          </button>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-space-sm" role="region" aria-label="Memory match card grid">
          ${modeState.deck.map(card => `
            <button class="match-card-btn aspect-square p-space-sm rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              card.matched ? 'bg-tertiary-fixed/30 border-2 border-tertiary text-on-tertiary-fixed scale-95' :
              card.flipped ? 'bg-primary-fixed text-on-primary-fixed shadow-md ring-2 ring-primary' :
              'bg-surface-container-highest hover:bg-surface-container-high text-on-surface shadow-sm'
            }" data-card-id="${card.id}" type="button" ${card.matched ? 'disabled' : ''}>
              ${card.flipped || card.matched ? `
                <span class="material-symbols-outlined text-[28px] mb-1">${card.icon || 'star'}</span>
                <span class="font-label-md text-label-md font-bold">${card.title}</span>
                ${card.matched ? '<span class="material-symbols-outlined text-[16px] text-tertiary mt-1">check_circle</span>' : ''}
              ` : `
                <span class="material-symbols-outlined text-[32px] text-on-surface-variant">psychology</span>
                <span class="font-caption text-caption text-on-surface-variant mt-1">Tap to flip</span>
              `}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 2. Personal Memory Recall (Clue Investigation)
  if (modeState.type === 'clue-recall') {
    return `
      <div class="space-y-space-sm bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <div class="flex items-center justify-between">
          <span class="font-label-md text-label-md font-bold text-on-surface">Inspect Memory Clues (${modeState.inspectedCount} of ${modeState.clues.length} revealed)</span>
          <span class="font-caption text-caption text-on-surface-variant">Tap each clue card</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          ${modeState.clues.map(c => `
            <button class="clue-card-btn p-space-md rounded-xl text-left border transition-all cursor-pointer ${
              c.inspected ? 'bg-primary-fixed/20 border-primary shadow-sm' : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container-high'
            }" data-clue-id="${c.id}" type="button">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined ${c.inspected ? 'text-primary' : 'text-on-surface-variant'} text-[24px]">${c.icon}</span>
                <div>
                  <span class="font-label-md text-label-md font-bold text-on-surface block">${c.label}</span>
                  <span class="font-caption text-caption ${c.inspected ? 'text-on-surface font-medium' : 'text-on-surface-variant'}">
                    ${c.inspected ? c.detail : 'Tap to uncover detail'}
                  </span>
                </div>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 3. People & Relationships (Tap-to-connect matching)
  if (modeState.type === 'relation-match') {
    return `
      <div class="space-y-space-sm bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <span class="font-label-md text-label-md font-bold text-on-surface block">Connect Family Member to Loving Role:</span>
        <div class="space-y-space-xs">
          ${modeState.people.map(p => {
            const isConnected = modeState.connectedPairs.includes(p.id);
            const isSelected = modeState.selectedPersonId === p.id;
            return `
              <div class="p-space-sm rounded-xl border flex items-center justify-between gap-space-sm transition-all ${
                isConnected ? 'bg-tertiary-fixed/20 border-tertiary' : isSelected ? 'bg-primary-fixed/30 border-primary ring-2 ring-primary/40' : 'bg-surface-container-lowest border-surface-container'
              }">
                <button class="select-person-btn flex items-center gap-space-sm text-left flex-1 cursor-pointer" data-person-id="${p.id}" type="button">
                  <span class="material-symbols-outlined text-primary text-[24px]">${p.icon || 'person'}</span>
                  <div>
                    <span class="font-label-lg text-label-lg font-bold text-on-surface">${p.name}</span>
                    <span class="font-caption text-caption text-on-surface-variant block">${isConnected ? p.role : 'Tap to select'}</span>
                  </div>
                </button>
                ${isConnected ? `
                  <span class="px-space-sm py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-bold flex items-center gap-1">
                    <span class="material-symbols-outlined text-[16px]">favorite</span> Connected
                  </span>
                ` : `
                  <button class="connect-role-btn px-space-md py-space-xs rounded-lg bg-primary text-on-primary text-label-md font-label-md hover:bg-primary-container cursor-pointer transition-colors shadow-sm" data-person-id="${p.id}" data-role="${p.role}" type="button">
                    Connect Bond
                  </button>
                `}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // 4. Photo Story (Story narrative blocks)
  if (modeState.type === 'story-builder') {
    return `
      <div class="space-y-space-sm bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <span class="font-label-md text-label-md font-bold text-on-surface block">Story Moments (${modeState.placedTiles.length} of ${modeState.totalTiles} placed in timeline)</span>
        <div class="space-y-space-xs">
          ${modeState.tiles.map(t => {
            const isPlaced = modeState.placedTiles.some(pt => pt.id === t.id);
            return `
              <button class="place-story-tile-btn w-full p-space-md rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                isPlaced ? 'bg-tertiary-fixed/20 border-tertiary text-on-tertiary-fixed' : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container'
              }" data-tile-id="${t.id}" type="button">
                <div class="flex items-center gap-space-sm">
                  <span class="material-symbols-outlined text-primary text-[24px]">${t.icon}</span>
                  <span class="font-body-md text-body-md font-medium text-on-surface">${t.title}</span>
                </div>
                ${isPlaced ? '<span class="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>' : '<span class="font-caption text-caption text-primary font-bold">Tap to add</span>'}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // 5. Memory Reconstruction (Keepsake puzzle assembly)
  if (modeState.type === 'puzzle-assembly') {
    return `
      <div class="space-y-space-sm bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <span class="font-label-md text-label-md font-bold text-on-surface block">Courtyard Keepsake Assembly (${modeState.slottedCount} of ${modeState.slots.length} assembled)</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          ${modeState.slots.map(s => `
            <button class="slot-puzzle-btn p-space-md rounded-xl text-left border transition-all cursor-pointer ${
              s.slotted ? 'bg-tertiary-fixed/20 border-tertiary ring-2 ring-tertiary/40 shadow-sm' : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container'
            }" data-slot-id="${s.id}" type="button">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined ${s.slotted ? 'text-tertiary' : 'text-on-surface-variant'} text-[28px]">${s.icon}</span>
                <div>
                  <span class="font-caption text-caption text-on-surface-variant uppercase font-semibold block">${s.slotLabel}</span>
                  <span class="font-body-md text-body-md font-bold text-on-surface">${s.title}</span>
                </div>
              </div>
              ${s.slotted ? '<span class="material-symbols-outlined text-tertiary text-[18px] mt-2 block">verified</span>' : '<span class="font-caption text-caption text-primary mt-1 block">Tap to assemble</span>'}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 6. Attention Hunt (Visual search target tapping)
  if (modeState.type === 'hunt') {
    return `
      <div class="space-y-space-sm bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <div class="flex items-center justify-between">
          <span class="font-label-md text-label-md font-bold text-on-surface">Harvest Token Search (${modeState.foundCount} of ${modeState.targetCount} found)</span>
          <span class="font-caption text-caption text-on-surface-variant">Tap target tokens</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
          ${modeState.items.map(item => `
            <button class="hunt-item-btn p-space-md rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              item.found ? 'bg-tertiary-fixed text-on-tertiary-fixed ring-2 ring-tertiary shadow-md scale-95' : 'bg-surface-container-lowest border border-surface-container hover:bg-surface-container'
            }" data-item-id="${item.id}" type="button">
              <span class="material-symbols-outlined text-[32px] mb-1 ${item.found ? 'text-tertiary' : 'text-primary'}">${item.icon || 'circle'}</span>
              <span class="font-label-md text-label-md font-medium text-on-surface">${item.title}</span>
              ${item.found ? '<span class="material-symbols-outlined text-[18px] text-tertiary mt-1">check_circle</span>' : ''}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 7. Familiar Object Recognition (Object catalog card identification)
  if (modeState.type === 'object-catalog') {
    return `
      <div class="space-y-space-sm bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <span class="font-label-md text-label-md font-bold text-on-surface block">Select the requested traditional heirloom:</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          ${modeState.objects.map(obj => `
            <button class="identify-obj-btn p-space-md rounded-xl text-left border transition-all cursor-pointer ${
              modeState.identifiedId === obj.id ? 'bg-primary-fixed/30 border-primary ring-2 ring-primary/40 shadow-sm' : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container'
            }" data-obj-id="${obj.id}" type="button">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-primary text-[32px]">${obj.icon}</span>
                <div>
                  <span class="font-body-lg text-body-lg font-bold text-on-surface block">${obj.title}</span>
                  <span class="font-caption text-caption text-on-surface-variant">${obj.desc}</span>
                </div>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 8. Sound Recognition (Sound studio with audio wave)
  if (modeState.type === 'sound-studio') {
    return `
      <div class="space-y-space-sm bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <div class="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container flex items-center justify-between gap-space-md">
          <div class="flex items-center gap-space-sm">
            <span class="material-symbols-outlined text-primary text-[32px] animate-pulse">graphic_eq</span>
            <div>
              <p class="font-label-lg text-label-lg font-bold text-on-surface">Peaceful Audio Listening</p>
              <p class="font-caption text-caption text-on-surface-variant">Tap play, listen calmly, then select the sound</p>
            </div>
          </div>
          <button id="shellPlayAudioBtn" class="px-space-md py-space-xs rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md flex items-center gap-space-2xs cursor-pointer shadow-sm" type="button">
            <span class="material-symbols-outlined text-[20px]">play_arrow</span>
            <span>Play Peaceful Sound</span>
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-space-sm">
          ${modeState.sources.map(src => `
            <button class="sound-source-btn p-space-md rounded-xl text-left border transition-all cursor-pointer ${
              modeState.selectedSourceId === src.id ? 'bg-primary-fixed/30 border-primary ring-2 ring-primary/40' : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container'
            }" data-source-id="${src.id}" type="button">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-secondary text-[24px]">${src.icon}</span>
                <div>
                  <span class="font-body-md text-body-md font-bold text-on-surface block">${src.title}</span>
                  <span class="font-caption text-caption text-on-surface-variant">${src.description}</span>
                </div>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 9. Pattern Predictor (Visual rhythm track)
  if (modeState.type === 'pattern-puzzle') {
    return `
      <div class="space-y-space-md bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <span class="font-label-md text-label-md font-bold text-on-surface block">Observe the handloom color rhythm:</span>
        <div class="flex items-center justify-center gap-space-sm flex-wrap py-space-sm">
          ${modeState.sequence.map((pat, idx) => `
            <div class="flex items-center gap-space-xs">
              <div class="w-14 h-14 rounded-2xl ${pat.colorClass || 'bg-surface-container'} border border-surface-container shadow-sm flex flex-col items-center justify-center ${pat.isTarget ? 'ring-4 ring-primary animate-pulse bg-primary/20' : ''}">
                <span class="material-symbols-outlined text-[24px] ${pat.isTarget ? 'text-primary' : 'text-white'}">${pat.icon}</span>
                <span class="text-[10px] font-bold ${pat.isTarget ? 'text-primary' : 'text-white'}">${pat.label}</span>
              </div>
              ${idx < modeState.sequence.length - 1 ? '<span class="material-symbols-outlined text-[18px] text-on-surface-variant">arrow_forward</span>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 10. Object Sorting (Room buckets)
  if (modeState.type === 'bucket-sort') {
    return `
      <div class="space-y-space-md bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <span class="font-label-md text-label-md font-bold text-on-surface block">Sort Items into Household Rooms (${modeState.placedCount} of ${modeState.totalItems} placed):</span>
        <div class="space-y-space-xs">
          ${modeState.items.map(item => `
            <div class="p-space-sm rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-primary text-[22px]">${item.icon || 'inventory_2'}</span>
                <span class="font-body-md text-body-md font-medium text-on-surface">${item.title}</span>
              </div>
              <div class="flex items-center gap-space-xs flex-wrap">
                ${modeState.categories.map(cat => `
                  <button class="sort-assign-btn px-space-sm py-1 rounded-lg text-caption font-caption cursor-pointer transition-colors ${
                    item.userBucket === cat.name ? 'bg-primary text-on-primary font-bold shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }" data-item-id="${item.id}" data-bucket="${cat.name}" type="button">
                    ${cat.name}
                  </button>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 11, 12, 13: Sequence Reordering (Timeline, Story, Recipe)
  if (modeState.currentOrder) {
    return `
      <div class="space-y-space-sm bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <span class="font-label-md text-label-md font-bold text-on-surface block">Arrange in order using up and down buttons:</span>
        <div class="space-y-space-xs">
          ${modeState.currentOrder.map((step, idx) => `
            <div class="flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm">
              <div class="flex items-center gap-space-md">
                <span class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold font-label-md">${idx + 1}</span>
                <span class="font-body-md text-body-md text-on-surface font-medium">${step.title}</span>
              </div>
              <div class="flex items-center gap-space-2xs">
                <button class="seq-up-btn p-space-xs rounded-lg hover:bg-surface-container text-on-surface cursor-pointer" data-idx="${idx}" type="button" title="Move Up" ${idx === 0 ? 'disabled class="opacity-30"' : ''}>
                  <span class="material-symbols-outlined text-[22px]">arrow_upward</span>
                </button>
                <button class="seq-down-btn p-space-xs rounded-lg hover:bg-surface-container text-on-surface cursor-pointer" data-idx="${idx}" type="button" title="Move Down" ${idx === modeState.currentOrder.length - 1 ? 'disabled class="opacity-30"' : ''}>
                  <span class="material-symbols-outlined text-[22px]">arrow_downward</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 14. Shopping Memory (Memo List -> Market Shelf -> Basket)
  if (modeState.type === 'shopping-basket') {
    if (modeState.phase === 'memo') {
      return `
        <div class="space-y-space-md bg-surface-container-low p-space-md rounded-2xl border border-surface-container text-center">
          <span class="font-label-lg text-label-lg font-bold text-primary block">Step 1: Memorize This Morning Market List</span>
          <div class="p-space-lg bg-surface-container-lowest rounded-xl border border-primary/30 max-w-sm mx-auto shadow-sm space-y-space-xs text-left">
            ${modeState.shoppingList.map(item => `
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-tertiary text-[20px]">${item.icon}</span>
                <span class="font-body-lg text-body-lg font-medium text-on-surface">${item.title}</span>
              </div>
            `).join('')}
          </div>
          <button id="readyToShopBtn" class="px-space-xl py-space-md bg-primary text-on-primary rounded-xl font-label-lg text-label-lg hover:bg-primary-container cursor-pointer shadow-md transition-all">
            I've Memorized the List! Go to Market →
          </button>
        </div>
      `;
    }

    return `
      <div class="space-y-space-sm bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <div class="flex items-center justify-between">
          <span class="font-label-md text-label-md font-bold text-on-surface">Market Shelf (Basket: ${modeState.basket.length} of ${modeState.targetCount})</span>
          <span class="font-caption text-caption text-tertiary font-bold flex items-center gap-1">
            <span class="material-symbols-outlined text-[18px]">shopping_basket</span> Shopping Basket
          </span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
          ${modeState.marketShelf.map(item => `
            <button class="shopping-item-btn p-space-md rounded-xl text-center border transition-all cursor-pointer ${
              item.collected ? 'bg-tertiary-fixed/30 border-tertiary ring-2 ring-tertiary scale-95' : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container'
            }" data-item-id="${item.id}" type="button" ${item.collected ? 'disabled' : ''}>
              <span class="material-symbols-outlined text-primary text-[32px] mb-1">${item.icon}</span>
              <span class="font-label-md text-label-md font-bold text-on-surface block">${item.title}</span>
              ${item.collected ? '<span class="material-symbols-outlined text-tertiary text-[18px] mt-1">check_circle</span>' : '<span class="font-caption text-caption text-on-surface-variant">Tap for basket</span>'}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 15. Memory Journey (Scenic trail)
  if (modeState.type === 'scenic-trail') {
    return `
      <div class="space-y-space-sm bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <span class="font-label-md text-label-md font-bold text-on-surface block">Tap each scenic waypoint along the memory trail:</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          ${modeState.waypoints.map(wp => `
            <button class="waypoint-btn p-space-md rounded-xl text-left border transition-all cursor-pointer ${
              wp.visited ? 'bg-primary-fixed/20 border-primary ring-2 ring-primary/40 shadow-sm' : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container'
            }" data-wp-id="${wp.id}" type="button">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-primary text-[28px]">${wp.icon}</span>
                <div>
                  <span class="font-label-lg text-label-lg font-bold text-on-surface block">${wp.title}</span>
                  <span class="font-caption text-caption text-on-surface-variant">${wp.location} • ${wp.sensory}</span>
                </div>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 16. Place Explorer (Sanctuary mapping)
  if (modeState.type === 'sanctuary-mapping') {
    return `
      <div class="space-y-space-sm bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <span class="font-label-md text-label-md font-bold text-on-surface block">Explore Ancestral Sanctuaries:</span>
        <div class="space-y-space-xs">
          ${modeState.sanctuaries.map(sc => `
            <button class="sanctuary-btn w-full p-space-md rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
              sc.inspected ? 'bg-tertiary-fixed/20 border-tertiary' : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container'
            }" data-sc-id="${sc.id}" type="button">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-primary text-[24px]">${sc.icon}</span>
                <div>
                  <span class="font-body-md text-body-md font-bold text-on-surface block">${sc.name}</span>
                  <span class="font-caption text-caption text-on-surface-variant">${sc.memory}</span>
                </div>
              </div>
              ${sc.inspected ? '<span class="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>' : '<span class="font-caption text-caption text-primary">Tap to inspect</span>'}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 17. Life Simulation (Everyday scenario comfort selection)
  if (modeState.type === 'scenario-select') {
    return `
      <div class="space-y-space-sm bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <span class="font-label-md text-label-md font-bold text-on-surface block">A monsoon rain is falling outside. Tap items that bring warm comfort:</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          ${modeState.items.map(item => `
            <button class="scenario-item-btn p-space-md rounded-xl text-left border transition-all cursor-pointer ${
              item.selected ? 'bg-primary-fixed/30 border-primary ring-2 ring-primary/40 shadow-sm' : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container'
            }" data-item-id="${item.id}" type="button">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-space-sm">
                  <span class="material-symbols-outlined text-primary text-[24px]">${item.icon}</span>
                  <span class="font-body-md text-body-md font-medium text-on-surface">${item.title}</span>
                </div>
                ${item.selected ? '<span class="material-symbols-outlined text-primary text-[20px]">check</span>' : ''}
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 18. Voice Recall (Voice message player + speech recognition + voice memory save)
  if (modeState.type === 'voice-studio') {
    const isSaved = modeState.isSaved;
    const currentTranscript = modeState.transcript || '';
    return `
      <div class="space-y-space-md bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <!-- Family Audio Message / Prompt -->
        <div class="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container flex items-center justify-between gap-space-md">
          <div class="flex items-center gap-space-sm">
            <span class="material-symbols-outlined text-primary text-[32px]">record_voice_over</span>
            <div>
              <p class="font-label-lg text-label-lg font-bold text-on-surface">Audio Message / Memory Prompt</p>
              <p class="font-caption text-caption text-on-surface-variant">"${modeState.voiceNote?.transcript || 'A warm message from loved ones'}"</p>
            </div>
          </div>
          <button id="shellPlayVoiceBtn" class="px-space-md py-space-xs rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 font-label-md text-label-md flex items-center gap-space-2xs cursor-pointer shadow-sm" type="button">
            <span class="material-symbols-outlined text-[20px]">volume_up</span>
            <span>Listen</span>
          </button>
        </div>

        <!-- Voice Recognition & Recording Studio -->
        <div class="p-space-md bg-surface-container-lowest rounded-xl border border-surface-container flex flex-col gap-space-md">
          <div class="flex items-center justify-center">
            <button id="voiceRecordBtn" class="min-h-[52px] px-space-xl py-space-sm rounded-full font-label-md text-label-md flex items-center gap-space-xs transition-all cursor-pointer ${
              modeState.isRecording ? 'bg-error text-on-error animate-pulse shadow-md' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
            }" type="button" aria-label="Record memory via voice">
              <span class="material-symbols-outlined text-[24px]">${modeState.isRecording ? 'mic' : 'mic_none'}</span>
              <span class="font-semibold">${modeState.isRecording ? 'Listening... Speak your recollection now' : '🎙️ Tap to Speak Your Memory'}</span>
            </button>
          </div>

          <!-- Live Editable Transcript Area -->
          <div class="space-y-space-2xs">
            <div class="flex items-center justify-between">
              <label for="voiceTranscriptInput" class="font-label-md text-label-md text-on-surface font-semibold">Your Spoken Memory Transcript:</label>
              <span class="font-caption text-caption text-on-surface-variant">Touch or type anytime to edit</span>
            </div>
            <textarea id="voiceTranscriptInput" rows="3" class="w-full p-space-sm rounded-xl border border-surface-container bg-surface text-on-surface font-body-md text-body-md focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Your spoken words will appear here. You can also type your memory directly...">${currentTranscript}</textarea>
          </div>

          <!-- Save to Personal Memory World Action -->
          <div class="flex items-center justify-between pt-space-xs border-t border-surface-container flex-wrap gap-space-xs">
            <span class="font-caption text-caption text-on-surface-variant">
              ${isSaved ? '✅ Saved to your Personal Memory World' : 'Review and confirm to save this memory.'}
            </span>
            <button id="saveVoiceMemoryBtn" class="px-space-lg py-space-xs rounded-xl ${isSaved ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-primary text-on-primary hover:bg-primary-container'} font-label-md text-label-md font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm" type="button">
              <span class="material-symbols-outlined text-[20px]">${isSaved ? 'check_circle' : 'save'}</span>
              <span>${isSaved ? 'Saved as Voice Memory' : 'Save as Voice Memory'}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 19. Festival Memory (Festival scene tokens)
  if (modeState.type === 'festival-scene') {
    return `
      <div class="space-y-space-sm bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <span class="font-label-md text-label-md font-bold text-on-surface block">Gather Festive Keepsakes (${modeState.collectedCount} of ${modeState.tokens.length} collected):</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          ${modeState.tokens.map(tok => `
            <button class="festival-token-btn p-space-md rounded-xl text-left border transition-all cursor-pointer ${
              tok.collected ? 'bg-tertiary-fixed/30 border-tertiary shadow-sm ring-2 ring-tertiary/40' : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container'
            }" data-token-id="${tok.id}" type="button">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-primary text-[28px]">${tok.icon}</span>
                <div>
                  <span class="font-body-md text-body-md font-bold text-on-surface block">${tok.title}</span>
                  <span class="font-caption text-caption text-on-surface-variant">${tok.desc}</span>
                </div>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 20. Family Memory Mission (Multi-stage mission adventure)
  if (modeState.type === 'mission-adventure') {
    return `
      <div class="space-y-space-md bg-surface-container-low p-space-md rounded-2xl border border-surface-container">
        <span class="font-label-md text-label-md font-bold text-on-surface block">Memory Mission: Stage ${modeState.currentStage} of ${modeState.stages.length}</span>
        <div class="flex items-center gap-space-xs mb-space-sm">
          ${modeState.stages.map((st, idx) => `
            <div class="flex-1 p-space-xs rounded-lg text-center font-caption text-caption font-semibold ${
              modeState.currentStage > idx + 1 ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
              modeState.currentStage === idx + 1 ? 'bg-primary text-on-primary ring-2 ring-primary/40' :
              'bg-surface-container text-on-surface-variant'
            }">
              Stage ${idx + 1}: ${st.label}
            </div>
          `).join('')}
        </div>
        <div class="p-space-md bg-surface-container-lowest rounded-xl border border-surface-container flex items-center justify-between">
          <div class="flex items-center gap-space-sm">
            <span class="material-symbols-outlined text-primary text-[32px]">${modeState.stages[modeState.currentStage - 1]?.icon || 'flag'}</span>
            <div>
              <span class="font-body-lg text-body-lg font-bold text-on-surface block">${modeState.stages[modeState.currentStage - 1]?.prompt}</span>
              <span class="font-caption text-caption text-on-surface-variant">${modeState.stages[modeState.currentStage - 1]?.answer}</span>
            </div>
          </div>
          <button class="advance-mission-btn px-space-md py-space-xs rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container cursor-pointer shadow-sm" data-stage="${modeState.currentStage}" type="button">
            Complete Stage ${modeState.currentStage}
          </button>
        </div>
      </div>
    `;
  }

  return '';
}

function renderChoiceOptions(act) {
  const options = act.options || [];
  return `
    <fieldset aria-label="Select a reflection response" class="space-y-space-xs">
      <legend class="sr-only">Choose the response below</legend>
      ${options.map(opt => `
        <label class="shell-option-label relative flex items-center justify-between p-space-md rounded-xl ${
          act.selectedOption === opt.id ? 'bg-surface-container-low ring-2 ring-primary/60' : 'bg-surface-container-lowest'
        } cursor-pointer shadow-sm transition-all hover:bg-surface-container-low group border border-surface-container" data-opt-id="${opt.id}">
          <input class="sr-only peer" name="active_choice" type="radio" value="${opt.id}" ${act.selectedOption === opt.id ? 'checked' : ''}/>
          <div class="flex items-center gap-space-md">
            <div class="w-8 h-8 rounded-full ${
              act.selectedOption === opt.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
            } flex items-center justify-center font-label-lg text-label-lg shrink-0 group-hover:bg-surface-container-highest transition-colors">
              ${opt.letter || '•'}
            </div>
            <div class="flex flex-col">
              <span class="font-body-xl text-body-xl ${act.selectedOption === opt.id ? 'font-medium' : ''} text-on-surface">${opt.title}</span>
              <span class="font-caption text-caption text-on-surface-variant">${opt.subtitle || ''}</span>
            </div>
          </div>
          <div class="w-8 h-8 rounded-full ${
            act.selectedOption === opt.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-transparent'
          } flex items-center justify-center shrink-0 shadow-sm transition-colors">
            <span class="material-symbols-outlined text-[20px]">check</span>
          </div>
        </label>
      `).join('')}
    </fieldset>
  `;
}

function renderResultsScreen(act, summary, patientName) {
  const accuracy = summary.accuracy ?? 100;
  const timeSec = summary.completionTimeSec || summary.duration || 60;
  const minutes = Math.floor(timeSec / 60);
  const seconds = timeSec % 60;
  const timeFormatted = minutes > 0 ? `${minutes} min ${seconds} sec` : `${seconds} sec`;

  return `
    <div class="w-full bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden p-space-xl lg:p-space-2xl flex flex-col items-center text-center max-w-2xl mx-auto border border-surface-container">
      <div class="w-20 h-20 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shadow-lg mb-space-md ring-8 ring-tertiary-fixed/30 animate-pulse">
        <span class="material-symbols-outlined text-[42px]">spa</span>
      </div>
      
      <div class="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption mb-space-xs">
        <span>Activity Complete 🌿</span>
      </div>

      <h3 class="font-display text-headline-lg text-on-surface font-bold">${act.name || act.title}</h3>
      <p class="font-body-lg text-body-lg text-on-surface-variant mt-space-xs max-w-lg">
        Wonderful focus, ${patientName}. You completed today's cognitive practice with peaceful dignity.
      </p>
      
      <!-- Non-diagnostic Performance Summary Grid -->
      <div class="my-space-xl p-space-lg rounded-2xl bg-surface-container-low border border-surface-container w-full grid grid-cols-2 sm:grid-cols-4 gap-space-md text-left">
        <div class="p-space-xs">
          <span class="font-caption text-caption text-on-surface-variant uppercase font-semibold block">Performance</span>
          <p class="font-headline-sm text-headline-sm font-bold text-primary mt-1">${accuracy}%</p>
          <span class="font-caption text-caption text-on-surface-variant">Accuracy</span>
        </div>
        <div class="p-space-xs">
          <span class="font-caption text-caption text-on-surface-variant uppercase font-semibold block">Time Taken</span>
          <p class="font-headline-sm text-headline-sm font-bold text-secondary mt-1">${timeFormatted}</p>
          <span class="font-caption text-caption text-on-surface-variant">Gentle pace</span>
        </div>
        <div class="p-space-xs">
          <span class="font-caption text-caption text-on-surface-variant uppercase font-semibold block">Hints Used</span>
          <p class="font-headline-sm text-headline-sm font-bold text-tertiary mt-1">${summary.hintsUsed || 0}</p>
          <span class="font-caption text-caption text-on-surface-variant">Gentle aids</span>
        </div>
        <div class="p-space-xs">
          <span class="font-caption text-caption text-on-surface-variant uppercase font-semibold block">Guidance</span>
          <p class="font-label-lg text-label-lg font-bold text-on-surface mt-1">${summary.assistanceLevel || 'Independent'}</p>
          <span class="font-caption text-caption text-on-surface-variant">${summary.engagement || 'Serene'}</span>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-space-md pt-space-xs">
        <button id="shellTryAgainBtn" class="min-h-[52px] px-space-xl rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg shadow-md transition-all cursor-pointer flex items-center gap-space-2xs">
          <span class="material-symbols-outlined text-[20px]">refresh</span>
          <span>Try Again</span>
        </button>
        <button id="shellBackToActivitiesBtn" class="min-h-[52px] px-space-lg rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg flex items-center gap-space-2xs transition-colors cursor-pointer">
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back to Activities</span>
        </button>
      </div>
    </div>
  `;
}

function renderPauseModal() {
  return `
    <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-space-md" role="dialog" aria-modal="true">
      <div class="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-xl shadow-2xl border border-surface-container flex flex-col items-center text-center">
        <div class="w-16 h-16 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center mb-space-md">
          <span class="material-symbols-outlined text-[32px]">pause</span>
        </div>
        <h3 class="font-headline-md text-headline-md text-on-surface font-bold">Activity Paused 🌿</h3>
        <p class="font-body-md text-body-md text-on-surface-variant mt-space-xs mb-space-lg">
          Take all the time you need. MindMitra is resting calmly and your current progress is safely saved.
        </p>
        <div class="flex flex-col sm:flex-row gap-space-sm w-full">
          <button id="modalResumeBtn" class="flex-1 min-h-[48px] rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container cursor-pointer transition-all">
            Resume Activity
          </button>
          <button id="modalExitBtn" class="flex-1 min-h-[48px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg cursor-pointer transition-colors">
            Exit
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderExitModal() {
  return `
    <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-space-md" role="dialog" aria-modal="true">
      <div class="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-xl shadow-2xl border border-surface-container flex flex-col items-center text-center">
        <div class="w-16 h-16 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center mb-space-md">
          <span class="material-symbols-outlined text-[32px]">logout</span>
        </div>
        <h3 class="font-headline-md text-headline-md text-on-surface font-bold">Leave this activity?</h3>
        <p class="font-body-md text-body-md text-on-surface-variant mt-space-xs mb-space-lg">
          You can return to it whenever you wish. Would you like to stay or return to the Activities Hub?
        </p>
        <div class="flex flex-col sm:flex-row gap-space-sm w-full">
          <button id="modalStayBtn" class="flex-1 min-h-[48px] rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container cursor-pointer transition-all">
            Stay
          </button>
          <button id="modalConfirmExitBtn" class="flex-1 min-h-[48px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg cursor-pointer transition-colors">
            Exit
          </button>
        </div>
      </div>
    </div>
  `;
}

export function attachActivityShellEvents(onRerender) {
  const optionLabels = document.querySelectorAll('.shell-option-label');
  const toggleHintBtn = document.getElementById('shellToggleHintBtn');
  const listenBtn = document.getElementById('shellListenBtn');
  const listenLabel = document.getElementById('shellListenLabel');
  const continueBtn = document.getElementById('shellContinueBtn');
  const skipBtn = document.getElementById('shellSkipBtn');
  const exitBtn = document.getElementById('shellExitBtn');
  const pauseBtn = document.getElementById('shellPauseBtn');

  // Modal buttons
  const modalResumeBtn = document.getElementById('modalResumeBtn');
  const modalExitBtn = document.getElementById('modalExitBtn');
  const modalStayBtn = document.getElementById('modalStayBtn');
  const modalConfirmExitBtn = document.getElementById('modalConfirmExitBtn');

  // Results screen buttons
  const tryAgainBtn = document.getElementById('shellTryAgainBtn');
  const backToActBtn = document.getElementById('shellBackToActivitiesBtn');

  // Mini-game interactive elements
  const matchCards = document.querySelectorAll('.match-card-btn');
  const matchHintPeekBtn = document.getElementById('matchHintPeekBtn');
  const clueCards = document.querySelectorAll('.clue-card-btn');
  const selectPersonBtns = document.querySelectorAll('.select-person-btn');
  const connectRoleBtns = document.querySelectorAll('.connect-role-btn');
  const placeStoryTileBtns = document.querySelectorAll('.place-story-tile-btn');
  const slotPuzzleBtns = document.querySelectorAll('.slot-puzzle-btn');
  const huntItemBtns = document.querySelectorAll('.hunt-item-btn');
  const identifyObjBtns = document.querySelectorAll('.identify-obj-btn');
  const soundSourceBtns = document.querySelectorAll('.sound-source-btn');
  const playAudioBtn = document.getElementById('shellPlayAudioBtn');
  const playVoiceBtn = document.getElementById('shellPlayVoiceBtn');
  const voiceRecordBtn = document.getElementById('voiceRecordBtn');
  const sortAssignBtns = document.querySelectorAll('.sort-assign-btn');
  const seqUpBtns = document.querySelectorAll('.seq-up-btn');
  const seqDownBtns = document.querySelectorAll('.seq-down-btn');
  const readyToShopBtn = document.getElementById('readyToShopBtn');
  const shoppingItemBtns = document.querySelectorAll('.shopping-item-btn');
  const waypointBtns = document.querySelectorAll('.waypoint-btn');
  const sanctuaryBtns = document.querySelectorAll('.sanctuary-btn');
  const scenarioItemBtns = document.querySelectorAll('.scenario-item-btn');
  const festivalTokenBtns = document.querySelectorAll('.festival-token-btn');
  const advanceMissionBtns = document.querySelectorAll('.advance-mission-btn');

  // 1. Choice Option labels
  optionLabels.forEach(lbl => {
    lbl.addEventListener('click', () => {
      const optId = lbl.getAttribute('data-opt-id');
      activityEngine.selectOption(optId);
      if (onRerender) onRerender();
    });
  });

  // 2. Memory Match
  matchCards.forEach(card => {
    card.addEventListener('click', () => {
      const cardId = card.getAttribute('data-card-id');
      activityEngine.flipMatchCard(cardId);
      if (onRerender) onRerender();
    });
  });

  if (matchHintPeekBtn) {
    matchHintPeekBtn.addEventListener('click', () => {
      activityEngine.revealMatchHintPair();
      if (onRerender) onRerender();
    });
  }

  // 3. Clue Recall
  clueCards.forEach(btn => {
    btn.addEventListener('click', () => {
      const clueId = btn.getAttribute('data-clue-id');
      activityEngine.inspectClue(clueId);
      if (onRerender) onRerender();
    });
  });

  // 4. People & Relationships
  selectPersonBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const pId = btn.getAttribute('data-person-id');
      activityEngine.selectPersonForRelation(pId);
      if (onRerender) onRerender();
    });
  });

  connectRoleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const pId = btn.getAttribute('data-person-id');
      const role = btn.getAttribute('data-role');
      activityEngine.connectRelationship(pId, role);
      if (onRerender) onRerender();
    });
  });

  // 5. Photo Story
  placeStoryTileBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tileId = btn.getAttribute('data-tile-id');
      activityEngine.placeStoryTile(tileId);
      if (onRerender) onRerender();
    });
  });

  // 6. Memory Reconstruction
  slotPuzzleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const slotId = btn.getAttribute('data-slot-id');
      activityEngine.slotPuzzlePiece(slotId);
      if (onRerender) onRerender();
    });
  });

  // 7. Attention Hunt
  huntItemBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.getAttribute('data-item-id');
      activityEngine.tapHuntItem(itemId);
      if (onRerender) onRerender();
    });
  });

  // 8. Familiar Object Recognition
  identifyObjBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const objId = btn.getAttribute('data-obj-id');
      activityEngine.identifyObject(objId);
      if (onRerender) onRerender();
    });
  });

  // 9. Sound Recognition
  if (playAudioBtn) {
    playAudioBtn.addEventListener('click', () => {
      speechService.speak('Playing peaceful sound: Monsoon rain drumming softly on the tin roof with distant temple chimes.');
      showToast('Playing peaceful monsoon rain audio cue', 'graphic_eq');
    });
  }

  soundSourceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const srcId = btn.getAttribute('data-source-id');
      activityEngine.selectSoundSource(srcId);
      if (onRerender) onRerender();
    });
  });

  // 10. Object Sorting
  sortAssignBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.getAttribute('data-item-id');
      const bucket = btn.getAttribute('data-bucket');
      activityEngine.sortItemToBucket(itemId, bucket);
      if (onRerender) onRerender();
    });
  });

  // 11, 12, 13. Sequence Reordering
  seqUpBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      activityEngine.moveSequenceItem(idx, -1);
      if (onRerender) onRerender();
    });
  });

  seqDownBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      activityEngine.moveSequenceItem(idx, 1);
      if (onRerender) onRerender();
    });
  });

  // 14. Shopping Memory
  if (readyToShopBtn) {
    readyToShopBtn.addEventListener('click', () => {
      activityEngine.advanceShoppingPhase();
      if (onRerender) onRerender();
    });
  }

  shoppingItemBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.getAttribute('data-item-id');
      activityEngine.collectShoppingItem(itemId);
      if (onRerender) onRerender();
    });
  });

  // 15. Memory Journey
  waypointBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const wpId = btn.getAttribute('data-wp-id');
      activityEngine.visitJourneyWaypoint(wpId);
      if (onRerender) onRerender();
    });
  });

  // 16. Place Explorer
  sanctuaryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const scId = btn.getAttribute('data-sc-id');
      activityEngine.inspectSanctuary(scId);
      if (onRerender) onRerender();
    });
  });

  // 17. Life Simulation
  scenarioItemBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.getAttribute('data-item-id');
      activityEngine.toggleScenarioItem(itemId);
      if (onRerender) onRerender();
    });
  });

  // Hear instructions spoken aloud
  const hearInstructionsBtn = document.getElementById('shellHearInstructionsBtn');
  if (hearInstructionsBtn) {
    hearInstructionsBtn.addEventListener('click', () => {
      if (voiceService.isSpeaking()) {
        voiceService.stop();
        showToast('Speech stopped', 'stop');
        return;
      }
      const act = store.getActiveActivity() || {};
      const textToSpeak = `${act.name || act.title || 'Activity'}. ${act.instructions || 'Take your time. There is no rush at all.'}`;
      showToast('Reading activity instructions', 'volume_up');
      voiceService.speak(textToSpeak, { lang: i18nService.getLanguage() });
    });
  }

  // 18. Voice Recall (Upgraded with STT and Voice Memory persistence)
  if (playVoiceBtn) {
    playVoiceBtn.addEventListener('click', () => {
      if (voiceService.isSpeaking()) {
        voiceService.stop();
        return;
      }
      const noteText = 'Voice note from Ravi: Ma, how are the jasmine flowers doing this week? I am sending your favorite sweets tomorrow.';
      voiceService.speak(noteText, { lang: i18nService.getLanguage() });
      showToast('Playing family audio note', 'record_voice_over');
    });
  }

  const voiceTranscriptInput = document.getElementById('voiceTranscriptInput');
  if (voiceTranscriptInput) {
    voiceTranscriptInput.addEventListener('input', (e) => {
      activityEngine.setVoiceTranscript(e.target.value);
    });
  }

  if (voiceRecordBtn) {
    voiceRecordBtn.addEventListener('click', () => {
      const modeState = activityEngine.getActiveModeState();
      if (voiceService.isListening()) {
        voiceService.stopListening();
        if (modeState) modeState.isRecording = false;
        if (onRerender) onRerender();
      } else {
        if (modeState) modeState.isRecording = true;
        if (onRerender) onRerender();

        const success = voiceService.startListening({
          lang: i18nService.getLanguage(),
          onInterim: (text) => {
            if (voiceTranscriptInput) voiceTranscriptInput.value = text;
            activityEngine.setVoiceTranscript(text);
          },
          onResult: (text) => {
            if (voiceTranscriptInput) voiceTranscriptInput.value = text;
            activityEngine.setVoiceTranscript(text);
          },
          onEnd: (finalText) => {
            if (modeState) modeState.isRecording = false;
            if (finalText) activityEngine.setVoiceTranscript(finalText);
            if (onRerender) onRerender();
          },
          onError: (err) => {
            if (modeState) modeState.isRecording = false;
            showToast(err.message || 'Voice input unavailable. You can type instead.', 'info');
            if (onRerender) onRerender();
          }
        });

        if (!success) {
          if (modeState) modeState.isRecording = false;
          showToast('Voice input is not supported on this browser. You can type instead.', 'info');
          if (onRerender) onRerender();
        }
      }
    });
  }

  const saveVoiceMemoryBtn = document.getElementById('saveVoiceMemoryBtn');
  if (saveVoiceMemoryBtn) {
    saveVoiceMemoryBtn.addEventListener('click', () => {
      const currentText = voiceTranscriptInput ? voiceTranscriptInput.value : '';
      if (currentText) activityEngine.setVoiceTranscript(currentText);
      const act = store.getActiveActivity() || {};
      const saved = activityEngine.saveVoiceMemory(`Voice Recall: ${act.name || 'Personal Memory'}`);
      if (saved) {
        showToast('Saved to your Personal Memory World!', 'check_circle');
        if (onRerender) onRerender();
      }
    });
  }

  // 19. Festival Memory
  festivalTokenBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tokId = btn.getAttribute('data-token-id');
      activityEngine.collectFestivalToken(tokId);
      if (onRerender) onRerender();
    });
  });

  // 20. Family Memory Mission
  advanceMissionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const stage = parseInt(btn.getAttribute('data-stage'), 10);
      activityEngine.advanceMissionStage(stage);
      if (onRerender) onRerender();
    });
  });

  // General Shell Controls
  if (toggleHintBtn) {
    toggleHintBtn.addEventListener('click', () => {
      shellState.showHint = !shellState.showHint;
      if (shellState.showHint) {
        activityEngine.recordHint();
      }
      if (onRerender) onRerender();
    });
  }

  if (listenBtn) {
    listenBtn.addEventListener('click', () => {
      if (listenLabel) listenLabel.textContent = 'Speaking...';
      activityEngine.readQuestionAloud();
      setTimeout(() => {
        if (listenLabel) listenLabel.textContent = 'Listen to question';
      }, 3500);
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      activityEngine.skipStep();
      shellState.showHint = false;
      shellState.lastFeedback = null;
      if (onRerender) onRerender();
    });
  }

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      const result = activityEngine.evaluateStep();
      if (result && result.feedback) {
        shellState.lastFeedback = result.feedback;
      }
      if (onRerender) onRerender();
    });
  }

  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      shellState.showExitModal = true;
      if (onRerender) onRerender();
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      activityEngine.pauseSession();
      shellState.showPauseModal = true;
      if (onRerender) onRerender();
    });
  }

  if (modalResumeBtn) {
    modalResumeBtn.addEventListener('click', () => {
      activityEngine.resumeSession();
      shellState.showPauseModal = false;
      if (onRerender) onRerender();
    });
  }

  if (modalExitBtn) {
    modalExitBtn.addEventListener('click', () => {
      activityEngine.exitSession();
      shellState.showPauseModal = false;
      window.location.hash = '#/activities';
      if (onRerender) onRerender();
    });
  }

  if (modalStayBtn) {
    modalStayBtn.addEventListener('click', () => {
      shellState.showExitModal = false;
      if (onRerender) onRerender();
    });
  }

  if (modalConfirmExitBtn) {
    modalConfirmExitBtn.addEventListener('click', () => {
      activityEngine.exitSession();
      shellState.showExitModal = false;
      window.location.hash = '#/activities';
      if (onRerender) onRerender();
    });
  }

  if (tryAgainBtn) {
    tryAgainBtn.addEventListener('click', () => {
      const act = store.getActiveActivity();
      activityEngine.startSession(act?.id || 'act-1');
      shellState.showHint = false;
      shellState.lastFeedback = null;
      if (onRerender) onRerender();
    });
  }

  if (backToActBtn) {
    backToActBtn.addEventListener('click', () => {
      window.location.hash = '#/activities';
      if (onRerender) onRerender();
    });
  }
}
