import numpy as np
from typing import Union


def soil_water_retention_vg(
    pressure_head: Union[float, np.ndarray],
    theta_r: float,
    theta_s: float,
    alpha: float,
    n: float
) -> Union[float, np.ndarray]:
    """
    Models soil water retention curve with the van Genuchten equation.

    This equation describes the relationship between soil water content and
    pressure head.

    Args:
        pressure_head (Union[float, np.ndarray]): The pressure head (h),
            in meters. Can be a single value or a NumPy array. Should be
            negative for unsaturated conditions.
        theta_r (float): Residual water content (m^3/m^3).
        theta_s (float): Saturated water content (m^3/m^3).
        alpha (float): van Genuchten parameter related to the inverse of
            the air-entry pressure (1/m).
        n (float): van Genuchten parameter related to the pore-size
            distribution.

    Returns:
        Union[float, np.ndarray]: The volumetric water content (theta),
                                  in m^3/m^3.

    References:
        van Genuchten, M.T. (1980). A closed-form equation for
        predicting the hydraulic conductivity of unsaturated soils.
        Soil Science Society of America Journal, 44(5), 892-898.
    """
    m = 1 - 1 / n
    # The equation is for |h|
    h = np.abs(pressure_head)
    theta = theta_r + (theta_s - theta_r) / (1 + (alpha * h)**n)**m
    return theta


def green_ampt_infiltration(
    hydraulic_conductivity: float,
    wetting_front_suction: float,
    initial_moisture_deficit: float,
    cumulative_infiltration: float
) -> float:
    """
    Implements Green-Ampt infiltration model.

    This model calculates the infiltration rate of water into soil.

    Args:
        hydraulic_conductivity (float): Saturated hydraulic conductivity
            (K_s), in m/s.
        wetting_front_suction (float): Wetting front soil suction head
            (psi), in meters.
        initial_moisture_deficit (float): The initial moisture deficit
            (theta_s - theta_i), as a fraction.
        cumulative_infiltration (float): The total amount of water that
            has infiltrated so far (F), in meters.

    Returns:
        float: The infiltration rate (f), in m/s.

    References:
        Green, W.H. & Ampt, G.A. (1911). Studies on soil physics.
        The Journal of Agricultural Science, 4(1), 1-24.
    """
    if cumulative_infiltration <= 0:
        # At the beginning of infiltration, the rate is infinite,
        # but in practice it's limited by rainfall rate. We can return a
        # very large number or handle it based on context. For this
        # implementation, we assume F > 0. A simple approach is to say
        # infiltration rate is at least K_s
        return hydraulic_conductivity

    infiltration_rate = hydraulic_conductivity * (
        1 + (wetting_front_suction *
             initial_moisture_deficit) / cumulative_infiltration
    )
    return infiltration_rate


def penman_monteith_et(
    net_radiation: float,
    air_temp: float,
    vapor_pressure_deficit: float,
    aerodynamic_resistance: float,
    surface_resistance: float
) -> float:
    """
    Calculates reference evapotranspiration using FAO-56 method.

    Args:
        net_radiation (float): Net radiation at the crop surface
            (MJ/m^2/day).
        air_temp (float): Air temperature at 2m height (°C).
        vapor_pressure_deficit (float): Vapor pressure deficit (kPa).
        aerodynamic_resistance (float): Aerodynamic resistance (s/m).
        surface_resistance (float): Surface resistance (s/m).

    Returns:
        float: Reference evapotranspiration (ET_0), in mm/day.

    References:
        Allen, R.G., Pereira, L.S., Raes, D., & Smith, M. (1998).
        Crop Evapotranspiration — Guidelines for computing crop water
        requirements. FAO Irrigation and Drainage Paper 56.
    """
    # Constants
    LAMBDA = 2.45  # Latent heat of vaporization (MJ/kg)
    GAMMA = 0.067  # Psychrometric constant (kPa/°C)
    RHO_A = 1.2  # Mean air density at constant pressure (kg/m^3)
    C_P = 1.013e-3  # Specific heat of air (MJ/kg/°C)

    # Slope of saturation vapor pressure curve
    delta = (4098 * (0.6108 * np.exp((17.27 * air_temp) /
             (air_temp + 237.3))) / (air_temp + 237.3)**2)

    term1_num = delta * net_radiation
    term2_num = (RHO_A * C_P * vapor_pressure_deficit /
                 aerodynamic_resistance)
    denominator = delta + GAMMA * (1 + surface_resistance /
                                   aerodynamic_resistance)

    et_0_mj = (term1_num + term2_num) / denominator
    et_0_mm = et_0_mj / LAMBDA  # Convert to mm/day

    return et_0_mm


def soil_moisture_balance(
    precip: np.ndarray,
    et_ref: np.ndarray,
    awc: float,
    initial_soil_moisture: float
) -> tuple[np.ndarray, np.ndarray]:
    """
    Computes daily soil water balance using the FAO-56 method.

    Args:
        precip (np.ndarray): Daily precipitation (mm).
        et_ref (np.ndarray): Daily reference evapotranspiration (mm).
        awc (float): Available water capacity of the soil (mm).
        initial_soil_moisture (float): Initial soil moisture (mm).

    Returns:
        tuple[np.ndarray, np.ndarray]: A tuple containing:
            - np.ndarray: Daily soil moisture content (mm).
            - np.ndarray: Daily drainage (deep percolation), (mm).

    References:
        Allen, R.G., Pereira, L.S., Raes, D., & Smith, M. (1998).
        Crop Evapotranspiration — Guidelines for computing crop water
        requirements. FAO Irrigation and Drainage Paper 56.
    """
    num_days = len(precip)
    soil_moisture = np.zeros(num_days)
    drainage = np.zeros(num_days)

    sm_yesterday = initial_soil_moisture

    for i in range(num_days):
        # Assume crop coefficient Kc = 1 for reference ET
        et_c = et_ref[i]

        # Effective precipitation replenishes soil moisture
        effective_precip = precip[i]

        # Calculate soil moisture for today
        sm_today = sm_yesterday + effective_precip - et_c

        if sm_today > awc:
            drainage[i] = sm_today - awc
            sm_today = awc
        elif sm_today < 0:
            sm_today = 0

        soil_moisture[i] = sm_today
        sm_yesterday = sm_today

    return soil_moisture, drainage
