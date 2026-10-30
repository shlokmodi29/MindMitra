// Caregiver Dashboard & Insights View - Part 11 Caregiver Portal & Support Center
import { store } from '../state/store.js';
import { authService } from '../services/authService.js';
import { openScheduleEditor } from '../components/ScheduleEditorModal.js';
import { showToast } from '../components/Toast.js';
import { adaptiveEngine } from '../services/adaptiveEngine.js';
import { memoryService } from '../services/memoryService.js';
import { emergencyService } from '../services/emergencyService.js';
import { renderMemoryGraph, attachMemoryGraphEvents } from '../components/MemoryGraphView.js';
import { offlineSyncService } from '../services/offlineSyncService.js';
import { doctorService } from '../services/doctorService.js';
import { dailyPlanService } from '../services/dailyPlanService.js';
import { moodCheckInService, MOOD_CONFIG } from '../services/moodCheckInService.js';

let activeCategoryFilter = 'all';

export function renderCaregiverDashboardView() {
  const state = store.getState();
  const activeCaregiver = (state.currentUser && state.currentUser.role === 'caregiver') 
    ? state.currentUser 
    : (state.users.find(u => u.role === 'caregiver') || state.users[1]);

  const currentPatientId = store.getCurrentPatientId();
  const authorizedPatients = store.getAuthorizedPatientsForCaregiver(activeCaregiver.id || activeCaregiver.userId);
  const currentPatient = authorizedPatients.find(p => p.id === currentPatientId) || 
    state.users.find(u => u.id === currentPatientId) || 
    state.users[0];

  const syncDetails = offlineSyncService.getCaregiverStatusDetails ? offlineSyncService.getCaregiverStatusDetails(currentPatient.id) : { isOnline: true, pendingCount: 0, lastSyncTime: 'Just now', statusLabel: 'All changes synchronized' };

  const careSummary = store.getDailyCareSummary(currentPatientId);
  const caregiverInsights = store.getCaregiverInsights(currentPatientId);
  const caregiverNotifications = store.getCaregiverNotifications(currentPatientId);
  const patientPlan = (dailyPlanService && dailyPlanService.getTodayPlan) 
    ? dailyPlanService.getTodayPlan(currentPatientId) 
    : { items: [], summary: { total: 0, completedCount: 0, pendingCount: 0, importantCount: 0, percentage: 100 } };
  
  // Recent Mood Check-ins (Feature 4 - Simple Daily Emotional Check-In)
  const recentCheckIns = (moodCheckInService && moodCheckInService.getCheckInHistory)
    ? moodCheckInService.getCheckInHistory(currentPatientId, 5)
    : [];

  // Doctor & Care Team connections
  const doctorConnections = doctorService.getPatientConnections(currentPatientId);
  const connectedDoctors = doctorConnections.filter(c => c.status === 'approved');
  const pendingDoctorConnections = doctorConnections.filter(c => c.status === 'pending');

  // Cognitive Practice & Adaptive Engine data
  const patientResults = store.getActivityResults(currentPatientId);
  const adaptiveProfile = adaptiveEngine.getAdaptiveProfile(currentPatientId);
  const adaptiveEvents = adaptiveEngine.getAdaptiveEvents(currentPatientId, 5);

  // Memories, People & Emergency data
  const memories = (state.memories || []).filter(m => !m.patientId || m.patientId === currentPatientId);
  const people = memoryService.getPeople(currentPatientId);
  const emergencyContacts = store.getEmergencyContactsForPatient(currentPatientId);
  const primaryEmergencyContact = emergencyContacts.find(c => c.priority === 'primary');
  const locationState = emergencyService.getLocationState();

  // Filter activity history
  const filteredResults = activeCategoryFilter === 'all'
    ? patientResults
    : patientResults.filter(r => (r.category || '').toLowerCase() === activeCategoryFilter.toLowerCase());

  return `
  <div class="w-full bg-surface min-h-screen">
    <!-- Fixed Left Sidebar for Caregiver (Desktop) -->
    <aside class="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 hidden lg:flex flex-col pt-space-md pb-space-lg shadow-[0_2px_16px_rgba(74,40,64,0.06)] border-r border-surface-container">
      <div class="px-space-lg pb-space-md flex items-center justify-between">
        <a href="#/caregiver-dashboard" class="flex items-center gap-space-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" width="130" height="32" fill="none">
            <g transform="translate(4, 4)">
              <circle cx="16" cy="16" r="15" fill="#FAF7F2" stroke="#E6DFD5" stroke-width="1"/>
              <path d="M16 6C12 11 11 16 16 26C21 16 20 11 16 6Z" fill="#9f3c16" opacity="0.95"/>
              <path d="M6 16C11 12 16 11 26 16C16 21 11 20 6 16Z" fill="#79526c" opacity="0.85"/>
              <circle cx="16" cy="16" r="3.5" fill="#FAF7F2"/>
              <circle cx="16" cy="16" r="2" fill="#D9822B"/>
            </g>
            <text x="44" y="24" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="18" font-weight="700" fill="#1f1b18" letter-spacing="-0.3">Mind<tspan fill="#9f3c16">Mitra</tspan></text>
          </svg>
        </a>
      </div>

      <!-- Patient Profile & Selector Card -->
      <div class="px-space-lg py-space-sm">
        <div class="p-space-sm bg-surface-container rounded-xl border border-outline/10">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-space-xs min-w-0">
              <img alt="Patient portrait" class="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-primary/20" src="${currentPatient.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0YAy95YXoJS_5vZSXW6X-PnJg1OsTqHJE2auKWrD5E7ybjkztRBBIbPZq3y0AoaM-Eb7-2Qx61e_xOx0bClvELv1MtWm0Z7VfdKvssQV7JArcPSFqwheQMajYjLn1WtA7dzsP7DkKjOMqz60OC8iteQ13hCjAL-3WZhbWP9JoryUyuNiYnvwio5McweNRZW-WZd1RGWNj0z1B2xPhZHGMqCFaED7B18VQpnsX4l16dCIuTMDLx3oi'}">
              <div class="flex flex-col min-w-0">
                <span class="font-label-md text-label-md text-on-surface leading-tight font-bold truncate">${currentPatient.name}</span>
                <span class="font-caption text-caption text-on-surface-variant">Age ${currentPatient.age || 72} • Active</span>
              </div>
            </div>
            <span class="material-symbols-outlined text-[20px] text-tertiary shrink-0" title="Authorized Care Profile">verified</span>
          </div>

          ${authorizedPatients.length > 1 ? `
            <div class="mt-space-xs pt-space-xs border-t border-surface-container-high">
              <label for="sidebarPatientSelector" class="block font-caption text-caption text-on-surface-variant mb-1 font-semibold uppercase">Switch Patient</label>
              <select id="sidebarPatientSelector" class="w-full px-space-xs py-1 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md border border-outline/20">
                ${authorizedPatients.map(p => `
                  <option value="${p.id}" ${p.id === currentPatientId ? 'selected' : ''}>${p.name}</option>
                `).join('')}
              </select>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="px-space-lg py-space-xs">
        <span class="font-caption text-caption uppercase tracking-wider text-on-surface-variant font-semibold">Caregiver Navigation</span>
      </div>

      <nav class="flex-1 px-space-md space-y-space-2xs overflow-y-auto">
        <a href="#/caregiver-dashboard" class="flex items-center gap-space-sm px-space-md py-space-sm bg-primary-container text-on-primary-container font-label-lg rounded-xl shadow-sm transition-all">
          <span class="material-symbols-outlined text-[22px]">dashboard</span>
          <span>Dashboard</span>
        </a>
        <a href="#/family-circle" class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all">
          <span class="material-symbols-outlined text-[22px]">group</span>
          <span>Care Circle</span>
        </a>
        <a href="#/caregiver-bridge" class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all">
          <span class="material-symbols-outlined text-[22px]">history_edu</span>
          <span>Memory Bridge</span>
        </a>
        <a href="#/memory-world" class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all">
          <span class="material-symbols-outlined text-[22px]">account_tree</span>
          <span>Memory Graph</span>
        </a>
        <a href="#/memory-timeline" class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all">
          <span class="material-symbols-outlined text-[22px]">history_toggle_off</span>
          <span>Memory Timeline</span>
        </a>
        <button id="sidebarScheduleBtn" class="w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all text-left cursor-pointer">
          <span class="material-symbols-outlined text-[22px]">alarm</span>
          <span>Routines &amp; Reminders</span>
        </button>
        <a href="#/activities" class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all">
          <span class="material-symbols-outlined text-[22px]">psychology</span>
          <span>Cognitive Hub</span>
        </a>
        <a href="#/caregiver-reports" class="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all">
          <span class="material-symbols-outlined text-[22px]">description</span>
          <span>Reports &amp; Analytics</span>
        </a>
        <a href="#/emergency-sos" class="flex items-center justify-between px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all">
          <div class="flex items-center gap-space-sm">
            <span class="material-symbols-outlined text-[22px] text-primary">emergency</span>
            <span>Emergency &amp; SOS</span>
          </div>
          <span class="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-bold">112 Ready</span>
        </a>
        <button id="sidebarPreviewBtn" class="w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-secondary hover:bg-secondary/10 transition-all text-left cursor-pointer">
          <span class="material-symbols-outlined text-[22px]">visibility</span>
          <span>Preview Patient UI</span>
        </button>
      </nav>

      <!-- Active Caregiver Session & Sign Out -->
      <div class="px-space-md pt-space-sm space-y-space-xs">
        <div class="p-space-sm bg-surface-container rounded-xl flex items-center gap-space-sm">
          <img class="w-9 h-9 rounded-full object-cover ring-2 ring-secondary shrink-0" src="${activeCaregiver.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw'}" alt="${activeCaregiver.name}">
          <div class="flex-1 min-w-0">
            <p class="font-label-md text-label-md text-on-surface font-bold truncate">${activeCaregiver.name}</p>
            <p class="font-caption text-caption text-on-surface-variant truncate">${activeCaregiver.email || 'Primary Caregiver'}</p>
          </div>
        </div>

        <button id="caregiverLogoutBtn" class="w-full flex items-center justify-between px-space-md py-space-sm rounded-xl bg-surface-container hover:bg-error-container hover:text-on-error-container text-on-surface-variant font-label-md text-label-md transition-all cursor-pointer">
          <span class="flex items-center gap-space-xs">
            <span class="material-symbols-outlined text-[20px] text-error">logout</span> 
            <span>Sign Out</span>
          </span>
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="lg:pl-72">
      <!-- Caregiver Top Header -->
      <header class="h-20 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(74,40,64,0.04)] z-40 flex items-center justify-between px-space-md lg:px-space-xl border-b border-surface-container">
        <div class="flex items-center gap-space-md">
          <div class="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md">
            <span class="material-symbols-outlined text-[18px] text-tertiary">sensor_door</span>
            <span>Supporting: <strong class="text-on-surface">${currentPatient.name}</strong> (${currentPatient.safeZone || 'Sector 4 Unit'})</span>
          </div>
          <div class="hidden md:flex items-center gap-space-xs px-space-sm py-space-xs rounded-full ${syncDetails.isOnline ? 'bg-tertiary-fixed/40 text-on-tertiary-fixed' : 'bg-surface-container-high text-on-surface-variant'} font-caption text-caption" role="status">
            <span class="w-2 h-2 rounded-full ${syncDetails.isOnline ? (syncDetails.pendingCount > 0 ? 'bg-secondary animate-pulse' : 'bg-tertiary') : 'bg-outline'}"></span>
            <span>${syncDetails.statusLabel}</span>
          </div>
          <button id="caregiverSyncNowBtn" class="flex items-center gap-space-2xs px-space-sm py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high font-label-sm text-label-sm text-on-surface cursor-pointer transition-all shadow-xs" title="Synchronize changes now" type="button">
            <span class="material-symbols-outlined text-[16px]">sync</span>
            <span class="hidden lg:inline">Sync Now</span>
          </button>
        </div>

        <div class="flex items-center gap-space-sm shrink-0">
          <button id="previewPatientTopBtn" class="hidden sm:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-secondary/15 hover:bg-secondary/25 text-secondary font-label-md text-label-md transition-all cursor-pointer" type="button" title="Preview Patient Experience">
            <span class="material-symbols-outlined text-[18px]">visibility</span>
            <span>Preview Patient UI</span>
          </button>

          <button id="caregiverSmritiVoiceBtn" class="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-secondary text-on-secondary hover:bg-secondary/90 transition-all shadow-sm cursor-pointer" type="button">
            <span class="material-symbols-outlined text-[20px]">mic</span>
            <span class="hidden sm:inline font-label-md text-label-md">SmritiAI</span>
          </button>

          <button id="caregiverTopLogoutBtn" class="flex items-center gap-space-2xs px-space-sm py-space-xs rounded-xl bg-surface-container hover:bg-error-container hover:text-on-error-container text-on-surface-variant font-label-md text-label-md transition-all cursor-pointer" title="Sign Out">
            <span class="material-symbols-outlined text-[20px] text-error">logout</span>
            <span class="hidden md:inline font-semibold">Sign Out</span>
          </button>
        </div>
      </header>

      <main class="relative bg-surface min-h-screen">
        <div class="w-full px-space-md lg:px-space-xl py-space-lg">
          <div class="flex flex-col w-full gap-y-space-xl">
            <!-- Top Care Profile Hero Banner -->
            <section class="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-xl shadow-sm border border-surface-container">
              <div class="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
              <div class="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-secondary/5 blur-2xl pointer-events-none"></div>

              <div class="relative flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div class="flex items-start md:items-center gap-space-lg min-w-0">
                  <div class="relative shrink-0 cursor-pointer" id="heroPatientAvatar">
                    <img class="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-md ring-2 ring-primary/20" 
                         src="${currentPatient.avatar}" 
                         alt="${currentPatient.name} portrait">
                    <span class="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary" title="Connected">
                      <span class="material-symbols-outlined text-[14px]">bolt</span>
                    </span>
                  </div>
                  <div class="flex flex-col min-w-0">
                    <div class="flex flex-wrap items-center gap-x-space-sm gap-y-space-2xs">
                      <h1 class="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight truncate">
                        Care Support for ${currentPatient.name}
                      </h1>
                      <span class="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption font-semibold">
                        Age ${currentPatient.age || 72}
                      </span>
                    </div>
                    <div class="flex flex-wrap items-center gap-x-space-md gap-y-space-xs mt-space-2xs text-on-surface-variant font-body-md text-body-md">
                      <span class="flex items-center gap-1.5 font-label-md text-label-md">
                        <span class="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
                        Synchronized Today
                      </span>
                      <span class="hidden sm:inline text-outline-variant font-bold">•</span>
                      <span class="flex items-center gap-1.5 text-on-surface-variant font-body-md text-body-md">
                        <span class="material-symbols-outlined text-[18px] text-tertiary">home</span>
                        Safe Zone: ${currentPatient.safeZone || 'Home Safe Zone'}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-space-sm shrink-0">
                  <button id="viewPatientPreviewBtn" class="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-secondary/15 hover:bg-secondary/25 text-secondary font-label-md text-label-md transition-all cursor-pointer" type="button">
                    <span class="material-symbols-outlined text-[18px]">visibility</span>
                    <span>Preview Patient UI</span>
                  </button>
                  <button id="adjustScheduleBtn" class="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all cursor-pointer" type="button">
                    <span class="material-symbols-outlined text-[20px] text-primary">edit_calendar</span>
                    <span>Adjust Schedule</span>
                  </button>
                  <button id="viewPatientProfileBtn" class="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-md transition-all cursor-pointer" type="button">
                    <span class="material-symbols-outlined text-[20px]">badge</span>
                    <span>Patient Profile</span>
                  </button>
                </div>
              </div>

              <!-- Caregiver Quick Stats Mosaic -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mt-space-xl">
                <!-- Routine Completion Card -->
                <div class="bg-surface-container p-space-md rounded-xl flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="font-caption text-caption uppercase font-semibold tracking-wider text-on-surface-variant">Today's Routine</span>
                    <span class="material-symbols-outlined text-primary text-[22px]">fact_check</span>
                  </div>
                  <div class="flex items-baseline gap-space-xs mt-space-sm">
                    <span class="font-display text-display font-bold text-on-surface leading-none">${careSummary.percentage}%</span>
                    <span class="font-label-md text-label-md text-on-surface-variant">${careSummary.completedCount} of ${careSummary.total} done</span>
                  </div>
                  <div class="w-full bg-surface-container-highest h-2 rounded-full mt-space-sm overflow-hidden">
                    <div class="bg-tertiary h-full rounded-full transition-all duration-700" style="width: ${careSummary.percentage}%"></div>
                  </div>
                </div>

                <!-- Cognitive Practice Card -->
                <div class="bg-surface-container p-space-md rounded-xl flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="font-caption text-caption uppercase font-semibold tracking-wider text-on-surface-variant">Cognitive Practice</span>
                    <span class="material-symbols-outlined text-secondary text-[22px]">psychology</span>
                  </div>
                  <div class="flex items-baseline gap-space-xs mt-space-sm">
                    <span class="font-display text-display font-bold text-on-surface leading-none">${patientResults.length}</span>
                    <span class="font-label-md text-label-md text-on-surface-variant">Sessions completed</span>
                  </div>
                  <div class="flex items-center gap-1.5 mt-space-sm text-tertiary font-label-md text-label-md">
                    <span class="material-symbols-outlined text-[16px]">trending_up</span>
                    <span class="truncate">Difficulty: ${adaptiveProfile.preferredDifficulty || 'Easy'}</span>
                  </div>
                </div>

                <!-- Active Reminders Remaining Card -->
                <div class="bg-surface-container p-space-md rounded-xl flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="font-caption text-caption uppercase font-semibold tracking-wider text-on-surface-variant">Reminders Remaining</span>
                    <span class="material-symbols-outlined text-primary text-[22px]">pending_actions</span>
                  </div>
                  <div class="flex items-baseline gap-space-xs mt-space-sm">
                    <span class="font-display text-display font-bold text-primary leading-none">${careSummary.remainingCount}</span>
                    <span class="font-label-md text-label-md text-on-surface-variant">Remaining</span>
                  </div>
                  <span class="font-caption text-caption text-on-surface-variant mt-space-sm truncate">${careSummary.dueSoon.length} due soon</span>
                </div>

                <!-- Connected Care Circle Card -->
                <div class="bg-surface-container p-space-md rounded-xl flex flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="font-caption text-caption uppercase font-semibold tracking-wider text-on-surface-variant">Active Circle</span>
                    <span class="material-symbols-outlined text-secondary text-[22px]">group</span>
                  </div>
                  <div class="flex items-center -space-x-2 mt-space-sm">
                    ${people.slice(0, 4).map(p => `
                      <div class="w-9 h-9 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center font-label-md text-label-md font-bold shadow-sm overflow-hidden" title="${p.name} (${p.relation || 'Family'})">
                        ${p.avatar ? `<img src="${p.avatar}" alt="${p.name}" class="w-full h-full object-cover">` : p.name.charAt(0)}
                      </div>
                    `).join('')}
                  </div>
                  <span class="font-caption text-caption text-on-surface-variant mt-space-sm truncate">${people.length} family members connected</span>
                </div>
              </div>
            </section>

            <!-- Caregiver Insights & SmritiAI Query Assistant Section -->
            <section class="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm flex flex-col gap-space-md border border-surface-container">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-surface-container">
                <div class="flex items-center gap-space-xs">
                  <span class="material-symbols-outlined text-[24px] text-secondary">psychology_alt</span>
                  <div>
                    <h2 class="font-headline-sm text-headline-sm text-on-surface font-bold">Caregiver Context &amp; SmritiAI Inquiries</h2>
                    <span class="font-caption text-caption text-on-surface-variant">Factual observations from stored care rhythms (strictly non-diagnostic)</span>
                  </div>
                </div>
                <div class="flex items-center gap-space-xs">
                  <button id="btn-care-note" class="flex items-center gap-space-xs px-space-sm py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all cursor-pointer" type="button">
                    <span class="material-symbols-outlined text-[18px]">note_add</span>
                    <span>Add Care Observation</span>
                  </button>
                </div>
              </div>

              <!-- Factual Insight Cards -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
                ${caregiverInsights.map(ins => `
                  <div class="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
                    <div class="flex items-center gap-space-xs mb-space-xs">
                      <span class="material-symbols-outlined text-[20px] text-${ins.color}">${ins.icon}</span>
                      <span class="font-label-md text-label-md font-bold text-on-surface">${ins.title}</span>
                    </div>
                    <p class="font-body-md text-body-md text-on-surface-variant leading-snug">${ins.description}</p>
                  </div>
                `).join('')}
              </div>

              <!-- Quick Inquiry Chips -->
              <div class="pt-space-xs">
                <span class="font-caption text-caption text-on-surface-variant font-semibold uppercase block mb-1.5">Ask SmritiAI about today's care:</span>
                <div class="flex flex-wrap gap-space-xs">
                  <button class="smriti-inquiry-chip px-space-md py-1 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary font-label-md text-label-md transition-colors cursor-pointer" data-query="What should I pay attention to today?">
                    What should I pay attention to today?
                  </button>
                  <button class="smriti-inquiry-chip px-space-md py-1 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary font-label-md text-label-md transition-colors cursor-pointer" data-query="Which reminders are upcoming?">
                    Which reminders are upcoming?
                  </button>
                  <button class="smriti-inquiry-chip px-space-md py-1 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary font-label-md text-label-md transition-colors cursor-pointer" data-query="What activities were completed?">
                    What activities were completed?
                  </button>
                  <button class="smriti-inquiry-chip px-space-md py-1 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary font-label-md text-label-md transition-colors cursor-pointer" data-query="Show recent memories">
                    Show recent memories
                  </button>
                </div>
              </div>
            </section>

            <!-- Today's Smart Daily Plan Overview (Feature 1) -->
            <section class="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm flex flex-col gap-space-md border border-surface-container">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-surface-container">
                <div class="flex items-center gap-space-xs">
                  <span class="material-symbols-outlined text-[24px] text-primary">calendar_today</span>
                  <h2 class="font-headline-md text-headline-md text-on-surface font-bold">Today's Smart Daily Plan</h2>
                </div>
                <span class="px-space-sm py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-bold">
                  ${patientPlan.summary.completedCount} of ${patientPlan.summary.total} Completed (${patientPlan.summary.percentage}%)
                </span>
              </div>

              <!-- Quick Plan Metrics Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                <div class="p-space-sm rounded-xl bg-surface-container-low border border-surface-container flex flex-col">
                  <span class="font-caption text-caption text-on-surface-variant">Total Milestones</span>
                  <span class="font-headline-sm text-headline-sm font-bold text-on-surface">${patientPlan.summary.total}</span>
                </div>
                <div class="p-space-sm rounded-xl bg-surface-container-low border border-surface-container flex flex-col">
                  <span class="font-caption text-caption text-tertiary font-medium">Completed</span>
                  <span class="font-headline-sm text-headline-sm font-bold text-tertiary">${patientPlan.summary.completedCount}</span>
                </div>
                <div class="p-space-sm rounded-xl bg-surface-container-low border border-surface-container flex flex-col">
                  <span class="font-caption text-caption text-secondary font-medium">Pending / Due</span>
                  <span class="font-headline-sm text-headline-sm font-bold text-secondary">${patientPlan.summary.pendingCount}</span>
                </div>
                <div class="p-space-sm rounded-xl bg-surface-container-low border border-surface-container flex flex-col">
                  <span class="font-caption text-caption text-primary font-medium">Important Tasks</span>
                  <span class="font-headline-sm text-headline-sm font-bold text-primary">${patientPlan.summary.importantCount}</span>
                </div>
              </div>

              <!-- Daily Plan Items Preview -->
              <div class="space-y-space-xs pt-space-xs">
                ${patientPlan.items.slice(0, 4).map(item => `
                  <div class="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low border border-surface-container text-body-sm">
                    <div class="flex items-center gap-space-xs min-w-0">
                      <span class="material-symbols-outlined text-[20px] ${item.status === 'completed' ? 'text-tertiary' : 'text-primary'}">
                        ${item.status === 'completed' ? 'check_circle' : (item.metadata?.icon || 'schedule')}
                      </span>
                      <span class="font-semibold text-on-surface truncate">${item.title}</span>
                      <span class="px-space-xs py-0.5 rounded text-[11px] font-bold ${item.priority === 'Important' ? 'bg-primary/15 text-primary' : 'bg-surface-container-high text-on-surface-variant'}">${item.priority}</span>
                    </div>
                    <span class="font-caption text-caption text-on-surface-variant shrink-0">${item.scheduledTime || 'Routine'}</span>
                  </div>
                `).join('')}
              </div>
            </section>

            <!-- Recent Emotional Check-ins (Feature 4 - Simple Daily Check-in) -->
            <section class="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm flex flex-col gap-space-md border border-surface-container">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-surface-container">
                <div class="flex items-center gap-space-xs">
                  <span class="material-symbols-outlined text-[24px] text-tertiary">sentiment_satisfied</span>
                  <div>
                    <h2 class="font-headline-md text-headline-md text-on-surface font-bold">Recent Emotional Check-ins</h2>
                    <span class="font-caption text-caption text-on-surface-variant">Simple daily check-ins shared by ${currentPatient.name} (strictly non-diagnostic)</span>
                  </div>
                </div>
                <span class="px-space-sm py-0.5 rounded-full bg-tertiary/10 text-tertiary font-caption text-caption font-bold">
                  ${recentCheckIns.length} recorded
                </span>
              </div>

              ${recentCheckIns.length === 0 ? `
                <div class="p-space-md rounded-xl bg-surface-container-low text-center text-on-surface-variant font-body-sm">
                  <p>No emotional check-ins recorded yet for ${currentPatient.name}.</p>
                </div>
              ` : `
                <div class="space-y-space-xs">
                  ${recentCheckIns.map(chk => {
                    const cfg = MOOD_CONFIG[chk.mood] || { emoji: '🙂', label: 'Okay' };
                    const d = new Date(chk.date);
                    const todayStr = new Date().toISOString().slice(0, 10);
                    const isToday = chk.date === todayStr;
                    const dateLabel = isToday ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                    return `
                      <div class="p-space-sm rounded-xl bg-surface-container-low border border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                        <div class="flex items-center gap-space-sm">
                          <span class="text-2xl">${cfg.emoji}</span>
                          <div>
                            <span class="font-semibold text-on-surface text-body-md">${cfg.label}</span>
                            <span class="text-caption text-on-surface-variant ml-space-xs font-caption">• ${dateLabel}</span>
                          </div>
                        </div>
                        ${chk.note ? `
                          <p class="text-body-sm text-on-surface-variant italic bg-surface-container px-space-sm py-1 rounded-lg border border-outline/10 sm:max-w-md">
                            &ldquo;${chk.note}&rdquo;
                          </p>
                        ` : `
                          <span class="text-caption text-on-surface-variant italic">No note added</span>
                        `}
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </section>

            <!-- Today's Care & Reminder Management -->
            <section class="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm flex flex-col gap-space-lg border border-surface-container">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-md border-b border-surface-container">
                <div>
                  <div class="flex items-center gap-space-xs">
                    <span class="material-symbols-outlined text-[24px] text-primary">pending_actions</span>
                    <h2 class="font-headline-md text-headline-md text-on-surface font-bold">Daily Care &amp; Reminder Schedule</h2>
                  </div>
                  <p class="font-body-md text-body-md text-on-surface-variant">
                    Structured care milestones for ${currentPatient.name}. Partitioned into Completed, Due Soon, and Upcoming.
                  </p>
                </div>
                <button id="dashboardAddReminderBtn" class="flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-md transition-all shrink-0 cursor-pointer" type="button">
                  <span class="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>Add Scheduled Item</span>
                </button>
              </div>

              <!-- Non-Prescriptive Medical Disclaimer Notice -->
              <div class="p-space-sm rounded-xl bg-secondary/10 border border-secondary/20 flex items-start gap-space-xs">
                <span class="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">info</span>
                <p class="font-caption text-caption text-on-surface-variant leading-snug">
                  <strong class="font-semibold text-secondary">Non-Prescriptive Notice:</strong> Caregivers configure daily reminders. MindMitra never prescribes medications, alters dosages, or recommends treatment modifications.
                </p>
              </div>

              <!-- 3-Column Daily Care Partition -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
                <!-- Due Soon Column -->
                <div class="flex flex-col rounded-xl bg-surface-container-low p-space-md border border-surface-container">
                  <div class="flex items-center justify-between pb-space-sm border-b border-surface-container mb-space-sm">
                    <span class="font-label-lg text-label-lg font-bold text-primary flex items-center gap-1">
                      <span class="material-symbols-outlined text-[18px]">alarm</span> Due Soon
                    </span>
                    <span class="px-space-xs py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-bold">
                      ${careSummary.dueSoon.length}
                    </span>
                  </div>
                  <div class="space-y-space-sm flex-1">
                    ${careSummary.dueSoon.length === 0 ? `
                      <p class="font-caption text-caption text-on-surface-variant italic py-space-sm">No items due soon.</p>
                    ` : careSummary.dueSoon.map(r => `
                      <div class="p-space-sm rounded-xl bg-surface-container flex items-start justify-between gap-space-xs border border-outline/10">
                        <div class="flex items-start gap-space-xs min-w-0">
                          <button class="toggle-routine-btn w-6 h-6 rounded-full border-2 border-outline/40 flex items-center justify-center shrink-0 mt-0.5 hover:border-primary transition-colors cursor-pointer" data-id="${r.id}" title="Mark completed">
                          </button>
                          <div class="flex flex-col min-w-0">
                            <span class="font-label-md text-label-md font-bold text-on-surface truncate">${r.title}</span>
                            <span class="font-caption text-caption text-primary font-semibold">${r.time} • ${r.recurrence || 'Daily'}</span>
                            ${r.description ? `<p class="font-caption text-caption text-on-surface-variant truncate">${r.description}</p>` : ''}
                          </div>
                        </div>
                        <button class="edit-routine-btn p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer shrink-0" data-id="${r.id}" title="Edit reminder">
                          <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Upcoming Column -->
                <div class="flex flex-col rounded-xl bg-surface-container-low p-space-md border border-surface-container">
                  <div class="flex items-center justify-between pb-space-sm border-b border-surface-container mb-space-sm">
                    <span class="font-label-lg text-label-lg font-bold text-on-surface flex items-center gap-1">
                      <span class="material-symbols-outlined text-[18px]">schedule</span> Upcoming
                    </span>
                    <span class="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface font-caption text-caption font-bold">
                      ${careSummary.upcoming.length}
                    </span>
                  </div>
                  <div class="space-y-space-sm flex-1">
                    ${careSummary.upcoming.length === 0 ? `
                      <p class="font-caption text-caption text-on-surface-variant italic py-space-sm">No upcoming items later today.</p>
                    ` : careSummary.upcoming.map(r => `
                      <div class="p-space-sm rounded-xl bg-surface-container flex items-start justify-between gap-space-xs border border-outline/10">
                        <div class="flex items-start gap-space-xs min-w-0">
                          <button class="toggle-routine-btn w-6 h-6 rounded-full border-2 border-outline/40 flex items-center justify-center shrink-0 mt-0.5 hover:border-primary transition-colors cursor-pointer" data-id="${r.id}" title="Mark completed">
                          </button>
                          <div class="flex flex-col min-w-0">
                            <span class="font-label-md text-label-md font-bold text-on-surface truncate">${r.title}</span>
                            <span class="font-caption text-caption text-on-surface-variant font-medium">${r.time} • ${r.recurrence || 'Daily'}</span>
                            ${r.description ? `<p class="font-caption text-caption text-on-surface-variant truncate">${r.description}</p>` : ''}
                          </div>
                        </div>
                        <button class="edit-routine-btn p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer shrink-0" data-id="${r.id}" title="Edit reminder">
                          <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Completed Column -->
                <div class="flex flex-col rounded-xl bg-surface-container-low p-space-md border border-surface-container">
                  <div class="flex items-center justify-between pb-space-sm border-b border-surface-container mb-space-sm">
                    <span class="font-label-lg text-label-lg font-bold text-tertiary flex items-center gap-1">
                      <span class="material-symbols-outlined text-[18px]">check_circle</span> Completed
                    </span>
                    <span class="px-space-xs py-0.5 rounded-full bg-tertiary/10 text-tertiary font-caption text-caption font-bold">
                      ${careSummary.completed.length}
                    </span>
                  </div>
                  <div class="space-y-space-sm flex-1">
                    ${careSummary.completed.length === 0 ? `
                      <p class="font-caption text-caption text-on-surface-variant italic py-space-sm">No items completed yet today.</p>
                    ` : careSummary.completed.map(r => `
                      <div class="p-space-sm rounded-xl bg-surface-container-high/60 flex items-start justify-between gap-space-xs border border-outline/5">
                        <div class="flex items-start gap-space-xs min-w-0">
                          <button class="toggle-routine-btn w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shrink-0 mt-0.5 cursor-pointer" data-id="${r.id}" title="Undo completion">
                            <span class="material-symbols-outlined text-[14px]">check</span>
                          </button>
                          <div class="flex flex-col min-w-0">
                            <span class="font-label-md text-label-md font-bold text-on-surface line-through opacity-80 truncate">${r.title}</span>
                            <span class="font-caption text-caption text-tertiary font-semibold">Done at ${r.completedAt || r.time}</span>
                          </div>
                        </div>
                        <button class="edit-routine-btn p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer shrink-0" data-id="${r.id}" title="Edit reminder">
                          <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </section>

            <!-- Cognitive Activity Overview & Adaptive Engine Progress -->
            <section class="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm flex flex-col gap-space-lg border border-surface-container">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-md border-b border-surface-container">
                <div>
                  <div class="flex items-center gap-space-xs">
                    <span class="material-symbols-outlined text-[24px] text-tertiary">psychology</span>
                    <h2 class="font-headline-md text-headline-md text-on-surface font-bold">Activity Performance &amp; Practice Progress</h2>
                  </div>
                  <p class="font-body-md text-body-md text-on-surface-variant">
                    Non-medical engagement records and adaptive difficulty progression from Part 5 &amp; Part 7.
                  </p>
                </div>
                <div class="flex items-center gap-space-xs bg-surface-container p-1 rounded-xl">
                  <button class="activity-cat-pill px-space-sm py-1 rounded-lg ${activeCategoryFilter === 'all' ? 'bg-surface-container-lowest text-on-surface font-bold shadow-sm' : 'text-on-surface-variant'} font-label-md text-label-md cursor-pointer transition-colors" data-cat="all">All</button>
                  <button class="activity-cat-pill px-space-sm py-1 rounded-lg ${activeCategoryFilter === 'remember' ? 'bg-surface-container-lowest text-on-surface font-bold shadow-sm' : 'text-on-surface-variant'} font-label-md text-label-md cursor-pointer transition-colors" data-cat="remember">Recall</button>
                  <button class="activity-cat-pill px-space-sm py-1 rounded-lg ${activeCategoryFilter === 'notice' ? 'bg-surface-container-lowest text-on-surface font-bold shadow-sm' : 'text-on-surface-variant'} font-label-md text-label-md cursor-pointer transition-colors" data-cat="notice">Attention</button>
                  <button class="activity-cat-pill px-space-sm py-1 rounded-lg ${activeCategoryFilter === 'solve' ? 'bg-surface-container-lowest text-on-surface font-bold shadow-sm' : 'text-on-surface-variant'} font-label-md text-label-md cursor-pointer transition-colors" data-cat="solve">Pattern</button>
                </div>
              </div>

              <!-- Adaptive Engine Progression Card -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                <div class="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
                  <span class="font-caption text-caption uppercase text-on-surface-variant font-semibold">Active Difficulty Profile</span>
                  <div class="flex items-baseline gap-space-xs mt-space-xs">
                    <span class="font-headline-lg text-headline-lg font-bold text-primary">${adaptiveProfile.preferredDifficulty || 'Easy'}</span>
                    <span class="font-label-md text-label-md text-on-surface-variant">Tier</span>
                  </div>
                  <span class="font-caption text-caption text-tertiary flex items-center gap-1 mt-space-xs">
                    <span class="material-symbols-outlined text-[16px]">tune</span> Calibrated to comfortable recall pace
                  </span>
                </div>

                <div class="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
                  <span class="font-caption text-caption uppercase text-on-surface-variant font-semibold">Difficulty Progression</span>
                  <div class="flex items-baseline gap-space-xs mt-space-xs">
                    <span class="font-headline-lg text-headline-lg font-bold text-on-surface">Maintained</span>
                  </div>
                  <p class="font-caption text-caption text-on-surface-variant mt-space-xs leading-tight">
                    ${adaptiveEvents[0]?.reason || 'Recent strong performance; comfort-paced exercises maintained.'}
                  </p>
                </div>

                <div class="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
                  <span class="font-caption text-caption uppercase text-on-surface-variant font-semibold">Total Practice Sessions</span>
                  <div class="flex items-baseline gap-space-xs mt-space-xs">
                    <span class="font-headline-lg text-headline-lg font-bold text-secondary">${patientResults.length}</span>
                    <span class="font-label-md text-label-md text-on-surface-variant">Completed</span>
                  </div>
                  <span class="font-caption text-caption text-on-surface-variant mt-space-xs">
                    Last session: ${patientResults[0]?.date || 'Today'}
                  </span>
                </div>
              </div>

              <!-- Activity History Table -->
              <div class="overflow-x-auto rounded-xl border border-surface-container">
                <table class="w-full text-left font-body-md text-body-md">
                  <thead class="bg-surface-container text-on-surface-variant font-label-md text-label-md uppercase">
                    <tr>
                      <th class="p-space-sm">Activity</th>
                      <th class="p-space-sm">Category</th>
                      <th class="p-space-sm">Difficulty</th>
                      <th class="p-space-sm">Accuracy</th>
                      <th class="p-space-sm">Hints</th>
                      <th class="p-space-sm">Date</th>
                      <th class="p-space-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-surface-container bg-surface-container-lowest">
                    ${filteredResults.length === 0 ? `
                      <tr>
                        <td colspan="7" class="p-space-lg text-center text-on-surface-variant italic">
                          No activity records found matching this category filter.
                        </td>
                      </tr>
                    ` : filteredResults.map(r => `
                      <tr class="hover:bg-surface-container-low transition-colors">
                        <td class="p-space-sm font-bold text-on-surface">${r.activityTitle || r.activityId}</td>
                        <td class="p-space-sm">
                          <span class="px-space-xs py-0.5 rounded-full bg-surface-container font-caption text-caption font-semibold">
                            ${r.category || 'Recall'}
                          </span>
                        </td>
                        <td class="p-space-sm font-semibold text-primary">${r.difficulty || 'Easy'}</td>
                        <td class="p-space-sm font-bold text-on-surface">${r.accuracy || 100}%</td>
                        <td class="p-space-sm text-on-surface-variant">${r.hintsUsed || 0}</td>
                        <td class="p-space-sm text-on-surface-variant text-caption">${r.date || 'Recent'}</td>
                        <td class="p-space-sm">
                          <span class="inline-flex items-center gap-1 text-tertiary font-semibold text-caption">
                            <span class="material-symbols-outlined text-[14px]">check_circle</span> Completed
                          </span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Memory World Management & Advanced Knowledge Graph -->
            <section class="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm flex flex-col gap-space-lg border border-surface-container">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-md border-b border-surface-container">
                <div>
                  <div class="flex items-center gap-space-xs">
                    <span class="material-symbols-outlined text-[24px] text-primary">account_tree</span>
                    <h2 class="font-headline-md text-headline-md text-on-surface font-bold">Personal Memory Graph Explorer</h2>
                  </div>
                  <p class="font-body-md text-body-md text-on-surface-variant">
                    Interconnected memory relationships for ${currentPatient.name}. Tap any entity node to inspect connected memories.
                  </p>
                </div>
                <a href="#/caregiver-bridge" class="flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-md transition-all shrink-0">
                  <span class="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                  <span>Upload Keepsake to Bridge</span>
                </a>
              </div>

              <!-- Embedded Interactive Memory Graph -->
              <div id="memory-graph-container">
                ${renderMemoryGraph()}
              </div>
            </section>

            <!-- Family Circle & Emergency Safety Dual Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-space-xl">
              <!-- Family Circle Quick Access -->
              <section class="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm flex flex-col justify-between gap-space-md border border-surface-container">
                <div>
                  <div class="flex items-center justify-between pb-space-sm border-b border-surface-container mb-space-sm">
                    <div class="flex items-center gap-space-xs">
                      <span class="material-symbols-outlined text-[22px] text-secondary">group</span>
                      <h2 class="font-headline-sm text-headline-sm text-on-surface font-bold">Authorized Care Circle</h2>
                    </div>
                    <a href="#/family-circle" class="text-primary font-label-md text-label-md hover:underline">View All</a>
                  </div>

                  <div class="space-y-space-sm">
                    ${people.slice(0, 3).map(p => `
                      <div class="p-space-sm rounded-xl bg-surface-container flex items-center justify-between gap-space-sm">
                        <div class="flex items-center gap-space-xs min-w-0">
                          <img class="w-10 h-10 rounded-full object-cover shrink-0" src="${p.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw'}" alt="${p.name}">
                          <div class="flex flex-col min-w-0">
                            <span class="font-label-md text-label-md font-bold text-on-surface truncate">${p.name}</span>
                            <span class="font-caption text-caption text-on-surface-variant">${p.relation || 'Family'} • ${p.tag || 'Care Circle'}</span>
                          </div>
                        </div>
                        <span class="font-caption text-caption text-primary font-semibold shrink-0">${p.phone || 'Verified'}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <a href="#/family-circle" class="w-full py-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all text-center">
                  Manage Family Relationships
                </a>
              </section>

              <!-- Clinical Care Team & Connected Doctor -->
              <section class="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm flex flex-col justify-between gap-space-md border border-surface-container">
                <div>
                  <div class="flex items-center justify-between pb-space-sm border-b border-surface-container mb-space-sm">
                    <div class="flex items-center gap-space-xs">
                      <span class="material-symbols-outlined text-[22px] text-tertiary">medical_services</span>
                      <h2 class="font-headline-sm text-headline-sm text-on-surface font-bold">Clinical Care Team</h2>
                    </div>
                    <a href="#/caregiver-reports" class="text-primary font-label-md text-label-md hover:underline">Share Reports</a>
                  </div>

                  <div class="space-y-space-sm">
                    ${pendingDoctorConnections.length > 0 ? `
                      <div class="mb-space-xs space-y-space-xs">
                        <span class="font-caption text-caption font-bold text-amber-700 uppercase">Pending Authorization Requests</span>
                        ${pendingDoctorConnections.map(req => `
                          <div class="p-space-sm rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-col gap-space-xs">
                            <div class="flex items-center justify-between">
                              <div>
                                <span class="font-label-md text-label-md font-bold text-on-surface">${req.doctorName}</span>
                                <span class="font-caption text-caption text-on-surface-variant block">${req.doctorSpecialization} • ${req.doctorHospital}</span>
                              </div>
                              <span class="px-space-xs py-0.5 rounded-full bg-amber-100 text-amber-800 font-caption text-caption font-semibold">Pending</span>
                            </div>
                            <div class="flex items-center gap-space-xs mt-1">
                              <button data-approve-doc-conn="${req.id}" class="px-space-sm py-1 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:opacity-90 transition-all flex items-center gap-1">
                                <span class="material-symbols-outlined text-[16px]">check</span> Authorize
                              </button>
                              <button data-reject-doc-conn="${req.id}" class="px-space-sm py-1 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all flex items-center gap-1">
                                <span class="material-symbols-outlined text-[16px]">close</span> Decline
                              </button>
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}

                    ${connectedDoctors.length > 0 ? connectedDoctors.map(doc => `
                      <div class="p-space-sm rounded-xl bg-surface-container flex items-center justify-between gap-space-sm">
                        <div class="flex items-center gap-space-xs min-w-0">
                          <div class="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center shrink-0">
                            Dr
                          </div>
                          <div class="flex flex-col min-w-0">
                            <span class="font-label-md text-label-md font-bold text-on-surface truncate">${doc.doctorName}</span>
                            <span class="font-caption text-caption text-on-surface-variant">${doc.doctorSpecialization}</span>
                          </div>
                        </div>
                        <span class="px-space-xs py-0.5 rounded-full bg-green-50 text-green-700 font-caption text-caption font-bold border border-green-200 shrink-0">Authorized</span>
                      </div>
                      <p class="text-caption text-on-surface-variant mt-1">
                        Affiliation: <strong>${doc.doctorHospital}</strong>. Routine summaries shared with consent.
                      </p>
                    `).join('') : (pendingDoctorConnections.length === 0 ? `
                      <div class="p-space-sm rounded-xl bg-surface-container text-center text-on-surface-variant text-body-sm">
                        No doctor currently linked. Share reports with your clinical specialist.
                      </div>
                    ` : '')}
                  </div>
                </div>

                <a href="#/caregiver-reports" class="w-full py-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all text-center">
                  Open Clinical Reports &amp; Sharing
                </a>
              </section>

              <!-- Emergency SOS & Location Status -->
              <section class="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm flex flex-col justify-between gap-space-md border border-surface-container">
                <div>
                  <div class="flex items-center justify-between pb-space-sm border-b border-surface-container mb-space-sm">
                    <div class="flex items-center gap-space-xs">
                      <span class="material-symbols-outlined text-[22px] text-primary">emergency</span>
                      <h2 class="font-headline-sm text-headline-sm text-on-surface font-bold">Emergency &amp; Safety Setup</h2>
                    </div>
                    <a href="#/emergency-sos" class="text-primary font-label-md text-label-md hover:underline">Manage SOS</a>
                  </div>

                  <div class="space-y-space-sm">
                    <!-- Primary 112 Ready -->
                    <div class="p-space-sm rounded-xl bg-surface-container flex items-center justify-between">
                      <div class="flex items-center gap-space-xs">
                        <span class="material-symbols-outlined text-primary text-[22px]">local_police</span>
                        <div>
                          <span class="font-label-md text-label-md font-bold text-on-surface">112 Emergency Help</span>
                          <p class="font-caption text-caption text-on-surface-variant">Police, Ambulance, Fire &amp; Rescue</p>
                        </div>
                      </div>
                      <span class="px-space-xs py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-bold">Active</span>
                    </div>

                    <!-- Primary Contact -->
                    <div class="p-space-sm rounded-xl bg-surface-container flex items-center justify-between">
                      <div class="flex items-center gap-space-xs">
                        <span class="material-symbols-outlined text-tertiary text-[22px]">verified_user</span>
                        <div>
                          <span class="font-label-md text-label-md font-bold text-on-surface">Primary: ${primaryEmergencyContact ? primaryEmergencyContact.name : 'Configured'}</span>
                          <p class="font-caption text-caption text-on-surface-variant">${primaryEmergencyContact ? primaryEmergencyContact.phone : '+91 98450 21345'}</p>
                        </div>
                      </div>
                      <span class="px-space-xs py-0.5 rounded-full bg-tertiary/10 text-tertiary font-caption text-caption font-bold">Primary</span>
                    </div>

                    <!-- Location Status -->
                    <div class="p-space-sm rounded-xl bg-surface-container flex items-center justify-between">
                      <div class="flex items-center gap-space-xs">
                        <span class="material-symbols-outlined text-secondary text-[22px]">location_on</span>
                        <div>
                          <span class="font-label-md text-label-md font-bold text-on-surface">Location Status</span>
                          <p class="font-caption text-caption text-on-surface-variant">${locationState === 'available' ? 'Available upon user request' : 'Permission Managed'}</p>
                        </div>
                      </div>
                      <span class="px-space-xs py-0.5 rounded-full bg-secondary/10 text-secondary font-caption text-caption font-bold">Protected</span>
                    </div>
                  </div>
                </div>

                <a href="#/emergency-sos" class="w-full py-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all text-center">
                  Open Emergency SOS Center
                </a>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <!-- Patient Profile Modal Container -->
  <div id="patientProfileModalContainer"></div>
  `;
}

export function attachCaregiverDashboardEvents() {
  const currentPatientId = store.getCurrentPatientId();

  // Patient Selector Listener (when multiple authorized patients exist)
  const sidebarPatientSelector = document.getElementById('sidebarPatientSelector');
  if (sidebarPatientSelector) {
    sidebarPatientSelector.addEventListener('change', (e) => {
      const newPid = e.target.value;
      try {
        store.setActivePatientForCaregiver(newPid);
        showToast(`Switched active patient to ${newPid}`, 'verified');
        const contentEl = document.getElementById('view-content');
        if (contentEl) {
          contentEl.innerHTML = renderCaregiverDashboardView();
          attachCaregiverDashboardEvents();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Preview Patient Experience triggers
  const handlePreview = () => {
    store.setPatientPreviewMode(true, currentPatientId);
    window.location.hash = '#/patient-home';
  };
  document.getElementById('viewPatientPreviewBtn')?.addEventListener('click', handlePreview);

  // Caregiver Manual Sync trigger
  const syncNowBtn = document.getElementById('caregiverSyncNowBtn');
  if (syncNowBtn) {
    syncNowBtn.addEventListener('click', async () => {
      showToast('Synchronizing changes...', 'sync');
      const res = await offlineSyncService.triggerManualSync(currentPatientId);
      if (res.success) {
        showToast(`Synchronized successfully (${res.processedCount} items processed).`, 'check_circle');
      } else {
        showToast(res.error || 'Changes saved locally on device.', 'info');
      }
      const contentEl = document.getElementById('view-content');
      if (contentEl) {
        contentEl.innerHTML = renderCaregiverDashboardView();
        attachCaregiverDashboardEvents();
      }
    });
  }
  document.getElementById('previewPatientTopBtn')?.addEventListener('click', handlePreview);
  document.getElementById('sidebarPreviewBtn')?.addEventListener('click', handlePreview);

  // Daily Care Schedule adjustment & creation
  document.getElementById('adjustScheduleBtn')?.addEventListener('click', () => openScheduleEditor());
  document.getElementById('sidebarScheduleBtn')?.addEventListener('click', () => openScheduleEditor());
  document.getElementById('dashboardAddReminderBtn')?.addEventListener('click', () => openScheduleEditor());

  // Edit existing reminder
  document.querySelectorAll('.edit-routine-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openScheduleEditor(id);
    });
  });

  // Toggle routine completed / pending
  document.querySelectorAll('.toggle-routine-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      store.toggleRoutine(id);
      showToast('Schedule status updated', 'fact_check');
      const contentEl = document.getElementById('view-content');
      if (contentEl) {
        contentEl.innerHTML = renderCaregiverDashboardView();
        attachCaregiverDashboardEvents();
      }
    });
  });

  // Category filter pills in activity table
  document.querySelectorAll('.activity-cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategoryFilter = btn.getAttribute('data-cat') || 'all';
      const contentEl = document.getElementById('view-content');
      if (contentEl) {
        contentEl.innerHTML = renderCaregiverDashboardView();
        attachCaregiverDashboardEvents();
      }
    });
  });

  // SmritiAI voice modal & query chips
  document.getElementById('caregiverSmritiVoiceBtn')?.addEventListener('click', () => {
    store.setVoiceModalOpen(true);
  });

  document.querySelectorAll('.smriti-inquiry-chip').forEach(btn => {
    btn.addEventListener('click', async () => {
      const q = btn.getAttribute('data-query');
      if (q) {
        try {
          const resp = await smritiAIService.answerQuery(q, {
            patientId: currentPatientId
          });
          alert(`[SmritiAI Caregiver Assistant]\n\n${resp.text}`);
        } catch (err) {
          showToast('SmritiAI assistant inquiry error', 'error');
        }
      }
    });
  });

  // Patient Profile Modal
  const openPatientProfile = () => {
    const state = store.getState();
    const patient = state.users.find(u => u.id === currentPatientId) || state.users[0];
    const container = document.getElementById('patientProfileModalContainer');
    if (!container) return;

    container.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-space-md modal-backdrop">
      <div class="relative w-full max-w-lg rounded-2xl bg-surface-container-lowest p-space-xl shadow-2xl border border-surface-container">
        <div class="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-container">
          <div class="flex items-center gap-space-xs">
            <span class="material-symbols-outlined text-[24px] text-primary">badge</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${patient.name}'s Profile</h3>
          </div>
          <button id="closePatientProfileModalBtn" class="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer" type="button">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div class="space-y-space-md">
          <div class="flex items-center gap-space-md">
            <img class="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20" src="${patient.avatar}" alt="${patient.name}">
            <div>
              <h4 class="font-headline-sm text-headline-sm font-bold text-on-surface">${patient.name}</h4>
              <p class="font-caption text-caption text-on-surface-variant">Age ${patient.age || 72} • Patient ID: ${patient.id}</p>
            </div>
          </div>

          <div class="p-space-md rounded-xl bg-surface-container space-y-space-xs font-body-md text-body-md">
            <div><strong class="text-on-surface">Home Safe Zone:</strong> <span class="text-on-surface-variant">${patient.safeZone || 'Sector 4 Care Unit, Shillong'}</span></div>
            <div><strong class="text-on-surface">Emergency Address:</strong> <span class="text-on-surface-variant">${patient.emergencyAddress || 'House 14, Sector 4, Shillong'}</span></div>
            <div><strong class="text-on-surface">Preferred Languages:</strong> <span class="text-on-surface-variant">${(patient.languages || ['Hindi', 'English', 'Assamese', 'Bengali']).join(', ')}</span></div>
            <div><strong class="text-on-surface">Primary Caregiver:</strong> <span class="text-on-surface-variant">Meera (Daughter)</span></div>
          </div>
        </div>

        <div class="pt-space-md flex justify-end">
          <button id="closePatientProfileModalBtn2" type="button" class="px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-md text-label-md cursor-pointer">
            Close Profile
          </button>
        </div>
      </div>
    </div>
    `;

    document.getElementById('closePatientProfileModalBtn')?.addEventListener('click', () => {
      container.innerHTML = '';
    });
    document.getElementById('closePatientProfileModalBtn2')?.addEventListener('click', () => {
      container.innerHTML = '';
    });
  };

  document.getElementById('viewPatientProfileBtn')?.addEventListener('click', openPatientProfile);
  document.getElementById('heroPatientAvatar')?.addEventListener('click', openPatientProfile);

  // Care Log Observation note
  document.getElementById('btn-care-note')?.addEventListener('click', () => {
    const note = prompt("Add observation to patient's Care Log:", "Morning personal recall session steady. Relaxed pace.");
    if (note) {
      store.addCaregiverLog(note);
      showToast('Care observation recorded', 'note_add');
      const contentEl = document.getElementById('view-content');
      if (contentEl) {
        contentEl.innerHTML = renderCaregiverDashboardView();
        attachCaregiverDashboardEvents();
      }
    }
  });

  // Doctor Connection Approvals/Rejections by Caregiver
  document.querySelectorAll('[data-approve-doc-conn]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const connId = btn.getAttribute('data-approve-doc-conn');
      doctorService.updateConnectionStatus(connId, 'approved', currentPatientId, 'caregiver');
      showToast('Doctor access authorized for this patient', 'verified');
      const contentEl = document.getElementById('view-content');
      if (contentEl) {
        contentEl.innerHTML = renderCaregiverDashboardView();
        attachCaregiverDashboardEvents();
      }
    });
  });

  document.querySelectorAll('[data-reject-doc-conn]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const connId = btn.getAttribute('data-reject-doc-conn');
      doctorService.updateConnectionStatus(connId, 'rejected', currentPatientId, 'caregiver');
      showToast('Doctor connection request declined', 'cancel');
      const contentEl = document.getElementById('view-content');
      if (contentEl) {
        contentEl.innerHTML = renderCaregiverDashboardView();
        attachCaregiverDashboardEvents();
      }
    });
  });

  // Attach Memory Graph interactive events
  attachMemoryGraphEvents();

  // Sign out handlers
  const handleCaregiverLogout = () => {
    authService.logout();
    showToast('Caregiver session signed out.', 'logout');
    window.location.hash = '#/login';
  };
  document.getElementById('caregiverLogoutBtn')?.addEventListener('click', handleCaregiverLogout);
  document.getElementById('caregiverTopLogoutBtn')?.addEventListener('click', handleCaregiverLogout);

  // Listen for schedule updates from ScheduleEditorModal
  window.addEventListener('mindmitra:schedule_updated', () => {
    const contentEl = document.getElementById('view-content');
    if (contentEl && store.getState().activeRoute === 'caregiver-dashboard') {
      contentEl.innerHTML = renderCaregiverDashboardView();
      attachCaregiverDashboardEvents();
    }
  }, { once: true });
}

