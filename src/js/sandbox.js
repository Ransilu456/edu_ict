import { generateExplanations, renderExplanationPanel, toggleExplanationPanel } from './sandbox-explain.js';
import { showComponentTooltip, hideComponentTooltip, COMPONENT_EDU_DATA } from './component-info.js';
import { openTruthTableDesigner } from './truth-table-designer.js';
import { parseBooleanExpression } from './bool-parser.js';

let sandboxNodes = [];
let sandboxWires = [];
let activeWiringSource = null;   
let pendingWirePortIdx = 0;      
let selectedNodeId = null;
let selectedNodeIds = [];
let customICs = {};
let simInterval = null;
let clockInterval = null;
let isSimRunning = true;
let nextNodeId = 1;
let clockTick = 0;          

let workspace = null;
let wiresSvg = null;
let panContainer = null;
let isDragging = false;          
let panX = 0, panY = 0;
let isPanning = false;
let didPan = false;
let panStart = { x: 0, y: 0 };
let panStartOffset = { x: 0, y: 0 };
let isSelecting = false;
let selectionRectStart = { x: 0, y: 0 };
let selectionRectEl = null;
const MAX_UNDO = 30;
let undoStack = [];  
let _ignorePortClick = false; 
let simSpeed = 1;

function pushUndo() {
  const snapshot = JSON.stringify(serializeLayout());
  undoStack.push(snapshot);
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  const undoBtn = document.getElementById('sandbox-undo');
  if (undoBtn) undoBtn.disabled = undoStack.length === 0;
}

function performUndo() {
  if (undoStack.length === 0) {
    showToast('Nothing to undo.');
    return;
  }
  const snapshot = JSON.parse(undoStack.pop());
  importLayout(snapshot);
  playSound('click');
  showToast('Undone Γå⌐');
  const undoBtn = document.getElementById('sandbox-undo');
  if (undoBtn) undoBtn.disabled = undoStack.length === 0;
}
const COMPONENT_DEFS = {
  'input':       { inputs: 0, outputs: 1, label: 'Toggle Switch',    category: 'Inputs' },
  'clock':       { inputs: 0, outputs: 1, label: 'Clock Signal',     category: 'Inputs' },
  'buffer':      { inputs: 1, outputs: 1, label: 'Buffer Gate',      category: 'Logic Gates' },
  'not':         { inputs: 1, outputs: 1, label: 'NOT Gate',         category: 'Logic Gates' },
  'and':         { inputs: 2, outputs: 1, label: 'AND Gate',         category: 'Logic Gates' },
  'or':          { inputs: 2, outputs: 1, label: 'OR Gate',          category: 'Logic Gates' },
  'nand':        { inputs: 2, outputs: 1, label: 'NAND Gate',        category: 'Logic Gates' },
  'nor':         { inputs: 2, outputs: 1, label: 'NOR Gate',         category: 'Logic Gates' },
  'xor':         { inputs: 2, outputs: 1, label: 'XOR Gate',         category: 'Logic Gates' },
  'xnor':        { inputs: 2, outputs: 1, label: 'XNOR Gate',        category: 'Logic Gates' },
  'output':      { inputs: 1, outputs: 0, label: 'LED Light',        category: 'Outputs' },
  'rgb-led':     { inputs: 3, outputs: 0, label: 'RGB LED',          category: 'Outputs' },
  'buzzer':      { inputs: 1, outputs: 0, label: 'Buzzer',           category: 'Outputs' },
  'led-bar':     { inputs: 4, outputs: 0, label: 'LED Bar (4-bit)',  category: 'Outputs' },
  'd-flop':      { inputs: 2, outputs: 1, label: 'D Flip-Flop',     category: 'Sequential' },
  'sr-latch':    { inputs: 2, outputs: 2, label: 'SR Latch',        category: 'Sequential' },
  'jk-flop':     { inputs: 3, outputs: 2, label: 'JK Flip-Flop',   category: 'Sequential' },
  't-flop':      { inputs: 2, outputs: 1, label: 'T Flip-Flop',    category: 'Sequential' },
  'half-adder':  { inputs: 2, outputs: 2, label: 'Half Adder',      category: 'Arithmetic' },
  'full-adder':  { inputs: 3, outputs: 2, label: 'Full Adder',      category: 'Arithmetic' },
  'mux-2-1':     { inputs: 3, outputs: 1, label: '2:1 Multiplexer', category: 'Combinational' },
  'demux-1-2':   { inputs: 2, outputs: 2, label: '1:2 DeMultiplexer', category: 'Combinational' },
  'decoder-2-4': { inputs: 2, outputs: 4, label: '2:4 Decoder',    category: 'Combinational' },
  'encoder-4-2': { inputs: 4, outputs: 2, label: '4:2 Priority Encoder', category: 'Combinational' },
  'comparator':  { inputs: 4, outputs: 3, label: '2-bit Comparator', category: 'Combinational' },
  'seven-seg':   { inputs: 4, outputs: 0, label: '7-Seg Display',   category: 'Outputs' },
  'text-label':  { inputs: 0, outputs: 0, label: 'Text Label',      category: 'Utility' },
};
window.initSandboxCanvas = function () {
  workspace = document.getElementById('sandbox-workspace-canvas');
  wiresSvg = document.getElementById('sandbox-wires-svg');
  selectionRectEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  selectionRectEl.setAttribute('fill', 'rgba(0,120,255,0.12)');
  selectionRectEl.setAttribute('stroke', 'rgba(0,120,255,0.6)');
  selectionRectEl.setAttribute('stroke-width', '1');
  selectionRectEl.setAttribute('stroke-dasharray', '4,3');
  selectionRectEl.style.display = 'none';
  selectionRectEl.style.pointerEvents = 'none';
  wiresSvg.appendChild(selectionRectEl);

  if (!workspace || workspace.dataset.initialized) return;
  workspace.dataset.initialized = 'true';

  panContainer = document.createElement('div');
  panContainer.className = 'sandbox-pan-container';
  panContainer.style.cssText = 'position:absolute;inset:0;transform-origin:0 0;z-index:1';
  panContainer.dataset.panContainer = 'true';
  workspace.insertBefore(panContainer, wiresSvg);
  panContainer.appendChild(wiresSvg);

  setupDragAndDrop();
  setupToolbar();
  startSimulationLoop();
  workspace.addEventListener('click', (e) => {
    if (didPan) { didPan = false; return; }
    if (e.ctrlKey || e.metaKey) return;
    if (e.target === workspace || e.target === wiresSvg || e.target === panContainer) {
      deselectAllNodes();
      cancelWiring();
    }
  });
  workspace.addEventListener('touchend', (e) => {
    if (didPan) { didPan = false; return; }
    if (e.target === workspace || e.target === wiresSvg || e.target === panContainer) {
      deselectAllNodes();
      cancelWiring();
    }
  });
  workspace.addEventListener('mousemove', drawWiringPreview);
  workspace.addEventListener('touchmove', drawWiringPreview, { passive: true });
  setupPanning();
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      performUndo();
      return;
    }
    if (!selectedNodeId) return;
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deleteNode(selectedNodeId);
    }
    if (e.key === 'Escape') {
      cancelWiring();
      deselectAllNodes();
    }
  });
  const theoryBtn = document.getElementById('sandbox-theory-btn');
  const learningCard = document.getElementById('sandbox-learning-card');
  const closeLearningCard = document.getElementById('close-learning-card');
  const collapseLearningCard = document.getElementById('collapse-learning-card');
  const learningCardHeader = document.getElementById('learning-card-header');

  if (theoryBtn && learningCard) {
    theoryBtn.addEventListener('click', () => {
      playSound('click');
      if (learningCard.style.display === 'none') {
        learningCard.style.display = 'flex';
        learningCard.classList.remove('collapsed');
      } else {
        learningCard.style.display = 'none';
      }
    });
  }

  if (closeLearningCard && learningCard) {
    closeLearningCard.addEventListener('click', (e) => {
      e.stopPropagation();
      playSound('click');
      learningCard.style.display = 'none';
    });
  }

  const toggleCollapse = () => {
    playSound('click');
    learningCard.classList.toggle('collapsed');
  };

  if (collapseLearningCard && learningCard) {
    collapseLearningCard.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCollapse();
    });
  }

  if (learningCardHeader && learningCard) {
    learningCardHeader.addEventListener('click', () => {
      toggleCollapse();
    });
  }
  loadCustomICs();
  if (window.initICCreator) window.initICCreator();
};
function setupToolboxItem(item) {
  const type = item.dataset.type;
  const label = item.querySelector('span')?.innerText || type;
  item.setAttribute('draggable', 'true');
  item.addEventListener('dragstart', (e) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('label', label);
  });
  item.addEventListener('click', () => {
    if (!workspace) return;
    const r = workspace.getBoundingClientRect();
    placeNode(type, label, r.width / 2 - 60, r.height / 2 - 40);
    showToast(`${label} placed Γ£ô`);
  });
  let touchDragGhost = null;
  let touchDragActive = false;

  item.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchDragActive = false;
    const touch = e.touches[0];
    touchDragGhost = document.createElement('div');
    touchDragGhost.className = 'touch-drag-ghost';
    touchDragGhost.textContent = label;
    touchDragGhost.style.cssText = `
      position: fixed;
      z-index: 9999;
      background: var(--color-indigo);
      color: #fff;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-family: var(--font-header);
      font-weight: 700;
      pointer-events: none;
      opacity: 0.92;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      left: ${touch.clientX - 40}px;
      top: ${touch.clientY - 20}px;
      white-space: nowrap;
      transform: scale(1.1);
      transition: transform 0.1s;
    `;
    document.body.appendChild(touchDragGhost);
  }, { passive: true });

  item.addEventListener('touchmove', (e) => {
    if (!touchDragGhost) return;
    e.preventDefault();
    touchDragActive = true;
    const touch = e.touches[0];
    touchDragGhost.style.left = `${touch.clientX - 40}px`;
    touchDragGhost.style.top = `${touch.clientY - 20}px`;

    const wr = workspace.getBoundingClientRect();
    const over = touch.clientX >= wr.left && touch.clientX <= wr.right &&
      touch.clientY >= wr.top && touch.clientY <= wr.bottom;
    workspace.classList.toggle('drag-over', over);
  }, { passive: false });

  item.addEventListener('touchend', (e) => {
    if (touchDragGhost) {
      touchDragGhost.remove();
      touchDragGhost = null;
    }
    workspace.classList.remove('drag-over');
    if (!touchDragActive) return; 
    touchDragActive = false;

    const touch = e.changedTouches[0];
    const wr = workspace.getBoundingClientRect();
    const inWorkspace = touch.clientX >= wr.left && touch.clientX <= wr.right &&
      touch.clientY >= wr.top && touch.clientY <= wr.bottom;
    if (inWorkspace) {
      const dropX = touch.clientX - wr.left - panX - 60;
      const dropY = touch.clientY - wr.top - panY - 30;
      placeNode(type, label, dropX, dropY);
      showToast(`${label} placed Γ£ô`);
    }
  });
}

function setupDragAndDrop() {
  document.querySelectorAll('.toolbox-item').forEach(item => setupToolboxItem(item));
  document.querySelectorAll('.template-card').forEach(card => {
    card.setAttribute('draggable', 'true');
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('type', 'template');
      e.dataTransfer.setData('templateName', card.getAttribute('data-template-name'));
    });
  });

  workspace.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    workspace.classList.add('drag-over');
  });

  workspace.addEventListener('dragleave', () => {
    workspace.classList.remove('drag-over');
  });

  workspace.addEventListener('drop', (e) => {
    e.preventDefault();
    workspace.classList.remove('drag-over');
    const type = e.dataTransfer.getData('type');
    const r = workspace.getBoundingClientRect();
    const dropX = e.clientX - r.left - panX;
    const dropY = e.clientY - r.top - panY;

    if (type === 'template') {
      const templateName = e.dataTransfer.getData('templateName');
      appendSandboxTemplate(templateName, dropX, dropY);
    } else if (type) {
      const label = e.dataTransfer.getData('label');
      placeNode(type, label, dropX - 60, dropY - 30);
    }
  });
}
function setupToolbar() {
  const playBtn = document.getElementById('sandbox-play');
  playBtn?.addEventListener('click', () => {
    isSimRunning = !isSimRunning;
    playSound('click');
    if (isSimRunning) {
      playBtn.classList.add('running');
      playBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> <span>Pause</span>`;
      startSimulationLoop();
    } else {
      playBtn.classList.remove('running');
      playBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> <span>Run</span>`;
      stopSimulationLoop();
    }
  });

  const undoBtn = document.getElementById('sandbox-undo');
  if (undoBtn) {
    undoBtn.disabled = true;
    undoBtn.addEventListener('click', () => performUndo());
  }
  document.getElementById('sandbox-clear')?.addEventListener('click', () => {
    playSound('click');
    showConfirm('Clear the entire sandbox workspace?', (r) => { if (r) clearSandbox(); });
  });
  const saveModal = document.getElementById('save-modal');
  const saveNameInput = document.getElementById('save-circuit-name');

  document.getElementById('sandbox-save')?.addEventListener('click', () => {
    playSound('click');
    saveNameInput.value = '';
    saveModal.style.display = 'flex';
    setTimeout(() => saveNameInput.focus(), 50);
  });
  document.getElementById('cancel-save-btn')?.addEventListener('click', () => {
    saveModal.style.display = 'none';
  });
  document.getElementById('confirm-save-btn')?.addEventListener('click', () => {
    const name = saveNameInput.value.trim();
    if (!name) { showAlert('Please enter a name for this circuit.'); return; }
    saveCircuitToLocal(name);
    saveModal.style.display = 'none';
    playSound('success');
    showToast(`Saved "${name}" Γ£ô`);
  });
  saveNameInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('confirm-save-btn')?.click();
    if (e.key === 'Escape') saveModal.style.display = 'none';
  });
  const loadModal = document.getElementById('load-modal');
  document.getElementById('sandbox-load')?.addEventListener('click', () => {
    playSound('click');
    renderSavedCircuitsList();
    loadModal.style.display = 'flex';
  });
  document.getElementById('cancel-load-btn')?.addEventListener('click', () => {
    loadModal.style.display = 'none';
  });
  document.getElementById('sandbox-export')?.addEventListener('click', () => {
    if (sandboxNodes.length === 0) { showToast('Canvas is empty ΓÇö nothing to export.'); return; }
    exportCircuitJSON();
    playSound('success');
  });
  const importFileInput = document.getElementById('sandbox-import-file');
  document.getElementById('sandbox-import-btn')?.addEventListener('click', () => {
    importFileInput?.click();
  });
  importFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const layout = JSON.parse(ev.target.result);
        importLayout(layout);
        playSound('success');
        showToast('Circuit imported Γ£ô');
      } catch {
        showAlert('Invalid circuit file.', 'Error');
      }
    };
    reader.readAsText(file);
    importFileInput.value = '';
  });
  const gateStyleBtn = document.getElementById('sandbox-gate-style-btn');
  if (gateStyleBtn) {
    const savedStyle = localStorage.getItem('sandboxGateStyle') || 'box';
    window.__gateStyle = savedStyle;
    updateGateStyleBtn(gateStyleBtn, savedStyle);
    gateStyleBtn.addEventListener('click', () => {
      playSound('click');
      const current = window.__gateStyle || 'box';
      const next = current === 'box' ? 'realistic' : 'box';
      window.__gateStyle = next;
      localStorage.setItem('sandboxGateStyle', next);
      updateGateStyleBtn(gateStyleBtn, next);
      reRenderAllNodes();
    });
  }
  const createICBtn = document.getElementById('sandbox-create-ic');
  if (createICBtn) {
    createICBtn.disabled = true;
    createICBtn.title = 'Select 2+ components (Shift+click) to create an IC';
    createICBtn.addEventListener('click', () => {
      if (selectedNodeIds.length < 2) { showToast('Select 2+ components first (Ctrl+drag or Shift+click).'); return; }
      playSound('click');
      document.getElementById('ic-name-input').value = '';
      document.getElementById('ic-create-modal').style.display = 'flex';
      setTimeout(() => document.getElementById('ic-name-input')?.focus(), 50);
    });
  }
  document.getElementById('confirm-ic-btn')?.addEventListener('click', () => {
    const name = document.getElementById('ic-name-input').value.trim();
    if (!name) { showAlert('Please enter a name for the IC.'); return; }
    document.getElementById('ic-create-modal').style.display = 'none';
    if (window.openICCreatorWizard) {
      window.openICCreatorWizard(name);
    } else {
      createICFromSelection(name);
    }
  });
  document.getElementById('cancel-ic-btn')?.addEventListener('click', () => {
    document.getElementById('ic-create-modal').style.display = 'none';
  });
  document.getElementById('ic-name-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('confirm-ic-btn')?.click();
    if (e.key === 'Escape') document.getElementById('ic-create-modal').style.display = 'none';
  });

  document.getElementById('sandbox-truth-btn')?.addEventListener('click', () => {
    playSound('click');
    showTruthTable();
  });

  const speedBtn = document.getElementById('sandbox-speed-btn');
  if (speedBtn) {
    const speeds = [1, 2, 4, 0.5];
    let speedIdx = 0;
    speedBtn.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % speeds.length;
      simSpeed = speeds[speedIdx];
      const lbl = speedBtn.querySelector('span');
      if (lbl) lbl.textContent = simSpeed + 'x';
      playSound('click');
      if (isSimRunning) startSimulationLoop();
    });
  }

  document.getElementById('sandbox-bool-btn')?.addEventListener('click', () => {
    playSound('click');
    const expr = window.prompt('Enter a boolean expression (e.g. A+B, A·B, A⊕B, (A+B)·C):');
    if (!expr) return;
    try {
      const layout = parseBooleanExpression(expr);
      layout.nodes.forEach(n => {
        n.x += 120;
        n.y += 40;
      });
      layout.nodes.forEach(n => {
        const def = COMPONENT_DEFS[n.type];
        if (def) {
          n.inputsCount = n.inputsCount ?? def.inputs;
          n.outputsCount = n.outputsCount ?? def.outputs;
          n.outputState = 0;
          n.outputState2 = 0;
          n.inputValues = Array(n.inputsCount).fill(0);
          n.data = n.data || (def.data ? { ...def.data } : {});
        }
      });
      layout.nodes.forEach(n => { sandboxNodes.push(n); renderNodeDOM(n); });
      layout.wires.forEach(w => sandboxWires.push(w));
      evaluateSandbox();
      showToast('Boolean expression circuit generated ✓');
    } catch (error) {
      showAlert(error.message || 'Could not parse that expression.', 'Boolean Parser');
    }
  });

  [saveModal, loadModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  });
}

function updateGateStyleBtn(btn, style) {
  if (style === 'realistic') {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 17V7l7 5-7 5"/><circle cx="12" cy="12" r="1.5"/><path d="M13 7h7v10h-7"/></svg> <span>Gate: ANSI</span>`;
  } else {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7l5 5-5 5"/></svg> <span>Gate: Box</span>`;
  }
}

function reRenderAllNodes() {
  const ids = sandboxNodes.map(n => n.id);
  ids.forEach(id => {
    const existing = document.getElementById(id);
    if (existing) existing.remove();
  });
  sandboxNodes.forEach(n => renderNodeDOM(n));
  evaluateSandbox();
}
function placeNode(type, label, x, y) {
  const def = COMPONENT_DEFS[type];
  if (!def) { console.warn('Unknown component type:', type); return; }

  const id = `sb-node-${nextNodeId++}`;

  const node = {
    id,
    type,
    label: label || def.label,
    x: Math.round(x / 10) * 10,
    y: Math.round(y / 10) * 10,
    inputsCount: def.inputs,
    outputsCount: def.outputs,
    outputState: 0,           
    outputState2: 0,           
    inputValues: Array(def.inputs).fill(0),
    prevClockState: 0,
    labelText: type === 'text-label' ? 'Label' : '',
    data: def.data ? { ...def.data } : {},
  };

  sandboxNodes.push(node);
  renderNodeDOM(node);
  updateSandboxWires();
  evaluateSandbox();
  playSound('click');
  return node;
}
function renderNodeDOM(node) {
  const existing = document.getElementById(node.id);
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = node.id;
  el.className = 'sandbox-node';
  el.style.left = `${node.x}px`;
  el.style.top = `${node.y}px`;
  if (['half-adder', 'full-adder', 'd-flop', 'op-amp'].includes(node.type)) {
    el.classList.add('compound-node');
  }
  if (node.type === 'seven-seg') el.classList.add('seven-seg-node');
  if (node.type === 'rgb-led') el.classList.add('rgb-led-node');
  if (node.type === 'led-bar') el.classList.add('led-bar-node');
  if (node.type === 'text-label') el.classList.add('node-text-label');
  if (node.type && node.type.startsWith('custom-ic-')) {
    el.classList.add('custom-ic-node');
    const icName = node.data.icName || node.type.slice(9);
    const def = window.customICs ? window.customICs[icName] : null;
    if (def) {
      const P = def.pinCount || 8;
      const height = (P / 2) * 22 + 30;
      el.style.width = '140px';
      el.style.height = `${height}px`;
    }
  }
    const delBtn = document.createElement('button');
  delBtn.className = 'node-delete-btn';
  delBtn.innerHTML = '&times;';
  delBtn.title = 'Delete (Del)';
  delBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteNode(node.id); });
  el.appendChild(delBtn);
  const header = document.createElement('div');
  header.className = 'sandbox-node-header';
  header.innerText = node.label;
  header.addEventListener('mouseenter', (e) => {
    if (node.type && COMPONENT_EDU_DATA) {
      showComponentTooltip(node, header);
    }
  });
  header.addEventListener('mouseleave', () => hideComponentTooltip());
  // In realistic (ANSI) gate mode, hide header text for pure logic gate types
  const pureGateTypes = ['not','and','or','nand','nor','xor','xnor'];
  const gateStyle = window.__gateStyle || localStorage.getItem('sandboxGateStyle') || 'box';
  if (gateStyle === 'realistic' && pureGateTypes.includes(node.type)) {
    header.style.display = 'none';
  }
  el.appendChild(header);
  const body = document.createElement('div');
  body.className = 'sandbox-node-body';
  renderNodeBody(node, body);
  el.appendChild(body);
  if (node.type && node.type.startsWith('custom-ic-')) {
    if (window.renderCustomICPorts) {
      window.renderCustomICPorts(node, el);
    }
  } else {
    renderInputPorts(node, el);
    renderOutputPorts(node, el);
  }
  const onStartDrag = (e) => {
    if (e.target.closest('.sandbox-port') || e.target.closest('button') || e.target.closest('textarea') || e.target.closest('input')) {
      return;
    }
    startDrag(e, node);
  };
  el.addEventListener('mousedown', onStartDrag);
  el.addEventListener('touchstart', onStartDrag, { passive: false });
  el.addEventListener('click', (e) => {
    if (isDragging) return;
    const toggleBtn = e.target.closest('[data-toggle]');
    if (toggleBtn) {
      e.stopPropagation();
      const toggleType = toggleBtn.dataset.toggle;
      const nid = toggleBtn.dataset.nodeId;
      if (toggleType === 'switch' && window.toggleElectricSwitch) {
        window.toggleElectricSwitch(nid);
      } else if (toggleType === 'transistor' && window.toggleElectricTransistor) {
        window.toggleElectricTransistor(nid);
      }
      return;
    }
    e.stopPropagation();
    selectNode(node.id, e.shiftKey || e.ctrlKey || e.metaKey);
  });
  el.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    if (node.type && node.type.startsWith('custom-ic-') && window.openICPinManager) {
      window.openICPinManager(node.id);
    }
  });

  // Right-click context menu for multi-input gate types
  el.addEventListener('contextmenu', (e) => {
    e.stopPropagation();
    showSandboxContextMenu(e, node);
  });

  (panContainer || workspace).appendChild(el);
}

