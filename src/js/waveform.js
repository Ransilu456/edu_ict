// Osilascope
let waveformHistory = [];
const MAX_WAVEFORM_POINTS = 80;
let waveformCanvas = null;
let waveformCtx = null;
let isWaveformActive = false;
let isWaveformPaused = false;
let waveformDpr = 1;

export function initWaveform() {
  waveformCanvas = document.getElementById('waveform-canvas');
  if (!waveformCanvas) return;
  waveformCtx = waveformCanvas.getContext('2d');

  const panel = document.getElementById('sandbox-waveform-panel');
  const toggleBtn = document.getElementById('sandbox-waveform-btn');
  const closeBtn = document.getElementById('waveform-close-btn');
  const clearBtn = document.getElementById('waveform-clear-btn');

  if (toggleBtn && panel) {
    toggleBtn.addEventListener('click', () => {
      if (window.playSound) window.playSound('click');
      const willShow = panel.style.display === 'none' || !panel.style.display;
      panel.style.display = willShow ? 'flex' : 'none';
      toggleBtn.classList.toggle('active', willShow);
      isWaveformActive = willShow;
      if (willShow) {
        resizeCanvas();
        drawWaveform();
      }
    });
  }

  if (closeBtn && panel) {
    closeBtn.addEventListener('click', () => {
      panel.style.display = 'none';
      if (toggleBtn) toggleBtn.classList.remove('active');
      isWaveformActive = false;
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (window.playSound) window.playSound('click');
      waveformHistory = [];
      drawWaveform();
      if (window.showToast) window.showToast('Waveform cleared');
    });
  }

  window.addEventListener('resize', () => {
    if (isWaveformActive) {
      resizeCanvas();
      drawWaveform();
    }
  });

  const screenshotBtn = document.getElementById('sandbox-screenshot-btn');
  if (screenshotBtn) {
    screenshotBtn.addEventListener('click', () => {
      if (window.playSound) window.playSound('success');
      exportCircuitImage();
    });
  }
}

function resizeCanvas() {
  if (!waveformCanvas) return;
  const container = waveformCanvas.parentElement;
  if (!container) return;

  const rect = container.getBoundingClientRect();
  if (rect && rect.width > 100) {
    const cssWidth = Math.max(320, Math.floor(rect.width - 24));
    const cssHeight = Math.max(160, Math.min(240, Math.round(rect.height - 46 || 180)));
    waveformDpr = Math.min(window.devicePixelRatio || 1, 2);
    waveformCanvas.width = Math.round(cssWidth * waveformDpr);
    waveformCanvas.height = Math.round(cssHeight * waveformDpr);
    waveformCanvas.style.height = `${cssHeight}px`;
    waveformCtx = waveformCanvas.getContext('2d');
    waveformCtx.setTransform(waveformDpr, 0, 0, waveformDpr, 0, 0);
  }
}

export function sampleWaveform(nodes = []) {
  const panel = document.getElementById('sandbox-waveform-panel');
  if (!panel || panel.style.display === 'none' || isWaveformPaused) return;
  if (!nodes || nodes.length === 0) return;

  const channels = [];

  // Priority 1: Clocks
  nodes.filter(n => n.type === 'clock').forEach(n => {
    if (channels.length < 8) {
      channels.push({
        id: n.id,
        name: n.label || 'CLK',
        val: n.outputState ? 1 : 0,
        type: 'clock'
      });
    }
  });

  // Priority 2: Inputs (Switches)
  nodes.filter(n => n.type === 'input').forEach(n => {
    if (channels.length < 8) {
      channels.push({
        id: n.id,
        name: n.label || 'IN',
        val: n.outputState ? 1 : 0,
        type: 'input'
      });
    }
  });

  // Priority 3: Outputs (LEDs, Probes)
  nodes.filter(n => n.type === 'output' || n.type === 'rgb-led').forEach(n => {
    if (channels.length < 8) {
      channels.push({
        id: n.id,
        name: n.label || 'OUT',
        val: n.outputState ? 1 : 0,
        type: 'output'
      });
    }
  });

  // Priority 4: Compound / ICs / Gates
  nodes.filter(n => ['d-flop', 'half-adder', 'full-adder', 'and', 'or', 'not', 'nand', 'nor', 'xor'].includes(n.type)).forEach(n => {
    if (channels.length < 8) {
      channels.push({
        id: n.id,
        name: n.label || n.type.toUpperCase(),
        val: n.outputState ? 1 : 0,
        type: 'gate'
      });
    }
  });

  if (channels.length === 0) return;

  waveformHistory.push({
    time: Date.now(),
    channels: channels
  });

  if (waveformHistory.length > MAX_WAVEFORM_POINTS) {
    waveformHistory.shift();
  }

  drawWaveform();
}
window.sampleWaveform = sampleWaveform;

