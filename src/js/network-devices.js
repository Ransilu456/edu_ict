import './common.js';
import { initOSISim, cleanupOSISim } from './osi-sim.js';

let ndInitialized = false;
export function initNetworkDevices() {
  if (!document.getElementById('nd-lab-container')) return;
  if (!ndInitialized) { ndInitialized = true; buildNDLayout(); bindNDTabs(); }
  switchNDTab('network-tab');
}
export function cleanupNetworkDevices() {
  if (window.ndStopAnim) window.ndStopAnim();
  cleanupOSISim();
}
window.initNetworkDevices = initNetworkDevices;
window.cleanupNetworkDevices = cleanupNetworkDevices;

// SVG icons
const I = {
  hub: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="2"/><path d="M4.1 4.1a8 8 0 0 0 0 11.8M15.9 4.1a8 8 0 0 1 0 11.8"/></svg>',
  switch_: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="6" width="12" height="8" rx="1"/><path d="M6 10h8M10 6v8"/></svg>',
  router: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="8" width="14" height="7" rx="1.5"/><circle cx="7" cy="11.5" r="1"/><circle cx="10" cy="11.5" r="1"/><circle cx="13" cy="11.5" r="1"/><path d="M10 3v5M7 6l3 3 3-3"/></svg>',
  check: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10l4 4 8-8"/></svg>',
  cross: '<svg viewBox="0 0 20 20" fill="none" stroke="#ef4444" stroke-width="2"><path d="M5 5l10 10M15 5L5 15"/></svg>',
  warn: '<svg viewBox="0 0 20 20" fill="none" stroke="#ef4444" stroke-width="1.5"><path d="M10 2L1 18h18L10 2z"/><path d="M10 8v4"/><path d="M10 14v0"/></svg>',
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
  laptop: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="2" width="14" height="11" rx="1.5"/><path d="M2 16a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v1H2v-1z"/></svg>',
  network: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 5h14M3 15h14"/><rect x="5" y="3" width="10" height="14" rx="1.5"/><circle cx="10" cy="5" r="1"/><circle cx="10" cy="15" r="1"/></svg>',
  crypto: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 1l7 3v6a7 7 0 0 1-7 6 7 7 0 0 1-7-6V4l7-3z"/><path d="M8 10l1.5 1.5L12 9"/></svg>',
  parity: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12l4 4 8-8"/><rect x="2" y="2" width="16" height="16" rx="3"/></svg>',
  bits: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="2" width="14" height="16" rx="2"/><path d="M7 6h6M7 10h6M7 14h4"/></svg>',
};

function el(s) { return document.getElementById(s); }
function qs(s, p) { return (p || document).querySelector(s); }
function qsa(s, p) { return (p || document).querySelectorAll(s); }
function play(n) { if (window.playSound) window.playSound(n); }

