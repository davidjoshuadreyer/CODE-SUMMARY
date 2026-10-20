/* Original MCQs transcribed from the released Quiz 1 key; other questions are authored practice. */
window.ECET_MCQ = [
  {
    "id": "quiz1-q1",
    "chapter": 1,
    "prompt": "The dependent source in figure below is:",
    "choices": [
      "voltage-controlled current source",
      "voltage-controlled voltage source",
      "current-controlled voltage source",
      "current-controlled current source"
    ],
    "correct": 3,
    "explanation": "The diamond means dependent source. Its arrow specifies current output, and 6iₒ depends on the controlling current iₒ.",
    "origin": "quiz",
    "number": 1,
    "page": 1,
    "crop": "140 398 650 250",
    "diagram": "145 705 540 200"
  },
  {
    "id": "quiz1-q7",
    "chapter": 2,
    "prompt": "The total power dissipated in a parallel circuit is equal to the",
    "choices": [
      "power in the largest resistor.",
      "power in the smallest resistor.",
      "average of the power in all resistors.",
      "sum of the power in all resistors."
    ],
    "correct": 3,
    "explanation": "Add the power dissipated by each resistor: Ptotal = P₁ + P₂ + … .",
    "origin": "quiz",
    "number": 7,
    "page": 4,
    "crop": "145 710 710 260"
  },
  {
    "id": "quiz1-q8",
    "chapter": 2,
    "prompt": "KCL is based on the law of conservation of",
    "choices": [
      "energy.",
      "charge.",
      "voltage.",
      "power."
    ],
    "correct": 1,
    "explanation": "KCL is charge balance at a node: total current entering equals total current leaving.",
    "origin": "quiz",
    "number": 8,
    "page": 5,
    "crop": "145 130 640 250"
  },
  {
    "id": "quiz1-q9",
    "chapter": 1,
    "prompt": "Which of the following ideal circuit elements dissipates energy",
    "choices": [
      "inductor.",
      "capacitor.",
      "resistor.",
      "none of the above."
    ],
    "correct": 2,
    "explanation": "A resistor converts electrical energy to heat. Ideal capacitors and inductors store and return energy.",
    "origin": "quiz",
    "number": 9,
    "page": 5,
    "crop": "145 470 750 260"
  },
  {
    "id": "p1-source",
    "chapter": 1,
    "prompt": "A diamond-shaped source has +/− markings and a value of 4iₓ. What type is it?",
    "choices": [
      "Voltage-controlled voltage source",
      "Current-controlled voltage source",
      "Current-controlled current source",
      "Independent voltage source"
    ],
    "correct": 1,
    "explanation": "The +/− markings indicate voltage output; iₓ is the controlling current.",
    "origin": "practice"
  },
  {
    "id": "p1-charge",
    "chapter": 1,
    "prompt": "A constant 3 mA flows for 4 s. How much charge passes?",
    "choices": [
      "0.75 mC",
      "7 mC",
      "12 mC",
      "12 C"
    ],
    "correct": 2,
    "explanation": "Q = It = (3 mA)(4 s) = 12 mC.",
    "origin": "practice"
  },
  {
    "id": "p1-derivative",
    "chapter": 1,
    "prompt": "If q(t) = 5t² mC, what is i(t), with t in seconds?",
    "choices": [
      "5t mA",
      "10t mA",
      "10 mA",
      "(5/3)t³ mA"
    ],
    "correct": 1,
    "explanation": "Differentiate charge: i = dq/dt = 10t mC/s = 10t mA.",
    "origin": "practice"
  },
  {
    "id": "p1-power",
    "chapter": 1,
    "prompt": "A 2 A current enters the positive terminal of an element with 6 V across it. Its absorbed power is:",
    "choices": [
      "−12 W",
      "3 W",
      "8 W",
      "12 W"
    ],
    "correct": 3,
    "explanation": "With current entering +, absorbed power is p = vi = 6 × 2 = 12 W.",
    "origin": "practice"
  },
  {
    "id": "p1-delivery",
    "chapter": 1,
    "prompt": "A 3 A current enters the negative terminal of a 10 V element. What is its absorbed power?",
    "choices": [
      "30 W",
      "−30 W",
      "10/3 W",
      "0 W"
    ],
    "correct": 1,
    "explanation": "Current enters −, so absorbed power is −vi = −30 W. It delivers 30 W.",
    "origin": "practice"
  },
  {
    "id": "p1-energy",
    "chapter": 1,
    "prompt": "A device absorbs a constant 5 W for 2 minutes. How much energy does it absorb?",
    "choices": [
      "10 J",
      "150 J",
      "600 J",
      "0.167 J"
    ],
    "correct": 2,
    "explanation": "Convert time: 2 min = 120 s. W = Pt = 5 × 120 = 600 J.",
    "origin": "practice"
  },
  {
    "id": "p2-ohm",
    "chapter": 2,
    "prompt": "A 12 V supply is connected across 4 kΩ. What is the current?",
    "choices": [
      "3 mA",
      "3 A",
      "48 mA",
      "0.333 mA"
    ],
    "correct": 0,
    "explanation": "I = V/R = 12/4000 = 0.003 A = 3 mA.",
    "origin": "practice"
  },
  {
    "id": "p2-parallel",
    "chapter": 2,
    "prompt": "What is the equivalent resistance of 6 Ω in parallel with 3 Ω?",
    "choices": [
      "9 Ω",
      "4.5 Ω",
      "3 Ω",
      "2 Ω"
    ],
    "correct": 3,
    "explanation": "Req = (6 × 3)/(6 + 3) = 2 Ω.",
    "origin": "practice"
  },
  {
    "id": "p2-divider",
    "chapter": 2,
    "prompt": "A 2 Ω and a 4 Ω resistor are in series across 12 V. What is the voltage across 4 Ω?",
    "choices": [
      "4 V",
      "8 V",
      "6 V",
      "12 V"
    ],
    "correct": 1,
    "explanation": "V₄ = 12 × 4/(2 + 4) = 8 V.",
    "origin": "practice"
  },
  {
    "id": "p2-current-divider",
    "chapter": 2,
    "prompt": "A total current of 6 A enters parallel 3 Ω and 6 Ω branches. What current flows through 3 Ω?",
    "choices": [
      "2 A",
      "3 A",
      "4 A",
      "6 A"
    ],
    "correct": 2,
    "explanation": "I₃ = 6 × 6/(3 + 6) = 4 A. The lower resistance carries more current.",
    "origin": "practice"
  },
  {
    "id": "p2-kcl",
    "chapter": 2,
    "prompt": "Currents of 2 A and 5 A enter a node. A 3 A current and an unknown current leave it. What is the unknown outward current?",
    "choices": [
      "4 A",
      "10 A",
      "−4 A",
      "6 A"
    ],
    "correct": 0,
    "explanation": "KCL: 2 + 5 = 3 + I, so I = 4 A outward.",
    "origin": "practice"
  },
  {
    "id": "p2-kvl",
    "chapter": 2,
    "prompt": "KVL says that the algebraic sum of voltages around a closed loop is:",
    "choices": [
      "Equal to the largest voltage",
      "Always positive",
      "Equal to total current",
      "Zero"
    ],
    "correct": 3,
    "explanation": "Voltage rises and drops sum to zero around a closed loop.",
    "origin": "practice"
  },
  {
    "id": "p3-node-current",
    "chapter": 3,
    "prompt": "A 3 Ω resistor connects node a at 10 V to node b at 4 V. What current flows from a to b?",
    "choices": [
      "14/3 A",
      "2 A",
      "−2 A",
      "6 A"
    ],
    "correct": 1,
    "explanation": "Iab = (Va − Vb)/R = (10 − 4)/3 = 2 A.",
    "origin": "practice"
  },
  {
    "id": "p3-supernode",
    "chapter": 3,
    "prompt": "An ideal voltage source connects two non-reference nodes. Which method is normally useful?",
    "choices": [
      "Supernode KCL plus a voltage constraint",
      "Replace the source with a resistor",
      "Ignore one of the nodes",
      "Supermesh plus a current constraint"
    ],
    "correct": 0,
    "explanation": "Write KCL around both nodes together, then use V+ − V− = Vs.",
    "origin": "practice"
  },
  {
    "id": "p3-reference",
    "chapter": 3,
    "prompt": "In nodal analysis, the reference node is assigned:",
    "choices": [
      "The largest voltage",
      "The supply current",
      "0 V",
      "An unknown voltage"
    ],
    "correct": 2,
    "explanation": "All other node voltages are measured relative to the chosen 0 V reference.",
    "origin": "practice"
  },
  {
    "id": "p3-mesh",
    "chapter": 3,
    "prompt": "Two clockwise mesh currents I₁ = 3 A and I₂ = 1 A oppose each other in a shared 5 Ω resistor. What is the drop along I₁?",
    "choices": [
      "20 V",
      "15 V",
      "5 V",
      "10 V"
    ],
    "correct": 3,
    "explanation": "The branch current along I₁ is I₁ − I₂ = 2 A; the drop is 5 × 2 = 10 V.",
    "origin": "practice"
  },
  {
    "id": "p3-supermesh",
    "chapter": 3,
    "prompt": "An ideal current source lies on the branch shared by two meshes. Use:",
    "choices": [
      "A supernode only",
      "A supermesh and a current constraint",
      "A voltage divider",
      "An open circuit in place of the source"
    ],
    "correct": 1,
    "explanation": "Write KVL around the outside of both meshes and use the source to relate their currents.",
    "origin": "practice"
  },
  {
    "id": "p3-equation",
    "chapter": 3,
    "prompt": "Node v connects to ground through 4 Ω and to a 12 V node through 2 Ω. No other branch connects. Which KCL equation is correct?",
    "choices": [
      "v/4 + (v − 12)/2 = 0",
      "v/4 + (v + 12)/2 = 0",
      "4v + 2(v − 12) = 0",
      "v/4 = 12/2"
    ],
    "correct": 0,
    "explanation": "Sum outward currents: v/4 to ground plus (v − 12)/2 to the 12 V node equals zero.",
    "origin": "practice"
  },
  {
    "id": "p4-off",
    "chapter": 4,
    "prompt": "When finding resistance seen at terminals, how are independent ideal voltage and current sources turned off?",
    "choices": [
      "Both opened",
      "Both shorted",
      "Voltage shorted; current opened",
      "Voltage opened; current shorted"
    ],
    "correct": 2,
    "explanation": "Zero volts gives a short circuit. Zero current gives an open circuit.",
    "origin": "practice"
  },
  {
    "id": "p4-dependent",
    "chapter": 4,
    "prompt": "During superposition, dependent sources are:",
    "choices": [
      "Always opened",
      "Always shorted",
      "Included only once",
      "Kept active with their control relations"
    ],
    "correct": 3,
    "explanation": "Only independent sources are turned off. Dependent sources continue to respond to the circuit variables.",
    "origin": "practice"
  },
  {
    "id": "p4-power",
    "chapter": 4,
    "prompt": "For a linear circuit with several independent sources, superposition can directly add:",
    "choices": [
      "Voltages and currents",
      "Powers only",
      "Voltages and powers",
      "Resistance values"
    ],
    "correct": 0,
    "explanation": "Voltage and current responses add. Power is nonlinear (for example, I²R), so calculate it from the total response.",
    "origin": "practice"
  },
  {
    "id": "p4-transform",
    "chapter": 4,
    "prompt": "An 18 V source in series with 6 Ω transforms into:",
    "choices": [
      "A 3 A source in series with 6 Ω",
      "A 3 A source in parallel with 6 Ω",
      "A 108 A source in parallel with 6 Ω",
      "An 18 A source in parallel with 6 Ω"
    ],
    "correct": 1,
    "explanation": "Is = Vs/R = 18/6 = 3 A. The same resistance becomes parallel; the arrow points toward the original positive terminal.",
    "origin": "practice"
  },
  {
    "id": "p4-load",
    "chapter": 4,
    "prompt": "A Thévenin equivalent has VTh = 12 V and RTh = 3 Ω. What current flows through a 9 Ω load?",
    "choices": [
      "4 A",
      "1.33 A",
      "1 A",
      "0.75 A"
    ],
    "correct": 2,
    "explanation": "IL = VTh/(RTh + RL) = 12/(3 + 9) = 1 A.",
    "origin": "practice"
  },
  {
    "id": "p4-max",
    "chapter": 4,
    "prompt": "A source has VTh = 12 V and RTh = 3 Ω. Which load receives maximum power, and how much?",
    "choices": [
      "RL = 6 Ω; 6 W",
      "RL = 0 Ω; 48 W",
      "RL = 12 Ω; 12 W",
      "RL = 3 Ω; 12 W"
    ],
    "correct": 3,
    "explanation": "Match RL to RTh. Pmax = VTh²/(4RTh) = 144/12 = 12 W.",
    "origin": "practice"
  },
  {
    "id": "p6-dc",
    "chapter": 6,
    "prompt": "At DC steady state, ideal capacitors and inductors act as:",
    "choices": [
      "Capacitor open; inductor short",
      "Capacitor short; inductor open",
      "Both open",
      "Both short"
    ],
    "correct": 0,
    "explanation": "For constant capacitor voltage, iC = C dv/dt = 0. For constant inductor current, vL = L di/dt = 0.",
    "origin": "practice"
  },
  {
    "id": "p6-cap",
    "chapter": 6,
    "prompt": "The voltage across a 2 μF capacitor rises at 3 V/ms. What current enters its positive terminal?",
    "choices": [
      "6 μA",
      "1.5 mA",
      "6 mA",
      "6 A"
    ],
    "correct": 2,
    "explanation": "3 V/ms = 3000 V/s. i = C dv/dt = 2 × 10⁻⁶ × 3000 = 0.006 A.",
    "origin": "practice"
  },
  {
    "id": "p6-ind",
    "chapter": 6,
    "prompt": "The current entering the positive terminal of a 0.5 H inductor rises at 4 A/s. What voltage is across it?",
    "choices": [
      "8 V",
      "2 V",
      "−2 V",
      "0.125 V"
    ],
    "correct": 1,
    "explanation": "v = L di/dt = 0.5 × 4 = 2 V with the stated passive polarity.",
    "origin": "practice"
  },
  {
    "id": "p6-series",
    "chapter": 6,
    "prompt": "Two capacitors, 6 μF and 3 μF, are connected in series. Their equivalent capacitance is:",
    "choices": [
      "9 μF",
      "3 μF",
      "4.5 μF",
      "2 μF"
    ],
    "correct": 3,
    "explanation": "Cs = C₁C₂/(C₁ + C₂) = 18/9 = 2 μF.",
    "origin": "practice"
  },
  {
    "id": "p6-continuity",
    "chapter": 6,
    "prompt": "With finite currents and voltages, which quantities cannot jump instantaneously?",
    "choices": [
      "Capacitor voltage and inductor current",
      "Capacitor current and inductor voltage",
      "Both capacitor voltage and current",
      "All resistor currents"
    ],
    "correct": 0,
    "explanation": "An instantaneous jump in vC would require infinite current; a jump in iL would require infinite voltage.",
    "origin": "practice"
  },
  {
    "id": "p6-energy",
    "chapter": 6,
    "prompt": "How much energy is stored in a 4 μF capacitor at 10 V?",
    "choices": [
      "40 μJ",
      "400 μJ",
      "200 μJ",
      "20 J"
    ],
    "correct": 2,
    "explanation": "W = ½CV² = ½ × 4 × 10⁻⁶ × 100 = 200 μJ.",
    "origin": "practice"
  }
];
