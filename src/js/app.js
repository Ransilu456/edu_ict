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
  // Preload completion state for course map
  if (window.syncCompletionState) window.syncCompletionState();
}

// ── Get all view panels (including those inside custom elements) ─
function getAllPanels() {
  const homeEl = document.querySelector('home-view');
  const homePanel = homeEl ? homeEl.querySelector('.home-view') : null;
  const direct = Array.from(document.querySelectorAll('main > .view-panel'));
  if (homePanel) {
    return [homePanel, ...direct];
  }
  return direct;
}

// ── View Navigation ───────────────────────────────────────────
function setupViewNavigation() {
  const tabs = document.querySelectorAll('.nav-tab, .mobile-nav-btn');

  let subnettingReady = false;
  let encoderReady    = false;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (window.playSound) window.playSound('click');
      const target = tab.dataset.target;

      cleanupCurrentView();

      // Deactivate all nav tabs (desktop + mobile)
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.mobile-nav-btn').forEach(t => t.classList.remove('active'));

      // Activate matching desktop tab
      const desktopTab = document.querySelector(`.nav-tab[data-target="${target}"]`);
      if (desktopTab) desktopTab.classList.add('active');

      // Activate matching mobile tab
      const mobileTab = document.querySelector(`.mobile-nav-btn[data-target="${target}"]`);
      if (mobileTab) mobileTab.classList.add('active');

      // Deactivate all panels
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

      const targetPanel = document.querySelector(`.${target}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      // Per-view initialisation hooks
      if (target === 'course-map-view') {
        if (window.syncCompletionState) window.syncCompletionState();
        if (window.renderCourseMap) setTimeout(window.renderCourseMap, 50);

      } else if (target === 'course-view') {
        if (window.syncCourseProgression) window.syncCourseProgression();
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

  // Set initial active state on home nav
  document.querySelectorAll('[data-target="home-view"]').forEach(t => t.classList.add('active'));

  function cleanupCurrentView() {
    if (window.cleanupCommon) window.cleanupCommon();
    if (window.cleanupCourse) window.cleanupCourse();
    if (window.cleanupCourseMap) window.cleanupCourseMap();
    if (window.cleanupExplorer) window.cleanupExplorer();
    if (window.cleanupSandbox) window.cleanupSandbox();
  }

  // Global navigation helper
  window.navigateToView = (targetClass) => {
    const tab = document.querySelector(`.nav-tab[data-target="${targetClass}"]`);
    if (tab) {
      tab.click();
    } else {
      const mTab = document.querySelector(`.mobile-nav-btn[data-target="${targetClass}"]`);
      if (mTab) {
        mTab.click();
      } else {
        // Direct panel activation (e.g. for course-view)
        cleanupCurrentView();

        // Deactivate all nav tabs
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.mobile-nav-btn').forEach(t => t.classList.remove('active'));

        // Deactivate all panels
        getAllPanels().forEach(p => {
          if (p) p.classList.remove('active');
        });

        // Activate target panel
        const targetPanel = document.querySelector(`.${targetClass}`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }

        // Perform target-specific hook manually since tab click was bypassed
        if (targetClass === 'course-view') {
          if (window.syncCourseProgression) window.syncCourseProgression();
          if (window.drawCourseWires) setTimeout(window.drawCourseWires, 50);
        } else if (targetClass === 'course-map-view') {
          if (window.syncCompletionState) window.syncCompletionState();
          if (window.renderCourseMap) setTimeout(window.renderCourseMap, 50);
        }
      }
    }
  };
}
