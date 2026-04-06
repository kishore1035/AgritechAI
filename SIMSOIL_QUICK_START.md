# 🌱 SimSoil Integration - Quick Start Guide

**Phase 3: Hourly Soil Moisture Prediction**

**Timeline:** 2-4 weeks  
**Team:** 1 backend engineer  
**Status:** Ready to start

---

## 📋 Phase 3 Tasks

### Task 1: Copy & Setup Module (Day 1)

#### Step 1.1: Copy SimSoil Module
```bash
cd c:\Users\PREETHI\Downloads\agritech-ai

# Create libs directory for simsoil
mkdir -p backend\ml-service\libs

# Copy module
cp -r "c:\Users\PREETHI\Downloads\simsoil-main\simsoil-main\simsoil" \
   "backend\ml-service\libs\"
```

#### Step 1.2: Verify Installation
```bash
cd backend/ml-service
ls -la libs/simsoil/

# Should show:
# core.py, transpiration.py, tests/, __init__.py
```

#### Step 1.3: Update Dependencies
```bash
# Add to backend/ml-service/requirements.txt:
# scipy>=1.3
# numpy>=1.13.3
# cached-property>=1.5.1  (or functools.cached_property for Python 3.8+)

pip install scipy numpy cached-property
```

#### Step 1.4: Test Import
```python
# Create test_simsoil_import.py
from libs.simsoil.core import InfiltrationModel, SoilProfile
from libs.simsoil.transpiration import potential_transpiration

print("✅ All SimSoil imports successful!")
```

---

### Task 2: Create Python Service (Days 2-3)

Create file: `backend/ml-service/services/soil_moisture_service.py`

