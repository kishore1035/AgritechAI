# 🛠️ FarmVibes.AI Integration - Implementation Guide & Quick Start

**Document Type:** Technical Implementation Guide  
**Status:** Ready for Development  
**Estimated Effort:** 16 weeks, 2-3 engineers  

---

## 📋 Phase 1: Foundation - Satellite Imagery (Weeks 1-3)

### Goal
Get live Sentinel-2 satellite imagery displaying on AgriTech AI dashboard with basic NDVI visualization.

### Task 1.1: Set Up FarmVibes.AI Local Cluster

**Step 1: Prerequisites**
```bash
# System requirements
- Docker & Docker Compose
- Python 3.9+
- 8GB+ RAM (16GB recommended)
- 100GB disk (for caching satellite data)
- Linux/Mac or WSL2 on Windows
```

**Step 2: Clone & Install**
```bash
cd /opt  # or suitable directory
git clone https://github.com/microsoft/farmvibes-ai.git
cd farmvibes-ai

# Create conda environment
conda env create -f notebooks/env.yaml
conda activate farmvibes

# Install FarmVibes client
pip install -e ./src/
```

**Step 3: Docker Compose Setup**
```yaml
# docker-compose.override.yml (for agritech integration)
version: '3.8'

services:
  farmvibes-cluster:
    image: mcr.microsoft.com/farmvibes-ai/cluster:latest
    ports:
      - "8080:8080"  # FarmVibes API
      - "5432:5432"  # PostgreSQL
    volumes:
      - farmvibes_data:/root/farmvibes_data
      - ./workflows:/root/workflows
    environment:
      - FARMVIBES_DATA_PATH=/root/farmvibes_data
      - CACHE_SIZE=50GB
      - MAX_WORKERS=4

  redis-cache:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  farmvibes_data:
  redis_data:
```

**Step 4: Verify Installation**
```bash
# Test FarmVibes local cluster
python -c "
from farmvibes.client import FarmvibesClient

client = FarmvibesClient()
print(f'Connected: {client.connected}')
print(f'Available workflows: {len(client.list_workflows())}')
"
```

---

### Task 1.2: Create Sentinel-2 Download Workflow

**Step 1: Create Workflow Definition**
```python
# workflows/sentinel2_download.py
from farmvibes.client import FarmvibesClient
from farmvibes.core import Workflow
from geometry import Geometry
from datetime import datetime, timedelta

def create_sentinel2_workflow(farm_boundary: Geometry, date_start: str, date_end: str):
    """
    Download and process Sentinel-2 imagery
    """
    
    # Initialize workflow
    wf = Workflow(name="Sentinel2_Download_NDVI")
    
    # 1. Download Sentinel-2 L2A (bottom-of-atmosphere)
    download = wf.run_operation(
        op_type="download_sentinel2_from_pc",
        parameters={
            "geometry": farm_boundary,
            "start_date": date_start,
            "end_date": date_end,
            "max_cloud_percentage": 30,  # Skip cloudy images
            "bands": ["B2", "B3", "B4", "B5", "B8"]  # RGB + Red Edge + NIR
        }
    )
    
    # 2. Compute NDVI index (Normalized Difference Vegetation Index)
    ndvi = wf.run_operation(
        op_type="compute_index",
        parameters={
            "name": "NDVI",  # (NIR - Red) / (NIR + Red)
            "input_raster": download.output,
            "band_mapping": {"NIR": "B8", "Red": "B4"}
        }
    )
    
    # 3. Compute NDWI index (water content)
    ndwi = wf.run_operation(
        op_type="compute_index",
        parameters={
            "name": "NDWI",  # (NIR - SWIR) / (NIR + SWIR)
            "input_raster": download.output,
            "band_mapping": {"NIR": "B8", "SWIR": "B11"}
        }
    )
    
    # 4. Stack all indices together
    stack = wf.run_operation(
        op_type="merge_rasters",
        parameters={
            "rasters": [download.output, ndvi.output, ndwi.output],
            "output_name": "sentinel2_stack"
        }
    )
    
    return wf

# Example usage
if __name__ == "__main__":
    from shapely.geometry import Polygon
    
    # Farm boundary (example)
    farm_coords = [
        [13.0, 77.0],
        [13.1, 77.0],
        [13.1, 77.1],
        [13.0, 77.1],
        [13.0, 77.0]
    ]
    boundary = Geometry(Polygon(farm_coords))
    
    # Date range (this season)
    today = datetime.now()
    season_start = (today - timedelta(days=90)).strftime("%Y-%m-%d")
    season_end = today.strftime("%Y-%m-%d")
    
    workflow = create_sentinel2_workflow(boundary, season_start, season_end)
    workflow.save("sentinel2_download.yaml")
```

