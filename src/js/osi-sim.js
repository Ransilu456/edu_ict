import './common.js';

let osiReady = false;
let osiAbort = false;
let osiAnimTimer = null;
let rsaGenerated = false;
let rsaKeys = {};

// SVG icon set — no emojis
const I = {
  doc: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 2h6l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M11 2v4h4"/></svg>',
  wrench: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 1.3a1 1 0 0 0-1.4 0l-2.8 2.8a4 4 0 0 0-5 5.7L2 13.3A2 2 0 0 0 4.7 16l3.5-3.5a4 4 0 0 0 5.7-5l2.8-2.8a1 1 0 0 0 0-1.4z"/></svg>',
  link: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 10a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-2 2"/><path d="M12 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l2-2"/></svg>',
  box: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6l7-4 7 4v8l-7 4-7-4V6z"/><path d="M3 6l7 4 7-4M10 10v8"/></svg>',
  globe: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="8"/><path d="M2 10h16M10 2a15.3 15.3 0 0 1 4 8 15.3 15.3 0 0 1-4 8 15.3 15.3 0 0 1-4-8 15.3 15.3 0 0 1 4-8z"/></svg>',
  plug: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V2M10 8v5M6 13h8a2 2 0 0 1 2 2v3H4v-3a2 2 0 0 1 2-2z"/></svg>',
  bolt: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 1L5 11h4l-1 8 7-10h-4l1-8z"/></svg>',
  check: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10l4 4 8-8"/></svg>',
  warn: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="#ef4444" stroke-width="1.5"><path d="M10 2L1 18h18L10 2z"/><path d="M10 8v4"/><path d="M10 14v0"/></svg>',
  cross: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="#ef4444" stroke-width="2"><path d="M5 5l10 10M15 5L5 15"/></svg>',
  search: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8.5" cy="8.5" r="6"/><path d="M13 13l5 5"/></svg>',
  lock: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="9" width="12" height="9" rx="2"/><path d="M7 9V6a3 3 0 1 1 6 0v3"/></svg>',
  unlock: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="9" width="12" height="9" rx="2"/><path d="M7 9V6a2 2 0 0 1 3.8-.8"/></svg>',
  list: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 3h6a1 1 0 0 1 1 1v1H6V4a1 1 0 0 1 1-1z"/><path d="M6 5h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M8 9h4M8 12h4M8 15h2"/></svg>',
  shield: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 1l7 3v6a7 7 0 0 1-7 6 7 7 0 0 1-7-6V4l7-3z"/><path d="M8 10l1.5 1.5L12 9"/></svg>',
  clock: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="8"/><path d="M10 5v5l3 2"/></svg>',
  arrowR: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10h12M11 5l5 5-5 5"/></svg>',
  memo: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 2l2 2-11 11-3 1 1-3L16 2z"/></svg>',
  refresh: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2l3 3-3 3"/><path d="M3 11a6 6 0 0 1 10.5-4"/><path d="M6 18l-3-3 3-3"/><path d="M17 9a6 6 0 0 1-10.5 4"/></svg>',
  send: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 10l7-7 7 7M10 3v14"/></svg>',
  key: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="13" r="4"/><path d="M10 10l7-7 2 2-5 5"/><path d="M12 8l2 2"/></svg>',
  bulb: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 17h4M9 19h2M7 14a5 5 0 1 1 6 0c-1 .8-1.5 1.8-1.5 3h-3c0-1.2-.5-2.2-1.5-3z"/></svg>',
  laptop: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="2" width="14" height="11" rx="1.5"/><path d="M2 16a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v1H2v-1z"/></svg>',
  router: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="8" width="12" height="8" rx="2"/><circle cx="7" cy="12" r="1.2"/><circle cx="10" cy="12" r="1.2"/><circle cx="13" cy="12" r="1.2"/><path d="M10 2v6M7 5l3 3 3-3"/></svg>',
  switch_: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="6" width="12" height="8" rx="1"/><path d="M6 10h8M10 6v8"/></svg>',
  layers: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 5l8 4 8-4-8-4L2 5z"/><path d="M2 10l8 4 8-4"/><path d="M2 15l8 4 8-4"/></svg>',
  bytes: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="2" width="14" height="16" rx="2"/><path d="M7 6h6M7 10h6M7 14h6"/></svg>',
};