```python
"""
Soil Moisture Prediction Service
Simulates hourly soil moisture using SimSoil
"""

from typing import Dict, List, Optional, Tuple
import numpy as np
from datetime import datetime, timedelta

from libs.simsoil.core import InfiltrationModel, SoilProfile, DEPTHS
from libs.simsoil.transpiration import (
    potential_transpiration, canopy_evaporation, radiation_net
)


class SoilMoistureService:
    """
    Service for hourly soil moisture simulation using SimSoil
    
    Handles:
    - Soil profile setup with van Genuchten parameters
    - Weather data integration
    - Transpiration calculations
    - Infiltration modeling
    - Water balance simulation
    """

    def __init__(self):
        self.SECONDS_PER_DAY = 86400
        self.HOURS_PER_DAY = 24

    def create_simsoil_profile(
        self,
        soil_data: Dict
    ) -> SoilProfile:
        """
        Create a SimSoil SoilProfile from AgriTech soil data
        
        Args:
            soil_data: Dictionary with soil properties from SimpleSoilProfile
            {
                'layers': [
                    {
                        'name': 'Topsoil',
                        'thickness_cm': 30,
                        'theta_res': 0.02,
                        'theta_sat': 0.4,
                        'alpha': 0.02,
                        'n': 1.5,
                        'k_sat': 10.0,
                        'clay_content': 10,
                        ...
                    },
                    ...
                ]
            }
        """
        try:
            # Extract soil properties
            layers = soil_data.get('layers', [])
            n_layers = len(layers)
            
            # Create van Genuchten parameter arrays
            theta_res = np.array([
                layer.get('theta_res', 0.05) 
                for layer in layers
            ]).reshape((n_layers, 1))
            
            theta_sat = np.array([
                layer.get('theta_sat', 0.45) 
                for layer in layers
            ]).reshape((n_layers, 1))
            
            alpha = np.array([
                layer.get('alpha', 0.01) 
                for layer in layers
            ]).reshape((n_layers, 1))
            
            n = np.array([
                layer.get('n', 1.4) 
                for layer in layers
            ]).reshape((n_layers, 1))
            
            k_sat = np.array([
                layer.get('k_sat', 5.0) 
                for layer in layers
            ]).reshape((n_layers, 1))
            
            # Create SoilProfile
            profile = SoilProfile(
                theta_res=theta_res,
                theta_sat=theta_sat,
                alpha=alpha,
                n=n,
                k_sat=k_sat,
                depths=DEPTHS[:n_layers]
            )
            
            return profile

        except Exception as e:
            raise ValueError(f"Failed to create SimSoil profile: {str(e)}")

    def calculate_daily_transpiration(
        self,
        lai: float,
        temp_k: float,
        humidity: float,
        pressure: float,
        vpd: float,
        fpar: float = 0.8,
        rad_net: float = 400.0
    ) -> float:
        """
        Calculate daily potential transpiration (PET) using MOD16 approach
        
        Args:
            lai: Leaf Area Index
            temp_k: Temperature in Kelvin
            humidity: Relative humidity (0-1)
            pressure: Air pressure in Pascals
            vpd: Vapor Pressure Deficit in Pascals
            fpar: Fraction of PAR absorbed (default 0.8)
            rad_net: Net radiation in J/m2/s
        
        Returns:
            PET in kg/m2/sec
        """
        try:
            # Calculate canopy evaporation
            e_canopy = canopy_evaporation(
                pressure=pressure,
                temp_k=temp_k,
                rhumidity=humidity,
                vpd=vpd,
                lai=lai,
                fpar=fpar,
                rad_canopy=rad_net
            )
            
            # Calculate transpiration (simplified)
            transpiration = e_canopy * 0.6  # Approximate transpiration fraction
            
            return transpiration

        except Exception as e:
            raise ValueError(f"Failed to calculate transpiration: {str(e)}")

    def simulate_soil_moisture(
        self,
        soil_profile: SoilProfile,
        initial_vwc: np.ndarray,
        daily_data: List[Dict],
        n_days: int,
        adaptive: bool = True
    ) -> Tuple[np.ndarray, np.ndarray, Optional[np.ndarray]]:
        """
        Run SimSoil infiltration model to get hourly soil moisture
        
        Args:
            soil_profile: SoilProfile object from SimpleSoilProfile
            initial_vwc: Initial volumetric water content (depth x 1)
            daily_data: List of daily weather dictionaries:
            [
                {
                    'infiltration': mm (surface water input),
                    'transpiration': kg/m2/sec (PET),
                    'temperature_profile': [T1, T2, ...] in K,
                    'f_saturated': fraction (0-1)
                },
                ...
            ]
            n_days: Number of days to simulate
            adaptive: Use adaptive timesteps (default True)
        
        Returns:
            Tuple of (vwc_timeseries, error, matric_potential)
            - vwc_timeseries: (layers x days) array
            - error: (layers x days) estimated error
            - matric_potential: (layers x days) or None
        """
        try:
            # Initialize infiltration model
            model = InfiltrationModel(
                soil_model=soil_profile,
                dt_min=10,  # Minimum 10-second timestep
                debug=True   # Enable matric potential calculation
            )
            
            # Extract weather sequences
            infiltration = np.array([
                d.get('infiltration', 0) / (self.SECONDS_PER_DAY * 1000)  # Convert mm to m/s
                for d in daily_data
            ])
            
            transpiration = np.array([
                d.get('transpiration', 0)
                for d in daily_data
            ])
            
            temp_profiles = np.array([
                d.get('temperature_profile', [273.15] * soil_profile.n_layers)
                for d in daily_data
            ])
            
            f_saturated = np.array([
                d.get('f_saturated', 0.0)
                for d in daily_data
            ])
            
            # Run simulation
            vwc, error, psi = model.run(
                vwc=initial_vwc,
                temp_profile=temp_profiles,
                transpiration=transpiration,
                influx=infiltration,
                f_saturated=f_saturated,
                dt=3600,  # 1-hour timestep
                n_days=n_days,
                adaptive=adaptive
            )
            
            return vwc, error, psi

        except Exception as e:
            raise ValueError(f"SimSoil simulation failed: {str(e)}")

    def calculate_available_water(
        self,
        vwc_profile: np.ndarray,
        soil_data: Dict
    ) -> np.ndarray:
        """
        Calculate plant-available water for irrigation scheduling
        
        Available water = (VWC - Wilting Point) / (Field Capacity - Wilting Point)
        """
        try:
            layers = soil_data.get('layers', [])
            available_water = []
            
            for i, vwc in enumerate(vwc_profile):
                layer = layers[i] if i < len(layers) else layers[-1]
                
                # Get wilting point and field capacity
                wp = layer.get('wilting_point', 0.1)
                fc = layer.get('field_capacity', 0.3)
                
                # Calculate available water fraction
                if vwc < wp:
                    aw = 0.0  # Plant stressed
                elif vwc > fc:
                    aw = 1.0  # Maximum available
                else:
                    aw = (vwc - wp) / (fc - wp)
                
                available_water.append(aw)
            
            return np.array(available_water)

        except Exception as e:
            raise ValueError(f"Failed to calculate available water: {str(e)}")

    def find_irrigation_windows(
        self,
        vwc_timeseries: np.ndarray,
        soil_data: Dict,
        threshold_fraction: float = 0.5
    ) -> List[Dict]:
        """
        Identify optimal irrigation windows from moisture timeseries
        
        Args:
            vwc_timeseries: (layers x days) moisture array
            soil_data: Soil properties including field capacity
            threshold_fraction: Trigger irrigation when available water drops below this
        
        Returns:
            List of irrigation recommendations with timing
        """
        try:
            recommendations = []
            root_zone_layer = 0  # Top layer (root zone)
            
            layers = soil_data.get('layers', [])
            root_layer = layers[root_zone_layer]
            
            fc = root_layer.get('field_capacity', 0.3)
            threshold_vwc = fc * threshold_fraction
            
            # Find days when irrigation is recommended
            for day, vwc in enumerate(vwc_timeseries[root_zone_layer]):
                if vwc < threshold_vwc:
                    recommendations.append({
                        'day': day,
                        'current_vwc': vwc,
                        'threshold_vwc': threshold_vwc,
                        'urgency': 'high' if vwc < threshold_vwc * 0.5 else 'medium',
                        'estimated_water_needed_mm': (fc - vwc) * 1000
                    })
            
            return recommendations

        except Exception as e:
            raise ValueError(f"Failed to find irrigation windows: {str(e)}")

    def generate_moisture_report(
        self,
        farm_id: str,
        vwc_timeseries: np.ndarray,
        daily_data: List[Dict],
        soil_data: Dict
    ) -> Dict:
        """
        Generate comprehensive soil moisture report
        """
        try:
            n_layers = vwc_timeseries.shape[0]
            n_days = vwc_timeseries.shape[1]
            
            report = {
                'farm_id': farm_id,
                'simulation_period': f"{n_days} days",
                'n_layers': n_layers,
                'generated_at': datetime.now().isoformat(),
                'layer_summary': [],
                'drought_risk': self._assess_drought_risk(vwc_timeseries),
                'waterlogging_risk': self._assess_waterlogging_risk(vwc_timeseries),
                'irrigation_schedule': self.find_irrigation_windows(
                    vwc_timeseries, soil_data
                )
            }
            
            # Layer-by-layer summary
            for layer_idx in range(n_layers):
                vwc_layer = vwc_timeseries[layer_idx]
                report['layer_summary'].append({
                    'layer': layer_idx,
                    'avg_vwc': float(np.mean(vwc_layer)),
                    'min_vwc': float(np.min(vwc_layer)),
                    'max_vwc': float(np.max(vwc_layer)),
                    'std_vwc': float(np.std(vwc_layer))
                })
            
            return report

        except Exception as e:
            raise ValueError(f"Failed to generate report: {str(e)}")

    @staticmethod
    def _assess_drought_risk(vwc_timeseries: np.ndarray) -> Dict:
        """Assess drought risk based on moisture trends"""
        root_zone = vwc_timeseries[0]
        min_vwc = np.min(root_zone)
        avg_vwc = np.mean(root_zone)
        
        if min_vwc < 0.1 or avg_vwc < 0.15:
            return {'risk_level': 'HIGH', 'action_needed': True}
        elif min_vwc < 0.15 or avg_vwc < 0.25:
            return {'risk_level': 'MEDIUM', 'action_needed': False}
        else:
            return {'risk_level': 'LOW', 'action_needed': False}

    @staticmethod
    def _assess_waterlogging_risk(vwc_timeseries: np.ndarray) -> Dict:
        """Assess waterlogging/drainage risk"""
        root_zone = vwc_timeseries[0]
        max_vwc = np.max(root_zone)
        avg_vwc = np.mean(root_zone)
        
        if max_vwc > 0.45 or avg_vwc > 0.40:
            return {'risk_level': 'HIGH', 'drainage_needed': True}
        elif max_vwc > 0.40:
            return {'risk_level': 'MEDIUM', 'drainage_needed': False}
        else:
            return {'risk_level': 'LOW', 'drainage_needed': False}
```

