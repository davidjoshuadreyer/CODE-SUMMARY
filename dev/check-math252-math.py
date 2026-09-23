"""Independent symbolic checks for Math 252 lesson results. Requires SymPy."""
import sympy as s
x=s.symbols('x', real=True); t=s.symbols('t', nonnegative=True); z=s.symbols('s', positive=True)
count=0
def zero(expr,label):
 global count
 assert s.simplify(s.trigsimp(expr))==0,(label,s.simplify(expr));count+=1
def ode(y,a,b,c,rhs,label,conditions=()):
 zero(a*s.diff(y,x,2)+b*s.diff(y,x)+c*y-rhs,label)
 for order,at,value in conditions:zero(s.diff(y,x,order).subs(x,at)-value,label+' initial')
def transform(f,F,label):
 zero(s.laplace_transform(f,t,z,noconds=True)-F,label)
# First-order equations and verification.
ode(3*s.exp(-2*x),0,1,2,0,'01 example',[(0,0,3)])
ode(3*x*x+2,0,1,0,6*x,'01 practice',[(0,1,5)])
y=3*s.exp(x*x);zero(s.diff(y,x)-2*x*y,'02 example');zero(y.subs(x,0)-3,'02 initial')
y=2/(1+2*x);zero(s.diff(y,x)+y*y,'02 practice');zero(y.subs(x,0)-2,'02 practice initial')
ode(3-2*s.exp(-2*x),0,1,2,6,'03 example',[(0,0,1)])
ode(x*x/3+5/(3*x),0,x,1,x*x,'03 practice',[(0,1,2)])
y=s.symbols('y');F=x*x*y+3*x+2*y*y
zero(s.diff(F,x)-(2*x*y+3),'04 Fx');zero(s.diff(F,y)-(x*x+4*y),'04 Fy');zero(F.subs({x:0,y:1})-2,'04 initial')
F=x*x+x*y+y*y;zero(s.diff(F,x)-(2*x+y),'04 practice Fx');zero(s.diff(F,y)-(x+2*y),'04 practice Fy');zero(F.subs({x:1,y:0})-1,'04 practice initial')
ode(x*s.log(x),0,1,-1/x,1,'05 ratio',[(0,1,0)])
y=1/(1+s.exp(x));zero(s.diff(y,x)+y-y*y,'05 Bernoulli');zero(y.subs(x,0)-s.Rational(1,2),'05 Bernoulli initial')
y=s.tan(x)-x;zero(s.diff(y,x)-(x+y)**2,'05 practice');zero(y.subs(x,0),'05 practice initial')
ode(200*(1-s.exp(-x/20)),0,1,s.Rational(1,20),10,'06 tank',[(0,0,0)])
y=200*s.exp(s.log(2)*x/3);zero(y.subs(x,3)-400,'06 growth')
y=20+60*s.exp(-s.log(2)*x/10);zero(y.subs(x,10)-50,'06 cooling measurement');zero(y.subs(x,20)-35,'06 cooling answer')
# Homogeneous, forced, and physical second-order equations.
ode(s.exp(x),1,-2,1,0,'07 known');ode(x*s.exp(x),1,-2,1,0,'07 second')
ode(2+3*x,1,0,0,0,'07 practice',[(0,0,2),(1,0,3)])
ode(2*s.exp(x)-s.exp(2*x),1,-3,2,0,'08 distinct',[(0,0,1),(1,0,0)])
for y in [s.exp(-2*x),x*s.exp(-2*x)]:ode(y,1,4,4,0,'08 repeated')
ode(3*s.sin(2*x),1,0,4,0,'08 practice',[(0,0,0),(1,0,6)])
ode(s.exp(2*x)/3,1,0,-1,s.exp(2*x),'09 particular');ode(x*s.exp(x)/2,1,0,-1,s.exp(x),'09 resonance')
for y in [s.cos(x),s.sin(x)]:ode(y,1,0,1,0,'09 complementary')
ode(s.Integer(2),1,0,1,2,'09 practice particular')
ode(s.cos(x)*s.log(s.cos(x))+x*s.sin(x),1,0,1,1/s.cos(x),'10 example')
ode(x**3/6,1,0,0,x,'10 practice')
ode(2*x+x*x,x*x,-2*x,2,0,'11 example',[(0,1,3),(1,1,4)])
for y in [s.Integer(1),s.log(x)]:ode(y,x*x,x,0,0,'11 practice')
ode(s.cos(3*x)/10,1,0,9,0,'12 spring',[(0,0,s.Rational(1,10)),(1,0,0)])
ode((1+2*x)*s.exp(-2*x),1,4,4,0,'12 damping',[(0,0,1),(1,0,0)])
ode(s.sin(2*x),1,0,4,0,'12 circuit',[(0,0,0),(1,0,2)])
# Series coefficient identities and residual order.
a=s.symbols('a0:6');poly=sum(a[n]*x**n for n in range(6));zero(s.diff(poly,x)-sum((n+1)*a[n+1]*x**n for n in range(5)),'13 reindex')
zero(s.series(1/(1-x/2),x,0,4).removeO()-(1+x/2+x*x/4+x**3/8),'13 geometric')
co=[s.Integer(1),s.Integer(0)]
for n in range(10):co.append(-co[n]/((n+2)*(n+1)))
zero(sum(co[n]*x**n for n in range(12))-s.series(s.cos(x),x,0,12).removeO(),'14 cosine recurrence')
co=[s.Integer(1),s.Integer(0),s.Integer(0)]
for n in range(1,8):co.append(-co[n-1]/((n+2)*(n+1)))
zero(sum(co[n]*x**n for n in range(7))-(1-x**3/6+x**6/180),'14 practice coefficients')
assert co[7]==0 and co[8]==0 and co[9]!=0;count+=1
# Laplace pairs and IVPs.
transform(s.exp(2*t),1/(z-2),'15 definition');transform(3*t*t-4*s.sin(2*t),6/z**3-8/(z*z+4),'15 practice')
y=(1-s.exp(-2*x))/2;ode(y,0,1,2,1,'16 example',[(0,0,0)])
transform((1-s.exp(-2*t))/2,1/(z*(z+2)),'16 partial fractions')
ode(2*s.cos(x)+3*s.sin(x),1,0,1,0,'16 practice',[(0,0,2),(1,0,3)])
transform(s.Heaviside(t-2)*(1-s.exp(-(t-2))),s.exp(-2*z)/(z*(z+1)),'17 example')
transform(s.Heaviside(t-3)*s.sin(2*(t-3))/2,s.exp(-3*z)/(z*z+4),'17 practice')
transform(t*s.Heaviside(t-2),s.exp(-2*z)*(1/z**2+2/z),'17 shifted t')
u=s.symbols('u');zero(s.integrate(s.exp(-(t-u)),(u,0,t))-(1-s.exp(-t)),'18 convolution')
transform(t*s.sin(2*t),4*z/(z*z+4)**2,'18 practice')
transform(s.Heaviside(t-s.pi)*s.sin(t-s.pi),s.exp(-s.pi*z)/(z*z+1),'19 example')
zero(s.diff(s.sin(x-s.pi),x).subs(x,s.pi)-1,'19 velocity jump')
transform(3*s.Heaviside(t-1)*s.exp(-2*(t-1)),3*s.exp(-z)/(z+2),'19 practice')
zero((3*s.exp(-2*(x-1))).subs(x,1)-3,'19 value jump')
# System solutions, modes and initial vectors.
def system(v,A,b,label,initial=None):
 for q in v.diff(x)-A*v-b:zero(q,label)
 if initial is not None:
  for q in v.subs(x,0)-s.Matrix(initial):zero(q,label+' initial')
system(s.Matrix([s.exp(3*x)+s.exp(x),s.exp(3*x)-s.exp(x)]),s.Matrix([[2,1],[1,2]]),s.zeros(2,1),'20 modes',[2,0])
A=s.Matrix([[1,1],[0,1]])
for v in [s.Matrix([s.exp(x),0]),s.Matrix([x*s.exp(x),s.exp(x)])]:system(v,A,s.zeros(2,1),'20 repeated mode')
system(s.Matrix([s.cos(x),s.sin(x)]),s.Matrix([[0,-1],[1,0]]),s.zeros(2,1),'20 rotation',[1,0])
system(s.Matrix([s.exp(x)-1,(x-1)*s.exp(x)+1]),s.Matrix([[1,0],[1,1]]),s.Matrix([1,0]),'21 forced',[0,0])
system(s.Matrix([1-s.exp(-x),1-s.exp(-2*x)]),s.diag(-1,-2),s.Matrix([1,2]),'21 practice',[0,0])
print(f'PASS: {count} symbolic equation, initial-condition, transform, and recurrence checks.')
