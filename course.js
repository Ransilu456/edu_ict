// ============================================================
//  LogicQuest Guided Course Module
// ============================================================

// Course Level Data
const lessons = [
  {
    id: 0,
    title: "The Binary Code",
    text: "Everything inside a computer is computed with just <strong>1</strong>s and <strong>0</strong>s. We represent these states as High voltage (1, or 5V) and Low voltage (0, or Ground). Toggle the switch below to light up the bulb!",
    type: "binary-bulb",
    quiz: {
      question: "Which of the following describes how a computer represents a '1' state electrically?",
      options: [
        "A high voltage level (typically 5 Volts or 3.3 Volts)",
        "A low voltage level connected directly to the electrical Ground (0 Volts)",
        "A constant mechanical oscillation inside the transistor's vacuum chamber",
        "A random fluctuation of copper wire molecules"
      ],
      correctIndex: 0,
      explanation: "Excellent! In digital logic, we map logic '1' to high voltage (VCC) and logic '0' to low voltage (Ground/0V) so we can process information using electronics."
    }
  },
  {
    id: 1,
    title: "The Transistor Switch",
    text: "How do we build switches that control other switches? The answer is the <strong>Transistor</strong>. In an NPN Transistor, applying voltage (1) to the central <strong>Base (B)</strong> creates an path allowing current to flow from the top <strong>Collector (C)</strong> to the bottom <strong>Emitter (E)</strong>. Try switching the Base input on!",
    type: "transistor-npn",
    quiz: {
      question: "If we apply a voltage of 0 (Ground) to the base of an NPN transistor, what happens to the collector-to-emitter path?",
      options: [
        "The transistor path remains closed, blocking the flow of electricity",
        "The path opens, allowing maximum electricity to flow freely",
        "The transistor explodes from thermal energy overload",
        "The path automatically toggles between open and closed at 60Hz frequency"
      ],
      correctIndex: 0,
      explanation: "Correct! When the base voltage is 0, the transistor behaves like an open switch (high resistance), blocking current from flowing between the collector and emitter."
    }
  },
  {
    id: 2,
    title: "The NOT Gate (Inverter)",
    text: "By attaching a resistor from VCC to the output, we can use a transistor to reverse a signal. This is a <strong>NOT Gate</strong>. When the input is 0, the transistor is OFF, leaving the output pulled High (1). When input is 1, the transistor turns ON, sucking all current to ground and outputting 0.",
    type: "gate-not",
    quiz: {
      question: "What is the output of a NOT Gate if its input is 0?",
      options: [
        "0 (Low)",
        "1 (High)",
        "Floating / Tri-state",
        "Alternating back and forth"
      ],
      correctIndex: 1,
      explanation: "That's it! A NOT Gate invert its input. A 0 input results in a 1 output."
    }
  },
  {
    id: 3,
    title: "The AND Gate",
    text: "An <strong>AND Gate</strong> is a gate that outputs 1 <i>only</i> when <strong>both</strong> inputs are 1. If either input is 0, the output remains 0. Toggle both inputs below to verify this rule!",
    type: "gate-and",
    quiz: {
      question: "Under what condition will an AND Gate output a 1?",
      options: [
        "When at least one of its inputs is 1",
        "When both inputs are 1",
        "When both inputs are 0",
        "When the inputs are different"
      ],
      correctIndex: 1,
      explanation: "Spot on! The AND Gate requires both Input A AND Input B to be high (1) to output a high signal (1)."
    }
  },
  {
    id: 4,
    title: "The OR Gate",
    text: "An <strong>OR Gate</strong> is more permissive. It outputs 1 if <strong>one or both</strong> inputs are 1. The only way it outputs 0 is if both inputs are set to 0. Click the inputs to test it!",
    type: "gate-or",
    quiz: {
      question: "If Input A is 1 and Input B is 0, what is the output of an OR Gate?",
      options: [
        "0",
        "1",
        "It fluctuates dynamically",
        "We cannot determine without the clock speed"
      ],
      correctIndex: 1,
      explanation: "Correct! Since at least one of the inputs (A) is 1, the OR Gate outputs 1."
    }
  },
  {
    id: 5,
    title: "The XOR Gate (Exclusive OR)",
    text: "The <strong>XOR Gate</strong> outputs 1 only when the inputs are <strong>different</strong> (one is 1, the other is 0). If the inputs are the same (both 0 or both 1), the output is 0. XOR is the secret key to binary addition!",
    type: "gate-xor",
    quiz: {
      question: "What is the output of an XOR Gate if both inputs are set to 1?",
      options: [
        "1",
        "0",
        "2",
        "High Impedance"
      ],
      correctIndex: 1,
      explanation: "Perfect! XOR stands for Exclusive OR. It is exclusive, so if both inputs are active (1), the output drops to 0."
    }
  },
  {
    id: 6,
    title: "Adding Bits (Half Adder)",
    text: "How do computers calculate numbers? By combining logic gates! A <strong>Half Adder</strong> adds two single bits (A and B). It produces a <strong>Sum (S)</strong> bit using an XOR Gate, and a <strong>Carry (C)</strong> bit using an AND Gate (for when both inputs are 1, e.g. 1+1 = 10, which means Sum=0, Carry=1). Try adding inputs A and B!",
    type: "half-adder",
    quiz: {
      question: "If A = 1 and B = 1, what are the Sum (S) and Carry (C) outputs of a Half Adder?",
      options: [
        "Sum = 1, Carry = 0",
        "Sum = 0, Carry = 1",
        "Sum = 1, Carry = 1",
        "Sum = 0, Carry = 0"
      ],
      correctIndex: 1,
      explanation: "Yes! 1 + 1 in binary is 10 (decimal 2). The Sum digit is 0, and the Carry-out digit is 1."
    }
  },
  {
    id: 7,
    title: "The Full Adder",
    text: "A Half Adder can't handle a carry from a previous addition. To chain adders, we need a <strong>Full Adder</strong>. It adds three inputs: A, B, and a <strong>Carry In (Cin)</strong>. It is built using two Half Adders and an OR Gate to output a <strong>Sum (S)</strong> and a <strong>Carry Out (Cout)</strong>.",
    type: "full-adder",
    quiz: {
      question: "If A = 1, B = 0, and Carry In (Cin) = 1, what is the output of the Full Adder?",
      options: [
        "Sum = 0, Carry Out = 1",
        "Sum = 1, Carry Out = 0",
        "Sum = 1, Carry Out = 1",
        "Sum = 0, Carry Out = 0"
      ],
      correctIndex: 0,
      explanation: "Perfect addition! 1 + 0 + 1 (Carry In) equals 2. In binary, that is 10, meaning Sum = 0 and Carry Out = 1."
    }
  },
  {
    id: 8,
    title: "Master of Logic!",
    text: "Incredible! You have built your understanding from physical silicon transistors up to full arithmetic circuits. You now understand the basic building blocks of modern computer processors. You can now build your own custom circuits in the <strong>Sandbox Circuit Builder</strong>!",
    type: "course-complete",
    quiz: {
      question: "What is the core physical building block that makes logic gates possible in computer chips?",
      options: [
        "Silicon Transistors",
        "Resistor grids",
        "Capacitor lines",
        "Vacuum tubes"
      ],
      correctIndex: 0,
      explanation: "Exactly! Silicon transistors act as electronic switches, combining to form logic gates, which combine to form adders and microprocessors. Congratulations!"
    }
  }
];

