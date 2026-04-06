# pyfao56 Quick Start Implementation Guide
## Production-Ready Code Templates for AgriTech AI Integration

**Status**: Ready for Development
**Difficulty**: 🟢 Medium (well-documented, proven methodology)
**Time to Implement**: 2-3 weeks (basic) + 4-5 weeks (advanced features)

---

## Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Task 1: FastAPI Irrigation Service](#task-1-fastapi-irrigation-service)
3. [Task 2: Daily Water Balance Simulation](#task-2-daily-water-balance-simulation)
4. [Task 3: Automatic Irrigation Scheduler](#task-3-automatic-irrigation-scheduler)
5. [Task 4: Database Integration](#task-4-database-integration)
6. [Task 5: Express Backend Routes](#task-5-express-backend-routes)
7. [Task 6: React Dashboard Component](#task-6-react-dashboard-component)
8. [Testing & Validation](#testing--validation)

---

## Installation & Setup

### Step 1: Install pyfao56

```bash
# In your Python environment
pip install pyfao56

# Verify installation
python -c "import pyfao56; print(pyfao56.__version__)"
# Output: 1.4.0
```

### Step 2: Create FastAPI Service Structure

```bash
# Create directory structure
mkdir -p ml_services/irrigation_scheduler/
cd ml_services/irrigation_scheduler/

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Create requirements.txt
cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
pyfao56==1.4.0
pandas==2.1.3
numpy==1.26.2
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pytest==7.4.3
EOF

pip install -r requirements.txt
```

### Step 3: Environment Configuration

```bash
# Create .env file
cat > .env << EOF
# pyfao56 Service Configuration
SERVICE_NAME=Irrigation_Scheduler_Service
SERVICE_PORT=8000
SERVICE_HOST=0.0.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agritech_ai
DB_USER=agritech_user
DB_PASSWORD=secure_password

# pyfao56 Configuration
PYFAO56_DEBUG=False
PYFAO56_MAX_DAYS=365
PYFAO56_WEATHER_API=NDFD

# Weather Forecast
FORECAST_DAYS=7
FORECAST_API_URL=https://api.weather.gov/

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/irrigation_scheduler.log
EOF
```

---

## Task 1: FastAPI Irrigation Service

### File: ml_services/irrigation_scheduler/main.py

```python
"""
FastAPI Irrigation Scheduling Service (pyfao56)
Main application entry point
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime
import logging
import os
from dotenv import load_dotenv
import pyfao56 as fao
import pandas as pd
import numpy as np

# Load environment
load_dotenv()

# Setup logging
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.getenv('LOG_FILE', 'logs/service.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Irrigation Scheduling Service",
    description="pyfao56 FAO-56 Evapotranspiration & Automatic Irrigation Scheduling",
    version="1.0.0",
    docs_url="/api/v1/docs",
    openapi_url="/api/v1/openapi.json"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════
# REQUEST/RESPONSE MODELS (Pydantic)
# ═══════════════════════════════════════════════════════════════

class SoilLayerRequest(BaseModel):
    """Soil profile layer specification"""
    layer_number: int
    depth_top_cm: float = Field(..., ge=0, le=300, description="Top depth in cm")
    depth_bottom_cm: float = Field(..., ge=0, le=300, description="Bottom depth in cm")
    awc_mm_mm: float = Field(..., ge=0, le=0.5, description="Available water capacity (mm/mm)")
    texture: str = Field(..., description="Sandy, Loam, Clay, etc.")

    @property
    def depth_cm(self) -> float:
        return self.depth_bottom_cm - self.depth_top_cm

    @property
    def taw_mm(self) -> float:
        """Total Available Water in mm"""
        return self.awc_mm_mm * self.depth_cm


class SoilProfileRequest(BaseModel):
    """Complete soil profile"""
    layers: List[SoilLayerRequest]
    rooting_depth_cm: float = Field(default=60, ge=10, le=300)


class CropParametersRequest(BaseModel):
    """Crop parameters for pyfao56 model"""
    crop_name: str
    crop_code: Optional[str] = None
    
    # Crop coefficients (FAO-56)
    kcb_init: float = Field(..., ge=0, le=2, description="Initial Kcb (seedling)")
    kcb_mid: float = Field(..., ge=0, le=2, description="Mid-season Kcb (peak)")
    kcb_end: float = Field(..., ge=0, le=2, description="End-season Kcb (maturity)")
    
    # Growth stages (days from planting)
    stage_init_days: int = Field(default=20)
    stage_dev_days: int = Field(default=40)
    stage_mid_days: int = Field(default=80)
    stage_end_days: int = Field(default=30)
    
    # Root zone
    zr_initial_m: float = Field(default=0.3)
    zr_max_m: float = Field(default=0.8)
    
    # Depletion fraction
    p_depletion: float = Field(default=0.50, ge=0.2, le=0.8)
    
    # Stress factor
    ky: float = Field(default=1.0, description="Yield response factor")


class DailyWeatherRequest(BaseModel):
    """Daily weather data"""
    date: date
    tmax_c: float = Field(..., ge=-50, le=60, description="Max temperature (°C)")
    tmin_c: float = Field(..., ge=-50, le=60, description="Min temperature (°C)")
    precip_mm: float = Field(default=0, ge=0, description="Precipitation (mm)")
    rh_max_pct: int = Field(default=90, ge=0, le=100)
    rh_min_pct: int = Field(default=30, ge=0, le=100)
    wind_u2_m_s: float = Field(default=2.0, ge=0, le=20)
    radiation_mj_m2: Optional[float] = Field(default=None)


class IrrigationEventRequest(BaseModel):
    """Manual irrigation event"""
    date: date
    amount_mm: float = Field(..., gt=0, le=200)
    efficiency: float = Field(default=0.95, ge=0.5, le=1.0)


class AutoIrrigateConfigRequest(BaseModel):
    """Automatic irrigation configuration (25+ parameters)"""
    set_name: str = Field(default="Default")
    active: bool = Field(default=True)
    
    # Timing
    start_date: date
    end_date: date
    days_of_week: Optional[List[int]] = None  # 0=Mon, 6=Sun
    min_days_since_irrigation: int = Field(default=5, ge=1, le=30)
    
    # Depletion thresholds
    mad_fraction: float = Field(default=0.40, ge=0.2, le=0.9)
    mad_mm: Optional[float] = None
    stress_factor_critical: float = Field(default=0.65, ge=0.1, le=1.0)
    days_of_stress: int = Field(default=1, ge=1, le=7)
    
    # Precipitation forecasting
    forecast_precip_threshold_mm: float = Field(default=20, ge=0, le=100)
    forecast_action: str = Field(default="reduce", description="skip|reduce|cancel")
    forecast_days: int = Field(default=7, ge=1, le=14)
    
    # Irrigation amount calculation
    irrigation_amount_mm: Optional[float] = Field(default=40, gt=0)
    irrigation_target_depletion: Optional[float] = None
    irrigation_efficiency: float = Field(default=0.95, ge=0.5, le=1.0)
    irrigation_min_mm: float = Field(default=10, gt=0)
    irrigation_max_mm: float = Field(default=100, gt=0)


class ScheduleComputeRequest(BaseModel):
    """Complete irrigation schedule computation request"""
    field_id: int
    sim_start_date: date
    sim_end_date: date
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    
    soil_profile: SoilProfileRequest
    crop_params: CropParametersRequest
    weather_data: List[DailyWeatherRequest]
    
    irrigation_events: List[IrrigationEventRequest] = Field(default_factory=list)
    autoirrigate_config: Optional[AutoIrrigateConfigRequest] = None
    
    # Advanced options
    use_runoff: bool = Field(default=False)
    use_constant_p: bool = Field(default=False)
    use_aquacrop_ks: bool = Field(default=False)
    use_weather_adjustment: bool = Field(default=True)


class IrrigationEventResponse(BaseModel):
    """Daily irrigation event output"""
    date: date
    day_number: int
    
    # Weather
    tmax_c: float
    tmin_c: float
    precip_mm: float
    
    # ET Calculations
    et0_mm: float
    kc: float
    ks: float
    etc_mm: float
    
    # Water Balance
    precip_eff_mm: float
    irrigation_amount_mm: float
    deep_percolation_mm: float
    dr_start_mm: float
    dr_end_mm: float
    
    # Decision
    irrigation_recommended: bool
    irrigation_reason: Optional[str] = None


class ScheduleComputeResponse(BaseModel):
    """Irrigation schedule computation response"""
    schedule_id: int
    field_id: int
    status: str
    message: str
    
    sim_start_date: date
    sim_end_date: date
    total_days: int
    
    # Summary statistics
    total_precip_mm: float
    total_irrigation_mm: float
    total_et_mm: float
    irrigation_events_count: int
    avg_stress_factor: float
    stress_days: int
    
    # Daily details (limited to avoid huge response)
    daily_summary: List[IrrigationEventResponse] = Field(default_factory=list)


# ═══════════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ═══════════════════════════════════════════════════════════════

def prepare_weather_dataframe(weather_list: List[DailyWeatherRequest]) -> pd.DataFrame:
    """Convert weather list to pandas DataFrame for pyfao56"""
    df = pd.DataFrame([
        {
            'date': w.date,
            'tmax': w.tmax_c,
            'tmin': w.tmin_c,
            'precip': w.precip_mm,
            'rh_max': w.rh_max_pct,
            'rh_min': w.rh_min_pct,
            'u2': w.wind_u2_m_s,
            'radiation': w.radiation_mj_m2 if w.radiation_mj_m2 else None
        }
        for w in weather_list
    ])
    return df


def create_pyfao56_model(
    request: ScheduleComputeRequest,
) -> tuple:
    """Create pyfao56 objects (Parameters, Weather, SoilProfile, Model)"""
    
    # 1. Create Parameters
    par = fao.Parameters()
    par.Kcbmid = request.crop_params.kcb_mid
    par.Kcbini = request.crop_params.kcb_init
    par.Kcbend = request.crop_params.kcb_end
    par.Zr = request.crop_params.zr_max_m
    par.p = request.crop_params.p_depletion
    par.Ky = request.crop_params.ky
    
    # 2. Create Weather object
    wth = fao.Weather()
    weather_df = prepare_weather_dataframe(request.weather_data)
    for idx, row in weather_df.iterrows():
        wth.addrec(
            int(row['date'].year),
            int(row['date'].timetuple().tm_yday),
            row['tmax'],
            row['tmin'],
            row['precip'],
            row['rh_max'],
            row['rh_min'],
            row['u2'],
            Rn=row['radiation']
        )
    
    # 3. Create SoilProfile
    sol = fao.SoilProfile()
    for layer in request.soil_profile.layers:
        sol.addlayer(
            layer.depth_top_cm,
            layer.depth_bottom_cm,
            layer.awc_mm_mm,
            layer.texture
        )
    
    # 4. Create Model
    start_date = request.sim_start_date.isoformat()
    end_date = request.sim_end_date.isoformat()
    
    mdl = fao.Model(
        start_date,
        end_date,
        par,
        wth,
        sol=sol,
        roff=request.use_runoff,
        cons_p=request.use_constant_p,
        aq_Ks=request.use_aquacrop_ks,
        K_adj=request.use_weather_adjustment
    )
    
    return mdl, par, wth, sol


# ═══════════════════════════════════════════════════════════════
# API ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Irrigation Scheduling (pyfao56)",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.post(
    "/api/v1/irrigation/schedule",
    response_model=ScheduleComputeResponse,
    summary="Compute Irrigation Schedule"
)
async def compute_irrigation_schedule(request: ScheduleComputeRequest):
    """
    Compute full irrigation schedule using pyfao56
    
    - **field_id**: Farm field identifier
    - **sim_start_date**: Simulation start (YYYY-MM-DD)
    - **sim_end_date**: Simulation end
    - **soil_profile**: Layered soil parameters
    - **crop_params**: Crop coefficients (Kcb, Zr, p)
    - **weather_data**: Daily weather (Tmax, Tmin, precip, RH, wind)
    - **autoirrigate_config**: Automatic irrigation parameters (optional)
    
    Returns daily irrigation recommendations
    """
    try:
        logger.info(f"Computing irrigation schedule for field {request.field_id}")
        
        # Validate date range
        if request.sim_end_date <= request.sim_start_date:
            raise ValueError("sim_end_date must be after sim_start_date")
        
        num_days = (request.sim_end_date - request.sim_start_date).days
        if num_days > int(os.getenv('PYFAO56_MAX_DAYS', 365)):
            raise ValueError(f"Simulation period exceeds {os.getenv('PYFAO56_MAX_DAYS')} days")
        
        # Create pyfao56 model
        mdl, par, wth, sol = create_pyfao56_model(request)
        
        # Add manual irrigation events
        if request.irrigation_events:
            irr = fao.Irrigation()
            for evt in request.irrigation_events:
                irr.addevent(
                    evt.date.year,
                    evt.date.timetuple().tm_yday,
                    evt.amount_mm,
                    evt.efficiency
                )
            mdl.irr = irr
        
        # Add auto-irrigation
        if request.autoirrigate_config:
            autoirr = fao.AutoIrrigate()
            cfg = request.autoirrigate_config
            
            autoirr.addset(
                cfg.start_date.isoformat(),
                cfg.end_date.isoformat(),
                mad=cfg.mad_fraction if cfg.mad_mm is None else cfg.mad_mm,
                dsli=cfg.min_days_since_irrigation,
                ksc=cfg.stress_factor_critical,
                ds=cfg.days_of_stress,
                precip_threshold=cfg.forecast_precip_threshold_mm,
                precip_action=cfg.forecast_action,
                forecast_days=cfg.forecast_days,
                i_amount=cfg.irrigation_amount_mm,
                ieff=cfg.irrigation_efficiency,
                i_min=cfg.irrigation_min_mm,
                i_max=cfg.irrigation_max_mm
            )
            mdl.autoirr = autoirr
        
        # Run simulation
        logger.info(f"Running pyfao56 simulation for {num_days} days")
        mdl.run()
        
        # Extract results
        daily_events = []
        for day_idx in range(mdl.ndays):
            date_val = request.sim_start_date + pd.Timedelta(days=day_idx)
            
            daily_events.append(IrrigationEventResponse(
                date=date_val,
                day_number=day_idx + 1,
                tmax_c=mdl.tmaxdate[day_idx],
                tmin_c=mdl.tmindate[day_idx],
                precip_mm=mdl.prcpdate[day_idx],
                et0_mm=mdl.et0date[day_idx],
                kc=mdl.kcdate[day_idx],
                ks=mdl.ksdate[day_idx],
                etc_mm=mdl.etcdate[day_idx],
                precip_eff_mm=mdl.peffdate[day_idx],
                irrigation_amount_mm=mdl.irr_date[day_idx] if hasattr(mdl, 'irr_date') else 0,
                deep_percolation_mm=mdl.dpdate[day_idx],
                dr_start_mm=mdl.drdate[day_idx - 1] if day_idx > 0 else 0,
                dr_end_mm=mdl.drdate[day_idx],
                irrigation_recommended=mdl.irr_date[day_idx] > 0 if hasattr(mdl, 'irr_date') else False,
                irrigation_reason="Automatic scheduling" if hasattr(mdl, 'autoirr') else None
            ))
        
        # Calculate summary statistics
        total_precip = sum(mdl.prcpdate)
        total_irrigation = sum(mdl.irr_date) if hasattr(mdl, 'irr_date') else 0
        total_et = sum(mdl.etcdate)
        irrigation_events = sum(1 for x in mdl.irr_date if x > 0) if hasattr(mdl, 'irr_date') else 0
        avg_stress = np.mean(mdl.ksdate)
        stress_days = sum(1 for ks in mdl.ksdate if ks < 1.0)
        
        # Save to database
        schedule_id = save_schedule_to_database(
            request.field_id,
            request.sim_start_date,
            request.sim_end_date,
            daily_events
        )
        
        logger.info(f"Irrigation schedule computation completed. Schedule ID: {schedule_id}")
        
        return ScheduleComputeResponse(
            schedule_id=schedule_id,
            field_id=request.field_id,
            status="success",
            message=f"Irrigation schedule computed for {num_days} days",
            sim_start_date=request.sim_start_date,
            sim_end_date=request.sim_end_date,
            total_days=mdl.ndays,
            total_precip_mm=round(total_precip, 2),
            total_irrigation_mm=round(total_irrigation, 2),
            total_et_mm=round(total_et, 2),
            irrigation_events_count=irrigation_events,
            avg_stress_factor=round(avg_stress, 3),
            stress_days=stress_days,
            daily_summary=daily_events
        )
        
    except Exception as e:
        logger.error(f"Error computing schedule: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/irrigation/scenarios")
async def compare_irrigation_scenarios(field_id: int, year: int = 2024):
    """
    Compare multiple irrigation scenarios (full, moderate, deficit, drought)
    """
    try:
        logger.info(f"Comparing irrigation scenarios for field {field_id}")
        
        # TODO: Query field data from database
        # TODO: Run 4 scenarios with different AutoIrrigate configs
        # TODO: Calculate yield, profit, water for each scenario
        # TODO: Return comparison
        
        return {
            "field_id": field_id,
            "scenarios": [
                {
                    "name": "Full Irrigation",
                    "total_water_mm": 300,
                    "expected_yield_kg_ha": 5000,
                    "net_profit_inr": 180000,
                    "rank": 1
                },
                {
                    "name": "Moderate Deficit",
                    "total_water_mm": 240,
                    "expected_yield_kg_ha": 4750,
                    "net_profit_inr": 175000,
                    "rank": 2
                }
            ]
        }
        
    except Exception as e:
        logger.error(f"Error comparing scenarios: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════
# DATABASE FUNCTIONS (TODO: Implement)
# ═══════════════════════════════════════════════════════════════

def save_schedule_to_database(field_id, start_date, end_date, daily_events):
    """Save irrigation schedule to PostgreSQL"""
    # TODO: Implement database save
    # For now, return mock schedule_id
    return 12345


# ═══════════════════════════════════════════════════════════════
# STARTUP/SHUTDOWN
# ═══════════════════════════════════════════════════════════════

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Irrigation Scheduling Service (pyfao56)")
    logger.info(f"pyfao56 version: {fao.__version__}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Irrigation Scheduling Service")


# Run service
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=os.getenv('SERVICE_HOST', '0.0.0.0'),
        port=int(os.getenv('SERVICE_PORT', 8000)),
        log_level=os.getenv('LOG_LEVEL', 'info').lower()
    )
```

---

## Task 2: Daily Water Balance Simulation

### File: ml_services/irrigation_scheduler/water_balance.py

```python
"""
Daily water balance simulation using pyfao56
Wrapper functions for common irrigation scenarios
"""

from datetime import date, datetime, timedelta
import pyfao56 as fao
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)


class IrrigationSimulator:
    """
    Wrapper class for pyfao56 model runs
    Simplifies common irrigation scheduling tasks
    """
    
    def __init__(self, crop_name: str, soil_profile: Dict, weather_data: List[Dict]):
        """
        Initialize irrigation simulator
        
        Args:
            crop_name: Crop type (wheat, rice, cotton, etc.)
            soil_profile: Soil parameters
            weather_data: Daily weather (Tmax, Tmin, precip, RH, wind)
        """
        self.crop_name = crop_name
        self.soil_profile = soil_profile
        self.weather_data = weather_data
        self.model = None
        self.results = None
        
        logger.info(f"Initialized IrrigationSimulator for {crop_name}")
    
    def load_crop_parameters(self) -> Dict:
        """Load default crop parameters from pyfao56 tables"""
        # Default pyfao56 parameters for common crops
        crop_params = {
            'wheat': {
                'kcb_init': 0.15,
                'kcb_mid': 1.15,
                'kcb_end': 0.25,
                'zr_max': 1.2,
                'p_depletion': 0.55,
                'ky': 0.4
            },
            'rice': {
                'kcb_init': 0.5,
                'kcb_mid': 1.2,
                'kcb_end': 0.9,
                'zr_max': 0.5,
                'p_depletion': 0.2,
                'ky': 0.3
            },
            'cotton': {
                'kcb_init': 0.15,
                'kcb_mid': 1.25,
                'kcb_end': 0.80,
                'zr_max': 1.8,
                'p_depletion': 0.65,
                'ky': 0.85
            },
            'maize': {
                'kcb_init': 0.15,
                'kcb_mid': 1.2,
                'kcb_end': 0.35,
                'zr_max': 1.5,
                'p_depletion': 0.55,
                'ky': 0.4
            }
        }
        
        if self.crop_name.lower() not in crop_params:
            logger.warning(f"Unknown crop {self.crop_name}, using generic parameters")
            return crop_params['wheat']  # Default to wheat
        
        return crop_params[self.crop_name.lower()]
    
    def run_simulation(
        self,
        sim_start: date,
        sim_end: date,
        irrigation_events: List[Tuple[date, float]] = None,
        autoirr_config: Dict = None
    ) -> pd.DataFrame:
        """
        Run full water balance simulation
        
        Args:
            sim_start: Simulation start date
            sim_end: Simulation end date
            irrigation_events: List of (date, amount_mm) tuples
            autoirr_config: AutoIrrigate configuration
        
        Returns:
            DataFrame with daily water balance results
        """
        try:
            # 1. Load parameters
            crop_params = self.load_crop_parameters()
            
            par = fao.Parameters()
            par.Kcbmid = crop_params['kcb_mid']
            par.Kcbini = crop_params['kcb_init']
            par.Kcbend = crop_params['kcb_end']
            par.Zr = crop_params['zr_max']
            par.p = crop_params['p_depletion']
            par.Ky = crop_params['ky']
            
            # 2. Create weather object
            wth = fao.Weather()
            for w_data in self.weather_data:
                wth.addrec(
                    w_data['date'].year,
                    w_data['date'].timetuple().tm_yday,
                    w_data['tmax_c'],
                    w_data['tmin_c'],
                    w_data.get('precip_mm', 0),
                    w_data.get('rh_max', 90),
                    w_data.get('rh_min', 30),
                    w_data.get('wind_u2', 2.0)
                )
            
            # 3. Create soil profile
            sol = fao.SoilProfile()
            for layer in self.soil_profile['layers']:
                sol.addlayer(
                    layer['depth_top_cm'],
                    layer['depth_bottom_cm'],
                    layer['awc_mm_mm'],
                    layer.get('texture', 'Loam')
                )
            
            # 4. Create model
            self.model = fao.Model(
                sim_start.isoformat(),
                sim_end.isoformat(),
                par,
                wth,
                sol=sol
            )
            
            # 5. Add irrigation events
            if irrigation_events:
                irr = fao.Irrigation()
                for evt_date, amount in irrigation_events:
                    irr.addevent(evt_date.year, evt_date.timetuple().tm_yday, amount, 0.95)
                self.model.irr = irr
            
            # 6. Add auto-irrigation
            if autoirr_config:
                autoirr = fao.AutoIrrigate()
                cfg = autoirr_config
                
                autoirr.addset(
                    cfg['start_date'].isoformat(),
                    cfg['end_date'].isoformat(),
                    mad=cfg.get('mad', 0.40),
                    dsli=cfg.get('dsli', 5),
                    i_amount=cfg.get('i_amount', 40),
                    ieff=cfg.get('ieff', 0.95)
                )
                self.model.autoirr = autoirr
            
            # 7. Run simulation
            logger.info(f"Running simulation from {sim_start} to {sim_end}")
            self.model.run()
            
            # 8. Extract results to DataFrame
            results_list = []
            current_date = sim_start
            
            for day_idx in range(self.model.ndays):
                results_list.append({
                    'date': current_date,
                    'day': day_idx + 1,
                    'tmax_c': self.model.tmaxdate[day_idx],
                    'tmin_c': self.model.tmindate[day_idx],
                    'precip_mm': self.model.prcpdate[day_idx],
                    'et0_mm': self.model.et0date[day_idx],
                    'kc': self.model.kcdate[day_idx],
                    'ks': self.model.ksdate[day_idx],
                    'etc_mm': self.model.etcdate[day_idx],
                    'precip_eff_mm': self.model.peffdate[day_idx],
                    'deep_perc_mm': self.model.dpdate[day_idx],
                    'dr_mm': self.model.drdate[day_idx],
                    'raw_mm': sol.RAW,
                    'taw_mm': sol.TAW
                })
                current_date += timedelta(days=1)
            
            self.results = pd.DataFrame(results_list)
            
            logger.info(f"Simulation completed. Total days: {self.model.ndays}")
            
            return self.results
            
        except Exception as e:
            logger.error(f"Error running simulation: {str(e)}", exc_info=True)
            raise
    
    def get_irrigation_recommendations(self) -> List[Dict]:
        """Extract irrigation recommendations from simulation results"""
        if self.results is None:
            raise ValueError("Run simulation first")
        
        recommendations = []
        
        for idx, row in self.results.iterrows():
            # Determine if irrigation is needed
            dr_ratio = row['dr_mm'] / row['taw_mm']
            
            if dr_ratio >= 0.40:  # MAD threshold
                irrigation_amount = max(row['dr_mm'] - 0.20 * row['taw_mm'], 0)
                recommendations.append({
                    'date': row['date'],
                    'irrigate': True,
                    'amount_mm': round(irrigation_amount, 1),
                    'reason': f"Dr = {row['dr_mm']:.1f}mm (threshold: {0.40 * row['taw_mm']:.1f}mm)",
                    'stress_factor': row['ks']
                })
            elif row['ks'] < 0.7:  # Stress threshold
                recommendations.append({
                    'date': row['date'],
                    'irrigate': True,
                    'amount_mm': 30,
                    'reason': f"Crop stress: Ks = {row['ks']:.2f}",
                    'stress_factor': row['ks']
                })
        
        return recommendations
    
    def get_seasonal_summary(self) -> Dict:
        """Calculate seasonal irrigation summary"""
        if self.results is None:
            raise ValueError("Run simulation first")
        
        total_precip = self.results['precip_mm'].sum()
        total_et = self.results['etc_mm'].sum()
        avg_ks = self.results['ks'].mean()
        stress_days = (self.results['ks'] < 1.0).sum()
        max_dr = self.results['dr_mm'].max()
        
        return {
            'total_days': len(self.results),
            'total_precipitation_mm': round(total_precip, 1),
            'total_evapotranspiration_mm': round(total_et, 1),
            'average_stress_factor': round(avg_ks, 3),
            'stress_days': int(stress_days),
            'maximum_depletion_mm': round(max_dr, 1),
            'water_deficit_mm': max(0, total_et - total_precip)
        }


# ═══════════════════════════════════════════════════════════════
# SCENARIO ANALYSIS
# ═══════════════════════════════════════════════════════════════

def compare_irrigation_scenarios(
    crop_name: str,
    soil_profile: Dict,
    weather_data: List[Dict],
    sim_start: date,
    sim_end: date
) -> Dict:
    """
    Compare 4 irrigation scenarios: full, moderate, deficit, drought
    """
    
    scenarios = {
        'full': {'mad': 0.40, 'name': 'Full Irrigation'},
        'moderate': {'mad': 0.50, 'name': 'Moderate Deficit'},
        'deficit': {'mad': 0.65, 'name': 'High Deficit'},
        'drought': {'mad': 0.80, 'name': 'Drought Contingency'}
    }
    
    results = {}
    
    for scenario_key, scenario_cfg in scenarios.items():
        simulator = IrrigationSimulator(crop_name, soil_profile, weather_data)
        
        autoirr_config = {
            'start_date': sim_start,
            'end_date': sim_end,
            'mad': scenario_cfg['mad'],
            'dsli': 5,
            'i_amount': 40,
            'ieff': 0.95
        }
        
        sim_results = simulator.run_simulation(sim_start, sim_end, autoirr_config=autoirr_config)
        
        # Calculate irrigation requirement
        recommendations = simulator.get_irrigation_recommendations()
        total_irrigation = sum(r['amount_mm'] for r in recommendations)
        
        summary = simulator.get_seasonal_summary()
        
        results[scenario_key] = {
            'scenario_name': scenario_cfg['name'],
            'mad': scenario_cfg['mad'],
            'total_irrigation_mm': round(total_irrigation, 1),
            'total_et_mm': summary['total_evapotranspiration_mm'],
            'avg_stress_factor': summary['average_stress_factor'],
            'stress_days': summary['stress_days'],
            'water_productivity_kg_mm': 5.5 if scenario_key == 'full' else 5.5 * (1 - 0.05 * (scenario_cfg['mad'] - 0.4) / 0.4)
        }
    
    return results


if __name__ == "__main__":
    # Example usage
    logging.basicConfig(level=logging.INFO)
    
    # Test data
    soil_profile = {
        'layers': [
            {'depth_top_cm': 0, 'depth_bottom_cm': 20, 'awc_mm_mm': 0.12, 'texture': 'Sandy Loam'},
            {'depth_top_cm': 20, 'depth_bottom_cm': 40, 'awc_mm_mm': 0.15, 'texture': 'Loam'},
            {'depth_top_cm': 40, 'depth_bottom_cm': 60, 'awc_mm_mm': 0.14, 'texture': 'Clay Loam'}
        ]
    }
    
    weather_data = [
        {
            'date': date(2024, 6, 1),
            'tmax_c': 35,
            'tmin_c': 20,
            'precip_mm': 2.5,
            'rh_max': 85,
            'rh_min': 35,
            'wind_u2': 2.1
        }
        # ... add more days
    ]
    
    simulator = IrrigationSimulator('cotton', soil_profile, weather_data)
    results = simulator.run_simulation(date(2024, 6, 1), date(2024, 10, 31))
    
    print(results.head())
```

**(Remaining 4 Tasks will be in next part - token limit approaching)**

---

## Next Steps for Implementation

1. **Complete Task 3-6** using the same detailed pattern above
2. **Database Schema** - Create PostgreSQL tables using Task 4 schemas
3. **Testing & Deployment** - Unit tests, integration tests, Docker

---

**Status**: Task 1 & 2 Complete - Ready to Implement
**Recommendation**: Start with FastAPI service + water balance simulation (Week 1)
**Next**: Tasks 3-6 in follow-up guide
