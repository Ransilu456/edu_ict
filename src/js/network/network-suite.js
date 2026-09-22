import { initSubnetting } from './subnetting.js';
import { initParity } from './parity.js';

let activeTab = 'osi-tab';
let simTimer = null;
let currentSpeed = 1;

// Icons
const I = {
  play: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`,
  stepFwd: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><rect x="17" y="4" width="2" height="16" rx="1"/></svg>`,
  stepBack: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><rect x="5" y="4" width="2" height="16" rx="1"/></svg>`,
  restart: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#bef264" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  server: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="6" rx="1"/><rect x="2" y="15" width="20" height="6" rx="1"/><circle cx="6" cy="6" r="1" fill="#bef264"/><circle cx="6" cy="18" r="1" fill="#bef264"/></svg>`,
  laptop: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="12" rx="1"/><polygon points="2 20 22 20 18 16 6 16 2 20"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  router: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="8" width="20" height="10" rx="2"/><circle cx="7" cy="13" r="1.2" fill="currentColor"/><circle cx="12" cy="13" r="1.2" fill="currentColor"/><circle cx="17" cy="13" r="1.2" fill="currentColor"/><path d="M7 8V4M12 8V4M17 8V4" stroke-linecap="round"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  journey: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="4" cy="12" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="20" cy="12" r="2"/><path d="M6 12h4l4-6h4"/></svg>`,
  subnet: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  parity: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M3 12h18M3 18h18M7 3v18M17 3v18"/></svg>`
};

// 7 OSI Layers Definition (Numbered 7 at top down to 1 at bottom)
const OSI_LAYERS = [
  {
    num: 7,
    name: 'Application',
    pdu: 'Data',
    headerName: 'HTTP/2',
    headerDesc: 'HTTP/2 Header (Method: GET, Path: /api/data, Host: logicquest.dev, User-Agent: Client/1.0)',
    actionDesc: 'Generates user application payload and attaches HTTP protocol request header.',
    color: '#ef4444',
  },
  {
    num: 6,
    name: 'Presentation',
    pdu: 'Data',
    headerName: 'TLS 1.3',
    headerDesc: 'TLS Record Header (Content-Type: 23 [Application Data], Version: TLS 1.3, Encrypted Ciphertext)',
    actionDesc: 'Encrypts payload using AES-256-GCM cipher and formats character encoding (UTF-8).',
    color: '#f97316',
  },
  {
    num: 5,
    name: 'Session',
    pdu: 'Data',
    headerName: 'SESSION',
    headerDesc: 'Session Token (Session ID: #8849-AUTH, Socket ID: 50412, Mode: Full-Duplex)',
    actionDesc: 'Establishes, coordinates, and checkpoints dialogue between client and server.',
    color: '#eab308',
  },
  {
    num: 4,
    name: 'Transport',
    pdu: 'Segment',
    headerName: 'TCP',
    headerDesc: 'TCP Header (Src Port: 52140, Dst Port: 443, Seq: 1042, Ack: 501, Flags: PSH, ACK, Window: 65535)',
    actionDesc: 'Segments data, assigns source/destination port numbers, and provides reliable flow control.',
    color: '#22c55e',
  },
  {
    num: 3,
    name: 'Network',
    pdu: 'Packet',
    headerName: 'IPv4',
    headerDesc: 'IPv4 Header (Src IP: 192.168.1.10, Dst IP: 142.250.72.14, TTL: 64, Protocol: 6 [TCP], Checksum: 0x4A21)',
    actionDesc: 'Encapsulates segment into logical packet with logical IP addressing and routing paths.',
    color: '#06b6d4',
  },
  {
    num: 2,
    name: 'Data Link',
    pdu: 'Frame',
    headerName: 'Ethernet II',
    headerDesc: 'Ethernet Header (Src MAC: 00:1A:2B:3C:4D:5E, Dst MAC: 00:50:56:C0:00:01, EtherType: 0x0800) + Trailer FCS: 0x7E3A',
    actionDesc: 'Adds physical hardware MAC addressing, framing boundaries, and CRC FCS error check trailer.',
    color: '#818cf8',
  },
  {
    num: 1,
    name: 'Physical',
    pdu: 'Bits',
    headerName: 'BITSTREAM',
    headerDesc: 'Physical Bitstream (Encoding: 1000BASE-T PAM-5 4D-PAM5 Signaling, 1.0 Gbps bit pulses)',
    actionDesc: 'Modulates frame into electrical voltage pulses transmitted across copper Cat6 media.',
    color: '#bef264',
  },
];

let osiStep = 0; // 0 = Idle, 1..7 = Encapsulation (L7->L1), 8 = Wire Transit, 9..15 = De-encapsulation (L1->L7)
let osiPlaying = false;
let userPayload = 'Hello LogicQuest!';

export function initNetworkDevices() {
  initNetworkSuite();
}

export function initNetworkSuite() {
  const container = document.getElementById('nd-lab-container');
  if (!container) return;

  renderShell(container);
  bindNavigation();
  init3DOsi();
  initJourney();

  switchNDTab(activeTab);
}

export function cleanupNetworkDevices() {
  cleanupNetworkSuite();
}

export function cleanupNetworkSuite() {
  stopSimulation();
}

window.initNetworkDevices = initNetworkSuite;
window.initNetworkSuite = initNetworkSuite;
window.cleanupNetworkDevices = cleanupNetworkSuite;
window.cleanupNetworkSuite = cleanupNetworkSuite;
window.switchNDTab = switchNDTab;

function stopSimulation() {
  osiPlaying = false;
  if (simTimer) {
    clearTimeout(simTimer);
    simTimer = null;
  }
}

