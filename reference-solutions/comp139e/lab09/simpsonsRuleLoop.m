function area=simpsonsRuleLoop(f,x0,xN,nIntervals)
% Same quadrature weights evaluated one point at a time, without sum().
if ~isa(f,'function_handle'), error('f must be a function handle'); end
validateattributes(x0,{'numeric'},{'real','finite','scalar'});
validateattributes(xN,{'numeric'},{'real','finite','scalar','>',x0});
validateattributes(nIntervals,{'numeric'},{'real','finite','scalar','integer','>',1});
if rem(nIntervals,2)~=0, error('nIntervals must be even'); end
h=(xN-x0)/nIntervals;
weighted=f(x0)+f(xN);
for j=1:nIntervals-1
    if rem(j,2)==1, weight=4; else, weight=2; end
    weighted=weighted+weight*f(x0+j*h);
end
area=weighted*h/3;
end
