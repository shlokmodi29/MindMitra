// MindMitra Mood Check-in Service
// Simple, elder-friendly daily emotional check-in for patients and caregivers.
// Strictly non-diagnostic, non-clinical, subjective reflection only.
// Zero clinical scoring, zero depression/anxiety scales, zero progression claims.

import { store } from '../state/store.js';
import { offlineSyncService } from './offlineSyncService.js';

const STORAGE_KEY = 'mindmitra_mood_checkins_v1';

export const MOOD_VALUES = {
  GOOD: 'good',
  OKAY: 'okay',
  UNSURE: 'unsure',
  LOW: 'low',
  WORRIED: 'worried'
};

export const MOOD_CHOICES = Object.values(MOOD_VALUES);

export const MOOD_CONFIG = {
  good: {
    key: 'good',
    emoji: '😊',
    label: 'Good',
    description: 'Feeling peaceful, bright, or content',
    icon: 'sentiment_very_satisfied'
  },
  okay: {
    key: 'okay',
    emoji: '🙂',
    label: 'Okay',
    description: 'Rhythm is steady and comfortable',
    icon: 'sentiment_satisfied'
  },
  unsure: {
    key: 'unsure',
    emoji: '😐',
    label: 'Not sure',
    description: 'Taking things slow today',
    icon: 'sentiment_neutral'
  },
  low: {
    key: 'low',
    emoji: '😔',
    label: 'Low',
    description: 'In need of gentle presence and quiet comfort',
    icon: 'sentiment_dissatisfied'
  },
  worried: {
    key: 'worried',
    emoji: '😟',
    label: 'Worried',
    description: 'Feeling a little unsettled or uneasy',
    icon: 'sentiment_very_dissatisfied'
  }
};