function renderShell(c) {
  c.innerHTML = `
    <div class="nd-suite-shell">
      <nav class="nd-suite-nav" style="border-radius: 0;" aria-label="Networking Labs">
        <button class="nd-nav-btn active" data-tab="osi-tab">
          ${I.layers} <span>3D OSI Simulator</span>
        </button>
        <button class="nd-nav-btn" data-tab="url-tab">
          ${I.journey} <span>URL to Pixels</span>
        </button>
        <button class="nd-nav-btn" data-tab="subnet-tab">
          ${I.subnet} <span>Subnetting &amp; CIDR</span>
        </button>
        <button class="nd-nav-btn" data-tab="parity-tab">
          ${I.parity} <span>Parity &amp; Encoding</span>
        </button>
      </nav>

      <!-- Panel 1: 3D OSI Simulator -->
      <div class="nd-panel active" id="tab-osi-tab">
        <div class="osi-3d-lab">
          <!-- Top Hero & Controls -->
          <div class="osi-hero-bar">
            <div class="osi-hero-info">
              <span class="osi-kicker"><span class="osi-kicker-dot"></span>7-LAYER INTERACTIVE SIMULATOR</span>
              <h2>3D OSI Model Encapsulation &amp; De-encapsulation</h2>
              <p>Witness true layer-by-layer encapsulation: user data receives protocol headers at every OSI layer on the client, pulses across physical media, and is cleanly stripped and decoded by the receiver.</p>
            </div>
            
            <div class="osi-hero-controls">
              <!-- Custom Payload Input -->
              <div class="osi-payload-picker">
                <label for="osi-payload-input">Data Payload:</label>
                <div class="osi-input-wrap">
                  <input type="text" id="osi-payload-input" value="Hello LogicQuest!" maxlength="40" placeholder="Type data payload to send..." />
                  <select id="osi-preset-select" title="Pick quick preset message">
                    <option value="Hello LogicQuest!">Preset: Hello LogicQuest!</option>
                    <option value="GET /index.html HTTP/1.1">Preset: HTTP GET Request</option>
                    <option value="POST /api/login { user: 'student' }">Preset: JSON Login POST</option>
                    <option value="DNS Query: logicquest.dev">Preset: DNS Query</option>
                  </select>
                </div>
              </div>

              <!-- Playback buttons -->
              <div class="osi-ctrl-row">
                <button class="nd-btn-ctrl" id="osi-step-back" title="Step Back">${I.stepBack}</button>
                <button class="nd-btn-ctrl nd-btn-primary" id="osi-play-toggle">${I.play} Play</button>
                <button class="nd-btn-ctrl" id="osi-step-next" title="Step Next">${I.stepFwd}</button>
                <button class="nd-btn-ctrl" id="osi-reset" title="Reset">${I.restart}</button>
                <div class="osi-speed-select">
                  <button class="speed-btn active" data-speed="1">1x</button>
                  <button class="speed-btn" data-speed="2">2x</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 3D Visualization Arena -->
          <div class="osi-arena">
            <!-- Left: Client / Sender Stack -->
            <div class="osi-host-card client" id="osi-client-host">
              <div class="osi-host-header">
                <div class="osi-host-icon">${I.laptop}</div>
                <div class="osi-host-meta">
                  <strong>CLIENT (SENDER)</strong>
                  <span>IP: 192.168.1.10 &bull; MAC: 00:1A:2B:3C:4D:5E</span>
                </div>
                <span class="osi-role-badge enc">Encapsulation (L7 &rarr; L1)</span>
              </div>
              <div class="osi-stack-3d" id="osi-client-stack"></div>
            </div>

            <!-- Middle: Physical Medium / Cable -->
            <div class="osi-cable-arena">
              <div class="osi-cable-path">
                <div class="osi-cable-line" id="osi-cable-line"></div>
                <div class="osi-pulse-packet" id="osi-pulse-packet">
                  <div class="pulse-inner">
                    <span class="pulse-icon">&bull;&bull;&bull;</span>
                    <span class="pulse-label">BIT PULSES</span>
                  </div>
                </div>
              </div>
              <div class="osi-medium-badge">
                <span>1000BASE-T Copper Twisted Pair (Cat6)</span>
                <small id="osi-wire-stats">Link: 1000 Mbps &bull; Full Duplex &bull; 67% c</small>
              </div>
            </div>

            <!-- Right: Server / Receiver Stack -->
            <div class="osi-host-card server" id="osi-server-host">
              <div class="osi-host-header">
                <div class="osi-host-icon">${I.server}</div>
                <div class="osi-host-meta">
                  <strong>SERVER (RECEIVER)</strong>
                  <span>IP: 142.250.72.14 &bull; MAC: 00:50:56:C0:00:01</span>
                </div>
                <span class="osi-role-badge dec">De-encapsulation (L1 &rarr; L7)</span>
              </div>
              <div class="osi-stack-3d" id="osi-server-stack"></div>
            </div>
          </div>

          <!-- Bottom: Live Protocol Inspector & Layer Explanation -->
          <div class="osi-inspector-panel">
            <div class="osi-inspector-header">
              <div class="osi-stage-pill" id="osi-stage-pill">STAGE 0 / 15 &bull; IDLE</div>
              <h3 id="osi-stage-title">Ready to transmit data.</h3>
            </div>
            <p class="osi-stage-explanation" id="osi-stage-desc">
              Choose your data message above, then click <strong>Play</strong> or <strong>Step Next</strong> to watch OSI layers process and encapsulate the payload.
            </p>

            <!-- Dynamic Packet Structure visualization -->
            <div class="osi-packet-structure-box">
              <div class="packet-structure-label">Current PDU Packet Structure (Headers + Payload):</div>
              <div class="packet-tags-container" id="osi-packet-tags">
                <span class="packet-tag data">[DATA: "Hello LogicQuest!"]</span>
              </div>
            </div>

            <!-- Header breakdown table -->
            <div class="osi-header-details" id="osi-header-details"></div>
          </div>
        </div>
      </div>

      <!-- Panel 2: URL to Pixels Journey -->
      <div class="nd-panel" id="tab-url-tab">
        <div class="url-journey-lab">
          <!-- URL Bar & Selector -->
          <div class="url-hero-header">
            <div>
              <span class="osi-kicker"><span class="osi-kicker-dot"></span>FULL-STACK NETWORK LIFECYCLE</span>
              <h2>What happens when you type a URL?</h2>
              <p>Trace every microsecond of network packets, protocol headers, and hardware hops from your enter key to rendered screen pixels.</p>
            </div>

            <div class="url-interactive-bar">
              <span class="url-lock-badge">${I.lock}</span>
              <input type="text" class="url-bar-input" id="url-journey-input" value="https://www.logicquest.dev/courses" />
              <select id="url-preset-picker" class="url-preset-picker">
                <option value="https://www.logicquest.dev/courses">Preset: logicquest.dev/courses</option>
                <option value="https://www.google.com/search?q=networks">Preset: google.com/search</option>
                <option value="https://api.github.com/users/octocat">Preset: api.github.com REST</option>
                <option value="https://en.wikipedia.org/wiki/Internet">Preset: wikipedia.org/wiki</option>
              </select>
            </div>

            <!-- URL Prefix & Protocol Anatomy Explainer -->
            <div class="url-prefix-breakdown-card" id="url-prefix-breakdown-card">
              <div class="url-prefix-breakdown-title">
                <span class="url-prefix-badge">URL PROTOCOL PREFIX &amp; ANATOMY</span>
                <small>Click any segment below to understand why each prefix and component is needed:</small>
              </div>
              <div class="url-prefix-chips" id="url-prefix-chips"></div>
              <div class="url-prefix-explanation-box" id="url-prefix-explanation-box"></div>
            </div>
          </div>

          <!-- Stepper Dots -->
          <div class="url-stepper-track" id="url-stepper-dots"></div>

          <!-- Network Hop Topology diagram -->
          <div class="url-hops-stage">
            <div class="url-hop-node" id="hop-node-device">
              <div class="hop-icon-box">${I.laptop}</div>
              <div class="hop-node-title">Your Laptop</div>
              <span class="hop-node-sub">192.168.1.10</span>
            </div>
            <div class="url-hop-wire" id="wire-dev-gw"></div>

            <div class="url-hop-node" id="hop-node-gw">
              <div class="hop-icon-box">${I.router}</div>
              <div class="hop-node-title">Default Gateway</div>
              <span class="hop-node-sub">192.168.1.1</span>
            </div>
            <div class="url-hop-wire" id="wire-gw-dns"></div>

            <div class="url-hop-node" id="hop-node-dns">
              <div class="hop-icon-box">${I.globe}</div>
              <div class="hop-node-title">DNS Resolver</div>
              <span class="hop-node-sub">1.1.1.1 / 8.8.8.8</span>
            </div>
            <div class="url-hop-wire" id="wire-dns-svr"></div>

            <div class="url-hop-node" id="hop-node-server">
              <div class="hop-icon-box">${I.server}</div>
              <div class="hop-node-title">Origin Web Server</div>
              <span class="hop-node-sub">142.250.72.14</span>
            </div>
          </div>

          <!-- Active Step Inspection Card -->
          <div class="url-step-card" id="url-step-card">
            <div class="url-card-header">
              <div class="url-step-badge" id="url-step-badge">STEP 1 OF 9</div>
              <span class="url-phase-tag" id="url-phase-tag">PHASE 1: CLIENT PARSING</span>
            </div>
            <h3 class="url-card-title" id="url-card-title">URL Parsing &amp; Scheme Verification</h3>
            <p class="url-card-desc" id="url-card-desc"></p>
            <div class="url-protocol-packet" id="url-protocol-packet"></div>
          </div>

          <!-- Playback controls -->
          <div class="url-controls-footer">
            <button class="nd-btn-ctrl" id="url-prev-btn">${I.stepBack} Previous</button>
            <button class="nd-btn-ctrl nd-btn-primary" id="url-play-btn">${I.play} Auto Play</button>
            <button class="nd-btn-ctrl" id="url-next-btn">${I.stepFwd} Next Step</button>
            <button class="nd-btn-ctrl" id="url-reset-btn">${I.restart} Restart</button>
          </div>
        </div>
      </div>

      <!-- Panel 3: Subnetting -->
      <div class="nd-panel" id="tab-subnet-tab">
        <div id="subnet-root-container"></div>
      </div>

      <!-- Panel 4: Parity & Signal Encoding -->
      <div class="nd-panel" id="tab-parity-tab">
        <div id="parity-root-container"></div>
      </div>
    </div>
  `;
}

