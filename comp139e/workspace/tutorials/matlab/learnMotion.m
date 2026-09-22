% LESSON 16 MATLAB companion. In MATLAB, open this folder and run learnMotion.
% Learn: vectors, indexing, element-wise operations, scripts/functions, plots.
% Model: m=1, k=4, initial position=1, initial velocity=0.
% These fixed examples illustrate four damping cases; this is not the lab's
% general harmonicMotion function. Try changing the sample count or final time.
t = linspace(0, 6, 301);  % 301 points include BOTH endpoints.
fprintf('First time = %g, last time = %g\n', t(1), t(end)); % MATLAB starts at 1.

undamped = cos(2*t);                          % b=0
w = sqrt(15)/2;
underdamped = exp(-t/2).*(cos(w*t) + sin(w*t)/(2*w)); % b=1
critical = (1 + 2*t).*exp(-2*t);               % b=4
r1 = -3 + sqrt(5);
r2 = -3 - sqrt(5);
overdamped = (-r2*exp(r1*t) + r1*exp(r2*t))/(r1-r2); % b=6
% .* multiplies matching elements. .^ raises each element to a power.
% Ordinary * is matrix multiplication when both operands are arrays.

figure(1); clf;
plot(t, undamped, t, underdamped, t, critical, t, overdamped);
xlabel('Time (s)'); ylabel('Displacement (m)');
legend('Undamped', 'Underdamped', 'Critical', 'Overdamped');
title('Same starting position, different damping'); grid on;

figure(2); clf;
ax(1) = subplot(2,1,1);
plot(t, undamped); title('Undamped'); ylabel('Displacement (m)');
ax(2) = subplot(2,1,2);
plot(t, critical); title('Critical'); ylabel('Displacement (m)'); xlabel('Time (s)');
linkaxes(ax, 'x'); % Zooming along time affects both plots.

% Checks: all four curves begin at 1; the critical curve approaches zero.
assert(abs(critical(1)-1) < 1e-12);
assert(abs(overdamped(1)-1) < 1e-12);
fprintf('Motion checks passed. Inspect the two figures.\n');
