// ============================================================================
// LogicQuest — Next-Gen Interactive Networking Suite & Devices Lab
// ============================================================================
import './common.js';
import { initOSISim, cleanupOSISim } from './osi-sim.js';

let ndInitialized = false;
export function initNetworkDevices() {
  if (!document.getElementById('nd-lab-container')) return;
  if (!ndInitialized) {
    ndInitialized = true;
    buildNDLayout();
    bindNDTabs();
  }
  switchNDTab('network-tab');
}

export function cleanupNetworkDevices() {
  if (window.ndStopAnim) window.ndStopAnim();
  cleanupOSISim();
}

window.initNetworkDevices = initNetworkDevices;
window.cleanupNetworkDevices = cleanupNetworkDevices;

// SVG Icons
const I = {
  hub: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="2"/><path d="M4.1 4.1a8 8 0 0 0 0 11.8M15.9 4.1a8 8 0 0 1 0 11.8"/></svg>',
  switch_: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="6" width="12" height="8" rx="1"/><path d="M6 10h8M10 6v8"/></svg>',
  router: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="8" width="14" height="7" rx="1.5"/><circle cx="7" cy="11.5" r="1"/><circle cx="10" cy="11.5" r="1"/><circle cx="13" cy="11.5" r="1"/><path d="M10 3v5M7 6l3 3 3-3"/></svg>',
  check: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10l4 4 8-8"/></svg>',
  cross: '<svg viewBox="0 0 20 20" fill="none" stroke="#ef4444" stroke-width="2"><path d="M5 5l10 10M15 5L5 15"/></svg>',
  warn: '<svg viewBox="0 0 20 20" fill="none" stroke="#f59e0b" stroke-width="1.5"><path d="M10 2L1 18h18L10 2z"/><path d="M10 8v4"/><path d="M10 14v0"/></svg>',
  search: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8.5" cy="8.5" r="6"/><path d="M13 13l5 5"/></svg>',
  send: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 10l7-7 7 7M10 3v14"/></svg>',
  globe: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="8"/><path d="M2 10h16M10 2a15.3 15.3 0 0 1 4 8 15.3 15.3 0 0 1-4 8 15.3 15.3 0 0 1-4-8 15.3 15.3 0 0 1 4-8z"/></svg>',
  target: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="4"/><circle cx="10" cy="10" r="1.5"/></svg>',
  question: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="8"/><path d="M8 7.5a2 2 0 1 1 3.5 1.5c-1 .8-1.5 2-1.5 3"/><circle cx="10" cy="15" r="0.5"/></svg>',
  brain: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 17h4M9 19h2M7 14a5 5 0 1 1 6 0c-1 .8-1.5 1.8-1.5 3h-3c0-1.2-.5-2.2-1.5-3z"/></svg>',
  key: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="13" r="4"/><path d="M10 10l7-7 2 2-5 5"/><path d="M12 8l2 2"/></svg>',
  lock: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="9" width="12" height="9" rx="2"/><path d="M7 9V6a3 3 0 1 1 6 0v3"/></svg>',
  refresh: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2l3 3-3 3"/><path d="M3 11a6 6 0 0 1 10.5-4"/><path d="M6 18l-3-3 3-3"/><path d="M17 9a6 6 0 0 1-10.5 4"/></svg>',
  layers: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 5l8 4 8-4-8-4L2 5z"/><path d="M2 10l8 4 8-4"/><path d="M2 15l8 4 8-4"/></svg>',
  list: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 4h10M6 10h10M6 16h10"/><circle cx="3" cy="4" r="0.8" fill="currentColor"/><circle cx="3" cy="10" r="0.8" fill="currentColor"/><circle cx="3" cy="16" r="0.8" fill="currentColor"/></svg>',
  laptop: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="2" width="14" height="11" rx="1.5"/><path d="M2 16a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v1H2v-1z"/></svg>',
  network: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 5h14M3 15h14"/><rect x="5" y="3" width="10" height="14" rx="1.5"/><circle cx="10" cy="5" r="1"/><circle cx="10" cy="15" r="1"/></svg>',
  crypto: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 1l7 3v6a7 7 0 0 1-7 6 7 7 0 0 1-7-6V4l7-3z"/><path d="M8 10l1.5 1.5L12 9"/></svg>',
  parity: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12l4 4 8-8"/><rect x="2" y="2" width="16" height="16" rx="3"/></svg>',
  bits: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="2" width="14" height="16" rx="2"/><path d="M7 6h6M7 10h6M7 14h4"/></svg>',
  terminal: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="16" height="14" rx="2"/><path d="M5 7l3 3-3 3M10 13h5"/></svg>',
  play: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M6 4l10 6-10 6V4z"/></svg>',
  step: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M5 4l7 6-7 6V4zM13 4h2v12h-2z"/></svg>',
  trash: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h14M16 6l-1 11H5L4 6M8 6V4h4v2"/></svg>'
};

function el(s) { return document.getElementById(s); }
function qs(s, p) { return (p || document).querySelector(s); }
function qsa(s, p) { return (p || document).querySelectorAll(s); }
function play(n) { if (window.playSound) window.playSound(n); }

