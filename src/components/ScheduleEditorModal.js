// Caregiver Schedule & Daily Routine Editor Drawer / Modal
import { store } from '../state/store.js';
import { showToast } from './Toast.js';

let isOpen = false;
let editingRoutineId = null;

export function openScheduleEditor(routineId = null) {
  isOpen = true;
  editingRoutineId = routineId;
  renderScheduleEditor();
}

export function closeScheduleEditor() {
  isOpen = false;
  editingRoutineId = null;
  const container = document.getElementById('schedule-editor-container');
  if (container) container.innerHTML = '';
}

export function renderScheduleEditor() {
  const container = document.getElementById('schedule-editor-container');
  if (!container || !isOpen) return;

  const currentPatientId = store.getCurrentPatientId();
  const isEdit = Boolean(editingRoutineId);
  const routine = isEdit 
    ? (store.getState().routines || []).find(r => r.id === editingRoutineId) 
    : null;

  const titleVal = routine?.title || '';
  const catVal = routine?.category || routine?.type || 'medicine';
  const timeVal = routine?.time || '09:00 AM';
  const recVal = routine?.recurrence || 'daily';
  const descVal = routine?.description || routine?.notes || '';

  container.innerHTML = `
  <div class="fixed inset-0 z-50 flex items-center justify-center p-space-md modal-backdrop">
    <div class="relative w-full max-w-lg rounded-2xl bg-surface-container-lowest p-space-xl shadow-2xl border border-surface-container">
      <div class="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-container">
        <div class="flex items-center gap-space-xs">
          <span class="material-symbols-outlined text-[24px] text-primary">edit_calendar</span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">
            ${isEdit ? 'Edit Scheduled Care Item' : 'Add Daily Care Schedule'}
          </h3>
        </div>
        <button id="closeScheduleEditorBtn" class="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer" type="button" aria-label="Close">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Non-prescriptive clinical notice -->
      <div class="p-space-sm rounded-xl bg-secondary/10 border border-secondary/20 flex items-start gap-space-xs mb-space-md">
        <span class="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">info</span>
        <p class="font-caption text-caption text-on-surface-variant leading-snug">
          <strong class="font-semibold text-secondary">Non-Prescriptive Notice:</strong> Caregivers configure daily reminders. MindMitra never prescribes medications, alters dosages, or replaces professional medical guidance.
        </p>
      </div>

      <form id="scheduleForm" class="space-y-space-md">
        <div>
          <label class="block font-label-md text-label-md text-on-surface mb-1">Reminder or Routine Title</label>
          <input id="routineTitle" required class="w-full h-12 px-space-md rounded-xl bg-surface-container text-on-surface font-body-md text-body-md border border-outline/20 focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="e.g. Afternoon Blood Pressure Tablet" type="text" value="${titleVal}" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-1">Category / Type</label>
            <select id="routineCategory" class="w-full h-12 px-space-md rounded-xl bg-surface-container text-on-surface font-body-md text-body-md border border-outline/20 focus:outline-none focus:ring-2 focus:ring-primary/40">
              <option value="medicine" ${catVal === 'medicine' ? 'selected' : ''}>Prescription Medicine</option>
              <option value="hydration" ${catVal === 'hydration' ? 'selected' : ''}>Hydration / Water</option>
              <option value="appointment" ${catVal === 'appointment' ? 'selected' : ''}>Doctor / Family Call</option>
              <option value="activity" ${catVal === 'activity' ? 'selected' : ''}>Daily Activity</option>
              <option value="routine" ${catVal === 'routine' ? 'selected' : ''}>Daily Routine</option>
            </select>
          </div>
          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-1">Scheduled Time</label>
            <input id="routineTime" required class="w-full h-12 px-space-md rounded-xl bg-surface-container text-on-surface font-body-md text-body-md border border-outline/20 focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="e.g. 2:30 PM" type="text" value="${timeVal}" />
          </div>
          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-1">Recurrence</label>
            <select id="routineRecurrence" class="w-full h-12 px-space-md rounded-xl bg-surface-container text-on-surface font-body-md text-body-md border border-outline/20 focus:outline-none focus:ring-2 focus:ring-primary/40">
              <option value="daily" ${recVal === 'daily' ? 'selected' : ''}>Every Day</option>
              <option value="weekdays" ${recVal === 'weekdays' ? 'selected' : ''}>Weekdays (Mon-Fri)</option>
              <option value="weekly" ${recVal === 'weekly' ? 'selected' : ''}>Once a Week</option>
              <option value="once" ${recVal === 'once' ? 'selected' : ''}>One-time only</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-label-md text-label-md text-on-surface mb-1">Care Instructions / Notes</label>
          <textarea id="routineDesc" rows="2" class="w-full p-space-md rounded-xl bg-surface-container text-on-surface font-body-md text-body-md border border-outline/20 focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="e.g. Taken with a glass of warm water after meals.">${descVal}</textarea>
        </div>

        <div class="pt-space-md flex flex-wrap gap-space-sm">
          <button type="submit" class="flex-1 min-h-[48px] rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md transition-all cursor-pointer">
            ${isEdit ? 'Update & Sync' : 'Save & Sync with Tablet'}
          </button>
          ${isEdit ? `
            <button id="deleteRoutineBtn" type="button" class="px-space-md min-h-[48px] rounded-xl bg-error-container text-on-error-container hover:bg-error-container/80 font-label-md text-label-md transition-colors cursor-pointer">
              Delete
            </button>
          ` : ''}
          <button id="cancelScheduleBtn" type="button" class="px-space-lg min-h-[48px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
  `;

  document.getElementById('closeScheduleEditorBtn')?.addEventListener('click', closeScheduleEditor);
  document.getElementById('cancelScheduleBtn')?.addEventListener('click', closeScheduleEditor);

  if (isEdit) {
    document.getElementById('deleteRoutineBtn')?.addEventListener('click', () => {
      if (confirm(`Remove "${titleVal}" from daily schedule?`)) {
        store.deleteRoutine(editingRoutineId);
        showToast(`Removed: ${titleVal}`, 'delete');
        closeScheduleEditor();
        window.dispatchEvent(new CustomEvent('mindmitra:schedule_updated'));
      }
    });
  }

  document.getElementById('scheduleForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('routineTitle').value?.trim();
    const cat = document.getElementById('routineCategory').value;
    const time = document.getElementById('routineTime').value?.trim();
    const recurrence = document.getElementById('routineRecurrence').value;
    const desc = document.getElementById('routineDesc').value?.trim();

    if (!title) {
      showToast('Please enter a reminder title', 'error');
      return;
    }
    if (!time) {
      showToast('Please enter a scheduled time', 'error');
      return;
    }

    let icon = 'schedule';
    if (cat === 'medicine') icon = 'medication';
    else if (cat === 'hydration') icon = 'water_drop';
    else if (cat === 'appointment') icon = 'calendar_month';
    else if (cat === 'activity') icon = 'psychology';
    else if (cat === 'routine') icon = 'task_alt';

    if (isEdit) {
      store.updateRoutine(editingRoutineId, {
        title,
        category: cat,
        type: cat,
        time,
        recurrence,
        description: desc || 'Configured by Caregiver',
        notes: desc || 'Configured by Caregiver',
        icon
      });
      showToast(`Updated: ${title} (${time})`, 'check_circle');
    } else {
      store.addRoutine({
        patientId: currentPatientId,
        title,
        category: cat,
        type: cat,
        time,
        recurrence,
        description: desc || 'Configured by Caregiver',
        notes: desc || 'Configured by Caregiver',
        icon
      });
      showToast(`Added: ${title} (${time})`, 'check_circle');
    }

    closeScheduleEditor();
    window.dispatchEvent(new CustomEvent('mindmitra:schedule_updated'));
  });
}
