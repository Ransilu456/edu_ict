const WIRE_COLORS = [
  { name: 'signal blue', color: '#2f80ed' },
  { name: 'power red', color: '#ef5350' },
  { name: 'ground black', color: '#263238' },
  { name: 'signal green', color: '#27ae60' },
  { name: 'signal yellow', color: '#f2c94c' },
  { name: 'signal orange', color: '#f2994a' },
];

let initialized = false;
let wires = [];
let componentCount = 0;
let componentState = { led: false, rgb: { red: false, green: false, blue: false } };

export function initBreadboard() {
  if (initialized) return;
  const stage = document.getElementById('breadboard-stage');
  if (!stage) return;
  initialized = true;
  createHoles();
  createWirePalette();
  bindPartCards();
  stage.addEventListener('dragover', event => event.preventDefault());
  stage.addEventListener('drop', handleDrop);
  document.getElementById('breadboard-clear')?.addEventListener('click', resetBoard);
  document.getElementById('run-sketch')?.addEventListener('click', runSketch);
  document.getElementById('board-code')?.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') runSketch();
  });
  window.addEventListener('resize', renderWires);
  updateInspector('Ready to prototype', 'Drag a part or jumper wire onto the board.', 'Every connection snaps to a physical tie point.');
}

export function cleanupBreadboard() {
  if (!initialized) return;
  window.removeEventListener('resize', renderWires);
}

function createHoles() {
  const holes = document.getElementById('breadboard-holes');
  const railHoles = document.querySelectorAll('.rail-holes');
  if (!holes) return;
  for (let row = 0; row < 10; row += 1) {
    for (let column = 0; column < 30; column += 1) {
      const hole = document.createElement('button');
      hole.type = 'button';
      hole.className = 'tie-point';
      hole.dataset.point = `${row}-${column}`;
      hole.title = `Tie point ${String.fromCharCode(65 + row)}${column + 1}`;
      hole.addEventListener('click', () => updateInspector(hole.title, 'Open tie point', 'Drop a wire endpoint here to make a connection.'));
      holes.append(hole);
    }
  }
  railHoles.forEach(rail => {
    for (let index = 0; index < 30; index += 1) {
      const hole = document.createElement('span');
      hole.className = 'rail-point';
      rail.append(hole);
    }
  });
}

function createWirePalette() {
  const palette = document.getElementById('wire-palette');
  if (!palette) return;
  WIRE_COLORS.forEach(({ name, color }) => {
    const wire = document.createElement('div');
    wire.className = 'wire-swatch';
    wire.draggable = true;
    wire.title = `Drag ${name} wire`;
    wire.dataset.color = color;
    wire.innerHTML = `<svg viewBox="0 0 88 28" aria-hidden="true"><path d="M7 14h28c9 0 9-8 18-8h28" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/><circle cx="7" cy="14" r="3" fill="${color}"/><circle cx="81" cy="6" r="3" fill="${color}"/></svg>`;
    wire.addEventListener('dragstart', event => event.dataTransfer.setData('application/x-wire-color', color));
    palette.append(wire);
  });
}

function bindPartCards() {
  document.querySelectorAll('.part-card').forEach(card => {
    card.addEventListener('click', () => addComponent(card.dataset.part));
    card.addEventListener('dragstart', event => event.dataTransfer.setData('application/x-part', card.dataset.part));
  });
}

function handleDrop(event) {
  event.preventDefault();
  const part = event.dataTransfer.getData('application/x-part');
  const color = event.dataTransfer.getData('application/x-wire-color');
  if (part) addComponent(part, event.clientX, event.clientY);
  if (color) addWire(color, event.clientX, event.clientY);
}

