import UserService from './user-service.js';
const lessons = [
  {
    id: 0,
    title: 'The Binary Code',
    text: 'Everything inside a computer is represented with just <strong>1</strong>s and <strong>0</strong>s. We call this <strong>Binary</strong>. In electronics, a <strong>1</strong> is a high voltage (e.g. 5V) and a <strong>0</strong> is zero volts (Ground). Toggle the switch to light the bulb!',
    type: 'binary-bulb',
    quiz: {
      question: 'How does a digital circuit represent the binary value <strong>1</strong> electrically?',
      options: [
        'A high voltage level (e.g. 5 V or 3.3 V)',
        'A low voltage level connected to Ground (0 V)',
        'A mechanical oscillation inside the transistor',
        'A random fluctuation of electrons in the wire',
      ],
      correctIndex: 0,
      explanation: 'Binary 1 maps to high voltage (VCC) and binary 0 maps to low voltage (Ground/0 V). This lets us process information electronically.',
    },
  },
  {
    id: 1,
    title: 'The Transistor Switch',
    text: 'How do we build logic from voltage? With the <strong>Transistor</strong>. In an NPN transistor, applying HIGH voltage (1) to the <strong>Base (B)</strong> allows current to flow from <strong>Collector (C)</strong> to <strong>Emitter (E)</strong>. Try switching the Base on!',
    type: 'transistor-npn',
    quiz: {
      question: 'If we apply 0V (Ground) to the base of an NPN transistor, what happens?',
      options: [
        'The collector-emitter path is blocked (transistor OFF)',
        'Maximum current flows freely from collector to emitter',
        'The transistor oscillates at 60 Hz',
        'The transistor permanently conducts',
      ],
      correctIndex: 0,
      explanation: 'With 0V at the base, the NPN transistor acts as an open switch — the collector-emitter path is blocked, preventing current flow.',
    },
  },
  {
    id: 2,
    title: 'The NOT Gate (Inverter)',
    text: 'A transistor with a pull-up resistor to VCC creates a <strong>NOT Gate</strong>. When input is 0, transistor is OFF so output is pulled HIGH (1). When input is 1, transistor turns ON pulling output to Ground (0). It <em>inverts</em> the signal.',
    type: 'gate-not',
    quiz: {
      question: 'What is the output of a NOT Gate when the input is 0?',
      options: ['0 (Low)', '1 (High)', 'Floating / undefined', 'Alternating'],
      correctIndex: 1,
      explanation: 'A NOT gate always inverts: input 0 → output 1, input 1 → output 0.',
    },
  },
  {
    id: 3,
    title: 'The AND Gate',
    text: 'An <strong>AND Gate</strong> outputs 1 <em>only</em> when <strong>both</strong> inputs are 1. If either input is 0, the output is 0. Toggle both inputs below to verify the truth table!',
    type: 'gate-and',
    quiz: {
      question: 'Under what condition does an AND Gate output 1?',
      options: ['When at least one input is 1', 'When both inputs are 1', 'When both inputs are 0', 'When inputs are different'],
      correctIndex: 1,
      explanation: 'AND requires A AND B both to be HIGH (1) to produce a HIGH output.',
    },
  },
  {
    id: 4,
    title: 'The OR Gate',
    text: 'An <strong>OR Gate</strong> outputs 1 if <strong>one or both</strong> inputs are 1. It only outputs 0 when both inputs are 0. Toggle the inputs to test!',
    type: 'gate-or',
    quiz: {
      question: 'If Input A = 1 and Input B = 0, what does an OR Gate output?',
      options: ['0', '1', 'It fluctuates', 'Cannot be determined'],
      correctIndex: 1,
      explanation: 'Since A=1, at least one input is HIGH, so OR outputs 1.',
    },
  },
  {
    id: 5,
    title: 'The XOR Gate',
    text: 'The <strong>XOR (Exclusive OR) Gate</strong> outputs 1 only when inputs are <strong>different</strong>. Same inputs (both 0 or both 1) → output 0. XOR is the core of binary addition!',
    type: 'gate-xor',
    quiz: {
      question: 'What is the XOR output when both inputs are 1?',
      options: ['1', '0', '2', 'High Impedance'],
      correctIndex: 1,
      explanation: 'XOR is "exclusive" — same inputs cancel out: 1 XOR 1 = 0.',
    },
  },
  {
    id: 6,
    title: 'Half Adder',
    text: 'A <strong>Half Adder</strong> adds two bits (A and B). It produces a <strong>Sum (S)</strong> via XOR and a <strong>Carry (C)</strong> via AND. Example: 1+1 = 10 in binary → Sum=0, Carry=1.',
    type: 'half-adder',
    quiz: {
      question: 'If A=1 and B=1, what are the Sum (S) and Carry (C) of a Half Adder?',
      options: ['S=1, C=0', 'S=0, C=1', 'S=1, C=1', 'S=0, C=0'],
      correctIndex: 1,
      explanation: '1+1 in binary is 10: Sum digit = 0, Carry digit = 1.',
    },
  },
  {
    id: 7,
    title: 'Full Adder',
    text: 'A <strong>Full Adder</strong> handles a Carry-In (Cin) from a previous addition. Built from two Half Adders and an OR gate, it takes A, B, Cin and produces <strong>Sum (S)</strong> and <strong>Carry Out (Cout)</strong>.',
    type: 'full-adder',
    quiz: {
      question: 'If A=1, B=0, Cin=1, what does the Full Adder output?',
      options: ['S=0, Cout=1', 'S=1, Cout=0', 'S=1, Cout=1', 'S=0, Cout=0'],
      correctIndex: 0,
      explanation: '1+0+1=2. In binary: 10. Sum=0, Carry Out=1.',
    },
  },
  {
    id: 8,
    title: 'Data Communication',
    text: `<strong>Data communication</strong> is the exchange of data between devices via a transmission medium (wire, fibre, or wireless).<br><br>
Key concepts:<br>
• <strong>Simplex</strong> – Data flows in one direction only (e.g. TV broadcast)<br>
• <strong>Half-duplex</strong> – Both directions, but not simultaneously (e.g. walkie-talkie)<br>
• <strong>Full-duplex</strong> – Both directions simultaneously (e.g. telephone)<br><br>
<strong>Bandwidth</strong> = the capacity of a channel (bits per second). <strong>Latency</strong> = delay in transmission.`,
    type: 'info-card',
    quiz: {
      question: 'A telephone call where both parties can speak and listen at the same time is an example of which transmission mode?',
      options: ['Simplex', 'Half-duplex', 'Full-duplex', 'Broadcast'],
      correctIndex: 2,
      explanation: 'Full-duplex allows simultaneous bidirectional communication — both parties transmit and receive at the same time, like a telephone call.',
    },
  },
  {
    id: 9,
    title: 'OSI Model',
    text: `The <strong>OSI (Open Systems Interconnection) Model</strong> defines 7 layers for network communication. Each layer has a specific role:<br><br>
<strong>7. Application</strong> – User interface (HTTP, FTP, SMTP)<br>
<strong>6. Presentation</strong> – Data formatting, encryption (SSL/TLS)<br>
<strong>5. Session</strong> – Connection management<br>
<strong>4. Transport</strong> – Reliable delivery, segmentation (TCP, UDP)<br>
<strong>3. Network</strong> – Routing & IP addressing (IP, ICMP)<br>
<strong>2. Data Link</strong> – MAC addressing, error detection (Ethernet)<br>
<strong>1. Physical</strong> – Bits on the wire (cables, signals)<br><br>
Mnemonic: <em>"All People Seem To Need Data Processing"</em>`,
    type: 'osi-explorer',
    quiz: {
      question: 'Which OSI layer is responsible for <strong>routing packets between networks</strong> using IP addresses?',
      options: ['Layer 2 – Data Link', 'Layer 3 – Network', 'Layer 4 – Transport', 'Layer 7 – Application'],
      correctIndex: 1,
      explanation: 'Layer 3 (Network) handles logical addressing (IP) and routing. Routers operate at this layer to forward packets across networks.',
    },
  },
  {
    id: 10,
    title: 'TCP/IP & Protocols',
    text: `<strong>TCP/IP</strong> is the suite of protocols that powers the Internet. It has 4 layers mapping to the OSI model:<br><br>
<strong>Application</strong> (OSI 5–7) – HTTP, HTTPS, FTP, SMTP, DNS<br>
<strong>Transport</strong> (OSI 4) – TCP (reliable) vs UDP (fast, no guarantee)<br>
<strong>Internet</strong> (OSI 3) – IP, ICMP, ARP<br>
<strong>Network Access</strong> (OSI 1–2) – Ethernet, Wi-Fi<br><br>
<strong>TCP</strong>: connection-oriented, guaranteed delivery, used for web/email.<br>
<strong>UDP</strong>: connectionless, lower latency, used for video/gaming/DNS.`,
    type: 'info-card',
    quiz: {
      question: 'Which protocol would you choose for a live video stream where some packet loss is acceptable but low latency is critical?',
      options: ['TCP', 'UDP', 'FTP', 'SMTP'],
      correctIndex: 1,
      explanation: 'UDP is connectionless and has no retransmission overhead, making it ideal for real-time applications like video streaming where a dropped frame is better than a delayed one.',
    },
  },
  {
    id: 11,
    title: 'IP Addressing',
    text: `An <strong>IPv4 address</strong> is 32 bits written as four octets: e.g. <code>192.168.1.1</code>.<br><br>
<strong>Classes:</strong><br>
• Class A: 1.0.0.0 – 126.255.255.255 (large networks)<br>
• Class B: 128.0.0.0 – 191.255.255.255 (medium networks)<br>
• Class C: 192.0.0.0 – 223.255.255.255 (small networks)<br><br>
<strong>Subnet Mask</strong>: separates network and host portions. /24 = 255.255.255.0<br>
<strong>CIDR</strong>: e.g. 192.168.1.0<strong>/24</strong> — 24 bits for network, 8 for hosts (254 usable hosts).<br><br>
<strong>Private ranges</strong>: 10.x.x.x, 172.16-31.x.x, 192.168.x.x — not routed on the Internet.`,
    type: 'info-card',
    quiz: {
      question: 'How many <strong>usable host</strong> IP addresses are available in a /24 subnet?',
      options: ['256', '255', '254', '253'],
      correctIndex: 2,
      explanation: '/24 gives 2^8 = 256 total addresses. Subtract 2 (network address + broadcast) = 254 usable hosts.',
    },
  },
  {
    id: 12,
    title: 'Master of ICT!',
    text: 'Incredible! You have mastered everything from transistors to networking protocols — the complete A/L ICT Digital Logic & Data Communication curriculum. You can now build custom circuits in the <strong>Sandbox</strong> and practice subnetting in the <strong>Subnetting Master</strong> tool!',
    type: 'course-complete',
    quiz: {
      question: 'Which device operates at OSI Layer 3 (Network layer) to forward packets between different networks?',
      options: ['Hub', 'Switch', 'Router', 'Repeater'],
      correctIndex: 2,
      explanation: 'A Router operates at Layer 3, using IP addresses to make forwarding decisions across different networks.',
    },
  },
  {
    id: 13,
    title: 'Number Systems & Codes',
    text: `<strong>Number systems</strong> are the foundation of digital computing. Understanding them is essential for A/L ICT.<br><br>
<strong>Binary (Base-2)</strong>: uses digits 0,1. Example: 1101₂ = 1×8 + 1×4 + 0×2 + 1×1 = 13₁₀<br><br>
<strong>Octal (Base-8)</strong>: uses digits 0–7. Each octal digit maps to 3 binary bits.<br>
Example: 15₈ = 001 101₂ = 13₁₀<br><br>
<strong>Hexadecimal (Base-16)</strong>: uses digits 0–9, A–F. Each hex digit maps to 4 binary bits.<br>
Example: D₁₆ = 1101₂ = 13₁₀<br><br>
<strong>BCD (Binary Coded Decimal)</strong>: each decimal digit encoded as 4 binary bits.<br>
Example: 13₁₀ = 0001 0011 (BCD)<br><br>
<strong>ASCII codes</strong>: standard 7-bit encoding for text. 'A' = 65₁₀ = 01000001₂.`,
    type: 'info-card',
    quiz: {
      question: 'What is the hexadecimal equivalent of the binary number <strong>11011011₂</strong>?',
      options: ['DB₁₆', 'B3₁₆', 'D9₁₆', '9B₁₆'],
      correctIndex: 0,
      explanation: '11011011₂ = 1101 1011 = D (13) and B (11) = DB₁₆.',
    },
  },
  {
    id: 14,
    title: 'Boolean Algebra',
    text: `<strong>Boolean Algebra</strong> is the mathematical foundation of digital logic circuits. Key laws for A/L ICT:<br><br>
<strong>Basic Laws:</strong><br>
• A + 0 = A &nbsp;&nbsp; A · 1 = A<br>
• A + 1 = 1 &nbsp;&nbsp; A · 0 = 0<br>
• A + A = A &nbsp;&nbsp; A · A = A<br>
• A + A' = 1 &nbsp;&nbsp; A · A' = 0<br><br>
<strong>De Morgan's Theorems:</strong><br>
• (A + B)' = A' · B'<br>
• (A · B)' = A' + B'<br><br>
<strong>Distributive &amp; Associative:</strong><br>
• A + (B + C) = (A + B) + C<br>
• A · (B · C) = (A · B) · C<br>
• A · (B + C) = A·B + A·C<br>
• A + (B · C) = (A + B) · (A + C)<br><br>
<strong>Absorption Laws:</strong><br>
• A + (A · B) = A<br>
• A · (A + B) = A<br><br>
These laws help <strong>simplify logic circuits</strong>, reducing the number of gates needed.`,
    type: 'info-card',
    quiz: {
      question: 'Apply De Morgan\'s theorem: the complement of (X + Y) is:',
      options: ['X\' + Y\'', 'X\' · Y\'', 'X · Y', '(X · Y)\''],
      correctIndex: 1,
      explanation: 'De Morgan says (X + Y)\' = X\' · Y\'. The OR inside becomes AND outside, and both terms get complemented.',
    },
  },
  {
    id: 15,
    title: 'Flip Flops',
    text: `<strong>Flip Flops</strong> are sequential logic elements that store 1 bit of data. Unlike logic gates, they have <strong>memory</strong> — output depends on past inputs.<br><br>
<strong>SR Flip Flop (Set-Reset):</strong><br>
• S=1, R=0 → Q=1 (SET)<br>
• S=0, R=1 → Q=0 (RESET)<br>
• S=0, R=0 → Q unchanged (HOLD)<br>
• S=1, R=1 → Invalid (both outputs 0)<br><br>
<strong>D Flip Flop (Data/Latch):</strong><br>
• Stores the D input value on each clock edge.<br>
• Q = D when clock transitions.<br>
• Used in registers and data storage.<br><br>
<strong>JK Flip Flop:</strong><br>
• J=1, K=0 → SET | J=0, K=1 → RESET<br>
• J=0, K=0 → HOLD | J=1, K=1 → TOGGLE<br><br>
<strong>Applications:</strong> Counters, Shift Registers, Memory cells, Frequency dividers.`,
    type: 'info-card',
    quiz: {
      question: 'In a JK flip flop, what happens when both J=1 and K=1 on a clock edge?',
      options: ['Output is forced to 0', 'Output toggles', 'Output stays unchanged', 'Invalid state'],
      correctIndex: 1,
      explanation: 'J=1, K=1 is the TOGGLE mode — the output flips from 0→1 or 1→0 on each clock edge.',
    },
  },
  {
    id: 16,
    title: 'Universal Gates',
    text: `<strong>NAND</strong> and <strong>NOR</strong> gates are called <strong>Universal Gates</strong> because any other logic gate (AND, OR, NOT) can be constructed using only combinations of NAND or NOR gates.<br><br>
• <strong>NAND Gate</strong> = NOT AND (Output is 0 only when both inputs are 1)<br>
• <strong>NOR Gate</strong> = NOT OR (Output is 1 only when both inputs are 0)<br><br>
This universal property makes them cheaper and easier to manufacture in large quantities.`,
    type: 'universal-gates',
    icon: '🔮',
    quiz: {
      question: 'Which of the following gates is considered a <strong>Universal Gate</strong>?',
      options: ['AND Gate', 'NAND Gate', 'XOR Gate', 'NOT Gate'],
      correctIndex: 1,
      explanation: 'NAND and NOR gates are universal gates because they can be combined to implement any other Boolean function without other gate types.',
    },
  },
  {
    id: 17,
    title: 'Karnaugh Maps (K-Maps)',
    text: `A <strong>Karnaugh Map (K-Map)</strong> is a graphical tool used to simplify Boolean algebra expressions without using complex laws.<br><br>
• For 2 variables (A, B), it uses a <strong>2x2 grid</strong> of 4 cells representing minterms.<br>
• Adjacent cells containing <strong>1</strong>s are grouped in powers of 2 (1, 2, 4, 8).<br>
• Grouping cells simplifies terms by eliminating variables that change state (e.g. B changing from 0 to 1).`,
    type: 'k-map',
    icon: '📐',
    quiz: {
      question: 'What is the size of groups we should look for when grouping cells in a K-Map?',
      options: ['Any consecutive size (e.g. 1, 2, 3, 4)', 'Only powers of 2 (e.g. 1, 2, 4, 8)', 'Odd numbers only (e.g. 1, 3, 5)', 'Prime numbers only (e.g. 2, 3, 5)'],
      correctIndex: 1,
      explanation: 'K-Map groups must always be powers of 2 (1, 2, 4, 8, etc.) to mathematically simplify Boolean variables.',
    },
  },
  {
    id: 18,
    title: 'Multiplexers (MUX)',
    text: `A <strong>Multiplexer (MUX)</strong> is a combinational circuit that selects one of many input signals and routes it to a single output line.<br><br>
• It acts as a data selector controlled by <strong>Select (S)</strong> lines.<br>
• A 2-to-1 MUX has 2 inputs (I0, I1), 1 select line (S), and 1 output (Y).<br>
• When S=0, output Y follows input I0. When S=1, output Y follows input I1.`,
    type: 'multiplexer',
    icon: '🔧',
    quiz: {
      question: 'In a 2-to-1 Multiplexer, if Select line S is set to 1, what will the Output Y equal?',
      options: ['Input I0', 'Input I1', 'Always 0', 'Always 1'],
      correctIndex: 1,
      explanation: 'When select S=1, the multiplexer routes input I1 to the output Y.',
    },
  },
  {
    id: 19,
    title: 'Transmission Media',
    text: `Data communication uses <strong>Transmission Media</strong> to carry signals between networking nodes. These are categorized into:<br><br>
• <strong>Guided Media (Wired)</strong>: Physical pathways like Twisted Pair (copper, cheap, 100m limit), Coaxial (cable TV, shielded), and Fibre Optic (transmits light, immune to EMI, high bandwidth/distance).<br>
• <strong>Unguided Media (Wireless)</strong>: Air/space pathways using Radio waves, Microwaves (line-of-sight), and Satellites.`,
    type: 'transmission-media',
    icon: '📡',
    quiz: {
      question: 'Which transmission medium is immune to electromagnetic interference (EMI) and offers the highest bandwidth?',
      options: ['Unshielded Twisted Pair (UTP)', 'Coaxial Cable', 'Fibre Optic Cable', 'Shielded Twisted Pair (STP)'],
      correctIndex: 2,
      explanation: 'Fibre Optic Cable transmits light pulses through glass threads, making it immune to electromagnetic interference (EMI) and allowing massive bandwidth over long distances.',
    },
  },
  {
    id: 20,
    title: 'Network Devices',
    text: `Networking nodes require dedicated <strong>Network Devices</strong> to communicate and bridge networks:<br><br>
• <strong>Hub</strong>: Operates at Layer 1 (Physical). Broadcasts all traffic to all ports (high collisions).<br>
• <strong>Switch</strong>: Operates at Layer 2 (Data Link). Directs traffic to destination MAC addresses.<br>
• <strong>Router</strong>: Operates at Layer 3 (Network). Forwards packets across different networks using IP routing.`,
    type: 'network-devices',
    icon: '🧱',
    quiz: {
      question: 'Which device forwards frames selectively based on destination MAC addresses at Layer 2 of the OSI model?',
      options: ['Hub', 'Switch', 'Router', 'Repeater'],
      correctIndex: 1,
      explanation: 'A Switch operates at Layer 2 (Data Link layer) and uses a MAC address table to forward frames selectively to the correct destination port.',
    },
  },
];
let currentLessonIdx = 0;
let selectedOptionIdx = null;
let quizSubmitted = false;
function initCourse() {
  currentLessonIdx = Math.min(UserService.getCurrentStep(), lessons.length - 1);

  initLessonSelect();
  renderLesson();

  document.getElementById('back-to-map-btn')?.addEventListener('click', () => {
    if (window.playSound) window.playSound('click');
    if (window.navigateToView) window.navigateToView('course-map-view');
  });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawCourseWires, 100);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCourse);
} else {
  initCourse();
}
window.loadLesson = (idx) => {
  currentLessonIdx = Math.min(Math.max(0, idx), lessons.length - 1);
  UserService.save({ currentStep: currentLessonIdx });
  if (window.updateXPDisplay) window.updateXPDisplay();
  renderLesson();
};

