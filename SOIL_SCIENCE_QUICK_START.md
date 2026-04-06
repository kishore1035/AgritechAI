# 🌱 Soil Science Integration - Quick Start Guide
**Phase 1: Precision Irrigation + Fertilizer Timing**

**Timeline:** 2-3 weeks  
**Team:** 1-2 engineers  
**Status:** Ready to start

---

## 📋 Phase 1 Tasks

### Task 1: Copy & Setup Module (Day 1)

#### Step 1.1: Copy Soil Science Module
```bash
# From your local machine
cd c:\Users\PREETHI\Downloads\agritech-ai

# Create libs directory if it doesn't exist
mkdir -p backend\ml-service\libs

# Copy soil science module
cp -r "c:\Users\PREETHI\Downloads\PythonToolsForSoilScienceModeling-PythonToolsForSoilScienceModelingV1.0.0\PythonToolsForSoilScienceModeling-PythonToolsForSoilScienceModelingV1.0.0\src\soil_science" \
   "backend\ml-service\libs\"
```

#### Step 1.2: Verify Installation
```bash
cd backend/ml-service

# Check if soil_science module is present
ls -la libs/soil_science/

# Should show:
# __init__.py
# __pycache__/
# biogeochemistry.py
# erosion.py
# hydrology.py
# physics.py
```

#### Step 1.3: Test Import
```python
# Create test_soil_import.py
from libs.soil_science.hydrology import penman_monteith_et
from libs.soil_science.biogeochemistry import nitrogen_mineralization
from libs.soil_science.physics import soil_temperature_profile

print("✅ All imports successful!")
```

---

### Task 2: Create Python Service (Days 2-3)

Create file: `backend/ml-service/services/soil_science_service.py`

