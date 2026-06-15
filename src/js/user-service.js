// ============================================================
//  LogicQuest — UserService (localStorage-only, no PHP)
//  All progress is stored in the browser's localStorage.
// ============================================================

// ── UUID helper ────────────────────────────────────────────────
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let _cache = null;

// ── Public API ────────────────────────────────────────────────
export const UserService = {
  /** Retrieve or create the user's UUID (persisted in localStorage) */
  getUserId() {
    let uid = localStorage.getItem('logicQuest_userId');
    if (!uid) {
      uid = generateUUID();
      localStorage.setItem('logicQuest_userId', uid);
    }
    return uid;
  },

  /**
   * Load user state from localStorage.
   * Returns the user object and caches it internally.
   */
  async load() {
    const userId = this.getUserId();
    _cache = this._loadFromLocal(userId);
    return _cache;
  },

  /**
   * Save user state to localStorage.
   */
  async save(partialState = {}) {
    const userId = this.getUserId();
    if (_cache) {
      Object.assign(_cache, partialState, { updatedAt: new Date().toISOString() });
    } else {
      _cache = { user_id: userId, ...this._loadFromLocal(userId), ...partialState };
    }
    this._saveToLocal(_cache);
    return _cache;
  },

  /**
   * Mark a lesson as complete. Awards XP, updates step, records quiz.
   */
  async completeLesson(lessonId, xpGain = 10, quizAnswer = null, correct = true) {
    const userId = this.getUserId();
    const state = _cache || this._loadFromLocal(userId);

    const completedLessons = new Set(state.completedLessons || []);
    const alreadyDone = completedLessons.has(lessonId);

    if (!alreadyDone) {
      completedLessons.add(lessonId);
      state.xp = (state.xp || 0) + xpGain;
    }
    state.completedLessons = [...completedLessons];
    if (lessonId >= (state.currentStep || 0)) {
      state.currentStep = lessonId + 1;
    }
    if (quizAnswer !== null) {
      state.quizAnswers = state.quizAnswers || {};
      state.quizAnswers[lessonId] = { answer: quizAnswer, correct, timestamp: new Date().toISOString() };
    }
    // Key reward every 3 lessons
    if (!alreadyDone && state.completedLessons.length % 3 === 0) {
      state.keys = (state.keys ?? 5) + 1;
    }
    _cache = state;
    this._saveToLocal(state);
    return _cache;
  },

  /** Get current XP from cache. */
  getXP() {
    const s = _cache || this._loadFromLocal(this.getUserId());
    return s.xp ?? 0;
  },

  /** Get current keys count from cache. */
  getKeys() {
    const s = _cache || this._loadFromLocal(this.getUserId());
    return s.keys ?? 5;
  },

  /** Get current streak from cache. */
  getStreak() {
    const s = _cache || this._loadFromLocal(this.getUserId());
    return s.streak ?? 0;
  },

  /** Get completed lessons set from cache. */
  getCompletedLessons() {
    const s = _cache || this._loadFromLocal(this.getUserId());
    return new Set(s.completedLessons || []);
  },

  /** Get current lesson step from cache. */
  getCurrentStep() {
    const s = _cache || this._loadFromLocal(this.getUserId());
    return s.currentStep ?? parseInt(localStorage.getItem('logicQuest_step') || '0', 10);
  },

  /** Reset all user progress. */
  async reset() {
    const userId = this.getUserId();
    const fresh = {
      user_id: userId,
      xp: 0,
      keys: 5,
      streak: 0,
      lastLogin: null,
      currentStep: 0,
      completedLessons: [],
      quizAnswers: {},
      updatedAt: new Date().toISOString(),
    };
    _cache = fresh;
    this._saveToLocal(fresh);
    return fresh;
  },

  /** Force refresh cache from localStorage */
  async refresh() {
    _cache = null;
    return this.load();
  },

  // ── Private helpers ────────────────────────────────────────

  _loadFromLocal(userId) {
    try {
      const raw = localStorage.getItem('logicQuest_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.user_id === userId) {
          return parsed;
        }
      }
    } catch (e) { /* ignore parse errors */ }

    // Legacy fallback — read from old individual keys
    const completed = localStorage.getItem('logicQuest_completedLessons');
    const completedArr = completed ? JSON.parse(completed) : [];
    const extraXp = parseInt(localStorage.getItem('logicQuest_extraXp') || '0', 10);
    const step = parseInt(localStorage.getItem('logicQuest_step') || '0', 10);
    const keys = parseInt(localStorage.getItem('logicQuest_keys') || '5', 10);
    return {
      user_id: userId,
      xp: completedArr.length * 10 + extraXp,
      keys,
      streak: 0,
      currentStep: step,
      completedLessons: completedArr,
      quizAnswers: {},
    };
  },

  _saveToLocal(state) {
    if (!state) return;
    // Save full state object
    localStorage.setItem('logicQuest_state', JSON.stringify(state));
    // Also keep legacy keys in sync for backward compat
    const xp = state.xp ?? 0;
    const step = state.currentStep ?? 0;
    const completedArr = state.completedLessons ?? [];
    const keys = state.keys ?? 5;
    localStorage.setItem('logicQuest_step', step);
    localStorage.setItem('logicQuest_completedLessons', JSON.stringify(completedArr));
    localStorage.setItem('logicQuest_extraXp', Math.max(0, xp - completedArr.length * 10));
    localStorage.setItem('logicQuest_keys', keys);
    if (state.streak !== undefined) {
      localStorage.setItem('logicQuest_streak', state.streak);
    }
  },
};

export default UserService;