function renderNodeBody(node, body) {
  if (node.type && node.type.startsWith('custom-ic-')) {
    if (window.getCustomICNodeInner) {
      body.innerHTML = window.getCustomICNodeInner(node);
    } else {
      const icName = node.data.icName || node.type.slice(9);
      body.innerHTML = `<div class="gate-type-label">${icName}</div>`;
    }
    return;
  }
  switch (node.type) {
    case 'input': {
      const btn = document.createElement('button');
      btn.className = node.outputState === 1 ? 'sandbox-toggle-btn high' : 'sandbox-toggle-btn';
      btn.innerText = node.outputState;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        playSound('toggle');
        node.outputState = node.outputState === 1 ? 0 : 1;
        btn.innerText = node.outputState;
        btn.className = node.outputState === 1 ? 'sandbox-toggle-btn high' : 'sandbox-toggle-btn';
        evaluateSandbox();
      });
      body.appendChild(btn);
      break;
    }

    case 'output': {
      body.innerHTML = `
        <div class="bulb-wrap" id="${node.id}-bulb">
          <svg class="bulb-svg" viewBox="0 0 100 120">
            
            <circle cx="50" cy="45" r="42" class="bulb-halo"/>
            
            <path d="M 32 75 C 20 62 20 40 32 26 C 44 12 56 12 68 26 C 80 40 80 62 68 75 C 62 82 58 90 58 95 L 42 95 C 42 90 38 82 32 75 Z" class="bulb-glass"/>
            
            <line x1="42" y1="95" x2="45" y2="70" class="bulb-wire"/>
            <line x1="58" y1="95" x2="55" y2="70" class="bulb-wire"/>
            
            <path d="M 45 70 C 45 60 48 56 50 56 C 52 56 55 60 55 70" class="bulb-filament"/>
            
            <rect x="40" y="95" width="20" height="12" rx="2" class="bulb-base"/>
            
            <path d="M 44 107 L 56 107 C 54 113 46 113 44 107 Z" class="bulb-base-tip"/>
            
            <path d="M 38 32 A 20 20 0 0 1 54 20" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.8" stroke-linecap="round" class="bulb-shine"/>
          </svg>
          <span class="bulb-state-label" id="${node.id}-state">Γùï OFF</span>
        </div>`;
      break;
    }

    case 'rgb-led': {
      body.innerHTML = `
        <div class="rgb-led-wrap" id="${node.id}-rgb">
          <div class="rgb-led-body" id="${node.id}-rgb-body">
            <svg viewBox="0 0 60 80" class="rgb-led-svg">
              <circle cx="30" cy="28" r="22" class="rgb-led-glass" id="${node.id}-rgb-glass"/>
              <ellipse cx="30" cy="28" rx="14" ry="14" class="rgb-led-inner" id="${node.id}-rgb-inner"/>
              <rect x="18" y="50" width="24" height="4" rx="1" fill="var(--bg-tertiary)" stroke="var(--border-color)" stroke-width="0.8"/>
              <line x1="24" y1="54" x2="22" y2="68" stroke="var(--text-muted)" stroke-width="1.5"/>
              <line x1="30" y1="54" x2="30" y2="68" stroke="var(--text-muted)" stroke-width="1.5"/>
              <line x1="36" y1="54" x2="38" y2="68" stroke="var(--text-muted)" stroke-width="1.5"/>
              <text x="22" y="76" fill="#ef4444" font-size="7" font-family="monospace" text-anchor="middle">R</text>
              <text x="30" y="76" fill="#22c55e" font-size="7" font-family="monospace" text-anchor="middle">G</text>
              <text x="38" y="76" fill="#3b82f6" font-size="7" font-family="monospace" text-anchor="middle">B</text>
            </svg>
          </div>
          <span class="rgb-led-label" id="${node.id}-rgb-label">OFF</span>
        </div>`;
      break;
    }

    case 'buzzer': {
      body.innerHTML = `
        <div class="buzzer-wrap" id="${node.id}-buzzer">
          <svg class="buzzer-svg" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="22" class="buzzer-body" id="${node.id}-bz-body"/>
            <circle cx="30" cy="30" r="14" class="buzzer-ring1" id="${node.id}-bz-ring1"/>
            <circle cx="30" cy="30" r="7" class="buzzer-center" id="${node.id}-bz-center"/>
            <path d="M 10 20 Q 5 30 10 40" fill="none" stroke="var(--border-color)" stroke-width="2" class="buzzer-wave" id="${node.id}-bz-wave1"/>
            <path d="M 50 20 Q 55 30 50 40" fill="none" stroke="var(--border-color)" stroke-width="2" class="buzzer-wave" id="${node.id}-bz-wave2"/>
          </svg>
          <span class="buzzer-label" id="${node.id}-bz-label">SILENT</span>
        </div>`;
      break;
    }

    case 'led-bar': {
      body.innerHTML = `
        <div class="led-bar-wrap" id="${node.id}-lbar">
          <div class="led-bar-leds">
            <div class="led-bar-led" id="${node.id}-led3"></div>
            <div class="led-bar-led" id="${node.id}-led2"></div>
            <div class="led-bar-led" id="${node.id}-led1"></div>
            <div class="led-bar-led" id="${node.id}-led0"></div>
          </div>
          <div class="led-bar-pins">
            <span>D3</span><span>D2</span><span>D1</span><span>D0</span>
          </div>
          <div class="led-bar-value" id="${node.id}-lbar-val">0000 = 0</div>
        </div>`;
      break;
    }

    case 'clock': {
      body.innerHTML = `
        <div class="clk-wrap" id="${node.id}-clk-wrap">
          <svg class="clk-osc-svg" viewBox="0 0 100 40">
            
            <rect x="0" y="0" width="100" height="40" class="osc-bg"/>
            
            <line x1="0" y1="10" x2="100" y2="10" class="osc-grid"/>
            <line x1="0" y1="20" x2="100" y2="20" class="osc-grid"/>
            <line x1="0" y1="30" x2="100" y2="30" class="osc-grid"/>
            <line x1="25" y1="0" x2="25" y2="40" class="osc-grid"/>
            <line x1="50" y1="0" x2="50" y2="40" class="osc-grid"/>
            <line x1="75" y1="0" x2="75" y2="40" class="osc-grid"/>
            
            <path d="M 0 30 L 25 30 L 25 10 L 50 10 L 50 30 L 75 30 L 75 10 L 100 10" class="osc-wave"/>
            
            <line x1="25" y1="0" x2="25" y2="40" class="osc-cursor" id="${node.id}-cursor"/>
          </svg>
          <div class="clk-meta">
            <span class="clk-badge" id="${node.id}-phase">Γû╝ LOW</span>
            <span class="clk-hz">1 Hz</span>
          </div>
        </div>`;
      break;
    }

    case 'sensor': {
      const val = node.data.value !== undefined ? node.data.value : 50;
      const thr = node.data.threshold !== undefined ? node.data.threshold : 50;
      const isHigh = val > thr;
      body.innerHTML = `
        <div class="sensor-wrap" style="display:flex;flex-direction:column;gap:4px;width:100%;padding:0 4px">
          <div style="display:flex;align-items:center;gap:4px">
            <span style="font-size:9px;font-weight:600;color:#22d3a5">${val}</span>
            <input type="range" min="0" max="100" value="${val}" style="flex:1;height:3px;accent-color:#22d3a5"
              oninput="window.updateSensorValue && window.updateSensorValue('${node.id}',+this.value)">
          </div>
          <div style="display:flex;align-items:center;gap:4px">
            <span style="font-size:7px;color:var(--text-muted)">THR</span>
            <input type="range" min="0" max="100" value="${thr}" style="flex:1;height:3px;accent-color:#f87171"
              oninput="window.updateSensorThreshold && window.updateSensorThreshold('${node.id}',+this.value)">
          </div>
          <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${val}%;background:${isHigh ? '#22d3a5' : '#f87171'};transition:width 0.2s"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--text-muted)">
            <span>0</span>
            <span style="font-weight:600;color:${isHigh ? '#22d3a5' : '#f87171'}">${isHigh ? 'HIGH' : 'LOW'}</span>
            <span>100</span>
          </div>
        </div>`;
      break;
    }

    case 'buffer': {
      body.innerHTML = '<svg viewBox="0 0 60 40" width="60" height="40" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="4,4 42,20 4,36"/><line x1="42" y1="20" x2="56" y2="20"/></svg>';
      break;
    }
    case 'sr-latch': {
      body.innerHTML = '<div style="text-align:center;padding:4px 2px"><div style="font-size:0.7rem;font-weight:800;color:var(--color-indigo)">SR LATCH</div><div style="font-size:0.6rem;color:var(--text-muted);margin-top:2px">S,R → Q,Q̄</div></div>';
      break;
    }
    case 'jk-flop': {
      body.innerHTML = '<div style="text-align:center;padding:4px 2px"><div style="font-size:0.7rem;font-weight:800;color:var(--color-indigo)">JK FF</div><div style="font-size:0.6rem;color:var(--text-muted);margin-top:2px">J,K,CLK → Q,Q̄</div></div>';
      break;
    }
    case 't-flop': {
      body.innerHTML = '<div style="text-align:center;padding:4px 2px"><div style="font-size:0.7rem;font-weight:800;color:var(--color-indigo)">T FF</div><div style="font-size:0.6rem;color:var(--text-muted);margin-top:2px">T,CLK → Q (Toggle)</div></div>';
      break;
    }
    case 'mux-2-1': {
      body.innerHTML = '<div style="text-align:center;padding:4px 2px"><div style="font-size:0.7rem;font-weight:800;color:var(--color-cyan)">2:1 MUX</div><div style="font-size:0.6rem;color:var(--text-muted);margin-top:2px">D0,D1,S → Y</div></div>';
      break;
    }
    case 'demux-1-2': {
      body.innerHTML = '<div style="text-align:center;padding:4px 2px"><div style="font-size:0.7rem;font-weight:800;color:var(--color-cyan)">1:2 DEMUX</div><div style="font-size:0.6rem;color:var(--text-muted);margin-top:2px">In,S → Y0,Y1</div></div>';
      break;
    }
    case 'decoder-2-4': {
      body.innerHTML = '<div style="text-align:center;padding:4px 2px"><div style="font-size:0.7rem;font-weight:800;color:var(--color-amber)">2:4 DECODER</div><div style="font-size:0.6rem;color:var(--text-muted);margin-top:2px">A,B → Y0-Y3</div></div>';
      break;
    }
    case 'encoder-4-2': {
      body.innerHTML = '<div style="text-align:center;padding:4px 2px"><div style="font-size:0.7rem;font-weight:800;color:var(--color-amber)">4:2 ENCODER</div><div style="font-size:0.6rem;color:var(--text-muted);margin-top:2px">D0-D3 → A,B</div></div>';
      break;
    }
    case 'comparator': {
      body.innerHTML = '<div style="text-align:center;padding:4px 2px"><div style="font-size:0.7rem;font-weight:800;color:var(--color-success)">COMPARATOR</div><div style="font-size:0.6rem;color:var(--text-muted);margin-top:2px">A[1:0],B[1:0] → &gt;,=,&lt;</div></div>';
      break;
    }
    case 'd-flop': {
      body.innerHTML = `
        <div class="compound-body-grid" class="is-mono-label">
          <div class="cb-row"><span class="cb-pin">D</span><span class="cb-name">DFF</span><span class="cb-pin out-pin">Q</span></div>
          <div class="cb-row" style="margin-top:2px;"><span class="cb-pin">CLK</span><span></span><span></span></div>
        </div>`;

      const expandBtn = document.createElement('button');
      expandBtn.className = 'sandbox-toggle-btn expand-adder-btn';
      expandBtn.innerText = '≡ƒæü View Timing';
      expandBtn.style.cssText = 'margin-top:6px; font-size:0.62rem; padding:0.15rem 0.4rem; pointer-events:auto; font-family:var(--font-header);';
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openLogicViewer('d-flop');
      });
      body.appendChild(expandBtn);
      break;
    }

    case 'half-adder': {
      body.innerHTML = `
        <div class="compound-body-grid" class="is-mono-label">
          <div class="cb-row"><span class="cb-pin">A</span><span class="cb-name">┬╜ ADD</span><span class="cb-pin out-pin">S</span></div>
          <div class="cb-row"><span class="cb-pin">B</span><span></span><span class="cb-pin out-pin">C</span></div>
        </div>`;

      const expandBtn = document.createElement('button');
      expandBtn.className = 'sandbox-toggle-btn expand-adder-btn';
      expandBtn.innerText = '≡ƒæü View Inside';
      expandBtn.style.cssText = 'margin-top:6px; font-size:0.62rem; padding:0.15rem 0.4rem; pointer-events:auto; font-family:var(--font-header);';
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openLogicViewer('half-adder');
      });
      body.appendChild(expandBtn);
      break;
    }

    case 'full-adder': {
      body.innerHTML = `
        <div class="compound-body-grid" class="is-mono-label">
          <div class="cb-row"><span class="cb-pin">A</span><span class="cb-name">FULL ADD</span><span class="cb-pin out-pin">S</span></div>
          <div class="cb-row"><span class="cb-pin">B</span><span></span><span class="cb-pin out-pin">Cout</span></div>
          <div class="cb-row"><span class="cb-pin">Cin</span><span></span><span></span></div>
        </div>`;

      const expandBtn = document.createElement('button');
      expandBtn.className = 'sandbox-toggle-btn expand-adder-btn';
      expandBtn.innerText = '≡ƒæü View Inside';
      expandBtn.style.cssText = 'margin-top:6px; font-size:0.62rem; padding:0.15rem 0.4rem; pointer-events:auto; font-family:var(--font-header);';
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openLogicViewer('full-adder');
      });
      body.appendChild(expandBtn);
      break;
    }

    case 'buffer':
      node.outputState = a ? 1 : 0;
      break;

    case 'sr-latch': {
      const set = a ? 1 : 0, rst = b ? 1 : 0;
      if (set && !rst)       { node.outputState = 1; node.outputState2 = 0; }
      else if (!set && rst)  { node.outputState = 0; node.outputState2 = 1; }
      else if (set && rst)   { node.outputState = 0; node.outputState2 = 0; } // invalid
      // else hold state
      break;
    }

    case 'jk-flop': {
      const j = a ? 1 : 0, k = b ? 1 : 0, clk = c ? 1 : 0;
      if (clk && !node.prevClockState) {
        if (j && !k)      { node.outputState = 1; }
        else if (!j && k) { node.outputState = 0; }
        else if (j && k)  { node.outputState = node.outputState ? 0 : 1; }
        node.outputState2 = node.outputState ? 0 : 1;
      }
      node.prevClockState = clk;
      break;
    }

    case 't-flop': {
      const t = a ? 1 : 0, clk = b ? 1 : 0;
      if (clk && !node.prevClockState) {
        if (t) node.outputState = node.outputState ? 0 : 1;
      }
      node.prevClockState = clk;
      break;
    }

    case 'mux-2-1': {
      const sel = c ? 1 : 0;
      node.outputState = sel ? (b ? 1 : 0) : (a ? 1 : 0);
      break;
    }

    case 'demux-1-2': {
      const inp = a ? 1 : 0, sel = b ? 1 : 0;
      node.outputState  = (!sel && inp) ? 1 : 0;
      node.outputState2 = (sel && inp)  ? 1 : 0;
      break;
    }

    case 'decoder-2-4': {
      const inA = a ? 1 : 0, inB = b ? 1 : 0;
      const val = (inA << 1) | inB;
      node.outputState  = val === 0 ? 1 : 0;
      node.outputState2 = val === 1 ? 1 : 0;
      node.outputState3 = val === 2 ? 1 : 0;
      node.outputState4 = val === 3 ? 1 : 0;
      break;
    }

    case 'encoder-4-2': {
      const d0 = (node.inputValues[0]||0) ? 1 : 0;
      const d1 = (node.inputValues[1]||0) ? 1 : 0;
      const d2 = (node.inputValues[2]||0) ? 1 : 0;
      const d3 = (node.inputValues[3]||0) ? 1 : 0;
      let encOut = 0;
      if (d1) encOut = 1; if (d2) encOut = 2; if (d3) encOut = 3;
      node.outputState  = (encOut >> 1) & 1;
      node.outputState2 = encOut & 1;
      break;
    }

    case 'comparator': {
      const A = ((node.inputValues[0]||0) << 1) | (node.inputValues[1]||0);
      const B = ((node.inputValues[2]||0) << 1) | (node.inputValues[3]||0);
      node.outputState  = A > B ? 1 : 0;
      node.outputState2 = A === B ? 1 : 0;
      node.outputState3 = A < B ? 1 : 0;
      break;
    }

    case 'seven-seg': {
      const svgNs = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNs, 'svg');
      svg.setAttribute('class', 'seven-seg-svg');
      svg.setAttribute('viewBox', '0 0 50 80');
      svg.innerHTML = `
        <polygon id="${node.id}-seg-a" class="seven-seg-segment" points="10,8 40,8 36,13 14,13"/>
        <polygon id="${node.id}-seg-f" class="seven-seg-segment" points="8,10 13,14 13,38 8,42"/>
        <polygon id="${node.id}-seg-b" class="seven-seg-segment" points="37,14 42,10 42,42 37,38"/>
        <polygon id="${node.id}-seg-g" class="seven-seg-segment" points="11,40 39,40 35,44 15,44"/>
        <polygon id="${node.id}-seg-e" class="seven-seg-segment" points="8,44 13,46 13,70 8,74"/>
        <polygon id="${node.id}-seg-c" class="seven-seg-segment" points="37,46 42,44 42,74 37,70"/>
        <polygon id="${node.id}-seg-d" class="seven-seg-segment" points="10,72 14,77 36,77 40,72"/>`;
      body.appendChild(svg);

      const expandBtn = document.createElement('button');
      expandBtn.className = 'sandbox-toggle-btn expand-adder-btn';
      expandBtn.innerText = '≡ƒæü Segment Map';
      expandBtn.style.cssText = 'margin-top:6px; font-size:0.62rem; padding:0.15rem 0.4rem; pointer-events:auto; font-family:var(--font-header);';
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openLogicViewer('seven-seg');
      });
      body.appendChild(expandBtn);
      break;
    }

    case 'text-label': {
      const ta = document.createElement('textarea');
      ta.className = 'label-textarea';
      ta.value = node.labelText || 'Label';
      ta.rows = 1;
      ta.spellcheck = false;
      ta.addEventListener('mousedown', (e) => e.stopPropagation());
      ta.addEventListener('touchstart', (e) => e.stopPropagation());
      ta.addEventListener('input', () => {
        node.labelText = ta.value;
        ta.style.height = 'auto';
        ta.style.height = ta.scrollHeight + 'px';
      });
      setTimeout(() => {
        ta.style.height = 'auto';
        ta.style.height = ta.scrollHeight + 'px';
      }, 0);
      body.appendChild(ta);
      break;
    }

    default: {
      const gateStyle = window.__gateStyle || 'box';
      const isMultiInputGate = MULTI_INPUT_GATE_TYPES ? MULTI_INPUT_GATE_TYPES.has(node.type) : false;
      if (gateStyle === 'realistic') {
        body.innerHTML = renderGateSVG(node.type);
      } else {
        const span = document.createElement('span');
        span.className = 'gate-type-label';
        span.innerText = node.type.toUpperCase();
        body.appendChild(span);
      }
      // Show input count badge and +/- controls for multi-input gates
      if (isMultiInputGate && node.inputsCount > 2) {
        const badge = document.createElement('div');
        badge.style.cssText = 'font-size:8px;color:var(--color-cyan,#22d3a5);font-weight:700;margin-top:2px;text-align:center;letter-spacing:0.5px';
        badge.textContent = `${node.inputsCount}-input`;
        body.appendChild(badge);
      }
      if (isMultiInputGate) {
        const controls = document.createElement('div');
        controls.style.cssText = 'display:flex;gap:3px;margin-top:3px;justify-content:center';
        controls.innerHTML = `
          <button onclick="event.stopPropagation();window.addGateInput('${node.id}')"
            style="font-size:10px;padding:1px 5px;border-radius:3px;border:1px solid var(--border-color);
            background:var(--bg-tertiary);color:var(--text-primary);cursor:pointer;line-height:1.2"
            title="Add input port">+</button>
          <button onclick="event.stopPropagation();window.removeGateInput('${node.id}')"
            style="font-size:10px;padding:1px 5px;border-radius:3px;border:1px solid var(--border-color);
            background:var(--bg-tertiary);color:var(--text-primary);cursor:pointer;line-height:1.2"
            title="Remove input port">ΓêÆ</button>`;
        body.appendChild(controls);
      }
    }
  }
}

function renderGateSVG(type) {
  const color = 'currentColor';
  const strokeW = 1.8;
  switch (type) {
    case 'buffer':
      return `<svg viewBox="0 0 60 40" width="60" height="40" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="4,4 42,20 4,36"/>
        <line x1="42" y1="20" x2="56" y2="20"/>
      </svg>`;
    case 'not':
      return `<svg viewBox="0 0 60 40" width="60" height="40" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="4,4 38,20 4,36"/>
        <line x1="38" y1="20" x2="52" y2="20"/>
        <circle cx="44" cy="20" r="3"/>
      </svg>`;
    case 'and':
      return `<svg viewBox="0 0 60 40" width="60" height="40" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 6h12q12 0 12 14 0 14-12 14H4V6z"/>
        <line x1="4" y1="6" x2="4" y2="34"/>
      </svg>`;
    case 'or':
      return `<svg viewBox="0 0 60 40" width="60" height="40" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 4 6 Q 16 6 28 20 Q 16 34 4 34 Q 2 27 4 20 Q 2 13 4 6"/>
      </svg>`;
    case 'nand':
      return `<svg viewBox="0 0 68 40" width="68" height="40" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 6h12q12 0 12 14 0 14-12 14H4V6z"/>
        <line x1="4" y1="6" x2="4" y2="34"/>
        <circle cx="32" cy="20" r="3"/>
        <line x1="35" y1="20" x2="58" y2="20"/>
      </svg>`;
    case 'nor':
      return `<svg viewBox="0 0 68 40" width="68" height="40" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 4 6 Q 16 6 28 20 Q 16 34 4 34 Q 2 27 4 20 Q 2 13 4 6"/>
        <circle cx="31" cy="20" r="3"/>
        <line x1="34" y1="20" x2="58" y2="20"/>
      </svg>`;
    case 'xor':
      return `<svg viewBox="0 0 68 40" width="68" height="40" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 4 6 Q 16 6 28 20 Q 16 34 4 34 Q 2 27 4 20 Q 2 13 4 6"/>
        <path d="M -2 4 Q -4 12 -2 20 Q -4 28 -2 36"/>
      </svg>`;
    case 'xnor':
      return `<svg viewBox="0 0 72 40" width="72" height="40" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 4 6 Q 16 6 28 20 Q 16 34 4 34 Q 2 27 4 20 Q 2 13 4 6"/>
        <path d="M -2 4 Q -4 12 -2 20 Q -4 28 -2 36"/>
        <circle cx="31" cy="20" r="3"/>
        <line x1="34" y1="20" x2="62" y2="20"/>
      </svg>`;
    default:
      return `<span class="gate-type-label">${type.toUpperCase()}</span>`;
  }
}

