import './common.js';
import './sandbox.js';
import './ic-creator.js';
import { initNetworkDevices } from './network-devices.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

function boot() {
  setupViewNavigation();
}

function getAllPanels() {
  return Array.from(document.querySelectorAll('main > .view-panel'));
}

function setupViewNavigation() {
  const tabs = document.querySelectorAll('.nav-tab, .mobile-nav-btn');
  let networkReady = false;

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

      getAllPanels().forEach(p => { if (p) p.classList.remove('active'); });

      const targetPanel = document.querySelector(`.${target}`);
      if (targetPanel) targetPanel.classList.add('active');

      if (target === 'sandbox-view') {
        if (window.initSandboxCanvas) window.initSandboxCanvas();
      } else if (target === 'network-devices-view') {
        if (!networkReady) {
          initNetworkDevices();
          networkReady = true;
        }
      }
    });
  });

  // Default: activate sandbox
  const defaultTab = document.querySelector('.nav-tab[data-target="sandbox-view"]');
  if (defaultTab) {
    defaultTab.classList.add('active');
    const mobileDefault = document.querySelector('.mobile-nav-btn[data-target="sandbox-view"]');
    if (mobileDefault) mobileDefault.classList.add('active');
    const panel = document.querySelector('.sandbox-view');
    if (panel) panel.classList.add('active');
    if (window.initSandboxCanvas) window.initSandboxCanvas();
  }

  window.navigateToView = (targetClass) => {
    const tab = document.querySelector(`.nav-tab[data-target="${targetClass}"]`);
    if (tab) tab.click();
  };
}

function cleanupCurrentView() {
  if (window.cleanupCommon) window.cleanupCommon();
  if (window.cleanupSandbox) window.cleanupSandbox();
  if (window.cleanupNetworkDevices) window.cleanupNetworkDevices();
}