let currentLessonIdx = parseInt(localStorage.getItem('logicQuest_step')) || 0;
if (currentLessonIdx >= lessons.length) currentLessonIdx = 0;
let selectedOptionIdx = null;
let quizSubmitted = false;

function initCourse() {
  initLessonSelect();
  renderLesson();
  
  // Wire back to map button
  const backBtn = document.getElementById('back-to-map-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (window.playSound) window.playSound('click');
      if (window.navigateToView) window.navigateToView('course-map-view');
    });
  }
  
  // Wire re-render on resize
  window.addEventListener('resize', () => {
    drawCourseWires();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCourse);
} else {
  initCourse();
}

window.onRestartCourseProgression = () => {
  currentLessonIdx = 0;
  localStorage.setItem('logicQuest_step', 0);
  renderLesson();
};

window.loadLesson = (idx) => {
  currentLessonIdx = idx;
  localStorage.setItem('logicQuest_step', idx);
  if (window.updateXPDisplay) window.updateXPDisplay();
  renderLesson();
};

function initLessonSelect() {
  const lessonSelect = document.getElementById("lesson-select");
  if (lessonSelect) {
    lessonSelect.innerHTML = "";
    lessons.forEach((l, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.innerText = `${idx + 1}. ${l.title}`;
      lessonSelect.appendChild(opt);
    });
    lessonSelect.value = currentLessonIdx;
    lessonSelect.addEventListener("change", (e) => {
      window.playSound('click');
      currentLessonIdx = parseInt(e.target.value);
      localStorage.setItem('logicQuest_step', currentLessonIdx);
      if (window.updateXPDisplay) window.updateXPDisplay();
      renderLesson();
    });
  }
}

