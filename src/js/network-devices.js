import './common.js';

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
}
window.initNetworkDevices = initNetworkDevices;
window.cleanupNetworkDevices = cleanupNetworkDevices;

function el(s) { return document.getElementById(s); }
function qs(s, p) { return (p || document).querySelector(s); }
function qsa(s, p) { return (p || document).querySelectorAll(s); }
function play(n) { if (window.playSound) window.playSound(n); }

function buildNDLayout() {
  el('nd-lab-container').innerHTML = `
<div class="nd-main">
  <div class="nd-tabs">
    <button class="nd-tab active" data-ndtab="network-tab">Network Devices</button>
    <button class="nd-tab" data-ndtab="osi-tab">OSI Model</button>
    <button class="nd-tab" data-ndtab="crypto-tab">Encryption</button>
    <button class="nd-tab" data-ndtab="parity-tab">Parity Check</button>
  </div>

  <!-- ====== TAB 1: NETWORK DEVICES ====== -->
  <div class="nd-tab-content active" id="network-tab">
    <div class="nd-layout">
      <div class="nd-left">
        <div class="nd-title-sm">Network Devices Lab</div>
        <div class="nd-subtitle">Hub · Switch · Router</div>
        <div class="nd-device-selector">
          <button class="nd-device-btn active" data-device="hub">Hub (L1)</button>
          <button class="nd-device-btn" data-device="switch">Switch (L2)</button>
          <button class="nd-device-btn" data-device="router">Router (L3)</button>
        </div>
        <div class="nd-controls">
          <div class="nd-row">
            <div><label class="nd-label">Source</label><div class="nd-host-options" id="nd-src-options"></div></div>
            <div><label class="nd-label">Dest</label><div class="nd-host-options" id="nd-dst-options"></div></div>
          </div>
          <button class="btn-primary" id="nd-send-btn" style="flex:none;padding:0.5rem 1rem;font-size:0.82rem">Send Packet</button>
        </div>
        <div class="nd-card"><div class="nd-card-title">Device Info</div><div id="nd-info-content"></div></div>
        <div class="nd-card"><div class="nd-card-title" id="nd-table-title">MAC Table</div><div id="nd-table-content"><em>No activity yet</em></div></div>
      </div>
      <div class="nd-right">
        <svg class="nd-svg" viewBox="0 0 200 140">
          <line class="nd-line" x1="26" y1="28" x2="78" y2="68"/>
          <line class="nd-line" x1="26" y1="112" x2="78" y2="72"/>
          <line class="nd-line" x1="122" y1="68" x2="174" y2="28"/>
          <line class="nd-line" x1="122" y1="72" x2="174" y2="112"/>
          <circle class="nd-host" cx="20" cy="20" r="8"/><text class="nd-hlabel" x="20" y="17">A</text>
          <circle class="nd-host" cx="20" cy="120" r="8"/><text class="nd-hlabel" x="20" y="117">B</text>
          <circle class="nd-host" cx="180" cy="20" r="8"/><text class="nd-hlabel" x="180" y="17">C</text>
          <circle class="nd-host" cx="180" cy="120" r="8"/><text class="nd-hlabel" x="180" y="117">D</text>
          <rect class="nd-devbox" id="nd-devbox" x="80" y="60" width="40" height="20" rx="3"/>
          <text class="nd-devlabel" id="nd-devlabel" x="100" y="74" text-anchor="middle">HUB</text>
          <circle class="nd-dot" id="nd-dot1" cx="-10" cy="-10" r="3" display="none"/>
          <circle class="nd-dot" id="nd-dot2" cx="-10" cy="-10" r="3" display="none"/>
          <circle class="nd-dot" id="nd-dot3" cx="-10" cy="-10" r="3" display="none"/>
          <text class="nd-crash" id="nd-crash" x="100" y="130" text-anchor="middle" display="none">⚠ COLLISION</text>
        </svg>
        <div class="nd-log"><div class="nd-log-title">Event Log</div><div class="nd-log-list" id="nd-log-list"></div></div>
      </div>
    </div>
  </div>

  <!-- ====== TAB 2: OSI MODEL ====== -->
  <div class="nd-tab-content" id="osi-tab">
    <div class="osi-layout">
      <div class="osi-layers" id="osi-layers"></div>
      <div class="osi-detail"><div class="nd-card-title" id="osi-detail-title">Select a Layer</div><div id="osi-detail-text">Click a layer in the stack to learn about its function.</div></div>
    </div>
  </div>

  <!-- ====== TAB 3: ENCRYPTION ====== -->
  <div class="nd-tab-content" id="crypto-tab">
    <div class="crypto-layout">
      <div class="crypto-row">
        <div class="crypto-box"><div class="crypto-label">Alice (Sender)</div><textarea id="crypto-plain" rows="2" style="width:100%">HELLO</textarea>
          <button class="btn-primary" id="crypto-enc-btn" style="padding:0.4rem 1rem;font-size:0.8rem">Encrypt →</button></div>
        <div class="crypto-arrow">🔑<br>Public Key</div>
        <div class="crypto-box"><div class="crypto-label">Encrypted</div><div class="crypto-data" id="crypto-cipher">—</div></div>
      </div>
      <div class="crypto-row">
        <div class="crypto-box"><div class="crypto-label">Bob (Receiver)</div><div class="crypto-data" id="crypto-decrypted">—</div>
          <button class="btn-primary" id="crypto-dec-btn" style="padding:0.4rem 1rem;font-size:0.8rem">Decrypt with Private Key</button></div>
        <div class="crypto-arrow">🔐<br>Private Key</div>
        <div class="crypto-box"><div class="crypto-label">Key Pair</div>
          <div style="font-size:0.72rem;color:var(--text-muted);line-height:1.5">
            <div><strong style="color:var(--text-primary)">Public Key (n,e):</strong> <span id="crypto-pubkey">—</span></div>
            <div><strong style="color:var(--text-primary)">Private Key (n,d):</strong> <span id="crypto-privkey">—</span></div>
          </div>
        </div>
      </div>
      <div class="nd-card" style="margin-top:0.5rem"><div class="nd-card-title">How It Works</div><div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.6" id="crypto-explain">
        <strong>Public Key Cryptography</strong> uses two keys: a <strong>public key</strong> to encrypt and a <strong>private key</strong> to decrypt.<br>
        • Alice encrypts her message with Bob's public key<br>
        • Only Bob's private key can decrypt the ciphertext<br>
        • Even if intercepted, the message stays secret<br>
        • This is the foundation of HTTPS, SSH, and secure email
      </div></div>
    </div>
  </div>

  <!-- ====== TAB 4: PARITY CHECK ====== -->
  <div class="nd-tab-content" id="parity-tab">
    <div class="parity-layout">
      <div class="parity-row">
        <div class="parity-box">
          <div class="nd-card-title">Original Data (7 bits)</div>
          <div class="parity-bits" id="parity-input-bits"></div>
          <div style="display:flex;gap:0.5rem;margin-top:0.5rem">
            <button class="btn-primary" id="parity-send-btn" style="padding:0.4rem 1rem;font-size:0.8rem">Send with Parity</button>
            <button class="btn-secondary" id="parity-flip-btn" style="padding:0.4rem 1rem;font-size:0.8rem">Flip a Bit (Error)</button>
          </div>
        </div>
        <div class="parity-arrow">→</div>
        <div class="parity-box">
          <div class="nd-card-title">Received Data (8 bits)</div>
          <div class="parity-bits" id="parity-recv-bits"></div>
          <div class="nd-card-title" style="margin-top:0.5rem;font-size:0.78rem">Parity Check</div>
          <div style="font-size:0.85rem;color:var(--text-muted)" id="parity-result">Waiting to send…</div>
        </div>
      </div>
      <div class="nd-card" style="margin-top:0.5rem">
        <div class="nd-card-title">How Parity Works</div>
        <div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.6">
          <strong>Even Parity:</strong> count the 1s in 7 data bits. If odd → parity bit = 1 (to make total even). If even → parity bit = 0.<br>
          The receiver counts 1s in all 8 bits. If odd → <strong>error detected!</strong><br>
          • Detects any <strong>odd number</strong> of bit flips<br>
          • Cannot correct errors — only detect them<br>
          • <strong>Limitation:</strong> if 2 bits flip, parity still matches (even count)
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
    el(t.dataset.ndtab).classList.add('active');
    if (t.dataset.ndtab === 'network-tab') initNetLab();
    else if (t.dataset.ndtab === 'osi-tab') initOSI();
    else if (t.dataset.ndtab === 'crypto-tab') initCrypto();
    else if (t.dataset.ndtab === 'parity-tab') initParity();
  }));
  initNetLab();
  initOSI();
  initCrypto();
  initParity();
}

function switchNDTab(id) { qs(`.nd-tab[data-ndtab="${id}"]`)?.click(); }

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
const coords = { 'pc-a': [20, 20], 'pc-b': [20, 120], 'pc-c': [180, 20], 'pc-d': [180, 120] };
const devC = [100, 70];

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
  updateNetUI();
  setDevInfo();
}

function updateNetUI() {
  const d = netState.device;
  el('nd-devbox').style.stroke = d === 'hub' ? '#818cf8' : d === 'switch' ? '#22d3a5' : '#fbbf24';
  el('nd-devlabel').textContent = d.toUpperCase();
  hideDots();
  el('nd-crash').style.display = 'none';
}

function hideDots() { ['nd-dot1','nd-dot2','nd-dot3'].forEach(id => { const e=el(id); if(e){e.style.display='none';e.setAttribute('cx',-10);e.setAttribute('cy',-10);} }); }

function updateHostOptions() {
  ['nd-src-options','nd-dst-options'].forEach(containerId => {
    const c = el(containerId); if (!c) return;
    c.innerHTML = '';
    const isSrc = containerId === 'nd-src-options';
    hosts.forEach(h => {
      const b = document.createElement('button');
      b.className = 'nd-host-btn' + (h.id === (isSrc ? netState.src : netState.dst) ? ' active' : '');
      b.textContent = h.label;
      b.addEventListener('click', () => {
        if (netState.animating) return;
        if (isSrc) netState.src = h.id; else netState.dst = h.id;
        c.querySelectorAll('.nd-host-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      });
      c.appendChild(b);
    });
  });
}

function setDevInfo() {
  const info = {
    hub: `<strong>Hub (Layer 1 — Physical)</strong><br>• Broadcasts to ALL ports<br>• No MAC learning<br>• High collision risk<br>• Shares bandwidth across all devices`,
    switch: `<strong>Switch (Layer 2 — Data Link)</strong><br>• Forwards selectively by MAC address<br>• Learns MAC addresses dynamically<br>• Each port = separate collision domain<br>• Full bandwidth per device`,
    router: `<strong>Router (Layer 3 — Network)</strong><br>• Routes between different subnets<br>• Uses IP addresses + routing table<br>• Connects 192.168.1.x ↔ 192.168.2.x<br>• Operates at the Network Layer`
  };
  el('nd-info-content').innerHTML = info[netState.device] || info.hub;
}

function log(msg, cls) {
  const list = el('nd-log-list'); if (!list) return;
  const d = document.createElement('div'); d.className = 'nd-log-item' + (cls ? ' nd-lg-'+cls : ''); d.innerHTML = msg;
  list.appendChild(d); list.scrollTop = list.scrollHeight;
}

function animDot(dotId, x1, y1, x2, y2, ms, cb) {
  if (netState.abort) { hideDots(); if (cb) cb(); return; }
  const dot = el(dotId); if (!dot) { if (cb) cb(); return; }
  dot.style.display = 'block';
  const t0 = performance.now();
  function f(t) {
    if (netState.abort) { hideDots(); if (cb) cb(); return; }
    let p = Math.min((t - t0) / ms, 1);
    dot.setAttribute('cx', x1 + (x2 - x1) * p);
    dot.setAttribute('cy', y1 + (y2 - y1) * p);
    if (p < 1) requestAnimationFrame(f); else if (cb) cb();
  }
  requestAnimationFrame(f);
}

function endAnim() {
  setTimeout(() => { hideDots(); el('nd-send-btn').disabled = false; netState.animating = false; }, 400);
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
  log(`📤 ${s.label} → ${d.label} [${d.mac}]`, 'send');

  if (netState.device === 'hub') {
    animDot('nd-dot1', sc[0], sc[1], devC[0], devC[1], 400, () => {
      log(`📡 HUB broadcasts to ALL ports`, 'hub');
      const others = hosts.filter(h => h.id !== s.id);
      animDot('nd-dot1', devC[0], devC[1], dc[0], dc[1], 400);
      animDot('nd-dot2', devC[0], devC[1], coords[others[0].id][0], coords[others[0].id][1], 400);
      animDot('nd-dot3', devC[0], devC[1], coords[others[1]?.id || others[0].id][0], coords[others[1]?.id || others[0].id][1], 400, () => {
        netState.colCnt++;
        if (netState.colCnt >= 2) { el('nd-crash').style.display = 'block'; log(`⚠ COLLISION — multiple broadcasts collide`, 'col'); }
        log(`✅ ${d.label} received (but so did others)`, 'recv');
        endAnim();
      });
    });
  } else if (netState.device === 'switch') {
    const known = !!netState.macTable[d.mac];
    animDot('nd-dot1', sc[0], sc[1], devC[0], devC[1], 400, () => {
      netState.macTable[s.mac] = s.label;
      log(`🧠 SWITCH learned: ${s.label} → ${s.mac}`, 'learn');
      if (known) {
        log(`🎯 Forwarded to ${d.label} only (known MAC)`, 'sw');
        animDot('nd-dot1', devC[0], devC[1], dc[0], dc[1], 400, () => { log(`✅ ${d.label} received exclusively`, 'recv'); endAnim(); });
      } else {
        log(`❓ Unknown MAC — flooding all ports except source`, 'sw');
        const others = hosts.filter(h => h.id !== s.id);
        animDot('nd-dot1', devC[0], devC[1], dc[0], dc[1], 400);
        animDot('nd-dot2', devC[0], devC[1], coords[others.find(h=>h.id!==d.id).id][0], coords[others.find(h=>h.id!==d.id).id][1], 400, () => {
          netState.macTable[d.mac] = d.label;
          log(`✅ ${d.label} received (switch now knows ${d.mac})`, 'recv');
          endAnim();
        });
        const rest = hosts.filter(h => h.id !== s.id && h.id !== d.id);
        if (rest.length > 1) animDot('nd-dot3', devC[0], devC[1], coords[rest[1].id][0], coords[rest[1].id][1], 400);
      }
    });
  } else if (netState.device === 'router') {
    const same = s.sub === d.sub;
    animDot('nd-dot1', sc[0], sc[1], devC[0], devC[1], 400, () => {
      log(`🔍 ROUTER: lookup ${d.ip}`, 'router');
      if (same) {
        log(`⚠ ${s.label} & ${d.label} are on same subnet — use a Switch`, 'info');
        animDot('nd-dot1', devC[0], devC[1], dc[0], dc[1], 400, () => { log(`✅ ${d.label} received`, 'recv'); endAnim(); });
      } else {
        log(`🌐 Routing ${s.ip} → ${d.ip} across subnets`, 'router');
        animDot('nd-dot1', devC[0], devC[1], dc[0], dc[1], 400, () => { log(`✅ ${d.label} received (routed)`, 'recv'); endAnim(); });
      }
    });
  }
}

/* ===================================================================
   TAB 2 — OSI MODEL
   =================================================================== */
const osiLayers = [
  { n: 7, name: 'Application', color: '#ef4444', desc: 'User-facing protocols: HTTP, FTP, SMTP, DNS. Provides network services to applications.' },
  { n: 6, name: 'Presentation', color: '#f97316', desc: 'Data formatting, encryption, compression. Translates between application and network formats. SSL/TLS, JPEG, MPEG.' },
  { n: 5, name: 'Session', color: '#eab308', desc: 'Manages sessions (connect/transfer/disconnect). Controls dialog between devices. NetBIOS, RPC.' },
  { n: 4, name: 'Transport', color: '#22c55e', desc: 'End-to-end reliable delivery. Segmentation, flow control, error recovery. <strong>TCP</strong> (reliable) and <strong>UDP</strong> (fast).' },
  { n: 3, name: 'Network', color: '#3b82f6', desc: 'Logical addressing & routing. IP packets forwarded across networks. <strong>Routers</strong> operate here. IP, ICMP.' },
  { n: 2, name: 'Data Link', color: '#818cf8', desc: 'MAC addressing, framing, error detection. <strong>Switches</strong> operate here. Ethernet, PPP, ARP.' },
  { n: 1, name: 'Physical', color: '#c084fc', desc: 'Raw bit transmission over wire/fibre/air. Voltage levels, cable specs. <strong>Hubs/Repeaters</strong> operate here.' },
];

let osiReady = false;
function initOSI() {
  if (osiReady) return;
  osiReady = true;
  const c = el('osi-layers');
  osiLayers.forEach(l => {
    const div = document.createElement('div');
    div.className = 'osi-layer';
    div.style.borderLeftColor = l.color;
    div.innerHTML = `<span class="osi-num">L${l.n}</span><span class="osi-name">${l.name}</span><span class="osi-arrow">›</span>`;
    div.addEventListener('click', () => {
      play('click');
      qsa('.osi-layer').forEach(x => x.classList.remove('active'));
      div.classList.add('active');
      el('osi-detail-title').textContent = `Layer ${l.n}: ${l.name}`;
      el('osi-detail-text').innerHTML = l.desc;
    });
    c.appendChild(div);
  });
  el('osi-layers').firstChild?.click();
}

/* ===================================================================
   TAB 3 — ENCRYPTION
   =================================================================== */
let cryptoReady = false;
function initCrypto() {
  if (cryptoReady) return;
  cryptoReady = true;
  const p = 61, q = 53, n = p * q, phi = (p - 1) * (q - 1);
  let e = 3; while (e < phi && gcd(e, phi) !== 1) e += 2;
  let d = modInv(e, phi);
  el('crypto-pubkey').textContent = `(${n}, ${e})`;
  el('crypto-privkey').textContent = `(${n}, ${d})`;

  el('crypto-enc-btn').addEventListener('click', () => {
    play('click');
    const plain = el('crypto-plain').value.toUpperCase().replace(/[^A-Z]/g, '');
    if (!plain) { if(window.showToast) window.showToast('Enter letters A-Z only.'); return; }
    const nums = plain.split('').map(ch => ch.charCodeAt(0) - 65);
    const enc = nums.map(m => modPow(m, e, n));
    el('crypto-cipher').textContent = enc.join(' ');
  });

  el('crypto-dec-btn').addEventListener('click', () => {
    play('click');
    const raw = el('crypto-cipher').textContent.trim();
    if (raw === '—' || !raw) { if(window.showToast) window.showToast('Encrypt a message first.'); return; }
    const nums = raw.split(/\s+/).map(Number);
    const dec = nums.map(c => modPow(c, d, n));
    const text = dec.map(n => String.fromCharCode(n + 65)).join('');
    el('crypto-decrypted').innerHTML = `<strong style="color:var(--color-success)">${text}</strong>`;
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
    el('parity-result').innerHTML = ok
      ? `<span style="color:var(--color-success)">✅ Parity OK (${totalOnes} ones = even)</span>`
      : `<span style="color:#ef4444">❌ ERROR detected! (${totalOnes} ones = odd)</span>`;
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
