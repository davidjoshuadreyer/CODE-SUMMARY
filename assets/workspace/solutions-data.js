window.TESSELATE_SOLUTIONS={
  "f26-32": {
    "title": "MATH 252 · Assignment 1",
    "status": "Worked solutions · 8 of 8 questions",
    "sections": [
      {
        "title": "1 · Separate variables",
        "steps": [
          "The denominator is 3√(1+x²), not a cube root. Divide by y⁴: y⁻⁴ dy = x dx / (3√(1+x²)).",
          "Integrate: −1/(3y³) = √(1+x²)/3 + C. Multiply by 3 and apply y(0)=1: C = −2 in the multiplied equation.",
          "Answer: y = [2 − √(1+x²)]^(−1/3). The maximal interval containing 0 is −√3 < x < √3.",
          "Check: y(0)=1; differentiating gives y′ = xy⁴/(3√(1+x²))."
        ]
      },
      {
        "title": "2 · Linear equation",
        "steps": [
          "For x≠0, divide by x²: y′ + (3/x)y = e^(2x)/x². Use integrating factor x³ on either interval separated by 0.",
          "(x³y)′ = x e^(2x). Integration by parts gives x³y = e^(2x)(x/2 − 1/4) + C.",
          "Answer: y = [e^(2x)(2x−1)/4 + C]/x³, x≠0. Substitution in the original equation verifies it."
        ]
      },
      {
        "title": "3 · Exact differential",
        "steps": [
          "M = 3x²y² + e^(2y) + 4x³; N = 2x³y + 3cos(3y) + 2xe^(2y).",
          "M_y = 6x²y + 2e^(2y) = N_x, so the equation is exact.",
          "Integrate M with respect to x: F = x³y² + xe^(2y) + x⁴ + g(y). Matching F_y with N gives g′(y)=3cos(3y).",
          "Answer: x³y² + xe^(2y) + x⁴ + sin(3y) = C."
        ]
      },
      {
        "title": "4 · Homogeneous substitution",
        "steps": [
          "For x≠0 set v=y/x, so y′=v+xv′. The equation becomes xv′=v².",
          "For v≠0, dv/v²=dx/x. Thus −1/v=ln|x|+C.",
          "Answer: y = −x/(ln|x|+C), on intervals where x≠0 and the denominator is nonzero.",
          "Also include y=0, which was lost when dividing by v²."
        ]
      },
      {
        "title": "5 · Bernoulli equation",
        "steps": [
          "For x≠0, y′+(2/x)y=x²y²sin x. For y≠0 set u=1/y, giving u′−(2/x)u=−x²sin x.",
          "The integrating factor is x⁻². Hence (u/x²)′=−sin x, so u/x²=cos x+C.",
          "Answer: y=1/[x²(cos x+C)]. Also y=0 is a solution. Use intervals that avoid x=0 and denominator zeros."
        ]
      },
      {
        "title": "6 · Shift the dependent variable",
        "steps": [
          "Let u=1+x+y. Then u′=1+y′=1+u² and u(0)=1.",
          "Separate: arctan u=x+C. The initial value gives C=π/4.",
          "Answer: y=tan(x+π/4)−1−x. The maximal interval through 0 is −3π/4 < x < π/4.",
          "Check: y(0)=0 and y′=sec²(x+π/4)−1=tan²(x+π/4)=(1+x+y)²."
        ]
      },
      {
        "title": "7 · Light attenuation",
        "steps": [
          "Model dI/dy=−kI with k>0. Integration and I(0)=I₀ give I=I₀e^(−ky).",
          "At y=5 m, e^(−5k)=0.5, so k=ln 2/5 m⁻¹.",
          "For I/I₀=0.15, y=−5 ln(0.15)/ln 2 = 13.685 m ≈ 13.7 m below the surface."
        ]
      },
      {
        "title": "8 · Mixing tank",
        "steps": [
          "Use m in grams and t in minutes. Volume remains 2000 L. Salt enters at (15 g/L)(40 L/min)=600 g/min and leaves at (m/2000)(40)=m/50 g/min.",
          "(a) m′+m/50=600, m(0)=0. Therefore m(t)=30000(1−e^(−t/50)) g = 30(1−e^(−t/50)) kg.",
          "(b) Set m=10000 g: e^(−t/50)=2/3. Thus t=50 ln(3/2)=20.273 min.",
          "(c) lim m(t)=30000 g=30 kg. Check the limiting concentration: 30000/2000=15 g/L, equal to the incoming brine."
        ]
      }
    ],
    "diagram": "tank",
    "source": "math252/pdfs/assignment-1.pdf"
  },
  "f26-18": {
    "title": "PHYS 210 · DIY field mapping",
    "status": "Prepared analysis guide · your measurements required",
    "sections": [
      {
        "title": "Before the lab",
        "steps": [
          "Draw your chosen positive and negative conductor shapes. Predict several labelled equipotentials first, then draw field arrows from higher to lower potential, perpendicular to the contours and conductor surfaces.",
          "Near sharp points expect closer equipotentials and a stronger field. Two equipotentials at different voltages cannot cross."
        ]
      },
      {
        "title": "Analysis ready to fill",
        "steps": [
          "Overlay the measured and predicted maps. Rate your prediction from 1–10, identify one unexpected feature, explain what it teaches about electrostatic fields, and propose a practical improvement. These are the four analysis prompts in the lab manual.",
          "If adjacent contours differ by ΔV and their perpendicular spacing is Δs, estimate |E|≈|ΔV|/Δs. Example only: 5 V over 0.020 m gives 250 V/m, directed toward decreasing voltage.",
          "Keep raw measured maps separate from predictions. Describe local discrepancies using probe placement, foil contact, and uneven moisture, tied to your observations."
        ]
      }
    ],
    "diagram": "field"
  },
  "f26-19": {
    "title": "PHYS 210 · Textbook capacitor",
    "status": "Prepared calculations · your measurements required",
    "sections": [
      {
        "title": "Model and plots",
        "steps": [
          "C=κε₀A/d. Measure thickness of many sheets together, divide by the sheet count, and propagate the thickness uncertainty. Convert mm to m and cm² to m² before calculating.",
          "For fixed A, plot C against 1/d: slope=κε₀A. For fixed d, plot C against A: slope=κε₀/d. Include a fitted intercept to assess stray capacitance."
        ]
      },
      {
        "title": "Worked example and report",
        "steps": [
          "Example only: A=0.0200 m², d=1.00 mm and κ=3.0 give C=531 pF. Your paper’s κ must come from your measured fit or a specified reference, not this example.",
          "From the fixed-area fit, κ=slope/(ε₀A). From the fixed-gap fit, κ=slope·d/ε₀. Compare both values with uncertainty.",
          "Record sheet count, measured gap, overlap area, capacitance and meter uncertainty. Discuss fringe fields, plate alignment and stray lead capacitance."
        ]
      }
    ],
    "diagram": "capacitor"
  },
  "f26-20": {
    "title": "PHYS 210 · RC circuits and capacitor combinations",
    "status": "Prepared calculations · your measurements required",
    "sections": [
      {
        "title": "Discharge through the probe",
        "steps": [
          "Fit V(t)=A exp(−bt)+Voffset to the smooth discharge portion. The time constant is τ=1/b, not b. The fit coefficient b has units s⁻¹.",
          "The capacitor discharges through the LabPro input resistance: Rint=τ/C. Determine it separately with both measured capacitors, then compare and average as directed by the manual."
        ]
      },
      {
        "title": "Charging with meter loading",
        "steps": [
          "During charging, Rth=Rext∥Rint and τ=Rth C. The final capacitor voltage is Vs Rint/(Rext+Rint).",
          "Example only: Rext=Rint=1.00 MΩ, C=1.00 μF, Vs=4.00 V gives τ=0.500 s and V∞=2.00 V. Ignoring the probe would incorrectly predict 1.00 s and 4.00 V.",
          "Fit the charging trace with the correct final voltage and time origin. Infer Rth=τ/C, then Rint=Rth Rext/(Rext−Rth), if 0<Rth<Rext."
        ]
      },
      {
        "title": "Combinations",
        "steps": [
          "Cs=C₁C₂/(C₁+C₂); Cp=C₁+C₂. For nominal 1 and 10 μF: Cs=0.909 μF and Cp=11 μF. Use measured capacitances for your predictions.",
          "Obtain experimental C=τ/Rint from each discharge. Save graphs, fitted coefficients with units, the fitting interval, measured components and comparisons."
        ]
      }
    ],
    "diagram": "rc"
  },
  "f26-21": {
    "title": "PHYS 210 · Nichrome resistivity",
    "status": "Prepared calculations · your measurements required",
    "sections": [
      {
        "title": "Fit rather than one-point division",
        "steps": [
          "R=ρL/A, with A=πd²/4. Record diameter at several positions and lengths in metres. If using voltage/current, R=V/I.",
          "At fixed diameter, fit R versus L: ρ=slope·A. At fixed length, plot R versus 1/A: ρ=slope/L. Preserve any contact-resistance intercept."
        ]
      },
      {
        "title": "Example and uncertainty",
        "steps": [
          "Example only: d=0.400 mm gives A=1.257×10⁻⁷ m²; a slope of 8.75 Ω/m gives ρ=1.10×10⁻⁶ Ω·m.",
          "For independent uncertainties, (uρ/ρ)²=(um/m)²+(2ud/d)² for the fixed-diameter slope method. Use the uncertainty convention required in your course if it uses worst-case sums.",
          "Discuss contact resistance, wire heating, diameter variation and the sensitivity to diameter squared."
        ]
      }
    ]
  },
  "f26-22": {
    "title": "PHYS 210 · Kirchhoff’s laws",
    "status": "Prepared analysis method · your measured circuit required",
    "sections": [
      {
        "title": "Set up the circuit equations",
        "steps": [
          "Label every branch current with a chosen arrow. Label resistor voltage polarity using the passive sign convention. Draw each source with its polarity.",
          "Write KCL at independent nodes and KVL around independent loops. For a resistor traversed with its current, use a drop −IR; for a source traversed from − to +, use +ε.",
          "Solve the resulting simultaneous equations. A negative current means the actual direction is opposite your chosen arrow."
        ]
      },
      {
        "title": "Numerical check example",
        "steps": [
          "For a 12 V source with 1 kΩ in series with parallel 2 kΩ and 3 kΩ resistors: Rp=1.2 kΩ; Itotal=12/2.2 kΩ=5.455 mA.",
          "Parallel voltage=6.545 V. Branch currents are 3.273 mA and 2.182 mA; their sum is 5.455 mA. The series drop is 5.455 V, and the loop drops sum to 12 V. This is an illustrative circuit, not your lab’s circuit.",
          "In your report compare predicted and measured branch currents/voltages, report KCL and KVL residuals with units, and discuss component tolerance and meter loading."
        ]
      }
    ]
  },
  "f26-23": {
    "title": "PHYS 210 · Magnetic force on a wire",
    "status": "Prepared calculations · your measurements required",
    "sections": [
      {
        "title": "Model and graphs",
        "steps": [
          "F=ILB sinθ. Convert balance mass changes to force with F=|Δm|g; convert grams to kilograms. The balance reads the reaction on the magnet, opposite the force on the wire.",
          "For θ=90°, fit F versus I at fixed L: B=slope/L. At fixed I, fit F versus L: B=slope/I. For varying angle compare F against sinθ."
        ]
      },
      {
        "title": "Worked example",
        "steps": [
          "Example only: a 0.600 g mass change with I=2.00 A and L=0.0300 m gives F=0.005886 N and B=0.0981 T at 90°.",
          "Keep the sign when discussing force direction. Check your right-hand rule against the current direction and pole orientation. Record the effective wire length inside the field, not the whole wire.",
          "Discuss field nonuniformity, alignment, tare drift and current stability using the observations from your experiment."
        ]
      }
    ],
    "diagram": "magnetic"
  },
  "f26-24": {
    "title": "PHYS 210 · Magnetic induction",
    "status": "Prepared explanations · observations required",
    "sections": [
      {
        "title": "Predict the signal",
        "steps": [
          "Faraday’s law: ε=−N dΦB/dt, with ΦB=BA cosθ for a uniform field through a flat loop. A changing flux is required; a stationary magnet and stationary coil give no sustained emf.",
          "Approaching a coil with a north pole increases flux in one direction. The induced field opposes that increase. On withdrawal the polarity reverses. Reversing the pole or swapping leads also reverses the measured sign."
        ]
      },
      {
        "title": "Reference calculations and observations",
        "steps": [
          "Example only: N=200 turns and flux per turn changing by 3.0×10⁻⁵ Wb over 0.10 s produce |average ε|=0.060 V. Instantaneous peak voltage depends on the detailed motion.",
          "For each trial record magnet orientation, motion, lead polarity, signal sign and relative size. Compare faster/slower motion and changes in coil geometry as required by your handout.",
          "An explanation of polarity must name the viewing direction and wiring convention; avoid claiming universal positive/negative voltage without them."
        ]
      }
    ],
    "diagram": "induction"
  },
  "f26-16": {
    "title": "PHYS 210 · Earlier lab reference",
    "status": "Review guide · use your original measurements",
    "sections": [
      {
        "title": "Review",
        "steps": [
          "For field mapping use E≈−ΔV/Δs normal to equipotentials. For uncertainty work retain units and the course’s required propagation method.",
          "Revisit your completed lab and instructor feedback. The prepared DIY field guide covers the field-line reasoning; it does not replace your measured map."
        ]
      }
    ],
    "diagram": "field"
  },
  "f26-17": {
    "title": "PHYS 210 · Earlier lab reference",
    "status": "Review guide · use your original measurements",
    "sections": [
      {
        "title": "Review",
        "steps": [
          "For field mapping use E≈−ΔV/Δs normal to equipotentials. For uncertainty work retain units and the course’s required propagation method.",
          "Revisit your completed lab and instructor feedback. The prepared DIY field guide covers the field-line reasoning; it does not replace your measured map."
        ]
      }
    ],
    "diagram": "field"
  },
  "f26-36": {
    "title": "ENGR 290 · Assignment 1",
    "status": "Worked solutions · 6 questions; vacancy-data ambiguity flagged",
    "source": "ENGR%20290/ENGR%20290_Assign_1_2026.docx",
    "sections": [
      {
        "title": "1 · Density of MgO",
        "steps": [
          "One mole has mass 24.305+15.999=40.304 g. Convert the cube side: 22.37 mm=2.237 cm.",
          "Volume=(2.237 cm)³=11.1943 cm³. Density=40.304/11.1943=3.600 g/cm³."
        ]
      },
      {
        "title": "2 · One mole of magnesium",
        "steps": [
          "Use magnesium molar mass 24.305 g/mol and density 1.74 g/cm³ (replace with the value specified in your course table if different).",
          "Volume=M/ρ=13.968 cm³. Cube side a=(M/ρ)^(1/3)=2.408 cm≈24.1 mm."
        ]
      },
      {
        "title": "3 · Angle between [110] and [111]",
        "steps": [
          "For a cubic crystal, use vectors u=(1,1,0), v=(1,1,1). cosθ=(u·v)/(|u||v|)=2/√6.",
          "θ=35.264°≈35.3°. The dot-product method in this form assumes orthogonal equal-length crystal axes."
        ]
      },
      {
        "title": "4 · Plane intercepts: (3 1̄ 1)",
        "steps": [
          "The middle index in the original Word equation has an overbar: k=−1. Do not read this plane as (311).",
          "For Miller indices (hkl), the intercepts are a/h, b/k, c/l. Therefore x=a/3, y=−b, z=c. In a cubic cell these are (a/3,−a,a).",
          "The plane equation is 3x/a−y/b+z/c=1. Substituting each intercept verifies it."
        ]
      },
      {
        "title": "5 · Vacancy fraction",
        "steps": [
          "Use f(T)=A exp(−Q/kT). Take the ratio to eliminate the temperature-independent prefactor A: f₂/f₁=exp[(Q/k)(1/T₁−1/T₂)].",
          "T₁=673.15 K; T₂=933.15 K. With Q=0.76 eV, k=8.62×10⁻⁵ eV/K, f₁=2.29×10⁻⁵, the result is f₂=8.81×10⁻⁴, or 0.0881% of sites.",
          "Source inconsistency: assuming A=1 would predict f₁≈2.05×10⁻⁶, not the stated value, and f₂≈7.88×10⁻⁵. The ratio result uses all supplied data; ask the instructor which interpretation is intended."
        ]
      },
      {
        "title": "6 · Carbon case hardening",
        "steps": [
          "Use the semi-infinite solid model with a constant surface concentration: (Cx−C₀)/(Cs−C₀)=erfc[x/(2√(Dt))].",
          "With C₀=0.2%, Cs=1.0%, Cx=0.6%, the ratio is 0.5. Hence erf(η)=0.5 and η=0.476936.",
          "At x=1.00 mm and D=2.98×10⁻¹¹ m²/s, t=x²/(4Dη²)=36881 s=10.245 h.",
          "Assumptions: constant temperature and D, uniform initial concentration, constant surface concentration, and a depth small compared with specimen thickness."
        ]
      }
    ]
  },
  "f26-66": {
    "title": "COMP 139E · Lab 3: Spherical-coordinate conversion",
    "status": "Worked code reference · compiled and checked",
    "sections": [
      {
        "title": "How the solution works",
        "steps": [
          "Use r=√(x²+y²+z²), azimuth=atan2(y,x), and inclination=acos(z/r). Inclination is measured from +z, not from the xy plane.",
          "The inverse is x=r sin(inclination) cos(azimuth), y=r sin(inclination) sin(azimuth), z=r cos(inclination). Default z=0 and inclination=π/2 implement the 2-D cases.",
          "Each inverse call allocates its own new double[3]. The caller must delete[] it. A local or static array fails the independent-array requirement.",
          "Compiled and passed all seven supplied instructor tests. The reference chooses zero angles at the origin, where direction is undefined."
        ]
      }
    ],
    "files": [
      {
        "label": "Download all COMP reference files (.zip)",
        "url": "reference-solutions/comp139e-worked-references.zip"
      },
      {
        "label": "spherical.cpp",
        "url": "reference-solutions/comp139e/lab03/spherical.cpp"
      },
      {
        "label": "spherical.hpp",
        "url": "reference-solutions/comp139e/lab03/spherical.hpp"
      }
    ]
  },
  "f26-67": {
    "title": "COMP 139E · Lab 4: Files and text processing",
    "status": "Worked code reference · compiled and checked",
    "sections": [
      {
        "title": "How the solution works",
        "steps": [
          "Open the input path from argv[1]; open argv[2] with std::ios::app. Skip whitespace before classifying.",
          "Peek at the first character: digit, + or − indicates an integer; otherwise extract a std::string. Read integers directly into int, as the handout requires.",
          "Print one labelled token per line and use word.size() for the character count. Valid signed integers are assumed; out-of-range values produce an error.",
          "Compiled and checked using words, negative/positive integers, zero and append mode."
        ]
      }
    ],
    "files": [
      {
        "label": "Download all COMP reference files (.zip)",
        "url": "reference-solutions/comp139e-worked-references.zip"
      },
      {
        "label": "main.cpp",
        "url": "reference-solutions/comp139e/lab04/main.cpp"
      },
      {
        "label": "text_processing.cpp",
        "url": "reference-solutions/comp139e/lab04/text_processing.cpp"
      },
      {
        "label": "text_processing.hpp",
        "url": "reference-solutions/comp139e/lab04/text_processing.hpp"
      }
    ]
  },
  "f26-68": {
    "title": "COMP 139E · Lab 5: PID controller",
    "status": "Worked code reference · compiled and checked",
    "sections": [
      {
        "title": "How the solution works",
        "steps": [
          "Use error=setpoint−plantOutput. Update q=0.9q+0.1error first; q starts at zero.",
          "The handout output is setpoint+kc[error+(T/ti)q−(td/T)(output−previousOutput)]. Store previousOutput after calculating the new control input.",
          "The derivative acts on plant output with a negative sign. The leaky integral is specified by this handout; it is not the usual unbounded accumulated sum.",
          "Compiled and ran the 50-step simulation. With kc=0.5, ti=25, td=2.5 the first control input is 1.502."
        ]
      }
    ],
    "files": [
      {
        "label": "Download all COMP reference files (.zip)",
        "url": "reference-solutions/comp139e-worked-references.zip"
      },
      {
        "label": "Controller.hpp",
        "url": "reference-solutions/comp139e/lab05/Controller.hpp"
      },
      {
        "label": "PID_Controller.cpp",
        "url": "reference-solutions/comp139e/lab05/PID_Controller.cpp"
      },
      {
        "label": "PID_Controller.hpp",
        "url": "reference-solutions/comp139e/lab05/PID_Controller.hpp"
      },
      {
        "label": "Plant.cpp",
        "url": "reference-solutions/comp139e/lab05/Plant.cpp"
      },
      {
        "label": "Plant.hpp",
        "url": "reference-solutions/comp139e/lab05/Plant.hpp"
      },
      {
        "label": "ProportionalController.cpp",
        "url": "reference-solutions/comp139e/lab05/ProportionalController.cpp"
      },
      {
        "label": "ProportionalController.hpp",
        "url": "reference-solutions/comp139e/lab05/ProportionalController.hpp"
      },
      {
        "label": "controllerMain.cpp",
        "url": "reference-solutions/comp139e/lab05/controllerMain.cpp"
      },
      {
        "label": "main.cpp",
        "url": "reference-solutions/comp139e/lab05/main.cpp"
      }
    ]
  },
  "f26-69": {
    "title": "COMP 139E · Lab 6: Linked template stack and Square",
    "status": "Worked code reference · compiled and checked",
    "sections": [
      {
        "title": "How the solution works",
        "steps": [
          "A node contains a value and next pointer. Push links a new node before the current head. Pop saves the item, advances the head, deletes the old node and decrements the count.",
          "Top and pop throw StackException when empty. Template definitions stay in the header. Copying is disabled to prevent shallow copies of owned nodes.",
          "Square inherits Rectangle and forwards equal side lengths. The driver uses Stack<Shape*>, demonstrates every stack operation and catches an intentional empty-stack pop.",
          "Compiled and ran: shapes draw in last-in-first-out order and the exception is caught. The stack owns nodes; the example’s shapes live in the driver scope."
        ]
      }
    ],
    "files": [
      {
        "label": "Download all COMP reference files (.zip)",
        "url": "reference-solutions/comp139e-worked-references.zip"
      },
      {
        "label": "Download all COMP reference files (.zip)",
        "url": "reference-solutions/comp139e-worked-references.zip"
      },
      {
        "label": "Square.cpp",
        "url": "reference-solutions/comp139e/lab06/Square.cpp"
      },
      {
        "label": "Square.hpp",
        "url": "reference-solutions/comp139e/lab06/Square.hpp"
      },
      {
        "label": "Stack.hpp",
        "url": "reference-solutions/comp139e/lab06/Stack.hpp"
      },
      {
        "label": "StackException.hpp",
        "url": "reference-solutions/comp139e/lab06/StackException.hpp"
      },
      {
        "label": "main.cpp",
        "url": "reference-solutions/comp139e/lab06/main.cpp"
      }
    ]
  },
  "f26-70": {
    "title": "COMP 139E · Lab 6: Linked template stack and Square",
    "status": "Worked code reference · compiled and checked",
    "sections": [
      {
        "title": "How the solution works",
        "steps": [
          "A node contains a value and next pointer. Push links a new node before the current head. Pop saves the item, advances the head, deletes the old node and decrements the count.",
          "Top and pop throw StackException when empty. Template definitions stay in the header. Copying is disabled to prevent shallow copies of owned nodes.",
          "Square inherits Rectangle and forwards equal side lengths. The driver uses Stack<Shape*>, demonstrates every stack operation and catches an intentional empty-stack pop.",
          "Compiled and ran: shapes draw in last-in-first-out order and the exception is caught. The stack owns nodes; the example’s shapes live in the driver scope."
        ]
      }
    ],
    "files": [
      {
        "label": "Download all COMP reference files (.zip)",
        "url": "reference-solutions/comp139e-worked-references.zip"
      },
      {
        "label": "Download all COMP reference files (.zip)",
        "url": "reference-solutions/comp139e-worked-references.zip"
      },
      {
        "label": "Square.cpp",
        "url": "reference-solutions/comp139e/lab06/Square.cpp"
      },
      {
        "label": "Square.hpp",
        "url": "reference-solutions/comp139e/lab06/Square.hpp"
      },
      {
        "label": "Stack.hpp",
        "url": "reference-solutions/comp139e/lab06/Stack.hpp"
      },
      {
        "label": "StackException.hpp",
        "url": "reference-solutions/comp139e/lab06/StackException.hpp"
      },
      {
        "label": "main.cpp",
        "url": "reference-solutions/comp139e/lab06/main.cpp"
      }
    ]
  },
  "f26-71": {
    "title": "COMP 139E · Lab 7: STL vector and polymorphism",
    "status": "Worked code reference · compiled and checked",
    "sections": [
      {
        "title": "How the solution works",
        "steps": [
          "Store Shape* in std::vector so virtual draw() dispatches to each concrete shape. The example keeps the pointed-to shapes alive in the same scope.",
          "The driver uses push_back, [], front, back, size, capacity, insert, pop_back, at and max_size. An iterator loop uses begin/end to draw every shape.",
          "Call at(size()) deliberately to demonstrate std::out_of_range. operator[] does not perform this bounds check.",
          "Compiled and ran the vector operations and caught the intentional bounds exception."
        ]
      }
    ],
    "files": [
      {
        "label": "Download all COMP reference files (.zip)",
        "url": "reference-solutions/comp139e-worked-references.zip"
      },
      {
        "label": "main.cpp",
        "url": "reference-solutions/comp139e/lab07/main.cpp"
      }
    ]
  },
  "f26-72": {
    "title": "COMP 139E · Lab 8: MATLAB harmonic motion",
    "status": "Worked code reference · MATLAB execution not verified",
    "sections": [
      {
        "title": "How the solution works",
        "steps": [
          "Set ω₀=√(k/m), ζ=b/(2√(mk)). Use the underdamped sinusoid for ζ<1, exp(−ω₀t)(A+Bt) at critical damping, and two real exponentials for ζ>1.",
          "Initial conditions determine the coefficients. The provided function implements all four labels and scalar/finite input checks; its calculations use vector operations without loops.",
          "The script overlays four damping cases and creates linked subplots. Legend labels come from the function results.",
          "Code reviewed against the handout; MATLAB is not available here, so plots and MATLAB execution remain to be checked in your installation."
        ]
      }
    ],
    "files": [
      {
        "label": "Download all COMP reference files (.zip)",
        "url": "reference-solutions/comp139e-worked-references.zip"
      },
      {
        "label": "harmonicMotion.m",
        "url": "reference-solutions/comp139e/lab08/harmonicMotion.m"
      },
      {
        "label": "harmonicScript.m",
        "url": "reference-solutions/comp139e/lab08/harmonicScript.m"
      }
    ]
  },
  "f26-73": {
    "title": "COMP 139E · Lab 9: MATLAB Simpson integration",
    "status": "Worked code reference · MATLAB execution not verified",
    "sections": [
      {
        "title": "How the solution works",
        "steps": [
          "For even N, h=(b−a)/N. Simpson weights are 1 at both ends, 4 at odd interior indices, and 2 at even interior indices; multiply the weighted sum by h/3.",
          "The sum version uses vector slices; the loop version uses if/else and no sum(). Both reject odd N and N≤1.",
          "Check ∫₀¹x³ dx=1/4: Simpson should be exact up to rounding. The supplied polynomial integrates to 5.6 on [0,2]. Composite Simpson error is O(h⁴); trapezoidal error is O(h²) for sufficiently smooth functions.",
          "Code reviewed against the handout; MATLAB execution remains to be checked. At very large N, roundoff and memory use can dominate the theoretical error reduction."
        ]
      }
    ],
    "files": [
      {
        "label": "Download all COMP reference files (.zip)",
        "url": "reference-solutions/comp139e-worked-references.zip"
      },
      {
        "label": "integrationError.m",
        "url": "reference-solutions/comp139e/lab09/integrationError.m"
      },
      {
        "label": "simpsonsRuleLoop.m",
        "url": "reference-solutions/comp139e/lab09/simpsonsRuleLoop.m"
      },
      {
        "label": "simpsonsRuleSum.m",
        "url": "reference-solutions/comp139e/lab09/simpsonsRuleSum.m"
      },
      {
        "label": "trapezoidalRule.m",
        "url": "reference-solutions/comp139e/lab09/trapezoidalRule.m"
      }
    ]
  },
  "f26-37": {
    "title": "ECET 250E · Problem set 1",
    "status": "Released instructor solution linked",
    "sections": [
      {
        "title": "Use the released answer key",
        "steps": [
          "The instructor’s D2L solution is posted. Compare your working with the answer key, including signs, units and the method rather than only the final number. A Camosun sign-in is required."
        ]
      }
    ],
    "files": [
      {
        "label": "Open released solution in D2L",
        "url": "https://online.camosun.ca/d2l/le/content/347548/viewContent/5366866/View"
      }
    ]
  },
  "f26-38": {
    "title": "ECET 250E · Problem set 2",
    "status": "Released instructor solution linked",
    "sections": [
      {
        "title": "Use the released answer key",
        "steps": [
          "The instructor’s D2L solution is posted. Compare your working with the answer key, including signs, units and the method rather than only the final number. A Camosun sign-in is required."
        ]
      }
    ],
    "files": [
      {
        "label": "Open released solution in D2L",
        "url": "https://online.camosun.ca/d2l/le/content/347548/viewContent/5366867/View"
      }
    ]
  },
  "f26-39": {
    "title": "ECET 250E · Problem set 3",
    "status": "Released instructor solution linked",
    "sections": [
      {
        "title": "Use the released answer key",
        "steps": [
          "The instructor’s D2L solution is already posted. Open it alongside your attempt and compare the circuit setup, equations, signs and units. A Camosun sign-in is required.",
          "For Chapter 3, choose node voltages or mesh currents explicitly before writing equations. Check the result with KCL, KVL and power balance."
        ]
      }
    ],
    "files": [
      {
        "label": "Open released solution in D2L",
        "url": "https://online.camosun.ca/d2l/le/content/347548/viewContent/5366868/View"
      }
    ]
  },
  "f26-0": {
    "title": "PHYS 210 · Homework 1",
    "status": "Released instructor solution linked",
    "sections": [
      {
        "title": "Check your completed work",
        "steps": [
          "Use the instructor’s homework solution to check the assigned questions. The indexed Physics manual below also provides textbook solutions and diagrams."
        ]
      }
    ],
    "files": [
      {
        "label": "Open released homework solution in D2L",
        "url": "https://online.camosun.ca/d2l/le/content/348967/viewContent/5448810/View"
      }
    ]
  },
  "f26-1": {
    "title": "PHYS 210 · Homework 2",
    "status": "Released instructor solution linked",
    "sections": [
      {
        "title": "Check your completed work",
        "steps": [
          "Use the instructor’s homework solution to check the assigned questions. The indexed Physics manual below also provides textbook solutions and diagrams."
        ]
      }
    ],
    "files": [
      {
        "label": "Open released homework solution in D2L",
        "url": "https://online.camosun.ca/d2l/le/content/348967/viewContent/5448809/View"
      }
    ]
  }
};