const LAYERS = [
  { id: 7, name: 'Application', short: 'App', icon: I.doc, color: '#ef4444', desc: 'User-facing protocols — HTTP, FTP, SMTP, DNS. Provides network services to applications.', analogy: 'Like writing a letter — you decide what to say and who to send it to.' },
  { id: 6, name: 'Presentation', short: 'Pres', icon: I.wrench, color: '#f97316', desc: 'Data formatting, encryption, compression. Translates between app and network formats.', analogy: 'Like translating your letter into a language the postal system understands, and sealing it in an envelope.' },
  { id: 5, name: 'Session', short: 'Sess', icon: I.link, color: '#eab308', desc: 'Manages sessions — connect, transfer, disconnect. Controls dialog between devices.', analogy: 'Like picking up the phone, establishing a call, and hanging up when done.' },
  { id: 4, name: 'Transport', short: 'Trans', icon: I.box, color: '#22c55e', desc: 'End-to-end reliable delivery. Segmentation, flow control, error recovery. TCP (reliable) / UDP (fast).', analogy: 'Like a courier company numbering each box so the recipient can reassemble them in order.' },
  { id: 3, name: 'Network', short: 'Net', icon: I.globe, color: '#3b82f6', desc: 'Logical addressing & routing. IP packets forwarded across networks. Routers operate here.', analogy: 'Like writing the destination address on the package so it reaches the right city.' },
  { id: 2, name: 'Data Link', short: 'Link', icon: I.plug, color: '#818cf8', desc: 'MAC addressing, framing, error detection. Switches operate here. Ethernet, PPP, ARP.', analogy: 'Like handing the package to the local delivery driver who knows the exact street address.' },
  { id: 1, name: 'Physical', short: 'Phys', icon: I.bolt, color: '#c084fc', desc: 'Raw bit transmission over wire/fibre/air. Voltage levels, cable specs. Hubs/Repeaters operate here.', analogy: 'Like the electrical signals traveling through the wire — the raw physical medium.' },
];

const STEP_NAMES = [
  'Application Layer \u2014 Creating Application Data',
  'Presentation Layer \u2014 Encoding & Encryption',
  'Session Layer \u2014 Establishing Session',
  'Transport Layer \u2014 Adding TCP Header (Segmentation)',
  'Network Layer \u2014 Adding IP Header (Packetizing)',
  'Data Link Layer \u2014 Adding Ethernet Frame',
  'Physical Layer \u2014 Converting to Bits',
  'Transmitting: Alice \u2192 Switch (Cable)',
  'Switch Processing \u2014 MAC Table Lookup',
  'Transmitting: Switch \u2192 Bob (Cable)',
  'Physical Layer \u2014 Bits Arrive',
  'Data Link Layer \u2014 Stripping Ethernet Frame',
  'Network Layer \u2014 Stripping IP Header',
  'Transport Layer \u2014 Stripping TCP Header',
  'Session Layer \u2014 Verifying Session',
  'Presentation Layer \u2014 Decoding & Decryption',
  'Application Layer \u2014 Message Delivered!',
];

let state = {
  step: -1, msg: 'HELLO',
  srcIP: '192.168.1.10', dstIP: '192.168.1.20',
  srcMAC: 'AA:BB:CC:DD:EE:01', dstMAC: 'AA:BB:CC:DD:EE:02',
  swMAC: 'AA:BB:CC:DD:SW:01', rtrMAC: 'AA:BB:CC:DD:RT:01',
  protocol: 'HTTP', transport: 'TCP', device: 'switch',
  sameSubnet: true, ttl: 64, packetSize: 64, speed: 1,
  autoMode: false, showBinary: false, showHex: false, showDetails: false,
  errorMode: false, errorType: null,
  sessionId: Math.floor(Math.random() * 90000) + 10000,
};
let pkt = {};

function el(s) { return document.getElementById(s); }
function qs(s, p) { return (p || document).querySelector(s); }
function qsa(s, p) { return (p || document).querySelectorAll(s); }
function play(n) { if (window.playSound) window.playSound(n); }

export function initOSISim() {
  if (!el('osi-container')) return;
  if (!osiReady) { osiReady = true; buildOSILayout(); bindOSIControls(); }
  resetOSI();
}
export function cleanupOSISim() {
  osiAbort = true;
  if (osiAnimTimer) { clearTimeout(osiAnimTimer); osiAnimTimer = null; }
}
window.initOSISim = initOSISim;
window.cleanupOSISim = cleanupOSISim;

