// Universal Modal Controller for LogicQuest
// Ensures every modal, popup, and overlay can be closed via:
// 1. Close [data-close-modal] buttons or [id*="close"]
// 2. Backdrop / overlay clicks
// 3. Escape key globally

const registeredModals = new Set([
  'logic-modal',
  'save-modal',
  'load-modal',
  'custom-alert-modal',
  'osi-crypto-modal',
  'osi-compare-modal'
]);

export function registerModal(id) {
  registeredModals.add(id);
}

export function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  
  if (el.classList.contains('osi-crypto-modal')) {
    el.classList.add('open');
  } else {
    el.style.display = 'flex';
  }
  
  const focusable = el.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable) {
    setTimeout(() => focusable.focus(), 60);
  }
}

export function closeModal(idOrEl) {
  const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
  if (!el) return false;

  let closed = false;
  if (el.classList.contains('open')) {
    el.classList.remove('open');
    closed = true;
  }
  if (el.style.display && el.style.display !== 'none') {
    el.style.display = 'none';
    closed = true;
  }
  return closed;
}

export function closeActiveModal() {
  // Check any modal overlay currently visible
  const overlays = document.querySelectorAll(
    '.success-modal-overlay, .osi-crypto-modal.open, .osi-modal-overlay, [data-is-modal="true"]'
  );
  
  for (const modal of overlays) {
    const isVisible = (modal.classList.contains('open')) ||
                      (modal.style.display === 'flex' || modal.style.display === 'block') ||
                      (window.getComputedStyle(modal).display !== 'none' && modal.classList.contains('active'));
    if (isVisible) {
      closeModal(modal);
      return true;
    }
  }

  // Check registered IDs
  for (const id of registeredModals) {
    const el = document.getElementById(id);
    if (el && (el.style.display === 'flex' || el.style.display === 'block' || el.classList.contains('open'))) {
      closeModal(el);
      return true;
    }
  }
  return false;
}

export function initUniversalModalManager() {
  if (window.__modalManagerInit) return;
  window.__modalManagerInit = true;

  // 1. Global Escape Key Listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (closeActiveModal()) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  });

  // 2. Global Delegated Click for Modal Closes & Backdrops
  document.addEventListener('click', (e) => {
    // Close button clicked
    const closeBtn = e.target.closest('[data-close-modal], .modal-close-btn, .waveform-close-btn, .osi-insp-close');
    if (closeBtn) {
      const targetId = closeBtn.dataset.closeModal;
      if (targetId) {
        closeModal(targetId);
      } else {
        const parentModal = closeBtn.closest('.success-modal-overlay, .osi-crypto-modal, .sandbox-waveform-panel, .osi-inspector');
        if (parentModal) closeModal(parentModal);
      }
      return;
    }

    // Backdrop clicked directly (overlay itself, not modal dialog box)
    if (
      e.target.classList.contains('success-modal-overlay') ||
      e.target.classList.contains('osi-crypto-modal') ||
      e.target.classList.contains('osi-modal-overlay')
    ) {
      closeModal(e.target);
    }
  });
}

// Expose globally
window.openModal = openModal;
window.closeModal = closeModal;
window.closeActiveModal = closeActiveModal;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUniversalModalManager);
} else {
  initUniversalModalManager();
}
