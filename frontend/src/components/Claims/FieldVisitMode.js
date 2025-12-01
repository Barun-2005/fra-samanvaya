import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

export default function FieldVisitMode({ claim, onClose, onUpdate }) {
    const [location, setLocation] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCaptureGPS = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        toast.loading('Acquiring GPS signal...', { id: 'gps' });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                toast.success('GPS Location Captured!', { id: 'gps' });
            },
            (error) => {
                toast.error('Failed to get location: ' + error.message, { id: 'gps' });
            }
        );
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            toast.success('Photo selected');
        }
    };

    const handleSubmit = async () => {
        if (!location || !notes) {
            toast.error('Please capture GPS and add notes');
            return;
        }

        setLoading(true);
        try {
            // In a real app, we would upload the photo to a storage bucket
            // and save the URL. For now, we'll just save the metadata.

            const visitData = {
                type: 'Field Visit',
                location,
                notes,
                timestamp: new Date().toISOString()
            };

            // We'll append this to the claim's history or notes
            // Using the existing 'verify' endpoint or a generic update might be best
            // For now, let's assume we update the verification notes

            await api.put(`/claims/${claim._id}`, {
                verificationNotes: `${claim.verificationNotes || ''}\n\n[FIELD VISIT REPORT]\nGPS: ${location.lat}, ${location.lng}\nNotes: ${notes}`
            });

            toast.success('Field Visit Report Submitted');
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-card w-full max-w-md rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-border flex justify-between items-center bg-primary text-primary-foreground">
                    <h2 className="font-bold text-lg">Field Visit Mode 📱</h2>
                    <button onClick={onClose} className="text-sm bg-white/20 px-2 py-1 rounded hover:bg-white/30">
                        Close
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">1. Capture Location</label>
                        <div className="p-4 bg-muted rounded-lg border border-border text-center">
                            {location ? (
                                <div className="text-green-600">
                                    <div className="text-2xl mb-1">📍</div>
                                    <div className="font-mono text-sm">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</div>
                                    <div className="text-xs text-muted-foreground">Accuracy: {location.accuracy}m</div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleCaptureGPS}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    📍 Capture GPS Coordinates
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">2. Site Photo</label>
                        <div className="p-4 bg-muted rounded-lg border border-border text-center">
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                id="site-photo"
                            />
                            <label
                                htmlFor="site-photo"
                                className="block w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium cursor-pointer hover:bg-gray-50"
                            >
                                📷 {photo ? 'Retake Photo' : 'Take Photo'}
                            </label>
                            {photo && <div className="mt-2 text-sm text-green-600">Selected: {photo.name}</div>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">3. Observations</label>
                        <textarea
                            className="w-full p-3 rounded-lg border border-input bg-background text-foreground min-h-[100px]"
                            placeholder="Describe the land boundaries, crops, and any disputes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-border bg-muted/50">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg"
                    >
                        {loading ? 'Submitting...' : '✅ Submit Report'}
                    </button>
                </div>
            </div>
        </div>
    );
}
