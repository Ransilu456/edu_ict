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
let selectedPin = null;
let assembled = false;
let componentRecords = [];
let componentState = { led: false, rgb: { red: false, green: false, blue: false } };
let lightColors = { D2: '#ef5350', D3: '#2f80ed', D4: '#27ae60' };
let audioContext = null;
let sirenTimer = null;
let sirenPhase = 0;

export function initBreadboard() {
  if (initialized) {
    window.addEventListener('resize', renderWires);
    renderWires();
    return;
  }
  const stage = document.getElementById('breadboard-stage');
  if (!stage) return;
  initialized = true;
  createHoles();
  createWirePalette();
  bindPartCards();
  stage.addEventListener('dragover', event => event.preventDefault());
  stage.addEventListener('drop', handleDrop);
  document.getElementById('breadboard-clear')?.addEventListener('click', resetBoard);
  document.getElementById('organize-board')?.addEventListener('click', organizeBoard);
  document.getElementById('assemble-board')?.addEventListener('click', assembleBoard);
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
      hole.addEventListener('click', () => {
        if (selectedPin) {
          connectPinToHole(selectedPin, hole.dataset.point);
          selectedPin = null;
          document.querySelectorAll('.component-pin.is-selected').forEach(pin => pin.classList.remove('is-selected'));
          return;
        }
        updateInspector(hole.title, 'Open tie point', 'Select a component pin, then select this hole to patch it.');
      });
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
  document.querySelectorAll('.template-card').forEach(card => card.addEventListener('click', () => loadTemplate(card.dataset.template)));
}

function loadTemplate(template) {
  resetBoard();
  addComponent('microcontroller');
  addComponent('usb');
  if (template === 'rgb') addComponent('rgb');
  if (template === 'blink') addComponent('led');
  if (template === 'blink') addComponent('resistor');
  if (template === 'police') { addComponent('led'); addComponent('led'); addComponent('buzzer'); addComponent('resistor'); addComponent('resistor'); }
  organizeBoard();
  const sourcePower = template === 'rgb' ? '3V3' : 'VBUS';
  connectTemplatePin('usb', sourcePower, '0-0');
  connectTemplatePin('microcontroller', sourcePower, '0-0');
  connectTemplatePin('usb', 'GND', '1-0');
  connectTemplatePin('microcontroller', 'GND', '1-0');
  if (template === 'police') {
    connectTemplatePin('microcontroller', 'D2', '2-0');
    connectTemplatePin('microcontroller', 'D3', '2-1');
    connectTemplatePin('microcontroller', 'D4', '2-2');
    connectTemplatePin('led', 'A', '2-3', 0);
    connectTemplatePin('led', 'K', '1-0', 0);
    connectTemplatePin('resistor', '1', '2-0', 0);
    connectTemplatePin('resistor', '2', '2-3', 0);
    connectTemplatePin('led', 'A', '2-4', 1);
    connectTemplatePin('led', 'K', '1-0', 1);
    connectTemplatePin('resistor', '1', '2-1', 1);
    connectTemplatePin('resistor', '2', '2-4', 1);
    connectTemplatePin('buzzer', '+', '2-2');
    connectTemplatePin('buzzer', 'GND', '1-0');
      document.getElementById('board-code').value = 'pinMode(D2, OUTPUT);\npinMode(D3, OUTPUT);\npinMode(D4, OUTPUT);\nsetLightColor(D2, "#ff3045");\nsetLightColor(D3, "#2f80ed");\ntone(BUZZER, 900);\ndigitalWrite(D2, HIGH);\ndigitalWrite(D3, LOW);\ndigitalWrite(D4, HIGH);\ndelay(520);';
  } else if (template === 'rgb') {
    connectTemplatePin('microcontroller', 'D2', '2-0');
    connectTemplatePin('microcontroller', 'D3', '2-1');
    connectTemplatePin('microcontroller', 'D4', '2-2');
    connectTemplatePin('rgb', 'R', '2-0');
    connectTemplatePin('rgb', 'G', '2-1');
    connectTemplatePin('rgb', 'B', '2-2');
    connectTemplatePin('rgb', 'COM', '1-0');
    document.getElementById('board-code').value = 'pinMode(D2, OUTPUT);\npinMode(D3, OUTPUT);\npinMode(D4, OUTPUT);\ndigitalWrite(D2, HIGH);\ndigitalWrite(D3, LOW);\ndigitalWrite(D4, LOW);';
  } else {
    connectTemplatePin('microcontroller', 'D2', '2-0');
    connectTemplatePin('resistor', '1', '2-0');
    connectTemplatePin('resistor', '2', '2-1');
    connectTemplatePin('led', 'A', '2-1');
    connectTemplatePin('led', 'K', '1-0');
    document.getElementById('board-code').value = 'pinMode(LED_BUILTIN, OUTPUT);\ndigitalWrite(LED_BUILTIN, HIGH);';
  }
  updateInspector('Template loaded', template === 'police' ? 'Police siren ready' : template === 'rgb' ? 'RGB signal lamp ready' : 'USB blink circuit ready', 'Press Assemble & power on, then Run sketch.');
}