export function drawWaveform() {
  if (!waveformCanvas || !waveformCtx) {
    waveformCanvas = document.getElementById('waveform-canvas');
    if (!waveformCanvas) return;
    waveformCtx = waveformCanvas.getContext('2d');
  }

  const ctx = waveformCtx;
  const w = waveformCanvas.width / waveformDpr;
  const h = waveformCanvas.height / waveformDpr;

  // Deep engineering oscilloscope black
  ctx.fillStyle = '#05080c';
  ctx.fillRect(0, 0, w, h);

  const labelWidth = 100;
  const legendWidth = 90;
  const plotWidth = Math.max(80, w - labelWidth - legendWidth);

  // 1. Oscilloscope Grid Lines (Dark Green phosphor grid)
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0, 255, 100, 0.08)';

  // Vertical time division ticks
  const divisions = 16;
  for (let div = 0; div <= divisions; div++) {
    const gx = labelWidth + (plotWidth * div / divisions);
    ctx.beginPath();
    ctx.moveTo(gx, 6);
    ctx.lineTo(gx, h - 6);
    ctx.stroke();

    // Small subdivision tick marks
    ctx.strokeStyle = 'rgba(0, 255, 100, 0.04)';
    for (let sub = 1; sub < 4; sub++) {
      const subX = gx + (plotWidth / divisions) * (sub / 4);
      if (subX < labelWidth + plotWidth) {
        ctx.beginPath();
        ctx.moveTo(subX, 6);
        ctx.lineTo(subX, h - 6);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = 'rgba(0, 255, 100, 0.08)';
  }

  if (waveformHistory.length < 2) {
    ctx.fillStyle = '#22c55e';
    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('RUNNING OSCILLOSCOPE — PROBING SIGNALS...', w / 2, h / 2);
    return;
  }

  const latestSample = waveformHistory[waveformHistory.length - 1];
  const channels = latestSample.channels;
  const numChannels = channels.length;
  if (numChannels === 0) return;

  const rowHeight = Math.floor((h - 16) / numChannels);

  // Draw each channel trace
  channels.forEach((ch, chIdx) => {
    const topY = 10 + chIdx * rowHeight;
    const bottomY = topY + rowHeight - 6;
    const highY = topY + 4;
    const lowY = bottomY - 2;

    // Horizontal baseline & division
    ctx.strokeStyle = 'rgba(0, 255, 100, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(labelWidth, lowY);
    ctx.lineTo(labelWidth + plotWidth, lowY);
    ctx.stroke();

    // Sub-grid high line
    ctx.strokeStyle = 'rgba(0, 255, 100, 0.04)';
    ctx.beginPath();
    ctx.moveTo(labelWidth, highY);
    ctx.lineTo(labelWidth + plotWidth, highY);
    ctx.stroke();

    // Left Channel Label + Indicator Badge
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(ch.name.slice(0, 8), 10, topY + rowHeight / 2 + 3);

    // Live logic value pill [ 1 / 0 ]
    const isHigh = ch.val === 1;
    ctx.fillStyle = isHigh ? 'rgba(0, 255, 102, 0.2)' : 'rgba(100, 116, 139, 0.2)';
    ctx.fillRect(labelWidth - 32, topY + rowHeight / 2 - 8, 24, 16);
    ctx.strokeStyle = isHigh ? '#00ff66' : '#475569';
    ctx.strokeRect(labelWidth - 32, topY + rowHeight / 2 - 8, 24, 16);

    ctx.fillStyle = isHigh ? '#00ff66' : '#94a3b8';
    ctx.font = '800 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isHigh ? 'H' : 'L', labelWidth - 20, topY + rowHeight / 2 + 4);

    // Waveform Trace: Bright Neon Phosphor Green with glow
    const pts = waveformHistory.length;
    const step = plotWidth / (MAX_WAVEFORM_POINTS - 1);

    ctx.save();
    ctx.beginPath();

    for (let i = 0; i < pts; i++) {
      const sample = waveformHistory[i];
      const ptChannel = sample.channels.find(c => c.id === ch.id) || ch;
      const x = labelWidth + (MAX_WAVEFORM_POINTS - pts + i) * step;
      const targetY = ptChannel.val ? highY : lowY;

      if (i === 0) {
        ctx.moveTo(x, targetY);
      } else {
        const prevSample = waveformHistory[i - 1];
        const prevPtChannel = prevSample.channels.find(c => c.id === ch.id) || ch;
        const prevY = prevPtChannel.val ? highY : lowY;

        if (prevY !== targetY) {
          ctx.lineTo(x, prevY);
        }
        ctx.lineTo(x, targetY);
      }
    }

    // Outer phosphor glow
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#00ff66';
    ctx.shadowBlur = 8;
    ctx.stroke();

    // Inner bright core
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#e6fff2';
    ctx.stroke();
    ctx.restore();
  });

  // Right Side: Voltage / Logic Level Legend (like in screenshot)
  const legendX = labelWidth + plotWidth + 12;
  ctx.fillStyle = '#64748b';
  ctx.font = '700 9px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('LOGIC LEVEL', legendX, 22);

  ctx.fillStyle = '#00ff66';
  ctx.fillText('HIGH (5V)', legendX, 40);

  ctx.fillStyle = '#475569';
  ctx.fillText('LOW  (0V)', legendX, 56);

  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`RATE: 20Hz`, legendX, 74);
}
window.drawWaveform = drawWaveform;

