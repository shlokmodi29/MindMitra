// MindMitra Resilient Storage & Persistence Abstraction
// Supports patient-scoped namespaces, quota exhaustion handling, and atomic writes

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }
  setItem(key, value) {
    this.map.set(key, String(value));
  }
  removeItem(key) {
    this.map.delete(key);
  }
  key(index) {
    return Array.from(this.map.keys())[index] || null;
  }
  get length() {
    return this.map.size;
  }
}

export class StorageService {
  constructor(storageBackend = null) {
    this.storage = storageBackend || (typeof localStorage !== 'undefined' ? localStorage : new MemoryStorage());
    this.defaultPrefix = 'mindmitra_';
  }

  /**
   * Generates a patient-isolated storage key
   */
  getScopedKey(key, patientId = null) {
    if (!patientId) {
      return `${this.defaultPrefix}${key}`;
    }
    const safePid = String(patientId).replace(/[^a-zA-Z0-9_-]/g, '_');
    return `${this.defaultPrefix}p_${safePid}_${key}`;
  }

  /**
   * Safely retrieves an item from storage with JSON parsing and fallback
   */
  getItem(key, defaultValue = null, patientId = null) {
    if (!this.storage) return defaultValue;
    try {
      const scopedKey = this.getScopedKey(key, patientId);
      const raw = this.storage.getItem(scopedKey);
      if (raw === null || raw === undefined) {
        // Fallback to non-scoped key if patient-scoped not found yet
        if (patientId) {
          const legacyRaw = this.storage.getItem(`${this.defaultPrefix}${key}`);
          if (legacyRaw !== null && legacyRaw !== undefined) {
            return JSON.parse(legacyRaw);
          }
        }
        return defaultValue;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[StorageService] Failed to read key "${key}":`, err);
      return defaultValue;
    }
  }

  /**
   * Safely stores an item with quota error detection
   */
  setItem(key, value, patientId = null) {
    if (!this.storage) return false;
    try {
      const scopedKey = this.getScopedKey(key, patientId);
      const serialized = JSON.stringify(value);
      this.storage.setItem(scopedKey, serialized);
      return true;
    } catch (err) {
      if (err && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED' || err.code === 22)) {
        console.error(`[StorageService] Storage quota exceeded while writing "${key}":`, err);
        return {
          success: false,
          error: 'QUOTA_EXCEEDED',
          message: "There's not enough device storage to save this item."
        };
      }
      console.error(`[StorageService] Write error for "${key}":`, err);
      return {
        success: false,
        error: 'WRITE_ERROR',
        message: 'Device storage could not be written.'
      };
    }
  }

  /**
   * Removes an item
   */
  removeItem(key, patientId = null) {
    if (!this.storage) return false;
    try {
      const scopedKey = this.getScopedKey(key, patientId);
      this.storage.removeItem(scopedKey);
      return true;
    } catch (err) {
      console.warn(`[StorageService] Failed to remove "${key}":`, err);
      return false;
    }
  }

  /**
   * Clears patient-scoped keys without affecting other patients
   */
  clearPatientData(patientId) {
    if (!this.storage || !patientId) return 0;
    const safePid = String(patientId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const targetPrefix = `${this.defaultPrefix}p_${safePid}_`;
    let removed = 0;

    try {
      const keysToRemove = [];
      for (let i = 0; i < this.storage.length; i++) {
        const k = this.storage.key(i);
        if (k && k.startsWith(targetPrefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => {
        this.storage.removeItem(k);
        removed++;
      });
    } catch (err) {
      console.warn('[StorageService] Error during patient data clear:', err);
    }
    return removed;
  }

  /**
   * Returns estimated storage usage
   */
  getStorageStats() {
    if (!this.storage) return { totalBytes: 0, itemsCount: 0 };
    let totalBytes = 0;
    try {
      for (let i = 0; i < this.storage.length; i++) {
        const k = this.storage.key(i);
        if (k && k.startsWith(this.defaultPrefix)) {
          const val = this.storage.getItem(k) || '';
          totalBytes += (k.length + val.length) * 2; // 2 bytes per char approx
        }
      }
      return {
        totalBytes,
        itemsCount: this.storage.length
      };
    } catch (e) {
      return { totalBytes: 0, itemsCount: 0 };
    }
  }
}

export const storageService = new StorageService();
