// MindMitra Caregiver Report Service
// Standardized Non-Diagnostic Report Generation, PDF/Print Preparation, and CSV Export
// Strictly Patient-Isolated & Compliant with Clinical Boundaries

import { store } from '../state/store.js';
import { analyticsService, DATE_RANGES } from './analyticsService.js';
import { securityService } from './securityService.js';

class ReportService {
  /**
   * Builds the canonical 11-section caregiver report data object
   */
  buildReportData(patientId, dateRangeSpec = DATE_RANGES.LAST_7_DAYS, customStart = null, customEnd = null) {
    const pid = analyticsService.normalizePatientId(patientId || store.getCurrentPatientId());
    const state = store.getState();

    // 1. Patient Profile
    const patientUser = (state.users || []).find(u => analyticsService.normalizePatientId(u.id) === pid) || {
      id: pid,
      name: 'Asha Devi',
      age: 72,
      languages: ['Hindi', 'English']
    };

    // 2. Report Period
    const dateRange = analyticsService.parseDateRange(dateRangeSpec, customStart, customEnd);

    // 3. Daily Care Summary
    const dailyCare = analyticsService.getDailyCareAnalytics(pid, dateRangeSpec, customStart, customEnd);

    // 4. Cognitive Activity Summary
    const activitySummary = analyticsService.getActivityAnalytics(pid, dateRangeSpec, customStart, customEnd);

    // 5. Activity Category Engagement (6 Canonical Categories)
    const categoryEngagement = analyticsService.getCategoryAnalytics(pid, dateRangeSpec, customStart, customEnd);

    // 6. Adaptive Difficulty Progress
    const adaptiveProgress = analyticsService.getAdaptiveProgress(pid);

    // 7. Memory Engagement
    const memoryEngagement = analyticsService.getMemoryEngagement(pid, dateRangeSpec);

    // 8. Family / Social Engagement
    const familyEngagement = analyticsService.getFamilyEngagement(pid);

    // 9. Emergency / SOS Events
    const emergencySummary = analyticsService.getEmergencyAnalytics(pid);

    // 10. Key Observations & Attention Indicators
    const insights = analyticsService.generateInsights(pid, dateRangeSpec);
    const inactivityIndicators = analyticsService.getInactivityIndicators(pid, dateRangeSpec);

    // 11. Generation Metadata & Disclaimer
    const disclaimer = 'MindMitra is a supportive routine companion and cognitive engagement platform. This report provides factual observations of daily participation rhythms and practice engagement for family reassurance and care continuity. It does not provide medical advice, diagnosis, or clinical assessment.';

    return {
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      patientId: pid,
      patientProfile: {
        id: patientUser.id,
        name: patientUser.name || 'Asha Devi',
        age: patientUser.age || 72,
        primaryLanguage: (patientUser.languages && patientUser.languages[0]) || 'Hindi',
        location: patientUser.location || 'Assam / Shillong'
      },
      reportPeriod: {
        type: dateRange.type,
        label: dateRange.label,
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString()
      },
      dailyCareSummary: dailyCare,
      activitySummary,
      categoryEngagement: categoryEngagement.categories,
      adaptiveProgress,
      memoryEngagement,
      familyEngagement,
      emergencySummary,
      keyObservations: {
        insights,
        inactivityIndicators
      },
      generationMetadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'Caregiver Portal',
        disclaimer
      }
    };
  }

  /**
   * Generates a complete report and records in local report history
   */
  generateCaregiverReport(patientId, dateRangeSpec = DATE_RANGES.LAST_7_DAYS, customStart = null, customEnd = null, requesterUser = null) {
    const user = requesterUser || store.getState().currentUser;
    const pid = analyticsService.normalizePatientId(patientId || store.getCurrentPatientId());

    // Authorization verification: Caregiver must be authorized for this patient
    if (user && user.role === 'caregiver' && !store.isAuthorizedForPatient(user.id, pid)) {
      throw new Error(`Unauthorized: Caregiver is not authorized to generate report for patient ${pid}`);
    }

    const report = this.buildReportData(pid, dateRangeSpec, customStart, customEnd);

    const historyRecord = {
      id: report.id,
      patientId: report.patientId,
      patientName: report.patientProfile.name,
      dateRangeLabel: report.reportPeriod.label,
      createdAt: report.generationMetadata.generatedAt,
      reportType: 'Cognitive Wellness & Daily Care Continuity Summary',
      completionRate: report.dailyCareSummary.completionRate,
      sessionsCount: report.activitySummary.totalSessions
    };

    try {
      store.saveReportHistory(historyRecord);
    } catch (e) {
      console.warn('[ReportService] Could not save history record:', e);
    }

    return report;
  }

  /**
   * Exports report activity sessions & routines to standard CSV format
   * Hardened against CSV formula injection (DDE)
   */
  exportReportCSV(reportData) {
    if (!reportData) return '';

    const lines = [];

    // Header metadata
    lines.push('MindMitra Caregiver Continuity & Activity Report');
    lines.push(`Patient:,"${securityService.sanitizeCsvValue(reportData.patientProfile.name)}"`);
    lines.push(`Period:,"${securityService.sanitizeCsvValue(reportData.reportPeriod.label)}"`);
    lines.push(`Generated:,"${securityService.sanitizeCsvValue(reportData.generationMetadata.generatedAt)}"`);
    lines.push(`Disclaimer:,"${securityService.sanitizeCsvValue(reportData.generationMetadata.disclaimer)}"`);
    lines.push('');

    // Section 1: Daily Care Summary
    lines.push('--- DAILY CARE SUMMARY ---');
    lines.push('Total Routines,Completed,Pending,Snoozed,Skipped,Missed,Completion Rate');
    const dc = reportData.dailyCareSummary;
    lines.push(`${dc.total},${dc.completed},${dc.pending},${dc.snoozed},${dc.skipped},${dc.missed},${dc.completionRate}%`);
    lines.push('');

    // Section 2: Cognitive Activity Summary
    lines.push('--- COGNITIVE ACTIVITY SUMMARY ---');
    lines.push('Total Sessions,Completed Sessions,Activities Played,Average Accuracy,Average Duration (sec),Hints Used,Adaptive Level');
    const act = reportData.activitySummary;
    lines.push(`${act.totalSessions},${act.completedSessions},${act.activitiesPlayed},${act.averageAccuracy}%,${act.averageDurationSec}s,${act.totalHintsUsed},${act.currentDifficulty}`);
    lines.push('');

    // Section 3: Category Engagement
    lines.push('--- CATEGORY ENGAGEMENT ---');
    lines.push('Category,Sessions,Completed,Average Accuracy,Average Duration (sec),Hints Used,Difficulty');
    const cats = reportData.categoryEngagement || {};
    Object.values(cats).forEach(c => {
      lines.push(`"${securityService.sanitizeCsvValue(c.category)}",${c.sessions},${c.completed},${c.accuracy}%,${c.averageDurationSec}s,${c.hintsUsed},"${securityService.sanitizeCsvValue(c.currentDifficulty)}"`);
    });
    lines.push('');

    // Section 4: Individual Activity Sessions
    lines.push('--- RECENT ACTIVITY SESSIONS ---');
    lines.push('Session ID,Activity Name,Category,Accuracy,Completion Time (sec),Hints Used,Difficulty,Date');
    const sessions = act.sessions || [];
    if (sessions.length > 0) {
      sessions.forEach(s => {
        lines.push(`"${securityService.sanitizeCsvValue(s.id)}","${securityService.sanitizeCsvValue(s.activityName)}","${securityService.sanitizeCsvValue(s.category)}",${s.accuracy || 0}%,${s.completionTimeSec || s.duration || 0},${s.hintsUsed || 0},"${securityService.sanitizeCsvValue(s.difficultyLevel || 1)}","${securityService.sanitizeCsvValue(s.timestamp)}"`);
      });
    } else {
      lines.push('No individual sessions recorded for this period.');
    }
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Helper to trigger CSV file download in browser with safe filename
   */
  downloadCSV(reportData, filename = null) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return this.exportReportCSV(reportData);
    }
    const csvContent = this.exportReportCSV(reportData);
    const safeName = filename || securityService.generateSafeReportFilename(reportData.patientId, 'care-report');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', safeName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return csvContent;
  }
}

export const reportService = new ReportService();
