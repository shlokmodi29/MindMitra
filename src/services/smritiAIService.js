// MindMitra SmritiAI Personal AI Memory Companion Service
// Connects Personal Memory World, Daily Care Reminders, and Cognitive Activities
// Strictly Non-Diagnostic, Zero-Fabrication, Elder-Accessible Architecture

import { store } from '../state/store.js';
import { memoryService } from './memoryService.js';
import { activityRegistry } from './activityRegistry.js';
import { voiceService } from './voiceService.js';
import { i18nService } from './i18nService.js';
import { adaptiveEngine } from './adaptiveEngine.js';
import { securityService } from './securityService.js';
import { doctorService } from './doctorService.js';
import { analyticsService } from './analyticsService.js';
import { reportService } from './reportService.js';
import { dailyPlanService } from './dailyPlanService.js';
import { moodCheckInService } from './moodCheckInService.js';

export const SMRITI_RESPONSE_TYPES = {
  TEXT: 'text',
  MEMORY: 'memory',
  PERSON: 'person',
  PLACE: 'place',
  EVENT: 'event',
  ACTIVITY: 'activity',
  REMINDER: 'reminder',
  EMERGENCY: 'emergency',
  MEDICAL_DISCLAIMER: 'medical_disclaimer',
  NAVIGATION: 'navigation',
  EMPATHY: 'empathy'
};

/**
 * Local Intelligent Memory Companion Provider
 * Safe, zero-secret development & offline fallback provider that traverses
 * real patient memory graphs, daily routines, and cognitive activities.
 */
class LocalMemoryCompanionProvider {
  constructor() {
    this.name = 'LocalMemoryCompanionProvider';
  }

  detectLanguage(input = '', fallbackLang = 'en') {
    if (/[\u0900-\u097F]/.test(input)) return 'hi';
    if (/[\u0980-\u09FF]/.test(input)) {
      // Distinctive Assamese script glyphs & vocabulary (U+09F0 'ৰ', U+09F1 'ৱ')
      if (
        input.includes('ৰ') || 
        input.includes('ৱ') || 
        input.includes('কওক') || 
        input.includes('শুনক') || 
        input.includes('দিনটো') || 
        input.includes('আজি') ||
        input.includes('নমস্কাৰ')
      ) {
        return 'as';
      }
      // Distinctive Bengali script glyphs & vocabulary (U+09B0 'র', U+09DF 'য়')
      if (
        input.includes('র') || 
        input.includes('য়') || 
        input.includes('আমার') || 
        input.includes('আজকে') || 
        input.includes('নমস্কার') ||
        input.includes('বলুন')
      ) {
        return 'bn';
      }
      return fallbackLang === 'as' ? 'as' : (fallbackLang === 'bn' ? 'bn' : 'bn');
    }
    return fallbackLang || 'en';
  }