function buildOSILayout() {
  el('osi-container').innerHTML = `
<div class="osi-topbar" id="osi-topbar">
  <div class="osi-ctrl-group">
    <label>Msg <input type="text" id="osi-msg" value="HELLO" size="6"></label>
    <label>Src IP <input type="text" id="osi-srcip" value="192.168.1.10" size="12"></label>
    <label>Dst IP <input type="text" id="osi-dstip" value="192.168.1.20" size="12"></label>
  </div>
  <div class="osi-ctrl-group">
    <label>App <select id="osi-protocol"><option>HTTP</option><option>HTTPS</option><option>FTP</option><option>SMTP</option><option>DNS</option></select></label>
    <label>Xport <select id="osi-transport"><option>TCP</option><option>UDP</option></select></label>
  </div>
  <div class="osi-ctrl-group">
    <label>Device <select id="osi-device"><option value="switch">Switch</option><option value="router">Router</option></select></label>
    <label>Subnets <select id="osi-subnet"><option value="same">Same</option><option value="diff">Different</option></select></label>
  </div>
  <div class="osi-ctrl-group">
    <button class="osi-btn primary" id="osi-step-btn">Next Step</button>
    <button class="osi-btn" id="osi-auto-btn">Auto</button>
    <button class="osi-btn" id="osi-reset-btn">Reset</button>
  </div>
  <div class="osi-ctrl-group">
    <button class="osi-btn" id="osi-binary-btn">Bin</button>
    <button class="osi-btn" id="osi-hex-btn">Hex</button>
    <button class="osi-btn" id="osi-insp-btn">${I.list} Inspect</button>
    <button class="osi-btn" id="osi-crypto-btn">${I.shield} RSA</button>
  </div>
</div>
<div class="osi-step-indicator">
  <span class="osi-step-text" id="osi-step-text">Ready</span>
  <div class="osi-step-bar"><div class="osi-step-fill" id="osi-step-fill" style="width:0%"></div></div>
  <span class="osi-step-text" id="osi-step-num">0 / ${STEP_NAMES.length}</span>
</div>
<div class="osi-main">
  <div class="osi-alice" id="osi-alice">
    <div class="osi-host-header">${I.laptop} Alice <small>Sender</small></div>
    <div class="osi-stack" id="osi-alice-stack"></div>
  </div>
  <div class="osi-center">
    <div class="osi-packet-vis" id="osi-packet-vis">
      <div class="osi-packet-wrap" id="osi-packet-wrap">
        <div class="osi-pkt-layer osi-pkt-data" id="osi-pkt-data" style="background:rgba(239,68,68,0.08);border-color:#ef4444;padding:0.2rem 0.6rem">Data: &quot;HELLO&quot;</div>
      </div>
    </div>
    <div class="osi-cable-area">
      <div class="osi-cable" id="osi-cable-left"><div class="osi-cable-track" id="osi-cable-track1"></div></div>
      <div class="osi-switch-area" id="osi-switch-area">
        <div class="osi-switch-device">
          <div class="osi-switch-icon switch" id="osi-switch-icon">${I.switch_}</div>
          <div class="osi-switch-label" id="osi-switch-label">Switch</div>
        </div>
        <div class="osi-switch-status" id="osi-switch-status">Waiting\u2026</div>
      </div>
      <div class="osi-cable" id="osi-cable-right"><div class="osi-cable-track" id="osi-cable-track2"></div></div>
      <div class="osi-binary-row" id="osi-bits-display"></div>
      <div class="osi-hex-row" id="osi-hex-display"></div>
    </div>
    <div class="osi-error-overlay" id="osi-error-overlay"></div>
  </div>
  <div class="osi-bob" id="osi-bob">
    <div class="osi-host-header bob">${I.laptop} Bob <small>Receiver</small></div>
    <div class="osi-stack" id="osi-bob-stack"></div>
  </div>
</div>
<div class="osi-inspector" id="osi-inspector">
  <div class="osi-inspector-header">
    <span>${I.list} Packet Inspector</span>
    <button class="osi-insp-close" id="osi-insp-close">&times;</button>
  </div>
  <div class="osi-insp-body" id="osi-insp-body"></div>
</div>
<div class="osi-crypto-modal" id="osi-crypto-modal">
  <div class="osi-crypto-box" id="osi-crypto-box">
    <div class="osi-crypto-title">${I.shield} RSA Encryption Visualizer</div>
    <div id="osi-crypto-steps"></div>
    <button class="osi-btn" id="osi-crypto-close" style="align-self:flex-end">Close</button>
  </div>
</div>`;

  const aliceStack = el('osi-alice-stack');
  const bobStack = el('osi-bob-stack');
  LAYERS.forEach(l => {
    aliceStack.appendChild(createLayerBlock(l, 'alice'));
    bobStack.appendChild(createLayerBlock(l, 'bob'));
  });
}

function createLayerBlock(l, side) {
  const div = document.createElement('div');
  div.className = 'osi-layer-block inactive';
  div.id = `osi-${side}-l${l.id}`;
  div.style.borderLeftColor = l.color;
  div.innerHTML = `<div class="osi-layer-top">
      <span class="osi-layer-badge" style="background:${l.color}">${l.id}</span>
      <span class="osi-layer-icon">${l.icon}</span>
      <span class="osi-layer-name">${l.name}</span>
      <span class="osi-layer-short" style="color:${l.color}">${l.short}</span>
    </div>
    <div class="osi-layer-data" id="osi-${side}-l${l.id}-data"></div>`;
  div.title = `${l.name}\n${l.desc}\n\n${l.analogy}`;
  div.addEventListener('click', () => showLayerInfo(l));
  return div;
}

function showLayerInfo(l) {
  play('click');
  if (window.showAlert) window.showAlert(
    `<strong>Layer ${l.id}: ${l.name}</strong><br><br>${l.desc}<br><br><em>${l.analogy}</em>`,
    `Layer ${l.id} \u2014 ${l.name}`
  );
}

