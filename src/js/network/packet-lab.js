const LAYERS = [
  { id: 7, name: 'Application', icon: 'HTTP', detail: 'Browser request', pdu: 'DATA', color: '#ef6e62' },
  { id: 6, name: 'Presentation', icon: 'TLS', detail: 'Format + encrypt', pdu: 'DATA', color: '#f59b52' },
  { id: 5, name: 'Session', icon: 'SYNC', detail: 'Keep dialogue open', pdu: 'DATA', color: '#e7bf55' },
  { id: 4, name: 'Transport', icon: 'TCP', detail: 'Port + reliability', pdu: 'SEGMENT', color: '#5bdb9f' },
  { id: 3, name: 'Network', icon: 'IP', detail: 'Address + route', pdu: 'PACKET', color: '#54bce6' },
  { id: 2, name: 'Data Link', icon: 'MAC', detail: 'Frame + FCS', pdu: 'FRAME', color: '#809be9' },
  { id: 1, name: 'Physical', icon: 'BITS', detail: 'Signals on cable', pdu: 'BITS', color: '#b789e8' },
];

let ready = false;
let timer = null;
let state = { step: -1, failed: false, protocol: 'TCP', port: 443, message: 'GET /index.html' };

export function initPacketLab() {
  if (ready || !document.getElementById('packet-lab-root')) return;
  ready = true;
  render();
}

export function cleanupPacketLab() {
  if (timer) { clearInterval(timer); timer = null; }
}

function bind() {
  document.getElementById('packet-send')?.addEventListener('click', sendPacket);
  document.getElementById('packet-step')?.addEventListener('click', stepPacket);
  document.getElementById('packet-reset')?.addEventListener('click', resetPacket);
  document.getElementById('packet-fail')?.addEventListener('click', () => { state.failed = !state.failed; render(); announce(state.failed ? 'Corruption injected: the frame check will fail at the receiver.' : 'Corruption removed: the link can deliver the frame.'); });
  document.getElementById('packet-protocol')?.addEventListener('change', event => { state.protocol = event.target.value; state.port = state.protocol === 'UDP' ? 53 : 443; render(); });
  document.getElementById('packet-port')?.addEventListener('change', event => { state.port = Number(event.target.value); render(); });
  document.getElementById('packet-message')?.addEventListener('input', event => { state.message = event.target.value; updateFields(); });
}

function buildShell() {
  const stack = (side) => LAYERS.map(layer => `<div class="packet-layer" data-packet-layer="${side}-${layer.id}" style="--layer-color:${layer.color}"><span class="layer-num">${layer.id}</span><span><b class="layer-name">${layer.name}</b><small class="layer-detail">${layer.icon} · ${layer.detail}</small></span><em class="layer-pdu">${layer.pdu}</em></div>`).join('');
  return `<div class="packet-lab"><header class="packet-lab-header"><div><span class="packet-lab-kicker">NETWORKING LAB / PACKET ANATOMY</span><h1>Follow one request through all seven layers.</h1><p class="packet-lab-lede">Press send to add headers on the client, move the packet across the wire, then watch the server remove each header until the browser receives the original data.</p></div><div class="packet-lab-status"><small>SIMULATION STATUS</small><strong id="packet-status">READY TO SEND</strong></div></header><div class="packet-lab-toolbar"><label class="packet-lab-control">MESSAGE <input id="packet-message" value="GET /index.html"></label><label class="packet-lab-control">TRANSPORT <select id="packet-protocol"><option>TCP</option><option>UDP</option></select></label><label class="packet-lab-control">DESTINATION PORT <select id="packet-port"><option value="443">443 · HTTPS</option><option value="80">80 · HTTP</option><option value="53">53 · DNS</option><option value="22">22 · SSH</option></select></label><button class="packet-lab-btn primary" id="packet-send" type="button">Send packet</button><button class="packet-lab-btn" id="packet-step" type="button">Next layer</button><button class="packet-lab-btn warn" id="packet-fail" type="button">Inject error</button><button class="packet-lab-btn" id="packet-reset" type="button">Reset</button></div><main class="packet-lab-workspace"><section class="packet-host"><div class="packet-host-header"><div class="packet-device"></div><div><strong>CLIENT</strong><span>192.168.1.10</span></div></div><div class="packet-stack">${stack('client')}</div></section><section class="packet-lab-center"><div class="packet-center-head"><strong>PACKET JOURNEY</strong><span id="packet-step-label">Waiting for application data</span></div><div class="packet-route" id="packet-route"><span class="packet-route-label">LOCAL LINK → ROUTER → SERVER</span><div class="packet-route-device client"><div class="packet-device"></div><span>HOST A</span></div><div class="packet-object" id="packet-object"><i></i><i></i><i></i></div><div class="packet-route-device server"><div class="packet-device server"></div><span>HOST B</span></div></div><div class="packet-status-line" id="packet-message-status">The payload starts as application data. Each lower layer adds its own header.</div></section><section class="packet-host"><div class="packet-host-header"><div class="packet-device server"></div><div><strong>SERVER</strong><span>142.250.72.14</span></div></div><div class="packet-stack">${stack('server')}</div></section></main><section class="packet-inspector"><div class="packet-inspector-panel"><div class="packet-inspector-title"><strong>PACKET INSPECTOR</strong><span id="packet-inspector-state">Payload only</span></div><div class="packet-fields" id="packet-fields"></div><div class="packet-port-help"><div class="packet-port-card"><b>Source port</b><span>Temporary return address for this client process.</span></div><div class="packet-port-card"><b>Destination port :${state.port}</b><span>Points the data to the correct server service.</span></div><div class="packet-port-card"><b>Why ports?</b><span>One IP host can run many network services at the same time.</span></div></div></div></section></div>`;
}