---

### Task 3: Create FastAPI Endpoints (Day 4)

Create file: `backend/ml-service/routes/soil_moisture_routes.py`

```python
"""
FastAPI Routes for Soil Moisture Simulation
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Dict, List
import numpy as np

from services.soil_moisture_service import SoilMoistureService

router = APIRouter(
    prefix="/api/v1/soil-moisture",
    tags=["Soil Moisture"]
)

moisture_service = SoilMoistureService()


@router.post("/simulate")
async def simulate_soil_moisture(farm_id: str, days: int = Query(30)):
    """
    Simulate hourly soil moisture for next N days
    
    Query parameters:
    - farm_id: Farm identifier
    - days: Number of days to simulate (default 30)
    
    Returns hourly moisture predictions
    """
    try:
        # Load soil profile
        soil_profile = get_soil_profile_simsoil(farm_id)
        
        # Load current soil moisture
        current_vwc = get_current_soil_moisture(farm_id)
        
        # Get weather forecast
        daily_weather = get_weather_forecast(farm_id, days)
        
        # Run simulation
        vwc_ts, error, psi = moisture_service.simulate_soil_moisture(
            soil_profile=soil_profile,
            initial_vwc=current_vwc,
            daily_data=daily_weather,
            n_days=days,
            adaptive=True
        )
        
        # Convert to JSON-serializable format
        return {
            "farm_id": farm_id,
            "simulation_days": days,
            "hourly_vwc": vwc_ts.tolist(),
            "error_estimate": error.tolist() if error is not None else None,
            "matric_potential": psi.tolist() if psi is not None else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/available-water/{farm_id}")
async def get_available_water(farm_id: str, day: int = Query(0)):
    """
    Get plant-available water fraction for specific day
    
    Returns: Available water as fraction (0-1)
    """
    try:
        soil_data = get_soil_data(farm_id)
        vwc_ts = get_simulated_moisture(farm_id)
        
        available_water = moisture_service.calculate_available_water(
            vwc_ts[:, day],
            soil_data
        )
        
        return {
            "farm_id": farm_id,
            "day": day,
            "available_water_by_layer": available_water.tolist()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/irrigation-schedule/{farm_id}")
async def get_irrigation_schedule(farm_id: str, threshold: float = Query(0.5)):
    """
    Get recommended irrigation schedule
    
    Args:
        threshold: Trigger irrigation at this fraction of field capacity
    
    Returns: List of irrigation recommendations
    """
    try:
        soil_data = get_soil_data(farm_id)
        vwc_ts = get_simulated_moisture(farm_id)
        
        schedule = moisture_service.find_irrigation_windows(
            vwc_ts,
            soil_data,
            threshold
        )
        
        return {
            "farm_id": farm_id,
            "threshold_fraction": threshold,
            "irrigation_windows": schedule,
            "total_recommendations": len(schedule)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/moisture-report/{farm_id}")
async def get_moisture_report(farm_id: str):
    """
    Get comprehensive soil moisture report
    """
    try:
        soil_data = get_soil_data(farm_id)
        daily_weather = get_current_weather(farm_id)
        vwc_ts = get_simulated_moisture(farm_id)
        
        report = moisture_service.generate_moisture_report(
            farm_id=farm_id,
            vwc_timeseries=vwc_ts,
            daily_data=daily_weather,
            soil_data=soil_data
        )
        
        return report
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/drought-alert/{farm_id}")
async def check_drought_alert(farm_id: str):
    """
    Check if farm is at drought risk
    """
    try:
        vwc_ts = get_simulated_moisture(farm_id)
        drought_risk = moisture_service._assess_drought_risk(vwc_ts)
        
        return {
            "farm_id": farm_id,
            "drought_risk": drought_risk,
            "alert_active": drought_risk['action_needed']
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "service": "soil-moisture",
        "features": [
            "moisture-simulation",
            "irrigation-scheduling",
            "drought-alerts",
            "available-water",
            "moisture-reports"
        ]
    }


# Helper functions
def get_soil_profile_simsoil(farm_id: str):
    """Load soil profile in SimSoil format"""
    # TODO: Load from SimpleSoilProfile and convert
    pass

def get_current_soil_moisture(farm_id: str):
    """Get current soil moisture state"""
    # TODO: Load from database
    pass

def get_weather_forecast(farm_id: str, days: int):
    """Get weather forecast"""
    # TODO: Integrate with weather service
    pass

def get_soil_data(farm_id: str):
    """Get soil properties"""
    # TODO: Load from database
    pass

def get_simulated_moisture(farm_id: str):
    """Get previously simulated moisture timeseries"""
    # TODO: Load from cache/database
    pass

def get_current_weather(farm_id: str):
    """Get current weather data"""
    # TODO: Load from weather service
    pass
```

