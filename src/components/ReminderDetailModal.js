// MindMitra Reminder Detail Modal
// Elder-friendly view of daily care instructions and actions
import { store } from '../state/store.js';
import { reminderService, REMINDER_STATUS } from '../services/reminderService.js';
import { showToast } from './Toast.js';

export function renderReminderDetailModal() {
  const state = store.getState();
  if (!state.reminderDetailModalOpen || !state.selectedReminderForDetail) {
    return '';
  }

  const reminder = state.selectedReminderForDetail;
  const isCompleted = reminder.completed || reminder.status === REMINDER_STATUS.COMPLETED;
  const isSnoozed = reminder.status === REMINDER_STATUS.SNOOZED;
  const patient = state.currentUser || state.profile || state.users[0];
  const patientName = patient?.name || 'Asha';

  const typeLabel = reminder.type === 'medicine' ? 'Prescription Care'
                  : reminder.type === 'hydration' ? 'Hydration'
                  : reminder.type === 'appointment' ? 'Family Event / Visit'
                  : reminder.type === 'activity' ? 'Memory Activity'
                  : 'Daily Routine';

  return `
  <div id="reminderDetailModalBackdrop" class="fixed inset-0 z-50 flex items-center justify-center p-space-md modal-backdrop">
    <div class="relative w-full max-w-lg rounded-3xl bg-surface-container-lowest p-space-xl md:p-space-2xl shadow-2xl border border-surface-container overflow-hidden animate-slide-in">
      
      <!-- Top Bar -->
      <div class="flex items-center justify-between pb-space-md border-b border-surface-container">
        <div class="flex items-center gap-space-sm">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <span class="material-symbols-outlined text-[28px]">${reminder.icon || 'schedule'}</span>
          </div>
          <div>
            <div class="flex items-center gap-space-xs flex-wrap">
              <span class="px-space-xs py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-caption font-semibold">
                ${typeLabel}
              </span>
              <span class="px-space-xs py-0.5 rounded-full ${isCompleted ? 'bg-tertiary-fixed text-on-tertiary-fixed' : isSnoozed ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container text-on-surface-variant'} font-caption text-caption font-semibold">
                ${isCompleted ? 'Completed' : isSnoozed ? 'Snoozed' : 'Scheduled'}
              </span>
            </div>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5">
              ${reminder.title}
            </h3>
          </div>
        </div>
        <button id="closeReminderDetailBtn" class="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" aria-label="Close details">
          <span class="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>

      <!-- Detail Body -->
      <div class="py-space-lg space-y-space-md">
        <!-- Scheduled Time & Recurrence -->
        <div class="flex items-center justify-between p-space-md rounded-2xl bg-surface-container-low border border-surface-container">
          <div class="flex items-center gap-space-sm">
            <span class="material-symbols-outlined text-primary text-[24px]">schedule</span>
            <div>
              <p class="font-caption text-caption text-on-surface-variant">Scheduled Time</p>
              <p class="font-headline-sm text-headline-sm font-bold text-on-surface">${reminder.time}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-caption text-caption text-on-surface-variant">Recurrence</p>
            <p class="font-label-md text-label-md font-semibold text-primary capitalize">${reminder.recurrence || 'Daily'}</p>
          </div>
        </div>

        <!-- Caregiver Instructions & Notes -->
        <div class="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container">
          <p class="font-caption text-caption text-primary font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">support_agent</span>
            <span>Care Instructions from ${reminder.createdBy || 'Caregiver'}</span>
          </p>
          <p class="font-body-lg text-body-lg text-on-surface leading-relaxed">
            ${reminder.notes || reminder.description || 'Follow normal comfortable routine. Take your time.'}
          </p>
          ${reminder.dosageNotes ? `
            <p class="font-caption text-caption text-on-surface-variant mt-2 p-space-xs rounded-xl bg-surface-container">
              Note: ${reminder.dosageNotes}
            </p>
          ` : ''}
        </div>

        <!-- Audio Reading Prompt -->
        <button id="detailHearReminderBtn" class="w-full min-h-[50px] px-space-md py-space-sm rounded-xl bg-secondary/10 hover:bg-secondary/20 text-secondary font-label-lg text-label-lg flex items-center justify-center gap-space-xs transition-colors cursor-pointer border border-secondary/20">
          <span class="material-symbols-outlined text-[22px]">volume_up</span>
          <span>Hear Reminder Read Aloud</span>
        </button>
      </div>

      <!-- Action Footer -->
      <div class="pt-space-md border-t border-surface-container flex flex-wrap items-center gap-space-sm">
        <button id="detailToggleDoneBtn" class="flex-1 min-h-[52px] rounded-xl ${isCompleted ? 'bg-surface-container text-on-surface hover:bg-surface-container-high' : 'bg-primary hover:bg-primary-container text-on-primary'} font-label-lg text-label-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-space-xs font-semibold">
          <span class="material-symbols-outlined text-[22px]">${isCompleted ? 'undo' : 'check_circle'}</span>
          <span>${isCompleted ? 'Mark Pending' : 'Mark as Done'}</span>
        </button>

        ${!isCompleted ? `
          <button id="detailSnoozeBtn" class="px-space-lg min-h-[52px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer flex items-center justify-center gap-space-xs">
            <span class="material-symbols-outlined text-[20px]">snooze</span>
            <span>Snooze (15m)</span>
          </button>
        ` : ''}
      </div>

    </div>
  </div>
  `;
}

export function attachReminderDetailModalEvents() {
  const state = store.getState();
  if (!state.reminderDetailModalOpen || !state.selectedReminderForDetail) return;

  const reminder = state.selectedReminderForDetail;
  const backdrop = document.getElementById('reminderDetailModalBackdrop');
  const closeBtn = document.getElementById('closeReminderDetailBtn');
  const hearBtn = document.getElementById('detailHearReminderBtn');
  const doneBtn = document.getElementById('detailToggleDoneBtn');
  const snoozeBtn = document.getElementById('detailSnoozeBtn');

  const closeModal = () => {
    store.setReminderDetailModalOpen(false);
  };

  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  hearBtn?.addEventListener('click', () => {
    const patient = state.currentUser || state.profile || state.users[0];
    reminderService.hearReminder(reminder, patient?.name || 'Asha');
    showToast('Playing gentle voice reminder...', 'volume_up');
  });

  doneBtn?.addEventListener('click', () => {
    if (reminder.completed) {
      store.updateReminder(reminder.id, { completed: false, status: REMINDER_STATUS.PENDING });
      showToast(`Milestone marked pending: ${reminder.title}`, 'pending');
    } else {
      store.markReminderDone(reminder.id);
      showToast(`Milestone completed: ${reminder.title}`, 'check_circle');
    }
    closeModal();
  });

  snoozeBtn?.addEventListener('click', () => {
    store.snoozeReminder(reminder.id, 15);
    showToast(`Reminder snoozed for 15 minutes: ${reminder.title}`, 'snooze');
    closeModal();
  });
}
