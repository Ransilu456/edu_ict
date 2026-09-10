// LogicQuest — waveform.js
// Real-time Digital Logic Waveform Scope & Timing Diagram + Circuit Screenshot Export

let waveformHistory = [];
const MAX_WAVEFORM_POINTS = 45;
let waveformCanvas = null;
let waveformCtx = null;
let isWaveformActive = false;

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
      panel.style.display = willShow ? 'block' : 'none';
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

  // Setup screenshot export button
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
  const rect = waveformCanvas.parentElement?.getBoundingClientRect();
  if (rect && rect.width > 100) {
    waveformCanvas.width = Math.min(Math.floor(rect.width - 24), 700);
    waveformCanvas.height = 150;
  }
}

export function sampleWaveform(nodes = []) {
  const panel = document.getElementById('sandbox-waveform-panel');
  if (!panel || panel.style.display === 'none') return;

  if (!nodes || nodes.length === 0) return;

  // Filter interesting channels: inputs, clocks, outputs, or gates (max 5)
  const channels = [];
  
  nodes.forEach(n => {
    if (channels.length >= 5) return;
    if (n.type === 'clock' || n.type === 'input' || n.type === 'output' || 
        ['and','or','not','xor','nand','nor'].includes(n.type)) {
      channels.push({
        id: n.id,
        name: (n.label || n.type).slice(0, 10),
        val: n.outputState ? 1 : 0,
        type: n.type
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
  const w = waveformCanvas.width;
  const h = waveformCanvas.height;

  const isDark = document.documentElement.classList.contains('dark') || 
                 document.documentElement.getAttribute('data-theme') === 'dark';

  // Background
  ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
  ctx.fillRect(0, 0, w, h);

  if (waveformHistory.length < 2) {
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.font = '700 12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Toggle switches or run simulation to view logic waveforms...', w / 2, h / 2);
    return;
  }

  const latestSample = waveformHistory[waveformHistory.length - 1];
  const channels = latestSample.channels;
  const numChannels = channels.length;
  if (numChannels === 0) return;

  const rowHeight = Math.floor((h - 20) / numChannels);
  const labelWidth = 85;
  const plotWidth = w - labelWidth - 15;

  // Grid lines
  ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0';
  ctx.lineWidth = 1;
  for (let c = 0; c <= numChannels; c++) {
    const y = 10 + c * rowHeight;
    ctx.beginPath();
    ctx.moveTo(labelWidth, y);
    ctx.lineTo(w - 10, y);
    ctx.stroke();
  }

  // Channel traces
  const colors = [
    '#1cb0f6', // Sky blue
    '#58cc02', // Emerald green
    '#ff9600', // Amber
    '#a855f7', // Purple
    '#ec4899', // Pink
  ];

  channels.forEach((ch, chIdx) => {
    const color = colors[chIdx % colors.length];
    const topY = 14 + chIdx * rowHeight;
    const bottomY = topY + rowHeight - 10;
    const highY = topY + 4;
    const lowY = bottomY - 2;

    // Label
    ctx.fillStyle = isDark ? '#f8fafc' : '#1e293b';
    ctx.font = '800 11px Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(ch.name, 10, topY + rowHeight / 2);

    // Live value badge
    ctx.fillStyle = ch.val ? '#58cc02' : (isDark ? '#475569' : '#94a3b8');
    ctx.beginPath();
    ctx.arc(labelWidth - 12, topY + rowHeight / 2 - 3, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pulse trace
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const pts = waveformHistory.length;
    const step = plotWidth / (MAX_WAVEFORM_POINTS - 1);

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
        
        // Square wave transition
        if (prevY !== targetY) {
          ctx.lineTo(x, prevY);
        }
        ctx.lineTo(x, targetY);
      }
    }
    ctx.stroke();

    // Subtle glow on high rail
    if (ch.val) {
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  });
}
window.drawWaveform = drawWaveform;

// ── Circuit Image Exporter ─────────────────────────────────────────
export function exportCircuitImage() {
  const workspace = document.getElementById('sandbox-workspace-canvas');
  if (!workspace) return;

  const nodes = Array.from(workspace.querySelectorAll('.sandbox-node'));
  if (nodes.length === 0) {
    if (window.showToast) window.showToast('Canvas is empty — place components first.');
    return;
  }

  // Calculate bounding box of components
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
  ctx.fillStyle = isDark ? '#0b132b' : '#f8fbff';
  ctx.fillRect(0, 0, width, height);

  // Draw dot grid
  ctx.fillStyle = isDark ? '#1e3a8a' : '#bae6fd';
  for (let gx = 0; gx < width; gx += 24) {
    for (let gy = 0; gy < height; gy += 24) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Watermark / title header
  ctx.fillStyle = '#1cb0f6';
  ctx.font = '900 16px Nunito, sans-serif';
  ctx.fillText('LOGICQUEST', 20, 28);
  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.font = '600 11px Nunito, sans-serif';
  ctx.fillText('Digital Logic Circuit Simulation', 125, 28);

  // Draw wire paths from SVG
  const wiresSvg = document.getElementById('sandbox-wires-svg');
  if (wiresSvg) {
    const paths = Array.from(wiresSvg.querySelectorAll('path'));
    paths.forEach(p => {
      const d = p.getAttribute('d');
      const stroke = p.getAttribute('stroke') || '#1cb0f6';
      if (!d) return;
      
      const p2d = new Path2D(d);
      ctx.save();
      ctx.translate(-minX, -minY);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3.5;
      ctx.stroke(p2d);
      ctx.restore();
    });
  }

  // Draw nodes
  nodes.forEach(n => {
    const wsRect = workspace.getBoundingClientRect();
    const rect = n.getBoundingClientRect();
    const x = rect.left - wsRect.left - minX;
    const y = rect.top - wsRect.top - minY;
    const nw = rect.width;
    const nh = rect.height;

    // Node card
    ctx.save();
    ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
    ctx.lineWidth = 2.5;
    
    // Rounded rect
    const r = 12;
    ctx.beginPath();
    ctx.roundRect(x, y, nw, nh, r);
    ctx.fill();
    ctx.stroke();

    // Node header label
    const headerEl = n.querySelector('.sandbox-node-header');
    if (headerEl) {
      ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
      ctx.font = '800 11px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(headerEl.textContent.trim(), x + nw / 2, y + 16);
    }

    // Node state or icon
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

  // Download image
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `logicquest-circuit-${Date.now().toString().slice(-4)}.png`;
    a.href = dataUrl;
    a.click();
    if (window.showToast) window.showToast('📸 Screenshot saved to Downloads!');
  } catch (err) {
    console.error('Screenshot error:', err);
  }
}
window.exportCircuitImage = exportCircuitImage;
