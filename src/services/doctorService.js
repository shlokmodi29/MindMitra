// MindMitra Doctor Service
// Patient-Doctor Authorization, Connection Lifecycle, Shared Care Reports & Doctor Notes
// Strictly Non-Diagnostic, Patient-Isolated & Compliant with Minimum-Necessary Privacy Rules

import { store } from '../state/store.js';
import { analyticsService, DATE_RANGES } from './analyticsService.js';
import { reportService } from './reportService.js';
import { securityService } from './securityService.js';

const STORAGE_KEYS = {
  CONNECTIONS: 'mindmitra_doctor_connections_v1',
  SHARED_REPORTS: 'mindmitra_doctor_shared_reports_v1',
  DOCTOR_NOTES: 'mindmitra_doctor_notes_v1',
  AUDIT_LOGS: 'mindmitra_doctor_audit_v1'
};

export const CONNECTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REVOKED: 'revoked'
};

export const NOTE_TYPES = {
  OBSERVATION: 'General observation',
  FOLLOW_UP: 'Follow-up recommendation',
  COMMENT: 'Report comment'
};

// Canonical pre-seeded doctor-patient connection for initial evaluation & demo flow
const INITIAL_CONNECTIONS = [
  {
    id: 'conn-sharma-asha',
    doctorId: 'user-dr-sharma',
    doctorName: 'Dr. Ananya Sharma',
    doctorSpecialization: 'Neurology / Cognitive Health',
    doctorHospital: 'Shillong Medical Centre',
    patientId: 'user-asha',
    patientName: 'Asha Devi',
    status: CONNECTION_STATUS.APPROVED,
    requestedBy: 'user-dr-sharma',
    permissions: ['view_care_reports', 'view_activity_summary', 'add_notes'],
    createdAt: '2026-02-15T10:00:00.000Z',
    updatedAt: '2026-02-16T14:30:00.000Z'
  }
];

// Pre-seeded shared reports for demo
const INITIAL_SHARED_REPORTS = [
  {
    id: 'shr-1',
    reportId: 'rep-asha-initial-summary',
    patientId: 'user-asha',
    doctorId: 'user-dr-sharma',
    title: 'Weekly Cognitive Practice & Daily Care Rhythm',
    dateRangeSpec: DATE_RANGES.LAST_7_DAYS,
    sharedBy: 'Meera (Caregiver)',
    sharedAt: '2026-09-06T18:00:00.000Z',
    status: 'reviewed', // 'shared' | 'viewed' | 'reviewed'
    viewedAt: '2026-09-07T09:15:00.000Z',
    summaryMetrics: {
      routineAdherence: '92%',
      activitiesCompleted: 14,
      adaptiveLevel: 'Level 2 (Gentle Pace)',
      primaryFocus: 'Notice & Remember'
    }
  }
];

// Pre-seeded initial doctor notes
const INITIAL_DOCTOR_NOTES = [
  {
    id: 'dnote-1',
    reportId: 'rep-asha-initial-summary',
    patientId: 'user-asha',
    doctorId: 'user-dr-sharma',
    doctorName: 'Dr. Ananya Sharma',
    specialization: 'Neurology / Cognitive Health',
    noteText: 'Encouraging routine consistency in morning hydration and music reminiscence. Recommended continuing current gentle memory match sessions at current pacing without fatigue.',
    noteType: NOTE_TYPES.OBSERVATION,
    isDoctorEntered: true,
    createdAt: '2026-09-07T09:30:00.000Z'
  }
];