window.onRestartCourseProgression = async () => {
  currentLessonIdx = 0;
  await UserService.reset();
  if (window.updateXPDisplay) window.updateXPDisplay();
  if (window.renderCourseMap) window.renderCourseMap();
  renderLesson();
};

window.syncCourseProgression = () => {
  currentLessonIdx = Math.min(UserService.getCurrentStep(), lessons.length - 1);
  renderLesson();
};

function initLessonSelect() {
  const sel = document.getElementById('lesson-select');
  if (!sel) return;
  sel.innerHTML = '';
  lessons.forEach((l, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `${idx + 1}. ${l.title}`;
    sel.appendChild(opt);
  });
  sel.value = currentLessonIdx;
  sel.addEventListener('change', (e) => {
    if (window.playSound) window.playSound('click');
    currentLessonIdx = parseInt(e.target.value, 10);
    UserService.save({ currentStep: currentLessonIdx });
    renderLesson();
  });
}
function renderLesson() {
  const lesson = lessons[currentLessonIdx];
  selectedOptionIdx = null;
  quizSubmitted = false;
  const sel = document.getElementById('lesson-select');
  if (sel) sel.value = currentLessonIdx;
  const track = document.getElementById('course-progress');
  if (track) {
    track.innerHTML = '';
    lessons.forEach((_, idx) => {
      const step = document.createElement('div');
      step.className = 'progress-step';
      if (idx < currentLessonIdx) step.classList.add('completed');
      if (idx === currentLessonIdx) step.classList.add('active');
      track.appendChild(step);
    });
  }
  const titleEl = document.getElementById('lesson-title');
  const textEl  = document.getElementById('lesson-text');
  if (titleEl) titleEl.innerHTML = lesson.title;
  if (textEl)  textEl.innerHTML  = lesson.text;
  const qqEl = document.getElementById('quiz-question');
  if (qqEl) qqEl.innerHTML = lesson.quiz.question;
  const qContainer = document.getElementById('quiz-options');
  if (qContainer) {
    qContainer.innerHTML = '';
    lesson.quiz.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.innerHTML = `
        <span class="quiz-option-letter">${String.fromCharCode(65 + idx)}</span>
        <span class="quiz-option-text">${opt}</span>
      `;
      btn.addEventListener('click', () => selectQuizOption(idx));
      qContainer.appendChild(btn);
    });
  }
  const feedback = document.getElementById('quiz-feedback');
  if (feedback) {
    feedback.className = 'feedback-alert';
    feedback.innerHTML = '';
    feedback.style.display = 'none';
  }
  const ctaBtn = document.getElementById('cta-btn');
  if (ctaBtn) {
    ctaBtn.textContent = 'Check Answer';
    ctaBtn.disabled = true;
  }
  renderVisualSimulation(lesson.type);

  if (window.updateXPDisplay) window.updateXPDisplay();
}
function selectQuizOption(idx) {
  if (quizSubmitted) return;
  if (window.playSound) window.playSound('click');
  selectedOptionIdx = idx;

  document.querySelectorAll('.quiz-option').forEach((opt, i) => {
    opt.classList.toggle('selected', i === idx);
  });

  const ctaBtn = document.getElementById('cta-btn');
  if (ctaBtn) ctaBtn.disabled = false;
}

