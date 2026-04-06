# 🌍 SimpleSoilProfile Integration - Quick Start Guide
**Phase 1: Core Soil Profile Management**

**Timeline:** 2-3 weeks  
**Team:** 1-2 engineers  
**Status:** Ready to start

---

## 📋 Phase 1 Tasks

### Task 1: Copy & Setup Module (Day 1)

#### Step 1.1: Copy SimpleSoilProfile Module
```bash
cd c:\Users\PREETHI\Downloads\agritech-ai

# Create libs directory if needed
mkdir -p backend\ml-service\libs

# Copy module
cp -r "c:\Users\PREETHI\Downloads\simplesoilprofile-master\simplesoilprofile-master\simplesoilprofile" \
   "backend\ml-service\libs\"
```

#### Step 1.2: Verify Installation
```bash
cd backend/ml-service
ls -la libs/simplesoilprofile/

# Should show:
# models/ plotting/ utils/ __init__.py
```

#### Step 1.3: Update Dependencies
```bash
# Check pyproject.toml or requirements.txt
# Add these if not present:
# pydantic>=2.4.2
# numpy>=1.24.0
# matplotlib>=3.8.0
# pandas>=2.3.3
# pyyaml>=6.0.1

pip install pydantic numpy matplotlib pandas pyyaml
```

#### Step 1.4: Test Import
```python
# Create test_import.py
from libs.simplesoilprofile.models import SoilLayer, SoilProfile
from libs.simplesoilprofile.plotting import plot_profile

print("✅ All imports successful!")
```

---

### Task 2: Create Python Service (Days 2-3)

Create file: `backend/ml-service/services/soil_profile_service.py`

