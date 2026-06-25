import UserService from './user-service.js';
export function initSubnetting() {
  const slider = document.getElementById('sn-cidr-slider');
  if (!slider) return;

  slider.addEventListener('input', e => sn_updateCidrVisualizer(parseInt(e.target.value, 10)));

  const ipInput = document.getElementById('sn-ip-address-input');
  if (ipInput) {
    ipInput.addEventListener('input',   debounce(sn_calculateIpSubnet, 300));
    ipInput.addEventListener('keydown', e => { if (e.key === 'Enter') sn_calculateIpSubnet(); });
  }

  document.getElementById('sn-quiz-start-challenge-btn')?.addEventListener('click', sn_startChallenge);
  document.getElementById('close-quiz-modal-btn')?.addEventListener('click', sn_closeChallenge);
  document.getElementById('app-quiz-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('app-quiz-modal')) sn_closeChallenge();
  });

  window.sn_calculateIpSubnet = sn_calculateIpSubnet;

  sn_updateCidrVisualizer(24);
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
function sn_getCidrInfo(cidr) {
  cidr = Math.max(1, Math.min(30, cidr));
  const magicOctetIdx = Math.floor((cidr - 1) / 8);
  const subnetBits    = cidr - magicOctetIdx * 8;
  const hostBitsInMag = 8 - subnetBits;
  const magic         = Math.pow(2, hostBitsInMag);

  const maskParts = [255, 255, 255, 255];
  maskParts[magicOctetIdx] = 256 - magic;
  for (let i = magicOctetIdx + 1; i < 4; i++) maskParts[i] = 0;

  const wildcardParts = maskParts.map(o => 255 - o);
  const totalHostBits = 32 - cidr;
  const hosts = Math.max(0, Math.pow(2, totalHostBits) - 2);
  const subnets = Math.pow(2, subnetBits);

  let classLetter = 'C';
  if (cidr < 16) classLetter = 'A';
  else if (cidr < 24) classLetter = 'B';

  return {
    cidr, classLetter, magicOctetIdx, magic, subnetBits,
    mask:     maskParts.join('.'),
    wildcard: wildcardParts.join('.'),
    subnets, hosts, totalHostBits,
  };
}
function sn_updateCidrVisualizer(cidr) {
  const label = document.getElementById('sn-cidr-label');
  if (label) label.textContent = `/${cidr}`;
  document.querySelectorAll('.sn-cidr-text').forEach(el => (el.textContent = cidr));

  const info = sn_getCidrInfo(cidr);
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('sn-val-mask',    info.mask);
  set('sn-val-wildcard',info.wildcard);
  set('sn-val-magic',   info.magic === 256 ? '256 (Full Octet)' : info.magic);
  set('sn-val-subnets', info.subnets);
  set('sn-val-hosts',   info.hosts.toLocaleString());

  sn_buildBinaryDisplay(cidr);
  sn_renderCheatTable(info.classLetter, cidr);
  sn_renderSubnetBlocks(cidr);
  sn_calculateIpSubnet();
}

function sn_buildBinaryDisplay(cidr) {
  const container = document.getElementById('sn-binary-visualizer');
  if (!container) return;
  container.innerHTML = '';
  const info  = sn_getCidrInfo(cidr);
  const netEnd = (info.classLetter === 'A' ? 8 : info.classLetter === 'B' ? 16 : 24);

  for (let oct = 0; oct < 4; oct++) {
    const octDiv = document.createElement('div');
    octDiv.className = 'sn-octet';
    for (let b = 0; b < 8; b++) {
      const absIdx = oct * 8 + b;
      const span = document.createElement('span');
      if (absIdx < cidr) {
        span.className = 'sn-bit ' + (absIdx < netEnd ? 'sn-network' : 'sn-subnet');
        span.textContent = '1';
      } else {
        span.className = 'sn-bit sn-host';
        span.textContent = '0';
      }
      octDiv.appendChild(span);
    }
    container.appendChild(octDiv);
    if (oct < 3) {
      const dot = document.createElement('span');
      dot.className = 'sn-dot';
      dot.textContent = '.';
      container.appendChild(dot);
    }
  }
}