document.getElementById('cta-btn')?.addEventListener('click', handleCTA);

function handleCTA() {
  const lesson = lessons[currentLessonIdx];
  const ctaBtn  = document.getElementById('cta-btn');
  const feedback = document.getElementById('quiz-feedback');

  if (!quizSubmitted) {
    quizSubmitted = true;
    const isCorrect = selectedOptionIdx === lesson.quiz.correctIndex;

    document.querySelectorAll('.quiz-option').forEach((opt, idx) => {
      opt.classList.add('disabled');
      if (idx === lesson.quiz.correctIndex) opt.classList.add('correct');
      else if (idx === selectedOptionIdx)    opt.classList.add('incorrect');
    });

    if (isCorrect) {
      if (window.playSound) window.playSound('success');
      if (feedback) {
        feedback.className = 'feedback-alert success';
        feedback.innerHTML = `<strong>Correct!</strong> ${lesson.quiz.explanation}`;
        feedback.style.display = 'flex';
      }
      const steps = document.querySelectorAll('.progress-step');
      steps[currentLessonIdx]?.classList.add('completed');
      if (ctaBtn) ctaBtn.textContent = currentLessonIdx === lessons.length - 1 ? 'Finish Course' : 'Continue';
    } else {
      if (window.playSound) window.playSound('error');
      if (feedback) {
        feedback.className = 'feedback-alert error';
        feedback.innerHTML = `<strong>Not quite.</strong> Check the simulation and try a different answer.`;
        feedback.style.display = 'flex';
      }
      if (ctaBtn) ctaBtn.textContent = 'Retry';
    }
  } else {
    if (feedback && feedback.classList.contains('success')) {
      const answer = selectedOptionIdx !== null ? String.fromCharCode(65 + selectedOptionIdx) : null;
      UserService.completeLesson(currentLessonIdx, 10, answer, true).then(() => {
        if (window.updateXPDisplay) window.updateXPDisplay();
      });
      if (window.markLessonComplete) window.markLessonComplete(currentLessonIdx);

      if (currentLessonIdx === lessons.length - 1) {
        showSuccessModal();
      } else {
        currentLessonIdx++;
        UserService.save({ currentStep: currentLessonIdx });
        if (window.renderCourseMap) window.renderCourseMap();
        renderLesson();
      }
    } else {
      renderLesson();
    }
  }
}
function renderVisualSimulation(type) {
  const pane = document.getElementById('course-sim-container');
  if (!pane) return;
  pane.innerHTML = '';

  switch (type) {
    case 'binary-bulb':      renderBulbSim(pane);       break;
    case 'transistor-npn':   renderTransistorSim(pane);  break;
    case 'gate-not':
    case 'gate-and':
    case 'gate-or':
    case 'gate-xor':
    case 'gate-nand':
    case 'gate-nor':         renderGateSim(pane, type);  break;
    case 'half-adder':       renderHalfAdderSim(pane);   break;
    case 'full-adder':       renderFullAdderSim(pane);   break;
    case 'universal-gates':  renderUniversalGatesSim(pane); break;
    case 'k-map':            renderKMapSim(pane);        break;
    case 'multiplexer':      renderMuxSim(pane);         break;
    case 'transmission-media': renderTransmissionMediaSim(pane); break;
    case 'network-devices':  renderNetworkDevicesSim(pane); break;
    case 'info-card':        renderInfoCard(pane);        break;
    case 'osi-explorer':     renderOSIExplorer(pane);     break;
    case 'course-complete':  renderCourseComplete(pane);  break;
    default:                 renderInfoCard(pane);        break;
  }
}
function renderBulbSim(pane) {
  pane.innerHTML = `
    <div class="lightbulb-component">
      <svg class="lightbulb-svg" viewBox="0 0 100 100" id="bulb-graphic">
        <circle cx="50" cy="40" r="28" class="glow"/>
        <path d="M35 62 C35 70,42 75,50 75 C58 75,65 70,65 62" fill="none" stroke="#475569" stroke-width="2"/>
        <rect x="42" y="75" width="16" height="8" rx="2" fill="#64748b"/>
        <rect x="44" y="83" width="12" height="4" fill="#334155"/>
        <path d="M43 62 L48 45 L52 45 L57 62" fill="none" stroke="#64748b" stroke-width="2"/>
      </svg>
      <div class="voltage-line" id="bulb-voltage-label">State: 0 (0V)</div>
      <div class="input-node-wrapper" style="margin-top:1rem">
        <div class="node-label">INPUT</div>
        <div class="input-node" id="bulb-switch">0</div>
      </div>
    </div>`;

  const sw  = document.getElementById('bulb-switch');
  const g   = document.getElementById('bulb-graphic');
  const lbl = document.getElementById('bulb-voltage-label');
  sw.addEventListener('click', () => {
    if (window.playSound) window.playSound('toggle');
    const on = sw.classList.toggle('active');
    sw.textContent  = on ? '1' : '0';
    on ? g.classList.add('lit')   : g.classList.remove('lit');
    lbl.textContent = on ? 'State: 1 (5V)' : 'State: 0 (0V)';
    on ? lbl.classList.add('high') : lbl.classList.remove('high');
  });
}
function renderTransistorSim(pane) {
  pane.innerHTML = `
    <div class="transistor-component">
      <div class="transistor-schematic">
        <svg viewBox="0 0 300 250">
          <text x="110" y="30" fill="#94a3b8" font-family="Outfit" font-weight="700" font-size="13">COLLECTOR (C)</text>
          <text x="18" y="130" fill="#94a3b8" font-family="Outfit" font-weight="700" font-size="13">BASE (B)</text>
          <text x="115" y="238" fill="#94a3b8" font-family="Outfit" font-weight="700" font-size="13">EMITTER (E)</text>
          <path id="t-c" d="M150 40 L150 100" fill="none" stroke="var(--color-low)" stroke-width="6" stroke-linecap="round"/>
          <path id="t-b" d="M80 125 L135 125" fill="none" stroke="var(--color-low)" stroke-width="6" stroke-linecap="round"/>
          <path id="t-e" d="M150 150 L150 215" fill="none" stroke="var(--color-low)" stroke-width="6" stroke-linecap="round"/>
          <line id="t-g" x1="150" y1="100" x2="150" y2="150" stroke="var(--color-low)" stroke-width="6" stroke-linecap="round"/>
        </svg>
      </div>
      <div style="display:flex;gap:2rem;width:100%;margin-top:1rem;">
        <div class="input-node-wrapper" style="flex:1;justify-content:center;">
          <div class="node-label">BASE</div>
          <div class="input-node" id="trans-base">0</div>
        </div>
        <div class="input-node-wrapper" style="flex:1;justify-content:center;">
          <div class="node-label">PATH</div>
          <div class="output-node" id="trans-path-out">0</div>
        </div>
      </div>
      <div class="transistor-label" id="trans-state-text">Transistor is: BLOCKED (OFF)</div>
    </div>`;

  const base = document.getElementById('trans-base');
  const out  = document.getElementById('trans-path-out');
  const txt  = document.getElementById('trans-state-text');
  const lines = ['t-c','t-b','t-e','t-g'].map(id => document.getElementById(id));

  base.addEventListener('click', () => {
    if (window.playSound) window.playSound('toggle');
    const on = base.classList.toggle('active');
    base.textContent = on ? '1' : '0';
    const color = on ? 'var(--color-high)' : 'var(--color-low)';
    lines.forEach(l => l?.setAttribute('stroke', color));
    on ? out.classList.add('active')   : out.classList.remove('active');
    out.textContent = on ? '1' : '0';
    txt.textContent = on ? 'Transistor is: CONDUCTING (ON)' : 'Transistor is: BLOCKED (OFF)';
    txt.style.color = on ? 'var(--color-indigo)' : 'var(--text-secondary)';
  });
}
function renderGateSim(pane, type) {
  const isSingle = type === 'gate-not';
  const name = type.replace('gate-', '').toUpperCase();
  pane.innerHTML = `
    <div class="simulation-canvas" id="course-canvas">
      <svg class="wires-svg" id="course-wires-svg"></svg>
      <div class="nodes-container">
        <div class="node-column">
          <div class="input-node-wrapper">
            <div class="node-label">A</div>
            <div class="input-node course-input" id="node-in-a">0</div>
          </div>
          ${isSingle ? '' : `
          <div class="input-node-wrapper">
            <div class="node-label">B</div>
            <div class="input-node course-input" id="node-in-b">0</div>
          </div>`}
        </div>
        <div class="node-column">
          <div class="gate-badge" id="course-gate-badge">${name}</div>
        </div>
        <div class="node-column">
          <div class="input-node-wrapper">
            <div class="output-node" id="node-out-y">0</div>
            <div class="node-label">Y</div>
          </div>
        </div>
      </div>
    </div>`;

  pane.querySelectorAll('.course-input').forEach(inp => {
    inp.addEventListener('click', () => {
      if (window.playSound) window.playSound('toggle');
      inp.classList.toggle('active');
      inp.textContent = inp.classList.contains('active') ? '1' : '0';
      evaluateGate(type);
    });
  });
  evaluateGate(type);
  setTimeout(drawCourseWires, 40);
}

