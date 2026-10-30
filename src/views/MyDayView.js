// My Day View - Dedicated Daily Rhythm, Schedule & Smart Daily Plan View
// Enhanced with Feature 1: Smart Daily Plan
// Strictly Non-Diagnostic, Zero-Fabrication, Patient-Isolated & Accessible

import { store } from '../state/store.js';
import { reminderService, REMINDER_STATUS } from '../services/reminderService.js';
import { dailyPlanService, PLAN_ITEM_TYPES, PLAN_ITEM_PRIORITIES, PLAN_ITEM_STATUS, TIME_BUCKETS } from '../services/dailyPlanService.js';
import { voiceService } from '../services/voiceService.js';
import { i18nService } from '../services/i18nService.js';
import { showToast } from '../components/Toast.js';
import { renderEmptyState } from '../components/FeedbackStates.js';
import { renderMoodCheckInCard, attachMoodCheckInEvents } from '../components/MoodCheckInCard.js';

export function renderMyDayView() {
  const state = store.getState();
  const patientId = store.getCurrentPatientId();
  const patient = state.currentUser || state.profile || state.users[0];
  const patientName = patient?.name ? patient.name.split(' ')[0] : 'Asha';
  const lang = i18nService.getLanguage();

  // Load Smart Daily Plan for the current authenticated patient
  const dailyPlan = dailyPlanService.getTodayPlan(patientId) || {
    items: [],
    summary: { total: 0, completedCount: 0, pendingCount: 0, importantCount: 0, percentage: 100 }
  };

  const planSummary = dailyPlan.summary || {
    total: dailyPlan.items.length,
    completedCount: dailyPlan.items.filter(i => i.status === PLAN_ITEM_STATUS.COMPLETED).length,
    pendingCount: dailyPlan.items.filter(i => i.status !== PLAN_ITEM_STATUS.COMPLETED).length,
    importantCount: dailyPlan.items.filter(i => i.priority === PLAN_ITEM_PRIORITIES.IMPORTANT).length,
    percentage: dailyPlan.items.length > 0 ? Math.round((dailyPlan.items.filter(i => i.status === PLAN_ITEM_STATUS.COMPLETED).length / dailyPlan.items.length) * 100) : 100
  };

  // Time grouping for Smart Daily Plan
  const groupedPlan = dailyPlanService.groupPlanByTime(dailyPlan);

  // Time-aware greeting
  const now = new Date();
  const currentHour = now.getHours();
  const greetingKey = currentHour < 12 
    ? 'home.greetingMorning' 
    : currentHour < 17 
      ? 'home.greetingAfternoon' 
      : 'home.greetingEvening';
  const greetingLabel = (i18nService.t(greetingKey) || (currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening')).toUpperCase();

  // Companion spoken plan preview text
  let smritiMessage = '';
  if (planSummary.total === 0) {
    smritiMessage = `${i18nService.t('myDay.dayClear') || 'Your day is clear.'} ${i18nService.t('myDay.suggestActivityPrompt') || 'Would you like a short activity?'}`;
  } else if (planSummary.pendingCount === 0) {
    smritiMessage = `Wonderful, ${patientName}! You have peacefully completed all tasks scheduled for today.`;
  } else if (planSummary.importantCount > 0) {
    smritiMessage = `Good morning, ${patientName}. You have ${planSummary.importantCount} important ${planSummary.importantCount === 1 ? 'task' : 'tasks'} today.`;
  } else {
    smritiMessage = `Good morning, ${patientName}. You have ${planSummary.pendingCount} gentle ${planSummary.pendingCount === 1 ? 'activity' : 'activities'} today.`;
  }

  // Helper to render an individual Smart Daily Plan card
  function renderSmartPlanItem(item) {
    const isCompleted = item.status === PLAN_ITEM_STATUS.COMPLETED;
    const isSnoozed = item.status === PLAN_ITEM_STATUS.SNOOZED;

    const priorityBadge = item.priority === PLAN_ITEM_PRIORITIES.IMPORTANT
      ? `<span class="px-space-xs py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-caption text-caption font-bold">Important</span>`
      : item.priority === PLAN_ITEM_PRIORITIES.SUGGESTED
        ? `<span class="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold">Suggested</span>`
        : `<span class="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">Optional</span>`;

    const iconName = item.metadata?.icon || 
      (item.type === PLAN_ITEM_TYPES.REMINDER ? 'medication'
      : item.type === PLAN_ITEM_TYPES.APPOINTMENT ? 'calendar_month'
      : item.type === PLAN_ITEM_TYPES.COGNITIVE_ACTIVITY ? 'psychology'
      : item.type === PLAN_ITEM_TYPES.MEMORY_ACTIVITY ? 'auto_stories'
      : item.type === PLAN_ITEM_TYPES.FAMILY_ACTIVITY ? 'diversity_1'
      : 'schedule');

    return `
    <div class="smart-plan-item flex flex-col md:flex-row md:items-center justify-between gap-space-md p-space-lg rounded-2xl ${
      isCompleted 
        ? 'bg-surface-container-lowest border border-tertiary-fixed/60 opacity-80' 
        : isSnoozed 
          ? 'bg-secondary-fixed/15 border border-secondary-fixed shadow-sm'
          : 'bg-surface-container-low shadow-[0_4px_16px_rgba(159,60,22,0.06)] border border-surface-container'
    } shadow-sm hover:shadow-md transition-all" data-id="${item.id}" data-source-id="${item.sourceId || ''}">
      <div class="flex items-start gap-space-md min-w-0">
        <!-- Item Icon Badge -->
        <div class="flex items-center justify-center w-12 h-12 rounded-xl ${
          isCompleted 
            ? 'bg-tertiary/15 text-tertiary' 
            : item.priority === PLAN_ITEM_PRIORITIES.IMPORTANT 
              ? 'bg-primary/15 text-primary' 
              : 'bg-surface-container-high text-on-surface-variant'
        } shrink-0 shadow-sm">
          <span class="material-symbols-outlined text-[26px]">
            ${isCompleted ? 'check_circle' : iconName}
          </span>
        </div>

        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-space-xs flex-wrap mb-1">
            ${priorityBadge}
            ${item.scheduledTime ? `
              <span class="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface font-caption text-caption font-bold">
                ${item.scheduledTime}
              </span>
            ` : ''}
            ${isCompleted ? `
              <span class="px-space-xs py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold">
                Done ${item.completedAt ? 'at ' + item.completedAt : ''}
              </span>
            ` : isSnoozed ? `
              <span class="px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">
                Snoozed (+15m)
              </span>
            ` : ''}
          </div>

          <h3 class="font-headline-sm text-headline-sm ${isCompleted ? 'text-on-surface-variant line-through' : 'text-on-surface font-semibold'}">
            ${item.title}
          </h3>

          ${item.description ? `
            <p class="font-body-md text-body-md text-on-surface-variant mt-0.5 leading-snug">
              ${item.description}
            </p>
          ` : ''}
        </div>
      </div>

      <!-- Action Buttons Cluster -->
      <div class="flex items-center justify-between md:justify-end gap-space-sm shrink-0 pt-space-xs md:pt-0 border-t md:border-t-0 border-surface-container flex-wrap">
        <!-- Hear Item Audio Button -->
        <button class="smart-plan-hear-btn w-10 h-10 rounded-xl bg-surface-container hover:bg-primary/10 hover:text-primary flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer" title="Hear this item read aloud" data-id="${item.id}" type="button" aria-label="Hear ${item.title}">
          <span class="material-symbols-outlined text-[20px]">volume_up</span>
        </button>

        ${!isCompleted ? `
          <!-- Contextual Primary Action Button -->
          ${item.type === PLAN_ITEM_TYPES.COGNITIVE_ACTIVITY ? `
            <button class="smart-plan-activity-btn px-space-md py-space-xs rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95" data-act-id="${item.metadata?.activityId || item.sourceId}" data-slug="${item.metadata?.activitySlug || ''}" type="button">
              <span class="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>Start</span>
            </button>
          ` : item.type === PLAN_ITEM_TYPES.APPOINTMENT ? `
            <div class="flex items-center gap-1.5 flex-wrap">
              <a href="#/appointment-prep" class="px-space-md py-space-xs rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 font-label-md text-label-md flex items-center gap-1 transition-all shadow-sm no-underline">
                <span class="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                <span>Prepare for Visit</span>
              </a>
              <button class="smart-plan-appt-btn px-space-sm py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1 transition-all cursor-pointer" data-id="${item.id}" data-source-id="${item.sourceId}" data-route="${item.metadata?.actionRoute || 'my-doctors'}" type="button">
                <span>Details</span>
              </button>
            </div>
          ` : item.type === PLAN_ITEM_TYPES.MEMORY_ACTIVITY ? `
            <a href="#/memory-world" class="px-space-md py-space-xs rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 font-label-md text-label-md flex items-center gap-1 transition-all shadow-sm">
              <span class="material-symbols-outlined text-[18px]">auto_stories</span>
              <span>Explore</span>
            </a>
          ` : item.type === PLAN_ITEM_TYPES.FAMILY_ACTIVITY ? `
            <a href="#/family-circle" class="px-space-md py-space-xs rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md flex items-center gap-1 transition-all shadow-sm">
              <span class="material-symbols-outlined text-[18px]">diversity_1</span>
              <span>Start</span>
            </a>
          ` : `
            <!-- Mark as Done Button -->
            <button class="smart-plan-done-btn px-space-md py-space-xs rounded-xl bg-tertiary text-on-tertiary hover:bg-tertiary/90 font-label-md text-label-md flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95" data-id="${item.id}" data-source-id="${item.sourceId}" type="button">
              <span class="material-symbols-outlined text-[18px]">check</span>
              <span>Mark as Done</span>
            </button>

            <!-- Snooze (+15m) Button for reminders -->
            <button class="smart-plan-snooze-btn px-space-sm py-space-xs rounded-xl bg-surface-container hover:bg-secondary/15 hover:text-secondary font-label-md text-label-md text-on-surface-variant flex items-center gap-1 transition-colors cursor-pointer" data-id="${item.id}" data-source-id="${item.sourceId}" type="button" title="Snooze for 15 minutes">
              <span class="material-symbols-outlined text-[18px]">snooze</span>
              <span>Snooze</span>
            </button>
          `}
        ` : `
          <!-- Completed Badge -->
          <div class="inline-flex items-center gap-1 px-space-md py-space-xs rounded-xl bg-tertiary/15 text-tertiary font-label-md text-label-md font-semibold">
            <span class="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Completed</span>
          </div>
        `}
      </div>
    </div>
    `;
  }

  // Load existing reminders for detailed daily rhythm timeline section
  const patientReminders = store.getRemindersForPatient(patientId);
  const completedCount = patientReminders.filter(r => r.completed || r.status === REMINDER_STATUS.COMPLETED).length;
  const totalCount = patientReminders.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  const morningRoutines = patientReminders.filter(r => r.time.includes('AM') || r.id === 'rtn-1' || r.id === 'rtn-2');
  const afternoonRoutines = patientReminders.filter(r => (r.time.includes('PM') && (r.time.startsWith('01') || r.time.startsWith('04') || r.time.startsWith('1:') || r.time.startsWith('4:') || r.time.startsWith('02') || r.time.startsWith('2:'))) || r.id === 'rtn-3' || r.id === 'rtn-4' || r.id === 'rtn-5');
  const eveningRoutines = patientReminders.filter(r => !morningRoutines.includes(r) && !afternoonRoutines.includes(r));

  function renderRoutineCard(item) {
    const isCompleted = item.completed || item.status === REMINDER_STATUS.COMPLETED;
    const isSnoozed = item.status === REMINDER_STATUS.SNOOZED;
    const urgency = reminderService.getReminderUrgency(item);

    const typeBadge = item.type === 'medicine' ? 'Prescription Care'
                    : item.type === 'hydration' ? 'Hydration'
                    : item.type === 'appointment' ? 'Family Event'
                    : item.type === 'activity' ? 'Memory Activity'
                    : 'Daily Routine';

    const statusBadgeText = isCompleted ? `Done at ${item.completedAt || item.time}`
                          : isSnoozed ? 'Snoozed (+15m)'
                          : urgency === 'due_now' ? 'Due Now'
                          : urgency === 'due_soon' ? 'Due Soon'
                          : (item.statusBadge || 'Upcoming');

    const isDocAppt = (item.title && (item.title.toLowerCase().includes('doctor') || item.title.toLowerCase().includes('dr.') || item.title.toLowerCase().includes('clinic'))) || (item.category === 'appointment' && item.doctorId);
    const navLink = isDocAppt ? '#/appointment-prep'
                  : item.category === 'appointment' || item.category === 'Family' ? '#/family-circle' 
                  : item.category === 'Memory' ? '#/memory-world' 
                  : item.category === 'activity' || item.category === 'Cognitive' ? '#/activities' 
                  : null;

    return `
    <div class="my-day-item flex flex-col md:flex-row md:items-center justify-between gap-space-md p-space-lg rounded-2xl ${
      isCompleted 
        ? 'bg-surface-container-lowest border border-tertiary-fixed/60' 
        : isSnoozed 
          ? 'bg-secondary-fixed/15 border border-secondary-fixed shadow-sm'
          : 'bg-surface-container-low shadow-[0_4px_16px_rgba(159,60,22,0.06)] border border-surface-container'
    } shadow-sm hover:shadow-md transition-all" data-id="${item.id}">
      <div class="flex items-start gap-space-md min-w-0">
        <!-- Checkbox Action -->
        <button class="my-day-toggle-btn flex items-center justify-center w-14 h-14 rounded-xl ${
          isCompleted 
            ? 'bg-tertiary text-on-tertiary' 
            : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-fixed hover:text-on-primary-fixed'
        } shrink-0 shadow-sm transition-all cursor-pointer" aria-label="Mark ${item.title} as ${isCompleted ? 'pending' : 'done'}" data-id="${item.id}" type="button">
          <span class="material-symbols-outlined text-[28px]" style="${isCompleted ? "font-variation-settings: 'FILL' 1;" : ''}">
            ${isCompleted ? 'check_circle' : 'radio_button_unchecked'}
          </span>
        </button>

        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-space-xs flex-wrap mb-1">
            <span class="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold">
              ${typeBadge}
            </span>
            <span class="px-space-xs py-0.5 rounded-full ${
              isCompleted 
                ? 'bg-tertiary-fixed text-on-tertiary-fixed font-semibold' 
                : isSnoozed 
                  ? 'bg-secondary-fixed text-on-secondary-fixed font-semibold'
                  : 'bg-primary-fixed-dim/30 text-on-primary-fixed-variant'
            } font-caption text-caption">
              ${statusBadgeText}
            </span>
          </div>

          <h3 class="font-headline-sm text-headline-sm ${isCompleted ? 'text-on-surface-variant line-through opacity-80' : 'text-on-surface font-semibold'}">
            ${item.title}
          </h3>

          <p class="font-body-md text-body-md text-on-surface-variant mt-0.5 leading-snug">
            ${item.notes || item.description}
          </p>
        </div>
      </div>

      <!-- Action Cluster -->
      <div class="flex items-center justify-between md:justify-end gap-space-sm shrink-0 pt-space-xs md:pt-0 border-t md:border-t-0 border-surface-container">
        <!-- Hear Reminder Voice Button -->
        <button class="reminder-hear-btn w-10 h-10 rounded-xl bg-surface-container hover:bg-primary/10 hover:text-primary flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer" title="Hear reminder spoken aloud" data-id="${item.id}" type="button">
          <span class="material-symbols-outlined text-[20px]">volume_up</span>
        </button>

        <!-- Quick Snooze (+15m) Button if pending -->
        ${!isCompleted ? `
          <button class="reminder-snooze-btn px-space-sm py-space-xs rounded-xl bg-surface-container hover:bg-secondary/15 hover:text-secondary font-label-md text-label-md text-on-surface-variant flex items-center gap-1 transition-colors cursor-pointer" title="Snooze for 15 minutes" data-id="${item.id}" type="button">
            <span class="material-symbols-outlined text-[18px]">snooze</span>
            <span>Snooze</span>
          </button>
        ` : ''}

        <!-- Details Modal Trigger -->
        <button class="reminder-detail-btn px-space-sm py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer" data-id="${item.id}" type="button">
          Details
        </button>

        ${isDocAppt ? `
          <a href="#/appointment-prep" class="px-space-sm py-space-xs rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 font-label-md text-label-md flex items-center gap-1 transition-all shadow-2xs no-underline" title="Prepare for Doctor Visit">
            <span class="material-symbols-outlined text-[16px]">assignment_turned_in</span>
            <span>Prep</span>
          </a>
        ` : ''}

        ${navLink ? `
          <a href="${navLink}" class="inline-flex items-center gap-0.5 font-label-md text-label-md text-primary hover:underline" title="Explore section">
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        ` : ''}

        <span class="font-label-lg text-label-lg font-bold min-w-[75px] text-right ${isCompleted ? 'text-outline' : 'text-primary'}">
          ${item.time}
        </span>
      </div>
    </div>
    `;
  }

  return `
  <main class="w-full pt-20 bg-surface min-h-[calc(100vh-140px)] pb-space-3xl">
    <div class="max-w-7xl mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl">
      <!-- Breadcrumb & Connection Status -->
      <div class="flex flex-wrap items-center justify-between gap-space-sm mb-space-lg">
        <a href="#/patient-home" class="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all text-label-lg font-label-lg group shadow-sm">
          <span class="material-symbols-outlined text-[22px] transition-transform group-hover:-translate-x-1">arrow_back</span>
          <span>Return to Home</span>
        </a>
        <div class="flex items-center gap-space-md flex-wrap">
          <button id="openNotificationConsentBtn" class="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md transition-colors cursor-pointer shadow-sm">
            <span class="material-symbols-outlined text-[18px]">notifications_active</span>
            <span>Care Chimes</span>
          </button>
          <div class="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-tertiary-fixed/30 text-tertiary">
            <span class="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
            <span class="font-label-md text-label-md">Synced with Sector 4 Care Unit</span>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- SMART DAILY PLAN: "YOUR DAY" / "TODAY'S PLAN" (NEW TOP SECTION)   -->
      <!-- ================================================================= -->
      <div class="mb-space-2xl">
        <!-- Warm Human Greeting Header -->
        <div class="mb-space-lg">
          <div class="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-bold tracking-wider mb-space-2xs uppercase">
            ${greetingLabel} 👋
          </div>
          <h1 class="font-headline-lg text-headline-lg text-on-surface font-bold">
            ${i18nService.t('myDay.yourDay') || 'Your Day'}
          </h1>
          <p class="font-body-lg text-body-lg text-on-surface-variant mt-0.5">
            ${patientName}'s personalized daily plan, routines, and gentle milestones.
          </p>
        </div>

        <!-- Mood Check-in Widget (Compact, Non-Intrusive) -->
        <div class="mb-space-lg" id="myDayMoodCheckInWrap">
          ${renderMoodCheckInCard(patientId, true)}
        </div>

        <!-- SmritiAI Companion Plan Summary Card -->
        <div class="p-space-lg rounded-2xl bg-primary-fixed/15 border border-primary-fixed/40 flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg shadow-sm">
          <div class="flex items-start gap-space-md">
            <div class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-sm">
              <span class="material-symbols-outlined text-[26px]">smart_toy</span>
            </div>
            <div>
              <div class="flex items-center gap-space-xs">
                <span class="font-label-lg text-label-lg font-bold text-on-surface">SmritiAI</span>
                <span class="px-space-xs py-0.5 rounded-full bg-primary/20 text-primary font-caption text-caption font-semibold">Gentle Companion</span>
              </div>
              <p class="font-body-lg text-body-lg text-on-surface mt-1 font-medium leading-snug">
                "${smritiMessage}"
              </p>
            </div>
          </div>

          <!-- Hear Today's Plan Button -->
          <button id="hearTodaysPlanBtn" class="flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg shadow-sm transition-all cursor-pointer active:scale-95 shrink-0" type="button" aria-label="Hear today's plan spoken aloud">
            <span class="material-symbols-outlined text-[22px]" id="hearPlanIcon">volume_up</span>
            <span id="hearPlanText">${i18nService.t('myDay.hearTodaysPlan') || "Hear Today's Plan"}</span>
          </button>
        </div>

        <!-- Today's Progress Indicator (Non-medical, daily task progress) -->
        <div class="p-space-md rounded-2xl bg-surface-container-low border border-surface-container mb-space-xl">
          <div class="flex items-center justify-between gap-space-sm mb-space-xs">
            <div class="flex items-center gap-space-xs">
              <span class="material-symbols-outlined text-primary text-[20px]">fact_check</span>
              <span class="font-label-lg text-label-lg font-bold text-on-surface">
                ${i18nService.t('myDay.todaysProgress') || "Today's Progress"}
              </span>
            </div>
            <span class="font-label-md text-label-md font-bold text-primary">
              ${planSummary.completedCount} of ${planSummary.total} completed (${planSummary.percentage}%)
            </span>
          </div>
          <div class="w-full bg-surface-container-high rounded-full h-3 overflow-hidden shadow-inner">
            <div class="bg-primary h-full rounded-full transition-all duration-500" style="width: ${planSummary.percentage}%;"></div>
          </div>
        </div>

        <!-- Time-Grouped Smart Daily Plan Items -->
        ${planSummary.total === 0 ? `
          <div class="p-space-2xl rounded-2xl bg-surface-container-lowest border border-surface-container text-center max-w-xl mx-auto my-space-xl">
            <span class="material-symbols-outlined text-[48px] text-primary/70 mb-space-xs">wb_sunny</span>
            <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface mb-1">
              ${i18nService.t('myDay.dayClear') || 'Your day is clear.'}
            </h3>
            <p class="font-body-md text-body-md text-on-surface-variant mb-space-lg">
              Take all the time you need to rest and enjoy peaceful moments.
            </p>
            <a href="#/activities" class="inline-flex items-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-container transition-all">
              <span class="material-symbols-outlined text-[20px]">psychology</span>
              <span>${i18nService.t('myDay.suggestActivityPrompt') || 'Would you like a short activity?'}</span>
            </a>
          </div>
        ` : `
          <div class="space-y-space-xl max-w-4xl">
            <!-- Morning Bucket -->
            ${groupedPlan.morning.length > 0 ? `
              <section class="space-y-space-sm">
                <div class="flex items-center gap-space-xs pb-space-xs border-b border-surface-container">
                  <span class="material-symbols-outlined text-primary text-[22px]">wb_sunny</span>
                  <h2 class="font-headline-sm text-headline-sm text-on-surface font-bold">
                    ${i18nService.t('myDay.morning') || 'Morning'}
                  </h2>
                  <span class="font-caption text-caption text-on-surface-variant ml-space-xs">Before 12:00 PM</span>
                </div>
                <div class="space-y-space-sm">
                  ${groupedPlan.morning.map(renderSmartPlanItem).join('')}
                </div>
              </section>
            ` : ''}

            <!-- Afternoon Bucket -->
            ${groupedPlan.afternoon.length > 0 ? `
              <section class="space-y-space-sm">
                <div class="flex items-center gap-space-xs pb-space-xs border-b border-surface-container">
                  <span class="material-symbols-outlined text-secondary text-[22px]">partly_cloudy_day</span>
                  <h2 class="font-headline-sm text-headline-sm text-on-surface font-bold">
                    ${i18nService.t('myDay.afternoon') || 'Afternoon'}
                  </h2>
                  <span class="font-caption text-caption text-on-surface-variant ml-space-xs">12:00 PM – 5:00 PM</span>
                </div>
                <div class="space-y-space-sm">
                  ${groupedPlan.afternoon.map(renderSmartPlanItem).join('')}
                </div>
              </section>
            ` : ''}

            <!-- Evening Bucket -->
            ${groupedPlan.evening.length > 0 ? `
              <section class="space-y-space-sm">
                <div class="flex items-center gap-space-xs pb-space-xs border-b border-surface-container">
                  <span class="material-symbols-outlined text-tertiary text-[22px]">bedtime</span>
                  <h2 class="font-headline-sm text-headline-sm text-on-surface font-bold">
                    ${i18nService.t('myDay.evening') || 'Evening'}
                  </h2>
                  <span class="font-caption text-caption text-on-surface-variant ml-space-xs">5:00 PM onwards</span>
                </div>
                <div class="space-y-space-sm">
                  ${groupedPlan.evening.map(renderSmartPlanItem).join('')}
                </div>
              </section>
            ` : ''}
          </div>
        `}
      </div>

      <!-- ================================================================= -->
      <!-- EXISTING DAILY CARE & REMINDERS SECTION (PRESERVED)               -->
      <!-- ================================================================= -->
      <div class="pt-space-2xl border-t border-surface-container">
        <!-- Title & Rhythm Progress Banner -->
        <div class="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm mb-space-xl border border-surface-container">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div>
              <div class="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-caption mb-space-xs font-semibold">
                <span class="material-symbols-outlined text-[16px]">schedule</span>
                <span>Daily Care Timeline &amp; Records</span>
              </div>
              <h2 class="font-headline-md text-headline-md text-on-surface font-bold">${i18nService.t('myDay.title')} • Daily Rhythm</h2>
              <p class="font-body-md text-body-md text-on-surface-variant mt-1">
                ${i18nService.t('myDay.subtitle')}
              </p>
            </div>

            <div class="flex items-center gap-space-md flex-wrap shrink-0">
              <!-- Listen to Schedule Voice Trigger -->
              <button id="listenMyDayBtn" class="flex items-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-lg text-label-lg shadow-sm transition-all cursor-pointer active:scale-95" type="button" aria-label="Listen to schedule">
                <span class="material-symbols-outlined text-[22px]" id="listenMyDayIcon">volume_up</span>
                <span id="listenMyDayText">${i18nService.t('myDay.listenSchedule')}</span>
              </button>

              <div class="flex flex-col items-center p-space-md rounded-xl bg-surface-container-low min-w-[140px] border border-surface-container">
                <span class="font-caption text-caption uppercase tracking-wider font-semibold text-on-surface-variant">Care Progress</span>
                <span class="font-display text-display font-bold text-primary">${percentage}%</span>
                <span class="font-caption text-caption text-tertiary font-semibold">${completedCount} of ${totalCount} done</span>
              </div>
            </div>
          </div>
        </div>

        ${totalCount === 0 ? `
          <div class="max-w-xl mx-auto my-space-2xl">
            ${renderEmptyState('Your day is clear', 'Take all the time you need to rest and enjoy peaceful moments. Caregivers can add routines anytime.', 'calendar_today')}
          </div>
        ` : `
          <!-- Timeline Sections -->
          <div class="space-y-space-2xl max-w-4xl">
            <!-- Morning Rhythm -->
            <section class="space-y-space-md">
              <div class="flex items-center gap-space-xs pb-space-xs border-b border-surface-container">
                <span class="material-symbols-outlined text-primary text-[22px]">wb_sunny</span>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Morning Rhythm</h3>
                <span class="font-caption text-caption text-on-surface-variant ml-space-xs">8:00 AM – 11:30 AM</span>
              </div>
              <div class="space-y-space-sm">
                ${morningRoutines.length > 0 ? morningRoutines.map(renderRoutineCard).join('') : '<p class="font-body-md text-on-surface-variant italic p-space-md bg-surface-container-lowest rounded-xl">No morning milestones scheduled.</p>'}
              </div>
            </section>

            <!-- Afternoon Rhythm -->
            <section class="space-y-space-md">
              <div class="flex items-center gap-space-xs pb-space-xs border-b border-surface-container">
                <span class="material-symbols-outlined text-secondary text-[22px]">partly_cloudy_day</span>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Afternoon Rhythm</h3>
                <span class="font-caption text-caption text-on-surface-variant ml-space-xs">1:00 PM – 4:30 PM</span>
              </div>
              <div class="space-y-space-sm">
                ${afternoonRoutines.length > 0 ? afternoonRoutines.map(renderRoutineCard).join('') : '<p class="font-body-md text-on-surface-variant italic p-space-md bg-surface-container-lowest rounded-xl">No afternoon milestones scheduled.</p>'}
              </div>
            </section>

            <!-- Evening Rhythm -->
            <section class="space-y-space-md">
              <div class="flex items-center gap-space-xs pb-space-xs border-b border-surface-container">
                <span class="material-symbols-outlined text-tertiary text-[22px]">bedtime</span>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Evening Rhythm</h3>
                <span class="font-caption text-caption text-on-surface-variant ml-space-xs">6:00 PM – 9:30 PM</span>
              </div>
              <div class="space-y-space-sm">
                ${eveningRoutines.length > 0 ? eveningRoutines.map(renderRoutineCard).join('') : '<p class="font-body-md text-on-surface-variant italic p-space-md bg-surface-container-lowest rounded-xl">No evening milestones scheduled.</p>'}
              </div>
            </section>

            <!-- Informative Interface Note -->
            <div class="p-space-md rounded-2xl bg-surface-container-high/60 flex items-start gap-space-sm">
              <span class="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">info</span>
              <p class="font-body-md text-body-md text-on-surface-variant">
                Daily care updates sync with your primary caregiver in real time. Tap the speaker icon to hear any reminder read aloud in a calm, comforting cadence.
              </p>
            </div>

            <!-- Emergency Help Access Card -->
            <div class="p-space-md rounded-2xl bg-surface-container-lowest border border-error/20 flex items-center justify-between gap-space-md shadow-sm">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-error text-[24px]">emergency</span>
                <div>
                  <p class="font-label-lg text-label-lg font-bold text-on-surface">Need immediate assistance?</p>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">India 112 &amp; Care Circle quick-dial.</p>
                </div>
              </div>
              <a href="#/emergency-sos" class="px-space-md py-space-xs rounded-xl bg-error hover:bg-error/90 text-on-error font-label-md text-label-md transition-colors shrink-0">
                Emergency Help
              </a>
            </div>
          </div>
        `}
      </div>
    </div>
  </main>
  `;
}

export function attachMyDayEvents() {
  const state = store.getState();
  const patient = state.currentUser || state.profile || state.users[0];
  const patientName = patient?.name || 'Asha';
  const lang = i18nService.getLanguage();
  const patientId = store.getCurrentPatientId();

  // =================================================================
  // SMART DAILY PLAN EVENT LISTENERS
  // =================================================================

  // Hear Today's Plan Button
  const hearPlanBtn = document.getElementById('hearTodaysPlanBtn');
  const hearPlanIcon = document.getElementById('hearPlanIcon');
  const hearPlanText = document.getElementById('hearPlanText');

  if (hearPlanBtn) {
    hearPlanBtn.addEventListener('click', () => {
      if (voiceService.isSpeaking()) {
        voiceService.stop();
        if (hearPlanText) hearPlanText.textContent = i18nService.t('myDay.hearTodaysPlan') || "Hear Today's Plan";
        if (hearPlanIcon) hearPlanIcon.textContent = 'volume_up';
        hearPlanBtn.classList.remove('bg-error');
        hearPlanBtn.classList.add('bg-primary');
        showToast('Plan reading stopped', 'stop');
        return;
      }

      const plan = dailyPlanService.getTodayPlan(patientId);
      const spokenPlan = dailyPlanService.generatePlanSpokenText(plan, patientName, lang);

      if (hearPlanText) hearPlanText.textContent = i18nService.t('myDay.stopPlanAudio') || 'Stop Spoken Plan';
      if (hearPlanIcon) hearPlanIcon.textContent = 'stop_circle';
      hearPlanBtn.classList.remove('bg-primary');
      hearPlanBtn.classList.add('bg-error');

      voiceService.speak(spokenPlan, {
        lang,
        onEnd: () => {
          if (hearPlanText) hearPlanText.textContent = i18nService.t('myDay.hearTodaysPlan') || "Hear Today's Plan";
          if (hearPlanIcon) hearPlanIcon.textContent = 'volume_up';
          hearPlanBtn.classList.remove('bg-error');
          hearPlanBtn.classList.add('bg-primary');
        },
        onError: () => {
          if (hearPlanText) hearPlanText.textContent = i18nService.t('myDay.hearTodaysPlan') || "Hear Today's Plan";
          if (hearPlanIcon) hearPlanIcon.textContent = 'volume_up';
          hearPlanBtn.classList.remove('bg-error');
          hearPlanBtn.classList.add('bg-primary');
        }
      });
    });
  }

  // Mark Done in Smart Daily Plan
  document.querySelectorAll('.smart-plan-done-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemId = btn.getAttribute('data-id');
      const sourceId = btn.getAttribute('data-source-id');

      dailyPlanService.updatePlanItemStatus(patientId, itemId, PLAN_ITEM_STATUS.COMPLETED);
      showToast('Milestone completed! Plan updated.', 'check_circle');

      // Re-render view via hash / router to reflect updated plan and progress bar
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    });
  });

  // Snooze in Smart Daily Plan (+15m)
  document.querySelectorAll('.smart-plan-snooze-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemId = btn.getAttribute('data-id');
      dailyPlanService.updatePlanItemStatus(patientId, itemId, PLAN_ITEM_STATUS.SNOOZED, { minutes: 15 });
      showToast('Reminder snoozed for 15 minutes.', 'snooze');

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    });
  });

  // Hear individual plan item audio
  document.querySelectorAll('.smart-plan-hear-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemId = btn.getAttribute('data-id');
      const plan = dailyPlanService.getTodayPlan(patientId);
      const item = plan?.items?.find(i => i.id === itemId);
      if (item) {
        const spoken = `${item.title}. ${item.scheduledTime ? 'Scheduled for ' + item.scheduledTime + '. ' : ''}${item.description || ''}`;
        voiceService.speak(spoken, { lang });
        showToast(`Reading: ${item.title}`, 'volume_up');
      }
    });
  });

  // Launch Recommended Cognitive Activity from Smart Daily Plan
  document.querySelectorAll('.smart-plan-activity-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const actId = btn.getAttribute('data-act-id');
      if (actId) {
        store.state.activeActivityId = actId;
      }
      window.location.hash = '#/activities';
    });
  });

  // View Appointment Details without marking as completed
  document.querySelectorAll('.smart-plan-appt-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sourceId = btn.getAttribute('data-source-id');
      const route = btn.getAttribute('data-route') || 'my-doctors';

      if (sourceId && sourceId.startsWith('rtn-')) {
        const r = state.routines.find(x => x.id === sourceId);
        if (r) {
          store.setSelectedReminderForDetail(r);
          store.setReminderDetailModalOpen(true);
          return;
        }
      }
      window.location.hash = `#/${route}`;
    });
  });

  // =================================================================
  // EXISTING DAILY CARE & ROUTINES EVENT LISTENERS (PRESERVED)
  // =================================================================

  // Listen to Schedule Voice Trigger
  const listenBtn = document.getElementById('listenMyDayBtn');
  const listenIcon = document.getElementById('listenMyDayIcon');
  const listenText = document.getElementById('listenMyDayText');

  if (listenBtn) {
    listenBtn.addEventListener('click', () => {
      if (voiceService.isSpeaking()) {
        voiceService.stop();
        if (listenText) listenText.textContent = i18nService.t('myDay.listenSchedule');
        if (listenIcon) listenIcon.textContent = 'volume_up';
        listenBtn.classList.remove('bg-error');
        listenBtn.classList.add('bg-primary');
        showToast('Spoken reading stopped', 'stop');
        return;
      }

      const patientReminders = store.getRemindersForPatient(patientId);
      const spokenSummary = voiceService.generateDayOverviewText(patientReminders, patientName, lang);

      if (listenText) listenText.textContent = i18nService.t('myDay.stopListening');
      if (listenIcon) listenIcon.textContent = 'stop_circle';
      listenBtn.classList.remove('bg-primary');
      listenBtn.classList.add('bg-error');

      voiceService.speak(spokenSummary, {
        lang,
        onEnd: () => {
          if (listenText) listenText.textContent = i18nService.t('myDay.listenSchedule');
          if (listenIcon) listenIcon.textContent = 'volume_up';
          listenBtn.classList.remove('bg-error');
          listenBtn.classList.add('bg-primary');
        },
        onError: () => {
          if (listenText) listenText.textContent = i18nService.t('myDay.listenSchedule');
          if (listenIcon) listenIcon.textContent = 'volume_up';
          listenBtn.classList.remove('bg-error');
          listenBtn.classList.add('bg-primary');
        }
      });
    });
  }

  // Toggle Buttons
  document.querySelectorAll('.my-day-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const r = state.routines.find(x => x.id === id);
      if (r) {
        if (r.completed) {
          store.updateReminder(id, { completed: false, status: REMINDER_STATUS.PENDING });
          dailyPlanService.updatePlanItemStatus(patientId, id, PLAN_ITEM_STATUS.PENDING);
          showToast(`Milestone marked pending: ${r.title}`, 'pending');
        } else {
          store.markReminderDone(id);
          dailyPlanService.updatePlanItemStatus(patientId, id, PLAN_ITEM_STATUS.COMPLETED);
          showToast(`Milestone completed: ${r.title}`, 'check_circle');
        }
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      }
    });
  });

  // Hear Reminder Buttons
  document.querySelectorAll('.reminder-hear-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const r = state.routines.find(x => x.id === id);
      if (r) {
        reminderService.hearReminder(r, patientName);
        showToast(`Reading aloud: ${r.title}`, 'volume_up');
      }
    });
  });

  // Snooze Buttons
  document.querySelectorAll('.reminder-snooze-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const r = state.routines.find(x => x.id === id);
      if (r) {
        store.snoozeReminder(id, 15);
        dailyPlanService.updatePlanItemStatus(patientId, id, PLAN_ITEM_STATUS.SNOOZED, { minutes: 15 });
        showToast(`Reminder snoozed for 15 minutes: ${r.title}`, 'snooze');
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      }
    });
  });

  // Detail Modal Buttons
  document.querySelectorAll('.reminder-detail-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const r = state.routines.find(x => x.id === id);
      if (r) {
        store.setSelectedReminderForDetail(r);
        store.setReminderDetailModalOpen(true);
      }
    });
  });

  // Notification Consent Trigger
  document.getElementById('openNotificationConsentBtn')?.addEventListener('click', () => {
    store.setNotificationPermissionModalOpen(true);
  });

  // Mood Check-in Widget Events
  const myDayMoodWrap = document.getElementById('myDayMoodCheckInWrap');
  if (myDayMoodWrap) {
    attachMoodCheckInEvents(myDayMoodWrap, () => {
      const w = document.getElementById('myDayMoodCheckInWrap');
      if (w) {
        w.innerHTML = renderMoodCheckInCard(patientId, true);
        attachMoodCheckInEvents(w);
      }
    });
  }
}