```python
"""
Soil Science Integration Service
Provides scientific calculations for precision agriculture
"""

import numpy as np
from typing import Dict, List, Optional
from libs.soil_science.hydrology import (
    penman_monteith_et,
    green_ampt_infiltration,
    soil_water_retention_vg,
    soil_moisture_balance
)
from libs.soil_science.biogeochemistry import (
    nitrogen_mineralization,
    soil_respiration
)
from libs.soil_science.physics import soil_temperature_profile


class SoilScienceService:
    """
    Soil Science Calculations Service
    
    Provides scientific methods for:
    - Precision irrigation scheduling
    - Nitrogen mineralization & fertilizer timing
    - Soil temperature profiling
    - Carbon tracking
    """

    def calculate_water_balance(
        self,
        farm_data: Dict,
        forecast_days: int = 7
    ) -> Dict:
        """
        Calculate 7-day soil water balance using actual rainfall forecasts
        
        Args:
            farm_data: {
                'precipitation': [10, 5, 0, 3, 0, 0, 2],  # mm/day
                'et_ref': [3, 3, 3, 3.5, 4, 3.5, 3],  # mm/day
                'available_water_capacity': 100,  # mm
                'current_soil_moisture': 80,  # mm
                'soil_type': 'loam'  # for infiltration
            }
        
        Returns:
            {
                'daily_soil_moisture': [82, 84, 81, 80.5, 76.5, 73, 72],
                'daily_irrigation_need': [0, 0, 3, 3.5, 4, 3.5, 3],
                'daily_drainage': [0, 0, 0, 0, 0, 0, 0.5],
                'current_moisture': 72,
                'current_deficit': 28,
                'critical_alert': False
            }
        """
        precipitation = np.array(farm_data.get('precipitation', []))
        et_ref = np.array(farm_data.get('et_ref', []))
        awc = farm_data.get('available_water_capacity', 100)
        initial_moisture = farm_data.get('current_soil_moisture', 80)

        # Calculate water balance
        soil_moisture, drainage = soil_moisture_balance(
            precip=precipitation,
            et_ref=et_ref,
            awc=awc,
            initial_soil_moisture=initial_moisture
        )

        # Calculate irrigation needs
        irrigation_need = np.maximum(0, et_ref - precipitation)

        current_moisture = float(soil_moisture[-1])
        critical_alert = current_moisture < (awc * 0.25)  # <25% AWC

        return {
            'daily_soil_moisture': soil_moisture.tolist(),
            'daily_irrigation_need': irrigation_need.tolist(),
            'daily_drainage': drainage.tolist(),
            'current_moisture': current_moisture,
            'current_deficit': awc - current_moisture,
            'critical_alert': critical_alert,
            'status': 'critical' if critical_alert else 'normal'
        }

    def get_irrigation_schedule(
        self,
        farm_data: Dict,
        weather_forecast: Dict
    ) -> Dict:
        """
        Get precision irrigation schedule based on soil science
        
        Combines:
        - Soil moisture balance
        - Infiltration capacity
        - ET requirements
        
        Returns:
            {
                'today': {
                    'irrigation_mm': 5.2,
                    'timing': '5:00 AM - 6:30 AM',
                    'infiltration_safe_rate': 12.5,
                    'application_method': 'drip',
                    'confidence': 0.92
                },
                'weekly_total': 28.5,
                'weekly_savings_vs_baseline': 7.2
            }
        """
        # Get water balance
        water_balance = self.calculate_water_balance(farm_data)

        # Get infiltration rate
        infiltration = green_ampt_infiltration(
            hydraulic_conductivity=farm_data.get('hydraulic_conductivity', 5e-5),
            wetting_front_suction=farm_data.get('wetting_front_suction', 0.15),
            initial_moisture_deficit=farm_data.get('initial_moisture_deficit', 0.2),
            cumulative_infiltration=farm_data.get('cumulative_infiltration', 0.01)
        )

        # Calculate irrigation need
        irrigation_today = max(
            0,
            water_balance['daily_irrigation_need'][0]
        )

        # Recommend application timing based on infiltration
        max_daily_application = infiltration * 86400  # convert to mm/day
        if irrigation_today > 0:
            if irrigation_today <= max_daily_application:
                timing = "5:00 AM - 6:30 AM (single application)"
                split = False
            else:
                timing = "5:00 AM - 6:30 AM AND 4:00 PM - 5:30 PM (split)"
                split = True
        else:
            timing = "No irrigation needed"
            split = False

        # Weekly projection
        weekly_total = sum(water_balance['daily_irrigation_need'])

        return {
            'today': {
                'irrigation_mm': round(irrigation_today, 1),
                'timing': timing,
                'infiltration_safe_rate': round(max_daily_application, 1),
                'split_application': split,
                'application_method': 'drip' if irrigation_today > 0 else 'none',
                'confidence': 0.92
            },
            'weekly_total_mm': round(weekly_total, 1),
            'weekly_savings_vs_generic_schedule': round(
                weekly_total * 0.25, 1  # 25% typical saving
            ),
            'water_balance_status': water_balance
        }

    def get_nitrogen_availability(
        self,
        farm_data: Dict,
        current_conditions: Dict
    ) -> Dict:
        """
        Calculate nitrogen mineralization to determine fertilizer timing
        
        Args:
            farm_data: {
                'soil_organic_carbon': 10,  # kg C/m^2
                'c_n_ratio': 12.0
            }
            current_conditions: {
                'soil_temperature': 25,  # °C
                'soil_moisture': 0.5  # m^3/m^3
            }
        
        Returns:
            {
                'n_mineralization_rate': 0.0012,  # kg N/m^2/day
                'n_available_kg_per_ha': 12,
                'apply_fertilizer': True,
                'reason': 'Low N availability, apply now',
                'next_check': '2 days',
                'recommendation': {
                    'fertilizer_type': 'urea',
                    'quantity_kg_per_ha': 40,
                    'timing': 'tomorrow at 5 AM',
                    'water_requirement': 'light irrigation after application'
                }
            }
        """
        n_rate = nitrogen_mineralization(
            soil_organic_carbon=farm_data.get('soil_organic_carbon', 10),
            soil_temp=current_conditions.get('soil_temperature', 20),
            soil_moisture=current_conditions.get('soil_moisture', 0.5),
            c_n_ratio=farm_data.get('c_n_ratio', 12.0)
        )

        # Convert to kg/ha (1 m^2 = 0.0001 ha)
        n_available_kg_ha = float(n_rate) * 10000

        # Decision logic
        min_threshold = 10  # kg/ha
        apply_fertilizer = n_available_kg_ha < min_threshold

        if apply_fertilizer:
            reason = f"Low N availability ({n_available_kg_ha:.1f} kg/ha), apply now"
            fertilizer_qty = max(30, 50 - n_available_kg_ha)  # complement to 50 kg/ha
            timing = "tomorrow at 5 AM"
        else:
            reason = f"Adequate N from mineralization ({n_available_kg_ha:.1f} kg/ha), wait"
            fertilizer_qty = 0
            timing = "check again in 2-3 days"

        return {
            'n_mineralization_rate': float(n_rate),
            'n_available_kg_per_ha': round(n_available_kg_ha, 1),
            'apply_fertilizer': apply_fertilizer,
            'reason': reason,
            'next_check': '2-3 days',
            'recommendation': {
                'action': 'apply' if apply_fertilizer else 'wait',
                'fertilizer_type': 'urea' if apply_fertilizer else 'none',
                'quantity_kg_per_ha': round(fertilizer_qty, 0),
                'timing': timing,
                'post_application': 'light irrigation after 6 hours'
            }
        }

    def get_soil_temperature_profile(
        self,
        initial_temp: List[float],
        forecast_hours: int = 48
    ) -> Dict:
        """
        Forecast soil temperature profile for disease risk assessment
        
        Args:
            initial_temp: [20.0, 19.5, 19.0, 18.5, 18.0]  # at different depths
            forecast_hours: 48
        
        Returns:
            {
                'profile_2_hours': [21.5, 20.2, 19.5, 19.0, 18.5],
                'profile_24_hours': [22.0, 21.0, 20.2, 19.5, 19.0],
                'min_temp_forecast': 18.5,
                'max_temp_forecast': 22.5,
                'disease_risk': {
                    'fungal': 'moderate',
                    'bacterial': 'low',
                    'recommendation': 'Monitor for fungal diseases'
                }
            }
        """
        time_steps = forecast_hours
        temps = soil_temperature_profile(
            initial_temp=np.array(initial_temp),
            time_steps=time_steps,
            delta_t=3600,  # 1 hour steps
            delta_z=0.1,  # 10 cm depth steps
            thermal_diffusivity=1e-6  # typical soil
        )

        current_profile = temps[0, :].tolist()
        final_profile = temps[-1, :].tolist()
        
        max_temp = float(np.max(temps))
        min_temp = float(np.min(temps))

        # Simplified disease risk assessment
        disease_risk = self._assess_disease_risk(temps, forecast_hours)

        return {
            'current_profile': current_profile,
            f'profile_{forecast_hours}_hours': final_profile,
            'min_temp_forecast': round(min_temp, 1),
            'max_temp_forecast': round(max_temp, 1),
            'temp_range': round(max_temp - min_temp, 1),
            'disease_risk': disease_risk
        }

    def _assess_disease_risk(self, temp_profile: np.ndarray, hours: int) -> Dict:
        """Assess disease risk based on temperature profile"""
        avg_temp = np.mean(temp_profile)
        
        # Simplified risk logic
        fungal_risk = 'high' if 18 < avg_temp < 25 else 'low'
        bacterial_risk = 'high' if 25 < avg_temp < 35 else 'low'

        recommendation = []
        if fungal_risk == 'high':
            recommendation.append('Monitor for fungal diseases, reduce humidity')
        if bacterial_risk == 'high':
            recommendation.append('Monitor for bacterial diseases, ensure drainage')

        return {
            'fungal': fungal_risk,
            'bacterial': bacterial_risk,
            'recommendation': ' | '.join(recommendation) if recommendation else 'Low risk'
        }

    def get_carbon_footprint(
        self,
        farm_data: Dict,
        annual_conditions: Dict
    ) -> Dict:
        """
        Calculate annual soil carbon footprint
        
        Returns:
            {
                'annual_respiration_kg_co2_ha': 1250,
                'carbon_sequestration_potential': 800,
                'net_carbon_kg_co2_ha': 450,
                'carbon_credits_potential': 2250,
                'sustainability_score': 7.5
            }
        """
        # Soil respiration
        respiration_annual = soil_respiration(
            base_respiration_rate=farm_data.get('base_respiration_rate', 2.5),
            soil_temp=annual_conditions.get('annual_avg_temp', 20),
            q10=farm_data.get('q10', 2.0)
        )

        # Convert to annual and per ha
        respiration_per_ha = respiration_annual * 365 * 24 * 10000 / 1e6  # rough conversion

        # Carbon sequestration (simplified)
        sequestration = farm_data.get('annual_organic_matter_input', 5) * 0.5  # 50% C

        net_carbon = sequestration - respiration_per_ha
        carbon_credits = max(0, net_carbon * 5)  # ₹5 per kg CO2 credit value

        sustainability_score = min(10, 5 + (sequestration / 1000))

        return {
            'annual_respiration_kg_co2_ha': round(respiration_per_ha, 0),
            'carbon_sequestration_kg_co2_ha': round(sequestration, 0),
            'net_carbon_kg_co2_ha': round(net_carbon, 0),
            'carbon_credits_potential_rupees': round(carbon_credits, 0),
            'sustainability_score_out_of_10': round(sustainability_score, 1),
            'status': 'carbon_positive' if net_carbon > 0 else 'carbon_neutral'
        }

    def get_all_recommendations(
        self,
        farm_id: str,
        farm_data: Dict,
        weather_forecast: Dict,
        current_conditions: Dict
    ) -> Dict:
        """
        Get all soil science recommendations in one call
        
        Returns comprehensive dashboard data
        """
        return {
            'farm_id': farm_id,
            'timestamp': current_conditions.get('timestamp'),
            'irrigation': self.get_irrigation_schedule(farm_data, weather_forecast),
            'fertilizer': self.get_nitrogen_availability(farm_data, current_conditions),
            'temperature': self.get_soil_temperature_profile(
                farm_data.get('soil_temp_profile', [20, 19.5, 19, 18.5, 18])
            ),
            'carbon': self.get_carbon_footprint(farm_data, current_conditions)
        }
```

