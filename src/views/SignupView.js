// MindMitra Authentication - Signup View
// 100% Faithful to Stitch Export & Elder-Centric Design Tokens
import { authService } from '../services/authService.js';
import { showToast } from '../components/Toast.js';

export function renderSignupView() {
  return `
  <main class="w-full min-h-screen bg-surface flex items-center justify-center py-space-xl px-space-md">
    <div class="w-full max-w-xl">
      <!-- Brand Logo & Header -->
      <div class="text-center mb-space-xl">
        <div class="inline-flex items-center justify-center mb-space-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" width="160" height="40" fill="none">
            <g transform="translate(4, 4)">
              <circle cx="16" cy="16" r="15" fill="#FAF7F2" stroke="#E6DFD5" stroke-width="1"/>
              <path d="M16 6C12 11 11 16 16 26C21 16 20 11 16 6Z" fill="#9f3c16" opacity="0.95"/>
              <path d="M6 16C11 12 16 11 26 16C16 21 11 20 6 16Z" fill="#79526c" opacity="0.85"/>
              <circle cx="16" cy="16" r="3.5" fill="#FAF7F2"/>
              <circle cx="16" cy="16" r="2" fill="#D9822B"/>
            </g>
            <text x="44" y="24" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="20" font-weight="700" fill="#1f1b18" letter-spacing="-0.3">Mind<tspan fill="#9f3c16">Mitra</tspan></text>
            <text x="45" y="33" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8.5" font-weight="600" fill="#57423b" letter-spacing="0.8">MEMORY THAT MATTERS</text>
          </svg>
        </div>
        <h1 class="font-headline-lg text-headline-lg text-on-surface font-bold">Join MindMitra</h1>
        <p class="font-body-lg text-body-lg text-on-surface-variant mt-1">Create your personalized companion or caregiver account</p>
      </div>

      <!-- Main Signup Card -->
      <div class="bg-surface-container-lowest rounded-3xl p-space-xl md:p-space-2xl shadow-xl border border-surface-container">
        <!-- Error Banner (Hidden by default) -->
        <div id="signupErrorBanner" class="hidden mb-space-lg p-space-md rounded-2xl bg-error-container text-on-error-container border border-error/20 flex items-start gap-space-sm" role="alert">
          <span class="material-symbols-outlined text-[24px] text-error shrink-0 material-symbols-fill">error</span>
          <div class="flex-1 text-left">
            <p id="signupErrorMessage" class="font-body-md text-body-md font-medium"></p>
          </div>
        </div>

        <form id="signupForm" class="space-y-space-lg" novalidate>
          <!-- Role Selection (Elderly-Friendly Visual Selector) -->
          <div>
            <label class="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-xs text-left">
              Select Your Role
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-sm" id="roleSelectorGroup">
              <!-- Patient Option -->
              <label class="role-card relative flex flex-col p-space-md rounded-2xl border-2 border-primary bg-primary-container/20 cursor-pointer transition-all text-left group" data-role="patient">
                <input type="radio" name="accountRole" value="patient" checked class="sr-only" />
                <div class="flex items-center justify-between mb-space-2xs">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span class="material-symbols-outlined text-[24px]">elderly</span>
                  </div>
                  <span class="role-radio-indicator w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                    <span class="w-2 h-2 rounded-full bg-surface"></span>
                  </span>
                </div>
                <span class="font-headline-sm text-headline-sm font-bold text-on-surface">Patient</span>
                <span class="font-caption text-caption text-on-surface-variant mt-0.5">Elder member using companion for memories &amp; routines</span>
              </label>

              <!-- Caregiver Option -->
              <label class="role-card relative flex flex-col p-space-md rounded-2xl border-2 border-outline/30 bg-surface-container-low cursor-pointer transition-all text-left group" data-role="caregiver">
                <input type="radio" name="accountRole" value="caregiver" class="sr-only" />
                <div class="flex items-center justify-between mb-space-2xs">
                  <div class="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                    <span class="material-symbols-outlined text-[24px]">supervised_user_circle</span>
                  </div>
                  <span class="role-radio-indicator w-5 h-5 rounded-full border-2 border-outline/40 flex items-center justify-center">
                    <span class="w-2 h-2 rounded-full bg-transparent"></span>
                  </span>
                </div>
                <span class="font-headline-sm text-headline-sm font-bold text-on-surface">Caregiver</span>
                <span class="font-caption text-caption text-on-surface-variant mt-0.5">Family partner managing routines &amp; telemetry</span>
              </label>

              <!-- Doctor Option -->
              <label class="role-card relative flex flex-col p-space-md rounded-2xl border-2 border-outline/30 bg-surface-container-low cursor-pointer transition-all text-left group" data-role="doctor">
                <input type="radio" name="accountRole" value="doctor" class="sr-only" />
                <div class="flex items-center justify-between mb-space-2xs">
                  <div class="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform">
                    <span class="material-symbols-outlined text-[24px]">medical_services</span>
                  </div>
                  <span class="role-radio-indicator w-5 h-5 rounded-full border-2 border-outline/40 flex items-center justify-center">
                    <span class="w-2 h-2 rounded-full bg-transparent"></span>
                  </span>
                </div>
                <span class="font-headline-sm text-headline-sm font-bold text-on-surface">Doctor</span>
                <span class="font-caption text-caption text-on-surface-variant mt-0.5">Clinician reviewing shared care reports &amp; rhythms</span>
              </label>
            </div>
          </div>

          <!-- Doctor Specific Fields (Visible only when Doctor role is selected) -->
          <div id="doctorExtraFields" class="hidden space-y-space-md p-space-md rounded-2xl bg-surface-container-low border border-outline/20 text-left">
            <div class="flex items-center gap-2 text-tertiary font-label-md text-label-md font-semibold mb-1">
              <span class="material-symbols-outlined text-[20px]">badge</span>
              <span>Professional Practice Information</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              <div>
                <label for="signupSpecialization" class="block font-label-md text-label-md text-on-surface font-medium mb-1">Medical Specialization</label>
                <input id="signupSpecialization" type="text" placeholder="e.g. Neurology / Geriatrics" class="w-full h-12 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label for="signupHospital" class="block font-label-md text-label-md text-on-surface font-medium mb-1">Hospital / Clinic</label>
                <input id="signupHospital" type="text" placeholder="e.g. Shillong Medical Centre" class="w-full h-12 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
              <div>
                <label for="signupCity" class="block font-label-md text-label-md text-on-surface font-medium mb-1">City / Region</label>
                <input id="signupCity" type="text" placeholder="e.g. Shillong, Meghalaya" class="w-full h-12 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label for="signupPhone" class="block font-label-md text-label-md text-on-surface font-medium mb-1">Contact Phone</label>
                <input id="signupPhone" type="tel" placeholder="e.g. +91 98320 12345" class="w-full h-12 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label for="signupLicense" class="block font-label-md text-label-md text-on-surface font-medium mb-1">Registration / License ID</label>
                <input id="signupLicense" type="text" placeholder="e.g. NMC-2018-847291" class="w-full h-12 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div class="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container text-on-surface-variant text-caption font-caption">
              <span class="material-symbols-outlined text-[18px] text-outline">info</span>
              <span>Verification status: <strong>Pending review</strong>. Access to patient records strictly requires explicit patient/caregiver authorization.</span>
            </div>
          </div>

          <!-- Full Name -->
          <div>
            <label for="signupName" class="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-2xs text-left">
              Full Name
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">person</span>
              <input 
                id="signupName" 
                name="name" 
                type="text" 
                autocomplete="name" 
                placeholder="e.g. Ramesh Chandra" 
                required 
                class="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface-container-low border border-outline/30 text-on-surface font-body-lg placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-left"
              />
            </div>
          </div>

          <!-- Email Address -->
          <div>
            <label for="signupEmail" class="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-2xs text-left">
              Email Address
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">mail</span>
              <input 
                id="signupEmail" 
                name="email" 
                type="email" 
                autocomplete="email" 
                placeholder="e.g. ramesh@example.com" 
                required 
                class="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface-container-low border border-outline/30 text-on-surface font-body-lg placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-left"
              />
            </div>
          </div>

          <!-- Password & Confirm Password Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label for="signupPassword" class="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-2xs text-left">
                Password
              </label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">lock</span>
                <input 
                  id="signupPassword" 
                  name="password" 
                  type="password" 
                  autocomplete="new-password" 
                  placeholder="At least 6 chars" 
                  required 
                  class="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface-container-low border border-outline/30 text-on-surface font-body-lg placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-left"
                />
              </div>
            </div>

            <div>
              <label for="signupConfirmPassword" class="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-2xs text-left">
                Confirm Password
              </label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">lock_reset</span>
                <input 
                  id="signupConfirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  autocomplete="new-password" 
                  placeholder="Re-type password" 
                  required 
                  class="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface-container-low border border-outline/30 text-on-surface font-body-lg placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-left"
                />
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            id="signupSubmitBtn" 
            class="w-full h-14 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm font-bold shadow-md hover:bg-primary/95 active:scale-[0.99] transition-all flex items-center justify-center gap-space-sm cursor-pointer mt-space-md"
          >
            <span>Create Account</span>
            <span class="material-symbols-outlined text-[22px]">arrow_forward</span>
          </button>
        </form>

        <!-- Sign In Link -->
        <div class="mt-space-xl pt-space-lg border-t border-surface-container text-center">
          <p class="font-body-md text-body-md text-on-surface-variant">
            Already have an account?
            <a href="#/login" class="font-semibold text-primary hover:underline ml-1">Sign in here</a>
          </p>
        </div>
      </div>
    </div>
  </main>
  `;
}

