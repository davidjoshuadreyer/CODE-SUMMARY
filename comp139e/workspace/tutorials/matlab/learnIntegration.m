% LESSON 17 MATLAB companion. Run in this folder: learnIntegration
% Learn: function handles, .^, sum, loops, validation, error plots, and timing.
f = @(x) x.^2;  % Anonymous function: square every element of its input.
intervals = 4;
x = linspace(0, 1, intervals+1);
y = f(x);
h = 1/intervals;
trapArea = h/2 * (y(1) + y(end) + 2*sum(y(2:end-1)));
simpArea = learningSimpson(f, 0, 1, intervals);

% Same Simpson weights using a loop instead of sum:
weighted = y(1) + y(end);
for index = 2:intervals
    if mod(index, 2) == 0
        weighted = weighted + 4*y(index);
    else
        weighted = weighted + 2*y(index);
    end
end
loopArea = h/3*weighted;
fprintf('Trapezoid = %.8f; Simpson = %.8f; loop = %.8f\n', trapArea, simpArea, loopArea);
assert(abs(simpArea-1/3) < 1e-12);
assert(abs(loopArea-simpArea) < 1e-12);
try
    learningSimpson(f, 0, 1, 3); % Intentionally invalid: odd interval count.
catch problem
    fprintf('Caught expected error: %s\n', problem.message);
end

% A quartic shows Simpson's error more clearly: it integrates quadratics exactly
% apart from rounding. The exact integral of x^4 over [0,1] is 1/5.
counts = [4 8 16 32 64];
errors = zeros(size(counts));
tic;
for index = 1:length(counts)
    errors(index) = abs(learningSimpson(@(x) x.^4, 0, 1, counts(index))-1/5);
end
elapsed = toc;
fprintf('Error study took %g seconds\n', elapsed);
figure; loglog(counts, errors, 'o-'); grid on;
xlabel('Number of intervals'); ylabel('Absolute error'); title('Simpson convergence');
% Try: replace x.^4 with another function, and update its exact integral.