---

### Task 3: Create FastAPI Endpoints (Day 4)

Create file: `backend/ml-service/routes/soil_science_routes.py`

```python
"""
FastAPI Routes for Soil Science Service
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Optional
from services.soil_science_service import SoilScienceService

router = APIRouter(
    prefix="/api/v1/soil-science",
    tags=["Soil Science"]
)

soil_service = SoilScienceService()


@router.post("/water-balance")
async def calculate_water_balance(
    farm_id: str = Query(..., description="Farm ID"),
    data: Dict = None
):
    """
    Calculate 7-day soil water balance
    
    Request body:
    {
        "precipitation": [10, 5, 0, 3, 0, 0, 2],
        "et_ref": [3, 3, 3, 3.5, 4, 3.5, 3],
        "available_water_capacity": 100,
        "current_soil_moisture": 80,
        "soil_type": "loam"
    }
    """
    try:
        result = soil_service.calculate_water_balance(data or {})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/irrigation-schedule")
async def get_irrigation_schedule(
    farm_id: str = Query(..., description="Farm ID"),
    data: Dict = None
):
    """
    Get precision irrigation schedule
    """
    try:
        farm_data = data.get('farm_data', {})
        weather = data.get('weather_forecast', {})
        result = soil_service.get_irrigation_schedule(farm_data, weather)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/nitrogen-availability")
async def get_nitrogen_availability(
    farm_id: str = Query(..., description="Farm ID"),
    data: Dict = None
):
    """
    Get nitrogen mineralization & fertilizer timing recommendation
    """
    try:
        farm_data = data.get('farm_data', {})
        conditions = data.get('current_conditions', {})
        result = soil_service.get_nitrogen_availability(farm_data, conditions)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/temperature-profile")
async def get_temperature_profile(
    farm_id: str = Query(..., description="Farm ID"),
    initial_temps: list = Query(..., description="Initial temperature profile"),
    hours: int = Query(48, description="Forecast hours")
):
    """
    Get soil temperature profile forecast for disease risk
    """
    try:
        result = soil_service.get_soil_temperature_profile(initial_temps, hours)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/carbon-footprint")
async def get_carbon_footprint(
    farm_id: str = Query(..., description="Farm ID"),
    data: Dict = None
):
    """
    Get annual carbon footprint & sustainability metrics
    """
    try:
        farm_data = data.get('farm_data', {})
        conditions = data.get('annual_conditions', {})
        result = soil_service.get_carbon_footprint(farm_data, conditions)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recommendations")
async def get_all_recommendations(
    farm_id: str = Query(..., description="Farm ID"),
    data: Dict = None
):
    """
    Get all soil science recommendations (irrigation, fertilizer, carbon, etc.)
    
    This is the main endpoint for dashboard integration
    """
    try:
        result = soil_service.get_all_recommendations(
            farm_id=farm_id,
            farm_data=data.get('farm_data', {}),
            weather_forecast=data.get('weather_forecast', {}),
            current_conditions=data.get('current_conditions', {})
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "soil-science",
        "modules": ["physics", "hydrology", "biogeochemistry", "erosion"]
    }
```

