// ============================================================
//  LogicQuest — Subnetting Master Module
//  All DOM IDs are prefixed with "sn-" to prevent conflicts
// ============================================================

let sn_activeQuiz = null;

export function initSubnetting() {
  const slider = document.getElementById('sn-cidr-slider');
  if (!slider) return;

  slider.addEventListener('input', (e) => sn_updateCidrVisualizer(parseInt(e.target.value)));

  const ipInput = document.getElementById('sn-ip-address-input');
  if (ipInput) {
    ipInput.addEventListener('input', sn_calculateIpSubnet);
    ipInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sn_calculateIpSubnet(); });
  }

  const startChallengeBtn = document.getElementById('sn-quiz-start-challenge-btn');
  if (startChallengeBtn) {
    startChallengeBtn.addEventListener('click', sn_startChallenge);
  }

  // Expose onclick-bound functions globally
  window.sn_calculateIpSubnet  = sn_calculateIpSubnet;

  sn_updateCidrVisualizer(24);
}

// ── Core CIDR math ────────────────────────────────────────────
function sn_getCidrInfo(cidr) {
  const magicOctetIdx   = Math.floor((cidr - 1) / 8);
  const baseClassPrefix = magicOctetIdx * 8;
  const subnetBits      = cidr - baseClassPrefix;
  const hostBitsInMagic = 8 - subnetBits;
  const magic           = Math.pow(2, hostBitsInMagic);

  const maskParts = [255, 255, 255, 255];
  maskParts[magicOctetIdx] = 256 - magic;
  for (let i = magicOctetIdx + 1; i < 4; i++) maskParts[i] = 0;

  // Wildcard mask = bitwise inverse of subnet mask
  const wildcardParts = maskParts.map(o => 255 - o);
  const wildcard      = wildcardParts.join('.');

  const mask          = maskParts.join('.');
  const subnets       = Math.pow(2, subnetBits);
  const totalHostBits = 32 - cidr;
  const hosts         = Math.pow(2, totalHostBits) - 2;

  let classLetter = 'C';
  if (cidr < 16) classLetter = 'A';
  else if (cidr < 24) classLetter = 'B';

  return { cidr, classLetter, magicOctetIdx, magic, mask, wildcard, subnets, hosts, totalHostBits, subnetBits };
}

// ── CIDR Visualizer ───────────────────────────────────────────
function sn_updateCidrVisualizer(cidr) {
  const label = document.getElementById('sn-cidr-label');
  if (label) label.innerText = `/${cidr}`;
  document.querySelectorAll('.sn-cidr-text').forEach(el => el.innerText = cidr);

  const info = sn_getCidrInfo(cidr);
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
  set('sn-val-mask',     info.mask);
  set('sn-val-wildcard', info.wildcard);
  set('sn-val-magic',    info.magic === 256 ? '256 (Full Octet)' : info.magic);
  set('sn-val-subnets',  info.subnets);
  set('sn-val-hosts',    info.hosts.toLocaleString());

  sn_renderCheatTable(info.classLetter, cidr);
  sn_buildBinaryDisplay(cidr);
  sn_renderSubnetBlocks(cidr);
  sn_calculateIpSubnet();
}

function sn_buildBinaryDisplay(cidr) {
  const container = document.getElementById('sn-binary-visualizer');
  if (!container) return;
  container.innerHTML = '';
  const info = sn_getCidrInfo(cidr);

  for (let oct = 0; oct < 4; oct++) {
    const octDiv = document.createElement('div');
    octDiv.className = 'sn-octet';
    for (let b = 0; b < 8; b++) {
      const span = document.createElement('span');
      const absIdx = oct * 8 + b;
      if (absIdx < cidr) {
        const defaultBit = absIdx < (info.classLetter === 'A' ? 8 : info.classLetter === 'B' ? 16 : 24);
        span.className = 'sn-bit ' + (defaultBit ? 'sn-network' : 'sn-subnet');
        span.innerText = '1';
      } else {
        span.className = 'sn-bit sn-host';
        span.innerText = '0';
      }
      octDiv.appendChild(span);
    }
    container.appendChild(octDiv);
    if (oct < 3) {
      const dot = document.createElement('span');
      dot.className = 'sn-dot';
      dot.innerText = '.';
      container.appendChild(dot);
    }
  }
}