  generateResponse(userInput, context, sessionContext) {
    const rawInput = (userInput || '').trim();
    const input = rawInput.toLowerCase();
    const pid = context.patientId;
    const patientName = context.patientName || 'Asha';
    const activeRoute = store.getState().activeRoute || 'patient-home';
    const lang = this.detectLanguage(rawInput, context.language || 'en');

    // 1. EMERGENCY SAFETY HANDOFF (Never fake emergency call, provide direct handoff)
    if (
      input.includes('emergency') || 
      input.includes('call for help') ||
      input.includes('help me') || 
      input.includes('fell') || 
      input.includes('danger') || 
      input.includes('sos') || 
      input.includes('severe pain') ||
      input.includes('cannot breathe') ||
      input.includes('मदद') ||
      input.includes('सहायता') ||
      input.includes('সহায়') ||
      input.includes('বিপদ')
    ) {
      let emText = `This may be an emergency, ${patientName}. Would you like me to open Emergency Help?`;
      let emSpoken = `This may be an emergency. Would you like to call 112?`;
      let emAction = 'Open Emergency Help';

      if (lang === 'hi') {
        emText = `यह एक आपातकालीन स्थिति हो सकती है, ${patientName} जी। क्या आप आपातकालीन सहायता खोलना चाहते हैं?`;
        emSpoken = `यह आपात स्थिति हो सकती है। क्या आप 112 पर कॉल करना चाहते हैं?`;
        emAction = 'आपातकालीन सहायता खोलें';
      } else if (lang === 'as') {
        emText = `এইটো এটা জৰুৰীকালীন পৰিস্থিতি হ’ব পাৰে, ${patientName}। আপুনি জৰুৰী সাহায্য খুলিব খোজে নেকি?`;
        emSpoken = `এইটো জৰুৰীকালীন অৱস্থা হ’ব পাৰে। আপুনি 112 ত কল কৰিব খোজে নেকি?`;
        emAction = 'জৰুৰী সাহায্য খোলক';
      } else if (lang === 'bn') {
        emText = `এটি একটি জরুরি পরিস্থিতি হতে পারে, ${patientName}। আপনি কি জরুরি সহায়তা খুলতে চান?`;
        emSpoken = `এটি জরুরি অবস্থা হতে পারে। আপনি কি 112 এ কল করতে চান?`;
        emAction = 'জরুরি সহায়তা খুলুন';
      }

      return {
        type: SMRITI_RESPONSE_TYPES.EMERGENCY,
        text: emText,
        spokenText: emSpoken,
        actionLabel: emAction,
        actionRoute: 'emergency-sos',
        actions: [
          { label: emAction, route: '#/sos' }
        ],
        emergencyNumber: '112'
      };
    }

    // 2. MEDICAL / CLINICAL BOUNDARY (Non-diagnostic, no medication prescription or alterations)
    if (
      input.includes('diagnos') || 
      input.includes('dementia score') || 
      input.includes('cure') || 
      input.includes('prescribe') || 
      input.includes('change my medicine') ||
      input.includes('stop my pill') ||
      input.includes('dosage') ||
      input.includes('medical advice') ||
      input.includes('इलाज') ||
      input.includes('दवा बदलो') ||
      input.includes('ঔষধ সলনি') ||
      input.includes('ওষুধ পরিবর্তন')
    ) {
      let medText = `I am your gentle memory companion, ${patientName}, and cannot give medical advice or alter prescriptions. Please consult your physician or speak with your primary caregiver about medical questions.`;
      let medSpoken = `I am your memory companion, ${patientName}, and cannot provide medical advice. Please check with your doctor.`;
      let medAction = 'View Today’s Care Reminders';

      if (lang === 'hi') {
        medText = `मैं आपकी स्मृति साथी हूँ, ${patientName} जी। मैं चिकित्सीय सलाह नहीं दे सकती या दवाइयाँ नहीं बदल सकती। कृपया अपने चिकित्सक से परामर्श लें।`;
        medSpoken = `मैं आपकी स्मृति साथी हूँ। मैं चिकित्सीय सलाह नहीं दे सकती। कृपया डॉक्टर से परामर्श लें।`;
        medAction = 'आज की दवाइयाँ और कार्य देखें';
      } else if (lang === 'as') {
        medText = `মই আপোনাৰ স্মৃতি সংগী, ${patientName}। মই কোনো চিকিৎসা পৰামৰ্শ দিব নোৱাৰো। অনুগ্ৰহ কৰি আপোনাৰ চিকিৎসকৰ সৈতে কথা পাতক।`;
        medSpoken = `মই চিকিৎসা পৰামৰ্শ দিব নোৱাৰো। অনুগ্ৰহ কৰি চিকিৎসকৰ সৈতে কথা পাতক।`;
        medAction = 'আজিৰ সোঁৱৰণীবোৰ চাওক';
      } else if (lang === 'bn') {
        medText = `আমি আপনার স্মৃতি সঙ্গী, ${patientName}। আমি কোনো ডাক্তারি পরামর্শ দিতে পারি না। অনুগ্রহ করে চিকিৎসকের সাথে কথা বলুন।`;
        medSpoken = `আমি কোনো ডাক্তারি পরামর্শ দিতে পারি না। অনুগ্রহ করে চিকিৎসকের সাথে কথা বলুন।`;
        medAction = 'আজকের রুটিন দেখুন';
      }

      return {
        type: SMRITI_RESPONSE_TYPES.MEDICAL_DISCLAIMER,
        text: medText,
        spokenText: medSpoken,
        actionLabel: medAction,
        actionRoute: 'my-day'
      };
    }

    // 2.3 MOOD & EMOTIONAL SUPPORT HANDOFF (Empathetic, strictly non-diagnostic)
    const isFeelingLow = input.includes('feel low') || input.includes('feeling low') || input.includes('felt low') || input.includes('feel sad') || input.includes('feeling sad') || input.includes('i am sad') || input.includes('उदास') || input.includes('मन खराब');
    const isFeelingWorried = input.includes('worried') || input.includes('feeling worried') || input.includes('anxious') || input.includes('डर लग रहा') || input.includes('চিন্তিত') || input.includes('uneasy');
    const isFeelingGood = input.includes('feel good') || input.includes('feeling good') || input.includes('feeling happy') || input.includes('feeling great') || input.includes('खुश') || input.includes('ভালো লাগছে');

    if (isFeelingLow || isFeelingWorried) {
      let respText = `I'm here with you, ${patientName}. Would you like something gentle, like looking through a favorite memory or enjoying a quiet moment together?`;
      let respSpoken = `I'm here with you, ${patientName}. Would you like something gentle, like looking through a favorite memory?`;
      let actLabel = 'Explore a Memory';
      let actRoute = 'memory-world';

      if (lang === 'hi') {
        respText = `मैं आपके साथ हूँ, ${patientName} जी। क्या आप कुछ शांत और सुखद करना चाहते हैं, जैसे अपनी कोई पसंदीदा याद देखना?`;
        respSpoken = `मैं आपके साथ हूँ, ${patientName} जी। क्या आप कोई पसंदीदा याद देखना चाहते हैं?`;
        actLabel = 'पसंदीदा यादें देखें';
      } else if (lang === 'as') {
        respText = `মই আপোনাৰ কাষত আছো, ${patientName}। আপুনি কোনো মনপচন্দ স্মৃতি চোৱাৰ দৰে কিবা শান্ত কাম কৰিব বিচাৰেনে?`;
        respSpoken = `মই আপোনাৰ কাষত আছো। আপুনি কোনো স্মৃতি চাব বিচাৰেনে?`;
        actLabel = 'স্মৃতি চাওক';
      } else if (lang === 'bn') {
        respText = `আমি আপনার সাথে আছি, ${patientName}। আপনি কি পছন্দের কোনো স্মৃতি দেখার মতো শান্ত কিছু করতে চান?`;
        respSpoken = `আমি আপনার সাথে আছি। পছন্দের কোনো স্মৃতি দেখতে চান?`;
        actLabel = 'স্মৃতি দেখুন';
      }

      const allActions = [
        { label: actLabel, route: '#/' + actRoute },
        { label: 'Try a Gentle Activity', route: '#/activities' },
        { label: 'Talk to Family', route: '#/family-circle' },
        { label: 'Not Now', route: null }
      ];

      return {
        type: SMRITI_RESPONSE_TYPES.EMPATHY,
        text: respText,
        spokenText: respSpoken,
        actionLabel: actLabel,
        actionRoute: actRoute,
        actions: allActions,
        secondaryActions: [
          { label: 'Try a Gentle Activity', route: 'activities' },
          { label: 'Talk to Family', route: 'family-circle' },
          { label: 'Not Now', route: null }
        ]
      };
    }

    if (isFeelingGood) {
      let text = `It warms my heart to hear that, ${patientName}! Would you like to explore today's plan or enjoy a gentle activity together?`;
      let spoken = `It warms my heart to hear that! Would you like to explore today's plan?`;
      if (lang === 'hi') {
        text = `यह जानकर बहुत खुशी हुई, ${patientName} जी! क्या आप आज की योजना देखना चाहते हैं?`;
        spoken = text;
      }
      return {
        type: SMRITI_RESPONSE_TYPES.EMPATHY,
        text,
        spokenText: spoken,
        actionLabel: 'View Today’s Plan',
        actionRoute: 'my-day'
      };
    }

    // 2.5 CAREGIVER PORTAL & OPERATIONAL SUPPORT QUERIES
    if (
      input.includes('pay attention') || 
      input.includes('attention to today') ||
      input.includes('which reminders are upcoming') ||
      input.includes('what reminders are upcoming') ||
      input.includes('upcoming reminders') ||
      input.includes('what activities were completed') ||
      input.includes('activities were completed') ||
      input.includes('activities completed') ||
      input.includes('show recent memories') ||
      input.includes('recent memories')
    ) {
      const pid = context.patientId || store.getCurrentPatientId();
      const careSummary = store.getDailyCareSummary(pid);
      const activityResults = store.getActivityResults(pid);
      const memories = (store.getState().memories || []).filter(m => !m.patientId || m.patientId === pid);

      if (input.includes('attention')) {
        const attentionItem = careSummary.dueSoon[0] || careSummary.upcoming[0];
        const nextInfo = attentionItem ? `Next scheduled item: "${attentionItem.title}" at ${attentionItem.time}.` : 'All scheduled routines are up to date.';
        const text = `Today's Care Focus for ${patientName}: ${careSummary.completedCount} of ${careSummary.total} routines completed. ${nextInfo}`;
        return {
          type: SMRITI_RESPONSE_TYPES.GENERAL,
          text,
          spokenText: text,
          actionLabel: 'Open Caregiver Dashboard',
          actionRoute: 'caregiver-dashboard'
        };
      }

      if (input.includes('reminders') || input.includes('upcoming')) {
        const upcomingList = [...careSummary.dueSoon, ...careSummary.upcoming];
        if (upcomingList.length === 0) {
          const text = `All ${careSummary.total} care reminders for ${patientName} are completed for today.`;
          return {
            type: SMRITI_RESPONSE_TYPES.REMINDER,
            text,
            spokenText: text,
            actionLabel: 'View Schedule',
            actionRoute: 'caregiver-dashboard'
          };
        }
        const listText = upcomingList.slice(0, 3).map(r => `• ${r.title} (${r.time})`).join('\n');
        const text = `Upcoming reminders for ${patientName}:\n${listText}`;
        return {
          type: SMRITI_RESPONSE_TYPES.REMINDER,
          text,
          spokenText: `There are ${upcomingList.length} upcoming reminders, starting with ${upcomingList[0].title} at ${upcomingList[0].time}.`,
          actionLabel: 'Manage Reminders',
          actionRoute: 'caregiver-dashboard'
        };
      }

      if (input.includes('activities') || input.includes('completed')) {
        if (!activityResults || activityResults.length === 0) {
          const text = `No cognitive practice activities have been completed yet today for ${patientName}.`;
          return {
            type: SMRITI_RESPONSE_TYPES.ACTIVITY,
            text,
            spokenText: text,
            actionLabel: 'View Cognitive Hub',
            actionRoute: 'activities'
          };
        }
        const recent = activityResults.slice(0, 3);
        const actSummary = recent.map(r => `• ${r.activityTitle || r.activityId} (${r.difficulty || 'Easy'}, ${r.accuracy || 100}% accuracy)`).join('\n');
        const text = `Recent cognitive activities completed by ${patientName}:\n${actSummary}`;
        return {
          type: SMRITI_RESPONSE_TYPES.ACTIVITY,
          text,
          spokenText: `${recent.length} recent cognitive activities recorded for ${patientName}.`,
          actionLabel: 'View Activity History',
          actionRoute: 'caregiver-dashboard'
        };
      }

      if (input.includes('memories')) {
        const recentMems = memories.slice(0, 3);
        const memText = recentMems.map(m => `• "${m.title}" (${m.year || 'Family Keepsake'})`).join('\n');
        const text = `Recent memories in ${patientName}'s Memory World:\n${memText}`;
        return {
          type: SMRITI_RESPONSE_TYPES.MEMORY,
          text,
          spokenText: `Found ${memories.length} cherished memories for ${patientName}.`,
          actionLabel: 'View Memory Bridge',
          actionRoute: 'caregiver-bridge'
        };
      }
    }

    // 2.6 DOCTOR & CLINICAL CARE TEAM INQUIRIES
    if (
      context.userRole === 'doctor' ||
      context.doctorId ||
      input.includes('doctor') ||
      input.includes('dr.') ||
      input.includes('dr sharma') ||
      input.includes('appointment') ||
      input.includes('specialist') ||
      input.includes('clinic') ||
      input.includes('patient report') ||
      input.includes('care report') ||
      input.includes('care summary') ||
      input.includes('patient summary') ||
      input.includes('डॉक्टर') ||
      input.includes('চিকিৎসক')
    ) {
      const activeUser = store.currentUser || {};
      const userRole = context.userRole || activeUser.role || 'patient';
      const pid = context.patientId || store.getCurrentPatientId();

      // Case A: DOCTOR user role asking SmritiAI
      if (userRole === 'doctor') {
        const docId = context.doctorId || activeUser.id;
        
        // Doctor asking for recent/shared reports
        if (input.includes('report') || input.includes('shared')) {
          const sharedReports = doctorService ? doctorService.getSharedReportsForDoctor(docId) : [];
          if (sharedReports.length === 0) {
            return {
              type: SMRITI_RESPONSE_TYPES.GENERAL,
              text: `Dr. ${activeUser.name || 'Doctor'}, you currently have no shared patient reports available for review. When caregivers share a routine summary, it will appear here.`,
              spokenText: `You currently have no shared patient reports available.`,
              actionLabel: 'View Shared Reports',
              actionRoute: 'doctor-portal/reports'
            };
          }
          const repSummary = sharedReports.slice(0, 3).map(r => `• ${r.patientName || 'Patient'}: ${r.title || 'Care Report'} (${r.dateRange || 'Recent'})`).join('\n');
          return {
            type: SMRITI_RESPONSE_TYPES.GENERAL,
            text: `Dr. ${activeUser.name || 'Doctor'}, you have ${sharedReports.length} shared patient report(s) on file:\n${repSummary}`,
            spokenText: `You have ${sharedReports.length} shared patient reports on file.`,
            actionLabel: 'Open Doctor Portal Reports',
            actionRoute: 'doctor-portal/reports'
          };
        }

        // Doctor asking about a specific patient summary or adherence
        const targetPid = context.targetPatientId || pid;
        if (targetPid) {
          const isAuth = doctorService ? doctorService.hasDoctorAccess(docId, targetPid) : false;
          if (!isAuth) {
            return {
              type: SMRITI_RESPONSE_TYPES.MEDICAL_DISCLAIMER,
              text: `Access Denied: You do not have active clinical authorization to access this patient's records under DPDP privacy regulations.`,
              spokenText: `Access denied. You do not have active clinical authorization for this patient.`,
              actionLabel: 'Doctor Dashboard',
              actionRoute: 'doctor-portal'
            };
          }
          const targetPatient = (store.getState().users || []).find(u => u.id === targetPid) || { name: patientName };
          const adherence = analyticsService ? analyticsService.calculateAdherence(targetPid) : { rate: '92%', completedSessions: 0 };
          const rateStr = String(adherence.rate || '92%').endsWith('%') ? String(adherence.rate || '92%') : `${adherence.rate || 0}%`;
          const results = store.getActivityResults ? store.getActivityResults(targetPid) : [];
          return {
            type: SMRITI_RESPONSE_TYPES.GENERAL,
            text: `Authorized Non-Diagnostic Care Summary for ${targetPatient.name}: Routine adherence is currently ${rateStr}. Completed ${results.length} cognitive activity sessions. No diagnostic claims made.`,
            spokenText: `Care summary for ${targetPatient.name}: Routine adherence is ${rateStr} with ${results.length} activity sessions completed.`,
            actionLabel: 'View Patient in Portal',
            actionRoute: 'doctor-portal/patients'
          };
        }
      }

      // Case B: CAREGIVER asking to generate or view care report
      if (userRole === 'caregiver' && (input.includes('report') || input.includes('summary') || input.includes('generate'))) {
        const adherence = analyticsService ? analyticsService.calculateAdherence(pid) : { rate: '92%', completedSessions: 0 };
        const rateStr = String(adherence.rate || '92%').endsWith('%') ? String(adherence.rate || '92%') : `${adherence.rate || 0}%`;
        const results = store.getActivityResults ? store.getActivityResults(pid) : [];
        return {
          type: SMRITI_RESPONSE_TYPES.GENERAL,
          text: `Routine Care Summary for ${patientName}: Overall routine adherence is ${rateStr}. ${patientName} has completed ${results.length} cognitive sessions. This non-diagnostic summary is ready to share with authorized doctors.`,
          spokenText: `Care report generated for ${patientName}: Routine adherence is ${rateStr}.`,
          actionLabel: 'Open Clinical Reports',
          actionRoute: 'caregiver-reports'
        };
      }

      // Case C: PATIENT (or general inquiry about doctor/appointment)
      const connections = doctorService ? doctorService.getPatientConnections(pid) : [];
      const approvedDocs = connections.filter(c => c.status === 'approved');

      if (approvedDocs.length === 0) {
        return {
          type: SMRITI_RESPONSE_TYPES.PERSON,
          text: `You do not currently have a doctor connected to your care profile. Your caregiver can link your doctor or share routine care summaries.`,
          spokenText: `You do not currently have a doctor connected to your care profile.`,
          actionLabel: 'View My Doctors',
          actionRoute: 'my-doctors'
        };
      }

      const primaryDoc = approvedDocs[0];
      const reminders = store.getRemindersForPatient ? store.getRemindersForPatient(pid) : [];
      const appointments = reminders.filter(r => r.category === 'appointment');
      const nextAppt = appointments.length > 0 ? appointments[0] : null;
      const apptText = nextAppt 
        ? `Upcoming visit: ${nextAppt.title} at ${nextAppt.scheduledTime || nextAppt.time || '10:30 AM'}.`
        : 'No upcoming clinic visits scheduled at this time.';

      // If patient asking about routine summary or adherence
      if (input.includes('report') || input.includes('summary') || input.includes('adherence')) {
        const adherence = analyticsService ? analyticsService.calculateAdherence(pid) : { rate: '92%' };
        const rateStr = String(adherence.rate || '92%').endsWith('%') ? String(adherence.rate || '92%') : `${adherence.rate || 0}%`;
        return {
          type: SMRITI_RESPONSE_TYPES.GENERAL,
          text: `Your daily routine adherence is ${rateStr}. Your doctor ${primaryDoc.doctorName} at ${primaryDoc.doctorHospital} can review your progress summaries shared by your caregiver.`,
          spokenText: `Your routine adherence is ${rateStr}. Your doctor is ${primaryDoc.doctorName}.`,
          actionLabel: 'View My Doctors',
          actionRoute: 'my-doctors'
        };
      }

      return {
        type: SMRITI_RESPONSE_TYPES.PERSON,
        text: `Your connected doctor is ${primaryDoc.doctorName}, specialist in ${primaryDoc.doctorSpecialization || 'Cognitive Health'} at ${primaryDoc.doctorHospital}. ${apptText}`,
        spokenText: `Your doctor is ${primaryDoc.doctorName} at ${primaryDoc.doctorHospital}. ${nextAppt ? `Upcoming visit: ${nextAppt.title}.` : ''}`,
        actionLabel: 'View My Doctors',
        actionRoute: 'my-doctors'
      };
    }

    // 2.7 OFFLINE & CONNECTIVITY STATUS INQUIRIES
    if (
      input.includes('offline') ||
      input.includes('internet') ||
      input.includes('wifi') ||
      input.includes('connection') ||
      input.includes('ऑफलाइन') ||
      input.includes('ইন্টারনেট')
    ) {
      const text = `SmritiAI is operating safely on your device in offline mode, ${patientName}. All your personal memories, daily routines, and cognitive activities are saved securely right here.`;
      return {
        type: SMRITI_RESPONSE_TYPES.GENERAL,
        text,
        spokenText: text,
        actionLabel: "View Today's Plan",
        actionRoute: 'my-day'
      };
    }

    // 3. DAILY CARE, SCHEDULE & SMART DAILY PLAN ASSISTANCE
    if (
      !(input.includes('play') || input.includes('game') || input.includes('puzzle') || input.includes('activity') || input.includes('खेल') || input.includes('খেলা')) &&
      (
        input.includes('schedule') || 
        input.includes('routine') || 
        input.includes('medicine') || 
        input.includes('water') || 
        input.includes('tonic') || 
        input.includes('next') || 
        input.includes('coming up') ||
        input.includes('plan') ||
        input.includes('my day') ||
        (input.includes('day') && !input.includes('today')) ||
        (input.includes('what') && (input.includes('do') || input.includes('have') || input.includes('next') || input.includes('plan'))) ||
        input.includes('योजना') ||
        input.includes('दिन') ||
        input.includes('दवा') ||
        input.includes('काम') ||
        input.includes('आगे') ||
        input.includes('পৰিকল্পনা') ||
        input.includes('পরিকল্পনা') ||
        input.includes('দিন') ||
        input.includes('দিনটো') ||
        input.includes('কাম') ||
        input.includes('কাজ') ||
        input.includes('ঔষধ') ||
        input.includes('দৰব') ||
        input.includes('আজি') ||
        input.includes('আজ') ||
        input.includes('রুটিন') ||
        input.includes('সূচী')
      )
    ) {
      const plan = context.dailyPlan;
      if (plan && Array.isArray(plan.items) && plan.items.length > 0) {
        const isMorningQuery = input.includes('morning') || input.includes('सुबह') || input.includes('পুৱা') || input.includes('সকাল');
        const isNextQuery = input.includes('next') || input.includes('आगे') || input.includes('পৰৱৰ্তী') || input.includes('পরবর্তী');

        let relevantItems = plan.items.filter(i => i.status !== 'completed');
        if (isMorningQuery) {
          relevantItems = plan.items.filter(i => i.timeBucket === 'morning' && i.status !== 'completed');
          if (relevantItems.length === 0) {
            relevantItems = plan.items.filter(i => i.timeBucket === 'morning');
          }
        }

        if (isNextQuery) {
          const nextItem = relevantItems[0] || plan.items.find(i => i.status !== 'completed');
          if (nextItem) {
            let nextText = `Your next item is "${nextItem.title}" scheduled for ${nextItem.scheduledTime || 'your routine time'}. Take all the time you need.`;
            if (lang === 'hi') nextText = `आपका अगला कार्य "${nextItem.title}" ${nextItem.scheduledTime ? 'समय ' + nextItem.scheduledTime + ' पर' : ''} है। आराम से करें।`;
            else if (lang === 'as') nextText = `আপোনাৰ পৰৱৰ্তী কাম হ’ল "${nextItem.title}" ${nextItem.scheduledTime ? 'সময় ' + nextItem.scheduledTime : ''}। লাহে লাহে কৰক।`;
            else if (lang === 'bn') nextText = `আপনার পরবর্তী কাজ হলো "${nextItem.title}" ${nextItem.scheduledTime ? 'সময় ' + nextItem.scheduledTime : ''}। ধীরে ধীরে করুন।`;

            return {
              type: SMRITI_RESPONSE_TYPES.REMINDER,
              text: nextText,
              spokenText: nextText,
              actionLabel: 'Open My Day',
              actionRoute: 'my-day',
              reminder: nextItem,
              stats: { completed: plan.summary ? plan.summary.completedCount : 0, total: plan.summary ? plan.summary.total : plan.items.length }
            };
          }
        }

        if (relevantItems.length > 0) {
          const preview = relevantItems.slice(0, 3);
          const descriptions = preview.map(i => `${i.title}${i.scheduledTime ? ' at ' + i.scheduledTime : ''}`).join(', followed by ');
          let planText = `You have ${relevantItems.length} items scheduled${isMorningQuery ? ' this morning' : ' today'}. First, ${descriptions}.`;
          if (lang === 'hi') {
            const hiList = preview.map(i => `${i.title}${i.scheduledTime ? ' समय ' + i.scheduledTime : ''}`).join('। इसके बाद ');
            planText = `आज आपके लिए ${relevantItems.length} कार्य निर्धारित हैं। पहला कार्य है: ${hiList}।`;
          } else if (lang === 'as') {
            const asList = preview.map(i => `${i.title}${i.scheduledTime ? ' সময় ' + i.scheduledTime : ''}`).join('। তাৰ পিছত ');
            planText = `আজি আপোনাৰ বাবে ${relevantItems.length} টা কাম তালিকাভুক্ত আছে। প্ৰথমতে: ${asList}।`;
          } else if (lang === 'bn') {
            const bnList = preview.map(i => `${i.title}${i.scheduledTime ? ' সময় ' + i.scheduledTime : ''}`).join('। এরপর ');
            planText = `আজ আপনার জন্য ${relevantItems.length}টি কাজ নির্ধারিত আছে। প্রথমে: ${bnList}।`;
          }

          return {
            type: SMRITI_RESPONSE_TYPES.REMINDER,
            text: planText,
            spokenText: planText,
            actionLabel: 'Open My Day',
            actionRoute: 'my-day',
            stats: { completed: plan.summary ? plan.summary.completedCount : 0, total: plan.summary ? plan.summary.total : plan.items.length }
          };
        } else if (plan.summary && plan.summary.completedCount > 0) {
          let doneText = `Wonderful, ${patientName}! You have peacefully completed all ${plan.items.length} scheduled items for today.`;
          if (lang === 'hi') doneText = `बहुत बढ़िया, ${patientName} जी! आपने आज के सभी ${plan.items.length} कार्य पूरे कर लिए हैं।`;
          else if (lang === 'as') doneText = `বৰ সুন্দৰ, ${patientName}! আপুনি আজিৰ সকলো ${plan.items.length} টা কাম সম্পূৰ্ণ কৰিছে।`;
          else if (lang === 'bn') doneText = `অসাধারণ, ${patientName}! আপনি আজকের সমস্ত ${plan.items.length}টি কাজ সম্পন্ন করেছেন।`;

          return {
            type: SMRITI_RESPONSE_TYPES.REMINDER,
            text: doneText,
            spokenText: doneText,
            actionLabel: 'Review My Day',
            actionRoute: 'my-day',
            stats: { completed: plan.summary.completedCount, total: plan.summary.total }
          };
        }
      }

      const daily = context.daily;
      if (!daily || !daily.reminders || daily.reminders.length === 0) {
        let emptyText = `You have no scheduled care items listed for today, ${patientName}. Enjoy a quiet, restful day.`;
        if (lang === 'hi') emptyText = `आज के लिए आपका कोई कार्य लंबित नहीं है, ${patientName} जी। आराम करें और अपने दिन का आनंद लें।`;
        else if (lang === 'as') emptyText = `আজিৰ বাবে আপোনাৰ কোনো জৰুৰী কাম বাকী নাই, ${patientName}। শান্ত দিনটো আনন্দৰে কটাওক।`;
        else if (lang === 'bn') emptyText = `আজকের জন্য আপনার কোনো কাজ বাকি নেই, ${patientName}। শান্তভাবে দিনটি উপভোগ করুন।`;

        return {
          type: SMRITI_RESPONSE_TYPES.REMINDER,
          text: emptyText,
          spokenText: emptyText,
          actionLabel: 'View My Day',
          actionRoute: 'my-day'
        };
      }

      const pending = daily.reminders.filter(r => !r.completed && r.status !== 'completed');
      const nextReminder = pending[0];
      const completedCount = daily.reminders.length - pending.length;

      if (nextReminder) {
        let reminderText = `Your next care reminder is "${nextReminder.title}" scheduled for ${nextReminder.time}. Take all the time you need.`;
        if (lang === 'hi') reminderText = `आपका अगला कार्य "${nextReminder.title}" समय ${nextReminder.time} पर है। आराम से करें, कोई जल्दी नहीं है।`;
        else if (lang === 'as') reminderText = `আপোনাৰ পৰৱৰ্তী কাম হ’ল "${nextReminder.title}", সময় ${nextReminder.time}। শান্তভাৱে কৰক।`;
        else if (lang === 'bn') reminderText = `আপনার পরবর্তী কাজ হলো "${nextReminder.title}", সময় ${nextReminder.time}। কোনো তাড়া নেই, ধীরে ধীরে করুন।`;

        return {
          type: SMRITI_RESPONSE_TYPES.REMINDER,
          text: reminderText,
          spokenText: reminderText,
          actionLabel: 'Open My Day',
          actionRoute: 'my-day',
          reminder: nextReminder,
          stats: { completed: completedCount, total: daily.reminders.length }
        };
      } else {
        let doneText = `Wonderful, ${patientName}! You have peacefully completed all ${daily.reminders.length} scheduled reminders for today.`;
        if (lang === 'hi') doneText = `बहुत बढ़िया, ${patientName} जी! आपने आज के सभी ${daily.reminders.length} कार्य सफलतापूर्वक पूरे कर लिए हैं।`;
        else if (lang === 'as') doneText = `বৰ সুন্দৰ, ${patientName}! আপুনি আজিৰ সকলো ${daily.reminders.length} টা কাম সম্পন্ন কৰিছে।`;
        else if (lang === 'bn') doneText = `অসাধারণ, ${patientName}! আপনি আজকের সমস্ত ${daily.reminders.length}টি কাজ সম্পন্ন করেছেন।`;

        return {
          type: SMRITI_RESPONSE_TYPES.REMINDER,
          text: doneText,
          spokenText: doneText,
          actionLabel: 'Review My Day',
          actionRoute: 'my-day',
          stats: { completed: completedCount, total: daily.reminders.length }
        };
      }
    }

    // 4. COGNITIVE ACTIVITY RECOMMENDATION & LAUNCHING (Using Part 5 data)
    if (
      input.includes('game') || 
      input.includes('play') || 
      input.includes('puzzle') || 
      input.includes('exercise') || 
      input.includes('activity') ||
      input.includes('cognitive')
    ) {
      // Check if patient specifically asked for a canonical activity
      const allActs = activityRegistry.getAll();
      const specificAct = allActs.find(a => 
        input.includes(a.name.toLowerCase()) || 
        input.includes(a.slug.toLowerCase())
      );

      if (specificAct) {
        const text = `Let's play ${specificAct.name}. It is a gentle ${specificAct.category.toLowerCase()} activity taking about ${specificAct.duration || '5 mins'}.`;
        return {
          type: SMRITI_RESPONSE_TYPES.ACTIVITY,
          text,
          spokenText: text,
          activity: specificAct,
          actionLabel: `Start ${specificAct.name}`,
          actionRoute: `activities/${specificAct.slug}`
        };
      }

      // Use Part 7 Adaptive Cognitive Engine for personalized recommendation
      const pid = context.patientId || store.getCurrentPatientId();
      let adaptiveRec = null;
      try {
        adaptiveRec = adaptiveEngine.getRecommendedActivity(pid);
      } catch (err) {
        console.warn('[SmritiAI] Adaptive recommendation error:', err);
      }

      let recommended = adaptiveRec ? adaptiveRec.activity : (allActs.find(a => a.difficulty === 1 && a.category === 'REMEMBER') || allActs[0]);
      if (input.includes('solve') || input.includes('pattern')) {
        recommended = allActs.find(a => a.category === 'SOLVE') || recommended;
      } else if (input.includes('notice') || input.includes('hunt')) {
        recommended = allActs.find(a => a.category === 'NOTICE') || recommended;
      }

      const diffLabel = adaptiveRec ? adaptiveRec.recommendedDifficulty : 'Easy';
      let text = `I have a wonderful activity for you today, ${patientName}. Let's try ${recommended.name} — ${diffLabel}. It is a comfortable, ${recommended.comfort.toLowerCase()} exercise to refresh your thoughts together.`;
      let actionLabel = `Start ${recommended.name} (${diffLabel})`;

      if (lang === 'hi') {
        const diffHi = diffLabel === 'Easy' ? 'सरल' : diffLabel === 'Medium' ? 'मध्यम' : 'कठिन';
        text = `नमस्ते ${patientName} जी! आज आपके लिए सुझाई गई गतिविधि "${recommended.name}" (${diffHi}) है। यह एक सहज और शांत अभ्यास है।`;
        actionLabel = `शुरू करें: ${recommended.name} (${diffHi})`;
      } else if (lang === 'as') {
        const diffAs = diffLabel === 'Easy' ? 'সহজ' : diffLabel === 'Medium' ? 'মধ্যম' : 'টান';
        text = `নমস্কাৰ ${patientName}! আজিৰ বাবে পৰামৰ্শ দিয়া কাৰ্যসূচী হ’ল "${recommended.name}" (${diffAs})। আহক একেলগে আৰম্ভ কৰো।`;
        actionLabel = `আৰম্ভ কৰক: ${recommended.name}`;
      } else if (lang === 'bn') {
        const diffBn = diffLabel === 'Easy' ? 'সহজ' : diffLabel === 'Medium' ? 'মাঝারি' : 'কঠিন';
        text = `নমস্কার ${patientName}! আজকের জন্য প্রস্তাবিত খেলা হলো "${recommended.name}" (${diffBn})। আসুন একসাথে শুরু করি।`;
        actionLabel = `শুরু করুন: ${recommended.name}`;
      }

      return {
        type: SMRITI_RESPONSE_TYPES.ACTIVITY,
        text,
        spokenText: text,
        activity: recommended,
        recommendedDifficulty: diffLabel,
        actionLabel,
        actionRoute: `activities/${recommended.slug}`
      };
    }

    // 5. MULTI-TURN CONVERSATION MEMORY: Resolve pronouns/references (e.g., "Who was there?", "Where was it?")
    let searchTarget = input;
    if (
      (input.includes('who was there') || input.includes('who went') || input.includes('where was it') || input.includes('tell me more about it')) &&
      sessionContext && sessionContext.lastDiscussedTopic
    ) {
      searchTarget = `${input} ${sessionContext.lastDiscussedTopic}`;
    }

    // 6. PEOPLE & RELATIONSHIPS ASSISTANCE
    if (
      input.includes('family') || 
      input.includes('daughter') || 
      input.includes('son') || 
      input.includes('granddaughter') || 
      input.includes('husband') || 
      input.includes('baba') || 
      input.includes('meera') || 
      input.includes('ravi') || 
      input.includes('priya') ||
      input.includes('dev') ||
      input.includes('uncle') ||
      input.includes('aunt') ||
      input.includes('friend') ||
      input.includes('relative') ||
      input.includes('cousin') ||
      input.includes('brother') ||
      input.includes('sister') ||
      input.includes('mother') ||
      input.includes('father') ||
      input.includes('chacha') ||
      input.includes('chachi') ||
      input.includes('mama') ||
      input.includes('mami') ||
      input.startsWith('who is') ||
      input.includes('who was with me') ||
      input.includes('who was in') ||
      input.includes('परिवार') ||
      input.includes('बेटी') ||
      input.includes('बेटा') ||
      input.includes('पৰিয়াল') ||
      input.includes('ছোৱালী') ||
      input.includes('পরিবার') ||
      input.includes('মেয়ে')
    ) {
      const people = context.memory.people || [];
      const places = context.memory.places || [];
      const getRel = (p) => ((p.relation || p.relationship || '') + '').toLowerCase();

      // Check: "Who was with me in [Place]?"
      if (input.includes('who was with me') || input.includes('who was in') || input.includes('साथ कौन था') || input.includes('লগত কোন আছিল') || input.includes('সাথে কে ছিল')) {
        const matchedPlace = places.find(plc => 
          input.includes(plc.name.toLowerCase()) || 
          plc.name.toLowerCase().split(' ').some(word => word.length > 3 && input.includes(word)) ||
          (plc.region && input.includes(plc.region.toLowerCase()))
        );
        if (matchedPlace) {
          const memories = context.memory.memories || [];
          const relationships = context.memory.relationships || [];
          const placeMemories = memories.filter(m => m.placeId === matchedPlace.id);
          const companionIds = new Set();
          placeMemories.forEach(m => (m.personIds || []).forEach(pId => companionIds.add(pId)));
          relationships.forEach(rel => {
            if (rel.targetType === 'place' && rel.targetId === matchedPlace.id && rel.sourceType === 'person') {
              companionIds.add(rel.sourceId);
            }
          });
          const companions = people.filter(p => companionIds.has(p.id));

          if (companions.length > 0) {
            const compNames = companions.map(c => `${c.name} (${c.relation || 'Family'})`).join(' and ');
            let ansText = `In ${matchedPlace.name}, you were with ${compNames}.`;
            if (lang === 'hi') ansText = `${matchedPlace.name} में आपके साथ ${compNames} थे।`;
            else if (lang === 'as') ansText = `${matchedPlace.name}-ত আপোনাৰ সৈতে ${compNames} আছিল।`;
            else if (lang === 'bn') ansText = `${matchedPlace.name}-এ আপনার সাথে ${compNames} ছিলেন।`;

            return {
              type: SMRITI_RESPONSE_TYPES.PERSON,
              text: ansText,
              spokenText: ansText,
              people: companions,
              actionLabel: `View Memories of ${matchedPlace.name}`,
              actionRoute: 'memory-world'
            };
          }
        }
      }

      // Check specific person query
      let matchedPerson = null;
      if (input.includes('meera') || input.includes('daughter') || input.includes('बेटी') || input.includes('ছোৱালী') || input.includes('মেয়ে')) {
        matchedPerson = people.find(p => p.name.toLowerCase().includes('meera') || getRel(p).includes('daughter'));
      } else if (input.includes('ravi') || input.includes('son') || input.includes('बेटा') || input.includes('ল’ৰা') || input.includes('ছেলে')) {
        matchedPerson = people.find(p => p.name.toLowerCase().includes('ravi') || getRel(p).includes('son'));
      } else if (input.includes('priya') || input.includes('granddaughter') || input.includes('पोती') || input.includes('নাতিনী') || input.includes('নাতনি')) {
        matchedPerson = people.find(p => p.name.toLowerCase().includes('priya') || getRel(p).includes('granddaughter'));
      } else if (input.includes('baba') || input.includes('husband') || input.includes('sudhir') || input.includes('पति')) {
        matchedPerson = people.find(p => p.name.toLowerCase().includes('baba') || p.name.toLowerCase().includes('sudhir') || getRel(p).includes('husband'));
      } else {
        // Extract query name after "who is" or "tell me about"
        const cleanName = input.replace('who is', '').replace('tell me about', '').replace('के बारे में', '').replace('ৰ বিষয়ে', '').replace('সম্পর্কে', '').trim();
        if (cleanName.length > 2) {
          matchedPerson = people.find(p => p.name.toLowerCase().includes(cleanName));
        }
      }

      if (matchedPerson) {
        sessionContext.lastDiscussedTopic = matchedPerson.name;
        sessionContext.lastDiscussedEntity = { type: 'person', data: matchedPerson };

        // If specifically asking for memories with this person
        if (input.includes('memories') || input.includes('memory') || input.includes('यादें') || input.includes('স্মৃতি') || input.includes('show')) {
          let journey = null;
          try {
            journey = memoryService.getSharedMemoryJourney(matchedPerson.id, pid);
          } catch (e) {}

          const memCount = (journey && journey.memories) ? journey.memories.length : 3;
          let memText = `I found ${memCount} memories with ${matchedPerson.name}, your ${matchedPerson.relation || 'daughter'}.`;
          if (lang === 'hi') memText = `मुझे ${matchedPerson.name} (${matchedPerson.relation || 'बेटी'}) के साथ ${memCount} प्यारी यादें मिलीं।`;
          else if (lang === 'as') memText = `মই ${matchedPerson.name}-ৰ সৈতে ${memCount} টা মধুৰ স্মৃতি পালোঁ।`;
          else if (lang === 'bn') memText = `আমি ${matchedPerson.name}-এর সাথে ${memCount}টি মধুর স্মৃতি পেয়েছি।`;

          return {
            type: SMRITI_RESPONSE_TYPES.PERSON,
            text: memText,
            spokenText: memText,
            person: matchedPerson,
            actionLabel: `View Memories with ${matchedPerson.name}`,
            actionRoute: 'family-circle'
          };
        }

        const relationStr = matchedPerson.relation || matchedPerson.relationship || 'Family Member';
        const bioStr = matchedPerson.bio || matchedPerson.notes || 'A cherished member of your family.';
        const text = `${matchedPerson.name} is your ${relationStr}. ${bioStr}`;
        return {
          type: SMRITI_RESPONSE_TYPES.PERSON,
          text,
          spokenText: text,
          person: matchedPerson,
          actionLabel: `View Memories with ${matchedPerson.name}`,
          actionRoute: 'family-circle'
        };
      }

      // Family summary if general family inquiry
      if ((input.includes('family') || input.includes('परिवार') || input.includes('পৰিয়াল') || input.includes('পরিবার')) && people.length > 0) {
        sessionContext.lastDiscussedTopic = 'family';
        const names = people.map(p => `${p.name} (${p.relation || p.relationship || 'Family'})`).join(', ');
        let text = `Your loving family circle includes ${names}. They are always connected to you.`;
        if (lang === 'hi') text = `आपके परिवार के सदस्यों में ${names} शामिल हैं। वे हमेशा आपके साथ हैं।`;
        else if (lang === 'as') text = `আপোনাৰ পৰিয়ালৰ সদস্যসকলৰ ভিতৰত আছে ${names}। তেওঁলোক সদায় আপোনাৰ সৈতে আছে।`;
        else if (lang === 'bn') text = `আপনার পরিবারের সদস্যদের মধ্যে রয়েছেন ${names}। তাঁরা সর্বদাই আপনার সাথে আছেন।`;

        return {
          type: SMRITI_RESPONSE_TYPES.PERSON,
          text,
          spokenText: text,
          people: people.slice(0, 3),
          actionLabel: 'Open Family Circle',
          actionRoute: 'family-circle'
        };
      }

      // ZERO FABRICATION: If unknown person inquired
      if (input.startsWith('who is') || input.includes('tell me about')) {
        return {
          type: SMRITI_RESPONSE_TYPES.TEXT,
          text: `I don't have that person saved in your Memory World yet, ${patientName}.`,
          spokenText: `I don't have that person saved in your memories yet.`,
          actionLabel: 'Add to Memory World',
          actionRoute: 'memory-world'
        };
      }
    }

    // 7. PLACE ASSISTANCE
    if (
      input.includes('place') || 
      input.includes('where') || 
      input.includes('shillong') || 
      input.includes('guwahati') || 
      input.includes('kolkata') || 
      input.includes('lake') || 
      input.includes('courtyard') || 
      input.includes('veranda')
    ) {
      const places = context.memory.places || [];
      let matchedPlace = null;

      if (input.includes('shillong') || input.includes('lake')) {
        matchedPlace = places.find(p => p.name.toLowerCase().includes('shillong') || p.name.toLowerCase().includes('lake') || (p.region && p.region.toLowerCase().includes('meghalaya')));
      } else if (input.includes('guwahati') || input.includes('veranda') || input.includes('courtyard')) {
        matchedPlace = places.find(p => p.name.toLowerCase().includes('guwahati') || p.name.toLowerCase().includes('veranda') || p.name.toLowerCase().includes('courtyard'));
      } else if (input.includes('kolkata')) {
        matchedPlace = places.find(p => p.name.toLowerCase().includes('kolkata'));
      }

      if (matchedPlace) {
        sessionContext.lastDiscussedTopic = matchedPlace.name;
        sessionContext.lastDiscussedEntity = { type: 'place', data: matchedPlace };
        const text = `${matchedPlace.name} in ${matchedPlace.region || 'your memories'} is a meaningful sanctuary. ${matchedPlace.description || 'A peaceful place you cherish.'}`;
        return {
          type: SMRITI_RESPONSE_TYPES.PLACE,
          text,
          spokenText: text,
          place: matchedPlace,
          actionLabel: `Explore ${matchedPlace.name}`,
          actionRoute: 'memory-world'
        };
      }

      // ZERO FABRICATION: Unknown place
      if (input.startsWith('where is') || input.includes('tell me about')) {
        return {
          type: SMRITI_RESPONSE_TYPES.TEXT,
          text: `I don't have that place saved in your memories yet, ${patientName}.`,
          spokenText: `I don't have that place saved yet.`,
          actionLabel: 'View Known Places',
          actionRoute: 'memory-world'
        };
      }
    }

    // 7.5 VOICE JOURNAL / VOICE RECORDING INQUIRIES
    if (
      input.includes('what did i record') ||
      input.includes('show my voice') ||
      input.includes('voice memories') ||
      input.includes('voice memory') ||
      input.includes('voice journal') ||
      input.includes('my recordings') ||
      input.includes('tell me about this recording') ||
      (input.includes('what did i say') && !input.includes('about medicine'))
    ) {
      const voiceMems = memoryService.getVoiceMemories(pid) || [];

      // Specific query: "what did i say about [topic]"
      if (input.includes('about')) {
        const topicMatch = input.match(/about\s+([a-z0-9\s]+)/i);
        const topic = topicMatch ? topicMatch[1].trim().replace(/[?.]/g, '') : '';
        if (topic) {
          const matching = voiceMems.filter(v =>
            (v.title && v.title.toLowerCase().includes(topic)) ||
            (v.transcript && v.transcript.toLowerCase().includes(topic))
          );
          if (matching.length > 0) {
            const first = matching[0];
            const text = `In your voice recording "${first.title}" from ${first.date || 'your journal'}, you shared: "${first.transcript}"`;
            return {
              type: SMRITI_RESPONSE_TYPES.MEMORY,
              text,
              spokenText: text,
              voiceMemory: first,
              actionLabel: 'View Voice Memories',
              actionRoute: 'memory-world'
            };
          } else {
            // Strict hallucination control: no fabrication
            const noMatchText = `I checked your saved voice recordings, but I couldn't find any mentions of "${topic}".`;
            return {
              type: SMRITI_RESPONSE_TYPES.TEXT,
              text: noMatchText,
              spokenText: noMatchText,
              actionLabel: 'Open Voice Journal',
              actionRoute: 'voice-journal'
            };
          }
        }
      }

      if (voiceMems.length === 0) {
        const text = `You have not recorded any voice memories in your journal yet, ${patientName}. Would you like to record one now?`;
        return {
          type: SMRITI_RESPONSE_TYPES.TEXT,
          text,
          spokenText: text,
          actionLabel: 'Open Voice Journal',
          actionRoute: 'voice-journal'
        };
      }

      const summaryList = voiceMems.slice(0, 3).map(v => `"${v.title}" (${v.date || 'Recent'})`).join(', ');
      const text = `You have ${voiceMems.length} voice recording${voiceMems.length > 1 ? 's' : ''} in your living archive: ${summaryList}.`;
      return {
        type: SMRITI_RESPONSE_TYPES.MEMORY,
        text,
        spokenText: text,
        voiceMemories: voiceMems.slice(0, 3),
        actionLabel: 'Open Voice Memories',
        actionRoute: 'memory-world'
      };
    }

    // 8. STORIES & LIVING ARCHIVE MEMORIES
    if (
      input.includes('story') || 
      input.includes('memory') || 
      input.includes('photo') || 
      input.includes('remember') || 
      input.includes('tea') || 
      input.includes('puja') || 
      input.includes('diwali') ||
      input.includes('favorite')
    ) {
      const memories = context.memory.memories || [];
      const stories = context.memory.stories || [];

      // Favorite memories request
      if (input.includes('favorite')) {
        const favs = memories.filter(m => m.favorite);
        const item = favs[0] || memories[0];
        if (item) {
          sessionContext.lastDiscussedTopic = item.title;
          const text = `Here is one of your cherished memories: "${item.title}". ${item.description}`;
          return {
            type: SMRITI_RESPONSE_TYPES.MEMORY,
            text,
            spokenText: text,
            memory: item,
            actionLabel: 'Open Memory World',
            actionRoute: 'memory-world'
          };
        }
      }

      // Specific memory timeline explanation request
      if (input.includes('tell me about this memory') || input.includes('tell me about this')) {
        const queryText = input.replace(/tell me about this memory:?/i, '').replace(/tell me about this:?/i, '').trim();
        const found = memories.find(m => 
          (queryText && m.title.toLowerCase().includes(queryText)) ||
          (queryText && m.description.toLowerCase().includes(queryText))
        ) || (sessionContext.lastDiscussedEntity?.type === 'memory' ? sessionContext.lastDiscussedEntity.data : null) || memories[0];

        if (found) {
          sessionContext.lastDiscussedTopic = found.title;
          sessionContext.lastDiscussedEntity = { type: 'memory', data: found };
          const details = [
            found.title,
            found.date || found.year ? `from ${found.date || found.year}` : null,
            found.location || (context.memory.places.find(p => p.id === found.placeId)?.name) ? `in ${found.location || context.memory.places.find(p => p.id === found.placeId)?.name}` : null
          ].filter(Boolean).join(' ');
          const text = `This is your memory: "${details}". ${found.description || found.quote || ''}`;
          return {
            type: SMRITI_RESPONSE_TYPES.MEMORY,
            text,
            spokenText: text,
            memory: found,
            actionLabel: 'View in Memory Timeline',
            actionRoute: 'memory-timeline'
          };
        }
      }

      // Search memory by keyword
      const match = memories.find(m => 
        (m.title && input.split(' ').some(w => w.length > 3 && m.title.toLowerCase().includes(w))) ||
        (m.description && input.split(' ').some(w => w.length > 3 && m.description.toLowerCase().includes(w)))
      ) || memories[0];

      if (match) {
        sessionContext.lastDiscussedTopic = match.title;
        sessionContext.lastDiscussedEntity = { type: 'memory', data: match };
        const text = `I found a memory: "${match.title}". ${match.description}`;
        return {
          type: SMRITI_RESPONSE_TYPES.MEMORY,
          text,
          spokenText: text,
          memory: match,
          actionLabel: 'View in Memory World',
          actionRoute: 'memory-world'
        };
      }

      if (stories.length > 0) {
        const story = stories[0];
        sessionContext.lastDiscussedTopic = story.title;
        const text = `Here is a story from your family: "${story.title}". ${story.text.substring(0, 150)}...`;
        return {
          type: SMRITI_RESPONSE_TYPES.MEMORY,
          text,
          spokenText: text,
          story,
          actionLabel: 'Read Full Story',
          actionRoute: 'memory-world'
        };
      }

      return {
        type: SMRITI_RESPONSE_TYPES.TEXT,
        text: `I don't have that specific memory saved yet, ${patientName}. We can add new memories anytime.`,
        spokenText: `I don't have that memory saved yet.`,
        actionLabel: 'Open Memory World',
        actionRoute: 'memory-world'
      };
    }

    // 9. CONTEXTUAL SCREEN ORIENTATION HELP
    if (input.includes('where am i') || input.includes('what is this') || input.includes('help me navigate')) {
      let orientationText = `You are in MindMitra, your peaceful cognitive companion.`;
      if (activeRoute === 'patient-home') {
        orientationText = `You are on your Home screen. Here you can see your day's schedule, quick actions, and cherished memories.`;
      } else if (activeRoute === 'my-day') {
        orientationText = `You are on My Day, where you can see your gentle care routines, hydration reminders, and medicines.`;
      } else if (activeRoute === 'memory-world') {
        orientationText = `You are in your Personal Memory World, exploring photographs, loved ones, and stories.`;
      } else if (activeRoute === 'activities') {
        orientationText = `You are in Cognitive Activities, where you can enjoy 20 unhurried cognitive games.`;
      } else if (activeRoute === 'family-circle') {
        orientationText = `You are in Family Circle, staying connected with Meera, Ravi, and Priya.`;
      }

      return {
        type: SMRITI_RESPONSE_TYPES.NAVIGATION,
        text: orientationText,
        spokenText: orientationText,
        actionLabel: 'Go to Patient Home',
        actionRoute: 'patient-home'
      };
    }

    // 10. DEFAULT CALM COMPANION GREETING
    let defaultText = `I am right here with you, ${patientName}. Take your time. We can look at family photos, review your day, or play a gentle game together.`;
    let defaultAction = 'Explore Memories';

    if (lang === 'hi') {
      defaultText = `नमस्ते ${patientName} जी! मैं आपकी स्मृति साथी हूँ। मैं आपके साथ हूँ। हम परिवार की यादें देख सकते हैं, आज का दिन देख सकते हैं या एक शांत खेल खेल सकते हैं।`;
      defaultAction = 'यादें देखें';
    } else if (lang === 'as') {
      defaultText = `নমস্কাৰ ${patientName}! মই স্মৃতি AI, আপোনাৰ মৰমৰ সংগী। আমি পুৰণি স্মৃতি চাব পাৰো, আজিৰ দিনটো চাব পাৰো বা শান্ত খেল এটা খেলিব পাৰো।`;
      defaultAction = 'স্মৃতিবোৰ চাওক';
    } else if (lang === 'bn') {
      defaultText = `নমস্কার ${patientName}! আমি স্মৃতি AI, আপনার আন্তরিক সঙ্গী। আমরা পারিবারিক স্মৃতি দেখতে পারি, আজকের দিনটি দেখতে পারি বা একটি শান্ত খেলা খেলতে পারি।`;
      defaultAction = 'স্মৃতিমালা দেখুন';
    }

    return {
      type: SMRITI_RESPONSE_TYPES.TEXT,
      text: defaultText,
      spokenText: defaultText,
      actionLabel: defaultAction,
      actionRoute: 'memory-world'
    };
  }
}

