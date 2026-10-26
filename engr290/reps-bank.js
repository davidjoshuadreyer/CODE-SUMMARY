window.ENGR_REPS = [
  {
    "id": "a1q1-0",
    "assignment": 1,
    "source": 1,
    "topic": "Density",
    "prompt": "One mole of MgO (40.304 g) fills a cube of side 22.37 mm. What is its density?",
    "options": [
      "3.600 g/cm³",
      "0.003600 g/cm³",
      "18.02 g/cm³",
      "36.00 g/cm³"
    ],
    "correct": 0,
    "hint": "Convert the side to cm before cubing it.",
    "steps": [
      "22.37 mm = 2.237 cm.",
      "V = 2.237³ = 11.1943 cm³.",
      "ρ = 40.304 / 11.1943 = 3.600 g/cm³."
    ]
  },
  {
    "id": "a1q1-1",
    "assignment": 1,
    "source": 1,
    "topic": "Density",
    "prompt": "A cube’s side is doubled while its mass stays fixed. Its density becomes:",
    "options": [
      "One eighth as large",
      "One half as large",
      "Twice as large",
      "Eight times as large"
    ],
    "correct": 0,
    "hint": "Volume depends on the cube of the side.",
    "steps": [
      "Vnew = (2L)³ = 8V.",
      "ρnew = m/(8V) = ρ/8."
    ]
  },
  {
    "id": "a1q1-2",
    "assignment": 1,
    "source": 1,
    "topic": "Density",
    "prompt": "Which is the volume of a cube with side 22.37 mm?",
    "options": [
      "11.1943 cm³",
      "1119.43 cm³",
      "2.237 cm³",
      "0.0111943 cm³"
    ],
    "correct": 0,
    "hint": "1 cm³ = 1000 mm³.",
    "steps": [
      "22.37 mm / 10 = 2.237 cm.",
      "Cube the converted side: V = 11.1943 cm³."
    ]
  },
  {
    "id": "a1q2-3",
    "assignment": 1,
    "source": 2,
    "topic": "Density",
    "prompt": "Using M(Mg) = 24.305 g/mol and ρ = 1.74 g/cm³, what is the side of a cube containing 1 mol Mg?",
    "options": [
      "2.41 cm",
      "13.97 cm",
      "3.74 cm",
      "24.305 cm"
    ],
    "correct": 0,
    "hint": "First find V = m/ρ; then take the cube root.",
    "steps": [
      "m = 24.305 g.",
      "V = 24.305/1.74 = 13.9684 cm³.",
      "L = ∛13.9684 = 2.408 cm. All three dimensions equal this."
    ]
  },
  {
    "id": "a1q2-4",
    "assignment": 1,
    "source": 2,
    "topic": "Density",
    "prompt": "At the same density, a cube containing 8 mol Mg has what side compared with a 1 mol cube?",
    "options": [
      "Twice the side",
      "Eight times the side",
      "Four times the side",
      "The same side"
    ],
    "correct": 0,
    "hint": "Mass and volume both grow by 8.",
    "steps": [
      "L scales as the cube root of volume.",
      "∛8 = 2, so the side doubles."
    ]
  },
  {
    "id": "a1q3-5",
    "assignment": 1,
    "source": 3,
    "topic": "Crystal geometry",
    "prompt": "In a cubic crystal, what is the angle between [110] and [111]?",
    "options": [
      "35.26°",
      "54.74°",
      "45°",
      "0.8165°"
    ],
    "correct": 0,
    "hint": "Use cos θ = (u·v)/(|u||v|).",
    "steps": [
      "u·v = 1 + 1 + 0 = 2.",
      "|u| = √2 and |v| = √3.",
      "θ = arccos(2/√6) = 35.26°."
    ]
  },
  {
    "id": "a1q3-6",
    "assignment": 1,
    "source": 3,
    "topic": "Crystal geometry",
    "prompt": "In a cubic crystal, what is the angle between [100] and [011]?",
    "options": [
      "90°",
      "45°",
      "60°",
      "0°"
    ],
    "correct": 0,
    "hint": "Calculate the dot product before the vector lengths.",
    "steps": [
      "(1,0,0)·(0,1,1) = 0.",
      "cos θ = 0, so θ = 90°."
    ]
  },
  {
    "id": "a1q4-7",
    "assignment": 1,
    "source": 4,
    "topic": "Crystal geometry",
    "prompt": "For the plane (3, −1, 1), what are the axial intercepts?",
    "options": [
      "a/3, −b, c",
      "3a, −b, c",
      "a/3, b, c",
      "a, −3b, 3c"
    ],
    "correct": 0,
    "hint": "Divide each lattice length by its corresponding Miller index.",
    "steps": [
      "x = a/h = a/3.",
      "y = b/k = −b; z = c/l = c.",
      "The middle overbar in the handout means a negative y intercept."
    ]
  },
  {
    "id": "a1q4-8",
    "assignment": 1,
    "source": 4,
    "topic": "Crystal geometry",
    "prompt": "A plane has intercepts a, 2b, and infinity. What are its Miller indices?",
    "options": [
      "(210)",
      "(120)",
      "(201)",
      "(110)"
    ],
    "correct": 0,
    "hint": "Take reciprocals, then clear fractions.",
    "steps": [
      "Reciprocals: 1, 1/2, 0.",
      "Multiply by 2 → (210). A zero means the plane is parallel to that axis."
    ]
  },
  {
    "id": "a1q5-9",
    "assignment": 1,
    "source": 5,
    "topic": "Vacancies",
    "prompt": "For f = A exp(−Q/kT), which expression uses a known initial fraction f₁ to find f₂?",
    "options": [
      "f₂ = f₁ exp[(Q/k)(1/T₁ − 1/T₂)]",
      "f₂ = f₁ exp[(Q/k)(1/T₂ − 1/T₁)]",
      "f₂ = exp(−Q/kT₂), regardless of f₁",
      "f₂ = f₁(T₂/T₁)"
    ],
    "correct": 0,
    "hint": "Divide the two exponential equations to eliminate A.",
    "steps": [
      "f₂/f₁ = exp[−Q/(kT₂) + Q/(kT₁)].",
      "Factor out Q/k and multiply by f₁. This assumes the same A and Q."
    ]
  },
  {
    "id": "a1q5-10",
    "assignment": 1,
    "source": 5,
    "topic": "Vacancies",
    "prompt": "Given f₁ = 2.29×10⁻⁵ at 400°C, Q = 0.76 eV and k = 8.62×10⁻⁵ eV/K, find f₂ at 660°C.",
    "options": [
      "8.81×10⁻⁴",
      "5.96×10⁻⁷",
      "0.0881",
      "2.29×10⁻⁵"
    ],
    "correct": 0,
    "hint": "Use 673.15 K and 933.15 K in the ratio equation.",
    "steps": [
      "Exponent = (0.76/0.0000862)(1/673.15 − 1/933.15) = 3.64936.",
      "f₂ = 2.29×10⁻⁵ × exp(3.64936) = 8.805×10⁻⁴.",
      "This is 0.08805%, not a fraction of 0.08805."
    ]
  },
  {
    "id": "a1q5-11",
    "assignment": 1,
    "source": 5,
    "topic": "Vacancies",
    "prompt": "Why should the vacancy fraction increase when temperature rises?",
    "options": [
      "The negative exponent becomes less negative",
      "The formation energy becomes zero",
      "Kelvin temperature becomes negative",
      "Every lattice site becomes vacant"
    ],
    "correct": 0,
    "hint": "Consider −Q/(kT) as T grows.",
    "steps": [
      "For Q > 0 and T > 0, increasing T reduces the magnitude of the negative exponent.",
      "The exponential and the equilibrium vacancy fraction increase."
    ]
  },
  {
    "id": "a1q6-12",
    "assignment": 1,
    "source": 6,
    "topic": "Diffusion",
    "prompt": "For C₀ = 0.2, Cₛ = 1.0 and C = 0.6 wt%, what is (C − C₀)/(Cₛ − C₀)?",
    "options": [
      "0.5",
      "0.6",
      "0.4",
      "0.8"
    ],
    "correct": 0,
    "hint": "Subtract the initial concentration in both numerator and denominator.",
    "steps": [
      "(0.6 − 0.2)/(1.0 − 0.2) = 0.4/0.8 = 0.5."
    ]
  },
  {
    "id": "a1q6-13",
    "assignment": 1,
    "source": 6,
    "topic": "Diffusion",
    "prompt": "If (C − C₀)/(Cₛ − C₀) = 0.5 = 1 − erf(z), and erf(0.4769) ≈ 0.5, what is z?",
    "options": [
      "0.4769",
      "0.5",
      "1.5",
      "0.25"
    ],
    "correct": 0,
    "hint": "Distinguish the error function value from its argument.",
    "steps": [
      "erf(z) = 1 − 0.5 = 0.5.",
      "The supplied inverse lookup gives z = 0.4769."
    ]
  },
  {
    "id": "a1q6-14",
    "assignment": 1,
    "source": 6,
    "topic": "Diffusion",
    "prompt": "Using x = 1 mm, D = 2.98×10⁻¹¹ m²/s and z = 0.4769, find diffusion time.",
    "options": [
      "About 10.25 h",
      "About 2.56 h",
      "About 40.98 h",
      "About 0.01025 h"
    ],
    "correct": 0,
    "hint": "Rearrange z = x/(2√Dt), and convert x to metres.",
    "steps": [
      "t = x²/(4Dz²).",
      "t = 0.001²/[4(2.98×10⁻¹¹)(0.4769)²] ≈ 3.69×10⁴ s.",
      "Divide by 3600 → 10.25 h."
    ]
  },
  {
    "id": "a1q6-15",
    "assignment": 1,
    "source": 6,
    "topic": "Diffusion",
    "prompt": "For the same D and target concentration, reaching 2 mm instead of 1 mm takes:",
    "options": [
      "Four times as long",
      "Twice as long",
      "Half as long",
      "The same time"
    ],
    "correct": 0,
    "hint": "At fixed z and D, t is proportional to x².",
    "steps": [
      "t₂/t₁ = (x₂/x₁)² = 2² = 4."
    ]
  },
  {
    "id": "a2q1-16",
    "assignment": 2,
    "source": 1,
    "topic": "Polymers",
    "prompt": "Which transition marks the glassy, rigid state of the amorphous portion of a thermoplastic on cooling?",
    "options": [
      "Glass transition temperature, Tg",
      "Boiling temperature",
      "Only the crystalline melting temperature, Tm",
      "Decomposition temperature"
    ],
    "correct": 0,
    "hint": "Think about when large-scale segmental motion becomes restricted.",
    "steps": [
      "Below Tg, segmental motion is restricted and the amorphous material becomes glassy.",
      "This is the intended glass-transition concept. Semicrystalline polymers can retain useful stiffness above Tg because crystals remain until Tm."
    ]
  },
  {
    "id": "a2q2-17",
    "assignment": 2,
    "source": 2,
    "topic": "Polymers",
    "prompt": "Why can drawing a thermoplastic increase its strength along the drawing direction?",
    "options": [
      "Chains align and become harder to extend further",
      "All covalent bonds break",
      "The polymer becomes a metal",
      "All chains disappear into the melt"
    ],
    "correct": 0,
    "hint": "Think about molecular orientation.",
    "steps": [
      "Plastic drawing uncoils and orients chains toward the load.",
      "Aligned chains resist further extension; orientation and sometimes increased crystallinity strengthen the material in that direction."
    ]
  },
  {
    "id": "a2q3-18",
    "assignment": 2,
    "source": 3,
    "topic": "Solidification",
    "prompt": "Under stable planar solidification, what tends to happen to a small solid bump protruding into warmer liquid?",
    "options": [
      "It remelts, helping restore a flat front",
      "It always grows into a dendrite",
      "It eliminates latent heat",
      "It instantly freezes all liquid"
    ],
    "correct": 0,
    "hint": "The liquid ahead of a stable front is not undercooled relative to its local freezing temperature.",
    "steps": [
      "Heat released by solidification must be removed, commonly through the solid.",
      "A bump entering warmer liquid is unfavourable and remelts. This smooths the interface.",
      "An undercooled liquid can instead amplify protrusions and promote dendritic growth."
    ]
  },
  {
    "id": "a2q4-19",
    "assignment": 2,
    "source": 4,
    "topic": "Polymers",
    "prompt": "Why can an elastomer stretch greatly despite being cross-linked?",
    "options": [
      "Long flexible chain segments uncoil between sparse crosslinks",
      "Every bond stretches to three times its length",
      "It has no molecular bonds",
      "Crosslinks all break permanently during normal stretching"
    ],
    "correct": 0,
    "hint": "Crosslink density and chain flexibility both matter.",
    "steps": [
      "Elastomers have flexible, coiled chains and relatively sparse crosslinks.",
      "Chains uncoil and reorient above Tg; crosslinks prevent unrestricted flow and help restore shape.",
      "Dense crosslinking in thermosets restricts this motion."
    ]
  },
  {
    "id": "a2q5-20",
    "assignment": 2,
    "source": 5,
    "topic": "Phase rule",
    "prompt": "Using the full Gibbs rule F = C − P + 2, what is F for a binary alloy in one liquid phase?",
    "options": [
      "3",
      "2",
      "1",
      "0"
    ],
    "correct": 0,
    "hint": "Count two components and one phase.",
    "steps": [
      "C = 2 and P = 1.",
      "F = 2 − 1 + 2 = 3. At fixed pressure the reduced rule instead gives 2."
    ]
  },
  {
    "id": "a2q5-21",
    "assignment": 2,
    "source": 5,
    "topic": "Phase rule",
    "prompt": "At fixed pressure, a binary alloy contains two equilibrium phases. How many intensive degrees of freedom does the reduced phase rule give?",
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 0,
    "hint": "With pressure fixed, use F = C − P + 1.",
    "steps": [
      "F = 2 − 2 + 1 = 1.",
      "The full rule, allowing pressure to vary, gives 2. Always state the convention."
    ]
  },
  {
    "id": "a2q5-22",
    "assignment": 2,
    "source": 5,
    "topic": "Phase rule",
    "prompt": "At 20 wt% Cu and 500°C, the supplied Al–Cu diagram shows Al-rich α plus θ. Under the full phase rule, what is F?",
    "options": [
      "2; the printed answer of 3 appears inconsistent",
      "3 because there are two solid phases",
      "1 under the full rule",
      "0 because all material is solid"
    ],
    "correct": 0,
    "hint": "Count phases, not whether the alloy is entirely solid.",
    "steps": [
      "At 20 wt% Cu and 500°C the point lies between α and θ in a two-phase field.",
      "C = 2, P = 2 → F = 2 − 2 + 2 = 2; at fixed pressure F = 1.",
      "The handout prints 3 for part (c). That conflicts with its two-phase diagram; confirm the intended key with your instructor."
    ],
    "fig": 1
  },
  {
    "id": "a2q6-23",
    "assignment": 2,
    "source": 6,
    "topic": "Phase diagrams",
    "prompt": "On slow cooling 20 at.% Ag–80 at.% Cu, which primary solid forms first?",
    "options": [
      "Cu-rich α",
      "Ag-rich β",
      "Pure silver only",
      "The eutectic forms before any primary solid"
    ],
    "correct": 0,
    "hint": "Use the top atomic-percent scale, then trace down to the liquidus.",
    "steps": [
      "20 at.% Ag is on the Cu-rich side of the eutectic.",
      "Primary α forms first. Remaining liquid becomes richer in Ag.",
      "At about 780°C the remaining liquid transforms into α + β eutectic."
    ],
    "fig": 2
  },
  {
    "id": "a2q6-24",
    "assignment": 2,
    "source": 6,
    "topic": "Phase diagrams",
    "prompt": "On slow cooling 80 at.% Ag–20 at.% Cu, what is the expected microstructure just below the eutectic?",
    "options": [
      "Primary β plus α + β eutectic",
      "Primary α plus pure liquid",
      "Only pure copper",
      "Single-phase liquid"
    ],
    "correct": 0,
    "hint": "This composition is on the Ag-rich side of the eutectic.",
    "steps": [
      "Primary Ag-rich β forms on crossing the liquidus.",
      "The remaining melt moves toward the eutectic composition.",
      "At about 780°C it solidifies as α + β."
    ],
    "fig": 2
  },
  {
    "id": "a2q7-25",
    "assignment": 2,
    "source": 7,
    "topic": "Lever rule",
    "prompt": "For 50 kg of Al–10 wt% Si at 700°C, how much liquid is present?",
    "options": [
      "50 kg",
      "5 kg",
      "25 kg",
      "0 kg"
    ],
    "correct": 0,
    "hint": "Locate the point above the liquidus.",
    "steps": [
      "At 10 wt% Si and 700°C the diagram is entirely liquid.",
      "Liquid fraction = 1, so mL = 50 kg."
    ],
    "fig": 3
  },
  {
    "id": "a2q7-26",
    "assignment": 2,
    "source": 7,
    "topic": "Lever rule",
    "prompt": "A tie line for Al–10 wt% Si at 590°C is approximated by Cα = 1.5 and CL = 11 wt% Si. In 50 kg, how much α is present?",
    "options": [
      "About 5.26 kg",
      "About 44.74 kg",
      "About 10.0 kg",
      "About 25.0 kg"
    ],
    "correct": 0,
    "hint": "The fraction of α uses the opposite tie-line segment.",
    "steps": [
      "wα = (CL − C₀)/(CL − Cα) = (11 − 10)/(11 − 1.5) = 0.1053.",
      "mα = 50(0.1053) = 5.26 kg; mL = 44.74 kg.",
      "Endpoints are explicitly rounded graph readings; different careful readings give slightly different masses."
    ],
    "fig": 3
  },
  {
    "id": "a2q7-27",
    "assignment": 2,
    "source": 7,
    "topic": "Lever rule",
    "prompt": "Just above 577°C, use Cα = 1.6 and CL = 12.6 wt% Si. How much α is present in 50 kg of Al–10 wt% Si?",
    "options": [
      "11.82 kg",
      "38.18 kg",
      "4.27 kg",
      "45.73 kg"
    ],
    "correct": 0,
    "hint": "Apply the lever rule before the eutectic reaction.",
    "steps": [
      "wα = (12.6 − 10)/(12.6 − 1.6) = 2.6/11 = 0.23636.",
      "mα = 11.82 kg; remaining liquid = 38.18 kg."
    ],
    "fig": 3
  },
  {
    "id": "a2q7-28",
    "assignment": 2,
    "source": 7,
    "topic": "Lever rule",
    "prompt": "Just below 577°C, use Cα = 1.6 and Cβ ≈ 100 wt% Si. How much β is present in that same 50 kg alloy?",
    "options": [
      "4.27 kg",
      "38.18 kg",
      "11.82 kg",
      "50 kg"
    ],
    "correct": 0,
    "hint": "Use the α–β tie line, not the α–liquid tie line.",
    "steps": [
      "wβ = (10 − 1.6)/(100 − 1.6) = 0.08537.",
      "mβ = 4.27 kg; total α = 45.73 kg.",
      "The eutectic microconstituent contains both α and β; it is not itself a single phase."
    ],
    "fig": 3
  },
  {
    "id": "a2q8-29",
    "assignment": 2,
    "source": 8,
    "topic": "Phase diagrams",
    "prompt": "For Cu–35 wt% Zn cooled from liquid, the diagram gives first solid at approximately:",
    "options": [
      "930°C, Cu-rich α containing about 31 wt% Zn",
      "903°C, pure Zn",
      "1085°C, pure Cu",
      "835°C, γ"
    ],
    "correct": 0,
    "hint": "Read the liquidus at 35 wt% Zn, then move horizontally to the solid boundary.",
    "steps": [
      "The liquidus at 35 wt% Zn is approximately 930°C.",
      "The first phase is α; a horizontal tie line gives roughly 30–32 wt% Zn.",
      "These are approximate readings from the supplied diagram, not exact tabulated values."
    ],
    "fig": 4
  },
  {
    "id": "a2q9-30",
    "assignment": 2,
    "source": 9,
    "topic": "Composition balance",
    "prompt": "At 2200°C, the NiO–MgO solidus is approximately 40 mol% MgO. With M(NiO) = 74.69 and M(MgO) = 40.30 g/mol, how much MgO must be added to 1000 g NiO?",
    "options": [
      "About 360 g",
      "About 667 g",
      "About 400 g",
      "About 1350 g"
    ],
    "correct": 0,
    "hint": "The composition axis is mole percent. Convert the original NiO mass to moles.",
    "steps": [
      "nNiO = 1000/74.69 = 13.389 mol.",
      "nMgO/(nMgO + 13.389) = 0.40 → nMgO = (0.40/0.60)(13.389) = 8.926 mol.",
      "mMgO = 8.926 × 40.30 ≈ 360 g. The 40 mol% reading is approximate."
    ],
    "fig": 5
  },
  {
    "id": "a2q10-31",
    "assignment": 2,
    "source": 10,
    "topic": "Composition balance",
    "prompt": "A 1200 lb Nb–40 wt% W bath contains how much W initially?",
    "options": [
      "480 lb",
      "720 lb",
      "40 lb",
      "3000 lb"
    ],
    "correct": 0,
    "hint": "Weight percent is a mass fraction.",
    "steps": [
      "mW = 0.40 × 1200 = 480 lb.",
      "The remaining 720 lb is Nb."
    ]
  },
  {
    "id": "a2q10-32",
    "assignment": 2,
    "source": 10,
    "topic": "Composition balance",
    "prompt": "At 2800°C, approximate the Nb–W liquidus as 50 wt% W. How much pure W can be added to the 1200 lb, 40 wt% W bath before solid starts?",
    "options": [
      "240 lb",
      "120 lb",
      "600 lb",
      "480 lb"
    ],
    "correct": 0,
    "hint": "Adding W increases both W mass and total mass.",
    "steps": [
      "(480 + x)/(1200 + x) = 0.50.",
      "480 + x = 600 + 0.50x → x = 240 lb.",
      "This is the limiting amount at the onset of solidification, using the rounded graph endpoint."
    ],
    "fig": 6
  },
  {
    "id": "a2q10-33",
    "assignment": 2,
    "source": 10,
    "topic": "Composition balance",
    "prompt": "Approximate the 2800°C solidus as 70 wt% W. What total addition of W makes the original bath fully solid?",
    "options": [
      "1200 lb",
      "840 lb",
      "360 lb",
      "240 lb"
    ],
    "correct": 0,
    "hint": "Use the original bath and the solidus composition in the mass balance.",
    "steps": [
      "(480 + x)/(1200 + x) = 0.70.",
      "0.30x = 360 → x = 1200 lb.",
      "This is total added W from the starting bath, or 960 lb beyond the 240 lb onset addition."
    ],
    "fig": 6
  },
  {
    "id": "a2q11-34",
    "assignment": 2,
    "source": 11,
    "topic": "Cooling curves",
    "prompt": "From this cooling curve, estimate liquidus, solidus and freezing range.",
    "options": [
      "2900°C; 2700°C; 200°C",
      "3000°C; 2600°C; 400°C",
      "2700°C; 2900°C; −200°C",
      "2900°C; 2600°C; 300°C"
    ],
    "correct": 0,
    "hint": "Identify the changes in slope where freezing begins and ends.",
    "steps": [
      "The first slope change occurs near 2900°C: liquidus.",
      "The final slope change is near 2700°C: solidus.",
      "Freezing range ≈ 2900 − 2700 = 200°C."
    ],
    "fig": 7
  },
  {
    "id": "a2q12-35",
    "assignment": 2,
    "source": 12,
    "topic": "Polymer calculations",
    "prompt": "Polypropylene has an orthorhombic cell with a = 1.450, b = 0.569, c = 0.740 nm. What is its cell volume in cm³?",
    "options": [
      "6.105×10⁻²² cm³",
      "6.105×10⁻⁸ cm³",
      "0.6105 cm³",
      "6.105×10⁻²⁸ cm³"
    ],
    "correct": 0,
    "hint": "1 nm = 10⁻⁷ cm; cube that conversion for volume.",
    "steps": [
      "V = abc = 0.610537 nm³.",
      "1 nm³ = 10⁻²¹ cm³.",
      "V = 6.10537×10⁻²² cm³."
    ],
    "fig": 8
  },
  {
    "id": "a2q12-36",
    "assignment": 2,
    "source": 12,
    "topic": "Polymer calculations",
    "prompt": "Using ρ = 0.89 g/cm³, V = 6.105×10⁻²² cm³, M = 42 g/mol and Nₐ = 6.023×10²³ mol⁻¹, how many repeat units are in a polypropylene cell?",
    "options": [
      "About 8",
      "About 4",
      "About 16",
      "About 80"
    ],
    "correct": 0,
    "hint": "Divide cell mass by mass per repeat unit.",
    "steps": [
      "mcell = ρV = 5.434×10⁻²² g.",
      "mrepeat = M/Nₐ.",
      "n = ρVNₐ/M ≈ 7.79, interpreted as approximately 8 repeat units with the supplied rounded density."
    ],
    "fig": 8
  },
  {
    "id": "a2q13-37",
    "assignment": 2,
    "source": 13,
    "topic": "Stress relaxation",
    "prompt": "A polymer’s stress falls from 2500 to 2400 psi in 100 h at constant strain. With σ = σ₀ exp(−t/λ), estimate λ.",
    "options": [
      "2450 h",
      "100 h",
      "408 h",
      "24.5 h"
    ],
    "correct": 0,
    "hint": "Take ln(σ/σ₀) and solve for λ.",
    "steps": [
      "ln(2400/2500) = −100/λ.",
      "λ = −100/ln(0.96) ≈ 2449.66 h."
    ]
  },
  {
    "id": "a2q13-38",
    "assignment": 2,
    "source": 13,
    "topic": "Stress relaxation",
    "prompt": "With σ₀ = 2500 psi and λ = 2449.66 h, when does stress reach the 2100 psi service threshold?",
    "options": [
      "About 427 h from initial loading",
      "About 327 h from initial loading",
      "About 2450 h",
      "About 100 h"
    ],
    "correct": 0,
    "hint": "Use the original stress for total life; remaining life after 100 h is different.",
    "steps": [
      "t = −λ ln(2100/2500).",
      "t = −2449.66 ln(0.84) ≈ 427.11 h.",
      "Remaining time after the first 100 h is about 327.11 h. For stress strictly above 2100 psi, service time must be less than the threshold time."
    ]
  },
  {
    "id": "a2q14-39",
    "assignment": 2,
    "source": 14,
    "topic": "Polymers",
    "prompt": "For improved ABS impact toughness, which broad composition change is appropriate?",
    "options": [
      "Increase the rubbery butadiene-containing phase",
      "Remove the rubber phase entirely",
      "Replace all monomers with metal atoms",
      "Maximize brittle filler regardless of morphology"
    ],
    "correct": 0,
    "hint": "Rubber domains absorb energy and promote plastic deformation of the matrix.",
    "steps": [
      "Increase the BS rubber contribution relative to the glassy SAN matrix.",
      "Rubber toughening can improve impact performance; exact behaviour also depends on particle size, adhesion and processing."
    ]
  },
  {
    "id": "a2q14-40",
    "assignment": 2,
    "source": 14,
    "topic": "Polymers",
    "prompt": "For greater room-temperature ductility in ABS, which direction is generally appropriate?",
    "options": [
      "More rubbery BS relative to rigid SAN",
      "Only rigid SAN with no rubber",
      "More crosslinking without limit",
      "Eliminate all chain motion"
    ],
    "correct": 0,
    "hint": "Ductility requires deformation before fracture.",
    "steps": [
      "A larger rubbery contribution generally encourages deformation and toughness.",
      "This may trade off stiffness and strength; no universal composition can be calculated from the handout alone."
    ]
  },
  {
    "id": "a2q14-41",
    "assignment": 2,
    "source": 14,
    "topic": "Polymers",
    "prompt": "For higher room-temperature stiffness and tensile strength, which broad ABS adjustment is generally favoured?",
    "options": [
      "Increase the rigid SAN contribution relative to rubber",
      "Maximize rubber content without limit",
      "Remove all SAN",
      "Lower every chain length to one monomer"
    ],
    "correct": 0,
    "hint": "Separate strength/stiffness from impact toughness.",
    "steps": [
      "The rigid SAN matrix provides much of the stiffness and load-bearing strength.",
      "Increasing its proportion relative to rubber generally favours these properties, with a toughness/ductility tradeoff.",
      "Actual strength depends on formulation and morphology, so this is a qualitative trend."
    ]
  }
];