function renderInputPorts(node, el) {
  const count = node.inputsCount;
  if (count === 0) return;

  for (let i = 0; i < count; i++) {
    const port = document.createElement('div');
    port.className = 'sandbox-port port-input';
    port.dataset.portIdx = i;
    const portLabels = getInputPortLabels(node.type, node.inputsCount);
    port.title = portLabels[i] || `In ${i}`;
    const pct = count === 1
      ? 50
      : 20 + (i * 60) / (count - 1);
    port.style.top = `calc(${pct}% - 4px)`;
    port.style.left = '-7px';

    port.addEventListener('click', (e) => {
      if (_ignorePortClick) return;
      e.stopPropagation();
      handlePortClick(node.id, 'input', i);
    });
    port.addEventListener('touchend', (e) => {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      _ignorePortClick = true;
      setTimeout(() => { _ignorePortClick = false; }, 200);
      handlePortClick(node.id, 'input', i);
    });
    el.appendChild(port);
  }
}

function renderOutputPorts(node, el) {
  const count = node.outputsCount;
  if (count === 0) return;

  const portLabels = getOutputPortLabels(node.type);

  for (let i = 0; i < count; i++) {
    const port = document.createElement('div');
    port.className = 'sandbox-port port-output';
    port.dataset.portIdx = i;
    port.title = portLabels[i] || `Out ${i}`;

    const pct = count === 1
      ? 50
      : 20 + (i * 60) / (count - 1);
    port.style.top = `calc(${pct}% - 4px)`;
    port.style.right = '-7px';

    port.addEventListener('click', (e) => {
      if (_ignorePortClick) return;
      e.stopPropagation();
      handlePortClick(node.id, 'output', i);
    });
    port.addEventListener('touchend', (e) => {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      _ignorePortClick = true;
      setTimeout(() => { _ignorePortClick = false; }, 200);
      handlePortClick(node.id, 'output', i);
    });
    el.appendChild(port);
  }
}

function getInputPortLabels(type, count) {
  switch (type) {
    case 'not': case 'buffer': return ['In'];
    case 'and': case 'or': case 'nand': case 'nor': case 'xor': case 'xnor':
      return Array.from({ length: count }, (_, i) => 'In ' + String.fromCharCode(65 + i));
    case 'd-flop': return ['D', 'CLK'];
    case 'sr-latch': return ['Set (S)', 'Reset (R)'];
    case 'jk-flop': return ['J', 'K', 'CLK'];
    case 't-flop': return ['T', 'CLK'];
    case 'half-adder': return ['A', 'B'];
    case 'full-adder': return ['A', 'B', 'Cin'];
    case 'mux-2-1': return ['D0', 'D1', 'Select'];
    case 'demux-1-2': return ['Input', 'Select'];
    case 'decoder-2-4': return ['A (MSB)', 'B (LSB)'];
    case 'encoder-4-2': return ['D0 (LSB)', 'D1', 'D2', 'D3 (MSB)'];
    case 'comparator': return ['A1', 'A0', 'B1', 'B0'];
    case 'rgb-led': return ['Red', 'Green', 'Blue'];
    case 'led-bar': return ['D3', 'D2', 'D1', 'D0'];
    default: return Array.from({ length: count }, (_, i) => 'In ' + i);
  }
}

function getOutputPortLabels(type) {
  switch (type) {
    case 'not': case 'buffer': case 'and': case 'or': case 'nand': case 'nor':
    case 'xor': case 'xnor': case 'mux-2-1': return ['Out'];
    case 'demux-1-2': return ['Y0', 'Y1'];
    case 'half-adder': return ['Sum (S)', 'Carry (C)'];
    case 'full-adder': return ['Sum (S)', 'Carry-Out'];
    case 'decoder-2-4': return ['Y0', 'Y1', 'Y2', 'Y3'];
    case 'encoder-4-2': return ['A (MSB)', 'B (LSB)'];
    case 'comparator': return ['A>B', 'A=B', 'A<B'];
    case 'd-flop': return ['Q'];
    case 'sr-latch': return ['Q', "Q'"];
    case 'jk-flop': return ['Q', "Q'"];
    case 't-flop': return ['Q'];
    default: return ['Out'];
  }
}
function setupPanning() {
  const getPanPos = (e) => {
    if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  };

  const onPanStart = (e) => {
    if (isDragging) return;
    if (!e.touches && e.button !== 0) return;
    if (e.target !== workspace && e.target !== panContainer && e.target !== wiresSvg) return;
    if (e.target.closest('.sandbox-node') || e.target.closest('.sandbox-port') || e.target.closest('.sandbox-btn') || e.target.closest('.template-card')) return;
    if (e.cancelable) e.preventDefault();
    const pos = getPanPos(e);
    panStart.x = pos.x;
    panStart.y = pos.y;
    panStartOffset.x = panX;
    panStartOffset.y = panY;
    isPanning = false;

    if (e.ctrlKey || e.metaKey) {
      const wr = workspace.getBoundingClientRect();
      selectionRectStart.x = pos.x - wr.left - panX;
      selectionRectStart.y = pos.y - wr.top - panY;
      isSelecting = true;
      selectionRectEl.style.display = 'block';
    } else {
      panContainer.style.cursor = 'grabbing';
    }
  };

  const onPanMove = (e) => {
    if (isDragging) return;
    if (panStart.x === 0 && panStart.y === 0) return;
    const pos = getPanPos(e);
    const dx = pos.x - panStart.x;
    const dy = pos.y - panStart.y;

    if (isSelecting) {
      const wr = workspace.getBoundingClientRect();
      const cx = pos.x - wr.left - panX;
      const cy = pos.y - wr.top - panY;
      const rx = Math.min(cx, selectionRectStart.x);
      const ry = Math.min(cy, selectionRectStart.y);
      const rw = Math.abs(cx - selectionRectStart.x);
      const rh = Math.abs(cy - selectionRectStart.y);
      selectionRectEl.setAttribute('x', rx);
      selectionRectEl.setAttribute('y', ry);
      selectionRectEl.setAttribute('width', rw);
      selectionRectEl.setAttribute('height', rh);
      return;
    }

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      isPanning = true;
      didPan = true;
      panX = panStartOffset.x + dx;
      panY = panStartOffset.y + dy;
      panContainer.style.transform = `translate(${panX}px, ${panY}px)`;
    }
  };

  const onPanEnd = () => {
    if (isSelecting) {
      isSelecting = false;
      selectionRectEl.style.display = 'none';
      selectionRectEl.setAttribute('width', 0);
      selectionRectEl.setAttribute('height', 0);

      const rx = parseFloat(selectionRectEl.getAttribute('x')) || 0;
      const ry = parseFloat(selectionRectEl.getAttribute('y')) || 0;
      const rw = parseFloat(selectionRectEl.getAttribute('width')) || 0;
      const rh = parseFloat(selectionRectEl.getAttribute('height')) || 0;
      if (rw > 3 && rh > 3) {
        const absRx = rx + panX;
        const absRy = ry + panY;
        selectedNodeIds = [];
        sandboxNodes.forEach(n => {
          if (n.x >= absRx && n.x <= absRx + rw && n.y >= absRy && n.y <= absRy + rh) {
            selectedNodeIds.push(n.id);
          }
        });
        selectedNodeIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.classList.add('multi-selected');
        });
        updateICButtonState();
      }
    }
    if (isPanning) {
      updateSandboxWires();
      isPanning = false;
    }
    panStart.x = 0;
    panStart.y = 0;
    panContainer.style.cursor = '';
  };

  workspace.addEventListener('mousedown', onPanStart);
  window.addEventListener('mousemove', onPanMove);
  window.addEventListener('mouseup', onPanEnd);
  workspace.addEventListener('touchstart', onPanStart, { passive: false });
  window.addEventListener('touchmove', onPanMove, { passive: true });
  window.addEventListener('touchend', onPanEnd, { passive: true });
}

function startDrag(e, node) {
  if (e.type === 'touchstart') {
    e.preventDefault();
  } else {
    e.preventDefault();
  }
  if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
    selectNode(node.id);
  }
  isDragging = false;

  const getClientPos = (ev) => {
    if (ev.type.startsWith('touch')) {
      const t = ev.touches && ev.touches.length ? ev.touches[0] : ev.changedTouches[0];
      return { x: t.clientX, y: t.clientY };
    }
    return { x: ev.clientX, y: ev.clientY };
  };
  const workspaceRect = workspace.getBoundingClientRect();
  const startClient = getClientPos(e);
  const offsetX = startClient.x - workspaceRect.left - panX - node.x;
  const offsetY = startClient.y - workspaceRect.top - panY - node.y;

  function onMove(mv) {
    if (mv.cancelable) mv.preventDefault();
    isDragging = true;
    const cur = getClientPos(mv);
    const wr = workspace.getBoundingClientRect();
    node.x = Math.round((cur.x - wr.left - panX - offsetX) / 10) * 10;
    node.y = Math.round((cur.y - wr.top - panY - offsetY) / 10) * 10;
    const domEl = document.getElementById(node.id);
    if (domEl) {
      domEl.style.left = `${node.x}px`;
      domEl.style.top = `${node.y}px`;
    }
    updateSandboxWires();
  }

  function onUp() {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onUp);
    setTimeout(() => { isDragging = false; }, 50);
    pushUndo();
  }

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onUp, { passive: true });
}
function selectNode(id, shiftKey) {
  if (shiftKey) {
    toggleNodeSelection(id);
    return;
  }
  deselectAllNodes();
  selectedNodeId = id;
  document.getElementById(id)?.classList.add('selected');
  const node = sandboxNodes.find(n => n.id === id);
  if (node) showInspectorForNode(node);
}

function toggleNodeSelection(id) {
  const idx = selectedNodeIds.indexOf(id);
  if (idx >= 0) {
    selectedNodeIds.splice(idx, 1);
    document.getElementById(id)?.classList.remove('multi-selected');
  } else {
    selectedNodeIds.push(id);
    document.getElementById(id)?.classList.add('multi-selected');
  }
  selectedNodeId = id;
  updateICButtonState();
}

function deselectAllNodes() {
  selectedNodeId = null;
  selectedNodeIds = [];
  document.querySelectorAll('.sandbox-node.selected, .sandbox-node.multi-selected').forEach(el => {
    el.classList.remove('selected', 'multi-selected');
  });
  updateICButtonState();
}

function updateICButtonState() {
  const btn = document.getElementById('sandbox-create-ic');
  if (!btn) return;
  if (selectedNodeIds.length >= 2) {
    btn.disabled = false;
    btn.title = `Create IC from ${selectedNodeIds.length} selected components`;
  } else {
    btn.disabled = true;
    btn.title = 'Select 2+ components (Shift+click) to create an IC';
  }
}
function handlePortClick(nodeId, direction, portIdx) {
  if (!activeWiringSource) {
    playSound('click');
    activeWiringSource = { nodeId, direction, portIdx };
    highlightEligiblePorts(direction === 'output' ? 'input' : 'output', nodeId);
    const portClass = direction === 'output' ? '.port-output' : '.port-input';
    document.querySelectorAll(`#${nodeId} ${portClass}`).forEach(p => {
      if (parseInt(p.dataset.portIdx) === portIdx) p.classList.add('wiring-source');
    });
  } else {
    if (activeWiringSource.nodeId === nodeId && activeWiringSource.direction === direction && activeWiringSource.portIdx === portIdx) {
      cancelWiring();
      return;
    }

    if (activeWiringSource.direction === direction) {
      cancelWiring();
      handlePortClick(nodeId, direction, portIdx);
      return;
    }

    if (activeWiringSource.nodeId === nodeId) {
      cancelWiring();
      return;
    }
    let fromNodeId, fromPortIdx, toNodeId, toPortIdx;
    if (activeWiringSource.direction === 'output') {
      fromNodeId = activeWiringSource.nodeId;
      fromPortIdx = activeWiringSource.portIdx;
      toNodeId = nodeId;
      toPortIdx = portIdx;
    } else {
      fromNodeId = nodeId;
      fromPortIdx = portIdx;
      toNodeId = activeWiringSource.nodeId;
      toPortIdx = activeWiringSource.portIdx;
    }
    sandboxWires = sandboxWires.filter(w => !(w.toNodeId === toNodeId && w.toPortIdx === toPortIdx));

    sandboxWires.push({
      fromNodeId,
      fromPortIdx,
      toNodeId,
      toPortIdx,
    });

    playSound('success');
    cancelWiring();
    evaluateSandbox();
  }
}

function highlightEligiblePorts(targetDirection, sourceNodeId) {
  const cls = targetDirection === 'input' ? '.sandbox-port.port-input' : '.sandbox-port.port-output';
  document.querySelectorAll(cls).forEach(port => {
    if (port.closest('.sandbox-node').id !== sourceNodeId) {
      port.classList.add('eligible');
    }
  });
}

function cancelWiring() {
  activeWiringSource = null;
  document.querySelectorAll('.sandbox-port').forEach(p => {
    p.classList.remove('eligible', 'wiring-source');
    p.style.backgroundColor = '';
    p.style.transform = '';
  });
  updateSandboxWires();
}
function getEventPos(e) {
  if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}
function drawWiringPreview(e) {
  if (!activeWiringSource) return;

  const sourceEl = document.getElementById(activeWiringSource.nodeId);
  if (!sourceEl) return;

  const ports = sourceEl.querySelectorAll(activeWiringSource.direction === 'output' ? '.port-output' : '.port-input');
  let port = null;
  ports.forEach(p => {
    if (parseInt(p.dataset.portIdx) === activeWiringSource.portIdx) port = p;
  });
  if (!port) return;

  const pos = getEventPos(e);
  const canvasRect = workspace.getBoundingClientRect();
  const portRect = port.getBoundingClientRect();

  const x1 = portRect.left + portRect.width / 2 - canvasRect.left - panX;
  const y1 = portRect.top + portRect.height / 2 - canvasRect.top - panY;
  const x2 = pos.x - canvasRect.left - panX;
  const y2 = pos.y - canvasRect.top - panY;

  updateSandboxWires();   

  const dir = x2 >= x1 ? 1 : -1;
  const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
  const d = `M ${x1} ${y1} C ${x1 + dir * dx} ${y1}, ${x2 - dir * dx} ${y2}, ${x2} ${y2}`;

  const prev = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  prev.setAttribute('d', d);
  prev.setAttribute('stroke', 'var(--color-cyan, #0284c7)');
  prev.setAttribute('stroke-width', '2');
  prev.setAttribute('stroke-dasharray', '6,4');
  prev.setAttribute('fill', 'none');
  prev.setAttribute('opacity', '0.75');
  wiresSvg.appendChild(prev);
}

function updateSandboxWires() {
  if (!wiresSvg || !workspace) return;
  wiresSvg.innerHTML = '';

  const canvasRect = workspace.getBoundingClientRect();

  sandboxWires.forEach((wire) => {
    const fromEl = document.getElementById(wire.fromNodeId);
    const toEl = document.getElementById(wire.toNodeId);
    if (!fromEl || !toEl) return;
    let outPort = fromEl.querySelector('.port-output');
    fromEl.querySelectorAll('.port-output').forEach(p => {
      if (parseInt(p.dataset.portIdx) === wire.fromPortIdx) outPort = p;
    });
    let inPort = toEl.querySelector('.port-input');
    toEl.querySelectorAll('.port-input').forEach(p => {
      if (parseInt(p.dataset.portIdx) === wire.toPortIdx) inPort = p;
    });

    if (!outPort || !inPort) return;

    const oR = outPort.getBoundingClientRect();
    const iR = inPort.getBoundingClientRect();

    const x1 = oR.left + oR.width / 2 - canvasRect.left - panX;
    const y1 = oR.top + oR.height / 2 - canvasRect.top - panY;
    const x2 = iR.left + iR.width / 2 - canvasRect.left - panX;
    const y2 = iR.top + iR.height / 2 - canvasRect.top - panY;
    const srcNode = sandboxNodes.find(n => n.id === wire.fromNodeId);
    const isElectricityCircuit = false;
    const isActive = isElectricityCircuit
      ? !!wire.active
      : srcNode
        ? (window.getSourceOutputVal ? window.getSourceOutputVal(srcNode, wire.fromPortIdx) : (wire.fromPortIdx === 0 ? srcNode.outputState : srcNode.outputState2)) === 1
        : false;

    const dir = x2 >= x1 ? 1 : -1;
    const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
    const d = `M ${x1} ${y1} C ${x1 + dir * dx} ${y1}, ${x2 - dir * dx} ${y2}, ${x2} ${y2}`;
    const hitTarget = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hitTarget.setAttribute('d', d);
    hitTarget.setAttribute('stroke', 'transparent');
    hitTarget.setAttribute('stroke-width', '14');
    hitTarget.setAttribute('fill', 'none');
    hitTarget.style.cursor = 'pointer';
    hitTarget.style.pointerEvents = 'stroke';
    hitTarget.addEventListener('mouseenter', () => visPath.style.stroke = 'var(--color-error, #dc2626)');
    hitTarget.addEventListener('mouseleave', () => visPath.style.stroke = isActive ? 'var(--color-high)' : 'var(--color-low)');
    hitTarget.addEventListener('click', (e) => {
      e.stopPropagation();
      sandboxWires = sandboxWires.filter(w => w !== wire);
      playSound('click');
      evaluateSandbox();
    });
    const visPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    visPath.setAttribute('d', d);
    visPath.setAttribute('stroke', isActive ? 'var(--color-high)' : 'var(--color-low)');
    visPath.setAttribute('stroke-width', '2.5');
    visPath.setAttribute('stroke-linecap', 'round');
    visPath.style.transition = 'stroke 0.1s';
    visPath.style.pointerEvents = 'none';

    wiresSvg.appendChild(hitTarget);
    wiresSvg.appendChild(visPath);
    if (isActive) {
      const flow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      flow.setAttribute('d', d);
      flow.setAttribute('fill', 'none');
      flow.setAttribute('stroke', 'var(--color-high)');
      flow.setAttribute('stroke-width', '1.5');
      flow.setAttribute('stroke-dasharray', '4 8');
      flow.setAttribute('opacity', '0.6');
      flow.style.animation = 'marchingAnts 1s linear infinite';
      wiresSvg.appendChild(flow);
    }
  });

  sandboxNodes.forEach(node => {
    const el = document.getElementById(node.id);
    if (!el) return;
    el.querySelectorAll('.port-output').forEach(p => {
      const portIdx = parseInt(p.dataset.portIdx);
      const val = portIdx === 0 ? node.outputState : node.outputState2;
      p.classList.toggle('active-port', val === 1);
    });
  });
}

// renderComponentSVG removed

// getElectricityNodeInner removed

function findSeriesCycle(startId, adj) {
  const visited = new Set();
  visited.add(startId);
  function dfs(current, parent) {
    for (const nb of (adj[current] || [])) {
      if (nb === startId && nb !== parent) return true;
      if (!visited.has(nb)) {
        visited.add(nb);
        if (dfs(nb, current)) return true;
      }
    }
    return false;
  }
  for (const nb of (adj[startId] || [])) {
    visited.add(nb);
    if (dfs(nb, startId)) return true;
  }
  return false;
}

// evaluateElectricity removed
// window.updateElectricProp = removed

// window.toggleElectricSwitch = removed

// window.toggleElectricTransistor = removed

window.updateSensorValue = function (nodeId, value) {
  const node = sandboxNodes.find(n => n.id === nodeId);
  if (node && node.type === 'sensor') {
    node.data.value = value;
    const thr = node.data.threshold !== undefined ? node.data.threshold : 50;
    node.outputState = value > thr ? 1 : 0;
    updateNodeVisuals(node);
    evaluateSandbox();
  }
};

window.updateSensorThreshold = function (nodeId, value) {
  const node = sandboxNodes.find(n => n.id === nodeId);
  if (node && node.type === 'sensor') {
    node.data.threshold = value;
    const val = node.data.value !== undefined ? node.data.value : 50;
    node.outputState = val > value ? 1 : 0;
    updateNodeVisuals(node);
    evaluateSandbox();
  }
};
function evaluateSandbox() {
  if (sandboxNodes.length === 0) return;
  // electricity branch removed

  const MAX_ITER = Math.max(sandboxNodes.length * 3, 20);

  for (let iter = 0; iter < MAX_ITER; iter++) {
    let changed = false;

    sandboxNodes.forEach(node => {
      if (node.type === 'text-label' || node.type === 'input' || node.type === 'clock') return;
      const prev = [...node.inputValues];
      node.inputValues = Array(node.inputsCount).fill(0);

      sandboxWires.forEach(wire => {
        if (wire.toNodeId !== node.id) return;
        const src = sandboxNodes.find(n => n.id === wire.fromNodeId);
        if (!src) return;
        let val = 0;
        if (wire.fromPortIdx === 0) val = src.outputState || 0;
        else if (wire.fromPortIdx === 1) val = src.outputState2 || 0;
        else if (wire.fromPortIdx === 2) val = src.outputState3 || 0;
        else if (wire.fromPortIdx === 3) val = src.outputState4 || 0;
        if (wire.toPortIdx < node.inputsCount) node.inputValues[wire.toPortIdx] = val;
      });

      const inputsChanged = node.inputValues.some((v, i) => v !== prev[i]);
      const prevOut = node.outputState;
      const prevOut2 = node.outputState2;

      computeNodeOutput(node);

      if (node.outputState !== prevOut || node.outputState2 !== prevOut2 || inputsChanged) {
        changed = true;
      }
    });

    if (!changed) break;
  }

  // ΓöÇΓöÇ Logic-Electricity Bridge ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // Digital gate outputs drive electricity switches and transistors.
  // This allows circuits like: Toggle Switch ΓåÆ Electricity Switch ΓåÆ Battery ΓåÆ Bulb
  {
    const digitalTypes = new Set(['input','clock','not','and','or','nand','nor','xor','xnor',
      'd-flop','half-adder','full-adder','output','rgb-led','buzzer','led-bar',
      'seven-seg','sensor','op-amp']);
    const bridgeTargets = new Set(['switch', 'transistor']);
    let bridgeChanged = false;
    sandboxWires.forEach(wire => {
      const from = sandboxNodes.find(n => n.id === wire.fromNodeId);
      const to   = sandboxNodes.find(n => n.id === wire.toNodeId);
      if (!from || !to) return;
      if (digitalTypes.has(from.type) && bridgeTargets.has(to.type)) {
        const signal = wire.fromPortIdx === 0 ? from.outputState : (from.outputState2 || 0);
        if (to.type === 'switch') {
          const prev = to.data.closed;
          to.data.closed = signal === 1;
          if (prev !== to.data.closed) bridgeChanged = true;
        }
        if (to.type === 'transistor') {
          const prev = to.data.on;
          to.data.on = signal === 1;
          if (prev !== to.data.on) bridgeChanged = true;
        }
      }
    });
    // If bridge changed any state, re-run electricity evaluation
    if (bridgeChanged) {
      evaluateElectricity();
    }
  }

  sandboxNodes.forEach(node => updateNodeVisuals(node));
  updateSandboxWires();
  updateNodeInspector();
  if (window.checkTheoryChallenge) window.checkTheoryChallenge();
}
window.evaluateSandbox = evaluateSandbox;

