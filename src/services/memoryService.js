// MindMitra Memory Context Service - Living Archive Engine
// Provides connected personal reminiscence queries, relationships, and SmritiAI context
import { store } from '../state/store.js';

export const MEMORY_CATEGORIES = {
  ALL: 'All Memories',
  PEOPLE: 'People',
  PLACES: 'Places',
  SPECIAL_MOMENTS: 'Special Moments',
  STORIES: 'Stories',
  VOICE_NOTES: 'Voice Notes',
  FAVORITES: 'Favorites',
  IMPORTANT: 'Important'
};

export const FALLBACK_MEMORY_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9quruDM6l-lR-7W24pE_W0NX2mY7MEiDYMl7ql2sZ_QRQ7D-NH9U4cKzj7UJEsP6HAz9UYIXzvWUwLSf9435pp57UHZoEfZpAQ5tcAOs3WdTs3FbMByQj6sgTUZHHPZ-FJGZaZb1Pq8fZYr8634oUGltshBb5QKGGDMKbefz5AzrIxUJXVoDWm-io97RbcNo_e9PL-KCRfocNbcDNjEieNZn-WLyl4RytmqvYfXuB7IpvmQvpZS8d';

class MemoryService {
  normalizePatientId(patientId) {
    if (!patientId) return store.getCurrentPatientId();
    if (patientId === 'usr-asha' || patientId === 'user-asha') return 'user-asha';
    return patientId;
  }

  isPatientMatch(itemPatientId, requestedPatientId) {
    if (!itemPatientId) return true;
    const itemPid = this.normalizePatientId(itemPatientId);
    const reqPid = this.normalizePatientId(requestedPatientId);
    return itemPid === reqPid;
  }

  getPatientMemories(patientId) {
    const pid = this.normalizePatientId(patientId);
    const state = store.getState();
    return (state.memories || []).filter(m => this.isPatientMatch(m.patientId, pid));
  }

  getMemories(patientId) {
    return this.getPatientMemories(patientId);
  }

  getMemoryImage(imgUrl) {
    return imgUrl || FALLBACK_MEMORY_IMAGE;
  }

  getPeople(patientId) {
    const pid = this.normalizePatientId(patientId);
    const state = store.getState();
    return (state.people || []).filter(p => this.isPatientMatch(p.patientId, pid));
  }

  getPlaces(patientId) {
    const pid = this.normalizePatientId(patientId);
    const state = store.getState();
    return (state.places || []).filter(p => this.isPatientMatch(p.patientId, pid));
  }

  getEvents(patientId) {
    const pid = this.normalizePatientId(patientId);
    const state = store.getState();
    return (state.events || []).filter(e => this.isPatientMatch(e.patientId, pid));
  }

  getStories(patientId) {
    const pid = this.normalizePatientId(patientId);
    const state = store.getState();
    return (state.stories || []).filter(s => this.isPatientMatch(s.patientId, pid));
  }

  getVoiceMemories(patientId) {
    const pid = this.normalizePatientId(patientId);
    const state = store.getState();
    return (state.voiceMemories || []).filter(v => this.isPatientMatch(v.patientId, pid));
  }

  getRelationships(patientId) {
    const pid = this.normalizePatientId(patientId);
    const state = store.getState();
    return (state.memoryRelationships || []).filter(r => this.isPatientMatch(r.patientId, pid));
  }

  getMemoryById(memoryId) {
    const state = store.getState();
    return (state.memories || []).find(m => m.id === memoryId) || null;
  }

  /**
   * Computes related memories using bidirectional relationship lookup
   * and shared people, place, or event connections.
   */
  getRelatedMemories(memoryId) {
    const state = store.getState();
    const memory = (state.memories || []).find(m => m.id === memoryId);
    if (!memory) return [];

    const pid = this.normalizePatientId(memory.patientId);
    const allPatientMemories = this.getPatientMemories(pid).filter(m => m.id !== memoryId);
    const relationships = this.getRelationships(pid);

    // Collect all related entity IDs
    const relatedPersonIds = new Set(memory.personIds || []);
    const relatedPlaceIds = new Set(memory.placeId ? [memory.placeId] : []);
    const relatedEventIds = new Set(memory.eventId ? [memory.eventId] : []);

    relationships.forEach(rel => {
      if (rel.sourceId === memoryId) {
        if (rel.targetType === 'person') relatedPersonIds.add(rel.targetId);
        if (rel.targetType === 'place') relatedPlaceIds.add(rel.targetId);
        if (rel.targetType === 'event') relatedEventIds.add(rel.targetId);
      } else if (rel.targetId === memoryId) {
        if (rel.sourceType === 'person') relatedPersonIds.add(rel.sourceId);
        if (rel.sourceType === 'place') relatedPlaceIds.add(rel.sourceId);
        if (rel.sourceType === 'event') relatedEventIds.add(rel.sourceId);
      }
    });

    // Score and filter related memories
    const scoredMemories = allPatientMemories.map(other => {
      let score = 0;
      // Match by person
      if (other.personIds && other.personIds.some(p => relatedPersonIds.has(p))) score += 3;
      // Match by place
      if (other.placeId && relatedPlaceIds.has(other.placeId)) score += 3;
      // Match by event
      if (other.eventId && relatedEventIds.has(other.eventId)) score += 3;
      // Match by shared category
      if (other.category && other.category === memory.category) score += 1;

      return { memory: other, score };
    }).filter(item => item.score > 0);

    scoredMemories.sort((a, b) => b.score - a.score);
    return scoredMemories.map(item => item.memory);
  }

