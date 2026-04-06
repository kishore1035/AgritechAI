"""
Module Adapters - Convert data between different module formats

This module provides adapter classes to normalize data formats across
the integrated soil science, water balance, and crop recommendation modules.

Key adapters:
- pyfao56_to_simsoil: Convert daily FAO-56 results to hourly SimSoil input
- soil_profile_to_simsoil: Convert SoilProfile to SimSoil SoilProfile format
- simsoil_to_pyfao56: Aggregate hourly SimSoil to daily pyfao56 metrics
- crop_to_soil_science: Validate crop-soil compatibility using soil science
"""

import numpy as np
from typing import Dict, Tuple, List, Optional
from datetime import datetime, timedelta


class pyfao56_to_simsoil_Adapter:
    """
    Adapter to convert pyfao56 daily results to SimSoil hourly input
    
    pyfao56 outputs:
    - Daily ET₀ (reference evapotranspiration, mm/day)
    - Daily Kc (crop coefficient, unitless)
    - Daily Dr (soil depletion, mm)
    - Daily irrigation recommendation (mm)
    
    SimSoil inputs:
    - Hourly transpiration (kg m-2 s-1)
    - Hourly infiltration (kg m-2 s-1)
    - Hourly temperature profile (K)
    - Soil profiles (VWC, texture, porosity)
    """
    
    @staticmethod
    def et_to_transpiration(et_mm_per_day: float) -> float:
        """
        Convert FAO-56 daily ET (mm/day) to SimSoil transpiration (kg m-2 s-1)
        
        1 mm/day = 1 liter per m² per day = 1 kg/m² per day
        To convert to kg m-2 s-1: divide by 86400 seconds/day
        
        Args:
            et_mm_per_day: Daily evapotranspiration in mm/day
            
        Returns:
            Transpiration in kg m-2 s-1
        """
        SECONDS_PER_DAY = 86400
        return et_mm_per_day / SECONDS_PER_DAY
    
    @staticmethod
    def irrigation_to_infiltration(irrigation_mm: float) -> float:
        """
        Convert daily irrigation amount to infiltration rate
        
        Assumes irrigation spread over 2 hours
        
        Args:
            irrigation_mm: Daily irrigation in mm
            
        Returns:
            Infiltration rate in kg m-2 s-1
        """
        IRRIGATION_HOURS = 2
        SECONDS_PER_HOUR = 3600
        SECONDS_PER_DAY = 86400
        
        # Spread irrigation over fixed hours (2 hours)
        seconds_of_infiltration = IRRIGATION_HOURS * SECONDS_PER_HOUR
        
        # Convert mm/day to kg/m²/day
        infiltration_kg_m2_day = irrigation_mm
        
        # Convert to rate during irrigation period
        return infiltration_kg_m2_day / seconds_of_infiltration
    
    @staticmethod
    def dr_to_vwc(dr_mm: float, layer_depth_m: float, theta_s: float,
                  theta_r: float = 0.02) -> float:
        """
        Convert soil depletion (Dr) from pyfao56 to volumetric water content
        
        Dr = (θ_s - θ_c) × Z
        Therefore: θ_c = θ_s - (Dr / Z)
        
        Args:
            dr_mm: Soil depletion in mm
            layer_depth_m: Layer thickness in meters
            theta_s: Saturation water content (m³/m³)
            theta_r: Residual water content (m³/m³, default 0.02)
            
        Returns:
            Current volumetric water content (m³/m³)
        """
        # Convert mm depletion to m
        dr_m = dr_mm / 1000.0
        
        # Current water content
        theta_current = theta_s - (dr_m / layer_depth_m)
        
        # Clamp between residual and saturation
        return max(theta_r, min(theta_current, theta_s))
    
    @staticmethod
    def ks_factor_to_water_stress(ks: float) -> float:
        """
        Interpret pyfao56 Ks factor (water stress) for SimSoil
        
        Ks = 1: No water stress
        Ks = 0.5: Moderate stress
        Ks = 0: Severe/complete stress
        
        Args:
            ks: Water stress factor from pyfao56 (0-1)
            
        Returns:
            Water stress indicator (0-1, higher = more stressed)
        """
        # Invert: SimSoil uses high value = stressed, pyfao56 uses high value = good
        return 1.0 - ks
    
    @staticmethod
    def daily_to_hourly_transpiration(daily_transpiration: float,
                                      peak_hour: int = 12) -> np.ndarray:
        """
        Distribute daily transpiration across hourly profile
        
        Assumes peak transpiration at noon, follows solar radiation curve
        
        Args:
            daily_transpiration: Total daily transpiration (kg m-2 s-1 per day)
            peak_hour: Hour of peak transpiration (0-23, default 12)
            
        Returns:
            24-element array of hourly transpiration rates
        """
        # Simple hourly profile: triangular distribution around peak
        hours = np.arange(24)
        
        # Create bell curve centered at peak_hour
        distance_from_peak = np.abs(hours - peak_hour)
        hourly_profile = np.maximum(1.0 - (distance_from_peak / 12.0), 0.0)
        
        # Normalize to sum to 1 (convert to fractions)
        hourly_fractions = hourly_profile / np.sum(hourly_profile)
        
        # Apply to daily total
        hourly_transpiration = daily_transpiration * hourly_fractions
        
        return hourly_transpiration
    
    @classmethod
    def convert_daily_schedule(cls, daily_results: Dict) -> Dict:
        """
        Convert full day of pyfao56 results to SimSoil hourly input
        
        Input dictionary (pyfao56):
        {
            'date': datetime,
            'et0': 5.0,  # mm/day
            'kc': 0.8,   # unitless
            'etc': 4.0,  # mm/day (ET₀ × Kc)
            'dr': 25.0,  # mm (soil depletion)
            'irrigation': 10.0,  # mm (recommendation)
            'ks': 0.9,   # water stress (0-1, 1=no stress)
            'temp_profile': [15, 14, 13, 12, 11],  # °C by depth
            'theta_s': [0.40, 0.38, 0.35, 0.30, 0.28],  # saturation
        }
        
        Output dictionary (SimSoil):
        {
            'date': datetime,
            'hourly_transpiration': [array of 24 values],
            'hourly_infiltration': [array of 24 values],
            'hourly_temp_profile': [[24], [6-layer depths]],
            'layer_vwc': [array of current VWC by layer],
            'water_stress': 0.1,  # 0-1, higher = more stressed
        }
        """
        
        # Extract values with defaults
        date = daily_results.get('date', datetime.now())
        etc_mm_day = daily_results.get('etc', 4.0)  # Default to typical value
        irrigation_mm = daily_results.get('irrigation', 0.0)
        ks = daily_results.get('ks', 0.9)
        dr = daily_results.get('dr', 25.0)
        theta_s = daily_results.get('theta_s', [0.40] * 6)
        
        # Convert to SimSoil format
        result = {
            'date': date,
            'hourly_transpiration': cls.daily_to_hourly_transpiration(
                cls.et_to_transpiration(etc_mm_day)
            ),
            'hourly_infiltration': cls.infiltration_to_infiltration(
                irrigation_mm
            ),  # Simple model: constant rate during irrigation hours
            'water_stress': cls.ks_factor_to_water_stress(ks),
            'dr': dr,  # Keep for reference
        }
        
        return result


