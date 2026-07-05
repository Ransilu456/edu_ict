/**
 * LogicQuest — Custom IC Creator & Library Manager
 * Exposes a professional DIP package UI, Pin Configurator/Manager, Edit Internal Circuit, 
 * Strict TTL VCC/GND Mode, Signal state animations, and Hierarchical Evaluation.
 */

// We will keep all definitions and helper functions here and attach them to the window.
window.customICs = window.customICs || {};

// Helper: Upgrades or initializes the pins configuration of a custom IC
function upgradeICDefinition(def, name) {
  if (!def.pins) {
    const I = def.inputs || 0;
    const O = def.outputs || 0;
    const needed = I + O + 2; // + VCC and GND
    const standardSizes = [8, 14, 16, 20, 24, 28, 40];
    let P = standardSizes.find(s => s >= needed);
    if (!P) P = 40; // Fallback
    
    const pins = [];
    // Initialize P pins
    for (let i = 1; i <= P; i++) {
      pins.push({
        number: i,
        name: `PIN_${i}`,
        direction: 'unused',
        description: ''
      });
    }
    
    // Assign GND and VCC
    const gndPin = P / 2;
    const vccPin = P;
    pins[gndPin - 1] = { number: gndPin, name: 'GND', direction: 'ground', description: 'Ground (0V)' };
    pins[vccPin - 1] = { number: vccPin, name: 'VCC', direction: 'power', description: 'Power (+5V)' };
    
    // Assign inputs on the left side (Pins 1, 2, 3... avoiding GND)
    let inIdx = 0;
    for (let i = 1; i <= P / 2; i++) {
      if (i === gndPin) continue;
      if (inIdx < I) {
        pins[i - 1] = {
          number: i,
          name: def.inputPorts && def.inputPorts[inIdx] ? (def.nodes.find(n => n.id === def.inputPorts[inIdx])?.label || `I${inIdx}`) : `I${inIdx}`,
          direction: 'input',
          internalIndex: inIdx,
          description: `Input Port ${inIdx}`
        };
        inIdx++;
      }
    }
    
    // Assign outputs on the right side (Pins P-1, P-2... avoiding VCC)
    let outIdx = 0;
    for (let i = P - 1; i > P / 2; i--) {
      if (outIdx < O) {
        pins[i - 1] = {
          number: i,
          name: def.outputPorts && def.outputPorts[outIdx] ? (def.nodes.find(n => n.id === def.outputPorts[outIdx])?.label || `Y${outIdx}`) : `Y${outIdx}`,
          direction: 'output',
          internalIndex: outIdx,
          description: `Output Port ${outIdx}`
        };
        outIdx++;
      }
    }
    
    def.pins = pins;
    def.pinCount = P;
    def.strictTTL = def.strictTTL || false;
    def.delay = def.delay || 0;
    def.description = def.description || `Custom ${name} Integrated Circuit`;
  }
  return def;
}
window.upgradeICDefinition = upgradeICDefinition;

// Generates dynamic SVG for the realistic DIP chip package
function getCustomICNodeInner(node) {
  const icName = node.data.icName || node.type.slice(9);
  const def = window.customICs[icName];
  if (!def) return `<div class="gate-type-label">${icName}</div>`;
  
  const P = def.pinCount || 8;
  const height = (P / 2) * 22 + 30;
  
  // Outer wrapping SVG
  let svg = `<svg viewBox="0 0 140 ${height}" width="140" height="${height}">`;
  
  // Definitions for gradients & shadow
  svg += `
    <defs>
      <filter id="dip-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.65"/>
      </filter>
      <linearGradient id="pin-silver" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="50%" stop-color="#cbd5e1"/>
        <stop offset="100%" stop-color="#64748b"/>
      </linearGradient>
      <linearGradient id="pin-gold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#d4af37"/>
        <stop offset="50%" stop-color="#fff3a8"/>
        <stop offset="100%" stop-color="#aa7c11"/>
      </linearGradient>
    </defs>
  `;
  
  // Power check
  let isPowered = true;
  if (def.strictTTL) {
    const vccVal = node.inputValues[def.inputs] || 0;
    const gndVal = node.inputValues[def.inputs + 1] || 0;
    isPowered = (vccVal === 1 && gndVal === 0);
  }
  
  // Color of pins based on logic state
  const getPinColor = (pin) => {
    if (!isPowered && def.strictTTL) return '#f97316'; // Undefined (Orange) if not powered
    let val = 0;
    if (pin.direction === 'input') {
      val = node.inputValues[pin.internalIndex] || 0;
    } else if (pin.direction === 'output') {
      val = node.outputStates ? (node.outputStates[pin.internalIndex] || 0) : 0;
    } else if (pin.direction === 'power') {
      val = node.inputValues[def.inputs] || 0;
    } else if (pin.direction === 'ground') {
      val = node.inputValues[def.inputs + 1] || 0;
    } else {
      return '#64748b'; // metal outline
    }
    return val === 1 ? '#22d3a5' : '#475569'; // Green/Grey
  };
  
  // Pins rendering (horizontal leads)
  const isGold = def.isFavorite || P === 40;
  const pinFill = isGold ? 'url(#pin-gold)' : 'url(#pin-silver)';
  
  def.pins.forEach(pin => {
    const isLeft = pin.number <= P / 2;
    const vIdx = isLeft ? pin.number - 1 : P - pin.number;
    const y = 15 + vIdx * 22 + 11;
    const strokeCol = getPinColor(pin);
    
    if (isLeft) {
      // Left side lead
      svg += `<rect x="4" y="${y-4}" width="16" height="8" rx="1" fill="${pinFill}" stroke="${strokeCol}" stroke-width="1.2"/>`;
      // Silk-screen labels
      svg += `<text x="24" y="${y+3}" font-size="7" fill="var(--text-muted)" font-family="monospace" font-weight="bold">${pin.number}</text>`;
      svg += `<text x="34" y="${y+3}" font-size="8" fill="#e2e8f0" font-family="sans-serif" font-weight="700" opacity="0.85">${pin.name}</text>`;
    } else {
      // Right side lead
      svg += `<rect x="120" y="${y-4}" width="16" height="8" rx="1" fill="${pinFill}" stroke="${strokeCol}" stroke-width="1.2"/>`;
      svg += `<text x="116" y="${y+3}" font-size="7" fill="var(--text-muted)" font-family="monospace" font-weight="bold" text-anchor="end">${pin.number}</text>`;
      svg += `<text x="106" y="${y+3}" font-size="8" fill="#e2e8f0" font-family="sans-serif" font-weight="700" text-anchor="end" opacity="0.85">${pin.name}</text>`;
    }
  });
  
  // Black package body
  svg += `
    <rect x="20" y="8" width="100" height="${height-16}" rx="5" fill="#18181c" stroke="#334155" stroke-width="1.5" filter="url(#dip-shadow)"/>
    <!-- Top indentation notch -->
    <path d="M 62 8 A 8 8 0 0 0 78 8 Z" fill="var(--bg-secondary)"/>
    <!-- Pin-1 marker dot -->
    <circle cx="28" cy="18" r="2.5" fill="#475569"/>
    <!-- Silk text IC Name -->
    <text x="70" y="28" text-anchor="middle" font-size="10" fill="#cbd5e1" font-family="monospace" font-weight="900" letter-spacing="0.5">${icName.toUpperCase()}</text>
  `;
  
  // Mini gates schematic visualization inside
  svg += `<g opacity="0.6">`;
  svg += generateMiniSchematicSVG(def, height / 2);
  svg += `</g>`;
  
  // Warn badge if power missing in Strict TTL Mode
  if (def.strictTTL && !isPowered) {
    svg += `
      <g transform="translate(62, ${height - 24})">
        <path d="M 8 0 L 16 14 H 0 Z" fill="#f57c00" stroke="#18181c" stroke-width="0.5"/>
        <text x="8" y="12" font-size="8" fill="#18181c" text-anchor="middle" font-family="sans-serif" font-weight="900">!</text>
      </g>
    `;
  }
  
  svg += `</svg>`;
  return svg;
}
window.getCustomICNodeInner = getCustomICNodeInner;

