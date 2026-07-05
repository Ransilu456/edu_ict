export const LAB_PRACTICALS = [
  {
    title: 'Ohm’s Law Investigation',
    objective: 'Observe how current changes when resistance changes.',
    instructions: ['Place a battery and resistor in series.', 'Measure the current with an ammeter.', 'Change the resistor value and note the result.'],
    observations: ['Higher resistance gives smaller current.', 'Current is proportional to voltage and inversely proportional to resistance.']
  },
  {
    title: 'Series Circuit Check',
    objective: 'See how identical components share voltage in a path.',
    instructions: ['Create a series loop with two bulbs.', 'Switch the circuit on and observe brightness.', 'Compare the behaviour with one bulb.'],
    observations: ['Each component shares the supply.', 'Brightness changes when resistance changes.']
  }
];

export function openLabMode() {
  const panel = document.getElementById('sandbox-lab-panel');
  if (!panel) return;
  panel.innerHTML = LAB_PRACTICALS.map((lab, idx) => `
    <div class="lab-card">
      <div class="lab-title">${idx + 1}. ${lab.title}</div>
      <div class="lab-objective">${lab.objective}</div>
      <ul>${lab.instructions.map(item => `<li>${item}</li>`).join('')}</ul>
      <div class="lab-observations"><strong>Expected observations</strong>${lab.observations.map(item => `<div>${item}</div>`).join('')}</div>
    </div>
  `).join('');
  panel.style.display = 'block';
}

window.openLabMode = openLabMode;