class simsoil_to_pyfao56_Adapter:
    """
    Adapter to aggregate SimSoil hourly outputs to pyfao56 daily metrics
    
    SimSoil outputs (hourly):
    - VWC by layer (m³/m³)
    - Matric potential (m)
    - Actual transpiration (kg m-2 s-1)
    - Actual infiltration (kg m-2 s-1)
    
    pyfao56 needs (daily):
    - Actual transpiration (mm/day)
    - Soil depletion Dr (mm)
    - Water stress Ks (0-1)
    - Soil moisture status
    """
    
    @staticmethod
    def hourly_to_daily_transpiration(hourly_transpiration: np.ndarray) -> float:
        """
        Aggregate hourly transpiration to daily total
        
        Args:
            hourly_transpiration: Array of 24 hourly values (kg m-2 s-1)
            
        Returns:
            Daily total in mm/day
        """
        SECONDS_PER_HOUR = 3600
        
        # Sum hourly values: each hour is 3600 seconds
        daily_kg_m2 = np.sum(hourly_transpiration) * SECONDS_PER_HOUR
        
        # Convert kg/m² to mm (1 kg/m² = 1 mm water)
        return daily_kg_m2
    
    @staticmethod
    def vwc_to_dr(vwc_profile: np.ndarray, theta_s: np.ndarray,
                  layer_depths: np.ndarray) -> float:
        """
        Convert VWC profile to soil depletion Dr
        
        Dr = (θ_s - θ) × depth
        
        Args:
            vwc_profile: Current VWC by layer (m³/m³)
            theta_s: Saturation VWC by layer (m³/m³)
            layer_depths: Layer thicknesses (m)
            
        Returns:
            Total soil depletion in mm
        """
        # Calculate depletion for each layer
        depletion_by_layer = (theta_s - vwc_profile) * (layer_depths * 1000)  # mm
        
        # Sum across layers (typically top layers most important)
        total_dr = np.sum(depletion_by_layer)
        
        return float(total_dr)
    
    @staticmethod
    def calculate_ks_from_stress(stress_factor: float) -> float:
        """
        Convert SimSoil stress factor to pyfao56 Ks
        
        Args:
            stress_factor: SimSoil stress (0-1, higher = more stressed)
            
        Returns:
            pyfao56 Ks factor (0-1, higher = less stressed)
        """
        # Invert relationship
        ks = 1.0 - stress_factor
        
        # Clamp to valid range
        return max(0.0, min(1.0, ks))
    
    @staticmethod
    def detect_stress_event(vwc_profile: np.ndarray, theta_s: np.ndarray,
                           mad_threshold: float = 0.6) -> bool:
        """
        Detect if soil is approaching water stress
        
        Water stress occurs when depletion exceeds MAD (management allowable depletion)
        
        Args:
            vwc_profile: Current VWC by layer (m³/m³)
            theta_s: Saturation VWC by layer (m³/m³)
            mad_threshold: MAD as fraction of available water (0-1)
            
        Returns:
            True if stress event detected
        """
        # Calculate normalized depletion (0-1)
        depletion_fraction = (theta_s - vwc_profile) / theta_s
        
        # Check if any layer exceeds MAD
        stress_detected = np.any(depletion_fraction > mad_threshold)
        
        return bool(stress_detected)
    
    @classmethod
    def aggregate_daily_results(cls, hourly_results: List[Dict],
                               soil_params: Dict) -> Dict:
        """
        Aggregate 24 hours of SimSoil results to single day for pyfao56
        
        Args:
            hourly_results: List of 24 hourly result dictionaries
            soil_params: Soil parameters (theta_s, depths, etc.)
            
        Returns:
            Daily aggregated results dictionary
        """
        
        # Extract hourly values
        transpiration_values = [hr.get('transpiration', 0.0) for hr in hourly_results]
        vwc_final = hourly_results[-1].get('vwc_profile', [0.3] * 6)
        
        # Aggregate
        result = {
            'date': hourly_results[-1].get('date', datetime.now()),
            'transpiration_mm': cls.hourly_to_daily_transpiration(
                np.array(transpiration_values)
            ),
            'dr': cls.vwc_to_dr(
                np.array(vwc_final),
                np.array(soil_params.get('theta_s', [0.40] * 6)),
                np.array(soil_params.get('layer_depths', [-0.05, -0.15, -0.35, -0.75, -1.5, -3.0]))
            ),
            'stress_detected': cls.detect_stress_event(
                np.array(vwc_final),
                np.array(soil_params.get('theta_s', [0.40] * 6))
            ),
        }
        
        return result


