function area=simpsonsRuleSum(f,x0,xN,nIntervals)
% Composite Simpson rule; f must accept vector inputs (use .^, .* etc.).
if ~isa(f,'function_handle'), error('f must be a function handle'); end
validateattributes(x0,{'numeric'},{'real','finite','scalar'});
validateattributes(xN,{'numeric'},{'real','finite','scalar','>',x0});
validateattributes(nIntervals,{'numeric'},{'real','finite','scalar','integer','>',1});
if rem(nIntervals,2)~=0, error('nIntervals must be even'); end
h=(xN-x0)/nIntervals;
x=linspace(x0,xN,nIntervals+1);
values=f(x);
if isscalar(values), values=values+zeros(size(x)); end
if ~isvector(values)||numel(values)~=numel(x), error('f must return one value per x'); end
area=h/3*(values(1)+values(end)+4*sum(values(2:2:end-1))+2*sum(values(3:2:end-2)));
end
