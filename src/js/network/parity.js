export function initParity(container) {
  if (!container) return;

  container.innerHTML = `
    <div class="sn-lab parity-lab">
      <div class="sn-header">
        <div class="sn-title-wrap">
          <span class="sn-badge">NETWORKING / LAYER 1 &amp; 2</span>
          <h2>Parity Checking &amp; Error Detection Lab</h2>
          <p class="sn-subtitle">Explore 1D Parity, 2D Matrix Block Parity with interactive single-bit error localization, and digital line encoding schemes.</p>
        </div>
      </div>

      <div class="sn-grid">
        <!-- 1D Parity Generator & Checker -->
        <div class="sn-card">
          <h3 class="sn-card-title">1D Simple Parity (Odd &amp; Even)</h3>
          <p class="sn-subtitle" style="margin-bottom:14px;">Enter an ASCII character or 7-bit binary data. Toggle bits to see parity calculation.</p>
          
          <div class="parity-input-wrap">
            <label for="parity-char-input">Character / ASCII:</label>
            <input type="text" id="parity-char-input" class="sn-input" maxlength="1" value="A" style="width:60px;text-align:center;font-weight:bold;font-size:1.1rem;" />
            <span class="parity-ascii-val">ASCII: <strong id="parity-ascii-code">65</strong> (0x41)</span>
          </div>

          <div class="parity-bits-row" id="parity-1d-bits">
            <!-- 7 data bits + 1 parity bit -->
          </div>

          <div class="parity-result-panel">
            <div class="parity-res-item">
              <span class="label">1s Count (Data Bits):</span>
              <strong id="parity-ones-count" class="text-cyan">2</strong>
            </div>
            <div class="parity-res-item">
              <span class="label">Even Parity Bit:</span>
              <span class="parity-badge" id="parity-even-bit">0</span>
              <small>(Total 1s becomes even)</small>
            </div>
            <div class="parity-res-item">
              <span class="label">Odd Parity Bit:</span>
              <span class="parity-badge" id="parity-odd-bit">1</span>
              <small>(Total 1s becomes odd)</small>
            </div>
          </div>
        </div>

        <!-- 2D Matrix Parity / Block Parity -->
        <div class="sn-card">
          <div class="sn-card-header-flex">
            <h3 class="sn-card-title">2D Longitudinal Redundancy (Matrix Parity)</h3>
            <button type="button" class="sn-preset-btn" id="parity-reset-matrix">Reset Matrix</button>
          </div>
          <p class="sn-subtitle" style="margin-bottom:12px;">
            <strong>Interactive:</strong> Click ANY data bit below to inject a transmission error. The row and column parity checks will pinpoint the exact corrupted bit!
          </p>

          <div class="parity-matrix-wrap" id="parity-matrix-container">
            <!-- 4x4 matrix + row parity + column parity -->
          </div>

          <div class="parity-detection-status" id="parity-detection-alert">
            <span class="status-icon success">✓</span>
            <span>All row and column parity checks match. <strong>No transmission errors detected.</strong></span>
          </div>
        </div>
      </div>

      <!-- Line Encoding Schemes Visualization -->
      <div class="sn-card sn-table-card">
        <div class="sn-card-header-flex">
          <h3 class="sn-card-title">Physical Layer Digital Line Encoding (A/L ICT)</h3>
          <div class="sn-subdivide-ctrls">
            <span>Encoding Scheme:</span>
            <select id="encoding-scheme-select" class="sn-select">
              <option value="unipolar">Unipolar NRZ</option>
              <option value="nrz-l" selected>NRZ-L (Non-Return to Zero Level)</option>
              <option value="nrz-i">NRZ-I (Non-Return to Zero Invert)</option>
              <option value="rz">RZ (Return to Zero)</option>
              <option value="manchester">Manchester (IEEE 802.3)</option>
              <option value="diff-manchester">Differential Manchester</option>
            </select>
          </div>
        </div>

        <div class="encoding-waveform-wrap">
          <div class="encoding-clock-row">
            <span class="clock-label">CLK:</span>
            <div class="clock-pulses" id="encoding-clock"></div>
          </div>
          <div class="encoding-bits-header" id="encoding-bits-header"></div>
          <div class="encoding-canvas-wrap">
            <canvas id="encoding-canvas" width="800" height="120"></canvas>
          </div>
          <div class="encoding-explanation" id="encoding-desc">
            <!-- Explanatory note -->
          </div>
        </div>
      </div>
    </div>
  `;

  bindParityEvents(container);
  init1DParity(container);
  init2DMatrix(container);
  initWaveform(container);
}

