// MindMitra Centralized Security & Privacy Service
// Comprehensive defense-in-depth: XSS Sanitization, Input Validation,
// Role & Patient Authorization, Prompt Injection Defense, Context Minimization,
// Safe File Upload Validation, and Privacy-Safe Logging.

export class SecurityService {
  constructor() {
    this.maxMemoryTitleLength = 120;
    this.maxStoryLength = 4000;
    this.maxNameLength = 80;
    this.maxNoteLength = 1000;
  }

  /**
   * Encodes HTML special characters to prevent cross-site scripting (XSS)
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    const s = String(str);
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitizes string for safe rendering in HTML templates
   */
  sanitizeHtml(str) {
    return this.escapeHtml(str);
  }

  /**
   * Neutralizes CSV Formula Injection (DDE) in exported reports.
   * If a value starts with '=', '+', '-', '@', '\t', or '\r', it is prefixed with a single quote.
   */
  sanitizeCsvValue(val) {
    if (val === null || val === undefined) return '';
    let str = String(val).trim();
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }
    return str.replace(/"/g, '""');
  }

  /**
   * Comprehensive input validation for names, emails, passwords, phones, and text
   */
  validateInput(type, value, options = {}) {
    if (value === null || value === undefined) {
      if (options.required) return { valid: false, error: `${type} is required.` };
      return { valid: true, value: '' };
    }

    const str = String(value).trim();
    if (options.required && !str) {
      return { valid: false, error: `${type} is required.` };
    }

    switch (type) {
      case 'email': {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (str && !emailRegex.test(str)) {
          return { valid: false, error: 'Please enter a valid email address.' };
        }
        if (str.length > 254) {
          return { valid: false, error: 'Email address is too long.' };
        }
        return { valid: true, value: str.toLowerCase() };
      }

      case 'password': {
        const minLen = options.minLength || 6;
        if (str.length < minLen) {
          return { valid: false, error: `Password must be at least ${minLen} characters long.` };
        }
        if (str.length > 128) {
          return { valid: false, error: 'Password is too long (maximum 128 characters).' };
        }
        return { valid: true, value: str };
      }

      case 'name': {
        if (str.length < 2) {
          return { valid: false, error: 'Name must be at least 2 characters.' };
        }
        if (str.length > this.maxNameLength) {
          return { valid: false, error: `Name cannot exceed ${this.maxNameLength} characters.` };
        }
        // Reject suspicious control characters
        if (/[\x00-\x1F\x7F]/.test(str)) {
          return { valid: false, error: 'Name contains invalid characters.' };
        }
        return { valid: true, value: str };
      }

      case 'phone': {
        // Strip common formatting
        const cleanDigits = str.replace(/[\s\-().+]/g, '');
        if (str && (cleanDigits.length < 3 || cleanDigits.length > 15 || !/^\d+$/.test(cleanDigits))) {
          return { valid: false, error: 'Please enter a valid phone number.' };
        }
        return { valid: true, value: str };
      }

      case 'memoryTitle': {
        if (str.length < 1) {
          return { valid: false, error: 'Memory title cannot be empty.' };
        }
        if (str.length > this.maxMemoryTitleLength) {
          return { valid: false, error: `Memory title cannot exceed ${this.maxMemoryTitleLength} characters.` };
        }
        return { valid: true, value: str };
      }

      case 'story': {
        if (str.length > this.maxStoryLength) {
          return { valid: false, error: `Story content exceeds ${this.maxStoryLength} characters.` };
        }
        return { valid: true, value: str };
      }

      default:
        return { valid: true, value: str };
    }
  }

  /**
   * Authorization check: Can the given user access patient data?
   * Patients can only access their own data.
   * Caregivers can access only explicitly authorized patients.
   */
  canAccessPatient(user, patientId) {
    if (!user || !patientId) return false;
    const uid = user.id || user.userId;
    const targetPid = String(patientId);

    if (user.role === 'patient') {
      return uid === targetPid || uid === 'user-asha' && (targetPid === 'user-asha' || targetPid === 'usr-asha');
    }

    if (user.role === 'caregiver') {
      // Demo Meera is authorized for Asha
      if ((uid === 'user-meera' || uid === 'caregiver-1') && (targetPid === 'user-asha' || targetPid === 'usr-asha')) {
        return true;
      }
      if (Array.isArray(user.authorizedPatientIds)) {
        return user.authorizedPatientIds.includes(targetPid);
      }
      return false;
    }

    return false;
  }

