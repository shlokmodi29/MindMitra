// Emergency SOS View - 100% Faithful to Stitch Export with Full Confirmation Safeguards,
// Dynamic Caregiver Contacts, Realistic Call States, and Honest Location Sharing (Part 10)
import { store } from '../state/store.js';
import { emergencyService, CALL_STATES, LOCATION_STATES } from '../services/emergencyService.js';
import { voiceService } from '../services/voiceService.js';
import { speechService } from '../services/speechService.js';
import { i18nService } from '../services/i18nService.js';
import { showToast } from '../components/Toast.js';

let activeFlowState = 'state1'; // 'state1' (confirm), 'state2' (initiated), 'state3' (unavailable/fallback), 'state4' (voice sos)
let isCaregiverViewTab = false; // toggle for Caregiver Management panel
let contactModalMode = null; // 'add' or 'edit'
let contactModalTargetId = null;

export function renderEmergencySosView() {
  const state = store.getState();
  const patientId = store.getCurrentPatientId();
  const address = state.profile.emergencyAddress || "House 14, Sector 4, Near Pine Mount, Shillong";
  const contacts = store.getEmergencyContactsForPatient(patientId);
  const enabledContacts = contacts.filter(c => c.enabled !== false && c.phone !== '112');
  const primaryContact = enabledContacts.find(c => c.priority === 'primary' || c.roleLabel === 'Primary Caregiver') || enabledContacts[0];
  const secondaryContact = enabledContacts.find(c => c.id !== primaryContact?.id) || enabledContacts[1];
  const auditLogs = store.getEmergencyEventsForPatient(patientId);
  const isCaregiver = store.isCaregiver();
  const locationStatus = emergencyService.locationState;

  const locationBadge = locationStatus === LOCATION_STATES.AVAILABLE 
    ? 'GPS Active • Live Position'
    : locationStatus === LOCATION_STATES.DENIED
      ? 'Location Turned Off'
      : 'Location Not Enabled';

  return `
  <main class="w-full pt-20 bg-surface min-h-[calc(100vh-140px)]">
    <div class="max-w-7xl mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl">
      <div class="flex flex-col w-full">
        <!-- Subdued Back Action & Location Status Pill -->
        <div class="flex flex-wrap items-center justify-between gap-space-sm mb-space-lg">
          <a href="#/patient-home" class="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all text-label-lg font-label-lg group shadow-sm cursor-pointer">
            <span class="material-symbols-outlined text-[22px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span>Return to Home</span>
          </a>
          
          <div class="flex items-center gap-space-xs flex-wrap">
            <div class="flex items-center gap-space-xs px-space-md py-space-xs rounded-full ${
              locationStatus === LOCATION_STATES.AVAILABLE 
                ? 'bg-tertiary-fixed/30 text-tertiary' 
                : 'bg-surface-container-high text-on-surface-variant'
            }">
              <span class="w-2.5 h-2.5 rounded-full ${
                locationStatus === LOCATION_STATES.AVAILABLE ? 'bg-tertiary animate-pulse' : 'bg-outline'
              }"></span>
              <span class="font-label-md text-label-md" id="headerLocationStatus">${locationBadge}</span>
            </div>

            <!-- Caregiver Safety Switcher Toggle -->
            ${isCaregiver ? `
              <button id="toggleCaregiverSosTabBtn" class="flex items-center gap-space-2xs px-space-md py-space-xs rounded-full ${
                isCaregiverViewTab 
                  ? 'bg-secondary text-on-secondary shadow-sm' 
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              } font-label-md text-label-md transition-all cursor-pointer">
                <span class="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                <span>${isCaregiverViewTab ? 'View Patient Flow' : 'Caregiver Safety Panel'}</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Reassuring High-Visibility Calm Emergency Banner -->
        <section class="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-md p-space-xl md:p-space-2xl mb-space-xl border border-surface-container">
          <div class="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/5 pointer-events-none blur-3xl"></div>
          <div class="absolute -left-12 -bottom-12 w-56 h-56 rounded-full bg-secondary/5 pointer-events-none blur-2xl"></div>

          <div class="relative z-10 max-w-3xl">
            <div class="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-error-container text-on-error-container font-label-md text-label-md mb-space-sm">
              <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">health_and_safety</span>
              <span>${i18nService.t('emergency.title')} • 24/7 Immediate Assistance</span>
            </div>
            <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs font-bold">
              ${i18nService.t('emergency.immediateHelp')}
            </h1>
            <p class="font-body-xl text-body-xl text-on-surface-variant leading-relaxed">
              ${i18nService.t('emergency.reassuranceBanner')}
            </p>

            <!-- Reassurance Micro-banner -->
            <div class="mt-space-md flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-low text-on-surface-variant">
              <span class="material-symbols-outlined text-tertiary text-[24px]">favorite</span>
              <span class="font-body-md text-body-md">
                ${i18nService.t('emergency.gentleBreath', { name: state.profile?.name ? state.profile.name.split(' ')[0] : 'Asha' })}
              </span>
            </div>
          </div>
        </section>

        ${isCaregiverViewTab ? renderCaregiverManagementSection(contacts, auditLogs) : renderPatientEmergencyFlow(address, primaryContact, secondaryContact, locationStatus)}

        <!-- PRIVACY, LOCATION & LEGAL SAFETY TRANSPARENCY SECTION -->
        <section class="rounded-xl bg-surface-container-low p-space-lg md:p-space-xl border border-surface-container mt-space-2xl">
          <div class="flex items-start gap-space-md">
            <div class="w-12 h-12 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[26px]">policy</span>
            </div>
            <div class="flex-1">
              <h4 class="font-headline-sm text-headline-sm text-on-surface mb-space-2xs font-bold">
                Elder Dignity, Privacy &amp; Non-Diagnostic Transparency
              </h4>
              <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-sm">
                <strong>MindMitra is a supportive reminiscence and cognitive companion</strong>, not an autonomous medical monitoring or dispatch software. 112 emergency calls open directly in your phone's native telephone carrier screen.
              </p>
              <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md">
                <strong>Honest Location Policy:</strong> Your GPS location is accessible only within MindMitra when permitted, and shared strictly peer-to-peer with your designated family circle members. <em>Your location has NOT been transmitted to police, ambulance, or government dispatchers.</em>
              </p>
              <div class="flex flex-wrap items-center gap-space-md font-label-md text-label-md text-secondary">
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[18px]">verified</span> Encrypted Care Link
                </span>
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[18px]">gavel</span> Telecom Regulation 112 Conforming
                </span>
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[18px]">family_star</span> Heirloom Circle Safeguard
                </span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>

    <!-- CALL 112 EXPLICIT CONFIRMATION MODAL -->
    <div id="confirm112Modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-space-md bg-scrim/60 backdrop-blur-sm">
      <div class="relative w-full max-w-lg rounded-2xl bg-surface-container-lowest p-space-xl md:p-space-2xl shadow-2xl border border-surface-container animate-gentle-pulse">
        <div class="flex items-center gap-space-md mb-space-md">
          <div class="w-14 h-14 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[32px]">emergency</span>
          </div>
          <div>
            <span class="font-caption text-caption uppercase tracking-wider text-error font-semibold">${i18nService.t('emergency.confirmationRequired') || 'Confirmation Required'}</span>
            <h3 class="font-headline-md text-headline-md text-on-surface font-bold">${i18nService.t('emergency.confirmTitle') || 'Call 112?'}</h3>
          </div>
        </div>
        
        <p class="font-body-lg text-body-lg text-on-surface leading-relaxed mb-space-md">
          ${i18nService.t('emergency.confirmDesc') || "This will open your phone's emergency call function to connect with <strong>India's National Emergency Helpline (112)</strong> for Police, Ambulance, or Fire."}
        </p>

        <div class="p-space-md rounded-xl bg-surface-container-low mb-space-xl border border-surface-container">
          <div class="flex items-start gap-space-xs text-on-surface-variant">
            <span class="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">home</span>
            <div class="text-left">
              <span class="font-caption text-caption font-semibold uppercase text-outline">${i18nService.t('emergency.sayAddress') || 'Say this address when connected:'}</span>
              <p class="font-label-lg text-label-lg font-bold text-on-surface">${address}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-end gap-space-sm">
          <button id="cancel112Btn" class="w-full sm:w-auto px-space-xl min-h-[52px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-colors cursor-pointer" type="button">
            ${i18nService.t('emergency.cancel') || 'Cancel'}
          </button>
          <button id="confirmCall112Btn" class="w-full sm:flex-1 min-h-[52px] flex items-center justify-center gap-space-xs rounded-xl bg-error hover:bg-error/90 text-on-error font-headline-sm text-headline-sm shadow-md transition-all active:scale-95 cursor-pointer" type="button">
            <span class="material-symbols-outlined text-[24px]">call</span>
            <span>${i18nService.t('emergency.call112') || 'Call 112'}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- CAREGIVER CONTACT CALL CONFIRMATION MODAL -->
    <div id="confirmCaregiverModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-space-md bg-scrim/60 backdrop-blur-sm">
      <div class="relative w-full max-w-lg rounded-2xl bg-surface-container-lowest p-space-xl shadow-2xl border border-surface-container">
        <div class="flex items-center gap-space-md mb-space-md">
          <div class="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[28px]">call</span>
          </div>
          <div>
            <h3 class="font-headline-md text-headline-md text-on-surface font-bold" id="cgConfirmNameTitle">Call Caregiver?</h3>
            <p class="font-body-md text-body-md text-on-surface-variant" id="cgConfirmPhoneDesc"></p>
          </div>
        </div>

        <p class="font-body-lg text-body-lg text-on-surface mb-space-xl leading-relaxed">
          This will open your phone's dialer to place a direct call.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-end gap-space-sm">
          <button id="cancelCgCallBtn" class="w-full sm:w-auto px-space-xl min-h-[48px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-colors cursor-pointer" type="button">
            Cancel
          </button>
          <button id="proceedCgCallBtn" class="w-full sm:flex-1 min-h-[48px] flex items-center justify-center gap-space-xs rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-label-lg text-label-lg shadow-sm transition-all active:scale-95 cursor-pointer" type="button">
            <span class="material-symbols-outlined text-[20px]">call</span>
            <span>Place Call</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ADD / EDIT EMERGENCY CONTACT MODAL (Caregiver Only) -->
    <div id="contactEditModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-space-md bg-scrim/60 backdrop-blur-sm">
      <div class="relative w-full max-w-md rounded-2xl bg-surface-container-lowest p-space-xl shadow-2xl border border-surface-container">
        <div class="flex items-center justify-between mb-space-md">
          <h3 class="font-headline-md text-headline-md text-on-surface font-bold" id="contactModalTitle">Add Emergency Contact</h3>
          <button id="closeContactModalBtn" class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form id="contactForm" class="space-y-space-md">
          <div>
            <label class="block font-label-md text-label-md text-on-surface font-semibold mb-1" for="contactNameInput">Contact Name *</label>
            <input type="text" id="contactNameInput" required placeholder="e.g. Meera" class="w-full min-h-[48px] px-space-md rounded-xl bg-surface-container border border-surface-container-high text-on-surface font-body-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label class="block font-label-md text-label-md text-on-surface font-semibold mb-1" for="contactRelationInput">Relationship *</label>
            <input type="text" id="contactRelationInput" required placeholder="e.g. Daughter, Son, Neighbor" class="w-full min-h-[48px] px-space-md rounded-xl bg-surface-container border border-surface-container-high text-on-surface font-body-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label class="block font-label-md text-label-md text-on-surface font-semibold mb-1" for="contactPhoneInput">Telephone Number *</label>
            <input type="tel" id="contactPhoneInput" required placeholder="+91 98450 21345" class="w-full min-h-[48px] px-space-md rounded-xl bg-surface-container border border-surface-container-high text-on-surface font-body-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <span class="font-caption text-caption text-on-surface-variant">Include country code if mobile</span>
          </div>

          <div>
            <label class="block font-label-md text-label-md text-on-surface font-semibold mb-1" for="contactPrioritySelect">Care Circle Priority</label>
            <select id="contactPrioritySelect" class="w-full min-h-[48px] px-space-md rounded-xl bg-surface-container border border-surface-container-high text-on-surface font-body-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="secondary">Secondary Contact</option>
              <option value="primary">Primary Caregiver (Only 1 allowed)</option>
              <option value="emergency">Emergency Contact</option>
            </select>
          </div>

          <div class="pt-space-sm flex items-center justify-end gap-space-sm">
            <button type="button" id="cancelContactFormBtn" class="px-space-lg min-h-[48px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md cursor-pointer">
              Cancel
            </button>
            <button type="submit" id="saveContactFormBtn" class="px-space-xl min-h-[48px] rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md shadow-sm transition-all cursor-pointer">
              Save Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
  `;
}

// ----------------------------------------------------
// PATIENT EMERGENCY FLOW
// ----------------------------------------------------
function renderPatientEmergencyFlow(address, primaryContact, secondaryContact, locationStatus) {
  const pName = primaryContact?.name || 'Meera';
  const pPhone = primaryContact?.phone || '+91 98450 21345';
  const sName = secondaryContact?.name || 'Ravi';
  const sPhone = secondaryContact?.phone || '+91 99000 78219';

  return `
  <!-- PRIMARY EMERGENCY ACTION: 🚨 CALL 112 -->
  <section class="mb-space-2xl">
    <div class="relative rounded-2xl bg-surface-container-lowest p-space-xl shadow-md overflow-hidden border-2 border-error/20">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-space-xl">
        <div class="flex items-start gap-space-lg max-w-2xl">
          <div class="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-error/10 flex items-center justify-center text-error border border-error/20">
            <span class="material-symbols-outlined text-[36px] sm:text-[44px]" style="font-variation-settings: 'FILL' 1;">emergency</span>
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-space-xs mb-space-2xs">
              <span class="font-caption text-caption px-space-xs py-0.5 rounded bg-error/10 text-error uppercase tracking-wider font-bold">Integrated Emergency</span>
              <span class="font-caption text-caption text-tertiary font-semibold flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-tertiary"></span> Active Dial Ready
              </span>
            </div>
            <h2 class="font-display-mobile sm:font-display text-display-mobile sm:text-display text-on-surface tracking-tight mb-space-2xs font-bold">
              ${i18nService.t('emergency.call112') || 'CALL 112'}
            </h2>
            <p class="font-headline-sm text-headline-sm text-error font-semibold mb-space-2xs">
              ${i18nService.t('emergency.services') || 'Police • Ambulance • Fire & Rescue'}
            </p>
            <p class="font-body-lg text-body-lg text-on-surface-variant leading-normal mb-space-xs">
              ${i18nService.t('emergency.tollFreeDesc') || "India's unified emergency number. Toll-free across all network carriers without requiring SIM balance."}
            </p>
            <p class="font-label-md text-label-md text-outline flex items-center gap-space-2xs">
              <span class="material-symbols-outlined text-[18px]">verified_user</span>
              ${i18nService.t('emergency.confirmationRequired') || 'Requires quick confirmation before dialling — safe against accidental taps.'}
            </p>
          </div>
        </div>

        <div class="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-space-sm items-stretch lg:min-w-[280px]">
          <button id="dial112PrimaryBtn" aria-label="Dial Emergency 112" class="flex items-center justify-center gap-space-sm min-h-[64px] px-space-xl rounded-2xl bg-error hover:bg-error/90 text-on-error font-headline-sm text-headline-sm shadow-md transition-all active:scale-[0.98] group cursor-pointer" type="button">
            <span class="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform" style="font-variation-settings: 'FILL' 1;">phone_in_talk</span>
            <span>${i18nService.t('emergency.call112Now') || 'CALL 112 NOW'}</span>
          </button>
          <span class="text-center font-caption text-caption text-on-surface-variant">${i18nService.t('emergency.tollFreeNote') || 'Toll-Free • Opens Phone Calling Screen'}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- SECONDARY QUICK-DIAL ACTIONS (Configured Caregivers & Location Safe-Share) -->
  <section class="mb-space-3xl">
    <div class="flex items-center justify-between mb-space-md">
      <div>
        <h3 class="font-headline-md text-headline-md text-on-surface font-bold">${i18nService.t('emergency.familyCircleTitle') || 'Configured Family & Care Circle'}</h3>
        <p class="font-body-md text-body-md text-on-surface-variant">${i18nService.t('emergency.familyCircleSubtitle') || 'Instant voice call to your closest trusted relatives.'}</p>
      </div>
      <span class="hidden md:inline-flex font-label-md text-label-md text-secondary font-semibold">${i18nService.t('emergency.alwaysReachable') || 'Always reachable'}</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
      <!-- Caregiver 1: Meera (Primary) -->
      <div class="flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all border border-surface-container">
        <div class="flex items-start gap-space-md mb-space-md">
          <div class="w-16 h-16 rounded-full bg-secondary-fixed/30 flex items-center justify-center text-secondary font-bold text-headline-sm shrink-0 shadow-sm">
            ${pName.charAt(0)}
          </div>
          <div class="min-w-0">
            <span class="font-caption text-caption px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">Primary Caregiver</span>
            <h4 class="font-headline-sm text-headline-sm text-on-surface truncate mt-1 font-bold">${pName} (${primaryContact?.relation || 'Daughter'})</h4>
            <p class="font-label-md text-label-md text-on-surface-variant">${pPhone}</p>
            <p class="font-caption text-caption text-tertiary font-semibold flex items-center gap-1 mt-0.5">
              <span class="w-2 h-2 rounded-full bg-tertiary"></span> ${primaryContact?.badge || 'Home Safe Zone'}
            </p>
          </div>
        </div>
        <div class="pt-space-sm flex gap-space-sm">
          <button class="call-caregiver-btn flex-1 min-h-[56px] flex items-center justify-center gap-space-xs rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-label-lg text-label-lg transition-colors cursor-pointer" data-id="${primaryContact?.id || 'ec-2'}" data-name="${pName}" data-phone="${pPhone}" type="button">
            <span class="material-symbols-outlined text-[24px]">call</span>
            <span>Call ${pName}</span>
          </button>
        </div>
      </div>

      <!-- Caregiver 2: Ravi (Secondary) -->
      <div class="flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all border border-surface-container">
        <div class="flex items-start gap-space-md mb-space-md">
          <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold text-headline-sm shrink-0 shadow-sm">
            ${sName.charAt(0)}
          </div>
          <div class="min-w-0">
            <span class="font-caption text-caption px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-semibold">Secondary Contact</span>
            <h4 class="font-headline-sm text-headline-sm text-on-surface truncate mt-1 font-bold">${sName} (${secondaryContact?.relation || 'Son'})</h4>
            <p class="font-label-md text-label-md text-on-surface-variant">${sPhone}</p>
            <p class="font-caption text-caption text-outline mt-0.5">${secondaryContact?.badge || 'Remote Sync'}</p>
          </div>
        </div>
        <div class="pt-space-sm flex gap-space-sm">
          <button class="call-caregiver-btn flex-1 min-h-[56px] flex items-center justify-center gap-space-xs rounded-xl bg-surface-container-high hover:bg-surface-dim text-on-surface font-label-lg text-label-lg transition-colors cursor-pointer" data-id="${secondaryContact?.id || 'ec-3'}" data-name="${sName}" data-phone="${sPhone}" type="button">
            <span class="material-symbols-outlined text-[24px]">call</span>
            <span>Call ${sName}</span>
          </button>
        </div>
      </div>

      <!-- Safe Location Broadcast Tile -->
      <div class="flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all md:col-span-2 xl:col-span-1 border border-surface-container">
        <div>
          <div class="flex items-center justify-between mb-space-xs">
            <span class="font-caption text-caption px-space-xs py-0.5 rounded-full bg-tertiary-fixed/50 text-on-tertiary-fixed font-semibold">Private Care Circle Link</span>
            <span class="material-symbols-outlined text-tertiary text-[22px]" style="font-variation-settings: 'FILL' 1;">my_location</span>
          </div>
          <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Share My Location</h4>
          <p class="font-body-md text-body-md text-on-surface-variant mt-1">
            Shares GPS status with ${pName} &amp; ${sName}. Never broadcast publicly or transmitted to emergency services.
          </p>
        </div>
        <div class="pt-space-md">
          <button class="w-full min-h-[56px] flex items-center justify-center gap-space-xs rounded-xl bg-tertiary hover:bg-tertiary/90 text-on-tertiary font-label-lg text-label-lg transition-colors cursor-pointer active:scale-95" id="shareLocationBtn" type="button">
            <span class="material-symbols-outlined text-[22px]">share_location</span>
            <span id="shareLocationLabel">Share Location with ${pName}</span>
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- INTERACTIVE FLOW PREVIEWS & WORKBENCH -->
  <section class="mb-space-3xl" id="emergencyWorkbench">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-sm mb-space-lg">
      <div>
        <div class="inline-flex items-center gap-space-xs text-secondary font-label-md text-label-md font-semibold mb-space-2xs">
          <span class="material-symbols-outlined text-[18px]">touch_app</span>
          <span>Interactive Emergency Flow Previews</span>
        </div>
        <h3 class="font-headline-md text-headline-md text-on-surface font-bold">Explore Emergency States &amp; Safety Protocols</h3>
        <p class="font-body-md text-body-md text-on-surface-variant">Tap below to test how MindMitra handles confirmation safeguards, active dialling, fallback routing, and SmritiAI voice help.</p>
      </div>

      <!-- State switcher tab buttons -->
      <div class="flex flex-wrap gap-space-xs bg-surface-container-low p-space-2xs rounded-xl self-start md:self-auto border border-surface-container">
        <button class="sos-tab-btn px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-all cursor-pointer ${activeFlowState === 'state1' ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'}" data-state="state1" type="button">
          1. 112 Confirmation
        </button>
        <button class="sos-tab-btn px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-all cursor-pointer ${activeFlowState === 'state2' ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'}" data-state="state2" type="button">
          2. Active Dialing
        </button>
        <button class="sos-tab-btn px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-all cursor-pointer ${activeFlowState === 'state3' ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'}" data-state="state3" type="button">
          3. Fallback / Failure
        </button>
        <button class="sos-tab-btn px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-all cursor-pointer ${activeFlowState === 'state4' ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'}" data-state="state4" type="button">
          4. SmritiAI Voice SOS
        </button>
      </div>
    </div>

    <!-- State 1: Call 112 Confirmation Dialog Panel -->
    <div class="flow-panel ${activeFlowState === 'state1' ? 'block' : 'hidden'}" id="panel-state1">
      <div class="max-w-2xl mx-auto rounded-xl bg-surface-container-lowest p-space-xl md:p-space-2xl shadow-xl border border-surface-container">
        <div class="flex items-center gap-space-md mb-space-md">
          <div class="w-14 h-14 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[32px]">warning</span>
          </div>
          <div>
            <span class="font-caption text-caption uppercase tracking-wider text-error font-semibold">Confirmation Required</span>
            <h4 class="font-headline-md text-headline-md text-on-surface font-bold">Call 112?</h4>
          </div>
        </div>
        <p class="font-body-xl text-body-xl text-on-surface leading-relaxed mb-space-md">
          This will open your phone's emergency call function. It connects directly to India's National Emergency Response Center (Police, Ambulance, Fire).
        </p>
        <div class="p-space-md rounded-xl bg-surface-container mb-space-xl flex items-center gap-space-sm text-on-surface-variant">
          <span class="material-symbols-outlined text-tertiary text-[24px]">location_on</span>
          <span class="font-body-md text-body-md">Your registered home address (${address}) will be safely displayed for you to read to the operator.</span>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-space-md">
          <button class="flow-action-btn w-full sm:flex-1 min-h-[56px] flex items-center justify-center gap-space-xs rounded-xl bg-error hover:bg-error/90 text-on-error font-label-lg text-label-lg shadow-md transition-colors cursor-pointer" data-target="state2" type="button">
            <span class="material-symbols-outlined text-[24px]">check_circle</span>
            <span>Confirm &amp; Call 112</span>
          </button>
          <button class="flow-action-btn w-full sm:w-auto px-space-xl min-h-[56px] flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-lg text-label-lg transition-colors cursor-pointer" data-target="state1" type="button">
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- State 2: Active Dialing State Panel -->
    <div class="flow-panel ${activeFlowState === 'state2' ? 'block' : 'hidden'}" id="panel-state2">
      <div class="max-w-2xl mx-auto rounded-xl bg-surface-container-lowest p-space-xl md:p-space-2xl shadow-xl text-center border border-surface-container">
        <div class="relative w-24 h-24 mx-auto mb-space-md flex items-center justify-center">
          <span class="absolute inset-0 rounded-full bg-error/20 animate-ping"></span>
          <div class="relative w-20 h-20 rounded-full bg-error text-on-error flex items-center justify-center shadow-md">
            <span class="material-symbols-outlined text-[40px] animate-pulse">call</span>
          </div>
        </div>
        <span class="font-caption text-caption px-space-md py-1 rounded-full bg-error-container text-on-error-container font-semibold tracking-wide">
          CALL INITIATED
        </span>
        <h4 class="font-headline-lg text-headline-lg text-on-surface mt-space-sm mb-space-xs font-bold">
          Calling 112...
        </h4>
        <p class="font-body-xl text-body-xl text-on-surface-variant max-w-md mx-auto mb-space-lg">
          Your phone's calling screen has been opened.
        </p>
        <!-- Address Card for Elder to Read Aloud -->
        <div class="max-w-md mx-auto p-space-md rounded-xl bg-surface-container-low text-left mb-space-xl border border-surface-container">
          <span class="font-caption text-caption text-on-surface-variant uppercase font-semibold">Say this address when operator answers:</span>
          <p class="font-headline-sm text-headline-sm text-primary mt-1 font-bold">“${address}”</p>
        </div>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-space-md max-w-md mx-auto">
          <button class="flow-action-btn w-full min-h-[56px] flex items-center justify-center gap-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-colors cursor-pointer" data-target="state1" type="button">
            <span class="material-symbols-outlined text-[24px]">arrow_back</span>
            <span>Back to Emergency Help</span>
          </button>
          <button class="flow-action-btn w-full min-h-[56px] flex items-center justify-center gap-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-lg text-label-lg transition-colors cursor-pointer" data-target="state3" type="button">
            <span class="material-symbols-outlined text-[22px]">sim_card_alert</span>
            <span>Simulate Failure</span>
          </button>
        </div>
      </div>
    </div>

    <!-- State 3: Fallback / Call Failure Panel -->
    <div class="flow-panel ${activeFlowState === 'state3' ? 'block' : 'hidden'}" id="panel-state3">
      <div class="max-w-2xl mx-auto rounded-xl bg-surface-container-lowest p-space-xl md:p-space-2xl shadow-xl border border-surface-container">
        <div class="flex items-center gap-space-md mb-space-md">
          <div class="w-14 h-14 rounded-full bg-error/15 text-error flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[32px]">phone_disabled</span>
          </div>
          <div>
            <span class="font-caption text-caption uppercase tracking-wider text-error font-semibold">Calling Isn't Available</span>
            <h4 class="font-headline-md text-headline-md text-on-surface font-bold">Calling isn't available on this device.</h4>
          </div>
        </div>
        <p class="font-body-xl text-body-xl text-on-surface-variant mb-space-lg leading-relaxed">
          Your browser or device prevented opening the telephone dialer. Choose one of your configured contacts below:
        </p>
        <div class="space-y-space-sm mb-space-xl">
          <a class="flex items-center justify-between p-space-md rounded-xl bg-error text-on-error font-headline-sm text-headline-sm hover:bg-error/90 transition-colors" href="tel:112">
            <span class="flex items-center gap-space-sm">
              <span class="material-symbols-outlined text-[28px]">phone</span>
              <span>Direct Native Call to 112</span>
            </span>
            <span class="material-symbols-outlined text-[24px]">open_in_new</span>
          </a>
          <button class="call-caregiver-btn w-full flex items-center justify-between p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer" data-name="${pName}" data-phone="${pPhone}" type="button">
            <span class="flex items-center gap-space-sm">
              <span class="material-symbols-outlined text-secondary text-[28px]">call</span>
              <span class="font-label-lg text-label-lg">Call Caregiver ${pName} (${pPhone})</span>
            </span>
            <span class="font-caption text-caption text-secondary font-semibold">Primary</span>
          </button>
          <button class="call-caregiver-btn w-full flex items-center justify-between p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer" data-name="${sName}" data-phone="${sPhone}" type="button">
            <span class="flex items-center gap-space-sm">
              <span class="material-symbols-outlined text-on-surface-variant text-[28px]">call</span>
              <span class="font-label-lg text-label-lg">Call ${sName} (${sPhone})</span>
            </span>
            <span class="font-caption text-caption text-outline">Secondary</span>
          </button>
        </div>
        <div class="flex justify-end">
          <button class="flow-action-btn px-space-lg min-h-[48px] rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md cursor-pointer" data-target="state1" type="button">
            Back to Call 112 Confirmation
          </button>
        </div>
      </div>
    </div>

    <!-- State 4: SmritiAI Voice SOS Flow Panel -->
    <div class="flow-panel ${activeFlowState === 'state4' ? 'block' : 'hidden'}" id="panel-state4">
      <div class="max-w-2xl mx-auto rounded-xl bg-secondary text-on-secondary p-space-xl md:p-space-2xl shadow-xl border border-secondary-fixed/20">
        <div class="flex items-center justify-between mb-space-lg">
          <div class="flex items-center gap-space-sm">
            <div class="w-10 h-10 rounded-full bg-on-secondary/15 flex items-center justify-center">
              <span class="material-symbols-outlined text-[24px]">graphic_eq</span>
            </div>
            <div>
              <span class="font-headline-sm text-headline-sm leading-tight block font-bold">SmritiAI Voice Guardian</span>
              <span class="font-caption text-caption opacity-80">Listening &amp; Assisting in Hindi • English</span>
            </div>
          </div>
          <span class="px-space-sm py-1 rounded-full bg-on-secondary/10 font-caption text-caption">Active Audio</span>
        </div>
        <!-- Conversational transcript bubbles -->
        <div class="space-y-space-md mb-space-xl">
          <div class="flex items-start gap-space-sm">
            <span class="w-8 h-8 rounded-full bg-on-secondary/20 flex items-center justify-center font-caption text-caption shrink-0 font-bold">AD</span>
            <div class="p-space-md rounded-xl bg-on-secondary/10 text-on-secondary font-body-lg text-body-lg max-w-[85%]">
              “Smriti, mujhe theek nahi lag raha hai... I need emergency help.”
            </div>
          </div>
          <div class="flex items-start gap-space-sm justify-end">
            <div class="p-space-md rounded-xl bg-surface-container-lowest text-on-surface font-body-lg text-body-lg max-w-[88%] shadow-md">
              <p class="font-semibold text-secondary mb-1">SmritiAI (Voice)</p>
              “This may be an emergency, Asha. Take a soft breath. Would you like to call <strong>112</strong> or call <strong>${pName}</strong>?”
            </div>
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-caption text-caption shrink-0">
              <span class="material-symbols-outlined text-[18px]">neurology</span>
            </div>
          </div>
        </div>
        <!-- Explicit Dual Action Buttons for Voice SOS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-md">
          <button class="flow-action-btn min-h-[56px] flex items-center justify-center gap-space-xs rounded-xl bg-error hover:bg-error/90 text-on-error font-label-lg text-label-lg shadow-md transition-colors cursor-pointer" data-target="state2" type="button">
            <span class="material-symbols-outlined text-[24px]">call</span>
            <span>Call 112</span>
          </button>
          <button class="call-caregiver-btn min-h-[56px] flex items-center justify-center gap-space-xs rounded-xl bg-surface-container-lowest hover:bg-surface text-secondary font-label-lg text-label-lg transition-colors cursor-pointer shadow-md" data-name="${pName}" data-phone="${pPhone}" type="button">
            <span class="material-symbols-outlined text-[24px]">family_restroom</span>
            <span>Call ${pName} (${primaryContact?.relation || 'Daughter'})</span>
          </button>
        </div>
        <div class="text-center">
          <button class="flow-action-btn text-on-secondary/70 hover:text-on-secondary font-label-md text-label-md transition-colors underline cursor-pointer" data-target="state1" type="button">
            Cancel and Return to Safety Options
          </button>
        </div>
      </div>
    </div>
  </section>
  `;
}

// ----------------------------------------------------
// CAREGIVER MANAGEMENT SECTION
// ----------------------------------------------------
function renderCaregiverManagementSection(contacts, auditLogs) {
  const patientId = store.getCurrentPatientId();
  const prefs = store.getEmergencyPreferences(patientId);

  return `
  <section class="space-y-space-2xl mb-space-3xl">
    <!-- Contacts Management Card -->
    <div class="rounded-2xl bg-surface-container-lowest p-space-xl shadow-md border border-surface-container">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <h3 class="font-headline-md text-headline-md text-on-surface font-bold">Configured Emergency Contacts</h3>
          <p class="font-body-md text-body-md text-on-surface-variant">Authorized caregivers can add, edit, set priority, or disable contacts for this patient.</p>
        </div>
        <button id="openAddContactModalBtn" class="flex items-center gap-space-xs px-space-lg min-h-[48px] rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary/90 transition-all shadow-sm cursor-pointer shrink-0">
          <span class="material-symbols-outlined text-[20px]">person_add</span>
          <span>Add Emergency Contact</span>
        </button>
      </div>

      <div class="space-y-space-sm">
        ${contacts.map(c => `
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-low border border-surface-container" data-id="${c.id}">
            <div class="flex items-center gap-space-md">
              <div class="w-12 h-12 rounded-full ${
                c.priority === 'primary' || c.roleLabel === 'Primary Caregiver' 
                  ? 'bg-secondary text-on-secondary' 
                  : 'bg-surface-container-high text-on-surface'
              } flex items-center justify-center font-bold font-label-lg shrink-0">
                ${c.name.charAt(0)}
              </div>
              <div>
                <div class="flex items-center gap-space-xs flex-wrap">
                  <h4 class="font-label-lg text-label-lg font-bold text-on-surface">${c.name}</h4>
                  <span class="px-space-xs py-0.5 rounded-full ${
                    c.priority === 'primary' || c.roleLabel === 'Primary Caregiver'
                      ? 'bg-secondary-container text-on-secondary-container font-semibold'
                      : 'bg-surface-container-high text-on-surface-variant'
                  } font-caption text-caption">
                    ${c.roleLabel || c.priority || 'Contact'}
                  </span>
                  ${c.enabled === false ? '<span class="px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-caption text-caption">Disabled</span>' : ''}
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant">${c.relation} • <span class="font-mono">${c.phone}</span></p>
              </div>
            </div>

            <div class="flex items-center gap-space-xs flex-wrap">
              ${c.phone !== '112' && c.priority !== 'primary' ? `
                <button class="set-primary-contact-btn px-space-sm py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary font-label-md text-label-md cursor-pointer" data-id="${c.id}">
                  Set Primary
                </button>
              ` : ''}
              ${c.phone !== '112' ? `
                <button class="toggle-contact-enabled-btn px-space-sm py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md cursor-pointer" data-id="${c.id}">
                  ${c.enabled === false ? 'Enable' : 'Disable'}
                </button>
                <button class="delete-contact-btn px-space-sm py-1 rounded-lg bg-error/10 hover:bg-error/20 text-error font-label-md text-label-md cursor-pointer" data-id="${c.id}">
                  Remove
                </button>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Emergency Preferences Card -->
    <div class="rounded-2xl bg-surface-container-lowest p-space-xl shadow-md border border-surface-container">
      <h3 class="font-headline-md text-headline-md text-on-surface font-bold mb-space-xs">Emergency Preferences</h3>
      <p class="font-body-md text-body-md text-on-surface-variant mb-space-lg">Configure safety alerts and location-sharing preferences for this patient.</p>

      <div class="space-y-space-md max-w-xl">
        <label class="flex items-center justify-between p-space-md rounded-xl bg-surface-container-low border border-surface-container cursor-pointer">
          <div>
            <p class="font-label-lg text-label-lg font-semibold text-on-surface">Auto-Share Location Alert</p>
            <p class="font-body-sm text-body-sm text-on-surface-variant">Send notification with safe coordinates to family circle when SOS screen opens.</p>
          </div>
          <input type="checkbox" id="prefAutoShareCheckbox" class="w-5 h-5 accent-primary cursor-pointer" ${prefs.autoShareLocation ? 'checked' : ''} />
        </label>
      </div>
    </div>

    <!-- SOS Activity History Card -->
    <div class="rounded-2xl bg-surface-container-lowest p-space-xl shadow-md border border-surface-container">
      <div class="flex items-center justify-between mb-space-md">
        <div>
          <h3 class="font-headline-md text-headline-md text-on-surface font-bold">SOS Activity History</h3>
          <p class="font-body-md text-body-md text-on-surface-variant">Local tamper-evident event log. No microphone audio or continuous tracking is retained.</p>
        </div>
        <span class="font-label-md text-label-md text-outline">${auditLogs.length} Events Logged</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-surface-container font-label-md text-label-md text-on-surface-variant">
              <th class="py-space-xs px-space-sm">Timestamp</th>
              <th class="py-space-xs px-space-sm">Action</th>
              <th class="py-space-xs px-space-sm">Status</th>
              <th class="py-space-xs px-space-sm">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container">
            ${auditLogs.length > 0 ? auditLogs.slice(0, 10).map(log => `
              <tr class="font-body-md text-body-md text-on-surface">
                <td class="py-space-sm px-space-sm whitespace-nowrap text-on-surface-variant font-mono text-caption">${log.timestamp || 'Today'}</td>
                <td class="py-space-sm px-space-sm font-semibold">${log.action || log.title}</td>
                <td class="py-space-sm px-space-sm">
                  <span class="px-space-xs py-0.5 rounded-full bg-surface-container font-caption text-caption">${log.status}</span>
                </td>
                <td class="py-space-sm px-space-sm text-on-surface-variant text-body-sm">${log.details || log.notes || '—'}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="4" class="py-space-lg text-center text-on-surface-variant italic">No emergency events logged yet.</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  </section>
  `;
}

// ----------------------------------------------------
// EVENT ATTACHMENT
// ----------------------------------------------------
export function attachEmergencySosEvents() {
  const dialPrimary = document.getElementById('dial112PrimaryBtn');
  const confirm112Modal = document.getElementById('confirm112Modal');
  const cancel112Btn = document.getElementById('cancel112Btn');
  const confirmCall112Btn = document.getElementById('confirmCall112Btn');

  const confirmCaregiverModal = document.getElementById('confirmCaregiverModal');
  const cancelCgCallBtn = document.getElementById('cancelCgCallBtn');
  const proceedCgCallBtn = document.getElementById('proceedCgCallBtn');
  const cgConfirmNameTitle = document.getElementById('cgConfirmNameTitle');
  const cgConfirmPhoneDesc = document.getElementById('cgConfirmPhoneDesc');

  const shareLocationBtn = document.getElementById('shareLocationBtn');
  const shareLocationLabel = document.getElementById('shareLocationLabel');
  const caregiverBtns = document.querySelectorAll('.call-caregiver-btn');
  const sosTabs = document.querySelectorAll('.sos-tab-btn');
  const flowActionBtns = document.querySelectorAll('.flow-action-btn');
  const toggleCaregiverBtn = document.getElementById('toggleCaregiverSosTabBtn');

  // Contact Form & Modal Elements
  const contactEditModal = document.getElementById('contactEditModal');
  const openAddContactModalBtn = document.getElementById('openAddContactModalBtn');
  const closeContactModalBtn = document.getElementById('closeContactModalBtn');
  const cancelContactFormBtn = document.getElementById('cancelContactFormBtn');
  const contactForm = document.getElementById('contactForm');
  const contactNameInput = document.getElementById('contactNameInput');
  const contactRelationInput = document.getElementById('contactRelationInput');
  const contactPhoneInput = document.getElementById('contactPhoneInput');
  const contactPrioritySelect = document.getElementById('contactPrioritySelect');
  const contactModalTitle = document.getElementById('contactModalTitle');

  // Contact Action Buttons (Caregiver)
  const setPrimaryBtns = document.querySelectorAll('.set-primary-contact-btn');
  const toggleEnabledBtns = document.querySelectorAll('.toggle-contact-enabled-btn');
  const deleteBtns = document.querySelectorAll('.delete-contact-btn');
  const prefAutoShareCheckbox = document.getElementById('prefAutoShareCheckbox');

  let pendingCgContact = null;

  function reRenderView() {
    const contentEl = document.getElementById('view-content');
    if (contentEl) {
      contentEl.innerHTML = renderEmergencySosView();
      attachEmergencySosEvents();
    }
  }

  // 1. CALL 112 Confirmation Safeguard
  if (dialPrimary && confirm112Modal) {
    dialPrimary.addEventListener('click', () => {
      confirm112Modal.classList.remove('hidden');
    });
  }

  if (cancel112Btn && confirm112Modal) {
    cancel112Btn.addEventListener('click', () => {
      confirm112Modal.classList.add('hidden');
      emergencyService.cancelCall();
      showToast('Emergency call cancelled', 'info');
    });
  }

  if (confirmCall112Btn && confirm112Modal) {
    confirmCall112Btn.addEventListener('click', () => {
      confirm112Modal.classList.add('hidden');
      const res = emergencyService.requestCall112(true);
      if (res.status === CALL_STATES.CALL_INITIATED) {
        showToast(res.message, 'call');
        speechService.speak("Calling 1 1 2. Connecting to emergency response. Say: House 14, Sector 4, Shillong.");
        activeFlowState = 'state2';
      } else if (res.status === CALL_STATES.CALL_UNAVAILABLE) {
        showToast(res.message, 'error');
        activeFlowState = 'state3';
      }
      reRenderView();
    });
  }

  // 2. Caregiver Direct Calling
  caregiverBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const phone = btn.getAttribute('data-phone');

      pendingCgContact = { id, name, phone };
      if (cgConfirmNameTitle) cgConfirmNameTitle.textContent = `Call ${name}?`;
      if (cgConfirmPhoneDesc) cgConfirmPhoneDesc.textContent = `Telephone number: ${phone}`;
      if (confirmCaregiverModal) confirmCaregiverModal.classList.remove('hidden');
    });
  });

  if (cancelCgCallBtn && confirmCaregiverModal) {
    cancelCgCallBtn.addEventListener('click', () => {
      confirmCaregiverModal.classList.add('hidden');
      pendingCgContact = null;
    });
  }

  if (proceedCgCallBtn && confirmCaregiverModal) {
    proceedCgCallBtn.addEventListener('click', () => {
      confirmCaregiverModal.classList.add('hidden');
      if (pendingCgContact) {
        const res = emergencyService.initiateCall(pendingCgContact.phone, pendingCgContact.name);
        showToast(res.message, 'call');
        speechService.speak(`Connecting you to ${pendingCgContact.name} right away. Take a soft breath.`);
      }
      pendingCgContact = null;
    });
  }

  // 3. Location Sharing Button
  if (shareLocationBtn) {
    shareLocationBtn.addEventListener('click', () => {
      if (shareLocationLabel) shareLocationLabel.textContent = 'Acquiring GPS Position...';
      emergencyService.shareLocationWithCircle().then(res => {
        if (shareLocationLabel) shareLocationLabel.textContent = 'Location Shared with Family Circle!';
        showToast('Safe zone coordinates dispatched to Care Circle', 'share_location');
        setTimeout(() => {
          if (shareLocationLabel) shareLocationLabel.textContent = 'Share Location with Care Circle';
        }, 3500);
        reRenderView();
      }).catch(() => {
        if (shareLocationLabel) shareLocationLabel.textContent = 'Location Unavailable';
      });
    });
  }

  // 4. Workbench Flow Tabs
  sosTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFlowState = btn.getAttribute('data-state');
      reRenderView();
      const bench = document.getElementById('emergencyWorkbench');
      if (bench) bench.scrollIntoView({ behavior: 'smooth' });
    });
  });

  flowActionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFlowState = btn.getAttribute('data-target');
      if (activeFlowState === 'state2') {
        speechService.speak("Calling 1 1 2. Connecting to emergency response. Say: House 14, Sector 4, Shillong.");
      }
      reRenderView();
    });
  });

  // 5. Caregiver View Switcher
  if (toggleCaregiverBtn) {
    toggleCaregiverBtn.addEventListener('click', () => {
      isCaregiverViewTab = !isCaregiverViewTab;
      reRenderView();
    });
  }

  // 6. Caregiver Management Operations
  if (openAddContactModalBtn && contactEditModal) {
    openAddContactModalBtn.addEventListener('click', () => {
      contactModalMode = 'add';
      contactModalTargetId = null;
      if (contactModalTitle) contactModalTitle.textContent = 'Add Emergency Contact';
      if (contactForm) contactForm.reset();
      contactEditModal.classList.remove('hidden');
    });
  }

  if (closeContactModalBtn && contactEditModal) {
    closeContactModalBtn.addEventListener('click', () => {
      contactEditModal.classList.add('hidden');
    });
  }

  if (cancelContactFormBtn && contactEditModal) {
    cancelContactFormBtn.addEventListener('click', () => {
      contactEditModal.classList.add('hidden');
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const name = contactNameInput.value.trim();
        const relation = contactRelationInput.value.trim();
        const phone = contactPhoneInput.value.trim();
        const priority = contactPrioritySelect.value;
        const roleLabel = priority === 'primary' ? 'Primary Caregiver' : priority === 'secondary' ? 'Secondary Contact' : 'Emergency Contact';

        if (contactModalMode === 'add') {
          store.addEmergencyContact({
            name,
            relation,
            phone,
            priority,
            roleLabel
          });
          showToast(`Added ${name} to emergency contacts`, 'success');
        } else if (contactModalMode === 'edit' && contactModalTargetId) {
          store.updateEmergencyContact(contactModalTargetId, {
            name,
            relation,
            phone,
            priority,
            roleLabel
          });
          showToast(`Updated contact ${name}`, 'success');
        }

        if (contactEditModal) contactEditModal.classList.add('hidden');
        reRenderView();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  setPrimaryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      try {
        store.setPrimaryEmergencyContact(id);
        showToast('Set as Primary Caregiver', 'success');
        reRenderView();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  toggleEnabledBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      try {
        const newState = store.toggleEmergencyContactEnabled(id);
        showToast(newState ? 'Contact enabled' : 'Contact disabled', 'info');
        reRenderView();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  deleteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to remove this emergency contact?')) {
        try {
          store.deleteEmergencyContact(id);
          showToast('Contact removed', 'delete');
          reRenderView();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  });

  if (prefAutoShareCheckbox) {
    prefAutoShareCheckbox.addEventListener('change', (e) => {
      try {
        const patientId = store.getCurrentPatientId();
        store.updateEmergencyPreferences(patientId, { autoShareLocation: e.target.checked });
        showToast(`Auto-share ${e.target.checked ? 'enabled' : 'disabled'}`, 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
}