function bindOSIControls() {
  el('osi-step-btn').addEventListener('click', stepOSI);
  el('osi-auto-btn').addEventListener('click', () => {
    play('click');
    state.autoMode = !state.autoMode;
    el('osi-auto-btn').classList.toggle('active', state.autoMode);
    if (state.autoMode && state.step < STEP_NAMES.length - 1) autoStep();
  });
  el('osi-reset-btn').addEventListener('click', () => { play('click'); resetOSI(); });
  el('osi-binary-btn').addEventListener('click', () => {
    play('click');
    state.showBinary = !state.showBinary;
    el('osi-binary-btn').classList.toggle('active', state.showBinary);
    updateBitHexDisplay();
  });
  el('osi-hex-btn').addEventListener('click', () => {
    play('click');
    state.showHex = !state.showHex;
    el('osi-hex-btn').classList.toggle('active', state.showHex);
    updateBitHexDisplay();
  });
  el('osi-insp-btn').addEventListener('click', () => {
    play('click');
    state.showDetails = !state.showDetails;
    el('osi-inspector').classList.toggle('open', state.showDetails);
    el('osi-insp-btn').classList.toggle('active', state.showDetails);
    if (state.showDetails) updateInspector();
  });
  el('osi-insp-close').addEventListener('click', () => {
    state.showDetails = false;
    el('osi-inspector').classList.remove('open');
    el('osi-insp-btn').classList.remove('active');
  });
  el('osi-crypto-close').addEventListener('click', () => { el('osi-crypto-modal').classList.remove('open'); });
  el('osi-crypto-modal').addEventListener('click', (e) => { if (e.target === el('osi-crypto-modal')) el('osi-crypto-modal').classList.remove('open'); });
  el('osi-crypto-btn').addEventListener('click', () => {
    play('click');
    if (!rsaGenerated) generateRSA();
    el('osi-crypto-modal').classList.add('open');
  });

  ['msg','srcip','dstip','protocol','transport','device','subnet'].forEach(id => {
    const inp = el('osi-' + id);
    if (inp) inp.addEventListener('change', () => { if (state.step < 0) { readInputs(); if (state.showDetails) updateInspector(); } });
  });
}

function readInputs() {
  state.msg = el('osi-msg').value.trim() || 'HELLO';
  state.srcIP = el('osi-srcip').value.trim() || '192.168.1.10';
  state.dstIP = el('osi-dstip').value.trim() || '192.168.1.20';
  state.protocol = el('osi-protocol').value;
  state.transport = el('osi-transport').value;
  state.device = el('osi-device').value;
  state.sameSubnet = el('osi-subnet').value === 'same';
  state.sessionId = Math.floor(Math.random() * 90000) + 10000;
}

function resetOSI() {
  osiAbort = true;
  if (osiAnimTimer) { clearTimeout(osiAnimTimer); osiAnimTimer = null; }
  osiAbort = false;
  state.step = -1;
  state.autoMode = false;
  el('osi-auto-btn').classList.remove('active');
  el('osi-step-btn').disabled = false;
  el('osi-step-btn').textContent = 'Next Step';
  el('osi-step-text').textContent = 'Ready';
  el('osi-step-fill').style.width = '0%';
  el('osi-step-num').textContent = `0 / ${STEP_NAMES.length}`;
  el('osi-bits-display').innerHTML = '';
  el('osi-hex-display').innerHTML = '';
  el('osi-error-overlay').classList.remove('show');
  el('osi-switch-status').textContent = 'Waiting\u2026';
  el('osi-insp-body').innerHTML = '';
  hideCablePulses();
  readInputs();
  pkt = {};

  LAYERS.forEach(l => {
    ['alice','bob'].forEach(side => {
      const b = el(`osi-${side}-l${l.id}`);
      if (b) { b.className = 'osi-layer-block inactive'; b.title = `${l.name}\n${l.desc}\n\n${l.analogy}`; }
      const d = el(`osi-${side}-l${l.id}-data`);
      if (d) d.textContent = '';
    });
  });

  const a7 = el('osi-alice-l7-data');
  if (a7) a7.textContent = `Data: "${state.msg}"`;

  const devIcon = el('osi-switch-icon');
  devIcon.className = 'osi-switch-icon ' + state.device;
  devIcon.innerHTML = state.device === 'switch' ? I.switch_ : I.router;
  el('osi-switch-label').textContent = state.device === 'switch' ? 'Switch' : 'Router';

  if (state.showDetails) updateInspector();
  setSendPort();

  if (state.protocol === 'HTTPS') {
    const l6d = el('osi-alice-l6-data');
    if (l6d) l6d.textContent = 'TLS encrypting\u2026';
  }
  updatePktVis();
}

function setSendPort() {
  const ports = { HTTP: 80, HTTPS: 443, FTP: 21, SMTP: 25, DNS: 53 };
  state.srcPort = Math.floor(Math.random() * 50000) + 1024;
  state.dstPort = ports[state.protocol] || 80;
}

function stepOSI() {
  if (state.step >= STEP_NAMES.length - 1) return;
  play('click');
  state.step++;
  osiAbort = false;
  el('osi-step-text').textContent = `(${state.step + 1}/${STEP_NAMES.length}) ${STEP_NAMES[state.step]}`;
  el('osi-step-fill').style.width = `${((state.step + 1) / STEP_NAMES.length) * 100}%`;
  el('osi-step-num').textContent = `${state.step + 1} / ${STEP_NAMES.length}`;

  if (state.step < 7) {
    encapsulateStep(state.step);
  } else if (state.step === 7) {
    animateCable('left', () => { play('step'); });
  } else if (state.step === 8) {
    animateSwitch();
  } else if (state.step === 9) {
    animateCable('right', () => { play('step'); });
  } else if (state.step >= 10 && state.step <= 15) {
    decapsulateStep(state.step - 10);
  } else if (state.step === 16) {
    decapsulateStep(6);
    completeDelivery();
  }

  updatePktVis();
  if (state.showDetails) updateInspector();

  if (state.step >= STEP_NAMES.length - 1) {
    el('osi-step-btn').textContent = 'Complete';
    el('osi-step-btn').disabled = true;
    state.autoMode = false;
    el('osi-auto-btn').classList.remove('active');
  }
}

