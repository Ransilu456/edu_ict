let truthDesignerRoot = null;
let truthDesignerState = { inputs: 2, outputs: 1, rows: [] };

function makeRow(inputs, outputs) {
  return { values: Array(inputs).fill(0), output: Array(outputs).fill(0) };
}

function buildRows(inputs, outputs) {
  const total = 1 << inputs;
  return Array.from({ length: total }, (_, row) => {
    const values = Array(inputs).fill(0);
    for (let i = 0; i < inputs; i++) values[i] = (row >> (inputs - 1 - i)) & 1;
    return { values, output: Array(outputs).fill(0) };
  });
}

function renderTruthDesignerModal() {
  if (!truthDesignerRoot) return;
  const inputs = truthDesignerState.inputs;
  const outputs = truthDesignerState.outputs;
  const rows = truthDesignerState.rows.length ? truthDesignerState.rows : buildRows(inputs, outputs);
  truthDesignerState.rows = rows;

  const header = ['Input'].concat(Array.from({ length: outputs }, (_, i) => `Out${i + 1}`));
  const table = document.createElement('div');
  table.className = 'truth-designer-grid';
  table.innerHTML = `
    <div class="truth-designer-header">${header.map(h => `<div>${h}</div>`).join('')}</div>
    ${rows.map((row, idx) => {
      const inputsHtml = row.values.map((bit, i) => `<button class="truth-cell truth-bit" data-row="${idx}" data-col="${i}" data-kind="input">${bit}</button>`).join('');
      const outputsHtml = row.output.map((bit, i) => `<button class="truth-cell truth-bit" data-row="${idx}" data-col="${i}" data-kind="output">${bit}</button>`).join('');
      return `<div class="truth-designer-row"><div class="truth-designer-label">${idx}</div>${inputsHtml}${outputsHtml}</div>`;
    }).join('')}
  `;

  truthDesignerRoot.innerHTML = '';
  truthDesignerRoot.appendChild(table);
  truthDesignerRoot.querySelectorAll('.truth-cell').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = Number(btn.dataset.row);
      const col = Number(btn.dataset.col);
      const kind = btn.dataset.kind;
      const target = truthDesignerState.rows[row];
      if (!target) return;
      if (kind === 'input') {
        target.values[col] = target.values[col] ? 0 : 1;
      } else {
        target.output[col] = target.output[col] ? 0 : 1;
      }
      renderTruthDesignerModal();
    });
  });
}

function openTruthTableDesigner() {
  const modal = document.getElementById('truth-table-designer-modal');
  if (!modal) return;
  truthDesignerRoot = document.getElementById('truth-table-designer-grid');
  if (!truthDesignerRoot) return;
  truthDesignerState = { inputs: 2, outputs: 1, rows: buildRows(2, 1) };
  if (!modal.dataset.bound) {
    document.getElementById('truth-designer-close-btn')?.addEventListener('click', () => { modal.style.display = 'none'; });
    document.getElementById('truth-designer-cancel-btn')?.addEventListener('click', () => { modal.style.display = 'none'; });
    document.getElementById('truth-designer-apply-btn')?.addEventListener('click', () => { applyTruthTableToSandbox(); modal.style.display = 'none'; });
    modal.addEventListener('click', (event) => {
      if (event.target === modal) modal.style.display = 'none';
    });
    modal.dataset.bound = 'true';
  }
  const inputSelect = document.getElementById('truth-input-count');
  const outputSelect = document.getElementById('truth-output-count');
  if (inputSelect) {
    inputSelect.value = String(truthDesignerState.inputs);
    inputSelect.onchange = (e) => {
      truthDesignerState.inputs = Number(e.target.value);
      truthDesignerState.rows = buildRows(truthDesignerState.inputs, truthDesignerState.outputs);
      renderTruthDesignerModal();
    };
  }
  if (outputSelect) {
    outputSelect.value = String(truthDesignerState.outputs);
    outputSelect.onchange = (e) => {
      truthDesignerState.outputs = Number(e.target.value);
      truthDesignerState.rows = buildRows(truthDesignerState.inputs, truthDesignerState.outputs);
      renderTruthDesignerModal();
    };
  }
  renderTruthDesignerModal();
  modal.style.display = 'flex';
}

function applyTruthTableToSandbox() {
  const rows = truthDesignerState.rows || [];
  const inputs = truthDesignerState.inputs;
  const outputs = truthDesignerState.outputs;
  if (!rows.length) return;
  const inputNodes = window.getSandboxInputNodes ? window.getSandboxInputNodes() : [];
  const outputNodes = window.getSandboxOutputNodes ? window.getSandboxOutputNodes() : [];
  if (inputNodes.length < inputs || outputNodes.length < outputs) {
    if (window.showAlert) window.showAlert('Add enough input/output nodes to the canvas first.', 'Truth Table Designer');
    return;
  }
  rows.forEach((row, idx) => {
    inputNodes.slice(0, inputs).forEach((node, i) => {
      node.outputState = row.values[i] || 0;
    });
    window.evaluateSandbox?.();
    outputNodes.slice(0, outputs).forEach((node, i) => {
      row.output[i] = node.outputState || 0;
    });
  });
  const summary = rows.map(row => `${row.values.join('')} → ${row.output.join('')}`).join('<br>');
  if (window.showAlert) window.showAlert(`<strong>Generated truth table summary</strong><br><br>${summary}`, 'Truth Table Designer');
}

window.openTruthTableDesigner = openTruthTableDesigner;
window.applyTruthTableToSandbox = applyTruthTableToSandbox;
export { openTruthTableDesigner, applyTruthTableToSandbox };
