import UserService from './user-service.js';

const TOTAL_LESSONS = 21;

export const lessonMetadata = [
  { id: 0,  title: 'The Binary Code',       level: 1, category: 'Fundamentals', icon: '⚡', color: '#58cc02', desc: 'Voltage & Binary States' },
  { id: 1,  title: 'The Transistor',        level: 1, category: 'Fundamentals', icon: '🔌', color: '#58cc02', desc: 'NPN Transistor Basics' },
  { id: 2,  title: 'NOT Gate',              level: 2, category: 'Logic Gates',  icon: '🔄', color: '#1cb0f6', desc: 'Signal Inversion' },
  { id: 3,  title: 'AND Gate',              level: 2, category: 'Logic Gates',  icon: '🔗', color: '#1cb0f6', desc: 'Both-or-nothing Logic' },
  { id: 4,  title: 'OR Gate',               level: 2, category: 'Logic Gates',  icon: '⚖️', color: '#1cb0f6', desc: 'Either-or Logic' },
  { id: 5,  title: 'XOR Gate',              level: 3, category: 'Logic Gates',  icon: '✨', color: '#1cb0f6', desc: 'Exclusive OR Logic' },
  { id: 6,  title: 'Half Adder',            level: 4, category: 'Circuits',     icon: '➕', color: '#ff9600', desc: 'Binary Addition (2-bit)' },
  { id: 7,  title: 'Full Adder',            level: 4, category: 'Circuits',     icon: '🔢', color: '#ff9600', desc: 'Binary Addition (3-bit)' },
  { id: 8,  title: 'Data Communication',    level: 5, category: 'Networking',   icon: '📡', color: '#a855f7', desc: 'Transmission Basics' },
  { id: 9,  title: 'OSI Model',             level: 5, category: 'Networking',   icon: '🧱', color: '#a855f7', desc: '7 Layers Explained' },
  { id: 10, title: 'TCP/IP & Protocols',    level: 6, category: 'Networking',   icon: '🌐', color: '#a855f7', desc: 'Internet Protocols' },
  { id: 11, title: 'IP Addressing',         level: 6, category: 'Networking',   icon: '🔢', color: '#a855f7', desc: 'IPv4, Subnets & CIDR' },
  { id: 12, title: 'Master of ICT!',        level: 7, category: 'Mastery',      icon: '🏆', color: '#7c5ef2', desc: 'Complete the Journey' },
  { id: 13, title: 'Number Systems',        level: 2, category: 'Fundamentals', icon: '🔢', color: '#58cc02', desc: 'Binary, Octal & Hex' },
  { id: 14, title: 'Boolean Algebra',       level: 3, category: 'Logic Gates',  icon: '📐', color: '#1cb0f6', desc: 'Laws & Simplification' },
  { id: 15, title: 'Flip Flops',            level: 5, category: 'Circuits',     icon: '🔄', color: '#ff9600', desc: 'SR, D & JK Sequential' },
  { id: 16, title: 'Universal Gates',       level: 3, category: 'Logic Gates',  icon: '🔮', color: '#1cb0f6', desc: 'NAND & NOR Gate logic' },
  { id: 17, title: 'Karnaugh Maps',         level: 3, category: 'Logic Gates',  icon: '📐', color: '#1cb0f6', desc: 'Simplifying Logic visually' },
  { id: 18, title: 'Multiplexers',          level: 4, category: 'Circuits',     icon: '🔧', color: '#ff9600', desc: 'Data Selectors (MUX)' },
  { id: 19, title: 'Transmission Media',    level: 6, category: 'Networking',   icon: '📡', color: '#a855f7', desc: 'Wired & Wireless path details' },
  { id: 20, title: 'Network Devices',       level: 6, category: 'Networking',   icon: '🧱', color: '#a855f7', desc: 'Hubs, Switches & Routers' },
];

const categories = [
  { name: 'Fundamentals', icon: '⚡', color: '#58cc02', bg: 'rgba(88,204,2,0.1)',    border: 'rgba(88,204,2,0.3)',    lessons: [0, 1, 13] },
  { name: 'Logic Gates',  icon: '🔮', color: '#1cb0f6', bg: 'rgba(28,176,246,0.1)',  border: 'rgba(28,176,246,0.3)',  lessons: [2, 3, 4, 5, 14, 16, 17] },
  { name: 'Circuits',     icon: '🔧', color: '#ff9600', bg: 'rgba(255,150,0,0.1)',   border: 'rgba(255,150,0,0.3)',   lessons: [6, 7, 15, 18] },
  { name: 'Networking',   icon: '📡', color: '#a855f7', bg: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.3)',  lessons: [8, 9, 10, 11, 19, 20] },
  { name: 'Mastery',      icon: '🏆', color: '#7c5ef2', bg: 'rgba(124,94,242,0.1)',  border: 'rgba(124,94,242,0.3)',  lessons: [12] },
];
let completedLessons = new Set();