function connectTemplatePin(type, pin, hole, occurrence = 0) {
  const records = componentRecords.filter(item => item.type === type);
  const record = records[occurrence];
  if (record) connectPinToHole({ componentId: record.id, pin, type }, hole);
}

function organizeBoard() {
  const board = document.querySelector('.breadboard-surface');
  if (!board) return;
  const components = Array.from(document.querySelectorAll('.board-component'));
  const left = components.filter(component => ['usb', 'battery', 'microcontroller'].includes(component.dataset.component));
  const middle = components.filter(component => component.dataset.component === 'resistor');
  const right = components.filter(component => ['led', 'rgb', 'buzzer'].includes(component.dataset.component));
  const gap = board.clientWidth < 600 ? 8 : 18;
  const columnWidth = Math.max(132, Math.floor((board.clientWidth - 56) / 3));
  const columns = [20, 20 + columnWidth + gap, 20 + (columnWidth + gap) * 2];
  const placeColumn = (items, columnIndex) => {
    let y = 24;
    items.forEach(component => {
      const width = component.offsetWidth || columnWidth;
      const height = component.offsetHeight || 90;
      const x = Math.min(columns[columnIndex], board.clientWidth - width - 8);
      component.style.left = `${Math.max(8, x)}px`;
      component.style.top = `${Math.min(y, Math.max(8, board.clientHeight - height - 8))}px`;
      y += height + gap;
    });
  };
  placeColumn(left, 0);
  if (board.clientWidth < 600) {
    placeColumn([...middle, ...right], 1);
  } else {
    placeColumn(middle, 1);
    placeColumn(right, 2);
  }
  renderWires();
  updateInspector('Circuit organized', 'Components aligned by function', 'Power and controller parts are grouped left; outputs and loads are grouped right.');
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
  const componentId = `component-${componentCount}`;
  component.className = `board-component component-${type}`;
  if (type === 'led' && componentRecords.some(record => record.type === 'led')) component.classList.add('component-led-blue');
  component.style.left = `${x}px`;
  component.style.top = `${y}px`;
  component.dataset.component = type;
  component.dataset.componentId = componentId;
  component.innerHTML = componentMarkup(type);
  components.append(component);
  componentRecords.push({ id: componentId, type });
  component.querySelector('.component-top')?.addEventListener('pointerdown', event => startComponentDrag(event, component));
  component.addEventListener('click', event => {
    if (event.target.closest('.component-pin')) return;
    updateInspector(componentTitle(type), 'Component placed on board', pinSummary(type));
  });
  component.querySelectorAll('.component-pin').forEach(pin => pin.addEventListener('click', event => {
    event.stopPropagation();
    selectedPin = { componentId, pin: pin.dataset.pin, type };
    document.querySelectorAll('.component-pin.is-selected').forEach(item => item.classList.remove('is-selected'));
    pin.classList.add('is-selected');
    updateInspector(`${type.toUpperCase()} / ${pin.dataset.pin}`, 'Pin selected', 'Now select a breadboard hole to make this pin connection.');
  }));
  updateInspector(componentTitle(type), 'Component placed on board', pinSummary(type));
}