function evaluateGate(type) {
  const a = document.getElementById('node-in-a')?.classList.contains('active') ? 1 : 0;
  const b = document.getElementById('node-in-b')?.classList.contains('active') ? 1 : 0;
  let out = 0;
  if (type === 'gate-not')  out = a ? 0 : 1;
  if (type === 'gate-and')  out = a && b ? 1 : 0;
  if (type === 'gate-or')   out = a || b ? 1 : 0;
  if (type === 'gate-xor')  out = a !== b ? 1 : 0;
  if (type === 'gate-nand') out = !(a && b) ? 1 : 0;
  if (type === 'gate-nor')  out = !(a || b) ? 1 : 0;
  setOutput('node-out-y', out);
  const badge = document.getElementById('course-gate-badge');
  badge?.classList.toggle('active-gate', out === 1);
  drawCourseWires();
}
function renderHalfAdderSim(pane) {
  pane.innerHTML = `
    <div class="simulation-canvas" id="course-canvas">
      <svg class="wires-svg" id="course-wires-svg"></svg>
      <div class="nodes-container" style="gap:4rem">
        <div class="node-column" style="gap:5rem">
          <div class="input-node-wrapper"><div class="node-label">A</div><div class="input-node course-input" id="node-in-a">0</div></div>
          <div class="input-node-wrapper"><div class="node-label">B</div><div class="input-node course-input" id="node-in-b">0</div></div>
        </div>
        <div class="node-column" style="gap:3rem">
          <div class="gate-badge" id="adder-gate-xor">XOR</div>
          <div class="gate-badge" id="adder-gate-and">AND</div>
        </div>
        <div class="node-column" style="gap:5rem">
          <div class="input-node-wrapper"><div class="output-node" id="node-out-sum">0</div><div class="node-label">SUM</div></div>
          <div class="input-node-wrapper"><div class="output-node" id="node-out-carry">0</div><div class="node-label">CARRY</div></div>
        </div>
      </div>
    </div>`;

  pane.querySelectorAll('.course-input').forEach(inp => {
    inp.addEventListener('click', () => {
      if (window.playSound) window.playSound('toggle');
      inp.classList.toggle('active');
      inp.textContent = inp.classList.contains('active') ? '1' : '0';
      evaluateHalfAdder();
    });
  });
  evaluateHalfAdder();
  setTimeout(drawCourseWires, 40);
}

