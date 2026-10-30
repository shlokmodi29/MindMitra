/**
 * MindMitra - Legacy SpeechService Adapter
 * Delegates to centralized voiceService to prevent duplicate voice engines.
 */

import { voiceService } from './voiceService.js';

class SpeechService {
  isAvailable() {
    return voiceService.isTtsSupported();
  }

  speak(text, options = {}) {
    voiceService.speak(text, options);
  }

  stop() {
    voiceService.stop();
  }

  isSpeaking() {
    return voiceService.isSpeaking();
  }

  speakDayOverview(routines, patientName = 'Asha', lang = 'en') {
    return voiceService.generateDayOverviewText(routines, patientName, lang);
  }
}

export const speechService = new SpeechService();
export default speechService;
