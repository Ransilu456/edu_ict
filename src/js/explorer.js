// ============================================================
//  LogicQuest Gate Explorer Module
// ============================================================

// Gate Explorer List
const gatesCatalog = [
  { name: "AND", symbol: "AND", formula: "A • B", desc: "Outputs 1 if both inputs are 1.", truthTable: [[0,0,0],[0,1,0],[1,0,0],[1,1,1]] },
  { name: "OR", symbol: "OR", formula: "A + B", desc: "Outputs 1 if at least one input is 1.", truthTable: [[0,0,0],[0,1,1],[1,0,1],[1,1,1]] },
  { name: "NOT", symbol: "NOT", formula: "A'", desc: "Inverts the input.", truthTable: [[0,1],[1,0]] },
  { name: "NAND", symbol: "NAND", formula: "(A • B)'", desc: "Inverses AND. Outputs 0 only if both inputs are 1.", truthTable: [[0,0,1],[0,1,1],[1,0,1],[1,1,0]], universal: true },
  { name: "NOR", symbol: "NOR", formula: "(A + B)'", desc: "Inverses OR. Outputs 1 only if both inputs are 0.", truthTable: [[0,0,1],[0,1,0],[1,0,0],[1,1,0]], universal: true },
  { name: "XOR", symbol: "XOR", formula: "A ⊕ B", desc: "Outputs 1 if inputs are different.", truthTable: [[0,0,0],[0,1,1],[1,0,1],[1,1,0]] },
  { name: "XNOR", symbol: "XNOR", formula: "(A ⊕ B)'", desc: "Outputs 1 if inputs are identical.", truthTable: [[0,0,1],[0,1,0],[1,0,0],[1,1,1]] }
];
let activeExplorerGateIdx = 0;