function evaluateHalfAdder() {
  const a = val('node-in-a'), b = val('node-in-b');
  const s = a !== b ? 1 : 0, c = a && b ? 1 : 0;
  setOutput('node-out-sum',   s); document.getElementById('adder-gate-xor')?.classList.toggle('active-gate', s === 1);
  setOutput('node-out-carry', c); document.getElementById('adder-gate-and')?.classList.toggle('active-gate', c === 1);
  drawCourseWires();
}
function renderFullAdderSim(pane) {
  pane.innerHTML = `
    <div class="simulation-canvas" id="course-canvas">
      <svg class="wires-svg" id="course-wires-svg"></svg>
      <div class="nodes-container" style="gap:2.5rem">
        <div class="node-column" style="gap:2.5rem">
          <div class="input-node-wrapper"><div class="node-label">A</div><div class="input-node course-input" id="node-in-a">0</div></div>
          <div class="input-node-wrapper"><div class="node-label">B</div><div class="input-node course-input" id="node-in-b">0</div></div>
          <div class="input-node-wrapper"><div class="node-label">Cin</div><div class="input-node course-input" id="node-in-cin">0</div></div>
        </div>
        <div class="node-column" style="gap:1.5rem">
          <div class="gate-badge" id="fa-xor1" class="is-btn-pill">XOR 1</div>
          <div class="gate-badge" id="fa-and1" class="is-btn-pill">AND 1</div>
          <div class="gate-badge" id="fa-xor2" class="is-btn-pill">XOR 2</div>
          <div class="gate-badge" id="fa-and2" class="is-btn-pill">AND 2</div>
          <div class="gate-badge" id="fa-or"   class="is-btn-pill">OR</div>
        </div>
        <div class="node-column" style="gap:4rem">
          <div class="input-node-wrapper"><div class="output-node" id="node-out-sum">0</div><div class="node-label">SUM</div></div>
          <div class="input-node-wrapper"><div class="output-node" id="node-out-cout">0</div><div class="node-label">COUT</div></div>
        </div>
      </div>
    </div>`;

  pane.querySelectorAll('.course-input').forEach(inp => {
    inp.addEventListener('click', () => {
      if (window.playSound) window.playSound('toggle');
      inp.classList.toggle('active');
      inp.textContent = inp.classList.contains('active') ? '1' : '0';
      evaluateFullAdder();
    });
  });
  evaluateFullAdder();
  setTimeout(drawCourseWires, 40);
}

function evaluateFullAdder() {
  const a = val('node-in-a'), b = val('node-in-b'), cin = val('node-in-cin');
  const s1 = a !== b ? 1 : 0, c1 = a && b ? 1 : 0;
  const s2 = s1 !== cin ? 1 : 0, c2 = s1 && cin ? 1 : 0;
  const cout = c1 || c2 ? 1 : 0;
  const g = (id, on) => document.getElementById(id)?.classList.toggle('active-gate', on === 1);
  g('fa-xor1', s1); g('fa-and1', c1); g('fa-xor2', s2); g('fa-and2', c2); g('fa-or', cout);
  setOutput('node-out-sum',  s2);
  setOutput('node-out-cout', cout);
  drawCourseWires();
}
function renderInfoCard(pane) {
  const lesson = lessons[currentLessonIdx];
  pane.innerHTML = `
    <div style="max-width:420px;padding:2rem;display:flex;flex-direction:column;gap:1rem;align-items:center;text-align:center;">
      <div style="font-size:4rem;line-height:1">${lesson.icon ?? '📖'}</div>
      <h2 style="font-family:var(--font-header);font-size:1.5rem;color:var(--text-primary)">${lesson.title}</h2>
      <p style="font-size:0.9rem;color:var(--text-secondary);line-height:1.7;text-align:left">${lesson.text}</p>
    </div>`;
}
function renderOSIExplorer(pane) {
  const layers = [
    { num: 7, name: 'Application',  color: '#ef4444', examples: 'HTTP, FTP, SMTP, DNS' },
    { num: 6, name: 'Presentation', color: '#f97316', examples: 'SSL/TLS, JPEG, MPEG' },
    { num: 5, name: 'Session',      color: '#eab308', examples: 'NetBIOS, RPC' },
    { num: 4, name: 'Transport',    color: '#22c55e', examples: 'TCP, UDP' },
    { num: 3, name: 'Network',      color: '#3b82f6', examples: 'IP, ICMP, ARP' },
    { num: 2, name: 'Data Link',    color: '#8b5cf6', examples: 'Ethernet, MAC, PPP' },
    { num: 1, name: 'Physical',     color: '#ec4899', examples: 'Cables, Hubs, Signals' },
  ];

  pane.innerHTML = `
    <div style="max-width:380px;width:100%;padding:1rem;display:flex;flex-direction:column;gap:0.35rem">
      <p style="font-family:var(--font-header);font-weight:800;font-size:0.85rem;text-align:center;color:var(--text-muted);margin-bottom:0.5rem">Click a layer to learn more</p>
      ${layers.map(l => `
        <div class="osi-layer-row" data-layer="${l.num}" style="
          display:flex;align-items:center;gap:0.75rem;
          padding:0.6rem 0.9rem;border-radius:8px;cursor:pointer;
          background:var(--bg-secondary);border:1.5px solid var(--border-color);
          transition:all 0.15s ease;
        " onmouseover="this.style.borderColor='${l.color}'" onmouseout="this.style.borderColor='var(--border-color)'">
          <div style="width:28px;height:28px;border-radius:6px;background:${l.color}20;border:2px solid ${l.color};
            display:flex;align-items:center;justify-content:center;flex-shrink:0;
            font-family:var(--font-header);font-weight:800;font-size:0.85rem;color:${l.color}">${l.num}</div>
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--font-header);font-weight:700;font-size:0.88rem;color:var(--text-primary)">${l.name}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${l.examples}</div>
          </div>
        </div>
      `).join('')}
    </div>`;

  const detail = document.createElement('div');
  detail.id = 'osi-detail';
  detail.style.cssText = 'display:none;max-width:380px;width:100%;padding:0 1rem 1rem';
  pane.appendChild(detail);

  const descs = {
    7: 'The Application layer provides network services to end-user applications. It enables programs to access network resources. Protocols: HTTP (web), SMTP (email), FTP (files), DNS (name resolution).',
    6: 'The Presentation layer translates data between the application and network format. Handles encryption (SSL/TLS), compression, and data format conversion (ASCII ↔ Unicode, JPEG, MPEG).',
    5: 'The Session layer manages, establishes, and terminates sessions between applications. Handles synchronisation, checkpointing, and recovery of data exchange.',
    4: 'The Transport layer provides end-to-end communication. TCP: connection-oriented, reliable, ordered delivery. UDP: connectionless, faster, no guarantee — used for streaming and gaming.',
    3: 'The Network layer handles logical addressing and routing. IP addresses live here. Routers use this layer to forward packets across different networks. Protocols: IPv4, IPv6, ICMP.',
    2: 'The Data Link layer handles node-to-node data transfer on the same network. Uses MAC addresses. Switches operate here. Detects and corrects errors from the Physical layer (CRC).',
    1: 'The Physical layer transmits raw bits over a physical medium (copper cable, fibre, radio). Defines voltage levels, timing, connector types, and bit rates.',
  };

  pane.querySelectorAll('.osi-layer-row').forEach(row => {
    row.addEventListener('click', () => {
      const n = parseInt(row.dataset.layer);
      const l = layers.find(x => x.num === n);
      detail.style.display = 'block';
      detail.innerHTML = `
        <div style="background:${l.color}15;border:1.5px solid ${l.color}50;border-radius:10px;padding:0.9rem 1rem">
          <div style="font-family:var(--font-header);font-weight:800;color:${l.color};margin-bottom:0.35rem">Layer ${n}: ${l.name}</div>
          <div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.55">${descs[n]}</div>
        </div>`;
      if (window.playSound) window.playSound('click');
    });
  });
}
function renderCourseComplete(pane) {
  pane.innerHTML = `
    <div style="text-align:center;max-width:400px;padding:2rem">
      <div style="width:100px;height:100px;margin:0 auto 1.5rem;background:var(--bg-tertiary);border-radius:50%;
        display:flex;align-items:center;justify-content:center;color:var(--color-success)">
        <svg viewBox="0 0 24 24" width="50" height="50" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <h2 style="font-family:var(--font-header);font-size:2rem;margin-bottom:1rem">You Did It! 🏆</h2>
      <p style="color:var(--text-secondary);line-height:1.6;margin-bottom:2rem">
        You've mastered Digital Logic AND Data Communications — everything in the A/L ICT syllabus. Time to build!
      </p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <button class="btn-primary" onclick="window.navigateToView&&window.navigateToView('sandbox-view')">Open Sandbox →</button>
        <button class="btn-secondary" onclick="window.navigateToView&&window.navigateToView('subnetting-view')">Practice Subnetting →</button>
      </div>
    </div>`;
}
function val(id) {
  return document.getElementById(id)?.classList.contains('active') ? 1 : 0;
}

