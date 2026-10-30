// MindMitra Patient-Facing "My Doctors" View
// Calm, accessible doctor directory with voice readout, linked appointments, and consent autonomy
// Adheres strictly to Stitch design language and elder-friendly ergonomics

import { store } from '../state/store.js';
import { doctorService, CONNECTION_STATUS } from '../services/doctorService.js';
import { voiceService } from '../services/voiceService.js';
import { showToast } from '../components/Toast.js';

export function renderMyDoctorsView() {
  const patientId = store.getCurrentPatientId();
  const state = store.getState();
  const patient = state.currentUser || state.profile || { name: 'Asha Devi' };
  const patientFirstName = patient?.name ? patient.name.split(' ')[0] : 'Patient';

  const connections = doctorService.getPatientConnections(patientId);
  const approvedDocs = connections.filter(c => c.status === CONNECTION_STATUS.APPROVED);
  const pendingDocs = connections.filter(c => c.status === CONNECTION_STATUS.PENDING);

  return `
  <main class="w-full pt-20 bg-surface min-h-[calc(100vh-140px)] font-sans">
    <div class="max-w-7xl mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl">
      
      <!-- Top Navigation / Breadcrumb -->
      <div class="flex flex-wrap items-center justify-between gap-space-sm mb-space-lg">
        <a href="#/patient-home" class="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all text-label-lg font-label-lg group shadow-xs">
          <span class="material-symbols-outlined text-[22px] transition-transform group-hover:-translate-x-1">arrow_back</span>
          <span>Return to Home</span>
        </a>
        <div class="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-tertiary-fixed/30 text-tertiary">
          <span class="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
          <span class="font-label-md text-label-md">${approvedDocs.length} Connected Healthcare Professionals</span>
        </div>
      </div>

      <!-- Hero Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-space-xl shadow-xs mb-space-xl border border-surface-container">
        <div class="max-w-2xl space-y-2">
          <div class="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-primary-container/30 text-primary font-caption text-caption font-bold">
            <span class="material-symbols-outlined text-[16px]">medical_services</span>
            <span>Healthcare & Care Team</span>
          </div>
          <h1 class="font-headline-lg text-headline-lg text-on-surface font-bold">${patientFirstName}'s Doctors & Specialists</h1>
          <p class="font-body-lg text-body-lg text-on-surface-variant">
            Authorized medical professionals supporting your memory journey, routine rhythm, and gentle care.
          </p>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="space-y-8">
        
        <!-- Connected Doctors Section -->
        <div>
          <div class="flex items-center justify-between mb-space-md">
            <h2 class="font-headline-md text-xl font-bold text-on-surface flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[24px]">verified</span>
              <span>Authorized Doctors</span>
            </h2>
          </div>

          ${approvedDocs.length === 0 ? `
            <div class="p-10 rounded-3xl bg-surface-container-low border border-dashed border-outline/30 text-center space-y-2">
              <span class="material-symbols-outlined text-outline text-[44px]">stethoscope</span>
              <p class="font-headline-sm text-lg text-on-surface">No doctors connected yet.</p>
              <p class="text-body-sm text-on-surface-variant">Your caregiver or clinic can link your healthcare professional to review routine wellness summaries.</p>
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              ${approvedDocs.map(doc => {
                const docProfile = doctorService.getDoctorProfile(doc.doctorId) || {};
                const docCity = docProfile.city || doc.doctorCity || 'Shillong, Meghalaya';
                const docPhone = docProfile.phone || doc.doctorPhone || '+91 98320 14567';
                const allReminders = store.getRemindersForPatient(patientId) || [];
                const patientAppointments = allReminders.filter(r => r.category === 'appointment' || r.type === 'appointment' || (r.title && (r.title.toLowerCase().includes('doctor') || r.title.toLowerCase().includes('dr.') || r.title.toLowerCase().includes('clinic'))));
                const docAppt = patientAppointments[0];
                const apptTitle = docAppt ? docAppt.title : 'No appointment scheduled.';
                const apptDetail = docAppt ? `${docAppt.time} • ${docAppt.recurrence || 'Scheduled'} (${doc.doctorHospital || 'Clinic'})` : 'Contact your clinic or caregiver to schedule your routine review.';

                return `
                <div class="p-6 sm:p-7 rounded-3xl bg-surface-container-low border border-outline/20 hover:border-primary/40 transition-all flex flex-col justify-between space-y-6 shadow-xs">
                  
                  <div class="space-y-4">
                    <!-- Doctor Header -->
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-center gap-3.5">
                        <div class="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container font-bold text-xl flex items-center justify-center border border-primary/20 shrink-0">
                          ${doc.doctorName.split(' ').filter(n => !n.startsWith('Dr.')).map(n => n[0]).slice(0, 2).join('') || 'DR'}
                        </div>
                        <div>
                          <div class="flex items-center gap-1.5">
                            <h3 class="font-headline-md text-xl font-bold text-on-surface">${doc.doctorName}</h3>
                            <span class="material-symbols-outlined text-primary text-[20px]" title="Authorized Connection">verified</span>
                          </div>
                          <p class="text-body-sm font-medium text-tertiary">${doc.doctorSpecialization || 'Neurology / Cognitive Health'}</p>
                        </div>
                      </div>

                      <span class="px-3 py-1 rounded-full text-caption font-bold bg-green-50 text-green-700 border border-green-200 shrink-0">
                        Active Access
                      </span>
                    </div>

                    <!-- Hospital & Contact Info -->
                    <div class="p-4 rounded-2xl bg-surface space-y-2 text-body-sm text-on-surface-variant border border-outline/10">
                      <div class="flex items-center gap-2.5">
                        <span class="material-symbols-outlined text-outline text-[18px]">domain</span>
                        <span class="text-on-surface font-medium">${doc.doctorHospital || 'Shillong Medical Centre'}</span>
                      </div>
                      <div class="flex items-center gap-2.5">
                        <span class="material-symbols-outlined text-outline text-[18px]">location_on</span>
                        <span>${docCity}</span>
                      </div>
                      <div class="flex items-center gap-2.5">
                        <span class="material-symbols-outlined text-outline text-[18px]">call</span>
                        <a href="tel:${docPhone.replace(/\s+/g, '')}" class="text-primary font-bold hover:underline">${docPhone}</a>
                      </div>
                    </div>

                    <!-- Next Follow-up Context -->
                    <div class="p-4 rounded-2xl bg-secondary-container/20 border border-secondary/20 space-y-3 text-body-sm text-on-secondary-container">
                      <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">calendar_month</span>
                        <div>
                          <span class="text-caption font-bold text-secondary uppercase tracking-wider block">Doctor Appointment</span>
                          <p class="font-bold text-base text-on-surface">${apptTitle}</p>
                          <p class="text-caption text-on-surface-variant">${apptDetail}</p>
                        </div>
                      </div>
                      ${docAppt ? `
                        <div class="flex items-center gap-2 pt-1">
                          <a href="#/appointment-prep" class="flex-1 py-2 px-3 rounded-xl bg-secondary text-on-secondary text-caption font-bold text-center flex items-center justify-center gap-1.5 shadow-2xs hover:bg-secondary/90 transition-all no-underline">
                            <span class="material-symbols-outlined text-[16px]">assignment_turned_in</span>
                            <span>Prepare for Visit</span>
                          </a>
                          <a href="#/appointment-prep" class="py-2 px-3 rounded-xl bg-surface border border-outline/30 text-on-surface text-caption font-semibold text-center flex items-center justify-center gap-1 hover:bg-surface-container transition-all no-underline">
                            <span>View Preparation</span>
                          </a>
                        </div>
                      ` : ''}
                    </div>

                    <!-- Privacy & Consent Notice -->
                    <div class="text-[12px] text-on-surface-variant flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-outline text-[16px]">lock</span>
                      <span>Permissions: Cognitive adherence & care reports. Personal photo memories remain strictly private.</span>
                    </div>
                  </div>

                  <!-- Actions: Voice Readout & Call Doctor -->
                  <div class="flex flex-wrap items-center gap-2 pt-4 border-t border-surface-container">
                    ${docAppt ? `
                      <a 
                        href="#/appointment-prep" 
                        class="flex-1 min-w-[140px] h-12 px-4 rounded-2xl bg-secondary text-on-secondary font-label-md font-bold hover:bg-secondary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs no-underline"
                      >
                        <span class="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                        <span>Prepare for Visit</span>
                      </a>
                    ` : ''}
                    <button 
                      data-speak-doctor="${doc.doctorName}. ${doc.doctorSpecialization} at ${doc.doctorHospital}. Location: ${docCity}. Phone number: ${docPhone}. Clinical Appointment: ${apptTitle}." 
                      class="speak-doc-btn flex-1 min-w-[140px] h-12 px-4 rounded-2xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span class="material-symbols-outlined text-[20px]">volume_up</span>
                      <span>Listen to Details</span>
                    </button>

                    <button 
                      data-revoke-doc="${doc.id}" 
                      class="revoke-doc-btn h-12 px-3.5 rounded-2xl bg-surface-container border border-outline/30 text-on-surface-variant hover:text-error hover:border-error/40 transition-all flex items-center justify-center gap-1.5 font-label-sm font-semibold cursor-pointer" 
                      title="Revoke Doctor Access"
                    >
                      <span class="material-symbols-outlined text-[18px]">person_remove</span>
                      <span>Consent</span>
                    </button>
                  </div>

                </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Pending Connections Notice if any -->
        ${pendingDocs.length > 0 ? `
          <div class="p-6 rounded-3xl bg-amber-500/10 border border-amber-300/30 space-y-3">
            <h3 class="font-headline-sm text-base font-bold text-amber-950 flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px]">hourglass_empty</span>
              <span>Pending Connection Requests (${pendingDocs.length})</span>
            </h3>
            <div class="space-y-2">
              ${pendingDocs.map(p => `
                <div class="p-4 rounded-2xl bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-outline/20">
                  <div>
                    <strong class="text-on-surface">${p.doctorName}</strong>
                    <p class="text-caption text-on-surface-variant">${p.doctorSpecialization} • ${p.doctorHospital}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button data-patient-approve-conn="${p.id}" class="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-caption font-bold hover:bg-primary/90 transition-all cursor-pointer">Authorize</button>
                    <button data-patient-reject-conn="${p.id}" class="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface text-caption font-semibold hover:bg-surface-container-high transition-all cursor-pointer">Decline</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Informational Banner -->
        <div class="p-6 rounded-3xl bg-surface-container-low border border-outline/20 flex items-start gap-4">
          <div class="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[24px]">info</span>
          </div>
          <div class="space-y-1 text-body-sm text-on-surface-variant">
            <p class="font-bold text-on-surface">Doctor Access Autonomy</p>
            <p class="leading-relaxed">
              You and your caregiver have full control over who has access to your wellness reports. Access can be suspended or revoked at any time. MindMitra does not share confidential memories, photos, or voice notes with third parties.
            </p>
          </div>
        </div>

      </div>

    </div>
  </main>
  `;
}

function reRenderMyDoctors() {
  const container = document.getElementById('view-content') || document.getElementById('app');
  if (container) {
    container.innerHTML = renderMyDoctorsView();
    attachMyDoctorsEvents();
  }
}

export function attachMyDoctorsEvents() {
  // Voice readout
  document.querySelectorAll('.speak-doc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-speak-doctor');
      if (text) {
        voiceService.speak(text);
        showToast('Reading doctor information aloud...', 'info');
      }
    });
  });

  // Patient approve connection
  document.querySelectorAll('[data-patient-approve-conn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const connId = btn.getAttribute('data-patient-approve-conn');
      if (!connId) return;
      const res = doctorService.updateConnectionStatus(connId, CONNECTION_STATUS.APPROVED, store.getCurrentPatientId(), 'patient');
      if (res.success) {
        showToast('Doctor access authorized.', 'celebration');
        reRenderMyDoctors();
      } else {
        showToast(res.error || 'Failed to authorize doctor.', 'error');
      }
    });
  });

  // Patient reject connection
  document.querySelectorAll('[data-patient-reject-conn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const connId = btn.getAttribute('data-patient-reject-conn');
      if (!connId) return;
      const res = doctorService.updateConnectionStatus(connId, CONNECTION_STATUS.REJECTED, store.getCurrentPatientId(), 'patient');
      if (res.success) {
        showToast('Doctor connection request declined.', 'info');
        reRenderMyDoctors();
      } else {
        showToast(res.error || 'Failed to decline request.', 'error');
      }
    });
  });

  // Revoke consent
  document.querySelectorAll('.revoke-doc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const connId = btn.getAttribute('data-revoke-doc');
      if (!connId) return;

      const confirmed = window.confirm('Are you sure you want to revoke this doctor\'s access to your care reports? You can re-authorize them at any time.');
      if (confirmed) {
        const res = doctorService.updateConnectionStatus(connId, CONNECTION_STATUS.REVOKED, store.getCurrentPatientId(), 'patient');
        if (res.success) {
          showToast('Doctor access revoked.', 'info');
          reRenderMyDoctors();
        } else {
          showToast(res.error || 'Failed to revoke access.', 'error');
        }
      }
    });
  });
}
