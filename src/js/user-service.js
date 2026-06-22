const LS_KEY = 'logicQuest_state';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10); 
}
let _cache = null;

export const UserService = {
  getUserId() {
    let uid = localStorage.getItem('logicQuest_userId');
    if (!uid) {
      uid = generateUUID();
      localStorage.setItem('logicQuest_userId', uid);
    }
    return uid;
  },
  async load() {
    const userId = this.getUserId();
    _cache = this._loadFromLocal(userId);
    this._updateStreak(); 
    this._saveToLocal(_cache);
    return _cache;
  },
  async save(partialState = {}) {
    if (!_cache) await this.load();
    Object.assign(_cache, partialState, { updatedAt: new Date().toISOString() });
    this._saveToLocal(_cache);
    return _cache;
  },
  async completeLesson(lessonId, xpGain = 10, quizAnswer = null, correct = true) {
    if (!_cache) await this.load();

    const completedLessons = new Set(_cache.completedLessons || []);
    const alreadyDone = completedLessons.has(lessonId);

    if (!alreadyDone) {
      completedLessons.add(lessonId);
      _cache.xp = (_cache.xp || 0) + xpGain;
      if (completedLessons.size % 3 === 0) {
        _cache.keys = (_cache.keys ?? 5) + 1;
      }
    }

    _cache.completedLessons = [...completedLessons];
    if (lessonId >= (_cache.currentStep || 0)) {
      _cache.currentStep = lessonId + 1;
    }
    if (quizAnswer !== null) {
      _cache.quizAnswers = _cache.quizAnswers || {};
      _cache.quizAnswers[lessonId] = {
        answer: quizAnswer,
        correct,
        timestamp: new Date().toISOString(),
      };
    }
    this._updateStreak();

    _cache.updatedAt = new Date().toISOString();
    this._saveToLocal(_cache);
    return _cache;
  },
  getXP() {
    const s = _cache || this._loadFromLocal(this.getUserId());
    const extra = parseInt(localStorage.getItem('logicQuest_extraXp') || '0', 10);
    return (s.xp || 0) + extra;
  },

  getKeys() {
    const s = _cache || this._loadFromLocal(this.getUserId());
    return s.keys ?? 5;
  },

  getStreak() {
    const s = _cache || this._loadFromLocal(this.getUserId());
    return s.streak ?? 0;
  },

  getCompletedLessons() {
    const s = _cache || this._loadFromLocal(this.getUserId());
    return new Set(s.completedLessons || []);
  },

  getCurrentStep() {
    const s = _cache || this._loadFromLocal(this.getUserId());
    return s.currentStep ?? 0;
  },

  getSessions() {
    const s = _cache || this._loadFromLocal(this.getUserId());
    return s.sessions ?? 0;
  },

  getLastActive() {
    const s = _cache || this._loadFromLocal(this.getUserId());
    return s.lastActive || null;
  },

  getActivityLog(count = 10) {
    const s = _cache || this._loadFromLocal(this.getUserId());
    return (s.activityLog || []).slice(-count);
  },
  recordSession() {
    if (!_cache) _cache = this._loadFromLocal(this.getUserId());
    _cache.sessions = (_cache.sessions || 0) + 1;
    _cache.lastActive = new Date().toISOString().slice(0, 16).replace('T', ' ');
    this._saveToLocal(_cache);
  },

  logActivity(action, detail = '') {
    if (!_cache) _cache = this._loadFromLocal(this.getUserId());
    if (!_cache.activityLog) _cache.activityLog = [];
    _cache.activityLog.push({
      action,
      detail,
      time: new Date().toISOString(),
    });
    if (_cache.activityLog.length > 200) _cache.activityLog = _cache.activityLog.slice(-200);
    this._saveToLocal(_cache);
  },
  addXP(amount) {
    if (!_cache) _cache = this._loadFromLocal(this.getUserId());
    _cache.xp = (_cache.xp || 0) + amount;
    this._saveToLocal(_cache);
    if (window.updateXPDisplay) window.updateXPDisplay();
  },
  async reset() {
    const userId = this.getUserId();
    const fresh = {
      user_id: userId,
      xp: 0,
      keys: 5,
      streak: 0,
      sessions: 0,
      lastActive: null,
      lastLogin: null,
      lastLoginDate: null,
      currentStep: 0,
      completedLessons: [],
      quizAnswers: {},
      activityLog: [],
      updatedAt: new Date().toISOString(),
    };
    _cache = fresh;
    this._saveToLocal(fresh);
    ['logicQuest_step', 'logicQuest_completedLessons',
      'logicQuest_extraXp', 'logicQuest_keys', 'logicQuest_streak'].forEach(k =>
        localStorage.removeItem(k)
      );
    return fresh;
  },

  async refresh() {
    _cache = null;
    return this.load();
  },
  _updateStreak() {
    if (!_cache) return;
    const today = todayStr();
    const last = _cache.lastLoginDate;

    if (!last) {
      _cache.streak = 1;
      _cache.lastLoginDate = today;
    } else if (last === today) {
    } else {
      const diff = Math.round(
        (new Date(today) - new Date(last)) / (1000 * 60 * 60 * 24)
      );
      if (diff === 1) {
        _cache.streak = (_cache.streak || 0) + 1;
      } else if (diff > 1) {
        _cache.streak = 1;
      }
      _cache.lastLoginDate = today;
    }
  },
  _loadFromLocal(userId) {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.user_id === userId) {
          return parsed;
        }
      }
    } catch (_) {  }
    const completed = (() => {
      try { return JSON.parse(localStorage.getItem('logicQuest_completedLessons') || '[]'); }
      catch (_) { return []; }
    })();
    const extraXp = parseInt(localStorage.getItem('logicQuest_extraXp') || '0', 10);
    const step = parseInt(localStorage.getItem('logicQuest_step') || '0', 10);
    const keys = parseInt(localStorage.getItem('logicQuest_keys') || '5', 10);
    const streak = parseInt(localStorage.getItem('logicQuest_streak') || '0', 10);

    return {
      user_id: userId,
      xp: completed.length * 10 + extraXp,
      keys,
      streak,
      lastLoginDate: null,
      currentStep: step,
      completedLessons: completed,
      quizAnswers: {},
    };
  },

  _saveToLocal(state) {
    if (!state) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[UserService] localStorage write failed:', e);
    }
    localStorage.setItem('logicQuest_step', String(state.currentStep ?? 0));
    localStorage.setItem('logicQuest_completedLessons', JSON.stringify(state.completedLessons ?? []));
    localStorage.setItem('logicQuest_keys', String(state.keys ?? 5));
    if (state.streak !== undefined) {
      localStorage.setItem('logicQuest_streak', String(state.streak));
    }
    const lessonXp = (state.completedLessons?.length ?? 0) * 10;
    localStorage.setItem('logicQuest_extraXp', String(Math.max(0, (state.xp ?? 0) - lessonXp)));
  },
};

export default UserService;