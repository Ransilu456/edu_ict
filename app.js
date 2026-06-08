// ============================================================
//  LogicQuest — Main Application Entry Point
// ============================================================

import './common.js';
import './course.js';
import './course-map.js';
import './explorer.js';
import './sandbox.js';
import { initSubnetting }              from './subnetting.js';
import { initEncoder, refreshEncoderCanvases } from './encoder.js';

// Web Components
import './components/home-view.js';

// ── Boot ──────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

function boot() {
  setupViewNavigation();
}

// ── Get all view panels (including those inside custom elements) ─
function getAllPanels() {
  // Panel inside <home-view> custom element (prioritized)
  const homeEl = document.querySelector('home-view');
  const homePanel = homeEl ? homeEl.querySelector('.home-view') : null;
  
  // Standard panels in <main>
  const direct = Array.from(document.querySelectorAll('main > .view-panel'));
  
  // Always include home panel if it exists
  if (homePanel) {
    return [homePanel, ...direct];
  }
  return direct;
}

// ── View Navigation ───────────────────────────────────────────
function setupViewNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');

  // Track which modules have been initialised
  let subnettingReady = false;
  let encoderReady    = false;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (window.playSound) window.playSound('click');
      const target = tab.dataset.target;

      // Deactivate all tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Deactivate ALL panels (including home-view and direct panels)
      getAllPanels().forEach(p => {
        if (p) p.classList.remove('active');
      });

      if (target === 'home-view') {
        const homeEl = document.querySelector('home-view');
        if (homeEl) {
          const panel = homeEl.querySelector('.home-view');
          if (panel) panel.classList.add('active');
        }
        return;
      }

      // Find and activate the target panel
      const targetPanel = document.querySelector(`.${target}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      // Per-view initialisation hooks
      if (target === 'course-map-view') {
        if (window.renderCourseMap) setTimeout(window.renderCourseMap, 50);

      } else if (target === 'course-view') {
        if (window.drawCourseWires) setTimeout(window.drawCourseWires, 50);

      } else if (target === 'explorer-view') {
        if (window.renderExplorerGate) setTimeout(window.renderExplorerGate, 50);

      } else if (target === 'sandbox-view') {
        if (window.initSandboxCanvas) window.initSandboxCanvas();

      } else if (target === 'subnetting-view') {
        if (!subnettingReady) {
          initSubnetting();
          subnettingReady = true;
        }

      } else if (target === 'encoder-view') {
        if (!encoderReady) {
          initEncoder();
          encoderReady = true;
        } else {
          setTimeout(refreshEncoderCanvases, 80);
        }
      }
    });
  });

  // Expose a global helper so home-view.js can trigger tab changes
  window.navigateToView = (targetClass) => {
    const tab = document.querySelector(`.nav-tab[data-target="${targetClass}"]`);
    if (tab) tab.click();
  };
}
