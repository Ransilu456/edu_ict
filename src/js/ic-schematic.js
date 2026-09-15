import andSvg from '../svg/gates/and.svg?raw';
import orSvg from '../svg/gates/or.svg?raw';
import notSvg from '../svg/gates/not.svg?raw';
import nandSvg from '../svg/gates/nand.svg?raw';
import norSvg from '../svg/gates/nor.svg?raw';
import xorSvg from '../svg/gates/xor.svg?raw';
import xnorSvg from '../svg/gates/xnor.svg?raw';

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
};

export function generateICSchematicSVG(node, icDef) {
  const width = 390;
  const height = 240;
  const type = node.type;

  //  offset = 44px, pitch = 26px 
  const pinY = {
    1: 55, 2: 81, 3: 107, 4: 133, 5: 159, 6: 185, 7: 218,
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
    //  AND, NAND
    const gType = type === 'ic-7400' ? 'nand' : 'and';

    gatesHtml = `
      <!-- Pins 1, 2 -> Pin 3 -->
      <g class="ic-gate-unit" data-gate="1">
        ${renderGate(gType, 25, 47, false, 3)}
      </g>

      <!-- Pins 4, 5 -> Pin 6 -->
      <g class="ic-gate-unit" data-gate="2">
        ${renderGate(gType, 25, 125, false, 6)}
      </g>

      <!-- Pins 13, 12 -> Pin 11  -->
      <g class="ic-gate-unit" data-gate="4">
        ${renderGate(gType, 325, 73, true, 11)}
      </g>

      <!-- Pins 10, 9 -> Pin 8  -->
      <g class="ic-gate-unit" data-gate="3">
        ${renderGate(gType, 325, 151, true, 8)}
      </g>
    `;
  } else if (type === 'ic-7432') {
    // OR
    gatesHtml = `
      <!--  Pins 1, 2 -> Pin 3 -->
      <g class="ic-gate-unit" data-gate="1">
        ${renderGate('or', 25, 47, false, 3)}
      </g>

      <!--  Pins 4, 5 -> Pin 6 -->
      <g class="ic-gate-unit" data-gate="2">
        ${renderGate('or', 25, 125, false, 6)}
      </g>

      <!--  Pins 13, 12 -> Pin 11 -->
      <g class="ic-gate-unit" data-gate="4">
        ${renderGate('or', 325, 73, true, 11)}
      </g>

      <!--  Pins 10, 9 -> Pin 8 -->
      <g class="ic-gate-unit" data-gate="3">
        ${renderGate('or', 325, 151, true, 8)}
      </g>
    `;
  } else if (type === 'ic-7486') {
    //  XOR
    gatesHtml = `
      <!--  Pins 1, 2 -> Pin 3 -->
      <g class="ic-gate-unit" data-gate="1">
        ${renderGate('xor', 25, 47, false, 3)}
      </g>

      <!--  Pins 4, 5 -> Pin 6 -->
      <g class="ic-gate-unit" data-gate="2">
        ${renderGate('xor', 25, 125, false, 6)}
      </g>

      <!--  Pins 13, 12 -> Pin 11 -->
      <g class="ic-gate-unit" data-gate="4">
        ${renderGate('xor', 325, 73, true, 11)}
      </g>

      <!--  Pins 10, 9 -> Pin 8 -->
      <g class="ic-gate-unit" data-gate="3">
        ${renderGate('xor', 325, 151, true, 8)}
      </g>
    `;
  } else if (type === 'ic-7402') {
    // NOR
    gatesHtml = `
      <!--  Pins 2, 3 -> Pin 1 -->
      <g class="ic-gate-unit" data-gate="1">
        ${renderGate('nor', 25, 81, false, 1)}
      </g>

      <!--  Pins 5, 6 -> Pin 4 -->
      <g class="ic-gate-unit" data-gate="2">
        ${renderGate('nor', 25, 159, false, 4)}
      </g>

      <!--  Pins 12, 11 -> Pin 13 -->
      <g class="ic-gate-unit" data-gate="4">
        ${renderGate('nor', 325, 81, true, 13)}
      </g>

      <!--  Pins 9, 8 -> Pin 10 -->
      <g class="ic-gate-unit" data-gate="3">
        ${renderGate('nor', 325, 159, true, 10)}
      </g>
    `;
  } else if (type === 'ic-7404') {
    // NOT
    gatesHtml = `
      <!-- Pin 1 -> Pin 2 -->
      <g class="ic-gate-unit" data-gate="1">
        ${renderGate('not', 22, 45, false, 2)}
      </g>

      <!-- Pin 3 -> Pin 4 -->
      <g class="ic-gate-unit" data-gate="2">
        ${renderGate('not', 22, 97, false, 4)}
      </g>

      <!-- Pin 5 -> Pin 6 -->
      <g class="ic-gate-unit" data-gate="3">
        ${renderGate('not', 22, 150, false, 6)}
      </g>

      <!-- Pin 13 -> Pin 12 -->
      <g class="ic-gate-unit" data-gate="6">
        ${renderGate('not', 328, 72, true, 12)}
      </g>

      <!-- Pin 11 -> Pin 10 -->
      <g class="ic-gate-unit" data-gate="5">
        ${renderGate('not', 328, 124, true, 10)}
      </g>

      <!-- Pin 9 -> Pin 8 -->
      <g class="ic-gate-unit" data-gate="4">
        ${renderGate('not', 328, 176, true, 8)}
      </g>
  `;
  }

  // Pin 7 GND and Pin 14 VCC 
  const powerRailsHtml = `
  <!-- GND -->
    <path d="M ${leftPinX} ${pinY[7]} L 95 ${pinY[7]}" fill="none" stroke="#64748b" stroke-width="1.8"/>
    <path d="M 95 ${pinY[7] - 6} L 95 ${pinY[7] + 6}" fill="none" stroke="#64748b" stroke-width="1.8"/>
    <path d="M 99 ${pinY[7] - 4} L 99 ${pinY[7] + 4}" fill="none" stroke="#64748b" stroke-width="1.5"/>
    <path d="M 103 ${pinY[7] - 2} L 103 ${pinY[7] + 2}" fill="none" stroke="#64748b" stroke-width="1.2"/>

  <!-- VCC -->
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