function addComponent(type, clientX, clientY) {
  const stage = document.getElementById('breadboard-stage');
  const board = document.querySelector('.breadboard-surface');
  const components = document.getElementById('board-components');
  if (!stage || !board || !components) return;
  const boardRect = board.getBoundingClientRect();
  const x = clientX ? Math.max(16, clientX - boardRect.left - 90) : 80 + (componentCount % 3) * 120;
  const y = clientY ? Math.max(20, clientY - boardRect.top - 30) : 60 + (componentCount % 2) * 110;
  componentCount += 1;
  const component = document.createElement('div');
  component.className = `board-component component-${type}`;
  component.style.left = `${x}px`;
  component.style.top = `${y}px`;
  component.dataset.component = type;
  component.innerHTML = componentMarkup(type);
  components.append(component);
  component.addEventListener('click', event => {
    if (event.target.closest('.component-pin')) return;
    updateInspector(type === 'microcontroller' ? 'LogicQuest MCU' : type === 'rgb' ? 'RGB LED' : 'Red LED', 'Component placed on board', pinSummary(type));
  });
  component.querySelectorAll('.component-pin').forEach(pin => pin.addEventListener('click', event => {
    event.stopPropagation();
    updateInspector(`${type.toUpperCase()} / ${pin.dataset.pin}`, pin.dataset.kind || 'Signal pin', pin.dataset.detail || 'This pin can be connected to a breadboard tie point.');
  }));
  updateInspector(type === 'microcontroller' ? 'LogicQuest MCU' : `${type.toUpperCase()} added`, 'Component placed on board', pinSummary(type));
}

function componentMarkup(type) {
  if (type === 'microcontroller') {
    return `<div class="component-top"><span>CONTROLLER</span><b>LQ-MCU</b></div><img src="/svg/breadboard/logicquest-mcu.svg" alt="LogicQuest microcontroller"><div class="component-pins pin-left"><button class="component-pin" data-pin="D2" data-kind="GPIO output">D2</button><button class="component-pin" data-pin="D3" data-kind="GPIO output">D3</button><button class="component-pin" data-pin="D4" data-kind="GPIO input">D4</button></div><div class="component-pins pin-right"><button class="component-pin power-pin" data-pin="3V3" data-kind="Power output" data-detail="Regulated 3.3 volt output.">3V3</button><button class="component-pin ground-pin" data-pin="GND" data-kind="Ground reference" data-detail="0 volt ground reference.">GND</button></div>`;
  }
  const rgb = type === 'rgb';
  return `<div class="component-top"><span>OUTPUT</span><b>${rgb ? 'RGB LED' : 'LED'}</b></div><div class="led-lamp ${rgb ? 'rgb-lamp' : ''}" data-led="${type}"><i></i><i></i><i></i></div><div class="component-pins pin-left">${rgb ? '<button class="component-pin" data-pin="R">R</button><button class="component-pin" data-pin="G">G</button><button class="component-pin" data-pin="B">B</button>' : '<button class="component-pin" data-pin="A" data-kind="Anode / voltage input">A</button>'}</div><div class="component-pins pin-right"><button class="component-pin ground-pin" data-pin="K" data-kind="Cathode / GND">${rgb ? 'COM' : 'K'}</button></div>`;
}

function pinSummary(type) {
  if (type === 'microcontroller') return 'D2, D3, D4 are GPIO. 3V3 supplies regulated voltage. GND is 0V reference.';
  return type === 'rgb' ? 'R, G, B accept signal voltage. COM returns to GND.' : 'A is the anode input. K returns to GND. Use a resistor for a physical circuit.';
}

function addWire(color, clientX, clientY) {
  const point = nearestPoint(clientX, clientY);
  if (!point) return;
  const wire = { id: `wire-${Date.now()}-${wires.length}`, color, start: point, end: point };
  wires.push(wire);
  renderWires();
  updateStatus();
}

function nearestPoint(clientX, clientY) {
  const points = Array.from(document.querySelectorAll('.tie-point'));
  if (!points.length) return null;
  let best = points[0];
  let distance = Infinity;
  points.forEach(point => {
    const rect = point.getBoundingClientRect();
    const current = Math.hypot(clientX - (rect.left + rect.width / 2), clientY - (rect.top + rect.height / 2));
    if (current < distance) { distance = current; best = point; }
  });
  return best.dataset.point;
}

