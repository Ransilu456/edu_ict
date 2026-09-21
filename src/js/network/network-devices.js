import { initSubnetting } from './subnetting.js';
import { initParity } from './parity.js';

let activeTab = 'osi-tab';
let simTimer = null;
let animFrameId = null;
let currentSpeed = 1;

const I = {
  play: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`,
  stepFwd: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><rect x="17" y="4" width="2" height="16" rx="1"/></svg>`,
  stepBack: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><rect x="5" y="4" width="2" height="16" rx="1"/></svg>`,
  restart: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  back: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`,
  check: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#22c55e" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  server: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="6" rx="1"/><rect x="2" y="15" width="20" height="6" rx="1"/><circle cx="6" cy="6" r="1" fill="#38bdf8"/><circle cx="6" cy="18" r="1" fill="#38bdf8"/></svg>`,
  laptop: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="12" rx="1"/><polygon points="2 20 22 20 18 16 6 16 2 20"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  router: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="8" width="20" height="10" rx="2"/><circle cx="7" cy="13" r="1.2" fill="currentColor"/><circle cx="12" cy="13" r="1.2" fill="currentColor"/><circle cx="17" cy="13" r="1.2" fill="currentColor"/><path d="M7 8V4M12 8V4M17 8V4" stroke-linecap="round"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  journey: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="4" cy="12" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="20" cy="12" r="2"/><path d="M6 12h4l4-6h4"/></svg>`,
  subnet: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  parity: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M3 12h18M3 18h18M7 3v18M17 3v18"/></svg>`
};



export function initNetworkDevices() {
  const container = document.getElementById('nd-lab-container');
  if (!container) return;

  renderShell(container);
  bindNavigation();
  init3DOsi();
  initJourney();

  // Switch to active tab
  switchNDTab(activeTab);
}

export function cleanupNetworkDevices() {
  stopSimulation();
}

