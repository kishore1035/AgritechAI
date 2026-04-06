import numpy as np
from typing import Union


def bulk_density(particle_density: float, porosity: float) -> float:
    """
    Computes bulk density from particle density and porosity.

    Bulk density is the weight of soil in a given volume. Soils with a
    high proportion of pore space to solids have lower bulk densities.

    Args:
        particle_density (float): The density of the soil particles,
            in kg/m^3. A common value for mineral soils is 2650 kg/m^3.
        porosity (float): The fraction of the total soil volume taken up
            by pore space, as a value between 0 and 1.

    Returns:
        float: The bulk density of the soil, in kg/m^3.

    References:
        Hillel, D. (1998). Environmental Soil Physics. Academic Press.
    """
    if not 0 <= porosity <= 1:
        raise ValueError("Porosity must be between 0 and 1.")

    return particle_density * (1 - porosity)


def soil_temperature_profile(
    initial_temp: np.ndarray,
    time_steps: int,
    delta_t: float,
    delta_z: float,
    thermal_diffusivity: Union[float, np.ndarray]
) -> np.ndarray:
    """
    Simulates soil temperature profile using Fourier heat conduction.

    This function uses a finite difference method to solve the
    one-dimensional heat conduction equation for a soil profile.

    Args:
        initial_temp (np.ndarray): The initial temperature profile of the
            soil at different depths (a 1D NumPy array), in Celsius.
        time_steps (int): The number of time steps to simulate.
        delta_t (float): The time step size, in seconds.
        delta_z (float): The depth step size, in meters.
        thermal_diffusivity (Union[float, np.ndarray]): The thermal
            diffusivity of the soil, in m^2/s. Can be a single value or
            an array for layered soil.

    Returns:
        np.ndarray: A 2D NumPy array where each row represents the
                    temperature profile at a time step.

    References:
        Hillel, D. (1998). Environmental Soil Physics. Academic Press.
    """
    num_depths = len(initial_temp)
    temperatures = np.zeros((time_steps, num_depths))
    temperatures[0, :] = initial_temp

    # Stability criterion
    alpha = thermal_diffusivity * delta_t / (delta_z ** 2)
    if np.any(alpha > 0.5):
        raise ValueError(
            "Stability criterion not met. "
            "Decrease delta_t or increase delta_z."
        )

    for t in range(1, time_steps):
        # Assume boundary conditions: surface temperature is constant,
        # and no heat flux at the bottom
        T_prev = temperatures[t - 1, :]
        T_new = np.copy(T_prev)

        for z in range(1, num_depths - 1):
            T_new[z] = (T_prev[z] + alpha *
                        (T_prev[z + 1] - 2 * T_prev[z] + T_prev[z - 1]))

        # Simple boundary conditions
        T_new[0] = T_prev[0]  # Surface temperature held constant
        T_new[-1] = T_new[-2]  # No heat flux at the bottom

        temperatures[t, :] = T_new

    return temperatures
