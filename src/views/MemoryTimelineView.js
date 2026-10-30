// Memory Timeline View - Dedicated Vertical Chronological Living Archive
// Features Event-centered grouping, filtering, search, favorite toggling, audio readout,
// SmritiAI contextual explanation, and cognitive recall linking.
import { store } from '../state/store.js';
import { memoryService, FALLBACK_MEMORY_IMAGE } from '../services/memoryService.js';
import { voiceService } from '../services/voiceService.js';
import { i18nService } from '../services/i18nService.js';
import { showToast } from '../components/Toast.js';
import { renderEmptyState } from '../components/FeedbackStates.js';
import { smritiAIService } from '../services/smritiAIService.js';

let activeTypeFilter = 'all';
let activeYearFilter = 'all';
let searchQuery = '';
let sortOrder = 'desc'; // 'desc' (Newest -> Oldest) | 'asc' (Oldest -> Newest)
let playingItemId = null;
let smritiExplanation = null; // { itemId, text }

export function renderMemoryTimelineView() {
  const patientId = store.getCurrentPatientId();
  const state = store.getState();
  const patient = (state.users || []).find(u => u.id === patientId) || state.currentUser || state.profile;
  const patientName = patient?.name || 'Asha Devi';

  let timelineData;
  try {
    timelineData = memoryService.getMemoryTimeline(patientId, {
      type: activeTypeFilter,
      year: activeYearFilter,
      search: searchQuery,
      sortOrder
    });
  } catch (err) {
    console.error('Error preparing memory timeline:', err);
    return `
    <main class="w-full pt-20 bg-surface min-h-[calc(100vh-140px)]">
      <div class="max-w-5xl mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl text-center">
        <div class="p-space-2xl bg-surface-container-low rounded-2xl border border-surface-container max-w-lg mx-auto">
          <span class="material-symbols-outlined text-primary text-[48px] mb-space-sm">error_outline</span>
          <h2 class="font-headline-md text-headline-md text-on-surface font-bold">
            ${i18nService.t('memories.timelineErrorFallback') || 'Your saved memories are still safe. Please try again.'}
          </h2>
          <a href="#/memory-world" class="mt-space-md inline-flex items-center gap-2 px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-lg">
            <span>${i18nService.t('memories.title') || 'Personal Memory World'}</span>
          </a>
        </div>
      </div>
    </main>
    `;
  }

  const { totalCount, filteredCount, yearGroups, years } = timelineData;

  // Filter labels
  const filterTabs = [
    { key: 'all', label: i18nService.t('memories.filterAll') || 'All' },
    { key: 'events', label: i18nService.t('memories.filterEvents') || 'Events' },
    { key: 'photos', label: i18nService.t('memories.filterPhotos') || 'Photos' },
    { key: 'stories', label: i18nService.t('memories.filterStories') || 'Stories' },
    { key: 'voice_memories', label: i18nService.t('memories.filterVoice') || 'Voice Memories' },
    { key: 'people', label: i18nService.t('memories.filterPeople') || 'People' },
    { key: 'places', label: i18nService.t('memories.filterPlaces') || 'Places' },
    { key: 'favorites', label: i18nService.t('memories.filterFavorites') || 'Favorites' }
  ];

  // Render an individual card
  function renderTimelineCard(item) {
    const isPlaying = playingItemId === item.id;
    const isEvent = item.type === 'event';
    const isVoice = item.type === 'voice_memory' || item.voiceCount > 0;
    const hasStory = item.storyCount > 0 || item.story;
    const isFav = Boolean(item.favorite);

    const typeBadge = isEvent ? 'Event'
                    : item.type === 'photo' ? 'Photo'
                    : item.type === 'story' ? 'Story'
                    : item.type === 'voice_memory' ? 'Voice Memory'
                    : item.type === 'person_memory' ? 'Person'
                    : item.type === 'place' ? 'Place'
                    : 'Memory';

    const typeIcon = isEvent ? 'celebration'
                   : item.type === 'photo' ? 'photo_camera'
                   : item.type === 'story' ? 'auto_stories'
                   : item.type === 'voice_memory' ? 'mic'
                   : item.type === 'person_memory' ? 'person'
                   : item.type === 'place' ? 'location_on'
                   : 'memory';

    const hasAudio = Boolean(item.voiceMemory || item.originalEntity?.narrationText || item.quote || item.description);

    return `
    <article class="timeline-card group relative bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg border border-surface-container shadow-sm hover:shadow-md transition-all">
      <!-- Card Header: Type Badge, Date, Favorite Button -->
      <div class="flex items-center justify-between gap-space-sm mb-space-sm">
        <div class="flex items-center gap-space-xs flex-wrap">
          <span class="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full ${
            isEvent ? 'bg-primary-fixed text-on-primary-fixed font-bold'
            : isVoice ? 'bg-secondary-fixed text-on-secondary-fixed font-semibold'
            : 'bg-surface-container-high text-on-surface-variant font-medium'
          } font-caption text-caption">
            <span class="material-symbols-outlined text-[14px]">${typeIcon}</span>
            <span>${typeBadge}</span>
          </span>
          <span class="font-label-md text-label-md font-semibold text-primary">
            ${item.date || 'Date not available'}
          </span>
        </div>

        <div class="flex items-center gap-1">
          <!-- Favorite Button -->
          <button class="timeline-fav-btn w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer" 
                  data-id="${item.id}" 
                  data-entity-type="${item.entityType}"
                  data-fav="${isFav ? 'true' : 'false'}"
                  title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" 
                  type="button" 
                  aria-label="Favorite">
            <span class="material-symbols-outlined text-[20px] ${isFav ? 'text-primary' : ''}" style="${isFav ? "font-variation-settings: 'FILL' 1;" : ''}">
              favorite
            </span>
          </button>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-space-md">
        <!-- Photo/Cover Image (if present) -->
        ${item.coverImage ? `
          <div class="md:col-span-4 rounded-xl overflow-hidden bg-surface-container max-h-56 md:max-h-none border border-surface-container relative">
            <img class="w-full h-full object-cover min-h-[160px] max-h-[220px] transition-transform duration-500 group-hover:scale-105" 
                 src="${item.coverImage}" 
                 alt="${item.title}"
                 loading="lazy"
                 onerror="this.onerror=null; this.src='${FALLBACK_MEMORY_IMAGE}';"/>
            ${isEvent && item.photoCount > 1 ? `
              <span class="absolute bottom-2 right-2 px-space-xs py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white font-caption text-caption flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">photo_library</span>
                <span>${item.photoCount} Photos</span>
              </span>
            ` : ''}
          </div>
        ` : ''}

        <!-- Details Column -->
        <div class="${item.coverImage ? 'md:col-span-8' : 'md:col-span-12'} flex flex-col justify-between">
          <div>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-2xs">
              ${item.title}
            </h3>

            <!-- Description / Quote -->
            <p class="font-body-md text-body-md text-on-surface-variant line-clamp-3 leading-relaxed mb-space-sm">
              ${item.quote ? `“${item.quote}”` : (item.description || '')}
            </p>

            <!-- Metadata Badges: Place & People -->
            <div class="flex flex-wrap items-center gap-space-xs mb-space-md">
              ${item.place ? `
                <span class="inline-flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-container text-on-surface font-caption text-caption">
                  <span class="material-symbols-outlined text-[16px] text-tertiary">location_on</span>
                  <span>${item.place.name || item.place.region || item.place}</span>
                </span>
              ` : ''}

              ${item.people && item.people.length > 0 ? `
                <div class="inline-flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-container text-on-surface font-caption text-caption">
                  <span class="material-symbols-outlined text-[16px] text-secondary">group</span>
                  <span>${item.people.map(p => p.name).join(', ')}</span>
                </div>
              ` : ''}

              ${isEvent && item.storyCount > 0 ? `
                <span class="inline-flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-container-high text-on-surface font-caption text-caption">
                  <span class="material-symbols-outlined text-[16px] text-primary">auto_stories</span>
                  <span>${item.storyCount} ${item.storyCount === 1 ? 'Story' : 'Stories'}</span>
                </span>
              ` : ''}

              ${item.voiceCount > 0 ? `
                <span class="inline-flex items-center gap-1 px-space-sm py-1 rounded-lg bg-secondary-fixed/40 text-on-secondary-fixed font-caption text-caption font-semibold">
                  <span class="material-symbols-outlined text-[16px]">mic</span>
                  <span>${item.voiceCount} Voice Memory</span>
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Card Action Suite -->
          <div class="pt-space-sm border-t border-surface-container flex flex-wrap items-center gap-space-xs">
            <!-- [View Memory] Button -->
            <button class="timeline-view-btn px-space-md py-space-xs rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                    data-id="${item.id}"
                    data-entity-type="${item.entityType}"
                    type="button">
              <span class="material-symbols-outlined text-[18px]">explore</span>
              <span>${i18nService.t('memories.viewMemory') || 'View Memory'}</span>
            </button>

            <!-- [Hear Story / Hear Memory] Audio Button -->
            ${hasAudio ? `
              <button class="timeline-hear-btn px-space-md py-space-xs rounded-xl ${isPlaying ? 'bg-secondary text-on-secondary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'} font-label-md text-label-md flex items-center gap-1 transition-all cursor-pointer"
                      data-id="${item.id}"
                      type="button">
                <span class="material-symbols-outlined text-[18px]">${isPlaying ? 'pause' : 'volume_up'}</span>
                <span>${isPlaying ? 'Stop' : (hasStory ? (i18nService.t('memories.hearStory') || 'Hear Story') : 'Hear Memory')}</span>
              </button>
            ` : ''}

            <!-- [Tell me about this memory] SmritiAI Companion Button -->
            <button class="timeline-smriti-btn px-space-sm py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-secondary font-label-md text-label-md flex items-center gap-1 transition-colors cursor-pointer"
                    data-id="${item.id}"
                    title="Ask SmritiAI to tell you about this memory"
                    type="button">
              <span class="material-symbols-outlined text-[18px]">neurology</span>
              <span>Tell me about this</span>
            </button>

            <!-- [Recall this memory] Cognitive Activity Link -->
            <a href="#/activities/act-2" class="px-space-sm py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary font-label-md text-label-md flex items-center gap-1 transition-colors"
               title="Open Personal Memory Recall activity">
              <span class="material-symbols-outlined text-[18px]">psychology</span>
              <span>Recall this memory</span>
            </a>
          </div>

          <!-- Inline SmritiAI Explanation Bubble (if active for this card) -->
          ${smritiExplanation && smritiExplanation.itemId === item.id ? `
            <div class="mt-space-sm p-space-md rounded-xl bg-secondary/10 border border-secondary/20 flex items-start gap-space-sm animate-fade-in">
              <span class="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">neurology</span>
              <div class="flex-1 text-on-surface">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-label-md text-label-md text-secondary font-bold">SmritiAI Companion</span>
                  <button class="close-smriti-bubble text-on-surface-variant hover:text-on-surface cursor-pointer text-sm" type="button">✕</button>
                </div>
                <p class="font-body-md text-body-md leading-relaxed">${smritiExplanation.text}</p>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </article>
    `;
  }

  // Render vertical timeline year group
  function renderYearGroup(year, items) {
    return `
    <div class="timeline-year-group relative mb-space-2xl">
      <!-- Year Badge & Node -->
      <div class="sticky top-20 z-20 flex items-center gap-space-sm mb-space-lg bg-surface/90 backdrop-blur-md py-1">
        <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
          <span class="material-symbols-outlined text-[18px]">calendar_today</span>
        </div>
        <h2 class="font-headline-md text-headline-md text-primary font-bold">
          ${year}
        </h2>
        <span class="px-space-sm py-0.5 rounded-full bg-surface-container font-caption text-caption text-on-surface-variant">
          ${items.length} ${items.length === 1 ? 'Moment' : 'Moments'}
        </span>
      </div>

      <!-- Vertical Spine & Cards Container -->
      <div class="relative pl-6 md:pl-10 ml-4 border-l-2 border-primary/20 space-y-space-lg">
        ${items.map(item => `
          <div class="relative">
            <!-- Timeline Node Point on Spine -->
            <div class="absolute -left-[31px] md:-left-[47px] top-6 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface shadow-sm"></div>
            ${renderTimelineCard(item)}
          </div>
        `).join('')}
      </div>
    </div>
    `;
  }

  return `
  <main class="w-full pt-20 bg-surface min-h-[calc(100vh-140px)] pb-space-3xl">
    <div class="max-w-5xl mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl">
      <!-- Header Navigation Breadcrumb -->
      <div class="flex items-center justify-between mb-space-md flex-wrap gap-space-xs">
        <div class="flex items-center gap-space-xs">
          <a href="#/memory-world" class="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all text-label-lg font-label-lg group shadow-sm">
            <span class="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span>${i18nService.t('memories.title') || 'Personal Memory World'}</span>
          </a>
        </div>

        <div class="flex items-center gap-space-xs">
          <!-- Sort Order Toggle -->
          <button id="sortOrderToggleBtn" class="inline-flex items-center gap-1.5 px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer shadow-sm">
            <span class="material-symbols-outlined text-[18px]">${sortOrder === 'desc' ? 'south' : 'north'}</span>
            <span>${sortOrder === 'desc' ? (i18nService.t('memories.sortNewest') || 'Newest First') : (i18nService.t('memories.sortOldest') || 'Oldest First')}</span>
          </button>
        </div>
      </div>

      <!-- Banner Header -->
      <div class="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg lg:p-space-xl mb-space-xl shadow-sm border border-surface-container">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div>
            <div class="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-secondary-fixed/50 text-on-secondary-fixed font-caption text-caption mb-space-xs font-semibold">
              <span class="material-symbols-outlined text-[16px]">history_toggle_off</span>
              <span>Chronological Memory Journey</span>
            </div>
            <h1 class="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              ${i18nService.t('memories.timelineTitle') || 'Memory Timeline'}
            </h1>
            <p class="font-body-lg text-body-lg text-on-surface-variant mt-1">
              ${i18nService.t('memories.timelineSubtitle') || 'Walk through your special moments.'}
            </p>
          </div>

          <div class="flex items-center gap-space-sm">
            <div class="px-space-md py-space-sm rounded-xl bg-surface-container-low border border-surface-container text-center">
              <span class="block font-caption text-caption text-on-surface-variant uppercase font-semibold">Total Milestones</span>
              <span class="block font-headline-md text-headline-md font-bold text-primary">${totalCount}</span>
            </div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="mt-space-lg pt-space-md border-t border-surface-container flex items-center gap-space-sm">
          <div class="relative flex-1">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">search</span>
            <input id="timelineSearchInput" 
                   type="text" 
                   value="${searchQuery}" 
                   placeholder="Search people, places, events, or moments..."
                   class="w-full h-12 pl-12 pr-4 rounded-xl bg-surface-container-low border border-surface-container text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm" />
          </div>
          ${searchQuery ? `
            <button id="clearSearchBtn" class="h-12 px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md cursor-pointer transition-colors" type="button">
              Clear
            </button>
          ` : ''}
        </div>

        <!-- Filter Chips: Types -->
        <div class="mt-space-md flex flex-wrap items-center gap-space-2xs" id="timelineTypeFilters">
          ${filterTabs.map(tab => `
            <button class="timeline-type-chip px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
              activeTypeFilter === tab.key 
                ? 'bg-primary text-on-primary shadow-sm font-semibold' 
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }" data-filter="${tab.key}" type="button">
              ${tab.label}
            </button>
          `).join('')}
        </div>

        <!-- Year Chips (if multiple years exist) -->
        ${years.length > 1 ? `
          <div class="mt-space-sm pt-space-xs flex flex-wrap items-center gap-space-2xs" id="timelineYearFilters">
            <span class="font-caption text-caption text-on-surface-variant font-semibold mr-1">Year:</span>
            <button class="timeline-year-chip px-space-sm py-1 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
              activeYearFilter === 'all' 
                ? 'bg-secondary text-on-secondary shadow-sm font-semibold' 
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }" data-year="all" type="button">
              All Years
            </button>
            ${years.map(yr => `
              <button class="timeline-year-chip px-space-sm py-1 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                activeYearFilter === yr 
                  ? 'bg-secondary text-on-secondary shadow-sm font-semibold' 
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }" data-year="${yr}" type="button">
                ${yr}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Timeline Stream / Empty State -->
      ${totalCount === 0 ? `
        <div class="my-space-3xl max-w-lg mx-auto">
          ${renderEmptyState(
            i18nService.t('memories.timelineEmptyWaiting') || 'Your memory timeline is waiting for your first special moment.',
            'Cherished memories, family celebrations, and peaceful places will appear here along your timeline.',
            'history_toggle_off'
          )}
        </div>
      ` : filteredCount === 0 ? `
        <div class="my-space-3xl max-w-lg mx-auto">
          ${renderEmptyState(
            i18nService.t('memories.timelineNoResults') || 'No memories found.',
            'No saved moments match your current filter or search query. Try clearing the filter.',
            'search_off'
          )}
          <div class="text-center mt-space-md">
            <button id="resetTimelineFiltersBtn" class="px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary-container cursor-pointer">
              Reset Filters
            </button>
          </div>
        </div>
      ` : `
        <div class="timeline-stream-container">
          ${Object.keys(yearGroups).map(year => renderYearGroup(year, yearGroups[year])).join('')}
        </div>
      `}
    </div>
  </main>
  `;
}

export function attachMemoryTimelineEvents() {
  const container = document.querySelector('main');
  if (!container) return;

  function refreshTimeline() {
    const contentEl = document.getElementById('content');
    if (contentEl) {
      contentEl.innerHTML = renderMemoryTimelineView();
      attachMemoryTimelineEvents();
    }
  }

  // Type Filters
  document.querySelectorAll('.timeline-type-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTypeFilter = btn.getAttribute('data-filter') || 'all';
      refreshTimeline();
    });
  });

  // Year Filters
  document.querySelectorAll('.timeline-year-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeYearFilter = btn.getAttribute('data-year') || 'all';
      refreshTimeline();
    });
  });

  // Search Input
  const searchInput = document.getElementById('timelineSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      refreshTimeline();
      const newInp = document.getElementById('timelineSearchInput');
      if (newInp) {
        newInp.focus();
        newInp.selectionStart = newInp.selectionEnd = newInp.value.length;
      }
    });
  }

  // Clear Search Button
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchQuery = '';
      refreshTimeline();
    });
  }

  // Reset Filters Button
  const resetBtn = document.getElementById('resetTimelineFiltersBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeTypeFilter = 'all';
      activeYearFilter = 'all';
      searchQuery = '';
      refreshTimeline();
    });
  }

  // Sort Order Toggle Button
  const sortBtn = document.getElementById('sortOrderToggleBtn');
  if (sortBtn) {
    sortBtn.addEventListener('click', () => {
      sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
      refreshTimeline();
    });
  }

  // [View Memory] Action
  document.querySelectorAll('.timeline-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const entityType = btn.getAttribute('data-entity-type');

      if (entityType === 'memory') {
        const mem = memoryService.getMemoryById(id);
        if (mem) {
          store.setSelectedMemoryDetail(mem);
          store.setMemoryDetailModalOpen(true);
        }
      } else if (entityType === 'event') {
        const evtCtx = memoryService.getEventWithContext(id);
        if (evtCtx) {
          store.setSelectedEntityDetail('event', evtCtx);
          store.setEntityDetailModalOpen(true);
        }
      } else if (entityType === 'person') {
        const pCtx = memoryService.getPersonWithContext(id);
        if (pCtx) {
          store.setSelectedEntityDetail('person', pCtx);
          store.setEntityDetailModalOpen(true);
        }
      } else if (entityType === 'place') {
        const plcCtx = memoryService.getPlaceWithContext(id);
        if (plcCtx) {
          store.setSelectedEntityDetail('place', plcCtx);
          store.setEntityDetailModalOpen(true);
        }
      } else if (entityType === 'story') {
        const styCtx = memoryService.getStoryWithContext(id);
        if (styCtx) {
          store.setSelectedEntityDetail('story', styCtx);
          store.setEntityDetailModalOpen(true);
        }
      }
    });
  });

  // [Favorite] Action
  document.querySelectorAll('.timeline-fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const entityType = btn.getAttribute('data-entity-type');

      let targetMemoryId = id;
      if (entityType === 'event') {
        const patientId = store.getCurrentPatientId();
        const mems = memoryService.getPatientMemories(patientId).filter(m => m.eventId === id);
        if (mems.length > 0) targetMemoryId = mems[0].id;
      }

      const isFav = store.toggleMemoryFavorite(targetMemoryId);
      showToast(isFav ? 'Added to Favorites' : 'Removed from Favorites', 'favorite');
      refreshTimeline();
    });
  });

  // [Hear Story / Hear Memory] Audio Action
  document.querySelectorAll('.timeline-hear-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');

      if (playingItemId === id) {
        voiceService.stop();
        playingItemId = null;
        refreshTimeline();
        return;
      }

      // Stop any ongoing speech
      voiceService.stop();
      playingItemId = id;

      const patientId = store.getCurrentPatientId();
      const timelineData = memoryService.getMemoryTimeline(patientId);
      const item = timelineData.items.find(i => i.id === id);

      if (item) {
        const spoken = item.voiceMemory?.transcript || item.story?.text || item.description || item.quote || item.title;
        showToast(`Reading: ${item.title}`, 'volume_up');
        voiceService.speak(`${item.title}. ${spoken}`, {
          lang: i18nService.getLanguage(),
          onEnd: () => {
            playingItemId = null;
            refreshTimeline();
          }
        });
      }
      refreshTimeline();
    });
  });

  // [Tell me about this memory] SmritiAI Companion Action
  document.querySelectorAll('.timeline-smriti-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const patientId = store.getCurrentPatientId();
      const timelineData = memoryService.getMemoryTimeline(patientId);
      const item = timelineData.items.find(i => i.id === id);

      if (!item) return;

      const resp = await smritiAIService.generateResponse(`Tell me about this memory: ${item.title}`, patientId);
      smritiExplanation = {
        itemId: id,
        text: resp.text || resp.spokenText || `${item.title} is a cherished memory from ${item.date}.`
      };
      refreshTimeline();

      // Read aloud gently
      if (resp.spokenText) {
        voiceService.speak(resp.spokenText, { lang: i18nService.getLanguage() });
      }
    });
  });

  // Close SmritiAI Bubble
  document.querySelectorAll('.close-smriti-bubble').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      smritiExplanation = null;
      refreshTimeline();
    });
  });
}
