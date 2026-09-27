function area=simpsonsRuleSum(f,x0,xN,nIntervals)
% Composite Simpson rule; f must accept vector inputs (use .^, .* etc.).
if ~isa(f,'function_handle'), error('f must be a function handle'); end
validateattributes(x0,{'numeric'},{'real','finite','scalar'});
validateattributes(xN,{'numeric'},{'real','finite','scalar','>',x0});
validateattributes(nIntervals,{'numeric'},{'real','finite','scalar','integer','>',1});
if rem(nIntervals,2)~=0, error('nIntervals must be even'); end
h=(xN-x0)/nIntervals;
x=linspace(x0,xN,nIntervals+1);
area=h/3*(f(x0)+f(xN)+4*sum(f(x(2:2:end-1)))+2*sum(f(x(3:2:end-2))));
end