function setOutput(id, v) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = v;
  v ? el.classList.add('active') : el.classList.remove('active');
}

export function drawCourseWires() {
  const svg = document.getElementById('course-wires-svg');
  if (!svg) return;
  svg.innerHTML = '';

  const type = lessons[currentLessonIdx]?.type;
  if (!type) return;

  if (['gate-not','gate-and','gate-or','gate-xor'].includes(type)) {
    const badge = document.getElementById('course-gate-badge');
    const outY  = document.getElementById('node-out-y');
    wire(svg, 'node-in-a', badge, val('node-in-a'), 0.45, 0.25);
    if (type !== 'gate-not') wire(svg, 'node-in-b', badge, val('node-in-b'), 0.55, 0.75);
    wire(svg, badge, outY, val('node-out-y'));

  } else if (type === 'half-adder') {
    const xg = document.getElementById('adder-gate-xor');
    const ag = document.getElementById('adder-gate-and');
    const a = val('node-in-a'), b = val('node-in-b');
    wire(svg,'node-in-a', xg, a, 0.4, 0.25); wire(svg,'node-in-a', ag, a, 0.4, 0.25);
    wire(svg,'node-in-b', xg, b, 0.6, 0.75); wire(svg,'node-in-b', ag, b, 0.6, 0.75);
    wire(svg, xg,'node-out-sum',   val('node-out-sum'));
    wire(svg, ag,'node-out-carry', val('node-out-carry'));

  } else if (type === 'full-adder') {
    const a=val('node-in-a'), b=val('node-in-b'), cin=val('node-in-cin');
    const x1=document.getElementById('fa-xor1'), a1=document.getElementById('fa-and1');
    const x2=document.getElementById('fa-xor2'), a2=document.getElementById('fa-and2');
    const or=document.getElementById('fa-or');
    wire(svg,'node-in-a',x1,a,0.3,0.2); wire(svg,'node-in-a',a1,a,0.3,0.2);
    wire(svg,'node-in-b',x1,b,0.5,0.8); wire(svg,'node-in-b',a1,b,0.5,0.8);
    const s1 = a!==b?1:0, c1=a&&b?1:0;
    wire(svg,x1,x2,s1,0.5,0.2); wire(svg,x1,a2,s1,0.5,0.2);
    wire(svg,'node-in-cin',x2,cin,0.65,0.8); wire(svg,'node-in-cin',a2,cin,0.65,0.8);
    const c2=s1&&cin?1:0;
    wire(svg,a1,or,c1,0.5,0.2); wire(svg,a2,or,c2,0.5,0.8);
    wire(svg,x2,'node-out-sum',  val('node-out-sum'));
    wire(svg,or, 'node-out-cout',val('node-out-cout'));
  }
}

function wire(svg, startRef, endRef, active, sy=0.5, ey=0.5) {
  const startEl = typeof startRef === 'string' ? document.getElementById(startRef) : startRef;
  const endEl   = typeof endRef   === 'string' ? document.getElementById(endRef)   : endRef;
  if (!startEl || !endEl || !svg) return;

  const cr = svg.getBoundingClientRect();
  const sr = startEl.getBoundingClientRect();
  const er = endEl.getBoundingClientRect();

  const x1 = sr.right  - cr.left;
  const y1 = sr.top + sr.height * sy - cr.top;
  const x2 = er.left   - cr.left;
  const y2 = er.top + er.height * ey - cr.top;
  const dx = Math.abs(x2 - x1) * 0.5;
  const d  = `M${x1} ${y1} C${x1+dx} ${y1},${x2-dx} ${y2},${x2} ${y2}`;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('class', active ? 'wire active' : 'wire');
  svg.appendChild(path);

  if (active) {
    const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pulse.setAttribute('d', d);
    pulse.setAttribute('class', 'wire active wire-pulse');
    svg.appendChild(pulse);
  }
}
function showSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  for (let i = 0; i < 40; i++) spawnConfetti();

  document.getElementById('close-success-modal')?.addEventListener('click', () => {
    modal.style.display = 'none';
    if (window.playSound) window.playSound('click');
  });
}

function spawnConfetti() {
  const box = document.getElementById('success-modal-box');
  if (!box) return;
  const el = document.createElement('div');
  el.className = 'confetti';
  const colors = ['#6366f1','#06b6d4','#10b981','#fbbf24','#ec4899'];
  el.style.background = colors[Math.floor(Math.random() * colors.length)];
  el.style.left = Math.random() * 90 + '%';
  el.style.top  = '-20px';
  el.style.transform = `scale(${Math.random() * 0.8 + 0.4})`;
  const dur = Math.random() * 2 + 2;
  el.style.animationDuration = dur + 's';
  box.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000);
}

function renderUniversalGatesSim(pane) {
  pane.innerHTML = `
    <div class="simulation-canvas" style="display:flex; flex-direction:column; gap:1rem; align-items:center; width:100%; min-height:190px; justify-content:center">
      <div class="mode-pill-toggle" style="margin-bottom:0.5rem">
        <button class="mode-toggle-btn active" id="ug-nand-btn">NAND Gate</button>
        <button class="mode-toggle-btn" id="ug-nor-btn">NOR Gate</button>
      </div>
      <div class="nodes-container" style="width:100%; justify-content:center; gap:2.5rem">
        <div class="node-column">
          <div class="input-node-wrapper"><div class="node-label">A</div><div class="input-node course-input" id="ug-in-a">0</div></div>
          <div class="input-node-wrapper"><div class="node-label">B</div><div class="input-node course-input" id="ug-in-b">0</div></div>
        </div>
        <div class="node-column">
          <div class="gate-badge" id="ug-gate-badge" style="width:75px">NAND</div>
        </div>
        <div class="node-column">
          <div class="input-node-wrapper">
            <div class="output-node" id="ug-out-y">1</div>
            <div class="node-label">Y</div>
          </div>
        </div>
      </div>
    </div>`;

  let currentGate = 'nand';
  const btnNand = document.getElementById('ug-nand-btn');
  const btnNor = document.getElementById('ug-nor-btn');
  const badge = document.getElementById('ug-gate-badge');
  const inA = document.getElementById('ug-in-a');
  const inB = document.getElementById('ug-in-b');
  const outY = document.getElementById('ug-out-y');

  function update() {
    const valA = inA.classList.contains('active') ? 1 : 0;
    const valB = inB.classList.contains('active') ? 1 : 0;
    let result = 0;
    if (currentGate === 'nand') {
      result = !(valA && valB) ? 1 : 0;
    } else {
      result = !(valA || valB) ? 1 : 0;
    }
    outY.textContent = result;
    outY.classList.toggle('active', result === 1);
    badge.classList.toggle('active-gate', result === 1);
  }

  [inA, inB].forEach(inp => {
    inp.addEventListener('click', () => {
      if (window.playSound) window.playSound('toggle');
      inp.classList.toggle('active');
      inp.textContent = inp.classList.contains('active') ? '1' : '0';
      update();
    });
  });

  btnNand.addEventListener('click', () => {
    if (window.playSound) window.playSound('click');
    currentGate = 'nand';
    btnNand.classList.add('active');
    btnNor.classList.remove('active');
    badge.textContent = 'NAND';
    update();
  });

  btnNor.addEventListener('click', () => {
    if (window.playSound) window.playSound('click');
    currentGate = 'nor';
    btnNor.classList.add('active');
    btnNand.classList.remove('active');
    badge.textContent = 'NOR';
    update();
  });

  update();
}

