// LogicQuest — common.js (simplified, no UserService / XP / theme)

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = localStorage.getItem("soundEnabled") !== "false";

function playSound(type) {
  if (!soundEnabled) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;

  if (type === 'click') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
    osc.start(now); osc.stop(now + 0.1);
  } else if (type === 'success') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.08);
    osc.frequency.setValueAtTime(783.99, now + 0.16);
    osc.frequency.setValueAtTime(1046.50, now + 0.24);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.24);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc.start(now); osc.stop(now + 0.6);
  } else if (type === 'error') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now); osc.stop(now + 0.3);
  } else if (type === 'toggle') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
    osc.start(now); osc.stop(now + 0.06);
  }
}
window.playSound = playSound;

function initSoundToggle() {
  const audioBtn = document.getElementById("audio-toggle");
  if (!audioBtn) return;
  updateAudioIcon(audioBtn);
  audioBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("soundEnabled", soundEnabled ? "true" : "false");
    updateAudioIcon(audioBtn);
    playSound('click');
  });
}

function updateAudioIcon(btn) {
  btn.innerHTML = soundEnabled
    ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`
    : `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
}

let currentTheme = localStorage.getItem("logicQuest_theme") || "light";

function applyTheme(theme) {
  currentTheme = theme;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "light");
  }
  localStorage.setItem("logicQuest_theme", theme);
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) updateThemeIcon(themeBtn);
}

function updateThemeIcon(btn) {
  btn.innerHTML = currentTheme === "dark"
    ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    : `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  btn.title = currentTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
}

function initThemeToggle() {
  applyTheme(currentTheme);
  const themeBtn = document.getElementById("theme-toggle");
  if (!themeBtn) return;
  updateThemeIcon(themeBtn);
  themeBtn.addEventListener("click", () => {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    playSound('toggle');
    showToast(nextTheme === "dark" ? "🌙 Dark Mode Activated" : "☀️ Light Mode Activated");
  });
}
window.applyTheme = applyTheme;
window.initThemeToggle = initThemeToggle;

// Stub: no-op so existing sandbox.js calls to updateXPDisplay don't crash
window.updateXPDisplay = function() {};

function initControls() {
  initSoundToggle();
  initThemeToggle();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initControls);
} else {
  initControls();
}

// ── Modal helpers (used by sandbox, network-devices) ──────────────────────

function showAlert(message, title, callback) {
  const modal = document.getElementById('custom-alert-modal');
  const box   = document.getElementById('custom-alert-box');
  const titleEl = document.getElementById('custom-alert-title');
  const msgEl   = document.getElementById('custom-alert-msg');
  const iconEl  = document.getElementById('custom-alert-icon');
  const okBtn   = document.getElementById('custom-alert-ok-btn');
  const cancelBtn = document.getElementById('custom-alert-cancel-btn');
  if (!modal || !box) return;

  titleEl.textContent = title || 'Info';
  msgEl.innerHTML = message;
  iconEl.style.display = 'flex';
  cancelBtn.style.display = 'none';
  okBtn.style.display = 'inline-block';
  okBtn.textContent = 'OK';
  modal.style.display = 'flex';

  const close = (result) => {
    modal.style.display = 'none';
    okBtn.onclick = null;
    cancelBtn.onclick = null;
    if (callback) callback(result);
  };
  okBtn.onclick = () => close(true);
  box.addEventListener('click', (e) => e.stopPropagation());
  modal.addEventListener('click', () => close(true));
}
window.showAlert = showAlert;

function showConfirm(message, callback, title) {
  const modal = document.getElementById('custom-alert-modal');
  const box   = document.getElementById('custom-alert-box');
  const titleEl = document.getElementById('custom-alert-title');
  const msgEl   = document.getElementById('custom-alert-msg');
  const iconEl  = document.getElementById('custom-alert-icon');
  const okBtn   = document.getElementById('custom-alert-ok-btn');
  const cancelBtn = document.getElementById('custom-alert-cancel-btn');
  if (!modal || !box) return;

  titleEl.textContent = title || 'Confirm';
  msgEl.innerHTML = message;
  iconEl.style.display = 'none';
  okBtn.style.display = 'inline-block';
  okBtn.textContent = 'Yes';
  cancelBtn.style.display = 'inline-block';
  cancelBtn.textContent = 'Cancel';
  modal.style.display = 'flex';

  const close = (result) => {
    modal.style.display = 'none';
    okBtn.onclick = null;
    cancelBtn.onclick = null;
    if (callback) callback(result);
  };
  okBtn.onclick = () => close(true);
  cancelBtn.onclick = () => close(false);
  box.addEventListener('click', (e) => e.stopPropagation());
  modal.addEventListener('click', () => close(false));
}
window.showConfirm = showConfirm;

function showToast(msg) {
  let toast = document.getElementById('sb-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sb-toast';
    toast.style.cssText = `
      position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%);
      background:var(--text-primary); color:var(--bg-primary);
      padding:0.5rem 1.25rem; border-radius:6px; font-size:0.85rem;
      font-family:var(--font-header); font-weight:600;
      z-index:999; pointer-events:none; opacity:0;
      transition:opacity 0.2s ease;`;
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
}
window.showToast = showToast;

function cleanupCommon() {}
window.cleanupCommon = cleanupCommon;