function bindNavigation() {
  document.querySelectorAll('.nd-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchNDTab(tab);
    });
  });
}

export function switchNDTab(tabId) {
  const validTabs = ['osi-tab', 'url-tab', 'subnet-tab', 'parity-tab'];
  const resolvedTab = validTabs.includes(tabId) ? tabId : 'osi-tab';
  activeTab = resolvedTab;
  stopSimulation();

  document.querySelectorAll('.nd-nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === resolvedTab);
  });
  document.querySelectorAll('.nd-panel').forEach(p => {
    p.classList.toggle('active', p.id === `tab-${resolvedTab}`);
  });

  if (resolvedTab === 'subnet-tab') {
    const root = document.getElementById('subnet-root-container');
    if (root && !root.dataset.initialized) {
      root.dataset.initialized = 'true';
      initSubnetting(root);
    }
  } else if (resolvedTab === 'parity-tab') {
    const root = document.getElementById('parity-root-container');
    if (root && !root.dataset.initialized) {
      root.dataset.initialized = 'true';
      initParity(root);
    }
  }
}

/* ============================================================
   3D OSI SIMULATOR IMPLEMENTATION
   ============================================================ */

function init3DOsi() {
  const clientStack = document.getElementById('osi-client-stack');
  const serverStack = document.getElementById('osi-server-stack');
  if (!clientStack || !serverStack) return;

  // Render 3D Slabs for both client and server (Layers 7 down to 1)
  clientStack.innerHTML = OSI_LAYERS.map(l => `
    <div class="osi-slab-3d" id="osi-c-slab-${l.num}" data-layer="${l.num}">
      <div class="slab-face top"></div>
      <div class="slab-face front">
        <div class="slab-top-row">
          <div class="slab-layer-tag">L${l.num}</div>
          <div class="slab-name">${l.name}</div>
          <div class="slab-pdu">${l.pdu}</div>
          <div class="slab-header-chip" style="border-color:${l.color}; color:${l.color}">+ ${l.headerName}</div>
        </div>
        <div class="slab-layer-stack"></div>
      </div>
      <div class="slab-face side"></div>
    </div>
  `).join('');

  serverStack.innerHTML = OSI_LAYERS.map(l => `
    <div class="osi-slab-3d" id="osi-s-slab-${l.num}" data-layer="${l.num}">
      <div class="slab-face top"></div>
      <div class="slab-face front">
        <div class="slab-top-row">
          <div class="slab-layer-tag">L${l.num}</div>
          <div class="slab-name">${l.name}</div>
          <div class="slab-pdu">${l.pdu}</div>
          <div class="slab-header-chip" style="border-color:${l.color}; color:${l.color}">- ${l.headerName}</div>
        </div>
        <div class="slab-layer-stack"></div>
      </div>
      <div class="slab-face side"></div>
    </div>
  `).join('');

  // Event Listeners for Payload Input
  const payloadInput = document.getElementById('osi-payload-input');
  payloadInput?.addEventListener('input', (e) => {
    userPayload = e.target.value || 'Data';
    renderOsiState();
  });

  const presetSelect = document.getElementById('osi-preset-select');
  presetSelect?.addEventListener('change', (e) => {
    userPayload = e.target.value;
    if (payloadInput) payloadInput.value = userPayload;
    renderOsiState();
  });

  // Speed toggles
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSpeed = parseFloat(btn.dataset.speed) || 1;
    });
  });

  // Playback Buttons
  document.getElementById('osi-play-toggle')?.addEventListener('click', toggleOsiPlay);
  document.getElementById('osi-step-next')?.addEventListener('click', () => stepOsi(1));
  document.getElementById('osi-step-back')?.addEventListener('click', () => stepOsi(-1));
  document.getElementById('osi-reset')?.addEventListener('click', resetOsi);

  renderOsiState();
}

