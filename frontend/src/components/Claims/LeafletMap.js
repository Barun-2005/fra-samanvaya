import { MapContainer, TileLayer, GeoJSON, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

const LeafletMap = ({ geojson }) => {
  // A default position in case geojson is not available
  const position = [12.9716, 77.5946]; 

  return (
    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {geojson && <GeoJSON data={geojson} />}
       <FeatureGroup>
        <EditControl
          position="topright"
          draw={{
            rectangle: false,
            polygon: true,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
};

export default LeafletMap;