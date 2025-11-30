import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

/**
 * ClaimBoundaryMap - Interactive map with polygon drawing
 * Allows users to draw land boundaries on the map
 * Supports touch gestures for mobile devices
 */
export default function ClaimBoundaryMap({ onBoundaryDrawn, initialBoundary = null }) {
    const [map, setMap] = useState(null);
    const [drawnItems, setDrawnItems] = useState(null);
    const [polygon, setPolygon] = useState(initialBoundary);
    const featureGroupRef = useRef(null);

    // Default center (somewhere in India - can be changed)
    const defaultCenter = [20.5937, 78.9629]; // Center of India
    const defaultZoom = 5;

    useEffect(() => {
        // Fix Leaflet icon issue in Next.js
        if (typeof window !== 'undefined') {
            const L = require('leaflet');
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: '/leaflet/marker-icon-2x.png',
                iconUrl: '/leaflet/marker-icon.png',
                shadowUrl: '/leaflet/marker-shadow.png',
            });
        }
    }, []);

    // Handle polygon creation
    const handleCreated = (e) => {
        const { layerType, layer } = e;

        if (layerType === 'polygon') {
            const geoJSON = layer.toGeoJSON();
            const coordinates = geoJSON.geometry.coordinates[0];

            // Calculate approximate area
            const area = calculatePolygonArea(coordinates);

            const boundaryData = {
                type: 'Polygon',
                coordinates: geoJSON.geometry.coordinates,
                area: area.toFixed(2), // in hectares
            };

            setPolygon(boundaryData);

            // Pass to parent component
            if (onBoundaryDrawn) {
                onBoundaryDrawn(boundaryData);
            }

            // Clear previous polygons (only allow one)
            if (featureGroupRef.current) {
                featureGroupRef.current.clearLayers();
                featureGroupRef.current.addLayer(layer);
            }
        }
    };

    // Handle polygon edit
    const handleEdited = (e) => {
        const layers = e.layers;
        layers.eachLayer((layer) => {
            const geoJSON = layer.toGeoJSON();
            const coordinates = geoJSON.geometry.coordinates[0];
            const area = calculatePolygonArea(coordinates);

            const boundaryData = {
                type: 'Polygon',
                coordinates: geoJSON.geometry.coordinates,
                area: area.toFixed(2),
            };

            setPolygon(boundaryData);

            if (onBoundaryDrawn) {
                onBoundaryDrawn(boundaryData);
            }
        });
    };

    // Handle polygon deletion
    const handleDeleted = (e) => {
        setPolygon(null);
        if (onBoundaryDrawn) {
            onBoundaryDrawn(null);
        }
    };

    // Calculate approximate polygon area in hectares
    const calculatePolygonArea = (coordinates) => {
        if (!coordinates || coordinates.length < 3) return 0;

        const lons = coordinates.map(c => c[0]);
        const lats = coordinates.map(c => c[1]);

        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        // Approximate calculation (for rough estimate)
        const width = (maxLon - minLon) * 111 * 1000; // meters
        const height = (maxLat - minLat) * 111 * 1000; // meters
        const areaM2 = width * height * 0.5; // rough polygon approximation
        const areaHa = areaM2 / 10000;

        return Math.max(areaHa, 0.1);
    };

    return (
        <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                    🗺️ Draw Your Land Boundary
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Use the polygon tool (
                    <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 3h18v18H3z" />
                    </svg>
                    ) to draw your land boundary on the map.
                    <span className="block mt-1">
                        ✓ Desktop: Click to add points, double-click to finish
                    </span>
                    <span className="block">
                        ✓ Mobile: Tap to add points, tap first point to finish
                    </span>
                </p>

                {/* Map Container */}
                <div className="rounded-lg overflow-hidden border-2 border-border" style={{ height: '400px' }}>
                    <MapContainer
                        center={defaultCenter}
                        zoom={defaultZoom}
                        style={{ height: '100%', width: '100%' }}
                        whenCreated={setMap}
                        className="z-0"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />

                        <FeatureGroup ref={featureGroupRef}>
                            <EditControl
                                position="topright"
                                onCreated={handleCreated}
                                onEdited={handleEdited}
                                onDeleted={handleDeleted}
                                draw={{
                                    rectangle: false,
                                    circle: false,
                                    circlemarker: false,
                                    marker: false,
                                    polyline: false,
                                    polygon: {
                                        allowIntersection: false,
                                        showArea: true,
                                        shapeOptions: {
                                            color: '#3A5AFF',
                                            fillOpacity: 0.3,
                                        },
                                    },
                                }}
                                edit={{
                                    edit: true,
                                    remove: true,
                                }}
                            />
                        </FeatureGroup>
                    </MapContainer>
                </div>

                {/* Polygon Info */}
                {polygon && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                            ✓ Land boundary drawn successfully!
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Approximate area: <span className="font-semibold">{polygon.area} hectares</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                            You can edit or delete the polygon using the tools on the map.
                        </p>
                    </div>
                )}

                {!polygon && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            ℹ️ Click the polygon tool on the map to start drawing your land boundary.
                        </p>
                    </div>
                )}
            </div>

            {/* Mobile Controls Helper */}
            <div className="md:hidden bg-card rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Mobile Tip:</strong> Use two fingers to zoom and pan the map.
                    Tap the square icon (top-right) to start drawing.
                </p>
            </div>
        </div>
    );
}
