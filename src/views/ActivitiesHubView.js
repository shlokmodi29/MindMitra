import { store } from '../state/store.js';
import { activityEngine } from '../services/activityEngine.js';
import { activityRegistry, ACTIVITY_CATEGORIES } from '../services/activityRegistry.js';
import { adaptiveEngine } from '../services/adaptiveEngine.js';
import { renderActivityShell, attachActivityShellEvents } from '../components/ActivityShell.js';
import { showToast } from '../components/Toast.js';

let activeCategoryFilter = 'All';
let activitySearchQuery = '';

export function renderActivitiesHubView() {
  const patientId = store.getCurrentPatientId();
  const allActivities = activityRegistry.getAll();
  const act = activityRegistry.resolveForPatient(store.getState().activeActivityId || 'act-1', patientId);

  // Filter activities by category and search query
  let filtered = activeCategoryFilter === 'All'
    ? allActivities
    : allActivities.filter(a => a.category.toUpperCase() === activeCategoryFilter.toUpperCase());

  if (activitySearchQuery.trim()) {
    const q = activitySearchQuery.toLowerCase().trim();
    filtered = filtered.filter(a => 
      a.name.toLowerCase().includes(q) ||
      a.subtitle.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  }

  const patientResults = store.getActivityResults(patientId);
  const completedCount = patientResults.length;
  const completedActivityIds = new Set(patientResults.map(r => r.activityId));

  const patient = store.getState().currentUser || store.getState().profile || { name: 'Asha Devi' };
  const patientName = patient?.name || 'Patient';

  // Adaptive personalized recommendation
  let recommended = null;
  try {
    recommended = adaptiveEngine.getRecommendedActivity(patientId);
  } catch (err) {
    console.warn('Adaptive recommendation error:', err);
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

        <!-- Subtle Ambient Glow -->
        <div class="relative w-full overflow-hidden">
          <div class="absolute -top-24 left-1/4 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div class="absolute top-48 right-10 w-80 h-80 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

          <!-- Hub Header -->
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-lg mb-space-2xl">
            <div class="max-w-3xl space-y-space-xs">
              <div class="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption shadow-sm">
                <span class="material-symbols-outlined text-[16px] text-tertiary">spa</span>
                <span>Preserving Personal Dignity &amp; Joy</span>
                <span class="w-1 h-1 rounded-full bg-outline-variant"></span>
                <span>Daily Cognitive Wellness</span>
              </div>
              <h1 class="font-display text-display text-on-surface tracking-tight leading-tight font-bold">
                Cognitive Engagement &amp; Memory Activities
              </h1>
              <p class="font-body-xl text-body-xl text-on-surface-variant leading-relaxed">
                Calm, dignified, and personalized activities designed to stimulate recall, attention, and joyful connection.
              </p>
            </div>

            <!-- Quick Session Stats Summary -->
            <div class="flex items-center gap-space-md p-space-sm bg-surface-container-low rounded-xl shadow-sm self-start md:self-auto border border-surface-container">
              <div class="w-12 h-12 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">auto_stories</span>
              </div>
              <div class="flex flex-col">
                <span class="font-headline-sm text-headline-sm text-on-surface font-bold">${completedCount} Completed</span>
                <span class="font-caption text-caption text-on-surface-variant">Recommended gentle pace for ${patientName}</span>
              </div>
            </div>
          </div>

          <!-- Suggested for You Banner (Personalized Adaptive Pacing) -->
          ${recommended ? `
          <div class="mb-space-xl p-space-lg rounded-2xl bg-surface-container-low border border-primary/20 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div class="flex items-start gap-space-md">
              <div class="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                <span class="material-symbols-outlined text-[26px]">${recommended.icon || 'auto_awesome'}</span>
              </div>
              <div>
                <div class="flex items-center gap-space-xs mb-1">
                  <span class="px-space-xs py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-semibold">Suggested for You</span>
                  <span class="px-space-xs py-0.5 rounded bg-surface-container text-on-surface-variant font-caption text-caption font-medium">${recommended.recommendedDifficulty} Level</span>
                  <span class="text-caption text-on-surface-variant">• ${recommended.category}</span>
                </div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${recommended.name}</h3>
                <p class="font-body-md text-body-md text-on-surface-variant mt-0.5">${recommended.gentleReason}</p>
              </div>
            </div>
            <button class="launch-activity-btn shrink-0 px-space-xl py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:opacity-90 transition-all cursor-pointer shadow-sm flex items-center gap-2" data-id="${recommended.activityId}">
              <span class="material-symbols-outlined text-[20px]">play_arrow</span>
              <span>Start ${recommended.name} (${recommended.recommendedDifficulty})</span>
            </button>
          </div>
          ` : ''}

          <!-- Active In-Progress Session Shell -->
          <section aria-label="Current Cognitive Activity Session" class="w-full mb-space-3xl" id="activeSessionContainer">
            <div class="flex items-center justify-between mb-space-sm">
              <div class="flex items-center gap-space-xs">
                <span class="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                <span class="font-label-lg text-label-lg text-primary uppercase tracking-wider font-semibold">Active Activity Shell</span>
              </div>
              <span class="font-caption text-caption text-on-surface-variant">No pressure • Untimed • Take your time</span>
            </div>

            <!-- Embedded Reusable Activity Shell -->
            ${renderActivityShell(act)}
          </section>

          <!-- Canonical Taxonomy Filter Bar & Search (ALL 20 ACTIVITIES) -->
          <section aria-label="Activity Categories Navigation" class="w-full mb-space-xl">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-space-md">
              <div class="flex items-center gap-space-xs">
                <span class="font-headline-sm text-headline-sm text-on-surface font-bold">Browse All Activities</span>
                <span class="px-space-xs py-space-2xs rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">20 Canonical Modules</span>
              </div>
              
              <!-- Search Bar -->
              <div class="relative w-full sm:w-72">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                <input 
                  type="text" 
                  id="activitySearchInput" 
                  placeholder="Search activities..." 
                  value="${activitySearchQuery}" 
                  class="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-surface-container rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                  aria-label="Search cognitive activities"
                />
              </div>
            </div>

            <!-- Filter Buttons Scroller -->
            <div class="flex items-center gap-space-xs overflow-x-auto pb-space-xs no-scrollbar" role="tablist" aria-label="Category filters">
              ${ACTIVITY_CATEGORIES.map(cat => `
                <button class="activity-cat-tab shrink-0 px-space-lg py-space-sm rounded-full font-label-lg text-label-lg transition-colors cursor-pointer ${
                  activeCategoryFilter.toUpperCase() === cat.toUpperCase()
                    ? 'bg-primary text-on-primary shadow-sm font-semibold'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-on-surface shadow-sm'
                }" data-category="${cat}" type="button" role="tab" aria-selected="${activeCategoryFilter.toUpperCase() === cat.toUpperCase()}">
                  ${cat === 'All' ? 'All 20 Activities' : cat}
                </button>
              `).join('')}
            </div>
          </section>

          <!-- Module Cards Grid (ALL 20 CANONICAL ACTIVITIES) -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg mb-space-3xl" id="activitiesGrid">
            ${filtered.length === 0 ? `
              <div class="col-span-full p-space-2xl text-center bg-surface-container-lowest rounded-2xl border border-surface-container">
                <span class="material-symbols-outlined text-[48px] text-on-surface-variant mb-2">search_off</span>
                <p class="font-headline-sm text-headline-sm text-on-surface font-semibold">No activities found</p>
                <p class="font-body-md text-body-md text-on-surface-variant mt-1">Try clearing your search or selecting another category.</p>
              </div>
            ` : filtered.map(mod => {
              const isCompleted = completedActivityIds.has(mod.id);
              const isActive = act && act.id === mod.id;
              const diffRec = adaptiveEngine.getDifficultyRecommendation(patientId, mod.id);
              const difficultyLabel = diffRec?.recommendedDifficulty || (mod.difficulty === 3 ? 'Hard' : mod.difficulty === 2 ? 'Medium' : 'Easy');

              return `
                <div class="p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div class="flex items-center justify-between gap-space-xs mb-space-sm">
                      <span class="px-space-sm py-space-2xs rounded-full bg-secondary-fixed/40 text-on-secondary-fixed font-caption text-caption font-semibold flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">${mod.icon || 'star'}</span>
                        ${mod.category}
                      </span>
                      <div class="flex items-center gap-space-2xs">
                        <span class="px-space-xs py-space-2xs rounded bg-surface-container text-on-surface-variant font-caption text-caption font-medium">
                          ${difficultyLabel}
                        </span>
                        ${isCompleted ? `
                          <span class="font-caption text-caption text-tertiary font-semibold flex items-center gap-0.5">
                            <span class="material-symbols-outlined text-[16px]">check_circle</span> Completed
                          </span>
                        ` : `
                          <span class="font-caption text-caption text-on-surface-variant">
                            ${mod.comfort || 'Serene'}
                          </span>
                        `}
                      </div>
                    </div>
                    
                    <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs group-hover:text-primary transition-colors">
                      ${mod.name}
                    </h4>
                    <p class="font-body-md text-body-md text-on-surface-variant mb-space-md line-clamp-2">
                      ${mod.subtitle || mod.description}
                    </p>
                  </div>

                  <div class="flex items-center justify-between pt-space-sm border-t border-surface-container">
                    <span class="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                      <span class="material-symbols-outlined text-[18px]">schedule</span> ${mod.estimatedDuration || mod.duration}
                    </span>
                    <button class="launch-activity-btn px-space-md py-space-xs rounded-xl ${
                      isActive ? 'bg-surface-container-high text-primary font-bold' : 'bg-primary text-on-primary'
                    } font-label-md text-label-md hover:opacity-90 transition-all cursor-pointer shadow-sm" data-id="${mod.id}">
                      ${isActive ? 'Currently Active' : 'Start Activity'}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  </main>
  `;
}

export function attachActivitiesHubEvents() {
  const catTabs = document.querySelectorAll('.activity-cat-tab');
  const launchBtns = document.querySelectorAll('.launch-activity-btn');
  const searchInput = document.getElementById('activitySearchInput');

  // Attach shell events with rerender capability
  attachActivityShellEvents(renderView);

  catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeCategoryFilter = tab.getAttribute('data-category');
      renderView();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activitySearchQuery = e.target.value;
      renderView();
    });
  }

  launchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const patientId = store.getCurrentPatientId();
      const diffRec = adaptiveEngine.getDifficultyRecommendation(patientId, id);
      activityEngine.startSession(id, patientId, diffRec.recommendedDifficultyLevel);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      renderView();
      showToast('Activity loaded into active shell', 'psychology');
    });
  });

  function renderView() {
    const contentEl = document.getElementById('view-content');
    if (contentEl) {
      contentEl.innerHTML = renderActivitiesHubView();
      attachActivitiesHubEvents();
    }
  }
}