  /**
   * Generates clean structured semantic context for future SmritiAI integration
   */
  getMemoryContext(memoryId) {
    const state = store.getState();
    const memory = (state.memories || []).find(m => m.id === memoryId);
    if (!memory) return null;

    const pid = this.normalizePatientId(memory.patientId);
    const people = this.getPeople(pid).filter(p => (memory.personIds || []).includes(p.id));
    const place = this.getPlaces(pid).find(plc => plc.id === memory.placeId) || null;
    const event = this.getEvents(pid).find(e => e.id === memory.eventId) || null;
    const story = this.getStories(pid).find(s => s.id === memory.storyId || s.eventId === memory.eventId) || null;
    const voiceMemory = this.getVoiceMemories(pid).find(v => v.memoryId === memory.id || (story && v.storyId === story.id)) || null;
    const related = this.getRelatedMemories(memoryId);

    const patient = (state.users || []).find(u => u.id === pid) || state.currentUser || state.profile;

    return {
      memoryId: memory.id,
      patientName: patient?.name || 'Asha Devi',
      title: memory.title,
      category: memory.category,
      season: memory.season || memory.year,
      timeOfDay: memory.timeOfDay,
      cue: memory.cue,
      quote: memory.quote,
      description: memory.description,
      people: people.map(p => ({ id: p.id, name: p.name, relation: p.relation })),
      place: place ? { id: place.id, name: place.name, region: place.region } : null,
      event: event ? { id: event.id, title: event.name || event.title, date: event.date } : null,
      story: story ? { id: story.id, title: story.title, text: story.text } : null,
      voiceMemory: voiceMemory ? { id: voiceMemory.id, transcript: voiceMemory.transcript } : null,
      relatedMemoriesCount: related.length,
      favorite: Boolean(memory.favorite),
      important: Boolean(memory.important)
    };
  }

  /**
   * Deep multi-field search across patient memories, connected people, places, events, and stories
   */
  searchMemories(patientId, query = '') {
    const pid = this.normalizePatientId(patientId);
    const memories = this.getPatientMemories(pid);
    const q = (query || '').trim().toLowerCase();

    if (!q) return memories;

    const peopleMap = new Map(this.getPeople(pid).map(p => [p.id, p]));
    const placesMap = new Map(this.getPlaces(pid).map(p => [p.id, p]));
    const eventsMap = new Map(this.getEvents(pid).map(e => [e.id, e]));
    const storiesMap = new Map(this.getStories(pid).map(s => [s.id, s]));

    return memories.filter(mem => {
      // Direct fields
      if (mem.title && mem.title.toLowerCase().includes(q)) return true;
      if (mem.description && mem.description.toLowerCase().includes(q)) return true;
      if (mem.transcript && mem.transcript.toLowerCase().includes(q)) return true;
      if (mem.narrationText && mem.narrationText.toLowerCase().includes(q)) return true;
      if (mem.quote && mem.quote.toLowerCase().includes(q)) return true;
      if (mem.companions && mem.companions.toLowerCase().includes(q)) return true;
      if (mem.year && mem.year.toLowerCase().includes(q)) return true;
      if (mem.season && mem.season.toLowerCase().includes(q)) return true;
      if (mem.category && mem.category.toLowerCase().includes(q)) return true;
      if (mem.tags && mem.tags.some(t => t.toLowerCase().includes(q))) return true;

      // Connected People
      if (mem.personIds && mem.personIds.some(pId => {
        const p = peopleMap.get(pId);
        return p && (p.name.toLowerCase().includes(q) || (p.relation && p.relation.toLowerCase().includes(q)));
      })) return true;

      // Connected Place
      if (mem.placeId) {
        const plc = placesMap.get(mem.placeId);
        if (plc && (plc.name.toLowerCase().includes(q) || (plc.region && plc.region.toLowerCase().includes(q)))) {
          return true;
        }
      }

      // Connected Event
      if (mem.eventId) {
        const evt = eventsMap.get(mem.eventId);
        if (evt && ((evt.name && evt.name.toLowerCase().includes(q)) || (evt.title && evt.title.toLowerCase().includes(q)))) {
          return true;
        }
      }

      // Connected Story
      if (mem.storyId) {
        const sty = storiesMap.get(mem.storyId);
        if (sty && (sty.title.toLowerCase().includes(q) || sty.text.toLowerCase().includes(q))) {
          return true;
        }
      }

      return false;
    });
  }

