// MindMitra Notifications Drawer & Panel Component
// Elder-friendly, calm reminders and family connection notifications
import { store } from '../state/store.js';
import { showToast } from './Toast.js';
import { renderEmptyState } from './FeedbackStates.js';

export function renderNotificationsModal() {
  const state = store.getState();
  if (!state.notificationsModalOpen) return '';

  const notifications = state.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  return `
  <div id="notificationsModalBackdrop" class="fixed inset-0 z-50 flex items-start justify-end p-space-md sm:p-space-xl modal-backdrop">
    <div class="relative w-full max-w-md rounded-3xl bg-surface-container-lowest p-space-xl shadow-2xl border border-surface-container overflow-hidden flex flex-col max-h-[85vh] animate-slide-in">
      <!-- Header -->
      <div class="flex items-center justify-between pb-space-md border-b border-surface-container">
        <div class="flex items-center gap-space-sm">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span class="material-symbols-outlined text-[24px]">notifications</span>
          </div>
          <div>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Notifications</h3>
            <span class="font-caption text-caption text-on-surface-variant">
              ${unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </span>
          </div>
        </div>
        <button id="closeNotificationsBtn" class="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" aria-label="Close notifications">
          <span class="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>

      <!-- Action Bar -->
      ${unreadCount > 0 ? `
        <div class="flex items-center justify-between py-space-xs my-space-xs">
          <span class="font-caption text-caption text-on-surface-variant font-medium">Gentle care notices</span>
          <button id="markAllNotificationsReadBtn" class="text-primary hover:underline font-caption text-caption font-semibold cursor-pointer">
            Mark all as read
          </button>
        </div>
      ` : ''}

      <!-- Notifications List -->
      <div class="flex-1 overflow-y-auto space-y-space-sm py-space-sm">
        ${notifications.length === 0 ? renderEmptyState({
          icon: "notifications_off",
          title: "No Notifications",
          description: "Everything is quiet and serene. Your day is on schedule."
        }) : notifications.map(item => `
          <div class="notification-item p-space-md rounded-2xl ${item.read ? 'bg-surface-container-low opacity-80' : 'bg-surface-container-high/60 border-l-4 border-primary shadow-sm'} transition-all cursor-pointer flex items-start gap-space-sm group" data-id="${item.id}">
            <div class="w-10 h-10 rounded-xl ${item.read ? 'bg-surface-container text-on-surface-variant' : 'bg-primary-fixed text-on-primary-fixed'} flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[20px]">${item.icon || 'notifications'}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-space-xs mb-0.5">
                <span class="font-label-md text-label-md ${item.read ? 'text-on-surface' : 'text-on-surface font-bold'} truncate">${item.title}</span>
                <span class="font-caption text-caption text-on-surface-variant shrink-0">${item.time}</span>
              </div>
              <p class="font-body-md text-body-md text-on-surface-variant leading-snug">${item.message}</p>
            </div>
            ${!item.read ? `
              <span class="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5" title="Unread"></span>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <!-- Footer -->
      <div class="pt-space-md border-t border-surface-container text-center">
        <p class="font-caption text-caption text-on-surface-variant">
          Notifications are non-intrusive and respect your peaceful cadence.
        </p>
      </div>
    </div>
  </div>
  `;
}

export function attachNotificationsModalEvents() {
  const backdrop = document.getElementById('notificationsModalBackdrop');
  const closeBtn = document.getElementById('closeNotificationsBtn');
  const markAllBtn = document.getElementById('markAllNotificationsReadBtn');
  const items = document.querySelectorAll('.notification-item');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      store.setNotificationsModalOpen(false);
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        store.setNotificationsModalOpen(false);
      }
    });
  }

  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      store.markAllNotificationsRead();
      showToast('All notifications marked as read', 'done_all');
    });
  }

  items.forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      store.markNotificationRead(id);
    });
  });
}