```python
"""
Soil Profile Service
Manages multi-layer soil profile data and analysis
"""

from typing import Dict, List, Optional
from shapely.geometry import Point
import matplotlib.pyplot as plt
import io

from libs.simplesoilprofile.models import SoilLayer, SoilProfile
from libs.simplesoilprofile.models.swap import (
    profile_to_soilhydrfunc_table,
    profile_to_texture_table,
    profile_to_sublayer_table
)
from libs.simplesoilprofile.plotting import plot_profile


class SoilProfileService:
    """
    Service for soil profile management
    
    Handles:
    - Creating multi-layer soil profiles
    - Managing soil properties
    - SWAP model export
    - Profile visualization
    """

    def create_profile_from_data(
        self,
        profile_data: Dict
    ) -> SoilProfile:
        """
        Create a soil profile from dictionary data
        
        Args:
            profile_data: {
                'name': 'Field A',
                'layers': [
                    {
                        'name': 'Topsoil',
                        'texture_class': 'sandy loam',
                        'theta_res': 0.02,
                        'theta_sat': 0.4,
                        'alpha': 0.02,
                        'n': 1.5,
                        'k_sat': 10.0,
                        'clay_content': 10,
                        'silt_content': 20,
                        'sand_content': 70
                    },
                    ...
                ],
                'layer_bottoms': [30, 100, 200],  # cm
                'x': 100.0,
                'y': 200.0,
                'elevation': 5.0
            }
        
        Returns:
            SoilProfile object
        """
        try:
            # Create layers
            layers = [
                SoilLayer(**layer_data)
                for layer_data in profile_data.get('layers', [])
            ]

            # Create profile
            location = None
            if 'x' in profile_data and 'y' in profile_data:
                location = Point(
                    profile_data['x'],
                    profile_data['y']
                )

            profile = SoilProfile(
                name=profile_data.get('name', 'Unnamed Profile'),
                description=profile_data.get('description'),
                location=location,
                elevation=profile_data.get('elevation'),
                layers=layers,
                layer_bottoms=profile_data.get('layer_bottoms', [])
            )

            return profile

        except ValueError as e:
            raise ValueError(f"Invalid profile data: {str(e)}")

    def get_layer_info(
        self,
        profile: SoilProfile,
        layer_index: int
    ) -> Dict:
        """Get detailed information about a specific layer"""
        if layer_index < 0 or layer_index >= len(profile.layers):
            raise IndexError(f"Layer index {layer_index} out of range")

        layer = profile.layers[layer_index]
        top, bottom = profile.layer_bounds[layer_index]

        return {
            'index': layer_index,
            'name': layer.name,
            'description': layer.description,
            'depth_top_cm': top,
            'depth_bottom_cm': bottom,
            'thickness_cm': bottom - top,
            'texture_class': layer.texture_class,
            'van_genuchten': {
                'theta_res': layer.theta_res,
                'theta_sat': layer.theta_sat,
                'alpha': layer.alpha,
                'n': layer.n,
                'k_sat': layer.k_sat,
                'lambda': layer.lambda_param
            },
            'texture': {
                'clay_percent': layer.clay_content,
                'silt_percent': layer.silt_content,
                'sand_percent': layer.sand_content,
                'organic_matter_percent': layer.organic_matter
            },
            'physical': {
                'bulk_density': layer.bulk_density,
                'air_entry_pressure': layer.h_enpr
            }
        }

    def get_all_layers(self, profile: SoilProfile) -> List[Dict]:
        """Get information about all layers"""
        return [
            self.get_layer_info(profile, i)
            for i in range(len(profile.layers))
        ]

    def get_profile_summary(self, profile: SoilProfile) -> Dict:
        """Get summary of entire profile"""
        avg_clay = sum(
            (l.clay_content or 0) for l in profile.layers
        ) / len(profile.layers) if profile.layers else 0

        avg_om = sum(
            (l.organic_matter or 0) for l in profile.layers
        ) / len(profile.layers) if profile.layers else 0

        return {
            'name': profile.name,
            'description': profile.description,
            'num_layers': len(profile.layers),
            'total_depth_cm': profile.profile_depth,
            'location': {
                'x': profile.location.x if profile.location else None,
                'y': profile.location.y if profile.location else None,
                'elevation_m': profile.elevation
            },
            'average_clay_percent': round(avg_clay, 1),
            'average_organic_matter': round(avg_om, 1),
            'layer_names': [l.name for l in profile.layers]
        }

    def export_to_swap_tables(self, profile: SoilProfile) -> Dict:
        """
        Export profile to SWAP model format
        
        Returns:
            {
                'soil_hydr_func': DataFrame with van Genuchten params,
                'texture': DataFrame with texture data,
                'sublayers': DataFrame with discretization
            }
        """
        return {
            'soil_hydr_func': profile_to_soilhydrfunc_table(profile).to_dict(),
            'texture': profile_to_texture_table(profile).to_dict(),
            'sublayers': profile_to_sublayer_table(profile).to_dict() 
                if any(layer.discretization for layer in profile.layers)
                else None
        }

    def generate_visualization(
        self,
        profile: SoilProfile,
        figsize: tuple = (8, 12),
        show_properties: bool = True,
        show_sublayers: bool = True
    ) -> bytes:
        """
        Generate visual profile plot as PNG image
        
        Returns:
            PNG image bytes
        """
        try:
            fig, ax = plt.subplots(figsize=figsize)

            plot_profile(
                profile,
                ax=ax,
                figsize=figsize,
                show_depths=True,
                show_layer_properties=show_properties,
                show_sublayers=show_sublayers
            )

            # Convert to bytes
            buf = io.BytesIO()
            fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
            buf.seek(0)
            plt.close(fig)

            return buf.getvalue()

        except Exception as e:
            print(f"Error generating visualization: {str(e)}")
            raise

    def get_layer_at_depth(
        self,
        profile: SoilProfile,
        depth_cm: float
    ) -> Dict:
        """Get layer information at specific depth"""
        result = profile.get_layer_at_depth(depth_cm)
        
        if result is None:
            raise ValueError(f"No layer found at depth {depth_cm} cm")

        layer, layer_index = result
        return self.get_layer_info(profile, layer_index)

    def estimate_water_retention(
        self,
        profile: SoilProfile,
        pressure_head_cm: float,
        layer_index: Optional[int] = None
    ) -> Dict:
        """
        Estimate water content using van Genuchten equation
        
        Uses formula: θ(h) = θr + (θs - θr) / (1 + (α|h|)^n)^m
        where m = 1 - 1/n
        """
        if layer_index is not None:
            layers = [profile.layers[layer_index]]
            indices = [layer_index]
        else:
            layers = profile.layers
            indices = range(len(profile.layers))

        results = []
        for layer, idx in zip(layers, indices):
            if layer.theta_res is None or layer.theta_sat is None:
                results.append({
                    'layer_index': idx,
                    'layer_name': layer.name,
                    'water_content': None,
                    'error': 'Missing van Genuchten parameters'
                })
                continue

            # van Genuchten calculation
            m = 1 - 1 / layer.n if layer.n else 0.5
            h = abs(pressure_head_cm)
            
            theta = layer.theta_res + (
                (layer.theta_sat - layer.theta_res) /
                (1 + (layer.alpha * h) ** layer.n) ** m
            )

            results.append({
                'layer_index': idx,
                'layer_name': layer.name,
                'pressure_head_cm': pressure_head_cm,
                'water_content_m3_m3': round(theta, 4),
                'depth_top_cm': profile.layer_bounds[idx][0],
                'depth_bottom_cm': profile.layer_bounds[idx][1]
            })

        return results if layer_index is None else results[0]

    def get_infiltration_capacity(
        self,
        profile: SoilProfile,
        layer_index: int = 0
    ) -> Dict:
        """Get infiltration characteristics"""
        layer = profile.layers[layer_index]

        return {
            'layer_name': layer.name,
            'saturated_k_cm_per_day': layer.k_sat,
            'saturated_k_mm_per_hour': (layer.k_sat / 24) * 10 if layer.k_sat else None,
            'infiltration_class': self._classify_infiltration(layer.k_sat),
            'notes': 'Based on saturated hydraulic conductivity'
        }

    @staticmethod
    def _classify_infiltration(k_sat: Optional[float]) -> str:
        """Classify infiltration rate"""
        if k_sat is None:
            return 'Unknown'
        if k_sat > 20:
            return 'Very Rapid (>20 cm/day)'
        elif k_sat > 10:
            return 'Rapid (10-20 cm/day)'
        elif k_sat > 5:
            return 'Moderately Rapid (5-10 cm/day)'
        elif k_sat > 2:
            return 'Moderate (2-5 cm/day)'
        else:
            return 'Slow or Very Slow (<2 cm/day)'

    def create_profile_comparison(
        self,
        profiles: List[SoilProfile]
    ) -> Dict:
        """Compare multiple soil profiles"""
        comparison = {
            'profiles': [],
            'layer_count_range': (
                min(len(p.layers) for p in profiles),
                max(len(p.layers) for p in profiles)
            ),
            'depth_range_cm': (
                min(p.profile_depth for p in profiles),
                max(p.profile_depth for p in profiles)
            )
        }

        for profile in profiles:
            summary = self.get_profile_summary(profile)
            comparison['profiles'].append(summary)

        return comparison
```