function renderLesson() {
  const lesson = lessons[currentLessonIdx];
  selectedOptionIdx = null;
  quizSubmitted = false;
  
  const lessonSelect = document.getElementById("lesson-select");
  if (lessonSelect) {
    lessonSelect.value = currentLessonIdx;
  }
  
  // Progress tracker updates
  const track = document.getElementById("course-progress");
  if (track) {
    track.innerHTML = "";
    lessons.forEach((l, idx) => {
      const step = document.createElement("div");
      step.className = "progress-step";
      if (idx < currentLessonIdx) step.classList.add("completed");
      if (idx === currentLessonIdx) step.classList.add("active");
      track.appendChild(step);
    });
  }
  
  // Score indicator
  if (window.updateXPDisplay) window.updateXPDisplay();
  
  // Render Left Card Texts
  document.getElementById("lesson-title").innerHTML = lesson.title;
  document.getElementById("lesson-text").innerHTML = lesson.text;
  
  // Render Quiz Choices
  const quizContainer = document.getElementById("quiz-options");
  quizContainer.innerHTML = "";
  
  lesson.quiz.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.innerHTML = `
      <span class="quiz-option-letter">${String.fromCharCode(65 + idx)}</span>
      <span class="quiz-option-text">${opt}</span>
    `;
    btn.addEventListener("click", () => selectQuizOption(idx));
    quizContainer.appendChild(btn);
  });
  
  // Reset Feedback and CTA Button
  const feedback = document.getElementById("quiz-feedback");
  feedback.className = "feedback-alert";
  feedback.innerHTML = "";
  
  const ctaBtn = document.getElementById("cta-btn");
  ctaBtn.innerText = "Check Answer";
  ctaBtn.disabled = true;
  
  // Load Visual Simulation (Right Pane)
  renderVisualSimulation(lesson.type);
}

function selectQuizOption(idx) {
  if (quizSubmitted) return;
  
  window.playSound('click');
  selectedOptionIdx = idx;
  
  const options = document.querySelectorAll(".quiz-option");
  options.forEach((opt, index) => {
    if (index === idx) opt.classList.add("selected");
    else opt.classList.remove("selected");
  });
  
  document.getElementById("cta-btn").disabled = false;
}

// CTA Click: Check or Advance
document.getElementById("cta-btn").addEventListener("click", () => {
  const lesson = lessons[currentLessonIdx];
  const ctaBtn = document.getElementById("cta-btn");
  
  if (!quizSubmitted) {
    // Validate answer
    quizSubmitted = true;
    const isCorrect = selectedOptionIdx === lesson.quiz.correctIndex;
    const feedback = document.getElementById("quiz-feedback");
    
    // Disable inputs
    document.querySelectorAll(".quiz-option").forEach((opt, index) => {
      opt.classList.add("disabled");
      if (index === lesson.quiz.correctIndex) {
        opt.classList.add("correct");
      } else if (index === selectedOptionIdx) {
        opt.classList.add("incorrect");
      }
    });
    
    if (isCorrect) {
      window.playSound('success');
      feedback.className = "feedback-alert success";
      feedback.innerHTML = `<strong>Correct!</strong> ${lesson.quiz.explanation}`;
      
      if (currentLessonIdx === lessons.length - 1) {
        ctaBtn.innerText = "Finish Course";
      } else {
        ctaBtn.innerText = "Continue";
      }
      
      // Mark step progress
      const steps = document.querySelectorAll(".progress-step");
      if (steps[currentLessonIdx]) {
        steps[currentLessonIdx].classList.add("completed");
      }
    } else {
      window.playSound('error');
      feedback.className = "feedback-alert error";
      feedback.innerHTML = `<strong>Not quite.</strong> Let's try again! Verify the simulation inputs and try selecting another answer.`;
      ctaBtn.innerText = "Retry Lesson";
    }
  } else {
    const feedback = document.getElementById("quiz-feedback");
    if (feedback.classList.contains("success")) {
      // Mark lesson as complete
      if (window.markLessonComplete) {
        window.markLessonComplete(currentLessonIdx);
      }
      
      if (currentLessonIdx === lessons.length - 1) {
        showSuccessModal();
      } else {
        currentLessonIdx++;
        localStorage.setItem('logicQuest_step', currentLessonIdx);
        if (window.updateXPDisplay) window.updateXPDisplay();
        if (window.renderCourseMap) window.renderCourseMap();
        renderLesson();
      }
    } else {
      renderLesson();
    }
  }
});

