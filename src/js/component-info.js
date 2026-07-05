export const COMPONENT_EDU_DATA = {
  not: {
    name: 'NOT Gate',
    purpose: 'Inverts a signal. If the input is HIGH, the output becomes LOW.',
    truthTable: '0 → 1, 1 → 0',
    equation: 'Y = A̅',
    ic: '7404',
    uses: 'Used in inverters, clock logic, and signal conditioning.'
  },
  and: {
    name: 'AND Gate',
    purpose: 'Outputs HIGH only when every input is HIGH.',
    truthTable: 'A·B',
    equation: 'Y = A·B',
    ic: '7408',
    uses: 'Used for enabling conditions and combinational logic.'
  },
  or: {
    name: 'OR Gate',
    purpose: 'Outputs HIGH when at least one input is HIGH.',
    truthTable: 'A+B',
    equation: 'Y = A + B',
    ic: '7432',
    uses: 'Used for alarm and voting logic.'
  },
  xor: {
    name: 'XOR Gate',
    purpose: 'Outputs HIGH when exactly one input is HIGH.',
    truthTable: 'A ⊕ B',
    equation: 'Y = A ⊕ B',
    ic: '7486',
    uses: 'Useful in parity and adders.'
  },
  battery: {
    name: 'Battery',
    purpose: 'Provides the electrical potential difference for the circuit.',
    truthTable: 'N/A',
    equation: 'V = IR',
    ic: 'N/A',
    uses: 'Source of energy in simple circuits.'
  },
  resistor: {
    name: 'Resistor',
    purpose: 'Opposes current and controls voltage in a circuit.',
    truthTable: 'N/A',
    equation: 'V = IR',
    ic: 'N/A',
    uses: 'Used in current limiting and voltage division.'
  },
  bulb: {
    name: 'Bulb',
    purpose: 'Converts electrical energy into light and heat.',
    truthTable: 'N/A',
    equation: 'P = VI',
    ic: 'N/A',
    uses: 'Indicator and lighting.'
  }
};

export function showComponentTooltip(node, anchorEl) {
  const data = COMPONENT_EDU_DATA[node.type];
  if (!data || !anchorEl) return null;
  const existing = document.getElementById('sandbox-component-tooltip');
  if (existing) existing.remove();
  const tooltip = document.createElement('div');
  tooltip.id = 'sandbox-component-tooltip';
  tooltip.className = 'comp-tooltip';
  tooltip.innerHTML = `
    <strong>${data.name}</strong>
    <div>${data.purpose}</div>
    <div><b>Equation:</b> ${data.equation}</div>
    <div><b>IC:</b> ${data.ic}</div>
    <div><b>Uses:</b> ${data.uses}</div>
  `;
  document.body.appendChild(tooltip);
  const rect = anchorEl.getBoundingClientRect();
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.top = `${rect.top - 12}px`;
  return tooltip;
}

export function hideComponentTooltip() {
  document.getElementById('sandbox-component-tooltip')?.remove();
}

window.showComponentTooltip = showComponentTooltip;
window.hideComponentTooltip = hideComponentTooltip;