function componentTitle(type) {
  return { microcontroller: 'LogicQuest MCU', usb: 'USB programmer', battery: '3V battery', resistor: '220R resistor', rgb: 'RGB LED', led: 'Red LED', buzzer: 'Piezo buzzer' }[type] || `${type.toUpperCase()} added`;
}

function componentMarkup(type) {
  if (type === 'microcontroller') {
    return `<div class="component-top"><span>CONTROLLER</span><b>LQ-MCU</b></div><img class="component-art" src="/svg/breadboard/microcontroller.svg" alt="LogicQuest microcontroller"><div class="component-pins pin-left"><button class="component-pin" data-pin="D2" data-kind="GPIO output">D2</button><button class="component-pin" data-pin="D3" data-kind="GPIO output">D3</button><button class="component-pin" data-pin="D4" data-kind="GPIO input">D4</button></div><div class="component-pins pin-right"><button class="component-pin power-pin" data-pin="3V3" data-kind="Power input" data-detail="Regulated 3.3 volt supply input.">3V3</button><button class="component-pin power-pin" data-pin="VBUS" data-kind="USB power input" data-detail="5 volt USB bus input, regulated to 3.3V.">VBUS</button><button class="component-pin ground-pin" data-pin="GND" data-kind="Ground reference" data-detail="0 volt ground reference.">GND</button></div>`;
  }
  if (type === 'usb') return '<div class="component-top"><span>PROGRAMMER</span><b>USB BRIDGE</b></div><img class="component-art" src="/svg/breadboard/usb-programmer.svg" alt="USB programmer"><div class="component-pins pin-left"><button class="component-pin power-pin" data-pin="VBUS" data-kind="5V power output">VBUS</button><button class="component-pin power-pin" data-pin="3V3" data-kind="3.3V power output">3V3</button><button class="component-pin ground-pin" data-pin="GND" data-kind="Ground reference">GND</button></div><div class="component-pins pin-right"><button class="component-pin" data-pin="PROG" data-kind="Programming data">PROG</button></div>';
  if (type === 'battery') return '<div class="component-top"><span>POWER SOURCE</span><b>3V CELL</b></div><img class="component-art" src="/svg/breadboard/battery.svg" alt="3 volt battery"><div class="component-pins pin-left"><button class="component-pin power-pin" data-pin="VCC" data-kind="Positive voltage output">VCC</button></div><div class="component-pins pin-right"><button class="component-pin ground-pin" data-pin="GND" data-kind="Ground reference">GND</button></div>';
  if (type === 'resistor') return '<div class="component-top"><span>PASSIVE</span><b>220 OHM</b></div><img class="component-art" src="/svg/breadboard/resistor.svg" alt="220 ohm resistor"><div class="component-pins pin-left"><button class="component-pin" data-pin="1" data-kind="Resistor terminal">1</button></div><div class="component-pins pin-right"><button class="component-pin" data-pin="2" data-kind="Resistor terminal">2</button></div>';
  if (type === 'buzzer') return '<div class="component-top"><span>OUTPUT</span><b>PIEZO</b></div><img class="component-art" src="/svg/breadboard/buzzer.svg" alt="Piezo buzzer"><div class="component-pins pin-left"><button class="component-pin power-pin" data-pin="+" data-kind="Tone input">+</button></div><div class="component-pins pin-right"><button class="component-pin ground-pin" data-pin="GND" data-kind="Ground return">GND</button></div>';
  const rgb = type === 'rgb';
  return `<div class="component-top"><span>OUTPUT</span><b>${rgb ? 'RGB LED' : 'LED'}</b></div><div class="led-lamp ${rgb ? 'rgb-lamp' : ''}" data-led="${type}"><img class="component-art" src="/svg/breadboard/${rgb ? 'rgb-led' : 'led'}.svg" alt="${rgb ? 'RGB LED' : 'LED'}"><span class="light-lens lens-red" data-channel="red"></span>${rgb ? '<span class="light-lens lens-green" data-channel="green"></span><span class="light-lens lens-blue" data-channel="blue"></span>' : ''}</div><div class="component-pins pin-left">${rgb ? '<button class="component-pin" data-pin="R">R</button><button class="component-pin" data-pin="G">G</button><button class="component-pin" data-pin="B">B</button>' : '<button class="component-pin" data-pin="A" data-kind="Anode / voltage input">A</button>'}</div><div class="component-pins pin-right"><button class="component-pin ground-pin" data-pin="K" data-kind="Cathode / GND">${rgb ? 'COM' : 'K'}</button></div>`;
}

