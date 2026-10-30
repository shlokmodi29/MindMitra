// MindMitra Daily Care & Reminder Service
// Strictly non-diagnostic reminder & daily support engine.
// IMPORTANT: MindMitra does NOT prescribe medicine, change dosages, or provide medical advice.

import { speechService } from './speechService.js';

export const REMINDER_TYPES = {
  MEDICINE: 'medicine',
  HYDRATION: 'hydration',
  APPOINTMENT: 'appointment',
  ACTIVITY: 'activity',
  ROUTINE: 'routine',
  CUSTOM: 'custom'
};

export const RECURRENCE_RULES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  WEEKDAYS: 'weekdays',
  ONCE: 'once'
};

export const REMINDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  SNOOZED: 'snoozed',
  SKIPPED: 'skipped',
  MISSED: 'missed',
  DISABLED: 'disabled'
};

class ReminderService {
  /**
   * Validate and instantiate a canonical Reminder object
   */
  createReminder(data) {
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      throw new Error('Reminder title is required');
    }
    if (!data.time || typeof data.time !== 'string' || !data.time.trim()) {
      throw new Error('Reminder scheduled time is required');
    }

    const type = Object.values(REMINDER_TYPES).includes(data.type || data.category)
      ? (data.type || data.category)
      : REMINDER_TYPES.ROUTINE;

    const recurrence = Object.values(RECURRENCE_RULES).includes(data.recurrence)
      ? data.recurrence
      : RECURRENCE_RULES.DAILY;

    const nowIso = new Date().toISOString();