---

### Task 4: React Component (Days 5-6)

Create file: `frontend/src/components/SoilMoistureViewer.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import './SoilMoistureViewer.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function SoilMoistureViewer({ farmId }) {
    const [moisture, setMoisture] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [report, setReport] = useState(null);
    const [droughtAlert, setDroughtAlert] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMoistureData();
    }, [farmId]);

    const fetchMoistureData = async () => {
        try {
            setLoading(true);
            const [moistureRes, scheduleRes, reportRes, droughtRes] = await Promise.all([
                fetch(`/api/v1/soil-moisture/simulate?farm_id=${farmId}&days=30`),
                fetch(`/api/v1/soil-moisture/irrigation-schedule/${farmId}`),
                fetch(`/api/v1/soil-moisture/moisture-report/${farmId}`),
                fetch(`/api/v1/soil-moisture/drought-alert/${farmId}`)
            ]);

            const moistureData = await moistureRes.json();
            const scheduleData = await scheduleRes.json();
            const reportData = await reportRes.json();
            const droughtData = await droughtRes.json();

            setMoisture(moistureData);
            setSchedule(scheduleData.irrigation_windows || []);
            setReport(reportData);
            setDroughtAlert(droughtData.alert_active);

        } catch (error) {
            console.error('Error fetching moisture data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Simulating soil moisture...</div>;
    if (!moisture) return <div className="error">No moisture data</div>;

    return (
        <div className="soil-moisture-viewer">
            <h1>💧 Soil Moisture Prediction</h1>

            {droughtAlert && (
                <div className="drought-alert">
                    ⚠️ Drought Risk Alert! Consider increasing irrigation.
                </div>
            )}

            {/* Moisture Timeseries Chart */}
            <div className="moisture-chart">
                <h3>30-Day Soil Moisture Forecast</h3>
                <LineChart width={800} height={300} data={formatChartData(moisture)}>
                    <CartesianGrid />
                    <XAxis dataKey="day" />
                    <YAxis label={{ value: 'VWC (m³/m³)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="layer0" stroke="#8B4513" name="Top Soil" />
                    <Line type="monotone" dataKey="layer1" stroke="#CD853F" name="Middle Soil" />
                    <Line type="monotone" dataKey="layer2" stroke="#DEB887" name="Deep Soil" />
                </LineChart>
            </div>

            {/* Irrigation Schedule */}
            <div className="irrigation-schedule">
                <h3>Recommended Irrigation Schedule</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Current VWC</th>
                            <th>Urgency</th>
                            <th>Water Needed (mm)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.map((rec, idx) => (
                            <tr key={idx} className={`urgency-${rec.urgency}`}>
                                <td>Day {rec.day}</td>
                                <td>{rec.current_vwc.toFixed(3)}</td>
                                <td>{rec.urgency.toUpperCase()}</td>
                                <td>{rec.estimated_water_needed_mm.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary Statistics */}
            {report && (
                <div className="summary-stats">
                    <h3>Moisture Summary</h3>
                    <div className="stats-grid">
                        {report.layer_summary.map((layer, idx) => (
                            <div key={idx} className="stat-card">
                                <h4>Layer {idx}</h4>
                                <p>Avg: {layer.avg_vwc.toFixed(3)}</p>
                                <p>Min: {layer.min_vwc.toFixed(3)}</p>
                                <p>Max: {layer.max_vwc.toFixed(3)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Risk Assessment */}
            {report && (
                <div className="risk-assessment">
                    <div className={`risk-card drought-${report.drought_risk.risk_level.toLowerCase()}`}>
                        <h4>Drought Risk: {report.drought_risk.risk_level}</h4>
                    </div>
                    <div className={`risk-card waterlog-${report.waterlogging_risk.risk_level.toLowerCase()}`}>
                        <h4>Waterlogging Risk: {report.waterlogging_risk.risk_level}</h4>
                    </div>
                </div>
            )}
        </div>
    );
}

function formatChartData(moisture) {
    const days = moisture.hourly_vwc[0].length;
    return Array.from({ length: days }, (_, day) => ({
        day,
        layer0: moisture.hourly_vwc[0][day],
        layer1: moisture.hourly_vwc[1]?.[day] || 0,
        layer2: moisture.hourly_vwc[2]?.[day] || 0,
    }));
}
```

