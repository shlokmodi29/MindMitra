// MindMitra Adaptive Cognitive Engine
// Personalized Activity Difficulty & Progression Service
// Strictly Non-Diagnostic & Respectful of Personal Reminiscence

import { ADAPTIVE_CONFIG } from './adaptiveConfig.js';
import { store } from '../state/store.js';
import { activityRegistry } from './activityRegistry.js';

class AdaptiveEngine {
  constructor() {
    this.config = ADAPTIVE_CONFIG;
  }

  /**
   * Helper to normalize patient IDs (user-asha vs usr-asha)
   */
  normalizePatientId(patientId) {
    if (!patientId || patientId === 'usr-asha' || patientId === 'user-asha') {
      return 'user-asha';
    }
    return patientId;
  }

  /**
   * Helper to map numeric level (1, 2, 3) to label ('Easy', 'Medium', 'Hard')
   */
  getDifficultyLabel(level) {
    const num = Number(level) || 1;
    return this.config.DIFFICULTY_LABELS[num] || 'Easy';
  }

  /**
   * Helper to map label ('Easy', 'Medium', 'Hard') to numeric level (1, 2, 3)
   */
  getDifficultyLevel(label) {
    if (typeof label === 'number') return Math.max(1, Math.min(3, label));
    const str = String(label || 'easy').toLowerCase().trim();
    return this.config.DIFFICULTY_VALUES[str] || 1;
  }

  /**
   * Retrieves or initializes an isolated AdaptiveProfile for a patient.
   * Multi-patient isolation is strictly enforced.
   */
  getAdaptiveProfile(patientId) {
    const pid = this.normalizePatientId(patientId || store.getCurrentPatientId());
    const state = store.getState();
    const profiles = state.adaptiveProfiles || [];

    let profile = profiles.find(p => p.patientId === pid);
    if (!profile) {
      profile = {
        patientId: pid,
        activityProfiles: {},
        categoryProfiles: {},
        recentPerformance: [],
        preferredDifficulty: 'Easy',
        lastUpdated: new Date().toISOString()
      };

      // Populate default categories
      this.config.CATEGORIES.forEach(cat => {
        profile.categoryProfiles[cat] = {
          category: cat,
          sessionsCompleted: 0,
          averageAccuracy: 0,
          averageHints: 0,
          preferredDifficulty: 'Easy'
        };
      });
    }

    return profile;
  }

  /**
   * Saves an updated adaptive profile to store state and persistent storage.
   */
  saveAdaptiveProfile(profile) {
    if (!profile || !profile.patientId) return;
    const pid = this.normalizePatientId(profile.patientId);
    profile.patientId = pid;
    profile.lastUpdated = new Date().toISOString();

    const state = store.getState();
    if (!state.adaptiveProfiles) {
      state.adaptiveProfiles = [];
    }

    const idx = state.adaptiveProfiles.findIndex(p => p.patientId === pid);
    if (idx >= 0) {
      state.adaptiveProfiles[idx] = profile;
    } else {
      state.adaptiveProfiles.push(profile);
    }

    store.notify();
  }

  /**
   * Records an explainable adaptive event for telemetry and caregiver reporting.
   */
  recordAdaptiveEvent(patientId, eventType, payload = {}) {
    const pid = this.normalizePatientId(patientId || store.getCurrentPatientId());
    const state = store.getState();
    if (!state.adaptiveEvents) {
      state.adaptiveEvents = [];
    }

    const event = {
      id: 'adapt-evt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      patientId: pid,
      eventType, // e.g. 'difficulty_increased', 'difficulty_decreased', 'difficulty_maintained', 'difficulty_recommended'
      activityId: payload.activityId || null,
      previousDifficulty: payload.previousDifficulty || null,
      newDifficulty: payload.newDifficulty || null,
      reason: payload.reason || 'Gentle pacing evaluation',
      timestamp: new Date().toISOString(),
      payload
    };

    state.adaptiveEvents.unshift(event);
    store.notify();
    return event;
  }

