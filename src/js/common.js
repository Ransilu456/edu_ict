import UserService from './user-service.js';


const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = localStorage.getItem("soundEnabled") !== "false";

let storageListener = null;

function playSound(type) {
  if (!soundEnabled) return;
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
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
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'success') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.24);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    osc.start(now);
    osc.stop(now + 0.6);
  } else if (type === 'error') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'toggle') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
    osc.start(now);
    osc.stop(now + 0.06);
  }
}
window.playSound = playSound;
function initCommon() {
  initTheme();
  initSoundToggle();
  initRestartProgress();
  updateXPDisplay();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCommon);
} else {
  initCommon();
}

function initTheme() {
  const currentTheme = localStorage.getItem("theme") || "light";
  if (currentTheme === "dark") {
    document.documentElement.classList.add("dark-theme");
  } else {
    document.documentElement.classList.remove("dark-theme");
  }
  
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      playSound('click');
      const isDark = document.documentElement.classList.toggle("dark-theme");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }
}

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
  btn.innerHTML = soundEnabled ? 
    `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>` : 
    `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
}

function initRestartProgress() {
  const resetBtn = document.getElementById("restart-course");
  if (!resetBtn) return;
  
  resetBtn.addEventListener("click", async () => {
    playSound('click');
    showConfirm("Are you sure you want to restart the course from the beginning? This will reset your XP and progress.", async (result) => {
      if (result) {
        await UserService.reset();
        updateXPDisplay();
        if (window.onRestartCourseProgression) {
          window.onRestartCourseProgression();
        } else {
          location.reload();
        }
      }
    });
  });
}

function updateXPDisplay() {
  const xp = UserService.getXP();
  document.querySelectorAll('#score-count').forEach(el => {
    el.innerText = xp;
  });

  updateKeysDisplay();
  if (window.renderCourseMap) {
    const mapContainer = document.getElementById('course-map-container');
    if (mapContainer && mapContainer.innerHTML.trim() !== '') {
      window.renderCourseMap();
    }
  }
}

function updateKeysDisplay() {
  const keysCount = document.getElementById("keys-count");
  if (keysCount) {
    const keys = UserService.getKeys();
    keysCount.innerText = keys;
  }
}
window.updateXPDisplay = updateXPDisplay;

function showAlert(message, title, callback) {
  const modal = document.getElementById('custom-alert-modal');
  const box = document.getElementById('custom-alert-box');
  const titleEl = document.getElementById('custom-alert-title');
  const msgEl = document.getElementById('custom-alert-msg');
  const iconEl = document.getElementById('custom-alert-icon');
  const okBtn = document.getElementById('custom-alert-ok-btn');
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
  const box = document.getElementById('custom-alert-box');
  const titleEl = document.getElementById('custom-alert-title');
  const msgEl = document.getElementById('custom-alert-msg');
  const iconEl = document.getElementById('custom-alert-icon');
  const okBtn = document.getElementById('custom-alert-ok-btn');
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
storageListener = async (e) => {
  if (e.key === 'logicQuest_step' || e.key === 'logicQuest_completedLessons' || e.key === 'logicQuest_extraXp' || e.key === 'logicQuest_keys') {
    await UserService.refresh();
    updateXPDisplay();
  }
};
window.addEventListener('storage', storageListener);
function cleanupCommon() {
  if (storageListener) {
    window.removeEventListener('storage', storageListener);
    storageListener = null;
  }
}
window.cleanupCommon = cleanupCommon;
