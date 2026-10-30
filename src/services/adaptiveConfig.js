// Centralized Configuration for Adaptive Cognitive Engine
// Strictly Rule-Based, Personalized Cognitive Engagement Safeguards

export const ADAPTIVE_CONFIG = {
  // Number of completed sessions required before making any difficulty change
  MIN_SESSIONS_FOR_ADAPTATION: 3,

  // Performance thresholds for gradual progression
  HIGH_PERFORMANCE_ACCURACY: 85,    // Consistent accuracy >= 85% with minimal hints indicates comfort
  LOW_PERFORMANCE_ACCURACY: 60,     // Consistent accuracy < 60% indicates need for more gentle support

  // Assistance tolerances
  MAX_HINTS_TOLERANCE_FOR_UPGRADE: 1, // Max hints allowed in streak to qualify for difficulty increase
  MAX_MISTAKES_FOR_UPGRADE: 1,        // Max mistakes allowed in streak to qualify for difficulty increase
  MISTAKES_THRESHOLD_FOR_DOWNGRADE: 2, // Repeated mistakes triggering gentler pacing
  HINTS_THRESHOLD_FOR_DOWNGRADE: 2,    // Repeated hints triggering gentler pacing

  // Step progression: Strictly 1 step at a time
  DIFFICULTY_STEP_SIZE: 1,

  // Difficulty boundaries
  MIN_DIFFICULTY: 1, // Easy
  MAX_DIFFICULTY: 3, // Hard

  // Difficulty names
  DIFFICULTY_LABELS: {
    1: 'Easy',
    2: 'Medium',
    3: 'Hard'
  },

  // Inverted mapping for string lookup
  DIFFICULTY_VALUES: {
    'easy': 1,
    'medium': 2,
    'hard': 3
  },

  // Categories tracked
  CATEGORIES: [
    'REMEMBER',
    'NOTICE',
    'SOLVE',
    'SEQUENCE',
    'EXPLORE',
    'CONNECT'
  ],

  // Activity-Specific Scaling Configurations
  ACTIVITY_SCALING: {
    'act-1': { // Memory Match
      1: { pairs: 4, label: '4 Pairs' },
      2: { pairs: 6, label: '6 Pairs' },
      3: { pairs: 8, label: '8 Pairs' }
    },
    'act-6': { // Attention Hunt
      1: { targets: 3, distractors: 2, label: '3 Targets / Low Distraction' },
      2: { targets: 4, distractors: 4, label: '4 Targets / Moderate Distraction' },
      3: { targets: 5, distractors: 6, label: '5 Targets / High Distraction' }
    },
    'act-14': { // Shopping Memory
      1: { items: 3, label: '3 Items' },
      2: { items: 5, label: '5 Items' },
      3: { items: 7, label: '7 Items' }
    },
    'act-12': { // Story Sequence
      1: { steps: 3, label: '3 Steps' },
      2: { steps: 4, label: '4 Steps' },
      3: { steps: 5, label: '5 Steps' }
    },
    'act-9': { // Pattern Predictor
      1: { complexity: 'simple-repeat', label: 'Simple Repeating Pattern' },
      2: { complexity: 'two-variable', label: 'Two-Variable Pattern' },
      3: { complexity: 'alternating-cadence', label: 'Alternating Cadence' }
    },
    'act-10': { // Object Sorting
      1: { categories: 2, items: 4, label: '2 Categories' },
      2: { categories: 3, items: 6, label: '3 Categories' },
      3: { categories: 4, items: 8, label: '4 Categories' }
    }
  }
};
