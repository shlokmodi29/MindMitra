// MindMitra Universal Client Router
import { store } from './state/store.js';
import { renderHeader } from './components/Header.js';
import { renderFooter } from './components/Footer.js';
import { renderSmritiModal, attachSmritiModalEvents } from './components/SmritiVoiceModal.js';
import { renderAuthModal, attachAuthModalEvents } from './components/AuthModal.js';
import { renderPatientHomeView, attachPatientHomeEvents } from './views/PatientHomeView.js';
import { renderMyDayView, attachMyDayEvents } from './views/MyDayView.js';
import { renderMemoryWorldView, attachMemoryWorldEvents } from './views/MemoryWorldView.js';
import { renderActivitiesHubView, attachActivitiesHubEvents } from './views/ActivitiesHubView.js';
import { renderEmergencySosView, attachEmergencySosEvents } from './views/EmergencySosView.js';
import { renderCaregiverDashboardView, attachCaregiverDashboardEvents } from './views/CaregiverDashboardView.js';
import { renderCaregiverMemoryBridgeView, attachCaregiverMemoryBridgeEvents } from './views/CaregiverMemoryBridgeView.js';
import { renderCaregiverReportsView, attachCaregiverReportsEvents } from './views/CaregiverReportsView.js';
import { renderFamilyCircleView, attachFamilyCircleEvents } from './views/FamilyCircleView.js';
import { renderPatientProfileView, attachPatientProfileEvents } from './views/PatientProfileView.js';
import { renderLoginView, attachLoginEvents } from './views/LoginView.js';
import { renderSignupView, attachSignupEvents } from './views/SignupView.js';
import { renderNotificationsModal, attachNotificationsModalEvents } from './components/NotificationsModal.js';
import { renderEditProfileModal, attachEditProfileModalEvents } from './components/EditProfileModal.js';
import { renderReminderDetailModal, attachReminderDetailModalEvents } from './components/ReminderDetailModal.js';
import { renderNotificationPermissionModal, attachNotificationPermissionModalEvents } from './components/NotificationPermissionModal.js';
import { renderMemoryDetailModal, attachMemoryDetailModalEvents } from './components/MemoryDetailModal.js';
import { renderEntityDetailModal, attachEntityDetailModalEvents } from './components/EntityDetailModal.js';
import { renderSmritiAIView, attachSmritiAIEvents } from './views/SmritiAIView.js';
import { renderDoctorPortalView, attachDoctorPortalEvents, setActiveDoctorTab } from './views/DoctorPortalView.js';
import { renderMyDoctorsView, attachMyDoctorsEvents } from './views/MyDoctorsView.js';
import { renderMemoryTimelineView, attachMemoryTimelineEvents } from './views/MemoryTimelineView.js';
import { renderAppointmentPrepView, attachAppointmentPrepEvents } from './views/AppointmentPrepView.js';
import { renderVoiceJournalView, attachVoiceJournalEvents } from './views/VoiceJournalView.js';
import { authService } from './services/authService.js';
import { showToast } from './components/Toast.js';
import { activityRegistry } from './services/activityRegistry.js';
import { activityEngine } from './services/activityEngine.js';
import { i18nService } from './services/i18nService.js';

const VALID_ROUTES = [
  'login',
  'signup',
  'patient-home',
  'patient-preview',
  'my-day',
  'memory-world',
  'memory-timeline',
  'activities',
  'emergency-sos',
  'caregiver-dashboard',
  'caregiver-bridge',
  'caregiver-reports',
  'analytics',
  'family-circle',
  'profile',
  'smriti-ai',
  'doctor-portal',
  'my-doctors',
  'appointment-prep',
  'voice-journal'
];