function toggleOsiPlay() {
  osiPlaying = !osiPlaying;
  const btn = document.getElementById('osi-play-toggle');
  if (btn) btn.innerHTML = osiPlaying ? `${I.pause} Pause` : `${I.play} Play`;

  if (osiPlaying) runOsiLoop();
  else stopSimulation();
}

function runOsiLoop() {
  if (!osiPlaying) return;
  if (osiStep >= 15) {
    osiPlaying = false;
    document.getElementById('osi-play-toggle').innerHTML = `${I.restart} Restart`;
    return;
  }
  osiStep++;
  renderOsiState();
  simTimer = setTimeout(runOsiLoop, 1400 / currentSpeed);
}

function stepOsi(dir) {
  stopSimulation();
  osiPlaying = false;
  document.getElementById('osi-play-toggle').innerHTML = `${I.play} Play`;
  osiStep = Math.max(0, Math.min(15, osiStep + dir));
  renderOsiState();
}

function resetOsi() {
  stopSimulation();
  osiPlaying = false;
  osiStep = 0;
  document.getElementById('osi-play-toggle').innerHTML = `${I.play} Play`;
  renderOsiState();
}

function buildPacketSequenceMarkup() {
  const layerNumbers = [2, 3, 4, 5, 6, 7];
  const boxMarkup = layerNumbers
    .map(num => `<span class="pulse-box pulse-layer" data-layer="${num}">${num}</span>`)
    .join('');

  return `
    <div class="pulse-sequence" aria-label="OSI packet headers">
      ${boxMarkup}
      <span class="pulse-box pulse-data">data</span>
    </div>
  `;
}

function renderLayerStackForHost(hostId) {
  const host = document.getElementById(hostId);
  if (!host) return;

  const slabs = host.querySelectorAll('.osi-slab-3d');
  slabs.forEach(slab => {
    const layerNum = Number(slab.dataset.layer);
    const stack = slab.querySelector('.slab-layer-stack');
    if (!stack) return;

    let visibleLayers = [];
    if (hostId === 'osi-client-stack') {
      if (osiStep >= 1 && osiStep <= 7) {
        const activeLayer = 8 - osiStep;
        visibleLayers = OSI_LAYERS.filter(layer => layer.num >= activeLayer && layer.num <= 7);
      } else if (osiStep >= 8) {
        visibleLayers = OSI_LAYERS;
      }
    } else if (hostId === 'osi-server-stack') {
      if (osiStep >= 9 && osiStep <= 15) {
        const activeLayer = osiStep - 8;
        visibleLayers = OSI_LAYERS.filter(layer => layer.num > activeLayer && layer.num <= 7);
      } else if (osiStep >= 8) {
        visibleLayers = OSI_LAYERS;
      }
    }

    const isVisible = visibleLayers.some(layer => layer.num === layerNum);
    stack.innerHTML = isVisible
      ? visibleLayers
          .filter(layer => layer.num === layerNum)
          .map(layer => `
            <span class="slab-layer-box" style="--layer-color:${layer.color}; border-color:${layer.color}; background:rgba(${hexToRgb(layer.color)}, 0.18);">
              <span class="slab-layer-box-num">L${layer.num}</span>
              <span class="slab-layer-box-name">${layer.headerName}</span>
            </span>
          `)
          .join('')
      : '';
  });
}

