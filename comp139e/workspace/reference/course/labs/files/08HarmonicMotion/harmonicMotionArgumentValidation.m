function [x,t,damping] = harmonicMotionArgumentValidation (m, k, b, x0, v0, tN, N)
% harmonicMotion
%    [x,t,damping] = harmonicMotion (m, k, b, x0, v0, tN, N)
%    computes the displacement x of a damped harmonic oscillator where
%    m  = mass
%    k  = spring constant
%    b  = damping coefficient
%    x0 = initial displacement
%    v0 = initial velocity
%    tN = final time (initial time = 0)
%    N  = number of points in time
%    x  = displacement
%    t  = time values for each x
%    damping = a string containing 'undamped', 'underdamped', 'critical', or 'overdamped'

% Dale Shpak
% November 13, 2021

% First Method for Checking Input Arguments: Function Argument Validation
% Available since R2019b
arguments
    m  (1,1) {mustBePositive}
    k  (1,1) {mustBeNonnegative}
    b  (1,1) {mustBeNonnegative}
    x0 (1,1) {mustBeReal}
    v0 (1,1) {mustBeReal}
    tN (1,1) {mustBePositive}
    N  (1,1) {mustBePositive,mustBeInteger}
end


% Second Method for Checking Input Arguments: validateattributes
% Since R2007b
validateattributes(m, {'numeric'},{'scalar','positive'},1);
validateattributes(k, {'numeric'},{'scalar','nonnegative'},2);
validateattributes(b, {'numeric'},{'scalar','nonnegative'},3);
validateattributes(x0, {'numeric'},{'scalar'},4);
validateattributes(v0, {'numeric'},{'scalar'},5);
validateattributes(tN, {'numeric'},{'scalar','positive'},6);
% Example of validateattributes with custom error message
try
    validateattributes(N, {'numeric'},{'scalar','positive'},7);
    if N ~= fix(N)
        MyEx = MException('Dale:IntegerValue','Expecting integer value');
        throw (MyEx);
    end
catch ME
    error (['N must be a positive integer: ' ME.identifier]);
end


% Third Method for Checking Input Arguments
% Good Old-Fashioned if statements
if ~isscalar(m) || ~isscalar(k) || ~isscalar(b) || ~isscalar(x0) || ...
         ~isscalar(v0) || ~isscalar(tN) || ~isscalar(N)
    error ('All inputs must be scalars');
end
if N ~= fix(N)
    error('N must be an integer');
end
if m <= 0
    error ('Mass must be > 0');
end
if tN <= 0
    error ('Final time must be > 0');
end

% Bogus output values so that MATLAB doesn't complain
x=[];
t=[];
damping='';
