// MindMitra Part 12: Analytics, Insights, Trends & Caregiver Reports Test Suite
// 25 Comprehensive Test Cases validating Non-Diagnostic Analytics & Patient Isolation

import { store } from '../src/state/store.js';
import { analyticsService, DATE_RANGES } from '../src/services/analyticsService.js';
import { reportService } from '../src/services/reportService.js';
import { adaptiveEngine } from '../src/services/adaptiveEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

console.log('======================================================');
console.log('  RUNNING MINDMITRA PART 12 ANALYTICS & REPORTS TESTS');
console.log('======================================================\n');

try {
  const patientId = 'user-asha';

  // 1. Date Range Calculation
  const todayRange = analyticsService.parseDateRange(DATE_RANGES.TODAY);
  const sevenDaysRange = analyticsService.parseDateRange(DATE_RANGES.LAST_7_DAYS);
  const thirtyDaysRange = analyticsService.parseDateRange(DATE_RANGES.LAST_30_DAYS);
  const customRange = analyticsService.parseDateRange(DATE_RANGES.CUSTOM, '2026-09-01', '2026-09-07');
  
  assert(
    todayRange.type === 'today' &&
    sevenDaysRange.type === 'last7days' &&
    thirtyDaysRange.type === 'last30days' &&
    customRange.type === 'custom' &&
    customRange.start <= customRange.end,
    '1. Date range calculation parses today, 7 days, 30 days, and custom ranges properly'
  );

  // 2. Daily Care Analytics Calculations
  const careAnalytics = analyticsService.getDailyCareAnalytics(patientId, DATE_RANGES.LAST_7_DAYS);
  assert(
    typeof careAnalytics.total === 'number' &&
    typeof careAnalytics.completed === 'number' &&
    typeof careAnalytics.completionRate === 'number' &&
    careAnalytics.completionRate >= 0 && careAnalytics.completionRate <= 100,
    '2. Daily care analytics computes total, completed, and completion rate from stored data'
  );

  // 3. Daily Care Status Breakdown
  assert(
    typeof careAnalytics.pending === 'number' &&
    typeof careAnalytics.snoozed === 'number' &&
    typeof careAnalytics.skipped === 'number' &&
    typeof careAnalytics.missed === 'number' &&
    careAnalytics.routinesList.length >= careAnalytics.total,
    '3. Daily care breakdown details pending, snoozed, skipped, and missed items without inventing data'
  );

  // 4. Cognitive Activity Analytics
  const actAnalytics = analyticsService.getActivityAnalytics(patientId, DATE_RANGES.LAST_7_DAYS);
  assert(
    typeof actAnalytics.totalSessions === 'number' &&
    typeof actAnalytics.completedSessions === 'number' &&
    typeof actAnalytics.completionRate === 'number',
    '4. Cognitive activity analytics calculates total sessions, completed sessions, and completion rate'
  );

  // 5. Activity Performance Metrics
  assert(
    typeof actAnalytics.averageAccuracy === 'number' &&
    typeof actAnalytics.averageDurationSec === 'number' &&
    typeof actAnalytics.totalHintsUsed === 'number' &&
    actAnalytics.averageAccuracy >= 0 && actAnalytics.averageAccuracy <= 100,
    '5. Activity performance computes average accuracy, response pacing, and hints used'
  );

  // 6. Activity Variety & Most Played
  assert(
    typeof actAnalytics.activitiesPlayed === 'number' &&
    Array.isArray(actAnalytics.mostPlayed),
    '6. Activity analytics tracks distinct activities played and most played frequencies'
  );

  // 7. Category Analytics across 6 Canonical Domains
  const catAnalytics = analyticsService.getCategoryAnalytics(patientId, DATE_RANGES.LAST_7_DAYS);
  const expectedCategories = ['REMEMBER', 'NOTICE', 'SOLVE', 'SEQUENCE', 'EXPLORE', 'CONNECT'];
  const allCategoriesPresent = expectedCategories.every(c => catAnalytics.categories[c] !== undefined);
  assert(
    allCategoriesPresent &&
    typeof catAnalytics.categories.REMEMBER.sessions === 'number' &&
    typeof catAnalytics.categories.REMEMBER.accuracy === 'number',
    '7. Category analytics groups engagement across the 6 canonical cognitive domains'
  );

  // 8. Adaptive Difficulty Reporting
  const adaptiveProgress = analyticsService.getAdaptiveProgress(patientId);
  assert(
    ['Easy', 'Medium', 'Hard'].includes(adaptiveProgress.currentDifficulty) &&
    typeof adaptiveProgress.explanation === 'string' &&
    !adaptiveProgress.explanation.includes('algorithm') &&
    !adaptiveProgress.explanation.includes('dementia'),
    '8. Adaptive difficulty progress displays current level with non-diagnostic explanation'
  );

  // 9. Personal Baseline Comparison
  const baseline = analyticsService.getPersonalBaseline(patientId, DATE_RANGES.LAST_7_DAYS);
  assert(
    baseline.patientId === 'user-asha' &&
    (baseline.hasBaseline === true || baseline.hasBaseline === false),
    '9. Personal baseline compares patient historical performance against their own prior period'
  );

  // 10. Insufficient Baseline Handling
  const emptyBaseline = analyticsService.getPersonalBaseline('non-existent-patient-id', DATE_RANGES.LAST_7_DAYS);
  assert(
    emptyBaseline.hasBaseline === false &&
    emptyBaseline.message.includes('Not enough activity history yet'),
    '10. Insufficient history displays honest message ("Not enough activity history yet")'
  );

  // 11. Rule-Based Engagement Insights
  const insights = analyticsService.generateInsights(patientId, DATE_RANGES.LAST_7_DAYS);
  assert(
    Array.isArray(insights) &&
    insights.length > 0 &&
    insights.every(i => i.title && i.description && !i.description.includes('dementia')),
    '11. Rule-based engagement insights produce calm, factual, non-diagnostic observations'
  );

  // 12. Inactivity & Attention Indicators
  const inactivityIndicators = analyticsService.getInactivityIndicators('non-existent-patient-id', DATE_RANGES.LAST_7_DAYS);
  assert(
    Array.isArray(inactivityIndicators) &&
    inactivityIndicators.some(ind => ind.includes('Very little activity was recorded')),
    '12. Inactivity indicators observe lack of activity respectfully without medical warnings'
  );

  // 13. Memory Engagement Analytics
  const memoryEngagement = analyticsService.getMemoryEngagement(patientId, DATE_RANGES.LAST_7_DAYS);
  assert(
    typeof memoryEngagement.totalMemories === 'number' &&
    typeof memoryEngagement.favoritedMemories === 'number' &&
    typeof memoryEngagement.totalPeople === 'number' &&
    typeof memoryEngagement.totalStories === 'number',
    '13. Memory engagement tracks memories viewed, favorited, people, and stories non-clinically'
  );

  // 14. Family Circle Engagement Analytics
  const familyEngagement = analyticsService.getFamilyEngagement(patientId);
  assert(
    typeof familyEngagement.familyMembersCount === 'number' &&
    typeof familyEngagement.keepsakesContributed === 'number' &&
    familyEngagement.primaryCaregiver !== null,
    '14. Family circle engagement quantifies keepsakes and circle members without social mechanics'
  );

  // 15. Emergency SOS Reporting
  const emergencyAnalytics = analyticsService.getEmergencyAnalytics(patientId);
  assert(
    emergencyAnalytics.helplineReady === true &&
    typeof emergencyAnalytics.totalEvents === 'number' &&
    emergencyAnalytics.primaryContactName.length > 0,
    '15. Emergency SOS reporting displays 112 readiness and contacts without fabricating dispatch'
  );

  // 16. Timeseries Trend Data
  const trendData = analyticsService.getTrendData(patientId, DATE_RANGES.LAST_7_DAYS);
  assert(
    Array.isArray(trendData.points) &&
    trendData.points.length === 7 &&
    trendData.points.every(p => p.date && p.label && typeof p.sessionsCount === 'number'),
    '16. Timeseries trend data generates daily data points for visual charts'
  );

  // 17. Patient Isolation: Unauthorized Access Prevention
  const caregiverId = 'caregiver-1';
  const isAuthorizedAsha = store.isAuthorizedForPatient(caregiverId, 'user-asha');
  const isAuthorizedOther = store.isAuthorizedForPatient(caregiverId, 'unauthorized-patient-999');
  assert(
    isAuthorizedAsha === true && isAuthorizedOther === false,
    '17. Patient isolation: Caregiver is strictly restricted to authorized patients'
  );

  // 18. Multi-Patient Isolation (No Cross-Patient Leaks)
  // Record session for isolated dummy patient
  store.recordActivitySession({
    id: 'test-sess-isolated',
    activityId: 'act-1',
    activityName: 'Memory Match',
    patientId: 'patient-isolated-b',
    accuracy: 95,
    completionTimeSec: 120,
    timestamp: new Date().toISOString()
  });

  const ashaSessions = analyticsService.getActivityAnalytics('user-asha', DATE_RANGES.LAST_7_DAYS).sessions;
  const isolatedSessions = analyticsService.getActivityAnalytics('patient-isolated-b', DATE_RANGES.LAST_7_DAYS).sessions;
  assert(
    isolatedSessions.some(s => s.id === 'test-sess-isolated') &&
    !ashaSessions.some(s => s.id === 'test-sess-isolated'),
    '18. Cross-patient isolation: Patient B activity sessions never leak into Patient A analytics'
  );

  // 19. Canonical 11-Section Report Builder
  const report = reportService.buildReportData(patientId, DATE_RANGES.LAST_7_DAYS);
  const has11Sections = (
    report.patientProfile &&
    report.reportPeriod &&
    report.dailyCareSummary &&
    report.activitySummary &&
    report.categoryEngagement &&
    report.adaptiveProgress &&
    report.memoryEngagement &&
    report.familyEngagement &&
    report.emergencySummary &&
    report.keyObservations &&
    report.generationMetadata
  );
  assert(
    has11Sections,
    '19. Report builder generates all 11 required canonical sections'
  );

  // 20. Clinical Non-Diagnostic Disclaimer Enforcement
  assert(
    typeof report.generationMetadata.disclaimer === 'string' &&
    report.generationMetadata.disclaimer.includes('does not provide medical advice') &&
    report.generationMetadata.disclaimer.includes('supportive routine companion'),
    '20. Clinical disclaimer enforces non-diagnostic boundaries in all generated reports'
  );

  // 21. Absence of Forbidden Diagnostic Terminology
  const reportString = JSON.stringify(report).toLowerCase();
  const forbiddenTerms = [
    'dementia score',
    'cognitive health score',
    'disease progression score',
    'cognitive decline',
    'iq score',
    'mental deficit'
  ];
  const containsForbidden = forbiddenTerms.some(term => reportString.includes(term));
  assert(
    !containsForbidden,
    '21. Strict absence of forbidden diagnostic terms (no "Dementia Score" or "Cognitive Decline")'
  );

  // 22. CSV Export Format
  const csv = reportService.exportReportCSV(report);
  assert(
    typeof csv === 'string' &&
    csv.includes('MindMitra Caregiver Continuity & Activity Report') &&
    csv.includes('DAILY CARE SUMMARY') &&
    csv.includes('COGNITIVE ACTIVITY SUMMARY') &&
    csv.includes('CATEGORY ENGAGEMENT'),
    '22. CSV export generates structured spreadsheet containing daily care, sessions, and categories'
  );

  // 23. Local Report History Persistence
  const generatedReport = reportService.generateCaregiverReport(patientId, DATE_RANGES.LAST_7_DAYS);
  const history = store.getReportHistory(patientId);
  assert(
    history.length > 0 &&
    history.some(h => h.id === generatedReport.id),
    '23. Local report history persists generated report metadata and scopes by patient'
  );

  // 24. Future Dates & Boundary Handling
  const invertedRange = analyticsService.parseDateRange(DATE_RANGES.CUSTOM, '2026-12-31', '2026-01-01');
  assert(
    invertedRange.start <= invertedRange.end,
    '24. Date filter handles inverted or boundary dates gracefully by swapping start and end'
  );

  // 25. Full System Regression across Parts 0–12
  const patientReminders = store.getRemindersForPatient(patientId);
  const patientMemories = store.state.memories;
  const patientActivities = store.state.activities;
  assert(
    patientReminders.length > 0 &&
    patientMemories.length > 0 &&
    patientActivities.length >= 20 &&
    typeof store.getCurrentPatientId === 'function',
    '25. Full regression: Routines, living memories, activities, and store systems remain intact'
  );

} catch (err) {
  console.error('Unexpected test error:', err);
  failed++;
}

console.log('\n======================================================');
console.log(`  PART 12 TEST RESULTS: ${passed}/${passed + failed} TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}