export function attachSignupEvents() {
  const form = document.getElementById('signupForm');
  const nameInput = document.getElementById('signupName');
  const emailInput = document.getElementById('signupEmail');
  const passwordInput = document.getElementById('signupPassword');
  const confirmPasswordInput = document.getElementById('signupConfirmPassword');
  const errorBanner = document.getElementById('signupErrorBanner');
  const errorMessage = document.getElementById('signupErrorMessage');
  const roleCards = document.querySelectorAll('.role-card');

  const doctorExtraFields = document.getElementById('doctorExtraFields');
  const specializationInput = document.getElementById('signupSpecialization');
  const hospitalInput = document.getElementById('signupHospital');
  const cityInput = document.getElementById('signupCity');
  const phoneInput = document.getElementById('signupPhone');
  const licenseInput = document.getElementById('signupLicense');

  let selectedRole = 'patient';

  function updateDoctorFieldsVisibility() {
    if (doctorExtraFields) {
      if (selectedRole === 'doctor') {
        doctorExtraFields.classList.remove('hidden');
      } else {
        doctorExtraFields.classList.add('hidden');
      }
    }
  }

  function showError(msg) {
    if (errorBanner && errorMessage) {
      errorMessage.textContent = msg;
      errorBanner.classList.remove('hidden');
    }
  }

  function hideError() {
    if (errorBanner) {
      errorBanner.classList.add('hidden');
    }
  }

  // Interactive role card selector with immediate visual feedback
  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      const role = card.getAttribute('data-role');
      if (!role) return;
      selectedRole = role;
      updateDoctorFieldsVisibility();

      roleCards.forEach(c => {
        const isSelected = c.getAttribute('data-role') === selectedRole;
        const radio = c.querySelector('input[type="radio"]');
        const indicator = c.querySelector('.role-radio-indicator');
        const dot = indicator?.querySelector('span');

        if (radio) radio.checked = isSelected;

        if (isSelected) {
          c.classList.remove('border-outline/30', 'bg-surface-container-low');
          c.classList.add('border-primary', 'bg-primary-container/20');
          if (indicator) {
            indicator.classList.add('border-primary', 'bg-primary');
            indicator.classList.remove('border-outline/40');
          }
          if (dot) {
            dot.classList.add('bg-surface');
            dot.classList.remove('bg-transparent');
          }
        } else {
          c.classList.remove('border-primary', 'bg-primary-container/20');
          c.classList.add('border-outline/30', 'bg-surface-container-low');
          if (indicator) {
            indicator.classList.remove('border-primary', 'bg-primary');
            indicator.classList.add('border-outline/40');
          }
          if (dot) {
            dot.classList.remove('bg-surface');
            dot.classList.add('bg-transparent');
          }
        }
      });
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      hideError();

      const name = nameInput.value;
      const email = emailInput.value;
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      const signupData = {
        name,
        email,
        password,
        confirmPassword,
        role: selectedRole
      };

      if (selectedRole === 'doctor') {
        signupData.specialization = specializationInput?.value?.trim() || '';
        signupData.hospital = hospitalInput?.value?.trim() || '';
        signupData.city = cityInput?.value?.trim() || '';
        signupData.phone = phoneInput?.value?.trim() || '';
        signupData.licenseId = licenseInput?.value?.trim() || '';
      }

      const result = authService.signup(signupData);

      if (!result.success) {
        showError(result.error);
        return;
      }

      // Successful registration
      showToast(`Account created! Welcome, ${result.user.name}`, 'celebration');

      // Clear password inputs
      passwordInput.value = '';
      confirmPasswordInput.value = '';

      // Direct to respective home/dashboard
      if (result.user.role === 'caregiver') {
        window.location.hash = '#/caregiver-dashboard';
      } else if (result.user.role === 'doctor') {
        window.location.hash = '#/doctor-portal';
      } else {
        window.location.hash = '#/patient-home';
      }
    });
  }
}