window.initNetworkDevices = initNetworkDevices;
window.cleanupNetworkDevices = cleanupNetworkDevices;
window.switchNDTab = switchNDTab;

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

      
      <div class="nd-panel active" id="tab-osi-tab">
        <div class="osi-3d-lab active">
          <div class="osi-3d-header">
            <div>
              <span class="iw-tag">INTERACTIVE 3D ENCAPSULATION</span>
              <h2>7-Layer OSI Encapsulation &amp; De-encapsulation</h2>
              <p>Watch data travel down the client stack, get packaged with headers, traverse the physical link, and unpack on the server.</p>
            </div>
            <div class="osi-controls">
              <button class="iw-btn-ctrl" id="osi-step-back">${I.stepBack}</button>
              <button class="iw-btn-ctrl primary" id="osi-play-toggle">${I.play} Play</button>
              <button class="iw-btn-ctrl" id="osi-step-next">${I.stepFwd}</button>
              <button class="iw-btn-ctrl" id="osi-reset">${I.restart}</button>
            </div>
          </div>

          <div class="osi-stage-container">
            <!-- Client Stack -->
            <div class="osi-host-column client">
              <div class="osi-host-badge">
                <div class="osi-device-icon laptop">${I.laptop}</div>
                <div>
                  <strong>CLIENT (SENDER)</strong>
                  <span>192.168.1.10</span>
                </div>
              </div>
              <div class="osi-3d-stack" id="osi-client-stack"></div>
            </div>

            <div class="osi-cable-column">
              <div class="osi-cable-line"></div>
              <div class="osi-cable-packet" id="osi-cable-packet" style="display:none;">
                <div class="osi-packet-pill">
                  <span class="p-hdr p2">2</span>
                  <span class="p-hdr p3">3</span>
                  <span class="p-hdr p4">4</span>
                  <span class="p-hdr p7">7</span>
                  <span class="p-data">DATA</span>
                </div>
              </div>
              <span class="osi-cable-label">Physical 1000BASE-T Ethernet Cable</span>
            </div>

            <!-- Server Stack -->
            <div class="osi-host-column server">
              <div class="osi-host-badge">
                <div class="osi-device-icon server">${I.server}</div>
                <div>
                  <strong>SERVER (RECEIVER)</strong>
                  <span>142.250.72.14</span>
                </div>
              </div>
              <div class="osi-3d-stack" id="osi-server-stack"></div>
            </div>
          </div>

          <div class="osi-status-panel">
            <div class="osi-step-indicator" id="osi-step-badge">STAGE 1 / 14</div>
            <div class="osi-step-explanation" id="osi-step-text">Press Play to begin transmission.</div>
            <div class="osi-header-breakdown" id="osi-header-inspect"></div>
          </div>
        </div>
      </div>

      <div class="nd-panel" id="tab-url-tab">
        <div class="url-journey-lab">
          <div class="url-bar-container">
            <div class="url-browser-bar">
              <span class="url-lock-icon">${I.lock}</span>
              <input type="text" class="url-input-field" value="https://www.example.com/index.html" readonly />
              <span class="url-status-badge" id="url-status-chip">Ready</span>
            </div>
          </div>

          <div class="url-progress-stepper" id="url-stepper-dots"></div>

          <div class="url-hops-diagram">
            <div class="url-hop-node" id="hop-device">
              <div class="url-hop-icon laptop">${I.laptop}</div>
              <strong>Your Device</strong>
              <small>192.168.1.10</small>
            </div>
            <div class="url-hop-wire" id="wire-gw"></div>
            <div class="url-hop-node" id="hop-gw">
              <div class="url-hop-icon router">${I.router || I.globe}</div>
              <strong>Gateway</strong>
              <small>192.168.1.1</small>
            </div>
            <div class="url-hop-wire" id="wire-r1"></div>
            <div class="url-hop-node" id="hop-r1">
              <div class="url-hop-icon router">${I.globe}</div>
              <strong>ISP Router</strong>
              <small>Transit</small>
            </div>
            <div class="url-hop-wire" id="wire-srv"></div>
            <div class="url-hop-node" id="hop-server">
              <div class="url-hop-icon server">${I.server}</div>
              <strong>Edge Server</strong>
              <small>93.184.216.34</small>
            </div>

            <div class="url-diagram-packet" id="url-fly-packet"></div>
          </div>

          <div class="url-step-detail-card" id="url-step-card">
            <div class="url-card-head">
              <span class="url-card-num" id="url-card-num">1</span>
              <h3 id="url-card-title">Browser Parses URL</h3>
              <span class="url-phase-tag" id="url-phase-tag">Client side</span>
            </div>
            <p id="url-card-desc">The browser breaks the URL into scheme (HTTPS), hostname (www.example.com), and path (/index.html).</p>
            <div class="url-card-subpanel" id="url-card-extra"></div>
          </div>

          <div class="url-latency-bar">
            <span class="latency-label">LATENCY BREAKDOWN</span>
            <div class="latency-segments">
              <div class="lat-seg dns active">DNS (18ms)</div>
              <div class="lat-seg tcp">TCP (24ms)</div>
              <div class="lat-seg tls">TLS (32ms)</div>
              <div class="lat-seg ttfb">TTFB (45ms)</div>
              <div class="lat-seg download">Transfer (12ms)</div>
            </div>
          </div>

          <div class="url-playback-toolbar">
            <button class="iw-btn-ctrl" id="url-prev-btn">${I.stepBack}</button>
            <button class="iw-btn-ctrl primary" id="url-play-btn">${I.play} Play</button>
            <button class="iw-btn-ctrl" id="url-next-btn">${I.stepFwd}</button>
            <button class="iw-btn-ctrl" id="url-reset-btn">${I.restart}</button>
            <span class="url-step-counter" id="url-step-counter">Step 1 of 11</span>
          </div>
        </div>
      </div>

      <div class="nd-panel" id="tab-subnet-tab">
        <div id="subnet-root-container"></div>
      </div>

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

  if (tabId === 'subnet-tab') {
    const root = document.getElementById('subnet-root-container');
    if (root && !root.dataset.initialized) {
      root.dataset.initialized = 'true';
      initSubnetting(root);
    }
  } else if (tabId === 'parity-tab') {
    const root = document.getElementById('parity-root-container');
    if (root && !root.dataset.initialized) {
      root.dataset.initialized = 'true';
      initParity(root);
    }
  }
}