class MoodCheckInService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
      }
    } catch (e) {
      console.warn('[MoodCheckInService] initStorage warning:', e);
    }
  }

  getAllCheckIns() {
    try {
      if (typeof localStorage === 'undefined') return this._inMemoryStorage || {};
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : (this._inMemoryStorage || {});
    } catch {
      return this._inMemoryStorage || {};
    }
  }

  saveAllCheckIns(data) {
    this._inMemoryStorage = data;
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[MoodCheckInService] saveAllCheckIns warning:', e);
    }
  }

  normalizePatientId(patientId) {
    if (!patientId) {
      return store.getCurrentPatientId ? store.getCurrentPatientId() : 'user-asha';
    }
    if (patientId === 'usr-asha' || patientId === 'user-asha') return 'user-asha';
    return patientId;
  }

  getTodayDateString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Retrieves today's mood check-in for a patient
   */
  getTodayCheckIn(patientId) {
    const pid = this.normalizePatientId(patientId);
    const todayStr = this.getTodayDateString();
    const all = this.getAllCheckIns();
    const patientList = all[pid] || [];
    return patientList.find(c => c.date === todayStr) || null;
  }

  hasCheckedInToday(patientId) {
    return !!this.getTodayCheckIn(patientId);
  }

  /**
   * Records or updates a mood check-in for today (one check-in per day per patient)
   */
  recordCheckIn({ patientId, mood, note = null, source = 'patient' }) {
    if (!mood || !Object.values(MOOD_VALUES).includes(mood)) {
      throw new Error(`Invalid mood value: ${mood}`);
    }

    const pid = this.normalizePatientId(patientId);
    const todayStr = this.getTodayDateString();
    const all = this.getAllCheckIns();
    if (!all[pid]) all[pid] = [];

    const existingIndex = all[pid].findIndex(c => c.date === todayStr);
    const nowIso = new Date().toISOString();

    let checkIn;
    if (existingIndex >= 0) {
      // Update existing today's check-in
      checkIn = {
        ...all[pid][existingIndex],
        mood,
        note: note !== null ? note : all[pid][existingIndex].note,
        source: source || all[pid][existingIndex].source,
        updatedAt: nowIso
      };
      all[pid][existingIndex] = checkIn;
    } else {
      // Create new check-in for today
      checkIn = {
        id: `mood-${todayStr}-${pid}-${Math.random().toString(36).substr(2, 4)}`,
        patientId: pid,
        date: todayStr,
        mood,
        note: note || '',
        source: source || 'patient',
        createdAt: nowIso,
        updatedAt: nowIso
      };
      all[pid].unshift(checkIn);
    }

    this.saveAllCheckIns(all);

    // Enqueue sync operation for offline resilience
    try {
      offlineSyncService.enqueue({
        entityType: 'mood_checkin',
        entityId: checkIn.id,
        operationType: existingIndex >= 0 ? 'UPDATE' : 'CREATE',
        payload: checkIn,
        patientId: pid,
        priority: 'NORMAL'
      });
    } catch (e) {
      console.warn('[MoodCheckInService] sync enqueue warning:', e);
    }

    // Notify state listeners
    if (store && typeof store.notify === 'function') {
      store.notify();
    }

    return checkIn;
  }

  /**
   * Updates the optional personal note for today's check-in
   */
  updateNote(patientId, noteText) {
    const pid = this.normalizePatientId(patientId);
    const checkIn = this.getTodayCheckIn(pid);
    if (!checkIn) {
      // If user hasn't selected a mood yet, start with default okay
      return this.recordCheckIn({ patientId: pid, mood: MOOD_VALUES.OKAY, note: noteText });
    }
    return this.recordCheckIn({
      patientId: pid,
      mood: checkIn.mood,
      note: noteText,
      source: checkIn.source
    });
  }

  /**
   * Retrieves chronological check-in history for an authenticated patient
   */
  getCheckInHistory(patientId, limit = 14) {
    const pid = this.normalizePatientId(patientId);
    const all = this.getAllCheckIns();
    const list = all[pid] || [];
    // Sort descending by date
    const sorted = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted.slice(0, limit);
  }

  /**
   * Maps natural spoken voice transcripts to one of the 5 visual choices
   */
  mapVoiceTranscriptToMood(transcript) {
    if (!transcript) return null;
    const t = transcript.toLowerCase().trim();

    // Good: good, great, happy, fine, peaceful, well, अच्छा, accha, achha, badhiya, ভালো, bhalo, ভাল, bhal
    if (
      t.includes('good') ||
      t.includes('great') ||
      t.includes('happy') ||
      t.includes('fine') ||
      t.includes('peaceful') ||
      t.includes('well') ||
      t.includes('अच्छा') ||
      t.includes('accha') ||
      t.includes('achha') ||
      t.includes('badhiya') ||
      t.includes('খুব ভালো') ||
      t.includes('ভালো') ||
      t.includes('bhalo') ||
      t.includes('ভাল') ||
      t.includes('bhal')
    ) {
      return MOOD_VALUES.GOOD;
    }

    // Worried: worried, anxious, nervous, uneasy, scary, डर, चिंता, চিন্তিত
    if (
      t.includes('worried') ||
      t.includes('anxious') ||
      t.includes('nervous') ||
      t.includes('uneasy') ||
      t.includes('scared') ||
      t.includes('डर') ||
      t.includes('चिंता') ||
      t.includes('চিন্তিত')
    ) {
      return MOOD_VALUES.WORRIED;
    }

    // Low: low, sad, down, tired, heavy, lonely, उदास, মন খারাপ, দুখ
    if (
      t.includes('low') ||
      t.includes('sad') ||
      t.includes('down') ||
      t.includes('tired') ||
      t.includes('heavy') ||
      t.includes('lonely') ||
      t.includes('उदास') ||
      t.includes('मन खराब') ||
      t.includes('দুখ')
    ) {
      return MOOD_VALUES.LOW;
    }

    // Unsure: unsure, not sure, maybe, confused, पता नहीं, নিশ্চিত নই
    if (
      t.includes('unsure') ||
      t.includes('not sure') ||
      t.includes('maybe') ||
      t.includes('confused') ||
      t.includes('पता नहीं') ||
      t.includes('নিশ্চিত নই')
    ) {
      return MOOD_VALUES.UNSURE;
    }

    // Okay: okay, ok, normal, average, so so, ठीक, চলনসই
    if (
      t.includes('okay') ||
      t.includes('ok') ||
      t.includes('normal') ||
      t.includes('average') ||
      t.includes('so so') ||
      t.includes('ठीक') ||
      t.includes('চলনসই')
    ) {
      return MOOD_VALUES.OKAY;
    }

    return null;
  }

  /**
   * Elder-friendly multilingual spoken text generator for TTS
   */
  generateSpokenPrompt(lang = 'en') {
    if (lang === 'hi') return 'आज आप कैसा महसूस कर रहे हैं?';
    if (lang === 'as') return 'আজি আপোনাৰ কেনে লাগিছে?';
    if (lang === 'bn') return 'আজ আপনার কেমন লাগছে?';
    return 'How are you feeling today?';
  }

  generateSpokenThankYou(mood, lang = 'en') {
    const config = MOOD_CONFIG[mood] || MOOD_CONFIG.okay;
    if (lang === 'hi') return `साझा करने के लिए धन्यवाद। आपने ${config.label} चुना है।`;
    if (lang === 'as') return `জনোৱাৰ বাবে ধন্যবাদ। আপুনি ${config.label} বাছি লৈছে।`;
    if (lang === 'bn') return `বলার জন্য ধন্যবাদ। আপনি ${config.label} নির্বাচন করেছেন।`;
    return `Thank you for sharing. Recorded: ${config.label}.`;
  }

  getSpokenText(checkIn, lang = 'en') {
    if (!checkIn) return this.generateSpokenPrompt(lang);
    const config = MOOD_CONFIG[checkIn.mood] || MOOD_CONFIG.okay;
    const moodKey = config.key;
    const notePart = checkIn.note ? ` Note: ${checkIn.note}` : '';

    const labels = {
      hi: { good: 'अच्छा', okay: 'ठीक', unsure: 'पता नहीं', low: 'उदास', worried: 'चिंतित' },
      as: { good: 'ভাল', okay: 'ঠিক আছে', unsure: 'নিশ্চিত নহয়', low: 'মন বেয়া', worried: 'চিন্তিত' },
      bn: { good: 'ভালো', okay: 'ঠিক আছে', unsure: 'নিশ্চিত নই', low: 'মন খারাপ', worried: 'চিন্তিত' },
      en: { good: 'Good', okay: 'Okay', unsure: 'Not sure', low: 'Low', worried: 'Worried' }
    };

    const currentLabels = labels[lang] || labels.en;
    const localizedLabel = currentLabels[moodKey] || config.label;

    if (lang === 'hi') return `आज का हाल-चाल: ${localizedLabel}। ${checkIn.note ? 'टिप्पणी: ' + checkIn.note : ''}`;
    if (lang === 'as') return `আজিৰ খবৰ: ${localizedLabel}। ${checkIn.note ? 'টোকা: ' + checkIn.note : ''}`;
    if (lang === 'bn') return `আজকের অনুভূতি: ${localizedLabel}। ${checkIn.note ? 'নোট: ' + checkIn.note : ''}`;
    return `Today's check-in: ${localizedLabel}.${notePart}`;
  }
}

export const moodCheckInService = new MoodCheckInService();
