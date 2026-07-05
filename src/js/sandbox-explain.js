function signalLabel(value) {
  return value === 1 ? 'HIGH' : 'LOW';
}

function describeNode(node) {
  const label = node.label || node.type;
  const out = signalLabel(node.outputState || 0);
  switch (node.type) {
    case 'input':
      return `Input ${label} is currently ${out}.`;
    case 'clock':
      return `Clock ${label} is ${out} on this tick.`;
    case 'not':
      return `NOT gate ${label} outputs ${out} because its input is ${signalLabel(node.inputValues?.[0] || 0)}.`;
    case 'and':
      return `AND gate ${label} outputs ${out} when all ${node.inputsCount || 2} inputs are HIGH.`;
    case 'or':
      return `OR gate ${label} outputs ${out} because at least one input is HIGH.`;
    case 'nand':
      return `NAND gate ${label} outputs ${out} because the AND condition is ${node.inputValues?.every(v => v) ? 'true' : 'false'}.`;
    case 'nor':
      return `NOR gate ${label} outputs ${out} because no input is HIGH.`;
    case 'xor':
      return `XOR gate ${label} outputs ${out} because the input count of HIGH signals is odd.`;
    case 'xnor':
      return `XNOR gate ${label} outputs ${out} because the HIGH inputs count is even.`;
    case 'output':
      return `Output ${label} is ${out}.`;
    case 'battery':
      return `Battery ${label} is supplying ${node.data?.emf || 9}V and the output is ${out}.`;
    case 'resistor':
      return `Resistor ${label} shows ${Number(node.data?.current || 0).toFixed(2)} A and ${Number(node.data?.voltageDrop || 0).toFixed(2)} V drop.`;
    case 'bulb':
      return `Bulb ${label} is ${Number(node.data?.brightness || 0).toFixed(2)} bright.`;
    case 'switch':
      return `Switch ${label} is ${node.data?.closed ? 'closed' : 'open'}.`;
    case 'transistor':
      return `Transistor ${label} is ${node.data?.on ? 'conducting' : 'off'}.`;
    case 'led-elec':
      return `LED ${label} is ${node.data?.on ? 'ON' : 'OFF'}.`;
    default:
      return `${label} is currently ${out}.`;
  }
}

export function generateExplanations(nodes = []) {
  return nodes
    .filter(node => node && node.type !== 'text-label')
    .map((node, index) => ({
      id: node.id || `node-${index}`,
      text: describeNode(node),
      state: node.outputState || 0,
    }));
}

export function renderExplanationPanel(panel, explanations) {
  if (!panel) return;
  if (!explanations || explanations.length === 0) {
    panel.innerHTML = '<div class="sandbox-explain-empty">No active explanation yet.</div>';
    return;
  }
  panel.innerHTML = explanations.map(item => `
    <div class="sandbox-explain-item ${item.state ? 'active' : 'inactive'}">
      <span class="sandbox-explain-dot"></span>
      <span>${item.text}</span>
    </div>
  `).join('');
}

export function toggleExplanationPanel(force) {
  const panel = document.getElementById('sandbox-explain-panel');
  if (!panel) return false;
  const willShow = typeof force === 'boolean' ? force : panel.style.display !== 'block';
  panel.style.display = willShow ? 'block' : 'none';
  return willShow;
}

export function setExplanationVisibility(visible) {
  const panel = document.getElementById('sandbox-explain-panel');
  if (!panel) return;
  panel.style.display = visible ? 'block' : 'none';
}

window.toggleSandboxExplainPanel = toggleExplanationPanel;