const OSI_DATA = [
  { n: 7, name: 'Application', hdr: 'HTTP', color: '#ef4444', desc: 'Generates user application data request' },
  { n: 6, name: 'Presentation', hdr: 'TLS', color: '#f97316', desc: 'Encrypts and encodes data into standard format' },
  { n: 5, name: 'Session', hdr: 'SYNC', color: '#eab308', desc: 'Maintains dialogue and socket session state' },
  { n: 4, name: 'Transport', hdr: 'TCP', color: '#22c55e', desc: 'Adds port 443 destination and sequence numbers' },
  { n: 3, name: 'Network', hdr: 'IP', color: '#3b82f6', desc: 'Adds source & destination IP addresses for routing' },
  { n: 2, name: 'Data Link', hdr: 'MAC', color: '#818cf8', desc: 'Wraps into Ethernet frame with MAC & checksum' },
  { n: 1, name: 'Physical', hdr: 'BITS', color: '#c084fc', desc: 'Transmits raw bitstream as electrical/light pulses' },
];

let osiStep = 0;
let osiPlaying = false;

function init3DOsi() {
  const clientStack = document.getElementById('osi-client-stack');
  const serverStack = document.getElementById('osi-server-stack');
  if (!clientStack || !serverStack) return;

  clientStack.innerHTML = OSI_DATA.map(l => `
    <div class="osi-3d-slab" id="osi-c-slab-${l.n}" data-layer="${l.n}">
      <span class="slab-num">${l.n}</span>
      <span class="slab-name">${l.name}</span>
      <div class="slab-recess" id="osi-c-recess-${l.n}"></div>
    </div>
  `).join('');

  serverStack.innerHTML = OSI_DATA.map(l => `
    <div class="osi-3d-slab" id="osi-s-slab-${l.n}" data-layer="${l.n}">
      <span class="slab-name">${l.name}</span>
      <span class="slab-num">${l.n}</span>
      <div class="slab-recess" id="osi-s-recess-${l.n}"></div>
    </div>
  `).join('');

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
  if (osiStep >= 14) {
    osiPlaying = false;
    document.getElementById('osi-play-toggle').innerHTML = `${I.restart} Restart`;
    return;
  }
  osiStep++;
  renderOsiState();
  simTimer = setTimeout(runOsiLoop, 1300 / currentSpeed);
}

function stepOsi(dir) {
  stopSimulation();
  osiPlaying = false;
  document.getElementById('osi-play-toggle').innerHTML = `${I.play} Play`;
  osiStep = Math.max(0, Math.min(14, osiStep + dir));
  renderOsiState();
}

function resetOsi() {
  stopSimulation();
  osiPlaying = false;
  osiStep = 0;
  document.getElementById('osi-play-toggle').innerHTML = `${I.play} Play`;
  renderOsiState();
}

