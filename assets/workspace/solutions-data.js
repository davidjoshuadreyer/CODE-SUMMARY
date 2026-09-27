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
  },
  "f26-25": {
    "title": "MATH 250B · Assignment 1",
    "status": "Worked study reference · 4 of 4 questions",
    "source": "https://www.leahhoward.com/m250B/250B-A1-2026.pdf",
    "sections": [
      {
        "title": "1 · Identify each surface",
        "steps": [
          "(a) z=1−x²−y² is a downward-opening circular paraboloid, vertex (0,0,1).",
          "(b) z=1−√(x²+y²) is the lower nappe of a circular cone, vertex (0,0,1). The restriction z≤1 matters: squaring alone would introduce the upper nappe.",
          "(c) z²=1−x²−y² means x²+y²+z²=1: the unit sphere centred at the origin."
        ]
      },
      {
        "title": "2 · Partial derivatives",
        "steps": [
          "Treat the other variables as constants in each derivative, and apply the chain rule to both trigonometric arguments.",
          "fx=2e^(2x)cos(y−3z)+3z²cos(3x−2y).",
          "fy=−e^(2x)sin(y−3z)−2z²cos(3x−2y).",
          "fz=3e^(2x)sin(y−3z)+2z sin(3x−2y). The first term is positive because two negative signs cancel."
        ]
      },
      {
        "title": "3 · Horizontal tangent plane",
        "steps": [
          "Set both first partial derivatives to zero: 6x+5y−3=0 and 5x+4y−2=0.",
          "Solving gives x=−2 and y=3. Substitution in the original surface gives z=7.",
          "The only point is (−2,3,7), with tangent plane z=7. A horizontal tangent plane need not indicate a maximum or minimum; this point is a saddle."
        ]
      },
      {
        "title": "4 · Absolute minimum on the bounded region",
        "steps": [
          "The region is −1≤x≤1, x²≤y≤1. Since ∂z/∂y=3>0, for each fixed x the smallest z occurs on the lower boundary y=x².",
          "Along this boundary z=5x²−2x=5(x−1/5)²−1/5. Its minimum occurs at x=1/5, which lies within [−1,1].",
          "Thus the absolute minimum is −1/5 at (x,y)=(1/5,1/25). The corresponding surface point is (1/5,1/25,−1/5).",
          "Boundary cross-check: at y=1 the minimum is 5/2; the two end points give 7 and 3. Both are larger than −1/5."
        ]
      }
    ]
  },
  "f26-2": {
    "title": "PHYS 210 · Homework 3",
    "status": "4 assigned questions · worked references and diagrams",
    "sections": [
      {
        "problem": "22.1",
        "title": "22.1 · Flux through a flat sheet",
        "steps": [
          "Use Φ = EA cos θ, where θ is measured from the surface normal. The magnitude is 1.75 ≈ 1.8 N·m²/C; shape does not matter in a uniform field."
        ],
        "manual": {
          "problem": "22.1",
          "pages": [
            74
          ]
        }
      },
      {
        "problem": "22.2",
        "title": "22.2 · Angle measured from the plane",
        "steps": [
          "Convert the 20° angle from the plane to 70° from the normal: Φ = 90.0(0.400)(0.600) cos 70° = 7.39 N·m²/C."
        ],
        "manual": {
          "problem": "22.2",
          "pages": [
            74,
            75
          ]
        }
      },
      {
        "problem": "22.5",
        "title": "22.5 · Flux through a hemisphere",
        "steps": [
          "Close the hemisphere with its flat circular base. The uniform field encloses no net charge, so the total flux through the closed surface is zero.",
          "Take E toward the dome. The base’s outward normal points opposite E, so Φbase = −Eπr². Therefore Φdome = +Eπr². Reversing E reverses the sign; the magnitude stays Eπr².",
          "The curved area is 2πr², but its normals are not all parallel to E. Use the projected circular area πr², not the curved area. This question differs from manual 22.5."
        ],
        "diagram": "hemisphere"
      },
      {
        "problem": "22.6",
        "title": "22.6 · Flux through six cube faces",
        "steps": [
          "Resolve E into x and y components. Outward fluxes: S₁ = −32.0, S₂ = 0, S₃ = +32.0, S₄ = 0, S₅ = +24.0, S₆ = −24.0 N·m²/C. The closed-surface total is zero."
        ],
        "manual": {
          "problem": "22.6",
          "pages": [
            76
          ]
        }
      }
    ],
    "source": "https://online.camosun.ca/d2l/lms/dropbox/dropbox.d2l?ou=348967"
  },
  "f26-3": {
    "title": "PHYS 210 · Homework 4",
    "status": "5 assigned questions · worked references and diagrams",
    "sections": [
      {
        "problem": "22.15",
        "title": "22.15 · Excess electrons on a sphere",
        "steps": [
          "The diameter is 26.0 cm, so R = 0.130 m. At the surface, E = k|Q|/R².",
          "|Q| = 4πε₀R²E = 2.16×10⁻⁹ C. Divide by the elementary charge: N = |Q|/e = 1.35×10¹⁰ excess electrons.",
          "The sphere’s net charge is negative and its field points inward. The magnitude 1150 N/C is positive. Manual 22.15 is a different question."
        ]
      },
      {
        "problem": "22.19",
        "title": "22.19 · Charge inside a conducting shell",
        "steps": [
          "Use zero electric field in the metal to find the induced inner charge, then conserve the shell’s total charge to find its outer charge."
        ],
        "manual": {
          "problem": "22.19",
          "pages": [
            79,
            80
          ]
        }
      },
      {
        "problem": "22.21",
        "title": "22.21 · Uniformly charged insulating sphere",
        "steps": [
          "Use the external field to obtain total charge; inside, only the enclosed volume contributes: E(r) = ρr/(3ε₀)."
        ],
        "manual": {
          "problem": "22.21",
          "pages": [
            80,
            81
          ]
        }
      },
      {
        "problem": "22.33",
        "title": "22.33 · Sphere suspended beside a charged sheet",
        "steps": [
          "Use E = |σ|/(2ε₀), T cos θ = mg and T sin θ = |q|E. The deflection is about 10.2° toward the negative sheet."
        ],
        "manual": {
          "problem": "22.31",
          "pages": [
            84
          ]
        }
      },
      {
        "problem": "22.37",
        "title": "22.37 · Flux through a slanted box",
        "steps": [
          "Each face has area A = (0.0500)(0.0600) = 0.00300 m². Since each face is 30° to the horizontal field, its normal is 60° to that field.",
          "The first field points out: Φ₁ = +(2.50×10⁴)A cos 60° = +37.5 N·m²/C. The other points in: Φ₂ = −(7.00×10⁴)A cos 60° = −105 N·m²/C.",
          "With no flux through other faces, Φnet = −67.5 N·m²/C and Qenclosed = ε₀Φnet = −5.98×10⁻¹⁰ C.",
          "Gauss’s law fixes the net enclosed charge. It does not separate the local field into internal and external contributions: outside charges can contribute field with zero net closed-surface flux. The flux calculation alone therefore cannot rule out outside charges."
        ]
      }
    ],
    "source": "https://online.camosun.ca/d2l/lms/dropbox/dropbox.d2l?ou=348967"
  },
  "f26-4": {
    "title": "PHYS 210 · Homework 5",
    "status": "6 assigned questions · worked references and diagrams",
    "sections": [
      {
        "problem": "23.1",
        "title": "23.1 · Work done by two charges",
        "steps": [
          "Use W = Uᵢ − U𝒇 = kq₁q₂(1/rᵢ − 1/r𝒇), with r𝒇 = √(0.250²+0.250²) m. The electric force does −0.356 J of work."
        ],
        "manual": {
          "problem": "23.1",
          "pages": [
            115
          ]
        }
      },
      {
        "problem": "23.5",
        "title": "23.5 · Repulsion and closest approach",
        "steps": [
          "Conserve K + kq₁q₂/r. Set K = 0 at the turning point; both charges are negative, so their potential energy is positive."
        ],
        "manual": {
          "problem": "23.5",
          "pages": [
            116,
            117
          ]
        }
      },
      {
        "problem": "23.7",
        "title": "23.7 · Two protons approaching",
        "steps": [
          "Both protons lose kinetic energy. At closest approach, ke²/r equals their combined initial kinetic energy; then Fmax = ke²/r²."
        ],
        "manual": {
          "problem": "23.7",
          "pages": [
            118
          ]
        }
      },
      {
        "problem": "23.8",
        "title": "23.8 · Three charges on a triangle",
        "steps": [
          "There are three distinct pairs: U = 3kq²/a. Do not double-count the pairs."
        ],
        "manual": {
          "problem": "23.8",
          "pages": [
            118
          ]
        }
      },
      {
        "problem": "23.19",
        "title": "23.19 · Potential at two points",
        "steps": [
          "Add signed scalar potentials V = kΣq/r. For the move B → A, work by the electric force is q(VB − VA)."
        ],
        "manual": {
          "problem": "23.19",
          "pages": [
            123
          ]
        }
      },
      {
        "problem": "23.27",
        "title": "23.27 · Electron on the axis of a charged ring",
        "steps": [
          "Use V(x) = kQ/√(R²+x²) and conserve energy. The electron oscillates along the axis; the exact motion at this amplitude is not simple harmonic."
        ],
        "manual": {
          "problem": "23.29",
          "pages": [
            126,
            127
          ]
        }
      }
    ],
    "source": "https://online.camosun.ca/d2l/lms/dropbox/dropbox.d2l?ou=348967"
  },
  "f26-5": {
    "title": "PHYS 210 · Homework 6",
    "status": "6 assigned questions · worked references and diagrams",
    "sections": [
      {
        "problem": "23.44",
        "title": "23.44 · Electric field from potential",
        "steps": [
          "E = −∇V. At the given point, E = (−6.72 i − 7.20 j) V/m, |E| = 9.85 V/m, direction 227° from +x."
        ],
        "manual": {
          "problem": "23.44",
          "pages": [
            132
          ]
        }
      },
      {
        "problem": "23.55",
        "title": "23.55 · Potential varying as x^(4/3)",
        "steps": [
          "Find C from ΔV = C d^(4/3), differentiate to obtain Ex = −(4/3)C x^(1/3), then multiply by −e for the electron’s force."
        ],
        "manual": {
          "problem": "23.55",
          "pages": [
            139
          ]
        }
      },
      {
        "problem": "23.59",
        "title": "23.59 · Charged pendulum between plates",
        "steps": [
          "From force balance, E = mg tan θ/q. Multiply by the plate spacing: ΔV ≈ 47.7 V (47.8 V with the manual’s rounded intermediate force)."
        ],
        "manual": {
          "problem": "23.59",
          "pages": [
            140
          ]
        }
      },
      {
        "problem": "24.1",
        "title": "24.1 · Field, charge and plate spacing",
        "steps": [
          "Use V = Ed, σ = ε₀E, A = Q/σ, and C = Q/V."
        ],
        "manual": {
          "problem": "24.1",
          "pages": [
            158
          ]
        }
      },
      {
        "problem": "24.3",
        "title": "24.3 · Parallel-plate capacitor",
        "steps": [
          "Use V = Q/C, A = Cd/ε₀, E = V/d, and σ = Q/A."
        ],
        "manual": {
          "problem": "24.3",
          "pages": [
            159
          ]
        }
      },
      {
        "problem": "24.7",
        "title": "24.7 · Separating charged plates",
        "steps": [
          "C = Q/V and d = ε₀A/C. The initial gap is about 1.05 mm. Doubling the gap at fixed charge doubles the potential to 84.0 V."
        ],
        "manual": {
          "problem": "24.7",
          "pages": [
            160
          ]
        }
      }
    ],
    "source": "https://online.camosun.ca/d2l/lms/dropbox/dropbox.d2l?ou=348967"
  },
  "f26-6": {
    "title": "PHYS 210 · Homework 7",
    "status": "8 assigned questions · worked references and diagrams",
    "sections": [
      {
        "problem": "24.7",
        "title": "24.7 · Separating charged plates",
        "steps": [
          "Repeated from Homework 6: the initial gap is about 1.05 mm; at fixed charge, doubling the gap raises the voltage to 84.0 V."
        ],
        "manual": {
          "problem": "24.7",
          "pages": [
            160
          ]
        }
      },
      {
        "problem": "24.8",
        "title": "24.8 · Design an air capacitor",
        "steps": [
          "The minimum gap is Vmax/Emax = 1.00 cm. With C = 5.00 pF this requires radius 4.24 cm; Qmax = CVmax = 500 pC."
        ],
        "manual": {
          "problem": "24.6",
          "pages": [
            159,
            160
          ]
        }
      },
      {
        "problem": "24.12",
        "title": "24.12 · Cylindrical capacitor",
        "steps": [
          "Use C/L = 2πε₀/ln(b/a) with radii 2.2 mm and 3.5 mm, then Q = CV for length 2.8 m and V = 0.350 V."
        ],
        "manual": {
          "problem": "24.10",
          "pages": [
            161
          ]
        }
      },
      {
        "problem": "24.14",
        "title": "24.14 · Series and parallel capacitors",
        "steps": [
          "First combine 5 μF and 8 μF in parallel. That 13 μF equivalent is in series with 10 μF and 9 μF. Series charge is shared; the parallel pair shares voltage."
        ],
        "manual": {
          "problem": "24.14",
          "pages": [
            162
          ]
        }
      },
      {
        "problem": "24.24",
        "title": "24.24 · Work separating isolated plates",
        "steps": [
          "Charge stays fixed: V = Q/C and U = Q²/(2C). Doubling the gap halves C, doubles V and U, and requires external work ΔU."
        ],
        "manual": {
          "problem": "24.24",
          "pages": [
            167
          ]
        }
      },
      {
        "problem": "24.36",
        "title": "24.36 · Build a capacitor with paper",
        "steps": [
          "For n paper sheets, d = n(0.00020 m), A = (0.22)(0.28) = 0.0616 m², and κ = 3.0. Solve C = κε₀A/d for n.",
          "n = κε₀A/[C(0.00020)] = 8.18. About 8 sheets give C ≈ 1.02 nF; exactly 1.00 nF is not achievable with an integer number of these full sheets in the ideal model.",
          "With 12.0 mm posterboard, A = Cd/(κε₀) = 0.452 m² (a square about 0.672 m on a side).",
          "For the same thickness and target capacitance, a smaller dielectric constant requires a larger area. Teflon therefore needs more area than paper. This question has no matching verified solution in the supplied manual."
        ],
        "diagram": "capacitor"
      },
      {
        "problem": "24.66",
        "title": "24.66 · Half-filled dielectric capacitor",
        "steps": [
          "The air and Plexiglas occupy side-by-side areas, so they act in parallel: C = ε₀A(1+κ)/(2d). The battery holds V constant during removal; use U = CV²/2."
        ],
        "manual": {
          "problem": "24.64",
          "pages": [
            186
          ]
        }
      },
      {
        "problem": "24.68",
        "title": "24.68 · Capacitive fuel gauge",
        "steps": [
          "The filled and empty areas act in parallel. C/Cempty = 1+(κ−1)h/L. For gasoline at ¼, ½, ¾ full: 1.2375, 1.475, 1.7125. For methanol: 9, 17, 25."
        ],
        "manual": {
          "problem": "24.66",
          "pages": [
            187
          ]
        }
      }
    ],
    "source": "https://online.camosun.ca/d2l/lms/dropbox/dropbox.d2l?ou=348967"
  },
  "f26-7": {
    "title": "PHYS 210 · Homework 8",
    "status": "8 assigned questions · worked references and diagrams",
    "sections": [
      {
        "problem": "25.1",
        "title": "25.1 · Charge in a lightning strike",
        "steps": [
          "Q = IΔt = (25,000 A)(40 μs) = 1.0 C."
        ],
        "manual": {
          "problem": "25.1",
          "pages": [
            197
          ]
        }
      },
      {
        "problem": "25.2",
        "title": "25.2 · Silver-wire drift speed",
        "steps": [
          "Convert 80 minutes to 4800 seconds. I = Q/t = 0.0875 A and vd = I/(neA), with A = πd²/4."
        ],
        "manual": {
          "problem": "25.2",
          "pages": [
            197
          ]
        }
      },
      {
        "problem": "25.5",
        "title": "25.5 · Electron transit time in copper",
        "steps": [
          "For steady current, I = neAvd with A = πd²/4. The electron’s average drift time over length L is t = L/vd = LneA/I.",
          "For L = 0.710 m, I = 4.85 A, n = 8.5×10²⁸ m⁻³ and d = 2.05 mm: vd = 1.08×10⁻⁴ m/s and t = 6.58×10³ s = 1.83 h.",
          "For d = 4.12 mm: vd = 2.67×10⁻⁵ m/s and t = 2.66×10⁴ s = 7.38 h. At fixed current, a larger area means a smaller drift speed and a longer transit time.",
          "This is electron drift, not the time for an electrical signal to propagate. Manual 25.5 is a different question."
        ]
      },
      {
        "problem": "25.11",
        "title": "25.11 · Resistivity and temperature coefficient",
        "steps": [
          "At 20°C use R = V/I and ρ = RA/L. Then R(T) = R₂₀[1+α(T−20°C)] determines α from the second current."
        ],
        "manual": {
          "problem": "25.13",
          "pages": [
            200
          ]
        }
      },
      {
        "problem": "25.12",
        "title": "25.12 · Current density in square copper wire",
        "steps": [
          "Use area (2.3 mm)², J = I/A, E = ρJ, vd = J/(ne), and travel time L/vd."
        ],
        "manual": {
          "problem": "25.14",
          "pages": [
            200
          ]
        }
      },
      {
        "problem": "25.16",
        "title": "25.16 · Stretching a wire at constant volume",
        "steps": [
          "If L becomes 3L, constant volume makes A become A/3. Thus R′ = ρ(3L)/(A/3) = 9R."
        ],
        "manual": {
          "problem": "25.18",
          "pages": [
            201
          ]
        }
      },
      {
        "problem": "25.25",
        "title": "25.25 · Copper transmission cable",
        "steps": [
          "Use R = ρL/(πd²/4), V = IR, P = I²R, and energy = P×3600 s for one hour."
        ],
        "manual": {
          "problem": "25.25",
          "pages": [
            202,
            203
          ]
        }
      },
      {
        "problem": "25.21",
        "title": "25.21 · Gold-wire current and resistance",
        "steps": [
          "Use J = E/ρ, I = JA, V = EL, and R = ρL/A. Keep the diameter in metres."
        ],
        "manual": {
          "problem": "25.21",
          "pages": [
            202
          ]
        }
      }
    ],
    "source": "https://online.camosun.ca/d2l/lms/dropbox/dropbox.d2l?ou=348967"
  },
  "f26-8": {
    "title": "PHYS 210 · Homework 9",
    "status": "10 assigned questions · worked references and diagrams",
    "sections": [
      {
        "problem": "26.3",
        "title": "26.3 · Power after adding a series resistor",
        "steps": [
          "The initial 36 W in 25 Ω determines the source voltage: V² = 900 V². With 40 Ω total, Ptotal = V²/R = 22.5 W."
        ],
        "manual": {
          "problem": "26.3",
          "pages": [
            227
          ]
        }
      },
      {
        "problem": "26.6",
        "title": "26.6 · Infer the battery emf from an ammeter",
        "steps": [
          "The ammeter’s 1.25 A through 25 Ω fixes the parallel-network voltage at 31.25 V. Use it to obtain all branch currents, then the drops across the series 45 Ω and 35 Ω resistors."
        ],
        "manual": {
          "problem": "26.6",
          "pages": [
            228
          ]
        }
      },
      {
        "problem": "26.8",
        "title": "26.8 · Three resistors in parallel",
        "steps": [
          "Every branch is across the 28.0 V source. 1/Req = 1/1.60 + 1/2.40 + 1/4.80, so Req = 0.800 Ω.",
          "Currents through 1.60 Ω, 2.40 Ω and 4.80 Ω are 17.5 A, 11.7 A and 5.83 A, respectively. Their sum is Itotal = 35.0 A = 28.0/0.800.",
          "Power in each branch is V²/R: 490 W, 327 W and 163 W. Total power is 980 W, agreeing with VItotal.",
          "The voltage across each resistor is 28.0 V. Manual 26.8 uses different values; use these handout values."
        ]
      },
      {
        "problem": "26.21",
        "title": "26.21 · Two bulbs in series and parallel",
        "steps": [
          "Use the stated constant resistances. In series the same current flows through both; in parallel both receive 120 V. Brightness follows each bulb’s power."
        ],
        "manual": {
          "problem": "26.21",
          "pages": [
            235,
            236
          ]
        }
      },
      {
        "problem": "26.24",
        "title": "26.24 · Two batteries and two resistors",
        "steps": [
          "The 10 V source fixes the voltage across the 30 Ω branch. Apply Kirchhoff’s loop rule to the 20 Ω / 5 V branch, and the junction rule for the 10 V source current."
        ],
        "manual": {
          "problem": "26.24",
          "pages": [
            238
          ]
        }
      },
      {
        "problem": "26.28",
        "title": "26.28 · Three-branch circuit",
        "steps": [
          "Both batteries have their positive terminals on the left in this handout. Currents: top 0.800 A right → left, middle 0.200 A left → right, bottom 0.600 A left → right. Vab = −3.20 V. The sheet says to do only 26.28, not 26.29."
        ],
        "manual": {
          "problem": "26.26",
          "pages": [
            240
          ]
        }
      },
      {
        "problem": "26.39",
        "title": "26.39 · Capacitor discharging to one-quarter voltage",
        "steps": [
          "Use V/V₀ = e^(−t/RC). The time constant is 4.00/ln 4 = 2.885 s, giving C = 0.849 μF for R = 3.40 MΩ."
        ],
        "manual": {
          "problem": "26.37",
          "pages": [
            245
          ]
        }
      },
      {
        "problem": "26.43",
        "title": "26.43 · Discharge through two series resistors",
        "steps": [
          "Combine the parallel capacitors to 35 μF and the series resistors to 80 Ω. Use V = V₀e^(−t/RC) and I = V/R."
        ],
        "manual": {
          "problem": "26.41",
          "pages": [
            246
          ]
        }
      },
      {
        "problem": "26.51",
        "title": "26.51 · Capacitor charging",
        "steps": [
          "Q∞ = CV = 165.2 μC. Use Q/Q∞ = 1−e^(−t/RC) with Q = 110 μC at 3.00 ms to find R; 99% charge takes RC ln 100."
        ],
        "manual": {
          "problem": "26.49",
          "pages": [
            248,
            249
          ]
        }
      },
      {
        "problem": "25.59",
        "title": "25.59 · Supplement · resistance of a truncated cone",
        "steps": [
          "Treat thin slices along the axis as series resistors: dR = ρ dx/[πr(x)²], with r(x) varying linearly. Integration gives R = ρh/(πr₁r₂), reducing to ρh/(πr²) when r₁ = r₂."
        ],
        "manual": {
          "problem": "25.59",
          "pages": [
            213
          ]
        }
      }
    ],
    "source": "https://online.camosun.ca/d2l/lms/dropbox/dropbox.d2l?ou=348967"
  },
  "f26-9": {
    "title": "PHYS 210 · Homework 10",
    "status": "9 assigned questions · worked references and diagrams",
    "sections": [
      {
        "problem": "27.1",
        "title": "27.1 · Magnetic force as a vector",
        "steps": [
          "Use F = q(v×B), including the negative sign of the charge. Compute each component before taking the magnitude."
        ],
        "manual": {
          "problem": "27.1",
          "pages": [
            271
          ]
        }
      },
      {
        "problem": "27.4",
        "title": "27.4 · Acceleration in a magnetic field",
        "steps": [
          "Evaluate F = q(v×B), then a = F/m. The part of B parallel to the velocity produces no force."
        ],
        "manual": {
          "problem": "27.4",
          "pages": [
            272
          ]
        }
      },
      {
        "problem": "27.7",
        "title": "27.7 · Infer the magnetic-field components",
        "steps": [
          "With v = vy j, v×B = vyBz i − vyBx k. Therefore Fx = qvyBz and Fz = −qvyBx.",
          "qvy = (7.80×10⁻⁶)(−3.80×10³) = −0.02964. Thus Bz = (7.60×10⁻³)/(−0.02964) = −0.256 T and Bx = −(−5.20×10⁻³)/(−0.02964) = −0.175 T.",
          "By cannot be determined: a field parallel to the velocity produces no magnetic force.",
          "B·F = BxFx + BzFz = 0 using the unrounded components, so B and F are perpendicular. The supplied manual’s 27.7 is a different question."
        ]
      },
      {
        "problem": "27.10",
        "title": "27.10 · Magnetic flux through a square",
        "steps": [
          "Only Bz contributes through an xy-plane surface. The flux magnitude is |Bz|A = (0.500 T)(0.0340 m)² = 5.78×10⁻⁴ Wb."
        ],
        "manual": {
          "problem": "27.10",
          "pages": [
            274
          ]
        }
      },
      {
        "problem": "27.19",
        "title": "27.19 · Cosmic-ray particle in a semicircle",
        "steps": [
          "The diameter is 0.950 m, so r = 0.475 m. Use v = |q|Br/m and the observed curvature to determine the charge sign. The magnetic force greatly exceeds gravity and does no work."
        ],
        "manual": {
          "problem": "27.19",
          "pages": [
            277
          ]
        }
      },
      {
        "problem": "27.21",
        "title": "27.21 · Deuteron in a magnetic field",
        "steps": [
          "Use v = qBr/m, half-orbit time t = πr/v, and accelerating potential V = mv²/(2q)."
        ],
        "manual": {
          "problem": "27.20",
          "pages": [
            277,
            278
          ]
        }
      },
      {
        "problem": "27.24",
        "title": "27.24 · Proton through a quarter-circle",
        "steps": [
          "Convert the arc length to radius using r = s/(π/2); then B = mv/(qr) ≈ 1.67 mT."
        ],
        "manual": {
          "problem": "27.22",
          "pages": [
            278
          ]
        }
      },
      {
        "problem": "27.27",
        "title": "27.27 · Crossed-field velocity selector",
        "steps": [
          "No deflection requires E = −v×B = +(7.90×10³ N/C)i. The same electric field works for either sign of charge."
        ],
        "manual": {
          "problem": "27.23",
          "pages": [
            278
          ]
        }
      },
      {
        "problem": "27.29",
        "title": "27.29 · Alpha-particle velocity selector",
        "steps": [
          "First find v = √(2qVacc/m). Between the plates E = Vplates/d; choose B = E/v ≈ 0.0445 T perpendicular to E and v with the force-cancelling direction."
        ],
        "manual": {
          "problem": "27.25",
          "pages": [
            279
          ]
        }
      }
    ],
    "source": "https://online.camosun.ca/d2l/lms/dropbox/dropbox.d2l?ou=348967"
  },
  "f26-10": {
    "title": "PHYS 210 · Homework 11",
    "status": "6 assigned questions · worked references and diagrams",
    "sections": [
      {
        "problem": "27.37",
        "title": "27.37 · Lift a current-carrying bar",
        "steps": [
          "At the lifting threshold ILB = mg and I = V/R. With the changed resistance, find the new current and use a = (ILB−mg)/m initially."
        ],
        "manual": {
          "problem": "27.31",
          "pages": [
            281,
            282
          ]
        }
      },
      {
        "problem": "27.41",
        "title": "27.41 · Forces and torque on a hinged loop",
        "steps": [
          "Find each segment’s force using F = I L×B. The pair of forces makes a torque; the net force on the closed loop in a uniform field is zero."
        ],
        "manual": {
          "problem": "27.37",
          "pages": [
            283,
            284
          ]
        }
      },
      {
        "problem": "27.42",
        "title": "27.42 · Rotate a rectangular loop",
        "steps": [
          "Use μ = IA and τ = μB sin θ with θ between the area normal and B. After the stated 30° rotation, |τ| ≈ 0.113 N·m; net force remains zero."
        ],
        "manual": {
          "problem": "27.38",
          "pages": [
            284
          ]
        }
      },
      {
        "problem": "27.56",
        "title": "27.56 · Cyclotron energy and period",
        "steps": [
          "Use vmax = qBR/m, Kmax = q²B²R²/(2m), and T = 2πm/(qB). Doubling K requires B multiplied by √2. An alpha particle has approximately the same maximum energy at the same B and R."
        ],
        "manual": {
          "problem": "27.52",
          "pages": [
            290
          ]
        }
      },
      {
        "problem": "27.65",
        "title": "27.65 · Railgun",
        "steps": [
          "F = ILB gives a constant acceleration in the idealized model. Use v² = 2as for the required track length; the result is about 1.96×10⁶ m."
        ],
        "manual": {
          "problem": "27.59",
          "pages": [
            293
          ]
        }
      },
      {
        "problem": "27.69",
        "title": "27.69 · Suspended current loop",
        "steps": [
          "Find the total mass from wire length and mass per unit length, then balance gravitational and magnetic torques about the suspension axis. Use the manual’s free-body diagrams."
        ],
        "manual": {
          "problem": "27.65",
          "pages": [
            295,
            296
          ]
        }
      }
    ],
    "source": "https://online.camosun.ca/d2l/lms/dropbox/dropbox.d2l?ou=348967"
  },
  "f26-11": {
    "title": "PHYS 210 · Homework 12",
    "status": "10 assigned questions · worked references and diagrams",
    "sections": [
      {
        "problem": "28.29",
        "title": "28.29 · Force between long wires",
        "steps": [
          "F/L = μ₀I₁I₂/(2πd). Opposite currents repel. Doubling both currents multiplies the force by four."
        ],
        "manual": {
          "problem": "28.29",
          "pages": [
            325
          ]
        }
      },
      {
        "problem": "28.34",
        "title": "28.34 · Field at the centre of a semicircle",
        "steps": [
          "The straight radial sections have dl parallel to r and contribute zero. The semicircle produces B = μ₀I/(4R), into the page for the shown clockwise current."
        ],
        "manual": {
          "problem": "28.32",
          "pages": [
            325
          ]
        }
      },
      {
        "problem": "28.40",
        "title": "28.40 · Ampère loops",
        "steps": [
          "Counterclockwise traversal makes out-of-page current positive. For paths a, b, c, d the integrals are 0, −5.03×10⁻⁶, +2.51×10⁻⁶, +5.03×10⁻⁶ T·m."
        ],
        "manual": {
          "problem": "28.38",
          "pages": [
            328
          ]
        }
      },
      {
        "problem": "28.43",
        "title": "28.43 · Coaxial cable",
        "steps": [
          "Apply B(2πr) = μ₀Ienclosed. For a < r < b, B = μ₀I/(2πr). Outside both conductors the opposite currents cancel, giving B = 0."
        ],
        "manual": {
          "problem": "28.39",
          "pages": [
            329
          ]
        }
      },
      {
        "problem": "28.57",
        "title": "28.57 · Where two wire fields cancel",
        "steps": [
          "Fields cancel only when they point in opposite directions and have equal magnitude, so compare I/r for each wire.",
          "Same-direction currents: the zero lies between the wires. If x is measured from the 25.0 A wire, 25/x = 75/(0.400−x), so x = 0.100 m; it is 0.300 m from the 75.0 A wire.",
          "Opposite-direction currents: the fields add between the wires. Outside, on the 25.0 A side, 25/x = 75/(x+0.400), giving x = 0.200 m, or 0.600 m from the 75.0 A wire.",
          "Each location extends along a line parallel to the wires. The zero must be closer to the smaller current. Manual 28.51–28.52 illustrate the method with different values."
        ]
      },
      {
        "problem": "28.61",
        "title": "28.61 · Electric-bus supply cables",
        "steps": [
          "The stated maximum electrical input power is P = 65 hp × 746 W/hp = 48,490 W. Current I = P/V = 48,490/600 = 80.8 A.",
          "The magnetic force per unit length has magnitude F/L = μ₀I²/(2πd) = (2×10⁻⁷)(80.8)²/0.55 = 2.38×10⁻³ N/m.",
          "Direction check: a two-cable DC supply has outgoing and return currents in opposite directions, so its magnetic force is repulsive. The handout calls it “attractive”; the magnitude above is unchanged, but attraction would require currents in the same direction."
        ]
      },
      {
        "problem": "28.62",
        "title": "28.62 · Two opposite currents and the field on the x-axis",
        "steps": [
          "The y-components cancel and the x-components add: B = [μ₀Ia/(π(x²+a²))]i. It peaks at x = 0 and falls as 1/x² far away. The linked page includes the graph."
        ],
        "manual": {
          "problem": "28.58",
          "pages": [
            334,
            335
          ]
        }
      },
      {
        "problem": "28.64",
        "title": "28.64 · Current loop below a straight wire",
        "steps": [
          "The side forces cancel. Subtract the top and bottom forces: Fnet = μ₀IwireIloopL(1/rtop−1/rbottom)/(2π) = 7.97×10⁻⁵ N toward the wire."
        ],
        "manual": {
          "problem": "28.60",
          "pages": [
            336
          ]
        }
      },
      {
        "problem": "28.65",
        "title": "28.65 · Two suspended wires",
        "steps": [
          "The separation is 2ℓ sin θ. Balance horizontal magnetic force per length against (mass per length)g tan θ to obtain I ≈ 73.4 A."
        ],
        "manual": {
          "problem": "28.61",
          "pages": [
            337
          ]
        }
      },
      {
        "problem": "28.72",
        "title": "28.72 · Cancel a loop field with a straight wire",
        "steps": [
          "At the loop centre, equate μ₀I₁/(2πD) = μ₀I₂/(2R). Thus I₁ = πDI₂/R, directed rightward to cancel the clockwise loop’s into-page field."
        ],
        "manual": {
          "problem": "28.68",
          "pages": [
            340
          ]
        }
      }
    ],
    "source": "https://online.camosun.ca/d2l/lms/dropbox/dropbox.d2l?ou=348967"
  },
  "f26-12": {
    "title": "PHYS 210 · Homework 13",
    "status": "8 assigned questions · worked references and diagrams",
    "sections": [
      {
        "problem": "29.25",
        "title": "29.25 · Motional emf in a moving rod",
        "steps": [
          "For the perpendicular motion, ε = BLv = 0.675 V. Positive charge is driven toward b, so b is at higher potential. The internal electric field points from b to a; parallel motion produces no end-to-end emf."
        ],
        "manual": {
          "problem": "29.25",
          "pages": [
            360
          ]
        }
      },
      {
        "problem": "29.26",
        "title": "29.26 · Loop leaving a magnetic field",
        "steps": [
          "Inside or wholly outside the uniform field, flux does not change and ε = 0. During exit, |ε| = BLv = 0.0100 V; Lenz’s law gives a clockwise induced current."
        ],
        "manual": {
          "problem": "29.26",
          "pages": [
            360
          ]
        }
      },
      {
        "problem": "29.29",
        "title": "29.29 · Sliding rod on rails",
        "steps": [
          "ε = BLv = 3.00 V, I = ε/R = 2.00 A, external force = ILB = 0.800 N, and power = Fv = I²R = 6.00 W."
        ],
        "manual": {
          "problem": "29.29",
          "pages": [
            361
          ]
        }
      },
      {
        "problem": "29.42",
        "title": "29.42 · Displacement current in a capacitor",
        "steps": [
          "Use JD = I/(πR²) and dE/dt = JD/ε₀. For r < R, Ampère–Maxwell gives B = μ₀JDr/2: 1.30 μT at 2.00 cm and 0.650 μT at 1.00 cm."
        ],
        "manual": {
          "problem": "29.38",
          "pages": [
            364,
            365
          ]
        }
      },
      {
        "problem": "30.9",
        "title": "30.9 · Self-inductance and flux",
        "steps": [
          "L = |ε|/|di/dt| = 0.250 H. Average flux per turn is Li/N = 4.50×10⁻⁴ Wb."
        ],
        "manual": {
          "problem": "30.7",
          "pages": [
            390
          ]
        }
      },
      {
        "problem": "30.11",
        "title": "30.11 · Induced voltage when current falls",
        "steps": [
          "|ε| = L|di/dt| = 4.68 mV. The induced emf sustains the current from b to a; terminal a is at higher potential."
        ],
        "manual": {
          "problem": "30.9",
          "pages": [
            390
          ]
        }
      },
      {
        "problem": "30.23",
        "title": "30.23 · RL current growth",
        "steps": [
          "Use di/dt = (ε−iR)/L and i(t) = (ε/R)(1−e^(−Rt/L)). Results: 2.40 A/s initially; 0.800 A/s at 0.500 A; 0.413 A at 0.250 s; final current 0.750 A."
        ],
        "manual": {
          "problem": "30.21",
          "pages": [
            393,
            394
          ]
        }
      },
      {
        "problem": "30.25",
        "title": "30.25 · Half-current versus half-energy time",
        "steps": [
          "τ = L/R = 25.0 μs. Half current occurs at τ ln 2 = 17.3 μs. Half energy requires i/Imax = 1/√2 and takes 30.7 μs."
        ],
        "manual": {
          "problem": "30.23",
          "pages": [
            394,
            395
          ]
        }
      }
    ],
    "source": "https://online.camosun.ca/d2l/lms/dropbox/dropbox.d2l?ou=348967"
  },
  "f26-52": {
    "title": "ECET 250E · Lab 4 · Resistive DC Circuits",
    "status": "Calculated values ready · add your measured values and observations",
    "source": "https://online.camosun.ca/d2l/le/content/347548/viewContent/5366830/View",
    "diagram": "divider",
    "sections": [
      {
        "title": "Part A · Series-circuit calculations",
        "steps": [
          "The 12.0 V source drives 1.0 kΩ, 4.7 kΩ, 2.2 kΩ and 3.3 kΩ in series. Rtotal = 11.2 kΩ, so I = 12.0/11.2 kΩ = 1.07143 mA.",
          "With E as the 0 V reference, node potentials are A = 12.000 V, B = 10.9286 V, C = 5.89286 V, D = 3.53571 V, E = 0 V.",
          "Use VXY = VX − VY. The sign changes when you reverse the meter leads."
        ],
        "table": {
          "head": [
            "Quantity",
            "Calculated",
            "Measured"
          ],
          "rows": [
            [
              "VAB",
              "+1.07143 V",
              "Record in lab"
            ],
            [
              "VBC",
              "+5.03571 V",
              "Record in lab"
            ],
            [
              "VCD",
              "+2.35714 V",
              "Record in lab"
            ],
            [
              "VDE",
              "+3.53571 V",
              "Record in lab"
            ],
            [
              "VAC",
              "+6.10714 V",
              "Record in lab"
            ],
            [
              "VDC",
              "−2.35714 V",
              "Record in lab"
            ],
            [
              "VEC",
              "−5.89286 V",
              "Record in lab"
            ],
            [
              "I",
              "1.07143 mA",
              "Record in lab"
            ]
          ]
        }
      },
      {
        "title": "Part A · Checks and comparison",
        "steps": [
          "Kirchhoff’s voltage law: 1.07143 + 5.03571 + 2.35714 + 3.53571 = 12.000 V. The current is the same through every series resistor.",
          "Compare measurements using |measured−calculated|/|calculated| × 100%. Use the handout’s nominal resistor values for the prediction, and discuss actual tolerances and meter loading when explaining differences.",
          "Do not put the ammeter directly across the source; current measurement requires the meter to be in series, using the appropriate input jack and range."
        ]
      },
      {
        "title": "Part B · Potentiometer output ranges",
        "steps": [
          "For each figure, the wiper output relative to Y is the fixed bottom-resistor voltage plus the voltage across the selected part of the pot. Calculations assume negligible voltmeter loading.",
          "Figure 2: the 10 kΩ pot is across 10 V. VXY ranges from 0 V to 10.000 V; span = 10.000 V.",
          "Figure 3: 10 V across the 10 kΩ pot and a bottom 2.2 kΩ resistor. Minimum = 10(2.2/12.2) = 1.80328 V; maximum = 10.000 V; span = 8.19672 V.",
          "Figure 4: 20 V across a top 2.2 kΩ resistor, 10 kΩ pot and bottom 1.0 kΩ resistor. Minimum = 20(1/13.2) = 1.51515 V; maximum = 20(11/13.2) = 16.6667 V; span = 15.1515 V.",
          "Record both measured endpoints for each circuit. Keep maximum, minimum and their difference distinct when completing Table B."
        ]
      },
      {
        "title": "Report · What still requires your experiment",
        "steps": [
          "Insert your measured voltages and current, and photos of your actual circuit connections.",
          "Explain whether your measurements support Ohm’s law, KVL and the predicted voltage-divider ranges. Refer to your recorded numbers.",
          "Describe what you learned and any problems you encountered, including how you corrected them. These observations cannot be filled in reliably before doing the lab."
        ]
      }
    ]
  }
};
