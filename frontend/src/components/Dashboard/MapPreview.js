import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PropTypes from 'prop-types';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


export default function MapPreview({ claims }) {
    const position = [20.5937, 78.9629]; // Default center for India
    
    return (
        <div className="bg-card p-6 rounded-2xl shadow-soft">
            <h3 className="text-xl font-bold text-card-foreground mb-4">Latest Claims Preview</h3>
             <div className="h-96 bg-muted rounded-lg z-0">
                <MapContainer center={position} zoom={5} style={{ height: '100%', width: '100%' }} className="rounded-lg">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {claims && claims.map(claim => (
                        claim.geojson && (
                            <Marker 
                                key={claim._id} 
                                position={[claim.geojson.coordinates[1], claim.geojson.coordinates[0]]}
                            >
                                <Popup>
                                    <b>{claim.claimantName || 'N/A'}</b><br/>
                                    {claim.area} acres
                                </Popup>
                            </Marker>
                        )
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}

MapPreview.propTypes = {
  claims: PropTypes.array,
};
