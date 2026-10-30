// MindMitra Authentication - Login View
// 100% Faithful to Stitch Export & Elder-Centric Design Tokens
import { authService, DEMO_ACCOUNTS } from '../services/authService.js';
import { store } from '../state/store.js';
import { showToast } from '../components/Toast.js';

export function renderLoginView() {
  return `
  <main class="w-full min-h-screen bg-surface flex items-center justify-center py-space-xl px-space-md">
    <div class="w-full max-w-lg">
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
        <h1 class="font-headline-lg text-headline-lg text-on-surface font-bold">Welcome Back</h1>
        <p class="font-body-lg text-body-lg text-on-surface-variant mt-1">Sign in to your companion or care portal</p>
      </div>

      <!-- Main Login Card -->
      <div class="bg-surface-container-lowest rounded-3xl p-space-xl md:p-space-2xl shadow-xl border border-surface-container">
        <!-- Error Banner (Hidden by default) -->
        <div id="loginErrorBanner" class="hidden mb-space-lg p-space-md rounded-2xl bg-error-container text-on-error-container border border-error/20 flex items-start gap-space-sm" role="alert">
          <span class="material-symbols-outlined text-[24px] text-error shrink-0 material-symbols-fill">error</span>
          <div class="flex-1 text-left">
            <p id="loginErrorMessage" class="font-body-md text-body-md font-medium"></p>
          </div>
        </div>

        <form id="loginForm" class="space-y-space-lg" novalidate>
          <!-- Email / Identifier -->
          <div>
            <label for="loginIdentifier" class="block font-label-lg text-label-lg text-on-surface font-semibold mb-space-2xs text-left">
              Email or Login Name
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">mail</span>
              <input 
                id="loginIdentifier" 
                name="identifier" 
                type="text" 
                autocomplete="username" 
                placeholder="e.g. asha@mindmitra.in" 
                required 
                class="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface-container-low border border-outline/30 text-on-surface font-body-lg placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-left"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <div class="flex items-center justify-between mb-space-2xs">
              <label for="loginPassword" class="font-label-lg text-label-lg text-on-surface font-semibold text-left">
                Password
              </label>
              <button type="button" id="togglePasswordVisibility" class="font-caption text-caption text-primary hover:underline font-semibold cursor-pointer">
                Show
              </button>
            </div>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">lock</span>
              <input 
                id="loginPassword" 
                name="password" 
                type="password" 
                autocomplete="current-password" 
                placeholder="Enter your password" 
                required 
                class="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface-container-low border border-outline/30 text-on-surface font-body-lg placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-left"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            id="loginSubmitBtn" 
            class="w-full h-14 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm font-bold shadow-md hover:bg-primary/95 active:scale-[0.99] transition-all flex items-center justify-center gap-space-sm cursor-pointer"
          >
            <span>Sign In</span>
            <span class="material-symbols-outlined text-[22px]">arrow_forward</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-space-xl">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-surface-container-high"></div>
          </div>
          <div class="relative flex justify-center text-caption uppercase">
            <span class="bg-surface-container-lowest px-space-md text-on-surface-variant font-semibold tracking-wider">Quick Demo Access</span>
          </div>
        </div>

        <!-- Demo Accounts Box (Segregated for Development / Testing) -->
        <div class="space-y-space-sm">
          <button 
            type="button" 
            id="demoPatientBtn" 
            class="w-full p-space-sm rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high transition-all flex items-center gap-space-md text-left cursor-pointer group"
          >
            <img class="w-11 h-11 rounded-full object-cover ring-2 ring-primary shrink-0" src="${DEMO_ACCOUNTS[0].avatar}" alt="Asha Devi">
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-label-lg text-label-lg font-bold text-on-surface">Asha Devi (Patient)</span>
                <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-semibold">1-Tap Fill</span>
              </div>
              <p class="font-caption text-caption text-on-surface-variant truncate">asha@mindmitra.in • Patient Home</p>
            </div>
          </button>

          <button 
            type="button" 
            id="demoCaregiverBtn" 
            class="w-full p-space-sm rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high transition-all flex items-center gap-space-md text-left cursor-pointer group"
          >
            <img class="w-11 h-11 rounded-full object-cover ring-2 ring-secondary shrink-0" src="${DEMO_ACCOUNTS[1].avatar}" alt="Meera">
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-label-lg text-label-lg font-bold text-on-surface">Meera (Caregiver)</span>
                <span class="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-caption text-caption font-semibold">1-Tap Fill</span>
              </div>
              <p class="font-caption text-caption text-on-surface-variant truncate">meera@mindmitra.in • Caregiver Portal</p>
            </div>
          </button>

          ${DEMO_ACCOUNTS[2] ? `
          <button 
            type="button" 
            id="demoDoctorBtn" 
            class="w-full p-space-sm rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high transition-all flex items-center gap-space-md text-left cursor-pointer group"
          >
            <img class="w-11 h-11 rounded-full object-cover ring-2 ring-primary shrink-0" src="${DEMO_ACCOUNTS[2].avatar}" alt="Dr. Ananya Sharma">
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-label-lg text-label-lg font-bold text-on-surface">Dr. Ananya Sharma (Doctor)</span>
                <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-semibold">1-Tap Fill</span>
              </div>
              <p class="font-caption text-caption text-on-surface-variant truncate">ananya@mindmitra.in • Doctor Portal</p>
            </div>
          </button>
          ` : ''}
        </div>

        <!-- Create Account Link -->
        <div class="mt-space-xl pt-space-lg border-t border-surface-container text-center">
          <p class="font-body-md text-body-md text-on-surface-variant">
            Don't have an account yet?
            <a href="#/signup" class="font-semibold text-primary hover:underline ml-1">Create an Account</a>
          </p>
        </div>
      </div>
    </div>
  </main>
  `;
}

