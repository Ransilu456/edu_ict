import './common.js';

let osiReady = false;
let osiAbort = false;
let osiAnimTimer = null;
let rsaGenerated = false;
let rsaKeys = {};

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
  gear: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="3"/><path d="M10 2v2.2M10 15.8V18M4.2 4.2l1.55 1.55M14.25 14.25l1.55 1.55M2 10h2.2M15.8 10H18M4.2 15.8l1.55-1.55M14.25 5.75l1.55-1.55"/></svg>',
  play: '<svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M6 4l10 6-10 6V4z"/></svg>',
  pause: '<svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><rect x="5" y="4" width="4" height="12" rx="1"/><rect x="11" y="4" width="4" height="12" rx="1"/></svg>',
};

const LAYERS = [
  { id: 7, name: 'Application', short: 'App', pdu: 'Data', tcpIp: 'Application', icon: I.doc, color: '#ef4444', desc: 'User-facing protocols — HTTP, FTP, SMTP, DNS. Provides network services directly to software applications.', analogy: 'Like writing a letter — you decide what to say and who to send it to.' },
  { id: 6, name: 'Presentation', short: 'Pres', pdu: 'Data', tcpIp: 'Application', icon: I.wrench, color: '#f97316', desc: 'Data formatting, syntax translation, encryption (TLS/SSL), and compression. Prepares data for transmission.', analogy: 'Like translating your letter into a standard postal format, and sealing it in an envelope.' },
  { id: 5, name: 'Session', short: 'Sess', pdu: 'Data', tcpIp: 'Application', icon: I.link, color: '#eab308', desc: 'Establishes, maintains, and synchronizes dialog sessions between applications (checkpoints, full/half duplex).', analogy: 'Like picking up the telephone, ensuring the connection is open, and saying hello.' },
  { id: 4, name: 'Transport', short: 'Trans', pdu: 'Segment / Datagram', tcpIp: 'Transport', icon: I.box, color: '#22c55e', desc: 'End-to-end delivery, port multiplexing, segmentation, flow control, and error recovery. TCP (reliable) / UDP (fast).', analogy: 'Like numbering individual boxes so the receiver can reassemble them in order and verify none are lost.' },
  { id: 3, name: 'Network', short: 'Net', pdu: 'Packet', tcpIp: 'Internet', icon: I.globe, color: '#3b82f6', desc: 'Logical addressing (IP) and routing across disparate networks. Routers and Layer-3 switches operate here.', analogy: 'Like writing the complete street, city, and postal code address so postal trucks route it correctly.' },
  { id: 2, name: 'Data Link', short: 'Link', pdu: 'Frame', tcpIp: 'Network Access', icon: I.plug, color: '#818cf8', desc: 'Physical MAC addressing, framing, and error checking (CRC/FCS). Switches, Bridges, and NICs operate here.', analogy: 'Like handing the package to the local neighborhood delivery driver who knows the exact doorstep.' },
  { id: 1, name: 'Physical', short: 'Phys', pdu: 'Bits', tcpIp: 'Network Access', icon: I.bolt, color: '#c084fc', desc: 'Transmits raw unstructured bitstreams (0s & 1s) over copper cables, optical fibers, or wireless radio frequencies.', analogy: 'Like the electric voltage or light pulses propagating across the physical wires.' },
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

const ERROR_SEQUENCE = [null, 'checksum', 'mac', 'ttl'];
const ERROR_LABELS = {
  'null': 'Error: Off',
  checksum: 'Error: Checksum',
  mac: 'Error: Unknown MAC',
  ttl: 'Error: TTL Expired',
};

// sim state
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
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
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

// layout
function buildOSILayout() {
  el('osi-container').innerHTML = `
<div class="osi-topbar" id="osi-topbar">
  <div class="osi-control-strip">
    <div class="osi-ctrl-group" data-group="Message">
      <span class="osi-group-tag">Simulation</span>
      <label>Message <input type="text" id="osi-msg" value="HELLO" size="6"></label>
      <label>Application <select id="osi-protocol"><option>HTTP</option><option>HTTPS</option><option>FTP</option><option>SMTP</option><option>DNS</option></select></label>
      <label>Transport <select id="osi-transport"><option>TCP</option><option>UDP</option></select></label>
    </div>
    <div class="osi-ctrl-group" data-group="Run">
      <span class="osi-group-tag">Playback</span>
      <button class="osi-btn primary" id="osi-step-btn">${I.arrowR} Run</button>
      <button class="osi-btn" id="osi-auto-btn">${I.play} Auto</button>
      <button class="osi-btn" id="osi-speed-btn" title="Cycle simulation speed (0.5x, 1x, 2x, 4x)">1x</button>
      <button class="osi-btn" id="osi-reset-btn">${I.refresh} Reset</button>
    </div>
    <div class="osi-ctrl-group osi-tools-group" data-group="View">
      <span class="osi-group-tag">Tools</span>
      <button class="osi-btn" id="osi-binary-btn">Bin</button>
      <button class="osi-btn" id="osi-hex-btn">Hex</button>
      <button class="osi-btn" id="osi-error-btn" title="Cycle through simulated transmission errors">${I.warn} Error: Off</button>
      <button class="osi-btn" id="osi-insp-btn">${I.list} Inspect</button>
      <button class="osi-btn" id="osi-compare-btn">${I.layers} Compare</button>
      <button class="osi-btn" id="osi-crypto-btn">${I.shield} RSA</button>
    </div>
  </div>
</div>

<div class="osi-main">
  <div class="osi-alice" id="osi-alice">
    <div class="osi-host-header">${I.laptop} Alice <small>Sender</small></div>
    <div class="osi-stack" id="osi-alice-stack"></div>
  </div>
  <div class="osi-center">
    <div class="osi-stage-head"><span class="osi-stage-dot"></span><strong>Packet journey</strong><span class="osi-stage-hint">Alice → network → Bob</span></div>
    <div class="osi-ready-card"><span class="osi-ready-icon">${I.send}</span><div><strong>Ready to transmit</strong><small>Press Auto to start.</small></div></div>
    <div class="osi-packet-vis" id="osi-packet-vis">
      <div class="osi-packet-wrap" id="osi-packet-wrap"></div>
    </div>
    <div class="osi-cable-area">
      <div class="osi-cable-row"><span class="osi-cable-tag">Alice link</span><div class="osi-cable" id="osi-cable-left"><div class="osi-cable-track" id="osi-cable-track1"></div></div></div>
      <div class="osi-switch-area" id="osi-switch-area">
        <div class="osi-switch-device">
          <div class="osi-switch-icon switch" id="osi-switch-icon">${I.switch_}</div>
          <div class="osi-switch-label" id="osi-switch-label">Switch</div>
        </div>
        <div class="osi-switch-status" id="osi-switch-status">Waiting…</div>
      </div>
      <div class="osi-cable-row"><span class="osi-cable-tag">Bob link</span><div class="osi-cable" id="osi-cable-right"><div class="osi-cable-track" id="osi-cable-track2"></div></div></div>
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
<div class="osi-crypto-modal" id="osi-compare-modal">
  <div class="osi-crypto-box" style="max-width:700px;width:94%">
    <div class="osi-crypto-title">${I.layers} OSI 7-Layer vs TCP/IP 4-Layer Architecture</div>
    <div style="max-height:360px;overflow-y:auto;margin:0.8rem 0;border:1px solid var(--border-color);border-radius:8px">
      <table style="width:100%;border-collapse:collapse;font-size:0.75rem;text-align:left">
        <thead>
          <tr style="background:var(--bg-tertiary);border-bottom:1px solid var(--border-color)">
            <th style="padding:0.5rem 0.6rem">OSI Layer</th>
            <th style="padding:0.5rem 0.6rem">PDU</th>
            <th style="padding:0.5rem 0.6rem">TCP/IP Layer</th>
            <th style="padding:0.5rem 0.6rem">Key Protocols & Hardware</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid var(--border-color)">
            <td style="padding:0.45rem 0.6rem"><strong style="color:#ef4444">7. Application</strong></td>
            <td style="padding:0.45rem 0.6rem">Data</td>
            <td style="padding:0.45rem 0.6rem" rowspan="3"><strong style="color:#f97316">Application Layer</strong><br><small style="color:var(--text-muted)">User processes & representation</small></td>
            <td style="padding:0.45rem 0.6rem">HTTP, HTTPS, DNS, FTP, SMTP, DHCP</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border-color)">
            <td style="padding:0.45rem 0.6rem"><strong style="color:#f97316">6. Presentation</strong></td>
            <td style="padding:0.45rem 0.6rem">Data</td>
            <td style="padding:0.45rem 0.6rem">TLS/SSL, JPEG, ASCII, MPEG</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border-color)">
            <td style="padding:0.45rem 0.6rem"><strong style="color:#eab308">5. Session</strong></td>
            <td style="padding:0.45rem 0.6rem">Data</td>
            <td style="padding:0.45rem 0.6rem">NetBIOS, RPC, Sockets, PPTP</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border-color)">
            <td style="padding:0.45rem 0.6rem"><strong style="color:#22c55e">4. Transport</strong></td>
            <td style="padding:0.45rem 0.6rem">Segment (TCP) / Datagram (UDP)</td>
            <td style="padding:0.45rem 0.6rem"><strong style="color:#22c55e">Transport Layer</strong><br><small style="color:var(--text-muted)">Host-to-Host reliability</small></td>
            <td style="padding:0.45rem 0.6rem">TCP, UDP, Port Numbers (e.g. 80, 443)</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border-color)">
            <td style="padding:0.45rem 0.6rem"><strong style="color:#3b82f6">3. Network</strong></td>
            <td style="padding:0.45rem 0.6rem">Packet</td>
            <td style="padding:0.45rem 0.6rem"><strong style="color:#3b82f6">Internet Layer</strong><br><small style="color:var(--text-muted)">Logical addressing & routing</small></td>
            <td style="padding:0.45rem 0.6rem">IPv4, IPv6, ICMP, ARP, <strong>Router</strong></td>
          </tr>
          <tr style="border-bottom:1px solid var(--border-color)">
            <td style="padding:0.45rem 0.6rem"><strong style="color:#818cf8">2. Data Link</strong></td>
            <td style="padding:0.45rem 0.6rem">Frame</td>
            <td style="padding:0.45rem 0.6rem" rowspan="2"><strong style="color:#818cf8">Network Access / Link</strong><br><small style="color:var(--text-muted)">Physical hardware delivery</small></td>
            <td style="padding:0.45rem 0.6rem">Ethernet (802.3), Wi-Fi (802.11), <strong>Switch</strong>, MAC</td>
          </tr>
          <tr>
            <td style="padding:0.45rem 0.6rem"><strong style="color:#c084fc">1. Physical</strong></td>
            <td style="padding:0.45rem 0.6rem">Bits</td>
            <td style="padding:0.45rem 0.6rem">Copper Cables, Fiber, <strong>Hub</strong>, Repeaters</td>
          </tr>
        </tbody>
      </table>
    </div>
    <button class="osi-btn primary" id="osi-compare-close" style="align-self:flex-end">Close</button>
  </div>
</div>
<div class="osi-crypto-modal" id="osi-crypto-modal">
  <div class="osi-crypto-box" id="osi-crypto-box">
    <div class="osi-crypto-title">${I.shield} RSA Encryption Visualizer</div>
    <div id="osi-crypto-steps"></div>
    <button class="osi-btn" id="osi-crypto-close" style="align-self:flex-end">Close</button>
  </div>
</div>`;

  const aliceStack = el('osi-alice-stack'); const bobStack = el('osi-bob-stack');
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
  div.style.setProperty('--osi-active-shadow', l.color);
  div.style.setProperty('--osi-layer-color', l.color);
  div.innerHTML = `<div class="osi-layer-top">
      <span class="osi-layer-badge" style="background:${l.color}">${l.id}</span>
      <span class="osi-layer-icon" style="color:${l.color}">${l.icon}</span>
      <span class="osi-layer-text"><span class="osi-layer-name">${l.name}</span><span class="osi-layer-sub">${l.tcpIp} · ${l.pdu}</span></span>
    </div>
    <div class="osi-layer-data" id="osi-${side}-l${l.id}-data"></div>`;
  div.title = `${l.name} Layer\nPDU: ${l.pdu}\n${l.desc}\n\n${l.analogy}`;
  div.addEventListener('click', () => showLayerInfo(l));
  return div;
}

function showLayerInfo(l) {
  play('click');
  if (window.showAlert) window.showAlert(
    `<div style="text-align:left;line-height:1.5;">
      <p style="margin-bottom:0.5rem"><strong style="color:${l.color};font-size:1.1rem">Layer ${l.id}: ${l.name} Layer</strong></p>
      <p style="margin-bottom:0.3rem"><strong>PDU (Protocol Data Unit):</strong> <span style="color:#22d3a5;font-weight:700">${l.pdu}</span></p>
      <p style="margin-bottom:0.3rem"><strong>TCP/IP Model Equivalent:</strong> <span style="color:#38bdf8;font-weight:700">${l.tcpIp} Layer</span></p>
      <p style="margin-bottom:0.6rem;color:var(--text-secondary);font-size:0.85rem">${l.desc}</p>
      <div style="background:rgba(255,255,255,0.05);padding:8px 12px;border-radius:6px;border-left:3px solid ${l.color}">
        <small style="color:var(--text-muted)">Real-World Analogy:</small><br>
        <em>${l.analogy}</em>
      </div>
    </div>`,
    `Layer ${l.id} — ${l.name}`
  );
}

function bindOSIControls() {
  el('osi-step-btn').addEventListener('click', stepOSI);
  el('osi-auto-btn').addEventListener('click', () => {
    play('click');
    state.autoMode = !state.autoMode;
    const btn = el('osi-auto-btn');
    btn.classList.toggle('active', state.autoMode);
    btn.innerHTML = state.autoMode ? `${I.pause} Pause` : `${I.play} Auto`;
    if (state.autoMode && state.step < STEP_NAMES.length - 1) autoStep();
  });

  const speedBtn = el('osi-speed-btn');
  if (speedBtn) {
    const speeds = [0.5, 1, 2, 4];
    speedBtn.addEventListener('click', () => {
      play('click');
      const idx = speeds.indexOf(state.speed);
      state.speed = speeds[(idx + 1) % speeds.length];
      speedBtn.textContent = `${state.speed}x`;
    });
  }

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

  const compModal = el('osi-compare-modal');
  const compBtn = el('osi-compare-btn');
  const compClose = el('osi-compare-close');
  if (compBtn && compModal) {
    compBtn.addEventListener('click', () => {
      play('click');
      compModal.classList.add('open');
    });
  }
  if (compClose && compModal) {
    compClose.addEventListener('click', () => {
      compModal.classList.remove('open');
    });
  }
  if (compModal) {
    compModal.addEventListener('click', (e) => {
      if (e.target === compModal) compModal.classList.remove('open');
    });
  }

  // Error simulation toggle
  const errorBtn = el('osi-error-btn');
  if (errorBtn) {
    errorBtn.addEventListener('click', () => {
      play('click');
      const idx = ERROR_SEQUENCE.indexOf(state.errorType);
      state.errorType = ERROR_SEQUENCE[(idx + 1) % ERROR_SEQUENCE.length];
      state.errorMode = !!state.errorType;
      errorBtn.innerHTML = `${I.warn} ${ERROR_LABELS[String(state.errorType)]}`;
      errorBtn.classList.toggle('active', state.errorMode);

      // Auto-configure network settings so the chosen error scenario is reachable
      if (state.errorType === 'mac') {
        el('osi-device').value = 'switch';
      } else if (state.errorType === 'ttl') {
        el('osi-device').value = 'router';
        el('osi-subnet').value = 'diff';
      }
      resetOSI();
    });
  }

  ['msg', 'srcip', 'dstip', 'protocol', 'transport', 'device', 'subnet'].forEach(id => {
    const inp = el('osi-' + id);
    if (inp) inp.addEventListener('change', () => {
      if (state.step < 0) {
        readInputs();
        updateSettingsSummary();
        if (state.showDetails) updateInspector();
      }
    });
  });
}

function readInputs() {
  state.msg = el('osi-msg').value.trim() || 'HELLO';
  state.protocol = el('osi-protocol').value;
  state.transport = el('osi-transport').value;
  state.sessionId = Math.floor(Math.random() * 90000) + 10000;
}

function updateSettingsSummary() {
  const s = el('osi-settings-summary');
  if (s) s.textContent = `${state.device === 'switch' ? 'Switch' : 'Router'} · ${state.sameSubnet ? 'Same subnet' : 'Different subnet'}`;
}


function resetOSI() {
  osiAbort = true;
  if (osiAnimTimer) { clearTimeout(osiAnimTimer); osiAnimTimer = null; }
  osiAbort = false;
  state.step = -1;
  state.autoMode = false;
  const autoBtn = el('osi-auto-btn');
  autoBtn.classList.remove('active');
  autoBtn.innerHTML = `${I.play} Auto`;
  el('osi-step-btn').disabled = false;
  el('osi-step-btn').innerHTML = `${I.arrowR} Next Step`;
  el('osi-bits-display').innerHTML = '';
  el('osi-hex-display').innerHTML = '';
  el('osi-error-overlay').classList.remove('show');
  el('osi-error-overlay').innerHTML = '';
  el('osi-switch-status').textContent = 'Waiting\u2026';
  el('osi-insp-body').innerHTML = '';
  hideCablePulses();
  readInputs();
  updateSettingsSummary();
  pkt = {};

  LAYERS.forEach(l => {
    ['alice', 'bob'].forEach(side => {
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

// error handling
function triggerError(message) {
  play('error');
  const overlay = el('osi-error-overlay');
  if (overlay) {
    overlay.innerHTML = `${I.warn} ${message}`;
    overlay.classList.add('show');
  }
  state.autoMode = false;
  if (osiAnimTimer) { clearTimeout(osiAnimTimer); osiAnimTimer = null; }
  const autoBtn = el('osi-auto-btn');
  if (autoBtn) { autoBtn.classList.remove('active'); autoBtn.innerHTML = `${I.play} Auto`; }
  const stepBtn = el('osi-step-btn');
  if (stepBtn) { stepBtn.disabled = true; stepBtn.textContent = 'Reset to retry'; }
  if (stepText) stepText.textContent = `${STEP_NAMES[state.step]} — ERROR`;
}

// steps
function stepOSI() {
  if (state.step >= STEP_NAMES.length - 1) return;
  play('click');
  state.step++;
  osiAbort = false;

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

  if (state.step >= STEP_NAMES.length - 1 && !el('osi-step-btn').disabled === false) {
  }

  if (state.step >= STEP_NAMES.length - 1) {
    const stepBtn = el('osi-step-btn');
    if (!stepBtn.disabled) {
      stepBtn.textContent = 'Complete';
      stepBtn.disabled = true;
    }
    state.autoMode = false;
    const autoBtn = el('osi-auto-btn');
    autoBtn.classList.remove('active');
    autoBtn.innerHTML = `${I.play} Auto`;
  }
}

function autoStep() {
  if (osiAbort || !state.autoMode || state.step >= STEP_NAMES.length - 1) return;
  const delay = Math.max(100, 600 - state.speed * 50);
  stepOSI();
  if (state.autoMode) osiAnimTimer = setTimeout(autoStep, delay);
}

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
      dat.innerHTML = `Data: &quot;${esc(state.msg)}&quot;`;
      blk.title = `Application Layer\nCreates ${state.protocol} request data: "${state.msg}"`;
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
    case 4: {
      const proto = state.transport;
      if (state.errorType === 'checksum') {
        const original = parseInt(pkt.checksum, 16) || 0;
        const corrupted = (original ^ 0xFF).toString(16).toUpperCase().padStart(4, '0');
        dat.innerHTML = `<span style="color:#ef4444">${proto} checksum MISMATCH — expected ${pkt.checksum}, recomputed ${corrupted}</span>`;
        blk.className = 'osi-layer-block error';
        triggerError('Checksum verification failed at the Transport layer. The segment was corrupted in transit, so it is discarded and never reaches the Session layer.');
        break;
      }
      dat.innerHTML = `<span style="color:${proto === 'TCP' ? '#22c55e' : '#f97316'}">${proto}</span> Stripped | Port ${pkt.srcPort}\u2192${pkt.dstPort} | Checksum ${pkt.checksum} ${I.check}`;
      break;
    }
    case 5:
      dat.innerHTML = `Session ${pkt.sessionId} verified <span style="color:var(--color-success)">${I.check}</span>`;
      break;
    case 6:
      if (state.protocol === 'HTTPS') {
        dat.textContent = 'Decrypted (AES-256) \u2192 UTF-8 \u2192 OK';
      } else {
        dat.textContent = 'UTF-8 Decoded';
      }
      break;
    case 7:
      dat.innerHTML = `<span style="color:var(--color-success);font-weight:800;font-size:0.85rem">${I.doc} &quot;${esc(state.msg)}&quot;</span>`;
      break;
  }
}

function completeDelivery() {
  const bob7 = el('osi-bob-l7');
  const bob7d = el('osi-bob-l7-data');
  if (bob7) bob7.className = 'osi-layer-block done active';
  if (bob7d) bob7d.innerHTML = `<span style="color:var(--color-success);font-weight:800;font-size:0.85rem">${I.doc} &quot;${esc(state.msg)}&quot;</span>`;
  LAYERS.forEach(l => {
    const al = el(`osi-alice-l${l.id}`);
    if (al) al.className = 'osi-layer-block done';
    const bl = el(`osi-bob-l${l.id}`);
    if (bl) bl.className = 'osi-layer-block done';
  });
  updatePktVis();
}

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
  ['osi-cable-track1', 'osi-cable-track2'].forEach(id => {
    const t = el(id);
    if (t) t.innerHTML = '';
  });
}

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
      if (state.errorType === 'mac') {
        status.innerHTML = `${I.cross} Destination MAC ${state.dstMAC} not found — ARP failed, frame dropped`;
        triggerError('The switch has no entry for the destination MAC address and no ARP reply arrived in time. The frame is dropped at the switch and never reaches Bob.');
        return;
      }
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
        if (state.errorType === 'ttl') {
          pkt.ttl = 0;
          status.innerHTML = `${I.cross} TTL reached 0 — packet expired, router discards it (ICMP Time Exceeded)`;
          triggerError('The Time To Live counter reached zero. Routers discard packets whose TTL expires so they cannot loop forever across the network.');
          return;
        }
        const newMAC = state.dstMAC;
        status.innerHTML = `${I.refresh} Stripped old Ethernet frame<br>${I.box} New frame with MAC ${newMAC}<br>${I.clock} TTL decreased to ${pkt.ttl}<br>${I.globe} IP unchanged: ${state.dstIP}`;
      }, 500);
    } else {
      status.innerHTML = `${I.warn} Same subnet \u2014 forwarding directly (no routing needed)`;
    }
  }
}