**Step 2: Run Workflow**
```python
from farmvibes.client import FarmvibesClient
import yaml

client = FarmvibesClient()

# Load workflow
with open("sentinel2_download.yaml") as f:
    workflow_def = yaml.safe_load(f)

# Execute workflow
job = client.run_workflow(
    workflow_name="Sentinel2_Download_NDVI",
    input_geometry=farm_boundary,
    start_date="2026-01-01",
    end_date="2026-04-06"
)

print(f"Job ID: {job.id}")
print(f"Status: {job.status}")

# Monitor progress
while job.status == "RUNNING":
    time.sleep(30)
    job.refresh()
    print(f"Progress: {job.progress}%")

# Get results
if job.status == "COMPLETED":
    results = job.get_outputs()
    print(f"Output files: {results}")
```

---

### Task 1.3: Backend Integration - Node.js Wrapper

**Step 1: Create FarmVibes Service**
```javascript
// backend/services/farmvibes-service.js

const axios = require('axios');
const logger = require('../utils/logger');

const FARMVIBES_URL = process.env.FARMVIBES_URL || 'http://localhost:8080';

class FarmVibesService {
  /**
   * Download Sentinel-2 imagery for farm
   */
  async downloadSentinelImagery(farmId, dateRange) {
    try {
      const farm = await Farm.findById(farmId);
      if (!farm) throw new Error('Farm not found');

      // Build request
      const payload = {
        workflow: 'Sentinel2_Download_NDVI',
        parameters: {
          geometry: {
            type: 'Polygon',
            coordinates: [farm.boundary.coordinates]
          },
          start_date: dateRange.start,
          end_date: dateRange.end,
          max_cloud_percentage: 30
        }
      };

      // Submit to FarmVibes cluster
      const response = await axios.post(
        `${FARMVIBES_URL}/jobs`,
        payload,
        { timeout: 5000 }
      );

      const jobId = response.data.id;

      // Store job reference in DB
      await WorkflowJob.create({
        farmId,
        type: 'SENTINEL2_DOWNLOAD',
        farmvibesJobId: jobId,
        status: 'PENDING',
        startedAt: new Date()
      });

      logger.info(`FarmVibes job ${jobId} started for farm ${farmId}`);

      return { jobId, status: 'PENDING' };

    } catch (error) {
      logger.error('FarmVibes download failed', error);
      throw error;
    }
  }

  /**
   * Check job status
   */
  async getJobStatus(farmvibesJobId) {
    try {
      const response = await axios.get(
        `${FARMVIBES_URL}/jobs/${farmvibesJobId}`,
        { timeout: 5000 }
      );

      return {
        id: response.data.id,
        status: response.data.status,
        progress: response.data.progress,
        outputs: response.data.outputs || []
      };

    } catch (error) {
      logger.error('Failed to get job status', error);
      throw error;
    }
  }

  /**
   * Get NDVI data for farm
   */
  async getNDVITrend(farmId, daysBack = 90) {
    try {
      // Check cache first
      const cached = await redis.get(`ndvi:${farmId}`);
      if (cached) return JSON.parse(cached);

      // Get latest completed jobs
      const jobs = await WorkflowJob.find({
        farmId,
        type: 'SENTINEL2_DOWNLOAD',
        status: 'COMPLETED'
      })
      .sort({ completedAt: -1 })
      .limit(10);

      // Extract NDVI values
      const ndviData = [];
      for (const job of jobs) {
        if (job.outputs && job.outputs.ndvi_raster) {
          ndviData.push({
            date: job.completedAt,
            ndvi_file: job.outputs.ndvi_raster,
            cloudCover: job.metadata?.cloudCover || 0,
            mean_ndvi: await this._computeRasterMean(job.outputs.ndvi_raster)
          });
        }
      }

      // Cache for 1 hour
      await redis.setex(`ndvi:${farmId}`, 3600, JSON.stringify(ndviData));

      return ndviData;

    } catch (error) {
      logger.error('Failed to get NDVI trend', error);
      throw error;
    }
  }

  /**
   * Compute mean value of raster
   */
  async _computeRasterMean(rasterPath) {
    // Read GeoTIFF, compute mean value
    // Implementation using gdal/rasterio
    return 0.65; // placeholder
  }

  /**
   * Get satellite imagery for visualization
   */
  async getSatelliteImage(farmId, date) {
    try {
      // Find matching job
      const job = await WorkflowJob.findOne({
        farmId,
        type: 'SENTINEL2_DOWNLOAD',
        status: 'COMPLETED',
        createdAt: { $gte: new Date(date) }
      });

      if (!job) return null;

      return {
        date: job.completedAt,
        rgb_url: job.outputs.rgb_geotiff,  // Cloud-hosted URL
        ndvi_url: job.outputs.ndvi_raster,
        ndwi_url: job.outputs.ndwi_raster,
        cloudCover: job.metadata?.cloudCover
      };

    } catch (error) {
      logger.error('Failed to get satellite image', error);
      throw error;
    }
  }
}

module.exports = new FarmVibesService();
```

