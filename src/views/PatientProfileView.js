// Patient Profile & Accessibility Settings View (Elder-Centric)
import { store } from '../state/store.js';
import { authService } from '../services/authService.js';
import { i18nService } from '../services/i18nService.js';
import { showToast } from '../components/Toast.js';

export function renderPatientProfileView() {
  const state = store.getState();
  const settings = state.settings;
  const profile = state.currentUser || state.profile || state.users[0];

  return `
  <main class="w-full pt-20 bg-surface min-h-[calc(100vh-140px)]">
    <div class="max-w-4xl mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl">
      <!-- Breadcrumb -->
      <div class="flex items-center justify-between mb-space-lg">
        <a href="#/patient-home" class="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all text-label-lg font-label-lg group shadow-sm">
          <span class="material-symbols-outlined text-[22px] transition-transform group-hover:-translate-x-1">arrow_back</span>
          <span>Return to Home</span>
        </a>
        <span class="font-caption text-caption text-tertiary flex items-center gap-1 font-semibold">
          <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
          ${settings.offlineSyncStatus}
        </span>
      </div>

      <!-- Profile Header Card -->
      <div class="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm mb-space-xl border border-surface-container flex flex-col sm:flex-row items-center sm:items-start gap-space-lg text-center sm:text-left">
        <img class="w-24 h-24 rounded-full object-cover shadow-md ring-4 ring-primary/20 shrink-0" 
             src="${profile.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0YAy95YXoJS_5vZSXW6X-PnJg1OsTqHJE2auKWrD5E7ybjkztRBBIbPZq3y0AoaM-Eb7-2Qx61e_xOx0bClvELv1MtWm0Z7VfdKvssQV7JArcPSFqwheQMajYjLn1WtA7dzsP7DkKjOMqz60OC8iteQ13hCjAL-3WZhbWP9JoryUyuNiYnvwio5McweNRZW-WZd1RGWNj0z1B2xPhZHGMqCFaED7B18VQpnsX4l16dCIuTMDLx3oi'}" 
             alt="${profile.name}">
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-space-xs mb-1">
            <h1 class="font-headline-lg text-headline-lg text-on-surface font-bold">${profile.name}</h1>
            <span class="px-space-xs py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-caption font-semibold">${profile.age ? 'Age ' + profile.age : 'Patient Member'}</span>
          </div>
          <p class="font-body-md text-body-md text-on-surface-variant">${profile.safeZone || 'Home Safe Unit, Verified'}</p>
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-space-md mt-space-sm font-label-md text-label-md text-on-surface-variant">
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[18px] text-tertiary">home</span> ${profile.emergencyAddress || 'Home Unit Verified'}</span>
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[18px] text-primary">family_restroom</span> Primary Care: Meera</span>
          </div>
        </div>
        <div class="sm:ml-auto">
          <button id="openEditProfileBtn" class="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer border border-surface-container shadow-sm">
            <span class="material-symbols-outlined text-[18px] text-primary">edit</span>
            <span>Edit Details</span>
          </button>
        </div>
      </div>

      <!-- Elder Accessibility Customization -->
      <div class="space-y-space-lg mb-space-3xl">
        <div class="rounded-2xl bg-surface-container-lowest p-space-xl border border-surface-container shadow-sm">
          <h2 class="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">Elder Comfort &amp; Voice Settings</h2>
          <p class="font-body-md text-body-md text-on-surface-variant mb-space-lg">
            Adjust font size, voice speaking speed, notification chimes, and language for effortless reading and listening.
          </p>

          <div class="space-y-space-lg">
            <!-- Font Scale -->
            <div>
              <label class="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Reading Size</label>
              <div class="grid grid-cols-3 gap-space-sm">
                <button class="font-scale-btn py-space-sm rounded-xl border border-surface-container font-label-md text-label-md ${settings.fontSize === 'small' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'} cursor-pointer" data-size="small">
                  Standard (16px)
                </button>
                <button class="font-scale-btn py-space-sm rounded-xl border border-surface-container font-label-md text-label-md ${settings.fontSize === 'medium' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'} cursor-pointer font-bold" data-size="medium">
                  Comfort Large (18px)
                </button>
                <button class="font-scale-btn py-space-sm rounded-xl border border-surface-container font-label-md text-label-md ${settings.fontSize === 'large' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'} cursor-pointer font-extrabold" data-size="large">
                  Extra Large (20px)
                </button>
              </div>
            </div>

            <!-- Speech Voice Pacing -->
            <div>
              <label class="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">SmritiAI Speaking Speed</label>
              <div class="grid grid-cols-3 gap-space-sm">
                <button class="speech-rate-btn py-space-sm rounded-xl border border-surface-container font-label-md text-label-md ${settings.speechRate === 0.75 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'} cursor-pointer" data-rate="0.75">
                  Very Calm (Slow)
                </button>
                <button class="speech-rate-btn py-space-sm rounded-xl border border-surface-container font-label-md text-label-md ${settings.speechRate === 0.88 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'} cursor-pointer font-bold" data-rate="0.88">
                  Gentle Pacing (Recommended)
                </button>
                <button class="speech-rate-btn py-space-sm rounded-xl border border-surface-container font-label-md text-label-md ${settings.speechRate === 1.0 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'} cursor-pointer" data-rate="1.0">
                  Standard
                </button>
              </div>
            </div>

            <!-- Regional Language -->
            <div>
              <label class="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">${i18nService.t('settings.language') || 'Preferred Regional Language'}</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                <button class="profile-lang-btn py-space-sm min-h-[48px] rounded-xl border border-surface-container font-label-md text-label-md ${settings.language === 'en' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface'} cursor-pointer font-semibold" data-lang="en">
                  English
                </button>
                <button class="profile-lang-btn py-space-sm min-h-[48px] rounded-xl border border-surface-container font-label-md text-label-md ${settings.language === 'hi' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface'} cursor-pointer font-semibold" data-lang="hi">
                  हिन्दी (Hindi)
                </button>
                <button class="profile-lang-btn py-space-sm min-h-[48px] rounded-xl border border-surface-container font-label-md text-label-md ${settings.language === 'as' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface'} cursor-pointer font-semibold" data-lang="as">
                  অসমীয়া (Assamese)
                </button>
                <button class="profile-lang-btn py-space-sm min-h-[48px] rounded-xl border border-surface-container font-label-md text-label-md ${settings.language === 'bn' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface'} cursor-pointer font-semibold" data-lang="bn">
                  বাংলা (Bengali)
                </button>
              </div>
            </div>

            <!-- Reduced Motion Accessibility Toggle -->
            <div>
              <label class="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">${i18nService.t('settings.reducedMotion') || 'Reduced Motion'}</label>
              <div class="flex items-center justify-between p-space-md rounded-xl bg-surface-container border border-surface-container">
                <div class="flex items-center gap-space-sm">
                  <span class="material-symbols-outlined text-primary text-[24px]">motion_photos_off</span>
                  <div>
                    <p class="font-label-md text-label-md text-on-surface font-semibold">Calm UI Transitions</p>
                    <p class="font-caption text-caption text-on-surface-variant">Disables non-essential movement and animations for comfort</p>
                  </div>
                </div>
                <button id="toggleReducedMotionPrefBtn" class="px-space-md py-space-xs min-h-[44px] rounded-xl ${settings.reducedMotion ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'} font-label-md text-label-md cursor-pointer transition-colors font-semibold">
                  ${settings.reducedMotion ? 'Enabled' : 'Off'}
                </button>
              </div>
            </div>

            <!-- Gentle Notifications Toggle -->
            <div>
              <label class="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs">Gentle Care Chimes &amp; Reminders</label>
              <div class="flex items-center justify-between p-space-md rounded-xl bg-surface-container border border-surface-container">
                <div class="flex items-center gap-space-sm">
                  <span class="material-symbols-outlined text-primary text-[24px]">notifications_active</span>
                  <div>
                    <p class="font-label-md text-label-md text-on-surface font-semibold">Chime on scheduled milestones</p>
                    <p class="font-caption text-caption text-on-surface-variant">Soft, pleasant sound reminder for medicine and hydration</p>
                  </div>
                </div>
                <button id="toggleNotificationsPrefBtn" class="px-space-md py-space-xs min-h-[44px] rounded-xl ${settings.notificationsEnabled !== false ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'} font-label-md text-label-md cursor-pointer transition-colors font-semibold">
                  ${settings.notificationsEnabled !== false ? 'Enabled' : 'Muted'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Safe Sync & Security Transparency -->
        <div class="rounded-2xl bg-surface-container-low p-space-lg border border-surface-container flex items-center justify-between">
          <div class="flex items-center gap-space-md">
            <span class="material-symbols-outlined text-[28px] text-tertiary">cloud_done</span>
            <div>
              <p class="font-label-lg text-label-lg text-on-surface font-semibold">Local Offline Cache Safe</p>
              <p class="font-caption text-caption text-on-surface-variant">All memories, scheduled medicine alarms, and emergency contacts operate offline.</p>
            </div>
          </div>
          <button id="manualSyncBtn" class="px-space-md py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer">
            Sync Now
          </button>
        </div>

        <!-- Connected Healthcare & Doctors Link -->
        <a href="#/my-doctors" class="rounded-2xl bg-surface-container-lowest p-space-xl border border-surface-container shadow-sm flex items-center justify-between gap-space-md hover:border-primary/40 transition-all group">
          <div class="flex items-center gap-space-md">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span class="material-symbols-outlined text-[26px]">medical_services</span>
            </div>
            <div>
              <p class="font-label-lg text-label-lg text-on-surface font-bold">My Doctors &amp; Specialists</p>
              <p class="font-caption text-caption text-on-surface-variant">View authorized doctors, hospital affiliations, voice readout, and consent settings.</p>
            </div>
          </div>
          <span class="material-symbols-outlined text-outline group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
        </a>

        <!-- Authenticated Account & Sign Out -->
        <div class="rounded-2xl bg-surface-container-lowest p-space-xl border border-surface-container shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div class="flex items-center gap-space-md">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span class="material-symbols-outlined text-[26px]">manage_accounts</span>
            </div>
            <div>
              <p class="font-label-lg text-label-lg text-on-surface font-bold">${profile.name}</p>
              <p class="font-caption text-caption text-on-surface-variant">${profile.email || 'Patient Member'} • Role: Patient</p>
            </div>
          </div>
          <button id="patientProfileLogoutBtn" class="px-space-lg py-space-sm rounded-xl bg-error-container text-on-error-container hover:bg-error/20 font-label-md text-label-md transition-all cursor-pointer flex items-center justify-center gap-space-xs font-semibold shadow-sm">
            <span class="material-symbols-outlined text-[20px] text-error">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  </main>
  `;
}