function buildNDLayout() {
  el('nd-lab-container').innerHTML = `
<div class="nd-main">
  <div class="nd-tabs">
    <button class="nd-tab active" data-ndtab="network-tab">${I.network} Network Devices</button>
    <button class="nd-tab" data-ndtab="osi-tab">${I.layers} OSI Sim</button>
    <button class="nd-tab" data-ndtab="subnet-tab">${I.globe} Subnetting & CIDR</button>
    <button class="nd-tab" data-ndtab="crypto-tab">${I.crypto} Encryption</button>
    <button class="nd-tab" data-ndtab="parity-tab">${I.parity} Parity Check</button>
  </div>

  <!-- NETWORK DEVICES -->
  <div class="nd-tab-content active" id="network-tab">
    <div class="nd-layout">
      <div class="nd-left">
        <div class="nd-panel-header">
          ${I.network}
          <div>
            <div class="nd-panel-title">Network Devices Lab</div>
            <div class="nd-panel-sub">Hub &bull; Switch &bull; Router</div>
          </div>
        </div>
        <div class="nd-device-selector">
          <button class="nd-device-btn active" data-device="hub">${I.hub} Hub <span class="nd-dev-layer">L1</span></button>
          <button class="nd-device-btn" data-device="switch">${I.switch_} Switch <span class="nd-dev-layer">L2</span></button>
          <button class="nd-device-btn" data-device="router">${I.router} Router <span class="nd-dev-layer">L3</span></button>
        </div>
        <div class="nd-controls">
          <div class="nd-row">
            <div><span class="nd-label">Source</span><div class="nd-host-options" id="nd-src-options"></div></div>
            <div><span class="nd-label">Dest</span><div class="nd-host-options" id="nd-dst-options"></div></div>
          </div>
          <button class="nd-send-btn" id="nd-send-btn">${I.send} Send Packet</button>
        </div>
        <div class="nd-card"><div class="nd-card-title">${I.search} Device Info</div><div class="nd-info-content" id="nd-info-content"></div></div>
        <div class="nd-card"><div class="nd-card-title">${I.brain} MAC Table</div><div class="nd-table-content" id="nd-table-content"><em style="color:var(--text-muted)">No activity yet</em></div></div>
        <div class="nd-card">
          <div class="nd-card-title">${I.list} Packet Protocol Breakdown</div>
          <div class="nd-packet-inspector" id="nd-packet-inspector">
            <em style="color:var(--text-muted);font-size:0.75rem">Transmit a packet to inspect L2 frame &amp; L3/L4 headers</em>
          </div>
        </div>
        <!-- Topology Legend -->
        <div class="nd-card" style="margin-top:auto">
          <div class="nd-card-title">${I.key} Topology Legend</div>
          <div class="nd-legend-content" style="font-size:0.65rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.25rem; line-height: 1.3;">
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <span style="display:inline-block; width:16px; height:0px; border-top:2.5px dashed var(--border-color)"></span>
              <span>Inactive Cable Link</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <span style="display:inline-block; width:16px; height:0px; border-top:2.5px solid var(--color-success)"></span>
              <span>Active Packet Link</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <span style="display:inline-block; width:12px; height:12px; border-radius:3px; background:rgba(129,140,248,0.1); border:1px solid #818cf8"></span>
              <span>Hub (L1 Physical Broadcast)</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <span style="display:inline-block; width:12px; height:12px; border-radius:3px; background:rgba(34,211,165,0.1); border:1px solid #22d3a5"></span>
              <span>Switch (L2 Data Link Forward)</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <span style="display:inline-block; width:12px; height:12px; border-radius:3px; background:rgba(251,191,36,0.1); border:1px solid #fbbf24"></span>
              <span>Router (L3 Network Route)</span>
            </div>
          </div>
        </div>
      </div>
      <div class="nd-right">
        <div class="nd-svg-wrap">
          <svg class="nd-svg" viewBox="0 0 400 280">
            <defs>
              <linearGradient id="ndGradHub" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#818cf8"/><stop offset="100%" stop-color="#6366f1"/></linearGradient>
              <linearGradient id="ndGradSwitch" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#22d3a5"/><stop offset="100%" stop-color="#059669"/></linearGradient>
              <linearGradient id="ndGradRouter" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient>
            </defs>
            <!-- Cables -->
            <line class="nd-line" id="nd-line-pc-a" x1="60" y1="50" x2="170" y2="130"/>
            <line class="nd-line" id="nd-line-pc-b" x1="60" y1="230" x2="170" y2="150"/>
            <line class="nd-line" id="nd-line-pc-c" x1="240" y1="130" x2="350" y2="50"/>
            <line class="nd-line" id="nd-line-pc-d" x1="240" y1="150" x2="350" y2="230"/>

            <!-- Host A -->
            <g class="nd-host-group" id="host-pc-a" style="cursor:pointer;" onclick="window.selectNDDevice('pc-a')">
              <rect class="nd-host-bg" x="30" y="25" width="50" height="50" rx="8"/>
              <!-- Desktop computer schematic design -->
              <rect x="40" y="32" width="30" height="20" rx="2" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.2"/>
              <line x1="55" y1="52" x2="55" y2="58" stroke="#818cf8" stroke-width="2"/>
              <line x1="50" y1="58" x2="60" y2="58" stroke="#818cf8" stroke-width="2"/>
              <circle cx="43" cy="36" r="1.5" fill="#22d3a5"/>
              <text class="nd-host-label" x="55" y="46" text-anchor="middle">A</text>
              <text class="nd-host-mac" x="55" y="62" text-anchor="middle">AA:AA:AA:AA:AA:01</text>
              <text class="nd-host-ip" x="55" y="69" text-anchor="middle">192.168.1.10</text>
            </g>

            <!-- Host B -->
            <g class="nd-host-group" id="host-pc-b" style="cursor:pointer;" onclick="window.selectNDDevice('pc-b')">
              <rect class="nd-host-bg" x="30" y="205" width="50" height="50" rx="8"/>
              <rect x="40" y="212" width="30" height="20" rx="2" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.2"/>
              <line x1="55" y1="232" x2="55" y2="238" stroke="#818cf8" stroke-width="2"/>
              <line x1="50" y1="238" x2="60" y2="238" stroke="#818cf8" stroke-width="2"/>
              <circle cx="43" cy="216" r="1.5" fill="#22d3a5"/>
              <text class="nd-host-label" x="55" y="226" text-anchor="middle">B</text>
              <text class="nd-host-mac" x="55" y="242" text-anchor="middle">AA:AA:AA:AA:AA:02</text>
              <text class="nd-host-ip" x="55" y="249" text-anchor="middle">192.168.1.20</text>
            </g>

            <!-- Host C -->
            <g class="nd-host-group" id="host-pc-c" style="cursor:pointer;" onclick="window.selectNDDevice('pc-c')">
              <rect class="nd-host-bg" x="325" y="25" width="50" height="50" rx="8"/>
              <rect x="335" y="32" width="30" height="20" rx="2" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.2"/>
              <line x1="350" y1="52" x2="350" y2="58" stroke="#818cf8" stroke-width="2"/>
              <line x1="345" y1="58" x2="355" y2="58" stroke="#818cf8" stroke-width="2"/>
              <circle cx="338" cy="36" r="1.5" fill="#22d3a5"/>
              <text class="nd-host-label" x="350" y="46" text-anchor="middle">C</text>
              <text class="nd-host-mac" x="350" y="62" text-anchor="middle">AA:AA:AA:AA:AA:03</text>
              <text class="nd-host-ip" x="350" y="69" text-anchor="middle">192.168.2.10</text>
            </g>

            <!-- Host D -->
            <g class="nd-host-group" id="host-pc-d" style="cursor:pointer;" onclick="window.selectNDDevice('pc-d')">
              <rect class="nd-host-bg" x="325" y="205" width="50" height="50" rx="8"/>
              <rect x="335" y="212" width="30" height="20" rx="2" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.2"/>
              <line x1="350" y1="232" x2="350" y2="238" stroke="#818cf8" stroke-width="2"/>
              <line x1="345" y1="238" x2="355" y2="238" stroke="#818cf8" stroke-width="2"/>
              <circle cx="338" cy="216" r="1.5" fill="#22d3a5"/>
              <text class="nd-host-label" x="350" y="226" text-anchor="middle">D</text>
              <text class="nd-host-mac" x="350" y="242" text-anchor="middle">AA:AA:AA:AA:AA:04</text>
              <text class="nd-host-ip" x="350" y="249" text-anchor="middle">192.168.2.20</text>
            </g>

            <!-- Central Device -->
            <g id="nd-center-g" style="cursor:pointer;" onclick="window.selectNDDevice('central')">
              <rect class="nd-dev-box hub" id="nd-devbox" x="175" y="115" width="60" height="50" rx="8"/>
              <g id="nd-dev-icon-overlay"></g>
              <text class="nd-dev-label" id="nd-devlabel" x="205" y="157" text-anchor="middle">HUB</text>
            </g>

            <!-- Animation Packets (envelope design) -->
            <g class="nd-packet" id="nd-dot1" transform="translate(-20, -20)" display="none">
              <rect x="-8" y="-6" width="16" height="12" rx="2" fill="#10b981" stroke="#fff" stroke-width="0.8"/>
              <path d="M-8,-6 L0,0 L8,-6" stroke="#fff" stroke-width="0.8" fill="none"/>
            </g>
            <g class="nd-packet" id="nd-dot2" transform="translate(-20, -20)" display="none">
              <rect x="-8" y="-6" width="16" height="12" rx="2" fill="#10b981" stroke="#fff" stroke-width="0.8"/>
              <path d="M-8,-6 L0,0 L8,-6" stroke="#fff" stroke-width="0.8" fill="none"/>
            </g>
            <g class="nd-packet" id="nd-dot3" transform="translate(-20, -20)" display="none">
              <rect x="-8" y="-6" width="16" height="12" rx="2" fill="#10b981" stroke="#fff" stroke-width="0.8"/>
              <path d="M-8,-6 L0,0 L8,-6" stroke="#fff" stroke-width="0.8" fill="none"/>
            </g>

            <text class="nd-crash" id="nd-crash" x="205" y="270" text-anchor="middle" display="none">! COLLISION !</text>
          </svg>
        </div>
        <div class="nd-log">
          <div class="nd-log-header">${I.network} Event Log</div>
          <div class="nd-log-list" id="nd-log-list"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- OSI Sim -->
  <div class="nd-tab-content" id="osi-tab">
    <div id="osi-container"></div>
  </div>

  <!-- SUBNETTING & CIDR LAB -->
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

  <!-- ENCRYPTION -->
  <div class="nd-tab-content" id="crypto-tab">
    <div class="crypto-layout">
      <div class="crypto-header">${I.crypto} <span class="crypto-title">Encryption Lab \u2014 Public Key Exchange</span></div>
      <div class="crypto-body">
        <div class="crypto-exchange">
          <div class="crypto-party">
            <div class="crypto-party-header">${I.laptop} Alice</div>
            <div class="crypto-key-row">
              <div class="crypto-key-mini public"><span class="key-label">Public Key</span><span class="key-val" id="crypto-alice-pub">\u2014</span></div>
              <div class="crypto-key-mini private"><span class="key-label">Private Key</span><span class="key-val" id="crypto-alice-priv">\u2014</span></div>
            </div>
          </div>
          <div class="crypto-exchange-center">
            <div class="crypto-exchange-line">
              <span class="crypto-exchange-arrow">${I.send} Alice\u2019s Public Key</span>
            </div>
            <div class="crypto-exchange-line rev">
              <span class="crypto-exchange-arrow">${I.send} Bob\u2019s Public Key</span>
            </div>
          </div>
          <div class="crypto-party">
            <div class="crypto-party-header bob">${I.laptop} Bob</div>
            <div class="crypto-key-row">
              <div class="crypto-key-mini public"><span class="key-label">Public Key</span><span class="key-val" id="crypto-bob-pub">\u2014</span></div>
              <div class="crypto-key-mini private"><span class="key-label">Private Key</span><span class="key-val" id="crypto-bob-priv">\u2014</span></div>
            </div>
          </div>
        </div>
        <div class="crypto-flow-row">
          <div class="crypto-flow-step">
            <div class="crypto-flow-card sender">
              <div class="crypto-flow-card-title">${I.laptop} Alice Sends</div>
              <textarea class="crypto-input" id="crypto-plain-alice" rows="2">HELLO</textarea>
              <button class="crypto-btn primary" id="crypto-enc-btn-alice">${I.lock} Encrypt with Bob\u2019s Public Key</button>
            </div>
            <div class="crypto-flow-arrow-wrap">
              <div class="crypto-flow-arrow">${I.lock}</div>
              <div class="crypto-flow-arrow-label">Encrypt</div>
            </div>
            <div class="crypto-flow-card cipher">
              <div class="crypto-flow-card-title">${I.bits} Ciphertext</div>
              <div class="crypto-data" id="crypto-cipher-alice">\u2014</div>
              <div class="crypto-status" id="crypto-cipher-status">${I.search} Waiting\u2026</div>
            </div>
            <div class="crypto-flow-arrow-wrap">
              <div class="crypto-flow-arrow">${I.key}</div>
              <div class="crypto-flow-arrow-label">Decrypt</div>
            </div>
            <div class="crypto-flow-card receiver">
              <div class="crypto-flow-card-title">${I.laptop} Bob Receives</div>
              <div class="crypto-data" id="crypto-decrypted-alice">\u2014</div>
              <button class="crypto-btn green" id="crypto-dec-btn-bob">${I.key} Decrypt with Bob\u2019s Private Key</button>
            </div>
          </div>
        </div>
        <div class="crypto-info-card">
          <div class="crypto-info-title">${I.search} How Public Key Exchange Works</div>
          <div class="crypto-info-body">
            <strong>1. Key Generation</strong> \u2014 Both Alice and Bob generate their own RSA key pairs<br>
            <strong>2. Public Key Exchange</strong> \u2014 They share their <span class="highlight">public keys</span> openly over the network<br>
            <strong>3. Encrypt</strong> \u2014 Alice encrypts her message using <span class="highlight">Bob\u2019s public key</span><br>
            <strong>4. Decrypt</strong> \u2014 Only <span class="highlight">Bob\u2019s private key</span> can reverse the encryption<br>
            <strong>5. Security</strong> \u2014 Even if intercepted, the ciphertext is useless without Bob\u2019s private <em>d</em><br>
            <strong>Real World</strong> \u2014 Foundation of HTTPS, SSH, and secure email
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- PARITY CHECK -->
  <div class="nd-tab-content" id="parity-tab">
    <div class="parity-layout">
      <div class="parity-header">${I.parity} <span class="parity-title">Parity Check \u2014 Error Detection</span></div>
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
            <div class="parity-result wait" id="parity-result">${I.search} Waiting to send\u2026</div>
          </div>
        </div>
        <div class="parity-info-card">
          <div class="parity-info-title">${I.search} How Parity Works</div>
          <div class="parity-info-body">
            <strong>Even Parity:</strong> Count the 1s in the 7 data bits. If odd, set parity bit = <strong>1</strong> (makes total even). If even, set parity bit = <strong>0</strong>.<br>
            The receiver checks: if the total number of 1s in all 8 bits is odd, an <strong>error</strong> is detected.<br><br>
            &bull; Detects any <strong>odd number</strong> of bit flips<br>
            &bull; Cannot <em>correct</em> errors &mdash; only detect them<br>
            &bull; <strong>Limitation:</strong> If 2 bits flip, parity still matches (even count), so the error goes unnoticed
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
    else if (t.dataset.ndtab === 'crypto-tab') initCrypto();
    else if (t.dataset.ndtab === 'parity-tab') initParity();
  }));
  initNetLab();
  initOSI();
  initSubnetLab();
  initCrypto();
  initParity();
}

function switchNDTab(id) { qs(`.nd-tab[data-ndtab="${id}"]`)?.click(); }
window.switchNDTab = switchNDTab;

/* ===================================================================
   TAB 1 — NETWORK DEVICES
   =================================================================== */
let netState = { device: 'hub', animating: false, src: 'pc-b', dst: 'pc-c', macTable: {}, colCnt: 0, abort: false };
const hosts = [
  { id: 'pc-a', label: 'A', mac: 'AA:AA:AA:AA:AA:01', ip: '192.168.1.10', sub: '192.168.1.0' },
  { id: 'pc-b', label: 'B', mac: 'AA:AA:AA:AA:AA:02', ip: '192.168.1.20', sub: '192.168.1.0' },
  { id: 'pc-c', label: 'C', mac: 'AA:AA:AA:AA:AA:03', ip: '192.168.2.10', sub: '192.168.2.0' },
  { id: 'pc-d', label: 'D', mac: 'AA:AA:AA:AA:AA:04', ip: '192.168.2.20', sub: '192.168.2.0' },
];
// SVG coords for 400x280 viewBox
const coords = {
  'pc-a': [55, 50], 'pc-b': [55, 230],
  'pc-c': [350, 50], 'pc-d': [350, 230]
};
const devC = [205, 140];

function gh(id) { return hosts.find(h => h.id === id); }

let netReady = false;
function initNetLab() {
  if (netReady) { resetNetLab(); return; }
  netReady = true;
  netState.animating = false; netState.abort = false; netState.macTable = {}; netState.colCnt = 0;
  updateHostOptions();
  qsa('.nd-device-btn', el('network-tab')).forEach(b => b.addEventListener('click', () => {
    if (netState.animating) return;
    play('click');
    netState.device = b.dataset.device;
    qsa('.nd-device-btn', el('network-tab')).forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    resetNetLab();
  }));
  el('nd-send-btn').addEventListener('click', sendPacket);
  resetNetLab();
}

function resetNetLab() {
  netState.animating = false; netState.macTable = {}; netState.colCnt = 0;
  el('nd-log-list').innerHTML = '';
  el('nd-table-content').innerHTML = '<em style="color:var(--text-muted)">No activity yet</em>';
  clearLinks();
  updateNetUI();
  setDevInfo();
}

function updateNetUI() {
  const d = netState.device;
  const box = el('nd-devbox');
  if (box) {
    box.setAttribute('class', `nd-dev-box ${d}`);
    box.style.fill = d === 'hub' ? 'rgba(129,140,248,0.08)' : d === 'switch' ? 'rgba(34,211,165,0.08)' : 'rgba(251,191,36,0.08)';
  }
  const lbl = el('nd-devlabel');
  if (lbl) lbl.textContent = d.toUpperCase();
  
  // High fidelity switch/hub/router SVG overlays
  const overlay = el('nd-dev-icon-overlay');
  if (overlay) {
    if (d === 'hub') {
      overlay.innerHTML = `
        <!-- Hub rack chassis -->
        <rect x="185" y="122" width="40" height="16" rx="2" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.2"/>
        <line x1="190" y1="130" x2="220" y2="130" stroke="#818cf8" stroke-width="1" stroke-dasharray="1.5,1.5"/>
        <circle cx="195" cy="130" r="2.2" fill="#818cf8"/>
        <circle cx="205" cy="130" r="2.2" fill="#818cf8"/>
        <circle cx="215" cy="130" r="2.2" fill="#818cf8"/>
        <circle cx="221" cy="126" r="1" fill="#22d3a5"/>
      `;
    } else if (d === 'switch') {
      overlay.innerHTML = `
        <!-- Switch rack chassis with dynamic port LEDs -->
        <rect x="185" y="122" width="40" height="16" rx="2" fill="#111827" stroke="#22d3a5" stroke-width="1.2"/>
        <circle cx="192" cy="130" r="1.5" fill="#22d3a5" style="animation: ndPulse 0.3s infinite alternate;"/>
        <circle cx="197" cy="130" r="1.5" fill="#10b981"/>
        <circle cx="202" cy="130" r="1.5" fill="#22d3a5" style="animation: ndPulse 0.4s infinite alternate;"/>
        <circle cx="207" cy="130" r="1.5" fill="#10b981"/>
        <circle cx="212" cy="130" r="1.5" fill="#22d3a5" style="animation: ndPulse 0.5s infinite alternate;"/>
        <circle cx="217" cy="130" r="1.5" fill="#22d3a5"/>
        <circle cx="222" cy="130" r="1.5" fill="#10b981"/>
      `;
    } else { // router
      overlay.innerHTML = `
        <!-- Router disc/arrows -->
        <circle cx="205" cy="130" r="13" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.5"/>
        <path d="M 197 130 L 213 130 M 205 122 L 205 138" stroke="#fbbf24" stroke-width="1.2" stroke-linecap="round"/>
        <polygon points="194,130 199,127 199,133" fill="#fbbf24"/>
        <polygon points="216,130 211,127 211,133" fill="#fbbf24"/>
        <polygon points="205,119 202,124 208,124" fill="#fbbf24"/>
        <polygon points="205,141 202,136 208,136" fill="#fbbf24"/>
      `;
    }
  }

  hideDots();
  const cr = el('nd-crash');
  if (cr) cr.style.display = 'none';
}

function hideDots() {
  ['nd-dot1','nd-dot2','nd-dot3'].forEach(id => {
    const e = el(id);
    if (e) {
      e.style.display = 'none';
      if (e.tagName.toLowerCase() === 'circle') {
        e.setAttribute('cx', -20);
        e.setAttribute('cy', -20);
      } else {
        e.setAttribute('transform', 'translate(-20, -20)');
      }
    }
  });
}

function highlightLink(hostId, isActive) {
  const line = el(`nd-line-${hostId}`);
  if (line) {
    if (isActive) line.classList.add('send');
    else line.classList.remove('send');
  }
}

function clearLinks() {
  ['pc-a', 'pc-b', 'pc-c', 'pc-d'].forEach(id => highlightLink(id, false));
}

window.selectNDDevice = function(id) {
  if (window.playSound) window.playSound('click');
  
  // Highlight clicked card visual border
  document.querySelectorAll('.nd-host-group, #nd-center-g').forEach(g => {
    g.querySelector('rect')?.setAttribute('stroke-width', '1.2');
  });
  
  if (id === 'central') {
    const centralG = el('nd-center-g');
    centralG?.querySelector('rect')?.setAttribute('stroke-width', '2.5');
    setDevInfo();
  } else {
    const hostG = el(`host-${id}`);
    hostG?.querySelector('rect')?.setAttribute('stroke-width', '2.5');
    const h = gh(id);
    if (h) {
      el('nd-info-content').innerHTML = `
        <div style="border-left: 3px solid var(--color-indigo); padding-left: 8px; font-family:var(--font-header);">
          <strong style="font-size: 0.82rem; color: var(--text-primary); display:block; margin-bottom:0.2rem;">Host ${h.label} Device</strong>
          <div style="display:flex; flex-direction:column; gap:0.2rem; font-size:0.68rem; margin-top:0.25rem;">
            <span><strong style="color:var(--text-secondary)">MAC:</strong> <code style="color:var(--color-success); font-family:var(--font-mono);">${h.mac}</code></span>
            <span><strong style="color:var(--text-secondary)">IP:</strong> <code style="color:var(--color-indigo); font-family:var(--font-mono);">${h.ip}</code></span>
            <span><strong style="color:var(--text-secondary)">Subnet:</strong> <code style="font-family:var(--font-mono);">${h.sub}/24</code></span>
            <span><strong style="color:var(--text-secondary)">Status:</strong> <span style="color:#22d3a5; font-weight:700;">ONLINE ✓</span></span>
          </div>
        </div>
      `;
    }
  }
};

function updateHostOptions() {
  ['nd-src-options','nd-dst-options'].forEach(containerId => {
    const c = el(containerId); if (!c) return;
    c.innerHTML = '';
    const isSrc = containerId === 'nd-src-options';
    hosts.forEach(h => {
      const b = document.createElement('button');
      b.className = 'nd-host-btn' + (h.id === (isSrc ? netState.src : netState.dst) ? ' active' : '');
      b.textContent = h.label;
      b.title = `${h.mac}\n${h.ip}`;
      b.addEventListener('click', () => {
        if (netState.animating) return;
        if (isSrc) netState.src = h.id; else netState.dst = h.id;
        c.querySelectorAll('.nd-host-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        window.selectNDDevice(h.id);
      });
      c.appendChild(b);
    });
  });
}

function setDevInfo() {
  const info = {
    hub: `<strong>Hub (Layer 1 &mdash; Physical)</strong><br>\u2022 Broadcasts incoming frames to ALL ports<br>\u2022 Does not build a MAC Address lookup table<br>\u2022 Shared medium = high probability of collisions<br>\u2022 Splits overall network bandwidth between hosts`,
    switch: `<strong>Switch (Layer 2 &mdash; Data Link)</strong><br>\u2022 Selectively forwards frames by matching destination MAC<br>\u2022 Learns source MAC addresses dynamically from traffic<br>\u2022 Each port operates as a separate collision domain<br>\u2022 Guarantees full dedicated bandwidth per host link`,
    router: `<strong>Router (Layer 3 &mdash; Network)</strong><br>\u2022 Forwards packets between different IP subnets<br>\u2022 Resolves paths via routing table lookups<br>\u2022 Interfaces: 192.168.1.x (Port A) &harr; 192.168.2.x (Port B)<br>\u2022 Operates at the Layer 3 Network boundary`
  };
  el('nd-info-content').innerHTML = info[netState.device] || info.hub;
}

function log(msg, cls) {
  const list = el('nd-log-list'); if (!list) return;
  const d = document.createElement('div');
  d.className = 'nd-log-item' + (cls ? ' nd-lg-'+cls : '');
  d.innerHTML = msg;
  list.appendChild(d);
  list.scrollTop = list.scrollHeight;
  // Update MAC table
  if (netState.macTable && Object.keys(netState.macTable).length > 0) {
    const tc = el('nd-table-content');
    if (tc) {
      tc.innerHTML = Object.entries(netState.macTable)
        .map(([mac, host]) => `<div class="mac-entry"><span class="mac-host">Host ${host}</span><span class="mac-addr">${mac}</span></div>`)
        .join('');
    }
  }
}

function animDot(dotId, x1, y1, x2, y2, ms, cb) {
  if (netState.abort) { hideDots(); if (cb) cb(); return; }
  const dot = el(dotId); if (!dot) { if (cb) cb(); return; }
  dot.style.display = 'block';
  const t0 = performance.now();
  function f(t) {
    if (netState.abort) { hideDots(); if (cb) cb(); return; }
    let p = Math.min((t - t0) / ms, 1);
    const currX = x1 + (x2 - x1) * p;
    const currY = y1 + (y2 - y1) * p;
    if (dot.tagName.toLowerCase() === 'circle') {
      dot.setAttribute('cx', currX);
      dot.setAttribute('cy', currY);
    } else {
      dot.setAttribute('transform', `translate(${currX}, ${currY})`);
    }
    if (p < 1) requestAnimationFrame(f); else if (cb) cb();
  }
  requestAnimationFrame(f);
}


function endAnim() {
  setTimeout(() => {
    hideDots();
    clearLinks();
    el('nd-send-btn').disabled = false;
    netState.animating = false;
  }, 400);
}

function sendPacket() {
  if (netState.animating) return;
  if (netState.src === netState.dst) { play('error'); if(window.showToast) window.showToast('Source and destination must differ.'); return; }
  play('click');
  const s = gh(netState.src), d = gh(netState.dst);
  if (!s || !d) return;
  netState.animating = true; netState.abort = false;
  el('nd-send-btn').disabled = true;
  const sc = coords[s.id], dc = coords[d.id];
  log(`${I.send} ${s.label} \u2192 ${d.label} [${d.mac}]`, 'send');

  // Phase 1: Source to Central Device
  highlightLink(s.id, true);
  animDot('nd-dot1', sc[0], sc[1], devC[0], devC[1], 450, () => {
    highlightLink(s.id, false); // clear source link

    if (netState.device === 'hub') {
      log(`${I.hub} HUB broadcasts to ALL ports`, 'hub');
      const others = hosts.filter(h => h.id !== s.id);
      
      // Highlight broadcast links
      others.forEach(o => highlightLink(o.id, true));
      
      animDot('nd-dot1', devC[0], devC[1], dc[0], dc[1], 450);
      animDot('nd-dot2', devC[0], devC[1], coords[others[0].id][0], coords[others[0].id][1], 450);
      animDot('nd-dot3', devC[0], devC[1], coords[others[1]?.id || others[0].id][0], coords[others[1]?.id || others[0].id][1], 450, () => {
        netState.colCnt++;
        if (netState.colCnt >= 2) { el('nd-crash').style.display = 'block'; log(`${I.warn} COLLISION \u2014 multiple broadcasts collide`, 'col'); }
        log(`${I.check} ${d.label} received (but so did others)`, 'recv');
        endAnim();
      });
    } else if (netState.device === 'switch') {
      const known = !!netState.macTable[d.mac];
      netState.macTable[s.mac] = s.label;
      log(`${I.brain} SWITCH learned: ${s.label} \u2192 ${s.mac}`, 'learn');
      
      if (known) {
        log(`${I.target} Forwarded to ${d.label} only (known MAC)`, 'sw');
        highlightLink(d.id, true);
        animDot('nd-dot1', devC[0], devC[1], dc[0], dc[1], 450, () => {
          log(`${I.check} ${d.label} received exclusively`, 'recv');
          endAnim();
        });
      } else {
        log(`${I.question} Unknown MAC \u2014 flooding all ports except source`, 'sw');
        const others = hosts.filter(h => h.id !== s.id);
        
        // Highlight flooded links
        others.forEach(o => highlightLink(o.id, true));
        
        animDot('nd-dot1', devC[0], devC[1], dc[0], dc[1], 450);
        animDot('nd-dot2', devC[0], devC[1], coords[others.find(h=>h.id!==d.id).id][0], coords[others.find(h=>h.id!==d.id).id][1], 450, () => {
          netState.macTable[d.mac] = d.label;
          log(`${I.check} ${d.label} received (switch now knows ${d.mac})`, 'recv');
          endAnim();
        });
        const rest = hosts.filter(h => h.id !== s.id && h.id !== d.id);
        if (rest.length > 1) animDot('nd-dot3', devC[0], devC[1], coords[rest[1].id][0], coords[rest[1].id][1], 450);
      }
    } else if (netState.device === 'router') {
      const same = s.sub === d.sub;
      log(`${I.search} ROUTER: lookup ${d.ip}`, 'router');
      if (same) {
        log(`${I.warn} ${s.label} & ${d.label} are on same subnet \u2014 use a Switch`, 'info');
        highlightLink(d.id, true);
        animDot('nd-dot1', devC[0], devC[1], dc[0], dc[1], 450, () => {
          log(`${I.check} ${d.label} received`, 'recv');
          endAnim();
        });
      } else {
        log(`${I.globe} Routing ${s.ip} \u2192 ${d.ip} across subnets`, 'router');
        highlightLink(d.id, true);
        animDot('nd-dot1', devC[0], devC[1], dc[0], dc[1], 450, () => {
          log(`${I.check} ${d.label} received (routed)`, 'recv');
          endAnim();
        });
      }
    }
  });
}


/* ===================================================================
   TAB 2 — OSI Sim
   =================================================================== */
let osiReady = false;
function initOSI() {
  if (osiReady) return;
  osiReady = true;
  initOSISim();
}

/* ===================================================================
   TAB 3 — ENCRYPTION
   =================================================================== */
let cryptoReady = false;
function initCrypto() {
  if (cryptoReady) return;
  cryptoReady = true;

  function genRSA() {
    const p = 61, q = 53, n = p * q, phi = (p - 1) * (q - 1);
    let e = 3; while (e < phi && gcd(e, phi) !== 1) e += 2;
    let d = modInv(e, phi);
    return { p, q, n, phi, e, d };
  }

  const alice = genRSA();
  const bob = genRSA();

  el('crypto-alice-pub').textContent = `(${alice.n}, ${alice.e})`;
  el('crypto-alice-priv').textContent = `(${alice.n}, ${alice.d})`;
  el('crypto-bob-pub').textContent = `(${bob.n}, ${bob.e})`;
  el('crypto-bob-priv').textContent = `(${bob.n}, ${bob.d})`;

  el('crypto-enc-btn-alice').addEventListener('click', () => {
    play('click');
    const plain = el('crypto-plain-alice').value.toUpperCase().replace(/[^A-Z]/g, '');
    if (!plain) { if(window.showToast) window.showToast('Enter letters A-Z only.'); return; }
    const nums = plain.split('').map(ch => ch.charCodeAt(0) - 65);
    const enc = nums.map(m => modPow(m, bob.e, bob.n));
    el('crypto-cipher-alice').textContent = enc.join(' ');
    el('crypto-cipher-status').innerHTML = `${I.lock} Encrypted with Bob\u2019s public key (${bob.n}, ${bob.e})`;
  });

  el('crypto-dec-btn-bob').addEventListener('click', () => {
    play('click');
    const raw = el('crypto-cipher-alice').textContent.trim();
    if (raw === '\u2014' || !raw) { if(window.showToast) window.showToast('Alice must encrypt a message first.'); return; }
    const nums = raw.split(/\s+/).map(Number);
    const dec = nums.map(c => modPow(c, bob.d, bob.n));
    const text = dec.map(n => String.fromCharCode(n + 65)).join('');
    el('crypto-decrypted-alice').innerHTML = `<strong style="color:var(--color-success);font-size:1.1rem">${text}</strong>`;
  });
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function modInv(a, m) { for (let x = 1; x < m; x++) { if ((a * x) % m === 1) return x; } return 1; }
function modPow(base, exp, mod) {
  let r = 1;
  for (let i = 0; i < exp; i++) r = (r * base) % mod;
  return r;
}

/* ===================================================================
   TAB — SUBNETTING & CIDR LAB
   =================================================================== */
let subnetReady = false;
function initSubnetLab() {
  if (subnetReady) { calculateSubnet(); return; }
  subnetReady = true;

  const ipInput = el('subnet-ip-input');
  const slider = el('subnet-cidr-slider');
  const prefixVal = el('subnet-prefix-val');

  if (ipInput) {
    ipInput.addEventListener('input', calculateSubnet);
  }
  if (slider) {
    slider.addEventListener('input', () => {
      if (prefixVal) prefixVal.textContent = `/${slider.value}`;
      calculateSubnet();
    });
  }

  qsa('.subnet-preset-btn', el('subnet-tab')).forEach(btn => {
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

  const firstOctet = (ipNum >>> 24) & 255;
  let ipClass = 'Class A';
  let defaultPrefix = 8;
  if (firstOctet >= 128 && firstOctet <= 191) { ipClass = 'Class B'; defaultPrefix = 16; }
  else if (firstOctet >= 192 && firstOctet <= 223) { ipClass = 'Class C'; defaultPrefix = 24; }
  else if (firstOctet >= 224 && firstOctet <= 239) { ipClass = 'Class D (Multicast)'; defaultPrefix = 0; }
  else if (firstOctet >= 240) { ipClass = 'Class E (Experimental)'; defaultPrefix = 0; }

  let scope = 'Public Internet';
  if ((firstOctet === 10) ||
      (firstOctet === 172 && ((ipNum >>> 16) & 255) >= 16 && ((ipNum >>> 16) & 255) <= 31) ||
      (firstOctet === 192 && ((ipNum >>> 16) & 255) === 168)) {
    scope = 'Private (RFC 1918)';
  } else if (firstOctet === 127) {
    scope = 'Loopback (RFC 1122)';
  } else if (firstOctet === 169 && ((ipNum >>> 16) & 255) === 254) {
    scope = 'Link-Local / APIPA';
  }

  if (grid) {
    const rows = [
      ['IP Address', `${numToIp(ipNum)} /${cidr}`],
      ['Network Address', numToIp(netNum)],
      ['Subnet Mask', numToIp(maskNum)],
      ['Wildcard Mask', numToIp(wildcardNum)],
      ['Broadcast Address', numToIp(bcastNum)],
      ['Usable Host Range', usableHosts > 0 ? `${numToIp(firstHostNum)} — ${numToIp(lastHostNum)}` : 'None'],
      ['Total Addresses', totalAddresses.toLocaleString()],
      ['Usable Hosts', usableHosts.toLocaleString()],
      ['IP Class', `${ipClass} (Default /${defaultPrefix})`],
      ['Address Scope', scope]
    ];

    grid.innerHTML = rows.map(([k, v]) => `
      <div class="subnet-calc-row">
        <span class="subnet-calc-k">${k}</span>
        <span class="subnet-calc-v">${v}</span>
      </div>
    `).join('');
  }

  if (binVis) {
    const ipParts = [(ipNum >>> 24) & 255, (ipNum >>> 16) & 255, (ipNum >>> 8) & 255, ipNum & 255];
    const maskParts = [(maskNum >>> 24) & 255, (maskNum >>> 16) & 255, (maskNum >>> 8) & 255, maskNum & 255];
    const netParts = [(netNum >>> 24) & 255, (netNum >>> 16) & 255, (netNum >>> 8) & 255, netNum & 255];

    function renderOctetBits(octetNum, octetIdx) {
      const binStr = numToBin8(octetNum);
      return binStr.split('').map((bit, bitIdx) => {
        const globalBitIdx = octetIdx * 8 + bitIdx;
        const isNet = globalBitIdx < cidr;
        const isSubnetBit = isNet && globalBitIdx >= defaultPrefix;
        let bitStyle = isNet ? (isSubnetBit ? 'background:#06b6d4;color:#fff' : 'background:#3b82f6;color:#fff') : 'background:#10b981;color:#fff';
        return `<span style="display:inline-block;width:15px;height:17px;line-height:17px;text-align:center;font-size:0.65rem;font-weight:700;border-radius:2px;margin:0 1px;${bitStyle}" title="Bit ${globalBitIdx + 1}: ${isNet ? 'Network Bit' : 'Host Bit'}">${bit}</span>`;
      }).join('');
    }

    binVis.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.5rem;font-family:var(--font-mono);font-size:0.75rem;margin-bottom:0.25rem">
        <span style="min-width:45px;color:var(--text-muted)">IP:</span>
        <div style="display:flex;align-items:center;gap:3px">
          ${ipParts.map((p, i) => `<span>${renderOctetBits(p, i)}</span>`).join('<span style="font-weight:700;color:var(--text-muted)">.</span>')}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;font-family:var(--font-mono);font-size:0.75rem;margin-bottom:0.25rem">
        <span style="min-width:45px;color:var(--text-muted)">Mask:</span>
        <div style="display:flex;align-items:center;gap:3px">
          ${maskParts.map((p, i) => `<span>${renderOctetBits(p, i)}</span>`).join('<span style="font-weight:700;color:var(--text-muted)">.</span>')}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;font-family:var(--font-mono);font-size:0.75rem;margin-bottom:0.4rem">
        <span style="min-width:45px;color:var(--text-muted)">Net:</span>
        <div style="display:flex;align-items:center;gap:3px">
          ${netParts.map((p, i) => `<span>${renderOctetBits(p, i)}</span>`).join('<span style="font-weight:700;color:var(--text-muted)">.</span>')}
        </div>
      </div>
      <div style="display:flex;gap:0.75rem;font-size:0.68rem;color:var(--text-secondary)">
        <span style="display:flex;align-items:center;gap:0.25rem"><span style="width:10px;height:10px;border-radius:2px;background:#3b82f6;display:inline-block"></span> Network Bits (${cidr})</span>
        <span style="display:flex;align-items:center;gap:0.25rem"><span style="width:10px;height:10px;border-radius:2px;background:#10b981;display:inline-block"></span> Host Bits (${32 - cidr})</span>
      </div>
    `;
  }

  if (tableBody) {
    const parentPrefix = Math.max(0, Math.min(cidr - 1, cidr <= 16 ? 8 : (cidr <= 24 ? 16 : 24)));
    const parentBlockSize = Math.pow(2, 32 - parentPrefix);
    const parentNetNum = (ipNum & (parentPrefix === 0 ? 0 : (0xFFFFFFFF << (32 - parentPrefix)) >>> 0)) >>> 0;
    
    const sliceCount = Math.min(32, parentBlockSize / totalAddresses);
    const rowsHtml = [];

    for (let i = 0; i < sliceCount; i++) {
      const sNet = (parentNetNum + i * totalAddresses) >>> 0;
      const sBcast = (sNet + totalAddresses - 1) >>> 0;
      const isCurrent = sNet === netNum;
      const sFirst = cidr >= 31 ? sNet : sNet + 1;
      const sLast = cidr >= 31 ? sBcast : sBcast - 1;

      rowsHtml.push(`
        <tr style="${isCurrent ? 'background:rgba(56,189,248,0.18);font-weight:700;' : ''}">
          <td style="padding:0.4rem 0.6rem;border-bottom:1px solid var(--border-color)">${i + 1}${isCurrent ? ' ★' : ''}</td>
          <td style="padding:0.4rem 0.6rem;border-bottom:1px solid var(--border-color)"><code style="color:var(--color-indigo)">${numToIp(sNet)}/${cidr}</code></td>
          <td style="padding:0.4rem 0.6rem;border-bottom:1px solid var(--border-color)"><code>${numToIp(sFirst)} – ${numToIp(sLast)}</code></td>
          <td style="padding:0.4rem 0.6rem;border-bottom:1px solid var(--border-color)"><code>${numToIp(sBcast)}</code></td>
        </tr>
      `);
    }

    tableBody.innerHTML = rowsHtml.join('');
  }
}