---

### Task 4: Node.js Backend Integration (Days 5-6)

Create file: `backend/services/soilScienceService.js`

```javascript
/**
 * Soil Science Integration Service
 * Bridges Node.js backend with Python ML service
 */

const axios = require('axios');
const logger = require('../utils/logger');

class SoilScienceService {
    constructor() {
        this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
        this.apiPrefix = '/api/v1/soil-science';
    }

    /**
     * Get comprehensive soil science recommendations for a farm
     */
    async getRecommendations(farmId, farmData, weatherForecast, currentConditions) {
        try {
            logger.info(`[SoilScience] Getting recommendations for farm: ${farmId}`);

            const response = await axios.post(
                `${this.mlServiceUrl}${this.apiPrefix}/recommendations`,
                {
                    farm_data: farmData,
                    weather_forecast: weatherForecast,
                    current_conditions: currentConditions
                },
                {
                    params: { farm_id: farmId },
                    timeout: 5000
                }
            );

            return response.data;
        } catch (error) {
            logger.error('Soil science recommendations error:', error.message);
            throw error;
        }
    }

    /**
     * Get precision irrigation schedule
     */
    async getIrrigationSchedule(farmId, farmData, weatherForecast) {
        try {
            const response = await axios.post(
                `${this.mlServiceUrl}${this.apiPrefix}/irrigation-schedule`,
                {
                    farm_data: farmData,
                    weather_forecast: weatherForecast
                },
                {
                    params: { farm_id: farmId },
                    timeout: 5000
                }
            );

            // Transform for frontend
            return this._transformIrrigationData(response.data);
        } catch (error) {
            logger.error('Irrigation schedule error:', error.message);
            throw error;
        }
    }

    /**
     * Get nitrogen mineralization & fertilizer timing
     */
    async getFertilizerRecommendation(farmId, farmData, currentConditions) {
        try {
            const response = await axios.post(
                `${this.mlServiceUrl}${this.apiPrefix}/nitrogen-availability`,
                {
                    farm_data: farmData,
                    current_conditions: currentConditions
                },
                {
                    params: { farm_id: farmId },
                    timeout: 5000
                }
            );

            return this._transformFertilizerData(response.data);
        } catch (error) {
            logger.error('Fertilizer recommendation error:', error.message);
            throw error;
        }
    }

    /**
     * Get soil temperature profile & disease risk
     */
    async getTemperatureProfile(farmId, initialTemps, forecastHours = 48) {
        try {
            const response = await axios.post(
                `${this.mlServiceUrl}${this.apiPrefix}/temperature-profile`,
                null,
                {
                    params: {
                        farm_id: farmId,
                        initial_temps: initialTemps.join(','),
                        hours: forecastHours
                    },
                    timeout: 5000
                }
            );

            return response.data;
        } catch (error) {
            logger.error('Temperature profile error:', error.message);
            throw error;
        }
    }

    /**
     * Get carbon footprint & sustainability metrics
     */
    async getCarbonFootprint(farmId, farmData, annualConditions) {
        try {
            const response = await axios.post(
                `${this.mlServiceUrl}${this.apiPrefix}/carbon-footprint`,
                {
                    farm_data: farmData,
                    annual_conditions: annualConditions
                },
                {
                    params: { farm_id: farmId },
                    timeout: 5000
                }
            );

            return response.data;
        } catch (error) {
            logger.error('Carbon footprint error:', error.message);
            throw error;
        }
    }

    // Helper methods for data transformation
    _transformIrrigationData(data) {
        return {
            recommendation: {
                today: data.today,
                weeklyTotal: data.weekly_total_mm,
                waterSavings: data.weekly_savings_vs_generic_schedule,
                status: data.water_balance_status.status
            }
        };
    }

    _transformFertilizerData(data) {
        return {
            recommendation: {
                action: data.recommendation.action,
                quantity: data.recommendation.quantity_kg_per_ha,
                timing: data.recommendation.timing,
                reason: data.reason
            },
            metrics: {
                nAvailable: data.n_available_kg_per_ha,
                mineralizationRate: data.n_mineralization_rate
            }
        };
    }
}

module.exports = new SoilScienceService();
```

