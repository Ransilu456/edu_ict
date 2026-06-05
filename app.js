// ============================================================
//  LogicQuest — Main Application Entry Point
// ============================================================

import './common.js';
import './course.js';
import './explorer.js';
import './sandbox.js';
import { initSubnetting }              from './subnetting.js';
import { initEncoder, refreshEncoderCanvases } from './encoder.js';

// ── Boot ──────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

function boot() {
  setupViewNavigation();
}

// ── View Navigation ───────────────────────────────────────────
function setupViewNavigation() {
  const tabs   = document.querySelectorAll('.nav-tab');
  const panels = document.querySelectorAll('.view-panel');

  // Track which modules have been initialised
  let subnettingReady = false;
  let encoderReady    = false;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (window.playSound) window.playSound('click');
      const target = tab.dataset.target;

      tabs.forEach(t   => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.querySelector(`.${target}`);
      if (targetPanel) targetPanel.classList.add('active');

      // Per-view initialisation hooks
      if (target === 'course-view') {
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
          // Redraw canvases when view becomes visible
          setTimeout(refreshEncoderCanvases, 80);
        }
      }
    });
  });
}
