// MindMitra Main Application Initializer
import { store } from './state/store.js';
import { initRouter, renderApp } from './router.js';
import { offlineSyncService } from './services/offlineSyncService.js';

document.addEventListener('DOMContentLoaded', () => {
  // Subscribe to store updates
  store.subscribe(() => {
    renderApp();
  });

  // Subscribe to offlineSyncService updates
  offlineSyncService.subscribe((connState) => {
    store.setNetworkStatus(offlineSyncService.isOnline);
  });

  // Register Service Worker for offline shell capability
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[MindMitra SW] Registered successfully with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[MindMitra SW] Registration skipped or failed:', err);
      });
  }

  // Global ESC key listener to close modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const state = store.getState();
      if (state.voiceModalOpen) {
        store.setVoiceModalOpen(false);
      }
      if (state.authModalOpen) {
        store.setAuthModalOpen(false);
      }
      if (state.notificationsModalOpen) {
        store.setNotificationsModalOpen(false);
      }
      if (state.editProfileModalOpen) {
        store.setEditProfileModalOpen(false);
      }
      if (state.reminderDetailModalOpen) {
        store.setReminderDetailModalOpen(false);
      }
      if (state.notificationPermissionModalOpen) {
        store.setNotificationPermissionModalOpen(false);
      }
      if (state.memoryDetailModalOpen) {
        store.setMemoryDetailModalOpen(false);
      }
      if (state.entityDetailModalOpen) {
        store.setEntityDetailModalOpen(false);
      }
    }
  });

  // Start the router
  initRouter();
});

