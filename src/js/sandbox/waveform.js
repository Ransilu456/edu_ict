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
    const cssWidth = Math.max(180, Math.floor(rect.width - 24));
    const cssHeight = Math.max(160, Math.min(240, Math.round(rect.height - 46 || 180)));
    waveformDpr = Math.min(window.devicePixelRatio || 1, 2);
    waveformCanvas.width = Math.round(cssWidth * waveformDpr);
    waveformCanvas.height = Math.round(cssHeight * waveformDpr);
    waveformCanvas.style.height = `${cssHeight}px`;
    waveformCtx = waveformCanvas.getContext('2d');
    waveformCtx.setTransform(waveformDpr, 0, 0, waveformDpr, 0, 0);
  }
}

function inlineSvgStyles(sourceSvg, clonedSvg) {
  const sourceElements = [sourceSvg, ...sourceSvg.querySelectorAll('*')];
  const clonedElements = [clonedSvg, ...clonedSvg.querySelectorAll('*')];
  const rootStyles = getComputedStyle(sourceSvg);
  const properties = [
    'fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'stroke-width',
    'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'color',
    'font-family', 'font-size', 'font-weight', 'font-style', 'text-anchor',
    'dominant-baseline', 'opacity', 'visibility'
  ];
  const resolveVariables = value => value.replace(/var\(\s*(--[\w-]+)(?:\s*,\s*([^\)]+))?\s*\)/g, (_match, name, fallback) => {
    const resolved = rootStyles.getPropertyValue(name).trim();
    return resolved || fallback?.trim() || '';
  });

  clonedElements.forEach((element, index) => {
    const source = sourceElements[index];
    if (!source) return;
    const computed = getComputedStyle(source);
    Array.from(element.attributes).forEach(attribute => {
      if (attribute.value.includes('var(')) {
        const resolved = resolveVariables(attribute.value);
        if (resolved) element.setAttribute(attribute.name, resolved);
      }
    });
    properties.forEach(property => {
      const value = computed.getPropertyValue(property);
      if (value) element.setAttribute(property, value);
    });
  });
}

export function sampleWaveform(nodes = []) {
  const panel = document.getElementById('sandbox-waveform-panel');
  if (!panel || panel.style.display === 'none' || isWaveformPaused) return;
  if (!nodes || nodes.length === 0) return;

  const channels = [];

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

  ctx.fillStyle = '#05080c';
  ctx.fillRect(0, 0, w, h);

  const labelWidth = 100;
  const legendWidth = 90;
  const plotWidth = Math.max(80, w - labelWidth - legendWidth);

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0, 255, 100, 0.08)';

  const divisions = 16;
  for (let div = 0; div <= divisions; div++) {
    const gx = labelWidth + (plotWidth * div / divisions);
    ctx.beginPath();
    ctx.moveTo(gx, 6);
    ctx.lineTo(gx, h - 6);
    ctx.stroke();

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
    ctx.font = '700 12px "DM Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('RUNNING OSCILLOSCOPE — PROBING SIGNALS...', w / 2, h / 2);
    return;
  }

  const latestSample = waveformHistory[waveformHistory.length - 1];
  const channels = latestSample.channels;
  const numChannels = channels.length;
  if (numChannels === 0) return;

  const rowHeight = Math.floor((h - 16) / numChannels);

  channels.forEach((ch, chIdx) => {
    const topY = 10 + chIdx * rowHeight;
    const bottomY = topY + rowHeight - 6;
    const highY = topY + 4;
    const lowY = bottomY - 2;

    ctx.strokeStyle = 'rgba(0, 255, 100, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(labelWidth, lowY);
    ctx.lineTo(labelWidth + plotWidth, lowY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 255, 100, 0.04)';
    ctx.beginPath();
    ctx.moveTo(labelWidth, highY);
    ctx.lineTo(labelWidth + plotWidth, highY);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 11px "DM Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(ch.name.slice(0, 8), 10, topY + rowHeight / 2 + 3);

    const isHigh = ch.val === 1;
    ctx.fillStyle = isHigh ? 'rgba(0, 255, 102, 0.2)' : 'rgba(100, 116, 139, 0.2)';
    ctx.fillRect(labelWidth - 32, topY + rowHeight / 2 - 8, 24, 16);
    ctx.strokeStyle = isHigh ? '#00ff66' : '#475569';
    ctx.strokeRect(labelWidth - 32, topY + rowHeight / 2 - 8, 24, 16);

    ctx.fillStyle = isHigh ? '#00ff66' : '#94a3b8';
    ctx.font = '800 10px "DM Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isHigh ? 'H' : 'L', labelWidth - 20, topY + rowHeight / 2 + 4);

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

    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#00ff66';
    ctx.shadowBlur = 8;
    ctx.stroke();

    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#e6fff2';
    ctx.stroke();
    ctx.restore();
  });

  const legendX = labelWidth + plotWidth + 12;
  ctx.fillStyle = '#64748b';
  ctx.font = '700 9px "DM Mono", monospace';
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

