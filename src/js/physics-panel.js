export function updatePhysicsPanel(panel, sandboxNodes = []) {
  if (!panel) return;
  const resistors = sandboxNodes.filter(node => node.type === 'resistor' && node.data);
  const batteries = sandboxNodes.filter(node => node.type === 'battery' && node.data);
  const active = resistors[0];
  const source = batteries[0];
  const voltage = source?.data?.emf || 9;
  const resistance = active?.data?.R || 10;
  const current = voltage / resistance;
  const power = voltage * current;
  panel.innerHTML = `
    <div class="physics-panel-card">
      <div class="physics-panel-title">Physics Snapshot</div>
      <div>V = ${voltage.toFixed(2)} V</div>
      <div>I = ${current.toFixed(2)} A</div>
      <div>R = ${resistance.toFixed(2)} Ω</div>
      <div>P = ${power.toFixed(2)} W</div>
    </div>
  `;
}

window.updatePhysicsPanel = updatePhysicsPanel;
