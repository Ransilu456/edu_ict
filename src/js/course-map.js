
import UserService from './user-service.js';

const TOTAL_LESSONS = 9;

const lessonMetadata = [
  { id: 0, title: 'The Binary Code',        level: 1, category: 'Fundamentals',  icon: '⚡', color: '#58cc02', desc: 'Voltage & Binary States' },
  { id: 1, title: 'The Transistor Switch',  level: 1, category: 'Fundamentals',  icon: '🔌', color: '#58cc02', desc: 'NPN Transistor Basics' },
  { id: 2, title: 'The NOT Gate',           level: 2, category: 'Logic Gates',   icon: '🔄', color: '#1cb0f6', desc: 'Signal Inversion' },
  { id: 3, title: 'The AND Gate',           level: 2, category: 'Logic Gates',   icon: '🔗', color: '#1cb0f6', desc: 'Both-or-nothing Logic' },
  { id: 4, title: 'The OR Gate',            level: 2, category: 'Logic Gates',   icon: '⚖️', color: '#1cb0f6', desc: 'Either-or Logic' },
  { id: 5, title: 'The XOR Gate',           level: 3, category: 'Logic Gates',   icon: '✨', color: '#1cb0f6', desc: 'Exclusive OR Logic' },
  { id: 6, title: 'Half Adder',             level: 4, category: 'Circuits',      icon: '➕', color: '#ff9600', desc: 'Binary Addition (2-bit)' },
  { id: 7, title: 'Full Adder',             level: 4, category: 'Circuits',      icon: '🔢', color: '#ff9600', desc: 'Binary Addition (3-bit)' },
  { id: 8, title: 'Master of Logic!',       level: 5, category: 'Mastery',       icon: '🏆', color: '#7c5ef2', desc: 'Complete the Journey' },
];

const categories = [
  { name: 'Fundamentals', icon: '⚡', color: '#58cc02', bg: 'rgba(88,204,2,0.1)', border: 'rgba(88,204,2,0.3)', lessons: [0, 1] },
  { name: 'Logic Gates',  icon: '🔮', color: '#1cb0f6', bg: 'rgba(28,176,246,0.1)', border: 'rgba(28,176,246,0.3)', lessons: [2, 3, 4, 5] },
  { name: 'Circuits',     icon: '🔧', color: '#ff9600', bg: 'rgba(255,150,0,0.1)', border: 'rgba(255,150,0,0.3)', lessons: [6, 7] },
  { name: 'Mastery',      icon: '🏆', color: '#7c5ef2', bg: 'rgba(124,94,242,0.1)', border: 'rgba(124,94,242,0.3)', lessons: [8] },
];

let completedLessons = new Set();

function syncCompletionState() {
  completedLessons = UserService.getCompletedLessons();
}

function getCompletedCount() {
  return completedLessons.size;
}

function canAccessLesson(lessonIdx) {
  if (lessonIdx === 0) return true;
  if (completedLessons.has(lessonIdx - 1)) return true;
  if (lessonIdx < 3) return true;
  return false;
}

function markLessonComplete(lessonIdx) {
  completedLessons.add(lessonIdx);
  renderCourseMap();
  if (window.updateXPDisplay) window.updateXPDisplay();
}

function getLessonState(lessonIdx) {
  if (completedLessons.has(lessonIdx)) return 'completed';
  if (canAccessLesson(lessonIdx)) return 'available';
  return 'locked';
}