---

### Task 3: Create FastAPI Endpoints (Day 4)

Create file: `backend/ml-service/routes/soil_profile_routes.py`

```python
"""
FastAPI Routes for Soil Profile Management
"""

from fastapi import APIRouter, HTTPException, File, UploadFile, Query
from fastapi.responses import StreamingResponse
from typing import Dict, List
import io

from services.soil_profile_service import SoilProfileService

router = APIRouter(
    prefix="/api/v1/soil-profile",
    tags=["Soil Profile"]
)

soil_service = SoilProfileService()


@router.post("/create")
async def create_profile(profile_data: Dict):
    """
    Create a new soil profile
    
    Request body:
    {
        "name": "Field A",
        "layers": [
            {
                "name": "Topsoil",
                "texture_class": "sandy loam",
                "theta_res": 0.02,
                "theta_sat": 0.4,
                "alpha": 0.02,
                "n": 1.5,
                "k_sat": 10.0,
                "clay_content": 10,
                "silt_content": 20,
                "sand_content": 70
            }
        ],
        "layer_bottoms": [30, 100],
        "x": 100.0,
        "y": 200.0
    }
    """
    try:
        profile = soil_service.create_profile_from_data(profile_data)
        summary = soil_service.get_profile_summary(profile)
        return {"status": "created", "profile": summary}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/update/{farm_id}")
async def update_profile(farm_id: str, profile_data: Dict):
    """Update existing profile"""
    try:
        # Load from DB
        profile = get_profile_from_db(farm_id)
        # Update with new data
        updated_profile = soil_service.create_profile_from_data(profile_data)
        # Save to DB
        save_profile_to_db(farm_id, updated_profile)
        return {"status": "updated"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/profile/{farm_id}")
async def get_profile(farm_id: str):
    """Get soil profile summary"""
    try:
        profile = get_profile_from_db(farm_id)
        return soil_service.get_profile_summary(profile)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/layers/{farm_id}")
async def get_layers(farm_id: str):
    """Get all layers in profile"""
    try:
        profile = get_profile_from_db(farm_id)
        layers = soil_service.get_all_layers(profile)
        return {"layers": layers}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/layer/{farm_id}/{layer_index}")
async def get_layer(farm_id: str, layer_index: int):
    """Get specific layer details"""
    try:
        profile = get_profile_from_db(farm_id)
        layer_info = soil_service.get_layer_info(profile, layer_index)
        return layer_info
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/visualize/{farm_id}")
async def visualize_profile(farm_id: str):
    """Get profile visualization as PNG image"""
    try:
        profile = get_profile_from_db(farm_id)
        image_bytes = soil_service.generate_visualization(profile)
        return StreamingResponse(
            io.BytesIO(image_bytes),
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=soil_profile.png"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/swap-export/{farm_id}")
async def export_to_swap(farm_id: str):
    """Export profile to SWAP model format"""
    try:
        profile = get_profile_from_db(farm_id)
        tables = soil_service.export_to_swap_tables(profile)
        return tables
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/water-retention/{farm_id}")
async def get_water_retention(
    farm_id: str,
    pressure_head_cm: float = Query(-10.0),
    layer_index: int = Query(None)
):
    """Calculate water retention at specific pressure head"""
    try:
        profile = get_profile_from_db(farm_id)
        results = soil_service.estimate_water_retention(
            profile,
            pressure_head_cm,
            layer_index
        )
        return {"water_retention": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/infiltration/{farm_id}")
async def get_infiltration(farm_id: str, layer_index: int = Query(0)):
    """Get infiltration characteristics"""
    try:
        profile = get_profile_from_db(farm_id)
        infiltration = soil_service.get_infiltration_capacity(profile, layer_index)
        return infiltration
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "service": "soil-profile",
        "features": [
            "profile-management",
            "swap-export",
            "visualization",
            "water-retention",
            "infiltration"
        ]
    }


# Helper functions (implement with your DB)
def get_profile_from_db(farm_id: str):
    """Retrieve profile from database"""
    # TODO: Implement with your database
    pass

def save_profile_to_db(farm_id: str, profile):
    """Save profile to database"""
    # TODO: Implement with your database
    pass
```