function renderOsiState() {
  const stepBadge = document.getElementById('osi-step-badge');
  const stepText = document.getElementById('osi-step-text');
  const inspect = document.getElementById('osi-header-breakdown');
  const packetWire = document.getElementById('osi-cable-packet');

  if (stepBadge) stepBadge.textContent = `STAGE ${osiStep} / 14`;

  // Reset all slab classes
  document.querySelectorAll('.osi-3d-slab').forEach(s => {
    s.classList.remove('active', 'complete');
  });

  if (osiStep === 0) {
    if (stepText) stepText.textContent = 'Transmission ready. Click Play or Step to begin encapsulation on Client.';
    if (packetWire) packetWire.style.display = 'none';
    if (inspect) inspect.innerHTML = '';
    return;
  }

  if (osiStep <= 7) {
    const layerNum = 8 - osiStep; // 7 down to 1
    const slab = document.getElementById(`osi-c-slab-${layerNum}`);
    slab?.classList.add('active');

    // Previous layers marked complete
    for (let l = 7; l > layerNum; l--) {
      document.getElementById(`osi-c-slab-${l}`)?.classList.add('complete');
    }

    const cur = OSI_DATA.find(x => x.n === layerNum);
    if (stepText) stepText.textContent = `[Layer ${layerNum}: ${cur.name}] — ${cur.desc}. Added header [${cur.hdr}].`;
    if (packetWire) packetWire.style.display = 'none';

    // Show growing packet in inspect
    if (inspect) {
      let tags = '';
      for (let l = layerNum; l <= 7; l++) {
        const item = OSI_DATA.find(x => x.n === l);
        tags += `<span class="inspect-tag" style="background:${item.color}">${item.hdr}</span>`;
      }
      tags += `<span class="inspect-tag data">DATA</span>`;
      inspect.innerHTML = `<strong>Packet Structure:</strong> ${tags}`;
    }
  }
  else if (osiStep === 8) {
    document.querySelectorAll('#osi-client-stack .osi-3d-slab').forEach(s => s.classList.add('complete'));
    if (packetWire) packetWire.style.display = 'flex';
    if (stepText) stepText.textContent = `[Physical Cable] — Modulated bitstream crossing 1Gbps copper link to Server.`;
    if (inspect) inspect.innerHTML = `<span class="inspect-status">Moving across physical cable...</span>`;
  }
  else {
    if (packetWire) packetWire.style.display = 'none';
    const layerNum = osiStep - 7; // 2 up to 7
    const slab = document.getElementById(`osi-s-slab-${layerNum}`);
    slab?.classList.add('active');

    for (let l = 1; l < layerNum; l++) {
      document.getElementById(`osi-s-slab-${l}`)?.classList.add('complete');
    }

    const cur = OSI_DATA.find(x => x.n === layerNum);
    if (stepText) stepText.textContent = `[Server Layer ${layerNum}: ${cur.name}] — Unpacking header [${cur.hdr}]. Delivering payload upward.`;

    if (inspect) {
      inspect.innerHTML = `<span class="inspect-tag success">Header verified & stripped: [${cur.hdr}]</span>`;
    }
  }
}

const URL_STEPS = [
  { step: 1, title: 'URL Parsing', phase: 'Client Browser', desc: 'Parses scheme (https), host (www.example.com), and resource path.' },
  { step: 2, title: 'HSTS & Cache Check', phase: 'Browser Cache', desc: 'Checks browser HTTP cache and enforces HTTPS via HSTS preload list.' },
  { step: 3, title: 'DNS Resolution', phase: 'Local Resolver', desc: 'Resolves www.example.com to IP 93.184.216.34 via recursive resolver.' },
  { step: 4, title: 'ARP Lookup', phase: 'Layer 2 Link', desc: 'Resolves gateway router MAC address for local segment egress.' },
  { step: 5, title: 'TCP 3-Way Handshake', phase: 'Transport Layer', desc: 'Sends SYN, receives SYN-ACK, returns ACK on port 443.' },
  { step: 6, title: 'TLS Key Exchange', phase: 'Security Layer', desc: 'Exchanges ClientHello / ServerHello, verifies certificate, derives AES key.' },
  { step: 7, title: 'HTTP GET Request', phase: 'Application Layer', desc: 'Transmits encrypted GET /index.html HTTP/2 frame.' },
  { step: 8, title: 'Server Processing', phase: 'Backend Gateway', desc: 'Nginx parses request, invokes app worker, prepares 200 OK HTML.' },
  { step: 9, title: 'Response Streaming', phase: 'TCP Stream', desc: 'Streams response packets over TLS connection back to browser.' },
  { step: 10, title: 'DOM & CSSOM Tree', phase: 'Browser Engine', desc: 'HTML parser constructs DOM; link tags fetch and build CSSOM.' },
  { step: 11, title: 'Render & Paint', phase: 'Compositor', desc: 'Layout calculates geometry; GPU rasterizes pixels to screen.' }
];

let journeyStep = 0;
let journeyPlaying = false;