// Render Visual Simulation in Right Pane based on type
function renderVisualSimulation(type) {
  const rightPane = document.getElementById("course-sim-container");
  if (!rightPane) return;
  rightPane.innerHTML = "";
  
  let html = "";
  
  if (type === "binary-bulb") {
    html = `
      <div class="lightbulb-component">
        <svg class="lightbulb-svg" viewBox="0 0 100 100" id="bulb-graphic">
          <circle cx="50" cy="40" r="28" class="glow" stroke="#475569" stroke-width="2"/>
          <path d="M35 62 C35 70, 42 75, 50 75 C58 75, 65 70, 65 62" fill="none" stroke="#475569" stroke-width="2"/>
          <rect x="42" y="75" width="16" height="8" rx="2" fill="#64748b"/>
          <rect x="44" y="83" width="12" height="4" fill="#334155"/>
          <path d="M43 62 L48 45 L52 45 L57 62" fill="none" stroke="#64748b" stroke-width="2"/>
        </svg>
        <div class="voltage-line" id="bulb-voltage-label">State: 0 (0V)</div>
        
        <div class="input-node-wrapper" style="margin-top: 1rem;">
          <div class="node-label">INPUT</div>
          <div class="input-node" id="bulb-switch">0</div>
        </div>
      </div>
    `;
    rightPane.innerHTML = html;
    
    const bulbSwitch = document.getElementById("bulb-switch");
    const bulbGraphic = document.getElementById("bulb-graphic");
    const voltageLabel = document.getElementById("bulb-voltage-label");
    
    bulbSwitch.addEventListener("click", () => {
      window.playSound('toggle');
      const isOn = bulbSwitch.classList.toggle("active");
      bulbSwitch.innerText = isOn ? "1" : "0";
      
      if (isOn) {
        bulbGraphic.classList.add("lit");
        voltageLabel.innerText = "State: 1 (5V)";
        voltageLabel.classList.add("high");
      } else {
        bulbGraphic.classList.remove("lit");
        voltageLabel.innerText = "State: 0 (0V)";
        voltageLabel.classList.remove("high");
      }
    });
    
  } else if (type === "transistor-npn") {
    html = `
      <div class="transistor-component">
        <div class="transistor-schematic">
          <svg viewBox="0 0 300 250">
            <text x="120" y="30" fill="#94a3b8" font-family="Outfit" font-weight="700">COLLECTOR (C)</text>
            <text x="20" y="130" fill="#94a3b8" font-family="Outfit" font-weight="700">BASE (B)</text>
            <text x="125" y="235" fill="#94a3b8" font-family="Outfit" font-weight="700">EMITTER (E)</text>
            
            <path id="collector-line" d="M150 40 L150 100" fill="none" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
            <path id="base-line" d="M80 125 L135 125" fill="none" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
            <path id="emitter-line" d="M150 150 L150 215" fill="none" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
            <line id="npn-gate" x1="150" y1="100" x2="150" y2="150" stroke="#475569" stroke-width="6" class="npn-gate-switch" stroke-linecap="round"/>
            <path d="M150 40 L150 215" fill="none" id="electron-path" stroke="none"/>
          </svg>
        </div>
        
        <div style="display: flex; gap: 2rem; width: 100%; margin-top: 1rem;">
          <div class="input-node-wrapper" style="flex: 1; justify-content: center;">
            <div class="node-label">BASE</div>
            <div class="input-node" id="trans-base">0</div>
          </div>
          <div class="input-node-wrapper" style="flex: 1; justify-content: center;">
            <div class="node-label" style="font-size: 0.9rem;">PATH</div>
            <div class="output-node" id="trans-path-out">0</div>
          </div>
        </div>
        
        <div class="transistor-label" id="trans-state-text">Transistor is: BLOCKED</div>
      </div>
    `;
    rightPane.innerHTML = html;
    
    const baseNode = document.getElementById("trans-base");
    const outNode = document.getElementById("trans-path-out");
    const container = document.querySelector(".transistor-component");
    const stateText = document.getElementById("trans-state-text");
    const cLine = document.getElementById("collector-line");
    const bLine = document.getElementById("base-line");
    const eLine = document.getElementById("emitter-line");
    const gateLine = document.getElementById("npn-gate");
    
    baseNode.addEventListener("click", () => {
      window.playSound('toggle');
      const isOn = baseNode.classList.toggle("active");
      baseNode.innerText = isOn ? "1" : "0";
      
      if (isOn) {
        container.classList.add("transistor-active");
        outNode.classList.add("active");
        outNode.innerText = "1";
        stateText.innerText = "Transistor is: CONDUCTING (ON)";
        stateText.style.color = "var(--color-indigo)";
        
        cLine.setAttribute("stroke", "var(--color-high)");
        bLine.setAttribute("stroke", "var(--color-high)");
        eLine.setAttribute("stroke", "var(--color-high)");
        gateLine.setAttribute("stroke", "var(--color-high)");
      } else {
        container.classList.remove("transistor-active");
        outNode.classList.remove("active");
        outNode.innerText = "0";
        stateText.innerText = "Transistor is: BLOCKED (OFF)";
        stateText.style.color = "var(--text-secondary)";
        
        cLine.setAttribute("stroke", "var(--color-low)");
        bLine.setAttribute("stroke", "var(--color-low)");
        eLine.setAttribute("stroke", "var(--color-low)");
        gateLine.setAttribute("stroke", "var(--color-low)");
      }
    });
    
  } else if (type === "gate-not" || type === "gate-and" || type === "gate-or" || type === "gate-xor") {
    const isSingleInput = (type === "gate-not");
    let gateName = type.replace("gate-", "").toUpperCase();
    
    html = `
      <div class="simulation-canvas" id="course-canvas">
        <svg class="wires-svg" id="course-wires-svg"></svg>
        
        <div class="nodes-container">
          <div class="node-column">
            <div class="input-node-wrapper">
              <div class="node-label">A</div>
              <div class="input-node course-input" id="node-in-a" data-port="a">0</div>
            </div>
            ${!isSingleInput ? `
            <div class="input-node-wrapper">
              <div class="node-label">B</div>
              <div class="input-node course-input" id="node-in-b" data-port="b">0</div>
            </div>
            ` : ''}
          </div>
          
          <div class="node-column">
            <div class="gate-badge" id="course-gate-badge">${gateName}</div>
          </div>
          
          <div class="node-column">
            <div class="input-node-wrapper">
              <div class="output-node" id="node-out-y">0</div>
              <div class="node-label">Y</div>
            </div>
          </div>
        </div>
      </div>
    `;
    rightPane.innerHTML = html;
    
    const inputs = document.querySelectorAll(".course-input");
    inputs.forEach(input => {
      input.addEventListener("click", () => {
        window.playSound('toggle');
        const isActive = input.classList.toggle("active");
        input.innerText = isActive ? "1" : "0";
        evaluateBasicGate(type);
      });
    });
    
    evaluateBasicGate(type);
    setTimeout(drawCourseWires, 30);
    
  } else if (type === "half-adder") {
    html = `
      <div class="simulation-canvas" id="course-canvas">
        <svg class="wires-svg" id="course-wires-svg"></svg>
        
        <div class="nodes-container" style="gap: 4rem;">
          <div class="node-column" style="gap: 5rem;">
            <div class="input-node-wrapper">
              <div class="node-label">A</div>
              <div class="input-node course-input" id="node-in-a" data-port="a">0</div>
            </div>
            <div class="input-node-wrapper">
              <div class="node-label">B</div>
              <div class="input-node course-input" id="node-in-b" data-port="b">0</div>
            </div>
          </div>
          
          <div class="node-column" style="gap: 3rem;">
            <div class="gate-badge" id="adder-gate-xor" style="padding: 1rem 1.8rem; font-size: 1.1rem;">XOR</div>
            <div class="gate-badge" id="adder-gate-and" style="padding: 1rem 1.8rem; font-size: 1.1rem;">AND</div>
          </div>
          
          <div class="node-column" style="gap: 5rem;">
            <div class="input-node-wrapper">
              <div class="output-node" id="node-out-sum">0</div>
              <div class="node-label">SUM (S)</div>
            </div>
            <div class="input-node-wrapper">
              <div class="output-node" id="node-out-carry">0</div>
              <div class="node-label">CARRY (C)</div>
            </div>
          </div>
        </div>
      </div>
    `;
    rightPane.innerHTML = html;
    
    const inputs = document.querySelectorAll(".course-input");
    inputs.forEach(input => {
      input.addEventListener("click", () => {
        window.playSound('toggle');
        const isActive = input.classList.toggle("active");
        input.innerText = isActive ? "1" : "0";
        evaluateHalfAdder();
      });
    });
    
    evaluateHalfAdder();
    setTimeout(drawCourseWires, 30);
    
  } else if (type === "full-adder") {
    html = `
      <div class="simulation-canvas" id="course-canvas" style="flex-direction: column; justify-content: center; gap: 2rem;">
        <svg class="wires-svg" id="course-wires-svg"></svg>
        
        <div class="nodes-container" style="gap: 2.5rem;">
          <div class="node-column" style="gap: 2.5rem;">
            <div class="input-node-wrapper">
              <div class="node-label">A</div>
              <div class="input-node course-input" id="node-in-a" data-port="a">0</div>
            </div>
            <div class="input-node-wrapper">
              <div class="node-label">B</div>
              <div class="input-node course-input" id="node-in-b" data-port="b">0</div>
            </div>
            <div class="input-node-wrapper">
              <div class="node-label">Cin</div>
              <div class="input-node course-input" id="node-in-cin" data-port="cin">0</div>
            </div>
          </div>
          
          <div class="node-column" style="gap: 1.5rem;">
            <div class="gate-badge" id="fa-xor1" style="padding: 0.6rem 1.2rem; font-size: 0.9rem;">XOR 1</div>
            <div class="gate-badge" id="fa-and1" style="padding: 0.6rem 1.2rem; font-size: 0.9rem;">AND 1</div>
            <div class="gate-badge" id="fa-xor2" style="padding: 0.6rem 1.2rem; font-size: 0.9rem;">XOR 2</div>
            <div class="gate-badge" id="fa-and2" style="padding: 0.6rem 1.2rem; font-size: 0.9rem;">AND 2</div>
            <div class="gate-badge" id="fa-or" style="padding: 0.6rem 1.2rem; font-size: 0.9rem;">OR</div>
          </div>
          
          <div class="node-column" style="gap: 4rem;">
            <div class="input-node-wrapper">
              <div class="output-node" id="node-out-sum">0</div>
              <div class="node-label">SUM (S)</div>
            </div>
            <div class="input-node-wrapper">
              <div class="output-node" id="node-out-cout">0</div>
              <div class="node-label">COUT (C)</div>
            </div>
          </div>
        </div>
      </div>
    `;
    rightPane.innerHTML = html;
    
    const inputs = document.querySelectorAll(".course-input");
    inputs.forEach(input => {
      input.addEventListener("click", () => {
        window.playSound('toggle');
        const isActive = input.classList.toggle("active");
        input.innerText = isActive ? "1" : "0";
        evaluateFullAdder();
      });
    });
    
    evaluateFullAdder();
    setTimeout(drawCourseWires, 30);
    
  } else if (type === "course-complete") {
    html = `
      <div style="text-align: center; max-width: 400px; padding: 2rem;">
        <div class="success-icon" style="width: 100px; height: 100px; margin-bottom: 2rem; background: var(--bg-tertiary);">
          <svg viewBox="0 0 24 24" width="50" height="50" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <h2 style="font-family: var(--font-header); font-size: 2.2rem; margin-bottom: 1rem;">You Did It!</h2>
        <p style="color: var(--text-secondary); line-height: 1.6; font-size: 1.1rem; margin-bottom: 2rem;">
          You successfully completed the Digital Logic Guided Course. Go ahead and experiment in the drag-and-drop sandbox!
        </p>
        <button class="btn-primary" style="margin: 0 auto; width: auto;" onclick="location.href='sandbox.html'">
          Open Sandbox Canvas
        </button>
      </div>
    `;
    rightPane.innerHTML = html;
  }
}

