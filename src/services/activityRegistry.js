// Centralized Activity Registry for all 20 Canonical MindMitra Activities with Rich Mini-Game Mechanics
import { memoryService, FALLBACK_MEMORY_IMAGE } from './memoryService.js';

export const ACTIVITY_CATEGORIES = [
  'All',
  'REMEMBER',
  'NOTICE',
  'SOLVE',
  'SEQUENCE',
  'EXPLORE',
  'CONNECT'
];

export const CANONICAL_ACTIVITIES = [
  // ==========================================
  // 1. REMEMBER
  // ==========================================
  {
    id: 'act-1',
    slug: 'memory-match',
    name: 'Memory Match',
    title: 'Memory Match',
    category: 'REMEMBER',
    icon: 'view_module',
    subtitle: 'Pairing familiar family faces and cherished keepsake tokens',
    description: 'Remember positions and match related cards with calm, patient-paced reveal.',
    estimatedDuration: '4 mins',
    duration: '4 mins',
    comfort: 'Serene',
    difficulty: 1,
    instructions: 'Look at each pair gently. Tap any card to reveal it and find its matching partner.',
    accessibilityLabel: 'Memory Match card pairing activity',
    activityType: 'match',
    gameMechanic: 'card-matching',
    requiredMemoryContext: false,
    availableModes: ['tap', 'cards'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw',
    locationStamp: 'Kolkata Veranda & Home Album',
    contextStamp: 'Family Portraits Pairing',
    albumRef: 'MM-MATCH-01',
    question: 'Match the photograph of Meera with her cherished family role:',
    hint: 'She visits you every morning and checked your blood pressure today.',
    options: [
      { id: 'opt-1a', letter: 'A', title: 'Meera, your loving daughter', subtitle: 'Primary caregiver living in Sector 4', correct: true },
      { id: 'opt-1b', letter: 'B', title: 'Dr. Sen', subtitle: 'Your dentist in Guwahati', correct: false },
      { id: 'opt-1c', letter: 'C', title: 'Sunita', subtitle: 'Veranda neighbor from Kolkata', correct: false }
    ],
    // Difficulty decks
    matchPairsEasy: [
      { id: 'pair-1', title: 'Meera', matchId: 'pair-1-m', matchTitle: 'Daughter', icon: 'face_3' },
      { id: 'pair-2', title: 'Parijat', matchId: 'pair-2-m', matchTitle: 'Jasmine Flower', icon: 'local_florist' },
      { id: 'pair-3', title: 'Brass Diya', matchId: 'pair-3-m', matchTitle: 'Evening Prayer', icon: 'lightbulb' },
      { id: 'pair-4', title: 'Tulsi Tea', matchId: 'pair-4-m', matchTitle: 'Morning Cup', icon: 'emoji_food_beverage' }
    ],
    matchPairsMedium: [
      { id: 'pair-1', title: 'Meera', matchId: 'pair-1-m', matchTitle: 'Daughter', icon: 'face_3' },
      { id: 'pair-2', title: 'Parijat', matchId: 'pair-2-m', matchTitle: 'Jasmine Flower', icon: 'local_florist' },
      { id: 'pair-3', title: 'Brass Diya', matchId: 'pair-3-m', matchTitle: 'Evening Prayer', icon: 'lightbulb' },
      { id: 'pair-4', title: 'Tulsi Tea', matchId: 'pair-4-m', matchTitle: 'Morning Cup', icon: 'emoji_food_beverage' },
      { id: 'pair-5', title: 'Priya', matchId: 'pair-5-m', matchTitle: 'Granddaughter', icon: 'school' },
      { id: 'pair-6', title: 'Umiam Lake', matchId: 'pair-6-m', matchTitle: 'Pine Hills', icon: 'water' }
    ],
    matchPairsHard: [
      { id: 'pair-1', title: 'Meera', matchId: 'pair-1-m', matchTitle: 'Daughter', icon: 'face_3' },
      { id: 'pair-2', title: 'Parijat', matchId: 'pair-2-m', matchTitle: 'Jasmine Flower', icon: 'local_florist' },
      { id: 'pair-3', title: 'Brass Diya', matchId: 'pair-3-m', matchTitle: 'Evening Prayer', icon: 'lightbulb' },
      { id: 'pair-4', title: 'Tulsi Tea', matchId: 'pair-4-m', matchTitle: 'Morning Cup', icon: 'emoji_food_beverage' },
      { id: 'pair-5', title: 'Priya', matchId: 'pair-5-m', matchTitle: 'Granddaughter', icon: 'school' },
      { id: 'pair-6', title: 'Umiam Lake', matchId: 'pair-6-m', matchTitle: 'Pine Hills', icon: 'water' },
      { id: 'pair-7', title: 'Ravi', matchId: 'pair-7-m', matchTitle: 'Son (Bangalore)', icon: 'call' },
      { id: 'pair-8', title: 'Ochre Shawl', matchId: 'pair-8-m', matchTitle: 'Warm Handloom', icon: 'checkroom' }
    ]
  },

  {
    id: 'act-2',
    slug: 'personal-memory-recall',
    name: 'Personal Memory Recall',
    title: 'Personal Memory Recall',
    category: 'REMEMBER',
    icon: 'photo_library',
    subtitle: 'A familiar walk through the tea gardens of Shillong',
    description: 'Recall a meaningful personal memory with real photos, people, and inspectable clues.',
    estimatedDuration: '5 mins',
    duration: '5 mins',
    comfort: 'Serene',
    difficulty: 1,
    instructions: 'Tap each clue card around the photo to reveal details, then answer the gentle question.',
    accessibilityLabel: 'Personal Memory Recall interactive exploration',
    activityType: 'clue-recall',
    gameMechanic: 'clue-investigation',
    requiredMemoryContext: true,
    availableModes: ['guided', 'interactive'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4eGyiljLtDN1mv8-shNH3o6kdWjH4fRs9WVMb6mAj3IOXFoO-YOlzUBw034lYelDl7eJfjC5cjaFCXWbNB2sjEYqBNr6_nyqYxGiwQOyo6iaU05Sap25BvO5ME0tVgTy6b19X8UWEHJ9wOhfBuaKMCFENNaY2Dtj7U-0CtVf7SYk2HAQfuLj-pLE7FpzrMNsdvNgAKR1xGT5E2zsC540N3FvvL71BUJkLhgD-0XqgATUGWZ0x1VNv',
    locationStamp: "Ward's Lake & Pine Ridge, Shillong (Autumn 2018)",
    contextStamp: 'Family Autumn Trip with Daughter Meera',
    albumRef: 'MM-SHL-18',
    question: 'Who joined you for hot tea during your 2018 visit to the Shillong pine hills?',
    hint: 'She wore a yellow handloom kurta and drove with you from Guwahati by road.',
    options: [
      { id: 'meera', letter: 'A', title: 'Meera, your daughter', subtitle: 'Traveled together from Guwahati by road', correct: true },
      { id: 'sunita', letter: 'B', title: 'Sunita, your neighbor', subtitle: 'Morning tea companion at home in Kolkata', correct: false },
      { id: 'barua', letter: 'C', title: 'Dr. Barua', subtitle: 'Your longtime family physician', correct: false }
    ],
    recallClues: [
      { id: 'clue-who', icon: 'face_3', label: 'Companion', detail: 'Daughter Meera (Drove by road from Guwahati)' },
      { id: 'clue-where', icon: 'location_on', label: 'Sanctuary', detail: "Ward's Lake wooden tea stall by the pines" },
      { id: 'clue-garment', icon: 'checkroom', label: 'Attire', detail: 'Warm Ochre Handloom Shawl with border' },
      { id: 'clue-scent', icon: 'emoji_food_beverage', label: 'Fragrance', detail: 'Steaming ginger cardamom spiced chai' }
    ]
  },

  {
    id: 'act-3',
    slug: 'people-relationships',
    name: 'People & Relationships',
    title: 'People & Relationships',
    category: 'REMEMBER',
    icon: 'groups',
    subtitle: 'Connecting family members to their special bonds',
    description: 'Connect loved ones with their known relationships and shared memories.',
    estimatedDuration: '5 mins',
    duration: '5 mins',
    comfort: 'Comfortable',
    difficulty: 1,
    instructions: 'Tap a family member on the left, then tap their loving relationship on the right to connect them.',
    accessibilityLabel: 'People and Relationships connection activity',
    activityType: 'relation-match',
    gameMechanic: 'relationship-connect',
    requiredMemoryContext: true,
    availableModes: ['connect', 'tap'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB18GOO50aNeIlri76fwryQuEtY2N9ji_Al90UKxFEVSRIRR8_rHr2eOvFWPeIrYGz2IR4aghat-FOV8AYS7K2mcpEWDnFMiEbfEUNMP-_ejqSihdmVkl7j11R46Pf3YnXig-LKAq13VJupcbaJX68YpjU9_ivJ75F6vNzZOT0SGH9RXdWixuvFdXZOfJNFxgN1zT2z_McN5YTFRXaXW8A0tV8BwqOo47BdWucEF_PmUmxAOIJ8Jf-E',
    locationStamp: 'Delhi & Guwahati Connection',
    contextStamp: 'Granddaughter Bond',
    albumRef: 'MM-PPL-03',
    question: "Who whispered 'Dida, this university degree is for your courage'?",
    hint: 'Your granddaughter who is calling you today at 4:00 PM.',
    options: [
      { id: 'opt-3a', letter: 'A', title: 'Priya, your granddaughter', subtitle: 'Completed her graduation honors in Delhi', correct: true },
      { id: 'opt-3b', letter: 'B', title: 'Ravi, your son', subtitle: 'Working in Bangalore', correct: false },
      { id: 'opt-3c', letter: 'C', title: 'Ruma, your sister', subtitle: 'Living in Siliguri', correct: false }
    ],
    relationCards: [
      { id: 'p-meera', name: 'Meera', role: 'Daughter & Primary Caregiver', icon: 'face_3' },
      { id: 'p-priya', name: 'Priya', role: 'Granddaughter (University Honors)', icon: 'school' },
      { id: 'p-ravi', name: 'Ravi', role: 'Son (Calling from Bangalore)', icon: 'call' },
      { id: 'p-baba', name: 'Baba', role: 'Beloved Husband (Rabindrasangeet)', icon: 'music_note' }
    ]
  },

  {
    id: 'act-4',
    slug: 'photo-story',
    name: 'Photo Story',
    title: 'Photo Story',
    category: 'REMEMBER',
    icon: 'auto_stories',
    subtitle: 'Arranging cherished photographs into a happy storyline',
    description: 'Use a personal photo and memory to recall context and create a calm story.',
    estimatedDuration: '6 mins',
    duration: '6 mins',
    comfort: 'Joyful',
    difficulty: 2,
    instructions: 'Place the story moments into timeline order to build the memory story.',
    accessibilityLabel: 'Photo Story interactive timeline builder',
    activityType: 'story-builder',
    gameMechanic: 'story-puzzle',
    requiredMemoryContext: true,
    availableModes: ['timeline', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBT8_4ySDVkudWjVdrx95ANqeipj8foA9zXh_t0TzofsO37yIYeRBco-LPW3itV6rxzPk8R-_mVUO8D2HwTDZdJ09Jfn8_1VSWN4GLLvbFKVKK7P-pONdgbqyn-ylzcaMl6MokfZDOy2RT82oQTPHZoXGnds9-Ks-M-ji3KBGVCu6WoEwnuRwZqqcCfeLheOhZwNJGTBsnssvVuB2nXhYqhfHayUFcBz715cL2gNrbyNffapMAUG7H5',
    locationStamp: 'Kolkata Puja Mandap (2021)',
    contextStamp: 'Autumn Celebrations',
    albumRef: 'MM-STORY-04',
    question: 'Which event took place when the grandchildren lit the brass lamps with you?',
    hint: 'The grand autumn celebration with traditional dhak drums.',
    options: [
      { id: 'opt-4a', letter: 'A', title: 'Durga Puja evening celebration', subtitle: 'Family gathering with hand-stitched saris and sweets', correct: true },
      { id: 'opt-4b', letter: 'B', title: 'New Year picnic at the lake', subtitle: 'Outdoor boat ride', correct: false },
      { id: 'opt-4c', letter: 'C', title: 'Sunday morning market walk', subtitle: 'Buying fresh ginger and vegetables', correct: false }
    ],
    storyTiles: [
      { id: 'st-1', order: 1, title: 'Family arrived at Kolkata Mandap in festive saris', icon: 'temple_hindu' },
      { id: 'st-2', order: 2, title: 'Grandchildren helped light the brass Panchpradip lamp', icon: 'lightbulb' },
      { id: 'st-3', order: 3, title: 'Asha gave warm blessings and shared homemade pithe sweets', icon: 'cake' }
    ]
  },

  {
    id: 'act-5',
    slug: 'memory-reconstruction',
    name: 'Memory Reconstruction',
    title: 'Memory Reconstruction',
    category: 'REMEMBER',
    icon: 'extension',
    subtitle: 'Assembling keepsake memories of the ancestral courtyard',
    description: 'Reconstruct a memory from multiple pieces: person, place, event, and story.',
    estimatedDuration: '5 mins',
    duration: '5 mins',
    comfort: 'Serene',
    difficulty: 2,
    instructions: 'Tap each puzzle piece below to slot it into the courtyard keepsake frame.',
    accessibilityLabel: 'Memory Reconstruction puzzle assembly',
    activityType: 'puzzle-assembly',
    gameMechanic: 'memory-assembly',
    requiredMemoryContext: true,
    availableModes: ['assembly', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC22wvw0W6QPHS8HfYaEOvuhq3Z64L-LQ6C1Z6eABAuUst6_l0OsfnmESMEWZ3fOFlMGTNXKIDrEe2homASLswMtPqjKeAK5WTQyyneikgGu2NA2GA2tua6IzQ06V31A6_ZE6MzpmFcc5CpWrWaM9xsVn4D61l2PH_TeJ8vhbEWPYhzZSPIbcf2-cSpbse6Gx0UOAqgXHXc3yJULQweZ3c2gM2IQY8iHR1kqA2dh4WS1M6_uoNat6Ja',
    locationStamp: 'Guwahati Old Town, Assam',
    contextStamp: 'Ancestral Home Keepsake',
    albumRef: 'MM-RECON-05',
    question: 'What flower tree bloomed fragrant white petals in the ancestral courtyard?',
    hint: 'Its blossoms fall overnight and perfume the morning veranda.',
    options: [
      { id: 'opt-5a', letter: 'A', title: 'Night Jasmine (Parijat)', subtitle: 'Sweet white flowers with delicate orange stems', correct: true },
      { id: 'opt-5b', letter: 'B', title: 'Gulmohar', subtitle: 'Bright red summer blooms', correct: false },
      { id: 'opt-5c', letter: 'C', title: 'Bougainvillea', subtitle: 'Thorny pink climber', correct: false }
    ],
    puzzleSlots: [
      { id: 'slot-1', slotLabel: 'Ancestral Setting', title: 'Old Guwahati Courtyard', icon: 'cottage' },
      { id: 'slot-2', slotLabel: 'Sacred Blossom', title: 'Night Jasmine (Parijat)', icon: 'local_florist' },
      { id: 'slot-3', slotLabel: 'Veranda Chair', title: 'Baba’s Cane Planters Chair', icon: 'chair' },
      { id: 'slot-4', slotLabel: 'Peaceful Melody', title: 'Autumn Rabindrasangeet', icon: 'music_note' }
    ]
  },

  // ==========================================
  // 2. NOTICE
  // ==========================================
  {
    id: 'act-6',
    slug: 'attention-hunt',
    name: 'Attention Hunt',
    title: 'Attention Hunt',
    category: 'NOTICE',
    icon: 'search',
    subtitle: 'Gentle inspection of peaceful tea plantation details',
    description: 'Find target items scattered in a calm scene among visual distractors.',
    estimatedDuration: '4 mins',
    duration: '4 mins',
    comfort: 'Calm',
    difficulty: 1,
    instructions: 'Find and tap all 4 golden harvest tokens in the scene.',
    accessibilityLabel: 'Attention Hunt visual search game',
    activityType: 'hunt',
    gameMechanic: 'visual-search',
    requiredMemoryContext: false,
    availableModes: ['hunt', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9quruDM6l-lR-7W24pE_W0NX2mY7MEiDYMl7ql2sZ_QRQ7D-NH9U4cKzj7UJEsP6HAz9UYIXzvWUwLSf9435pp57UHZoEfZpAQ5tcAOs3WdTs3FbMByQj6sgTUZHHPZ-FJGZaZb1Pq8fZYr8634oUGltshBb5QKGGDMKbefz5AzrIxUJXVoDWm-io97RbcNo_e9PL-KCRfocNbcDNjEieNZn-WLyl4RytmqvYfXuB7IpvmQvpZS8d',
    locationStamp: 'Khasi Hills Tea Estate',
    contextStamp: 'Visual Inspection',
    albumRef: 'MM-HUNT-06',
    question: "Look closely at the tea stall photograph. What color was Asha's handloom shawl?",
    hint: 'A warm earthen harvest shade reflecting morning sunshine.',
    options: [
      { id: 'opt-6a', letter: 'A', title: 'Warm Ochre / Terracotta', subtitle: 'Handwoven wool with embroidered border', correct: true },
      { id: 'opt-6b', letter: 'B', title: 'Bright Sky Blue', subtitle: 'Light silk scarf', correct: false },
      { id: 'opt-6c', letter: 'C', title: 'Deep Black', subtitle: 'Heavy winter coat', correct: false }
    ],
    huntItems: [
      { id: 'h-1', title: 'Ochre Shawl', icon: 'checkroom', isTarget: true },
      { id: 'h-2', title: 'Clay Chai Cup', icon: 'emoji_food_beverage', isTarget: true },
      { id: 'h-3', title: 'Tea Leaves', icon: 'eco', isTarget: true },
      { id: 'h-4', title: 'Brass Tea Spoon', icon: 'soup_kitchen', isTarget: true },
      { id: 'h-5', title: 'Pocket Clock', icon: 'schedule', isTarget: false },
      { id: 'h-6', title: 'Pine Branch', icon: 'forest', isTarget: false },
      { id: 'h-7', title: 'Stone Pebble', icon: 'radio_button_unchecked', isTarget: false },
      { id: 'h-8', title: 'Wooden Stool', icon: 'chair_alt', isTarget: false }
    ]
  },

  {
    id: 'act-7',
    slug: 'familiar-object-recognition',
    name: 'Familiar Object Recognition',
    title: 'Familiar Object Recognition',
    category: 'NOTICE',
    icon: 'category',
    subtitle: 'Recognizing timeless household heirlooms',
    description: 'Recognize familiar everyday objects from household culture.',
    estimatedDuration: '3 mins',
    duration: '3 mins',
    comfort: 'Comfortable',
    difficulty: 1,
    instructions: 'Tap the card that shows the requested heirloom object.',
    accessibilityLabel: 'Familiar Object Recognition card selection',
    activityType: 'object-catalog',
    gameMechanic: 'object-identification',
    requiredMemoryContext: false,
    availableModes: ['identify', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBT8_4ySDVkudWjVdrx95ANqeipj8foA9zXh_t0TzofsO37yIYeRBco-LPW3itV6rxzPk8R-_mVUO8D2HwTDZdJ09Jfn8_1VSWN4GLLvbFKVKK7P-pONdgbqyn-ylzcaMl6MokfZDOy2RT82oQTPHZoXGnds9-Ks-M-ji3KBGVCu6WoEwnuRwZqqcCfeLheOhZwNJGTBsnssvVuB2nXhYqhfHayUFcBz715cL2gNrbyNffapMAUG7H5',
    locationStamp: 'Living Heirloom Vault',
    contextStamp: 'Object Recognition',
    albumRef: 'MM-OBJ-07',
    question: 'What traditional item is held during evening prayer ceremonies?',
    hint: 'It holds mustard oil and a cotton wick to shed warm golden light.',
    options: [
      { id: 'opt-7a', letter: 'A', title: 'Panchpradip (Brass Diya Lamp)', subtitle: 'Five-tiered ritual lamp with carved handle', correct: true },
      { id: 'opt-7b', letter: 'B', title: 'Electric Torch', subtitle: 'Plastic battery light', correct: false },
      { id: 'opt-7c', letter: 'C', title: 'Glass Lantern', subtitle: 'Kerosene storm lantern', correct: false }
    ],
    objectCatalog: [
      { id: 'obj-1', title: 'Panchpradip Brass Diya', icon: 'lightbulb', isTarget: true, desc: 'Five-tiered brass evening lamp' },
      { id: 'obj-2', title: 'Earthen Kullad Cup', icon: 'emoji_food_beverage', isTarget: false, desc: 'Clay morning tea cup' },
      { id: 'obj-3', title: 'Handloom Shawl', icon: 'checkroom', isTarget: false, desc: 'Terracotta wool wrap' },
      { id: 'obj-4', title: 'Cane Spectacles', icon: 'visibility', isTarget: false, desc: 'Reading glasses' },
      { id: 'obj-5', title: 'Copper Water Lota', icon: 'water_drop', isTarget: false, desc: 'Morning hydration vessel' },
      { id: 'obj-6', title: 'Brass Prayer Bell', icon: 'notifications_active', isTarget: false, desc: 'Sweet resonating chime' }
    ]
  },

  {
    id: 'act-8',
    slug: 'sound-recognition',
    name: 'Sound Recognition',
    title: 'Sound Recognition',
    category: 'NOTICE',
    icon: 'graphic_eq',
    subtitle: 'Gentle audio listening of nature and home sounds',
    description: 'Listen and recognize peaceful sounds of nature and home.',
    estimatedDuration: '4 mins',
    duration: '4 mins',
    comfort: 'Serene',
    difficulty: 1,
    instructions: 'Tap "Play Peaceful Sound" to listen, then select which sound you hear.',
    accessibilityLabel: 'Sound Recognition listening studio',
    activityType: 'sound-studio',
    gameMechanic: 'sound-matching',
    requiredMemoryContext: false,
    availableModes: ['sound', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC22wvw0W6QPHS8HfYaEOvuhq3Z64L-LQ6C1Z6eABAuUst6_l0OsfnmESMEWZ3fOFlMGTNXKIDrEe2homASLswMtPqjKeAK5WTQyyneikgGu2NA2GA2tua6IzQ06V31A6_ZE6MzpmFcc5CpWrWaM9xsVn4D61l2PH_TeJ8vhbEWPYhzZSPIbcf2-cSpbse6Gx0UOAqgXHXc3yJULQweZ3c2gM2IQY8iHR1kqA2dh4WS1M6_uoNat6Ja',
    locationStamp: 'Assam Monsoon Archives',
    contextStamp: 'Acoustic Reminiscence',
    albumRef: 'MM-SND-08',
    question: 'Which peaceful sound always brought comfort to the Guwahati home in July?',
    hint: 'Rhythmic drumming from the clouds onto the tin roof.',
    options: [
      { id: 'opt-8a', letter: 'A', title: 'Monsoon rain drumming softly on the roof', subtitle: 'Cool breezes and warm tea indoors', correct: true },
      { id: 'opt-8b', letter: 'B', title: 'Traffic horn noises', subtitle: 'City highway sound', correct: false },
      { id: 'opt-8c', letter: 'C', title: 'Airport siren', subtitle: 'Mechanical alarm', correct: false }
    ],
    soundSources: [
      { id: 'snd-1', title: 'Monsoon Rain on Tin Roof', icon: 'water_drop', isCorrect: true, description: 'Soft rhythm of July rainfall drumming gently overhead' },
      { id: 'snd-2', title: 'Veranda Morning Songbirds', icon: 'flutter_dash', isCorrect: false, description: 'Whistling thrush singing in the dawn pines' },
      { id: 'snd-3', title: 'Brass Evening Prayer Bell', icon: 'notifications_active', isCorrect: false, description: 'Resonating chime of twilight temple puja' },
      { id: 'snd-4', title: 'Wind Through Pine Trees', icon: 'air', isCorrect: false, description: 'Cool whistling mountain breeze' }
    ],
    audioCue: {
      cueTitle: 'Monsoon Rainfall',
      fallbackDescription: 'Soft rhythm of July rainfall drumming gently overhead on the veranda roof'
    }
  },

  // ==========================================
  // 3. SOLVE
  // ==========================================
  {
    id: 'act-9',
    slug: 'pattern-predictor',
    name: 'Pattern Predictor',
    title: 'Pattern Predictor',
    category: 'SOLVE',
    icon: 'alt_route',
    subtitle: 'Calming geometric and color rhythms',
    description: 'Identify what comes next in a gentle visual pattern rhythm.',
    estimatedDuration: '4 mins',
    duration: '4 mins',
    comfort: 'Gentle',
    difficulty: 1,
    instructions: 'Observe the color and shape sequence, then choose what comes in the glowing slot.',
    accessibilityLabel: 'Pattern Predictor rhythm puzzle',
    activityType: 'pattern-puzzle',
    gameMechanic: 'pattern-puzzle',
    requiredMemoryContext: false,
    availableModes: ['rhythm', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGuHcmF5BkQMk-RB20BsWMkAfiaSWVApXU_jCVHUbxnO4XlzbzNNJTxCxWN0Ho9mfPYMs8LE-6unWjvdCMBCDhXzrS-K7A8DLMlrsEOYNDO1v9BX6qicZvvZjCZNfN4ZER3BLnoMO5Y4n_UJIYfmWqh62SKMaNKnQXebZ-UpvSlC365I3Z5esTTMFelJ_q2BaiU-31b3xN0SehMEzDn3QV-6_FECV5eRcGwy2iINXZTjryDBIVqzZI',
    locationStamp: 'Earthen Textile Loom',
    contextStamp: 'Pattern Rhythm',
    albumRef: 'MM-PAT-09',
    question: 'Look at the sari border colors: Terracotta, Sage, Terracotta, Sage... What comes next?',
    hint: "It is the warm earth pigment used in MindMitra's primary touch buttons.",
    options: [
      { id: 'opt-9a', letter: 'A', title: 'Terracotta (Warm Earthen Red)', subtitle: 'Completes the harmonious handloom cadence', correct: true },
      { id: 'opt-9b', letter: 'B', title: 'Neon Purple', subtitle: 'Does not belong in the pattern', correct: false },
      { id: 'opt-9c', letter: 'C', title: 'Dark Steel Gray', subtitle: 'Industrial shade', correct: false }
    ],
    patternSequence: [
      { id: 'pat-1', label: 'Terracotta', colorClass: 'bg-[#984729]', icon: 'circle' },
      { id: 'pat-2', label: 'Sage', colorClass: 'bg-[#5b6348]', icon: 'eco' },
      { id: 'pat-3', label: 'Terracotta', colorClass: 'bg-[#984729]', icon: 'circle' },
      { id: 'pat-4', label: 'Sage', colorClass: 'bg-[#5b6348]', icon: 'eco' },
      { id: 'pat-5', label: '?', isTarget: true, icon: 'question_mark' }
    ]
  },

  {
    id: 'act-10',
    slug: 'object-sorting',
    name: 'Object Sorting',
    title: 'Object Sorting',
    category: 'SOLVE',
    icon: 'sort',
    subtitle: 'Categorizing everyday items with confidence',
    description: 'Sort everyday objects into meaningful categories like Garden, Kitchen, or Wardrobe.',
    estimatedDuration: '5 mins',
    duration: '5 mins',
    comfort: 'Comfortable',
    difficulty: 1,
    instructions: 'Tap an item, then tap the room bucket where it belongs in your home.',
    accessibilityLabel: 'Object Sorting room bucket game',
    activityType: 'bucket-sort',
    gameMechanic: 'category-sorting',
    requiredMemoryContext: false,
    availableModes: ['sort', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4eGyiljLtDN1mv8-shNH3o6kdWjH4fRs9WVMb6mAj3IOXFoO-YOlzUBw034lYelDl7eJfjC5cjaFCXWbNB2sjEYqBNr6_nyqYxGiwQOyo6iaU05Sap25BvO5ME0tVgTy6b19X8UWEHJ9wOhfBuaKMCFENNaY2Dtj7U-0CtVf7SYk2HAQfuLj-pLE7FpzrMNsdvNgAKR1xGT5E2zsC540N3FvvL71BUJkLhgD-0XqgATUGWZ0x1VNv',
    locationStamp: 'Household Harmony',
    contextStamp: 'Cognitive Classification',
    albumRef: 'MM-SORT-10',
    question: 'Where do fresh Tulsi leaves and jasmine blossoms belong?',
    hint: 'They grow in terracotta planters under open morning sunshine.',
    options: [
      { id: 'opt-10a', letter: 'A', title: 'The Sunlit Veranda Garden', subtitle: 'Where Asha picks fresh leaves every morning', correct: true },
      { id: 'opt-10b', letter: 'B', title: 'The Tool Shed', subtitle: 'For hammers and nails', correct: false },
      { id: 'opt-10c', letter: 'C', title: 'The Book Wardrobe', subtitle: 'For old college textbooks', correct: false }
    ],
    sortCategories: [
      { id: 'b-garden', name: 'Veranda Garden', icon: 'yard', color: 'border-tertiary' },
      { id: 'b-kitchen', name: 'Kitchen', icon: 'soup_kitchen', color: 'border-primary' },
      { id: 'b-wardrobe', name: 'Wardrobe', icon: 'checkroom', color: 'border-secondary' }
    ],
    sortItems: [
      { id: 'si-1', title: 'Fresh Tulsi Leaves', icon: 'eco', correctBucket: 'Veranda Garden' },
      { id: 'si-2', title: 'Brass Tea Kettle', icon: 'coffee', correctBucket: 'Kitchen' },
      { id: 'si-3', title: 'Warm Woolen Shawl', icon: 'checkroom', correctBucket: 'Wardrobe' },
      { id: 'si-4', title: 'Jasmine Planter', icon: 'local_florist', correctBucket: 'Veranda Garden' },
      { id: 'si-5', title: 'Cardamom Pods', icon: 'grain', correctBucket: 'Kitchen' },
      { id: 'si-6', title: 'Hand-woven Sari', icon: 'styler', correctBucket: 'Wardrobe' }
    ]
  },

  // ==========================================
  // 4. SEQUENCE
  // ==========================================
  {
    id: 'act-11',
    slug: 'routine-builder',
    name: 'Routine Builder',
    title: 'Routine Builder',
    category: 'SEQUENCE',
    icon: 'schedule',
    subtitle: 'Peaceful sequencing of daily wellness milestones',
    description: 'Arrange daily routine milestones in natural, comfortable order.',
    estimatedDuration: '5 mins',
    duration: '5 mins',
    comfort: 'Serene',
    difficulty: 1,
    instructions: 'Use the up and down arrows to place your daily wellness steps in peaceful order.',
    accessibilityLabel: 'Routine Builder daily care sequence',
    activityType: 'timeline-order',
    gameMechanic: 'timeline-sequencing',
    requiredMemoryContext: false,
    availableModes: ['sequence', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAml05UVx_vC9JEQ-b9kXhvl9yXjSiCIjDjVlbc8-FY-fJbKNCH0vKBcne4z-xAdCZkXxnu1F2X4PlGI7w6nxpwKa3DMArHetAnWgpwSfdNX1wtTzH6pxbK2utg6IE2RXPYcZoMDEpomqhUEKugFrJEQuM3CaNpV5a6-9Zz7qBaMaj7IMG1GwIl-6Y2k9ZZIkOLwdyH3PYa2ArSE2cwC5BpJvETads59mlEOCioSxTUzVmzSmT1D36',
    locationStamp: 'Morning Care Routine',
    contextStamp: 'Daily Rhythm Cadence',
    albumRef: 'MM-ROUT-11',
    question: 'What is your peaceful first step after waking up in the morning?',
    hint: 'Fresh warm water infused with fragrant green leaves from your veranda.',
    options: [
      { id: 'opt-11a', letter: 'A', title: 'Warm Tulsi tea & gentle hydration', subtitle: 'Calming morning hydration at 7:30 AM', correct: true },
      { id: 'opt-11b', letter: 'B', title: 'Evening television news', subtitle: 'Done after sunset', correct: false },
      { id: 'opt-11c', letter: 'C', title: 'Bedtime herbal chamomile', subtitle: 'Taken before sleeping at 9:30 PM', correct: false }
    ],
    sequenceMilestones: [
      { id: 'seq-1', order: 1, title: 'Wake up gently with morning sunshine', icon: 'sunny' },
      { id: 'seq-2', order: 2, title: 'Warm Tulsi tea on the quiet veranda', icon: 'emoji_food_beverage' },
      { id: 'seq-3', order: 3, title: 'Morning blood pressure check & medicine', icon: 'medication' },
      { id: 'seq-4', order: 4, title: 'Nutritious breakfast with Meera', icon: 'bakery_dining' },
      { id: 'seq-5', order: 5, title: 'Quiet afternoon rest & reading', icon: 'bed' }
    ]
  },

  {
    id: 'act-12',
    slug: 'story-sequence',
    name: 'Story Sequence',
    title: 'Story Sequence',
    category: 'SEQUENCE',
    icon: 'history_edu',
    subtitle: 'Reconnecting the steps of an autumn trip',
    description: 'Arrange story events in correct chronological order.',
    estimatedDuration: '5 mins',
    duration: '5 mins',
    comfort: 'Nostalgic',
    difficulty: 2,
    instructions: 'Reorder what happened during the memorable road trip to Shillong.',
    accessibilityLabel: 'Story Sequence chronology game',
    activityType: 'story-chronology',
    gameMechanic: 'story-chronology',
    requiredMemoryContext: true,
    availableModes: ['sequence', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGuHcmF5BkQMk-RB20BsWMkAfiaSWVApXU_jCVHUbxnO4XlzbzNNJTxCxWN0Ho9mfPYMs8LE-6unWjvdCMBCDhXzrS-K7A8DLMlrsEOYNDO1v9BX6qicZvvZjCZNfN4ZER3BLnoMO5Y4n_UJIYfmWqh62SKMaNKnQXebZ-UpvSlC365I3Z5esTTMFelJ_q2BaiU-31b3xN0SehMEzDn3QV-6_FECV5eRcGwy2iINXZTjryDBIVqzZI',
    locationStamp: 'Guwahati to Shillong Highway',
    contextStamp: 'Episodic Chronology',
    albumRef: 'MM-SEQ-12',
    question: 'On the trip to Shillong: First we drove past Nongpoh. What came next before sunset?',
    hint: 'We stopped by the serene lake surrounded by tall pines.',
    options: [
      { id: 'opt-12a', letter: 'A', title: 'Stopped by Umiam Lake for spiced tea', subtitle: 'Watching the copper sunset over the quiet water', correct: true },
      { id: 'opt-12b', letter: 'B', title: 'Boarded an overnight flight', subtitle: 'Not part of the road trip', correct: false },
      { id: 'opt-12c', letter: 'C', title: 'Went grocery shopping in Kolkata', subtitle: 'Different city entirely', correct: false }
    ],
    tripMilestones: [
      { id: 'tm-1', order: 1, title: 'Departed ancestral home in Guwahati morning', icon: 'directions_car' },
      { id: 'tm-2', order: 2, title: 'Drove through Nongpoh hill fruit stalls', icon: 'storefront' },
      { id: 'tm-3', order: 3, title: 'Paused by Umiam Lake for sunset spiced tea', icon: 'water' },
      { id: 'tm-4', order: 4, title: 'Arrived at cozy Shillong pine ridge cottage', icon: 'cottage' }
    ]
  },

  {
    id: 'act-13',
    slug: 'cooking-sequence',
    name: 'Cooking Sequence',
    title: 'Cooking Sequence',
    category: 'SEQUENCE',
    icon: 'soup_kitchen',
    subtitle: 'Remembering traditional recipes and kitchen steps',
    description: 'Arrange cooking steps correctly in familiar, traditional recipes.',
    estimatedDuration: '5 mins',
    duration: '5 mins',
    comfort: 'Joyful',
    difficulty: 1,
    instructions: 'Arrange the 5 steps for making spiced ginger tea into the cooking timeline.',
    accessibilityLabel: 'Cooking Sequence culinary mini-game',
    activityType: 'recipe-builder',
    gameMechanic: 'recipe-builder',
    requiredMemoryContext: false,
    availableModes: ['sequence', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4eGyiljLtDN1mv8-shNH3o6kdWjH4fRs9WVMb6mAj3IOXFoO-YOlzUBw034lYelDl7eJfjC5cjaFCXWbNB2sjEYqBNr6_nyqYxGiwQOyo6iaU05Sap25BvO5ME0tVgTy6b19X8UWEHJ9wOhfBuaKMCFENNaY2Dtj7U-0CtVf7SYk2HAQfuLj-pLE7FpzrMNsdvNgAKR1xGT5E2zsC540N3FvvL71BUJkLhgD-0XqgATUGWZ0x1VNv',
    locationStamp: 'Family Kitchen Memories',
    contextStamp: 'Recipe Recall',
    albumRef: 'MM-COOK-13',
    question: 'When preparing your special spiced ginger chai, when do you add the crushed fresh ginger?',
    hint: 'It infuses into the bubbling water before milk is poured.',
    options: [
      { id: 'opt-13a', letter: 'A', title: 'Simmer in boiling water with cardamom first', subtitle: 'Releases rich digestive warmth and aroma', correct: true },
      { id: 'opt-13b', letter: 'B', title: 'Drop into cold milk after drinking', subtitle: 'Incorrect kitchen order', correct: false },
      { id: 'opt-13c', letter: 'C', title: 'Sprinkle dry ginger powder on the saucer', subtitle: 'Not how tea is made', correct: false }
    ],
    recipeSteps: [
      { id: 'rec-1', order: 1, title: 'Bring fresh water to a gentle boil in teapot', icon: 'water_drop' },
      { id: 'rec-2', order: 2, title: 'Add crushed fresh ginger and green cardamom', icon: 'grain' },
      { id: 'rec-3', order: 3, title: 'Simmer Assam tea leaves to rich amber hue', icon: 'eco' },
      { id: 'rec-4', order: 4, title: 'Pour warm milk and add a spoon of jaggery', icon: 'nutrition' },
      { id: 'rec-5', order: 5, title: 'Strain into earthen cups and serve with love', icon: 'emoji_food_beverage' }
    ]
  },

  {
    id: 'act-14',
    slug: 'shopping-memory',
    name: 'Shopping Memory',
    title: 'Shopping Memory',
    category: 'SEQUENCE',
    icon: 'shopping_basket',
    subtitle: 'Remembering 3 pleasant ingredients from the morning bazaar',
    description: 'Memorize a short shopping list and tap the items to place them in your basket.',
    estimatedDuration: '4 mins',
    duration: '4 mins',
    comfort: 'Comfortable',
    difficulty: 1,
    instructions: 'Memorize the items on your market list, then tap them on the shelf to put them in your basket.',
    accessibilityLabel: 'Shopping Memory basket collection game',
    activityType: 'shopping-basket',
    gameMechanic: 'shopping-basket',
    requiredMemoryContext: false,
    availableModes: ['list-recall', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw',
    locationStamp: 'Shillong Laitumkhrah Market',
    contextStamp: 'Working Memory',
    albumRef: 'MM-SHOP-14',
    question: 'Meera bought: Fresh ginger, green cardamom, and what local citrus?',
    hint: 'Fragrant Assam lemon (Kaji Nemu) with thin smooth rind.',
    options: [
      { id: 'opt-14a', letter: 'A', title: 'Assam lemon (Kaji Nemu)', subtitle: 'Freshly picked from the morning farm crate', correct: true },
      { id: 'opt-14b', letter: 'B', title: 'Canned pineapple juice', subtitle: 'Packaged drink', correct: false },
      { id: 'opt-14c', letter: 'C', title: 'Dried cranberries', subtitle: 'Imported berry', correct: false }
    ],
    shoppingList: [
      { id: 'shop-1', title: 'Fresh Ginger', icon: 'nutrition' },
      { id: 'shop-2', title: 'Green Cardamom', icon: 'grain' },
      { id: 'shop-3', title: 'Assam Lemon (Kaji Nemu)', icon: 'eco' },
      { id: 'shop-4', title: 'Wild Forest Honey', icon: 'hive' }
    ],
    marketShelf: [
      { id: 'shop-1', title: 'Fresh Ginger', icon: 'nutrition', onList: true },
      { id: 'shop-2', title: 'Green Cardamom', icon: 'grain', onList: true },
      { id: 'shop-3', title: 'Assam Lemon', icon: 'eco', onList: true },
      { id: 'shop-4', title: 'Forest Honey', icon: 'hive', onList: true },
      { id: 'shop-x1', title: 'Packaged Biscuits', icon: 'cookie', onList: false },
      { id: 'shop-x2', title: 'Potato Chips', icon: 'fastfood', onList: false },
      { id: 'shop-x3', title: 'Plastic Soda', icon: 'local_drink', onList: false },
      { id: 'shop-x4', title: 'Tin Canned Fish', icon: 'set_meal', onList: false }
    ]
  },

  // ==========================================
  // 5. EXPLORE
  // ==========================================
  {
    id: 'act-15',
    slug: 'memory-journey',
    name: 'Memory Journey',
    title: 'Memory Journey',
    category: 'EXPLORE',
    icon: 'explore',
    subtitle: 'Audio-guided visual stroll through misty Pine Hills',
    description: 'Explore a personal journey trail through meaningful memories and scenic waypoints.',
    estimatedDuration: '6 mins',
    duration: '6 mins',
    comfort: 'Serene',
    difficulty: 1,
    instructions: 'Tap each waypoint on the scenic path to reveal cherished photographs and recollections.',
    accessibilityLabel: 'Memory Journey interactive trail',
    activityType: 'scenic-trail',
    gameMechanic: 'scenic-trail',
    requiredMemoryContext: true,
    availableModes: ['journey', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClDv4_h1kT5eVvkSQga6Rvx_Lq8Djf0RbYSnZ_4bH0pymqnPJI0CUfPH_OFAFRdnb4q5neeF6-KbIdEvRhJ5g_sN16VkrP-D1hSLkhgvsZ4RM30Be8DPJAnRJPztn1eDAULI4iC_C_D2w4wpnH2QXI7Saaq4H5cHwoO0C31v8JgFqDak6oJ0y-WhKYLKUM6Szq4IBQDjT_aZARe-HlDuGRjuWkNlx2ojGX1L99zHGVvZnzma-JNT-l',
    locationStamp: 'Shillong Valley & Pine Walk',
    contextStamp: 'Scenic Guided Reminiscence',
    albumRef: 'MM-JOUR-15',
    question: 'As the morning mist cleared over the valley, what birdcall was heard in the pine trees?',
    hint: 'A sweet whistling thrush singing in the quiet dawn breeze.',
    options: [
      { id: 'opt-15a', letter: 'A', title: 'Himalayan Whistling Thrush', subtitle: 'Singing clear melodic notes in the pines', correct: true },
      { id: 'opt-15b', letter: 'B', title: 'Noisy city seagull', subtitle: 'Coastal bird', correct: false },
      { id: 'opt-15c', letter: 'C', title: 'Desert hawk', subtitle: 'Arid habitat', correct: false }
    ],
    journeyWaypoints: [
      { id: 'wp-1', title: 'Ancestral Courtyard', location: 'Guwahati', sensory: 'Fragrant parijat blossoms at dawn', icon: 'cottage' },
      { id: 'wp-2', title: 'Brahmaputra Veranda', location: 'Old Town', sensory: 'Cool river breeze and morning prayer bell', icon: 'water' },
      { id: 'wp-3', title: 'Pine Ridge Walk', location: 'Shillong', sensory: 'Misty pine fragrance & whistling thrush birds', icon: 'forest' },
      { id: 'wp-4', title: 'Umiam Sunset Waters', location: 'Meghalaya', sensory: 'Copper reflection and warm spiced chai', icon: 'wb_twilight' }
    ]
  },

  {
    id: 'act-16',
    slug: 'place-explorer',
    name: 'Place Explorer',
    title: 'Place Explorer',
    category: 'EXPLORE',
    icon: 'location_city',
    subtitle: 'Visual exploration of the Old Guwahati Courtyard',
    description: 'Recognize familiar places and connect them to cherished personal memories.',
    estimatedDuration: '5 mins',
    duration: '5 mins',
    comfort: 'Serene',
    difficulty: 1,
    instructions: 'Tap each sanctuary card to inspect where loved ones sat and spent peaceful hours.',
    accessibilityLabel: 'Place Explorer familiar sanctuary discovery',
    activityType: 'sanctuary-mapping',
    gameMechanic: 'sanctuary-mapping',
    requiredMemoryContext: true,
    availableModes: ['places', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC22wvw0W6QPHS8HfYaEOvuhq3Z64L-LQ6C1Z6eABAuUst6_l0OsfnmESMEWZ3fOFlMGTNXKIDrEe2homASLswMtPqjKeAK5WTQyyneikgGu2NA2GA2tua6IzQ06V31A6_ZE6MzpmFcc5CpWrWaM9xsVn4D61l2PH_TeJ8vhbEWPYhzZSPIbcf2-cSpbse6Gx0UOAqgXHXc3yJULQweZ3c2gM2IQY8iHR1kqA2dh4WS1M6_uoNat6Ja',
    locationStamp: 'Guwahati Old Town Veranda',
    contextStamp: 'Ancestral Reminiscence',
    albumRef: 'MM-EXPL-16',
    question: 'Where did Baba sit every afternoon with his newspaper and brass glasses?',
    hint: 'The wooden cane planters chair in the breezy corner of the veranda.',
    options: [
      { id: 'opt-16a', letter: 'A', title: 'The cane planters chair by the parijat tree', subtitle: 'Catching the gentle afternoon cross-breeze', correct: true },
      { id: 'opt-16b', letter: 'B', title: 'On the roof parapet', subtitle: 'Unsafe location', correct: false },
      { id: 'opt-16c', letter: 'C', title: 'Inside the dark basement', subtitle: 'No daylight', correct: false }
    ],
    sanctuaryCards: [
      { id: 'sc-1', name: 'The Sunlit Veranda', memory: 'Baba’s cane chair with morning newspaper', icon: 'chair' },
      { id: 'sc-2', name: 'Courtyard Garden', memory: 'Picking night jasmine petals for morning puja', icon: 'local_florist' },
      { id: 'sc-3', name: 'Lakeside Bend', memory: 'Hot spiced chai overlooking copper sunset', icon: 'emoji_food_beverage' }
    ]
  },

  {
    id: 'act-17',
    slug: 'life-simulation',
    name: 'Life Simulation',
    title: 'Life Simulation',
    category: 'EXPLORE',
    icon: 'sunny',
    subtitle: 'Gentle choices for an ideal peaceful day',
    description: 'Make simple everyday decisions supporting comfort, autonomy, and dignity.',
    estimatedDuration: '4 mins',
    duration: '4 mins',
    comfort: 'Comfortable',
    difficulty: 1,
    instructions: 'A monsoon rain has started outside. Tap 3 items that bring the most warmth and comfort.',
    accessibilityLabel: 'Life Simulation everyday decision game',
    activityType: 'scenario-select',
    gameMechanic: 'everyday-simulation',
    requiredMemoryContext: false,
    availableModes: ['simulation', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9quruDM6l-lR-7W24pE_W0NX2mY7MEiDYMl7ql2sZ_QRQ7D-NH9U4cKzj7UJEsP6HAz9UYIXzvWUwLSf9435pp57UHZoEfZpAQ5tcAOs3WdTs3FbMByQj6sgTUZHHPZ-FJGZaZb1Pq8fZYr8634oUGltshBb5QKGGDMKbefz5AzrIxUJXVoDWm-io97RbcNo_e9PL-KCRfocNbcDNjEieNZn-WLyl4RytmqvYfXuB7IpvmQvpZS8d',
    locationStamp: 'Daily Comfort Decisions',
    contextStamp: 'Autonomy & Dignity',
    albumRef: 'MM-SIM-17',
    question: "It is 4:30 PM and the sun is gentle. Would you like to sit by the window with warm tea or listen to Baba's song?",
    hint: 'Both choices are wonderful and bring peace.',
    options: [
      { id: 'opt-17a', letter: 'A', title: 'Sit by the sunlit window with warm ginger tea', subtitle: 'Enjoying the garden view and quiet warmth', correct: true },
      { id: 'opt-17b', letter: 'B', title: "Listen to Baba's favourite autumn song", subtitle: 'Gentle reminiscence with SmritiAI', correct: true },
      { id: 'opt-17c', letter: 'C', title: 'Rest comfortably with eyes closed for 15 minutes', subtitle: 'Recharging your peaceful afternoon energy', correct: true }
    ],
    scenarioItems: [
      { id: 'sim-1', title: 'Warm Woolen Shawl', icon: 'checkroom', isHelpful: true },
      { id: 'sim-2', title: 'Steaming Ginger Chai', icon: 'emoji_food_beverage', isHelpful: true },
      { id: 'sim-3', title: 'Cane Planters Chair by Window', icon: 'chair', isHelpful: true },
      { id: 'sim-4', title: 'Dark Sunglasses', icon: 'sunglasses', isHelpful: false },
      { id: 'sim-5', title: 'Heavy Raincoat', icon: 'umbrella', isHelpful: false }
    ]
  },

  // ==========================================
  // 6. CONNECT
  // ==========================================
  {
    id: 'act-18',
    slug: 'voice-recall',
    name: 'Voice Recall',
    title: 'Voice Recall',
    category: 'CONNECT',
    icon: 'mic',
    subtitle: "Listening to loved ones' audio notes and recognizing them",
    description: 'Recall memories through spoken voice notes and family audio messages.',
    estimatedDuration: '4 mins',
    duration: '4 mins',
    comfort: 'Joyful',
    difficulty: 1,
    instructions: 'Tap "Play Voice Note" to hear the family message, then tap who spoke it.',
    accessibilityLabel: 'Voice Recall audio note station',
    activityType: 'voice-studio',
    gameMechanic: 'voice-studio',
    requiredMemoryContext: true,
    availableModes: ['voice', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSLR5wyHeTfoTjv0tj6tFuVSyYKjKmbJP5zB53DJQR-4IBMTC3zYl0ny63cGt7r5T5J_JjaP_OFqxrIVxT0O_QgBexnBV9uXlln1r8nXiDhW9xpSBbfXcyPc1Bbo7UV5103z5ityhT0tkeuUoJIpAZ7KpH7mdDPACAfIRgWxrRANznpjH6UuHAChacb_unZjtGsZBmyHgDgXLV-5VrcFXcJ3Wx3ofjTO0h76LoMY86BmaWy3-ACBVY',
    locationStamp: 'Family Voice Vault',
    contextStamp: 'Auditory Connection',
    albumRef: 'MM-VOICE-18',
    question: "Whose voice says: 'Ma, how are the jasmine flowers doing this week?'",
    hint: 'Your son who called you from Bangalore.',
    options: [
      { id: 'opt-18a', letter: 'A', title: 'Ravi, your son', subtitle: 'Speaking warmly from Bangalore', correct: true },
      { id: 'opt-18b', letter: 'B', title: 'Bank teller', subtitle: 'Stranger', correct: false },
      { id: 'opt-18c', letter: 'C', title: 'Bus conductor', subtitle: 'Stranger', correct: false }
    ],
    voiceNote: {
      speaker: 'Ravi',
      transcript: 'Ma, how are the jasmine flowers doing this week? I am sending your favorite sweets tomorrow.'
    }
  },

  {
    id: 'act-19',
    slug: 'festival-memory',
    name: 'Festival Memory',
    title: 'Festival Memory',
    category: 'CONNECT',
    icon: 'celebration',
    subtitle: 'Reviving joyful memories of Diwali and Durga Puja',
    description: 'Recall meaningful festival memories across culturally inclusive celebrations.',
    estimatedDuration: '5 mins',
    duration: '5 mins',
    comfort: 'Warm',
    difficulty: 1,
    instructions: 'Tap the celebration tokens to gather festive treats and lamps.',
    accessibilityLabel: 'Festival Memory celebration scene',
    activityType: 'festival-scene',
    gameMechanic: 'festival-scene',
    requiredMemoryContext: true,
    availableModes: ['cultural', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBT8_4ySDVkudWjVdrx95ANqeipj8foA9zXh_t0TzofsO37yIYeRBco-LPW3itV6rxzPk8R-_mVUO8D2HwTDZdJ09Jfn8_1VSWN4GLLvbFKVKK7P-pONdgbqyn-ylzcaMl6MokfZDOy2RT82oQTPHZoXGnds9-Ks-M-ji3KBGVCu6WoEwnuRwZqqcCfeLheOhZwNJGTBsnssvVuB2nXhYqhfHayUFcBz715cL2gNrbyNffapMAUG7H5',
    locationStamp: 'Brahmaputra Veranda, Assam',
    contextStamp: 'Cultural Heritage',
    albumRef: 'MM-FEST-19',
    question: 'What sweet treat did you and the children prepare for Diwali evening?',
    hint: 'Traditional rice flour and jaggery pithe dumplings filled with coconut.',
    options: [
      { id: 'opt-19a', letter: 'A', title: 'Homemade coconut pithe sweets', subtitle: 'Steamed sweet dumplings with cardamom jaggery', correct: true },
      { id: 'opt-19b', letter: 'B', title: 'French potato fries', subtitle: 'Western fast food', correct: false },
      { id: 'opt-19c', letter: 'C', title: 'Store bought cola soda', subtitle: 'Fizzy drink', correct: false }
    ],
    festivalTokens: [
      { id: 'fest-1', title: 'Steamed Coconut Pithe', icon: 'bakery_dining', desc: 'Handmade sweet treat' },
      { id: 'fest-2', title: 'Brass Diya Lamps', icon: 'lightbulb', desc: 'Golden oil lamps along veranda' },
      { id: 'fest-3', title: 'Yellow Marigold Garland', icon: 'local_florist', desc: 'Festive doorway decoration' },
      { id: 'fest-4', title: 'Silk Festive Sari', icon: 'styler', desc: 'Traditional handloom wrap' }
    ]
  },

  {
    id: 'act-20',
    slug: 'family-memory-mission',
    name: 'Family Memory Mission',
    title: 'Family Memory Mission',
    category: 'CONNECT',
    icon: 'diversity_1',
    subtitle: 'A collaborative story puzzle connecting generations',
    description: 'Complete a multi-step mission connecting Person → Place → Keepsake.',
    estimatedDuration: '6 mins',
    duration: '6 mins',
    comfort: 'Loving',
    difficulty: 2,
    instructions: 'Follow the 3 mission steps: select the family member, identify the sanctuary, and connect the keepsake.',
    accessibilityLabel: 'Family Memory Mission multi-stage adventure',
    activityType: 'mission-adventure',
    gameMechanic: 'multi-stage-mission',
    requiredMemoryContext: true,
    availableModes: ['mission', 'choice'],
    totalSteps: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB18GOO50aNeIlri76fwryQuEtY2N9ji_Al90UKxFEVSRIRR8_rHr2eOvFWPeIrYGz2IR4aghat-FOV8AYS7K2mcpEWDnFMiEbfEUNMP-_ejqSihdmVkl7j11R46Pf3YnXig-LKAq13VJupcbaJX68YpjU9_ivJ75F6vNzZOT0SGH9RXdWixuvFdXZOfJNFxgN1zT2z_McN5YTFRXaXW8A0tV8BwqOo47BdWucEF_PmUmxAOIJ8Jf-E',
    locationStamp: 'Delhi & Shillong Family Bridge',
    contextStamp: 'Cross-generational Bonding',
    albumRef: 'MM-MISS-20',
    question: 'What special art project is granddaughter Priya bringing to show you during her visit?',
    hint: 'A painting of your ancestral Assam garden with the night jasmine blooms.',
    options: [
      { id: 'opt-20a', letter: 'A', title: 'Watercolor painting of the Guwahati Courtyard', subtitle: 'Painted with love from your childhood stories', correct: true },
      { id: 'opt-20b', letter: 'B', title: 'Math exam sheet', subtitle: 'School test paper', correct: false },
      { id: 'opt-20c', letter: 'C', title: 'Computer code printout', subtitle: 'Technical document', correct: false }
    ],
    missionStages: [
      { stage: 1, label: 'Person', prompt: 'Who is visiting you today?', answer: 'Granddaughter Priya', icon: 'face_3' },
      { stage: 2, label: 'Place', prompt: 'Which ancestral home did she paint?', answer: 'The Old Guwahati Courtyard', icon: 'cottage' },
      { stage: 3, label: 'Keepsake', prompt: 'What loving gift did she create for you?', answer: 'Watercolor Garden Painting', icon: 'palette' }
    ]
  }
];

export class ActivityRegistryService {
  constructor() {
    this.activities = [...CANONICAL_ACTIVITIES];
  }

  getAll() {
    return this.activities;
  }

  getById(idOrSlug) {
    if (!idOrSlug) return null;
    const clean = String(idOrSlug).toLowerCase().trim();
    return this.activities.find(a => a.id.toLowerCase() === clean || a.slug.toLowerCase() === clean) || null;
  }

  getByCategory(category) {
    if (!category || category === 'All') return this.activities;
    return this.activities.filter(a => a.category.toUpperCase() === category.toUpperCase());
  }

  search(query) {
    if (!query || !query.trim()) return this.activities;
    const q = query.toLowerCase().trim();
    return this.activities.filter(a => 
      a.name.toLowerCase().includes(q) || 
      a.description.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.subtitle.toLowerCase().includes(q)
    );
  }

  /**
   * Resolves activity with personalized memory context when available.
   */
  resolveForPatient(activityId, patientId) {
    const act = this.getById(activityId);
    if (!act) return null;

    if (!act.requiredMemoryContext) {
      return { ...act };
    }

    const memCtx = memoryService.getActivityMemoryContext(act.id, patientId);
    const resolved = { ...act };

    // Gracefully weave real personal context when available
    if (memCtx && memCtx.hasPersonalData) {
      if (act.slug === 'people-relationships' && memCtx.primaryPerson) {
        resolved.question = `Who is ${memCtx.primaryPerson.name} to you in your family album?`;
        resolved.hint = `${memCtx.primaryPerson.relationship || 'Family member'} - ${memCtx.primaryPerson.notes || 'A cherished loved one'}`;
      } else if (act.slug === 'place-explorer' && memCtx.primaryPlace) {
        resolved.locationStamp = memCtx.primaryPlace.location || memCtx.primaryPlace.name;
        resolved.question = `What peaceful memories do you cherish most at ${memCtx.primaryPlace.name}?`;
      } else if (act.slug === 'photo-story' && memCtx.primaryMemory) {
        resolved.image = memCtx.primaryMemory.image || act.image;
        resolved.contextStamp = memCtx.primaryMemory.title;
      }
    }

    return resolved;
  }
}

export const activityRegistry = new ActivityRegistryService();
