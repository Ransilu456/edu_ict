// IC Schematic SVG generator with modular SVG gate symbols and precise pin alignment
import andSvg from '../svg/gates/and.svg?raw';
import orSvg from '../svg/gates/or.svg?raw';
import notSvg from '../svg/gates/not.svg?raw';
import nandSvg from '../svg/gates/nand.svg?raw';
import norSvg from '../svg/gates/nor.svg?raw';
import xorSvg from '../svg/gates/xor.svg?raw';
import xnorSvg from '../svg/gates/xnor.svg?raw';
import bufferSvg from '../svg/gates/buffer.svg?raw';

function extractSvgInner(svgRaw) {
  const match = svgRaw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  return match ? match[1] : svgRaw;
}

const GATE_TEMPLATES = {
  'and': extractSvgInner(andSvg),
  'or': extractSvgInner(orSvg),
  'not': extractSvgInner(notSvg),
  'nand': extractSvgInner(nandSvg),
  'nor': extractSvgInner(norSvg),
  'xor': extractSvgInner(xorSvg),
  'xnor': extractSvgInner(xnorSvg),
  'buffer': extractSvgInner(bufferSvg)
};

export function generateICSchematicSVG(node, icDef) {
  const width = 390;
  const height = 240;
  const type = node.type;

  // Pin Y centers aligned with .real-ic-pin-row layout:
  // Body offset = 44px, pitch = 26px (21px height + 5px gap)
  const pinY = {
    1: 55,  2: 81,  3: 107, 4: 133, 5: 159, 6: 185, 7: 211,
    14: 55, 13: 81, 12: 107, 11: 133, 10: 159, 9: 185, 8: 211
  };

  const leftPinX = 64;
  const rightPinX = 326;

  const pinVals = node.pinValues || {};
  const getVal = (pin) => (pinVals[pin] !== undefined ? pinVals[pin] : 0);
  const color = (pin) => (getVal(pin) ? '#00ff66' : '#475569');
  const glow = (pin) => (getVal(pin) ? 'filter: drop-shadow(0 0 3px rgba(0, 255, 102, 0.8));' : '');

  function renderGate(gateType, x, y, flipX, activePin) {
    const isAct = getVal(activePin) === 1;
    const gateColor = isAct ? '#00ff66' : '#64748b';
    const gateFill = isAct ? 'rgba(0, 255, 102, 0.12)' : 'rgba(56, 189, 248, 0.05)';
    const inner = GATE_TEMPLATES[gateType] || GATE_TEMPLATES['and'];
    const transform = flipX 
      ? `translate(${x + 40}, ${y}) scale(-1, 1)` 
      : `translate(${x}, ${y})`;
    return `
      <g transform="${transform}" class="ic-gate-symbol" style="color:${gateColor}; --gate-fill:${gateFill}; ${isAct ? 'filter: drop-shadow(0 0 4px rgba(0,255,102,0.6));' : ''}">
        ${inner}
      </g>
    `;
  }

  let gatesHtml = '';

  if (type === 'ic-7408' || type === 'ic-7400') {
    // 7408 Quad AND / 7400 Quad NAND
    const gType = type === 'ic-7400' ? 'nand' : 'and';

    gatesHtml = `
      <!-- Gate 1: Pins 1, 2 -> Pin 3 (Left) -->
      <g class="ic-gate-unit" data-gate="1">
        <path d="M ${leftPinX} ${pinY[1]} L 125 ${pinY[1]}" fill="none" stroke="${color(1)}" stroke-width="1.8" style="${glow(1)}"/>
        <path d="M ${leftPinX} ${pinY[2]} L 105 ${pinY[2]} L 105 71 L 125 71" fill="none" stroke="${color(2)}" stroke-width="1.8" style="${glow(2)}"/>
        ${renderGate(gType, 25, 47, false, 3)}
        <path d="M 165 63 L 180 63 L 180 ${pinY[3]} L ${leftPinX} ${pinY[3]}" fill="none" stroke="${color(3)}" stroke-width="1.8" style="${glow(3)}"/>
      </g>

      <!-- Gate 2: Pins 4, 5 -> Pin 6 (Left) -->
      <g class="ic-gate-unit" data-gate="2">
        <path d="M ${leftPinX} ${pinY[4]} L 125 ${pinY[4]}" fill="none" stroke="${color(4)}" stroke-width="1.8" style="${glow(4)}"/>
        <path d="M ${leftPinX} ${pinY[5]} L 105 ${pinY[5]} L 105 149 L 125 149" fill="none" stroke="${color(5)}" stroke-width="1.8" style="${glow(5)}"/>
        ${renderGate(gType, 25, 125, false, 6)}
        <path d="M 165 141 L 180 141 L 180 ${pinY[6]} L ${leftPinX} ${pinY[6]}" fill="none" stroke="${color(6)}" stroke-width="1.8" style="${glow(6)}"/>
      </g>

      <!-- Gate 4: Pins 13, 12 -> Pin 11 (Right) -->
      <g class="ic-gate-unit" data-gate="4">
        <path d="M ${rightPinX} ${pinY[13]} L 265 ${pinY[13]}" fill="none" stroke="${color(13)}" stroke-width="1.8" style="${glow(13)}"/>
        <path d="M ${rightPinX} ${pinY[12]} L 285 ${pinY[12]} L 285 97 L 265 97" fill="none" stroke="${color(12)}" stroke-width="1.8" style="${glow(12)}"/>
        ${renderGate(gType, 325, 73, true, 11)}
        <path d="M 225 89 L 210 89 L 210 ${pinY[11]} L ${rightPinX} ${pinY[11]}" fill="none" stroke="${color(11)}" stroke-width="1.8" style="${glow(11)}"/>
      </g>

      <!-- Gate 3: Pins 10, 9 -> Pin 8 (Right) -->
      <g class="ic-gate-unit" data-gate="3">
        <path d="M ${rightPinX} ${pinY[10]} L 265 ${pinY[10]}" fill="none" stroke="${color(10)}" stroke-width="1.8" style="${glow(10)}"/>
        <path d="M ${rightPinX} ${pinY[9]} L 285 ${pinY[9]} L 285 175 L 265 175" fill="none" stroke="${color(9)}" stroke-width="1.8" style="${glow(9)}"/>
        ${renderGate(gType, 325, 151, true, 8)}
        <path d="M 225 167 L 210 167 L 210 ${pinY[8]} L ${rightPinX} ${pinY[8]}" fill="none" stroke="${color(8)}" stroke-width="1.8" style="${glow(8)}"/>
      </g>
    `;
  } else if (type === 'ic-7432') {
    // 7432 Quad OR
    gatesHtml = `
      <!-- Gate 1: Pins 1, 2 -> Pin 3 -->
      <g class="ic-gate-unit" data-gate="1">
        <path d="M ${leftPinX} ${pinY[1]} L 125 ${pinY[1]}" fill="none" stroke="${color(1)}" stroke-width="1.8" style="${glow(1)}"/>
        <path d="M ${leftPinX} ${pinY[2]} L 105 ${pinY[2]} L 105 71 L 125 71" fill="none" stroke="${color(2)}" stroke-width="1.8" style="${glow(2)}"/>
        ${renderGate('or', 125, 47, false, 3)}
        <path d="M 165 63 L 180 63 L 180 ${pinY[3]} L ${leftPinX} ${pinY[3]}" fill="none" stroke="${color(3)}" stroke-width="1.8" style="${glow(3)}"/>
      </g>

      <!-- Gate 2: Pins 4, 5 -> Pin 6 -->
      <g class="ic-gate-unit" data-gate="2">
        <path d="M ${leftPinX} ${pinY[4]} L 125 ${pinY[4]}" fill="none" stroke="${color(4)}" stroke-width="1.8" style="${glow(4)}"/>
        <path d="M ${leftPinX} ${pinY[5]} L 105 ${pinY[5]} L 105 149 L 125 149" fill="none" stroke="${color(5)}" stroke-width="1.8" style="${glow(5)}"/>
        ${renderGate('or', 125, 125, false, 6)}
        <path d="M 165 141 L 180 141 L 180 ${pinY[6]} L ${leftPinX} ${pinY[6]}" fill="none" stroke="${color(6)}" stroke-width="1.8" style="${glow(6)}"/>
      </g>

      <!-- Gate 4: Pins 13, 12 -> Pin 11 -->
      <g class="ic-gate-unit" data-gate="4">
        <path d="M ${rightPinX} ${pinY[13]} L 265 ${pinY[13]}" fill="none" stroke="${color(13)}" stroke-width="1.8" style="${glow(13)}"/>
        <path d="M ${rightPinX} ${pinY[12]} L 285 ${pinY[12]} L 285 97 L 265 97" fill="none" stroke="${color(12)}" stroke-width="1.8" style="${glow(12)}"/>
        ${renderGate('or', 225, 73, true, 11)}
        <path d="M 225 89 L 210 89 L 210 ${pinY[11]} L ${rightPinX} ${pinY[11]}" fill="none" stroke="${color(11)}" stroke-width="1.8" style="${glow(11)}"/>
      </g>

      <!-- Gate 3: Pins 10, 9 -> Pin 8 -->
      <g class="ic-gate-unit" data-gate="3">
        <path d="M ${rightPinX} ${pinY[10]} L 265 ${pinY[10]}" fill="none" stroke="${color(10)}" stroke-width="1.8" style="${glow(10)}"/>
        <path d="M ${rightPinX} ${pinY[9]} L 285 ${pinY[9]} L 285 175 L 265 175" fill="none" stroke="${color(9)}" stroke-width="1.8" style="${glow(9)}"/>
        ${renderGate('or', 225, 151, true, 8)}
        <path d="M 225 167 L 210 167 L 210 ${pinY[8]} L ${rightPinX} ${pinY[8]}" fill="none" stroke="${color(8)}" stroke-width="1.8" style="${glow(8)}"/>
      </g>
    `;
  } else if (type === 'ic-7486') {
    // 7486 Quad XOR
    gatesHtml = `
      <!-- Gate 1: Pins 1, 2 -> Pin 3 -->
      <g class="ic-gate-unit" data-gate="1">
        <path d="M ${leftPinX} ${pinY[1]} L 125 ${pinY[1]}" fill="none" stroke="${color(1)}" stroke-width="1.8" style="${glow(1)}"/>
        <path d="M ${leftPinX} ${pinY[2]} L 105 ${pinY[2]} L 105 71 L 125 71" fill="none" stroke="${color(2)}" stroke-width="1.8" style="${glow(2)}"/>
        ${renderGate('xor', 125, 47, false, 3)}
        <path d="M 165 63 L 180 63 L 180 ${pinY[3]} L ${leftPinX} ${pinY[3]}" fill="none" stroke="${color(3)}" stroke-width="1.8" style="${glow(3)}"/>
      </g>

      <!-- Gate 2: Pins 4, 5 -> Pin 6 -->
      <g class="ic-gate-unit" data-gate="2">
        <path d="M ${leftPinX} ${pinY[4]} L 125 ${pinY[4]}" fill="none" stroke="${color(4)}" stroke-width="1.8" style="${glow(4)}"/>
        <path d="M ${leftPinX} ${pinY[5]} L 105 ${pinY[5]} L 105 149 L 125 149" fill="none" stroke="${color(5)}" stroke-width="1.8" style="${glow(5)}"/>
        ${renderGate('xor', 125, 125, false, 6)}
        <path d="M 165 141 L 180 141 L 180 ${pinY[6]} L ${leftPinX} ${pinY[6]}" fill="none" stroke="${color(6)}" stroke-width="1.8" style="${glow(6)}"/>
      </g>

      <!-- Gate 4: Pins 13, 12 -> Pin 11 -->
      <g class="ic-gate-unit" data-gate="4">
        <path d="M ${rightPinX} ${pinY[13]} L 265 ${pinY[13]}" fill="none" stroke="${color(13)}" stroke-width="1.8" style="${glow(13)}"/>
        <path d="M ${rightPinX} ${pinY[12]} L 285 ${pinY[12]} L 285 97 L 265 97" fill="none" stroke="${color(12)}" stroke-width="1.8" style="${glow(12)}"/>
        ${renderGate('xor', 225, 73, true, 11)}
        <path d="M 225 89 L 210 89 L 210 ${pinY[11]} L ${rightPinX} ${pinY[11]}" fill="none" stroke="${color(11)}" stroke-width="1.8" style="${glow(11)}"/>
      </g>

      <!-- Gate 3: Pins 10, 9 -> Pin 8 -->
      <g class="ic-gate-unit" data-gate="3">
        <path d="M ${rightPinX} ${pinY[10]} L 265 ${pinY[10]}" fill="none" stroke="${color(10)}" stroke-width="1.8" style="${glow(10)}"/>
        <path d="M ${rightPinX} ${pinY[9]} L 285 ${pinY[9]} L 285 175 L 265 175" fill="none" stroke="${color(9)}" stroke-width="1.8" style="${glow(9)}"/>
        ${renderGate('xor', 225, 151, true, 8)}
        <path d="M 225 167 L 210 167 L 210 ${pinY[8]} L ${rightPinX} ${pinY[8]}" fill="none" stroke="${color(8)}" stroke-width="1.8" style="${glow(8)}"/>
      </g>
    `;
  } else if (type === 'ic-7402') {
    // 7402 Quad NOR (Outputs on Pins 1, 4, 10, 13)
    gatesHtml = `
      <!-- Gate 1: Pins 2, 3 -> Pin 1 -->
      <g class="ic-gate-unit" data-gate="1">
        <path d="M ${leftPinX} ${pinY[2]} L 105 ${pinY[2]} L 105 89 L 125 89" fill="none" stroke="${color(2)}" stroke-width="1.8" style="${glow(2)}"/>
        <path d="M ${leftPinX} ${pinY[3]} L 125 ${pinY[3]}" fill="none" stroke="${color(3)}" stroke-width="1.8" style="${glow(3)}"/>
        ${renderGate('nor', 125, 81, false, 1)}
        <path d="M 165 97 L 180 97 L 180 ${pinY[1]} L ${leftPinX} ${pinY[1]}" fill="none" stroke="${color(1)}" stroke-width="1.8" style="${glow(1)}"/>
      </g>

      <!-- Gate 2: Pins 5, 6 -> Pin 4 -->
      <g class="ic-gate-unit" data-gate="2">
        <path d="M ${leftPinX} ${pinY[5]} L 105 ${pinY[5]} L 105 167 L 125 167" fill="none" stroke="${color(5)}" stroke-width="1.8" style="${glow(5)}"/>
        <path d="M ${leftPinX} ${pinY[6]} L 125 ${pinY[6]}" fill="none" stroke="${color(6)}" stroke-width="1.8" style="${glow(6)}"/>
        ${renderGate('nor', 125, 159, false, 4)}
        <path d="M 165 175 L 180 175 L 180 ${pinY[4]} L ${leftPinX} ${pinY[4]}" fill="none" stroke="${color(4)}" stroke-width="1.8" style="${glow(4)}"/>
      </g>

      <!-- Gate 4: Pins 12, 11 -> Pin 13 -->
      <g class="ic-gate-unit" data-gate="4">
        <path d="M ${rightPinX} ${pinY[12]} L 285 ${pinY[12]} L 285 89 L 265 89" fill="none" stroke="${color(12)}" stroke-width="1.8" style="${glow(12)}"/>
        <path d="M ${rightPinX} ${pinY[11]} L 265 ${pinY[11]}" fill="none" stroke="${color(11)}" stroke-width="1.8" style="${glow(11)}"/>
        ${renderGate('nor', 225, 81, true, 13)}
        <path d="M 225 97 L 210 97 L 210 ${pinY[13]} L ${rightPinX} ${pinY[13]}" fill="none" stroke="${color(13)}" stroke-width="1.8" style="${glow(13)}"/>
      </g>

      <!-- Gate 3: Pins 9, 8 -> Pin 10 -->
      <g class="ic-gate-unit" data-gate="3">
        <path d="M ${rightPinX} ${pinY[9]} L 285 ${pinY[9]} L 285 167 L 265 167" fill="none" stroke="${color(9)}" stroke-width="1.8" style="${glow(9)}"/>
        <path d="M ${rightPinX} ${pinY[8]} L 265 ${pinY[8]}" fill="none" stroke="${color(8)}" stroke-width="1.8" style="${glow(8)}"/>
        ${renderGate('nor', 225, 159, true, 10)}
        <path d="M 225 175 L 210 175 L 210 ${pinY[10]} L ${rightPinX} ${pinY[10]}" fill="none" stroke="${color(10)}" stroke-width="1.8" style="${glow(10)}"/>
      </g>
    `;
  } else if (type === 'ic-7404') {
    // 7404 Hex Inverter (6 NOT gates)
    gatesHtml = `
      <!-- NOT 1: Pin 1 -> Pin 2 -->
      <g class="ic-gate-unit" data-gate="1">
        <path d="M ${leftPinX} ${pinY[1]} L 125 ${pinY[1]}" fill="none" stroke="${color(1)}" stroke-width="1.8" style="${glow(1)}"/>
        ${renderGate('not', 125, 39, false, 2)}
        <path d="M 165 55 L 180 55 L 180 ${pinY[2]} L ${leftPinX} ${pinY[2]}" fill="none" stroke="${color(2)}" stroke-width="1.8" style="${glow(2)}"/>
      </g>

      <!-- NOT 2: Pin 3 -> Pin 4 -->
      <g class="ic-gate-unit" data-gate="2">
        <path d="M ${leftPinX} ${pinY[3]} L 125 ${pinY[3]}" fill="none" stroke="${color(3)}" stroke-width="1.8" style="${glow(3)}"/>
        ${renderGate('not', 125, 91, false, 4)}
        <path d="M 165 107 L 180 107 L 180 ${pinY[4]} L ${leftPinX} ${pinY[4]}" fill="none" stroke="${color(4)}" stroke-width="1.8" style="${glow(4)}"/>
      </g>

      <!-- NOT 3: Pin 5 -> Pin 6 -->
      <g class="ic-gate-unit" data-gate="3">
        <path d="M ${leftPinX} ${pinY[5]} L 125 ${pinY[5]}" fill="none" stroke="${color(5)}" stroke-width="1.8" style="${glow(5)}"/>
        ${renderGate('not', 125, 143, false, 6)}
        <path d="M 165 159 L 180 159 L 180 ${pinY[6]} L ${leftPinX} ${pinY[6]}" fill="none" stroke="${color(6)}" stroke-width="1.8" style="${glow(6)}"/>
      </g>

      <!-- NOT 6: Pin 13 -> Pin 12 -->
      <g class="ic-gate-unit" data-gate="6">
        <path d="M ${rightPinX} ${pinY[13]} L 265 ${pinY[13]}" fill="none" stroke="${color(13)}" stroke-width="1.8" style="${glow(13)}"/>
        ${renderGate('not', 225, 65, true, 12)}
        <path d="M 225 81 L 210 81 L 210 ${pinY[12]} L ${rightPinX} ${pinY[12]}" fill="none" stroke="${color(12)}" stroke-width="1.8" style="${glow(12)}"/>
      </g>

      <!-- NOT 5: Pin 11 -> Pin 10 -->
      <g class="ic-gate-unit" data-gate="5">
        <path d="M ${rightPinX} ${pinY[11]} L 265 ${pinY[11]}" fill="none" stroke="${color(11)}" stroke-width="1.8" style="${glow(11)}"/>
        ${renderGate('not', 225, 117, true, 10)}
        <path d="M 225 133 L 210 133 L 210 ${pinY[10]} L ${rightPinX} ${pinY[10]}" fill="none" stroke="${color(10)}" stroke-width="1.8" style="${glow(10)}"/>
      </g>

      <!-- NOT 4: Pin 9 -> Pin 8 -->
      <g class="ic-gate-unit" data-gate="4">
        <path d="M ${rightPinX} ${pinY[9]} L 265 ${pinY[9]}" fill="none" stroke="${color(9)}" stroke-width="1.8" style="${glow(9)}"/>
        ${renderGate('not', 225, 169, true, 8)}
        <path d="M 225 185 L 210 185 L 210 ${pinY[8]} L ${rightPinX} ${pinY[8]}" fill="none" stroke="${color(8)}" stroke-width="1.8" style="${glow(8)}"/>
      </g>
    `;
  }

  // Pin 7 GND and Pin 14 VCC power rails
  const powerRailsHtml = `
    <!-- Pin 7 GND Rail (Clean schematic ground symbol, no clashing text) -->
    <path d="M ${leftPinX} ${pinY[7]} L 95 ${pinY[7]}" fill="none" stroke="#64748b" stroke-width="1.8"/>
    <path d="M 95 ${pinY[7] - 6} L 95 ${pinY[7] + 6}" fill="none" stroke="#64748b" stroke-width="1.8"/>
    <path d="M 99 ${pinY[7] - 4} L 99 ${pinY[7] + 4}" fill="none" stroke="#64748b" stroke-width="1.5"/>
    <path d="M 103 ${pinY[7] - 2} L 103 ${pinY[7] + 2}" fill="none" stroke="#64748b" stroke-width="1.2"/>
    
    <!-- Pin 14 VCC Rail (Clean terminal dot) -->
    <path d="M ${rightPinX} ${pinY[14]} L 295 ${pinY[14]}" fill="none" stroke="#ef4444" stroke-width="1.8"/>
    <circle cx="295" cy="${pinY[14]}" r="3" fill="#ef4444"/>
  `;

  return `
    <svg class="real-ic-schematic-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1">
      ${powerRailsHtml}
      ${gatesHtml}
    </svg>
  `;
}