function renderKMapSim(pane) {
  pane.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1rem; align-items:center; width:100%; max-width:320px; padding:0.5rem">
      <div style="font-family:var(--font-header); font-weight:800; font-size:0.9rem; color:var(--text-muted)">Interactive 2-Variable K-Map</div>
      
      <div style="display:grid; grid-template-columns: 40px repeat(2, 60px); grid-template-rows: 40px repeat(2, 60px); gap:4px; align-items:center; text-align:center; font-family:var(--font-header); font-weight:700">
        <div></div>
        <div style="color:var(--color-indigo)">B = 0</div>
        <div style="color:var(--color-indigo)">B = 1</div>
        
        <div style="color:var(--color-indigo)">A = 0</div>
        <button class="kmap-cell" id="kcell-00" style="height:60px; border:2px solid var(--border-color); background:var(--bg-secondary); color:var(--text-primary); font-size:1.25rem; font-weight:bold; border-radius:8px; cursor:pointer; transition:all 0.15s">0</button>
        <button class="kmap-cell" id="kcell-01" style="height:60px; border:2px solid var(--border-color); background:var(--bg-secondary); color:var(--text-primary); font-size:1.25rem; font-weight:bold; border-radius:8px; cursor:pointer; transition:all 0.15s">0</button>
        
        <div style="color:var(--color-indigo)">A = 1</div>
        <button class="kmap-cell" id="kcell-10" style="height:60px; border:2px solid var(--border-color); background:var(--bg-secondary); color:var(--text-primary); font-size:1.25rem; font-weight:bold; border-radius:8px; cursor:pointer; transition:all 0.15s">0</button>
        <button class="kmap-cell" id="kcell-11" style="height:60px; border:2px solid var(--border-color); background:var(--bg-secondary); color:var(--text-primary); font-size:1.25rem; font-weight:bold; border-radius:8px; cursor:pointer; transition:all 0.15s">0</button>
      </div>

      <div style="width:100%; background:var(--bg-secondary); border:1px solid var(--border-color); padding:0.75rem; border-radius:8px; text-align:center; margin-top:0.5rem">
        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:bold">SIMPLIFIED BOOLEAN EXPRESSION</div>
        <div id="kmap-expr" style="font-family:var(--font-mono); font-size:1.25rem; font-weight:800; color:var(--color-indigo); margin-top:4px">0</div>
      </div>
    </div>`;

  const cells = {
    '00': document.getElementById('kcell-00'),
    '01': document.getElementById('kcell-01'),
    '10': document.getElementById('kcell-10'),
    '11': document.getElementById('kcell-11')
  };

  const exprEl = document.getElementById('kmap-expr');

  function updateKMap() {
    const m0 = cells['00'].textContent === '1';
    const m1 = cells['01'].textContent === '1';
    const m2 = cells['10'].textContent === '1';
    const m3 = cells['11'].textContent === '1';

    Object.keys(cells).forEach(k => {
      const active = cells[k].textContent === '1';
      cells[k].style.borderColor = active ? 'var(--color-indigo)' : 'var(--border-color)';
      cells[k].style.background = active ? 'var(--color-indigo-glow, rgba(99,102,241,0.15))' : 'var(--bg-secondary)';
      cells[k].style.boxShadow = active ? '0 0 8px rgba(99,102,241,0.3)' : 'none';
    });

    let expr = '0';
    if (m0 && m1 && m2 && m3) expr = '1';
    else if (m0 && m1 && m2) expr = "A' + B'";
    else if (m0 && m1 && m3) expr = "A' + B";
    else if (m0 && m2 && m3) expr = "A + B'";
    else if (m1 && m2 && m3) expr = "A + B";
    else if (m0 && m1) expr = "A'";
    else if (m2 && m3) expr = "A";
    else if (m0 && m2) expr = "B'";
    else if (m1 && m3) expr = "B";
    else if (m0 && m3) expr = "A'B' + AB";
    else if (m1 && m2) expr = "A'B + AB'";
    else if (m0) expr = "A'B'";
    else if (m1) expr = "A'B";
    else if (m2) expr = "AB'";
    else if (m3) expr = "AB";

    exprEl.textContent = expr;
  }

  Object.keys(cells).forEach(k => {
    cells[k].addEventListener('click', () => {
      if (window.playSound) window.playSound('toggle');
      cells[k].textContent = cells[k].textContent === '0' ? '1' : '0';
      updateKMap();
    });
  });

  updateKMap();
}

function renderMuxSim(pane) {
  pane.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:0.75rem; align-items:center; width:100%; max-width:320px; padding:0.5rem">
      <div style="font-family:var(--font-header); font-weight:800; font-size:0.9rem; color:var(--text-muted)">2-to-1 Multiplexer (MUX)</div>
      
      <div style="display:flex; align-items:center; gap:1.5rem; background:var(--bg-secondary); border:1px solid var(--border-color); padding:1rem; border-radius:12px; width:100%; position:relative; min-height:140px">
        <div style="display:flex; flex-direction:column; gap:1.5rem">
          <div class="input-node-wrapper">
            <div class="node-label">I0</div>
            <div class="input-node course-input" id="mux-i0">0</div>
          </div>
          <div class="input-node-wrapper">
            <div class="node-label">I1</div>
            <div class="input-node course-input" id="mux-i1">0</div>
          </div>
        </div>
        
        <div style="width:70px; height:120px; border:2.5px solid var(--border-color); background:var(--bg-primary); clip-path: polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%); display:flex; align-items:center; justify-content:center; font-family:var(--font-header); font-weight:800; font-size:1.1rem; color:var(--text-secondary)">
          MUX
        </div>

        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1">
          <div class="input-node-wrapper">
            <div class="output-node" id="mux-out">0</div>
            <div class="node-label">Y</div>
          </div>
        </div>
        
        <div style="position:absolute; bottom:-1.25rem; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center">
          <div class="input-node course-input" id="mux-sel" style="padding:0.15rem 0.4rem; font-size:0.75rem; min-height:22px; min-width:22px">0</div>
          <div class="node-label" style="font-size:0.65rem; margin-top:2px">SELECT (S)</div>
        </div>
      </div>
      
      <div style="font-size:0.72rem; color:var(--text-muted); text-align:center; margin-top:1rem">
        If S = 0, Y follows I0.<br>If S = 1, Y follows I1.
      </div>
    </div>`;

  const i0 = document.getElementById('mux-i0');
  const i1 = document.getElementById('mux-i1');
  const sel = document.getElementById('mux-sel');
  const out = document.getElementById('mux-out');

  function updateMux() {
    const valI0 = i0.classList.contains('active') ? 1 : 0;
    const valI1 = i1.classList.contains('active') ? 1 : 0;
    const valSel = sel.classList.contains('active') ? 1 : 0;

    const result = valSel === 0 ? valI0 : valI1;
    out.textContent = result;
    out.classList.toggle('active', result === 1);

    i0.parentElement.style.opacity = valSel === 0 ? '1' : '0.4';
    i1.parentElement.style.opacity = valSel === 1 ? '1' : '0.4';
  }

  [i0, i1, sel].forEach(inp => {
    inp.addEventListener('click', () => {
      if (window.playSound) window.playSound('toggle');
      inp.classList.toggle('active');
      inp.textContent = inp.classList.contains('active') ? '1' : '0';
      updateMux();
    });
  });

  updateMux();
}

