// Original short conceptual questions. Correct choice is first here; UI shuffles it.
// Related topic IDs share a card, preventing duplicate reviews of the same question.
const groups=[];
function group(topics,rows){groups.push({topics:topics.split(' '),rows:rows.trim().split('\n').map(line=>line.split('|'))});}
group('phys210-0',`
charge-sign|Two charges have the same sign. How do they interact?|They repel|They attract|They exert no force|Their signs reverse|Like charges repel; unlike charges attract.
charge-distance|You move a point charge farther from another fixed point charge. What happens to the force magnitude?|It decreases|It increases|It stays constant|It becomes a magnetic force|Coulomb force decreases with the square of separation.
`);
group('phys210-1',`
field-sign|A negative charge is placed in an electric field. Which way is its electric force?|Opposite the field|Along the field|Always upward|Always perpendicular to the field|Field direction is defined using a positive test charge; a negative charge reverses the force.
dipole|What does a uniform electric field tend to do to an electric dipole?|Align its dipole moment with the field|Separate its charges infinitely|Make its net charge positive|Always give it a net translational force|A uniform field can exert a torque on a dipole, tending to align its moment with the field.
`);
group('phys210-2',`
continuous-field|Why split a charged rod into tiny charge elements when finding its field?|To add their vector field contributions|To make all elements point the same way|To ignore distance|To turn charge into current|Each small element contributes a field; integration adds the components.
field-symmetry|Equal charge elements lie symmetrically on either side of an axis. What can symmetry help identify?|Field components that cancel|A reason to ignore all charges|The resistance of the axis|A magnetic force on a stationary charge|Paired elements can cancel transverse components while adding axial components.
`);
group('phys210-3',`
gauss-charge|Gauss’s law relates net electric flux through a closed surface to what?|The charge enclosed|Only charges outside it|The surface area alone|The potential at one point|Net closed-surface flux equals enclosed charge divided by the permittivity of free space.
conductor-static|Inside the conducting material of a conductor in electrostatic equilibrium, the electric field is…|Zero|Always outward|Always infinite|Set only by its mass|Free charges redistribute until no internal field drives further motion.
`);
group('phys210-4',`
potential-scalar|Which statement distinguishes electric potential from electric field?|Potential is scalar; field is vector|Both are vectors|Both are forces|Potential is measured in newtons|Potential is energy per unit charge, while field has magnitude and direction.
equipotential|How much work does the electric force do moving a charge along an equipotential?|Zero|Always positive|Always negative|It depends only on path length|No potential difference means no change in electric potential energy.
`);
group('phys210-5',`
capacitor-parallel|Capacitors connected in parallel share the same…|Voltage|Charge in every case|Plate area|Dielectric material|Parallel branches connect to the same two nodes, so they share voltage.
dielectric|An isolated charged capacitor is disconnected from its source. Inserting a dielectric increases capacitance. What stays fixed?|Its free charge|Its voltage|Its stored energy|Its electric field|With no conducting path to a source, free charge stays fixed while voltage falls.
`);
group('phys210-6',`
kcl-physics|Kirchhoff’s junction rule expresses conservation of…|Charge|Resistance|Frequency|Temperature|Charge does not continuously accumulate at an ideal circuit junction.
resistance-current|For a fixed voltage across an ohmic resistor, increasing resistance causes current to…|Decrease|Increase|Stay fixed|Reverse automatically|Ohm’s law relates current to voltage divided by resistance.
`);
group('phys210-7',`
rc-continuity|Which quantity cannot jump instantaneously across an ideal capacitor with finite current?|Capacitor voltage|Resistor voltage|Switch position|Source resistance|Changing capacitor voltage requires charge transfer, so finite current cannot produce an instantaneous jump.
rc-final|Long after connection to a constant DC source, an ideal capacitor behaves like…|An open circuit|A short circuit|An ideal current source|A negative resistor|At steady voltage its current is zero.
`);
group('phys210-8',`
magnetic-work|The magnetic force on a moving point charge does what work on it?|No work|Always positive work|Always negative work|Work proportional only to charge|The magnetic force is perpendicular to velocity and changes direction rather than speed.
magnetic-parallel|A charge moves exactly parallel to a magnetic field. Its magnetic force is…|Zero|Maximum|Along its velocity|Opposite its velocity|The cross product of parallel velocity and field vectors is zero.
`);
group('phys210-9',`
ampere-symmetry|When is Ampère’s law especially convenient for finding a magnetic field?|When symmetry simplifies the line integral|Only when no current exists|Only for electric dipoles|When magnetic field has no direction|Symmetry can make the field magnitude constant along useful portions of an Amperian loop.
wire-field|Magnetic field lines around a long straight current-carrying wire form…|Circles around the wire|Straight lines away from it|Straight lines along it|Closed squares only|Their circulation direction follows the right-hand grip rule.
`);
group('phys210-10',`
lenz|An induced current acts to oppose…|The change in magnetic flux|Every magnetic field regardless of change|All electric charge|The wire’s resistance|Lenz’s law opposes the flux change that causes induction, not necessarily the existing flux.
faraday|What produces an induced emf around a loop?|Changing magnetic flux through the loop|Any constant flux by itself|A stationary charge outside it|Zero resistance alone|Flux may change through field strength, loop area, or orientation.
`);
group('phys210-11',`
inductor-continuity|With finite applied voltage, what cannot jump instantly in an ideal inductor?|Current|Voltage|Resistance of a separate resistor|Electric potential everywhere|An instantaneous current jump would require an unbounded inductor voltage.
displacement|Why is displacement current included in the Ampère–Maxwell law?|To account for a changing electric field|To make charge disappear|To replace every conduction current|To require moving magnetic poles|A changing electric field contributes to magnetic circulation, including in a capacitor gap.
`);
group('phys210-12',`
uncertainty|Repeated measurements that agree closely demonstrate…|Precision|Necessarily accuracy|Zero systematic error|Infinite resolution|Precision describes repeatability; a systematic bias can still make the values inaccurate.
graph-units|What units should a graph’s slope have?|Vertical-axis units divided by horizontal-axis units|Horizontal-axis units only|Always no units|The sum of both axis units|Slope is change in the vertical quantity divided by change in the horizontal quantity.
`);
group('math252-0',`
ode-order|What determines the order of a differential equation?|Its highest derivative|Its largest coefficient|Its number of terms|The number of initial conditions written beside it|Order refers to the highest derivative present in the equation.
initial-condition|What does an initial condition usually help select?|A particular solution from a family|The equation’s order|A new independent variable|The units of every coefficient|Initial data select constants when the problem has an appropriate existence and uniqueness setting.
`);
group('math252-1',`
separate|Which form signals a separable equation?|dy/dx = g(x)h(y)|y′ + xy = sin(y)|y′ = x + y² in general|y′′ + y = 0|A product of a function of x and a function of y can be separated.
lost-solutions|When dividing by h(y) to separate variables, what must you also check?|Constant solutions where h(y) = 0|Only large x values|Only negative solutions|Whether every constant becomes zero|Division excludes zeros of h, which may give equilibrium solutions.
`);
group('math252-2',`
integrating-factor|What is an integrating factor intended to create in a first-order linear ODE?|A product derivative|A second derivative|A discontinuity|A new initial condition|Multiplication combines the left side into the derivative of the integrating factor times y.
linear-form|Which feature is required for y′ + P(x)y = Q(x)?|P and Q depend only on x|P must equal Q|Q must be zero|y must be positive|The standard linear form has coefficients depending on the independent variable.
`);
group('math252-3',`
exact-condition|For smooth M dx + N dy = 0 on a simply connected region, which check supports exactness?|M_y = N_x|M_x = N_y|M = N = 0 everywhere|M + N = 1|The cross partials must agree for M and N to arise from a common potential.
exact-potential|An exact equation is solved by finding what?|A potential F with dF = M dx + N dy|A vector perpendicular to every curve|Only a constant integrating factor|The largest coefficient|Its solution curves are level curves F(x,y) = C.
`);
group('math252-4',`
homogeneous-sub|For y′ = F(y/x), which substitution is natural?|y = vx|y = v + x²|x = e^y in every case|y = v′|Then y′ = v + xv′, reducing the equation to one involving v and x.
bernoulli-sub|A Bernoulli equation y′ + P(x)y = Q(x)yⁿ can usually be linearized using…|v = y^(1−n), for n ≠ 0,1|v = y + n in every case|v = xⁿ in every case|v = y′′|The power substitution converts the nonlinearity into a first-order linear equation; lost zero solutions need separate checking.
`);
group('math252-5',`
cooling|Newton’s cooling model makes temperature change proportional to…|The difference from ambient temperature|Absolute temperature alone|Mass squared alone|Elapsed time alone|The object approaches ambient temperature according to the temperature difference.
mixing|A well-mixed tank’s solute balance has the form…|Rate in minus rate out|Rate in plus rate out|Volume minus concentration|Outflow alone|Track solute amount using mass conservation, with outflow concentration set by the tank mixture.
`);
group('math252-6',`
superposition|Linear combinations of solutions remain solutions for which kind of ODE?|Linear homogeneous|Every nonlinear ODE|Every nonhomogeneous ODE without adjustment|Only separable ODEs|The homogeneous linear differential operator sends each solution, and any linear combination, to zero.
reduction-order|Reduction of order starts with…|One known solution of the homogeneous equation|Only the forcing frequency|An already known complete solution|A required zero initial condition|A known solution is used to construct an independent second solution.
`);
group('math252-7',`
complex-roots|Complex conjugate characteristic roots produce real solutions involving…|Exponentials multiplied by sine and cosine|Only constants|Only polynomials|Only logarithms|The real part sets exponential growth or decay; the imaginary part sets oscillation.
repeated-root|For a repeated characteristic root r in a second-order equation, an independent pair is…|e^(rx) and x e^(rx)|e^(rx) and 2 e^(rx)|e^(rx) twice|r and r²|Multiplying by x supplies the missing independent solution.
`);
group('math252-8',`
trial-overlap|A trial particular solution overlaps the homogeneous solution. What adjustment is needed?|Multiply the trial by a sufficient power of x|Discard the forcing term|Set every coefficient to zero|Differentiate the initial conditions|The trial must be independent of the homogeneous solutions.
undetermined-use|Undetermined coefficients works most directly with forcing made from…|Polynomials, exponentials, sines and cosines|Every possible function with no restrictions|Only discontinuous functions|Only unknown functions|These families retain a manageable form under differentiation.
`);
group('math252-9',`
variation|Variation of parameters replaces homogeneous constants with…|Functions of the independent variable|Only zero|Complex numbers in every problem|New boundary conditions|Those functions are found from equations involving the forcing term and fundamental solutions.
wronskian|A nonzero Wronskian for two solutions at a point indicates…|Linear independence|Equal initial values|Both solutions are constant|A zero forcing term|Independent homogeneous solutions form a useful basis for variation of parameters.
`);
group('math252-10',`
euler-trial|For a Cauchy–Euler equation on x > 0, a natural trial solution is…|x^r|r^x in every case|A constant only|sin(r) only|Matching powers of x in the coefficients make power-law trials useful.
euler-domain|Why treat x = 0 carefully in a Cauchy–Euler equation?|The leading coefficient may vanish there|Every solution must equal one there|Logarithms are always zero there|The equation stops being linear everywhere|The equation commonly has a singular point at zero, so solve on an appropriate interval.
`);
group('math252-11',`
damping|In a mass–spring model, viscous damping force opposes…|Velocity|Mass|The equilibrium position itself|Elapsed time|The force is proportional to velocity and directed against motion.
critical-damping|Critical damping is the boundary between…|Oscillatory and nonoscillatory free responses|Positive and negative mass|Forced and unforced equations|Linear and nonlinear stiffness|It corresponds to a repeated real characteristic root in the standard damped oscillator.
`);
group('math252-12',`
series-radius|A power series about x₀ is guaranteed to converge where?|Inside its radius of convergence|At all endpoints automatically|Everywhere on the real line|Only at x₀|Endpoints require separate checks; inside the radius the series converges.
series-align|Before equating coefficients of power series, you should…|Align equal powers of the variable|Set all indices equal to zero|Drop the lowest power|Assume every coefficient equals one|Reindexing lets you compare coefficients of the same powers.
`);
group('math252-13',`
recurrence|What does a series-solution recurrence relation do?|Express later coefficients using earlier ones|Give only the radius of a circle|Remove the need for initial data|Require every coefficient to vanish|Substitution into the ODE yields relations that construct the series.
ordinary-point|For y′′ + P(x)y′ + Q(x)y = 0, an ordinary point has…|P and Q analytic near that point|P and Q infinite there|No possible power series|Zero initial values only|Analytic coefficients support the ordinary power-series method locally.
`);
group('math252-14',`
laplace-purpose|What is the main benefit of Laplace transforms for linear initial-value problems?|They turn derivatives into algebraic expressions with initial data|They eliminate all initial conditions|They make every equation separable|They replace time with distance|Derivative transforms contain powers of s and initial values.
laplace-linearity|The Laplace transform of a f(t) + b g(t) is…|a F(s) + b G(s)|F(s)G(s)|F(s + a) only|Always zero|The transform is linear when the transforms exist.
`);
group('math252-15',`
inverse-laplace|Why use partial fractions in an inverse Laplace problem?|To match known transform pairs|To change the initial condition|To remove all poles without changing the function|To approximate every answer numerically|Simpler rational terms can be inverted using standard transform pairs.
laplace-initial|In the one-sided transform of y′, which initial value appears?|y(0)|y(∞) only|y′′(0) only|No initial value|The derivative rule is L{y′} = sY(s) − y(0).
`);
group('math252-16',`
step-delay|What does u(t−a) represent for a > 0?|A switch turning on at time a|A switch turning on at time −a|An exponential decay|A unit impulse at every time|The unit step is zero before a and one afterward.
delay-shift|A factor e^(−as) multiplying F(s) represents…|A delayed signal u(t−a)f(t−a)|Multiplication of f(t) by t|Differentiation of f(t) only|A frequency increase by a in every case|The exponential factor in the transform domain implements a time delay.
`);
group('math252-17',`
convolution|A product F(s)G(s) in the Laplace domain corresponds to…|Convolution in time|Ordinary multiplication in time in general|Addition in time|The quotient of the time functions|The convolution theorem converts a transform product into a time-domain convolution.
convolution-memory|Why does convolution suit a linear time-invariant system?|It combines past inputs with the impulse response|It ignores all past inputs|It requires zero output|It only works for constant inputs|Each input contribution is weighted by the system’s response at the appropriate delay.
`);
group('math252-18',`
impulse-area|An ideal unit impulse has what total area?|One|Zero|Infinite|An area equal to elapsed time|The impulse has unit integral despite being concentrated at one instant.
impulse-motion|An impulse force on an ideal mass can cause an instantaneous change in…|Velocity|Position by a finite jump|Mass|Spring stiffness|Integrating force over the impulse gives a finite momentum change; position remains continuous.
`);
group('math252-19',`
eigen-mode|An eigenvector of a constant system matrix identifies…|A direction that the matrix maps into a multiple of itself|An initial condition that must be zero|A forcing term at every time|A guaranteed unit vector|Solutions along an eigenvector evolve according to its eigenvalue.
system-stability|For a constant linear homogeneous system, all eigenvalues with negative real parts imply…|Decay toward zero|Unbounded growth for every solution|Undamped periodic motion only|No solution exists|All modes decay exponentially, possibly while oscillating.
`);
group('math252-20',`
forced-system|A nonhomogeneous linear system’s general solution is…|Homogeneous solution plus a particular solution|Only the homogeneous solution|Only the forcing vector|The product of two arbitrary solutions|Linearity lets the natural response and one forced response be combined.
fundamental-matrix|A fundamental matrix is built from…|Linearly independent homogeneous solution columns|Repeated copies of one solution|Only forcing vectors|Only initial times|Its independent columns span homogeneous solutions and support variation of parameters.
`);