function autoStep() {
  if (osiAbort || !state.autoMode || state.step >= STEP_NAMES.length - 1) return;
  const delay = Math.max(100, 600 - state.speed * 50);
  stepOSI();
  osiAnimTimer = setTimeout(autoStep, delay);
}

/* ===== ENCAPSULATION ===== */
function encapsulateStep(step) {
  const layerId = 7 - step;
  const side = 'alice';
  const blk = el(`osi-${side}-l${layerId}`);
  const dat = el(`osi-${side}-l${layerId}-data`);

  LAYERS.forEach(l => {
    const b = el(`osi-alice-l${l.id}`);
    if (b && !b.classList.contains('done') && l.id !== layerId) b.className = 'osi-layer-block inactive';
  });
  LAYERS.forEach(l => {
    const b = el(`osi-bob-l${l.id}`);
    if (b) b.className = 'osi-layer-block inactive';
  });

  blk.className = 'osi-layer-block active';

  switch (layerId) {
    case 7:
      pkt.appData = state.msg;
      dat.innerHTML = `Data: "${state.msg}"`;
      blk.title = `Application Layer\nCreates HTTP request data: "${state.msg}"`;
      break;
    case 6:
      if (state.protocol === 'HTTPS') {
        pkt.presInfo = 'TLS Encrypted (AES-256), Base64 encoded';
        dat.textContent = 'Encrypted: ' + strToHex(state.msg).slice(0, 20) + '\u2026';
      } else {
        pkt.presInfo = 'UTF-8 Encoding, no compression';
        dat.textContent = 'UTF-8 | Binary: ' + strToBin(state.msg).slice(0, 30) + '\u2026';
      }
      break;
    case 5:
      pkt.sessionId = state.sessionId;
      dat.textContent = `Session ID: ${pkt.sessionId}`;
      break;
    case 4:
      pkt.srcPort = state.srcPort;
      pkt.dstPort = state.dstPort;
      pkt.seqNum = Math.floor(Math.random() * 1000000) + 1;
      pkt.ackNum = 0;
      pkt.checksum = calcChecksum(state.msg);
      const proto = state.transport;
      dat.innerHTML = `<span style="color:${proto === 'TCP' ? '#22c55e' : '#f97316'}">${proto}</span> Port ${pkt.srcPort}\u2192${pkt.dstPort} | SEQ ${pkt.seqNum} | CKSUM ${pkt.checksum}`;
      break;
    case 3:
      pkt.ttl = state.ttl;
      pkt.protocol = state.transport;
      dat.innerHTML = `${I.globe} ${state.srcIP} \u2192 ${state.dstIP} | TTL ${pkt.ttl} | Proto ${pkt.protocol}`;
      if (!state.sameSubnet && state.device === 'router') {
        dat.innerHTML += `<br><span style="color:#fbbf24">\u2192 Routing across subnets (TTL decremented at router)</span>`;
      }
      break;
    case 2:
      pkt.srcMAC = state.srcMAC;
      pkt.dstMAC = state.device === 'switch' ? state.swMAC : state.rtrMAC;
      pkt.fcs = calcFCS(state.msg);
      dat.innerHTML = `${I.plug} ${pkt.srcMAC} \u2192 ${pkt.dstMAC} | FCS ${pkt.fcs}`;
      break;
    case 1:
      pkt.bits = strToBin(state.msg);
      dat.textContent = pkt.bits.slice(0, 40) + (pkt.bits.length > 40 ? '\u2026' : '');
      updateBitHexDisplay();
      break;
  }
}

/* ===== DECAPSULATION ===== */
function decapsulateStep(step) {
  const layerId = 1 + step;
  const side = 'bob';
  const blk = el(`osi-${side}-l${layerId}`);
  const dat = el(`osi-${side}-l${layerId}-data`);

  LAYERS.forEach(l => {
    const b = el(`osi-bob-l${l.id}`);
    if (b && l.id !== layerId && !b.classList.contains('done')) b.className = 'osi-layer-block inactive';
  });

  const aliceBlk = el(`osi-alice-l${layerId}`);
  if (aliceBlk && !aliceBlk.classList.contains('done')) aliceBlk.className = 'osi-layer-block done';

  blk.className = 'osi-layer-block active';

  switch (layerId) {
    case 1:
      dat.textContent = 'Bits received';
      updateBitHexDisplay();
      break;
    case 2:
      dat.innerHTML = `${I.plug} Stripped frame | Removed MAC: ${state.srcMAC} \u2192 ${pkt.dstMAC || state.dstMAC}`;
      break;
    case 3:
      dat.innerHTML = `${I.globe} Stripped IP header | ${state.srcIP} \u2192 ${state.dstIP} (TTL was ${pkt.ttl})`;
      break;
    case 4:
      const proto = state.transport;
      dat.innerHTML = `<span style="color:${proto === 'TCP' ? '#22c55e' : '#f97316'}">${proto}</span> Stripped | Port ${pkt.srcPort}\u2192${pkt.dstPort} | Checksum ${pkt.checksum} ${I.check}`;
      break;
    case 5:
      dat.textContent = `Session ${pkt.sessionId} verified ${I.check}`;
      break;
    case 6:
      if (state.protocol === 'HTTPS') {
        dat.textContent = 'Decrypted (AES-256) \u2192 UTF-8 \u2192 OK';
      } else {
        dat.textContent = 'UTF-8 Decoded';
      }
      break;
    case 7:
      dat.innerHTML = `<span style="color:var(--color-success);font-weight:800;font-size:0.85rem">${I.doc} "${state.msg}"</span>`;
      break;
  }
}

