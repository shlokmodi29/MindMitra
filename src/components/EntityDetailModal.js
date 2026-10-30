// Entity Detail Modal - Connected exploration for People, Places, Events, and Stories
// Respectful elder-friendly dialog strictly preserving Stitch aesthetics
import { store } from '../state/store.js';
import { memoryService, FALLBACK_MEMORY_IMAGE } from '../services/memoryService.js';
import { voiceService } from '../services/voiceService.js';
import { showToast } from './Toast.js';

export function renderEntityDetailModal() {
  const state = store.getState();
  if (!state.entityDetailModalOpen || !state.selectedEntityDetail) {
    return `<div id="entity-detail-modal-container"></div>`;
  }

  const { type, data } = state.selectedEntityDetail;

  let title = '';
  let subtitle = '';
  let heroImage = '';
  let description = '';
  let connectedMemories = [];
  let extraContent = '';

  if (type === 'person' || type === 'shared-journey') {
    const p = data.person || data;
    const journey = memoryService.getSharedMemoryJourney(p.id) || {
      memories: data.memories || [],
      places: [],
      events: [],
      stories: [],
      photos: [],
      stats: { memoriesCount: (data.memories || []).length, placesCount: 0, storiesCount: 0, photosCount: 0 }
    };

    title = p.name;
    subtitle = `${p.relation || 'Family Member'} • ${p.tag || 'Care Circle'}`;
    heroImage = p.avatar || FALLBACK_MEMORY_IMAGE;
    description = p.bio || 'A beloved family member in your loving circle.';
    connectedMemories = journey.memories || [];

    const stats = journey.stats;
    const isFav = Boolean(p.favorite);

    extraContent = `
      <!-- Person Stats & Action Hub -->
      <div class="space-y-space-md">
        <!-- 4 Core Profile Metrics -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-space-xs text-center">
          <div class="p-space-sm rounded-xl bg-surface-container border border-surface-container">
            <span class="font-caption text-caption text-on-surface-variant block uppercase tracking-wider">Memories together</span>
            <span class="font-headline-sm text-headline-sm font-bold text-primary">${stats.memoriesCount}</span>
          </div>
          <div class="p-space-sm rounded-xl bg-surface-container border border-surface-container">
            <span class="font-caption text-caption text-on-surface-variant block uppercase tracking-wider">Places together</span>
            <span class="font-headline-sm text-headline-sm font-bold text-secondary">${stats.placesCount}</span>
          </div>
          <div class="p-space-sm rounded-xl bg-surface-container border border-surface-container">
            <span class="font-caption text-caption text-on-surface-variant block uppercase tracking-wider">Stories</span>
            <span class="font-headline-sm text-headline-sm font-bold text-tertiary">${stats.storiesCount}</span>
          </div>
          <div class="p-space-sm rounded-xl bg-surface-container border border-surface-container">
            <span class="font-caption text-caption text-on-surface-variant block uppercase tracking-wider">Photos</span>
            <span class="font-headline-sm text-headline-sm font-bold text-on-surface">${stats.photosCount}</span>
          </div>
        </div>

        <!-- Action Bar: View Memories, View Photos, Hear Story -->
        <div class="flex flex-wrap items-center gap-space-xs pt-space-xs">
          <a href="#entityMemoriesSection" class="px-space-md py-space-xs rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-label-md text-label-md flex items-center gap-1 transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">photo_library</span>
            <span>View Memories</span>
          </a>
          <a href="#entityPhotosSection" class="px-space-md py-space-xs rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/20 font-label-md text-label-md flex items-center gap-1 transition-all cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">image</span>
            <span>View Photos</span>
          </a>
          <button id="hearPersonStoryBtn" class="px-space-md py-space-xs rounded-xl bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary-fixed-dim font-label-md text-label-md flex items-center gap-1 transition-all cursor-pointer shadow-sm" data-person-id="${p.id}" type="button">
            <span class="material-symbols-outlined text-[18px]">volume_up</span>
            <span>Hear Story</span>
          </button>
          <button id="stopPersonVoiceBtn" class="hidden px-space-md py-space-xs rounded-xl bg-error text-on-error hover:opacity-90 font-label-md text-label-md flex items-center gap-1 transition-all cursor-pointer shadow-sm" type="button">
            <span class="material-symbols-outlined text-[18px]">stop_circle</span>
            <span>Stop</span>
          </button>
          <button id="togglePersonFavBtn" class="ml-auto p-space-xs rounded-xl border border-surface-container hover:bg-surface-container text-amber-600 transition-colors cursor-pointer" data-person-id="${p.id}" title="Toggle Favorite" type="button">
            <span class="material-symbols-outlined text-[22px]">${isFav ? 'star' : 'star_border'}</span>
          </button>
        </div>

        <!-- Proximity and Contact Line -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm p-space-md rounded-xl bg-surface-container border border-surface-container">
          ${p.proximity ? `
            <div class="flex items-center gap-space-xs">
              <span class="material-symbols-outlined text-primary text-[20px]">near_me</span>
              <div>
                <span class="font-caption text-caption text-on-surface-variant block">Proximity</span>
                <span class="font-label-md text-label-md text-on-surface font-semibold">${p.proximity}</span>
              </div>
            </div>
          ` : ''}
          <div class="flex items-center gap-space-xs">
            <span class="material-symbols-outlined text-secondary text-[20px]">phone</span>
            <div>
              <span class="font-caption text-caption text-on-surface-variant block">Contact Line</span>
              ${p.phone ? `
                <span class="font-label-md text-label-md text-on-surface font-semibold">${p.phone}</span>
              ` : `
                <span class="font-label-md text-label-md text-on-surface-variant italic">Contact number not configured</span>
              `}
            </div>
          </div>
        </div>

        <!-- Shared Photos Strip (if available) -->
        ${journey.photos && journey.photos.length > 0 ? `
          <div id="entityPhotosSection" class="space-y-space-xs pt-space-xs">
            <span class="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider font-semibold block">Photos with ${p.name} (${journey.photos.length})</span>
            <div class="flex gap-space-sm overflow-x-auto pb-2 scrollbar-thin">
              ${journey.photos.map(ph => `
                <div class="shrink-0 w-28 h-28 rounded-xl overflow-hidden border border-surface-container shadow-sm relative group">
                  <img class="w-full h-full object-cover" 
                       src="${ph.url}" 
                       alt="${ph.title}"
                       onerror="this.onerror=null; this.src='${FALLBACK_MEMORY_IMAGE}';"/>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                    <span class="font-caption text-[11px] text-white truncate">${ph.title}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Shared Places (if available) -->
        ${journey.places && journey.places.length > 0 ? `
          <div class="space-y-space-xs pt-space-xs">
            <span class="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider font-semibold block">Sanctuaries Visited Together</span>
            <div class="flex flex-wrap gap-space-xs">
              ${journey.places.map(plc => `
                <span class="px-space-md py-1 rounded-full bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px] text-secondary">cottage</span>
                  <span>${plc.name} (${plc.region || plc.location || ''})</span>
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  } else if (type === 'place') {
    const plc = data.place || data;
    title = plc.name;
    subtitle = `${plc.region || plc.location || 'Cherished Place'}`;
    heroImage = plc.image || FALLBACK_MEMORY_IMAGE;
    description = plc.description || 'A peaceful sanctuary remembered fondly across the seasons.';
    connectedMemories = data.memories || [];
    extraContent = (data.events && data.events.length > 0) ? `
      <div class="space-y-space-xs">
        <h4 class="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider font-semibold">Events at this Place</h4>
        <div class="flex flex-wrap gap-space-xs">
          ${data.events.map(e => `
            <span class="px-space-md py-1 rounded-full bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px] text-tertiary">celebration</span>
              <span>${e.name || e.title} (${e.date || ''})</span>
            </span>
          `).join('')}
        </div>
      </div>
    ` : '';
  } else if (type === 'event') {
    const evt = data.event || data;
    title = evt.name || evt.title;
    subtitle = `${evt.date || 'Cherished Milestone'}`;
    heroImage = FALLBACK_MEMORY_IMAGE;
    description = evt.description || 'A memorable life celebration shared together.';
    connectedMemories = data.memories || [];
    extraContent = (data.people && data.people.length > 0) ? `
      <div class="space-y-space-xs">
        <h4 class="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider font-semibold">Participants</h4>
        <div class="flex flex-wrap gap-space-xs">
          ${data.people.map(p => `
            <span class="px-space-md py-1 rounded-full bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px] text-primary">person</span>
              <span>${p.name} (${p.relation})</span>
            </span>
          `).join('')}
        </div>
      </div>
    ` : '';
  } else if (type === 'story') {
    const sty = data.story || data;
    title = sty.title;
    subtitle = `Family Story • By ${sty.author || 'Family Member'}`;
    heroImage = sty.image || FALLBACK_MEMORY_IMAGE;
    description = sty.text || 'A heartwarming spoken narrative preserved in the living archive.';
    connectedMemories = data.memories || [];
  }

  return `
  <div id="entity-detail-modal-container">
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity" id="entityDetailBackdrop"></div>

    <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-space-sm sm:p-space-lg">
      <div class="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-space-lg py-space-md bg-surface-container-lowest border-b border-surface-container shrink-0">
          <span class="px-space-sm py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold uppercase tracking-wider">
            ${type.toUpperCase()} SPOTLIGHT
          </span>
          <button id="closeEntityDetailBtn" class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer" aria-label="Close" type="button">
            <span class="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="p-space-lg lg:p-space-xl overflow-y-auto space-y-space-lg flex-1">
          <!-- Hero Header Section -->
          <div class="flex flex-col sm:flex-row items-center gap-space-lg">
            ${heroImage ? `
              <img class="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover shadow-sm border border-surface-container shrink-0" 
                   src="${heroImage}" 
                   alt="${title}"
                   onerror="this.onerror=null; this.src='${FALLBACK_MEMORY_IMAGE}';"/>
            ` : ''}
            <div class="text-center sm:text-left min-w-0">
              <h2 class="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">${title}</h2>
              <p class="font-label-lg text-label-lg text-primary font-semibold mt-0.5">${subtitle}</p>
            </div>
          </div>

          <!-- Description -->
          <div class="p-space-md rounded-xl bg-surface-container-low border border-surface-container">
            <p class="font-body-lg text-body-lg text-on-surface leading-relaxed whitespace-pre-line">
              ${description}
            </p>
          </div>

          ${extraContent}

          <!-- Connected Memories Section -->
          ${connectedMemories.length > 0 ? `
            <div class="space-y-space-sm pt-space-sm border-t border-surface-container">
              <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Connected Memories (${connectedMemories.length})</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                ${connectedMemories.map(m => `
                  <div class="entity-memory-card p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container flex items-center gap-space-sm cursor-pointer transition-all" data-id="${m.id}">
                    <img class="w-12 h-12 rounded-lg object-cover shrink-0" 
                         src="${m.image || m.coverPhoto || FALLBACK_MEMORY_IMAGE}" 
                         alt="${m.title}"
                         onerror="this.onerror=null; this.src='${FALLBACK_MEMORY_IMAGE}';"/>
                    <div class="min-w-0">
                      <h4 class="font-label-md text-label-md text-on-surface font-bold truncate">${m.title}</h4>
                      <span class="font-caption text-caption text-on-surface-variant">${m.category} • ${m.year || ''}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Footer Action -->
        <div class="px-space-lg py-space-md bg-surface-container-lowest border-t border-surface-container flex justify-end shrink-0">
          <button id="entityBottomCloseBtn" class="px-space-xl min-h-[44px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer" type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
  `;
}

export function attachEntityDetailModalEvents() {
  const backdrop = document.getElementById('entityDetailBackdrop');
  const closeBtn = document.getElementById('closeEntityDetailBtn');
  const bottomCloseBtn = document.getElementById('entityBottomCloseBtn');
  const memoryCards = document.querySelectorAll('.entity-memory-card');

  const hearStoryBtn = document.getElementById('hearPersonStoryBtn');
  const stopVoiceBtn = document.getElementById('stopPersonVoiceBtn');
  const toggleFavBtn = document.getElementById('togglePersonFavBtn');

  function closeModal() {
    voiceService.stop();
    store.setEntityDetailModalOpen(false);
  }

  if (backdrop) backdrop.addEventListener('click', closeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (bottomCloseBtn) bottomCloseBtn.addEventListener('click', closeModal);

  if (hearStoryBtn) {
    hearStoryBtn.addEventListener('click', () => {
      const personId = hearStoryBtn.getAttribute('data-person-id');
      const p = memoryService.getPersonById(personId);
      if (!p) return;

      const journey = memoryService.getSharedMemoryJourney(personId);
      const storyText = (journey && journey.stories && journey.stories[0]) ? journey.stories[0].text : p.bio;
      const spokenContent = `Here is a memory story with ${p.name}. ${storyText}`;

      if (stopVoiceBtn) stopVoiceBtn.classList.remove('hidden');
      voiceService.speak(spokenContent, {
        onEnd: () => {
          if (stopVoiceBtn) stopVoiceBtn.classList.add('hidden');
        }
      });
      showToast(`Speaking story with ${p.name}`, 'volume_up');
    });
  }

  if (stopVoiceBtn) {
    stopVoiceBtn.addEventListener('click', () => {
      voiceService.stop();
      stopVoiceBtn.classList.add('hidden');
      showToast('Speech stopped.', 'stop_circle');
    });
  }

  if (toggleFavBtn) {
    toggleFavBtn.addEventListener('click', () => {
      const personId = toggleFavBtn.getAttribute('data-person-id');
      const isNowFav = store.togglePersonFavorite(personId);
      const icon = toggleFavBtn.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = isNowFav ? 'star' : 'star_border';
      showToast(isNowFav ? 'Added to Loved Ones favorites' : 'Removed from favorites', isNowFav ? 'star' : 'star_border');
    });
  }

  memoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const mem = memoryService.getMemoryById(id);
      if (mem) {
        closeModal();
        store.setSelectedMemoryDetail(mem);
        store.setMemoryDetailModalOpen(true);
      }
    });
  });
}