function updateInspector() {
  const body = el('osi-insp-body');
  if (!body) return;
  const sections = [];

  sections.push({
    title: `${I.doc} Application`, bg: '#ef4444', fields: [
      ['Data', `&quot;${esc(state.msg)}&quot;`], ['Protocol', esc(state.protocol)], ['Transport', esc(state.transport)],
    ]
  });

  if (state.protocol === 'HTTPS') {
    sections.push({
      title: `${I.lock} Presentation (TLS)`, bg: '#f97316', fields: [
        ['Encryption', 'AES-256'], ['Encoding', 'Base64'], ['Status', pkt.presInfo || 'Pending\u2026'],
      ]
    });
  } else {
    sections.push({
      title: `${I.wrench} Presentation`, bg: '#f97316', fields: [
        ['Encoding', 'UTF-8'], ['Status', pkt.presInfo || 'Pending\u2026'],
      ]
    });
  }

  sections.push({
    title: `${I.link} Session`, bg: '#eab308', fields: [
      ['Session ID', pkt.sessionId || '\u2014'],
      ['Status', state.step >= 2 || state.step >= 14 ? `${I.check} Established` : 'Pending\u2026'],
    ]
  });

  sections.push({
    title: `${I.box} ${state.transport}`, bg: '#22c55e', fields: [
      ['Source Port', pkt.srcPort || '\u2014'], ['Dest Port', pkt.dstPort || '\u2014'],
      ['Sequence #', pkt.seqNum || '\u2014'], ['Checksum', pkt.checksum || '\u2014'],
    ]
  });

  sections.push({
    title: `${I.globe} Network`, bg: '#3b82f6', fields: [
      ['Source IP', state.srcIP], ['Dest IP', state.dstIP],
      ['TTL', pkt.ttl || state.ttl], ['Protocol', state.transport],
    ]
  });

  sections.push({
    title: `${I.plug} Data Link`, bg: '#818cf8', fields: [
      ['Source MAC', state.srcMAC], ['Dest MAC', pkt.dstMAC || state.dstMAC],
      ['FCS', pkt.fcs || '\u2014'],
    ]
  });

  if (state.showBinary) {
    sections.push({
      title: `${I.bolt} Physical (Binary)`, bg: '#c084fc', fields: [
        ['Bits', (pkt.bits || strToBin(state.msg)).slice(0, 80) + '\u2026'],
      ]
    });
  }

  if (state.errorMode) {
    sections.unshift({
      title: `${I.warn} Simulation`, bg: '#ef4444', fields: [
        ['Error scenario', ERROR_LABELS[String(state.errorType)].replace('Error: ', '')],
      ]
    });
  }

  body.innerHTML = sections.map(s => `
    <div class="osi-insp-section" style="border-left:3px solid ${s.bg}">
      <div class="osi-insp-section-header" style="background:${s.bg}22">${s.title}</div>
      <div class="osi-insp-section-body">
        ${s.fields.map(f => `<div class="field"><span class="label">${f[0]}</span><span class="value">${f[1]}</span></div>`).join('')}
      </div>
    </div>`).join('');
}