    return {
      id: data.id || `rem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      patientId: data.patientId || 'usr-asha',
      title: data.title.trim(),
      type,
      time: data.time.trim(),
      recurrence,
      daysOfWeek: Array.isArray(data.daysOfWeek) ? data.daysOfWeek : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      enabled: data.enabled !== false,
      status: data.completed ? REMINDER_STATUS.COMPLETED : (data.status || REMINDER_STATUS.PENDING),
      completed: !!data.completed,
      completedAt: data.completedAt || null,
      snoozedUntil: data.snoozedUntil || null,
      notes: (data.notes || data.description || '').trim(),
      dosageNotes: (data.dosageNotes || '').trim(), // Caregiver-entered notes only. No medical prescriptions.
      icon: data.icon || this.getDefaultIconForType(type),
      createdBy: data.createdBy || 'Primary Caregiver',
      createdAt: data.createdAt || nowIso,
      updatedAt: nowIso
    };
  }

  /**
   * Icon helper based on Stitch design tokens
   */
  getDefaultIconForType(type) {
    switch (type) {
      case REMINDER_TYPES.MEDICINE:
        return 'medication';
      case REMINDER_TYPES.HYDRATION:
        return 'water_drop';
      case REMINDER_TYPES.APPOINTMENT:
        return 'video_call';
      case REMINDER_TYPES.ACTIVITY:
        return 'history_edu';
      case REMINDER_TYPES.ROUTINE:
      case REMINDER_TYPES.CUSTOM:
      default:
        return 'schedule';
    }
  }

  /**
   * Parse 12-hour or 24-hour time strings into hour and minute integers
   * e.g. "09:00 AM", "2:30 PM", "14:15"
   */
  parseTimeString(timeStr) {
    if (!timeStr) return { hour: 9, minute: 0 };
    const cleaned = timeStr.trim().toUpperCase();
    const isPM = cleaned.includes('PM');
    const isAM = cleaned.includes('AM');
    const numericPart = cleaned.replace(/[^0-9:]/g, '');
    const parts = numericPart.split(':');
    let hour = parseInt(parts[0], 10) || 0;
    const minute = parseInt(parts[1], 10) || 0;

    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;

    return { hour, minute };
  }

  /**
   * Calculate the next scheduled occurrence Date for a reminder
   */
  calculateNextOccurrence(reminder, fromDate = new Date()) {
    const { hour, minute } = this.parseTimeString(reminder.time);
    const target = new Date(fromDate);
    target.setHours(hour, minute, 0, 0);

    // If target has passed today, advance according to recurrence
    if (target <= fromDate) {
      if (reminder.recurrence === RECURRENCE_RULES.DAILY) {
        target.setDate(target.getDate() + 1);
      } else if (reminder.recurrence === RECURRENCE_RULES.WEEKDAYS) {
        target.setDate(target.getDate() + 1);
        while (target.getDay() === 0 || target.getDay() === 6) {
          target.setDate(target.getDate() + 1);
        }
      } else if (reminder.recurrence === RECURRENCE_RULES.WEEKLY) {
        target.setDate(target.getDate() + 7);
      }
    }
    return target;
  }

  /**
   * Evaluates patient reminders urgency & status
   */
  getReminderUrgency(reminder, now = new Date()) {
    if (reminder.status === REMINDER_STATUS.COMPLETED || reminder.completed) {
      return 'completed';
    }
    if (reminder.status === REMINDER_STATUS.SNOOZED) {
      if (reminder.snoozedUntil && new Date(reminder.snoozedUntil) > now) {
        return 'snoozed';
      }
    }
    if (!reminder.enabled) {
      return 'disabled';
    }

    const { hour, minute } = this.parseTimeString(reminder.time);
    const scheduled = new Date(now);
    scheduled.setHours(hour, minute, 0, 0);

    const diffMinutes = (scheduled.getTime() - now.getTime()) / (1000 * 60);

    if (diffMinutes <= 0 && diffMinutes >= -120) {
      return 'due_now';
    }
    if (diffMinutes > 0 && diffMinutes <= 60) {
      return 'due_soon';
    }
    return 'upcoming';
  }

  /**
   * Calming, elder-friendly spoken text for "Hear Reminder"
   */
  formatSpokenReminder(reminder, patientName = 'Asha') {
    const firstName = patientName.split(' ')[0] || 'Friend';
    const type = reminder.type;
    const time = reminder.time;

    let text = `Hello ${firstName}. It is ${time}. `;
    if (type === REMINDER_TYPES.MEDICINE) {
      text += `This is your gentle reminder for ${reminder.title}. `;
      if (reminder.notes) {
        text += `${reminder.notes}. `;
      }
      text += `Please have a warm glass of water ready. Take your time.`;
    } else if (type === REMINDER_TYPES.HYDRATION) {
      text += `Time for some fresh water. ${reminder.title}. Staying gently hydrated helps you feel bright and refreshed today.`;
    } else if (type === REMINDER_TYPES.APPOINTMENT) {
      text += `You have an upcoming event: ${reminder.title}. ${reminder.notes || 'All is peaceful and arranged for you.'}`;
    } else if (type === REMINDER_TYPES.ACTIVITY) {
      text += `Your personal memory moment is ready: ${reminder.title}. Relax and enjoy connecting with cherished memories.`;
    } else {
      text += `Time for your daily milestone: ${reminder.title}. Everything moves at your own peaceful pace.`;
    }

    return text;
  }

  /**
   * Audio readout of reminder via SpeechService
   */
  hearReminder(reminder, patientName = 'Asha', onEnd = null) {
    const text = this.formatSpokenReminder(reminder, patientName);
    speechService.speak(text, { onEnd });
    return text;
  }

  /**
   * Browser Notification API handling
   */
  async requestNotificationPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return 'denied';
    }
  }

  getNotificationPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  dispatchBrowserNotification(reminder) {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission !== 'granted') return false;

    try {
      new Notification(`MindMitra Care: ${reminder.title}`, {
        body: `${reminder.time} • ${reminder.notes || 'Gentle daily care reminder'}`,
        icon: '/favicon.ico',
        tag: reminder.id
      });
      return true;
    } catch (e) {
      console.warn('Notification dispatch error:', e);
      return false;
    }
  }
}

export const reminderService = new ReminderService();