function syncCompletionState() {
  completedLessons = UserService.getCompletedLessons();
}

function getCompletedCount() {
  return completedLessons.size;
}
function canAccessLesson(idx) {
  const order = [0, 1, 13, 2, 3, 4, 5, 14, 16, 17, 6, 7, 15, 18, 8, 9, 10, 11, 19, 20, 12];
  const pos = order.indexOf(idx);
  if (pos <= 0) return true;
  return completedLessons.has(order[pos - 1]);
}

export function markLessonComplete(lessonIdx) {
  completedLessons.add(lessonIdx);
  renderCourseMap();
  if (window.updateXPDisplay) window.updateXPDisplay();
}

function getLessonState(idx) {
  if (completedLessons.has(idx)) return 'completed';
  if (canAccessLesson(idx))       return 'available';
  return 'locked';
}
function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const clamp = (v) => Math.min(255, Math.max(0, v));
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0xff) + amount);
  const b = clamp((num & 0xff) + amount);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
function navigateToLesson(lessonIdx) {
  if (window.loadLesson) {
    window.loadLesson(lessonIdx);
  } else {
    console.warn('[CourseMap] window.loadLesson not available');
  }
  if (window.navigateToView) {
    window.navigateToView('course-view');
  } else {
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
    const panel = document.querySelector('.course-view');
    if (panel) panel.classList.add('active');
    document.querySelectorAll('.nav-tab, .mobile-nav-btn').forEach(t => t.classList.remove('active'));
  }
}
export function renderCourseMap() {
  const container = document.getElementById('course-map-container');
  if (!container) return;

  const mode = localStorage.getItem('logicQuest_interfaceMode') || 'classic';
  if (mode === 'professional') {
    renderProfessionalSyllabus(container);
    return;
  }

  syncCompletionState();
  const completedCount = getCompletedCount();
  const pct    = Math.round((completedCount / TOTAL_LESSONS) * 100);
  const xp     = UserService.getXP();
  const streak = UserService.getStreak();
  const keys   = UserService.getKeys();

  container.innerHTML = '';
  container.className = 'course-map-page';
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
  const pathWrap = document.createElement('div');
  pathWrap.className = 'cm-vertical-path';

  let nodeGlobalIdx = 0;

  categories.forEach((cat, catIdx) => {
    if (catIdx > 0) {
      const sc = document.createElement('div');
      const prevCatLastLesson = categories[catIdx - 1].lessons.at(-1);
      sc.className = `cm-vert-connector ${completedLessons.has(prevCatLastLesson) ? 'done' : ''}`;
      sc.style.height = '48px';
      pathWrap.appendChild(sc);
    }
    const catCompleted = cat.lessons.filter(id => completedLessons.has(id)).length;
    const banner = document.createElement('div');
    banner.className = 'cm-cat-banner';
    banner.innerHTML = `
      <div class="cm-cat-badge" style="background:${cat.bg};border-color:${cat.border}">
        <span class="cm-cat-icon">${cat.icon}</span>
        <span class="cm-cat-name" style="color:${cat.color}">${cat.name}</span>
        <span class="cm-cat-count">${catCompleted}/${cat.lessons.length}</span>
      </div>
    `;
    pathWrap.appendChild(banner);
    cat.lessons.forEach((lessonId, localIdx) => {
      const lesson   = lessonMetadata[lessonId];
      const state    = getLessonState(lessonId);
      const isCompleted = state === 'completed';
      const isAvailable = state === 'available';
      const isLocked    = state === 'locked';
      if (localIdx > 0 || nodeGlobalIdx > 0) {
        const conn = document.createElement('div');
        const prevDone = lessonId > 0 && completedLessons.has(lessonId - 1);
        conn.className = `cm-vert-connector ${prevDone ? 'done' : ''}`;
        pathWrap.appendChild(conn);
      }
      const side = cat.lessons.length === 1
        ? 'center'
        : nodeGlobalIdx % 2 === 0 ? 'left' : 'right';

      const nodeRow = document.createElement('div');
      nodeRow.className = `cm-node-row cm-side-${side}`;

      const nodeWrap = document.createElement('div');
      nodeWrap.className = 'cm-vnode-wrap';
      const btn = document.createElement('button');
      btn.className = `cm-vnode-btn ${state}`;
      btn.disabled  = isLocked;
      btn.setAttribute('data-lesson', lessonId);
      btn.setAttribute('aria-label', lesson.title);

      if (isCompleted) {
        btn.style.background  = cat.color;
        btn.style.borderColor = adjustColor(cat.color, -25);
        btn.style.boxShadow   = `0 5px 0 ${adjustColor(cat.color, -45)}`;
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="30" height="30" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`;
      } else if (isAvailable) {
        btn.style.borderColor = cat.color;
        btn.style.boxShadow   = `0 5px 0 ${adjustColor(cat.color, -40)}`;
        btn.innerHTML         = `<span class="cm-vnode-icon">${lesson.icon}</span>`;
        btn.classList.add('cm-pulse');
      } else {
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" style="opacity:0.35"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`;
      }

      btn.addEventListener('click', () => {
        if (isLocked) {
          showLockedToast(lesson.title);
          return;
        }
        if (window.playSound) window.playSound('click');
        navigateToLesson(lessonId);
      });
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

      const badgeHtml = isCompleted
        ? `<div class="cm-vnode-card-badge cm-badge-done">✓ Done</div>`
        : isAvailable
          ? `<div class="cm-vnode-card-badge cm-badge-start" style="background:${cat.bg};color:${cat.color};border-color:${cat.border}">→ Start</div>`
          : `<div class="cm-vnode-card-badge cm-badge-lock">🔒 Locked</div>`;

      label.innerHTML = `
        <div class="cm-vnode-card-title">${lesson.title}</div>
        <div class="cm-vnode-card-desc">${lesson.desc}</div>
        ${badgeHtml}
      `;
      if (side === 'left') {
        nodeWrap.appendChild(label);
        nodeWrap.appendChild(btn);
      } else {
        nodeWrap.appendChild(btn);
        nodeWrap.appendChild(label);
      }

      nodeRow.appendChild(nodeWrap);
      pathWrap.appendChild(nodeRow);
      nodeGlobalIdx++;
    });
  });

  container.appendChild(pathWrap);
  if (completedCount === 0) {
    const tip = document.createElement('div');
    tip.className = 'cm-tip-card';
    tip.innerHTML = `
      <div class="cm-tip-icon">👆</div>
      <div class="cm-tip-text">
        <strong>Start your journey!</strong>
        <span>Click any glowing lesson circle or card to begin.</span>
      </div>
    `;
    container.appendChild(tip);
  } else if (completedCount === TOTAL_LESSONS) {
    const done = document.createElement('div');
    done.className = 'cm-complete-card';
    done.innerHTML = `
      <div class="cm-complete-icon">🏆</div>
      <h2>Congratulations!</h2>
      <p>You've completed the entire A/L ICT Digital Logic & Networking course!<br>You're fully prepared for the Sri Lankan A/L ICT exam.</p>
      <button class="btn-primary cm-sandbox-btn"
        onclick="if(window.navigateToView) window.navigateToView('sandbox-view')">
        Build in Sandbox →
      </button>
    `;
    container.appendChild(done);
  }
}