function buildNDLayout() {
  el('nd-lab-container').innerHTML = `
<div class="nd-main">
  <div class="nd-tabs">
    <button class="nd-tab active" data-ndtab="network-tab">${I.network} Network Devices &amp; Topology</button>
    <button class="nd-tab" data-ndtab="osi-tab">${I.layers} OSI 7-Layer Simulator</button>
    <button class="nd-tab" data-ndtab="subnet-tab">${I.globe} Subnetting &amp; CIDR Lab</button>
    <button class="nd-tab" data-ndtab="parity-tab">${I.parity} Parity Check</button>
  </div>

  <div class="nd-tab-content active" id="network-tab">
    <div class="nd-layout">
      <div class="nd-left">
        <div class="nd-panel-header">
          ${I.network}
          <div>
            <div class="nd-panel-title">Interactive Network Simulator</div>
            <div class="nd-panel-sub">L1 Hub &bull; L2 Switch &bull; L3 Router</div>
          </div>
        </div>

        <div class="nd-topo-bar">
          <span class="nd-section-label">Topology Lab Mode</span>
          <div class="nd-mode-pills">
            <button class="nd-mode-pill active" data-mode="device-test">Single Device</button>
            <button class="nd-mode-pill" data-mode="enterprise">Routed Enterprise</button>
            <button class="nd-mode-pill" data-mode="csma">Collision &amp; CSMA/CD</button>
          </div>
        </div>

        <div class="nd-device-selector" id="nd-device-select-box">
          <button class="nd-device-btn active" data-device="hub">${I.hub} Hub <span class="nd-dev-layer">L1 Physical</span></button>
          <button class="nd-device-btn" data-device="switch">${I.switch_} Switch <span class="nd-dev-layer">L2 Data Link</span></button>
          <button class="nd-device-btn" data-device="router">${I.router} Router <span class="nd-dev-layer">L3 Network</span></button>
        </div>

        <div class="nd-controls">
          <div class="nd-row">
            <div><span class="nd-label">Source Host</span><div class="nd-host-options" id="nd-src-options"></div></div>
            <div><span class="nd-label">Dest Host</span><div class="nd-host-options" id="nd-dst-options"></div></div>
          </div>
          <div class="nd-btn-row">
            <button class="nd-send-btn" id="nd-send-btn">${I.send} Transmit Packet</button>
            <button class="nd-step-btn" id="nd-step-btn" title="Step through packet stages">${I.step} Step</button>
          </div>
        </div>

        <div class="nd-card">
          <div class="nd-card-title">${I.search} Inspected Node Specifications</div>
          <div class="nd-info-content" id="nd-info-content"></div>
        </div>

        <div class="nd-card">
          <div class="nd-card-title">${I.list} Deep Protocol Frame Inspector</div>
          <div class="nd-packet-inspector" id="nd-packet-inspector">
            <em style="color:var(--text-muted);font-size:0.75rem">Transmit a packet or enter a terminal ping to inspect headers</em>
          </div>
        </div>
      </div>

      <div class="nd-right">
        <!-- Top Toolbar for Topology -->
        <div class="nd-topo-header">
          <div class="nd-topo-status" id="nd-topo-status">
            <span class="nd-status-dot"></span>
            <span id="nd-status-text">Network Ready &bull; Select source &amp; destination</span>
          </div>
          <div class="nd-speed-controls">
            <span class="nd-label" style="margin:0">Speed:</span>
            <button class="nd-speed-pill" data-speed="0.5">0.5x</button>
            <button class="nd-speed-pill active" data-speed="1">1x</button>
            <button class="nd-speed-pill" data-speed="2">2x</button>
            <button class="nd-reset-net-btn" id="nd-reset-canvas-btn" title="Reset Network State">${I.refresh}</button>
          </div>
        </div>

        <div class="nd-svg-wrap" id="nd-svg-wrap">
          <svg class="nd-svg" id="nd-topology-svg" viewBox="0 0 600 340">
            <defs>
              <linearGradient id="ndGradHub" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#818cf8"/><stop offset="100%" stop-color="#4f46e5"/></linearGradient>
              <linearGradient id="ndGradSwitch" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#22d3a5"/><stop offset="100%" stop-color="#059669"/></linearGradient>
              <linearGradient id="ndGradRouter" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#d97706"/></linearGradient>
              <filter id="ndGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
            </defs>
            <g id="nd-cables-group"></g>
            <g id="nd-devices-group"></g>
            <g id="nd-packets-group"></g>
            <g id="nd-overlay-group"></g>
          </svg>
        </div>

        <div class="nd-terminal-wrap">
          <div class="nd-terminal-header">
            <div class="nd-term-title">${I.terminal} Network Host Terminal (CLI)</div>
            <div class="nd-term-quick-btns">
              <button class="nd-cli-pill" data-cmd="ping 192.168.1.20">ping B</button>
              <button class="nd-cli-pill" data-cmd="ping 192.168.2.10">ping C</button>
              <button class="nd-cli-pill" data-cmd="arp -a">arp -a</button>
              <button class="nd-cli-pill" data-cmd="show mac-address-table">show mac</button>
              <button class="nd-cli-pill" data-cmd="traceroute 192.168.2.10">traceroute</button>
              <button class="nd-cli-pill" data-cmd="clear">clear</button>
            </div>
          </div>
          <div class="nd-terminal-body" id="nd-terminal-body">
            <div class="nd-term-line greeting">LogicQuest Terminal v2.0 — Type a command or click a preset above.</div>
          </div>
          <div class="nd-terminal-input-bar">
            <span class="nd-prompt">host-a:~$</span>
            <input type="text" class="nd-term-input" id="nd-term-input" placeholder="Type ping 192.168.2.10, arp -a, show mac-address-table..." autocomplete="off" spellcheck="false">
            <button class="nd-term-submit" id="nd-term-submit">${I.send}</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- OSI TAB -->
  <div class="nd-tab-content" id="osi-tab">
    <div id="osi-container"></div>
  </div>

  <!-- SUBNETTING TAB -->
  <div class="nd-tab-content" id="subnet-tab">
    <div class="subnet-layout">
      <div class="subnet-left">
        <div class="nd-panel-header">
          ${I.globe}
          <div>
            <div class="nd-panel-title">IPv4 Subnet &amp; CIDR Lab</div>
            <div class="nd-panel-sub">Classless Addressing &bull; VLSM &bull; Binary Octets</div>
          </div>
        </div>

        <div class="subnet-card">
          <div class="subnet-input-row">
            <label class="subnet-input-label">IP Address</label>
            <input type="text" id="subnet-ip-input" class="subnet-text-input" value="192.168.10.75" placeholder="e.g. 192.168.1.1">
          </div>
          <div class="subnet-input-row">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <label class="subnet-input-label">CIDR Prefix</label>
              <span class="subnet-prefix-val" id="subnet-prefix-val">/26</span>
            </div>
            <input type="range" id="subnet-cidr-slider" min="8" max="30" value="26" class="subnet-slider">
            <div class="subnet-presets">
              <button class="subnet-preset-btn" data-cidr="8">/8</button>
              <button class="subnet-preset-btn" data-cidr="16">/16</button>
              <button class="subnet-preset-btn" data-cidr="24">/24</button>
              <button class="subnet-preset-btn" data-cidr="26">/26</button>
              <button class="subnet-preset-btn" data-cidr="28">/28</button>
              <button class="subnet-preset-btn" data-cidr="30">/30</button>
            </div>
          </div>
        </div>

        <div class="subnet-card">
          <div class="subnet-card-title">${I.search} Calculated Parameters</div>
          <div class="subnet-calc-grid" id="subnet-calc-grid"></div>
        </div>
      </div>

      <div class="subnet-right">
        <div class="subnet-card">
          <div class="subnet-card-title">${I.bits} 32-Bit Binary Breakdown (Network vs Host Bits)</div>
          <div class="subnet-binary-vis" id="subnet-binary-vis"></div>
        </div>

        <div class="subnet-card" style="flex:1;overflow:hidden;display:flex;flex-direction:column">
          <div class="subnet-card-title" style="display:flex;justify-content:space-between;align-items:center">
            <span>${I.layers} Subnet Partition Slices</span>
            <span style="font-size:0.7rem;color:var(--text-muted)">Addresses in this block</span>
          </div>
          <div class="subnet-table-wrap" style="flex:1;overflow-y:auto;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-primary)">
            <table class="subnet-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Network Address</th>
                  <th>Usable Host Range</th>
                  <th>Broadcast Address</th>
                </tr>
              </thead>
              <tbody id="subnet-table-body"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- PARITY CHECK TAB -->
  <div class="nd-tab-content" id="parity-tab">
    <div class="parity-layout">
      <div class="parity-header">${I.parity} <span class="parity-title">Parity Check &mdash; Error Detection</span></div>
      <div class="parity-body">
        <div class="parity-flow">
          <div class="parity-box">
            <div class="parity-box-label">${I.laptop} Original Data (7 bits)</div>
            <div class="parity-bits" id="parity-input-bits"></div>
            <div class="parity-actions">
              <button class="parity-action-btn primary" id="parity-send-btn">${I.send} Send with Parity</button>
              <button class="parity-action-btn danger" id="parity-flip-btn">${I.refresh} Flip a Bit (Error)</button>
            </div>
          </div>
          <div class="parity-arrow">${I.send}</div>
          <div class="parity-box">
            <div class="parity-box-label">${I.bits} Received Data (8 bits)</div>
            <div class="parity-bits" id="parity-recv-bits"></div>
            <div class="parity-result wait" id="parity-result">${I.search} Waiting to send&hellip;</div>
          </div>
        </div>
        <div class="parity-info-card">
          <div class="parity-info-title">${I.search} How Parity Error Checking Works</div>
          <div class="parity-info-body">
            <strong>Even Parity:</strong> Count the 1s in the 7 data bits. If odd, set parity bit = <strong>1</strong> (makes total count of 1s even). If even, set parity bit = <strong>0</strong>.<br>
            The receiver checks: if the total number of 1s in all 8 bits is odd, an <strong>error</strong> is detected.
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

function bindNDTabs() {
  qsa('.nd-tab').forEach(t => t.addEventListener('click', () => {
    play('click');
    qsa('.nd-tab').forEach(x => x.classList.remove('active'));
    qsa('.nd-tab-content').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    el(t.dataset.ndtab)?.classList.add('active');
    if (t.dataset.ndtab === 'network-tab') initNetLab();
    else if (t.dataset.ndtab === 'osi-tab') initOSI();
    else if (t.dataset.ndtab === 'subnet-tab') initSubnetLab();
  }));
  initNetLab();
  initOSI();
  initSubnetLab();
  initParity();
}

function switchNDTab(id) { qs(`.nd-tab[data-ndtab="${id}"]`)?.click(); }
window.switchNDTab = switchNDTab;

// Network Devices
let currentTopoMode = 'device-test';
let simSpeed = 1;
let animSpeedMs = 450;

let netState = {
  device: 'hub',
  animating: false,
  src: 'pc-a',
  dst: 'pc-c',
  macTable: {},
  arpTable: {},
  routingTable: [
    { net: '192.168.1.0/24', gw: 'Direct', iface: 'eth0 (Subnet 1)' },
    { net: '192.168.2.0/24', gw: 'Direct', iface: 'eth1 (Subnet 2)' }
  ],
  stepQueue: [],
  inStepMode: false,
  selectedDeviceId: 'central'
};

const TOPOLOGY_HOSTS = {
  'device-test': [
    { id: 'pc-a', label: 'Host A', short: 'A', x: 80, y: 70, mac: 'AA:AA:AA:AA:01', ip: '192.168.1.10', sub: '192.168.1.0/24', iface: 'Port 1' },
    { id: 'pc-b', label: 'Host B', short: 'B', x: 80, y: 270, mac: 'AA:AA:AA:AA:02', ip: '192.168.1.20', sub: '192.168.1.0/24', iface: 'Port 2' },
    { id: 'pc-c', label: 'Host C', short: 'C', x: 520, y: 70, mac: 'BB:BB:BB:BB:03', ip: '192.168.2.10', sub: '192.168.2.0/24', iface: 'Port 3' },
    { id: 'pc-d', label: 'Host D', short: 'D', x: 520, y: 270, mac: 'BB:BB:BB:BB:04', ip: '192.168.2.20', sub: '192.168.2.0/24', iface: 'Port 4' }
  ],
  'enterprise': [
    { id: 'pc-a', label: 'Sales PC', short: 'A', x: 60, y: 70, mac: '11:22:33:44:01', ip: '192.168.1.10', sub: '192.168.1.0/24', iface: 'SW1-Fa0/1' },
    { id: 'pc-b', label: 'Finance PC', short: 'B', x: 60, y: 270, mac: '11:22:33:44:02', ip: '192.168.1.20', sub: '192.168.1.0/24', iface: 'SW1-Fa0/2' },
    { id: 'pc-c', label: 'Admin PC', short: 'C', x: 540, y: 70, mac: '55:66:77:88:03', ip: '192.168.2.10', sub: '192.168.2.0/24', iface: 'SW2-Fa0/1' },
    { id: 'pc-d', label: 'Web Server', short: 'SRV', x: 540, y: 270, mac: '55:66:77:88:99', ip: '192.168.2.80', sub: '192.168.2.0/24', iface: 'SW2-Fa0/24' }
  ],
  'csma': [
    { id: 'pc-a', label: 'Node A', short: 'A', x: 90, y: 70, mac: 'CC:01:00:00:01', ip: '10.0.0.1', sub: '10.0.0.0/8', iface: 'Bus-Tap 1' },
    { id: 'pc-b', label: 'Node B', short: 'B', x: 230, y: 70, mac: 'CC:02:00:00:02', ip: '10.0.0.2', sub: '10.0.0.0/8', iface: 'Bus-Tap 2' },
    { id: 'pc-c', label: 'Node C', short: 'C', x: 370, y: 70, mac: 'CC:03:00:00:03', ip: '10.0.0.3', sub: '10.0.0.0/8', iface: 'Bus-Tap 3' },
    { id: 'pc-d', label: 'Node D', short: 'D', x: 510, y: 70, mac: 'CC:04:00:00:04', ip: '10.0.0.4', sub: '10.0.0.0/8', iface: 'Bus-Tap 4' }
  ]
};

function getHosts() {
  return TOPOLOGY_HOSTS[currentTopoMode] || TOPOLOGY_HOSTS['device-test'];
}

function getHost(id) {
  return getHosts().find(h => h.id === id);
}

let netLabReady = false;
function initNetLab() {
  if (netLabReady) { renderTopologyCanvas(); return; }
  netLabReady = true;

  // Topology Mode switch
  qsa('.nd-mode-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      if (netState.animating) return;
      play('click');
      qsa('.nd-mode-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTopoMode = btn.dataset.mode;
      el('nd-device-select-box').style.display = currentTopoMode === 'device-test' ? 'flex' : 'none';
      renderTopologyCanvas();
      updateHostPickers();
      resetNetworkState();
    });
  });

  // Device buttons 
  qsa('.nd-device-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (netState.animating) return;
      play('click');
      qsa('.nd-device-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      netState.device = btn.dataset.device;
      renderTopologyCanvas();
      resetNetworkState();
    });
  });

  // Speed controls
  qsa('.nd-speed-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      play('click');
      qsa('.nd-speed-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      simSpeed = parseFloat(pill.dataset.speed) || 1;
      animSpeedMs = Math.round(450 / simSpeed);
    });
  });

  // Table tabs
  qsa('.nd-subtable-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      play('click');
      qsa('.nd-subtable-tab').forEach(t => t.classList.remove('active'));
      qsa('.nd-subtable-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      el(`nd-tab-${tab.dataset.tab}`)?.classList.add('active');
    });
  });

  // Clear tables
  el('nd-clear-tables-btn')?.addEventListener('click', () => {
    play('click');
    netState.macTable = {};
    netState.arpTable = {};
    updateTableViews();
    termPrint('System: MAC Address table & ARP cache flushed.', 'system');
  });

  // Reset Canvas button
  el('nd-reset-canvas-btn')?.addEventListener('click', () => {
    play('click');
    resetNetworkState();
  });

  // Transmit button
  el('nd-send-btn')?.addEventListener('click', () => {
    executeTransmission(netState.src, netState.dst);
  });

  // Step button
  el('nd-step-btn')?.addEventListener('click', () => {
    play('click');
    if (netState.stepQueue.length > 0) {
      const nextStep = netState.stepQueue.shift();
      nextStep();
    } else {
      executeTransmission(netState.src, netState.dst, true);
    }
  });

  // Terminal setup
  setupTerminalCLI();

  // Initial render
  updateHostPickers();
  renderTopologyCanvas();
  resetNetworkState();
  setDeviceDetails('central');
}

function resetNetworkState() {
  netState.animating = false;
  netState.stepQueue = [];
  netState.inStepMode = false;
  qsa('.nd-cable-line').forEach(line => line.classList.remove('active', 'collision'));
  hideAllPackets();
  updateStatus('Ready &bull; Click Transmit Packet or type a CLI ping');
  updateTableViews();
}

function updateStatus(text, isAlert = false) {
  const dot = qs('.nd-status-dot');
  const txt = el('nd-status-text');
  if (dot) dot.style.background = isAlert ? '#ef4444' : '#22d3a5';
  if (txt) txt.innerHTML = text;
}

function updateHostPickers() {
  const currentHosts = getHosts();
  ['nd-src-options', 'nd-dst-options'].forEach(containerId => {
    const box = el(containerId);
    if (!box) return;
    box.innerHTML = '';
    const isSrc = containerId === 'nd-src-options';

    currentHosts.forEach(h => {
      const btn = document.createElement('button');
      btn.className = 'nd-host-btn' + (h.id === (isSrc ? netState.src : netState.dst) ? ' active' : '');
      btn.textContent = h.short;
      btn.title = `${h.label}\nIP: ${h.ip}\nMAC: ${h.mac}`;
      btn.addEventListener('click', () => {
        if (netState.animating) return;
        play('click');
        if (isSrc) netState.src = h.id; else netState.dst = h.id;
        box.querySelectorAll('.nd-host-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.selectNDDevice(h.id);
      });
      box.appendChild(btn);
    });
  });
}

function renderTopologyCanvas() {
  const cablesGroup = el('nd-cables-group');
  const devicesGroup = el('nd-devices-group');
  const packetsGroup = el('nd-packets-group');
  if (!cablesGroup || !devicesGroup) return;

  cablesGroup.innerHTML = '';
  devicesGroup.innerHTML = '';
  packetsGroup.innerHTML = '';

  const hostsList = getHosts();

  if (currentTopoMode === 'device-test') {
    const cx = 300, cy = 170;
    const dType = netState.device;

    // Cable lines
    hostsList.forEach(h => {
      cablesGroup.innerHTML += `
        <line class="nd-cable-line" id="cable-${h.id}" x1="${h.x}" y1="${h.y}" x2="${cx}" y2="${cy}"/>
      `;
    });

    // Center Node Box
    devicesGroup.innerHTML += `
      <g class="nd-node-group" id="node-central" style="cursor:pointer" onclick="window.selectNDDevice('central')">
        <rect x="250" y="130" width="100" height="80" rx="10" fill="var(--bg-secondary)" stroke="${dType === 'hub' ? '#818cf8' : dType === 'switch' ? '#22d3a5' : '#fbbf24'}" stroke-width="2"/>
        <text x="300" y="155" fill="var(--text-primary)" font-family="var(--font-header)" font-weight="800" font-size="13" text-anchor="middle">${dType.toUpperCase()}</text>
        <text x="300" y="172" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="9" text-anchor="middle">Layer ${dType === 'hub' ? '1 Physical' : dType === 'switch' ? '2 Data Link' : '3 Network'}</text>
        <!-- Port LEDs -->
        <circle cx="268" cy="192" r="3.5" fill="#22d3a5" class="nd-port-led"/>
        <circle cx="282" cy="192" r="3.5" fill="#22d3a5" class="nd-port-led"/>
        <circle cx="318" cy="192" r="3.5" fill="#22d3a5" class="nd-port-led"/>
        <circle cx="332" cy="192" r="3.5" fill="#22d3a5" class="nd-port-led"/>
      </g>
    `;

    // Host Nodes
    hostsList.forEach(h => {
      devicesGroup.innerHTML += createHostSvg(h);
    });

  } else if (currentTopoMode === 'enterprise') {
    cablesGroup.innerHTML += `
      <!-- Subnet 1 Host to Switch 1 -->
      <line class="nd-cable-line" id="cable-pc-a" x1="60" y1="70" x2="180" y2="170"/>
      <line class="nd-cable-line" id="cable-pc-b" x1="60" y1="270" x2="180" y2="170"/>
      <!-- Switch 1 to Router -->
      <line class="nd-cable-line" id="cable-sw1-rtr" x1="180" y1="170" x2="300" y2="170"/>
      <!-- Router to Switch 2 -->
      <line class="nd-cable-line" id="cable-rtr-sw2" x1="300" y1="170" x2="420" y2="170"/>
      <!-- Subnet 2 Switch to Hosts -->
      <line class="nd-cable-line" id="cable-pc-c" x1="420" y1="170" x2="540" y2="70"/>
      <line class="nd-cable-line" id="cable-pc-d" x1="420" y1="170" x2="540" y2="270"/>
    `;

    devicesGroup.innerHTML += `
      <rect x="25" y="25" width="200" height="290" rx="12" fill="rgba(99,102,241,0.03)" stroke="rgba(99,102,241,0.2)" stroke-dasharray="4,4"/>
      <text x="35" y="45" fill="#818cf8" font-family="var(--font-mono)" font-size="10" font-weight="700">Subnet 1: 192.168.1.0/24</text>
      
      <rect x="375" y="25" width="200" height="290" rx="12" fill="rgba(34,211,165,0.03)" stroke="rgba(34,211,165,0.2)" stroke-dasharray="4,4"/>
      <text x="385" y="45" fill="#22d3a5" font-family="var(--font-mono)" font-size="10" font-weight="700">Subnet 2: 192.168.2.0/24</text>

      <!-- Switch 1 -->
      <g class="nd-node-group" id="node-sw1" style="cursor:pointer" onclick="window.selectNDDevice('sw1')">
        <rect x="145" y="145" width="70" height="50" rx="8" fill="var(--bg-secondary)" stroke="#22d3a5" stroke-width="1.8"/>
        <text x="180" y="170" fill="var(--text-primary)" font-family="var(--font-header)" font-weight="800" font-size="11" text-anchor="middle">SW-1</text>
        <text x="180" y="184" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="8" text-anchor="middle">L2 Switch</text>
      </g>

      <!-- Router -->
      <g class="nd-node-group" id="node-central" style="cursor:pointer" onclick="window.selectNDDevice('central')">
        <circle cx="300" cy="170" r="32" fill="var(--bg-secondary)" stroke="#fbbf24" stroke-width="2"/>
        <text x="300" y="166" fill="#fbbf24" font-family="var(--font-header)" font-weight="800" font-size="11" text-anchor="middle">ROUTER</text>
        <text x="300" y="180" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="8" text-anchor="middle">Gateway L3</text>
      </g>

      <!-- Switch 2 -->
      <g class="nd-node-group" id="node-sw2" style="cursor:pointer" onclick="window.selectNDDevice('sw2')">
        <rect x="385" y="145" width="70" height="50" rx="8" fill="var(--bg-secondary)" stroke="#22d3a5" stroke-width="1.8"/>
        <text x="420" y="170" fill="var(--text-primary)" font-family="var(--font-header)" font-weight="800" font-size="11" text-anchor="middle">SW-2</text>
        <text x="420" y="184" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="8" text-anchor="middle">L2 Switch</text>
      </g>
    `;

    hostsList.forEach(h => {
      devicesGroup.innerHTML += createHostSvg(h);
    });

  } else if (currentTopoMode === 'csma') {
    cablesGroup.innerHTML += `
      <!-- Shared Bus Backbone -->
      <line class="nd-cable-line" id="cable-bus" x1="50" y1="200" x2="550" y2="200" style="stroke-width: 4px; stroke: #818cf8;"/>
      <!-- Terminators -->
      <rect x="44" y="193" width="6" height="14" fill="#ef4444"/>
      <rect x="550" y="193" width="6" height="14" fill="#ef4444"/>
      <!-- T-Connectors -->
      <line class="nd-cable-line" id="cable-pc-a" x1="90" y1="70" x2="90" y2="200"/>
      <line class="nd-cable-line" id="cable-pc-b" x1="230" y1="70" x2="230" y2="200"/>
      <line class="nd-cable-line" id="cable-pc-c" x1="370" y1="70" x2="370" y2="200"/>
      <line class="nd-cable-line" id="cable-pc-d" x1="510" y1="70" x2="510" y2="200"/>
    `;

    devicesGroup.innerHTML += `
      <text x="300" y="240" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="10" text-anchor="middle">Shared 10BASE2 Coaxial Cable Bus (1 Single Collision Domain)</text>
    `;

    hostsList.forEach(h => {
      devicesGroup.innerHTML += createHostSvg(h);
    });
  }

  for (let i = 1; i <= 4; i++) {
    packetsGroup.innerHTML += `
      <g class="nd-anim-packet" id="nd-pkt-${i}" transform="translate(-100,-100)" style="display:none;pointer-events:none;">
        <rect x="-10" y="-7" width="20" height="14" rx="3" fill="#10b981" stroke="#ffffff" stroke-width="1.2" filter="drop-shadow(0 0 6px rgba(16,185,129,0.8))"/>
        <path d="M -10 -7 L 0 0 L 10 -7" stroke="#ffffff" stroke-width="1" fill="none"/>
      </g>
    `;
  }
}

function createHostSvg(h) {
  const isServer = h.id === 'pc-d' && currentTopoMode === 'enterprise';
  return `
    <g class="nd-node-group" id="node-${h.id}" style="cursor:pointer;" onclick="window.selectNDDevice('${h.id}')">
      <rect x="${h.x - 30}" y="${h.y - 25}" width="60" height="50" rx="8" fill="var(--bg-secondary)" stroke="#38bdf8" stroke-width="1.5" class="nd-host-box"/>
      ${isServer ? `
        <!-- Rack Server Icon -->
        <rect x="${h.x - 18}" y="${h.y - 18}" width="36" height="14" rx="2" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
        <circle cx="${h.x + 10}" cy="${h.y - 11}" r="1.5" fill="#22c55e"/>
        <rect x="${h.x - 18}" y="${h.y}" width="36" height="14" rx="2" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
        <circle cx="${h.x + 10}" cy="${h.y + 7}" r="1.5" fill="#22c55e"/>
      ` : `
        <!-- PC Monitor Icon -->
        <rect x="${h.x - 18}" y="${h.y - 18}" width="36" height="24" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
        <line x1="${h.x}" y1="${h.y + 6}" x2="${h.x}" y2="${h.y + 14}" stroke="#38bdf8" stroke-width="2"/>
        <line x1="${h.x - 8}" y1="${h.y + 14}" x2="${h.x + 8}" y2="${h.y + 14}" stroke="#38bdf8" stroke-width="2"/>
      `}
      <text x="${h.x}" y="${h.y - 1}" fill="#38bdf8" font-family="var(--font-header)" font-weight="800" font-size="10" text-anchor="middle">${h.short}</text>
      <text x="${h.x}" y="${h.y + 35}" fill="var(--text-primary)" font-family="var(--font-header)" font-weight="700" font-size="9" text-anchor="middle">${h.label}</text>
      <text x="${h.x}" y="${h.y + 46}" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="7.5" text-anchor="middle">${h.ip}</text>
    </g>
  `;
}

window.selectNDDevice = function(id) {
  play('click');
  netState.selectedDeviceId = id;
  qsa('.nd-host-box, .nd-node-group rect, .nd-node-group circle').forEach(el => {
    el.style.filter = 'none';
  });
  const nodeEl = el(`node-${id}`);
  if (nodeEl) {
    const shape = nodeEl.querySelector('rect') || nodeEl.querySelector('circle');
    if (shape) shape.style.filter = 'drop-shadow(0 0 8px #38bdf8)';
  }
  setDeviceDetails(id);
};

function setDeviceDetails(id) {
  const info = el('nd-info-content');
  if (!info) return;

  if (id === 'central') {
    const d = netState.device;
    if (currentTopoMode === 'enterprise') {
      info.innerHTML = `
        <div class="nd-spec-box">
          <div class="nd-spec-title" style="color:#fbbf24">Enterprise Gateway Router (Layer 3)</div>
          <div class="nd-spec-row"><span>Interface eth0:</span> <code>192.168.1.1/24</code></div>
          <div class="nd-spec-row"><span>Interface eth1:</span> <code>192.168.2.1/24</code></div>
          <div class="nd-spec-row"><span>Forwarding:</span> <code>IP Subnet Routing</code></div>
          <div class="nd-spec-row"><span>TTL Behavior:</span> <code>Decrements TTL by 1</code></div>
          <div class="nd-spec-desc">Examines Layer 3 destination IP addresses and routes packets across subnet boundaries.</div>
        </div>
      `;
    } else {
      const descriptions = {
        hub: {
          title: 'Multiport Repeater Hub (Layer 1)',
          color: '#818cf8',
          details: [
            ['Function', 'Bit-level broadcast to ALL ports'],
            ['MAC Lookup', 'None (No MAC address memory)'],
            ['Collision Domain', '1 Shared collision domain'],
            ['Bandwidth', 'Shared among all connected hosts']
          ],
          desc: 'Hub receives an electrical bit signal on one port and blindly repeats it out to every other port.'
        },
        switch: {
          title: 'Ethernet Switch (Layer 2 Data Link)',
          color: '#22d3a5',
          details: [
            ['Function', 'Selective unicast forwarding by MAC'],
            ['MAC Lookup', 'Dynamic MAC address table learning'],
            ['Collision Domain', 'Each port is an isolated collision domain'],
            ['Bandwidth', 'Dedicated full-duplex wire speed per port']
          ],
          desc: 'Reads Ethernet frames, records the source MAC to its table, and forwards directly to the destination MAC.'
        },
        router: {
          title: 'IP Router (Layer 3 Network)',
          color: '#fbbf24',
          details: [
            ['Function', 'Inter-network packet routing'],
            ['Table Used', 'IP Routing Table + ARP Cache'],
            ['Broadcast Domain', 'Blocks Layer 2 broadcasts'],
            ['Header Handling', 'Decrements TTL, re-encapsulates L2 MAC']
          ],
          desc: 'Connects different IP subnets. Strips the incoming L2 frame, inspects L3 IP, and re-encapsulates for next hop.'
        }
      };
      const cur = descriptions[d] || descriptions.hub;
      info.innerHTML = `
        <div class="nd-spec-box">
          <div class="nd-spec-title" style="color:${cur.color}">${cur.title}</div>
          ${cur.details.map(([k, v]) => `<div class="nd-spec-row"><span>${k}:</span> <code>${v}</code></div>`).join('')}
          <div class="nd-spec-desc">${cur.desc}</div>
        </div>
      `;
    }
  } else if (id === 'sw1' || id === 'sw2') {
    info.innerHTML = `
      <div class="nd-spec-box">
        <div class="nd-spec-title" style="color:#22d3a5">Managed Layer 2 Switch (${id.toUpperCase()})</div>
        <div class="nd-spec-row"><span>Ports:</span> <code>24 Gigabit Ethernet</code></div>
        <div class="nd-spec-row"><span>MAC Table:</span> <code>Dynamic Self-Learning</code></div>
        <div class="nd-spec-row"><span>Collision:</span> <code>Zero Collisions (Full Duplex)</code></div>
        <div class="nd-spec-desc">Isolates collision domains for local subnet hosts. Floods broadcasts only within this VLAN.</div>
      </div>
    `;
  } else {
    const h = getHost(id);
    if (!h) return;
    info.innerHTML = `
      <div class="nd-spec-box">
        <div class="nd-spec-title" style="color:#38bdf8">${h.label} (Host Station)</div>
        <div class="nd-spec-row"><span>IP Address:</span> <code>${h.ip}</code></div>
        <div class="nd-spec-row"><span>MAC Address:</span> <code>${h.mac}</code></div>
        <div class="nd-spec-row"><span>Subnet:</span> <code>${h.sub}</code></div>
        <div class="nd-spec-row"><span>Interface:</span> <code>${h.iface}</code></div>
        <div class="nd-spec-desc">Standard Ethernet workstation running TCP/IP protocol suite with local ARP cache.</div>
      </div>
    `;
  }
}

// Transmission
function executeTransmission(srcId, dstId, stepMode = false) {
  if (netState.animating && !netState.inStepMode) return;
  if (srcId === dstId) {
    play('error');
    if (window.showToast) window.showToast('Source and destination must be different hosts.');
    return;
  }

  const s = getHost(srcId);
  const d = getHost(dstId);
  if (!s || !d) return;

  netState.animating = true;
  netState.inStepMode = stepMode;
  el('nd-send-btn').disabled = true;

  renderPacketInspector(s, d);
  termPrint(`[TX] Initiating transmission from ${s.label} (${s.ip}) to ${d.label} (${d.ip})...`, 'info');
  updateStatus(`Transmitting packet: <strong>${s.label}</strong> &rarr; <strong>${d.label}</strong>`);

  if (currentTopoMode === 'device-test') {
    simulateDeviceTest(s, d);
  } else if (currentTopoMode === 'enterprise') {
    simulateEnterpriseRoute(s, d);
  } else if (currentTopoMode === 'csma') {
    simulateCSMA(s, d);
  }
}

function simulateDeviceTest(s, d) {
  const cx = 300, cy = 170;
  const cableSrc = el(`cable-${s.id}`);
  if (cableSrc) cableSrc.classList.add('active');

  animPacket('nd-pkt-1', s.x, s.y, cx, cy, animSpeedMs, () => {
    if (cableSrc) cableSrc.classList.remove('active');

    if (netState.device === 'hub') {
      // Hub broadcasts to all other 3 ports
      termPrint(`HUB [L1]: Received bitstream on ${s.iface}. Repeating to ALL other ports!`, 'warn');
      updateStatus(`Hub broadcasted frame out to all physical ports`);

      const otherHosts = getHosts().filter(h => h.id !== s.id);
      otherHosts.forEach((h, idx) => {
        const cable = el(`cable-${h.id}`);
        if (cable) cable.classList.add('active');
        animPacket(`nd-pkt-${idx + 1}`, cx, cy, h.x, h.y, animSpeedMs, () => {
          if (cable) cable.classList.remove('active');
          if (h.id === d.id) {
            termPrint(`Host ${h.label}: Destination MAC matched (${h.mac})! Packet accepted.`, 'success');
          } else {
            termPrint(`Host ${h.label}: Destination MAC (${d.mac}) does NOT match my MAC (${h.mac}). Discarded.`, 'dim');
          }
          if (idx === otherHosts.length - 1) finishTransmission();
        });
      });

    } else if (netState.device === 'switch') {
      // Switch learns source MAC
      const wasKnown = !!netState.macTable[d.mac];
      netState.macTable[s.mac] = { host: s.label, port: s.iface, ip: s.ip };
      updateTableViews();
      termPrint(`SWITCH [L2]: Learned MAC ${s.mac} on ${s.iface}.`, 'learn');

      if (wasKnown) {
        termPrint(`SWITCH [L2]: Destination MAC ${d.mac} FOUND in MAC table. Unicasting directly to ${d.iface}!`, 'success');
        updateStatus(`Switch forwarded frame directly to ${d.label} (Known MAC)`);
        const cableDst = el(`cable-${d.id}`);
        if (cableDst) cableDst.classList.add('active');
        animPacket('nd-pkt-1', cx, cy, d.x, d.y, animSpeedMs, () => {
          if (cableDst) cableDst.classList.remove('active');
          termPrint(`Host ${d.label}: Frame received successfully!`, 'success');
          finishTransmission();
        });
      } else {
        termPrint(`SWITCH [L2]: Destination MAC ${d.mac} UNKNOWN! Flooding all ports except ${s.iface}...`, 'warn');
        updateStatus(`Switch flooding frame to discover destination MAC`);
        const otherHosts = getHosts().filter(h => h.id !== s.id);
        otherHosts.forEach((h, idx) => {
          const cable = el(`cable-${h.id}`);
          if (cable) cable.classList.add('active');
          animPacket(`nd-pkt-${idx + 1}`, cx, cy, h.x, h.y, animSpeedMs, () => {
            if (cable) cable.classList.remove('active');
            if (h.id === d.id) {
              // Learned destination
              netState.macTable[d.mac] = { host: d.label, port: d.iface, ip: d.ip };
              updateTableViews();
              termPrint(`Host ${d.label}: Frame accepted! Switch has now learned ${d.mac}.`, 'success');
            } else {
              termPrint(`Host ${h.label}: Frame discarded (MAC mismatch).`, 'dim');
            }
            if (idx === otherHosts.length - 1) finishTransmission();
          });
        });
      }

    } else if (netState.device === 'router') {
      termPrint(`ROUTER [L3]: Packet received. Examining L3 IPv4 destination header (${d.ip})...`, 'info');
      const sameSub = s.sub === d.sub;
      if (sameSub) {
        termPrint(`ROUTER [L3]: Source ${s.ip} and Dest ${d.ip} are on the SAME subnet (${s.sub}). Routed directly on local interface.`, 'info');
      } else {
        termPrint(`ROUTER [L3]: Cross-subnet route from ${s.sub} to ${d.sub}. Decrementing TTL (64 &rarr; 63). Re-encapsulating L2 MAC frame!`, 'success');
      }
      updateStatus(`Router forwarded packet to destination subnet`);
      const cableDst = el(`cable-${d.id}`);
      if (cableDst) cableDst.classList.add('active');
      animPacket('nd-pkt-1', cx, cy, d.x, d.y, animSpeedMs, () => {
        if (cableDst) cableDst.classList.remove('active');
        termPrint(`Host ${d.label}: Received L3 routed packet!`, 'success');
        finishTransmission();
      });
    }
  });
}

function simulateEnterpriseRoute(s, d) {
  const isCrossSubnet = s.sub !== d.sub;
  const sw1X = 180, sw1Y = 170;
  const rtrX = 300, rtrY = 170;
  const sw2X = 420, sw2Y = 170;

  termPrint(`[Enterprise] Host ${s.label} preparing packet for ${d.label} (${d.ip})...`, 'info');
  const c1 = el(`cable-${s.id}`);
  if (c1) c1.classList.add('active');

  const firstSwX = s.x < 300 ? sw1X : sw2X;
  const firstSwY = 170;

  animPacket('nd-pkt-1', s.x, s.y, firstSwX, firstSwY, animSpeedMs, () => {
    if (c1) c1.classList.remove('active');

    if (!isCrossSubnet) {
      termPrint(`Switch: Source and Destination on same VLAN/Subnet. Direct L2 switching!`, 'success');
      const cDst = el(`cable-${d.id}`);
      if (cDst) cDst.classList.add('active');
      animPacket('nd-pkt-1', firstSwX, firstSwY, d.x, d.y, animSpeedMs, () => {
        if (cDst) cDst.classList.remove('active');
        termPrint(`Host ${d.label}: Intra-subnet delivery successful.`, 'success');
        finishTransmission();
      });
    } else {
      // Ingress switch sends to Router Gateway
      termPrint(`Switch: Destination IP is outside local subnet. Forwarding to Default Gateway Router!`, 'info');
      const cTrunk = el(s.x < 300 ? 'cable-sw1-rtr' : 'cable-rtr-sw2');
      if (cTrunk) cTrunk.classList.add('active');

      animPacket('nd-pkt-1', firstSwX, firstSwY, rtrX, rtrY, animSpeedMs, () => {
        if (cTrunk) cTrunk.classList.remove('active');
        termPrint(`Router: Packet arrived at gateway. Lookup routing table for ${d.sub} &rarr; Exit via opposite interface.`, 'success');

        const secondSwX = d.x < 300 ? sw1X : sw2X;
        const cTrunk2 = el(d.x < 300 ? 'cable-sw1-rtr' : 'cable-rtr-sw2');
        if (cTrunk2) cTrunk2.classList.add('active');

        animPacket('nd-pkt-1', rtrX, rtrY, secondSwX, secondSwY, animSpeedMs, () => {
          if (cTrunk2) cTrunk2.classList.remove('active');
          termPrint(`Egress Switch: Forwarding frame out port ${d.iface} to ${d.label}.`, 'info');

          const cFinal = el(`cable-${d.id}`);
          if (cFinal) cFinal.classList.add('active');

          animPacket('nd-pkt-1', secondSwX, secondSwY, d.x, d.y, animSpeedMs, () => {
            if (cFinal) cFinal.classList.remove('active');
            termPrint(`Host ${d.label}: Packet arrived across routed enterprise network!`, 'success');
            finishTransmission();
          });
        });
      });
    }
  });
}

function simulateCSMA(s, d) {
  termPrint(`[CSMA/CD] Carrier Sense: Host ${s.label} senses bus line... Line is IDLE. Transmitting!`, 'info');
  const cSrc = el(`cable-${s.id}`);
  if (cSrc) cSrc.classList.add('active');

  animPacket('nd-pkt-1', s.x, s.y, s.x, 200, animSpeedMs * 0.7, () => {
    const busCable = el('cable-bus');
    if (busCable) busCable.classList.add('active');

    termPrint(`[Bus] Frame propagating along shared coaxial backbone...`, 'info');
    animPacket('nd-pkt-1', s.x, 200, d.x, 200, animSpeedMs, () => {
      const cDst = el(`cable-${d.id}`);
      if (cDst) cDst.classList.add('active');

      animPacket('nd-pkt-1', d.x, 200, d.x, d.y, animSpeedMs * 0.7, () => {
        if (cSrc) cSrc.classList.remove('active');
        if (busCable) busCable.classList.remove('active');
        if (cDst) cDst.classList.remove('active');
        termPrint(`Host ${d.label}: Frame received. Bus idle.`, 'success');
        finishTransmission();
      });
    });
  });
}

function animPacket(pktId, x1, y1, x2, y2, durationMs, cb) {
  const pkt = el(pktId);
  if (!pkt) { if (cb) cb(); return; }
  pkt.style.display = 'block';

  const startTime = performance.now();
  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    const curX = x1 + (x2 - x1) * progress;
    const curY = y1 + (y2 - y1) * progress;

    pkt.setAttribute('transform', `translate(${curX}, ${curY})`);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      if (cb) cb();
    }
  }
  requestAnimationFrame(tick);
}

function hideAllPackets() {
  for (let i = 1; i <= 4; i++) {
    const p = el(`nd-pkt-${i}`);
    if (p) {
      p.style.display = 'none';
      p.setAttribute('transform', 'translate(-100,-100)');
    }
  }
}

function finishTransmission() {
  setTimeout(() => {
    hideAllPackets();
    qsa('.nd-cable-line').forEach(line => line.classList.remove('active'));
    el('nd-send-btn').disabled = false;
    netState.animating = false;
    netState.inStepMode = false;
    updateStatus('Transmission completed &bull; Network IDLE');
    play('success');
  }, 400);
}

function renderPacketInspector(s, d) {
  const box = el('nd-packet-inspector');
  if (!box) return;

  const isCross = s.sub !== d.sub;
  const ttl = isCross ? 63 : 64;

  box.innerHTML = `
    <!-- Layer 2 Ethernet Frame -->
    <div class="pkt-layer-row l2">
      <div class="pkt-layer-header">
        <span class="pkt-layer-tag">Layer 2</span>
        <span>Ethernet II Frame</span>
        <span class="pkt-layer-len">14 Bytes Header</span>
      </div>
      <div class="pkt-fields-grid">
        <div class="pkt-field" title="Destination Hardware MAC Address">
          <span class="pkt-k">Dst MAC</span>
          <span class="pkt-v mac">${d.mac}</span>
        </div>
        <div class="pkt-field" title="Source Hardware MAC Address">
          <span class="pkt-k">Src MAC</span>
          <span class="pkt-v mac">${s.mac}</span>
        </div>
        <div class="pkt-field" title="Protocol Type (0x0800 = IPv4)">
          <span class="pkt-k">EtherType</span>
          <span class="pkt-v">0x0800 (IPv4)</span>
        </div>
        <div class="pkt-field" title="Cyclic Redundancy Check (Error Check)">
          <span class="pkt-k">FCS (CRC)</span>
          <span class="pkt-v crc">0x7F2B0C19 &check;</span>
        </div>
      </div>
    </div>

    <!-- Layer 3 IPv4 Packet -->
    <div class="pkt-layer-row l3">
      <div class="pkt-layer-header">
        <span class="pkt-layer-tag">Layer 3</span>
        <span>IPv4 Datagram Header</span>
        <span class="pkt-layer-len">20 Bytes</span>
      </div>
      <div class="pkt-fields-grid">
        <div class="pkt-field" title="Source IPv4 Address">
          <span class="pkt-k">Src IP</span>
          <span class="pkt-v ip">${s.ip}</span>
        </div>
        <div class="pkt-field" title="Destination IPv4 Address">
          <span class="pkt-k">Dst IP</span>
          <span class="pkt-v ip">${d.ip}</span>
        </div>
        <div class="pkt-field" title="Time-to-Live (hops before drop)">
          <span class="pkt-k">TTL</span>
          <span class="pkt-v ttl">${ttl}</span>
        </div>
        <div class="pkt-field" title="Layer 4 Protocol (1 = ICMP)">
          <span class="pkt-k">Protocol</span>
          <span class="pkt-v">ICMP (1)</span>
        </div>
      </div>
    </div>

    <!-- Layer 4 ICMP Payload -->
    <div class="pkt-layer-row l4">
      <div class="pkt-layer-header">
        <span class="pkt-layer-tag">Layer 4</span>
        <span>ICMP Echo Request (Ping)</span>
        <span class="pkt-layer-len">64 Bytes Data</span>
      </div>
      <div class="pkt-fields-grid">
        <div class="pkt-field"><span class="pkt-k">ICMP Type</span><span class="pkt-v">8 (Echo Request)</span></div>
        <div class="pkt-field"><span class="pkt-k">Code</span><span class="pkt-v">0</span></div>
        <div class="pkt-field"><span class="pkt-k">Sequence</span><span class="pkt-v">seq=1</span></div>
        <div class="pkt-field"><span class="pkt-k">Payload</span><span class="pkt-v">"LogicQuest Echo Data"</span></div>
      </div>
    </div>
  `;
}

function updateTableViews() {
  // MAC Address Table
  const macBox = el('nd-tab-mac');
  if (macBox) {
    const entries = Object.entries(netState.macTable);
    if (entries.length === 0) {
      macBox.innerHTML = '<div class="nd-empty-table">No MAC addresses learned yet. Transmit frames to populate table.</div>';
    } else {
      macBox.innerHTML = `
        <table class="nd-data-table">
          <thead><tr><th>VLAN</th><th>MAC Address</th><th>Type</th><th>Port</th></tr></thead>
          <tbody>
            ${entries.map(([mac, data]) => `
              <tr>
                <td>1</td>
                <td><code style="color:#22d3a5">${mac}</code></td>
                <td>DYNAMIC</td>
                <td>${data.port || 'Port 1'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  }

  // ARP Cache
  const arpBox = el('nd-tab-arp');
  if (arpBox) {
    const entries = Object.entries(netState.macTable);
    if (entries.length === 0) {
      arpBox.innerHTML = '<div class="nd-empty-table">No ARP entries resolved. Ping hosts to resolve ARP entries.</div>';
    } else {
      arpBox.innerHTML = `
        <table class="nd-data-table">
          <thead><tr><th>Internet Address</th><th>Physical Address</th><th>Type</th></tr></thead>
          <tbody>
            ${entries.map(([mac, data]) => `
              <tr>
                <td><code style="color:#38bdf8">${data.ip || '192.168.1.10'}</code></td>
                <td><code style="color:#818cf8">${mac}</code></td>
                <td>Dynamic</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  }

  // Routing Table
  const routeBox = el('nd-tab-route');
  if (routeBox) {
    routeBox.innerHTML = `
      <table class="nd-data-table">
        <thead><tr><th>Destination</th><th>Gateway</th><th>Interface</th><th>Metric</th></tr></thead>
        <tbody>
          <tr><td>192.168.1.0/24</td><td>0.0.0.0 (Direct)</td><td>eth0</td><td>0</td></tr>
          <tr><td>192.168.2.0/24</td><td>0.0.0.0 (Direct)</td><td>eth1</td><td>0</td></tr>
          <tr><td>0.0.0.0/0</td><td>10.0.0.1</td><td>wan0</td><td>1</td></tr>
        </tbody>
      </table>
    `;
  }
}

// CLI
function setupTerminalCLI() {
  const input = el('nd-term-input');
  const submit = el('nd-term-submit');

  function handleCmd() {
    if (!input) return;
    const cmd = input.value.trim();
    if (!cmd) return;
    input.value = '';
    executeCLICommand(cmd);
  }

  submit?.addEventListener('click', handleCmd);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleCmd();
  });

  // Preset button clicks
  qsa('.nd-cli-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd;
      if (cmd) {
        if (cmd === 'clear') {
          clearTerminal();
        } else {
          executeCLICommand(cmd);
        }
      }
    });
  });
}

function termPrint(text, type = 'normal') {
  const body = el('nd-terminal-body');
  if (!body) return;
  const line = document.createElement('div');
  line.className = `nd-term-line ${type}`;
  line.innerHTML = text;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}

function clearTerminal() {
  const body = el('nd-terminal-body');
  if (body) {
    body.innerHTML = '<div class="nd-term-line greeting">LogicQuest Terminal cleared. Ready for input.</div>';
  }
}

function executeCLICommand(rawCmd) {
  const cmd = rawCmd.trim();
  termPrint(`<span class="nd-prompt">host-a:~$</span> ${cmd}`, 'cmd');

  const parts = cmd.split(/\s+/);
  const base = parts[0].toLowerCase();
  const arg = parts[1] || '';

  if (base === 'clear' || base === 'cls') {
    clearTerminal();
    return;
  }

  if (base === 'ping') {
    if (!arg) {
      termPrint('usage: ping &lt;ip-address&gt;', 'error');
      return;
    }
    const targetHost = getHosts().find(h => h.ip === arg);
    if (!targetHost) {
      termPrint(`PING ${arg}: Destination Host Unreachable.`, 'error');
      return;
    }

    termPrint(`PING ${arg} (${targetHost.label}): 56 data bytes`, 'info');
    let seq = 1;
    function sendPingEcho() {
      if (seq <= 4) {
        setTimeout(() => {
          const rtt = (Math.random() * 1.5 + 1.2).toFixed(2);
          const ttl = targetHost.sub === getHost('pc-a')?.sub ? 64 : 63;
          termPrint(`64 bytes from ${arg}: icmp_seq=${seq} ttl=${ttl} time=${rtt} ms`, 'success');
          seq++;
          sendPingEcho();
        }, 350);
      } else {
        setTimeout(() => {
          termPrint(`--- ${arg} ping statistics ---<br>4 packets transmitted, 4 received, 0% packet loss`, 'info');
          // Trigger visual packet flow
          executeTransmission('pc-a', targetHost.id);
        }, 300);
      }
    }
    sendPingEcho();
    return;
  }

  if (base === 'arp' && parts[1] === '-a') {
    termPrint('Interface: 192.168.1.10 on eth0<br>  Internet Address      Physical Address      Type<br>' +
      getHosts().map(h => `  ${h.ip.padEnd(20)}  ${h.mac.padEnd(20)}  dynamic`).join('<br>'), 'info');
    return;
  }

  if (base === 'show' && parts.slice(1).join(' ').toLowerCase().includes('mac')) {
    termPrint('Mac Address Table<br>-------------------------------------------<br>Vlan    Mac Address       Type        Ports<br>----    -----------       --------    -----<br>' +
      getHosts().map(h => `1       ${h.mac}    DYNAMIC     ${h.iface}`).join('<br>'), 'info');
    return;
  }

  if (base === 'ipconfig' || base === 'ifconfig') {
    const h = getHost('pc-a');
    termPrint(`Ethernet adapter Local Area Connection:<br>
      Connection-specific DNS Suffix  . : local<br>
      Link-local IPv6 Address . . . . . : fe80::a1b2:c3d4%12<br>
      IPv4 Address. . . . . . . . . . . : ${h ? h.ip : '192.168.1.10'}<br>
      Subnet Mask . . . . . . . . . . . : 255.255.255.0<br>
      Default Gateway . . . . . . . . . : 192.168.1.1<br>
      Physical Address (MAC). . . . . . : ${h ? h.mac : 'AA:AA:AA:AA:01'}`, 'info');
    return;
  }

  if (base === 'traceroute' || base === 'tracert') {
    termPrint(`traceroute to ${arg || '192.168.2.10'}, 30 hops max, 60 byte packets<br>
 1  192.168.1.1 (Gateway Router)  0.812 ms  0.720 ms<br>
 2  ${arg || '192.168.2.10'} (Target Destination)  1.942 ms  1.820 ms`, 'success');
    return;
  }

  termPrint(`bash: ${base}: command not found. Try: ping, arp -a, show mac, ipconfig, traceroute, clear`, 'error');
}

let osiReady = false;
function initOSI() {
  if (osiReady) return;
  osiReady = true;
  initOSISim();
}

let parityReady = false;
function initParity() {
  if (parityReady) return;
  parityReady = true;

  const inBitsBox = el('parity-input-bits');
  const recvBitsBox = el('parity-recv-bits');
  const resultBox = el('parity-result');
  let currentBits = [1, 0, 1, 1, 0, 0, 1];
  let recvBits = [];

  function renderInBits() {
    if (!inBitsBox) return;
    inBitsBox.innerHTML = currentBits.map((b, i) => `
      <button type="button" class="parity-bit-btn ${b ? 'one' : 'zero'}" data-idx="${i}">${b}</button>
    `).join('');

    inBitsBox.querySelectorAll('.parity-bit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        play('toggle');
        const idx = parseInt(btn.dataset.idx, 10);
        currentBits[idx] = 1 - currentBits[idx];
        renderInBits();
      });
    });
  }

  el('parity-send-btn')?.addEventListener('click', () => {
    play('click');
    const ones = currentBits.filter(b => b === 1).length;
    const parityBit = ones % 2 === 1 ? 1 : 0; // Even parity
    recvBits = [...currentBits, parityBit];
    renderRecvBits();
    checkParityResult();
  });

  el('parity-flip-btn')?.addEventListener('click', () => {
    if (recvBits.length === 0) {
      if (window.showToast) window.showToast('Click "Send with Parity" first.');
      return;
    }
    play('error');
    const flipIdx = Math.floor(Math.random() * recvBits.length);
    recvBits[flipIdx] = 1 - recvBits[flipIdx];
    renderRecvBits(flipIdx);
    checkParityResult();
  });

  function renderRecvBits(errorIdx = -1) {
    if (!recvBitsBox) return;
    recvBitsBox.innerHTML = recvBits.map((b, i) => `
      <span class="parity-recv-bit ${b ? 'one' : 'zero'} ${i === 7 ? 'parity' : ''} ${i === errorIdx ? 'corrupted' : ''}" title="${i === 7 ? 'Parity Bit' : 'Data Bit'}">${b}</span>
    `).join('');
  }

  function checkParityResult() {
    if (!resultBox || recvBits.length === 0) return;
    const totalOnes = recvBits.filter(b => b === 1).length;
    if (totalOnes % 2 === 0) {
      resultBox.className = 'parity-result success';
      resultBox.innerHTML = `${I.check} Even Parity Verified: Total 1s = ${totalOnes} (No Single Bit Error Detected)`;
    } else {
      resultBox.className = 'parity-result error';
      resultBox.innerHTML = `${I.cross} PARITY ERROR DETECTED: Total 1s = ${totalOnes} (Odd count violates Even Parity!)`;
    }
  }

  renderInBits();
}

let subnetReady = false;
function initSubnetLab() {
  if (subnetReady) { calculateSubnet(); return; }
  subnetReady = true;

  const ipInput = el('subnet-ip-input');
  const slider = el('subnet-cidr-slider');
  const prefixVal = el('subnet-prefix-val');

  if (ipInput) ipInput.addEventListener('input', calculateSubnet);
  if (slider) {
    slider.addEventListener('input', () => {
      if (prefixVal) prefixVal.textContent = `/${slider.value}`;
      calculateSubnet();
    });
  }

  qsa('.subnet-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      play('click');
      const cidr = btn.dataset.cidr;
      if (slider) slider.value = cidr;
      if (prefixVal) prefixVal.textContent = `/${cidr}`;
      calculateSubnet();
    });
  });

  calculateSubnet();
}

function ipToNum(ipStr) {
  const parts = ipStr.trim().split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) >>> 0) + ((parts[1] << 16) >>> 0) + ((parts[2] << 8) >>> 0) + (parts[3] >>> 0);
}

function numToIp(num) {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join('.');
}

function numToBin8(n) {
  return n.toString(2).padStart(8, '0');
}

function calculateSubnet() {
  const ipInput = el('subnet-ip-input');
  const slider = el('subnet-cidr-slider');
  if (!ipInput || !slider) return;

  const rawIp = ipInput.value.trim();
  const ipNum = ipToNum(rawIp);
  const cidr = parseInt(slider.value, 10) || 24;

  const grid = el('subnet-calc-grid');
  const binVis = el('subnet-binary-vis');
  const tableBody = el('subnet-table-body');

  if (ipNum === null) {
    if (grid) grid.innerHTML = `<div class="subnet-calc-row" style="color:var(--color-error)"><span>Invalid IPv4 format (e.g. 192.168.1.10)</span></div>`;
    return;
  }

  const maskNum = cidr === 0 ? 0 : ((0xFFFFFFFF << (32 - cidr)) >>> 0);
  const wildcardNum = (~maskNum) >>> 0;
  const netNum = (ipNum & maskNum) >>> 0;
  const bcastNum = (netNum | wildcardNum) >>> 0;

  const totalAddresses = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : Math.max(0, totalAddresses - 2);

  const firstHostNum = cidr >= 31 ? netNum : netNum + 1;
  const lastHostNum = cidr >= 31 ? bcastNum : bcastNum - 1;

  if (grid) {
    grid.innerHTML = `
      <div class="subnet-calc-row"><span>Network Address:</span> <code>${numToIp(netNum)}</code></div>
      <div class="subnet-calc-row"><span>Broadcast Address:</span> <code>${numToIp(bcastNum)}</code></div>
      <div class="subnet-calc-row"><span>Subnet Mask:</span> <code>${numToIp(maskNum)}</code></div>
      <div class="subnet-calc-row"><span>Usable Host Range:</span> <code>${numToIp(firstHostNum)} &ndash; ${numToIp(lastHostNum)}</code></div>
      <div class="subnet-calc-row"><span>Total Addresses:</span> <code>${totalAddresses.toLocaleString()}</code></div>
      <div class="subnet-calc-row"><span>Usable Hosts:</span> <code style="color:#22d3a5">${usableHosts.toLocaleString()}</code></div>
    `;
  }

  if (binVis) {
    const octets = rawIp.split('.').map(Number);
    const maskOctets = numToIp(maskNum).split('.').map(Number);

    binVis.innerHTML = `
      <div class="bin-row-wrap">
        <div class="bin-row-title">IP Binary:</div>
        <div class="bin-octets">
          ${octets.map((o, idx) => `
            <div class="bin-octet">${numToBin8(o)}</div>
          `).join('<span class="bin-dot">.</span>')}
        </div>
      </div>
      <div class="bin-row-wrap" style="margin-top:0.4rem">
        <div class="bin-row-title">Mask Binary:</div>
        <div class="bin-octets">
          ${maskOctets.map((o, idx) => `
            <div class="bin-octet mask">${numToBin8(o)}</div>
          `).join('<span class="bin-dot">.</span>')}
        </div>
      </div>
    `;
  }

  if (tableBody) {
    const subnets = [];
    const step = totalAddresses;
    const baseNet = (netNum & (0xFFFFFF00 >>> 0)) >>> 0;
    const maxRows = Math.min(8, Math.floor(256 / Math.max(1, step)));

    for (let i = 0; i < maxRows; i++) {
      const sNet = baseNet + i * step;
      const sBcast = sNet + step - 1;
      const sFirst = sNet + 1;
      const sLast = sBcast - 1;
      const isCurrent = netNum === sNet;

      subnets.push(`
        <tr class="${isCurrent ? 'current-subnet' : ''}">
          <td>${i + 1} ${isCurrent ? '★' : ''}</td>
          <td><code>${numToIp(sNet)}</code></td>
          <td><code>${numToIp(sFirst)} &ndash; ${numToIp(sLast)}</code></td>
          <td><code>${numToIp(sBcast)}</code></td>
        </tr>
      `);
    }
    tableBody.innerHTML = subnets.join('');
  }
}
