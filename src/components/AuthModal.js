import { store } from '../state/store.js';
import { authService } from '../services/authService.js';
import { showToast } from './Toast.js';

export function renderAuthModal() {
  const state = store.getState();
  if (!state.authModalOpen) return '';

  return `
  <div class="fixed inset-0 z-50 flex items-center justify-center p-space-md modal-backdrop">
    <div class="relative w-full max-w-md rounded-3xl bg-surface-container-lowest p-space-xl shadow-2xl border border-surface-container">
      <div class="text-center mb-space-lg">
        <h3 class="font-headline-md text-headline-md text-on-surface font-bold">Switch Active Profile</h3>
        <p class="font-body-md text-body-md text-on-surface-variant mt-1">Select your authenticated profile to continue</p>
      </div>

      <div class="space-y-space-md mb-space-xl">
        <!-- Patient Profile Choice -->
        <button class="auth-select-profile w-full p-space-md rounded-2xl bg-surface-container hover:bg-surface-container-high transition-all flex items-center gap-space-md text-left cursor-pointer border border-surface-container" data-mode="patient">
          <img class="w-14 h-14 rounded-full object-cover shadow-sm ring-2 ring-primary" src="${state.users[0].avatar}" alt="Asha Devi">
          <div class="flex flex-col flex-1">
            <span class="font-headline-sm text-headline-sm text-on-surface font-bold">Asha Devi</span>
            <span class="font-caption text-caption text-primary font-semibold">Elder Member • Patient Mode</span>
          </div>
          <span class="material-symbols-outlined text-[24px] text-primary">arrow_forward</span>
        </button>

        <!-- Caregiver Profile Choice with Security Verification -->
        <div class="rounded-2xl bg-surface-container p-space-md border border-surface-container">
          <div class="flex items-center gap-space-md mb-space-sm">
            <img class="w-14 h-14 rounded-full object-cover shadow-sm ring-2 ring-secondary" src="${state.users[1].avatar}" alt="Meera">
            <div class="flex flex-col flex-1">
              <span class="font-headline-sm text-headline-sm text-on-surface font-bold">Meera</span>
              <span class="font-caption text-caption text-secondary font-semibold">Primary Caregiver • Care Portal</span>
            </div>
            <span class="material-symbols-outlined text-[20px] text-secondary">lock</span>
          </div>
          <div class="flex gap-space-xs items-center">
            <input id="caregiverPinInput" type="password" maxlength="12" placeholder="Caregiver PIN (4321)" value="4321" class="w-full h-11 px-space-md rounded-xl bg-surface-container-lowest border border-outline/20 text-on-surface font-body-md text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-secondary/40" />
            <button id="submitCaregiverAuthBtn" class="min-h-[44px] px-space-md rounded-xl bg-secondary text-on-secondary font-label-md text-label-md shrink-0 cursor-pointer hover:bg-secondary/90 transition-all flex items-center gap-1">
              <span>Unlock</span>
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
          <span class="text-caption font-caption text-on-surface-variant block mt-1.5 text-center">Protected route: Isolates patient telemetry &amp; care logs</span>
        </div>
      </div>

      <div class="text-center">
        <button id="closeAuthModalBtn" class="px-space-lg py-space-xs rounded-xl text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  </div>
  `;
}

export function attachAuthModalEvents() {
  const closeBtn = document.getElementById('closeAuthModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      store.setAuthModalOpen(false);
    });
  }

  const patientBtn = document.querySelector('.auth-select-profile[data-mode="patient"]');
  if (patientBtn) {
    patientBtn.addEventListener('click', () => {
      authService.login('asha@mindmitra.in', 'Asha1234!');
      store.setAuthModalOpen(false);
      showToast('Switched to Asha Devi (Patient Mode)', 'elderly');
      window.location.hash = '#/patient-home';
    });
  }

  const caregiverAuthBtn = document.getElementById('submitCaregiverAuthBtn');
  const caregiverPinInput = document.getElementById('caregiverPinInput');
  if (caregiverAuthBtn && caregiverPinInput) {
    caregiverAuthBtn.addEventListener('click', () => {
      const enteredPin = caregiverPinInput.value.trim();
      if (enteredPin === '4321' || enteredPin === 'Meera4321!') {
        authService.login('meera@mindmitra.in', 'Meera4321!');
        store.setAuthModalOpen(false);
        showToast('Authorized: Switched to Caregiver Portal (Meera)', 'verified_user');
        window.location.hash = '#/caregiver-dashboard';
      } else {
        showToast('Invalid Caregiver PIN or password. Hint: 4321', 'error');
      }
    });
  }
}