function initJourney() {
  const dotsContainer = document.getElementById('url-stepper-dots');
  if (!dotsContainer) return;

  dotsContainer.innerHTML = URL_STEPS.map((s, idx) => `
    <button class="stepper-dot ${idx === 0 ? 'active' : ''}" data-step="${idx}" title="${s.title}">
      ${idx + 1}
    </button>
  `).join('');

  dotsContainer.querySelectorAll('.stepper-dot').forEach(btn => {
    btn.addEventListener('click', () => {
      journeyStep = parseInt(btn.dataset.step, 10);
      renderJourneyStep();
    });
  });

  document.getElementById('url-play-btn')?.addEventListener('click', toggleJourneyPlay);
  document.getElementById('url-next-btn')?.addEventListener('click', () => stepJourney(1));
  document.getElementById('url-prev-btn')?.addEventListener('click', () => stepJourney(-1));
  document.getElementById('url-reset-btn')?.addEventListener('click', resetJourney);

  renderJourneyStep();
}

function toggleJourneyPlay() {
  journeyPlaying = !journeyPlaying;
  const btn = document.getElementById('url-play-btn');
  if (btn) btn.innerHTML = journeyPlaying ? `${I.pause} Pause` : `${I.play} Play`;

  if (journeyPlaying) runJourneyLoop();
  else stopSimulation();
}

function runJourneyLoop() {
  if (!journeyPlaying) return;
  if (journeyStep >= URL_STEPS.length - 1) {
    journeyPlaying = false;
    document.getElementById('url-play-btn').innerHTML = `${I.restart} Restart`;
    return;
  }
  journeyStep++;
  renderJourneyStep();
  simTimer = setTimeout(runJourneyLoop, 1600 / currentSpeed);
}

function stepJourney(dir) {
  stopSimulation();
  journeyPlaying = false;
  document.getElementById('url-play-btn').innerHTML = `${I.play} Play`;
  journeyStep = Math.max(0, Math.min(URL_STEPS.length - 1, journeyStep + dir));
  renderJourneyStep();
}

function resetJourney() {
  stopSimulation();
  journeyPlaying = false;
  journeyStep = 0;
  document.getElementById('url-play-btn').innerHTML = `${I.play} Play`;
  renderJourneyStep();
}

function renderJourneyStep() {
  const cur = URL_STEPS[journeyStep];
  if (!cur) return;

  // Update dots
  document.querySelectorAll('.stepper-dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === journeyStep);
    dot.classList.toggle('completed', idx < journeyStep);
  });

  // Update Card
  document.getElementById('url-card-num').textContent = cur.step;
  document.getElementById('url-card-title').textContent = cur.title;
  document.getElementById('url-phase-tag').textContent = cur.phase;
  document.getElementById('url-card-desc').textContent = cur.desc;
  document.getElementById('url-step-counter').textContent = `Step ${cur.step} of ${URL_STEPS.length}`;

  const statusChip = document.getElementById('url-status-chip');
  if (statusChip) statusChip.textContent = cur.phase;

  const extra = document.getElementById('url-card-extra');
  if (extra) {
    if (cur.step === 6) {
      extra.innerHTML = `
        <div class="tls-cert-box">
          <div class="cert-row"><strong>Subject:</strong> www.example.com</div>
          <div class="cert-row"><strong>Issuer:</strong> DigiCert Global Root G2</div>
          <div class="cert-row"><strong>Cipher:</strong> TLS_AES_128_GCM_SHA256 (P-256)</div>
        </div>
      `;
    } else {
      extra.innerHTML = '';
    }
  }

  const latSegs = document.querySelectorAll('.lat-seg');
  latSegs.forEach(seg => seg.classList.remove('active'));
  if (cur.step === 3) document.querySelector('.lat-seg.dns')?.classList.add('active');
  else if (cur.step === 5) document.querySelector('.lat-seg.tcp')?.classList.add('active');
  else if (cur.step === 6) document.querySelector('.lat-seg.tls')?.classList.add('active');
  else if (cur.step === 8) document.querySelector('.lat-seg.ttfb')?.classList.add('active');
  else if (cur.step === 9) document.querySelector('.lat-seg.download')?.classList.add('active');
}

function stopSimulation() {
  if (simTimer) {
    clearTimeout(simTimer);
    simTimer = null;
  }
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  osiPlaying = false;
  journeyPlaying = false;
}