// 1D Parity
let dataBits1D = [1, 0, 0, 0, 0, 0, 1]; // 7 bits for 'A' (65 = 1000001)

function bindParityEvents(c) {
  const charInput = c.querySelector('#parity-char-input');
  charInput?.addEventListener('input', (e) => {
    const char = e.target.value || 'A';
    const code = char.charCodeAt(0);
    c.querySelector('#parity-ascii-code').textContent = code;
    const bin7 = (code & 127).toString(2).padStart(7, '0');
    dataBits1D = bin7.split('').map(Number);
    render1D(c);
  });
}

function init1DParity(c) {
  render1D(c);
}

function render1D(c) {
  const container = c.querySelector('#parity-1d-bits');
  if (!container) return;

  const onesCount = dataBits1D.filter(b => b === 1).length;
  const evenBit = onesCount % 2 === 0 ? 0 : 1;
  const oddBit = onesCount % 2 === 0 ? 1 : 0;

  c.querySelector('#parity-ones-count').textContent = onesCount;
  c.querySelector('#parity-even-bit').textContent = evenBit;
  c.querySelector('#parity-odd-bit').textContent = oddBit;

  let html = '';
  dataBits1D.forEach((b, idx) => {
    html += `
      <div class="parity-bit-card" data-idx="${idx}">
        <span class="bit-pos">d${6 - idx}</span>
        <button type="button" class="bit-toggle-btn ${b ? 'is-one' : 'is-zero'}">${b}</button>
      </div>
    `;
  });

  html += `
    <div class="parity-bit-card parity-calc-bit">
      <span class="bit-pos">P (Even)</span>
      <span class="bit-toggle-btn parity-result ${evenBit ? 'is-one' : 'is-zero'}">${evenBit}</span>
    </div>
  `;

  container.innerHTML = html;

  container.querySelectorAll('.bit-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parent = e.target.closest('.parity-bit-card');
      if (!parent || parent.classList.contains('parity-calc-bit')) return;
      const idx = parseInt(parent.dataset.idx, 10);
      dataBits1D[idx] = dataBits1D[idx] === 1 ? 0 : 1;
      render1D(c);
    });
  });
}

// 2D Matrix Parity
let origMatrix = [
  [1, 0, 1, 1],
  [0, 1, 1, 0],
  [1, 1, 0, 1],
  [0, 0, 1, 0]
];
let currentMatrix = JSON.parse(JSON.stringify(origMatrix));

function init2DMatrix(c) {
  c.querySelector('#parity-reset-matrix')?.addEventListener('click', () => {
    currentMatrix = JSON.parse(JSON.stringify(origMatrix));
    render2D(c);
  });
  render2D(c);
}