// Scaled SVG visualization of internal gates inside the IC package body
function generateMiniSchematicSVG(icDef, centerY) {
  if (!icDef || !icDef.nodes || icDef.nodes.length === 0) return '';
  
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  icDef.nodes.forEach(n => {
    if (n.type === 'text-label') return;
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x > maxX) maxX = n.x;
    if (n.y > maxY) maxY = n.y;
  });
  
  if (minX === Infinity) return '';
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  
  // Center schematic inside the chip package: X: 45 to 95, Y: centerY +/- 12
  const targetW = 50, targetH = 26;
  const scale = Math.min(targetW / w, targetH / h, 0.12);
  
  const cx = minX + w / 2;
  const cy = minY + h / 2;
  
  const getScaled = (x, y) => ({
    x: 70 + (x - cx) * scale,
    y: centerY + (y - cy) * scale
  });
  
  let svg = '';
  // Internal Wires
  icDef.wires.forEach(wire => {
    const src = icDef.nodes.find(n => n.id === wire.fromNodeId);
    const dst = icDef.nodes.find(n => n.id === wire.toNodeId);
    if (!src || !dst) return;
    const p1 = getScaled(src.x, src.y);
    const p2 = getScaled(dst.x, dst.y);
    svg += `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="rgba(255,255,255,0.18)" stroke-width="0.6"/>`;
  });
  
  // Internal Gates
  icDef.nodes.forEach(n => {
    if (n.type === 'text-label') return;
    const p = getScaled(n.x, n.y);
    const color = 'rgba(255,255,255,0.35)';
    if (n.type === 'and') {
      svg += `<path d="M ${p.x-2.5} ${p.y-2} h 2.5 a 2 2 0 0 1 0 4 h -2.5 Z" fill="none" stroke="${color}" stroke-width="0.6"/>`;
    } else if (n.type === 'or') {
      svg += `<path d="M ${p.x-2.5} ${p.y-2} q 2.5 0 4 2 q -1.5 2 -4 2 q 0.8 -2 0 -4" fill="none" stroke="${color}" stroke-width="0.6"/>`;
    } else if (n.type === 'not') {
      svg += `<polygon points="${p.x-2},${p.y-1.5} ${p.x+1.5},${p.y} ${p.x-2},${p.y+1.5}" fill="none" stroke="${color}" stroke-width="0.6"/><circle cx="${p.x+2.5}" cy="${p.y}" r="0.5" fill="${color}"/>`;
    } else {
      svg += `<circle cx="${p.x}" cy="${p.y}" r="1" fill="none" stroke="${color}" stroke-width="0.6"/>`;
    }
  });
  
  return svg;
}
window.generateMiniSchematicSVG = generateMiniSchematicSVG;

// Renders the clickable ports on the DOM exactly aligned with pin coordinates
function renderCustomICPorts(node, el) {
  const icName = node.data.icName || node.type.slice(9);
  const def = window.customICs[icName];
  if (!def) return;
  
  const P = def.pinCount || 8;
  const pins = def.pins;
  
  // Clear old ports
  el.querySelectorAll('.sandbox-port').forEach(p => p.remove());
  
  pins.forEach(pin => {
    if (pin.direction === 'unused') return;
    
    const isLeft = pin.number <= P / 2;
    const vIdx = isLeft ? pin.number - 1 : P - pin.number;
    const height = (P / 2) * 22 + 30;
    const topPct = ((15 + vIdx * 22 + 11) / height) * 100;
    
    const port = document.createElement('div');
    port.className = `sandbox-port port-${pin.direction === 'output' ? 'output' : 'input'}`;
    port.dataset.pinNumber = pin.number;
    port.dataset.pinType = pin.direction;
    
    if (pin.direction === 'input') {
      port.dataset.portIdx = pin.internalIndex;
    } else if (pin.direction === 'output') {
      port.dataset.portIdx = pin.internalIndex;
    } else if (pin.direction === 'power') {
      port.dataset.portIdx = def.inputs;
    } else if (pin.direction === 'ground') {
      port.dataset.portIdx = def.inputs + 1;
    }
    
    port.style.top = `${topPct}%`;
    if (isLeft) {
      port.style.left = '-12px';
    } else {
      port.style.right = '-12px';
    }
    
    // Hover details and state highlights
    port.addEventListener('mouseenter', (e) => showPinTooltip(e, node, pin));
    port.addEventListener('mouseleave', hidePinTooltip);
    
    port.addEventListener('click', (e) => {
      if (window._ignorePortClick) return;
      e.stopPropagation();
      window.handlePortClick(node.id, pin.direction === 'output' ? 'output' : 'input', parseInt(port.dataset.portIdx));
    });
    
    port.addEventListener('touchend', (e) => {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      window._ignorePortClick = true;
      setTimeout(() => { window._ignorePortClick = false; }, 200);
      window.handlePortClick(node.id, pin.direction === 'output' ? 'output' : 'input', parseInt(port.dataset.portIdx));
    });
    
    el.appendChild(port);
  });
}
window.renderCustomICPorts = renderCustomICPorts;