// packet view
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
      { label: 'Data', color: '#ef4444', det: `&quot;${esc(state.msg)}&quot;` },
    ];
    return all.filter(x => x.show !== false).map(x => l(x.label, x.color, x.det)).join('');
  }

  if (step < 0) {
    wrap.innerHTML = `<div class="osi-packet-placeholder"> Press Next Step or Auto to start</div>`;
  } else if (step >= 0 && step <= 6) {

    const encLayers = [];
    if (step >= 0) encLayers.push({ label: 'Data', color: '#ef4444', det: `&quot;${esc(state.msg)}&quot;` });
    if (step >= 1) encLayers.push({ label: state.protocol === 'HTTPS' ? 'TLS' : 'Pres', color: '#f97316', det: state.protocol === 'HTTPS' ? 'AES-256' : 'UTF-8' });
    if (step >= 2) encLayers.push({ label: 'Session', color: '#eab308', det: `ID: ${state.sessionId}` });
    if (step >= 3) encLayers.push({ label: state.transport, color: '#22c55e', det: `Port ${pkt.srcPort || '?'}\u2192${pkt.dstPort || '?'}` });
    if (step >= 4) encLayers.push({ label: 'IP', color: '#3b82f6', det: `${state.srcIP} \u2192 ${state.dstIP}` });
    if (step >= 5) encLayers.push({ label: 'MAC', color: '#818cf8', det: `${state.srcMAC} \u2192 ${pkt.dstMAC || state.dstMAC}` });
    if (step >= 6) encLayers.push({ label: 'Bits', color: '#c084fc', det: '' });
    wrap.innerHTML = encLayers.map(x => l(x.label, x.color, x.det)).join('');
  } else if (step >= 7 && step <= 9) {

    wrap.innerHTML = buildLayers();
  } else if (step >= 10) {

    wrap.innerHTML = buildLayers(step - 10);
  } else {
    wrap.innerHTML = l('Data', '#ef4444', `&quot;${esc(state.msg)}&quot;`);
  }
}

// rsa visualizer
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
    { label: 'Step 3: Calculate phi(n) = (p-1)(q-1)', math: `phi = (${p - 1}) x (${q - 1}) = ${phi}`, result: phi.toString() },
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