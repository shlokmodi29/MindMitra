// MindMitra Universal Header Component (Faithful to Stitch export)
import { store } from '../state/store.js';
import { i18nService } from '../services/i18nService.js';
import { offlineSyncService, CONNECTIVITY_STATES } from '../services/offlineSyncService.js';

export function renderHeader() {
  const state = store.getState();
  const currentRoute = state.activeRoute;
  const isCaregiver = state.currentMode === 'caregiver' || currentRoute === 'caregiver-dashboard';
  const unreadNotifs = (state.notifications || []).filter(n => !n.read).length;
  const isOnline = state.isOnline !== undefined ? state.isOnline : true;
  const activeLangMeta = i18nService.getCurrentLanguageMeta();
  const connState = offlineSyncService.getConnectivityState ? offlineSyncService.getConnectivityState() : (isOnline ? 'ONLINE' : 'OFFLINE');
  const patientStatusMsg = offlineSyncService.getPatientStatusMessage ? offlineSyncService.getPatientStatusMessage() : (isOnline ? 'Connected' : 'Offline — Saved locally');
  const isSyncing = connState === CONNECTIVITY_STATES.SYNCING || connState === CONNECTIVITY_STATES.RECONNECTING;

  return `
  <header class="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_2px_12px_rgba(74,40,64,0.05)] border-b border-surface-container">
    <div class="h-20 w-full max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-4 xl:px-4 2xl:px-8 flex items-center gap-2 xl:gap-2 2xl:gap-4 box-border min-w-0">
      
      <!-- 1. BRAND -->
      <div class="flex items-center shrink-0">
        <a href="#/patient-home" class="flex items-center focus:outline-none shrink-0" aria-label="MindMitra Home">
          <!-- Scalable crisp inline SVG logo from Stitch export -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" class="w-[126px] sm:w-[132px] xl:w-[136px] 2xl:w-[145px] h-auto shrink-0" fill="none">
            <g transform="translate(4, 4)">
              <circle cx="16" cy="16" r="15" fill="#FAF7F2" stroke="#E6DFD5" stroke-width="1"/>
              <path d="M16 6C12 11 11 16 16 26C21 16 20 11 16 6Z" fill="#9f3c16" opacity="0.95"/>
              <path d="M6 16C11 12 16 11 26 16C16 21 11 20 6 16Z" fill="#79526c" opacity="0.85"/>
              <circle cx="16" cy="16" r="3.5" fill="#FAF7F2"/>
              <circle cx="16" cy="16" r="2" fill="#D9822B"/>
            </g>
            <text x="44" y="24" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="18" font-weight="700" fill="#1f1b18" letter-spacing="-0.3">Mind<tspan fill="#9f3c16">Mitra</tspan></text>
            <text x="45" y="33" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8" font-weight="600" fill="#57423b" letter-spacing="0.8">MEMORY THAT MATTERS</text>
          </svg>
        </a>
      </div>

      <!-- 2. MODE SWITCHER -->
      <div class="hidden xl:flex items-center bg-surface-container-high p-0.5 2xl:p-1 rounded-full shadow-inner shrink-0">
        <a href="#/patient-home" 
           class="px-2 xl:px-2 2xl:px-3.5 py-1 rounded-full font-label-md text-label-md whitespace-nowrap transition-all ${
             !isCaregiver 
               ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold' 
               : 'text-on-surface-variant hover:text-on-surface'
           }" 
           data-mode="patient">
          Patient Mode
        </a>
        <a href="#/caregiver-dashboard" 
           class="px-2 xl:px-2 2xl:px-3.5 py-1 rounded-full font-label-md text-label-md whitespace-nowrap transition-all ${
             isCaregiver 
               ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold' 
               : 'text-on-surface-variant hover:text-on-surface'
           }" 
           data-mode="caregiver">
          Caregiver Portal
        </a>
      </div>

      <!-- 3. PRIMARY NAVIGATION -->
      ${!isCaregiver ? `
      <nav class="hidden lg:flex items-center gap-space-xs xl:gap-1 2xl:gap-space-xs px-1 xl:px-1 2xl:px-space-xs py-1 bg-surface-container-low rounded-xl shrink-0 min-w-0" aria-label="Main Navigation">
        <a href="#/patient-home" 
           class="shrink-0 px-2 xl:px-2 2xl:px-space-md py-1 rounded-xl font-label-lg text-label-lg xl:font-label-md xl:text-label-md 2xl:font-label-lg 2xl:text-label-lg whitespace-nowrap transition-colors ${
             currentRoute === 'patient-home' || currentRoute === '' 
               ? 'bg-primary-container text-on-primary-container shadow-sm font-semibold' 
               : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
           }">
          ${i18nService.t('nav.home')}
        </a>
        <a href="#/my-day" 
           class="shrink-0 px-2 xl:px-2 2xl:px-space-md py-1 rounded-xl font-label-lg text-label-lg xl:font-label-md xl:text-label-md 2xl:font-label-lg 2xl:text-label-lg whitespace-nowrap transition-colors ${
             currentRoute === 'my-day' 
               ? 'bg-primary-container text-on-primary-container shadow-sm font-semibold' 
               : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
           }">
          ${i18nService.t('nav.myDay')}
        </a>
        <a href="#/memory-world" 
           class="shrink-0 px-2 xl:px-2 2xl:px-space-md py-1 rounded-xl font-label-lg text-label-lg xl:font-label-md xl:text-label-md 2xl:font-label-lg 2xl:text-label-lg whitespace-nowrap transition-colors ${
             currentRoute === 'memory-world' 
               ? 'bg-primary-container text-on-primary-container shadow-sm font-semibold' 
               : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
           }">
          ${i18nService.t('nav.memories')}
        </a>
        <a href="#/activities" 
           class="shrink-0 px-2 xl:px-2 2xl:px-space-md py-1 rounded-xl font-label-lg text-label-lg xl:font-label-md xl:text-label-md 2xl:font-label-lg 2xl:text-label-lg whitespace-nowrap transition-colors ${
             currentRoute === 'activities' 
               ? 'bg-primary-container text-on-primary-container shadow-sm font-semibold' 
               : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
           }">
          ${i18nService.t('nav.activities')}
        </a>
        <a href="#/family-circle" 
           class="shrink-0 px-2 xl:px-2 2xl:px-space-md py-1 rounded-xl font-label-lg text-label-lg xl:font-label-md xl:text-label-md 2xl:font-label-lg 2xl:text-label-lg whitespace-nowrap transition-colors ${
             currentRoute === 'family-circle' 
               ? 'bg-primary-container text-on-primary-container shadow-sm font-semibold' 
               : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
           }">
          ${i18nService.t('family.title') || 'Family Circle'}
        </a>
      </nav>
      ` : `
      <div class="hidden lg:flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md truncate px-2 shrink-0">
        <span class="material-symbols-outlined text-[20px] text-tertiary shrink-0">supervised_user_circle</span>
        <span class="truncate">Caregiver Telemetry Active • Sector 4 Unit</span>
      </div>
      `}

      <!-- 4. UTILITY ACTIONS -->
      <div class="flex items-center gap-1.5 sm:gap-2 xl:gap-2 2xl:gap-2.5 shrink-0 ml-auto">
        <!-- Accessible Connectivity & Sync Status Pill -->
        <div class="hidden xl:flex items-center gap-1.5 px-2 xl:px-2.5 py-1 rounded-full ${
          isOnline ? 'bg-tertiary-fixed/40 text-on-tertiary-fixed' : 'bg-surface-container-high text-on-surface-variant'
        } font-caption text-caption shadow-sm shrink-0" role="status" aria-live="polite" title="${patientStatusMsg}">
          <span class="w-2 h-2 rounded-full ${isOnline ? (isSyncing ? 'bg-secondary animate-spin' : 'bg-tertiary animate-pulse') : 'bg-outline'} shrink-0"></span>
          <span class="hidden 2xl:inline whitespace-nowrap">${patientStatusMsg}</span>
        </div>

        <!-- Notifications Bell Button -->
        <button id="headerNotificationsBtn" 
                class="relative flex items-center justify-center w-9 h-9 xl:w-9 2xl:w-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer shrink-0" 
                title="Notifications"
                aria-label="View notifications">
          <span class="material-symbols-outlined text-[20px] xl:text-[22px] shrink-0">notifications</span>
          ${unreadNotifs > 0 ? `
            <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-surface"></span>
          ` : ''}
        </button>

        <!-- Language Pill (Cycles EN -> हिन्दी -> অসমীয়া -> বাংলা) -->
        <button id="langSwitcherBtn" class="flex items-center gap-1 xl:gap-space-2xs px-2 xl:px-2.5 py-1.5 min-h-[36px] xl:min-h-[38px] rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md cursor-pointer hover:bg-surface-container-high transition-colors shrink-0" title="Change Language: ${activeLangMeta.label}">
          <span class="material-symbols-outlined text-[18px] shrink-0">translate</span>
          <span class="hidden 2xl:inline font-medium whitespace-nowrap">${activeLangMeta.native}</span>
        </button>

        <!-- Emergency SOS Button -->
        <a href="#/emergency-sos" 
           class="flex items-center gap-1 xl:gap-space-2xs px-2 xl:px-2.5 2xl:px-3 py-1.5 rounded-full bg-error-container text-on-error-container hover:bg-error/20 font-label-md text-label-md transition-all shadow-sm shrink-0 cursor-pointer" 
           aria-label="Emergency SOS Assistance">
          <span class="material-symbols-outlined text-[18px] text-error material-symbols-fill shrink-0">emergency</span>
          <span class="hidden sm:inline font-semibold text-error whitespace-nowrap">SOS Help</span>
        </a>

        <!-- SmritiAI Voice Trigger Pill Button -->
        <button id="headerSmritiBtn" 
                class="flex items-center gap-1 xl:gap-space-xs px-2 xl:px-2.5 2xl:px-3.5 py-1.5 rounded-full bg-secondary text-on-secondary hover:bg-secondary/90 transition-all shadow-[0_4px_14px_-2px_rgba(74,40,64,0.25)] cursor-pointer active:scale-95 shrink-0" 
                type="button" 
                aria-label="Activate SmritiAI Voice Companion">
          <span class="material-symbols-outlined text-[20px] shrink-0">mic</span>
          <span class="hidden sm:inline font-label-md text-label-md whitespace-nowrap">SmritiAI</span>
        </button>

        <!-- Dynamic Patient Avatar & Profile Button -->
        <a href="#/profile" 
           id="headerProfileBtn"
           class="flex items-center gap-1.5 xl:gap-2 hover:opacity-85 transition-opacity cursor-pointer group shrink-0" 
           title="Settings & Accessibility Profile">
          <img alt="Profile of ${state.profile.name}" 
               class="w-8 h-8 rounded-full object-cover ring-2 ring-surface-container-high group-hover:ring-primary shadow-sm transition-all shrink-0" 
               src="${state.profile.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0YAy95YXoJS_5vZSXW6X-PnJg1OsTqHJE2auKWrD5E7ybjkztRBBIbPZq3y0AoaM-Eb7-2Qx61e_xOx0bClvELv1MtWm0Z7VfdKvssQV7JArcPSFqwheQMajYjLn1WtA7dzsP7DkKjOMqz60OC8iteQ13hCjAL-3WZhbWP9JoryUyuNiYnvwio5McweNRZW-WZd1RGWNj0z1B2xPhZHGMqCFaED7B18VQpnsX4l16dCIuTMDLx3oi'}">
          <div class="hidden xl:flex flex-col text-left shrink-0">
            <span class="font-label-md text-label-md leading-none text-on-surface font-semibold whitespace-nowrap truncate max-w-[85px] 2xl:max-w-[110px]">${state.profile.name}</span>
            <span class="hidden 2xl:inline font-caption text-caption text-on-surface-variant leading-none mt-0.5">Profile &amp; Settings</span>
          </div>
        </a>

        <!-- Switch Account Button (Shortcut for multi-user setups) -->
        <button id="headerAuthSwitchBtn" 
                class="hidden 2xl:flex items-center p-space-2xs rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer shrink-0" 
                title="Switch Profile (Asha / Meera)">
          <span class="material-symbols-outlined text-[18px] shrink-0">switch_account</span>
        </button>

        <!-- Functional Sign Out -->
        <button id="headerLogoutBtn" 
                class="flex items-center gap-1 xl:gap-space-2xs px-1.5 xl:px-2 2xl:px-2.5 py-1.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors cursor-pointer shrink-0" 
                title="Sign Out">
          <span class="material-symbols-outlined text-[20px] shrink-0">logout</span>
          <span class="hidden xl:inline font-label-md text-label-md whitespace-nowrap">Sign Out</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile & Tablet Fixed Bottom Navigation Bar -->
  ${!isCaregiver ? `
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-surface-container px-space-xs py-1.5 flex items-center justify-around shadow-[0_-2px_12px_rgba(74,40,64,0.06)] min-h-[64px]" aria-label="Mobile Navigation">
    <a href="#/patient-home" class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
      currentRoute === 'patient-home' || currentRoute === '' ? 'text-primary font-bold bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'
    }">
      <span class="material-symbols-outlined text-[24px]">home</span>
      <span class="font-caption text-[11px] leading-tight">${i18nService.t('nav.home')}</span>
    </a>
    <a href="#/my-day" class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
      currentRoute === 'my-day' ? 'text-primary font-bold bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'
    }">
      <span class="material-symbols-outlined text-[24px]">schedule</span>
      <span class="font-caption text-[11px] leading-tight">${i18nService.t('nav.myDay')}</span>
    </a>
    <a href="#/memory-world" class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
      currentRoute === 'memory-world' ? 'text-primary font-bold bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'
    }">
      <span class="material-symbols-outlined text-[24px]">auto_stories</span>
      <span class="font-caption text-[11px] leading-tight">${i18nService.t('nav.memories')}</span>
    </a>
    <a href="#/activities" class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
      currentRoute === 'activities' ? 'text-primary font-bold bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'
    }">
      <span class="material-symbols-outlined text-[24px]">psychology</span>
      <span class="font-caption text-[11px] leading-tight">${i18nService.t('nav.activities')}</span>
    </a>
    <a href="#/family-circle" class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
      currentRoute === 'family-circle' ? 'text-primary font-bold bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'
    }">
      <span class="material-symbols-outlined text-[24px]">group</span>
      <span class="font-caption text-[11px] leading-tight">Family</span>
    </a>
  </nav>
  ` : ''}
  `;
}

