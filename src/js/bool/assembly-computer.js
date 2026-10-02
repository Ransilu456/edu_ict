export const DEFAULT_ASSEMBLY_PROGRAM = `; Add two values, store the result in RAM, and read it back
LDI R0, 7
LDI R1, 5
ADD R2, R0, R1
STORE [0x10], R2
LOAD R3, [0x10]
OUT R3
HALT`;

function parseProgram(source) {
  const instructions = [];
  const labels = new Map();

  String(source || '').split(/\r?\n/).forEach((line, lineIndex) => {
    let text = line.replace(/;.*/, '').replace(/\/\/.*/, '').trim();
    if (!text) return;
    const labelMatch = text.match(/^([A-Za-z_][\w]*):\s*(.*)$/);
    if (labelMatch) {
      const label = labelMatch[1].toUpperCase();
      if (labels.has(label)) throw new Error(`Duplicate label ${label} on line ${lineIndex + 1}`);
      labels.set(label, instructions.length);
      text = labelMatch[2].trim();
      if (!text) return;
    }
    const match = text.match(/^([A-Za-z]+)\s*(.*)$/);
    if (!match) throw new Error(`Invalid instruction on line ${lineIndex + 1}`);
    instructions.push({
      opcode: match[1].toUpperCase(),
      operands: match[2] ? match[2].split(',').map(value => value.trim()) : [],
      source: text,
      line: lineIndex + 1,
    });
  });

  if (!instructions.length) throw new Error('Enter at least one instruction.');
  return { instructions, labels };
}

function parseRegister(operand) {
  const match = String(operand || '').toUpperCase().match(/^R([0-3])$/);
  if (!match) throw new Error(`Invalid register "${operand}". Use R0 through R3.`);
  return Number(match[1]);
}

