window.SETUP_QUESTIONS = [
  {
    "id": "a1",
    "equation": "y'=\\frac{xy^4}{3\\sqrt{1+x^2}},\\quad y(0)=1",
    "options": [
      "Separate: \\;y^{-4}\\,dy=\\frac{x}{3\\sqrt{1+x^2}}\\,dx",
      "Linear: \\;P(x)=y^4",
      "Exact: \\;y(0)=1\\text{ proves exactness}"
    ],
    "why": "The right side is a function of x times a function of y. Move y⁴ across before integrating. The initial condition determines the constant afterwards; it does not choose the method.",
    "topic": "Separable",
    "source": "Assignment 1 · Question 1",
    "url": "pdfs/assignment-1.pdf#page=1",
    "notes": "pdfs/section-2-2-separable-equations.pdf#page=2",
    "homework": true
  },
  {
    "id": "a2",
    "equation": "x^2y'+3xy=e^{2x}",
    "options": [
      "Linear: \\;y\\prime+\\frac3x y=\\frac{e^{2x}}{x^2}",
      "Separate: \\;\\frac{dy}{y}=\\frac{e^{2x}}{x^2-3x}\\,dx",
      "Bernoulli: \\;u=y^{-1}"
    ],
    "why": "Divide every term by x² first (x ≠ 0). Only the first power of y remains, with coefficients depending on x. Then use an integrating factor x³.",
    "topic": "Linear",
    "source": "Assignment 1 · Question 2",
    "url": "pdfs/assignment-1.pdf#page=1",
    "notes": "pdfs/section-2-3-linear-equations.pdf#page=1",
    "homework": true
  },
  {
    "id": "a3",
    "equation": "(3x^2y^2+e^{2y}+4x^3)\\,dx+(2x^3y+3\\cos(3y)+2xe^{2y})\\,dy=0",
    "options": [
      "Exact: \\;M_y=N_x=6x^2y+2e^{2y}",
      "Linear: \\;P(x)=3x^2y^2",
      "Homogeneous: \\;y=vx\\text{ since all terms have equal degree}"
    ],
    "why": "The dx + dy form suggests checking exactness, but does not guarantee it. Here the cross-partials match. Reconstruct F by integrating M in x, adding g(y), and matching F_y to N.",
    "topic": "Exact",
    "source": "Assignment 1 · Question 3",
    "url": "pdfs/assignment-1.pdf#page=1",
    "notes": "pdfs/section-2-4-exact-equations.pdf#page=3",
    "homework": true
  },
  {
    "id": "a4",
    "equation": "y'=\\frac{xy+y^2}{x^2}",
    "options": [
      "Homogeneous: \\;y=vx,\\quad y\\prime=v+xv\\prime",
      "Linear: \\;y\\prime-\\frac1x y=\\frac{y^2}{x^2}\\text{ is already linear}",
      "Separate: \\;\\frac{dy}{y+y^2}=\\frac{dx}{x}"
    ],
    "why": "Rewrite as y/x + (y/x)²: it depends only on y/x. Substitution gives xv′=v². A Bernoulli substitution would also work, but the displayed “linear” option is wrong because its right side still depends on y.",
    "topic": "Homogeneous",
    "source": "Assignment 1 · Question 4",
    "url": "pdfs/assignment-1.pdf#page=1",
    "notes": "pdfs/section-2-5-solutions-by-substitutions.pdf#page=4",
    "homework": true
  },
  {
    "id": "a5",
    "equation": "xy'+2y=x^3y^2\\sin x",
    "options": [
      "Bernoulli: \\;y\\prime+\\frac2x y=x^2y^2\\sin x,\\quad u=y^{-1}",
      "Linear: \\;P(x)=2,\\quad\\mu=e^{2x}",
      "Homogeneous: \\;y=vx\\text{ makes the right side depend only on }v"
    ],
    "why": "After division by x, the pattern is y′+P(x)y=f(x)yⁿ with n=2. Use u=y^(1−n)=1/y. Its derivative is −y′/y². Retain y=0 separately.",
    "topic": "Bernoulli",
    "source": "Assignment 1 · Question 5",
    "url": "pdfs/assignment-1.pdf#page=1",
    "notes": "pdfs/section-2-5-solutions-by-substitutions.pdf#page=11",
    "homework": true
  },
  {
    "id": "a6",
    "equation": "y'=(1+x+y)^2,\\quad y(0)=0",
    "options": [
      "Combination substitution: \\;u=1+x+y,\\quad u\\prime=1+u^2",
      "Substitute: \\;u=1+x+y,\\quad u\\prime=u^2",
      "Linear: \\;P(x)=1+x"
    ],
    "why": "The whole combination 1+x+y repeats. Differentiate it carefully: u′=1+y′, not y′. This gives du/(1+u²)=dx, with u(0)=1.",
    "topic": "Combination substitution",
    "source": "Assignment 1 · Question 6",
    "url": "pdfs/assignment-1.pdf#page=1",
    "notes": "pdfs/section-2-5-solutions-by-substitutions.pdf#page=18",
    "homework": true
  },
  {
    "id": "a7",
    "equation": "\\text{Light intensity }I:\\ I(0)=I_0,\\ I(5)=0.5I_0.\\quad\\text{Rate with depth is proportional to }I.",
    "options": [
      "Exponential decay: \\;\\frac{dI}{dy}=kI,\\quad k<0",
      "Constant loss: \\;\\frac{dI}{dy}=k",
      "Quadratic loss: \\;\\frac{dI}{dy}=kI^2"
    ],
    "why": "“Proportional to I” means kI. Depth y is the independent variable. Falling intensity makes k negative. Integrate to I=I₀e^(ky), then use the 5 m measurement.",
    "topic": "Exponential model",
    "source": "Assignment 1 · Question 7",
    "url": "pdfs/assignment-1.pdf#page=1",
    "notes": "pdfs/section-3-1-linear-models.pdf#page=1",
    "homework": true
  },
  {
    "id": "a8",
    "equation": "\\text{2000 L, initially salt-free. In: 15 g/L at 40 L/min. Out: 40 L/min.}",
    "options": [
      "\\text{Mixing: }m\\prime=600-\\frac{m}{50},\\quad m(0)=0\\;\\text{(grams)}",
      "m\\prime=15-40m,\\quad m(0)=2000",
      "m\\prime=600-\\frac{40m}{2000+40t}"
    ],
    "why": "Salt in is concentration × flow = 600 g/min. Salt out is (m/2000)×40=m/50 g/min. Equal flows keep the volume at 2000 L.",
    "topic": "Mixing model",
    "source": "Assignment 1 · Question 8",
    "url": "pdfs/assignment-1.pdf#page=1",
    "notes": "pdfs/section-3-1-linear-models.pdf#page=12",
    "homework": true
  },
  {
    "id": "s1",
    "equation": "y'=\\frac{x^2}{1-2y}",
    "options": [
      "Separate: \\;(1-2y)\\,dy=x^2\\,dx",
      "Linear: \\;P(x)=1-2y",
      "Separate: \\;\\frac{dy}{1-2y}=x^2\\,dx"
    ],
    "why": "The denominator contains only y, so multiply it across. You do not divide by it a second time.",
    "topic": "Separable",
    "source": "Notes §2.2 · Example 1",
    "url": "pdfs/section-2-2-separable-equations.pdf#page=3",
    "notes": "pdfs/section-2-2-separable-equations.pdf#page=3",
    "homework": false
  },
  {
    "id": "s2",
    "equation": "y'=\\frac{2x+8e^{2x}}{6y^2+1},\\quad y(0)=1",
    "options": [
      "Separate: \\;(6y^2+1)\\,dy=(2x+8e^{2x})\\,dx",
      "Bernoulli: \\;u=y^{-1}\\text{ because }y^2\\text{ occurs}",
      "Linear: \\;P(x)=6y^2+1"
    ],
    "why": "A y² anywhere does not automatically mean Bernoulli. Here the entire denominator is y-only and the numerator is x-only.",
    "topic": "Separable",
    "source": "Notes §2.2 · Example 2",
    "url": "pdfs/section-2-2-separable-equations.pdf#page=4",
    "notes": "pdfs/section-2-2-separable-equations.pdf#page=4",
    "homework": false
  },
  {
    "id": "s3",
    "equation": "y'=\\frac{x(1+y^2)}{e^x}",
    "options": [
      "Separate: \\;\\frac{dy}{1+y^2}=xe^{-x}\\,dx",
      "Homogeneous: \\;y=vx\\text{ since }y^2\\text{ appears}",
      "Linear: \\;y\\prime-xe^{-x}y=xe^{-x}"
    ],
    "why": "Factor the right side as xe^(−x) times (1+y²). The integral in y is arctan(y); no substitution is needed to recognize the setup.",
    "topic": "Separable",
    "source": "Notes §2.2 · Example 3",
    "url": "pdfs/section-2-2-separable-equations.pdf#page=5",
    "notes": "pdfs/section-2-2-separable-equations.pdf#page=5",
    "homework": false
  },
  {
    "id": "s4",
    "equation": "\\frac{dP}{dt}=P^2-4P,\\quad P(0)=1",
    "options": [
      "Separate: \\;\\frac{dP}{P(P-4)}=dt",
      "Linear: \\;P\\prime-4P=P^2\\text{ is linear}",
      "Separate: \\;\\frac{dP}{P^2}-\\frac{dP}{4P}=dt"
    ],
    "why": "Factor P²−4P, then divide by that entire expression. You cannot split a reciprocal of a difference into two reciprocals. Partial fractions comes after separation. Bernoulli is another valid method.",
    "topic": "Separable",
    "source": "Notes §2.2 · Example 5",
    "url": "pdfs/section-2-2-separable-equations.pdf#page=7",
    "notes": "pdfs/section-2-2-separable-equations.pdf#page=7",
    "homework": false
  },
  {
    "id": "l1",
    "equation": "2y'+4y=5",
    "options": [
      "Linear: \\;y\\prime+2y=\\frac52,\\quad\\mu=e^{2x}",
      "Linear: \\;y\\prime+4y=5,\\quad\\mu=e^{4x}",
      "Bernoulli: \\;u=y^{-1}\\text{ is required}"
    ],
    "why": "Divide all terms by 2 before reading P(x). This equation is also separable; the correct option follows the integrating-factor method used in these notes.",
    "topic": "Linear",
    "source": "Notes §2.3 · Example 1",
    "url": "pdfs/section-2-3-linear-equations.pdf#page=4",
    "notes": "pdfs/section-2-3-linear-equations.pdf#page=4",
    "homework": false
  },
  {
    "id": "l2",
    "equation": "x^3y'+4x^2y=e^x,\\quad y(1)=2",
    "options": [
      "Linear: \\;y\\prime+\\frac4x y=\\frac{e^x}{x^3},\\quad\\mu=x^4",
      "Linear: \\;P(x)=4x^2,\\quad\\mu=e^{4x^3/3}",
      "Bernoulli: \\;u=y^{-3}"
    ],
    "why": "The coefficient of y′ must become 1 first. Divide by x³, giving P(x)=4/x. The interval for this IVP must contain x=1 and exclude x=0.",
    "topic": "Linear",
    "source": "Notes §2.3 · Example 2",
    "url": "pdfs/section-2-3-linear-equations.pdf#page=7",
    "notes": "pdfs/section-2-3-linear-equations.pdf#page=7",
    "homework": false
  },
  {
    "id": "l3",
    "equation": "\\frac{dx}{dt}+2x=4t,\\quad x(0)=5",
    "options": [
      "\\text{Linear in }x(t):\\quad\\mu=e^{2t}",
      "Separate: \\;\\frac{dx}{x}=2t\\,dt",
      "Homogeneous substitution: \\;x=vt\\text{ is required}"
    ],
    "why": "The names of the variables do not change the method. Here x is the dependent variable and t is independent. The coefficient of x is 2.",
    "topic": "Linear",
    "source": "Notes §2.3 · Example 3",
    "url": "pdfs/section-2-3-linear-equations.pdf#page=11",
    "notes": "pdfs/section-2-3-linear-equations.pdf#page=11",
    "homework": false
  },
  {
    "id": "e1",
    "equation": "(2xy+3x^2)\\,dx+(x^2-1)\\,dy=0",
    "options": [
      "Exact check: \\;M_y=2x=N_x",
      "Exact check: \\;M_x=N_y\\text{ is the required test}",
      "Exact: \\;\\text{every }M\\,dx+N\\,dy=0\\text{ equation is exact}"
    ],
    "why": "Differentiate the dx coefficient with respect to y and the dy coefficient with respect to x. The matching cross-partials establish exactness.",
    "topic": "Exact",
    "source": "Notes §2.4 · Example 2",
    "url": "pdfs/section-2-4-exact-equations.pdf#page=6",
    "notes": "pdfs/section-2-4-exact-equations.pdf#page=6",
    "homework": false
  },
  {
    "id": "e2",
    "equation": "y'=\\frac{2x-e^y}{xe^y+2y},\\quad y(2)=0",
    "options": [
      "Exact setup: \\;(e^y-2x)\\,dx+(xe^y+2y)\\,dy=0",
      "Separate: \\;(xe^y+2y)\\,dy=(2x-e^y)\\,dx\\text{ is already separated}",
      "Linear: \\;P(x)=xe^y+2y"
    ],
    "why": "Both sides still mix x and y, so this is not separated. Move everything to one side: M_y=e^y=N_x. An exact equation can be hidden in y′ form.",
    "topic": "Exact",
    "source": "Notes §2.4 · Example 4",
    "url": "pdfs/section-2-4-exact-equations.pdf#page=10",
    "notes": "pdfs/section-2-4-exact-equations.pdf#page=10",
    "homework": false
  },
  {
    "id": "h1",
    "equation": "y'=\\frac{x+y}{x-y}",
    "options": [
      "Homogeneous: \\;y=vx,\\quad v+xv\\prime=\\frac{1+v}{1-v}",
      "Separate: \\;\\frac{dy}{y}=\\frac{1+x}{x-1}\\,dx",
      "Linear: \\;P(x)=\\frac1{x-y}"
    ],
    "why": "Divide numerator and denominator by x to see (1+y/x)/(1−y/x). Then use the product rule for y=vx.",
    "topic": "Homogeneous",
    "source": "Notes §2.5 · Example 2",
    "url": "pdfs/section-2-5-solutions-by-substitutions.pdf#page=5",
    "notes": "pdfs/section-2-5-solutions-by-substitutions.pdf#page=5",
    "homework": false
  },
  {
    "id": "h2",
    "equation": "xy^2y'=y^3-x^3,\\quad y(1)=2",
    "options": [
      "Homogeneous: \\;y\\prime=\\frac{(y/x)^3-1}{(y/x)^2},\\quad y=vx",
      "Linear: \\;P(x)=y^2",
      "Separate: \\;y^2\\,dy=(y^3-x^3)\\,dx"
    ],
    "why": "Divide by xy². The numerator and denominator both have total degree 3, so their ratio is a function of y/x.",
    "topic": "Homogeneous",
    "source": "Notes §2.5 · Example 3",
    "url": "pdfs/section-2-5-solutions-by-substitutions.pdf#page=7",
    "notes": "pdfs/section-2-5-solutions-by-substitutions.pdf#page=7",
    "homework": false
  },
  {
    "id": "b1",
    "equation": "y'+y=e^xy^4",
    "options": [
      "Bernoulli: \\;n=4,\\quad u=y^{-3}",
      "Bernoulli: \\;n=4,\\quad u=y^4",
      "Linear: \\;P(x)=1\\text{ makes the original equation linear}"
    ],
    "why": "The right side has y⁴. Bernoulli uses the power 1−n, not n. The substitution transforms it to u′−3u=−3e^x.",
    "topic": "Bernoulli",
    "source": "Notes §2.5 · Example 4",
    "url": "pdfs/section-2-5-solutions-by-substitutions.pdf#page=12",
    "notes": "pdfs/section-2-5-solutions-by-substitutions.pdf#page=12",
    "homework": false
  },
  {
    "id": "b2",
    "equation": "xy'=y(1+xy^3)",
    "options": [
      "Bernoulli: \\;y\\prime-\\frac1x y=y^4,\\quad u=y^{-3}",
      "Bernoulli: \\;n=3,\\quad u=y^{-2}",
      "Homogeneous: \\;y=vx\\text{ because the right side has }xy"
    ],
    "why": "Expand before identifying the power: y(1+xy³)=y+xy⁴. Dividing by x exposes n=4.",
    "topic": "Bernoulli",
    "source": "Notes §2.5 · Example 5",
    "url": "pdfs/section-2-5-solutions-by-substitutions.pdf#page=14",
    "notes": "pdfs/section-2-5-solutions-by-substitutions.pdf#page=14",
    "homework": false
  },
  {
    "id": "c1",
    "equation": "y'=\\frac{1-x-y}{x+y}",
    "options": [
      "Combination substitution: \\;u=x+y,\\quad u\\prime=1+\\frac{1-u}{u}",
      "Combination substitution: \\;u=x+y,\\quad u\\prime=\\frac{1-u}{u}",
      "Separate: \\;(x+y)\\,dy=(1-x-y)\\,dx\\text{ is separated}"
    ],
    "why": "The repeated sum x+y is the clue. Since u′=1+y′, substitution simplifies to u′=1/u.",
    "topic": "Combination substitution",
    "source": "Notes §2.5 · Example 7",
    "url": "pdfs/section-2-5-solutions-by-substitutions.pdf#page=18",
    "notes": "pdfs/section-2-5-solutions-by-substitutions.pdf#page=18",
    "homework": false
  },
  {
    "id": "c2",
    "equation": "y'=(x+y)^2,\\quad y(0)=1",
    "options": [
      "Combination substitution: \\;u=x+y,\\quad u\\prime=1+u^2,\\quad u(0)=1",
      "Combination substitution: \\;u=x+y,\\quad u\\prime=u^2,\\quad u(0)=1",
      "Bernoulli: \\;n=2\\text{ simply because there is a square}"
    ],
    "why": "A square of x+y is not the Bernoulli pattern y′+P(x)y=f(x)yⁿ. Replace the entire repeated combination and remember d(x)/dx=1.",
    "topic": "Combination substitution",
    "source": "Notes §2.5 · Example 8",
    "url": "pdfs/section-2-5-solutions-by-substitutions.pdf#page=20",
    "notes": "pdfs/section-2-5-solutions-by-substitutions.pdf#page=20",
    "homework": false
  },
  {
    "id": "m1",
    "equation": "\\text{Soup: }T(0)=100^\\circ\\mathrm C,\\ T(5)=70^\\circ\\mathrm C,\\ T_E=20^\\circ\\mathrm C.",
    "options": [
      "\\text{Cooling: }T\\prime=-k(T-20),\\quad k>0",
      "T\\prime=-kT,\\quad k>0",
      "T\\prime=-k(T+20),\\quad k>0"
    ],
    "why": "Newton’s law uses the temperature difference from the surroundings. Cooling stops at 20 °C, so the derivative must vanish there. This is linear and also separable.",
    "topic": "Cooling model",
    "source": "Notes §3.1 · Example 2",
    "url": "pdfs/section-3-1-linear-models.pdf#page=6",
    "notes": "pdfs/section-3-1-linear-models.pdf#page=6",
    "homework": false
  },
  {
    "id": "m2",
    "equation": "\\text{200 L with 50 g salt. In: 5 g/L at 3 L/min. Out: 3 L/min.}",
    "options": [
      "\\text{Mixing: }m\\prime=15-\\frac{3m}{200},\\quad m(0)=50",
      "m\\prime=5-3m,\\quad m(0)=200",
      "m\\prime=15-\\frac{3m}{200+3t},\\quad m(0)=50"
    ],
    "why": "The amount m is in grams. Incoming salt is 5×3=15 g/min. Outgoing concentration is m/200 g/L. Both flows are equal, so volume is constant.",
    "topic": "Mixing model",
    "source": "Notes §3.1 · Example 3",
    "url": "pdfs/section-3-1-linear-models.pdf#page=12",
    "notes": "pdfs/section-3-1-linear-models.pdf#page=12",
    "homework": false
  },
  {
    "id": "m3",
    "equation": "\\text{100 L with 50 g salt. In: 5 g/L at 2 L/min. Out: 4 L/min.}",
    "options": [
      "\\text{Mixing: }V=100-2t,\\quad m\\prime=10-\\frac{4m}{100-2t}",
      "V=100,\\quad m\\prime=10-\\frac{4m}{100}",
      "V=100+2t,\\quad m\\prime=10-\\frac{4m}{100+2t}"
    ],
    "why": "Compute volume separately: V′=2−4=−2 L/min. Use the changing volume in the outgoing concentration. The tank model applies before it empties, 0≤t<50 min.",
    "topic": "Mixing model",
    "source": "Notes §3.1 · Example 4",
    "url": "pdfs/section-3-1-linear-models.pdf#page=17",
    "notes": "pdfs/section-3-1-linear-models.pdf#page=17",
    "homework": false
  }
];
