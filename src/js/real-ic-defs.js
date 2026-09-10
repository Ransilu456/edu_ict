/**
 * Real-World Integrated Circuit (IC) Definitions
 * Standard 74xx Series TTL Dual In-Line Package (DIP-14)
 * Accurate physical pinouts, gate mapping, and logic evaluation.
 */

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
      const p14 = pins[14] !== undefined ? pins[14] : 1; // Default powered
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
  }
};
