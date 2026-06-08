// ============================================================
//  LogicQuest Course Map — Duolingo-Style Learning Path
// ============================================================

import './style.css';

const TOTAL_LESSONS = 9;
const LESSONS_PER_DAY = 3; // Can complete 3 lessons per day

// Lesson metadata
const lessonMetadata = [
  { id: 0, title: 'The Binary Code', level: 1, category: 'Basics' },
  { id: 1, title: 'The Transistor Switch', level: 1, category: 'Basics' },
  { id: 2, title: 'The NOT Gate', level: 2, category: 'Logic Gates' },
  { id: 3, title: 'The AND Gate', level: 2, category: 'Logic Gates' },
  { id: 4, title: 'The OR Gate', level: 3, category: 'Logic Gates' },
  { id: 5, title: 'The XOR Gate', level: 3, category: 'Logic Gates' },
  { id: 6, title: 'Half Adder', level: 4, category: 'Circuits' },
  { id: 7, title: 'Full Adder', level: 4, category: 'Circuits' },
  { id: 8, title: 'Master of Logic', level: 5, category: 'Mastery' }
];

let completedLessons = new Set();
let currentDay = null;

function initCourseMap() {
  syncCompletionState();
  renderCourseMap();

  // Handle window resize
  window.addEventListener('resize', renderCourseMap);
}

function syncCompletionState() {
  const completed = localStorage.getItem('logicQuest_completedLessons');
  completedLessons = new Set(completed ? JSON.parse(completed) : []);

  // Determine current day
  const lastDate = localStorage.getItem('logicQuest_lastDate');
  const today = new Date().toDateString();
  
  if (lastDate !== today) {
    // New day, reset daily usage
    localStorage.setItem('logicQuest_lastDate', today);
    localStorage.setItem('logicQuest_lessonsUsedToday', '0');
  }
  
  currentDay = today;
}

function getCompletedCount() {
  return completedLessons.size;
}

function canAccessLesson(lessonIdx) {
  // First 3 lessons always accessible
  if (lessonIdx < 3) return true;

  // Can access if previous lesson is completed
  if (lessonIdx > 0 && completedLessons.has(lessonIdx - 1)) {
    return checkDailyLimit();
  }

  return false;
}

function checkDailyLimit() {
  const used = parseInt(localStorage.getItem('logicQuest_lessonsUsedToday') || '0', 10);
  return used < LESSONS_PER_DAY;
}

function markLessonComplete(lessonIdx) {
  completedLessons.add(lessonIdx);
  localStorage.setItem('logicQuest_completedLessons', JSON.stringify([...completedLessons]));

  // Increment daily usage
  const used = parseInt(localStorage.getItem('logicQuest_lessonsUsedToday') || '0', 10);
  localStorage.setItem('logicQuest_lessonsUsedToday', used + 1);

  renderCourseMap();
  if (window.updateXPDisplay) window.updateXPDisplay();
}

function getLessonState(lessonIdx) {
  if (completedLessons.has(lessonIdx)) return 'completed';
  if (canAccessLesson(lessonIdx)) return 'available';
  return 'locked';
}