function render() {
  const root = document.getElementById('packet-lab-root');
  if (!root) return;
  root.innerHTML = buildShell();
  const protocol = root.querySelector('#packet-protocol'); if (protocol) protocol.value = state.protocol;
  const port = root.querySelector('#packet-port'); if (port) port.value = String(state.port);
  const message = root.querySelector('#packet-message'); if (message) message.value = state.message;
  updateLayers();
  updateFields();
  bind();
}

function updateLayers() {
  LAYERS.forEach((layer, index) => {
    const client = document.querySelector(`[data-packet-layer="client-${layer.id}"]`);
    const server = document.querySelector(`[data-packet-layer="server-${layer.id}"]`);
    const clientDone = state.step >= 0 && index <= state.step;
    const serverDone = state.step >= 7 && index <= state.step - 7;
    client?.classList.toggle('active', state.step === index);
    client?.classList.toggle('complete', clientDone && state.step !== index);
    server?.classList.toggle('active', state.step >= 7 && state.step - 7 === index);
    server?.classList.toggle('complete', serverDone && state.step - 7 !== index);
    if (state.failed && layer.id === 2) { client?.classList.toggle('error', state.step >= 5); server?.classList.toggle('error', state.step >= 7); }
  });
  const route = document.getElementById('packet-route'); route?.classList.toggle('running', state.step >= 7 && state.step < 14); route?.classList.toggle('failed', state.failed && state.step >= 5);
  const status = document.getElementById('packet-status'); if (status) status.textContent = state.step < 0 ? 'READY TO SEND' : state.step >= 14 ? 'DELIVERED' : state.failed && state.step >= 5 ? 'PACKET REJECTED' : 'TRANSMITTING';
  const label = document.getElementById('packet-step-label'); if (label) label.textContent = state.step < 0 ? 'Waiting for application data' : state.step >= 14 ? 'Message delivered to server process' : state.step < 7 ? `${LAYERS[state.step].name} adds ${LAYERS[state.step].pdu.toLowerCase()} information` : state.step === 7 ? 'Packet crossing the network' : `Server removes ${LAYERS[state.step - 7]?.pdu.toLowerCase() || 'header'}`;
}

function updateFields() {
  const fields = document.getElementById('packet-fields'); if (!fields) return;
  const visible = state.step < 0 ? [] : state.step < 7 ? LAYERS.slice(0, state.step + 1) : LAYERS.slice(0, 7 - Math.max(0, state.step - 7));
  fields.innerHTML = [{ label: 'PAYLOAD', value: document.getElementById('packet-message')?.value || state.message, color: '#ef6e62' }, ...visible.map(layer => ({ label: layer.pdu, value: layer.id === 4 ? `${state.protocol} :${state.port}` : layer.icon, color: layer.color }))].map(field => `<div class="packet-field" style="--field-color:${field.color}"><small>${field.label}</small><strong>${field.value}</strong></div>`).join('');
  const inspector = document.getElementById('packet-inspector-state'); if (inspector) inspector.textContent = state.step >= 14 ? 'Original payload restored' : `${visible.length} header${visible.length === 1 ? '' : 's'} present`;
}

function announce(message, kind = '') { const node = document.getElementById('packet-message-status'); if (node) { node.textContent = message; node.className = `packet-status-line ${kind}`; } }
function stepPacket() {
  if (state.step >= 14) return;
  state.step += 1;
  updateLayers(); updateFields();
  if (state.failed && state.step === 5) announce('ERROR at Data Link: the Ethernet frame FCS is invalid. The receiver will discard it.', 'bad');
  else if (state.step === 7) announce('The completed packet is now crossing the network. Routers read the IP header, not the application payload.');
  else if (state.step === 14) announce('GOOD: the server removed each header and delivered the original data to the correct port.', 'good');
}
function sendPacket() { resetPacket(false); timer = setInterval(() => { stepPacket(); if (state.step >= 14 || (state.failed && state.step >= 5)) { clearInterval(timer); timer = null; } }, 520); }
function resetPacket(full = true) { if (timer) { clearInterval(timer); timer = null; } state.step = -1; if (full) state.failed = false; render(); announce('The payload starts as application data. Each lower layer adds its own header.'); }