Create file: `frontend/src/components/SoilMoistureViewer.css`

```css
.soil-moisture-viewer {
    padding: 20px;
    background: #f5f5f5;
}

.soil-moisture-viewer h1 {
    color: #1976d2;
    margin-bottom: 20px;
}

.drought-alert {
    background: #ffebee;
    color: #c62828;
    padding: 15px;
    border-left: 4px solid #c62828;
    margin-bottom: 20px;
    border-radius: 4px;
    font-weight: 600;
}

.moisture-chart {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.moisture-chart h3 {
    color: #1976d2;
    margin-bottom: 15px;
}

.irrigation-schedule {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.irrigation-schedule h3 {
    color: #1976d2;
    margin-bottom: 15px;
}

.irrigation-schedule table {
    width: 100%;
    border-collapse: collapse;
}

.irrigation-schedule th {
    background: #e3f2fd;
    padding: 10px;
    text-align: left;
    font-weight: 600;
    color: #0d47a1;
}

.irrigation-schedule td {
    padding: 10px;
    border-bottom: 1px solid #eee;
}

.urgency-high {
    background: #fff3e0;
}

.urgency-medium {
    background: #f5f5f5;
}

.summary-stats {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-stats h3 {
    color: #1976d2;
    margin-bottom: 15px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
}

.stat-card {
    background: #f9f9f9;
    padding: 15px;
    border-left: 4px solid #1976d2;
    border-radius: 4px;
}

.stat-card h4 {
    margin-top: 0;
    color: #1976d2;
}

.stat-card p {
    margin: 5px 0;
    font-size: 14px;
}

.risk-assessment {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.risk-card {
    padding: 15px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.risk-card h4 {
    margin: 0;
}

.drought-high {
    background: #c62828;
}

.drought-medium {
    background: #f57c00;
}

.drought-low {
    background: #388e3c;
}

.waterlog-high {
    background: #1565c0;
}

.waterlog-medium {
    background: #0277bd;
}

.waterlog-low {
    background: #388e3c;
}

.loading {
    padding: 40px;
    text-align: center;
    background: white;
    border-radius: 8px;
    font-size: 16px;
    color: #666;
}

.error {
    padding: 20px;
    background: #ffebee;
    color: #c62828;
    border-radius: 8px;
}
```