export function attachLoginEvents() {
  const form = document.getElementById('loginForm');
  const identifierInput = document.getElementById('loginIdentifier');
  const passwordInput = document.getElementById('loginPassword');
  const errorBanner = document.getElementById('loginErrorBanner');
  const errorMessage = document.getElementById('loginErrorMessage');
  const togglePassBtn = document.getElementById('togglePasswordVisibility');
  const demoPatientBtn = document.getElementById('demoPatientBtn');
  const demoCaregiverBtn = document.getElementById('demoCaregiverBtn');
  const demoDoctorBtn = document.getElementById('demoDoctorBtn');

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

  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = passwordInput.type === 'password';
      passwordInput.type = isPass ? 'text' : 'password';
      togglePassBtn.textContent = isPass ? 'Hide' : 'Show';
    });
  }

  if (demoPatientBtn && identifierInput && passwordInput) {
    demoPatientBtn.addEventListener('click', () => {
      identifierInput.value = DEMO_ACCOUNTS[0].email;
      passwordInput.value = DEMO_ACCOUNTS[0].password;
      hideError();
      showToast('Demo credentials filled for Asha Devi (Patient)', 'elderly');
    });
  }

  if (demoCaregiverBtn && identifierInput && passwordInput) {
    demoCaregiverBtn.addEventListener('click', () => {
      identifierInput.value = DEMO_ACCOUNTS[1].email;
      passwordInput.value = DEMO_ACCOUNTS[1].password;
      hideError();
      showToast('Demo credentials filled for Meera (Caregiver)', 'verified_user');
    });
  }

  if (demoDoctorBtn && identifierInput && passwordInput && DEMO_ACCOUNTS[2]) {
    demoDoctorBtn.addEventListener('click', () => {
      identifierInput.value = DEMO_ACCOUNTS[2].email;
      passwordInput.value = DEMO_ACCOUNTS[2].password;
      hideError();
      showToast('Demo credentials filled for Dr. Ananya Sharma (Doctor)', 'medical_services');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      hideError();

      const identifier = identifierInput.value;
      const password = passwordInput.value;

      const result = authService.login(identifier, password);
      if (!result.success) {
        showError(result.error);
        return;
      }

      // Successful login
      showToast(`Welcome back, ${result.user.name}!`, 'check_circle');

      // Clear password field from memory
      passwordInput.value = '';

      // Direct to corresponding role dashboard
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