---

### Task 4: React Component (Days 5-6)

Create file: `frontend/src/components/SoilProfileViewer.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import './SoilProfileViewer.css';

export default function SoilProfileViewer({ farmId }) {
    const [profile, setProfile] = useState(null);
    const [layers, setLayers] = useState([]);
    const [profileImage, setProfileImage] = useState(null);
    const [selectedLayer, setSelectedLayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfileData();
    }, [farmId]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const [profileRes, layersRes, imageRes] = await Promise.all([
                fetch(`/api/v1/soil-profile/profile/${farmId}`),
                fetch(`/api/v1/soil-profile/layers/${farmId}`),
                fetch(`/api/v1/soil-profile/visualize/${farmId}`)
            ]);

            if (!profileRes.ok || !layersRes.ok) {
                throw new Error('Failed to fetch profile data');
            }

            const profileData = await profileRes.json();
            const layersData = await layersRes.json();
            const imageBlob = await imageRes.blob();

            setProfile(profileData);
            setLayers(layersData.layers);
            setProfileImage(URL.createObjectURL(imageBlob));
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading soil profile...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!profile) return <div>No profile data</div>;

    return (
        <div className="soil-profile-viewer">
            <h1>🌍 {profile.name} - Soil Profile</h1>

            <div className="profile-container">
                {/* Left: Visual Profile */}
                <div className="profile-visualization">
                    {profileImage && (
                        <img src={profileImage} alt="Soil Profile" />
                    )}
                </div>

                {/* Right: Details */}
                <div className="profile-details">
                    <div className="summary-card">
                        <h3>Profile Summary</h3>
                        <ul>
                            <li>Total Depth: <strong>{profile.total_depth_cm} cm</strong></li>
                            <li>Number of Layers: <strong>{profile.num_layers}</strong></li>
                            <li>Avg Clay: <strong>{profile.average_clay_percent}%</strong></li>
                            <li>Avg Organic Matter: <strong>{profile.average_organic_matter}%</strong></li>
                        </ul>
                    </div>

                    <div className="layers-list">
                        <h3>Soil Layers</h3>
                        {layers.map((layer, i) => (
                            <div
                                key={i}
                                className={`layer-item ${selectedLayer === i ? 'active' : ''}`}
                                onClick={() => setSelectedLayer(i)}
                            >
                                <strong>{layer.name}</strong>
                                <p>{layer.depth_top_cm}-{layer.depth_bottom_cm} cm</p>
                                <p className="texture">{layer.texture_class}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Layer Details */}
            {selectedLayer !== null && layers[selectedLayer] && (
                <div className="layer-details">
                    <h3>{layers[selectedLayer].name} - Details</h3>
                    
                    <div className="details-grid">
                        <div className="detail-section">
                            <h4>Position & Size</h4>
                            <ul>
                                <li>Top: {layers[selectedLayer].depth_top_cm} cm</li>
                                <li>Bottom: {layers[selectedLayer].depth_bottom_cm} cm</li>
                                <li>Thickness: {layers[selectedLayer].thickness_cm} cm</li>
                            </ul>
                        </div>

                        <div className="detail-section">
                            <h4>Texture</h4>
                            <ul>
                                <li>Class: {layers[selectedLayer].texture_class}</li>
                                <li>Clay: {layers[selectedLayer].texture.clay_percent}%</li>
                                <li>Silt: {layers[selectedLayer].texture.silt_percent}%</li>
                                <li>Sand: {layers[selectedLayer].texture.sand_percent}%</li>
                                <li>Organic Matter: {layers[selectedLayer].texture.organic_matter_percent}%</li>
                            </ul>
                        </div>

                        <div className="detail-section">
                            <h4>Van Genuchten Parameters</h4>
                            <ul>
                                <li>θr (Residual): {layers[selectedLayer].van_genuchten.theta_res}</li>
                                <li>θs (Saturated): {layers[selectedLayer].van_genuchten.theta_sat}</li>
                                <li>α: {layers[selectedLayer].van_genuchten.alpha}</li>
                                <li>n: {layers[selectedLayer].van_genuchten.n}</li>
                                <li>Ks: {layers[selectedLayer].van_genuchten.k_sat} cm/day</li>
                            </ul>
                        </div>

                        <div className="detail-section">
                            <h4>Physical Properties</h4>
                            <ul>
                                <li>Bulk Density: {layers[selectedLayer].physical.bulk_density} g/cm³</li>
                                <li>Air Entry Pressure: {layers[selectedLayer].physical.air_entry_pressure} cm</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
```