// Interactive tooltip on hover showing Pin #, Name, logic signal, etc.
let _pinTooltip = null;
function showPinTooltip(e, node, pin) {
  hidePinTooltip();
  
  const icName = node.data.icName || node.type.slice(9);
  const def = window.customICs[icName];
  if (!def) return;
  
  let val = 0;
  if (pin.direction === 'input') {
    val = node.inputValues[pin.internalIndex];
  } else if (pin.direction === 'output') {
    val = node.outputStates ? node.outputStates[pin.internalIndex] : node.outputState;
  } else if (pin.direction === 'power') {
    val = node.inputValues[def.inputs];
  } else if (pin.direction === 'ground') {
    val = node.inputValues[def.inputs + 1];
  }
  
  const valText = val === 1 ? 'HIGH (1)' : val === 0 ? 'LOW (0)' : 'Undefined';
  const valCol = val === 1 ? '#22d3a5' : val === 0 ? '#94a3b8' : '#fbbf24';
  
  const tooltip = document.createElement('div');
  tooltip.className = 'ic-pin-tooltip';
  tooltip.style.cssText = `
    position: fixed; left: ${e.clientX + 12}px; top: ${e.clientY - 20}px; z-index: 100000;
    background: rgba(15, 23, 42, 0.95); border: 1px solid var(--border-color); border-radius: 6px;
    padding: 6px 12px; font-size: 0.75rem; font-family: var(--font-body); color: #fff;
    pointer-events: none; box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  `;
  tooltip.innerHTML = `
    <div><strong>Pin ${pin.number}:</strong> ${pin.name}</div>
    <div style="font-size: 0.7rem; color: var(--text-muted)">Type: ${pin.direction.toUpperCase()}</div>
    <div style="color: ${valCol}; font-weight: 700; margin-top: 2px">State: ${valText}</div>
    ${pin.description ? `<div style="font-size: 0.65rem; color: var(--text-muted); font-style: italic">${pin.description}</div>` : ''}
  `;
  document.body.appendChild(tooltip);
  _pinTooltip = tooltip;
}
window.showPinTooltip = showPinTooltip;

function hidePinTooltip() {
  if (_pinTooltip) { _pinTooltip.remove(); _pinTooltip = null; }
}
window.hidePinTooltip = hidePinTooltip;

// ── Pin Manager / Configurator Modal UI ──────────────────────────────────────
let _pinModal = null;
function openICPinManager(nodeId) {
  const node = window.sandboxNodes.find(n => n.id === nodeId);
  if (!node || !node.type.startsWith('custom-ic-')) return;
  const icName = node.data.icName || node.type.slice(9);
  const def = window.customICs[icName];
  if (!def) return;
  
  // Trigger upgraded version just in case
  const cleanDef = upgradeICDefinition(def, icName);
  renderPinConfiguratorModal(cleanDef, icName, (updatedDef) => {
    // Save updated definition
    window.customICs[icName] = updatedDef;
    const stored = JSON.parse(localStorage.getItem('logicQuest_ics') || '{}');
    stored[icName] = updatedDef;
    localStorage.setItem('logicQuest_ics', JSON.stringify(stored));
    
    // Update node instances in the current sandbox
    window.sandboxNodes.forEach(n => {
      if (n.type === `custom-ic-${icName}`) {
        n.inputsCount = updatedDef.inputs + (updatedDef.strictTTL ? 2 : 0);
        n.inputValues = Array(n.inputsCount).fill(0);
        n.outputStates = Array(updatedDef.outputs).fill(0);
        
        // Re-render
        const el = document.getElementById(n.id);
        if (el) {
          el.style.height = `${(updatedDef.pinCount / 2) * 22 + 30}px`;
          const body = el.querySelector('.sandbox-node-body');
          if (body) body.innerHTML = getCustomICNodeInner(n);
          renderCustomICPorts(n, el);
        }
      }
    });
    
    window.evaluateSandbox();
    window.showToast(`IC "${icName}" configured successfully ✓`);
  });
}
window.openICPinManager = openICPinManager;

