// IC Logic Chip Tester & Diagnostic Bench
import { showToast } from '../common.js';

const IC_DEFINITIONS = {
  '7408': {
    name: '7408 Quad 2-Input AND Gate',
    package: 'DIP-14',
    pinsCount: 14,
    gateType: 'and',
    pins: [
      { num: 1, name: '1A', type: 'input', gate: 0, param: 'inA' },
      { num: 2, name: '1B', type: 'input', gate: 0, param: 'inB' },
      { num: 3, name: '1Y', type: 'output', gate: 0, param: 'out' },
      { num: 4, name: '2A', type: 'input', gate: 1, param: 'inA' },
      { num: 5, name: '2B', type: 'input', gate: 1, param: 'inB' },
      { num: 6, name: '2Y', type: 'output', gate: 1, param: 'out' },
      { num: 7, name: 'GND', type: 'power' },
      { num: 8, name: '3Y', type: 'output', gate: 2, param: 'out' },
      { num: 9, name: '3A', type: 'input', gate: 2, param: 'inA' },
      { num: 10, name: '3B', type: 'input', gate: 2, param: 'inB' },
      { num: 11, name: '4Y', type: 'output', gate: 3, param: 'out' },
      { num: 12, name: '4A', type: 'input', gate: 3, param: 'inA' },
      { num: 13, name: '4B', type: 'input', gate: 3, param: 'inB' },
      { num: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { name: 'Gate 1', inA: 1, inB: 2, out: 3 },
      { name: 'Gate 2', inA: 4, inB: 5, out: 6 },
      { name: 'Gate 3', inA: 9, inB: 10, out: 8 },
      { name: 'Gate 4', inA: 12, inB: 13, out: 11 },
    ],
    evalGate: (a, b) => (a && b) ? 1 : 0,
    table: [
      { a: 0, b: 0, exp: 0 },
      { a: 0, b: 1, exp: 0 },
      { a: 1, b: 0, exp: 0 },
      { a: 1, b: 1, exp: 1 },
    ],
  },

  '7432': {
    name: '7432 Quad 2-Input OR Gate',
    package: 'DIP-14',
    pinsCount: 14,
    gateType: 'or',
    pins: [
      { num: 1, name: '1A', type: 'input', gate: 0, param: 'inA' },
      { num: 2, name: '1B', type: 'input', gate: 0, param: 'inB' },
      { num: 3, name: '1Y', type: 'output', gate: 0, param: 'out' },
      { num: 4, name: '2A', type: 'input', gate: 1, param: 'inA' },
      { num: 5, name: '2B', type: 'input', gate: 1, param: 'inB' },
      { num: 6, name: '2Y', type: 'output', gate: 1, param: 'out' },
      { num: 7, name: 'GND', type: 'power' },
      { num: 8, name: '3Y', type: 'output', gate: 2, param: 'out' },
      { num: 9, name: '3A', type: 'input', gate: 2, param: 'inA' },
      { num: 10, name: '3B', type: 'input', gate: 2, param: 'inB' },
      { num: 11, name: '4Y', type: 'output', gate: 3, param: 'out' },
      { num: 12, name: '4A', type: 'input', gate: 3, param: 'inA' },
      { num: 13, name: '4B', type: 'input', gate: 3, param: 'inB' },
      { num: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { name: 'Gate 1', inA: 1, inB: 2, out: 3 },
      { name: 'Gate 2', inA: 4, inB: 5, out: 6 },
      { name: 'Gate 3', inA: 9, inB: 10, out: 8 },
      { name: 'Gate 4', inA: 12, inB: 13, out: 11 },
    ],
    evalGate: (a, b) => (a || b) ? 1 : 0,
    table: [
      { a: 0, b: 0, exp: 0 },
      { a: 0, b: 1, exp: 1 },
      { a: 1, b: 0, exp: 1 },
      { a: 1, b: 1, exp: 1 },
    ],
  },

  '7404': {
    name: '7404 Hex Inverter / NOT Gate',
    package: 'DIP-14',
    pinsCount: 14,
    gateType: 'not',
    pins: [
      { num: 1, name: '1A', type: 'input', gate: 0, param: 'inA' },
      { num: 2, name: '1Y', type: 'output', gate: 0, param: 'out' },
      { num: 3, name: '2A', type: 'input', gate: 1, param: 'inA' },
      { num: 4, name: '2Y', type: 'output', gate: 1, param: 'out' },
      { num: 5, name: '3A', type: 'input', gate: 2, param: 'inA' },
      { num: 6, name: '3Y', type: 'output', gate: 2, param: 'out' },
      { num: 7, name: 'GND', type: 'power' },
      { num: 8, name: '4Y', type: 'output', gate: 3, param: 'out' },
      { num: 9, name: '4A', type: 'input', gate: 3, param: 'inA' },
      { num: 10, name: '5Y', type: 'output', gate: 4, param: 'out' },
      { num: 11, name: '5A', type: 'input', gate: 4, param: 'inA' },
      { num: 12, name: '6Y', type: 'output', gate: 5, param: 'out' },
      { num: 13, name: '6A', type: 'input', gate: 5, param: 'inA' },
      { num: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { name: 'Gate 1', inA: 1, out: 2 },
      { name: 'Gate 2', inA: 3, out: 4 },
      { name: 'Gate 3', inA: 5, out: 6 },
      { name: 'Gate 4', inA: 9, out: 8 },
      { name: 'Gate 5', inA: 11, out: 10 },
      { name: 'Gate 6', inA: 13, out: 12 },
    ],
    evalGate: (a) => a ? 0 : 1,
    table: [
      { a: 0, exp: 1 },
      { a: 1, exp: 0 },
    ],
  },

  '7400': {
    name: '7400 Quad 2-Input NAND Gate',
    package: 'DIP-14',
    gateType: 'nand',
    pinsCount: 14,
    pins: [
      { num: 1, name: '1A', type: 'input', gate: 0, param: 'inA' },
      { num: 2, name: '1B', type: 'input', gate: 0, param: 'inB' },
      { num: 3, name: '1Y', type: 'output', gate: 0, param: 'out' },
      { num: 4, name: '2A', type: 'input', gate: 1, param: 'inA' },
      { num: 5, name: '2B', type: 'input', gate: 1, param: 'inB' },
      { num: 6, name: '2Y', type: 'output', gate: 1, param: 'out' },
      { num: 7, name: 'GND', type: 'power' },
      { num: 8, name: '3Y', type: 'output', gate: 2, param: 'out' },
      { num: 9, name: '3A', type: 'input', gate: 2, param: 'inA' },
      { num: 10, name: '3B', type: 'input', gate: 2, param: 'inB' },
      { num: 11, name: '4Y', type: 'output', gate: 3, param: 'out' },
      { num: 12, name: '4A', type: 'input', gate: 3, param: 'inA' },
      { num: 13, name: '4B', type: 'input', gate: 3, param: 'inB' },
      { num: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { name: 'Gate 1', inA: 1, inB: 2, out: 3 },
      { name: 'Gate 2', inA: 4, inB: 5, out: 6 },
      { name: 'Gate 3', inA: 9, inB: 10, out: 8 },
      { name: 'Gate 4', inA: 12, inB: 13, out: 11 },
    ],
    evalGate: (a, b) => (a && b) ? 0 : 1,
    table: [
      { a: 0, b: 0, exp: 1 },
      { a: 0, b: 1, exp: 1 },
      { a: 1, b: 0, exp: 1 },
      { a: 1, b: 1, exp: 0 },
    ],
  },

  '7402': {
    name: '7402 Quad 2-Input NOR Gate',
    package: 'DIP-14',
    gateType: 'nor',
    pinsCount: 14,
    pins: [
      { num: 1, name: '1Y', type: 'output', gate: 0, param: 'out' },
      { num: 2, name: '1A', type: 'input', gate: 0, param: 'inA' },
      { num: 3, name: '1B', type: 'input', gate: 0, param: 'inB' },
      { num: 4, name: '2Y', type: 'output', gate: 1, param: 'out' },
      { num: 5, name: '2A', type: 'input', gate: 1, param: 'inA' },
      { num: 6, name: '2B', type: 'input', gate: 1, param: 'inB' },
      { num: 7, name: 'GND', type: 'power' },
      { num: 8, name: '3A', type: 'input', gate: 2, param: 'inA' },
      { num: 9, name: '3B', type: 'input', gate: 2, param: 'inB' },
      { num: 10, name: '3Y', type: 'output', gate: 2, param: 'out' },
      { num: 11, name: '4A', type: 'input', gate: 3, param: 'inA' },
      { num: 12, name: '4B', type: 'input', gate: 3, param: 'inB' },
      { num: 13, name: '4Y', type: 'output', gate: 3, param: 'out' },
      { num: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { name: 'Gate 1', inA: 2, inB: 3, out: 1 },
      { name: 'Gate 2', inA: 5, inB: 6, out: 4 },
      { name: 'Gate 3', inA: 8, inB: 9, out: 10 },
      { name: 'Gate 4', inA: 11, inB: 12, out: 13 },
    ],
    evalGate: (a, b) => (a || b) ? 0 : 1,
    table: [
      { a: 0, b: 0, exp: 1 },
      { a: 0, b: 1, exp: 0 },
      { a: 1, b: 0, exp: 0 },
      { a: 1, b: 1, exp: 0 },
    ],
  },

  '7486': {
    name: '7486 Quad 2-Input XOR Gate',
    package: 'DIP-14',
    gateType: 'xor',
    pinsCount: 14,
    pins: [
      { num: 1, name: '1A', type: 'input', gate: 0, param: 'inA' },
      { num: 2, name: '1B', type: 'input', gate: 0, param: 'inB' },
      { num: 3, name: '1Y', type: 'output', gate: 0, param: 'out' },
      { num: 4, name: '2A', type: 'input', gate: 1, param: 'inA' },
      { num: 5, name: '2B', type: 'input', gate: 1, param: 'inB' },
      { num: 6, name: '2Y', type: 'output', gate: 1, param: 'out' },
      { num: 7, name: 'GND', type: 'power' },
      { num: 8, name: '3Y', type: 'output', gate: 2, param: 'out' },
      { num: 9, name: '3A', type: 'input', gate: 2, param: 'inA' },
      { num: 10, name: '3B', type: 'input', gate: 2, param: 'inB' },
      { num: 11, name: '4Y', type: 'output', gate: 3, param: 'out' },
      { num: 12, name: '4A', type: 'input', gate: 3, param: 'inA' },
      { num: 13, name: '4B', type: 'input', gate: 3, param: 'inB' },
      { num: 14, name: 'VCC', type: 'power' },
    ],
    gates: [
      { name: 'Gate 1', inA: 1, inB: 2, out: 3 },
      { name: 'Gate 2', inA: 4, inB: 5, out: 6 },
      { name: 'Gate 3', inA: 9, inB: 10, out: 8 },
      { name: 'Gate 4', inA: 12, inB: 13, out: 11 },
    ],
    evalGate: (a, b) => (a !== b) ? 1 : 0,
    table: [
      { a: 0, b: 0, exp: 0 },
      { a: 0, b: 1, exp: 1 },
      { a: 1, b: 0, exp: 1 },
      { a: 1, b: 1, exp: 0 },
    ],
  },

  '7447': {
    name: '7447 BCD to 7-Segment Decoder / Driver',
    package: 'DIP-16',
    gateType: 'decoder',
    pinsCount: 16,
    pins: [
      { num: 1, name: 'B', type: 'input', param: 'B' },
      { num: 2, name: 'C', type: 'input', param: 'C' },
      { num: 3, name: 'LT', type: 'input', param: 'LT' },
      { num: 4, name: 'BI', type: 'input', param: 'BI' },
      { num: 5, name: 'RBI', type: 'input', param: 'RBI' },
      { num: 6, name: 'D', type: 'input', param: 'D' },
      { num: 7, name: 'A', type: 'input', param: 'A' },
      { num: 8, name: 'GND', type: 'power' },
      { num: 9, name: 'e', type: 'output', param: 'e' },
      { num: 10, name: 'd', type: 'output', param: 'd' },
      { num: 11, name: 'c', type: 'output', param: 'c' },
      { num: 12, name: 'b', type: 'output', param: 'b' },
      { num: 13, name: 'a', type: 'output', param: 'a' },
      { num: 14, name: 'g', type: 'output', param: 'g' },
      { num: 15, name: 'f', type: 'output', param: 'f' },
      { num: 16, name: 'VCC', type: 'power' },
    ],
    gates: [
      { name: 'Output a (Pin 13)', out: 13 },
      { name: 'Output b (Pin 12)', out: 12 },
      { name: 'Output c (Pin 11)', out: 11 },
      { name: 'Output d (Pin 10)', out: 10 },
      { name: 'Output e (Pin 9)', out: 9 },
      { name: 'Output f (Pin 15)', out: 15 },
      { name: 'Output g (Pin 14)', out: 14 },
    ],
    table: [
      { d: 0, c: 0, b: 0, a: 0, num: 0, segs: [1, 1, 1, 1, 1, 1, 0] },
      { d: 0, c: 0, b: 0, a: 1, num: 1, segs: [0, 1, 1, 0, 0, 0, 0] },
      { d: 0, c: 0, b: 1, a: 0, num: 2, segs: [1, 1, 0, 1, 1, 0, 1] },
      { d: 0, c: 0, b: 1, a: 1, num: 3, segs: [1, 1, 1, 1, 0, 0, 1] },
      { d: 0, c: 1, b: 0, a: 0, num: 4, segs: [0, 1, 1, 0, 0, 1, 1] },
      { d: 0, c: 1, b: 0, a: 1, num: 5, segs: [1, 0, 1, 1, 0, 1, 1] },
      { d: 0, c: 1, b: 1, a: 0, num: 6, segs: [1, 0, 1, 1, 1, 1, 1] },
      { d: 0, c: 1, b: 1, a: 1, num: 7, segs: [1, 1, 1, 0, 0, 0, 0] },
      { d: 1, c: 0, b: 0, a: 0, num: 8, segs: [1, 1, 1, 1, 1, 1, 1] },
      { d: 1, c: 0, b: 0, a: 1, num: 9, segs: [1, 1, 1, 1, 0, 1, 1] },
    ],
  },
};

let currentICKey = '7408';
let pinStates = {}; // pinNum -> 0 or 1

export function initICTester() {
  const container = document.getElementById('ic-tester-view');
  if (!container || container.dataset.initialized) return;
  container.dataset.initialized = 'true';

  setupEventListeners();
  loadIC('7408');
}

function setupEventListeners() {
  // IC Tab clicks
  const tabs = document.querySelectorAll('.ic-chip-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const icKey = tab.dataset.ic;
      loadIC(icKey);
      if (window.playSound) window.playSound('click');
    });
  });

  // Subtabs (Gates vs Truth Table)
  const subtabs = document.querySelectorAll('.ic-subtab');
  subtabs.forEach(tab => {
    tab.addEventListener('click', () => {
      subtabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const view = tab.dataset.view;
      const gatesView = document.getElementById('ic-gates-view');
      const tableView = document.getElementById('ic-table-view');
      if (view === 'gates') {
        if (gatesView) gatesView.style.display = 'block';
        if (tableView) tableView.style.display = 'none';
      } else {
        if (gatesView) gatesView.style.display = 'none';
        if (tableView) tableView.style.display = 'block';
      }
      if (window.playSound) window.playSound('click');
    });
  });

  // Action Buttons
  document.getElementById('ic-reset-pins')?.addEventListener('click', () => {
    resetPins();
    evaluateIC();
    showToast('All input pins reset to LOW (0)');
    if (window.playSound) window.playSound('click');
  });

  document.getElementById('ic-run-selftest')?.addEventListener('click', () => {
    runSelfTest();
  });

  document.getElementById('ic-send-sandbox')?.addEventListener('click', () => {
    const icKey = currentICKey;
    if (window.navigateToRoute) {
      window.navigateToRoute('/logic/sandbox');
      setTimeout(() => {
        // Drop tested IC or template onto sandbox
        if (window.loadSandboxTemplate && icKey === '7447') {
          window.loadSandboxTemplate('seven-seg-decoder-demo');
        } else if (window.addSandboxNode) {
          window.addSandboxNode(`ic-${icKey}`, 340, 200);
        }
        showToast(`Loaded ${icKey} onto circuit canvas ✓`);
      }, 300);
    }
  });
}

function loadIC(icKey) {
  currentICKey = icKey;
  const ic = IC_DEFINITIONS[icKey];
  if (!ic) return;

  // Update badge
  const badge = document.getElementById('ic-package-badge');
  if (badge) badge.textContent = ic.package;

  // Toggle 7-segment display preview
  const sevenSegPreview = document.getElementById('ic-sevenseg-preview');
  if (sevenSegPreview) {
    sevenSegPreview.style.display = icKey === '7447' ? 'flex' : 'none';
  }

  resetPins();
  renderDIPChip(ic);
  renderGatesView(ic);
  renderTruthTable(ic);
  evaluateIC();
}

function resetPins() {
  const ic = IC_DEFINITIONS[currentICKey];
  if (!ic) return;
  pinStates = {};
  ic.pins.forEach(pin => {
    if (pin.type === 'power') {
      pinStates[pin.num] = pin.name === 'VCC' ? 1 : 0;
    } else if (pin.type === 'input') {
      // Default control pins for 7447
      if (pin.name === 'LT' || pin.name === 'BI' || pin.name === 'RBI') {
        pinStates[pin.num] = 1; // active high for normal operation
      } else {
        pinStates[pin.num] = 0;
      }
    } else {
      pinStates[pin.num] = 0;
    }
  });
}

function renderDIPChip(ic) {
  const target = document.getElementById('ic-chip-render');
  if (!target) return;

  const totalPins = ic.pinsCount;
  const halfPins = totalPins / 2;
  const leftPins = ic.pins.slice(0, halfPins);
  const rightPins = ic.pins.slice(halfPins).reverse();

  let leftHtml = '';
  leftPins.forEach(pin => {
    const isInput = pin.type === 'input';
    const isPower = pin.type === 'power';
    const ctrlClass = isPower ? 'power' : (isInput ? '' : 'output');
    leftHtml += `
      <div class="ic-dip-pin-row" data-pin="${pin.num}" onclick="window.toggleICPin(${pin.num})">
        <span class="ic-pin-control ${ctrlClass}" id="ic-pin-ctrl-${pin.num}">0</span>
        <span class="ic-pin-name">${pin.name}</span>
        <span class="ic-pin-badge">${pin.num}</span>
        <div class="ic-pin-leg" id="ic-pin-leg-${pin.num}"></div>
      </div>
    `;
  });

  let rightHtml = '';
  rightPins.forEach(pin => {
    const isInput = pin.type === 'input';
    const isPower = pin.type === 'power';
    const ctrlClass = isPower ? 'power' : (isInput ? '' : 'output');
    rightHtml += `
      <div class="ic-dip-pin-row" data-pin="${pin.num}" onclick="window.toggleICPin(${pin.num})">
        <span class="ic-pin-control ${ctrlClass}" id="ic-pin-ctrl-${pin.num}">0</span>
        <span class="ic-pin-name">${pin.name}</span>
        <span class="ic-pin-badge">${pin.num}</span>
        <div class="ic-pin-leg" id="ic-pin-leg-${pin.num}"></div>
      </div>
    `;
  });

  target.innerHTML = `
    <div class="ic-dip-package">
      <div class="ic-dip-notch"></div>
      <div class="ic-dip-dot"></div>
      <div class="ic-dip-label">SN${currentICKey}N</div>
      <div class="ic-dip-pins-col ic-dip-pins-left">
        ${leftHtml}
      </div>
      <div class="ic-dip-pins-col ic-dip-pins-right">
        ${rightHtml}
      </div>
    </div>
  `;
}

window.toggleICPin = function(pinNum) {
  const ic = IC_DEFINITIONS[currentICKey];
  if (!ic) return;
  const pin = ic.pins.find(p => p.num === pinNum);
  if (!pin || pin.type !== 'input') return;

  pinStates[pinNum] = pinStates[pinNum] === 1 ? 0 : 1;
  if (window.playSound) window.playSound('toggle');
  evaluateIC();
};

function evaluateIC() {
  const ic = IC_DEFINITIONS[currentICKey];
  if (!ic) return;

  if (ic.gateType === 'decoder') {
    // 7447 BCD Decoder evaluation
    const valA = pinStates[7] || 0; // Pin 7: A (LSB)
    const valB = pinStates[1] || 0; // Pin 1: B
    const valC = pinStates[2] || 0; // Pin 2: C
    const valD = pinStates[6] || 0; // Pin 6: D (MSB)
    const bcdVal = (valD << 3) | (valC << 2) | (valB << 1) | valA;

    const SEG_MAP = [
      [1, 1, 1, 1, 1, 1, 0], // 0: a,b,c,d,e,f
      [0, 1, 1, 0, 0, 0, 0], // 1: b,c
      [1, 1, 0, 1, 1, 0, 1], // 2: a,b,d,e,g
      [1, 1, 1, 1, 0, 0, 1], // 3: a,b,c,d,g
      [0, 1, 1, 0, 0, 1, 1], // 4: b,c,f,g
      [1, 0, 1, 1, 0, 1, 1], // 5: a,c,d,f,g
      [1, 0, 1, 1, 1, 1, 1], // 6: a,c,d,e,f,g
      [1, 1, 1, 0, 0, 0, 0], // 7: a,b,c
      [1, 1, 1, 1, 1, 1, 1], // 8: a,b,c,d,e,f,g
      [1, 1, 1, 1, 0, 1, 1], // 9: a,b,c,d,f,g
    ];

    const segs = (bcdVal <= 9) ? SEG_MAP[bcdVal] : [0, 0, 0, 0, 0, 0, 0];
    const segNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const segPins = [13, 12, 11, 10, 9, 15, 14];

    segPins.forEach((pin, i) => {
      pinStates[pin] = segs[i];
    });

    // Update 7-segment display on bench
    segNames.forEach((name, i) => {
      const segEl = document.getElementById(`ic-seg-${name}`);
      if (segEl) segEl.classList.toggle('active', segs[i] === 1);
    });

    const valEl = document.getElementById('ic-sevenseg-val');
    if (valEl) valEl.textContent = bcdVal <= 9 ? String(bcdVal) : '-';

  } else {
    // Standard logic gates (AND, OR, NOT, NAND, NOR, XOR)
    ic.gates.forEach(g => {
      const a = pinStates[g.inA] || 0;
      const b = g.inB !== undefined ? (pinStates[g.inB] || 0) : 0;
      const out = ic.evalGate(a, b);
      pinStates[g.out] = out;

      // Update gate card in Gates view
      const gateStatus = document.getElementById(`ic-gate-status-${g.name.replace(/\s+/g, '')}`);
      if (gateStatus) {
        gateStatus.textContent = out ? 'HIGH (1)' : 'LOW (0)';
        gateStatus.classList.toggle('high', out === 1);
      }
      const gateValA = document.getElementById(`ic-gate-valA-${g.name.replace(/\s+/g, '')}`);
      if (gateValA) {
        gateValA.textContent = a;
        gateValA.classList.toggle('high', a === 1);
      }
      const gateValB = document.getElementById(`ic-gate-valB-${g.name.replace(/\s+/g, '')}`);
      if (gateValB) {
        gateValB.textContent = b;
        gateValB.classList.toggle('high', b === 1);
      }
      const gateValOut = document.getElementById(`ic-gate-valOut-${g.name.replace(/\s+/g, '')}`);
      if (gateValOut) {
        gateValOut.textContent = out;
        gateValOut.classList.toggle('high', out === 1);
      }
    });
  }

  // Update DIP pin rendering indicators
  ic.pins.forEach(pin => {
    const val = pinStates[pin.num] || 0;
    const ctrlEl = document.getElementById(`ic-pin-ctrl-${pin.num}`);
    const legEl = document.getElementById(`ic-pin-leg-${pin.num}`);

    if (ctrlEl) {
      if (pin.type === 'power') {
        ctrlEl.textContent = pin.name;
      } else {
        ctrlEl.textContent = val;
        ctrlEl.classList.toggle('high', val === 1);
      }
    }
    if (legEl) {
      legEl.classList.toggle('high', val === 1);
    }
  });

  // Highlight matching table row
  highlightMatchingTableRow(ic);
}

function renderGatesView(ic) {
  const container = document.getElementById('ic-gates-grid');
  if (!container) return;

  let html = '';
  const gateSvg = getGateSvg(ic.gateType);

  ic.gates.forEach(g => {
    const safeName = g.name.replace(/\s+/g, '');
    const hasB = g.inB !== undefined;
    html += `
      <div class="ic-gate-card">
        <div class="ic-gate-header">
          <span>${g.name}</span>
          <span class="ic-gate-status" id="ic-gate-status-${safeName}">LOW (0)</span>
        </div>
        <div class="ic-gate-body">
          <div class="ic-gate-io">
            <div class="ic-io-row">
              <span class="ic-io-label">A:</span>
              <span class="ic-io-val" id="ic-gate-valA-${safeName}">0</span>
            </div>
            ${hasB ? `
            <div class="ic-io-row">
              <span class="ic-io-label">B:</span>
              <span class="ic-io-val" id="ic-gate-valB-${safeName}">0</span>
            </div>` : ''}
            <div class="ic-io-row">
              <span class="ic-io-label">Y:</span>
              <span class="ic-io-val" id="ic-gate-valOut-${safeName}">0</span>
            </div>
          </div>
          <div class="ic-gate-svg-wrap">
            ${gateSvg}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function getGateSvg(gateType) {
  switch (gateType) {
    case 'and':
      return `<svg viewBox="0 0 50 30" class="ic-gate-svg" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 5h15a10 10 0 0 1 0 20H10zM5 10h5M5 20h5M35 15h10"/></svg>`;
    case 'or':
      return `<svg viewBox="0 0 50 30" class="ic-gate-svg" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 5c5 2 7 5 8 10-1 5-3 8-8 10 5-1 12-1 17 0 5-2 8-5 11-10-3-5-6-8-11-10-5 1-12 1-17 0zM5 10h7M5 20h7M38 15h7"/></svg>`;
    case 'not':
      return `<svg viewBox="0 0 50 30" class="ic-gate-svg" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 5l18 10-18 10z"/><circle cx="32" cy="15" r="3"/><path d="M5 15h5M35 15h10"/></svg>`;
    case 'nand':
      return `<svg viewBox="0 0 50 30" class="ic-gate-svg" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 5h14a10 10 0 0 1 0 20H10zM5 10h5M5 20h5"/><circle cx="36" cy="15" r="3"/><path d="M39 15h6"/></svg>`;
    case 'nor':
      return `<svg viewBox="0 0 50 30" class="ic-gate-svg" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 5c5 2 7 5 8 10-1 5-3 8-8 10 5-1 12-1 17 0 5-2 8-5 11-10-3-5-6-8-11-10-5 1-12 1-17 0zM5 10h7M5 20h7"/><circle cx="38" cy="15" r="3"/><path d="M41 15h4"/></svg>`;
    case 'xor':
      return `<svg viewBox="0 0 50 30" class="ic-gate-svg" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5c5 2 7 5 8 10-1 5-3 8-8 10 5-1 12-1 17 0 5-2 8-5 11-10-3-5-6-8-11-10-5 1-12 1-17 0zM7 5c3 3 3 17 0 20M5 10h7M5 20h7M40 15h5"/></svg>`;
    default:
      return `<svg viewBox="0 0 50 30" class="ic-gate-svg" fill="none" stroke="currentColor" stroke-width="2"><rect x="10" y="5" width="30" height="20" rx="3"/><path d="M5 10h5M5 20h5M40 15h5"/></svg>`;
  }
}

function renderTruthTable(ic) {
  const table = document.getElementById('ic-truth-table');
  if (!table) return;

  if (ic.gateType === 'decoder') {
    // 7447 BCD Truth Table
    let html = `
      <thead>
        <tr>
          <th>Decimal</th>
          <th>D (Pin 6)</th>
          <th>C (Pin 2)</th>
          <th>B (Pin 1)</th>
          <th>A (Pin 7)</th>
          <th>a b c d e f g</th>
          <th>Verification</th>
        </tr>
      </thead>
      <tbody>
    `;

    ic.table.forEach((row, idx) => {
      html += `
        <tr id="ic-row-${idx}" onclick="window.applyICTableRow(${idx})">
          <td style="font-weight:800; color:var(--lime, #bef264)">${row.num}</td>
          <td>${row.d}</td>
          <td>${row.c}</td>
          <td>${row.b}</td>
          <td>${row.a}</td>
          <td>${row.segs.join(' ')}</td>
          <td><span class="ic-pass-badge" id="ic-row-badge-${idx}">READY</span></td>
        </tr>
      `;
    });

    html += `</tbody>`;
    table.innerHTML = html;
  } else {
    // Standard gate truth table
    const isSingleInput = ic.gateType === 'not';
    let html = `
      <thead>
        <tr>
          <th>Input A</th>
          ${isSingleInput ? '' : '<th>Input B</th>'}
          <th>Expected Y</th>
          <th>Actual Y</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
    `;

    ic.table.forEach((row, idx) => {
      html += `
        <tr id="ic-row-${idx}" onclick="window.applyICTableRow(${idx})">
          <td>${row.a}</td>
          ${isSingleInput ? '' : `<td>${row.b}</td>`}
          <td style="color:var(--lime, #bef264); font-weight:800">${row.exp}</td>
          <td id="ic-actual-${idx}">-</td>
          <td><span class="ic-pass-badge" id="ic-row-badge-${idx}">READY</span></td>
        </tr>
      `;
    });

    html += `</tbody>`;
    table.innerHTML = html;
  }
}

window.applyICTableRow = function(rowIdx) {
  const ic = IC_DEFINITIONS[currentICKey];
  if (!ic) return;
  const row = ic.table[rowIdx];
  if (!row) return;

  if (ic.gateType === 'decoder') {
    pinStates[7] = row.a;
    pinStates[1] = row.b;
    pinStates[2] = row.c;
    pinStates[6] = row.d;
  } else {
    // Set all gate inputs across the IC to this combination
    ic.gates.forEach(g => {
      pinStates[g.inA] = row.a;
      if (g.inB !== undefined) pinStates[g.inB] = row.b;
    });
  }

  evaluateIC();
  if (window.playSound) window.playSound('click');
};

function highlightMatchingTableRow(ic) {
  if (ic.gateType === 'decoder') {
    const valA = pinStates[7] || 0;
    const valB = pinStates[1] || 0;
    const valC = pinStates[2] || 0;
    const valD = pinStates[6] || 0;
    const bcdVal = (valD << 3) | (valC << 2) | (valB << 1) | valA;

    ic.table.forEach((row, idx) => {
      const tr = document.getElementById(`ic-row-${idx}`);
      if (tr) tr.classList.toggle('active', row.num === bcdVal);
    });
  } else {
    const g1 = ic.gates[0];
    const valA = pinStates[g1.inA] || 0;
    const valB = g1.inB !== undefined ? (pinStates[g1.inB] || 0) : null;

    ic.table.forEach((row, idx) => {
      const isMatch = (row.a === valA) && (valB === null || row.b === valB);
      const tr = document.getElementById(`ic-row-${idx}`);
      if (tr) tr.classList.toggle('active', isMatch);
      const actualCell = document.getElementById(`ic-actual-${idx}`);
      if (actualCell && isMatch) {
        actualCell.textContent = pinStates[g1.out];
      }
    });
  }
}

async function runSelfTest() {
  const ic = IC_DEFINITIONS[currentICKey];
  if (!ic) return;

  const statusText = document.getElementById('ic-diag-text');
  if (statusText) statusText.textContent = `Running diagnostics test suite on ${ic.name}...`;

  let allPassed = true;

  for (let i = 0; i < ic.table.length; i++) {
    window.applyICTableRow(i);
    await new Promise(res => setTimeout(res, 220));

    const row = ic.table[i];
    let rowPass = true;

    if (ic.gateType === 'decoder') {
      const segPins = [13, 12, 11, 10, 9, 15, 14];
      const actualSegs = segPins.map(p => pinStates[p]);
      rowPass = actualSegs.every((s, idx) => s === row.segs[idx]);
    } else {
      ic.gates.forEach(g => {
        const out = pinStates[g.out];
        if (out !== row.exp) rowPass = false;
      });
      const actualCell = document.getElementById(`ic-actual-${i}`);
      if (actualCell) actualCell.textContent = row.exp;
    }

    const badge = document.getElementById(`ic-row-badge-${i}`);
    if (badge) {
      badge.textContent = rowPass ? 'PASS ✓' : 'FAIL ✗';
      badge.className = rowPass ? 'ic-pass-badge' : 'ic-fail-badge';
    }

    if (!rowPass) allPassed = false;
  }

  if (statusText) {
    statusText.innerHTML = allPassed 
      ? `<strong style="color:var(--lime, #bef264)">DIAGNOSTIC PASSED:</strong> All ${ic.pinsCount} pins and gates 100% verified operational.`
      : `<strong style="color:var(--color-error)">DIAGNOSTIC FAILED:</strong> Discrepancy detected in test vectors.`;
  }

  if (allPassed) {
    if (window.playSound) window.playSound('success');
    showToast(`${ic.name} verified: 100% PASS ✓`, 'success');
  } else {
    if (window.playSound) window.playSound('error');
    showToast(`Test suite found errors on ${ic.name}`, 'error');
  }
}