class SoilProfileAdapter:
    """
    Adapter to convert between different soil profile representations
    
    Formats:
    - SimplesoilProfile: Pydantic models with van Genuchten parameters
    - SimSoil: SoilProfile class with specific structure
    - pyfao56: Simplified soil input format
    - Soil-Science: Raw soil property dictionaries
    """
    
    @staticmethod
    def soilprofile_to_simsoil(soil_profile: Dict) -> Dict:
        """
        Convert SimplesoilProfile format to SimSoil format
        
        Args:
            soil_profile: SimplesoilProfile (dict with layer parameters)
            
        Returns:
            SimSoil-compatible soil profile dict
        """
        
        layers = soil_profile.get('layers', [])
        depths = soil_profile.get('layer_depths', {})
        
        # Extract van Genuchten parameters
        theta_r = []  # Residual water content
        theta_s = []  # Saturation water content
        k_sat = []    # Saturated conductivity
        texture = []  # Soil texture
        
        for layer in layers:
            theta_r.append(layer.get('theta_res', 0.02))
            theta_s.append(layer.get('theta_sat', 0.40))
            k_sat.append(layer.get('k_sat', 10.0))
            texture.append(layer.get('texture_class', 'loam'))
        
        result = {
            'layer_count': len(layers),
            'theta_r': np.array(theta_r),
            'theta_s': np.array(theta_s),
            'k_sat': np.array(k_sat),
            'texture': texture,
            'depths': depths,
        }
        
        return result
    
    @staticmethod
    def simsoil_to_pyfao56(simsoil_profile: Dict) -> Dict:
        """
        Convert SimSoil soil profile to pyfao56 format
        
        pyfao56 needs simplified soil inputs for each layer
        """
        
        result = {
            'layer_count': simsoil_profile.get('layer_count', 6),
            'theta_s': simsoil_profile.get('theta_s', [0.40] * 6),
            'theta_r': simsoil_profile.get('theta_r', [0.02] * 6),
            'k_sat': simsoil_profile.get('k_sat', [10.0] * 6),
        }
        
        return result


