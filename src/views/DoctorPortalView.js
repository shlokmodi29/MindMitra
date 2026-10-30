// MindMitra Doctor Portal View
// Dedicated workspace for authorized healthcare professionals
// Adheres strictly to Stitch design language, non-diagnostic clinical boundaries & DPDP privacy isolation

import { store } from '../state/store.js';
import { authService } from '../services/authService.js';
import { doctorService, CONNECTION_STATUS, NOTE_TYPES } from '../services/doctorService.js';
import { analyticsService } from '../services/analyticsService.js';
import { showToast } from '../components/Toast.js';

let activeTab = 'overview'; // 'overview' | 'patients' | 'reports' | 'notes' | 'profile'
let selectedPatientId = null;
let viewingReportId = null;

export function setActiveDoctorTab(tab) {
  if (['overview', 'patients', 'reports', 'notes', 'profile'].includes(tab)) {
    activeTab = tab;
  }
}

export function renderDoctorPortalView() {
  const currentUser = authService.getCurrentUser();
  const doctor = (currentUser && currentUser.role === 'doctor') ? currentUser : {
    id: 'user-dr-sharma',
    name: 'Dr. Ananya Sharma',
    email: 'ananya@mindmitra.in',
    role: 'doctor',
    specialization: 'Neurology / Cognitive Health',
    hospital: 'Shillong Medical Centre',
    city: 'Shillong, Meghalaya',
    phone: '+91 98320 12345',
    licenseId: 'NMC-2018-847291',
    verificationStatus: 'Pending',
    bio: 'Specialist in cognitive neurology, memory support, and elder rehabilitation.',
    languages: ['English', 'Hindi', 'Khasi']
  };

  const doctorId = doctor.id || doctor.userId || 'user-dr-sharma';
  const approvedConnections = doctorService.getAuthorizedPatients(doctorId);
  const pendingConnections = doctorService.getPendingPatientRequests(doctorId);
  const sharedReports = doctorService.getSharedCareReports(doctorId);
  const doctorNotes = doctorService.getDoctorObservations(doctorId);

  // If a patient is selected, get their summary
  let patientSummary = null;
  if (selectedPatientId) {
    patientSummary = doctorService.getDoctorPatientSummary(doctorId, selectedPatientId);
  }

  // Active viewing report
  let activeReport = null;
  if (viewingReportId) {
    activeReport = doctorService.getSharedReportDetails(viewingReportId, doctorId);
  }

  return `
  <div class="w-full bg-surface min-h-screen text-on-surface flex flex-col font-sans pb-16">
    <!-- Doctor Portal Top Bar Navigation -->
    <header class="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-surface-container shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        <!-- Brand & Context -->
        <div class="flex items-center gap-3">
          <a href="#/doctor-portal" class="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-primary rounded-xl p-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" width="130" height="32" fill="none" class="shrink-0">
              <g transform="translate(4, 4)">
                <circle cx="16" cy="16" r="15" fill="#FAF7F2" stroke="#E6DFD5" stroke-width="1"/>
                <path d="M16 6C12 11 11 16 16 26C21 16 20 11 16 6Z" fill="#9f3c16" opacity="0.95"/>
                <path d="M6 16C11 12 16 11 26 16C16 21 11 20 6 16Z" fill="#79526c" opacity="0.85"/>
                <circle cx="16" cy="16" r="3.5" fill="#FAF7F2"/>
              </g>
              <text x="42" y="24" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="18" fill="#201A19" letter-spacing="-0.02em">MindMitra</text>
            </svg>
            <span class="text-caption font-semibold px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary border border-tertiary/20">
              Doctor Portal
            </span>
          </a>
        </div>

        <!-- Navigation Tabs -->
        <nav class="hidden md:flex items-center gap-1 bg-surface-container-low p-1.5 rounded-2xl border border-outline/20">
          <button data-tab="overview" class="doctor-nav-btn px-4 py-2 rounded-xl text-label-md font-semibold transition-all ${activeTab === 'overview' ? 'bg-surface text-primary shadow-xs font-bold' : 'text-on-surface-variant hover:text-on-surface'}">
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px]">dashboard</span>
              <span>Overview</span>
            </span>
          </button>
          <button data-tab="patients" class="doctor-nav-btn px-4 py-2 rounded-xl text-label-md font-semibold transition-all ${activeTab === 'patients' ? 'bg-surface text-primary shadow-xs font-bold' : 'text-on-surface-variant hover:text-on-surface'}">
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px]">groups</span>
              <span>My Patients</span>
              <span class="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-primary-container text-on-primary-container">${approvedConnections.length}</span>
            </span>
          </button>
          <button data-tab="reports" class="doctor-nav-btn px-4 py-2 rounded-xl text-label-md font-semibold transition-all ${activeTab === 'reports' ? 'bg-surface text-primary shadow-xs font-bold' : 'text-on-surface-variant hover:text-on-surface'}">
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px]">assignment</span>
              <span>Care Reports</span>
              <span class="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-secondary-container text-on-secondary-container">${sharedReports.length}</span>
            </span>
          </button>
          <button data-tab="notes" class="doctor-nav-btn px-4 py-2 rounded-xl text-label-md font-semibold transition-all ${activeTab === 'notes' ? 'bg-surface text-primary shadow-xs font-bold' : 'text-on-surface-variant hover:text-on-surface'}">
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px]">clinical_notes</span>
              <span>Observations</span>
            </span>
          </button>
          <button data-tab="profile" class="doctor-nav-btn px-4 py-2 rounded-xl text-label-md font-semibold transition-all ${activeTab === 'profile' ? 'bg-surface text-primary shadow-xs font-bold' : 'text-on-surface-variant hover:text-on-surface'}">
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px]">account_circle</span>
              <span>Profile</span>
            </span>
          </button>
        </nav>

        <!-- Doctor Identity & Actions -->
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex flex-col text-right">
            <div class="flex items-center justify-end gap-1.5">
              <span class="font-headline-sm text-sm font-bold text-on-surface">${doctor.name}</span>
              <span class="material-symbols-outlined text-primary text-[18px]">verified</span>
            </div>
            <span class="text-caption text-on-surface-variant truncate max-w-[180px]">${doctor.specialization || 'Clinical Neurologist'}</span>
          </div>

          <div class="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center border border-primary/20 shrink-0">
            ${doctor.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>

          <button id="doctorLogoutBtn" title="Log out" class="p-2 rounded-xl hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-colors cursor-pointer" aria-label="Sign out">
            <span class="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>

      <!-- Mobile Tab Bar -->
      <div class="md:hidden flex items-center justify-around border-t border-surface-container bg-surface-container-lowest px-2 py-2 overflow-x-auto">
        <button data-tab="overview" class="doctor-nav-btn px-2.5 py-1.5 rounded-lg text-caption font-semibold flex flex-col items-center gap-1 ${activeTab === 'overview' ? 'text-primary font-bold' : 'text-on-surface-variant'}">
          <span class="material-symbols-outlined text-[20px]">dashboard</span>
          <span>Overview</span>
        </button>
        <button data-tab="patients" class="doctor-nav-btn px-2.5 py-1.5 rounded-lg text-caption font-semibold flex flex-col items-center gap-1 ${activeTab === 'patients' ? 'text-primary font-bold' : 'text-on-surface-variant'}">
          <span class="material-symbols-outlined text-[20px]">groups</span>
          <span>Patients (${approvedConnections.length})</span>
        </button>
        <button data-tab="reports" class="doctor-nav-btn px-2.5 py-1.5 rounded-lg text-caption font-semibold flex flex-col items-center gap-1 ${activeTab === 'reports' ? 'text-primary font-bold' : 'text-on-surface-variant'}">
          <span class="material-symbols-outlined text-[20px]">assignment</span>
          <span>Reports (${sharedReports.length})</span>
        </button>
        <button data-tab="notes" class="doctor-nav-btn px-2.5 py-1.5 rounded-lg text-caption font-semibold flex flex-col items-center gap-1 ${activeTab === 'notes' ? 'text-primary font-bold' : 'text-on-surface-variant'}">
          <span class="material-symbols-outlined text-[20px]">clinical_notes</span>
          <span>Notes</span>
        </button>
        <button data-tab="profile" class="doctor-nav-btn px-2.5 py-1.5 rounded-lg text-caption font-semibold flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-primary font-bold' : 'text-on-surface-variant'}">
          <span class="material-symbols-outlined text-[20px]">account_circle</span>
          <span>Profile</span>
        </button>
      </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full flex-1">

      <!-- Doctor Welcome & Honest Verification Status Card -->
      <div class="mb-6 p-5 sm:p-6 rounded-3xl bg-surface-container-low border border-outline/20 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2.5 flex-wrap">
            <h1 class="font-headline-md text-2xl font-bold text-on-surface">Welcome, ${doctor.name}</h1>
            <span class="px-2.5 py-0.5 rounded-full text-caption font-medium bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">hourglass_top</span>
              <span>Verification: <strong>Pending review</strong></span>
            </span>
          </div>
          <p class="text-body-md text-on-surface-variant">
            ${doctor.specialization || 'Clinical Neurologist'} • ${doctor.hospital || 'Hospital Practice'} • ${doctor.city || 'Regional Center'}
          </p>
        </div>

        <div class="flex items-center gap-2.5 w-full md:w-auto">
          <button id="openNewConnectionModalBtn" class="flex-1 md:flex-none h-11 px-4 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
            <span class="material-symbols-outlined text-[18px]">person_add</span>
            <span>Request Patient Connection</span>
          </button>
        </div>
      </div>

      <!-- TAB CONTENT PANELS -->

      <!-- TAB 1: OVERVIEW -->
      ${activeTab === 'overview' ? `
        <div class="space-y-6">
          <!-- Metric Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-5 rounded-2xl bg-surface-container border border-outline/20 flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-[28px]">groups</span>
              </div>
              <div>
                <span class="block text-caption font-semibold text-on-surface-variant uppercase tracking-wider">Authorized Patients</span>
                <span class="font-headline-lg text-2xl font-bold text-on-surface">${approvedConnections.length}</span>
              </div>
            </div>

            <div class="p-5 rounded-2xl bg-surface-container border border-outline/20 flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <span class="material-symbols-outlined text-[28px]">assignment_turned_in</span>
              </div>
              <div>
                <span class="block text-caption font-semibold text-on-surface-variant uppercase tracking-wider">Shared Care Reports</span>
                <span class="font-headline-lg text-2xl font-bold text-on-surface">${sharedReports.length}</span>
              </div>
            </div>

            <div class="p-5 rounded-2xl bg-surface-container border border-outline/20 flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
                <span class="material-symbols-outlined text-[28px]">clinical_notes</span>
              </div>
              <div>
                <span class="block text-caption font-semibold text-on-surface-variant uppercase tracking-wider">Clinical Observations</span>
                <span class="font-headline-lg text-2xl font-bold text-on-surface">${doctorNotes.length}</span>
              </div>
            </div>

            <div class="p-5 rounded-2xl bg-surface-container border border-outline/20 flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                <span class="material-symbols-outlined text-[28px]">pending_actions</span>
              </div>
              <div>
                <span class="block text-caption font-semibold text-on-surface-variant uppercase tracking-wider">Pending Requests</span>
                <span class="font-headline-lg text-2xl font-bold text-on-surface">${pendingConnections.length}</span>
              </div>
            </div>
          </div>

          <!-- Two Column Layout: Active Patients & Recent Observations -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left 2 Cols: Authorized Patients Quick Access -->
            <div class="lg:col-span-2 space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-[22px]">supervised_user_circle</span>
                  <span>Active Patients with Authorized Care Access</span>
                </h2>
                <button data-tab="patients" class="doctor-nav-btn text-caption font-bold text-primary hover:underline">
                  View All (${approvedConnections.length})
                </button>
              </div>

              ${approvedConnections.length === 0 ? `
                <div class="p-8 rounded-2xl bg-surface-container-low border border-dashed border-outline/30 text-center space-y-2">
                  <span class="material-symbols-outlined text-outline text-[36px]">group_off</span>
                  <p class="font-body-md text-on-surface-variant">No authorized patient connections yet.</p>
                  <p class="text-caption text-outline">Click "Request Patient Connection" above to invite a patient or caregiver for review.</p>
                </div>
              ` : `
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  ${approvedConnections.map(conn => {
                    const allUsers = store.getState().users || [];
                    const pUser = allUsers.find(u => u.id === conn.patientId);
                    const patientName = conn.patientName || pUser?.name || 'Asha Devi';
                    const careAnalytics = analyticsService.getDailyCareAnalytics(conn.patientId);
                    const adherenceText = careAnalytics.overallAdherenceRate ? `${careAnalytics.overallAdherenceRate}% Adherence` : 'Active Routine';
                    const reminders = store.getRemindersForPatient(conn.patientId) || [];
                    const appt = reminders.find(r => r.category === 'appointment' || r.type === 'appointment' || (r.title && (r.title.toLowerCase().includes('doctor') || r.title.toLowerCase().includes('dr.') || r.title.toLowerCase().includes('clinic'))));
                    const apptText = appt ? `${appt.title} (${appt.time})` : 'No appointment scheduled.';
                    return `
                    <div class="p-5 rounded-2xl bg-surface-container-low border border-outline/20 hover:border-primary/40 transition-all flex flex-col justify-between space-y-4">
                      <div>
                        <div class="flex items-center justify-between">
                          <span class="px-2 py-0.5 rounded-full text-caption font-bold bg-green-50 text-green-700 border border-green-200">
                            Approved Connection
                          </span>
                          <span class="text-caption text-on-surface-variant">Active</span>
                        </div>
                        <h3 class="font-headline-sm text-lg font-bold text-on-surface mt-2">${patientName}</h3>
                        <p class="text-caption text-on-surface-variant">Patient ID: <span class="font-mono text-outline">${conn.patientId}</span></p>
                        <p class="text-caption text-on-surface-variant mt-1">
                          Routine: <strong class="text-green-700">${adherenceText}</strong> • Appt: <span>${apptText}</span>
                        </p>
                      </div>

                      <div class="flex items-center gap-2 pt-2 border-t border-surface-container">
                        <button data-view-patient="${conn.patientId}" class="view-patient-btn flex-1 h-9 px-3 rounded-lg bg-primary text-on-primary font-label-sm font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                          <span class="material-symbols-outlined text-[16px]">visibility</span>
                          <span>Care Summary</span>
                        </button>
                        <button data-add-note-for="${conn.patientId}" class="quick-add-note-btn h-9 px-3 rounded-lg bg-surface-container border border-outline/30 text-on-surface font-label-sm font-semibold hover:bg-surface-container-high transition-all flex items-center justify-center gap-1 cursor-pointer" title="Add Observation Note">
                          <span class="material-symbols-outlined text-[16px]">add_comment</span>
                        </button>
                      </div>
                    </div>
                    `;
                  }).join('')}
                </div>
              `}

              <!-- Non-Diagnostic Clinical Notice -->
              <div class="p-4 rounded-2xl bg-tertiary-container/20 border border-tertiary/20 flex items-start gap-3">
                <span class="material-symbols-outlined text-tertiary text-[22px] shrink-0 mt-0.5">verified_user</span>
                <div class="space-y-0.5 text-body-sm text-on-tertiary-container">
                  <p class="font-bold">Non-Diagnostic Clinical Companion Notice</p>
                  <p class="text-caption leading-relaxed">
                    MindMitra records cognitive practice patterns, routine adherence, and caregiver observations. It does not generate medical diagnoses or replace licensed clinical judgment.
                  </p>
                </div>
              </div>
            </div>

            <!-- Right 1 Col: Latest Observations & Activity Feed -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-secondary text-[22px]">history_edu</span>
                  <span>Recent Observations</span>
                </h2>
                <button data-tab="notes" class="doctor-nav-btn text-caption font-bold text-secondary hover:underline">
                  All Notes
                </button>
              </div>

              <div class="space-y-3">
                ${doctorNotes.slice(0, 3).map(note => `
                  <div class="p-4 rounded-xl bg-surface-container-low border border-outline/20 space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-caption font-semibold px-2 py-0.5 rounded-md bg-surface text-tertiary border border-outline/20">
                        ${note.noteType || 'General observation'}
                      </span>
                      <span class="text-[11px] text-outline">${new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p class="text-body-sm text-on-surface italic">"${note.noteText}"</p>
                    <div class="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-surface-container">
                      <span>By: ${note.doctorName}</span>
                      <span class="font-mono text-outline">${note.patientName || note.patientId}</span>
                    </div>
                  </div>
                `).join('')}

                ${doctorNotes.length === 0 ? `
                  <p class="text-caption text-outline italic text-center p-4">No observations recorded yet.</p>
                ` : ''}
              </div>
            </div>

          </div>
        </div>
      ` : ''}

      <!-- TAB 2: MY PATIENTS -->
      ${activeTab === 'patients' ? `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="font-headline-md text-xl font-bold text-on-surface">Authorized Patient Care Network</h2>
              <p class="text-body-sm text-on-surface-variant">Patients who have granted explicit clinical consent for report and adherence review.</p>
            </div>
            <button id="openNewConnectionModalBtn" class="h-10 px-4 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">person_add</span>
              <span>New Patient Request</span>
            </button>
          </div>

          <!-- Pending Connection Requests Section if any -->
          ${pendingConnections.length > 0 ? `
            <div class="p-5 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-3">
              <div class="flex items-center gap-2 text-amber-900 font-label-lg font-bold">
                <span class="material-symbols-outlined text-[20px]">notification_important</span>
                <span>Pending Connection Approvals (${pendingConnections.length})</span>
              </div>
              <div class="space-y-2">
                ${pendingConnections.map(req => {
                  const isRequestedByMe = req.requestedBy === doctorId;
                  return `
                  <div class="p-3.5 rounded-xl bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-outline/20">
                    <div>
                      <p class="font-bold text-on-surface">${req.patientName || req.patientId}</p>
                      <p class="text-caption text-on-surface-variant">Requested on ${new Date(req.createdAt).toLocaleDateString()} • ID: <span class="font-mono">${req.patientId}</span></p>
                    </div>
                    <div class="flex items-center gap-2">
                      ${isRequestedByMe ? `
                        <span class="text-caption px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">Awaiting Patient/Caregiver Approval</span>
                        <button data-cancel-conn="${req.id}" class="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-caption font-semibold hover:bg-surface-container-high transition-all cursor-pointer">Withdraw</button>
                      ` : `
                        <button data-approve-conn="${req.id}" class="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-caption font-bold hover:bg-primary/90 transition-all cursor-pointer">Accept</button>
                        <button data-reject-conn="${req.id}" class="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-caption font-semibold hover:bg-surface-container-high transition-all cursor-pointer">Decline</button>
                      `}
                    </div>
                  </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Approved Patients Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            ${approvedConnections.length === 0 ? `
              <div class="col-span-full p-10 rounded-2xl bg-surface-container-low border border-dashed border-outline/30 text-center space-y-2">
                <span class="material-symbols-outlined text-outline text-[40px]">group_off</span>
                <p class="font-headline-sm text-base text-on-surface font-bold">No authorized patients yet.</p>
                <p class="text-caption text-on-surface-variant">Use "New Patient Request" to invite a patient or caregiver to connect.</p>
              </div>
            ` : approvedConnections.map(conn => {
              const allUsers = store.getState().users || [];
              const pUser = allUsers.find(u => u.id === conn.patientId);
              const patientName = conn.patientName || pUser?.name || 'Asha Devi';
              const caregiverContact = pUser?.caregiverName || (conn.patientId === 'user-asha' ? 'Meera (Family)' : 'Authorized Caregiver');
              const careAnalytics = analyticsService.getDailyCareAnalytics(conn.patientId);
              const adherenceText = careAnalytics.overallAdherenceRate ? `${careAnalytics.overallAdherenceRate}% Adherence` : 'Active Routine';
              const reminders = store.getRemindersForPatient(conn.patientId) || [];
              const appt = reminders.find(r => r.category === 'appointment' || r.type === 'appointment' || (r.title && (r.title.toLowerCase().includes('doctor') || r.title.toLowerCase().includes('dr.') || r.title.toLowerCase().includes('clinic'))));
              const apptText = appt ? `${appt.title} (${appt.time})` : 'No appointment scheduled.';
              return `
              <div class="p-5 rounded-2xl bg-surface-container-low border border-outline/20 hover:border-primary/50 transition-all flex flex-col justify-between space-y-4">
                <div class="space-y-2.5">
                  <div class="flex items-start justify-between">
                    <div class="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-lg">
                      ${patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span class="px-2.5 py-0.5 rounded-full text-caption font-bold bg-green-50 text-green-700 border border-green-200">
                      Approved
                    </span>
                  </div>

                  <div>
                    <h3 class="font-headline-sm text-lg font-bold text-on-surface">${patientName}</h3>
                    <p class="text-caption text-on-surface-variant font-mono">ID: ${conn.patientId}</p>
                    <p class="text-caption text-on-surface-variant">Connected: ${new Date(conn.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div class="p-3 rounded-xl bg-surface-container text-caption space-y-1 text-on-surface-variant">
                    <div class="flex justify-between">
                      <span>Caregiver Contact:</span>
                      <strong class="text-on-surface">${caregiverContact}</strong>
                    </div>
                    <div class="flex justify-between">
                      <span>Routine Practice:</span>
                      <strong class="text-on-surface text-green-700">${adherenceText}</strong>
                    </div>
                    <div class="flex justify-between">
                      <span>Appointment:</span>
                      <span class="text-on-surface font-medium truncate max-w-[140px]">${apptText}</span>
                    </div>
                  </div>
                </div>

                <div class="space-y-2 pt-2 border-t border-surface-container">
                  <button data-view-patient="${conn.patientId}" class="view-patient-btn w-full h-10 px-4 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <span class="material-symbols-outlined text-[18px]">assignment_ind</span>
                    <span>View Care Summary</span>
                  </button>
                  <button data-add-note-for="${conn.patientId}" class="quick-add-note-btn w-full h-9 px-3 rounded-xl bg-surface-container border border-outline/30 text-on-surface font-label-sm font-semibold hover:bg-surface-container-high transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                    <span class="material-symbols-outlined text-[16px]">add_comment</span>
                    <span>Add Observation Note</span>
                  </button>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- TAB 3: CARE REPORTS -->
      ${activeTab === 'reports' ? `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="font-headline-md text-xl font-bold text-on-surface">Shared Care Reports</h2>
              <p class="text-body-sm text-on-surface-variant">Cognitive engagement summaries and routine trends shared by authorized caregivers.</p>
            </div>
          </div>

          ${sharedReports.length === 0 ? `
            <div class="p-10 rounded-2xl bg-surface-container-low border border-dashed border-outline/30 text-center space-y-2">
              <span class="material-symbols-outlined text-outline text-[40px]">description</span>
              <p class="font-body-md text-on-surface-variant">No care reports shared with you yet.</p>
              <p class="text-caption text-outline">Caregivers can share cognitive summaries and weekly progress reports from their Caregiver Portal.</p>
            </div>
          ` : `
            <div class="space-y-4">
              ${sharedReports.map(rep => {
                const repPatient = (store.getState().users || []).find(u => u.id === rep.patientId);
                const repPatientName = rep.patientName || repPatient?.name || (rep.patientId === 'user-asha' ? 'Asha Devi' : rep.patientId);
                return `
                <div class="p-5 rounded-2xl bg-surface-container-low border border-outline/20 hover:border-primary/40 transition-all space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div class="flex items-center gap-2.5">
                      <span class="p-2 rounded-xl bg-secondary/10 text-secondary">
                        <span class="material-symbols-outlined text-[24px]">assignment</span>
                      </span>
                      <div>
                        <div class="flex items-center gap-2">
                          <h3 class="font-headline-sm text-base font-bold text-on-surface">${rep.title || 'Weekly Cognitive Practice & Daily Care Rhythm'}</h3>
                          ${(rep.title && rep.title.includes('Prep')) || rep.reportType === 'appointment_prep' ? `
                            <span class="px-2 py-0.2 rounded-full text-[11px] font-bold bg-secondary-container text-on-secondary-container">Appointment Prep</span>
                          ` : ''}
                        </div>
                        <p class="text-caption text-on-surface-variant">
                          Patient: <strong class="text-on-surface">${repPatientName}</strong> • Shared by: <strong class="text-on-surface">${rep.sharedBy || 'Meera (Caregiver)'}</strong> • ${new Date(rep.sharedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                      <span class="px-2.5 py-0.5 rounded-full text-caption font-semibold ${rep.status === 'reviewed' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-primary-container text-on-primary-container'}">
                        ${rep.status === 'reviewed' ? 'Reviewed' : 'Ready for Review'}
                      </span>
                      <button data-open-report="${rep.id || rep.reportId}" class="open-report-btn h-9 px-3.5 rounded-xl bg-primary text-on-primary text-caption font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer">
                        <span class="material-symbols-outlined text-[16px]">visibility</span>
                        <span>Open Details</span>
                      </button>
                    </div>
                  </div>

                  <!-- Summary Metrics Ribbon -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-surface-container">
                    <div class="p-2 rounded-lg bg-surface text-center">
                      <span class="block text-[11px] text-on-surface-variant">Routine Adherence</span>
                      <strong class="text-sm text-green-700">${rep.summaryMetrics?.routineAdherence || '92%'}</strong>
                    </div>
                    <div class="p-2 rounded-lg bg-surface text-center">
                      <span class="block text-[11px] text-on-surface-variant">Activities Completed</span>
                      <strong class="text-sm text-on-surface">${rep.summaryMetrics?.activitiesCompleted || 14} sessions</strong>
                    </div>
                    <div class="p-2 rounded-lg bg-surface text-center">
                      <span class="block text-[11px] text-on-surface-variant">Adaptive Level</span>
                      <strong class="text-sm text-on-surface">${rep.summaryMetrics?.adaptiveLevel || 'Level 2'}</strong>
                    </div>
                    <div class="p-2 rounded-lg bg-surface text-center">
                      <span class="block text-[11px] text-on-surface-variant">Primary Activity</span>
                      <strong class="text-sm text-on-surface">${rep.summaryMetrics?.primaryFocus || 'Memory Match'}</strong>
                    </div>
                  </div>
                </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      ` : ''}

      <!-- TAB 4: CLINICAL OBSERVATIONS / NOTES -->
      ${activeTab === 'notes' ? `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="font-headline-md text-xl font-bold text-on-surface">Clinical Observations & Recommendations</h2>
              <p class="text-body-sm text-on-surface-variant">Add factual, non-diagnostic guidance visible to the patient's care team with immutable attribution.</p>
            </div>
          </div>

          <!-- Add Note Composer -->
          <div class="p-6 rounded-3xl bg-surface-container border border-outline/20 space-y-4">
            <h3 class="font-headline-sm text-base font-bold text-on-surface flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">edit_note</span>
              <span>Record New Observation Note</span>
            </h3>

            <form id="doctorNoteForm" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="notePatientSelect" class="block text-caption font-semibold text-on-surface mb-1">Target Patient</label>
                  <select id="notePatientSelect" required class="w-full h-11 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none">
                    ${approvedConnections.map(c => `
                      <option value="${c.patientId}">${c.patientName || 'Asha Devi'} (${c.patientId})</option>
                    `).join('')}
                  </select>
                </div>

                <div>
                  <label for="noteTypeSelect" class="block text-caption font-semibold text-on-surface mb-1">Observation Type</label>
                  <select id="noteTypeSelect" required class="w-full h-11 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none">
                    <option value="${NOTE_TYPES.OBSERVATION}">General Observation</option>
                    <option value="${NOTE_TYPES.FOLLOW_UP}">Follow-up Recommendation</option>
                    <option value="${NOTE_TYPES.COMMENT}">Report Comment</option>
                  </select>
                </div>
              </div>

              <div>
                <label for="noteTextInput" class="block text-caption font-semibold text-on-surface mb-1">Clinical Observation / Notes</label>
                <textarea id="noteTextInput" rows="3" required placeholder="e.g. Patient shows steady participation during morning sessions. Recommend continuing daily music reminiscence and maintaining gentle 10-minute activity intervals." class="w-full p-3 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none"></textarea>
              </div>

              <div class="flex items-center justify-between gap-4 pt-1">
                <span class="text-caption text-on-surface-variant italic">
                  Note is logged with your timestamp & signature (${doctor.name}). Original patient activity data will never be overwritten.
                </span>
                <button type="submit" class="h-11 px-6 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shrink-0">
                  <span class="material-symbols-outlined text-[18px]">send</span>
                  <span>Save Observation</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Existing Doctor Notes List -->
          <div class="space-y-4">
            <h3 class="font-headline-sm text-base font-bold text-on-surface">Logged Observations (${doctorNotes.length})</h3>

            <div class="space-y-3">
              ${doctorNotes.map(note => {
                const notePatient = (store.getState().users || []).find(u => u.id === note.patientId);
                const notePatientName = note.patientName || notePatient?.name || (note.patientId === 'user-asha' ? 'Asha Devi' : note.patientId);
                return `
                <div class="p-5 rounded-2xl bg-surface-container-low border border-outline/20 space-y-2.5">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div class="flex items-center gap-2">
                      <span class="px-2.5 py-0.5 rounded-full text-caption font-bold bg-primary/10 text-primary border border-primary/20">
                        ${note.noteType || 'General observation'}
                      </span>
                      <span class="font-headline-sm text-sm font-bold text-on-surface">Patient: ${notePatientName}</span>
                    </div>
                    <span class="text-caption text-on-surface-variant">${new Date(note.createdAt).toLocaleString()}</span>
                  </div>

                  <p class="text-body-md text-on-surface leading-relaxed">${note.noteText}</p>

                  <div class="flex items-center justify-between text-caption text-on-surface-variant pt-2 border-t border-surface-container">
                    <span>Recorded by: <strong>${note.doctorName}</strong> (${note.specialization})</span>
                    <span class="font-mono text-[11px] text-outline">Ref: ${note.id}</span>
                  </div>
                </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- TAB 5: DOCTOR PROFILE -->
      ${activeTab === 'profile' ? `
        <div class="max-w-3xl space-y-6">
          <div>
            <h2 class="font-headline-md text-xl font-bold text-on-surface">Medical Practitioner Profile</h2>
            <p class="text-body-sm text-on-surface-variant">Update your practice affiliations, clinical specialty, and regional practice details.</p>
          </div>

          <form id="doctorProfileForm" class="p-6 sm:p-8 rounded-3xl bg-surface-container-low border border-outline/20 space-y-5">
            
            <!-- Verification Alert -->
            <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-3">
              <span class="material-symbols-outlined text-amber-700 text-[22px] shrink-0 mt-0.5">verified</span>
              <div class="space-y-1 text-body-sm text-amber-950">
                <p class="font-bold">Medical Council Verification Status: <strong>Pending Review</strong></p>
                <p class="text-caption text-amber-900 leading-relaxed">
                  MindMitra strictly displays honest pending verification status until state medical council records are independently validated. Patient data access remains strictly subject to patient/caregiver consent.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="profDoctorName" class="block text-caption font-semibold text-on-surface mb-1">Full Name</label>
                <input id="profDoctorName" type="text" value="${doctor.name}" required class="w-full h-11 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>

              <div>
                <label for="profDoctorEmail" class="block text-caption font-semibold text-on-surface mb-1">Email Address</label>
                <input id="profDoctorEmail" type="email" value="${doctor.email}" disabled class="w-full h-11 px-3 rounded-xl bg-surface-container border border-outline/20 text-on-surface-variant text-body-sm cursor-not-allowed" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="profDoctorSpecialization" class="block text-caption font-semibold text-on-surface mb-1">Medical Specialization</label>
                <input id="profDoctorSpecialization" type="text" value="${doctor.specialization || ''}" placeholder="e.g. Neurology / Cognitive Rehabilitation" class="w-full h-11 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>

              <div>
                <label for="profDoctorHospital" class="block text-caption font-semibold text-on-surface mb-1">Hospital / Clinic Affiliation</label>
                <input id="profDoctorHospital" type="text" value="${doctor.hospital || ''}" placeholder="e.g. Shillong Medical Centre" class="w-full h-11 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label for="profDoctorCity" class="block text-caption font-semibold text-on-surface mb-1">City / Region</label>
                <input id="profDoctorCity" type="text" value="${doctor.city || ''}" placeholder="e.g. Shillong, Meghalaya" class="w-full h-11 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>

              <div>
                <label for="profDoctorPhone" class="block text-caption font-semibold text-on-surface mb-1">Contact Phone</label>
                <input id="profDoctorPhone" type="tel" value="${doctor.phone || ''}" placeholder="e.g. +91 98320 12345" class="w-full h-11 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>

              <div>
                <label for="profDoctorLicense" class="block text-caption font-semibold text-on-surface mb-1">Registration / License ID</label>
                <input id="profDoctorLicense" type="text" value="${doctor.licenseId || ''}" placeholder="e.g. NMC-2018-847291" class="w-full h-11 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </div>

            <div>
              <label for="profDoctorBio" class="block text-caption font-semibold text-on-surface mb-1">Clinical Biography / Focus Areas</label>
              <textarea id="profDoctorBio" rows="3" class="w-full p-3 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none">${doctor.bio || ''}</textarea>
            </div>

            <div class="pt-2">
              <button type="submit" class="h-11 px-6 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-xs">
                <span class="material-symbols-outlined text-[18px]">save</span>
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      ` : ''}

    </main>

    <!-- MODAL 1: CLINICAL PATIENT SUMMARY (Non-Diagnostic, Minimum-Necessary) -->
    <div id="patientSummaryModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 ${selectedPatientId ? '' : 'hidden'}">
      <div class="bg-surface w-full max-w-2xl max-h-[90vh] rounded-3xl border border-surface-container shadow-xl overflow-hidden flex flex-col">
        <div class="p-5 border-b border-surface-container flex items-center justify-between bg-surface-container-low">
          <div class="flex items-center gap-3">
            <span class="p-2 rounded-xl bg-primary-container text-on-primary-container font-bold">
              ${patientSummary?.patientName?.charAt(0) || 'A'}
            </span>
            <div>
              <h3 class="font-headline-sm text-lg font-bold text-on-surface">${patientSummary?.patientName || 'Asha Devi'}</h3>
              <p class="text-caption text-on-surface-variant">Non-Diagnostic Care Summary & Routine Rhythm</p>
            </div>
          </div>
          <button id="closeSummaryModalBtn" class="p-2 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-6 text-on-surface">
          
          <!-- Key Metrics Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3 rounded-2xl bg-surface-container text-center">
              <span class="block text-caption text-on-surface-variant">Routine Adherence</span>
              <strong class="text-lg text-green-700">${patientSummary?.routineAdherenceRate || '92%'}</strong>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container text-center">
              <span class="block text-caption text-on-surface-variant">Activities Done</span>
              <strong class="text-lg text-on-surface">${patientSummary?.activityCompletionCount || 14}</strong>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container text-center">
              <span class="block text-caption text-on-surface-variant">Adaptive Level</span>
              <strong class="text-lg text-on-surface">${patientSummary?.adaptiveLevel || 'Level 2'}</strong>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container text-center">
              <span class="block text-caption text-on-surface-variant">Primary Focus</span>
              <strong class="text-sm font-bold text-primary truncate block mt-0.5">${patientSummary?.primaryActivity || 'Notice'}</strong>
            </div>
          </div>

          <!-- Authorized Appointment Context -->
          <div class="p-3.5 rounded-xl bg-secondary-container/20 border border-secondary/20 flex items-start gap-2.5 text-caption text-on-secondary-container">
            <span class="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">event</span>
            <div>
              <strong class="block text-body-sm text-on-surface font-bold">Scheduled Clinical Appointment:</strong>
              <span>${(() => {
                if (!selectedPatientId) return 'No appointment scheduled.';
                const reminders = store.getRemindersForPatient(selectedPatientId) || [];
                const appt = reminders.find(r => r.category === 'appointment' || r.type === 'appointment' || (r.title && (r.title.toLowerCase().includes('doctor') || r.title.toLowerCase().includes('dr.') || r.title.toLowerCase().includes('clinic'))));
                return appt ? `${appt.title} at ${appt.time} (${appt.recurrence || 'Scheduled'})` : 'No appointment scheduled.';
              })()}</span>
            </div>
          </div>

          <!-- DPDP Privacy Isolation Notice -->
          <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline/20 text-caption text-on-surface-variant flex items-start gap-2.5">
            <span class="material-symbols-outlined text-outline text-[18px] shrink-0 mt-0.5">lock</span>
            <span>
              <strong>DPDP / HIPAA Privacy Isolation:</strong> Personal photo memories, family private audio notes, and direct conversational transcripts remain confidential to ${patientSummary?.patientName || 'the patient'} and family. Only authorized adherence summaries and caregiver observations are accessible here.
            </span>
          </div>

          <!-- Caregiver Observations -->
          <div class="space-y-2">
            <h4 class="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span class="material-symbols-outlined text-secondary text-[18px]">family_restroom</span>
              <span>Caregiver Observations (${(() => {
                const pUser = (store.getState().users || []).find(u => u.id === selectedPatientId);
                return pUser?.caregiverName || 'Caregiver';
              })()})</span>
            </h4>
            <div class="space-y-1.5">
              ${(patientSummary?.caregiverObservations || ['Patient is in high spirits during morning tea.', 'Enjoys music reminiscence activities']).map(obs => `
                <div class="p-3 rounded-xl bg-surface-container-low text-body-sm border border-outline/10 flex items-start gap-2">
                  <span class="material-symbols-outlined text-outline text-[16px] shrink-0 mt-0.5">check_circle</span>
                  <span>${obs}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Doctor Observation Composer inside modal -->
          <div class="space-y-2 pt-2 border-t border-surface-container">
            <h4 class="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-[18px]">add_comment</span>
              <span>Add Quick Clinical Observation</span>
            </h4>
            <div class="flex gap-2">
              <input id="modalQuickNoteInput" type="text" placeholder="Add clinical guidance or medication/routine note..." class="flex-1 h-11 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              <button id="modalQuickNoteSubmitBtn" class="h-11 px-4 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 transition-all cursor-pointer shrink-0">
                Save
              </button>
            </div>
          </div>

        </div>

        <div class="p-4 border-t border-surface-container bg-surface-container-low flex justify-end">
          <button id="closeSummaryModalBtn2" class="px-5 py-2 rounded-xl bg-surface border border-outline/30 text-on-surface font-label-md font-semibold hover:bg-surface-container transition-all cursor-pointer">
            Close Summary
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 2: NEW PATIENT CONNECTION REQUEST -->
    <div id="newConnectionModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 hidden">
      <div class="bg-surface w-full max-w-md rounded-3xl border border-surface-container shadow-xl overflow-hidden">
        <div class="p-5 border-b border-surface-container flex items-center justify-between bg-surface-container-low">
          <h3 class="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">person_add</span>
            <span>Request Patient Connection</span>
          </h3>
          <button id="closeConnModalBtn" class="p-2 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form id="newConnForm" class="p-6 space-y-4 text-on-surface">
          <div>
            <label for="reqPatientSelect" class="block text-caption font-semibold text-on-surface mb-1">Select Patient</label>
            <select id="reqPatientSelect" required class="w-full h-11 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none">
              ${(store.getState().users || []).filter(u => u.role === 'patient').map(p => `
                <option value="${p.id}">${p.name} (${p.id}) — ${p.location || 'Assam / Shillong'}</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label for="reqPermissions" class="block text-caption font-semibold text-on-surface mb-1">Requested Care Permissions</label>
            <div class="p-3 rounded-xl bg-surface-container-low space-y-2 text-caption text-on-surface-variant border border-outline/20">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked disabled class="rounded text-primary focus:ring-primary" />
                <span>View Routine Adherence & Activity Trends</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked disabled class="rounded text-primary focus:ring-primary" />
                <span>View Shared Caregiver Summaries</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked disabled class="rounded text-primary focus:ring-primary" />
                <span>Record Clinical Observations & Guidance</span>
              </label>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-tertiary-container/20 border border-tertiary/20 text-caption text-on-tertiary-container">
            A connection request will be sent to the patient and their authorized family caregiver. Access is activated only upon their explicit approval.
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" id="closeConnModalBtn2" class="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-label-md font-semibold cursor-pointer">
              Cancel
            </button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 transition-all cursor-pointer">
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 3: VIEW SHARED REPORT DETAILS -->
    <div id="sharedReportModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 ${activeReport ? '' : 'hidden'}">
      <div class="bg-surface w-full max-w-2xl max-h-[90vh] rounded-3xl border border-surface-container shadow-xl overflow-hidden flex flex-col">
        <div class="p-5 border-b border-surface-container flex items-center justify-between bg-surface-container-low">
          <div>
            <h3 class="font-headline-sm text-lg font-bold text-on-surface">${activeReport?.title || 'Care Report Details'}</h3>
            <p class="text-caption text-on-surface-variant">Shared by ${activeReport?.sharedBy || 'Caregiver'} on ${activeReport?.sharedAt ? new Date(activeReport.sharedAt).toLocaleDateString() : ''}</p>
          </div>
          <button id="closeReportModalBtn" class="p-2 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-5 text-on-surface">
          <!-- Metrics Ribbon -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div class="p-3 rounded-xl bg-surface-container text-center">
              <span class="block text-[11px] text-on-surface-variant">Adherence Rate</span>
              <strong class="text-base text-green-700">${activeReport?.summaryMetrics?.routineAdherence || '92%'}</strong>
            </div>
            <div class="p-3 rounded-xl bg-surface-container text-center">
              <span class="block text-[11px] text-on-surface-variant">Activities Completed</span>
              <strong class="text-base text-on-surface">${activeReport?.summaryMetrics?.activitiesCompleted || 14}</strong>
            </div>
            <div class="p-3 rounded-xl bg-surface-container text-center">
              <span class="block text-[11px] text-on-surface-variant">Adaptive Level</span>
              <strong class="text-base text-on-surface">${activeReport?.summaryMetrics?.adaptiveLevel || 'Level 2'}</strong>
            </div>
            <div class="p-3 rounded-xl bg-surface-container text-center">
              <span class="block text-[11px] text-on-surface-variant">Primary Practice</span>
              <strong class="text-base text-on-surface">${activeReport?.summaryMetrics?.primaryFocus || 'Notice'}</strong>
            </div>
          </div>

          ${activeReport?.notes ? `
            <div class="p-4 rounded-2xl bg-surface-container-low border border-outline/20 space-y-2">
              <h4 class="font-headline-sm text-sm font-bold text-on-surface">Shared Clinical Preparation & Notes</h4>
              <p class="text-body-sm text-on-surface whitespace-pre-line leading-relaxed font-sans">
                ${activeReport.notes}
              </p>
            </div>
          ` : `
            <div class="p-4 rounded-2xl bg-surface-container-low border border-outline/20 space-y-2">
              <h4 class="font-headline-sm text-sm font-bold text-on-surface">SmritiAI Weekly Cognitive Context</h4>
              <p class="text-body-sm text-on-surface leading-relaxed">
                During the past 7 days, ${((store.getState().users || []).find(u => u.id === activeReport?.patientId)?.name) || 'the patient'} maintained exceptional morning hydration and music reminiscence consistency. Cognitive activities showed highest engagement in visual memory matching and singing familiar melodies.
              </p>
            </div>
          `}

          <!-- Add Note linked to this report -->
          <div class="space-y-2 pt-2 border-t border-surface-container">
            <h4 class="font-headline-sm text-sm font-bold text-on-surface">Record Clinical Review on this Report</h4>
            <div class="flex gap-2">
              <input id="reportNoteInput" type="text" placeholder="e.g. Reviewed report. Cognitive stability confirmed, recommend continuing current routine..." class="flex-1 h-11 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none" />
              <button id="reportNoteSubmitBtn" class="h-11 px-4 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 transition-all cursor-pointer shrink-0">
                Sign &amp; Save
              </button>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-surface-container bg-surface-container-low flex justify-end">
          <button id="closeReportModalBtn2" class="px-5 py-2 rounded-xl bg-surface border border-outline/30 text-on-surface font-label-md font-semibold hover:bg-surface-container cursor-pointer">
            Done
          </button>
        </div>
      </div>
    </div>

  </div>
  `;
}

function reRenderDoctorPortal() {
  const container = document.getElementById('view-content') || document.getElementById('app');
  if (container) {
    container.innerHTML = renderDoctorPortalView();
    attachDoctorPortalEvents();
  }
}

export function attachDoctorPortalEvents() {
  const currentUser = authService.getCurrentUser();
  const doctorId = currentUser?.id || currentUser?.userId || 'user-dr-sharma';
  const doctorName = currentUser?.name || 'Dr. Ananya Sharma';
  const specialization = currentUser?.specialization || 'Neurology / Cognitive Health';

  // Tab switching
  document.querySelectorAll('.doctor-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) {
        activeTab = tab;
        window.location.hash = `#/doctor-portal/${tab}`;
        reRenderDoctorPortal();
      }
    });
  });

  // Logout
  const logoutBtn = document.getElementById('doctorLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      authService.logout();
      showToast('Signed out successfully', 'info');
      window.location.hash = '#/login';
    });
  }

  // View patient summary modal
  document.querySelectorAll('.view-patient-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.getAttribute('data-view-patient');
      if (pid) {
        selectedPatientId = pid;
        reRenderDoctorPortal();
      }
    });
  });

  // Quick add note for patient
  document.querySelectorAll('.quick-add-note-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.getAttribute('data-add-note-for');
      activeTab = 'notes';
      window.location.hash = '#/doctor-portal/notes';
      reRenderDoctorPortal();
      const select = document.getElementById('notePatientSelect');
      if (select && pid) select.value = pid;
    });
  });

  // Close summary modal
  const closeSummaryBtn = document.getElementById('closeSummaryModalBtn');
  const closeSummaryBtn2 = document.getElementById('closeSummaryModalBtn2');
  [closeSummaryBtn, closeSummaryBtn2].forEach(b => {
    b?.addEventListener('click', () => {
      selectedPatientId = null;
      reRenderDoctorPortal();
    });
  });

  // Modal quick note submit
  const modalQuickNoteBtn = document.getElementById('modalQuickNoteSubmitBtn');
  const modalQuickNoteInput = document.getElementById('modalQuickNoteInput');
  if (modalQuickNoteBtn && modalQuickNoteInput) {
    modalQuickNoteBtn.addEventListener('click', () => {
      const text = modalQuickNoteInput.value.trim();
      if (!text || text.length < 3) {
        showToast('Please enter at least 3 characters for the observation note.', 'warning');
        return;
      }

      const res = doctorService.addDoctorNote({
        patientId: selectedPatientId || 'user-asha',
        doctorId,
        doctorName,
        specialization,
        noteText: text,
        noteType: NOTE_TYPES.OBSERVATION
      });

      if (res.success) {
        showToast('Clinical observation saved with provenance.', 'celebration');
        modalQuickNoteInput.value = '';
        selectedPatientId = null;
        reRenderDoctorPortal();
      } else {
        showToast(res.error || 'Failed to add observation.', 'error');
      }
    });
  }

  // Open & close shared report modal
  document.querySelectorAll('.open-report-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const repId = btn.getAttribute('data-open-report');
      if (repId) {
        viewingReportId = repId;
        reRenderDoctorPortal();
      }
    });
  });

  const closeReportBtn = document.getElementById('closeReportModalBtn');
  const closeReportBtn2 = document.getElementById('closeReportModalBtn2');
  [closeReportBtn, closeReportBtn2].forEach(b => {
    b?.addEventListener('click', () => {
      viewingReportId = null;
      reRenderDoctorPortal();
    });
  });

  // Sign & save report note
  const reportNoteSubmitBtn = document.getElementById('reportNoteSubmitBtn');
  const reportNoteInput = document.getElementById('reportNoteInput');
  if (reportNoteSubmitBtn && reportNoteInput) {
    reportNoteSubmitBtn.addEventListener('click', () => {
      const text = reportNoteInput.value.trim();
      if (!text || text.length < 3) {
        showToast('Please enter an observation note.', 'warning');
        return;
      }

      const activeRep = viewingReportId ? doctorService.getSharedReportDetails(viewingReportId, doctorId) : null;
      const pid = activeRep?.patientId || selectedPatientId || 'user-asha';

      const res = doctorService.addDoctorNote({
        patientId: pid,
        doctorId,
        doctorName,
        specialization,
        noteText: text,
        noteType: NOTE_TYPES.FOLLOW_UP,
        reportId: viewingReportId
      });

      if (res.success) {
        showToast('Report review and clinical note saved.', 'celebration');
        viewingReportId = null;
        reRenderDoctorPortal();
      } else {
        showToast(res.error || 'Failed to save note.', 'error');
      }
    });
  }

  // Connection management: Approve, Reject, Cancel
  document.querySelectorAll('[data-approve-conn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const connId = btn.getAttribute('data-approve-conn');
      if (connId) {
        const res = doctorService.updateConnectionStatus(connId, CONNECTION_STATUS.APPROVED, doctorId, 'doctor');
        if (res.success) {
          showToast('Connection approved successfully.', 'celebration');
          reRenderDoctorPortal();
        } else {
          showToast(res.error || 'Failed to approve connection.', 'error');
        }
      }
    });
  });

  document.querySelectorAll('[data-reject-conn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const connId = btn.getAttribute('data-reject-conn');
      if (connId) {
        const res = doctorService.updateConnectionStatus(connId, CONNECTION_STATUS.REJECTED, doctorId, 'doctor');
        if (res.success) {
          showToast('Connection request declined.', 'info');
          reRenderDoctorPortal();
        } else {
          showToast(res.error || 'Failed to decline connection.', 'error');
        }
      }
    });
  });

  document.querySelectorAll('[data-cancel-conn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const connId = btn.getAttribute('data-cancel-conn');
      if (connId) {
        const res = doctorService.revokeConnection(connId, doctorId);
        if (res.success) {
          showToast('Connection request withdrawn.', 'info');
          reRenderDoctorPortal();
        } else {
          showToast(res.error || 'Failed to withdraw request.', 'error');
        }
      }
    });
  });

  // New connection modal handlers
  const openConnBtn = document.getElementById('openNewConnectionModalBtn');
  const connModal = document.getElementById('newConnectionModal');
  const closeConnBtn = document.getElementById('closeConnModalBtn');
  const closeConnBtn2 = document.getElementById('closeConnModalBtn2');
  const newConnForm = document.getElementById('newConnForm');

  if (openConnBtn && connModal) {
    openConnBtn.addEventListener('click', () => {
      connModal.classList.remove('hidden');
    });
  }

  [closeConnBtn, closeConnBtn2].forEach(b => {
    b?.addEventListener('click', () => {
      connModal?.classList.add('hidden');
    });
  });

  if (newConnForm) {
    newConnForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const patientSelect = document.getElementById('reqPatientSelect');
      const pid = patientSelect?.value || 'user-asha';
      const allUsers = store.getState().users || [];
      const selectedPatient = allUsers.find(u => u.id === pid);

      const res = doctorService.requestConnection({
        doctorId,
        patientId: pid,
        doctorName,
        doctorSpecialization: specialization,
        doctorHospital: currentUser?.hospital || 'Hospital Practice',
        patientName: selectedPatient ? selectedPatient.name : 'Patient'
      });

      if (res.success) {
        showToast(res.message || 'Connection request registered.', 'celebration');
        connModal?.classList.add('hidden');
        reRenderDoctorPortal();
      } else {
        showToast(res.error || 'Failed to send request.', 'warning');
      }
    });
  }

  // Doctor note form submit
  const noteForm = document.getElementById('doctorNoteForm');
  if (noteForm) {
    noteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pSelect = document.getElementById('notePatientSelect');
      const tSelect = document.getElementById('noteTypeSelect');
      const textInput = document.getElementById('noteTextInput');

      const pid = pSelect?.value || 'user-asha';
      const type = tSelect?.value || NOTE_TYPES.OBSERVATION;
      const text = textInput?.value?.trim() || '';

      const res = doctorService.addDoctorNote({
        patientId: pid,
        doctorId,
        doctorName,
        specialization,
        noteText: text,
        noteType: type
      });

      if (res.success) {
        showToast('Clinical observation saved with immutable attribution.', 'celebration');
        textInput.value = '';
        reRenderDoctorPortal();
      } else {
        showToast(res.error || 'Failed to save note.', 'error');
      }
    });
  }

  // Doctor profile form submit
  const profileForm = document.getElementById('doctorProfileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('profDoctorName')?.value?.trim();
      const spec = document.getElementById('profDoctorSpecialization')?.value?.trim();
      const hosp = document.getElementById('profDoctorHospital')?.value?.trim();
      const city = document.getElementById('profDoctorCity')?.value?.trim();
      const phone = document.getElementById('profDoctorPhone')?.value?.trim();
      const license = document.getElementById('profDoctorLicense')?.value?.trim();
      const bio = document.getElementById('profDoctorBio')?.value?.trim();

      const res = doctorService.updateDoctorProfile(doctorId, {
        name,
        specialization: spec,
        hospital: hosp,
        city,
        phone,
        licenseId: license,
        bio
      });

      if (res.success) {
        showToast('Doctor profile updated successfully.', 'celebration');
        reRenderDoctorPortal();
      } else {
        showToast(res.error || 'Failed to update profile.', 'error');
      }
    });
  }
}