group('calc-11.7 math250b-0',`
cylinder|A surface equation in x and y is independent of z. What does that suggest?|The curve extends parallel to the z-axis|The surface lies only in the xy-plane|The surface must be a sphere|There are no points with nonzero z|Any allowed x,y pair remains allowed for every z, producing a cylindrical surface.
quadric-traces|What is a trace of a surface?|Its intersection with a plane|Its total volume|Its gradient magnitude|Its average curvature|Planar slices help identify a three-dimensional surface.
`);
group('calc-12.1 math250b-0',`
partial-intro|A partial derivative measures change while…|Holding other independent variables fixed|Changing every variable at once|Holding the function value fixed|Ignoring the chosen variable|It isolates sensitivity to one input.
partial-notation|What does f_x mean for a function f(x,y)?|Partial derivative with respect to x|The x-coordinate of a maximum|The product f times x|A derivative with respect to y|The subscript identifies the variable being differentiated.
`);
group('calc-12.2 math250b-0',`
multivariable-domain|What is the domain of f(x,y)?|The allowed input pairs|Only output values|Only the x-axis|The graph’s volume|Restrictions such as nonzero denominators and real square roots define the allowed pairs.
level-curve|A level curve f(x,y) = c connects points with…|The same function value|The same x-coordinate necessarily|The same slope necessarily|Zero derivatives necessarily|Contours hold output fixed while the inputs vary.
`);
group('calc-12.3 math250b-0',`
limit-paths|Two paths approaching a point give different limits. What follows?|The multivariable limit does not exist|The limit is their average|The function must be continuous|One path must be ignored|A limit must agree along every approach within the domain.
limit-proof|Two paths give the same limit. Is that enough to prove a multivariable limit exists?|No; other approaches may differ|Yes, always|Only if both paths are straight|Only if the common value is zero|Agreement on a few paths cannot establish agreement on all approaches.
`);
group('calc-12.4 math250b-0',`
partial-constant|When differentiating f(x,y) with respect to x, treat y as…|Constant|Equal to x|Zero in every case|A derivative of x|Independent inputs are held fixed except for the differentiation variable.
mixed-partials|When can mixed second partials be interchanged by the usual theorem?|When they are continuous near the point|Whenever the function is defined|Only when the function is zero|Never|Continuity of the relevant second partials is a standard sufficient condition.
`);
group('calc-12.5 math250b-2',`
optimization-model|Before optimizing a physical quantity, what should you identify?|The objective and allowed domain|Only the largest number given|An arbitrary stationary point|A preferred answer sign|The objective states what is optimized and the domain records physical restrictions.
optimization-global|To find absolute extrema on a closed bounded region, check…|Interior candidates and the boundary|Only interior stationary points|Only the origin|Only points with positive coordinates|Absolute extrema may lie on the boundary, including corners.
`);
group('calc-12.6 math250b-1',`
linear-approx|A tangent-plane approximation is most reliable…|Near its base point|Equally far from any point|Only where derivatives do not exist|Only on the coordinate axes|It captures first-order local behaviour, with higher-order terms becoming more important farther away.
differential|The differential df approximates…|The change in f for small input changes|The exact global maximum of f|Only the original function value|The domain boundary|The first partial derivatives weight the small changes in each input.
`);
group('calc-12.7 math250b-0',`
chain-paths|If z depends on x and y, and both depend on t, dz/dt includes…|Contributions through both x and y|Only the x contribution|Only the y contribution|The product of x and y alone|Add the rate contributions along every dependency path.
chain-independent|Why draw a dependency diagram for the multivariable chain rule?|To track every route of dependence|To avoid taking any derivatives|To make variables equal|To choose a maximum automatically|Each path contributes a product of derivatives; relevant contributions are added.
`);
group('calc-12.8 math250b-1',`
gradient-steepest|A nonzero gradient points toward…|Steepest increase|Steepest decrease|A direction of zero change|Every level curve’s tangent|For a differentiable scalar function, the gradient gives steepest ascent.
directional-unit|Why normalize the direction vector in a directional derivative?|To measure change per unit distance|To force the derivative to equal one|To remove all negative components|To make it perpendicular to the gradient|Without a unit direction, the magnitude also scales the result.
`);
group('calc-12.9 math250b-2',`
lagrange|At a regular constrained extremum on g = c, the Lagrange condition makes the gradients…|Parallel|Always perpendicular|Always unit length|Both necessarily zero|At a regular constraint, the objective gradient is a scalar multiple of the constraint gradient.
constraint-check|After solving Lagrange equations, what must candidates satisfy?|The original constraint|Only a positive multiplier|Only a zero objective|An unconstrained minimum test alone|Candidates must be feasible, and their objective values must be compared; singular cases need separate attention.
`);
group('calc-12.10 math250b-2',`
saddle|A saddle point has nearby directions where the function…|Increases and decreases|Only increases|Only decreases|Must be constant|A stationary point need not be a local maximum or minimum.
second-test-zero|If the second derivative test discriminant is zero, the test is…|Inconclusive|Proof of a minimum|Proof of a maximum|Proof of a saddle|Higher-order terms or another method are needed.
`);
group('calc-13.1 math250b-3',`
double-integral|A double integral of a nonnegative height function over a region gives…|Volume under the surface over that region|Only the boundary length|Only the height at the centre|Always a signed angle|Summing height times tiny area elements gives volume.
iterated-inner|In an iterated double integral, what do you evaluate first?|The inner integral|The outer integral|Both bounds as derivatives|Only the integrand at the origin|Treat the outer variable as fixed while evaluating the inner integral.
`);
group('calc-13.2 math250b-3',`
region-bounds|When reversing integration order, what must stay the same?|The geometric region|The written bounds in the same positions|The inner variable|The appearance of every expression|Redescribe the same set using slices in the other direction.
region-split|Why might a region need to be split when setting up an integral?|Its boundary description changes between slices|All integrals require two pieces|Negative coordinates are forbidden|The integrand must always be constant|Different parts may need different upper or lower boundary functions.
`);
group('calc-13.3 math250b-3',`
area-integrand|Which integrand gives the area of a plane region D?|1|x in every region|y in every region|The perimeter of D|Integrating 1 adds the area elements themselves.
volume-between|Volume between top and bottom surfaces over a region uses…|Top height minus bottom height|Top height plus bottom height always|Only the bottom height|The ratio of heights|The vertical thickness is the difference between the surfaces.
`);
group('calc-13.4 math250b-3',`
polar-area|The polar area element is…|r dr dθ|dr dθ|r² dr dθ|sin(θ) dr dθ|The factor r accounts for the widening angular strip.
polar-use|Polar coordinates are often helpful when a region contains…|Circles or radial symmetry|Only straight lines parallel to axes|No angular boundaries ever|Only points with negative radius|Radial boundaries often become simpler in polar form.
`);
group('calc-13.5 math250b-3',`
lamina-mass|To find mass of a nonuniform lamina, integrate…|Area density over area|Area divided by density|Only its perimeter|Its height over time|Density times an area element gives a small mass contribution.
centroid-weight|A centre of mass weights position by…|Mass density|Only distance from the origin|Only surface colour|Only perimeter|Denser parts contribute more to the balance point.
`);
group('calc-13.6 math250b-4',`
triple-volume|A triple integral of 1 over a solid gives…|Its volume|Its surface area|Its boundary length|Its maximum height|Each volume element contributes directly to total volume.
triple-bounds|In an iterated triple integral, the inner limits may depend on…|The outer integration variables|The inner variable itself as a free bound|The final numerical answer only|No variables under any circumstances|Outer variables locate the slice within which the inner variable varies.
`);
group('calc-11.8 math250b-4',`
cylindrical|Cylindrical coordinates combine…|Polar coordinates in the xy-plane with height z|Two unrelated radii only|Three angles only|Cartesian x with two times|They describe radial distance, azimuthal angle, and height.
spherical-radius|In spherical coordinates, ρ measures distance from…|The origin|The z-axis only|The xy-plane only|The nearest boundary|The spherical radius is the full three-dimensional distance from the origin.
`);
group('calc-13.7 math250b-4',`
cylindrical-volume|The cylindrical volume element includes which scale factor?|r|r² sin(φ)|1/r|cos(θ)|Polar area contributes r, while height contributes dz.
spherical-volume|With φ measured from the positive z-axis, spherical volume uses…|ρ² sin(φ)|ρ|ρ² cos(φ)|1|The spherical Jacobian accounts for both angular spreading factors.
`);
group('calc-13.8 math250b-5',`
surface-area|For a parameterized surface r(u,v), the area scale factor is…|The magnitude of r_u × r_v|The dot product r_u · r_v alone|The sum u + v|The magnitude of r alone|The cross product magnitude gives the area of the tangent parallelogram.
surface-projection|Why is curved surface area generally larger than its flat projection?|Tilt increases actual area relative to projected area|Every curved surface has infinite area|The projection adds extra dimensions|Curvature makes density vanish|The surface-area factor adjusts projected patches for their local tilt.
`);
group('calc-13.9 math250b-5',`
jacobian|In change of variables for area or volume, use the Jacobian determinant’s…|Absolute value|Sign alone|Reciprocal in every case|Largest matrix entry only|The absolute determinant gives local area or volume scaling for the chosen transformation direction.
transform-bounds|When changing integration variables, what else must change besides the integrand?|The region or bounds and the measure factor|Only the integral’s name|Only its sign|Nothing else|Both the transformed region and Jacobian factor are essential.
`);
group('calc-14.1 math250b-6',`
vector-field|A vector field assigns what to each point in its domain?|A vector|Only a scalar|Only a curve length|A probability in every case|Examples include velocity, force, and electric fields.
divergence|Positive divergence locally suggests…|Net outward flow from a small region|Only rigid rotation|Zero flux through every surface|A necessarily constant field|Divergence measures local source-like behaviour or expansion.
`);
group('calc-14.2 math250b-6',`
work-integral|A line integral of F · dr measures…|Work by a force along a path|Only the path’s enclosed area|Only field magnitude at the start|Always zero|The component of force along each displacement contributes to work.
conservative|For a conservative field, the work between two points depends on…|The endpoints|Every detail of the path|The speed of travel|Only the path length|A potential difference determines the integral when the field is conservative on the region.
`);
group('math250b-7',`
stokes|Stokes’ theorem connects circulation around a boundary with…|Flux of curl through the spanning surface|Flux of the original field through any closed solid|The volume of the surface|Only the divergence at one point|Boundary orientation and surface normal must be consistent.
divergence-theorem|The divergence theorem applies to flux through…|A closed surface bounding a solid|Any open curve alone|A single point|Only a flat disk without its boundary solid|It relates outward closed-surface flux to the volume integral of divergence.
`);
group('engr290-0',`
unit-cell|A unit cell is…|A repeating building block of a crystal|One entire grain necessarily|Always one atom|An empty pore|Repeating the unit cell generates the crystal structure.
fcc-packing|Which pair is close-packed among common metal structures?|FCC and HCP|BCC and simple cubic|Simple cubic and FCC only|BCC and HCP only|FCC and HCP have close-packed arrangements; BCC is not close-packed.
`);
group('engr290-1',`
miller-parallel|A crystal plane parallel to an axis has which Miller index for that axis?|Zero|One in every case|Infinity|A negative sign in every case|A parallel plane has an infinite intercept; its reciprocal is zero.
direction-plane|Square brackets [uvw] normally label a crystal…|Direction|Plane|Temperature|Vacancy fraction|Directions use square brackets; individual planes use parentheses (hkl).
`);
group('engr290-2',`
ionic-bond|Ionic bonding primarily involves…|Electrostatic attraction between oppositely charged ions|A sea of electrons with no ions|Only temporary molecular dipoles|No electron redistribution|Electron transfer can create ions whose opposite charges attract.
vacancy-temperature|At equilibrium, raising temperature generally makes the vacancy concentration…|Increase|Decrease to zero|Stay exactly constant|Equal the atomic mass|Thermal energy makes vacancy formation more likely.
`);
group('engr290-3',`
strengthen|Many strengthening methods work by hindering…|Dislocation motion|All atomic vibrations|Every elastic strain|Electrical charge conservation|Dislocations enable plastic slip; obstacles raise the stress needed for motion.
grain-size|In the usual Hall–Petch regime, smaller grains tend to…|Increase yield strength|Eliminate all grain boundaries|Make every metal liquid|Remove all dislocations automatically|More grain boundaries impede dislocation motion; the relation has limits outside its usual regime.
`);
group('engr290-4',`
diffusion-gradient|Fick’s first law predicts net diffusion down a…|Concentration gradient|Mass gradient only|Voltage gradient in every material|Time axis|The flux is directed from higher to lower concentration under the simple Fickian model.
diffusion-temperature|Increasing temperature usually changes atomic diffusivity how?|It increases|It becomes exactly zero|It stays constant|It must become negative|Thermally activated jumps become more frequent as temperature rises.
`);
// Later circuits chapter mapping follows Alexander/Sadiku's publisher contents;
// it is supplemental conceptual review, not a claim to reproduce instructor notes.
group('ecet-ch1 ecet250e-0',`
current-definition|Electric current is the rate of flow of…|Charge|Voltage|Resistance|Energy per charge|Current is charge transferred per unit time.
passive-sign|Under the passive sign convention, positive absorbed power means current enters…|The positive voltage terminal|The negative voltage terminal|Both terminals at once|No terminal|With current entering the positive reference terminal, p = vi is absorbed power.
`);
group('ecet-ch2 ecet250e-1',`
parallel-voltage|Resistors in parallel share the same…|Voltage|Current necessarily|Resistance necessarily|Power necessarily|Each branch connects to the same pair of nodes.
kvl|Kirchhoff’s voltage law says the algebraic sum of voltages around a circuit loop is…|Zero|Always positive|Equal to the largest resistor|Equal to total current|Voltage rises and drops balance in the lumped-circuit model.
`);
group('ecet-ch3 ecet250e-2',`
nodal-reference|In nodal analysis, node voltages are measured relative to…|A chosen reference node|Always the largest resistor|The nearest current source only|An arbitrary separate zero for every node|Choosing a common reference makes voltage differences consistent.
mesh-law|Mesh-current equations mainly use…|Kirchhoff’s voltage law|Only conservation of mass|Only capacitor charge|The magnetic force law|Mesh analysis writes loop voltage balances for planar circuits.
`);
group('ecet-ch4',`
superposition-circuits|When using superposition in a linear circuit, an independent ideal voltage source set to zero becomes…|A short circuit|An open circuit|A current source of infinite value|A capacitor|Zero voltage means its terminals are at the same potential; dependent sources remain active.
thevenin|A Thévenin equivalent consists of…|A voltage source in series with a resistance|A current source in series with a capacitor|Only a wire|Two arbitrary ideal sources in parallel|It reproduces the terminal voltage–current relation of a linear resistive network.
`);
group('ecet-ch5',`
opamp-current|For an ideal op-amp, input-terminal currents are…|Zero|Infinite|Always equal to output current|Set by the supply voltage alone|Infinite ideal input resistance means no input current flows.
opamp-feedback|The approximation v+ = v− is appropriate for an ideal op-amp when…|Negative feedback keeps it in linear operation|It is saturated at a supply rail|It has positive feedback in every case|Its output is disconnected in every case|The virtual-short condition depends on negative feedback and unsaturated operation.
`);
group('ecet-ch6',`
capacitor-storage|An ideal capacitor stores energy in its…|Electric field|Magnetic field only|Resistance|Mass flow|Charge separation establishes an electric field between its conductors.
inductor-storage|An ideal inductor stores energy in its…|Magnetic field|Resistance|Electric charge on disconnected plates only|Chemical fuel|Its current creates the magnetic field associated with stored energy.
`);
group('ecet-ch7',`
first-order-response|The natural response of a stable first-order RC or RL circuit is typically…|Exponential decay|A growing straight line forever|An undamped sine wave|An instantaneous loss of all stored energy|A single energy-storage mode relaxes with a characteristic time constant.
time-constant|A larger time constant means the transient response is…|Slower|Faster|Always oscillatory|Immediately complete|More time is needed to cover the same fraction of the change.
`);
group('ecet-ch8',`
second-order-storage|A basic second-order RLC circuit has two independent kinds of energy storage in…|Capacitance and inductance|Two ideal resistors only|Two ideal wires only|Ground and a switch only|Capacitors and inductors exchange stored energy while resistance dissipates it.
underdamped|An underdamped stable RLC natural response…|Oscillates with a decaying amplitude|Grows forever|Never changes sign under any initial condition|Is always a constant|Complex roots with negative real parts produce damped oscillation.
`);
group('ecet-ch9',`
phasor|A phasor represents the magnitude and phase of a sinusoid at…|A specified common frequency|Every possible frequency simultaneously|Zero frequency only|A different frequency at every instant|Phasor analysis suppresses the common sinusoidal time factor.
inductor-phase|For an ideal inductor in sinusoidal steady state, voltage…|Leads current by 90°|Lags current by 90°|Is always in phase with current|Has twice the current’s frequency|The inductor relation v = L di/dt gives a quarter-cycle voltage lead.
`);
group('ecet-ch10',`
ac-impedance|In sinusoidal steady-state circuit analysis, resistance generalizes to…|Complex impedance|Only DC voltage|Only current amplitude|An integer phase index|Impedance combines resistance and reactance at the chosen frequency.
ac-laws|Which familiar laws still apply to phasor circuit equations?|Kirchhoff’s current and voltage laws|Only Ohm’s law for DC resistors|Only mechanical force balance|No conservation laws|KCL and KVL hold using complex phasor voltages and currents.
`);
group('ecet-ch11',`
rms-purpose|RMS current is useful because it gives the same resistor heating as…|An equal-valued DC current|The peak current in every waveform|Zero current|A current at double frequency|Average resistor power depends on the square of RMS current.
power-factor|For a purely resistive sinusoidal load, power factor is…|One|Zero|Negative one always|Infinite|Voltage and current are in phase, so all apparent power corresponds to real power.
`);
group('ecet-ch12',`
three-phase|Balanced three-phase sinusoidal voltages are separated by…|120°|90°|180°|360°|Three equal phase spacings divide one full cycle.
neutral-balanced|In a balanced three-phase wye load with sinusoidal currents, neutral current is…|Zero|Three times one phase current|Always equal to line current|Infinite|The three balanced phase currents sum to zero at every instant.
`);
group('ecet-ch13',`
mutual-induction|Mutual inductance describes voltage induced in one coil by…|Changing current in another coil|A constant resistance in empty space|The coil’s mass alone|A static temperature difference|Changing current changes linked magnetic flux, inducing emf in the other coil.
transformer-dc|Why can an ideal transformer not provide sustained transformer action from steady DC?|Steady current does not create changing magnetic flux|DC has no voltage|Its turns disappear|Magnetic fields cannot exist with DC|Transformer action requires changing flux; steady DC is not its normal operating mode.
`);
module.exports=groups;
