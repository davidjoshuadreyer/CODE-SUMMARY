window.PHYSICS_QUICK_SETS = [
  {
    "title": "1. Charged balls in equilibrium",
    "setup": "Two identical negatively charged balls hang from one point. Each string has length L and makes angle θ with the vertical. Find the charge magnitude on each ball.",
    "steps": [
      {
        "q": "What should you draw first?",
        "options": [
          "Only the electric field",
          "A free-body diagram: tension along the string, weight down, electric repulsion sideways",
          "A velocity triangle"
        ],
        "answer": 1,
        "why": "The balls are stationary. Start with forces on one ball: T, mg and Fₑ. The force on the right ball points right; the left ball is its mirror."
      },
      {
        "q": "Which pair of equations describes equilibrium?",
        "options": [
          "T cos θ = mg; T sin θ = Fₑ",
          "T sin θ = mg; T cos θ = Fₑ",
          "T = mg + Fₑ"
        ],
        "answer": 0,
        "why": "θ is measured from vertical, so the vertical tension component is T cos θ. Both component sums are zero."
      },
      {
        "q": "Divide the horizontal equation by the vertical one. What follows?",
        "options": [
          "Fₑ = mg cos θ",
          "Fₑ = mg / tan θ",
          "Fₑ = mg tan θ"
        ],
        "answer": 2,
        "why": "T cancels: tan θ = Fₑ/(mg). This connects the electric force to the observed angle."
      },
      {
        "q": "Which distance goes into Coulomb’s law?",
        "options": [
          "L",
          "2L sin θ",
          "L cos θ"
        ],
        "answer": 1,
        "why": "Each ball is L sin θ from the centreline. Coulomb’s law needs the full distance between the balls."
      },
      {
        "q": "With Fₑ = kq²/r², how do you finish?",
        "options": [
          "|q| = r √(mg tan θ / k)",
          "|q| = mg tan θ / k",
          "|q| = kr² / (mg tan θ)"
        ],
        "answer": 0,
        "why": "Solve for q², then take the square root. For m = 15.0 g, L = 1.20 m and θ = 25.0°, |q| ≈ 2.80 μC. Both actual charges are negative."
      }
    ],
    "bonus": false
  },
  {
    "title": "2. Flux and enclosed charge",
    "setup": "A closed surface encloses +4.00 nC and −7.80 nC. Another +2.40 nC charge is outside. Find net outward flux.",
    "steps": [
      {
        "q": "What is the first step?",
        "options": [
          "Add all three charges",
          "Find the field at every surface point",
          "Add only the enclosed charges, with their signs"
        ],
        "answer": 2,
        "why": "Gauss’s law uses net charge inside: Qenc = +4.00 − 7.80 = −3.80 nC. Do not include the outside charge."
      },
      {
        "q": "What comes next?",
        "options": [
          "Φ = Qenc / ε₀",
          "Φ = Qenc × ε₀",
          "Φ = kQenc / r²"
        ],
        "answer": 0,
        "why": "Net flux through a closed surface is Qenc/ε₀. With ε₀ = 8.85 × 10⁻¹², the result is about −429 N·m²/C."
      },
      {
        "q": "What does negative net outward flux mean?",
        "options": [
          "The field is zero everywhere",
          "More flux enters than leaves",
          "The area is negative"
        ],
        "answer": 1,
        "why": "Outward is the positive convention. Negative net flux means the inward contribution is greater."
      },
      {
        "q": "Move the outside charge closer, without crossing the surface. What changes?",
        "options": [
          "Net flux must increase",
          "Neither the local field nor the flux can change",
          "The local field can change, but net flux stays the same"
        ],
        "answer": 2,
        "why": "External charges can alter E at individual points. They do not change Qenc or net closed-surface flux."
      },
      {
        "q": "A flat sheet is 20° to a uniform field. Which flux magnitude is correct?",
        "options": [
          "EA cos 20°",
          "EA sin 20°",
          "E/A"
        ],
        "answer": 1,
        "why": "In Φ = EA cos θ, θ is measured from the normal. Here θ = 70°, so EA cos 70° = EA sin 20°."
      }
    ],
    "bonus": false
  },
  {
    "title": "3. Derive the ring field",
    "setup": "A positive uniform ring has radius R and total charge Q. Point P is on its axis at x > 0. Build the derivation, rather than recalling only the result.",
    "steps": [
      {
        "q": "What is the distance from any ring element dq to P?",
        "options": [
          "√(x² + R²)",
          "x + R",
          "x"
        ],
        "answer": 0,
        "why": "Use the right triangle formed by the radius and the axial distance. Every ring element has the same distance to P."
      },
      {
        "q": "What happens to the field components?",
        "options": [
          "All components cancel",
          "Only the transverse components survive",
          "Transverse components cancel; axial components add"
        ],
        "answer": 2,
        "why": "Pair opposite ring elements. Their sideways fields cancel by symmetry, but both axial components point toward +x."
      },
      {
        "q": "Which expression is the axial contribution dEₓ?",
        "options": [
          "k dq / (x² + R²)",
          "k x dq / (x² + R²)^(3/2)",
          "k R dq / (x² + R²)^(3/2)"
        ],
        "answer": 1,
        "why": "Start with k dq/r² and project using cos α = x/r. That extra factor produces the power 3/2."
      },
      {
        "q": "What is the final integration step?",
        "options": [
          "Integrate dq around the ring to get Q",
          "Integrate x from 0 to infinity",
          "Replace dq with Q²"
        ],
        "answer": 0,
        "why": "x and R are fixed during the charge integral. Thus Eₓ = kQx/(x² + R²)^(3/2). At the centre it is zero; far away it approaches kQ/x²."
      }
    ],
    "bonus": false
  },
  {
    "title": "4. Find the maximum field",
    "setup": "You are given E(x) = kQx/(x² + R²)^(3/2), x ≥ 0. Q and R are positive constants. The actual test may give a different field function.",
    "steps": [
      {
        "q": "What is the next step to locate the maximum?",
        "options": [
          "Set E = 0",
          "Integrate E over x",
          "Differentiate E with respect to x"
        ],
        "answer": 2,
        "why": "Extrema occur at stationary points or boundaries. Rewrite E = kQ x(x² + R²)^(−3/2), then use product and chain rules."
      },
      {
        "q": "The derivative simplifies to kQ(R² − 2x²)/(x² + R²)^(5/2). What do you set to zero?",
        "options": [
          "R² − 2x²",
          "x² + R²",
          "kQ"
        ],
        "answer": 0,
        "why": "The denominator is positive and kQ is nonzero. The numerator gives x = R/√2 on x ≥ 0."
      },
      {
        "q": "How do you establish that this is a maximum?",
        "options": [
          "A zero derivative always means maximum",
          "Check that the derivative changes from positive to negative",
          "Check that x is positive only"
        ],
        "answer": 1,
        "why": "The numerator is positive before R/√2 and negative after. E is also zero at x = 0 and tends to zero at infinity."
      },
      {
        "q": "The question asks for position AND maximum field. What remains?",
        "options": [
          "Multiply x by Q",
          "Differentiate again until the answer is zero",
          "Substitute x = R/√2 into the original E(x)"
        ],
        "answer": 2,
        "why": "Position: R/√2. Substitution gives Emax = 2kQ/(3√3 R²). Reporting only x misses half the requested result."
      }
    ],
    "bonus": false
  },
  {
    "title": "5. Prepare the other derivations",
    "setup": "The instructor’s handout includes four possibilities: dipole, uniform rod, ring and disk. These questions cover the three alternatives to the ring.",
    "steps": [
      {
        "q": "On the perpendicular bisector of a dipole, how do you add the two fields?",
        "options": [
          "Cancel components perpendicular to the dipole axis; add components toward the negative charge",
          "Add the two magnitudes without directions",
          "Both fields cancel completely"
        ],
        "answer": 0,
        "why": "For +q and −q, the components along the perpendicular bisector cancel. The remaining field points from + toward −, opposite the dipole moment."
      },
      {
        "q": "A uniform rod runs from s = 0 to s = a. The observation point is X > a. Which field integral is correct?",
        "options": [
          "kQ ∫₀ᵃ ds/X²",
          "k(Q/a) ∫₀ᵃ ds/(X − s)²",
          "k(Q/a) ∫₀ˣ ds/(X + s)²"
        ],
        "answer": 1,
        "why": "dq = (Q/a) ds and the source-to-point distance is X − s. X is fixed while s runs along the rod. The result is kQ/[X(X − a)], along +x."
      },
      {
        "q": "To derive a uniform disk’s axial field from the ring result, what element should you use?",
        "options": [
          "A ring with dq = σπR²",
          "A line with dq = σ dr",
          "A thin ring with dq = σ 2πr dr"
        ],
        "answer": 2,
        "why": "A thin annulus has area 2πr dr. Substitute this dq and radius r into the ring expression, then integrate r from 0 to the disk radius R."
      },
      {
        "q": "Which disk setup correctly completes that next step?",
        "options": [
          "Eₓ = 2πkσx ∫₀ᴿ r dr/(x² + r²)^(3/2)",
          "Eₓ = 2πkσ ∫₀ᴿ dr/(x² + R²)",
          "Eₓ = kσπR²/x² for every x"
        ],
        "answer": 0,
        "why": "For x > 0, integration gives Eₓ = 2πkσ[1 − x/√(x² + R²)]. Treating the disk as a point charge works only in the far-field limit."
      }
    ],
    "bonus": false
  },
  {
    "title": "Bonus. Non-uniform rod",
    "setup": "A rod occupies 0 ≤ s ≤ L with λ(s) = λ₀(1 + s/L). Point P is at x = −d, with d > 0. All source charge is positive.",
    "steps": [
      {
        "q": "What charge element should you use?",
        "options": [
          "dq = λ₀ ds",
          "dq = λ₀(1 + s/L) ds",
          "dq = λ₀(1 + s/L)"
        ],
        "answer": 1,
        "why": "Density varies along the rod. Multiply the local density by ds to get a small amount of charge, not just a density."
      },
      {
        "q": "What is the correct setup for Eₓ at P?",
        "options": [
          "+kλ₀ ∫₀ᴸ (1 + s/L)/(s − d)² ds",
          "−kλ₀ ∫₀ᴸ (1 + s/L)/(s + d)² ds",
          "−kλ₀ ∫₀ᴸ (1 + s/L)/d² ds"
        ],
        "answer": 1,
        "why": "Each source element lies to P’s right, so the field points left. The distance is s + d, not s − d or a constant d."
      },
      {
        "q": "Which substitution makes the integral easier?",
        "options": [
          "u = s + d",
          "u = Q²",
          "Replace the density by its maximum"
        ],
        "answer": 0,
        "why": "With u = s + d, the integrand becomes (1 − d/L)/u² + 1/(Lu). Integrate to −(1 − d/L)/u + ln(u)/L, then apply the bounds d and L + d. For λ₀ = 2.00 nC/m, L = 0.500 m, d = 0.100 m: Eₓ ≈ −184 N/C."
      }
    ],
    "bonus": true
  }
];
