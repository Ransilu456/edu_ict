import template from './app-header.html?raw';
import './app-header.css';

class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;
    this.initTheme();
    this.initSoundToggle();
    this.initRestartProgress();
    this.initLogoNav();
  }

  initLogoNav() {
    const logoBtn = this.querySelector('#logo-home-btn');
    if (logoBtn) {
      logoBtn.addEventListener('click', () => {
        if (window.navigateToView) {
          window.navigateToView('home-view');
        } else {
          location.reload();
        }
      });
    }
  }

  initTheme() {
    const themeToggle = this.querySelector('#theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        if (window.playSound) window.playSound('click');
        const isDark = document.documentElement.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      });
    }
  }

  initSoundToggle() {
    const audioBtn = this.querySelector('#audio-toggle');
    if (!audioBtn) return;

    const updateAudioIcon = () => {
      const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
      audioBtn.innerHTML = soundEnabled ?
        `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>` :
        `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
    };

    updateAudioIcon();

    audioBtn.addEventListener('click', () => {
      const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
      const newEnabled = !soundEnabled;
      localStorage.setItem('soundEnabled', newEnabled ? 'true' : 'false');
      if (window.setSoundEnabled) {
        window.setSoundEnabled(newEnabled);
      }
      updateAudioIcon();
      if (window.playSound) window.playSound('click');
    });
  }

  initRestartProgress() {
    const resetBtn = this.querySelector('#restart-course');
    if (!resetBtn) return;

    resetBtn.addEventListener('click', () => {
      if (window.playSound) window.playSound('click');
      if (confirm('Are you sure you want to restart the course from the beginning? This will reset your XP.')) {
        localStorage.setItem('logicQuest_step', 0);
        if (window.updateXPDisplay) window.updateXPDisplay();
        if (window.onRestartCourseProgression) {
          window.onRestartCourseProgression();
        } else {
          location.reload();
        }
      }
    });
  }
}

customElements.define('app-header', AppHeader);
export default AppHeader;