function renderProfessionalSyllabus(container) {
  syncCompletionState();
  const completedCount = getCompletedCount();
  const pct = Math.round((completedCount / TOTAL_LESSONS) * 100);

  container.innerHTML = '';
  container.className = 'course-map-page professional-syllabus-view';

  const wrap = document.createElement('div');
  wrap.className = 'syllabus-view-container';

  const header = document.createElement('div');
  header.className = 'syllabus-header';

  const currentLang = localStorage.getItem('logicQuest_medium') || 'en';
  const titleText = currentLang === 'si' ? 'විෂය මාලා දළ විශ්ලේෂණය' : 'Curriculum Overview';
  const progressText = currentLang === 'si' ? 'සම්පූර්ණ ප්‍රගතිය' : 'Overall Progress';

  header.innerHTML = `
    <div>
      <h2 class="syllabus-header-title">${titleText}</h2>
      <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:2px;">
        ${completedCount} / ${TOTAL_LESSONS} ${currentLang === 'si' ? 'පාඩම් නිම කර ඇත' : 'Lessons Completed'}
      </div>
    </div>
    <div class="syllabus-progress-bar">
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;font-weight:600;color:var(--text-secondary)">
        <span>${progressText}</span>
        <span>${pct}%</span>
      </div>
      <div class="cm-progress-track">
        <div class="cm-progress-fill" style="width: ${pct}%"></div>
      </div>
    </div>
  `;
  wrap.appendChild(header);

  categories.forEach((cat, catIdx) => {
    const catCompleted = cat.lessons.filter(id => completedLessons.has(id)).length;
    const modulePct = Math.round((catCompleted / cat.lessons.length) * 100);

    const modCard = document.createElement('div');
    modCard.className = 'syllabus-module-card';

    const modHeader = document.createElement('div');
    modHeader.className = 'syllabus-module-header';
    modHeader.innerHTML = `
      <div class="syllabus-module-info">
        <div class="syllabus-module-icon" style="background:${cat.bg}; border:1.5px solid ${cat.border}; color:${cat.color}">
          ${cat.icon}
        </div>
        <div class="syllabus-module-meta">
          <span class="syllabus-module-title">${cat.name}</span>
          <span class="syllabus-module-count">${catCompleted} / ${cat.lessons.length} ${currentLang === 'si' ? 'පාඩම් නිමයි' : 'Lessons Done'}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:0.8rem;font-weight:700;color:var(--text-secondary)">${modulePct}%</span>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="transition:transform 0.2s;" class="syllabus-chevron">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    `;

    const lessonsList = document.createElement('div');
    lessonsList.className = 'syllabus-lessons-list';
    lessonsList.style.display = 'block'; 

    modHeader.addEventListener('click', () => {
      const isCollapsed = lessonsList.style.display === 'none';
      lessonsList.style.display = isCollapsed ? 'block' : 'none';
      const chevron = modHeader.querySelector('.syllabus-chevron');
      if (chevron) {
        chevron.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(-90deg)';
      }
      if (window.playSound) window.playSound('click');
    });

    cat.lessons.forEach((lessonId) => {
      const lesson = lessonMetadata[lessonId];
      const state = getLessonState(lessonId);
      const isCompleted = state === 'completed';
      const isAvailable = state === 'available';
      const isLocked = state === 'locked';

      const row = document.createElement('div');
      row.className = `syllabus-lesson-row ${isLocked ? 'locked' : ''}`;

      let statusIconHtml = '';
      if (isCompleted) {
        statusIconHtml = `<div class="syllabus-lesson-status completed"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>`;
      } else if (isAvailable) {
        statusIconHtml = `<div class="syllabus-lesson-status available"><svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>`;
      } else {
        statusIconHtml = `<div class="syllabus-lesson-status locked"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>`;
      }

      const startText = currentLang === 'si' ? 'ආරම්භ කරන්න' : 'Start';
      const reviewText = currentLang === 'si' ? 'පුනරීක්ෂණය' : 'Review';
      const lockedText = currentLang === 'si' ? 'අගුළු දමා ඇත' : 'Locked';

      row.innerHTML = `
        <div class="syllabus-lesson-main">
          ${statusIconHtml}
          <div class="syllabus-lesson-details">
            <span class="syllabus-lesson-title">${lessonId + 1}. ${lesson.title}</span>
            <span class="syllabus-lesson-desc">${lesson.desc}</span>
          </div>
        </div>
        <button class="syllabus-btn-action" ${isLocked ? 'disabled' : ''}>
          ${isCompleted ? reviewText : isAvailable ? startText : lockedText}
        </button>
      `;

      if (!isLocked) {
        const btn = row.querySelector('.syllabus-btn-action');
        const handleStart = () => {
          if (window.playSound) window.playSound('click');
          navigateToLesson(lessonId);
        };
        btn?.addEventListener('click', handleStart);
        row.addEventListener('click', (e) => {
          if (e.target !== btn && !btn?.contains(e.target)) {
            handleStart();
          }
        });
        row.style.cursor = 'pointer';
      }

      lessonsList.appendChild(row);
    });

    modCard.appendChild(modHeader);
    modCard.appendChild(lessonsList);
    wrap.appendChild(modCard);
  });

  container.appendChild(wrap);
}

function showLockedToast(lessonTitle) {
  document.getElementById('cm-toast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'cm-toast';
  toast.style.cssText = `
    position:fixed; bottom:90px; left:50%; transform:translateX(-50%);
    background:var(--bg-secondary); border:2px solid var(--color-amber);
    color:var(--text-primary); padding:0.75rem 1.25rem; border-radius:12px;
    font-family:var(--font-header); font-weight:700; font-size:0.9rem;
    box-shadow:0 4px 20px rgba(0,0,0,0.15); z-index:999;
    animation: slideUp 0.25s ease; white-space:nowrap;
  `;
  toast.innerHTML = `🔒 Complete the previous lesson to unlock <em>${lessonTitle}</em>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
export async function initCourseMap() {
  await UserService.load();
  syncCompletionState();
  renderCourseMap();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderCourseMap, 150);
  });
}
window.renderCourseMap     = renderCourseMap;
window.markLessonComplete  = markLessonComplete;
window.initCourseMap       = initCourseMap;
window.syncCompletionState = syncCompletionState;