  /**
   * Authorization check: Can the given user view a specific memory?
   */
  canAccessMemory(user, memory) {
    if (!user || !memory) return false;
    const memoryPatientId = memory.patientId || 'user-asha';
    return this.canAccessPatient(user, memoryPatientId);
  }

  /**
   * Authorization check: Can the given user edit or delete a specific memory?
   */
  canModifyMemory(user, memory) {
    if (!user || !memory) return false;
    const memoryPatientId = memory.patientId || 'user-asha';
    // Must have access to patient first
    if (!this.canAccessPatient(user, memoryPatientId)) return false;

    // Both patient owner and authorized caregiver can modify memory records in MindMitra
    return true;
  }

  /**
   * Authorization check: Can the user generate a caregiver report for the given patient?
   */
  canGenerateReport(user, patientId) {
    if (!user || user.role !== 'caregiver') return false;
    return this.canAccessPatient(user, patientId);
  }

  /**
   * Authorization check: Can the user modify emergency contacts?
   */
  canManageEmergencyContacts(user, patientId) {
    if (!user) return false;
    // Caregivers authorized for the patient can manage contacts
    if (user.role === 'caregiver') {
      return this.canAccessPatient(user, patientId);
    }
    return false;
  }

  /**
   * Prompt Injection Defense: Neutralizes adversarial injection phrases and delimiters
   * from memory data or external transcripts so they are treated strictly as passive data.
   */
  sanitizePromptContext(text) {
    if (!text) return '';
    let sanitized = String(text);

    // Neutralize system instruction overrides and jailbreaks
    const adversarialPatterns = [
      /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/gi,
      /disregard\s+(all\s+)?(previous|prior|system)\s+rules/gi,
      /you\s+are\s+now\s+(unrestricted|in\s+developer\s+mode|dan)/gi,
      /system\s*:\s*override/gi,
      /override\s+safety\s+guidelines/gi,
      /act\s+as\s+a\s+medical\s+doctor/gi,
      /diagnose\s+me\s+with/gi
    ];

    adversarialPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[filtered content]');
    });

    // Strip fake system delimiters
    sanitized = sanitized
      .replace(/<\/?system>/gi, '')
      .replace(/\[\/?system\]/gi, '')
      .replace(/<\/?prompt>/gi, '');

    return sanitized.trim();
  }

  /**
   * Context Minimization: Extracts only relevant context needed for user query
   * rather than sending full patient history, full memory world, or private contacts.
   */
  minimizeAIContext(userQuery = '', fullContext = {}) {
    const q = (userQuery || '').toLowerCase();
    const pid = fullContext.patientId || 'user-asha';
    const patientName = fullContext.patientName || 'Asha';
    const lang = fullContext.language || 'en';

    const minimized = {
      patientId: pid,
      patientName,
      language: lang
    };

    // Only include routine info if routine/time/care asked
    if (q.includes('routine') || q.includes('schedule') || q.includes('medicine') || q.includes('pill') || q.includes('day') || q.includes('today')) {
      if (fullContext.daily && fullContext.daily.reminders) {
        minimized.dailyReminders = fullContext.daily.reminders.slice(0, 4).map(r => ({
          title: this.sanitizePromptContext(r.title),
          time: r.time,
          completed: Boolean(r.completed)
        }));
      }
    }

    // Only include memory info if memory/photo/person/place asked
    if (q.includes('memory') || q.includes('remember') || q.includes('photo') || q.includes('who') || q.includes('shillong') || q.includes('tea') || q.includes('family')) {
      if (fullContext.memory && fullContext.memory.memories) {
        minimized.memories = fullContext.memory.memories.slice(0, 3).map(m => ({
          id: m.id,
          title: this.sanitizePromptContext(m.title),
          category: m.category,
          year: m.year
        }));
      }
      if (fullContext.memory && fullContext.memory.people) {
        minimized.people = fullContext.memory.people.slice(0, 3).map(p => ({
          name: this.sanitizePromptContext(p.name),
          relation: p.relation
        }));
      }
    }

    // Only include activity info if games/practice/puzzles asked
    if (q.includes('game') || q.includes('activity') || q.includes('practice') || q.includes('puzzle')) {
      if (fullContext.activities && fullContext.activities.recentResults) {
        minimized.recentActivities = fullContext.activities.recentResults.slice(0, 3).map(a => ({
          activityTitle: a.activityTitle,
          difficulty: a.difficulty
        }));
      }
    }

    return minimized;
  }

  /**
   * File upload validator: restricts file types to safe images & audio, validates size,
   * extensions, and produces safe sanitised filenames.
   */
  validateUpload(file) {
    if (!file) return { valid: false, error: 'No file selected.' };

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/webm',
      'audio/ogg'
    ];

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp3', '.wav', '.webm', '.ogg'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    const filename = file.name || 'unnamed';
    const ext = filename.lastIndexOf('.') !== -1 ? filename.substring(filename.lastIndexOf('.')).toLowerCase() : '';

    if (!allowedExtensions.includes(ext)) {
      return { valid: false, error: `Unsupported file extension (${ext}). Allowed: JPG, PNG, WebP, MP3, WAV, WebM.` };
    }

    if (file.type && !allowedMimeTypes.includes(file.type.toLowerCase())) {
      return { valid: false, error: `Invalid file type (${file.type}). Only photos and voice recordings are supported.` };
    }

    if (file.size && file.size > maxSizeBytes) {
      return { valid: false, error: 'File exceeds 10MB limit. Please choose a smaller file.' };
    }

    // Generate safe alphanumeric filename
    const safeBase = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_').substring(0, 40);
    const safeFilename = `mm_${Date.now()}_${safeBase}`;

    return {
      valid: true,
      safeFilename,
      sanitizedName: safeBase
    };
  }

  /**
   * Safe filename generation for exported reports without leaking patient private data
   */
  generateSafeReportFilename(patientId, reportType = 'report', dateStr = null) {
    const d = dateStr || new Date().toISOString().slice(0, 10);
    const safePid = String(patientId || 'patient').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 16);
    return `mindmitra-${reportType}-${safePid}-${d}.csv`;
  }
}

