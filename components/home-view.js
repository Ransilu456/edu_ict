// ============================================================
//  Home View Component — <home-view>
// ============================================================

import template from './home-view.html?raw';
import './home-view.css';

const TOTAL_LESSONS = 9;

class HomeView extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;
    this._bindNavigation();
    this._syncProgress();

    // Re-sync whenever the home panel becomes active
    const observer = new MutationObserver(() => {
      if (this.querySelector('.home-view')?.classList.contains('active')) {
        this._syncProgress();
      }
    });
    const panel = this.querySelector('.home-view');
    if (panel) {
      observer.observe(panel, { attributes: true, attributeFilter: ['class'] });
    }
  }

  // ── Navigate to a view tab ────────────────────────────────
  _goToView(targetClass) {
    // Use global helper if available, otherwise fallback
    if (window.navigateToView) {
      window.navigateToView(targetClass);
    } else {
      // Fallback: directly find and click the tab
      const tab = document.querySelector(`.nav-tab[data-target="${targetClass}"]`);
      if (tab) {
        tab.click();
      } else {
        console.warn(`Navigation tab not found for target: ${targetClass}`);
      }
    }
  }

  // ── Wire all buttons & feature cards to navigation ───────
  _bindNavigation() {
    // Hero CTA buttons
    const startBtn = this.querySelector('#home-hero-start-btn');
    if (startBtn) startBtn.addEventListener('click', () => {
      const step = parseInt(localStorage.getItem('logicQuest_step') || '0', 10);
      if (window.loadLesson) window.loadLesson(Math.min(TOTAL_LESSONS - 1, step));
      this._goToView('course-map-view');
    });

    const sandboxBtn = this.querySelector('#home-hero-sandbox-btn');
    if (sandboxBtn) sandboxBtn.addEventListener('click', () => this._goToView('sandbox-view'));

    // Feature cards
    const cardNav = (id, target) => {
      const card = this.querySelector(`#${id}`);
      if (card) {
        card.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (window.playSound) window.playSound('click');
          this._goToView(target);
        });
        // Also handle Enter key on keyboard
        card.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (window.playSound) window.playSound('click');
            this._goToView(target);
          }
        });
      }
    };

    cardNav('home-feat-course',     'course-map-view');
    cardNav('home-feat-sandbox',    'sandbox-view');
    cardNav('home-feat-explorer',   'explorer-view');
    cardNav('home-feat-subnetting', 'subnetting-view');
    cardNav('home-feat-encoder',    'encoder-view');
    // progress card goes to course map
    cardNav('home-feat-progress',   'course-map-view');
  }

  // ── Sync progress from localStorage ──────────────────────
  _syncProgress() {
    const step = parseInt(localStorage.getItem('logicQuest_step') || '0', 10);
    const extraXp = parseInt(localStorage.getItem('logicQuest_extraXp') || '0', 10);
    const xp = step * 10 + extraXp;
    const pct = Math.min(100, Math.round((step / TOTAL_LESSONS) * 100));

    // Hero stat row
    const heroXp = this.querySelector('#home-hero-xp');
    if (heroXp) heroXp.textContent = xp + ' XP';

    const heroLesson = this.querySelector('#home-hero-lesson');
    if (heroLesson) {
      heroLesson.textContent = step >= TOTAL_LESSONS
        ? 'Complete! 🎉'
        : `Lesson ${Math.min(TOTAL_LESSONS, step + 1)}`;
    }

    const heroPct = this.querySelector('#home-hero-pct');
    if (heroPct) heroPct.textContent = `${pct}%`;

    // Also sync header badge
    const scoreHeader = document.getElementById('score-count');
    if (scoreHeader) scoreHeader.textContent = xp;

    // Progress card mini bar
    const miniFill = this.querySelector('#home-progress-mini-fill');
    if (miniFill) miniFill.style.width = `${pct}%`;

    const miniPct = this.querySelector('#home-progress-mini-pct');
    if (miniPct) miniPct.textContent = `${pct}%`;

    const progressDesc = this.querySelector('#home-progress-desc');
    if (progressDesc) {
      if (step === 0) {
        progressDesc.textContent = 'Start the course to earn XP and track your progress!';
      } else if (step >= TOTAL_LESSONS) {
        progressDesc.textContent = `🏆 Course complete! You earned ${xp} XP total!`;
      } else {
        const lessonName = [
          'The Binary Code', 'The Transistor Switch', 'The NOT Gate',
          'The AND Gate', 'The OR Gate', 'The XOR Gate',
          'Adding Bits (Half Adder)', 'The Full Adder', 'Master of Logic!'
        ][step] || `Lesson ${step + 1}`;
        progressDesc.textContent = `Next up: "${lessonName}" — ${xp} XP earned so far`;
      }
    }
  }
}

customElements.define('home-view', HomeView);
export default HomeView;