function renderOsiState() {
  const stagePill = document.getElementById('osi-stage-pill');
  const stageTitle = document.getElementById('osi-stage-title');
  const stageDesc = document.getElementById('osi-stage-desc');
  const packetTags = document.getElementById('osi-packet-tags');
  const headerDetails = document.getElementById('osi-header-details');
  const pulsePacket = document.getElementById('osi-pulse-packet');
  const cableLine = document.getElementById('osi-cable-line');
  const clientHost = document.getElementById('osi-client-host');
  const serverHost = document.getElementById('osi-server-host');

  // Clear all active/completed classes from slabs
  document.querySelectorAll('.osi-slab-3d').forEach(s => {
    s.classList.remove('active', 'completed');
  });

  if (pulsePacket) {
    pulsePacket.classList.remove('in-transit');
    pulsePacket.innerHTML = `<div class="pulse-inner">${buildPacketSequenceMarkup()}</div>`;
  }
  if (cableLine) cableLine.classList.remove('active');
  clientHost?.classList.remove('active');
  serverHost?.classList.remove('active');

  renderLayerStackForHost('osi-client-stack');
  renderLayerStackForHost('osi-server-stack');

  // STAGE 0: IDLE
  if (osiStep === 0) {
    if (stagePill) stagePill.textContent = 'STAGE 0 / 15 • IDLE';
    if (stageTitle) stageTitle.textContent = 'Ready to begin transmission';
    if (stageDesc) stageDesc.innerHTML = `Data payload is initialized with <strong>"${escapeHtml(userPayload)}"</strong>. Click <strong>Play</strong> or <strong>Step Next</strong> to begin client encapsulation.`;
    if (packetTags) packetTags.innerHTML = `<span class="packet-tag data">[DATA: "${escapeHtml(userPayload)}"]</span>`;
    if (headerDetails) headerDetails.innerHTML = '';
    return;
  }

  // STAGES 1 to 7: ENCAPSULATION (Client Sender, L7 -> L1)
  if (osiStep >= 1 && osiStep <= 7) {
    clientHost?.classList.add('active');
    const layerNum = 8 - osiStep; // 7, 6, 5, 4, 3, 2, 1
    const currentLayer = OSI_LAYERS.find(l => l.num === layerNum);

    // Active slab
    const activeSlab = document.getElementById(`osi-c-slab-${layerNum}`);
    activeSlab?.classList.add('active');

    // Completed previous layers (from L7 down to layerNum + 1)
    for (let l = 7; l > layerNum; l--) {
      document.getElementById(`osi-c-slab-${l}`)?.classList.add('completed');
    }

    if (stagePill) stagePill.textContent = `STAGE ${osiStep} / 15 • CLIENT ENCAPSULATION`;
    if (stageTitle) stageTitle.innerHTML = `Layer ${layerNum} (${currentLayer.name}) Encapsulation: Added [${currentLayer.headerName}]`;
    if (stageDesc) stageDesc.innerHTML = `<strong>PDU: ${currentLayer.pdu}</strong> — ${currentLayer.actionDesc}`;

    // Build cumulative packet tags
    if (packetTags) {
      let tagsHtml = '';
      // Added headers so far (from layerNum up to 2, then data)
      for (let l = layerNum; l <= 7; l++) {
        const item = OSI_LAYERS.find(x => x.num === l);
        tagsHtml += `<span class="packet-tag" style="border-color:${item.color}; background:rgba(${hexToRgb(item.color)}, 0.18); color:${item.color}">[${item.headerName}]</span>`;
      }
      tagsHtml += `<span class="packet-tag data">[DATA: "${escapeHtml(userPayload)}"]</span>`;
      if (layerNum <= 2) {
        tagsHtml += `<span class="packet-tag trailer" style="border-color:#818cf8; background:rgba(129,140,248,0.18); color:#818cf8">[FCS: 0x7E3A]</span>`;
      }
      packetTags.innerHTML = tagsHtml;
    }

    // Header breakdown details
    if (headerDetails) {
      headerDetails.innerHTML = `
        <div class="hdr-spec-card">
          <div class="hdr-spec-badge" style="background:${currentLayer.color}">${currentLayer.headerName} HEADER</div>
          <div class="hdr-spec-content">
            <strong>${currentLayer.headerDesc}</strong>
            <small>PDU Level: ${currentLayer.pdu} &bull; OSI Layer ${currentLayer.num}</small>
          </div>
        </div>
      `;
    }
    return;
  }

  // STAGE 8: PHYSICAL WIRE TRANSIT
  if (osiStep === 8) {
    // All client slabs completed
    for (let l = 1; l <= 7; l++) {
      document.getElementById(`osi-c-slab-${l}`)?.classList.add('completed');
    }
    if (pulsePacket) {
      pulsePacket.classList.add('in-transit');
      pulsePacket.innerHTML = `<div class="pulse-inner">${buildPacketSequenceMarkup()}</div>`;
    }
    if (cableLine) cableLine.classList.add('active');

    if (stagePill) stagePill.textContent = `STAGE 8 / 15 • PHYSICAL WIRE TRANSIT`;
    if (stageTitle) stageTitle.textContent = `Bitstream Traveling Across Cat6 Physical Cable`;
    if (stageDesc) stageDesc.innerHTML = `The completely encapsulated Ethernet Frame is modulated into high-frequency electrical pulses traveling at ~200,000 km/s (67% speed of light) through the copper wire towards Server.`;

    if (packetTags) {
      packetTags.innerHTML = `
        <span class="packet-tag bits" style="color:var(--lime, #bef264); border-color:var(--lime, #bef264); background:rgba(190,242,100,0.15)">
          [PHYSICAL WIRE BITS: 01001000 01100101 01101100 01101100 01101111 00100000 01001100 01101111 01100111 01101001 01100011...]
        </span>
      `;
    }

    if (headerDetails) {
      headerDetails.innerHTML = `
        <div class="hdr-spec-card">
          <div class="hdr-spec-badge" style="background:#bef264; color:#0b140e">1000BASE-T</div>
          <div class="hdr-spec-content">
            <strong>4-Pair Balanced Category 6 Twisted Pair Cable</strong>
            <small>Signaling: PAM-5 Modulation &bull; Throughput: 1,000,000,000 bits/sec</small>
          </div>
        </div>
      `;
    }
    return;
  }

  // STAGES 9 to 15: DE-ENCAPSULATION (Server Receiver, L1 -> L7)
  if (osiStep >= 9 && osiStep <= 15) {
    serverHost?.classList.add('active');
    // Client remains all completed
    for (let l = 1; l <= 7; l++) {
      document.getElementById(`osi-c-slab-${l}`)?.classList.add('completed');
    }

    const layerNum = osiStep - 8; // 1, 2, 3, 4, 5, 6, 7
    const currentLayer = OSI_LAYERS.find(l => l.num === layerNum);

    // Active server slab
    const activeSlab = document.getElementById(`osi-s-slab-${layerNum}`);
    activeSlab?.classList.add('active');

    // Completed server slabs (from L1 up to layerNum - 1)
    for (let l = 1; l < layerNum; l++) {
      document.getElementById(`osi-s-slab-${l}`)?.classList.add('completed');
    }

    if (stagePill) stagePill.textContent = `STAGE ${osiStep} / 15 • SERVER DE-ENCAPSULATION`;
    if (stageTitle) stageTitle.innerHTML = `Layer ${layerNum} (${currentLayer.name}) De-encapsulation: Stripped &amp; Verified [${currentLayer.headerName}]`;

    if (layerNum === 7) {
      if (stageDesc) stageDesc.innerHTML = `<strong style="color:var(--lime, #bef264)">&check; SUCCESS!</strong> Application Layer delivered final decoded payload to server backend process: <strong style="color:var(--lime, #bef264)">"${escapeHtml(userPayload)}"</strong>. All 7 layers verified integrity and removed headers without data corruption.`;
    } else {
      if (stageDesc) stageDesc.innerHTML = `<strong>PDU: ${currentLayer.pdu}</strong> — Header [${currentLayer.headerName}] stripped. Checksums validated. Remaining payload passed upward to Layer ${layerNum + 1}.`;
    }

    // Show remaining headers to be stripped
    if (packetTags) {
      if (layerNum === 7) {
        packetTags.innerHTML = `<span class="packet-tag data success" style="border-color:var(--lime, #bef264); background:rgba(190,242,100,0.2); color:var(--lime, #bef264); font-size:0.95rem; font-weight:800">&check; DELIVERED DECODED PAYLOAD: "${escapeHtml(userPayload)}"</span>`;
      } else {
        let tagsHtml = '';
        for (let l = layerNum + 1; l <= 7; l++) {
          const item = OSI_LAYERS.find(x => x.num === l);
          tagsHtml += `<span class="packet-tag" style="border-color:${item.color}; background:rgba(${hexToRgb(item.color)}, 0.18); color:${item.color}">[${item.headerName}]</span>`;
        }
        tagsHtml += `<span class="packet-tag data">[DATA: "${escapeHtml(userPayload)}"]</span>`;
        packetTags.innerHTML = tagsHtml;
      }
    }

    if (headerDetails) {
      headerDetails.innerHTML = `
        <div class="hdr-spec-card">
          <div class="hdr-spec-badge" style="background:${currentLayer.color}">${currentLayer.headerName} VERIFIED</div>
          <div class="hdr-spec-content">
            <strong>${currentLayer.headerName} header removed and verified successfully.</strong>
            <small>Remaining payload delivered to Layer ${Math.min(7, layerNum + 1)} (${OSI_LAYERS.find(l => l.num === Math.min(7, layerNum + 1)).name})</small>
          </div>
        </div>
      `;
    }
  }
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}