Create file: `frontend/src/components/SoilProfileViewer.css`

```css
.soil-profile-viewer {
    padding: 20px;
    background: #f5f5f5;
}

.soil-profile-viewer h1 {
    color: #2e7d32;
    margin-bottom: 20px;
}

.profile-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
}

.profile-visualization {
    background: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.profile-visualization img {
    width: 100%;
    height: auto;
    border-radius: 4px;
}

.profile-details {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.summary-card {
    background: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-card h3 {
    margin-top: 0;
    color: #1b5e20;
    border-bottom: 2px solid #81c784;
    padding-bottom: 10px;
}

.summary-card ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.summary-card li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

.summary-card li:last-child {
    border-bottom: none;
}

.layers-list {
    background: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.layers-list h3 {
    margin-top: 0;
    color: #1b5e20;
    border-bottom: 2px solid #81c784;
    padding-bottom: 10px;
}

.layer-item {
    padding: 10px;
    margin: 5px 0;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.layer-item:hover {
    border-color: #81c784;
    background: #f5f5f5;
}

.layer-item.active {
    border-color: #2196F3;
    background: #e3f2fd;
}

.layer-item strong {
    display: block;
    color: #1b5e20;
}

.layer-item p {
    margin: 3px 0;
    font-size: 12px;
    color: #666;
}

.layer-item .texture {
    color: #2196F3;
    font-weight: 600;
}

.layer-details {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.layer-details h3 {
    color: #1b5e20;
    border-bottom: 2px solid #81c784;
    padding-bottom: 10px;
    margin-bottom: 15px;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
}

.detail-section {
    background: #f9f9f9;
    border-left: 4px solid #2196F3;
    padding: 12px;
    border-radius: 4px;
}

.detail-section h4 {
    margin-top: 0;
    color: #1976d2;
}

.detail-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.detail-section li {
    padding: 4px 0;
    font-size: 14px;
    color: #555;
}

.loading, .error {
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

### Task 5: Database Integration (Day 7)

Create database schema for soil profiles:

```sql
-- File: backend/migrations/add_soil_profiles.sql