function parseByte(operand) {
  const normalized = String(operand || '').replace(/^#/, '');
  if (!/^-?(?:0X[\da-f]+|0B[01]+|\d+)$/i.test(normalized)) {
    throw new Error(`Invalid 8-bit value "${operand}".`);
  }
  const value = Number(normalized);
  if (!Number.isInteger(value) || value < 0 || value > 255) throw new Error(`Value "${operand}" must be between 0 and 255.`);
  return value;
}

function parseAddress(operand) {
  const match = String(operand || '').match(/^\[(.+)\]$/);
  if (!match) throw new Error(`Expected a RAM address such as [0x10], got "${operand}".`);
  return parseByte(match[1]);
}

export function runAssemblyProgram(source) {
  const { instructions, labels } = parseProgram(source);
  const registers = new Uint8Array(4);
  const memory = new Uint8Array(256);
  const memoryAccesses = new Set();
  const trace = [];
  let pc = 0;
  let output = null;
  let halted = false;

  while (pc >= 0 && pc < instructions.length && trace.length < 256 && !halted) {
    const instruction = instructions[pc];
    const [first, second, third] = instruction.operands;
    let nextPC = pc + 1;
    const requireOperands = (count) => {
      if (instruction.operands.length !== count) throw new Error(`${instruction.opcode} on line ${instruction.line} expects ${count} operand${count === 1 ? '' : 's'}.`);
    };

    switch (instruction.opcode) {
      case 'LDI':
        requireOperands(2);
        registers[parseRegister(first)] = parseByte(second);
        break;
      case 'MOV':
        requireOperands(2);
        registers[parseRegister(first)] = registers[parseRegister(second)];
        break;
      case 'ADD':
      case 'SUB': {
        requireOperands(3);
        const left = registers[parseRegister(second)];
        const right = registers[parseRegister(third)];
        registers[parseRegister(first)] = instruction.opcode === 'ADD' ? left + right : left - right;
        break;
      }
      case 'LOAD': {
        requireOperands(2);
        const address = parseAddress(second);
        memoryAccesses.add(address);
        registers[parseRegister(first)] = memory[address];
        break;
      }
      case 'STORE': {
        requireOperands(2);
        const address = parseAddress(first);
        memoryAccesses.add(address);
        memory[address] = registers[parseRegister(second)];
        break;
      }
      case 'JMP':
        requireOperands(1);
        if (!labels.has(String(first).toUpperCase())) throw new Error(`Unknown label "${first}" on line ${instruction.line}.`);
        nextPC = labels.get(String(first).toUpperCase());
        break;
      case 'JZ':
        requireOperands(2);
        if (!labels.has(String(second).toUpperCase())) throw new Error(`Unknown label "${second}" on line ${instruction.line}.`);
        if (registers[parseRegister(first)] === 0) nextPC = labels.get(String(second).toUpperCase());
        break;
      case 'OUT':
        requireOperands(1);
        output = registers[parseRegister(first)];
        break;
      case 'HALT':
        requireOperands(0);
        halted = true;
        break;
      default:
        throw new Error(`Unknown instruction "${instruction.opcode}" on line ${instruction.line}.`);
    }

    trace.push({ pc: trace.length, instruction: instruction.source, registers: Array.from(registers) });
    pc = nextPC;
  }

  if (!halted && trace.length >= 256) throw new Error('Program exceeded the 256-instruction execution limit.');
  if (!halted && pc >= instructions.length) throw new Error('Program ended without HALT.');

  return { instructions, trace, registers: Array.from(registers), memory, memoryAccesses: [...memoryAccesses], output };
}

export function createComputerCircuit(result) {
  const nodes = [];
  const wires = [];
  const addBlock = (id, label, x, y, inputsCount, outputsCount, inputLabels, outputLabels, detail, category = 'COMPUTER') => {
    nodes.push({
      id, type: 'computer-block', label, x, y, inputsCount, outputsCount,
      outputState: 0, outputState2: 0, outputState3: 0, outputState4: 0,
      inputValues: Array(inputsCount).fill(0),
      data: {
        category, inputLabels, outputLabels, detail, registerValues: [...result.registers],
        drilldown: id === 'cpu-alu' ? 'alu' : id === 'cpu-registers' ? 'register-bank' : null,
      },
    });
  };
  const toBits = value => (value & 255).toString(2).padStart(8, '0');
  const connect = (fromNodeId, fromPortIdx, toNodeId, toPortIdx, bitLabel = '00000000') => {
    wires.push({ fromNodeId, fromPortIdx, toNodeId, toPortIdx, bitLabel });
  };

  addBlock('cpu-clock', 'System Clock', 40, 70, 0, 1, [], ['CLK'], 'Advances one instruction per tick.', 'TIMING');
  addBlock('cpu-pc', 'Program Counter', 250, 70, 1, 1, ['CLK'], ['PC address'], 'Tracks the next instruction address.');
  addBlock('cpu-ir', 'Instruction Register', 40, 290, 1, 2, ['Instruction'], ['Opcode', 'Operands'], 'Holds the fetched instruction.');
  addBlock('cpu-control', 'Control Unit', 250, 290, 1, 2, ['Opcode'], ['Register control', 'Memory control'], 'Decodes each instruction into control signals.');
  const registerSummary = result.registers.map((value, index) => `R${index}=${value}`).join(' · ');
  addBlock('cpu-registers', 'Register File', 40, 510, 2, 2, ['Operands', 'Register control'], ['Register A', 'Register B'], `${registerSummary} · 8-bit registers.`);
  addBlock('cpu-alu', '8-bit ALU', 250, 510, 2, 1, ['Operand A', 'Operand B'], ['Result'], `ADD and SUB result: ${result.registers[2]}.`);
  const accessedMemory = result.memoryAccesses.map(address => `M[${address.toString(16).padStart(2, '0').toUpperCase()}h]=${result.memory[address]}`).join(', ') || 'No data addresses accessed.';
  addBlock('cpu-ram', 'Data RAM', 500, 70, 3, 1, ['Address', 'Write data', 'Read / write'], ['RAM data'], `256 × 8-bit · ${accessedMemory}`, 'MEMORY');
  addBlock('cpu-rom', 'Program ROM', 500, 290, 1, 1, ['Address'], ['Instruction'], `${result.instructions.length} assembled instructions.`, 'MEMORY');
  addBlock('cpu-address-bus', 'Address Bus', 500, 470, 1, 2, ['PC address'], ['Program address', 'RAM address'], 'Carries 8-bit memory addresses.', 'BUS');
  addBlock('cpu-control-bus', 'Control Bus', 500, 585, 1, 1, ['Control signals'], ['Write / read'], 'Carries memory and register control signals.', 'BUS');
  addBlock('cpu-data-bus', 'Data Bus', 700, 470, 2, 2, ['ALU result', 'RAM data'], ['RAM write data', 'Output data'], 'Moves 8-bit values between CPU and memory.', 'BUS');
  addBlock('cpu-output-register', 'Output Register', 940, 530, 1, 1, ['Output data'], ['Display data'], 'Latches the OUT instruction value.', 'I/O');
  const outputDetail = result.output === null
    ? `No OUT instruction · ${result.trace.length} steps`
    : `OUT = ${result.output} (0x${result.output.toString(16).padStart(2, '0').toUpperCase()}) · ${result.trace.length} steps`;
  addBlock('cpu-monitor', 'I/O Monitor', 1120, 530, 1, 0, ['Display data'], [], outputDetail, 'I/O');

  const pcAddress = Math.max(0, result.trace.length - 1);
  const memoryAddress = result.memoryAccesses[0] || 0;
  connect('cpu-clock', 0, 'cpu-pc', 0, '01010101');
  connect('cpu-pc', 0, 'cpu-address-bus', 0, toBits(pcAddress));
  connect('cpu-address-bus', 0, 'cpu-rom', 0, toBits(pcAddress));
  connect('cpu-address-bus', 1, 'cpu-ram', 0, toBits(memoryAddress));
  connect('cpu-rom', 0, 'cpu-ir', 0, toBits(result.instructions.length));
  connect('cpu-ir', 0, 'cpu-control', 0, toBits(result.instructions.length));
  connect('cpu-ir', 1, 'cpu-registers', 0, toBits(result.registers[0]));
  connect('cpu-control', 0, 'cpu-registers', 1, '00000011');
  connect('cpu-control', 1, 'cpu-control-bus', 0, '00000111');
  connect('cpu-control-bus', 0, 'cpu-ram', 2, '00000001');
  connect('cpu-registers', 0, 'cpu-alu', 0, toBits(result.registers[0]));
  connect('cpu-registers', 1, 'cpu-alu', 1, toBits(result.registers[1]));
  connect('cpu-alu', 0, 'cpu-data-bus', 0, toBits(result.registers[2]));
  connect('cpu-ram', 0, 'cpu-data-bus', 1, toBits(result.memory[memoryAddress]));
  connect('cpu-data-bus', 0, 'cpu-ram', 1, toBits(result.registers[2]));
  connect('cpu-data-bus', 1, 'cpu-output-register', 0, toBits(result.output || 0));
  connect('cpu-output-register', 0, 'cpu-monitor', 0, toBits(result.output || 0));

  return {
    version: 2,
    nextNodeId: 1,
    nextRegionId: 2,
    nodes,
    wires,
    regions: [
      { id: 'cpu-core-region', x: 20, y: 45, width: 425, height: 610, label: '8-BIT CPU CORE', color: '#0d9488', bg: 'rgba(13, 148, 136, 0.08)', nodeIds: ['cpu-clock', 'cpu-pc', 'cpu-ir', 'cpu-control', 'cpu-registers', 'cpu-alu'] },
      { id: 'computer-memory-region', x: 480, y: 45, width: 210, height: 390, label: 'MEMORY', color: '#d97706', bg: 'rgba(217, 119, 6, 0.08)', nodeIds: ['cpu-rom', 'cpu-ram'] },
      { id: 'computer-bus-region', x: 480, y: 455, width: 410, height: 230, label: 'BUS FABRIC', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.07)', nodeIds: ['cpu-address-bus', 'cpu-control-bus', 'cpu-data-bus'] },
      { id: 'computer-io-region', x: 920, y: 475, width: 390, height: 200, label: 'I/O', color: '#be123c', bg: 'rgba(190, 18, 60, 0.07)', nodeIds: ['cpu-output-register', 'cpu-monitor'] },
    ],
  };
}

export function createAluGateCircuit(registerValues = [0, 0]) {
  const nodes = [];
  const wires = [];
  const chipNodes = new Map();
  const stages = {
    propagate: { type: 'ic-7486', x: 450, pins: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]] },
    sum: { type: 'ic-7486', x: 850, pins: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]] },
    generate: { type: 'ic-7408', x: 1250, pins: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]] },
    carryTerm: { type: 'ic-7408', x: 1650, pins: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]] },
    carryOut: { type: 'ic-7432', x: 2050, pins: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]] },
  };
  const bit = (value, index) => ((value >>> index) & 1);
  const addInput = (id, label, x, y, value) => {
    nodes.push({ id, type: 'input', label, x, y, inputsCount: 0, outputsCount: 1, outputState: value, outputState2: 0, inputValues: [], data: {} });
    return id;
  };
  const connect = (fromNodeId, fromPortIdx, toNodeId, toPortIdx, bitValue) => {
    wires.push({ fromNodeId, fromPortIdx, toNodeId, toPortIdx, bitLabel: String(bitValue) });
  };
  const allocateGate = (stageName, gateIndex) => {
    const stage = stages[stageName];
    const chipIndex = Math.floor(gateIndex / 4);
    const pinSet = stage.pins[gateIndex % 4];
    const chipId = `${stageName}-ic-${chipIndex + 1}`;
    if (!chipNodes.has(chipId)) {
      nodes.push({
        id: chipId, type: stage.type, label: `${stage.type.slice(3)} ${stageName} ${chipIndex + 1}`,
        x: stage.x, y: 90 + chipIndex * 350, rotation: 0,
        inputsCount: 15, outputsCount: 15, outputState: 0, outputStates: {},
        inputValues: Array(15).fill(0), pinValues: {}, data: {},
      });
      chipNodes.set(chipId, chipIndex);
    }
    return { chipId, inputA: pinSet[0], inputB: pinSet[1], output: pinSet[2] };
  };

  const inputA = Array.from({ length: 8 }, (_, index) => addInput(`alu-a${index}`, `A${index}`, 35, 80 + index * 100, bit(registerValues[0] || 0, index)));
  const inputB = Array.from({ length: 8 }, (_, index) => addInput(`alu-b${index}`, `B${index}`, 175, 80 + index * 100, bit(registerValues[1] || 0, index)));
  const carryIn = addInput('alu-carry-in', 'CARRY IN', 315, 865, 0);
  nodes.push({ id: 'alu-vcc', type: 'computer-block', label: '+5 V RAIL', x: 35, y: 990, inputsCount: 0, outputsCount: 1, outputState: 1, inputValues: [], data: { category: 'POWER', outputLabels: ['VCC +5 V'], detail: 'Logic supply rail.' } });
  nodes.push({ id: 'alu-ground', type: 'computer-block', label: 'GROUND', x: 220, y: 990, inputsCount: 0, outputsCount: 1, outputState: 0, inputValues: [], data: { category: 'POWER', outputLabels: ['GND 0 V'], detail: 'Ground reference rail.' } });
  const sumOutputs = Array.from({ length: 8 }, (_, index) => {
    const id = `alu-sum${index}`;
    nodes.push({ id, type: 'output', label: `SUM ${index}`, x: 2510, y: 60 + index * 118, inputsCount: 1, outputsCount: 0, outputState: bit((registerValues[0] || 0) + (registerValues[1] || 0), index), inputValues: [0], data: {} });
    return id;
  });
  const carryOutput = 'alu-carry-out';
  nodes.push({ id: carryOutput, type: 'output', label: 'CARRY OUT', x: 2510, y: 1010, inputsCount: 1, outputsCount: 0, outputState: ((registerValues[0] || 0) + (registerValues[1] || 0)) > 255 ? 1 : 0, inputValues: [0], data: {} });

  let carrySource = { id: carryIn, pin: 0 };
  let carryValue = 0;
  for (let index = 0; index < 8; index++) {
    const propagate = allocateGate('propagate', index);
    const sum = allocateGate('sum', index);
    const generate = allocateGate('generate', index);
    const carryTerm = allocateGate('carryTerm', index);
    const carryOut = allocateGate('carryOut', index);
    const aValue = bit(registerValues[0] || 0, index);
    const bValue = bit(registerValues[1] || 0, index);
    const propagateValue = aValue ^ bValue;

    connect(inputA[index], 0, propagate.chipId, propagate.inputA, aValue);
    connect(inputB[index], 0, propagate.chipId, propagate.inputB, bValue);
    connect(propagate.chipId, propagate.output, sum.chipId, sum.inputA, propagateValue);
    connect(carrySource.id, carrySource.pin, sum.chipId, sum.inputB, carryValue);
    connect(inputA[index], 0, generate.chipId, generate.inputA, aValue);
    connect(inputB[index], 0, generate.chipId, generate.inputB, bValue);
    connect(propagate.chipId, propagate.output, carryTerm.chipId, carryTerm.inputA, propagateValue);
    connect(carrySource.id, carrySource.pin, carryTerm.chipId, carryTerm.inputB, carryValue);
    const generatedCarry = aValue & bValue;
    const propagatedCarry = propagateValue & carryValue;
    connect(generate.chipId, generate.output, carryOut.chipId, carryOut.inputA, generatedCarry);
    connect(carryTerm.chipId, carryTerm.output, carryOut.chipId, carryOut.inputB, propagatedCarry);
    connect(sum.chipId, sum.output, sumOutputs[index], 0, bit((registerValues[0] || 0) + (registerValues[1] || 0), index));
    const nextCarry = generatedCarry | propagatedCarry;
    if (index === 7) connect(carryOut.chipId, carryOut.output, carryOutput, 0, nextCarry);
    carrySource = { id: carryOut.chipId, pin: carryOut.output };
    carryValue = nextCarry;
  }

  chipNodes.forEach((_, chipId) => {
    connect('alu-vcc', 0, chipId, 14, 1);
    connect('alu-ground', 0, chipId, 7, 0);
  });

  return {
    version: 2,
    nextNodeId: 1,
    nextRegionId: 4,
    nodes,
    wires,
    regions: [
      { id: 'alu-input-region', x: 20, y: 40, width: 400, height: 1150, label: 'INPUTS / POWER', color: '#0d9488', bg: 'rgba(13, 148, 136, 0.08)', nodeIds: [...inputA, ...inputB, carryIn, 'alu-vcc', 'alu-ground'] },
      { id: 'alu-ic-region', x: 430, y: 40, width: 2030, height: 710, label: 'RIPPLE-CARRY IC ARRAY', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.07)', nodeIds: [...chipNodes.keys()] },
      { id: 'alu-output-region', x: 2485, y: 40, width: 190, height: 1120, label: 'SUM / CARRY', color: '#d97706', bg: 'rgba(217, 119, 6, 0.08)', nodeIds: [...sumOutputs, carryOutput] },
    ],
  };
}