  /**
   * Updates a patient's adaptive profile following an activity session.
   * Only completed sessions trigger cognitive difficulty adaptation.
   * Incomplete or abandoned sessions are tracked without difficulty penalty.
   */
  updateProfileWithSession(sessionSummary) {
    if (!sessionSummary) return null;

    const pid = this.normalizePatientId(sessionSummary.patientId || store.getCurrentPatientId());
    const actId = sessionSummary.activityId;
    const isCompleted = sessionSummary.status === 'completed' || (!sessionSummary.status && sessionSummary.accuracy !== undefined);

    // Safeguard: Incomplete/abandoned sessions do not penalize cognitive difficulty
    if (!isCompleted) {
      this.recordAdaptiveEvent(pid, 'session_interrupted', {
        activityId: actId,
        reason: 'Session paused or exited gently before completion; difficulty preserved.'
      });
      return null;
    }

    const profile = this.getAdaptiveProfile(pid);
    const actDef = activityRegistry.getById(actId);
    const category = sessionSummary.category || (actDef && actDef.category) || 'REMEMBER';

    // 1. Initialize or get Activity Profile
    if (!profile.activityProfiles[actId]) {
      const initialDiff = sessionSummary.difficultyLevel 
        ? this.getDifficultyLevel(sessionSummary.difficultyLevel) 
        : (actDef?.difficulty || 1);

      profile.activityProfiles[actId] = {
        activityId: actId,
        currentDifficulty: initialDiff,
        recentSessions: [],
        recentAccuracy: sessionSummary.accuracy,
        recentCompletionRate: 100,
        recentAverageTime: sessionSummary.completionTimeSec || sessionSummary.duration || 0,
        recentHints: sessionSummary.hintsUsed || 0,
        recentMistakes: sessionSummary.repeatedErrors || sessionSummary.mistakes || 0,
        consecutiveSuccesses: 0,
        consecutiveDifficultSessions: 0,
        confidence: 'low',
        lastPlayedAt: sessionSummary.completedAt || new Date().toISOString()
      };
    }

    const actProfile = profile.activityProfiles[actId];

    // 2. Record Session Snapshot
    const sessionSnapshot = {
      sessionId: sessionSummary.id,
      completedAt: sessionSummary.completedAt || new Date().toISOString(),
      accuracy: sessionSummary.accuracy,
      hintsUsed: sessionSummary.hintsUsed || 0,
      mistakes: sessionSummary.repeatedErrors || sessionSummary.mistakes || 0,
      duration: sessionSummary.completionTimeSec || sessionSummary.duration || 0,
      difficultyLevel: sessionSummary.difficultyLevel || actProfile.currentDifficulty
    };

    actProfile.recentSessions.unshift(sessionSnapshot);
    if (actProfile.recentSessions.length > 10) {
      actProfile.recentSessions.pop();
    }
    actProfile.lastPlayedAt = sessionSnapshot.completedAt;

    // 3. Compute Rolling Averages
    const sessions = actProfile.recentSessions;
    const totalAcc = sessions.reduce((sum, s) => sum + s.accuracy, 0);
    const totalHints = sessions.reduce((sum, s) => sum + s.hintsUsed, 0);
    const totalMistakes = sessions.reduce((sum, s) => sum + s.mistakes, 0);
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);

    actProfile.recentAccuracy = Math.round(totalAcc / sessions.length);
    actProfile.recentHints = Number((totalHints / sessions.length).toFixed(1));
    actProfile.recentMistakes = Number((totalMistakes / sessions.length).toFixed(1));
    actProfile.recentAverageTime = Math.round(totalTime / sessions.length);

    // 4. Update Streaks (Performance Signals)
    const isSuccess = sessionSummary.accuracy >= this.config.HIGH_PERFORMANCE_ACCURACY &&
                      (sessionSummary.hintsUsed || 0) <= this.config.MAX_HINTS_TOLERANCE_FOR_UPGRADE &&
                      (sessionSummary.repeatedErrors || sessionSummary.mistakes || 0) <= this.config.MAX_MISTAKES_FOR_UPGRADE;

