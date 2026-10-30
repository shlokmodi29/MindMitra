import { initialDatabase } from './database.js';
import { i18nService } from '../services/i18nService.js';

const STORAGE_KEY = 'mindmitra_core_db_v2';

const defaultNotifications = [
  {
    id: 'notif-1',
    title: 'Morning Hydration',
    message: 'Time for 350ml infused water with lemon and tulsi.',
    time: '8:30 AM',
    read: false,
    type: 'routine',
    icon: 'water_drop'
  },
  {
    id: 'notif-2',
    title: 'Family Message from Meera',
    message: '“Ma, fresh marigolds are on the veranda. Take a calm morning walk.”',
    time: '9:15 AM',
    read: false,
    type: 'family',
    icon: 'family_restroom'
  },
  {
    id: 'notif-3',
    title: 'Cognitive Calm Activity Ready',
    message: 'Your gentle tea garden memory exploration is prepared for today.',
    time: '10:00 AM',
    read: true,
    type: 'activity',
    icon: 'psychology'
  }
];

class Store {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadState();
    this.applyDOMAccessibility();
  }

  applyDOMAccessibility() {
    if (typeof document !== 'undefined' && document.documentElement) {
      const settings = this.state.settings || {};
      if (settings.fontSize) {
        document.documentElement.classList.remove('elder-text-scale-sm', 'elder-text-scale-md', 'elder-text-scale-lg');
        if (settings.fontSize === 'small') document.documentElement.classList.add('elder-text-scale-sm');
        else if (settings.fontSize === 'medium') document.documentElement.classList.add('elder-text-scale-md');
        else if (settings.fontSize === 'large') document.documentElement.classList.add('elder-text-scale-lg');
      }
      if (settings.reducedMotion) {
        document.documentElement.classList.add('reduced-motion-active');
      } else {
        document.documentElement.classList.remove('reduced-motion-active');
      }
      if (this.state.currentLanguage) {
        document.documentElement.lang = this.state.currentLanguage;
      }
    }
  }

  loadState() {
    const activeRoute = (typeof window !== 'undefined' && window.location && window.location.hash)
      ? window.location.hash.replace('#/', '').replace('#', '').trim() || 'patient-home'
      : 'patient-home';

    let sessionUser = null;
    try {
      if (typeof localStorage !== 'undefined') {
        const sessionRaw = localStorage.getItem('mindmitra_auth_session_v1');
        if (sessionRaw) {
          sessionUser = JSON.parse(sessionRaw);
        }
      }
    } catch (e) {
      console.warn('Session load error:', e);
    }

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const baseProfile = (parsed.users && parsed.users[0]) || initialDatabase.users[0];
          return {
            ...initialDatabase,
            ...parsed,
            currentUser: sessionUser,
            profile: sessionUser ? { ...baseProfile, id: sessionUser.userId, name: sessionUser.name, email: sessionUser.email, role: sessionUser.role } : baseProfile,
            currentLanguage: (parsed.settings && parsed.settings.language) || 'en',
            activeRoute,
            currentMode: sessionUser ? sessionUser.role : (parsed.currentMode || 'patient'),
            activeActivityId: parsed.activeActivityId || 'act-2',
            activeAudio: null,
            voiceModalOpen: false,
            authModalOpen: false,
            notificationsModalOpen: false,
            editProfileModalOpen: false,
            reminderDetailModalOpen: false,
            notificationPermissionModalOpen: false,
            selectedReminderForDetail: null,
            reminderOccurrences: parsed.reminderOccurrences || initialDatabase.reminderOccurrences || [],
            stories: parsed.stories || initialDatabase.stories || [],
            voiceMemories: parsed.voiceMemories || initialDatabase.voiceMemories || [],
            memoryRelationships: parsed.memoryRelationships || initialDatabase.memoryRelationships || [],
            selectedMemoryDetail: null,
            memoryDetailModalOpen: false,
            selectedEntityDetail: null,
            entityDetailModalOpen: false,
            activityResults: parsed.activityResults || initialDatabase.activityResults || [],
            adaptiveProfiles: parsed.adaptiveProfiles || [],
            adaptiveEvents: parsed.adaptiveEvents || [],
            emergencyContacts: parsed.emergencyContacts || initialDatabase.emergencyContacts || [],
            emergencyPreferences: parsed.emergencyPreferences || {},
            notifications: parsed.notifications || defaultNotifications,
            activePatientId: parsed.activePatientId || null,
            isPreviewMode: false,
            previewPatientId: null,
            reportHistory: parsed.reportHistory || [],
            isOnline: isOnline
          };
        }
      }
    } catch (e) {
      console.warn('LocalStorage load exception:', e);
    }

    const defaultProfile = initialDatabase.users[0];
    return {
      ...initialDatabase,
      currentUser: sessionUser,
      profile: sessionUser ? { ...defaultProfile, id: sessionUser.userId, name: sessionUser.name, email: sessionUser.email, role: sessionUser.role } : defaultProfile,
      currentLanguage: 'en',
      activeRoute,
      currentMode: sessionUser ? sessionUser.role : 'patient',
      activeActivityId: 'act-2', // Default to Personal Memory Recall
      activeAudio: null,
      voiceModalOpen: false,
      authModalOpen: false,
      notificationsModalOpen: false,
      editProfileModalOpen: false,
      reminderDetailModalOpen: false,
      notificationPermissionModalOpen: false,
      selectedReminderForDetail: null,
      reminderOccurrences: initialDatabase.reminderOccurrences || [],
      stories: initialDatabase.stories || [],
      voiceMemories: initialDatabase.voiceMemories || [],
      memoryRelationships: initialDatabase.memoryRelationships || [],
      selectedMemoryDetail: null,
      memoryDetailModalOpen: false,
      selectedEntityDetail: null,
      entityDetailModalOpen: false,
      activityResults: initialDatabase.activityResults || [],
      adaptiveProfiles: [],
      adaptiveEvents: [],
      emergencyContacts: initialDatabase.emergencyContacts || [],
      emergencyPreferences: {},
      notifications: defaultNotifications,
      activePatientId: null,
      isPreviewMode: false,
      previewPatientId: null,
      reportHistory: [],
      isOnline: isOnline
    };
  }

  saveState() {
    try {
      if (typeof localStorage === 'undefined') return;
      const dataToSave = {
        users: this.state.users,
        memories: this.state.memories,
        people: this.state.people,
        places: this.state.places,
        events: this.state.events,
        stories: this.state.stories,
        voiceMemories: this.state.voiceMemories,
        memoryRelationships: this.state.memoryRelationships,
        activities: this.state.activities,
        routines: this.state.routines,
        reminderOccurrences: this.state.reminderOccurrences || [],
        caregiverLogs: this.state.caregiverLogs,
        activitySessions: this.state.activitySessions || [],
        activityResults: this.state.activityResults || [],
        adaptiveProfiles: this.state.adaptiveProfiles || [],
        adaptiveEvents: this.state.adaptiveEvents || [],
        emergencyContacts: this.state.emergencyContacts || [],
        emergencyPreferences: this.state.emergencyPreferences || {},
        sosEvents: this.state.sosEvents,
        settings: this.state.settings,
        currentMode: this.state.currentMode,
        activeActivityId: this.state.activeActivityId,
        activePatientId: this.state.activePatientId || null,
        reportHistory: this.state.reportHistory || [],
        notifications: this.state.notifications
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  setAdaptiveEngine(engine) {
    this.adaptiveEngine = engine;
  }

  setDailyPlanService(service) {
    this.dailyPlanService = service;
  }

  setMemoryService(service) {
    this.memoryService = service;
  }

  getMemoryTimeline(filters = {}, patientId = null) {
    const pid = patientId || this.getCurrentPatientId();
    if (this.memoryService && typeof this.memoryService.getMemoryTimeline === 'function') {
      return this.memoryService.getMemoryTimeline(pid, filters);
    }
    return { patientId: pid, totalCount: 0, filteredCount: 0, items: [], years: [], yearGroups: {}, sortOrder: 'desc' };
  }

  getDailyPlan(patientId = null, date = null) {
    if (this.dailyPlanService) {
      return this.dailyPlanService.getTodayPlan(patientId || this.getCurrentPatientId());
    }
    return null;
  }

  regenerateDailyPlan(patientId = null, date = null) {
    if (this.dailyPlanService) {
      return this.dailyPlanService.generateDailyPlan(patientId || this.getCurrentPatientId(), date);
    }
    return null;
  }

  updateDailyPlanItemStatus(itemId, newStatus, extraData = {}) {
    if (this.dailyPlanService) {
      return this.dailyPlanService.updatePlanItemStatus(this.getCurrentPatientId(), itemId, newStatus, extraData);
    }
    return null;
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.saveState();
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  // --- Auth & Identity Actions ---
  setCurrentUser(user) {
    this.state.currentUser = user;
    if (user) {
      this.state.profile = {
        ...this.state.profile,
        id: user.id || user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      };
      if (user.avatar) {
        this.state.profile.avatar = user.avatar;
      }
    } else {
      // On logout: reset currentUser but keep application data intact
      this.state.currentUser = null;
    }
    this.notify();
  }

  updatePatientProfile(updates) {
    this.state.profile = {
      ...this.state.profile,
      ...updates
    };
    if (this.state.currentUser) {
      this.state.currentUser = {
        ...this.state.currentUser,
        ...updates
      };
      try {
        if (typeof localStorage !== 'undefined') {
          const sessionRaw = localStorage.getItem('mindmitra_auth_session_v1');
          if (sessionRaw) {
            const s = JSON.parse(sessionRaw);
            localStorage.setItem('mindmitra_auth_session_v1', JSON.stringify({ ...s, ...updates }));
          }
          const usersRaw = localStorage.getItem('mindmitra_auth_users_v1');
          if (usersRaw) {
            const users = JSON.parse(usersRaw);
            const idx = users.findIndex(u => u.id === this.state.currentUser.id);
            if (idx !== -1) {
              users[idx] = { ...users[idx], ...updates };
              localStorage.setItem('mindmitra_auth_users_v1', JSON.stringify(users));
            }
          }
        }
      } catch (e) {
        console.warn('Profile persist error:', e);
      }
    }
    this.notify();
  }

  setNotificationsModalOpen(isOpen) {
    this.state.notificationsModalOpen = isOpen;
    this.notify();
  }

  setEditProfileModalOpen(isOpen) {
    this.state.editProfileModalOpen = isOpen;
    this.notify();
  }

  markAllNotificationsRead() {
    this.state.notifications = this.state.notifications.map(n => ({ ...n, read: true }));
    this.notify();
  }

  markNotificationRead(id) {
    const notif = this.state.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.notify();
    }
  }

  getUnreadNotificationsCount() {
    return (this.state.notifications || []).filter(n => !n.read).length;
  }

  setNetworkStatus(isOnline) {
    this.state.isOnline = isOnline;
    this.notify();
  }

  setSettings(settings) {
    this.state.settings = { ...this.state.settings, ...settings };
    this.notify();
  }

  // --- Navigation & Mode Actions ---
  setRoute(route) {
    this.state.activeRoute = route;
    if (route === 'caregiver-dashboard' || route === 'caregiver-bridge' || route === 'caregiver-reports') {
      this.state.currentMode = 'caregiver';
    } else if (['patient-home', 'my-day', 'memory-world', 'memory-timeline', 'activities', 'family-circle', 'profile', 'smriti-ai'].includes(route)) {
      this.state.currentMode = 'patient';
    }
    this.notify();
  }

  setMode(mode) {
    this.state.currentMode = mode;
    if (typeof window !== 'undefined' && window.location) {
      if (mode === 'caregiver' && !this.state.activeRoute.startsWith('caregiver')) {
        window.location.hash = '#/caregiver-dashboard';
      } else if (mode === 'patient' && this.state.activeRoute.startsWith('caregiver')) {
        window.location.hash = '#/patient-home';
      }
    }
    this.notify();
  }

  setLanguage(lang) {
    this.state.currentLanguage = lang;
    if (!this.state.settings) this.state.settings = {};
    this.state.settings.language = lang;
    i18nService.setLanguage(lang);
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = lang;
    }
    this.saveState();
    this.notify();
  }

  setAccessibilitySettings(settings) {
    this.state.settings = { ...this.state.settings, ...settings };
    this.applyDOMAccessibility();
    this.saveState();
    this.notify();
  }

  // --- Routine & Daily Care Actions ---
  getCurrentPatientId() {
    if (this.state.isPreviewMode && this.state.previewPatientId) {
      return this.state.previewPatientId;
    }
    const user = this.state.currentUser || this.state.profile;
    if (user) {
      const id = user.userId || user.id;
      if (this.isCaregiver() && (user.activePatientId || this.state.activePatientId)) {
        return user.activePatientId || this.state.activePatientId;
      }
      if (id === 'user-meera' && user.activePatientId) {
        return user.activePatientId;
      }
      if (id === 'user-meera') return 'user-asha';
      return id;
    }
    return this.state.activePatientId || 'user-asha';
  }

  getAuthorizedPatientsForCaregiver(caregiverId) {
    const cid = caregiverId || (this.state.currentUser?.userId || this.state.currentUser?.id || 'user-meera');
    const caregiver = (this.state.users || []).find(u => u.id === cid || u.userId === cid) || this.state.currentUser;
    const allPatients = (this.state.users || []).filter(u => u.role === 'patient');
    if (!allPatients.length && this.state.users && this.state.users[0]) {
      allPatients.push(this.state.users[0]);
    }
    
    // If caregiver has specific authorized patient IDs, filter by them
    if (caregiver && Array.isArray(caregiver.authorizedPatientIds) && caregiver.authorizedPatientIds.length > 0) {
      return allPatients.filter(p => caregiver.authorizedPatientIds.includes(p.id));
    }
    // By default for demo Meera / caregiver-1, authorized for Asha
    if (cid === 'user-meera' || cid === 'caregiver-1') {
      return allPatients.filter(p => p.id === 'user-asha' || p.id === 'usr-asha');
    }
    // Any other caregiver without explicit authorized patient IDs has no patient access
    return [];
  }

  isAuthorizedForPatient(caregiverId, patientId) {
    const authorized = this.getAuthorizedPatientsForCaregiver(caregiverId);
    return authorized.some(p => p.id === patientId);
  }

  setActivePatientForCaregiver(patientId) {
    const cid = this.state.currentUser?.userId || this.state.currentUser?.id || 'user-meera';
    if (!this.isAuthorizedForPatient(cid, patientId)) {
      throw new Error(`Unauthorized: Caregiver is not authorized to access patient ${patientId}`);
    }
    this.state.activePatientId = patientId;
    if (this.state.currentUser) {
      this.state.currentUser.activePatientId = patientId;
    }
    this.notify();
    this.saveState();
  }

  setCurrentPatientId(patientId) {
    this.state.activePatientId = patientId;
    if (this.state.currentUser) {
      this.state.currentUser.activePatientId = patientId;
    }
    this.notify();
    this.saveState();
  }

  setPatientPreviewMode(enabled, patientId = null) {
    this.state.isPreviewMode = !!enabled;
    this.state.previewPatientId = enabled ? (patientId || this.getCurrentPatientId()) : null;
    this.notify();
  }

  getDailyCareSummary(patientId) {
    const pid = patientId || this.getCurrentPatientId();
    const routines = this.getRemindersForPatient(pid);
    const completed = [];
    const dueSoon = [];
    const upcoming = [];

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parseTimeToMinutes = (timeStr) => {
      if (!timeStr) return 720;
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return 720;
      let hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      const ampm = match[3] ? match[3].toUpperCase() : null;
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return hours * 60 + mins;
    };

    routines.forEach(r => {
      if (r.completed || r.status === 'completed') {
        completed.push(r);
      } else {
        const rMins = parseTimeToMinutes(r.time);
        if (rMins <= currentMinutes + 120) {
          dueSoon.push(r);
        } else {
          upcoming.push(r);
        }
      }
    });

    const total = routines.length;
    const completedCount = completed.length;
    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return {
      total,
      completedCount,
      percentage,
      completed,
      dueSoon,
      upcoming,
      remainingCount: total - completedCount
    };
  }

  getCaregiverInsights(patientId) {
    const pid = patientId || this.getCurrentPatientId();
    const careSummary = this.getDailyCareSummary(pid);
    const results = this.getActivityResults(pid);
    const memories = (this.state.memories || []).filter(m => !m.patientId || m.patientId === pid);
    const contacts = this.getEmergencyContactsForPatient(pid);

    const insights = [];

    if (careSummary.completedCount > 0) {
      insights.push({
        id: 'ins-care',
        type: 'routine',
        title: 'Daily Care Milestone',
        description: `${careSummary.completedCount} of ${careSummary.total} scheduled care routines completed today.`,
        icon: 'fact_check',
        color: 'tertiary'
      });
    } else {
      insights.push({
        id: 'ins-care',
        type: 'routine',
        title: 'Pending Routines',
        description: `${careSummary.total} care routines scheduled for today.`,
        icon: 'pending_actions',
        color: 'primary'
      });
    }

    if (results && results.length > 0) {
      const recent = results[0];
      insights.push({
        id: 'ins-act',
        type: 'activity',
        title: 'Recent Cognitive Practice',
        description: `Practiced ${recent.activityTitle || recent.activityId} at ${recent.difficulty || 'Easy'} level (${recent.accuracy || 100}% accuracy).`,
        icon: 'psychology',
        color: 'secondary'
      });
    }

    const familyMems = memories.filter(m => m.isFamilyContributed || m.contributedBy);
    if (familyMems.length > 0) {
      const latest = familyMems[0];
      insights.push({
        id: 'ins-mem',
        type: 'memory',
        title: 'Family Keepsake Shared',
        description: `New keepsake "${latest.title}" shared by ${latest.contributorName || 'Family Circle'}.`,
        icon: 'history_edu',
        color: 'primary'
      });
    }

    const primaryContact = contacts.find(c => c.priority === 'primary');
    if (primaryContact) {
      insights.push({
        id: 'ins-emg',
        type: 'safety',
        title: 'Safety Network Active',
        description: `Primary emergency contact is set to ${primaryContact.name} (${primaryContact.relation || 'Caregiver'}). 112 emergency calling available.`,
        icon: 'verified_user',
        color: 'tertiary'
      });
    }

    return insights;
  }

  getCaregiverNotifications(patientId) {
    const pid = patientId || this.getCurrentPatientId();
    return (this.state.notifications || []).filter(n => {
      if (n.patientId && n.patientId !== pid) return false;
      return true;
    });
  }

  getReportHistory(patientId) {
    const pid = patientId || this.getCurrentPatientId();
    const normalizedPid = (pid === 'usr-asha' || pid === 'patient-1') ? 'user-asha' : pid;
    return (this.state.reportHistory || []).filter(r => {
      const rPid = (r.patientId === 'usr-asha' || r.patientId === 'patient-1') ? 'user-asha' : r.patientId;
      return rPid === normalizedPid;
    });
  }

  saveReportHistory(record) {
    if (!this.state.reportHistory) {
      this.state.reportHistory = [];
    }
    this.state.reportHistory.unshift(record);
    this.saveState();
    this.notify();
    return record;
  }

  getRemindersForPatient(patientId) {
    const pid = patientId || this.getCurrentPatientId();
    return this.state.routines.filter(r => {
      if (!r.patientId) return true;
      if (r.patientId === pid) return true;
      if ((r.patientId === 'user-asha' || r.patientId === 'usr-asha') && (pid === 'user-asha' || pid === 'usr-asha')) return true;
      return false;
    });
  }

  getNextPendingReminder(patientId) {
    const list = this.getRemindersForPatient(patientId);
    return list.find(r => !r.completed && r.status !== 'completed' && r.status !== 'disabled') || null;
  }

  toggleRoutine(routineId) {
    const routine = this.state.routines.find(r => r.id === routineId);
    if (routine) {
      routine.completed = !routine.completed;
      routine.status = routine.completed ? 'completed' : 'pending';
      routine.completedAt = routine.completed 
        ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : null;

      const patientName = (this.state.currentUser && this.state.currentUser.name) || (this.state.profile && this.state.profile.name) || 'Patient';
      if (routine.completed) {
        this.addCaregiverLog(`${patientName} verified completed milestone: "${routine.title}"`);
        this.state.reminderOccurrences.unshift({
          id: 'occ-' + Date.now(),
          reminderId: routine.id,
          patientId: routine.patientId || this.getCurrentPatientId(),
          scheduledTime: routine.time,
          actionTime: routine.completedAt,
          status: 'completed'
        });
      }
      this.notify();
    }
  }

  markReminderDone(id, patientId) {
    const r = this.state.routines.find(x => x.id === id);
    if (r) {
      r.completed = true;
      r.status = 'completed';
      r.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      r.snoozedUntil = null;
      const pid = patientId || r.patientId || this.getCurrentPatientId();
      this.state.reminderOccurrences.unshift({
        id: 'occ-' + Date.now(),
        reminderId: r.id,
        patientId: pid,
        scheduledTime: r.time,
        actionTime: r.completedAt,
        status: 'completed'
      });
      const patientName = (this.state.currentUser && this.state.currentUser.name) || (this.state.profile && this.state.profile.name) || 'Patient';
      this.addCaregiverLog(`${patientName} verified completed milestone: "${r.title}"`);
      this.notify();
    }
  }

  snoozeReminder(id, minutes = 15) {
    const r = this.state.routines.find(x => x.id === id);
    if (r) {
      r.status = 'snoozed';
      r.snoozedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      this.state.reminderOccurrences.unshift({
        id: 'occ-' + Date.now(),
        reminderId: r.id,
        patientId: r.patientId || this.getCurrentPatientId(),
        scheduledTime: r.time,
        actionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'snoozed'
      });
      this.notify();
    }
  }

  skipReminder(id) {
    const r = this.state.routines.find(x => x.id === id);
    if (r) {
      r.status = 'skipped';
      this.state.reminderOccurrences.unshift({
        id: 'occ-' + Date.now(),
        reminderId: r.id,
        patientId: r.patientId || this.getCurrentPatientId(),
        scheduledTime: r.time,
        actionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'skipped'
      });
      this.notify();
    }
  }

  toggleReminderEnabled(id) {
    const r = this.state.routines.find(x => x.id === id);
    if (r) {
      r.enabled = !r.enabled;
      r.status = r.enabled ? (r.completed ? 'completed' : 'pending') : 'disabled';
      this.notify();
    }
  }

  setSelectedReminderForDetail(reminder) {
    this.state.selectedReminderForDetail = reminder;
    this.notify();
  }

  setReminderDetailModalOpen(isOpen) {
    this.state.reminderDetailModalOpen = isOpen;
    this.notify();
  }

  setNotificationPermissionModalOpen(isOpen) {
    this.state.notificationPermissionModalOpen = isOpen;
    this.notify();
  }

  addRoutine(newRoutine) {
    const routine = {
      id: newRoutine.id || ('rtn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5)),
      patientId: newRoutine.patientId || this.getCurrentPatientId(),
      type: newRoutine.type || newRoutine.category || 'routine',
      category: newRoutine.category || newRoutine.type || 'routine',
      recurrence: newRoutine.recurrence || 'daily',
      enabled: newRoutine.enabled !== false,
      status: 'pending',
      completed: false,
      notes: newRoutine.notes || newRoutine.description || '',
      description: newRoutine.description || newRoutine.notes || '',
      ...newRoutine
    };
    this.state.routines.push(routine);
    this.addCaregiverLog(`Caregiver added new scheduled care item: "${routine.title}" for ${routine.time}`);
    this.notify();
    this.saveState();
    return routine;
  }

  addReminder(reminderData) {
    return this.addRoutine(reminderData);
  }

  updateRoutine(id, updates) {
    const r = this.state.routines.find(x => x.id === id);
    if (r) {
      Object.assign(r, updates);
      if (updates.completed !== undefined) {
        r.status = updates.completed ? 'completed' : 'pending';
      }
      this.notify();
      this.saveState();
      return r;
    }
    return null;
  }

  updateReminder(id, updates) {
    return this.updateRoutine(id, updates);
  }

  deleteRoutine(id) {
    const prevLen = this.state.routines.length;
    this.state.routines = this.state.routines.filter(r => r.id !== id);
    const removed = this.state.routines.length < prevLen;
    this.notify();
    this.saveState();
    return removed;
  }

  deleteReminder(id) {
    return this.deleteRoutine(id);
  }

  // --- Cognitive Activity Actions ---
  setActiveActivity(activityId) {
    const act = this.state.activities.find(a => a.id === activityId);
    if (act) {
      this.state.activeActivityId = activityId;
      act.currentStep = 1;
      act.selectedOption = null;
      this.notify();
    }
  }

  getActiveActivity() {
    return this.state.activities.find(a => a.id === this.state.activeActivityId) || this.state.activities[1];
  }

  answerActivity(optionId) {
    const act = this.getActiveActivity();
    if (act) {
      act.selectedOption = optionId;
      this.notify();
    }
  }

  advanceActivityStep() {
    const act = this.getActiveActivity();
    if (act) {
      if (act.currentStep < act.totalSteps) {
        act.currentStep++;
        act.selectedOption = null;
      } else {
        act.completed = true;
      }
      this.notify();
    }
  }

  resetActivity(activityId) {
    const act = this.state.activities.find(a => a.id === activityId) || this.getActiveActivity();
    if (act) {
      act.currentStep = 1;
      act.selectedOption = null;
      act.completed = false;
      this.notify();
    }
  }

  recordActivitySession(sessionData) {
    if (!this.state.activitySessions) {
      this.state.activitySessions = [];
    }
    const pid = sessionData.patientId || this.getCurrentPatientId();
    sessionData.patientId = pid;
    this.state.activitySessions.unshift(sessionData);

    if (!this.state.activityResults) {
      this.state.activityResults = [];
    }
    const resultRecord = {
      id: 'res-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      activityId: sessionData.activityId,
      patientId: pid,
      sessionId: sessionData.id,
      completedAt: sessionData.completedAt || new Date().toISOString(),
      score: sessionData.accuracy,
      accuracy: sessionData.accuracy,
      mistakes: sessionData.repeatedErrors || sessionData.mistakes || 0,
      hintsUsed: sessionData.hintsUsed || 0,
      duration: sessionData.completionTimeSec || sessionData.duration || 0,
      difficulty: sessionData.difficultyLevel || 1,
      status: 'completed'
    };
    this.state.activityResults.unshift(resultRecord);

    // Adaptive difficulty progression (strictly cognitive activity assistance, not diagnostic):
    const act = this.state.activities.find(a => a.id === sessionData.activityId);
    if (act) {
      if (sessionData.accuracy >= 80 && sessionData.hintsUsed === 0 && act.difficulty < 3) {
        act.difficulty = Math.min(3, (act.difficulty || 1) + 1);
        this.addCaregiverLog(`Adaptive Progression: Asha demonstrated serene ease with "${act.name}". Difficulty comfortably advanced to Level ${act.difficulty}.`);
      } else if ((sessionData.repeatedErrors > 1 || sessionData.hintsUsed >= 2) && act.difficulty > 1) {
        act.difficulty = Math.max(1, (act.difficulty || 2) - 1);
        this.addCaregiverLog(`Adaptive Progression: Extra hints & support provided for "${act.name}". Pacing adjusted to Level ${act.difficulty}.`);
      }
    }

    if (this.adaptiveEngine) {
      try {
        this.adaptiveEngine.updateProfileWithSession(sessionData);
      } catch (adaptErr) {
        console.warn('[AdaptiveEngine] Error updating profile with session:', adaptErr);
      }
    }

    if (this.dailyPlanService) {
      try {
        const plan = this.dailyPlanService.getTodayPlan(sessionData.patientId || this.getCurrentPatientId(), false);
        if (plan) {
          this.dailyPlanService.syncPlanWithStore(plan, sessionData.patientId || this.getCurrentPatientId());
        }
      } catch (planErr) {
        console.warn('[DailyPlanService] Sync with session error:', planErr);
      }
    }

    const explainableInsight = `Activity Performance: "${sessionData.activityName}" completed (${sessionData.accuracy}% accuracy, ${sessionData.completionTimeSec}s). Assistance Level: ${sessionData.assistanceLevel}. Engagement: ${sessionData.engagement}.`;
    this.addCaregiverLog(explainableInsight);
    this.notify();
    return resultRecord;
  }

  getActivityResults(patientId) {
    const pid = patientId || this.getCurrentPatientId();
    return (this.state.activityResults || []).filter(r => {
      if (!r.patientId) return pid === 'user-asha' || pid === 'usr-asha';
      if (r.patientId === pid) return true;
      if ((r.patientId === 'user-asha' || r.patientId === 'usr-asha') && (pid === 'user-asha' || pid === 'usr-asha')) return true;
      return false;
    });
  }

  getActivityResult(activityId, patientId) {
    const results = this.getActivityResults(patientId);
    return results.find(r => r.activityId === activityId) || null;
  }

  getRecentActivityResults(patientId, limit = 5) {
    const results = this.getActivityResults(patientId);
    return results.slice(0, limit);
  }

  getActivitySessions(patientId) {
    const pid = patientId || this.getCurrentPatientId();
    return (this.state.activitySessions || []).filter(s => {
      if (!s.patientId) return pid === 'user-asha' || pid === 'usr-asha';
      if (s.patientId === pid) return true;
      if ((s.patientId === 'user-asha' || s.patientId === 'usr-asha') && (pid === 'user-asha' || pid === 'usr-asha')) return true;
      return false;
    });
  }

  getAdaptiveProfile(patientId) {
    const pid = patientId || this.getCurrentPatientId();
    if (this.adaptiveEngine) {
      return this.adaptiveEngine.getAdaptiveProfile(pid);
    }
    return (this.state.adaptiveProfiles || []).find(p => p.patientId === pid) || null;
  }

  getAdaptiveEvents(patientId, limit = 10) {
    const pid = patientId || this.getCurrentPatientId();
    if (this.adaptiveEngine) {
      return this.adaptiveEngine.getAdaptiveEvents(pid, limit);
    }
    return (this.state.adaptiveEvents || []).filter(e => e.patientId === pid).slice(0, limit);
  }

  // --- Memory System Actions ---
  toggleMemoryFavorite(memoryId) {
    const mem = this.state.memories.find(m => m.id === memoryId);
    if (mem) {
      mem.favorite = !mem.favorite;
      mem.updatedAt = new Date().toISOString();
      this.notify();
      return mem.favorite;
    }
    return false;
  }

  toggleMemoryImportant(memoryId) {
    const mem = this.state.memories.find(m => m.id === memoryId);
    if (mem) {
      mem.important = !mem.important;
      mem.updatedAt = new Date().toISOString();
      this.notify();
      return mem.important;
    }
    return false;
  }

  addMemory(memoryItem, creatorId = null) {
    if (!memoryItem || !memoryItem.title || !memoryItem.title.trim()) {
      throw new Error('Memory title is required');
    }
    const patientId = memoryItem.patientId || this.getCurrentPatientId();
    const now = new Date().toISOString();
    const newId = memoryItem.id || ('mem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7));
    const mem = {
      id: newId,
      patientId: patientId,
      title: memoryItem.title.trim(),
      category: memoryItem.category || 'Special Moments',
      type: memoryItem.type || 'editorial',
      year: memoryItem.year || new Date().getFullYear().toString(),
      date: memoryItem.date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      season: memoryItem.season || `${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
      companions: memoryItem.companions || '',
      personIds: Array.isArray(memoryItem.personIds) ? memoryItem.personIds : [],
      placeId: memoryItem.placeId || null,
      eventId: memoryItem.eventId || null,
      storyId: memoryItem.storyId || null,
      quote: memoryItem.quote || '',
      description: memoryItem.description || memoryItem.narrative || '',
      timeOfDay: memoryItem.timeOfDay || 'Daytime',
      cue: memoryItem.cue || 'Warm Keepsake',
      duration: memoryItem.duration || '2 mins',
      audioTitle: memoryItem.audioTitle || `Playing: ${memoryItem.title}`,
      narrationText: memoryItem.narrationText || memoryItem.description || memoryItem.quote || '',
      image: memoryItem.image || memoryItem.coverPhoto || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9quruDM6l-lR-7W24pE_W0NX2mY7MEiDYMl7ql2sZ_QRQ7D-NH9U4cKzj7UJEsP6HAz9UYIXzvWUwLSf9435pp57UHZoEfZpAQ5tcAOs3WdTs3FbMByQj6sgTUZHHPZ-FJGZaZb1Pq8fZYr8634oUGltshBb5QKGGDMKbefz5AzrIxUJXVoDWm-io97RbcNo_e9PL-KCRfocNbcDNjEieNZn-WLyl4RytmqvYfXuB7IpvmQvpZS8d',
      coverPhoto: memoryItem.coverPhoto || memoryItem.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9quruDM6l-lR-7W24pE_W0NX2mY7MEiDYMl7ql2sZ_QRQ7D-NH9U4cKzj7UJEsP6HAz9UYIXzvWUwLSf9435pp57UHZoEfZpAQ5tcAOs3WdTs3FbMByQj6sgTUZHHPZ-FJGZaZb1Pq8fZYr8634oUGltshBb5QKGGDMKbefz5AzrIxUJXVoDWm-io97RbcNo_e9PL-KCRfocNbcDNjEieNZn-WLyl4RytmqvYfXuB7IpvmQvpZS8d',
      tags: Array.isArray(memoryItem.tags) ? memoryItem.tags : [],
      favorite: Boolean(memoryItem.favorite),
      createdBy: memoryItem.createdBy || (this.state.currentUser && this.state.currentUser.name) || creatorId || 'Caregiver',
      isFamilyContributed: Boolean(memoryItem.isFamilyContributed),
      contributedBy: memoryItem.contributedBy || (this.state.currentUser && this.state.currentUser.role) || 'caregiver',
      contributorName: memoryItem.contributorName || memoryItem.createdBy || (this.state.currentUser && this.state.currentUser.name) || 'Family',
      createdAt: now,
      updatedAt: now
    };

    this.state.memories.unshift(mem);

    // Auto-create relational edges if provided
    if (mem.personIds && mem.personIds.length > 0) {
      mem.personIds.forEach(pId => {
        this.addMemoryRelationship({
          patientId: mem.patientId,
          sourceType: 'memory',
          sourceId: mem.id,
          relationshipType: 'features',
          targetType: 'person',
          targetId: pId
        });
      });
    }
    if (mem.placeId) {
      this.addMemoryRelationship({
        patientId: mem.patientId,
        sourceType: 'memory',
        sourceId: mem.id,
        relationshipType: 'located_at',
        targetType: 'place',
        targetId: mem.placeId
      });
    }
    if (mem.eventId) {
      this.addMemoryRelationship({
        patientId: mem.patientId,
        sourceType: 'memory',
        sourceId: mem.id,
        relationshipType: 'commemorates',
        targetType: 'event',
        targetId: mem.eventId
      });
    }

    this.addCaregiverLog(`New family memory "${mem.title}" added to Living Archive.`);
    this.notify();
    return mem;
  }

  updateMemory(memoryId, updates, editorId = null) {
    const mem = this.state.memories.find(m => m.id === memoryId);
    if (!mem) throw new Error(`Memory ${memoryId} not found`);

    if (updates.title !== undefined) {
      if (!updates.title || !updates.title.trim()) {
        throw new Error('Memory title cannot be empty');
      }
      mem.title = updates.title.trim();
    }

    if (updates.description !== undefined) mem.description = updates.description;
    if (updates.category !== undefined) mem.category = updates.category;
    if (updates.year !== undefined) mem.year = updates.year;
    if (updates.date !== undefined) mem.date = updates.date;
    if (updates.quote !== undefined) mem.quote = updates.quote;
    if (updates.image !== undefined) mem.image = updates.image;
    if (updates.coverPhoto !== undefined) mem.coverPhoto = updates.coverPhoto;
    if (updates.tags !== undefined) mem.tags = updates.tags;
    if (updates.favorite !== undefined) mem.favorite = Boolean(updates.favorite);
    if (updates.important !== undefined) mem.important = Boolean(updates.important);
    if (updates.companions !== undefined) mem.companions = updates.companions;
    if (updates.personIds !== undefined) mem.personIds = updates.personIds;
    if (updates.placeId !== undefined) mem.placeId = updates.placeId;
    if (updates.eventId !== undefined) mem.eventId = updates.eventId;

    mem.updatedAt = new Date().toISOString();
    this.addCaregiverLog(`Updated memory "${mem.title}".`);
    this.notify();
    return mem;
  }

  deleteMemory(memoryId, requesterId = null) {
    const index = this.state.memories.findIndex(m => m.id === memoryId);
    if (index === -1) throw new Error(`Memory ${memoryId} not found`);

    const deleted = this.state.memories[index];
    const user = requesterId 
      ? ((this.state.users || []).find(u => u.id === requesterId) || { id: requesterId, role: 'patient' })
      : this.state.currentUser;

    // Authorization verification: Requester must be the memory owner or an authorized caregiver
    if (user && deleted.patientId) {
      if (user.role === 'patient' && user.id !== deleted.patientId && !(user.id === 'user-asha' && deleted.patientId === 'usr-asha')) {
        throw new Error(`Unauthorized: Patient ${user.id} cannot delete memory belonging to patient ${deleted.patientId}`);
      }
      if (user.role === 'caregiver' && !this.isAuthorizedForPatient(user.id, deleted.patientId)) {
        throw new Error(`Unauthorized: Caregiver ${user.id} is not authorized to delete memory for patient ${deleted.patientId}`);
      }
    }

    this.state.memories.splice(index, 1);

    // Prune connected relationships in memoryRelationships to avoid orphaned edges
    this.state.memoryRelationships = (this.state.memoryRelationships || []).filter(rel => 
      !(rel.sourceId === memoryId || rel.targetId === memoryId)
    );

    this.addCaregiverLog(`Memory "${deleted.title}" was removed from archive.`);
    this.notify();
    return true;
  }

  addMemoryRelationship(rel) {
    if (!rel || !rel.sourceType || !rel.sourceId || !rel.relationshipType || !rel.targetType || !rel.targetId) {
      return null;
    }
    const patientId = rel.patientId || this.getCurrentPatientId();
    this.state.memoryRelationships = this.state.memoryRelationships || [];

    // Duplicate check
    const existing = this.state.memoryRelationships.find(r => 
      r.patientId === patientId &&
      r.sourceId === rel.sourceId &&
      r.relationshipType === rel.relationshipType &&
      r.targetId === rel.targetId
    );
    if (existing) return existing;

    const newRel = {
      id: rel.id || ('rel-' + Date.now() + '-' + Math.floor(Math.random() * 1000)),
      patientId: patientId,
      sourceType: rel.sourceType,
      sourceId: rel.sourceId,
      relationshipType: rel.relationshipType,
      targetType: rel.targetType,
      targetId: rel.targetId,
      createdAt: new Date().toISOString()
    };
    this.state.memoryRelationships.push(newRel);
    this.notify();
    return newRel;
  }

  removeMemoryRelationship(relId) {
    this.state.memoryRelationships = (this.state.memoryRelationships || []).filter(r => r.id !== relId);
    this.notify();
  }

  setSelectedMemoryDetail(memory) {
    if (memory && this.state.currentUser) {
      const user = this.state.currentUser;
      const memPid = memory.patientId || 'user-asha';
      if (user.role === 'patient' && user.id !== memPid && !(user.id === 'user-asha' && (memPid === 'user-asha' || memPid === 'usr-asha'))) {
        throw new Error(`Unauthorized: Patient ${user.id} cannot access memory belonging to ${memPid}`);
      }
      if (user.role === 'caregiver' && !this.isAuthorizedForPatient(user.id, memPid)) {
        throw new Error(`Unauthorized: Caregiver ${user.id} is not authorized to view memory for patient ${memPid}`);
      }
    }
    this.state.selectedMemoryDetail = memory;
    this.notify();
  }

  setMemoryDetailModalOpen(isOpen) {
    this.state.memoryDetailModalOpen = isOpen;
    this.notify();
  }

  setSelectedEntityDetail(typeOrPayload, entity = null) {
    if (typeOrPayload && typeof typeOrPayload === 'object' && typeOrPayload.type) {
      this.state.selectedEntityDetail = typeOrPayload;
    } else {
      this.state.selectedEntityDetail = entity ? { type: typeOrPayload, data: entity } : null;
    }
    this.notify();
  }

  setEntityDetailModalOpen(isOpen) {
    this.state.entityDetailModalOpen = isOpen;
    this.notify();
  }

  getMemoriesByCategory(category, patientId = null) {
    const pid = patientId || this.getCurrentPatientId();
    const patientMemories = (this.state.memories || []).filter(m => !m.patientId || m.patientId === pid);
    if (!category || category === 'All Memories') {
      return patientMemories;
    }
    return patientMemories.filter(m => m.category && m.category.toLowerCase() === category.toLowerCase());
  }

  resetActiveContext() {
    this.state.activeRoute = 'auth-login';
    this.state.selectedMemoryDetail = null;
    this.state.selectedEntityDetail = null;
    this.state.memoryDetailModalOpen = false;
    this.state.entityDetailModalOpen = false;
    this.state.isPreviewMode = false;
    this.state.previewPatientId = null;
    this.notify();
  }

  // --- Caregiver & Telemetry Actions ---
  addCaregiverLog(text) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    this.state.caregiverLogs.unshift({
      id: 'log-' + Date.now(),
      time: time,
      text: text
    });
    this.notify();
  }

  isCaregiver() {
    const user = this.state.currentUser;
    return Boolean(user && (user.role === 'caregiver' || user.role === 'family'));
  }

  // --- Part 10 Emergency SOS & Caregiver Contacts ---
  getEmergencyContactsForPatient(patientId) {
    const pid = patientId || this.getCurrentPatientId();
    const normalizedPid = (pid === 'usr-asha' || pid === 'user-asha') ? 'user-asha' : pid;

    if (!Array.isArray(this.state.emergencyContacts)) {
      this.state.emergencyContacts = [];
    }

    // Normalize any legacy initial database contacts
    this.state.emergencyContacts.forEach(c => {
      if (!c.patientId) {
        c.patientId = 'user-asha';
      }
      if (c.name === 'Meera (Daughter)') {
        c.name = 'Meera';
        c.relation = 'Daughter';
        c.priority = 'primary';
        c.roleLabel = 'Primary Caregiver';
      } else if (c.name === 'Ravi (Son)') {
        c.name = 'Ravi';
        c.relation = 'Son';
        c.priority = 'secondary';
        c.roleLabel = 'Secondary Contact';
      } else if (c.phone === '112') {
        c.priority = 'emergency';
        c.roleLabel = 'Emergency Dispatch';
      }
      if (c.enabled === undefined) {
        c.enabled = true;
      }
    });

    let contacts = this.state.emergencyContacts.filter(c => {
      const cPid = (c.patientId === 'usr-asha' || c.patientId === 'user-asha') ? 'user-asha' : (c.patientId || 'user-asha');
      return cPid === normalizedPid;
    });

    // If Asha has no contacts yet, populate canonical initial records
    if (contacts.length === 0 && normalizedPid === 'user-asha') {
      const defaults = [
        {
          id: 'ec-1',
          patientId: 'user-asha',
          name: 'National Emergency Response 112',
          relation: 'Public Emergency',
          phone: '112',
          priority: 'emergency',
          roleLabel: 'Emergency Dispatch',
          badge: 'Unified Response (Police, Ambulance, Fire)',
          enabled: true
        },
        {
          id: 'ec-2',
          patientId: 'user-asha',
          name: 'Meera',
          relation: 'Daughter',
          phone: '+91 98450 21345',
          priority: 'primary',
          roleLabel: 'Primary Caregiver',
          badge: 'Home Safe Zone (3 mins away)',
          enabled: true
        },
        {
          id: 'ec-3',
          patientId: 'user-asha',
          name: 'Ravi',
          relation: 'Son',
          phone: '+91 99000 78219',
          priority: 'secondary',
          roleLabel: 'Secondary Contact',
          badge: 'Remote Sync (Bangalore)',
          enabled: true
        }
      ];
      this.state.emergencyContacts.push(...defaults);
      contacts = defaults;
      this.saveState();
    }

    return contacts;
  }

  addEmergencyContact(contactData, requestingUser = undefined) {
    const user = requestingUser !== undefined ? requestingUser : this.state.currentUser;
    if (!user) {
      throw new Error('Unauthorized: Authentication required to manage emergency contacts.');
    }
    if (user.role !== 'caregiver' && user.role !== 'family') {
      throw new Error('Unauthorized: Only authorized caregivers and family members can manage emergency contacts.');
    }

    if (!contactData || !contactData.name || !contactData.name.trim()) {
      throw new Error('Contact name is required');
    }
    if (!contactData.phone || !contactData.phone.trim()) {
      throw new Error('Phone number is required');
    }

    const cleanPhone = contactData.phone.trim();
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/;
    if (!phoneRegex.test(cleanPhone)) {
      throw new Error('Invalid phone number format. Please provide a valid telephone number.');
    }

    const pid = contactData.patientId || this.getCurrentPatientId();
    const normalizedPid = (pid === 'usr-asha' || pid === 'user-asha') ? 'user-asha' : pid;

    // Duplicate check
    const existing = this.getEmergencyContactsForPatient(normalizedPid);
    const cleanPhoneDigits = cleanPhone.replace(/\D/g, '');
    const cleanInputName = contactData.name.trim().toLowerCase();

    const isDuplicate = existing.some(c => {
      const existingName = c.name.trim().toLowerCase();
      const existingDigits = c.phone.replace(/\D/g, '');
      const nameMatch = existingName === cleanInputName || 
                        existingName.startsWith(cleanInputName) || 
                        cleanInputName.startsWith(existingName);
      const phoneMatch = cleanPhoneDigits && existingDigits && (cleanPhoneDigits === existingDigits);
      return nameMatch || phoneMatch;
    });
    if (isDuplicate) {
      throw new Error('Duplicate contact: A contact with this name or phone number already exists.');
    }

    const isPrimary = contactData.priority === 'primary' || contactData.priority === 1 || contactData.roleLabel === 'Primary Caregiver';

    // Single primary caregiver constraint: demote previous primary
    if (isPrimary) {
      existing.forEach(c => {
        if (c.priority === 'primary' || c.roleLabel === 'Primary Caregiver') {
          c.priority = 'secondary';
          c.roleLabel = 'Secondary Contact';
        }
      });
    }

    const newContact = {
      id: contactData.id || ('ec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)),
      patientId: normalizedPid,
      name: contactData.name.trim(),
      relation: contactData.relation || contactData.relationship || 'Emergency Contact',
      phone: cleanPhone,
      priority: isPrimary ? 'primary' : (contactData.priority || 'secondary'),
      roleLabel: isPrimary ? 'Primary Caregiver' : (contactData.roleLabel || 'Secondary Contact'),
      enabled: contactData.enabled !== undefined ? Boolean(contactData.enabled) : true,
      badge: contactData.badge || 'Care Circle Member',
      createdAt: new Date().toISOString()
    };

    if (!Array.isArray(this.state.emergencyContacts)) {
      this.state.emergencyContacts = [];
    }
    this.state.emergencyContacts.push(newContact);

    this.recordEmergencyEvent({
      action: 'contact_added',
      status: 'success',
      details: `Added contact: ${newContact.name} (${newContact.phone})`,
      patientId: normalizedPid
    });

    this.saveState();
    this.notify();
    return newContact;
  }

  updateEmergencyContact(contactId, updateData, requestingUser = undefined) {
    const user = requestingUser !== undefined ? requestingUser : this.state.currentUser;
    if (!user) {
      throw new Error('Unauthorized: Authentication required to manage emergency contacts.');
    }
    if (user.role !== 'caregiver' && user.role !== 'family') {
      throw new Error('Unauthorized: Only authorized caregivers and family members can manage emergency contacts.');
    }

    const contact = (this.state.emergencyContacts || []).find(c => c.id === contactId);
    if (!contact) {
      throw new Error(`Emergency contact not found with ID: ${contactId}`);
    }

    if (updateData.phone !== undefined) {
      const cleanPhone = updateData.phone.trim();
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(cleanPhone)) {
        throw new Error('Invalid phone number format. Please provide a valid telephone number.');
      }
      contact.phone = cleanPhone;
    }

    if (updateData.name !== undefined && updateData.name.trim()) {
      contact.name = updateData.name.trim();
    }

    if (updateData.relation !== undefined || updateData.relationship !== undefined) {
      contact.relation = updateData.relation || updateData.relationship;
    }

    if (updateData.enabled !== undefined) {
      contact.enabled = Boolean(updateData.enabled);
    }

    const becomesPrimary = updateData.priority === 'primary' || updateData.priority === 1 || updateData.roleLabel === 'Primary Caregiver';
    if (becomesPrimary) {
      const existing = this.getEmergencyContactsForPatient(contact.patientId);
      existing.forEach(c => {
        if (c.id !== contact.id && (c.priority === 'primary' || c.roleLabel === 'Primary Caregiver')) {
          c.priority = 'secondary';
          c.roleLabel = 'Secondary Contact';
        }
      });
      contact.priority = 'primary';
      contact.roleLabel = 'Primary Caregiver';
    } else if (updateData.priority !== undefined) {
      contact.priority = updateData.priority;
      if (updateData.roleLabel) contact.roleLabel = updateData.roleLabel;
    }

    contact.updatedAt = new Date().toISOString();

    this.recordEmergencyEvent({
      action: 'contact_updated',
      status: 'success',
      details: `Updated contact: ${contact.name}`,
      patientId: contact.patientId
    });

    this.saveState();
    this.notify();
    return contact;
  }

  deleteEmergencyContact(contactId, requestingUser = undefined) {
    const user = requestingUser !== undefined ? requestingUser : this.state.currentUser;
    if (!user) {
      throw new Error('Unauthorized: Authentication required to manage emergency contacts.');
    }
    if (user.role !== 'caregiver' && user.role !== 'family') {
      throw new Error('Unauthorized: Only authorized caregivers and family members can manage emergency contacts.');
    }

    const index = (this.state.emergencyContacts || []).findIndex(c => c.id === contactId);
    if (index === -1) {
      throw new Error(`Emergency contact not found with ID: ${contactId}`);
    }

    const removed = this.state.emergencyContacts.splice(index, 1)[0];
    this.recordEmergencyEvent({
      action: 'contact_deleted',
      status: 'success',
      details: `Removed contact: ${removed.name}`,
      patientId: removed.patientId
    });

    this.saveState();
    this.notify();
    return removed;
  }

  toggleEmergencyContactEnabled(contactId, requestingUser = undefined) {
    const user = requestingUser !== undefined ? requestingUser : this.state.currentUser;
    if (!user) {
      throw new Error('Unauthorized: Authentication required to manage emergency contacts.');
    }
    if (user.role !== 'caregiver' && user.role !== 'family') {
      throw new Error('Unauthorized: Only authorized caregivers and family members can manage emergency contacts.');
    }

    const contact = (this.state.emergencyContacts || []).find(c => c.id === contactId);
    if (!contact) throw new Error('Contact not found');

    contact.enabled = !Boolean(contact.enabled);
    contact.updatedAt = new Date().toISOString();

    this.recordEmergencyEvent({
      action: contact.enabled ? 'contact_enabled' : 'contact_disabled',
      status: 'success',
      details: `${contact.enabled ? 'Enabled' : 'Disabled'} contact: ${contact.name}`,
      patientId: contact.patientId
    });

    this.saveState();
    this.notify();
    return contact.enabled;
  }

  setPrimaryEmergencyContact(contactId, requestingUser = undefined) {
    return this.updateEmergencyContact(contactId, { priority: 'primary', roleLabel: 'Primary Caregiver' }, requestingUser);
  }

  recordEmergencyEvent(eventData) {
    const action = eventData.action || eventData.type || 'unknown_event';
    const status = eventData.status || 'recorded';
    const details = eventData.details || eventData.notes || '';
    const pid = eventData.patientId || this.getCurrentPatientId();
    const normalizedPid = (pid === 'usr-asha' || pid === 'user-asha') ? 'user-asha' : pid;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    const newEvent = {
      id: 'sos-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      patientId: normalizedPid,
      timestamp: time,
      isoTimestamp: new Date().toISOString(),
      action: action,
      title: action.replace(/_/g, ' ').toUpperCase(),
      status: status,
      details: details,
      notes: details
    };

    if (!Array.isArray(this.state.sosEvents)) {
      this.state.sosEvents = [];
    }
    this.state.sosEvents.unshift(newEvent);

    this.addCaregiverLog(`SOS EVENT [${action}]: ${status} (${details})`);
    this.saveState();
    this.notify();
    return newEvent;
  }

  recordSosEvent(type, status, notes) {
    return this.recordEmergencyEvent({
      action: type,
      status: status,
      details: notes,
      patientId: this.getCurrentPatientId()
    });
  }

  getEmergencyEventsForPatient(patientId) {
    const pid = patientId || this.getCurrentPatientId();
    const normalizedPid = (pid === 'usr-asha' || pid === 'user-asha') ? 'user-asha' : pid;
    return (this.state.sosEvents || []).filter(e => {
      const ePid = (e.patientId === 'usr-asha' || e.patientId === 'user-asha') ? 'user-asha' : (e.patientId || 'user-asha');
      return ePid === normalizedPid;
    });
  }

  getEmergencyPreferences(patientId) {
    const pid = patientId || this.getCurrentPatientId();
    const normalizedPid = (pid === 'usr-asha' || pid === 'user-asha') ? 'user-asha' : pid;
    if (!this.state.emergencyPreferences) this.state.emergencyPreferences = {};
    return this.state.emergencyPreferences[normalizedPid] || {
      patientId: normalizedPid,
      autoShareLocation: false,
      enableCaregiverAlerts: true
    };
  }

  updateEmergencyPreferences(patientId, prefs, requestingUser = undefined) {
    const user = requestingUser !== undefined ? requestingUser : this.state.currentUser;
    if (!user || (user.role !== 'caregiver' && user.role !== 'family')) {
      throw new Error('Unauthorized: Only caregivers can update emergency preferences.');
    }
    const pid = patientId || this.getCurrentPatientId();
    const normalizedPid = (pid === 'usr-asha' || pid === 'user-asha') ? 'user-asha' : pid;
    if (!this.state.emergencyPreferences) this.state.emergencyPreferences = {};
    this.state.emergencyPreferences[normalizedPid] = {
      ...(this.state.emergencyPreferences[normalizedPid] || {}),
      ...prefs,
      patientId: normalizedPid
    };
    this.saveState();
    this.notify();
    return this.state.emergencyPreferences[normalizedPid];
  }

  // --- Voice Memories & Multilingual Preferences ---
  addVoiceMemory(voiceMemoryData) {
    if (!voiceMemoryData || !voiceMemoryData.title) {
      throw new Error('Voice memory title is required');
    }
    const rawPid = voiceMemoryData.patientId || this.getCurrentPatientId();
    const patientId = (rawPid === 'usr-asha' || rawPid === 'user-asha') ? 'user-asha' : rawPid;
    const newId = voiceMemoryData.id || ('vm-' + Date.now());
    const createdAt = voiceMemoryData.createdAt || new Date().toISOString();
    const dateStr = voiceMemoryData.date || new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });

    const newRecord = {
      id: newId,
      patientId: patientId,
      title: voiceMemoryData.title.trim(),
      audioUrl: voiceMemoryData.audioUrl || '',
      transcript: voiceMemoryData.transcript || '',
      storyId: voiceMemoryData.storyId || null,
      memoryId: voiceMemoryData.memoryId || null,
      placeId: voiceMemoryData.placeId || null,
      personIds: Array.isArray(voiceMemoryData.personIds) ? voiceMemoryData.personIds : [],
      eventId: voiceMemoryData.eventId || null,
      duration: voiceMemoryData.duration || '00:30',
      author: voiceMemoryData.author || (this.state.currentUser && this.state.currentUser.name) || 'Self',
      date: dateStr,
      favorite: Boolean(voiceMemoryData.favorite),
      isPrivate: voiceMemoryData.isPrivate !== undefined ? Boolean(voiceMemoryData.isPrivate) : true,
      sharedWithFamily: Boolean(voiceMemoryData.sharedWithFamily),
      aiSummary: voiceMemoryData.aiSummary || null,
      createdAt: createdAt
    };

    if (!Array.isArray(this.state.voiceMemories)) {
      this.state.voiceMemories = [];
    }

    // Auto-create/link corresponding Personal Memory World item if not already linked
    if (voiceMemoryData.autoCreateMemory !== false && !newRecord.memoryId) {
      const linkedMemId = 'mem-vm-' + newId;
      const yearMatch = dateStr.match(/\b(19\d\d|20\d\d)\b/);
      const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

      const linkedMemory = {
        id: linkedMemId,
        patientId: patientId,
        title: newRecord.title,
        category: 'Voice Notes',
        type: 'voice',
        year: year,
        date: dateStr,
        season: dateStr,
        companions: '',
        personIds: [...newRecord.personIds],
        placeId: newRecord.placeId,
        eventId: newRecord.eventId,
        storyId: newRecord.storyId,
        quote: newRecord.transcript ? `"${newRecord.transcript.slice(0, 120)}${newRecord.transcript.length > 120 ? '...' : ''}"` : '',
        description: newRecord.transcript || newRecord.aiSummary || 'Voice Journal Recording',
        timeOfDay: 'Daytime',
        cue: 'Spoken Keepsake',
        duration: newRecord.duration,
        audioTitle: `Voice Journal: ${newRecord.title}`,
        audioUrl: newRecord.audioUrl,
        narrationText: newRecord.transcript || '',
        image: null,
        coverPhoto: null,
        tags: ['Voice Journal', 'Personal Memory'],
        favorite: newRecord.favorite,
        voiceMemoryId: newId,
        createdBy: newRecord.author,
        isPrivate: newRecord.isPrivate,
        sharedWithFamily: newRecord.sharedWithFamily,
        createdAt: createdAt,
        updatedAt: createdAt
      };

      if (!Array.isArray(this.state.memories)) {
        this.state.memories = [];
      }
      this.state.memories.unshift(linkedMemory);
      newRecord.memoryId = linkedMemId;

      // Add relational graph edges
      if (newRecord.personIds.length > 0) {
        newRecord.personIds.forEach(pId => {
          this.addMemoryRelationship({
            patientId,
            sourceType: 'memory',
            sourceId: linkedMemId,
            relationshipType: 'features',
            targetType: 'person',
            targetId: pId
          });
        });
      }
      if (newRecord.placeId) {
        this.addMemoryRelationship({
          patientId,
          sourceType: 'memory',
          sourceId: linkedMemId,
          relationshipType: 'located_at',
          targetType: 'place',
          targetId: newRecord.placeId
        });
      }
      if (newRecord.eventId) {
        this.addMemoryRelationship({
          patientId,
          sourceType: 'memory',
          sourceId: linkedMemId,
          relationshipType: 'commemorates',
          targetType: 'event',
          targetId: newRecord.eventId
        });
      }
      if (newRecord.storyId) {
        this.addMemoryRelationship({
          patientId,
          sourceType: 'memory',
          sourceId: linkedMemId,
          relationshipType: 'narrates',
          targetType: 'story',
          targetId: newRecord.storyId
        });
      }
    }

    this.state.voiceMemories.unshift(newRecord);
    this.saveState();
    this.addCaregiverLog(`Voice memory "${newRecord.title}" recorded and saved.`);
    this.notify();
    return newRecord;
  }

  updateVoiceMemory(voiceMemoryId, updates = {}, requesterId = null) {
    if (!Array.isArray(this.state.voiceMemories)) return null;
    const index = this.state.voiceMemories.findIndex(vm => vm.id === voiceMemoryId);
    if (index === -1) throw new Error(`Voice memory ${voiceMemoryId} not found`);

    const existing = this.state.voiceMemories[index];
    const user = requesterId 
      ? ((this.state.users || []).find(u => u.id === requesterId) || (this.state.currentUser && this.state.currentUser.id === requesterId ? this.state.currentUser : null) || { id: requesterId, role: requesterId.startsWith('caregiver') ? 'caregiver' : 'patient' })
      : this.state.currentUser;

    // Authorization verification
    if (user && existing.patientId) {
      if (user.role === 'patient' && user.id !== existing.patientId && !(user.id === 'user-asha' && existing.patientId === 'usr-asha')) {
        throw new Error(`Unauthorized: Patient ${user.id} cannot edit voice memory belonging to ${existing.patientId}`);
      }
      if (user.role === 'caregiver' && !this.isAuthorizedForPatient(user.id, existing.patientId)) {
        throw new Error(`Unauthorized: Caregiver ${user.id} is not authorized for patient ${existing.patientId}`);
      }
    }

    const updated = {
      ...existing,
      ...updates,
      id: existing.id,
      patientId: existing.patientId,
      audioUrl: existing.audioUrl // Preserve original recorded audio
    };
    this.state.voiceMemories[index] = updated;

    // Synchronize linked memory if exists
    if (updated.memoryId && Array.isArray(this.state.memories)) {
      const memIndex = this.state.memories.findIndex(m => m.id === updated.memoryId);
      if (memIndex !== -1) {
        this.state.memories[memIndex] = {
          ...this.state.memories[memIndex],
          title: updated.title || this.state.memories[memIndex].title,
          description: updated.transcript || this.state.memories[memIndex].description,
          narrationText: updated.transcript || this.state.memories[memIndex].narrationText,
          date: updated.date || this.state.memories[memIndex].date,
          personIds: updated.personIds || this.state.memories[memIndex].personIds,
          placeId: updated.placeId !== undefined ? updated.placeId : this.state.memories[memIndex].placeId,
          eventId: updated.eventId !== undefined ? updated.eventId : this.state.memories[memIndex].eventId,
          storyId: updated.storyId !== undefined ? updated.storyId : this.state.memories[memIndex].storyId,
          favorite: updated.favorite !== undefined ? updated.favorite : this.state.memories[memIndex].favorite,
          sharedWithFamily: updated.sharedWithFamily !== undefined ? updated.sharedWithFamily : this.state.memories[memIndex].sharedWithFamily
        };
      }
    }

    this.saveState();
    this.addCaregiverLog(`Voice memory "${updated.title}" updated.`);
    this.notify();
    return updated;
  }

  deleteVoiceMemory(voiceMemoryId, requesterId = null) {
    if (!Array.isArray(this.state.voiceMemories)) return false;
    const index = this.state.voiceMemories.findIndex(vm => vm.id === voiceMemoryId);
    if (index === -1) throw new Error(`Voice memory ${voiceMemoryId} not found`);

    const deleted = this.state.voiceMemories[index];
    const user = requesterId 
      ? ((this.state.users || []).find(u => u.id === requesterId) || (this.state.currentUser && this.state.currentUser.id === requesterId ? this.state.currentUser : null) || { id: requesterId, role: requesterId.startsWith('caregiver') ? 'caregiver' : 'patient' })
      : this.state.currentUser;

    // Authorization verification
    if (user && deleted.patientId) {
      if (user.role === 'patient' && user.id !== deleted.patientId && !(user.id === 'user-asha' && deleted.patientId === 'usr-asha')) {
        throw new Error(`Unauthorized: Patient ${user.id} cannot delete voice memory belonging to ${deleted.patientId}`);
      }
      if (user.role === 'caregiver' && !this.isAuthorizedForPatient(user.id, deleted.patientId)) {
        throw new Error(`Unauthorized: Caregiver ${user.id} is not authorized for patient ${deleted.patientId}`);
      }
    }

    this.state.voiceMemories.splice(index, 1);

    // Remove linked memory in memories if exists
    if (deleted.memoryId && Array.isArray(this.state.memories)) {
      this.state.memories = this.state.memories.filter(m => m.id !== deleted.memoryId);
      // Remove relationships for that memory
      this.state.memoryRelationships = (this.state.memoryRelationships || []).filter(rel =>
        rel.sourceId !== deleted.memoryId && rel.targetId !== deleted.memoryId
      );
    }

    this.saveState();
    this.addCaregiverLog(`Voice memory "${deleted.title}" was removed.`);
    this.notify();
    return true;
  }

  toggleVoiceMemoryFavorite(voiceMemoryId) {
    if (!Array.isArray(this.state.voiceMemories)) return false;
    const vm = this.state.voiceMemories.find(v => v.id === voiceMemoryId);
    if (!vm) return false;

    vm.favorite = !Boolean(vm.favorite);

    if (vm.memoryId && Array.isArray(this.state.memories)) {
      const mem = this.state.memories.find(m => m.id === vm.memoryId);
      if (mem) {
        mem.favorite = vm.favorite;
      }
    }

    this.saveState();
    this.notify();
    return vm.favorite;
  }

  shareVoiceMemoryWithFamily(voiceMemoryId, patientId = null) {
    if (!Array.isArray(this.state.voiceMemories)) return false;
    const vm = this.state.voiceMemories.find(v => v.id === voiceMemoryId);
    if (!vm) return false;

    const pid = patientId || this.getCurrentPatientId();
    if (vm.patientId !== pid && !(pid === 'user-asha' && vm.patientId === 'usr-asha')) {
      throw new Error('Unauthorized sharing attempt');
    }

    vm.sharedWithFamily = true;
    vm.isPrivate = false;

    if (vm.memoryId && Array.isArray(this.state.memories)) {
      const mem = this.state.memories.find(m => m.id === vm.memoryId);
      if (mem) {
        mem.sharedWithFamily = true;
        mem.isPrivate = false;
      }
    }

    this.saveState();
    this.addCaregiverLog(`Voice memory "${vm.title}" shared with Family Circle.`);
    this.notify();
    return true;
  }

  getVoiceMemoriesForPatient(patientId) {
    const rawPid = patientId || this.getCurrentPatientId();
    const targetPatientId = (rawPid === 'usr-asha' || rawPid === 'user-asha') ? 'user-asha' : rawPid;
    if (!Array.isArray(this.state.voiceMemories)) return [];
    return this.state.voiceMemories.filter(vm => {
      const vmPid = (vm.patientId === 'usr-asha' || vm.patientId === 'user-asha') ? 'user-asha' : vm.patientId;
      return vmPid === targetPatientId;
    });
  }

  getPreferredLanguage(patientId) {
    const targetPatientId = patientId || this.getCurrentPatientId();
    const user = (this.state.users || []).find(u => u.id === targetPatientId);
    return (user && user.preferredLanguage) || (this.state.settings && this.state.settings.language) || 'en';
  }

  setPreferredLanguage(patientId, lang) {
    const targetPatientId = patientId || this.getCurrentPatientId();
    const user = (this.state.users || []).find(u => u.id === targetPatientId);
    if (user) {
      user.preferredLanguage = lang;
    }
    if (!this.state.settings) {
      this.state.settings = {};
    }
    this.state.settings.language = lang;
    this.saveState();
    this.notify();
  }

  getPeopleForPatient(patientId) {
    const pid = patientId || this.getCurrentPatientId();
    const normalizedPid = (pid === 'usr-asha' || pid === 'user-asha') ? 'user-asha' : pid;
    return (this.state.people || []).filter(p => {
      const pPid = (p.patientId === 'usr-asha' || p.patientId === 'user-asha') ? 'user-asha' : (p.patientId || 'user-asha');
      return pPid === normalizedPid;
    });
  }

  togglePersonFavorite(personId) {
    const person = (this.state.people || []).find(p => p.id === personId);
    if (!person) return false;
    person.favorite = !Boolean(person.favorite);
    this.saveState();
    this.notify();
    return person.favorite;
  }

  addPerson(personData) {
    if (!personData || !personData.name || !personData.name.trim()) {
      throw new Error('Person name is required');
    }
    const pid = personData.patientId || this.getCurrentPatientId();
    const normalizedPid = (pid === 'usr-asha' || pid === 'user-asha') ? 'user-asha' : pid;
    const newPerson = {
      id: personData.id || ('p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)),
      patientId: normalizedPid,
      name: personData.name.trim(),
      relation: personData.relation || 'Family Member',
      tag: personData.tag || 'Family Member',
      bio: personData.bio || 'A beloved person in your family circle.',
      avatar: personData.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw',
      phone: personData.phone || null,
      email: personData.email || null,
      proximity: personData.proximity || 'In your circle',
      favorite: Boolean(personData.favorite),
      connectedMemoryIds: Array.isArray(personData.connectedMemoryIds) ? personData.connectedMemoryIds : []
    };

    if (!Array.isArray(this.state.people)) {
      this.state.people = [];
    }
    this.state.people.push(newPerson);
    this.saveState();
    this.notify();
    return newPerson;
  }

  addContributedMemory(memoryData, contributorUser = undefined) {
    const user = contributorUser !== undefined ? contributorUser : this.state.currentUser;
    if (!user) {
      throw new Error('Unauthorized: Only authenticated family members and caregivers can contribute memories.');
    }
    if (user.role !== 'caregiver' && user.role !== 'family' && user.role !== 'patient') {
      throw new Error('Unauthorized: Insufficient permissions to contribute memories.');
    }

    const contributorName = user.name || 'Family';
    const contributorRole = user.role || 'family';

    const memoryItem = {
      ...memoryData,
      isFamilyContributed: true,
      contributedBy: contributorRole,
      contributorName: contributorName
    };

    const savedMemory = this.addMemory(memoryItem, user.id);

    // Create gentle notification for patient
    if (!Array.isArray(this.state.notifications)) {
      this.state.notifications = [];
    }
    this.state.notifications.unshift({
      id: 'notif-fam-' + Date.now(),
      title: 'New Family Memory',
      message: `${contributorName} added "${savedMemory.title}" to your memory album.`,
      type: 'memory',
      time: 'Just now',
      read: false
    });

    this.saveState();
    this.notify();
    return savedMemory;
  }

  // --- Modals & Companion State ---
  setVoiceModalOpen(isOpen) {
    this.state.voiceModalOpen = isOpen;
    this.notify();
  }

  setAuthModalOpen(isOpen) {
    this.state.authModalOpen = isOpen;
    this.notify();
  }
}

export const store = new Store();