  /**
   * Filter memories by category tab, search query, favorites, and important flags
   */
  filterMemories(patientId, { category = 'All Memories', search = '', onlyFavorites = false, onlyImportant = false } = {}) {
    let list = this.searchMemories(patientId, search);

    if (category === 'Favorites' || onlyFavorites) {
      list = list.filter(m => Boolean(m.favorite));
    } else if (category === 'Important' || onlyImportant) {
      list = list.filter(m => Boolean(m.important));
    } else if (category && category !== 'All Memories') {
      list = list.filter(m => m.category.toLowerCase() === category.toLowerCase());
    }

    return list;
  }

  // --- Entity with Context Resolvers ---
  getPersonWithContext(personId) {
    const state = store.getState();
    const person = (state.people || []).find(p => p.id === personId);
    if (!person) return null;

    const pid = this.normalizePatientId(person.patientId);
    const connectedMemories = this.getPatientMemories(pid).filter(m => 
      (m.personIds || []).includes(personId) || (person.connectedMemoryIds || []).includes(m.id)
    );
    const connectedEvents = this.getEvents(pid).filter(e => 
      (e.linkedMemoryIds || []).some(mId => connectedMemories.some(m => m.id === mId))
    );
    const connectedStories = this.getStories(pid).filter(s => 
      (s.personIds || []).includes(personId)
    );

    return {
      person,
      memories: connectedMemories,
      events: connectedEvents,
      stories: connectedStories
    };
  }

  getPersonById(personId, patientId = null) {
    const pid = this.normalizePatientId(patientId);
    return this.getPeople(pid).find(p => p.id === personId) || null;
  }

  /**
   * Builds the Shared Memory Journey connecting Person -> Memories -> Places -> Events -> Stories -> Photos
   */
  getSharedMemoryJourney(personId, patientId = null) {
    const pid = this.normalizePatientId(patientId);
    const person = this.getPersonById(personId, pid);
    if (!person) return null;

    const allMemories = this.getPatientMemories(pid);
    const allRelationships = this.getRelationships(pid);
    const allPlaces = this.getPlaces(pid);
    const allEvents = this.getEvents(pid);
    const allStories = this.getStories(pid);
    const allVoiceMemories = this.getVoiceMemories(pid);

    // 1. Connected memories
    const connectedMemoryIds = new Set(person.connectedMemoryIds || []);
    allMemories.forEach(m => {
      if (Array.isArray(m.personIds) && m.personIds.includes(personId)) {
        connectedMemoryIds.add(m.id);
      }
    });
    allRelationships.forEach(rel => {
      if (rel.sourceType === 'memory' && rel.targetType === 'person' && rel.targetId === personId) {
        connectedMemoryIds.add(rel.sourceId);
      } else if (rel.sourceType === 'person' && rel.sourceId === personId && rel.targetType === 'memory') {
        connectedMemoryIds.add(rel.targetId);
      }
    });
    const memories = allMemories.filter(m => connectedMemoryIds.has(m.id));

    // 2. Connected places
    const placeIds = new Set();
    memories.forEach(m => { if (m.placeId) placeIds.add(m.placeId); });
    allRelationships.forEach(rel => {
      if (rel.sourceType === 'person' && rel.sourceId === personId && rel.targetType === 'place') {
        placeIds.add(rel.targetId);
      } else if (rel.sourceType === 'place' && rel.targetType === 'person' && rel.targetId === personId) {
        placeIds.add(rel.sourceId);
      }
    });
    const places = allPlaces.filter(p => placeIds.has(p.id));

    // 3. Connected events
    const eventIds = new Set();
    memories.forEach(m => { if (m.eventId) eventIds.add(m.eventId); });
    allRelationships.forEach(rel => {
      if (rel.sourceType === 'person' && rel.sourceId === personId && rel.targetType === 'event') {
        eventIds.add(rel.targetId);
      } else if (rel.sourceType === 'event' && rel.targetType === 'person' && rel.targetId === personId) {
        eventIds.add(rel.sourceId);
      }
    });
    const events = allEvents.filter(e => eventIds.has(e.id));

    // 4. Connected stories
    const stories = allStories.filter(s => 
      (Array.isArray(s.personIds) && s.personIds.includes(personId)) ||
      memories.some(m => m.storyId === s.id || m.eventId === s.eventId)
    );

    // 5. Connected photos
    const photosMap = new Map();
    if (person.avatar) {
      photosMap.set(person.avatar, {
        url: person.avatar,
        title: `${person.name}'s Portrait`,
        year: 'Cherished',
        caption: `${person.name} (${person.relation})`
      });
    }
    memories.forEach(m => {
      const img = m.image || m.coverPhoto;
      if (img && !photosMap.has(img)) {
        photosMap.set(img, {
          url: img,
          title: m.title,
          year: m.year || m.date || 'Keepsake',
          caption: m.description || m.quote || m.title
        });
      }
    });
    places.forEach(p => {
      if (p.image && !photosMap.has(p.image)) {
        photosMap.set(p.image, {
          url: p.image,
          title: p.name,
          year: p.region || 'Sanctuary',
          caption: p.description || p.name
        });
      }
    });
    const photos = Array.from(photosMap.values());

    return {
      person,
      memories,
      places,
      events,
      stories,
      photos,
      voiceMemories: allVoiceMemories.slice(0, 3),
      stats: {
        memoriesCount: memories.length,
        placesCount: places.length,
        storiesCount: stories.length,
        photosCount: photos.length
      }
    };
  }

