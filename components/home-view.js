// ============================================================
//  Home View Component — <home-view>
// ============================================================

import template from './home-view.html?raw';
import './home-view.css';

// Total lesson count constant (update when course grows)
const TOTAL_LESSONS = 42;

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
    // Use the global helper registered by app.js (handles all init hooks)
    if (window.navigateToView) {
      window.navigateToView(targetClass);
      return;
    }
    // Fallback: manually click the nav tab
    const tab = document.querySelector(`.nav-tab[data-target="${targetClass}"]`);
    if (tab) tab.click();
  }

  // ── Wire all buttons to navigation ───────────────────────
  _bindNavigation() {
    const nav = (id, target) => {
      const btn = this.querySelector(`#${id}`);
      if (btn) btn.addEventListener('click', () => this._goToView(target));
    };

    nav('home-start-course-btn', 'course-view');
    nav('home-explore-btn',       'sandbox-view');
    nav('home-go-course',         'course-view');
    nav('home-go-explorer',       'explorer-view');
    nav('home-go-sandbox',        'sandbox-view');
    nav('home-go-subnetting',     'subnetting-view');
    nav('home-go-encoder',        'encoder-view');
    nav('home-resume-btn',        'course-view');
    nav('home-quick-course',      'course-view');
    nav('home-quick-sandbox',     'sandbox-view');
    nav('home-quick-explorer',    'explorer-view');
    nav('home-quick-subnetting',  'subnetting-view');
    nav('home-quick-encoder',     'encoder-view');
  }

  // ── Sync progress from localStorage ──────────────────────
  _syncProgress() {
    const step = parseInt(localStorage.getItem('logicQuest_step') || '0', 10);
    const xp   = parseInt(localStorage.getItem('logicQuest_xp')   || '0', 10);

    const pct  = Math.min(100, Math.round((step / TOTAL_LESSONS) * 100));

    // XP stat
    const xpEl = this.querySelector('#home-stat-xp');
    if (xpEl) xpEl.textContent = xp;

    // Progress %
    const pctEl = this.querySelector('#home-stat-progress');
    if (pctEl) pctEl.textContent = `${pct}%`;

    // Progress bar
    const fill = this.querySelector('#home-progress-fill');
    if (fill) fill.style.width = `${pct}%`;

    // Step label
    const stepLabel = this.querySelector('#home-progress-step-label');
    if (stepLabel) stepLabel.textContent = `Lesson ${Math.max(1, step)} of ${TOTAL_LESSONS}`;

    // XP label in progress card
    const xpLabel = this.querySelector('#home-progress-xp-label');
    if (xpLabel) xpLabel.textContent = `${xp} XP`;

    // Update "Continue Learning" vs "Start Learning"
    const ctaBtn = this.querySelector('#home-start-course-btn');
    if (ctaBtn) {
      ctaBtn.innerHTML = step > 0
        ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Continue Learning`
        : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Start Learning`;
    }
  }
}

customElements.define('home-view', HomeView);
export default HomeView;
