#include <stdio.h>
#include <math.h>

/* Global constant for gravity (m/s^2). */
const double g = 9.80665;

/* 
 * Compute the density of dry air in SI units.
 * (Uses the global gravitational constant g).
 *
 * @param altitude Altitude in metres above mean sea level
 *
 * @return Density in SI units
 */
double density(double altitude) {
    const double p0 = 101.325e3; /* Sea-level std atmospheric pressure, Pascals */
    const double T0 = 288.15;    /* Sea-level std temperature, Kelvins */
    const double L  = 0.0065;    /* Temperature lapse rate, K/m */
    const double R  = 8.31447;   /* Ideal gas constant, J/(mol.K) */
    const double M  = 0.0289644; /* Molar mass of dry air, kg/mol */
    double p;
    double T;

    T = T0 - L * altitude;
    p = p0 * pow((1.0 - (L * altitude) / T0), (g * M) / (R * L));

    return p * M / (R * T);
}

int main(void) {
    /* Input values */
    double height;
    double mass;
    double drag_coefficient;
    double area;
    double time_step;

    /* Simulation values */
    double time = 0.0;
    double velocity = 0.0;
    double rho0;
    double v_terminal;

    /* Prompt the user for inputs */
    printf("Enter the height in metres: ");
    scanf("%lf", &height);

    printf("Enter the mass in kg: ");
    scanf("%lf", &mass);

    printf("Enter the drag coefficient: ");
    scanf("%lf", &drag_coefficient);

    printf("Enter the cross-sectional area: ");
    scanf("%lf", &area);

    printf("Enter the time step size: ");
    scanf("%lf", &time_step);

    /* Header for the output table (we print downward speed to match the sample). */
    printf("    Time    Height   Velocity\n");

    /* Print the initial state (display downward speed to match the sample output). */
    printf("%8.2f  %8.1f   %8.2f\n", time, height, -velocity);

    /* Step forward in time until the object reaches the ground */
    while (height > 0.0) {
        double rho;
        double drag_force;
        double acceleration;
        double drag_accel;
        /* Compute air density at the current altitude */
        rho = density(height);

        /* Quadratic drag force magnitude: (1/2) * rho * Cd * A * v^2 */
        drag_force = 0.5 * rho * drag_coefficient * area * velocity * velocity;

        /* In this lab the object only falls downward, so drag points upward. */
        drag_accel = drag_force / mass;

        /* Net acceleration (upward is positive).
           a = (Fg + Fd) / m
           Using Fg = -mg and Fd = drag_accel * m gives: a = -g + drag_accel */
        acceleration = -g + drag_accel;

        /* Euler update for velocity and height (upward positive) */
        velocity = velocity + (acceleration * time_step);
        height = height + (velocity * time_step);
        time = time + time_step;
        /* Print only if still above ground */
        if (height > 0.0) {
            printf("%8.2f  %8.1f   %8.2f\n", time, height, -velocity);
        }
    }

    /* Compute and display the theoretical terminal velocity at sea level */
    rho0 = density(0.0);
    v_terminal = sqrt((2.0 * mass * g) / (rho0 * drag_coefficient * area));
    printf("Theoretical terminal velocity at sea level is %.1f m/s\n", v_terminal);

    return 0;
}
