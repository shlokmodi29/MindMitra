// MindMitra Edit Patient Profile Modal
// Supports editing patient name, safe zone, and emergency address with persistent data layer sync
import { store } from '../state/store.js';
import { showToast } from './Toast.js';

export function renderEditProfileModal() {
  const state = store.getState();
  if (!state.editProfileModalOpen) return '';

  const profile = state.currentUser || state.profile || state.users[0];

  return `
  <div id="editProfileModalBackdrop" class="fixed inset-0 z-50 flex items-center justify-center p-space-md modal-backdrop">
    <div class="relative w-full max-w-lg rounded-3xl bg-surface-container-lowest p-space-xl md:p-space-2xl shadow-2xl border border-surface-container overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between pb-space-md border-b border-surface-container mb-space-lg">
        <div class="flex items-center gap-space-sm">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span class="material-symbols-outlined text-[24px]">edit</span>
          </div>
          <div>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Edit Profile</h3>
            <span class="font-caption text-caption text-on-surface-variant">Update elder details &amp; care address</span>
          </div>
        </div>
        <button id="closeEditProfileBtn" class="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" aria-label="Close edit profile">
          <span class="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>

      <form id="editProfileForm" class="space-y-space-md">
        <!-- Full Name -->
        <div>
          <label for="editProfileName" class="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-2xs text-left">
            Full Name
          </label>
          <input 
            id="editProfileName" 
            name="name" 
            type="text" 
            value="${profile.name || ''}" 
            required 
            class="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline/30 text-on-surface font-body-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-left"
          />
        </div>

        <!-- Safe Zone / Home Unit -->
        <div>
          <label for="editProfileSafeZone" class="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-2xs text-left">
            Safe Zone / Home Unit
          </label>
          <input 
            id="editProfileSafeZone" 
            name="safeZone" 
            type="text" 
            value="${profile.safeZone || 'Sector 4 Care Unit, Shillong'}" 
            class="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline/30 text-on-surface font-body-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-left"
          />
        </div>

        <!-- Emergency Address -->
        <div>
          <label for="editProfileAddress" class="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-2xs text-left">
            Emergency Residence Address
          </label>
          <input 
            id="editProfileAddress" 
            name="emergencyAddress" 
            type="text" 
            value="${profile.emergencyAddress || 'House 14, Sector 4, Near Pine Mount, Shillong'}" 
            class="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline/30 text-on-surface font-body-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-left"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-space-sm pt-space-md border-t border-surface-container">
          <button type="button" id="cancelEditProfileBtn" class="px-space-lg py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container font-label-md text-label-md cursor-pointer transition-colors">
            Cancel
          </button>
          <button type="submit" class="px-space-xl py-space-sm rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-bold shadow-sm transition-all cursor-pointer">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
  `;
}

export function attachEditProfileModalEvents() {
  const backdrop = document.getElementById('editProfileModalBackdrop');
  const closeBtn = document.getElementById('closeEditProfileBtn');
  const cancelBtn = document.getElementById('cancelEditProfileBtn');
  const form = document.getElementById('editProfileForm');

  function close() {
    store.setEditProfileModalOpen(false);
  }

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (cancelBtn) cancelBtn.addEventListener('click', close);
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('editProfileName')?.value.trim();
      const safeZone = document.getElementById('editProfileSafeZone')?.value.trim();
      const emergencyAddress = document.getElementById('editProfileAddress')?.value.trim();

      if (!name) {
        showToast('Please enter a valid name', 'error');
        return;
      }

      store.updatePatientProfile({
        name,
        safeZone,
        emergencyAddress
      });

      showToast('Profile updated successfully', 'check_circle');
      close();
    });
  }
}
