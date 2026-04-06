import numpy as np
import rasterio
from typing import Union


def soil_erosion_usle(
    r_factor: Union[str, np.ndarray],
    k_factor: Union[str, np.ndarray],
    ls_factor: Union[str, np.ndarray],
    c_factor: Union[str, np.ndarray],
    p_factor: Union[str, np.ndarray]
) -> np.ndarray:
    """
    Estimates soil erosion using the Universal Soil Loss Equation (USLE).

    A = R * K * LS * C * P

    This function can take either file paths to raster files or NumPy arrays
    as inputs for the USLE factors.

    Args:
        r_factor (Union[str, np.ndarray]): Rainfall-runoff erosivity factor.
        k_factor (Union[str, np.ndarray]): Soil erodibility factor.
        ls_factor (Union[str, np.ndarray]): Slope length and steepness
            factor.
        c_factor (Union[str, np.ndarray]): Cover-management factor.
        p_factor (Union[str, np.ndarray]): Support practice factor.

    Returns:
        np.ndarray: A 2D NumPy array representing the estimated average
                    annual soil loss (A).

    References:
        Wischmeier, W.H., & Smith, D.D. (1978). Predicting rainfall
        erosion losses. USDA Agriculture Handbook 537.
    """
    def _read_factor(factor: Union[str, np.ndarray]) -> np.ndarray:
        if isinstance(factor, str):
            with rasterio.open(factor) as src:
                return src.read(1)
        elif isinstance(factor, np.ndarray):
            return factor
        else:
            raise TypeError(
                "Factor inputs must be a file path (str) or a NumPy array."
            )

    r = _read_factor(r_factor)
    k = _read_factor(k_factor)
    ls = _read_factor(ls_factor)
    c = _read_factor(c_factor)
    p = _read_factor(p_factor)

    # Ensure all arrays have the same shape
    if not (r.shape == k.shape == ls.shape == c.shape == p.shape):
        raise ValueError("All input factor arrays must have the same shape.")

    soil_loss = r * k * ls * c * p
    return soil_loss