CREATE TABLE soil_layers (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL,
    layer_index INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    texture_class VARCHAR(100),
    depth_top_cm FLOAT NOT NULL,
    depth_bottom_cm FLOAT NOT NULL,
    
    -- Van Genuchten parameters
    theta_res FLOAT,
    theta_sat FLOAT,
    alpha FLOAT,
    n FLOAT,
    k_sat FLOAT,
    lambda_param FLOAT DEFAULT 0.5,
    alphaw FLOAT,
    h_enpr FLOAT,
    ksatexm FLOAT,
    bulk_density FLOAT,
    
    -- Texture
    clay_content FLOAT,
    silt_content FLOAT,
    sand_content FLOAT,
    organic_matter FLOAT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (profile_id) REFERENCES soil_profiles(id)
);

CREATE TABLE soil_profiles (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_x FLOAT,
    location_y FLOAT,
    elevation_m FLOAT,
    total_depth_cm FLOAT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_id) REFERENCES farms(id)
);

CREATE INDEX idx_soil_profiles_farm_id ON soil_profiles(farm_id);
CREATE INDEX idx_soil_layers_profile_id ON soil_layers(profile_id);
```

---

### Task 6: Testing (Day 8)

Create file: `backend/ml-service/tests/test_soil_profile.py`

```python
import pytest
from services.soil_profile_service import SoilProfileService
from libs.simplesoilprofile.models import SoilLayer, SoilProfile


