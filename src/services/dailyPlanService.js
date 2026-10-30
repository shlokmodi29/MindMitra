// MindMitra Smart Daily Plan Service
// Integrates Daily Care, Reminders, Appointments, Adaptive Activities, and SmritiAI
// Strictly Non-Diagnostic, Zero-Fabrication, Patient-Isolated & Offline-First

import { store } from '../state/store.js';
import { storageService } from './storageService.js';
import { adaptiveEngine } from './adaptiveEngine.js';
import { activityRegistry } from './activityRegistry.js';
import { memoryService } from './memoryService.js';
import { doctorService } from './doctorService.js';
import { offlineSyncService, SYNC_OPERATION_TYPES, SYNC_PRIORITIES } from './offlineSyncService.js';
import { REMINDER_STATUS } from './reminderService.js';
import { moodCheckInService } from './moodCheckInService.js';

export const PLAN_ITEM_TYPES = {
  REMINDER: 'reminder',
  ROUTINE: 'routine',
  APPOINTMENT: 'appointment',
  COGNITIVE_ACTIVITY: 'cognitive_activity',
  FAMILY_ACTIVITY: 'family_activity',
  MEMORY_ACTIVITY: 'memory_activity',
  INFORMATIONAL: 'informational'
};

export const PLAN_ITEM_PRIORITIES = {
  IMPORTANT: 'Important',
  SUGGESTED: 'Suggested',
  OPTIONAL: 'Optional'
};

export const PLAN_ITEM_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  SNOOZED: 'snoozed',
  SKIPPED: 'skipped',
  MISSED: 'missed'
};

export const TIME_BUCKETS = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening'
};

class DailyPlanService {
  constructor() {
    this.storageKeyPrefix = 'daily_plan_';
  }

  /**
   * Helper to format Date into YYYY-MM-DD
   */
  formatDateKey(date = new Date()) {
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    const d = (date instanceof Date) ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse 12-hour or 24-hour time into minute-of-day integer
   */
  parseTimeToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return 540; // Default ~9:00 AM
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return 540;
    let hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : null;

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return hours * 60 + mins;
  }

  /**
   * Assign time bucket based on parsed time
   * Morning: < 12:00 PM (0 - 719 mins)
   * Afternoon: 12:00 PM - 5:00 PM (720 - 1019 mins)
   * Evening: >= 5:00 PM (1020+ mins)
   */
  getTimeBucket(timeStr, fallbackType = 'morning') {
    if (!timeStr) return fallbackType;
    const mins = this.parseTimeToMinutes(timeStr);
    if (mins < 720) return TIME_BUCKETS.MORNING;
    if (mins < 1020) return TIME_BUCKETS.AFTERNOON;
    return TIME_BUCKETS.EVENING;
  }