function completeDelivery() {
  el('osi-step-text').textContent = 'Message Delivered!';
  const bob7 = el('osi-bob-l7');
  const bob7d = el('osi-bob-l7-data');
  if (bob7) bob7.className = 'osi-layer-block done active';
  if (bob7d) bob7d.innerHTML = `<span style="color:var(--color-success);font-weight:800;font-size:0.85rem">${I.doc} "${state.msg}"</span>`;
  LAYERS.forEach(l => {
    const al = el(`osi-alice-l${l.id}`);
    if (al) al.className = 'osi-layer-block done';
    const bl = el(`osi-bob-l${l.id}`);
    if (bl) bl.className = 'osi-layer-block done';
  });
  updatePktVis();
}

/* ===== CABLE ANIMATION ===== */
function animateCable(side, cb) {
  const trackId = side === 'left' ? 'osi-cable-track1' : 'osi-cable-track2';
  const track = el(trackId);
  if (!track) { if (cb) cb(); return; }
  track.innerHTML = '';
  const numPulses = Math.min(5, Math.max(1, Math.ceil(state.msg.length / 3)));
  for (let i = 0; i < numPulses; i++) {
    const p = document.createElement('div');
    p.className = 'osi-cable-pulse';
    p.style.animationDelay = `${i * 0.12}s`;
    p.style.left = `${i * 15}%`;
    track.appendChild(p);
  }
  const dur = Math.max(800, 2000 - state.speed * 100);
  if (cb) setTimeout(cb, dur + numPulses * 120);

  const bitsEl = el('osi-bits-display');
  if (bitsEl && state.showBinary) {
    const bin = strToBin(state.msg);
    bitsEl.innerHTML = `<span style="font-size:0.65rem;color:var(--text-muted);width:100%;text-align:center">${bin.slice(0, 60)}${bin.length > 60 ? '\u2026' : ''}</span>`;
  }
  const hexEl = el('osi-hex-display');
  if (hexEl && state.showHex) {
    const hex = strToHex(state.msg);
    hexEl.innerHTML = `<span style="font-size:0.65rem;color:var(--text-muted);width:100%;text-align:center">${hex}</span>`;
  }
}

function hideCablePulses() {
  ['osi-cable-track1','osi-cable-track2'].forEach(id => {
    const t = el(id);
    if (t) t.innerHTML = '';
  });
}

/* ===== SWITCH / ROUTER ===== */
function animateSwitch() {
  const dev = state.device;
  const status = el('osi-switch-status');
  const icon = el('osi-switch-icon');
  if (dev === 'switch') {
    icon.className = 'osi-switch-icon switch';
    icon.innerHTML = I.switch_;
    el('osi-switch-label').textContent = 'Switch';
    status.innerHTML = `${I.search} Looking up MAC\u2026`;
    setTimeout(() => {
      const known = Math.random() > 0.3;
      if (known) {
        status.innerHTML = `${I.check} MAC ${state.dstMAC} found \u2192 Forwarding to Bob's port`;
      } else {
        status.innerHTML = `? Unknown MAC \u2192 Flooding all ports (learning mode)`;
        setTimeout(() => {
          status.innerHTML = `Learned: ${state.srcMAC} \u2192 Alice's port`;
        }, 400);
      }
    }, 400);
  } else {
    icon.className = 'osi-switch-icon router';
    icon.innerHTML = I.router;
    el('osi-switch-label').textContent = 'Router';
    if (!state.sameSubnet) {
      status.innerHTML = `${I.globe} Different subnet! Routing\u2026`;
      setTimeout(() => {
        pkt.ttl = (pkt.ttl || 64) - 1;
        const newMAC = state.dstMAC;
        status.innerHTML = `${I.refresh} Stripped old Ethernet frame<br>${I.box} New frame with MAC ${newMAC}<br>${I.clock} TTL decreased to ${pkt.ttl}<br>${I.globe} IP unchanged: ${state.dstIP}`;
      }, 500);
    } else {
      status.innerHTML = `${I.warn} Same subnet \u2014 forwarding directly (no routing needed)`;
    }
  }
}