    const isDifficult = sessionSummary.accuracy < this.config.LOW_PERFORMANCE_ACCURACY ||
                        (sessionSummary.hintsUsed || 0) >= this.config.HINTS_THRESHOLD_FOR_DOWNGRADE ||
                        (sessionSummary.repeatedErrors || sessionSummary.mistakes || 0) >= this.config.MISTAKES_THRESHOLD_FOR_DOWNGRADE;

    if (isSuccess) {
      actProfile.consecutiveSuccesses += 1;
      actProfile.consecutiveDifficultSessions = 0;
    } else if (isDifficult) {
      actProfile.consecutiveDifficultSessions += 1;
      actProfile.consecutiveSuccesses = 0;
    } else {
      // Mixed performance maintains streak or resets sharp transitions
      actProfile.consecutiveSuccesses = Math.max(0, actProfile.consecutiveSuccesses - 1);
      actProfile.consecutiveDifficultSessions = Math.max(0, actProfile.consecutiveDifficultSessions - 1);
    }

    // 5. Rule-Based Difficulty Progression
    // Requirement: Must have at least MIN_SESSIONS_FOR_ADAPTATION before changing difficulty
    const prevDiff = actProfile.currentDifficulty;
    let newDiff = prevDiff;
    let changeReason = 'Difficulty maintained; pacing remains harmonious.';
    let eventType = 'difficulty_maintained';

    if (sessions.length >= this.config.MIN_SESSIONS_FOR_ADAPTATION) {
      actProfile.confidence = sessions.length >= 5 ? 'high' : 'medium';

      if (actProfile.consecutiveSuccesses >= this.config.MIN_SESSIONS_FOR_ADAPTATION) {
        if (prevDiff < this.config.MAX_DIFFICULTY) {
          newDiff = prevDiff + this.config.DIFFICULTY_STEP_SIZE;
          changeReason = `High performance over ${actProfile.consecutiveSuccesses} consecutive sessions (${actProfile.recentAccuracy}% avg accuracy). Advanced to ${this.getDifficultyLabel(newDiff)}.`;
          eventType = 'difficulty_increased';
          actProfile.consecutiveSuccesses = 0; // reset streak after upgrade
        } else {
          changeReason = `Consistently strong engagement maintained at highest comfortable level (${this.getDifficultyLabel(prevDiff)}).`;
        }
      } else if (actProfile.consecutiveDifficultSessions >= this.config.MIN_SESSIONS_FOR_ADAPTATION) {
        if (prevDiff > this.config.MIN_DIFFICULTY) {
          newDiff = prevDiff - this.config.DIFFICULTY_STEP_SIZE;
          changeReason = `Gentler pacing recommended after ${actProfile.consecutiveDifficultSessions} challenging sessions. Adjusted to ${this.getDifficultyLabel(newDiff)}.`;
          eventType = 'difficulty_decreased';
          actProfile.consecutiveDifficultSessions = 0; // reset streak after downgrade
        } else {
          changeReason = `Gentle companion assistance maintained at base level (${this.getDifficultyLabel(prevDiff)}).`;
        }
      }
    } else {
      actProfile.confidence = 'low';
      changeReason = `Initial observation phase (${sessions.length}/${this.config.MIN_SESSIONS_FOR_ADAPTATION} sessions completed). Baseline maintained.`;
    }

    actProfile.currentDifficulty = newDiff;
    actProfile.lastProgressionReason = changeReason;

    // Record explainable event
    this.recordAdaptiveEvent(pid, eventType, {
      activityId: actId,
      activityName: actDef?.name || sessionSummary.activityName,
      previousDifficulty: this.getDifficultyLabel(prevDiff),
      newDifficulty: this.getDifficultyLabel(newDiff),
      accuracy: sessionSummary.accuracy,
      hintsUsed: sessionSummary.hintsUsed || 0,
      mistakes: sessionSummary.repeatedErrors || sessionSummary.mistakes || 0,
      reason: changeReason
    });

