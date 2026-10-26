"""Check published phasor results against the original circuit equations."""
import cmath, math
p=lambda r,d: cmath.rect(r,math.radians(d))
def near(a,b,tol=2e-5):
    assert abs(a-b)<tol,(a,b)
near((6.736420+1.532103j)**2,p(40,50)+p(20,-30))
near((-0.531241-0.191949j)*(2+4j)*(3+5j),p(10,-30)+3-4j)
near(p(5,126.869898),-3+4j)
near(p(8,70),8j*p(1,-20))
near((4+8/(2j)-3*2j)*p(4.642383,143.198591),p(50,75))
near(6j*p(2,-45),p(12,45))
I=p(1.788854,26.565051);V=p(4.472136,-63.434949)
near(5*I+V,10);near(.4j*V,I)
Z=3.221622-11.070270j
near(1/(Z+10j),1/(3-2j)+1/(8+10j))
Vo=p(17.149859,15.963757);Vs=p(20,-15)
near((Vs-Vo)/60,Vo/(20j)+Vo/(-25j))
print('PASS: Chapter 9 complex arithmetic, quadrants, phasor equation, inductor law, RC KVL, input admittance, and parallel LC KCL.')