function pinSummary(type) {
  if (type === 'microcontroller') return 'D2, D3, D4 are GPIO. 3V3 and VBUS are power inputs. GND is 0V reference.';
  if (type === 'usb') return 'VBUS supplies 5V, 3V3 supplies regulated voltage, GND is the reference, and PROG carries programming data.';
  if (type === 'battery') return 'VCC supplies 3.0V. GND is the return path. Never reverse the polarity.';
  if (type === 'resistor') return '220 ohm current limiter. Both terminals are passive and directional wiring is not required.';
  if (type === 'buzzer') return 'The + pin receives a GPIO tone signal. GND is the return path. Audio is generated only after assembly.';
  return type === 'rgb' ? 'R, G, B accept signal voltage. COM returns to GND.' : 'A is the anode input. K returns to GND. Use a resistor for a physical circuit.';
}

function addWire(color, clientX, clientY) {
  const point = nearestPoint(clientX, clientY);
  if (!point) return;
  const wire = { id: `wire-${Date.now()}-${wires.length}`, color, start: point, end: point };
  wires.push(wire);
  assembled = false;
  document.getElementById('breadboard-stage')?.classList.remove('is-assembled');
  refreshLights(new Set());
  renderWires();
  updateStatus();
}

function connectPinToHole(pin, hole) {
  wires.push({ id: `pin-wire-${Date.now()}-${wires.length}`, color: pinColor(pin.pin), start: { type: 'pin', componentId: pin.componentId, pin: pin.pin }, end: hole });
  assembled = false;
  document.getElementById('breadboard-stage')?.classList.remove('is-assembled');
  refreshLights(new Set());
  renderWires();
  updateStatus();
  updateInspector(`${pin.type.toUpperCase()} / ${pin.pin}`, 'Connected to tie point', `Signal is now patched to hole ${holeName(hole)}.`);
}

function pinColor(pin) {
  if (['GND', 'K', 'COM'].includes(pin)) return '#263238';
  if (['3V3', 'VBUS', 'VCC'].includes(pin)) return '#ef5350';
  return '#2f80ed';
}

function holeName(point) {
  const [row, column] = point.split('-');
  return `${String.fromCharCode(65 + Number(row))}${Number(column) + 1}`;
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
  if (point && point.type === 'pin') {
    const pin = document.querySelector(`[data-component-id="${point.componentId}"] [data-pin="${point.pin}"]`);
    if (pin) {
      const rect = pin.getBoundingClientRect();
      return { x: rect.left + rect.width / 2 - boardRect.left, y: rect.top + rect.height / 2 - boardRect.top };
    }
  }
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

function startComponentDrag(event, component) {
  const board = document.querySelector('.breadboard-surface');
  if (!board) return;
  const boardRect = board.getBoundingClientRect();
  const componentRect = component.getBoundingClientRect();
  const offsetX = event.clientX - componentRect.left;
  const offsetY = event.clientY - componentRect.top;
  const move = moveEvent => {
    const nextX = Math.max(8, Math.min(boardRect.width - componentRect.width - 8, moveEvent.clientX - boardRect.left - offsetX));
    const nextY = Math.max(8, Math.min(boardRect.height - componentRect.height - 8, moveEvent.clientY - boardRect.top - offsetY));
    component.style.left = `${nextX}px`;
    component.style.top = `${nextY}px`;
    renderWires();
  };
  const stop = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', stop);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', stop, { once: true });
  event.preventDefault();
}