export function initRouter() {
  function handleRoute() {
    let hash = window.location.hash.replace('#/', '').replace('#', '').trim();
    if (!hash) hash = 'patient-home';

    const isAuth = authService.isAuthenticated();
    const userRole = authService.getUserRole();
    const state = store.getState();

    // Handle patient preview entry
    if (hash === 'patient-preview') {
      store.setPatientPreviewMode(true);
      hash = 'patient-home';
    } else if (hash.startsWith('caregiver')) {
      if (state.isPreviewMode) {
        store.setPatientPreviewMode(false);
      }
    }

    // Doctor portal subtab handling (e.g. doctor-portal/patients or doctor-portal/reports)
    let doctorSubTab = null;
    if (hash.startsWith('doctor-portal')) {
      const parts = hash.split('/');
      if (parts[1] && ['overview', 'patients', 'reports', 'notes', 'profile'].includes(parts[1])) {
        doctorSubTab = parts[1];
        setActiveDoctorTab(doctorSubTab);
      }
    }

    // Check for activities sub-route deep link (e.g. activities/memory-match or activities/act-1)
    let targetActivity = null;
    if (hash.startsWith('activities/')) {
      const slugOrId = hash.replace('activities/', '').trim();
      targetActivity = activityRegistry.getById(slugOrId);
      if (targetActivity) {
        store.setActiveActivity(targetActivity.id);
        activityEngine.startSession(targetActivity.id);
      }
    }

    // --- Route Guards ---
    if (!isAuth) {
      if (hash !== 'login' && hash !== 'signup') {
        showToast('Please sign in to continue.', 'lock');
        window.location.hash = '#/login';
        return;
      }
    } else {
      // 2. Authenticated user visited login/signup: Redirect to respective home
      if (hash === 'login' || hash === 'signup') {
        if (userRole === 'doctor') {
          window.location.hash = '#/doctor-portal';
        } else if (userRole === 'caregiver') {
          window.location.hash = '#/caregiver-dashboard';
        } else {
          window.location.hash = '#/patient-home';
        }
        return;
      }

      // 3. Unknown / Invalid route fallback: Gracefully navigate to respective home
      const isActivitiesSubroute = hash.startsWith('activities/') && targetActivity !== null;
      const isDoctorSubroute = hash.startsWith('doctor-portal');
      if (!VALID_ROUTES.includes(hash) && !isActivitiesSubroute && !isDoctorSubroute) {
        showToast('Page not found. Returned to Home.', 'info');
        if (userRole === 'doctor') {
          window.location.hash = '#/doctor-portal';
        } else if (userRole === 'caregiver') {
          window.location.hash = '#/caregiver-dashboard';
        } else {
          window.location.hash = '#/patient-home';
        }
        return;
      }

      // 4. Doctor role guard: Doctor is restricted to doctor-portal
      if (userRole === 'doctor' && !hash.startsWith('doctor-portal')) {
        showToast('Active Doctor Session: Redirected to Doctor Portal.', 'info');
        window.location.hash = '#/doctor-portal';
        return;
      }

      // 4.5 Non-doctor guard: Block non-doctors from doctor-portal
      if (userRole !== 'doctor' && hash.startsWith('doctor-portal')) {
        showToast('Access restricted: Healthcare professional credentials required.', 'lock');
        window.location.hash = userRole === 'caregiver' ? '#/caregiver-dashboard' : '#/patient-home';
        return;
      }

      // 5. Patient role guard: Block access to caregiver-only routes
      if (userRole === 'patient' && (hash.startsWith('caregiver') || hash === 'analytics')) {
        showToast('Access restricted: Caregiver credentials required.', 'lock');
        window.location.hash = '#/patient-home';
        return;
      }

      // 6. Caregiver role guard: Keep caregiver in caregiver workspace unless preview mode is active
      if (userRole === 'caregiver' && !state.isPreviewMode && (hash === 'patient-home' || hash === 'my-day' || hash === 'profile')) {
        showToast('Active Caregiver Session: Redirected to Caregiver Portal.', 'lock');
        window.location.hash = '#/caregiver-dashboard';
        return;
      }
    }

    const activeRouteKey = (hash.startsWith('activities') ? 'activities' : (hash.startsWith('doctor-portal') ? 'doctor-portal' : hash));
    store.setRoute(activeRouteKey);
    renderApp();
  }

  window.addEventListener('hashchange', handleRoute);
  // Initial route handle
  handleRoute();
}