function renderWires() {
  const svg = document.getElementById('breadboard-wires');
  const board = document.querySelector('.breadboard-surface');
  if (!svg || !board) return;
  const rect = board.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  svg.innerHTML = wires.map((wire, index) => {
    const start = pointPosition(wire.start, rect);
    const end = pointPosition(wire.end, rect);
    const bend = Math.max(24, Math.abs(end.x - start.x) * 0.35);
    return `<path class="board-wire" d="M ${start.x} ${start.y} C ${start.x + bend} ${start.y}, ${end.x - bend} ${end.y}, ${end.x} ${end.y}" stroke="${wire.color}"/><circle class="wire-handle" data-wire="${index}" data-end="start" cx="${start.x}" cy="${start.y}" r="7" fill="${wire.color}"/><circle class="wire-handle" data-wire="${index}" data-end="end" cx="${end.x}" cy="${end.y}" r="7" fill="${wire.color}"/>`;
  }).join('');
  svg.querySelectorAll('.wire-handle').forEach(handle => handle.addEventListener('pointerdown', startWireDrag));
}

function pointPosition(point, boardRect) {
  const element = document.querySelector(`[data-point="${point}"]`);
  if (!element) return { x: 20, y: 20 };
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2 - boardRect.left, y: rect.top + rect.height / 2 - boardRect.top };
}

function startWireDrag(event) {
  const handle = event.currentTarget;
  const wire = wires[Number(handle.dataset.wire)];
  const end = handle.dataset.end;
  const move = moveEvent => {
    const point = nearestPoint(moveEvent.clientX, moveEvent.clientY);
    if (point) wire[end] = point;
    renderWires();
    updateStatus();
  };
  const stop = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', stop); };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', stop, { once: true });
  event.preventDefault();
}

function runSketch() {
  const code = document.getElementById('board-code')?.value || '';
  const high = /digitalWrite\s*\([^,]+,\s*HIGH\s*\)/i.test(code);
  componentState.led = high;
  componentState.rgb = { red: /digitalWrite\s*\(\s*RED/i.test(code) && high, green: /digitalWrite\s*\(\s*GREEN/i.test(code) && high, blue: /digitalWrite\s*\(\s*BLUE/i.test(code) && high };
  document.querySelectorAll('.led-lamp').forEach(lamp => {
    const type = lamp.dataset.led;
    lamp.classList.toggle('is-lit', type === 'led' ? componentState.led : Object.values(componentState.rgb).some(Boolean));
    lamp.classList.toggle('is-rgb-lit', type === 'rgb' && componentState.rgb.red);
  });
  const state = document.getElementById('code-state');
  if (state) { state.textContent = high ? 'RUNNING / HIGH' : 'RUNNING / LOW'; state.classList.toggle('is-running', high); }
  updateInspector('Sketch executed', high ? 'GPIO output is HIGH (3.3V)' : 'GPIO output is LOW (0V)', 'The virtual LED state follows digitalWrite().');
}

function resetBoard() {
  wires = [];
  componentCount = 0;
  componentState = { led: false, rgb: { red: false, green: false, blue: false } };
  document.getElementById('board-components').innerHTML = '';
  document.getElementById('breadboard-wires').innerHTML = '';
  const state = document.getElementById('code-state');
  if (state) { state.textContent = 'IDLE'; state.classList.remove('is-running'); }
  updateStatus();
  updateInspector('Board reset', 'Ready for a new circuit', 'Drag a part from the drawer to begin.');
}

function updateStatus() {
  const count = document.getElementById('breadboard-count');
  if (count) count.textContent = `${wires.length} connection${wires.length === 1 ? '' : 's'}`;
  const status = document.getElementById('breadboard-status');
  if (status) status.textContent = wires.length ? 'PATCHED' : 'READY';
}

function updateInspector(title, value, detail) {
  const inspector = document.getElementById('breadboard-inspector');
  if (inspector) inspector.innerHTML = `<span class="inspector-kicker">PIN INSPECTOR</span><strong>${title}</strong><span>${value} · ${detail}</span>`;
}