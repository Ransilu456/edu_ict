// ============================================================
//  LogicQuest — Signal Encoding Lab Module
//  All DOM IDs are prefixed with "enc-" to prevent conflicts
// ============================================================

const DEFAULT_BITS = [1, 0, 1, 1, 0, 1, 0, 0];

let enc_analogBits  = [...DEFAULT_BITS];
let enc_digitalBits = [...DEFAULT_BITS];
let enc_manchBits   = [...DEFAULT_BITS];

export function initEncoder() {
  if (!document.getElementById('enc-analog-bits')) return;

  createBitToggles('enc-analog-bits',  enc_analogBits,  updateAnalog);
  createBitToggles('enc-digital-bits', enc_digitalBits, updateDigital);
  createBitToggles('enc-manch-bits',   enc_manchBits,   updateManchester);
  build4b5bTable();

  // Param sliders
  const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('input', fn); };
  bind('enc-carrier-freq', updateAnalog);
  bind('enc-ask-amp',      updateAnalog);
  bind('enc-fsk-mult',     updateAnalog);

  // Decoder
  const decBtn = document.getElementById('enc-decode-btn');
  if (decBtn) decBtn.addEventListener('click', runDecoder);
  const clrBtn = document.getElementById('enc-clear-btn');
  if (clrBtn) clrBtn.addEventListener('click', clearDecoder);
  const encRaw = document.getElementById('enc-encoder-raw');
  if (encRaw) encRaw.addEventListener('input', runEncoder);
  const encScheme = document.getElementById('enc-encoder-scheme');
  if (encScheme) encScheme.addEventListener('change', runEncoder);

  // Internal tab strip
  const tabStrip = document.getElementById('enc-tab-strip');
  if (tabStrip) {
    tabStrip.addEventListener('click', e => {
      const btn = e.target.closest('.enc-tab-btn');
      if (!btn) return;
      document.querySelectorAll('.enc-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.enc-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('enc-tab-' + btn.dataset.tab);
      if (panel) panel.classList.add('active');
      setTimeout(() => {
        if (btn.dataset.tab === 'analog')    updateAnalog();
        if (btn.dataset.tab === 'digital')   updateDigital();
        if (btn.dataset.tab === 'manchester') updateManchester();
      }, 50);
    });
  }

  // Quiz start
  const qStartBtn = document.getElementById('enc-quiz-start-btn');
  if (qStartBtn) qStartBtn.addEventListener('click', startEncoderQuiz);

  setTimeout(() => {
    updateAnalog();
    updateDigital();
    updateManchester();
  }, 120);
}

// ── Bit toggle grid ───────────────────────────────────────────
function createBitToggles(containerId, bits, onChange) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  bits.forEach((b, i) => {
    const btn = document.createElement('button');
    btn.className  = 'enc-bit-toggle' + (b ? ' on' : '');
    btn.textContent = b;
    btn.id = `${containerId}-${i}`;
    btn.addEventListener('click', () => {
      bits[i] ^= 1;
      btn.textContent = bits[i];
      btn.classList.toggle('on', bits[i] === 1);
      if (window.playSound) window.playSound('toggle');
      onChange();
    });
    container.appendChild(btn);
  });
}

// ── Canvas helpers ────────────────────────────────────────────
function resizeCanvas(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const dpr  = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const w    = Math.max(rect.width || 600, 200);
  const h    = 130;
  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, w, h };
}

function drawGrid(ctx, w, h) {
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth   = 1;
  for (let x = 0; x <= w; x += w / 8) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();
}

// ── Analog Encoding ───────────────────────────────────────────
function updateAnalog() {
  const getVal = (id, def) => { const el = document.getElementById(id); return el ? parseInt(el.value) : def; };
  const freq = getVal('enc-carrier-freq', 3);
  const amp  = getVal('enc-ask-amp', 40);
  const fmul = getVal('enc-fsk-mult', 3);

  const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setTxt('enc-carrier-freq-val', freq + ' units');
  setTxt('enc-ask-amp-val', amp);
  setTxt('enc-fsk-mult-val', fmul + '×');

  drawDataWave(enc_analogBits, 'enc-canvas-data-a', '#06b6d4');
  drawAsk(enc_analogBits, freq, amp);
  drawFsk(enc_analogBits, freq, fmul, amp);
  drawPsk(enc_analogBits, freq, amp);
}