---

### Task 5: Database Schema (Day 7)

```sql
-- File: backend/migrations/add_soil_moisture.sql

CREATE TABLE soil_moisture_timeseries (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER NOT NULL,
    simulation_date TIMESTAMP NOT NULL,
    day INTEGER NOT NULL,
    layer_0_vwc FLOAT,
    layer_1_vwc FLOAT,
    layer_2_vwc FLOAT,
    layer_3_vwc FLOAT,
    layer_4_vwc FLOAT,
    layer_5_vwc FLOAT,
    available_water_fraction FLOAT,
    matric_potential_layer_0 FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_id) REFERENCES farms(id)
);

CREATE TABLE irrigation_recommendations (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER NOT NULL,
    recommended_date DATE NOT NULL,
    urgency VARCHAR(20),
    estimated_water_needed_mm FLOAT,
    confidence_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_at TIMESTAMP,
    
    FOREIGN KEY (farm_id) REFERENCES farms(id)
);

CREATE INDEX idx_soil_moisture_farm_date 
  ON soil_moisture_timeseries(farm_id, simulation_date);
CREATE INDEX idx_irrigation_farm_date 
  ON irrigation_recommendations(farm_id, recommended_date);
```

---

### Task 6: Testing (Day 8)

Create file: `backend/ml-service/tests/test_soil_moisture.py`