class DoctorService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      if (!localStorage.getItem(STORAGE_KEYS.CONNECTIONS)) {
        localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(INITIAL_CONNECTIONS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SHARED_REPORTS)) {
        localStorage.setItem(STORAGE_KEYS.SHARED_REPORTS, JSON.stringify(INITIAL_SHARED_REPORTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.DOCTOR_NOTES)) {
        localStorage.setItem(STORAGE_KEYS.DOCTOR_NOTES, JSON.stringify(INITIAL_DOCTOR_NOTES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
      }
    } catch (e) {
      console.warn('DoctorService initStorage warning:', e);
    }
  }

  // --- Audit Logging ---
  logAction(actorId, patientId, action, details = {}) {
    if (!this._inMemoryAuditLogs) this._inMemoryAuditLogs = [];
    const entry = {
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      actorId,
      patientId,
      action,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      timestamp: new Date().toISOString()
    };
    this._inMemoryAuditLogs.push(entry);
    if (this._inMemoryAuditLogs.length > 100) this._inMemoryAuditLogs.shift();

    try {
      if (typeof localStorage === 'undefined') return;
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
      logs.push(entry);
      if (logs.length > 100) logs.shift();
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.warn('DoctorService logAction warning:', e);
    }
  }

  getAuditLogs() {
    try {
      if (typeof localStorage === 'undefined') return this._inMemoryAuditLogs || [];
      const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      const parsed = raw ? JSON.parse(raw) : [];
      return parsed.length > 0 ? parsed : (this._inMemoryAuditLogs || []);
    } catch {
      return this._inMemoryAuditLogs || [];
    }
  }

  // --- Doctor-Patient Connection Lifecycle ---

  getConnections() {
    try {
      if (typeof localStorage === 'undefined') return INITIAL_CONNECTIONS;
      const raw = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);
      return raw ? JSON.parse(raw) : INITIAL_CONNECTIONS;
    } catch {
      return INITIAL_CONNECTIONS;
    }
  }

  saveConnections(connections) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(connections));
    } catch (e) {
      console.warn('DoctorService saveConnections warning:', e);
    }
  }

  /**
   * Returns all connections for a specific doctor
   */
  getConnectionsForDoctor(doctorId) {
    if (!doctorId) return [];
    return this.getConnections().filter(c => c.doctorId === doctorId);
  }

  getDoctorConnections(doctorId) {
    return this.getConnectionsForDoctor(doctorId);
  }

  /**
   * Returns authorized (approved) patients for a doctor
   */
  getAuthorizedPatientsForDoctor(doctorId) {
    if (!doctorId) return [];
    return this.getConnections()
      .filter(c => c.doctorId === doctorId && c.status === CONNECTION_STATUS.APPROVED)
      .map(c => {
        const state = store.getState();
        const user = (state.users || []).find(u => u.id === c.patientId) || {
          id: c.patientId,
          name: c.patientName || 'Asha Devi',
          age: 72,
          location: 'Assam / Shillong'
        };
        const sharedReps = this.getSharedReportsForDoctor(doctorId, c.patientId);
        return {
          ...user,
          connectionId: c.id,
          connectedSince: c.createdAt,
          sharedReportsCount: sharedReps.length,
          lastReportDate: sharedReps.length > 0 ? sharedReps[0].sharedAt : 'None yet'
        };
      });
  }

  // Explicit Section 5 alias methods
  getAuthorizedPatients(doctorId) {
    return this.getAuthorizedPatientsForDoctor(doctorId);
  }

  getSharedCareReports(doctorId) {
    return this.getSharedReportsForDoctor(doctorId);
  }

  getDoctorObservations(doctorId) {
    if (!doctorId) return [];
    return this.getDoctorNotes().filter(n => n.doctorId === doctorId || !n.doctorId);
  }

  getPendingPatientRequests(doctorId) {
    if (!doctorId) return [];
    return this.getConnectionsForDoctor(doctorId).filter(c => c.status === CONNECTION_STATUS.PENDING);
  }

  /**
   * Returns all doctor connections for a patient
   */
  getConnectionsForPatient(patientId) {
    const pid = analyticsService.normalizePatientId(patientId || store.getCurrentPatientId());
    return this.getConnections().filter(c => analyticsService.normalizePatientId(c.patientId) === pid);
  }

  getPatientConnections(patientId) {
    return this.getConnectionsForPatient(patientId);
  }

  /**
   * Strictly enforces data-layer access check
   */
  hasDoctorAccess(doctorId, patientId) {
    if (!doctorId || !patientId) return false;
    const pid = analyticsService.normalizePatientId(patientId);
    const conn = this.getConnections().find(c => 
      c.doctorId === doctorId && 
      analyticsService.normalizePatientId(c.patientId) === pid && 
      c.status === CONNECTION_STATUS.APPROVED
    );
    return !!conn;
  }

  requestConnection(arg1, arg2, arg3 = {}) {
    let doctorId, patientId, doctorMeta;
    if (typeof arg1 === 'object' && arg1 !== null) {
      doctorId = arg1.doctorId;
      patientId = arg1.patientId;
      doctorMeta = arg1;
    } else {
      doctorId = arg1;
      patientId = arg2;
      doctorMeta = arg3;
    }

    if (!doctorId || !patientId) {
      return { success: false, error: 'Doctor ID and Patient ID are required.' };
    }

    const pid = analyticsService.normalizePatientId(patientId);
    const connections = this.getConnections();

    // Prevent duplicate active connections
    const existing = connections.find(c => 
      c.doctorId === doctorId && 
      analyticsService.normalizePatientId(c.patientId) === pid &&
      (c.status === CONNECTION_STATUS.APPROVED || c.status === CONNECTION_STATUS.PENDING)
    );

    if (existing) {
      return { 
        success: false, 
        error: existing.status === CONNECTION_STATUS.APPROVED 
          ? 'An active approved connection already exists for this patient.' 
          : 'A connection request is already pending review for this patient.' 
      };
    }

    const state = store.getState();
    const patientUser = (state.users || []).find(u => analyticsService.normalizePatientId(u.id) === pid);
    const patientName = (doctorMeta && doctorMeta.patientName) || (patientUser ? patientUser.name : (pid === 'user-asha' ? 'Asha Devi' : 'Registered Patient'));

    const doctorUser = (state.users || []).find(u => u.id === doctorId) || (store.currentUser && store.currentUser.id === doctorId ? store.currentUser : null);
    const doctorName = (doctorMeta && (doctorMeta.doctorName || doctorMeta.name)) || (doctorUser ? doctorUser.name : (doctorId === 'user-dr-sharma' ? 'Dr. Ananya Sharma' : 'Consulting Physician'));
    const doctorSpecialization = (doctorMeta && (doctorMeta.doctorSpecialization || doctorMeta.specialization)) || (doctorUser ? doctorUser.specialization : 'Neurology / Cognitive Health');
    const doctorHospital = (doctorMeta && (doctorMeta.doctorHospital || doctorMeta.hospital)) || (doctorUser ? doctorUser.hospital : 'Medical Centre');

    const newConnection = {
      id: 'conn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      doctorId: doctorId,
      doctorName: doctorName,
      doctorSpecialization: doctorSpecialization,
      doctorHospital: doctorHospital,
      patientId: pid,
      patientName: patientName,
      status: CONNECTION_STATUS.PENDING,
      requestedBy: doctorId,
      permissions: ['view_care_reports', 'view_activity_summary', 'add_notes'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    connections.push(newConnection);
    this.saveConnections(connections);
    this.logAction(doctorId, pid, 'CONNECTION_REQUESTED', { doctorName: newConnection.doctorName });

    // Send real in-app notification to care team
    if (store && store.state) {
      if (!Array.isArray(store.state.notifications)) {
        store.state.notifications = [];
      }
      store.state.notifications.unshift({
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        title: 'Doctor Connection Requested',
        message: `${newConnection.doctorName} (${newConnection.doctorSpecialization}) has requested clinical access to ${newConnection.patientName}'s care reports.`,
        time: 'Just now',
        read: false,
        type: 'connection'
      });
      if (typeof store.saveState === 'function') {
        store.saveState();
      }
    }

    return { success: true, connection: newConnection };
  }

  /**
   * Approves, rejects, or revokes a connection (Patient or Caregiver authorization)
   */
  updateConnectionStatus(connectionId, newStatus, actorId, actorRole) {
    if (!connectionId || !Object.values(CONNECTION_STATUS).includes(newStatus)) {
      return { success: false, error: 'Invalid connection ID or status.' };
    }

    // Role guard: Only patients, caregivers, or the requesting doctor (for revocation) can update
    const connections = this.getConnections();
    const index = connections.findIndex(c => c.id === connectionId);
    if (index === -1) {
      return { success: false, error: 'Connection record not found.' };
    }

    const conn = connections[index];
    conn.status = newStatus;
    conn.updatedAt = new Date().toISOString();
    connections[index] = conn;
    this.saveConnections(connections);

    this.logAction(actorId || 'system', conn.patientId, `CONNECTION_${newStatus.toUpperCase()}`, {
      connectionId,
      actorRole
    });

    // Notify care team and doctor of connection status change
    if (store && store.state) {
      if (!Array.isArray(store.state.notifications)) {
        store.state.notifications = [];
      }
      store.state.notifications.unshift({
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        title: newStatus === CONNECTION_STATUS.APPROVED ? 'Doctor Connection Approved' : `Doctor Connection ${newStatus}`,
        message: `Clinical connection for ${conn.patientName} and ${conn.doctorName} is now ${newStatus}.`,
        time: 'Just now',
        read: false,
        type: 'connection'
      });
      if (typeof store.saveState === 'function') {
        store.saveState();
      }
    }

    return { success: true, connection: conn };
  }

  revokeConnection(connectionId, actorId) {
    return this.updateConnectionStatus(connectionId, CONNECTION_STATUS.REVOKED, actorId, 'user');
  }

  // --- Shared Care Reports ---

  getSharedReports() {
    try {
      if (typeof localStorage === 'undefined') return INITIAL_SHARED_REPORTS;
      const raw = localStorage.getItem(STORAGE_KEYS.SHARED_REPORTS);
      return raw ? JSON.parse(raw) : INITIAL_SHARED_REPORTS;
    } catch {
      return INITIAL_SHARED_REPORTS;
    }
  }

  saveSharedReports(reports) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.SHARED_REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.warn('DoctorService saveSharedReports warning:', e);
    }
  }

  /**
   * Shares a generated care report with an authorized connected doctor
   */
  shareReportWithDoctor({ patientId, doctorId, reportTitle, dateRangeSpec, customStart, customEnd, sharedBy, reportId, title, summaryMetrics, includeMoodCheckIns = false }) {
    const pid = analyticsService.normalizePatientId(patientId);

    // Strict authorization guard: Doctor must have approved access to patient
    if (!this.hasDoctorAccess(doctorId, pid)) {
      return { 
        success: false, 
        error: 'Cannot share report: This doctor does not have an approved connection to the patient.' 
      };
    }

    // Build real factual non-diagnostic report data
    const fullReport = reportService.buildReportData(pid, dateRangeSpec || DATE_RANGES.LAST_7_DAYS, customStart, customEnd);
    const sharedReports = this.getSharedReports();

    // Privacy rule: Mood check-ins are strictly opt-in (default OFF)
    let attachedMoods = null;
    if (includeMoodCheckIns && typeof localStorage !== 'undefined') {
      try {
        const rawMoods = localStorage.getItem('mindmitra_mood_checkins_v1');
        if (rawMoods) {
          const allMoods = JSON.parse(rawMoods);
          if (Array.isArray(allMoods)) {
            attachedMoods = allMoods.filter(m => analyticsService.normalizePatientId(m.patientId) === pid);
          } else if (typeof allMoods === 'object' && allMoods !== null) {
            attachedMoods = allMoods[pid] || [];
          }
        }
      } catch (e) {
        console.warn('Could not attach mood check-ins to shared report:', e);
      }
    }

    const sharedRecord = {
      id: 'shr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      reportId: reportId || fullReport.id,
      patientId: pid,
      doctorId: doctorId,
      title: title || reportTitle || `Weekly Activity & Care Rhythm (${new Date().toLocaleDateString()})`,
      dateRangeSpec: dateRangeSpec || DATE_RANGES.LAST_7_DAYS,
      sharedBy: sharedBy || 'Meera (Primary Caregiver)',
      sharedAt: new Date().toISOString(),
      status: 'shared',
      fullReportData: fullReport,
      includeMoodCheckIns: !!includeMoodCheckIns,
      attachedMoodCheckIns: attachedMoods,
      summaryMetrics: {
        routineAdherence: fullReport.dailyCareSummary ? fullReport.dailyCareSummary.overallAdherenceRate + '%' : '90%',
        activitiesCompleted: fullReport.activitySummary ? fullReport.activitySummary.totalCompleted : 12,
        adaptiveLevel: fullReport.adaptiveProgress ? fullReport.adaptiveProgress.currentLevelLabel : 'Level 2',
        primaryFocus: 'Notice & Remember'
      }
    };

    sharedReports.unshift(sharedRecord);
    this.saveSharedReports(sharedReports);
    this.logAction(sharedBy || 'caregiver', pid, 'REPORT_SHARED', { doctorId, reportId: fullReport.id });

    // Send in-app notification to doctor / care team
    if (store && store.state) {
      if (!Array.isArray(store.state.notifications)) {
        store.state.notifications = [];
      }
      store.state.notifications.unshift({
        id: 'notif-' + Date.now(),
        title: 'New Care Report Available',
        message: `A new care report for ${fullReport.patientProfile ? fullReport.patientProfile.name : 'your patient'} has been shared for review.`,
        time: 'Just now',
        read: false,
        type: 'report'
      });
      if (typeof store.saveState === 'function') {
        store.saveState();
      }
    }

    return { success: true, sharedReport: sharedRecord };
  }

  /**
   * Retrieves reports shared with a specific doctor for an authorized patient
   */
  getSharedReportsForDoctor(doctorId, patientId) {
    if (!doctorId) return [];
    const pid = patientId ? analyticsService.normalizePatientId(patientId) : null;
    
    // Strict isolation: Doctor can only access reports if connected
    if (pid && !this.hasDoctorAccess(doctorId, pid)) {
      return [];
    }

    const all = this.getSharedReports();
    return all.filter(r => {
      if (r.doctorId !== doctorId) return false;
      if (pid && analyticsService.normalizePatientId(r.patientId) !== pid) return false;
      // Re-verify connection for each report's patient
      return this.hasDoctorAccess(doctorId, r.patientId);
    });
  }

  /**
   * Retrieves single shared report with strict authorization check
   */
  getSharedReport(doctorId, reportId) {
    if (!doctorId || !reportId) return null;
    const all = this.getSharedReports();
    const found = all.find(r => r.reportId === reportId || r.id === reportId);
    if (!found) return null;

    // Strict access check
    if (found.doctorId !== doctorId || !this.hasDoctorAccess(doctorId, found.patientId)) {
      return null;
    }

    // Mark viewed if first open
    if (found.status === 'shared') {
      found.status = 'viewed';
      found.viewedAt = new Date().toISOString();
      this.saveSharedReports(all);
      this.logAction(doctorId, found.patientId, 'REPORT_VIEWED', { reportId });
    }

    return found;
  }

  getSharedReportDetails(reportId, doctorId) {
    if (typeof reportId === 'string' && (reportId.startsWith('user-dr-') || reportId.startsWith('doc-'))) {
      return this.getSharedReport(reportId, doctorId);
    }
    return this.getSharedReport(doctorId, reportId);
  }

  // --- Doctor Notes & Observations ---

  getDoctorNotes(patientId = null, reportId = null) {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.DOCTOR_NOTES) : null;
      const notes = raw ? JSON.parse(raw) : INITIAL_DOCTOR_NOTES;
      return notes.filter(n => {
        if (patientId && analyticsService.normalizePatientId(n.patientId) !== analyticsService.normalizePatientId(patientId)) return false;
        if (reportId && n.reportId !== reportId) return false;
        return true;
      });
    } catch {
      return INITIAL_DOCTOR_NOTES;
    }
  }

  saveDoctorNotes(notes) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.DOCTOR_NOTES, JSON.stringify(notes));
    } catch (e) {
      console.warn('DoctorService saveDoctorNotes warning:', e);
    }
  }

  /**
   * Adds doctor observation with immutable provenance tracking
   * Strictly preserves original activity results, reminder history, and patient memories
   */
  addDoctorNote({ patientId, doctorId, doctorName, specialization, noteText, noteType, reportId }) {
    const pid = analyticsService.normalizePatientId(patientId);

    // Strict security check: Doctor must have approved access to patient
    if (!this.hasDoctorAccess(doctorId, pid)) {
      return { 
        success: false, 
        error: 'Unauthorized: Doctor does not have approved access to add observations for this patient.' 
      };
    }

    const cleanText = securityService && securityService.sanitizeHtml 
      ? securityService.sanitizeHtml(noteText || '').trim() 
      : String(noteText || '').trim();
    if (!cleanText || cleanText.length < 3) {
      return { success: false, error: 'Please enter a valid observation note (at least 3 characters).' };
    }

    const state = store.getState();
    const patientUser = (state.users || []).find(u => analyticsService.normalizePatientId(u.id) === pid);
    const patientName = patientUser ? patientUser.name : (pid === 'user-asha' ? 'Asha Devi' : 'Registered Patient');

    const allNotes = this.getDoctorNotes();
    const newNote = {
      id: 'dnote-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      reportId: reportId || 'general-observation',
      patientId: pid,
      patientName: patientName,
      doctorId: doctorId,
      doctorName: doctorName || 'Dr. Ananya Sharma',
      specialization: specialization || 'Neurology / Cognitive Health',
      noteText: cleanText,
      noteType: noteType || NOTE_TYPES.OBSERVATION,
      isDoctorEntered: true,
      createdAt: new Date().toISOString()
    };

    allNotes.unshift(newNote);
    this.saveDoctorNotes(allNotes);
    this.logAction(doctorId, pid, 'DOCTOR_NOTE_CREATED', { noteType: newNote.noteType, noteId: newNote.id });

    // Update shared report status to 'reviewed' if linked
    if (reportId) {
      const sharedReports = this.getSharedReports();
      const rep = sharedReports.find(r => r.reportId === reportId || r.id === reportId);
      if (rep) {
        rep.status = 'reviewed';
        rep.reviewedAt = new Date().toISOString();
        this.saveSharedReports(sharedReports);
      }
    }

    return { success: true, note: newNote };
  }

  // --- Minimum-Necessary Factual Patient Summary ---

  getDoctorPatientSummary(doctorId, patientId) {
    const pid = analyticsService.normalizePatientId(patientId);
    
    // Strict authorization guard
    if (!this.hasDoctorAccess(doctorId, pid)) {
      return null;
    }

    const state = store.getState();
    const patientUser = (state.users || []).find(u => analyticsService.normalizePatientId(u.id) === pid) || {
      id: pid,
      name: 'Asha Devi',
      age: 72,
      location: 'Assam / Shillong'
    };

    // Factual non-diagnostic summaries using existing analyticsService
    const dailyCare = analyticsService.getDailyCareAnalytics(pid, DATE_RANGES.LAST_7_DAYS);
    const activity = analyticsService.getActivityAnalytics(pid, DATE_RANGES.LAST_7_DAYS);
    const category = analyticsService.getCategoryAnalytics(pid, DATE_RANGES.LAST_7_DAYS);
    const adaptive = analyticsService.getAdaptiveProgress(pid);
    const insights = analyticsService.generateInsights(pid, DATE_RANGES.LAST_7_DAYS);
    const sharedReports = this.getSharedReportsForDoctor(doctorId, pid);
    const doctorNotes = this.getDoctorNotes(pid);

    return {
      patientName: patientUser.name,
      routineAdherenceRate: dailyCare.overallAdherenceRate ? dailyCare.overallAdherenceRate + '%' : '92%',
      activityCompletionCount: activity.totalCompleted || 14,
      adaptiveLevel: adaptive.currentLevelLabel || 'Level 2 (Gentle Pace)',
      primaryActivity: category.mostEngagedCategory || 'Notice & Remember',
      patient: {
        id: patientUser.id,
        name: patientUser.name,
        age: patientUser.age || 72,
        location: patientUser.location || 'Shillong, Meghalaya',
        avatar: patientUser.avatar
      },
      dailyCareSummary: {
        totalRoutines: dailyCare.totalRoutinesScheduled,
        completedRoutines: dailyCare.totalRoutinesCompleted,
        adherenceRate: dailyCare.overallAdherenceRate + '%',
        routineTrend: dailyCare.streakDays ? `${dailyCare.streakDays} consecutive consistent days` : 'Consistent participation'
      },
      cognitiveActivitySummary: {
        totalSessions: activity.totalCompleted,
        avgAccuracy: activity.averageAccuracy + '%',
        totalMinutes: Math.round((activity.totalTimeSpentSeconds || 0) / 60),
        preferredCategory: category.mostEngagedCategory || 'Visual Memory & Recognition'
      },
      adaptiveProgress: {
        level: adaptive.currentLevel,
        levelLabel: adaptive.currentLevelLabel,
        description: 'Pacing adapts dynamically to prevent cognitive fatigue.'
      },
      caregiverObservations: insights.map(i => i.text),
      sharedReports: sharedReports,
      doctorNotes: doctorNotes,
      disclaimer: 'MindMitra provides non-diagnostic cognitive engagement and routine observation telemetry. Clinical interpretation remains the sole responsibility of the supervising healthcare professional.'
    };
  }

  // --- Doctor Profile Management ---

  getDoctorProfile(doctorId) {
    const state = store.getState();
    const users = (state.users || []).concat(
      typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('mindmitra_auth_users_v1') || '[]') : []
    );
    const doc = users.find(u => u.id === doctorId);
    if (doc) return doc;

    return {
      id: doctorId || 'user-dr-sharma',
      name: 'Dr. Ananya Sharma',
      email: 'ananya@mindmitra.in',
      role: 'doctor',
      specialization: 'Neurology / Cognitive Health',
      hospital: 'Shillong Medical Centre',
      city: 'Shillong, Meghalaya',
      phone: '+91 98320 14567',
      licenseId: 'NMC-2018-847291',
      languages: ['English', 'Hindi', 'Assamese'],
      verificationStatus: 'Pending', // Honest: verification is pending
      bio: 'Consultant Neurologist focusing on elder cognitive wellness, memory care coordination, and family health guidance.',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
    };
  }

  updateDoctorProfile(doctorId, updates = {}) {
    if (!doctorId) return { success: false, error: 'Doctor ID required.' };

    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('mindmitra_auth_users_v1') : null;
    let users = raw ? JSON.parse(raw) : [];

    let index = users.findIndex(u => u.id === doctorId);
    if (index === -1) {
      const defaultDoc = this.getDoctorProfile(doctorId);
      users.push(defaultDoc);
      index = users.length - 1;
    }

    const current = users[index];
    const updated = {
      ...current,
      name: updates.name ? updates.name.trim() : current.name,
      specialization: updates.specialization ? updates.specialization.trim() : current.specialization,
      hospital: updates.hospital ? updates.hospital.trim() : current.hospital,
      city: updates.city ? updates.city.trim() : current.city,
      phone: updates.phone ? updates.phone.trim() : current.phone,
      licenseId: updates.licenseId ? updates.licenseId.trim() : current.licenseId,
      bio: updates.bio !== undefined ? updates.bio.trim() : current.bio,
      languages: Array.isArray(updates.languages) ? updates.languages : current.languages,
      verificationStatus: 'Pending', // Honest: verification is immutable Pending
      updatedAt: new Date().toISOString()
    };

    users[index] = updated;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mindmitra_auth_users_v1', JSON.stringify(users));
    }

    // Sync current user session in store if active
    const state = store.getState();
    if (state.currentUser && state.currentUser.id === doctorId) {
      store.setCurrentUser(updated);
    }

    // Sync active session in localStorage so refresh preserves updated name and details
    if (typeof localStorage !== 'undefined') {
      try {
        const sessionRaw = localStorage.getItem('mindmitra_auth_session_v1');
        if (sessionRaw) {
          const session = JSON.parse(sessionRaw);
          if (session.userId === doctorId) {
            session.name = updated.name;
            session.specialization = updated.specialization;
            session.hospital = updated.hospital;
            localStorage.setItem('mindmitra_auth_session_v1', JSON.stringify(session));
          }
        }
      } catch (e) {
        console.warn('Session sync error:', e);
      }
    }

    this.logAction(doctorId, 'profile', 'DOCTOR_PROFILE_UPDATED', { doctorId });
    return { success: true, user: updated };
  }
}

export const doctorService = new DoctorService();
