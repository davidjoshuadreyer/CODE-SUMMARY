% Solution for COMP 130 numerical integration lab.
% Plots the approximation error for the trapezoidal rule and for
% Simpson's rule using different numbers of intervals

% Define the function to be integrated and the limits of integration
func = @(x) 4*x.^4 - 3*x.^2 - 8*x + 2;
x0 = 0;
xf = 2;
exact = 5.6;  % The exact value of this integral 
%exact = integral(func, x0, xf)

% The number of intervals (as powers of 10) used for computing the approximation errors
N_10 = 1:7;

% a "for" loop to compute the approximation error for all of the N's
for k=N_10;
    N(k) = 10^k;
    trapErrorD(k) = abs(trapezoidalRule(func, x0, xf, N(k)) - exact);
    simpErrorDSum(k) = abs(simpsonsRuleSum(func, x0, xf, N(k)) - exact);
    simpErrorDLoop(k) = abs(simpsonsRuleLoop(func, x0, xf, N(k)) - exact);
end

figure(1);
clf
%Using loglog instead of plot for a better comprison 
loglog(N, trapErrorD, 'b-*',N, simpErrorDSum,'g-+', N, simpErrorDLoop, 'r-o');
legend('Trapezoidal','Simpson''s using sum()', 'Simpson''s using loop');
title('Approximation Error as a Function of Number of Intervals');
xlabel('Number of Intervals');
ylabel('Error');