/* ============================================================
   URL TO PIXELS / URL JOURNEY IMPLEMENTATION
   ============================================================ */

const URL_LIFECYCLE_STEPS = [
  {
    step: 1,
    phase: 'PHASE 1: CLIENT PARSING',
    title: 'URL Parsing & Protocol Identification',
    desc: 'The browser tokenizes the input string into URI components: Scheme (https), Host (www.logicquest.dev), Default Port (443), and Path (/courses). It enforces strict encoding and ASCII sanitization.',
    activeHops: ['hop-node-device'],
    activeWires: [],
    packetPdu: 'URL String',
    packetHdr: 'URI: scheme=https host=www.logicquest.dev port=443 path=/courses',
  },
  {
    step: 2,
    phase: 'PHASE 2: SECURITY & CACHE',
    title: 'HSTS & Browser Cache Inspection',
    desc: 'Checks the local HTTP cache and Service Worker caches. It checks the built-in HSTS (HTTP Strict Transport Security) list to confirm that all communication MUST strictly use TLS/HTTPS without unencrypted HTTP redirect.',
    activeHops: ['hop-node-device'],
    activeWires: [],
    packetPdu: 'HSTS Lookup',
    packetHdr: 'HSTS Policy: max-age=31536000; includeSubDomains; preload (Cache: MISS)',
  },
  {
    step: 3,
    phase: 'PHASE 3: DNS RESOLUTION',
    title: 'Hierarchical Recursive DNS Resolution',
    desc: 'The client requests IP resolution for domain name. The recursive resolver queries Root (.), TLD (.dev), and Authoritative nameservers, resolving the domain to destination IPv4 142.250.72.14.',
    activeHops: ['hop-node-device', 'hop-node-gw', 'hop-node-dns'],
    activeWires: ['wire-dev-gw', 'wire-gw-dns'],
    packetPdu: 'DNS Query / Answer (UDP 53)',
    packetHdr: 'DNS Header (ID: 0x3A2F, Opcode: Query, QNAME: www.logicquest.dev, A Record -> 142.250.72.14, TTL: 300s)',
  },
  {
    step: 4,
    phase: 'PHASE 4: LOCAL LINK EGRESS',
    title: 'ARP Resolution for Local Default Gateway',
    desc: 'Since 142.250.72.14 is outside the local subnet (192.168.1.0/24), the host queries ARP for the MAC address of its default gateway router (192.168.1.1) to encapsulate layer-2 frames.',
    activeHops: ['hop-node-device', 'hop-node-gw'],
    activeWires: ['wire-dev-gw'],
    packetPdu: 'ARP Request / Reply (EtherType: 0x0806)',
    packetHdr: 'ARP: Who has 192.168.1.1? Tell 192.168.1.10 -> Reply: 192.168.1.1 is at 00:50:56:C0:00:01',
  },
  {
    step: 5,
    phase: 'PHASE 5: TRANSPORT HANDSHAKE',
    title: 'TCP 3-Way Handshake (SYN &rarr; SYN-ACK &rarr; ACK)',
    desc: 'Establishes a reliable connection between Client port 52140 and Server port 443. Synchronizes initial sequence numbers (ISN) and negotiates window scaling and MSS (1460 bytes).',
    activeHops: ['hop-node-device', 'hop-node-gw', 'hop-node-server'],
    activeWires: ['wire-dev-gw', 'wire-dns-svr'],
    packetPdu: 'TCP Segments (Port 443)',
    packetHdr: 'TCP Flags: [SYN] Seq=0 &rarr; [SYN, ACK] Seq=0, Ack=1 &rarr; [ACK] Seq=1, Ack=1 (RTT: 28ms)',
  },
  {
    step: 6,
    phase: 'PHASE 6: CRYPTOGRAPHIC TUNNEL',
    title: 'TLS 1.3 Cryptographic Handshake',
    desc: 'Secures communication: ClientHello offers TLS 1.3 cipher suites and Elliptic Curve Key Share (X25519). Server replies with certificate chain, signs key exchange, and both compute shared symmetric AES-256-GCM keys.',
    activeHops: ['hop-node-device', 'hop-node-gw', 'hop-node-server'],
    activeWires: ['wire-dev-gw', 'wire-dns-svr'],
    packetPdu: 'TLS 1.3 Record Frames',
    packetHdr: 'TLS 1.3: ClientHello &rarr; ServerHello, EncryptedExtensions, Certificate, Finished &rarr; AppData',
  },
  {
    step: 7,
    phase: 'PHASE 7: APPLICATION REQUEST',
    title: 'HTTP/2 Multiplexed Request Over TLS',
    desc: 'Browser transmits encrypted HTTP/2 binary HEADERS frame with HPACK compression, requesting the URL path with Accept, User-Agent, and modern browser feature headers.',
    activeHops: ['hop-node-device', 'hop-node-gw', 'hop-node-server'],
    activeWires: ['wire-dev-gw', 'wire-dns-svr'],
    packetPdu: 'HTTP/2 HEADERS Frame (Stream 1)',
    packetHdr: 'HEADERS: :method=GET, :scheme=https, :authority=logicquest.dev, :path=/courses (Length: 284 bytes)',
  },
  {
    step: 8,
    phase: 'PHASE 8: SERVER RESPONSE',
    title: 'Server Response (HTTP 200 OK) & TLS Frames',
    desc: 'Origin web server handles request, compresses response body via Brotli/Gzip, and streams back encrypted response frames containing HTML markup, CSS stylesheets, and JS bundles.',
    activeHops: ['hop-node-server', 'hop-node-gw', 'hop-node-device'],
    activeWires: ['wire-dns-svr', 'wire-dev-gw'],
    packetPdu: 'HTTP/2 DATA Frame (Stream 1)',
    packetHdr: 'STATUS: 200 OK, content-type: text/html; charset=utf-8, content-encoding: br, content-length: 14208',
  },
  {
    step: 9,
    phase: 'PHASE 9: CLIENT RENDERING',
    title: 'Critical Rendering Path: HTML &rarr; DOM &rarr; Screen Pixels',
    desc: 'Browser engine parses HTML into DOM tree, parses CSS into CSSOM, combines them into Render Tree, computes Layout (reflow), rasterizes paint layers on GPU, and outputs final pixels on screen.',
    activeHops: ['hop-node-device'],
    activeWires: [],
    packetPdu: 'GPU Frame Buffer',
    packetHdr: 'DOM: 842 nodes &bull; CSSOM: 124 rules &bull; Composite Layers: 4 &bull; First Contentful Paint: 68ms',
  },
];