// ── Course Map Renderer ───────────────────────────────────────
function renderCourseMap() {
  const container = document.getElementById('course-map-container');
  if (!container) return;

  syncCompletionState();
  const completedCount = getCompletedCount();
  const pct = Math.round((completedCount / TOTAL_LESSONS) * 100);
  const xp = UserService.getXP();
  const streak = UserService.getStreak();
  const keys = UserService.getKeys();

  container.innerHTML = '';
  container.className = 'course-map-page';

  // ── Stats Bar ────────────────────────────────────────────────
  const statsBar = document.createElement('div');
  statsBar.className = 'cm-stats-bar';
  statsBar.innerHTML = `
    <div class="cm-stat-pill cm-stat-fire">
      <span class="cm-stat-emoji">🔥</span>
      <div class="cm-stat-info">
        <span class="cm-stat-val">${streak}</span>
        <span class="cm-stat-label">Streak</span>
      </div>
    </div>
    <div class="cm-progress-pill">
      <div class="cm-progress-inner">
        <div class="cm-progress-fill-bar" style="width:${pct}%"></div>
      </div>
      <span class="cm-progress-pct">${pct}%</span>
    </div>
    <div class="cm-stat-pill cm-stat-xp">
      <span class="cm-stat-emoji">⭐</span>
      <div class="cm-stat-info">
        <span class="cm-stat-val">${xp}</span>
        <span class="cm-stat-label">XP</span>
      </div>
    </div>
    <div class="cm-stat-pill cm-stat-keys">
      <span class="cm-stat-emoji">🗝️</span>
      <div class="cm-stat-info">
        <span class="cm-stat-val">${keys}</span>
        <span class="cm-stat-label">Keys</span>
      </div>
    </div>
  `;
  container.appendChild(statsBar);

  // ── Vertical Path ────────────────────────────────────────────
  const pathWrap = document.createElement('div');
  pathWrap.className = 'cm-vertical-path';

  let nodeGlobalIdx = 0;

  categories.forEach((cat) => {
    // Category banner
    const banner = document.createElement('div');
    banner.className = 'cm-cat-banner';
    banner.style.setProperty('--cat-color', cat.color);
    banner.style.setProperty('--cat-bg', cat.bg);
    banner.style.setProperty('--cat-border', cat.border);
    const catCompleted = cat.lessons.filter(id => completedLessons.has(id)).length;
    banner.innerHTML = `
      <div class="cm-cat-badge" style="background:${cat.bg};border-color:${cat.border}">
        <span class="cm-cat-icon">${cat.icon}</span>
        <span class="cm-cat-name" style="color:${cat.color}">${cat.name}</span>
        <span class="cm-cat-count">${catCompleted}/${cat.lessons.length}</span>
      </div>
    `;
    pathWrap.appendChild(banner);

    // Nodes for this category
    cat.lessons.forEach((lessonId, localIdx) => {
      const lesson = lessonMetadata[lessonId];
      const state = getLessonState(lessonId);
      const isCompleted = state === 'completed';
      const isAvailable = state === 'available';
      const isLocked = state === 'locked';

      // Zigzag: even global index → left, odd → right; center for single
      const side = cat.lessons.length === 1 ? 'center' : (nodeGlobalIdx % 2 === 0 ? 'left' : 'right');

      const nodeRow = document.createElement('div');
      nodeRow.className = `cm-node-row cm-side-${side}`;

      // Connector line above (except first node)
      if (localIdx > 0 || nodeGlobalIdx > 0) {
        const connector = document.createElement('div');
        connector.className = `cm-vert-connector ${
          completedLessons.has(lessonId - 1) || (localIdx === 0) ? 'done' : ''
        }`;
        connector.style.setProperty('--conn-color', cat.color);
        nodeRow.appendChild(connector);
      }

      // The node itself
      const nodeWrap = document.createElement('div');
      nodeWrap.className = 'cm-vnode-wrap';

      const btn = document.createElement('button');
      btn.className = `cm-vnode-btn ${state}`;
      btn.disabled = isLocked;
      btn.setAttribute('data-lesson', lessonId);
      btn.setAttribute('aria-label', lesson.title);

      if (isCompleted) {
        btn.style.background = cat.color;
        btn.style.borderColor = adjustColor(cat.color, -25);
        btn.style.boxShadow = `0 5px 0 ${adjustColor(cat.color, -40)}`;
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="30" height="30" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`;
      } else if (isAvailable) {
        btn.style.borderColor = cat.color;
        btn.style.boxShadow = `0 5px 0 ${adjustColor(cat.color, -40)}`;
        btn.innerHTML = `<span class="cm-vnode-icon">${lesson.icon}</span>`;
        btn.classList.add('cm-pulse');
      } else {
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" style="opacity:0.35">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>`;
      }

      btn.addEventListener('click', () => {
        if (isLocked) return;
        if (window.playSound) window.playSound('click');
        navigateToLesson(lessonId);
      });

      // Label card beside the node
      const label = document.createElement('div');
      label.className = `cm-vnode-card ${isLocked ? 'locked' : ''} ${isAvailable ? 'available' : ''} ${isCompleted ? 'completed' : ''}`;
      if (!isLocked) {
        label.style.setProperty('--cat-color', cat.color);
        label.addEventListener('click', () => {
          if (window.playSound) window.playSound('click');
          navigateToLesson(lessonId);
        });
        label.style.cursor = 'pointer';
      }
      label.innerHTML = `
        <div class="cm-vnode-card-title">${lesson.title}</div>
        <div class="cm-vnode-card-desc">${lesson.desc}</div>
        ${isCompleted ? `<div class="cm-vnode-card-badge cm-badge-done">✓ Done</div>` : ''}
        ${isAvailable && !isCompleted ? `<div class="cm-vnode-card-badge cm-badge-start">→ Start</div>` : ''}
        ${isLocked ? `<div class="cm-vnode-card-badge cm-badge-lock">🔒 Locked</div>` : ''}
      `;

      nodeWrap.appendChild(btn);
      nodeWrap.appendChild(label);
      nodeRow.appendChild(nodeWrap);
      pathWrap.appendChild(nodeRow);
      nodeGlobalIdx++;
    });
  });

  container.appendChild(pathWrap);

  // ── CTA Cards ────────────────────────────────────────────────
  if (completedCount === 0) {
    const tip = document.createElement('div');
    tip.className = 'cm-tip-card';
    tip.innerHTML = `
      <div class="cm-tip-icon">👆</div>
      <div class="cm-tip-text">
        <strong>Start your journey!</strong>
        <span>Click any highlighted lesson to begin learning.</span>
      </div>
    `;
    container.appendChild(tip);
  } else if (completedCount === TOTAL_LESSONS) {
    const done = document.createElement('div');
    done.className = 'cm-complete-card';
    done.innerHTML = `
      <div class="cm-complete-icon">🏆</div>
      <h2>Congratulations!</h2>
      <p>You've completed the entire A/L ICT Digital Logic course!</p>
      <button class="btn-primary cm-sandbox-btn" onclick="window.navigateToView && window.navigateToView('sandbox-view')">
        Build in Sandbox →
      </button>
    `;
    container.appendChild(done);
  }
}

// ── Helpers ───────────────────────────────────────────────────
function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function navigateToLesson(lessonIdx) {
  // Load the correct lesson data
  if (window.loadLesson) {
    window.loadLesson(lessonIdx);
  }
  // Navigate to the course-view panel directly
  // Use the nav-tab click path to properly activate the panel
  if (window.navigateToView) {
    window.navigateToView('course-view');
  } else {
    // Direct fallback: activate panel manually
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
    const panel = document.querySelector('.course-view');
    if (panel) panel.classList.add('active');
    document.querySelectorAll('.nav-tab, .mobile-nav-btn').forEach(t => t.classList.remove('active'));
  }
}

async function initCourseMap() {
  // Load user data from PHP/localStorage before rendering
  await UserService.load();
  syncCompletionState();
  renderCourseMap();

  window.addEventListener('resize', () => {
    const container = document.getElementById('course-map-container');
    if (container && container.innerHTML.trim() !== '') {
      renderCourseMap();
    }
  });
}

// Expose global functions
window.renderCourseMap     = renderCourseMap;
window.markLessonComplete  = markLessonComplete;
window.initCourseMap       = initCourseMap;
window.syncCompletionState = syncCompletionState;
