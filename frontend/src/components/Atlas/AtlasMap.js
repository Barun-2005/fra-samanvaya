import { useState, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

// Fix Leaflet icon issue
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function AtlasMap({ onAnalysisComplete }) {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const mapRef = useRef();

    const handleCreated = async (e) => {
        const layer = e.layer;
        const geojson = layer.toGeoJSON();

        setLoading(true);
        const toastId = toast.loading('Analyzing region with AI...');

        try {
            const response = await api.post('/atlas/analyze-region', { geojson });
            setAnalysis(response.data);
            if (onAnalysisComplete) {
                onAnalysisComplete(response.data);
            }
            toast.success('Analysis complete!', { id: toastId });
        } catch (error) {
            console.error('Analysis failed:', error);
            toast.error('Failed to analyze region', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="h-[500px] rounded-xl overflow-hidden border border-border">
                <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }} ref={mapRef}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <FeatureGroup>
                        <EditControl
                            position="topright"
                            onCreated={handleCreated}
                            draw={{
                                rectangle: true,
                                polygon: true,
                                circle: false,
                                circlemarker: false,
                                marker: false,
                                polyline: false,
                            }}
                        />
                    </FeatureGroup>
                </MapContainer>
            </div>

            {loading && (
                <div className="p-8 text-center bg-muted/30 rounded-xl animate-pulse">
                    <div className="text-lg font-medium text-foreground">Analyzing Satellite Imagery...</div>
                    <p className="text-sm text-muted-foreground mt-2">Processing land cover classification and aggregating claim statistics.</p>
                </div>
            )}

            {analysis && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-foreground">Regional Analysis Report</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${analysis.transparencyScore > 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            Transparency Score: {analysis.transparencyScore}/100
                        </span>
                    </div>

                    <p className="text-muted-foreground">{analysis.analysis}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-foreground">Land Cover Estimates</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Forest Cover</span>
                                    <span className="font-medium">{analysis.landCover.forestPercentage}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${analysis.landCover.forestPercentage}%` }} />
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span>Farmland</span>
                                    <span className="font-medium">{analysis.landCover.farmlandPercentage}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${analysis.landCover.farmlandPercentage}%` }} />
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span>Water Bodies</span>
                                    <span className="font-medium">{analysis.landCover.waterPercentage}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${analysis.landCover.waterPercentage}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-foreground">Recommended Schemes</h3>
                            <div className="space-y-3">
                                {analysis.schemes.map((scheme, i) => (
                                    <div key={i} className="p-3 bg-muted/50 rounded-lg border border-border">
                                        <div className="font-medium text-primary">{scheme.name}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{scheme.reason}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
