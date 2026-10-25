// Original short practice based on the course lessons and worksheets available Oct 24.
// These are preparation topics, not a claim of confirmed exam coverage or dates.
const groups=[];
function group(topics,rows){groups.push({topics:topics.split(' '),prep:true,rows:rows.trim().split('\n').map(line=>line.split('|'))});}
group('calc-12.8 math250b-1',`
prep-direction|At a point, gradient f = (3, 4). What is the greatest directional derivative?|5|7|25|1|The maximum directional derivative is the length of the gradient: sqrt(9 + 16) = 5.
`);
group('calc-12.10 math250b-2',`
prep-hessian|At a stationary point, D = fxx fyy − fxy² is positive and fxx is negative. What follows?|A local maximum|A local minimum|A saddle point|The test is inconclusive|Positive D means both principal curvatures have the same sign. Negative fxx makes this a local maximum.
`);
group('calc-12.9 math250b-2',`
prep-lagrange|When finding absolute extrema on a closed bounded region, which candidates must you check?|Interior critical points and boundary candidates|Only interior critical points|Only the origin|Only points with a positive multiplier|Absolute extrema can occur inside or on the boundary. Compare values at all feasible candidates, including corners.
`);
group('calc-13.2 math250b-3',`
prep-reverse|The region is 0 ≤ x ≤ 1 and x ≤ y ≤ 1. What bounds describe it with x integrated first?|0 ≤ y ≤ 1; 0 ≤ x ≤ y|0 ≤ y ≤ 1; y ≤ x ≤ 1|0 ≤ x ≤ 1; 0 ≤ y ≤ x|0 ≤ y ≤ 1; 0 ≤ x ≤ 1|The region lies above y = x in the unit square. A horizontal slice runs from x = 0 to x = y.
`);
group('calc-13.4 math250b-3',`
prep-polar|For a disk of radius 2 centred at the origin, which polar bounds cover it once?|0 ≤ r ≤ 2; 0 ≤ θ ≤ 2π|0 ≤ r ≤ 4; 0 ≤ θ ≤ π|−2 ≤ r ≤ 2; 0 ≤ θ ≤ 2π|0 ≤ r ≤ 2; 0 ≤ θ ≤ π|A nonnegative radius from 0 to 2 and one full angular turn cover the disk. Include r in the area element.
`);
group('calc-13.6 math250b-4',`
prep-triple|What does a triple integral of 1 over a solid measure?|Its volume|Its surface area|Its mass for every density|Its boundary length|Each volume element contributes once. Mass requires integrating density instead.
`);
group('math252-7',`
prep-repeated|A characteristic equation has repeated root r = 2. Which is the general homogeneous solution?| (C1 + C2 x)e^(2x)|C1 e^(2x) + C2 e^(2x)|C1 cos(2x) + C2 sin(2x)|C1 e^x + C2 e^(2x)|A repeated root needs a second independent solution x e^(2x); two multiples of e^(2x) are not independent.
prep-complex|Roots −1 ± 3i give which real homogeneous solution?|e^(−x)(C1 cos 3x + C2 sin 3x)|e^(3x)(C1 cos x + C2 sin x)|C1 e^(−x) + C2 e^(3x)|C1 cos 3x + C2 sin 3x|The real part gives the exponential envelope; the imaginary part gives the oscillation frequency.
`);
group('math252-8',`
prep-resonance|For y'' − 3y' + 2y = e^x, what particular trial avoids duplicating the homogeneous solution?|A x e^x|A e^x|A x²|A cos x|The characteristic roots are 1 and 2, so e^x is already a homogeneous solution. Multiply the trial by x.
prep-poly|For y'' + y = x², which trial has enough terms for undetermined coefficients?|Ax² + Bx + C|Ax² only|Ae^x|A sin x|Use a full degree-two polynomial because differentiation produces lower-degree terms.
`);
group('math252-9',`
prep-vop|Before using standard variation-of-parameters formulas for y'' + p y' + q y = g, what must you do?|Divide by the coefficient of y''|Set both initial conditions to zero|Discard the forcing term|Make the Wronskian zero|The usual formulas assume leading coefficient 1; divide the entire equation, including the forcing term.
`);
group('math252-10',`
prep-euler|For x²y'' + axy' + by = 0 on x > 0, what trial leads to the indicial equation?|y = x^m|y = e^(mx)|y = sin(mx)|y = m + x|Each derivative lowers the power while its x factor restores it, giving m(m−1) + am + b = 0.
`);
group('comp139e-4 comp139e-20',`
prep-array-delete|Memory was allocated with new double[n]. How should it be released?|delete[] pointer;|delete pointer;|free(pointer);|pointer = nullptr; only|Array new pairs with delete[]. Nulling a pointer alone does not release its allocation.
`);
group('comp139e-9',`
prep-link-insert|To insert node n at the head of a singly linked list, which order preserves the old list?|n->next = head; head = n;|head = n; n->next = head;|delete head; head = n;|n->next = nullptr; head = n;|Save the old head in n->next before moving head. Reversing the assignments makes n point to itself.
prep-link-delete|When deleting the first node, what must happen before delete oldHead?|Save or move to its next pointer|Read oldHead->next after deletion|Delete every following node|Set the new head to oldHead|Once deleted, oldHead must not be dereferenced. Move head to the saved successor first.
`);
group('comp139e-10',`
prep-queue-last|A linked queue removes its only node. What should its head and tail become?|Both nullptr|Only head becomes nullptr|Only tail becomes nullptr|Both point to the deleted node|An empty queue must not retain a dangling tail. Reset both ends when the last node is removed.
prep-ring|A circular array queue has capacity N. How do you advance an index with wraparound?|(index + 1) % N|index + N|index % (N + 1)|index − 1 always|Modulo N returns to zero after index N−1. Full and empty detection also need a count or a spare-slot convention.
`);
group('comp139e-11 comp139e-22',`
prep-stream|Which loop processes a numeric input only when extraction succeeds?|while (in >> value)|while (!in.eof())|while (in.good()) followed by unchecked extraction|while (value != 0)|The extraction itself tests success, avoiding processing a stale value after the final failed read.
`);
group('phys210-4',`
prep-potential-sign|A positive charge moves to a lower electric potential. Its electric potential energy…|Decreases|Increases|Cannot change|Must become zero|The change is q times the change in potential. For positive q, a decrease in potential lowers potential energy.
prep-equipotential|How much work does the electrostatic force do moving a charge along one equipotential?|Zero|q times the path length|Always positive|Always negative|The endpoints have the same potential, so the electrostatic work −q ΔV is zero.
`);
group('phys210-5',`
prep-cap-battery|A dielectric fully fills a capacitor while it stays connected to an ideal battery. What stays fixed?|Voltage|Charge|Capacitance|Stored energy|The battery fixes voltage. Capacitance increases, so charge and stored energy increase.
prep-cap-isolated|An isolated charged capacitor is disconnected before a dielectric is inserted. What stays fixed?|Free charge on its plates|Voltage|Stored energy|Capacitance|With no conducting path, free plate charge stays fixed. Increased capacitance lowers voltage and stored energy.
prep-cap-series|Two identical capacitors C are connected in series. Their equivalent capacitance is…|C/2|2C|C|C²|Reciprocals add in series: 1/Ceq = 1/C + 1/C.
prep-cap-energy|At fixed capacitance, doubling voltage changes stored energy by what factor?|4|2|1/2|1|Stored energy is one half C V², so doubling V multiplies it by four.
`);
group('ecet-ch7',`
prep-rc-initial|With finite current, which quantity cannot jump instantaneously at a switching event?|Capacitor voltage|Resistor voltage|Resistor current|Switch voltage|An instantaneous capacitor-voltage jump would require an impulse of current because i = C dv/dt.
prep-rl-initial|With finite voltage, which quantity cannot jump instantaneously?|Inductor current|Capacitor current|Resistor voltage|Switch current|Since v = L di/dt, an instantaneous inductor-current jump requires an impulse of voltage.
prep-rc-final|In DC steady state, an ideal capacitor and inductor act respectively as…|An open circuit and a short circuit|A short circuit and an open circuit|Two open circuits|Two short circuits|At steady DC, dv/dt and di/dt vanish. Capacitor current is zero and inductor voltage is zero.
prep-time-constant|For an RC response, how is the time constant found?|Resistance seen by the capacitor times C|C divided by resistance|The initial voltage times C|Only the resistance of the nearest component|Use the equivalent resistance seen at the capacitor with independent sources deactivated; dependent sources require proper analysis.
`);
group('ecet-ch8',`
prep-critical|For s² + 2αs + ω0² = 0, critical damping occurs when…|α = ω0|α = 0 with ω0 > 0|α < ω0|α > ω0|Equal damping and natural frequency produce a repeated real root, between oscillatory and overdamped cases.
`);
group('ecet-ch9',`
prep-cap-phase|In sinusoidal steady state, an ideal capacitor’s current…|Leads its voltage by 90°|Lags its voltage by 90°|Is always in phase|Has twice the frequency|From i = C dv/dt, differentiating a sinusoid gives a quarter-cycle phase lead.
`);
group('engr290-0',`
prep-fcc|How many atoms belong to a conventional FCC unit cell?|4|6|8|2|Eight corners contribute 1 atom in total; six faces contribute 3. The total is 4.
`);
group('engr290-1',`
prep-miller|A crystal plane is parallel to the z axis. Its third Miller index is…|0|1|Infinity|Always −1|A parallel axis has an infinite intercept; taking its reciprocal gives zero.
`);
group('engr290-3',`
prep-grains|Why can smaller grains strengthen a metal in the usual Hall–Petch regime?|More grain boundaries impede dislocations|They remove all dislocations|They eliminate all atomic bonds|They make every crystal amorphous|Grain boundaries obstruct dislocation motion, raising the stress needed for plastic deformation.
prep-cold-work|Cold working commonly increases strength while reducing…|Ductility|Dislocation density|The number of grain boundaries to zero|Atomic number|Plastic deformation increases dislocation density. Their interactions hinder motion, raising strength and often lowering ductility.
`);
group('engr290-4',`
prep-diffusion|If concentration is higher on the left, net diffusion tends to go…|Toward the right|Toward the left|Only upward|Nowhere unless concentration is uniform|Fick’s first law gives flux down the concentration gradient, from higher to lower concentration.
prep-temperature|Why does diffusion usually become much faster at higher temperature?|More atoms overcome the activation-energy barrier|All vacancies disappear|Atomic mass becomes zero|The concentration gradient must reverse|Diffusion coefficients have Arrhenius temperature dependence; more thermally activated jumps occur at higher temperature.
`);
module.exports=groups;
