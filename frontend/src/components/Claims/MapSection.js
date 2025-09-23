const MapPlaceholder = ({ geojson }) => {
    return (
        <div className="relative h-96 w-full rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <p className="text-gray-500">TODO: Implement react-leaflet map here.</p>
            {geojson && <pre className="absolute bottom-2 left-2 text-xs bg-black/50 text-white p-2 rounded">{JSON.stringify(geojson, null, 2)}</pre>}
        </div>
    );
};


const MapLayersToggle = ({ onToggle, layers }) => {
    // Dummy component for now
    return (
        <div className="absolute top-2 right-2 bg-white dark:bg-card-dark p-2 rounded shadow-lg z-10">
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
    return (
        <div className="relative">
            <MapLayersToggle />
            <MapPlaceholder geojson={claim.geojson} />
        </div>
    )
}

export default MapSection;