function renderPinConfiguratorModal(icDef, icName, onSave, isNewCreation = false) {
  if (_pinModal) _pinModal.remove();
  
  const modal = document.createElement('div');
  modal.className = 'success-modal-overlay';
  modal.style.display = 'flex';
  modal.style.zIndex = '99999';
  
  // Clone def for safe scratch edits
  const scratchDef = JSON.parse(JSON.stringify(icDef));
  
  const updateModalContent = () => {
    const P = scratchDef.pinCount;
    const pins = scratchDef.pins;
    
    // Left column: Info & general config
    // Center: Visual DIP package preview
    // Right: Interactive drag-reorder pins list
    let pinListHtml = '';
    pins.forEach((pin, idx) => {
      const isLeft = pin.number <= P / 2;
      const highlight = pin.direction === 'unused' ? 'opacity: 0.5' : '';
      pinListHtml += `
        <div class="pin-config-row" draggable="true" data-index="${idx}" style="${highlight}; display: flex; align-items: center; gap: 6px; padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); margin-bottom: 4px; cursor: grab;">
          <span style="font-family: monospace; font-weight: bold; width: 18px">${pin.number}</span>
          <input type="text" value="${pin.name}" class="pin-name-input" data-index="${idx}" style="width: 55px; font-size: 0.75rem; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 3px; padding: 2px 4px; font-weight: 700;" title="Pin Name"/>
          <select class="pin-dir-select" data-index="${idx}" style="font-size: 0.7rem; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 3px; padding: 2px 4px;">
            <option value="unused" ${pin.direction === 'unused' ? 'selected' : ''}>Unused</option>
            <option value="input" ${pin.direction === 'input' ? 'selected' : ''}>Input</option>
            <option value="output" ${pin.direction === 'output' ? 'selected' : ''}>Output</option>
            <option value="power" ${pin.direction === 'power' ? 'selected' : ''}>VCC (Power)</option>
            <option value="ground" ${pin.direction === 'ground' ? 'selected' : ''}>GND (Ground)</option>
          </select>
          <input type="text" value="${pin.description || ''}" placeholder="Desc..." class="pin-desc-input" data-index="${idx}" style="flex: 1; min-width: 40px; font-size: 0.7rem; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 3px; padding: 2px 4px;"/>
        </div>
      `;
    });
    
    // Generate DIP Preview inside modal
    let previewNode = {
      type: `custom-ic-${icName}`,
      data: { icName },
      inputValues: Array(scratchDef.inputs + (scratchDef.strictTTL ? 2 : 0)).fill(0),
      outputStates: Array(scratchDef.outputs).fill(0)
    };
    
    // Overwrite window customICs temporarily so preview renderer has access to scratch config
    const oldICs = window.customICs[icName];
    window.customICs[icName] = scratchDef;
    const previewSvgHtml = getCustomICNodeInner(previewNode);
    if (oldICs) window.customICs[icName] = oldICs; // restore
    else delete window.customICs[icName];
    
    modal.innerHTML = `
      <div class="success-modal" style="max-width: 820px; width: 94%; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; text-align: left;">
        <h2 class="success-modal-title" style="font-size: 1.25rem; margin-bottom: 0.25rem">${isNewCreation ? 'Create Custom IC Pin Configuration' : 'DIP IC Pin Manager / Configurator'}</h2>
        
        <div class="ic-config-grid" style="display: flex; gap: 1.25rem; flex-wrap: wrap; flex: 1; min-height: 0;">
          
          <!-- Column 1: Metadata settings -->
          <div class="ic-config-meta" style="flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 0.75rem;">
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 3px">IC Part Name / Number</label>
              <input type="text" id="ic-config-name" value="${icName}" style="width: 100%; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); font-family: monospace; font-weight: bold;"/>
            </div>
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 3px">Description</label>
              <textarea id="ic-config-desc" style="width: 100%; height: 60px; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); font-size: 0.8rem; resize: none;">${scratchDef.description || ''}</textarea>
            </div>
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 3px">Package Pin Count</label>
              <select id="ic-config-pins" style="width: 100%; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary);">
                <option value="8" ${P === 8 ? 'selected' : ''}>8-pin DIP</option>
                <option value="14" ${P === 14 ? 'selected' : ''}>14-pin DIP</option>
                <option value="16" ${P === 16 ? 'selected' : ''}>16-pin DIP</option>
                <option value="20" ${P === 20 ? 'selected' : ''}>20-pin DIP</option>
                <option value="24" ${P === 24 ? 'selected' : ''}>24-pin DIP</option>
                <option value="28" ${P === 28 ? 'selected' : ''}>28-pin DIP</option>
                <option value="40" ${P === 40 ? 'selected' : ''}>40-pin DIP</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 3px">Propagation Delay (ns)</label>
              <input type="range" id="ic-config-delay" min="0" max="40" step="5" value="${scratchDef.delay || 0}" style="width: 100%; accent-color: var(--color-cyan);"/>
              <div style="font-size: 0.7rem; color: var(--text-muted); text-align: right; font-weight: bold;" id="ic-config-delay-lbl">${scratchDef.delay || 0} ns</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <input type="checkbox" id="ic-config-strict" ${scratchDef.strictTTL ? 'checked' : ''} style="width: 15px; height: 15px; cursor: pointer;"/>
              <label for="ic-config-strict" style="font-size: 0.75rem; font-weight: 700; color: var(--text-primary); cursor: pointer;">Strict TTL Mode (VCC & GND Required)</label>
            </div>
            
            <div style="margin-top: auto; display: flex; flex-direction: column; gap: 6px;">
              <button id="ic-config-autodetect" class="btn-secondary" style="padding: 6px 12px; font-size: 0.78rem">🔌 Auto-detect Pin Layout</button>
              ${!isNewCreation ? `<button id="ic-config-edit-internal" class="btn-secondary" style="padding: 6px 12px; font-size: 0.78rem; background: var(--color-indigo); color: #fff">✏️ Edit Internal Circuit</button>` : ''}
            </div>
          </div>
          
          <!-- Column 2: Live SVG package preview -->
          <div class="ic-config-preview" style="width: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-tertiary); border-radius: 8px; padding: 10px; border: 1px solid var(--border-color);">
            <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; margin-bottom: 8px">Live Chip Preview</div>
            <div id="ic-config-preview-svg" style="display: flex; align-items: center; justify-content: center; width: 100%;">
              ${previewSvgHtml}
            </div>
          </div>
          
          <!-- Column 3: Interactive pin lists -->
          <div class="ic-config-pins-list-wrap" style="flex: 1.5; min-width: 280px; display: flex; flex-direction: column;">
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px">Drag pin cards to reorder pin numbers:</label>
            <div class="ic-config-pins-list" style="flex: 1; max-height: 250px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px; padding: 8px; background: var(--bg-tertiary);">
              ${pinListHtml}
            </div>
          </div>
          
        </div>
        
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 0.5rem;">
          <button class="btn-secondary" id="ic-config-cancel" style="flex: 0; padding: 0.55rem 1.25rem">Cancel</button>
          <button class="btn-primary" id="ic-config-save" style="flex: 0; padding: 0.55rem 1.5rem">${isNewCreation ? 'Create IC' : 'Save Changes'}</button>
        </div>
      </div>
    `;
    
    // Add setup event listeners inside modal
    setupModalListeners(modal, scratchDef, icName, updateModalContent, onSave, isNewCreation);
  };
  
  updateModalContent();
  document.body.appendChild(modal);
  _pinModal = modal;
}
window.renderPinConfiguratorModal = renderPinConfiguratorModal;