function evaluateBasicGate(type) {
  const inA = document.getElementById("node-in-a")?.classList.contains("active") ? 1 : 0;
  const inB = document.getElementById("node-in-b")?.classList.contains("active") ? 1 : 0;
  const outNode = document.getElementById("node-out-y");
  const gateBadge = document.getElementById("course-gate-badge");
  
  let output = 0;
  
  if (type === "gate-not") {
    output = inA === 1 ? 0 : 1;
  } else if (type === "gate-and") {
    output = (inA && inB) ? 1 : 0;
  } else if (type === "gate-or") {
    output = (inA || inB) ? 1 : 0;
  } else if (type === "gate-xor") {
    output = (inA !== inB) ? 1 : 0;
  }
  
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
  
  drawCourseWires();
}

function evaluateHalfAdder() {
  const inA = document.getElementById("node-in-a").classList.contains("active") ? 1 : 0;
  const inB = document.getElementById("node-in-b").classList.contains("active") ? 1 : 0;
  
  const sumVal = inA !== inB ? 1 : 0;
  const carryVal = inA && inB ? 1 : 0;
  
  const sumNode = document.getElementById("node-out-sum");
  const carryNode = document.getElementById("node-out-carry");
  const gXor = document.getElementById("adder-gate-xor");
  const gAnd = document.getElementById("adder-gate-and");
  
  sumNode.innerText = sumVal;
  if (sumVal === 1) {
    sumNode.classList.add("active");
    gXor.classList.add("active-gate");
  } else {
    sumNode.classList.remove("active");
    gXor.classList.remove("active-gate");
  }
  
  carryNode.innerText = carryVal;
  if (carryVal === 1) {
    carryNode.classList.add("active");
    gAnd.classList.add("active-gate");
  } else {
    carryNode.classList.remove("active");
    gAnd.classList.remove("active-gate");
  }
  
  drawCourseWires();
}

