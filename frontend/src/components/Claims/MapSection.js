import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// Dynamically import the LeafletMap component
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false, // This ensures the component is only rendered on the client side
});

const MapLayersToggle = ({ onToggle, layers }) => {
    // Dummy component for now
    return (
        <div className="absolute top-2 right-2 bg-white dark:bg-card-dark p-2 rounded shadow-lg z-[1000]">
            <h4 className="font-bold mb-2">Layers</h4>
            {/* Dummy layer toggles */}
            <div className="flex items-center gap-2">
                <input type="checkbox" id="assets" defaultChecked />
                <label htmlFor="assets">Assets</label>
            </div>
             <div className="flex items-center gap-2">
                <input type="checkbox" id="claim" defaultChecked />
                <label htmlFor="claim">Claim Area</label>
            </div>
        </div>
    )
}

const MapSection = ({ claim }) => {
    // useMemo helps to avoid re-rendering of the map unnecessarily
    const mapComponent = useMemo(() => (
        <LeafletMap geojson={claim.geojson} />
    ), [claim.geojson]);

    return (
        <div className="relative">
            <MapLayersToggle />
            {mapComponent}
        </div>
    )
}

export default MapSection;