class TestSoilProfileService:
    
    @pytest.fixture
    def service(self):
        return SoilProfileService()
    
    @pytest.fixture
    def sample_profile_data(self):
        return {
            'name': 'Test Field',
            'layers': [
                {
                    'name': 'Topsoil',
                    'texture_class': 'sandy loam',
                    'theta_res': 0.02,
                    'theta_sat': 0.4,
                    'alpha': 0.02,
                    'n': 1.5,
                    'k_sat': 10.0,
                    'clay_content': 10,
                    'silt_content': 20,
                    'sand_content': 70
                },
                {
                    'name': 'Subsoil',
                    'texture_class': 'clay loam',
                    'theta_res': 0.05,
                    'theta_sat': 0.45,
                    'alpha': 0.01,
                    'n': 1.3,
                    'k_sat': 5.0,
                    'clay_content': 30,
                    'silt_content': 35,
                    'sand_content': 35
                }
            ],
            'layer_bottoms': [30, 100],
            'x': 100.0,
            'y': 200.0,
            'elevation': 5.0
        }

    def test_create_profile(self, service, sample_profile_data):
        profile = service.create_profile_from_data(sample_profile_data)
        assert profile.name == 'Test Field'
        assert len(profile.layers) == 2
        assert profile.profile_depth == 100

    def test_get_layer_info(self, service, sample_profile_data):
        profile = service.create_profile_from_data(sample_profile_data)
        layer_info = service.get_layer_info(profile, 0)
        
        assert layer_info['name'] == 'Topsoil'
        assert layer_info['texture_class'] == 'sandy loam'
        assert layer_info['depth_bottom_cm'] == 30

    def test_get_all_layers(self, service, sample_profile_data):
        profile = service.create_profile_from_data(sample_profile_data)
        all_layers = service.get_all_layers(profile)
        
        assert len(all_layers) == 2
        assert all_layers[0]['name'] == 'Topsoil'
        assert all_layers[1]['name'] == 'Subsoil'

    def test_export_swap(self, service, sample_profile_data):
        profile = service.create_profile_from_data(sample_profile_data)
        swap_data = service.export_to_swap_tables(profile)
        
        assert 'soil_hydr_func' in swap_data
        assert 'texture' in swap_data

    def test_water_retention(self, service, sample_profile_data):
        profile = service.create_profile_from_data(sample_profile_data)
        result = service.estimate_water_retention(profile, -10.0, 0)
        
        assert result['water_content_m3_m3'] is not None
        assert 0 <= result['water_content_m3_m3'] <= 1

    def test_infiltration(self, service, sample_profile_data):
        profile = service.create_profile_from_data(sample_profile_data)
        infiltration = service.get_infiltration_capacity(profile, 0)
        
        assert infiltration['saturated_k_cm_per_day'] == 10.0
        assert 'infiltration_class' in infiltration
```

---

## ✅ Phase 1 Completion Checklist

- [ ] Module copied to `libs/simplesoilprofile/`
- [ ] Dependencies installed
- [ ] Python service created (`soil_profile_service.py`)
- [ ] FastAPI endpoints working
- [ ] React component rendering
- [ ] Database schema created
- [ ] Unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] API documentation updated
- [ ] Testing with 5-10 farms
- [ ] Ready for Phase 2

---

## 🚀 Next Steps (Phase 2+)

**Phase 2 (Weeks 3-4):**
- SWAP model integration & simulation
- Advanced water retention calculations
- Drainage predictions

**Phase 3 (Week 5):**
- Database API integration (DOV, others)
- Auto-fetch soil profiles

**Phase 4 (Week 6):**
- Advanced visualizations
- Soil health tracking

---

**Status: Ready to Implement** ✅  
**Estimated Time: 2-3 weeks** ⏱️  
**Team: 1-2 engineers** 👨‍💻
