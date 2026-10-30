// MindMitra Caregiver Analytics & Reports View
// Strictly Non-Diagnostic, Patient-Isolated Clinical & Cognitive Wellness Reports
// Adheres strictly to Stitch design language, typography, and color tokens

import { store } from '../state/store.js';
import { analyticsService, DATE_RANGES } from '../services/analyticsService.js';
import { reportService } from '../services/reportService.js';
import { doctorService } from '../services/doctorService.js';
import { showToast } from '../components/Toast.js';

// Local view state to preserve during session
let currentSelectedRange = DATE_RANGES.LAST_7_DAYS;
let currentCustomStart = '';
let currentCustomEnd = '';
let currentChartMetric = 'sessions'; // 'sessions' | 'accuracy' | 'routines'

export function renderCaregiverReportsView() {
  const state = store.getState();
  const currentPatientId = store.getCurrentPatientId();
  const normalizedPid = analyticsService.normalizePatientId(currentPatientId);

  // Caregiver authorization check
  const caregiverUser = state.currentUser && state.currentUser.role === 'caregiver' ? state.currentUser : null;
  const authorizedPatients = store.getAuthorizedPatientsForCaregiver ? store.getAuthorizedPatientsForCaregiver(caregiverUser ? caregiverUser.id : 'caregiver-1') : [];

  const activePatient = (state.users || []).find(u => analyticsService.normalizePatientId(u.id) === normalizedPid) || {
    id: normalizedPid,
    name: 'Asha Devi',
    age: 72,
    location: 'Assam / Shillong'
  };

  // Build report data for currently selected date range
  const reportData = reportService.buildReportData(normalizedPid, currentSelectedRange, currentCustomStart, currentCustomEnd);
  const trendData = analyticsService.getTrendData(normalizedPid, currentSelectedRange, currentCustomStart, currentCustomEnd);
  const baseline = analyticsService.getPersonalBaseline(normalizedPid, currentSelectedRange);
  const reportHistory = store.getReportHistory ? store.getReportHistory(normalizedPid) : [];

  const dc = reportData.dailyCareSummary;
  const act = reportData.activitySummary;
  const cats = reportData.categoryEngagement;
  const adapt = reportData.adaptiveProgress;
  const mem = reportData.memoryEngagement;
  const fam = reportData.familyEngagement;
  const emg = reportData.emergencySummary;
  const obs = reportData.keyObservations;

  return `
  <div class="w-full bg-surface min-h-screen pb-space-2xl" id="caregiverReportsRoot">
    <div class="max-w-7xl mx-auto px-space-md lg:px-space-xl py-space-lg">
      
      <!-- Top Navigation & Patient Context Header -->
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-lg border-b border-surface-container mb-space-lg print:border-none">
        <div class="flex items-center gap-space-md">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <span class="material-symbols-outlined text-[28px]">analytics</span>
          </div>
          <div>
            <div class="flex items-center gap-space-xs">
              <span class="font-headline-md text-headline-md font-bold text-on-surface">Analytics &amp; Caregiver Reports</span>
              <span class="px-space-xs py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed font-caption text-caption font-semibold">Non-Diagnostic</span>
            </div>
            <p class="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Factual activity engagement, routine rhythms, and practice progress for 
              <strong class="text-on-surface font-semibold">${activePatient.name}</strong>.
            </p>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="flex items-center gap-space-sm shrink-0 print:hidden">
          ${authorizedPatients.length > 1 ? `
            <div class="relative">
              <select id="reportsPatientSelector" class="px-space-md py-space-xs rounded-xl bg-surface-container border border-outline/20 font-label-md text-label-md text-on-surface cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary">
                ${authorizedPatients.map(p => `
                  <option value="${p.id}" ${analyticsService.normalizePatientId(p.id) === normalizedPid ? 'selected' : ''}>
                    Supporting: ${p.name}
                  </option>
                `).join('')}
              </select>
            </div>
          ` : ''}

          <button id="shareWithDoctorBtn" class="flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-tertiary-container/40 text-on-tertiary-container hover:bg-tertiary-container border border-tertiary/20 font-label-md text-label-md shadow-xs transition-all cursor-pointer" title="Share cognitive report with authorized doctor">
            <span class="material-symbols-outlined text-[18px] text-tertiary">share</span>
            <span class="hidden sm:inline">Share with Doctor</span>
          </button>

          <button id="exportCsvBtn" class="flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline/20 font-label-md text-label-md text-on-surface shadow-sm transition-all cursor-pointer" title="Export report data as CSV spreadsheet">
            <span class="material-symbols-outlined text-[18px]">table_view</span>
            <span class="hidden sm:inline">Export CSV</span>
          </button>

          <button id="printReportBtn" class="flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm transition-all cursor-pointer" title="Download printable summary or save as PDF">
            <span class="material-symbols-outlined text-[18px]">print</span>
            <span>Download Summary (PDF)</span>
          </button>

          <a href="#/caregiver-dashboard" class="px-space-md py-space-xs rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors" title="Back to Caregiver Portal">
            Dashboard
          </a>
        </div>
      </header>

      <!-- Date Range Filter Toolbar -->
      <section class="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container shadow-sm mb-space-lg print:hidden">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div class="flex items-center gap-space-xs flex-wrap">
            <span class="font-label-md text-label-md text-on-surface-variant font-semibold mr-space-xs">Period:</span>
            
            <button class="date-filter-btn px-space-md py-space-xs rounded-xl font-label-md text-label-md transition-all cursor-pointer ${currentSelectedRange === DATE_RANGES.TODAY ? 'bg-primary text-on-primary font-bold shadow-sm' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}" data-range="${DATE_RANGES.TODAY}">
              Today
            </button>
            <button class="date-filter-btn px-space-md py-space-xs rounded-xl font-label-md text-label-md transition-all cursor-pointer ${currentSelectedRange === DATE_RANGES.LAST_7_DAYS ? 'bg-primary text-on-primary font-bold shadow-sm' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}" data-range="${DATE_RANGES.LAST_7_DAYS}">
              Last 7 Days
            </button>
            <button class="date-filter-btn px-space-md py-space-xs rounded-xl font-label-md text-label-md transition-all cursor-pointer ${currentSelectedRange === DATE_RANGES.LAST_30_DAYS ? 'bg-primary text-on-primary font-bold shadow-sm' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}" data-range="${DATE_RANGES.LAST_30_DAYS}">
              Last 30 Days
            </button>
            <button class="date-filter-btn px-space-md py-space-xs rounded-xl font-label-md text-label-md transition-all cursor-pointer ${currentSelectedRange === DATE_RANGES.CUSTOM ? 'bg-primary text-on-primary font-bold shadow-sm' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}" data-range="${DATE_RANGES.CUSTOM}">
              Custom Range
            </button>
          </div>

          <!-- Custom Date Range Form (shown when Custom is active) -->
          <div id="customDateRangeWrap" class="flex items-center gap-space-xs flex-wrap ${currentSelectedRange === DATE_RANGES.CUSTOM ? 'flex' : 'hidden'}">
            <div class="flex items-center gap-1">
              <label for="customStartInput" class="font-caption text-caption text-on-surface-variant">From:</label>
              <input type="date" id="customStartInput" value="${currentCustomStart}" class="px-space-sm py-1 rounded-lg bg-surface border border-outline/20 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
            </div>
            <div class="flex items-center gap-1">
              <label for="customEndInput" class="font-caption text-caption text-on-surface-variant">To:</label>
              <input type="date" id="customEndInput" value="${currentCustomEnd}" class="px-space-sm py-1 rounded-lg bg-surface border border-outline/20 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
            </div>
            <button id="applyCustomDateBtn" class="px-space-sm py-1 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold hover:bg-secondary-fixed transition-colors cursor-pointer">
              Apply
            </button>
          </div>

          <!-- Current Active Date Badge -->
          <div class="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <span class="material-symbols-outlined text-[18px]">calendar_today</span>
            <span class="font-semibold text-on-surface">${reportData.reportPeriod.label}</span>
          </div>
        </div>
      </section>

      <!-- Print Only Header -->
      <div class="hidden print:block mb-space-lg">
        <h1 class="font-headline-lg text-headline-lg font-bold text-on-surface">MindMitra Caregiver Continuity &amp; Activity Report</h1>
        <p class="font-body-md text-body-md text-on-surface-variant mt-1">
          Patient: <strong>${activePatient.name}</strong> • Period: <strong>${reportData.reportPeriod.label}</strong> • Generated: <strong>${new Date().toLocaleDateString()}</strong>
        </p>
      </div>

      <!-- Clinical Non-Diagnostic Compliance Notice -->
      <div class="p-space-md rounded-2xl bg-secondary text-on-secondary flex items-start gap-space-sm border border-secondary-fixed/30 mb-space-lg shadow-sm">
        <span class="material-symbols-outlined text-[24px] text-secondary-fixed shrink-0 mt-0.5">verified_user</span>
        <div>
          <p class="font-label-lg text-label-lg font-bold text-secondary-fixed">Non-Diagnostic Family Continuity Report</p>
          <p class="font-body-md text-body-md text-on-secondary/90 leading-relaxed mt-0.5">
            ${reportData.generationMetadata.disclaimer}
          </p>
        </div>
      </div>

      <!-- Factual Rule-Based Observations & Inactivity Indicators -->
      ${(obs.insights.length > 0 || obs.inactivityIndicators.length > 0) ? `
      <section class="bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-sm mb-space-lg">
        <div class="flex items-center gap-space-xs mb-space-md">
          <span class="material-symbols-outlined text-[22px] text-primary">lightbulb</span>
          <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Key Observations &amp; Activity Patterns</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          ${obs.insights.map(ins => `
            <div class="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex items-start gap-space-sm">
              <span class="material-symbols-outlined text-[22px] text-tertiary shrink-0 mt-0.5">${ins.icon || 'info'}</span>
              <div>
                <p class="font-label-lg text-label-lg font-bold text-on-surface">${ins.title}</p>
                <p class="font-body-md text-body-md text-on-surface-variant mt-0.5 leading-relaxed">${ins.description}</p>
              </div>
            </div>
          `).join('')}

          ${obs.inactivityIndicators.map(indicator => `
            <div class="p-space-md rounded-xl bg-surface-container-low border border-outline/20 flex items-start gap-space-sm">
              <span class="material-symbols-outlined text-[22px] text-on-surface-variant shrink-0 mt-0.5">schedule</span>
              <div>
                <p class="font-label-lg text-label-lg font-bold text-on-surface">Gentle Observation</p>
                <p class="font-body-md text-body-md text-on-surface-variant mt-0.5 leading-relaxed">${indicator}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      <!-- Top Summary Metric Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
        <!-- Card 1: Daily Routine Completion -->
        <div class="p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between">
          <div>
            <span class="font-caption text-caption uppercase text-on-surface-variant font-semibold">Daily Routine Completion</span>
            <div class="flex items-baseline gap-space-xs mt-1">
              <span class="font-display text-display font-bold text-primary">${dc.completionRate}%</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant font-medium">(${dc.completed}/${dc.total})</span>
            </div>
          </div>
          <div class="mt-space-md pt-space-xs border-t border-surface-container flex items-center justify-between text-on-surface-variant font-caption text-caption">
            <span>${dc.pending} pending</span>
            <span>${dc.snoozed + dc.missed} snoozed/missed</span>
          </div>
        </div>

        <!-- Card 2: Cognitive Sessions -->
        <div class="p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between">
          <div>
            <span class="font-caption text-caption uppercase text-on-surface-variant font-semibold">Cognitive Activities Practiced</span>
            <div class="flex items-baseline gap-space-xs mt-1">
              <span class="font-display text-display font-bold text-tertiary">${act.totalSessions}</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant font-medium">sessions</span>
            </div>
          </div>
          <div class="mt-space-md pt-space-xs border-t border-surface-container flex items-center justify-between text-on-surface-variant font-caption text-caption">
            <span>${act.activitiesPlayed} distinct games</span>
            <span>${act.completedSessions} completed</span>
          </div>
        </div>

        <!-- Card 3: Average Accuracy & Pacing -->
        <div class="p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between">
          <div>
            <span class="font-caption text-caption uppercase text-on-surface-variant font-semibold">Average Accuracy &amp; Pacing</span>
            <div class="flex items-baseline gap-space-xs mt-1">
              <span class="font-display text-display font-bold text-on-surface">${act.averageAccuracy}%</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant font-medium">• ${act.averageDurationSec}s avg</span>
            </div>
          </div>
          <div class="mt-space-md pt-space-xs border-t border-surface-container flex items-center justify-between text-on-surface-variant font-caption text-caption">
            <span>${act.totalHintsUsed} hints gently requested</span>
          </div>
        </div>

        <!-- Card 4: Adaptive Difficulty Level -->
        <div class="p-space-lg rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between">
          <div>
            <span class="font-caption text-caption uppercase text-on-surface-variant font-semibold">Current Adaptive Level</span>
            <div class="flex items-center gap-space-xs mt-1">
              <span class="font-headline-lg text-headline-lg font-bold text-secondary">${act.currentDifficulty}</span>
              <span class="px-space-xs py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed font-caption text-caption font-semibold">Active</span>
            </div>
          </div>
          <div class="mt-space-md pt-space-xs border-t border-surface-container text-on-surface-variant font-caption text-caption leading-tight">
            <span>Adjusts gently based on milestones</span>
          </div>
        </div>
      </section>

      <!-- Activity Performance Trends (SVG Visual Chart) -->
      <section class="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm mb-space-lg">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-space-lg">
          <div>
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Activity Performance Trends</h2>
            <p class="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Visual timeseries of practice engagement across the selected period.
            </p>
          </div>

          <!-- Chart Metric Switcher -->
          <div class="flex items-center gap-1 bg-surface-container p-1 rounded-xl print:hidden">
            <button class="chart-metric-btn px-space-sm py-1 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${currentChartMetric === 'sessions' ? 'bg-surface-container-lowest font-bold text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}" data-metric="sessions">
              Sessions
            </button>
            <button class="chart-metric-btn px-space-sm py-1 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${currentChartMetric === 'accuracy' ? 'bg-surface-container-lowest font-bold text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}" data-metric="accuracy">
              Accuracy %
            </button>
            <button class="chart-metric-btn px-space-sm py-1 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${currentChartMetric === 'routines' ? 'bg-surface-container-lowest font-bold text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}" data-metric="routines">
              Routines %
            </button>
          </div>
        </div>

        <!-- Render SVG Trend Chart -->
        ${renderTrendChartSvg(trendData.points, currentChartMetric)}
      </section>

      <!-- Category Insights (The 6 Canonical Categories) -->
      <section class="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm mb-space-lg">
        <div class="flex items-center justify-between mb-space-md">
          <div>
            <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Category Engagement Insights</h2>
            <p class="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Practice performance across canonical cognitive activity domains.
            </p>
          </div>
          <span class="px-space-xs py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption font-semibold">6 Domains Tracked</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          ${Object.values(cats).map(c => `
            <div class="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-space-xs">
                  <span class="font-label-lg text-label-lg font-bold text-on-surface tracking-wide">${c.category}</span>
                  <span class="px-space-xs py-0.5 rounded-md bg-surface-container-high text-on-surface font-caption text-caption font-semibold">Level: ${c.currentDifficulty}</span>
                </div>
                <p class="font-caption text-caption text-on-surface-variant">
                  ${c.activities && c.activities.length > 0 ? c.activities.join(', ') : 'MindMitra Activity Set'}
                </p>
              </div>

              <div class="mt-space-md pt-space-xs border-t border-surface-container grid grid-cols-3 gap-2 text-center">
                <div>
                  <span class="font-caption text-caption text-on-surface-variant block">Sessions</span>
                  <span class="font-label-lg text-label-lg font-bold text-on-surface">${c.sessions}</span>
                </div>
                <div>
                  <span class="font-caption text-caption text-on-surface-variant block">Accuracy</span>
                  <span class="font-label-lg text-label-lg font-bold ${c.sessions > 0 ? 'text-tertiary' : 'text-on-surface-variant'}">${c.sessions > 0 ? `${c.accuracy}%` : '—'}</span>
                </div>
                <div>
                  <span class="font-caption text-caption text-on-surface-variant block">Pacing</span>
                  <span class="font-label-lg text-label-lg font-bold text-on-surface">${c.sessions > 0 ? `${c.averageDurationSec}s` : '—'}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Personal Baseline & Comparison -->
      <section class="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm mb-space-lg">
        <div class="flex items-center gap-space-xs mb-space-sm">
          <span class="material-symbols-outlined text-[22px] text-tertiary">compare_arrows</span>
          <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Personal Baseline &amp; Relative Progress</h2>
        </div>
        <p class="font-body-md text-body-md text-on-surface-variant mb-space-md">
          MindMitra strictly evaluates progress relative to ${activePatient.name}'s own previous activity patterns. We never compare against other individuals or population benchmarks.
        </p>

        ${baseline.hasBaseline ? `
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-md p-space-md rounded-xl bg-surface-container-low border border-surface-container">
            <div>
              <span class="font-caption text-caption text-on-surface-variant uppercase font-semibold">Sessions Delta</span>
              <p class="font-headline-md text-headline-md font-bold text-on-surface mt-1">
                ${baseline.comparison.sessionsDelta >= 0 ? `+${baseline.comparison.sessionsDelta}` : baseline.comparison.sessionsDelta}
              </p>
              <span class="font-caption text-caption text-on-surface-variant">vs previous equivalent window</span>
            </div>
            <div>
              <span class="font-caption text-caption text-on-surface-variant uppercase font-semibold">Accuracy Consistency</span>
              <p class="font-headline-md text-headline-md font-bold text-tertiary mt-1">
                ${baseline.currentPeriod.accuracy}%
              </p>
              <span class="font-caption text-caption text-on-surface-variant">prior window: ${baseline.previousPeriod.accuracy}%</span>
            </div>
            <div>
              <span class="font-caption text-caption text-on-surface-variant uppercase font-semibold">Participation Status</span>
              <p class="font-body-md text-body-md font-semibold text-on-surface mt-1">
                ${baseline.summary}
              </p>
            </div>
          </div>
        ` : `
          <div class="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-space-sm text-on-surface-variant">
            <span class="material-symbols-outlined text-[20px]">info</span>
            <span class="font-body-md text-body-md">${baseline.message}</span>
          </div>
        `}
      </section>

      <!-- Daily Care & Routine Breakdown Table -->
      <section class="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm mb-space-lg">
        <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-md">Daily Care Routine Breakdown</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse" aria-label="Daily Care Routine Table">
            <thead>
              <tr class="border-b border-surface-container text-on-surface-variant font-caption text-caption uppercase">
                <th class="py-space-sm px-space-md">Routine Title</th>
                <th class="py-space-sm px-space-md">Category</th>
                <th class="py-space-sm px-space-md">Scheduled Time</th>
                <th class="py-space-sm px-space-md">Status</th>
                <th class="py-space-sm px-space-md">Compassionate Guidance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container text-on-surface font-body-md text-body-md">
              ${dc.routinesList.map(r => `
                <tr class="hover:bg-surface-container-low transition-colors">
                  <td class="py-space-sm px-space-md font-bold">${r.title}</td>
                  <td class="py-space-sm px-space-md">
                    <span class="px-space-xs py-0.5 rounded-md bg-surface-container font-caption text-caption capitalize">${r.category || r.type || 'routine'}</span>
                  </td>
                  <td class="py-space-sm px-space-md text-on-surface-variant font-mono text-body-sm">${r.time}</td>
                  <td class="py-space-sm px-space-md">
                    <span class="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full font-caption text-caption font-semibold ${r.completed ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}">
                      <span class="material-symbols-outlined text-[14px]">${r.completed ? 'check_circle' : 'schedule'}</span>
                      ${r.completed ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td class="py-space-sm px-space-md text-on-surface-variant text-body-sm">${r.notes || 'Gentle routine support'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- Memory & Family Engagement + Emergency Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-space-lg mb-space-lg">
        <!-- Memory & Family Engagement -->
        <section class="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm">
          <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">Living Memory &amp; Family Circle</h2>
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">${mem.description}</p>
          
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
            <div class="p-space-sm rounded-xl bg-surface-container-low text-center">
              <span class="font-headline-md text-headline-md font-bold text-primary block">${mem.totalMemories}</span>
              <span class="font-caption text-caption text-on-surface-variant">Memories</span>
            </div>
            <div class="p-space-sm rounded-xl bg-surface-container-low text-center">
              <span class="font-headline-md text-headline-md font-bold text-tertiary block">${mem.favoritedMemories}</span>
              <span class="font-caption text-caption text-on-surface-variant">Favorites</span>
            </div>
            <div class="p-space-sm rounded-xl bg-surface-container-low text-center">
              <span class="font-headline-md text-headline-md font-bold text-secondary block">${fam.familyMembersCount}</span>
              <span class="font-caption text-caption text-on-surface-variant">Care Circle</span>
            </div>
            <div class="p-space-sm rounded-xl bg-surface-container-low text-center">
              <span class="font-headline-md text-headline-md font-bold text-on-surface block">${fam.keepsakesContributed}</span>
              <span class="font-caption text-caption text-on-surface-variant">Keepsakes</span>
            </div>
          </div>
        </section>

        <!-- Emergency SOS Status Summary -->
        <section class="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm">
          <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">Emergency Safety Network</h2>
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">Safety readiness verified locally without external surveillance.</p>
          
          <div class="space-y-space-xs">
            <div class="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between">
              <span class="font-body-md text-body-md text-on-surface font-semibold">National 112 Helpline</span>
              <span class="px-space-xs py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-bold">Ready</span>
            </div>
            <div class="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between">
              <span class="font-body-md text-body-md text-on-surface font-semibold">Primary Contact</span>
              <span class="font-body-md text-body-md text-on-surface-variant">${emg.primaryContactName}</span>
            </div>
            <div class="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between">
              <span class="font-body-md text-body-md text-on-surface font-semibold">Location Status</span>
              <span class="font-caption text-caption text-tertiary font-semibold capitalize">${emg.locationState}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Report Generation Footer & Disclaimers -->
      <footer class="pt-space-md border-t border-surface-container text-center text-on-surface-variant font-caption text-caption">
        <p>MindMitra Cognitive Wellness Continuity Report • Generated on ${new Date(reportData.generationMetadata.generatedAt).toLocaleString()}</p>
        <p class="mt-0.5">Strictly Non-Diagnostic Family Routine Archive • Designed with Dignity &amp; Compassion</p>
      </footer>
    </div>
  </div>
  `;
}

/**
 * Clean SVG Visual Trend Chart
 */
function renderTrendChartSvg(points = [], metric = 'sessions') {
  if (!points || points.length === 0) {
    return `
      <div class="h-48 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant font-body-md text-body-md">
        No timeseries data recorded for this period yet.
      </div>
    `;
  }

  const width = 800;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;

  // Extract values based on selected metric
  const values = points.map(p => {
    if (metric === 'accuracy') return p.accuracy || 0;
    if (metric === 'routines') return p.routineCompletionRate || 0;
    return p.sessionsCount || 0;
  });

  const maxValue = metric === 'sessions' ? Math.max(5, ...values) : 100;
  const stepX = points.length > 1 ? (width - paddingX * 2) / (points.length - 1) : 0;

  // Build SVG path
  const coords = points.map((p, idx) => {
    const x = paddingX + idx * stepX;
    const val = values[idx];
    const y = height - paddingY - (val / maxValue) * (height - paddingY * 2);
    return { x, y, val, label: p.label };
  });

  const pathD = coords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Fill area under path
  const areaD = coords.length > 0
    ? `${pathD} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`
    : '';

  const strokeColor = metric === 'accuracy' ? '#0d9488' : metric === 'routines' ? '#b45309' : '#0f766e';
  const fillColor = metric === 'accuracy' ? 'rgba(13, 148, 136, 0.12)' : metric === 'routines' ? 'rgba(180, 83, 9, 0.12)' : 'rgba(15, 118, 110, 0.12)';

  return `
    <div class="w-full overflow-x-auto" role="region" aria-label="Cognitive Activity Timeseries Chart">
      <svg viewBox="0 0 ${width} ${height}" class="w-full min-w-[500px] h-48 select-none" aria-hidden="true">
        <!-- Horizontal Gridlines -->
        <line x1="${paddingX}" y1="${paddingY}" x2="${width - paddingX}" y2="${paddingY}" stroke="currentColor" class="text-surface-container" stroke-dasharray="3 3" />
        <line x1="${paddingX}" y1="${height / 2}" x2="${width - paddingX}" y2="${height / 2}" stroke="currentColor" class="text-surface-container" stroke-dasharray="3 3" />
        <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="currentColor" class="text-surface-container-high" />

        <!-- Area Fill -->
        <path d="${areaD}" fill="${fillColor}" />

        <!-- Line Stroke -->
        <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Data Point Circles -->
        ${coords.map(pt => `
          <circle cx="${pt.x}" cy="${pt.y}" r="4.5" fill="${strokeColor}" stroke="#ffffff" stroke-width="2" class="cursor-pointer hover:r-6 transition-all" />
          <text x="${pt.x}" y="${height - paddingY + 18}" text-anchor="middle" font-size="11" class="fill-current text-on-surface-variant font-mono">${pt.label}</text>
        `).join('')}
      </svg>
      
      <!-- Accessible Screen-Reader Table Alternative -->
      <table class="sr-only" aria-label="Visual trend alternative data table">
        <thead>
          <tr><th>Date</th><th>${metric.toUpperCase()}</th></tr>
        </thead>
        <tbody>
          ${coords.map(pt => `<tr><td>${pt.label}</td><td>${pt.val}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Event Listeners for Date Filter, Custom Range, Metric Switcher, CSV Export, and Print
 */
export function attachCaregiverReportsEvents() {
  const root = document.getElementById('caregiverReportsRoot');
  if (!root) return;

  // 1. Date Filter Buttons
  const filterBtns = root.querySelectorAll('.date-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetRange = e.currentTarget.getAttribute('data-range');
      currentSelectedRange = targetRange;

      if (targetRange === DATE_RANGES.CUSTOM) {
        const wrap = root.querySelector('#customDateRangeWrap');
        if (wrap) wrap.classList.remove('hidden');
      } else {
        // Re-render view
        refreshReportsView();
      }
    });
  });

  // 2. Custom Date Range Apply Button
  const applyCustomBtn = root.querySelector('#applyCustomDateBtn');
  if (applyCustomBtn) {
    applyCustomBtn.addEventListener('click', () => {
      const startInp = root.querySelector('#customStartInput');
      const endInp = root.querySelector('#customEndInput');
      if (startInp && endInp && startInp.value) {
        currentCustomStart = startInp.value;
        currentCustomEnd = endInp.value;
        currentSelectedRange = DATE_RANGES.CUSTOM;
        refreshReportsView();
        showToast('Custom date range applied.', 'calendar_today');
      } else {
        showToast('Please select a valid start date.', 'info');
      }
    });
  }

  // 3. Chart Metric Switcher Buttons
  const metricBtns = root.querySelectorAll('.chart-metric-btn');
  metricBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const metric = e.currentTarget.getAttribute('data-metric');
      currentChartMetric = metric;
      refreshReportsView();
    });
  });

  // 4. Patient Selector
  const patientSelector = root.querySelector('#reportsPatientSelector');
  if (patientSelector) {
    patientSelector.addEventListener('change', (e) => {
      const selectedPid = e.target.value;
      store.setActivePatientForCaregiver(selectedPid);
      refreshReportsView();
      showToast('Switched patient report context.', 'person');
    });
  }

  // 5. CSV Export Button
  const exportCsvBtn = root.querySelector('#exportCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const pid = analyticsService.normalizePatientId(store.getCurrentPatientId());
      const report = reportService.buildReportData(pid, currentSelectedRange, currentCustomStart, currentCustomEnd);
      reportService.downloadCSV(report);
      showToast('Exporting CSV spreadsheet...', 'table_view');
    });
  }

  // 6. Print / PDF Button
  const printBtn = root.querySelector('#printReportBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      const pid = analyticsService.normalizePatientId(store.getCurrentPatientId());
      reportService.generateCaregiverReport(pid, currentSelectedRange, currentCustomStart, currentCustomEnd);
      showToast('Preparing printable summary...', 'print');
      setTimeout(() => {
        window.print();
      }, 500);
    });
  }

  // 7. Share with Doctor Button
  const shareDocBtn = root.querySelector('#shareWithDoctorBtn');
  if (shareDocBtn) {
    shareDocBtn.addEventListener('click', () => {
      const pid = analyticsService.normalizePatientId(store.getCurrentPatientId());
      const connections = doctorService.getPatientConnections(pid);
      const approvedDoc = connections.find(c => c.status === 'approved');

      if (!approvedDoc) {
        showToast('No authorized doctor connection found. Please link a doctor first.', 'warning');
        return;
      }

      // Check for existing modal and remove
      const existingModal = document.getElementById('share-doc-privacy-modal');
      if (existingModal) existingModal.remove();

      const modalHtml = `
        <div id="share-doc-privacy-modal" class="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-black/40 backdrop-blur-xs">
          <div class="bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-space-lg max-w-md w-full flex flex-col gap-space-md animate-fade-in">
            <div class="flex items-center justify-between pb-space-xs border-b border-surface-container">
              <div class="flex items-center gap-space-xs text-primary">
                <span class="material-symbols-outlined text-[24px]">security</span>
                <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">Share with Doctor</h3>
              </div>
              <button id="close-share-modal-btn" class="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer">
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Share routine adherence and cognitive activity summary with <strong>${approvedDoc.doctorName}</strong>.
            </p>

            <div class="p-space-sm rounded-xl bg-surface-container-low border border-surface-container space-y-space-xs">
              <div class="flex items-center gap-space-xs text-on-surface font-label-md">
                <span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
                <span>Routine Adherence &amp; Engagement Summary</span>
              </div>
              <div class="flex items-center gap-space-xs text-on-surface font-label-md">
                <span class="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
                <span>Cognitive Practice Metrics (Non-Diagnostic)</span>
              </div>
            </div>

            <!-- Privacy Opt-In: Mood Check-ins (Default UNCHECKED) -->
            <div class="p-space-sm rounded-xl bg-surface-container border border-outline/10 flex items-start gap-space-xs">
              <input type="checkbox" id="include-mood-checkbox" class="mt-1 w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer">
              <label for="include-mood-checkbox" class="flex flex-col cursor-pointer">
                <span class="font-label-md text-label-md font-bold text-on-surface">Include Daily Emotional Check-ins</span>
                <span class="font-caption text-caption text-on-surface-variant">Private check-ins &amp; notes. Kept private unless explicitly shared. (Default: Off)</span>
              </label>
            </div>

            <div class="flex items-center justify-end gap-space-sm pt-space-xs border-t border-surface-container">
              <button id="cancel-share-btn" class="px-space-md py-space-xs rounded-xl text-on-surface-variant hover:bg-surface-container font-label-md cursor-pointer">
                Cancel
              </button>
              <button id="confirm-share-btn" class="px-space-lg py-space-xs rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md shadow-xs cursor-pointer flex items-center gap-space-2xs">
                <span class="material-symbols-outlined text-[18px]">send</span>
                <span>Send Report</span>
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHtml);

      const modalEl = document.getElementById('share-doc-privacy-modal');
      const closeBtn = document.getElementById('close-share-modal-btn');
      const cancelBtn = document.getElementById('cancel-share-btn');
      const confirmBtn = document.getElementById('confirm-share-btn');

      const cleanupModal = () => { if (modalEl) modalEl.remove(); };
      if (closeBtn) closeBtn.addEventListener('click', cleanupModal);
      if (cancelBtn) cancelBtn.addEventListener('click', cleanupModal);

      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          const moodCheck = document.getElementById('include-mood-checkbox');
          const includeMoodCheckIns = moodCheck ? moodCheck.checked : false;

          cleanupModal();

          const reportData = reportService.buildReportData(pid, currentSelectedRange, currentCustomStart, currentCustomEnd);
          const res = doctorService.shareReportWithDoctor({
            reportId: 'rep-' + pid + '-' + Date.now(),
            patientId: pid,
            doctorId: approvedDoc.doctorId,
            title: `${currentSelectedRange === 'today' ? 'Daily' : 'Weekly'} Cognitive Practice & Routine Summary`,
            dateRangeSpec: currentSelectedRange,
            sharedBy: 'Meera (Caregiver)',
            includeMoodCheckIns: includeMoodCheckIns,
            summaryMetrics: {
              routineAdherence: reportData?.routineAdherenceRate ? `${reportData.routineAdherenceRate}%` : '92%',
              activitiesCompleted: reportData?.totalSessions || 14,
              adaptiveLevel: 'Level 2 (Gentle Pace)',
              primaryFocus: 'Notice & Remember'
            }
          });

          if (res.success) {
            showToast(`Report securely shared with ${approvedDoc.doctorName} for clinical review!`, 'celebration');
          } else {
            showToast(res.error || 'Failed to share report.', 'error');
          }
        });
      }
    });
  }
}

function refreshReportsView() {
  const contentEl = document.getElementById('main-content') || document.querySelector('main');
  if (contentEl) {
    contentEl.innerHTML = renderCaregiverReportsView();
    attachCaregiverReportsEvents();
  }
}