  getPlaceWithContext(placeId) {
    const state = store.getState();
    const place = (state.places || []).find(p => p.id === placeId);
    if (!place) return null;

    const pid = this.normalizePatientId(place.patientId);
    const connectedMemories = this.getPatientMemories(pid).filter(m => 
      m.placeId === placeId || (place.connectedMemoryIds || []).includes(m.id)
    );
    const connectedEvents = this.getEvents(pid).filter(e => e.placeId === placeId);
    const connectedStories = this.getStories(pid).filter(s => s.placeId === placeId);
    const connectedPeople = this.getPeople(pid).filter(p => 
      connectedMemories.some(m => (m.personIds || []).includes(p.id))
    );

    return {
      place,
      memories: connectedMemories,
      events: connectedEvents,
      stories: connectedStories,
      people: connectedPeople
    };
  }

  getEventWithContext(eventId) {
    const state = store.getState();
    const event = (state.events || []).find(e => e.id === eventId);
    if (!event) return null;

    const pid = this.normalizePatientId(event.patientId);
    const connectedMemories = this.getPatientMemories(pid).filter(m => 
      m.eventId === eventId || (event.linkedMemoryIds || []).includes(m.id)
    );
    const venuePlace = event.placeId ? this.getPlaces(pid).find(p => p.id === event.placeId) : null;
    const participants = this.getPeople(pid).filter(p => 
      connectedMemories.some(m => (m.personIds || []).includes(p.id))
    );
    const connectedStories = this.getStories(pid).filter(s => s.eventId === eventId);

    return {
      event,
      venuePlace,
      memories: connectedMemories,
      people: participants,
      stories: connectedStories
    };
  }

  getStoryWithContext(storyId) {
    const state = store.getState();
    const story = (state.stories || []).find(s => s.id === storyId);
    if (!story) return null;

    const pid = this.normalizePatientId(story.patientId);
    const connectedMemories = this.getPatientMemories(pid).filter(m => 
      m.storyId === storyId || (story.eventId && m.eventId === story.eventId)
    );
    const event = story.eventId ? this.getEvents(pid).find(e => e.id === story.eventId) : null;
    const place = story.placeId ? this.getPlaces(pid).find(p => p.id === story.placeId) : null;
    const people = this.getPeople(pid).filter(p => (story.personIds || []).includes(p.id));
    const voiceMemory = story.voiceMemoryId ? this.getVoiceMemories(pid).find(v => v.id === story.voiceMemoryId) : null;

    return {
      story,
      memories: connectedMemories,
      event,
      place,
      people,
      voiceMemory
    };
  }

  /**
   * Provides contextual personal reminiscence assets for Cognitive Activities.
   * Gracefully falls back to culturally familiar default tokens if personal data is sparse.
   */
  getActivityMemoryContext(activityId, patientId) {
    const pid = this.normalizePatientId(patientId);
    const memories = this.getPatientMemories(pid);
    const people = this.getPeople(pid);
    const places = this.getPlaces(pid);
    const events = this.getEvents(pid);
    const stories = this.getStories(pid);
    const voiceMemories = this.getVoiceMemories(pid);
    const relationships = this.getRelationships(pid);

    const hasPersonalData = memories.length > 0 || people.length > 0;

    const fallbackPerson = {
      id: 'fallback-person',
      name: 'Meera',
      relationship: 'Daughter',
      notes: 'Visits every morning and shares warm tea.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw'
    };

    const fallbackPlace = {
      id: 'fallback-place',
      name: 'Old Courtyard Veranda',
      region: 'Assam',
      description: 'Quiet sunlit veranda with potted jasmine flowers.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC22wvw0W6QPHS8HfYaEOvuhq3Z64L-LQ6C1Z6eABAuUst6_l0OsfnmESMEWZ3fOFlMGTNXKIDrEe2homASLswMtPqjKeAK5WTQyyneikgGu2NA2GA2tua6IzQ06V31A6_ZE6MzpmFcc5CpWrWaM9xsVn4D61l2PH_TeJ8vhbEWPYhzZSPIbcf2-cSpbse6Gx0UOAqgXHXc3yJULQweZ3c2gM2IQY8iHR1kqA2dh4WS1M6_uoNat6Ja'
    };

    const fallbackEvent = {
      id: 'fallback-event',
      title: 'Autumn Family Gathering',
      date: 'Autumn',
      description: 'Family gathering with festive sweets and brass lamps.'
    };

    const primaryPerson = people[0] || fallbackPerson;
    const secondaryPerson = people[1] || people[0] || fallbackPerson;
    const primaryPlace = places[0] || fallbackPlace;
    const primaryEvent = events[0] || fallbackEvent;
    const primaryStory = stories[0] || {
      id: 'fallback-story',
      title: 'Morning Ginger Tea',
      text: 'Sharing a steaming cup of tea on a peaceful morning.'
    };
    const primaryMemory = memories[0] || {
      id: 'fallback-memory',
      title: 'Morning Veranda Reminiscence',
      description: 'Fresh tea and flowers in the morning sunshine.',
      image: FALLBACK_MEMORY_IMAGE
    };

    return {
      activityId,
      patientId: pid,
      hasPersonalData,
      memories,
      people,
      places,
      events,
      stories,
      voiceMemories,
      relationships,
      primaryPerson,
      secondaryPerson,
      primaryPlace,
      primaryEvent,
      primaryStory,
      primaryMemory,
      fallbackImage: FALLBACK_MEMORY_IMAGE
    };
  }

