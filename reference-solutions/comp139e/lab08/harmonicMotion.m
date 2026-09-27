function [x,t,damping] = harmonicMotion(m,k,b,x0,v0,tN,N)
% Solve m*x'' + b*x' + k*x = 0 for the four damping cases.
validateattributes(m,{'numeric'},{'real','finite','scalar','positive'});
validateattributes(k,{'numeric'},{'real','finite','scalar','positive'});
validateattributes(b,{'numeric'},{'real','finite','scalar','nonnegative'});
validateattributes(x0,{'numeric'},{'real','finite','scalar'});
validateattributes(v0,{'numeric'},{'real','finite','scalar'});
validateattributes(tN,{'numeric'},{'real','finite','scalar','positive'});
validateattributes(N,{'numeric'},{'real','finite','scalar','integer','positive'});
if N==1, t=0; else, t=linspace(0,tN,N); end
w0=sqrt(k/m); zeta=b/(2*sqrt(m*k));
if abs(zeta-1)<=10*eps(max(1,zeta))
    damping='critical'; x=exp(-w0*t).*(x0+(w0*x0+v0)*t);
elseif zeta<1
    w1=w0*sqrt(1-zeta^2);
    x=exp(-zeta*w0*t).*(x0*cos(w1*t)+(zeta*w0*x0+v0)/w1*sin(w1*t));
    if b==0, damping='undamped'; else, damping='underdamped'; end
else
    damping='overdamped';
    % Stable expression for the slow root avoids subtracting nearly equal values.
    r1=-w0/(zeta+sqrt(zeta^2-1));r2=-w0*(zeta+sqrt(zeta^2-1));
    B=(v0-r1*x0)/(r2-r1);A=x0-B;x=A*exp(r1*t)+B*exp(r2*t);
end
end