export function renderApp() {
  const state = store.getState();
  const route = state.activeRoute;
  const userRole = authService.getUserRole();
  const isCaregiver = state.currentMode === 'caregiver' || route.startsWith('caregiver');
  const isDoctor = userRole === 'doctor' || route.startsWith('doctor-portal');

  const isAuthRoute = route === 'login' || route === 'signup';

  // Render Header (Caregiver, Doctor and Auth views have specialized / no universal top bar)
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    if (state.isPreviewMode) {
      const pid = store.getCurrentPatientId();
      const patient = (state.users || []).find(u => u.id === pid) || (state.users && state.users[0]) || { name: 'Patient' };
      headerContainer.innerHTML = `
        <div id="patientPreviewBanner" class="w-full bg-secondary text-on-secondary px-space-md py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div class="flex items-center gap-space-xs font-label-md text-label-md">
            <span class="material-symbols-outlined text-[20px] text-secondary-fixed">visibility</span>
            <span><strong>Patient Experience Preview:</strong> Viewing interface for ${patient.name}</span>
          </div>
          <button id="exitPreviewModeBtn" class="px-space-md py-1 rounded-xl bg-surface text-on-surface hover:bg-surface-container font-label-md text-label-md font-bold shadow-sm transition-all cursor-pointer">
            Exit Preview &amp; Return to Caregiver Portal
          </button>
        </div>
        ${renderHeader()}
      `;
      attachHeaderEvents();
      document.getElementById('exitPreviewModeBtn')?.addEventListener('click', () => {
        store.setPatientPreviewMode(false);
        window.location.hash = '#/caregiver-dashboard';
      });
    } else if (isCaregiver || isAuthRoute || isDoctor) {
      headerContainer.innerHTML = '';
    } else {
      headerContainer.innerHTML = renderHeader();
      attachHeaderEvents();
    }
  }

  // Render Main View Content
  const contentEl = document.getElementById('view-content');
  if (contentEl) {
    window.scrollTo({ top: 0, behavior: 'instant' });

    switch (route) {
      case 'login':
        contentEl.innerHTML = renderLoginView();
        attachLoginEvents();
        break;

      case 'signup':
        contentEl.innerHTML = renderSignupView();
        attachSignupEvents();
        break;

      case 'patient-home':
      case '':
        contentEl.innerHTML = renderPatientHomeView();
        attachPatientHomeEvents();
        break;

      case 'my-day':
        contentEl.innerHTML = renderMyDayView();
        attachMyDayEvents();
        break;

      case 'memory-world':
        contentEl.innerHTML = renderMemoryWorldView();
        attachMemoryWorldEvents();
        break;

      case 'memory-timeline':
        contentEl.innerHTML = renderMemoryTimelineView();
        attachMemoryTimelineEvents();
        break;

      case 'activities':
        contentEl.innerHTML = renderActivitiesHubView();
        attachActivitiesHubEvents();
        break;

      case 'emergency-sos':
        contentEl.innerHTML = renderEmergencySosView();
        attachEmergencySosEvents();
        break;

      case 'caregiver-dashboard':
        contentEl.innerHTML = renderCaregiverDashboardView();
        attachCaregiverDashboardEvents();
        break;

      case 'caregiver-bridge':
        contentEl.innerHTML = renderCaregiverMemoryBridgeView();
        attachCaregiverMemoryBridgeEvents();
        break;

      case 'caregiver-reports':
      case 'analytics':
        contentEl.innerHTML = renderCaregiverReportsView();
        attachCaregiverReportsEvents();
        break;

      case 'family-circle':
        contentEl.innerHTML = renderFamilyCircleView();
        attachFamilyCircleEvents();
        break;

      case 'profile':
        contentEl.innerHTML = renderPatientProfileView();
        attachPatientProfileEvents();
        break;

      case 'smriti-ai':
        contentEl.innerHTML = renderSmritiAIView();
        attachSmritiAIEvents(renderApp);
        break;

      case 'doctor-portal':
        contentEl.innerHTML = renderDoctorPortalView();
        attachDoctorPortalEvents();
        break;

      case 'my-doctors':
        contentEl.innerHTML = renderMyDoctorsView();
        attachMyDoctorsEvents();
        break;

      case 'appointment-prep':
        contentEl.innerHTML = renderAppointmentPrepView();
        attachAppointmentPrepEvents();
        break;

      case 'voice-journal':
        contentEl.innerHTML = renderVoiceJournalView();
        attachVoiceJournalEvents(renderApp);
        break;

      default:
        contentEl.innerHTML = renderPatientHomeView();
        attachPatientHomeEvents();
        break;
    }
  }

  // Render Footer (Patient mode only)
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    if (isCaregiver || isAuthRoute || isDoctor) {
      footerContainer.innerHTML = '';
    } else {
      footerContainer.innerHTML = renderFooter();
    }
  }

  // Render SmritiAI Voice Modal if open
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) {
    modalContainer.innerHTML = renderSmritiModal();
    attachSmritiModalEvents();
  }

  // Render Auth Profile Switcher Modal if open
  const authContainer = document.getElementById('auth-modal-container');
  if (authContainer) {
    authContainer.innerHTML = renderAuthModal();
    attachAuthModalEvents();
  }

  // Render Notifications Drawer if open
  const notifContainer = document.getElementById('notifications-modal-container');
  if (notifContainer) {
    notifContainer.innerHTML = renderNotificationsModal();
    attachNotificationsModalEvents();
  }

  // Render Edit Profile Modal if open
  const editProfileContainer = document.getElementById('edit-profile-modal-container');
  if (editProfileContainer) {
    editProfileContainer.innerHTML = renderEditProfileModal();
    attachEditProfileModalEvents();
  }

  // Render Reminder Detail Modal if open
  const reminderDetailContainer = document.getElementById('reminder-detail-modal-container');
  if (reminderDetailContainer) {
    reminderDetailContainer.innerHTML = renderReminderDetailModal();
    attachReminderDetailModalEvents();
  }

  // Render Notification Permission Modal if open
  const notifConsentContainer = document.getElementById('notification-permission-modal-container');
  if (notifConsentContainer) {
    notifConsentContainer.innerHTML = renderNotificationPermissionModal();
    attachNotificationPermissionModalEvents();
  }

  // Render Memory Detail Modal if open
  const memDetailContainer = document.getElementById('memory-detail-modal-container');
  if (memDetailContainer) {
    memDetailContainer.innerHTML = renderMemoryDetailModal();
    attachMemoryDetailModalEvents();
  }

  // Render Entity Detail Modal if open
  const entityDetailContainer = document.getElementById('entity-detail-modal-container');
  if (entityDetailContainer) {
    entityDetailContainer.innerHTML = renderEntityDetailModal();
    attachEntityDetailModalEvents();
  }
}