  /**
   * Returns a complete, scoped snapshot of a patient's Personal Memory World
   * for SmritiAI context injection without duplication or mutation.
   * If passed a specific memory ID (e.g. 'mem-1'), returns the single memory's
   * connected graph context (people, place, event, story).
   */
  getMemoryContext(identifier) {
    const state = store.getState();
    const targetMemory = (state.memories || []).find(m => m.id === identifier);
    if (targetMemory) {
      const pid = this.normalizePatientId(targetMemory.patientId);
      const people = this.getPeople(pid).filter(p => 
        (targetMemory.personIds || []).includes(p.id) || (p.connectedMemoryIds || []).includes(targetMemory.id)
      );
      const place = targetMemory.placeId ? this.getPlaces(pid).find(p => p.id === targetMemory.placeId) : null;
      const event = targetMemory.eventId ? this.getEvents(pid).find(e => e.id === targetMemory.eventId) : null;
      const story = targetMemory.storyId ? this.getStories(pid).find(s => s.id === targetMemory.storyId) : null;
      const relatedMemories = this.getRelatedMemories(targetMemory.id, pid);

      return {
        memory: targetMemory,
        people,
        place,
        event,
        story,
        relatedMemories
      };
    }

    const pid = this.normalizePatientId(identifier);
    const memories = this.getPatientMemories(pid);
    const people = this.getPeople(pid);
    const places = this.getPlaces(pid);
    const events = this.getEvents(pid);
    const stories = this.getStories(pid);
    const voiceMemories = this.getVoiceMemories(pid);
    const relationships = this.getRelationships(pid);

    return {
      patientId: pid,
      hasPersonalData: memories.length > 0 || people.length > 0 || places.length > 0,
      totalMemories: memories.length,
      memories,
      people,
      places,
      events,
      stories,
      voiceMemories,
      relationships
    };
  }