    // 6. Update Category Profile
    if (!profile.categoryProfiles[category]) {
      profile.categoryProfiles[category] = {
        category,
        sessionsCompleted: 0,
        averageAccuracy: 0,
        averageHints: 0,
        preferredDifficulty: 'Easy'
      };
    }
    const catProfile = profile.categoryProfiles[category];
    catProfile.sessionsCompleted += 1;
    const catCount = catProfile.sessionsCompleted;
    catProfile.averageAccuracy = Math.round(((catProfile.averageAccuracy * (catCount - 1)) + sessionSummary.accuracy) / catCount);
    catProfile.averageHints = Number((((catProfile.averageHints * (catCount - 1)) + (sessionSummary.hintsUsed || 0)) / catCount).toFixed(1));
    catProfile.preferredDifficulty = this.getDifficultyLabel(newDiff);

    // 7. Record Recent Performance Log (Clean, Non-Diagnostic)
    profile.recentPerformance.unshift({
      activityId: actId,
      activityName: actDef?.name || sessionSummary.activityName,
      category,
      difficulty: this.getDifficultyLabel(newDiff),
      accuracy: sessionSummary.accuracy,
      engagement: sessionSummary.engagement || 'Serene',
      completedAt: sessionSnapshot.completedAt
    });
    if (profile.recentPerformance.length > 20) {
      profile.recentPerformance.pop();
    }

