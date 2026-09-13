// IC Schematic Generator for ANSI Mode
// Renders authentic gate-level internal schematic inside DIP-14 packages

export function generateICSchematicSVG(node, icDef) {
  const width = 160;
  const height = 230;
  const type = node.type;

  // Pin Y coordinates aligned with DIP-14 pin rows (7 on left: pins 1..7; 7 on right: pins 14..8)
  const pinY = {
    1: 22, 2: 52, 3: 82, 4: 112, 5: 142, 6: 172, 7: 202,
    14: 22, 13: 52, 12: 82, 11: 112, 10: 142, 9: 172, 8: 202
  };

  const pinVals = node.pinValues || {};
  const getVal = (pin) => (pinVals[pin] !== undefined ? pinVals[pin] : 0);
  const color = (pin) => (getVal(pin) ? '#00ff66' : '#64748b');

  let gatesHtml = '';

  if (type === 'ic-7408' || type === 'ic-7400') {
    // 7408 Quad AND / 7400 Quad NAND
    const isNand = type === 'ic-7400';
    const bubble = isNand ? '<circle cx="68" cy="40" r="3" fill="#05080c" stroke="var(--gate-c, #64748b)" stroke-width="1.5"/>' : '';
    const bubbleR = isNand ? '<circle cx="92" cy="40" r="3" fill="#05080c" stroke="var(--gate-c, #64748b)" stroke-width="1.5"/>' : '';

    gatesHtml = `
      <!-- Gate 1: Pins 1,2 -> 3 -->
      <g class="ic-gate-group" style="--gate-c:${color(3)}">
        <path d="M 12 ${pinY[1]} L 32 ${pinY[1]} L 32 30 L 40 30" fill="none" stroke="${color(1)}" stroke-width="1.8"/>
        <path d="M 12 ${pinY[2]} L 32 ${pinY[2]} L 32 50 L 40 50" fill="none" stroke="${color(2)}" stroke-width="1.8"/>
        <path d="M 40 24 L 54 24 A 16 16 0 0 1 54 56 L 40 56 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        ${isNand ? '<circle cx="73" cy="40" r="3" fill="#05080c" stroke="var(--gate-c)" stroke-width="1.5"/>' : ''}
        <path d="M ${isNand ? 76 : 70} 40 L 80 40 L 80 ${pinY[3]} L 12 ${pinY[3]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- Gate 2: Pins 4,5 -> 6 -->
      <g class="ic-gate-group" style="--gate-c:${color(6)}">
        <path d="M 12 ${pinY[4]} L 32 ${pinY[4]} L 32 120 L 40 120" fill="none" stroke="${color(4)}" stroke-width="1.8"/>
        <path d="M 12 ${pinY[5]} L 32 ${pinY[5]} L 32 140 L 40 140" fill="none" stroke="${color(5)}" stroke-width="1.8"/>
        <path d="M 40 114 L 54 114 A 16 16 0 0 1 54 146 L 40 146 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        ${isNand ? '<circle cx="73" cy="130" r="3" fill="#05080c" stroke="var(--gate-c)" stroke-width="1.5"/>' : ''}
        <path d="M ${isNand ? 76 : 70} 130 L 80 130 L 80 ${pinY[6]} L 12 ${pinY[6]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- Gate 4: Pins 13,12 -> 11 -->
      <g class="ic-gate-group" style="--gate-c:${color(11)}">
        <path d="M 148 ${pinY[13]} L 128 ${pinY[13]} L 128 30 L 120 30" fill="none" stroke="${color(13)}" stroke-width="1.8"/>
        <path d="M 148 ${pinY[12]} L 128 ${pinY[12]} L 128 50 L 120 50" fill="none" stroke="${color(12)}" stroke-width="1.8"/>
        <path d="M 120 24 L 106 24 A 16 16 0 0 0 106 56 L 120 56 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        ${isNand ? '<circle cx="87" cy="40" r="3" fill="#05080c" stroke="var(--gate-c)" stroke-width="1.5"/>' : ''}
        <path d="M ${isNand ? 84 : 90} 40 L 80 40 L 80 ${pinY[11]} L 148 ${pinY[11]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- Gate 3: Pins 10,9 -> 8 -->
      <g class="ic-gate-group" style="--gate-c:${color(8)}">
        <path d="M 148 ${pinY[10]} L 128 ${pinY[10]} L 128 120 L 120 120" fill="none" stroke="${color(10)}" stroke-width="1.8"/>
        <path d="M 148 ${pinY[9]} L 128 ${pinY[9]} L 128 140 L 120 140" fill="none" stroke="${color(9)}" stroke-width="1.8"/>
        <path d="M 120 114 L 106 114 A 16 16 0 0 0 106 146 L 120 146 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        ${isNand ? '<circle cx="87" cy="130" r="3" fill="#05080c" stroke="var(--gate-c)" stroke-width="1.5"/>' : ''}
        <path d="M ${isNand ? 84 : 90} 130 L 80 130 L 80 ${pinY[8]} L 148 ${pinY[8]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>
    `;
  } else if (type === 'ic-7432') {
    // 7432 Quad OR Gate
    gatesHtml = `
      <!-- Gate 1: 1,2 -> 3 -->
      <g class="ic-gate-group" style="--gate-c:${color(3)}">
        <path d="M 12 ${pinY[1]} L 30 ${pinY[1]} L 30 30 L 38 30" fill="none" stroke="${color(1)}" stroke-width="1.8"/>
        <path d="M 12 ${pinY[2]} L 30 ${pinY[2]} L 30 50 L 38 50" fill="none" stroke="${color(2)}" stroke-width="1.8"/>
        <path d="M 36 24 Q 44 40 36 56 Q 52 54 68 40 Q 52 26 36 24 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <path d="M 68 40 L 78 40 L 78 ${pinY[3]} L 12 ${pinY[3]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- Gate 2: 4,5 -> 6 -->
      <g class="ic-gate-group" style="--gate-c:${color(6)}">
        <path d="M 12 ${pinY[4]} L 30 ${pinY[4]} L 30 120 L 38 120" fill="none" stroke="${color(4)}" stroke-width="1.8"/>
        <path d="M 12 ${pinY[5]} L 30 ${pinY[5]} L 30 140 L 38 140" fill="none" stroke="${color(5)}" stroke-width="1.8"/>
        <path d="M 36 114 Q 44 130 36 146 Q 52 144 68 130 Q 52 116 36 114 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <path d="M 68 130 L 78 130 L 78 ${pinY[6]} L 12 ${pinY[6]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- Gate 4: 13,12 -> 11 -->
      <g class="ic-gate-group" style="--gate-c:${color(11)}">
        <path d="M 148 ${pinY[13]} L 130 ${pinY[13]} L 130 30 L 122 30" fill="none" stroke="${color(13)}" stroke-width="1.8"/>
        <path d="M 148 ${pinY[12]} L 130 ${pinY[12]} L 130 50 L 122 50" fill="none" stroke="${color(12)}" stroke-width="1.8"/>
        <path d="M 124 24 Q 116 40 124 56 Q 108 54 92 40 Q 108 26 124 24 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <path d="M 92 40 L 82 40 L 82 ${pinY[11]} L 148 ${pinY[11]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- Gate 3: 10,9 -> 8 -->
      <g class="ic-gate-group" style="--gate-c:${color(8)}">
        <path d="M 148 ${pinY[10]} L 130 ${pinY[10]} L 130 120 L 122 120" fill="none" stroke="${color(10)}" stroke-width="1.8"/>
        <path d="M 148 ${pinY[9]} L 130 ${pinY[9]} L 130 140 L 122 140" fill="none" stroke="${color(9)}" stroke-width="1.8"/>
        <path d="M 124 114 Q 116 130 124 146 Q 108 144 92 130 Q 108 116 124 114 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <path d="M 92 130 L 82 130 L 82 ${pinY[8]} L 148 ${pinY[8]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>
    `;
  } else if (type === 'ic-7404') {
    // 7404 Hex Inverter (NOT)
    gatesHtml = `
      <!-- NOT 1: 1 -> 2 -->
      <g style="--gate-c:${color(2)}">
        <path d="M 12 ${pinY[1]} L 40 ${pinY[1]} L 40 30" fill="none" stroke="${color(1)}" stroke-width="1.8"/>
        <polygon points="30,30 50,30 40,48" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <circle cx="40" cy="51" r="2.5" fill="#05080c" stroke="var(--gate-c)" stroke-width="1.5"/>
        <path d="M 40 54 L 40 ${pinY[2]} L 12 ${pinY[2]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- NOT 2: 3 -> 4 -->
      <g style="--gate-c:${color(4)}">
        <path d="M 12 ${pinY[3]} L 40 ${pinY[3]} L 40 90" fill="none" stroke="${color(3)}" stroke-width="1.8"/>
        <polygon points="30,90 50,90 40,108" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <circle cx="40" cy="111" r="2.5" fill="#05080c" stroke="var(--gate-c)" stroke-width="1.5"/>
        <path d="M 40 114 L 40 ${pinY[4]} L 12 ${pinY[4]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- NOT 3: 5 -> 6 -->
      <g style="--gate-c:${color(6)}">
        <path d="M 12 ${pinY[5]} L 40 ${pinY[5]} L 40 150" fill="none" stroke="${color(5)}" stroke-width="1.8"/>
        <polygon points="30,150 50,150 40,168" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <circle cx="40" cy="171" r="2.5" fill="#05080c" stroke="var(--gate-c)" stroke-width="1.5"/>
        <path d="M 40 174 L 40 ${pinY[6]} L 12 ${pinY[6]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- NOT 6: 13 -> 12 -->
      <g style="--gate-c:${color(12)}">
        <path d="M 148 ${pinY[13]} L 120 ${pinY[13]} L 120 30" fill="none" stroke="${color(13)}" stroke-width="1.8"/>
        <polygon points="110,30 130,30 120,48" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <circle cx="120" cy="51" r="2.5" fill="#05080c" stroke="var(--gate-c)" stroke-width="1.5"/>
        <path d="M 120 54 L 120 ${pinY[12]} L 148 ${pinY[12]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- NOT 5: 11 -> 10 -->
      <g style="--gate-c:${color(10)}">
        <path d="M 148 ${pinY[11]} L 120 ${pinY[11]} L 120 90" fill="none" stroke="${color(11)}" stroke-width="1.8"/>
        <polygon points="110,90 130,90 120,108" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <circle cx="120" cy="111" r="2.5" fill="#05080c" stroke="var(--gate-c)" stroke-width="1.5"/>
        <path d="M 120 114 L 120 ${pinY[10]} L 148 ${pinY[10]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- NOT 4: 9 -> 8 -->
      <g style="--gate-c:${color(8)}">
        <path d="M 148 ${pinY[9]} L 120 ${pinY[9]} L 120 150" fill="none" stroke="${color(9)}" stroke-width="1.8"/>
        <polygon points="110,150 130,150 120,168" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <circle cx="120" cy="171" r="2.5" fill="#05080c" stroke="var(--gate-c)" stroke-width="1.5"/>
        <path d="M 120 174 L 120 ${pinY[8]} L 148 ${pinY[8]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>
    `;
  } else if (type === 'ic-7486') {
    // 7486 Quad XOR Gate
    gatesHtml = `
      <!-- Gate 1: 1,2 -> 3 -->
      <g class="ic-gate-group" style="--gate-c:${color(3)}">
        <path d="M 12 ${pinY[1]} L 30 ${pinY[1]} L 30 30 L 40 30" fill="none" stroke="${color(1)}" stroke-width="1.8"/>
        <path d="M 12 ${pinY[2]} L 30 ${pinY[2]} L 30 50 L 40 50" fill="none" stroke="${color(2)}" stroke-width="1.8"/>
        <path d="M 33 24 Q 41 40 33 56" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
        <path d="M 38 24 Q 46 40 38 56 Q 54 54 70 40 Q 54 26 38 24 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <path d="M 70 40 L 80 40 L 80 ${pinY[3]} L 12 ${pinY[3]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- Gate 2: 4,5 -> 6 -->
      <g class="ic-gate-group" style="--gate-c:${color(6)}">
        <path d="M 12 ${pinY[4]} L 30 ${pinY[4]} L 30 120 L 40 120" fill="none" stroke="${color(4)}" stroke-width="1.8"/>
        <path d="M 12 ${pinY[5]} L 30 ${pinY[5]} L 30 140 L 40 140" fill="none" stroke="${color(5)}" stroke-width="1.8"/>
        <path d="M 33 114 Q 41 130 33 146" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
        <path d="M 38 114 Q 46 130 38 146 Q 54 144 70 130 Q 54 116 38 114 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <path d="M 70 130 L 80 130 L 80 ${pinY[6]} L 12 ${pinY[6]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- Gate 4: 13,12 -> 11 -->
      <g class="ic-gate-group" style="--gate-c:${color(11)}">
        <path d="M 148 ${pinY[13]} L 130 ${pinY[13]} L 130 30 L 120 30" fill="none" stroke="${color(13)}" stroke-width="1.8"/>
        <path d="M 148 ${pinY[12]} L 130 ${pinY[12]} L 130 50 L 120 50" fill="none" stroke="${color(12)}" stroke-width="1.8"/>
        <path d="M 127 24 Q 119 40 127 56" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
        <path d="M 122 24 Q 114 40 122 56 Q 106 54 90 40 Q 106 26 122 24 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <path d="M 90 40 L 80 40 L 80 ${pinY[11]} L 148 ${pinY[11]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- Gate 3: 10,9 -> 8 -->
      <g class="ic-gate-group" style="--gate-c:${color(8)}">
        <path d="M 148 ${pinY[10]} L 130 ${pinY[10]} L 130 120 L 120 120" fill="none" stroke="${color(10)}" stroke-width="1.8"/>
        <path d="M 148 ${pinY[9]} L 130 ${pinY[9]} L 130 140 L 120 140" fill="none" stroke="${color(9)}" stroke-width="1.8"/>
        <path d="M 127 114 Q 119 130 127 146" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
        <path d="M 122 114 Q 114 130 122 146 Q 106 144 90 130 Q 106 116 122 114 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <path d="M 90 130 L 80 130 L 80 ${pinY[8]} L 148 ${pinY[8]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>
    `;
  } else if (type === 'ic-7402') {
    // 7402 Quad NOR Gate (Outputs on 1, 4, 10, 13)
    gatesHtml = `
      <!-- Gate 1: 2,3 -> 1 -->
      <g class="ic-gate-group" style="--gate-c:${color(1)}">
        <path d="M 12 ${pinY[2]} L 30 ${pinY[2]} L 30 30 L 38 30" fill="none" stroke="${color(2)}" stroke-width="1.8"/>
        <path d="M 12 ${pinY[3]} L 30 ${pinY[3]} L 30 50 L 38 50" fill="none" stroke="${color(3)}" stroke-width="1.8"/>
        <path d="M 36 24 Q 44 40 36 56 Q 52 54 68 40 Q 52 26 36 24 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <circle cx="71" cy="40" r="3" fill="#05080c" stroke="var(--gate-c)" stroke-width="1.5"/>
        <path d="M 74 40 L 80 40 L 80 ${pinY[1]} L 12 ${pinY[1]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- Gate 2: 5,6 -> 4 -->
      <g class="ic-gate-group" style="--gate-c:${color(4)}">
        <path d="M 12 ${pinY[5]} L 30 ${pinY[5]} L 30 120 L 38 120" fill="none" stroke="${color(5)}" stroke-width="1.8"/>
        <path d="M 12 ${pinY[6]} L 30 ${pinY[6]} L 30 140 L 38 140" fill="none" stroke="${color(6)}" stroke-width="1.8"/>
        <path d="M 36 114 Q 44 130 36 146 Q 52 144 68 130 Q 52 116 36 114 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <circle cx="71" cy="130" r="3" fill="#05080c" stroke="var(--gate-c)" stroke-width="1.5"/>
        <path d="M 74 130 L 80 130 L 80 ${pinY[4]} L 12 ${pinY[4]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- Gate 4: 12,11 -> 13 -->
      <g class="ic-gate-group" style="--gate-c:${color(13)}">
        <path d="M 148 ${pinY[12]} L 130 ${pinY[12]} L 130 30 L 122 30" fill="none" stroke="${color(12)}" stroke-width="1.8"/>
        <path d="M 148 ${pinY[11]} L 130 ${pinY[11]} L 130 50 L 122 50" fill="none" stroke="${color(11)}" stroke-width="1.8"/>
        <path d="M 124 24 Q 116 40 124 56 Q 108 54 92 40 Q 108 26 124 24 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <circle cx="89" cy="40" r="3" fill="#05080c" stroke="var(--gate-c)" stroke-width="1.5"/>
        <path d="M 86 40 L 80 40 L 80 ${pinY[13]} L 148 ${pinY[13]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>

      <!-- Gate 3: 9,8 -> 10 -->
      <g class="ic-gate-group" style="--gate-c:${color(10)}">
        <path d="M 148 ${pinY[9]} L 130 ${pinY[9]} L 130 120 L 122 120" fill="none" stroke="${color(9)}" stroke-width="1.8"/>
        <path d="M 148 ${pinY[8]} L 130 ${pinY[8]} L 130 140 L 122 140" fill="none" stroke="${color(8)}" stroke-width="1.8"/>
        <path d="M 124 114 Q 116 130 124 146 Q 108 144 92 130 Q 108 116 124 114 Z" fill="rgba(0,255,100,0.06)" stroke="var(--gate-c)" stroke-width="1.8"/>
        <circle cx="89" cy="130" r="3" fill="#05080c" stroke="var(--gate-c)" stroke-width="1.5"/>
        <path d="M 86 130 L 80 130 L 80 ${pinY[10]} L 148 ${pinY[10]}" fill="none" stroke="var(--gate-c)" stroke-width="1.8"/>
      </g>
    `;
  }

  // GND and VCC power rails
  const powerRailsHtml = `
    <!-- Pin 7 GND -->
    <path d="M 12 ${pinY[7]} L 45 ${pinY[7]}" fill="none" stroke="#64748b" stroke-width="1.8"/>
    <text x="48" y="${pinY[7] + 3}" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="700">GND</text>
    
    <!-- Pin 14 VCC -->
    <path d="M 148 ${pinY[14]} L 115 ${pinY[14]}" fill="none" stroke="#ef4444" stroke-width="1.8"/>
    <text x="96" y="${pinY[14] + 3}" fill="#ef4444" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="700">VCC</text>
  `;

  return `
    <svg class="real-ic-schematic-svg" viewBox="0 0 ${width} ${height}" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2">
      ${powerRailsHtml}
      ${gatesHtml}
    </svg>
  `;
}