function assembleBoard() {
  const mcu = componentRecords.find(component => component.type === 'microcontroller');
  const source = componentRecords.find(component => component.type === 'usb' || component.type === 'battery');
  const missing = [];
  if (!mcu) missing.push('LogicQuest MCU');
  if (!source) missing.push('USB programmer or battery');
  const powerLinked = source?.type === 'usb'
    ? pinsShareHole(source.id, 'VBUS', mcu?.id, 'VBUS') || pinsShareHole(source.id, '3V3', mcu?.id, '3V3')
    : pinsShareHole(source?.id, 'VCC', mcu?.id, '3V3');
  if (mcu && source && !powerLinked) missing.push(source.type === 'usb' ? 'USB power -> MCU power' : 'VCC -> MCU 3V3');
  if (mcu && source && !pinsShareHole(source.id, 'GND', mcu.id, 'GND')) missing.push('shared GND rail');
  if (missing.length) {
    assembled = false;
    document.getElementById('breadboard-stage')?.classList.remove('is-assembled');
    updateStatus();
    updateInspector('Assembly incomplete', 'Connect the required pins', `Still needed: ${missing.join(', ')}.`);
    return;
  }
  assembled = true;
  document.getElementById('breadboard-stage')?.classList.add('is-assembled');
  updateStatus();
  updateInspector('Assembly complete', 'Power rails verified', 'The MCU has power and ground. The sketch can now run.');
}

function hasPinConnection(componentId, pin) {
  return wires.some(wire => [wire.start, wire.end].some(endpoint => endpoint?.type === 'pin' && endpoint.componentId === componentId && endpoint.pin === pin));
}

function pinsShareHole(firstComponent, firstPin, secondComponent, secondPin) {
  const firstHoles = connectionHoles(firstComponent, firstPin);
  const secondHoles = connectionHoles(secondComponent, secondPin);
  return firstHoles.some(hole => secondHoles.includes(hole));
}

function connectionHoles(componentId, pin) {
  return wires.flatMap(wire => {
    if (wire.start?.type === 'pin' && wire.start.componentId === componentId && wire.start.pin === pin && typeof wire.end === 'string') return [wire.end];
    if (wire.end?.type === 'pin' && wire.end.componentId === componentId && wire.end.pin === pin && typeof wire.start === 'string') return [wire.start];
    return [];
  });
}