// Modal interactive listeners setup (including Drag & Drop reordering)
function setupModalListeners(modal, scratchDef, icName, updateModalContent, onSave, isNewCreation) {
  // Input triggers
  const nameInput = modal.querySelector('#ic-config-name');
  if (nameInput) {
    nameInput.addEventListener('change', () => {
      // update scratch name / definitions if valid
    });
  }
  
  const descText = modal.querySelector('#ic-config-desc');
  if (descText) {
    descText.addEventListener('input', () => {
      scratchDef.description = descText.value;
    });
  }
  
  const pinsSelect = modal.querySelector('#ic-config-pins');
  if (pinsSelect) {
    pinsSelect.addEventListener('change', () => {
      const newP = parseInt(pinsSelect.value);
      const oldP = scratchDef.pinCount;
      scratchDef.pinCount = newP;
      
      // Grow or shrink pins array
      if (newP > oldP) {
        for (let i = oldP + 1; i <= newP; i++) {
          scratchDef.pins.push({ number: i, name: `PIN_${i}`, direction: 'unused', description: '' });
        }
      } else {
        scratchDef.pins = scratchDef.pins.slice(0, newP);
      }
      
      // Update GND/VCC locations automatically for standard packages
      const oldGnd = oldP / 2;
      const oldVcc = oldP;
      const newGnd = newP / 2;
      const newVcc = newP;
      
      // Clear old labels
      scratchDef.pins.forEach(pin => {
        if (pin.direction === 'ground' || pin.direction === 'power') {
          pin.direction = 'unused';
          pin.name = `PIN_${pin.number}`;
        }
      });
      // Re-place VCC/GND
      scratchDef.pins[newGnd - 1] = { number: newGnd, name: 'GND', direction: 'ground', description: 'Ground (0V)' };
      scratchDef.pins[newVcc - 1] = { number: newVcc, name: 'VCC', direction: 'power', description: 'Power (+5V)' };
      
      updateModalContent();
    });
  }
  
  const delaySlider = modal.querySelector('#ic-config-delay');
  const delayLbl = modal.querySelector('#ic-config-delay-lbl');
  if (delaySlider && delayLbl) {
    delaySlider.addEventListener('input', () => {
      scratchDef.delay = parseInt(delaySlider.value);
      delayLbl.textContent = `${scratchDef.delay} ns`;
    });
  }
  
  const strictCheck = modal.querySelector('#ic-config-strict');
  if (strictCheck) {
    strictCheck.addEventListener('change', () => {
      scratchDef.strictTTL = strictCheck.checked;
      updateModalContent();
    });
  }
  
  // Auto-detect pin values inside the modal
  const autodetectBtn = modal.querySelector('#ic-config-autodetect');
  if (autodetectBtn) {
    autodetectBtn.addEventListener('click', () => {
      // Re-run autodetect candidate pins
      const detected = autoDetectICPorts(scratchDef.nodes, scratchDef.wires);
      scratchDef.inputs = detected.inputs;
      scratchDef.outputs = detected.outputs;
      scratchDef.inputPorts = detected.inputPorts;
      scratchDef.outputPorts = detected.outputPorts;
      
      // Re-map pins cleanly
      delete scratchDef.pins;
      upgradeICDefinition(scratchDef, icName);
      
      window.showToast('Auto-detected external ports successfully ✓');
      updateModalContent();
    });
  }
  
  // Edit internal circuit button
  const editInternalBtn = modal.querySelector('#ic-config-edit-internal');
  if (editInternalBtn) {
    editInternalBtn.addEventListener('click', () => {
      modal.remove();
      startEditingICInternalCircuit(icName);
    });
  }
  
  // Drag & drop handlers for pins reordering
  const pinRows = modal.querySelectorAll('.pin-config-row');
  let draggedIdx = null;
  
  pinRows.forEach(row => {
    row.addEventListener('dragstart', () => {
      draggedIdx = parseInt(row.getAttribute('data-index'));
      row.style.opacity = '0.4';
    });
    row.addEventListener('dragend', () => {
      row.style.opacity = '1';
    });
    row.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    row.addEventListener('dragenter', () => {
      row.style.border = '1px dashed var(--color-cyan)';
    });
    row.addEventListener('dragleave', () => {
      row.style.border = '1px solid var(--border-color)';
    });
    row.addEventListener('drop', () => {
      row.style.border = '1px solid var(--border-color)';
      const targetIdx = parseInt(row.getAttribute('data-index'));
      if (draggedIdx !== null && draggedIdx !== targetIdx) {
        // Swap pin directions, names, and descriptions in the array
        const temp = scratchDef.pins[draggedIdx];
        scratchDef.pins[draggedIdx] = scratchDef.pins[targetIdx];
        scratchDef.pins[targetIdx] = temp;
        
        // Correct pin numbers back to ordered sequential 1..P
        scratchDef.pins[draggedIdx].number = draggedIdx + 1;
        scratchDef.pins[targetIdx].number = targetIdx + 1;
        
        updateModalContent();
      }
    });
  });
  
  // Individual inputs edit
  modal.querySelectorAll('.pin-name-input').forEach(input => {
    input.addEventListener('change', () => {
      const idx = parseInt(input.getAttribute('data-index'));
      scratchDef.pins[idx].name = input.value.trim().toUpperCase();
      updateModalContent();
    });
  });
  
  modal.querySelectorAll('.pin-dir-select').forEach(select => {
    select.addEventListener('change', () => {
      const idx = parseInt(select.getAttribute('data-index'));
      const oldDir = scratchDef.pins[idx].direction;
      const newDir = select.value;
      
      scratchDef.pins[idx].direction = newDir;
      if (newDir === 'unused') {
        scratchDef.pins[idx].name = `PIN_${idx + 1}`;
      } else if (oldDir === 'unused' && scratchDef.pins[idx].name.startsWith('PIN_')) {
        scratchDef.pins[idx].name = newDir.toUpperCase().substring(0, 3) + (idx + 1);
      }
      
      // Update logic inputs/outputs index counters
      recomputeICInputsOutputsCount(scratchDef);
      updateModalContent();
    });
  });
  
  modal.querySelectorAll('.pin-desc-input').forEach(input => {
    input.addEventListener('input', () => {
      const idx = parseInt(input.getAttribute('data-index'));
      scratchDef.pins[idx].description = input.value.trim();
    });
  });
  
  // Save/Cancel actions
  modal.querySelector('#ic-config-cancel').addEventListener('click', () => {
    modal.remove();
  });
  
  modal.querySelector('#ic-config-save').addEventListener('click', () => {
    const finalName = nameInput.value.trim();
    if (!finalName) { window.showAlert('IC name cannot be empty.'); return; }
    
    // Save metadata
    scratchDef.description = descText.value.trim();
    scratchDef.delay = parseInt(delaySlider.value);
    scratchDef.strictTTL = strictCheck.checked;
    
    modal.remove();
    onSave(scratchDef, finalName);
  });
}

// Recalculates logical def.inputs / def.outputs based on pin configurator selections
function recomputeICInputsOutputsCount(def) {
  let inputs = 0;
  let outputs = 0;
  
  def.pins.forEach(pin => {
    if (pin.direction === 'input') {
      pin.internalIndex = inputs++;
    } else if (pin.direction === 'output') {
      pin.internalIndex = outputs++;
    } else {
      delete pin.internalIndex;
    }
  });
  
  def.inputs = inputs;
  def.outputs = outputs;
}

