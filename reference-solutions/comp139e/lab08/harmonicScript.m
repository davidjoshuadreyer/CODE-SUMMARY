% Compare four cases with the same mass, spring, and initial conditions.
mass=1; spring=4; ratios=[0 0.3 1 2]; duration=12; samples=1000;
labels=cell(1,4); curves=zeros(4,samples);
for j=1:4
    coeff=2*ratios(j)*sqrt(mass*spring);
    [curves(j,:),times,labels{j}]=harmonicMotion(mass,spring,coeff,1,0,duration,samples);
end
figure(1);plot(times,curves);legend(labels);xlabel('Time (s)');ylabel('Displacement (m)');grid on;
figure(2);axesHandles=gobjects(1,4);
for j=1:4
    axesHandles(j)=subplot(2,2,j);plot(times,curves(j,:));title(labels{j});
    xlabel('Time (s)');ylabel('Displacement (m)');grid on;
end
linkaxes(axesHandles,'xy');
