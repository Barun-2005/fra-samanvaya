"""
FRA-Intel ML Microservice
Asset mapping service for remote sensing analysis
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling
from scipy import ndimage
from sklearn.cluster import KMeans
from shapely.geometry import Polygon, MultiPolygon
import geopandas as gpd
import json
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FRA-Intel Asset Mapping Service",
    description="Remote sensing analysis for forest, water, and farmland detection",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AssetMapRequest(BaseModel):
    bbox: List[float]  # [minx, miny, maxx, maxy]
    dateRange: List[str]  # ["YYYY-MM-DD", "YYYY-MM-DD"]

class AssetMapResponse(BaseModel):
    forest: Dict[str, Any]
    water: Dict[str, Any]
    farmland: Dict[str, Any]
    metadata: Dict[str, Any]

# Configuration
DATA_DIR = "data"
FALLBACK_DATA_DIR = "../client/public/data"

def load_seeded_geojson(layer_type: str) -> Dict[str, Any]:
    """Load pre-seeded GeoJSON data as fallback"""
    fallback_files = {
        "forest": "forest-layer.geojson",
        "water": "water-layer.geojson", 
        "farmland": "farmland-layer.geojson"
    }
    
    file_path = os.path.join(FALLBACK_DATA_DIR, fallback_files.get(layer_type, ""))
    
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            return json.load(f)
    
    # Return empty GeoJSON if no fallback data
    return {
        "type": "FeatureCollection",
        "features": []
    }

def compute_ndvi(red_band: np.ndarray, nir_band: np.ndarray) -> np.ndarray:
    """Compute Normalized Difference Vegetation Index"""
    # Avoid division by zero
    denominator = nir_band + red_band
    denominator[denominator == 0] = 0.001
    
    ndvi = (nir_band - red_band) / denominator
    return np.clip(ndvi, -1, 1)

def compute_ndwi(green_band: np.ndarray, nir_band: np.ndarray) -> np.ndarray:
    """Compute Normalized Difference Water Index"""
    # Avoid division by zero
    denominator = green_band + nir_band
    denominator[denominator == 0] = 0.001
    
    ndwi = (green_band - nir_band) / denominator
    return np.clip(ndwi, -1, 1)

def detect_water_bodies(ndwi: np.ndarray, threshold: float = 0.3) -> np.ndarray:
    """Detect water bodies using NDWI thresholding"""
    water_mask = ndwi > threshold
    
    # Apply morphological operations to clean up the mask
    water_mask = ndimage.binary_opening(water_mask, structure=np.ones((3, 3)))
    water_mask = ndimage.binary_closing(water_mask, structure=np.ones((5, 5)))
    
    return water_mask.astype(np.uint8)

def detect_vegetation(ndvi: np.ndarray, threshold: float = 0.3) -> np.ndarray:
    """Detect vegetation using NDVI thresholding"""
    vegetation_mask = ndvi > threshold
    
    # Apply morphological operations
    vegetation_mask = ndimage.binary_opening(vegetation_mask, structure=np.ones((3, 3)))
    vegetation_mask = ndimage.binary_closing(vegetation_mask, structure=np.ones((5, 5)))
    
    return vegetation_mask.astype(np.uint8)

def detect_farmland(ndvi: np.ndarray, ndwi: np.ndarray, 
                   ndvi_min: float = 0.2, ndvi_max: float = 0.6,
                   ndwi_max: float = 0.1) -> np.ndarray:
    """
    Detect farmland using combined NDVI and NDWI analysis
    Farmland typically has moderate NDVI (not too high like dense forest)
    and low NDWI (not water)
    """
    # Moderate vegetation (not dense forest)
    moderate_vegetation = (ndvi >= ndvi_min) & (ndvi <= ndvi_max)
    
    # Not water
    not_water = ndwi <= ndwi_max
    
    farmland_mask = moderate_vegetation & not_water
    
    # Apply morphological operations
    farmland_mask = ndimage.binary_opening(farmland_mask, structure=np.ones((3, 3)))
    farmland_mask = ndimage.binary_closing(farmland_mask, structure=np.ones((5, 5)))
    
    return farmland_mask.astype(np.uint8)

def mask_to_polygons(mask: np.ndarray, transform: rasterio.transform.Affine, 
                    confidence: float = 0.7) -> List[Dict[str, Any]]:
    """Convert binary mask to GeoJSON polygons"""
    from rasterio.features import shapes
    
    # Find contours and convert to polygons
    polygons = []
    
    for geom, value in shapes(mask, transform=transform):
        if value == 1:  # Only process foreground pixels
            # Calculate area to filter out very small polygons
            poly = Polygon(geom['coordinates'][0])
            area = poly.area
            
            # Filter by minimum area (in square meters)
            min_area = 1000  # 1000 sq meters
            if area > min_area:
                polygons.append({
                    "type": "Feature",
                    "geometry": geom,
                    "properties": {
                        "type": "detected",
                        "confidence": confidence,
                        "area_sq_m": area
                    }
                })
    
    return polygons

def process_sentinel_data(bbox: List[float], date_range: List[str]) -> Dict[str, Any]:
    """
    Process Sentinel-2 data for asset mapping
    TODO: Replace with actual Sentinel-2 download and processing
    For now, return seeded data with some processing simulation
    """
    logger.info(f"Processing Sentinel-2 data for bbox: {bbox}, dates: {date_range}")
    
    # Simulate processing by loading seeded data
    # In production, this would:
    # 1. Download Sentinel-2 tiles for the bbox and date range
    # 2. Compute NDVI, NDWI indices
    # 3. Apply ML models for classification
    
    # For now, return seeded data with some modifications
    forest_data = load_seeded_geojson("forest")
    water_data = load_seeded_geojson("water")
    farmland_data = load_seeded_geojson("farmland")
    
    # Add some processing metadata
    metadata = {
        "processing_timestamp": datetime.now().isoformat(),
        "bbox": bbox,
        "date_range": date_range,
        "method": "seeded_data_fallback",
        "note": "Using pre-seeded GeoJSON data. In production, this would use real Sentinel-2 processing."
    }
    
    return {
        "forest": forest_data,
        "water": water_data,
        "farmland": farmland_data,
        "metadata": metadata
    }

def process_with_simulated_imagery(bbox: List[float]) -> Dict[str, Any]:
    """
    Process simulated imagery for demonstration
    This creates synthetic NDVI/NDWI data and applies the detection algorithms
    """
    logger.info(f"Processing simulated imagery for bbox: {bbox}")
    
    # Create a synthetic raster for demonstration
    # In production, this would be replaced with actual satellite data
    width, height = 1000, 1000
    
    # Simulate different land cover types
    # Create a grid with different regions
    x = np.linspace(0, 10, width)
    y = np.linspace(0, 10, height)
    X, Y = np.meshgrid(x, y)
    
    # Simulate NDVI (vegetation index)
    # Forest areas: high NDVI (0.6-0.8)
    # Farmland: moderate NDVI (0.3-0.5)
    # Water/urban: low NDVI (0.0-0.2)
    ndvi = np.zeros_like(X)
    
    # Forest region (top-left)
    forest_mask = (X < 3) & (Y < 3)
    ndvi[forest_mask] = 0.7 + 0.1 * np.random.random(np.sum(forest_mask))
    
    # Farmland region (center)
    farmland_mask = (X >= 3) & (X < 7) & (Y >= 2) & (Y < 6)
    ndvi[farmland_mask] = 0.4 + 0.1 * np.random.random(np.sum(farmland_mask))
    
    # Water region (bottom-right)
    water_mask = (X >= 7) & (Y >= 7)
    ndvi[water_mask] = 0.1 + 0.1 * np.random.random(np.sum(water_mask))
    
    # Simulate NDWI (water index)
    ndwi = np.zeros_like(X)
    ndwi[water_mask] = 0.6 + 0.2 * np.random.random(np.sum(water_mask))
    ndwi[forest_mask] = -0.2 + 0.1 * np.random.random(np.sum(forest_mask))
    ndwi[farmland_mask] = 0.0 + 0.1 * np.random.random(np.sum(farmland_mask))
    
    # Create a simple transform for the synthetic data
    minx, miny, maxx, maxy = bbox
    transform = rasterio.transform.from_bounds(minx, miny, maxx, maxy, width, height)
    
    # Apply detection algorithms
    water_mask = detect_water_bodies(ndwi)
    vegetation_mask = detect_vegetation(ndvi)
    farmland_mask = detect_farmland(ndvi, ndwi)
    
    # Convert masks to polygons
    water_polygons = mask_to_polygons(water_mask, transform, confidence=0.8)
    forest_polygons = mask_to_polygons(vegetation_mask, transform, confidence=0.7)
    farmland_polygons = mask_to_polygons(farmland_mask, transform, confidence=0.6)
    
    # Create GeoJSON responses
    forest_geojson = {
        "type": "FeatureCollection",
        "features": forest_polygons
    }
    
    water_geojson = {
        "type": "FeatureCollection", 
        "features": water_polygons
    }
    
    farmland_geojson = {
        "type": "FeatureCollection",
        "features": farmland_polygons
    }
    
    metadata = {
        "processing_timestamp": datetime.now().isoformat(),
        "bbox": bbox,
        "method": "simulated_imagery_processing",
        "algorithm": "NDVI/NDWI thresholding with morphological operations",
        "note": "This is simulated data for demonstration. In production, use real Sentinel-2 data."
    }
    
    return {
        "forest": forest_geojson,
        "water": water_geojson,
        "farmland": farmland_geojson,
        "metadata": metadata
    }

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "FRA-Intel Asset Mapping Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "rasterio": "available",
            "numpy": "available",
            "scikit-learn": "available",
            "shapely": "available"
        }
    }

@app.post("/asset-map", response_model=AssetMapResponse)
async def generate_asset_map(request: AssetMapRequest):
    """
    Generate asset map for the given bounding box and date range
    Returns GeoJSON layers for forest, water, and farmland
    """
    try:
        bbox = request.bbox
        date_range = request.dateRange
        
        # Validate bbox
        if len(bbox) != 4:
            raise HTTPException(status_code=400, detail="Bbox must contain exactly 4 values [minx, miny, maxx, maxy]")
        
        minx, miny, maxx, maxy = bbox
        if minx >= maxx or miny >= maxy:
            raise HTTPException(status_code=400, detail="Invalid bbox: min coordinates must be less than max coordinates")
        
        # Check if we have real satellite data available
        # For now, use simulated processing
        # TODO: Implement actual Sentinel-2 data download and processing
        
        logger.info(f"Processing asset map for bbox: {bbox}")
        
        # Try simulated processing first
        try:
            result = process_with_simulated_imagery(bbox)
        except Exception as e:
            logger.warning(f"Simulated processing failed: {e}, falling back to seeded data")
            result = process_sentinel_data(bbox, date_range)
        
        return AssetMapResponse(**result)
        
    except Exception as e:
        logger.error(f"Asset mapping error: {e}")
        raise HTTPException(status_code=500, detail=f"Asset mapping failed: {str(e)}")

@app.get("/asset-map/fallback")
async def get_fallback_data():
    """Get fallback seeded data for all asset types"""
    try:
        forest_data = load_seeded_geojson("forest")
        water_data = load_seeded_geojson("water")
        farmland_data = load_seeded_geojson("farmland")
        
        return {
            "forest": forest_data,
            "water": water_data,
            "farmland": farmland_data,
            "metadata": {
                "source": "seeded_data",
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        logger.error(f"Fallback data error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load fallback data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
