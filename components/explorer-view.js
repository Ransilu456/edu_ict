import template from './explorer-view.html?raw';
import './explorer-view.css';

const gatesCatalog = [
  { name: 'AND', symbol: 'AND', formula: 'A • B', desc: 'Outputs 1 if both inputs are 1.', truthTable: [[0,0,0],[0,1,0],[1,0,0],[1,1,1]] },
  { name: 'OR', symbol: 'OR', formula: 'A + B', desc: 'Outputs 1 if at least one input is 1.', truthTable: [[0,0,0],[0,1,1],[1,0,1],[1,1,1]] },
  { name: 'NOT', symbol: 'NOT', formula: "A'", desc: 'Inverts the input.', truthTable: [[0,1],[1,0]] },
  { name: 'NAND', symbol: 'NAND', formula: "(A • B)'", desc: 'Inverses AND. Outputs 0 only if both inputs are 1.', truthTable: [[0,0,1],[0,1,1],[1,0,1],[1,1,0]], universal: true },
  { name: 'NOR', symbol: 'NOR', formula: "(A + B)'", desc: 'Inverses OR. Outputs 1 only if both inputs are 0.', truthTable: [[0,0,1],[0,1,0],[1,0,0],[1,1,0]], universal: true },
  { name: 'XOR', symbol: 'XOR', formula: 'A ⊕ B', desc: 'Outputs 1 if inputs are different.', truthTable: [[0,0,0],[0,1,1],[1,0,1],[1,1,0]] },
  { name: 'XNOR', symbol: 'XNOR', formula: "(A ⊕ B)'", desc: 'Outputs 1 if inputs are identical.', truthTable: [[0,0,1],[0,1,0],[1,0,0],[1,1,1]] }
];
let activeExplorerGateIdx = 0;