function attachHeaderEvents() {
  const smritiBtn = document.getElementById('headerSmritiBtn');
  if (smritiBtn) {
    smritiBtn.addEventListener('click', () => {
      store.setVoiceModalOpen(true);
      renderApp();
    });
  }

  const notifBtn = document.getElementById('headerNotificationsBtn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      store.setNotificationsModalOpen(true);
      renderApp();
    });
  }

  const langBtn = document.getElementById('langSwitcherBtn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const nextLang = i18nService.cycleLanguage();
      store.setLanguage(nextLang);
      const patientId = store.getCurrentPatientId();
      store.setPreferredLanguage(patientId, nextLang);
      showToast(`Language set to ${i18nService.getCurrentLanguageMeta().native}`, 'info');
      renderApp();
    });
  }

  const authSwitchBtn = document.getElementById('headerAuthSwitchBtn');
  if (authSwitchBtn) {
    authSwitchBtn.addEventListener('click', () => {
      store.setAuthModalOpen(true);
      renderApp();
    });
  }

  const logoutBtn = document.getElementById('headerLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      authService.logout();
      showToast('You have been signed out.', 'logout');
      window.location.hash = '#/login';
    });
  }

  const modePills = document.querySelectorAll('[data-mode]');
  modePills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      const mode = pill.getAttribute('data-mode');
      if (mode) {
        store.setMode(mode);
      }
    });
  });
}
