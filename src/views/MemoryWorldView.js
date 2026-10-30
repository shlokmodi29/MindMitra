// Memory World View - Living Archive with Interconnected Memory Knowledge Graph
// Enhanced in Part 4 with Canonical Relational Architecture, Filtering, Favorites, & Modals
// Enhanced in Part 8 with Voice & Multilingual Experience
import { store } from '../state/store.js';
import { voiceService } from '../services/voiceService.js';
import { i18nService } from '../services/i18nService.js';
import { memoryService, MEMORY_CATEGORIES, FALLBACK_MEMORY_IMAGE } from '../services/memoryService.js';
import { renderMemoryGraph, attachMemoryGraphEvents } from '../components/MemoryGraphView.js';
import { renderEmptyState } from '../components/FeedbackStates.js';
import { showToast } from '../components/Toast.js';

let activeCategory = 'All Memories';
let searchQuery = '';
let isPlayingHeroAudio = false;
let showGraph = false;

export function renderMemoryWorldView() {
  const state = store.getState();
  const patientId = store.getCurrentPatientId();
  const patient = state.currentUser || state.profile || state.users[0];
  const patientName = patient?.name || 'Asha Devi';
  
  const allPatientMemories = memoryService.getPatientMemories(patientId);
  const heroMemory = allPatientMemories[0] || state.memories[0] || {
    id: 'mem-1',
    title: 'Tea Garden Morning, Shillong',
    category: 'Places',
    season: 'Autumn 2018',
    companions: 'With Meera & Granddaughter Priya',
    quote: 'The fresh mist rising from the emerald slopes of the Khasi hills.',
    timeOfDay: '6:45 AM Crisp Chill',
    cue: 'Ginger Cinnamon Aroma',
    duration: '3m 40s',
    audioTitle: 'Playing: Shillong Tea Garden Reminiscence',
    image: FALLBACK_MEMORY_IMAGE,
    narrationText: 'A peaceful autumn memory in the Khasi hills.'
  };

  const tabs = [
    'All Memories',
    'People',
    'Places',
    'Special Moments',
    'Stories',
    'Voice Notes',
    'Favorites',
    'Important'
  ];

  // Resolve content based on active category
  let renderedGrid = '';
  let countLabel = 0;

  if (activeCategory === 'People') {
    const peopleList = memoryService.getPeople(patientId).filter(p => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || (p.relation && p.relation.toLowerCase().includes(q)) || (p.bio && p.bio.toLowerCase().includes(q));
    });
    countLabel = peopleList.length;

    if (peopleList.length === 0) {
      renderedGrid = `
        <div class="col-span-full my-space-xl">
          ${renderEmptyState('No people found', 'Your loving family and care circle are safe. Try a different search query.', 'people')}
        </div>
      `;
    } else {
      renderedGrid = peopleList.map(p => {
        const pContext = memoryService.getPersonWithContext(p.id) || { memories: [] };
        return `
        <article class="flex flex-col justify-between rounded-xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md transition-all border border-surface-container p-space-lg">
          <div class="flex items-start gap-space-md">
            <img class="w-20 h-20 rounded-2xl object-cover shadow-sm shrink-0 border border-surface-container" 
                 src="${p.avatar || FALLBACK_MEMORY_IMAGE}" 
                 alt="${p.name}"
                 onerror="this.onerror=null; this.src='${FALLBACK_MEMORY_IMAGE}';"/>
            <div class="min-w-0 flex-1">
              <span class="px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">
                ${p.relation || 'Family'}
              </span>
              <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold mt-1 truncate">${p.name}</h4>
              <p class="font-caption text-caption text-primary font-medium">${p.proximity || 'In your loving circle'}</p>
              <p class="font-body-md text-body-md text-on-surface-variant mt-2 line-clamp-2">${p.bio || ''}</p>
            </div>
          </div>

          <div class="mt-space-md pt-space-md border-t border-surface-container flex items-center justify-between">
            <span class="font-caption text-caption text-on-surface-variant font-semibold">
              ${pContext.memories.length} Connected Memories
            </span>
            <button class="person-card-action px-space-md min-h-[40px] rounded-xl bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md transition-colors cursor-pointer flex items-center gap-1" data-id="${p.id}" type="button">
              <span class="material-symbols-outlined text-[18px]">person</span>
              <span>View Person</span>
            </button>
          </div>
        </article>
        `;
      }).join('');
    }

  } else if (activeCategory === 'Places') {
    const placesList = memoryService.getPlaces(patientId).filter(plc => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return plc.name.toLowerCase().includes(q) || (plc.region && plc.region.toLowerCase().includes(q)) || (plc.description && plc.description.toLowerCase().includes(q));
    });
    countLabel = placesList.length;

    if (placesList.length === 0) {
      renderedGrid = `
        <div class="col-span-full my-space-xl">
          ${renderEmptyState('No places found', 'Your peaceful sanctuaries are safe. Try a different search query.', 'location_on')}
        </div>
      `;
    } else {
      renderedGrid = placesList.map(plc => {
        const plcContext = memoryService.getPlaceWithContext(plc.id) || { memories: [] };
        return `
        <article class="flex flex-col justify-between rounded-xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md transition-all border border-surface-container">
          <div class="relative h-48 w-full overflow-hidden">
            <img class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                 src="${plc.image || FALLBACK_MEMORY_IMAGE}" 
                 alt="${plc.name}"
                 onerror="this.onerror=null; this.src='${FALLBACK_MEMORY_IMAGE}';"/>
            <div class="absolute top-3 left-3 px-space-xs py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md flex items-center gap-1 font-caption text-caption text-on-surface font-semibold shadow-sm">
              <span class="material-symbols-outlined text-[16px] text-secondary">location_on</span>
              <span>${plc.region || 'Sanctuary'}</span>
            </div>
          </div>

          <div class="p-space-lg flex flex-col justify-between flex-1">
            <div>
              <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold truncate">${plc.name}</h4>
              <p class="font-body-md text-body-md text-on-surface-variant mt-1 line-clamp-3">${plc.description || ''}</p>
            </div>

            <div class="mt-space-md pt-space-md border-t border-surface-container flex items-center justify-between">
              <span class="font-caption text-caption text-on-surface-variant font-semibold">
                ${plcContext.memories.length} Connected Memories
              </span>
              <button class="place-card-action px-space-md min-h-[40px] rounded-xl bg-surface-container hover:bg-secondary hover:text-on-secondary text-on-surface font-label-md text-label-md transition-colors cursor-pointer flex items-center gap-1" data-id="${plc.id}" type="button">
                <span class="material-symbols-outlined text-[18px]">explore</span>
                <span>Explore Place</span>
              </button>
            </div>
          </div>
        </article>
        `;
      }).join('');
    }

  } else if (activeCategory === 'Stories') {
    const storiesList = memoryService.getStories(patientId).filter(s => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return s.title.toLowerCase().includes(q) || (s.text && s.text.toLowerCase().includes(q)) || (s.author && s.author.toLowerCase().includes(q));
    });
    countLabel = storiesList.length;

    if (storiesList.length === 0) {
      renderedGrid = `
        <div class="col-span-full my-space-xl">
          ${renderEmptyState('No stories found', 'Your family narratives are preserved safely. Try a different search query.', 'auto_stories')}
        </div>
      `;
    } else {
      renderedGrid = storiesList.map(s => {
        return `
        <article class="flex flex-col justify-between rounded-xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md transition-all border border-surface-container p-space-lg">
          <div>
            <div class="flex items-center justify-between mb-space-xs">
              <span class="px-space-xs py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-caption font-semibold">
                Family Story
              </span>
              <span class="font-caption text-caption text-on-surface-variant">${s.duration || 'Spoken Story'}</span>
            </div>
            <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold mt-2 truncate">${s.title}</h4>
            <span class="font-caption text-caption text-primary block mt-0.5">Narrated by ${s.author || 'Family Member'}</span>
            <p class="font-body-md text-body-md text-on-surface-variant mt-2 line-clamp-4 leading-relaxed">${s.text}</p>
          </div>

          <div class="mt-space-lg pt-space-md border-t border-surface-container flex items-center justify-between">
            <button class="story-card-action w-full min-h-[44px] rounded-xl bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md transition-colors cursor-pointer flex items-center justify-center gap-1" data-id="${s.id}" type="button">
              <span class="material-symbols-outlined text-[20px]">menu_book</span>
              <span>Read / Listen to Story</span>
            </button>
          </div>
        </article>
        `;
      }).join('');
    }

  } else {
    // Standard Memories (All Memories, Special Moments, Voice Notes, Favorites, Important)
    const filteredMemories = memoryService.filterMemories(patientId, {
      category: activeCategory,
      search: searchQuery
    });
    countLabel = filteredMemories.length;

    if (filteredMemories.length === 0) {
      renderedGrid = `
        <div class="col-span-full my-space-xl">
          ${renderEmptyState('No memories found', 'Everything is safe in your sanctuary. Try searching for a different word or select All Memories.', 'auto_stories')}
        </div>
      `;
    } else {
      renderedGrid = filteredMemories.map(item => {
        const isFav = Boolean(item.favorite);
        const isImp = Boolean(item.important);

        return `
        <article class="flex flex-col justify-between rounded-xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md transition-all border border-surface-container">
          <div>
            ${item.image ? `
              <div class="relative h-48 w-full overflow-hidden bg-surface-container-low">
                <img class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                     src="${item.image || FALLBACK_MEMORY_IMAGE}" 
                     alt="${item.title}"
                     onerror="this.onerror=null; this.src='${FALLBACK_MEMORY_IMAGE}';"/>
                <div class="absolute top-3 left-3 px-space-xs py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md flex items-center gap-1 font-caption text-caption text-on-surface font-semibold shadow-sm">
                  <span class="material-symbols-outlined text-[16px] text-primary">auto_stories</span>
                  <span>${item.category}</span>
                </div>
                ${item.year ? `
                  <div class="absolute bottom-3 right-3 px-space-xs py-0.5 rounded-md bg-inverse-surface/80 text-inverse-on-surface font-caption text-caption">
                    ${item.year}
                  </div>
                ` : ''}

                <!-- Quick Favorite & Important overlay icons -->
                <div class="absolute top-3 right-3 flex items-center gap-1">
                  <button class="quick-favorite-btn w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface hover:text-primary flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-sm" data-id="${item.id}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" type="button">
                    <span class="material-symbols-outlined text-[18px] ${isFav ? 'text-primary' : ''}" style="${isFav ? "font-variation-settings: 'FILL' 1;" : ''}">favorite</span>
                  </button>
                  <button class="quick-important-btn w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface hover:text-secondary flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-sm" data-id="${item.id}" title="${isImp ? 'Important memory' : 'Mark important'}" type="button">
                    <span class="material-symbols-outlined text-[18px] ${isImp ? 'text-secondary' : ''}" style="${isImp ? "font-variation-settings: 'FILL' 1;" : ''}">bookmark</span>
                  </button>
                </div>
              </div>
            ` : `
              <div class="relative h-48 w-full bg-secondary flex flex-col justify-between p-space-md text-on-secondary">
                <div class="flex items-center justify-between">
                  <span class="px-space-xs py-1 rounded-full bg-on-secondary/15 backdrop-blur-md flex items-center gap-1 font-caption text-caption text-secondary-fixed font-semibold">
                    <span class="material-symbols-outlined text-[16px]">mic</span>
                    <span>${item.category}</span>
                  </span>
                  <div class="flex items-center gap-1">
                    <button class="quick-favorite-btn w-8 h-8 rounded-full bg-on-secondary/20 text-on-secondary hover:text-primary flex items-center justify-center transition-transform hover:scale-110 cursor-pointer" data-id="${item.id}" type="button">
                      <span class="material-symbols-outlined text-[18px] ${isFav ? 'text-primary' : ''}" style="${isFav ? "font-variation-settings: 'FILL' 1;" : ''}">favorite</span>
                    </button>
                    <span class="font-caption text-caption text-secondary-fixed ml-1">${item.duration || 'Voice Memo'}</span>
                  </div>
                </div>
                <div class="flex items-center justify-center gap-1.5 py-space-sm">
                  <span class="w-1.5 h-6 bg-secondary-fixed rounded-full wave-bar"></span>
                  <span class="w-1.5 h-12 bg-secondary-fixed rounded-full wave-bar"></span>
                  <span class="w-1.5 h-16 bg-on-secondary rounded-full wave-bar"></span>
                  <span class="w-1.5 h-8 bg-secondary-fixed rounded-full wave-bar"></span>
                  <span class="w-1.5 h-14 bg-on-secondary rounded-full wave-bar"></span>
                  <span class="w-1.5 h-20 bg-secondary-fixed rounded-full wave-bar"></span>
                  <span class="w-1.5 h-10 bg-secondary-fixed rounded-full wave-bar"></span>
                  <span class="w-1.5 h-5 bg-secondary-fixed-dim rounded-full wave-bar"></span>
                </div>
                <div class="flex items-center justify-between text-secondary-fixed font-caption text-caption">
                  <span>${item.languages || 'Bilingual'}</span>
                  <span class="material-symbols-outlined text-[20px]">volume_up</span>
                </div>
              </div>
            `}

            <div class="p-space-lg flex flex-col gap-space-sm">
              <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold truncate">
                ${item.title}
              </h4>
              <p class="font-body-md text-body-md text-on-surface-variant line-clamp-3 leading-relaxed">
                ${item.quote ? `“${item.quote}”` : (item.description || '')}
              </p>
              ${item.tags && item.tags.length > 0 ? `
                <div class="flex flex-wrap gap-space-2xs pt-space-xs">
                  ${item.tags.slice(0, 3).map(t => `
                    <span class="px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">
                      ${t}
                    </span>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>

          <div class="p-space-lg pt-0 flex items-center gap-2">
            <button class="memory-card-action flex-1 min-h-[50px] px-space-md rounded-xl bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center gap-space-xs cursor-pointer" data-id="${item.id}" type="button">
              <span class="material-symbols-outlined text-[20px]">${item.category === 'Voice Notes' ? 'play_arrow' : 'explore'}</span>
              <span>${item.category === 'Voice Notes' ? 'Play Voice Note' : 'Walk Through Memory'}</span>
            </button>
            <button class="memory-hear-action w-12 min-h-[50px] rounded-xl bg-surface-container hover:bg-primary-container text-primary flex items-center justify-center cursor-pointer transition-colors" data-id="${item.id}" title="${i18nService.t('memories.hearMemory')}" type="button" aria-label="Hear memory">
              <span class="material-symbols-outlined text-[22px]">volume_up</span>
            </button>
          </div>
        </article>
        `;
      }).join('');
    }
  }

  return `
  <main class="w-full pt-20 bg-surface min-h-[calc(100vh-140px)]">
    <div class="max-w-7xl mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl">
      <div class="flex flex-col w-full">
        <!-- Return to Home Navigation -->
        <div class="flex items-center justify-between mb-space-md">
          <a href="#/patient-home" class="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all text-label-lg font-label-lg group shadow-sm">
            <span class="material-symbols-outlined text-[22px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span>Return to Home</span>
          </a>
        </div>

        <!-- Sanctuary Header & Search Panel -->
        <div class="relative w-full overflow-hidden rounded-xl bg-surface-container-low p-space-lg lg:p-space-xl mb-space-xl shadow-sm border border-surface-container">
          <div class="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
          <div class="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-secondary/5 blur-2xl pointer-events-none"></div>

          <div class="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg">
            <div class="max-w-2xl">
              <div class="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-secondary-fixed/40 text-on-secondary-fixed font-caption text-caption mb-space-xs font-semibold">
                <span class="material-symbols-outlined text-[16px] text-secondary">auto_stories</span>
                <span>Personal Sanctuary &amp; Reminiscence</span>
              </div>
              <h1 class="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">Personal Memory World</h1>
              <p class="font-body-lg text-body-lg text-on-surface-variant mt-space-2xs">
                My people, places, stories and moments. Reconnect with what matters.
              </p>
              <div class="flex items-center gap-space-xs text-tertiary font-label-md text-label-md mt-space-sm">
                <span class="material-symbols-outlined text-[18px]">favorite</span>
                <span>Take all the time you need. Every memory here is yours.</span>
              </div>
            </div>

            <!-- Search & Voice Ask -->
            <div class="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm">
              <div class="relative flex-1 sm:w-80">
                <input id="memorySearchInput" 
                       value="${searchQuery}"
                       class="w-full h-14 pl-12 pr-4 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 border border-surface-container" 
                       placeholder="Search moments, people or places..." 
                       type="text"/>
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">search</span>
              </div>
              <button id="voiceSearchBtn" class="h-14 px-space-lg rounded-xl bg-secondary text-on-secondary flex items-center justify-center gap-space-xs font-label-lg text-label-lg shadow-sm hover:opacity-95 active:scale-95 transition-all shrink-0 cursor-pointer" type="button">
                <span class="material-symbols-outlined text-[24px]">mic</span>
                <span>Ask SmritiAI</span>
              </button>
            </div>
          </div>

          <!-- Memory Category Filter Tabs & Graph Toggle -->
          <div class="mt-space-lg pt-space-md flex flex-wrap items-center justify-between gap-space-md border-t border-surface-container">
            <div class="flex flex-wrap items-center gap-space-xs" id="memoryTabsContainer">
              ${tabs.map(tab => `
                <button class="memory-tab px-space-md py-space-sm rounded-xl font-label-lg text-label-lg transition-colors cursor-pointer ${
                  activeCategory === tab 
                    ? 'bg-primary text-on-primary shadow-sm font-semibold' 
                    : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container shadow-sm'
                }" data-tab="${tab}" type="button">
                  ${tab}
                </button>
              `).join('')}
            </div>

            <div class="flex items-center gap-space-xs flex-wrap">
              <a href="#/voice-journal" class="px-space-md py-space-xs rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-space-xs transition-all cursor-pointer shadow-sm" id="memoryWorldVoiceJournalBtn">
                <span class="material-symbols-outlined text-[18px]">mic</span>
                <span>Voice Journal</span>
              </a>

              <a href="#/memory-timeline" class="px-space-md py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-space-xs transition-all cursor-pointer shadow-sm">
                <span class="material-symbols-outlined text-[18px]">history_toggle_off</span>
                <span>Memory Timeline</span>
              </a>

              <button id="toggleGraphBtn" class="px-space-md py-space-xs rounded-xl ${showGraph ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'} font-label-md text-label-md flex items-center gap-space-xs transition-all cursor-pointer">
                <span class="material-symbols-outlined text-[18px]">account_tree</span>
                <span>${showGraph ? 'Hide Memory Graph' : 'View Memory Graph'}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Optional Interactive Memory Knowledge Graph -->
        ${showGraph ? `
          <div id="memory-graph-container">
            ${renderMemoryGraph()}
          </div>
        ` : ''}

        <!-- Spotlight Heirloom Card (Visible for All Memories or Places) -->
        ${(activeCategory === 'All Memories' || activeCategory === 'Places' || activeCategory === 'Special Moments') && heroMemory ? `
          <section class="relative w-full rounded-xl bg-surface-container-lowest overflow-hidden shadow-md mb-space-2xl border border-surface-container">
            <div class="grid grid-cols-1 lg:grid-cols-12">
              <div class="lg:col-span-7 relative min-h-[380px] lg:min-h-[520px] overflow-hidden bg-surface-container-low">
                <img class="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105" 
                     src="${heroMemory.image || heroMemory.coverPhoto || FALLBACK_MEMORY_IMAGE}" 
                     alt="${heroMemory.title}"
                     onerror="this.onerror=null; this.src='${FALLBACK_MEMORY_IMAGE}';"/>
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden"></div>
                <div class="absolute top-space-md left-space-md flex flex-wrap gap-space-xs">
                  <span class="px-space-sm py-space-2xs rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-label-md text-label-md shadow-sm font-semibold">
                    Spotlight Heirloom
                  </span>
                  <span class="px-space-sm py-space-2xs rounded-full bg-black/40 backdrop-blur-md text-surface-container-lowest font-caption text-caption">
                    ${heroMemory.season || heroMemory.year || ''}
                  </span>
                </div>
              </div>

              <div class="lg:col-span-5 p-space-lg lg:p-space-xl flex flex-col justify-between bg-surface-container-lowest">
                <div>
                  <div class="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md mb-space-xs">
                    <span class="material-symbols-outlined text-secondary text-[20px]">group</span>
                    <span>${heroMemory.companions || 'Family Keepsake'}</span>
                  </div>
                  <h2 class="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-md font-bold">
                    ${heroMemory.title}
                  </h2>
                  <div class="relative p-space-md rounded-xl bg-surface-container-low text-on-surface-variant font-body-lg text-body-lg leading-relaxed mb-space-lg">
                    <span class="material-symbols-outlined text-primary/30 text-[36px] absolute -top-3 -left-2 select-none">format_quote</span>
                    <p class="relative z-10 italic pl-space-sm">
                      “${heroMemory.quote || heroMemory.description || ''}”
                    </p>
                  </div>

                  <div class="grid grid-cols-2 gap-space-sm mb-space-lg">
                    <div class="p-space-sm rounded-xl bg-surface-container flex items-center gap-space-sm">
                      <span class="material-symbols-outlined text-primary text-[24px]">wb_twilight</span>
                      <div class="flex flex-col">
                        <span class="font-caption text-caption text-on-surface-variant">Time of Day</span>
                        <span class="font-label-md text-label-md text-on-surface font-semibold">${heroMemory.timeOfDay || 'Daytime'}</span>
                      </div>
                    </div>
                    <div class="p-space-sm rounded-xl bg-surface-container flex items-center gap-space-sm">
                      <span class="material-symbols-outlined text-tertiary text-[24px]">coffee</span>
                      <div class="flex flex-col">
                        <span class="font-caption text-caption text-on-surface-variant">Memory Cue</span>
                        <span class="font-label-md text-label-md text-on-surface font-semibold">${heroMemory.cue || 'Warm Keepsake'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-space-sm pt-space-sm">
                  <div class="flex flex-wrap items-center gap-space-sm">
                    <button id="playHeroStoryBtn" class="flex-1 min-h-[56px] px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-md hover:bg-primary-container transition-all cursor-pointer active:scale-95" type="button">
                      <span class="material-symbols-outlined text-[24px]" id="heroPlayIcon">${isPlayingHeroAudio ? 'pause' : 'headphones'}</span>
                      <span id="heroPlayLabel">${isPlayingHeroAudio ? 'Pause Narration' : `Listen to Story (${heroMemory.duration || '2 mins'})`}</span>
                    </button>
                    <a href="#/family-circle" class="min-h-[56px] px-space-md rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high transition-colors flex items-center justify-center gap-space-2xs cursor-pointer">
                      <span class="material-symbols-outlined text-[20px]">photo_library</span>
                      <span>Connected People</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dynamic Audio Wave Banner -->
            <div class="${isPlayingHeroAudio ? 'flex' : 'hidden'} p-space-md bg-secondary text-on-secondary items-center justify-between gap-space-md transition-all border-t border-secondary-fixed/20" id="audioWaveBanner">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined animate-pulse text-[28px]">graphic_eq</span>
                <div class="flex flex-col">
                  <span class="font-label-lg text-label-lg text-on-secondary font-bold">${heroMemory.audioTitle || 'Playing Narration'}</span>
                  <span class="font-caption text-caption text-secondary-fixed-dim">Gentle sensory audio narration • Recorded with loving care</span>
                </div>
              </div>
              <div class="flex items-center gap-space-sm">
                <button class="w-10 h-10 rounded-full bg-on-secondary text-secondary flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" id="pauseHeroAudioBtn" type="button">
                  <span class="material-symbols-outlined text-[20px]">pause</span>
                </button>
              </div>
            </div>
          </section>
        ` : ''}

        <!-- Archive Section Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
          <div>
            <span class="font-caption text-caption text-primary tracking-wider uppercase font-semibold">Living Memory Archive</span>
            <h3 class="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
              ${activeCategory === 'All Memories' ? `Curated Threads of ${patientName}` : `${activeCategory} Collection`}
            </h3>
          </div>
          <div class="flex items-center gap-space-xs">
            <span class="font-caption text-caption text-on-surface-variant">Showing:</span>
            <span class="font-label-md text-label-md text-on-surface bg-surface-container px-space-sm py-space-2xs rounded-lg font-medium">
              ${countLabel} Items
            </span>
          </div>
        </div>

        <!-- Dynamic Grid Content -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg mb-space-3xl">
          ${renderedGrid}
        </div>
      </div>
    </div>
  </main>
  `;
}

export function attachMemoryWorldEvents() {
  const tabs = document.querySelectorAll('.memory-tab');
  const searchInput = document.getElementById('memorySearchInput');
  const voiceSearchBtn = document.getElementById('voiceSearchBtn');
  const playHeroBtn = document.getElementById('playHeroStoryBtn');
  const pauseHeroBtn = document.getElementById('pauseHeroAudioBtn');
  const cardActions = document.querySelectorAll('.memory-card-action');
  const quickFavBtns = document.querySelectorAll('.quick-favorite-btn');
  const quickImpBtns = document.querySelectorAll('.quick-important-btn');
  const personActions = document.querySelectorAll('.person-card-action');
  const placeActions = document.querySelectorAll('.place-card-action');
  const storyActions = document.querySelectorAll('.story-card-action');
  const toggleGraphBtn = document.getElementById('toggleGraphBtn');

  if (toggleGraphBtn) {
    toggleGraphBtn.addEventListener('click', () => {
      showGraph = !showGraph;
      refreshView();
    });
  }

  if (showGraph) {
    attachMemoryGraphEvents();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeCategory = tab.getAttribute('data-tab');
      refreshView();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      refreshView();
      const newInp = document.getElementById('memorySearchInput');
      if (newInp) {
        newInp.focus();
        newInp.selectionStart = newInp.selectionEnd = newInp.value.length;
      }
    });
  }

  if (voiceSearchBtn) {
    voiceSearchBtn.addEventListener('click', () => {
      store.setVoiceModalOpen(true);
    });
  }

  if (playHeroBtn) {
    playHeroBtn.addEventListener('click', () => {
      const state = store.getState();
      const hero = state.memories[0];
      if (!hero) return;

      if (!isPlayingHeroAudio) {
        isPlayingHeroAudio = true;
        const text = hero.narrationText || hero.description || hero.quote || hero.title;
        voiceService.speak(text, {
          lang: i18nService.getLanguage(),
          onEnd: () => {
            isPlayingHeroAudio = false;
            refreshView();
          }
        });
      } else {
        isPlayingHeroAudio = false;
        voiceService.stop();
      }
      refreshView();
    });
  }

  if (pauseHeroBtn) {
    pauseHeroBtn.addEventListener('click', () => {
      isPlayingHeroAudio = false;
      voiceService.stop();
      refreshView();
    });
  }

  // Hear individual memory button
  document.querySelectorAll('.memory-hear-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const state = store.getState();
      const mem = (state.memories || []).find(m => m.id === id);
      if (mem) {
        if (voiceService.isSpeaking()) {
          voiceService.stop();
          showToast('Speech stopped', 'stop');
          return;
        }
        const shortDescription = (mem.narrationText || mem.description || mem.quote || mem.title).slice(0, 220);
        showToast(`Reading memory: ${mem.title}`, 'volume_up');
        voiceService.speak(`${mem.title}. ${shortDescription}`, {
          lang: i18nService.getLanguage()
        });
      }
    });
  });

  cardActions.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = memoryService.getMemoryById(id);
      if (item) {
        store.setSelectedMemoryDetail(item);
        store.setMemoryDetailModalOpen(true);
      }
    });
  });

  quickFavBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const isFav = store.toggleMemoryFavorite(id);
      showToast(isFav ? 'Added to Favorites' : 'Removed from Favorites', 'favorite');
      refreshView();
    });
  });

  quickImpBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const isImp = store.toggleMemoryImportant(id);
      showToast(isImp ? 'Marked as Important' : 'Unmarked from Important', 'bookmark');
      refreshView();
    });
  });

  personActions.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const pContext = memoryService.getPersonWithContext(id);
      if (pContext) {
        store.setSelectedEntityDetail('person', pContext);
        store.setEntityDetailModalOpen(true);
      }
    });
  });

  placeActions.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const plcContext = memoryService.getPlaceWithContext(id);
      if (plcContext) {
        store.setSelectedEntityDetail('place', plcContext);
        store.setEntityDetailModalOpen(true);
      }
    });
  });

  storyActions.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const sContext = memoryService.getStoryWithContext(id);
      if (sContext) {
        store.setSelectedEntityDetail('story', sContext);
        store.setEntityDetailModalOpen(true);
      }
    });
  });

  function refreshView() {
    const contentEl = document.getElementById('view-content');
    if (contentEl) {
      contentEl.innerHTML = renderMemoryWorldView();
      attachMemoryWorldEvents();
    }
  }
}