function drawDataWave(bits, id, color) {
  const r = resizeCanvas(id); if (!r) return;
  const { ctx, w, h } = r;
  const bw = (w - 36) / bits.length, x0 = 36, top = 10, bot = h - 10;
  ctx.clearRect(0, 0, w, h); drawGrid(ctx, w, h);
  ctx.strokeStyle = color; ctx.lineWidth = 2.5;
  ctx.shadowColor = color; ctx.shadowBlur = 6;
  ctx.beginPath();
  bits.forEach((b, i) => {
    const y = b ? top : bot, x = x0 + i * bw;
    ctx.moveTo(x, y); ctx.lineTo(x + bw, y);
    if (i < bits.length - 1) { const ny = bits[i+1] ? top : bot; ctx.moveTo(x+bw,y); ctx.lineTo(x+bw,ny); }
  });
  ctx.stroke(); ctx.shadowBlur = 0;
  ctx.fillStyle = color + 'aa'; ctx.font = 'bold 11px JetBrains Mono,monospace'; ctx.textAlign = 'center';
  bits.forEach((b, i) => ctx.fillText(b, x0 + i*bw + bw/2, b ? top+14 : bot-4));
  ctx.textAlign = 'left';
}

function drawSineSegments(id, bits, freqFn, ampFn, colorFn, phaseFn) {
  const r = resizeCanvas(id); if (!r) return;
  const { ctx, w, h } = r;
  const bw = (w - 36) / bits.length, x0 = 36;
  const mid = h / 2, maxA = (h / 2) - 12;
  ctx.clearRect(0, 0, w, h); drawGrid(ctx, w, h);
  const STEPS = 200;
  bits.forEach((b, i) => {
    const color = typeof colorFn === 'function' ? colorFn(b) : colorFn;
    ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    ctx.shadowColor = color; ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let s = 0; s <= STEPS; s++) {
      const t = s / STEPS;
      const x = x0 + i * bw + t * bw;
      const a = ampFn(b) / 55 * maxA;
      const y = mid - a * Math.sin(2 * Math.PI * freqFn(b) * t + (phaseFn ? phaseFn(b) : 0));
      s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
}

function drawAsk(bits, freq, amp) {
  drawSineSegments('enc-canvas-ask', bits, () => freq, b => b ? amp : 0, '#f59e0b', null);
}
function drawFsk(bits, freq, fmul, amp) {
  drawSineSegments('enc-canvas-fsk', bits, b => b ? freq * fmul : freq, () => amp, b => b ? '#10b981' : '#34d399', null);
}
function drawPsk(bits, freq, amp) {
  drawSineSegments('enc-canvas-psk', bits, () => freq, () => amp, b => b ? '#a78bfa' : '#7c3aed', b => b ? 0 : Math.PI);
}

// ── Digital Line Codes ────────────────────────────────────────
function updateDigital() {
  drawDataWave(enc_digitalBits, 'enc-canvas-data-d', '#06b6d4');
  drawNrzL();
  drawNrzI();
  drawRz();
  drawAmi();
}

function drawNrzL() {
  const r = resizeCanvas('enc-canvas-nrzl'); if (!r) return;
  const { ctx, w, h } = r;
  const bits = enc_digitalBits;
  const bw = (w-36)/bits.length, x0=36, top=10, bot=h-10, mid=h/2;
  ctx.clearRect(0,0,w,h); drawGrid(ctx,w,h);
  ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.font='10px JetBrains Mono,monospace';
  ctx.fillText('+V',4,top+8); ctx.fillText(' 0',4,mid+4); ctx.fillText('−V',4,bot);
  ctx.strokeStyle='#f59e0b'; ctx.lineWidth=2.5; ctx.shadowColor='#f59e0b'; ctx.shadowBlur=6;
  ctx.beginPath();
  bits.forEach((b,i)=>{
    const y=b?top:bot, x=x0+i*bw;
    ctx.moveTo(x,y); ctx.lineTo(x+bw,y);
    if(i<bits.length-1){const ny=bits[i+1]?top:bot; ctx.moveTo(x+bw,y); ctx.lineTo(x+bw,ny);}
  });
  ctx.stroke(); ctx.shadowBlur=0;
}

function drawNrzI() {
  const r = resizeCanvas('enc-canvas-nrzi'); if (!r) return;
  const { ctx, w, h } = r;
  const bits = enc_digitalBits;
  const bw=(w-36)/bits.length, x0=36, top=10, bot=h-10, mid=h/2;
  ctx.clearRect(0,0,w,h); drawGrid(ctx,w,h);
  ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.font='10px JetBrains Mono,monospace';
  ctx.fillText('+V',4,top+8); ctx.fillText(' 0',4,mid+4); ctx.fillText('−V',4,bot);
  ctx.strokeStyle='#10b981'; ctx.lineWidth=2.5; ctx.shadowColor='#10b981'; ctx.shadowBlur=6;
  ctx.beginPath();
  let cur=1;
  const levels = bits.map(b => { if(b) cur=cur===1?-1:1; return cur; });
  let px=x0, py=levels[0]===1?top:bot;
  ctx.moveTo(px,py);
  levels.forEach((lv,i)=>{
    const ny=lv===1?top:bot, nx=x0+i*bw;
    ctx.lineTo(nx,py); ctx.lineTo(nx,ny); py=ny;
  });
  ctx.lineTo(x0+levels.length*bw,py);
  ctx.stroke(); ctx.shadowBlur=0;
}

function drawRz() {
  const r = resizeCanvas('enc-canvas-rz'); if (!r) return;
  const { ctx, w, h } = r;
  const bits=enc_digitalBits, bw=(w-36)/bits.length, x0=36, top=10, bot=h-10, mid=h/2;
  ctx.clearRect(0,0,w,h); drawGrid(ctx,w,h);
  ctx.strokeStyle='#a78bfa'; ctx.lineWidth=2.5; ctx.shadowColor='#a78bfa'; ctx.shadowBlur=6;
  ctx.beginPath();
  bits.forEach((b,i)=>{
    const x=x0+i*bw, xm=x+bw/2, xe=x+bw, y=b?top:mid;
    ctx.moveTo(x,mid); ctx.lineTo(x,y); ctx.lineTo(xm,y); ctx.lineTo(xm,mid); ctx.lineTo(xe,mid);
  });
  ctx.stroke(); ctx.shadowBlur=0;
}

function drawAmi() {
  const r = resizeCanvas('enc-canvas-ami'); if (!r) return;
  const { ctx, w, h } = r;
  const bits=enc_digitalBits, bw=(w-36)/bits.length, x0=36, top=10, bot=h-10, mid=h/2;
  ctx.clearRect(0,0,w,h); drawGrid(ctx,w,h);
  ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.font='10px JetBrains Mono,monospace';
  ctx.fillText('+V',4,top+8); ctx.fillText(' 0',4,mid+4); ctx.fillText('−V',4,bot);
  ctx.strokeStyle='#f43f5e'; ctx.lineWidth=2.5; ctx.shadowColor='#f43f5e'; ctx.shadowBlur=6;
  ctx.beginPath();
  let polarity=1, px=x0, py=mid;
  bits.forEach((b,i)=>{
    const x=x0+i*bw;
    let ny = b===0 ? mid : (polarity===1?top:bot);
    if(b) polarity*=-1;
    ctx.moveTo(px,py); ctx.lineTo(x,py); ctx.lineTo(x,ny); px=x; py=ny;
  });
  ctx.lineTo(x0+bits.length*bw,py);
  ctx.stroke(); ctx.shadowBlur=0;
}

// ── Manchester Encoding ───────────────────────────────────────
function manchIEEE(bits)  { const o=[]; bits.forEach(b=>b===0?o.push(0,1):o.push(1,0)); return o; }
function manchG3(bits)    { const o=[]; bits.forEach(b=>b===0?o.push(1,0):o.push(0,1)); return o; }
function diffManch(bits)  {
  let o=[], cur=1;
  bits.forEach(b=>{ if(b===0)cur^=1; o.push(cur); cur^=1; o.push(cur); });
  return o;
}

function drawManchWave(id, halfBits, color) {
  const r = resizeCanvas(id); if (!r) return;
  const { ctx, w, h } = r;
  const bw=(w-36)/halfBits.length, x0=36, top=10, bot=h-10;
  ctx.clearRect(0,0,w,h); drawGrid(ctx,w,h);
  ctx.strokeStyle=color; ctx.lineWidth=2.5; ctx.shadowColor=color; ctx.shadowBlur=6;
  ctx.beginPath();
  let py=halfBits[0]?top:bot; ctx.moveTo(x0,py);
  halfBits.forEach((hb,i)=>{
    const ny=hb?top:bot, nx=x0+i*bw;
    ctx.lineTo(nx,py); ctx.lineTo(nx,ny); py=ny;
  });
  ctx.lineTo(x0+halfBits.length*bw,py);
  ctx.stroke(); ctx.shadowBlur=0;
}

function updateManchester() {
  drawDataWave(enc_manchBits,'enc-canvas-data-m','#06b6d4');
  drawManchWave('enc-canvas-manch-ieee', manchIEEE(enc_manchBits), '#10b981');
  drawManchWave('enc-canvas-manch-g3',   manchG3(enc_manchBits),   '#f97316');
  drawManchWave('enc-canvas-diff-manch', diffManch(enc_manchBits), '#f43f5e');
}

// ── 4B/5B Table ───────────────────────────────────────────────
const TABLE_4B5B = {
  '0000':'11110','0001':'01001','0010':'10100','0011':'10101',
  '0100':'01010','0101':'01011','0110':'01110','0111':'01111',
  '1000':'10010','1001':'10011','1010':'10110','1011':'10111',
  '1100':'11010','1101':'11011','1110':'11100','1111':'11101'
};
const REVERSE_4B5B = Object.fromEntries(Object.entries(TABLE_4B5B).map(([k,v])=>[v,k]));

function build4b5bTable() {
  const container = document.getElementById('enc-code-table-4b5b');
  if (!container) return;
  container.innerHTML = '';
  Object.entries(TABLE_4B5B).forEach(([nibble, code]) => {
    const row = document.createElement('div');
    row.className = 'enc-code-row';
    row.innerHTML = `<span class="enc-nibble">${nibble}</span><span class="enc-arrow">→</span><span class="enc-fiveb">${code}</span>`;
    container.appendChild(row);
  });
}

// ── Decoder / Encoder Tool ────────────────────────────────────
function cleanBits(str) { return str.replace(/[^01]/g, ''); }

function runDecoder() {
  const raw    = cleanBits(document.getElementById('enc-decoder-input')?.value || '');
  const scheme = document.getElementById('enc-decoder-scheme')?.value;
  const errEl  = document.getElementById('enc-decoder-error');
  const resEl  = document.getElementById('enc-decoder-result');
  if (errEl) errEl.style.display = 'none';
  if (resEl) resEl.style.display = 'none';

  if (!raw) { showDecErr('Please enter a bit string.'); return; }

  let decoded = '', info = '';
  try {
    if (scheme === 'manchester-ieee') {
      if (raw.length % 2 !== 0) { showDecErr('Manchester bits must be even length (2 bits per data bit).'); return; }
      for (let i=0; i<raw.length; i+=2) {
        const p = raw[i]+raw[i+1];
        if      (p==='01') decoded += '0';
        else if (p==='10') decoded += '1';
        else { showDecErr(`Invalid Manchester pair "${p}" at position ${i}`); return; }
      }
      info = `IEEE 802.3 Manchester: ${raw.length} encoded → ${decoded.length} data bits`;
    } else if (scheme === 'manchester-g3') {
      if (raw.length % 2 !== 0) { showDecErr('Manchester bits must be even length.'); return; }
      for (let i=0; i<raw.length; i+=2) {
        const p = raw[i]+raw[i+1];
        if      (p==='10') decoded += '0';
        else if (p==='01') decoded += '1';
        else { showDecErr(`Invalid Manchester pair "${p}" at position ${i}`); return; }
      }
      info = `G.E.Thomas Manchester: ${raw.length} encoded → ${decoded.length} data bits`;
    } else if (scheme === 'diff-manchester') {
      if (raw.length % 2 !== 0) { showDecErr('Differential Manchester requires even length.'); return; }
      let prev = -1;
      for (let i=0; i<raw.length; i+=2) {
        const startBit = parseInt(raw[i]);
        decoded += (prev === -1 || startBit !== prev) ? '0' : '1';
        prev = parseInt(raw[i+1]);
      }
      info = `Differential Manchester: ${raw.length} encoded → ${decoded.length} data bits`;
    } else if (scheme === '4b5b') {
      if (raw.length % 5 !== 0) { showDecErr('4B/5B codes must be in groups of 5 bits.'); return; }
      for (let i=0; i<raw.length; i+=5) {
        const code = raw.slice(i,i+5);
        if (!REVERSE_4B5B[code]) { showDecErr(`Unknown 4B/5B code: "${code}"`); return; }
        decoded += REVERSE_4B5B[code];
      }
      info = `4B/5B: ${raw.length/5} code words → ${decoded.length} data bits`;
    } else if (scheme === 'nrzi') {
      let cur=0;
      for (const b of raw) { if(b==='1') cur^=1; decoded+=cur; }
      info = `NRZ-I decoded: ${raw.length} bits`;
    } else if (scheme === 'ami') {
      for (const b of raw) decoded += b==='0' ? '0' : '1';
      info = `AMI decoded: ${decoded.length} bits`;
    }
    showDecResult(decoded, info);
  } catch(e) { showDecErr(e.message); }
}

function showDecErr(msg) {
  const WARN = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:5px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  const e = document.getElementById('enc-decoder-error');
  if (e) { e.innerHTML = WARN + msg; e.style.display = 'block'; }
}
function showDecResult(bits, info) {
  const bitsEl = document.getElementById('enc-decoded-bits');
  const infoEl = document.getElementById('enc-decoded-info');
  const resEl  = document.getElementById('enc-decoder-result');
  if (bitsEl) bitsEl.innerHTML = bits.split('').map(b=>`<span class="${b==='1'?'enc-bit-1':'enc-bit-0'}">${b}</span>`).join(' ');
  if (infoEl) infoEl.textContent = info;
  if (resEl)  resEl.style.display = 'block';
}
function clearDecoder() {
  const el = (id) => document.getElementById(id);
  if (el('enc-decoder-input')) el('enc-decoder-input').value = '';
  if (el('enc-decoder-result')) el('enc-decoder-result').style.display = 'none';
  if (el('enc-decoder-error'))  el('enc-decoder-error').style.display  = 'none';
}

function runEncoder() {
  const raw    = cleanBits(document.getElementById('enc-encoder-raw')?.value || '');
  const scheme = document.getElementById('enc-encoder-scheme')?.value;
  const resEl  = document.getElementById('enc-encoder-result');
  if (!raw || !resEl) { if(resEl) resEl.style.display='none'; return; }

  let encoded='', info='';
  if (scheme === 'manchester-ieee') {
    encoded = raw.split('').map(b=>b==='0'?'01':'10').join(' ');
    info = `${raw.length} data bits → ${raw.length*2} encoded bits`;
  } else if (scheme === 'manchester-g3') {
    encoded = raw.split('').map(b=>b==='0'?'10':'01').join(' ');
    info = `${raw.length} data bits → ${raw.length*2} encoded bits`;
  } else if (scheme === 'diff-manchester') {
    let cur=0; const halves=[];
    raw.split('').forEach(b=>{ if(b==='0')cur^=1; halves.push(cur); cur^=1; halves.push(cur); });
    encoded = halves.join(''); info = `${raw.length} data → ${encoded.length} encoded`;
  } else if (scheme === '4b5b') {
    const padded = raw.padStart(Math.ceil(raw.length/4)*4,'0');
    const parts  = [];
    for(let i=0;i<padded.length;i+=4) parts.push(TABLE_4B5B[padded.slice(i,i+4)]||'?????');
    encoded = parts.join(' '); info = `${padded.length/4} nibble(s) → ${parts.length*5} encoded bits`;
  } else if (scheme === 'nrzi') {
    let cur=0;
    encoded = raw.split('').map(b=>{if(b==='1')cur^=1;return cur;}).join('');
    info = `NRZ-I: ${raw.length} bits`;
  }

  const bitsEl = document.getElementById('enc-encoded-bits');
  const infoEl = document.getElementById('enc-encoded-info');
  if (bitsEl) bitsEl.innerHTML = encoded.split('').map(b=>b==='1'?`<span class="enc-bit-1">1</span>`:b==='0'?`<span class="enc-bit-0">0</span>`:b).join('');
  if (infoEl) infoEl.textContent = info;
  resEl.style.display = 'block';
}

// ── Quiz ──────────────────────────────────────────────────────
const ENC_QUIZ = [
  { q:'Which encoding scheme varies the FREQUENCY of a carrier wave to represent binary data?', opts:['ASK','FSK','PSK','NRZ-L'], ans:1, exp:'FSK (Frequency Shift Keying) uses different frequencies: higher frequency for 1, base frequency for 0.' },
  { q:'In IEEE 802.3 Manchester encoding, how is a binary 1 represented?', opts:['High-to-Low transition','Low-to-High transition','No transition','Zero voltage'], ans:0, exp:'IEEE 802.3: 1 = High→Low mid-bit transition, 0 = Low→High. (G.E. Thomas is the opposite.)' },
  { q:'Which digital line code has NO DC component AND is self-clocking?', opts:['NRZ-L','NRZ-I','Manchester','AMI'], ans:2, exp:'Manchester always has a guaranteed mid-bit transition, providing self-clocking, with no net DC component.' },
  { q:'4B/5B encoding on Fast Ethernet wire is combined with which line code?', opts:['NRZ-L','Manchester','NRZ-I','RZ'], ans:2, exp:'4B/5B codes are transmitted using NRZ-I in 100BASE-TX Fast Ethernet.' },
  { q:'What is the efficiency of 4B/5B encoding?', opts:['50%','80%','100%','60%'], ans:1, exp:'4 data bits per 5 encoded bits = 4/5 = 80% efficiency. A 100 Mbps wire rate yields 80 Mbps of actual data.' },
  { q:'In AMI (Alternate Mark Inversion), how are 1-bits encoded?', opts:['Always +V','Always 0V','Alternating +V and −V','High-frequency burst'], ans:2, exp:'AMI alternates between +V and −V for successive 1-bits, with 0-bits encoded as zero voltage. This eliminates DC component.' },
  { q:'Which encoding is used in 10BASE-T Ethernet?', opts:['4B/5B + NRZ-I','Manchester (IEEE 802.3)','NRZ-L','AMI'], ans:1, exp:'10BASE-T Ethernet uses IEEE 802.3 Manchester encoding for self-clocking on the physical wire.' },
  { q:"Shannon's capacity theorem states C = ?", opts:['2 × B × log₂(M)','B × log₂(1 + SNR)','B / SNR','2B × SNR'], ans:1, exp:'C = B × log₂(1 + SNR) gives the theoretical maximum data rate for a noisy channel with bandwidth B.' },
  { q:'In BPSK, a binary 0 is represented by shifting the carrier phase by:', opts:['0°','90°','180°','360°'], ans:2, exp:'BPSK: 1 = 0° phase, 0 = 180° phase shift. The receiver detects phase reversals to determine the bit value.' },
  { q:'Which line code suffers synchronisation loss during long runs of 0s?', opts:['Manchester','NRZ-L','AMI','RZ'], ans:1, exp:'NRZ-L has no transitions during long runs of 0s, making clock recovery impossible for the receiver.' },
];

let enc_challengeState = {
  currentIdx: 0,
  score: 0,
  xpGain: 0,
  selectedOpt: null,
  answered: false,
  questions: []
};

function startEncoderQuiz() {
  // Select 5 random questions from the ENC_QUIZ pool
  enc_challengeState.questions = [];
  const shuffled = [...ENC_QUIZ].sort(() => 0.5 - Math.random());
  enc_challengeState.questions = shuffled.slice(0, 5);

  enc_challengeState.currentIdx = 0;
  enc_challengeState.score = 0;
  enc_challengeState.xpGain = 0;
  enc_challengeState.selectedOpt = null;
  enc_challengeState.answered = false;

  // Open modal
  const modal = document.getElementById('app-quiz-modal');
  if (!modal) return;
  modal.style.display = 'flex';

  // Setup close events
  const closeBtn = document.getElementById('close-quiz-modal-btn');
  if (closeBtn) closeBtn.onclick = enc_closeChallenge;

  enc_renderChallengeQuestion();
}

function enc_closeChallenge() {
  const modal = document.getElementById('app-quiz-modal');
  if (modal) modal.style.display = 'none';
}

function enc_renderChallengeQuestion() {
  const idx = enc_challengeState.currentIdx;
  const q = enc_challengeState.questions[idx];

  enc_challengeState.selectedOpt = null;
  enc_challengeState.answered = false;

  // UI elements
  const progress = document.getElementById('quiz-modal-progress');
  const qNum = document.getElementById('quiz-modal-q-num');
  const qText = document.getElementById('quiz-modal-question-text');
  const answerArea = document.getElementById('quiz-modal-answer-area');
  const feedback = document.getElementById('quiz-modal-feedback');
  const ctaBtn = document.getElementById('quiz-modal-cta-btn');
  const xpGainText = document.getElementById('quiz-modal-xp-gain');

  // Hide summary step, show question step
  document.getElementById('quiz-modal-question-step').style.display = 'block';
  document.getElementById('quiz-modal-summary-step').style.display = 'none';

  // Reset progress and texts
  if (progress) progress.style.width = ((idx + 1) / 5) * 100 + '%';
  if (qNum) qNum.innerText = `Question ${idx + 1} of 5`;
  if (qText) qText.innerHTML = q.q;
  if (xpGainText) xpGainText.innerText = `+${enc_challengeState.xpGain}`;

  // Render multiple choice options
  if (answerArea) {
    answerArea.innerHTML = `
      <div class="quiz-modal-opts">
        ${q.opts.map((opt, oi) => `
          <button class="quiz-modal-opt" id="quiz-modal-opt-${oi}" data-oi="${oi}">
            <span class="quiz-modal-opt-letter">${String.fromCharCode(65 + oi)}</span>
            <span>${opt}</span>
          </button>
        `).join('')}
      </div>
    `;

    // Add click listeners to options
    q.opts.forEach((_, oi) => {
      const optBtn = document.getElementById(`quiz-modal-opt-${oi}`);
      if (optBtn) {
        optBtn.onclick = () => {
          if (enc_challengeState.answered) return;
          if (window.playSound) window.playSound('click');
          enc_challengeState.selectedOpt = oi;

          // Highlight selection
          q.opts.forEach((_, tempIdx) => {
            const btn = document.getElementById(`quiz-modal-opt-${tempIdx}`);
            if (btn) btn.classList.toggle('selected', tempIdx === oi);
          });

          if (ctaBtn) ctaBtn.disabled = false;
        };
      }
    });
  }

  // Reset feedback and button
  if (feedback) {
    feedback.className = 'feedback-alert';
    feedback.innerHTML = '';
    feedback.style.display = 'none';
  }

  if (ctaBtn) {
    ctaBtn.innerText = 'Check Answer';
    ctaBtn.disabled = true;
    ctaBtn.onclick = enc_checkChallengeAnswer;
  }
}

function enc_checkChallengeAnswer() {
  const idx = enc_challengeState.currentIdx;
  const q = enc_challengeState.questions[idx];
  const chosen = enc_challengeState.selectedOpt;

  const feedback = document.getElementById('quiz-modal-feedback');
  const ctaBtn = document.getElementById('quiz-modal-cta-btn');
  const xpGainText = document.getElementById('quiz-modal-xp-gain');

  if (chosen === null || !ctaBtn) return;

  enc_challengeState.answered = true;
  const isCorrect = chosen === q.ans;

  // Highlight correct and incorrect options
  q.opts.forEach((_, oi) => {
    const btn = document.getElementById(`quiz-modal-opt-${oi}`);
    if (btn) {
      btn.classList.add('disabled');
      if (oi === q.ans) {
        btn.classList.add('correct');
      } else if (oi === chosen) {
        btn.classList.add('incorrect');
      }
    }
  });

  const CHECK_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><polyline points="20 6 9 17 4 12"/></svg>`;
  const CROSS_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  if (isCorrect) {
    if (window.playSound) window.playSound('success');
    enc_challengeState.score++;
    enc_challengeState.xpGain += 20;
    if (xpGainText) xpGainText.innerText = `+${enc_challengeState.xpGain}`;

    // Add extra XP to localStorage
    const extraXp = (parseInt(localStorage.getItem('logicQuest_extraXp')) || 0) + 20;
    localStorage.setItem('logicQuest_extraXp', extraXp);
    if (window.updateXPDisplay) window.updateXPDisplay();

    if (feedback) {
      feedback.className = 'feedback-alert success';
      feedback.innerHTML = `${CHECK_ICON}<strong>Correct! +20 XP</strong><br><span style="font-size:0.85rem;opacity:0.9">${q.exp}</span>`;
      feedback.style.display = 'block';
    }
  } else {
    if (window.playSound) window.playSound('error');
    if (feedback) {
      feedback.className = 'feedback-alert error';
      feedback.innerHTML = `${CROSS_ICON}<strong>Incorrect.</strong><br><span style="font-size:0.85rem;opacity:0.9;margin-top:4px;display:block">${q.exp}</span>`;
      feedback.style.display = 'block';
    }
  }

  ctaBtn.innerText = enc_challengeState.currentIdx < 4 ? 'Continue' : 'See Results';
  ctaBtn.disabled  = false;
  ctaBtn.onclick   = enc_continueChallenge;
}

function enc_continueChallenge() {
  if (enc_challengeState.currentIdx < 4) {
    enc_challengeState.currentIdx++;
    enc_renderChallengeQuestion();
  } else {
    // Show summary
    document.getElementById('quiz-modal-question-step').style.display = 'none';
    const summary = document.getElementById('quiz-modal-summary-step');
    summary.style.display = 'block';

    const sIcon = document.getElementById('quiz-modal-summary-icon');
    const sTitle = document.getElementById('quiz-modal-summary-title');
    const sText = document.getElementById('quiz-modal-summary-text');
    const sXp = document.getElementById('quiz-modal-summary-xp');
    const ctaBtn = document.getElementById('quiz-modal-cta-btn');

    const score = enc_challengeState.score;
    const TROPHY_SVG = `<svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H3.5a2.5 2.5 0 0 0 0 5H6"/><path d="M18 9h2.5a2.5 2.5 0 0 1 0 5H18"/><path d="M6 9v7a6 6 0 0 0 12 0V9"/><path d="M12 21v2"/><path d="M9 21h6"/></svg>`;
    const THUMB_SVG  = `<svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>`;
    const BOOK_SVG   = `<svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="#818cf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;

    if (sIcon) sIcon.innerHTML = score >= 4 ? TROPHY_SVG : score >= 2 ? THUMB_SVG : BOOK_SVG;
    if (sTitle) sTitle.innerText = score === 5 ? 'Perfect Score!' : score >= 3 ? 'Challenge Completed!' : 'Keep Practising!';
    if (sText) sText.innerText = `You answered ${score} of 5 questions correctly and earned ${enc_challengeState.xpGain} XP!`;
    if (sXp) sXp.innerText = `+${enc_challengeState.xpGain} XP`;

    if (ctaBtn) {
      ctaBtn.innerText = 'Close Challenge';
      ctaBtn.onclick = enc_closeChallenge;
    }

    // Trigger confetti on good scores
    const modalBox = document.getElementById('app-quiz-modal-box');
    if (modalBox && score >= 3) {
      for (let i = 0; i < 40; i++) enc_createConfettiParticle(modalBox);
    }
  }
}

function enc_createConfettiParticle(container) {
  const p = document.createElement('div');
  p.className = 'confetti';
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#fbbf24', '#ec4899'];
  p.style.background = colors[Math.floor(Math.random() * colors.length)];
  p.style.left = Math.random() * 90 + '%';
  p.style.top = '-20px';
  const scale = Math.random() * 0.8 + 0.4;
  p.style.transform = `scale(${scale})`;
  const duration = Math.random() * 2 + 2;
  p.style.animationDuration = duration + 's';
  container.appendChild(p);
  setTimeout(() => { p.remove(); }, duration * 1000);
}

// Expose resize handler
export function refreshEncoderCanvases() {
  updateAnalog(); updateDigital(); updateManchester();
}