function render2D(c) {
  const container = c.querySelector('#parity-matrix-container');
  if (!container) return;

  // Compute row parities (Even)
  const expectedRowParities = origMatrix.map(row => row.filter(b => b === 1).length % 2);
  const currentRowParities = currentMatrix.map(row => row.filter(b => b === 1).length % 2);

  // Compute column parities (Even)
  const expectedColParities = [0, 1, 2, 3].map(col => [0, 1, 2, 3].map(row => origMatrix[row][col]).filter(b => b === 1).length % 2);
  const currentColParities = [0, 1, 2, 3].map(col => [0, 1, 2, 3].map(row => currentMatrix[row][col]).filter(b => b === 1).length % 2);

  // Error row and col
  let errorRow = -1;
  let errorCol = -1;
  for (let r = 0; r < 4; r++) {
    if (currentRowParities[r] !== expectedRowParities[r]) errorRow = r;
  }
  for (let col = 0; col < 4; col++) {
    if (currentColParities[col] !== expectedColParities[col]) errorCol = col;
  }

  let tableHtml = `<table class="matrix-parity-table"><thead><tr><th></th><th>Bit 0</th><th>Bit 1</th><th>Bit 2</th><th>Bit 3</th><th class="head-p">Row Parity</th></tr></thead><tbody>`;

  for (let r = 0; r < 4; r++) {
    const rowMismatch = currentRowParities[r] !== expectedRowParities[r];
    tableHtml += `<tr><th>Byte ${r + 1}</th>`;
    for (let col = 0; col < 4; col++) {
      const isCorrupt = r === errorRow && col === errorCol;
      const bit = currentMatrix[r][col];
      tableHtml += `
        <td>
          <button type="button" class="matrix-bit-btn ${bit ? 'is-one' : 'is-zero'} ${isCorrupt ? 'is-corrupted' : ''}" data-r="${r}" data-c="${col}">
            ${bit}
          </button>
        </td>
      `;
    }
    tableHtml += `
      <td class="parity-cell ${rowMismatch ? 'mismatch' : 'match'}">
        <span>${expectedRowParities[r]}</span> ${rowMismatch ? '⚠️' : '✓'}
      </td>
    </tr>`;
  }

  // Column parity footer row
  tableHtml += `<tfoot><tr><th>Col Parity</th>`;
  for (let col = 0; col < 4; col++) {
    const colMismatch = currentColParities[col] !== expectedColParities[col];
    tableHtml += `
      <td class="parity-cell ${colMismatch ? 'mismatch' : 'match'}">
        <span>${expectedColParities[col]}</span> ${colMismatch ? '⚠️' : '✓'}
      </td>
    `;
  }
  tableHtml += `<td></td></tr></tfoot></table>`;

  container.innerHTML = tableHtml;

  // Status alert
  const alert = c.querySelector('#parity-detection-alert');
  if (errorRow !== -1 && errorCol !== -1) {
    alert.className = 'parity-detection-status error';
    alert.innerHTML = `<span class="status-icon error">⚠️</span><span>Single-Bit Error Detected and Localized! <strong>Row: Byte ${errorRow + 1}, Column: Bit ${errorCol}</strong>. Can be automatically corrected by flipping!</span>`;
  } else {
    alert.className = 'parity-detection-status success';
    alert.innerHTML = `<span class="status-icon success">✓</span><span>All row and column parity checks match. <strong>No transmission errors detected.</strong></span>`;
  }

  container.querySelectorAll('.matrix-bit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = parseInt(btn.dataset.r, 10);
      const col = parseInt(btn.dataset.c, 10);
      currentMatrix[r][col] = currentMatrix[r][col] === 1 ? 0 : 1;
      render2D(c);
    });
  });
}

// Waveform
function initWaveform(c) {
  const canvas = c.querySelector('#encoding-canvas');
  const schemeSelect = c.querySelector('#encoding-scheme-select');
  if (!canvas) return;

  schemeSelect?.addEventListener('change', () => drawWaveform(c));
  drawWaveform(c);
}