function sn_renderCheatTable(classLetter, activeCidr) {
  const tbody = document.getElementById('sn-cheat-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  const ranges = { A: [8, 15], B: [16, 23], C: [24, 30] };
  const [min, max] = ranges[classLetter];
  for (let c = min; c <= max; c++) {
    const info = sn_getCidrInfo(c);
    const tr = document.createElement('tr');
    if (c === activeCidr) tr.className = 'sn-active-row';
    tr.innerHTML = `<td>/${c}</td><td>${info.mask}</td><td>${info.hosts.toLocaleString()}</td><td>${info.magic === 256 ? 256 : info.magic}</td>`;
    tbody.appendChild(tr);
  }
}

function sn_renderSubnetBlocks(cidr) {
  const container = document.getElementById('sn-block-container');
  if (!container) return;
  container.innerHTML = '';
  const info = sn_getCidrInfo(cidr);
  const { magic, magicOctetIdx: mi } = info;

  const head = document.createElement('div');
  head.className = 'sn-block-item sn-block-head';
  head.innerHTML = '<span>NETWORK ADDRESS</span><span>USABLE HOST RANGE</span><span>BROADCAST</span>';
  container.appendChild(head);

  const BASE = { A: [10,0,0,0], B: [172,16,0,0], C: [192,168,1,0] };
  const base = [...(BASE[info.classLetter] || [192,168,1,0])];

  if (magic === 256) {
    const net = [...base]; net[mi] = 0;
    const brd = [...net]; for (let i = mi; i < 4; i++) brd[i] = 255;
    const first = [...net]; first[3] = 1;
    const last  = [...brd]; last[3]  = 254;
    const div = document.createElement('div');
    div.className = 'sn-block-item sn-active-block';
    div.innerHTML = `<span>${net.join('.')}</span><span>${first.join('.')} – ${last.join('.')}</span><span>${brd.join('.')}</span>`;
    container.appendChild(div);
    return;
  }

  const maxBlocks = Math.min(info.subnets, 32);
  for (let i = 0; i < maxBlocks; i++) {
    const netOct = i * magic;
    const brdOct = netOct + magic - 1;
    const net = [...base]; net[mi] = netOct; for (let j = mi+1; j < 4; j++) net[j] = 0;
    const brd = [...base]; brd[mi] = brdOct; for (let j = mi+1; j < 4; j++) brd[j] = 255;
    const first = [...net]; first[3]++;
    const last  = [...brd]; last[3]--;

    const div = document.createElement('div');
    div.className = 'sn-block-item';
    div.id = `sn-block-${netOct}`;
    div.innerHTML = `<span>${net.join('.')}</span><span>${first.join('.')} – ${last.join('.')}</span><span>${brd.join('.')}</span>`;
    container.appendChild(div);
  }
  if (info.subnets > 32) {
    const more = document.createElement('div');
    more.style.cssText = 'padding:8px;text-align:center;color:var(--text-muted);font-size:0.75rem';
    more.textContent = `… and ${info.subnets - 32} more subnet blocks`;
    container.appendChild(more);
  }
}
export function sn_calculateIpSubnet() {
  const ipInput  = document.getElementById('sn-ip-address-input');
  const resultBox = document.getElementById('sn-ip-result-box');
  if (!ipInput || !resultBox) return;

  const raw   = ipInput.value.trim();
  const parts = raw.split('.');
  const valid = parts.length === 4 && parts.every(p => /^\d+$/.test(p) && +p >= 0 && +p <= 255);

  if (!valid || !raw) {
    resultBox.style.display = raw.length > 0 ? 'block' : 'none';
    if (raw.length > 0) {
      resultBox.innerHTML = `
        <div style="font-weight:700;color:var(--color-error);margin-bottom:5px">Invalid IP Address</div>
        <p style="font-size:0.825rem;color:var(--text-secondary);margin:0">
          Enter a valid IPv4 in dot-decimal notation, e.g. <code>192.168.1.150</code>
        </p>`;
    }
    return;
  }

  const cidr   = parseInt(document.getElementById('sn-cidr-slider')?.value || '24', 10);
  const info   = sn_getCidrInfo(cidr);
  const { magic, magicOctetIdx: mi } = info;
  const input  = parts.map(Number);

  const netOct = Math.floor(input[mi] / magic) * magic;
  const brdOct = netOct + magic - 1;

  const net   = [...input]; net[mi] = netOct; for (let i = mi+1; i < 4; i++) net[i] = 0;
  const brd   = [...input]; brd[mi] = brdOct; for (let i = mi+1; i < 4; i++) brd[i] = 255;
  const first = [...net];  first[3] = net[3] + 1;
  const last  = [...brd];  last[3]  = brd[3] - 1;

  resultBox.style.display = 'block';
  resultBox.innerHTML = `
    <div style="font-weight:700;font-family:var(--font-header);color:var(--text-primary);margin-bottom:10px;display:flex;justify-content:space-between">
      <span>/${cidr} Analysis – Class ${info.classLetter}</span>
      <span style="color:var(--color-cyan);font-size:0.8rem">Block: ${magic}</span>
    </div>
    <div style="display:grid;grid-template-columns:1.4fr 1.6fr;gap:4px 8px;font-family:var(--font-mono);font-size:0.82rem;">
      <span class="is-text-muted">Subnet Mask:</span>       <strong style="color:#a78bfa">${info.mask}</strong>
      <span class="is-text-muted">Wildcard Mask:</span>     <strong style="color:#f59e0b">${info.wildcard}</strong>
      <span class="is-text-muted">Network Address:</span>   <strong style="color:var(--color-cyan)">${net.join('.')}</strong>
      <span class="is-text-muted">First Usable Host:</span> <span>${first.join('.')}</span>
      <span class="is-text-muted">Last Usable Host:</span>  <span>${last.join('.')}</span>
      <span class="is-text-muted">Broadcast Address:</span> <strong style="color:#818cf8">${brd.join('.')}</strong>
      <span class="is-text-muted">Usable Hosts:</span>      <span style="color:#10b981">${info.hosts.toLocaleString()}</span>
    </div>`;
  document.querySelectorAll('.sn-block-item').forEach(el => el.classList.remove('sn-active-block'));
  const active = document.getElementById(`sn-block-${netOct}`);
  if (active) {
    active.classList.add('sn-active-block');
    active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
const SN_CIDRS_A = [10,11,12,14];
const SN_CIDRS_B = [18,19,20,22];
const SN_CIDRS_C = [25,26,27,28,30];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randIp(cls) {
  if (cls === 'A') return [10,  randInt(10,250), randInt(1,254), randInt(1,254)];
  if (cls === 'B') return [172, 16, randInt(10,250), randInt(1,254)];
  return [192, 168, 1, randInt(10,240)];
}
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const sn_quizTemplates = [
  {
    generate() {
      const cidr = pick([...SN_CIDRS_C, ...SN_CIDRS_B, 25, 26, 27, 28, 30]);
      const info = sn_getCidrInfo(cidr);
      return {
        question: `How many <strong>usable hosts</strong> are available on a <strong>/${cidr}</strong> network?`,
        answer: String(info.hosts),
        hint: `/${cidr}`,
        explanation: `Host bits = 32 − ${cidr} = ${32-cidr}. Total = 2^${32-cidr} = ${Math.pow(2,32-cidr).toLocaleString()}. Usable = Total − 2 = <strong>${info.hosts.toLocaleString()}</strong> (network + broadcast reserved).`,
      };
    },
  },
  {
    generate() {
      const cidr = pick([9,10,13,18,19,22,...SN_CIDRS_C]);
      const info = sn_getCidrInfo(cidr);
      return {
        question: `What is the <strong>subnet mask</strong> for CIDR prefix <strong>/${cidr}</strong>?`,
        answer: info.mask,
        hint: `e.g. 255.255.255.0`,
        explanation: `Full octets of 255 = ${Math.floor(cidr/8)}. Magic octet = 256 − 2^(8−${cidr%8}) = 256 − ${info.magic} = ${256-info.magic}. Mask = <strong>${info.mask}</strong>.`,
      };
    },
  },
  {
    generate() {
      const cls  = pick(['A','B','C']);
      const cidr = pick(cls==='A' ? SN_CIDRS_A : cls==='B' ? SN_CIDRS_B : SN_CIDRS_C);
      const info = sn_getCidrInfo(cidr);
      const ip   = randIp(cls);
      const { magic, magicOctetIdx: mi } = info;
      const netOct = Math.floor(ip[mi] / magic) * magic;
      const net = [...ip]; net[mi] = netOct; for (let i = mi+1; i < 4; i++) net[i] = 0;
      return {
        question: `What is the <strong>network address</strong> for <strong>${ip.join('.')}</strong> with prefix <strong>/${cidr}</strong>?`,
        answer: net.join('.'),
        hint: `e.g. 192.168.1.0`,
        explanation: `Block size = ${magic}. Network octet = floor(${ip[mi]} ÷ ${magic}) × ${magic} = ${netOct}. Network address = <strong>${net.join('.')}</strong>.`,
      };
    },
  },
  {
    generate() {
      const cls  = pick(['A','B','C']);
      const cidr = pick(cls==='A' ? SN_CIDRS_A : cls==='B' ? SN_CIDRS_B : SN_CIDRS_C);
      const info = sn_getCidrInfo(cidr);
      const ip   = randIp(cls);
      const { magic, magicOctetIdx: mi } = info;
      const netOct = Math.floor(ip[mi] / magic) * magic;
      const brd = [...ip]; brd[mi] = netOct + magic - 1; for (let i = mi+1; i < 4; i++) brd[i] = 255;
      return {
        question: `What is the <strong>broadcast address</strong> for <strong>${ip.join('.')}</strong> with prefix <strong>/${cidr}</strong>?`,
        answer: brd.join('.'),
        hint: `e.g. 192.168.1.255`,
        explanation: `Block size = ${magic}. Network octet = ${netOct}, Broadcast = ${netOct} + ${magic} − 1 = ${netOct+magic-1}. Broadcast = <strong>${brd.join('.')}</strong>.`,
      };
    },
  },
  {
    generate() {
      const cidr = pick(SN_CIDRS_C);
      const info = sn_getCidrInfo(cidr);
      const need = randInt(1, info.hosts - 1);
      return {
        question: `You need <strong>${need} hosts</strong> on one subnet. What is the <strong>minimum (smallest) CIDR prefix</strong> that fits?`,
        answer: `/${cidr}`,
        hint: `e.g. /26`,
        explanation: `You need 2^n − 2 ≥ ${need}. Host bits needed = ${32-cidr} → CIDR = <strong>/${cidr}</strong> (gives ${info.hosts} usable hosts).`,
      };
    },
  },
  {
    generate() {
      const cls  = pick(['B','C']);
      const cidr = pick(cls === 'B' ? SN_CIDRS_B : SN_CIDRS_C);
      const info = sn_getCidrInfo(cidr);
      return {
        question: `A Class ${cls} network is subnetted to <strong>/${cidr}</strong>. How many <strong>subnets</strong> are created?`,
        answer: String(info.subnets),
        hint: `A number`,
        explanation: `Borrowed bits = ${info.subnetBits}. Subnets = 2^${info.subnetBits} = <strong>${info.subnets}</strong>.`,
      };
    },
  },
  {
    generate() {
      const cls  = pick(['B','C']);
      const cidr = pick(cls === 'B' ? SN_CIDRS_B : SN_CIDRS_C);
      const info = sn_getCidrInfo(cidr);
      const ip   = randIp(cls);
      const { magic, magicOctetIdx: mi } = info;
      const netOct = Math.floor(ip[mi] / magic) * magic;
      const net = [...ip]; net[mi] = netOct; for (let i = mi+1; i < 4; i++) net[i] = 0;
      const first = [...net]; first[3]++;
      return {
        question: `What is the <strong>first usable host</strong> for IP <strong>${ip.join('.')}</strong> with mask <strong>/${cidr}</strong>?`,
        answer: first.join('.'),
        hint: `e.g. 192.168.1.1`,
        explanation: `Network address = ${net.join('.')}. First usable host = Network + 1 = <strong>${first.join('.')}</strong>.`,
      };
    },
  },
  {
    generate() {
      const cls  = pick(['B','C']);
      const cidr = pick(cls === 'B' ? SN_CIDRS_B : SN_CIDRS_C);
      const info = sn_getCidrInfo(cidr);
      const ip   = randIp(cls);
      const { magic, magicOctetIdx: mi } = info;
      const netOct = Math.floor(ip[mi] / magic) * magic;
      const brd = [...ip]; brd[mi] = netOct + magic - 1; for (let i = mi+1; i < 4; i++) brd[i] = 255;
      const last = [...brd]; last[3]--;
      return {
        question: `What is the <strong>last usable host</strong> for IP <strong>${ip.join('.')}</strong> with mask <strong>/${cidr}</strong>?`,
        answer: last.join('.'),
        hint: `e.g. 192.168.1.254`,
        explanation: `Broadcast = ${brd.join('.')}. Last usable = Broadcast − 1 = <strong>${last.join('.')}</strong>.`,
      };
    },
  },
  {
    generate() {
      const cidr = pick([8,16,24,25,26,27,28,29,30,18,19,20,22]);
      const info = sn_getCidrInfo(cidr);
      return {
        question: `What is the <strong>CIDR prefix length</strong> for subnet mask <strong>${info.mask}</strong>?`,
        answer: `/${cidr}`,
        hint: `e.g. /24`,
        explanation: `Count the 1-bits in ${info.mask}: the result is /${cidr}. You can also use: 256 − magic octet = ${256-(info.magic===256?0:info.mask.split('.').find((v,i)=>v<255&&v>0)?parseInt(info.mask.split('.').find((v,i)=>v<255&&v>0)):0)}.`,
      };
    },
  },
  {
    generate() {
      const sizes = [
        { need: 2,   cidr: 30, why: '2^2−2=2 hosts' },
        { need: 6,   cidr: 29, why: '2^3−2=6 hosts' },
        { need: 14,  cidr: 28, why: '2^4−2=14 hosts' },
        { need: 30,  cidr: 27, why: '2^5−2=30 hosts' },
        { need: 62,  cidr: 26, why: '2^6−2=62 hosts' },
        { need: 126, cidr: 25, why: '2^7−2=126 hosts' },
        { need: 254, cidr: 24, why: '2^8−2=254 hosts' },
      ];
      const s = pick(sizes);
      return {
        question: `A department needs exactly <strong>${s.need} host addresses</strong>. What is the <strong>smallest (most efficient) CIDR prefix</strong> to use?`,
        answer: `/${s.cidr}`,
        hint: `e.g. /28`,
        explanation: `/${s.cidr} provides ${s.why} — exactly enough for ${s.need} host(s). Going larger wastes addresses.`,
      };
    },
  },
];
function normaliseAnswer(raw) {
  if (!raw) return '';
  return raw.trim().toLowerCase().replace(/^\/+/, '').replace(/\s+/g, '');
}

function normaliseExpected(raw) {
  if (!raw) return '';
  return raw.trim().toLowerCase().replace(/^\/+/, '').replace(/\s+/g, '');
}

function answersMatch(user, expected) {
  const u = normaliseAnswer(user);
  const e = normaliseExpected(expected);
  if (u === e) return true;
  if (`/${u}` === e) return true;
  return false;
}
let sn_state = {
  currentIdx: 0,
  score: 0,
  xpGain: 0,
  questions: [],
};

function sn_startChallenge() {
  const pool = [...sn_quizTemplates].sort(() => 0.5 - Math.random());
  sn_state.questions = pool.slice(0, 5).map(t => t.generate());
  sn_state.currentIdx = 0;
  sn_state.score      = 0;
  sn_state.xpGain     = 0;

  const modal = document.getElementById('app-quiz-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  sn_renderQuestion();
}

function sn_closeChallenge() {
  const modal = document.getElementById('app-quiz-modal');
  if (modal) modal.style.display = 'none';
}

function sn_renderQuestion() {
  const idx = sn_state.currentIdx;
  const q   = sn_state.questions[idx];

  const progress  = document.getElementById('quiz-modal-progress');
  const qNum      = document.getElementById('quiz-modal-q-num');
  const qText     = document.getElementById('quiz-modal-question-text');
  const areaEl    = document.getElementById('quiz-modal-answer-area');
  const feedback  = document.getElementById('quiz-modal-feedback');
  const ctaBtn    = document.getElementById('quiz-modal-cta-btn');
  const xpEl      = document.getElementById('quiz-modal-xp-gain');

  document.getElementById('quiz-modal-question-step').style.display = 'block';
  document.getElementById('quiz-modal-summary-step').style.display  = 'none';

  if (progress) progress.style.width = `${((idx + 1) / 5) * 100}%`;
  if (qNum)  qNum.textContent  = `Question ${idx + 1} of 5`;
  if (qText) qText.innerHTML   = q.question;
  if (xpEl)  xpEl.textContent  = `+${sn_state.xpGain}`;

  if (areaEl) {
    areaEl.innerHTML = `
      <div class="quiz-modal-input-wrap">
        <input type="text" class="quiz-modal-input" id="quiz-modal-input-field"
          placeholder="${q.hint || 'Enter your answer…'}" autocomplete="off" spellcheck="false">
      </div>`;

    const field = document.getElementById('quiz-modal-input-field');
    if (field) {
      field.focus();
      field.addEventListener('input', () => {
        if (ctaBtn) ctaBtn.disabled = !field.value.trim();
      });
      field.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !ctaBtn?.disabled) {
          if (ctaBtn?.textContent === 'Check Answer') sn_checkAnswer();
          else sn_continue();
        }
      });
    }
  }

  if (feedback) { feedback.className = 'feedback-alert'; feedback.innerHTML = ''; feedback.style.display = 'none'; }
  if (ctaBtn)   { ctaBtn.textContent = 'Check Answer'; ctaBtn.disabled = true; ctaBtn.onclick = sn_checkAnswer; }
}

function sn_checkAnswer() {
  const idx = sn_state.currentIdx;
  const q   = sn_state.questions[idx];

  const field    = document.getElementById('quiz-modal-input-field');
  const feedback = document.getElementById('quiz-modal-feedback');
  const ctaBtn   = document.getElementById('quiz-modal-cta-btn');
  const xpEl     = document.getElementById('quiz-modal-xp-gain');

  if (!field) return;
  const isCorrect = answersMatch(field.value, q.answer);
  if (field) field.disabled = true;

  const CHECK = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="is-vam-mr6"><polyline points="20 6 9 17 4 12"/></svg>`;
  const CROSS = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="is-vam-mr6"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  if (isCorrect) {
    if (window.playSound) window.playSound('success');
    sn_state.score++;
    sn_state.xpGain += 20;
    if (xpEl) xpEl.textContent = `+${sn_state.xpGain}`;
    UserService.addXP(20);

    if (feedback) {
      feedback.className = 'feedback-alert success';
      feedback.innerHTML = `${CHECK}<strong>Correct! +20 XP</strong><br><span style="font-size:0.85rem;opacity:0.9">${q.explanation}</span>`;
      feedback.style.display = 'block';
    }
    if (field) { field.classList.add('correct'); }
  } else {
    if (window.playSound) window.playSound('error');
    if (feedback) {
      feedback.className = 'feedback-alert error';
      feedback.innerHTML = `${CROSS}<strong>Incorrect.</strong> Correct answer: <code>${q.answer}</code><br><span style="font-size:0.85rem;opacity:0.9;display:block;margin-top:4px">${q.explanation}</span>`;
      feedback.style.display = 'block';
    }
    if (field) { field.classList.add('incorrect'); }
  }

  if (ctaBtn) {
    ctaBtn.textContent = idx < 4 ? 'Continue' : 'See Results';
    ctaBtn.disabled    = false;
    ctaBtn.onclick     = sn_continue;
  }
}

function sn_continue() {
  if (sn_state.currentIdx < 4) {
    sn_state.currentIdx++;
    sn_renderQuestion();
  } else {
    sn_showSummary();
  }
}

function sn_showSummary() {
  document.getElementById('quiz-modal-question-step').style.display = 'none';
  const summary = document.getElementById('quiz-modal-summary-step');
  if (summary) summary.style.display = 'block';

  const score = sn_state.score;
  const TROPHY = `<svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H3.5a2.5 2.5 0 0 0 0 5H6"/><path d="M18 9h2.5a2.5 2.5 0 0 1 0 5H18"/><path d="M6 9v7a6 6 0 0 0 12 0V9"/><path d="M12 21v2"/><path d="M9 21h6"/></svg>`;
  const THUMB  = `<svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>`;
  const BOOK   = `<svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="#818cf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;

  const icon  = score >= 4 ? TROPHY : score >= 2 ? THUMB : BOOK;
  const title = score === 5 ? 'Perfect Score! 🏆' : score >= 3 ? 'Challenge Completed!' : 'Keep Practising!';
  const msg   = `You answered ${score} of 5 questions correctly and earned ${sn_state.xpGain} XP!`;

  const set = (id, v, isHtml = false) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (isHtml) el.innerHTML = v; else el.textContent = v;
  };

  set('quiz-modal-summary-icon',  icon, true);
  set('quiz-modal-summary-title', title);
  set('quiz-modal-summary-text',  msg);
  set('quiz-modal-summary-xp',    `+${sn_state.xpGain} XP`);

  const ctaBtn = document.getElementById('quiz-modal-cta-btn');
  if (ctaBtn) { ctaBtn.textContent = 'Close'; ctaBtn.disabled = false; ctaBtn.onclick = sn_closeChallenge; }

  if (score >= 3) {
    const box = document.getElementById('app-quiz-modal-box');
    if (box) for (let i = 0; i < 40; i++) sn_confetti(box);
  }
  if (window.UserService && UserService.logActivity) {
    UserService.logActivity('subnetting-quiz', `Score: ${score}/5, XP: ${sn_state.xpGain}`);
  }
}

function sn_confetti(container) {
  const p = document.createElement('div');
  p.className = 'confetti';
  const colors = ['#6366f1','#06b6d4','#10b981','#fbbf24','#ec4899'];
  p.style.background = pick(colors);
  p.style.left = `${Math.random() * 90}%`;
  p.style.top  = '-20px';
  p.style.transform = `scale(${Math.random() * 0.8 + 0.4})`;
  const dur = Math.random() * 2 + 2;
  p.style.animationDuration = dur + 's';
  container.appendChild(p);
  setTimeout(() => p.remove(), dur * 1000);
}