**Step 2: API Endpoints**
```javascript
// backend/routes/satellite.js

const express = require('express');
const router = express.Router();
const farmvibesService = require('../services/farmvibes-service');
const auth = require('../middleware/auth');

// Get Sentinel-2 NDVI trend
router.get('/ndvi-trend/:farmId', auth, async (req, res, next) => {
  try {
    const { farmId } = req.params;
    const { daysBack = 90 } = req.query;

    // Verify farm ownership
    const farm = await Farm.findById(farmId);
    if (!farm || farm.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const ndviData = await farmvibesService.getNDVITrend(farmId, daysBack);

    res.json({
      success: true,
      farmId,
      ndviTrend: ndviData,
      interpretations: interpretNDVI(ndviData)
    });

  } catch (error) {
    next(error);
  }
});

// Get latest satellite image
router.get('/latest-image/:farmId', auth, async (req, res, next) => {
  try {
    const { farmId } = req.params;

    const image = await farmvibesService.getSatelliteImage(farmId, new Date());

    if (!image) {
      return res.status(404).json({ error: 'No satellite image available' });
    }

    res.json({
      success: true,
      image: image,
      interpretation: interpretImage(image)
    });

  } catch (error) {
    next(error);
  }
});

// Request satellite image download
router.post('/request-imagery/:farmId', auth, async (req, res, next) => {
  try {
    const { farmId } = req.params;
    const { startDate, endDate } = req.body;

    const result = await farmvibesService.downloadSentinelImagery(
      farmId,
      { start: startDate, end: endDate }
    );

    res.json({
      success: true,
      jobId: result.jobId,
      status: result.status,
      message: 'Satellite imagery download started'
    });

  } catch (error) {
    next(error);
  }
});

// Interpretation helper
function interpretNDVI(ndviData) {
  if (!ndviData.length) return null;

  const latest = ndviData[0];
  const mean = ndviData.reduce((sum, d) => sum + (d.mean_ndvi || 0), 0) / ndviData.length;
  const trend = latest.mean_ndvi > mean ? 'IMPROVING' : 'DECLINING';

  return {
    current: latest.mean_ndvi,
    average: mean.toFixed(3),
    trend,
    health: latest.mean_ndvi > 0.6 ? 'EXCELLENT' : latest.mean_ndvi > 0.4 ? 'GOOD' : 'POOR',
    recommendation: trend === 'IMPROVING' 
      ? 'Continue current management practices' 
      : 'Investigate declining health - check irrigation, pests'
  };
}

function interpretImage(image) {
  return {
    cloudCover: image.cloudCover,
    usable: image.cloudCover < 30,
    interpretation: image.cloudCover < 30 
      ? 'Clear satellite image, data reliable'
      : 'High cloud cover, data quality compromised'
  };
}

module.exports = router;
```

---

### Task 1.4: Frontend Component