function runSketch() {
  if (!assembled) {
    assembleBoard();
    if (!assembled) return;
  }
  const code = document.getElementById('board-code')?.value || '';
  lightColors = { ...lightColors, ...parseLightColors(code) };
  const highPins = new Set();
  const writes = code.matchAll(/digitalWrite\s*\(\s*([^,]+),\s*(HIGH|LOW)\s*\)/gi);
  for (const [, rawPin, level] of writes) {
    const pin = rawPin.trim().toUpperCase();
    if (level.toUpperCase() === 'HIGH') highPins.add(pin === 'LED_BUILTIN' ? 'D2' : pin);
  }
  refreshLights(highPins);
  const toneMatch = code.match(/tone\s*\(\s*([^,]+),\s*(\d+)/i);
  const toneEnabled = toneMatch && !/\bnoTone\s*\(/i.test(code);
  const buzzer = componentRecords.find(component => component.type === 'buzzer');
  const buzzerOn = toneEnabled && buzzer && [...highPins].some(pin => sameNetToHighPin(buzzer.id, '+', pin));
  setBuzzerSound(buzzerOn, toneMatch ? Number(toneMatch[2]) : 760);
  if (buzzer && toneEnabled) startSiren(parseDelay(code));
  if (buzzer && !toneEnabled) window.clearInterval(sirenTimer);
  const high = highPins.size > 0;
  const state = document.getElementById('code-state');
  if (state) { state.textContent = high ? 'RUNNING / HIGH' : 'RUNNING / LOW'; state.classList.toggle('is-running', high); }
  updateInspector('Sketch executed', high ? 'GPIO output is HIGH (3.3V)' : 'GPIO output is LOW (0V)', 'The virtual LED state follows digitalWrite().');
}

function parseDelay(code) {
  const match = code.match(/(?:delay|sleep)\s*\(\s*(\d+)\s*\)/i);
  return Math.max(100, Math.min(5000, Number(match?.[1] || 520)));
}

function startSiren(delayMs = 520) {
    window.clearInterval(sirenTimer);
  sirenPhase = 0;
    sirenTimer = window.setInterval(() => {
    sirenPhase = (sirenPhase + 1) % 4;
    const highPins = sirenPhase === 1 ? new Set(['D2', 'D4']) : sirenPhase === 3 ? new Set(['D3', 'D4']) : new Set(['D4']);
      refreshLights(highPins);
    setBuzzerSound(true, sirenPhase === 3 ? 560 : 900);
  }, delayMs);
}

function refreshLights(highPins) {
  document.querySelectorAll('.led-lamp').forEach(lamp => {
    const component = lamp.closest('.board-component');
    const type = lamp.dataset.led;
    const record = componentRecords.find(item => item.id === component?.dataset.componentId);
    if (!record || !component) return;
    const commonGround = netHasGround(record.id, type === 'rgb' ? 'COM' : 'K');
    const channels = type === 'rgb'
      ? { red: netHasHigh(record.id, 'R', highPins), green: netHasHigh(record.id, 'G', highPins), blue: netHasHigh(record.id, 'B', highPins) }
      : { red: netHasHigh(record.id, 'A', highPins) };
    const anyLit = commonGround && Object.values(channels).some(Boolean);
    lamp.classList.toggle('is-lit', anyLit);
    lamp.querySelectorAll('[data-channel]').forEach(lens => {
      const channel = lens.dataset.channel;
      const pin = type === 'rgb' ? channel === 'red' ? 'R' : channel === 'green' ? 'G' : 'B' : 'A';
      const highPin = connectedHighPin(record.id, pin, highPins);
      lens.style.setProperty('--lamp-color', lightColors[highPin] || '#ef5350');
      lens.classList.toggle('is-on', anyLit && channels[channel]);
    });
  });
  document.querySelectorAll('.component-buzzer').forEach(buzzer => buzzer.classList.toggle('is-buzzing', assembled && netHasGround(buzzer.dataset.componentId, 'GND') && [...highPins].some(pin => sameNetToHighPin(buzzer.dataset.componentId, '+', pin))));
}

function sameNetToHighPin(componentId, pin, highPin) {
  const mcu = componentRecords.find(item => item.type === 'microcontroller');
  return mcu && sameNet(componentId, pin, mcu.id, highPin);
}

function setBuzzerSound(active, frequency) {
  document.querySelectorAll('.component-buzzer').forEach(buzzer => buzzer.classList.toggle('is-buzzing', Boolean(active)));
  if (!active) {
    if (audioContext) audioContext.suspend();
    return;
  }
  audioContext ||= new AudioContext();
  audioContext.resume();
  if (!window.__logicQuestBuzzer) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.035;
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    window.__logicQuestBuzzer = { oscillator, gain };
  }
  window.__logicQuestBuzzer.oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  window.__logicQuestBuzzer.gain.gain.setTargetAtTime(0.035, audioContext.currentTime, 0.02);
}

function netHasHigh(componentId, pin, highPins) {
  return [...highPins].some(highPin => {
    const mcu = componentRecords.find(item => item.type === 'microcontroller');
    return mcu && highPin === highPin.toUpperCase() && sameNet(componentId, pin, mcu.id, highPin);
  }) || ['VBUS', '3V3', 'VCC'].some(powerPin => sameNetToPower(componentId, pin, powerPin));
}

function netHasGround(componentId, pin) {
  return componentRecords.some(source => ['usb', 'battery', 'microcontroller'].includes(source.type) && sameNet(componentId, pin, source.id, 'GND'));
}

function sameNetToPower(componentId, pin, powerPin) {
  return componentRecords.some(source => {
    const sourcePins = source.type === 'battery' ? ['VCC'] : ['VBUS', '3V3'];
    return sourcePins.includes(powerPin) && sameNet(componentId, pin, source.id, powerPin);
  });
}

function sameNet(firstComponent, firstPin, secondComponent, secondPin) {
  const first = pinNet(firstComponent, firstPin);
  const second = pinNet(secondComponent, secondPin);
  return [...first].some(hole => second.has(hole));
}

function pinNet(componentId, pin) {
  const roots = connectionHoles(componentId, pin);
  const graph = new Map();
  wires.forEach(wire => {
    if (typeof wire.start !== 'string' || typeof wire.end !== 'string') return;
    if (!graph.has(wire.start)) graph.set(wire.start, []);
    if (!graph.has(wire.end)) graph.set(wire.end, []);
    graph.get(wire.start).push(wire.end);
    graph.get(wire.end).push(wire.start);
  });
  componentRecords.filter(component => component.type === 'resistor').forEach(resistor => {
    const first = connectionHoles(resistor.id, '1');
    const second = connectionHoles(resistor.id, '2');
    first.forEach(firstHole => second.forEach(secondHole => {
      if (!graph.has(firstHole)) graph.set(firstHole, []);
      if (!graph.has(secondHole)) graph.set(secondHole, []);
      graph.get(firstHole).push(secondHole);
      graph.get(secondHole).push(firstHole);
    }));
  });
  const result = new Set(roots);
  const queue = [...roots];
  while (queue.length) {
    const current = queue.shift();
    (graph.get(current) || []).forEach(next => {
      if (!result.has(next)) { result.add(next); queue.push(next); }
    });
  }
  return result;
}

function resetBoard() {
  wires = [];
  componentCount = 0;
  selectedPin = null;
  assembled = false;
  componentRecords = [];
  lightColors = { D2: '#ef5350', D3: '#2f80ed', D4: '#27ae60' };
  window.clearInterval(sirenTimer);
  sirenTimer = null;
  componentState = { led: false, rgb: { red: false, green: false, blue: false } };
  setBuzzerSound(false, 760);
  document.getElementById('board-components').innerHTML = '';
  document.getElementById('breadboard-wires').innerHTML = '';
  document.getElementById('breadboard-stage')?.classList.remove('is-assembled');
  const state = document.getElementById('code-state');
  if (state) { state.textContent = 'IDLE'; state.classList.remove('is-running'); }
  updateStatus();
  updateInspector('Board reset', 'Ready for a new circuit', 'Drag a part from the drawer to begin.');
}


function updateStatus() {
  const count = document.getElementById('breadboard-count');
  if (count) count.textContent = `${wires.length} connection${wires.length === 1 ? '' : 's'}`;
  const status = document.getElementById('breadboard-status');
  if (status) status.textContent = assembled ? 'POWERED' : wires.length ? 'PATCHED' : 'READY';
}

function updateInspector(title, value, detail) {
  const inspector = document.getElementById('breadboard-inspector');
  if (inspector) inspector.innerHTML = `<span class="inspector-kicker">PIN INSPECTOR</span><strong>${title}</strong><span>${value} · ${detail}</span>`;
}

function parseLightColors(code) {
  const colors = {};
  for (const [, pin, color] of code.matchAll(/setLightColor\s*\(\s*([A-Z0-9_]+)\s*,\s*["'](#[0-9a-f]{6})["']\s*\)/gi)) colors[pin.toUpperCase()] = color;
  return colors;
}

function connectedHighPin(componentId, pin, highPins) {
  const mcu = componentRecords.find(item => item.type === 'microcontroller');
  return mcu ? [...highPins].find(highPin => sameNet(componentId, pin, mcu.id, highPin)) || pin : pin;
}