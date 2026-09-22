function area = learningSimpson(f, startX, endX, intervals)
% A small reusable function for lesson 17. File name matches function name.
% Example: learningSimpson(@(x) x.^2, 0, 1, 4) returns about 1/3.
% Validate before allocating arrays or evaluating f.
if ~isa(f, 'function_handle')
    error('f must be a function handle');
end
validateattributes(startX, {'numeric'}, {'scalar','real','finite'});
validateattributes(endX, {'numeric'}, {'scalar','real','finite','>',startX});
validateattributes(intervals, {'numeric'}, {'scalar','real','finite','integer','positive'});
if mod(intervals, 2) ~= 0
    error('Simpson requires an even number of intervals');
end

x = linspace(startX, endX, intervals+1);
y = f(x); % f must accept a vector and return one value per point.
h = (endX-startX)/intervals;
% MATLAB index 2 is the FIRST interior point (mathematical index 1).
area = h/3 * (y(1) + y(end) + 4*sum(y(2:2:end-1)) + 2*sum(y(3:2:end-2)));
end