export const securityService = new SecurityService();

/**
 * SecurityLogger: Redacts sensitive passwords, tokens, full transcripts, and PII before output
 */
export const securityLogger = {
  redact(obj) {
    if (!obj) return obj;
    if (typeof obj === 'string') {
      return obj
        .replace(/(password|token|secret|pin|authorization)=([^&]+)/gi, '$1=[REDACTED]')
        .replace(/"(password|token|secret|pin)":\s*"[^"]+"/gi, '"$1":"[REDACTED]"');
    }
    if (typeof obj === 'object') {
      try {
        const copy = JSON.parse(JSON.stringify(obj));
        const sanitizeKeys = (target) => {
          if (!target || typeof target !== 'object') return;
          for (const k of Object.keys(target)) {
            if (['password', 'pin', 'token', 'secret', 'authorization'].includes(k.toLowerCase())) {
              target[k] = '[REDACTED]';
            } else if (typeof target[k] === 'object') {
              sanitizeKeys(target[k]);
            }
          }
        };
        sanitizeKeys(copy);
        return copy;
      } catch (e) {
        return '[Object with complex structure]';
      }
    }
    return obj;
  },

  log(...args) {
    const redacted = args.map(a => this.redact(a));
    console.log('[MindMitra SafeLog]', ...redacted);
  },

  warn(...args) {
    const redacted = args.map(a => this.redact(a));
    console.warn('[MindMitra SafeWarn]', ...redacted);
  },

  error(...args) {
    const redacted = args.map(a => this.redact(a));
    console.error('[MindMitra SafeError]', ...redacted);
  }
};
