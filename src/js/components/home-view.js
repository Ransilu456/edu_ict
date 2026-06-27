import UserService from '../user-service.js';

const TOTAL_LESSONS = 21;

class HomeView extends HTMLElement {
  connectedCallback() {
    const template = document.getElementById('home-view-template').innerHTML;
    this.innerHTML = template;
    this._bindNavigation();
    this._syncProgress();
    this._syncActivity();
    const observer = new MutationObserver(() => {
      if (this.querySelector('.home-view')?.classList.contains('active')) {
        this._syncProgress();
        this._syncActivity();
      }
    });
    const panel = this.querySelector('.home-view');
    if (panel) {
      observer.observe(panel, { attributes: true, attributeFilter: ['class'] });
    }
  }
  _goToView(targetClass) {
    if (window.navigateToView) {
      window.navigateToView(targetClass);
    } else {
      const tab = document.querySelector(`.nav-tab[data-target="${targetClass}"]`);
      if (tab) {
        tab.click();
      } else {
        console.warn(`Navigation tab not found for target: ${targetClass}`);
      }
    }
  }
  _bindNavigation() {
    const startBtn = this.querySelector('#home-hero-start-btn');
    if (startBtn) startBtn.addEventListener('click', () => {
      const step = parseInt(localStorage.getItem('logicQuest_step') || '0', 10);
      if (window.loadLesson) window.loadLesson(Math.min(TOTAL_LESSONS - 1, step));
      this._goToView('course-map-view');
    });

    const sandboxBtn = this.querySelector('#home-hero-sandbox-btn');
    if (sandboxBtn) sandboxBtn.addEventListener('click', () => this._goToView('sandbox-view'));
    const cardNav = (id, target) => {
      const card = this.querySelector(`#${id}`);
      if (card) {
        card.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (window.playSound) window.playSound('click');
          this._goToView(target);
        });
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
    cardNav('home-feat-progress',   'course-map-view');
  }
  _syncProgress() {
    const step = parseInt(localStorage.getItem('logicQuest_step') || '0', 10);
    const extraXp = parseInt(localStorage.getItem('logicQuest_extraXp') || '0', 10);
    const xp = step * 10 + extraXp;
    const pct = Math.min(100, Math.round((step / TOTAL_LESSONS) * 100));
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
    const scoreHeader = document.getElementById('score-count');
    if (scoreHeader) scoreHeader.textContent = xp;
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
  _syncActivity() {
    const set = (id, val) => { const el = this.querySelector(`#${id}`); if (el) el.textContent = val; };
    set('home-stat-sessions', UserService.getSessions());
    set('home-stat-streak', UserService.getStreak());
    const last = UserService.getLastActive();
    set('home-stat-lastactive', last ? last.slice(0, 10) : '—');
  }
}

customElements.define('home-view', HomeView);
export default HomeView;