// ── Selection Boundary Port Autodetector ──────────────────────────────────────
function autoDetectICPorts(nodes, wires) {
  const nodeIds = nodes.map(n => n.id);
  const idSet = new Set(nodeIds);
  
  // Logical inputs/outputs candidates
  const inputPorts = [];
  const outputPorts = [];
  
  // Detect switches/clocks inside selection
  nodes.forEach(n => {
    if (n.type === 'input' || n.type === 'clock' || n.type === 'sensor') {
      if (!inputPorts.includes(n.id)) inputPorts.push(n.id);
    }
    if (n.type === 'output' || n.type === 'buzzer') {
      if (!outputPorts.includes(n.id)) outputPorts.push(n.id);
    }
  });
  
  // Detect boundary wires crossing the selected group
  wires.forEach(w => {
    if (idSet.has(w.toNodeId) && !idSet.has(w.fromNodeId)) {
      // Wire going in
      if (!inputPorts.includes(w.toNodeId)) inputPorts.push(w.toNodeId);
    }
    if (idSet.has(w.fromNodeId) && !idSet.has(w.toNodeId)) {
      // Wire going out
      if (!outputPorts.includes(w.fromNodeId)) outputPorts.push(w.fromNodeId);
    }
  });
  
  return {
    inputs: inputPorts.length,
    outputs: outputPorts.length,
    inputPorts,
    outputPorts
  };
}
window.autoDetectICPorts = autoDetectICPorts;

// ── IC Creator Wizard (From Canvas Selection) ──────────────────────────────────
function openICCreatorWizard(name) {
  const nodeIds = window.selectedNodeIds;
  const idSet = new Set(nodeIds);
  const internalNodes = window.sandboxNodes.filter(n => idSet.has(n.id));
  const internalWires = window.sandboxWires.filter(w => idSet.has(w.fromNodeId) && idSet.has(w.toNodeId));
  
  const ports = autoDetectICPorts(internalNodes, window.sandboxWires);
  
  if (ports.inputs === 0 && ports.outputs === 0) {
    window.showAlert('Selected circuit has no inputs or outputs. Add switches/LEDs or external connections.', 'No Exposable Ports');
    return;
  }
  
  // Build temporary definition
  const tempDef = {
    nodes: internalNodes.map(n => ({
      id: n.id, type: n.type, label: n.label, x: n.x, y: n.y,
      inputsCount: n.inputsCount, outputsCount: n.outputsCount,
      outputState: 0, outputState2: 0, inputValues: Array(n.inputsCount).fill(0),
      prevClockState: 0, labelText: n.labelText || '', data: n.data ? { ...n.data } : {}
    })),
    wires: internalWires.map(w => ({
      fromNodeId: w.fromNodeId, fromPortIdx: w.fromPortIdx,
      toNodeId: w.toNodeId, toPortIdx: w.toPortIdx
    })),
    inputPorts: ports.inputPorts,
    outputPorts: ports.outputPorts,
    inputs: ports.inputs,
    outputs: ports.outputs
  };
  
  upgradeICDefinition(tempDef, name);
  
  // Render configuration modal
  renderPinConfiguratorModal(tempDef, name, (finalDef, finalName) => {
    // Save to library
    const allICs = JSON.parse(localStorage.getItem('logicQuest_ics') || '{}');
    allICs[finalName] = finalDef;
    localStorage.setItem('logicQuest_ics', JSON.stringify(allICs));
    window.customICs[finalName] = finalDef;
    
    // Register component def
    window.COMPONENT_DEFS[`custom-ic-${finalName}`] = {
      inputs: finalDef.inputs,
      outputs: finalDef.outputs,
      label: finalName,
      category: 'Custom ICs',
      data: { icName: finalName }
    };
    
    // Re-render Custom ICs toolbox list
    refreshCustomICLibraryList();
    
    // Replace selection on canvas
    window.replaceSelectedWithIC(finalName, finalDef.inputs, finalDef.outputs, finalDef.inputPorts, finalDef.outputPorts);
    window.deselectAllNodes();
    window.playSound('success');
    window.showToast(`IC "${finalName}" successfully created and placed ✓`);
  }, true);
}
window.openICCreatorWizard = openICCreatorWizard;

// ── Interactive Nested IC Hierarchy Simulator ─────────────────────────────────
function evaluateCustomIC(node) {
  const icName = node.data.icName || node.type.slice(9);
  const def = window.customICs[icName];
  if (!def || def.nodes.length === 0) {
    node.outputState = 0;
    node.outputState2 = 0;
    node.outputStates = [0];
    return;
  }
  
  // Strict TTL Power check
  let isPowered = true;
  if (def.strictTTL) {
    const vcc = node.inputValues[def.inputs] || 0;
    const gnd = node.inputValues[def.inputs + 1] || 0;
    if (vcc !== 1 || gnd !== 0) {
      isPowered = false;
    }
  }
  
  if (!isPowered) {
    node.outputState = 0;
    node.outputState2 = 0;
    node.outputStates = Array(def.outputs).fill(0);
    return;
  }
  
  // Clone nodes to represent current step internal state
  const tmpNodes = def.nodes.map(n => ({
    ...n,
    outputState: n.type === 'input' ? 0 : (n.outputState || 0),
    outputState2: n.outputState2 || 0,
    outputStates: n.outputStates ? [...n.outputStates] : [n.outputState || 0],
    inputValues: Array(n.inputsCount).fill(0),
    prevClockState: 0
  }));
  
  const tmpNodeMap = {};
  tmpNodes.forEach(n => tmpNodeMap[n.id] = n);
  
  // Feed inputs
  def.inputPorts.forEach((portId, idx) => {
    const tn = tmpNodeMap[portId];
    if (tn) {
      tn.outputState = node.inputValues[idx] || 0;
      tn.outputStates = [tn.outputState];
    }
  });
  
  const tmpWires = def.wires.map(w => ({ ...w }));
  
  // Propagate internal signals
  const MAX_INNER_ITER = Math.max(tmpNodes.length * 3, 30);
  for (let iter = 0; iter < MAX_INNER_ITER; iter++) {
    let changed = false;
    tmpNodes.forEach(n => {
      if (n.type === 'input' || n.type === 'clock' || n.type === 'text-label') return;
      
      const prevOuts = window.getOutputStatesArray(n);
      const prevInputs = [...n.inputValues];
      n.inputValues = Array(n.inputsCount).fill(0);
      
      tmpWires.forEach(w => {
        if (w.toNodeId !== n.id) return;
        const src = tmpNodeMap[w.fromNodeId];
        if (!src) return;
        const val = window.getSourceOutputVal(src, w.fromPortIdx);
        if (w.toPortIdx < n.inputsCount) n.inputValues[w.toPortIdx] = val;
      });
      
      const inputsChanged = n.inputValues.some((v, i) => v !== prevInputs[i]);
      
      window.computeNodeOutput(n); // Recursive evaluation
      
      const newOuts = window.getOutputStatesArray(n);
      const outputsChanged = newOuts.some((v, i) => v !== prevOuts[i]);
      if (outputsChanged || inputsChanged) {
        changed = true;
      }
    });
    if (!changed) break;
  }
  
  // Write outputs
  if (!node.outputStates) node.outputStates = Array(def.outputs).fill(0);
  def.outputPorts.forEach((portId, idx) => {
    const tn = tmpNodeMap[portId];
    if (tn) {
      const val = tn.outputState;
      node.outputStates[idx] = val;
      if (idx === 0) node.outputState = val;
      else if (idx === 1) node.outputState2 = val;
      node[`outputState${idx + 1}`] = val;
    }
  });
}
window.evaluateCustomIC = evaluateCustomIC;