function initGateExplorer() {
  initExplorer();
  renderExplorerGate();
  
  // Wire re-render on resize
  window.addEventListener('resize', () => {
    drawExplorerWires();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGateExplorer);
} else {
  initGateExplorer();
}

function initExplorer() {
  const sidebar = document.getElementById("explorer-sidebar");
  if (!sidebar) return;
  sidebar.innerHTML = "";
  
  gatesCatalog.forEach((gate, idx) => {
    const btn = document.createElement("button");
    btn.className = `gate-card-button ${idx === activeExplorerGateIdx ? 'active' : ''}`;
    btn.innerHTML = `
      <span class="gate-card-name">${gate.name} Gate ${gate.universal ? '<span class="universal-badge" title="Universal Gate">Universal</span>' : ''}</span>
      <span class="gate-card-formula">${gate.formula}</span>
    `;
    btn.addEventListener("click", () => {
      window.playSound('click');
      activeExplorerGateIdx = idx;
      document.querySelectorAll(".gate-card-button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderExplorerGate();
    });
    sidebar.appendChild(btn);
  });
}

function renderExplorerGate() {
  const gate = gatesCatalog[activeExplorerGateIdx];
  if (!gate) return;
  
  // Render main descriptive texts
  document.getElementById("exp-gate-title").innerText = `${gate.name} Gate Explorer`;
  document.getElementById("exp-gate-desc").innerText = gate.desc;
  
  // Setup Simulator box HTML
  const simBox = document.getElementById("explorer-sim-box");
  simBox.innerHTML = `
    <svg class="wires-svg" id="exp-wires-svg"></svg>
    <div class="nodes-container" style="gap: 4.5rem;">
      <div class="node-column">
        <div class="input-node-wrapper">
          <div class="node-label">A</div>
          <div class="input-node exp-input" id="exp-in-a">0</div>
        </div>
        ${gate.name !== "NOT" ? `
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
  const inputs = simBox.querySelectorAll(".exp-input");
  inputs.forEach(input => {
    input.addEventListener("click", () => {
      window.playSound('toggle');
      const isActive = input.classList.toggle("active");
      input.innerText = isActive ? "1" : "0";
      evaluateExplorerGate();
    });
  });
  
  // Render Truth Table
  renderTruthTable(gate);
  
  // Render Transistor Circuit Explanation
  renderTransistorCircuitDetails(gate.name);
  
  // Render Universality Card for NAND / NOR
  const univCard = document.getElementById("exp-universality-desc");
  if (univCard) {
    if (gate.universal) {
      univCard.style.display = "block";
      if (gate.name === "NAND") {
        univCard.innerHTML = `
          <strong style="color:var(--color-cyan);">Gate Universality: NAND Gate</strong><br>
          NAND is a <strong>universal logic gate</strong>, meaning any other boolean logic function (NOT, AND, OR, NOR, XOR, XNOR) can be implemented using <em>only</em> NAND gates:
          <ul style="margin-left:1.25rem; margin-top:0.5rem; display:flex; flex-direction:column; gap:0.35rem; font-size:0.85rem; color:var(--text-secondary);">
            <li><strong>NOT Gate:</strong> Connect both inputs of a NAND gate together: <br><code style="font-family:var(--font-mono); font-size:0.8rem; background:var(--bg-primary); padding:2px 4px; border-radius:3px; border:1px solid var(--border-color);">Y = A NAND A</code></li>
            <li><strong>AND Gate:</strong> Feed NAND into a NOT inverter configuration: <br><code style="font-family:var(--font-mono); font-size:0.8rem; background:var(--bg-primary); padding:2px 4px; border-radius:3px; border:1px solid var(--border-color);">Y = (A NAND B) NAND (A NAND B)</code></li>
            <li><strong>OR Gate:</strong> Invert both inputs first before feeding into NAND: <br><code style="font-family:var(--font-mono); font-size:0.8rem; background:var(--bg-primary); padding:2px 4px; border-radius:3px; border:1px solid var(--border-color);">Y = (A NAND A) NAND (B NAND B)</code></li>
          </ul>
        `;
      } else if (gate.name === "NOR") {
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
      univCard.style.display = "none";
    }
  }
  
  evaluateExplorerGate();
}

function evaluateExplorerGate() {
  const gate = gatesCatalog[activeExplorerGateIdx];
  const inA = document.getElementById("exp-in-a")?.classList.contains("active") ? 1 : 0;
  const inB = document.getElementById("exp-in-b")?.classList.contains("active") ? 1 : 0;
  
  let output = 0;
  
  switch(gate.name) {
    case "AND": output = (inA && inB) ? 1 : 0; break;
    case "OR": output = (inA || inB) ? 1 : 0; break;
    case "NOT": output = inA === 1 ? 0 : 1; break;
    case "NAND": output = !(inA && inB) ? 1 : 0; break;
    case "NOR": output = !(inA || inB) ? 1 : 0; break;
    case "XOR": output = (inA !== inB) ? 1 : 0; break;
    case "XNOR": output = (inA === inB) ? 1 : 0; break;
  }
  
  const outNode = document.getElementById("exp-out-y");
  const gateBadge = document.getElementById("exp-gate-badge");
  
  if (outNode) {
    outNode.innerText = output;
    if (output === 1) {
      outNode.classList.add("active");
      if (gateBadge) gateBadge.classList.add("active-gate");
    } else {
      outNode.classList.remove("active");
      if (gateBadge) gateBadge.classList.remove("active-gate");
    }
  }
  
  // Update wires
  drawExplorerWires();
  
  // Highlight Truth Table Row matching input
  highlightTruthTableRow(inA, inB);
}

function drawExplorerWires() {
  const svg = document.getElementById("exp-wires-svg");
  if (!svg) return;
  svg.innerHTML = "";
  
  const gate = gatesCatalog[activeExplorerGateIdx];
  const gateBadge = document.getElementById("exp-gate-badge");
  const outNode = document.getElementById("exp-out-y");
  
  const nodeA = document.getElementById("exp-in-a");
  if (!nodeA) return;
  const isAActive = nodeA.classList.contains("active");
  
  if (gate.name === "NOT") {
    createBezierWire(svg, nodeA, gateBadge, isAActive);
  } else {
    const nodeB = document.getElementById("exp-in-b");
    if (!nodeB) return;
    const isBActive = nodeB.classList.contains("active");
    createBezierWire(svg, nodeA, gateBadge, isAActive, 0.45, 0.25);
    createBezierWire(svg, nodeB, gateBadge, isBActive, 0.55, 0.75);
  }
  
  const isOutActive = outNode.classList.contains("active");
  createBezierWire(svg, gateBadge, outNode, isOutActive);
}

function createBezierWire(svgContainer, startEl, endEl, isActive, startPctY = 0.5, endPctY = 0.5) {
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
  
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);
  path.className.baseVal = isActive ? "wire active" : "wire";
  
  svgContainer.appendChild(path);
  
  if (isActive) {
    const pulsePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pulsePath.setAttribute("d", pathData);
    pulsePath.className.baseVal = "wire active wire-pulse";
    svgContainer.appendChild(pulsePath);
  }
}

function renderTruthTable(gate) {
  const table = document.getElementById("exp-truth-table");
  if (!table) return;
  table.innerHTML = "";
  
  // Create Headers
  const headerTr = document.createElement("tr");
  if (gate.name === "NOT") {
    headerTr.innerHTML = "<th>Input A</th><th>Output Y</th>";
  } else {
    headerTr.innerHTML = "<th>Input A</th><th>Input B</th><th>Output Y</th>";
  }
  table.appendChild(headerTr);
  
  // Create Rows
  gate.truthTable.forEach(row => {
    const tr = document.createElement("tr");
    tr.className = "truth-table-row";
    
    if (gate.name === "NOT") {
      const a = row[0];
      const y = row[1];
      tr.setAttribute("data-in-a", a);
      tr.innerHTML = `
        <td><span class="${a ? 'val-high' : 'val-low'}">${a}</span></td>
        <td><span class="${y ? 'val-high' : 'val-low'}">${y}</span></td>
      `;
    } else {
      const a = row[0];
      const b = row[1];
      const y = row[2];
      tr.setAttribute("data-in-a", a);
      tr.setAttribute("data-in-b", b);
      tr.innerHTML = `
        <td><span class="${a ? 'val-high' : 'val-low'}">${a}</span></td>
        <td><span class="${b ? 'val-high' : 'val-low'}">${b}</span></td>
        <td><span class="${y ? 'val-high' : 'val-low'}">${y}</span></td>
      `;
    }
    
    tr.addEventListener("click", () => {
      window.playSound('toggle');
      const inANode = document.getElementById("exp-in-a");
      const inBNode = document.getElementById("exp-in-b");
      
      const targetA = row[0];
      if (inANode) {
        if (targetA === 1) inANode.classList.add("active");
        else inANode.classList.remove("active");
        inANode.innerText = targetA;
      }
      
      if (gate.name !== "NOT" && inBNode) {
        const targetB = row[1];
        if (targetB === 1) inBNode.classList.add("active");
        else inBNode.classList.remove("active");
        inBNode.innerText = targetB;
      }
      
      evaluateExplorerGate();
    });
    
    table.appendChild(tr);
  });
}

function highlightTruthTableRow(inA, inB) {
  const rows = document.querySelectorAll(".truth-table-row");
  const gate = gatesCatalog[activeExplorerGateIdx];
  
  rows.forEach(row => {
    const rowA = parseInt(row.getAttribute("data-in-a"));
    
    if (gate.name === "NOT") {
      if (rowA === inA) row.classList.add("active-row");
      else row.classList.remove("active-row");
    } else {
      const rowB = parseInt(row.getAttribute("data-in-b"));
      if (rowA === inA && rowB === inB) row.classList.add("active-row");
      else row.classList.remove("active-row");
    }
  });
}

function renderTransistorCircuitDetails(gateName) {
  const container = document.getElementById("exp-transistor-desc");
  if (!container) return;
  let explanation = "";
  
  switch(gateName) {
    case "NOT":
      explanation = `<strong>Transistor Level Architecture:</strong><br>A NOT gate is built with <strong>1 Transistor</strong>. The collector pin is tied to VCC via a load resistor and serves as the Output. The input drives the base pin. When Input is 0, the transistor blocks current, leaving Output pulled High (1). When Input is 1, the transistor conducts current directly to Ground, making Output Low (0).`;
      break;
    case "NAND":
      explanation = `<strong>Transistor Level Architecture:</strong><br>A NAND gate is built using <strong>2 Transistors in Series</strong> connected between Output and Ground. The collector is pulled High to VCC. Output is only pulled down to Ground (0) when <i>both</i> transistors are activated by high base voltages (Inputs A=1 and B=1). Otherwise, the path to ground is blocked, outputting a 1.`;
      break;
    case "AND":
      explanation = `<strong>Transistor Level Architecture:</strong><br>An AND gate is constructed by feeding a <strong>NAND gate</strong> into a <strong>NOT gate inverter</strong> (total of 3 transistors). Alternatively, placing two transistors in series with the resistor tied to ground at the emitter creates an active high output. Output goes High (1) only when both Transistor A and Transistor B are turned ON.`;
      break;
    case "NOR":
      explanation = `<strong>Transistor Level Architecture:</strong><br>A NOR gate is built with <strong>2 Transistors in Parallel</strong> connected between Output and Ground. If either input A OR input B is active (1), the corresponding transistor turns on and drains the output to Ground (0). Output is only 1 if both transistors remain completely shut off (Inputs A=0, B=0).`;
      break;
    case "OR":
      explanation = `<strong>Transistor Level Architecture:</strong><br>An OR gate is constructed by feeding a <strong>NOR gate</strong> into a <strong>NOT gate inverter</strong> (total of 3 transistors). In parallel, if either transistor opens, the voltage is guided to the output terminal. It outputs 1 if Input A OR Input B (or both) are set to 1.`;
      break;
    case "XOR":
      explanation = `<strong>Transistor Level Architecture:</strong><br>An XOR gate is a complex network, typically requiring <strong>4 Transistors</strong> in CMOS technology (or formed by combining 4 logic gates: NAND/NOR configurations). It utilizes pass-transistor logic to route the signals so that output is connected to VCC only when the inputs A and B are logical opposites.`;
      break;
    case "XNOR":
      explanation = `<strong>Transistor Level Architecture:</strong><br>An XNOR gate is the invert of XOR. In CMOS logic, it also requires <strong>4 to 6 Transistors</strong> in a bridge network. It conducts voltage to the output terminal when inputs A and B are matching (both 0 or both 1), creating a logical equivalency checker.`;
      break;
  }
  
  container.innerHTML = explanation;
}

window.renderExplorerGate = renderExplorerGate;