function renderTransmissionMediaSim(pane) {
  pane.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:0.75rem; align-items:center; width:100%; max-width:380px; padding:0.5rem">
      <div style="font-family:var(--font-header); font-weight:800; font-size:0.85rem; color:var(--text-muted)">Compare Guided & Unguided Media</div>
      
      <div style="display:flex; gap:0.35rem; width:100%; overflow-x:auto; scrollbar-width:none">
        <button class="mode-toggle-btn active" id="tm-tp-btn" style="font-size:0.7rem; padding:0.35rem 0.5rem">Twisted Pair</button>
        <button class="mode-toggle-btn" id="tm-coax-btn" style="font-size:0.7rem; padding:0.35rem 0.5rem">Coaxial</button>
        <button class="mode-toggle-btn" id="tm-fiber-btn" style="font-size:0.7rem; padding:0.35rem 0.5rem">Fibre Optic</button>
        <button class="mode-toggle-btn" id="tm-wireless-btn" style="font-size:0.7rem; padding:0.35rem 0.5rem">Wireless</button>
      </div>
      
      <div style="width:100%; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:12px; padding:1rem; min-height:160px; display:flex; flex-direction:column; gap:0.5rem">
        <h4 id="tm-title" style="color:var(--color-indigo); font-size:1rem; margin:0">Twisted Pair Cable</h4>
        <div style="display:grid; grid-template-columns: 80px 1fr; gap:0.25rem 0.5rem; font-size:0.78rem">
          <strong class="is-text-muted">Syllabus:</strong> <span id="tm-syllabus">Guided (Wired)</span>
          <strong class="is-text-muted">Bandwidth:</strong> <span id="tm-bw">Up to 10 Gbps (Cat 6a)</span>
          <strong class="is-text-muted">Distance:</strong> <span id="tm-dist">100 meters limit</span>
          <strong class="is-text-muted">Features:</strong> <span id="tm-features">Inexpensive, flexible, sensitive to EMI. UTP/STP types.</span>
        </div>
        <div id="tm-graphic" style="display:flex; justify-content:center; align-items:center; height:40px; margin-top:0.5rem; font-size:1.8rem">
          🔌
        </div>
      </div>
    </div>`;

  const info = {
    tp: {
      title: 'Twisted Pair Cable (UTP / STP)',
      syllabus: 'Guided (Wired)',
      bw: 'Up to 10 Gbps (Cat 6a)',
      dist: '100 meters (maximum segment)',
      features: 'Consists of pairs of copper wires twisted together to reduce electromagnetic interference (EMI). Used extensively in LANs.',
      graphic: '🔌'
    },
    coax: {
      title: 'Coaxial Cable',
      syllabus: 'Guided (Wired)',
      bw: 'Up to 100 Mbps',
      dist: 'Up to 500 meters',
      features: 'Has a central copper conductor surrounded by insulation, shielding, and outer jacket. Highly resistant to EMI. Used in cable TV.',
      graphic: '📺'
    },
    fiber: {
      title: 'Fibre Optic Cable',
      syllabus: 'Guided (Wired)',
      bw: '100+ Gbps (extremely high)',
      dist: 'Tens of kilometers',
      features: 'Transmits data as light pulses through glass or plastic cores. Immune to EMI, lowest latency, highest security, expensive.',
      graphic: '⚡'
    },
    wireless: {
      title: 'Wireless Media (Radio, Micro, Sat)',
      syllabus: 'Unguided (Wireless)',
      bw: 'Varies (up to 1+ Gbps)',
      dist: 'Global (via satellites)',
      features: 'Uses electromagnetic waves (Radio, Microwave, Infrared) to transmit signals through the air. Susceptible to weather.',
      graphic: '📡'
    }
  };

  const btnTp = document.getElementById('tm-tp-btn');
  const btnCoax = document.getElementById('tm-coax-btn');
  const btnFiber = document.getElementById('tm-fiber-btn');
  const btnWireless = document.getElementById('tm-wireless-btn');

  const titleEl = document.getElementById('tm-title');
  const sylEl = document.getElementById('tm-syllabus');
  const bwEl = document.getElementById('tm-bw');
  const distEl = document.getElementById('tm-dist');
  const featEl = document.getElementById('tm-features');
  const graphEl = document.getElementById('tm-graphic');

  const btns = [btnTp, btnCoax, btnFiber, btnWireless];

  function showMedia(key) {
    btns.forEach(b => b.classList.remove('active'));
    document.getElementById(`tm-${key}-btn`).classList.add('active');
    const data = info[key];
    titleEl.textContent = data.title;
    sylEl.textContent = data.syllabus;
    bwEl.textContent = data.bw;
    distEl.textContent = data.dist;
    featEl.textContent = data.features;
    graphEl.textContent = data.graphic;
  }

  btnTp.addEventListener('click', () => { if(window.playSound) window.playSound('click'); showMedia('tp'); });
  btnCoax.addEventListener('click', () => { if(window.playSound) window.playSound('click'); showMedia('coax'); });
  btnFiber.addEventListener('click', () => { if(window.playSound) window.playSound('click'); showMedia('fiber'); });
  btnWireless.addEventListener('click', () => { if(window.playSound) window.playSound('click'); showMedia('wireless'); });
}

function renderNetworkDevicesSim(pane) {
  pane.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:0.5rem; align-items:center; width:100%; max-width:380px; padding:0.5rem">
      <div style="font-family:var(--font-header); font-weight:800; font-size:0.85rem; color:var(--text-muted)">Network Devices Simulation</div>
      
      <div style="display:flex; gap:0.35rem; width:100%">
        <button class="mode-toggle-btn active" id="nd-hub-btn" style="flex:1; font-size:0.75rem; padding:0.35rem 0">Hub</button>
        <button class="mode-toggle-btn" id="nd-switch-btn" style="flex:1; font-size:0.75rem; padding:0.35rem 0">Switch</button>
      </div>

      <div style="position:relative; width:100%; height:130px; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:12px; overflow:hidden">
        <div id="nd-node-src" style="position:absolute; left:20px; top:50px; width:30px; height:30px; border-radius:50%; background:var(--color-indigo); display:flex; align-items:center; justify-content:center; color:#fff; font-size:0.75rem; font-weight:bold">A</div>
        
        <div id="nd-node-device" style="position:absolute; left:50%; top:50px; transform:translateX(-50%); width:60px; height:30px; border:2px solid var(--border-color); background:var(--bg-primary); border-radius:6px; display:flex; align-items:center; justify-content:center; color:var(--text-primary); font-size:0.75rem; font-weight:bold">HUB</div>
        
        <div id="nd-node-dst1" style="position:absolute; right:20px; top:20px; width:30px; height:30px; border-radius:50%; background:var(--bg-tertiary); border:1.5px solid var(--border-color); display:flex; align-items:center; justify-content:center; color:var(--text-secondary); font-size:0.75rem; font-weight:bold">B</div>
        <div id="nd-node-dst2" style="position:absolute; right:20px; top:80px; width:30px; height:30px; border-radius:50%; background:var(--bg-tertiary); border:1.5px solid var(--border-color); display:flex; align-items:center; justify-content:center; color:var(--text-secondary); font-size:0.75rem; font-weight:bold">C</div>

        <div id="nd-packet1" style="position:absolute; width:8px; height:8px; background:var(--color-success); border-radius:50%; display:none; z-index:10"></div>
        <div id="nd-packet2" style="position:absolute; width:8px; height:8px; background:var(--color-success); border-radius:50%; display:none; z-index:10"></div>
      </div>
      
      <button class="btn-primary" id="nd-send-btn" style="padding:0.4rem 1rem; font-size:0.8rem; font-family:var(--font-header); font-weight:700">Send Packet A → B</button>
      
      <div id="nd-explanation" style="font-size:0.75rem; color:var(--text-secondary); text-align:center; padding:0 0.5rem; min-height:36px">
        A Hub broadcast inputs to ALL ports. It operates at Physical Layer (Layer 1).
      </div>
    </div>`;

  const btnHub = document.getElementById('nd-hub-btn');
  const btnSwitch = document.getElementById('nd-switch-btn');
  const btnSend = document.getElementById('nd-send-btn');
  const deviceNode = document.getElementById('nd-node-device');
  const expEl = document.getElementById('nd-explanation');

  const p1 = document.getElementById('nd-packet1');
  const p2 = document.getElementById('nd-packet2');

  let currentMode = 'hub';
  let isAnimating = false;

  btnHub.addEventListener('click', () => {
    if(window.playSound) window.playSound('click');
    currentMode = 'hub';
    btnHub.classList.add('active');
    btnSwitch.classList.remove('active');
    deviceNode.textContent = 'HUB';
    expEl.textContent = 'A Hub broadcasts inputs to ALL ports. It operates at Physical Layer (Layer 1) and causes high collision risk.';
  });

  btnSwitch.addEventListener('click', () => {
    if(window.playSound) window.playSound('click');
    currentMode = 'switch';
    btnSwitch.classList.add('active');
    btnHub.classList.remove('active');
    deviceNode.textContent = 'SWITCH';
    expEl.textContent = 'A Switch forwards packets ONLY to the destination MAC port. It operates at Data Link Layer (Layer 2) for collision-free routing.';
  });

  btnSend.addEventListener('click', () => {
    if (isAnimating) return;
    if(window.playSound) window.playSound('click');
    isAnimating = true;
    btnSend.disabled = true;

    const srcX = 35, srcY = 65;
    const devX = 190, devY = 65;
    const dst1X = 330, dst1Y = 35;
    const dst2X = 330, dst2Y = 95;

    p1.style.display = 'block';
    p1.style.left = `${srcX}px`;
    p1.style.top = `${srcY}px`;

    animatePacket(p1, srcX, srcY, devX, devY, 600, () => {
      if (currentMode === 'hub') {
        p2.style.display = 'block';
        p2.style.left = `${devX}px`;
        p2.style.top = `${devY}px`;
        
        animatePacket(p1, devX, devY, dst1X, dst1Y, 600);
        animatePacket(p2, devX, devY, dst2X, dst2Y, 600, () => {
          endAnim();
        });
      } else {
        animatePacket(p1, devX, devY, dst1X, dst1Y, 600, () => {
          endAnim();
        });
      }
    });
  });

  function animatePacket(packet, x1, y1, x2, y2, duration, callback) {
    const start = performance.now();
    function frame(time) {
      let progress = (time - start) / duration;
      if (progress > 1) progress = 1;
      const curX = x1 + (x2 - x1) * progress;
      const curY = y1 + (y2 - y1) * progress;
      packet.style.left = `${curX}px`;
      packet.style.top = `${curY}px`;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else if (callback) {
        callback();
      }
    }
    requestAnimationFrame(frame);
  }

  function endAnim() {
    setTimeout(() => {
      p1.style.display = 'none';
      p2.style.display = 'none';
      btnSend.disabled = false;
      isAnimating = false;
    }, 400);
  }
}

window.drawCourseWires = drawCourseWires;