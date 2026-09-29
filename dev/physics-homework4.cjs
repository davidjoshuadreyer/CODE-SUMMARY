/* Checked against Homework 4 handout on 2026-09-28; manual matches noted per question. */
module.exports=[
  {
    "id": "22-15",
    "homework": 4,
    "title": "22.15 · Excess electrons on a conducting sphere",
    "topic": "Gauss’s law",
    "prompt": "A spherical conductor has diameter 26.0 cm. How many excess electrons produce a field magnitude of 1150 N/C just outside its surface?",
    "given": "Diameter = 0.260 m; E = 1150 N/C; ε₀ = 8.854 × 10⁻¹² C²/(N m²); e = 1.602 × 10⁻¹⁹ C.",
    "find": "The number of added electrons.",
    "variables": "R: sphere radius; Q: net charge; N: excess-electron count; e: positive elementary charge.",
    "hint": "Use half the diameter in the spherical area, then divide charge magnitude by e.",
    "steps": [
      [
        "Identify",
        "An isolated spherical conductor has its excess charge on the surface. Added electrons make Q negative, so the external field points inward."
      ],
      [
        "Set up",
        "For a concentric Gaussian sphere just outside the metal, $|Q|=\\varepsilon_0 E(4\\pi R^2)$ and $N=|Q|/e$."
      ],
      [
        "Execute",
        "$$R=0.260/2=0.130\\ \\mathrm m$$ $$|Q|=4\\pi(8.854\\times10^{-12})(1150)(0.130)^2=2.16\\times10^{-9}\\ \\mathrm C$$ $$N=\\frac{2.16\\times10^{-9}}{1.602\\times10^{-19}}=1.35\\times10^{10}$$"
      ],
      [
        "Evaluate",
        "The count is positive, while Q = −2.16 nC. Using the diameter as R would give four times too many electrons. Manual problem 22.15 uses a different question."
      ]
    ],
    "answer": 13500000000.0,
    "unit": "excess electrons",
    "result": "1.35 × 10¹⁰ excess electrons; Q = −2.16 nC.",
    "drawing": "<circle cx=\"165\" cy=\"112\" r=\"64\"/><path d=\"M165 112H229\"/><text x=\"172\" y=\"104\">R</text><path d=\"M285 112H233M45 112H97M165 10V44M165 218V180\" marker-end=\"url(#arrow)\"/><text x=\"285\" y=\"82\">E points inward</text><text x=\"285\" y=\"112\">Q &lt; 0</text><text x=\"285\" y=\"145\">R = 0.130 m</text><text x=\"110\" y=\"150\">conductor</text>",
    "caption": "Reference diagram; arrows show the directions used in the solution.",
    "source": "https://online.camosun.ca/d2l/common/viewFile.d2lfile/Database/MTczMzg2ODQ/PHYS%20210%20Homework%20_4.pdf?ou=348967"
  },
  {
    "id": "22-19",
    "homework": 4,
    "title": "22.19 · Charge inside a conducting shell",
    "topic": "Gauss’s law",
    "prompt": "A conducting spherical shell has outer radius 0.250 m, inner radius 0.200 m, and initial surface charge density +6.37 × 10⁻⁶ C/m². Place −0.500 µC at the centre of its cavity. Find (a) the new outer surface density, (b) the field just outside, and (c) the flux through a sphere just inside the cavity wall.",
    "given": "b = 0.250 m; a = 0.200 m; σ₀ = +6.37 × 10⁻⁶ C/m²; q = −0.500 µC.",
    "find": "σouter, E just outside r = b, and flux through r just below a.",
    "variables": "Qshell: conserved net shell charge; Qinner and Qouter: induced surface charges; ε₀: vacuum permittivity.",
    "hint": "The field is zero inside the metal. A Gaussian surface there must enclose zero net charge.",
    "steps": [
      [
        "Identify",
        "Initially the empty cavity has no inner surface charge. The shell is isolated, so introducing the central charge redistributes its charge without changing its total."
      ],
      [
        "Set up",
        "$$Q_s=4\\pi b^2\\sigma_0,\\quad Q_i=-q,\\quad Q_o=Q_s-Q_i=Q_s+q$$ $$\\sigma_o=\\frac{Q_o}{4\\pi b^2},\\quad E(b^+)=\\frac{Q_o}{4\\pi\\varepsilon_0 b^2},\\quad \\Phi(a^-)=\\frac{q}{\\varepsilon_0}$$"
      ],
      [
        "Execute",
        "$$Q_s=5.003\\ \\mu\\mathrm C,\\quad Q_i=+0.500\\ \\mu\\mathrm C,\\quad Q_o=4.503\\ \\mu\\mathrm C$$ $$(a)\\ \\sigma_o=+5.73\\times10^{-6}\\ \\mathrm{C/m^2}$$ $$(b)\\ E=6.48\\times10^5\\ \\mathrm{N/C}\\ \\text{radially outward}$$ $$(c)\\ \\Phi=-5.65\\times10^4\\ \\mathrm{N\\,m^2/C}$$"
      ],
      [
        "Evaluate",
        "The shell still totals +5.003 µC. The cavity Gaussian sphere encloses only the negative point charge, so its outward flux is negative. The manual rounds intermediate values and gives 6.47 × 10⁵ N/C; both agree within rounding."
      ]
    ],
    "answer": 5.73e-06,
    "unit": "C/m², outer surface density (part a)",
    "result": "(a) +5.73 × 10⁻⁶ C/m²; (b) 6.48 × 10⁵ N/C outward; (c) −5.65 × 10⁴ N m²/C.",
    "drawing": "<circle cx=\"140\" cy=\"115\" r=\"85\"/><circle cx=\"140\" cy=\"115\" r=\"61\"/><circle cx=\"140\" cy=\"115\" r=\"47\" stroke-dasharray=\"4 4\"/><text x=\"117\" y=\"119\">−</text><text x=\"260\" y=\"50\">Centre: −0.500 µC</text><text x=\"260\" y=\"83\">Inner: +0.500 µC</text><text x=\"260\" y=\"116\">Outer: +4.503 µC</text><text x=\"260\" y=\"149\">E = 0 in the metal</text><text x=\"260\" y=\"182\">Dashed: cavity surface</text><path d=\"M203 69L247 80M223 116H246\"/>",
    "caption": "Reference diagram; arrows show the directions used in the solution.",
    "source": "https://online.camosun.ca/d2l/common/viewFile.d2lfile/Database/MTczMzg2ODQ/PHYS%20210%20Homework%20_4.pdf?ou=348967"
  },
  {
    "id": "22-21",
    "homework": 4,
    "title": "22.21 · Uniformly charged insulating sphere",
    "topic": "Gauss’s law",
    "prompt": "A solid insulating sphere has radius 0.355 m. The field magnitude 0.145 m beyond its surface is 1750 N/C. Find (a) its uniform volume charge density and (b) the field magnitude 0.200 m from its centre.",
    "given": "R = 0.355 m; distance beyond surface = 0.145 m; Eoutside = 1750 N/C; rinside = 0.200 m.",
    "find": "The magnitude of ρ and the internal field.",
    "variables": "R: sphere radius; r: distance from centre; Q: total charge; ρ: charge per unit volume; Qenc: enclosed charge.",
    "hint": "The external distance from the centre is 0.355 + 0.145 = 0.500 m.",
    "steps": [
      [
        "Identify",
        "Use spherical symmetry. Outside the sphere all its charge is enclosed. Inside a uniformly charged insulator, enclosed charge grows as r³; the electric field need not be zero."
      ],
      [
        "Set up",
        "$$Q=4\\pi\\varepsilon_0 E_{out}r_{out}^2,\\quad |\\rho|=\\frac{|Q|}{(4/3)\\pi R^3}$$ $$Q_{enc}=\\rho\\frac{4\\pi r^3}{3},\\quad |E(r)|=\\frac{|\\rho|r}{3\\varepsilon_0}$$"
      ],
      [
        "Execute",
        "$$r_{out}=0.355+0.145=0.500\\ \\mathrm m,\\quad |Q|=4.87\\times10^{-8}\\ \\mathrm C$$ $$(a)\\ |\\rho|=2.60\\times10^{-7}\\ \\mathrm{C/m^3}$$ $$(b)\\ |E(0.200)|=1.96\\times10^3\\ \\mathrm{N/C}$$"
      ],
      [
        "Evaluate",
        "Only a field magnitude is specified, so the sign of the charge is not determined. For positive charge the field is outward; for negative charge it is inward. Inside, E grows linearly from zero at the centre, then falls as 1/r² outside."
      ]
    ],
    "answer": 2.6e-07,
    "unit": "C/m³, magnitude of volume charge density",
    "result": "|ρ| = 2.60 × 10⁻⁷ C/m³; |E(0.200 m)| = 1.96 × 10³ N/C.",
    "drawing": "<circle cx=\"150\" cy=\"112\" r=\"80\"/><circle cx=\"150\" cy=\"112\" r=\"45\" stroke-dasharray=\"5 4\"/><path d=\"M150 112H275\"/><text x=\"171\" y=\"102\">r</text><text x=\"86\" y=\"211\">Uniform volume charge</text><text x=\"270\" y=\"64\">R = 0.355 m</text><text x=\"270\" y=\"100\">Inside: r = 0.200 m</text><text x=\"270\" y=\"137\">Outside: r = 0.500 m</text><text x=\"270\" y=\"174\">Einside ∝ r</text>",
    "caption": "Reference diagram; arrows show the directions used in the solution.",
    "source": "https://online.camosun.ca/d2l/common/viewFile.d2lfile/Database/MTczMzg2ODQ/PHYS%20210%20Homework%20_4.pdf?ou=348967"
  },
  {
    "id": "22-33",
    "homework": 4,
    "title": "22.33 · Sphere suspended beside a charged sheet",
    "topic": "Gauss’s law",
    "prompt": "A sphere of mass 4.00 × 10⁻⁶ kg and charge +5.00 × 10⁻⁸ C hangs beside a very large insulating sheet with surface charge density −2.50 × 10⁻⁹ C/m². Find the thread angle from vertical.",
    "given": "m = 4.00 × 10⁻⁶ kg; q = +5.00 × 10⁻⁸ C; σ = −2.50 × 10⁻⁹ C/m²; g = 9.80 m/s².",
    "find": "θ, measured from vertical, and the direction of the deflection.",
    "variables": "E: sheet field magnitude; T: tension; Fₑ = qE: horizontal electric-force magnitude; mg: downward weight.",
    "hint": "Divide horizontal equilibrium by vertical equilibrium to eliminate tension.",
    "steps": [
      [
        "Identify",
        "The positive sphere is attracted toward the negative sheet. Three forces balance: tension along the thread, weight downward, and electric force toward the sheet."
      ],
      [
        "Set up",
        "For a very large insulating sheet, $E=|\\sigma|/(2\\varepsilon_0)$. $$T\\sin\\theta=qE,\\quad T\\cos\\theta=mg,\\quad \\tan\\theta=\\frac{q|\\sigma|}{2\\varepsilon_0 mg}$$"
      ],
      [
        "Execute",
        "$$E=141.2\\ \\mathrm{N/C},\\quad F_e=7.06\\times10^{-6}\\ \\mathrm N,\\quad mg=3.92\\times10^{-5}\\ \\mathrm N$$ $$\\theta=\\tan^{-1}(0.1801)=10.2^\\circ$$"
      ],
      [
        "Evaluate",
        "The sphere leans toward the sheet. Use the insulating-sheet field σ/(2ε₀), not the conductor-surface value σ/ε₀. This is manual problem 22.31, despite the handout numbering 22.33."
      ]
    ],
    "answer": 10.2,
    "unit": "degrees from vertical",
    "result": "θ = 10.2° toward the negative sheet.",
    "drawing": "<path d=\"M55 30V200M110 25H200M170 25L115 135M170 25V155\"/><circle cx=\"115\" cy=\"135\" r=\"10\"/><text x=\"105\" y=\"139\">+</text><text x=\"20\" y=\"114\">−</text><text x=\"140\" y=\"89\">θ</text><text x=\"247\" y=\"25\">Free-body diagram</text><circle cx=\"332\" cy=\"116\" r=\"8\"/><path d=\"M327 110L371 42M321 116H253M332 125V198\" marker-end=\"url(#arrow)\"/><text x=\"377\" y=\"47\">T</text><text x=\"241\" y=\"101\">qE</text><text x=\"344\" y=\"195\">mg</text><text x=\"72\" y=\"226\">Sheet</text><text x=\"243\" y=\"226\">Forces balance</text>",
    "caption": "Reference diagram; arrows show the directions used in the solution.",
    "source": "https://online.camosun.ca/d2l/common/viewFile.d2lfile/Database/MTczMzg2ODQ/PHYS%20210%20Homework%20_4.pdf?ou=348967"
  },
  {
    "id": "22-37",
    "homework": 4,
    "title": "22.37 · Flux through a slanted box",
    "topic": "Gauss’s law",
    "prompt": "Two opposite faces of a box each measure 5.00 cm by 6.00 cm and are inclined 30.0° to a horizontal field. E₁ = 2.50 × 10⁴ N/C points out through one face; E₂ = 7.00 × 10⁴ N/C points in through the other. No field crosses the remaining faces. Find (a) the net enclosed charge and (b) what can be concluded about external charges.",
    "given": "A = (0.0500)(0.0600) m² per face; E₁ = 2.50 × 10⁴ N/C; E₂ = 7.00 × 10⁴ N/C.",
    "find": "Net enclosed charge and the limits of the flux information.",
    "variables": "Φ: outward electric flux; n̂: outward surface normal; θ: angle between field and outward normal; Qenc: net charge inside.",
    "hint": "Use the normal angle, not the angle from the plane. Flux is positive leaving the box and negative entering it.",
    "steps": [
      [
        "Identify",
        "Apply Gauss’s law to the entire closed box. The other faces contribute zero by the stated assumption."
      ],
      [
        "Set up",
        "Each face has $A=0.00300\\ \\mathrm{m^2}$. The acute angle between field and face normal is $60^\\circ$. $$\\Phi_{net}=E_1A\\cos60^\\circ-E_2A\\cos60^\\circ,\\quad Q_{enc}=\\varepsilon_0\\Phi_{net}$$"
      ],
      [
        "Execute",
        "$$\\Phi_1=+37.5,\\quad\\Phi_2=-105,\\quad\\Phi_{net}=-67.5\\ \\mathrm{N\\,m^2/C}$$ $$(a)\\ Q_{enc}=(8.854\\times10^{-12})(-67.5)=-5.98\\times10^{-10}\\ \\mathrm C$$"
      ],
      [
        "Evaluate",
        "(b) The inward net flux proves a negative net enclosed charge. Flux alone cannot determine whether external charges also contribute to the local field: their total closed-surface flux is zero. Do not infer the location of every source from the two field magnitudes; positive and negative charges could both be inside."
      ]
    ],
    "answer": -5.98e-10,
    "unit": "C, net enclosed charge",
    "result": "Qenc = −5.98 × 10⁻¹⁰ C. External contributions cannot be resolved from net flux alone.",
    "drawing": "<path d=\"M105 135L205 77L360 77L260 135Z\"/><path d=\"M105 135L60 135M360 77L310 77\" marker-end=\"url(#arrow)\"/><text x=\"26\" y=\"115\">E₁ out</text><text x=\"333\" y=\"55\">E₂ in</text><path d=\"M175 165L255 119M215 142L180 81M215 142H296\"/><text x=\"163\" y=\"75\">n̂</text><text x=\"238\" y=\"161\">30° to plane</text><text x=\"287\" y=\"103\">60° to normal</text><text x=\"66\" y=\"218\">Φ₁ = +37.5; Φ₂ = −105 N·m²/C</text>",
    "caption": "Reference diagram; arrows show the directions used in the solution.",
    "source": "https://online.camosun.ca/d2l/common/viewFile.d2lfile/Database/MTczMzg2ODQ/PHYS%20210%20Homework%20_4.pdf?ou=348967"
  }
];
