// ============================================================
//  LogicQuest Common Shared Utilities (Theme, Audio, XP Sync)
// ============================================================

// Web Audio API Synthesizer (Zero audio files required)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = localStorage.getItem("soundEnabled") !== "false";

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

// Page Initialization
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
  
  // Set initial state visual
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
  
  resetBtn.addEventListener("click", () => {
    playSound('click');
    if (confirm("Are you sure you want to restart the course from the beginning? This will reset your XP.")) {
      localStorage.setItem('logicQuest_step', 0);
      updateXPDisplay();
      // If we are on the course page, trigger a reload or callback
      if (window.onRestartCourseProgression) {
        window.onRestartCourseProgression();
      } else {
        location.reload();
      }
    }
  });
}

function updateXPDisplay() {
  const scoreCount = document.getElementById("score-count");
  if (scoreCount) {
    // Get XP from completed lessons (each worth 10 XP) + extra XP
    const completed = localStorage.getItem('logicQuest_completedLessons');
    const completedLessons = new Set(completed ? JSON.parse(completed) : []);
    const xp = completedLessons.size * 10 + (parseInt(localStorage.getItem('logicQuest_extraXp')) || 0);
    scoreCount.innerText = xp;
  }
  updateKeysDisplay();
  
  // Refresh course map if it's visible
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
    let keys = localStorage.getItem('logicQuest_keys');
    if (keys === null) {
      keys = 5;
      localStorage.setItem('logicQuest_keys', keys);
    }
    keysCount.innerText = keys;
  }
}
window.updateXPDisplay = updateXPDisplay;

// Listen for storage events (XP changes in other tabs)
window.addEventListener('storage', (e) => {
  if (e.key === 'logicQuest_step' || e.key === 'logicQuest_completedLessons' || e.key === 'logicQuest_extraXp') {
    updateXPDisplay();
  }
});