export async function exportCircuitImage() {
  const workspace = document.getElementById('sandbox-workspace-canvas');
  if (!workspace) return;

  const nodes = Array.from(workspace.querySelectorAll('.sandbox-node'));
  if (nodes.length === 0) {
    if (window.showToast) window.showToast('Canvas is empty — place components first.');
    return;
  }

  if (window.showToast) window.showToast('Capturing high-resolution circuit snapshot...');

  try {
    const wsRect = workspace.getBoundingClientRect();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    const toWorldRect = rect => {
      const currentZoom = window.__sandboxZoom || 1;
      return {
        left: (rect.left - wsRect.left - (window.__sandboxPanX || 0)) / currentZoom,
        top: (rect.top - wsRect.top - (window.__sandboxPanY || 0)) / currentZoom,
        width: rect.width / currentZoom,
        height: rect.height / currentZoom
      };
    };

    nodes.forEach(n => {
      const r = n.getBoundingClientRect();
      const worldRect = toWorldRect(r);
      const left = worldRect.left;
      const top = worldRect.top;
      if (left < minX) minX = left;
      if (top < minY) minY = top;
      if (left + worldRect.width > maxX) maxX = left + worldRect.width;
      if (top + worldRect.height > maxY) maxY = top + worldRect.height;
    });

    const wiresSvg = document.getElementById('sandbox-wires-svg');
    if (wiresSvg) {
      const paths = wiresSvg.querySelectorAll('path.sb-wire-core');
      paths.forEach(p => {
        try {
          const b = p.getBoundingClientRect();
          const worldRect = toWorldRect(b);
          const left = worldRect.left;
          const top = worldRect.top;
          if (left < minX) minX = left;
          if (top < minY) minY = top;
          if (left + worldRect.width > maxX) maxX = left + worldRect.width;
          if (top + worldRect.height > maxY) maxY = top + worldRect.height;
        } catch (e) {}
      });
    }

    const pad = 48;
    const bannerH = 50;
    minX = Math.floor(minX - pad);
    minY = Math.floor(minY - pad);
    const contentW = Math.max(420, Math.ceil(maxX - minX + pad * 2));
    const contentH = Math.max(260, Math.ceil(maxY - minY + pad * 2));

    const scale = 2; // High-DPI retina capture
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(contentW * scale);
    canvas.height = Math.round((contentH + bannerH) * scale);
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
    const bgFill = isDark ? '#080e18' : '#f6f8f4';
    const gridDot = isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 33, 28, 0.08)';

    // Background
    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, contentW, contentH + bannerH);

    // Grid dots
    ctx.fillStyle = gridDot;
    for (let gx = 0; gx < contentW; gx += 20) {
      for (let gy = bannerH; gy < contentH + bannerH; gy += 20) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Banner Header
    ctx.fillStyle = isDark ? '#0f172a' : '#eef2eb';
    ctx.fillRect(0, 0, contentW, bannerH);
    ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.2)' : '#d9e1da';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, bannerH);
    ctx.lineTo(contentW, bannerH);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#38bdf8' : '#163b31';
    ctx.font = 'bold 18px "Manrope", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LOGICQUEST', 20, 32);

    ctx.fillStyle = isDark ? '#94a3b8' : '#66736e';
    ctx.font = '600 13px "DM Mono", monospace';
    ctx.fillText(`CIRCUIT SNAPSHOT • ${nodes.length} COMPONENTS`, 160, 31);

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    ctx.textAlign = 'right';
    ctx.fillText(dateStr, contentW - 20, 31);
    ctx.textAlign = 'left';

    const originX = minX;
    const originY = minY - bannerH;

    // 1. Draw Wires with casing, stroke color, and active glow
    if (wiresSvg) {
      const casings = Array.from(wiresSvg.querySelectorAll('path.sb-wire-casing'));
      casings.forEach(p => {
        const d = p.getAttribute('d');
        if (!d) return;
        ctx.save();
        ctx.translate(-originX, -originY);
        ctx.strokeStyle = isDark ? '#05080f' : '#cbd5e1';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke(new Path2D(d));
        ctx.restore();
      });

      const cores = Array.from(wiresSvg.querySelectorAll('path.sb-wire-core'));
      cores.forEach(p => {
        const d = p.getAttribute('d');
        if (!d) return;
        const color = p.style.stroke || p.getAttribute('stroke') || '#3b82f6';
        const isHigh = p.classList.contains('high');
        ctx.save();
        ctx.translate(-originX, -originY);
        ctx.strokeStyle = color;
        ctx.lineWidth = isHigh ? 3.5 : 2.6;
        ctx.lineCap = 'round';
        if (isHigh) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
        }
        ctx.stroke(new Path2D(d));
        ctx.restore();
      });
    }

    // 2. Draw Nodes & Serialized SVGs
    for (const n of nodes) {
      const r = toWorldRect(n.getBoundingClientRect());
      const nx = r.left - originX;
      const ny = r.top - originY;
      const nw = r.width;
      const nh = r.height;

      const isIC = n.classList.contains('real-ic-node');

      ctx.save();
      if (isIC) {
        // IC Chip Body
        ctx.fillStyle = isDark ? '#091322' : '#1e293b';
        ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(nx, ny, nw, nh, 8);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.stroke();

        // IC Notch & Pin 1 dot
        ctx.fillStyle = isDark ? '#05080f' : '#0f172a';
        ctx.beginPath();
        ctx.arc(nx + nw / 2, ny, 7, 0, Math.PI);
        ctx.fill();

        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(nx + 14, ny + 16, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // IC Header Text
        const partEl = n.querySelector('.real-ic-part');
        if (partEl) {
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 11px "DM Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(partEl.textContent.trim(), nx + nw / 2, ny + 22);
        }
      } else {
        // Standard Node Body
        ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
        ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(nx, ny, nw, nh, 8);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.stroke();

        // Node Header
        const headerEl = n.querySelector('.sandbox-node-header');
        if (headerEl && headerEl.style.display !== 'none') {
          ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
          ctx.font = 'bold 10px "Manrope", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(headerEl.textContent.trim().toUpperCase(), nx + nw / 2, ny + 15);
        }
      }
      ctx.restore();

      // Render Nested SVGs inside node (e.g. realistic gate symbols, IC schematic SVG)
      const svgs = Array.from(n.querySelectorAll('svg'));
      for (const svgEl of svgs) {
        if (svgEl.classList.contains('node-delete-btn')) continue;
        const svgRect = svgEl.getBoundingClientRect();
        const svgWorldRect = toWorldRect(svgRect);
        const sx = svgWorldRect.left - originX;
        const sy = svgWorldRect.top - originY;
        const sw = svgWorldRect.width;
        const sh = svgWorldRect.height;
        if (sw > 0 && sh > 0) {
          try {
            const clone = svgEl.cloneNode(true);
            clone.setAttribute('width', sw);
            clone.setAttribute('height', sh);
            clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            inlineSvgStyles(svgEl, clone);
            const svgXml = new XMLSerializer().serializeToString(clone);
            const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            const img = new Image();
            await new Promise((resolve) => {
              img.onload = () => {
                ctx.drawImage(img, sx, sy, sw, sh);
                URL.revokeObjectURL(url);
                resolve();
              };
              img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve();
              };
              img.src = url;
            });
          } catch (e) {
            console.warn('SVG snapshot render warning:', e);
          }
        }
      }

      const detailSelectors = [
        '.sandbox-toggle-btn', '.gate-io-btn', '.gate-input-badge',
        '.bulb-state-label', '.rgb-led-label', '.buzzer-label',
        '.led-bar-value', '.clk-phase', '.clk-hz', '.clk-start-label',
        '.sensor-wrap span', '.label-textarea'
      ];
      const details = Array.from(n.querySelectorAll(detailSelectors.join(',')));
      details.forEach(detail => {
        const detailRect = detail.getBoundingClientRect();
        if (detailRect.width <= 0 || detailRect.height <= 0) return;
        const style = getComputedStyle(detail);
        if (style.display === 'none' || style.visibility === 'hidden') return;

        const detailWorldRect = toWorldRect(detailRect);
        const dx = detailWorldRect.left - originX;
        const dy = detailWorldRect.top - originY;
        const dw = detailWorldRect.width;
        const dh = detailWorldRect.height;
        const background = style.backgroundColor;
        const borderColor = style.borderColor;
        if (background && background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') {
          ctx.save();
          ctx.fillStyle = background;
          ctx.strokeStyle = borderColor || background;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(dx, dy, dw, dh, Math.min(5, dw / 4, dh / 4));
          ctx.fill();
          if (style.borderStyle !== 'none') ctx.stroke();
          ctx.restore();
        }

        let text = detail.value || detail.textContent || '';
        text = String(text).replace(/\s+/g, ' ').trim();
        if (!text) return;
        const fontSize = Math.max(8, parseFloat(style.fontSize) || 10);
        ctx.save();
        ctx.fillStyle = style.color || (isDark ? '#f8fafc' : '#1e293b');
        ctx.font = `${style.fontWeight || 600} ${fontSize}px ${style.fontFamily || 'sans-serif'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, dx + dw / 2, dy + dh / 2);
        ctx.restore();
      });

      // Draw Node Ports
      const ports = Array.from(n.querySelectorAll('.sandbox-port'));
      ports.forEach(p => {
        const pr = p.getBoundingClientRect();
        const portWorldRect = toWorldRect(pr);
        const px = portWorldRect.left - originX + portWorldRect.width / 2;
        const py = portWorldRect.top - originY + portWorldRect.height / 2;
        const isConnected = p.classList.contains('connected');
        const isActivePort = p.classList.contains('active-port');

        ctx.save();
        ctx.fillStyle = isActivePort ? '#00ff66' : isConnected ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? '#334155' : '#94a3b8');
        ctx.strokeStyle = isDark ? '#05080f' : '#ffffff';
        ctx.lineWidth = 1.5;
        if (isActivePort) {
          ctx.shadowColor = '#00ff66';
          ctx.shadowBlur = 6;
        }
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
    }

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `logicquest-circuit-${Date.now().toString().slice(-4)}.png`;
    a.href = dataUrl;
    a.click();
    if (window.showToast) window.showToast('Circuit snapshot saved to Downloads ✓');
  } catch (err) {
    console.error('Circuit snapshot error:', err);
    if (window.showAlert) window.showAlert('Failed to export circuit snapshot: ' + err.message);
  }
}
window.exportCircuitImage = exportCircuitImage;