function drawWaveform(c) {
  const canvas = c.querySelector('#encoding-canvas');
  const scheme = c.querySelector('#encoding-scheme-select')?.value || 'nrz-l';
  const descEl = c.querySelector('#encoding-desc');
  const headerEl = c.querySelector('#encoding-bits-header');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const bits = [0, 1, 0, 0, 1, 1, 0, 1];
  const numBits = bits.length;
  const bitWidth = W / numBits;
  const midY = H / 2;
  const highY = 24;
  const lowY = H - 24;

  // Render header bits
  if (headerEl) {
    headerEl.innerHTML = bits.map((b, i) => `<span style="width:${bitWidth}px;text-align:center;display:inline-block;font-weight:bold;color:#38bdf8;">Bit: ${b}</span>`).join('');
  }

  // Draw grid
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= numBits; i++) {
    const x = i * bitWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  // Baseline
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(W, midY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw signal
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 3;
  ctx.beginPath();

  let prevY = midY;
  let descriptions = {
    'unipolar': 'Unipolar NRZ: 1 is high voltage (+V), 0 is zero voltage (0V). Simple but has DC component and no clock recovery.',
    'nrz-l': 'NRZ-L: 0 is represented by high level (+V), 1 is represented by low level (-V). Signal does not return to zero within bit interval.',
    'nrz-i': 'NRZ-I: Inversion on 1. Signal transitions at beginning of bit interval for 1; no transition for 0.',
    'rz': 'RZ (Return to Zero): 1 goes high (+V) for first half and returns to 0V for second half. 0 stays at 0V.',
    'manchester': 'Manchester (IEEE 802.3): Mid-bit transition in every bit interval. Low-to-High represents 0, High-to-Low represents 1.',
    'diff-manchester': 'Differential Manchester: Mid-bit transition always occurs for clocking. A transition at start of bit denotes 0; absence of transition denotes 1.'
  };

  if (descEl) descEl.textContent = descriptions[scheme] || '';

  let currLevel = lowY;

  for (let i = 0; i < numBits; i++) {
    const b = bits[i];
    const xStart = i * bitWidth;
    const xMid = xStart + bitWidth / 2;
    const xEnd = (i + 1) * bitWidth;

    if (scheme === 'unipolar') {
      const y = b === 1 ? highY : midY;
      if (i === 0) ctx.moveTo(xStart, y);
      else { ctx.lineTo(xStart, y); }
      ctx.lineTo(xEnd, y);
    } else if (scheme === 'nrz-l') {
      const y = b === 0 ? highY : lowY;
      if (i === 0) ctx.moveTo(xStart, y);
      else { ctx.lineTo(xStart, y); }
      ctx.lineTo(xEnd, y);
    } else if (scheme === 'nrz-i') {
      if (b === 1) currLevel = currLevel === highY ? lowY : highY;
      if (i === 0) ctx.moveTo(xStart, currLevel);
      else ctx.lineTo(xStart, currLevel);
      ctx.lineTo(xEnd, currLevel);
    } else if (scheme === 'rz') {
      const y1 = b === 1 ? highY : midY;
      if (i === 0) ctx.moveTo(xStart, y1);
      else ctx.lineTo(xStart, y1);
      ctx.lineTo(xMid, y1);
      ctx.lineTo(xMid, midY);
      ctx.lineTo(xEnd, midY);
    } else if (scheme === 'manchester') {
      // 0 = low to high, 1 = high to low
      const yFirst = b === 0 ? lowY : highY;
      const ySecond = b === 0 ? highY : lowY;
      if (i === 0) ctx.moveTo(xStart, yFirst);
      else ctx.lineTo(xStart, yFirst);
      ctx.lineTo(xMid, yFirst);
      ctx.lineTo(xMid, ySecond);
      ctx.lineTo(xEnd, ySecond);
    } else if (scheme === 'diff-manchester') {
      if (b === 0) currLevel = currLevel === highY ? lowY : highY;
      const nextLevel = currLevel === highY ? lowY : highY;
      if (i === 0) ctx.moveTo(xStart, currLevel);
      else ctx.lineTo(xStart, currLevel);
      ctx.lineTo(xMid, currLevel);
      ctx.lineTo(xMid, nextLevel);
      ctx.lineTo(xEnd, nextLevel);
      currLevel = nextLevel;
    }
  }

  ctx.stroke();
}
