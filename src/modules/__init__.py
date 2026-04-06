"""
AgriTech AI Module Integration Package

This package contains all integrated agricultural modules:
1. crop_recommendation - Genetic algorithm based crop rotation optimization
2. simsoil - Hourly water balance simulation (Richards equation)
3. soil_science - Soil physics, hydrology, biogeochemistry, erosion modeling
4. soil_profile - Soil profile management and van Genuchten parameters
"""

__version__ = "1.0.0"
__all__ = [
    "crop_recommendation",
    "simsoil",
    "soil_science",
    "soil_profile",
]
