import { store } from '../state/store.js';
import { speechService } from './speechService.js';
import { showToast } from '../components/Toast.js';
import { activityRegistry } from './activityRegistry.js';
import { adaptiveEngine } from './adaptiveEngine.js';
import { memoryService } from './memoryService.js';

class ActivityEngine {
  constructor() {
    this.sessionStartTime = null;
    this.stepStartTime = null;
    this.pausedAt = null;
    this.totalPausedDurationMs = 0;
    this.currentSession = null;
    this.currentMetrics = {
      attempts: 0,
      repeatedErrors: 0,
      hintsUsed: 0,
      skippedTasks: 0,
      correctCount: 0
    };
    this.lastSessionSummary = null;
    this.activeModeState = null; // State for interactive mini-games
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.getSessionState()); } catch (e) { console.warn('ActivityEngine listener err:', e); }
    });
  }

  startSession(activityId, patientId = null, difficulty = null) {
    const actDef = activityRegistry.getById(activityId) || store.getActiveActivity();
    const actId = actDef ? actDef.id : activityId;
    const pid = patientId || store.getCurrentPatientId();

    store.setActiveActivity(actId);
    store.resetActivity(actId);

    const resolved = activityRegistry.resolveForPatient(actId, pid);

    this.sessionStartTime = Date.now();
    this.stepStartTime = Date.now();
    this.pausedAt = null;
    this.totalPausedDurationMs = 0;

    this.currentMetrics = {
      attempts: 0,
      repeatedErrors: 0,
      hintsUsed: 0,
      skippedTasks: 0,
      correctCount: 0
    };

    const totalSteps = resolved?.totalSteps || 3;
    let activeDifficulty = difficulty;
    if (!activeDifficulty) {
      try {
        const adaptiveRec = adaptiveEngine.getDifficultyRecommendation(pid, actId);
        activeDifficulty = adaptiveRec?.recommendedDifficultyLevel || resolved?.difficulty || 1;
      } catch (e) {
        activeDifficulty = resolved?.difficulty || 1;
      }
    }

    this.currentSession = {
      id: 'sess-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      activityId: actId,
      activitySlug: resolved?.slug || 'activity',
      activityName: resolved?.name || 'Cognitive Activity',
      category: resolved?.category || 'REMEMBER',
      patientId: pid,
      startedAt: new Date().toISOString(),
      completedAt: null,
      status: 'in_progress',
      currentStep: 1,
      totalSteps: totalSteps,
      score: 0,
      accuracy: 0,
      hintsUsed: 0,
      mistakes: 0,
      duration: 0,
      difficulty: activeDifficulty,
      events: []
    };

    // Initialize mode-specific interaction states
    this.initModeState(resolved, activeDifficulty);

    this.recordEvent('session_start', { activityId: actId, patientId: pid });
    this.lastSessionSummary = null;
    this.notify();
    return this.currentSession;
  }

  initModeState(activity, difficulty = 1) {
    if (!activity) {
      this.activeModeState = null;
      return;
    }

    const diffLevel = typeof difficulty === 'string'
      ? (difficulty.toLowerCase() === 'hard' ? 3 : difficulty.toLowerCase() === 'medium' ? 2 : 1)
      : Number(difficulty) || 1;

    const type = activity.activityType || 'choice';

    // 1. Memory Match (act-1)
    if (type === 'match' || activity.matchPairsEasy) {
      const pairs = diffLevel === 3 
        ? (activity.matchPairsHard || activity.matchPairsMedium || activity.matchPairsEasy)
        : diffLevel === 2 
        ? (activity.matchPairsMedium || activity.matchPairsEasy)
        : (activity.matchPairsEasy || activity.matchPairs || []);

      const deck = [];
      pairs.forEach(p => {
        deck.push({ id: p.id, pairKey: p.id, title: p.title, icon: p.icon, flipped: false, matched: false });
        deck.push({ id: p.matchId, pairKey: p.id, title: p.matchTitle, icon: p.icon, flipped: false, matched: false });
      });
      deck.sort(() => 0.5 - Math.random());

      this.activeModeState = {
        type: 'match',
        deck,
        flippedCards: [],
        matchesFound: 0,
        totalPairs: pairs.length
      };
    }
    // 2. Personal Memory Recall Clue Explorer (act-2)
    else if (type === 'clue-recall' || activity.recallClues) {
      this.activeModeState = {
        type: 'clue-recall',
        clues: (activity.recallClues || []).map(c => ({ ...c, inspected: false })),
        inspectedCount: 0
      };
    }
    // 3. People & Relationships (act-3)
    else if (type === 'relation-match' || activity.relationCards) {
      this.activeModeState = {
        type: 'relation-match',
        people: activity.relationCards || [],
        selectedPersonId: null,
        connectedPairs: [],
        totalPairs: (activity.relationCards || []).length
      };
    }
    // 4. Photo Story (act-4)
    else if (type === 'story-builder' || activity.storyTiles) {
      this.activeModeState = {
        type: 'story-builder',
        tiles: [...(activity.storyTiles || [])].sort(() => 0.5 - Math.random()),
        placedTiles: [],
        totalTiles: (activity.storyTiles || []).length
      };
    }
    // 5. Memory Reconstruction (act-5)
    else if (type === 'puzzle-assembly' || activity.puzzleSlots) {
      this.activeModeState = {
        type: 'puzzle-assembly',
        slots: (activity.puzzleSlots || []).map(s => ({ ...s, slotted: false })),
        slottedCount: 0
      };
    }
    // 6. Attention Hunt (act-6)
    else if (type === 'hunt' || activity.huntItems) {
      let huntItems = activity.huntItems || [];
      if (diffLevel === 1) {
        // Easy: 3 targets, 2 distractors (5 total)
        const targets = huntItems.filter(i => i.isTarget).slice(0, 3);
        const distractors = huntItems.filter(i => !i.isTarget).slice(0, 2);
        huntItems = [...targets, ...distractors];
      } else if (diffLevel === 2) {
        // Medium: 4 targets, 4 distractors (8 total)
        const targets = huntItems.filter(i => i.isTarget).slice(0, 4);
        const distractors = huntItems.filter(i => !i.isTarget).slice(0, 4);
        huntItems = [...targets, ...distractors];
      } else {
        // Hard: all available targets + distractors
        const targets = huntItems.filter(i => i.isTarget);
        const distractors = huntItems.filter(i => !i.isTarget);
        huntItems = [...targets, ...distractors];
      }
      this.activeModeState = {
        type: 'hunt',
        items: huntItems.map(i => ({ ...i, found: false })),
        targetCount: huntItems.filter(i => i.isTarget).length,
        foundCount: 0
      };
    }
    // 7. Familiar Object Recognition (act-7)
    else if (type === 'object-catalog' || activity.objectCatalog) {
      this.activeModeState = {
        type: 'object-catalog',
        objects: activity.objectCatalog || [],
        identifiedId: null
      };
    }
    // 8. Sound Recognition (act-8)
    else if (type === 'sound-studio' || activity.soundSources) {
      this.activeModeState = {
        type: 'sound-studio',
        sources: activity.soundSources || [],
        selectedSourceId: null,
        isPlaying: false
      };
    }
    // 9. Pattern Predictor (act-9)
    else if (type === 'pattern-puzzle' || activity.patternSequence) {
      let seq = activity.patternSequence || [];
      if (diffLevel === 1) {
        // Simple repeating pattern (3 elements + target)
        seq = seq.slice(0, 4);
      } else if (diffLevel === 2) {
        // 4 elements + target
        seq = seq.slice(0, 5);
      }
      this.activeModeState = {
        type: 'pattern-puzzle',
        sequence: seq,
        chosenOption: null
      };
    }
    // 10. Object Sorting (act-10)
    else if (type === 'bucket-sort' || activity.sortCategories) {
      let categories = activity.sortCategories || [];
      let items = activity.sortItems || [];
      if (diffLevel === 1 && activity.sortCategoriesEasy) {
        categories = activity.sortCategoriesEasy;
        items = items.filter(i => categories.some(c => c.name === i.correctBucket)).slice(0, 4);
      } else if (diffLevel === 2 && activity.sortCategoriesMedium) {
        categories = activity.sortCategoriesMedium;
        items = items.filter(i => categories.some(c => c.name === i.correctBucket)).slice(0, 6);
      }
      this.activeModeState = {
        type: 'bucket-sort',
        categories,
        items: items.map(i => ({ ...i, userBucket: null })),
        placedCount: 0,
        totalItems: items.length,
        selectedItemId: null
      };
    }
    // 11. Routine Builder (act-11)
    else if (type === 'timeline-order' || activity.sequenceMilestones) {
      const initial = [...(activity.sequenceMilestones || [])].reverse();
      this.activeModeState = {
        type: 'timeline-order',
        currentOrder: initial,
        correctOrder: activity.sequenceMilestones || []
      };
    }
    // 12. Story Sequence (act-12)
    else if (type === 'story-chronology' || activity.tripMilestones) {
      let milestones = activity.tripMilestones || [];
      if (diffLevel === 1) {
        milestones = milestones.slice(0, 3);
      } else if (diffLevel === 2) {
        milestones = milestones.slice(0, 4);
      }
      const initial = [...milestones].reverse();
      this.activeModeState = {
        type: 'story-chronology',
        currentOrder: initial,
        correctOrder: milestones
      };
    }
    // 13. Cooking Sequence (act-13)
    else if (type === 'recipe-builder' || activity.recipeSteps) {
      const initial = [...(activity.recipeSteps || [])].reverse();
      this.activeModeState = {
        type: 'recipe-builder',
        currentOrder: initial,
        correctOrder: activity.recipeSteps || []
      };
    }
    // 14. Shopping Memory (act-14)
    else if (type === 'shopping-basket' || activity.shoppingList) {
      let list = activity.shoppingList || [];
      let shelf = activity.marketShelf || [];
      if (diffLevel === 1 && activity.shoppingListEasy) {
        list = activity.shoppingListEasy;
      } else if (diffLevel === 2) {
        list = list.slice(0, 4);
      }
      const listIds = new Set(list.map(i => i.id));
      const filteredShelf = shelf.filter(s => listIds.has(s.id) || !s.onList);
      this.activeModeState = {
        type: 'shopping-basket',
        phase: 'memo', // 'memo' | 'market'
        shoppingList: list,
        marketShelf: filteredShelf.map(s => ({ ...s, collected: false })),
        basket: [],
        targetCount: list.length
      };
    }
    // 15. Memory Journey (act-15)
    else if (type === 'scenic-trail' || activity.journeyWaypoints) {
      this.activeModeState = {
        type: 'scenic-trail',
        waypoints: (activity.journeyWaypoints || []).map(w => ({ ...w, visited: false })),
        activeWaypoint: null
      };
    }
    // 16. Place Explorer (act-16)
    else if (type === 'sanctuary-mapping' || activity.sanctuaryCards) {
      this.activeModeState = {
        type: 'sanctuary-mapping',
        sanctuaries: (activity.sanctuaryCards || []).map(s => ({ ...s, inspected: false })),
        activeSanctuary: null
      };
    }
    // 17. Life Simulation (act-17)
    else if (type === 'scenario-select' || activity.scenarioItems) {
      this.activeModeState = {
        type: 'scenario-select',
        items: (activity.scenarioItems || []).map(i => ({ ...i, selected: false })),
        selectedCount: 0
      };
    }
    // 18. Voice Recall (act-18)
    else if (type === 'voice-studio' || activity.voiceNote) {
      this.activeModeState = {
        type: 'voice-studio',
        voiceNote: activity.voiceNote,
        isRecording: false,
        audioPlayed: false
      };
    }
    // 19. Festival Memory (act-19)
    else if (type === 'festival-scene' || activity.festivalTokens) {
      this.activeModeState = {
        type: 'festival-scene',
        tokens: (activity.festivalTokens || []).map(t => ({ ...t, collected: false })),
        collectedCount: 0
      };
    }
    // 20. Family Memory Mission (act-20)
    else if (type === 'mission-adventure' || activity.missionStages) {
      let stages = activity.missionStages || [];
      try {
        const pid = this.currentSession?.patientId || store.getCurrentPatientId();
        const people = memoryService.getPeople(pid);
        const places = memoryService.getPlaces(pid);
        const memories = memoryService.getPatientMemories(pid);

        if (people && people.length > 0 && places && places.length > 0 && memories && memories.length > 0) {
          const featuredPerson = people.find(p => p.relation && p.relation.toLowerCase().includes('daughter')) || people[0];
          const featuredPlace = places.find(p => p.name.toLowerCase().includes('shillong')) || places[0];
          const featuredMem = memories.find(m => m.placeId === featuredPlace.id || (Array.isArray(m.personIds) && m.personIds.includes(featuredPerson.id))) || memories[0];

          stages = [
            { stage: 1, label: 'Person', prompt: `Who visited you with warm smiles and care?`, answer: `${featuredPerson.name} (${featuredPerson.relation})`, icon: 'face_3', personId: featuredPerson.id },
            { stage: 2, label: 'Place', prompt: `Where did you and ${featuredPerson.name} spend calm mornings?`, answer: featuredPlace.name, icon: 'cottage', placeId: featuredPlace.id },
            { stage: 3, label: 'Keepsake', prompt: `Which special memory is preserved together?`, answer: featuredMem.title, icon: 'auto_stories', memoryId: featuredMem.id }
          ];
        }
      } catch (err) {
        // Fallback to static stages if error
      }

      this.activeModeState = {
        type: 'mission-adventure',
        stages,
        currentStage: 1,
        completedStages: []
      };
    } else {
      this.activeModeState = null;
    }
  }

  recordEvent(eventType, payload = {}) {
    if (!this.currentSession) return;
    const event = {
      id: 'evt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      sessionId: this.currentSession.id,
      timestamp: new Date().toISOString(),
      eventType,
      step: this.currentSession.currentStep,
      payload
    };
    this.currentSession.events.push(event);
  }

  pauseSession() {
    if (!this.currentSession || this.currentSession.status !== 'in_progress') return;
    this.currentSession.status = 'paused';
    this.pausedAt = Date.now();
    this.recordEvent('session_pause');
    this.notify();
    showToast('Activity paused gently. Take your time.', 'pause_circle');
  }

  resumeSession() {
    if (!this.currentSession || this.currentSession.status !== 'paused') return;
    if (this.pausedAt) {
      this.totalPausedDurationMs += (Date.now() - this.pausedAt);
      this.pausedAt = null;
    }
    this.currentSession.status = 'in_progress';
    this.stepStartTime = Date.now();
    this.recordEvent('session_resume');
    this.notify();
    showToast('Resumed with peaceful attention.', 'play_circle');
  }

  restartSession(activityId = null) {
    const act = activityId || (this.currentSession ? this.currentSession.activityId : null);
    if (!act) return;
    this.recordEvent('session_restart');
    showToast('Activity restarted freshly.', 'restart_alt');
    return this.startSession(act);
  }

  exitSession(confirm = true) {
    if (this.currentSession && this.currentSession.status === 'in_progress') {
      this.currentSession.status = 'abandoned';
      this.recordEvent('session_abandon');
    }
    showToast('Returned to Activities Hub.', 'check');
    this.notify();
  }

  selectOption(optionId) {
    store.answerActivity(optionId);
    this.recordEvent('option_selected', { optionId });
    this.notify();
  }

  // ==========================================
  // MINI-GAME INTERACTION HANDLERS
  // ==========================================

  // 1. Memory Match: Flip card
  flipMatchCard(cardId) {
    if (!this.activeModeState || this.activeModeState.type !== 'match') return;
    const card = this.activeModeState.deck.find(c => c.id === cardId);
    if (!card || card.matched || card.flipped) return;

    if (this.activeModeState.flippedCards.length >= 2) {
      return;
    }

    card.flipped = true;
    this.activeModeState.flippedCards.push(card);
    this.recordEvent('card_flip', { cardId });

    if (this.activeModeState.flippedCards.length === 2) {
      const [first, second] = this.activeModeState.flippedCards;
      const isMatch = first.pairKey === second.pairKey;
      this.currentMetrics.attempts++;

      if (isMatch) {
        first.matched = true;
        second.matched = true;
        this.activeModeState.matchesFound++;
        this.currentMetrics.correctCount++;
        this.activeModeState.flippedCards = [];
        showToast('Wonderful pair matched!', 'sentiment_satisfied');
        this.notify();

        if (this.activeModeState.matchesFound >= this.activeModeState.totalPairs) {
          setTimeout(() => {
            this.completeSession();
          }, 800);
        }
      } else {
        this.currentMetrics.repeatedErrors++;
        setTimeout(() => {
          first.flipped = false;
          second.flipped = false;
          this.activeModeState.flippedCards = [];
          this.notify();
        }, 1200);
      }
    }
    this.notify();
  }

  // Memory Match hint: briefly reveals an unmatched pair
  revealMatchHintPair() {
    if (!this.activeModeState || this.activeModeState.type !== 'match') return;
    const unmatched = this.activeModeState.deck.filter(c => !c.matched);
    if (unmatched.length < 2) return;
    const first = unmatched[0];
    const pair = unmatched.find(c => c.id !== first.id && c.pairKey === first.pairKey);
    if (first && pair) {
      first.flipped = true;
      pair.flipped = true;
      this.currentMetrics.hintsUsed++;
      this.recordEvent('match_hint_revealed');
      this.notify();
      setTimeout(() => {
        if (!first.matched) first.flipped = false;
        if (!pair.matched) pair.flipped = false;
        this.notify();
      }, 2000);
    }
  }

  // 2. Personal Memory Recall: Clue inspection
  inspectClue(clueId) {
    if (!this.activeModeState || this.activeModeState.type !== 'clue-recall') return;
    const clue = this.activeModeState.clues.find(c => c.id === clueId);
    if (!clue || clue.inspected) return;
    clue.inspected = true;
    this.activeModeState.inspectedCount++;
    this.recordEvent('clue_inspected', { clueId });
    showToast(`Memory Clue: ${clue.detail}`, 'lightbulb');
    this.notify();
  }

  // 3. People & Relationships: Connect person to relationship
  selectPersonForRelation(personId) {
    if (!this.activeModeState || this.activeModeState.type !== 'relation-match') return;
    this.activeModeState.selectedPersonId = personId;
    this.recordEvent('relation_person_selected', { personId });
    this.notify();
  }

  connectRelationship(personId, roleTitle) {
    if (!this.activeModeState || this.activeModeState.type !== 'relation-match') return;
    const pId = personId || this.activeModeState.selectedPersonId;
    if (!pId) {
      showToast('First tap a family member on the left', 'touch_app');
      return;
    }
    const person = this.activeModeState.people.find(p => p.id === pId);
    if (!person) return;

    this.currentMetrics.attempts++;
    const isMatch = person.role.toLowerCase().includes(roleTitle.toLowerCase()) || roleTitle.toLowerCase().includes(person.role.toLowerCase());

    if (!this.activeModeState.connectedPairs.includes(pId)) {
      this.activeModeState.connectedPairs.push(pId);
      this.currentMetrics.correctCount++;
      showToast(`Connected ${person.name} with ${person.role}!`, 'favorite');
    }
    this.activeModeState.selectedPersonId = null;
    this.recordEvent('relationship_connected', { personId: pId, roleTitle });
    this.notify();
  }

  // 4. Photo Story: Place story tile in timeline
  placeStoryTile(tileId) {
    if (!this.activeModeState || this.activeModeState.type !== 'story-builder') return;
    const tile = this.activeModeState.tiles.find(t => t.id === tileId);
    if (!tile || this.activeModeState.placedTiles.some(pt => pt.id === tileId)) return;

    this.activeModeState.placedTiles.push(tile);
    this.currentMetrics.attempts++;
    this.currentMetrics.correctCount++;
    this.recordEvent('story_tile_placed', { tileId });
    showToast(`Story Moment Added: ${tile.title}`, 'auto_stories');
    this.notify();
  }

  // 5. Memory Reconstruction: Slot puzzle piece
  slotPuzzlePiece(slotId) {
    if (!this.activeModeState || this.activeModeState.type !== 'puzzle-assembly') return;
    const slot = this.activeModeState.slots.find(s => s.id === slotId);
    if (!slot || slot.slotted) return;

    slot.slotted = true;
    this.activeModeState.slottedCount++;
    this.currentMetrics.attempts++;
    this.currentMetrics.correctCount++;
    this.recordEvent('puzzle_slot_assembled', { slotId });
    showToast(`Reconstructed: ${slot.title}`, 'check_circle');
    this.notify();
  }

  // 6. Attention Hunt: Tap item in scene
  tapHuntItem(itemId) {
    if (!this.activeModeState || this.activeModeState.type !== 'hunt') return;
    const item = this.activeModeState.items.find(i => i.id === itemId);
    if (!item || item.found) return;

    this.currentMetrics.attempts++;
    if (item.isTarget) {
      item.found = true;
      this.activeModeState.foundCount++;
      this.currentMetrics.correctCount++;
      showToast(`Found harvest token! (${this.activeModeState.foundCount} of ${this.activeModeState.targetCount})`, 'sentiment_satisfied');
    } else {
      this.currentMetrics.repeatedErrors++;
      showToast('Take another gentle look at the tea garden.', 'lightbulb');
    }
    this.recordEvent('hunt_tap', { itemId, isTarget: item.isTarget });
    this.notify();
  }

  // 7. Familiar Object Recognition: Identify object
  identifyObject(objectId) {
    if (!this.activeModeState || this.activeModeState.type !== 'object-catalog') return;
    this.activeModeState.identifiedId = objectId;
    const obj = this.activeModeState.objects.find(o => o.id === objectId);
    this.currentMetrics.attempts++;
    if (obj && obj.isTarget) {
      this.currentMetrics.correctCount++;
      showToast(`Identified ${obj.title}! Exactly right.`, 'check_circle');
    } else {
      showToast('Notice the golden diya with five brass tiers.', 'lightbulb');
    }
    this.recordEvent('object_identified', { objectId });
    this.notify();
  }

  // 8. Sound Recognition: Select acoustic source
  selectSoundSource(sourceId) {
    if (!this.activeModeState || this.activeModeState.type !== 'sound-studio') return;
    this.activeModeState.selectedSourceId = sourceId;
    const src = this.activeModeState.sources.find(s => s.id === sourceId);
    this.currentMetrics.attempts++;
    if (src && src.isCorrect) {
      this.currentMetrics.correctCount++;
      showToast(`Recognized ${src.title}! Peaceful monsoon rain.`, 'sentiment_satisfied');
    }
    this.recordEvent('sound_source_selected', { sourceId });
    this.notify();
  }

  // 9. Pattern Predictor: Select next pattern item
  selectPatternNext(choiceId) {
    if (!this.activeModeState || this.activeModeState.type !== 'pattern-puzzle') return;
    this.activeModeState.chosenOption = choiceId;
    this.selectOption(choiceId);
    this.currentMetrics.attempts++;
    this.currentMetrics.correctCount++;
    showToast('Harmonious pattern cadence completed!', 'sentiment_satisfied');
    this.recordEvent('pattern_choice_selected', { choiceId });
    this.notify();
  }

  // 10. Object Sorting: Tap item then tap bucket (or drag)
  selectSortItem(itemId) {
    if (!this.activeModeState || this.activeModeState.type !== 'bucket-sort') return;
    this.activeModeState.selectedItemId = itemId;
    this.recordEvent('sort_item_selected', { itemId });
    this.notify();
  }

  sortItemToBucket(itemId, bucketName) {
    if (!this.activeModeState || this.activeModeState.type !== 'bucket-sort') return;
    const itId = itemId || this.activeModeState.selectedItemId;
    if (!itId) {
      showToast('First tap an item above to choose it', 'touch_app');
      return;
    }
    const item = this.activeModeState.items.find(i => i.id === itId);
    if (!item) return;

    item.userBucket = bucketName;
    this.activeModeState.placedCount = this.activeModeState.items.filter(i => i.userBucket !== null).length;
    this.activeModeState.selectedItemId = null;

    this.currentMetrics.attempts++;
    if (item.correctBucket === bucketName) {
      this.currentMetrics.correctCount++;
      showToast(`Placed "${item.title}" into ${bucketName}!`, 'check_circle');
    } else {
      this.currentMetrics.repeatedErrors++;
      showToast(`Placed in ${bucketName}.`, 'info');
    }
    this.recordEvent('sort_item', { itemId: itId, bucketName });
    this.notify();
  }

  // 11, 12, 13: Move sequence items up or down
  moveSequenceItem(index, direction) {
    if (!this.activeModeState || !this.activeModeState.currentOrder) return;
    const items = [...this.activeModeState.currentOrder];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;
    this.activeModeState.currentOrder = items;
    this.recordEvent('sequence_reorder', { from: index, to: targetIdx });
    this.notify();
  }

  // 14. Shopping Memory: Advance from memo to market shelf & collect into basket
  advanceShoppingPhase() {
    if (!this.activeModeState || this.activeModeState.type !== 'shopping-basket') return;
    this.activeModeState.phase = 'market';
    this.recordEvent('shopping_market_revealed');
    showToast('List memorized! Now tap the items to put in your basket.', 'shopping_basket');
    this.notify();
  }

  collectShoppingItem(itemId) {
    if (!this.activeModeState || this.activeModeState.type !== 'shopping-basket') return;
    const item = this.activeModeState.marketShelf.find(s => s.id === itemId);
    if (!item || item.collected) return;

    item.collected = true;
    this.currentMetrics.attempts++;
    if (item.onList) {
      this.activeModeState.basket.push(item);
      this.currentMetrics.correctCount++;
      showToast(`Added ${item.title} to shopping basket!`, 'shopping_bag');
    } else {
      this.currentMetrics.repeatedErrors++;
      showToast(`${item.title} was not on the list.`, 'info');
    }
    this.recordEvent('shopping_item_collected', { itemId, onList: item.onList });
    this.notify();
  }

  // 15. Memory Journey: Visit waypoint along trail
  visitJourneyWaypoint(wpId) {
    if (!this.activeModeState || this.activeModeState.type !== 'scenic-trail') return;
    const wp = this.activeModeState.waypoints.find(w => w.id === wpId);
    if (!wp) return;
    wp.visited = true;
    this.activeModeState.activeWaypoint = wp;
    this.currentMetrics.attempts++;
    this.currentMetrics.correctCount++;
    this.recordEvent('journey_waypoint_visited', { wpId });
    showToast(`Scenic Stop: ${wp.title} (${wp.sensory})`, 'explore');
    this.notify();
  }

  // 16. Place Explorer: Inspect sanctuary
  inspectSanctuary(scId) {
    if (!this.activeModeState || this.activeModeState.type !== 'sanctuary-mapping') return;
    const sc = this.activeModeState.sanctuaries.find(s => s.id === scId);
    if (!sc) return;
    sc.inspected = true;
    this.activeModeState.activeSanctuary = sc;
    this.currentMetrics.attempts++;
    this.currentMetrics.correctCount++;
    this.recordEvent('sanctuary_inspected', { scId });
    showToast(`Sanctuary: ${sc.name} — ${sc.memory}`, 'cottage');
    this.notify();
  }

  // 17. Life Simulation: Toggle comfort item
  toggleScenarioItem(itemId) {
    if (!this.activeModeState || this.activeModeState.type !== 'scenario-select') return;
    const item = this.activeModeState.items.find(i => i.id === itemId);
    if (!item) return;

    item.selected = !item.selected;
    this.activeModeState.selectedCount = this.activeModeState.items.filter(i => i.selected).length;
    this.currentMetrics.attempts++;
    if (item.selected && item.isHelpful) {
      this.currentMetrics.correctCount++;
      showToast(`Selected "${item.title}" for peaceful comfort.`, 'sentiment_satisfied');
    }
    this.recordEvent('scenario_item_toggled', { itemId, selected: item.selected });
    this.notify();
  }

  // 18. Voice Recall: Toggle recording & transcript persistence
  toggleVoiceRecording() {
    if (!this.activeModeState || this.activeModeState.type !== 'voice-studio') return;
    this.activeModeState.isRecording = !this.activeModeState.isRecording;
    if (this.activeModeState.isRecording) {
      showToast('Listening softly... Speak at your comfortable pace.', 'mic');
      this.recordEvent('voice_recording_started');
    } else {
      showToast('Voice thought recorded warmly.', 'mic_none');
      this.recordEvent('voice_recording_stopped');
    }
    this.notify();
  }

  setVoiceTranscript(transcript) {
    if (!this.activeModeState || this.activeModeState.type !== 'voice-studio') return;
    this.activeModeState.transcript = transcript;
    this.notify();
  }

  saveVoiceMemory(customTitle = null) {
    if (!this.activeModeState || this.activeModeState.type !== 'voice-studio') return null;
    const patientId = (this.currentSession && this.currentSession.patientId) || store.getCurrentPatientId();
    const title = customTitle || (this.currentActivity ? `Voice Memory • ${this.currentActivity.name}` : 'Personal Voice Memory');
    const transcript = this.activeModeState.transcript || 'Spoken reminiscence recorded during cognitive activity.';

    const record = store.addVoiceMemory({
      patientId,
      title,
      transcript,
      createdAt: new Date().toISOString()
    });

    this.activeModeState.isSaved = true;
    this.currentMetrics.attempts++;
    this.currentMetrics.correctCount++;
    this.recordEvent('voice_memory_saved', { id: record.id, title: record.title });
    this.notify();
    return record;
  }

  getActiveModeState() {
    return this.activeModeState;
  }

  // 19. Festival Memory: Collect token
  collectFestivalToken(tokenId) {
    if (!this.activeModeState || this.activeModeState.type !== 'festival-scene') return;
    const token = this.activeModeState.tokens.find(t => t.id === tokenId);
    if (!token || token.collected) return;

    token.collected = true;
    this.activeModeState.collectedCount++;
    this.currentMetrics.attempts++;
    this.currentMetrics.correctCount++;
    this.recordEvent('festival_token_collected', { tokenId });
    showToast(`Gathered: ${token.title}`, 'celebration');
    this.notify();
  }

  // 20. Family Memory Mission: Advance mission stage
  advanceMissionStage(stageNumber) {
    if (!this.activeModeState || this.activeModeState.type !== 'mission-adventure') return;
    if (!this.activeModeState.completedStages.includes(stageNumber)) {
      this.activeModeState.completedStages.push(stageNumber);
      this.currentMetrics.attempts++;
      this.currentMetrics.correctCount++;
    }
    if (this.activeModeState.currentStage < this.activeModeState.stages.length) {
      this.activeModeState.currentStage++;
      showToast(`Mission Step ${this.activeModeState.currentStage} unlocked!`, 'flag');
    } else {
      showToast('Family Memory Mission Complete! 🌿', 'workspace_premium');
    }
    this.recordEvent('mission_stage_advanced', { stageNumber });
    this.notify();
  }

  recordHint() {
    this.currentMetrics.hintsUsed++;
    if (this.currentSession) {
      this.currentSession.hintsUsed = this.currentMetrics.hintsUsed;
    }

    // In Memory Match, hint reveals a pair
    if (this.activeModeState && this.activeModeState.type === 'match') {
      this.revealMatchHintPair();
    }

    const act = store.getActiveActivity();
    this.recordEvent('hint_requested');
    this.notify();
    return act ? act.hint : '';
  }

  getHint() {
    return this.recordHint();
  }

  skipStep() {
    this.currentMetrics.skippedTasks++;
    this.currentMetrics.attempts++;
    this.recordEvent('step_skip');
    store.advanceActivityStep();
    if (this.currentSession) {
      this.currentSession.currentStep = (this.currentSession.currentStep || 1) + 1;
    }
    this.stepStartTime = Date.now();
    showToast('Moved to next step gently', 'skip_next');
    this.notify();
  }

  evaluateStep() {
    const act = store.getActiveActivity();
    if (!act) return { status: 'no_activity' };

    const selected = act.options ? act.options.find(o => o.id === act.selectedOption) : null;
    const latencySec = ((Date.now() - this.stepStartTime) / 1000).toFixed(1);

    if (!selected) {
      showToast('Please select an option to continue', 'touch_app');
      return { status: 'unselected' };
    }

    this.currentMetrics.attempts++;
    const isCorrect = selected.correct === true;
    let feedback = '';

    const patient = store.getState().currentUser || store.getState().profile || { name: 'Asha' };
    const patientName = patient.name ? patient.name.split(' ')[0] : 'Asha';

    if (isCorrect) {
      this.currentMetrics.correctCount++;
      feedback = `Wonderful recollection, ${patientName}! "${selected.title}" is correct.`;
      speechService.speak(`Wonderful, ${patientName}! Exactly right. ${selected.title}.`);
      showToast('Step completed with high warmth!', 'sentiment_satisfied');
    } else {
      this.currentMetrics.repeatedErrors++;
      const correctOpt = act.options.find(o => o.correct);
      feedback = `Good thought, ${patientName}. The familiar choice is: "${correctOpt ? correctOpt.title : ''}".`;
      speechService.speak(`Good effort, ${patientName}. Take your time.`);
      showToast('Step recorded gently', 'check_circle');
    }

    this.recordEvent('step_evaluated', { isCorrect, selectedOption: selected.id, latencySec });

    const wasLastStep = act.currentStep >= act.totalSteps;

    // Advance step in store
    store.advanceActivityStep();
    if (this.currentSession) {
      this.currentSession.currentStep = act.currentStep;
    }
    this.stepStartTime = Date.now();

    let sessionSummary = null;
    if (wasLastStep) {
      sessionSummary = this.completeSession();
    } else {
      this.notify();
    }

    return {
      status: isCorrect ? 'correct' : 'guided',
      feedback,
      latency: latencySec,
      isComplete: wasLastStep,
      sessionSummary
    };
  }

  completeSession() {
    const act = store.getActiveActivity();
    const totalSteps = act?.totalSteps || 3;

    const rawTimeSec = Math.round((Date.now() - (this.sessionStartTime || Date.now()) - this.totalPausedDurationMs) / 1000);
    const totalTimeSec = Math.max(1, rawTimeSec);

    const attempts = Math.max(1, this.currentMetrics.attempts || totalSteps);
    const correct = this.currentMetrics.correctCount || totalSteps;
    const accuracyPct = Math.min(100, Math.round((correct / attempts) * 100));

    let assistanceLevel = 'Independent';
    if (this.currentMetrics.hintsUsed >= 2 || this.currentMetrics.repeatedErrors >= 2) {
      assistanceLevel = 'Full Companion Support';
    } else if (this.currentMetrics.hintsUsed > 0 || this.currentMetrics.repeatedErrors > 0) {
      assistanceLevel = 'Gentle Guidance';
    }

    let engagement = 'Serene & Comforting';
    if (accuracyPct >= 80 && totalTimeSec < 180) {
      engagement = 'High Focus';
    } else if (accuracyPct >= 60) {
      engagement = 'Warmly Engaged';
    }

    const pid = this.currentSession?.patientId || store.getCurrentPatientId();

    const sessionSummary = {
      id: this.currentSession?.id || ('sess-' + Date.now()),
      activityId: act?.id || 'act-1',
      activityName: act?.name || 'Cognitive Activity',
      category: act?.category || 'REMEMBER',
      patientId: pid,
      accuracy: accuracyPct,
      score: accuracyPct,
      completionTimeSec: totalTimeSec,
      duration: totalTimeSec,
      attempts: this.currentMetrics.attempts,
      hintsUsed: this.currentMetrics.hintsUsed,
      mistakes: this.currentMetrics.repeatedErrors,
      skipped: this.currentMetrics.skippedTasks > 0,
      skippedTasks: this.currentMetrics.skippedTasks,
      repeatedErrors: this.currentMetrics.repeatedErrors,
      difficultyLevel: act?.difficulty || 1,
      assistanceLevel,
      engagement,
      completedAt: new Date().toISOString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today'
    };

    if (this.currentSession) {
      this.currentSession.status = 'completed';
      this.currentSession.completedAt = sessionSummary.completedAt;
      this.currentSession.accuracy = accuracyPct;
      this.currentSession.score = accuracyPct;
      this.currentSession.duration = totalTimeSec;
      this.currentSession.mistakes = this.currentMetrics.repeatedErrors;
      this.currentSession.hintsUsed = this.currentMetrics.hintsUsed;
    }

    this.lastSessionSummary = sessionSummary;
    store.recordActivitySession(sessionSummary);
    this.recordEvent('session_completed', { accuracy: accuracyPct, totalTimeSec });
    this.notify();
    return sessionSummary;
  }

  readQuestionAloud() {
    const act = store.getActiveActivity();
    if (act && act.question) {
      speechService.speak(act.question);
    }
  }

  getLastSessionSummary() {
    return this.lastSessionSummary;
  }

  getSessionState() {
    return {
      session: this.currentSession,
      metrics: this.currentMetrics,
      modeState: this.activeModeState,
      lastSummary: this.lastSessionSummary
    };
  }
}

export const activityEngine = new ActivityEngine();
