// Check transient coefficients against the circuit's initial values and ODE.
const assert=require('node:assert/strict');
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
function over(alpha,w,x0,d,xf){const q=Math.sqrt(alpha*alpha-w*w),s1=-alpha+q,s2=-alpha-q,A=(d-s2*(x0-xf))/(s1-s2),B=x0-xf-A;near(A+B+xf,x0);near(s1*A+s2*B,d);for(const t of [0,.1,1]){let y=A*Math.exp(s1*t)+B*Math.exp(s2*t),dy=s1*A*Math.exp(s1*t)+s2*B*Math.exp(s2*t),ddy=s1*s1*A*Math.exp(s1*t)+s2*s2*B*Math.exp(s2*t);near(ddy+2*alpha*dy+w*w*y,0,1e-7);}return {s1,s2,A,B};}
const ps2=over(20,10,20,0,0);near(ps2.A,21.5470,.0001);
const ex8=over(6.25,2.5,4,.75,4);near(ex8.A,.065465,.000001);
const extra=over(2.5,.5,10,-.5,20);near(extra.B,.205166,.000001);
const ex5=over(26,10,5,-260,0);near(ex5.A,-5/24);near(ex5.B,125/24);
// Underdamped and critical coefficients: starting derivative = B*w - alpha*A or B - alpha*A.
near(Math.sqrt(19)*(3/Math.sqrt(19))-9,-6);
near(6*(-20/3)-8*5,-80);
near(-50-10*5,-100);
near(-20-10*(-2),0);near(6-2*3,0);
near(1/Math.sqrt(.02*.05),31.6227766017,1e-9);
near(120*60/(120+60),40);
// Published decimal expressions must preserve initial conditions within rounding tolerance.
near(.065465*(11.97822-.52178),.75,1e-5);
console.log('PASS: Week 7 coefficients, initial values, damping, and second-order ODE residuals.');