**Step 1: Create Satellite Viewer Component**
```jsx
// frontend/src/components/SatelliteViewer.jsx

import React, { useState, useEffect } from 'react';
import { satelliteApi } from '../api/satellite-api';
import MapComponent from './Map';
import Chart from 'chart.js/auto';

export default function SatelliteViewer({ farmId }) {
  const [ndviTrend, setNdviTrend] = useState([]);
  const [latestImage, setLatestImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadNDVITrend();
    loadLatestImage();
  }, [farmId]);

  const loadNDVITrend = async () => {
    try {
      setLoading(true);
      const data = await satelliteApi.getNDVITrend(farmId, 90);
      setNdviTrend(data.ndviTrend);
    } catch (error) {
      console.error('Failed to load NDVI trend', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLatestImage = async () => {
    try {
      const data = await satelliteApi.getLatestImage(farmId);
      setLatestImage(data.image);
    } catch (error) {
      console.error('Failed to load satellite image', error);
    }
  };

  const requestImagery = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      await satelliteApi.requestImagery(farmId, {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      alert('Imagery request submitted. Checking status...');
      setTimeout(loadNDVITrend, 5000);
    } catch (error) {
      alert('Failed to request imagery: ' + error.message);
    }
  };

  return (
    <div className="satellite-viewer">
      <div className="header">
        <h2>📡 Satellite Monitoring</h2>
        <button onClick={requestImagery} className="btn btn-primary">
          Update Imagery
        </button>
      </div>

      {/* Map with satellite overlay */}
      {latestImage && (
        <div className="map-section">
          <h3>Latest Satellite Image (NDVI)</h3>
          <MapComponent 
            satelliteImage={latestImage.ndvi_url}
            cloudCover={latestImage.cloudCover}
          />
          {latestImage.cloudCover > 30 && (
            <div className="warning">
              ⚠️ Cloud cover: {latestImage.cloudCover}% (data quality may be reduced)
            </div>
          )}
        </div>
      )}

      {/* NDVI Trend Chart */}
      {ndviTrend.length > 0 && (
        <div className="chart-section">
          <h3>📊 NDVI Trend (90 days)</h3>
          <NDVIChart data={ndviTrend} />
        </div>
      )}

      {loading && <div className="spinner">Loading...</div>}

      {!loading && ndviTrend.length === 0 && (
        <div className="empty-state">
          No satellite data available. Click "Update Imagery" to request data.
        </div>
      )}
    </div>
  );
}

// NDVI Chart Component
function NDVIChart({ data }) {
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [{
          label: 'NDVI',
          data: data.map(d => d.mean_ndvi),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#15803d'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: 'Vegetation Index Trend' }
        },
        scales: {
          y: {
            min: 0,
            max: 1,
            title: { display: true, text: 'NDVI (0-1)' }
          }
        }
      }
    });

    return () => chartInstance.current?.destroy();
  }, [data]);

  return <canvas ref={chartRef} />;
}
```

**Step 2: API Service**
```javascript
// frontend/src/api/satellite-api.js

import api from './api';

export const satelliteApi = {
  async getNDVITrend(farmId, daysBack = 90) {
    return api.get(`/satellite/ndvi-trend/${farmId}`, {
      params: { daysBack }
    });
  },

  async getLatestImage(farmId) {
    return api.get(`/satellite/latest-image/${farmId}`);
  },

  async requestImagery(farmId, dateRange) {
    return api.post(`/satellite/request-imagery/${farmId}`, {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });
  }
};
```

---

## ✅ Phase 1 Checklist

- [ ] FarmVibes.AI local cluster running
- [ ] Sentinel-2 download workflow created & tested
- [ ] NDVI computation working
- [ ] Backend FarmVibes service implemented
- [ ] API endpoints working (/satellite/*)
- [ ] Frontend SatelliteViewer component built
- [ ] Dashboard displaying NDVI imagery
- [ ] Tested with 5 farms
- [ ] Documentation complete

---

## 📊 Phase 1 Expected Outcomes

✅ Live satellite imagery on dashboard  
✅ NDVI trend visualization (90-day history)  
✅ Cloud cover detection  
✅ Automated weekly downloads  
✅ < 2 minute API response times  

---

## 🚀 Moving to Phase 2

After Phase 1 success, move to:
- Irrigation probability model
- Evaporative fraction calculation
- Real-time irrigation alerts
- Mobile app integration

---

**Phase 1 Implementation Guide Complete** ✅  
**Ready for development team** 🔧