class ExplorerView extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;
    this.initGateExplorer();
  }

  initGateExplorer() {
    this.initExplorer();
    this.renderExplorerGate();
    
    // Wire re-render on resize
    window.addEventListener('resize', () => {
      this.drawExplorerWires();
    });

    // Expose renderExplorerGate globally so it can be triggered on nav switch
    window.renderExplorerGate = () => this.renderExplorerGate();
  }

  initExplorer() {
    const sidebar = this.querySelector('#explorer-sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = '';
    
    gatesCatalog.forEach((gate, idx) => {
      const btn = document.createElement('button');
      btn.className = `gate-card-button ${idx === activeExplorerGateIdx ? 'active' : ''}`;
      btn.innerHTML = `
        <span class="gate-card-name">${gate.name} Gate ${gate.universal ? '<span class="universal-badge" title="Universal Gate">Universal</span>' : ''}</span>
        <span class="gate-card-formula">${gate.formula}</span>
      `;
      btn.addEventListener('click', () => {
        if (window.playSound) window.playSound('click');
        activeExplorerGateIdx = idx;
        this.querySelectorAll('.gate-card-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderExplorerGate();
      });
      sidebar.appendChild(btn);
    });
  }

  renderExplorerGate() {
    const gate = gatesCatalog[activeExplorerGateIdx];
    if (!gate) return;
    
    // Render main descriptive texts
    this.querySelector('#exp-gate-title').innerText = `${gate.name} Gate Explorer`;
    this.querySelector('#exp-gate-desc').innerText = gate.desc;
    
    // Setup Simulator box HTML
    const simBox = this.querySelector('#explorer-sim-box');
    simBox.innerHTML = `
      <svg class="wires-svg" id="exp-wires-svg"></svg>
      <div class="nodes-container" style="gap: 4.5rem;">
        <div class="node-column">
          <div class="input-node-wrapper">
            <div class="node-label">A</div>
            <div class="input-node exp-input" id="exp-in-a">0</div>
          </div>
          ${gate.name !== 'NOT' ? `
          <div class="input-node-wrapper">
            <div class="node-label">B</div>
            <div class="input-node exp-input" id="exp-in-b">0</div>
          </div>
          ` : ''}
        </div>
        
        <div class="node-column">
          <div class="gate-badge" id="exp-gate-badge">${gate.symbol}</div>
        </div>
        
        <div class="node-column">
          <div class="input-node-wrapper">
            <div class="output-node" id="exp-out-y">0</div>
            <div class="node-label">Y</div>
          </div>
        </div>
      </div>
    `;
    
    // Add Explorer Inputs click hooks
    const inputs = simBox.querySelectorAll('.exp-input');
    inputs.forEach(input => {
      input.addEventListener('click', () => {
        if (window.playSound) window.playSound('toggle');
        const isActive = input.classList.toggle('active');
        input.innerText = isActive ? '1' : '0';
        this.evaluateExplorerGate();
      });
    });
    
    // Render Truth Table
    this.renderTruthTable(gate);
    
    // Render Transistor Circuit Explanation
    this.renderTransistorCircuitDetails(gate.name);
    
    // Render Universality Card for NAND / NOR
    const univCard = this.querySelector('#exp-universality-desc');
    if (univCard) {
      if (gate.universal) {
        univCard.style.display = 'block';
        if (gate.name === 'NAND') {
          univCard.innerHTML = `
            <strong style="color:var(--color-cyan);">Gate Universality: NAND Gate</strong><br>
            NAND is a <strong>universal logic gate</strong>, meaning any other boolean logic function (NOT, AND, OR, NOR, XOR, XNOR) can be implemented using <em>only</em> NAND gates:
            <ul style="margin-left:1.25rem; margin-top:0.5rem; display:flex; flex-direction:column; gap:0.35rem; font-size:0.85rem; color:var(--text-secondary);">
              <li><strong>NOT Gate:</strong> Connect both inputs of a NAND gate together: <br><code style="font-family:var(--font-mono); font-size:0.8rem; background:var(--bg-primary); padding:2px 4px; border-radius:3px; border:1px solid var(--border-color);">Y = A NAND A</code></li>
              <li><strong>AND Gate:</strong> Feed NAND into a NOT inverter configuration: <br><code style="font-family:var(--font-mono); font-size:0.8rem; background:var(--bg-primary); padding:2px 4px; border-radius:3px; border:1px solid var(--border-color);">Y = (A NAND B) NAND (A NAND B)</code></li>
              <li><strong>OR Gate:</strong> Invert both inputs first before feeding into NAND: <br><code style="font-family:var(--font-mono); font-size:0.8rem; background:var(--bg-primary); padding:2px 4px; border-radius:3px; border:1px solid var(--border-color);">Y = (A NAND A) NAND (B NAND B)</code></li>
            </ul>
          `;
        } else if (gate.name === 'NOR') {
          univCard.innerHTML = `
            <strong style="color:var(--color-cyan);">Gate Universality: NOR Gate</strong><br>
            NOR is a <strong>universal logic gate</strong>, meaning any other boolean logic function (NOT, OR, AND, NAND, XOR, XNOR) can be implemented using <em>only</em> NOR gates:
            <ul style="margin-left:1.25rem; margin-top:0.5rem; display:flex; flex-direction:column; gap:0.35rem; font-size:0.85rem; color:var(--text-secondary);">
              <li><strong>NOT Gate:</strong> Connect both inputs of a NOR gate together: <br><code style="font-family:var(--font-mono); font-size:0.8rem; background:var(--bg-primary); padding:2px 4px; border-radius:3px; border:1px solid var(--border-color);">Y = A NOR A</code></li>
              <li><strong>OR Gate:</strong> Feed NOR into a NOT inverter configuration: <br><code style="font-family:var(--font-mono); font-size:0.8rem; background:var(--bg-primary); padding:2px 4px; border-radius:3px; border:1px solid var(--border-color);">Y = (A NOR B) NOR (A NOR B)</code></li>
              <li><strong>AND Gate:</strong> Invert both inputs first before feeding into NOR: <br><code style="font-family:var(--font-mono); font-size:0.8rem; background:var(--bg-primary); padding:2px 4px; border-radius:3px; border:1px solid var(--border-color);">Y = (A NOR A) NOR (B NOR B)</code></li>
            </ul>
          `;
        }
      } else {
        univCard.style.display = 'none';
      }
    }
    
    this.evaluateExplorerGate();
  }

  evaluateExplorerGate() {
    const gate = gatesCatalog[activeExplorerGateIdx];
    const inA = this.querySelector('#exp-in-a')?.classList.contains('active') ? 1 : 0;
    const inB = this.querySelector('#exp-in-b')?.classList.contains('active') ? 1 : 0;
    
    let output = 0;
    
    switch(gate.name) {
      case 'AND': output = (inA && inB) ? 1 : 0; break;
      case 'OR': output = (inA || inB) ? 1 : 0; break;
      case 'NOT': output = inA === 1 ? 0 : 1; break;
      case 'NAND': output = !(inA && inB) ? 1 : 0; break;
      case 'NOR': output = !(inA || inB) ? 1 : 0; break;
      case 'XOR': output = (inA !== inB) ? 1 : 0; break;
      case 'XNOR': output = (inA === inB) ? 1 : 0; break;
    }
    
    const outNode = this.querySelector('#exp-out-y');
    const gateBadge = this.querySelector('#exp-gate-badge');
    
    if (outNode) {
      outNode.innerText = output;
      if (output === 1) {
        outNode.classList.add('active');
        if (gateBadge) gateBadge.classList.add('active-gate');
      } else {
        outNode.classList.remove('active');
        if (gateBadge) gateBadge.classList.remove('active-gate');
      }
    }
    
    // Update wires
    this.drawExplorerWires();
    
    // Highlight Truth Table Row matching input
    this.highlightTruthTableRow(inA, inB);
  }

  drawExplorerWires() {
    const svg = this.querySelector('#exp-wires-svg');
    if (!svg) return;
    svg.innerHTML = '';
    
    const gate = gatesCatalog[activeExplorerGateIdx];
    const gateBadge = this.querySelector('#exp-gate-badge');
    const outNode = this.querySelector('#exp-out-y');
    
    const nodeA = this.querySelector('#exp-in-a');
    if (!nodeA) return;
    const isAActive = nodeA.classList.contains('active');
    
    if (gate.name === 'NOT') {
      this.createBezierWire(svg, nodeA, gateBadge, isAActive);
    } else {
      const nodeB = this.querySelector('#exp-in-b');
      if (!nodeB) return;
      const isBActive = nodeB.classList.contains('active');
      this.createBezierWire(svg, nodeA, gateBadge, isAActive, 0.45, 0.25);
      this.createBezierWire(svg, nodeB, gateBadge, isBActive, 0.55, 0.75);
    }
    
    const isOutActive = outNode.classList.contains('active');
    this.createBezierWire(svg, gateBadge, outNode, isOutActive);
  }

  createBezierWire(svgContainer, startEl, endEl, isActive, startPctY = 0.5, endPctY = 0.5) {
    if (!startEl || !endEl) return;
    
    const containerRect = svgContainer.getBoundingClientRect();
    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();
    
    const x1 = (startRect.left + startRect.width) - containerRect.left;
    const y1 = (startRect.top + startRect.height * startPctY) - containerRect.top;
    const x2 = endRect.left - containerRect.left;
    const y2 = (endRect.top + endRect.height * endPctY) - containerRect.top;
    
    const dx = Math.abs(x2 - x1) * 0.5;
    const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.className.baseVal = isActive ? 'wire active' : 'wire';
    
    svgContainer.appendChild(path);
    
    if (isActive) {
      const pulsePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pulsePath.setAttribute('d', pathData);
      pulsePath.className.baseVal = 'wire active wire-pulse';
      svgContainer.appendChild(pulsePath);
    }
  }

  renderTruthTable(gate) {
    const table = this.querySelector('#exp-truth-table');
    if (!table) return;
    table.innerHTML = '';
    
    // Create Headers
    const headerTr = document.createElement('tr');
    if (gate.name === 'NOT') {
      headerTr.innerHTML = '<th>Input A</th><th>Output Y</th>';
    } else {
      headerTr.innerHTML = '<th>Input A</th><th>Input B</th><th>Output Y</th>';
    }
    table.appendChild(headerTr);
    
    // Create Rows
    gate.truthTable.forEach(row => {
      const tr = document.createElement('tr');
      tr.className = 'truth-table-row';
      
      if (gate.name === 'NOT') {
        const a = row[0];
        const y = row[1];
        tr.setAttribute('data-in-a', a);
        tr.innerHTML = `
          <td><span class="${a ? 'val-high' : 'val-low'}">${a}</span></td>
          <td><span class="${y ? 'val-high' : 'val-low'}">${y}</span></td>
        `;
      } else {
        const a = row[0];
        const b = row[1];
        const y = row[2];
        tr.setAttribute('data-in-a', a);
        tr.setAttribute('data-in-b', b);
        tr.innerHTML = `
          <td><span class="${a ? 'val-high' : 'val-low'}">${a}</span></td>
          <td><span class="${b ? 'val-high' : 'val-low'}">${b}</span></td>
          <td><span class="${y ? 'val-high' : 'val-low'}">${y}</span></td>
        `;
      }
      
      tr.addEventListener('click', () => {
        if (window.playSound) window.playSound('toggle');
        const inANode = this.querySelector('#exp-in-a');
        const inBNode = this.querySelector('#exp-in-b');
        
        const targetA = row[0];
        if (inANode) {
          if (targetA === 1) inANode.classList.add('active');
          else inANode.classList.remove('active');
          inANode.innerText = targetA;
        }
        
        if (gate.name !== 'NOT' && inBNode) {
          const targetB = row[1];
          if (targetB === 1) inBNode.classList.add('active');
          else inBNode.classList.remove('active');
          inBNode.innerText = targetB;
        }
        
        this.evaluateExplorerGate();
      });
      
      table.appendChild(tr);
    });
  }

  highlightTruthTableRow(inA, inB) {
    const rows = this.querySelectorAll('.truth-table-row');
    const gate = gatesCatalog[activeExplorerGateIdx];
    
    rows.forEach(row => {
      const rowA = parseInt(row.getAttribute('data-in-a'));
      
      if (gate.name === 'NOT') {
        if (rowA === inA) row.classList.add('active-row');
        else row.classList.remove('active-row');
      } else {
        const rowB = parseInt(row.getAttribute('data-in-b'));
        if (rowA === inA && rowB === inB) row.classList.add('active-row');
        else row.classList.remove('active-row');
      }
    });
  }

  renderTransistorCircuitDetails(gateName) {
    const container = this.querySelector('#exp-transistor-desc');
    if (!container) return;
    let explanation = '';
    
    switch(gateName) {
      case 'NOT':
        explanation = `<strong>Transistor Level Architecture:</strong><br>A NOT gate is built with <strong>1 Transistor</strong>. The collector pin is tied to VCC via a load resistor and serves as the Output. The input drives the base pin. When Input is 0, the transistor blocks current, leaving Output pulled High (1). When Input is 1, the transistor conducts current directly to Ground, making Output Low (0).`;
        break;
      case 'NAND':
        explanation = `<strong>Transistor Level Architecture:</strong><br>A NAND gate is built using <strong>2 Transistors in Series</strong> connected between Output and Ground. The collector is pulled High to VCC. Output is only pulled down to Ground (0) when <i>both</i> transistors are activated by high base voltages (Inputs A=1 and B=1). Otherwise, the path to ground is blocked, outputting a 1.`;
        break;
      case 'AND':
        explanation = `<strong>Transistor Level Architecture:</strong><br>An AND gate is constructed by feeding a <strong>NAND gate</strong> into a <strong>NOT gate inverter</strong> (total of 3 transistors). Alternatively, placing two transistors in series with the resistor tied to ground at the emitter creates an active high output. Output goes High (1) only when both Transistor A and Transistor B are turned ON.`;
        break;
      case 'NOR':
        explanation = `<strong>Transistor Level Architecture:</strong><br>A NOR gate is built with <strong>2 Transistors in Parallel</strong> connected between Output and Ground. If either input A OR input B is active (1), the corresponding transistor turns on and drains the output to Ground (0). Output is only 1 if both transistors remain completely shut off (Inputs A=0, B=0).`;
        break;
      case 'OR':
        explanation = `<strong>Transistor Level Architecture:</strong><br>An OR gate is constructed by feeding a <strong>NOR gate</strong> into a <strong>NOT gate inverter</strong> (total of 3 transistors). In parallel, if either transistor opens, the voltage is guided to the output terminal. It outputs 1 if Input A OR Input B (or both) are set to 1.`;
        break;
      case 'XOR':
        explanation = `<strong>Transistor Level Architecture:</strong><br>An XOR gate is a complex network, typically requiring <strong>4 Transistors</strong> in CMOS technology (or formed by combining 4 logic gates: NAND/NOR configurations). It utilizes pass-transistor logic to route the signals so that output is connected to VCC only when the inputs A and B are logical opposites.`;
        break;
      case 'XNOR':
        explanation = `<strong>Transistor Level Architecture:</strong><br>An XNOR gate is the invert of XOR. In CMOS logic, it also requires <strong>4 to 6 Transistors</strong> in a bridge network. It conducts voltage to the output terminal when inputs A and B are matching (both 0 or both 1), creating a logical equivalency checker.`;
        break;
    }
    
    container.innerHTML = explanation;
  }
}

customElements.define('explorer-view', ExplorerView);
export default ExplorerView;
