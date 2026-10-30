// Memory Detail Modal - Elder-friendly, spacious, warm slide-over modal
// Strictly preserving the Stitch visual design system and color palette
import { store } from '../state/store.js';
import { memoryService, FALLBACK_MEMORY_IMAGE } from '../services/memoryService.js';
import { speechService } from '../services/speechService.js';
import { showToast } from './Toast.js';

let isPlayingAudio = false;

export function renderMemoryDetailModal() {
  const state = store.getState();
  if (!state.memoryDetailModalOpen || !state.selectedMemoryDetail) {
    return `<div id="memory-detail-modal-container"></div>`;
  }

  const memory = state.selectedMemoryDetail;
  const context = memoryService.getMemoryContext(memory.id) || {};
  const relatedMemories = memoryService.getRelatedMemories(memory.id);

  const isFav = Boolean(memory.favorite);
  const isImp = Boolean(memory.important);

  return `
  <div id="memory-detail-modal-container">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity" id="memoryDetailBackdrop"></div>

    <!-- Modal Content (Centered Dialog on Desktop, Full Sheet on Mobile) -->
    <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-space-sm sm:p-space-lg">
      <div class="relative w-full max-w-3xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        <!-- Modal Top Bar -->
        <div class="flex items-center justify-between px-space-lg py-space-md bg-surface-container-lowest border-b border-surface-container shrink-0">
          <div class="flex items-center gap-space-xs">
            <span class="px-space-sm py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-caption font-semibold">
              ${memory.category || 'Cherished Memory'}
            </span>
            ${memory.year ? `
              <span class="px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">
                ${memory.year}
              </span>
            ` : ''}
          </div>

          <div class="flex items-center gap-space-xs">
            <!-- Favorite Toggle -->
            <button id="modalFavoriteBtn" class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" type="button">
              <span class="material-symbols-outlined text-[22px] ${isFav ? 'text-primary' : ''}" style="${isFav ? "font-variation-settings: 'FILL' 1;" : ''}">
                favorite
              </span>
            </button>

            <!-- Important Toggle -->
            <button id="modalImportantBtn" class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer" title="${isImp ? 'Marked as personally important' : 'Mark as important'}" type="button">
              <span class="material-symbols-outlined text-[22px] ${isImp ? 'text-secondary' : ''}" style="${isImp ? "font-variation-settings: 'FILL' 1;" : ''}">
                bookmark
              </span>
            </button>

            <!-- Close Modal -->
            <button id="closeMemoryDetailBtn" class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer ml-1" aria-label="Close memory details" type="button">
              <span class="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>
        </div>

        <!-- Scrollable Modal Body -->
        <div class="p-space-lg lg:p-space-xl overflow-y-auto space-y-space-lg flex-1">
          <!-- Memory Cover Image with Fallback -->
          <div class="relative h-64 sm:h-80 w-full rounded-xl overflow-hidden shadow-sm border border-surface-container bg-surface-container-low">
            <img class="w-full h-full object-cover" 
                 src="${memory.image || memory.coverPhoto || FALLBACK_MEMORY_IMAGE}" 
                 alt="${memory.title}"
                 onerror="this.onerror=null; this.src='${FALLBACK_MEMORY_IMAGE}';"/>
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div class="text-surface-container-lowest">
                <span class="font-caption text-caption text-surface-container-lowest/80 block">${memory.season || memory.date || ''}</span>
                <h2 class="font-headline-md text-headline-md font-bold tracking-tight text-surface-container-lowest drop-shadow-sm">
                  ${memory.title}
                </h2>
              </div>
            </div>
          </div>

          <!-- Quick Audio Listening Action -->
          <div class="p-space-md rounded-xl bg-secondary text-on-secondary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md shadow-sm">
            <div class="flex items-center gap-space-sm">
              <span class="flex items-center justify-center w-10 h-10 rounded-full bg-on-secondary/15 text-on-secondary">
                <span class="material-symbols-outlined text-[24px]">${isPlayingAudio ? 'graphic_eq' : 'volume_up'}</span>
              </span>
              <div>
                <span class="font-label-lg text-label-lg font-bold block">${memory.audioTitle || 'Listen to this Memory'}</span>
                <span class="font-caption text-caption text-secondary-fixed-dim">Gentle narration paced for peaceful listening</span>
              </div>
            </div>

            <button id="modalPlayNarrationBtn" class="min-h-[44px] px-space-lg rounded-xl bg-on-secondary text-secondary font-label-md text-label-md font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0" type="button">
              ${isPlayingAudio ? 'Stop Narration' : 'Listen Now'}
            </button>
          </div>

          <!-- Memory Narrative & Quote -->
          <div class="space-y-space-md">
            ${memory.transcript ? `
              <div>
                <h3 class="font-label-lg text-label-lg text-primary uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[18px]">notes</span>
                  <span>Transcript</span>
                </h3>
                <div class="p-space-md rounded-xl bg-surface-container-low border border-surface-container text-body-lg text-body-lg text-on-surface leading-relaxed">
                  "${memory.transcript}"
                </div>
              </div>
            ` : ''}

            ${memory.quote ? `
              <div class="relative p-space-lg rounded-xl bg-surface-container-low text-on-surface border-l-4 border-primary">
                <span class="material-symbols-outlined text-primary/30 text-[36px] absolute top-2 left-2 select-none">format_quote</span>
                <p class="font-body-lg text-body-lg italic pl-space-md text-on-surface leading-relaxed">
                  “${memory.quote}”
                </p>
              </div>
            ` : ''}

            <div>
              <h3 class="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider font-semibold mb-1">About this Memory</h3>
              <p class="font-body-lg text-body-lg text-on-surface leading-relaxed whitespace-pre-line">
                ${memory.description || memory.narrationText || 'A peaceful keepsake from your personal journey.'}
              </p>
            </div>
          </div>

          <!-- Sensory & Environmental Cues -->
          ${(memory.cue || memory.timeOfDay || memory.companions) ? `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-sm p-space-md rounded-xl bg-surface-container border border-surface-container">
              ${memory.companions ? `
                <div class="flex items-center gap-space-xs">
                  <span class="material-symbols-outlined text-secondary text-[22px]">group</span>
                  <div>
                    <span class="font-caption text-caption text-on-surface-variant block">Companions</span>
                    <span class="font-label-md text-label-md text-on-surface font-semibold">${memory.companions}</span>
                  </div>
                </div>
              ` : ''}

              ${memory.timeOfDay ? `
                <div class="flex items-center gap-space-xs">
                  <span class="material-symbols-outlined text-primary text-[22px]">schedule</span>
                  <div>
                    <span class="font-caption text-caption text-on-surface-variant block">Time of Day</span>
                    <span class="font-label-md text-label-md text-on-surface font-semibold">${memory.timeOfDay}</span>
                  </div>
                </div>
              ` : ''}

              ${memory.cue ? `
                <div class="flex items-center gap-space-xs">
                  <span class="material-symbols-outlined text-tertiary text-[22px]">psychology</span>
                  <div>
                    <span class="font-caption text-caption text-on-surface-variant block">Familiar Cue</span>
                    <span class="font-label-md text-label-md text-on-surface font-semibold">${memory.cue}</span>
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Connected People & Places Pills -->
          <div class="space-y-space-xs">
            <h3 class="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider font-semibold">Meaningful Connections</h3>
            <div class="flex flex-wrap gap-space-xs">
              ${(context.people || []).map(p => `
                <button class="entity-pill px-space-md py-1.5 rounded-full bg-surface-container hover:bg-primary/15 text-on-surface font-label-md text-label-md flex items-center gap-1 transition-colors cursor-pointer" data-type="person" data-id="${p.id}" type="button">
                  <span class="material-symbols-outlined text-[16px] text-primary">person</span>
                  <span>${p.name} (${p.relation})</span>
                </button>
              `).join('')}

              ${context.place ? `
                <button class="entity-pill px-space-md py-1.5 rounded-full bg-surface-container hover:bg-secondary/15 text-on-surface font-label-md text-label-md flex items-center gap-1 transition-colors cursor-pointer" data-type="place" data-id="${context.place.id}" type="button">
                  <span class="material-symbols-outlined text-[16px] text-secondary">location_on</span>
                  <span>${context.place.name}</span>
                </button>
              ` : ''}

              ${context.event ? `
                <button class="entity-pill px-space-md py-1.5 rounded-full bg-surface-container hover:bg-tertiary/15 text-on-surface font-label-md text-label-md flex items-center gap-1 transition-colors cursor-pointer" data-type="event" data-id="${context.event.id}" type="button">
                  <span class="material-symbols-outlined text-[16px] text-tertiary">celebration</span>
                  <span>${context.event.title}</span>
                </button>
              ` : ''}

              ${context.story ? `
                <button class="entity-pill px-space-md py-1.5 rounded-full bg-surface-container hover:bg-primary/15 text-on-surface font-label-md text-label-md flex items-center gap-1 transition-colors cursor-pointer" data-type="story" data-id="${context.story.id}" type="button">
                  <span class="material-symbols-outlined text-[16px] text-primary">menu_book</span>
                  <span>${context.story.title}</span>
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Related Memories (Calculated from real relational graph) -->
          ${relatedMemories.length > 0 ? `
            <div class="space-y-space-sm pt-space-md border-t border-surface-container">
              <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Related Memories</h3>
              <p class="font-body-md text-body-md text-on-surface-variant">Connected through familiar people, places, or seasons:</p>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
                ${relatedMemories.slice(0, 4).map(rm => `
                  <div class="related-memory-card p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container flex items-center gap-space-sm cursor-pointer transition-all" data-id="${rm.id}">
                    <img class="w-14 h-14 rounded-lg object-cover shrink-0" 
                         src="${rm.image || FALLBACK_MEMORY_IMAGE}" 
                         alt="${rm.title}"
                         onerror="this.onerror=null; this.src='${FALLBACK_MEMORY_IMAGE}';"/>
                    <div class="min-w-0">
                      <span class="font-caption text-caption text-primary font-semibold block">${rm.category}</span>
                      <h4 class="font-label-lg text-label-lg text-on-surface font-bold truncate">${rm.title}</h4>
                      <span class="font-caption text-caption text-on-surface-variant">${rm.year || rm.season || ''}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Modal Bottom Actions -->
        <div class="px-space-lg py-space-md bg-surface-container-lowest border-t border-surface-container flex items-center justify-between shrink-0">
          <span class="font-caption text-caption text-on-surface-variant">
            ${memory.tags ? memory.tags.join(' • ') : ''}
          </span>
          <button id="modalBottomCloseBtn" class="px-space-xl min-h-[44px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer" type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
  `;
}

export function attachMemoryDetailModalEvents() {
  const backdrop = document.getElementById('memoryDetailBackdrop');
  const closeBtn = document.getElementById('closeMemoryDetailBtn');
  const bottomCloseBtn = document.getElementById('modalBottomCloseBtn');
  const favBtn = document.getElementById('modalFavoriteBtn');
  const impBtn = document.getElementById('modalImportantBtn');
  const playBtn = document.getElementById('modalPlayNarrationBtn');
  const entityPills = document.querySelectorAll('.entity-pill');
  const relatedCards = document.querySelectorAll('.related-memory-card');

  function closeModal() {
    isPlayingAudio = false;
    speechService.stop();
    store.setMemoryDetailModalOpen(false);
  }

  if (backdrop) backdrop.addEventListener('click', closeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (bottomCloseBtn) bottomCloseBtn.addEventListener('click', closeModal);

  if (favBtn) {
    favBtn.addEventListener('click', () => {
      const state = store.getState();
      if (state.selectedMemoryDetail) {
        const isFav = store.toggleMemoryFavorite(state.selectedMemoryDetail.id);
        showToast(isFav ? 'Added to Favorites' : 'Removed from Favorites', 'favorite');
        // Update local object
        state.selectedMemoryDetail.favorite = isFav;
      }
    });
  }

  if (impBtn) {
    impBtn.addEventListener('click', () => {
      const state = store.getState();
      if (state.selectedMemoryDetail) {
        const isImp = store.toggleMemoryImportant(state.selectedMemoryDetail.id);
        showToast(isImp ? 'Marked as Important' : 'Unmarked from Important', 'bookmark');
        state.selectedMemoryDetail.important = isImp;
      }
    });
  }

  let audioPlayerInstance = null;

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      const state = store.getState();
      const mem = state.selectedMemoryDetail;
      if (!mem) return;

      if (!isPlayingAudio) {
        isPlayingAudio = true;
        if (mem.audioUrl) {
          try {
            audioPlayerInstance = new Audio(mem.audioUrl);
            audioPlayerInstance.onended = () => {
              isPlayingAudio = false;
              const btn = document.getElementById('modalPlayNarrationBtn');
              if (btn) btn.textContent = 'Play Voice Recording';
            };
            audioPlayerInstance.play().catch(() => {
              // fallback to TTS if audio playback fails
              const text = mem.transcript || mem.narrationText || mem.title;
              speechService.speak(text, {
                onEnd: () => {
                  isPlayingAudio = false;
                  const btn = document.getElementById('modalPlayNarrationBtn');
                  if (btn) btn.textContent = 'Listen Now';
                }
              });
            });
            playBtn.textContent = 'Stop Recording';
          } catch (_) {
            const text = mem.transcript || mem.narrationText || mem.title;
            speechService.speak(text);
            playBtn.textContent = 'Stop Narration';
          }
        } else {
          const text = mem.narrationText || mem.description || mem.quote || mem.title;
          speechService.speak(text, {
            onEnd: () => {
              isPlayingAudio = false;
              const btn = document.getElementById('modalPlayNarrationBtn');
              if (btn) btn.textContent = 'Listen Now';
            }
          });
          playBtn.textContent = 'Stop Narration';
        }
      } else {
        isPlayingAudio = false;
        if (audioPlayerInstance) {
          try { audioPlayerInstance.pause(); } catch (_) {}
          audioPlayerInstance = null;
        }
        speechService.stop();
        playBtn.textContent = mem.audioUrl ? 'Play Voice Recording' : 'Listen Now';
      }
    });
  }

  entityPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const type = pill.getAttribute('data-type');
      const id = pill.getAttribute('data-id');
      closeModal();

      let entityContext = null;
      if (type === 'person') entityContext = memoryService.getPersonWithContext(id);
      if (type === 'place') entityContext = memoryService.getPlaceWithContext(id);
      if (type === 'event') entityContext = memoryService.getEventWithContext(id);

      if (entityContext) {
        store.setSelectedEntityDetail(type, entityContext);
        store.setEntityDetailModalOpen(true);
      }
    });
  });

  relatedCards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const nextMemory = memoryService.getMemoryById(id);
      if (nextMemory) {
        store.setSelectedMemoryDetail(nextMemory);
      }
    });
  });
}