function renderCourseMap() {
  const container = document.getElementById('course-map-container');
  if (!container) return;

  container.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.className = 'course-map-header';
  header.innerHTML = `
    <div class="course-map-title">
      <h1>Learning Path</h1>
      <p class="course-map-subtitle">${getCompletedCount()} of ${TOTAL_LESSONS} lessons completed</p>
    </div>
    <div class="course-map-stats">
      <div class="stat-item">
        <span class="stat-icon">🔥</span>
        <span class="stat-label">Streak</span>
        <span class="stat-value">7 days</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">⭐</span>
        <span class="stat-label">Perfect Days</span>
        <span class="stat-value">${getCompletedCount()}</span>
      </div>
    </div>
  `;
  container.appendChild(header);

  // Progress bar
  const progressContainer = document.createElement('div');
  progressContainer.className = 'course-map-progress';
  const pct = Math.round((getCompletedCount() / TOTAL_LESSONS) * 100);
  progressContainer.innerHTML = `
    <div class="progress-bar-outer">
      <div class="progress-bar-inner" style="width: ${pct}%"></div>
    </div>
    <span class="progress-text">${pct}% Complete</span>
  `;
  container.appendChild(progressContainer);

  // Lessons map
  const mapContainer = document.createElement('div');
  mapContainer.className = 'course-map-path';

  lessonMetadata.forEach((lesson, idx) => {
    const state = getLessonState(idx);
    const isCompleted = state === 'completed';
    const isAvailable = state === 'available';
    const isLocked = state === 'locked';

    const nodeWrapper = document.createElement('div');
    nodeWrapper.className = `course-map-node-wrapper level-${lesson.level}`;

    // Connecting line (except for first node)
    if (idx > 0) {
      const line = document.createElement('div');
      line.className = `course-map-line ${completedLessons.has(idx - 1) ? 'completed' : ''}`;
      nodeWrapper.appendChild(line);
    }

    // Node circle
    const node = document.createElement('button');
    node.className = `course-map-node ${state}`;
    node.tabIndex = isAvailable ? 0 : -1;

    if (isCompleted) {
      node.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>';
    } else if (isLocked) {
      node.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1C6.48 1 2 5.48 2 11v10h4v-10c0-3.87 3.13-7 7-7s7 3.13 7 7v10h4V11c0-5.52-4.48-10-10-10zm3 11c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"/></svg>';
    } else {
      node.innerHTML = `<span class="lesson-number">${idx + 1}</span>`;
    }

    node.addEventListener('click', () => {
      if (isLocked) {
        showUnlockModal(idx);
      } else if (isAvailable) {
        navigateToLesson(idx);
      }
    });

    // Label below node
    const label = document.createElement('div');
    label.className = 'course-map-label';
    label.innerHTML = `
      <span class="lesson-level">Level ${lesson.level}</span>
      <span class="lesson-title">${lesson.title}</span>
    `;

    nodeWrapper.appendChild(node);
    nodeWrapper.appendChild(label);
    mapContainer.appendChild(nodeWrapper);
  });

  container.appendChild(mapContainer);

  // Daily limit notice
  if (!checkDailyLimit()) {
    const notice = document.createElement('div');
    notice.className = 'course-map-daily-limit';
    notice.innerHTML = `
      <div class="limit-icon">🔑</div>
      <div class="limit-text">
        <strong>Out of keys for today!</strong>
        <p>You've completed your daily limit. Return tomorrow for more!</p>
      </div>
    `;
    container.appendChild(notice);
  }
}

function showUnlockModal(lessonIdx) {
  const modal = document.createElement('div');
  modal.className = 'course-unlock-modal-backdrop';
  modal.id = 'course-unlock-modal';

  const lesson = lessonMetadata[lessonIdx];
  const previousLesson = lessonMetadata[lessonIdx - 1];

  modal.innerHTML = `
    <div class="course-unlock-modal">
      <button class="modal-close-btn" aria-label="Close">&times;</button>
      
      <div class="modal-content">
        <div class="modal-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        </div>

        <h2 class="modal-title">${lesson.title}</h2>
        <p class="modal-level">Level ${lesson.level}</p>

        <div class="modal-requirement">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
          <span>Complete <strong>${previousLesson.title}</strong> first</span>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary modal-cancel-btn">Close</button>
          <button class="btn-primary" id="unlock-lesson-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Unlock Now
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-cancel-btn').addEventListener('click', () => modal.remove());

  modal.querySelector('#unlock-lesson-btn').addEventListener('click', () => {
    const keys = parseInt(localStorage.getItem('logicQuest_keys') || '5', 10);
    if (keys > 0) {
      localStorage.setItem('logicQuest_keys', keys - 1);
      // Mark previous lesson as completed to unlock this one
      if (lessonIdx > 0) {
        completedLessons.add(lessonIdx - 1);
        localStorage.setItem('logicQuest_completedLessons', JSON.stringify([...completedLessons]));
      }
      modal.remove();
      renderCourseMap();
      if (window.updateXPDisplay) window.updateXPDisplay();
    }
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function navigateToLesson(lessonIdx) {
  if (window.loadLesson) {
    window.loadLesson(lessonIdx);
  }
  if (window.navigateToView) {
    window.navigateToView('course-view');
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCourseMap);
} else {
  initCourseMap();
}

// Expose global functions
window.renderCourseMap = renderCourseMap;
window.markLessonComplete = markLessonComplete;
window.initCourseMap = initCourseMap;
