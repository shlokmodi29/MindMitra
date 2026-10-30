// MindMitra Notification Permission Consent Modal
// Elder-friendly explanation before requesting browser notification permission
import { store } from '../state/store.js';
import { reminderService } from '../services/reminderService.js';
import { showToast } from './Toast.js';

export function renderNotificationPermissionModal() {
  const state = store.getState();
  if (!state.notificationPermissionModalOpen) return '';

  return `
  <div id="notifConsentBackdrop" class="fixed inset-0 z-50 flex items-center justify-center p-space-md modal-backdrop">
    <div class="relative w-full max-w-md rounded-3xl bg-surface-container-lowest p-space-xl md:p-space-2xl shadow-2xl border border-surface-container overflow-hidden text-center animate-slide-in">
      
      <!-- Gentle Illustration / Icon -->
      <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-space-md shadow-sm">
        <span class="material-symbols-outlined text-[36px]">notifications_active</span>
      </div>

      <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
        Stay Connected with Gentle Care Chimes
      </h3>

      <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-lg">
        Allow MindMitra to remind you when it is time for your daily care activities, fresh water, and prescribed morning medicines.
      </p>

      <div class="space-y-space-sm text-left mb-space-xl p-space-md rounded-2xl bg-surface-container-low border border-surface-container font-label-md text-label-md text-on-surface-variant">
        <div class="flex items-center gap-space-xs">
          <span class="material-symbols-outlined text-tertiary text-[20px]">check</span>
          <span>Soft, pleasant reminder chimes</span>
        </div>
        <div class="flex items-center gap-space-xs">
          <span class="material-symbols-outlined text-tertiary text-[20px]">check</span>
          <span>Never misses your prescription times</span>
        </div>
        <div class="flex items-center gap-space-xs">
          <span class="material-symbols-outlined text-tertiary text-[20px]">check</span>
          <span>Peace of mind for your family</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-space-sm">
        <button id="allowNotifBtn" class="flex-1 min-h-[50px] rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold shadow-md transition-all cursor-pointer flex items-center justify-center gap-space-xs">
          <span class="material-symbols-outlined text-[20px]">notifications</span>
          <span>Allow Reminders</span>
        </button>
        <button id="denyNotifBtn" class="px-space-lg min-h-[50px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer">
          Not Now
        </button>
      </div>

    </div>
  </div>
  `;
}

export function attachNotificationPermissionModalEvents() {
  const backdrop = document.getElementById('notifConsentBackdrop');
  const allowBtn = document.getElementById('allowNotifBtn');
  const denyBtn = document.getElementById('denyNotifBtn');

  const closeConsent = () => {
    store.setNotificationPermissionModalOpen(false);
  };

  denyBtn?.addEventListener('click', () => {
    showToast('In-app quiet reminders will still be active.', 'info');
    closeConsent();
  });

  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) closeConsent();
  });

  allowBtn?.addEventListener('click', async () => {
    closeConsent();
    const result = await reminderService.requestNotificationPermission();
    if (result === 'granted') {
      showToast('Gentle care reminders enabled!', 'notifications_active');
      store.setSettings({ notificationsEnabled: true });
    } else if (result === 'denied') {
      showToast('Notifications blocked in browser settings. You can still use in-app alerts.', 'notifications_off');
    } else {
      showToast('Notifications are not supported by this browser.', 'info');
    }
  });
}