  /**
   * Generates a comprehensive Smart Daily Plan for the specified patient and date.
   * Pulls strictly from actual patient data:
   * - Daily Care routines & medicine reminders
   * - Scheduled appointments
   * - Adaptive cognitive activity recommendation
   * - Safe family circle missions and memories
   */
  generateDailyPlan(patientId, dateInput = null, options = {}) {
    const pid = patientId || store.getCurrentPatientId() || 'user-asha';
    const dateStr = this.formatDateKey(dateInput || new Date());
    const planId = `plan-${pid}-${dateStr}`;

    // 1. Load today's configured reminders & routines
    const routines = store.getRemindersForPatient(pid) || [];

    // 2. Load connected doctor context for factual appointment attribution
    let connectedDoctors = [];
    try {
      connectedDoctors = doctorService.getConnectionsForPatient(pid)
        .filter(c => c.status === 'approved')
        .map(c => c.doctorName);
    } catch {
      connectedDoctors = [];
    }

    const items = [];

    // 3. Process existing routines and reminders
    routines.forEach((r) => {
      if (r.enabled === false) return;

      const isMedicine = r.type === 'medicine' || r.category === 'medicine';
      const isHydration = r.type === 'hydration' || r.category === 'hydration';
      const titleLower = (r.title || '').toLowerCase();
      const isAppointment = r.type === 'appointment' || r.category === 'appointment' ||
        titleLower.includes('doctor') || titleLower.includes('dr.') || titleLower.includes('clinic') || titleLower.includes('hospital') ||
        (titleLower.includes('call') && !titleLower.includes('recall'));
      const isRoutineActivity = r.type === 'activity' || r.category === 'activity';

      let type = PLAN_ITEM_TYPES.ROUTINE;
      let priority = PLAN_ITEM_PRIORITIES.OPTIONAL;
      let icon = r.icon || 'schedule';
      let actionRoute = null;

      let matchedAct = null;
      if (isMedicine) {
        type = PLAN_ITEM_TYPES.REMINDER;
        priority = PLAN_ITEM_PRIORITIES.IMPORTANT;
        icon = 'medication';
      } else if (isAppointment) {
        type = PLAN_ITEM_TYPES.APPOINTMENT;
        priority = PLAN_ITEM_PRIORITIES.IMPORTANT;
        icon = r.title && r.title.toLowerCase().includes('doctor') ? 'calendar_month' : 'video_call';
        actionRoute = r.title && r.title.toLowerCase().includes('doctor') ? 'appointment-prep' : 'family-circle';
      } else if (isHydration) {
        type = PLAN_ITEM_TYPES.ROUTINE;
        priority = PLAN_ITEM_PRIORITIES.SUGGESTED;
        icon = 'water_drop';
      } else if (isRoutineActivity) {
        type = PLAN_ITEM_TYPES.COGNITIVE_ACTIVITY;
        priority = PLAN_ITEM_PRIORITIES.SUGGESTED;
        icon = 'psychology';
        actionRoute = 'activities';
        matchedAct = activityRegistry.getAll().find(a => 
          a.name.toLowerCase() === r.title.toLowerCase() ||
          r.title.toLowerCase().includes(a.name.toLowerCase())
        );
      }

      const timeBucket = this.getTimeBucket(r.time, 'morning');
      const isCompleted = !!(r.completed || r.status === REMINDER_STATUS.COMPLETED);
      const isSnoozed = r.status === REMINDER_STATUS.SNOOZED;

      items.push({
        id: `dpi-${r.id}`,
        planId,
        type,
        title: r.title,
        description: r.notes || r.description || '',
        scheduledTime: r.time || null,
        timeBucket,
        priority,
        status: isCompleted ? PLAN_ITEM_STATUS.COMPLETED : (isSnoozed ? PLAN_ITEM_STATUS.SNOOZED : PLAN_ITEM_STATUS.PENDING),
        sourceId: r.id,
        completedAt: r.completedAt || null,
        metadata: {
          category: r.category || r.type,
          icon,
          actionRoute,
          activityId: matchedAct ? matchedAct.id : null,
          activitySlug: matchedAct ? matchedAct.slug : null,
          recurrence: r.recurrence || 'daily',
          dosageNotes: r.dosageNotes || null,
          doctorName: connectedDoctors.length > 0 ? connectedDoctors[0] : null
        }
      });
    });

    // 4. Check today's mood check-in for lightweight suggestion context
    let todayMood = null;
    try {
      const checkIn = moodCheckInService.getTodayCheckIn(pid);
      if (checkIn) todayMood = checkIn.mood;
    } catch {
      todayMood = null;
    }

    // 5. Activity Recommendation from Adaptive Engine
    // Check if an activity is not already scheduled in the morning/afternoon
    const hasActivityItem = items.some(i => i.type === PLAN_ITEM_TYPES.COGNITIVE_ACTIVITY);
    try {
      const rec = adaptiveEngine.getRecommendedActivity(pid);
      if (rec && rec.activity) {
        const recAct = rec.activity;
        // Determine whether already played today
        const recentResults = store.getActivityResults(pid) || [];
        const todayPlayed = recentResults.some(res => {
          const resDate = this.formatDateKey(res.timestamp || res.completedAt);
          return resDate === dateStr && (res.activityId === recAct.id || res.slug === recAct.slug);
        });

        const gentleMoodNote = todayMood === 'low' ? ' • Gentle, calming session' : (todayMood === 'worried' ? ' • Soothing, relaxed practice' : '');

        // Add recommended cognitive activity as a Suggested item
        items.push({
          id: `dpi-adapt-${recAct.id}`,
          planId,
          type: PLAN_ITEM_TYPES.COGNITIVE_ACTIVITY,
          title: recAct.name || recAct.title,
          description: `Suggested activity • ${rec.recommendedDifficulty} level (${rec.duration || '4 mins'})${gentleMoodNote}. ${rec.gentleReason}`,
          scheduledTime: hasActivityItem ? '11:30 AM' : '10:00 AM',
          timeBucket: TIME_BUCKETS.MORNING,
          priority: PLAN_ITEM_PRIORITIES.SUGGESTED,
          status: todayPlayed ? PLAN_ITEM_STATUS.COMPLETED : PLAN_ITEM_STATUS.PENDING,
          sourceId: recAct.id,
          completedAt: todayPlayed ? (recentResults[0]?.timestamp || null) : null,
          metadata: {
            activityId: recAct.id,
            activitySlug: recAct.slug,
            category: recAct.category,
            difficulty: rec.recommendedDifficulty,
            icon: recAct.icon || 'psychology',
            actionRoute: 'activities',
            moodContext: todayMood
          }
        });
      }
    } catch (err) {
      console.warn('[DailyPlanService] Could not query adaptive recommendation:', err);
    }

    // 6. Memory Integration (Suggest a family memory engagement if available)
    try {
      const memories = (memoryService.getMemories ? memoryService.getMemories(pid) : []) || [];
      if (memories.length > 0) {
        const favMemory = memories.find(m => m.isFavorite || m.isFamilyContributed) || memories[0];
        const isLowMood = todayMood === 'low' || todayMood === 'worried';

        items.push({
          id: isLowMood ? 'plan-act-reminiscence' : `dpi-mem-${favMemory.id}`,
          planId,
          type: PLAN_ITEM_TYPES.MEMORY_ACTIVITY,
          title: isLowMood ? 'Gentle Memory Comfort' : 'Remember a Family Moment',
          description: isLowMood 
            ? `Calm, soothing memories: "${favMemory.title || 'Family keepsake'}" • gentle pace`
            : `Explore memories: "${favMemory.title || 'Family keepsake'}"`,
          scheduledTime: '03:30 PM',
          timeBucket: TIME_BUCKETS.AFTERNOON,
          priority: isLowMood ? PLAN_ITEM_PRIORITIES.SUGGESTED : PLAN_ITEM_PRIORITIES.OPTIONAL,
          status: PLAN_ITEM_STATUS.PENDING,
          sourceId: favMemory.id,
          completedAt: null,
          metadata: {
            memoryId: favMemory.id,
            icon: 'auto_stories',
            actionRoute: 'memory-world',
            moodContext: todayMood
          }
        });
      }
    } catch (err) {
      console.warn('[DailyPlanService] Memory integration skipped:', err);
    }

    // 6. Family Circle Mission (if family stories or call scheduled)
    const hasFamilyItem = items.some(i => i.type === PLAN_ITEM_TYPES.FAMILY_ACTIVITY || (i.type === PLAN_ITEM_TYPES.APPOINTMENT && i.title.toLowerCase().includes('family')));
    if (!hasFamilyItem) {
      const state = store.getState();
      const stories = (state.stories || []).filter(s => !s.patientId || s.patientId === pid);
      if (stories.length > 0) {
        items.push({
          id: `dpi-fam-mission`,
          planId,
          type: PLAN_ITEM_TYPES.FAMILY_ACTIVITY,
          title: 'Family Mission',
          description: 'Share or listen to a family keepsake with Meera.',
          scheduledTime: '05:30 PM',
          timeBucket: TIME_BUCKETS.EVENING,
          priority: PLAN_ITEM_PRIORITIES.OPTIONAL,
          status: PLAN_ITEM_STATUS.PENDING,
          sourceId: 'fam-mission-1',
          completedAt: null,
          metadata: {
            icon: 'diversity_1',
            actionRoute: 'family-circle'
          }
        });
      }
    }

    // 6.5 Optional Voice Journal Suggestion (Elder-friendly, pressure-free reflection)
    const hasVoiceItem = items.some(i => i.id === 'dpi-voice-journal' || (i.metadata && i.metadata.actionRoute === 'voice-journal'));
    if (!hasVoiceItem) {
      const todayVoiceRecorded = (store.getVoiceMemoriesForPatient ? store.getVoiceMemoriesForPatient(pid) : []).some(vm => {
        const vmDate = this.formatDateKey(vm.createdAt || vm.date);
        return vmDate === dateStr;
      });

      items.push({
        id: `dpi-voice-journal`,
        planId,
        type: PLAN_ITEM_TYPES.MEMORY_ACTIVITY,
        title: 'Record a Memory',
        description: 'Tell us about something special from today.',
        scheduledTime: '06:30 PM',
        timeBucket: TIME_BUCKETS.EVENING,
        priority: PLAN_ITEM_PRIORITIES.OPTIONAL,
        status: todayVoiceRecorded ? PLAN_ITEM_STATUS.COMPLETED : PLAN_ITEM_STATUS.PENDING,
        sourceId: 'vj-daily-prompt',
        completedAt: null,
        metadata: {
          icon: 'mic',
          actionRoute: 'voice-journal',
          isVoiceJournal: true,
          optionalPrompt: true
        }
      });
    }

    // 7. Sort items by chronological order within day
    items.sort((a, b) => {
      const minsA = this.parseTimeToMinutes(a.scheduledTime);
      const minsB = this.parseTimeToMinutes(b.scheduledTime);
      return minsA - minsB;
    });

    // 8. Build Plan Object
    const totalCount = items.length;
    const completedCount = items.filter(i => i.status === PLAN_ITEM_STATUS.COMPLETED).length;
    const importantCount = items.filter(i => i.priority === PLAN_ITEM_PRIORITIES.IMPORTANT).length;
    const pendingCount = totalCount - completedCount;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

    const plan = {
      id: planId,
      patientId: pid,
      date: dateStr,
      items,
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'rule-adaptive-engine',
      status: pendingCount === 0 ? 'completed' : 'active',
      summary: {
        total: totalCount,
        completedCount,
        pendingCount,
        importantCount,
        percentage
      }
    };

    // 9. Persist plan
    this.savePlan(plan);
    return plan;
  }