/* ===== INSPECTOR ===== */
function updateInspector() {
  const body = el('osi-insp-body');
  if (!body) return;
  const sections = [];

  sections.push({ title: `${I.doc} Application`, bg: '#ef4444', fields: [
    ['Data', `"${state.msg}"`], ['Protocol', state.protocol], ['Transport', state.transport],
  ]});

  if (state.protocol === 'HTTPS') {
    sections.push({ title: `${I.lock} Presentation (TLS)`, bg: '#f97316', fields: [
      ['Encryption', 'AES-256'], ['Encoding', 'Base64'], ['Status', pkt.presInfo || 'Pending\u2026'],
    ]});
  } else {
    sections.push({ title: `${I.wrench} Presentation`, bg: '#f97316', fields: [
      ['Encoding', 'UTF-8'], ['Status', pkt.presInfo || 'Pending\u2026'],
    ]});
  }

  sections.push({ title: `${I.link} Session`, bg: '#eab308', fields: [
    ['Session ID', pkt.sessionId || '\u2014'],
    ['Status', state.step >= 2 || state.step >= 14 ? `${I.check} Established` : 'Pending\u2026'],
  ]});

  sections.push({ title: `${I.box} ${state.transport}`, bg: '#22c55e', fields: [
    ['Source Port', pkt.srcPort || '\u2014'], ['Dest Port', pkt.dstPort || '\u2014'],
    ['Sequence #', pkt.seqNum || '\u2014'], ['Checksum', pkt.checksum || '\u2014'],
  ]});

  sections.push({ title: `${I.globe} Network`, bg: '#3b82f6', fields: [
    ['Source IP', state.srcIP], ['Dest IP', state.dstIP],
    ['TTL', pkt.ttl || state.ttl], ['Protocol', state.transport],
  ]});

  sections.push({ title: `${I.plug} Data Link`, bg: '#818cf8', fields: [
    ['Source MAC', state.srcMAC], ['Dest MAC', pkt.dstMAC || state.dstMAC],
    ['FCS', pkt.fcs || '\u2014'],
  ]});

  if (state.showBinary) {
    sections.push({ title: `${I.bolt} Physical (Binary)`, bg: '#c084fc', fields: [
      ['Bits', (pkt.bits || strToBin(state.msg)).slice(0, 80) + '\u2026'],
    ]});
  }

  body.innerHTML = sections.map(s => `
    <div class="osi-insp-section" style="border-left:3px solid ${s.bg}">
      <div class="osi-insp-section-header" style="background:${s.bg}22">${s.title}</div>
      <div class="osi-insp-section-body">
        ${s.fields.map(f => `<div class="field"><span class="label">${f[0]}</span><span class="value">${f[1]}</span></div>`).join('')}
      </div>
    </div>`).join('');
}

/* ===== PACKET HEADER VISUALIZATION ===== */
function updatePktVis() {
  const wrap = el('osi-packet-wrap');
  if (!wrap) return;
  const step = state.step;

  const l = (label, color, detail) =>
    `<div class="osi-pkt-layer" style="background:${color}16;border-color:${color};color:${color}">
      ${label}${detail ? `<span class="osi-pkt-detail">${detail}</span>` : ''}
    </div>`;

  function buildLayers(recvStep) {
    const all = [
      { label: 'MAC', color: '#818cf8', det: `${state.srcMAC} \u2192 ${pkt.dstMAC || state.dstMAC}`, show: recvStep === undefined || recvStep <= 0 },
      { label: 'IP', color: '#3b82f6', det: `${state.srcIP} \u2192 ${state.dstIP} (TTL:${pkt.ttl || state.ttl})`, show: recvStep === undefined || recvStep <= 1 },
      { label: state.transport, color: '#22c55e', det: `Port ${pkt.srcPort || state.srcPort}\u2192${pkt.dstPort || state.dstPort}`, show: recvStep === undefined || recvStep <= 2 },
      { label: 'Session', color: '#eab308', det: `ID: ${pkt.sessionId || state.sessionId}`, show: recvStep === undefined || recvStep <= 3 },
      { label: state.protocol === 'HTTPS' ? 'TLS' : 'Pres', color: '#f97316', det: state.protocol === 'HTTPS' ? 'AES-256' : 'UTF-8', show: recvStep === undefined || recvStep <= 4 },
      { label: 'Data', color: '#ef4444', det: `"${state.msg}"` },
    ];
    return all.filter(x => x.show !== false).map(x => l(x.label, x.color, x.det)).join('');
  }

  if (step >= 0 && step <= 6) {
    // Encapsulation — show only layers completed so far
    const encLayers = [];
    if (step >= 0) encLayers.push({ label: 'Data', color: '#ef4444', det: `"${state.msg}"` });
    if (step >= 1) encLayers.push({ label: state.protocol === 'HTTPS' ? 'TLS' : 'Pres', color: '#f97316', det: state.protocol === 'HTTPS' ? 'AES-256' : 'UTF-8' });
    if (step >= 2) encLayers.push({ label: 'Session', color: '#eab308', det: `ID: ${state.sessionId}` });
    if (step >= 3) encLayers.push({ label: state.transport, color: '#22c55e', det: `Port ${pkt.srcPort || '?'}\u2192${pkt.dstPort || '?'}` });
    if (step >= 4) encLayers.push({ label: 'IP', color: '#3b82f6', det: `${state.srcIP} \u2192 ${state.dstIP}` });
    if (step >= 5) encLayers.push({ label: 'MAC', color: '#818cf8', det: `${state.srcMAC} \u2192 ${pkt.dstMAC || state.dstMAC}` });
    if (step >= 6) encLayers.push({ label: 'Bits', color: '#c084fc', det: '' });
    wrap.innerHTML = encLayers.map(x => l(x.label, x.color, x.det)).join('');
  } else if (step >= 7 && step <= 9) {
    // On the wire — full packet
    wrap.innerHTML = buildLayers();
  } else if (step >= 10) {
    // Decapsulation — strip layers
    wrap.innerHTML = buildLayers(step - 10);
  } else {
    wrap.innerHTML = l('Data', '#ef4444', `"${state.msg}"`);
  }
}