function sn_renderCheatTable(classLetter, activeCidr) {
  const tbody = document.getElementById('sn-cheat-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  let minCidr = 24, maxCidr = 30;
  if (classLetter === 'A') { minCidr = 8;  maxCidr = 15; }
  else if (classLetter === 'B') { minCidr = 16; maxCidr = 23; }

  for (let c = minCidr; c <= maxCidr; c++) {
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
  const { magic, magicOctetIdx: mOctIdx } = info;

  function buildNetAddr(magicVal) {
    const p = [0, 0, 0, 0];
    if (info.classLetter === 'A')      { p[0] = 10; }
    else if (info.classLetter === 'B') { p[0] = 172; p[1] = 16; }
    else                               { p[0] = 192; p[1] = 168; p[2] = 1; }
    p[mOctIdx] = magicVal;
    return p;
  }

  const head = document.createElement('div');
  head.className = 'sn-block-item sn-block-head';
  head.innerHTML = `<span>NET ADDRESS</span><span>USABLE HOST RANGE</span><span>BROADCAST</span>`;
  container.appendChild(head);

  if (magic === 256) {
    const netParts = buildNetAddr(0);
    const broadParts = [...netParts];
    for (let i = mOctIdx; i < 4; i++) broadParts[i] = 255;
    const firstParts = [...netParts]; firstParts[3] = 1;
    const lastParts  = [...broadParts]; lastParts[3]  = 254;
    const div = document.createElement('div');
    div.className = 'sn-block-item sn-active-block';
    div.innerHTML = `<span>${netParts.join('.')}</span><span>${firstParts.join('.')} – ${lastParts.join('.')}</span><span>${broadParts.join('.')}</span>`;
    container.appendChild(div);
    return;
  }

  const maxBlocks = Math.min(info.subnets, 32);
  for (let i = 0; i < maxBlocks; i++) {
    const magicStart = i * magic;
    const magicEnd   = magicStart + magic - 1;
    const netParts   = buildNetAddr(magicStart);
    const broadParts = buildNetAddr(magicEnd);
    for (let j = mOctIdx + 1; j < 4; j++) { netParts[j] = 0; broadParts[j] = 255; }
    const firstParts = [...netParts];  firstParts[3]++;
    const lastParts  = [...broadParts]; lastParts[3]--;

    const blockDiv = document.createElement('div');
    blockDiv.className = 'sn-block-item';
    blockDiv.id = `sn-block-${magicStart}`;
    blockDiv.innerHTML = `<span>${netParts.join('.')}</span><span>${firstParts.join('.')} – ${lastParts.join('.')}</span><span>${broadParts.join('.')}</span>`;
    container.appendChild(blockDiv);
  }
  if (info.subnets > 32) {
    const more = document.createElement('div');
    more.style.cssText = 'padding:8px;text-align:center;color:var(--text-muted);font-size:0.75rem';
    more.innerText = `… and ${info.subnets - 32} more subnet blocks`;
    container.appendChild(more);
  }
}

function sn_calculateIpSubnet() {
  const ipInput   = document.getElementById('sn-ip-address-input');
  const resultBox = document.getElementById('sn-ip-result-box');
  if (!ipInput || !resultBox) return;

  const rawVal = ipInput.value.trim();
  const parts  = rawVal.split('.');
  if (parts.length !== 4 || parts.some(p => isNaN(parseInt(p)) || parseInt(p) < 0 || parseInt(p) > 255)) {
    resultBox.style.display = 'none';
    return;
  }

  const cidr     = parseInt(document.getElementById('sn-cidr-slider').value);
  const info     = sn_getCidrInfo(cidr);
  const { magic, magicOctetIdx: mOctIdx } = info;

  const inputOctetVal = parseInt(parts[mOctIdx]);
  const netOctetVal   = Math.floor(inputOctetVal / magic) * magic;

  const netParts   = [...parts];
  netParts[mOctIdx] = netOctetVal;
  for (let i = mOctIdx + 1; i < 4; i++) netParts[i] = 0;

  const broadParts = [...parts];
  broadParts[mOctIdx] = netOctetVal + magic - 1;
  for (let i = mOctIdx + 1; i < 4; i++) broadParts[i] = 255;

  const firstParts = [...netParts];  firstParts[3] = parseInt(firstParts[3]) + 1;
  const lastParts  = [...broadParts]; lastParts[3]  = parseInt(lastParts[3])  - 1;

  const info2 = sn_getCidrInfo(cidr);
  resultBox.style.display = 'block';
  resultBox.innerHTML = `
    <div style="font-weight:700;font-family:var(--font-header);color:var(--text-primary);margin-bottom:10px;display:flex;justify-content:space-between;">
      <span>IP Analysis — /${cidr} (Class ${info2.classLetter})</span>
      <span style="color:var(--color-cyan);font-size:0.8rem">Block: ${magic}</span>
    </div>
    <div style="display:grid;grid-template-columns:1.4fr 1.6fr;gap:5px 8px;font-family:var(--font-mono);font-size:0.83rem;">
      <span style="color:var(--text-muted)">Subnet Mask:</span>       <strong style="color:#a78bfa">${info2.mask}</strong>
      <span style="color:var(--text-muted)">Wildcard Mask:</span>     <strong style="color:#f59e0b">${info2.wildcard}</strong>
      <span style="color:var(--text-muted)">Network Address:</span>   <strong style="color:var(--color-cyan)">${netParts.join('.')}</strong>
      <span style="color:var(--text-muted)">First Usable Host:</span> <span>${firstParts.join('.')}</span>
      <span style="color:var(--text-muted)">Last Usable Host:</span>  <span>${lastParts.join('.')}</span>
      <span style="color:var(--text-muted)">Broadcast Address:</span> <strong style="color:#818cf8">${broadParts.join('.')}</strong>
      <span style="color:var(--text-muted)">Usable Hosts:</span>      <span style="color:#10b981">${info2.hosts.toLocaleString()}</span>
    </div>`;

  document.querySelectorAll('.sn-block-item').forEach(el => el.classList.remove('sn-active-block'));
  const activeBlock = document.getElementById(`sn-block-${netOctetVal}`);
  if (activeBlock) {
    activeBlock.classList.add('sn-active-block');
    activeBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ── Quiz ──────────────────────────────────────────────────────
const sn_quizTemplates = [
  {
    type: 'hosts',
    question: 'How many <strong>usable hosts</strong> are in a <strong>/{cidr}</strong> network?',
    generate: () => {
      const cidrs = [10,12,14,18,20,22,25,26,27,28,30];
      const cidr  = cidrs[Math.floor(Math.random() * cidrs.length)];
      const info  = sn_getCidrInfo(cidr);
      return {
        cidr,
        answer: info.hosts.toString(),
        explanation: `<strong>Step-by-step for /${cidr}:</strong><br>
          1. Host bits = 32 − ${cidr} = <code>${32-cidr}</code><br>
          2. Total = 2<sup>${32-cidr}</sup> = <code>${Math.pow(2,32-cidr).toLocaleString()}</code><br>
          3. Usable = Total − 2 = <strong>${info.hosts.toLocaleString()}</strong> (network + broadcast reserved)`
      };
    }
  },
  {
    type: 'mask',
    question: 'What is the <strong>subnet mask</strong> for CIDR <strong>/{cidr}</strong>?',
    generate: () => {
      const cidrs = [9,10,13,18,19,22,25,26,27,28,30];
      const cidr  = cidrs[Math.floor(Math.random() * cidrs.length)];
      const info  = sn_getCidrInfo(cidr);
      return {
        cidr,
        answer: info.mask,
        explanation: `<strong>Step-by-step for /${cidr}:</strong><br>
          1. ${Math.floor(cidr/8)} full octet(s) of 255.<br>
          2. Remainder bits in magic octet: ${cidr%8}<br>
          3. Magic octet value = 256 − 2<sup>${8-(cidr%8)}</sup> = 256 − ${info.magic} = <code>${256-info.magic}</code><br>
          4. Mask = <strong>${info.mask}</strong>`
      };
    }
  },
  {
    type: 'net-addr',
    question: 'What is the <strong>network address</strong> for IP <strong>{ip}</strong> with CIDR <strong>/{cidr}</strong>?',
    generate: () => {
      const cls = ['A','B','C'][Math.floor(Math.random()*3)];
      let cidr, parts;
      if      (cls==='A') { cidr=[10,11,12,14][Math.floor(Math.random()*4)]; parts=[10,Math.floor(Math.random()*240)+10,Math.floor(Math.random()*254),Math.floor(Math.random()*254)]; }
      else if (cls==='B') { cidr=[18,19,20,22][Math.floor(Math.random()*4)]; parts=[172,16,Math.floor(Math.random()*240)+10,Math.floor(Math.random()*254)]; }
      else                { cidr=[25,26,27,28][Math.floor(Math.random()*4)]; parts=[192,168,1,Math.floor(Math.random()*240)+10]; }
      const ip   = parts.join('.');
      const info = sn_getCidrInfo(cidr);
      const { magic, magicOctetIdx: mi } = info;
      const netOct = Math.floor(parts[mi]/magic)*magic;
      const netP   = [...parts]; netP[mi] = netOct;
      for (let i=mi+1;i<4;i++) netP[i]=0;
      return {
        cidr, ip,
        answer: netP.join('.'),
        explanation: `<strong>Step-by-step for ${ip} /${cidr}:</strong><br>
          1. Class ${cls} → magic octet index = ${mi+1}, value = ${parts[mi]}<br>
          2. Block size = <code>${magic}</code><br>
          3. Network octet = floor(${parts[mi]} ÷ ${magic}) × ${magic} = <code>${netOct}</code><br>
          4. Network address = <strong>${netP.join('.')}</strong>`
      };
    }
  },
  {
    type: 'broad-addr',
    question: 'What is the <strong>broadcast address</strong> for IP <strong>{ip}</strong> with CIDR <strong>/{cidr}</strong>?',
    generate: () => {
      const cls = ['A','B','C'][Math.floor(Math.random()*3)];
      let cidr, parts;
      if      (cls==='A') { cidr=[10,11,12,14][Math.floor(Math.random()*4)]; parts=[10,Math.floor(Math.random()*240)+10,Math.floor(Math.random()*254),Math.floor(Math.random()*254)]; }
      else if (cls==='B') { cidr=[18,19,20,22][Math.floor(Math.random()*4)]; parts=[172,16,Math.floor(Math.random()*240)+10,Math.floor(Math.random()*254)]; }
      else                { cidr=[25,26,27,28][Math.floor(Math.random()*4)]; parts=[192,168,1,Math.floor(Math.random()*240)+10]; }
      const ip   = parts.join('.');
      const info = sn_getCidrInfo(cidr);
      const { magic, magicOctetIdx: mi } = info;
      const netOct  = Math.floor(parts[mi]/magic)*magic;
      const broadP  = [...parts]; broadP[mi] = netOct+magic-1;
      for (let i=mi+1;i<4;i++) broadP[i]=255;
      return {
        cidr, ip,
        answer: broadP.join('.'),
        explanation: `<strong>Step-by-step for ${ip} /${cidr}:</strong><br>
          1. Network octet = ${netOct}, block size = ${magic}<br>
          2. Broadcast value = ${netOct} + ${magic} − 1 = <code>${netOct+magic-1}</code><br>
          3. Remaining octets → 255<br>
          4. Broadcast = <strong>${broadP.join('.')}</strong>`
      };
    }
  },
  {
    type: 'wildcard',
    question: 'What is the <strong>wildcard mask</strong> for CIDR <strong>/{cidr}</strong>?',
    generate: () => {
      const cidrs = [8,10,16,18,20,22,24,25,26,27,28,30];
      const cidr  = cidrs[Math.floor(Math.random() * cidrs.length)];
      const info  = sn_getCidrInfo(cidr);
      return {
        cidr,
        answer: info.wildcard,
        explanation: `<strong>Wildcard for /${cidr}:</strong><br>
          1. Subnet mask = <code>${info.mask}</code><br>
          2. Wildcard = 255.255.255.255 − Subnet mask<br>
          3. Each octet: 255 − mask octet value<br>
          4. Wildcard mask = <strong>${info.wildcard}</strong>`
      };
    }
  },
  {
    type: 'hosts-needed',
    question: 'You need to support <strong>{hosts} hosts</strong> on one subnet. What is the <strong>minimum CIDR prefix</strong> (e.g. /26)?',
    generate: () => {
      const targetCidrs = [25, 26, 27, 28, 29];
      const cidr = targetCidrs[Math.floor(Math.random() * targetCidrs.length)];
      const info = sn_getCidrInfo(cidr);
      // Show a host count between (prev block - 2) and info.hosts to make it unique
      const hostsNeeded = Math.floor(Math.random() * (info.hosts - 1)) + 1;
      return {
        cidr,
        hostsNeeded,
        answer: `/${cidr}`,
        explanation: `<strong>To support ${hostsNeeded} hosts:</strong><br>
          1. Need host bits: smallest n where 2ⁿ − 2 ≥ ${hostsNeeded}<br>
          2. Host bits needed = ${32 - cidr} → CIDR = /${cidr}<br>
          3. /${cidr} gives <strong>${info.hosts}</strong> usable hosts — fits ${hostsNeeded} hosts<br>
          Subnet mask = <code>${info.mask}</code>`
      };
    }
  }
];

let sn_challengeState = {
  currentIdx: 0,
  score: 0,
  xpGain: 0,
  questions: []
};

function sn_startChallenge() {
  // Generate 5 random questions
  sn_challengeState.questions = [];
  sn_challengeState.currentIdx = 0;
  sn_challengeState.score = 0;
  sn_challengeState.xpGain = 0;

  for (let i = 0; i < 5; i++) {
    const template = sn_quizTemplates[Math.floor(Math.random() * sn_quizTemplates.length)];
    const qData = template.generate();
    const qText = template.question
      .replace('{cidr}', qData.cidr)
      .replace('{ip}', qData.ip || '')
      .replace('{hosts}', qData.hostsNeeded || '');
    sn_challengeState.questions.push({
      text: qText,
      answer: qData.answer,
      explanation: qData.explanation
    });
  }

  // Open modal
  const modal = document.getElementById('app-quiz-modal');
  if (!modal) return;
  modal.style.display = 'flex';

  // Setup close events
  const closeBtn = document.getElementById('close-quiz-modal-btn');
  if (closeBtn) closeBtn.onclick = sn_closeChallenge;

  sn_renderChallengeQuestion();
}

function sn_closeChallenge() {
  const modal = document.getElementById('app-quiz-modal');
  if (modal) modal.style.display = 'none';
}

function sn_renderChallengeQuestion() {
  const idx = sn_challengeState.currentIdx;
  const q = sn_challengeState.questions[idx];

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
  if (qText) qText.innerHTML = q.text;
  if (xpGainText) xpGainText.innerText = `+${sn_challengeState.xpGain}`;

  // Render input
  if (answerArea) {
    answerArea.innerHTML = `
      <div class="quiz-modal-input-wrap">
        <input type="text" class="quiz-modal-input" id="quiz-modal-input-field" placeholder="Enter your answer..." autocomplete="off">
      </div>
    `;
    const inputField = document.getElementById('quiz-modal-input-field');
    if (inputField) {
      inputField.focus();
      inputField.addEventListener('input', () => {
        ctaBtn.disabled = inputField.value.trim().length === 0;
      });
      inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !ctaBtn.disabled) {
          if (ctaBtn.innerText === 'Check Answer') {
            sn_checkChallengeAnswer();
          } else {
            sn_continueChallenge();
          }
        }
      });
    }
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
    ctaBtn.onclick = sn_checkChallengeAnswer;
  }
}

function sn_checkChallengeAnswer() {
  const idx = sn_challengeState.currentIdx;
  const q   = sn_challengeState.questions[idx];

  const inputField = document.getElementById('quiz-modal-input-field');
  const feedback   = document.getElementById('quiz-modal-feedback');
  const ctaBtn     = document.getElementById('quiz-modal-cta-btn');
  const xpGainText = document.getElementById('quiz-modal-xp-gain');

  if (!inputField || !ctaBtn) return;

  const userAnswer = inputField.value.trim().toLowerCase();
  const isCorrect  = userAnswer === q.answer.toLowerCase();

  inputField.disabled = true;

  const CHECK_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><polyline points="20 6 9 17 4 12"/></svg>`;
  const CROSS_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  if (isCorrect) {
    if (window.playSound) window.playSound('success');
    sn_challengeState.score++;
    sn_challengeState.xpGain += 20;
    if (xpGainText) xpGainText.innerText = `+${sn_challengeState.xpGain}`;

    const extraXp = (parseInt(localStorage.getItem('logicQuest_extraXp')) || 0) + 20;
    localStorage.setItem('logicQuest_extraXp', extraXp);
    if (window.updateXPDisplay) window.updateXPDisplay();

    if (feedback) {
      feedback.className = 'feedback-alert success';
      feedback.innerHTML = `${CHECK_ICON}<strong>Correct! +20 XP</strong><br><span style="font-size:0.85rem;opacity:0.9">${q.explanation}</span>`;
      feedback.style.display = 'block';
    }
  } else {
    if (window.playSound) window.playSound('error');
    if (feedback) {
      feedback.className = 'feedback-alert error';
      feedback.innerHTML = `${CROSS_ICON}<strong>Incorrect.</strong> Correct answer: <code>${q.answer}</code><br><span style="font-size:0.85rem;opacity:0.9;margin-top:4px;display:block">${q.explanation}</span>`;
      feedback.style.display = 'block';
    }
  }

  if (ctaBtn) {
    ctaBtn.innerText = idx < 4 ? 'Continue' : 'See Results';
    ctaBtn.disabled  = false;
    ctaBtn.onclick   = sn_continueChallenge;
  }
}

function sn_continueChallenge() {
  if (sn_challengeState.currentIdx < 4) {
    sn_challengeState.currentIdx++;
    sn_renderChallengeQuestion();
  } else {
    // Show summary
    document.getElementById('quiz-modal-question-step').style.display = 'none';
    const summary = document.getElementById('quiz-modal-summary-step');
    if (summary) summary.style.display = 'block';

    const sIcon  = document.getElementById('quiz-modal-summary-icon');
    const sTitle = document.getElementById('quiz-modal-summary-title');
    const sText  = document.getElementById('quiz-modal-summary-text');
    const sXp    = document.getElementById('quiz-modal-summary-xp');
    const ctaBtn = document.getElementById('quiz-modal-cta-btn');

    const score = sn_challengeState.score;

    const TROPHY_SVG = `<svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H3.5a2.5 2.5 0 0 0 0 5H6"/><path d="M18 9h2.5a2.5 2.5 0 0 1 0 5H18"/><path d="M6 9v7a6 6 0 0 0 12 0V9"/><path d="M12 21v2"/><path d="M9 21h6"/></svg>`;
    const THUMB_SVG  = `<svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>`;
    const BOOK_SVG   = `<svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="#818cf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;

    if (sIcon) sIcon.innerHTML = score >= 4 ? TROPHY_SVG : score >= 2 ? THUMB_SVG : BOOK_SVG;
    if (sTitle) sTitle.innerText = score === 5 ? 'Perfect Score!' : score >= 3 ? 'Challenge Completed!' : 'Keep Practising!';
    if (sText) sText.innerText = `You answered ${score} of 5 questions correctly and earned ${sn_challengeState.xpGain} XP!`;
    if (sXp) sXp.innerText = `+${sn_challengeState.xpGain} XP`;

    if (ctaBtn) {
      ctaBtn.innerText = 'Close Challenge';
      ctaBtn.disabled  = false;
      ctaBtn.onclick   = sn_closeChallenge;
    }

    // Confetti
    const modalBox = document.getElementById('app-quiz-modal-box');
    if (modalBox && score >= 3) {
      for (let i = 0; i < 40; i++) sn_createConfettiParticle(modalBox);
    }
  }
}

function sn_createConfettiParticle(container) {
  const p = document.createElement('div');
  p.className = 'confetti';
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#fbbf24', '#ec4899'];
  p.style.background = colors[Math.floor(Math.random() * colors.length)];
  p.style.left = Math.random() * 90 + '%';
  p.style.top  = '-20px';
  const scale = Math.random() * 0.8 + 0.4;
  p.style.transform = `scale(${scale})`;
  const duration = Math.random() * 2 + 2;
  p.style.animationDuration = duration + 's';
  container.appendChild(p);
  setTimeout(() => { p.remove(); }, duration * 1000);
}