  /**
   * Retrieves existing daily plan or generates a fresh one
   */
  getTodayPlan(patientId = null, autoGenerate = true) {
    const pid = patientId || store.getCurrentPatientId() || 'user-asha';
    const dateStr = this.formatDateKey(new Date());
    const storageKey = `${this.storageKeyPrefix}${dateStr}`;

    const cached = storageService.getItem(storageKey, null, pid);
    if (cached && cached.items && cached.items.length > 0) {
      // Re-sync item completion states against latest store routines
      this.syncPlanWithStore(cached, pid);
      return cached;
    }

    if (autoGenerate) {
      return this.generateDailyPlan(pid, dateStr);
    }
    return null;
  }

  /**
   * Persists plan to storageService
   */
  savePlan(plan) {
    if (!plan || !plan.patientId || !plan.date) return;
    const storageKey = `${this.storageKeyPrefix}${plan.date}`;
    storageService.setItem(storageKey, plan, plan.patientId);
  }

  /**
   * Synchronizes plan item statuses with real-time store changes
   */
  syncPlanWithStore(plan, patientId) {
    if (!plan || !Array.isArray(plan.items)) return plan;
    const pid = patientId || plan.patientId || store.getCurrentPatientId();
    const routines = store.getRemindersForPatient(pid) || [];
    const results = store.getActivityResults(pid) || [];

    let modified = false;

    plan.items.forEach(item => {
      // If linked to routine
      if (item.sourceId && item.sourceId.startsWith('rtn-')) {
        const r = routines.find(x => x.id === item.sourceId);
        if (r) {
          const isDone = !!(r.completed || r.status === REMINDER_STATUS.COMPLETED);
          const isSnoozed = r.status === REMINDER_STATUS.SNOOZED;
          const newStatus = isDone ? PLAN_ITEM_STATUS.COMPLETED : (isSnoozed ? PLAN_ITEM_STATUS.SNOOZED : PLAN_ITEM_STATUS.PENDING);
          if (item.status !== newStatus) {
            item.status = newStatus;
            item.completedAt = r.completedAt || null;
            modified = true;
          }
        }
      }

      // If linked to cognitive activity
      if (item.type === PLAN_ITEM_TYPES.COGNITIVE_ACTIVITY && item.metadata?.activityId) {
        const actId = item.metadata.activityId;
        const playedToday = results.some(res => {
          const resDate = this.formatDateKey(res.timestamp || res.completedAt);
          return resDate === plan.date && (res.activityId === actId || res.slug === actId);
        });
        if (playedToday && item.status !== PLAN_ITEM_STATUS.COMPLETED) {
          item.status = PLAN_ITEM_STATUS.COMPLETED;
          item.completedAt = results[0]?.timestamp || new Date().toISOString();
          modified = true;
        }
      }

      // Check if mood has been updated and adapt activity/memory item descriptions
      try {
        const checkIn = moodCheckInService.getTodayCheckIn(pid);
        const currentMood = checkIn ? checkIn.mood : null;
        if (currentMood && item.metadata && item.metadata.moodContext !== currentMood) {
          item.metadata.moodContext = currentMood;
          if (item.type === PLAN_ITEM_TYPES.COGNITIVE_ACTIVITY) {
            const gentleMoodNote = currentMood === 'low' ? ' • Gentle, calming session' : (currentMood === 'worried' ? ' • Soothing, relaxed practice' : '');
            const baseDesc = item.description.split(' • Gentle')[0].split(' • Soothing')[0];
            item.description = `${baseDesc}${gentleMoodNote}`;
            modified = true;
          }
          if (item.type === PLAN_ITEM_TYPES.MEMORY_ACTIVITY) {
            const isLow = currentMood === 'low' || currentMood === 'worried';
            item.title = isLow ? 'Gentle Memory Comfort' : 'Remember a Family Moment';
            item.priority = isLow ? PLAN_ITEM_PRIORITIES.SUGGESTED : PLAN_ITEM_PRIORITIES.OPTIONAL;
            modified = true;
          }
        }
      } catch (e) {
        // Safe fallback
      }
    });

    if (modified) {
      plan.updatedAt = new Date().toISOString();
      const totalCount = plan.items.length;
      const completedCount = plan.items.filter(i => i.status === PLAN_ITEM_STATUS.COMPLETED).length;
      plan.summary = {
        total: totalCount,
        completedCount,
        pendingCount: totalCount - completedCount,
        importantCount: plan.items.filter(i => i.priority === PLAN_ITEM_PRIORITIES.IMPORTANT).length,
        percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100
      };
      this.savePlan(plan);
    }
    return plan;
  }