function computeNodeOutput(node) {
  if (node.type && node.type.startsWith('custom-ic-')) {
    if (window.evaluateCustomIC) {
      window.evaluateCustomIC(node);
    } else {
      const icName = node.data.icName || node.type.slice(9);
      const icDef = customICs[icName];
      if (!icDef || icDef.nodes.length === 0) { node.outputState = 0; node.outputState2 = 0; return; }
      const tmpNodes = icDef.nodes.map(n => ({
        ...n, outputState: n.type === 'input' ? 0 : (n.outputState || 0),
        outputState2: n.outputState2 || 0,
        outputState3: n.outputState3 || 0,
        outputState4: n.outputState4 || 0,
        inputValues: Array(n.inputsCount).fill(0), prevClockState: 0
      }));
      const tmpNodeMap = {};
      tmpNodes.forEach(n => tmpNodeMap[n.id] = n);
      icDef.inputPorts.forEach((portId, idx) => {
        const tn = tmpNodeMap[portId];
        if (tn) tn.outputState = node.inputValues[idx] || 0;
      });
      const tmpWires = icDef.wires.map(w => ({ ...w }));
      for (let iter = 0; iter < 30; iter++) {
        let changed = false;
        tmpNodes.forEach(n => {
          if (n.type === 'input' || n.type === 'clock' || n.type === 'text-label' || n.type.startsWith('custom-ic-')) return;
          const prev = [...n.inputValues];
          n.inputValues = Array(n.inputsCount).fill(0);
          tmpWires.forEach(w => {
            if (w.toNodeId !== n.id) return;
            const src = tmpNodeMap[w.fromNodeId];
            if (!src) return;
            const val = w.fromPortIdx === 0 ? src.outputState : src.outputState2;
            if (w.toPortIdx < n.inputsCount) n.inputValues[w.toPortIdx] = val;
          });
          if (n.type === 'sensor') { return; }
          const pA = n.inputValues[0] || 0, pB = n.inputValues[1] || 0, pC = n.inputValues[2] || 0;
          switch (n.type) {
            case 'output': n.outputState = pA ? 1 : 0; break;
            case 'buzzer': n.outputState = pA ? 1 : 0; break;
            case 'not': n.outputState = pA ? 0 : 1; break;
            case 'and': n.outputState = (pA && pB) ? 1 : 0; break;
            case 'or': n.outputState = (pA || pB) ? 1 : 0; break;
            case 'nand': n.outputState = !(pA && pB) ? 1 : 0; break;
            case 'nor': n.outputState = !(pA || pB) ? 1 : 0; break;
            case 'xor': n.outputState = (!!pA !== !!pB) ? 1 : 0; break;
            case 'xnor': n.outputState = (!!pA === !!pB) ? 1 : 0; break;
            case 'd-flop': {
              const clk = pB ? 1 : 0;
              if (clk === 1 && n.prevClockState === 0) n.outputState = pA ? 1 : 0;
              n.prevClockState = clk;
              break;
            }
            case 'half-adder': n.outputState = (!!pA !== !!pB) ? 1 : 0; n.outputState2 = (pA && pB) ? 1 : 0; break;
            case 'full-adder': {
              const s1 = (!!pA !== !!pB); const c1 = (pA && pB);
              n.outputState = (s1 !== !!pC) ? 1 : 0; n.outputState2 = (c1 || (s1 && pC)) ? 1 : 0;
              break;
            }
            case 'rgb-led': n.outputState = pA ? 1 : 0; n.outputState2 = pB ? 1 : 0; n._blueState = pC ? 1 : 0; break;
            case 'led-bar': n.outputState = pA ? 1 : 0; break;
            case 'seven-seg': break;
            case 'op-amp': n.outputState = (pA > pB) ? 1 : 0; break;
          }
          if (n.outputState !== prev[0] || n.outputState2 !== (prev[1] || 0)) changed = true;
        });
        if (!changed) break;
      }
      node.outputState = 0; node.outputState2 = 0;
      icDef.outputPorts.forEach((portId, idx) => {
        const tn = tmpNodeMap[portId];
        if (tn) {
          if (idx === 0) node.outputState = tn.outputState;
          else if (idx === 1) node.outputState2 = tn.outputState;
        }
      });
    }
    return;
  }
  const iv = node.inputValues;
  const a = iv[0], b = iv[1], c = iv[2];

  // Multi-input gate evaluation helpers
  const allHigh  = () => iv.every(v => !!v);
  const anyHigh  = () => iv.some(v => !!v);
  const xorParity = () => (iv.filter(v => !!v).length % 2 === 1) ? 1 : 0;

  switch (node.type) {
    case 'output':
      node.outputState = a ? 1 : 0;
      break;
    case 'rgb-led':
      node.outputState = a ? 1 : 0;   
      node.outputState2 = b ? 1 : 0;  
      node._blueState = c ? 1 : 0;    
      break;
    case 'buzzer':
      node.outputState = a ? 1 : 0;
      break;
    case 'led-bar':
      node.outputState = a ? 1 : 0;
      updateLedBar(node);
      break;
    case 'not':
      node.outputState = a ? 0 : 1;
      break;
    // ΓöÇΓöÇ Multi-input gates use reduce logic ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    case 'and':
      node.outputState = allHigh() ? 1 : 0;
      break;
    case 'or':
      node.outputState = anyHigh() ? 1 : 0;
      break;
    case 'nand':
      node.outputState = allHigh() ? 0 : 1;
      break;
    case 'nor':
      node.outputState = anyHigh() ? 0 : 1;
      break;
    case 'xor':
      // XOR parity rule: output HIGH if ODD number of inputs are HIGH
      node.outputState = xorParity();
      break;
    case 'xnor':
      // XNOR: output HIGH if EVEN number of inputs are HIGH
      node.outputState = xorParity() ? 0 : 1;
      break;

    case 'op-amp':
      node.outputState = (a > b) ? 1 : 0;
      break;

    case 'd-flop': {
      const clk = b ? 1 : 0;
      if (clk === 1 && node.prevClockState === 0) {
        node.outputState = a ? 1 : 0;  
      }
      node.prevClockState = clk;
      break;
    }

    case 'half-adder': {
      node.outputState = (!!a !== !!b) ? 1 : 0;  
      node.outputState2 = (a && b) ? 1 : 0;        
      break;
    }

    case 'full-adder': {
      const sum1 = (!!a !== !!b);
      const carry1 = (a && b);
      const sum2 = (sum1 !== !!c);
      const carry2 = (sum1 && c);
      node.outputState = sum2 ? 1 : 0;              
      node.outputState2 = (carry1 || carry2) ? 1 : 0;  
      break;
    }

    case 'seven-seg':
      updateSevenSeg(node);
      break;
  }
}

// ΓöÇΓöÇ Multi-input gate management ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const MULTI_INPUT_GATE_TYPES = new Set(['and','or','nand','nor','xor','xnor']);
const MAX_GATE_INPUTS = 32;
const MIN_GATE_INPUTS = 2;

function addGateInput(nodeId) {
  const node = sandboxNodes.find(n => n.id === nodeId);
  if (!node || !MULTI_INPUT_GATE_TYPES.has(node.type)) return;
  if (node.inputsCount >= MAX_GATE_INPUTS) { showToast(`Maximum ${MAX_GATE_INPUTS} inputs reached.`); return; }
  pushUndo();
  node.inputsCount++;
  node.inputValues = Array(node.inputsCount).fill(0);
  // Remove any wires that targeted ports that no longer make sense (none needed ΓÇö just grow)
  const el = document.getElementById(nodeId);
  if (el) {
    // Remove old input ports, re-render
    el.querySelectorAll('.port-input').forEach(p => p.remove());
    renderInputPorts(node, el);
    // Auto-resize height
    updateGateNodeHeight(el, node.inputsCount);
  }
  evaluateSandbox();
  playSound('click');
  showToast(`Input added ΓåÆ ${node.inputsCount} inputs`);
}

function removeGateInput(nodeId) {
  const node = sandboxNodes.find(n => n.id === nodeId);
  if (!node || !MULTI_INPUT_GATE_TYPES.has(node.type)) return;
  if (node.inputsCount <= MIN_GATE_INPUTS) { showToast(`Minimum ${MIN_GATE_INPUTS} inputs required.`); return; }
  pushUndo();
  const removedIdx = node.inputsCount - 1;
  node.inputsCount--;
  node.inputValues = Array(node.inputsCount).fill(0);
  // Remove wires connected to the removed port
  sandboxWires = sandboxWires.filter(w => !(w.toNodeId === nodeId && w.toPortIdx === removedIdx));
  const el = document.getElementById(nodeId);
  if (el) {
    el.querySelectorAll('.port-input').forEach(p => p.remove());
    renderInputPorts(node, el);
    updateGateNodeHeight(el, node.inputsCount);
  }
  evaluateSandbox();
  playSound('click');
  showToast(`Input removed ΓåÆ ${node.inputsCount} inputs`);
}
window.addGateInput = addGateInput;
window.removeGateInput = removeGateInput;

function updateGateNodeHeight(el, inputsCount) {
  // Each input port needs at least 22px, minimum 80px
  const minH = Math.max(80, inputsCount * 22 + 20);
  el.style.minHeight = minH + 'px';
}

// ΓöÇΓöÇ Right-click context menu ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
let _sbCtxMenu = null;
function showSandboxContextMenu(e, node) {
  e.preventDefault();
  hideSandboxContextMenu();
  if (!MULTI_INPUT_GATE_TYPES.has(node.type)) return;

  const menu = document.createElement('div');
  menu.className = 'sb-context-menu';
  menu.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;z-index:9999;
    background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);min-width:180px;overflow:hidden;`;

  const items = [
    {
      icon: 'Γ₧ò', label: `Add Input (now ${node.inputsCount})`,
      action: () => addGateInput(node.id),
      disabled: node.inputsCount >= MAX_GATE_INPUTS
    },
    {
      icon: 'Γ₧û', label: `Remove Input (now ${node.inputsCount})`,
      action: () => removeGateInput(node.id),
      disabled: node.inputsCount <= MIN_GATE_INPUTS
    },
    { separator: true },
    {
      icon: '≡ƒôï', label: 'Show Inspector',
      action: () => { selectNode(node.id); }
    },
    {
      icon: '≡ƒùæ∩╕Å', label: 'Delete Gate',
      action: () => deleteNode(node.id)
    }
  ];

  items.forEach(item => {
    if (item.separator) {
      const sep = document.createElement('div');
      sep.style.cssText = 'height:1px;background:var(--border-color);margin:4px 0';
      menu.appendChild(sep);
      return;
    }
    const btn = document.createElement('button');
    btn.style.cssText = `display:flex;align-items:center;gap:8px;width:100%;padding:8px 14px;
      background:transparent;border:none;color:var(--text-primary);font-size:0.8rem;
      cursor:${item.disabled ? 'not-allowed' : 'pointer'};opacity:${item.disabled ? '0.4' : '1'};
      font-family:var(--font-body);text-align:left;`;
    btn.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`;
    if (!item.disabled) {
      btn.addEventListener('mouseenter', () => btn.style.background = 'var(--bg-tertiary)');
      btn.addEventListener('mouseleave', () => btn.style.background = 'transparent');
      btn.addEventListener('click', () => { hideSandboxContextMenu(); item.action(); });
    }
    menu.appendChild(btn);
  });

  document.body.appendChild(menu);
  _sbCtxMenu = menu;

  // Auto-close on outside click
  setTimeout(() => {
    document.addEventListener('click', hideSandboxContextMenu, { once: true });
    document.addEventListener('contextmenu', hideSandboxContextMenu, { once: true });
  }, 10);
}

function hideSandboxContextMenu() {
  if (_sbCtxMenu) { _sbCtxMenu.remove(); _sbCtxMenu = null; }
}

function updateNodeVisuals(node) {
  const el = document.getElementById(node.id);
  if (!el) return;

  switch (node.type) {
    case 'output': {
      const wrap = document.getElementById(`${node.id}-bulb`);
      const state = document.getElementById(`${node.id}-state`);
      const isHigh = node.outputState === 1;
      if (wrap) wrap.classList.toggle('high', isHigh);
      if (state) {
        state.classList.toggle('high', isHigh);
        state.innerText = isHigh ? 'ΓùÅ ON' : 'Γùï OFF';
      }
      break;
    }
    case 'rgb-led': {
      const r = node.outputState === 1;
      const g = node.outputState2 === 1;
      const b = node._blueState === 1;
      const inner = document.getElementById(`${node.id}-rgb-inner`);
      const glass = document.getElementById(`${node.id}-rgb-glass`);
      const lbl = document.getElementById(`${node.id}-rgb-label`);
      const wrap = document.getElementById(`${node.id}-rgb`);
      const colorName = getRgbColorName(r, g, b);
      const rgbColor = getRgbColor(r, g, b);
      const isOn = r || g || b;
      if (inner) inner.style.fill = isOn ? rgbColor : 'var(--bg-primary)';
      if (glass) glass.style.fill = isOn ? rgbColor + '44' : 'var(--bg-tertiary)';
      if (lbl) { lbl.innerText = colorName; lbl.style.color = isOn ? rgbColor : 'var(--text-muted)'; }
      if (wrap) wrap.classList.toggle('rgb-on', isOn);
      break;
    }
    case 'buzzer': {
      const isOn = node.outputState === 1;
      const body = document.getElementById(`${node.id}-bz-body`);
      const ring1 = document.getElementById(`${node.id}-bz-ring1`);
      const center = document.getElementById(`${node.id}-bz-center`);
      const wave1 = document.getElementById(`${node.id}-bz-wave1`);
      const wave2 = document.getElementById(`${node.id}-bz-wave2`);
      const lbl = document.getElementById(`${node.id}-bz-label`);
      const wrap = document.getElementById(`${node.id}-buzzer`);
      if (body) body.style.fill = isOn ? '#f59e0b' : 'var(--bg-tertiary)';
      if (ring1) ring1.style.stroke = isOn ? '#f97316' : 'var(--border-color)';
      if (center) center.style.fill = isOn ? '#ef4444' : 'var(--border-color)';
      const waveColor = isOn ? '#f59e0b' : 'var(--border-color)';
      if (wave1) wave1.style.stroke = waveColor;
      if (wave2) wave2.style.stroke = waveColor;
      if (lbl) { lbl.innerText = isOn ? 'ΓÖ¬ BUZZ' : 'SILENT'; lbl.style.color = isOn ? '#f59e0b' : 'var(--text-muted)'; }
      if (wrap) wrap.classList.toggle('buzzer-on', isOn);
      break;
    }
    case 'led-bar': {
      updateLedBar(node);
      break;
    }
    case 'clock': {
      const phase = document.getElementById(`${node.id}-phase`);
      if (phase) {
        phase.innerText = node.outputState === 1 ? 'Γû▓ HIGH' : 'Γû╝ LOW';
        phase.style.color = node.outputState === 1 ? 'var(--color-cyan)' : 'var(--text-muted)';
      }
      const cursor = document.getElementById(`${node.id}-cursor`);
      if (cursor) {
        const x = node.outputState === 1 ? 62.5 : 12.5; 
        cursor.setAttribute('x1', x);
        cursor.setAttribute('x2', x);
      }
      break;
    }
    case 'input': {
      const btn = el.querySelector('.sandbox-toggle-btn');
      if (btn) {
        btn.innerText = node.outputState;
        btn.className = node.outputState === 1 ? 'sandbox-toggle-btn high' : 'sandbox-toggle-btn';
      }
      break;
    }
    default: {
      if (node.type && node.type.startsWith('custom-ic-')) {
        const body = el.querySelector('.sandbox-node-body');
        if (body && window.getCustomICNodeInner) {
          body.innerHTML = window.getCustomICNodeInner(node);
        }
        el.querySelectorAll('.sandbox-port').forEach(p => {
          const pinType = p.dataset.pinType;
          const portIdx = parseInt(p.dataset.portIdx);
          let val = 0;
          const icName = node.data.icName || node.type.slice(9);
          const def = window.customICs[icName];
          if (def) {
            if (pinType === 'input') {
              val = node.inputValues[portIdx] || 0;
            } else if (pinType === 'output') {
              val = node.outputStates ? (node.outputStates[portIdx] || 0) : (portIdx === 0 ? node.outputState : node.outputState2);
            } else if (pinType === 'power') {
              val = node.inputValues[def.inputs] || 0;
            } else if (pinType === 'ground') {
              val = node.inputValues[def.inputs + 1] || 0;
            }
          }
          p.classList.toggle('active-port', val === 1);
          p.style.backgroundColor = val === 1 ? '#22d3a5' : val === 0 ? '#475569' : '#f97316';
        });
      }
      break;
    }
  }
}

function getRgbColor(r, g, b) {
  if (r && g && b) return '#ffffff';  
  if (r && g) return '#fde047';       
  if (r && b) return '#d946ef';       
  if (g && b) return '#06b6d4';       
  if (r) return '#ef4444';            
  if (g) return '#22c55e';            
  if (b) return '#3b82f6';            
  return 'var(--bg-primary)';
}

function getRgbColorName(r, g, b) {
  if (r && g && b) return 'WHITE';
  if (r && g) return 'YELLOW';
  if (r && b) return 'MAGENTA';
  if (g && b) return 'CYAN';
  if (r) return 'RED';
  if (g) return 'GREEN';
  if (b) return 'BLUE';
  return 'OFF';
}

function updateLedBar(node) {
  const vals = node.inputValues;
  for (let i = 0; i < 4; i++) {
    const led = document.getElementById(`${node.id}-led${i}`);
    if (led) led.classList.toggle('active', vals[i] === 1);
  }
  const valEl = document.getElementById(`${node.id}-lbar-val`);
  if (valEl) {
    const decimal = (vals[3] << 3) | (vals[2] << 2) | (vals[1] << 1) | vals[0];
    const bits = [vals[3], vals[2], vals[1], vals[0]].join('');
    valEl.innerText = `${bits} = ${decimal}`;
  }
}

function getOutputNodes() {
  return sandboxNodes.filter(n => n.type === 'output' || n.type === 'rgb-led' || n.type === 'led-bar');
}

function getInputNodes() {
  return sandboxNodes.filter(n => n.type === 'input');
}

function getDigitalGates() {
  return sandboxNodes.filter(n => ['not','and','or','nand','nor','xor','xnor','d-flop','half-adder','full-adder','seven-seg'].includes(n.type));
}

function isDigitalCircuit() {
  return sandboxNodes.length > 0;
}

window.showTruthTable = function () {
  if (!isDigitalCircuit()) {
    showAlert('Truth tables are available for digital logic circuits only. Remove electricity components to generate a truth table.', 'Digital Circuits Only');
    return;
  }
  const inputs = getInputNodes();
  const outputs = getOutputNodes();
  const gates = getDigitalGates();
  const allOutputs = [...outputs, ...gates.filter(n => n.outputsCount > 0)];

  if (inputs.length === 0) {
    showAlert('Add at least one Toggle Switch (input) to generate a truth table.', 'No Inputs');
    return;
  }
  if (outputs.length === 0 && gates.length === 0) {
    showAlert('Add at least one output (LED) or gate to see results.', 'No Outputs');
    return;
  }

  const n = Math.min(inputs.length, 6);
  const totalRows = 1 << n;
  const savedStates = inputs.map(inp => inp.outputState);

  const modal = document.getElementById('logic-modal');
  const title = document.getElementById('logic-modal-title');
  const content = document.getElementById('logic-modal-content');
  if (!modal || !title || !content) return;

  title.textContent = 'Truth Table';

  const inputLabels = inputs.slice(0, n).map((inp, i) => String.fromCharCode(65 + i));
  const outputEntries = [];
  outputs.forEach(out => {
    const parent = sandboxNodes.find(n => n.id === out.id);
    const lbl = parent ? parent.label : 'Output';
    if (out.type === 'output') outputEntries.push({ id: out.id, label: lbl, port: 0 });
    if (out.type === 'rgb-led') {
      outputEntries.push({ id: out.id, label: lbl + '(R)', port: 0 });
      outputEntries.push({ id: out.id, label: lbl + '(G)', port: 1 });
      outputEntries.push({ id: out.id, label: lbl + '(B)', port: 2 });
    }
  });
  gates.forEach(g => {
    if (g.outputsCount > 0) {
      outputEntries.push({ id: g.id, label: g.label + '(Y)', port: 0 });
    }
    if (g.outputsCount > 1) {
      outputEntries.push({ id: g.id, label: g.label + '(C)', port: 1 });
    }
  });

  const hasLedBar = outputs.some(n => n.type === 'led-bar');
  let binaryDisplay = '';

  const headerCells = [...inputLabels];
  outputEntries.forEach(e => headerCells.push(e.label));
  const ths = headerCells.map(h => `<th>${h}</th>`).join('');

  let rowsHtml = '';
  for (let row = 0; row < totalRows; row++) {
    for (let i = 0; i < n; i++) {
      inputs[i].outputState = (row >> (n - 1 - i)) & 1;
    }
    evaluateSandbox();
    const tds = [];
    for (let i = 0; i < n; i++) {
      tds.push(`<td>${inputs[i].outputState}</td>`);
    }
    outputEntries.forEach(e => {
      const outNode = sandboxNodes.find(nd => nd.id === e.id);
      const val = e.port === 0 ? (outNode ? outNode.outputState : 0) : (e.port === 1 ? (outNode ? outNode.outputState2 : 0) : (outNode ? outNode._blueState : 0));
      tds.push(`<td>${val}</td>`);
    });
    if (hasLedBar) {
      const ledBars = outputs.filter(n => n.type === 'led-bar');
      const bits = [];
      ledBars.forEach(lb => {
        for (let p = 0; p < 4; p++) {
          bits.push(lb.inputValues[p] || 0);
        }
      });
      const binStr = bits.join('');
      const dec = bits.length > 0 ? parseInt(binStr, 2) : 0;
      binaryDisplay = `<div style="margin-top:0.5rem;padding:0.5rem;background:var(--bg-tertiary);border-radius:4px;font-family:monospace;font-size:0.8rem;border:1px solid var(--border-color)">
        <strong>Binary:</strong> ${binStr || 'ΓÇö'} &nbsp;|&nbsp; <strong>Decimal:</strong> ${bits.length > 0 ? dec : 'ΓÇö'} &nbsp;|&nbsp; <strong>Hex:</strong> ${bits.length > 0 ? '0x' + dec.toString(16).toUpperCase() : 'ΓÇö'}
      </div>`;
    }
    rowsHtml += `<tr>${tds.join('')}</tr>`;
  }

  for (let i = 0; i < n; i++) {
    inputs[i].outputState = savedStates[i];
  }
  evaluateSandbox();

  const ledBin = getOutputBinaryDisplay();

  content.innerHTML = `
    <div style="width:100%;max-height:400px;overflow:auto">
      <table class="learning-table" style="width:100%;font-size:0.78rem">
        <thead><tr>${ths}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      ${binaryDisplay}
      ${ledBin}
      <div style="margin-top:1rem;font-size:0.75rem;color:var(--text-muted);text-align:center">
        ${totalRows} row${totalRows > 1 ? 's' : ''} &middot; ${n} input${n > 1 ? 's' : ''}, ${outputEntries.length} output${outputEntries.length > 1 ? 's' : ''}
      </div>
    </div>`;
  modal.style.display = 'flex';
};

function getOutputBinaryDisplay() {
  const outputs = getOutputNodes();
  const plainLeds = outputs.filter(n => n.type === 'output');
  if (plainLeds.length < 2) return '';
  const bits = plainLeds.map(led => led.outputState);
  const binStr = bits.join('');
  const dec = parseInt(binStr, 2);
  return `<div style="margin-top:0.5rem;padding:0.5rem;background:var(--bg-tertiary);border-radius:4px;font-family:monospace;font-size:0.8rem;border:1px solid var(--border-color)">
    <strong>LED Binary:</strong> ${binStr} &nbsp;|&nbsp; <strong>Decimal:</strong> ${dec} &nbsp;|&nbsp; <strong>Hex:</strong> 0x${dec.toString(16).toUpperCase()}
  </div>`;
}