// Helper outputs logic arrays values
window.getOutputStatesArray = function (node) {
  if (node.outputStates) return [...node.outputStates];
  const arr = [node.outputState || 0];
  if (node.outputsCount > 1) {
    arr.push(node.outputState2 || 0);
  }
  for (let i = 2; i < node.outputsCount; i++) {
    arr.push(node[`outputState${i + 1}`] || 0);
  }
  return arr;
};

window.getSourceOutputVal = function (node, portIdx) {
  if (node.outputStates && Array.isArray(node.outputStates)) {
    return node.outputStates[portIdx] || 0;
  }
  if (portIdx === 0) return node.outputState || 0;
  if (portIdx === 1) return node.outputState2 || 0;
  return node[`outputState${portIdx + 1}`] || 0;
};

// ── IC Editor Workspace (Nesting / Hierarchical Design) ─────────────────────
function startEditingICInternalCircuit(icName) {
  if (window.__editingICName) {
    window.showAlert('Already in IC editing mode. Save or cancel first.');
    return;
  }
  
  // Check circular check
  if (hasCircularICDependency(icName, window.sandboxNodes)) {
    window.showAlert('Circular dependency detected. You cannot edit this IC inside itself.', 'Error');
    return;
  }
  
  window.pushUndo();
  
  // Store parent circuit layout
  window.__parentLayout = window.serializeLayout();
  window.__editingICName = icName;
  
  // Clear layout and load IC internal elements
  const def = window.customICs[icName];
  window.importLayout(def);
  
  // Render editor top banner
  renderICEditorBanner(icName);
}
window.startEditingICInternalCircuit = startEditingICInternalCircuit;

