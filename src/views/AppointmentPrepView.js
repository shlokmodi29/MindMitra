// MindMitra Doctor Appointment Prep View
// Provides a warm, elder-friendly preparation workflow for clinical visits.
// Strictly non-diagnostic, privacy-first, with explicit consent for doctor sharing.

import { store } from '../state/store.js';
import { appointmentPrepService, QUESTION_STATUS } from '../services/appointmentPrepService.js';
import { doctorService, CONNECTION_STATUS } from '../services/doctorService.js';
import { memoryService } from '../services/memoryService.js';
import { voiceService } from '../services/voiceService.js';
import { i18nService } from '../services/i18nService.js';
import { showToast } from '../components/Toast.js';

let activeFilter = 'all'; // 'all' | 'pending' | 'discussed'
let isVoiceListening = false;
let activeVoiceTarget = null; // 'remember' | 'question'

export function renderAppointmentPrepView() {
  const patientId = store.getCurrentPatientId ? store.getCurrentPatientId() : 'user-asha';
  const patient = (store.state.users || []).find(u => u.id === patientId) || { name: 'Asha Devi' };
  const appt = appointmentPrepService.getUpcomingDoctorAppointment(patientId);
  const apptId = appt ? appt.id : 'rtn-doc-1';
  const prep = appointmentPrepService.getAppointmentPrep(apptId, patientId);

  const doctorConnections = doctorService.getPatientConnections(patientId) || [];
  const approvedDocs = doctorConnections.filter(c => c.status === CONNECTION_STATUS.APPROVED);
  const selectedDoc = approvedDocs.find(d => d.doctorId === prep.doctorId) || approvedDocs[0] || {
    doctorId: 'user-dr-sharma',
    doctorName: 'Dr. Ananya Sharma',
    doctorHospital: 'Shillong Medical Centre',
    doctorSpecialization: 'Neurology / Cognitive Health'
  };

  const activitySummary = appointmentPrepService.getActivitySummary(patientId);
  const careSummary = appointmentPrepService.getDailyCareSummary(patientId);
  const caregiverObs = appointmentPrepService.getCaregiverObservations(patientId);
  const patientMemories = (memoryService.getMemories ? memoryService.getMemories(patientId) : []) || [];

  const questions = prep.questions || [];
  const filteredQuestions = questions.filter(q => {
    if (activeFilter === 'pending') return q.status === QUESTION_STATUS.PENDING;
    if (activeFilter === 'discussed') return q.status === QUESTION_STATUS.DISCUSSED;
    return true;
  });

  const pendingCount = questions.filter(q => q.status === QUESTION_STATUS.PENDING).length;
  const discussedCount = questions.filter(q => q.status === QUESTION_STATUS.DISCUSSED).length;

  const currentLang = store.getState().currentLanguage || 'en';

  return `
  <main class="w-full pt-20 bg-surface min-h-screen pb-28 text-on-surface">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Top Navigation & Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <a href="#/my-doctors" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all font-label-md shadow-xs no-underline">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>My Doctors</span>
          </a>
          <a href="#/my-day" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all font-label-md shadow-xs no-underline">
            <span class="material-symbols-outlined text-[20px]">wb_sunny</span>
            <span>My Day</span>
          </a>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- Voice Readout Button -->
          <button id="hearPrepBtn" class="px-4 py-2 rounded-2xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 flex items-center gap-2 shadow-xs cursor-pointer transition-all active:scale-98">
            <span class="material-symbols-outlined text-[20px]">volume_up</span>
            <span>Hear Preparation</span>
          </button>
          
          <button id="stopHearPrepBtn" class="hidden px-4 py-2 rounded-2xl bg-error-container text-on-error-container font-label-md font-bold flex items-center gap-2 cursor-pointer">
            <span class="material-symbols-outlined text-[20px]">stop_circle</span>
            <span>Stop Audio</span>
          </button>

          <!-- Share with Doctor Button -->
          <button id="openShareModalBtn" class="px-4 py-2 rounded-2xl ${prep.sharedWithDoctor ? 'bg-secondary text-on-secondary' : 'bg-primary-container text-on-primary-container border border-primary/30'} font-label-md font-bold hover:opacity-90 flex items-center gap-2 shadow-xs cursor-pointer transition-all">
            <span class="material-symbols-outlined text-[20px]">${prep.sharedWithDoctor ? 'verified' : 'send'}</span>
            <span>${prep.sharedWithDoctor ? 'Shared with Doctor' : 'Share with Doctor'}</span>
          </button>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- SECTION 1: APPOINTMENT DETAILS                                    -->
      <!-- ================================================================= -->
      <section class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-container-lowest to-surface-container border border-outline/20 shadow-sm relative overflow-hidden">
        <div class="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary/5 pointer-events-none"></div>
        
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div class="space-y-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-3 py-1 rounded-full text-caption font-bold bg-primary-container text-on-primary-container">
                📅 Doctor Appointment
              </span>
              <span class="px-3 py-1 rounded-full text-caption font-semibold bg-surface-container-high text-on-surface-variant">
                ${prep.appointmentType || 'Routine Wellness Review'}
              </span>
              ${prep.sharedWithDoctor ? `
                <span class="px-3 py-1 rounded-full text-caption font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">check</span> Shared with Clinic
                </span>
              ` : `
                <span class="px-3 py-1 rounded-full text-caption font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  Private Draft
                </span>
              `}
            </div>

            <h1 class="font-headline-lg text-2xl sm:text-3xl font-extrabold text-on-surface">
              ${prep.doctorName || 'Dr. Ananya Sharma'}
            </h1>
            <p class="text-body-md text-tertiary font-semibold flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px]">medical_services</span>
              <span>${selectedDoc.doctorSpecialization || 'Neurology / Cognitive Health'}</span>
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-outline/20">
            <div class="p-4 rounded-2xl bg-surface border border-outline/10 text-left">
              <span class="text-caption text-on-surface-variant block font-medium">Date</span>
              <strong class="text-body-lg font-bold text-on-surface">${prep.date || '10 September 2026'}</strong>
            </div>
            <div class="p-4 rounded-2xl bg-surface border border-outline/10 text-left">
              <span class="text-caption text-on-surface-variant block font-medium">Time</span>
              <strong class="text-body-lg font-bold text-primary">${prep.time || '11:00 AM'}</strong>
            </div>
            <div class="p-4 rounded-2xl bg-surface border border-outline/10 text-left">
              <span class="text-caption text-on-surface-variant block font-medium">Location</span>
              <strong class="text-body-md font-bold text-on-surface truncate block" title="${prep.clinic || selectedDoc.doctorHospital}">
                ${prep.clinic || selectedDoc.doctorHospital || 'Shillong Medical Centre'}
              </strong>
            </div>
          </div>
        </div>

        <!-- Reassurance Banner -->
        <div class="mt-6 p-4 rounded-2xl bg-secondary-container/30 border border-secondary/20 flex items-center gap-3 text-body-sm text-on-secondary-container">
          <span class="material-symbols-outlined text-secondary text-[24px] shrink-0">spa</span>
          <p>
            <strong>Calm Reminder:</strong> Take your time. This appointment is a routine consultation to support comfort and everyday wellness. No tests or diagnostics are performed here.
          </p>
        </div>
      </section>

      <!-- Grid Layout: Left Column (Patient preparation), Right Column (Clinical context & summaries) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- LEFT COLUMN: Patient & Caregiver Interactive Prep (7 Cols) -->
        <div class="lg:col-span-7 space-y-8">
          
          <!-- =============================================================== -->
          <!-- SECTION 2: THINGS TO REMEMBER (+ VOICE INPUT WITH PREVIEW)      -->
          <!-- =============================================================== -->
          <section class="p-6 sm:p-7 rounded-3xl bg-surface-container-low border border-outline/20 space-y-5">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <span class="material-symbols-outlined text-primary text-[24px]">lightbulb</span>
                <h2 class="font-headline-md text-xl font-bold text-on-surface">Things to Remember</h2>
              </div>
              <span class="text-caption font-semibold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
                ${prep.thingsToRemember?.length || 0} items
              </span>
            </div>

            <!-- List of Items -->
            <div class="space-y-2.5" id="rememberList">
              ${(prep.thingsToRemember || []).map((item, idx) => `
                <div class="p-3.5 rounded-2xl bg-surface border border-outline/15 flex items-center justify-between gap-3 hover:border-primary/30 transition-all">
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="w-6 h-6 rounded-full bg-primary-container text-on-primary-container text-caption font-bold flex items-center justify-center shrink-0">
                      ${idx + 1}
                    </span>
                    <span class="text-body-md text-on-surface leading-snug break-words">${item}</span>
                  </div>
                  <button class="remove-remember-btn p-1.5 rounded-xl hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-colors cursor-pointer shrink-0" data-index="${idx}" title="Remove reminder">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              `).join('')}
            </div>

            <!-- Add Item Composer with Voice STT -->
            <form id="addRememberForm" class="space-y-3 pt-2">
              <div class="flex items-center gap-2">
                <input 
                  type="text" 
                  id="rememberInput" 
                  placeholder="e.g. Mention morning sleep rhythm or medicine timings..." 
                  class="flex-1 h-12 px-4 rounded-2xl bg-surface border border-outline/30 text-on-surface text-body-md focus:ring-2 focus:ring-primary focus:outline-none"
                  autocomplete="off"
                />
                
                <!-- Voice Input Button -->
                <button 
                  type="button" 
                  id="voiceRememberBtn" 
                  class="h-12 w-12 rounded-2xl bg-surface-container-high border border-outline/30 text-primary hover:bg-primary-container flex items-center justify-center cursor-pointer transition-all"
                  title="Speak to add reminder"
                >
                  <span class="material-symbols-outlined text-[22px]">mic</span>
                </button>

                <button 
                  type="submit" 
                  class="h-12 px-5 rounded-2xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  Add
                </button>
              </div>
            </form>
          </section>

          <!-- =============================================================== -->
          <!-- SECTION 3: QUESTIONS FOR DOCTOR (STATUS FILTER & TOGGLES)       -->
          <!-- =============================================================== -->
          <section class="p-6 sm:p-7 rounded-3xl bg-surface-container-low border border-outline/20 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <span class="material-symbols-outlined text-secondary text-[24px]">help_outline</span>
                <h2 class="font-headline-md text-xl font-bold text-on-surface">Questions for Doctor</h2>
              </div>

              <!-- Filter Pills -->
              <div class="flex items-center gap-1 bg-surface-container p-1 rounded-2xl text-caption font-semibold">
                <button class="filter-q-btn px-3 py-1 rounded-xl transition-all cursor-pointer ${activeFilter === 'all' ? 'bg-surface text-primary font-bold shadow-xs' : 'text-on-surface-variant'}" data-filter="all">
                  All (${questions.length})
                </button>
                <button class="filter-q-btn px-3 py-1 rounded-xl transition-all cursor-pointer ${activeFilter === 'pending' ? 'bg-surface text-primary font-bold shadow-xs' : 'text-on-surface-variant'}" data-filter="pending">
                  Pending (${pendingCount})
                </button>
                <button class="filter-q-btn px-3 py-1 rounded-xl transition-all cursor-pointer ${activeFilter === 'discussed' ? 'bg-surface text-primary font-bold shadow-xs' : 'text-on-surface-variant'}" data-filter="discussed">
                  Discussed (${discussedCount})
                </button>
              </div>
            </div>

            <!-- Questions List -->
            <div class="space-y-3" id="questionsList">
              ${filteredQuestions.length === 0 ? `
                <div class="p-6 rounded-2xl bg-surface text-center text-on-surface-variant text-body-sm">
                  No questions match this filter. Add questions below or ask SmritiAI for suggestions.
                </div>
              ` : filteredQuestions.map(q => {
                const isDiscussed = q.status === QUESTION_STATUS.DISCUSSED;
                return `
                <div class="p-4 rounded-2xl ${isDiscussed ? 'bg-surface/50 border border-green-200' : 'bg-surface border border-outline/20 shadow-xs'} flex items-start justify-between gap-3 transition-all">
                  <div class="flex items-start gap-3 min-w-0">
                    <button class="toggle-q-btn mt-0.5 w-6 h-6 rounded-full border-2 ${isDiscussed ? 'bg-green-600 border-green-600 text-white' : 'border-outline/50 hover:border-primary'} flex items-center justify-center shrink-0 cursor-pointer" data-id="${q.id}" title="${isDiscussed ? 'Mark pending' : 'Mark discussed'}">
                      ${isDiscussed ? '<span class="material-symbols-outlined text-[16px]">check</span>' : ''}
                    </button>
                    <div>
                      <p class="text-body-md ${isDiscussed ? 'line-through text-on-surface-variant' : 'text-on-surface font-medium'} leading-snug">
                        ${q.text}
                      </p>
                      <span class="text-caption text-on-surface-variant mt-1 inline-block">
                        Status: <strong class="${isDiscussed ? 'text-green-700' : 'text-amber-700'}">${isDiscussed ? 'Discussed with Doctor' : 'Pending Question'}</strong>
                      </span>
                    </div>
                  </div>

                  <button class="delete-q-btn p-1.5 rounded-xl hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-colors cursor-pointer shrink-0" data-id="${q.id}" title="Delete question">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
                `;
              }).join('')}
            </div>

            <!-- Add Question Form -->
            <form id="addQuestionForm" class="space-y-3 pt-2">
              <div class="flex items-center gap-2">
                <input 
                  type="text" 
                  id="questionInput" 
                  placeholder="Ask about routine, comfort, or daily activities..." 
                  class="flex-1 h-12 px-4 rounded-2xl bg-surface border border-outline/30 text-on-surface text-body-md focus:ring-2 focus:ring-primary focus:outline-none"
                  autocomplete="off"
                />

                <button 
                  type="button" 
                  id="voiceQuestionBtn" 
                  class="h-12 w-12 rounded-2xl bg-surface-container-high border border-outline/30 text-secondary hover:bg-secondary-container flex items-center justify-center cursor-pointer transition-all"
                  title="Speak to add question"
                >
                  <span class="material-symbols-outlined text-[22px]">mic</span>
                </button>

                <button 
                  type="submit" 
                  class="h-12 px-5 rounded-2xl bg-secondary text-on-secondary font-label-md font-bold hover:bg-secondary/90 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  Add
                </button>
              </div>
            </form>
          </section>

          <!-- =============================================================== -->
          <!-- SECTION 9: SMRITIAI APPOINTMENT HELP                           -->
          <!-- =============================================================== -->
          <section class="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-tertiary-container/30 to-surface-container-low border border-tertiary/20 space-y-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <span class="material-symbols-outlined text-tertiary text-[24px]">psychology</span>
                <div>
                  <h3 class="font-headline-sm text-lg font-bold text-on-surface">SmritiAI Preparation Companion</h3>
                  <p class="text-caption text-on-surface-variant">Gentle question ideas based on your recent routine.</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-caption font-bold bg-tertiary-container text-on-tertiary-container">
                Non-Diagnostic
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button class="suggest-q-btn p-3.5 rounded-2xl bg-surface border border-outline/15 hover:border-tertiary text-left transition-all cursor-pointer group shadow-2xs" data-q="How can we adapt afternoon tea time and quiet reading to help with calm evenings?">
                <div class="flex items-start gap-2">
                  <span class="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform">add_circle</span>
                  <span class="text-body-sm text-on-surface font-medium">Afternoon rest & evening calm rhythm</span>
                </div>
              </button>

              <button class="suggest-q-btn p-3.5 rounded-2xl bg-surface border border-outline/15 hover:border-tertiary text-left transition-all cursor-pointer group shadow-2xs" data-q="What gentle exercises or morning walks support focus and joint comfort?">
                <div class="flex items-start gap-2">
                  <span class="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform">add_circle</span>
                  <span class="text-body-sm text-on-surface font-medium">Gentle morning movement & walking</span>
                </div>
              </button>

              <button class="suggest-q-btn p-3.5 rounded-2xl bg-surface border border-outline/15 hover:border-tertiary text-left transition-all cursor-pointer group shadow-2xs" data-q="Are our current hydration intervals suitable for hot weather in Shillong?">
                <div class="flex items-start gap-2">
                  <span class="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform">add_circle</span>
                  <span class="text-body-sm text-on-surface font-medium">Hydration rhythm review</span>
                </div>
              </button>

              <button class="suggest-q-btn p-3.5 rounded-2xl bg-surface border border-outline/15 hover:border-tertiary text-left transition-all cursor-pointer group shadow-2xs" data-q="How can family storytelling with photo memories best support joyful connection?">
                <div class="flex items-start gap-2">
                  <span class="material-symbols-outlined text-tertiary text-[18px] shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform">add_circle</span>
                  <span class="text-body-sm text-on-surface font-medium">Family photo reminiscence tips</span>
                </div>
              </button>
            </div>
          </section>

          <!-- =============================================================== -->
          <!-- SECTION 7: MEMORY CONTEXT FOR DOCTOR (OPTIONAL)                 -->
          <!-- =============================================================== -->
          <section class="p-6 sm:p-7 rounded-3xl bg-surface-container-low border border-outline/20 space-y-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <span class="material-symbols-outlined text-primary text-[24px]">auto_stories</span>
                <div>
                  <h3 class="font-headline-sm text-lg font-bold text-on-surface">Relevant Memory Context</h3>
                  <p class="text-caption text-on-surface-variant">Select memory topics you would like to mention during consultation.</p>
                </div>
              </div>
              <span class="text-caption px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">Optional</span>
            </div>

            <p class="text-caption text-on-surface-variant">
              🔒 <strong>Privacy Assurance:</strong> Personal family photos and voice recordings remain completely private. Only titles of selected memories are referenced.
            </p>

            <div class="space-y-2.5">
              ${patientMemories.slice(0, 4).map(m => {
                const isSelected = (prep.selectedMemoryIds || []).includes(m.id);
                return `
                <label class="p-3 rounded-2xl bg-surface border ${isSelected ? 'border-primary bg-primary-container/10' : 'border-outline/15'} flex items-center justify-between gap-3 cursor-pointer hover:border-primary/40 transition-all">
                  <div class="flex items-center gap-3">
                    <input type="checkbox" class="memory-context-chk w-5 h-5 rounded-lg text-primary focus:ring-primary" data-id="${m.id}" ${isSelected ? 'checked' : ''} />
                    <div>
                      <p class="text-body-sm font-bold text-on-surface">${m.title || 'Family Memory'}</p>
                      <span class="text-caption text-on-surface-variant">${m.category || 'General'} • ${m.date || 'Past'}</span>
                    </div>
                  </div>
                  <span class="material-symbols-outlined text-outline text-[20px]">${isSelected ? 'check_box' : 'check_box_outline_blank'}</span>
                </label>
                `;
              }).join('')}
            </div>
          </section>

          <!-- =============================================================== -->
          <!-- SECTION 12 & 13: POST-APPOINTMENT VISIT NOTES & NEXT SCHEDULING -->
          <!-- =============================================================== -->
          <section class="p-6 sm:p-7 rounded-3xl bg-surface-container-low border border-outline/20 space-y-5">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <span class="material-symbols-outlined text-primary text-[24px]">assignment_turned_in</span>
                <h3 class="font-headline-sm text-lg font-bold text-on-surface">Post-Appointment Visit Notes</h3>
              </div>
              <span class="text-caption font-semibold px-2 py-0.5 rounded-full bg-surface text-on-surface-variant border border-outline/20">
                After Consultation
              </span>
            </div>

            <p class="text-body-sm text-on-surface-variant">
              Record doctor guidance, routine suggestions, or follow-up plans discussed during your visit.
            </p>

            <form id="visitNotesForm" class="space-y-4">
              <div>
                <label for="whatDiscussedInput" class="block text-caption font-semibold text-on-surface mb-1">Summary of Discussion</label>
                <textarea 
                  id="whatDiscussedInput" 
                  rows="3" 
                  placeholder="e.g. Dr. Sharma was pleased with daily walking rhythm. Recommended continuing gentle morning stretches and keeping water nearby." 
                  class="w-full p-3.5 rounded-2xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none"
                >${prep.visitNotes?.whatWasDiscussed || ''}</textarea>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="nextDateInput" class="block text-caption font-semibold text-on-surface mb-1">Next Follow-up Date</label>
                  <input 
                    type="date" 
                    id="nextDateInput" 
                    value="${prep.visitNotes?.nextAppointmentDate || ''}"
                    class="w-full h-11 px-3.5 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label for="nextTimeInput" class="block text-caption font-semibold text-on-surface mb-1">Follow-up Time</label>
                  <input 
                    type="time" 
                    id="nextTimeInput" 
                    value="${prep.visitNotes?.nextAppointmentTime || '11:00'}"
                    class="w-full h-11 px-3.5 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label for="followUpNotesInput" class="block text-caption font-semibold text-on-surface mb-1">Caregiver Follow-up Tasks</label>
                <input 
                  type="text" 
                  id="followUpNotesInput" 
                  value="${prep.visitNotes?.followUpReminder || ''}"
                  placeholder="e.g. Check clinic for lab schedule next Tuesday." 
                  class="w-full h-11 px-3.5 rounded-xl bg-surface border border-outline/30 text-on-surface text-body-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <button 
                type="submit" 
                class="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              >
                Save Visit Notes &amp; Next Appointment
              </button>
            </form>
          </section>

        </div>

        <!-- RIGHT COLUMN: Factual Summaries, Documents & Sharing (5 Cols) -->
        <div class="lg:col-span-5 space-y-8">
          
          <!-- =============================================================== -->
          <!-- SECTION 4: RECENT ACTIVITY SUMMARY (FACTUAL ONLY)               -->
          <!-- =============================================================== -->
          <section class="p-6 rounded-3xl bg-surface-container-low border border-outline/20 space-y-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[22px]">bar_chart</span>
                <h3 class="font-headline-sm text-base font-bold text-on-surface">Recent Activity Summary</h3>
              </div>
              <span class="text-caption font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                Factual
              </span>
            </div>

            <p class="text-caption text-on-surface-variant">
              Factual participation records over the past 7 days. Non-diagnostic.
            </p>

            <div class="grid grid-cols-2 gap-3">
              <div class="p-3.5 rounded-2xl bg-surface border border-outline/10 text-center">
                <span class="block text-caption text-on-surface-variant">Sessions Completed</span>
                <strong class="text-xl font-bold text-primary">${activitySummary.activitiesCompleted}</strong>
              </div>
              <div class="p-3.5 rounded-2xl bg-surface border border-outline/10 text-center">
                <span class="block text-caption text-on-surface-variant">Active Days</span>
                <strong class="text-xl font-bold text-on-surface">${activitySummary.participationDaysThisWeek} / 7</strong>
              </div>
              <div class="p-3.5 rounded-2xl bg-surface border border-outline/10 col-span-2 text-left flex items-center justify-between">
                <div>
                  <span class="block text-caption text-on-surface-variant">Recent Activity Focus</span>
                  <strong class="text-body-sm font-bold text-on-surface">${activitySummary.mostRecentActivity}</strong>
                </div>
                <span class="px-2 py-0.5 rounded-full text-caption bg-surface-container-high font-semibold text-on-surface">
                  ${activitySummary.adaptiveLevel}
                </span>
              </div>
            </div>
          </section>

          <!-- =============================================================== -->
          <!-- SECTION 5: DAILY CARE SUMMARY (FACTUAL ADHERENCE ONLY)          -->
          <!-- =============================================================== -->
          <section class="p-6 rounded-3xl bg-surface-container-low border border-outline/20 space-y-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary text-[22px]">checklist_rtl</span>
                <h3 class="font-headline-sm text-base font-bold text-on-surface">Daily Care Summary</h3>
              </div>
              <span class="text-caption font-semibold text-secondary bg-secondary-container/40 px-2.5 py-0.5 rounded-full">
                Routine Rhythm
              </span>
            </div>

            <div class="space-y-2.5">
              <div class="p-3 rounded-2xl bg-surface border border-outline/10 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-primary text-[20px]">medication</span>
                  <span class="text-body-sm font-medium text-on-surface">Prescription Timings</span>
                </div>
                <strong class="text-body-sm font-bold text-green-700">
                  ${careSummary.medicinesCompleted} / ${careSummary.medicinesScheduled} taken
                </strong>
              </div>

              <div class="p-3 rounded-2xl bg-surface border border-outline/10 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-secondary text-[20px]">water_drop</span>
                  <span class="text-body-sm font-medium text-on-surface">Hydration Reminders</span>
                </div>
                <strong class="text-body-sm font-bold text-on-surface">
                  ${careSummary.hydrationCompleted} / ${careSummary.hydrationScheduled} logged
                </strong>
              </div>
            </div>
          </section>

          <!-- =============================================================== -->
          <!-- SECTION 6: CAREGIVER NOTES                                     -->
          <!-- =============================================================== -->
          <section class="p-6 rounded-3xl bg-surface-container-low border border-outline/20 space-y-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-tertiary text-[22px]">edit_calendar</span>
                <h3 class="font-headline-sm text-base font-bold text-on-surface">Caregiver Observations</h3>
              </div>
              <span class="text-caption text-on-surface-variant">Family Log</span>
            </div>

            <div class="space-y-2">
              ${caregiverObs.length === 0 ? `
                <div class="p-3.5 rounded-2xl bg-surface text-center text-caption text-on-surface-variant">
                  No caregiver notes recorded yet this week.
                </div>
              ` : caregiverObs.map(obs => `
                <div class="p-3 rounded-2xl bg-surface border border-outline/10 text-body-sm space-y-1">
                  <p class="text-on-surface text-caption leading-relaxed">${obs.text}</p>
                  <span class="text-[11px] text-on-surface-variant block text-right">${new Date(obs.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              `).join('')}
            </div>
          </section>

          <!-- =============================================================== -->
          <!-- SECTION 8: DOCUMENT CHECKLIST                                  -->
          <!-- =============================================================== -->
          <section class="p-6 rounded-3xl bg-surface-container-low border border-outline/20 space-y-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[22px]">task_alt</span>
                <h3 class="font-headline-sm text-base font-bold text-on-surface">Document Checklist</h3>
              </div>
              <span class="text-caption font-semibold px-2 py-0.5 rounded-full bg-surface text-on-surface-variant">
                For Appointment
              </span>
            </div>

            <div class="space-y-2" id="checklistContainer">
              ${(prep.checklist || []).map(item => `
                <label class="p-3 rounded-2xl bg-surface border ${item.completed ? 'border-green-300 bg-green-50/20' : 'border-outline/15'} flex items-center justify-between gap-3 cursor-pointer hover:border-primary/40 transition-all">
                  <div class="flex items-center gap-2.5">
                    <input type="checkbox" class="doc-checklist-chk w-5 h-5 rounded-lg text-primary focus:ring-primary" data-id="${item.id}" ${item.completed ? 'checked' : ''} />
                    <span class="text-body-sm font-medium ${item.completed ? 'text-green-900 line-through opacity-80' : 'text-on-surface'}">${item.label}</span>
                  </div>
                  <span class="material-symbols-outlined text-[18px] ${item.completed ? 'text-green-600' : 'text-outline'}">
                    ${item.completed ? 'check' : 'radio_button_unchecked'}
                  </span>
                </label>
              `).join('')}
            </div>
          </section>

          <!-- =============================================================== -->
          <!-- SECTION 11: CARE REPORT REVIEW LINK                            -->
          <!-- =============================================================== -->
          <section class="p-6 rounded-3xl bg-surface-container-low border border-outline/20 space-y-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary text-[22px]">description</span>
              <h3 class="font-headline-sm text-base font-bold text-on-surface">Care Report Review</h3>
            </div>
            <p class="text-caption text-on-surface-variant">
              You can review or print the full wellness summary prepared for this consultation.
            </p>
            <div class="flex items-center gap-2 pt-1">
              <a href="#/caregiver-reports" class="flex-1 px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-container-high border border-outline/30 text-primary font-label-md font-bold text-center transition-all no-underline shadow-2xs">
                View Full Care Report
              </a>
              <button id="printSummaryBtn" class="px-3 py-2.5 rounded-xl bg-surface hover:bg-surface-container-high border border-outline/30 text-on-surface-variant font-label-md transition-all cursor-pointer" title="Print this summary">
                <span class="material-symbols-outlined text-[20px]">print</span>
              </button>
            </div>
          </section>

        </div>
      </div>

    </div>

    <!-- ================================================================= -->
    <!-- SECTION 10 MODAL: SHARE WITH DOCTOR WITH EXPLICIT CONSENT         -->
    <!-- ================================================================= -->
    <div id="shareDoctorModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="w-full max-w-lg rounded-3xl bg-surface border border-outline/20 p-6 sm:p-7 space-y-5 shadow-xl animate-fade-in">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center">
              <span class="material-symbols-outlined text-[22px]">share</span>
            </div>
            <div>
              <h3 class="font-headline-sm text-lg font-bold text-on-surface">Share Prep with Doctor</h3>
              <p class="text-caption text-on-surface-variant">Requires explicit consent from patient or caregiver.</p>
            </div>
          </div>
          <button id="closeShareModalBtn" class="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div class="p-4 rounded-2xl bg-surface-container-low border border-outline/10 space-y-3">
          <div class="flex items-center justify-between text-caption">
            <span class="text-on-surface-variant">Recipient:</span>
            <strong class="text-on-surface font-bold">${selectedDoc.doctorName}</strong>
          </div>
          <div class="flex items-center justify-between text-caption">
            <span class="text-on-surface-variant">Clinic / Hospital:</span>
            <span class="text-on-surface font-medium">${selectedDoc.doctorHospital}</span>
          </div>
          <div class="flex items-center justify-between text-caption">
            <span class="text-on-surface-variant">Authorization:</span>
            <span class="text-green-700 font-bold">Authorized Connection</span>
          </div>
        </div>

        <div class="text-body-sm text-on-surface-variant space-y-2">
          <p class="font-bold text-on-surface">Preview of what will be shared:</p>
          <ul class="list-disc pl-5 space-y-1 text-caption">
            <li>Questions prepared for consultation (${questions.length} items)</li>
            <li>Things to remember (${prep.thingsToRemember?.length || 0} notes)</li>
            <li>7-day factual activity participation summary</li>
            <li>Daily care adherence metrics (medicine and hydration rhythm)</li>
            <li>Caregiver behavioral observations</li>
          </ul>
          <p class="text-[12px] text-on-surface-variant pt-1">
            🔒 <strong>Strict Privacy:</strong> Personal photos, story contents, and voice recordings are excluded and remain strictly private.
          </p>
        </div>

        <label class="flex items-start gap-3 p-3 rounded-2xl bg-primary-container/20 border border-primary/20 cursor-pointer">
          <input type="checkbox" id="consentCheckbox" class="mt-1 w-5 h-5 rounded text-primary focus:ring-primary" />
          <span class="text-caption text-on-surface font-medium">
            I confirm explicit consent to share this routine wellness preparation summary with ${selectedDoc.doctorName}.
          </span>
        </label>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button id="cancelShareBtn" class="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md font-medium cursor-pointer">
            Cancel
          </button>
          <button id="confirmShareBtn" disabled class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs">
            Confirm &amp; Share
          </button>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- VOICE TRANSCRIPTION PREVIEW MODAL (AVOIDS SILENT STT ERRORS)     -->
    <!-- ================================================================= -->
    <div id="voicePreviewModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="w-full max-w-md rounded-3xl bg-surface border border-outline/20 p-6 space-y-4 shadow-xl animate-fade-in">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
            <span class="material-symbols-outlined text-[24px] animate-pulse">mic</span>
          </div>
          <div>
            <h3 class="font-headline-sm text-base font-bold text-on-surface">Voice Input Preview</h3>
            <p class="text-caption text-on-surface-variant" id="voiceStatusText">Listening... Please speak clearly.</p>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-surface-container-low border border-outline/20 min-h-[90px] flex items-center justify-center text-center">
          <textarea id="transcriptionPreviewArea" rows="3" class="w-full bg-transparent border-0 text-on-surface text-body-md focus:outline-none resize-none font-medium leading-relaxed"></textarea>
        </div>

        <p class="text-[12px] text-on-surface-variant">
          You can edit the transcribed text above before confirming.
        </p>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button id="cancelVoiceBtn" class="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md cursor-pointer">
            Cancel
          </button>
          <button id="confirmVoiceBtn" class="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 cursor-pointer shadow-xs">
            Confirm &amp; Save
          </button>
        </div>
      </div>
    </div>

  </main>
  `;
}

export function attachAppointmentPrepEvents() {
  const patientId = store.getCurrentPatientId ? store.getCurrentPatientId() : 'user-asha';
  const patient = (store.state.users || []).find(u => u.id === patientId) || { name: 'Asha Devi' };
  const appt = appointmentPrepService.getUpcomingDoctorAppointment(patientId);
  const apptId = appt ? appt.id : 'rtn-doc-1';

  // --- 1. Audio Readout (Hear Preparation) ---
  const hearBtn = document.getElementById('hearPrepBtn');
  const stopBtn = document.getElementById('stopHearPrepBtn');

  if (hearBtn && stopBtn) {
    hearBtn.addEventListener('click', () => {
      const prep = appointmentPrepService.getAppointmentPrep(apptId, patientId);
      const lang = store.getState().currentLanguage || 'en';
      const textToSpeak = appointmentPrepService.generateSpokenPrep(prep, patient.name || 'Asha', lang);

      voiceService.speak(textToSpeak, {
        onStart: () => {
          hearBtn.classList.add('hidden');
          stopBtn.classList.remove('hidden');
        },
        onEnd: () => {
          hearBtn.classList.remove('hidden');
          stopBtn.classList.add('hidden');
        },
        onError: () => {
          hearBtn.classList.remove('hidden');
          stopBtn.classList.add('hidden');
          showToast('Speech playback was interrupted.', 'info');
        }
      });
    });

    stopBtn.addEventListener('click', () => {
      voiceService.stop();
      hearBtn.classList.remove('hidden');
      stopBtn.classList.add('hidden');
    });
  }

  // --- 2. Things to Remember Management ---
  const rememberForm = document.getElementById('addRememberForm');
  const rememberInput = document.getElementById('rememberInput');
  if (rememberForm && rememberInput) {
    rememberForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = rememberInput.value.trim();
      if (!val) return;
      appointmentPrepService.addThingToRemember(apptId, val, patientId);
      rememberInput.value = '';
      showToast('Reminder note added.', 'success');
      refreshView();
    });
  }

  document.querySelectorAll('.remove-remember-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(btn.dataset.index, 10);
      appointmentPrepService.removeThingToRemember(apptId, idx, patientId);
      showToast('Reminder note removed.', 'info');
      refreshView();
    });
  });

  // --- 3. Questions Management ---
  const questionForm = document.getElementById('addQuestionForm');
  const questionInput = document.getElementById('questionInput');
  if (questionForm && questionInput) {
    questionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = questionInput.value.trim();
      if (!val) return;
      appointmentPrepService.addQuestion(apptId, val, patientId);
      questionInput.value = '';
      showToast('Question added to consultation list.', 'success');
      refreshView();
    });
  }

  document.querySelectorAll('.toggle-q-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const qId = btn.dataset.id;
      appointmentPrepService.toggleQuestionStatus(apptId, qId, patientId);
      refreshView();
    });
  });

  document.querySelectorAll('.delete-q-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const qId = btn.dataset.id;
      appointmentPrepService.deleteQuestion(apptId, qId, patientId);
      showToast('Question removed.', 'info');
      refreshView();
    });
  });

  // Filter Buttons
  document.querySelectorAll('.filter-q-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter || 'all';
      refreshView();
    });
  });

  // Suggestion buttons from SmritiAI
  document.querySelectorAll('.suggest-q-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.q;
      if (text) {
        appointmentPrepService.addQuestion(apptId, text, patientId);
        showToast('Suggested question added!', 'success');
        refreshView();
      }
    });
  });

  // --- 4. Document Checklist Toggles ---
  document.querySelectorAll('.doc-checklist-chk').forEach(chk => {
    chk.addEventListener('change', () => {
      const itemId = chk.dataset.id;
      appointmentPrepService.toggleChecklistItem(apptId, itemId, patientId);
      refreshView();
    });
  });

  // --- 5. Memory Context Checkboxes ---
  document.querySelectorAll('.memory-context-chk').forEach(chk => {
    chk.addEventListener('change', () => {
      const selected = Array.from(document.querySelectorAll('.memory-context-chk:checked')).map(el => el.dataset.id);
      appointmentPrepService.setSelectedMemoryIds(apptId, selected, patientId);
      showToast('Memory context updated.', 'info');
    });
  });

  // --- 6. Post-Appointment Visit Notes Form ---
  const visitForm = document.getElementById('visitNotesForm');
  if (visitForm) {
    visitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const whatDiscussed = document.getElementById('whatDiscussedInput')?.value || '';
      const nextDate = document.getElementById('nextDateInput')?.value || '';
      const nextTime = document.getElementById('nextTimeInput')?.value || '';
      const followUp = document.getElementById('followUpNotesInput')?.value || '';

      appointmentPrepService.saveVisitNotes(apptId, {
        whatWasDiscussed: whatDiscussed,
        nextAppointmentDate: nextDate,
        nextAppointmentTime: nextTime,
        followUpReminder: followUp
      }, patientId);

      showToast('Visit notes saved. Next appointment added to routine.', 'success');
      refreshView();
    });
  }

  // --- 7. Print Button ---
  document.getElementById('printSummaryBtn')?.addEventListener('click', () => {
    window.print();
  });

  // --- 8. Share with Doctor Modal Events ---
  const shareModal = document.getElementById('shareDoctorModal');
  const openShareBtn = document.getElementById('openShareModalBtn');
  const closeShareBtn = document.getElementById('closeShareModalBtn');
  const cancelShareBtn = document.getElementById('cancelShareBtn');
  const confirmShareBtn = document.getElementById('confirmShareBtn');
  const consentChk = document.getElementById('consentCheckbox');

  if (openShareBtn && shareModal) {
    openShareBtn.addEventListener('click', () => {
      shareModal.classList.remove('hidden');
    });
  }

  const closeShare = () => {
    if (shareModal) shareModal.classList.add('hidden');
    if (consentChk) consentChk.checked = false;
    if (confirmShareBtn) confirmShareBtn.disabled = true;
  };

  closeShareBtn?.addEventListener('click', closeShare);
  cancelShareBtn?.addEventListener('click', closeShare);

  consentChk?.addEventListener('change', () => {
    if (confirmShareBtn) {
      confirmShareBtn.disabled = !consentChk.checked;
    }
  });

  confirmShareBtn?.addEventListener('click', () => {
    try {
      const prep = appointmentPrepService.getAppointmentPrep(apptId, patientId);
      const doctorId = prep.doctorId || 'user-dr-sharma';
      appointmentPrepService.sharePrepWithDoctor(apptId, doctorId, patientId, 'Meera (Caregiver)');
      showToast('Appointment preparation successfully shared with clinic.', 'success');
      closeShare();
      refreshView();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Could not share with doctor.', 'error');
    }
  });

  // --- 9. Voice STT with Transcription Preview Modal ---
  const voiceModal = document.getElementById('voicePreviewModal');
  const voiceStatusText = document.getElementById('voiceStatusText');
  const transcriptionArea = document.getElementById('transcriptionPreviewArea');
  const voiceRememberBtn = document.getElementById('voiceRememberBtn');
  const voiceQuestionBtn = document.getElementById('voiceQuestionBtn');
  const cancelVoiceBtn = document.getElementById('cancelVoiceBtn');
  const confirmVoiceBtn = document.getElementById('confirmVoiceBtn');

  const startVoiceInput = (target) => {
    activeVoiceTarget = target;
    if (transcriptionArea) transcriptionArea.value = '';
    if (voiceStatusText) voiceStatusText.textContent = 'Listening... Please speak clearly.';
    if (voiceModal) voiceModal.classList.remove('hidden');

    if (!voiceService.isSttSupported()) {
      if (voiceStatusText) voiceStatusText.textContent = 'Microphone speech recognition not available in this browser. Please type directly:';
      return;
    }

    voiceService.startListening({
      onInterim: (text) => {
        if (transcriptionArea) transcriptionArea.value = text;
      },
      onFinal: (text) => {
        if (transcriptionArea) transcriptionArea.value = text;
        if (voiceStatusText) voiceStatusText.textContent = 'Voice captured. Review or edit below before saving:';
      },
      onError: (err) => {
        if (voiceStatusText) voiceStatusText.textContent = 'Listening paused. You can edit the text directly:';
      }
    });
  };

  voiceRememberBtn?.addEventListener('click', () => startVoiceInput('remember'));
  voiceQuestionBtn?.addEventListener('click', () => startVoiceInput('question'));

  cancelVoiceBtn?.addEventListener('click', () => {
    voiceService.stopListening();
    if (voiceModal) voiceModal.classList.add('hidden');
    activeVoiceTarget = null;
  });

  confirmVoiceBtn?.addEventListener('click', () => {
    voiceService.stopListening();
    const text = transcriptionArea?.value?.trim();
    if (text) {
      if (activeVoiceTarget === 'remember') {
        appointmentPrepService.addThingToRemember(apptId, text, patientId);
        showToast('Reminder added from voice.', 'success');
      } else if (activeVoiceTarget === 'question') {
        appointmentPrepService.addQuestion(apptId, text, patientId);
        showToast('Question added from voice.', 'success');
      }
    }
    if (voiceModal) voiceModal.classList.add('hidden');
    activeVoiceTarget = null;
    refreshView();
  });

  function refreshView() {
    const contentEl = document.getElementById('view-content');
    if (contentEl && window.location.hash.includes('appointment-prep')) {
      contentEl.innerHTML = renderAppointmentPrepView();
      attachAppointmentPrepEvents();
    }
  }
}
