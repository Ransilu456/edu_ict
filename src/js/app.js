import './common.js';
import './course.js';
import './course-map.js';
import './explorer.js';
import './sandbox.js';
import { initSettingsView }            from './settings.js';
import { initSubnetting }              from './subnetting.js';
import { initEncoder, refreshEncoderCanvases } from './encoder.js';
import UserService from './user-service.js';
import './components/home-view.js';
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

function boot() {
  initInterfaceMode();
  setupViewNavigation();
  if (window.syncCompletionState) window.syncCompletionState();
  setTimeout(() => UserService.recordSession(), 500);
}

function initInterfaceMode() {
  const savedMode = localStorage.getItem('logicQuest_interfaceMode') || 'classic';
  setInterfaceMode(savedMode);

  const classicBtn = document.getElementById('header-mode-classic-btn');
  const proBtn = document.getElementById('header-mode-pro-btn');

  if (classicBtn && proBtn) {
    classicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.playSound) window.playSound('click');
      setInterfaceMode('classic');
    });

    proBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.playSound) window.playSound('click');
      setInterfaceMode('professional');
    });
  }
}

function setInterfaceMode(mode) {
  localStorage.setItem('logicQuest_interfaceMode', mode);

  const classicBtn = document.getElementById('header-mode-classic-btn');
  const proBtn = document.getElementById('header-mode-pro-btn');

  if (mode === 'professional') {
    document.documentElement.classList.add('professional-mode');
    if (classicBtn) classicBtn.classList.remove('active');
    if (proBtn) proBtn.classList.add('active');
  } else {
    document.documentElement.classList.remove('professional-mode');
    if (classicBtn) classicBtn.classList.add('active');
    if (proBtn) proBtn.classList.remove('active');
  }

  const radios = document.getElementsByName('settings-interface-mode');
  if (radios.length) {
    radios.forEach(r => {
      r.checked = (r.value === mode);
    });
  }

  if (window.renderCourseMap) {
    window.renderCourseMap();
  }
}
window.setInterfaceMode = setInterfaceMode;

function getAllPanels() {
  const homeEl = document.querySelector('home-view');
  const homePanel = homeEl ? homeEl.querySelector('.home-view') : null;
  const direct = Array.from(document.querySelectorAll('main > .view-panel'));
  if (homePanel) {
    return [homePanel, ...direct];
  }
  return direct;
}
function setupViewNavigation() {
  const tabs = document.querySelectorAll('.nav-tab, .mobile-nav-btn');

  let subnettingReady = false;
  let encoderReady    = false;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (window.playSound) window.playSound('click');
      const target = tab.dataset.target;

      cleanupCurrentView();
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.mobile-nav-btn').forEach(t => t.classList.remove('active'));
      const desktopTab = document.querySelector(`.nav-tab[data-target="${target}"]`);
      if (desktopTab) desktopTab.classList.add('active');
      const mobileTab = document.querySelector(`.mobile-nav-btn[data-target="${target}"]`);
      if (mobileTab) mobileTab.classList.add('active');
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
      } else if (target === 'settings-view') {
        initSettingsView();
      }
    });
  });
  document.querySelectorAll('[data-target="home-view"]').forEach(t => t.classList.add('active'));

  function cleanupCurrentView() {
    if (window.cleanupCommon) window.cleanupCommon();
    if (window.cleanupCourse) window.cleanupCourse();
    if (window.cleanupCourseMap) window.cleanupCourseMap();
    if (window.cleanupExplorer) window.cleanupExplorer();
    if (window.cleanupSandbox) window.cleanupSandbox();
  }
  window.navigateToView = (targetClass) => {
    const tab = document.querySelector(`.nav-tab[data-target="${targetClass}"]`);
    if (tab) {
      tab.click();
    } else {
      const mTab = document.querySelector(`.mobile-nav-btn[data-target="${targetClass}"]`);
      if (mTab) {
        mTab.click();
      } else {
        cleanupCurrentView();
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.mobile-nav-btn').forEach(t => t.classList.remove('active'));
        getAllPanels().forEach(p => {
          if (p) p.classList.remove('active');
        });
        const targetPanel = document.querySelector(`.${targetClass}`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
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