function renderICEditorBanner(icName) {
  const oldBanner = document.querySelector('.ic-editor-banner');
  if (oldBanner) oldBanner.remove();
  
  const banner = document.createElement('div');
  banner.className = 'ic-editor-banner';
  banner.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; background: var(--color-indigo);
    color: #fff; display: flex; align-items: center; justify-content: space-between;
    padding: 10px 24px; z-index: 99999; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    font-family: var(--font-body);
  `;
  banner.innerHTML = `
    <div>
      <span style="font-weight: 800; font-family: var(--font-header); color: #22d3a5">IC EDITOR MODE</span> &middot;
      <span style="font-size: 0.9rem">Editing subcircuit for <strong>${icName}</strong>. Exposed switches/LEDs act as pins.</span>
    </div>
    <div style="display: flex; gap: 8px">
      <button onclick="window.saveAndCloseICEditor()" class="btn-primary" style="background: #22d3a5; color: #1e1e24; border: none; padding: 6px 14px; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 0.8rem">Save &amp; Return</button>
      <button onclick="window.cancelICEditor()" class="btn-secondary" style="background: rgba(255,255,255,0.15); color: #fff; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 0.8rem">Cancel</button>
    </div>
  `;
  document.body.appendChild(banner);
}

// Validates dependencies hierarchy to prevent recursion loop crashes
function hasCircularICDependency(icName, nodes) {
  const visited = new Set();
  function check(current) {
    if (current === icName) return true;
    if (visited.has(current)) return false;
    visited.add(current);
    const def = window.customICs[current];
    if (!def) return false;
    for (const n of def.nodes) {
      if (n.type.startsWith('custom-ic-')) {
        const subName = n.type.replace('custom-ic-', '');
        if (check(subName)) return true;
      }
    }
    return false;
  }
  for (const n of nodes) {
    if (n.type.startsWith('custom-ic-')) {
      const subName = n.type.replace('custom-ic-', '');
      if (check(subName)) return true;
    }
  }
  return false;
}

window.saveAndCloseICEditor = function () {
  const icName = window.__editingICName;
  if (!icName) return;
  
  // Verify dependency cycles
  if (hasCircularICDependency(icName, window.sandboxNodes)) {
    window.showAlert('Circular dependency detected! You cannot insert this custom IC inside itself.', 'Error');
    return;
  }
  
  const newLayout = window.serializeLayout();
  
  // Auto-detect ports again based on what inputs/outputs are present in the editor
  const detected = autoDetectICPorts(newLayout.nodes, newLayout.wires);
  
  const def = window.customICs[icName];
  def.nodes = newLayout.nodes;
  def.wires = newLayout.wires;
  def.inputPorts = detected.inputPorts;
  def.outputPorts = detected.outputPorts;
  def.inputs = detected.inputs;
  def.outputs = detected.outputs;
  
  // Re-map pins to match the new inputs/outputs list dynamically
  delete def.pins;
  upgradeICDefinition(def, icName);
  
  // Save definition
  const stored = JSON.parse(localStorage.getItem('logicQuest_ics') || '{}');
  stored[icName] = def;
  localStorage.setItem('logicQuest_ics', JSON.stringify(stored));
  window.customICs[icName] = def;
  
  // Cleanup editor banner and restore parent circuit layout
  const banner = document.querySelector('.ic-editor-banner');
  if (banner) banner.remove();
  window.__editingICName = null;
  
  window.importLayout(window.__parentLayout);
  window.__parentLayout = null;
  
  window.playSound('success');
  window.showToast(`Subcircuit for "${icName}" updated ✓`);
};

window.cancelICEditor = function () {
  const banner = document.querySelector('.ic-editor-banner');
  if (banner) banner.remove();
  window.__editingICName = null;
  
  window.importLayout(window.__parentLayout);
  window.__parentLayout = null;
  
  window.showToast('IC editing cancelled.');
};

// ── IC Library Toolbar / Drag Manager ────────────────────────────────────────
function initICCreator() {
  const toolbox = document.querySelector('.sandbox-toolbox');
  if (!toolbox) return;
  
  // Inject Search Input & Actions into Toolbox
  refreshCustomICLibraryList();
}
window.initICCreator = initICCreator;

function refreshCustomICLibraryList() {
  const stored = JSON.parse(localStorage.getItem('logicQuest_ics') || '{}');
  const toolbox = document.querySelector('.sandbox-toolbox');
  if (!toolbox) return;
  
  let section = toolbox.querySelector('.toolbox-section[data-category="Custom ICs"]');
  if (!section) {
    section = document.createElement('div');
    section.className = 'toolbox-section';
    section.dataset.category = 'Custom ICs';
    
    // Insert before the templates section
    const templatesSec = Array.from(toolbox.querySelectorAll('.toolbox-section')).find(s => s.textContent.includes('Templates'));
    if (templatesSec) {
      toolbox.insertBefore(section, templatesSec);
    } else {
      toolbox.appendChild(section);
    }
  }
  
  // Populate section header with library search input and import/export actions
  section.innerHTML = `
    <div class="toolbox-section-title" style="display: flex; justify-content: space-between; align-items: center;">
      <span>Custom ICs</span>
      <div style="display: flex; gap: 4px;">
        <button id="ic-lib-import-btn" title="Import IC JSON" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px;">📥</button>
        <button id="ic-lib-export-btn" title="Export IC Library" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px;">📤</button>
      </div>
    </div>
    <input type="text" id="ic-lib-search" placeholder="Search Custom ICs..." style="width: 100%; padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); font-size: 0.75rem; margin-bottom: 4px; outline: none;"/>
    <div class="toolbox-items" id="ic-lib-items-list" style="display: flex; flex-direction: column; gap: 4px;"></div>
    <input type="file" id="ic-lib-import-file" accept=".json" style="display: none;"/>
  `;
  
  const searchInput = section.querySelector('#ic-lib-search');
  const container = section.querySelector('#ic-lib-items-list');
  const importFile = section.querySelector('#ic-lib-import-file');
  
  const renderItems = (filterText = '') => {
    container.innerHTML = '';
    const names = Object.keys(stored).filter(name => name.toLowerCase().includes(filterText.toLowerCase()));
    
    // Sort favorites to top, then alphabetical
    names.sort((a, b) => {
      const favA = stored[a].isFavorite ? 1 : 0;
      const favB = stored[b].isFavorite ? 1 : 0;
      if (favA !== favB) return favB - favA;
      return a.localeCompare(b);
    });
    
    if (names.length === 0) {
      container.innerHTML = `<span style="font-size: 0.72rem; color: var(--text-muted); padding: 4px; text-align: center;">No ICs found</span>`;
      return;
    }
    
    names.forEach(name => {
      const def = stored[name];
      const favStar = def.isFavorite ? '★' : '☆';
      
      const item = document.createElement('div');
      item.className = 'toolbox-item custom-ic-toolbox-item';
      item.dataset.type = `custom-ic-${name}`;
      item.style.position = 'relative';
      item.style.paddingRight = '48px'; // spacing for overlay actions
      
      item.innerHTML = `
        <span class="favorite-ic-btn" data-name="${name}" style="cursor: pointer; margin-right: 4px; color: ${def.isFavorite ? '#fbbf24' : 'var(--text-muted)'}">${favStar}</span>
        <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${name}</span>
        <div class="ic-item-actions" style="position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: flex; gap: 4px; opacity: 0.5;">
          <button class="ic-delete-btn" data-name="${name}" title="Delete IC" style="background: none; border: none; color: var(--color-error); cursor: pointer; padding: 2px; font-size: 0.8rem;">🗑️</button>
        </div>
      `;
      
      container.appendChild(item);
      if (typeof window.setupToolboxItem === 'function') window.setupToolboxItem(item);
    });
    
    // Setup action listeners on list items
    container.querySelectorAll('.favorite-ic-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.dataset.name;
        stored[name].isFavorite = !stored[name].isFavorite;
        localStorage.setItem('logicQuest_ics', JSON.stringify(stored));
        window.customICs[name].isFavorite = stored[name].isFavorite;
        window.playSound('click');
        renderItems(searchInput.value);
      });
    });
    
    container.querySelectorAll('.ic-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.dataset.name;
        window.showConfirm(`Delete custom IC "${name}" from library?`, (r) => {
          if (r) {
            delete stored[name];
            localStorage.setItem('logicQuest_ics', JSON.stringify(stored));
            delete window.customICs[name];
            delete window.COMPONENT_DEFS[`custom-ic-${name}`];
            window.playSound('click');
            refreshCustomICLibraryList();
          }
        });
      });
    });
  };
  
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderItems(searchInput.value);
    });
  }
  
  renderItems();
  
  // Library Export
  section.querySelector('#ic-lib-export-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (Object.keys(stored).length === 0) { window.showToast('Custom library is empty.'); return; }
    
    const data = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(stored, null, 2));
    const a = document.createElement('a');
    a.href = data;
    a.download = 'logicquest_ic_library.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.showToast('IC Library exported ✓');
  });
  
  // Library Import
  section.querySelector('#ic-lib-import-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    importFile.click();
  });
  
  importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        Object.keys(imported).forEach(name => {
          const upgraded = upgradeICDefinition(imported[name], name);
          stored[name] = upgraded;
          window.customICs[name] = upgraded;
          window.COMPONENT_DEFS[`custom-ic-${name}`] = {
            inputs: upgraded.inputs,
            outputs: upgraded.outputs,
            label: name,
            category: 'Custom ICs',
            data: { icName: name }
          };
        });
        localStorage.setItem('logicQuest_ics', JSON.stringify(stored));
        refreshCustomICLibraryList();
        window.playSound('success');
        window.showToast('ICs imported into library ✓');
      } catch (err) {
        window.showAlert('Invalid library file.', 'Error');
      }
    };
    reader.readAsText(file);
    importFile.value = '';
  });
}
window.refreshCustomICLibraryList = refreshCustomICLibraryList;