class CropSoilCompatibilityChecker:
    """
    Check crop-soil compatibility using soil science principles
    
    Uses soil science module to validate:
    - Texture suitability
    - Drainage requirements
    - pH compatibility
    - Nutrient cycling
    """
    
    CROP_SOIL_REQUIREMENTS = {
        'Wheat': {
            'texture_preferred': ['loam', 'clay loam', 'silty loam'],
            'ph_range': (6.0, 7.5),
            'drainage': 'well',
            'n_requirement': 120,  # kg/ha
        },
        'Rice': {
            'texture_preferred': ['clay', 'clay loam'],
            'ph_range': (5.5, 7.0),
            'drainage': 'poor',  # Flooded
            'n_requirement': 80,
        },
        'Maize': {
            'texture_preferred': ['loam', 'silt loam'],
            'ph_range': (6.0, 7.5),
            'drainage': 'good',
            'n_requirement': 150,
        },
        'Potato': {
            'texture_preferred': ['loam', 'sandy loam'],
            'ph_range': (5.0, 7.0),
            'drainage': 'good',
            'n_requirement': 120,
        },
    }
    
    @classmethod
    def check_compatibility(cls, crop: str, soil_profile: Dict) -> Tuple[bool, str]:
        """
        Check if crop is compatible with soil
        
        Args:
            crop: Crop name
            soil_profile: Soil profile dictionary
            
        Returns:
            Tuple of (is_compatible, reason_string)
        """
        
        if crop not in cls.CROP_SOIL_REQUIREMENTS:
            return True, "Crop not in database, assuming compatible"
        
        requirements = cls.CROP_SOIL_REQUIREMENTS[crop]
        topsoil = soil_profile.get('layers', [{}])[0]
        
        # Check texture
        texture = topsoil.get('texture_class', 'loam')
        if texture not in requirements['texture_preferred']:
            return False, f"Soil texture {texture} not suitable for {crop}"
        
        # Check pH
        ph = topsoil.get('ph', 6.5)
        ph_min, ph_max = requirements['ph_range']
        if not (ph_min <= ph <= ph_max):
            return False, f"Soil pH {ph} outside optimal range {requirements['ph_range']}"
        
        return True, f"{crop} compatible with soil"


# Export main adapters
__all__ = [
    'pyfao56_to_simsoil_Adapter',
    'simsoil_to_pyfao56_Adapter',
    'SoilProfileAdapter',
    'CropSoilCompatibilityChecker',
]
