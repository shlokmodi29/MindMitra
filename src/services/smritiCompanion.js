// SmritiAI Conversational & Memory Companion Service (Strictly Non-Diagnostic)
import { store } from '../state/store.js';
import { speechService } from './speechService.js';

class SmritiCompanion {
  constructor() {
    this.provider = typeof window !== 'undefined' && window.MINDMITRA_AI_ENDPOINT 
      ? 'remote_ai_service' 
      : 'local_development_fallback';
    this.disclaimer = "SmritiAI is your gentle memory companion. Non-diagnostic cognitive wellness platform crafted for peace of mind.";
  }

  processQuery(userInput) {
    const input = (userInput || '').toLowerCase().trim();
    const state = store.getState();
    const activeRoute = state.activeRoute || 'patient-home';

    // 1. Emergency cues
    if (input.includes('emergency') || input.includes('help me') || input.includes('fell') || input.includes('sos') || input.includes('pain') || input.includes('doctor')) {
      return {
        type: 'emergency',
        spokenText: "This may be an emergency, Asha. Take a soft breath. Connecting you to 112 or Meera immediately.",
        displayText: "“This may be an emergency, Asha. Take a soft breath. Would you like me to connect you to 112 or shall I call Meera right away?”",
        action: 'emergency-sos'
      };
    }

    // 2. Activity Guidance & Help
    if (input.includes('activity') || input.includes('game') || input.includes('puzzle') || input.includes('exercise') || input.includes('hint') || input.includes('how to play')) {
      const activeAct = state.activities.find(a => a.id === state.activeActivityId) || state.activities[0];
      const text = `Asha, you are practicing "${activeAct.name}". There is no time limit at all. Select the answer that feels most familiar, and tap 'Need a gentle hint?' if you'd like a clue.`;
      return {
        type: 'activity_guidance',
        spokenText: text,
        displayText: `“${text}”`,
        action: 'activities'
      };
    }

    // 3. Schedule & Daily Care Routines
    if (input.includes('day') || input.includes('schedule') || input.includes('medicine') || input.includes('routine') || input.includes('next') || (input.includes('what') && input.includes('do'))) {
      const pending = state.routines.filter(r => !r.completed);
      const nextItem = pending[0];
      const text = nextItem 
        ? `Asha, your next peaceful routine is ${nextItem.title} at ${nextItem.time}. Take your time, there is no hurry at all.`
        : `Asha, you have peacefully completed all scheduled routines for today! Meera has been gently notified.`;
      
      return {
        type: 'schedule',
        spokenText: text,
        displayText: `“${text}”`,
        action: 'my-day'
      };
    }

    // 4. Meera & Family Circle
    if (input.includes('meera') || input.includes('daughter') || input.includes('family') || input.includes('priya') || input.includes('ravi') || input.includes('call')) {
      let text = "Your loving family is right here. Meera stays just 3 minutes away in Sector 4. Son Ravi sent an audio note from Bangalore, and granddaughter Priya is calling you at 4 PM.";
      if (input.includes('meera')) {
        text = "Meera is your daughter. She checked in on you this morning and loves preparing your fresh ginger tea in the veranda.";
      } else if (input.includes('priya')) {
        text = "Priya is your bright granddaughter who completed her university degree in Delhi. She is calling you this afternoon at 4:00 PM.";
      } else if (input.includes('ravi')) {
        text = "Ravi is your son living in Bangalore. He calls every Sunday and sent a voice message about his garden.";
      }
      return {
        type: 'family',
        spokenText: text,
        displayText: `“${text}”`,
        action: 'family-circle'
      };
    }

    // 5. Stories & Reminiscence
    if (input.includes('story') || input.includes('shillong') || input.includes('tea') || input.includes('guwahati') || input.includes('baba') || input.includes('memory')) {
      let text = "Remember October 2018 in the Shillong tea gardens? The morning mist was rising over the Khasi hills, and you enjoyed hot spiced ginger chai by the wooden stall with Meera and Priya.";
      if (input.includes('baba') || input.includes('guwahati')) {
        text = "In the Old Guwahati Courtyard, the parijat tree blossomed white night jasmine, and Baba sat in his cane planters chair listening to the rhythmic monsoon rain.";
      }
      return {
        type: 'memory',
        spokenText: text,
        displayText: `“${text}”`,
        action: 'memory-world'
      };
    }

    // 6. Contextual Screen Help
    if (input.includes('where am i') || input.includes('help') || input.includes('what is this')) {
      let contextMsg = "You are in MindMitra, your peaceful cognitive companion.";
      if (activeRoute === 'memory-world') {
        contextMsg = "You are currently in your Personal Memory World. You can explore photographs, listen to voice memories, or view the Memory Graph.";
      } else if (activeRoute === 'activities') {
        contextMsg = "You are in the Cognitive Activities Hub, with 20 gentle recollection and observation modules.";
      } else if (activeRoute === 'my-day') {
        contextMsg = "You are viewing My Day, your peaceful schedule for medicines, tea, and family calls.";
      } else if (activeRoute === 'emergency-sos') {
        contextMsg = "You are on the Emergency Safety page with direct 1-tap connection to 112 and your daughter Meera.";
      }
      return {
        type: 'contextual_help',
        spokenText: contextMsg,
        displayText: `“${contextMsg}”`,
        action: activeRoute
      };
    }

    // Default gentle conversational greeting
    const defaultText = "I am right here with you, Asha. Take all the time you need. We can listen to a story, check your peaceful day, or look at family photographs.";
    return {
      type: 'greeting',
      spokenText: defaultText,
      displayText: `“${defaultText}”`,
      action: null
    };
  }

  respond(userInput, callback) {
    const response = this.processQuery(userInput);
    speechService.speak(response.spokenText, {
      onEnd: () => {
        if (callback) callback(response);
      }
    });
    return response;
  }
}

export const smritiCompanion = new SmritiCompanion();
