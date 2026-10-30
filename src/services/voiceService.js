/**
 * MindMitra - Centralized Voice Service (TTS & STT)
 * Elderly-friendly voice-first engine with Indian language speech synthesis,
 * speech recognition, interruptible playback, and friendly fallbacks.
 */

import { i18nService } from './i18nService.js';

export const VOICE_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  PAUSED: 'paused',
  ERROR: 'error',
  UNAVAILABLE: 'unavailable',
};

const LANGUAGE_VOICE_MAP = {
  en: ['en-IN', 'en-GB', 'en-US'],
  hi: ['hi-IN', 'hi'],
  as: ['as-IN', 'bn-IN', 'hi-IN', 'en-IN'], // Assamese often shares speech packs or falls back gracefully
  bn: ['bn-IN', 'bn-BD', 'bn'],
};

class VoiceService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis || null : null;
    this.SpeechRecognitionClass =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition || null
        : null;

    this.recognition = null;
    this.currentState = VOICE_STATES.IDLE;
    this.currentTranscript = '';
    this.currentUtterance = null;
    this.listeners = new Set();
    this.lastError = null;

    // Cache voices when loaded
    if (this.synth && typeof this.synth.onvoiceschanged !== 'undefined') {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
    this.voices = this.synth ? this.synth.getVoices() : [];
  }

  /* -------------------------------------------------------------------------- */
  /* CAPABILITY CHECKS                                                          */
  /* -------------------------------------------------------------------------- */

  isTtsSupported() {
    return !!this.synth;
  }

  isSttSupported() {
    return !!this.SpeechRecognitionClass;
  }

  isVoiceSupported() {
    return this.isTtsSupported() || this.isSttSupported();
  }

  getState() {
    return this.currentState;
  }

  setState(newState) {
    this.currentState = newState;
    this.notifyListeners({ state: newState, transcript: this.currentTranscript, error: this.lastError });
  }

  /* -------------------------------------------------------------------------- */
  /* TEXT-TO-SPEECH (TTS)                                                       */
  /* -------------------------------------------------------------------------- */

  isSpeaking() {
    if (this.synth) {
      return this.synth.speaking || this.currentState === VOICE_STATES.SPEAKING;
    }
    return this.currentState === VOICE_STATES.SPEAKING;
  }

  /**
   * Speak text at elderly-friendly rate (~0.88x) with matching voice
   */
  speak(text, options = {}) {
    if (!text || typeof text !== 'string') return;

    // Interrupt any previous speech
    this.stop();

    const activeLang = options.lang || i18nService.getLanguage() || 'en';

    if (!this.synth) {
      console.info('[VoiceService Fallback] TTS not available on this platform. Simulating spoken readout.');
      this.setState(VOICE_STATES.SPEAKING);
      if (options.onStart) options.onStart();
      
      const duration = Math.min(Math.max(text.length * 40, 1500), 5000);
      this.fallbackTimeout = setTimeout(() => {
        this.setState(VOICE_STATES.IDLE);
        if (options.onEnd) options.onEnd();
      }, duration);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      // Elderly-friendly pacing: 0.88 rate is comfortable, gentle, and unhurried
      utterance.rate = options.rate !== undefined ? options.rate : 0.88;
      utterance.pitch = options.pitch !== undefined ? options.pitch : 1.02;

      // Select voice appropriate for active language
      const voice = this.findVoiceForLanguage(activeLang);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = this.getBcp47Code(activeLang);
      }

      utterance.onstart = () => {
        this.setState(VOICE_STATES.SPEAKING);
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        this.setState(VOICE_STATES.IDLE);
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('[VoiceService] Speech error:', e);
        this.currentUtterance = null;
        this.setState(VOICE_STATES.IDLE);
        if (options.onError) options.onError(e);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[VoiceService] Exception during speak():', err);
      this.setState(VOICE_STATES.IDLE);
      if (options.onError) options.onError(err);
    }
  }

  /**
   * Immediately halt any spoken output
   */
  stop() {
    if (this.fallbackTimeout) {
      clearTimeout(this.fallbackTimeout);
      this.fallbackTimeout = null;
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (_) {}
    }

    this.stopListening();
    this.currentUtterance = null;
    if (this.currentState === VOICE_STATES.SPEAKING) {
      this.setState(VOICE_STATES.IDLE);
    }
  }

  pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
      this.setState(VOICE_STATES.PAUSED);
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.setState(VOICE_STATES.SPEAKING);
    }
  }

  /**
   * Find matching voice from system voices
   */
  findVoiceForLanguage(langCode) {
    if (!this.synth) return null;
    const voices = this.voices && this.voices.length > 0 ? this.voices : this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    const candidateCodes = LANGUAGE_VOICE_MAP[langCode] || ['en-IN', 'en-US'];

    for (const code of candidateCodes) {
      const match = voices.find(
        (v) => v.lang.toLowerCase() === code.toLowerCase() || v.lang.toLowerCase().startsWith(code.toLowerCase())
      );
      if (match) return match;
    }

    // Default fallback to first available Indian or default voice
    const indianVoice = voices.find((v) => v.lang.includes('IN'));
    return indianVoice || voices[0] || null;
  }

  getBcp47Code(langCode) {
    const map = {
      en: 'en-IN',
      hi: 'hi-IN',
      as: 'as-IN',
      bn: 'bn-IN',
    };
    return map[langCode] || 'en-IN';
  }

  /* -------------------------------------------------------------------------- */
  /* SPEECH RECOGNITION (STT)                                                   */
  /* -------------------------------------------------------------------------- */

  isListening() {
    return this.currentState === VOICE_STATES.LISTENING;
  }

  getTranscript() {
    return this.currentTranscript;
  }

  /**
   * Start listening for voice input
   */
  startListening(options = {}) {
    const lang = options.lang || i18nService.getLanguage() || 'en';
    this.currentTranscript = '';
    this.lastError = null;

    if (!this.isSttSupported()) {
      const msg = i18nService.t('smriti.micUnavailable');
      this.lastError = msg;
      this.setState(VOICE_STATES.UNAVAILABLE);
      if (options.onError) options.onError(new Error(msg));
      return false;
    }

    try {
      this.stop(); // Stop any active speech before listening

      const recognition = new this.SpeechRecognitionClass();
      recognition.continuous = options.continuous !== undefined ? options.continuous : false;
      recognition.interimResults = true;
      recognition.lang = this.getBcp47Code(lang);

      recognition.onstart = () => {
        this.setState(VOICE_STATES.LISTENING);
        if (options.onStart) options.onStart();
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const combined = (final || interim).trim();
        this.currentTranscript = combined;

        if (options.onInterim && interim) {
          options.onInterim(interim);
        }

        if (final && options.onResult) {
          options.onResult(final);
        }
      };

      recognition.onerror = (event) => {
        console.warn('[VoiceService] Recognition error:', event.error);
        let friendlyMsg = i18nService.t('voice.speechError');
        if (event.error === 'not-allowed') {
          friendlyMsg = i18nService.t('voice.micDenied');
        }

        this.lastError = friendlyMsg;
        this.setState(VOICE_STATES.ERROR);
        if (options.onError) options.onError(new Error(friendlyMsg));
      };

      recognition.onend = () => {
        if (this.currentState === VOICE_STATES.LISTENING) {
          this.setState(VOICE_STATES.IDLE);
        }
        if (options.onEnd) options.onEnd(this.currentTranscript);
      };

      this.recognition = recognition;
      recognition.start();
      return true;
    } catch (err) {
      console.warn('[VoiceService] Failed to start recognition:', err);
      const friendlyMsg = i18nService.t('voice.speechError');
      this.lastError = friendlyMsg;
      this.setState(VOICE_STATES.ERROR);
      if (options.onError) options.onError(err);
      return false;
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
      this.recognition = null;
    }
    if (this.currentState === VOICE_STATES.LISTENING) {
      this.setState(VOICE_STATES.IDLE);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* SPOKEN CONTENT GENERATORS                                                  */
  /* -------------------------------------------------------------------------- */

  /**
   * Generates a warm spoken schedule overview for My Day
   */
  generateDayOverviewText(reminders = [], patientName = 'Friend', lang = 'en') {
    const pending = reminders.filter((r) => !r.completed);
    const count = pending.length;

    if (lang === 'hi') {
      if (count === 0) {
        return `नमस्ते ${patientName} जी। आज के लिए आपके सभी कार्य पूर्ण हैं। आराम करें और अपने शांत दिन का आनंद लें।`;
      }
      const itemSummaries = pending.slice(0, 3).map((r) => `${r.title} ${r.time ? 'समय ' + r.time : ''}`).join('। इसके बाद ');
      return `नमस्ते ${patientName} जी। आज आपके लिए ${count} महत्वपूर्ण कार्य हैं। पहला कार्य है: ${itemSummaries}। आराम से करें, कोई जल्दी नहीं है।`;
    }

    if (lang === 'as') {
      if (count === 0) {
        return `নমস্কাৰ ${patientName}। আজিৰ সকলো কাম সম্পূৰ্ণ হৈছে। বিশ্ৰাম লওক আৰু শান্ত দিনটো কটাওক।`;
      }
      const itemSummaries = pending.slice(0, 3).map((r) => `${r.title} ${r.time ? 'সময় ' + r.time : ''}`).join('। তাৰ পিছত ');
      return `নমস্কাৰ ${patientName}। আজি আপোনাৰ বাবে ${count} টা কাম আছে। প্ৰথমতে: ${itemSummaries}। লাহে লাহে কৰক, কোনো খৰখেদা নাই।`;
    }

    if (lang === 'bn') {
      if (count === 0) {
        return `নমস্কার ${patientName}। আজকের সমস্ত কাজ সম্পন্ন হয়েছে। শান্তভাবে বিশ্রাম নিন।`;
      }
      const itemSummaries = pending.slice(0, 3).map((r) => `${r.title} ${r.time ? 'সময় ' + r.time : ''}`).join('। এরপর ');
      return `নমস্কার ${patientName}। আজ আপনার জন্য ${count}টি কাজ রয়েছে। প্রথমে: ${itemSummaries}। ধীরে ধীরে করুন, কোনো তাড়া নেই।`;
    }

    // Default English
    if (count === 0) {
      return `Good day, ${patientName}. You have completed all of your reminders for today. Rest and enjoy your peaceful day.`;
    }
    const itemSummaries = pending.slice(0, 3).map((r) => `${r.title} at ${r.time || 'your routine time'}`).join('. Next, ');
    return `Good day, ${patientName}. You have ${count} reminders scheduled today. First, ${itemSummaries}. Please take your time, there is no rush at all.`;
  }

  /**
   * Generates a warm, simple spoken readout for Smart Daily Plan
   */
  generatePlanSpokenText(plan, patientName = 'Friend', lang = 'en') {
    if (!plan || !plan.items || plan.items.length === 0) {
      if (lang === 'hi') return `नमस्ते ${patientName} जी। आज के लिए आपका कोई कार्य नहीं है। आराम करें और अपने शांत दिन का आनंद लें।`;
      if (lang === 'as') return `নমস্কাৰ ${patientName}। আজি আপোনাৰ কোনো কাম তালিকাভুক্ত নাই। শান্ত দিনটো আনন্দৰে কটাওক।`;
      if (lang === 'bn') return `নমস্কার ${patientName}। আজ আপনার কোনো কাজ তালিকাভুক্ত নেই। শান্তভাবে দিনটি উপভোগ করুন।`;
      return `Good day, ${patientName}. Your day is clear. Rest and enjoy your peaceful day.`;
    }

    const pending = plan.items.filter(i => i.status !== 'completed');
    if (pending.length === 0) {
      if (lang === 'hi') return `बहुत बढ़िया, ${patientName} जी! आपने आज के सभी ${plan.items.length} कार्य पूरे कर लिए हैं।`;
      if (lang === 'as') return `বৰ সুন্দৰ, ${patientName}! আপুনি আজিৰ সকলো ${plan.items.length} টা কাম সম্পন্ন কৰিছে।`;
      if (lang === 'bn') return `দারুণ, ${patientName}! আপনি আজকের সমস্ত ${plan.items.length}টি কাজ সম্পন্ন করেছেন।`;
      return `Wonderful, ${patientName}! You have completed all ${plan.items.length} scheduled items for today.`;
    }

    const importantItems = pending.filter(i => i.priority === 'Important' || i.priority === 'important');
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

    // Default English
    const itemDescriptions = previewItems.map(i => `${i.title}${i.scheduledTime ? ' at ' + i.scheduledTime : ''}`).join(', followed by ');
    return `Good morning, ${patientName}. Today you have ${pending.length} items scheduled, including ${importantItems.length} important tasks. First, ${itemDescriptions}. Please take all the time you need.`;
  }

  /* -------------------------------------------------------------------------- */
  /* SUBSCRIPTIONS & OBSERVERS                                                  */
  /* -------------------------------------------------------------------------- */

  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
    return () => {};
  }

  notifyListeners(payload) {
    for (const fn of this.listeners) {
      try {
        fn(payload);
      } catch (err) {
        console.error('[VoiceService] Subscriber error:', err);
      }
    }
  }
}

export const voiceService = new VoiceService();
export default voiceService;