  /**
   * Searches across all entity types (memories, people, places, events, stories)
   * for matching names, locations, tags, notes, or descriptions.
   */
  findRelatedEntities(query, patientId) {
    if (!query || !query.trim()) return { memories: [], people: [], places: [], events: [], stories: [] };
    const q = query.toLowerCase().trim();
    const ctx = this.getMemoryContext(patientId);

    const matchingPeople = ctx.people.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) || 
      (p.relationship && p.relationship.toLowerCase().includes(q)) ||
      (p.notes && p.notes.toLowerCase().includes(q))
    );

    const matchingPlaces = ctx.places.filter(pl => 
      (pl.name && pl.name.toLowerCase().includes(q)) || 
      (pl.region && pl.region.toLowerCase().includes(q)) ||
      (pl.description && pl.description.toLowerCase().includes(q))
    );

    const matchingEvents = ctx.events.filter(e => 
      (e.title && e.title.toLowerCase().includes(q)) || 
      (e.location && e.location.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q))
    );

    const matchingStories = ctx.stories.filter(s => 
      (s.title && s.title.toLowerCase().includes(q)) || 
      (s.text && s.text.toLowerCase().includes(q)) ||
      (s.narrator && s.narrator.toLowerCase().includes(q))
    );

    const matchingMemories = ctx.memories.filter(m => 
      (m.title && m.title.toLowerCase().includes(q)) || 
      (m.description && m.description.toLowerCase().includes(q)) ||
      (m.tags && m.tags.some(t => t.toLowerCase().includes(q)))
    );

    const matchingVoiceMemories = (ctx.voiceMemories || []).filter(v =>
      (v.title && v.title.toLowerCase().includes(q)) ||
      (v.transcript && v.transcript.toLowerCase().includes(q)) ||
      (v.author && v.author.toLowerCase().includes(q))
    );

    return {
      memories: matchingMemories,
      voiceMemories: matchingVoiceMemories,
      people: matchingPeople,
      places: matchingPlaces,
      events: matchingEvents,
      stories: matchingStories
    };
  }

  /**
   * Parses natural or ISO dates into sortable timestamps and extracted 4-digit years.
   */
  parseTimelineDate(dateStr, yearStr) {
    const raw = `${dateStr || ''} ${yearStr || ''}`.trim();
    if (!raw) {
      return { year: 'Date not available', timestamp: 0 };
    }

    // Match 4-digit year (1900-2099)
    const yearMatch = raw.match(/\b(19\d\d|20\d\d)\b/);
    const year = yearMatch ? yearMatch[1] : 'Date not available';

    // Parse month indicators
    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
      spring: 2, summer: 5, autumn: 9, fall: 9, winter: 11
    };

    let month = 0;
    const rawLower = raw.toLowerCase();
    for (const [key, idx] of Object.entries(months)) {
      if (rawLower.includes(key)) {
        month = idx;
        break;
      }
    }

    // Try full Date.parse if it contains standard formats
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed) && yearMatch) {
      return { year, timestamp: parsed };
    }

    if (yearMatch) {
      const yrNum = parseInt(yearMatch[1], 10);
      return { year, timestamp: new Date(yrNum, month, 1).getTime() };
    }

    return { year: 'Date not available', timestamp: 0 };
  }

  /**
   * FEATURE 2 — MEMORY TIMELINE ADAPTER
   * Generates a unified, event-centered chronological timeline over existing memory data.
   * Does NOT duplicate databases or models. Strictly non-destructive read view.
   */
  getMemoryTimeline(patientId, filters = {}) {
    const pid = this.normalizePatientId(patientId);
    const state = store.getState();

    // Patient isolation check: if a caregiver is logged in, verify authorization
    const currentUser = state.currentUser;
    if (currentUser && currentUser.role === 'caregiver' && !store.isAuthorizedForPatient(currentUser.id, pid)) {
      throw new Error(`Unauthorized: Caregiver ${currentUser.id} is not authorized for patient ${pid}`);
    }

    const events = this.getEvents(pid);
    const memories = this.getPatientMemories(pid);
    const stories = this.getStories(pid);
    const voiceMemories = this.getVoiceMemories(pid);
    const people = this.getPeople(pid);
    const places = this.getPlaces(pid);
    const relationships = this.getRelationships(pid);

    const peopleMap = new Map(people.map(p => [p.id, p]));
    const placesMap = new Map(places.map(p => [p.id, p]));

    const consumedMemoryIds = new Set();
    const consumedStoryIds = new Set();
    const consumedVoiceIds = new Set();

    const timelineItems = [];

    // 1. EVENT-CENTERED GROUPING: Group memories, stories, voice notes around Events
    events.forEach(evt => {
      const linkedMemories = memories.filter(m => 
        m.eventId === evt.id || (evt.linkedMemoryIds || []).includes(m.id)
      );
      linkedMemories.forEach(m => consumedMemoryIds.add(m.id));

      const linkedStories = stories.filter(s => 
        s.eventId === evt.id || linkedMemories.some(m => m.storyId === s.id)
      );
      linkedStories.forEach(s => consumedStoryIds.add(s.id));

      const linkedVoiceMemories = voiceMemories.filter(v => 
        (v.storyId && linkedStories.some(s => s.id === v.storyId)) ||
        (v.memoryId && linkedMemories.some(m => m.id === v.memoryId))
      );
      linkedVoiceMemories.forEach(v => consumedVoiceIds.add(v.id));

      // Resolve event place
      let place = null;
      if (evt.placeId) place = placesMap.get(evt.placeId);
      if (!place && linkedMemories.length > 0 && linkedMemories[0].placeId) {
        place = placesMap.get(linkedMemories[0].placeId);
      }

      // Resolve event participants from relationships and linked entities
      const participantIds = new Set();
      relationships.forEach(rel => {
        if ((rel.sourceId === evt.id && rel.targetType === 'person') ||
            (rel.targetId === evt.id && rel.sourceType === 'person')) {
          participantIds.add(rel.sourceType === 'person' ? rel.sourceId : rel.targetId);
        }
      });
      linkedMemories.forEach(m => (m.personIds || []).forEach(pId => participantIds.add(pId)));
      linkedStories.forEach(s => (s.personIds || []).forEach(pId => participantIds.add(pId)));
      const eventPeople = Array.from(participantIds).map(id => peopleMap.get(id)).filter(Boolean);

      // Collect photos
      const photos = [];
      linkedMemories.forEach(m => {
        const photo = m.image || m.coverPhoto;
        if (photo && !photos.includes(photo)) photos.push(photo);
      });

      const parsedDate = this.parseTimelineDate(evt.date, linkedMemories[0]?.year);
      const isFav = linkedMemories.some(m => m.favorite);
      const isImp = linkedMemories.some(m => m.important);

      const coverImg = photos[0] || (place && place.image) || FALLBACK_MEMORY_IMAGE;

      timelineItems.push({
        id: evt.id,
        type: 'event',
        entityType: 'event',
        title: evt.name || evt.title,
        date: evt.date || 'Date not available',
        year: parsedDate.year,
        sortTimestamp: parsedDate.timestamp,
        description: evt.description || (linkedMemories[0] && linkedMemories[0].description) || '',
        quote: linkedMemories[0]?.quote || null,
        place: place ? { id: place.id, name: place.name, region: place.region } : null,
        people: eventPeople.map(p => ({ id: p.id, name: p.name, relation: p.relation, avatar: p.avatar })),
        photos,
        photoCount: photos.length,
        stories: linkedStories,
        storyCount: linkedStories.length,
        voiceMemories: linkedVoiceMemories,
        voiceCount: linkedVoiceMemories.length,
        voiceMemory: linkedVoiceMemories[0] || null,
        story: linkedStories[0] || null,
        coverImage: coverImg,
        favorite: isFav,
        important: isImp,
        tags: Array.from(new Set(linkedMemories.flatMap(m => m.tags || []))),
        linkedMemoryIds: linkedMemories.map(m => m.id),
        originalEntity: evt
      });
    });

    // 2. STANDALONE MEMORIES: Add memories that were not grouped into any event
    memories.forEach(mem => {
      if (consumedMemoryIds.has(mem.id)) return;

      const parsedDate = this.parseTimelineDate(mem.date || mem.season, mem.year);
      const place = mem.placeId ? placesMap.get(mem.placeId) : null;
      const memPeople = (mem.personIds || []).map(pId => peopleMap.get(pId)).filter(Boolean);
      const linkedStory = mem.storyId ? stories.find(s => s.id === mem.storyId) : null;
      const linkedVoice = voiceMemories.find(v => v.memoryId === mem.id || (linkedStory && v.storyId === linkedStory.id));

      let itemType = 'photo';
      if (mem.category === 'Voice Notes' || linkedVoice) {
        itemType = 'voice_memory';
      } else if (mem.category === 'People' || mem.type === 'anchor') {
        itemType = 'person_memory';
      } else if (mem.category === 'Places' || (mem.placeId && !mem.personIds?.length)) {
        itemType = 'place';
      } else if (mem.category === 'Stories' || linkedStory) {
        itemType = 'story';
      }

      timelineItems.push({
        id: mem.id,
        type: itemType,
        entityType: 'memory',
        title: mem.title,
        date: mem.date || mem.season || (mem.year && mem.year !== 'Present' && mem.year !== 'Ancestral' ? mem.year : 'Date not available'),
        year: parsedDate.year,
        sortTimestamp: parsedDate.timestamp,
        description: mem.description || mem.quote || '',
        quote: mem.quote || null,
        place: place ? { id: place.id, name: place.name, region: place.region } : null,
        people: memPeople.map(p => ({ id: p.id, name: p.name, relation: p.relation, avatar: p.avatar })),
        photos: [mem.image || mem.coverPhoto].filter(Boolean),
        photoCount: (mem.image || mem.coverPhoto) ? 1 : 0,
        stories: linkedStory ? [linkedStory] : [],
        storyCount: linkedStory ? 1 : 0,
        voiceMemories: linkedVoice ? [linkedVoice] : [],
        voiceCount: linkedVoice ? 1 : 0,
        voiceMemory: linkedVoice || null,
        story: linkedStory || null,
        coverImage: mem.image || mem.coverPhoto || (place && place.image) || FALLBACK_MEMORY_IMAGE,
        favorite: Boolean(mem.favorite),
        important: Boolean(mem.important),
        tags: mem.tags || [],
        linkedMemoryIds: [mem.id],
        originalEntity: mem
      });
    });

    // 3. STANDALONE STORIES: (if any unlinked to events/memories)
    stories.forEach(sty => {
      if (consumedStoryIds.has(sty.id)) return;
      const parsedDate = this.parseTimelineDate(sty.date || null, null);
      const place = sty.placeId ? placesMap.get(sty.placeId) : null;
      const styPeople = (sty.personIds || []).map(pId => peopleMap.get(pId)).filter(Boolean);
      const linkedVoice = voiceMemories.find(v => v.storyId === sty.id);

      timelineItems.push({
        id: sty.id,
        type: 'story',
        entityType: 'story',
        title: sty.title,
        date: sty.date || 'Date not available',
        year: parsedDate.year,
        sortTimestamp: parsedDate.timestamp,
        description: sty.text || '',
        quote: null,
        place: place ? { id: place.id, name: place.name, region: place.region } : null,
        people: styPeople.map(p => ({ id: p.id, name: p.name, relation: p.relation, avatar: p.avatar })),
        photos: sty.image ? [sty.image] : [],
        photoCount: sty.image ? 1 : 0,
        stories: [sty],
        storyCount: 1,
        voiceMemories: linkedVoice ? [linkedVoice] : [],
        voiceCount: linkedVoice ? 1 : 0,
        voiceMemory: linkedVoice || null,
        story: sty,
        coverImage: sty.image || FALLBACK_MEMORY_IMAGE,
        favorite: false,
        important: false,
        tags: [],
        linkedMemoryIds: [],
        originalEntity: sty
      });
    });

    // 4. STANDALONE VOICE MEMORIES: (if any unlinked)
    voiceMemories.forEach(vm => {
      if (consumedVoiceIds.has(vm.id)) return;
      const parsedDate = this.parseTimelineDate(vm.date || null, null);
      timelineItems.push({
        id: vm.id,
        type: 'voice_memory',
        entityType: 'voice_memory',
        title: vm.title,
        date: vm.date || 'Date not available',
        year: parsedDate.year,
        sortTimestamp: parsedDate.timestamp,
        description: vm.transcript || '',
        quote: null,
        place: null,
        people: [],
        photos: [],
        photoCount: 0,
        stories: [],
        storyCount: 0,
        voiceMemories: [vm],
        voiceCount: 1,
        voiceMemory: vm,
        story: null,
        coverImage: FALLBACK_MEMORY_IMAGE,
        favorite: false,
        important: false,
        tags: [],
        linkedMemoryIds: [],
        originalEntity: vm
      });
    });

    // 5. APPLY SEARCH FILTER
    let filteredItems = timelineItems;
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      filteredItems = filteredItems.filter(item => {
        if (item.title && item.title.toLowerCase().includes(q)) return true;
        if (item.description && item.description.toLowerCase().includes(q)) return true;
        if (item.quote && item.quote.toLowerCase().includes(q)) return true;
        if (item.date && item.date.toLowerCase().includes(q)) return true;
        if (item.place && (item.place.name.toLowerCase().includes(q) || (item.place.region && item.place.region.toLowerCase().includes(q)))) return true;
        if (item.people && item.people.some(p => p.name.toLowerCase().includes(q) || (p.relation && p.relation.toLowerCase().includes(q)))) return true;
        if (item.tags && item.tags.some(t => t.toLowerCase().includes(q))) return true;
        if (item.stories && item.stories.some(s => (s.title && s.title.toLowerCase().includes(q)) || (s.text && s.text.toLowerCase().includes(q)))) return true;
        return false;
      });
    }

    // 6. APPLY TYPE FILTER
    if (filters.type && filters.type !== 'all') {
      const t = filters.type.toLowerCase();
      if (t === 'events') {
        filteredItems = filteredItems.filter(i => i.type === 'event');
      } else if (t === 'photos') {
        filteredItems = filteredItems.filter(i => i.type === 'photo' || i.photoCount > 0);
      } else if (t === 'stories') {
        filteredItems = filteredItems.filter(i => i.type === 'story' || i.storyCount > 0);
      } else if (t === 'voice_memories' || t === 'voice') {
        filteredItems = filteredItems.filter(i => i.type === 'voice_memory' || i.voiceCount > 0 || i.voiceMemory);
      } else if (t === 'people') {
        filteredItems = filteredItems.filter(i => i.type === 'person_memory' || (i.people && i.people.length > 0));
      } else if (t === 'places') {
        filteredItems = filteredItems.filter(i => i.type === 'place' || Boolean(i.place));
      } else if (t === 'favorites') {
        filteredItems = filteredItems.filter(i => Boolean(i.favorite));
      }
    }

    // 7. APPLY YEAR FILTER
    if (filters.year && filters.year !== 'all') {
      filteredItems = filteredItems.filter(i => i.year === filters.year);
    }

    // 8. APPLY SORTING (Default: Newest -> Oldest)
    const sortOrder = (filters.sortOrder || 'desc').toLowerCase();
    filteredItems.sort((a, b) => {
      // Keep items with timestamp > 0 sorted, items with 0 at the end
      if (a.sortTimestamp === 0 && b.sortTimestamp === 0) return a.title.localeCompare(b.title);
      if (a.sortTimestamp === 0) return 1;
      if (b.sortTimestamp === 0) return -1;

      return sortOrder === 'asc' 
        ? a.sortTimestamp - b.sortTimestamp 
        : b.sortTimestamp - a.sortTimestamp;
    });

    // 9. EXTRACT UNIQUE YEARS FOR FILTER CHIPS
    const uniqueYears = Array.from(new Set(timelineItems.map(i => i.year))).filter(Boolean);
    uniqueYears.sort((a, b) => {
      if (a === 'Date not available') return 1;
      if (b === 'Date not available') return -1;
      return parseInt(b, 10) - parseInt(a, 10);
    });

    // 10. GROUP ITEMS BY YEAR FOR VERTICAL TIMELINE
    const yearGroups = {};
    filteredItems.forEach(item => {
      const yr = item.year || 'Date not available';
      if (!yearGroups[yr]) yearGroups[yr] = [];
      yearGroups[yr].push(item);
    });

    return {
      patientId: pid,
      totalCount: timelineItems.length,
      filteredCount: filteredItems.length,
      items: filteredItems,
      years: uniqueYears,
      yearGroups,
      sortOrder
    };
  }
}

export const memoryService = new MemoryService();
store.setMemoryService(memoryService);