export function attachPatientProfileEvents() {
  const fontBtns = document.querySelectorAll('.font-scale-btn');
  const rateBtns = document.querySelectorAll('.speech-rate-btn');
  const langBtns = document.querySelectorAll('.profile-lang-btn');
  const syncBtn = document.getElementById('manualSyncBtn');
  const logoutBtn = document.getElementById('patientProfileLogoutBtn');

  fontBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const size = btn.getAttribute('data-size');
      store.setAccessibilitySettings({ fontSize: size });
      showToast(`Font scale adjusted: ${size}`, 'format_size');
    });
  });

  rateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const rate = parseFloat(btn.getAttribute('data-rate'));
      store.setAccessibilitySettings({ speechRate: rate });
      showToast(`Speech pacing set to ${rate}x`, 'record_voice_over');
    });
  });

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      store.setLanguage(lang);
      showToast(`Language set to ${lang.toUpperCase()}`, 'translate');
    });
  });

  const editBtn = document.getElementById('openEditProfileBtn');
  const notifPrefBtn = document.getElementById('toggleNotificationsPrefBtn');
  const motionPrefBtn = document.getElementById('toggleReducedMotionPrefBtn');

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      store.setEditProfileModalOpen(true);
    });
  }

  if (motionPrefBtn) {
    motionPrefBtn.addEventListener('click', () => {
      const current = !!store.getState().settings.reducedMotion;
      const nextVal = !current;
      store.setAccessibilitySettings({ reducedMotion: nextVal });
      showToast(`Reduced motion ${nextVal ? 'activated' : 'deactivated'}`, 'motion_photos_off');
    });
  }

  if (notifPrefBtn) {
    notifPrefBtn.addEventListener('click', () => {
      const current = store.getState().settings.notificationsEnabled !== false;
      const nextVal = !current;
      store.setSettings({ notificationsEnabled: nextVal });
      showToast(`Gentle care chimes ${nextVal ? 'enabled' : 'muted'}`, nextVal ? 'notifications_active' : 'notifications_off');
    });
  }

  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      showToast('Cache synchronized with Sector 4 unit.', 'cloud_done');
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      authService.logout();
      showToast('You have been safely signed out.', 'logout');
      window.location.hash = '#/login';
    });
  }
}