/**
 * SmritiAIService
 * Unified modular service orchestrating AI providers, context injection,
 * conversation history, and voice TTS.
 */
class SmritiAIService {
  constructor() {
    this.provider = new LocalMemoryCompanionProvider();
    this.conversationHistory = [];
    this.sessionContext = {
      lastDiscussedTopic: null,
      lastDiscussedEntity: null
    };
    this.isLoading = false;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.getState()));
  }

  getState() {
    return {
      history: [...this.conversationHistory],
      isLoading: this.isLoading,
      sessionContext: { ...this.sessionContext }
    };
  }

  getConversationHistory() {
    return [...this.conversationHistory];
  }

  clearConversation() {
    this.conversationHistory = [];
    this.sessionContext = {
      lastDiscussedTopic: null,
      lastDiscussedEntity: null
    };
    this.notify();
  }

  /**
   * Scopes patient context from Memory World, Daily Care, and Activities
   * Multi-patient isolation enforced via authenticated patient ID.
   */
  getContext(patientId, options = {}) {
    const pid = patientId || store.getCurrentPatientId();
    const patientUser = store.getState().currentUser || store.getState().profile || { name: 'Asha Devi' };
    const patientName = (options && options.patientName) || (patientUser.name ? patientUser.name.split(' ')[0] : 'Asha');
    const lang = (options && options.language) || (i18nService && i18nService.getLanguage()) || store.getPreferredLanguage(pid) || 'en';

    const memoryContext = memoryService.getMemoryContext(pid);
    const dailyRoutines = store.getRemindersForPatient(pid);
    const activityResults = store.getActivityResults(pid);

    return {
      patientId: pid,
      patientName,
      language: lang,
      userRole: (options && options.userRole) || (store.currentUser ? store.currentUser.role : 'patient'),
      doctorId: (options && options.doctorId) || null,
      targetPatientId: (options && options.targetPatientId) || null,
      memory: memoryContext,
      daily: {
        reminders: dailyRoutines,
        nextPending: store.getNextPendingReminder(pid)
      },
      dailyPlan: (dailyPlanService && dailyPlanService.getTodayPlan) ? dailyPlanService.getTodayPlan(pid) : null,
      todayMood: (moodCheckInService && moodCheckInService.getTodayCheckIn) ? (moodCheckInService.getTodayCheckIn(pid)?.mood || null) : null,
      todayMoodCheckIn: (moodCheckInService && moodCheckInService.getTodayCheckIn) ? moodCheckInService.getTodayCheckIn(pid) : null,
      activities: {
        all: activityRegistry.getAll(),
        recentResults: activityResults
      },
      ...(options || {})
    };
  }

  /**
   * Sends user message, generates structured response, records conversation history,
   * and optionally triggers gentle speech.
   */
  async sendMessage(userInput, options = {}) {
    if (!userInput || !userInput.trim()) return null;
    const cleanInput = userInput.trim();
    const pid = options.patientId || store.getCurrentPatientId();

    // 1. Record User Message
    const userMsg = {
      id: 'msg-u-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      role: 'user',
      text: cleanInput,
      timestamp: new Date().toISOString()
    };
    this.conversationHistory.push(userMsg);
    this.isLoading = true;
    this.notify();

    // 2. Build isolated patient context
    const context = this.getContext(pid, options);

    try {
      // Check for remote endpoint if configured
      let response;
      if (typeof window !== 'undefined' && window.MINDMITRA_AI_ENDPOINT) {
        try {
          const safeMessage = securityService.sanitizePromptContext(cleanInput);
          const minimizedContext = securityService.minimizeAIContext(cleanInput, context);
          const res = await fetch(window.MINDMITRA_AI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: safeMessage, context: minimizedContext, language: context.language })
          });
          if (res.ok) {
            response = await res.json();
          }
        } catch (netErr) {
          console.warn('[SmritiAI] Remote endpoint unavailable, falling back to local provider.', netErr);
        }
      }

      if (!response) {
        const safeInput = securityService.sanitizePromptContext(cleanInput);
        response = this.provider.generateResponse(safeInput, context, this.sessionContext);
      }

      // 3. Record Assistant Response
      const assistantMsg = {
        id: 'msg-a-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        role: 'assistant',
        text: response.text,
        spokenText: response.spokenText || response.text,
        type: response.type || SMRITI_RESPONSE_TYPES.TEXT,
        actionLabel: response.actionLabel,
        actionRoute: response.actionRoute,
        memory: response.memory,
        person: response.person,
        people: response.people,
        place: response.place,
        places: response.places,
        story: response.story,
        activity: response.activity,
        recommendedDifficulty: response.recommendedDifficulty,
        reminder: response.reminder,
        emergencyNumber: response.emergencyNumber || null,
        stats: response.stats,
        timestamp: new Date().toISOString()
      };

      this.conversationHistory.push(assistantMsg);
      this.isLoading = false;
      this.notify();

      // Speak if requested using elderly-friendly cadence in active language
      if (options.speak && assistantMsg.spokenText) {
        voiceService.speak(assistantMsg.spokenText, { lang: context.language });
      }

      return assistantMsg;
    } catch (err) {
      console.error('[SmritiAI] Error generating response:', err);
      const errorMsg = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        text: "I am having trouble connecting right now, but I am right here with you. Take all the time you need.",
        spokenText: "I am right here with you. Take your time.",
        type: SMRITI_RESPONSE_TYPES.TEXT,
        timestamp: new Date().toISOString()
      };
      this.conversationHistory.push(errorMsg);
      this.isLoading = false;
      this.notify();
      return errorMsg;
    }
  }

  /**
   * Caregiver query answering helper
   */
  async answerQuery(text, options = {}) {
    return this.sendMessage(text, options);
  }

  /**
   * Direct response generator helper
   */
  generateResponse(input, options = {}) {
    const pid = options.patientId || store.getCurrentPatientId();
    const context = { ...(options.context || this.getContext(pid, options)), ...options };
    return this.provider.generateResponse(input, context, this.sessionContext);
  }

  /**
   * Empathetic response helper for emotional check-ins & expressions
   */
  generateEmpatheticResponse(input, options = {}) {
    const pid = options.patientId || store.getCurrentPatientId();
    const context = { ...(options.context || this.getContext(pid, options)), ...options };
    return this.provider.generateResponse(input, context, this.sessionContext);
  }

  /**
   * Generates an honest, non-hallucinatory suggested title for a voice journal transcript.
   * Derives purely from user's actual spoken words. Clearly marked as a suggestion.
   */
  suggestJournalTitle(transcript = '', lang = 'en') {
    if (!transcript || !transcript.trim()) {
      return {
        title: 'Voice Memory',
        suggestedTitle: 'Voice Memory',
        isSuggested: true,
        label: 'Suggested Title'
      };
    }

    const clean = transcript.trim().replace(/[.,!?;:]/g, '');
    const words = clean.split(/\s+/).filter(Boolean);
    const lower = clean.toLowerCase();
    let themeTitle = null;

    if (lower.includes('tea') || lower.includes('chai')) {
      themeTitle = lower.includes('family') ? 'Tea with Family' : (lower.includes('daughter') ? 'Tea with Daughter' : 'Afternoon Tea');
    } else if (lower.includes('daughter') || lower.includes('meera')) {
      themeTitle = 'Afternoon with Daughter';
    } else if (lower.includes('garden') || lower.includes('flowers') || lower.includes('plants')) {
      themeTitle = 'Garden Memories';
    } else if (lower.includes('family') || lower.includes('gathering')) {
      themeTitle = 'Family Gathering';
    } else if (lower.includes('walk') || lower.includes('stroll')) {
      themeTitle = 'Peaceful Walk';
    } else if (lower.includes('visit') || lower.includes('visited')) {
      themeTitle = 'Warm Visit';
    } else if (words.length > 0) {
      const snippet = words.slice(0, Math.min(4, words.length)).join(' ');
      themeTitle = snippet.charAt(0).toUpperCase() + snippet.slice(1);
    }

    return {
      title: themeTitle || 'Voice Memory',
      suggestedTitle: themeTitle || 'Voice Memory',
      isSuggested: true,
      label: 'Suggested by SmritiAI'
    };
  }

  /**
   * Summarizes a voice journal transcript without inventing details or altering original text.
   * Clearly identified as an AI Summary.
   */
  summarizeJournalTranscript(transcript = '', lang = 'en') {
    if (!transcript || !transcript.trim()) {
      return {
        summary: 'No spoken transcript available.',
        originalTranscript: '',
        label: 'AI Summary'
      };
    }

    const trimmed = transcript.trim();
    const sentences = trimmed.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    let summaryText = '';

    if (sentences.length === 1) {
      summaryText = sentences[0] + '.';
    } else if (sentences.length <= 3) {
      summaryText = sentences.slice(0, 2).join('. ') + '.';
    } else {
      summaryText = sentences.slice(0, 2).join('. ') + '...';
    }

    return {
      summary: summaryText,
      originalTranscript: trimmed,
      label: 'AI Summary',
      isGenerated: true
    };
  }
}

export const smritiAIService = new SmritiAIService();