    // Save profile
    this.saveAdaptiveProfile(profile);
    return actProfile;
  }

  /**
   * Internal Explainability Query:
   * Returns current difficulty, recommended next difficulty, explainable reason, and confidence.
   */
  getDifficultyRecommendation(patientId, activityId) {
    const pid = this.normalizePatientId(patientId || store.getCurrentPatientId());
    const actDef = activityRegistry.getById(activityId);
    const profile = this.getAdaptiveProfile(pid);
    const actProfile = profile.activityProfiles[activityId];

    if (!actProfile || !actProfile.recentSessions || actProfile.recentSessions.length === 0) {
      const defaultLevel = 1;
      return {
        activityId,
        currentDifficulty: this.getDifficultyLabel(defaultLevel),
        currentDifficultyLevel: defaultLevel,
        recommendedDifficulty: this.getDifficultyLabel(defaultLevel),
        recommendedDifficultyLevel: defaultLevel,
        reason: 'Initial baseline difficulty (no prior completed sessions)',
        confidence: 'low',
        sessionsCount: 0
      };
    }

    const currentLevel = actProfile.currentDifficulty || 1;
    const sessions = actProfile.recentSessions;

    if (sessions.length < this.config.MIN_SESSIONS_FOR_ADAPTATION) {
      return {
        activityId,
        currentDifficulty: this.getDifficultyLabel(currentLevel),
        currentDifficultyLevel: currentLevel,
        recommendedDifficulty: this.getDifficultyLabel(currentLevel),
        recommendedDifficultyLevel: currentLevel,
        reason: `Baseline observation in progress (${sessions.length}/${this.config.MIN_SESSIONS_FOR_ADAPTATION} completed sessions)`,
        confidence: 'low',
        sessionsCount: sessions.length
      };
    }

    let recommendedLevel = currentLevel;
    let reason = actProfile.lastProgressionReason || 'Balanced and comfortable challenge level.';

    if (actProfile.consecutiveSuccesses >= this.config.MIN_SESSIONS_FOR_ADAPTATION && currentLevel < this.config.MAX_DIFFICULTY) {
      recommendedLevel = currentLevel + 1;
      reason = `Consistent high performance across recent sessions (${actProfile.recentAccuracy}% avg accuracy). Ready for ${this.getDifficultyLabel(recommendedLevel)}.`;
    } else if (actProfile.consecutiveDifficultSessions >= this.config.MIN_SESSIONS_FOR_ADAPTATION && currentLevel > this.config.MIN_DIFFICULTY) {
      recommendedLevel = currentLevel - 1;
      reason = `Gentler pacing recommended for unhurried comfort (${this.getDifficultyLabel(recommendedLevel)}).`;
    }

    return {
      activityId,
      currentDifficulty: this.getDifficultyLabel(currentLevel),
      currentDifficultyLevel: currentLevel,
      recommendedDifficulty: this.getDifficultyLabel(recommendedLevel),
      recommendedDifficultyLevel: recommendedLevel,
      reason,
      confidence: actProfile.confidence || 'medium',
      sessionsCount: sessions.length
    };
  }

  /**
   * Activity Recommendation Engine:
   * Recommends a tailored cognitive activity based on recent category variety,
   * comfortable challenge, and current difficulty level.
   */
  getRecommendedActivity(patientId) {
    const pid = this.normalizePatientId(patientId || store.getCurrentPatientId());
    const profile = this.getAdaptiveProfile(pid);
    const allActivities = activityRegistry.getAll();
    const recentLogs = profile.recentPerformance || [];

    // Check recently played categories to ensure category variety
    const recentlyPlayedCategories = new Set(recentLogs.slice(0, 3).map(l => l.category));
    
    // Prioritize an unhurried, comfortable activity from an unplayed category
    let candidate = allActivities.find(a => !recentlyPlayedCategories.has(a.category)) || allActivities[0];

    // If candidate found, fetch its personalized difficulty
    const diffRec = this.getDifficultyRecommendation(pid, candidate.id);

    let gentleReason = 'A peaceful, engaging activity to refresh your memory today.';
    if (diffRec.recommendedDifficultyLevel === 2) {
      gentleReason = 'A comfortable challenge tailored to your steady practice.';
    } else if (diffRec.recommendedDifficultyLevel === 3) {
      gentleReason = 'A rich, detailed exercise for joyful focus.';
    }

    return {
      activity: candidate,
      activityId: candidate.id,
      name: candidate.name,
      category: candidate.category,
      recommendedDifficulty: diffRec.recommendedDifficulty,
      recommendedDifficultyLevel: diffRec.recommendedDifficultyLevel,
      duration: candidate.duration || '4 mins',
      gentleReason,
      icon: candidate.icon || 'star'
    };
  }

  /**
   * Retrieves category-level performance summary for caregiver foundations.
   * Strictly non-diagnostic; presents practice counts and comfort levels.
   */
  getCategoryPerformance(patientId) {
    const pid = this.normalizePatientId(patientId || store.getCurrentPatientId());
    const profile = this.getAdaptiveProfile(pid);
    return profile.categoryProfiles || {};
  }

  /**
   * Returns recent telemetry / adaptive events for a patient.
   */
  getAdaptiveEvents(patientId, limit = 10) {
    const pid = this.normalizePatientId(patientId || store.getCurrentPatientId());
    const state = store.getState();
    const events = (state.adaptiveEvents || []).filter(e => e.patientId === pid);
    return events.slice(0, limit);
  }

  /**
   * Resets adaptive profile difficulty levels back to defaults
   * WITHOUT deleting activity sessions, results, or historical data.
   */
  resetAdaptiveProfile(patientId) {
    const pid = this.normalizePatientId(patientId || store.getCurrentPatientId());
    const state = store.getState();
    
    // Clear in-memory profile
    state.adaptiveProfiles = (state.adaptiveProfiles || []).filter(p => p.patientId !== pid);

    this.recordAdaptiveEvent(pid, 'difficulty_reset', {
      reason: 'Adaptive difficulty progression reset to baseline; all activity history preserved.'
    });

    store.notify();
    return this.getAdaptiveProfile(pid);
  }
}

export const adaptiveEngine = new AdaptiveEngine();
store.setAdaptiveEngine(adaptiveEngine);
