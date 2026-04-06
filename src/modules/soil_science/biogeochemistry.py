import numpy as np
from typing import Union


def soil_respiration(
    base_respiration_rate: float,
    soil_temp: Union[float, np.ndarray],
    q10: float = 2.0,
    ref_temp: float = 15.0
) -> Union[float, np.ndarray]:
    """
    Calculates soil respiration rate using Q10 temperature dependence.

    The Q10 temperature coefficient is a measure of the temperature
    sensitivity of a chemical or biological process. A Q10 of 2 means that
    the rate doubles for every 10°C increase in temperature.

    Args:
        base_respiration_rate (float): The rate of respiration at a
            reference temperature, in units like mg CO2/m^2/hr.
        soil_temp (Union[float, np.ndarray]): The soil temperature(s),
            in Celsius.
        q10 (float, optional): The Q10 factor. Defaults to 2.0.
        ref_temp (float, optional): The reference temperature for the
            base rate, in Celsius. Defaults to 15.0.

    Returns:
        Union[float, np.ndarray]: The calculated soil respiration rate(s).

    References:
        Lloyd, J. & Taylor, J.A. (1994). On the temperature dependence of
        soil respiration. Functional Ecology, 8(3), 315-323.
    """
    respiration_rate = (base_respiration_rate *
                        q10**((soil_temp - ref_temp) / 10.0))
    return respiration_rate


def nitrogen_mineralization(
    soil_organic_carbon: float,
    soil_temp: float,
    soil_moisture: float,
    c_n_ratio: float = 12.0
) -> float:
    """
    Estimates net nitrogen mineralization based on CENTURY model principles.

    This is a simplified model. The actual CENTURY model is much more
    complex.

    Args:
        soil_organic_carbon (float): Soil organic carbon content (e.g.,
            in kg/m^2).
        soil_temp (float): Soil temperature at a specific depth (°C).
        soil_moisture (float): Volumetric water content (m^3/m^3).
        c_n_ratio (float, optional): Carbon to Nitrogen ratio of the
            decomposing organic matter. Defaults to 12.0.

    Returns:
        float: Estimated net N mineralization rate (e.g., in kg N/m^2/day).

    References:
        Parton, W.J., Schimel, D.S., Cole, C.V., & Ojima, D.S. (1987).
        Analysis of factors controlling soil organic matter levels in
        Great Plains grasslands. Soil Science Society of America Journal,
        51(5), 1173-1179.
    """
    # Base decomposition rate (a simplification)
    k_base = 0.001  # a base rate, e.g., per day

    # Temperature modifier (simple Q10-like function)
    temp_modifier = 2.0**((soil_temp - 20.0) / 10.0)
    if temp_modifier < 0:
        temp_modifier = 0

    # Moisture modifier (simple parabolic function, optimum at 0.6 VWC)
    moisture_modifier = 1 - ((soil_moisture - 0.6) / 0.4)**2
    if moisture_modifier < 0:
        moisture_modifier = 0

    # Carbon decomposition rate
    c_decomp_rate = (soil_organic_carbon * k_base *
                     temp_modifier * moisture_modifier)

    # N mineralization is C decomposition divided by C:N ratio
    n_mineralization_rate = c_decomp_rate / c_n_ratio

    return n_mineralization_rate


def soil_carbon_decomposition(
    soil_organic_carbon: float,
    soil_temp: float,
    soil_moisture: float,
    base_decay_rate: float = 0.0005
) -> float:
    """
    Models first-order decay of soil organic carbon with modifiers.

    This is a simplified model based on principles used in models like
    CENTURY.

    Args:
        soil_organic_carbon (float): The amount of soil organic carbon
            (e.g., in kg C/m^2).
        soil_temp (float): Soil temperature (°C).
        soil_moisture (float): Volumetric water content (m^3/m^3).
        base_decay_rate (float, optional): The base decay rate constant
            (e.g., per day). Defaults to 0.0005.

    Returns:
        float: The rate of carbon decomposition (e.g., in kg C/m^2/day).

    References:
        Parton, W.J., Schimel, D.S., Cole, C.V., & Ojima, D.S. (1987).
        Analysis of factors controlling soil organic matter levels in
        Great Plains grasslands. Soil Science Society of America Journal,
        51(5), 1173-1179.
    """
    # Using similar modifiers as in the nitrogen mineralization function
    temp_modifier = 2.0**((soil_temp - 20.0) / 10.0)
    if temp_modifier < 0:
        temp_modifier = 0

    moisture_modifier = 1 - ((soil_moisture - 0.6) / 0.4)**2
    if moisture_modifier < 0:
        moisture_modifier = 0

    decomposition_rate = (soil_organic_carbon * base_decay_rate *
                          temp_modifier * moisture_modifier)

    return decomposition_rate