export function createRegisterBankCircuit(registerValue = 0) {
  const nodes = [];
  const wires = [];
  const byteBit = index => (registerValue >>> index) & 1;
  const addWire = (fromNodeId, fromPortIdx, toNodeId, toPortIdx, value = 0) => {
    wires.push({ fromNodeId, fromPortIdx, toNodeId, toPortIdx, bitLabel: String(value) });
  };
  const dataInputs = Array.from({ length: 8 }, (_, index) => {
    const id = `regbank-data-${index}`;
    nodes.push({ id, type: 'input', label: `D${index}`, x: 40, y: 65 + index * 90, inputsCount: 0, outputsCount: 1, outputState: byteBit(index), inputValues: [], data: {} });
    return id;
  });
  const addressInputs = [0, 1].map(index => {
    const id = `regbank-address-${index}`;
    nodes.push({ id, type: 'input', label: `A${index}`, x: 210, y: 65 + index * 105, inputsCount: 0, outputsCount: 1, outputState: 0, inputValues: [], data: {} });
    return id;
  });
  const writeEnable = 'regbank-write-enable';
  nodes.push({ id: writeEnable, type: 'input', label: 'WRITE EN', x: 210, y: 285, inputsCount: 0, outputsCount: 1, outputState: 1, inputValues: [], data: {} });
  nodes.push({ id: 'regbank-vcc', type: 'computer-block', label: '+5 V RAIL', x: 40, y: 810, inputsCount: 0, outputsCount: 1, outputState: 1, inputValues: [], data: { category: 'POWER', outputLabels: ['VCC +5 V'], detail: 'Logic supply rail.' } });
  nodes.push({ id: 'regbank-ground', type: 'computer-block', label: 'GROUND', x: 210, y: 810, inputsCount: 0, outputsCount: 1, outputState: 0, inputValues: [], data: { category: 'POWER', outputLabels: ['GND 0 V'], detail: 'Ground reference rail.' } });

  nodes.push({ id: 'regbank-clock', type: 'clock', label: 'Register Clock', x: 650, y: 455, inputsCount: 0, outputsCount: 1, outputState: 0, inputValues: [], data: { startState: 0 } });
  nodes.push({ id: 'regbank-decoder', type: 'decoder-2-4', label: '2-to-4 Address Decoder', x: 400, y: 190, inputsCount: 2, outputsCount: 4, outputState: 1, outputState2: 0, outputState3: 0, outputState4: 0, inputValues: [0, 0], data: {} });
  nodes.push({ id: 'regbank-ic-7408', type: 'ic-7408', label: '7408 Write Enable', x: 650, y: 80, inputsCount: 15, outputsCount: 15, outputState: 0, outputStates: {}, inputValues: Array(15).fill(0), pinValues: {}, data: {} });

  const muxes = Array.from({ length: 8 }, (_, index) => {
    const id = `regbank-mux-${index}`;
    nodes.push({ id, type: 'mux-2-1', label: `D${index} Feedback MUX`, x: 1080, y: 55 + index * 95, inputsCount: 3, outputsCount: 1, outputState: byteBit(index), inputValues: [byteBit(index), byteBit(index), 1], data: {} });
    return id;
  });
  const flipFlops = Array.from({ length: 8 }, (_, index) => {
    const id = `regbank-ff-${index}`;
    nodes.push({ id, type: 'd-flop', label: `R0 bit ${index}`, x: 1300, y: 55 + index * 95, inputsCount: 2, outputsCount: 1, outputState: byteBit(index), outputState2: 0, prevClockState: 0, inputValues: [byteBit(index), 0], data: {} });
    return id;
  });

  nodes.push({ id: 'regbank-led-low', type: 'led-bar', label: 'R0 LOW NIBBLE', x: 1510, y: 160, inputsCount: 4, outputsCount: 0, outputState: 0, inputValues: [byteBit(3), byteBit(2), byteBit(1), byteBit(0)], data: {} });
  nodes.push({ id: 'regbank-led-high', type: 'led-bar', label: 'R0 HIGH NIBBLE', x: 1510, y: 475, inputsCount: 4, outputsCount: 0, outputState: 0, inputValues: [byteBit(7), byteBit(6), byteBit(5), byteBit(4)], data: {} });
  nodes.push({ id: 'regbank-seven-seg', type: 'seven-seg', label: 'R0 HEX OUTPUT', x: 1740, y: 315, inputsCount: 4, outputsCount: 0, outputState: 0, inputValues: [byteBit(3), byteBit(2), byteBit(1), byteBit(0)], data: {} });

  addWire(addressInputs[0], 0, 'regbank-decoder', 0, 0);
  addWire(addressInputs[1], 0, 'regbank-decoder', 1, 0);
  addWire('regbank-decoder', 0, 'regbank-ic-7408', 1, 1);
  addWire(writeEnable, 0, 'regbank-ic-7408', 2, 1);
  addWire('regbank-vcc', 0, 'regbank-ic-7408', 14, 1);
  addWire('regbank-ground', 0, 'regbank-ic-7408', 7, 0);

  for (let index = 0; index < 8; index++) {
    const gateIndex = index % 4;
    const gateOutputPin = [3, 6, 8, 11][gateIndex];
    const gateInputPin = [[1, 2], [4, 5], [9, 10], [12, 13]][gateIndex];
    const chipIndex = Math.floor(index / 4);
    const chipId = chipIndex === 0 ? 'regbank-ic-7408' : 'regbank-ic-7408-high';
    if (chipIndex === 1 && !nodes.some(node => node.id === chipId)) {
      const chip = nodes.find(node => node.id === 'regbank-ic-7408');
      nodes.push({ ...chip, id: chipId, label: '7408 Write Enable (high bits)', x: 650, y: 390, pinValues: {}, outputStates: {}, inputValues: Array(15).fill(0) });
      addWire('regbank-vcc', 0, chipId, 14, 1);
      addWire('regbank-ground', 0, chipId, 7, 0);
    }
    addWire('regbank-decoder', 0, chipId, gateInputPin[0], 1);
    addWire(writeEnable, 0, chipId, gateInputPin[1], 1);
    addWire(chipId, gateOutputPin, muxes[index], 2, 1);
    addWire(flipFlops[index], 0, muxes[index], 0, byteBit(index));
    addWire(dataInputs[index], 0, muxes[index], 1, byteBit(index));
    addWire(muxes[index], 0, flipFlops[index], 0, byteBit(index));
    addWire('regbank-clock', 0, flipFlops[index], 1, 0);
    const ledIndex = index % 4;
    const ledPort = ledIndex;
    addWire(flipFlops[index], 0, index < 4 ? 'regbank-led-low' : 'regbank-led-high', ledPort, byteBit(index));
    if (index < 4) addWire(flipFlops[index], 0, 'regbank-seven-seg', 3 - index, byteBit(index));
  }

  return {
    version: 2, nextNodeId: 1, nextRegionId: 5, nodes, wires,
    regions: [
      { id: 'regbank-input-region', x: 20, y: 40, width: 350, height: 900, label: 'DATA / ADDRESS INPUTS', color: '#0d9488', bg: 'rgba(13, 148, 136, 0.08)', nodeIds: [...dataInputs, ...addressInputs, writeEnable, 'regbank-vcc', 'regbank-ground'] },
      { id: 'regbank-control-region', x: 380, y: 40, width: 680, height: 700, label: 'DECODE / WRITE CONTROL', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.07)', nodeIds: ['regbank-decoder', 'regbank-ic-7408', 'regbank-ic-7408-high', 'regbank-clock'] },
      { id: 'regbank-storage-region', x: 1060, y: 40, width: 390, height: 850, label: '8-BIT REGISTER', color: '#9333ea', bg: 'rgba(147, 51, 234, 0.07)', nodeIds: [...muxes, ...flipFlops] },
      { id: 'regbank-output-region', x: 1490, y: 40, width: 430, height: 850, label: 'DISPLAY OUTPUT', color: '#d97706', bg: 'rgba(217, 119, 6, 0.08)', nodeIds: ['regbank-led-low', 'regbank-led-high', 'regbank-seven-seg'] },
    ],
  };
}

export function initAssemblyComputer() {
  const form = document.getElementById('assembly-form');
  const source = document.getElementById('assembly-source');
  const output = document.getElementById('assembly-output');
  if (!form || form.dataset.ready) return;
  form.dataset.ready = 'true';
  if (!source.value.trim()) source.value = DEFAULT_ASSEMBLY_PROGRAM;

  form.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const result = runAssemblyProgram(source.value);
      sessionStorage.removeItem('logicQuest_computerParent');
      sessionStorage.setItem('logicQuest_pendingComputer', JSON.stringify(createComputerCircuit(result)));
      window.navigateToRoute?.('/logic/sandbox');
    } catch (error) {
      output.hidden = false;
      output.classList.add('assembly-error');
      output.textContent = error.message;
    }
  });
}