```python
import pytest
import numpy as np
from services.soil_moisture_service import SoilMoistureService


class TestSoilMoistureService:
    
    @pytest.fixture
    def service(self):
        return SoilMoistureService()
    
    @pytest.fixture
    def sample_soil_data(self):
        return {
            'layers': [
                {
                    'name': 'Topsoil',
                    'thickness_cm': 30,
                    'theta_res': 0.02,
                    'theta_sat': 0.4,
                    'alpha': 0.02,
                    'n': 1.5,
                    'k_sat': 10.0,
                    'field_capacity': 0.30,
                    'wilting_point': 0.10
                },
                {
                    'name': 'Subsoil',
                    'thickness_cm': 70,
                    'theta_res': 0.05,
                    'theta_sat': 0.45,
                    'alpha': 0.01,
                    'n': 1.3,
                    'k_sat': 5.0,
                    'field_capacity': 0.35,
                    'wilting_point': 0.15
                }
            ]
        }

    def test_calculate_transpiration(self, service):
        et = service.calculate_daily_transpiration(
            lai=3.0,
            temp_k=293.15,
            humidity=0.6,
            pressure=101325,
            vpd=1500
        )
        
        assert et > 0
        assert et < 0.001  # Reasonable value in kg/m2/sec

    def test_available_water_calculation(self, service, sample_soil_data):
        vwc_profile = np.array([0.25, 0.30])  # Between WP and FC
        
        aw = service.calculate_available_water(vwc_profile, sample_soil_data)
        
        assert len(aw) == 2
        assert 0 <= aw[0] <= 1
        assert 0 <= aw[1] <= 1

    def test_irrigation_window_detection(self, service, sample_soil_data):
        # Create moisture series trending downward
        vwc_ts = np.array([
            [0.30, 0.28, 0.25, 0.20, 0.15, 0.12],  # Layer 0
            [0.35, 0.34, 0.32, 0.30, 0.28, 0.26]   # Layer 1
        ])
        
        windows = service.find_irrigation_windows(vwc_ts, sample_soil_data, 0.5)
        
        assert len(windows) > 0
        assert windows[0]['day'] >= 0

    def test_drought_assessment(self, service):
        # Low moisture scenario
        vwc_ts = np.array([[0.08, 0.07, 0.06]])
        
        risk = service._assess_drought_risk(vwc_ts)
        
        assert risk['risk_level'] == 'HIGH'
        assert risk['action_needed'] == True

    def test_moisture_report_generation(self, service, sample_soil_data):
        vwc_ts = np.array([
            [0.25, 0.24, 0.23],
            [0.30, 0.29, 0.28]
        ])
        
        daily_data = [
            {'infiltration': 10, 'transpiration': 0.00001, 'temperature_profile': [293.15, 290.15], 'f_saturated': 0},
            {'infiltration': 0, 'transpiration': 0.00002, 'temperature_profile': [293.15, 290.15], 'f_saturated': 0},
            {'infiltration': 5, 'transpiration': 0.00001, 'temperature_profile': [293.15, 290.15], 'f_saturated': 0}
        ]
        
        report = service.generate_moisture_report(
            'farm_1',
            vwc_ts,
            daily_data,
            sample_soil_data
        )
        
        assert report['farm_id'] == 'farm_1'
        assert 'layer_summary' in report
        assert 'drought_risk' in report
        assert 'irrigation_schedule' in report
```

---

## ✅ Phase 3 Completion Checklist

- [ ] Module copied to `libs/simsoil/`
- [ ] Dependencies installed
- [ ] Python service created (`soil_moisture_service.py`)
- [ ] FastAPI endpoints working (5 endpoints)
- [ ] React component rendering
- [ ] Database schema created
- [ ] Unit tests passing
- [ ] Integration with SimpleSoilProfile working
- [ ] Integration with weather service working
- [ ] Ready for production

---

## 📊 Success Metrics

**Week 1-2:**
- [ ] Service deployed
- [ ] 10 test farms simulated
- [ ] Accuracy validated vs field data
- [ ] 0 critical bugs

**Week 3-4:**
- [ ] 30 farms using SimSoil
- [ ] Irrigation recommendations accurate (90%+)
- [ ] Farmer satisfaction 8+/10
- [ ] Revenue ₹15k/month

---

**Status: Ready to Implement** ✅  
**Estimated Time: 2-4 weeks** ⏱️  
**Team: 1 engineer** 👨‍💻