/* ===== RSA ENCRYPTION VISUALIZER ===== */
function generateRSA() {
  rsaGenerated = true;
  const p = 61, q = 53;
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  let e = 3;
  while (e < phi && gcd(e, phi) !== 1) e += 2;
  let d = modInv(e, phi);
  rsaKeys = { p, q, n, phi, e, d };

  const msg = state.msg || 'HELLO';
  const nums = msg.split('').map(ch => ch.charCodeAt(0));
  const encrypted = nums.map(m => modPow(m, e, n));
  const decrypted = encrypted.map(c => modPow(c, d, n));
  const decText = decrypted.map(n => String.fromCharCode(n)).join('');

  const steps = [
    { label: 'Step 1: Choose two prime numbers', math: `p = ${p}, q = ${q}` },
    { label: 'Step 2: Calculate n = p x q', math: `n = ${p} x ${q} = ${n}`, result: n.toString() },
    { label: 'Step 3: Calculate phi(n) = (p-1)(q-1)', math: `phi = (${p-1}) x (${q-1}) = ${phi}`, result: phi.toString() },
    { label: 'Step 4: Choose e (coprime with phi)', math: `GCD(${e}, ${phi}) = ${gcd(e, phi)} -> e = ${e}`, result: e.toString() },
    { label: 'Step 5: Calculate d (modular inverse of e mod phi)', math: `d = ${e}^-1 mod ${phi} = ${d}`, result: d.toString() },
    { label: 'Step 6: Public Key (n, e)', math: `Public: (${n}, ${e})`, result: `(${n}, ${e})` },
    { label: 'Step 7: Private Key (n, d)', math: `Private: (${n}, ${d})`, result: `(${n}, ${d})` },
    { label: 'Step 8: Convert message to ASCII', math: `"${msg}" -> [${nums.join(', ')}]` },
    { label: 'Step 9: Encrypt c = m^e mod n', math: `[${nums.join(', ')}] -> [${encrypted.join(', ')}]`, result: encrypted.join(' ') },
    { label: 'Step 10: Decrypt m = c^d mod n', math: `[${encrypted.join(', ')}] -> [${decrypted.join(', ')}]`, result: decText === msg ? `${I.check} "${decText}"` : `${I.cross} Decryption failed` },
  ];

  el('osi-crypto-steps').innerHTML = steps.map(s => `<div class="osi-crypto-step">
      <div class="step-label">${s.label}</div>
      <div class="step-math">${s.math}</div>
      ${s.result ? `<div class="step-result">${s.result}</div>` : ''}
    </div>`).join('');
}

function updateBitHexDisplay() {
  const bitsEl = el('osi-bits-display');
  const hexEl = el('osi-hex-display');
  const msg = pkt.bits || strToBin(state.msg);
  if (bitsEl) {
    if (state.showBinary) {
      bitsEl.innerHTML = msg.split('').map((b) =>
        `<span class="osi-bin-byte" style="${b === '1' ? 'color:var(--color-success)' : 'color:var(--text-muted)'}">${b}</span>`
      ).join('');
    } else { bitsEl.innerHTML = ''; }
  }
  if (hexEl) {
    if (state.showHex) {
      const hex = strToHex(state.msg);
      hexEl.innerHTML = hex.split('').map(h => `<span style="color:var(--color-indigo)">${h}</span>`).join('');
    } else { hexEl.innerHTML = ''; }
  }
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function modInv(a, m) { for (let x = 1; x < m; x++) { if ((a * x) % m === 1) return x; } return 1; }
function modPow(base, exp, mod) {
  let r = 1;
  for (let i = 0; i < exp; i++) r = (r * base) % mod;
  return r;
}

/* ===== UTILITY ===== */
function strToBin(s) { return s.split('').map(ch => ch.charCodeAt(0).toString(2).padStart(8, '0')).join(' '); }
function strToHex(s) { return s.split('').map(ch => ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' '); }
function calcChecksum(s) {
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += s.charCodeAt(i);
  return (sum & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}
function calcFCS(s) {
  let crc = 0xFFFF;
  for (let i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i);
    for (let j = 0; j < 8; j++) crc = (crc & 1) ? (crc >> 1) ^ 0x8408 : crc >> 1;
  }
  return (crc ^ 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}
