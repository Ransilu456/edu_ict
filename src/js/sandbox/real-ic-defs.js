export const REAL_ICS = {
  'ic-7408': {
    type: 'ic-7408',
    label: '7408 Quad AND',
    partNumber: 'SN74LS08N',
    desc: 'Quad 2-Input Positive-AND Gates',
    package: 'DIP-14',
    pinCount: 14,
    pins: [
      { pin: 1,  name: '1A',  type: 'input',  desc: 'Gate 1 Input A' },
      { pin: 2,  name: '1B',  type: 'input',  desc: 'Gate 1 Input B' },
      { pin: 3,  name: '1Y',  type: 'output', desc: 'Gate 1 Output (1A · 1B)' },
      { pin: 4,  name: '2A',  type: 'input',  desc: 'Gate 2 Input A' },
      { pin: 5,  name: '2B',  type: 'input',  desc: 'Gate 2 Input B' },
      { pin: 6,  name: '2Y',  type: 'output', desc: 'Gate 2 Output (2A · 2B)' },
      { pin: 7,  name: 'GND', type: 'ground', desc: 'Ground (0V)' },
      { pin: 8,  name: '3Y',  type: 'output', desc: 'Gate 3 Output (3A · 3B)' },
      { pin: 9,  name: '3A',  type: 'input',  desc: 'Gate 3 Input A' },
      { pin: 10, name: '3B',  type: 'input',  desc: 'Gate 3 Input B' },
      { pin: 11, name: '4Y',  type: 'output', desc: 'Gate 4 Output (4A · 4B)' },
      { pin: 12, name: '4A',  type: 'input',  desc: 'Gate 4 Input A' },
      { pin: 13, name: '4B',  type: 'input',  desc: 'Gate 4 Input B' },
      { pin: 14, name: 'VCC', type: 'power',  desc: 'Supply Voltage (+5V)' }
    ],
    evaluate: (pins) => {
      const p14 = pins[14] !== undefined ? pins[14] : 1;
      const p7 = pins[7] !== undefined ? pins[7] : 0;
      if (p14 === 0 || p7 === 1) return { 3: 0, 6: 0, 8: 0, 11: 0 };
      return {
        3: ((pins[1] || 0) && (pins[2] || 0)) ? 1 : 0,
        6: ((pins[4] || 0) && (pins[5] || 0)) ? 1 : 0,
        8: ((pins[9] || 0) && (pins[10] || 0)) ? 1 : 0,
        11: ((pins[12] || 0) && (pins[13] || 0)) ? 1 : 0
      };
    }
  },

  'ic-7432': {
    type: 'ic-7432',
    label: '7432 Quad OR',
    partNumber: 'SN74LS32N',
    desc: 'Quad 2-Input Positive-OR Gates',
    package: 'DIP-14',
    pinCount: 14,
    pins: [
      { pin: 1,  name: '1A',  type: 'input',  desc: 'Gate 1 Input A' },
      { pin: 2,  name: '1B',  type: 'input',  desc: 'Gate 1 Input B' },
      { pin: 3,  name: '1Y',  type: 'output', desc: 'Gate 1 Output (1A + 1B)' },
      { pin: 4,  name: '2A',  type: 'input',  desc: 'Gate 2 Input A' },
      { pin: 5,  name: '2B',  type: 'input',  desc: 'Gate 2 Input B' },
      { pin: 6,  name: '2Y',  type: 'output', desc: 'Gate 2 Output (2A + 2B)' },
      { pin: 7,  name: 'GND', type: 'ground', desc: 'Ground (0V)' },
      { pin: 8,  name: '3Y',  type: 'output', desc: 'Gate 3 Output (3A + 3B)' },
      { pin: 9,  name: '3A',  type: 'input',  desc: 'Gate 3 Input A' },
      { pin: 10, name: '3B',  type: 'input',  desc: 'Gate 3 Input B' },
      { pin: 11, name: '4Y',  type: 'output', desc: 'Gate 4 Output (4A + 4B)' },
      { pin: 12, name: '4A',  type: 'input',  desc: 'Gate 4 Input A' },
      { pin: 13, name: '4B',  type: 'input',  desc: 'Gate 4 Input B' },
      { pin: 14, name: 'VCC', type: 'power',  desc: 'Supply Voltage (+5V)' }
    ],
    evaluate: (pins) => {
      const p14 = pins[14] !== undefined ? pins[14] : 1;
      const p7 = pins[7] !== undefined ? pins[7] : 0;
      if (p14 === 0 || p7 === 1) return { 3: 0, 6: 0, 8: 0, 11: 0 };
      return {
        3: ((pins[1] || 0) || (pins[2] || 0)) ? 1 : 0,
        6: ((pins[4] || 0) || (pins[5] || 0)) ? 1 : 0,
        8: ((pins[9] || 0) || (pins[10] || 0)) ? 1 : 0,
        11: ((pins[12] || 0) || (pins[13] || 0)) ? 1 : 0
      };
    }
  },

  'ic-7404': {
    type: 'ic-7404',
    label: '7404 Hex NOT',
    partNumber: 'SN74LS04N',
    desc: 'Hex Inverters (6 NOT Gates)',
    package: 'DIP-14',
    pinCount: 14,
    pins: [
      { pin: 1,  name: '1A',  type: 'input',  desc: 'Gate 1 Input' },
      { pin: 2,  name: '1Y',  type: 'output', desc: 'Gate 1 Output (1Ā)' },
      { pin: 3,  name: '2A',  type: 'input',  desc: 'Gate 2 Input' },
      { pin: 4,  name: '2Y',  type: 'output', desc: 'Gate 2 Output (2Ā)' },
      { pin: 5,  name: '3A',  type: 'input',  desc: 'Gate 3 Input' },
      { pin: 6,  name: '3Y',  type: 'output', desc: 'Gate 3 Output (3Ā)' },
      { pin: 7,  name: 'GND', type: 'ground', desc: 'Ground (0V)' },
      { pin: 8,  name: '4Y',  type: 'output', desc: 'Gate 4 Output (4Ā)' },
      { pin: 9,  name: '4A',  type: 'input',  desc: 'Gate 4 Input' },
      { pin: 10, name: '5Y',  type: 'output', desc: 'Gate 5 Output (5Ā)' },
      { pin: 11, name: '5A',  type: 'input',  desc: 'Gate 5 Input' },
      { pin: 12, name: '6Y',  type: 'output', desc: 'Gate 6 Output (6Ā)' },
      { pin: 13, name: '6A',  type: 'input',  desc: 'Gate 6 Input' },
      { pin: 14, name: 'VCC', type: 'power',  desc: 'Supply Voltage (+5V)' }
    ],
    evaluate: (pins) => {
      const p14 = pins[14] !== undefined ? pins[14] : 1;
      const p7 = pins[7] !== undefined ? pins[7] : 0;
      if (p14 === 0 || p7 === 1) return { 2: 0, 4: 0, 6: 0, 8: 0, 10: 0, 12: 0 };
      return {
        2: (pins[1] || 0) ? 0 : 1,
        4: (pins[3] || 0) ? 0 : 1,
        6: (pins[5] || 0) ? 0 : 1,
        8: (pins[9] || 0) ? 0 : 1,
        10: (pins[11] || 0) ? 0 : 1,
        12: (pins[13] || 0) ? 0 : 1
      };
    }
  },

  'ic-7400': {
    type: 'ic-7400',
    label: '7400 Quad NAND',
    partNumber: 'SN74LS00N',
    desc: 'Quad 2-Input Positive-NAND Gates',
    package: 'DIP-14',
    pinCount: 14,
    pins: [
      { pin: 1,  name: '1A',  type: 'input',  desc: 'Gate 1 Input A' },
      { pin: 2,  name: '1B',  type: 'input',  desc: 'Gate 1 Input B' },
      { pin: 3,  name: '1Y',  type: 'output', desc: 'Gate 1 Output (1A · 1B)̄' },
      { pin: 4,  name: '2A',  type: 'input',  desc: 'Gate 2 Input A' },
      { pin: 5,  name: '2B',  type: 'input',  desc: 'Gate 2 Input B' },
      { pin: 6,  name: '2Y',  type: 'output', desc: 'Gate 2 Output (2A · 2B)̄' },
      { pin: 7,  name: 'GND', type: 'ground', desc: 'Ground (0V)' },
      { pin: 8,  name: '3Y',  type: 'output', desc: 'Gate 3 Output (3A · 3B)̄' },
      { pin: 9,  name: '3A',  type: 'input',  desc: 'Gate 3 Input A' },
      { pin: 10, name: '3B',  type: 'input',  desc: 'Gate 3 Input B' },
      { pin: 11, name: '4Y',  type: 'output', desc: 'Gate 4 Output (4A · 4B)̄' },
      { pin: 12, name: '4A',  type: 'input',  desc: 'Gate 4 Input A' },
      { pin: 13, name: '4B',  type: 'input',  desc: 'Gate 4 Input B' },
      { pin: 14, name: 'VCC', type: 'power',  desc: 'Supply Voltage (+5V)' }
    ],
    evaluate: (pins) => {
      const p14 = pins[14] !== undefined ? pins[14] : 1;
      const p7 = pins[7] !== undefined ? pins[7] : 0;
      if (p14 === 0 || p7 === 1) return { 3: 0, 6: 0, 8: 0, 11: 0 };
      return {
        3: !((pins[1] || 0) && (pins[2] || 0)) ? 1 : 0,
        6: !((pins[4] || 0) && (pins[5] || 0)) ? 1 : 0,
        8: !((pins[9] || 0) && (pins[10] || 0)) ? 1 : 0,
        11: !((pins[12] || 0) && (pins[13] || 0)) ? 1 : 0
      };
    }
  },

  'ic-7402': {
    type: 'ic-7402',
    label: '7402 Quad NOR',
    partNumber: 'SN74LS02N',
    desc: 'Quad 2-Input Positive-NOR Gates',
    package: 'DIP-14',
    pinCount: 14,
    pins: [
      { pin: 1,  name: '1Y',  type: 'output', desc: 'Gate 1 Output (1A + 1B)̄' },
      { pin: 2,  name: '1A',  type: 'input',  desc: 'Gate 1 Input A' },
      { pin: 3,  name: '1B',  type: 'input',  desc: 'Gate 1 Input B' },
      { pin: 4,  name: '2Y',  type: 'output', desc: 'Gate 2 Output (2A + 2B)̄' },
      { pin: 5,  name: '2A',  type: 'input',  desc: 'Gate 2 Input A' },
      { pin: 6,  name: '2B',  type: 'input',  desc: 'Gate 2 Input B' },
      { pin: 7,  name: 'GND', type: 'ground', desc: 'Ground (0V)' },
      { pin: 8,  name: '3B',  type: 'input',  desc: 'Gate 3 Input B' },
      { pin: 9,  name: '3A',  type: 'input',  desc: 'Gate 3 Input A' },
      { pin: 10, name: '3Y',  type: 'output', desc: 'Gate 3 Output (3A + 3B)̄' },
      { pin: 11, name: '4B',  type: 'input',  desc: 'Gate 4 Input B' },
      { pin: 12, name: '4A',  type: 'input',  desc: 'Gate 4 Input A' },
      { pin: 13, name: '4Y',  type: 'output', desc: 'Gate 4 Output (4A + 4B)̄' },
      { pin: 14, name: 'VCC', type: 'power',  desc: 'Supply Voltage (+5V)' }
    ],
    evaluate: (pins) => {
      const p14 = pins[14] !== undefined ? pins[14] : 1;
      const p7 = pins[7] !== undefined ? pins[7] : 0;
      if (p14 === 0 || p7 === 1) return { 1: 0, 4: 0, 10: 0, 13: 0 };
      return {
        1: !((pins[2] || 0) || (pins[3] || 0)) ? 1 : 0,
        4: !((pins[5] || 0) || (pins[6] || 0)) ? 1 : 0,
        10: !((pins[9] || 0) || (pins[8] || 0)) ? 1 : 0,
        13: !((pins[12] || 0) || (pins[11] || 0)) ? 1 : 0
      };
    }
  },

  'ic-7486': {
    type: 'ic-7486',
    label: '7486 Quad XOR',
    partNumber: 'SN74LS86N',
    desc: 'Quad 2-Input Exclusive-OR Gates',
    package: 'DIP-14',
    pinCount: 14,
    pins: [
      { pin: 1,  name: '1A',  type: 'input',  desc: 'Gate 1 Input A' },
      { pin: 2,  name: '1B',  type: 'input',  desc: 'Gate 1 Input B' },
      { pin: 3,  name: '1Y',  type: 'output', desc: 'Gate 1 Output (1A ⊕ 1B)' },
      { pin: 4,  name: '2A',  type: 'input',  desc: 'Gate 2 Input A' },
      { pin: 5,  name: '2B',  type: 'input',  desc: 'Gate 2 Input B' },
      { pin: 6,  name: '2Y',  type: 'output', desc: 'Gate 2 Output (2A ⊕ 2B)' },
      { pin: 7,  name: 'GND', type: 'ground', desc: 'Ground (0V)' },
      { pin: 8,  name: '3Y',  type: 'output', desc: 'Gate 3 Output (3A ⊕ 3B)' },
      { pin: 9,  name: '3A',  type: 'input',  desc: 'Gate 3 Input A' },
      { pin: 10, name: '3B',  type: 'input',  desc: 'Gate 3 Input B' },
      { pin: 11, name: '4Y',  type: 'output', desc: 'Gate 4 Output (4A ⊕ 4B)' },
      { pin: 12, name: '4A',  type: 'input',  desc: 'Gate 4 Input A' },
      { pin: 13, name: '4B',  type: 'input',  desc: 'Gate 4 Input B' },
      { pin: 14, name: 'VCC', type: 'power',  desc: 'Supply Voltage (+5V)' }
    ],
    evaluate: (pins) => {
      const p14 = pins[14] !== undefined ? pins[14] : 1;
      const p7 = pins[7] !== undefined ? pins[7] : 0;
      if (p14 === 0 || p7 === 1) return { 3: 0, 6: 0, 8: 0, 11: 0 };
      return {
        3: (!!(pins[1] || 0) !== !(pins[2] || 0)) ? 1 : 0,
        6: (!!(pins[4] || 0) !== !(pins[5] || 0)) ? 1 : 0,
        8: (!!(pins[9] || 0) !== !(pins[10] || 0)) ? 1 : 0,
        11: (!!(pins[12] || 0) !== !(pins[13] || 0)) ? 1 : 0
      };
    }
  },

  'ic-7447': {
    type: 'ic-7447',
    label: '7447 BCD to 7-Seg',
    partNumber: 'SN74LS47N',
    desc: 'BCD to 7-Segment Decoder / Driver',
    package: 'DIP-16',
    pinCount: 16,
    pins: [
      { pin: 1,  name: 'B',   type: 'input',  desc: 'Input B (Bit 1)' },
      { pin: 2,  name: 'C',   type: 'input',  desc: 'Input C (Bit 2)' },
      { pin: 3,  name: 'LT',  type: 'input',  desc: 'Lamp Test (Active LOW)' },
      { pin: 4,  name: 'BI',  type: 'input',  desc: 'Blanking Input / RBO' },
      { pin: 5,  name: 'RBI', type: 'input',  desc: 'Ripple-Blanking Input' },
      { pin: 6,  name: 'D',   type: 'input',  desc: 'Input D (Bit 3 MSB)' },
      { pin: 7,  name: 'A',   type: 'input',  desc: 'Input A (Bit 0 LSB)' },
      { pin: 8,  name: 'GND', type: 'ground', desc: 'Ground (0V)' },
      { pin: 9,  name: 'e',   type: 'output', desc: 'Segment e Output' },
      { pin: 10, name: 'd',   type: 'output', desc: 'Segment d Output' },
      { pin: 11, name: 'c',   type: 'output', desc: 'Segment c Output' },
      { pin: 12, name: 'b',   type: 'output', desc: 'Segment b Output' },
      { pin: 13, name: 'a',   type: 'output', desc: 'Segment a Output' },
      { pin: 14, name: 'g',   type: 'output', desc: 'Segment g Output' },
      { pin: 15, name: 'f',   type: 'output', desc: 'Segment f Output' },
      { pin: 16, name: 'VCC', type: 'power',  desc: 'Supply Voltage (+5V)' }
    ],
    evaluate: (pins) => {
      const p16 = pins[16] !== undefined ? pins[16] : 1;
      const p8 = pins[8] !== undefined ? pins[8] : 0;
      if (p16 === 0 || p8 === 1) return { 13: 0, 12: 0, 11: 0, 10: 0, 9: 0, 15: 0, 14: 0 };

      // Lamp test active low
      if (pins[3] === 0) return { 13: 1, 12: 1, 11: 1, 10: 1, 9: 1, 15: 1, 14: 1 };
      // Blanking input active low
      if (pins[4] === 0) return { 13: 0, 12: 0, 11: 0, 10: 0, 9: 0, 15: 0, 14: 0 };

      const a = pins[7] || 0;
      const b = pins[1] || 0;
      const c = pins[2] || 0;
      const d = pins[6] || 0;
      const bcd = (d << 3) | (c << 2) | (b << 1) | a;

      const SEG_MAP = [
        [1, 1, 1, 1, 1, 1, 0], // 0: a,b,c,d,e,f
        [0, 1, 1, 0, 0, 0, 0], // 1: b,c
        [1, 1, 0, 1, 1, 0, 1], // 2: a,b,d,e,g
        [1, 1, 1, 1, 0, 0, 1], // 3: a,b,c,d,g
        [0, 1, 1, 0, 0, 1, 1], // 4: b,c,f,g
        [1, 0, 1, 1, 0, 1, 1], // 5: a,c,d,f,g
        [1, 0, 1, 1, 1, 1, 1], // 6: a,c,d,e,f,g
        [1, 1, 1, 0, 0, 0, 0], // 7: a,b,c
        [1, 1, 1, 1, 1, 1, 1], // 8: a,b,c,d,e,f,g
        [1, 1, 1, 1, 0, 1, 1], // 9: a,b,c,d,f,g
      ];

      const segs = (bcd <= 9) ? SEG_MAP[bcd] : [0, 0, 0, 0, 0, 0, 0];
      return {
        13: segs[0], // a
        12: segs[1], // b
        11: segs[2], // c
        10: segs[3], // d
        9:  segs[4], // e
        15: segs[5], // f
        14: segs[6]  // g
      };
    }
  }
};

