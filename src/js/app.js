import './common.js';
import './sandbox.js';
import { initBooleanTool } from './boolean-tool.js';
import { initBinaryTool } from './binary-tool.js';
import { initNetworkDevices } from './network-devices.js';
import { mountComponents } from './components.js';

mountComponents();
if (window.initControls) window.initControls();

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
  const tabs = document.querySelectorAll('[data-route]');
  let networkReady = false;
  const workspaceMode = window.location.pathname.endsWith('/app.html');

  const routes = {
    '/': { panel: 'sandbox-view' },
    '/logic': { panel: 'sandbox-view' },
    '/logic/sandbox': { panel: 'sandbox-view' },
    '/logic/boolean': { panel: 'boolean-view' },
    '/binary': { panel: 'binary-view' },
    '/binary/bitwise': { panel: 'binary-view' },
    '/networking': { panel: 'network-devices-view', subtab: 'network-tab' },
    '/networking/topology': { panel: 'network-devices-view', subtab: 'network-tab' },
    '/networking/osi': { panel: 'network-devices-view', subtab: 'osi-tab' },
    '/networking/subnetting': { panel: 'network-devices-view', subtab: 'subnet-tab' },
    '/networking/signal-encoding': { panel: 'network-devices-view', subtab: 'parity-tab' },
  };

  const requestedRoute = workspaceMode
    ? new URLSearchParams(window.location.search).get('route')
    : null;
  if (workspaceMode && requestedRoute && !routes[requestedRoute]) {
    window.location.replace(`/404.html?path=${encodeURIComponent(requestedRoute)}`);
    return;
  }

  function normalizePath(pathname) {
    const path = pathname.replace(/\/$/, '') || '/';
    return routes[path] ? path : '/';
  }

  function routeFromLocation() {
    return workspaceMode
      ? new URLSearchParams(window.location.search).get('route') || '/logic/sandbox'
      : window.location.pathname;
  }

  function routeUrl(path) {
    return workspaceMode
      ? `/app.html?route=${encodeURIComponent(path)}`
      : path;
  }

  function renderRoute(pathname, { replace = false } = {}) {
    const path = normalizePath(pathname);
    const route = routes[path];
    cleanupCurrentView();
    getAllPanels().forEach(panel => panel?.classList.remove('active'));
    document.querySelector(`.${route.panel}`)?.classList.add('active');
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.route === path || (path === '/logic' && tab.dataset.route === '/logic/sandbox'));
    });
    document.getElementById('app-footer')?.classList.add('is-hidden');
    if (replace && window.location.href !== new URL(routeUrl(path), window.location.origin).href) {
      history.replaceState({}, '', routeUrl(path));
    }

    if (route.panel === 'sandbox-view') {
      window.initSandboxCanvas?.();
    } else if (route.panel === 'boolean-view') {
      initBooleanTool();
    } else if (route.panel === 'binary-view') {
      initBinaryTool();
    } else if (route.panel === 'network-devices-view') {
      if (!networkReady) {
        initNetworkDevices();
        networkReady = true;
      }
      if (route.subtab) window.switchNDTab?.(route.subtab);
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', event => {
      if (window.playSound) window.playSound('click');
      const route = normalizePath(tab.dataset.route || '/');
      if (tab.matches('a')) event.preventDefault();
      if (window.location.href !== new URL(routeUrl(route), window.location.origin).href) {
        history.pushState({}, '', routeUrl(route));
      }
      renderRoute(route);
    });
  });
  window.addEventListener('popstate', () => renderRoute(routeFromLocation()));
  document.querySelectorAll('[data-route-link]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const route = normalizePath(link.getAttribute('href') || '/');
      history.pushState({}, '', routeUrl(route));
      renderRoute(route);
    });
  });
  window.navigateToView = target => {
    const route = Object.entries(routes).find(([, value]) => value.panel === target)?.[0] || '/';
    history.pushState({}, '', routeUrl(route));
    renderRoute(route);
  };
  window.navigateToRoute = route => {
    const nextRoute = normalizePath(route);
    if (window.location.href !== new URL(routeUrl(nextRoute), window.location.origin).href) {
      history.pushState({}, '', routeUrl(nextRoute));
    }
    renderRoute(nextRoute);
  };
  renderRoute(routeFromLocation(), { replace: true });
}

function cleanupCurrentView() {
  if (window.cleanupCommon) window.cleanupCommon();
  if (window.cleanupSandbox) window.cleanupSandbox();
  if (window.cleanupNetworkDevices) window.cleanupNetworkDevices();
}
