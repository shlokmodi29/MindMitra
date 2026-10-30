// Family Circle View - 100% Faithful to Stitch Design System
// Enhanced in Part 9 with Patient Isolation, Category Filters, Shared Memory Journeys, and Voice Check-ins
import { store } from '../state/store.js';
import { memoryService, FALLBACK_MEMORY_IMAGE } from '../services/memoryService.js';
import { voiceService } from '../services/voiceService.js';
import { showToast } from '../components/Toast.js';

let activeCategoryFilter = 'all';

export function renderFamilyCircleView() {
  const patientId = store.getCurrentPatientId();
  const allPeople = memoryService.getPeople(patientId);
  const state = store.getState();
  const patient = state.currentUser || state.profile || { name: 'Asha Devi' };
  const patientFirstName = patient?.name ? patient.name.split(' ')[0] : 'Patient';

  let filteredCircle = allPeople;
  if (activeCategoryFilter === 'family') {
    filteredCircle = allPeople.filter(m => 
      (m.relation && !m.relation.toLowerCase().includes('caregiver')) ||
      (m.tag && m.tag.toLowerCase().includes('family'))
    );
  } else if (activeCategoryFilter === 'caregivers') {
    filteredCircle = allPeople.filter(m => 
      (m.tag && m.tag.toLowerCase().includes('caregiver')) ||
      (m.relation && m.relation.toLowerCase().includes('caregiver'))
    );
  } else if (activeCategoryFilter === 'favorites') {
    filteredCircle = allPeople.filter(m => Boolean(m.favorite));
  }

  return `
  <main class="w-full pt-20 bg-surface min-h-[calc(100vh-140px)]">
    <div class="max-w-7xl mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl">
      <!-- Breadcrumb & Header -->
      <div class="flex flex-wrap items-center justify-between gap-space-sm mb-space-lg">
        <a href="#/patient-home" class="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all text-label-lg font-label-lg group shadow-sm">
          <span class="material-symbols-outlined text-[22px] transition-transform group-hover:-translate-x-1">arrow_back</span>
          <span>Return to Home</span>
        </a>
        <div class="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-tertiary-fixed/30 text-tertiary">
          <span class="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
          <span class="font-label-md text-label-md">${allPeople.length} Care Circle Members Linked</span>
        </div>
      </div>

      <!-- Hero Banner -->
      <div class="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm mb-space-lg border border-surface-container">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-secondary-fixed/40 text-on-secondary-fixed font-caption text-caption mb-space-xs">
            <span class="material-symbols-outlined text-[16px] text-secondary">group</span>
            <span>Heirloom Care Circle</span>
          </div>
          <h1 class="font-headline-lg text-headline-lg text-on-surface font-bold">${patientFirstName}'s Loving Family Circle</h1>
          <p class="font-body-lg text-body-lg text-on-surface-variant mt-1">
            Always connected, caring, and ready to share calm moments, calls, and memories.
          </p>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex flex-wrap items-center gap-space-xs mb-space-xl">
        <button class="circle-filter-btn px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all cursor-pointer ${
          activeCategoryFilter === 'all' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
        }" data-filter="all" type="button">
          All Circle (${allPeople.length})
        </button>
        <button class="circle-filter-btn px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all cursor-pointer ${
          activeCategoryFilter === 'family' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
        }" data-filter="family" type="button">
          Family
        </button>
        <button class="circle-filter-btn px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all cursor-pointer ${
          activeCategoryFilter === 'caregivers' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
        }" data-filter="caregivers" type="button">
          Caregivers
        </button>
        <button class="circle-filter-btn px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all cursor-pointer ${
          activeCategoryFilter === 'favorites' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
        }" data-filter="favorites" type="button">
          Loved Ones (${allPeople.filter(p => p.favorite).length})
        </button>
      </div>

      <!-- Family Members Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-space-lg mb-space-3xl">
        ${filteredCircle.length === 0 ? `
          <div class="col-span-full p-space-2xl text-center rounded-2xl bg-surface-container-lowest border border-surface-container">
            <span class="material-symbols-outlined text-[48px] text-on-surface-variant/50 mb-2">favorite</span>
            <p class="font-body-lg text-body-lg text-on-surface-variant">No family members in this filter yet.</p>
          </div>
        ` : filteredCircle.map(member => {
          const journey = memoryService.getSharedMemoryJourney(member.id) || { stats: { memoriesCount: 0, placesCount: 0, storiesCount: 0, photosCount: 0 } };
          const stats = journey.stats;
          const isFav = Boolean(member.favorite);

          return `
          <div class="flex flex-col justify-between p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all border border-surface-container">
            <div>
              <div class="flex items-start gap-space-md mb-space-md">
                <img class="w-20 h-20 rounded-full object-cover shrink-0 shadow-sm ring-2 ring-primary/20" 
                     src="${member.avatar || FALLBACK_MEMORY_IMAGE}" 
                     alt="${member.name}"
                     onerror="this.onerror=null; this.src='${FALLBACK_MEMORY_IMAGE}';"/>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-space-xs flex-wrap">
                    <span class="font-caption text-caption px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                      ${member.tag || 'Family Member'}
                    </span>
                    <button class="circle-card-fav-btn p-1 text-amber-600 hover:scale-110 transition-transform cursor-pointer" data-id="${member.id}" title="Toggle favorite">
                      <span class="material-symbols-outlined text-[20px]">${isFav ? 'star' : 'star_border'}</span>
                    </button>
                  </div>
                  <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">${member.name} (${member.relation})</h3>
                  <p class="font-label-md text-label-md text-on-surface-variant mt-0.5">${member.proximity || 'In your care circle'}</p>
                  
                  <!-- Shared stats badges -->
                  <div class="flex items-center gap-space-xs mt-2 flex-wrap">
                    <span class="px-space-xs py-0.5 rounded-md bg-surface-container font-caption text-caption text-on-surface-variant font-medium">
                      ${stats.memoriesCount} memories
                    </span>
                    <span class="px-space-xs py-0.5 rounded-md bg-surface-container font-caption text-caption text-on-surface-variant font-medium">
                      ${stats.placesCount} places
                    </span>
                    <span class="px-space-xs py-0.5 rounded-md bg-surface-container font-caption text-caption text-on-surface-variant font-medium">
                      ${stats.storiesCount} stories
                    </span>
                  </div>
                </div>
              </div>

              <!-- Shared Memories Journey Button -->
              <div class="my-space-sm">
                <button class="open-shared-journey-btn w-full py-space-sm px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-between transition-colors cursor-pointer border border-surface-container" data-person-id="${member.id}">
                  <span class="flex items-center gap-space-xs">
                    <span class="material-symbols-outlined text-primary text-[18px]">auto_stories</span>
                    <span>Memories with ${member.name}</span>
                  </span>
                  <span class="material-symbols-outlined text-[18px] text-on-surface-variant">arrow_forward</span>
                </button>
              </div>
            </div>

            <div class="pt-space-md flex flex-wrap gap-space-sm border-t border-surface-container">
              <button class="call-member-btn flex-1 min-h-[50px] flex items-center justify-center gap-space-xs rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-colors cursor-pointer" data-name="${member.name}" data-phone="${member.phone || ''}">
                <span class="material-symbols-outlined text-[20px]">call</span>
                <span>Call ${member.name}</span>
              </button>
              <button class="hear-member-checkin-btn flex-1 min-h-[50px] flex items-center justify-center gap-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer" data-id="${member.id}" data-name="${member.name}">
                <span class="material-symbols-outlined text-[20px]">volume_up</span>
                <span>Hear Voice</span>
              </button>
              <button class="video-member-btn p-space-sm flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer" data-name="${member.name}" title="Video Call">
                <span class="material-symbols-outlined text-[20px]">video_call</span>
              </button>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
  </main>
  `;
}

export function attachFamilyCircleEvents() {
  const callBtns = document.querySelectorAll('.call-member-btn');
  const videoBtns = document.querySelectorAll('.video-member-btn');
  const hearBtns = document.querySelectorAll('.hear-member-checkin-btn');
  const journeyBtns = document.querySelectorAll('.open-shared-journey-btn');
  const favBtns = document.querySelectorAll('.circle-card-fav-btn');
  const filterBtns = document.querySelectorAll('.circle-filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategoryFilter = btn.getAttribute('data-filter') || 'all';
      const contentEl = document.getElementById('view-content');
      if (contentEl) {
        contentEl.innerHTML = renderFamilyCircleView();
        attachFamilyCircleEvents();
      }
    });
  });

  favBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const isNowFav = store.togglePersonFavorite(id);
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = isNowFav ? 'star' : 'star_border';
      showToast(isNowFav ? 'Saved as Loved One' : 'Removed from favorites', isNowFav ? 'star' : 'star_border');
    });
  });

  journeyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const personId = btn.getAttribute('data-person-id');
      const person = memoryService.getPersonById(personId);
      if (person) {
        const journey = memoryService.getSharedMemoryJourney(personId);
        store.setSelectedEntityDetail({
          type: 'shared-journey',
          data: {
            person,
            ...journey
          }
        });
        store.setEntityDetailModalOpen(true);
      }
    });
  });

  callBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const phone = btn.getAttribute('data-phone');
      if (phone && phone.trim()) {
        showToast(`Connecting voice call to ${name} (${phone})...`, 'call');
        voiceService.speak(`Connecting you to ${name}. Take a soft breath.`);
      } else {
        showToast(`Contact number not configured for ${name}.`, 'info');
        voiceService.speak(`Phone line is not configured for ${name} right now.`);
      }
    });
  });

  videoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      showToast(`Setting up video call with ${name}...`, 'video_call');
      voiceService.speak(`Setting up your video call with ${name}.`);
    });
  });

  hearBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const personId = btn.getAttribute('data-id');
      const person = memoryService.getPersonById(personId);
      if (!person) return;

      const journey = memoryService.getSharedMemoryJourney(personId);
      const storyText = (journey && journey.stories && journey.stories[0]) ? journey.stories[0].text : person.bio;
      const message = `${person.name}, your ${person.relation}. ${storyText}`;

      showToast(`Listening to voice thought from ${person.name}...`, 'volume_up');
      voiceService.speak(message);
    });
  });
}