function showInspectorForNode(node) {
  const card = document.getElementById('sandbox-learning-card');
  const body = document.getElementById('learning-card-body');
  if (!card || !body) return;

  const t = node.type;
  const d = node.data || {};
  const inpVals = node.inputValues || [];
  const outVal = node.outputState;
  const outVal2 = node.outputState2;
  const inpStrs = inpVals.map((v, i) => `<span class="insp-port inp">I${i}:<b>${v}</b></span>`).join('');

  let detail = '';
  const valHtml = `<div class="insp-values">${inpStrs} <span class="insp-port out">OUT:<b>${outVal}</b></span>${node.outputsCount > 1 ? ` <span class="insp-port out">OUT2:<b>${outVal2}</b></span>` : ''}</div>`;

  switch (t) {
    case 'input': detail = `<div class="insp-row"><span>State</span><span class="insp-badge ${outVal ? 'on' : 'off'}">${outVal}</span></div>`; break;
    case 'clock': detail = `<div class="insp-row"><span>Phase</span><span class="insp-badge ${outVal ? 'on' : 'off'}">${outVal ? 'HIGH' : 'LOW'}</span></div>`; break;
    case 'output': detail = `<div class="insp-row"><span>LED</span><span class="insp-badge ${outVal ? 'on' : 'off'}">${outVal ? 'ON' : 'OFF'}</span></div>`; break;
    case 'rgb-led': {
      const r = outVal, g = outVal2, b = node._blueState || 0;
      detail = `<div class="insp-row"><span>Red</span><span class="insp-badge ${r ? 'on' : 'off'}">${r ? 'HIGH' : 'LOW'}</span></div>
        <div class="insp-row"><span>Green</span><span class="insp-badge ${g ? 'on' : 'off'}">${g ? 'HIGH' : 'LOW'}</span></div>
        <div class="insp-row"><span>Blue</span><span class="insp-badge ${b ? 'on' : 'off'}">${b ? 'HIGH' : 'LOW'}</span></div>`;
      const colorName = r && g && b ? 'White' : r && g ? 'Yellow' : r && b ? 'Magenta' : g && b ? 'Cyan' : r ? 'Red' : g ? 'Green' : b ? 'Blue' : 'Off';
      detail += `<div class="insp-row"><span>Color</span><span style="color:${r||g||b ? '#22d3a5' : 'var(--text-muted)'}">${colorName}</span></div>`;
      break;
    }
    case 'buzzer': detail = `<div class="insp-row"><span>State</span><span class="insp-badge ${outVal ? 'on' : 'off'}">${outVal ? 'BUZZ' : 'SILENT'}</span></div>`; break;
    case 'not': case 'and': case 'or': case 'nand': case 'nor': case 'xor': case 'xnor':
      detail = `<div class="insp-row"><span>Inputs</span><span>${inpVals.join(', ')}</span></div>
        <div class="insp-row"><span>Output</span><span class="insp-badge ${outVal ? 'on' : 'off'}">${outVal}</span></div>`; break;
    case 'd-flop': detail = `<div class="insp-row"><span>D</span><span>${inpVals[0] || 0}</span></div>
      <div class="insp-row"><span>CLK</span><span>${inpVals[1] || 0}</span></div>
      <div class="insp-row"><span>Q</span><span class="insp-badge ${outVal ? 'on' : 'off'}">${outVal}</span></div>`; break;
    case 'half-adder': case 'full-adder': {
      const labels = t === 'half-adder' ? ['A','B'] : ['A','B','Cin'];
      let rows = labels.map((l, i) => `<div class="insp-row"><span>${l}</span><span>${inpVals[i] || 0}</span></div>`).join('');
      rows += `<div class="insp-row"><span>Sum</span><span class="insp-badge ${outVal ? 'on' : 'off'}">${outVal}</span></div>
        <div class="insp-row"><span>Carry</span><span class="insp-badge ${outVal2 ? 'on' : 'off'}">${outVal2}</span></div>`;
      detail = rows; break;
    }
    case 'seven-seg': {
      const val = (inpVals[3] << 3) | (inpVals[2] << 2) | (inpVals[1] << 1) | inpVals[0];
      detail = `<div class="insp-row"><span>Value</span><span style="font-weight:700;font-size:1.1rem">${val}</span></div>
        <div class="insp-row"><span>Binary</span><span style="font-family:monospace">${inpVals.slice(0,4).map(v => v || 0).join('')}</span></div>`; break;
    }
    case 'led-bar': {
      const vals = [inpVals[0] || 0, inpVals[1] || 0, inpVals[2] || 0, inpVals[3] || 0];
      const dec = (vals[3] << 3) | (vals[2] << 2) | (vals[1] << 1) | vals[0];
      detail = `<div class="insp-row"><span>Bits</span><span style="font-family:monospace">${vals.join('')}</span></div>
        <div class="insp-row"><span>Decimal</span><span style="font-weight:700">${dec}</span></div>
        <div class="insp-row"><span>Hex</span><span style="font-weight:700">0x${dec.toString(16).toUpperCase()}</span></div>`; break;
    }
    case 'battery': detail = `<div class="insp-row"><span>EMF</span><span style="color:#22d3a5;font-weight:600">${d.emf || 9}V</span></div>
      <div class="insp-row"><span>Output</span><span class="insp-badge ${outVal ? 'on' : 'off'}">${outVal ? 'ACTIVE' : 'OFF'}</span></div>`; break;
    case 'resistor': {
      const R = d.R || 10;
      const cur = d.current || 0;
      const vDrop = d.voltageDrop || 0;
      detail = `<div class="insp-row"><span>Resistance</span><span style="color:#fbbf24;font-weight:600">${R}╬⌐</span></div>
        <div class="insp-row"><span>Current</span><span style="color:#f87171">${cur.toFixed(3)}A</span></div>
        <div class="insp-row"><span>Voltage Drop</span><span style="color:#22d3a5">${vDrop.toFixed(2)}V</span></div>
        <div class="insp-row"><span>Power</span><span style="color:#818cf8">${(cur * vDrop).toFixed(3)}W</span></div>`; break;
    }
    case 'bulb': {
      const bri = d.brightness || 0;
      detail = `<div class="insp-row"><span>Brightness</span><span style="color:#fbbf24">${(bri * 100).toFixed(0)}%</span></div>
        <div class="insp-row"><span>State</span><span class="insp-badge ${bri > 0.1 ? 'on' : 'off'}">${bri > 0.7 ? 'BRIGHT' : bri > 0.3 ? 'DIM' : 'OFF'}</span></div>`; break;
    }
    case 'switch': detail = `<div class="insp-row"><span>Contact</span><span class="insp-badge ${d.closed ? 'on' : 'off'}">${d.closed ? 'CLOSED' : 'OPEN'}</span></div>`; break;
    case 'ammeter': detail = `<div class="insp-row"><span>Current</span><span style="color:#f87171;font-weight:600">${(d.current || 0).toFixed(3)}A</span></div>`; break;
    case 'voltmeter': detail = `<div class="insp-row"><span>Voltage</span><span style="color:#22d3a5;font-weight:600">${(d.voltage || 0).toFixed(2)}V</span></div>`; break;
    case 'motor': detail = `<div class="insp-row"><span>Speed</span><span style="color:#fbbf24;font-weight:600">${(d.speed || 0).toFixed(0)} RPM</span></div>
      <div class="insp-row"><span>State</span><span class="insp-badge ${outVal ? 'on' : 'off'}">${outVal ? 'RUNNING' : 'STOPPED'}</span></div>`; break;
    case 'fuse': detail = `<div class="insp-row"><span>Status</span><span class="insp-badge ${d.blown ? 'off' : 'on'}">${d.blown ? 'BLOWN' : 'OK'}</span></div>`; break;
    case 'led-elec': detail = `<div class="insp-row"><span>LED</span><span class="insp-badge ${d.on ? 'on' : 'off'}">${d.on ? 'ON' : 'OFF'}</span></div>`; break;
    case 'transistor': detail = `<div class="insp-row"><span>Base</span><span class="insp-badge ${d.on ? 'on' : 'off'}">${d.on ? 'HIGH' : 'LOW'}</span></div>`; break;
    case 'diode': detail = `<div class="insp-row"><span>Bias</span><span class="insp-badge ${d.forward ? 'on' : 'off'}">${d.forward ? 'FORWARD' : 'REVERSE'}</span></div>`; break;
    case 'zener': {
      const zv = d.zenerVoltage || 5.1;
      detail = `<div class="insp-row"><span>Bias</span><span class="insp-badge ${d.forward ? 'on' : 'off'}">${d.forward ? 'FORWARD' : 'REVERSE'}</span></div>
        <div class="insp-row"><span>Zener Voltage</span><span style="color:#fbbf24;font-weight:600">${zv}V</span></div>`; break;
    }
    case 'ldr': detail = `<div class="insp-row"><span>Light Level</span><span style="color:#fbbf24">${d.lightLevel || 50}%</span></div>
      <div class="insp-row"><span>Resistance</span><span style="color:#818cf8">${(d.R || 10000) > 1000 ? ((d.R || 10000) / 1000).toFixed(0) + 'k' : (d.R || 10000).toFixed(0)}╬⌐</span></div>`; break;
    case 'thermistor': detail = `<div class="insp-row"><span>Temperature</span><span style="color:#ef4444">${d.temperature || 25}┬░C</span></div>
      <div class="insp-row"><span>Resistance</span><span style="color:#818cf8">${(d.R || 10000) > 1000 ? ((d.R || 10000) / 1000).toFixed(0) + 'k' : (d.R || 10000).toFixed(0)}╬⌐</span></div>`; break;
    case 'potentiometer': {
      const pos = d.wiperPos || 50;
      const pR = d.R || 500;
      detail = `<div class="insp-row"><span>Wiper</span><span style="color:#fbbf24">${pos}%</span></div>
        <div class="insp-row"><span>Resistance</span><span style="color:#818cf8">${pR}╬⌐</span></div>`; break;
    }
    case 'capacitor': detail = `<div class="insp-row"><span>Voltage</span><span style="color:#22d3a5">${(d.voltage || 0).toFixed(2)}V</span></div>
      <div class="insp-row"><span>Charge</span><span style="color:#818cf8">${((d.charge || 0) * 100).toFixed(0)}%</span></div>`; break;
    case 'relay': detail = `<div class="insp-row"><span>Coil</span><span class="insp-badge ${d.coilEnergized ? 'on' : 'off'}">${d.coilEnergized ? 'ENERGIZED' : 'OFF'}</span></div>`; break;
    case 'op-amp': detail = `<div class="insp-row"><span>V+</span><span>${inpVals[0] || 0}</span></div>
      <div class="insp-row"><span>V-</span><span>${inpVals[1] || 0}</span></div>
      <div class="insp-row"><span>Output</span><span class="insp-badge ${outVal ? 'on' : 'off'}">${outVal}</span></div>`; break;
    case 'text-label': detail = `<div class="insp-row"><span>Text</span><span style="font-style:italic">${node.labelText || '(empty)'}</span></div>`; break;
    default:
      if (t && t.startsWith('custom-ic-')) {
        detail = `<div class="insp-row"><span>IC</span><span style="color:#818cf8;font-weight:600">${d.icName || t.slice(9)}</span></div>
          <div class="insp-row"><span>Inputs/Outputs</span><span>${node.inputsCount} / ${node.outputsCount}</span></div>
          <div class="insp-row"><span>Output</span><span class="insp-badge ${outVal ? 'on' : 'off'}">${outVal}</span></div>`;
      } else {
        detail = `<div class="insp-row"><span>Output</span><span class="insp-badge ${outVal ? 'on' : 'off'}">${outVal}</span></div>`;
      }
  }

  const category = COMPONENT_DEFS[t] ? COMPONENT_DEFS[t].category : '';

  card.style.display = 'flex';
  card.classList.remove('collapsed');

  body.innerHTML = `
    <div class="inspector-header">
      <div class="inspector-type">${category ? `<span class="insp-cat">${category}</span>` : ''} <span class="insp-type">${t}</span></div>
      <div class="inspector-title">${node.label}</div>
    </div>
    <div class="inspector-section">${detail}</div>
    ${node.inputsCount > 0 || node.outputsCount > 0 ? `<div class="inspector-section-title">Ports</div><div class="insp-values">${inpStrs} <span class="insp-port out">OUT:<b>${outVal}</b></span>${node.outputsCount > 1 ? ` <span class="insp-port out">OUT2:<b>${outVal2}</b></span>` : ''}</div>` : ''}
    <div class="inspector-footer">
      <span style="color:var(--text-muted)">ID: ${node.id}</span>
      <span style="color:var(--text-muted)">Pos: ${node.x}, ${node.y}</span>
    </div>`;
};

function updateNodeInspector() {
  if (selectedNodeId) {
    const node = sandboxNodes.find(n => n.id === selectedNodeId);
    if (node) showInspectorForNode(node);
  }
}

function updateSevenSeg(node) {
  const val = (node.inputValues[3] << 3) | (node.inputValues[2] << 2)
    | (node.inputValues[1] << 1) | node.inputValues[0];
  const SEG = [
    [1, 1, 1, 1, 1, 1, 0], 
    [0, 1, 1, 0, 0, 0, 0], 
    [1, 1, 0, 1, 1, 0, 1], 
    [1, 1, 1, 1, 0, 0, 1], 
    [0, 1, 1, 0, 0, 1, 1], 
    [1, 0, 1, 1, 0, 1, 1], 
    [1, 0, 1, 1, 1, 1, 1], 
    [1, 1, 1, 0, 0, 0, 0], 
    [1, 1, 1, 1, 1, 1, 1], 
    [1, 1, 1, 1, 0, 1, 1], 
    [1, 1, 1, 0, 1, 1, 1], 
    [0, 0, 1, 1, 1, 1, 1], 
    [1, 0, 0, 1, 1, 1, 0], 
    [0, 1, 1, 1, 1, 0, 1], 
    [1, 0, 0, 1, 1, 1, 1], 
    [1, 0, 0, 0, 1, 1, 1], 
  ];

  const segs = SEG[val & 0xF];
  ['a', 'b', 'c', 'd', 'e', 'f', 'g'].forEach((s, i) => {
    document.getElementById(`${node.id}-seg-${s}`)?.classList.toggle('active', segs[i] === 1);
  });
}
function startSimulationLoop() {
  if (simInterval) clearInterval(simInterval);
  if (clockInterval) clearInterval(clockInterval);

  const baseInterval = Math.round(80 / simSpeed);
  const clockIntervalMs = Math.round(1000 / simSpeed);

  simInterval = setInterval(() => {
    if (isSimRunning) evaluateSandbox();
  }, Math.max(16, baseInterval));

  clockInterval = setInterval(() => {
    if (!isSimRunning) return;
    clockTick = 1 - clockTick;
    sandboxNodes.forEach(n => {
      if (n.type === 'clock') n.outputState = clockTick;
    });
  }, Math.max(50, clockIntervalMs));
}

function stopSimulationLoop() {
  clearInterval(simInterval);
  clearInterval(clockInterval);
  simInterval = null;
  clockInterval = null;
}
function deleteNode(id) {
  pushUndo();
  playSound('click');
  document.getElementById(id)?.remove();
  sandboxNodes = sandboxNodes.filter(n => n.id !== id);
  sandboxWires = sandboxWires.filter(w => w.fromNodeId !== id && w.toNodeId !== id);
  if (selectedNodeId === id) selectedNodeId = null;
  selectedNodeIds = selectedNodeIds.filter(nid => nid !== id);
  cancelWiring();
  updateICButtonState();
  evaluateSandbox();
}

function loadCustomICs() {
  try {
    const stored = JSON.parse(localStorage.getItem('logicQuest_ics') || '{}');
    const toolbox = document.querySelector('.sandbox-toolbox-items');
    let section = toolbox ? toolbox.querySelector('.toolbox-section[data-category="Custom ICs"]') : null;
    if (!section && Object.keys(stored).length > 0) {
      section = document.createElement('div');
      section.className = 'toolbox-section';
      section.dataset.category = 'Custom ICs';
      section.innerHTML = '<div class="toolbox-section-title">Custom ICs</div><div class="toolbox-items"></div>';
      const utilitySection = toolbox ? toolbox.querySelector('.toolbox-section:last-child') : null;
      if (utilitySection && utilitySection.parentNode) {
        utilitySection.parentNode.insertBefore(section, utilitySection.nextSibling);
      } else if (toolbox) {
        toolbox.appendChild(section);
      }
    }
    Object.keys(stored).forEach(name => {
      let def = stored[name];
      if (window.upgradeICDefinition) {
        def = window.upgradeICDefinition(def, name);
        stored[name] = def;
      }
      customICs[name] = def;
      const actualInputs = def.inputs + (def.strictTTL ? 2 : 0);
      COMPONENT_DEFS[`custom-ic-${name}`] = { 
        inputs: actualInputs, 
        outputs: def.outputs, 
        label: name, 
        category: 'Custom ICs', 
        data: { icName: name } 
      };
    });
    localStorage.setItem('logicQuest_ics', JSON.stringify(stored));
    if (section) {
      const container = section.querySelector('.toolbox-items');
      if (container) {
        container.innerHTML = '';
        Object.keys(stored).forEach(name => {
          const item = document.createElement('div');
          item.className = 'toolbox-item';
          item.dataset.type = `custom-ic-${name}`;
          item.innerHTML = `<span>${name}</span>`;
          container.appendChild(item);
          if (typeof setupToolboxItem === 'function') setupToolboxItem(item);
        });
      }
    }
  } catch (e) { /* ignore corrupt data */ }
}

function createICFromSelection(name) {
  const nodeIds = selectedNodeIds;
  const idSet = new Set(nodeIds);
  const internalNodes = sandboxNodes.filter(n => idSet.has(n.id));
  const internalWires = sandboxWires.filter(w => idSet.has(w.fromNodeId) && idSet.has(w.toNodeId));
  const externalWires = sandboxWires.filter(w => idSet.has(w.fromNodeId) !== idSet.has(w.toNodeId));
  const inputPortNodeIds = [];
  const outputPortNodeIds = [];
  externalWires.forEach(w => {
    if (idSet.has(w.toNodeId) && !idSet.has(w.fromNodeId)) {
      if (!inputPortNodeIds.includes(w.toNodeId)) inputPortNodeIds.push(w.toNodeId);
    }
    if (idSet.has(w.fromNodeId) && !idSet.has(w.toNodeId)) {
      if (!outputPortNodeIds.includes(w.fromNodeId)) outputPortNodeIds.push(w.fromNodeId);
    }
  });
  const inputs = inputPortNodeIds.length;
  const outputs = outputPortNodeIds.length;
  if (inputs === 0 && outputs === 0) {
    showAlert('Selected circuit has no external connections. All nodes and wires are fully internal ΓÇö nothing to expose as ports.', 'No Ports Found');
    return;
  }
  const allICs = JSON.parse(localStorage.getItem('logicQuest_ics') || '{}');
  if (allICs[name]) {
    showConfirm(`Overwrite existing IC "${name}"?`, (r) => {
      if (r) doSaveIC(name, internalNodes, internalWires, inputPortNodeIds, outputPortNodeIds, inputs, outputs, allICs);
    });
    return;
  }
  doSaveIC(name, internalNodes, internalWires, inputPortNodeIds, outputPortNodeIds, inputs, outputs, allICs);
}

function doSaveIC(name, internalNodes, internalWires, inputPortNodeIds, outputPortNodeIds, inputs, outputs, allICs) {
  const cleanNodes = internalNodes.map(n => ({
    id: n.id, type: n.type, label: n.label, x: n.x, y: n.y,
    inputsCount: n.inputsCount, outputsCount: n.outputsCount,
    outputState: 0, outputState2: 0, inputValues: Array(n.inputsCount).fill(0),
    prevClockState: 0, labelText: n.labelText || '', data: n.data ? { ...n.data } : {}
  }));
  const inputSet = new Set(inputPortNodeIds);
  const outputSet = new Set(outputPortNodeIds);
  const gap = 45;
  const inX = 30, outX = 200, midX = 115;
  let inIdx = 0, outIdx = 0, midIdx = 0;
  cleanNodes.forEach(n => {
    if (inputSet.has(n.id)) {
      n.x = inX; n.y = 30 + inIdx++ * gap;
    } else if (outputSet.has(n.id)) {
      n.x = outX; n.y = 30 + outIdx++ * gap;
    } else {
      n.x = midX; n.y = 30 + midIdx++ * gap;
    }
  });
  const cleanWires = internalWires.map(w => ({ fromNodeId: w.fromNodeId, fromPortIdx: w.fromPortIdx, toNodeId: w.toNodeId, toPortIdx: w.toPortIdx }));
  const icDef = { nodes: cleanNodes, wires: cleanWires, inputPorts: inputPortNodeIds, outputPorts: outputPortNodeIds, inputs, outputs };
  allICs[name] = icDef;
  localStorage.setItem('logicQuest_ics', JSON.stringify(allICs));
  customICs[name] = icDef;
  COMPONENT_DEFS[`custom-ic-${name}`] = { inputs, outputs, label: name, category: 'Custom ICs', data: { icName: name } };
  const container = document.querySelector('.toolbox-section[data-category="Custom ICs"] .toolbox-items');
  if (container) {
    const item = document.createElement('div');
    item.className = 'toolbox-item';
    item.dataset.type = `custom-ic-${name}`;
    item.innerHTML = `<span>${name}</span>`;
    container.appendChild(item);
    if (typeof setupToolboxItem === 'function') setupToolboxItem(item);
  }
  replaceSelectedWithIC(name, inputs, outputs, inputPortNodeIds, outputPortNodeIds);
  deselectAllNodes();
  playSound('success');
  showToast(`IC "${name}" created Γ£ô`);
}

function replaceSelectedWithIC(icName, inputs, outputs, inputPortNodeIds, outputPortNodeIds) {
  const nodeIds = selectedNodeIds;
  const idSet = new Set(nodeIds);
  const externalWires = sandboxWires.filter(w => idSet.has(w.fromNodeId) !== idSet.has(w.toNodeId));
  const avgX = Math.round(sandboxNodes.filter(n => idSet.has(n.id)).reduce((s, n) => s + n.x, 0) / nodeIds.length);
  const avgY = Math.round(sandboxNodes.filter(n => idSet.has(n.id)).reduce((s, n) => s + n.y, 0) / nodeIds.length);
  nodeIds.forEach(id => {
    document.getElementById(id)?.remove();
    sandboxNodes = sandboxNodes.filter(n => n.id !== id);
  });
  sandboxWires = sandboxWires.filter(w => !idSet.has(w.fromNodeId) && !idSet.has(w.toNodeId));
  const icNode = {
    id: `sb-node-${nextNodeId++}`, type: `custom-ic-${icName}`,
    label: icName, x: avgX, y: avgY,
    inputsCount: inputs, outputsCount: outputs,
    outputState: 0, outputState2: 0,
    inputValues: Array(inputs).fill(0), prevClockState: 0, labelText: '',
    data: { icName }
  };
  sandboxNodes.push(icNode);
  renderNodeDOM(icNode);
  externalWires.forEach(w => {
    const newWire = { fromNodeId: '', fromPortIdx: w.fromPortIdx, toNodeId: '', toPortIdx: w.toPortIdx };
    if (idSet.has(w.fromNodeId)) {
      newWire.fromNodeId = icNode.id;
      newWire.fromPortIdx = outputPortNodeIds ? outputPortNodeIds.indexOf(w.fromNodeId) : 0;
      if (newWire.fromPortIdx < 0) newWire.fromPortIdx = 0;
    } else {
      newWire.fromNodeId = w.fromNodeId;
      newWire.fromPortIdx = w.fromPortIdx;
    }
    if (idSet.has(w.toNodeId)) {
      newWire.toNodeId = icNode.id;
      newWire.toPortIdx = inputPortNodeIds ? inputPortNodeIds.indexOf(w.toNodeId) : 0;
      if (newWire.toPortIdx < 0) newWire.toPortIdx = 0;
    } else {
      newWire.toNodeId = w.toNodeId;
      newWire.toPortIdx = w.toPortIdx;
    }
    if (newWire.fromNodeId && newWire.toNodeId) sandboxWires.push(newWire);
  });
  cancelWiring();
  evaluateSandbox();
}