/* ===================================================================
   TAB 4 — PARITY CHECK
   =================================================================== */
let parityReady = false;
let parityBits = [];
function initParity() {
  if (parityReady) return;
  parityReady = true;
  const c = el('parity-input-bits');
  parityBits = [];
  for (let i = 0; i < 7; i++) {
    const v = Math.random() < 0.5 ? 0 : 1;
    parityBits.push(v);
    const b = document.createElement('span');
    b.className = 'parity-bit' + (v ? ' on' : '');
    b.textContent = v;
    b.dataset.idx = i;
    b.addEventListener('click', () => {
      parityBits[i] = parityBits[i] ? 0 : 1;
      b.textContent = parityBits[i];
      b.className = 'parity-bit' + (parityBits[i] ? ' on' : '');
    });
    c.appendChild(b);
  }

  el('parity-send-btn').addEventListener('click', () => {
    play('click');
    const ones = parityBits.filter(v => v === 1).length;
    const parityBit = ones % 2 === 0 ? 0 : 1;
    const sent = [...parityBits, parityBit];
    const rc = el('parity-recv-bits');
    rc.innerHTML = '';
    sent.forEach((v, i) => {
      const b = document.createElement('span');
      b.className = 'parity-bit recv' + (v ? ' on' : '') + (i === 7 ? ' parity' : '');
      b.textContent = v;
      b.dataset.idx = i;
      rc.appendChild(b);
    });
    const totalOnes = sent.filter(v => v === 1).length;
    const ok = totalOnes % 2 === 0;
    const res = el('parity-result');
    res.className = 'parity-result' + (ok ? ' ok' : ' err');
    res.innerHTML = ok
      ? `${I.check} Parity OK (${totalOnes} ones = even)`
      : `${I.cross} Error detected! (${totalOnes} ones = odd)`;
  });

  el('parity-flip-btn').addEventListener('click', () => {
    play('click');
    const idx = Math.floor(Math.random() * 7);
    parityBits[idx] = parityBits[idx] ? 0 : 1;
    const bits = el('parity-input-bits').children;
    if (bits[idx]) {
      bits[idx].textContent = parityBits[idx];
      bits[idx].className = 'parity-bit' + (parityBits[idx] ? ' on' : '');
    }
  });
}