---

### Task 5: React Component (Days 7-8)

Create file: `frontend/src/components/SoilScienceDashboard.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './SoilScienceDashboard.css';

export default function SoilScienceDashboard({ farmId }) {
    const [soilData, setSoilData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSoilScience();
        // Refresh every 6 hours
        const interval = setInterval(fetchSoilScience, 6 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [farmId]);

    const fetchSoilScience = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/v1/farms/${farmId}/soil-science`);
            if (!response.ok) throw new Error('Failed to fetch soil data');
            const data = await response.json();
            setSoilData(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching soil science data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading soil science data...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!soilData) return <div className="error">No data available</div>;

    return (
        <div className="soil-science-dashboard">
            <h1>🌱 Soil Science Dashboard</h1>

            <div className="dashboard-grid">
                {/* Irrigation Section */}
                <div className="card irrigation-card">
                    <h2>💧 Precision Irrigation</h2>
                    <div className="metrics">
                        <div className="metric">
                            <span className="label">Today's Irrigation:</span>
                            <span className="value">{soilData.irrigation.today.irrigation_mm} mm</span>
                        </div>
                        <div className="metric">
                            <span className="label">Timing:</span>
                            <span className="value">{soilData.irrigation.today.timing}</span>
                        </div>
                        <div className="metric">
                            <span className="label">Weekly Total:</span>
                            <span className="value">{soilData.irrigation.weekly_total_mm} mm</span>
                        </div>
                        <div className="metric highlight">
                            <span className="label">Water Savings:</span>
                            <span className="value" style={{ color: '#4CAF50' }}>
                                +{soilData.irrigation.weekly_savings_vs_generic_schedule} mm
                            </span>
                        </div>
                    </div>

                    {/* Moisture Chart */}
                    {soilData.irrigation.water_balance_status && (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={soilData.irrigation.water_balance_status.daily_soil_moisture.map((val, i) => ({
                                day: i + 1,
                                moisture: val
                            }))}>
                                <CartesianGrid />
                                <XAxis dataKey="day" />
                                <YAxis label={{ value: 'Soil Moisture (mm)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="moisture" stroke="#2196F3" name="Soil Moisture" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Fertilizer Section */}
                <div className="card fertilizer-card">
                    <h2>🌾 Fertilizer Timing</h2>
                    <div className="metrics">
                        <div className="metric">
                            <span className="label">N Available:</span>
                            <span className="value">{soilData.fertilizer.n_available_kg_per_ha.toFixed(1)} kg/ha</span>
                        </div>
                        <div className={`metric ${soilData.fertilizer.apply_fertilizer ? 'alert' : 'ok'}`}>
                            <span className="label">Recommendation:</span>
                            <span className="value">
                                {soilData.fertilizer.apply_fertilizer ? '⚠️ Apply Now' : '✓ Wait'}
                            </span>
                        </div>
                        <div className="metric">
                            <span className="label">Reason:</span>
                            <span className="value-text">{soilData.fertilizer.reason}</span>
                        </div>
                        {soilData.fertilizer.apply_fertilizer && (
                            <div className="recommendation-box">
                                <p><strong>Recommendation:</strong></p>
                                <p>Fertilizer: {soilData.fertilizer.recommendation.fertilizer_type}</p>
                                <p>Quantity: {soilData.fertilizer.recommendation.quantity_kg_per_ha} kg/ha</p>
                                <p>Timing: {soilData.fertilizer.recommendation.timing}</p>
                                <p>After: {soilData.fertilizer.recommendation.post_application}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Carbon Section */}
                <div className="card carbon-card">
                    <h2>♻️ Carbon Footprint & Sustainability</h2>
                    <div className="metrics">
                        <div className="metric">
                            <span className="label">Annual Respiration:</span>
                            <span className="value">{soilData.carbon.annual_respiration_kg_co2_ha} kg CO₂/ha</span>
                        </div>
                        <div className="metric">
                            <span className="label">Sequestration:</span>
                            <span className="value" style={{ color: '#4CAF50' }}>
                                {soilData.carbon.carbon_sequestration_kg_co2_ha} kg CO₂/ha
                            </span>
                        </div>
                        <div className="metric">
                            <span className="label">Net Carbon:</span>
                            <span className="value">{soilData.carbon.net_carbon_kg_co2_ha} kg CO₂/ha</span>
                        </div>
                        <div className="metric highlight">
                            <span className="label">Carbon Credits Potential:</span>
                            <span className="value">₹{soilData.carbon.carbon_credits_potential_rupees}</span>
                        </div>
                        <div className="metric">
                            <span className="label">Sustainability Score:</span>
                            <span className="value">{soilData.carbon.sustainability_score_out_of_10}/10</span>
                        </div>
                    </div>
                </div>

                {/* Temperature Section */}
                <div className="card temperature-card">
                    <h2>🌡️ Soil Temperature Forecast</h2>
                    <div className="metrics">
                        <div className="metric">
                            <span className="label">Current Min:</span>
                            <span className="value">{soilData.temperature.min_temp_forecast}°C</span>
                        </div>
                        <div className="metric">
                            <span className="label">Current Max:</span>
                            <span className="value">{soilData.temperature.max_temp_forecast}°C</span>
                        </div>
                        <div className="metric">
                            <span className="label">Temperature Range:</span>
                            <span className="value">{soilData.temperature.temp_range}°C</span>
                        </div>
                        <div className="recommendation-box">
                            <p><strong>Disease Risk:</strong></p>
                            <p>Fungal: <span className={soilData.temperature.disease_risk.fungal === 'high' ? 'high-risk' : 'low-risk'}>
                                {soilData.temperature.disease_risk.fungal.toUpperCase()}
                            </span></p>
                            <p>Bacterial: <span className={soilData.temperature.disease_risk.bacterial === 'high' ? 'high-risk' : 'low-risk'}>
                                {soilData.temperature.disease_risk.bacterial.toUpperCase()}
                            </span></p>
                            <p>{soilData.temperature.disease_risk.recommendation}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Section */}
            <div className="summary-card">
                <h2>📊 Weekly Summary & Farmer Value</h2>
                <div className="summary-metrics">
                    <div className="summary-item">
                        <span className="label">Water Savings This Week:</span>
                        <span className="value savings">+{soilData.irrigation.weekly_savings_vs_generic_schedule} mm</span>
                        <span className="sublabel">₹{(soilData.irrigation.weekly_savings_vs_generic_schedule * 50).toFixed(0)} potential savings</span>
                    </div>
                    <div className="summary-item">
                        <span className="label">Fertilizer Optimization:</span>
                        <span className="value">Science-backed timing</span>
                        <span className="sublabel">Reduce runoff by ~40%</span>
                    </div>
                    <div className="summary-item">
                        <span className="label">Carbon Credits:</span>
                        <span className="value">₹{soilData.carbon.carbon_credits_potential_rupees}/year</span>
                        <span className="sublabel">Sustainability premium</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

Create file: `frontend/src/components/SoilScienceDashboard.css`

```css
.soil-science-dashboard {
    padding: 20px;
    background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
    border-radius: 8px;
}

.soil-science-dashboard h1 {
    color: #2e7d32;
    margin-bottom: 20px;
    font-size: 28px;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card h2 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #1b5e20;
    border-bottom: 2px solid #81c784;
    padding-bottom: 10px;
}

.metrics {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.metric {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 4px;
}

.metric .label {
    font-weight: 600;
    color: #555;
}

.metric .value {
    font-size: 18px;
    font-weight: bold;
    color: #2196F3;
}

.metric .value-text {
    font-size: 14px;
    color: #666;
}

.metric.highlight {
    background: #e8f5e9;
    border-left: 4px solid #4CAF50;
}

.metric.alert {
    background: #fff3e0;
}

.metric.alert .value {
    color: #FF9800;
}

.metric.ok {
    background: #e8f5e9;
}

.metric.ok .value {
    color: #4CAF50;
}

.recommendation-box {
    background: #f0f7ff;
    border-left: 4px solid #2196F3;
    padding: 12px;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.6;
}

.recommendation-box p {
    margin: 5px 0;
}

.recommendation-box strong {
    color: #1976d2;
}

.high-risk {
    color: #d32f2f;
    font-weight: bold;
}

.low-risk {
    color: #388e3c;
    font-weight: bold;
}

.summary-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-top: 4px solid #2e7d32;
}

.summary-card h2 {
    margin-top: 0;
    color: #1b5e20;
}

.summary-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.summary-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 15px;
    background: #f5f5f5;
    border-radius: 4px;
}

.summary-item .label {
    font-size: 12px;
    color: #777;
    text-transform: uppercase;
    font-weight: 600;
}

.summary-item .value {
    font-size: 20px;
    font-weight: bold;
    color: #2196F3;
}

.summary-item .value.savings {
    color: #4CAF50;
}

.summary-item .sublabel {
    font-size: 12px;
    color: #999;
}

.loading,
.error {
    padding: 20px;
    text-align: center;
    background: white;
    border-radius: 8px;
    font-size: 16px;
}

.error {
    color: #d32f2f;
    background: #ffebee;
}
```

---

### Task 6: Testing (Day 9)

Create file: `backend/ml-service/tests/test_soil_science.py`

```python
"""
Unit tests for Soil Science Service
"""

import pytest
import numpy as np
from services.soil_science_service import SoilScienceService


class TestSoilScienceService:
    
    @pytest.fixture
    def service(self):
        return SoilScienceService()
    
    @pytest.fixture
    def sample_farm_data(self):
        return {
            'precipitation': [10, 5, 0, 3, 0, 0, 2],
            'et_ref': [3, 3, 3, 3.5, 4, 3.5, 3],
            'available_water_capacity': 100,
            'current_soil_moisture': 80,
            'soil_organic_carbon': 10,
            'c_n_ratio': 12.0
        }
    
    @pytest.fixture
    def sample_conditions(self):
        return {
            'soil_temperature': 25,
            'soil_moisture': 0.5,
            'annual_avg_temp': 22
        }

    def test_water_balance_calculation(self, service, sample_farm_data):
        result = service.calculate_water_balance(sample_farm_data)
        
        assert 'daily_soil_moisture' in result
        assert 'daily_irrigation_need' in result
        assert 'current_moisture' in result
        assert len(result['daily_soil_moisture']) == 7
        assert result['current_moisture'] <= sample_farm_data['available_water_capacity']

    def test_irrigation_schedule(self, service, sample_farm_data):
        weather_forecast = {
            'temperature': [25, 26, 24, 23, 22, 21, 20]
        }
        result = service.get_irrigation_schedule(sample_farm_data, weather_forecast)
        
        assert 'today' in result
        assert 'irrigation_mm' in result['today']
        assert 'timing' in result['today']
        assert 'weekly_total_mm' in result

    def test_nitrogen_availability(self, service, sample_farm_data, sample_conditions):
        result = service.get_nitrogen_availability(sample_farm_data, sample_conditions)
        
        assert 'n_mineralization_rate' in result
        assert 'n_available_kg_per_ha' in result
        assert 'apply_fertilizer' in result
        assert 'reason' in result
        assert result['n_available_kg_per_ha'] >= 0

    def test_soil_temperature_profile(self, service):
        initial_temps = [20.0, 19.5, 19.0, 18.5, 18.0]
        result = service.get_soil_temperature_profile(initial_temps, 48)
        
        assert 'current_profile' in result
        assert 'profile_48_hours' in result
        assert 'min_temp_forecast' in result
        assert 'max_temp_forecast' in result
        assert 'disease_risk' in result

    def test_carbon_footprint(self, service, sample_farm_data, sample_conditions):
        result = service.get_carbon_footprint(sample_farm_data, sample_conditions)
        
        assert 'annual_respiration_kg_co2_ha' in result
        assert 'net_carbon_kg_co2_ha' in result
        assert 'carbon_credits_potential_rupees' in result
        assert result['sustainability_score_out_of_10'] >= 0
        assert result['sustainability_score_out_of_10'] <= 10

    def test_all_recommendations(self, service, sample_farm_data, sample_conditions):
        weather_forecast = {}
        result = service.get_all_recommendations(
            'farm_123',
            sample_farm_data,
            weather_forecast,
            sample_conditions
        )
        
        assert 'farm_id' in result
        assert 'irrigation' in result
        assert 'fertilizer' in result
        assert 'temperature' in result
        assert 'carbon' in result
```

Run tests:
```bash
cd backend/ml-service
pytest tests/test_soil_science.py -v
```

---

## ✅ Phase 1 Completion Checklist

- [ ] Module copied to `libs/soil_science/`
- [ ] Python service created (`soil_science_service.py`)
- [ ] FastAPI endpoints working
- [ ] Unit tests passing (>90% coverage)
- [ ] Node.js integration complete
- [ ] React component rendering
- [ ] API documentation updated
- [ ] Docker image built
- [ ] Deployed to staging
- [ ] Testing with 5-10 farms
- [ ] Documentation complete
- [ ] Ready for production

---

## 🚀 Next Steps After Phase 1

1. **Week 4:** Deploy to production (50% farms)
2. **Week 5:** Expand to 100% of farms
3. **Week 6:** Gather farmer feedback
4. **Week 7-8:** Start Phase 2 (advanced features)

---

## 📞 Support

Issues or questions? Refer to:
- [SOIL_SCIENCE_INTEGRATION_ANALYSIS.md](SOIL_SCIENCE_INTEGRATION_ANALYSIS.md) - Full analysis
- [soil_science module README](../../PythonToolsForSoilScienceModeling/README.md) - Scientific docs
- Scientific references in code comments

---

**Status: Ready to Implement** ✅  
**Estimated Time: 2-3 weeks** ⏱️  
**Team: 1-2 engineers** 👨‍💻  
**Expected Value: ₹17-27k per farm per season** 💰