function clearSandbox() {
  sandboxNodes.forEach(n => document.getElementById(n.id)?.remove());
  sandboxNodes = [];
  sandboxWires = [];
  nextNodeId = 1;
  clockTick = 0;
  selectedNodeId = null;
  selectedNodeIds = [];
  cancelWiring();
  if (wiresSvg) wiresSvg.innerHTML = '';
}
function saveCircuitToLocal(name) {
  const stored = JSON.parse(localStorage.getItem('logicQuest_circuits') || '{}');
  stored[name] = serializeLayout();
  localStorage.setItem('logicQuest_circuits', JSON.stringify(stored));
}

function loadCircuitFromLocal(name) {
  const stored = JSON.parse(localStorage.getItem('logicQuest_circuits') || '{}');
  if (stored[name]) importLayout(stored[name]);
}

function deleteCircuitFromLocal(name) {
  const stored = JSON.parse(localStorage.getItem('logicQuest_circuits') || '{}');
  delete stored[name];
  localStorage.setItem('logicQuest_circuits', JSON.stringify(stored));
}

function renderSavedCircuitsList() {
  const list = document.getElementById('saved-circuits-list');
  if (!list) return;
  list.innerHTML = '';

  const stored = JSON.parse(localStorage.getItem('logicQuest_circuits') || '{}');
  const names = Object.keys(stored);

  if (names.length === 0) {
    list.innerHTML = '<div style="padding:1rem;color:var(--text-muted);text-align:center;font-size:0.9rem;">No saved circuits.</div>';
    return;
  }

  names.forEach(name => {
    const row = document.createElement('div');
    row.className = 'saved-circuit-row';

    const nameBtn = document.createElement('span');
    nameBtn.className = 'saved-circuit-name';
    nameBtn.innerText = name;
    nameBtn.addEventListener('click', () => {
      loadCircuitFromLocal(name);
      document.getElementById('load-modal').style.display = 'none';
      playSound('success');
      showToast(`Loaded "${name}" Γ£ô`);
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'saved-circuit-delete';
    delBtn.innerHTML = '&times;';
    delBtn.addEventListener('click', () => {
      showConfirm(`Delete "${name}"?`, (r) => {
        if (r) {
          deleteCircuitFromLocal(name);
          renderSavedCircuitsList();
          playSound('click');
        }
      });
    });

    row.appendChild(nameBtn);
    row.appendChild(delBtn);
    list.appendChild(row);
  });
}
function serializeLayout() {
  return {
    version: 2,
    nextNodeId: nextNodeId,
    nodes: sandboxNodes.map(n => ({ ...n })),
    wires: sandboxWires.map(w => ({ ...w })),
  };
}

function importLayout(layout) {
  clearSandbox();
  const nodes = layout.nodes || [];
  const wires = layout.wires || [];
  nextNodeId = layout.nextNodeId || (nodes.length + 1);
  nodes.forEach(n => {
    const def = COMPONENT_DEFS[n.type];
    if (!def) return;
    n.outputsCount = n.outputsCount ?? def.outputs;
    n.outputState2 = n.outputState2 ?? 0;
    n.inputValues = n.inputValues ?? Array(n.inputsCount).fill(0);
    n.data = n.data ?? (def.data ? { ...def.data } : {});
    sandboxNodes.push(n);
    renderNodeDOM(n);
  });

  sandboxWires = wires;
  evaluateSandbox();
}

function exportCircuitJSON() {
  const data = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(serializeLayout(), null, 2));
  const a = document.createElement('a');
  a.href = data;
  a.download = 'logicquest_circuit.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
const showToast = window.showToast;
const halfAdderSvg = `
<svg viewBox="0 0 400 220" width="100%" height="220" class="is-box">
  <text x="30" y="55" fill="var(--text-primary)" font-family="var(--font-mono)" font-weight="700">A</text>
  <text x="30" y="165" fill="var(--text-primary)" font-family="var(--font-mono)" font-weight="700">B</text>

  
  <g transform="translate(180, 20)">
    <rect x="0" y="10" width="80" height="50" rx="6" fill="var(--bg-secondary)" stroke="var(--text-primary)" stroke-width="2"/>
    <text x="40" y="40" dominant-baseline="middle" text-anchor="middle" fill="var(--text-primary)" font-family="var(--font-header)" font-weight="700">XOR</text>
  </g>

  
  <g transform="translate(180, 130)">
    <rect x="0" y="10" width="80" height="50" rx="6" fill="var(--bg-secondary)" stroke="var(--text-primary)" stroke-width="2"/>
    <text x="40" y="40" dominant-baseline="middle" text-anchor="middle" fill="var(--text-primary)" font-family="var(--font-header)" font-weight="700">AND</text>
  </g>

  <text x="320" y="55" fill="var(--text-primary)" font-family="var(--font-header)" font-weight="700">Sum (S)</text>
  <text x="320" y="165" fill="var(--text-primary)" font-family="var(--font-header)" font-weight="700">Carry (C)</text>

  <path d="M 45 55 L 180 45" fill="none" stroke="var(--text-secondary)" stroke-width="2" />
  <path d="M 45 165 L 120 165 L 120 65 L 180 65" fill="none" stroke="var(--text-secondary)" stroke-width="2" />
  <path d="M 90 55 L 90 145 L 180 145" fill="none" stroke="var(--text-secondary)" stroke-width="2" />
  <path d="M 45 165 L 180 165" fill="none" stroke="var(--text-secondary)" stroke-width="2" />

  <circle cx="90" cy="55" r="3" fill="var(--text-primary)"/>
  <circle cx="120" cy="165" r="3" fill="var(--text-primary)"/>

  <path d="M 260 55 L 310 55" fill="none" stroke="var(--text-secondary)" stroke-width="2" />
  <path d="M 260 165 L 310 165" fill="none" stroke="var(--text-secondary)" stroke-width="2" />
</svg>
`;

const fullAdderSvg = `
<svg viewBox="0 0 540 280" width="100%" height="280" class="is-box">
  <text x="25" y="55" fill="var(--text-primary)" font-family="var(--font-mono)" font-weight="700">A</text>
  <text x="25" y="105" fill="var(--text-primary)" font-family="var(--font-mono)" font-weight="700">B</text>
  <text x="25" y="215" fill="var(--text-primary)" font-family="var(--font-mono)" font-weight="700">Cin</text>

  <g transform="translate(100, 25)">
    <rect x="0" y="0" width="120" height="110" rx="6" fill="var(--bg-secondary)" stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="4,4"/>
    <text x="60" y="20" text-anchor="middle" fill="var(--text-muted)" font-family="var(--font-header)" font-size="0.75rem" font-weight="700">Half Adder 1</text>
    <rect x="20" y="30" width="80" height="30" rx="4" fill="var(--bg-primary)" stroke="var(--text-primary)" stroke-width="1.5"/>
    <text x="60" y="45" dominant-baseline="middle" text-anchor="middle" fill="var(--text-primary)" font-family="var(--font-header)" font-size="0.75rem" font-weight="700">XOR 1</text>
    <rect x="20" y="70" width="80" height="30" rx="4" fill="var(--bg-primary)" stroke="var(--text-primary)" stroke-width="1.5"/>
    <text x="60" y="85" dominant-baseline="middle" text-anchor="middle" fill="var(--text-primary)" font-family="var(--font-header)" font-size="0.75rem" font-weight="700">AND 1</text>
  </g>

  <g transform="translate(280, 85)">
    <rect x="0" y="0" width="120" height="110" rx="6" fill="var(--bg-secondary)" stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="4,4"/>
    <text x="60" y="20" text-anchor="middle" fill="var(--text-muted)" font-family="var(--font-header)" font-size="0.75rem" font-weight="700">Half Adder 2</text>
    <rect x="20" y="30" width="80" height="30" rx="4" fill="var(--bg-primary)" stroke="var(--text-primary)" stroke-width="1.5"/>
    <text x="60" y="45" dominant-baseline="middle" text-anchor="middle" fill="var(--text-primary)" font-family="var(--font-header)" font-size="0.75rem" font-weight="700">XOR 2</text>
    <rect x="20" y="70" width="80" height="30" rx="4" fill="var(--bg-primary)" stroke="var(--text-primary)" stroke-width="1.5"/>
    <text x="60" y="85" dominant-baseline="middle" text-anchor="middle" fill="var(--text-primary)" font-family="var(--font-header)" font-size="0.75rem" font-weight="700">AND 2</text>
  </g>

  <g transform="translate(430, 185)">
    <rect x="0" y="0" width="70" height="40" rx="4" fill="var(--bg-secondary)" stroke="var(--text-primary)" stroke-width="1.5"/>
    <text x="35" y="20" dominant-baseline="middle" text-anchor="middle" fill="var(--text-primary)" font-family="var(--font-header)" font-size="0.75rem" font-weight="700">OR</text>
  </g>

  <text x="440" y="135" fill="var(--text-primary)" font-family="var(--font-header)" font-weight="700">Sum (S)</text>
  <text x="515" y="205" fill="var(--text-primary)" font-family="var(--font-header)" font-weight="700">Cout</text>

  <path d="M 40 55 L 120 55" fill="none" stroke="var(--text-secondary)" stroke-width="1.5"/>
  <path d="M 40 105 L 120 105" fill="none" stroke="var(--text-secondary)" stroke-width="1.5"/>

  <path d="M 55 55 L 55 95 L 120 95" fill="none" stroke="var(--text-secondary)" stroke-width="1.5"/>
  <path d="M 70 105 L 70 115 L 120 115" fill="none" stroke="var(--text-secondary)" stroke-width="1.5"/>
  <circle cx="55" cy="55" r="2.5" fill="var(--text-primary)"/>
  <circle cx="70" cy="105" r="2.5" fill="var(--text-primary)"/>

  <path d="M 200 70 L 250 70 L 250 135 L 300 135" fill="none" stroke="var(--text-secondary)" stroke-width="1.5"/>
  <path d="M 40 215 L 265 215 L 265 175 L 300 175" fill="none" stroke="var(--text-secondary)" stroke-width="1.5"/>
  <path d="M 265 175 L 265 195 L 300 195" fill="none" stroke="var(--text-secondary)" stroke-width="1.5"/>
  <circle cx="265" cy="175" r="2.5" fill="var(--text-primary)"/>

  <path d="M 250 135 L 250 155 L 300 155" fill="none" stroke="var(--text-secondary)" stroke-width="1.5"/>
  <circle cx="250" cy="135" r="2.5" fill="var(--text-primary)"/>

  <path d="M 380 130 L 430 130" fill="none" stroke="var(--text-secondary)" stroke-width="1.5"/>

  <path d="M 200 110 L 225 110 L 225 245 L 390 245 L 390 200 L 430 200" fill="none" stroke="var(--text-secondary)" stroke-width="1.5"/>
  <path d="M 380 170 L 410 170 L 410 210 L 430 210" fill="none" stroke="var(--text-secondary)" stroke-width="1.5"/>

  <path d="M 500 205 L 510 205" fill="none" stroke="var(--text-secondary)" stroke-width="1.5"/>
</svg>
`;

const dFlopTimingSvg = `
<div style="display:flex; flex-direction:column; gap:0.5rem; width:100%; align-items:center;">
  <svg viewBox="0 0 400 160" width="100%" height="160" class="is-box">
    
    <text x="15" y="35" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="0.75rem" font-weight="700">CLK</text>
    <path d="M 50 35 L 100 35 L 100 15 L 150 15 L 150 35 L 200 35 L 200 15 L 250 15 L 250 35 L 300 35 L 300 15 L 350 15" fill="none" stroke="var(--text-primary)" stroke-width="2"/>
    
    <path d="M 100 30 L 100 18 L 97 22 M 100 18 L 103 22" fill="none" stroke="var(--color-cyan)" stroke-width="1.5"/>
    <path d="M 200 30 L 200 18 L 197 22 M 200 18 L 203 22" fill="none" stroke="var(--color-cyan)" stroke-width="1.5"/>
    <path d="M 300 30 L 300 18 L 297 22 M 300 18 L 303 22" fill="none" stroke="var(--color-cyan)" stroke-width="1.5"/>

    
    <text x="15" y="85" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="0.75rem" font-weight="700">D</text>
    <path d="M 50 90 L 130 90 L 130 65 L 230 65 L 230 90 L 350 90" fill="none" stroke="var(--text-secondary)" stroke-width="2"/>

    
    <text x="15" y="135" fill="var(--text-secondary)" font-family="var(--font-mono)" font-size="0.75rem" font-weight="700">Q</text>
    
    <path d="M 50 140 L 200 140 L 200 115 L 300 115 L 300 140 L 350 140" fill="none" stroke="var(--color-success)" stroke-width="2"/>

    
    <line x1="100" y1="15" x2="100" y2="145" stroke="var(--border-color)" stroke-dasharray="3,3"/>
    <line x1="200" y1="15" x2="200" y2="145" stroke="var(--border-color)" stroke-dasharray="3,3"/>
    <line x1="300" y1="15" x2="300" y2="145" stroke="var(--border-color)" stroke-dasharray="3,3"/>
  </svg>
  <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.25rem; line-height:1.4; text-align:center;">
    A <strong>D Flip-Flop</strong> captures the state of the Data input (D) only on the <strong>rising edge</strong> of the Clock signal (CLK transition 0 to 1, highlighted in <span class="is-text-cyan">cyan</span>). Output (Q) holds this state until next rising edge.
  </p>
</div>
`;

const sevenSegMapHtml = `
<div style="display:flex; flex-direction:column; gap:0.75rem; width:100%; max-height:280px; overflow-y:auto; padding-right:5px; text-align:left;">
  <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.4; margin-bottom: 0.5rem;">
    Decodes 4-bit binary inputs (D3-D0) to display hexadecimal digits <strong>0</strong> to <strong>F</strong>. Active segments (a-g) mapping:
  </p>
  <table style="width:100%; border-collapse:collapse; font-size:0.78rem; text-align:center;">
    <thead>
      <tr style="border-bottom:2px solid var(--border-color); background:var(--bg-tertiary);">
        <th class="is-p4">Hex</th>
        <th class="is-p4">Binary</th>
        <th class="is-p4">Segments</th>
      </tr>
    </thead>
    <tbody>
      <tr class="is-border-b"><td class="is-p4-bold">0</td><td class="is-p4">0000</td><td class="is-p4-success">a, b, c, d, e, f</td></tr>
      <tr class="is-border-b"><td class="is-p4-bold">1</td><td class="is-p4">0001</td><td class="is-p4-success">b, c</td></tr>
      <tr class="is-border-b"><td class="is-p4-bold">2</td><td class="is-p4">0010</td><td class="is-p4-success">a, b, d, e, g</td></tr>
      <tr class="is-border-b"><td class="is-p4-bold">3</td><td class="is-p4">0011</td><td class="is-p4-success">a, b, c, d, g</td></tr>
      <tr class="is-border-b"><td class="is-p4-bold">4</td><td class="is-p4">0100</td><td class="is-p4-success">b, c, f, g</td></tr>
      <tr class="is-border-b"><td class="is-p4-bold">5</td><td class="is-p4">0101</td><td class="is-p4-success">a, c, d, f, g</td></tr>
      <tr class="is-border-b"><td class="is-p4-bold">6</td><td class="is-p4">0110</td><td class="is-p4-success">a, c, d, e, f, g</td></tr>
      <tr class="is-border-b"><td class="is-p4-bold">7</td><td class="is-p4">0111</td><td class="is-p4-success">a, b, c</td></tr>
      <tr class="is-border-b"><td class="is-p4-bold">8</td><td class="is-p4">1000</td><td class="is-p4-success">a, b, c, d, e, f, g</td></tr>
      <tr class="is-border-b"><td class="is-p4-bold">9</td><td class="is-p4">1001</td><td class="is-p4-success">a, b, c, d, f, g</td></tr>
      <tr class="is-border-b"><td class="is-p4-bold">A</td><td class="is-p4">1010</td><td class="is-p4-success">a, b, c, e, f, g</td></tr>
      <tr class="is-border-b"><td class="is-p4-bold">b</td><td class="is-p4">1011</td><td class="is-p4-success">c, d, e, f, g</td></tr>
      <tr class="is-border-b"><td class="is-p4-bold">C</td><td class="is-p4">1100</td><td class="is-p4-success">a, d, e, f</td></tr>
      <tr class="is-border-b"><td class="is-p4-bold">d</td><td class="is-p4">1101</td><td class="is-p4-success">b, c, d, e, g</td></tr>
      <tr class="is-border-b"><td class="is-p4-bold">E</td><td class="is-p4">1110</td><td class="is-p4-success">a, d, e, f, g</td></tr>
      <tr class="is-border-b"><td class="is-p4-bold">F</td><td class="is-p4">1111</td><td class="is-p4-success">a, e, f, g</td></tr>
    </tbody>
  </table>
</div>
`;

function openLogicViewer(type) {
  const modal = document.getElementById('logic-modal');
  const title = document.getElementById('logic-modal-title');
  const content = document.getElementById('logic-modal-content');
  if (!modal || !title || !content) return;

  playSound('click');
  if (type === 'half-adder') {
    title.innerText = 'Half Adder Internal Logic';
    content.innerHTML = halfAdderSvg;
  } else if (type === 'full-adder') {
    title.innerText = 'Full Adder Internal Logic';
    content.innerHTML = fullAdderSvg;
  } else if (type === 'd-flop') {
    title.innerText = 'D Flip-Flop Timing Behavior';
    content.innerHTML = dFlopTimingSvg;
  } else if (type === 'seven-seg') {
    title.innerText = '7-Segment Display Decoding Map';
    content.innerHTML = sevenSegMapHtml;
  }
  modal.style.display = 'flex';
}

document.getElementById('close-logic-modal')?.addEventListener('click', () => {
  playSound('click');
  document.getElementById('logic-modal').style.display = 'none';
});
document.getElementById('logic-modal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('logic-modal')) {
    document.getElementById('logic-modal').style.display = 'none';
  }
});
const CIRCUIT_TEMPLATES = {
  'not-demo': {
    version: 2, nextNodeId: 4,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Toggle Switch', x: 80, y: 160, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'not', label: 'NOT Gate', x: 280, y: 155, inputsCount: 1, outputsCount: 1, outputState: 1, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'output', label: 'LED Light', x: 480, y: 145, inputsCount: 1, outputsCount: 0, outputState: 1, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-2', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
    ]
  },

  'and-demo': {
    version: 2, nextNodeId: 5,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Switch A', x: 70, y: 100, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Switch B', x: 70, y: 230, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'and', label: 'AND Gate', x: 280, y: 155, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'output', label: 'LED Light', x: 490, y: 145, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
    ]
  },

  'xor-parity': {
    version: 2, nextNodeId: 8,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Bit A', x: 60, y: 60, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Bit B', x: 60, y: 190, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'input', label: 'Bit C', x: 60, y: 320, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'xor', label: 'XOR 1', x: 270, y: 110, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-5', type: 'xor', label: 'XOR 2', x: 460, y: 190, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-6', type: 'output', label: 'Parity LED', x: 660, y: 175, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 1 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 1 },
      { fromNodeId: 'sb-node-5', fromPortIdx: 0, toNodeId: 'sb-node-6', toPortIdx: 0 },
    ]
  },

  'sr-latch': {
    version: 2, nextNodeId: 7,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Set (S)', x: 60, y: 100, inputsCount: 0, outputsCount: 1, outputState: 1, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Reset (R)', x: 60, y: 270, inputsCount: 0, outputsCount: 1, outputState: 1, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'nand', label: 'NAND 1', x: 280, y: 95, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'nand', label: 'NAND 2', x: 280, y: 255, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-5', type: 'output', label: 'Q', x: 490, y: 80, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-6', type: 'output', label: 'Q\'', x: 490, y: 265, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-6', toPortIdx: 0 },
    ]
  },

  'half-adder-demo': {
    version: 2, nextNodeId: 7,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Bit A', x: 60, y: 100, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Bit B', x: 60, y: 250, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'xor', label: 'XOR (Sum)', x: 270, y: 95, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'and', label: 'AND (Carry)', x: 270, y: 240, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-5', type: 'output', label: 'Sum (S)', x: 480, y: 80, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-6', type: 'output', label: 'Carry (C)', x: 480, y: 250, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 1 },
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-6', toPortIdx: 0 },
    ]
  },

  'full-adder-gate': {
    version: 2, nextNodeId: 11,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Switch A', x: 60, y: 60, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Switch B', x: 60, y: 180, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'input', label: 'Switch Cin', x: 60, y: 300, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'xor', label: 'XOR 1', x: 240, y: 100, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-5', type: 'and', label: 'AND 1', x: 240, y: 220, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-6', type: 'and', label: 'AND 2', x: 420, y: 320, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-7', type: 'xor', label: 'XOR 2', x: 420, y: 200, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-8', type: 'or', label: 'OR 1', x: 580, y: 280, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-9', type: 'output', label: 'Sum (S)', x: 660, y: 180, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-10', type: 'output', label: 'Carry (Cout)', x: 740, y: 280, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 1 },
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 1 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-7', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-7', toPortIdx: 1 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-6', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-6', toPortIdx: 1 },
      { fromNodeId: 'sb-node-5', fromPortIdx: 0, toNodeId: 'sb-node-8', toPortIdx: 0 },
      { fromNodeId: 'sb-node-6', fromPortIdx: 0, toNodeId: 'sb-node-8', toPortIdx: 1 },
      { fromNodeId: 'sb-node-7', fromPortIdx: 0, toNodeId: 'sb-node-9', toPortIdx: 0 },
      { fromNodeId: 'sb-node-8', fromPortIdx: 0, toNodeId: 'sb-node-10', toPortIdx: 0 },
    ]
  },

  'nand-universality-and': {
    version: 2, nextNodeId: 6,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Switch A', x: 60, y: 100, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Switch B', x: 60, y: 240, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'nand', label: 'NAND 1', x: 240, y: 160, inputsCount: 2, outputsCount: 1, outputState: 1, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'nand', label: 'NAND 2 (NOT)', x: 420, y: 160, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [1, 1], prevClockState: 0, labelText: '' },
      { id: 'sb-node-5', type: 'output', label: 'AND Output', x: 580, y: 150, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 1 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
    ]
  },

  'd-flipflop-reg': {
    version: 2, nextNodeId: 5,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Data (D)', x: 60, y: 100, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'clock', label: 'CLK Clock', x: 60, y: 240, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'd-flop', label: 'D Flip-Flop', x: 260, y: 160, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'output', label: 'Q LED', x: 460, y: 150, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
    ]
  },

  'seven-seg-decoder-demo': {
    version: 2, nextNodeId: 6,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'D3 (MSB)', x: 60, y: 60, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'D2', x: 60, y: 160, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'input', label: 'D1', x: 60, y: 260, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'input', label: 'D0 (LSB)', x: 60, y: 360, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-5', type: 'seven-seg', label: '7-Segment', x: 300, y: 170, inputsCount: 4, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0, 0, 0, 0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 3 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 2 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 1 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
    ]
  },
  'or-gate-demo': {
    version: 2, nextNodeId: 5,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Switch A', x: 70, y: 100, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Switch B', x: 70, y: 230, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'or', label: 'OR Gate', x: 280, y: 155, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'output', label: 'LED Light', x: 490, y: 145, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
    ]
  },

  'nor-gate-demo': {
    version: 2, nextNodeId: 5,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Switch A', x: 70, y: 100, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Switch B', x: 70, y: 230, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'nor', label: 'NOR Gate', x: 280, y: 155, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'output', label: 'LED Light', x: 490, y: 145, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
    ]
  },

  'xnor-equality': {
    version: 2, nextNodeId: 5,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Value A', x: 70, y: 100, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Value B', x: 70, y: 230, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'xnor', label: 'XNOR Equal', x: 280, y: 155, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'output', label: '= Equal LED', x: 490, y: 145, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
    ]
  },
  'majority-gate': {
    version: 2, nextNodeId: 10,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Voter A', x: 60, y: 60, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Voter B', x: 60, y: 190, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'input', label: 'Voter C', x: 60, y: 320, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'and', label: 'AND AB', x: 250, y: 80, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-5', type: 'and', label: 'AND BC', x: 250, y: 200, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-6', type: 'and', label: 'AND AC', x: 250, y: 320, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-7', type: 'or', label: 'OR 1', x: 440, y: 120, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-8', type: 'or', label: 'OR 2', x: 590, y: 200, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-9', type: 'output', label: 'Majority', x: 750, y: 185, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 1 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 1 },
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-6', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-6', toPortIdx: 1 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-7', toPortIdx: 0 },
      { fromNodeId: 'sb-node-5', fromPortIdx: 0, toNodeId: 'sb-node-7', toPortIdx: 1 },
      { fromNodeId: 'sb-node-7', fromPortIdx: 0, toNodeId: 'sb-node-8', toPortIdx: 0 },
      { fromNodeId: 'sb-node-6', fromPortIdx: 0, toNodeId: 'sb-node-8', toPortIdx: 1 },
      { fromNodeId: 'sb-node-8', fromPortIdx: 0, toNodeId: 'sb-node-9', toPortIdx: 0 },
    ]
  },
  'nor-sr-latch': {
    version: 2, nextNodeId: 7,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Set (S)', x: 60, y: 100, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Reset (R)', x: 60, y: 270, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'nor', label: 'NOR 1', x: 280, y: 95, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'nor', label: 'NOR 2', x: 280, y: 255, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-5', type: 'output', label: 'Q', x: 490, y: 80, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-6', type: 'output', label: 'Q\'', x: 490, y: 265, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 1 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-6', toPortIdx: 0 },
    ]
  },
  'alarm-circuit': {
    version: 2, nextNodeId: 7,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Sensor A', x: 60, y: 100, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Sensor B', x: 60, y: 230, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'or', label: 'OR Gate', x: 260, y: 155, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'output', label: 'Alert LED', x: 440, y: 110, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-5', type: 'buzzer', label: 'Buzzer', x: 440, y: 200, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
    ]
  },

  'rgb-color-mixer': {
    version: 2, nextNodeId: 6,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Red Ctrl', x: 60, y: 80, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Green Ctrl', x: 60, y: 200, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'input', label: 'Blue Ctrl', x: 60, y: 320, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'rgb-led', label: 'RGB LED', x: 280, y: 180, inputsCount: 3, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0, 0, 0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 2 },
    ]
  },

  'led-binary-display': {
    version: 2, nextNodeId: 6,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Bit D3', x: 60, y: 60, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Bit D2', x: 60, y: 160, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'input', label: 'Bit D1', x: 60, y: 260, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'input', label: 'Bit D0', x: 60, y: 360, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-5', type: 'led-bar', label: 'LED Bar', x: 280, y: 185, inputsCount: 4, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0, 0, 0, 0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 3 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 2 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 1 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
    ]
  },

  'and-alarm': {
    version: 2, nextNodeId: 7,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Security A', x: 60, y: 100, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Security B', x: 60, y: 230, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'and', label: 'AND Guard', x: 260, y: 155, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'output', label: 'Alert LED', x: 450, y: 100, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-5', type: 'buzzer', label: 'Alarm', x: 450, y: 200, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
    ]
  },

  'multi-led-and': {
    version: 2, nextNodeId: 10,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Switch A', x: 60, y: 80, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'Switch B', x: 60, y: 210, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'and', label: 'AND', x: 250, y: 100, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'or', label: 'OR', x: 250, y: 230, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-5', type: 'xor', label: 'XOR', x: 250, y: 360, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-6', type: 'output', label: 'AND LED', x: 440, y: 90, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-7', type: 'output', label: 'OR LED', x: 440, y: 220, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-8', type: 'output', label: 'XOR LED', x: 440, y: 350, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 1 },
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 1 },
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-6', toPortIdx: 0 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-7', toPortIdx: 0 },
      { fromNodeId: 'sb-node-5', fromPortIdx: 0, toNodeId: 'sb-node-8', toPortIdx: 0 },
    ]
  },

  'clock-rgb-chase': {
    version: 2, nextNodeId: 10,
    nodes: [
      { id: 'sb-node-1', type: 'clock', label: 'CLK', x: 60, y: 150, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'not', label: 'NOT A', x: 240, y: 100, inputsCount: 1, outputsCount: 1, outputState: 1, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'not', label: 'NOT B', x: 240, y: 240, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-4', type: 'rgb-led', label: 'RGB LED', x: 430, y: 155, inputsCount: 3, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0, 0, 0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-2', toPortIdx: 0 },
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 2 },
    ]
  },

  'nand-not-gate': {
    version: 2, nextNodeId: 5,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'Switch A', x: 70, y: 155, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'nand', label: 'NAND (NOT)', x: 270, y: 150, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'output', label: 'NOT LED', x: 470, y: 140, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-2', toPortIdx: 0 },
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-2', toPortIdx: 1 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
    ]
  },
  'ohms-law': {
    version: 2, nextNodeId: 5,
    nodes: [
      { id: 'sb-node-1', type: 'battery', label: 'Battery (9V)', x: 70, y: 150, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { emf: 9 } },
      { id: 'sb-node-2', type: 'switch', label: 'Switch', x: 230, y: 150, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { closed: false } },
      { id: 'sb-node-3', type: 'resistor', label: 'Resistor', x: 390, y: 150, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { R: 10, current: 0, voltageDrop: 0 } },
      { id: 'sb-node-4', type: 'ammeter', label: 'Ammeter (A)', x: 550, y: 150, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { current: 0 } },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-2', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-1', toPortIdx: 0 },
    ]
  },

  'voltage-divider': {
    version: 2, nextNodeId: 6,
    nodes: [
      { id: 'sb-node-1', type: 'battery', label: 'Battery', x: 70, y: 120, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { emf: 12 } },
      { id: 'sb-node-2', type: 'switch', label: 'Switch', x: 70, y: 280, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { closed: false } },
      { id: 'sb-node-3', type: 'resistor', label: 'R1 (100╬⌐)', x: 250, y: 100, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { R: 100, current: 0, voltageDrop: 0 } },
      { id: 'sb-node-4', type: 'resistor', label: 'R2 (50╬⌐)', x: 250, y: 260, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { R: 50, current: 0, voltageDrop: 0 } },
      { id: 'sb-node-5', type: 'voltmeter', label: 'V out (R2)', x: 430, y: 180, inputsCount: 2, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { voltage: 0 } },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-2', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-1', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 1 },
    ]
  },

  'simple-bulb-circuit': {
    version: 2, nextNodeId: 5,
    nodes: [
      { id: 'sb-node-1', type: 'battery', label: 'Battery', x: 70, y: 150, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { emf: 9 } },
      { id: 'sb-node-2', type: 'switch', label: 'Switch', x: 230, y: 150, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { closed: false } },
      { id: 'sb-node-3', type: 'resistor', label: 'Resistor', x: 390, y: 150, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { R: 20, current: 0, voltageDrop: 0 } },
      { id: 'sb-node-4', type: 'bulb', label: 'Bulb', x: 550, y: 150, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { brightness: 0 } },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-2', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-1', toPortIdx: 0 },
    ]
  },
  'transistor-switch': {
    version: 2, nextNodeId: 6,
    nodes: [
      { id: 'sb-node-1', type: 'battery', label: 'Battery (9V)', x: 70, y: 100, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { emf: 9 } },
      { id: 'sb-node-2', type: 'switch', label: 'Base Switch', x: 230, y: 100, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { closed: false } },
      { id: 'sb-node-3', type: 'resistor', label: 'Base R (1k╬⌐)', x: 390, y: 100, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { R: 1000, current: 0, voltageDrop: 0 } },
      { id: 'sb-node-4', type: 'transistor', label: 'NPN Transistor', x: 100, y: 310, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { on: false } },
      { id: 'sb-node-5', type: 'led-elec', label: 'LED (Load)', x: 280, y: 310, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { on: false } },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-2', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-1', toPortIdx: 0 },
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
      { fromNodeId: 'sb-node-5', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
    ]
  },

  'transistor-controlled-bulb': {
    version: 2, nextNodeId: 6,
    nodes: [
      { id: 'sb-node-1', type: 'battery', label: 'Battery (12V)', x: 70, y: 100, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { emf: 12 } },
      { id: 'sb-node-2', type: 'resistor', label: 'Base R (500╬⌐)', x: 230, y: 100, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { R: 500, current: 0, voltageDrop: 0 } },
      { id: 'sb-node-3', type: 'transistor', label: 'NPN Transistor', x: 100, y: 290, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { on: false } },
      { id: 'sb-node-4', type: 'resistor', label: 'Load R (100╬⌐)', x: 270, y: 290, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { R: 100, current: 0, voltageDrop: 0 } },
      { id: 'sb-node-5', type: 'bulb', label: 'Bulb (Load)', x: 430, y: 290, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { brightness: 0 } },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-2', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-1', toPortIdx: 0 },
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
      { fromNodeId: 'sb-node-5', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
    ]
  },

  'diode-circuit': {
    version: 2, nextNodeId: 6,
    nodes: [
      { id: 'sb-node-1', type: 'battery', label: 'Battery (9V)', x: 60, y: 120, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { emf: 9 } },
      { id: 'sb-node-2', type: 'diode', label: 'Diode', x: 220, y: 120, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { forward: false, R: 0.1 } },
      { id: 'sb-node-3', type: 'resistor', label: 'Resistor (200╬⌐)', x: 370, y: 120, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { R: 200, current: 0, voltageDrop: 0 } },
      { id: 'sb-node-4', type: 'led-elec', label: 'LED', x: 520, y: 120, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { on: false } },
      { id: 'sb-node-5', type: 'switch', label: 'Switch', x: 60, y: 280, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { closed: false } },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-2', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
      { fromNodeId: 'sb-node-5', fromPortIdx: 0, toNodeId: 'sb-node-1', toPortIdx: 0 },
    ]
  },

  'ldr-divider': {
    version: 2, nextNodeId: 6,
    nodes: [
      { id: 'sb-node-1', type: 'battery', label: 'Battery (9V)', x: 60, y: 100, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { emf: 9 } },
      { id: 'sb-node-2', type: 'ldr', label: 'LDR (Sensor)', x: 220, y: 100, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { lightLevel: 50, R: 10000 } },
      { id: 'sb-node-3', type: 'resistor', label: 'Fixed R (1k╬⌐)', x: 370, y: 100, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { R: 1000, current: 0, voltageDrop: 0 } },
      { id: 'sb-node-4', type: 'bulb', label: 'Bulb', x: 520, y: 100, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { brightness: 0 } },
      { id: 'sb-node-5', type: 'switch', label: 'Switch', x: 60, y: 260, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { closed: false } },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-2', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
      { fromNodeId: 'sb-node-5', fromPortIdx: 0, toNodeId: 'sb-node-1', toPortIdx: 0 },
    ]
  },

  'capacitor-timing': {
    version: 2, nextNodeId: 6,
    nodes: [
      { id: 'sb-node-1', type: 'battery', label: 'Battery (9V)', x: 60, y: 100, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { emf: 9 } },
      { id: 'sb-node-2', type: 'capacitor', label: 'Capacitor (100┬╡F)', x: 220, y: 100, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { charge: 0, voltage: 0, capacitance: 100, maxVoltage: 12 } },
      { id: 'sb-node-3', type: 'resistor', label: 'Resistor (1k╬⌐)', x: 370, y: 100, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { R: 1000, current: 0, voltageDrop: 0 } },
      { id: 'sb-node-4', type: 'bulb', label: 'Bulb', x: 520, y: 100, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { brightness: 0 } },
      { id: 'sb-node-5', type: 'switch', label: 'Switch', x: 60, y: 260, inputsCount: 1, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { closed: false } },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-2', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
      { fromNodeId: 'sb-node-4', fromPortIdx: 0, toNodeId: 'sb-node-5', toPortIdx: 0 },
      { fromNodeId: 'sb-node-5', fromPortIdx: 0, toNodeId: 'sb-node-1', toPortIdx: 0 },
    ]
  },

  'op-amp-comparator': {
    version: 2, nextNodeId: 6,
    nodes: [
      { id: 'sb-node-1', type: 'input', label: 'V+ (Ref)', x: 60, y: 80, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-2', type: 'input', label: 'V- (Sense)', x: 60, y: 220, inputsCount: 0, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '' },
      { id: 'sb-node-3', type: 'op-amp', label: 'Op-Amp Comp', x: 260, y: 130, inputsCount: 2, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: [0, 0], prevClockState: 0, labelText: '', data: { vcc: 12, vee: -12 } },
      { id: 'sb-node-4', type: 'output', label: 'Output LED', x: 460, y: 120, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 0 },
      { fromNodeId: 'sb-node-2', fromPortIdx: 0, toNodeId: 'sb-node-3', toPortIdx: 1 },
      { fromNodeId: 'sb-node-3', fromPortIdx: 0, toNodeId: 'sb-node-4', toPortIdx: 0 },
    ]
  },
  'sensor-demo': {
    version: 2, nextNodeId: 4,
    nodes: [
      { id: 'sb-node-1', type: 'sensor', label: 'Sensor', x: 60, y: 140, inputsCount: 0, outputsCount: 1, outputState: 1, outputState2: 0, inputValues: [], prevClockState: 0, labelText: '', data: { value: 75, threshold: 50 } },
      { id: 'sb-node-2', type: 'output', label: 'Alert LED', x: 280, y: 130, inputsCount: 1, outputsCount: 0, outputState: 0, outputState2: 0, inputValues: [0], prevClockState: 0, labelText: '' },
    ],
    wires: [
      { fromNodeId: 'sb-node-1', fromPortIdx: 0, toNodeId: 'sb-node-2', toPortIdx: 0 },
    ]
  },
};
const TEMPLATE_THEORY = {
  'not-demo': {
    title: 'NOT Inverter Demo',
    theory: 'The NOT gate (also called an inverter) takes a single input and outputs its opposite state. It performs logic negation.',
    expression: 'Y = A\'  (or  Y = ┬¼A)',
    headers: ['Input A', 'Output Y'],
    truthTable: [
      [0, 1],
      [1, 0]
    ],
    challengeText: 'Toggle the input switch to <strong>1 (ON)</strong>. Notice how the inverter output swaps to 0 and turns the LED OFF!',
    checkPassed: () => {
      const inputs = sandboxNodes.filter(n => n.type === 'input');
      return inputs.length > 0 && inputs.some(n => n.outputState === 1);
    }
  },
  'and-demo': {
    title: 'AND Gate Verification',
    theory: 'The AND gate outputs 1 only when BOTH inputs are high (1). If any input is 0, the output remains low (0).',
    expression: 'Y = A ΓÇó B',
    headers: ['A', 'B', 'Output Y'],
    truthTable: [
      [0, 0, 0],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 1]
    ],
    challengeText: 'Toggle <strong>both Switch A and Switch B to 1 (ON)</strong> to let the high signal flow through the AND gate and light up the LED!',
    checkPassed: () => {
      const inputs = sandboxNodes.filter(n => n.type === 'input');
      return inputs.length >= 2 && inputs.every(n => n.outputState === 1);
    }
  },
  'xor-parity': {
    title: 'XOR 3-Bit Parity Checker',
    theory: 'An XOR gate acts as an odd detector. A cascaded XOR array counts the parity of inputs. If the count of high inputs is odd, the parity bit is 1.',
    expression: 'Y = A Γèò B Γèò C',
    headers: ['A', 'B', 'C', 'Parity Y'],
    truthTable: [
      [0, 0, 0, 0],
      [0, 0, 1, 1],
      [0, 1, 0, 1],
      [0, 1, 1, 0],
      [1, 0, 0, 1],
      [1, 0, 1, 0],
      [1, 1, 0, 0],
      [1, 1, 1, 1]
    ],
    challengeText: 'Set the switches so that <strong>exactly one or three switches</strong> are toggled ON. This will turn the Parity LED ON!',
    checkPassed: () => {
      const inputs = sandboxNodes.filter(n => n.type === 'input' && n.label.includes('Bit'));
      const activeCount = inputs.filter(n => n.outputState === 1).length;
      return activeCount === 1 || activeCount === 3;
    }
  },
  'sr-latch': {
    title: 'SR feedback Memory Latch',
    theory: 'A Set-Reset Latch stores 1 bit of memory using cross-coupled NAND gates. Set (S) and Reset (R) are active-low control inputs.',
    expression: 'Q = (S ΓÇó Q\')\'  |  Q\' = (R ΓÇó Q)\'',
    headers: ['S', 'R', 'Q (State)', 'Q\''],
    truthTable: [
      [1, 1, 'Hold State', 'No change'],
      [0, 1, 1, 0],
      [1, 0, 0, 1],
      [0, 0, 1, 1]
    ],
    challengeText: 'Toggle <strong>Set (S) to 0 (OFF)</strong> to trigger the Set state, then return Set (S) to 1. The Q LED must remain ON (memory hold)!',
    checkPassed: () => {
      const sSwitch = sandboxNodes.find(n => n.label && n.label.includes('Set'));
      const rSwitch = sandboxNodes.find(n => n.label && n.label.includes('Reset'));
      const qLed = sandboxNodes.find(n => n.label === 'Q');
      return sSwitch && sSwitch.outputState === 1 && rSwitch && rSwitch.outputState === 1 && qLed && qLed.outputState === 1;
    }
  },
  'half-adder-demo': {
    title: 'Half Adder Arithmetic',
    theory: 'A half adder performs single-digit binary addition. It outputs a Sum (S) using XOR and a Carry (C) using AND.',
    expression: 'S = A Γèò B  |  C = A ΓÇó B',
    headers: ['A', 'B', 'Sum (S)', 'Carry (C)'],
    truthTable: [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 0, 1, 0],
      [1, 1, 0, 1]
    ],
    challengeText: 'Toggle <strong>both input switches to 1 (ON)</strong> so that 1 + 1 = 10 in binary (Sum LED OFF, Carry LED ON).',
    checkPassed: () => {
      const inputs = sandboxNodes.filter(n => n.type === 'input');
      const sumLed = sandboxNodes.find(n => n.label && n.label.includes('Sum'));
      const carryLed = sandboxNodes.find(n => n.label && n.label.includes('Carry'));
      return inputs.length >= 2 && inputs.every(n => n.outputState === 1) && sumLed && sumLed.outputState === 0 && carryLed && carryLed.outputState === 1;
    }
  },
  'full-adder-gate': {
    title: 'Gate-Level Full Adder',
    theory: 'A Full Adder adds three bits: A, B, and a Carry-In (Cin) from a previous stage. It handles multi-bit addition.',
    expression: 'S = A Γèò B Γèò Cin  |  Cout = (AΓÇóB) + CinΓÇó(AΓèòB)',
    headers: ['A', 'B', 'Cin', 'Sum (S)', 'Cout'],
    truthTable: [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 0, 1],
      [1, 1, 0, 0, 1],
      [1, 1, 1, 1, 1]
    ],
    challengeText: 'Set <strong>Switch A, Switch B, and Switch Cin all to 1 (ON)</strong>. 1 + 1 + 1 = 3, which in binary is 11 (both Sum and Cout LEDs ON)!',
    checkPassed: () => {
      const inputs = sandboxNodes.filter(n => n.type === 'input');
      const sLed = sandboxNodes.find(n => n.label && n.label.includes('Sum'));
      const cLed = sandboxNodes.find(n => n.label && n.label.includes('Carry'));
      return inputs.length >= 3 && inputs.every(n => n.outputState === 1) && sLed && sLed.outputState === 1 && cLed && cLed.outputState === 1;
    }
  },
  'nand-universality-and': {
    title: 'NAND Universality (AND gate)',
    theory: 'The NAND gate is a universal gate. Here, a NAND gate is wired to a second NAND gate configured as an inverter, forming a standard AND gate.',
    expression: 'Y = ΓÄ╣ (A ΓÇó B) = A ΓÇó B',
    headers: ['A', 'B', 'NAND 1', 'AND Out'],
    truthTable: [
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [1, 0, 1, 0],
      [1, 1, 0, 1]
    ],
    challengeText: 'Set <strong>both inputs to 1 (ON)</strong>. The first NAND outputs 0, which is inverted by the second NAND to output 1 (LED ON)!',
    checkPassed: () => {
      const inputs = sandboxNodes.filter(n => n.type === 'input');
      const led = sandboxNodes.find(n => n.type === 'output');
      return inputs.length >= 2 && inputs.every(n => n.outputState === 1) && led && led.outputState === 1;
    }
  },
  'd-flipflop-reg': {
    title: '1-Bit D Flip-Flop Register',
    theory: 'A D Flip-Flop captures the level of the Data (D) input at the rising edge of the Clock (CLK) transition, and holds it.',
    expression: 'Q(next) = D  (at CLK Γåæ)',
    headers: ['D', 'CLK', 'State Q', 'Action'],
    truthTable: [
      [0, 'Γåæ', 0, 'Capture 0'],
      [1, 'Γåæ', 1, 'Capture 1'],
      ['X', '0 or 1', 'Hold', 'No change']
    ],
    challengeText: 'Toggle <strong>Data (D) to 1 (ON)</strong>, then wait for or click the Clock Signal to rise to 1 to capture and hold it (Q LED ON)!',
    checkPassed: () => {
      const dSwitch = sandboxNodes.find(n => n.label && n.label.includes('Data'));
      const qLed = sandboxNodes.find(n => n.label && n.label.includes('Q'));
      return dSwitch && dSwitch.outputState === 1 && qLed && qLed.outputState === 1;
    }
  },
  'seven-seg-decoder-demo': {
    title: '7-Segment Display Decoder',
    theory: 'Translates a 4-bit binary code (D3 MSB to D0 LSB) to drive the segments of a hexadecimal display (0 to F).',
    expression: 'Hex digit = D3 D2 D1 D0',
    headers: ['D3', 'D2', 'D1', 'D0', 'Hex digit'],
    truthTable: [
      [0, 0, 0, 0, '0'],
      [0, 1, 0, 1, '5'],
      [1, 0, 0, 1, '9'],
      [1, 0, 1, 0, 'A']
    ],
    challengeText: 'Input the binary code <strong>1010</strong> (D3=1, D2=0, D1=1, D0=0). This represents decimal 10, which should display character <strong>\'A\'</strong>!',
    checkPassed: () => {
      const segNode = sandboxNodes.find(n => n.type === 'seven-seg');
      return segNode && segNode.inputValues[3] === 1 && segNode.inputValues[2] === 0 && segNode.inputValues[1] === 1 && segNode.inputValues[0] === 0;
    }
  },
  'or-gate-demo': {
    title: 'OR Gate ΓÇö Inclusive OR',
    theory: 'The OR gate outputs 1 if AT LEAST ONE input is high (1). It is only 0 when ALL inputs are 0.',
    expression: 'Y = A + B',
    headers: ['A', 'B', 'Output Y'],
    truthTable: [
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 1]
    ],
    challengeText: 'Toggle <strong>only Switch A to 1 (ON)</strong> while B is OFF. The LED should still light up ΓÇö this shows OR only needs one HIGH input!',
    checkPassed: () => {
      const inputs = sandboxNodes.filter(n => n.type === 'input');
      const led = sandboxNodes.find(n => n.type === 'output');
      const oneOn = inputs.some(n => n.outputState === 1) && inputs.some(n => n.outputState === 0);
      return oneOn && led && led.outputState === 1;
    }
  },

  'nor-gate-demo': {
    title: 'NOR Gate ΓÇö Not-OR (Universal Gate)',
    theory: 'The NOR gate outputs 1 ONLY when ALL inputs are 0 (LOW). It is the complement of OR and is also a universal gate.',
    expression: 'Y = (A + B)\'',
    headers: ['A', 'B', 'Output Y'],
    truthTable: [
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 0]
    ],
    challengeText: 'Keep <strong>both switches at 0 (OFF)</strong>. NOR outputs 1 only when all inputs are LOW ΓÇö confirm the LED is ON!',
    checkPassed: () => {
      const inputs = sandboxNodes.filter(n => n.type === 'input');
      const led = sandboxNodes.find(n => n.type === 'output');
      return inputs.length >= 2 && inputs.every(n => n.outputState === 0) && led && led.outputState === 1;
    }
  },

  'xnor-equality': {
    title: 'XNOR Bit Equality Checker',
    theory: 'The XNOR gate outputs 1 when both inputs are EQUAL (both 0 or both 1). It is used as a 1-bit equality comparator.',
    expression: 'Y = A ΓèÖ B  (Y = 1 when A = B)',
    headers: ['A', 'B', 'Equal?'],
    truthTable: [
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 1]
    ],
    challengeText: 'Toggle <strong>both Value A and Value B to 1 (ON)</strong>. Since A equals B, the XNOR outputs 1 ΓÇö Equal LED lights up!',
    checkPassed: () => {
      const inputs = sandboxNodes.filter(n => n.type === 'input');
      const led = sandboxNodes.find(n => n.type === 'output');
      return inputs.length >= 2 && inputs.every(n => n.outputState === 1) && led && led.outputState === 1;
    }
  },

  'majority-gate': {
    title: '3-Input Majority / Voter Gate',
    theory: 'A Majority Gate outputs 1 when MORE THAN HALF of the inputs are 1. This 3-input version outputs 1 when at least 2 of 3 voters agree.',
    expression: 'Y = AB + BC + AC',
    headers: ['A', 'B', 'C', 'Majority Y'],
    truthTable: [
      [0, 0, 0, 0],
      [0, 0, 1, 0],
      [0, 1, 1, 1],
      [1, 1, 0, 1],
      [1, 1, 1, 1]
    ],
    challengeText: 'Toggle <strong>any 2 out of 3 Voters to 1 (ON)</strong>. The Majority LED should light ΓÇö you have a winning majority!',
    checkPassed: () => {
      const inputs = sandboxNodes.filter(n => n.type === 'input' && n.label.includes('Voter'));
      const led = sandboxNodes.find(n => n.type === 'output');
      const onCount = inputs.filter(n => n.outputState === 1).length;
      return onCount >= 2 && led && led.outputState === 1;
    }
  },

  'nor-sr-latch': {
    title: 'NOR Gate SR Latch (Active-High)',
    theory: 'Like the NAND SR Latch but built with NOR gates. S=1 sets Q=1, R=1 resets Q=0. S=R=0 holds state. S=R=1 is forbidden.',
    expression: 'Q = NOR(R, Q\')  |  Q\' = NOR(S, Q)',
    headers: ['S', 'R', 'Q', 'Action'],
    truthTable: [
      [0, 0, 'Hold', 'No change'],
      [1, 0, 1, 'Set Q=1'],
      [0, 1, 0, 'Reset Q=0'],
      [1, 1, '?', 'Forbidden']
    ],
    challengeText: '<strong>Toggle Set (S) to 1 briefly then back to 0</strong>. Q should latch to 1 and stay ON even after S returns to 0!',
    checkPassed: () => {
      const sSwitch = sandboxNodes.find(n => n.label && n.label.includes('Set'));
      const qLed = sandboxNodes.find(n => n.label === 'Q');
      return sSwitch && sSwitch.outputState === 0 && qLed && qLed.outputState === 1;
    }
  },

  'alarm-circuit': {
    title: 'OR-Gate Security Alarm',
    theory: 'An alarm system using an OR gate: any sensor triggering activates both the LED and Buzzer. This models an inclusive-OR security response.',
    expression: 'ALARM = Sensor_A + Sensor_B',
    headers: ['Sensor A', 'Sensor B', 'Alarm'],
    truthTable: [
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 1]
    ],
    challengeText: 'Trigger <strong>either Sensor A or Sensor B</strong> to 1. The alarm activates both the LED and Buzzer simultaneously!',
    checkPassed: () => {
      const buzzer = sandboxNodes.find(n => n.type === 'buzzer');
      return buzzer && buzzer.outputState === 1;
    }
  },

  'rgb-color-mixer': {
    title: 'RGB LED Color Mixer',
    theory: 'An RGB LED contains 3 separate LEDs (Red, Green, Blue). By combining different signals, you can create 7 colors: the 3 primaries plus Cyan, Magenta, Yellow, and White.',
    expression: 'Color = R|G|B combinations',
    headers: ['R', 'G', 'B', 'Color'],
    truthTable: [
      [0, 0, 0, 'OFF'],
      [1, 0, 0, 'RED'],
      [0, 1, 0, 'GREEN'],
      [0, 0, 1, 'BLUE'],
      [1, 1, 0, 'YELLOW'],
      [1, 0, 1, 'MAGENTA'],
      [0, 1, 1, 'CYAN'],
      [1, 1, 1, 'WHITE']
    ],
    challengeText: 'Toggle <strong>Red + Green (but not Blue)</strong>. The RGB LED should mix Red + Green = <strong>YELLOW</strong>!',
    checkPassed: () => {
      const rgbNode = sandboxNodes.find(n => n.type === 'rgb-led');
      return rgbNode && rgbNode.outputState === 1 && rgbNode.outputState2 === 1 && !rgbNode._blueState;
    }
  },

  'led-binary-display': {
    title: '4-Bit LED Bar Binary Counter',
    theory: 'The LED Bar Display shows 4 binary bits as 4 individual LEDs. D3 is the Most Significant Bit (MSB) and D0 is the Least Significant Bit (LSB).',
    expression: 'Decimal = D3├ù8 + D2├ù4 + D1├ù2 + D0├ù1',
    headers: ['D3', 'D2', 'D1', 'D0', 'Decimal'],
    truthTable: [
      [0, 0, 0, 0, 0],
      [0, 1, 0, 1, 5],
      [1, 0, 1, 0, 10],
      [1, 1, 1, 1, 15]
    ],
    challengeText: 'Set bits <strong>D3=1, D2=0, D1=1, D0=0</strong> on the LED Bar. This should display the binary number 1010 = decimal 10!',
    checkPassed: () => {
      const barNode = sandboxNodes.find(n => n.type === 'led-bar');
      return barNode && barNode.inputValues[3] === 1 && barNode.inputValues[2] === 0 && barNode.inputValues[1] === 1 && barNode.inputValues[0] === 0;
    }
  },

  'and-alarm': {
    title: 'AND-Gate Dual-Security Alarm',
    theory: 'An AND alarm requires ALL sensors active before triggering. Unlike OR alarms, this prevents false triggers from a single sensor failure.',
    expression: 'ALARM = Security_A ΓÇó Security_B',
    headers: ['Security A', 'Security B', 'Alarm'],
    truthTable: [
      [0, 0, 0],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 1]
    ],
    challengeText: 'Activate <strong>both Security A AND Security B to 1</strong>. Only when BOTH are triggered does the AND gate fire the alarm!',
    checkPassed: () => {
      const buzzer = sandboxNodes.find(n => n.type === 'buzzer');
      return buzzer && buzzer.outputState === 1;
    }
  },

  'multi-led-and': {
    title: 'Gate Comparator ΓÇö AND vs OR vs XOR',
    theory: 'This circuit connects the same two inputs to AND, OR, and XOR gates simultaneously, showing the different outputs. Compare them side by side!',
    expression: 'AND=A┬╖B  |  OR=A+B  |  XOR=AΓèòB',
    headers: ['A', 'B', 'AND', 'OR', 'XOR'],
    truthTable: [
      [0, 0, 0, 0, 0],
      [0, 1, 0, 1, 1],
      [1, 0, 0, 1, 1],
      [1, 1, 1, 1, 0]
    ],
    challengeText: 'Set <strong>Switch A=1 and Switch B=1</strong>. Notice AND=1, OR=1, but XOR=0! XOR is 0 when both inputs are the same.',
    checkPassed: () => {
      const inputs = sandboxNodes.filter(n => n.type === 'input');
      const leds = sandboxNodes.filter(n => n.type === 'output');
      return inputs.length >= 2 && inputs.every(n => n.outputState === 1) && leds.some(n => n.label.includes('AND') && n.outputState === 1) && leds.some(n => n.label.includes('XOR') && n.outputState === 0);
    }
  },

  'clock-rgb-chase': {
    title: 'Clock-Driven RGB Color Chase',
    theory: 'The Clock signal alternates between HIGH and LOW. By inverting it through NOT gates, you can create complementary signals that drive an RGB LED through color sequences.',
    expression: 'CLK=directΓåÆG  |  NOT(CLK)ΓåÆR  |  NOT(NOT(CLK))ΓåÆB',
    headers: ['CLK', 'R (NOT CLK)', 'G (CLK)', 'B (NOT┬▓CLK)', 'Color'],
    truthTable: [
      [0, 1, 0, 0, 'RED'],
      [1, 0, 1, 1, 'CYAN']
    ],
    challengeText: 'Watch the RGB LED! As the Clock ticks, it <strong>automatically alternates between RED and CYAN</strong> ΓÇö a living light pattern!',
    checkPassed: () => {
      const rgbNode = sandboxNodes.find(n => n.type === 'rgb-led');
      const clkNode = sandboxNodes.find(n => n.type === 'clock');
      return rgbNode && clkNode && (rgbNode.outputState || rgbNode.outputState2 || rgbNode._blueState);
    }
  },

  'nand-not-gate': {
    title: 'NAND as NOT (Universality Demo)',
    theory: 'A NAND gate with BOTH inputs tied together acts as a NOT gate (inverter). NAND is universal ΓÇö you can make any logic gate with only NAND gates.',
    expression: 'Y = (A ΓÇó A)\' = A\'  (when both inputs tied)',
    headers: ['A', 'A (tied)', 'NOT Output'],
    truthTable: [
      [0, 0, 1],
      [1, 1, 0]
    ],
    challengeText: 'Toggle the switch to <strong>1 (ON)</strong>. The NAND with tied inputs inverts it ΓÇö NOT LED should go OFF!',
    checkPassed: () => {
      const sw = sandboxNodes.find(n => n.type === 'input');
      const led = sandboxNodes.find(n => n.type === 'output');
      return sw && sw.outputState === 1 && led && led.outputState === 0;
    }
  },
  'ohms-law': {
    title: "Ohm's Law (V = IR)",
    theory: "Ohm's Law states that the current through a conductor is directly proportional to the voltage across it and inversely proportional to its resistance. Close the switch to see the ammeter reading.",
    expression: 'I = V / R  |  V = IR  |  R = V/I',
    challengeText: 'Close the switch and observe the ammeter. Try adjusting the resistor slider to see how current changes!',
    checkPassed: () => true
  },
  'voltage-divider': {
    title: 'Voltage Divider Rule',
    theory: 'When resistors are connected in series, the voltage divides across each proportional to its resistance. The voltmeter measures Vout across R2.',
    expression: 'Vout = Vin ├ù R2 / (R1 + R2)',
    challengeText: 'Close the switch. With R1=100╬⌐ and R2=50╬⌐, Vout should be 12 ├ù 50/(100+50) = 4V. Try changing R2!',
    checkPassed: () => true
  },
  'simple-bulb-circuit': {
    title: 'Simple Series Circuit',
    theory: 'A basic series circuit with a battery, switch, resistor, and bulb. The current flows through all components in a single loop.',
    expression: 'I = V / (R_load + R_bulb)',
    challengeText: 'Close the switch to light the bulb. Adjust the resistor value to see brightness change!',
    checkPassed: () => true
  },
  'transistor-switch': {
    title: 'NPN Transistor as a Switch',
    theory: 'An NPN transistor acts as an electronic switch. When the base receives current (via the base switch), it allows a larger current to flow from collector to emitter, powering the LED.',
    expression: 'Base ON  ΓåÆ  Transistor ON  ΓåÆ  LED ON',
    challengeText: 'First close the Base Switch. Then click the NPN Transistor to turn it ON. The LED should light up!',
    checkPassed: () => true
  },
  'transistor-controlled-bulb': {
    title: 'Transistor-Controlled Load',
    theory: 'The transistor controls a separate load circuit. The base current (through R_base) controls whether the transistor conducts, switching the bulb in the collector circuit.',
    expression: 'Transistor ON  ΓåÆ  Bulb circuit complete',
    challengeText: 'Click the NPN Transistor to turn it ON. Current flows through both the base path and the load (bulb) path!',
    checkPassed: () => true
  },
  'diode-circuit': {
    title: 'Diode Forward Bias',
    theory: 'A semiconductor diode conducts current only when forward-biased (anode positive relative to cathode). The arrow in the symbol shows the direction of conventional current flow.',
    expression: 'I = I_s(e^(V_D/╬╖V_T) - 1)',
    headers: ['Condition', 'Current', 'LED'],
    truthTable: [
      ['Switch ON', 'Flows', 'GLOWS'],
      ['Switch OFF', 'Blocked', 'OFF']
    ],
    challengeText: 'Close the switch to forward-bias the diode. Current flows through the diode, resistor, and lights the LED.',
    checkPassed: () => {
      const leds = sandboxNodes.filter(n => n.type === 'led-elec');
      return leds.length > 0 && leds.some(n => n.data.on);
    }
  },
  'ldr-divider': {
    title: 'LDR Voltage Divider',
    theory: 'A Light Dependent Resistor (LDR) changes its resistance with light intensity. In a voltage divider, the output voltage varies with LDR resistance, controlling the load.',
    expression: 'R_light Γê¥ 1/lux',
    headers: ['Light Level', 'LDR R', 'Bulb Brightness'],
    truthTable: [
      ['Bright', 'Low (100╬⌐)', 'Dim'],
      ['Dim', 'Medium', 'Medium'],
      ['Dark', 'High (1M╬⌐)', 'Bright']
    ],
    challengeText: 'Adjust the LDR light level slider. In bright light (low LDR resistance), more voltage drops across the fixed resistor, dimming the bulb.',
    checkPassed: () => {
      const bulbs = sandboxNodes.filter(n => n.type === 'bulb');
      return bulbs.length > 0 && bulbs.some(n => n.data.brightness > 0.3);
    }
  },
  'capacitor-timing': {
    title: 'Capacitor Charging',
    theory: 'A capacitor stores electrical charge. When a voltage is applied, it charges exponentially through a resistor with time constant ╧ä = RC.',
    expression: 'V(t) = V_0(1 - e^(-t/RC))',
    headers: ['Time', 'Capacitor V', 'Bulb'],
    truthTable: [
      ['t=0', '0V', 'Bright'],
      ['t=RC', '63% of Vin', 'Dim'],
      ['t=5RC', 'ΓëêVin', 'OFF']
    ],
    challengeText: 'Close the switch to start charging the capacitor. Watch the voltage build up as the bulb gradually dims.',
    checkPassed: () => {
      const caps = sandboxNodes.filter(n => n.type === 'capacitor');
      return caps.length > 0 && caps.some(n => n.data.voltage > 3);
    }
  },
  'op-amp-comparator': {
    title: 'Operational Amplifier (Comparator)',
    theory: 'An op-amp used as a comparator compares two voltages at its inputs. When V+ > V-, the output goes HIGH (positive saturation). When V- > V+, output goes LOW (negative saturation).',
    expression: 'V_out = A(V_+ - V_-)',
    headers: ['V+ Input', 'V- Input', 'Output'],
    truthTable: [
      ['1 (HIGH)', '0 (LOW)', '1 (HIGH)'],
      ['0 (LOW)', '1 (HIGH)', '0 (LOW)'],
      ['1 (HIGH)', '1 (HIGH)', '0 (LOW)'],
      ['0 (LOW)', '0 (LOW)', '0 (LOW)']
    ],
    challengeText: 'Toggle switches to change V+ and V- inputs. The LED lights when V+ > V-. This is how analog sensors trigger digital logic.',
    checkPassed: () => {
      const outputs = sandboxNodes.filter(n => n.type === 'output');
      return outputs.length > 0 && outputs.some(n => n.outputState === 1);
    }
  },
  'sensor-demo': {
    title: 'Analog Sensor + Threshold',
    theory: 'An Analog Sensor outputs a continuous value (0-100). When its value exceeds a configurable <strong>threshold</strong>, the sensor sends a HIGH signal. This lets digital circuits react to analog conditions.',
    expression: 'Output = 1  when  SensorValue > Threshold',
    headers: ['Sensor Value', 'Threshold', 'Output'],
    truthTable: [
      [25, 50, 'LOW (0)'],
      [75, 50, 'HIGH (1)'],
      [80, 30, 'HIGH (1)'],
      [10, 20, 'LOW (0)']
    ],
    challengeText: 'Adjust the Sensor slider <strong>above the threshold line</strong> (default 50) to make the LED light up. Try moving the threshold slider too!',
    checkPassed: () => {
      const sensors = sandboxNodes.filter(n => n.type === 'sensor');
      const outputs = sandboxNodes.filter(n => n.type === 'output');
      return sensors.length > 0 && outputs.length > 0 && outputs.some(n => n.outputState === 1);
    }
  }
};
let activeChallengeTemplate = null;
let challengePassed = false;