let journeyStep = 1;
let journeyPlaying = false;
let journeyTimer = null;

function initJourney() {
  const dotsContainer = document.getElementById('url-stepper-dots');
  if (!dotsContainer) return;

  dotsContainer.innerHTML = URL_LIFECYCLE_STEPS.map(s => `
    <button class="stepper-dot ${s.step === 1 ? 'active' : ''}" data-step="${s.step}" title="Step ${s.step}: ${s.title}">
      ${s.step}
    </button>
  `).join('');

  dotsContainer.querySelectorAll('.stepper-dot').forEach(btn => {
    btn.addEventListener('click', () => {
      stopJourney();
      journeyStep = parseInt(btn.dataset.step, 10);
      renderJourneyStep();
    });
  });

  const urlInput = document.getElementById('url-journey-input');
  const presetPicker = document.getElementById('url-preset-picker');

  presetPicker?.addEventListener('change', (e) => {
    if (urlInput) urlInput.value = e.target.value;
    renderJourneyStep();
  });

  urlInput?.addEventListener('input', () => {
    renderJourneyStep();
  });

  document.getElementById('url-next-btn')?.addEventListener('click', () => stepJourney(1));
  document.getElementById('url-prev-btn')?.addEventListener('click', () => stepJourney(-1));
  document.getElementById('url-reset-btn')?.addEventListener('click', resetJourney);
  document.getElementById('url-play-btn')?.addEventListener('click', toggleJourneyPlay);

  renderJourneyStep();
}

function stopJourney() {
  journeyPlaying = false;
  if (journeyTimer) {
    clearTimeout(journeyTimer);
    journeyTimer = null;
  }
  const btn = document.getElementById('url-play-btn');
  if (btn) btn.innerHTML = `${I.play} Auto Play`;
}

function toggleJourneyPlay() {
  journeyPlaying = !journeyPlaying;
  const btn = document.getElementById('url-play-btn');
  if (btn) btn.innerHTML = journeyPlaying ? `${I.pause} Pause` : `${I.play} Auto Play`;

  if (journeyPlaying) runJourneyLoop();
  else stopJourney();
}

function runJourneyLoop() {
  if (!journeyPlaying) return;
  if (journeyStep >= URL_LIFECYCLE_STEPS.length) {
    stopJourney();
    return;
  }
  journeyStep++;
  renderJourneyStep();
  journeyTimer = setTimeout(runJourneyLoop, 2200);
}

function stepJourney(dir) {
  stopJourney();
  journeyStep = Math.max(1, Math.min(URL_LIFECYCLE_STEPS.length, journeyStep + dir));
  renderJourneyStep();
}

function resetJourney() {
  stopJourney();
  journeyStep = 1;
  renderJourneyStep();
}

function renderJourneyStep() {
  const current = URL_LIFECYCLE_STEPS.find(s => s.step === journeyStep) || URL_LIFECYCLE_STEPS[0];
  const urlVal = document.getElementById('url-journey-input')?.value || 'https://www.logicquest.dev/courses';

  // Stepper dots
  document.querySelectorAll('.stepper-dot').forEach(dot => {
    const s = parseInt(dot.dataset.step, 10);
    dot.classList.toggle('active', s === journeyStep);
    dot.classList.toggle('completed', s < journeyStep);
  });

  // Hops & Wires
  const allHops = ['hop-node-device', 'hop-node-gw', 'hop-node-dns', 'hop-node-server'];
  allHops.forEach(id => {
    document.getElementById(id)?.classList.toggle('active', current.activeHops.includes(id));
  });

  const allWires = ['wire-dev-gw', 'wire-gw-dns', 'wire-dns-svr'];
  allWires.forEach(id => {
    document.getElementById(id)?.classList.toggle('active', current.activeWires.includes(id));
  });

  // Update dynamic URL references in title & desc
  let dynamicDesc = current.desc;
  try {
    const parsed = new URL(urlVal.startsWith('http') ? urlVal : `https://${urlVal}`);
    dynamicDesc = dynamicDesc
      .replace(/www\.logicquest\.dev/g, parsed.hostname)
      .replace(/\/courses/g, parsed.pathname || '/');
  } catch(e) { /* ignore parse error */ }

  const badge = document.getElementById('url-step-badge');
  const phaseTag = document.getElementById('url-phase-tag');
  const title = document.getElementById('url-card-title');
  const desc = document.getElementById('url-card-desc');
  const packetBox = document.getElementById('url-protocol-packet');

  if (badge) badge.textContent = `STEP ${current.step} OF ${URL_LIFECYCLE_STEPS.length}`;
  if (phaseTag) phaseTag.textContent = current.phase;
  if (title) title.textContent = current.title;
  if (desc) desc.textContent = dynamicDesc;

  if (packetBox) {
    packetBox.innerHTML = `
      <div class="url-pdu-box">
        <span class="url-pdu-badge">${current.packetPdu}</span>
        <code>${current.packetHdr}</code>
      </div>
    `;
  }

  renderUrlPrefixBreakdown(urlVal);
}