function evaluateFullAdder() {
  const inA = document.getElementById("node-in-a").classList.contains("active") ? 1 : 0;
  const inB = document.getElementById("node-in-b").classList.contains("active") ? 1 : 0;
  const inCin = document.getElementById("node-in-cin").classList.contains("active") ? 1 : 0;
  
  const sum1 = inA !== inB ? 1 : 0;
  const carry1 = inA && inB ? 1 : 0;
  const sum2 = sum1 !== inCin ? 1 : 0;
  const carry2 = sum1 && inCin ? 1 : 0;
  const carryOut = carry1 || carry2 ? 1 : 0;
  
  const sumNode = document.getElementById("node-out-sum");
  const coutNode = document.getElementById("node-out-cout");
  
  const faXor1 = document.getElementById("fa-xor1");
  const faAnd1 = document.getElementById("fa-and1");
  const faXor2 = document.getElementById("fa-xor2");
  const faAnd2 = document.getElementById("fa-and2");
  const faOr = document.getElementById("fa-or");
  
  if (sum1) faXor1.classList.add("active-gate"); else faXor1.classList.remove("active-gate");
  if (carry1) faAnd1.classList.add("active-gate"); else faAnd1.classList.remove("active-gate");
  if (sum2) faXor2.classList.add("active-gate"); else faXor2.classList.remove("active-gate");
  if (carry2) faAnd2.classList.add("active-gate"); else faAnd2.classList.remove("active-gate");
  if (carryOut) faOr.classList.add("active-gate"); else faOr.classList.remove("active-gate");
  
  sumNode.innerText = sum2;
  if (sum2 === 1) sumNode.classList.add("active"); else sumNode.classList.remove("active");
  
  coutNode.innerText = carryOut;
  if (carryOut === 1) coutNode.classList.add("active"); else coutNode.classList.remove("active");
  
  drawCourseWires();
}