  /**
   * Updates an item's status within the patient's daily plan and synchronizes
   * back to the underlying store service.
   */
  updatePlanItemStatus(patientId, itemId, newStatus, extraData = {}) {
    const pid = patientId || store.getCurrentPatientId();
    const plan = this.getTodayPlan(pid, true);
    if (!plan) return null;

    const item = plan.items.find(i => i.id === itemId || i.sourceId === itemId);
    if (!item) return plan;

    item.status = newStatus;
    if (newStatus === PLAN_ITEM_STATUS.COMPLETED) {
      item.completedAt = extraData.completedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (newStatus === PLAN_ITEM_STATUS.PENDING) {
      item.completedAt = null;
    }

    // Sync with source routine if applicable
    if (item.sourceId && item.sourceId.startsWith('rtn-')) {
      if (newStatus === PLAN_ITEM_STATUS.COMPLETED) {
        store.markReminderDone(item.sourceId, pid);
      } else if (newStatus === PLAN_ITEM_STATUS.SNOOZED) {
        store.snoozeReminder(item.sourceId, extraData.minutes || 15);
      } else if (newStatus === PLAN_ITEM_STATUS.PENDING) {
        store.updateReminder(item.sourceId, { completed: false, status: REMINDER_STATUS.PENDING });
      }
    }

    // Update plan summary
    const totalCount = plan.items.length;
    const completedCount = plan.items.filter(i => i.status === PLAN_ITEM_STATUS.COMPLETED).length;
    plan.summary = {
      total: totalCount,
      completedCount,
      pendingCount: totalCount - completedCount,
      importantCount: plan.items.filter(i => i.priority === PLAN_ITEM_PRIORITIES.IMPORTANT).length,
      percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100
    };
    plan.updatedAt = new Date().toISOString();

    this.savePlan(plan);

    // Enqueue offline sync operation
    try {
      offlineSyncService.enqueue({
        entityType: 'daily_plan',
        entityId: item.id,
        operationType: SYNC_OPERATION_TYPES.UPDATE,
        payload: { itemId: item.id, status: newStatus, completedAt: item.completedAt },
        priority: SYNC_PRIORITIES.HIGH,
        patientId: pid
      });
    } catch {
      // Sync enqueue fallback
    }

    store.notify();
    return plan;
  }

  /**
   * Group plan items into Morning, Afternoon, Evening buckets
   */
  groupPlanByTime(plan) {
    if (!plan || !Array.isArray(plan.items)) {
      return { morning: [], afternoon: [], evening: [] };
    }
    return {
      morning: plan.items.filter(i => i.timeBucket === TIME_BUCKETS.MORNING),
      afternoon: plan.items.filter(i => i.timeBucket === TIME_BUCKETS.AFTERNOON),
      evening: plan.items.filter(i => i.timeBucket === TIME_BUCKETS.EVENING)
    };
  }

  /**
   * Generates a spoken overview script from actual DailyPlan items for Voice / SmritiAI
   */
  generatePlanSpokenText(plan, patientName = 'Friend', lang = 'en') {
    if (!plan || !plan.items || plan.items.length === 0) {
      if (lang === 'hi') return `नमस्ते ${patientName} जी। आज के लिए आपका कोई कार्य नहीं है। आराम करें और अपने शांत दिन का आनंद लें।`;
      if (lang === 'as') return `নমস্কাৰ ${patientName}। আজি আপোনাৰ কোনো কাম তালিকাভুক্ত নাই। শান্ত দিনটো আনন্দৰে কটাওক।`;
      if (lang === 'bn') return `নমস্কার ${patientName}। আজ আপনার কোনো কাজ তালিকাভুক্ত নেই। শান্তভাবে দিনটি উপভোগ করুন।`;
      return `Good day, ${patientName}. Your day is clear. Rest and enjoy your peaceful day.`;
    }

    const pending = plan.items.filter(i => i.status !== PLAN_ITEM_STATUS.COMPLETED);
    const completedCount = plan.items.length - pending.length;

    if (pending.length === 0) {
      if (lang === 'hi') return `बहुत बढ़िया, ${patientName} जी! आपने आज के सभी ${plan.items.length} कार्य पूरे कर लिए हैं।`;
      if (lang === 'as') return `বৰ সুন্দৰ, ${patientName}! আপুনি আজিৰ সকলো ${plan.items.length} টা কাম সম্পন্ন কৰিছে।`;
      if (lang === 'bn') return `দারুণ, ${patientName}! আপনি আজকের সমস্ত ${plan.items.length}টি কাজ সম্পন্ন করেছেন।`;
      return `Wonderful, ${patientName}! You have completed all ${plan.items.length} scheduled items for today.`;
    }

    // Mention important items and first pending items
    const importantItems = pending.filter(i => i.priority === PLAN_ITEM_PRIORITIES.IMPORTANT);
    const previewItems = pending.slice(0, 3);

    if (lang === 'hi') {
      const list = previewItems.map(i => `${i.title} ${i.scheduledTime ? 'समय ' + i.scheduledTime : ''}`).join('। इसके बाद ');
      return `नमस्ते ${patientName} जी। आज आपके लिए ${pending.length} कार्य हैं। ${importantItems.length > 0 ? `जिसमें ${importantItems.length} महत्वपूर्ण कार्य हैं।` : ''} पहला कार्य है: ${list}। आराम से करें।`;
    }

    if (lang === 'as') {
      const list = previewItems.map(i => `${i.title} ${i.scheduledTime ? 'সময় ' + i.scheduledTime : ''}`).join('। তাৰ পিছত ');
      return `নমস্কাৰ ${patientName}। আজি আপোনাৰ বাবে ${pending.length} টা কাম বাকী আছে। ${importantItems.length > 0 ? `যাৰ ভিতৰত ${importantItems.length} টা জৰুৰী কাম আছে।` : ''} প্ৰথমতে: ${list}। লাহে লাহে কৰক।`;
    }

    if (lang === 'bn') {
      const list = previewItems.map(i => `${i.title} ${i.scheduledTime ? 'সময় ' + i.scheduledTime : ''}`).join('। এরপর ');
      return `নমস্কার ${patientName}। আজ আপনার জন্য ${pending.length}টি কাজ বাকি আছে। ${importantItems.length > 0 ? `যার মধ্যে ${importantItems.length}টি গুরুত্বপূর্ণ কাজ রয়েছে।` : ''} প্রথমে: ${list}। ধীরে ধীরে করুন।`;
    }

    // English
    const itemDescriptions = previewItems.map(i => `${i.title}${i.scheduledTime ? ' at ' + i.scheduledTime : ''}`).join(', followed by ');
    return `Good morning, ${patientName}. Today you have ${pending.length} items scheduled, including ${importantItems.length} important tasks. First, ${itemDescriptions}. Please take all the time you need.`;
  }
}

export const dailyPlanService = new DailyPlanService();
store.setDailyPlanService(dailyPlanService);