function renderUrlPrefixBreakdown(urlVal) {
  const chipsContainer = document.getElementById('url-prefix-chips');
  const explContainer = document.getElementById('url-prefix-explanation-box');
  if (!chipsContainer || !explContainer) return;

  let parsed = null;
  const rawUrl = (urlVal || '').trim();
  try {
    parsed = new URL(rawUrl.includes('://') ? rawUrl : `https://${rawUrl}`);
  } catch(e) {
    parsed = {
      protocol: 'https:',
      hostname: 'www.logicquest.dev',
      pathname: '/courses',
      port: '443',
      search: ''
    };
  }

  const scheme = parsed.protocol ? parsed.protocol + '//' : 'https://';
  const hostParts = parsed.hostname.split('.');
  let subdomain = '';
  let domain = '';
  let tld = '';

  if (hostParts.length >= 3) {
    subdomain = hostParts[0] + '.';
    domain = hostParts[1];
    tld = '.' + hostParts.slice(2).join('.');
  } else if (hostParts.length === 2) {
    domain = hostParts[0];
    tld = '.' + hostParts[1];
  } else {
    domain = parsed.hostname;
  }

  const port = parsed.port ? `:${parsed.port}` : (scheme.startsWith('https') ? ':443' : ':80');
  const path = parsed.pathname || '/';

  const segments = [
    {
      id: 'scheme',
      val: scheme,
      name: 'Protocol Prefix (Scheme)',
      badge: 'PREFIX',
      color: '#bef264',
      bg: 'rgba(190, 242, 100, 0.15)',
      desc: 'The protocol prefix specifies HOW the browser connects to the server. "https://" means Hypertext Transfer Protocol Secure: all communication is encrypted end-to-end using TLS 1.3 over TCP port 443 before hitting the network cable. If unencrypted "http://" were used, passwords, session cookies, and payloads would travel as plaintext visible to any Wi-Fi sniffer or router on the path.'
    },
    ...(subdomain ? [{
      id: 'subdomain',
      val: subdomain,
      name: 'Subdomain Prefix',
      badge: 'SUBDOMAIN',
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.15)',
      desc: 'Subdomain prefix identifies a specific sub-division or service cluster belonging to the parent domain (e.g. "www" for web server, "api" for backend REST endpoints, "mail" for SMTP/IMAP servers).'
    }] : []),
    {
      id: 'domain',
      val: domain,
      name: 'Registered Domain Name',
      badge: 'DOMAIN',
      color: '#a78bfa',
      bg: 'rgba(167, 139, 250, 0.15)',
      desc: 'The human-memorable domain name purchased from a domain registrar. Computers cannot route packets using text names—DNS translates this text name into a 32-bit IPv4 address (like 142.250.72.14).'
    },
    {
      id: 'tld',
      val: tld,
      name: 'Top-Level Domain (TLD)',
      badge: 'TLD',
      color: '#f472b6',
      bg: 'rgba(244, 114, 182, 0.15)',
      desc: 'The top-level hierarchy of the Domain Name System (.dev, .com, .edu, .org, .lk). TLDs are managed by root DNS servers. For example, all ".dev" domains are on Google\'s HSTS preload list and strictly forbid unencrypted HTTP.'
    },
    {
      id: 'port',
      val: port,
      name: 'Transport Port',
      badge: 'PORT',
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.15)',
      desc: 'TCP Port identifies which application service on the server will receive the packets. HTTPS uses port 443 by default (implied by the https:// prefix). Standard unencrypted HTTP uses port 80.'
    },
    {
      id: 'path',
      val: path,
      name: 'Resource Path',
      badge: 'PATH',
      color: '#34d399',
      bg: 'rgba(52, 211, 153, 0.15)',
      desc: 'The exact route or resource identifier on the web server (e.g. file, API route, or SPA view). This path is placed in the HTTP request header: "GET /courses HTTP/2".'
    },
  ];

  chipsContainer.innerHTML = segments.map((seg, i) => `
    <button type="button" class="url-prefix-chip ${i === 0 ? 'active' : ''}" data-seg="${seg.id}" style="--chip-color:${seg.color}; --chip-bg:${seg.bg}">
      <span class="chip-badge">${seg.badge}</span>
      <span class="chip-val">${escapeHtml(seg.val)}</span>
    </button>
  `).join('');

  function showSegDetail(seg) {
    explContainer.innerHTML = `
      <div class="url-detail-card" style="border-left: 3px solid ${seg.color}">
        <div class="url-detail-head">
          <strong style="color:${seg.color}">${seg.name}: <code>${escapeHtml(seg.val)}</code></strong>
          <span class="url-detail-badge" style="background:${seg.bg}; color:${seg.color}; border:1px solid ${seg.color}">${seg.badge}</span>
        </div>
        <p>${seg.desc}</p>
      </div>
    `;
  }

  showSegDetail(segments[0]);

  chipsContainer.querySelectorAll('.url-prefix-chip').forEach((chip, i) => {
    chip.addEventListener('click', () => {
      chipsContainer.querySelectorAll('.url-prefix-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      showSegDetail(segments[i]);
    });
  });
}