export function exportCircuitImage() {
  const workspace = document.getElementById('sandbox-workspace-canvas');
  if (!workspace) return;

  const nodes = Array.from(workspace.querySelectorAll('.sandbox-node'));
  if (nodes.length === 0) {
    if (window.showToast) window.showToast('Canvas is empty — place components first.');
    return;
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(n => {
    const rect = n.getBoundingClientRect();
    const wsRect = workspace.getBoundingClientRect();
    const x = rect.left - wsRect.left;
    const y = rect.top - wsRect.top;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + rect.width > maxX) maxX = x + rect.width;
    if (y + rect.height > maxY) maxY = y + rect.height;
  });

  const pad = 40;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  const width = Math.max(400, maxX - minX + pad * 2);
  const height = Math.max(300, maxY - minY + pad * 2);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const isDark = document.documentElement.classList.contains('dark');
  ctx.fillStyle = isDark ? '#05080c' : '#f8fbff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = isDark ? '#0d1f38' : '#bae6fd';
  for (let gx = 0; gx < width; gx += 24) {
    for (let gy = 0; gy < height; gy += 24) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = '#00ff66';
  ctx.font = '900 16px Nunito, sans-serif';
  ctx.fillText('LOGICQUEST', 20, 28);
  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.font = '600 11px Nunito, sans-serif';
  ctx.fillText('Digital Logic Circuit Simulation', 125, 28);

  const wiresSvg = document.getElementById('sandbox-wires-svg');
  if (wiresSvg) {
    const paths = Array.from(wiresSvg.querySelectorAll('path.sb-wire-core, path.sb-wire-preview'));
    paths.forEach(p => {
      const d = p.getAttribute('d');
      if (!d) return;
      const cls = p.getAttribute('class') || '';
      const stroke = cls.includes('high') ? '#00ff66'
        : cls.includes('hover') ? '#ff4b4b'
        : cls.includes('preview') ? '#1cb0f6' : '#64748b';

      const p2d = new Path2D(d);
      ctx.save();
      ctx.translate(-minX, -minY);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3.5;
      if (cls.includes('high')) {
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 6;
      }
      ctx.stroke(p2d);
      ctx.restore();
    });
  }

  nodes.forEach(n => {
    const wsRect = workspace.getBoundingClientRect();
    const rect = n.getBoundingClientRect();
    const x = rect.left - wsRect.left - minX;
    const y = rect.top - wsRect.top - minY;
    const nw = rect.width;
    const nh = rect.height;

    ctx.save();
    ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 2;

    const r = 10;
    ctx.beginPath();
    ctx.roundRect(x, y, nw, nh, r);
    ctx.fill();
    ctx.stroke();

    const headerEl = n.querySelector('.sandbox-node-header');
    if (headerEl) {
      ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
      ctx.font = '800 11px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(headerEl.textContent.trim(), x + nw / 2, y + 16);
    }

    const bodyEl = n.querySelector('.sandbox-node-body');
    if (bodyEl) {
      ctx.fillStyle = isDark ? '#f8fafc' : '#1e293b';
      ctx.font = '700 12px Nunito, sans-serif';
      ctx.textAlign = 'center';
      const text = bodyEl.innerText ? bodyEl.innerText.split('\n')[0].trim() : '';
      if (text) ctx.fillText(text, x + nw / 2, y + nh / 2 + 10);
    }

    ctx.restore();
  });

  try {
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `logicquest-circuit-${Date.now().toString().slice(-4)}.png`;
    a.href = dataUrl;
    a.click();
    if (window.showToast) window.showToast('Screenshot saved to Downloads');
  } catch (err) {
    console.error('Screenshot error:', err);
  }
}
window.exportCircuitImage = exportCircuitImage;