window.updateTheoryGuide = function (name) {
  const guide = TEMPLATE_THEORY[name];
  const card = document.getElementById('sandbox-learning-card');
  const body = document.getElementById('learning-card-body');
  if (!card || !body) return;

  activeChallengeTemplate = name;
  challengePassed = false; 

  if (!guide) {
    body.innerHTML = `
      <div style="text-align:center;padding:2rem 0;color:var(--text-muted);">
        Select or drag a template circuit to view theory and challenges here!
      </div>`;
    card.style.display = 'none';
    return;
  }
  card.style.display = 'flex';
  card.classList.remove('collapsed');
  let tableHtml = '';
  if (guide.truthTable && guide.truthTable.length > 0) {
    const headers = guide.headers || ['A', 'B', 'Out'];
    const ths = headers.map(h => `<th>${h}</th>`).join('');
    const rows = guide.truthTable.map(row => {
      const tds = row.map(val => `<td>${val}</td>`).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    tableHtml = `
      <div class="learning-section-title">Truth Table</div>
      <table class="learning-table">
        <thead><tr>${ths}</tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  body.innerHTML = `
    <div class="learning-title">${guide.title}</div>
    <div class="learning-theory">${guide.theory}</div>
    <div class="learning-section-title">Boolean Expression</div>
    <div style="font-family:var(--font-mono);font-size:0.85rem;background:var(--bg-tertiary);padding:4px 8px;border-radius:4px;border:1px solid var(--border-color);margin-bottom:0.25rem;font-weight:700;">
      ${guide.expression}
    </div>
    ${tableHtml}
    <div class="learning-challenge-box" style="margin-top:0.5rem">
      <div class="learning-challenge-title">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--color-cyan)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Learning Check
      </div>
      <div class="learning-challenge-text">
        ${guide.challengeText}
      </div>
      <div class="learning-challenge-feedback" id="challenge-feedback">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--color-success)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Goal Achieved! +10 XP
      </div>
    </div>
  `;
  window.checkTheoryChallenge();
};

window.checkTheoryChallenge = function () {
  if (!activeChallengeTemplate || challengePassed) return;
  const guide = TEMPLATE_THEORY[activeChallengeTemplate];
  if (!guide || !guide.checkPassed) return;

  const isPassed = guide.checkPassed();
  if (isPassed) {
    challengePassed = true;
    const fb = document.getElementById('challenge-feedback');
    if (fb) {
      fb.style.display = 'flex';
      fb.classList.add('success');
    }
    playSound('success');
    showToast(`Micro-Challenge Completed! Γ£ô (+10 XP)`);
    const xp = (parseInt(localStorage.getItem('logicQuest_extraXp')) || 0) + 10;
    localStorage.setItem('logicQuest_extraXp', xp);
    if (window.updateXPDisplay) window.updateXPDisplay();
  }
};

window.loadSandboxTemplate = function (name) {
  const layout = CIRCUIT_TEMPLATES[name];
  if (!layout) { showToast('Template not found.'); return; }
  const doLoad = () => {
    importLayout(JSON.parse(JSON.stringify(layout)));
    playSound('success');
    const labels = {
      'not-demo': 'NOT Inverter',
      'and-demo': 'AND Gate Test',
      'xor-parity': 'XOR Parity',
      'sr-latch': 'SR Latch',
      'half-adder-demo': 'Half Adder',
      'full-adder-gate': 'Full Adder',
      'nand-universality-and': 'NAND Universality',
      'd-flipflop-reg': '1-Bit Register',
      'seven-seg-decoder-demo': '7-Seg Decoder',
      'diode-circuit': 'Diode Forward Bias',
      'ldr-divider': 'LDR Voltage Divider',
      'capacitor-timing': 'Capacitor Charging',
      'op-amp-comparator': 'Op-Amp Comparator',
      'sensor-demo': 'Analog Sensor Demo'
    };
    showToast(`Loaded: ${labels[name] || name}`);
    window.updateTheoryGuide(name);
  };
  if (sandboxNodes.length > 0) {
    showConfirm('This will clear your current canvas. Load template?', (r) => { if (r) doLoad(); });
  } else {
    doLoad();
  }
};

window.appendSandboxTemplate = function (name, dropX, dropY) {
  const layout = CIRCUIT_TEMPLATES[name];
  if (!layout) { showToast('Template not found.'); return; }
  const cloned = JSON.parse(JSON.stringify(layout));
  const nodes = cloned.nodes || [];
  if (nodes.length === 0) return;
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(n => {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x > maxX) maxX = n.x;
    if (n.y > maxY) maxY = n.y;
  });

  const width = maxX - minX;
  const height = maxY - minY;
  const offsetX = dropX - (minX + width / 2);
  const offsetY = dropY - (minY + height / 2);
  const idMap = {};
  nodes.forEach(n => {
    const oldId = n.id;
    const newId = `sb-node-${nextNodeId++}`;
    idMap[oldId] = newId;

    n.id = newId;
    n.x = Math.round((n.x + offsetX) / 10) * 10;
    n.y = Math.round((n.y + offsetY) / 10) * 10;

    const def = COMPONENT_DEFS[n.type];
    if (def) {
      n.outputsCount = n.outputsCount ?? def.outputs;
      n.outputState2 = n.outputState2 ?? 0;
      n.inputValues = n.inputValues ?? Array(n.inputsCount).fill(0);
      n.data = n.data ?? (def.data ? { ...def.data } : {});
    }

    sandboxNodes.push(n);
    renderNodeDOM(n);
  });
  const wires = cloned.wires || [];
  wires.forEach(w => {
    const newFrom = idMap[w.fromNodeId];
    const newTo = idMap[w.toNodeId];
    if (newFrom && newTo) {
      sandboxWires.push({
        fromNodeId: newFrom,
        fromPortIdx: w.fromPortIdx,
        toNodeId: newTo,
        toPortIdx: w.toPortIdx
      });
    }
  });

  evaluateSandbox();
  playSound('success');

  const labels = {
    'not-demo': 'NOT Inverter',
    'and-demo': 'AND Gate Test',
    'xor-parity': 'XOR Parity',
    'sr-latch': 'SR Latch',
    'half-adder-demo': 'Half Adder',
    'full-adder-gate': 'Full Adder',
    'nand-universality-and': 'NAND Universality',
    'd-flipflop-reg': '1-Bit Register',
    'seven-seg-decoder-demo': '7-Seg Decoder',
    'sensor-demo': 'Analog Sensor Demo'
  };

  showToast(`Dropped: ${labels[name] || name}`);
  window.updateTheoryGuide(name);
};