function drawCourseWires() {
  const svg = document.getElementById("course-wires-svg");
  if (!svg) return;
  
  svg.innerHTML = "";
  
  const lesson = lessons[currentLessonIdx];
  const type = lesson.type;
  
  if (type === "gate-not" || type === "gate-and" || type === "gate-or" || type === "gate-xor") {
    const isSingleInput = (type === "gate-not");
    const gateBadge = document.getElementById("course-gate-badge");
    const outNode = document.getElementById("node-out-y");
    
    const nodeA = document.getElementById("node-in-a");
    const isAActive = nodeA.classList.contains("active");
    createBezierWire(svg, nodeA, gateBadge, isAActive, 0.45, 0.25);
    
    if (!isSingleInput) {
      const nodeB = document.getElementById("node-in-b");
      const isBActive = nodeB.classList.contains("active");
      createBezierWire(svg, nodeB, gateBadge, isBActive, 0.55, 0.75);
    }
    
    const isOutActive = outNode.classList.contains("active");
    createBezierWire(svg, gateBadge, outNode, isOutActive);
    
  } else if (type === "half-adder") {
    const nodeA = document.getElementById("node-in-a");
    const nodeB = document.getElementById("node-in-b");
    const xorGate = document.getElementById("adder-gate-xor");
    const andGate = document.getElementById("adder-gate-and");
    const sumNode = document.getElementById("node-out-sum");
    const carryNode = document.getElementById("node-out-carry");
    
    const isAActive = nodeA.classList.contains("active");
    const isBActive = nodeB.classList.contains("active");
    
    createBezierWire(svg, nodeA, xorGate, isAActive, 0.4, 0.25);
    createBezierWire(svg, nodeA, andGate, isAActive, 0.4, 0.25);
    createBezierWire(svg, nodeB, xorGate, isBActive, 0.6, 0.75);
    createBezierWire(svg, nodeB, andGate, isBActive, 0.6, 0.75);
    createBezierWire(svg, xorGate, sumNode, sumNode.classList.contains("active"));
    createBezierWire(svg, andGate, carryNode, carryNode.classList.contains("active"));
    
  } else if (type === "full-adder") {
    const nodeA = document.getElementById("node-in-a");
    const nodeB = document.getElementById("node-in-b");
    const nodeCin = document.getElementById("node-in-cin");
    
    const xor1 = document.getElementById("fa-xor1");
    const and1 = document.getElementById("fa-and1");
    const xor2 = document.getElementById("fa-xor2");
    const and2 = document.getElementById("fa-and2");
    const orGate = document.getElementById("fa-or");
    
    const sumNode = document.getElementById("node-out-sum");
    const coutNode = document.getElementById("node-out-cout");
    
    const isAActive = nodeA.classList.contains("active");
    const isBActive = nodeB.classList.contains("active");
    const isCinActive = nodeCin.classList.contains("active");
    
    createBezierWire(svg, nodeA, xor1, isAActive, 0.35, 0.2);
    createBezierWire(svg, nodeA, and1, isAActive, 0.35, 0.2);
    createBezierWire(svg, nodeB, xor1, isBActive, 0.5, 0.8);
    createBezierWire(svg, nodeB, and1, isBActive, 0.5, 0.8);
    
    const isXor1Active = isAActive !== isBActive;
    
    createBezierWire(svg, xor1, xor2, isXor1Active, 0.5, 0.2);
    createBezierWire(svg, xor1, and2, isXor1Active, 0.5, 0.2);
    createBezierWire(svg, nodeCin, xor2, isCinActive, 0.65, 0.8);
    createBezierWire(svg, nodeCin, and2, isCinActive, 0.65, 0.8);
    
    const isAnd1Active = isAActive && isBActive;
    const isAnd2Active = isXor1Active && isCinActive;
    
    createBezierWire(svg, and1, orGate, isAnd1Active, 0.5, 0.2);
    createBezierWire(svg, and2, orGate, isAnd2Active, 0.5, 0.8);
    createBezierWire(svg, xor2, sumNode, sumNode.classList.contains("active"));
    createBezierWire(svg, orGate, coutNode, coutNode.classList.contains("active"));
  }
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

function showSuccessModal() {
  const modal = document.getElementById("success-modal");
  if (!modal) return;
  modal.style.display = "flex";
  
  for (let i = 0; i < 40; i++) {
    createConfetti();
  }
  
  const dismissBtn = document.getElementById("close-success-modal");
  if (dismissBtn) {
    dismissBtn.addEventListener("click", () => {
      modal.style.display = "none";
      window.playSound('click');
    });
  }
}

function createConfetti() {
  const modal = document.getElementById("success-modal-box");
  if (!modal) return;
  const confetti = document.createElement("div");
  confetti.className = "confetti";
  
  const colors = ["#6366f1", "#06b6d4", "#10b981", "#fbbf24", "#ec4899"];
  confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
  confetti.style.left = Math.random() * 90 + "%";
  confetti.style.top = "-20px";
  
  const scale = Math.random() * 0.8 + 0.4;
  confetti.style.transform = `scale(${scale})`;
  
  const duration = Math.random() * 2 + 2;
  confetti.style.animationDuration = duration + "s";
  
  modal.appendChild(confetti);
  
  setTimeout(() => {
    confetti.remove();
  }, duration * 1000);
}

window.drawCourseWires = drawCourseWires;
